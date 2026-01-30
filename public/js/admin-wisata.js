// Admin panel for tourism management - menggunakan Supabase database via API
const WISATA_ADMIN_API_BASE = "/api/admin/settings";
let ADMIN_PASSWORD_WISATA = "WISATA2026";
const EDIT_DELETE_PASSCODE_WISATA = "EDIT2026";
const WISATA_PASSWORD_STORAGE_KEY = "admin_wisata_password";

let mapPickerWisata, mapPickerWisataEdit;
let addMarkerWisata, editMarkerWisata;
let selectedAddWisataImages = [];
let selectedAddWisataVideos = [];
let selectedEditWisataImages = [];
let selectedEditWisataVideos = [];
let deletedExistingWisataImages = [];
let deletedExistingWisataVideos = [];

// Load password from API
async function loadWisataAdminPassword() {
  try {
    const response = await fetch(`${WISATA_ADMIN_API_BASE}?type=wisata`);
    if (response.ok) {
      const data = await response.json();
      if (data.password_hash) {
        ADMIN_PASSWORD_WISATA = data.password_hash;
      }
    }
  } catch (error) {
    console.error("Error loading wisata admin password:", error);
    // Fallback to localStorage
    if (localStorage.getItem(WISATA_PASSWORD_STORAGE_KEY)) {
      ADMIN_PASSWORD_WISATA = localStorage.getItem(WISATA_PASSWORD_STORAGE_KEY);
    }
  }
}

// Initialize password on load
loadWisataAdminPassword();

window.loginWisata = async () => {
  const password = document.getElementById("loginPassword").value;

  try {
    // Verify password via API
    const response = await fetch(WISATA_ADMIN_API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "wisata", password: password }),
    });

    const result = await response.json();

    if (result.valid) {
      document.getElementById("loginSection").style.display = "none";
      document.getElementById("adminSection").style.display = "block";
      setTimeout(async () => {
        initializeMaps();
        await loadWisataTable();
      }, 100);
    } else {
      alert("Password salah!");
    }
  } catch (error) {
    console.error("Error verifying password:", error);
    // Fallback to local verification
    if (password === ADMIN_PASSWORD_WISATA) {
      document.getElementById("loginSection").style.display = "none";
      document.getElementById("adminSection").style.display = "block";
      setTimeout(async () => {
        initializeMaps();
        await loadWisataTable();
      }, 100);
    } else {
      alert("Password salah!");
    }
  }
};

window.logoutWisata = () => {
  document.getElementById("adminSection").style.display = "none";
  document.getElementById("loginSection").style.display = "flex";
  document.getElementById("loginPassword").value = "";
};

// Change password functions for Wisata admin
window.openChangePasswordModalWisata = () => {
  const passcode = prompt("Masukkan passcode untuk mengubah password:");
  if (passcode !== EDIT_DELETE_PASSCODE_WISATA) {
    alert("Passcode salah! Anda tidak memiliki akses untuk mengubah password.");
    return;
  }

  document.getElementById("changePasswordModalWisata").style.display = "flex";
  document.getElementById("oldPasswordWisata").value = "";
  document.getElementById("newPasswordWisata").value = "";
  document.getElementById("confirmPasswordWisata").value = "";
};

window.closeChangePasswordModalWisata = () => {
  document.getElementById("changePasswordModalWisata").style.display = "none";
};

window.changePasswordWisata = async () => {
  const oldPassword = document.getElementById("oldPasswordWisata").value;
  const newPassword = document.getElementById("newPasswordWisata").value;
  const confirmPassword = document.getElementById(
    "confirmPasswordWisata",
  ).value;

  if (!oldPassword || !newPassword || !confirmPassword) {
    alert("Semua field harus diisi!");
    return;
  }

  if (newPassword.length < 6) {
    alert("Password baru minimal 6 karakter!");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Konfirmasi password tidak sesuai!");
    return;
  }

  try {
    const response = await fetch(WISATA_ADMIN_API_BASE, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "wisata",
        oldPassword: oldPassword,
        newPassword: newPassword,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      ADMIN_PASSWORD_WISATA = newPassword;
      localStorage.setItem(WISATA_PASSWORD_STORAGE_KEY, newPassword);
      alert("Password berhasil diubah!");
      window.closeChangePasswordModalWisata();
    } else {
      alert(result.error || "Gagal mengubah password!");
    }
  } catch (error) {
    console.error("Error changing password:", error);
    // Fallback to local verification
    if (oldPassword !== ADMIN_PASSWORD_WISATA) {
      alert("Password lama tidak sesuai!");
      return;
    }
    ADMIN_PASSWORD_WISATA = newPassword;
    localStorage.setItem(WISATA_PASSWORD_STORAGE_KEY, newPassword);
    alert("Password berhasil diubah!");
    window.closeChangePasswordModalWisata();
  }
};

// Load stored password on page load (fallback)
if (localStorage.getItem(WISATA_PASSWORD_STORAGE_KEY)) {
  ADMIN_PASSWORD_WISATA = localStorage.getItem(WISATA_PASSWORD_STORAGE_KEY);
}

function initializeMaps() {
  // Initialize add map
  if (!mapPickerWisata) {
    mapPickerWisata = window.L.map("mapPickerWisata").setView(
      [-7.5626, 110.8282],
      13,
    );
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapPickerWisata);

    mapPickerWisata.on("click", (e) => {
      if (addMarkerWisata) {
        mapPickerWisata.removeLayer(addMarkerWisata);
      }
      addMarkerWisata = window.L.marker(e.latlng, {
        icon: window.L.divIcon({
          html: '<div style="background: #ef4444; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        }),
      }).addTo(mapPickerWisata);
      document.getElementById("latWisata").value = e.latlng.lat.toFixed(6);
      document.getElementById("lngWisata").value = e.latlng.lng.toFixed(6);
    });

    // Photo preview for add form
    document.getElementById("fotoWisata").addEventListener("change", (e) => {
      handlePhotoPreview(e, "previewContainer");
    });
  }

  // Initialize edit map
  if (!mapPickerWisataEdit) {
    mapPickerWisataEdit = window.L.map("mapPickerWisataEdit").setView(
      [-7.5626, 110.8282],
      13,
    );
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapPickerWisataEdit);

    mapPickerWisataEdit.on("click", (e) => {
      if (editMarkerWisata) {
        mapPickerWisataEdit.removeLayer(editMarkerWisata);
      }
      editMarkerWisata = window.L.marker(e.latlng, {
        icon: window.L.divIcon({
          html: '<div style="background: #3b82f6; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        }),
      }).addTo(mapPickerWisataEdit);
      document.getElementById("editLatWisata").value = e.latlng.lat.toFixed(6);
      document.getElementById("editLngWisata").value = e.latlng.lng.toFixed(6);
    });

    // Photo preview for edit form
    document
      .getElementById("editFotoWisata")
      .addEventListener("change", (e) => {
        handlePhotoPreview(e, "editPreviewContainer");
      });
  }

  // Force map to render properly
  setTimeout(() => {
    if (mapPickerWisata) {
      mapPickerWisata.invalidateSize();
    }
    if (mapPickerWisataEdit) {
      mapPickerWisataEdit.invalidateSize();
    }
  }, 100);
}

// Preview wisata images for add
window.previewAddWisataImages = (event) => {
  const files = event.target.files;
  selectedAddWisataImages = [...selectedAddWisataImages, ...Array.from(files)];
  renderAddWisataMediaPreviews();
};

// Preview wisata videos for add
window.previewAddWisataVideos = (event) => {
  try {
    const files = event.target.files;
    console.log(
      `[v0] previewAddWisataVideos: ${files.length} video files selected`,
    );

    // Validate file sizes and add valid ones
    const validFiles = [];
    Array.from(files).forEach((file, index) => {
      const sizeMB = file.size / 1024 / 1024;
      if (file.size > 20 * 1024 * 1024) {
        console.warn(
          `[v0] Video ${index + 1} terlalu besar: ${sizeMB.toFixed(2)}MB`,
        );
        alert(
          `Video ${index + 1} terlalu besar! Maksimal 20MB per video untuk performa optimal.`,
        );
        return;
      }
      console.log(
        `[v0] Video ${index + 1} valid: ${sizeMB.toFixed(2)}MB, type: ${file.type}`,
      );
      validFiles.push(file);
    });

    console.log(
      `[v0] Adding ${validFiles.length} valid videos to selectedAddWisataVideos`,
    );
    selectedAddWisataVideos = [...selectedAddWisataVideos, ...validFiles];
    console.log(
      `[v0] selectedAddWisataVideos length now: ${selectedAddWisataVideos.length}`,
    );

    renderAddWisataMediaPreviews();
  } catch (error) {
    console.error("[v0] Error in previewAddWisataVideos:", error);
    alert("Terjadi error saat memproses video");
  }
};

// Preview wisata videos for edit
window.previewEditWisataVideos = (event) => {
  try {
    const files = event.target.files;
    console.log(
      `[v0] previewEditWisataVideos: ${files.length} video files selected`,
    );

    // Validate file sizes and add valid ones
    const validFiles = [];
    Array.from(files).forEach((file, index) => {
      const sizeMB = file.size / 1024 / 1024;
      if (file.size > 20 * 1024 * 1024) {
        console.warn(
          `[v0] Video ${index + 1} terlalu besar: ${sizeMB.toFixed(2)}MB`,
        );
        alert(
          `Video ${index + 1} terlalu besar! Maksimal 20MB per video untuk performa optimal.`,
        );
        return;
      }
      console.log(
        `[v0] Video ${index + 1} valid: ${sizeMB.toFixed(2)}MB, type: ${file.type}`,
      );
      validFiles.push(file);
    });

    console.log(
      `[v0] Adding ${validFiles.length} valid videos to selectedEditWisataVideos`,
    );
    selectedEditWisataVideos = [...selectedEditWisataVideos, ...validFiles];
    console.log(
      `[v0] selectedEditWisataVideos length now: ${selectedEditWisataVideos.length}`,
    );

    renderEditWisataMediaPreviews();
  } catch (error) {
    console.error("[v0] Error in previewEditWisataVideos:", error);
    alert("Terjadi error saat memproses video");
  }
};

// Render add wisata media previews
function renderAddWisataMediaPreviews() {
  const container = document.getElementById("previewContainer");
  const videoContainer = document.getElementById("videoPreviewContainer");
  if (!container || !videoContainer) return;

  container.innerHTML = "";
  videoContainer.innerHTML = "";

  // Images
  if (selectedAddWisataImages.length > 0) {
    selectedAddWisataImages.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imgDiv = document.createElement("div");
          imgDiv.style.position = "relative";
          imgDiv.style.display = "inline-block";
          imgDiv.style.marginRight = "8px";
          imgDiv.innerHTML = `
            <img src="${e.target.result}" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
            <span style="position: absolute; top: -8px; right: -8px; background: #059669; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
            <button type="button" data-index="${index}" onclick="deleteAddWisataImage(this)" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
          `;
          container.appendChild(imgDiv);
        } catch (err) {
          console.error("[v0] Error rendering image:", err);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Videos
  if (selectedAddWisataVideos.length > 0) {
    selectedAddWisataVideos.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const vidDiv = document.createElement("div");
          vidDiv.style.position = "relative";
          vidDiv.style.display = "inline-block";
          vidDiv.style.marginRight = "8px";
          vidDiv.innerHTML = `
            <video style="width: 120px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
              <source src="${e.target.result}" type="video/mp4">
            </video>
            <span style="position: absolute; top: -8px; right: -8px; background: #059669; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
            <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; pointer-events: none;">▶</span>
            <button type="button" data-index="${index}" onclick="deleteAddWisataVideo(this)" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
          `;
          videoContainer.appendChild(vidDiv);
        } catch (err) {
          console.error("[v0] Error rendering video:", err);
        }
      };
      reader.readAsDataURL(file);
    });
  }
}

// Render edit wisata media previews
function renderEditWisataMediaPreviews() {
  const container = document.getElementById("editPreviewContainer");
  const videoContainer = document.getElementById("editVideoPreviewContainer");
  if (!container || !videoContainer) return;

  container.innerHTML = "";
  videoContainer.innerHTML = "";

  // Existing images
  if (window.existingWisataImages && window.existingWisataImages.length > 0) {
    window.existingWisataImages.forEach((img, index) => {
      const imgDiv = document.createElement("div");
      imgDiv.style.position = "relative";
      imgDiv.style.display = "inline-block";
      imgDiv.style.marginRight = "8px";
      imgDiv.innerHTML = `
        <img src="${img}" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
        <span style="position: absolute; top: -8px; right: -8px; background: #059669; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
        <button type="button" data-index="${index}" onclick="deleteEditWisataExistingImage(this)" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
      `;
      container.appendChild(imgDiv);
    });
  }

  // New images
  if (selectedEditWisataImages.length > 0) {
    selectedEditWisataImages.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imgDiv = document.createElement("div");
          imgDiv.style.position = "relative";
          imgDiv.style.display = "inline-block";
          imgDiv.style.marginRight = "8px";
          imgDiv.innerHTML = `
            <img src="${e.target.result}" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
            <span style="position: absolute; top: -8px; right: -8px; background: #059669; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
            <button type="button" data-index="${index}" onclick="deleteEditWisataNewImage(this)" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
          `;
          container.appendChild(imgDiv);
        } catch (err) {
          console.error("[v0] Error rendering new image:", err);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Existing videos
  if (window.existingWisataVideos && window.existingWisataVideos.length > 0) {
    window.existingWisataVideos.forEach((vid, index) => {
      const vidDiv = document.createElement("div");
      vidDiv.style.position = "relative";
      vidDiv.style.display = "inline-block";
      vidDiv.style.marginRight = "8px";
      vidDiv.innerHTML = `
        <video style="width: 120px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
          <source src="${vid}" type="video/mp4">
        </video>
        <span style="position: absolute; top: -8px; right: -8px; background: #059669; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
        <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; pointer-events: none;">▶</span>
        <button type="button" data-index="${index}" onclick="deleteEditWisataExistingVideo(this)" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
      `;
      videoContainer.appendChild(vidDiv);
    });
  }

  // New videos
  if (selectedEditWisataVideos.length > 0) {
    selectedEditWisataVideos.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const vidDiv = document.createElement("div");
          vidDiv.style.position = "relative";
          vidDiv.style.display = "inline-block";
          vidDiv.style.marginRight = "8px";
          vidDiv.innerHTML = `
            <video style="width: 120px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0;">
              <source src="${e.target.result}" type="video/mp4">
            </video>
            <span style="position: absolute; top: -8px; right: -8px; background: #059669; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${index + 1}</span>
            <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; pointer-events: none;">▶</span>
            <button type="button" data-index="${index}" onclick="deleteEditWisataNewVideo(this)" style="position: absolute; top: -8px; left: -8px; background: #dc2626; color: white; width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">×</button>
          `;
          videoContainer.appendChild(vidDiv);
        } catch (err) {
          console.error("[v0] Error rendering new video:", err);
        }
      };
      reader.readAsDataURL(file);
    });
  }
}

// Delete functions for wisata
function deleteAddWisataImage(btn) {
  const index = parseInt(btn.getAttribute("data-index"));
  selectedAddWisataImages.splice(index, 1);
  renderAddWisataMediaPreviews();
}

function deleteAddWisataVideo(btn) {
  const index = parseInt(btn.getAttribute("data-index"));
  selectedAddWisataVideos.splice(index, 1);
  renderAddWisataMediaPreviews();
}

function deleteEditWisataExistingImage(btn) {
  const index = parseInt(btn.getAttribute("data-index"));
  const deleted = window.existingWisataImages.splice(index, 1);
  if (deleted.length > 0) {
    deletedExistingWisataImages.push(deleted[0]);
  }
  renderEditWisataMediaPreviews();
}

function deleteEditWisataExistingVideo(btn) {
  const index = parseInt(btn.getAttribute("data-index"));
  const deleted = window.existingWisataVideos.splice(index, 1);
  if (deleted.length > 0) {
    deletedExistingWisataVideos.push(deleted[0]);
  }
  renderEditWisataMediaPreviews();
}

function deleteEditWisataNewImage(btn) {
  const index = parseInt(btn.getAttribute("data-index"));
  selectedEditWisataImages.splice(index, 1);
  renderEditWisataMediaPreviews();
}

function deleteEditWisataNewVideo(btn) {
  const index = parseInt(btn.getAttribute("data-index"));
  selectedEditWisataVideos.splice(index, 1);
  renderEditWisataMediaPreviews();
}

function handlePhotoPreview(e, containerId) {
  const file = e.target.files[0];
  const container = document.getElementById(containerId);

  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file terlalu besar! Maksimal 2MB");
      e.target.value = "";
      container.innerHTML = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      container.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px; margin-top: 8px;">`;
    };
    reader.readAsDataURL(file);
  }
}

window.getUserLocationWisata = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        mapPickerWisata.setView([lat, lng], 16);

        if (addMarkerWisata) {
          mapPickerWisata.removeLayer(addMarkerWisata);
        }

        addMarkerWisata = window.L.marker([lat, lng], {
          icon: window.L.divIcon({
            html: '<div style="background: #ef4444; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          }),
        }).addTo(mapPickerWisata);

        document.getElementById("latWisata").value = lat.toFixed(6);
        document.getElementById("lngWisata").value = lng.toFixed(6);

        alert("Lokasi Anda berhasil ditemukan!");
      },
      (error) => {
        alert("Gagal mendapatkan lokasi: " + error.message);
      },
    );
  } else {
    alert("Browser Anda tidak mendukung geolocation");
  }
};

window.getUserLocationWisataEdit = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        mapPickerWisataEdit.setView([lat, lng], 16);

        if (editMarkerWisata) {
          mapPickerWisataEdit.removeLayer(editMarkerWisata);
        }

        editMarkerWisata = window.L.marker([lat, lng], {
          icon: window.L.divIcon({
            html: '<div style="background: #3b82f6; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          }),
        }).addTo(mapPickerWisataEdit);

        document.getElementById("editLatWisata").value = lat.toFixed(6);
        document.getElementById("editLngWisata").value = lng.toFixed(6);

        alert("Lokasi Anda berhasil ditemukan!");
      },
      (error) => {
        alert("Gagal mendapatkan lokasi: " + error.message);
      },
    );
  } else {
    alert("Browser Anda tidak mendukung geolocation");
  }
};

window.addWisata = async () => {
  const nama = document.getElementById("namaWisata").value;
  const kategori = document.getElementById("kategoriWisata").value;
  const deskripsi = document.getElementById("deskripsiWisata").value;
  const lat = document.getElementById("latWisata").value;
  const lng = document.getElementById("lngWisata").value;
  const alamat = document.getElementById("alamatWisata").value;
  const jamOperasional = document.getElementById("jamOperasional").value;
  const hargaTiket = document.getElementById("hargaTiket").value;
  const kontak = document.getElementById("kontakWisata").value;

  if (!nama || !kategori || !deskripsi || !lat || !lng || !alamat) {
    alert("Mohon lengkapi semua field yang wajib diisi (*)");
    return;
  }

  const promises = [];

  // Handle images from selected array
  if (selectedAddWisataImages.length > 0) {
    const imagePromises = selectedAddWisataImages.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    promises.push(Promise.all(imagePromises));
  } else {
    promises.push(Promise.resolve([]));
  }

  // Handle videos from selected array with robust error handling
  if (selectedAddWisataVideos.length > 0) {
    const videoPromises = selectedAddWisataVideos.map((file, fileIndex) => {
      return new Promise((resolve) => {
        // Check file size first - max 20MB
        const fileSizeMB = file.size / 1024 / 1024;
        if (file.size > 20 * 1024 * 1024) {
          console.warn(
            `[v0] Video ${fileIndex + 1} terlalu besar: ${fileSizeMB.toFixed(2)}MB`,
          );
          alert(
            `Video ${fileIndex + 1} terlalu besar! Maksimal 20MB per video untuk performa optimal.`,
          );
          resolve(null);
          return;
        }

        const reader = new FileReader();
        // Increase timeout to 120 seconds for large files
        const timeout = setTimeout(() => {
          console.error(
            `[v0] Video ${fileIndex + 1} timeout saat membaca file (>120s)`,
          );
          reader.abort();
          alert(
            `Video ${fileIndex + 1} timeout. File terlalu besar atau koneksi lambat.`,
          );
          resolve(null);
        }, 120000); // 120 second timeout

        reader.onload = (e) => {
          clearTimeout(timeout);
          const base64Size = (e.target.result.length / 1024 / 1024).toFixed(2);
          console.log(
            `[v0] Video ${fileIndex + 1} berhasil dikonversi, ukuran base64: ${base64Size}MB`,
          );

          // Warn if base64 is too large
          if (e.target.result.length > 4 * 1024 * 1024) {
            console.warn(
              `[v0] Video ${fileIndex + 1} base64 size ${base64Size}MB mungkin terlalu besar`,
            );
          }

          resolve(e.target.result);
        };
        reader.onerror = () => {
          clearTimeout(timeout);
          console.error(
            `[v0] Error membaca video file ${fileIndex + 1}:`,
            reader.error,
          );
          alert(
            `Gagal membaca video ${fileIndex + 1}: ${reader.error || "Unknown error"}`,
          );
          resolve(null);
        };
        reader.onabort = () => {
          clearTimeout(timeout);
          console.warn(`[v0] Video ${fileIndex + 1} dibatalkan`);
          alert(`Video ${fileIndex + 1} dibatalkan. Silahkan coba lagi.`);
          resolve(null);
        };

        console.log(
          `[v0] Mulai membaca video ${fileIndex + 1}, ukuran: ${fileSizeMB.toFixed(2)}MB`,
        );
        reader.readAsDataURL(file);
      });
    });
    promises.push(Promise.all(videoPromises));
  } else {
    promises.push(Promise.resolve([]));
  }

  Promise.all(promises)
    .then(async ([images, videos]) => {
      try {
        // Filter out null values from failed conversions
        const validVideos = videos.filter((v) => v !== null);

        if (selectedAddWisataVideos.length > 0 && validVideos.length === 0) {
          console.warn("[v0] Semua video gagal dikonversi");
          alert(
            "Gagal memproses video. Pastikan file tidak terlalu besar dan format didukung.",
          );
          return;
        }

        console.log("[v0] Add wisata data:", {
          images: images.length,
          videos: validVideos.length,
        });

        const wisataData = {
          nama: nama,
          kategori: kategori,
          deskripsi: deskripsi,
          alamat: alamat,
          lat: Number.parseFloat(lat),
          lng: Number.parseFloat(lng),
          foto: images.length > 0 ? images[0] : null,
          foto_list: images,
          video_list: validVideos,
          jamOperasional: jamOperasional,
          hargaTiket: hargaTiket,
          kontak: kontak,
        };

        window.addNewWisata(wisataData);
        alert("Destinasi wisata berhasil ditambahkan!");
        clearAddForm();
        await loadWisataTable();
      } catch (error) {
        console.error("[v0] Error in addWisata Promise.then:", error);

        // Check if it's localStorage quota exceeded
        if (
          error.name === "QuotaExceededError" ||
          error.message.includes("quota")
        ) {
          alert(
            "Data terlalu besar! Gunakan video yang lebih kecil atau kompres terlebih dahulu.",
          );
        } else {
          alert(
            `Terjadi error saat menyimpan: ${error.message || "Unknown error"}`,
          );
        }
      }
    })
    .catch((err) => {
      console.error("[v0] Error in addWisata:", err);

      // Check if it's localStorage quota exceeded
      if (err.name === "QuotaExceededError" || err.message.includes("quota")) {
        alert(
          "Data terlalu besar! Gunakan video yang lebih kecil atau kompres terlebih dahulu.",
        );
      } else {
        alert(
          `Terjadi error saat menambah wisata: ${err.message || "Unknown error"}`,
        );
      }
    });
};

function clearAddForm() {
  document.getElementById("namaWisata").value = "";
  document.getElementById("kategoriWisata").value = "";
  document.getElementById("deskripsiWisata").value = "";
  document.getElementById("latWisata").value = "";
  document.getElementById("lngWisata").value = "";
  document.getElementById("alamatWisata").value = "";
  document.getElementById("fotoWisata").value = "";
  document.getElementById("videoWisata").value = "";
  document.getElementById("jamOperasional").value = "";
  document.getElementById("hargaTiket").value = "";
  document.getElementById("kontakWisata").value = "";
  document.getElementById("previewContainer").innerHTML = "";
  document.getElementById("videoPreviewContainer").innerHTML = "";
  selectedAddWisataImages = [];
  selectedAddWisataVideos = [];
}

async function loadWisataTable() {
  const tbody = document.getElementById("wisataTableBody");
  const wisataData = await window.getAllWisataAsync();

  if (wisataData.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align: center; color: #64748b;">Belum ada data wisata</td></tr>';
    return;
  }

  tbody.innerHTML = "";
  wisataData.forEach((wisata) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${wisata.nama}</strong></td>
      <td>${wisata.kategori}</td>
      <td>${wisata.deskripsi.substring(0, 100)}${wisata.deskripsi.length > 100 ? "..." : ""}</td>
      <td>${wisata.lat.toFixed(4)}, ${wisata.lng.toFixed(4)}</td>
      <td class="table-actions">
        <button onclick="window.editWisata(${wisata.id})" class="btn-edit">Edit</button>
        <button onclick="window.deleteWisata(${wisata.id})" class="btn-delete-small">Hapus</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.editWisata = (id) => {
  const passcode = prompt("Masukkan passcode untuk mengedit:");
  if (passcode !== EDIT_DELETE_PASSCODE_WISATA) {
    alert("Passcode salah!");
    return;
  }

  const wisata = window.getWisataById(id);
  if (!wisata) return;

  // Initialize media arrays and data
  const images =
    wisata.foto_list && wisata.foto_list.length > 0
      ? wisata.foto_list
      : wisata.foto
        ? [wisata.foto]
        : [];
  const videos =
    wisata.video_list && wisata.video_list.length > 0 ? wisata.video_list : [];

  window.existingWisataImages = JSON.parse(JSON.stringify(images));
  window.existingWisataVideos = JSON.parse(JSON.stringify(videos));
  selectedEditWisataImages = [];
  selectedEditWisataVideos = [];
  deletedExistingWisataImages = [];
  deletedExistingWisataVideos = [];

  document.getElementById("editWisataId").value = wisata.id;
  document.getElementById("editNamaWisata").value = wisata.nama;
  document.getElementById("editKategoriWisata").value = wisata.kategori;
  document.getElementById("editDeskripsiWisata").value = wisata.deskripsi;
  document.getElementById("editLatWisata").value = wisata.lat;
  document.getElementById("editLngWisata").value = wisata.lng;
  document.getElementById("editAlamatWisata").value = wisata.alamat || "";
  document.getElementById("editJamOperasional").value =
    wisata.jamOperasional || "";
  document.getElementById("editHargaTiket").value = wisata.hargaTiket || "";
  document.getElementById("editKontakWisata").value = wisata.kontak || "";

  // Render existing media previews
  renderEditWisataMediaPreviews();

  if (editMarkerWisata) {
    mapPickerWisataEdit.removeLayer(editMarkerWisata);
  }
  editMarkerWisata = window.L.marker([wisata.lat, wisata.lng], {
    icon: window.L.divIcon({
      html: '<div style="background: #3b82f6; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    }),
  }).addTo(mapPickerWisataEdit);
  mapPickerWisataEdit.setView([wisata.lat, wisata.lng], 15);

  document.getElementById("editSection").style.display = "block";
  document.getElementById("editSection").scrollIntoView({ behavior: "smooth" });

  setTimeout(() => {
    mapPickerWisataEdit.invalidateSize();
  }, 300);
};

window.updateWisata = async () => {
  const id = document.getElementById("editWisataId").value;
  const nama = document.getElementById("editNamaWisata").value;
  const kategori = document.getElementById("editKategoriWisata").value;
  const deskripsi = document.getElementById("editDeskripsiWisata").value;
  const lat = document.getElementById("editLatWisata").value;
  const lng = document.getElementById("editLngWisata").value;
  const alamat = document.getElementById("editAlamatWisata").value;
  const jamOperasional = document.getElementById("editJamOperasional").value;
  const hargaTiket = document.getElementById("editHargaTiket").value;
  const kontak = document.getElementById("editKontakWisata").value;

  if (!nama || !kategori || !deskripsi || !lat || !lng || !alamat) {
    alert("Mohon lengkapi semua field yang wajib diisi (*)");
    return;
  }

  const promises = [];

  // Handle images from selected array
  if (selectedEditWisataImages.length > 0) {
    const imagePromises = selectedEditWisataImages.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    promises.push(Promise.all(imagePromises));
  } else {
    promises.push(Promise.resolve([]));
  }

  // Handle videos from selected array
  if (selectedEditWisataVideos.length > 0) {
    const videoPromises = selectedEditWisataVideos.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    promises.push(Promise.all(videoPromises));
  } else {
    promises.push(Promise.resolve([]));
  }

  Promise.all(promises)
    .then(async ([newImages, newVideos]) => {
      // Combine existing media with new media, excluding deleted ones
      const finalImages = [
        ...(window.existingWisataImages || []).filter(
          (img) => !deletedExistingWisataImages.includes(img),
        ),
        ...newImages,
      ].filter((v) => v);

      const finalVideos = [
        ...(window.existingWisataVideos || []).filter(
          (vid) => !deletedExistingWisataVideos.includes(vid),
        ),
        ...newVideos,
      ].filter((v) => v);

      const updatedData = {
        nama: nama,
        kategori: kategori,
        deskripsi: deskripsi,
        alamat: alamat,
        lat: Number.parseFloat(lat),
        lng: Number.parseFloat(lng),
        foto: finalImages.length > 0 ? finalImages[0] : null,
        foto_list: finalImages,
        video_list: finalVideos,
        jamOperasional: jamOperasional,
        hargaTiket: hargaTiket,
        kontak: kontak,
      };

      window.updateWisataById(id, updatedData);
      alert("Destinasi wisata berhasil diperbarui!");
      window.cancelEdit();
      await loadWisataTable();
    })
    .catch((err) => {
      console.error("[v0] Error in updateWisata:", err);
      alert("Terjadi error saat memperbarui wisata");
    });
};

window.cancelEdit = () => {
  document.getElementById("editSection").style.display = "none";
  document.getElementById("editFotoWisata").value = "";
  document.getElementById("editVideoWisata").value = "";
  document.getElementById("editPreviewContainer").innerHTML = "";
  document.getElementById("editVideoPreviewContainer").innerHTML = "";
  selectedEditWisataImages = [];
  selectedEditWisataVideos = [];
  deletedExistingWisataImages = [];
  deletedExistingWisataVideos = [];

  if (editMarkerWisata) {
    mapPickerWisataEdit.removeLayer(editMarkerWisata);
    editMarkerWisata = null;
  }
};

window.deleteWisata = async (id) => {
  const passcode = prompt("Masukkan passcode untuk menghapus:");
  if (passcode !== EDIT_DELETE_PASSCODE_WISATA) {
    alert("Passcode salah!");
    return;
  }

  if (confirm("Apakah Anda yakin ingin menghapus destinasi wisata ini?")) {
    window.deleteWisataById(id);
    alert("Destinasi wisata berhasil dihapus!");
    await loadWisataTable();
  }
};
