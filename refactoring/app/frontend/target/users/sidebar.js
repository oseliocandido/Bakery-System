document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const content = document.querySelector('.content');
  const createUserContainer = document.querySelector('.container-create-user');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const submenuParents = document.querySelectorAll('.has-submenu');
  
  // Function to toggle sidebar collapse state
  function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    
    // Also adjust the main content area
    if (content) {
      content.classList.toggle('expanded');
    }
    
    // Adjust any other container that needs margin adjustment
    if (createUserContainer) {
      createUserContainer.classList.toggle('expanded');
    }
  }
  
  // Toggle submenu visibility
  function toggleSubmenu(e) {
    e.preventDefault();
    
    const parentItem = this;
    const submenu = parentItem.nextElementSibling;
    
    if (!submenu || !submenu.classList.contains('submenu')) {
      return;
    }
    
    // Toggle active class for styling
    parentItem.classList.toggle('active');
    submenu.classList.toggle('active');
  }
  
  // Toggle mobile menu visibility
  function toggleMobileMenu() {
    sidebar.classList.toggle('mobile-visible');
  }
  
  // Check screen size and adjust UI accordingly
  function checkScreenSize() {
    if (window.innerWidth <= 768) {
      mobileMenuToggle.style.display = 'flex';
      
      // If we're switching to mobile, ensure sidebar is hidden
      sidebar.classList.remove('mobile-visible');
    } else {
      mobileMenuToggle.style.display = 'none';
      
      // On desktop, remove mobile specific classes
      sidebar.classList.remove('mobile-visible');
    }
  }
  
  // Event listeners
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }
  
  // Add click event to submenu parent items
  submenuParents.forEach(item => {
    item.addEventListener('click', toggleSubmenu);
  });
  
  // Mobile menu toggle
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }
  
  // Initial check for screen size
  checkScreenSize();
  
  // Listen for window resize
  window.addEventListener('resize', checkScreenSize);
  
  // Activate submenus based on current page
  const currentPath = window.location.pathname;
  const menuLinks = document.querySelectorAll('.sidebar-nav-link');
  
  menuLinks.forEach(link => {
    // Skip links that don't have href attribute or are "#"
    if (!link.getAttribute('href') || link.getAttribute('href') === '#') {
      return;
    }
    
    // Check if the current page URL contains the link's href
    if (currentPath.includes(link.getAttribute('href'))) {
      link.classList.add('active');
      
      // If this link has a submenu, show it
      const submenu = link.nextElementSibling;
      if (submenu && submenu.classList.contains('submenu')) {
        submenu.classList.add('active');
        link.classList.add('active');
      }
      
      // Also activate parent links if this is a submenu item
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
});