// 10. sınıf biyoloji dersleri için ortak bileşenler (kabukta olmayanlar):
// sınıflandırma (dokun-yerleştir / sürükle-bırak), sıralama, ölçüt ızgarası, 2B tuval, SVG yardımcısı.
// Stil, ilk kullanımda sayfaya eklenir; sınıf adları .bio- önekiyle başlar.
import { el } from "../../../../engine/ders.js";

const CSS = `
.bio-sinif { display: flex; flex-direction: column; gap: 10px; }
.bio-sinif .bio-bilgi { font-size: 13px; color: var(--metin-2); }
.bio-havuz { display: flex; flex-wrap: wrap; gap: 6px; min-height: 44px; padding: 8px; border: 1px dashed var(--cizgi); border-radius: 10px; }
.bio-havuz:empty::after { content: "Tüm kartlar yerleştirildi."; color: var(--metin-2); font-size: 13px; align-self: center; }
.bio-kutular { display: grid; grid-template-columns: repeat(var(--kutu, 2), minmax(0, 1fr)); gap: 8px; }
.bio-kutu { border: 1px solid var(--cizgi); border-radius: 10px; background: var(--zemin); min-height: 96px; display: flex; flex-direction: column; cursor: pointer; }
.bio-kutu > b { font-size: 13px; padding: 6px 8px; border-bottom: 1px solid var(--cizgi); color: var(--vurgu-2); }
.bio-kutu > div { display: flex; flex-wrap: wrap; gap: 5px; padding: 6px; flex: 1; align-content: flex-start; }
.bio-kutu.hedef { border-color: var(--vurgu); background: rgba(255,181,71,.07); }
.bio-kart { cursor: grab; touch-action: none; user-select: none; text-align: left; font: inherit; font-size: 13.5px; line-height: 1.3;
  padding: 6px 9px; border-radius: 8px; border: 1px solid var(--cizgi); background: var(--panel-2); color: var(--metin); }
.bio-kart.secili { border-color: var(--vurgu); box-shadow: 0 0 0 2px rgba(255,181,71,.35); }
.bio-kart.dogru { border-color: var(--yesil); background: rgba(90,211,139,.14); cursor: default; }
.bio-kart.yanlis { border-color: var(--kirmizi); background: rgba(255,107,107,.14); }
.bio-kart.suruklenen { position: fixed; z-index: 50; pointer-events: none; opacity: .92; box-shadow: 0 8px 24px rgba(0,0,0,.5); }
.bio-nedenler { margin: 0; padding-left: 18px; font-size: 13.5px; color: var(--metin-2); }
.bio-nedenler li { margin-bottom: 4px; }
.bio-nedenler b { color: var(--kirmizi); }

.bio-sira { display: flex; flex-direction: column; gap: 6px; }
.bio-sira-oge { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border: 1px solid var(--cizgi); border-radius: 10px; background: var(--zemin); font-size: 14px; }
.bio-sira-oge > span { flex: 1; }
.bio-sira-oge > i { font-style: normal; font-family: var(--mono); color: var(--metin-2); width: 18px; }
.bio-sira-oge button { padding: 2px 9px; }
.bio-sira-oge.dogru { border-color: var(--yesil); }
.bio-sira-oge.yanlis { border-color: var(--kirmizi); }

.bio-izgara-kutu { overflow-x: auto; border: 1px solid var(--cizgi); border-radius: 10px; }
.bio-izgara { border-collapse: collapse; width: 100%; font-size: 13px; }
.bio-izgara th, .bio-izgara td { padding: 5px 6px; border-bottom: 1px solid var(--cizgi); text-align: left; vertical-align: top; }
.bio-izgara th { color: var(--metin-2); font-weight: 600; background: var(--panel); }
.bio-izgara select { width: 100%; min-width: 110px; font-size: 13px; padding: 4px; border-radius: 6px; background: var(--zemin); border: 1px solid var(--cizgi); color: var(--metin); }
.bio-izgara select.dogru { border-color: var(--yesil); }
.bio-izgara select.yanlis { border-color: var(--kirmizi); }

.bio-tuval { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; }
.bio-ortu-kart { position: absolute; left: 12px; right: 12px; top: 12px; max-height: calc(100% - 24px); overflow-y: auto;
  background: rgba(15,23,36,.94); border: 1px solid var(--cizgi); border-radius: var(--radius); padding: 12px 14px; }
.bio-ortu-kart h3 { margin: 0 0 8px; font-size: 16px; }
@media (max-width: 760px) {
  /* kabuk mobilde paneli overflow: visible yapıyor; geniş tablolar ızgara sütununu taşırmasın */
  .d-panel { min-width: 0; }
  .bio-izgara-kutu { max-width: calc(100vw - 32px); }
  .bio-kutular { grid-template-columns: 1fr 1fr; }
  .bio-kart { font-size: 12.5px; }
}
`;

let stilVar = false;
export function stil() {
  if (stilVar || typeof document === "undefined") return;
  stilVar = true;
  document.head.append(el("style", {}, CSS));
}

export const karistir = (dizi) => dizi.map((v) => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

/** Sahne üstünde kaydırılabilir kart (katman içinde) */
export function ortuKart(ctx, baslik, { stilEk = "" } = {}) {
  stil();
  const kart = el("div", { class: "bio-ortu-kart d-alistirma", style: stilEk }, baslik ? el("h3", {}, baslik) : null);
  ctx.katman.append(kart);
  return kart;
}

/**
 * Sınıflandırma etkinliği. Kartlar dokun → kutuya dokun ya da sürükle-bırak ile yerleştirilir.
 * ogeler: [{ metin, dogru: "kutuAdi" | ["a","b"], neden?: "yanlışsa gösterilecek açıklama" }]
 * kutular: [{ ad, baslik }]
 */
export function siniflandir(hedef, { kutular, ogeler, tamam, sutun, bilgi = "Bir karta dokun, sonra ait olduğu kutuya dokun (ya da kartı sürükle)." }) {
  stil();
  const havuz = el("div", { class: "bio-havuz", "aria-label": "Yerleştirilecek kartlar" });
  const kutuKap = el("div", { class: "bio-kutular", style: `--kutu:${sutun || Math.min(kutular.length, 3)}` });
  const geri = el("div", { class: "d-geri-bildirim" });
  const nedenler = el("ul", { class: "bio-nedenler" });
  const kontrolBtn = el("button", { class: "d-btn ana", type: "button", onclick: () => kontrol() }, "Kontrol et");
  const kap = el("div", { class: "bio-sinif" }, el("div", { class: "bio-bilgi" }, bilgi), havuz, kutuKap, el("div", { class: "d-satir" }, kontrolBtn), geri, nedenler);
  hedef.append(kap);

  let secili = null, bitti = false;
  const kutuMap = {};
  for (const k of kutular) {
    const liste = el("div");
    const kutu = el("div", { class: "bio-kutu", "data-kutu": k.ad, role: "button", tabindex: "0", "aria-label": k.baslik }, el("b", {}, k.baslik), liste);
    kutu.addEventListener("click", (e) => { if (!e.target.closest(".bio-kart") && secili) yerlestir(secili, k.ad); });
    kutuMap[k.ad] = { kutu, liste };
    kutuKap.append(kutu);
  }
  havuz.addEventListener("click", (e) => { if (!e.target.closest(".bio-kart") && secili) yerlestir(secili, null); });

  const kartlar = karistir(ogeler).map((o) => {
    const kart = el("button", { class: "bio-kart", type: "button" }, o.metin);
    kart._oge = o; kart._yer = null;
    suruklenebilir(kart);
    havuz.append(kart);
    return kart;
  });

  function sec(kart) {
    if (kart.classList.contains("dogru")) return;
    secili?.classList.remove("secili");
    secili = secili === kart ? null : kart;
    secili?.classList.add("secili");
  }
  function yerlestir(kart, ad) {
    if (kart.classList.contains("dogru")) return;
    kart.classList.remove("secili", "yanlis");
    kart._yer = ad;
    (ad ? kutuMap[ad].liste : havuz).append(kart);
    if (secili === kart) secili = null;
  }
  function suruklenebilir(kart) {
    let bas = null, surukle = false, hedefKutu = null;
    kart.addEventListener("pointerdown", (e) => {
      if (kart.classList.contains("dogru")) return;
      bas = { x: e.clientX, y: e.clientY }; surukle = false;
      kart.setPointerCapture(e.pointerId);
    });
    kart.addEventListener("pointermove", (e) => {
      if (!bas) return;
      if (!surukle && Math.hypot(e.clientX - bas.x, e.clientY - bas.y) > 8) {
        surukle = true;
        const r = kart.getBoundingClientRect();
        kart._ofset = { x: bas.x - r.left, y: bas.y - r.top };
        kart.style.width = `${r.width}px`;
        kart.classList.add("suruklenen");
      }
      if (surukle) {
        kart.style.left = `${e.clientX - kart._ofset.x}px`;
        kart.style.top = `${e.clientY - kart._ofset.y}px`;
        const alt = document.elementFromPoint(e.clientX, e.clientY)?.closest(".bio-kutu, .bio-havuz");
        if (hedefKutu !== alt) { hedefKutu?.classList.remove("hedef"); hedefKutu = alt; hedefKutu?.classList.add("hedef"); }
      }
    });
    const birak = () => {
      if (!bas) return;
      if (surukle) {
        kart.classList.remove("suruklenen");
        kart.style.left = kart.style.top = kart.style.width = "";
        hedefKutu?.classList.remove("hedef");
        if (hedefKutu?.classList.contains("bio-kutu")) yerlestir(kart, hedefKutu.dataset.kutu);
        else if (hedefKutu?.classList.contains("bio-havuz")) yerlestir(kart, null);
      } else sec(kart);
      kart._isaretciZamani = performance.now();
      bas = null; surukle = false; hedefKutu = null;
    };
    kart.addEventListener("pointerup", birak);
    kart.addEventListener("pointercancel", birak);
    // klavye (Enter/Boşluk) ve programla tıklama; işaretçiyle yapılan seçim ikinci kez sayılmaz
    kart.addEventListener("click", () => { if (performance.now() - (kart._isaretciZamani || -1e9) > 400) sec(kart); });
  }

  function kontrol() {
    if (bitti) return;
    nedenler.replaceChildren();
    let dogruSay = 0, bos = 0;
    for (const k of kartlar) {
      if (k.classList.contains("dogru")) { dogruSay++; continue; }
      if (!k._yer) { bos++; continue; }
      const kabul = [].concat(k._oge.dogru);
      if (kabul.includes(k._yer)) { k.classList.add("dogru"); dogruSay++; }
      else {
        k.classList.add("yanlis");
        nedenler.append(el("li", { html: `<b>${k._oge.metin}</b>: ${k._oge.neden || "Bu kart başka bir kutuya ait."}` }));
        yerlestir(k, null);
        k.classList.add("yanlis");
      }
    }
    if (dogruSay === kartlar.length) {
      bitti = true;
      geri.className = "d-geri-bildirim dogru";
      geri.textContent = "Hepsi doğru yerde!";
      kontrolBtn.disabled = true;
      tamam?.();
    } else {
      geri.className = "d-geri-bildirim yanlis";
      geri.textContent = `${dogruSay}/${kartlar.length} kart doğru yerde.${bos ? ` ${bos} kart henüz yerleştirilmedi.` : ""} Yanlışlar havuza döndü.`;
    }
  }
  return { el: kap, kontrol, yerlestir: (metin, ad) => { const k = kartlar.find((x) => x._oge.metin === metin); if (k) yerlestir(k, ad); } };
}

/** Sıralama: ogeler doğru sırada verilir, karışık gösterilir. */
export function sirala(hedef, { ogeler, tamam, ipucu }) {
  stil();
  let sira = karistir(ogeler.map((_, i) => i));
  if (sira.every((v, i) => v === i)) sira.reverse();
  const liste = el("div", { class: "bio-sira" });
  const geri = el("div", { class: "d-geri-bildirim" });
  let bitti = false;
  const ciz = () => {
    liste.replaceChildren(...sira.map((oi, i) => el("div", { class: "bio-sira-oge", "data-oge": oi },
      el("i", {}, `${i + 1}.`), el("span", { html: ogeler[oi] }),
      el("button", { class: "d-btn kucuk", type: "button", "aria-label": "Yukarı taşı", disabled: i === 0 || bitti, onclick: () => tasi(i, -1) }, "▲"),
      el("button", { class: "d-btn kucuk", type: "button", "aria-label": "Aşağı taşı", disabled: i === sira.length - 1 || bitti, onclick: () => tasi(i, 1) }, "▼"))));
  };
  const tasi = (i, yon) => { [sira[i], sira[i + yon]] = [sira[i + yon], sira[i]]; ciz(); };
  const kontrolBtn = el("button", { class: "d-btn ana", type: "button", onclick: () => kontrol() }, "Sırayı kontrol et");
  function kontrol() {
    const ogeEl = [...liste.children];
    let dogru = 0;
    ogeEl.forEach((e, i) => { const ok = sira[i] === i; e.classList.toggle("dogru", ok); e.classList.toggle("yanlis", !ok); if (ok) dogru++; });
    if (dogru === sira.length) {
      bitti = true; ciz(); [...liste.children].forEach((e) => e.classList.add("dogru"));
      kontrolBtn.disabled = true;
      geri.className = "d-geri-bildirim dogru"; geri.textContent = "Sıralama doğru!";
      tamam?.();
    } else {
      geri.className = "d-geri-bildirim yanlis";
      geri.textContent = `${dogru}/${sira.length} öge doğru yerde. ${ipucu || ""}`;
    }
  }
  ciz();
  const kap = el("div", { class: "bio-sinif" }, liste, el("div", { class: "d-satir" }, kontrolBtn), geri);
  hedef.append(kap);
  return { el: kap, kontrol, ayarla: (yeni) => { sira = yeni.slice(); ciz(); } };
}

/**
 * Ölçüt ızgarası (yapılandırılmış grid): satırlar × sütunlar, her hücrede açılır liste.
 * sutunlar: [{ baslik, secenekler: [metin] }], satirlar: [{ ad, dogru: [sütun başına doğru seçenek indeksi] }]
 */
export function izgara(hedef, { satirlar, sutunlar, tamam }) {
  stil();
  const secimler = satirlar.map(() => []);
  const govde = el("tbody", {}, satirlar.map((s, si) => el("tr", {},
    el("th", { html: s.ad }),
    sutunlar.map((st, ci) => {
      const sel = el("select", { "aria-label": `${s.ad.replace(/<[^>]+>/g, "")} – ${st.baslik}` },
        el("option", { value: "" }, "Seç…"), st.secenekler.map((m, i) => el("option", { value: String(i) }, m)));
      sel.addEventListener("change", () => sel.classList.remove("dogru", "yanlis"));
      secimler[si][ci] = sel;
      return el("td", {}, sel);
    }))));
  const tablo = el("table", { class: "bio-izgara" }, el("thead", {}, el("tr", {}, el("th", {}, ""), sutunlar.map((s) => el("th", {}, s.baslik)))), govde);
  const geri = el("div", { class: "d-geri-bildirim" });
  let bitti = false;
  const kontrolBtn = el("button", { class: "d-btn ana", type: "button", onclick: () => kontrol() }, "Izgarayı kontrol et");
  function kontrol() {
    if (bitti) return;
    let dogru = 0, toplam = 0, bos = 0;
    satirlar.forEach((s, si) => s.dogru.forEach((d, ci) => {
      const sel = secimler[si][ci];
      toplam++;
      if (sel.value === "") { bos++; return; }
      const ok = [].concat(d).includes(+sel.value);
      sel.classList.toggle("dogru", ok); sel.classList.toggle("yanlis", !ok);
      if (ok) dogru++;
    }));
    if (dogru === toplam) {
      bitti = true; kontrolBtn.disabled = true;
      secimler.flat().forEach((s) => (s.disabled = true));
      geri.className = "d-geri-bildirim dogru"; geri.textContent = "Tüm hücreler doğru!";
      tamam?.();
    } else {
      geri.className = "d-geri-bildirim yanlis";
      geri.textContent = `${dogru}/${toplam} hücre doğru.${bos ? ` ${bos} hücre boş.` : ""} Kırmızı hücreleri tekrar düşün.`;
    }
  }
  const kap = el("div", { class: "bio-sinif" }, el("div", { class: "bio-izgara-kutu" }, tablo), el("div", { class: "d-satir" }, kontrolBtn), geri);
  hedef.append(kap);
  return { el: kap, kontrol, secimler };
}

/**
 * Sahneyi kaplayan 2B tuval. Çizim mantıksal bir kutuda (gen × yuk) yapılır, ekrana sığdırılır.
 * Katmanda grafik paneli varsa kutu onun üstünde kalan alana yerleşir.
 * ciz(c, dt, t) her karede çağrılır. nokta(olay) → mantıksal koordinat.
 */
export function tuval(ctx, { gen = 800, yuk = 500, ciz, zemin = true, tik }) {
  stil();
  const cv = el("canvas", { class: "bio-tuval" });
  ctx.katman.prepend(cv);
  const c = cv.getContext("2d");
  let olcek = 1, ox = 0, oy = 0, aktif = true, id = 0, son = performance.now(), t = 0, hataYazildi = false;
  function kare(simdi) {
    if (!aktif) return;
    const dt = Math.min(0.1, Math.max(0, (simdi - son) / 1000));
    son = simdi; t += dt;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = cv.clientWidth, H = cv.clientHeight;
    if (W && H) {
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const graf = ctx.katman.querySelector(".d-grafikler");
      const alt = graf ? graf.offsetHeight + 18 : 0;
      const kullan = Math.max(60, H - alt);
      olcek = Math.min(W / gen, kullan / yuk);
      ox = (W - gen * olcek) / 2; oy = (kullan - yuk * olcek) / 2;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      if (zemin) {
        const g = c.createRadialGradient(W / 2, H * 0.3, 10, W / 2, H * 0.3, Math.max(W, H));
        g.addColorStop(0, "#1b2a44"); g.addColorStop(0.8, "#0b111b");
        c.fillStyle = g; c.fillRect(0, 0, W, H);
      }
      c.setTransform(dpr * olcek, 0, 0, dpr * olcek, dpr * ox, dpr * oy);
      try { ciz(c, dt, t); } catch (e) { if (!hataYazildi) { hataYazildi = true; console.error(e); } }
    }
    id = requestAnimationFrame(kare);
  }
  id = requestAnimationFrame(kare);
  const nokta = (e) => {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left - ox) / olcek, y: (e.clientY - r.top - oy) / olcek };
  };
  if (tik) cv.addEventListener("pointerdown", (e) => tik(nokta(e), e));
  ctx.temizlik(() => { aktif = false; cancelAnimationFrame(id); });
  return { cv, c, nokta, get olcek() { return olcek; } };
}

/* ---------- Tuval çizim yardımcıları ---------- */
export function yazi(c, metin, x, y, { boyut = 18, renk = "#e8eef7", hiza = "center", kalin = false, taban = "middle" } = {}) {
  // dar ekranda (telefon) ölçek küçülünce yazı en az ~11 px okunur kalsın (en fazla 1,7 kat büyütülür)
  const olcek = c.getTransform().a / Math.min(window.devicePixelRatio || 1, 2);
  if (olcek > 0 && boyut * olcek < 11) boyut = Math.min(boyut * 1.7, 11 / olcek);
  c.font = `${kalin ? "700 " : ""}${boyut}px Segoe UI, system-ui, sans-serif`;
  c.fillStyle = renk; c.textAlign = hiza; c.textBaseline = taban;
  c.fillText(metin, x, y);
}
export function yuvarlakKutu(c, x, y, w, h, r, { dolgu, cizgi, kalinlik = 2 } = {}) {
  c.beginPath(); c.roundRect(x, y, w, h, r);
  if (dolgu) { c.fillStyle = dolgu; c.fill(); }
  if (cizgi) { c.strokeStyle = cizgi; c.lineWidth = kalinlik; c.stroke(); }
}
export function ok(c, x0, y0, x1, y1, { renk = "#ffb547", kalinlik = 3, uc = 12 } = {}) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  c.strokeStyle = c.fillStyle = renk; c.lineWidth = kalinlik;
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - Math.cos(a) * uc * 0.8, y1 - Math.sin(a) * uc * 0.8); c.stroke();
  c.beginPath(); c.moveTo(x1, y1);
  c.lineTo(x1 - Math.cos(a - 0.45) * uc, y1 - Math.sin(a - 0.45) * uc);
  c.lineTo(x1 - Math.cos(a + 0.45) * uc, y1 - Math.sin(a + 0.45) * uc);
  c.closePath(); c.fill();
}

/** Sahne üstü gösterge şeridi (pilot dersteki gibi) */
export function hud(ctx, liste) {
  const kap = el("div", { class: "d-etiket-hud" });
  ctx.katman.append(kap);
  return ctx.gostergeler(liste, kap);
}

/** Tekrarlanabilir rastgele sayı üreteci (mulberry32) */
export function rastgele(tohum = 1) {
  return () => {
    tohum |= 0; tohum = (tohum + 0x6d2b79f5) | 0;
    let t = Math.imul(tohum ^ (tohum >>> 15), 1 | tohum);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ortalaması lambda olan Poisson dağılımlı sayı (sayım gürültüsü için) */
export function poisson(lambda, r = Math.random) {
  if (lambda <= 0) return 0;
  if (lambda > 60) return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * gauss(r)));
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= r(); } while (p > L);
  return k - 1;
}
function gauss(r) { return Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r()); }

/** ctx.sinav'a geçiş (eski "null" geçici çözümü motorda düzeltildiği için kaldırıldı; içe aktaran dersler bozulmasın diye kalıyor). */
export function sinav(ctx, sorular, secenek) {
  return ctx.sinav(sorular, secenek);
}
