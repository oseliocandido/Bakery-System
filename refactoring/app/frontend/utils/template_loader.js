const templateLoader = {
  
    async initializeLayout() {
      await this.loadSidebar();
      this.setupMobileMenu();
      this.activateCurrentPageLink();
    },
  
  
    async loadSidebar() {
      const sidebarContainer = document.getElementById('sidebar-container');
      if (!sidebarContainer) return;
      
      try {
        const response = await fetch('/components/sidebar.html');
        
        if (!response.ok) {
          throw new Error(`Failed to load sidebar: ${response.status}`);
        }
        
        const html = await response.text();
        sidebarContainer.innerHTML = html;
        
        // Initialize sidebar interactions
        this.initializeSidebar();
        
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
     * Setup mobile menu toggle functionality
     */
    setupMobileMenu() {
      const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
      const sidebar = document.querySelector('.sidebar');
      
      if (mobileMenuToggle && sidebar) {
        // Show/hide mobile menu toggle based on screen size
        const checkScreenSize = () => {
          if (window.innerWidth <= 768) {
            mobileMenuToggle.style.display = 'flex';
            sidebar.classList.remove('mobile-visible');
          } else {
            mobileMenuToggle.style.display = 'none';
            sidebar.classList.remove('mobile-visible');
          }
        };
        
        // Toggle mobile menu
        mobileMenuToggle.addEventListener('click', () => {
          sidebar.classList.toggle('mobile-visible');
        });
        
        // Initial check and listen for resize
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
      }
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
  