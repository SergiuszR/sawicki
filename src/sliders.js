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
  // Tablet and Desktop: 3 columns, 65vh height
  mm.add(CONFIG.breakpoints.tabletUp, () => {
    const $wrapper = $('[data-testimonials]');
    if (!$wrapper.length) return;

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

    $cols.forEach(($col, i) => {
      $col.append($col.children().clone(true));
      const isMiddle = i === 1;
      if (isMiddle) gsap.set($col, { yPercent: -50 });

      gsap.to($col, {
        yPercent: isMiddle ? 0 : -50,
        ease: 'none',
        duration: CONFIG.marqueeSpeed,
        repeat: -1,
      });
    });
  });

  // Mobile: Horizontal auto-scrolling marquee
  mm.add(CONFIG.breakpoints.mobile, () => {
    const $wrapper = $('[data-testimonials]');
    if (!$wrapper.length) return;

    const $items = $wrapper.children();
    if ($items.length < 2) return;

    // Set up wrapper as horizontal scroll container
    $wrapper.css({
      display: 'flex',
      flexWrap: 'nowrap',
      overflow: 'hidden',
      gap: '1rem',
    });

    // Set items to fixed width
    $items.css({
      flex: '0 0 85%',
      maxWidth: '85%',
    });

    // Clone items for seamless loop
    $items.clone().appendTo($wrapper);

    // Calculate total width of all items
    const itemCount = $items.length;
    const itemWidth = $items.eq(0).outerWidth(true);
    const totalWidth = itemWidth * itemCount;

    // Animate horizontal scroll
    gsap.to($wrapper.children(), {
      x: -totalWidth,
      duration: itemCount * 6, // 6 seconds per item
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
      }
    });
  });
}

function initServicesSlider() {
  const wrappers = document.querySelectorAll(".services_slider-wrapper-inner");
  wrappers.forEach(wrapper => {
    const pane = wrapper.closest(".w-tab-pane");
    const items = wrapper.querySelectorAll(".w-dyn-item");
    if (!pane || !items.length) return;

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
      if (!pane.classList.contains("w--tab-active") || !document.body.contains(wrapper)) return;
      
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

    const play = () => {
      if (!pane.classList.contains("w--tab-active")) return;
      if (timerTween) timerTween.kill();
      
      const targetVal = activeIndex >= items.length - 1 ? items.length : activeIndex + 1;
      const obj = { val: activeIndex };
      
      timerTween = gsap.to(obj, {
        val: targetVal, duration: LINE_DURATION, ease: "linear",
        onUpdate: () => draw(obj.val),
        onComplete: () => {
          if (activeIndex >= items.length - 1) {
            gsap.delayedCall(END_DELAY, () => {
              if (document.body.contains(wrapper) && pane.classList.contains("w--tab-active")) {
                reset();
              }
            });
          } else {
            switchStep(activeIndex + 1);
          }
        }
      });
      if (IS_HOVERING_SERVICES) timerTween.pause();
    };

    const switchStep = (idx) => {
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
        onComplete: play 
      });
      
      tl.to(items[oldIdx].querySelector("[data-step-content]"), { height: 0, duration: SWITCH_DURATION, ease: "power2.inOut" }, 0)
        .to(items[idx].querySelector("[data-step-content]"), { height: "auto", duration: SWITCH_DURATION, ease: "power2.inOut" }, 0);
      transitionTween = tl;
    };

    const reset = () => {
      if (timerTween) timerTween.kill();
      if (transitionTween) transitionTween.kill();
      const oldIdx = activeIndex;
      activeIndex = 0;
      
      const tl = gsap.timeline({ 
        onUpdate: () => draw(0),
        onComplete: play 
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

    wrapper.addEventListener("mouseenter", () => { IS_HOVERING_SERVICES = true; timerTween?.pause(); });
    wrapper.addEventListener("mouseleave", () => { IS_HOVERING_SERVICES = false; timerTween?.play(); });
    items.forEach((it, i) => {
      const h = it.querySelector('[data-step="header"]');
      if (h) { h.style.cursor = "pointer"; h.addEventListener("click", () => i !== activeIndex && switchStep(i)); }
    });
    window.addEventListener("resize", () => draw(activeIndex));

    // Set initial state
    items.forEach((it, i) => {
      const c = it.querySelector("[data-step-content]");
      if (i === 0) {
        gsap.set(c, { height: "auto" });
        it.querySelector('[data-step="decor"]')?.classList.add("is-active");
        it.querySelector("h4")?.classList.add("is-active");
      } else {
        gsap.set(c, { height: 0, overflow: "hidden" });
      }
    });

    new MutationObserver(() => {
      if (pane.classList.contains("w--tab-active")) { 
        draw(activeIndex); 
        play(); 
      }
      else { 
        timerTween?.pause(); 
        transitionTween?.pause(); 
      }
    }).observe(pane, { attributes: true, attributeFilter: ["class"] });

    if (pane.classList.contains("w--tab-active")) { draw(0); play(); }
  });
}
