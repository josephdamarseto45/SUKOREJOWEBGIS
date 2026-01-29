// Catalog Data Management - Connected to UMKM Map Database (data.js)
// Functions used from data.js (loaded before this script): getAllUMKM, addNewUMKM, updateUMKMData, deleteUMKMData, getUMKMById
const PASSCODE_UMKM = "UMKM2024"

// Map picker variables
let mapPickerAdd = null
let addMarker = null
let mapPickerEdit = null
let editMarker = null

// Declare variables from data.js
let getUMKMById = window.getUMKMById;
let updateUMKMData = window.updateUMKMData;
let deleteUMKMData = window.deleteUMKMData;

// Get all products from UMKM database
function getAllProducts() {
  return window.getAllUMKM()
}

// Add new product to UMKM database
function addNewProduct(product) {
  return window.addNewUMKM(product)
}

// Get my location for Add form
function getMyLocationAdd() {
  if (!navigator.geolocation) {
    alert("Geolocation tidak didukung oleh browser Anda")
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      
      document.getElementById("productLat").value = lat.toFixed(6)
      document.getElementById("productLng").value = lng.toFixed(6)
      
      if (mapPickerAdd) {
        mapPickerAdd.setView([lat, lng], 16)
        
        if (addMarker) {
          mapPickerAdd.removeLayer(addMarker)
        }
        addMarker = window.L.marker([lat, lng], {
          icon: window.L.divIcon({
            html: '<div style="background: #059669; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
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
function getMyLocationEdit() {
  if (!navigator.geolocation) {
    alert("Geolocation tidak didukung oleh browser Anda")
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      
      document.getElementById("editProductLat").value = lat.toFixed(6)
      document.getElementById("editProductLng").value = lng.toFixed(6)
      
      if (mapPickerEdit) {
        mapPickerEdit.setView([lat, lng], 16)
        
        if (editMarker) {
          mapPickerEdit.removeLayer(editMarker)
        }
        editMarker = window.L.marker([lat, lng], {
          icon: window.L.divIcon({
            html: '<div style="background: #059669; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          }),
        }).addTo(mapPickerEdit)
      }
    },
    (error) => {
      alert("Gagal mendapatkan lokasi: " + error.message)
    },
    { enableHighAccuracy: true }
  )
}

// Display products
function displayProducts(products = null) {
  try {
    const catalogGrid = document.getElementById("catalogGrid")
    if (!catalogGrid) {
      console.error("[v0] catalogGrid element not found")
      return
    }

    const productsToDisplay = products || window.getAllUMKM()

    if (!productsToDisplay || productsToDisplay.length === 0) {
      catalogGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <h3>Belum Ada Produk</h3>
          <p>Klik tombol "Tambah Produk" untuk menambahkan produk pertama</p>
        </div>
      `
      return
    }

    catalogGrid.innerHTML = productsToDisplay
      .map((product) => {
        const images = product.gambar_list && product.gambar_list.length > 0 ? product.gambar_list : (product.gambar ? [product.gambar] : [])
        const videos = product.video_list && product.video_list.length > 0 ? product.video_list : []
        return `
<div class="product-card" onclick="openDetailModal(${product.id})">
  <div id="slider-${product.id}" style="min-height: 200px;">
    ${
      images.length > 0
        ? '' // Slider will be rendered by JavaScript
        : '<div class="product-image" style="display: flex; align-items: center; justify-content: center; font-size: 3rem; color: #cbd5e1; height: 200px;">📦</div>'
    }
  </div>
  ${
    videos.length > 0
      ? `<div id="video-slider-${product.id}" style="margin-top: 8px;"></div>`
      : ''
  }
  <div class="product-content">
    <h3 class="product-title">${product.nama || 'Produk'}</h3>
    <p class="product-description">${product.deskripsi || 'Tidak ada deskripsi'}</p>
    <div class="product-location">
      <span>📍</span>
      <span>${product.alamat || product.lokasi || 'Desa Sukorejo'}</span>
    </div>
    <div class="product-contact">
      <span>📱</span>
      <a href="https://wa.me/62${(product.kontak || '').replace(/^0/, "")}" target="_blank" onclick="event.stopPropagation()">
        ${product.kontak || '-'}
      </a>
    </div>
  </div>
</div>
`
      })
      .join("")

    // Initialize sliders for each product (IMAGES and VIDEOS SEPARATE)
    productsToDisplay.forEach((product) => {
      try {
        const images = product.gambar_list && product.gambar_list.length > 0 ? product.gambar_list : (product.gambar ? [product.gambar] : [])
        const videos = product.video_list && product.video_list.length > 0 ? product.video_list : []
        
        // Image slider - convert to proper format
        if (images.length > 0) {
          const container = document.getElementById(`slider-${product.id}`)
          if (container && window.ImageSlider) {
            const imageMedia = images.map(src => ({ type: 'image', src }))
            new window.ImageSlider(container, imageMedia, product.id)
          }
        }
        
        // Video slider - separate, convert to proper format
        if (videos.length > 0) {
          const videoContainer = document.getElementById(`video-slider-${product.id}`)
          if (videoContainer && window.ImageSlider) {
            const videoMedia = videos.map(src => ({ type: 'video', src }))
            new window.ImageSlider(videoContainer, videoMedia, `video-${product.id}`)
          }
        }
      } catch (sliderError) {
        console.error("[v0] Error initializing slider for product:", product.id, sliderError)
      }
    })
  } catch (error) {
    console.error("[v0] Error in displayProducts:", error)
  }
}

// Filter products by search and category
function filterProducts() {
  try {
    const searchInput = document.getElementById("searchInput")?.value?.toLowerCase() || ""
    const categoryFilter = document.getElementById("categoryFilter")?.value || ""
    const allProducts = window.getAllUMKM()
    
    if (!allProducts || allProducts.length === 0) {
      displayProducts([])
      return
    }
    
    const filtered = allProducts.filter((product) => {
      const matchesSearch =
        (product.nama && product.nama.toLowerCase().includes(searchInput)) ||
        (product.deskripsi && product.deskripsi.toLowerCase().includes(searchInput)) ||
        (product.alamat && product.alamat.toLowerCase().includes(searchInput)) ||
        (product.lokasi && product.lokasi.toLowerCase().includes(searchInput))

      const matchesCategory = !categoryFilter || product.kategori === categoryFilter || product.jenis === categoryFilter

      return matchesSearch && matchesCategory
    })
    
    displayProducts(filtered)
  } catch (error) {
    console.error("[v0] Error in filterProducts:", error)
    displayProducts([])
  }
}

// Open add product modal
function openAddModal() {
  const passcode = prompt("Masukkan passcode untuk menambah produk:")
  if (passcode !== PASSCODE_UMKM) {
    alert("Passcode salah!")
    return
  }

  document.getElementById("addProductModal").style.display = "flex"
  document.getElementById("productName").value = ""
  document.getElementById("productCategory").value = ""
  document.getElementById("productDescription").value = ""
  document.getElementById("productLocation").value = ""
  document.getElementById("productLat").value = ""
  document.getElementById("productLng").value = ""
  document.getElementById("productContact").value = ""
  document.getElementById("productImage").value = ""
  document.getElementById("productVideo").value = ""
  document.getElementById("imagePreview").innerHTML = ""
  document.getElementById("videoPreview").innerHTML = ""
  
  // Reset arrays
  selectedProductImages = []
  selectedProductVideos = []

  // Initialize map
  setTimeout(() => {
    if (!mapPickerAdd) {
      mapPickerAdd = window.L.map("mapPickerUMKMAdd").setView([-7.4186, 110.9758], 14)
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapPickerAdd)

      mapPickerAdd.on("click", (e) => {
        if (addMarker) {
          mapPickerAdd.removeLayer(addMarker)
        }
        addMarker = window.L.marker(e.latlng, {
          icon: window.L.divIcon({
            html: '<div style="background: #059669; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          }),
        }).addTo(mapPickerAdd)
        document.getElementById("productLat").value = e.latlng.lat.toFixed(6)
        document.getElementById("productLng").value = e.latlng.lng.toFixed(6)
      })
    } else {
      mapPickerAdd.invalidateSize()
    }
  }, 100)
}

// Close add product modal
function closeAddModal() {
  document.getElementById("addProductModal").style.display = "none"
  if (addMarker && mapPickerAdd) {
    mapPickerAdd.removeLayer(addMarker)
    addMarker = null
  }
  
  // Reset arrays and clear previews
  selectedProductImages = []
  selectedProductVideos = []
  document.getElementById("imagePreview").innerHTML = ""
  document.getElementById("videoPreview").innerHTML = ""
  document.getElementById("productImage").value = ""
  document.getElementById("productVideo").value = ""
}

// Store selected files globally
let selectedProductImages = []
let selectedProductVideos = []
let selectedEditProductImages = [] // Declare selectedEditProductImages variable
let selectedEditProductVideos = [] // Declare selectedEditProductVideos variable
let deletedExistingProductVideos = [] // Track deleted existing videos
let deletedExistingProductImages = [] // Track deleted existing images

// Preview multiple images before upload
function previewImages(event) {
  const files = event.target.files
  const preview = document.getElementById("imagePreview")
  
  // Add new files to the array
  selectedProductImages = [...selectedProductImages, ...Array.from(files)]
  
  renderImagePreviews(preview, selectedProductImages, 'productImage')
}

function renderImagePreviews(container, filesArray, inputId) {
  container.innerHTML = ""
  
  if (filesArray.length === 0) return
  
  filesArray.forEach((file, index) => {
    // Check file size (max 2MB per image)
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
        <span style="position: absolute; top: -8px; right: -8px; background: #059669; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
        <button onclick="removeImage(${index}, '${inputId}')" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
      `
      container.appendChild(imgContainer)
    }
    reader.readAsDataURL(file)
  })
}

function removeImage(index, inputId) {
  if (inputId === 'productImage') {
    selectedProductImages.splice(index, 1)
    renderImagePreviews(document.getElementById("imagePreview"), selectedProductImages, 'productImage')
  } else if (inputId === 'editProductImage') {
    selectedEditProductImages.splice(index, 1)
    renderExistingMediaPreviews()
  }
}

// Preview multiple videos before upload
function previewVideos(event) {
  const files = event.target.files
  console.log(`[v0] previewVideos: ${files.length} video files selected`)
  const preview = document.getElementById("videoPreview")
  
  // Validate and add files to selectedProductVideos
  const validFiles = []
  Array.from(files).forEach((file, index) => {
    const sizeMB = file.size / 1024 / 1024
    if (file.size > 50 * 1024 * 1024) {
      console.warn(`[v0] Video ${index + 1} terlalu besar: ${sizeMB.toFixed(2)}MB`)
      alert(`Video ${index + 1} terlalu besar! Maksimal 50MB per video.`)
      return
    }
    console.log(`[v0] Video ${index + 1} valid: ${sizeMB.toFixed(2)}MB, type: ${file.type}`)
    validFiles.push(file)
  })
  
  // Add new files to the array
  console.log(`[v0] Adding ${validFiles.length} valid videos to selectedProductVideos`)
  selectedProductVideos = [...selectedProductVideos, ...validFiles]
  console.log(`[v0] selectedProductVideos length now: ${selectedProductVideos.length}`)
  
  renderVideoPreviews(preview, selectedProductVideos, 'productVideo')
}

function renderVideoPreviews(container, filesArray, inputId) {
  container.innerHTML = ""
  
  if (filesArray.length === 0) return
  
  filesArray.forEach((file, index) => {
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      console.warn(`[v0] Video ${index + 1} size validation failed in render`)
      alert(`Video ${index + 1} terlalu besar! Maksimal 50MB per video.`)
      return
    }

    const reader = new FileReader()
    const timeout = setTimeout(() => {
      console.error(`[v0] Video ${index + 1} timeout in renderVideoPreviews`)
      reader.abort()
    }, 30000)
    
    reader.onload = (e) => {
      clearTimeout(timeout)
      console.log(`[v0] Video ${index + 1} preview rendered successfully`)
      try {
        const videoContainer = document.createElement('div')
        videoContainer.style.position = 'relative'
        videoContainer.style.display = 'inline-block'
        videoContainer.style.marginRight = '8px'
        videoContainer.innerHTML = `
          <video style="width: 120px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
            <source src="${e.target.result}" type="${file.type}">
          </video>
          <span style="position: absolute; top: -8px; right: -8px; background: #059669; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
          <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; pointer-events: none;">▶</span>
          <button type="button" data-index="${index}" onclick="removeVideo(${index}, '${inputId}')" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
        `
        container.appendChild(videoContainer)
      } catch (err) {
        console.error("[v0] Error rendering video container:", err)
      }
    }
    
    reader.onerror = () => {
      clearTimeout(timeout)
      console.error(`[v0] Error reading video file ${index + 1}:`, reader.error)
      alert(`Gagal membaca video ${index + 1}`)
    }
    
    reader.onabort = () => {
      clearTimeout(timeout)
      console.warn(`[v0] Video ${index + 1} read aborted`)
    }
    
    console.log(`[v0] Start reading video ${index + 1}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
    reader.readAsDataURL(file)
  })
}

function removeVideo(index, inputId) {
  if (inputId === 'productVideo') {
    selectedProductVideos.splice(index, 1)
    renderVideoPreviews(document.getElementById("videoPreview"), selectedProductVideos, 'productVideo')
  } else if (inputId === 'editProductVideo') {
    selectedEditProductVideos.splice(index, 1)
    renderExistingMediaPreviews()
  }
}

// Preview edit images
function previewEditImages(event) {
  const files = event.target.files
  
  // Add new files to the array
  selectedEditProductImages = [...selectedEditProductImages, ...Array.from(files)]
  
  renderExistingMediaPreviews()
}

// Preview edit videos
function previewEditVideos(event) {
  try {
    const files = event.target.files
    console.log(`[v0] previewEditVideos: ${files.length} video files selected`)
    
    // Validate file sizes
    const validFiles = []
    Array.from(files).forEach((file, index) => {
      const sizeMB = file.size / 1024 / 1024
      if (file.size > 50 * 1024 * 1024) {
        console.warn(`[v0] Video ${index + 1} terlalu besar: ${sizeMB.toFixed(2)}MB`)
        alert(`Video ${index + 1} terlalu besar! Maksimal 50MB per video.`)
        return
      }
      console.log(`[v0] Video ${index + 1} valid: ${sizeMB.toFixed(2)}MB`)
      validFiles.push(file)
    })
    
    // Add new valid files to the array
    console.log(`[v0] Adding ${validFiles.length} valid videos to selectedEditProductVideos`)
    selectedEditProductVideos = [...selectedEditProductVideos, ...validFiles]
    console.log(`[v0] selectedEditProductVideos length now: ${selectedEditProductVideos.length}`)
    
    renderExistingMediaPreviews()
  } catch (error) {
    console.error("[v0] Error in previewEditVideos:", error)
    alert("Terjadi error saat memproses video. Silahkan coba lagi.")
  }
}

// Add product
function addProduct(event) {
  event.preventDefault()

  const nama = document.getElementById("productName").value
  const kategori = document.getElementById("productCategory").value
  const deskripsi = document.getElementById("productDescription").value
  const alamat = document.getElementById("productLocation").value
  const lat = document.getElementById("productLat").value
  const lng = document.getElementById("productLng").value
  const kontak = document.getElementById("productContact").value
  if (!nama || !kategori || !deskripsi || !alamat || !kontak || !lat || !lng) {
    alert("Mohon lengkapi semua field yang wajib diisi!")
    return
  }

  const promises = []

  // Handle images from selected array
  if (selectedProductImages.length > 0) {
    const imagePromises = selectedProductImages.map(file => {
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

  // Handle videos from selected array with robust error handling
  if (selectedProductVideos.length > 0) {
    const videoPromises = selectedProductVideos.map((file, fileIndex) => {
      return new Promise((resolve) => {
        // Check file size first - max 20MB untuk safety
        const fileSizeMB = file.size / 1024 / 1024
        if (file.size > 20 * 1024 * 1024) {
          console.warn(`[v0] Video ${fileIndex + 1} terlalu besar: ${fileSizeMB.toFixed(2)}MB`)
          alert(`Video ${fileIndex + 1} terlalu besar! Maksimal 20MB per video untuk performa optimal.`)
          resolve(null)
          return
        }
        
        const reader = new FileReader()
        // Increase timeout to 120 seconds for large video files
        const timeout = setTimeout(() => {
          console.error(`[v0] Video ${fileIndex + 1} timeout saat membaca file (>120s)`)
          reader.abort()
          alert(`Video ${fileIndex + 1} timeout. File terlalu besar atau koneksi lambat.`)
          resolve(null)
        }, 120000) // 120 second timeout
        
        reader.onload = (e) => {
          clearTimeout(timeout)
          const base64Size = (e.target.result.length / 1024 / 1024).toFixed(2)
          console.log(`[v0] Video ${fileIndex + 1} berhasil dikonversi, ukuran base64: ${base64Size}MB`)
          
          // Warn if base64 is too large for localStorage
          if (e.target.result.length > 4 * 1024 * 1024) {
            console.warn(`[v0] Video ${fileIndex + 1} base64 size ${base64Size}MB mungkin terlalu besar untuk localStorage`)
          }
          
          resolve(e.target.result)
        }
        reader.onerror = () => {
          clearTimeout(timeout)
          console.error(`[v0] Error membaca video file ${fileIndex + 1}:`, reader.error)
          alert(`Gagal membaca video ${fileIndex + 1}: ${reader.error || 'Unknown error'}`)
          resolve(null)
        }
        reader.onabort = () => {
          clearTimeout(timeout)
          console.warn(`[v0] Video ${fileIndex + 1} dibatalkan`)
          alert(`Video ${fileIndex + 1} dibatalkan. Silahkan coba lagi.`)
          resolve(null)
        }
        
        console.log(`[v0] Mulai membaca video ${fileIndex + 1}, ukuran: ${fileSizeMB.toFixed(2)}MB`)
        reader.readAsDataURL(file)
      })
    })
    promises.push(Promise.all(videoPromises))
  } else {
    promises.push(Promise.resolve([]))
  }

  Promise.all(promises).then(([images, videos]) => {
    try {
      // Filter out null values from failed conversions
      const validVideos = videos.filter(v => v !== null)
      
      if (selectedProductVideos.length > 0 && validVideos.length === 0) {
        console.warn("[v0] Semua video gagal dikonversi")
        alert("Gagal memproses video. Pastikan file tidak terlalu besar dan format didukung.")
        return
      }
      
      console.log("[v0] Add product data:", { images: images.length, videos: validVideos.length })
      
      const product = {
        nama,
        jenis: kategori,
        kategori,
        deskripsi,
        alamat,
        lokasi: alamat,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        kontak,
        gambar: images.length > 0 ? images[0] : null,
        gambar_list: images,
        video_list: validVideos,
      }
      addNewProduct(product)
      displayProducts()
      closeAddModal()
      
      // Reset arrays
      selectedProductImages = []
      selectedProductVideos = []
      
      alert("Produk berhasil ditambahkan!")
    } catch (error) {
      console.error("[v0] Error in addProduct Promise.then:", error)
      
      // Check if it's localStorage quota exceeded
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        alert("Data terlalu besar! Gunakan video yang lebih kecil atau kompres terlebih dahulu.")
      } else {
        alert(`Terjadi error saat menyimpan: ${error.message || 'Unknown error'}`)
      }
    }
  }).catch((error) => {
    console.error("[v0] Promise error in addProduct:", error)
    
    // Check if it's localStorage quota exceeded
    if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
      alert("Data terlalu besar! Gunakan video yang lebih kecil atau kompres terlebih dahulu.")
    } else {
      alert(`Terjadi error saat memproses file: ${error.message || 'Unknown error'}`)
    }
  })
}

// Get product by ID
function getProductById(id) {
  return window.getUMKMById(id)
}

// Update product
function updateProductData(id, updatedData) {
  window.updateUMKMData(id, updatedData)
}

// Delete product
function deleteProduct(id) {
  window.deleteUMKMData(id)
}

// Open product detail modal
function openDetailModal(id) {
  const product = getProductById(id)
  if (!product) return

  const detailContent = document.getElementById("detailContent")
  document.getElementById("detailTitle").textContent = product.nama

  const images = product.gambar_list && product.gambar_list.length > 0 ? product.gambar_list : (product.gambar ? [product.gambar] : [])
  const videos = product.video_list && product.video_list.length > 0 ? product.video_list : []
  
  // Combine images and videos into media array
  const media = [
    ...images.map(img => ({type: 'image', src: img})),
    ...videos.map(vid => ({type: 'video', src: vid}))
  ]
  
  detailContent.innerHTML = `
    <div id="detail-gallery-${product.id}" style="margin-bottom: 20px;">
      ${
        media.length === 0
          ? '<div style="width: 100%; height: 300px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 4rem; color: #cbd5e1;">📦</div>'
          : ''
      }
    </div>
    <h3 style="color: #0f172a; font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">${product.nama}</h3>
    <div style="margin-bottom: 16px;">
      <span style="display: inline-block; background: #d1fae5; color: #065f46; padding: 6px 12px; border-radius: 6px; font-size: 0.875rem; font-weight: 600;">
        ${product.kategori || product.jenis || 'Lainnya'}
      </span>
    </div>
    <p style="color: #475569; line-height: 1.7; margin-bottom: 20px;">${product.deskripsi}</p>
    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
      <div style="display: flex; align-items: start; gap: 8px;">
        <span style="font-size: 1.2rem;">📍</span>
        <div>
          <strong style="color: #334155;">Lokasi:</strong>
          <p style="color: #64748b; margin: 4px 0 0 0;">${product.alamat || product.lokasi || 'Desa Sukorejo'}</p>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.2rem;">📱</span>
        <div>
          <strong style="color: #334155;">Kontak:</strong>
          <a href="https://wa.me/62${(product.kontak || '').replace(/^0/, "")}" target="_blank" style="color: #059669; text-decoration: none; font-weight: 600; margin-left: 8px;">
            ${product.kontak || '-'}
          </a>
        </div>
      </div>
    </div>
    <div style="display: flex; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <button onclick="openEditModal(${product.id})" style="flex: 1; background: #059669; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
        Edit Produk
      </button>
      <button onclick="confirmDelete(${product.id})" style="flex: 1; background: #dc2626; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
        Hapus Produk
      </button>
    </div>
  `

  document.getElementById("productDetailModal").style.display = "flex"
  
  // Initialize modal gallery if media exists
  if (media.length > 0) {
    const galleryContainer = document.getElementById(`detail-gallery-${product.id}`)
    if (galleryContainer) {
      new window.ModalImageGallery(galleryContainer, media)
    }
  }
}

// Open edit product modal
function openEditModal(id) {
  const passcode = prompt("Masukkan passcode untuk mengedit produk:")
  if (passcode !== PASSCODE_UMKM) {
    alert("Passcode salah!")
    return
  }

  const product = getProductById(id)
  if (!product) return

  document.getElementById("editProductId").value = id
  document.getElementById("editProductName").value = product.nama
  document.getElementById("editProductCategory").value = product.kategori || product.jenis || ""
  document.getElementById("editProductDescription").value = product.deskripsi
  document.getElementById("editProductLocation").value = product.alamat || product.lokasi || ""
  document.getElementById("editProductLat").value = product.lat || ""
  document.getElementById("editProductLng").value = product.lng || ""
  document.getElementById("editProductContact").value = product.kontak || ""

  // Store existing media in edit arrays
  const images = product.gambar_list && product.gambar_list.length > 0 ? product.gambar_list : (product.gambar ? [product.gambar] : [])
  const videos = product.video_list && product.video_list.length > 0 ? product.video_list : (product.video ? [product.video] : [])
  
  // Reset edit arrays and set existing media (deep clone to prevent modification of original data)
  window.existingProductImages = JSON.parse(JSON.stringify(images))
  window.existingProductVideos = JSON.parse(JSON.stringify(videos))
  selectedEditProductImages = []
  selectedEditProductVideos = []
  deletedExistingProductImages = []
  deletedExistingProductVideos = []
  
  renderExistingMediaPreviews()

  document.getElementById("editProductModal").style.display = "flex"
  closeDetailModal()

  // Initialize edit map
  setTimeout(() => {
    if (!mapPickerEdit) {
      mapPickerEdit = window.L.map("mapPickerUMKMEdit").setView([product.lat || -7.4186, product.lng || 110.9758], 14)
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapPickerEdit)

      mapPickerEdit.on("click", (e) => {
        if (editMarker) {
          mapPickerEdit.removeLayer(editMarker)
        }
        editMarker = window.L.marker(e.latlng, {
          icon: window.L.divIcon({
            html: '<div style="background: #059669; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          }),
        }).addTo(mapPickerEdit)
        document.getElementById("editProductLat").value = e.latlng.lat.toFixed(6)
        document.getElementById("editProductLng").value = e.latlng.lng.toFixed(6)
      })
    } else {
      mapPickerEdit.setView([product.lat || -7.4186, product.lng || 110.9758], 14)
      mapPickerEdit.invalidateSize()
    }

    // Add marker at existing location
    if (product.lat && product.lng) {
      if (editMarker) {
        mapPickerEdit.removeLayer(editMarker)
      }
      editMarker = window.L.marker([product.lat, product.lng], {
        icon: window.L.divIcon({
          html: '<div style="background: #059669; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        }),
      }).addTo(mapPickerEdit)
    }
  }, 100)
}

// Update product handler
function updateProduct(event) {
  event.preventDefault()

  const id = parseInt(document.getElementById("editProductId").value)
  const nama = document.getElementById("editProductName").value
  const kategori = document.getElementById("editProductCategory").value
  const deskripsi = document.getElementById("editProductDescription").value
  const alamat = document.getElementById("editProductLocation").value
  const lat = document.getElementById("editProductLat").value
  const lng = document.getElementById("editProductLng").value
  const kontak = document.getElementById("editProductContact").value
  const product = getProductById(id)

  if (!nama || !kategori || !deskripsi || !alamat || !kontak || !lat || !lng) {
    alert("Mohon lengkapi semua field!")
    return
  }

  const promises = []

  // Handle new images
  if (selectedEditProductImages.length > 0) {
    const imagePromises = selectedEditProductImages.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(file)
      })
    })
    promises.push(Promise.all(imagePromises))
  } else {
    promises.push(Promise.resolve([]))
  }

  // Handle new videos with better error handling
  if (selectedEditProductVideos.length > 0) {
    const videoPromises = selectedEditProductVideos.map((file, fileIndex) => {
      return new Promise((resolve) => {
        // Check file size first - max 20MB
        const fileSizeMB = file.size / 1024 / 1024
        if (file.size > 20 * 1024 * 1024) {
          console.warn(`[v0] Video ${fileIndex + 1} terlalu besar: ${fileSizeMB.toFixed(2)}MB`)
          alert(`Video ${fileIndex + 1} terlalu besar! Maksimal 20MB per video untuk performa optimal.`)
          resolve(null)
          return
        }
        
        const reader = new FileReader()
        // Increase timeout to 120 seconds
        const timeout = setTimeout(() => {
          console.error(`[v0] Video ${fileIndex + 1} timeout saat membaca file (>120s)`)
          reader.abort()
          alert(`Video ${fileIndex + 1} timeout. File terlalu besar atau koneksi lambat.`)
          resolve(null)
        }, 120000) // 120 second timeout
        
        reader.onload = (e) => {
          clearTimeout(timeout)
          const base64Size = (e.target.result.length / 1024 / 1024).toFixed(2)
          console.log(`[v0] Video ${fileIndex + 1} berhasil dikonversi, ukuran base64: ${base64Size}MB`)
          
          // Warn if base64 is too large for localStorage
          if (e.target.result.length > 4 * 1024 * 1024) {
            console.warn(`[v0] Video ${fileIndex + 1} base64 size ${base64Size}MB mungkin terlalu besar untuk localStorage`)
          }
          
          resolve(e.target.result)
        }
        reader.onerror = () => {
          clearTimeout(timeout)
          console.error(`[v0] Error membaca video file ${fileIndex + 1}:`, reader.error)
          alert(`Gagal membaca video ${fileIndex + 1}: ${reader.error || 'Unknown error'}`)
          resolve(null)
        }
        reader.onabort = () => {
          clearTimeout(timeout)
          console.warn(`[v0] Video ${fileIndex + 1} dibatalkan`)
          alert(`Video ${fileIndex + 1} dibatalkan. Silahkan coba lagi.`)
          resolve(null)
        }
        
        console.log(`[v0] Mulai membaca video ${fileIndex + 1}, ukuran: ${fileSizeMB.toFixed(2)}MB`)
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
      
      if (selectedEditProductVideos.length > 0 && validNewVideos.length === 0) {
        console.warn("[v0] Semua video gagal dikonversi")
        alert("Gagal memproses video. Pastikan file tidak terlalu besar (max 50MB per video)")
        return
      }
      
      // Combine existing media with new media, excluding deleted ones
      const finalImages = [
        ...(window.existingProductImages || []).filter(img => !deletedExistingProductImages.includes(img)),
        ...newImages
      ].filter(v => v)
      
      const finalVideos = [
        ...(window.existingProductVideos || []).filter(vid => !deletedExistingProductVideos.includes(vid)),
        ...validNewVideos
      ].filter(v => v)
      
      console.log("[v0] Final data:", { finalImages: finalImages.length, finalVideos: finalVideos.length })
      
      const updatedData = {
        nama,
        jenis: kategori,
        kategori,
        deskripsi,
        alamat,
        lokasi: alamat,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        kontak,
        gambar: finalImages.length > 0 ? finalImages[0] : null,
        gambar_list: finalImages,
        video_list: finalVideos,
      }
      window.updateUMKMData(id, updatedData)
      displayProducts()
      closeEditModal()
      alert("Produk berhasil diperbarui!")
    } catch (error) {
      console.error("[v0] Error updating product:", error)
      
      // Check if it's localStorage quota exceeded
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        alert("Data terlalu besar! Gunakan video yang lebih kecil atau kompres terlebih dahulu.")
      } else {
        alert(`Terjadi error saat menyimpan: ${error.message || 'Unknown error'}`)
      }
    }
  }).catch((error) => {
    console.error("[v0] Promise error:", error)
    
    // Check if it's localStorage quota exceeded
    if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
      alert("Data terlalu besar! Gunakan video yang lebih kecil atau kompres terlebih dahulu.")
    } else {
      alert(`Terjadi error saat memproses file: ${error.message || 'Unknown error'}`)
    }
  })
}

// Delete product handler
function deleteProductHandler(id) {
  const passcode = prompt("Masukkan passcode untuk menghapus produk:")
  if (passcode !== PASSCODE_UMKM) {
    alert("Passcode salah!")
    return
  }

  if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
    deleteProduct(id)
    displayProducts()
    closeDetailModal()
    alert("Produk berhasil dihapus!")
  }
}

// Confirm delete (wrapper for detail modal)
function confirmDelete(id) {
  deleteProductHandler(id)
}

// Close edit modal
function closeEditModal() {
  document.getElementById("editProductModal").style.display = "none"
  if (editMarker && mapPickerEdit) {
    mapPickerEdit.removeLayer(editMarker)
    editMarker = null
  }
}

// Close product detail modal
function closeDetailModal() {
  document.getElementById("productDetailModal").style.display = "none"
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

// Close modal when clicking outside
window.onclick = (event) => {
  const addModal = document.getElementById("addProductModal")
  const detailModal = document.getElementById("productDetailModal")
  const editModal = document.getElementById("editProductModal")
  const zoomModal = document.getElementById("imageZoomModal")
  
  if (event.target === addModal) {
    closeAddModal()
  }
  if (event.target === detailModal) {
    closeDetailModal()
  }
  if (event.target === editModal) {
    closeEditModal()
  }
  if (event.target === zoomModal) {
    closeImageZoom()
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  displayProducts()
  
  // Add event listeners for search and filter
  const searchInput = document.getElementById("searchInput")
  const categoryFilter = document.getElementById("categoryFilter")
  
  if (searchInput) {
    searchInput.addEventListener("input", filterProducts)
  }
  
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterProducts)
  }
  
  // Listen for data changes and refresh display
  window.addEventListener("umkmDataChanged", () => {
    displayProducts()
  })
})

// Function to render existing media previews
function renderExistingMediaPreviews() {
  try {
    // Clear and render existing images
    const existingImagesContainer = document.getElementById("editImagePreview")
    if (!existingImagesContainer) return
    
    existingImagesContainer.innerHTML = ""
    
    if (window.existingProductImages && window.existingProductImages.length > 0) {
      const header = document.createElement('div')
      header.innerHTML = '<p style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 8px; width: 100%;">Gambar yang ada:</p>'
      existingImagesContainer.appendChild(header)
      
      window.existingProductImages.forEach((imageSrc, index) => {
        if (!imageSrc) return
        const imgContainer = document.createElement('div')
        imgContainer.style.position = 'relative'
        imgContainer.style.display = 'inline-block'
        imgContainer.style.marginRight = '8px'
        imgContainer.innerHTML = `
          <img src="${imageSrc}" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
          <span style="position: absolute; top: -8px; right: -8px; background: #059669; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
          <button type="button" data-type="existing" data-index="${index}" onclick="deleteMediaItem(this, 'existingImage')" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
        `
        existingImagesContainer.appendChild(imgContainer)
      })
    }

    // Add new images if any
    if (selectedEditProductImages.length > 0) {
      const newHeader = document.createElement('div')
      newHeader.innerHTML = '<p style="font-size: 12px; color: #059669; font-weight: 600; margin-bottom: 8px; margin-top: 16px; width: 100%;">Gambar baru:</p>'
      existingImagesContainer.appendChild(newHeader)
      
      selectedEditProductImages.forEach((file, index) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            // Check if this image still exists (prevent stale renders)
            if (index < selectedEditProductImages.length && selectedEditProductImages[index] === file) {
              const imgContainer = document.createElement('div')
              imgContainer.style.position = 'relative'
              imgContainer.style.display = 'inline-block'
              imgContainer.style.marginRight = '8px'
              imgContainer.innerHTML = `
                <img src="${e.target.result}" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
                <span style="position: absolute; top: -8px; right: -8px; background: #059669; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
                <button type="button" data-type="new" data-index="${index}" onclick="deleteMediaItem(this, 'newImage')" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
              `
              existingImagesContainer.appendChild(imgContainer)
            }
          } catch (err) {
            console.error("[v0] Error rendering new image:", err)
          }
        }
        reader.onerror = () => {
          console.error("[v0] Error reading image file:", file.name)
        }
        reader.readAsDataURL(file)
      })
    }

    // Clear and render existing videos
    const existingVideosContainer = document.getElementById("editVideoPreview")
    if (!existingVideosContainer) return
    
    existingVideosContainer.innerHTML = ""
    
    if (window.existingProductVideos && window.existingProductVideos.length > 0) {
      const header = document.createElement('div')
      header.innerHTML = '<p style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 8px; width: 100%;">Video yang ada:</p>'
      existingVideosContainer.appendChild(header)
      
      window.existingProductVideos.forEach((videoSrc, index) => {
        if (!videoSrc) return
        const videoContainer = document.createElement('div')
        videoContainer.style.position = 'relative'
        videoContainer.style.display = 'inline-block'
        videoContainer.style.marginRight = '8px'
        videoContainer.innerHTML = `
          <video style="width: 120px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
            <source src="${videoSrc}" type="video/mp4">
          </video>
          <span style="position: absolute; top: -8px; right: -8px; background: #059669; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
          <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; pointer-events: none;">▶</span>
          <button type="button" data-type="existing" data-index="${index}" onclick="deleteMediaItem(this, 'existingVideo')" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
        `
        existingVideosContainer.appendChild(videoContainer)
      })
    }

    // Add new videos if any
    if (selectedEditProductVideos.length > 0) {
      const newHeader = document.createElement('div')
      newHeader.innerHTML = '<p style="font-size: 12px; color: #059669; font-weight: 600; margin-bottom: 8px; margin-top: 16px; width: 100%;">Video baru:</p>'
      existingVideosContainer.appendChild(newHeader)
      
      selectedEditProductVideos.forEach((file, index) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            // Check if this video still exists (prevent stale renders)
            if (index < selectedEditProductVideos.length && selectedEditProductVideos[index] === file) {
              const videoContainer = document.createElement('div')
              videoContainer.style.position = 'relative'
              videoContainer.style.display = 'inline-block'
              videoContainer.style.marginRight = '8px'
              videoContainer.innerHTML = `
                <video style="width: 120px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
                  <source src="${e.target.result}" type="video/mp4">
                </video>
                <span style="position: absolute; top: -8px; right: -8px; background: #059669; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
                <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; pointer-events: none;">▶</span>
                <button type="button" data-type="new" data-index="${index}" onclick="deleteMediaItem(this, 'newVideo')" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
              `
              existingVideosContainer.appendChild(videoContainer)
            }
          } catch (err) {
            console.error("[v0] Error rendering new video:", err)
          }
        }
        reader.onerror = () => {
          console.error("[v0] Error reading video file:", file.name)
        }
        reader.readAsDataURL(file)
      })
    }
  } catch (error) {
    console.error("[v0] Error in renderExistingMediaPreviews:", error)
  }
}

// Generic media deletion function
function deleteMediaItem(button, mediaType) {
  const index = parseInt(button.getAttribute('data-index'))
  
  if (mediaType === 'existingImage') {
    removeExistingProductImage(index)
  } else if (mediaType === 'existingVideo') {
    removeExistingProductVideo(index)
  } else if (mediaType === 'newImage') {
    removeImage(index, 'editProductImage')
  } else if (mediaType === 'newVideo') {
    removeVideo(index, 'editProductVideo')
  }
}

// Remove existing product image
function removeExistingProductImage(index) {
  if (window.existingProductImages && window.existingProductImages[index]) {
    const deleted = window.existingProductImages.splice(index, 1)
    if (deleted.length > 0) {
      deletedExistingProductImages.push(deleted[0])
    }
    renderExistingMediaPreviews()
  }
}

// Remove existing product video
function removeExistingProductVideo(index) {
  if (window.existingProductVideos && window.existingProductVideos[index]) {
    const deleted = window.existingProductVideos.splice(index, 1)
    if (deleted.length > 0) {
      deletedExistingProductVideos.push(deleted[0])
    }
    renderExistingMediaPreviews()
  }
}
