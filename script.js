document.addEventListener('DOMContentLoaded', () => {
  const ANIMATION_END_OFFSET = 0;

  // Preload loading images
  const loadingImagesSrc = [
    'assets/loading/loading-0.png',
    'assets/loading/loading-25.png',
    'assets/loading/loading-50.png',
    'assets/loading/loading-75.png',
    'assets/loading/loading-100.png'
  ];
  loadingImagesSrc.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  // Define elements
  const elements = {
    background: document.getElementById('background'),
    flowersOverlay: document.getElementById('flowers-overlay'),
    walker: document.getElementById('walker'),
    hotspot: document.getElementById('hotspot'),
    modal: document.getElementById('modal'),
    modalImage: document.getElementById('modal-image'),
    modalClose: document.getElementById('modal-close'),
    modalPrev: document.getElementById('modal-prev'),
    modalNext: document.getElementById('modal-next'),
    loadingScreen: document.getElementById('loading-screen'),
    loadingImage: document.getElementById('loading-image'),
    calloutsContainer: document.getElementById('callouts-container')
  };

  // Set initial loading image
  elements.loadingImage.src = 'assets/loading/loading-0.png';

  // Define all images to load
  const backgroundImages = [
    {
      src: window.innerWidth <= 768 ? 'backgrounds/page1-mobile.png' : 'backgrounds/page1.png',
      width: window.innerWidth <= 768 ? 1080 : 1920
    },
    { 
      src: 'backgrounds/room-strip.PNG', 
      width: 12362 
    }
  ];
  
  // Add the flowers overlay image that will appear above the walker
  const flowersImage = {
    src: 'backgrounds/flowers-overlay.PNG', // Update with your actual filename
    width: 12362 // Same width as your room background
  };

  const walkingFrames = Array.from(
    { length: 20 },
    (_, i) => `walking-frames/Layer_${i.toString().padStart(2, '0')}.png`
  );
  const revWalkingFrames = Array.from(
    { length: 20 },
    (_, i) => `rev-walking-frame/fwalkcycle${i.toString().padStart(2, '0')}.png`
  );
  const allWalkerFrames = [...walkingFrames, ...revWalkingFrames];
  const hotspotImages = document.querySelectorAll('.hotspot img');

  // Include flowers overlay in the total images to load
  const totalImagesToLoad = backgroundImages.length + 1 + allWalkerFrames.length + hotspotImages.length; 
  let loadedImages = 0;

  // Function to update loading screen
  function updateLoading() {
    const percentage = (loadedImages / totalImagesToLoad) * 100;
    console.log('Loading: ' + percentage + '%'); // Debug loading progress

    let loadingSrc;
    if (percentage < 25) {
      loadingSrc = 'assets/loading/loading-0.png';
    } else if (percentage < 50) {
      loadingSrc = 'assets/loading/loading-25.png';
    } else if (percentage < 75) {
      loadingSrc = 'assets/loading/loading-50.png';
    } else if (percentage < 100) {
      loadingSrc = 'assets/loading/loading-75.png';
    } else {
      loadingSrc = 'assets/loading/loading-100.png';

       // Update the fade out sequence
    setTimeout(() => {
      elements.loadingScreen.style.opacity = '0';
      setTimeout(() => {
        elements.loadingScreen.style.display = 'none';
        document.body.classList.remove('loading');
        initializeSystem();
      }, 500);
    }, 500);
  }
    elements.loadingImage.src = loadingSrc;
  }

  // Track hotspot images
  hotspotImages.forEach(img => {
    if (img.complete) {
      loadedImages++;
      updateLoading();
    } else {
      img.onload = () => {
        loadedImages++;
        updateLoading();
      };
    }
  });

  // Preload walker frames and track
  allWalkerFrames.forEach(src => {
    const img = new Image();
    img.src = src;
    if (img.complete) {
      loadedImages++;
      updateLoading();
    } else {
      img.onload = () => {
        loadedImages++;
        updateLoading();
      };
    }
  });

  // Load backgrounds and track
  // backgroundImages.forEach((imgData, index) => {
  //   const img = new Image();
  //   img.onload = () => {
  //     if (index === 0) img.classList.add('first-background');
      
  //     img.style.width = `${imgData.width}px`;
  //     loadedImages++;
  //     updateLoading();
  //   };
  //   img.src = imgData.src;
  //   elements.background.appendChild(img);
  //   if (img.complete) {
  //     img.onload();
  //   }
  // });

  // Update the background image loading part
backgroundImages.forEach((imgData, index) => {
  const img = new Image();
  img.onload = () => {
    if (index === 0) {
      img.classList.add('first-background');
      // Immediately append and show first background
      elements.background.appendChild(img);
      img.style.width = `${imgData.width}px`;
    }
    loadedImages++;
    updateLoading();
    
    // Only append other images after loading completes
    if (index > 0) {
      elements.background.appendChild(img);
      img.style.width = `${imgData.width}px`;
    }``
  };
  img.src = imgData.src;
  if (img.complete && index === 0) {
    img.onload();
  }
});

  // Load flowers overlay
  const flowersImg = new Image();
  flowersImg.onload = () => {
    flowersImg.style.width = `${flowersImage.width}px`;
    loadedImages++;
    updateLoading();
  };
  flowersImg.src = flowersImage.src;
  elements.flowersOverlay.appendChild(flowersImg);
  if (flowersImg.complete) {
    flowersImg.onload();
  }

  // Initialize system
  function initializeSystem() {
    const currentState = {
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
      isMobile: window.innerWidth <= 768,
      firstImageWidth: backgroundImages[0].width
    };

    // Adjust walker size for mobile
    if (currentState.isMobile) {
      elements.walker.style.width = '400px';
      elements.walker.style.bottom = '-10px';
    }

const positionCalloutsOnStrip = () => {
  // Only handle basic initialization
  document.querySelectorAll('.hotspot').forEach(hotspot => {
    hotspot.classList.add('active');
  });
};

    
    // Position callouts on the room strip
    positionCalloutsOnStrip();
    
    // Fix flowers overlay to start at room-strip position
    const flowersOverlayImg = elements.flowersOverlay.querySelector('img');
    flowersOverlayImg.style.marginLeft = `${currentState.firstImageWidth}px`;

    function enforceBoundaries() {
      const actualMax = elements.background.scrollWidth - window.innerWidth;
      const adjustedMax = actualMax - currentState.animationEndOffset;

      currentState.maxPosition = Math.max(0, adjustedMax);
      currentState.position = Math.max(
        0,
        Math.min(currentState.position, currentState.maxPosition)
      );
      currentState.targetPosition = Math.max(
        0,
        Math.min(currentState.targetPosition, currentState.maxPosition)
      );
    }

    function updateWalk() {
      enforceBoundaries();

      if (Math.abs(currentState.targetPosition - currentState.position) > 0.5) {
        currentState.position +=
          (currentState.targetPosition - currentState.position) * 0.1;
      }

      const room1Start = currentState.firstImageWidth;
      const animationStartPoint = currentState.isMobile ? room1Start -600 : room1Start - 1200;

      const shouldShowWalker = currentState.position >= animationStartPoint && !currentState.modalOpen;

      elements.walker.style.opacity = shouldShowWalker ? '1' : '0';

      if (shouldShowWalker) {
        const intendedDirection = currentState.targetPosition - currentState.position;
        const frameSet = intendedDirection >= 0 ? walkingFrames : revWalkingFrames;

        const currentDirection = currentState.position - currentState.previousPosition;

        const progress =
          (currentState.position - animationStartPoint) /
          (currentState.maxPosition - animationStartPoint);

        currentState.frame = Math.floor(progress * 30 * 20) % 20;
        elements.walker.src = frameSet[currentState.frame];
      }

      // Move both background and flowers overlay together
      elements.background.style.transform = `translateX(-${currentState.position}px)`;
      elements.flowersOverlay.querySelector('img').style.transform = `translateX(-${currentState.position}px)`;
      
      // Move callouts container in sync with background
      elements.calloutsContainer.style.transform = `translateX(-${currentState.position}px)`;
      
      currentState.previousPosition = currentState.position;
      requestAnimationFrame(updateWalk);
    }

    window.addEventListener('resize', () => {
      currentState.viewportWidth = window.innerWidth;
      currentState.isMobile = window.innerWidth <= 768;
      const firstBackgroundImg = document.querySelector('.first-background');
  currentState.firstPageWidth = firstBackgroundImg 
    ? firstBackgroundImg.offsetWidth 
    : (currentState.isMobile ? 1080 : 1920);

  // Update flowers overlay margin
  flowersImg.style.marginLeft = `${currentState.firstPageWidth}px`;
      currentState.firstImageWidth = window.innerWidth <= 768 ? 1080 : 1920;

      if (currentState.isMobile) {
        elements.walker.style.width = '400px';
        elements.walker.style.bottom = '-10px';
      } else {
        elements.walker.style.width = '1000px';
        elements.walker.style.bottom = '-20px';
      }

      // Reposition callouts when window is resized
      // positionCalloutsOnStrip();
     
      // flowersOverlayImg.style.marginLeft = `${currentState.firstImageWidth}px`;

      enforceBoundaries();
     const translateX = `translateX(-${currentState.position}px)`;
  elements.background.style.transform = translateX;
  elements.flowersOverlay.style.transform = translateX;
  elements.calloutsContainer.style.transform = translateX;
    });

    elements.hotspot.classList.add('active');

    elements.hotspot.addEventListener(
      'click',
      function(e) {
        e.stopPropagation();
        this.classList.toggle('zoomed');
        currentState.isZoomed = !currentState.isZoomed;
        if (currentState.isZoomed) showPanel(1);
        else showPanel(0);
      },
      { capture: true }
    );

    const scrollSensitivity = currentState.isMobile ? 1 : 2;

    window.addEventListener(
      'wheel',
      e => {
        if (!e.target.closest('#hotspot')) {
          e.preventDefault();
          currentState.targetPosition += e.deltaY * scrollSensitivity;
          enforceBoundaries();
        }
      },
      { passive: false }
    );

    let touchY = 0;
    window.addEventListener('touchstart', e => (touchY = e.touches[0].clientY));
    window.addEventListener(
      'touchmove',
      e => {
        if (!e.target.closest('#hotspot')) {
          e.preventDefault();
          const delta = e.touches[0].clientY - touchY;
          currentState.targetPosition += delta * (currentState.isMobile ? 2.5 : 2);
          enforceBoundaries();
          touchY = e.touches[0].clientY;
        }
      },
      { passive: false }
    );

    function showPanel(panelNumber) {
      currentState.currentPanel = panelNumber;
      const folder = window.innerWidth <= 768 ? 'mobile' : 'desktop';
      elements.modalImage.src = `assets/texts/${folder}/${panelNumber}.png`;
      elements.modal.classList.toggle('visible', panelNumber > 0);

      currentState.modalOpen = panelNumber > 0;

      elements.modalPrev.style.display = panelNumber > 1 ? 'block' : 'none';
      elements.modalNext.style.display = panelNumber < 3 ? 'block' : 'none';
    }

    elements.modalNext.addEventListener('click', e => {
      e.preventDefault();
      if (currentState.currentPanel < currentState.totalPanels)
        showPanel(currentState.currentPanel + 1);
    });

    elements.modalPrev.addEventListener('click', e => {
      e.preventDefault();
      if (currentState.currentPanel > 1)
        showPanel(currentState.currentPanel - 1);
    });

    elements.modalClose.addEventListener('click', e => {
      e.preventDefault();
      elements.hotspot.classList.remove('zoomed');
      currentState.isZoomed = false;
      elements.modal.classList.remove('visible');
      currentState.modalOpen = false;
    });

    requestAnimationFrame(updateWalk);
  }
});