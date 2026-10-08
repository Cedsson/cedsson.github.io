// Some browsers ignore autoplay even on muted videos, so kick them
// when they scroll into view or on the first interaction.
(function () {
  var videos = document.querySelectorAll('figure video');
  if (!videos.length) return;

  function tryPlay(video) {
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) tryPlay(entry.target);
      });
    }, { threshold: 0.25 });
    videos.forEach(function (v) { io.observe(v); });
  } else {
    videos.forEach(tryPlay);
  }

  ['click', 'touchstart', 'keydown', 'scroll'].forEach(function (evt) {
    document.addEventListener(evt, function () {
      videos.forEach(tryPlay);
    }, { once: true, passive: true });
  });
})();
