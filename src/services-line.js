export function initServicesLine() {
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
}
