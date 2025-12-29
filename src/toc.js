export function initTOC() {
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
}
