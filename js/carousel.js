// ==========================================
// Nutri Kitchen - Carousel Functionality
// ==========================================

class ProductCarousel {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;
    
    this.slidesContainer = this.container.querySelector('.carousel-slides');
    this.slides = this.container.querySelectorAll('.carousel-slide');
    this.currentSlide = 0;
    this.totalSlides = this.slides.length;
    this.autoplayInterval = null;
    this.autoplayDelay = 5000; // 5 seconds
    this.isPlaying = true;
    
    // Touch drag state
    this.isDragging = false;
    this.startPos = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.animationID = 0;
    
    this.init();
  }
  
  init() {
    this.createControls();
    this.createIndicators();
    this.attachEventListeners();
    this.startAutoplay();
    this.updateSlidePosition();
    
    // Handle window resize to keep slides aligned
    window.addEventListener('resize', () => {
      this.updateSlidePosition(false); // Update without transition
    });
  }
  
  createControls() {
    // Create navigation arrows
    const prevArrow = document.createElement('button');
    prevArrow.className = 'carousel-arrow prev';
    prevArrow.setAttribute('aria-label', 'Previous slide');
    prevArrow.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
      </svg>
    `;
    
    const nextArrow = document.createElement('button');
    nextArrow.className = 'carousel-arrow next';
    nextArrow.setAttribute('aria-label', 'Next slide');
    nextArrow.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
      </svg>
    `;
    
    this.container.appendChild(prevArrow);
    this.container.appendChild(nextArrow);
    
    this.prevBtn = prevArrow;
    this.nextBtn = nextArrow;
  }
  
  createIndicators() {
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'carousel-controls';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-btn prev';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
      </svg>
    `;
    
    // Indicators container
    const indicatorsDiv = document.createElement('div');
    indicatorsDiv.className = 'carousel-indicators';
    
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = `indicator-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.dataset.index = i;
      indicatorsDiv.appendChild(dot);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-btn next';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
      </svg>
    `;
    
    controlsDiv.appendChild(prevBtn);
    controlsDiv.appendChild(indicatorsDiv);
    controlsDiv.appendChild(nextBtn);
    
    this.container.appendChild(controlsDiv);
    
    this.indicators = indicatorsDiv.querySelectorAll('.indicator-dot');
    this.controlPrevBtn = prevBtn;
    this.controlNextBtn = nextBtn;
  }
  
  attachEventListeners() {
    // Arrow buttons
    this.prevBtn.addEventListener('click', () => this.prevSlide());
    this.nextBtn.addEventListener('click', () => this.nextSlide());
    
    // Control buttons
    this.controlPrevBtn.addEventListener('click', () => this.prevSlide());
    this.controlNextBtn.addEventListener('click', () => this.nextSlide());
    
    // Indicator dots
    this.indicators.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.goToSlide(index);
      });
    });
    
    // Touch events for mobile (Smooth dragging)
    // IMPORTANT: use { passive: false } for Safari/iOS to allow preventDefault()
    this.slidesContainer.addEventListener('touchstart', this.touchStart.bind(this), { passive: false });
    this.slidesContainer.addEventListener('touchmove', this.touchMove.bind(this), { passive: false });
    this.slidesContainer.addEventListener('touchend', this.touchEnd.bind(this), { passive: false });
    this.slidesContainer.addEventListener('touchcancel', this.touchEnd.bind(this), { passive: false });
    
    // Mouse events removed for desktop per request
    
    // Prevent context menu
    this.slidesContainer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
      }
    });
    
    // Pause on hover
    this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
    this.container.addEventListener('mouseleave', () => this.startAutoplay());
    
    // Visibility change (pause when tab is hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAutoplay();
      } else {
        this.startAutoplay();
      }
    });
  }

  getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }

  touchStart(event) {
    if (window.innerWidth <= 768) return;
    this.isDragging = true;
    this.startPos = this.getPositionX(event);
    this.startTime = new Date().getTime();
    
    // Get current container width accurately
    const slideWidth = this.container.getBoundingClientRect().width;
    
    // Stop any existing transition and lock current position
    this.slidesContainer.style.transition = 'none';
    this.prevTranslate = this.currentSlide * -slideWidth;
    this.currentTranslate = this.prevTranslate;
    
    this.animationID = requestAnimationFrame(this.animation.bind(this));
    this.pauseAutoplay();
  }

  touchMove(event) {
    if (this.isDragging && window.innerWidth > 768) {
      const currentPosition = this.getPositionX(event);
      const diff = currentPosition - this.startPos;
      
      // Add slight resistance at ends
      let finalDiff = diff;
      if ((this.currentSlide === 0 && diff > 0) || 
          (this.currentSlide === this.totalSlides - 1 && diff < 0)) {
        finalDiff = diff * 0.3;
      }
      
      this.currentTranslate = this.prevTranslate + finalDiff;
      
      // Lock vertical scroll if horizontal move is significant
      if (Math.abs(diff) > 10) {
        if (event.cancelable) event.preventDefault();
      }
    }
  }

  touchEnd(event) {
    if (window.innerWidth <= 768) return;
    this.isDragging = false;
    cancelAnimationFrame(this.animationID);
    
    const endTime = new Date().getTime();
    const timeDiff = endTime - this.startTime;
    const movedBy = this.currentTranslate - this.prevTranslate;
    const slideWidth = this.container.getBoundingClientRect().width;
    const dragDistance = Math.abs(movedBy);
    
    // Snapping Logic
    // 1. Check for a fast "flick" (moved > 50px in under 300ms)
    // 2. Check for 50% screen width threshold (as requested by user)
    const isFlick = dragDistance > 50 && timeDiff < 300;
    const isHalfWay = dragDistance > slideWidth * 0.5;

    if (isFlick || isHalfWay) {
      if (movedBy < 0 && this.currentSlide < this.totalSlides - 1) {
         this.currentSlide++;
      } else if (movedBy > 0 && this.currentSlide > 0) {
         this.currentSlide--;
      }
    }
    
    // Always call updateSlidePosition to snap to a full slide
    this.updateSlidePosition(true);
    this.startAutoplay();
  }

  animation() {
    this.setSliderPosition();
    if (this.isDragging) requestAnimationFrame(this.animation.bind(this));
  }

  setSliderPosition() {
    // translate3d is more performant on iOS/Safari
    this.slidesContainer.style.transform = `translate3d(${this.currentTranslate}px, 0, 0)`;
  }
  

  
  updateSlidePosition(smooth = true) {
    if (!this.slidesContainer) return;
    
    const slideWidth = this.container.getBoundingClientRect().width;
    const finalTranslate = this.currentSlide * -slideWidth;
    
    // Skip transformation if in mobile view to allow native horizontal scroll
    if (window.innerWidth <= 768) {
      this.slidesContainer.style.transform = 'none';
      this.slidesContainer.style.transition = 'none';
      this.pauseAutoplay();
      return;
    }

    if (smooth) {
      this.slidesContainer.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
      this.slidesContainer.style.transition = 'none';
    }
    
    this.slidesContainer.style.transform = `translate3d(${finalTranslate}px, 0, 0)`;
    
    // Update indicators
    this.indicators.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentSlide);
    });
    
    // Track with analytics
    const currentProduct = PRODUCTS[this.currentSlide];
    if (window.Analytics && currentProduct) {
      Analytics.trackCarouselSlide(this.currentSlide + 1, currentProduct.name);
    }
  }
  
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlidePosition();
    this.resetAutoplay();
  }
  
  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlidePosition();
    this.resetAutoplay();
  }
  
  goToSlide(index) {
    if (index >= 0 && index < this.totalSlides) {
      this.currentSlide = index;
      this.updateSlidePosition();
      this.resetAutoplay();
    }
  }
  
  startAutoplay() {
    if (!this.isPlaying || window.innerWidth <= 768) return;
    
    this.pauseAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoplayDelay);
  }
  
  pauseAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
  
  resetAutoplay() {
    this.pauseAutoplay();
    this.startAutoplay();
  }
  
  toggleAutoplay() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.startAutoplay();
    } else {
      this.pauseAutoplay();
    }
  }
  
  destroy() {
    this.pauseAutoplay();
    // Clean up event listeners if needed
  }
}

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if carousel container exists
  const carouselContainer = document.querySelector('.carousel-container');
  if (carouselContainer) {
    window.productCarousel = new ProductCarousel('.carousel-container');
    console.log('Product carousel initialized');
  }
});

// Export for external use
if (typeof window !== 'undefined') {
  window.ProductCarousel = ProductCarousel;
}
