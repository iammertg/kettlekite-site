// kettlekite.com: the opening, the kite's string and tail, chapter motion, lazy videos and the index preview.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const svgNS = "http://www.w3.org/2000/svg";
  const sky = document.querySelector(".sky");
  const flyer = sky.querySelector(".flyer");
  const kettle = sky.querySelector(".kettle");
  const string = sky.querySelector(".string path");
  const bar = document.querySelector(".bar");
  const tail = document.querySelector(".tail");
  const ribbon = tail.querySelector(".ribbon");
  const bows = tail.querySelector(".bows");
  const chapters = [...document.querySelectorAll(".chapter")];
  let vh = innerHeight;

  sky.querySelectorAll(".wordmark span").forEach((s, i) => s.style.setProperty("--i", i));

  // a seeded random so the stars sit in the same places on every visit
  const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

  function stars() {
    const svg = sky.querySelector(".stars");
    const w = svg.clientWidth, h = svg.clientHeight, rnd = seeded(11);
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.replaceChildren();
    const count = Math.round((w * h) / 16000);
    for (let i = 0; i < count; i++) {
      const c = document.createElementNS(svgNS, "circle");
      const y = rnd() ** 1.4 * h; // denser high up, thinning toward the glow
      c.setAttribute("cx", (rnd() * w).toFixed(1));
      c.setAttribute("cy", y.toFixed(1));
      c.setAttribute("r", (0.5 + rnd() * rnd() * 1.4).toFixed(2));
      c.setAttribute("opacity", (0.25 + rnd() * 0.6 * (1 - y / h)).toFixed(2));
      if (rnd() < 0.45) {
        c.classList.add("tw");
        const t = 3 + rnd() * 4;
        c.style.animationDuration = `${t.toFixed(2)}s`;
        c.style.animationDelay = `${(-rnd() * t).toFixed(2)}s`;
      }
      svg.append(c);
    }
  }

  // Where the kite's lower tip and the kettle's spout are, in page pixels. Offsets ignore the
  // opening transforms, so these are the resting positions the kite flies into.
  const tip = () => [flyer.offsetLeft + flyer.offsetWidth / 2, flyer.offsetTop + flyer.offsetHeight * 0.97];
  const spout = () => [kettle.offsetLeft + kettle.offsetWidth * (190 / 220), kettle.offsetTop + kettle.offsetHeight * (74 / 170)];

  function layoutString() {
    const w = sky.clientWidth, h = sky.clientHeight;
    string.parentNode.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const [kx, ky] = tip(), [sx, sy] = spout();
    // the string sags between the spout and the kite, bellied away from the wind
    // the handles never reach past the kite, or a kite close above the kettle makes the string hook
    const rise = Math.max(0, sy - ky);
    string.setAttribute("d", `M${sx} ${sy} C ${sx - w * 0.02} ${sy - Math.min(h * 0.3, rise * 0.45)}, ${kx + w * 0.07} ${ky + Math.min(h * 0.26, rise * 0.4)}, ${kx} ${ky}`);
    string.style.setProperty("--len", string.getTotalLength().toFixed(0));
  }

  // The tail: from the kite's tip it swings across the sky above the name, drops down the left
  // margin and runs beside the list of games, a bow beside each one.
  let samples = [], length = 0;
  function layoutTail() {
    const w = document.documentElement.clientWidth;
    const h = document.documentElement.scrollHeight;
    tail.setAttribute("viewBox", `0 0 ${w} ${h}`);
    tail.style.height = `${h}px`;
    const gutter = parseFloat(getComputedStyle(document.querySelector(".index")).paddingLeft) || 24;
    const edge = w < 600 ? 9 : Math.max(14, gutter * 0.46);
    const [kx, ky] = tip();
    const top = sky.querySelector(".wordmark").offsetTop + sky.querySelector(".sky-copy").offsetTop;
    const arc = Math.min(ky + vh * 0.14, top - vh * 0.06); // the lowest the arc may sag before the name
    const pts = [[kx, ky], [kx - w * 0.12, ky + (arc - ky) * 0.55], [w * 0.4, arc], [w * 0.13, arc + vh * 0.02], [edge, arc + vh * 0.12], [edge, top + vh * 0.2]];
    const rows = [...document.querySelectorAll(".games li")];
    // each bow sits level with the game's name
    const knots = rows.map((li) => { const r = li.querySelector(".g-name").getBoundingClientRect(); return [edge, r.top + scrollY + r.height * 0.55]; });
    let side = 1;
    for (const k of knots) {
      const last = pts[pts.length - 1];
      pts.push([edge + side * Math.min(10, w * 0.008), (last[1] + k[1]) / 2], k);
      side = -side;
    }
    // the end of the tail curls under the last game
    const end = knots[knots.length - 1];
    pts.push([edge + 14, end[1] + 60], [edge + 32, end[1] + 70]);
    ribbon.setAttribute("d", smooth(pts));
    length = ribbon.getTotalLength();
    ribbon.style.strokeDasharray = `${length} ${length}`;
    // y → drawn length, from evenly spaced samples (the tail only ever runs downward past the sky)
    samples = [];
    const n = 700;
    let maxY = 0;
    for (let i = 0; i <= n; i++) {
      const l = (length * i) / n, p = ribbon.getPointAtLength(l);
      maxY = Math.max(maxY, p.y);
      samples.push([maxY, l]);
    }
    bows.replaceChildren(...knots.map(([x, y], i) => bow(x, y, i)));
    draw();
  }

  // Catmull-Rom through the points, as cubic Béziers
  function smooth(p) {
    let d = `M${p[0][0]} ${p[0][1]}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  }

  // a bow like the ones on the kite's tail in the logo: two little sails, gold and teal
  function bow(x, y, i) {
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "bow");
    g.dataset.y = y;
    const rot = i % 2 ? 14 : -10;
    const size = document.documentElement.clientWidth < 600 ? 0.62 : 1;
    g.innerHTML = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${size})"><path d="M0 0 L-12 -6 L-11 6 Z" fill="${i % 2 ? "#5fa59a" : "#f0a92e"}"/><path d="M0 0 L12 -6 L11 6 Z" fill="${i % 2 ? "#f0a92e" : "#5fa59a"}"/><circle r="2" fill="#f4ebdd"/></g>`;
    return g;
  }

  function lengthAt(y) {
    let lo = 0, hi = samples.length - 1;
    if (!samples.length) return 0;
    if (y >= samples[hi][0]) return length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (samples[m][0] < y) lo = m + 1; else hi = m; }
    return samples[lo][1];
  }

  let shown = 0;
  function draw() {
    const reach = reduce ? Infinity : scrollY + vh * 0.9;
    // during the opening the tail waits until the kite has landed
    const target = sky.classList.contains("landed") || reduce ? lengthAt(reach) : 0;
    shown = target;
    ribbon.style.strokeDashoffset = `${length - shown}`;
    for (const b of bows.children) b.classList.toggle("on", +b.dataset.y < reach);
  }

  // chapter motion: --p runs 0 → 1 while a chapter rises into view, --x 0 → 1 while it leaves.
  // Only the chapter filling most of the screen plays its video: with two playing videos on screen,
  // Chrome on a Mac drops the whole page to 30 fps, which is just when one chapter slides over another.
  function chapterMotion() {
    let lead = null, most = 0;
    const near = new Map();
    for (const c of chapters) {
      const r = c.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - r.top / vh));
      const x = Math.min(1, Math.max(0, -r.top / vh));
      c.style.setProperty("--p", p.toFixed(4));
      c.style.setProperty("--x", x.toFixed(4));
      near.set(c, r.top < vh * 2 && r.bottom > -vh);
      const shown = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      if (shown > most) { most = shown; lead = c; }
    }
    for (const c of chapters) for (const v of c.querySelectorAll("video")) video(v, near.get(c), c === lead);
  }

  // AV1 holds the film chapters' detail at a fraction of the size, but only where the hardware
  // decodes it; a software AV1 decode would cost more than the sharper picture is worth
  let av1 = false;
  navigator.mediaCapabilities?.decodingInfo({
    type: "file",
    video: { contentType: 'video/mp4; codecs="av01.0.12M.10"', width: 2560, height: 1440, bitrate: 6e6, framerate: 30 },
  }).then((r) => (av1 = r.supported && r.powerEfficient)).catch(() => {});

  function video(v, near, visible) {
    if (near && !v.src) {
      const small = v.dataset.srcSmall && innerWidth < 900;
      v.src = small ? v.dataset.srcSmall : (av1 && v.dataset.srcAv1) || v.dataset.src;
      v.addEventListener("error", () => { if (!v.src.endsWith(v.dataset.src)) v.src = v.dataset.src; }, { once: true });
    }
    if (!v.src) return;
    if (visible && v.paused && !reduce) v.play().catch(() => {});
    else if (!visible && !v.paused) v.pause();
  }

  let ticking = false;
  function frame() {
    ticking = false;
    bar.classList.toggle("veiled", scrollY > 40);
    chapterMotion();
    draw();
  }
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };

  function layout() {
    vh = innerHeight;
    stars();
    layoutString();
    layoutTail();
    frame();
  }

  // showcase scenes lean away from the pointer
  for (const c of document.querySelectorAll(".showcase")) {
    c.addEventListener("pointermove", (e) => {
      if (reduce || e.pointerType !== "mouse") return;
      c.style.setProperty("--mx", ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
    });
  }
  // the kite answers the pointer like a gust
  sky.addEventListener("pointermove", (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    sky.style.setProperty("--wx", ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
  });

  // a star falls every few seconds while the sky is in view
  const meteors = sky.querySelector(".meteors");
  let skyInView = true;
  new IntersectionObserver(([e]) => (skyInView = e.isIntersecting)).observe(sky);
  function meteor() {
    if (skyInView && !document.hidden) {
      const m = document.createElement("i");
      const w = meteors.clientWidth, h = meteors.clientHeight;
      const right = Math.random() < 0.5; // falls toward the lower right or the lower left
      m.className = "meteor";
      m.style.setProperty("--x", `${(0.12 + Math.random() * 0.66) * w}px`);
      m.style.setProperty("--y", `${(0.04 + Math.random() * 0.4) * h}px`);
      m.style.setProperty("--a", `${right ? 18 + Math.random() * 14 : 148 + Math.random() * 14}deg`);
      m.style.setProperty("--len", `${110 + Math.random() * 90}px`);
      m.style.setProperty("--d", `${Math.min(w * 0.3, 260 + Math.random() * 160)}px`);
      m.style.setProperty("--t", `${0.95 + Math.random() * 0.45}s`);
      m.addEventListener("animationend", () => m.remove());
      meteors.append(m);
    }
    setTimeout(meteor, 5000 + Math.random() * 7000);
  }

  // the index shows a frame of each game beside the pointer
  const peek = document.querySelector(".peek");
  if (hover && peek) {
    const frames = new Map();
    let offset = 170, x = 0, y = 0;
    const follow = () => {
      peek.style.setProperty("--px", `${x + offset}px`);
      peek.style.setProperty("--py", `${y}px`);
    };
    for (const a of document.querySelectorAll(".games a")) {
      const img = document.createElement("img");
      img.alt = "";
      if (a.getAttribute("href").includes("jam")) img.className = "tall";
      peek.append(img);
      frames.set(a, img);
      a.addEventListener("pointerenter", () => {
        for (const [b, f] of frames) f.classList.toggle("on", b === a);
        offset = 36 + img.offsetWidth / 2; // the frame's left edge sits just right of the pointer
        follow();
        peek.classList.add("on");
      });
      a.addEventListener("pointerleave", () => peek.classList.remove("on"));
    }
    // load and decode all four once, before the first hover can need one
    const load = () => { for (const [a, img] of frames) if (!img.src) { img.src = a.dataset.preview; img.decode().catch(() => {}); } };
    setTimeout(load, 2600);
    document.querySelector(".games").addEventListener("pointerenter", load, { once: true });
    document.querySelector(".games").addEventListener("pointermove", (e) => {
      x = e.clientX;
      y = e.clientY;
      follow();
    });
  }

  // reveal blocks as they come into view
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { threshold: 0.15 });
  document.querySelectorAll(".rise").forEach((el) => io.observe(el));

  addEventListener("scroll", request, { passive: true });
  let resizeTimer = 0;
  addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 150); });
  // sections change height when fonts and media settle; the tail follows
  new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 150); }).observe(document.body);

  const start = () => {
    layout();
    requestAnimationFrame(() => sky.classList.add("ready"));
    if (!reduce) setTimeout(meteor, 3600);
    setTimeout(() => { sky.classList.add("landed"); ribbon.style.transition = "stroke-dashoffset 1.2s cubic-bezier(.45,0,.2,1)"; draw(); setTimeout(() => (ribbon.style.transition = ""), 1300); }, reduce ? 0 : 2300);
  };
  (document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]) : Promise.resolve()).then(start);
})();
