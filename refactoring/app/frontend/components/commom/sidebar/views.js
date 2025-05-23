export function setupViewNavigation({ viewIds, navLinks, defaultView = null }) {
  function getViews() {
    const result = {};
    for (const [key, id] of Object.entries(viewIds)) {
      result[key] = document.getElementById(id);
    }
    return result;
  }

  function showView(viewKey, url = '') {
    const views = getViews();
    Object.entries(views).forEach(([key, el]) => {
      if (!el) return;
      el.style.display = (key === viewKey) ? 'block' : 'none';
    });
    if (url) {
      history.pushState(null, '', url);
    }
  }

  navLinks.forEach(({ selector, view }) => {
    const el = document.querySelector(selector);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showView(view, window.location.pathname + `?view=${view}`);
      });
    }
  });

  // Show initial view based on URL or default
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (view && viewIds[view]) {
    showView(view);
  } else if (defaultView && viewIds[defaultView]) {
    showView(defaultView);
  }

  return showView;
}
