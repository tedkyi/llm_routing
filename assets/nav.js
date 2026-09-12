// Keyboard navigation for Prev/Next links: left/right arrow keys.
document.addEventListener("keydown", function (e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  var target = e.target;
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

  if (e.key === "ArrowRight") {
    var next = document.querySelector('.nav-btn[data-dir="next"]:not(.disabled)');
    if (next) window.location.href = next.getAttribute("href");
  } else if (e.key === "ArrowLeft") {
    var prev = document.querySelector('.nav-btn[data-dir="prev"]:not(.disabled)');
    if (prev) window.location.href = prev.getAttribute("href");
  }
});
