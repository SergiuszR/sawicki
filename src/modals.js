export function initModals() {
  // Selectors based on your screenshots
  const triggers = document.querySelectorAll('[data-list]');
  const wrapper = document.querySelector('[data-modal-wrapper]');
  const allModals = document.querySelectorAll('[data-modal]');
  // const closeButtons = document.querySelectorAll('.modal_close-button'); // Removed/Unused
  
  const contentWrapper = wrapper ? wrapper.querySelector('.modal_content-wrapper') : null;

  // Helper: Close logic with Animation
  const closeWrapper = () => {
    if (!wrapper || !wrapper.classList.contains('show')) return;

    // Animate out
    const tl = gsap.timeline({
      onComplete: () => {
        wrapper.classList.remove('show');
        // Reset styles for next open
        gsap.set(wrapper, { clearProps: 'all' });
        if (contentWrapper) gsap.set(contentWrapper, { clearProps: 'all' });
        allModals.forEach(m => gsap.set(m, { clearProps: 'all' }));
      }
    });

    // 1. Fade out wrapper
    tl.to(wrapper, { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0);
    
    // 2. Slide content out
    if (contentWrapper) {
      tl.to(contentWrapper, { x: 50, opacity: 0, duration: 0.3, ease: 'power2.out' }, 0);
    }
  };

  // 1. Trigger Click
  triggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      const value = this.getAttribute('data-list');

      // A. Show the main wrapper
      if (wrapper) {
        wrapper.classList.add('show');
        // Reset Wrapper State for animation
        gsap.set(wrapper, { opacity: 0 });
        if (contentWrapper) {
            gsap.set(contentWrapper, { x: 50, opacity: 0 });
        }
      }

      // B. Filter the items
      allModals.forEach(modal => {
        if (modal.getAttribute('data-modal') === value) {
            // 1. Show the specific modal element
            modal.style.display = 'block';
            
            // 2. IMPORTANT: Ensure its parent .w-dyn-item is not hiding it
            const parentItem = modal.closest('.w-dyn-item');
            if (parentItem) parentItem.style.display = 'block';
            
        } else {
            // Hide non-matching modals
            modal.style.display = 'none';
        }
      });

      // C. Animate In
      if (wrapper) {
        const tl = gsap.timeline();
        
        // 1. Wrapper Fade In
        tl.to(wrapper, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0);
        
        // 2. Content Slide In
        if (contentWrapper) {
            tl.to(contentWrapper, { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, 0);
        }
      }
    });
  });

  // 2. Close Actions
  // 2. Global Close Actions (Event Delegation)
  document.addEventListener('click', (e) => {
    // Check if clicked element is (or is inside) a close trigger
    const closeBtn = e.target.closest('[data-modal-close], .modal_close-button');
    
    if (closeBtn) {
      e.preventDefault();
      closeWrapper();
    }
    
    // Optional: Close on backdrop click (if wrapper itself is the backdrop)
    if (e.target === wrapper) {
      closeWrapper();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeWrapper();
  });
}
