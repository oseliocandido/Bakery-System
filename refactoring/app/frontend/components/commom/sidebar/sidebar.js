const viewIds = {
  list: 'users-list-view',
  create: 'user-create-view',
  edit: 'user-edit-view'
};

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

function setupViewNavigation(navLinks) {
  navLinks.forEach(({ selector, view }) => {
    const el = document.querySelector(selector);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showView(view, `/modules/users/user.html?view=${view}`);
      });
    }
  });
}

const templateLoader = {
  async initializeLayout() {
    await this.loadSidebar();
    this.activateCurrentPageLink();
  },

  async loadSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;
    try {
      const response = await fetch('/components/commom/sidebar/sidebar.html');

      if (!response.ok) {
        throw new Error(`Failed to load sidebar: ${response.status}`);
      }

      const html = await response.text();
      sidebarContainer.innerHTML = html;

      // Initialize sidebar interactions
      this.initializeSidebar();

      // Setup view navigation for user module if on user.html
      if (window.location.pathname.endsWith('/modules/users/user.html')) {
        // Wait for the main content to be available before setting up navigation
        setTimeout(() => {
          setupViewNavigation([
            { selector: '.submenu-link[href*="user.html?view=list"]', view: 'list' },
            { selector: '.submenu-link[href*="user.html?view=edit"]', view: 'edit' },
            { selector: '#btn-create-user', view: 'create' }
          ]);
          // Cancel button in edit view returns to list view
          const cancelBtn = document.getElementById('cancel-edit');
          if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
              e.preventDefault();
              const views = getViews();
              Object.entries(views).forEach(([key, el]) => {
                if (!el) return;
                el.style.display = (key === 'list') ? 'block' : 'none';
              });
              history.pushState(null, '', '/modules/users/user.html?view=list');
            });
          }
        }, 0);
      }

    } catch (error) {
      console.error('Error loading sidebar:', error);
      sidebarContainer.innerHTML = '<div class="sidebar-error">Failed to load navigation</div>';
    }
  },

  initializeSidebar() {
    // DOM elements
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const content = document.querySelector('.content');
    const submenuParents = document.querySelectorAll('.has-submenu');

    // Toggle sidebar collapse
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        if (content) {
          content.classList.toggle('expanded');
        }
      });
    }

    // Toggle submenus
    submenuParents.forEach(item => {
      item.addEventListener('click', function(e) {
        // Check if the click is directly on the menu link or a submenu link
        // If clicking on a submenu item, don't toggle the parent menu
        if (e.target.closest('.submenu-link')) {
          return;
        }

        e.preventDefault();

        const submenu = this.nextElementSibling;
        if (!submenu || !submenu.classList.contains('submenu')) {
          return;
        }

        this.classList.toggle('active');
        submenu.classList.toggle('active');
      });
    });
  },

  /**
   * Activate sidebar links based on current page
   */
  activateCurrentPageLink() {
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.sidebar-nav-link');

    menuLinks.forEach(link => {
      // Skip links without href attribute or with '#'
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      // Check if current page URL contains the link's href
      if (currentPath.includes(href)) {
        link.classList.add('active');

        // If this link has a submenu, show it
        const submenu = link.nextElementSibling;
        if (submenu && submenu.classList.contains('submenu')) {
          submenu.classList.add('active');
        }

        // Activate parent links if this is a submenu item
        const submenuItem = link.closest('.submenu-item');
        if (submenuItem) {
          const parentMenu = submenuItem.closest('.submenu');
          if (parentMenu) {
            parentMenu.classList.add('active');
            const parentLink = parentMenu.previousElementSibling;
            if (parentLink) {
              parentLink.classList.add('active');
            }
          }
        }
      }
    });
  }
};

export default templateLoader;
