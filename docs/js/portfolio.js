(function () {
  'use strict';

  var prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setupReveal() {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!els.length) return;

    document.body.classList.add('gx-reveal-on');
    els.forEach(function (el) {
      var step = Number(el.getAttribute('data-reveal')) || 0;
      el.style.setProperty('--gx-delay', step * 90 + 'ms');
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach(function (el) {
      observer.observe(el);
    });
  }

  function setupScrollSpy() {
    if (!('IntersectionObserver' in window)) return;

    var sectionToLink = {
      experience: 'experience',
      education: 'experience',
      services: 'services',
      about: 'about'
    };
    var links = {};
    Object.keys(sectionToLink).forEach(function (id) {
      var target = sectionToLink[id];
      if (!links[target]) links[target] = document.querySelector('.gx-navlinks a[href="#' + target + '"]');
    });

    var sections = Object.keys(sectionToLink)
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);
    if (!sections.length) return;

    function activate(id) {
      Object.keys(links).forEach(function (key) {
        var link = links[key];
        if (!link) return;
        if (key === id) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) activate(sectionToLink[entry.target.id]);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function setupSentNotice() {
    var notice = document.getElementById('gx-sent');
    if (!notice) return;

    var sent;
    try {
      sent = new URLSearchParams(window.location.search).get('s') === '1';
    } catch (error) {
      sent = false;
    }
    if (!sent) return;

    notice.hidden = false;
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + '#contact');
    }
    var contact = document.getElementById('contact');
    if (contact) contact.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  function init() {
    setupReveal();
    setupScrollSpy();
    setupSentNotice();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
