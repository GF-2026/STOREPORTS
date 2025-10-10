// ======================
// VARIABLES GLOBALES
// ======================
let currentSignatureField = null;
let signatureDataCus = '';
let signatureDataEsp = '';
const storageKey = 'records_arranque';

// Canvas de firma
const modal = document.getElementById('signatureModal');
const signatureCanvas = document.getElementById('signatureCanvas');
const ctx = signatureCanvas.getContext('2d');
let drawing = false;

// ======================
// FUNCIONES DE UTILIDAD
// ======================
function get(id) {
  return document.getElementById(id)?.value || '';
}

function chk(id) {
  return document.getElementById(id)?.checked ? 'Sí' : 'No';
}

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
document.getElementById('clearSignature').onclick = () => {
  ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
};

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

// Abrir modal
document.getElementById('openSignatureCus').onclick = () => openSignature('cus');
document.getElementById('openSignatureEsp').onclick = () => openSignature('esp');

// ======================
// GUARDAR REGISTRO
// ======================
document.getElementById('saveBtn').onclick = () => {
  const record = {
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
    // CHECKBOXES
    marking: chk('marking'),
    voltage_plate: chk('voltage_plate'),
    shock_free: chk('shock_free'),
    pallets: chk('pallets'),
    unpack: chk('unpack'),
    supplies_installed: chk('supplies_installed'),
    specs_available: chk('specs_available'),
    refrigerant: chk('refrigerant'),
    manuals: chk('manuals'),
    // FIRMAS Y NOMBRES
    name_cus: get('name_cus'),
    name_esp: get('name_esp'),
    notes: get('notes'),
    signature_cus: signatureDataCus,
    signature_esp: signatureDataEsp
  };

  let records = JSON.parse(localStorage.getItem(storageKey) || '[]');
  records.push(record);
  localStorage.setItem(storageKey, JSON.stringify(records));

  alert('✅ Registro guardado correctamente.');
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
  const records = JSON.parse(localStorage.getItem(storageKey) || '[]');

  tableHead.innerHTML = '';
  tableBody.innerHTML = '';

  if (records.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5">No hay registros aún</td></tr>';
    return;
  }

  const headers = Object.keys(records[0]);
  tableHead.innerHTML = headers.map(h => `<th>${h}</th>`).join('');

  for (const r of records) {
    const row = document.createElement('tr');
    row.innerHTML = headers.map(h =>
      h.includes('signature')
        ? `<td><canvas width="100" height="50"></canvas></td>`
        : `<td>${r[h] || ''}</td>`
    ).join('');
    tableBody.appendChild(row);

    // Mostrar miniaturas de firma
    headers.forEach((h, i) => {
      if (h.includes('signature') && r[h]) {
        const canvas = row.children[i].querySelector('canvas');
        const img = new Image();
        img.onload = () => canvas.getContext('2d').drawImage(img, 0, 0, 100, 50);
        img.src = r[h];
      }
    });
  }
}
loadTable();

// ======================
// EXPORTAR A EXCEL (.XLSX)
// ======================
document.getElementById('exportBtn').onclick = () => {
  const records = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!records.length) return alert('No hay registros para exportar.');

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(records);
  XLSX.utils.book_append_sheet(wb, ws, 'Registros');
  XLSX.writeFile(wb, 'RegistrosArranque.xlsx');
};
