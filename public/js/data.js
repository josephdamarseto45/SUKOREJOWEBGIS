// Data UMKM - menggunakan Supabase database via API
const DATA_KEY = "umkm_data"
const API_BASE = "/api/umkm"

// Cache untuk data
let umkmCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5000 // 5 seconds cache

// Fungsi untuk load data dari API
async function loadDataFromAPI() {
  try {
    const response = await fetch(API_BASE)
    if (!response.ok) throw new Error("Failed to fetch data")
    const data = await response.json()
    
    // Transform API data to match frontend format
    return data.map(item => ({
      id: item.id,
      nama: item.nama,
      jenis: item.jenis,
      kategori: item.jenis, // alias
      alamat: item.alamat,
      lokasi: item.alamat, // alias
      lat: item.koordinat?.lat || -7.4186,
      lng: item.koordinat?.lng || 110.9758,
      deskripsi: item.deskripsi,
      kontak: item.kontak,
      gambar: item.gambar?.[0] || null,
      gambar_list: item.gambar || [],
      video_list: item.video ? [item.video] : [],
    }))
  } catch (error) {
    console.error("Error loading UMKM data:", error)
    // Fallback to localStorage if API fails
    return loadDataFromLocalStorage()
  }
}

// Fallback: load from localStorage
function loadDataFromLocalStorage() {
  const data = localStorage.getItem(DATA_KEY)
  if (data) {
    return JSON.parse(data)
  }
  return []
}

// Fungsi untuk save data ke localStorage (backup)
function saveDataToLocalStorage(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
}

// Fungsi untuk get semua UMKM (async)
window.getAllUMKM = function getAllUMKM() {
  // Return cached data if still valid
  if (umkmCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return umkmCache
  }
  // Return from localStorage as immediate fallback
  return loadDataFromLocalStorage()
}

// Async version untuk get semua UMKM
window.getAllUMKMAsync = async function getAllUMKMAsync() {
  const data = await loadDataFromAPI()
  umkmCache = data
  cacheTimestamp = Date.now()
  saveDataToLocalStorage(data) // Backup to localStorage
  return data
}

// Fungsi untuk add UMKM baru
window.addNewUMKM = async function addNewUMKM(umkm) {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: umkm.nama,
        jenis: umkm.jenis || umkm.kategori,
        deskripsi: umkm.deskripsi,
        alamat: umkm.alamat || umkm.lokasi,
        koordinat: { lat: umkm.lat, lng: umkm.lng },
        kontak: umkm.kontak,
        gambar: umkm.gambar_list || (umkm.gambar ? [umkm.gambar] : []),
        video: umkm.video_list?.[0] || null,
      }),
    })
    
    if (!response.ok) throw new Error("Failed to add UMKM")
    const newData = await response.json()
    
    // Invalidate cache
    umkmCache = null
    cacheTimestamp = null
    window.dispatchEvent(new Event("umkmDataChanged"))
    
    return {
      id: newData.id,
      nama: newData.nama,
      jenis: newData.jenis,
      kategori: newData.jenis,
      alamat: newData.alamat,
      lokasi: newData.alamat,
      lat: newData.koordinat?.lat,
      lng: newData.koordinat?.lng,
      deskripsi: newData.deskripsi,
      kontak: newData.kontak,
      gambar: newData.gambar?.[0] || null,
      gambar_list: newData.gambar || [],
      video_list: newData.video ? [newData.video] : [],
    }
  } catch (error) {
    console.error("Error adding UMKM:", error)
    // Fallback to localStorage
    const data = loadDataFromLocalStorage()
    const newId = data.length > 0 ? Math.max(...data.map((u) => u.id)) + 1 : 1
    umkm.id = newId
    data.push(umkm)
    saveDataToLocalStorage(data)
    window.dispatchEvent(new Event("umkmDataChanged"))
    return umkm
  }
}

// Fungsi untuk update UMKM
window.updateUMKMData = async function updateUMKMData(id, updatedUMKM) {
  try {
    const response = await fetch(API_BASE, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id,
        nama: updatedUMKM.nama,
        jenis: updatedUMKM.jenis || updatedUMKM.kategori,
        deskripsi: updatedUMKM.deskripsi,
        alamat: updatedUMKM.alamat || updatedUMKM.lokasi,
        koordinat: { lat: updatedUMKM.lat, lng: updatedUMKM.lng },
        kontak: updatedUMKM.kontak,
        gambar: updatedUMKM.gambar_list || (updatedUMKM.gambar ? [updatedUMKM.gambar] : []),
        video: updatedUMKM.video_list?.[0] || null,
      }),
    })
    
    if (!response.ok) throw new Error("Failed to update UMKM")
    
    // Invalidate cache
    umkmCache = null
    cacheTimestamp = null
    window.dispatchEvent(new Event("umkmDataChanged"))
    
    return true
  } catch (error) {
    console.error("Error updating UMKM:", error)
    // Fallback to localStorage
    const data = loadDataFromLocalStorage()
    const index = data.findIndex((u) => u.id === id)
    if (index !== -1) {
      data[index] = { ...data[index], ...updatedUMKM }
      saveDataToLocalStorage(data)
      window.dispatchEvent(new Event("umkmDataChanged"))
      return true
    }
    return false
  }
}

// Fungsi untuk delete UMKM
window.deleteUMKMData = async function deleteUMKMData(id) {
  try {
    const response = await fetch(`${API_BASE}?id=${id}`, {
      method: "DELETE",
    })
    
    if (!response.ok) throw new Error("Failed to delete UMKM")
    
    // Invalidate cache
    umkmCache = null
    cacheTimestamp = null
    window.dispatchEvent(new Event("umkmDataChanged"))
    
    return true
  } catch (error) {
    console.error("Error deleting UMKM:", error)
    // Fallback to localStorage
    const data = loadDataFromLocalStorage()
    const filtered = data.filter((u) => u.id !== id)
    saveDataToLocalStorage(filtered)
    window.dispatchEvent(new Event("umkmDataChanged"))
    return true
  }
}

// Fungsi untuk get UMKM by ID
window.getUMKMById = function getUMKMById(id) {
  const data = loadDataFromLocalStorage()
  return data.find((u) => u.id === id || u.id === parseInt(id))
}

// Async version untuk get UMKM by ID
window.getUMKMByIdAsync = async function getUMKMByIdAsync(id) {
  const data = await loadDataFromAPI()
  return data.find((u) => u.id === id || u.id === parseInt(id))
}

// Initialize: load data from API on page load
(async function initializeUMKMData() {
  try {
    const data = await loadDataFromAPI()
    saveDataToLocalStorage(data)
    umkmCache = data
    cacheTimestamp = Date.now()
    window.dispatchEvent(new Event("umkmDataChanged"))
  } catch (error) {
    console.error("Error initializing UMKM data:", error)
  }
})()
