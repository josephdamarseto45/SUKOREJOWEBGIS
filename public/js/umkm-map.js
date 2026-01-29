// Interactive UMKM map with search, filter, and animated popups
let umkmMap
let umkmMarkers = []
let allUMKMData = []
let umkmRoutingControl = null
let umkmUserMarker = null

function initializeUMKMMap() {
  // Initialize main map
  umkmMap = window.L.map("umkmMap").setView([-7.5626, 110.8282], 13)

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(umkmMap)

  // Load all UMKM data
  allUMKMData = window.getAllUMKM()

  // Display all markers initially
  displayUMKMMarkers(allUMKMData)

  // Populate list
  populateUMKMList(allUMKMData)

  // Update count
  updateUMKMCount(allUMKMData.length)
}

function displayUMKMMarkers(data) {
  // Clear existing markers
  umkmMarkers.forEach((marker) => umkmMap.removeLayer(marker))
  umkmMarkers = []

  if (data.length === 0) {
    alert("Tidak ada UMKM ditemukan")
    return
  }

  // Create markers for each UMKM
  data.forEach((umkm) => {
    const icon = getJenisIcon(umkm.jenis)
    const marker = window.L.marker([umkm.lat, umkm.lng], { icon }).addTo(umkmMap)

    // Create custom popup with animation
    const popupContent = createPopupContent(umkm)
    marker.bindPopup(popupContent, {
      maxWidth: 350,
      className: "wisata-popup-animated",
    })

    // Store marker with data
    marker.umkmData = umkm
    umkmMarkers.push(marker)
  })

  // Fit map to show all markers
  if (data.length > 0) {
    const group = window.L.featureGroup(umkmMarkers)
    umkmMap.fitBounds(group.getBounds().pad(0.1))
  }
}

function createPopupContent(umkm) {
  return `
    <div style="min-width: 280px; max-width: 320px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      ${umkm.foto ? `
        <div style="position: relative; margin: -14px -14px 12px -14px; overflow: hidden; border-radius: 8px 8px 0 0;">
          <img src="${umkm.foto}" alt="${umkm.nama}" 
            style="width: 100%; height: 160px; object-fit: cover; cursor: pointer; transition: transform 0.3s ease;"
            onclick="window.openImageFullscreen('${umkm.foto}', '${umkm.nama}')"
            onmouseover="this.style.transform='scale(1.05)'"
            onmouseout="this.style.transform='scale(1)'"
          >
          <span style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.95); color: #333; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;">${umkm.jenis}</span>
        </div>
      ` : `
        <div style="position: relative; margin: -14px -14px 12px -14px; background: linear-gradient(135deg, #64748b 0%, #475569 100%); height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 8px 8px 0 0;">
          <span style="font-size: 32px;">${getJenisEmoji(umkm.jenis)}</span>
          <span style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.95); color: #333; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;">${umkm.jenis}</span>
        </div>
      `}
      <div style="padding: 0 4px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #1e293b;">${umkm.nama}</h3>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b; line-height: 1.5;">${umkm.deskripsi || 'Tidak ada deskripsi'}</p>
        <div style="display: flex; flex-direction: column; gap: 6px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
          ${umkm.alamat ? `
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569;">
              <span style="width: 20px; text-align: center;">📍</span>
              <span>${umkm.alamat}</span>
            </div>
          ` : ''}
          <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569;">
            <span style="width: 20px; text-align: center;">🗺</span>
            <span>${umkm.lat.toFixed(4)}, ${umkm.lng.toFixed(4)}</span>
          </div>
          ${umkm.kontak ? `
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569;">
              <span style="width: 20px; text-align: center;">📞</span>
              <a href="https://wa.me/${umkm.kontak.replace(/\D/g, '')}" target="_blank" style="color: #059669; text-decoration: none; font-weight: 500;">
                ${umkm.kontak}
              </a>
            </div>
          ` : ''}
        </div>
        <button onclick="window.routeToUMKM(${umkm.lat}, ${umkm.lng}, '${umkm.nama.replace(/'/g, "\\'")}')" 
          style="margin-top: 12px; padding: 10px 16px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; border: none; border-radius: 8px; cursor: pointer; width: 100%; font-weight: 600; font-size: 13px; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);"
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(5, 150, 105, 0.4)'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(5, 150, 105, 0.3)'"
        >
          🧭 Arahkan ke Lokasi
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

function getJenisIcon(jenis) {
  const iconMap = {
    Kuliner: { color: "#ef4444", emoji: "🍜" },
    Kerajinan: { color: "#f59e0b", emoji: "🎨" },
    Pertanian: { color: "#10b981", emoji: "🌾" },
    Jasa: { color: "#3b82f6", emoji: "🛠" },
    Lainnya: { color: "#64748b", emoji: "📍" },
  }

  const iconData = iconMap[jenis] || { color: "#64748b", emoji: "📍" }

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

function populateUMKMList(data) {
  const listContainer = document.getElementById("umkmList")

  if (data.length === 0) {
    listContainer.innerHTML = `
      <div class="wisata-list-empty">
        <p>Belum ada UMKM</p>
        <a href="admin.html" class="btn-add-wisata-small">+ Tambah UMKM</a>
      </div>
    `
    return
  }

  listContainer.innerHTML = ""

  data.forEach((umkm, index) => {
    const item = document.createElement("div")
    item.className = "wisata-list-item"
    item.innerHTML = `
      <div class="wisata-list-item-content">
        ${
          umkm.foto
            ? `
          <img src="${umkm.foto}" alt="${umkm.nama}" class="wisata-list-thumbnail">
        `
            : `
          <div class="wisata-list-placeholder">${getJenisEmoji(umkm.jenis)}</div>
        `
        }
        <div class="wisata-list-info">
          <h4>${umkm.nama}</h4>
          <span class="wisata-list-category">${umkm.jenis}</span>
        </div>
      </div>
    `

    // Click to zoom to marker and open popup
    item.onclick = () => {
      const marker = umkmMarkers[index]
      if (marker) {
        umkmMap.setView([umkm.lat, umkm.lng], 16, {
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

function getJenisEmoji(jenis) {
  const emojiMap = {
    Kuliner: "🍜",
    Kerajinan: "🎨",
    Pertanian: "🌾",
    Jasa: "🛠",
    Lainnya: "📍",
  }
  return emojiMap[jenis] || "📍"
}

function updateUMKMCount(count) {
  document.getElementById("umkmCount").textContent = count
}

window.searchUMKMMap = () => {
  const searchText = document.getElementById("searchUMKM").value.toLowerCase().trim()
  const selectedJenis = document.getElementById("filterJenis").value

  let filteredData = allUMKMData

  // Filter by jenis
  if (selectedJenis) {
    filteredData = filteredData.filter((u) => u.jenis === selectedJenis)
  }

  // Filter by name
  if (searchText) {
    filteredData = filteredData.filter(
      (u) => u.nama.toLowerCase().includes(searchText) || 
             (u.deskripsi && u.deskripsi.toLowerCase().includes(searchText)) ||
             (u.alamat && u.alamat.toLowerCase().includes(searchText))
    )
  }

  // Display filtered results
  displayUMKMMarkers(filteredData)
  populateUMKMList(filteredData)
  updateUMKMCount(filteredData.length)

  // Specific UMKM search - zoom and open popup
  if (searchText && filteredData.length === 1) {
    const umkm = filteredData[0]
    umkmMap.setView([umkm.lat, umkm.lng], 16, {
      animate: true,
      duration: 0.5,
    })
    setTimeout(() => {
      umkmMarkers[0].openPopup()
    }, 500)
  } else if (filteredData.length === 0) {
    alert("Tidak ada UMKM yang ditemukan")
  } else if (selectedJenis && !searchText) {
    // Jenis filter only - show info
    alert(`Ditemukan ${filteredData.length} UMKM ${selectedJenis}`)
  }
}

window.resetUMKMSearch = () => {
  document.getElementById("searchUMKM").value = ""
  document.getElementById("filterJenis").value = ""

  displayUMKMMarkers(allUMKMData)
  populateUMKMList(allUMKMData)
  updateUMKMCount(allUMKMData.length)
}

// Get user location for UMKM map
window.getUserLocationUMKMMap = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Remove old user marker
        if (umkmUserMarker) {
          umkmMap.removeLayer(umkmUserMarker);
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
        umkmUserMarker = window.L.marker([userLat, userLng], { icon: userIcon })
          .addTo(umkmMap)
          .bindPopup('📍 Lokasi Anda')
          .openPopup();

        // Pan to user location
        umkmMap.setView([userLat, userLng], 15);
      },
      (error) => {
        alert('Tidak dapat mengakses lokasi Anda. Pastikan GPS aktif.');
      }
    );
  } else {
    alert('Browser Anda tidak mendukung geolocation');
  }
}

// Route to UMKM
window.routeToUMKM = function(lat, lng, nama) {
  if (!umkmUserMarker) {
    alert('Silakan aktifkan lokasi Anda terlebih dahulu dengan klik tombol "Lokasi Saya"');
    return;
  }

  // Remove old route
  if (umkmRoutingControl) {
    umkmMap.removeControl(umkmRoutingControl);
  }

  const userLatLng = umkmUserMarker.getLatLng();

  // Create routing
  umkmRoutingControl = window.L.Routing.control({
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
      styles: [{ color: '#059669', weight: 5 }]
    },
    createMarker: () => null
  }).addTo(umkmMap);

  // Event when route is found
  umkmRoutingControl.on('routesfound', (e) => {
    const routes = e.routes;
    const summary = routes[0].summary;
    const distance = (summary.totalDistance / 1000).toFixed(2);
    const time = Math.round(summary.totalTime / 60);
    alert(`Rute ke ${nama}: ${distance} km, estimasi ${time} menit`);
  });
}

// Clear route
window.clearUMKMRoute = function() {
  if (umkmRoutingControl) {
    umkmMap.removeControl(umkmRoutingControl);
    umkmRoutingControl = null;
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeUMKMMap()
})
