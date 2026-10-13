document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('modern-navbar');
  const layoutContainer = document.getElementById('layout-container');
  const gridBackground = document.getElementById('grid-background');
  const themeToggle = document.getElementById('theme-toggle');
  const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
  const mobileThemeLabel = document.getElementById('mobile-theme-label');
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');

  const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');

  const profileTrigger = document.getElementById('profile-trigger');
  const profileDropdown = document.getElementById('profile-dropdown');
  const brandLogoBtn = document.getElementById('brand-logo-btn');
  const heroContactBtn = document.getElementById('hero-contact-btn');

  // --- 1. Theme Management ---
  const getInitialTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  };

  let currentTheme = getInitialTheme();

  const applyTheme = (theme) => {
    currentTheme = theme;
    const isDark = theme === 'dark';

    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark-theme', isDark);
    document.documentElement.classList.toggle('light-theme', !isDark);
    document.body.classList.toggle('dark-theme', isDark);
    document.body.classList.toggle('light-theme', !isDark);

    if (navbar) {
      navbar.classList.toggle('dark', isDark);
      navbar.classList.toggle('light', !isDark);
    }
    if (layoutContainer) {
      layoutContainer.classList.toggle('dark', isDark);
      layoutContainer.classList.toggle('light', !isDark);
    }
    if (gridBackground) {
      gridBackground.classList.toggle('dark', isDark);
      gridBackground.classList.toggle('light', !isDark);
    }
    if (sunIcon && moonIcon) {
      sunIcon.style.display = isDark ? 'block' : 'none';
      moonIcon.style.display = isDark ? 'none' : 'block';
    }
    if (mobileThemeLabel) {
      mobileThemeLabel.textContent = `Switch to ${isDark ? 'Light' : 'Dark'} Mode`;
    }

    localStorage.setItem('theme', theme);
  };

  applyTheme(currentTheme);

  const toggleTheme = () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);

  // --- 2. Scroll Navbar Effect ---
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // --- 3. Mobile Drawer ---
  const setMobileMenuOpen = (open) => {
    if (!mobileMenu || !mobileOverlay) return;
    mobileMenu.classList.toggle('open', open);
    mobileOverlay.classList.toggle('open', open);
  };

  if (mobileMenuTrigger) {
    mobileMenuTrigger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      setMobileMenuOpen(!isOpen);
    });
  }
  if (mobileClose) {
    mobileClose.addEventListener('click', () => setMobileMenuOpen(false));
  }
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', () => setMobileMenuOpen(false));
  }
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && mobileMenu && mobileMenu.classList.contains('open')) {
      setMobileMenuOpen(false);
    }
  });

  // --- 4. Profile Dropdown ---
  if (profileTrigger && profileDropdown) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = profileDropdown.style.display === 'block';
      profileDropdown.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('mousedown', (e) => {
      if (
        profileDropdown.style.display === 'block' &&
        !profileDropdown.contains(e.target) &&
        !profileTrigger.contains(e.target)
      ) {
        profileDropdown.style.display = 'none';
      }
    });
  }

  // --- 5. Tab View Switching ---
  const viewIds = ['overview', 'projects', 'stars', 'outreach', 'contact'];
  const desktopNavButtons = document.querySelectorAll('#desktop-nav .nav-item');
  const mobileNavButtons = document.querySelectorAll('#mobile-nav .mobile-nav-item');

  const switchView = (targetView) => {
    if (!viewIds.includes(targetView)) return;

    viewIds.forEach((id) => {
      const el = document.getElementById(`view-${id}`);
      if (el) {
        if (id === targetView) {
          el.style.display = 'block';
          // Retrigger entrance animations cleanly
          el.classList.remove('animate-fade-up');
          void el.offsetWidth;
          el.classList.add('animate-fade-up');
        } else {
          el.style.display = 'none';
        }
      }
    });

    desktopNavButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === targetView);
    });

    mobileNavButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === targetView);
    });

    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  desktopNavButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      switchView(btn.getAttribute('data-view'));
    });
  });

  mobileNavButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      switchView(btn.getAttribute('data-view'));
    });
  });

  if (brandLogoBtn) {
    brandLogoBtn.addEventListener('click', () => switchView('overview'));
  }

  if (heroContactBtn) {
    heroContactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('contact');
    });
  }

  // --- 6. Projects Filter ---
  const projectFilterBtns = document.querySelectorAll('#projects-filter .filter-button');
  const projectCards = document.querySelectorAll('#projects-grid .project-card');

  projectFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      projectFilterBtns.forEach((b) => b.classList.toggle('active', b === btn));

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.classList.remove('animate-fade-up');
          void card.offsetWidth;
          card.classList.add('animate-fade-up');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- 7. Certificates Filter & Verification Click ---
  const certFilterBtns = document.querySelectorAll('#certificates-filter .filter-button');
  const certCards = document.querySelectorAll('#certificates-grid .certificate-card');

  certFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-cert-filter');
      certFilterBtns.forEach((b) => b.classList.toggle('active', b === btn));

      certCards.forEach((card) => {
        const type = card.getAttribute('data-cert-type');
        if (filter === 'all' || type === filter) {
          card.style.display = 'flex';
          card.classList.remove('animate-fade-up');
          void card.offsetWidth;
          card.classList.add('animate-fade-up');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  certCards.forEach((card) => {
    card.addEventListener('click', () => {
      const url = card.getAttribute('data-url');
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  });

  // --- 8. Experience Timeline Expand / Collapse ---
  const expToggles = document.querySelectorAll('.exp-toggle');
  expToggles.forEach((header) => {
    header.addEventListener('click', () => {
      const targetId = header.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      const isExpanded = targetEl.style.display === 'block';
      targetEl.style.display = isExpanded ? 'none' : 'block';

      const textSpan = header.querySelector('.expand-text');
      const chevronSvg = header.querySelector('.chevron-icon');
      if (textSpan) {
        textSpan.textContent = isExpanded ? 'Show More' : 'Show Less';
      }
      if (chevronSvg) {
        chevronSvg.innerHTML = isExpanded
          ? '<path d="m6 9 6 6 6-6"/>'
          : '<path d="m18 15-6-6-6 6"/>';
      }
    });
  });

  // --- 9. Contact Form Submission ---
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formSuccess = document.getElementById('form-success');

  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.classList.add('submitting');
      submitBtn.innerHTML = '<div class="spinner"></div><span>Sending...</span>';

      await new Promise((resolve) => setTimeout(resolve, 1200));

      submitBtn.classList.remove('submitting');
      submitBtn.classList.add('success');
      submitBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        <span>Message Sent!</span>
      `;
      if (formSuccess) {
        formSuccess.style.display = 'flex';
      }

      contactForm.reset();
      submitBtn.disabled = false;

      setTimeout(() => {
        submitBtn.classList.remove('success');
        submitBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>
          <span>Send Message</span>
        `;
      }, 4000);
    });
  }
});
