// Interactive tourism map with search, filter, and animated popups
let wisataMap
let wisataMarkers = []
let allWisataData = []
let wisataRoutingControl = null
let wisataUserMarker = null

function initializeWisataMap() {
  // Initialize main map
  wisataMap = window.L.map("wisataMap").setView([-7.5626, 110.8282], 13)

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(wisataMap)

  // Load all tourism data
  allWisataData = window.getAllWisata()

  // Display all markers initially
  displayWisataMarkers(allWisataData)

  // Populate list
  populateWisataList(allWisataData)

  // Update count
  updateWisataCount(allWisataData.length)
}

function displayWisataMarkers(data) {
  // Clear existing markers
  wisataMarkers.forEach((marker) => wisataMap.removeLayer(marker))
  wisataMarkers = []

  if (data.length === 0) {
    alert("Tidak ada destinasi wisata ditemukan")
    return
  }

  // Create markers for each destination
  data.forEach((wisata) => {
    const icon = getCategoryIcon(wisata.kategori)
    const marker = window.L.marker([wisata.lat, wisata.lng], { icon }).addTo(wisataMap)

    // Create custom popup with animation
    const popupContent = createPopupContent(wisata)
    marker.bindPopup(popupContent, {
      maxWidth: 350,
      className: "wisata-popup-animated",
    })

    // Store marker with data
    marker.wisataData = wisata
    wisataMarkers.push(marker)
  })

  // Fit map to show all markers
  if (data.length > 0) {
    const group = window.L.featureGroup(wisataMarkers)
    wisataMap.fitBounds(group.getBounds().pad(0.1))
  }
}

function createPopupContent(wisata) {
  const popupId = `popup-${wisata.id || Date.now()}`;
  return `
    <div style="min-width: 280px; max-width: 320px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      ${wisata.foto ? `
        <div style="position: relative; margin: -14px -14px 12px -14px; overflow: hidden; border-radius: 8px 8px 0 0;">
          <img src="${wisata.foto}" alt="${wisata.nama}" 
            style="width: 100%; height: 160px; object-fit: cover; cursor: pointer; transition: transform 0.3s ease;"
            onclick="window.openImageFullscreen('${wisata.foto}', '${wisata.nama}')"
            onmouseover="this.style.transform='scale(1.05)'"
            onmouseout="this.style.transform='scale(1)'"
          >
          <span style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.95); color: #333; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;">${wisata.kategori}</span>
        </div>
      ` : `
        <div style="position: relative; margin: -14px -14px 12px -14px; background: linear-gradient(135deg, #64748b 0%, #475569 100%); height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 8px 8px 0 0;">
          <span style="font-size: 32px;">${getCategoryEmoji(wisata.kategori)}</span>
          <span style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.95); color: #333; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;">${wisata.kategori}</span>
        </div>
      `}
      <div style="padding: 0 4px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #1e293b;">${wisata.nama}</h3>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b; line-height: 1.5;">${wisata.deskripsi || 'Tidak ada deskripsi'}</p>
        <div style="display: flex; flex-direction: column; gap: 6px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
          ${wisata.jamOperasional ? `
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569;">
              <span style="width: 20px; text-align: center;">&#128337;</span>
              <span>${wisata.jamOperasional}</span>
            </div>
          ` : ''}
          ${wisata.hargaTiket ? `
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569;">
              <span style="width: 20px; text-align: center;">&#128181;</span>
              <span>Rp ${wisata.hargaTiket}</span>
            </div>
          ` : ''}
          <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569;">
            <span style="width: 20px; text-align: center;">&#128205;</span>
            <span>${wisata.lat.toFixed(4)}, ${wisata.lng.toFixed(4)}</span>
          </div>
          ${wisata.kontak ? `
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569;">
              <span style="width: 20px; text-align: center;">&#128222;</span>
              <span>${wisata.kontak}</span>
            </div>
          ` : ''}
        </div>
        <button onclick="window.routeToWisata(${wisata.lat}, ${wisata.lng}, '${wisata.nama.replace(/'/g, "\\'")}')" 
          style="margin-top: 12px; padding: 10px 16px; background: linear-gradient(135deg, #7fa998 0%, #6d8a7c 100%); color: white; border: none; border-radius: 8px; cursor: pointer; width: 100%; font-weight: 600; font-size: 13px; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(127, 169, 152, 0.3);"
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(127, 169, 152, 0.4)'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(127, 169, 152, 0.3)'"
        >
          Arahkan ke Lokasi
        </button>
      </div>
    </div>
  `;
}

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

function getCategoryIcon(kategori) {
  const iconMap = {
    Alam: { color: "#10b981", emoji: "🌳" },
    Budaya: { color: "#f59e0b", emoji: "🎭" },
    Kuliner: { color: "#ef4444", emoji: "🍴" },
    Edukasi: { color: "#3b82f6", emoji: "📚" },
    Religi: { color: "#8b5cf6", emoji: "🕌" },
  }

  const iconData = iconMap[kategori] || { color: "#64748b", emoji: "📍" }

  return window.L.divIcon({
    html: `
      <div style="
        background: ${iconData.color};
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 20px;
        ">${iconData.emoji}</span>
      </div>
    `,
    className: "wisata-marker-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })
}

function populateWisataList(data) {
  const listContainer = document.getElementById("wisataList")

  if (data.length === 0) {
    listContainer.innerHTML = `
      <div class="wisata-list-empty">
        <p>Belum ada destinasi wisata</p>
        <a href="admin-wisata.html" class="btn-add-wisata-small">+ Tambah Destinasi</a>
      </div>
    `
    return
  }

  listContainer.innerHTML = ""

  data.forEach((wisata, index) => {
    const item = document.createElement("div")
    item.className = "wisata-list-item"
    item.innerHTML = `
      <div class="wisata-list-item-content">
        ${
          wisata.foto
            ? `
          <img src="${wisata.foto}" alt="${wisata.nama}" class="wisata-list-thumbnail">
        `
            : `
          <div class="wisata-list-placeholder">${getCategoryEmoji(wisata.kategori)}</div>
        `
        }
        <div class="wisata-list-info">
          <h4>${wisata.nama}</h4>
          <span class="wisata-list-category">${wisata.kategori}</span>
        </div>
      </div>
    `

    // Click to zoom to marker and open popup
    item.onclick = () => {
      const marker = wisataMarkers[index]
      if (marker) {
        wisataMap.setView([wisata.lat, wisata.lng], 16, {
          animate: true,
          duration: 0.5,
        })
        setTimeout(() => {
          marker.openPopup()
        }, 500)
      }
    }

    listContainer.appendChild(item)
  })
}

function getCategoryEmoji(kategori) {
  const emojiMap = {
    Alam: "🌳",
    Budaya: "🎭",
    Kuliner: "🍴",
    Edukasi: "📚",
    Religi: "🕌",
  }
  return emojiMap[kategori] || "📍"
}

function updateWisataCount(count) {
  document.getElementById("wisataCount").textContent = count
}

window.searchWisataMap = () => {
  const searchText = document.getElementById("searchWisata").value.toLowerCase().trim()
  const selectedCategory = document.getElementById("filterKategori").value

  let filteredData = allWisataData

  // Filter by category
  if (selectedCategory) {
    filteredData = filteredData.filter((w) => w.kategori === selectedCategory)
  }

  // Filter by name
  if (searchText) {
    filteredData = filteredData.filter(
      (w) => w.nama.toLowerCase().includes(searchText) || w.deskripsi.toLowerCase().includes(searchText),
    )
  }

  // Display filtered results
  displayWisataMarkers(filteredData)
  populateWisataList(filteredData)
  updateWisataCount(filteredData.length)

  // Specific destination search - zoom and open popup
  if (searchText && filteredData.length === 1) {
    const wisata = filteredData[0]
    wisataMap.setView([wisata.lat, wisata.lng], 16, {
      animate: true,
      duration: 0.5,
    })
    setTimeout(() => {
      wisataMarkers[0].openPopup()
    }, 500)
  } else if (filteredData.length === 0) {
    alert("Tidak ada destinasi wisata yang ditemukan")
  } else if (selectedCategory && !searchText) {
    // Category filter only - show info
    alert(`Ditemukan ${filteredData.length} destinasi wisata ${selectedCategory}`)
  }
}

window.resetWisataSearch = () => {
  document.getElementById("searchWisata").value = ""
  document.getElementById("filterKategori").value = ""

  displayWisataMarkers(allWisataData)
  populateWisataList(allWisataData)
  updateWisataCount(allWisataData.length)
}

// Get user location for wisata map
window.getUserLocationWisataMap = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Remove old user marker
        if (wisataUserMarker) {
          wisataMap.removeLayer(wisataUserMarker);
        }

        // User icon
        const userIcon = window.L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        // Add user marker
        wisataUserMarker = window.L.marker([userLat, userLng], { icon: userIcon })
          .addTo(wisataMap)
          .bindPopup('📍 Lokasi Anda')
          .openPopup();

        // Pan to user location
        wisataMap.setView([userLat, userLng], 15);
      },
      (error) => {
        alert('Tidak dapat mengakses lokasi Anda. Pastikan GPS aktif.');
      }
    );
  } else {
    alert('Browser Anda tidak mendukung geolocation');
  }
}

// Route to wisata
window.routeToWisata = function(lat, lng, nama) {
  if (!wisataUserMarker) {
    alert('Silakan aktifkan lokasi Anda terlebih dahulu dengan klik tombol "Lokasi Saya"');
    return;
  }

  // Remove old route
  if (wisataRoutingControl) {
    wisataMap.removeControl(wisataRoutingControl);
  }

  const userLatLng = wisataUserMarker.getLatLng();

  // Create routing
  wisataRoutingControl = window.L.Routing.control({
    waypoints: [
      window.L.latLng(userLatLng.lat, userLatLng.lng),
      window.L.latLng(parseFloat(lat), parseFloat(lng))
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    showAlternatives: false,
    lineOptions: {
      styles: [{ color: '#7fa998', weight: 5 }]
    },
    createMarker: () => null
  }).addTo(wisataMap);

  // Event when route is found
  wisataRoutingControl.on('routesfound', (e) => {
    const routes = e.routes;
    const summary = routes[0].summary;
    const distance = (summary.totalDistance / 1000).toFixed(2);
    const time = Math.round(summary.totalTime / 60);
    alert(`Rute ke ${nama}: ${distance} km, estimasi ${time} menit`);
  });
}

// Clear route
window.clearWisataRoute = function() {
  if (wisataRoutingControl) {
    wisataMap.removeControl(wisataRoutingControl);
    wisataRoutingControl = null;
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeWisataMap()
})
