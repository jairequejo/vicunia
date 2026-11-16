/**
 * Vicuinia - Sistema de Gestión de Inventario y Pedidos para Mundo Suni
 * Lógica de la Aplicación (Local-First + Sincronización Google Sheets)
 */

// --- ESTADO GLOBAL ---
let state = {
  materiales: [],
  pedidos: [],
  theme: 'light',
  storageMode: 'local', // 'local' o 'sync'
  syncUrl: ''
};

// Carrito temporal para materiales del pedido actual
let tempOrderCart = [];

// Parsea "YYYY-MM-DD" como fecha local para evitar desfase UTC en timezones negativas
function parseDateLocal(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Devuelve la fecha local actual (o la provista) en formato "YYYY-MM-DD"
function todayLocalISO(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  loadStateFromLocalStorage();
  applyTheme();
  switchTab('dashboard');
  
  // Establecer fecha por defecto en el modal de pedidos
  const today = todayLocalISO();
  document.getElementById('order-fecha').value = today;

  // Si está en modo sincronización al iniciar, jalar datos de Google Sheets
  if (state.storageMode === 'sync' && state.syncUrl) {
    fetchFromGoogleSheets();
  } else {
    renderAll();
  }
});

// --- PERSISTENCIA LOCAL-FIRST ---
function loadStateFromLocalStorage() {
  const localData = localStorage.getItem('vicuinia_state');
  if (localData) {
    try {
      state = { ...state, ...JSON.parse(localData) };
    } catch (e) {
      console.error('Error al cargar datos locales', e);
    }
  } else {
    // Datos semilla para demostración inicial
    seedInitialData();
  }

  // Cargar controles de configuración en pantalla
  document.getElementById('setting-storage-mode').value = state.storageMode;
  document.getElementById('setting-sheet-url').value = state.syncUrl || '';
  toggleStorageModeFields(state.storageMode);
}

function saveStateLocally() {
  localStorage.setItem('vicuinia_state', JSON.stringify(state));
}

function seedInitialData() {
  state.materiales = [
    { id: 'mat-1', nombre: 'Hilo Algodón Premium', categoria: 'Hilos', color: 'Amarillo Pastel', colorHex: '#FDE047', cantidad: 80, unidad: 'metros', costo_unitario: 0.08, stock_minimo: 25 },
    { id: 'mat-2', nombre: 'Hilo Algodón Premium', categoria: 'Hilos', color: 'Turquesa', colorHex: '#06B6D4', cantidad: 120, unidad: 'metros', costo_unitario: 0.08, stock_minimo: 25 },
    { id: 'mat-3', nombre: 'Limpiapipas Flexibles', categoria: 'Limpiapipas', color: 'Blanco', colorHex: '#FFFFFF', cantidad: 30, unidad: 'unidades', costo_unitario: 0.25, stock_minimo: 10 },
    { id: 'mat-4', nombre: 'Limpiapipas Flexibles', categoria: 'Limpiapipas', color: 'Rosado', colorHex: '#EC4899', cantidad: 8, unidad: 'unidades', costo_unitario: 0.25, stock_minimo: 10 },
    { id: 'mat-5', nombre: 'Aguja Crochet N° 3', categoria: 'Herramientas', color: '', colorHex: '', cantidad: 2, unidad: 'unidades', costo_unitario: 8.50, stock_minimo: 1 }
  ];
  
  state.pedidos = [
    {
      id: 'ped-1',
      cliente: 'Mariana Silva',
      producto: 'Amigurumi Abejita Llavero',
      fecha_entrega: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return todayLocalISO(d); })(),
      estado: 'En Proceso',
      mano_obra: 25.00,
      precio_final: 40.00,
      materiales_usados: [
        { materialId: 'mat-1', nombre: 'Hilo Algodón Premium (Amarillo Pastel)', cantidadUsada: 15, costoCalculado: 1.20 },
        { materialId: 'mat-3', nombre: 'Limpiapipas Flexibles (Blanco)', cantidadUsada: 2, costoCalculado: 0.50 }
      ],
      notas: 'Con aro de llavero color dorado.'
    }
  ];
  
  saveStateLocally();
}

// --- SINCRONIZACIÓN CON GOOGLE SHEETS (API) ---
async function fetchFromGoogleSheets() {
  if (!state.syncUrl) return;
  
  updateSyncStatus('Sincronizando...', 'warning');
  try {
    const response = await fetch(state.syncUrl);
    if (!response.ok) throw new Error('Respuesta de red no válida');
    const data = await response.json();
    
    if (data.materiales && data.pedidos) {
      state.materiales = data.materiales;
      state.pedidos = data.pedidos;
      saveStateLocally();
      renderAll();
      updateSyncStatus('Sincronizado', 'success');
    }
  } catch (error) {
    console.error('Error al sincronizar con Google Sheets:', error);
    updateSyncStatus('Error de Conexión', 'danger');
  }
}

async function pushToGoogleSheets() {
  if (state.storageMode !== 'sync' || !state.syncUrl) return;
  
  updateSyncStatus('Guardando en la Nube...', 'warning');
  try {
    const payload = {
      materiales: state.materiales,
      pedidos: state.pedidos
    };
    
    // Usamos no-cors porque Google Apps Script suele redirigir, 
    // pero para tener la respuesta correcta hacemos una petición normal
    const response = await fetch(state.syncUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain' // Para evitar problemas de preflight CORS en Google
      },
      body: JSON.stringify(payload)
    });
    
    const resData = await response.json();
    if (resData.status === 'success') {
      updateSyncStatus('Sincronizado', 'success');
    } else {
      throw new Error(resData.message || 'Error desconocido');
    }
  } catch (error) {
    console.error('Error al subir datos:', error);
    updateSyncStatus('Error al Guardar', 'danger');
  }
}

function updateSyncStatus(text, type) {
  const badge = document.getElementById('sync-status-badge');
  badge.textContent = text;
  badge.className = 'badge'; // Reset classes
  
  if (type === 'success') badge.classList.add('badge-entregado');
  if (type === 'warning') badge.classList.add('badge-pendiente');
  if (type === 'danger') badge.classList.add('badge-proceso'); // red indicator
}

function toggleStorageMode() {
  const select = document.getElementById('setting-storage-mode');
  state.storageMode = select.value;
  saveStateLocally();
  toggleStorageModeFields(state.storageMode);
  
  if (state.storageMode === 'sync') {
    if (state.syncUrl) {
      fetchFromGoogleSheets();
    } else {
      alert('Por favor, ingresa la URL de tu Web App de Google Apps Script para sincronizar.');
    }
  } else {
    updateSyncStatus('Desconectado', 'success');
  }
}

function toggleStorageModeFields(mode) {
  const fields = document.getElementById('sync-settings-fields');
  if (mode === 'sync') {
    fields.style.display = 'block';
  } else {
    fields.style.display = 'none';
  }
}

function saveSyncUrl() {
  const input = document.getElementById('setting-sheet-url');
  state.syncUrl = input.value.trim();
  saveStateLocally();
}

function testSyncConnection() {
  if (!state.syncUrl) {
    alert('Ingresa una URL válida primero.');
    return;
  }
  fetchFromGoogleSheets();
}

// --- TAB SYSTEM ---
function switchTab(tabId) {
  // Hide all sections
  document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'));
  // Deactivate all nav buttons
  document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));
  
  // Show active section & nav btn
  const targetSection = document.getElementById(`section-${tabId}`);
  if (targetSection) {
    targetSection.classList.add('active');
    document.getElementById(`nav-${tabId}`).classList.add('active');
  }
  
  // Configure FAB (Floating Action Button) action based on current tab
  const fab = document.getElementById('global-fab');
  if (tabId === 'dashboard' || tabId === 'pedidos') {
    fab.style.display = 'flex';
    fab.setAttribute('aria-label', 'Crear Pedido');
    fab.innerHTML = `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="10" y1="16" x2="14" y2="16"></line></svg>`; // Calendar-Plus icon
  } else if (tabId === 'inventario') {
    fab.style.display = 'flex';
    fab.setAttribute('aria-label', 'Agregar Material');
    fab.innerHTML = `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`; // Plus icon
  } else {
    fab.style.display = 'none'; // Hide on Settings tab
  }
  
  renderTab(tabId);
}

function handleFabClick() {
  const activeNav = document.querySelector('.bottom-nav .nav-item.active').id;
  if (activeNav === 'nav-inventario') {
    openMaterialModal();
  } else {
    openOrderModal();
  }
}

function renderTab(tabId) {
  if (tabId === 'dashboard') renderDashboard();
  if (tabId === 'inventario') renderInventory();
  if (tabId === 'pedidos') renderOrders();
}

function renderAll() {
  renderDashboard();
  renderInventory();
  renderOrders();
}

// --- 1. RENDER DASHBOARD ---
function renderDashboard() {
  // Stats
  document.getElementById('stat-materiales').textContent = state.materiales.length;
  
  const pendingOrders = state.pedidos.filter(p => p.estado !== 'Entregado');
  document.getElementById('stat-pedidos-pendientes').textContent = pendingOrders.length;
  
  const totalInvCost = state.materiales.reduce((acc, m) => acc + (parseFloat(m.cantidad) || 0) * (parseFloat(m.costo_unitario) || 0), 0);
  document.getElementById('stat-costo-inventario').textContent = `S/. ${totalInvCost.toFixed(2)}`;
  
  // Projected Profit: Sum of earnings from pending orders (precio_final - materials cost)
  let projectedProfit = 0;
  pendingOrders.forEach(p => {
    const costOfMaterials = (p.materiales_usados || []).reduce((sum, m) => sum + (parseFloat(m.costoCalculado) || 0), 0);
    projectedProfit += (parseFloat(p.precio_final) || 0) - costOfMaterials;
  });
  document.getElementById('stat-ganancia-proyectada').textContent = `S/. ${projectedProfit.toFixed(2)}`;

  // Low stock alerts
  const lowStockItems = state.materiales.filter(m => m.cantidad <= m.stock_minimo);
  const alertBanner = document.getElementById('dashboard-alerts');
  const alertList = document.getElementById('alert-list');
  
  if (lowStockItems.length > 0) {
    alertBanner.style.display = 'flex';
    alertList.innerHTML = lowStockItems.map(m => `
      <li><strong>${m.nombre}</strong> (${m.color || 'Sin color'}): te quedan <strong>${m.cantidad} ${m.unidad}</strong> (mínimo: ${m.stock_minimo})</li>
    `).join('');
  } else {
    alertBanner.style.display = 'none';
  }

  // Render Upcoming Deliveries inside Dashboard
  const deliveriesContainer = document.getElementById('dashboard-deliveries');
  
  if (pendingOrders.length === 0) {
    deliveriesContainer.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 12px; font-size: 0.85rem;">No tienes pedidos pendientes de entrega. ¡Gran trabajo!</p>`;
    document.getElementById('count-proximas').textContent = 0;
    return;
  }
  
  // Sort pending orders by closest delivery date
  const sortedPending = [...pendingOrders].sort((a, b) => parseDateLocal(a.fecha_entrega) - parseDateLocal(b.fecha_entrega));
  document.getElementById('count-proximas').textContent = sortedPending.length;

  deliveriesContainer.innerHTML = sortedPending.map(p => {
    const daysLeft = Math.ceil((parseDateLocal(p.fecha_entrega) - Date.now()) / 86400000);
    let dayText = '';
    if (daysLeft === 0) dayText = '¡ENTREGA HOY! 🚨';
    else if (daysLeft === 1) dayText = 'Entrega mañana ⏳';
    else if (daysLeft < 0) dayText = `Vencido hace ${Math.abs(daysLeft)} días ⚠️`;
    else dayText = `Entrega en ${daysLeft} días`;

    const className = p.estado === 'En Proceso' ? 'en-proceso' : '';

    return `
      <div class="delivery-mini-card ${className}">
        <div>
          <div style="font-weight: 700; font-size: 0.9rem;">${p.producto}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Para: ${p.cliente} | ${dayText}</div>
        </div>
        <button class="btn btn-secondary btn-sm" style="width: auto; padding: 4px 8px;" onclick="openOrderModal('${p.id}')">Ver</button>
      </div>
    `;
  }).join('');
}

// --- 2. RENDER INVENTORY ---
function renderInventory() {
  const container = document.getElementById('inventory-container');
  const searchQuery = document.getElementById('search-inventory').value.toLowerCase().trim();
  const categoryFilter = document.getElementById('filter-inventory-category').value;

  let filtered = state.materiales;
  
  // Search filter
  if (searchQuery) {
    filtered = filtered.filter(m => 
      m.nombre.toLowerCase().includes(searchQuery) || 
      (m.color && m.color.toLowerCase().includes(searchQuery))
    );
  }
  
  // Category filter
  if (categoryFilter !== 'todos') {
    filtered = filtered.filter(m => m.categoria === categoryFilter);
  }

  if (filtered.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 30px;">No se encontraron materiales.</p>`;
    return;
  }

  container.innerHTML = filtered.map(m => {
    const isLow = m.cantidad <= m.stock_minimo;
    const isYarnOrPipe = m.categoria === 'Hilos' || m.categoria === 'Limpiapipas';
    
    // Dynamic color badge or tool icon
    let badgeContent = '';
    if (isYarnOrPipe && m.colorHex) {
      badgeContent = `<div class="color-indicator" style="background-color: ${m.colorHex};" title="${m.color}"></div>`;
    } else {
      let icon = '📦';
      if (m.categoria === 'Herramientas') icon = '🛠️';
      badgeContent = `<div class="color-indicator color-tool" title="${m.categoria}">${icon}</div>`;
    }

    return `
      <div class="item-row">
        <div class="item-info" onclick="openMaterialModal('${m.id}')" style="cursor: pointer;">
          ${badgeContent}
          <div class="item-details">
            <span class="item-name">${m.nombre}</span>
            <div class="item-subtext">
              <span>${m.categoria} ${m.color ? `• ${m.color}` : ''}</span>
              <span>S/. ${(parseFloat(m.costo_unitario) || 0).toFixed(2)} / ${(m.unidad || 'u').substring(0, 3)}.</span>
            </div>
          </div>
        </div>
        <div class="item-qty-actions">
          <button class="btn-qty" onclick="adjustStock('${m.id}', -1)" aria-label="Restar">-</button>
          <span class="qty-val ${isLow ? 'low' : ''}">${m.cantidad}</span>
          <button class="btn-qty" onclick="adjustStock('${m.id}', 1)" aria-label="Sumar">+</button>
          <button class="btn-qty btn-qty-delete" onclick="deleteMaterial('${m.id}')" aria-label="Eliminar" title="Eliminar material">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function deleteMaterial(id) {
  const mat = state.materiales.find(m => m.id === id);
  if (!mat) return;
  const label = mat.nombre + (mat.color ? ` (${mat.color})` : '');
  if (confirm(`¿Eliminar "${label}" del inventario?`)) {
    state.materiales = state.materiales.filter(m => m.id !== id);
    saveStateLocally();
    renderInventory();
    renderDashboard();
    pushToGoogleSheets();
  }
}

function adjustStock(id, amount) {
  const index = state.materiales.findIndex(m => m.id === id);
  if (index !== -1) {
    const m = state.materiales[index];
    const newQty = Math.max(0, m.cantidad + amount);
    state.materiales[index].cantidad = parseFloat(newQty.toFixed(2));
    
    saveStateLocally();
    renderInventory();
    renderDashboard();
    pushToGoogleSheets();
  }
}

// --- 3. RENDER ORDERS ---
function renderOrders() {
  const container = document.getElementById('orders-container');
  const searchQuery = document.getElementById('search-orders').value.toLowerCase().trim();
  const statusFilter = document.getElementById('filter-orders-status').value;

  let filtered = state.pedidos;

  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.cliente.toLowerCase().includes(searchQuery) || 
      p.producto.toLowerCase().includes(searchQuery)
    );
  }

  if (statusFilter !== 'todos') {
    filtered = filtered.filter(p => p.estado === statusFilter);
  }

  if (filtered.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 30px;">No se encontraron pedidos.</p>`;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const materialsCost = (p.materiales_usados || []).reduce((sum, m) => sum + (parseFloat(m.costoCalculado) || 0), 0);
    const totalProfit = (parseFloat(p.precio_final) || 0) - materialsCost;
    
    let statusClass = 'badge-pendiente';
    let cardClass = '';
    if (p.estado === 'En Proceso') {
      statusClass = 'badge-proceso';
      cardClass = 'en-proceso';
    } else if (p.estado === 'Entregado') {
      statusClass = 'badge-entregado';
      cardClass = 'entregado';
    }

    // Format dates to look readable
    const dateFormatted = parseDateLocal(p.fecha_entrega).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });

    return `
      <div class="order-card ${cardClass}">
        <div class="order-header">
          <div>
            <h4 class="order-title">${p.producto}</h4>
            <span class="order-client">Cliente: ${p.cliente}</span>
          </div>
          <span class="badge ${statusClass}">${p.estado}</span>
        </div>
        
        <div class="order-meta-grid">
          <div class="order-meta-item">
            <span class="order-meta-label">Entrega</span>
            <span class="order-meta-val">${dateFormatted}</span>
          </div>
          <div class="order-meta-item">
            <span class="order-meta-label">Precio</span>
            <span class="order-meta-val">S/. ${(parseFloat(p.precio_final) || 0).toFixed(2)}</span>
          </div>
          <div class="order-meta-item">
            <span class="order-meta-label">Ganancia</span>
            <span class="order-meta-val" style="color: var(--success); font-weight:700;">S/. ${totalProfit.toFixed(2)}</span>
          </div>
        </div>

        ${p.notas ? `<p style="font-size:0.75rem; color: var(--text-muted); font-style:italic;">"${p.notas}"</p>` : ''}

        <div class="order-actions">
          <button class="btn btn-secondary btn-sm btn-edit-order" onclick="openOrderModal('${p.id}')">Editar / Costear</button>
          <button class="btn btn-danger btn-sm" style="padding: 4px 8px; width:auto;" onclick="deleteOrder('${p.id}')" aria-label="Eliminar">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

// --- FORMULARIO Y MODAL: MATERIALES ---
function openMaterialModal(id = null) {
  const modal = document.getElementById('modal-material');
  const title = document.getElementById('material-modal-title');
  const form = document.getElementById('form-material');
  
  form.reset();
  modal.classList.add('active');

  if (id) {
    title.textContent = 'Editar Material';
    const mat = state.materiales.find(m => m.id === id);
    if (mat) {
      document.getElementById('material-id').value = mat.id;
      document.getElementById('material-nombre').value = mat.nombre;
      document.getElementById('material-categoria').value = mat.categoria;
      document.getElementById('material-color').value = mat.color || '';
      document.getElementById('material-color-hex').value = mat.colorHex || '#D97706';
      document.getElementById('material-cantidad').value = mat.cantidad;
      document.getElementById('material-unidad').value = mat.unidad;
      document.getElementById('material-costo').value = mat.costo_unitario;
      document.getElementById('material-stock-minimo').value = mat.stock_minimo;
      
      handleCategoryChange();
    }
  } else {
    title.textContent = 'Agregar Material';
    document.getElementById('material-id').value = '';
    handleCategoryChange();
  }
}

function closeMaterialModal() {
  document.getElementById('modal-material').classList.remove('active');
}

function handleCategoryChange() {
  const category = document.getElementById('material-categoria').value;
  const colorWrapper = document.getElementById('material-color-wrapper');
  const unitInput = document.getElementById('material-unidad');
  const costHelp = document.getElementById('material-costo-help');

  if (category === 'Hilos') {
    colorWrapper.style.display = 'block';
    unitInput.value = 'metros';
    costHelp.textContent = 'Costo por metro de hilo.';
  } else if (category === 'Limpiapipas') {
    colorWrapper.style.display = 'block';
    unitInput.value = 'unidades';
    costHelp.textContent = 'Costo por limpiapipas individual.';
  } else if (category === 'Herramientas') {
    colorWrapper.style.display = 'none';
    unitInput.value = 'unidades';
    costHelp.textContent = 'Costo de compra de la herramienta.';
  } else {
    colorWrapper.style.display = 'block';
    unitInput.value = 'unidades';
    costHelp.textContent = 'Costo por unidad de medida.';
  }
}

function saveMaterial(event) {
  event.preventDefault();
  const id = document.getElementById('material-id').value;
  const nombre = document.getElementById('material-nombre').value.trim();
  const categoria = document.getElementById('material-categoria').value;
  const color = document.getElementById('material-color').value.trim();
  const colorHex = document.getElementById('material-color-hex').value;
  const cantidad = parseFloat(document.getElementById('material-cantidad').value);
  const unidad = document.getElementById('material-unidad').value.trim();
  const costo = parseFloat(document.getElementById('material-costo').value);
  const stockMinimo = parseFloat(document.getElementById('material-stock-minimo').value);

  if (isNaN(cantidad) || isNaN(costo) || isNaN(stockMinimo)) {
    alert('Por favor, ingresa valores numéricos válidos para cantidad, costo y stock mínimo.');
    return;
  }

  const matData = {
    id: id || `mat-${Date.now()}`,
    nombre,
    categoria,
    color: (categoria === 'Herramientas') ? '' : color,
    colorHex: (categoria === 'Herramientas') ? '' : colorHex,
    cantidad,
    unidad,
    costo_unitario: costo,
    stock_minimo: stockMinimo
  };

  if (id) {
    // Editar existente
    const idx = state.materiales.findIndex(m => m.id === id);
    if (idx !== -1) state.materiales[idx] = matData;
  } else {
    // Agregar nuevo
    state.materiales.push(matData);
  }

  saveStateLocally();
  closeMaterialModal();
  renderInventory();
  renderDashboard();
  pushToGoogleSheets();
}

// --- FORMULARIO Y MODAL: PEDIDOS (CALCULADORA DE COSTEO) ---
function openOrderModal(id = null) {
  const modal = document.getElementById('modal-order');
  const title = document.getElementById('order-modal-title');
  const form = document.getElementById('form-order');
  
  form.reset();
  modal.classList.add('active');
  tempOrderCart = [];

  // Reset checkboxes
  document.getElementById('order-deduct-stock').checked = true;

  if (id) {
    title.textContent = 'Editar Pedido y Costeo';
    const ped = state.pedidos.find(p => p.id === id);
    if (ped) {
      document.getElementById('order-id').value = ped.id;
      document.getElementById('order-cliente').value = ped.cliente;
      document.getElementById('order-producto').value = ped.producto;
      document.getElementById('order-fecha').value = ped.fecha_entrega;
      document.getElementById('order-estado').value = ped.estado;
      document.getElementById('order-mano-obra').value = ped.mano_obra;
      document.getElementById('order-precio-final').value = ped.precio_final;
      document.getElementById('order-notas').value = ped.notas || '';
      
      // Cargar los materiales al carrito temporal del pedido
      tempOrderCart = [...ped.materiales_usados];
    }
  } else {
    title.textContent = 'Nuevo Pedido y Costeo';
    document.getElementById('order-id').value = '';
    document.getElementById('order-mano-obra').value = 15.00; // Valor inicial mano de obra
    document.getElementById('order-precio-final').value = 0;
    
    const today = todayLocalISO();
    document.getElementById('order-fecha').value = today;
  }

  renderOrderCart();
  calculateCosts();
}

function closeOrderModal() {
  document.getElementById('modal-order').classList.remove('active');
}

// RENDER DYNAMIC MATERIAL CART INSIDE ORDER
function renderOrderCart() {
  const list = document.getElementById('order-cart-items');
  const emptyText = document.getElementById('cart-empty-text');

  if (tempOrderCart.length === 0) {
    list.innerHTML = '';
    emptyText.style.display = 'block';
    return;
  }

  emptyText.style.display = 'none';
  list.innerHTML = tempOrderCart.map((item, index) => {
    // Buscar la unidad correspondiente en el inventario actual
    const originMaterial = state.materiales.find(m => m.id === item.materialId);
    const unit = originMaterial ? originMaterial.unidad : 'unidades';

    return `
      <div class="cart-item-row">
        <div class="cart-item-info">
          <span class="cart-item-name">${item.nombre}</span>
          <span class="cart-item-qty">Usado: ${item.cantidadUsada} ${unit}</span>
        </div>
        <div style="display:flex; align-items:center; gap: 8px;">
          <span class="cart-item-cost">S/. ${(parseFloat(item.costoCalculado) || 0).toFixed(2)}</span>
          <button type="button" class="cart-item-remove" onclick="removeMaterialFromCart(${index})" aria-label="Remover">×</button>
        </div>
      </div>
    `;
  }).join('');
}

// CALCULATE COSTS DYNAMICALLY IN REAL-TIME
function calculateCosts() {
  // Sum cost of materials in cart
  const costOfMaterials = tempOrderCart.reduce((sum, item) => sum + (parseFloat(item.costoCalculado) || 0), 0);
  document.getElementById('calc-costo-materiales').textContent = `S/. ${costOfMaterials.toFixed(2)}`;

  // Get labor cost
  const labor = parseFloat(document.getElementById('order-mano-obra').value) || 0;
  
  // Sugerencia de precio final (Costo de Materiales + Mano de Obra) con un 30% de margen de contribución adicional
  // Fórmula: (Costo + Mano de obra) * 1.3
  const suggestedPrice = (costOfMaterials + labor) * 1.30;
  document.getElementById('calc-precio-sugerido').textContent = `S/. ${suggestedPrice.toFixed(2)}`;

  // If price final is 0 or wasn't set, default it to suggested or (materials + labor)
  const finalPriceInput = document.getElementById('order-precio-final');
  if (parseFloat(finalPriceInput.value) === 0 || finalPriceInput.value === '') {
    finalPriceInput.value = Math.ceil(suggestedPrice);
  }

  const finalPrice = parseFloat(finalPriceInput.value) || 0;
  
  // Projected earning = Price Charged - Materials cost
  const profit = finalPrice - costOfMaterials;
  
  const profitVal = document.getElementById('calc-ganancia-final');
  profitVal.textContent = `S/. ${profit.toFixed(2)}`;
}

// Watchers for costing recalculation
document.getElementById('order-mano-obra').addEventListener('input', calculateCosts);
document.getElementById('order-precio-final').addEventListener('input', calculateCosts);

// SUB-MODAL: CHOOSE MATERIAL TO ADD TO CART
function openAddToCartModal() {
  const modal = document.getElementById('modal-add-to-cart');
  const select = document.getElementById('cart-select-material');
  
  if (state.materiales.length === 0) {
    alert('Primero debes agregar materiales a tu Inventario.');
    return;
  }

  // Populate options
  select.innerHTML = state.materiales.map(m => `
    <option value="${m.id}">${m.nombre} (${m.color ? `${m.color} - ` : ''}${m.categoria})</option>
  `).join('');

  modal.classList.add('active');
  updateCartMaterialDetails();
}

function closeAddToCartModal() {
  document.getElementById('modal-add-to-cart').classList.remove('active');
}

function updateCartMaterialDetails() {
  const select = document.getElementById('cart-select-material');
  const matId = select.value;
  const mat = state.materiales.find(m => m.id === matId);

  if (mat) {
    document.getElementById('cart-stock-available-info').textContent = `Stock disponible: ${mat.cantidad} ${mat.unidad}`;
    document.getElementById('cart-unit-label').textContent = mat.unidad;
    document.getElementById('cart-cantidad-usar').max = mat.cantidad;
  }
}

function addMaterialToOrderCart() {
  const select = document.getElementById('cart-select-material');
  const matId = select.value;
  const qtyToUse = parseFloat(document.getElementById('cart-cantidad-usar').value);
  
  if (isNaN(qtyToUse) || qtyToUse <= 0) {
    alert('Ingresa una cantidad válida.');
    return;
  }

  const mat = state.materiales.find(m => m.id === matId);
  if (!mat) return;

  const cost = qtyToUse * mat.costo_unitario;

  // Add to temp cart
  const displayName = `${mat.nombre} ${mat.color ? `(${mat.color})` : ''}`;
  
  // Verify if it already exists in the cart, if so, merge
  const existingIdx = tempOrderCart.findIndex(item => item.materialId === matId);
  if (existingIdx !== -1) {
    tempOrderCart[existingIdx].cantidadUsada = parseFloat((tempOrderCart[existingIdx].cantidadUsada + qtyToUse).toFixed(4));
    tempOrderCart[existingIdx].costoCalculado = parseFloat((tempOrderCart[existingIdx].cantidadUsada * mat.costo_unitario).toFixed(4));
  } else {
    tempOrderCart.push({
      materialId: matId,
      nombre: displayName,
      cantidadUsada: qtyToUse,
      costoCalculado: parseFloat(cost.toFixed(4))
    });
  }

  closeAddToCartModal();
  renderOrderCart();
  calculateCosts();
}

function removeMaterialFromCart(index) {
  tempOrderCart.splice(index, 1);
  renderOrderCart();
  calculateCosts();
}

// SAVE THE COMPLETE ORDER
function saveOrder(event) {
  event.preventDefault();
  const id = document.getElementById('order-id').value;
  const cliente = document.getElementById('order-cliente').value.trim();
  const producto = document.getElementById('order-producto').value.trim();
  const fecha_entrega = document.getElementById('order-fecha').value;
  const estado = document.getElementById('order-estado').value;
  const mano_obra = parseFloat(document.getElementById('order-mano-obra').value) || 0;
  const precio_final = parseFloat(document.getElementById('order-precio-final').value) || 0;
  const notes = document.getElementById('order-notas').value.trim();
  const deductStock = document.getElementById('order-deduct-stock').checked;

  const orderData = {
    id: id || `ped-${Date.now()}`,
    cliente,
    producto,
    fecha_entrega,
    estado,
    mano_obra,
    precio_final,
    materiales_usados: [...tempOrderCart],
    notas: notes
  };

  // DEDUCT FROM STOCK IF TOGGLED
  if (deductStock) {
    // If it's editing an existing order, find out what materials changed or just subtract the new cart materials.
    // For simplicity: We deduct the materials of the cart that were newly added.
    // If it is a brand-new order, we deduct everything.
    let oldOrder = null;
    if (id) {
      oldOrder = state.pedidos.find(p => p.id === id);
    }

    tempOrderCart.forEach(cartItem => {
      const matIdx = state.materiales.findIndex(m => m.id === cartItem.materialId);
      if (matIdx !== -1) {
        let diff = cartItem.cantidadUsada;
        // If we are editing, only deduct the difference (diff = newQty - oldQty)
        if (oldOrder) {
          const oldItem = oldOrder.materiales_usados.find(om => om.materialId === cartItem.materialId);
          if (oldItem) {
            diff = cartItem.cantidadUsada - oldItem.cantidadUsada;
          }
        }
        
        state.materiales[matIdx].cantidad = Math.max(0, parseFloat((state.materiales[matIdx].cantidad - diff).toFixed(2)));
      }
    });
  }

  if (id) {
    const idx = state.pedidos.findIndex(p => p.id === id);
    if (idx !== -1) state.pedidos[idx] = orderData;
  } else {
    state.pedidos.push(orderData);
  }

  saveStateLocally();
  closeOrderModal();
  renderOrders();
  renderInventory();
  renderDashboard();
  pushToGoogleSheets();
}

function deleteOrder(id) {
  if (confirm('¿Estás segura de que quieres eliminar este pedido?')) {
    state.pedidos = state.pedidos.filter(p => p.id !== id);
    saveStateLocally();
    renderOrders();
    renderDashboard();
    pushToGoogleSheets();
  }
}

// --- AJUSTES: TEMAS Y EXPORTACIÓN ---
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const target = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', target);
  
  state.theme = target;
  saveStateLocally();
  applyTheme();
}

function applyTheme() {
  const icon = document.getElementById('theme-icon');
  if (state.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`; // Moon icon
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    icon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`; // Sun icon
  }
}

// Backup tools
function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `vicuinia_mundo_suni_backup_${todayLocalISO()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.materiales && imported.pedidos) {
        state.materiales = imported.materiales;
        state.pedidos = imported.pedidos;
        if (imported.storageMode) state.storageMode = imported.storageMode;
        if (imported.syncUrl) state.syncUrl = imported.syncUrl;
        
        saveStateLocally();
        renderAll();
        
        // Update input values
        document.getElementById('setting-storage-mode').value = state.storageMode;
        document.getElementById('setting-sheet-url').value = state.syncUrl || '';
        toggleStorageModeFields(state.storageMode);
        
        alert('¡Copia de seguridad importada con éxito!');
      } else {
        alert('El archivo cargado no tiene un formato válido de Vicuinia.');
      }
    } catch(err) {
      alert('Error al leer el archivo de copia de seguridad.');
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  if (confirm('🚨 ¡ATENCIÓN! Esto borrará absolutamente todos tus materiales y pedidos registrados localmente. ¿Estás segura de querer continuar?')) {
    localStorage.removeItem('vicuinia_state');
    state.materiales = [];
    state.pedidos = [];
    saveStateLocally();
    renderAll();
    alert('Se han borrado todos los datos.');
  }
}

// Google Apps Script Modals
function openAppsScriptModal() {
  document.getElementById('modal-apps-script').classList.add('active');
}

function closeAppsScriptModal() {
  document.getElementById('modal-apps-script').classList.remove('active');
}

function copyAppsScriptCode() {
  const codeText = document.getElementById('apps-script-code-text').textContent;
  navigator.clipboard.writeText(codeText).then(() => {
    alert('¡Código copiado al portapapeles!');
  }).catch(() => {
    alert('No se pudo copiar automáticamente. Por favor, selecciónalo manualmente y cópialo.');
  });
}
