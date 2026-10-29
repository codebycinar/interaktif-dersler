// Tarih şeridi: sürüklenebilir yıl göstergesi + olay işaretleri. Sahnenin altına yerleşir.
import { el } from "../../../../engine/ders.js";
import { stilEkle } from "./bilesenler.js";

const CSS = `
.hrt-serit { position: absolute; left: 12px; right: 12px; bottom: 12px; height: 92px; padding: 8px 40px 6px;
  background: rgba(13, 19, 30, .9); border: 1px solid var(--cizgi); border-radius: 12px; touch-action: none; cursor: pointer; user-select: none; }
body.d-gosterimde .hrt-serit { display: none; }
.hrt-serit:focus-visible { outline: 2px solid var(--vurgu); }
.hrt-serit-ic { position: relative; height: 100%; }
.hrt-serit-hat { position: absolute; left: 0; right: 0; top: 46px; height: 4px; border-radius: 2px; background: var(--cizgi); }
.hrt-serit-dolu { position: absolute; left: 0; top: 46px; height: 4px; border-radius: 2px; background: var(--vurgu); }
.hrt-serit-cizgi { position: absolute; top: 52px; width: 1px; height: 6px; background: #5d6f88; }
.hrt-serit-yil { position: absolute; top: 60px; transform: translateX(-50%); font: 11px var(--mono); color: var(--metin-2); }
.hrt-serit-olay { position: absolute; top: 41px; width: 14px; height: 14px; margin-left: -7px; border-radius: 50%;
  background: var(--panel-2); border: 2px solid #7d8ea8; }
.hrt-serit-olay.gecti { background: var(--renk, var(--vurgu)); border-color: #0b1522; }
.hrt-serit-olay.savas { border-radius: 3px; transform: rotate(45deg); }
.hrt-serit-ad { position: absolute; transform: translateX(-50%); font-size: 11px; line-height: 1.1; white-space: nowrap; color: var(--metin-2); }
.hrt-serit-ad.ust { top: 0; } .hrt-serit-ad.orta { top: 18px; }
.hrt-serit-ad.gecti { color: var(--metin); font-weight: 600; }
.hrt-serit-tutamak { position: absolute; top: 34px; width: 4px; height: 28px; margin-left: -2px; border-radius: 2px; background: #fff; box-shadow: 0 0 0 3px rgba(255,181,71,.5); }
.hrt-serit-deger { position: absolute; top: 74px; transform: translateX(-50%); font: 700 13px var(--mono); color: var(--vurgu); background: rgba(13,19,30,.95); padding: 0 4px; border-radius: 4px; }
@media (max-width: 760px) {
  .hrt-serit { left: 6px; right: 6px; bottom: 6px; height: 74px; padding: 4px 12px; }
  .hrt-serit-ad, .hrt-serit-yil.tek { display: none; }
  .hrt-serit-hat, .hrt-serit-dolu { top: 30px; } .hrt-serit-olay { top: 25px; } .hrt-serit-tutamak { top: 18px; }
  .hrt-serit-cizgi { top: 36px; } .hrt-serit-yil { top: 42px; } .hrt-serit-deger { top: 54px; }
}
`;

/**
 * kap: sahne katmanı. olaylar: [{ yil, kisa, savas?, renk? }]
 * degisti(yil) her değişimde çağrılır. Dönen nesne: { el, deger, olaylariAyarla }
 */
export function seritKur(kap, { min, max, deger = min, olaylar = [], degisti, aralik = 20 }) {
  stilEkle("hrt-serit-stil", CSS);
  const ic = el("div", { class: "hrt-serit-ic" });
  const kok = el("div", { class: "hrt-serit", tabindex: 0, role: "slider", "aria-label": "Yıl", "aria-valuemin": min, "aria-valuemax": max }, ic);
  kap.append(kok);
  const yuzde = (y) => `${((y - min) / (max - min)) * 100}%`;
  const dolu = el("div", { class: "hrt-serit-dolu" });
  const tutamak = el("div", { class: "hrt-serit-tutamak" });
  const degerEl = el("div", { class: "hrt-serit-deger" });
  ic.append(el("div", { class: "hrt-serit-hat" }), dolu);
  let sira = 0;
  for (let y = Math.ceil(min / aralik) * aralik; y <= max; y += aralik, sira++) {
    ic.append(el("div", { class: "hrt-serit-cizgi", style: `left:${yuzde(y)}` }), el("div", { class: `hrt-serit-yil${sira % 2 ? " tek" : ""}`, style: `left:${yuzde(y)}` }, String(y)));
  }
  let olayEl = [];
  function olaylariAyarla(liste) {
    olayEl.forEach(([a, b]) => { a.remove(); b?.remove(); });
    // yakın olayların adlarını iki satıra dağıt
    let sonUst = -Infinity, sonOrta = -Infinity;
    olayEl = liste.map((o) => {
      const nokta = el("div", { class: `hrt-serit-olay${o.savas ? " savas" : ""}`, style: `left:${yuzde(o.yil)};${o.renk ? `--renk:${o.renk}` : ""}`, title: `${o.yil} ${o.kisa}` });
      let satir = "ust";
      if (o.yil - sonUst < (max - min) * 0.09) satir = o.yil - sonOrta < (max - min) * 0.09 ? null : "orta";
      if (satir === "ust") sonUst = o.yil; else if (satir === "orta") sonOrta = o.yil;
      const ad = satir ? el("div", { class: `hrt-serit-ad ${satir}`, style: `left:${yuzde(o.yil)}` }, o.kisa) : null;
      ic.append(nokta); if (ad) ic.append(ad);
      return [nokta, ad, o];
    });
    ic.append(tutamak, degerEl);
    boya();
  }
  let simdi = deger;
  function boya() {
    dolu.style.width = yuzde(simdi);
    tutamak.style.left = yuzde(simdi);
    degerEl.style.left = yuzde(simdi);
    degerEl.textContent = String(simdi);
    kok.setAttribute("aria-valuenow", simdi);
    for (const [n, a, o] of olayEl) { n.classList.toggle("gecti", o.yil <= simdi); a?.classList.toggle("gecti", o.yil <= simdi); }
  }
  function ayarla(y, bildir = true) {
    const yeni = Math.max(min, Math.min(max, Math.round(y)));
    if (yeni === simdi && bildir) return;
    simdi = yeni; boya();
    if (bildir) degisti?.(simdi);
  }
  const konumdan = (e) => {
    const r = ic.getBoundingClientRect();
    return min + ((e.clientX - r.left) / r.width) * (max - min);
  };
  let basili = false;
  kok.addEventListener("pointerdown", (e) => { basili = true; try { kok.setPointerCapture(e.pointerId); } catch { /* yapay olay */ } ayarla(konumdan(e)); });
  kok.addEventListener("pointermove", (e) => basili && ayarla(konumdan(e)));
  kok.addEventListener("pointerup", () => (basili = false));
  kok.addEventListener("pointercancel", () => (basili = false));
  kok.addEventListener("keydown", (e) => {
    const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[e.key];
    if (d) { e.preventDefault(); e.stopPropagation(); ayarla(simdi + d); }
  });
  olaylariAyarla(olaylar);
  return {
    el: kok,
    get deger() { return simdi; },
    set deger(v) { ayarla(v, false); },
    ayarla,
    olaylariAyarla,
  };
}
