class BookshelfDrag {
    constructor(container) {
        this.container = container;
        this.isDown = false;
        this.startX = null;
        this.scrollLeft = null;
        this.velocity = 0;
        this.momentum = 0.95;
        this.minVelocity = 0.5;
        this.dragStarted = false;
        
        this.init();
    }
    
    init() {
        // Mouse events
        this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.container.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Touch events
        this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));
        this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        
        // Prevent default drag behavior on images/links
        this.container.addEventListener('dragstart', (e) => e.preventDefault());
        
        // Style changes
        this.container.style.cursor = 'grab';
        this.container.style.userSelect = 'none';
    }
    
    handleMouseDown(e) {
        this.isDown = true;
        this.container.style.cursor = 'grabbing';
        this.startX = e.pageX - this.container.offsetLeft;
        this.scrollLeft = this.container.scrollLeft;
        this.velocity = 0;
        this.dragStarted = false;
    }
    
    handleMouseLeave() {
        this.isDown = false;
        this.container.style.cursor = 'grab';
        this.container.classList.remove('dragging');
    }
    
    handleMouseUp() {
        this.isDown = false;
        this.container.style.cursor = 'grab';
        this.container.classList.remove('dragging');
        if (this.dragStarted) {
            this.applyMomentum();
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDown) return;
        
        const x = e.pageX - this.container.offsetLeft;
        const walk = (x - this.startX) * 2;
        
        // Start dragging if moved more than 5 pixels
        if (!this.dragStarted && Math.abs(walk) > 5) {
            this.dragStarted = true;
            // Disable hover effects during drag
            this.container.classList.add('dragging');
        }
        
        if (this.dragStarted) {
            e.preventDefault();
            const newScrollLeft = this.scrollLeft - walk;
            this.velocity = this.container.scrollLeft - newScrollLeft;
            this.container.scrollLeft = newScrollLeft;
        }
    }
    
    handleTouchStart(e) {
        this.isDown = true;
        this.startX = e.touches[0].pageX;
        this.scrollLeft = this.container.scrollLeft;
        this.velocity = 0;
        this.dragStarted = false;
    }
    
    handleTouchEnd(e) {
        this.isDown = false;
        this.container.classList.remove('dragging');
        if (this.dragStarted) {
            this.applyMomentum();
        }
    }
    
    handleTouchMove(e) {
        if (!this.isDown) return;
        
        const x = e.touches[0].pageX;
        const walk = (this.startX - x) * 2;
        
        // Start dragging if moved more than 5 pixels
        if (!this.dragStarted && Math.abs(walk) > 5) {
            this.dragStarted = true;
            // Disable hover effects during drag
            this.container.classList.add('dragging');
        }
        
        if (this.dragStarted) {
            e.preventDefault();
            const newScrollLeft = this.scrollLeft + walk;
            this.velocity = this.container.scrollLeft - newScrollLeft;
            this.container.scrollLeft = newScrollLeft;
        }
    }
    
    applyMomentum() {
        if (Math.abs(this.velocity) > this.minVelocity) {
            this.container.scrollLeft -= this.velocity;
            this.velocity *= this.momentum;
            requestAnimationFrame(this.applyMomentum.bind(this));
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const bibliographyList = document.querySelector('.bibliography-list');
    if (bibliographyList) {
        new BookshelfDrag(bibliographyList);
        
        // Add smooth scrolling CSS
        bibliographyList.style.scrollBehavior = 'auto'; // Disable for drag
    }
}); 