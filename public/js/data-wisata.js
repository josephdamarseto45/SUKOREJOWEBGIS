// Data Wisata - menggunakan Supabase database via API
const WISATA_STORAGE_KEY = "wisata_desa_sukorejo"
const WISATA_API_BASE = "/api/wisata"

// Cache untuk data
let wisataCache = null
let wisataCacheTimestamp = null
const WISATA_CACHE_DURATION = 5000 // 5 seconds cache

// Fungsi untuk load data dari API
async function loadWisataFromAPI() {
  try {
    const response = await fetch(WISATA_API_BASE)
    if (!response.ok) throw new Error("Failed to fetch wisata data")
    const data = await response.json()
    
    // Transform API data to match frontend format
    return data.map(item => ({
      id: item.id,
      nama: item.nama,
      kategori: item.kategori,
      deskripsi: item.deskripsi,
      alamat: item.alamat,
      lat: item.koordinat?.lat || -7.5626,
      lng: item.koordinat?.lng || 110.8282,
      kontak: item.kontak,
      foto: item.gambar?.[0] || "",
      foto_list: item.gambar || [],
      video_list: item.video ? [item.video] : [],
      jamOperasional: item.jam_operasional || "06:00 - 18:00",
      hargaTiket: item.harga_tiket || "Gratis",
    }))
  } catch (error) {
    console.error("Error loading wisata data:", error)
    // Fallback to localStorage if API fails
    return loadWisataFromLocalStorage()
  }
}

// Fallback: load from localStorage
function loadWisataFromLocalStorage() {
  const data = localStorage.getItem(WISATA_STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// Save to localStorage (backup)
function saveWisataToLocalStorage(data) {
  localStorage.setItem(WISATA_STORAGE_KEY, JSON.stringify(data))
}

// Initialize data
window.initializeWisataData = async () => {
  try {
    const data = await loadWisataFromAPI()
    saveWisataToLocalStorage(data)
    wisataCache = data
    wisataCacheTimestamp = Date.now()
  } catch (error) {
    console.error("Error initializing wisata data:", error)
  }
}

// Get all wisata (sync - returns cached/localStorage data)
window.getAllWisata = () => {
  if (wisataCache && wisataCacheTimestamp && (Date.now() - wisataCacheTimestamp < WISATA_CACHE_DURATION)) {
    return wisataCache
  }
  return loadWisataFromLocalStorage()
}

// Get all wisata (async - fetches from API)
window.getAllWisataAsync = async () => {
  const data = await loadWisataFromAPI()
  wisataCache = data
  wisataCacheTimestamp = Date.now()
  saveWisataToLocalStorage(data)
  return data
}

// Get wisata by ID (sync)
window.getWisataById = (id) => {
  const allWisata = window.getAllWisata()
  return allWisata.find((w) => w.id === Number.parseInt(id) || w.id === id)
}

// Get wisata by ID (async)
window.getWisataByIdAsync = async (id) => {
  const allWisata = await loadWisataFromAPI()
  return allWisata.find((w) => w.id === Number.parseInt(id) || w.id === id)
}

// Add new wisata
window.addNewWisata = async (wisata) => {
  try {
    const response = await fetch(WISATA_API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: wisata.nama,
        kategori: wisata.kategori,
        deskripsi: wisata.deskripsi,
        alamat: wisata.alamat,
        koordinat: { lat: wisata.lat, lng: wisata.lng },
        kontak: wisata.kontak,
        gambar: wisata.foto_list || (wisata.foto ? [wisata.foto] : []),
        video: wisata.video_list?.[0] || null,
      }),
    })
    
    if (!response.ok) throw new Error("Failed to add wisata")
    const newData = await response.json()
    
    // Invalidate cache
    wisataCache = null
    wisataCacheTimestamp = null
    
    return {
      id: newData.id,
      nama: newData.nama,
      kategori: newData.kategori,
      deskripsi: newData.deskripsi,
      alamat: newData.alamat,
      lat: newData.koordinat?.lat,
      lng: newData.koordinat?.lng,
      kontak: newData.kontak,
      foto: newData.gambar?.[0] || "",
      foto_list: newData.gambar || [],
      video_list: newData.video ? [newData.video] : [],
    }
  } catch (error) {
    console.error("Error adding wisata:", error)
    // Fallback to localStorage
    const allWisata = loadWisataFromLocalStorage()
    const newId = allWisata.length > 0 ? Math.max(...allWisata.map((w) => w.id)) + 1 : 1
    wisata.id = newId
    allWisata.push(wisata)
    saveWisataToLocalStorage(allWisata)
    return wisata
  }
}

// Update wisata by ID
window.updateWisataById = async (id, updatedWisata) => {
  try {
    const response = await fetch(WISATA_API_BASE, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id,
        nama: updatedWisata.nama,
        kategori: updatedWisata.kategori,
        deskripsi: updatedWisata.deskripsi,
        alamat: updatedWisata.alamat,
        koordinat: { lat: updatedWisata.lat, lng: updatedWisata.lng },
        kontak: updatedWisata.kontak,
        gambar: updatedWisata.foto_list || (updatedWisata.foto ? [updatedWisata.foto] : []),
        video: updatedWisata.video_list?.[0] || null,
      }),
    })
    
    if (!response.ok) throw new Error("Failed to update wisata")
    
    // Invalidate cache
    wisataCache = null
    wisataCacheTimestamp = null
    
    return true
  } catch (error) {
    console.error("Error updating wisata:", error)
    // Fallback to localStorage
    const allWisata = loadWisataFromLocalStorage()
    const index = allWisata.findIndex((w) => w.id === Number.parseInt(id))
    if (index !== -1) {
      allWisata[index] = { ...allWisata[index], ...updatedWisata, id: Number.parseInt(id) }
      saveWisataToLocalStorage(allWisata)
      return true
    }
    return false
  }
}

// Delete wisata by ID
window.deleteWisataById = async (id) => {
  try {
    const response = await fetch(`${WISATA_API_BASE}?id=${id}`, {
      method: "DELETE",
    })
    
    if (!response.ok) throw new Error("Failed to delete wisata")
    
    // Invalidate cache
    wisataCache = null
    wisataCacheTimestamp = null
    
    return true
  } catch (error) {
    console.error("Error deleting wisata:", error)
    // Fallback to localStorage
    const allWisata = loadWisataFromLocalStorage()
    const filtered = allWisata.filter((w) => w.id !== Number.parseInt(id))
    saveWisataToLocalStorage(filtered)
    return true
  }
}

// Initialize data on load
window.initializeWisataData()
