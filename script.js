document.addEventListener('DOMContentLoaded', () => {
  const ANIMATION_END_OFFSET = 0; // This offset can be adjusted if you want the animation to stop before the very end

  // Preload loading images to ensure smooth animation during loading
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

  // Define elements by their IDs
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
    hotspots: document.querySelectorAll('.hotspot') // Select all hotspots
  };

  // Set initial loading image
  elements.loadingImage.src = 'assets/loading/loading-0.png';

  // Define all background images to load
  // The first image is determined by screen width for responsive initial view
  const backgroundImages = [
    {
      src: window.innerWidth <= 768 ? 'backgrounds/page1-mobile.png' : 'backgrounds/page1.png',
      isFirst: true,
      originalWidth: window.innerWidth <= 768 ? 1080 : 1920 // Store original width for calculation
    },
    {
      src: 'backgrounds/room-strip.PNG',
      isFirst: false,
      originalWidth: 8801 // Store original width for calculation
    }
  ];

  // Define the flowers overlay image
  const flowersImage = {
    src: 'backgrounds/flowers-overlay.PNG',
    originalWidth: 12362 // Same original width as room-strip for alignment
  };

  // Define walking animation frames
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

  // Calculate total images to load for the loading screen progress
  const totalImagesToLoad = backgroundImages.length + 1 + allWalkerFrames.length + hotspotImages.length;
  let loadedImages = 0;

  // Function to update loading screen image based on progress
  function updateLoading() {
    const percentage = (loadedImages / totalImagesToLoad) * 100;
    console.log('Loading: ' + percentage.toFixed(2) + '%'); // Debug loading progress

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

      // Once 100% loaded, fade out loading screen and initialize the main system
      setTimeout(() => {
        elements.loadingScreen.style.opacity = '0';
        setTimeout(() => {
          elements.loadingScreen.style.display = 'none';
          document.body.classList.remove('loading'); // Remove loading class from body
          initializeSystem(); // Start the main application
        }, 500); // Wait for fade out to complete before hiding
      }, 500); // Small delay before starting fade out
    }
    elements.loadingImage.src = loadingSrc;
  }

  // Track hotspot images loading
  hotspotImages.forEach(img => {
    if (img.complete) {
      loadedImages++;
      updateLoading();
    } else {
      img.onload = () => {
        loadedImages++;
        updateLoading();
      };
      img.onerror = () => {
        console.error('Failed to load hotspot image:', img.src);
        loadedImages++; // Still increment to avoid getting stuck
        updateLoading();
      };
    }
  });

  // Preload walker frames and track loading
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
      img.onerror = () => {
        console.error('Failed to load walker frame:', src);
        loadedImages++;
        updateLoading();
      };
    }
  });

  // Load background images and append them to the #background container
  // This is crucial for calculating scrollWidth later
  backgroundImages.forEach((imgData, index) => {
    const img = new Image();
    img.onload = () => {
      // For the first background image, add 'first-background' class
      if (imgData.isFirst) {
        img.classList.add('first-background');
      }
      elements.background.appendChild(img); // Append image to background container
      loadedImages++;
      updateLoading();
    };
    img.onerror = () => {
      console.error('Failed to load background image:', imgData.src);
      loadedImages++;
      updateLoading();
    };
    img.src = imgData.src;
    // If image is already in cache, onload might not fire, so check complete
    if (img.complete) {
      img.onload();
    }
  });

  // Load flowers overlay image and append it to the #flowers-overlay container
  const flowersImg = new Image();
  flowersImg.onload = () => {
    elements.flowersOverlay.appendChild(flowersImg); // Append to flowers overlay container
    loadedImages++;
    updateLoading();
  };
  flowersImg.onerror = () => {
    console.error('Failed to load flowers overlay image:', flowersImage.src);
    loadedImages++;
    updateLoading();
  };
  flowersImg.src = flowersImage.src;
  if (flowersImg.complete) {
    flowersImg.onload();
  }

  // Main system initialization function
  function initializeSystem() {
    // Current state object to manage various parameters
    const currentState = {
      frame: 0,
      position: 0, // Current scroll position
      targetPosition: 0, // Target scroll position for smooth scrolling
      previousPosition: 0, // Previous scroll position for direction detection
      currentPanel: 1, // Current info panel displayed in the modal
      totalPanels: 3, // Total number of info panels (assuming 1.png, 2.png, 3.png)
      isZoomed: false, // Flag to check if a hotspot is zoomed
      animationEndOffset: ANIMATION_END_OFFSET,
      modalOpen: false, // Flag to check if the modal is open
      isMobile: window.innerWidth <= 768, // Detect mobile based on window width
      firstImageWidth: 0, // Actual rendered width of the first background image
      roomStripWidth: 0, // Actual rendered width of the room-strip background image
      backgroundTotalWidth: 0, // Combined width of all background images
 hotspotData: {
        // Define hotspot positions relative to the *room-strip* image's original width.
        // These are ratios (percentage of original width) to allow dynamic positioning.
        bird: { x: 0.02, y: 0.4 }, // Example: 5% of room-strip width, 40% of room-strip height
        burr: { x: 0.36, y: 0.15 },
        butterfly: { x: 0.40, y: 0.6 },
        millipede: { x: 0.29, y: 0.2 },
        moss: { x: 0.09, y: 0.12 },
        pollen: { x: 0.34, y: 0.6 },
        pond: { x: 0.59, y: 0.2 },
        sand: { x: 0.42, y: 0.12 },
        slime: { x: 0.49, y: 0.12 },
        slug: { x: 0.27, y: 0.15 }, // Adjusted slug position
        soil: { x: 0.13, y: 0.14 }
      }
    };

    // Function to calculate and set background and callout dimensions
    function updateLayoutDimensions() {
      // Get the actual rendered width of the first background image (page1)
      const firstBackgroundImg = elements.background.querySelector('.first-background');
      if (firstBackgroundImg) {
        currentState.firstImageWidth = firstBackgroundImg.offsetWidth;
      } else {
        // Fallback if image not yet rendered (shouldn't happen with preloading)
        currentState.firstImageWidth = currentState.isMobile ? 1080 : 1920;
      }

      // Get the actual rendered width of the room-strip background image
      const roomStripImg = elements.background.querySelector('img:not(.first-background)');
      if (roomStripImg) {
        // Calculate the rendered width based on its original aspect ratio and the current viewport height
        // This assumes the room-strip image scales to fit height
        const roomStripOriginalWidth = backgroundImages[1].originalWidth;
        const roomStripOriginalHeight = 1080; // Assuming original height of room-strip.PNG is 1080px
        currentState.roomStripWidth = (elements.background.offsetHeight / roomStripOriginalHeight) * roomStripOriginalWidth;
        roomStripImg.style.width = `${currentState.roomStripWidth}px`;
      } else {
        currentState.roomStripWidth = backgroundImages[1].originalWidth;
      }

      currentState.backgroundTotalWidth = currentState.firstImageWidth + currentState.roomStripWidth;
      elements.background.style.width = `${currentState.backgroundTotalWidth}px`;
      elements.calloutsContainer.style.width = `${currentState.backgroundTotalWidth}px`;
      elements.flowersOverlay.style.width = `${currentState.backgroundTotalWidth}px`; // Flowers overlay width

      // Adjust walker size based on screen size
      if (currentState.isMobile) {
        elements.walker.style.width = '1000px'; // Smaller walker on mobile
  elements.walker.style.bottom = '-3vh';
  elements.walker.style.left = '-80vw'; // More responsive initial position
      } else {
        elements.walker.style.width = '1000px'; // Larger walker on desktop
        elements.walker.style.bottom = '-20px';
        elements.walker.style.left = '100px';
      }

      // Position flowers overlay to align with the room-strip image
      flowersImg.style.marginLeft = `${currentState.firstImageWidth}px`;

      // Recalculate max scroll position after dimensions are updated
      enforceBoundaries();
    }

    // Function to position callouts dynamically based on the room-strip's rendered width
    const positionCalloutsDynamically = () => {
      elements.hotspots.forEach(hotspot => {
        const hotspotClass = Array.from(hotspot.classList).find(cls => cls.startsWith('hotspot-'));
        const hotspotName = hotspotClass.replace('hotspot-', '');
        const data = currentState.hotspotData[hotspotName];

        if (data) {
          // Calculate left position relative to the start of the room-strip
          const hotspotLeft = currentState.firstImageWidth + (data.x * currentState.roomStripWidth);
          hotspot.style.left = `${hotspotLeft}px`;
          hotspot.style.top = `${data.y * 100}%`; // Top position as percentage of viewport height
        }
        hotspot.classList.add('active'); // Ensure callouts are active
      });
    };

    // Call update layout and position callouts initially
    updateLayoutDimensions();
    positionCalloutsDynamically();

    // Function to enforce boundaries for scrolling
    function enforceBoundaries() {
      // Calculate the actual maximum scroll position based on rendered widths
      const actualMaxScroll = elements.background.scrollWidth - window.innerWidth;
      const adjustedMax = actualMaxScroll - currentState.animationEndOffset;

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

    // Main animation loop for walker and background scrolling
    function updateWalk() {
      enforceBoundaries(); // Ensure boundaries are respected in each frame

      // Smoothly interpolate current position towards target position
      if (Math.abs(currentState.targetPosition - currentState.position) > 0.5) {
        currentState.position +=
          (currentState.targetPosition - currentState.position) * 0.1;
      }

      // Determine when the walker should appear/animate
      const animationStartPoint = currentState.isMobile ? currentState.firstImageWidth - window.innerWidth * 0.5 : currentState.firstImageWidth - window.innerWidth * 0.3; // Adjust start point based on screen size

      const shouldShowWalker = currentState.position >= animationStartPoint && !currentState.modalOpen;

      elements.walker.style.opacity = shouldShowWalker ? '1' : '0';

      if (shouldShowWalker) {
        const intendedDirection = currentState.targetPosition - currentState.position;
        // Choose walking frames based on scroll direction
        const frameSet = intendedDirection >= 0 ? walkingFrames : revWalkingFrames;

        // Calculate progress for animation frame
        const progress =
          (currentState.position - animationStartPoint) /
          (currentState.maxPosition - animationStartPoint);

        // Ensure frame is within bounds and loops correctly
        currentState.frame = Math.floor(progress * 30 * frameSet.length) % frameSet.length;
        elements.walker.src = frameSet[currentState.frame];
      }

      // Apply transform to move background, callouts, and flowers overlay together
      const translateX = `translateX(-${currentState.position}px)`;
      elements.background.style.transform = translateX;
      elements.calloutsContainer.style.transform = translateX;
      elements.flowersOverlay.style.transform = translateX;

      currentState.previousPosition = currentState.position; // Update previous position for direction detection
      requestAnimationFrame(updateWalk); // Continue animation loop
    }

    // Event listener for window resize
    window.addEventListener('resize', () => {
      currentState.isMobile = window.innerWidth <= 768; // Update mobile status
      updateLayoutDimensions(); // Recalculate all dimensions
      positionCalloutsDynamically(); // Reposition callouts
      enforceBoundaries(); // Re-enforce boundaries
      // Instantly apply the new position to prevent visual jumps on resize
      const translateX = `translateX(-${currentState.position}px)`;
      elements.background.style.transform = translateX;
      elements.flowersOverlay.style.transform = translateX;
      elements.calloutsContainer.style.transform = translateX;
    });

    // Event listener for hotspot clicks
    elements.hotspots.forEach(hotspot => {
      hotspot.addEventListener(
        'click',
        function(e) {
          e.stopPropagation(); // Prevent event bubbling
          // Close other zoomed hotspots if any
          elements.hotspots.forEach(hs => {
            if (hs !== hotspot && hs.classList.contains('zoomed')) {
              hs.classList.remove('zoomed');
            }
          });
          this.classList.toggle('zoomed'); // Toggle zoom class for clicked hotspot
          currentState.isZoomed = this.classList.contains('zoomed');
          if (currentState.isZoomed) {
            // Determine which panel to show based on hotspot (you might need a mapping here)
            // For now, assuming only one hotspot triggers the modal and it shows panel 1
            showPanel(1); // Always show first panel when a hotspot is clicked
          } else {
            showPanel(0); // Hide panel if unzoomed
          }
        },
        { capture: true } // Capture phase to ensure it's handled before other scroll events
      );
    });

    // Scroll sensitivity for mouse wheel
    const scrollSensitivity = currentState.isMobile ? 1.5 : 0.8; // Adjusted sensitivity

    window.addEventListener(
      'wheel',
      e => {
        // Only scroll if a modal is not open and not interacting directly with a hotspot
        if (!currentState.modalOpen && !e.target.closest('.hotspot')) {
          e.preventDefault(); // Prevent default scroll behavior
          currentState.targetPosition += e.deltaY * scrollSensitivity;
          enforceBoundaries(); // Ensure target position is within boundaries
        }
      },
      { passive: false } // Required to use preventDefault
    );

    let touchStartX = 0; // For horizontal swipe (not used in this vertical scroll example, but good for completeness)
    let touchStartY = 0; // For vertical swipe

    window.addEventListener('touchstart', e => {
      if (!currentState.modalOpen && !e.target.closest('.hotspot')) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: false });

    window.addEventListener(
      'touchmove',
      e => {
        if (!currentState.modalOpen && !e.target.closest('.hotspot')) {
          e.preventDefault(); // Prevent default touch scroll
          const deltaY = e.touches[0].clientY - touchStartY;
          // You can also add horizontal scrolling here if needed
          // const deltaX = e.touches[0].clientX - touchStartX;

          currentState.targetPosition += deltaY * (currentState.isMobile ? -2.5 : -1.5); // Inverse deltaY for intuitive scrolling
          enforceBoundaries();
          touchStartY = e.touches[0].clientY; // Update touch position
          touchStartX = e.touches[0].clientX;
        }
      },
      { passive: false }
    );

    // Function to show/hide and manage info panels in the modal
    function showPanel(panelNumber) {
      currentState.currentPanel = panelNumber;
      const folder = currentState.isMobile ? 'mobile' : 'desktop'; // Choose image folder based on screen size
      if (panelNumber > 0) {
        elements.modalImage.src = `assets/texts/${folder}/${panelNumber}.png`;
        elements.modal.classList.add('visible');
        currentState.modalOpen = true;
      } else {
        elements.modal.classList.remove('visible');
        currentState.modalOpen = false;
      }

      // Control visibility of navigation buttons
      elements.modalPrev.style.display = panelNumber > 1 ? 'block' : 'none';
      elements.modalNext.style.display = panelNumber < currentState.totalPanels ? 'block' : 'none';
    }

    // Event listeners for modal navigation buttons
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

    // Event listener for modal close button
    elements.modalClose.addEventListener('click', e => {
      e.preventDefault();
      // Remove zoom from all hotspots when modal closes
      elements.hotspots.forEach(hs => hs.classList.remove('zoomed'));
      currentState.isZoomed = false;
      elements.modal.classList.remove('visible');
      currentState.modalOpen = false;
    });

    // Start the main animation loop
    requestAnimationFrame(updateWalk);
  }
});