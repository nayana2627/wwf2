document.addEventListener('DOMContentLoaded', () => {
  const ANIMATION_END_OFFSET = 500
 
  const backgroundImages = [
    {
      src:
        window.innerWidth <= 768
          ? 'backgrounds/page1-mobile.png'
          : 'backgrounds/page1.png',
      width: window.innerWidth <= 768 ? 1080 : 1920
    },
    { src: 'backgrounds/room1.PNG', width: 5836 },
    { src: 'backgrounds/room2.PNG', width: 10147 },
    { src: 'backgrounds/room3.PNG', width: 6158 },
    { src: 'backgrounds/room4.PNG', width: 8706 }
  ]

  const elements = {
    background: document.getElementById('background'),
    walker: document.getElementById('walker'),
    hotspot: document.getElementById('hotspot'),
    modal: document.getElementById('modal'),
    modalImage: document.getElementById('modal-image'),
    modalClose: document.getElementById('modal-close'),
    modalPrev: document.getElementById('modal-prev'),
    modalNext: document.getElementById('modal-next'),
    loadingScreen: document.getElementById('loading-screen'),
    loadingImage: document.getElementById('loading-image')
  }

  let loadedImages = 0
  let currentState = null
  // let isMobile = window.innerWidth <= 768 // Check if device is mobile

  backgroundImages.forEach((img, index) => {
    const image = new Image()
    image.onload = () => {
      if (index === 0) image.classList.add('first-background')
      image.style.width = `${img.width}px`
      loadedImages++
      if (loadedImages === backgroundImages.length) initializeSystem()
    }
    image.src = img.src
    elements.background.appendChild(image)
  })

  function initializeSystem () {
    currentState = {
      frame: 0,
      position: 0,
      targetPosition: 0,
      previousPosition: 0,
      currentPanel: 1,
      totalPanels: 4,
      viewportWidth: window.innerWidth,
      maxPosition: elements.background.scrollWidth - window.innerWidth,
      isZoomed: false,
      animationEndOffset: ANIMATION_END_OFFSET,
      modalOpen: false,
      isMobile: window.innerWidth <= 768
    }

    // Adjust walker size for mobile
    if (currentState.isMobile) {
      elements.walker.style.width = '400px' // Smaller on mobile
      elements.walker.style.bottom = '-10px' // Different position on mobile
    }

    const walkingFrames = Array.from(
      { length: 20 },
      (_, i) => `walking-frames/Layer_${i.toString().padStart(2, '0')}.png`
    )

    const revWalkingFrames = Array.from(
      { length: 20 },
      (_, i) =>
        `rev-walking-frame/fwalkcycle${i.toString().padStart(2, '0')}.png`
    )

    const allFrames = walkingFrames.concat(revWalkingFrames)
    allFrames.forEach(src => (new Image().src = src))

    function enforceBoundaries () {
      const actualMax = elements.background.scrollWidth - window.innerWidth
      const adjustedMax = actualMax - currentState.animationEndOffset

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

      // Always update position regardless of modal state
      if (Math.abs(currentState.targetPosition - currentState.position) > 0.5) {
        currentState.position +=
          (currentState.targetPosition - currentState.position) * 0.1
      }

      const room1Start = backgroundImages[0].width

      const animationStartPoint = currentState.isMobile ? room1Start - 600 : room1Start - 1200

      // Adjust animation start point based on device
      // let animationStartPoint
      // if (currentState.isMobile) {
      //   animationStartPoint = room1Start - 600 // Less offset for mobile
      // } else {
      //   animationStartPoint = room1Start - 1200 // Original offset for desktop
      // }


      // Only show walker if modal is not open and we're past the start point
      const shouldShowWalker = currentState.position >= animationStartPoint && !currentState.modalOpen

      
      elements.walker.style.opacity = shouldShowWalker ? '1' : '0'

      if (shouldShowWalker) {
        // Calculate intended direction based on TARGET movement
        const intendedDirection =
          currentState.targetPosition - currentState.position
        const frameSet =
          intendedDirection >= 0 ? walkingFrames : revWalkingFrames

        // Then calculate animation direction based on ACTUAL movement
        const currentDirection =
          currentState.position - currentState.previousPosition

        const progress =
          (currentState.position - animationStartPoint) /
          (currentState.maxPosition - animationStartPoint)

        currentState.frame = Math.floor(progress * 30 * 20) % 20
        elements.walker.src = frameSet[currentState.frame]
      }

      elements.background.style.transform = `translateX(-${currentState.position}px)`
      currentState.previousPosition = currentState.position
      requestAnimationFrame(updateWalk)
    }

    window.addEventListener('resize', () => {
      currentState.viewportWidth = window.innerWidth
      currentState.isMobile = window.innerWidth <= 768

      // Adjust walker size on resize
      if (currentState.isMobile) {
        elements.walker.style.width = '400px'
        elements.walker.style.bottom = '-10px'
      } else {
        elements.walker.style.width = '1000px'
        elements.walker.style.bottom = '-20px'
      }

      enforceBoundaries()
      elements.background.style.transform = `translateX(-${currentState.position}px)`
    })

    // Event handlers
    elements.hotspot.classList.add('active')

    elements.hotspot.addEventListener(
      'click',
      function (e) {
        e.stopPropagation()
        this.classList.toggle('zoomed')
        currentState.isZoomed = !currentState.isZoomed
        if (currentState.isZoomed) showPanel(1)
        else showPanel(0)
      },
      { capture: true }
    )

    // Adjust scroll sensitivity for mobile
    const scrollSensitivity = currentState.isMobile ? 1 : 2

    window.addEventListener(
      'wheel',
      e => {
        if (!e.target.closest('#hotspot')) {
          e.preventDefault()
          currentState.targetPosition += e.deltaY * scrollSensitivity
          enforceBoundaries()
        }
      },
      { passive: false }
    )

    let touchY = 0
    window.addEventListener('touchstart', e => (touchY = e.touches[0].clientY))
    window.addEventListener(
      'touchmove',
      e => {
        if (!e.target.closest('#hotspot')) {
          e.preventDefault()
          const delta = e.touches[0].clientY - touchY
          currentState.targetPosition +=
            delta * (currentState.isMobile ? 2.5 : 2) // More sensitive on mobile
          enforceBoundaries()
          touchY = e.touches[0].clientY
        }
      },
      { passive: false }
    )

    function showPanel (panelNumber) {
      currentState.currentPanel = panelNumber
      // Use mobile or desktop images based on screen width
      const folder = window.innerWidth <= 768 ? 'mobile' : 'desktop'
      elements.modalImage.src = `assets/texts/${folder}/${panelNumber}.png`
      elements.modal.classList.toggle('visible', panelNumber > 0)

      currentState.modalOpen = panelNumber > 0

      elements.modalPrev.style.display = panelNumber > 1 ? 'block' : 'none'
      elements.modalNext.style.display = panelNumber < 3 ? 'block' : 'none'
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
      elements.hotspot.classList.remove('zoomed')
      currentState.isZoomed = false
      elements.modal.classList.remove('visible')
      currentState.modalOpen = false // Update modal state when closing
    })

    requestAnimationFrame(updateWalk)
  }
})
