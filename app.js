(() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const $ = (s, r = document) => r.querySelector(s);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(name, attrs = {}, parent) {
    const n = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  }
  /* ---------- Language ---------- */
  const LANG = (document.documentElement.lang || "en").slice(0, 2) === "es" ? "es" : "en";
  const ES = LANG === "es";
  const NB = "\u00a0";
  const num = (v, d = 1) => (ES ? v.toFixed(d).replace(".", ",") : v.toFixed(d));
  const pctInt = (v) => Math.round(v) + (ES ? NB + "%" : "%");
  const PP = ES ? NB + "p." + NB + "p." : " pp";
  const PP_AXIS = ES ? NB + "p.p." : "pp";
  const fmtPP = (v) => (Math.abs(v) < 0.05 ? "" : v > 0 ? "+" : "−") + num(Math.abs(v)) + PP;
  const fmtPct = (v) => num(v) + (ES ? NB + "%" : "%");
  const T = ES ? {
    seg: [["Wallets", "Wallets"], ["Tarjeta recurrente", "Tarj. recur."], ["Clientes nuevos", "Nuevos"]],
    steps: ["Tasa de aprobación, últimas 12 semanas", "Tasa de aprobación por segmento de cliente", "Qué movió la cifra global, semana 1 → semana 12"],
    headline: "Global", headlineApproval: "Aprobación global", week: "Semana", wk: "sem ",
    shareTitle: "Cuota de pagos por segmento", walletsShare: "Wallets", ofPayments: "de los pagos",
    note0: (a, b) => `<b>${a} → ${b}</b> en doce semanas. Plana. La mayoría de los dashboards se quedan aquí, y la revisión mensual dice «estable».`,
    note1: (d, a, b, r, s1, s2) => `La aprobación de tarjeta recurrente cayó <b>${d}</b>, del ${a} al ${b}. El tráfico de wallets, que aprueba en torno al ${r}, pasó del ${s1} al ${s2} de los pagos y tapó el agujero.`,
    note2: (mix, rate, net, lost) => `El mix sumó <b>${mix}</b> y la tasa de tarjeta recurrente restó <b>${rate}</b>, para un neto de ${net} Bajo una línea plana, <b>unas ${lost} aprobaciones menos cada semana</b> de tus clientes más fieles.`,
    bridge: [
      ["Mix: más tráfico wallet", "Mix: más wallets", "Cambio por el desplazamiento del mix de tráfico, a las tasas de la semana 1"],
      ["Tasa: tarjeta recurrente", "Tasa: tarj. recur.", "Cambio en igualdad de condiciones de la aprobación de tarjeta recurrente, con el mix de la semana 12"],
      ["Tasa: wallets", "Tasa: wallets", "Cambio en igualdad de condiciones de la aprobación de wallets"],
      ["Tasa: clientes nuevos", "Tasa: nuevos", "Cambio en igualdad de condiciones de la aprobación de clientes nuevos"],
      ["Cambio neto", "Cambio neto", "Aprobación global, semana 12 frente a semana 1"],
    ],
    vFlat: "La cifra global está plana. Comprueba que los segmentos no se estén moviendo en direcciones opuestas por debajo.",
    vPureMix: (x) => `<strong>Mix puro.</strong> La cifra global cayó ${x} aunque todos los segmentos se mantuvieron o mejoraron. Más clientes nuevos diluyeron la media, así que «arreglar el rendimiento» aquí sería perseguir un fantasma.`,
    vFlattering: (x) => `<strong>Un mix engañoso.</strong> La cifra global subió ${x}, pero ningún segmento mejoró. No lo presentes como un logro.`,
    vMostlyMix: (m, n) => `<strong>Sobre todo mix.</strong> ${m} de los ${n} vienen de quién llegó, no de cómo rindió.`,
    vMostlyRate: (r, n) => `<strong>Sobre todo un cambio real de rendimiento.</strong> ${r} de los ${n} son movimiento de tasa en igualdad de condiciones, así que merece investigarse.`,
    demoRows: [["Efecto mix", "Cambio solo por el mix de tráfico (tasas del periodo anterior, cuotas de este periodo)"], ["Efecto tasa", "Cambio en igualdad de condiciones de la tasa de aprobación de cada segmento"], ["Cambio neto", "Aprobación global, este periodo frente al anterior"]],
    tableSeg: ["Clientes nuevos", "Clientes recurrentes"], total: "Total",
    tableSum: (m, r, n) => `Efecto mix ${m} + efecto tasa ${r} = ${n}`,
  } : {
    seg: [["Wallets", "Wallets"], ["Returning card", "Ret. card"], ["New customers", "New"]],
    steps: ["Approval rate, last 12 weeks", "Approval rate by customer segment", "What moved the headline, week 1 → week 12"],
    headline: "Headline", headlineApproval: "Headline approval", week: "Week", wk: "wk ",
    shareTitle: "Share of payments by segment", walletsShare: "Wallets", ofPayments: "of payments",
    note0: (a, b) => `<b>${a} → ${b}</b> over twelve weeks. Flat. Most dashboards stop here, and the monthly review says "stable".`,
    note1: (d, a, b, r, s1, s2) => `Returning-card approval fell <b>${d}</b>, from ${a} to ${b}. Wallet traffic, approving at ~${r}, grew from ${s1} to ${s2} of payments and filled the hole.`,
    note2: (mix, rate, net, lost) => `Mix added <b>${mix}</b> and the returning-card rate took <b>${rate}</b>. Net: ${net}. Under a flat line, <b>~${lost} fewer approvals every week</b> from your most loyal customers.`,
    bridge: [
      ["Mix: more wallet traffic", "Mix: more wallets", "Change from the shift in traffic mix, at week-1 approval rates"],
      ["Rate: returning card", "Rate: ret. card", "Like-for-like change in returning-card approval, at week-12 mix"],
      ["Rate: wallets", "Rate: wallets", "Like-for-like change in wallet approval"],
      ["Rate: new customers", "Rate: new", "Like-for-like change in new-customer approval"],
      ["Net change", "Net change", "Headline approval, week 12 vs week 1"],
    ],
    vFlat: "The headline is flat. Check that the segments aren't moving in opposite directions underneath.",
    vPureMix: (x) => `<strong>Pure mix.</strong> The headline fell ${x} although every segment held or improved. More new customers diluted the blend, so "fixing performance" here would be chasing a ghost.`,
    vFlattering: (x) => `<strong>A flattering mix.</strong> The headline rose ${x}, but no segment improved. Don't report this as a win.`,
    vMostlyMix: (m, n) => `<strong>Mostly mix.</strong> ${m} of the ${n} comes from who showed up, not from how they performed.`,
    vMostlyRate: (r, n) => `<strong>Mostly a real performance change.</strong> ${r} of the ${n} is like-for-like rate movement, so this one is worth investigating.`,
    demoRows: [["Mix effect", "Change from traffic mix alone (last period's rates, this period's shares)"], ["Rate effect", "Like-for-like change in each segment's approval rate"], ["Net change", "Headline approval, this period vs last"]],
    tableSeg: ["New customers", "Returning customers"], total: "Total",
    tableSum: (m, r, n) => `Mix effect ${m} + rate effect ${r} = ${n}`,
  };

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const store = {
    get() { try { return localStorage.getItem("zs-theme"); } catch { return null; } },
    set(v) { try { localStorage.setItem("zs-theme", v); } catch { /* ignore */ } },
  };
  const saved = store.get();
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  const isDark = () => {
    const t = root.getAttribute("data-theme");
    return t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  $(".theme-toggle").addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store.set(next);
  });
  $("#year").textContent = new Date().getFullYear();
  document.querySelectorAll("[data-set-lang]").forEach((a) => a.addEventListener("click", () => {
    try { localStorage.setItem("zs-lang", a.dataset.setLang); } catch { /* ignore */ }
  }));

  /* ---------- Tooltip ---------- */
  const tip = $("#tip");
  function showTip(html, x, y) {
    tip.innerHTML = html;
    tip.hidden = false;
    const w = tip.offsetWidth;
    const cx = Math.min(Math.max(x, w / 2 + 8), window.innerWidth - w / 2 - 8);
    tip.style.left = cx + "px";
    tip.style.top = y + "px";
  }
  const hideTip = () => { tip.hidden = true; };

  /* ---------- Hero story: a flat headline hiding a mix shift (synthetic) ---------- */
  function seeded(seed) {
    return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  }
  const STORY = (() => {
    const rnd = seeded(7);
    const n = () => rnd() - 0.5;
    const WEEKS = 12, VOLUME = 150000; // payments per week (synthetic)
    const weeks = [];
    for (let t = 0; t < WEEKS; t++) {
      const f = t / (WEEKS - 1);
      const sW = 0.12 + 0.28 * Math.pow(f, 1.15);   // wallet traffic grows
      const sN = 0.25 - 0.01 * f;                     // new customers roughly stable
      const sR = 1 - sW - sN;                         // returning card: the rest
      const rW = 97.6 + n() * 0.2;
      const rN = 80.5 + n() * 0.5;
      const head = 91.4 + n() * 0.18;                 // what the dashboard shows: flat
      const rR = (head - sW * rW - sN * rN) / sR;     // what is really happening underneath
      weeks.push({ wk: t + 1, head, s: [sW, sR, sN], r: [rW, rR, rN] });
    }
    const A = weeks[0], B = weeks[WEEKS - 1];
    const mix = [0, 1, 2].reduce((acc, i) => acc + (B.s[i] - A.s[i]) * A.r[i], 0);
    const rate = [0, 1, 2].map((i) => B.s[i] * (B.r[i] - A.r[i]));
    const lost = B.s[1] * VOLUME * (A.r[1] - B.r[1]) / 100;
    return { weeks, A, B, mix, rate, net: B.head - A.head, lost };
  })();
  const SEG = ["var(--series-1)", "var(--series-2)", "var(--series-3)"].map((color, k) => ({ name: T.seg[k][0], short: T.seg[k][1], color }));
  const STEP_TITLES = T.steps;

  function storyNote(step) {
    const { A, B, mix, rate, net, lost } = STORY;
    if (step === 0) return T.note0(fmtPct(A.head), fmtPct(B.head));
    if (step === 1) return T.note1(fmtPP(B.r[1] - A.r[1]), fmtPct(A.r[1]), fmtPct(B.r[1]), pctInt(A.r[0]), pctInt(A.s[0] * 100), pctInt(B.s[0] * 100));
    return T.note2(fmtPP(mix), fmtPP(rate[1]), fmtPP(net), (Math.round(lost / 50) * 50).toLocaleString(ES ? "es-ES" : "en-GB"));
  }

  // Push overlapping end-labels apart (sorted by y, minimum gap in px).
  function spread(items, gap, lo, hi) {
    items.sort((a, b) => a.y - b.y);
    for (let k = 1; k < items.length; k++) if (items[k].y - items[k - 1].y < gap) items[k].y = items[k - 1].y + gap;
    const over = items.length ? items[items.length - 1].y - hi : 0;
    if (over > 0) items.forEach((it) => { it.y -= over; });
    for (let k = items.length - 2; k >= 0; k--) if (items[k + 1].y - items[k].y < gap) items[k].y = items[k + 1].y - gap;
    items.forEach((it) => { it.y = Math.max(lo, it.y); });
    return items;
  }

  function drawStory(step, animate) {
    const host = $("#story-chart");
    if (!host) return;
    host.innerHTML = "";
    const W = host.clientWidth, H = host.clientHeight;
    const narrow = W < 440;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: animate ? "fade-in" : "" }, host);
    const text = (x, y, s, attrs = {}) => { const t = el("text", { x, y, ...attrs }, svg); t.textContent = s; return t; };
    const { weeks } = STORY;

    if (step < 2) {
      const showMix = step === 1;
      const m = { t: 10, r: narrow ? 92 : 140, b: 22, l: 34 };
      const stripH = showMix ? 40 : 0, stripGap = showMix ? 44 : 0;
      const ih = H - m.t - m.b - stripH - stripGap, iw = W - m.l - m.r;
      const x = (i) => m.l + (i / (weeks.length - 1)) * iw;
      const yMin = 76, yMax = 100;
      const y = (v) => m.t + (1 - (v - yMin) / (yMax - yMin)) * ih;

      [76, 82, 88, 94, 100].forEach((g) => {
        el("line", { x1: m.l, x2: m.l + iw, y1: y(g), y2: y(g), style: "stroke: var(--grid)" }, svg);
        text(m.l - 6, y(g) + 3.5, pctInt(g), { class: "axis", "text-anchor": "end" });
      });
      [0, 3, 7, 11].forEach((i) => text(x(i), m.t + ih + 15, T.wk + weeks[i].wk, { class: "axis", "text-anchor": i === 0 ? "start" : i === 11 ? "end" : "middle" }));

      const path = (vals) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
      const lines = [];
      const labels = [];
      if (showMix) {
        SEG.forEach((sg, k) => {
          lines.push(el("path", { d: path(weeks.map((w) => w.r[k])), style: `fill:none; stroke:${sg.color}; stroke-width:${k === 1 ? 2.6 : 2}; stroke-linejoin:round; stroke-linecap:round` }, svg));
          labels.push({ y: y(weeks[11].r[k]), name: narrow ? sg.short : sg.name, val: weeks[11].r[k], color: sg.color, strong: k === 1 });
        });
        el("path", { d: path(weeks.map((w) => w.head)), style: "fill:none; stroke:var(--ink); stroke-width:1.5; stroke-dasharray:4 4; opacity:.55" }, svg);
        labels.push({ y: y(weeks[11].head), name: T.headline, val: weeks[11].head, color: "var(--ink)", dashed: true });
        // drop marker on the hidden decline
        const a = y(weeks[0].r[1]), b = y(weeks[11].r[1]);
        el("line", { x1: x(11) + 6, x2: x(11) + 6, y1: a, y2: b, style: "stroke: var(--series-2); stroke-width: 1.5" }, svg);
        el("line", { x1: x(0), x2: x(11) + 6, y1: a, y2: a, style: "stroke: var(--series-2); stroke-width: 1; stroke-dasharray: 2 3; opacity:.7" }, svg);
      } else {
        lines.push(el("path", { d: path(weeks.map((w) => w.head)), style: "fill:none; stroke:var(--ink); stroke-width:2.6; stroke-linejoin:round; stroke-linecap:round" }, svg));
        labels.push({ y: y(weeks[11].head), name: T.headline, val: weeks[11].head, color: "var(--ink)", strong: true });
        [0, 11].forEach((i) => el("circle", { cx: x(i), cy: y(weeks[i].head), r: 4, style: "fill: var(--ink); stroke: var(--surface); stroke-width: 2" }, svg));
        text(x(0), y(weeks[0].head) - 10, fmtPct(weeks[0].head), { class: "val" });
      }
      spread(labels, 13, m.t + 4, m.t + ih).forEach((lb) => {
        const lx = x(11) + (showMix ? 14 : 10);
        el("rect", { x: lx, y: lb.y - 4, width: 8, height: lb.dashed ? 2 : 8, rx: 2, style: `fill:${lb.color}` }, svg);
        const t = text(lx + 12, lb.y + 4, `${lb.name} ${fmtPct(lb.val)}`, { class: lb.strong ? "lbl-strong" : "" });
        if (narrow) t.textContent = `${lb.name} ${num(lb.val)}`;
      });

      if (showMix) {
        const sy = m.t + ih + stripGap;
        text(m.l, sy - 7, T.shareTitle, { class: "axis" });
        const bw = iw / weeks.length;
        weeks.forEach((w, i) => {
          let acc = 0;
          [1, 2, 0].forEach((k) => {   // stack: returning card, new, wallets on top
            const h = w.s[k] * stripH;
            el("rect", { x: m.l + i * bw + 1, y: sy + stripH - acc - h + 1, width: Math.max(1, bw - 2), height: Math.max(0, h - 2), rx: 1.5, style: `fill:${SEG[k].color}; opacity:.85` }, svg);
            acc += h;
          });
        });
        // wallet share, first → last week (wallets sit on top of each stacked bar)
        const share = `${pctInt(weeks[0].s[0] * 100)} → ${pctInt(weeks[11].s[0] * 100)}`;
        text(m.l + iw + 8, sy + 12, narrow ? T.walletsShare : `${T.walletsShare} ${share}`, { class: "axis" });
        text(m.l + iw + 8, sy + 26, narrow ? share : T.ofPayments, { class: "axis" });
      }

      if (animate && !reduceMotion) {
        lines.forEach((ln) => {
          const len = ln.getTotalLength();
          ln.style.strokeDasharray = len; ln.style.strokeDashoffset = len;
          requestAnimationFrame(() => { ln.style.transition = "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)"; ln.style.strokeDashoffset = 0; });
        });
      }

      // crosshair + tooltip
      const cross = el("line", { y1: m.t, y2: m.t + ih, style: "stroke: var(--ink-2); stroke-dasharray: 3 3; opacity: 0" }, svg);
      const hit = el("rect", { x: m.l, y: 0, width: iw, height: H, style: "fill: transparent; cursor: crosshair" }, svg);
      const move = (ev) => {
        const r = svg.getBoundingClientRect();
        const px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
        const i = Math.max(0, Math.min(11, Math.round(((px - m.l) / iw) * 11)));
        const w = weeks[i];
        cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.style.opacity = 0.5;
        const rows = showMix
          ? SEG.map((sg, k) => `<span class="swatch" style="background:${sg.color}"></span>${sg.name} <b>${fmtPct(w.r[k])}</b> · ${pctInt(w.s[k] * 100)} ${T.ofPayments}`).join("<br>") + `<br>${T.headline} <b>${fmtPct(w.head)}</b>`
          : `${T.headlineApproval} <b>${fmtPct(w.head)}</b>`;
        showTip(`<strong>${T.week} ${w.wk}</strong><br>${rows}`, r.left + x(i), r.top + m.t);
      };
      const leave = () => { cross.style.opacity = 0; hideTip(); };
      hit.addEventListener("mousemove", move);
      hit.addEventListener("touchmove", move, { passive: true });
      hit.addEventListener("mouseleave", leave);
      hit.addEventListener("touchend", leave);
      return;
    }

    // Step 2: bridge of the headline change (pp), bars about zero
    const { mix, rate, net } = STORY;
    const vals = [mix, rate[1], rate[0], rate[2], net];
    const cols = ["var(--accent-2)", "var(--series-2)", "var(--series-1)", "var(--series-3)", "var(--ink)"];
    const rows = T.bridge.map(([full, short, d], k) => ({ k: narrow ? short : full, v: vals[k], c: cols[k], d }));
    const labelW = narrow ? 112 : 160, pad = 62;
    const m = { t: 18, b: 26, l: labelW, r: 4 };
    const iw = W - m.l - m.r - 2 * pad, ih = H - m.t - m.b;
    const ext = Math.max(1.5, ...rows.map((r) => Math.abs(r.v))) * 1.05;
    const x = (v) => m.l + pad + ((v + ext) / (2 * ext)) * iw;
    const band = ih / rows.length, bh = Math.min(24, band * 0.52);
    const step2 = [0.5, 1, 2].find((s) => s * iw / (2 * ext) >= 40) || 2;
    for (let g = -Math.floor(ext / step2) * step2; g <= ext + 1e-9; g += step2) {
      el("line", { x1: x(g), x2: x(g), y1: m.t - 6, y2: H - m.b, style: `stroke:${Math.abs(g) < 1e-9 ? "var(--ink-2)" : "var(--grid)"}` }, svg);
      text(x(g), H - 8, (g > 0 ? "+" : g < 0 ? "−" : "") + num(Math.abs(g), g % 1 ? 1 : 0) + PP_AXIS, { class: "axis", "text-anchor": "middle" });
    }
    el("line", { x1: 0, x2: W, y1: m.t + band * 4, y2: m.t + band * 4, style: "stroke: var(--line); stroke-dasharray: 2 4" }, svg);
    rows.forEach((r, k) => {
      const cy = m.t + band * k + band / 2;
      text(0, cy + 4, r.k, { class: k === 1 || k === 4 ? "lbl-strong" : "" });
      const x0 = x(Math.min(0, r.v)), x1 = x(Math.max(0, r.v));
      const w = Math.max(1.5, x1 - x0), rad = Math.min(4, w / 2), top = cy - bh / 2, bot = cy + bh / 2, left = r.v < 0;
      const d = left
        ? `M${x1},${top}H${x0 + rad}Q${x0},${top} ${x0},${top + rad}V${bot - rad}Q${x0},${bot} ${x0 + rad},${bot}H${x1}Z`
        : `M${x0},${top}H${x1 - rad}Q${x1},${top} ${x1},${top + rad}V${bot - rad}Q${x1},${bot} ${x1 - rad},${bot}H${x0}Z`;
      const bar = el("path", { d, style: `fill:${r.c}` }, svg);
      if (animate && !reduceMotion) {
        bar.style.transformOrigin = `${x(0)}px ${cy}px`; bar.style.transform = "scaleX(0)";
        requestAnimationFrame(() => { bar.style.transition = `transform .7s cubic-bezier(.4,0,.2,1) ${k * 90}ms`; bar.style.transform = "scaleX(1)"; });
      }
      text(left ? x0 - 6 : x1 + 6, cy + 4, fmtPP(r.v), { class: "val", "text-anchor": left ? "end" : "start" });
      const hit = el("rect", { x: 0, y: cy - band / 2, width: W, height: band, style: "fill: transparent" }, svg);
      hit.addEventListener("mousemove", (ev) => showTip(`<strong>${r.k}</strong> <b>${fmtPP(r.v)}</b><br><span style="opacity:.8">${r.d}</span>`, ev.clientX, ev.clientY));
      hit.addEventListener("mouseleave", hideTip);
    });
  }

  const story = (() => {
    const fig = $("#story");
    if (!fig) return null;
    const tabs = [...fig.querySelectorAll('[role="tab"]')];
    const panel = $("#story-chart"), note = $("#story-note"), title = $("#story-title"), bar = fig.querySelector(".story-progress");
    const MS = 6500;
    let current = 0, timer = null, stopped = reduceMotion, paused = false;
    bar.style.setProperty("--story-ms", MS + "ms");

    function show(step, animate = true) {
      current = step;
      tabs.forEach((t, i) => { t.setAttribute("aria-selected", i === step); t.tabIndex = i === step ? 0 : -1; });
      panel.setAttribute("aria-labelledby", tabs[step].id);
      title.textContent = STEP_TITLES[step];
      note.innerHTML = storyNote(step);
      drawStory(step, animate);
      schedule();
    }
    function schedule() {
      clearTimeout(timer);
      bar.classList.remove("is-running");
      if (stopped || paused) return;
      void bar.offsetWidth; // restart the progress animation
      bar.classList.add("is-running");
      timer = setTimeout(() => show((current + 1) % tabs.length), MS);
    }
    function stop() { stopped = true; clearTimeout(timer); bar.classList.remove("is-running"); }
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => { stop(); show(i); });
      t.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault(); stop();
        const nx = (current + d + tabs.length) % tabs.length;
        show(nx); tabs[nx].focus();
      });
    });
    fig.addEventListener("mouseenter", () => { paused = true; schedule(); });
    fig.addEventListener("mouseleave", () => { paused = false; schedule(); });
    show(reduceMotion ? 1 : 0);
    return { redraw: () => drawStory(current, false) };
  })();

  /* ---------- Mix vs rate demo (synthetic) ---------- */
  const BASE = { shareNew: 20, rNew: 78, rRep: 95 };
  const DEFAULTS = { share: 35, dNew: 1, dRep: 0.5 };
  const iShare = $("#i-share"), iNew = $("#i-new"), iRep = $("#i-rep");

  function compute() {
    const share = +iShare.value, dNew = +iNew.value, dRep = +iRep.value;
    const wA = [BASE.shareNew / 100, 1 - BASE.shareNew / 100];
    const wB = [share / 100, 1 - share / 100];
    const rA = [BASE.rNew, BASE.rRep];
    const rB = [BASE.rNew + dNew, BASE.rRep + dRep];
    const totA = wA[0] * rA[0] + wA[1] * rA[1];
    const totB = wB[0] * rB[0] + wB[1] * rB[1];
    // Mix effect at last period's rates; rate effect at this period's weights. Sums exactly to the net change.
    const mix = (wB[0] - wA[0]) * rA[0] + (wB[1] - wA[1]) * rA[1];
    const rate = wB[0] * (rB[0] - rA[0]) + wB[1] * (rB[1] - rA[1]);
    return { share, dNew, dRep, wA, wB, rA, rB, totA, totB, mix, rate, net: totB - totA };
  }

  function verdict(s) {
    const both = (cmp) => cmp(s.dNew) && cmp(s.dRep);
    if (Math.abs(s.net) < 0.05) return T.vFlat;
    if (s.net < 0 && both((v) => v >= 0)) return T.vPureMix(num(Math.abs(s.net)) + PP);
    if (s.net > 0 && both((v) => v <= 0)) return T.vFlattering(num(s.net) + PP);
    if (Math.abs(s.mix) >= Math.abs(s.rate)) return T.vMostlyMix(fmtPP(s.mix), fmtPP(s.net));
    return T.vMostlyRate(fmtPP(s.rate), fmtPP(s.net));
  }

  function drawBridge(s) {
    const host = $("#waterfall");
    host.innerHTML = "";
    const W = host.clientWidth, H = host.clientHeight;
    const rows = [s.mix, s.rate, s.net].map((v, k) => ({ k: T.demoRows[k][0], v, c: ["var(--series-1)", "var(--series-2)", "var(--total)"][k], d: T.demoRows[k][1] }));
    const labelW = W < 420 ? 84 : 110;
    const pad = 62; // room for value labels beyond the longest bar
    const m = { t: 20, r: 4, b: 28, l: labelW };
    const iw = W - m.l - m.r - 2 * pad, ih = H - m.t - m.b;
    const ext = Math.max(2, ...rows.map((r) => Math.abs(r.v))) * 1.05;
    const x = (v) => m.l + pad + ((v + ext) / (2 * ext)) * iw;
    const band = ih / rows.length, bh = Math.min(30, band * 0.5);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}` }, host);

    // tick step: smallest of 1/2/4/5/10 pp that keeps ticks ≥ 44px apart
    const pxPerPP = iw / (2 * ext);
    const step = [1, 2, 4, 5, 10].find((s) => s * pxPerPP >= 44) || 10;
    for (let g = -Math.floor(ext / step) * step; g <= ext; g += step) {
      el("line", { x1: x(g), x2: x(g), y1: m.t - 6, y2: H - m.b, style: `stroke: ${g === 0 ? "var(--ink-2)" : "var(--grid)"}; stroke-width: 1` }, svg);
      const t = el("text", { x: x(g), y: H - 8, "text-anchor": "middle", style: "fill: var(--muted); font: 500 10px var(--mono)" }, svg);
      t.textContent = (g > 0 ? "+" : g < 0 ? "−" : "") + Math.abs(g) + PP_AXIS;
    }
    // divider before net
    el("line", { x1: 0, x2: W, y1: m.t + band * 2, y2: m.t + band * 2, style: "stroke: var(--line); stroke-dasharray: 2 4" }, svg);

    rows.forEach((r, k) => {
      const cy = m.t + band * k + band / 2;
      const lab = el("text", { x: 0, y: cy + 4 }, svg);
      lab.textContent = r.k;
      if (k === 2) lab.style.fontWeight = 700;
      const x0 = x(Math.min(0, r.v)), x1 = x(Math.max(0, r.v));
      const w = Math.max(1.5, x1 - x0);
      // bar with 4px rounded data-end, square at the zero baseline
      const rad = Math.min(4, w / 2);
      const left = r.v < 0, top = cy - bh / 2, bot = cy + bh / 2;
      const d = left
        ? `M${x1},${top}H${x0 + rad}Q${x0},${top} ${x0},${top + rad}V${bot - rad}Q${x0},${bot} ${x0 + rad},${bot}H${x1}Z`
        : `M${x0},${top}H${x1 - rad}Q${x1},${top} ${x1},${top + rad}V${bot - rad}Q${x1},${bot} ${x1 - rad},${bot}H${x0}Z`;
      el("path", { d, style: `fill: ${r.c}` }, svg);
      const val = el("text", { class: "val", x: left ? x0 - 6 : x1 + 6, y: cy + 4, "text-anchor": left ? "end" : "start" }, svg);
      val.textContent = fmtPP(r.v);
      const hit = el("rect", { x: 0, y: cy - band / 2, width: W, height: band, style: "fill: transparent" }, svg);
      hit.addEventListener("mousemove", (ev) => showTip(`<strong>${r.k}</strong> <b>${fmtPP(r.v)}</b><br><span style="opacity:.8">${r.d}</span>`, ev.clientX, ev.clientY));
      hit.addEventListener("mouseleave", hideTip);
    });
  }

  function renderDemo() {
    const s = compute();
    $("#o-share").textContent = pctInt(s.share);
    $("#o-new").textContent = fmtPP(s.dNew);
    $("#o-rep").textContent = fmtPP(s.dRep);
    $("#k-head").textContent = `${fmtPct(s.totA)} → ${fmtPct(s.totB)}`;
    $("#k-delta").textContent = fmtPP(s.net);
    $("#verdict").innerHTML = verdict(s);
    $("#wf-table").innerHTML = [0, 1].map((i) => `<tr><td>${T.tableSeg[i]}</td><td>${pctInt(s.wA[i] * 100)} → ${pctInt(s.wB[i] * 100)}</td><td>${fmtPct(s.rA[i])} → ${fmtPct(s.rB[i])}</td></tr>`).join("")
      + `<tr><td><strong>${T.total}</strong></td><td>${pctInt(100)}</td><td><strong>${fmtPct(s.totA)} → ${fmtPct(s.totB)}</strong></td></tr>`
      + `<tr><td colspan="3">${T.tableSum(fmtPP(s.mix), fmtPP(s.rate), fmtPP(s.net))}</td></tr>`;
    drawBridge(s);
  }
  const hasDemo = !!(iShare && iNew && iRep);
  if (hasDemo) {
    [iShare, iNew, iRep].forEach((i) => i.addEventListener("input", renderDemo));
    $("#demo-reset").addEventListener("click", () => {
      iShare.value = DEFAULTS.share; iNew.value = DEFAULTS.dNew; iRep.value = DEFAULTS.dRep; renderDemo();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const targets = document.querySelectorAll(".section__head, .card:not(.insight-card), .steps li, .stack > div, .proof li");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    targets.forEach((t) => {
      if (t.getBoundingClientRect().top < window.innerHeight) return; // already visible: never hide it
      t.classList.add("reveal");
      io.observe(t);
    });
    // Safety net: content must never stay hidden if the observer doesn't fire (deep links, crawlers, previews).
    setTimeout(() => targets.forEach((t) => t.classList.add("is-in")), 2500);
  }

  /* ---------- Init & resize ---------- */
  const redraw = () => { if (story) story.redraw(); if (hasDemo) renderDemo(); };
  if (hasDemo) renderDemo();
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(redraw, 120); });
})();
