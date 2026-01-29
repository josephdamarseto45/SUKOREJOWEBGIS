// Import Leaflet library
const L = window.L

// Inisialisasi peta
let map
let userMarker
let routingControl
let umkmMarkers = []

// Koordinat default (center Sukorejo, Sragen)
const defaultCenter = [-7.4186, 110.9758]
const defaultZoom = 14

// Filter state variables
let currentSearchQuery = ""
let currentJenisFilter = ""

// Inisialisasi map
function initMap() {
  console.log("[v0] Initializing map...")

  if (map) {
    console.log("[v0] Map already initialized")
    return
  }

  map = L.map("map").setView(defaultCenter, defaultZoom)

  // Tambahkan OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map)

  console.log("[v0] Map initialized successfully")

  // Load UMKM markers
  loadUMKMMarkers()
}

// Get icon based on UMKM category
function getUMKMIcon(jenis) {
  const iconConfig = {
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: "custom-div-icon",
  }

  let color = "#64748b"
  let emoji = "📍"

  switch (jenis.toLowerCase()) {
    case "kuliner":
      color = "#ef4444"
      emoji = "🍜"
      break
    case "kerajinan":
      color = "#f59e0b"
      emoji = "🎨"
      break
    case "jasa":
      color = "#3b82f6"
      emoji = "🛠️"
      break
    case "pertanian":
      color = "#10b981"
      emoji = "🌾"
      break
    case "lainnya":
      color = "#64748b"
      emoji = "🏪"
      break
    default:
      color = "#64748b"
      emoji = "📍"
  }

  const iconHtml = `
    <div style="
      position: relative;
      width: 40px;
      height: 40px;
    ">
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 2px;
        left: 2px;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 20px;
          line-height: 1;
          display: block;
        ">${emoji}</span>
      </div>
    </div>
  `

  return L.divIcon({
    ...iconConfig,
    html: iconHtml,
  })
}

// Load semua marker UMKM
function loadUMKMMarkers() {
  console.log("[v0] Loading UMKM markers...")

  // Hapus marker lama
  umkmMarkers.forEach((marker) => map.removeLayer(marker))
  umkmMarkers = []

  const umkmData = window.getAllUMKM()
  console.log("[v0] UMKM data loaded:", umkmData.length, "items")

  let filteredData = umkmData

  // Filter by search query
  if (currentSearchQuery) {
    filteredData = filteredData.filter((umkm) => umkm.nama.toLowerCase().includes(currentSearchQuery.toLowerCase()))
  }

  // Filter by jenis
  if (currentJenisFilter) {
    filteredData = filteredData.filter((umkm) => umkm.jenis.toLowerCase() === currentJenisFilter.toLowerCase())
  }

  // Tambahkan marker untuk setiap UMKM
  filteredData.forEach((umkm) => {
    if (!umkm.lat || !umkm.lng) {
      console.log("[v0] Skipping UMKM with invalid coordinates:", umkm.nama)
      return
    }

    const umkmIcon = getUMKMIcon(umkm.jenis)

    const marker = L.marker([Number.parseFloat(umkm.lat), Number.parseFloat(umkm.lng)], { icon: umkmIcon }).addTo(map)

    const popupContent = `
      <div style="min-width: 220px; max-width: 320px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${umkm.foto ? `
          <div style="position: relative; margin: -14px -14px 12px -14px; overflow: hidden; border-radius: 8px 8px 0 0;">
            <img src="${umkm.foto}" alt="${umkm.nama}" 
              style="width: 100%; height: 140px; object-fit: cover; cursor: pointer; transition: transform 0.3s ease;"
              onclick="window.openImageFullscreen('${umkm.foto}', '${umkm.nama}')"
              onmouseover="this.style.transform='scale(1.05)'"
              onmouseout="this.style.transform='scale(1)'"
            >
            <span style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.95); color: #333; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;">${umkm.jenis}</span>
          </div>
        ` : `
          <div style="position: relative; margin: -14px -14px 12px -14px; background: linear-gradient(135deg, #64748b 0%, #475569 100%); height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 8px 8px 0 0;">
            <span style="font-size: 28px;">${getEmojiForJenis(umkm.jenis)}</span>
            <span style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.95); color: #333; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;">${umkm.jenis}</span>
          </div>
        `}
        <div style="padding: 0 4px;">
          <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #1e293b;">${umkm.nama}</h3>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 6px;">
            <span>&#128205;</span> ${umkm.alamat}
          </p>
          ${umkm.deskripsi ? `<p style="margin: 0 0 10px 0; font-size: 12px; color: #475569; line-height: 1.5; padding-top: 8px; border-top: 1px solid #e2e8f0;">${umkm.deskripsi}</p>` : ""}
          ${umkm.kontak ? `<p style="margin: 0 0 10px 0; font-size: 12px; color: #475569; display: flex; align-items: center; gap: 6px;"><span>&#128222;</span> ${umkm.kontak}</p>` : ""}
          <button onclick="window.routeToUMKM(${umkm.lat}, ${umkm.lng}, '${umkm.nama.replace(/'/g, "\\'")}')" 
            style="margin-top: 8px; padding: 10px 16px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border: none; border-radius: 8px; cursor: pointer; width: 100%; font-weight: 600; font-size: 13px; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(37, 99, 235, 0.4)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(37, 99, 235, 0.3)'"
          >
            Arahkan ke Lokasi
          </button>
        </div>
      </div>
    `

    marker.bindPopup(popupContent)
    umkmMarkers.push(marker)
  })

  const infoText = document.getElementById("info-text")
  if (infoText) {
    if (currentSearchQuery || currentJenisFilter) {
      infoText.textContent = `Ditemukan ${filteredData.length} UMKM dari total ${umkmData.length} UMKM. Klik marker untuk detail.`
    } else {
      infoText.textContent = `Total ${umkmData.length} UMKM ditemukan. Klik marker untuk detail.`
    }
  }

  console.log("[v0] Markers loaded:", umkmMarkers.length)

  loadUMKMList()
}

// Get lokasi user
function getUserLocation() {
  if (navigator.geolocation) {
    const infoText = document.getElementById("info-text")
    if (infoText) {
      infoText.textContent = "Mengambil lokasi Anda..."
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude

        console.log("[v0] User location:", userLat, userLng)

        // Hapus marker user lama
        if (userMarker) {
          map.removeLayer(userMarker)
        }

        // Icon untuk user
        const userIcon = L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })

        // Tambahkan marker user
        userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup("📍 Lokasi Anda").openPopup()

        // Pan ke lokasi user
        map.setView([userLat, userLng], 15)

        if (infoText) {
          infoText.textContent = "Lokasi Anda ditemukan! Klik marker UMKM untuk mendapatkan rute."
        }
      },
      (error) => {
        console.error("[v0] Geolocation error:", error)
        const infoText = document.getElementById("info-text")
        if (infoText) {
          infoText.textContent = "Tidak dapat mengakses lokasi Anda. Pastikan GPS aktif."
        }
      },
    )
  } else {
    alert("Browser Anda tidak mendukung geolocation")
  }
}

window.getUserLocation = getUserLocation

// Routing ke UMKM
function routeToUMKM(lat, lng, nama) {
  if (!userMarker) {
    alert('Silakan aktifkan lokasi Anda terlebih dahulu dengan klik tombol "Lokasi Saya"')
    return
  }

  console.log("[v0] Creating route to:", nama, lat, lng)

  // Hapus route lama
  if (routingControl) {
    map.removeControl(routingControl)
  }

  const userLatLng = userMarker.getLatLng()

  // Buat routing
  routingControl = L.Routing.control({
    waypoints: [L.latLng(userLatLng.lat, userLatLng.lng), L.latLng(Number.parseFloat(lat), Number.parseFloat(lng))],
    routeWhileDragging: false,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    showAlternatives: false,
    lineOptions: {
      styles: [{ color: "#2563eb", weight: 4 }],
    },
    createMarker: () => null, // Tidak perlu marker tambahan
  }).addTo(map)

  const infoText = document.getElementById("info-text")
  if (infoText) {
    infoText.textContent = `Menampilkan rute ke ${nama}`
  }

  // Event ketika route ditemukan
  routingControl.on("routesfound", (e) => {
    const routes = e.routes
    const summary = routes[0].summary
    const distance = (summary.totalDistance / 1000).toFixed(2)
    const time = Math.round(summary.totalTime / 60)

    if (infoText) {
      infoText.textContent = `Rute ke ${nama}: ${distance} km, estimasi ${time} menit`
    }
  })
}

window.routeToUMKM = routeToUMKM

// Clear route
function clearRoute() {
  if (routingControl) {
    map.removeControl(routingControl)
    routingControl = null

    const infoText = document.getElementById("info-text")
    if (infoText) {
      infoText.textContent = "Rute dihapus. Klik marker UMKM untuk melihat detail."
    }

    console.log("[v0] Route cleared")
  }
}

window.clearRoute = clearRoute

// Function to open image in fullscreen modal
window.openImageFullscreen = function(src, title) {
  // Remove existing modal if any
  const existingModal = document.getElementById('imageFullscreenModal');
  if (existingModal) existingModal.remove();
  
  // Create fullscreen modal
  const modal = document.createElement('div');
  modal.id = 'imageFullscreenModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    animation: fadeIn 0.3s ease;
  `;
  
  modal.innerHTML = `
    <style>
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    </style>
    <div style="position: relative; max-width: 90%; max-height: 90%; animation: zoomIn 0.3s ease;">
      <img src="${src}" alt="${title}" style="max-width: 100%; max-height: 85vh; border-radius: 8px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
      <p style="text-align: center; color: white; margin-top: 16px; font-size: 18px; font-weight: 500;">${title}</p>
    </div>
    <button onclick="this.parentElement.remove()" style="
      position: absolute;
      top: 20px;
      right: 20px;
      background: white;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    ">&times;</button>
  `;
  
  modal.onclick = function(e) {
    if (e.target === modal) modal.remove();
  };
  
  document.body.appendChild(modal);
}

function refreshMarkers() {
  if (map) {
    loadUMKMMarkers()
  }
}

window.refreshMarkers = refreshMarkers

function searchUMKM() {
  const searchInput = document.getElementById("searchInput")
  currentSearchQuery = searchInput.value.trim()

  if (currentSearchQuery) {
    // Find matching UMKM
    const umkmData = window.getAllUMKM()
    const foundUMKM = umkmData.filter((umkm) => umkm.nama.toLowerCase().includes(currentSearchQuery.toLowerCase()))

    // If exactly one UMKM found, zoom to it
    if (foundUMKM.length === 1) {
      const umkm = foundUMKM[0]
      if (umkm.lat && umkm.lng) {
        map.setView([Number.parseFloat(umkm.lat), Number.parseFloat(umkm.lng)], 17)

        // Find and open the marker popup
        umkmMarkers.forEach((marker) => {
          const markerPos = marker.getLatLng()
          if (markerPos.lat === Number.parseFloat(umkm.lat) && markerPos.lng === Number.parseFloat(umkm.lng)) {
            marker.openPopup()
          }
        })
      }
    } else if (foundUMKM.length > 1) {
      // Multiple results - fit bounds to show all
      const bounds = L.latLngBounds(foundUMKM.map((u) => [Number.parseFloat(u.lat), Number.parseFloat(u.lng)]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  loadUMKMMarkers()
}

window.searchUMKM = searchUMKM

function filterByJenis() {
  const jenisSelect = document.getElementById("jenisFilter")
  currentJenisFilter = jenisSelect.value
  loadUMKMMarkers()

  // If filter is active, zoom to show all filtered markers
  if (currentJenisFilter) {
    const umkmData = window.getAllUMKM()
    const filteredData = umkmData.filter((umkm) => umkm.jenis.toLowerCase() === currentJenisFilter.toLowerCase())

    if (filteredData.length > 0) {
      const bounds = L.latLngBounds(filteredData.map((u) => [Number.parseFloat(u.lat), Number.parseFloat(u.lng)]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }
}

window.filterByJenis = filterByJenis

// Function to load UMKM list in sidebar
function loadUMKMList() {
  const umkmData = window.getAllUMKM()
  let filteredData = umkmData

  // Apply filters
  if (currentSearchQuery) {
    filteredData = filteredData.filter((umkm) => umkm.nama.toLowerCase().includes(currentSearchQuery.toLowerCase()))
  }
  if (currentJenisFilter) {
    filteredData = filteredData.filter((umkm) => umkm.jenis.toLowerCase() === currentJenisFilter.toLowerCase())
  }

  const umkmList = document.getElementById("umkmList")
  const umkmCount = document.getElementById("umkmCount")

  if (umkmCount) {
    umkmCount.textContent = filteredData.length
  }

  if (!umkmList) return

  if (filteredData.length === 0) {
    umkmList.innerHTML = '<div class="list-empty">Tidak ada UMKM ditemukan</div>'
    return
  }

  umkmList.innerHTML = filteredData
    .map((umkm) => {
      const photoHtml = umkm.foto
        ? `<img src="${umkm.foto}" alt="${umkm.nama}" class="list-item-photo">`
        : `<div class="list-item-photo-placeholder">${getEmojiForJenis(umkm.jenis)}</div>`

      return `
      <div class="list-item" onclick="window.zoomToUMKM(${umkm.lat}, ${umkm.lng}, '${umkm.nama.replace(/'/g, "\\'")}')">
        ${photoHtml}
        <div class="list-item-content">
          <h4 class="list-item-title">${umkm.nama}</h4>
          <p class="list-item-jenis">${umkm.jenis}</p>
          <p class="list-item-alamat">${umkm.alamat}</p>
        </div>
      </div>
    `
    })
    .join("")
}

function getEmojiForJenis(jenis) {
  const emojiMap = {
    kuliner: "🍜",
    kerajinan: "🎨",
    pertanian: "🌾",
    jasa: "🛠️",
    lainnya: "🏪",
  }
  return emojiMap[jenis.toLowerCase()] || "📍"
}

window.zoomToUMKM = (lat, lng, nama) => {
  if (!lat || !lng) return

  map.setView([Number.parseFloat(lat), Number.parseFloat(lng)], 17)

  // Find and open popup
  setTimeout(() => {
    umkmMarkers.forEach((marker) => {
      const markerPos = marker.getLatLng()
      if (markerPos.lat === Number.parseFloat(lat) && markerPos.lng === Number.parseFloat(lng)) {
        marker.openPopup()
      }
    })
  }, 300)
}

window.performSearch = function performSearch() {
  const searchInput = document.getElementById("searchInput")
  const jenisSelect = document.getElementById("jenisFilter")

  currentSearchQuery = searchInput.value.trim()
  currentJenisFilter = jenisSelect.value

  console.log("[v0] Search triggered - Name:", currentSearchQuery, "Category:", currentJenisFilter)

  // Load markers with both filters applied
  loadUMKMMarkers()

  // Get filtered results
  const umkmData = window.getAllUMKM()
  let filteredData = umkmData

  // Apply name filter
  if (currentSearchQuery) {
    filteredData = filteredData.filter((umkm) => umkm.nama.toLowerCase().includes(currentSearchQuery.toLowerCase()))
  }

  // Apply category filter
  if (currentJenisFilter) {
    filteredData = filteredData.filter((umkm) => umkm.jenis.toLowerCase() === currentJenisFilter.toLowerCase())
  }

  console.log("[v0] Filtered results:", filteredData.length, "UMKM found")

  if (filteredData.length === 0) {
    alert("Tidak ada UMKM yang ditemukan dengan kriteria pencarian tersebut.")
    map.setView(defaultCenter, defaultZoom)
  } else if (filteredData.length === 1) {
    const umkm = filteredData[0]
    if (umkm.lat && umkm.lng) {
      map.setView([Number.parseFloat(umkm.lat), Number.parseFloat(umkm.lng)], 17)

      // Find and open the marker popup after a short delay
      setTimeout(() => {
        umkmMarkers.forEach((marker) => {
          const markerPos = marker.getLatLng()
          if (markerPos.lat === Number.parseFloat(umkm.lat) && markerPos.lng === Number.parseFloat(umkm.lng)) {
            marker.openPopup()
          }
        })
      }, 300)
    }
  } else {
    const validCoords = filteredData.filter((u) => u.lat && u.lng)
    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords.map((u) => [Number.parseFloat(u.lat), Number.parseFloat(u.lng)]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })

      // Show alert for category/multiple results
      if (currentJenisFilter) {
        alert(`Ditemukan ${filteredData.length} UMKM kategori ${currentJenisFilter}`)
      }
    }
  }

  loadUMKMList()
}

function resetFilter() {
  currentSearchQuery = ""
  currentJenisFilter = ""
  document.getElementById("searchInput").value = ""
  document.getElementById("jenisFilter").value = ""
  map.setView(defaultCenter, defaultZoom)
  loadUMKMMarkers()

  loadUMKMList()
}

window.resetFilter = resetFilter

// Initialize map saat halaman load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMap)
} else {
  initMap()
}
