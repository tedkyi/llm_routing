// Shared chrome behavior: prev/next arrow keys, table-of-contents popup, fullscreen toggle.
(function () {
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeToc();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var target = e.target;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

    if (e.key === "ArrowRight") {
      var next = document.querySelector('.nav-btn[data-dir="next"]:not(.disabled)');
      if (next) window.location.href = next.getAttribute("href");
    } else if (e.key === "ArrowLeft") {
      var prev = document.querySelector('.nav-btn[data-dir="prev"]:not(.disabled)');
      if (prev) window.location.href = prev.getAttribute("href");
    } else if (e.key === "f" || e.key === "F") {
      toggleFullscreen();
    }
  });

  var menuBtn = document.getElementById("menuBtn");
  var tocOverlay = document.getElementById("tocOverlay");
  var tocClose = document.getElementById("tocClose");

  function openToc() {
    if (!tocOverlay) return;
    tocOverlay.hidden = false;
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
  }

  function closeToc() {
    if (!tocOverlay || tocOverlay.hidden) return;
    tocOverlay.hidden = true;
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }

  if (menuBtn && tocOverlay) {
    menuBtn.addEventListener("click", function () {
      if (tocOverlay.hidden) openToc();
      else closeToc();
    });
    if (tocClose) tocClose.addEventListener("click", closeToc);
    tocOverlay.addEventListener("click", function (e) {
      if (e.target === tocOverlay) closeToc();
    });
  }

  var fullscreenBtn = document.getElementById("fullscreenBtn");

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen();
    }
  }

  function updateFullscreenIcon() {
    if (!fullscreenBtn) return;
    fullscreenBtn.textContent = document.fullscreenElement ? "✕" : "⛶";
    fullscreenBtn.setAttribute(
      "aria-label",
      document.fullscreenElement ? "Exit full screen" : "Enter full screen"
    );
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", updateFullscreenIcon);
  }
})();
