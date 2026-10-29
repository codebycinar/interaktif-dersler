// Ortak harita yardımcısı (d3-geo): kırpılmış world-atlas verisinden SVG harita, nokta ve çizgi katmanları.
// Felsefe (Ege/Milet) ve Peygamberimizin Hayatı (Hicaz/Taif) derslerinde kullanılır.
import { geoMercator, geoPath } from "d3-geo";
import { stilEkle } from "./etkilesim.js";

const NS = "http://www.w3.org/2000/svg";
const s = (ad, oz = {}, ...c) => {
  const e = document.createElementNS(NS, ad);
  for (const [k, v] of Object.entries(oz)) if (v != null) e.setAttribute(k, v);
  for (const x of c) e.append(x);
  return e;
};

const CSS = `
.ok-harita{position:relative;width:100%;border:1px solid var(--cizgi);border-radius:var(--radius);overflow:hidden;background:#0d2438}
.ok-harita svg{display:block;width:100%;height:100%}
.ok-harita .kara{fill:#2a3a2c;stroke:#56705a;stroke-width:.8}
.ok-harita .kara.vurgu{fill:#3b4a2f}
.ok-harita .nokta-ad{font-size:12.5px;font-weight:700;fill:#fff;paint-order:stroke;stroke:#0b1520;stroke-width:3.5px}
.ok-harita .nokta-alt{font-size:11px;fill:#cfd8e3;paint-order:stroke;stroke:#0b1520;stroke-width:3px}
.ok-harita .deniz-ad{font-size:12px;fill:#7fb3d9;font-style:italic;letter-spacing:.08em}
.ok-harita .etiket-not{font-size:11px;fill:#a9b6c9}
.ok-harita .nokta{cursor:pointer}
.ok-harita .nokta.secili circle{stroke:var(--vurgu);stroke-width:3}
.ok-harita .yol{fill:none;stroke-linecap:round;stroke-linejoin:round}
.ok-olcek{position:absolute;left:10px;bottom:8px;font-size:11px;color:#cfd8e3;background:rgba(11,21,32,.7);padding:2px 6px;border-radius:6px}
.ok-harita-not{position:absolute;right:8px;bottom:8px;font-size:11px;color:#cfd8e3;background:rgba(11,21,32,.7);padding:2px 6px;border-radius:6px;max-width:60%;text-align:right}`;

/** İki nokta arası büyük daire uzaklığı (km) */
export function uzaklikKm([lon1, lat1], [lon2, lat2]) {
  const R = 6371, r = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * veri: GeoJSON FeatureCollection · kutu: [lon0, lat0, lon1, lat1]
 * noktalar: [{ id, ad, alt?, lon, lat, renk?, yon?: "sag"|"sol"|"ust"|"alt" }]
 * denizler: [{ ad, lon, lat }] · not: sağ alttaki açıklama (ör. "Güzergâh yaklaşıktır")
 */
export function harita({ kap, veri, kutu, yukseklik = 300, noktalar = [], denizler = [], vurgu = [], not, secildi, temizlik, olcekKm }) {
  stilEkle("ok-harita-stil", CSS);
  const sar = document.createElement("div");
  sar.className = "ok-harita";
  sar.style.height = `${yukseklik}px`;
  kap.append(sar);
  let projeksiyon, secili = null;
  const cizgiler = [];
  const katman = { cizgi: null };

  function ciz() {
    const W = Math.max(280, sar.clientWidth || 600), H = yukseklik;
    const [x0, y0, x1, y1] = kutu;
    const cerceve = { type: "MultiPoint", coordinates: [[x0, y0], [x1, y1], [x0, y1], [x1, y0]] };
    projeksiyon = geoMercator().fitExtent([[8, 8], [W - 8, H - 8]], cerceve);
    const yol = geoPath(projeksiyon);
    const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Harita" });
    const kara = s("g");
    for (const f of veri.features) kara.append(s("path", { class: `kara${vurgu.includes(f.properties.ad) ? " vurgu" : ""}`, d: yol(f) }));
    svg.append(kara);
    for (const d of denizler) {
      const [x, y] = projeksiyon([d.lon, d.lat]);
      svg.append(s("text", { class: "deniz-ad", x, y, "text-anchor": "middle", transform: d.aci ? `rotate(${d.aci} ${x} ${y})` : null }, d.ad));
    }
    katman.cizgi = s("g");
    svg.append(katman.cizgi);
    for (const c of cizgiler) cizgiCiz(c);
    const nk = s("g");
    for (const n of noktalar) {
      if (n.gizli) continue;
      const [x, y] = projeksiyon([n.lon, n.lat]);
      const yon = n.yon || "sag";
      const dx = yon === "sag" ? 9 : yon === "sol" ? -9 : 0, dy = yon === "ust" ? -10 : yon === "alt" ? 18 : 4;
      const anchor = yon === "sag" ? "start" : yon === "sol" ? "end" : "middle";
      const g = s("g", { class: `nokta${n.id === secili ? " secili" : ""}`, "data-nokta": n.id, tabindex: secildi ? 0 : null },
        s("circle", { cx: x, cy: y, r: n.r || 6, fill: n.renk || "#ffb547", stroke: "#0b1520", "stroke-width": 2 }),
        s("text", { class: "nokta-ad", x: x + dx, y: y + dy, "text-anchor": anchor }, n.ad));
      if (n.alt) g.append(s("text", { class: "nokta-alt", x: x + dx, y: y + dy + 13, "text-anchor": anchor }, n.alt));
      if (secildi) {
        g.addEventListener("click", () => { secili = n.id; ciz(); secildi(n); });
        g.addEventListener("keydown", (e) => e.key === "Enter" && (secili = n.id, ciz(), secildi(n)));
      }
      nk.append(g);
    }
    svg.append(nk);
    const parcalar = [svg];
    if (olcekKm) {
      // ölçek çubuğu: kutu ortasındaki enlemde olcekKm uzunluk
      const latm = (y0 + y1) / 2, lonm = (x0 + x1) / 2;
      const dlon = olcekKm / (111.32 * Math.cos((latm * Math.PI) / 180));
      const [ax] = projeksiyon([lonm, latm]), [bx] = projeksiyon([lonm + dlon, latm]);
      const o = document.createElement("div");
      o.className = "ok-olcek";
      o.innerHTML = `<span style="display:inline-block;width:${Math.round(bx - ax)}px;height:4px;background:#cfd8e3;vertical-align:middle;margin-right:6px"></span>${olcekKm} km`;
      parcalar.push(o);
    }
    if (not) { const nn = document.createElement("div"); nn.className = "ok-harita-not"; nn.textContent = not; parcalar.push(nn); }
    sar.replaceChildren(...parcalar);
  }
  function cizgiCiz(c) {
    const p = c.noktalar.map((q) => projeksiyon(q));
    const d = p.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join("");
    const yolEl = s("path", { class: "yol", d, stroke: c.renk || "#ffb547", "stroke-width": c.kalinlik || 3, "stroke-dasharray": c.kesikli ? "7 6" : null, opacity: c.saydam ?? 1 });
    katman.cizgi.append(yolEl);
    if (c.ilerleme != null) {
      const L = yolEl.getTotalLength?.() || 0;
      yolEl.style.strokeDasharray = `${L * c.ilerleme} ${L}`;
    }
  }
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => ciz()) : null;
  ro?.observe(sar);
  temizlik?.(() => ro?.disconnect());
  ciz();
  return {
    el: sar,
    cizgiEkle(c) { cizgiler.push(c); ciz(); return c; },
    cizgileriTemizle() { cizgiler.length = 0; ciz(); },
    noktaGoster(id, acik = true) { const n = noktalar.find((q) => q.id === id); if (n) { n.gizli = !acik; ciz(); } },
    sec(id) { secili = id; ciz(); },
    yenile: ciz,
  };
}
