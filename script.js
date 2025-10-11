// ======================
// VARIABLES GLOBALES
// ======================
let currentSignatureField = null;
let signatureDataCus = '';
let signatureDataEsp = '';
const storageKey = 'records_arranque';
const enableDeleteButton = true; // Cambia a false para ocultar el botón borrar

// Canvas de firma
const modal = document.getElementById('signatureModal');
const signatureCanvas = document.getElementById('signatureCanvas');
const ctx = signatureCanvas.getContext('2d');
let drawing = false;

// ======================
// FUNCIONES AUXILIARES
// ======================
function get(id) {
  return document.getElementById(id)?.value || '';
}

function chk(id) {
  return document.getElementById(id)?.checked ? 'Sí' : 'No';
}

function getRecords() {
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
}

// ======================
// GENERAR FOLIO AUTOMÁTICO
// ======================
function generateFolio() {
  const company = get('company') || 'SinEmpresa';
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  return `StartReport-${company}-${date}-${time}`;
}

// ======================
// FUNCIONES DE FIRMA
// ======================
function openSignature(field) {
  currentSignatureField = field;
  ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  modal.style.display = 'flex';
}

function closeSignature() {
  modal.style.display = 'none';
  currentSignatureField = null;
}

// ======================
// EVENTOS DE DIBUJO
// ======================

// Mouse
signatureCanvas.addEventListener('mousedown', e => {
  drawing = true;
  const rect = signatureCanvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});
signatureCanvas.addEventListener('mousemove', e => {
  if (!drawing) return;
  const rect = signatureCanvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
});
signatureCanvas.addEventListener('mouseup', () => drawing = false);
signatureCanvas.addEventListener('mouseout', () => drawing = false);

// Touch
signatureCanvas.addEventListener('touchstart', e => {
  e.preventDefault();
  drawing = true;
  const rect = signatureCanvas.getBoundingClientRect();
  const touch = e.touches[0];
  ctx.beginPath();
  ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
});
signatureCanvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!drawing) return;
  const rect = signatureCanvas.getBoundingClientRect();
  const touch = e.touches[0];
  ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
  ctx.stroke();
});
signatureCanvas.addEventListener('touchend', () => drawing = false);
signatureCanvas.addEventListener('touchcancel', () => drawing = false);

// ======================
// BOTONES DE FIRMA
// ======================
document.getElementById('clearSignature').onclick = () =>
  ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);

document.getElementById('saveSignature').onclick = () => {
  const dataURL = signatureCanvas.toDataURL();
  let previewCanvas;

  if (currentSignatureField === 'cus') {
    signatureDataCus = dataURL;
    previewCanvas = document.getElementById('signaturePreviewCus');
  } else if (currentSignatureField === 'esp') {
    signatureDataEsp = dataURL;
    previewCanvas = document.getElementById('signaturePreviewEsp');
  }

  if (previewCanvas) {
    const previewCtx = previewCanvas.getContext('2d');
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    const img = new Image();
    img.onload = () => previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
    img.src = dataURL;
  }

  closeSignature();
};

document.getElementById('closeSignature').onclick = closeSignature;
document.getElementById('openSignatureCus').onclick = () => openSignature('cus');
document.getElementById('openSignatureEsp').onclick = () => openSignature('esp');

// ======================
// GUARDAR REGISTRO
// ======================
document.getElementById('saveBtn').onclick = () => {
  const folio = generateFolio();

  const record = {
    folio,
    OT: get('OT'),
    datetime: get('datetime'),
    company: get('company'),
    engineer: get('engineer'),
    phone: get('phone'),
    city: get('city'),
    description: get('description'),
    brand: get('brand'),
    model: get('model'),
    serial: get('serial'),
    controlnum: get('controlnum'),
    status: get('status'),
    ubication: get('ubication'),
    temperature: get('temperature'),
    humidity: get('humidity'),
    marking: chk('marking'),
    voltage_plate: chk('voltage_plate'),
    shock_free: chk('shock_free'),
    pallets: chk('pallets'),
    unpack: chk('unpack'),
    supplies_installed: chk('supplies_installed'),
    specs_available: chk('specs_available'),
    refrigerant: chk('refrigerant'),
    manuals: chk('manuals'),
    name_cus: get('name_cus'),
    name_esp: get('name_esp'),
    notes: get('notes'),
    signature_cus: signatureDataCus,
    signature_esp: signatureDataEsp
  };

  const records = getRecords();
  records.push(record);
  localStorage.setItem(storageKey, JSON.stringify(records));

  alert(`✅ Registro guardado correctamente.\nFolio: ${folio}`);
  loadTable();
};

// ======================
// LIMPIAR FORMULARIO
// ======================
document.getElementById('clearBtn').onclick = () => {
  document.getElementById('reportForm').reset();
  signatureDataCus = '';
  signatureDataEsp = '';
  document.getElementById('signaturePreviewCus').getContext('2d').clearRect(0, 0, 300, 150);
  document.getElementById('signaturePreviewEsp').getContext('2d').clearRect(0, 0, 300, 150);
};

// ======================
// CARGAR TABLA
// ======================
function loadTable() {
  const tableHead = document.getElementById('tableHead');
  const tableBody = document.getElementById('tableBody');
  const records = getRecords();

  tableHead.innerHTML = '';
  tableBody.innerHTML = '';

  if (records.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5">No hay registros aún</td></tr>';
    return;
  }

  const headers = Object.keys(records[0]);
  tableHead.innerHTML = headers.map(h => `<th>${h}</th>`).join('');

  records.forEach(r => {
    const row = document.createElement('tr');
    row.innerHTML = headers.map(h =>
      h.includes('signature')
        ? `<td><canvas width="100" height="50"></canvas></td>`
        : `<td>${r[h] || ''}</td>`
    ).join('');
    tableBody.appendChild(row);

    headers.forEach((h, i) => {
      if (h.includes('signature') && r[h]) {
        const canvas = row.children[i].querySelector('canvas');
        const img = new Image();
        img.onload = () => canvas.getContext('2d').drawImage(img, 0, 0, 100, 50);
        img.src = r[h];
      }
    });
  });
}
loadTable();

// ======================
// DESCARGAR EXCEL (.XLSX)
// ======================
document.getElementById('downloadButton').onclick = () => {
  const records = getRecords();
  if (!records.length) return alert('No hay registros guardados para descargar.');

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(records);
  XLSX.utils.book_append_sheet(wb, ws, 'Registros');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `Registros_Arranque_${new Date().toISOString().slice(0,19).replace(/[-T:]/g,'')}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ======================
// ENVIAR CORREO (SIN ADJUNTO)
// ======================
document.getElementById('sendButton').onclick = () => {
  const records = getRecords();
  if (!records.length) return alert('No hay registros guardados para enviar.');

  const destinatario = "tck@olimp0.com"; 
  const asunto = encodeURIComponent("Reportes de arranque guardados");
  const cuerpo = encodeURIComponent(
`Hola,

Aquí te envío los registros técnicos guardados.
Si lo requieres, puedes adjuntar manualmente el archivo Excel que acabas de descargar.

Saludos.`
  );

  window.location.href = `mailto:${destinatario}?subject=${asunto}&body=${cuerpo}`;
};

// ======================
// BORRAR REGISTROS
// ======================
const deleteBtn = document.getElementById('deleteAllBtn');
if (deleteBtn) {
  deleteBtn.style.display = enableDeleteButton ? 'inline-block' : 'none';
  deleteBtn.onclick = () => {
    if (!enableDeleteButton) return;
    if (confirm('¿Seguro que deseas borrar todos los registros?')) {
      localStorage.removeItem(storageKey);
      loadTable();
    }
  };
}
