import { CONFIG } from './config.js';

export function initAnimations(mm) {
  // 1. Desktop Expand
  mm.add(CONFIG.breakpoints.desktop, () => {
    $('[data-expand]').each(function () {
      gsap.to(this, {
        width: '30rem', duration: CONFIG.animationDuration, ease: 'power3.out',
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

  // 4. Mobile Marquee & Reload
  mm.add(CONFIG.breakpoints.mobile, () => {
    // Vertical Reload
    const $reloadItems = $('[data-reload]').children();
    if ($reloadItems.length) {
      gsap.set($reloadItems, { position: 'absolute', top: '3em', left: 0, right: 0, width: '100%', display: 'none' });
      gsap.set($reloadItems.eq(0), { top: '0em', display: 'flex' });
      const reloadTl = gsap.timeline({ repeat: -1 });
      $reloadItems.each(function (i) {
        const $curr = $(this), $next = $reloadItems.eq((i + 1) % $reloadItems.length);
        reloadTl.to($curr, { top: '-3em', duration: 1.2, ease: 'power3.inOut' }, `+=2.5`)
            .set($next, { display: 'flex', top: '3em' }, '<')
            .to($next, { top: '0em', duration: 1.2, ease: 'power3.inOut' }, '<')
            .set($curr, { display: 'none', top: '3em' });
      });
    }

    // Horizontal Marquee
    const $marqueeWrapper = $('[data-grid]');
    const $marqueeItems = $marqueeWrapper.children();
    if ($marqueeItems.length) {
      gsap.set($marqueeWrapper, { display: 'flex', overflow: 'hidden', width: '100%' });
      gsap.set($marqueeItems, { flex: '0 0 100%', width: '100%' });
      const totalWidth = $marqueeItems.length * 100;
      gsap.to($marqueeItems, {
        xPercent: `-=${totalWidth}`, duration: CONFIG.marqueeSpeed, ease: 'none', repeat: -1,
        modifiers: { xPercent: gsap.utils.unitize(x => parseFloat(x) % totalWidth) }
      });
    }
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
