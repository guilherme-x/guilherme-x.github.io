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
      expertise: 'expertise',
      about: 'about',
      education: 'about'
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

  function setupGlassSheen() {
    if (prefersReducedMotion) return;
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var active = null;
    var pending = null;
    var frame = 0;

    function reset(el) {
      el.style.removeProperty('--gx-mx');
      el.style.removeProperty('--gx-my');
    }

    function paint() {
      frame = 0;
      if (!pending) return;
      var rect = pending.el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pending.el.style.setProperty('--gx-mx', (((pending.x - rect.left) / rect.width) * 100).toFixed(1) + '%');
      pending.el.style.setProperty('--gx-my', (((pending.y - rect.top) / rect.height) * 100).toFixed(1) + '%');
    }

    document.addEventListener(
      'pointermove',
      function (event) {
        var el = event.target instanceof Element ? event.target.closest('.glass') : null;
        if (active && active !== el) reset(active);
        active = el;
        if (!el) {
          pending = null;
          return;
        }
        pending = { el: el, x: event.clientX, y: event.clientY };
        if (!frame) frame = window.requestAnimationFrame(paint);
      },
      { passive: true }
    );
  }

  function setupYear() {
    var year = String(new Date().getFullYear());
    Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
      el.textContent = year;
    });
  }

  function setupPhotoToggle() {
    var figure = document.querySelector('.gx-photo');
    if (!figure) return;
    figure.addEventListener('click', function () {
      figure.classList.toggle('is-color');
    });
  }

  function setupMenu() {
    var nav = document.querySelector('.gx-nav');
    var button = nav && nav.querySelector('.gx-menu-btn');
    var links = nav && nav.querySelector('.gx-navlinks');
    if (!nav || !button || !links) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    button.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    links.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        button.focus();
      }
    });
    document.addEventListener('click', function (event) {
      if (nav.classList.contains('is-open') && !nav.contains(event.target)) setOpen(false);
    });
  }

  function setupForm() {
    var form = document.querySelector('.gx-form');
    if (!form || !window.fetch || !window.URLSearchParams) return;
    var sent = document.getElementById('gx-sent');
    var error = document.getElementById('gx-form-error');
    var button = form.querySelector('button[type="submit"]');

    function showSent() {
      form.reset();
      if (error) error.hidden = true;
      if (sent) sent.hidden = false;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (form.elements.website && form.elements.website.value) {
        showSent();
        return;
      }
      if (sent) sent.hidden = true;
      if (error) error.hidden = true;
      button.disabled = true;

      var payload = {};
      Array.prototype.forEach.call(form.elements, function (field) {
        if (field.name && field.name !== 'website') payload[field.name] = field.value;
      });

      // JSON forces a CORS preflight, so a blocked request never reaches the sheet and the
      // native fallback below cannot double-submit. A dashboard redirect after a successful
      // save surfaces as an opaque redirect, which is still a success.
      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'manual'
      })
        .then(function (response) {
          if (response.ok || response.type === 'opaqueredirect') {
            showSent();
            return;
          }
          throw new Error('HTTP ' + response.status);
        })
        .catch(function () {
          button.disabled = false;
          form.submit();
        })
        .then(function () {
          button.disabled = false;
        });
    });
  }

  function init() {
    setupReveal();
    setupScrollSpy();
    setupSentNotice();
    setupGlassSheen();
    setupYear();
    setupPhotoToggle();
    setupMenu();
    setupForm();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
