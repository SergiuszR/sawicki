/**
 * SAW Project - Global JavaScript
 * Simplified & Optimized for Webflow
 */
import { initNavigation } from './navigation.js';
import { initSliders } from './sliders.js';
import { initAnimations } from './animations.js';
import { initUtilities } from './utilities.js';
import { initTOC } from './toc.js';
import { initModals } from './modals.js';
import { initServicesLine } from './services-line.js';
import { initServicesEnhanced } from './services-enhanced.js';

const init = () => {
    // Ensure Dependencies are loaded
    if (typeof gsap === 'undefined' || typeof $ === 'undefined') {
        // If not ready, retry in 100ms
        setTimeout(init, 100);
        return;
    }

    const mm = gsap.matchMedia();

    // Initialize all modules
    initNavigation();
    initSliders(mm);
    initAnimations(mm); // Now safe to run as GSAP is confirmed
    initUtilities();
    
    // Initialize standalone modules
    initTOC();
    initModals();
    initServicesLine();
    initServicesEnhanced();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
