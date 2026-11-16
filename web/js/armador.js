/**
 * Armador: comparte la entrega, la cantidad, el resumen y el borrador de
 * WhatsApp entre todas las líneas. Cada línea aporta su diseñador y solo se
 * descarga lo que necesita: el clicker y el lápiz usan la lógica 3D real; las
 * demás, la silueta del catálogo.
 */
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

/** El motor de letras del lápiz (JSCAD) se carga solo cuando hace falta. */
function cargarJscad() {
  if (window.jscadModeling) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'vendor/jscad-modeling.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar el motor de letras'));
    document.head.append(script);
  });
}

export async function crearArmador({ mount, producto, onChange }) {
  const estado = {
    cliente: '',
    cantidad: 1,
    notas: '',
    entrega: 'recoger',
    ciudad: '',
    direccion: ''
  };

  mount.innerHTML = `
    <div class="product-armador__grid">
      <div class="product-armador__vista" id="arm-vista"></div>
      <div class="product-armador__panel">
        <div id="arm-diseno"></div>

        <section class="arm-step">
          <h3 class="arm-step__title"><span class="arm-step__num" id="arm-num-entrega">4</span> ¿Dónde lo quieres?</h3>
          <div class="segmented segmented--two" id="arm-entrega" role="group" aria-label="Entrega">
            <button class="seg" type="button" data-entrega="recoger" aria-pressed="true">Recoger en Cajamarca</button>
            <button class="seg" type="button" data-entrega="envio" aria-pressed="false">Envío a mi ciudad</button>
          </div>
          <div class="arm-entrega" id="arm-entrega-detalle"></div>
        </section>

        <details class="adv">
          <summary>Opciones avanzadas</summary>
          <div class="ranges" id="arm-avanzado"></div>
        </details>

        <dl class="arm-resumen" id="arm-resumen"></dl>
      </div>
    </div>`;

  const vista = $('#arm-vista', mount);
  const panelDiseno = $('#arm-diseno', mount);

  /* -------------------------------------------------------------- entrega */

  const botonesEntrega = $$('#arm-entrega .seg', mount);
  const detalleEntrega = $('#arm-entrega-detalle', mount);
  botonesEntrega.forEach((boton) => {
    boton.addEventListener('click', () => {
      estado.entrega = boton.dataset.entrega;
      botonesEntrega.forEach((otro) => otro.setAttribute('aria-pressed', String(otro === boton)));
      pintarEntrega();
      refrescar();
    });
  });

  function pintarEntrega() {
    if (estado.entrega === 'recoger') {
      detalleEntrega.innerHTML = '<p class="hint">Te lo entregamos en Cajamarca: coordinamos el punto y el día por WhatsApp.</p>';
      return;
    }
    detalleEntrega.innerHTML = `
      <div class="field">
        <label for="arm-ciudad">Ciudad</label>
        <input class="input" id="arm-ciudad" type="text" autocomplete="address-level2" placeholder="Ej. Trujillo">
      </div>
      <div class="field">
        <label for="arm-direccion">Dirección o referencia</label>
        <input class="input" id="arm-direccion" type="text" autocomplete="street-address" placeholder="Ej. Av. También lo recojo en la agencia">
      </div>`;
    $('#arm-ciudad', detalleEntrega).addEventListener('input', (event) => {
      estado.ciudad = event.target.value;
      refrescar();
    });
    $('#arm-direccion', detalleEntrega).addEventListener('input', (event) => {
      estado.direccion = event.target.value;
      refrescar();
    });
  }
  pintarEntrega();

  /* ------------------------------------------------------------- avanzado */

  const avanzado = $('#arm-avanzado', mount);

  const campoCliente = document.createElement('div');
  campoCliente.className = 'field';
  campoCliente.innerHTML = `
    <label for="arm-cliente">Cómo te llamas (para el chat)</label>
    <input class="input" id="arm-cliente" type="text" autocomplete="name" placeholder="Ej. Jair">`;
  avanzado.append(campoCliente);
  $('#arm-cliente', campoCliente).addEventListener('input', (event) => {
    estado.cliente = event.target.value;
  });

  const cantidad = document.createElement('div');
  cantidad.className = 'field';
  cantidad.innerHTML = `
    <label for="arm-cantidad">Cantidad</label>
    <input class="input" id="arm-cantidad" type="number" min="1" max="500" value="1" inputmode="numeric">`;
  avanzado.append(cantidad);
  $('#arm-cantidad', cantidad).addEventListener('input', (event) => {
    estado.cantidad = Number(event.target.value) || 1;
    refrescar();
  });

  const notas = document.createElement('div');
  notas.className = 'field';
  notas.innerHTML = `
    <label for="arm-notas">Algo más que debamos saber</label>
    <textarea class="input" id="arm-notas" rows="3" placeholder="Para quién es, la fecha en que lo necesitas, si lo quieres con caja…"></textarea>`;
  avanzado.append(notas);
  $('#arm-notas', notas).addEventListener('input', (event) => {
    estado.notas = event.target.value;
  });

  /* ------------------------------------------------------------- resumen */

  function filasResumen() {
    const filas = [['Pieza', producto.nombre]];
    if (diseno) filas.push(...diseno.filasResumen());
    filas.push(['Cantidad', String(estado.cantidad)]);
    filas.push(['Entrega', estado.entrega === 'recoger' ? 'Recoger en Cajamarca' : 'Envío a ' + (estado.ciudad.trim() || 'mi ciudad')]);
    return filas;
  }

  function refrescar() {
    const resumen = $('#arm-resumen', mount);
    if (resumen) {
      resumen.innerHTML = filasResumen().map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
    }
    if (onChange) onChange(filasResumen());
  }

  /* -------------------------------------------- diseñador de la línea */

  let diseno = null;
  const modo = producto.modo || 'plano';

  if (modo === 'clicker') {
    const mod = await import('./disenador-clicker.js');
    diseno = mod.crearDisenadorClicker({ mount: panelDiseno, vista, onChange: refrescar });
  } else if (modo === 'lapiz') {
    await cargarJscad();
    const mod = await import('./disenador-lapiz.js');
    diseno = mod.crearDisenadorLapiz({ mount: panelDiseno, vista, onChange: refrescar });
  } else {
    const mod = await import('./disenador-plano.js');
    diseno = mod.crearDisenadorPlano({ mount: panelDiseno, vista, producto, onChange: refrescar });
  }

  const numeroEntrega = $('#arm-num-entrega', mount);
  if (numeroEntrega) numeroEntrega.textContent = String((diseno.pasos || 3) + 1);

  refrescar();

  /* -------------------------------------------------------------- envío */

  function mensaje() {
    const lineas = [];
    lineas.push(estado.cliente.trim() ? `Hola Vicunia 👋 Soy ${estado.cliente.trim()}.` : 'Hola Vicunia 👋');
    lineas.push(`Quiero encargar: ${producto.nombre} (x${estado.cantidad}).`);
    lineas.push(...diseno.mensajeLineas());
    if (estado.entrega === 'recoger') {
      lineas.push('Entrega: recojo en Cajamarca (coordinamos punto y día).');
    } else {
      lineas.push('Entrega: envío a ' + (estado.ciudad.trim() || 'mi ciudad') + (estado.direccion.trim() ? ' · ' + estado.direccion.trim() : ''));
    }
    if (estado.notas.trim()) lineas.push(`Notas: ${estado.notas.trim()}`);
    lineas.push('');
    lineas.push('¿Me confirman precio y tiempo de entrega?');
    return lineas.join('\n');
  }

  return { estado, mensaje, refrescar, filasResumen };
}
