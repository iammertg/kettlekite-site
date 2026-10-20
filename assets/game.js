// A Kettlekite game site: the hero leans away from the pointer and lifts as the page scrolls,
// the level strip slides sideways with the scroll, blocks rise into view.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bar = document.querySelector(".bar");
  const hero = document.querySelector(".g-hero");
  const levels = document.querySelector(".levels");
  const strip = levels && levels.querySelector(".strip");

  function measure() {
    if (strip) strip.style.setProperty("--travel", `${Math.max(0, strip.scrollWidth - document.documentElement.clientWidth)}px`);
  }

  let ticking = false;
  function frame() {
    ticking = false;
    bar.classList.toggle("veiled", scrollY > 40);
    if (reduce) return;
    if (hero) hero.style.setProperty("--hp", Math.min(1, Math.max(0, scrollY / hero.offsetHeight)).toFixed(4));
    if (strip) {
      const r = levels.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
      strip.style.setProperty("--sp", p.toFixed(4));
    }
  }
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", () => { measure(); request(); });

  if (hero && !reduce) {
    hero.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      hero.style.setProperty("--mx", ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
    });
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { threshold: 0.12 });
  document.querySelectorAll(".rise").forEach((el) => io.observe(el));

  addEventListener("load", () => { measure(); request(); });
  measure();
  frame();
})();
