// Videos load nothing until they scroll into view, then play while visible
// and pause when scrolled away, so the page stays light on first load.
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
        else entry.target.pause();
      });
    }, { threshold: 0.25 });
    videos.forEach(function (v) { io.observe(v); });
  } else {
    videos.forEach(tryPlay);
  }
})();
