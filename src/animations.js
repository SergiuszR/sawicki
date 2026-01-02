import { CONFIG } from './config.js';

export function initAnimations(mm) {
  // 1. Desktop Expand - matches width of [data-usp] element
  mm.add(CONFIG.breakpoints.desktop, () => {
    const $usp = $('[data-usp]');
    if (!$usp.length) return;
    
    const targetWidth = $usp.outerWidth();
    
    $('[data-expand]').each(function () {
      gsap.to(this, {
        width: targetWidth, duration: CONFIG.animationDuration, ease: 'power3.out',
        scrollTrigger: { trigger: this, start: 'top 80%', toggleActions: 'play none none none' }
      });
    });
  });

  // 2. Fade & Split Text
  $('[data-fade-in], [data-split-text]').each(function () {
    const $el = $(this);
    const tl = gsap.timeline({ scrollTrigger: { trigger: $el, start: 'top 95%', toggleActions: 'play none none none' } });
    if ($el.is('[data-fade-in]')) tl.from($el, { opacity: 0, y: 40, duration: CONFIG.animationDuration, delay: 0.1, ease: 'power3.out' }, 0);
    if ($el.is('[data-split-text]') && typeof SplitText !== 'undefined') {
      const split = new SplitText($el, { type: 'lines,words' });
      tl.from(split.words, { opacity: 0, y: 25, duration: 1.2, stagger: 0.08, ease: 'power3.out', delay: 0.1 }, 0);
    }
  });

  // 3. Grid Stagger
  $('[data-grid]').each(function () {
    gsap.from($(this).children(), {
      opacity: 0, y: 30, scale: 0.9, duration: 1.2, ease: 'power3.out',
      stagger: { amount: 0.8, grid: 'auto', from: 'start' },
      scrollTrigger: { trigger: this, start: 'top 95%', toggleActions: 'play none none none' }
    });
  });


  // 5. Footer Logo
  const $logo = $('#footer-logo');
  if ($logo.length) {
    gsap.from($logo.find('path'), {
      opacity: 0, y: 30, duration: 0.8, stagger: 0.05, ease: 'power2.out',
      scrollTrigger: { trigger: $logo, start: 'top 90%', toggleActions: 'play none none none' }
    });
  }
}
