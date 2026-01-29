// Wallpaper Settings Manager
const WALLPAPER_KEY = "site_wallpaper"
const OPACITY_KEY = "site_wallpaper_opacity"

// Preset wallpaper URLs (nature/village themed)
const presetWallpapers = [
  {
    id: "none",
    name: "Tanpa Wallpaper",
    url: null,
  },
  {
    id: "village1",
    name: "Sawah",
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80",
  },
  {
    id: "village2",
    name: "Pegunungan",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
  },
  {
    id: "nature1",
    name: "Hutan",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80",
  },
  {
    id: "nature2",
    name: "Sungai",
    url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80",
  },
  {
    id: "field",
    name: "Ladang",
    url: "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1920&q=80",
  },
]

// Initialize wallpaper on page load
function initWallpaper() {
  const savedWallpaper = localStorage.getItem(WALLPAPER_KEY)
  const savedOpacity = localStorage.getItem(OPACITY_KEY) || "0.85"

  if (savedWallpaper && savedWallpaper !== "null") {
    applyWallpaper(savedWallpaper, parseFloat(savedOpacity))
  }

  // Create settings button and modal
  createSettingsUI()
}

// Apply wallpaper to body
function applyWallpaper(url, opacity = 0.85) {
  if (!url || url === "null") {
    document.body.classList.remove("has-wallpaper")
    document.body.style.backgroundImage = ""
    updateOverlayOpacity(0.85)
    return
  }

  document.body.classList.add("has-wallpaper")
  document.body.style.backgroundImage = `url('${url}')`
  updateOverlayOpacity(opacity)

  // Update preview if modal exists
  const preview = document.getElementById("wallpaperPreview")
  if (preview) {
    preview.innerHTML = `<img src="${url}" alt="Preview">`
  }
}

// Update overlay opacity
function updateOverlayOpacity(opacity) {
  // Update CSS variable for overlay
  document.documentElement.style.setProperty("--wallpaper-overlay-opacity", opacity)

  // Update the ::before pseudo-element by modifying the style
  let styleEl = document.getElementById("wallpaper-overlay-style")
  if (!styleEl) {
    styleEl = document.createElement("style")
    styleEl.id = "wallpaper-overlay-style"
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = `
    body.has-wallpaper::before {
      background: rgba(248, 250, 252, ${opacity});
    }
  `
}

// Save wallpaper preference
function saveWallpaper(url, opacity = 0.85) {
  localStorage.setItem(WALLPAPER_KEY, url || "null")
  localStorage.setItem(OPACITY_KEY, opacity.toString())
  applyWallpaper(url, opacity)
}

// Create settings UI
function createSettingsUI() {
  // Don't add settings to admin pages
  if (window.location.pathname.includes("admin")) {
    return
  }

  // Create settings button
  const settingsBtn = document.createElement("button")
  settingsBtn.className = "settings-btn"
  settingsBtn.innerHTML = "⚙"
  settingsBtn.title = "Pengaturan Tampilan"
  settingsBtn.onclick = openSettingsModal
  document.body.appendChild(settingsBtn)

  // Create settings modal
  const modal = document.createElement("div")
  modal.className = "settings-modal"
  modal.id = "settingsModal"
  modal.innerHTML = `
    <div class="settings-content">
      <div class="settings-header">
        <h2>Pengaturan Tampilan</h2>
        <button class="settings-close" onclick="closeSettingsModal()">✕</button>
      </div>
      
      <div class="settings-section">
        <h3>Wallpaper Background</h3>
        <div class="wallpaper-preview" id="wallpaperPreview">
          <span class="placeholder">Belum ada wallpaper</span>
        </div>
        <div class="wallpaper-actions">
          <label>
            Upload Foto
            <input type="file" id="wallpaperInput" accept="image/*" onchange="handleWallpaperUpload(event)">
          </label>
          <button class="btn-remove-wallpaper" onclick="removeWallpaper()">Hapus</button>
        </div>
        
        <div class="opacity-control">
          <label>Transparansi Overlay: <span id="opacityValue">85%</span></label>
          <input type="range" class="opacity-slider" id="opacitySlider" 
                 min="0" max="100" value="85" 
                 oninput="handleOpacityChange(this.value)">
        </div>
      </div>
      
      <div class="settings-section">
        <h3>Pilih Wallpaper</h3>
        <div class="preset-wallpapers" id="presetWallpapers">
          ${presetWallpapers
            .map(
              (preset) => `
            <div class="preset-wallpaper ${preset.id === "none" ? "no-wallpaper" : ""}" 
                 onclick="selectPresetWallpaper('${preset.id}')"
                 data-id="${preset.id}">
              ${
                preset.url
                  ? `<img src="${preset.url}" alt="${preset.name}">`
                  : `<span>Tanpa<br>Wallpaper</span>`
              }
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `
  document.body.appendChild(modal)

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeSettingsModal()
    }
  })

  // Initialize preview with current wallpaper
  updateSettingsUI()
}

// Update settings UI with current values
function updateSettingsUI() {
  const savedWallpaper = localStorage.getItem(WALLPAPER_KEY)
  const savedOpacity = localStorage.getItem(OPACITY_KEY) || "0.85"

  // Update preview
  const preview = document.getElementById("wallpaperPreview")
  if (preview && savedWallpaper && savedWallpaper !== "null") {
    preview.innerHTML = `<img src="${savedWallpaper}" alt="Preview">`
  }

  // Update opacity slider
  const slider = document.getElementById("opacitySlider")
  const opacityValue = document.getElementById("opacityValue")
  if (slider && opacityValue) {
    const opacityPercent = Math.round(parseFloat(savedOpacity) * 100)
    slider.value = opacityPercent
    opacityValue.textContent = `${opacityPercent}%`
  }

  // Update active preset
  updateActivePreset(savedWallpaper)
}

// Update active preset indicator
function updateActivePreset(currentUrl) {
  const presets = document.querySelectorAll(".preset-wallpaper")
  presets.forEach((preset) => {
    const presetData = presetWallpapers.find((p) => p.id === preset.dataset.id)
    const isActive =
      (!currentUrl || currentUrl === "null") && preset.dataset.id === "none"
        ? true
        : presetData && presetData.url === currentUrl

    preset.classList.toggle("active", isActive)
  })
}

// Admin password for wallpaper settings
const WALLPAPER_ADMIN_PASSWORD = "ADMIN2024"

// Open settings modal
function openSettingsModal() {
  const password = prompt("Masukkan password admin untuk mengubah wallpaper:")
  if (password !== WALLPAPER_ADMIN_PASSWORD) {
    alert("Password salah! Hanya admin yang dapat mengubah wallpaper.")
    return
  }
  
  const modal = document.getElementById("settingsModal")
  if (modal) {
    modal.classList.add("active")
    updateSettingsUI()
  }
}

// Close settings modal
function closeSettingsModal() {
  const modal = document.getElementById("settingsModal")
  if (modal) {
    modal.classList.remove("active")
  }
}

// Handle wallpaper upload
function handleWallpaperUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Ukuran file terlalu besar. Maksimal 5MB.")
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target.result
    const currentOpacity = parseFloat(localStorage.getItem(OPACITY_KEY) || "0.85")
    saveWallpaper(dataUrl, currentOpacity)
    updateActivePreset(dataUrl)

    // Update preview
    const preview = document.getElementById("wallpaperPreview")
    if (preview) {
      preview.innerHTML = `<img src="${dataUrl}" alt="Preview">`
    }
  }
  reader.readAsDataURL(file)
}

// Remove wallpaper
function removeWallpaper() {
  saveWallpaper(null)

  // Update preview
  const preview = document.getElementById("wallpaperPreview")
  if (preview) {
    preview.innerHTML = `<span class="placeholder">Belum ada wallpaper</span>`
  }

  updateActivePreset(null)
}

// Select preset wallpaper
function selectPresetWallpaper(presetId) {
  const preset = presetWallpapers.find((p) => p.id === presetId)
  if (!preset) return

  const currentOpacity = parseFloat(localStorage.getItem(OPACITY_KEY) || "0.85")
  saveWallpaper(preset.url, currentOpacity)
  updateActivePreset(preset.url)

  // Update preview
  const preview = document.getElementById("wallpaperPreview")
  if (preview) {
    if (preset.url) {
      preview.innerHTML = `<img src="${preset.url}" alt="Preview">`
    } else {
      preview.innerHTML = `<span class="placeholder">Belum ada wallpaper</span>`
    }
  }
}

// Handle opacity change
function handleOpacityChange(value) {
  const opacity = parseInt(value) / 100
  const opacityValue = document.getElementById("opacityValue")
  if (opacityValue) {
    opacityValue.textContent = `${value}%`
  }

  const currentWallpaper = localStorage.getItem(WALLPAPER_KEY)
  if (currentWallpaper && currentWallpaper !== "null") {
    saveWallpaper(currentWallpaper, opacity)
  } else {
    localStorage.setItem(OPACITY_KEY, opacity.toString())
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initWallpaper)
