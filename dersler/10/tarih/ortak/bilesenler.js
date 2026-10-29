// Tarih ve coğrafya derslerinin ortak etkinlik bileşenleri: sahne üstü tahta, eşleştirme,
// sınıflandırma (kart destesi), sıralama. Kabukta (engine/) olmadıkları için burada; motora aday.
// Stiller ilk kullanımda <head>'e eklenir; böylece başka ders klasöründen import edilince de çalışır.
import { el } from "../../../../engine/ders.js";

export function stilEkle(id, css) {
  if (document.getElementById(id)) return;
  document.head.append(el("style", { id }, css));
}

export const karistir = (dizi) => dizi.map((v) => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

const CSS = `
.hrt-tahta { position: absolute; display: flex; flex-direction: column; gap: 10px; overflow-y: auto;
  background: rgba(13, 19, 30, .93); border: 1px solid var(--cizgi); border-radius: 14px; padding: 14px 16px;
  box-shadow: 0 14px 40px rgba(0,0,0,.4); }
.hrt-tahta.tam { top: 12px; left: 12px; right: 12px; max-height: calc(100% - 24px); }
.hrt-tahta.ust { top: 12px; left: 12px; right: 12px; max-height: 58%; }
.hrt-tahta.alt { bottom: 12px; left: 12px; right: 12px; max-height: 50%; }
.hrt-tahta.sag { top: 12px; right: 12px; bottom: 12px; width: min(420px, 48%); }
.hrt-tahta.serit-ustu { bottom: 116px; }
.hrt-tahta > * { flex-shrink: 0; }
/* anlatım (gösterim) sırasında alıştırma kartları gizlenir */
body.d-gosterimde .hrt-tahta { display: none; }
.hrt-tahta > h3 { margin: 0; font-size: 16px; color: var(--vurgu); letter-spacing: .02em; }
.hrt-geri { font-size: 14px; min-height: 1.4em; }
.hrt-geri.dogru { color: var(--yesil); } .hrt-geri.yanlis { color: var(--kirmizi); }
.hrt-kart { text-align: left; cursor: pointer; border-radius: 10px; padding: 8px 11px; font-size: 14px; line-height: 1.35;
  background: var(--panel-2); border: 1.5px solid var(--cizgi); color: var(--metin); font-weight: 500; }
.hrt-kart:hover:not(:disabled) { border-color: var(--metin-2); }
.hrt-kart small { display: block; color: var(--metin-2); font-size: 12px; margin-top: 2px; }
.hrt-kart.secili { border-color: var(--vurgu); background: rgba(255,181,71,.12); }
.hrt-kart.tamam { border-color: var(--yesil); background: rgba(90,211,139,.10); cursor: default; }
.hrt-kart.yanlis { animation: hrt-salla .35s; border-color: var(--kirmizi); }
.hrt-kart:disabled { cursor: default; }
@keyframes hrt-salla { 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
.hrt-eslestir { display: grid; grid-template-columns: 1fr 1.35fr; gap: 10px 14px; align-items: start; }
.hrt-eslestir .hrt-sutun { display: flex; flex-direction: column; gap: 7px; }
.hrt-eslestir .hrt-sutun > b { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--metin-2); }
.hrt-cift { display: inline-grid; place-items: center; min-width: 20px; height: 20px; border-radius: 50%; margin-right: 6px;
  background: var(--yesil); color: #0b2416; font-size: 11px; font-weight: 800; vertical-align: 1px; }
.hrt-deste { display: flex; flex-direction: column; gap: 10px; }
.hrt-deste-kart { border: 1.5px solid var(--vurgu); border-radius: 12px; padding: 12px 14px; background: rgba(255,181,71,.07);
  font-size: 16px; font-weight: 600; line-height: 1.4; }
.hrt-deste-kart small { display: block; font-weight: 400; color: var(--metin-2); font-size: 12.5px; margin-bottom: 4px; }
.hrt-deste-kart.yanlis { animation: hrt-salla .35s; border-color: var(--kirmizi); }
.hrt-kutu-dugmeleri { display: flex; flex-wrap: wrap; gap: 8px; }
.hrt-kutu-dugmeleri .d-btn { flex: 1 1 120px; }
.hrt-kutular { display: grid; grid-template-columns: repeat(var(--n, 2), minmax(0, 1fr)); gap: 8px; }
.hrt-kutu { border: 1px solid var(--cizgi); border-radius: 10px; padding: 8px; min-height: 60px; background: rgba(23,34,52,.7); }
.hrt-kutu > b { display: block; font-size: 12.5px; margin-bottom: 6px; color: var(--metin-2); }
.hrt-kutu > div { font-size: 12.5px; padding: 4px 7px; margin-top: 4px; border-radius: 7px; background: rgba(90,211,139,.1);
  border-left: 3px solid var(--yesil); line-height: 1.3; }
.hrt-sira-liste { display: flex; flex-direction: column; gap: 6px; counter-reset: sira; }
.hrt-sira-liste > div { display: flex; gap: 8px; align-items: center; padding: 6px 10px; border-radius: 9px;
  background: rgba(90,211,139,.1); border: 1px solid rgba(90,211,139,.5); font-size: 14px; }
.hrt-sira-liste > div::before { counter-increment: sira; content: counter(sira); flex: none; width: 22px; height: 22px;
  border-radius: 50%; display: grid; place-items: center; background: var(--yesil); color: #0b2416; font-weight: 800; font-size: 12px; }
.hrt-havuz { display: flex; flex-wrap: wrap; gap: 8px; }
.hrt-havuz .hrt-kart { flex: 1 1 200px; }
.hrt-ilerleme { font-size: 13px; color: var(--metin-2); }
.hrt-soru { font-size: 15px; line-height: 1.45; }
@media (max-width: 760px) {
  .hrt-tahta { padding: 10px; }
  .hrt-tahta.tam { top: 6px; left: 6px; right: 6px; max-height: calc(100% - 12px); }
  .hrt-tahta.sag { left: 6px; right: 6px; top: auto; bottom: 6px; width: auto; max-height: 55%; }
  .hrt-tahta.sag.serit-ustu { bottom: 86px; max-height: calc(55% - 80px); }
  .hrt-eslestir { grid-template-columns: 1fr; }
  .hrt-kart { font-size: 13px; padding: 6px 9px; }
  .hrt-deste-kart { font-size: 14.5px; }
  .hrt-kutular { grid-template-columns: 1fr 1fr; }
}
`;

/** Harita payı: sağdaki tahta (geniş ekranda) ya da alttaki tahta/şerit (dar ekranda) haritayı kapatmasın */
export const payHesapla = ({ sagTahta = false, serit = false, ustTahta = 0 } = {}) => (W, H) => {
  const genis = W > 760;
  const p = { sag: 0, alt: 0, ust: 0 };
  if (sagTahta) { if (genis) p.sag = Math.min(420, W * 0.48) + 14; else p.alt = H * 0.55 + 6; }
  if (serit) p.alt = Math.max(p.alt, genis ? 104 : 80);
  if (ustTahta) p.ust = H * ustTahta;
  return p;
};

/** Sahnenin üstünde içerik kartı açar; adım değişince katmanla birlikte silinir */
export function tahta(ctx, { baslik, konum = "tam", seritUstu = false } = {}) {
  stilEkle("hrt-bilesen-stil", CSS);
  const t = el("div", { class: `hrt-tahta ${konum}${seritUstu ? " serit-ustu" : ""}` }, baslik ? el("h3", {}, baslik) : null);
  ctx.katman.append(t);
  return t;
}

function geriBildirim() {
  const g = el("div", { class: "hrt-geri", "aria-live": "polite" });
  return {
    el: g,
    yaz(metin, tur = "") { g.className = `hrt-geri ${tur}`; g.innerHTML = metin; },
  };
}

/**
 * Eşleştirme: soldan bir kart, sağdan bir kart seç. Doğru çift kilitlenir ve numaralanır.
 * sol/sag: [{ id, metin, alt? }], cevap: { solId: sagId }
 */
export function eslestirme(kap, { sol, sag, cevap, solBaslik = "", sagBaslik = "", ipucu, eslesti, bitti }) {
  stilEkle("hrt-bilesen-stil", CSS);
  const g = geriBildirim();
  let secSol = null, secSag = null, n = 0;
  const kart = (o, taraf) => el("button", { class: "hrt-kart", "data-id": o.id, "data-taraf": taraf, onclick: (e) => sec(o.id, taraf, e.currentTarget) },
    el("span", { html: o.metin }), o.alt ? el("small", { html: o.alt }) : null);
  const solKartlar = sol.map((o) => kart(o, "sol"));
  const sagKartlar = karistir(sag).map((o) => kart(o, "sag"));
  const kok = el("div", {},
    el("div", { class: "hrt-eslestir" },
      el("div", { class: "hrt-sutun" }, solBaslik ? el("b", {}, solBaslik) : null, solKartlar),
      el("div", { class: "hrt-sutun" }, sagBaslik ? el("b", {}, sagBaslik) : null, sagKartlar)),
    g.el);
  kap.append(kok);

  function sec(id, taraf, b) {
    if (b.classList.contains("tamam")) return;
    const liste = taraf === "sol" ? solKartlar : sagKartlar;
    liste.forEach((k) => k.classList.toggle("secili", k === b));
    if (taraf === "sol") secSol = id; else secSag = id;
    if (secSol == null || secSag == null) return;
    const sk = solKartlar.find((k) => k.dataset.id === secSol), gk = sagKartlar.find((k) => k.dataset.id === secSag);
    if (cevap[secSol] === secSag) {
      n++;
      for (const k of [sk, gk]) { k.classList.remove("secili"); k.classList.add("tamam"); k.disabled = true; k.prepend(el("span", { class: "hrt-cift" }, String(n))); }
      g.yaz(`Doğru eşleştirme (${n}/${sol.length}).`, "dogru");
      eslesti?.(secSol, secSag, n);
      if (n === sol.length) bitti?.();
    } else {
      for (const k of [sk, gk]) { k.classList.remove("secili", "yanlis"); void k.offsetWidth; k.classList.add("yanlis"); }
      g.yaz(ipucu?.(secSol, secSag) || "Bu ikisi eşleşmiyor. Tekrar dene.", "yanlis");
    }
    secSol = secSag = null;
  }
  return { el: kok, get tamamlanan() { return n; } };
}

/**
 * Sınıflandırma destesi: kartlar tek tek gelir, öğrenci doğru kutuyu seçer.
 * kutular: [{ id, ad }], ogeler: [{ id, metin, kutu, aciklama?, ipucu?, alt? }]
 */
export function siniflandirma(kap, { kutular, ogeler, soru = "Bu kart hangi kutuya ait?", sirali = false, yerlesti, bitti }) {
  stilEkle("hrt-bilesen-stil", CSS);
  const deste = sirali ? ogeler.slice() : karistir(ogeler);
  const g = geriBildirim();
  const sayac = el("div", { class: "hrt-ilerleme" });
  const kartAlani = el("div", { class: "hrt-deste-kart" });
  const dugmeler = el("div", { class: "hrt-kutu-dugmeleri" });
  const kutuEl = {};
  const kutuIzgara = el("div", { class: "hrt-kutular", style: `--n:${kutular.length}` },
    kutular.map((k) => (kutuEl[k.id] = el("div", { class: "hrt-kutu", "data-kutu": k.id }, el("b", { html: k.ad })))));
  const kok = el("div", { class: "hrt-deste" }, sayac, kartAlani, dugmeler, g.el, kutuIzgara);
  kap.append(kok);
  let i = 0, yanlis = 0;
  kutular.forEach((k) => dugmeler.append(el("button", { class: "d-btn", "data-kutu": k.id, onclick: () => dene(k.id) }, el("span", { html: k.ad }))));

  function goster() {
    sayac.textContent = `Kart ${Math.min(i + 1, deste.length)}/${deste.length}${yanlis ? ` · ${yanlis} hatalı deneme` : ""}`;
    if (i >= deste.length) {
      kartAlani.innerHTML = "Tüm kartlar yerleşti ✓";
      kartAlani.style.borderColor = "var(--yesil)";
      dugmeler.hidden = true;
      return;
    }
    const o = deste[i];
    kartAlani.dataset.id = o.id;
    kartAlani.innerHTML = `${o.alt ? `<small>${o.alt}</small>` : ""}${o.metin}`;
    const s = el("div", { class: "hrt-ilerleme", html: soru });
    kartAlani.prepend(s);
  }
  function dene(kutu) {
    const o = deste[i];
    if (!o) return;
    if (o.kutu === kutu) {
      kutuEl[kutu].append(el("div", { title: o.aciklama || "", html: o.kisa || o.metin }));
      g.yaz(o.aciklama ? `<b>Doğru.</b> ${o.aciklama}` : "<b>Doğru.</b>", "dogru");
      i++;
      yerlesti?.(o, i);
      goster();
      if (i === deste.length) bitti?.({ yanlis });
    } else {
      yanlis++;
      kartAlani.classList.remove("yanlis"); void kartAlani.offsetWidth; kartAlani.classList.add("yanlis");
      g.yaz(o.ipucu ? `<b>Tekrar düşün.</b> ${o.ipucu}` : "<b>Tekrar düşün.</b>", "yanlis");
      goster();
    }
  }
  goster();
  return { el: kok, get yerlesen() { return i; } };
}

/**
 * Sıralama: karışık kartlara doğru sırayla dokun.
 * ogeler: [{ id, metin, alt? }] doğru sırada verilir; ipucu(beklenen, secilen) yanlışta açıklama döndürür.
 */
export function siralama(kap, { ogeler, ipucu, yerlesti, bitti, listeBaslik = "Senin sıran" }) {
  stilEkle("hrt-bilesen-stil", CSS);
  const g = geriBildirim();
  const liste = el("div", { class: "hrt-sira-liste" });
  const havuz = el("div", { class: "hrt-havuz" });
  const kok = el("div", { class: "hrt-deste" }, havuz, g.el, el("div", { class: "hrt-ilerleme" }, listeBaslik), liste);
  kap.append(kok);
  let n = 0;
  for (const o of karistir(ogeler)) {
    havuz.append(el("button", { class: "hrt-kart", "data-id": o.id, onclick: (e) => sec(o, e.currentTarget) },
      el("span", { html: o.metin }), o.alt ? el("small", { html: o.alt }) : null));
  }
  function sec(o, b) {
    const beklenen = ogeler[n];
    if (o.id === beklenen.id) {
      b.remove();
      liste.append(el("div", { "data-id": o.id }, el("span", { html: o.metin + (o.sonra ? ` <small style="color:var(--metin-2)">${o.sonra}</small>` : "") })));
      n++;
      g.yaz(n === ogeler.length ? "Sıralama tamam ✓" : "Doğru. Sıradaki hangisi?", "dogru");
      yerlesti?.(o, n);
      if (n === ogeler.length) bitti?.();
    } else {
      b.classList.remove("yanlis"); void b.offsetWidth; b.classList.add("yanlis");
      g.yaz(ipucu?.(beklenen, o) || "Bu kart şimdi gelmiyor. Tekrar düşün.", "yanlis");
    }
  }
  return { el: kok, get yerlesen() { return n; } };
}

/** Küçük çoktan seçmeli soru (panel ya da tahta içinde); dogru(i) true ise kilitlenir */
export function secmeli(kap, { soru, siklar, dogru, aciklama, yanlisAciklama, bitti }) {
  stilEkle("hrt-bilesen-stil", CSS);
  const g = geriBildirim();
  const kok = el("div", { class: "hrt-deste" }, el("div", { class: "hrt-soru", html: soru }));
  const grup = el("div", { class: "hrt-deste" });
  siklar.forEach((s, i) => grup.append(el("button", { class: "hrt-kart", "data-i": i, onclick: (e) => {
    const b = e.currentTarget;
    if (i === dogru) {
      grup.querySelectorAll("button").forEach((x) => (x.disabled = true));
      b.classList.add("tamam");
      g.yaz(`<b>Doğru.</b> ${aciklama || ""}`, "dogru");
      bitti?.();
    } else {
      b.classList.remove("yanlis"); void b.offsetWidth; b.classList.add("yanlis");
      g.yaz(`<b>Tekrar düşün.</b> ${(typeof yanlisAciklama === "function" ? yanlisAciklama(i) : yanlisAciklama?.[i]) || ""}`, "yanlis");
    }
  } }, el("span", { html: s }))));
  kok.append(grup, g.el);
  kap.append(kok);
  return kok;
}
