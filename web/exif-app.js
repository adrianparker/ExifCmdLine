import { processFileExifBrowser } from '../src/browserAdapter.js'

const form = document.getElementById('exif-form')
const fileInput = document.getElementById('file-input')
const zoneInput = document.getElementById('zone-input')

// Populate timezone dropdown from the browser's own IANA zone list
;(function populateZones () {
  const none = document.createElement('option')
  none.value = ''
  none.textContent = '— No timezone —'
  zoneInput.appendChild(none)

  Intl.supportedValuesOf('timeZone').forEach(tz => {
    const opt = document.createElement('option')
    opt.value = tz
    opt.textContent = tz
    zoneInput.appendChild(opt)
  })
})()
const allInput = document.getElementById('all-input')
const statusEl = document.getElementById('status')
const resultsBody = document.getElementById('results-body')
const zoneTh = document.getElementById('zone-th')
const dropZone = document.getElementById('drop-zone')
const searchInput = document.getElementById('search-input')
const selectedImagePreview = document.getElementById('selected-image-preview')

let selectedImageUrl = null

function setStatus (message, isError = false, isSuccess = false) {
  statusEl.textContent = message
  statusEl.classList.toggle('error', isError)
  statusEl.classList.toggle('success', isSuccess)
}

function clearResults () {
  resultsBody.innerHTML = ''
}

function clearPreview () {
  if (selectedImageUrl) {
    URL.revokeObjectURL(selectedImageUrl)
    selectedImageUrl = null
  }

  selectedImagePreview.innerHTML = ''
  selectedImagePreview.hidden = true
}

function renderPreview (file) {
  clearPreview()

  selectedImageUrl = URL.createObjectURL(file)

  const image = document.createElement('img')
  image.className = 'selected-image-preview__image'
  image.alt = file.name ? ('Selected photo: ' + file.name) : 'Selected photo'
  image.src = selectedImageUrl

  selectedImagePreview.appendChild(image)
  selectedImagePreview.hidden = false
}

function renderResults (rows) {
  clearResults()

  if (!rows.length) {
    setStatus('No EXIF fields found for this file.', false, true)
    return
  }

  const hasZone = zoneInput.value !== ''
  zoneTh.hidden = !hasZone

  const fragment = document.createDocumentFragment()
  rows.forEach(([key, value, zone]) => {
    const tr = document.createElement('tr')

    const keyTd = document.createElement('td')
    keyTd.textContent = key

    const valueTd = document.createElement('td')
    valueTd.textContent = typeof value === 'object' && value !== null
      ? JSON.stringify(value)
      : String(value)

    const zoneTd = document.createElement('td')
    zoneTd.hidden = !hasZone
    zoneTd.textContent = zone ?? ''

    tr.appendChild(keyTd)
    tr.appendChild(valueTd)
    tr.appendChild(zoneTd)
    fragment.appendChild(tr)
  })

  resultsBody.appendChild(fragment)
  applyFilter()
  setStatus('Rendered ' + rows.length + ' EXIF rows.', false, true)
}

function runSafely (action) {
  Promise.resolve(action()).catch((error) => {
    setStatus(error?.message || 'Unexpected error.', true)
  })
}

async function handleFile (file) {
  if (!file) {
    clearPreview()
    setStatus('Please select an image file.', true)
    return
  }

  if (file.type && !file.type.startsWith('image/')) {
    clearPreview()
    setStatus('Please select an image file.', true)
    return
  }

  try {
    renderPreview(file)
    setStatus('Reading EXIF...')

    const zone = zoneInput.value || null
    const rows = await processFileExifBrowser(file, zone, allInput.checked)
    renderResults(rows)
  } catch (error) {
    clearPreview()
    setStatus(error.message || 'Failed to read EXIF.', true)
  }
}

function resetUI () {
  clearResults()
  clearPreview()
  setStatus('')
  zoneInput.value = ''
  allInput.checked = true
  searchInput.value = ''
}

fileInput.addEventListener('change', () => {
  resetUI()
  runSafely(() => handleFile(fileInput.files[0]))
})

function applyFilter () {
  const term = searchInput.value.toLowerCase()
  Array.from(resultsBody.rows).forEach(row => {
    const key = row.cells[0].textContent.toLowerCase()
    const value = row.cells[1].textContent.toLowerCase()
    row.hidden = term.length > 0 && !key.includes(term) && !value.includes(term)
  })
}

searchInput.addEventListener('input', applyFilter)

allInput.addEventListener('change', () => {
  if (fileInput.files[0]) {
    runSafely(() => handleFile(fileInput.files[0]))
  }
})

zoneInput.addEventListener('change', () => {
  if (fileInput.files[0]) {
    runSafely(() => handleFile(fileInput.files[0]))
  }
})

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault()
  dropZone.classList.add('active')
})

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('active')
})

dropZone.addEventListener('drop', (event) => {
  event.preventDefault()
  dropZone.classList.remove('active')

  const file = event.dataTransfer?.files?.[0]

  if (file) {
    const dt = new DataTransfer()
    dt.items.add(file)
    fileInput.files = dt.files
  }

  runSafely(() => handleFile(file))
})
