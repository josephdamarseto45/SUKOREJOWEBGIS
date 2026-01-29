// Helper functions to combine images and videos into media array

function combineMedia(images, videos) {
  const media = []
  
  // Add all images
  if (images && images.length > 0) {
    images.forEach(img => {
      media.push({ type: 'image', src: img })
    })
  }
  
  // Add all videos
  if (videos && videos.length > 0) {
    videos.forEach(video => {
      media.push({ type: 'video', src: video })
    })
  }
  
  return media
}

function extractImagesAndVideos(media) {
  const images = []
  const videos = []
  
  if (media && media.length > 0) {
    media.forEach(item => {
      if (item.type === 'video') {
        videos.push(item.src)
      } else {
        images.push(item.src)
      }
    })
  }
  
  return { images, videos }
}

// Export for use in other scripts
window.combineMedia = combineMedia
window.extractImagesAndVideos = extractImagesAndVideos
