/* Site interactions. Vanilla JS, no dependencies. Content is visible without JS. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Focus trap: Tab cycles inside the open panel instead of wandering into
     the page behind it. Roots are in document order (toggle, then menu). */
  function trapTab(e, roots) {
    if (e.key !== "Tab") return;
    var els = [];
    roots.forEach(function (root) {
      if (!root) return;
      if (root.matches("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")) els.push(root);
      Array.prototype.slice.call(root.querySelectorAll(
        "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )).forEach(function (el) { els.push(el); });
    });
    if (!els.length) return;
    var first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* Footer year */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Header shadow on scroll */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    var top = document.querySelector(".to-top");
    if (top) top.classList.toggle("show", window.scrollY > 1200);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu: a full-width TOP drop-down panel (v37 B3-F, Jayant
     17:53 IST — replaces the v25 side drawer). The panel drops from
     top: 0 and covers the announcement bar + header entirely, so it IS
     the top area when open; its own top row carries the crest + school
     name + the X close control. Focus goes to the close button on open
     (the panel's first control); Esc, the X, the backdrop, or any link
     closes it, and focus returns to the hamburger. The focus trap
     covers the panel ONLY — the hamburger is covered by the panel while
     open, so trapping to it would hand keyboard users an invisible
     control (interaction-design: keyboard path first). */
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");
  var backdrop = document.getElementById("menu-backdrop");
  var closeBtn = menu ? menu.querySelector(".menu-close") : null;
  var lastFocus = null;
  if (menu) { menu.setAttribute("role", "dialog"); menu.setAttribute("aria-modal", "true"); menu.setAttribute("aria-label", "Site menu"); }
  function openMenu() {
    lastFocus = document.activeElement;
    menu.classList.add("open");
    if (backdrop) backdrop.classList.add("show");
    toggle.setAttribute("aria-expanded", "true");
    /* Scroll-lock on <html>, NOT <body>: overflow:hidden on <body> makes
       the body the scroll container, which un-sticks the sticky header —
       after scrolling, opening the drawer sent the header (and school
       name) to top ≈ -scrollY, i.e. off-screen (v31 W-A, measured
       390/768/834: header top -755px at scrollY 800). Locking <html>
       freezes background scroll. (Conflict 26: Hallmark floor 4
       overflow-x: clip does NOT lock scrolling — the verified html-lock
       wins and is kept unchanged for the panel.) No top measurement is
       needed any more: the panel is fixed at top: 0, so the v32
       getBoundingClientRect().bottom measurement is deleted. */
    document.documentElement.style.overflow = "hidden";
    /* Focus the close button two frames later, not synchronously: a
       synchronous focus() here is a no-op under reduced motion — the
       button still computes visibility: hidden in the same task that
       adds .open (probed 23 Nov: btnVis "hidden" at call time, panel
       "visible"), and Chrome ignores focus on a hidden element. Under
       normal motion the same call happened to work. One rAF is NOT
       enough either (probed: still "hidden" inside the first rAF
       callback — the inherited visibility flip lands in the frame's
       style pass, which runs after rAF callbacks). A nested second rAF
       runs after that style pass, so the button computes visible and
       the focus lands in both modes. The guard skips it if the panel
       was already closed again in the meantime. */
    var focusClose = function () {
      if (menu.classList.contains("open") && closeBtn) closeBtn.focus();
    };
    if ("requestAnimationFrame" in window) {
      requestAnimationFrame(function () { requestAnimationFrame(focusClose); });
    } else if (closeBtn) closeBtn.focus();
  }
  function closeMenu() {
    menu.classList.remove("open");
    if (backdrop) backdrop.classList.remove("show");
    toggle.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      if (menu.classList.contains("open")) closeMenu();
      else openMenu();
    });
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    if (backdrop) backdrop.addEventListener("click", closeMenu);
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) closeMenu();
      if (menu.classList.contains("open")) trapTab(e, [menu]);
    });
  }

  /* Auto-reveal: rows and cards that ship static in the HTML get the same
     entrance as everything else — staggered inside their own list, so a
     long list ripples instead of flashing in as one block. Runs before the
     stagger / reveal setup below, so the observer and the sweep pick them
     up like any other reveal. */
  var autoReveal = [
    ".dates-strip .date-item",
    ".meaning-grid .meaning",
    ".steps li",
    ".rule-list li",
    ".results-board .result-row",
    ".contact-lines li",
    ".news-list .news-item"
  ];
  autoReveal.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      if (el.classList.contains("reveal")) return;
      el.classList.add("reveal");
      el.style.setProperty("--d", Math.min(i * 55, 440) + "ms");
    });
  });

  /* Staggered entrances: children of [data-stagger] reveal one after
     another. Runs before the reveal setup below, so the observer and
     the sweep pick the children up like any other reveal. */
  document.querySelectorAll("[data-stagger]").forEach(function (grid) {
    var kids = grid.children;
    for (var i = 0; i < kids.length; i++) {
      kids[i].classList.add("reveal");
      kids[i].style.setProperty("--d", Math.min(i * 55, 440) + "ms");
    }
  });

  /* Reveals: observer plus sweeps, so a fast scroll cannot leave a section hidden. */
  var revealEls = document.querySelectorAll(".reveal");
  /* Strip helper: once a reveal has finished, drop the reveal classes so
     hover transforms on cards are not overridden by the reveal end-state.
     transitionend (below) is the primary trigger, but it never fires for
     elements that gain .in before first paint — the browser renders them
     straight in their final state, so there is no transition to end — and
     it never fires under reduced motion, where transitions are off. The
     timer covers both: delay + 750ms lands just after the 0.7s transition
     ends. Harmless if transitionend already stripped the classes. */
  function scheduleStrip(el) {
    var d = parseInt(el.style.getPropertyValue("--d") || "0", 10) || 0;
    setTimeout(function () {
      /* Unconditional: the sweep below can no longer re-add .in to a
         stripped element, but if it ever did, this still cleans it up. */
      el.classList.remove("reveal");
      el.classList.remove("in");
      el.style.removeProperty("--d");
    }, d + 750);
  }
  function revealSweep() {
    var vh = window.innerHeight || 800;
    revealEls.forEach(function (el) {
      if (!el.classList.contains("reveal")) return; /* stripped already = revealed */
      if (el.classList.contains("in")) return;
      var r = el.getBoundingClientRect();
      /* In view, or already scrolled past: a fast fling can carry an
         element through the viewport between IO callbacks, and once it
         sits above the viewport the in-view test never fires for it
         again. Revealing passed elements is the safety net — they were
         due to reveal on the way down, and they must be visible when
         the reader scrolls back or a capture reads the page. r.top < 0
         (not just r.bottom <= 0) keeps display:none elements out: a
         hidden element reports a zero rect at 0,0. */
      if ((r.top < vh * 0.94 && r.bottom > 0) || (r.top < 0 && r.bottom <= 0)) { el.classList.add("in"); scheduleStrip(el); }
    });
  }
  if (revealEls.length && !reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          scheduleStrip(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    var ticking = false;
    function onScrollReveal() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { revealSweep(); ticking = false; });
    }
    window.addEventListener("scroll", onScrollReveal, { passive: true });
    window.addEventListener("resize", onScrollReveal);
    window.addEventListener("load", revealSweep);
    /* Recurring timed sweep (W-VID5 P3 / task 153): the old single
       setTimeout(revealSweep, 2500) fired once, during the fling, and
       never again — 13/13 reveals on videos stayed hidden after a fast
       scroll-through. Re-run every 1000ms until no .reveal remains
       (elements lose .reveal when stripped after revealing, so the
       timer stops itself once the page is fully revealed). The sweep
       is idempotent — see the guards in revealSweep — so a tick can
       never double-fire a reveal. */
    var revealTimer = setInterval(function () {
      revealSweep();
      var pending = false;
      revealEls.forEach(function (el) { if (el.classList.contains("reveal")) pending = true; });
      if (!pending) clearInterval(revealTimer);
    }, 1000);
    /* A hidden tab throttles IO; sweep again the moment it is visible
       so nothing is left stranded by a scroll that happened while hidden. */
    document.addEventListener("visibilitychange", function () { if (!document.hidden) revealSweep(); });
    revealSweep();
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); scheduleStrip(el); });
  }

  /* Once a reveal finishes, drop the reveal classes so hover transforms
     on cards and photos are not overridden by the reveal end-state. */
  document.addEventListener("transitionend", function (e) {
    var el = e.target;
    if (el.classList && el.classList.contains("reveal") && el.classList.contains("in")) {
      el.classList.remove("reveal");
      el.classList.remove("in");
      el.style.removeProperty("--d");
    }
  });

  /* Counters. Final values are in the HTML. */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion || !("requestAnimationFrame" in window)) {
      el.textContent = target.toLocaleString("en-IN") + suffix;
      return;
    }
    var start = null, dur = 400;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-IN") + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* Stream switcher (Academics page) */
  var tabs = document.querySelectorAll(".switcher-tab");
  if (tabs.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.setAttribute("aria-selected", "false");
          t.tabIndex = -1;
        });
        tab.setAttribute("aria-selected", "true");
        tab.tabIndex = 0;
        document.querySelectorAll(".switcher-panel").forEach(function (panel) {
          panel.classList.toggle("active", panel.id === tab.getAttribute("aria-controls"));
        });
      });
      tab.addEventListener("keydown", function (e) {
        var list = Array.prototype.slice.call(tabs);
        var i = list.indexOf(tab);
        if (e.key === "ArrowRight") { var n = list[(i + 1) % list.length]; n.focus(); n.click(); }
        if (e.key === "ArrowLeft") { var p = list[(i - 1 + list.length) % list.length]; p.focus(); p.click(); }
      });
    });
  }

  /* Syllabus picker (Academics page, wsyl task 120): one native select
     drives the single "open syllabus" link. Native <select> keeps arrow
     keys, type-ahead and touch free — no custom key handling. The change
     swaps the link href + label to the chosen option's PDF; the action
     replays the site's panel-in (transform + opacity only) so the swap
     reads as a state change. No-JS is covered in markup (<noscript> list),
     not here; if this script fails to load, the link still opens the
     default (UKG) PDF. */
  var syllabusSelect = document.getElementById("syllabus-select");
  var syllabusOpen = document.getElementById("syllabus-open");
  var syllabusAction = document.querySelector(".syllabus-action");
  if (syllabusSelect && syllabusOpen) {
    syllabusSelect.addEventListener("change", function () {
      var opt = syllabusSelect.options[syllabusSelect.selectedIndex];
      if (!opt) return;
      syllabusOpen.href = opt.value;
      syllabusOpen.textContent = "Open " + opt.text + " syllabus (PDF)";
      if (syllabusAction) {
        syllabusAction.classList.remove("swap");
        void syllabusAction.offsetWidth;
        syllabusAction.classList.add("swap");
      }
    });
  }

  /* Gallery lightbox */
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    lightbox.setAttribute("aria-modal", "true");
    var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item button"));
    var current = 0;
    var lbLastFocus = null;
    function show(i) {
      current = (i + items.length) % items.length;
      var btn = items[current];
      lbImg.src = btn.getAttribute("data-full");
      lbImg.alt = btn.getAttribute("data-alt") || "";
      preloadLbNeighbours();
    }
    /* Neighbour preload (WGAL7-02): fetch the two adjacent full-res photos
       while the current one is on screen, so Next/Prev never shows a dark
       box on a slow connection. Runs on open and on every photo change. */
    function preloadLbNeighbours() {
      [current - 1, current + 1].forEach(function (i) {
        var n = (i + items.length) % items.length;
        var img = new Image();
        img.src = items[n].getAttribute("data-full");
      });
    }
    /* Background inerting (WGAL7-01): while the viewer is open the page
       behind it is inert, so a screen reader's virtual cursor cannot wander
       into the 263-photo page — the Tab trap alone does not stop browse
       mode. The viewer itself lives inside <main>, so main is NOT inerted
       whole: its other children are, plus the header, footer, and the
       body-level controls (announce bar, mobile menu, back-to-top). */
    var lbBackground = [
      document.querySelector(".announce"),
      header,
      document.querySelector(".site-footer"),
      document.getElementById("menu-backdrop"),
      document.getElementById("mobile-menu"),
      document.querySelector(".to-top")
    ];
    function setLbBackgroundInert(on) {
      lbBackground.forEach(function (el) {
        if (!el) return;
        if (on) el.setAttribute("inert", "");
        else el.removeAttribute("inert");
      });
      var mainEl = document.getElementById("main");
      if (!mainEl) return;
      Array.prototype.slice.call(mainEl.children).forEach(function (child) {
        if (child === lightbox) return;
        if (on) child.setAttribute("inert", "");
        else child.removeAttribute("inert");
      });
    }
    var lbTimer = null;
    function openLb(i) {
      clearTimeout(lbTimer);
      lightbox.classList.remove("closing");
      lbLastFocus = document.activeElement;
      show(i);
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      setLbBackgroundInert(true);
      lightbox.querySelector(".lightbox-close").focus();
    }
    /* Close fades out (CSS .closing, 180ms) instead of vanishing — the
       open animation has a matching exit. Reduced motion skips the wait
       and closes at once, so the overlay never lingers. */
    function closeLb() {
      if (lightbox.classList.contains("closing")) return;
      if (reduceMotion) { finishLbClose(); return; }
      lightbox.classList.add("closing");
      lbTimer = setTimeout(finishLbClose, 180);
    }
    function finishLbClose() {
      clearTimeout(lbTimer);
      lightbox.classList.remove("open", "closing");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      setLbBackgroundInert(false);
      if (lbLastFocus && lbLastFocus.focus) lbLastFocus.focus();
    }
    items.forEach(function (btn) {
      /* The tapped button opens its own photo: the index is resolved
         from the live DOM node at tap time, never captured at bind time,
         so the control that was tapped always opens its own content. */
      btn.addEventListener("click", function () { openLb(items.indexOf(btn)); });
    });
    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLb);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", function () { show(current - 1); });
    lightbox.querySelector(".lightbox-next").addEventListener("click", function () { show(current + 1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
      trapTab(e, [lightbox]);
    });
    /* Swipe: a horizontal drag moves to the next/previous photo. The
       prev/next buttons stay the primary control; vertical panning is
       left to the browser (see .lightbox figure touch-action). */
    var lbTouchX = null;
    lightbox.addEventListener("touchstart", function (e) {
      if (e.touches.length === 1) lbTouchX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      if (lbTouchX === null) return;
      var dx = e.changedTouches[0].clientX - lbTouchX;
      lbTouchX = null;
      if (Math.abs(dx) > 48) show(current + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* Gallery sliders (v31): on phones each event is a scroll-snap slider.
     Prev/next move one photo; the counter follows the scroll position.
     Keyboard: ArrowLeft/ArrowRight work from any photo button in the event
     (the event bubbles to the grid); the buttons themselves are native
     <button>s, so Tab reaches them. No autoplay, no auto-advance. */
  document.querySelectorAll(".event").forEach(function (section) {
    var grid = section.querySelector(".gallery-grid");
    var prev = section.querySelector(".event-prev");
    var next = section.querySelector(".event-next");
    var count = section.querySelector(".event-count");
    if (!grid || !prev || !next) return;
    var items = grid.querySelectorAll(".gallery-item");
    if (!items.length) return;
    function step() {
      var w = items[0].getBoundingClientRect().width;
      return w + 12; /* flex gap, var(--space-3) */
    }
    function update() {
      var i = Math.round(grid.scrollLeft / step());
      i = Math.max(0, Math.min(items.length - 1, i));
      if (count) count.textContent = (i + 1) + " / " + items.length;
      prev.disabled = i === 0;
      next.disabled = i === items.length - 1;
    }
    function move(dir) {
      grid.scrollBy({ left: dir * step(), behavior: reduceMotion ? "auto" : "smooth" });
    }
    prev.addEventListener("click", function () { move(-1); });
    next.addEventListener("click", function () { move(1); });
    grid.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
    grid.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
    });
    update();
  });

  /* Enquiry form: validate, then hand off to the visitor's email app. Nothing is sent from this page. */
  var form = document.getElementById("enquiry-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        var err = document.getElementById(field.getAttribute("aria-describedby"));
        var bad = !field.value.trim() || (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
        field.setAttribute("aria-invalid", bad ? "true" : "false");
        if (err) err.textContent = bad ? "Fill this in to continue." : "";
        if (bad) valid = false;
      });
      if (!valid) {
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }
      var data = new FormData(form);
      var subject = "Admission enquiry: " + (data.get("child-class") || "general");
      var body = [
        "Name: " + data.get("name"),
        "Phone: " + (data.get("phone") || "not given"),
        "Email: " + data.get("email"),
        "Class applying for: " + data.get("child-class"),
        "",
        (data.get("message") || "")
      ].join("\n");
      window.location.href =
        "mailto:dbsoodlabari@gmail.com?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      var note = document.getElementById("form-note");
      if (note) {
        note.textContent = "Your email app opens with the enquiry addressed to the school. Nothing sent until you press send.";
        note.focus();
      }
    });
  }

  /* Tiles (v24, W-M: the home club tiles are now the clubs slider):
     a club slide just highlights — no detail bar below the grid any
     more. The binding is scoped to #wm-clubs so the Life page's
     non-button .tile-grid list is untouched. */
  document.querySelectorAll("#wm-clubs").forEach(function (grid) {
    var tiles = Array.prototype.slice.call(grid.querySelectorAll("button[data-club]"));
    tiles.forEach(function (tile) {
      tile.addEventListener("click", function () {
        var wasPressed = tile.getAttribute("aria-pressed") === "true";
        tiles.forEach(function (t) { t.setAttribute("aria-pressed", "false"); });
        if (!wasPressed) tile.setAttribute("aria-pressed", "true");
      });
    });
  });

  /* House modal (v24): tap a house and it opens — colour band, name, one
     verified line, link onward. Esc, backdrop or the X closes it. */
  var houseModal = document.getElementById("house-modal");
  if (houseModal) {
    var hmBand = document.getElementById("house-modal-band");
    var hmName = document.getElementById("house-modal-name");
    houseModal.setAttribute("aria-modal", "true");
    var hmLastFocus = null;
    var hmTimer = null;
    function openHouse(name) {
      clearTimeout(hmTimer);
      houseModal.classList.remove("closing");
      hmLastFocus = document.activeElement;
      hmName.textContent = name + " House";
      hmBand.className = "house-modal-band house-modal-band-" + name.toLowerCase();
      houseModal.classList.add("open");
      houseModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      houseModal.querySelector(".house-modal-close").focus();
    }
    /* Same closing fade as the lightbox (CSS .closing, 180ms). */
    function closeHouse() {
      if (houseModal.classList.contains("closing")) return;
      if (reduceMotion) { finishHouseClose(); return; }
      houseModal.classList.add("closing");
      hmTimer = setTimeout(finishHouseClose, 180);
    }
    function finishHouseClose() {
      clearTimeout(hmTimer);
      houseModal.classList.remove("open", "closing");
      houseModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (hmLastFocus && hmLastFocus.focus) hmLastFocus.focus();
    }
    document.querySelectorAll(".house-tile, .wm-house-slide").forEach(function (tile) {
      tile.addEventListener("click", function () {
        document.querySelectorAll(".house-tile").forEach(function (t) { t.setAttribute("aria-pressed", "false"); });
        tile.setAttribute("aria-pressed", "true");
        openHouse(tile.getAttribute("data-house"));
      });
    });
    houseModal.querySelector(".house-modal-close").addEventListener("click", closeHouse);
    houseModal.addEventListener("click", function (e) { if (e.target === houseModal) closeHouse(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && houseModal.classList.contains("open")) closeHouse();
      if (houseModal.classList.contains("open")) trapTab(e, [houseModal]);
    });
  }

  /* Viewer (v24): one modal for home photo cards and staff/leader cards.
     Full-size image, name/caption, one precise line below it. */
  var viewer = document.getElementById("viewer");
  if (viewer) {
    var vImg = viewer.querySelector("img");
    var vCap = document.getElementById("viewer-caption");
    viewer.setAttribute("aria-modal", "true");
    var vDet = document.getElementById("viewer-detail");
    var vLastFocus = null;
    var vTimer = null;
    function openViewer(el) {
      clearTimeout(vTimer);
      viewer.classList.remove("closing");
      vLastFocus = document.activeElement;
      vImg.src = el.getAttribute("data-full");
      vImg.alt = el.getAttribute("data-caption") || "";
      vCap.textContent = el.getAttribute("data-caption") || "";
      vDet.textContent = el.getAttribute("data-detail") || "";
      vDet.style.display = vDet.textContent ? "" : "none";
      viewer.classList.add("open");
      viewer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      viewer.querySelector(".lightbox-close").focus();
    }
    /* Same closing fade as the lightbox (CSS .closing, 180ms). */
    function closeViewer() {
      if (viewer.classList.contains("closing")) return;
      if (reduceMotion) { finishViewerClose(); return; }
      viewer.classList.add("closing");
      vTimer = setTimeout(finishViewerClose, 180);
    }
    function finishViewerClose() {
      clearTimeout(vTimer);
      viewer.classList.remove("open", "closing");
      viewer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (vLastFocus && vLastFocus.focus) vLastFocus.focus();
    }
    document.querySelectorAll(".js-viewer").forEach(function (el) {
      el.addEventListener("click", function () { openViewer(el); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openViewer(el); }
      });
    });
    viewer.querySelector(".lightbox-close").addEventListener("click", closeViewer);
    viewer.addEventListener("click", function (e) { if (e.target === viewer) closeViewer(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && viewer.classList.contains("open")) closeViewer();
      if (viewer.classList.contains("open")) trapTab(e, [viewer]);
    });
  }

  /* Pillars slider (v22, phones only) + W-M infinite loop: arrows, dots
     and a counter, and the track now wraps seamlessly in both
     directions. The track carries clones of the last pillar before the
     first and of the first pillar after the last, so at Reason the
     left peek is Religion (a real card) instead of blank padding, and
     at Religion the right peek is Reason. When a swipe, arrow or dot
     lands on a clone, the track jumps silently to the matching real
     card (same visible card, different scroll position — no visual
     jump). Clones are built only while the flex slider layout is
     active (≤600px); at 601px+ the pillars stack and the clones are
     removed, so no phantom cards ever appear in the stacked list. */
  var slider = document.querySelector(".pillars-slider");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".pillar:not(.pillar-clone)"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".pillar-dot"));
    var countEl = document.getElementById("pillar-count");
    if (countEl) countEl.setAttribute("aria-live", "polite");
    var prevBtn = document.getElementById("pillar-prev");
    var nextBtn = document.getElementById("pillar-next");
    var current = 0;
    var jumping = false;
    var settleTimer = null;
    function sliderActive() { return window.getComputedStyle(slider).display === "flex"; }
    function cloneCount() { return slider.querySelectorAll(".pillar-clone").length; }
    function buildClones() {
      if (cloneCount()) return;
      var first = slides[0], last = slides[slides.length - 1];
      if (!first || !last) return;
      var pre = last.cloneNode(true), post = first.cloneNode(true);
      [pre, post].forEach(function (c) {
        c.classList.add("pillar-clone");
        /* Clones are never observed by the reveal system (it captured
           its list before this ran), so strip the reveal classes or a
           clone would sit at opacity 0 forever. They carry no controls
           and no focusables, so aria-hidden is the whole story. */
        c.classList.remove("reveal", "in");
        c.style.removeProperty("--d");
        c.setAttribute("aria-hidden", "true");
      });
      slider.insertBefore(pre, slider.firstChild);
      slider.appendChild(post);
    }
    function removeClones() {
      slider.querySelectorAll(".pillar-clone").forEach(function (c) { c.remove(); });
    }
    function allSlides() { return Array.prototype.slice.call(slider.querySelectorAll(".pillar")); }
    function realIndex(pos) { return (pos + slides.length - 1) % slides.length; }
    function sync(i) {
      current = i;
      dots.forEach(function (d, j) { d.classList.toggle("is-active", j === i); });
      if (countEl) countEl.textContent = (i + 1) + " of " + slides.length;
    }
    function scrollToPos(pos, behavior) {
      var list = allSlides();
      var target = list[pos];
      if (!target) return;
      var left = target.getBoundingClientRect().left - slider.getBoundingClientRect().left + slider.scrollLeft - (slider.clientWidth - target.offsetWidth) / 2;
      slider.scrollTo({ left: left, behavior: behavior });
    }
    function jumpToReal(i) {
      /* Silent jump: same visible card, real scroll position. */
      jumping = true;
      scrollToPos(i + 1, "auto");
      requestAnimationFrame(function () { jumping = false; });
    }
    function goTo(i) {
      var n = (i + slides.length) % slides.length;
      if (!sliderActive() || !cloneCount()) {
        /* Stacked layout (or clones not built yet): centre the real card. */
        var list = allSlides();
        var t = list[n];
        if (t) {
          var left = t.getBoundingClientRect().left - slider.getBoundingClientRect().left + slider.scrollLeft - (slider.clientWidth - t.offsetWidth) / 2;
          slider.scrollTo({ left: left, behavior: reduceMotion ? "auto" : "smooth" });
        }
        sync(n);
        return;
      }
      /* Step through the clone when wrapping, so the motion stays
         continuous: prev from 0 goes to clone-of-last (pos 0), next
         from last goes to clone-of-first (pos N+1); the settle handler
         then jumps silently to the matching real card. */
      var from = current, to = n;
      var via = null;
      if (from === 0 && to === slides.length - 1) via = 0;
      else if (from === slides.length - 1 && to === 0) via = slides.length + 1;
      sync(n);
      if (via !== null) scrollToPos(via, reduceMotion ? "auto" : "smooth");
      else scrollToPos(n + 1, reduceMotion ? "auto" : "smooth");
      if (reduceMotion) jumpToReal(n);
    }
    function settleCheck() {
      if (jumping || !sliderActive() || !cloneCount()) return;
      var list = allSlides();
      var sRect = slider.getBoundingClientRect();
      var best = 0, bestDist = Infinity;
      list.forEach(function (slide, i) {
        var d = Math.abs((slide.getBoundingClientRect().left + slide.offsetWidth / 2) - (sRect.left + sRect.width / 2));
        if (d < bestDist) { bestDist = d; best = i; }
      });
      var real = realIndex(best);
      sync(real);
      if (best === 0 || best === list.length - 1) jumpToReal(real);
    }
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { goTo(i); });
    });
    var slideTicking = false;
    slider.addEventListener("scroll", function () {
      if (slideTicking) return;
      slideTicking = true;
      requestAnimationFrame(function () {
        if (!jumping) {
          var list = allSlides();
          var sRect = slider.getBoundingClientRect();
          var best = 0, bestDist = Infinity;
          list.forEach(function (slide, i) {
            /* v24: the slide whose CENTRE is nearest the track's centre. */
            var d = Math.abs((slide.getBoundingClientRect().left + slide.offsetWidth / 2) - (sRect.left + sRect.width / 2));
            if (d < bestDist) { bestDist = d; best = i; }
          });
          sync(realIndex(best));
        }
        slideTicking = false;
        clearTimeout(settleTimer);
        settleTimer = setTimeout(settleCheck, 140);
      });
    }, { passive: true });
    slider.addEventListener("scrollend", settleCheck);
    /* Build/remove clones as the layout crosses the 600px boundary. */
    var resizeTimer = null;
    function refreshLoop() {
      if (sliderActive()) {
        var had = cloneCount() > 0;
        buildClones();
        if (!had) jumpToReal(current);
      } else {
        removeClones();
      }
    }
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refreshLoop, 200);
    });
    refreshLoop();
  }

  /* Back to top */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ================================================================
     W-M home sliders (wave 6): three different treatments, one shared
     interaction contract — drag/swipe interrupts auto-motion, arrows +
     dots + keyboard always work, every transition 150–400ms on one
     easing curve, transform + opacity only, reduced motion rests.
     - Clubs: infinite rail, JS rAF engine, one card per ~3.2s.
     - Houses: crossfading stage, 5s timer, pause on hover/focus.
     - Values: a swipeable rail (W-H3 rebuild), transform-only, clones
       at both ends so neighbours peek; no auto-motion (values are read).
     - Life strip: its settled 32s CSS animation, frozen + resumed
       around a drag (no hover pause — Jayant's words, conflict 17).
     A drag that moves more than 6px suppresses the click that follows
     it (capture phase, on the container), so dragging never opens a
     modal, a viewer, or toggles a highlight by accident.
     ================================================================ */

  /* Shared: suppress the click after a drag. Returns a setter the drag
     code calls with true when a drag happened. */
  function armClickSuppress(container) {
    var suppress = false;
    container.addEventListener("click", function (e) {
      if (!suppress) return;
      suppress = false;
      e.preventDefault();
      e.stopPropagation();
    }, true);
    return function (v) { suppress = v; };
  }

  /* Shared: pointer-drag helper. onMove(dx) while dragging, onEnd(dx,
     moved) on release. Move/up are tracked on window (pointer-id
     checked), NOT via setPointerCapture: capture retargets the
     pointerup to the container, so the click after a plain press
     fires on the container instead of the button/figure under the
     pointer — and slide toggles, the house modal and the Life viewer
     never open. Window listeners track the drag just as well (even
     off-element) and leave plain clicks intact. touch-action: pan-y
     (CSS) keeps vertical page scroll native. */
  function armDrag(container, onStart, onMove, onEnd) {
    var startX = 0, moved = 0, activeId = null;
    function onMoveWin(e) {
      if (e.pointerId !== activeId) return;
      moved = e.clientX - startX;
      onMove(moved);
    }
    function finish(e) {
      if (e.pointerId !== activeId) return;
      activeId = null;
      window.removeEventListener("pointermove", onMoveWin);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      onEnd(moved);
    }
    container.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      activeId = e.pointerId;
      moved = 0;
      startX = e.clientX;
      window.addEventListener("pointermove", onMoveWin);
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
      onStart();
    });
  }

  /* ---------- ITEM 2: clubs rail ---------- */
  (function clubsRail() {
    var viewport = document.getElementById("wm-clubs-viewport");
    var track = document.getElementById("wm-clubs-track");
    if (!viewport || !track) return;
    var realSlides = Array.prototype.slice.call(track.querySelectorAll(".wm-club-slide:not(.wm-club-slide--clone)"));
    var N = realSlides.length;
    /* Second identical half, so the loop has no seam. Clones are
       inert: no toggle, no tab stop, hidden from assistive tech. */
    realSlides.forEach(function (s) {
      var c = s.cloneNode(true);
      c.classList.add("wm-club-slide--clone");
      c.removeAttribute("data-club");
      c.setAttribute("aria-hidden", "true");
      c.tabIndex = -1;
      c.setAttribute("aria-pressed", "false");
      track.appendChild(c);
    });
    var suppressClick = armClickSuppress(viewport);
    /* Native image dragging would fight pointer dragging (ghost image);
       the slides are buttons, not drag sources. */
    track.querySelectorAll("img").forEach(function (im) { im.draggable = false; });
    if (reduceMotion) return; /* static grid (CSS); no engine, no drag. */
    var offset = 0, dragging = false, paused = false, raf = null, lastTs = null;
    var HALF = 64; /* seconds for one half-loop (18 cards). */
    var half = 0;
    function measureHalf() { half = track.scrollWidth / 2; }
    function halfWidth() { return half || track.scrollWidth / 2; }
    function step() {
      var first = track.querySelector(".wm-club-slide");
      if (!first) return 288;
      var cs = window.getComputedStyle(first);
      return first.getBoundingClientRect().width + (parseFloat(cs.marginRight) || 0);
    }
    function wrap(o) {
      var h = halfWidth();
      if (!h) return 0;
      o = o % h;
      if (o > 0) o -= h;
      return o;
    }
    function render() { track.style.transform = "translateX(" + offset + "px)"; }
    function tick(ts) {
      raf = null;
      if (lastTs === null) lastTs = ts;
      var dt = Math.min((ts - lastTs) / 1000, 0.1);
      lastTs = ts;
      if (!dragging && !paused && !document.hidden) {
        offset = wrap(offset - (halfWidth() / HALF) * dt);
        render();
      }
      raf = requestAnimationFrame(tick);
    }
    /* W-HOME15 task 278: the arrow buttons + counter are removed (brief)
       — nudge() stays: it is the viewport ArrowLeft/Right keyboard path. */
    function nudge(dir) {
      offset = wrap(offset + dir * step());
      render();
    }
    /* Focus pauses the rail — but only keyboard focus. A mouse/touch
       drag focuses the slide under the pointer on the way in; if that
       counted as "focus", the rail would stay frozen after every drag
       (probed: it never resumed). pointerdown marks the focus as
       pointer-made, so the following focusin is ignored and the rail
       resumes after the drag. Tab focus still pauses it. */
    var pointerFocus = false;
    viewport.addEventListener("pointerdown", function () { pointerFocus = true; paused = false; });
    viewport.addEventListener("focusin", function () { if (!pointerFocus) paused = true; pointerFocus = false; });
    viewport.addEventListener("focusout", function () { paused = false; });
    viewport.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); nudge(1); }
      if (e.key === "ArrowRight") { e.preventDefault(); nudge(-1); }
    });
    var dragStart = 0;
    armDrag(viewport,
      function () { dragging = true; dragStart = offset; viewport.classList.add("wm-grabbing"); },
      function (dx) { offset = dragStart + dx; render(); },
      function (dx) {
        dragging = false;
        viewport.classList.remove("wm-grabbing");
        offset = wrap(offset);
        render();
        suppressClick(Math.abs(dx) > 6);
      });
    measureHalf();
    window.addEventListener("resize", function () { measureHalf(); });
    raf = requestAnimationFrame(tick);
  })();

  /* ---------- ITEM 3: houses stage (286 chrome removal, wave 11) ----------
     One large photo at a time, fading into the next every 5s; the house
     name sits on the photo with its house-colour band across the top
     (the band is house identity = content, the same --house-* tokens the
     old tiles used). Motion: opacity only, 0.4s ease-out
     (12-principles budget). No-JS fallback: all four photos visible
     in a 2-column grid.
     286: the arrows/dots/counter markup is DELETED from index.html.
     Mobile (<768px) keeps this stage, chrome-free: the 5s timer still
     cycles the houses, and swipe/drag-threshold + ArrowLeft/Right on
     the focusable stage still change them (the reachability path once
     the buttons are gone). Tablet/desktop (≥768px, gridMq — the same
     breakpoint as the wm-home.css grid) is the static 2-column grid —
     the layout the no-JS fallback already uses: all four houses
     visible at once, the timer stopped, no motion. Tap still opens
     the house modal (openHouse, untouched); in grid mode all four
     slides are Tab-reachable buttons. Reduced motion: unchanged —
     no auto-advance, manual change only, grid ≥768px. */
  (function housesStage() {
    var stage = document.getElementById("wm-houses-stage");
    if (!stage) return;
    var slides = Array.prototype.slice.call(stage.querySelectorAll(".wm-house-slide"));
    var current = 0, timer = null;
    var DELAY = 5000;
    /* 286: grid breakpoint — one source of truth with wm-home.css
       (min-width: 768px). */
    var gridMq = window.matchMedia("(min-width: 768px)");
    function gridMode() { return gridMq.matches; }
    stage.querySelectorAll("img").forEach(function (im) { im.draggable = false; });
    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, j) { s.classList.toggle("is-active", j === current); });
    }
    function start() {
      if (reduceMotion || gridMode() || timer) return;
      timer = setInterval(function () { show(current + 1); }, DELAY);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }
    function applyMode() { if (gridMode()) stop(); else start(); }
    if (gridMq.addEventListener) gridMq.addEventListener("change", applyMode);
    else if (gridMq.addListener) gridMq.addListener(applyMode);
    /* Keyboard: ArrowLeft/Right change the house on a phone. In grid
       mode the handler returns without preventDefault, so the arrows
       scroll the page; every house is Tab-reachable anyway. */
    stage.addEventListener("keydown", function (e) {
      if (gridMode()) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); restart(); }
      if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); restart(); }
    });
    /* Hover / focus pauses the timer (this is a new showcase slider,
       not the Life strip — Jayant's no-pause order covers the strip).
       Keyboard focus pauses; pointer focus does not (same reason as
       the clubs rail: a mouse click must not freeze the timer). */
    var pointerFocus = false;
    stage.addEventListener("pointerdown", function () { pointerFocus = true; });
    stage.addEventListener("focusin", function () { if (pointerFocus) { pointerFocus = false; return; } stop(); });
    stage.addEventListener("focusout", function () { start(); });
    stage.addEventListener("mouseenter", stop);
    stage.addEventListener("mouseleave", start);
    var suppressClick = armClickSuppress(stage);
    armDrag(stage,
      function () {},
      function () {},
      function (dx) {
        if (gridMode()) return;
        if (Math.abs(dx) > 48) { show(current + (dx < 0 ? 1 : -1)); restart(); }
        suppressClick(Math.abs(dx) > 6);
      });
    show(0);
    start();
  })();

  /* ---------- ITEM 4: values slider (W-H3 rebuild, wave 10; 282
     chrome removal, wave 11) ----------
     A REAL swipeable rail on the Life-strip pattern (lifeStripDrag) +
     the clubs rail's clone trick: the track holds the 7 real slides
     plus one clone at each end, so a neighbour always peeks at both
     edges — at rest and mid-swipe. The card follows the pointer while
     dragging (transform only, no transition), and releasing settles
     with one 0.32s var(--ease-out) move (12-principles: 150–400ms,
     one easing curve, transform + opacity only). Wrapping animates
     onto the clone, then snaps to the matching real slide with no
     transition — same offset on screen, so no visible jump.
     Track positions: 0 = last clone, 1..7 = real slides, 8 = first
     clone. Reduced motion: no track, no clones, no transform — the
     stacked opacity pager stands (its transition is removed by the
     reduced-motion CSS), and keyboard/drag-threshold still work.
     Copy, icons and order are untouched.
     282: the arrows/dots/counter markup is DELETED from index.html
     (no dead buttons in the DOM, no tab stops to nowhere, no "N of
     7" state to keep in sync). Mobile (<768px) keeps this rail,
     chrome-free: swipe + ArrowLeft/Right on the focusable stage.
     Tablet/desktop (≥768px, gridMq — the same breakpoint as the
     wm-home.css grid) is a static grid: the animated class comes
     off, the track transform is cleared, updateChrome exposes all
     seven (aria-hidden false) and goTo/keyboard/drag all return
     early — keyboard users need no paging because every card is
     already visible, and the arrows are left alone so they scroll
     the page (interaction-design: keyboard path first; the rail
     stays focusable without arrows or dots). */
  (function valuesPager() {
    var stage = document.getElementById("wm-values-stage");
    var track = document.getElementById("wm-values-track");
    if (!stage || !track) return;
    var slides = Array.prototype.slice.call(track.querySelectorAll(".wm-value-slide"));
    var current = 0;
    var N = slides.length;
    /* 282: grid breakpoint — one source of truth with wm-home.css
       (min-width: 768px). */
    var gridMq = window.matchMedia("(min-width: 768px)");
    function gridMode() { return gridMq.matches; }
    stage.querySelectorAll("img").forEach(function (im) { im.draggable = false; });
    function updateChrome() {
      if (gridMode()) {
        /* Every card visible: expose all seven, no paging state. */
        slides.forEach(function (s) {
          s.classList.add("is-active");
          s.setAttribute("aria-hidden", "false");
        });
        return;
      }
      slides.forEach(function (s, j) {
        s.classList.toggle("is-active", j === current);
        /* Off-screen slides are still in the layout (translated
           away), so hide them from assistive tech; the active one
           stays exposed. In the stacked fade path visibility:hidden
           does this already — aria-hidden is harmless there. */
        s.setAttribute("aria-hidden", j === current ? "false" : "true");
      });
    }
    function show(i) {
      current = ((i % N) + N) % N;
      updateChrome();
    }
    /* Animated rail state (built once, only while motion is allowed
       and the viewport is a phone). */
    var railOn = false, clonesBuilt = false;
    var GAP = 12; /* must match the slide margin-right in wm-home.css */
    var PEEK_BP = 601; /* must match the min-width breakpoint in wm-home.css */
    var cardW = 0, step = 0, pos = 1;
    var snapTimer = null, snapPending = false;
    function peek() { return window.innerWidth >= PEEK_BP ? 48 : 28; }
    function offsetFor(p) { return peek() - p * step; }
    function render(animate) {
      if (!railOn) return;
      if (!animate) stage.classList.add("wm-dragging");
      track.style.transform = "translateX(" + offsetFor(pos) + "px)";
      if (!animate) { void track.offsetWidth; stage.classList.remove("wm-dragging"); }
    }
    function clearSnap() {
      if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }
      snapPending = false;
    }
    function snapToReal() {
      /* The track is showing a clone; jump to the matching real
         slide with no transition — same offset on screen. */
      clearSnap();
      pos = current + 1;
      render(false);
    }
    function armSnap() {
      snapPending = true;
      snapTimer = setTimeout(snapToReal, 360); /* 0.32s move + margin */
    }
    track.addEventListener("transitionend", function (e) {
      if (e.propertyName === "transform" && snapPending) snapToReal();
    });
    function measure() {
      if (!railOn) return;
      var stageW = stage.getBoundingClientRect().width;
      cardW = Math.max(200, Math.floor(stageW - 2 * peek()));
      stage.style.setProperty("--values-card-w", cardW + "px");
      step = cardW + GAP;
      render(false);
    }
    /* i is the UNWRAPPED target: arrows/drag pass current +/- 1
       (N or -1 at the ends = wrap). A wrap animates onto the clone,
       then snaps; a plain step moves one card in the one 0.32s move.
       (282: the dot callers are gone; arrows + drag are the only
       callers now. In grid mode or reduced motion this is a plain
       show — no rail, no animation.) */
    function goTo(i, animate) {
      if (gridMode()) return;
      if (reduceMotion || !railOn) { show(i); return; }
      var target = ((i % N) + N) % N;
      var wrapped = (i !== target);
      current = target;
      updateChrome();
      if (!animate) { pos = current + 1; render(false); return; }
      clearSnap();
      if (wrapped && i > current) { pos = N + 1; render(true); armSnap(); }
      else if (wrapped) { pos = 0; render(true); armSnap(); }
      else { pos = current + 1; render(true); }
    }
    /* Clones are inert: no tab stop, hidden from assistive tech
       (the clubs pattern). Built once; the grid CSS hides them at
       ≥768px and applyMode re-shows the rail from them below it. */
    function makeClone(src) {
      var c = src.cloneNode(true);
      c.classList.add("wm-value-slide--clone");
      c.classList.remove("is-active");
      c.setAttribute("aria-hidden", "true");
      return c;
    }
    function buildClones() {
      if (clonesBuilt) return;
      clonesBuilt = true;
      var lastClone = makeClone(slides[N - 1]);
      var firstClone = makeClone(slides[0]);
      track.insertBefore(lastClone, slides[0]);
      track.appendChild(firstClone);
    }
    function applyMode() {
      if (gridMode() || reduceMotion) {
        railOn = false;
        stage.classList.remove("wm-values--animated", "wm-dragging", "wm-grabbing");
        stage.style.removeProperty("--values-card-w");
        track.style.transform = "";
        updateChrome();
        return;
      }
      railOn = true;
      buildClones();
      stage.classList.add("wm-values--animated");
      measure();
      updateChrome();
    }
    if (gridMq.addEventListener) gridMq.addEventListener("change", applyMode);
    else if (gridMq.addListener) gridMq.addListener(applyMode);
    /* Keyboard: the stage stays tabindex="0" — ArrowLeft/Right page
       the rail on a phone (and the stacked pager under reduced
       motion). In grid mode the handler returns without
       preventDefault, so the arrows scroll the page instead. */
    stage.addEventListener("keydown", function (e) {
      if (gridMode()) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current - 1, true); }
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(current + 1, true); }
    });
    var dragStartX = 0;
    armDrag(stage,
      function () {
        if (!railOn) return;
        /* Freeze the track exactly where it is (Life-strip pattern:
           read the computed transform first, so a grab mid-settle
           never jumps); finish a pending clone snap first so the
           drag starts from a real slide. */
        if (snapPending) snapToReal();
        var m = new DOMMatrixReadOnly(window.getComputedStyle(track).transform);
        dragStartX = m.e;
        stage.classList.add("wm-dragging", "wm-grabbing");
      },
      function (dx) {
        if (!railOn) return;
        track.style.transform = "translateX(" + (dragStartX + dx) + "px)";
      },
      function (dx) {
        if (gridMode()) return;
        stage.classList.remove("wm-dragging", "wm-grabbing");
        if (reduceMotion || !railOn) {
          /* Stacked pager (reduced motion): a 48px drag pages. */
          if (Math.abs(dx) > 48) show(current + (dx < 0 ? 1 : -1));
          return;
        }
        if (Math.abs(dx) > 48) goTo(current + (dx < 0 ? 1 : -1), true);
        else render(true); /* snap back to the current card */
      });
    window.addEventListener("resize", measure);
    applyMode();
    show(0);
  })();

  /* ---------- ITEM 7: Life at Bosco strip — drag interrupts the
     32s CSS auto-scroll, then it resumes from the dragged spot. ----------
     Freeze: read the computed transform, pin it inline, then switch the
     animation off (inline transform set FIRST, so nothing jumps).
     Resume: wrap the offset into one half-loop and restart the
     animation with a negative delay equal to the dragged position, so
     the strip continues exactly where the drag left it. Focus-within
     already pauses it (b3d patch, CSS); hover does NOT pause it. */
  (function lifeStripDrag() {
    var strip = document.querySelector(".photo-row.photo-strip");
    var track = document.querySelector(".photo-track");
    var prevBtn = document.getElementById("wm-life-prev");
    var nextBtn = document.getElementById("wm-life-next");
    var countEl = document.getElementById("wm-life-count");
    var lastCount = "";
    if (!strip || !track || reduceMotion) return;
    track.querySelectorAll("img").forEach(function (im) { im.draggable = false; });
    var DUR = 32; /* seconds; must match the life-scroll keyframes. */
    var suppressClick = armClickSuppress(strip);
    var startOffset = 0, dragging = false;
    function halfWidth() { return track.scrollWidth / 2; }
    function currentX() {
      var m = new DOMMatrixReadOnly(window.getComputedStyle(track).transform);
      return m.e;
    }
    function wrap(o) {
      var h = halfWidth();
      if (!h) return 0;
      o = o % h;
      if (o > 0) o -= h;
      return o;
    }
    function cardStep() {
      var card = track.querySelector(".photo-card");
      if (!card) return 356;
      var cs = window.getComputedStyle(card);
      return card.getBoundingClientRect().width + (parseFloat(cs.marginRight) || 0);
    }
    function showCount(x) {
      if (!countEl) return;
      var N = 3; /* real cards; the second half is clones. */
      var i = Math.floor((-wrap(x) / cardStep()) % N);
      if (i < 0) i += N;
      var t = (i + 1) + " of " + N;
      if (t !== lastCount) { lastCount = t; countEl.textContent = t; }
    }
    function nudge(dir) {
      /* Keyboard nudge: freeze, shift one card, resume. */
      var x = wrap(currentX() + dir * cardStep());
      track.style.transform = "translateX(" + x + "px)";
      track.classList.add("wm-dragging");
      resume(x);
    }
    function resume(x) {
      var h = halfWidth();
      var frac = h ? (-wrap(x) / h) : 0;
      track.style.animationDelay = (-frac * DUR) + "s";
      track.style.transform = "";
      track.classList.remove("wm-dragging");
      showCount(x);
    }
    strip.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); nudge(1); }
      if (e.key === "ArrowRight") { e.preventDefault(); nudge(-1); }
    });
    if (prevBtn) prevBtn.addEventListener("click", function () { nudge(1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { nudge(-1); });
    /* WR3-O1: a focused card froze wherever the 32s scroll happened
       to be — a card could sit half off-screen left (probed x = -109
       @390) because focus scrolling cannot move a transformed track.
       On focus, shift the track by the smallest amount that brings
       the focused card fully into view (left edge first, else right);
       a card already fully visible does not move. Focus leaving the
       strip resumes the scroll from the shifted offset. Keyboard focus
       still pauses the strip (CSS :focus-within); hover never does. */
    strip.addEventListener("focusin", function (e) {
      var card = e.target && e.target.closest ? e.target.closest(".photo-card") : null;
      if (!card || !track.contains(card)) return;
      var sr = strip.getBoundingClientRect();
      var cr = card.getBoundingClientRect();
      var shift = 0;
      if (cr.left < sr.left) shift = sr.left - cr.left;
      else if (cr.right > sr.right) shift = sr.right - cr.right;
      if (!shift) return;
      track.style.transform = "translateX(" + (currentX() + shift) + "px)";
      track.classList.add("wm-dragging");
    });
    strip.addEventListener("focusout", function (e) {
      if (e.relatedTarget && strip.contains(e.relatedTarget)) return;
      resume(currentX());
    });
    armDrag(strip,
      function () {
        dragging = true;
        startOffset = currentX();
        track.style.transform = "translateX(" + startOffset + "px)";
        track.classList.add("wm-dragging");
        strip.classList.add("wm-grabbing");
      },
      function (dx) {
        track.style.transform = "translateX(" + (startOffset + dx) + "px)";
      },
      function (dx) {
        dragging = false;
        strip.classList.remove("wm-grabbing");
        resume(startOffset + dx);
        /* The pointer left focus on the card under it, and the settled
           :focus-within rule would keep the strip paused on that focus
           forever after a mouse drag (probed: it never resumed). A
           pointer drag is not keyboard focus, so release it and let
           the strip resume; keyboard focus still pauses it. */
        var ae = document.activeElement;
        if (ae && strip.contains(ae)) ae.blur();
        suppressClick(Math.abs(dx) > 6);
      });
  })();

  /* ---------- W-AB3 (task 115): About awards strip — drag + arrows
     + keys interrupt the 36s CSS auto-scroll, then it resumes from
     the dragged/nudged spot. Same proven pattern as lifeStripDrag
     above: freeze by reading the computed transform and pinning it
     inline (no jump), resume by wrapping the offset into one
     half-loop and restarting the animation with a negative delay
     equal to the dragged position. Arrow buttons nudge one card;
     ArrowLeft/ArrowRight on the focused strip do the same. Focus-
     within pauses it (CSS); hover does NOT pause it. Reduced
     motion: static grid, no wiring here, buttons hidden by CSS.
     No click target lives inside the slides, so no click-suppress
     is needed — only the drag-end blur, so a pointer drag cannot
     leave focus on the slider and hold the :focus-within pause
     forever after the mouse is gone. ---------- */
  (function awardsStripDrag() {
    var slider = document.querySelector(".awards-slider");
    var track = document.querySelector(".awards-track");
    var prevBtn = document.querySelector(".awards-prev");
    var nextBtn = document.querySelector(".awards-next");
    if (!slider || !track || reduceMotion) return;
    track.querySelectorAll("img").forEach(function (im) { im.draggable = false; });
    var DUR = 36; /* seconds; must match the awards-scroll keyframes. */
    var startOffset = 0;
    function halfWidth() { return track.scrollWidth / 2; }
    function currentX() {
      var m = new DOMMatrixReadOnly(window.getComputedStyle(track).transform);
      return m.e;
    }
    function wrap(o) {
      var h = halfWidth();
      if (!h) return 0;
      o = o % h;
      if (o > 0) o -= h;
      return o;
    }
    function cardStep() {
      var card = track.querySelector(".award-slide");
      if (!card) return 356;
      var cs = window.getComputedStyle(card);
      return card.getBoundingClientRect().width + (parseFloat(cs.marginRight) || 0);
    }
    function nudge(dir) {
      /* Freeze, shift one card, resume from the new spot. */
      var x = wrap(currentX() + dir * cardStep());
      track.style.transform = "translateX(" + x + "px)";
      track.classList.add("wm-dragging");
      resume(x);
    }
    function resume(x) {
      var h = halfWidth();
      var frac = h ? (-wrap(x) / h) : 0;
      track.style.animationDelay = (-frac * DUR) + "s";
      track.style.transform = "";
      track.classList.remove("wm-dragging");
    }
    slider.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); nudge(1); }
      if (e.key === "ArrowRight") { e.preventDefault(); nudge(-1); }
    });
    if (prevBtn) prevBtn.addEventListener("click", function () { nudge(1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { nudge(-1); });
    armDrag(slider,
      function () {
        startOffset = currentX();
        track.style.transform = "translateX(" + startOffset + "px)";
        track.classList.add("wm-dragging");
        slider.classList.add("wm-grabbing");
      },
      function (dx) {
        track.style.transform = "translateX(" + (startOffset + dx) + "px)";
      },
      function (dx) {
        slider.classList.remove("wm-grabbing");
        resume(startOffset + dx);
        if (document.activeElement === slider) slider.blur();
      });
  })();
})();
