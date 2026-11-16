/**
 * Google Apps Script - Vicuinia Backend
 * Sincronización Gratuita para Mundo Suni
 * 
 * Sigue los pasos en los ajustes de la app para implementar este script.
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var res = {};
  
  // Aseguramos que existan las hojas necesarias
  createSheetsIfNotExist(sheet);
  
  res.materiales = getSheetData(sheet.getSheetByName("materiales"));
  res.pedidos = getSheetData(sheet.getSheetByName("pedidos"));
  
  return ContentService.createTextOutput(JSON.stringify(res))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    createSheetsIfNotExist(sheet);
    
    // Guardar Materiales en su hoja
    saveSheetData(
      sheet.getSheetByName("materiales"), 
      data.materiales, 
      ["id", "nombre", "categoria", "color", "colorHex", "cantidad", "unidad", "costo_unitario", "stock_minimo"]
    );
    
    // Guardar Pedidos en su hoja
    saveSheetData(
      sheet.getSheetByName("pedidos"), 
      data.pedidos, 
      ["id", "cliente", "producto", "fecha_entrega", "estado", "mano_obra", "precio_final", "materiales_usados", "notas"]
    );
    
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Crea las hojas "materiales" y "pedidos" con sus cabeceras correspondientes si no existen
function createSheetsIfNotExist(sheet) {
  if (!sheet.getSheetByName("materiales")) {
    var s = sheet.insertSheet("materiales");
    s.appendRow(["id", "nombre", "categoria", "color", "colorHex", "cantidad", "unidad", "costo_unitario", "stock_minimo"]);
  }
  if (!sheet.getSheetByName("pedidos")) {
    var s = sheet.insertSheet("pedidos");
    s.appendRow(["id", "cliente", "producto", "fecha_entrega", "estado", "mano_obra", "precio_final", "materiales_usados", "notas"]);
  }
}

// Obtiene los datos de una hoja y los transforma en un Array de Objetos JSON
function getSheetData(s) {
  var rows = s.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows[0];
  var data = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = rows[i][j];
      
      // Si el campo es 'materiales_usados', es un texto JSON y debemos parsearlo
      if (headers[j] === "materiales_usados" && val && typeof val === "string") {
        try { 
          obj[headers[j]] = JSON.parse(val); 
        } catch(err) { 
          obj[headers[j]] = val; 
        }
      } else {
        obj[headers[j]] = val;
      }
    }
    data.push(obj);
  }
  return data;
}

// Limpia y guarda la lista de objetos en la hoja respectiva respetando el orden de cabeceras
function saveSheetData(s, dataList, headers) {
  s.clear();
  s.appendRow(headers);
  if (!dataList || dataList.length === 0) return;
  
  for (var i = 0; i < dataList.length; i++) {
    var item = dataList[i];
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      var val = item[headers[j]];
      
      if (headers[j] === "materiales_usados") {
        row.push(JSON.stringify(val));
      } else {
        row.push(val !== undefined ? val : "");
      }
    }
    s.appendRow(row);
  }
}
