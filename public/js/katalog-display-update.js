// This file contains updated display logic for katalog.js
// Copy these functions into katalog.js to replace the existing ones

// Updated previewVideos for multiple videos
function previewVideos(event) {
  const files = event.target.files
  const preview = document.getElementById("videoPreview")
  preview.innerHTML = ""

  if (files.length === 0) return

  Array.from(files).forEach((file, index) => {
    if (file.size > 50 * 1024 * 1024) {
      alert(`Video ${index + 1} terlalu besar! Maksimal 50MB per video.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const videoContainer = document.createElement('div')
      videoContainer.style.position = 'relative'
      videoContainer.innerHTML = `
        <video controls style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
          <source src="${e.target.result}" type="${file.type}">
        </video>
        <span style="position: absolute; top: -8px; right: -8px; background: #059669; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
      `
      preview.appendChild(videoContainer)
    }
    reader.readAsDataURL(file)
  })
}

// Updated previewEditVideos for multiple videos
function previewEditVideos(event) {
  const files = event.target.files
  const preview = document.getElementById("editVideoPreview")
  preview.innerHTML = ""

  if (files.length === 0) return

  Array.from(files).forEach((file, index) => {
    if (file.size > 50 * 1024 * 1024) {
      alert(`Video ${index + 1} terlalu besar! Maksimal 50MB per video.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const videoContainer = document.createElement('div')
      videoContainer.style.position = 'relative'
      videoContainer.innerHTML = `
        <video controls style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
          <source src="${e.target.result}" type="${file.type}">
        </video>
        <span style="position: absolute; top: -8px; right: -8px; background: #059669; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
      `
      preview.appendChild(videoContainer)
    }
    reader.readAsDataURL(file)
  })
}

// Updated addProduct to handle multiple videos and combine with images
function addProductUpdated(event) {
  event.preventDefault()

  const nama = document.getElementById("productName").value
  const kategori = document.getElementById("productCategory").value
  const deskripsi = document.getElementById("productDescription").value
  const alamat = document.getElementById("productLocation").value
  const lat = document.getElementById("productLat").value
  const lng = document.getElementById("productLng").value
  const kontak = document.getElementById("productContact").value
  const imageFiles = document.getElementById("productImage").files
  const videoFiles = document.getElementById("productVideo").files

  if (!nama || !kategori || !deskripsi || !alamat || !kontak || !lat || !lng) {
    alert("Mohon lengkapi semua field yang wajib diisi!")
    return
  }

  const promises = []

  // Handle images
  if (imageFiles.length > 0) {
    const imagePromises = Array.from(imageFiles).map(file => {
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

  // Handle videos
  if (videoFiles.length > 0) {
    const videoPromises = Array.from(videoFiles).map(file => {
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
    // Combine images and videos into media array
    const media = window.combineMedia(images, videos)
    
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
      video_list: videos,
      media: media, // Combined media for slider
    }
    window.addNewProduct(product)
    window.displayProducts()
    window.closeAddModal()
    alert("Produk berhasil ditambahkan!")
  })
}

// Updated displayProducts to use combined media
function displayProductsUpdated(products = null) {
  const catalogGrid = document.getElementById("catalogGrid")
  const productsToDisplay = products || window.getAllProducts()

  if (productsToDisplay.length === 0) {
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
      // Combine images and videos into media array
      let media = product.media || []
      if (media.length === 0) {
        // Fallback: combine from separate arrays
        media = window.combineMedia(
          product.gambar_list || (product.gambar ? [product.gambar] : []),
          product.video_list || []
        )
      }
      
      return `
    <div class="product-card" onclick="openDetailModal(${product.id})">
      <div id="slider-${product.id}">
        ${
          media.length > 0
            ? '' // Slider will be rendered by JavaScript
            : '<div class="product-image" style="display: flex; align-items: center; justify-content: center; font-size: 3rem; color: #cbd5e1; height: 200px;">📦</div>'
        }
      </div>
      <div class="product-content">
        <h3 class="product-title">${product.nama}</h3>
        <p class="product-description">${product.deskripsi}</p>
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

  // Initialize sliders for each product with combined media
  productsToDisplay.forEach(product => {
    let media = product.media || []
    if (media.length === 0) {
      media = window.combineMedia(
        product.gambar_list || (product.gambar ? [product.gambar] : []),
        product.video_list || []
      )
    }
    
    if (media.length > 0) {
      const container = document.getElementById(`slider-${product.id}`)
      if (container) {
        new window.ImageSlider(container, media, product.id)
      }
    }
  })
}
