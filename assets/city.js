// kettlekite.com: the night city under the sky. Blocks in three depths, their lit windows and rooftop
// clutter, and the four games playing on billboards that stand on the rooftops.
(() => {
  const city = document.querySelector(".city");
  if (!city) return;
  const NS = "http://www.w3.org/2000/svg";
  const back = city.querySelector("svg.back");
  const front = city.querySelector("svg.front");
  const boards = Object.fromEntries([...city.querySelectorAll(".board")].map((a) => [a.dataset.game, a]));
  const hue = { streetball: "#f2985a", lavaspin: "#ff5a2a", vanity: "#f2a0be", sundae: "#7fe0c8" };
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.append(e);
    return e;
  };

  function draw() {
    const W = city.clientWidth, H = city.clientHeight;
    for (const s of [back, front]) { s.setAttribute("viewBox", `0 0 ${W} ${H}`); s.replaceChildren(); }
    // seeded, so the city stands the same way on every visit
    let seed = 23;
    const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const u = Math.max(0.55, Math.min(1.25, W / 1440));
    const narrow = W < 700;
    const defs = el("defs", {}, back);
    const fdefs = el("defs", {}, front);
    let gid = 0;
    const radial = (color, op) => {
      const id = `cg${gid++}`;
      const g = el("radialGradient", { id }, defs);
      el("stop", { offset: "0", "stop-color": color, "stop-opacity": op }, g);
      el("stop", { offset: "1", "stop-color": color, "stop-opacity": 0 }, g);
      return `url(#${id})`;
    };
    const linear = (stops, parent) => {
      const id = `cg${gid++}`;
      const g = el("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, parent);
      for (const [o, c, a] of stops) el("stop", { offset: o, "stop-color": c, "stop-opacity": a }, g);
      return `url(#${id})`;
    };

    const tone = { far: "#151a3b", mid: "#0f1330", near: "#0a0c1e" };
    function roof(x, w, top, g) {
      const k = r();
      if (k < 0.3 && w > 56 * u) {
        // a water tank on legs
        const tw = 15 * u, th = 17 * u, tx = x + w * (0.2 + r() * 0.5), base = top - 7 * u;
        el("rect", { x: tx + 2 * u, y: base, width: 1.8 * u, height: 7 * u, fill: tone.near }, g);
        el("rect", { x: tx + tw - 3.8 * u, y: base, width: 1.8 * u, height: 7 * u, fill: tone.near }, g);
        el("rect", { x: tx, y: base - th, width: tw, height: th, rx: 2 * u, fill: "#0c0f25" }, g);
        el("path", { d: `M${tx - u} ${base - th} L${tx + tw / 2} ${base - th - 6 * u} L${tx + tw + u} ${base - th} Z`, fill: "#0c0f25" }, g);
      } else if (k < 0.55) {
        // air-conditioning units
        for (let i = 0; i < 2 + Math.floor(r() * 2); i++) el("rect", { x: x + w * 0.12 + i * 13 * u, y: top - 6 * u, width: 10 * u, height: 6 * u, fill: "#0c0f25" }, g);
      } else if (k < 0.75) {
        // an antenna with a red light
        const ax = x + w * (0.3 + r() * 0.4), ah = (18 + r() * 22) * u;
        el("rect", { x: ax, y: top - ah, width: 1.3 * u, height: ah, fill: "#141936" }, g);
        el("circle", { cx: ax + 0.65 * u, cy: top - ah, r: 1.7 * u, fill: "#ff5a4a", class: "beacon", style: `animation-delay:${(-r() * 3).toFixed(2)}s` }, g);
      }
    }
    function block(x, w, top, layer, bare = false) {
      const g = el("g", {}, back);
      el("rect", { x, y: top, width: w, height: H - top + 2, fill: tone[layer] }, g);
      el("rect", { x: x - 1.5 * u, y: top - 2.5 * u, width: w + 3 * u, height: 2.5 * u, fill: layer === "far" ? "#1b2148" : "#181d3e" }, g);
      const cw = 11 * u, rh = 14 * u, ww = 4.2 * u, wh = 6.4 * u;
      const lit = { far: 0.07, mid: 0.1, near: 0.13 }[layer];
      const op = { far: 0.32, mid: 0.55, near: 0.85 }[layer];
      const cols = Math.max(1, Math.floor((w - 8 * u) / cw));
      const x0 = x + (w - cols * cw) / 2 + (cw - ww) / 2;
      for (let y = top + 10 * u; y < H - 6 * u; y += rh) {
        for (let c = 0; c < cols; c++) {
          const v = r(), warm = r() > 0.25, a = 0.6 + r() * 0.4;
          if (v > lit) continue;
          el("rect", { x: x0 + c * cw, y, width: ww, height: wh, fill: warm ? "#e9b56f" : "#8fa9e6", opacity: (op * a).toFixed(2) }, g);
        }
      }
      if (layer !== "far" && !bare) roof(x, w, top, g);
    }
    function skyline(layer, lo, hi, minW, maxW) {
      let x = -12 * u;
      while (x < W) {
        const w = (minW + r() * (maxW - minW)) * u;
        block(x, w, H * (lo + r() * (hi - lo)), layer);
        x += w + (r() < 0.3 ? r() * 10 * u : -2 * u);
      }
    }
    skyline("far", 0.08, 0.5, 40, 120);
    // the city's own glow, low over the far blocks
    el("rect", { x: 0, y: H * 0.35, width: W, height: H * 0.65, fill: linear([[0, "#2a2550", 0], [1, "#2a2550", 0.35]], defs) }, back);
    skyline("mid", 0.32, 0.72, 50, 130);

    // the billboards, each on its own roof: a cabinet on steel legs and braces, a catwalk with a
    // rail, and lamps on arms that throw soft light down the face
    const slots = narrow
      ? { streetball: 0.16, vanity: 0.37, lavaspin: 0.56, sundae: 0.75 }
      : { streetball: 0.19, vanity: 0.385, lavaspin: 0.56, sundae: 0.73 };
    const wideW = narrow ? W * 0.3 : W * 0.2;
    const tallW = narrow ? W * 0.11 : W * 0.05;
    function billboard(game, roofY, w, h) {
      const cx = W * slots[game];
      const host = w + (narrow ? 26 : 70) * u;
      const legs = (narrow ? 14 : 26) * u;
      const sy = roofY - legs - h;
      block(cx - host / 2, host, roofY, "near", true);
      el("ellipse", { cx, cy: roofY, rx: w * 0.75, ry: 10 * u, fill: radial(hue[game], 0.5) }, back);
      el("rect", { x: cx - w / 2 - 6 * u, y: sy - 6 * u, width: w + 12 * u, height: h + 12 * u, rx: 2 * u, fill: "#0b0d1f" }, back);
      const n = w > 120 * u ? 3 : 2;
      const lx = (i) => cx - w / 2 + (w * (i + 0.5)) / n;
      for (let i = 0; i < n; i++) el("rect", { x: lx(i) - 1.8 * u, y: sy + h + 6 * u, width: 3.6 * u, height: legs, fill: "#0b0d1f" }, back);
      for (let i = 0; i < n - 1; i++) {
        const a = lx(i), b = lx(i + 1), t = sy + h + 9 * u;
        el("path", { d: `M${a} ${t} L${b} ${roofY} M${b} ${t} L${a} ${roofY}`, stroke: "#0b0d1f", "stroke-width": 1.4 * u }, back);
      }
      el("rect", { x: cx - w / 2 - 10 * u, y: sy + h + 8 * u, width: w + 20 * u, height: 2.4 * u, fill: "#121634" }, back);
      el("path", { d: `M${cx - w / 2 - 10 * u} ${sy + h + u} H${cx + w / 2 + 10 * u}`, stroke: "#121634", "stroke-width": u }, back);
      Object.assign(boards[game].style, { left: `${cx - w / 2}px`, top: `${sy}px`, width: `${w}px`, height: `${h}px` });
      const canvas = boards[game].querySelector("canvas");
      canvas.width = Math.round(w * devicePixelRatio);
      canvas.height = Math.round(h * devicePixelRatio);
      paint(boards[game]);
      const lamps = w > 120 * u ? 4 : 2;
      for (let i = 0; i < lamps; i++) {
        const x = cx - w / 2 + (w * (i + 0.5)) / lamps;
        el("path", { d: `M${x} ${sy - 6 * u} v${-8 * u} h${-7 * u}`, stroke: "#0b0d1f", "stroke-width": 1.6 * u, fill: "none" }, front);
        el("rect", { x: x - 10 * u, y: sy - 15 * u, width: 6 * u, height: 3 * u, rx: u, fill: "#d9d2c3" }, front);
        // the cone starts at the screen's top edge, so it lights the face and not the sky above it
        const cx2 = x - 7 * u, spread = (w / lamps) * 0.5;
        el("path", { d: `M${cx2 - 3 * u} ${sy} L${cx2 + 3 * u} ${sy} L${cx2 + spread} ${sy + h * 0.5} L${cx2 - spread} ${sy + h * 0.5} Z`, fill: linear([[0, "#fff6e0", 0.16], [1, "#fff6e0", 0]], fdefs) }, front);
      }
    }
    billboard("streetball", H * 0.58, wideW, (wideW * 9) / 16);
    billboard("lavaspin", H * 0.66, wideW * 0.92, (wideW * 0.92 * 9) / 16);
    billboard("vanity", H * 0.52, tallW, tallW * 2.05);
    billboard("sundae", H * 0.56, tallW, tallW * 2.05);
    // the kettle's roof at the right edge
    block(W * 0.88, W * 0.14, H * 0.38, "near", true);
  }

  // Each board shows its game through a canvas, its video playing unseen. In Chrome on a Mac, two or
  // more playing videos on screen at once pinned the whole page to 30 fps on a 120 Hz display; the
  // same frames drawn into canvases leave it at full rate. Until a frame arrives, and when motion is
  // reduced, the board's poster shows through.
  function paint(board) {
    const v = board.querySelector("video"), c = board.querySelector("canvas");
    if (v.readyState < 2 || !v.videoWidth) return;
    const ctx = c.getContext("2d");
    const scale = Math.max(c.width / v.videoWidth, c.height / v.videoHeight);
    const sw = c.width / scale, sh = c.height / scale;
    ctx.drawImage(v, (v.videoWidth - sw) / 2, (v.videoHeight - sh) / 2, sw, sh, 0, 0, c.width, c.height);
  }
  for (const board of Object.values(boards)) {
    const v = board.querySelector("video");
    if ("requestVideoFrameCallback" in v) {
      const frame = () => { paint(board); v.requestVideoFrameCallback(frame); };
      v.requestVideoFrameCallback(frame);
    } else {
      const frame = () => { if (!v.paused) paint(board); requestAnimationFrame(frame); };
      requestAnimationFrame(frame);
    }
  }

  // the boards play while the sky is on screen, and hold their poster frame when motion is reduced
  const videos = [...city.querySelectorAll("video")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    new IntersectionObserver(([e]) => {
      for (const v of videos) {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      }
    }).observe(city);
  }

  draw();
  let t = 0;
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(draw, 120); });
})();
