(() => {
  'use strict';
  document.documentElement.classList.add('js');

  const year = document.getElementById('footer-year');
  if (year) year.textContent = String(new Date().getFullYear());

  const printButton = document.getElementById('print-resume');
  if (printButton) {
    printButton.hidden = false;
    printButton.addEventListener('click', () => window.print());
  }

  const menuButton = document.getElementById('menu-toggle');
  const navigation = document.getElementById('main-nav');
  if (menuButton && navigation) {
    const narrowScreen = window.matchMedia('(max-width: 680px)');
    menuButton.hidden = false;
    const setMenu = (open) => {
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      navigation.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open && narrowScreen.matches);
    };
    setMenu(false);
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuButton.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.nav-wrap')) setMenu(false);
    });
    navigation.addEventListener('focusout', (event) => {
      if (event.relatedTarget && !navigation.contains(event.relatedTarget) && event.relatedTarget !== menuButton) setMenu(false);
    });
    narrowScreen.addEventListener('change', () => setMenu(false));

    if ('IntersectionObserver' in window) {
      const sectionLinks = Array.from(navigation.querySelectorAll('a[href^="#"]'));
      const visibleSections = new Map();
      const observer = new IntersectionObserver((entries) => {
        // A callback contains changed sections, so retain the other visible sections.
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleSections.set(entry.target.id, entry);
          else visibleSections.delete(entry.target.id);
        });
        const visible = Array.from(visibleSections.values()).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const activeSection = visible[0]?.target.id;
        sectionLinks.forEach((link) => {
          if (link.hash === '#' + activeSection) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }, { rootMargin: '-12% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
      sectionLinks.forEach((link) => {
        const section = document.getElementById(link.hash.slice(1));
        if (section) observer.observe(section);
      });
    }
  }

  const toolbar = document.getElementById('work-toolbar');
  if (toolbar) {
    const projects = Array.from(document.querySelectorAll('[data-category]'));
    const buttons = Array.from(toolbar.querySelectorAll('[data-filter]'));
    const count = document.getElementById('filter-count');
    const featured = document.getElementById('featured-projects');
    const more = document.getElementById('more-work');
    const allCount = toolbar.querySelector('[data-filter="all"] span');
    if (allCount) allCount.textContent = String(projects.length);
    toolbar.hidden = false;
    // Skills links must still reveal their project after a different filter.
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || link.hash.length < 2) return;
      const target = document.getElementById(link.hash.slice(1));
      const project = target && target.closest('[data-category]');
      if (project && project.hidden) {
        const allButton = toolbar.querySelector('[data-filter="all"]');
        if (allButton) allButton.click();
      }
    });
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const selected = button.dataset.filter;
        buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        let visible = 0;
        projects.forEach((project) => {
          const matches = selected === 'all' || project.dataset.category === selected;
          project.hidden = !matches;
          if (matches) visible += 1;
        });
        if (featured) featured.hidden = !Array.from(featured.children).some((project) => !project.hidden);
        if (more) more.hidden = !Array.from(more.querySelectorAll('[data-category]')).some((project) => !project.hidden);
        if (count) count.textContent = 'Showing ' + visible + (visible === 1 ? ' project' : ' projects');
      });
    });
  }
})();
