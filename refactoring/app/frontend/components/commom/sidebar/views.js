function showView(navLinks, viewType, url = '') {
  navLinks.forEach(({ view_id, view_type }) => {
    const el = document.getElementById(view_id);
    if (el) {
      el.style.display = (view_type === viewType) ? 'block' : 'none';
    }
  });
  if (url) {
    history.pushState(null, '', url);
  }
}

export function setupViewNavigation({navLinks}) {
  // Attach click handlers
  navLinks.forEach(({ selector, view_type }) => {
    const el = document.querySelector(selector);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showView(navLinks, view_type, window.location.pathname + `?view=${view_type}`);
      });
    }
  });
}