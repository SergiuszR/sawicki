export function initServicesEnhanced() {
  const wrappers = document.querySelectorAll(".services_slider-wrapper-inner");

  wrappers.forEach(wrapper => {
    const items = wrapper.querySelectorAll(".w-dyn-item");
    if (!items.length) return;

    // CONFIGURATION
    const LINE_DURATION = 2.0;
    const SWITCH_DURATION = 0.5;
    const END_DELAY = 3.0;
    // The requested blue filter
    const ACTIVE_FILTER = "invert(32%) sepia(99%) saturate(1352%) hue-rotate(203deg) brightness(98%) contrast(106%)";
    
    // STATE
    let activeIndex = 0;
    let timerTween = null;
    let transitionTween = null;
    let isHovering = false;

    // HELPER: Handle Image Filter
    const updateImageState = (item, isActive) => {
      const img = item.querySelector("img");
      if (!img) return;
      
      // Apply transition for smooth color change
      img.style.transition = "filter 0.3s ease"; 
      img.style.filter = isActive ? ACTIVE_FILTER : "none";
    };

    // 1. SETUP LINES
    if (getComputedStyle(wrapper).position === "static") wrapper.style.position = "relative";
    
    const track = document.createElement("div");
    const progress = document.createElement("div");
    
    [track, progress].forEach(line => {
      Object.assign(line.style, {
        position: "absolute",
        width: "2px",
        zIndex: 1,
        top: 0,
        left: 0,
        transformOrigin: "top left",
        pointerEvents: "none"
      });
      wrapper.appendChild(line);
    });
    
    track.style.background = "#E3E3E3"; 
    progress.style.background = "#06F"; 

    // 2. DRAW FUNCTION (Calculates positions)
    const draw = (val) => {
      if (typeof val !== 'number') val = activeIndex;
      
      const wRect = wrapper.getBoundingClientRect();
      if (wRect.height === 0) return; 

      const dots = Array.from(items).map(item => item.querySelector('[data-step="decor"]'));
      
      if (!dots[0] || !dots[dots.length - 1]) return;

      const first = dots[0].getBoundingClientRect();
      const last = dots[dots.length - 1].getBoundingClientRect();

      const startX = first.left - wRect.left + first.width / 2 - 1; 
      const startY = first.top - wRect.top + first.height / 2;
      const totalH = (last.top - wRect.top + last.height / 2) - startY;

      gsap.set(track, { x: startX, y: startY, height: totalH });

      const idx = Math.floor(val);
      const nextIdx = Math.min(Math.ceil(val), items.length - 1);
      const frac = val - idx;

      if (!dots[idx] || !dots[nextIdx]) return;

      const cDot = dots[idx].getBoundingClientRect();
      const nDot = dots[nextIdx].getBoundingClientRect();
      
      const currentSegmentStart = cDot.top - wRect.top + cDot.height / 2 - startY;
      const segmentLength = nDot.top - cDot.top;
      const currH = currentSegmentStart + (segmentLength * frac);

      gsap.set(progress, { x: startX, y: startY, height: currH });
    };

    // 3. PLAY LOGIC
    const play = () => {
      if (timerTween) timerTween.kill();

      const targetVal = activeIndex >= items.length - 1 ? items.length : activeIndex + 1;
      const obj = { val: activeIndex };

      timerTween = gsap.to(obj, {
        val: targetVal,
        duration: LINE_DURATION,
        ease: "linear",
        onUpdate: () => draw(obj.val),
        onComplete: () => {
          if (activeIndex >= items.length - 1) {
            gsap.delayedCall(END_DELAY, reset);
          } else {
            switchStep(activeIndex + 1);
          }
        }
      });
      
      if (isHovering) timerTween.pause();
    };

    // 4. SWITCH STEP LOGIC
    const switchStep = (idx) => {
      if (timerTween) timerTween.kill();
      if (transitionTween) transitionTween.kill();
      
      const oldIdx = activeIndex;
      activeIndex = idx;

      // Toggle classes & Filters
      items.forEach((item, i) => {
        const isActive = i <= idx; // Cumulative active state
        
        item.querySelector('[data-step="decor"]')?.classList.toggle("is-active", isActive);
        item.querySelector("h4")?.classList.toggle("is-active", isActive);
        
        // Update Image Filter
        updateImageState(item, isActive);
      });

      // Animate Content Height
      const tl = gsap.timeline({
        onUpdate: () => draw(activeIndex),
        onComplete: play
      });

      const oldContent = items[oldIdx].querySelector("[data-step-content]");
      const newContent = items[idx].querySelector("[data-step-content]");

      tl.to(oldContent, { height: 0, duration: SWITCH_DURATION, ease: "power2.inOut" }, 0)
        .to(newContent, { height: "auto", duration: SWITCH_DURATION, ease: "power2.inOut" }, 0);
      
      transitionTween = tl;
    };

    // 5. RESET LOGIC
    const reset = () => {
      if (timerTween) timerTween.kill();
      if (transitionTween) transitionTween.kill();
      
      const oldIdx = activeIndex;
      activeIndex = 0;

      const tl = gsap.timeline({
        onUpdate: () => draw(0),
        onComplete: play
      });

      items.forEach((item, i) => {
        const isFirst = i === 0;
        item.querySelector('[data-step="decor"]')?.classList.toggle("is-active", isFirst);
        item.querySelector("h4")?.classList.toggle("is-active", isFirst);
        
        // Reset Image Filter
        updateImageState(item, isFirst);
      });

      const oldContent = items[oldIdx].querySelector("[data-step-content]");
      const newContent = items[0].querySelector("[data-step-content]");

      tl.to(oldContent, { height: 0, duration: 0.5 }, 0)
        .to(newContent, { height: "auto", duration: 0.5 }, 0);
      
      transitionTween = tl;
    };

    // 6. EVENT LISTENERS
    wrapper.addEventListener("mouseenter", () => { isHovering = true; timerTween?.pause(); });
    wrapper.addEventListener("mouseleave", () => { isHovering = false; timerTween?.play(); });

    items.forEach((it, i) => {
      const h = it.querySelector('[data-step="header"]');
      if (h) {
        h.style.cursor = "pointer";
        h.addEventListener("click", () => {
          if (i !== activeIndex) switchStep(i);
        });
      }
    });

    new ResizeObserver(() => draw(activeIndex)).observe(wrapper);

    // 7. INITIALIZATION
    items.forEach((it, i) => {
      const c = it.querySelector("[data-step-content]");
      
      // Initialize Image Filter
      updateImageState(it, i === 0);

      if (i === 0) {
        gsap.set(c, { height: "auto" });
        it.querySelector('[data-step="decor"]')?.classList.add("is-active");
        it.querySelector("h4")?.classList.add("is-active");
      } else {
        gsap.set(c, { height: 0, overflow: "hidden" });
      }
    });

    // Start
    requestAnimationFrame(() => {
      draw(0);
      play();
    });
  });
}
