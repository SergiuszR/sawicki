import { CONFIG } from './config.js';

let LAST_SCROLL = 0;

export function initNavigation() {
  const $nav = $('[fs-scrolldisable-element="smart-nav"]');
  if (!$nav.length) return;

  // Cache the button once (supports either variant as initial state)
  const $btn = $nav.find('.variant-3, .variant-4');
  
  // Check if this specific page/navbar requires the white variant override
  // .data() pulls from data-wf--s-nav--variant automatically (camelCase conversion)
  const isWhiteVariant = $nav.data('wf-SNav-Variant') === 'white' || $nav.attr('data-wf--s-nav--variant') === 'white';

  // If override is active, force state immediately on init
  if (isWhiteVariant && $btn.length) {
    $btn.removeClass('variant-4').addClass('variant-3');
  }

  $(window).on('scroll resize', () => {
    const currentScroll = $(window).scrollTop();

    // Mobile behavior: reset nav
    if (window.innerWidth < 992) {
      gsap.set($nav, { yPercent: 0 });
      $nav.removeClass('is-pinned');
      
      // Only toggle button if NOT in white variant mode AND menu is NOT open
      const $menu = $nav.find('.w-nav-menu');
      const isMenuOpen = $menu.hasClass('w--open');
      
      if (!isWhiteVariant && $btn.length && !isMenuOpen) {
        $btn.removeClass('variant-3').addClass('variant-4');
      }
      return;
    }

    // Pinning
    const isPinned = currentScroll > CONFIG.navThreshold;
    $nav.toggleClass('is-pinned', isPinned);

    // Toggle button variants based on pinned state (both ways)
    // Condition: Button exists AND we are NOT in the forced white variant mode
    if ($btn.length && !isWhiteVariant) {
      if (isPinned) {
        $btn.removeClass('variant-4').addClass('variant-3');
      } else {
        $btn.removeClass('variant-3').addClass('variant-4');
      }
    }

    // Hide on scroll down, Show on scroll up
    if (Math.abs(currentScroll - LAST_SCROLL) <= CONFIG.navTolerance) return;

    const shouldHide = currentScroll > LAST_SCROLL && currentScroll > CONFIG.navThreshold;
    gsap.to($nav, {
      yPercent: shouldHide ? -100 : 0,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    LAST_SCROLL = currentScroll;
  });

  // Mobile Menu: Watch for menu open/close to toggle button variant
  // Webflow adds 'w--open' to the hamburger button (.w-nav-button), not the menu
  const $hamburger = $nav.find('.w-nav-button');
  console.log('[SAW Nav] Hamburger element found:', $hamburger.length > 0);
  console.log('[SAW Nav] CTA Button element found:', $btn.length > 0);
  console.log('[SAW Nav] isWhiteVariant:', isWhiteVariant);
  
  if ($hamburger.length && $btn.length && !isWhiteVariant) {
    const menuObserver = new MutationObserver(() => {
      console.log('[SAW Nav] Hamburger class changed');
      
      // Only apply on mobile
      if (window.innerWidth >= 992) return;
      
      const isMenuOpen = $hamburger.hasClass('w--open');
      console.log('[SAW Nav] Menu open:', isMenuOpen);
      
      if (isMenuOpen) {
        $btn.removeClass('variant-4').addClass('variant-3');
        console.log('[SAW Nav] Switched to variant-3');
      } else {
        $btn.removeClass('variant-3').addClass('variant-4');
        console.log('[SAW Nav] Switched to variant-4');
      }
    });
    
    menuObserver.observe($hamburger[0], { attributes: true, attributeFilter: ['class'] });
    console.log('[SAW Nav] Hamburger observer started');
  }
}
