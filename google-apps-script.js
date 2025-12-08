/**
 * Google Apps Script para recibir datos del formulario de pedidos
 * y guardarlos en la hoja "Antojo de Carnes frías"
 * 
 * INSTRUCCIONES:
 * 1. Abre tu hoja de Google Sheets "Antojo de Carnes frías"
 * 2. Ve a Extensiones > Apps Script (o script.google.com)
 * 3. Pega este código en el editor
 * 4. Si el script está en un proyecto independiente, copia el ID de tu hoja de Google Sheets
 *    (está en la URL: https://docs.google.com/spreadsheets/d/EL_ID_AQUI/edit)
 *    y pégalo en la constante SPREADSHEET_ID abajo
 * 5. Guarda el proyecto (Ctrl+S o Cmd+S)
 * 6. Haz clic en "Desplegar" > "Nueva implementación"
 * 7. Selecciona tipo: "Aplicación web"
 * 8. Ejecuta como: "Yo"
 * 9. Quién tiene acceso: "Cualquiera"
 * 10. Haz clic en "Desplegar"
 * 11. Copia la URL que se genera y pégala en pedido.html donde dice "TU_URL_DEL_GOOGLE_APPS_SCRIPT_AQUI"
 */

// ID de tu hoja de Google Sheets (solo necesario si el script está en un proyecto independiente)
// Para obtenerlo: abre tu hoja y copia el ID de la URL entre /d/ y /edit
const SPREADSHEET_ID = '1CXs_JPdU0Unhd9b5A6SarRWl4TIDypUEff7Ar6s2uxQ'; // ID de la hoja "Tabla de Carnes frias"

function doPost(e) {
  try {
    // Validar que el objeto e existe ANTES de cualquier acceso
    if (typeof e === 'undefined' || e === null) {
      Logger.log('ERROR: El objeto e (event) es undefined o null');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'No se recibió el objeto de evento',
        message: 'doPost debe ser llamado con datos POST del formulario, no directamente desde el editor'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Obtener los datos del POST (vienen como parámetros de formulario)
    let datos = {};
    
    // Registrar lo que recibimos para depuración
    Logger.log('Tipo de e:', typeof e);
    Logger.log('e existe:', e !== null && e !== undefined);
    
    // Acceder a e.parameter de forma segura
    const parameter = (e && typeof e === 'object') ? e.parameter : null;
    const postData = (e && typeof e === 'object') ? e.postData : null;
    
    Logger.log('Datos recibidos - e.parameter: ' + JSON.stringify(parameter || 'undefined'));
    Logger.log('Datos recibidos - e.postData: ' + JSON.stringify(postData || 'undefined'));
    
    // Los datos vienen en e.parameter cuando se envía como formulario
    if (parameter && typeof parameter === 'object' && Object.keys(parameter).length > 0) {
      datos = {
        nombre: parameter.nombre || '',
        direccion: parameter.direccion || '',
        telefono: parameter.telefono || '',
        correoelectronico: parameter.correoelectronico || '',
        email: parameter.email || '', // Para contacto
        mensaje: parameter.mensaje || '', // Para contacto
        fechadeentrega: parameter.fechadeentrega || '',
        hora: parameter.hora || '',
        resumendelcarrito: parameter.resumendelcarrito || '',
        cantidad: parameter.cantidad || '0',
        total: parameter.total || ''
      };
    } else if (postData && postData.contents) {
      // Si viene como JSON (respaldo)
      try {
        datos = JSON.parse(postData.contents);
      } catch (err) {
        Logger.log('Error al parsear JSON: ' + err.toString());
        datos = {};
      }
    } else {
      // Si no hay datos, intentar obtenerlos directamente
      datos = {
        nombre: parameter ? (parameter.nombre || '') : '',
        direccion: parameter ? (parameter.direccion || '') : '',
        telefono: parameter ? (parameter.telefono || '') : '',
        correoelectronico: parameter ? (parameter.correoelectronico || '') : '',
        email: parameter ? (parameter.email || '') : '',
        mensaje: parameter ? (parameter.mensaje || '') : '',
        fechadeentrega: parameter ? (parameter.fechadeentrega || '') : '',
        hora: parameter ? (parameter.hora || '') : '',
        resumendelcarrito: parameter ? (parameter.resumendelcarrito || '') : '',
        cantidad: parameter ? (parameter.cantidad || '0') : '0',
        total: parameter ? (parameter.total || '') : ''
      };
    }
    
    Logger.log('Datos procesados: ' + JSON.stringify(datos));
    
    // Validar que hay datos para guardar
    if (!datos || Object.keys(datos).length === 0) {
      Logger.log('ERROR: No se recibieron datos para guardar');
      throw new Error('No se recibieron datos para guardar');
    }
    
    // Detectar si es un formulario de contacto o de pedido
    // Si tiene "email" pero NO tiene "direccion" ni "fechadeentrega", es un contacto
    const esContacto = (datos.email && !datos.direccion && !datos.fechadeentrega);
    
    if (esContacto) {
      Logger.log('Detectado como formulario de CONTACTO');
      // Crear un evento modificado solo con los campos de contacto
      const eventoContacto = {
        parameter: {
          nombre: datos.nombre,
          telefono: datos.telefono,
          email: datos.email
        }
      };
      return doPostContacto(eventoContacto);
    }
    
    Logger.log('Detectado como formulario de PEDIDO');
    
    // Abrir la hoja de cálculo
    // Primero intenta obtener la hoja activa (si el script está vinculado a la hoja)
    let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Si no hay hoja activa (script en proyecto independiente), usar el ID
    if (!spreadsheet && SPREADSHEET_ID) {
      Logger.log('No hay hoja activa, intentando abrir por ID: ' + SPREADSHEET_ID);
      try {
        spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
        Logger.log('Hoja abierta exitosamente por ID');
      } catch (error) {
        Logger.log('ERROR al abrir por ID: ' + error.toString());
        throw new Error('No se pudo abrir la hoja de cálculo por ID. Verifica que el SPREADSHEET_ID sea correcto.');
      }
    }
    
    if (!spreadsheet) {
      Logger.log('ERROR: No se pudo abrir la hoja de cálculo');
      Logger.log('Si el script está en un proyecto independiente, asegúrate de configurar SPREADSHEET_ID');
      throw new Error('No se pudo abrir la hoja de cálculo. Si el script está en un proyecto independiente, configura SPREADSHEET_ID.');
    }
    
    Logger.log('Hoja de cálculo abierta: ' + spreadsheet.getName());
    
    // Listar todas las hojas disponibles para depuración
    const todasLasHojas = spreadsheet.getSheets();
    Logger.log('Hojas disponibles en el libro:');
    todasLasHojas.forEach(function(hoja) {
      Logger.log('  - ' + hoja.getName());
    });
    
    // Buscar la hoja con el nombre correcto
    let sheet = spreadsheet.getSheetByName('Antojo de Carnes frias');
    
    // Si no existe, intentar variaciones del nombre
    if (!sheet) {
      Logger.log('No se encontró "Antojo de Carnes frias", intentando variaciones...');
      sheet = spreadsheet.getSheetByName('Antojo de Carnes frías');
    }
    if (!sheet) {
      sheet = spreadsheet.getSheetByName('Antojo de Carnes Frias');
    }
    
    // Si aún no existe, crearla
    if (!sheet) {
      Logger.log('La hoja "Antojo de Carnes frias" no existe, creándola...');
      sheet = spreadsheet.insertSheet('Antojo de Carnes frias');
      // Agregar encabezados en el orden correcto
      sheet.appendRow([
        'Nombre',
        'Direccion',
        'Telefono',
        'Correo Electronico',
        'Fecha de Entrega',
        'Hora',
        'Resumen del Carrito',
        'Cantidad',
        'Total'
      ]);
      Logger.log('Hoja creada exitosamente');
    } else {
      Logger.log('Hoja encontrada: ' + sheet.getName());
      
      // Verificar si los encabezados son correctos
      const encabezadosEsperados = ['Nombre', 'Direccion', 'Telefono', 'Correo Electronico', 'Fecha de Entrega', 'Hora', 'Resumen del Carrito', 'Cantidad', 'Total'];
      
      // Obtener la primera fila (encabezados)
      let primeraFila = [];
      try {
        const numColumnas = sheet.getLastColumn();
        if (numColumnas > 0) {
          primeraFila = sheet.getRange(1, 1, 1, numColumnas).getValues()[0];
        }
      } catch (error) {
        Logger.log('Error al leer primera fila: ' + error.toString());
        primeraFila = [];
      }
      
      Logger.log('Primera fila actual: ' + JSON.stringify(primeraFila));
      Logger.log('Encabezados esperados: ' + JSON.stringify(encabezadosEsperados));
      
      // Verificar si necesita actualizar encabezados
      let necesitaActualizar = false;
      
      if (sheet.getLastRow() === 0 || primeraFila.length === 0 || !primeraFila[0] || primeraFila[0] === '') {
        Logger.log('La hoja está vacía o la primera celda está vacía, agregando encabezados...');
        necesitaActualizar = true;
      } else {
        // Comparar encabezados (sin importar mayúsculas/minúsculas)
        const primerEncabezadoActual = String(primeraFila[0] || '').trim();
        const primerEncabezadoEsperado = encabezadosEsperados[0];
        
        if (primeraFila.length !== encabezadosEsperados.length || 
            primerEncabezadoActual.toLowerCase() !== primerEncabezadoEsperado.toLowerCase()) {
          Logger.log('Los encabezados no coinciden, actualizando...');
          Logger.log('Primer encabezado actual: "' + primerEncabezadoActual + '"');
          Logger.log('Primer encabezado esperado: "' + primerEncabezadoEsperado + '"');
          necesitaActualizar = true;
        }
      }
      
      // Actualizar encabezados si es necesario
      if (necesitaActualizar) {
        try {
          // Limpiar la primera fila si tiene datos antiguos
          const numColumnasActuales = sheet.getLastColumn();
          if (numColumnasActuales > 0) {
            sheet.getRange(1, 1, 1, numColumnasActuales).clearContent();
          }
          
          // Escribir los nuevos encabezados
          sheet.getRange(1, 1, 1, encabezadosEsperados.length).setValues([encabezadosEsperados]);
          Logger.log('Encabezados actualizados exitosamente');
        } catch (error) {
          Logger.log('ERROR al actualizar encabezados: ' + error.toString());
          throw error;
        }
      } else {
        Logger.log('Los encabezados ya son correctos, no se actualizan');
      }
    }
    
    // Preparar los datos para guardar
    const nombre = datos.nombre || '';
    const direccion = datos.direccion || '';
    const telefono = datos.telefono || '';
    const correoelectronico = datos.correoelectronico || '';
    const fechadeentrega = datos.fechadeentrega || '';
    const hora = datos.hora || '';
    const resumendelcarrito = datos.resumendelcarrito || '';
    const cantidad = datos.cantidad || '0';
    const total = datos.total || '';
    
    Logger.log('=== INICIANDO GUARDADO DE DATOS ===');
    Logger.log('Guardando datos en la hoja...');
    Logger.log('Nombre: ' + nombre);
    Logger.log('Dirección: ' + direccion);
    Logger.log('Teléfono: ' + telefono);
    Logger.log('Correo Electronico: ' + correoelectronico);
    Logger.log('Fecha de Entrega: ' + fechadeentrega);
    Logger.log('Hora: ' + hora);
    Logger.log('Resumen del Carrito: ' + resumendelcarrito);
    Logger.log('Cantidad: ' + cantidad);
    Logger.log('Total: ' + total);
    
    // Verificar que la hoja existe antes de agregar datos
    if (!sheet) {
      Logger.log('ERROR: No se pudo encontrar o crear la hoja');
      throw new Error('No se pudo encontrar o crear la hoja "Antojo de Carnes frias"');
    }
    
    Logger.log('Hoja verificada: ' + sheet.getName());
    Logger.log('Número de filas actuales en la hoja: ' + sheet.getLastRow());
    
    // Preparar la fila de datos según el orden de los encabezados
    // Orden: Nombre, Direccion, Telefono, Correo Electronico, Fecha de Entrega, Hora, Resumen del Carrito, Cantidad, Total
    const nuevaFila = [
      nombre,
      direccion,
      telefono,
      correoelectronico,
      fechadeentrega,
      hora,
      resumendelcarrito,
      cantidad,
      total
    ];
    
    Logger.log('Fila preparada: ' + JSON.stringify(nuevaFila));
    Logger.log('Número de columnas en la fila: ' + nuevaFila.length);
    
    // Verificar que la hoja tiene el número correcto de columnas
    const numColumnasHoja = sheet.getLastColumn();
    Logger.log('Número de columnas en la hoja: ' + numColumnasHoja);
    
    if (numColumnasHoja < nuevaFila.length) {
      Logger.log('ADVERTENCIA: La hoja tiene menos columnas de las esperadas. Ajustando...');
    }
    
    try {
      // Obtener la siguiente fila disponible (después de los encabezados)
      // Si getLastRow() devuelve 0, significa que la hoja está vacía, así que escribimos en la fila 2 (después de encabezados)
      // Si getLastRow() devuelve 1, significa que solo hay encabezados, así que escribimos en la fila 2
      // Si getLastRow() devuelve > 1, escribimos en la siguiente fila
      const ultimaFila = sheet.getLastRow();
      const siguienteFila = ultimaFila === 0 ? 2 : ultimaFila + 1;
      
      Logger.log('Última fila con datos: ' + ultimaFila);
      Logger.log('Escribiendo en la fila: ' + siguienteFila);
      Logger.log('Datos a escribir: ' + JSON.stringify(nuevaFila));
      
      // Asegurarse de que tenemos suficientes columnas
      const numColumnasNecesarias = nuevaFila.length;
      const numColumnasActuales = sheet.getLastColumn();
      
      if (numColumnasActuales < numColumnasNecesarias) {
        Logger.log('Ajustando número de columnas de ' + numColumnasActuales + ' a ' + numColumnasNecesarias);
      }
      
      // Escribir la fila usando setValues para tener más control
      sheet.getRange(siguienteFila, 1, 1, nuevaFila.length).setValues([nuevaFila]);
      
      Logger.log('✓ Fila escrita en el rango: ' + siguienteFila + ':1:' + siguienteFila + ':' + nuevaFila.length);
      
      // Forzar que se guarden los cambios
      SpreadsheetApp.flush();
      
      Logger.log('✓ Cambios guardados (flush ejecutado)');
      Logger.log('Nuevo número de filas en la hoja: ' + sheet.getLastRow());
      
      // Verificar que los datos se escribieron correctamente
      const filaEscrita = sheet.getRange(siguienteFila, 1, 1, nuevaFila.length).getValues()[0];
      Logger.log('Datos verificados en la hoja (fila ' + siguienteFila + '): ' + JSON.stringify(filaEscrita));
      
      // Verificar que los datos coinciden
      let datosCoinciden = true;
      for (let i = 0; i < nuevaFila.length; i++) {
        if (String(filaEscrita[i] || '') !== String(nuevaFila[i] || '')) {
          Logger.log('ADVERTENCIA: Dato en columna ' + (i + 1) + ' no coincide. Esperado: "' + nuevaFila[i] + '", Obtenido: "' + filaEscrita[i] + '"');
          datosCoinciden = false;
        }
      }
      
      if (datosCoinciden) {
        Logger.log('✓ Todos los datos se escribieron correctamente');
      } else {
        Logger.log('⚠️ Algunos datos no coinciden, pero la fila fue escrita');
      }
      
    } catch (error) {
      Logger.log('ERROR al agregar fila: ' + error.toString());
      Logger.log('Stack trace: ' + error.stack);
      Logger.log('Tipo de error: ' + typeof error);
      throw error;
    }
    
    Logger.log('Datos guardados exitosamente en la hoja');
    
    // Retornar respuesta exitosa
    Logger.log('Proceso completado exitosamente');
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Datos guardados correctamente',
      datosRecibidos: datos
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Registrar el error completo
    Logger.log('ERROR: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    
    // Retornar error con más detalles
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      message: 'Error al guardar los datos: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función doGet para responder cuando se accede a la URL directamente
 * Esto ayuda a verificar que el script está desplegado correctamente
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Google Apps Script está funcionando correctamente. Usa POST para enviar datos del formulario.',
    instrucciones: 'Este script recibe datos mediante POST desde el formulario de pedidos.'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Función de prueba para verificar que el script funciona
 * IMPORTANTE: Ejecuta esta función desde el editor, NO ejecutes doPost directamente
 * Selecciona "test" en el menú desplegable y haz clic en "Ejecutar"
 */
function test() {
  try {
    // Simular datos que vienen del formulario HTML
    const mockEvent = {
      parameter: {
        nombre: 'Prueba',
        direccion: 'Dirección de prueba',
        telefono: '3311234567',
        correoelectronico: 'test@test.com',
        fechadeentrega: '15 de enero de 2025',
        hora: '14:00',
        resumendelcarrito: 'Antojo Mixta Pequeña - Cantidad: 1 - Precio unitario: $430.00 - Subtotal: $430.00',
        cantidad: '1',
        total: '$430.00'
      }
    };
    
    Logger.log('=== INICIANDO PRUEBA ===');
    const result = doPost(mockEvent);
    Logger.log('Resultado de la prueba:');
    Logger.log(result.getContent());
    Logger.log('=== PRUEBA COMPLETADA ===');
  } catch (error) {
    Logger.log('ERROR en la prueba: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * Función para recibir datos del formulario de contacto
 * Guarda los datos en la hoja "Contactos"
 * 
 * Los datos esperados son:
 * - nombre: Nombre del contacto
 * - telefono: Teléfono del contacto
 * - email: Email del contacto
 * - mensaje: Mensaje del contacto
 */
function doPostContacto(e) {
  try {
    // Validar que el objeto e existe
    if (typeof e === 'undefined' || e === null) {
      Logger.log('ERROR: El objeto e (event) es undefined o null');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'No se recibió el objeto de evento'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Obtener los datos del POST
    let datos = {};
    const parameter = (e && typeof e === 'object') ? e.parameter : null;
    const postData = (e && typeof e === 'object') ? e.postData : null;
    
    Logger.log('Datos recibidos - e.parameter: ' + JSON.stringify(parameter || 'undefined'));
    Logger.log('Datos recibidos - e.postData: ' + JSON.stringify(postData || 'undefined'));
    
    // Los datos vienen en e.parameter cuando se envía como formulario
    if (parameter && typeof parameter === 'object' && Object.keys(parameter).length > 0) {
      datos = {
        nombre: parameter.nombre || '',
        telefono: parameter.telefono || '',
        email: parameter.email || '',
        mensaje: parameter.mensaje || ''
      };
    } else if (postData && postData.contents) {
      // Si viene como JSON
      try {
        datos = JSON.parse(postData.contents);
      } catch (err) {
        Logger.log('Error al parsear JSON: ' + err.toString());
        datos = {};
      }
    }
    
    Logger.log('Datos procesados: ' + JSON.stringify(datos));
    
    // Validar que hay datos para guardar
    if (!datos || Object.keys(datos).length === 0) {
      Logger.log('ERROR: No se recibieron datos para guardar');
      throw new Error('No se recibieron datos para guardar');
    }
    
    // Abrir la hoja de cálculo
    let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Si no hay hoja activa (script en proyecto independiente), usar el ID
    if (!spreadsheet && SPREADSHEET_ID) {
      Logger.log('No hay hoja activa, intentando abrir por ID: ' + SPREADSHEET_ID);
      try {
        spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
        Logger.log('Hoja abierta exitosamente por ID');
      } catch (error) {
        Logger.log('ERROR al abrir por ID: ' + error.toString());
        throw new Error('No se pudo abrir la hoja de cálculo por ID. Verifica que el SPREADSHEET_ID sea correcto.');
      }
    }
    
    if (!spreadsheet) {
      Logger.log('ERROR: No se pudo abrir la hoja de cálculo');
      throw new Error('No se pudo abrir la hoja de cálculo.');
    }
    
    Logger.log('Hoja de cálculo abierta: ' + spreadsheet.getName());
    
    // Buscar o crear la hoja "Contactos"
    let sheet = spreadsheet.getSheetByName('Contactos');
    
    if (!sheet) {
      Logger.log('La hoja "Contactos" no existe, creándola...');
      sheet = spreadsheet.insertSheet('Contactos');
      // Agregar encabezados
      sheet.appendRow([
        'Nombre',
        'Telefono',
        'Email',
        'Fecha'
      ]);
      Logger.log('Hoja creada exitosamente');
    } else {
      Logger.log('Hoja encontrada: ' + sheet.getName());
      
      // Verificar si los encabezados son correctos
      const encabezadosEsperados = ['Nombre', 'Telefono', 'Email', 'Fecha'];
      
      // Obtener la primera fila (encabezados)
      let primeraFila = [];
      try {
        const numColumnas = sheet.getLastColumn();
        if (numColumnas > 0) {
          primeraFila = sheet.getRange(1, 1, 1, numColumnas).getValues()[0];
        }
      } catch (error) {
        Logger.log('Error al leer primera fila: ' + error.toString());
        primeraFila = [];
      }
      
      // Verificar si necesita actualizar encabezados
      let necesitaActualizar = false;
      
      if (sheet.getLastRow() === 0 || primeraFila.length === 0 || !primeraFila[0] || primeraFila[0] === '') {
        Logger.log('La hoja está vacía, agregando encabezados...');
        necesitaActualizar = true;
      } else {
        const primerEncabezadoActual = String(primeraFila[0] || '').trim();
        const primerEncabezadoEsperado = encabezadosEsperados[0];
        
        if (primeraFila.length !== encabezadosEsperados.length || 
            primerEncabezadoActual.toLowerCase() !== primerEncabezadoEsperado.toLowerCase()) {
          Logger.log('Los encabezados no coinciden, actualizando...');
          necesitaActualizar = true;
        }
      }
      
      // Actualizar encabezados si es necesario
      if (necesitaActualizar) {
        try {
          const numColumnasActuales = sheet.getLastColumn();
          if (numColumnasActuales > 0) {
            sheet.getRange(1, 1, 1, numColumnasActuales).clearContent();
          }
          sheet.getRange(1, 1, 1, encabezadosEsperados.length).setValues([encabezadosEsperados]);
          Logger.log('Encabezados actualizados exitosamente');
        } catch (error) {
          Logger.log('ERROR al actualizar encabezados: ' + error.toString());
          throw error;
        }
      }
    }
    
    // Preparar los datos para guardar
    const nombre = datos.nombre || '';
    const telefono = datos.telefono || '';
    const email = datos.email || '';
    const mensaje = datos.mensaje || '';
    const fecha = new Date().toLocaleString('es-MX', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    Logger.log('=== INICIANDO GUARDADO DE CONTACTO ===');
    Logger.log('Nombre: ' + nombre);
    Logger.log('Teléfono: ' + telefono);
    Logger.log('Email: ' + email);
    Logger.log('Mensaje: ' + mensaje);
    Logger.log('Fecha: ' + fecha);
    
    // Preparar la fila de datos
    const nuevaFila = [
      nombre,
      telefono,
      email,
      mensaje,
      fecha
    ];
    
    Logger.log('Fila preparada: ' + JSON.stringify(nuevaFila));
    
    // Escribir la fila
    const ultimaFila = sheet.getLastRow();
    const siguienteFila = ultimaFila === 0 ? 2 : ultimaFila + 1;
    
    sheet.getRange(siguienteFila, 1, 1, nuevaFila.length).setValues([nuevaFila]);
    SpreadsheetApp.flush();
    
    Logger.log('✓ Contacto guardado exitosamente en la fila: ' + siguienteFila);
    
    // Retornar respuesta exitosa
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Contacto guardado correctamente',
      datosRecibidos: datos
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      message: 'Error al guardar el contacto: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función de prueba para el formulario de contacto
 */
function testContacto() {
  try {
    const mockEvent = {
      parameter: {
        nombre: 'Prueba Contacto',
        telefono: '3311234567',
        email: 'contacto@test.com'
      }
    };
    
    Logger.log('=== INICIANDO PRUEBA DE CONTACTO ===');
    const result = doPostContacto(mockEvent);
    Logger.log('Resultado de la prueba:');
    Logger.log(result.getContent());
    Logger.log('=== PRUEBA COMPLETADA ===');
  } catch (error) {
    Logger.log('ERROR en la prueba: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
  }
}







