/**
 * FAQ Accordion & Expand/Collapse functionality
 */

export function initFAQ() {
  initAccordion();
  initExpandCollapse();
}

function initAccordion() {
  const faqItems = document.querySelectorAll('.faq_accordion');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq_question');
    const answer = item.querySelector('.faq_answer');
    if (!question || !answer) return;

    const decor = question.querySelector('.decor-tiny');
    const plusIcon = question.querySelector('.faq_icon-wrapper path:last-child');
    const questionText = question.querySelector('.is-question');
    
    question.setAttribute('role', 'button');
    question.setAttribute('aria-expanded', 'false');
    question.setAttribute('tabindex', '0');
    answer.setAttribute('aria-hidden', 'true');
    
    answer.style.maxHeight = '0';
    answer.style.overflow = 'hidden';
    answer.style.transition = 'max-height 0.4s ease';
    
    if (decor) {
      decor.style.opacity = '0';
      decor.style.transform = 'translateX(-10px)';
      decor.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    }
    
    if (plusIcon) {
      plusIcon.style.transition = 'opacity 0.3s ease';
    }
    
    if (questionText) {
      questionText.style.transition = 'font-weight 0.3s ease';
    }
    
    question.addEventListener('click', () => toggleAccordion(item, faqItems));
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleAccordion(item, faqItems);
      }
    });
  });
}

function toggleAccordion(currentItem, faqItems) {
  const currentQuestion = currentItem.querySelector('.faq_question');
  const currentAnswer = currentItem.querySelector('.faq_answer');
  const currentDecor = currentQuestion.querySelector('.decor-tiny');
  const currentPlusIcon = currentQuestion.querySelector('.faq_icon-wrapper path:last-child');
  const currentQuestionText = currentQuestion.querySelector('.is-question');
  const isExpanded = currentQuestion.getAttribute('aria-expanded') === 'true';
  
  // Close all items
  faqItems.forEach(item => {
    const question = item.querySelector('.faq_question');
    const answer = item.querySelector('.faq_answer');
    const decor = question.querySelector('.decor-tiny');
    const plusIcon = question.querySelector('.faq_icon-wrapper path:last-child');
    const questionText = question.querySelector('.is-question');
    
    question.setAttribute('aria-expanded', 'false');
    answer.setAttribute('aria-hidden', 'true');
    answer.style.maxHeight = '0';
    
    if (decor) {
      decor.style.opacity = '0';
      decor.style.transform = 'translateX(-10px)';
    }
    if (plusIcon) plusIcon.style.opacity = '1';
    if (questionText) questionText.style.fontWeight = '400';
  });
  
  // Open current if it was closed
  if (!isExpanded) {
    currentQuestion.setAttribute('aria-expanded', 'true');
    currentAnswer.setAttribute('aria-hidden', 'false');
    currentAnswer.style.maxHeight = currentAnswer.scrollHeight + 'px';
    
    if (currentDecor) {
      currentDecor.style.opacity = '1';
      currentDecor.style.transform = 'translateX(0)';
    }
    if (currentPlusIcon) currentPlusIcon.style.opacity = '0';
    if (currentQuestionText) currentQuestionText.style.fontWeight = '500';
  }
}

function initExpandCollapse() {
  document.querySelectorAll('[data-wrapper]').forEach(wrapper => {
    Object.assign(wrapper.style, {
      display: '-webkit-box',
      webkitLineClamp: '2',
      webkitBoxOrient: 'vertical',
      overflow: 'hidden'
    });
    
    setTimeout(() => {
      if (wrapper.scrollHeight > wrapper.clientHeight) {
        const link = document.createElement('a');
        link.textContent = 'Rozwiń';
        link.href = '#';
        Object.assign(link.style, {
          cursor: 'pointer',
          textDecoration: 'underline',
          display: 'inline-block',
          color: "#000",
          fontSize: "0.875rem"
        });
        
        wrapper.parentNode.insertBefore(link, wrapper.nextSibling);
        
        link.onclick = e => {
          e.preventDefault();
          wrapper.style.webkitLineClamp = 'unset';
          wrapper.style.display = 'block';
          link.style.display = 'none';
        };
      }
    }, 10);
  });
}
