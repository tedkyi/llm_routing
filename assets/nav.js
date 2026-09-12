// Shared chrome behavior: prev/next + TOC navigate via fetch-and-swap (not a
// full page load) so browser state that a navigation would otherwise reset
// -- most importantly Fullscreen mode -- survives moving between slides.
(function () {
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function closeToc() {
    var overlay = $("#tocOverlay");
    var menuBtn = $("#menuBtn");
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }

  function openToc() {
    var overlay = $("#tocOverlay");
    var menuBtn = $("#menuBtn");
    if (!overlay) return;
    overlay.hidden = false;
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
  }

  function updateFullscreenIcon() {
    var btn = $("#fullscreenBtn");
    if (!btn) return;
    btn.textContent = document.fullscreenElement ? "✕" : "⛶";
    btn.setAttribute(
      "aria-label",
      document.fullscreenElement ? "Exit full screen" : "Enter full screen"
    );
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen();
    }
  }

  function bindChrome() {
    var menuBtn = $("#menuBtn");
    var tocOverlay = $("#tocOverlay");
    var tocClose = $("#tocClose");
    var fullscreenBtn = $("#fullscreenBtn");

    if (menuBtn && tocOverlay) {
      menuBtn.addEventListener("click", function () {
        if (tocOverlay.hidden) openToc();
        else closeToc();
      });
    }
    if (tocClose) tocClose.addEventListener("click", closeToc);
    if (tocOverlay) {
      tocOverlay.addEventListener("click", function (e) {
        if (e.target === tocOverlay) closeToc();
      });
    }
    if (fullscreenBtn) fullscreenBtn.addEventListener("click", toggleFullscreen);
    updateFullscreenIcon();
  }

  // ---- fetch-and-swap navigation -------------------------------------
  // Keeps the document alive across "page" changes (preserves Fullscreen).

  function swapDocument(htmlText) {
    var doc = new DOMParser().parseFromString(htmlText, "text/html");
    var newMain = doc.querySelector("main");
    var newTopbar = doc.querySelector(".topbar");
    var newToc = doc.querySelector("#tocOverlay");
    var curMain = $("main");
    var curTopbar = $(".topbar");
    var curToc = $("#tocOverlay");
    if (!newMain || !newTopbar || !newToc || !curMain || !curTopbar || !curToc) {
      return false;
    }
    curMain.replaceWith(newMain);
    curTopbar.replaceWith(newTopbar);
    curToc.replaceWith(newToc);
    document.title = doc.title;
    bindChrome();
    window.scrollTo(0, 0);
    return true;
  }

  function navigateTo(url, addHistory) {
    fetch(url, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("bad status");
        return res.text();
      })
      .then(function (text) {
        if (!swapDocument(text)) throw new Error("swap failed");
        if (addHistory) history.pushState({ spa: true }, "", url);
      })
      .catch(function () {
        // Fall back to a normal navigation if fetch/parsing ever fails.
        window.location.href = url;
      });
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest("a[href]");
    if (!link) return;
    if (link.classList.contains("disabled") || link.target === "_blank") return;
    var url = link.getAttribute("href");
    if (!url || !/^[a-z0-9_-]+\.html$/i.test(url)) return; // same-directory pages only
    e.preventDefault();
    closeToc();
    navigateTo(url, true);
  });

  window.addEventListener("popstate", function () {
    navigateTo(location.pathname.split("/").pop() || "index.html", false);
  });

  document.addEventListener("fullscreenchange", updateFullscreenIcon);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeToc();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var target = e.target;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

    if (e.key === "ArrowRight") {
      var next = $('.nav-btn[data-dir="next"]:not(.disabled)');
      if (next) navigateTo(next.getAttribute("href"), true);
    } else if (e.key === "ArrowLeft") {
      var prev = $('.nav-btn[data-dir="prev"]:not(.disabled)');
      if (prev) navigateTo(prev.getAttribute("href"), true);
    } else if (e.key === "f" || e.key === "F") {
      toggleFullscreen();
    }
  });

  bindChrome();
})();
