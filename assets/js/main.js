/* Site interactions. Vanilla JS, no dependencies. Content is visible without JS. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Footer year */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Header shadow on scroll */
  var header = document.querySelector(".site-header");
  var albumNav = document.querySelector(".album-nav");
  /* Gallery jump bar: collapse to one scrollable row once it sticks.
     Stuck is read live from the bar's own position — the old cached
     threshold raced font loading and sometimes never fired (v8 probe:
     same click, compact true once, false the next time). */
  var jumpUntil = 0; /* while an album jump is animating, never un-collapse */
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    var top = document.querySelector(".to-top");
    if (top) top.classList.toggle("show", window.scrollY > 1200);
    /* Gallery jump bar: once it sticks (desktop only), collapse to one
       scrollable row of pills — the full 35-pill grid is ~300px tall when
       pinned. The toggle expands it back to the grid. Stuck = the bar's
       top is pinned at the header's height (~59-66px). */
    if (albumNav) {
      var wide = window.matchMedia("(min-width: 861px)").matches;
      var stuck = albumNav.getBoundingClientRect().top <= 70;
      if (Date.now() < jumpUntil) {
        if (stuck) albumNav.classList.add("compact");
      } else {
        albumNav.classList.toggle("compact", wide && stuck);
      }
    }
  }
  /* Pill click: collapse the bar BEFORE the browser measures the anchor
     jump — otherwise the mid-scroll collapse shifts content up ~230px and
     the landing overshoots past the album heading. The native jump then
     runs against the already-collapsed layout. */
  if (albumNav) {
    albumNav.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a[href^='#']") : null;
      if (!a || !document.querySelector(a.getAttribute("href"))) return;
      albumNav.classList.add("compact");
      jumpUntil = Date.now() + 1500;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");
  var closeBtn = document.querySelector(".menu-close");
  var lastFocus = null;
  function openMenu() {
    lastFocus = document.activeElement;
    if (header) header.classList.add("menu-open");
    menu.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  }
  function closeMenu() {
    if (header) header.classList.remove("menu-open");
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (toggle && menu) {
    toggle.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) closeMenu();
    });
  }

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

  /* Reveals: observer plus a sweep, so a fast scroll cannot leave a section hidden. */
  var revealEls = document.querySelectorAll(".reveal");
  function revealSweep() {
    var vh = window.innerHeight || 800;
    revealEls.forEach(function (el) {
      if (el.classList.contains("in")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) el.classList.add("in");
    });
  }
  if (revealEls.length && !reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
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
    setTimeout(revealSweep, 2500);
    revealSweep();
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
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
    var start = null, dur = 1100;
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

  /* Album nav: on small screens show the first few pills, expand on tap. */
  var albumNav = document.querySelector(".album-nav");
  var albumToggle = document.querySelector(".album-nav-toggle");
  if (albumNav && albumToggle) {
    var albumCount = albumNav.querySelectorAll("a").length;
    function setAlbumToggle() {
      var open = albumNav.classList.contains("expanded");
      albumToggle.textContent = open ? "Show fewer albums" : "Show all " + albumCount + " albums";
      albumToggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    albumToggle.addEventListener("click", function () {
      albumNav.classList.toggle("expanded");
      setAlbumToggle();
    });
    setAlbumToggle();
  }

  /* Gallery lightbox */
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCap = lightbox.querySelector("figcaption");
    var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item button"));
    var current = 0;
    var lbLastFocus = null;
    function show(i) {
      current = (i + items.length) % items.length;
      var btn = items[current];
      lbImg.src = btn.getAttribute("data-full");
      lbImg.alt = btn.getAttribute("data-alt") || "";
      lbCap.textContent = btn.getAttribute("data-caption") || "";
    }
    function openLb(i) {
      lbLastFocus = document.activeElement;
      show(i);
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      lightbox.querySelector(".lightbox-close").focus();
    }
    function closeLb() {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lbLastFocus && lbLastFocus.focus) lbLastFocus.focus();
    }
    items.forEach(function (btn, i) {
      btn.addEventListener("click", function () { openLb(i); });
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
    });
  }

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
        if (err) err.textContent = bad ? "This field is needed before the enquiry can be composed." : "";
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
        note.textContent = "Your email app should now open with this enquiry addressed to the school. Nothing was sent from this page; press send in your email app to send it.";
        note.focus();
      }
    });
  }

  /* Tiles (v24): a club tile just highlights — no detail bar below the
     grid any more. A house tile opens the house modal instead. */
  document.querySelectorAll(".tile-grid").forEach(function (grid) {
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
    var hmLastFocus = null;
    function openHouse(name) {
      hmLastFocus = document.activeElement;
      hmName.textContent = name + " House";
      hmBand.className = "house-modal-band house-modal-band-" + name.toLowerCase();
      houseModal.classList.add("open");
      houseModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      houseModal.querySelector(".house-modal-close").focus();
    }
    function closeHouse() {
      houseModal.classList.remove("open");
      houseModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (hmLastFocus && hmLastFocus.focus) hmLastFocus.focus();
    }
    document.querySelectorAll(".house-tile").forEach(function (tile) {
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
    });
  }

  /* Viewer (v24): one modal for home photo cards and staff/leader cards.
     Full-size image, name/caption, one precise line below it. */
  var viewer = document.getElementById("viewer");
  if (viewer) {
    var vImg = viewer.querySelector("img");
    var vCap = document.getElementById("viewer-caption");
    var vDet = document.getElementById("viewer-detail");
    var vLastFocus = null;
    function openViewer(el) {
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
    function closeViewer() {
      viewer.classList.remove("open");
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
    });
  }

  /* Pillars slider (v22, phones only): arrows, dots and a counter. On
     desktop the nav is hidden and the cards stack, so this only matters
     where the slider layout is active. */
  var slider = document.querySelector(".pillars-slider");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".pillar"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".pillar-dot"));
    var countEl = document.getElementById("pillar-count");
    var prevBtn = document.getElementById("pillar-prev");
    var nextBtn = document.getElementById("pillar-next");
    var current = 0;
    function sync(i) {
      current = i;
      dots.forEach(function (d, j) { d.classList.toggle("is-active", j === i); });
      if (countEl) countEl.textContent = (i + 1) + " of " + slides.length;
    }
    function goTo(i) {
      var n = (i + slides.length) % slides.length;
      var target = slides[n];
      /* v24: centre the slide in the track — the track has 7% side padding
         and the active card is 86% wide, so centring shows both neighbours
         peeking by the same amount. */
      var left = target.getBoundingClientRect().left - slider.getBoundingClientRect().left + slider.scrollLeft - (slider.clientWidth - target.offsetWidth) / 2;
      slider.scrollTo({ left: left, behavior: reduceMotion ? "auto" : "smooth" });
      sync(n);
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
        var sRect = slider.getBoundingClientRect();
        var best = 0, bestDist = Infinity;
        slides.forEach(function (slide, i) {
          /* v24: the slide whose CENTRE is nearest the track's centre. */
          var d = Math.abs((slide.getBoundingClientRect().left + slide.offsetWidth / 2) - (sRect.left + sRect.width / 2));
          if (d < bestDist) { bestDist = d; best = i; }
        });
        sync(best);
        slideTicking = false;
      });
    }, { passive: true });
  }

  /* Back to top */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();
