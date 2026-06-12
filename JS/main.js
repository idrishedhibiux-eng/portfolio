(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer  = window.matchMedia('(pointer: fine)').matches;
  if (finePointer) document.body.classList.add('pointer-fine');

  /* ── SCROLL PROGRESS BAR ── */
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);
  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ── POINTER GLOW (native cursor stays visible) ── */
  if (finePointer && !reduceMotion) {
    var glow = document.createElement('div');
    glow.className = 'glow-cursor';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    var gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      gx += (tx - gx) * 0.08;
      gy += (ty - gy) * 0.08;
      glow.style.transform = 'translate(' + gx + 'px,' + gy + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  /* ── SCROLL REVEAL ── */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── NAVIGATION ── */
  var nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  var navToggle = document.getElementById('navToggle');
  var navLinks  = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navToggle.classList.toggle('open', !open);
      navLinks.classList.toggle('open', !open);
      document.body.style.overflow = !open ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) navToggle.click();
    });
  }

  /* ── ACTIVE NAV LINK ON SCROLL (homepage) ── */
  var sectionIds = ['work', 'about', 'experience', 'process', 'contact'];
  var sections = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if (sections.length && navLinks) {
    var navAnchorFor = function (id) { return navLinks.querySelector('a[href="#' + id + '"]'); };
    var sectionIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = navAnchorFor(entry.target.id);
        if (!a) return;
        if (entry.isIntersecting) {
          navLinks.querySelectorAll('a').forEach(function (l) { l.classList.remove('active'); });
          a.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { sectionIo.observe(s); });
  }

  /* ── HERO · LETTER-BY-LETTER NAME REVEAL ── */
  var heroName = document.querySelector('.hero-name');
  if (heroName) {
    var label = heroName.textContent.replace(/_/g, '').replace(/\s+/g, ' ').trim();
    heroName.setAttribute('aria-label', label);
    var idx = 0;
    function splitNode(node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split('').forEach(function (ch) {
          if (ch.trim() === '') { frag.appendChild(document.createTextNode(ch)); return; }
          var s = document.createElement('span');
          s.className = 'ltr';
          s.setAttribute('aria-hidden', 'true');
          s.style.setProperty('--i', idx++);
          s.textContent = ch;
          frag.appendChild(s);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'BR' && !node.classList.contains('underscore')) {
        Array.prototype.slice.call(node.childNodes).forEach(splitNode);
      }
    }
    if (!reduceMotion) Array.prototype.slice.call(heroName.childNodes).forEach(splitNode);
  }

  /* ── HERO · ROTATING SPECIALTY WORD ── */
  var rotator = document.getElementById('heroRotator');
  if (rotator && !reduceMotion) {
    var words = ['Design Systems', 'Accessibility · WCAG 2.2', 'AI-Powered Platforms', 'Bilingual AR / EN · RTL', 'Government Services'];
    var wi = 0;
    setInterval(function () {
      wi = (wi + 1) % words.length;
      var span = rotator.querySelector('.rotator-word');
      if (!span) return;
      var clone = span.cloneNode(false);
      clone.textContent = words[wi];
      rotator.replaceChild(clone, span);
    }, 2600);
  }

  /* ── HERO · POINTER SPOTLIGHT ── */
  var hero = document.querySelector('.hero');
  if (hero && finePointer && !reduceMotion) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  }

  /* ── HERO · GENTLE 3D TILT ON PHOTO ── */
  var tiltEl = document.querySelector('.hero-image-wrap');
  if (tiltEl && finePointer && !reduceMotion) {
    tiltEl.addEventListener('mousemove', function (e) {
      var r = tiltEl.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      tiltEl.style.transform =
        'perspective(900px) rotateY(' + (px * 7) + 'deg) rotateX(' + (-py * 7) + 'deg)';
    });
    tiltEl.addEventListener('mouseleave', function () {
      tiltEl.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
    });
  }

  /* ── MAGNETIC BUTTONS ── */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.btn-primary, .btn-ghost').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ── ANIMATED COUNTERS (.stat-num / .cs-metric-num) ── */
  var counters = document.querySelectorAll('.stat-num, .cs-metric-num');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    var counterIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        counterIo.unobserve(entry.target);
        var el = entry.target;
        var m = el.textContent.trim().match(/^(\d+)(.*)$/);
        if (!m) return; // non-numeric like "UN" — leave as is
        var target = parseInt(m[1], 10), suffix = m[2];
        var t0 = null, dur = 1400;
        function tick(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterIo.observe(el); });
  }

  /* ── CONTACT FORM (Formspree) ── */
  var form = document.getElementById('contactForm');
  if (form) {
    var submitBtn = document.getElementById('formSubmit');
    var statusBox = document.getElementById('formStatus');
    var textarea  = document.getElementById('message');
    var charCount = document.getElementById('charCount');

    if (textarea && charCount) {
      textarea.addEventListener('input', function () {
        var n = textarea.value.length;
        charCount.textContent = n + ' / 1000';
        charCount.classList.toggle('over', n > 1000);
      });
    }

    var rules = {
      firstName: { label: 'First name', required: true },
      lastName:  { label: 'Last name',  required: true },
      email:     { label: 'Email',      required: true, email: true },
      message:   { label: 'Message',    required: true, maxLen: 1000 }
    };

    function validate(name, value) {
      var r = rules[name], v = value.trim();
      if (r.required && !v) return r.label + ' is required.';
      if (r.email && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address.';
      if (r.maxLen && v.length > r.maxLen) return r.label + ' must be ' + r.maxLen + ' characters or fewer.';
      return '';
    }
    function setFieldError(name, msg) {
      var el = form.elements[name];
      var err = document.getElementById(name + 'Error');
      if (!el || !err) return;
      el.classList.toggle('input-error', !!msg);
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      err.textContent = msg;
    }
    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name];
      if (!el) return;
      el.addEventListener('blur', function () { setFieldError(name, validate(name, el.value)); });
      el.addEventListener('input', function () {
        if (el.classList.contains('input-error')) setFieldError(name, validate(name, el.value));
      });
    });
    function showStatus(type, html) {
      statusBox.className = 'form-status form-status--' + type;
      statusBox.innerHTML = html;
      statusBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
      if (type === 'success') setTimeout(function () {
        statusBox.className = 'form-status';
        statusBox.innerHTML = '';
      }, 8000);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statusBox.className = 'form-status';
      statusBox.innerHTML = '';
      var hasErrors = false;
      Object.keys(rules).forEach(function (name) {
        var el = form.elements[name];
        if (!el) return;
        var err = validate(name, el.value);
        setFieldError(name, err);
        if (err) hasErrors = true;
      });
      if (hasErrors) {
        var first = form.querySelector('.input-error');
        if (first) first.focus();
        return;
      }
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      var payload = {
        firstName: form.elements.firstName.value.trim(),
        lastName:  form.elements.lastName.value.trim(),
        email:     form.elements.email.value.trim(),
        subject:   form.elements.subject ? form.elements.subject.value.trim() : '',
        message:   form.elements.message.value.trim()
      };
      fetch('https://formspree.io/f/xvzlovzb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return res.json().then(function (data) {
          if (res.ok) {
            showStatus('success', '> Message sent successfully. Thanks, ' + payload.firstName + ". I'll be in touch shortly.");
            form.reset();
            if (charCount) charCount.textContent = '0 / 1000';
            Object.keys(rules).forEach(function (n) { setFieldError(n, ''); });
          } else {
            showStatus('error', '> Error: ' + ((data && data.error) || 'Could not send. Please try again.'));
          }
        });
      }).catch(function () {
        showStatus('error', '> Network error. Please email me directly at idrishedhibi.ux@gmail.com');
      }).finally(function () {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      });
    });
  }
})();
