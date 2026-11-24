/* v6 navigation (MGM blend). Vanilla JS, no dependencies.
   - Active page is set from the URL, so the mark is right even if the
     server-rendered aria-current ever drifts.
   - The menu toggle's label follows the mobile menu's real state.
   Hover and active styles are pure CSS (MGM cue: colour change only,
   no pill backgrounds). Content is fully usable without this file. */
(function () {
  "use strict";

  var nav = document.querySelector(".main-nav");
  var links = nav ? Array.prototype.slice.call(nav.querySelectorAll("a")) : [];

  /* Active page from the URL. On the home page no desktop link is active
     (the brand is the home link), which is correct. */
  var page = (location.pathname.split("/").filter(Boolean).pop() || "index.html").split(/[?#]/)[0];
  if (!/\.html$/.test(page)) page += ".html";
  links.forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (href === page) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  /* Menu toggle label follows the menu's real state, whichever way it
     was opened or closed (button, close button, Escape, link tap). */
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");
  function syncMenuLabel() {
    if (!menu || !toggle) return;
    var open = menu.classList.contains("open");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (menu && toggle && "MutationObserver" in window) {
    new MutationObserver(syncMenuLabel).observe(menu, {
      attributes: true,
      attributeFilter: ["class"]
    });
    syncMenuLabel();
  }
})();
