document.addEventListener('DOMContentLoaded', () => {
    const backgroundImages = [
        'backgrounds/IMG_9193.PNG',
        'backgrounds/IMG_9194.PNG',
        'backgrounds/IMG_9195.PNG',
        'backgrounds/IMG_9196.PNG',
    ];

    const walkingFrames = Array.from({ length: 24 }, (_, i) => 
        `walking-frames/Layer_${i.toString().padStart(4, '0')}.png`
    );

    const revWalkingFrames = Array.from({ length: 24 }, (_, i) => 
        `rev-walking-frame/walk_flipped${(i + 1).toString().padStart(2, '0')}.png`
    );

    const cyclesPerMaxPosition = 9;

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

    let currentState = {
        frame: 0,
        position: 0,
        targetPosition: 0,
        previousPosition: 0,
        currentPanel: 1,
        totalPanels: 6,
        totalWidth: 6000,
        viewportWidth: window.innerWidth,
        maxPosition: 6000 - window.innerWidth,
        isZoomed: false
    };

    backgroundImages.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        elements.background.appendChild(img);
    });

    // Apply active class by default for animations and visibility
    elements.hotspot.classList.add('active');

    function updateWalk() {
        currentState.position += (currentState.targetPosition - currentState.position) * 0.1;
        currentState.position = Math.max(0, Math.min(currentState.position, currentState.maxPosition));
        elements.background.style.transform = `translateX(-${currentState.position}px)`;
        
        // Determine scroll direction and select appropriate frames
        const direction = currentState.position - currentState.previousPosition;
        const frameSet = direction >= 0 ? walkingFrames : revWalkingFrames;
        currentState.frame = Math.floor((Math.abs(currentState.position) / currentState.maxPosition) * cyclesPerMaxPosition * 24) % 24;
        elements.walker.src = frameSet[currentState.frame];
        currentState.previousPosition = currentState.position;

        requestAnimationFrame(updateWalk);
    }

    function showPanel(panelNumber) {
        currentState.currentPanel = panelNumber;
        elements.modalImage.src = `assets/${panelNumber}.png`;
        elements.modal.classList.add('visible');
        elements.modalPrev.style.display = panelNumber > 1 ? 'block' : 'none';
        elements.modalNext.style.display = panelNumber < currentState.totalPanels ? 'block' : 'none';
    }

    // Ensure click event works by preventing scroll interference and capturing properly
    elements.hotspot.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent wheel event from interfering
        if (!currentState.isZoomed) {
            this.classList.add('zoomed');
            currentState.isZoomed = true;
        } else {
            this.classList.remove('zoomed');
            showPanel(1);
            currentState.isZoomed = false;
        }
    }, { capture: true });

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

    // Adjust wheel event to avoid blocking hotspot clicks
    window.addEventListener('wheel', e => {
        if (!e.target.closest('#hotspot')) {
            e.preventDefault();
            currentState.targetPosition += e.deltaY * 2;
            currentState.targetPosition = Math.max(0, Math.min(currentState.targetPosition, currentState.maxPosition));
        }
    }, { passive: false });

    let touchY = 0;
    window.addEventListener('touchstart', e => 
        touchY = e.touches[0].clientY
    );
    window.addEventListener('touchmove', e => {
        if (!e.target.closest('#hotspot')) {
            e.preventDefault();
            const delta = e.touches[0].clientY - touchY;
            currentState.targetPosition += delta * 2;
            currentState.targetPosition = Math.max(0, Math.min(currentState.targetPosition, currentState.maxPosition));
            touchY = e.touches[0].clientY;
        }
    }, { passive: false });

    requestAnimationFrame(updateWalk);
});