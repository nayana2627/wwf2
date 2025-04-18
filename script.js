document.addEventListener('DOMContentLoaded', () => {
    const backgroundImages = [
        { src: 'backgrounds/page1.png', width: 1920 },
        { src: 'backgrounds/room1.PNG', width: 5836 },
        { src: 'backgrounds/room2.PNG', width: 10147 },
        { src: 'backgrounds/room3.PNG', width: 6158 },
        { src: 'backgrounds/room4.PNG', width: 8706 }
    ];

    const elements = {
        background: document.getElementById('background'),
        walker: document.getElementById('walker'),
        hotspot: document.getElementById('hotspot'),
        modal: document.getElementById('modal'),
        modalImage: document.getElementById('modal-image'),
        modalClose: document.getElementById('modal-close'),
        modalPrev: document.getElementById('modal-prev'),
        modalNext: document.getElementById('modal-next')
    };

    let loadedImages = 0;
    let currentState = null;

    backgroundImages.forEach(img => {
        const image = new Image();
        image.onload = () => {
            image.style.width = `${img.width}px`;
            loadedImages++;
            if (loadedImages === backgroundImages.length) initializeSystem();
        };
        image.src = img.src;
        elements.background.appendChild(image);
    });

    function initializeSystem() {
        currentState = {
            frame: 0,
            position: 0,
            targetPosition: 0,
            previousPosition: 0,
            currentPanel: 1,
            totalPanels: 4,
            viewportWidth: window.innerWidth,
            maxPosition: elements.background.scrollWidth - window.innerWidth,
            isZoomed: false
        };

        const walkingFrames = Array.from({ length: 20 }, (_, i) => 
            `walking-frames/Layer_${i.toString().padStart(2, '0')}.png`
        );
        
        const revWalkingFrames = Array.from({ length: 20 }, (_, i) =>
            `rev-walking-frame/fwalkcycle${i.toString().padStart(2, '0')}.png`
        );

        function enforceBoundaries() {
            const actualMax = elements.background.scrollWidth - window.innerWidth;
            currentState.position = Math.max(0, Math.min(currentState.position, actualMax));
            currentState.targetPosition = Math.max(0, Math.min(currentState.targetPosition, actualMax));
            if (currentState.position >= actualMax - 1) {
                currentState.position = actualMax;
                currentState.targetPosition = actualMax;
            }
        }

        function updateWalk() {
            
            if (Math.abs(currentState.targetPosition - currentState.position) > 0.5) {
                currentState.position += (currentState.targetPosition - currentState.position) * 0.1;
            }
            enforceBoundaries();

            const room1Start = backgroundImages[0].width;
            const animationStartPoint = room1Start - 1200; // Where character first appears

            const actualMax = elements.background.scrollWidth - window.innerWidth;

            elements.walker.style.opacity = currentState.position >= animationStartPoint ? 1 : 0;

            // if (currentState.position >= room1Start && currentState.position < actualMax) {
                if (currentState.position >= animationStartPoint && currentState.position < actualMax) {
                    const direction = currentState.position - currentState.previousPosition;
                    const frameSet = direction >= 0 ? walkingFrames : revWalkingFrames;
                    
                    // FIXED PROGRESS CALCULATION
                    const progress = (currentState.position - animationStartPoint) / (actualMax - animationStartPoint);
                    
                    // FIXED FRAME INDEX CALCULATION
                    currentState.frame = Math.floor(progress * 19* 20) % 20; // Direct frame mapping
                    
                    elements.walker.src = frameSet[currentState.frame];
                }

            elements.background.style.transform = `translateX(-${currentState.position}px)`;
            currentState.previousPosition = currentState.position;
            requestAnimationFrame(updateWalk);
        }

        window.addEventListener('resize', () => {
            currentState.viewportWidth = window.innerWidth;
            currentState.maxPosition = elements.background.scrollWidth - window.innerWidth;
            enforceBoundaries();
            currentState.position = Math.min(currentState.position, currentState.maxPosition);
            elements.background.style.transform = `translateX(-${currentState.position}px)`;
        });

        elements.hotspot.classList.add('active');

        elements.hotspot.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('zoomed');
            currentState.isZoomed = !currentState.isZoomed;
            // if (!currentState.isZoomed) showPanel(1);
            if (currentState.isZoomed) {
                showPanel(1); // Always open first panel when clicked
            } else {
                showPanel(0); // Reset when closing
            }
        }, { capture: true });

        function showPanel(panelNumber) {
            currentState.currentPanel = panelNumber;
            elements.modalImage.src = `assets/texts/${panelNumber}.png`;
            elements.modal.classList.toggle('visible', panelNumber > 0);
            elements.modalPrev.style.display = panelNumber > 1 ? 'block' : 'none';
            elements.modalNext.style.display = panelNumber < 4 ? 'block' : 'none';
        }

        elements.modalNext.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentState.currentPanel < currentState.totalPanels) showPanel(currentState.currentPanel + 1);
        });

        elements.modalPrev.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentState.currentPanel > 1) showPanel(currentState.currentPanel - 1);
        });

        elements.modalClose.addEventListener('click', (e) => {
            e.preventDefault();
            elements.hotspot.classList.remove('zoomed');
            currentState.isZoomed = false;
            elements.modal.classList.remove('visible');
        });

        window.addEventListener('wheel', e => {
            if (!e.target.closest('#hotspot')) {
                e.preventDefault();
                currentState.targetPosition += e.deltaY * 2;
                enforceBoundaries();
            }
        }, { passive: false });

        let touchY = 0;
        window.addEventListener('touchstart', e => touchY = e.touches[0].clientY);
        window.addEventListener('touchmove', e => {
            if (!e.target.closest('#hotspot')) {
                e.preventDefault();
                const delta = e.touches[0].clientY - touchY;
                currentState.targetPosition += delta * 2;
                enforceBoundaries();
                touchY = e.touches[0].clientY;
            }
        }, { passive: false });

        requestAnimationFrame(updateWalk);
    }
});