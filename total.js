/**
 * SAW Project - Global JavaScript
 * Simplified & Optimized for Webflow
 */

// 1. GLOBAL CONFIGURATION
const CONFIG = {
	navThreshold: 200,
	navTolerance: 10,
	animationDuration: 1.4,
	marqueeSpeed: 40,
	breakpoints: {
		mobile: '(max-width: 991px)',
		tabletUp: '(min-width: 768px)',
		desktop: '(min-width: 992px)',
	}
};

// 2. STATE (Used for scroll/hover tracking)
let LAST_SCROLL = 0;
let IS_HOVERING_SERVICES = false;

// 3. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
	const mm = gsap.matchMedia();

	// Initialize all modules
	initNavigation();
	initSliders(mm);
	initAnimations(mm);
	initUtilities();
});
// --- NAVIGATION MODULE ---
function initNavigation() {
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
			
			// Only toggle button if NOT in white variant mode
			if (!isWhiteVariant && $btn.length) {
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
}

// --- SLIDERS MODULE ---
function initSliders(mm) {
	initMainSwiper();
	initServicesSlider();
	initTestimonialLoop(mm);
}

function initMainSwiper() {
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
		wrapper.setAttribute('style', originalStyles);
		wrapper.classList.remove('swiper');
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

	// Mobile: Swiper with 1 slide, bullets below
	mm.add(CONFIG.breakpoints.mobile, () => {
		resetToOriginal();

		// Guard: Swiper must be loaded
		if (typeof Swiper === 'undefined') {
			console.warn('[SAW] Swiper not loaded for testimonials');
			return;
		}

		const items = Array.from(wrapper.children);
		if (items.length < 1) return;

		// Build Swiper structure
		wrapper.classList.add('swiper');
		wrapper.style.cssText = 'overflow: hidden; position: relative; display: block;';

		const swiperWrapper = document.createElement('div');
		swiperWrapper.className = 'swiper-wrapper';
		swiperWrapper.style.cssText = 'display: flex; flex-direction: row; width: 100%; height: auto; box-sizing: content-box;';

		items.forEach(child => {
			child.classList.add('swiper-slide');
			// Force slide styling
			child.style.cssText = 'flex-shrink: 0; width: 100%; height: auto; position: relative; display: block;';
			swiperWrapper.appendChild(child);
		});
		wrapper.appendChild(swiperWrapper);

		// Create pagination container
		const pagination = document.createElement('div');
		pagination.className = 'swiper-pagination';
		// Remove custom inline positioning to respect user's CSS (absolute bottom)
		wrapper.appendChild(pagination);

		// Force Swiper wrapper styles - add padding-bottom to ensure space for bullets if CSS loads late
		wrapper.style.cssText = 'overflow: hidden; position: relative; display: block; padding-bottom: 40px;';
		swiperWrapper.style.cssText = 'display: flex; flex-direction: row; width: 100%; height: auto; box-sizing: content-box;';

		// Initialize Swiper
		swiperInstance = new Swiper(wrapper, {
			slidesPerView: 1,
			spaceBetween: 16,
			loop: true,
			pagination: {
				el: pagination,
				clickable: true,
			},
		});

		// Return cleanup function for matchMedia
		return () => {
			if (swiperInstance) {
				swiperInstance.destroy(true, true);
				swiperInstance = null;
			}
		};
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

// --- ANIMATIONS MODULE ---
function initAnimations(mm) {
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
		if ($el.is('[data-split-text]')) {
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

// --- UTILITIES MODULE ---
function initUtilities() {
	// Copy Email
	document.addEventListener('click', e => {
		const btn = e.target.closest('[data-copy]');
		if (!btn) return;
		const container = btn.closest('.w-col, .w-row, .w-container, section') || btn.parentElement;
		const mailto = btn.closest('a[href^="mailto:"]') || btn.querySelector('a[href^="mailto:"]') || container?.querySelector('a[href^="mailto:"]');
		if (mailto) {
			const email = mailto.href.replace('mailto:', '').split('?')[0];
			navigator.clipboard?.writeText(email);
		}
	});
}

document.addEventListener('DOMContentLoaded', () => {
  const contents = document.querySelector('[data-toc="contents"]');
  const list = document.querySelector('[data-toc="list"]');
  if (!contents || !list) return;

  // 1. Get Title (H1)
  const h1 = contents.querySelector('.blog-post-header_title-wrapper h1');
  
  // 2. Get Content Headings (H2, H3) in order
  const richText = contents.querySelector('.blog-post-content_content');
  const contentHeadings = richText ? richText.querySelectorAll('h2, h3') : [];

  // 3. Merge them
  const headings = [];
  if (h1) headings.push(h1);
  contentHeadings.forEach(h => headings.push(h));

  if (!headings.length) return;

  // 4. Build List with Hierarchy Classes
  list.innerHTML = '';
  headings.forEach((h, i) => {
    const id = `toc-${i}`;
    h.id = id;

    const link = document.createElement('a');
    link.href = `#${id}`;
    link.className = `toc_link is-${h.tagName.toLowerCase()}`; // Adds .is-h1, .is-h2, .is-h3
    link.textContent = h.textContent.trim();
    list.appendChild(link);
  });

  const links = list.querySelectorAll('a');

  // 5. Scroll Spy
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('is-active'));
        const link = list.querySelector(`a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('is-active');
      }
    });
  }, { rootMargin: '-20px 0px -80% 0px' }); // Trigger when item hits top area

  headings.forEach(h => observer.observe(h));

  // 6. Smart Scroll Handler
  list.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;
    
    e.preventDefault();
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    
    if (target) {
      // Manual offset calculation (Header height + Buffer)
      const offset = 120; 
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
  
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Selectors based on your screenshots
  const triggers = document.querySelectorAll('[data-list]');
  const wrapper = document.querySelector('[data-modal-wrapper]');
  const allModals = document.querySelectorAll('[data-modal]');
  const closeButtons = document.querySelectorAll('.modal_close-button');
  

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
  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeWrapper();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeWrapper();
  });
});


document.addEventListener("DOMContentLoaded", () => {
  function adjustLine() {
    const container = document.querySelector('.services_outer-wrapper.is-list');
    const line = document.querySelector('.services_slider-wrapper-line');
    const decors = document.querySelectorAll('[data-step="decor"]');

    if (!container || !line || decors.length < 2) return;

    const cRect = container.getBoundingClientRect();
    const firstRect = decors[0].getBoundingClientRect();
    const lastRect = decors[decors.length - 1].getBoundingClientRect();

    const top = (firstRect.top + firstRect.height / 2) - cRect.top;
    const height = (lastRect.top + lastRect.height / 2) - firstRect.top - (firstRect.height / 2);
    const left = (firstRect.left + firstRect.width / 2) - cRect.left;

    line.style.cssText = `position: absolute; top: ${top}px; height: ${height}px; left: ${left}px; transform: translateX(-50%);`;
  }

  adjustLine();
  window.addEventListener('resize', adjustLine);
});




document.addEventListener("DOMContentLoaded", () => {
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
});


