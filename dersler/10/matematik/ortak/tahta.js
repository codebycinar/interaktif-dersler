// Etkileşimli geometri tahtası (SVG): dünya koordinatları (y yukarı), ızgara, sürüklenebilir noktalar.
// Her değişiklikte adımın çizim fonksiyonu baştan çalışır. Sürüklenen noktaların öğeleri kalıcıdır,
// böylece dokunmatik/fare yakalama (pointer capture) sürükleme boyunca korunur.
// Tahta, sahne katmanındaki göstergelerin (.d-etiket-hud) ve grafiklerin (.d-grafikler) altında kalmamak için
// çizim alanını kendiliğinden daraltır.
import { birimVektor, fark, topla, olcekle, dik, uzunluk } from "./geometri.js";
import { stilEkle } from "./stil.js";

const NS = "http://www.w3.org/2000/svg";

export const RENK = {
  kenar: "#e8eef7", soluk: "#8193ad", izgara: "rgba(129,147,173,.13)", eksen: "rgba(169,182,201,.6)",
  turuncu: "#ffb547", mavi: "#4fc3f7", yesil: "#5ad38b", kirmizi: "#ff6b6b", mor: "#b89cff", pembe: "#ff8fc7", sari: "#ffe066",
  zemin: "#0d1522",
};

function s(etiket, oz = {}, ebeveyn) {
  const e = document.createElementNS(NS, etiket);
  for (const [k, v] of Object.entries(oz)) if (v != null && v !== false) e.setAttribute(k, v);
  ebeveyn?.append(e);
  return e;
}

const VARSAYILAN = () => ({
  alan: { xmin: -5, xmax: 5, ymin: -4, ymax: 4 }, alanDar: null,
  bosluk: { ust: 16, alt: 16, sol: 16, sag: 16 }, izgara: 1, eksen: false, eksenSayilari: false,
});

/** Sabit (sürüklenmeyen) küçük çizimler için: sınav görselleri vb. */
export function sekilCiz(kap, ayar, ciz) {
  kap.style.position = "relative";
  const t = tahtaKur(kap, { gomulu: true });
  t.goster(ayar);
  t.ciz(ciz);
  return t;
}

export function tahtaKur(kap, { gomulu = false } = {}) {
  stilEkle();
  const svg = s("svg", { class: "mt-tahta", role: "img", "aria-label": "Geometri tahtası" });
  kap.prepend(svg);
  const kat = { izgara: s("g", {}, svg), dolgu: s("g", {}, svg), cizim: s("g", {}, svg), yazi: s("g", {}, svg), nokta: s("g", {}, svg) };

  let ayar = VARSAYILAN();
  let W = 0, H = 0, sc = 1, ox = 0, oy = 0, ic = { xmin: -1, xmax: 1, ymin: -1, ymax: 1 };
  let noktalar = [], cizFn = null, degistiler = [], biraktilar = [];

  function bosluklar() {
    const b = { ...ayar.bosluk };
    // Tam ekran yerleşimde (ders.json → "yerlesim": "tam") paneller tahtanın üstünde yüzer; görünür alan bu değişkenlerle bildirilir
    const st = getComputedStyle(kap), px = (ad) => (gomulu ? 0 : parseFloat(st.getPropertyValue(ad)) || 0);
    b.ust += px("--ust-bosluk"); b.alt += px("--alt-bosluk"); b.sol += px("--sol-bosluk"); b.sag += px("--sag-bosluk");
    const r = kap.getBoundingClientRect();
    const hud = kap.querySelector(".d-katman .d-etiket-hud");
    if (hud && hud.offsetHeight) b.ust = Math.max(b.ust, hud.getBoundingClientRect().bottom - r.top + 12);
    const graf = kap.querySelector(".d-katman .d-grafikler, .d-katman .mt-yuzen");
    if (graf && graf.offsetHeight) b.alt = Math.max(b.alt, r.bottom - graf.getBoundingClientRect().top + 10);
    return b;
  }

  function olcu() {
    W = kap.clientWidth; H = kap.clientHeight;
    if (!W || !H) return false;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const a = (W < 560 && ayar.alanDar) || ayar.alan, b = bosluklar();
    const gw = Math.max(40, W - b.sol - b.sag), gh = Math.max(40, H - b.ust - b.alt);
    sc = Math.min(gw / (a.xmax - a.xmin), gh / (a.ymax - a.ymin));
    ox = b.sol + gw / 2 - ((a.xmin + a.xmax) / 2) * sc;
    oy = b.ust + gh / 2 + ((a.ymin + a.ymax) / 2) * sc;
    ic = { xmin: (b.sol + 6 - ox) / sc, xmax: (W - b.sag - 6 - ox) / sc, ymin: (oy - (H - b.alt - 6)) / sc, ymax: (oy - b.ust - 6) / sc };
    svg.dataset.donusum = `${ox},${oy},${sc}`; // duman testleri dünya → ekran dönüşümü için okur
    return true;
  }
  const X = (x) => ox + x * sc, Y = (y) => oy - y * sc;
  const E = (p) => [X(p.x), Y(p.y)];

  /* ---------- Izgara ---------- */
  function izgaraCiz() {
    kat.izgara.replaceChildren();
    const adim = ayar.izgara;
    const x0 = -ox / sc, x1 = (W - ox) / sc, y0 = (oy - H) / sc, y1 = oy / sc;
    if (adim) {
      const yol = [];
      for (let x = Math.ceil(x0 / adim) * adim; x <= x1; x += adim) yol.push(`M${X(x).toFixed(1)} 0V${H}`);
      for (let y = Math.ceil(y0 / adim) * adim; y <= y1; y += adim) yol.push(`M0 ${Y(y).toFixed(1)}H${W}`);
      s("path", { d: yol.join(""), stroke: RENK.izgara, "stroke-width": 1, fill: "none" }, kat.izgara);
    }
    if (ayar.eksen) {
      const ok = (x1_, y1_, x2_, y2_) => s("line", { x1: x1_, y1: y1_, x2: x2_, y2: y2_, stroke: RENK.eksen, "stroke-width": 1.6 }, kat.izgara);
      ok(0, Y(0), W, Y(0)); ok(X(0), 0, X(0), H);
      s("text", { x: W - 10, y: Y(0) - 10, fill: RENK.soluk, "font-size": 14, "text-anchor": "end" }, kat.izgara).textContent = "x";
      s("text", { x: X(0) + 10, y: 16, fill: RENK.soluk, "font-size": 14 }, kat.izgara).textContent = "y";
      if (ayar.eksenSayilari) {
        const ea = ayar.eksenSayilari === true ? 1 : ayar.eksenSayilari;
        for (let x = Math.ceil(x0 / ea) * ea; x <= x1; x += ea) {
          if (Math.abs(x) < 1e-9) continue;
          s("line", { x1: X(x), y1: Y(0) - 4, x2: X(x), y2: Y(0) + 4, stroke: RENK.eksen }, kat.izgara);
          s("text", { x: X(x), y: Y(0) + 18, fill: RENK.soluk, "font-size": 13, "text-anchor": "middle" }, kat.izgara).textContent = String(+x.toFixed(2)).replace(".", ",").replace("-", "−");
        }
        for (let y = Math.ceil(y0 / ea) * ea; y <= y1; y += ea) {
          if (Math.abs(y) < 1e-9) continue;
          s("line", { x1: X(0) - 4, y1: Y(y), x2: X(0) + 4, y2: Y(y), stroke: RENK.eksen }, kat.izgara);
          s("text", { x: X(0) - 8, y: Y(y) + 4, fill: RENK.soluk, "font-size": 13, "text-anchor": "end" }, kat.izgara).textContent = String(+y.toFixed(2)).replace(".", ",").replace("-", "−");
        }
      }
    }
  }

  /* ---------- Çizim bağlamı (adımların çizim fonksiyonu kullanır) ---------- */
  const cizgi = (o, renk) => ({
    stroke: o.renk || renk, "stroke-width": o.kalinlik ?? 2.5, "stroke-linecap": "round", "stroke-linejoin": "round",
    "stroke-dasharray": o.kesikli ? (o.kesikli === true ? "7 6" : o.kesikli) : null, opacity: o.opaklik, fill: "none",
  });
  const uzat = () => (W + H) * 3 / sc;
  const c = {
    get olcek() { return sc; },
    X, Y,
    parca(p, q, o = {}) {
      const [x1, y1] = E(p), [x2, y2] = E(q);
      return s("line", { x1, y1, x2, y2, ...cizgi(o, RENK.kenar) }, kat.cizim);
    },
    /** p ve q'dan geçen sonsuz doğru */
    dogru(p, q, o = {}) {
      const d = birimVektor(fark(q, p));
      if (!uzunluk(fark(q, p))) return null;
      return c.parca(topla(p, olcekle(d, -uzat())), topla(p, olcekle(d, uzat())), { kalinlik: 1.6, ...o });
    },
    /** p'den başlayıp q'dan geçen ışın */
    isin(p, q, o = {}) {
      const d = birimVektor(fark(q, p));
      return c.parca(p, topla(p, olcekle(d, uzat())), { kalinlik: 1.6, ...o });
    },
    cokgen(liste, o = {}) {
      const pts = liste.map((p) => E(p).map((v) => v.toFixed(1)).join(",")).join(" ");
      return s("polygon", {
        points: pts, fill: o.dolgu || "none", stroke: o.renk === null ? "none" : o.renk || RENK.kenar,
        "stroke-width": o.kalinlik ?? 2.5, "stroke-linejoin": "round", "stroke-dasharray": o.kesikli ? "7 6" : null, opacity: o.opaklik,
      }, kat.dolgu);
    },
    cember(m, r, o = {}) {
      const [cx, cy] = E(m);
      return s("circle", { cx, cy, r: Math.max(0, r * sc), ...cizgi(o, RENK.kenar), fill: o.dolgu || "none" }, o.dolgu ? kat.dolgu : kat.cizim);
    },
    nokta(p, o = {}) {
      const [cx, cy] = E(p);
      return s("circle", { cx, cy, r: o.r ?? 5, fill: o.renk || RENK.kenar, stroke: RENK.zemin, "stroke-width": 1.5 }, kat.yazi);
    },
    /** Yazı: p'ye göre dx, dy piksel kaydırılmış */
    yazi(p, metin, o = {}) {
      const [x, y] = E(p);
      const t = s("text", {
        x: x + (o.dx || 0), y: y + (o.dy || 0), fill: o.renk || RENK.kenar, "font-size": o.boyut ?? 15,
        "font-weight": o.kalin ? 700 : 500, "text-anchor": o.hiza || "middle", "dominant-baseline": "middle",
        "font-style": o.egik ? "italic" : null, opacity: o.opaklik,
      }, kat.yazi);
      t.textContent = metin;
      return t;
    },
    /** Kenarın ortasına, `uzak` noktasının ters tarafına yazı (üçgen kenar uzunlukları için) */
    kenarYazisi(p, q, metin, o = {}) {
      const m = topla(p, olcekle(fark(q, p), 0.5));
      let n = birimVektor(dik(fark(q, p)));
      if (o.uzak && (n.x * (o.uzak.x - m.x) + n.y * (o.uzak.y - m.y)) > 0) n = olcekle(n, -1);
      const px = o.mesafe ?? 16;
      return c.yazi(m, metin, { ...o, dx: n.x * px, dy: -n.y * px });
    },
    /** B köşesinde BA'dan BC'ye açı yayı (küçük açı). r piksel. */
    aci(A, B, C, o = {}) {
      const [bx, by] = E(B), [ax, ay] = E(A), [cx, cy] = E(C);
      let u = [ax - bx, ay - by], v = [cx - bx, cy - by];
      const lu = Math.hypot(...u), lv = Math.hypot(...v);
      if (lu < 1 || lv < 1) return;
      u = [u[0] / lu, u[1] / lu]; v = [v[0] / lv, v[1] / lv];
      const r = o.r ?? 30;
      const tarama = u[0] * v[1] - u[1] * v[0] > 0 ? 1 : 0;
      const renk = o.renk || RENK.turuncu;
      const yol = `M${bx} ${by}L${bx + u[0] * r} ${by + u[1] * r}A${r} ${r} 0 0 ${tarama} ${bx + v[0] * r} ${by + v[1] * r}Z`;
      s("path", { d: yol, fill: o.dolgu ?? renk, "fill-opacity": o.dolgu === "none" ? null : 0.22, stroke: "none" }, kat.dolgu);
      s("path", { d: `M${bx + u[0] * r} ${by + u[1] * r}A${r} ${r} 0 0 ${tarama} ${bx + v[0] * r} ${by + v[1] * r}`, ...cizgi({ kalinlik: 2, ...o }, renk) }, kat.cizim);
      if (o.etiket) {
        let m = [u[0] + v[0], u[1] + v[1]];
        const lm = Math.hypot(...m) || 1;
        m = lm < 0.05 ? [-u[1], u[0]] : [m[0] / lm, m[1] / lm];
        const t = s("text", {
          x: bx + m[0] * (r + (o.etiketPay ?? 16)), y: by + m[1] * (r + (o.etiketPay ?? 16)), fill: renk, "font-size": o.boyut ?? 15, "font-weight": 600,
          "text-anchor": "middle", "dominant-baseline": "middle",
        }, kat.yazi);
        t.textContent = o.etiket;
      }
    },
    /** B köşesinde dik açı işareti */
    dikAci(A, B, C, o = {}) {
      const [bx, by] = E(B), [ax, ay] = E(A), [cx, cy] = E(C);
      const k = o.boyut ?? 13;
      const lu = Math.hypot(ax - bx, ay - by), lv = Math.hypot(cx - bx, cy - by);
      if (lu < 1 || lv < 1) return;
      const u = [(ax - bx) / lu * k, (ay - by) / lu * k], v = [(cx - bx) / lv * k, (cy - by) / lv * k];
      s("path", { d: `M${bx + u[0]} ${by + u[1]}L${bx + u[0] + v[0]} ${by + u[1] + v[1]}L${bx + v[0]} ${by + v[1]}`, ...cizgi({ kalinlik: 1.8, ...o }, RENK.kenar) }, kat.cizim);
    },
    /** Eş uzunluk çentikleri (n adet) */
    centik(p, q, n = 1, o = {}) {
      const [px, py] = E(p), [qx, qy] = E(q);
      const L = Math.hypot(qx - px, qy - py);
      if (L < 10) return;
      const d = [(qx - px) / L, (qy - py) / L], nn = [-d[1] * 7, d[0] * 7];
      const mx = (px + qx) / 2, my = (py + qy) / 2;
      for (let i = 0; i < n; i++) {
        const k = (i - (n - 1) / 2) * 5;
        s("line", { x1: mx + d[0] * k - nn[0], y1: my + d[1] * k - nn[1], x2: mx + d[0] * k + nn[0], y2: my + d[1] * k + nn[1], ...cizgi({ kalinlik: 2, ...o }, RENK.kenar) }, kat.cizim);
      }
    },
    /** Merkezi m, dünya yarıçapı r olan yay: t0'dan t1'e (derece, matematik yönü). ok: uçta ok başı */
    yay(m, r, t0, t1, o = {}) {
      const R = r * sc, [mx, my] = E(m);
      const nok = (t) => [mx + R * Math.cos(t * Math.PI / 180), my - R * Math.sin(t * Math.PI / 180)];
      if (Math.abs(t1 - t0) < 0.5) return;
      // 360°'yi aşan yaylar iki parçada çizilir
      const parcalar = Math.abs(t1 - t0) > 359 ? [[t0, (t0 + t1) / 2], [(t0 + t1) / 2, t1]] : [[t0, t1]];
      for (const [a0, a1] of parcalar) {
        const [x0, y0] = nok(a0), [x1, y1] = nok(a1);
        const buyuk = Math.abs(a1 - a0) > 180 ? 1 : 0, tarama = a1 > a0 ? 0 : 1;
        s("path", { d: `M${x0} ${y0}A${R} ${R} 0 ${buyuk} ${tarama} ${x1} ${y1}`, ...cizgi(o, RENK.turuncu) }, kat.cizim);
      }
      if (o.ok) {
        const [x1, y1] = nok(t1);
        const yon = t1 > t0 ? 1 : -1, tr = t1 * Math.PI / 180;
        const tg = [-Math.sin(tr) * yon, -Math.cos(tr) * yon]; // ekranda teğet
        const nn = [Math.cos(tr), -Math.sin(tr)];
        const k = 9;
        s("path", { d: `M${x1 + tg[0] * k} ${y1 + tg[1] * k}L${x1 - tg[0] * 2 + nn[0] * k * 0.6} ${y1 - tg[1] * 2 + nn[1] * k * 0.6}L${x1 - tg[0] * 2 - nn[0] * k * 0.6} ${y1 - tg[1] * 2 - nn[1] * k * 0.6}Z`, fill: o.renk || RENK.turuncu }, kat.cizim);
      }
    },
    /** Serbest SVG yolu (dünya noktalarından) */
    yol(liste, o = {}) {
      const d = liste.map((p, i) => `${i ? "L" : "M"}${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)}`).join("") + (o.kapali ? "Z" : "");
      return s("path", { d, ...cizgi(o, RENK.kenar), fill: o.dolgu || "none" }, o.dolgu ? kat.dolgu : kat.cizim);
    },
  };

  /* ---------- Sürüklenebilir noktalar ---------- */
  function noktalariYerlestir() {
    const gorunen = noktalar.filter((n) => !n.gizli);
    const mx = gorunen.reduce((t, n) => t + n.x, 0) / (gorunen.length || 1);
    const my = gorunen.reduce((t, n) => t + n.y, 0) / (gorunen.length || 1);
    for (const n of noktalar) {
      n._g.style.display = n.gizli ? "none" : "";
      n._g.setAttribute("transform", `translate(${X(n.x).toFixed(1)} ${Y(n.y).toFixed(1)})`);
      let [dx, dy] = n.etiketKonum || [0, 0];
      if (!n.etiketKonum) {
        const v = [X(n.x) - X(mx), Y(n.y) - Y(my)];
        const L = Math.hypot(...v);
        [dx, dy] = gorunen.length > 1 && L > 2 ? [v[0] / L * 24, v[1] / L * 24] : [16, -18];
      }
      n._yazi.setAttribute("x", dx.toFixed(1));
      n._yazi.setAttribute("y", dy.toFixed(1));
    }
  }

  function sinirla(p) {
    return { x: Math.min(ic.xmax, Math.max(ic.xmin, p.x)), y: Math.min(ic.ymax, Math.max(ic.ymin, p.y)) };
  }

  function tasi(n, p, sessiz) {
    let q = sinirla(p);
    if (n.kisit) { q = n.kisit(q, n); if (!q) return; }
    if (Math.abs(q.x - n.x) < 1e-9 && Math.abs(q.y - n.y) < 1e-9) return;
    n.x = q.x; n.y = q.y;
    if (!sessiz) for (const fn of degistiler) fn(n);
    ciz();
  }

  function nokta(ad, o = {}) {
    const n = {
      ad, x: o.x ?? 0, y: o.y ?? 0, renk: o.renk || RENK.turuncu, etiket: o.etiket ?? ad, kisit: o.kisit || null,
      gizli: !!o.gizli, etiketKonum: o.etiketKonum || null, adim: o.adim,
    };
    const g = s("g", { class: "mt-tut", tabindex: 0, "data-nokta": ad, role: "button", "aria-label": `${n.etiket} noktası: sürükle ya da ok tuşlarıyla taşı` }, kat.nokta);
    s("circle", { r: 24, fill: "rgba(255,255,255,0)" }, g);
    s("circle", { r: 14, fill: "none", stroke: n.renk, "stroke-width": 2, opacity: 0.5, class: "mt-halka" }, g);
    s("circle", { r: 7.5, fill: n.renk, stroke: RENK.zemin, "stroke-width": 2 }, g);
    const yazi = s("text", { "font-size": 18, "font-weight": 700, fill: n.renk, "text-anchor": "middle", "dominant-baseline": "middle" }, g);
    yazi.textContent = n.etiket;
    n._g = g; n._yazi = yazi;

    let basili = false;
    const dunyada = (e) => {
      const r = svg.getBoundingClientRect();
      return { x: (e.clientX - r.left - ox) / sc, y: (oy - (e.clientY - r.top)) / sc };
    };
    g.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      basili = true;
      try { g.setPointerCapture(e.pointerId); } catch { /* bazı tarayıcılarda gerekmez */ }
      g.classList.add("mt-basili");
    });
    g.addEventListener("pointermove", (e) => { if (basili) tasi(n, dunyada(e)); });
    const birak = () => {
      if (!basili) return;
      basili = false;
      g.classList.remove("mt-basili");
      for (const fn of biraktilar) fn(n);
    };
    g.addEventListener("pointerup", birak);
    g.addEventListener("pointercancel", birak);
    g.addEventListener("lostpointercapture", birak);
    g.addEventListener("keydown", (e) => {
      const yon = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (!yon) return;
      e.preventDefault(); e.stopPropagation(); // ders kabuğunun ok tuşu ile adım değiştirmesini engelle
      const adim = n.adim ?? 8 / sc;
      tasi(n, { x: n.x + yon[0] * adim, y: n.y + yon[1] * adim });
      for (const fn of biraktilar) fn(n);
    });
    n.ayarla = (x, y, sessiz = false) => tasi(n, { x, y }, sessiz);
    n.goster = (acik) => { n.gizli = !acik; ciz(); };
    noktalar.push(n);
    ciz();
    return n;
  }

  /* ---------- Yeniden çizim ---------- */
  let bekleyen = false;
  function ciz() {
    if (!olcu()) return;
    kat.dolgu.replaceChildren(); kat.cizim.replaceChildren(); kat.yazi.replaceChildren();
    izgaraCiz();
    if (cizFn) {
      try { cizFn(c); } catch (e) { console.error(e); }
    }
    noktalariYerlestir();
  }
  /** Bir sonraki karede yeniden çiz (katmana eklenen gösterge/grafikler yerleştikten sonra) */
  function sonraCiz() {
    if (bekleyen) return;
    bekleyen = true;
    requestAnimationFrame(() => { bekleyen = false; ciz(); });
  }
  new ResizeObserver(() => ciz()).observe(kap);
  if (!gomulu) window.addEventListener("d-yerlesim", () => ciz());

  return {
    svg, RENK,
    /** Görünür bölgeyi ve ızgarayı ayarlar */
    goster(o = {}) {
      const v = VARSAYILAN();
      ayar = { ...v, ...o, bosluk: { ...v.bosluk, ...(o.bosluk || {}) } };
      ciz(); sonraCiz();
      setTimeout(ciz, 120);
    },
    /** Adım değişince: noktaları, çizim fonksiyonunu ve dinleyicileri temizler */
    sifirla() {
      for (const n of noktalar) n._g.remove();
      noktalar = []; cizFn = null; degistiler = []; biraktilar = [];
      ayar = VARSAYILAN();
      svg.style.display = "";
      ciz();
    },
    nokta,
    ciz(fn) { cizFn = fn; ciz(); },
    yenile: ciz,
    /** Herhangi bir nokta sürüklenince (her hareket) */
    degisti(fn) { degistiler.push(fn); },
    /** Sürükleme bırakılınca */
    birakti(fn) { biraktilar.push(fn); },
    gizle(gizli) { svg.style.display = gizli ? "none" : ""; },
    /** Noktaların taşınabildiği görünür dünya bölgesi (xmin, xmax, ymin, ymax) */
    gorunur: () => ({ ...ic }),
    get olcek() { return sc; },
  };
}
