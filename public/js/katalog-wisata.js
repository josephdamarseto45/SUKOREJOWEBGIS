// Passcode for catalog operations
const PASSCODE_WISATA = "WISATA2024"

// Store selected files globally
let selectedWisataImages = []
let selectedWisataVideos = []
let selectedEditWisataImages = []
let selectedEditWisataVideos = []
let deletedExistingWisataImages = [] // Track deleted existing images
let deletedExistingWisataVideos = [] // Track deleted existing videos

// Display wisata destinations
function displayWisata(wisataList = null) {
  try {
    const catalogGrid = document.getElementById("catalogGrid")
    if (!catalogGrid) {
      console.error("[v0] catalogGrid element not found")
      return
    }

    const wisataToDisplay = wisataList || window.getAllWisata()

    if (!wisataToDisplay || wisataToDisplay.length === 0) {
      catalogGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🏞️</div>
          <h3>Belum Ada Destinasi Wisata</h3>
          <p>Destinasi wisata akan ditambahkan oleh admin</p>
        </div>
      `
      return
    }

    catalogGrid.innerHTML = wisataToDisplay
      .map((wisata) => {
        const images = wisata.foto_list && wisata.foto_list.length > 0 ? wisata.foto_list : (wisata.foto ? [wisata.foto] : [])
        const videos = wisata.video_list && wisata.video_list.length > 0 ? wisata.video_list : []
        return `
<div class="wisata-card" onclick="openDetailModal(${wisata.id})">
  <div id="wisata-slider-${wisata.id}" style="min-height: 200px;">
    ${
      images.length === 0
        ? '<div class="wisata-image" style="display: flex; align-items: center; justify-content: center; font-size: 3rem; color: #94a3b8; background: #e8f4f8; height: 200px;">📦</div>'
        : ''
    }
  </div>
  ${
    videos.length > 0
      ? `<div id="wisata-video-slider-${wisata.id}" style="margin-top: 8px;"></div>`
      : ''
  }
  <div class="wisata-content">
    <h3 class="wisata-title">${wisata.nama || 'Destinasi'}</h3>
    <p class="wisata-description">${wisata.deskripsi || 'Tidak ada deskripsi'}</p>
    <div class="wisata-location">
      <span>📍</span>
      <span>${wisata.kategori || 'Desa Sukorejo'}</span>
    </div>
    ${
      wisata.kontak
        ? `<div class="wisata-contact">
            <span>📱</span>
            <a href="https://wa.me/62${wisata.kontak.replace(/^0/, "")}" target="_blank" onclick="event.stopPropagation()">
              ${wisata.kontak}
            </a>
          </div>`
        : ""
    }
  </div>
</div>
`
      })
      .join("")

    // Initialize sliders for each wisata (IMAGES and VIDEOS SEPARATE)
    wisataToDisplay.forEach((wisata) => {
      try {
        const images = wisata.foto_list && wisata.foto_list.length > 0 ? wisata.foto_list : (wisata.foto ? [wisata.foto] : [])
        const videos = wisata.video_list && wisata.video_list.length > 0 ? wisata.video_list : []
        
        // Image slider - convert to proper format
        if (images.length > 0) {
          const container = document.getElementById(`wisata-slider-${wisata.id}`)
          if (container && window.ImageSlider) {
            const imageMedia = images.map(src => ({ type: 'image', src }))
            new window.ImageSlider(container, imageMedia, `wisata-${wisata.id}`)
          }
        }
        
        // Video slider - separate, convert to proper format
        if (videos.length > 0) {
          const videoContainer = document.getElementById(`wisata-video-slider-${wisata.id}`)
          if (videoContainer && window.ImageSlider) {
            const videoMedia = videos.map(src => ({ type: 'video', src }))
            new window.ImageSlider(videoContainer, videoMedia, `wisata-video-${wisata.id}`)
          }
        }
      } catch (sliderError) {
        console.error("[v0] Error initializing slider for wisata:", wisata.id, sliderError)
      }
    })
  } catch (error) {
    console.error("[v0] Error in displayWisata:", error)
  }
}

// Filter wisata by search and category
function filterWisata() {
  try {
    const searchInput = document.getElementById("searchInput")?.value?.toLowerCase() || ""
    const categoryFilter = document.getElementById("categoryFilter")?.value || ""
    const allWisata = window.getAllWisata()

    if (!allWisata || allWisata.length === 0) {
      displayWisata([])
      return
    }

    const filtered = allWisata.filter((wisata) => {
      const matchesSearch =
        (wisata.nama && wisata.nama.toLowerCase().includes(searchInput)) ||
        (wisata.deskripsi && wisata.deskripsi.toLowerCase().includes(searchInput)) ||
        (wisata.kategori && wisata.kategori.toLowerCase().includes(searchInput))

      const matchesCategory = !categoryFilter || wisata.kategori === categoryFilter

      return matchesSearch && matchesCategory
    })

    displayWisata(filtered)
  } catch (error) {
    console.error("[v0] Error in filterWisata:", error)
    displayWisata([])
  }
}

// Open wisata detail modal
function openDetailModal(id) {
  const wisata = window.getWisataById(id)
  if (!wisata) return

  const detailContent = document.getElementById("detailContent")
  document.getElementById("detailTitle").textContent = wisata.nama

  // Category icon mapping
  const categoryIcons = {
    Alam: "🌳",
    Budaya: "🎭",
    Kuliner: "🍴",
    Edukasi: "📚",
    Religi: "🕌",
  }

  const images = wisata.foto_list && wisata.foto_list.length > 0 ? wisata.foto_list : (wisata.foto ? [wisata.foto] : [])
  const videos = wisata.video_list && wisata.video_list.length > 0 ? wisata.video_list : []
  
  // Combine images and videos into media array
  const media = [
    ...images.map(img => ({type: 'image', src: img})),
    ...videos.map(vid => ({type: 'video', src: vid}))
  ]

  detailContent.innerHTML = `
    <div id="wisata-detail-gallery-${wisata.id}" style="margin-bottom: 20px;">
      ${
        media.length === 0
          ? '<div style="width: 100%; height: 300px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 4rem; color: #cbd5e1;">🏞️</div>'
          : ''
      }
    </div>
    
    <div style="margin-bottom: 16px;">
      <span style="display: inline-block; background: #e0f2e9; color: #7fa998; padding: 6px 16px; border-radius: 12px; font-size: 0.875rem; font-weight: 600;">
        ${categoryIcons[wisata.kategori] || "📍"} ${wisata.kategori}
      </span>
    </div>

    <div style="margin-bottom: 16px;">
      <h4 style="color: #0f172a; margin-bottom: 8px; font-size: 1.1rem;">Deskripsi</h4>
      <p style="color: #475569; line-height: 1.6;">${wisata.deskripsi}</p>
    </div>

    ${
      wisata.jamOperasional
        ? `<div style="margin-bottom: 16px;">
            <h4 style="color: #0f172a; margin-bottom: 8px; font-size: 1.1rem;">Jam Operasional</h4>
            <p style="color: #475569; display: flex; align-items: center; gap: 8px;">
              <span>🕐</span> ${wisata.jamOperasional}
            </p>
          </div>`
        : ""
    }

    ${
      wisata.hargaTiket
        ? `<div style="margin-bottom: 16px;">
            <h4 style="color: #0f172a; margin-bottom: 8px; font-size: 1.1rem;">Harga Tiket</h4>
            <p style="color: #475569; display: flex; align-items: center; gap: 8px;">
              <span>💵</span> ${wisata.hargaTiket}
            </p>
          </div>`
        : ""
    }

    ${
      wisata.kontak
        ? `<div style="margin-bottom: 16px;">
            <h4 style="color: #0f172a; margin-bottom: 8px; font-size: 1.1rem;">Kontak</h4>
            <p style="color: #7fa998; font-weight: 600; display: flex; align-items: center; gap: 8px;">
              <span>📱</span> 
              <a href="https://wa.me/62${wisata.kontak.replace(/^0/, "")}" target="_blank" style="color: #7fa998; text-decoration: none;">
                ${wisata.kontak}
              </a>
            </p>
          </div>
          <div style="margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap;">
            <a href="https://wa.me/62${wisata.kontak.replace(/^0/, "")}" target="_blank" 
               style="display: inline-block; background: #7fa998; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Hubungi via WhatsApp
            </a>
            <button onclick="openEditWisataModal(${wisata.id})" 
               style="background: #7fa998; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              Edit
            </button>
            <button onclick="deleteWisataHandler(${wisata.id})" 
               style="background: #e74c3c; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              Hapus
            </button>
          </div>`
        : ""
    }
  `

  document.getElementById("wisataDetailModal").style.display = "flex"

  // Initialize modal gallery if media exists
  if (media.length > 0) {
    const galleryContainer = document.getElementById(`wisata-detail-gallery-${wisata.id}`)
    if (galleryContainer) {
      new window.ModalImageGallery(galleryContainer, media)
    }
  }
}

// Close wisata detail modal
function closeDetailModal() {
  document.getElementById("wisataDetailModal").style.display = "none"
}

// Open image zoom
function openImageZoom(imageSrc) {
  document.getElementById("zoomedImage").src = imageSrc
  document.getElementById("imageZoomModal").style.display = "flex"
}

// Close image zoom
function closeImageZoom() {
  document.getElementById("imageZoomModal").style.display = "none"
}

// Map picker for adding/editing wisata
let mapPickerAdd = null
let addMarker = null
let mapPickerWisataEdit = null
let editWisataMarker = null

// Get my location for Add form
function getMyLocationWisataAdd() {
  if (!navigator.geolocation) {
    alert("Geolocation tidak didukung oleh browser Anda")
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      
      document.getElementById("wisataLat").value = lat.toFixed(6)
      document.getElementById("wisataLng").value = lng.toFixed(6)
      
      if (mapPickerAdd) {
        mapPickerAdd.setView([lat, lng], 16)
        
        if (addMarker) {
          mapPickerAdd.removeLayer(addMarker)
        }
        addMarker = window.L.marker([lat, lng], {
          icon: window.L.divIcon({
            html: '<div style="background: #7fa998; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          }),
        }).addTo(mapPickerAdd)
      }
    },
    (error) => {
      alert("Gagal mendapatkan lokasi: " + error.message)
    },
    { enableHighAccuracy: true }
  )
}

// Get my location for Edit form
function getMyLocationWisataEdit() {
  if (!navigator.geolocation) {
    alert("Geolocation tidak didukung oleh browser Anda")
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      
      document.getElementById("editWisataLat").value = lat.toFixed(6)
      document.getElementById("editWisataLng").value = lng.toFixed(6)
      
      if (mapPickerWisataEdit) {
        mapPickerWisataEdit.setView([lat, lng], 16)
        
        if (editWisataMarker) {
          mapPickerWisataEdit.removeLayer(editWisataMarker)
        }
        editWisataMarker = window.L.marker([lat, lng], {
          icon: window.L.divIcon({
            html: '<div style="background: #7fa998; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          }),
        }).addTo(mapPickerWisataEdit)
      }
    },
    (error) => {
      alert("Gagal mendapatkan lokasi: " + error.message)
    },
    { enableHighAccuracy: true }
  )
}

// Open add wisata modal
function openAddWisataModal() {
  const passcode = prompt("Masukkan passcode untuk menambah wisata:")
  if (passcode !== PASSCODE_WISATA) {
    alert("Passcode salah!")
    return
  }

  document.getElementById("addWisataModal").style.display = "flex"
  
  // Reset form fields
  document.getElementById("wisataName").value = ""
  document.getElementById("wisataCategory").value = ""
  document.getElementById("wisataDescription").value = ""
  document.getElementById("wisataLat").value = ""
  document.getElementById("wisataLng").value = ""
  document.getElementById("wisataJamOperasional").value = ""
  document.getElementById("wisataHargaTiket").value = ""
  document.getElementById("wisataContact").value = ""
  document.getElementById("wisataImage").value = ""
  document.getElementById("wisataVideo").value = ""
  document.getElementById("wisataImagePreview").innerHTML = ""
  document.getElementById("wisataVideoPreview").innerHTML = ""
  
  // Reset arrays
  selectedWisataImages = []
  selectedWisataVideos = []
  
  // Initialize map after modal is visible
  setTimeout(() => {
    if (!mapPickerAdd) {
      mapPickerAdd = window.L.map("mapPickerWisataAdd").setView([-7.5626, 110.8282], 13)
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapPickerAdd)

      mapPickerAdd.on("click", (e) => {
        if (addMarker) {
          mapPickerAdd.removeLayer(addMarker)
        }
        addMarker = window.L.marker(e.latlng, {
          icon: window.L.divIcon({
            html: '<div style="background: #7fa998; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          }),
        }).addTo(mapPickerAdd)
        document.getElementById("wisataLat").value = e.latlng.lat.toFixed(6)
        document.getElementById("wisataLng").value = e.latlng.lng.toFixed(6)
      })
    }
    mapPickerAdd.invalidateSize()
  }, 100)
}

// Close add wisata modal
function closeAddWisataModal() {
  document.getElementById("addWisataModal").style.display = "none"
  document.getElementById("wisataName").value = ""
  document.getElementById("wisataCategory").value = ""
  document.getElementById("wisataDescription").value = ""
  document.getElementById("wisataLat").value = ""
  document.getElementById("wisataLng").value = ""
  document.getElementById("wisataJamOperasional").value = ""
  document.getElementById("wisataHargaTiket").value = ""
  document.getElementById("wisataContact").value = ""
  document.getElementById("wisataImage").value = ""
  document.getElementById("wisataVideo").value = ""
  document.getElementById("wisataImagePreview").innerHTML = ""
  document.getElementById("wisataVideoPreview").innerHTML = ""
  
  // Reset arrays
  selectedWisataImages = []
  selectedWisataVideos = []
  
  if (addMarker) {
    mapPickerAdd.removeLayer(addMarker)
    addMarker = null
  }
}

// Preview multiple wisata images
function previewWisataImages(event) {
  const files = event.target.files
  const preview = document.getElementById("wisataImagePreview")
  
  // Add new files to the array
  selectedWisataImages = [...selectedWisataImages, ...Array.from(files)]
  
  renderWisataImagePreviews(preview, selectedWisataImages, 'wisataImage')
}

function renderWisataImagePreviews(container, filesArray, inputId) {
  container.innerHTML = ""
  
  if (filesArray.length === 0) return
  
  filesArray.forEach((file, index) => {
    if (file.size > 2 * 1024 * 1024) {
      alert(`Gambar ${index + 1} terlalu besar! Maksimal 2MB per gambar.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imgContainer = document.createElement('div')
      imgContainer.style.position = 'relative'
      imgContainer.style.display = 'inline-block'
      imgContainer.innerHTML = `
        <img src="${e.target.result}" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
        <span style="position: absolute; top: -8px; right: -8px; background: #7fa998; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
        <button onclick="removeWisataImage(${index}, '${inputId}')" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
      `
      container.appendChild(imgContainer)
    }
    reader.readAsDataURL(file)
  })
}

function removeWisataImage(index, inputId) {
  if (inputId === 'wisataImage') {
    selectedWisataImages.splice(index, 1)
    renderWisataImagePreviews(document.getElementById("wisataImagePreview"), selectedWisataImages, 'wisataImage')
  } else if (inputId === 'editWisataImage') {
    selectedEditWisataImages.splice(index, 1)
    renderExistingWisataMediaPreviews()
  }
}

// Preview edit wisata images
function previewEditWisataImages(event) {
  try {
    const files = event.target.files
    
    // Validate file sizes
    Array.from(files).forEach((file, index) => {
      if (file.size > 50 * 1024 * 1024) {
        alert(`Foto ${index + 1} terlalu besar! Maksimal 50MB per foto.`)
        return
      }
    })
    
    // Add new files to the array
    selectedEditWisataImages = [...selectedEditWisataImages, ...Array.from(files)]
    
    renderExistingWisataMediaPreviews()
  } catch (error) {
    console.error("[v0] Error in previewEditWisataImages:", error)
    alert("Terjadi error saat memproses foto. Silahkan coba lagi.")
  }
}

// Preview multiple wisata videos
function previewWisataVideos(event) {
  const files = event.target.files
  const preview = document.getElementById("wisataVideoPreview")
  
  // Add new files to the array
  selectedWisataVideos = [...selectedWisataVideos, ...Array.from(files)]
  
  renderWisataVideoPreviews(preview, selectedWisataVideos, 'wisataVideo')
}

function renderWisataVideoPreviews(container, filesArray, inputId) {
  container.innerHTML = ""
  
  if (filesArray.length === 0) return
  
  filesArray.forEach((file, index) => {
    if (file.size > 50 * 1024 * 1024) {
      alert(`Video ${index + 1} terlalu besar! Maksimal 50MB per video.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const videoContainer = document.createElement('div')
      videoContainer.style.position = 'relative'
      videoContainer.style.display = 'inline-block'
      videoContainer.innerHTML = `
        <video style="width: 120px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
          <source src="${e.target.result}" type="${file.type}">
        </video>
        <span style="position: absolute; top: -8px; right: -8px; background: #7fa998; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
        <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; pointer-events: none;">▶</span>
        <button onclick="removeWisataVideo(${index}, '${inputId}')" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
      `
      container.appendChild(videoContainer)
    }
    reader.readAsDataURL(file)
  })
}

function removeWisataVideo(index, inputId) {
  if (inputId === 'wisataVideo') {
    selectedWisataVideos.splice(index, 1)
    renderWisataVideoPreviews(document.getElementById("wisataVideoPreview"), selectedWisataVideos, 'wisataVideo')
  } else if (inputId === 'editWisataVideo') {
    selectedEditWisataVideos.splice(index, 1)
    renderExistingWisataMediaPreviews()
  }
}

// Preview edit wisata videos
function previewEditWisataVideos(event) {
  try {
    const files = event.target.files
    
    // Validate file sizes
    Array.from(files).forEach((file, index) => {
      if (file.size > 50 * 1024 * 1024) {
        alert(`Video ${index + 1} terlalu besar! Maksimal 50MB per video.`)
        return
      }
    })
    
    // Add new files to the array
    selectedEditWisataVideos = [...selectedEditWisataVideos, ...Array.from(files)]
    
    renderExistingWisataMediaPreviews()
  } catch (error) {
    console.error("[v0] Error in previewEditWisataVideos:", error)
    alert("Terjadi error saat memproses video. Silahkan coba lagi.")
  }
}

// Add wisata
function addWisata(event) {
  event.preventDefault()

  const nama = document.getElementById("wisataName").value
  const kategori = document.getElementById("wisataCategory").value
  const deskripsi = document.getElementById("wisataDescription").value
  const lat = parseFloat(document.getElementById("wisataLat").value)
  const lng = parseFloat(document.getElementById("wisataLng").value)
  const jamOperasional = document.getElementById("wisataJamOperasional").value
  const hargaTiket = document.getElementById("wisataHargaTiket").value
  const kontak = document.getElementById("wisataContact").value

  if (!lat || !lng) {
    alert("Mohon pilih lokasi di peta!")
    return
  }

  const promises = []

  // Handle images from selected array
  if (selectedWisataImages.length > 0) {
    const imagePromises = selectedWisataImages.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(file)
      })
    })
    promises.push(Promise.all(imagePromises))
  } else {
    promises.push(Promise.resolve([]))
  }

  // Handle videos from selected array
  if (selectedWisataVideos.length > 0) {
    const videoPromises = selectedWisataVideos.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(file)
      })
    })
    promises.push(Promise.all(videoPromises))
  } else {
    promises.push(Promise.resolve([]))
  }

  Promise.all(promises).then(([images, videos]) => {
    saveWisataData(images, videos)
  })

  function saveWisataData(images, videos) {
    const wisataData = {
      nama,
      kategori,
      deskripsi,
      lat,
      lng,
      foto: images.length > 0 ? images[0] : null,
      foto_list: images,
      video_list: videos,
      jamOperasional,
      hargaTiket,
      kontak,
    }

    window.addNewWisata(wisataData)
    alert("Destinasi wisata berhasil ditambahkan!")
    closeAddWisataModal()
    
    // Reset arrays
    selectedWisataImages = []
    selectedWisataVideos = []
    
    displayWisata()
  }
}

// Open edit wisata modal
function openEditWisataModal(id) {
  const passcode = prompt("Masukkan passcode untuk mengedit wisata:")
  if (passcode !== PASSCODE_WISATA) {
    alert("Passcode salah!")
    return
  }

  const wisata = window.getWisataById(id)
  if (!wisata) return

  document.getElementById("editWisataId").value = id
  document.getElementById("editWisataName").value = wisata.nama
  document.getElementById("editWisataCategory").value = wisata.kategori
  document.getElementById("editWisataDescription").value = wisata.deskripsi
  document.getElementById("editWisataLat").value = wisata.lat || ""
  document.getElementById("editWisataLng").value = wisata.lng || ""
  document.getElementById("editWisataJamOperasional").value = wisata.jamOperasional || ""
  document.getElementById("editWisataHargaTiket").value = wisata.hargaTiket || ""
  document.getElementById("editWisataContact").value = wisata.kontak || ""

  // Store existing media in edit arrays
  const images = wisata.foto_list && wisata.foto_list.length > 0 ? wisata.foto_list : (wisata.foto ? [wisata.foto] : [])
  const videos = wisata.video_list && wisata.video_list.length > 0 ? wisata.video_list : (wisata.video ? [wisata.video] : [])
  
  // Reset edit arrays and set existing media (deep clone to prevent modification of original data)
  window.existingWisataImages = JSON.parse(JSON.stringify(images))
  window.existingWisataVideos = JSON.parse(JSON.stringify(videos))
  selectedEditWisataImages = []
  selectedEditWisataVideos = []
  deletedExistingWisataImages = []
  deletedExistingWisataVideos = []
  
  document.getElementById("editWisataModal").style.display = "flex"
  closeDetailModal()
  
  // Render existing media previews
  renderExistingWisataMediaPreviews()

  // Initialize edit map
  setTimeout(() => {
    if (!mapPickerWisataEdit) {
      mapPickerWisataEdit = window.L.map("mapPickerWisataEdit").setView([wisata.lat || -7.5626, wisata.lng || 110.8282], 14)
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapPickerWisataEdit)

      mapPickerWisataEdit.on("click", (e) => {
        if (editWisataMarker) {
          mapPickerWisataEdit.removeLayer(editWisataMarker)
        }
        editWisataMarker = window.L.marker(e.latlng, {
          icon: window.L.divIcon({
            html: '<div style="background: #7fa998; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          }),
        }).addTo(mapPickerWisataEdit)
        document.getElementById("editWisataLat").value = e.latlng.lat.toFixed(6)
        document.getElementById("editWisataLng").value = e.latlng.lng.toFixed(6)
      })
    } else {
      mapPickerWisataEdit.setView([wisata.lat || -7.5626, wisata.lng || 110.8282], 14)
      mapPickerWisataEdit.invalidateSize()
    }

    // Add marker at existing location
    if (wisata.lat && wisata.lng) {
      if (editWisataMarker) {
        mapPickerWisataEdit.removeLayer(editWisataMarker)
      }
      editWisataMarker = window.L.marker([wisata.lat, wisata.lng], {
        icon: window.L.divIcon({
          html: '<div style="background: #7fa998; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        }),
      }).addTo(mapPickerWisataEdit)
    }
  }, 100)
}

// Update wisata
function updateWisata(event) {
  event.preventDefault()

  const id = parseInt(document.getElementById("editWisataId").value)
  const nama = document.getElementById("editWisataName").value
  const kategori = document.getElementById("editWisataCategory").value
  const deskripsi = document.getElementById("editWisataDescription").value
  const lat = document.getElementById("editWisataLat").value
  const lng = document.getElementById("editWisataLng").value
  const jamOperasional = document.getElementById("editWisataJamOperasional").value
  const hargaTiket = document.getElementById("editWisataHargaTiket").value
  const kontak = document.getElementById("editWisataContact").value
  const wisata = window.getWisataById(id)

  if (!nama || !kategori || !deskripsi || !lat || !lng) {
    alert("Mohon lengkapi semua field yang wajib diisi!")
    return
  }

  const promises = []

  // Handle new images
  if (selectedEditWisataImages.length > 0) {
    const imagePromises = selectedEditWisataImages.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(file)
      })
    })
    promises.push(Promise.all(imagePromises))
  } else {
    promises.push(Promise.resolve([]))
  }

  // Handle new videos with better error handling
  if (selectedEditWisataVideos.length > 0) {
    const videoPromises = selectedEditWisataVideos.map((file, fileIndex) => {
      return new Promise((resolve) => {
        // Check file size first
        if (file.size > 50 * 1024 * 1024) {
          console.warn(`[v0] Video ${fileIndex + 1} terlalu besar: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
          resolve(null)
          return
        }
        
        const reader = new FileReader()
        const timeout = setTimeout(() => {
          console.error(`[v0] Video ${fileIndex + 1} timeout saat membaca file`)
          reader.abort()
          resolve(null)
        }, 30000) // 30 second timeout
        
        reader.onload = (e) => {
          clearTimeout(timeout)
          console.log(`[v0] Video ${fileIndex + 1} berhasil dikonversi, ukuran base64: ${(e.target.result.length / 1024 / 1024).toFixed(2)}MB`)
          resolve(e.target.result)
        }
        reader.onerror = () => {
          clearTimeout(timeout)
          console.error(`[v0] Error membaca video file ${fileIndex + 1}:`, reader.error)
          resolve(null)
        }
        reader.onabort = () => {
          clearTimeout(timeout)
          console.warn(`[v0] Video ${fileIndex + 1} dibatalkan`)
          resolve(null)
        }
        
        console.log(`[v0] Mulai membaca video ${fileIndex + 1}, ukuran: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
        reader.readAsDataURL(file)
      })
    })
    promises.push(Promise.all(videoPromises))
  } else {
    promises.push(Promise.resolve([]))
  }

  Promise.all(promises).then(([newImages, newVideos]) => {
    try {
      // Filter out null values from failed conversions
      const validNewVideos = newVideos.filter(v => v !== null)
      
      if (selectedEditWisataVideos.length > 0 && validNewVideos.length === 0) {
        console.warn("[v0] Semua video gagal dikonversi")
        alert("Gagal memproses video. Pastikan file tidak terlalu besar (max 50MB per video)")
        return
      }
      
      // Combine existing media with new media, excluding deleted ones
      const finalImages = [
        ...(window.existingWisataImages || []).filter(img => !deletedExistingWisataImages.includes(img)),
        ...newImages
      ].filter(v => v)
      
      const finalVideos = [
        ...(window.existingWisataVideos || []).filter(vid => !deletedExistingWisataVideos.includes(vid)),
        ...validNewVideos
      ].filter(v => v)
      
      console.log("[v0] Final wisata data:", { finalImages: finalImages.length, finalVideos: finalVideos.length })
      
      window.updateWisataById(id, {
        nama,
        kategori,
        deskripsi,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        foto: finalImages.length > 0 ? finalImages[0] : null,
        foto_list: finalImages,
        video_list: finalVideos,
        jamOperasional,
        hargaTiket,
        kontak,
      })
      displayWisata()
      closeEditWisataModal()
      alert("Destinasi wisata berhasil diperbarui!")
    } catch (error) {
      console.error("[v0] Error updating wisata:", error)
      alert("Terjadi error saat menyimpan. Silahkan coba lagi.")
    }
  }).catch((error) => {
    console.error("[v0] Promise error:", error)
    alert("Terjadi error saat memproses file. Silahkan coba lagi.")
  })
}

// Delete wisata
function deleteWisataHandler(id) {
  const passcode = prompt("Masukkan passcode untuk menghapus wisata:")
  if (passcode !== PASSCODE_WISATA) {
    alert("Passcode salah!")
    return
  }

  if (confirm("Apakah Anda yakin ingin menghapus destinasi wisata ini?")) {
    window.deleteWisataById(id)
    displayWisata()
    closeDetailModal()
    alert("Destinasi wisata berhasil dihapus!")
  }
}

// Close edit wisata modal
function closeEditWisataModal() {
  document.getElementById("editWisataModal").style.display = "none"
  if (editWisataMarker && mapPickerWisataEdit) {
    mapPickerWisataEdit.removeLayer(editWisataMarker)
    editWisataMarker = null
  }
  
  // Reset arrays and clear previews
  selectedEditWisataImages = []
  selectedEditWisataVideos = []
  window.existingWisataImages = []
  window.existingWisataVideos = []
  document.getElementById("editWisataImagePreview").innerHTML = ""
  document.getElementById("editWisataVideoPreview").innerHTML = ""
  document.getElementById("editWisataImage").value = ""
  document.getElementById("editWisataVideo").value = ""
}

// Close modal when clicking outside
window.onclick = (event) => {
  const addModal = document.getElementById("addWisataModal")
  const editModal = document.getElementById("editWisataModal")
  const detailModal = document.getElementById("wisataDetailModal")
  const zoomModal = document.getElementById("imageZoomModal")

  if (event.target === addModal) {
    closeAddWisataModal()
  }
  if (event.target === editModal) {
    closeEditWisataModal()
  }
  if (event.target === detailModal) {
    closeDetailModal()
  }
  if (event.target === zoomModal) {
    closeImageZoom()
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  displayWisata()
  
  // Add event listeners for search and filter
  const searchInput = document.getElementById("searchInput")
  const categoryFilter = document.getElementById("categoryFilter")
  
  if (searchInput) {
    searchInput.addEventListener("input", filterWisata)
  }
  
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterWisata)
  }
  
  // Listen for data changes and refresh display
  window.addEventListener("wisataDataChanged", () => {
    displayWisata()
  })
})

// Function to render existing media previews in edit modal
function renderExistingWisataMediaPreviews() {
  try {
    // Clear and render existing images
    const existingImagesContainer = document.getElementById("editWisataImagePreview")
    if (!existingImagesContainer) return
    
    existingImagesContainer.innerHTML = ""
    
    if (window.existingWisataImages && window.existingWisataImages.length > 0) {
      const header = document.createElement('div')
      header.innerHTML = '<p style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 8px; width: 100%;">Foto yang ada:</p>'
      existingImagesContainer.appendChild(header)
      
      window.existingWisataImages.forEach((imageSrc, index) => {
        if (!imageSrc) return
        const imgContainer = document.createElement('div')
        imgContainer.style.position = 'relative'
        imgContainer.style.display = 'inline-block'
        imgContainer.style.marginRight = '8px'
        imgContainer.innerHTML = `
          <img src="${imageSrc}" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
          <span style="position: absolute; top: -8px; right: -8px; background: #7fa998; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
          <button type="button" data-type="existing" data-index="${index}" onclick="deleteWisataMediaItem(this, 'existingImage')" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
        `
        existingImagesContainer.appendChild(imgContainer)
      })
    }

    // Add new images if any
    if (selectedEditWisataImages.length > 0) {
      const newHeader = document.createElement('div')
      newHeader.innerHTML = '<p style="font-size: 12px; color: #7fa998; font-weight: 600; margin-bottom: 8px; margin-top: 16px; width: 100%;">Foto baru:</p>'
      existingImagesContainer.appendChild(newHeader)
      
      selectedEditWisataImages.forEach((file, index) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            // Check if this image still exists (prevent stale renders)
            if (index < selectedEditWisataImages.length && selectedEditWisataImages[index] === file) {
              const imgContainer = document.createElement('div')
              imgContainer.style.position = 'relative'
              imgContainer.style.display = 'inline-block'
              imgContainer.style.marginRight = '8px'
              imgContainer.innerHTML = `
                <img src="${e.target.result}" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
                <span style="position: absolute; top: -8px; right: -8px; background: #7fa998; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
                <button type="button" data-type="new" data-index="${index}" onclick="deleteWisataMediaItem(this, 'newImage')" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
              `
              existingImagesContainer.appendChild(imgContainer)
            }
          } catch (err) {
            console.error("[v0] Error rendering new wisata image:", err)
          }
        }
        reader.onerror = () => {
          console.error("[v0] Error reading wisata image file:", file.name)
        }
        reader.readAsDataURL(file)
      })
    }

    // Clear and render existing videos
    const existingVideosContainer = document.getElementById("editWisataVideoPreview")
    if (!existingVideosContainer) return
    
    existingVideosContainer.innerHTML = ""
    
    if (window.existingWisataVideos && window.existingWisataVideos.length > 0) {
      const header = document.createElement('div')
      header.innerHTML = '<p style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 8px; width: 100%;">Video yang ada:</p>'
      existingVideosContainer.appendChild(header)
      
      window.existingWisataVideos.forEach((videoSrc, index) => {
        if (!videoSrc) return
        const videoContainer = document.createElement('div')
        videoContainer.style.position = 'relative'
        videoContainer.style.display = 'inline-block'
        videoContainer.style.marginRight = '8px'
        videoContainer.innerHTML = `
          <video style="width: 120px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
            <source src="${videoSrc}" type="video/mp4">
          </video>
          <span style="position: absolute; top: -8px; right: -8px; background: #7fa998; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
          <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; pointer-events: none;">▶</span>
          <button type="button" data-type="existing" data-index="${index}" onclick="deleteWisataMediaItem(this, 'existingVideo')" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
        `
        existingVideosContainer.appendChild(videoContainer)
      })
    }

    // Add new videos if any
    if (selectedEditWisataVideos.length > 0) {
      const newHeader = document.createElement('div')
      newHeader.innerHTML = '<p style="font-size: 12px; color: #7fa998; font-weight: 600; margin-bottom: 8px; margin-top: 16px; width: 100%;">Video baru:</p>'
      existingVideosContainer.appendChild(newHeader)
      
      selectedEditWisataVideos.forEach((file, index) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            // Check if this video still exists (prevent stale renders)
            if (index < selectedEditWisataVideos.length && selectedEditWisataVideos[index] === file) {
              const videoContainer = document.createElement('div')
              videoContainer.style.position = 'relative'
              videoContainer.style.display = 'inline-block'
              videoContainer.style.marginRight = '8px'
              videoContainer.innerHTML = `
                <video style="width: 120px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
                  <source src="${e.target.result}" type="video/mp4">
                </video>
                <span style="position: absolute; top: -8px; right: -8px; background: #7fa998; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
                <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; pointer-events: none;">▶</span>
                <button type="button" data-type="new" data-index="${index}" onclick="deleteWisataMediaItem(this, 'newVideo')" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
              `
              existingVideosContainer.appendChild(videoContainer)
            }
          } catch (err) {
            console.error("[v0] Error rendering new wisata video:", err)
          }
        }
        reader.onerror = () => {
          console.error("[v0] Error reading wisata video file:", file.name)
        }
        reader.readAsDataURL(file)
      })
    }
  } catch (error) {
    console.error("[v0] Error in renderExistingWisataMediaPreviews:", error)
  }
}

// Function to delete media items from the edit modal
function deleteWisataMediaItem(button, type) {
  const index = parseInt(button.getAttribute('data-index'))
  if (type === 'existingImage') {
    const deleted = window.existingWisataImages.splice(index, 1)
    if (deleted.length > 0) {
      deletedExistingWisataImages.push(deleted[0])
    }
  } else if (type === 'newImage') {
    selectedEditWisataImages.splice(index, 1)
  } else if (type === 'existingVideo') {
    const deleted = window.existingWisataVideos.splice(index, 1)
    if (deleted.length > 0) {
      deletedExistingWisataVideos.push(deleted[0])
    }
  } else if (type === 'newVideo') {
    selectedEditWisataVideos.splice(index, 1)
  }
  renderExistingWisataMediaPreviews()
}
