// Media Slider Component for Catalog Cards (Images + Videos)

class ImageSlider {
  constructor(container, media, productId) {
    this.container = container
    this.media = media || [] // Array of {type: 'image'|'video', src: '...'}
    this.productId = productId
    this.currentIndex = 0
    
    if (this.media.length > 0) {
      this.render()
      this.attachEventListeners()
    }
  }

  render() {
    if (this.media.length === 0) return

    const hasMultiple = this.media.length > 1

    this.container.innerHTML = `
      <div class="image-slider-container">
        ${hasMultiple ? `<span class="image-count-badge">${this.currentIndex + 1}/${this.media.length}</span>` : ''}
        <div class="image-slider" data-slider-id="${this.productId}">
          ${this.media.map((item, index) => {
            if (item.type === 'video') {
              return `
                <video class="slider-image" 
                       style="transform: translateX(-${this.currentIndex * 100}%); object-fit: cover;"
                       ${index === this.currentIndex ? 'controls' : ''}
                       onclick="event.stopPropagation()">
                  <source src="${item.src}" type="video/mp4">
                </video>
              `
            } else {
              return `
                <img src="${item.src}" 
                     alt="Image ${index + 1}" 
                     class="slider-image" 
                     style="transform: translateX(-${this.currentIndex * 100}%)">
              `
            }
          }).join('')}
        </div>
        ${hasMultiple ? `
          <button class="slider-nav prev" data-slider-id="${this.productId}" ${this.currentIndex === 0 ? 'disabled' : ''}>
            ❮
          </button>
          <button class="slider-nav next" data-slider-id="${this.productId}" ${this.currentIndex === this.media.length - 1 ? 'disabled' : ''}>
            ❯
          </button>
          <div class="slider-dots">
            ${this.media.map((item, index) => `
              <button class="slider-dot ${index === this.currentIndex ? 'active' : ''}" 
                      data-index="${index}" 
                      data-slider-id="${this.productId}">
                ${item.type === 'video' ? '▶' : ''}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `
  }

  attachEventListeners() {
    const prevBtn = this.container.querySelector(`.slider-nav.prev[data-slider-id="${this.productId}"]`)
    const nextBtn = this.container.querySelector(`.slider-nav.next[data-slider-id="${this.productId}"]`)
    const dots = this.container.querySelectorAll(`.slider-dot[data-slider-id="${this.productId}"]`)

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.prev()
      })
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.next()
      })
    }

    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation()
        const index = parseInt(dot.dataset.index)
        this.goTo(index)
      })
    })
  }

  prev() {
    if (this.currentIndex > 0) {
      this.pauseAllVideos()
      this.currentIndex--
      this.updateSlider()
    }
  }

  next() {
    if (this.currentIndex < this.media.length - 1) {
      this.pauseAllVideos()
      this.currentIndex++
      this.updateSlider()
    }
  }

  goTo(index) {
    if (index >= 0 && index < this.media.length) {
      this.pauseAllVideos()
      this.currentIndex = index
      this.updateSlider()
    }
  }

  pauseAllVideos() {
    const videos = this.container.querySelectorAll('video')
    videos.forEach(video => {
      video.pause()
      video.removeAttribute('controls')
    })
  }

  updateSlider() {
    const sliderItems = this.container.querySelectorAll('.slider-image')
    sliderItems.forEach((item, idx) => {
      item.style.transform = `translateX(-${this.currentIndex * 100}%)`
      
      // Add controls to current video
      if (item.tagName === 'VIDEO') {
        if (idx === this.currentIndex) {
          item.setAttribute('controls', '')
        } else {
          item.removeAttribute('controls')
        }
      }
    })

    // Update navigation buttons
    const prevBtn = this.container.querySelector(`.slider-nav.prev[data-slider-id="${this.productId}"]`)
    const nextBtn = this.container.querySelector(`.slider-nav.next[data-slider-id="${this.productId}"]`)
    
    if (prevBtn) prevBtn.disabled = this.currentIndex === 0
    if (nextBtn) nextBtn.disabled = this.currentIndex === this.media.length - 1

    // Update dots
    const dots = this.container.querySelectorAll(`.slider-dot[data-slider-id="${this.productId}"]`)
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex)
    })

    // Update counter badge
    const badge = this.container.querySelector('.image-count-badge')
    if (badge) {
      badge.textContent = `${this.currentIndex + 1}/${this.media.length}`
    }
  }
}

// Modal Media Gallery (Images + Videos)
class ModalImageGallery {
  constructor(container, media) {
    this.container = container
    this.media = media || [] // Array of {type: 'image'|'video', src: '...'}
    this.currentIndex = 0
    
    if (this.media.length > 0) {
      this.render()
      this.attachEventListeners()
    }
  }

  render() {
    if (this.media.length === 0) return

    const hasMultiple = this.media.length > 1

    this.container.innerHTML = `
      <div class="modal-image-gallery">
        <div class="gallery-slider">
          ${this.media.map((item, index) => {
            if (item.type === 'video') {
              return `
                <video class="gallery-image" 
                       style="transform: translateX(-${this.currentIndex * 100}%)"
                       ${index === this.currentIndex ? 'controls' : ''}
                       onclick="event.stopPropagation()">
                  <source src="${item.src}" type="video/mp4">
                </video>
              `
            } else {
              return `
                <img src="${item.src}" 
                     alt="Image ${index + 1}" 
                     class="gallery-image" 
                     style="transform: translateX(-${this.currentIndex * 100}%)"
                     onclick="openImageZoom('${item.src}')">
              `
            }
          }).join('')}
        </div>
        ${hasMultiple ? `
          <button class="gallery-nav prev" ${this.currentIndex === 0 ? 'disabled' : ''}>
            ❮
          </button>
          <button class="gallery-nav next" ${this.currentIndex === this.media.length - 1 ? 'disabled' : ''}>
            ❯
          </button>
        ` : ''}
      </div>
      ${hasMultiple ? `
        <div class="gallery-thumbnails">
          ${this.media.map((item, index) => {
            if (item.type === 'video') {
              return `
                <div class="gallery-thumbnail ${index === this.currentIndex ? 'active' : ''}" 
                     data-index="${index}"
                     style="position: relative; background: #000; display: flex; align-items: center; justify-content: center;">
                  <video style="width: 100%; height: 100%; object-fit: cover;" src="${item.src}"></video>
                  <span style="position: absolute; color: white; font-size: 20px;">▶</span>
                </div>
              `
            } else {
              return `
                <img src="${item.src}" 
                     alt="Thumbnail ${index + 1}" 
                     class="gallery-thumbnail ${index === this.currentIndex ? 'active' : ''}" 
                     data-index="${index}">
              `
            }
          }).join('')}
        </div>
      ` : ''}
    `
  }

  attachEventListeners() {
    const prevBtn = this.container.querySelector('.gallery-nav.prev')
    const nextBtn = this.container.querySelector('.gallery-nav.next')
    const thumbnails = this.container.querySelectorAll('.gallery-thumbnail')

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prev())
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.next())
    }

    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', () => {
        const index = parseInt(thumbnail.dataset.index)
        this.goTo(index)
      })
    })
  }

  prev() {
    if (this.currentIndex > 0) {
      this.pauseAllVideos()
      this.currentIndex--
      this.updateGallery()
    }
  }

  next() {
    if (this.currentIndex < this.media.length - 1) {
      this.pauseAllVideos()
      this.currentIndex++
      this.updateGallery()
    }
  }

  goTo(index) {
    if (index >= 0 && index < this.media.length) {
      this.pauseAllVideos()
      this.currentIndex = index
      this.updateGallery()
    }
  }

  pauseAllVideos() {
    const videos = this.container.querySelectorAll('video')
    videos.forEach(video => {
      video.pause()
      video.removeAttribute('controls')
    })
  }

  updateGallery() {
    const galleryItems = this.container.querySelectorAll('.gallery-image')
    galleryItems.forEach((item, idx) => {
      item.style.transform = `translateX(-${this.currentIndex * 100}%)`
      
      // Add controls to current video
      if (item.tagName === 'VIDEO') {
        if (idx === this.currentIndex) {
          item.setAttribute('controls', '')
        } else {
          item.removeAttribute('controls')
        }
      }
    })

    // Update navigation buttons
    const prevBtn = this.container.querySelector('.gallery-nav.prev')
    const nextBtn = this.container.querySelector('.gallery-nav.next')
    
    if (prevBtn) prevBtn.disabled = this.currentIndex === 0
    if (nextBtn) nextBtn.disabled = this.currentIndex === this.media.length - 1

    // Update thumbnails
    const thumbnails = this.container.querySelectorAll('.gallery-thumbnail')
    thumbnails.forEach((thumbnail, index) => {
      thumbnail.classList.toggle('active', index === this.currentIndex)
    })
  }
}

// Export for use in other scripts
window.ImageSlider = ImageSlider
window.ModalImageGallery = ModalImageGallery
