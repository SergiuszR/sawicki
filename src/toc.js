export function initTOC() {
  const contents = document.querySelector('[data-toc="contents"]');
  const lists = document.querySelectorAll('[data-toc="list"]');
  if (!contents || lists.length === 0) return;

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
  // Assign IDs first
  headings.forEach((h, i) => {
    h.id = `toc-${i}`;
  });

  // Populate all lists
  lists.forEach(list => {
    list.innerHTML = '';
    headings.forEach((h) => {
      const link = document.createElement('a');
      link.href = `#${h.id}`;
      link.className = `toc_link is-${h.tagName.toLowerCase()}`; // Adds .is-h1, .is-h2
      link.textContent = h.textContent.trim();
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

  // 6. Smart Scroll Handler (for all lists)
  lists.forEach(list => {
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
}
