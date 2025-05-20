document.addEventListener('DOMContentLoaded', () => {
  const ANIMATION_END_OFFSET = 0
  const loadingImagesSrc = [
    'assets/loading/loading-0.png',
    'assets/loading/loading-25.png',
    'assets/loading/loading-50.png',
    'assets/loading/loading-75.png',
    'assets/loading/loading-100.png'
  ]
  loadingImagesSrc.forEach(src => {
    const img = new Image()
    img.src = src
  })

  const elements = {
    background: document.getElementById('background'),
    flowersOverlay: document.getElementById('flowers-overlay'),
    walker: document.getElementById('walker'),
    modal: document.getElementById('modal'),
    modalImage: document.getElementById('modal-image'),
    modalClose: document.getElementById('modal-close'),
    modalPrev: document.getElementById('modal-prev'),
    modalNext: document.getElementById('modal-next'),
    loadingScreen: document.getElementById('loading-screen'),
    loadingImage: document.getElementById('loading-image'),
    calloutsContainer: document.getElementById('callouts-container'),
    hotspots: document.querySelectorAll('.hotspot'),
    backgroundLink: document.getElementById('background-link')

  }

  elements.loadingImage.src = 'assets/loading/loading-0.png'

  const backgroundImages = [
    {
      src:
        window.innerWidth <= 768
          ? 'backgrounds/page1-mobile.png'
          : 'backgrounds/page1.png',
      isFirst: true,
      originalWidth: window.innerWidth <= 768 ? 1080 : 1920
    },
    {
      src: 'backgrounds/room-strip.PNG',
      isFirst: false,
      originalWidth: 8801 // Store original width for calculation
    }
  ]

  const flowersImage = {
    src: 'backgrounds/flowers-overlay.PNG',
    originalWidth: 12362
  }

  // Define walking animation frames
  const walkingFrames = Array.from(
    { length: 20 },
    (_, i) => `walking-frames/Layer_${i.toString().padStart(2, '0')}.png`
  )
  const revWalkingFrames = Array.from(
    { length: 20 },
    (_, i) => `rev-walking-frame/fwalkcycle${i.toString().padStart(2, '0')}.png`
  )
  const allWalkerFrames = [...walkingFrames, ...revWalkingFrames]
  const hotspotImages = document.querySelectorAll('.hotspot img')

  // Calculate total images to load for the loading screen progress
  const totalImagesToLoad =
    backgroundImages.length + 1 + allWalkerFrames.length + hotspotImages.length
  let loadedImages = 0

  function updateLoading () {
    const percentage = (loadedImages / totalImagesToLoad) * 100
    // console.log('Loading: ' + percentage.toFixed(2) + '%'); // Debug loading progress

    let loadingSrc
    if (percentage < 25) {
      loadingSrc = 'assets/loading/loading-0.png'
    } else if (percentage < 50) {
      loadingSrc = 'assets/loading/loading-25.png'
    } else if (percentage < 75) {
      loadingSrc = 'assets/loading/loading-50.png'
    } else if (percentage < 100) {
      loadingSrc = 'assets/loading/loading-75.png'
    } else {
      loadingSrc = 'assets/loading/loading-100.png'

      setTimeout(() => {
        elements.loadingScreen.style.opacity = '0'
        setTimeout(() => {
          elements.loadingScreen.style.display = 'none'
          document.body.classList.remove('loading')
          initializeSystem()
        }, 500)
      }, 500)
    }
    elements.loadingImage.src = loadingSrc
  }

  hotspotImages.forEach(img => {
    if (img.complete) {
      loadedImages++
      updateLoading()
    } else {
      img.onload = () => {
        loadedImages++
        updateLoading()
      }
      img.onerror = () => {
        // console.error('Failed to load hotspot image:', img.src)
        loadedImages++
        updateLoading()
      }
    }
  })

  allWalkerFrames.forEach(src => {
    const img = new Image()
    img.src = src
    if (img.complete) {
      loadedImages++
      updateLoading()
    } else {
      img.onload = () => {
        loadedImages++
        updateLoading()
      }
      img.onerror = () => {
        // console.error('Failed to load walker frame:', src)
        loadedImages++
        updateLoading()
      }
    }
  })

  backgroundImages.forEach((imgData, index) => {
    const img = new Image()
    img.onload = () => {
      if (imgData.isFirst) {
        img.classList.add('first-background')
      }
      elements.background.appendChild(img)
      loadedImages++
      updateLoading()
    }
    img.onerror = () => {
      // console.error('Failed to load background image:', imgData.src)
      loadedImages++
      updateLoading()
    }
    img.src = imgData.src
    // If image is already in cache, onload might not fire, so check complete
    if (img.complete) {
      img.onload()
    }
  })

  const flowersImg = new Image()
  flowersImg.onload = () => {
    elements.flowersOverlay.appendChild(flowersImg)
    loadedImages++
    updateLoading()
  }
  flowersImg.onerror = () => {
    // console.error('Failed to load flowers overlay image:', flowersImage.src)
    loadedImages++
    updateLoading()
  }
  flowersImg.src = flowersImage.src
  if (flowersImg.complete) {
    flowersImg.onload()
  }

  function initializeSystem () {
    const currentState = {
      frame: 0,
      position: 0, 
      targetPosition: 0, 
      previousPosition: 0,
      currentPanel: 1, 
      totalPanels: 3,
      isZoomed: false, 
      animationEndOffset: ANIMATION_END_OFFSET,
      modalOpen: false, 
      isMobile: window.innerWidth <= 768, 
      firstImageWidth: 0, 
      roomStripWidth: 0, 
      backgroundTotalWidth: 0, 
      hotspotData: {
      
        bird: { x: 0.02, y: 0.4 },
        burr: { x: 0.49, y: 0.05 },
        butterfly: { x: 0.56, y: 0.6 },
        millipede: { x: 0.41, y: 0.15 },
        moss: { x: 0.09, y: 0.12 },
        pollen: { x: 0.46, y: 0.6 },
        pond: { x: 0.82, y: 0.2 },
        sand: { x: 0.59, y: 0.08 },
        slime: { x: 0.68, y: 0.11 },
        slug: { x: 0.27, y: 0.15 }, 
        soil: { x: 0.19, y: 0.12 }
      }
    }

    function setupBackgroundLink() {
  const backgroundLink = document.getElementById('background-link');
  const backgroundLinkAnchor = backgroundLink ? backgroundLink.querySelector('a') : null;
  
  if (backgroundLink && backgroundLinkAnchor) {
    // Ensure the link is clickable by preventing other event handlers from interfering
    backgroundLinkAnchor.addEventListener('click', function(e) {
      // Stop event propagation to prevent other handlers from canceling this
      e.stopPropagation();
      
      // Log to console for debugging
      // console.log('Background link clicked, navigating to:', this.href);
      
      // You can also force navigation this way if needed
      // window.open(this.href, this.target);
      
      // Return true to allow default anchor behavior
      return true;
    });
      //  console.log('Background link setup complete');
  } else {
    // console.error('Background link elements not found');
  }
}
    function updateLayoutDimensions () {
      const firstBackgroundImg =
        elements.background.querySelector('.first-background')
      if (firstBackgroundImg) {
        currentState.firstImageWidth = firstBackgroundImg.offsetWidth
      } else {
        // Fallback if image not yet rendered (shouldn't happen with preloading)
        currentState.firstImageWidth = currentState.isMobile ? 1080 : 1920
      }

      const roomStripImg = elements.background.querySelector(
        'img:not(.first-background)'
      )
      if (roomStripImg) {

        const roomStripOriginalWidth = backgroundImages[1].originalWidth
        const roomStripOriginalHeight = 1080
        currentState.roomStripWidth =
          (elements.background.offsetHeight / roomStripOriginalHeight) *
          roomStripOriginalWidth
        roomStripImg.style.width = `${currentState.roomStripWidth}px`
      } else {
        currentState.roomStripWidth = backgroundImages[1].originalWidth
      }

      currentState.backgroundTotalWidth =
        currentState.firstImageWidth + currentState.roomStripWidth
      elements.background.style.width = `${currentState.backgroundTotalWidth}px`
      elements.calloutsContainer.style.width = `${currentState.backgroundTotalWidth}px`
      elements.flowersOverlay.style.width = `${currentState.backgroundTotalWidth}px` 

      if (currentState.isMobile) {
        elements.walker.style.width = '1000px' 
        elements.walker.style.bottom = '-3vh'
        elements.walker.style.left = '-80vw'
      } else {
        elements.walker.style.width = '1000px' 
        elements.walker.style.bottom = '-20px'
        elements.walker.style.left = '100px'
      }

      flowersImg.style.marginLeft = `${currentState.firstImageWidth}px`

      enforceBoundaries()
    }

    const positionCalloutsDynamically = () => {
      elements.hotspots.forEach(hotspot => {
        const hotspotClass = Array.from(hotspot.classList).find(cls =>
          cls.startsWith('hotspot-')
        )
        const hotspotName = hotspotClass.replace('hotspot-', '')
        const data = currentState.hotspotData[hotspotName]

        if (data) {
          const hotspotLeft =
            currentState.firstImageWidth + data.x * currentState.roomStripWidth
          hotspot.style.left = `${hotspotLeft}px`
          hotspot.style.top = `${data.y * 100}%` 
        }
        hotspot.classList.add('active') 
      })
    }

    updateLayoutDimensions()
    positionCalloutsDynamically()
    setupBackgroundLink();

    document.addEventListener('click', function(e) {
  // Check if click was on or within the background link
  const backgroundLink = document.getElementById('background-link');
  if (backgroundLink && (e.target === backgroundLink || backgroundLink.contains(e.target))) {
    // Allow the click on the link to work naturally
    return true;
  }
});

    function enforceBoundaries () {
      const actualMaxScroll =
        elements.background.scrollWidth - window.innerWidth
      const adjustedMax = actualMaxScroll - currentState.animationEndOffset

      currentState.maxPosition = Math.max(0, adjustedMax)
      currentState.position = Math.max(
        0,
        Math.min(currentState.position, currentState.maxPosition)
      )
      currentState.targetPosition = Math.max(
        0,
        Math.min(currentState.targetPosition, currentState.maxPosition)
      )
    }

    function updateWalk () {
      enforceBoundaries() 

      if (Math.abs(currentState.targetPosition - currentState.position) > 0.5) {
        currentState.position +=
          (currentState.targetPosition - currentState.position) * 0.1
      }

      const animationStartPoint = currentState.isMobile
        ? currentState.firstImageWidth - window.innerWidth * 0.5
        : currentState.firstImageWidth - window.innerWidth * 0.3 

      const shouldShowWalker =
        currentState.position >= animationStartPoint && !currentState.modalOpen

      elements.walker.style.opacity = shouldShowWalker ? '1' : '0'

      if (shouldShowWalker) {
        const intendedDirection =
          currentState.targetPosition - currentState.position
        const frameSet =
          intendedDirection >= 0 ? walkingFrames : revWalkingFrames

        const progress =
          (currentState.position - animationStartPoint) /
          (currentState.maxPosition - animationStartPoint)

        currentState.frame =
          Math.floor(progress * 30 * frameSet.length) % frameSet.length
        elements.walker.src = frameSet[currentState.frame]
      }

      const translateX = `translateX(-${currentState.position}px)`
      elements.background.style.transform = translateX
      elements.calloutsContainer.style.transform = translateX
      elements.flowersOverlay.style.transform = translateX

       if (elements.backgroundLink) {
    elements.backgroundLink.style.transform = translateX
  }

      currentState.previousPosition = currentState.position 
      requestAnimationFrame(updateWalk)
    }

    window.addEventListener('resize', () => {
      currentState.isMobile = window.innerWidth <= 768 
      updateLayoutDimensions()
      positionCalloutsDynamically() 
      enforceBoundaries() 
      const translateX = `translateX(-${currentState.position}px)`
      elements.background.style.transform = translateX
      elements.flowersOverlay.style.transform = translateX
      elements.calloutsContainer.style.transform = translateX

      if (elements.backgroundLink) {
    elements.backgroundLink.style.transform = translateX
  }

    })

    elements.hotspots.forEach(hotspot => {
      hotspot.addEventListener(
        'click',
        function (e) {
          e.stopPropagation()
          elements.hotspots.forEach(hs => {
            if (hs !== hotspot && hs.classList.contains('zoomed')) {
              hs.classList.remove('zoomed')
            }
          })
          this.classList.toggle('zoomed') 
          currentState.isZoomed = this.classList.contains('zoomed')
          if (currentState.isZoomed) {
            
            showPanel(1) 
          } else {
            showPanel(0) 
          }
        },
        { capture: true } 
      )
    })

    const scrollSensitivity = currentState.isMobile ? 1.5 : 0.8 

    window.addEventListener(
      'wheel',
      e => {
        if (!currentState.modalOpen && !e.target.closest('.hotspot')) {
          e.preventDefault() 
          currentState.targetPosition += e.deltaY * scrollSensitivity
          enforceBoundaries() 
        }
      },
      { passive: false } 
    )

    let touchStartX = 0 
    let touchStartY = 0 // For vertical swipe

    window.addEventListener(
      'touchstart',
      e => {
        if (!currentState.modalOpen && !e.target.closest('.hotspot')) {
          touchStartX = e.touches[0].clientX
          touchStartY = e.touches[0].clientY
        }
      },
      { passive: false }
    )

    window.addEventListener(
      'touchmove',
      e => {
        if (!currentState.modalOpen && !e.target.closest('.hotspot')) {
          e.preventDefault() 
          const deltaY = e.touches[0].clientY - touchStartY
      
          currentState.targetPosition +=
            deltaY * (currentState.isMobile ? -2.5 : -1.5) 
          enforceBoundaries()
          touchStartY = e.touches[0].clientY 
          touchStartX = e.touches[0].clientX
        }
      },
      { passive: false }
    )

    function showPanel (panelNumber) {
      currentState.currentPanel = panelNumber
      const folder = currentState.isMobile ? 'mobile' : 'desktop' 
      if (panelNumber > 0) {
        elements.modalImage.src = `assets/texts/${folder}/${panelNumber}.png`
        elements.modal.classList.add('visible')
        currentState.modalOpen = true
      } else {
        elements.modal.classList.remove('visible')
        currentState.modalOpen = false
      }

      elements.modalPrev.style.display = panelNumber > 1 ? 'block' : 'none'
      elements.modalNext.style.display =
        panelNumber < currentState.totalPanels ? 'block' : 'none'
    }

    elements.modalNext.addEventListener('click', e => {
      e.preventDefault()
      if (currentState.currentPanel < currentState.totalPanels)
        showPanel(currentState.currentPanel + 1)
    })

    elements.modalPrev.addEventListener('click', e => {
      e.preventDefault()
      if (currentState.currentPanel > 1)
        showPanel(currentState.currentPanel - 1)
    })

    elements.modalClose.addEventListener('click', e => {
      e.preventDefault()
      elements.hotspots.forEach(hs => hs.classList.remove('zoomed'))
      currentState.isZoomed = false
      elements.modal.classList.remove('visible')
      currentState.modalOpen = false
    })

    requestAnimationFrame(updateWalk)
  }
})
