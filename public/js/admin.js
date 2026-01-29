// Password admin - menggunakan Supabase database via API
const ADMIN_API_BASE = "/api/admin/settings"
let ADMIN_PASSCODE = "UMKMDESASUKOREJOMAJU" // Default fallback
const CRUD_PASSCODE = "EDITUMKM" // Ganti dengan passcode yang Anda inginkan
const EDIT_DELETE_PASSCODE = "DELETEUMKM" // Ganti dengan passcode yang Anda inginkan
const AUTH_KEY = "admin_authenticated"
const AUTH_TIMESTAMP = "admin_auth_time"
const SESSION_DURATION = 3600000 // 1 jam dalam milliseconds
const ADMIN_PASSWORD_STORAGE_KEY = "admin_umkm_password"

let mapPicker = null
let mapPickerEdit = null
let pickerMarker = null
let pickerMarkerEdit = null
let existingAddMarkers = []
let existingEditMarkers = []

const tableSearchQuery = ""
const tableJenisFilter = ""

// Load password from API
async function loadAdminPassword() {
  try {
    const response = await fetch(`${ADMIN_API_BASE}?type=umkm`)
    if (response.ok) {
      const data = await response.json()
      if (data.password_hash) {
        ADMIN_PASSCODE = data.password_hash
      }
    }
  } catch (error) {
    console.error("Error loading admin password:", error)
    // Fallback to localStorage
    if (localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY)) {
      ADMIN_PASSCODE = localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY)
    }
  }
}

// Initialize password on load
loadAdminPassword()

window.login = async () => {
  const password = document.getElementById("loginPassword").value

  if (!password) {
    alert("Mohon masukkan passcode!")
    return
  }

  try {
    // Verify password via API
    const response = await fetch(ADMIN_API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "umkm", password: password }),
    })
    
    const result = await response.json()
    
    if (result.valid) {
      const currentTime = new Date().getTime()
      localStorage.setItem(AUTH_KEY, "true")
      localStorage.setItem(AUTH_TIMESTAMP, currentTime.toString())
      showAdminPanel()
      document.getElementById("loginPassword").value = ""
    } else {
      alert("Passcode salah! Akses ditolak.")
      document.getElementById("loginPassword").value = ""
    }
  } catch (error) {
    console.error("Error verifying password:", error)
    // Fallback to local verification
    if (password === ADMIN_PASSCODE) {
      const currentTime = new Date().getTime()
      localStorage.setItem(AUTH_KEY, "true")
      localStorage.setItem(AUTH_TIMESTAMP, currentTime.toString())
      showAdminPanel()
      document.getElementById("loginPassword").value = ""
    } else {
      alert("Passcode salah! Akses ditolak.")
      document.getElementById("loginPassword").value = ""
    }
  }
}

window.logout = () => {
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(AUTH_TIMESTAMP)
  document.getElementById("loginSection").style.display = "flex"
  document.getElementById("adminSection").style.display = "none"
  document.getElementById("loginPassword").value = ""
}

// Change password functions for UMKM admin
window.openChangePasswordModalUMKM = () => {
  const passcode = prompt("Masukkan passcode untuk mengubah password:")
  if (passcode !== EDIT_DELETE_PASSCODE) {
    alert("Passcode salah! Anda tidak memiliki akses untuk mengubah password.")
    return
  }
  
  document.getElementById("changePasswordModalUMKM").style.display = "flex"
  document.getElementById("oldPasswordUMKM").value = ""
  document.getElementById("newPasswordUMKM").value = ""
  document.getElementById("confirmPasswordUMKM").value = ""
}

window.closeChangePasswordModalUMKM = () => {
  document.getElementById("changePasswordModalUMKM").style.display = "none"
}

window.changePasswordUMKM = async () => {
  const oldPassword = document.getElementById("oldPasswordUMKM").value
  const newPassword = document.getElementById("newPasswordUMKM").value
  const confirmPassword = document.getElementById("confirmPasswordUMKM").value

  if (!oldPassword || !newPassword || !confirmPassword) {
    alert("Semua field harus diisi!")
    return
  }

  if (newPassword.length < 6) {
    alert("Password baru minimal 6 karakter!")
    return
  }

  if (newPassword !== confirmPassword) {
    alert("Konfirmasi password tidak sesuai!")
    return
  }

  try {
    const response = await fetch(ADMIN_API_BASE, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "umkm",
        oldPassword: oldPassword,
        newPassword: newPassword,
      }),
    })
    
    const result = await response.json()
    
    if (response.ok && result.success) {
      ADMIN_PASSCODE = newPassword
      localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, newPassword)
      alert("Password berhasil diubah!")
      window.closeChangePasswordModalUMKM()
    } else {
      alert(result.error || "Gagal mengubah password!")
    }
  } catch (error) {
    console.error("Error changing password:", error)
    // Fallback to local verification
    if (oldPassword !== ADMIN_PASSCODE) {
      alert("Password lama tidak sesuai!")
      return
    }
    ADMIN_PASSCODE = newPassword
    localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, newPassword)
    alert("Password berhasil diubah!")
    window.closeChangePasswordModalUMKM()
  }
}

// Load stored password on page load (fallback)
if (localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY)) {
  ADMIN_PASSCODE = localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY)
}

// Cek login status saat load
document.addEventListener("DOMContentLoaded", () => {
  const isAuthenticated = localStorage.getItem(AUTH_KEY) === "true"
  const authTime = localStorage.getItem(AUTH_TIMESTAMP)

  if (isAuthenticated && authTime) {
    const currentTime = new Date().getTime()
    const elapsedTime = currentTime - Number.parseInt(authTime)

    // Check if session is still valid (within 1 hour)
    if (elapsedTime < SESSION_DURATION) {
      showAdminPanel()
    } else {
      // Session expired, clear authentication
      localStorage.removeItem(AUTH_KEY)
      localStorage.removeItem(AUTH_TIMESTAMP)
      alert("⏰ Sesi login Anda telah berakhir. Silakan login kembali.")
    }
  }
})

// Tampilkan admin panel
function showAdminPanel() {
  document.getElementById("loginSection").style.display = "none"
  document.getElementById("adminSection").style.display = "block"
  loadUMKMTable()

  // Initialize map picker after a short delay to ensure container is rendered
  setTimeout(() => {
    initMapPicker()
  }, 100)
}

function loadUMKMTable() {
  const umkmData = window.getAllUMKM()
  const tbody = document.getElementById("umkmTableBody")

  if (!umkmData || umkmData.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">Belum ada data UMKM</td></tr>'
    return
  }

  let filteredData = umkmData

  // Filter by search query
  if (tableSearchQuery) {
    filteredData = filteredData.filter((umkm) => umkm.nama.toLowerCase().includes(tableSearchQuery.toLowerCase()))
  }

  // Filter by jenis
  if (tableJenisFilter) {
    filteredData = filteredData.filter((umkm) => umkm.jenis.toLowerCase() === tableJenisFilter.toLowerCase())
  }

  if (filteredData.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">Tidak ada UMKM yang sesuai dengan pencarian</td></tr>'
    return
  }

  tbody.innerHTML = filteredData
    .map(
      (umkm, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${umkm.nama}</td>
            <td>${umkm.jenis}</td>
            <td>${umkm.alamat}</td>
            <td>${umkm.lat.toFixed(6)}, ${umkm.lng.toFixed(6)}</td>
            <td>
                <button class="btn-edit" onclick="window.editUMKM(${umkm.id})">✏️ Edit</button>
                <button class="btn-delete" onclick="window.deleteUMKM(${umkm.id}, '${umkm.nama.replace(/'/g, "\\'")}')">🗑️ Hapus</button>
            </td>
        </tr>
    `,
    )
    .join("")
}

window.addUMKM = (event) => {
  event.preventDefault()

  const fotoInput = document.getElementById("foto")
  let fotoData = null

  // Convert photo to base64 if provided
  if (fotoInput.files && fotoInput.files[0]) {
    const file = fotoInput.files[0]

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("❌ Ukuran foto terlalu besar! Maksimal 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      fotoData = e.target.result

      // Create UMKM object with photo
      const umkm = {
        nama: document.getElementById("nama").value,
        jenis: document.getElementById("jenis").value,
        alamat: document.getElementById("alamat").value,
        lat: Number.parseFloat(document.getElementById("lat").value),
        lng: Number.parseFloat(document.getElementById("lng").value),
        deskripsi: document.getElementById("deskripsi").value,
        foto: fotoData,
        kontak: document.getElementById("kontak").value,
      }

      window.addNewUMKM(umkm)
      loadUMKMTable()

      // Reset form
      document.getElementById("addForm").reset()
      document.getElementById("fotoPreview").innerHTML = ""

      if (pickerMarker) {
        mapPicker.removeLayer(pickerMarker)
        pickerMarker = null
      }
      document.getElementById("coordDisplay").innerHTML = "<strong>Koordinat:</strong> Belum dipilih"

      loadExistingMarkersToAddMap()

      alert(`✅ UMKM "${umkm.nama}" berhasil ditambahkan!`)
    }
    reader.readAsDataURL(file)
  } else {
    // No photo provided
    const umkm = {
      nama: document.getElementById("nama").value,
      jenis: document.getElementById("jenis").value,
      alamat: document.getElementById("alamat").value,
      lat: Number.parseFloat(document.getElementById("lat").value),
      lng: Number.parseFloat(document.getElementById("lng").value),
      deskripsi: document.getElementById("deskripsi").value,
      foto: null,
      kontak: document.getElementById("kontak").value,
    }

    window.addNewUMKM(umkm)
    loadUMKMTable()

    // Reset form
    document.getElementById("addForm").reset()

    if (pickerMarker) {
      mapPicker.removeLayer(pickerMarker)
      pickerMarker = null
    }
    document.getElementById("coordDisplay").innerHTML = "<strong>Koordinat:</strong> Belum dipilih"

    loadExistingMarkersToAddMap()

    alert(`✅ UMKM "${umkm.nama}" berhasil ditambahkan!`)
  }
}

// Edit UMKM
window.editUMKM = (id) => {
  // Prompt passcode sebelum edit
  const inputPasscode = prompt("🔒 Masukkan passcode untuk mengedit data UMKM:")

  if (!inputPasscode) {
    alert("Edit dibatalkan")
    return
  }

  if (inputPasscode !== CRUD_PASSCODE) {
    alert("❌ Passcode salah! Anda tidak memiliki akses untuk mengedit data.")
    return
  }

  const umkm = window.getUMKMById(id)
  if (!umkm) {
    alert("UMKM tidak ditemukan!")
    return
  }

  // Isi form edit
  document.getElementById("editId").value = umkm.id
  document.getElementById("editNama").value = umkm.nama
  document.getElementById("editJenis").value = umkm.jenis
  document.getElementById("editAlamat").value = umkm.alamat
  document.getElementById("editLat").value = umkm.lat
  document.getElementById("editLng").value = umkm.lng
  document.getElementById("editDeskripsi").value = umkm.deskripsi || ""
  document.getElementById("editKontak").value = umkm.kontak || ""

  const editFotoPreview = document.getElementById("editFotoPreview")
  if (umkm.foto) {
    editFotoPreview.innerHTML = `
      <div style="margin-top: 10px;">
        <p style="margin-bottom: 8px; color: #64748b; font-size: 14px;">Foto saat ini:</p>
        <img src="${umkm.foto}" alt="Foto ${umkm.nama}" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #e2e8f0;">
      </div>
    `
  } else {
    editFotoPreview.innerHTML = ""
  }

  // Tampilkan form edit
  document.getElementById("editFormSection").style.display = "block"

  setTimeout(() => {
    initMapPickerEdit(umkm.lat, umkm.lng)
  }, 100)

  // Scroll ke form edit
  document.getElementById("editFormSection").scrollIntoView({ behavior: "smooth" })
}

window.updateUMKM = (event) => {
  event.preventDefault()

  const id = Number.parseInt(document.getElementById("editId").value)

  const editFotoInput = document.getElementById("editFoto")

  // If new photo is provided, convert to base64
  if (editFotoInput.files && editFotoInput.files[0]) {
    const file = editFotoInput.files[0]

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("❌ Ukuran foto terlalu besar! Maksimal 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const updatedUMKM = {
        nama: document.getElementById("editNama").value,
        jenis: document.getElementById("editJenis").value,
        alamat: document.getElementById("editAlamat").value,
        lat: Number.parseFloat(document.getElementById("editLat").value),
        lng: Number.parseFloat(document.getElementById("editLng").value),
        deskripsi: document.getElementById("editDeskripsi").value,
        foto: e.target.result,
        kontak: document.getElementById("editKontak").value,
      }

      window.updateUMKMData(id, updatedUMKM)
      loadUMKMTable()
      loadExistingMarkersToAddMap()
      if (mapPickerEdit) {
        loadExistingMarkersToEditMap()
      }
      window.cancelEdit()
      alert(`✅ UMKM "${updatedUMKM.nama}" berhasil diupdate!`)
    }
    reader.readAsDataURL(file)
  } else {
    // No new photo, keep existing photo
    const existingUMKM = window.getUMKMById(id)
    const updatedUMKM = {
      nama: document.getElementById("editNama").value,
      jenis: document.getElementById("editJenis").value,
      alamat: document.getElementById("editAlamat").value,
      lat: Number.parseFloat(document.getElementById("editLat").value),
      lng: Number.parseFloat(document.getElementById("editLng").value),
      deskripsi: document.getElementById("editDeskripsi").value,
      foto: existingUMKM.foto || null,
      kontak: document.getElementById("editKontak").value,
    }

    window.updateUMKMData(id, updatedUMKM)
    loadUMKMTable()
    loadExistingMarkersToAddMap()
    if (mapPickerEdit) {
      loadExistingMarkersToEditMap()
    }
    window.cancelEdit()
    alert(`✅ UMKM "${updatedUMKM.nama}" berhasil diupdate!`)
  }
}

// Cancel edit
window.cancelEdit = () => {
  document.getElementById("editForm").reset()
  document.getElementById("editFotoPreview").innerHTML = ""
  document.getElementById("editFormSection").style.display = "none"
  if (mapPickerEdit) {
    mapPickerEdit.remove()
    mapPickerEdit = null
  }
  if (pickerMarkerEdit) {
    pickerMarkerEdit = null
  }
}

window.deleteUMKM = (id, nama) => {
  // Prompt passcode sebelum delete
  const inputPasscode = prompt("🔒 Masukkan passcode untuk menghapus data UMKM:")

  if (!inputPasscode) {
    alert("Penghapusan dibatalkan")
    return
  }

  if (inputPasscode !== CRUD_PASSCODE) {
    alert("❌ Passcode salah! Anda tidak memiliki akses untuk menghapus data.")
    return
  }

  if (confirm(`⚠️ Yakin ingin menghapus UMKM "${nama}"?\n\nData yang dihapus tidak dapat dikembalikan.`)) {
    window.deleteUMKMData(id)

    loadUMKMTable()

    loadExistingMarkersToAddMap()
    if (mapPickerEdit) {
      loadExistingMarkersToEditMap()
    }

    alert(`✅ UMKM "${nama}" berhasil dihapus!`)
  }
}

function initMapPicker() {
  // Initialize add form map
  if (!mapPicker) {
    // Center on Sragen area (adjust these coordinates for Desa Sukorejo)
    const defaultCenter = [-7.4186, 110.9758]

    mapPicker = window.L.map("mapPicker").setView(defaultCenter, 13)

    window.adminMapPicker = mapPicker

    // Add basemap
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapPicker)

    loadExistingMarkersToAddMap()

    // Add click event
    mapPicker.on("click", (e) => {
      const lat = e.latlng.lat.toFixed(6)
      const lng = e.latlng.lng.toFixed(6)

      // Update form inputs
      document.getElementById("lat").value = lat
      document.getElementById("lng").value = lng

      // Update display
      document.getElementById("coordDisplay").innerHTML = `
        <strong>Koordinat:</strong> ${lat}, ${lng}
      `

      // Add or move marker
      if (pickerMarker) {
        pickerMarker.setLatLng(e.latlng)
      } else {
        pickerMarker = window.L.marker(e.latlng, {
          icon: window.L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        }).addTo(mapPicker)
      }
    })
  } else {
    loadExistingMarkersToAddMap()
  }
}

function initMapPickerEdit(lat, lng) {
  if (!mapPickerEdit) {
    mapPickerEdit = window.L.map("mapPickerEdit").setView([lat, lng], 15)

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapPickerEdit)

    loadExistingMarkersToEditMap()

    // Add existing location marker
    pickerMarkerEdit = window.L.marker([lat, lng], {
      icon: window.L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    }).addTo(mapPickerEdit)

    // Update display
    document.getElementById("coordDisplayEdit").innerHTML = `
      <strong>Koordinat:</strong> ${lat}, ${lng}
    `

    mapPickerEdit.on("click", (e) => {
      const newLat = e.latlng.lat.toFixed(6)
      const newLng = e.latlng.lng.toFixed(6)

      document.getElementById("editLat").value = newLat
      document.getElementById("editLng").value = newLng

      document.getElementById("coordDisplayEdit").innerHTML = `
        <strong>Koordinat:</strong> ${newLat}, ${newLng}
      `

      pickerMarkerEdit.setLatLng(e.latlng)
    })
  } else {
    // If map already exists, just update center and marker
    mapPickerEdit.setView([lat, lng], 15)
    pickerMarkerEdit.setLatLng([lat, lng])
    document.getElementById("coordDisplayEdit").innerHTML = `
      <strong>Koordinat:</strong> ${lat}, ${lng}
    `
    loadExistingMarkersToEditMap()
  }

  // Fix map render issue
  setTimeout(() => {
    mapPickerEdit.invalidateSize()
  }, 100)
}

function getUMKMIconAdmin(jenis) {
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

  return window.L.divIcon({
    ...iconConfig,
    html: iconHtml,
  })
}

function loadExistingMarkersToAddMap() {
  // Clear existing markers first
  existingAddMarkers.forEach((marker) => mapPicker.removeLayer(marker))
  existingAddMarkers = []

  const umkmData = window.getAllUMKM()
  umkmData.forEach((umkm) => {
    if (!umkm.lat || !umkm.lng) return

    // Use category-specific icon
    const icon = getUMKMIconAdmin(umkm.jenis)

    const marker = window.L.marker([Number.parseFloat(umkm.lat), Number.parseFloat(umkm.lng)], { icon })

    const popupContent = `
      <div style="min-width: 150px; max-width: 250px;">
        ${umkm.foto ? `<img src="${umkm.foto}" alt="${umkm.nama}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;">` : ""}
        <strong style="display: block; margin-bottom: 4px; color: #1f2937;">${umkm.nama}</strong>
        <span style="display: block; color: #6b7280; font-size: 13px;">Jenis: ${umkm.jenis}</span>
        <span style="display: block; color: #6b7280; font-size: 13px;">Alamat: ${umkm.alamat}</span>
        ${umkm.deskripsi ? `<p style="margin-top: 6px; color: #64748b; font-size: 12px; font-style: italic; border-top: 1px solid #e5e7eb; padding-top: 6px;">${umkm.deskripsi}</p>` : ""}
      </div>
    `
    marker.bindPopup(popupContent)

    marker.addTo(mapPicker)
    existingAddMarkers.push(marker)
  })
}

function loadExistingMarkersToEditMap() {
  if (!mapPickerEdit) return

  // Clear existing markers first
  existingEditMarkers.forEach((marker) => mapPickerEdit.removeLayer(marker))
  existingEditMarkers = []

  const umkmData = window.getAllUMKM()
  umkmData.forEach((umkm) => {
    if (!umkm.lat || !umkm.lng) return

    // Use category-specific icon
    const icon = getUMKMIconAdmin(umkm.jenis)

    const marker = window.L.marker([Number.parseFloat(umkm.lat), Number.parseFloat(umkm.lng)], { icon })

    const popupContent = `
      <div style="min-width: 150px; max-width: 250px;">
        ${umkm.foto ? `<img src="${umkm.foto}" alt="${umkm.nama}" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;">` : ""}
        <strong style="display: block; margin-bottom: 4px; color: #1f2937;">${umkm.nama}</strong>
        <span style="display: block; color: #6b7280; font-size: 13px;">Jenis: ${umkm.jenis}</span>
        <span style="display: block; color: #6b7280; font-size: 13px;">Alamat: ${umkm.alamat}</span>
        ${umkm.deskripsi ? `<p style="margin-top: 6px; color: #64748b; font-size: 12px; font-style: italic; border-top: 1px solid #e5e7eb; padding-top: 6px;">${umkm.deskripsi}</p>` : ""}
      </div>
    `
    marker.bindPopup(popupContent)

    marker.addTo(mapPickerEdit)
    existingEditMarkers.push(marker)
  })
}

window.initMapPicker = initMapPicker
window.initMapPickerEdit = initMapPickerEdit

window.getUserLocationAdmin = () => {
  if (!navigator.geolocation) {
    alert("❌ Browser Anda tidak mendukung Geolocation")
    return
  }

  // Show loading state
  const coordDisplay = document.getElementById("coordDisplay")
  coordDisplay.innerHTML = "<strong>🔄 Mencari lokasi Anda...</strong>"

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude

      // Center map to user location
      if (mapPicker) {
        mapPicker.setView([lat, lng], 16)

        // Update form inputs
        document.getElementById("lat").value = lat.toFixed(6)
        document.getElementById("lng").value = lng.toFixed(6)

        // Update display
        coordDisplay.innerHTML = `
          <strong>Koordinat:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)} (Lokasi Anda)
        `

        // Add or move marker
        if (pickerMarker) {
          pickerMarker.setLatLng([lat, lng])
        } else {
          pickerMarker = window.L.marker([lat, lng], {
            icon: window.L.icon({
              iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            }),
          }).addTo(mapPicker)
        }
      }
    },
    (error) => {
      console.error("Geolocation error:", error)
      let errorMsg = "Tidak dapat mengambil lokasi"
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = "❌ Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser."
          break
        case error.POSITION_UNAVAILABLE:
          errorMsg = "❌ Informasi lokasi tidak tersedia"
          break
        case error.TIMEOUT:
          errorMsg = "❌ Waktu request lokasi habis"
          break
      }
      alert(errorMsg)
      coordDisplay.innerHTML = "<strong>Koordinat:</strong> Belum dipilih"
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  )
}

window.getUserLocationAdminEdit = () => {
  if (!navigator.geolocation) {
    alert("❌ Browser Anda tidak mendukung Geolocation")
    return
  }

  const coordDisplay = document.getElementById("coordDisplayEdit")
  coordDisplay.innerHTML = "<strong>🔄 Mencari lokasi Anda...</strong>"

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude

      if (mapPickerEdit) {
        mapPickerEdit.setView([lat, lng], 16)

        document.getElementById("editLat").value = lat.toFixed(6)
        document.getElementById("editLng").value = lng.toFixed(6)

        coordDisplay.innerHTML = `
          <strong>Koordinat:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)} (Lokasi Anda)
        `

        if (pickerMarkerEdit) {
          pickerMarkerEdit.setLatLng([lat, lng])
        } else {
          pickerMarkerEdit = window.L.marker([lat, lng], {
            icon: window.L.icon({
              iconUrl:
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            }),
          }).addTo(mapPickerEdit)
        }
      }
    },
    (error) => {
      console.error("Geolocation error:", error)
      let errorMsg = "Tidak dapat mengambil lokasi"
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = "❌ Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser."
          break
        case error.POSITION_UNAVAILABLE:
          errorMsg = "❌ Informasi lokasi tidak tersedia"
          break
        case error.TIMEOUT:
          errorMsg = "❌ Waktu request lokasi habis"
          break
      }
      alert(errorMsg)
      coordDisplay.innerHTML = "<strong>Koordinat:</strong> Belum dipilih"
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  )
}

window.searchMapUMKM = () => {
  const searchInput = document.getElementById("mapSearchInput")
  const jenisSelect = document.getElementById("mapJenisFilter")
  const searchQuery = searchInput.value.trim().toLowerCase()
  const selectedJenis = jenisSelect.value

  console.log("[v0] Admin Search triggered - Name:", searchQuery, "Category:", selectedJenis)

  const umkmData = window.getAllUMKM()
  if (!umkmData || umkmData.length === 0) {
    alert("Tidak ada data UMKM")
    return
  }

  let filteredData = umkmData

  // Apply name filter
  if (searchQuery) {
    filteredData = filteredData.filter((umkm) => umkm.nama.toLowerCase().includes(searchQuery))
  }

  // Apply category filter
  if (selectedJenis) {
    filteredData = filteredData.filter((umkm) => umkm.jenis === selectedJenis)
  }

  console.log("[v0] Filtered results:", filteredData.length, "UMKM found")

  if (filteredData.length === 0) {
    alert("Tidak ada UMKM yang ditemukan dengan kriteria pencarian tersebut.")
    mapPicker.setView([-7.4186, 110.9758], 14)
    return
  }

  // Reload all markers
  loadExistingMarkersToAddMap()

  if (filteredData.length === 1) {
    // Single result - zoom in and auto-popup, NO alert
    const umkm = filteredData[0]
    const lat = Number.parseFloat(umkm.lat)
    const lng = Number.parseFloat(umkm.lng)

    if (!isNaN(lat) && !isNaN(lng)) {
      mapPicker.setView([lat, lng], 17)

      // Auto open popup after zoom
      setTimeout(() => {
        existingAddMarkers.forEach((marker) => {
          const markerPos = marker.getLatLng()
          if (Math.abs(markerPos.lat - lat) < 0.0001 && Math.abs(markerPos.lng - lng) < 0.0001) {
            marker.openPopup()
          }
        })
      }, 300)
    }
  } else {
    // Multiple results - fit bounds
    const validCoords = filteredData
      .map((umkm) => ({
        lat: Number.parseFloat(umkm.lat),
        lng: Number.parseFloat(umkm.lng),
      }))
      .filter((coord) => !isNaN(coord.lat) && !isNaN(coord.lng))

    if (validCoords.length > 0) {
      const bounds = window.L.latLngBounds(validCoords.map((c) => [c.lat, c.lng]))
      mapPicker.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })

      // Show alert ONLY for category filter with multiple results
      if (selectedJenis) {
        alert(`Ditemukan ${filteredData.length} UMKM kategori ${selectedJenis}`)
      }
    }
  }
}

window.searchMapUMKMEdit = () => {
  const searchInput = document.getElementById("mapSearchInputEdit")
  const jenisSelect = document.getElementById("mapJenisFilterEdit")
  const searchQuery = searchInput.value.trim().toLowerCase()
  const selectedJenis = jenisSelect.value

  console.log("[v0] Admin Edit Search triggered - Name:", searchQuery, "Category:", selectedJenis)

  const umkmData = window.getAllUMKM()
  if (!umkmData || umkmData.length === 0) {
    alert("Tidak ada data UMKM")
    return
  }

  let filteredData = umkmData

  // Apply name filter
  if (searchQuery) {
    filteredData = filteredData.filter((umkm) => umkm.nama.toLowerCase().includes(searchQuery))
  }

  // Apply category filter
  if (selectedJenis) {
    filteredData = filteredData.filter((umkm) => umkm.jenis === selectedJenis)
  }

  console.log("[v0] Filtered results:", filteredData.length, "UMKM found")

  if (filteredData.length === 0) {
    alert("Tidak ada UMKM yang ditemukan dengan kriteria pencarian tersebut.")
    mapPickerEdit.setView([-7.4186, 110.9758], 14)
    return
  }

  // Reload markers
  loadExistingMarkersToEditMap()

  if (filteredData.length === 1) {
    // Single result - zoom in and auto-popup, NO alert
    const umkm = filteredData[0]
    const lat = Number.parseFloat(umkm.lat)
    const lng = Number.parseFloat(umkm.lng)

    if (!isNaN(lat) && !isNaN(lng)) {
      mapPickerEdit.setView([lat, lng], 17)

      // Auto open popup after zoom
      setTimeout(() => {
        existingEditMarkers.forEach((marker) => {
          const markerPos = marker.getLatLng()
          if (Math.abs(markerPos.lat - lat) < 0.0001 && Math.abs(markerPos.lng - lng) < 0.0001) {
            marker.openPopup()
          }
        })
      }, 300)
    }
  } else {
    // Multiple results - fit bounds
    const validCoords = filteredData
      .map((umkm) => ({
        lat: Number.parseFloat(umkm.lat),
        lng: Number.parseFloat(umkm.lng),
      }))
      .filter((coord) => !isNaN(coord.lat) && !isNaN(coord.lng))

    if (validCoords.length > 0) {
      const bounds = window.L.latLngBounds(validCoords.map((c) => [c.lat, c.lng]))
      mapPickerEdit.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })

      // Show alert ONLY for category filter with multiple results
      if (selectedJenis) {
        alert(`Ditemukan ${filteredData.length} UMKM kategori ${selectedJenis}`)
      }
    }
  }
}

window.resetMapSearch = () => {
  document.getElementById("mapSearchInput").value = ""
  document.getElementById("mapJenisFilter").value = ""
  loadExistingMarkersToAddMap()
  mapPicker.setView([-7.4186, 110.9758], 14)
}

window.resetMapSearchEdit = () => {
  document.getElementById("mapSearchInputEdit").value = ""
  document.getElementById("mapJenisFilterEdit").value = ""
  loadExistingMarkersToEditMap()
  mapPickerEdit.setView([-7.4186, 110.9758], 14)
}

function loadUMKMMarkersOnAdminMap() {
  // Implementation for loading UMKM markers on admin map
}

function loadUMKMMarkersOnAdminMapEdit() {
  // Implementation for loading UMKM markers on edit form map
}

window.previewImage = (event, previewElementId) => {
  const file = event.target.files[0]
  const previewDiv = document.getElementById(previewElementId)

  if (file) {
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("❌ Ukuran foto terlalu besar! Maksimal 2MB.")
      event.target.value = ""
      previewDiv.innerHTML = ""
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      previewDiv.innerHTML = `
        <div style="margin-top: 10px;">
          <p style="margin-bottom: 8px; color: #64748b; font-size: 14px;">Preview:</p>
          <img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #e2e8f0;">
        </div>
      `
    }
    reader.readAsDataURL(file)
  } else {
    previewDiv.innerHTML = ""
  }
}
