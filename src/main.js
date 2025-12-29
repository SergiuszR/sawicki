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

document.addEventListener('DOMContentLoaded', () => {
    // Ensure GSAP is loaded
    const mm = (typeof gsap !== 'undefined') ? gsap.matchMedia() : null;

    // Initialize all modules
    initNavigation();
    if (mm) {
        initSliders(mm);
        initAnimations(mm);
    }
    initUtilities();
    
    // Initialize standalone modules
    initTOC();
    initModals();
    initServicesLine();
    initServicesEnhanced();
});
