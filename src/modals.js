export function initModals() {
  // Selectors based on your screenshots
  const triggers = document.querySelectorAll('[data-list]');
  const wrapper = document.querySelector('[data-modal-wrapper]');
  const allModals = document.querySelectorAll('[data-modal]');
  // const closeButtons = document.querySelectorAll('.modal_close-button'); // Removed/Unused
  
  // Helper: Close logic
  const closeWrapper = () => {
    if (wrapper) wrapper.classList.remove('show');
    // We don't hide items here to avoid "flashing" next time, 
    // but you can if you want them all hidden on close.
  };

  // 1. Trigger Click
  triggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      const value = this.getAttribute('data-list');

      // A. Show the main wrapper
      if (wrapper) wrapper.classList.add('show');

      // B. Filter the items
      allModals.forEach(modal => {
        if (modal.getAttribute('data-modal') === value) {
          // 1. Show the specific modal element
          modal.style.display = 'block';
          modal.style.opacity = '1'; // Ensure it's not hidden by opacity
          
          // 2. IMPORTANT: Ensure its parent .w-dyn-item is not hiding it
          // Webflow sometimes puts 'display: none' on dynamic items if filtered
          const parentItem = modal.closest('.w-dyn-item');
          if (parentItem) {
            parentItem.style.display = 'block';
          }
        } else {
          // Hide non-matching modals
          modal.style.display = 'none';
          
          // Optional: Hide parent to be safe, but hiding child is usually enough
          // const parentItem = modal.closest('.w-dyn-item');
          // if (parentItem) parentItem.style.display = 'none';
        }
      });
    });
  });

  // 2. Close Actions
  // 2. Global Close Actions (Event Delegation)
  document.addEventListener('click', (e) => {
    // Check if clicked element is (or is inside) a close trigger
    const closeBtn = e.target.closest('[data-modal-close], .modal_close-button');
    
    // Close if button clicked OR if clicked outside wrapper content (optional, but standard)
    // For now, adhere to user request about close elements
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
