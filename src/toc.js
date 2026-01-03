export function initTOC() {
  const contents = document.querySelector('[data-toc="contents"]');
  const lists = document.querySelectorAll('[data-toc="list"]');
  if (!contents || lists.length === 0) return;

  // Helper: slugify text for URL-friendly IDs
  function slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w-]+/g, '')     // Remove non-word chars (except -)
      .replace(/--+/g, '-')        // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start
      .replace(/-+$/, '');         // Trim - from end
  }

  // Helper: get scroll offset based on viewport
  function getScrollOffset() {
    const isMobile = window.innerWidth < 768;
    return isMobile ? 120 : 120; // 120px offset for both (navbar ~106px + buffer)
  }

  // 1. Get Title (H1)
  const h1 = contents.querySelector('.blog-post-header_title-wrapper h1');
  
  // 2. Get Content Headings (H2 only)
  const richText = contents.querySelector('.blog-post-content_content');
  const contentHeadings = richText ? richText.querySelectorAll('h2') : [];

  // 3. Merge them
  const headings = [];
  if (h1) headings.push(h1);
  contentHeadings.forEach(h => headings.push(h));

  if (!headings.length) return;

  // 4. Build List with Hierarchy Classes
  // Assign slugified IDs based on heading text and apply scroll margin
  const usedIds = new Set();
  
  function applyScrollMargins() {
    const offset = getScrollOffset();
    headings.forEach((h) => {
      h.style.scrollMarginTop = `${offset}px`;
    });
  }
  
  headings.forEach((h) => {
    let baseSlug = slugify(h.textContent);
    if (!baseSlug) baseSlug = 'section';
    
    // Ensure unique IDs
    let slug = baseSlug;
    let counter = 1;
    while (usedIds.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    usedIds.add(slug);
    h.id = slug;
  });
  
  // Apply scroll margins initially and on resize
  applyScrollMargins();
  window.addEventListener('resize', applyScrollMargins);

  // Populate all lists
  lists.forEach(list => {
    list.innerHTML = '';
    headings.forEach((h) => {
      const link = document.createElement('a');
      link.href = `#${h.id}`;
      link.className = `toc_link is-${h.tagName.toLowerCase()}`; // Adds .is-h1, .is-h2
      link.textContent = h.textContent.trim();
      link.setAttribute('data-lenis-prevent', ''); // Prevent Lenis from intercepting
      list.appendChild(link);
    });
  });

  // 5. Scroll Spy
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Reset all
        lists.forEach(list => {
          list.querySelectorAll('a').forEach(l => l.classList.remove('is-active'));
        });
        
        // precise target id match
        const targetId = entry.target.id;
        
        // Active specific link in all lists
        lists.forEach(list => {
           const link = list.querySelector(`a[href="#${targetId}"]`);
           if (link) link.classList.add('is-active');
        });
      }
    });
  }, { rootMargin: '-20px 0px -80% 0px' });

  headings.forEach(h => observer.observe(h));

  // 6. Click Handler (for all lists)
  // Uses scrollIntoView which respects scroll-margin-top CSS
  lists.forEach(list => {
    list.addEventListener('click', e => {
      const link = e.target.closest('a');
      if (!link) return;
      
      e.preventDefault();
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL hash without triggering scroll
        history.pushState(null, '', `#${id}`);
      }
    });
  });
}

