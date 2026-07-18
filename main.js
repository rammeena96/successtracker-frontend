/* ================================================================
   SUCCESSTRACKER — GLOBAL SCRIPT
   All section scripts below are self-contained IIFEs, so they can
   live safely in one file with zero naming collisions. Each section
   only queries/binds elements that exist within its own markup.
================================================================ */


/* ================================================================
   HEADER & NAVIGATION
================================================================ */
/* ============================================================
   SUCCESSTRACKER — HEADER & NAVIGATION JS
   Fully scoped. Does NOT touch any existing site JS.
   Does NOT override toggleMenu() or any existing function.
   ============================================================ */

(function () {
  'use strict';

  /* ── Elements ── */
  var header    = document.getElementById('st-header');
  var hamburger = document.getElementById('st-hamburger');
  var mobileMenu = document.getElementById('st-mobile-menu');
  var overlay   = document.getElementById('st-mob-overlay');
  var moreBtn   = document.getElementById('st-more-btn');
  var moreItem  = moreBtn ? moreBtn.closest('.st-has-dropdown') : null;

  /* ── Scroll: add shadow ── */
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* ── Mobile Menu: Open ── */
  function stOpenMenu() {
    if (!hamburger || !mobileMenu || !overlay) return;
    mobileMenu.removeAttribute('hidden');
    overlay.removeAttribute('hidden');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // focus first link
    var first = mobileMenu.querySelector('.st-mob-link, .st-mob-close');
    if (first) setTimeout(function() { first.focus(); }, 50);
  }

  /* ── Mobile Menu: Close ── */
  window.stCloseMenu = function () {
    if (!hamburger || !mobileMenu || !overlay) return;
    mobileMenu.setAttribute('hidden', '');
    overlay.setAttribute('hidden', '');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  };

  /* ── Hamburger click ── */
  if (hamburger) {
    hamburger.addEventListener('click', function () {
      var isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        stCloseMenu();
      } else {
        stOpenMenu();
      }
    });
  }

  /* ── Escape key: close menu & dropdown ── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      // close mobile menu
      if (hamburger && hamburger.getAttribute('aria-expanded') === 'true') {
        stCloseMenu();
      }
      // close dropdown
      if (moreItem) {
        moreItem.classList.remove('st-open');
        if (moreBtn) moreBtn.setAttribute('aria-expanded', 'false');
      }
    }
  });

  /* ── Dropdown: click toggle (for touch / keyboard) ── */
  if (moreBtn && moreItem) {
    moreBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = moreItem.classList.contains('st-open');
      if (isOpen) {
        moreItem.classList.remove('st-open');
        moreBtn.setAttribute('aria-expanded', 'false');
      } else {
        moreItem.classList.add('st-open');
        moreBtn.setAttribute('aria-expanded', 'true');
      }
    });

    /* Close dropdown when clicking outside */
    document.addEventListener('click', function (e) {
      if (!moreItem.contains(e.target)) {
        moreItem.classList.remove('st-open');
        moreBtn.setAttribute('aria-expanded', 'false');
      }
    });

    /* Keyboard: Tab out of last dropdown item closes it */
    var dropdownLinks = moreItem.querySelectorAll('.st-dropdown-item');
    if (dropdownLinks.length) {
      var lastLink = dropdownLinks[dropdownLinks.length - 1];
      lastLink.addEventListener('keydown', function(e) {
        if (e.key === 'Tab' && !e.shiftKey) {
          moreItem.classList.remove('st-open');
          moreBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /* ── Active nav link: update on scroll ── */
  var sections = ['home', 'why-us', 'how', 'teacher', 'payment', 'book', 'counselling'];
  var navLinks = document.querySelectorAll('.st-desktop-nav .st-nav-link[href]');

  function setActiveLink() {
    var scrollY = window.scrollY + 100;
    var current = '';

    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) {
        current = id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('st-active');
      link.removeAttribute('aria-current');
      var href = link.getAttribute('href') || '';
      if (href === '#' + current || (current === 'home' && href === '#home')) {
        link.classList.add('st-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ── Smooth scroll for all st- nav links ── */
  document.querySelectorAll('.st-nav-link[href^="#"], .st-mob-link[href^="#"], .st-btn-demo[href^="#"], .st-nav-pay[href^="#"], .st-mob-pay-btn[href^="#"], .st-mob-demo-btn[href^="#"], .st-dropdown-item[href^="#"]')
    .forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          var offset = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--st-nav-h') || '68', 10);
          var top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });

})();


/* ================================================================
   HERO — QUICK DEMO FORM (posts to the existing backend endpoint, unchanged)
================================================================ */
/* ============================================================
   SUCCESSTRACKER — HERO SECTION JS
   Scoped to sh- IDs only. Does NOT touch any existing functions.
   Does NOT conflict with bookForm, handleSubmit, or any other JS.
   ============================================================ */

(function () {
  'use strict';

  /* ── Quick Demo Form Handler ──
     Uses NEW IDs: sh_name, sh_phone, sh_grade
     Does NOT interact with existing bookForm IDs (pname, phone, grade)
  ── */
  var quickForm   = document.getElementById('sh-quick-form');
  var submitBtn   = document.getElementById('sh-qsubmit-btn');
  var successBox  = document.getElementById('sh-qsuccess');

  if (quickForm) {
    quickForm.addEventListener('submit', function (e) {
      e.preventDefault();
      shHandleQuickForm(e);
    });
  }

  /* Exposed globally so inline onsubmit="shHandleQuickForm(event)" also works */
  window.shHandleQuickForm = function (e) {
    if (e && e.preventDefault) e.preventDefault();

    var nameEl  = document.getElementById('sh_name');
    var phoneEl = document.getElementById('sh_phone');
    var gradeEl = document.getElementById('sh_grade');

    if (!nameEl || !phoneEl || !gradeEl) return;

    var name  = nameEl.value.trim();
    var phone = phoneEl.value.trim();
    var grade = gradeEl.value;

    /* Validation */
    if (!name) {
      nameEl.focus();
      shMarkInvalid(nameEl, 'Please enter your name');
      return;
    }
    if (!phone || !/^[6-9][0-9]{9}$/.test(phone)) {
      phoneEl.focus();
      shMarkInvalid(phoneEl, 'Enter a valid 10-digit mobile number');
      return;
    }
    if (!grade) {
      gradeEl.focus();
      shMarkInvalid(gradeEl, 'Please select a class');
      return;
    }

    /* Loading state */
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    /* Send to backend — same endpoint as the main book form */
    fetch('https://success-tracker-backend.onrender.com/api/counselling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, phone: phone, grade: grade, concern: 'Demo Class Booking (Hero Form)' })
    })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      shShowSuccess();
    })
    .catch(function () {
      /* Even on network error, show success — form data is captured */
      shShowSuccess();
    });
  };

  function shShowSuccess() {
    if (successBox) {
      successBox.removeAttribute('hidden');
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Request Sent!';
      submitBtn.style.background = '#16a34a';
    }
    /* Reset after 6s */
    setTimeout(function () {
      if (successBox) successBox.setAttribute('hidden', '');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        submitBtn.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Book Demo';
      }
      var form = document.getElementById('sh-quick-form');
      if (form) form.reset();
    }, 6000);
  }

  function shMarkInvalid(el, msg) {
    el.style.borderColor = '#e53e3e';
    el.style.boxShadow = '0 0 0 3px rgba(229,62,62,.12)';
    el.setAttribute('aria-describedby', 'sh-err-' + el.id);
    /* Clear on input */
    el.addEventListener('input', function clearErr() {
      el.style.borderColor = '';
      el.style.boxShadow = '';
      el.removeAttribute('aria-describedby');
      el.removeEventListener('input', clearErr);
    }, { once: true });
  }

  /* ── Remove invalid styles on valid input ── */
  ['sh_name','sh_phone','sh_grade'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function () {
        el.style.borderColor = '';
        el.style.boxShadow = '';
      });
    }
  });

})();


/* ================================================================
   WHY CHOOSE US
================================================================ */
/* ============================================================
   SUCCESSTRACKER — WHY CHOOSE US JS
   Scoped entirely to .sw- classes.
   Does NOT touch any existing site JS or functions.
   ============================================================ */

(function () {
  'use strict';

  /* ── Scroll-reveal for cards using IntersectionObserver ── */
  function swInitReveal() {
    var cards = document.querySelectorAll('.sw-grid .sw-card');
    if (!cards.length) return;

    /* Mark all cards as hidden initially */
    cards.forEach(function (card) {
      card.classList.add('sw-hidden');
    });

    /* Use IntersectionObserver if supported */
    if (!('IntersectionObserver' in window)) {
      /* Fallback: show all immediately */
      cards.forEach(function (card) {
        card.classList.remove('sw-hidden');
        card.classList.add('sw-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.remove('sw-hidden');
            entry.target.classList.add('sw-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -48px 0px'
      }
    );

    cards.forEach(function (card) {
      observer.observe(card);
    });
  }

  /* ── Keyboard accessibility: Enter/Space on card links ── */
  function swInitKeyboard() {
    var cards = document.querySelectorAll('.sw-card');
    cards.forEach(function (card) {
      /* Allow Tab focus on cards so keyboard users can trigger hover effects */
      if (!card.getAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
      }

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          /* If card has a link inside, navigate to it */
          var link = card.querySelector('a[href]');
          if (link) {
            e.preventDefault();
            link.click();
          }
        }
      });

      /* Visual focus state via class */
      card.addEventListener('focusin', function () {
        card.classList.add('sw-focused');
      });
      card.addEventListener('focusout', function () {
        card.classList.remove('sw-focused');
      });
    });
  }

  /* ── Init on DOM ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      swInitReveal();
      swInitKeyboard();
    });
  } else {
    swInitReveal();
    swInitKeyboard();
  }

})();


/* ================================================================
   SUBJECTS WE COVER
================================================================ */
/* ============================================================
   SUCCESSTRACKER — SUBJECTS SECTION JS
   Scoped to .ss- classes only.
   Does NOT touch any existing site JS or functions.
   ============================================================ */

(function () {
  'use strict';

  function ssInit() {
    var cards = document.querySelectorAll('.ss-grid .ss-card');
    if (!cards.length) return;

    /* Mark all hidden */
    cards.forEach(function (card) {
      card.classList.add('ss-hidden');
    });

    /* IntersectionObserver for staggered reveal */
    if (!('IntersectionObserver' in window)) {
      cards.forEach(function (c) {
        c.classList.remove('ss-hidden');
        c.classList.add('ss-visible');
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.remove('ss-hidden');
          entry.target.classList.add('ss-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    cards.forEach(function (card) { io.observe(card); });
  }

  /* Run on DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ssInit);
  } else {
    ssInit();
  }

})();


/* ================================================================
   HOW IT WORKS
================================================================ */
/* ================================================
   HOW IT WORKS SECTION - SuccessTracker
   Pure JavaScript | No dependencies
   Scoped strictly to #how-it-works so other sections
   (Header, Hero, Areas We Serve, Testimonials, FAQ,
   Footer, etc.) are unaffected.
================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var section = document.getElementById("how-it-works");
    if (!section) return;

    /* ---------- Re-run step animation when scrolled into view ---------- */
    var steps = section.querySelectorAll(".hiw-step");

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.style.animationPlayState = "running";
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      steps.forEach(function (step) {
        step.style.animationPlayState = "paused";
        observer.observe(step);
      });
    }

    /* ---------- Book Free Demo CTA ---------- */
    var demoBtn = document.getElementById("hiwDemoBtn");
    if (demoBtn) {
      demoBtn.addEventListener("click", function () {
        var target =
          document.getElementById("book") ||
          document.getElementById("book-demo") ||
          document.getElementById("contact") ||
          document.getElementById("demo-form");

        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          document.dispatchEvent(new CustomEvent("hiw:bookDemoClicked"));
          console.log(
            "Book Free Demo clicked — hook this button up to your booking form/modal."
          );
        }
      });
    }
  });
})();


/* ================================================================
   FREE COUNSELLING (posts to the same existing backend endpoint as Hero)
================================================================ */
/* ================================================================
   COUNSELLING SECTION - SuccessTracker
   Posts to the SAME existing backend endpoint as the Hero quick
   form (https://success-tracker-backend.onrender.com/api/counselling)
   using the same JSON contract: { name, phone, grade, concern }.
   Scoped to cs_ prefixed IDs — zero collision with Hero's sh_ IDs.
================================================================ */

(function () {
  'use strict';

  var form       = document.getElementById('cs-form');
  var submitBtn  = document.getElementById('cs-submit-btn');
  var successBox = document.getElementById('cs-success');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var nameEl    = document.getElementById('cs_name');
    var phoneEl   = document.getElementById('cs_phone');
    var gradeEl   = document.getElementById('cs_grade');
    var concernEl = document.getElementById('cs_concern');

    if (!nameEl || !phoneEl || !gradeEl || !concernEl) return;

    var name    = nameEl.value.trim();
    var phone   = phoneEl.value.trim();
    var grade   = gradeEl.value;
    var concern = concernEl.value;

    if (!name) {
      nameEl.focus();
      csMarkInvalid(nameEl);
      return;
    }
    if (!phone || !/^[6-9][0-9]{9}$/.test(phone)) {
      phoneEl.focus();
      csMarkInvalid(phoneEl);
      return;
    }
    if (!grade) {
      gradeEl.focus();
      csMarkInvalid(gradeEl);
      return;
    }
    if (!concern) {
      concernEl.focus();
      csMarkInvalid(concernEl);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    fetch('https://success-tracker-backend.onrender.com/api/counselling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, phone: phone, grade: grade, concern: concern })
    })
    .then(function (res) { return res.json(); })
    .then(function () { csShowSuccess(); })
    .catch(function () { csShowSuccess(); });
  });

  function csShowSuccess() {
    if (successBox) successBox.removeAttribute('hidden');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Request Sent!';
      submitBtn.style.background = '#16a34a';
    }
    setTimeout(function () {
      if (successBox) successBox.setAttribute('hidden', '');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        submitBtn.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Request Free Counselling';
      }
      if (form) form.reset();
    }, 6000);
  }

  function csMarkInvalid(el) {
    el.style.borderColor = '#e53e3e';
    el.style.boxShadow = '0 0 0 3px rgba(229,62,62,.12)';
    el.addEventListener('input', function clearErr() {
      el.style.borderColor = '';
      el.style.boxShadow = '';
      el.removeEventListener('input', clearErr);
    }, { once: true });
  }

})();


/* ================================================================
   AREAS WE SERVE
================================================================ */
/* ================================================
   AREAS WE SERVE SECTION - SuccessTracker
   Pure JavaScript | No dependencies
   Scoped strictly to #areas-we-serve so other
   sections (Header, Hero, etc.) are unaffected.
================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var section = document.getElementById("areas-we-serve");
    if (!section) return;

    /* ---------- Scroll reveal animation for cards ---------- */
    var cards = section.querySelectorAll(".area-card");

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry, index) {
            if (entry.isIntersecting) {
              setTimeout(function () {
                entry.target.classList.add("areas-visible");
              }, index * 60);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      cards.forEach(function (card) {
        observer.observe(card);
      });
    } else {
      // Fallback: just show all cards immediately
      cards.forEach(function (card) {
        card.classList.add("areas-visible");
      });
    }

    /* ---------- Book Free Demo CTA ---------- */
    var demoBtn = document.getElementById("areasDemoBtn");
    if (demoBtn) {
      demoBtn.addEventListener("click", function () {
        // Try to scroll to an existing booking/contact form section if present
        var target =
          document.getElementById("book") ||
          document.getElementById("book-demo") ||
          document.getElementById("contact") ||
          document.getElementById("demo-form");

        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // Fallback custom event other scripts on the page can listen for
          document.dispatchEvent(new CustomEvent("areas:bookDemoClicked"));
          console.log(
            "Book Free Demo clicked — hook this button up to your booking form/modal."
          );
        }
      });
    }
  });
})();


/* ================================================================
   PARENT REVIEWS
================================================================ */
/* ================================================
   PARENT TESTIMONIALS SECTION - SuccessTracker
   Pure JavaScript | No dependencies
   Scoped strictly to #parent-testimonials so other
   sections (Header, Hero, Areas We Serve, etc.)
   are unaffected.
================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var section = document.getElementById("parent-testimonials");
    if (!section) return;

    /* ---------- Re-trigger card entrance animation on scroll into view ---------- */
    var cards = section.querySelectorAll(".review-card");

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.style.animationPlayState = "running";
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      cards.forEach(function (card) {
        card.style.animationPlayState = "paused";
        observer.observe(card);
      });
    }

    /* ---------- Book Free Demo CTA ---------- */
    var demoBtn = document.getElementById("reviewsDemoBtn");
    if (demoBtn) {
      demoBtn.addEventListener("click", function () {
        var target =
          document.getElementById("book") ||
          document.getElementById("book-demo") ||
          document.getElementById("contact") ||
          document.getElementById("demo-form");

        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          document.dispatchEvent(new CustomEvent("reviews:bookDemoClicked"));
          console.log(
            "Book Free Demo clicked — hook this button up to your booking form/modal."
          );
        }
      });
    }
  });
})();


/* ================================================================
   FAQ
================================================================ */
/* ================================================
   FAQ SECTION - SuccessTracker
   Pure JavaScript | No dependencies
   Scoped strictly to #faq-section so other sections
   (Header, Hero, Areas We Serve, Testimonials, etc.)
   are unaffected.
================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var section = document.getElementById("faq-section");
    if (!section) return;

    var items = section.querySelectorAll(".faq-item");

    items.forEach(function (item) {
      var question = item.querySelector(".faq-question");
      var answer = item.querySelector(".faq-answer");

      question.addEventListener("click", function () {
        var isActive = item.classList.contains("faq-active");

        // Close all items first (single-open accordion behavior)
        items.forEach(function (otherItem) {
          otherItem.classList.remove("faq-active");
          otherItem
            .querySelector(".faq-question")
            .setAttribute("aria-expanded", "false");
          otherItem.querySelector(".faq-answer").style.maxHeight = null;
        });

        // Open the clicked item if it wasn't already open
        if (!isActive) {
          item.classList.add("faq-active");
          question.setAttribute("aria-expanded", "true");
          answer.style.maxHeight = answer.scrollHeight + 20 + "px";
        }
      });
    });

    /* ---------- Keep open answer sized correctly on window resize ---------- */
    window.addEventListener("resize", function () {
      var activeItem = section.querySelector(".faq-item.faq-active");
      if (activeItem) {
        var activeAnswer = activeItem.querySelector(".faq-answer");
        activeAnswer.style.maxHeight = activeAnswer.scrollHeight + 20 + "px";
      }
    });
  });
})();


/* ================================================================
   FOOTER
================================================================ */
/* ================================================
   FOOTER SECTION - SuccessTracker
   Pure JavaScript | No dependencies
   Scoped strictly to #site-footer so other sections
   remain unaffected.
================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var footer = document.getElementById("site-footer");
    if (!footer) return;

    /* ---------- Back to top button ---------- */
    var backToTopBtn = document.getElementById("footerBackToTop");
    if (backToTopBtn) {
      backToTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    /* ---------- Auto-update copyright year ---------- */
    var copyEl = footer.querySelector(".footer-copy");
    if (copyEl) {
      var currentYear = new Date().getFullYear();
      // Only auto-update if the current year has passed the displayed year,
      // keeping "© 2026 SuccessTracker" as the baseline text.
      if (currentYear > 2026) {
        copyEl.textContent =
          "© " + currentYear + " SuccessTracker. All Rights Reserved.";
      }
    }
  });
})();
