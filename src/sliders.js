import { CONFIG } from './config.js';

let IS_HOVERING_SERVICES = false;

export function initSliders(mm) {
  initMainSwiper();
  initServicesSlider();
  initTestimonialLoop(mm);
}

function initMainSwiper() {
  // Guard: Swiper may not be loaded on all pages
  if (typeof Swiper === 'undefined') return;
  
  const selector = '.swiper';
  const el = document.querySelector(selector);
  if (!el) return;

  // Ensure pagination exists
  if (!el.querySelector('.swiper-pagination')) {
    const p = document.createElement('div');
    p.className = 'swiper-pagination';
    el.appendChild(p);
  }

  new Swiper(selector, {
    slidesPerView: 1,
    slidesPerGroup: 1,
    spaceBetween: 24,
    loop: false,
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: {
      enabled: false,
      nextEl: '.slider_next',
      prevEl: '.slider_prev',
      disabledClass: 'is-disabled',
    },
    breakpoints: {
      768: {
        slidesPerView: 3,
        pagination: { enabled: false },
        navigation: { enabled: true },
      },
    },
  });
}

function initTestimonialLoop(mm) {
  const wrapper = document.querySelector('[data-testimonials]');
  if (!wrapper) return;

  // Store original HTML to restore when switching breakpoints
  const originalHTML = wrapper.innerHTML;
  const originalStyles = wrapper.getAttribute('style') || '';
  let swiperInstance = null;

  // Helper to reset to original state
  const resetToOriginal = () => {
    if (swiperInstance) {
      swiperInstance.destroy(true, true);
      swiperInstance = null;
    }
    wrapper.innerHTML = originalHTML;
    // Clear all inline styles and restore originals
    wrapper.removeAttribute('style');
    if (originalStyles) wrapper.setAttribute('style', originalStyles);
    wrapper.classList.remove('swiper');
    // Ensure no leftover height/overflow constraints
    wrapper.style.height = '';
    wrapper.style.overflow = '';
    wrapper.style.display = '';
  };

  // Tablet and Desktop: 3 columns with vertical marquee
  mm.add(CONFIG.breakpoints.tabletUp, () => {
    resetToOriginal();
    
    const $wrapper = $(wrapper);
    const $items = $wrapper.children();
    
    $wrapper.css({
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
      height: '65vh',
      overflow: 'hidden',
    });

    // Create 3 columns
    const $cols = [0, 1, 2].map(() => $('<div class="testi-col">').appendTo($wrapper));
    $items.each((i, el) => $cols[i % 3].append(el));

    const tweens = [];
    $cols.forEach(($col, i) => {
      $col.append($col.children().clone(true));
      const isMiddle = i === 1;
      if (isMiddle) gsap.set($col, { yPercent: -50 });

      const tween = gsap.to($col, {
        yPercent: isMiddle ? 0 : -50,
        ease: 'none',
        duration: CONFIG.marqueeSpeed,
        repeat: -1,
      });
      tweens.push(tween);

      // Pause only this column on hover
      $col.on('mouseenter', () => tween.pause());
      $col.on('mouseleave', () => tween.resume());
    });

    // Return cleanup function for matchMedia
    return () => {
      tweens.forEach(t => t.kill());
    };
  });

  // Mobile ONLY (below 768px): Swiper with 1 slide, bullets below
  // Using explicit breakpoint to avoid overlap with tabletUp
  mm.add('(max-width: 767px)', () => {
    resetToOriginal();

    if (typeof Swiper === 'undefined') return;

    const items = Array.from(wrapper.children);
    if (items.length < 1) return;

    // 1. Create outer Swiper container
    const container = document.createElement('div');
    container.className = 'swiper';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.paddingBottom = '40px'; // Space for pagination
    // container.style.width = '100%'; // Often helpful but block is usually fine

    // 2. Wrap the existing wrapper
    // Insert container before wrapper
    wrapper.parentNode.insertBefore(container, wrapper);
    // Move wrapper inside container
    container.appendChild(wrapper);

    // 3. Setup wrapper as swiper-wrapper
    wrapper.classList.add('swiper-wrapper');
    // Ensure wrapper behaves as flex container (Webflow likely sets this, but ensure it)
    wrapper.style.display = 'flex';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.boxSizing = 'border-box';

    // 4. Setup Slides
    items.forEach(child => {
      child.classList.add('swiper-slide');
      child.style.width = '100%'; // Explicit width for 1 slide per view
      child.style.flexShrink = '0';
      child.style.height = 'auto'; // Let content dictate height
      child.style.display = 'block'; // Or flex, depending on content, strict block is safer for slide container
    });

    // 5. Pagination (in Container)
    const pagination = document.createElement('div');
    pagination.className = 'swiper-pagination';
    pagination.style.position = 'absolute';
    pagination.style.bottom = '0';
    pagination.style.left = '0';
    pagination.style.width = '100%';
    pagination.style.zIndex = '10';
    pagination.style.textAlign = 'center';
    container.appendChild(pagination);

    // 6. Init Swiper on Container
    swiperInstance = new Swiper(container, {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      autoHeight: true, 
      pagination: {
        el: pagination,
        clickable: true,
      },
    });

    // Cleanup: Unwrap everything
    return () => {
      if (swiperInstance) {
        swiperInstance.destroy(true, true);
        swiperInstance = null;
      }
      
      // Unwrap: Move wrapper back out
      if (container.parentNode) {
        container.parentNode.insertBefore(wrapper, container);
      }
      container.remove();
      
      wrapper.classList.remove('swiper-wrapper');
      // Styles are handled by resetToOriginal on re-entry or just cleared here
      wrapper.style.display = '';
      wrapper.style.width = '';
      wrapper.style.height = '';
      wrapper.style.boxSizing = '';
      wrapper.style.paddingBottom = ''; // just in case
    };
  });
}

function initServicesSlider() {
  const wrappers = document.querySelectorAll(".services_slider-wrapper-inner");
  wrappers.forEach(wrapper => {
    const pane = wrapper.closest(".w-tab-pane");
    const items = wrapper.querySelectorAll(".w-dyn-item");
    // Only require items, pane is optional now
    if (!items.length) return;

    // Helper to check if we should play/draw
    const isActive = () => {
      // If inside a tab, must be active tab. If standalone, always "active" (logic-wise).
      // We also check for visibility (offsetParent) to avoid running when hidden (e.g. strict display:none)
      return (!pane || pane.classList.contains("w--tab-active")) && wrapper.offsetParent !== null;
    };

    const LINE_DURATION = 2.0, SWITCH_DURATION = 0.5, END_DELAY = 3.0;
    let activeIndex = 0, timerTween = null, transitionTween = null;

    // Create Progress Lines
    const track = document.createElement("div"), progress = document.createElement("div");
    [track, progress].forEach(line => {
      Object.assign(line.style, {
        position: "absolute", width: "2px", zIndex: 1, top: 0, left: 0,
        transformOrigin: "top left", pointerEvents: "none"
      });
      wrapper.appendChild(line);
    });
    track.style.background = "#E3E3E3";
    progress.style.background = "#06F";
    if (getComputedStyle(wrapper).position === "static") wrapper.style.position = "relative";

    const draw = (val) => {
      if (typeof val !== 'number') val = activeIndex;
      // Guard: If not active or hidden
      if (!isActive()) return;
      
      const wRect = wrapper.getBoundingClientRect();
      const dots = Array.from(items).map(i => i.querySelector('[data-step="decor"]'));
      if (!dots[0] || !dots[dots.length - 1] || !dots[0].isConnected) return;

      const first = dots[0].getBoundingClientRect(), last = dots[dots.length - 1].getBoundingClientRect();
      const startX = first.left - wRect.left + first.width / 2 - 1, startY = first.top - wRect.top + first.height / 2;
      const totalH = (last.top - wRect.top + last.height / 2) - startY;

      gsap.set(track, { x: startX, y: startY, height: totalH });

      const idx = Math.floor(val);
      const nextIdx = Math.min(Math.ceil(val), items.length - 1);
      const frac = val - idx;
      if (!dots[idx] || !dots[nextIdx]) return;

      const cDot = dots[idx].getBoundingClientRect(), nDot = dots[nextIdx].getBoundingClientRect();
      const currH = (cDot.top - wRect.top + cDot.height / 2 - startY) + (nDot.top - cDot.top) * frac;

      gsap.set(progress, { x: startX, y: startY, height: currH });
    };

    // Clear all active states (reset to clean slate)
    const clearAll = () => {
      activeIndex = 0;
      items.forEach((it) => {
        const c = it.querySelector("[data-step-content]");
        gsap.set(c, { height: 0, overflow: "hidden" });
        it.querySelector('[data-step="decor"]')?.classList.remove("is-active");
        it.querySelector("h4")?.classList.remove("is-active");
      });
      gsap.set(track, { height: 0 });
      gsap.set(progress, { height: 0 });
    };

    // Activate Step 0 specifically
    const activateStepZero = () => {
      activeIndex = 0;
      items.forEach((it, i) => {
        const c = it.querySelector("[data-step-content]");
        if (i === 0) {
          gsap.set(c, { height: "auto" });
          it.querySelector('[data-step="decor"]')?.classList.add("is-active");
          it.querySelector("h4")?.classList.add("is-active");
        } else {
          gsap.set(c, { height: 0, overflow: "hidden" });
          it.querySelector('[data-step="decor"]')?.classList.remove("is-active");
          it.querySelector("h4")?.classList.remove("is-active");
        }
      });
    };

    const play = () => {
      if (!isActive()) return;
      if (timerTween) timerTween.kill();
      
      const targetVal = activeIndex >= items.length - 1 ? items.length : activeIndex + 1;
      const obj = { val: activeIndex };
      
      timerTween = gsap.to(obj, {
        val: targetVal, duration: LINE_DURATION, ease: "linear",
        onUpdate: () => draw(obj.val),
        onComplete: () => {
          if (!isActive()) return;

          if (activeIndex >= items.length - 1) {
            gsap.delayedCall(END_DELAY, () => {
              if (isActive()) {
                resetSwitch(); 
              }
            });
          } else {
            switchStep(activeIndex + 1);
          }
        }
      });
      if (IS_HOVERING_SERVICES) timerTween.pause();
    };

    const resetSwitch = () => {
        if (!isActive()) return;
        if (timerTween) timerTween.kill();
        if (transitionTween) transitionTween.kill();
        
        const oldIdx = activeIndex;
        activeIndex = 0;

        const tl = gsap.timeline({
            onUpdate: () => draw(0),
            onComplete: () => {
                 if (isActive()) play();
            }
        });

        tl.to(items[oldIdx].querySelector("[data-step-content]"), { height: 0, duration: 0.5 }, 0)
          .to(items[0].querySelector("[data-step-content]"), { height: "auto", duration: 0.5 }, 0);
        
        items.forEach((item, i) => {
            const active = i === 0;
            item.querySelector('[data-step="decor"]')?.classList.toggle("is-active", active);
            item.querySelector("h4")?.classList.toggle("is-active", active);
        });
        transitionTween = tl;
    };

    const switchStep = (idx) => {
      if (!isActive()) return;
      if (timerTween) timerTween.kill();
      if (transitionTween) transitionTween.kill();
      
      const oldIdx = activeIndex;
      activeIndex = idx;

      items.forEach((item, i) => {
        const active = i <= idx;
        item.querySelector('[data-step="decor"]')?.classList.toggle("is-active", active);
        item.querySelector("h4")?.classList.toggle("is-active", active);
      });

      const tl = gsap.timeline({ 
        onUpdate: () => draw(activeIndex),
        onComplete: () => { 
            if (isActive()) play();
        } 
      });
      
      tl.to(items[oldIdx].querySelector("[data-step-content]"), { height: 0, duration: SWITCH_DURATION, ease: "power2.inOut" }, 0)
        .to(items[idx].querySelector("[data-step-content]"), { height: "auto", duration: SWITCH_DURATION, ease: "power2.inOut" }, 0);
      transitionTween = tl;
    };

    const stop = () => {
      if (timerTween) timerTween.kill();
      if (transitionTween) transitionTween.kill();
      clearAll();
    };

    const start = () => {
      stop(); 
      requestAnimationFrame(() => {
         if (isActive()) {
             activateStepZero(); 
             draw(0);            
             play();             
         }
      });
    };

    wrapper.addEventListener("mouseenter", () => { IS_HOVERING_SERVICES = true; timerTween?.pause(); });
    wrapper.addEventListener("mouseleave", () => { IS_HOVERING_SERVICES = false; timerTween?.play(); });
    items.forEach((it, i) => {
      const h = it.querySelector('[data-step="header"]');
      if (h) { h.style.cursor = "pointer"; h.addEventListener("click", () => i !== activeIndex && isActive() && switchStep(i)); }
    });
    window.addEventListener("resize", () => {
        if (isActive()) draw(activeIndex);
    });

    // Check visibility/tabs
    if (pane) {
      new MutationObserver(() => {
        if (isActive()) { 
          start(); 
        } else { 
          stop(); 
        }
      }).observe(pane, { attributes: true, attributeFilter: ["class"] });
    }

    // Initialize
    clearAll(); 
    if (isActive()) {
        start();
    }
  });
}
