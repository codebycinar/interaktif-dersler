// Ortak etkileşim bileşenleri: sahne kabı, sınıflandırma (dokun-yerleştir), sıralama, zaman çizelgesi, ilişki ağı.
// Felsefe, Din Kültürü ve Peygamberimizin Hayatı derslerinde kullanılır (motor adayı).
// Hepsi dokunmatikle çalışır: sürükle-bırak yerine önce karta, sonra hedefe dokunulur.
import { el } from "../../../../engine/ders.js";

export const karistir = (dizi) => dizi.map((v) => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

const CSS = `
.ok-sahne{position:absolute;inset:0;overflow-y:auto;padding:16px 18px 28px;display:flex;flex-direction:column;gap:12px}
.ok-baslik{font-size:18px;font-weight:700;line-height:1.3}
.ok-aciklama{color:var(--metin-2);font-size:14.5px;margin-top:-6px}
.ok-kutu{background:rgba(15,23,36,.82);border:1px solid var(--cizgi);border-radius:var(--radius);padding:12px 14px}
.ok-sekmeler{display:flex;gap:6px;flex-wrap:wrap}
.ok-sekmeler .d-btn[aria-pressed="true"]{border-color:var(--vurgu);color:var(--vurgu);background:rgba(255,181,71,.1)}
.ok-sekmeler .d-btn.bitti::after{content:" ✓";color:var(--yesil)}
.ok-tepsi{display:flex;flex-wrap:wrap;gap:8px;min-height:50px;padding:10px;border:1px dashed var(--cizgi);border-radius:var(--radius);background:rgba(15,23,36,.6)}
.ok-tepsi:empty::after{content:"Tüm kartlar yerleştirildi.";color:var(--metin-2);font-size:13px;align-self:center}
.ok-kart{cursor:pointer;text-align:left;background:var(--panel-2);border:1px solid var(--cizgi);border-radius:10px;padding:8px 12px;font-size:14.5px;line-height:1.35;max-width:100%;color:var(--metin);font-weight:500}
.ok-kart:hover{border-color:var(--metin-2)}
.ok-kart[aria-pressed="true"]{border-color:var(--vurgu);box-shadow:0 0 0 2px rgba(255,181,71,.35);background:rgba(255,181,71,.14)}
.ok-kart.dogru{border-color:var(--yesil);background:rgba(90,211,139,.12)}
.ok-kart.yanlis{border-color:var(--kirmizi);background:rgba(255,107,107,.12)}
.ok-tepsi.deste{justify-content:center;min-height:70px}
.ok-tepsi.deste .ok-kart{font-size:16px;padding:12px 16px;max-width:620px}
.ok-kart small{display:block;color:var(--metin-2);font-size:12.5px;margin-top:2px}
.ok-kart.sars{animation:ok-sars .35s}
@keyframes ok-sars{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.ok-kovalar{display:grid;grid-template-columns:repeat(var(--n,3),minmax(0,1fr));gap:10px}
.ok-kova{border:1px solid var(--cizgi);border-radius:var(--radius);background:rgba(15,23,36,.78);min-height:96px;display:flex;flex-direction:column;cursor:pointer;transition:border-color .15s,background .15s;min-width:0}
.ok-kovalar.secimli .ok-kova{border-style:dashed;border-color:var(--vurgu)}
.ok-kovalar.secimli .ok-kova:hover{background:rgba(255,181,71,.08)}
.ok-kova>header{padding:7px 10px;font-weight:700;font-size:14px;border-bottom:1px solid var(--cizgi);display:flex;gap:7px;align-items:center;line-height:1.25}
.ok-kova>header i{width:10px;height:10px;border-radius:50%;background:var(--renk,var(--vurgu-2));flex:none}
.ok-kova>header small{margin-left:auto;color:var(--metin-2);font-weight:500;font-family:var(--mono)}
.ok-kova-not{font-size:12.5px;color:var(--metin-2);padding:4px 10px 0}
.ok-kova .ok-icerik{padding:8px;display:flex;flex-direction:column;gap:6px;flex:1}
.ok-kova .ok-kart{font-size:13.5px;padding:6px 10px}
.ok-geri{font-size:14.5px;padding:9px 12px;border-radius:10px;background:rgba(15,23,36,.88);border:1px solid var(--cizgi);min-height:42px}
.ok-geri.dogru{border-color:var(--yesil)}.ok-geri.yanlis{border-color:var(--kirmizi)}
.ok-geri b{color:#fff}
.ok-dizi{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;counter-reset:sira}
.ok-dizi li{display:flex;gap:10px;align-items:stretch;counter-increment:sira}
.ok-dizi li::before{content:counter(sira);flex:none;width:28px;border-radius:8px;display:grid;place-items:center;background:var(--zemin);border:1px solid var(--cizgi);font-weight:700;font-size:13px;color:var(--metin-2)}
.ok-dizi li .ok-kart{flex:1}
.ok-dizi li.bos .ok-yuva{flex:1;border:1px dashed var(--cizgi);border-radius:10px;min-height:38px}
.ok-ek{font-family:var(--mono);color:var(--vurgu);font-size:12.5px;margin-left:6px}
.ok-zc{position:relative;width:100%}
.ok-zc svg{display:block;width:100%;user-select:none}
.ok-zc text{font-family:var(--font);fill:var(--metin)}
.ok-zc .serit-ad{fill:var(--metin-2);font-size:12.5px;font-weight:700}
.ok-zc .olay{cursor:pointer}
.ok-zc .olay:hover rect,.ok-zc .olay:hover circle{stroke:#fff}
.ok-zc .olay.secili rect,.ok-zc .olay.secili circle{stroke:var(--vurgu);stroke-width:2.5}
.ok-zc .olay.yeni{animation:ok-belir .6s}
@keyframes ok-belir{from{opacity:0}to{opacity:1}}
.ok-ag{position:relative;width:100%;border:1px solid var(--cizgi);border-radius:var(--radius);background:rgba(15,23,36,.6)}
.ok-ag svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.ok-dugum{position:absolute;transform:translate(-50%,-50%);max-width:30%;min-width:96px;text-align:center;justify-content:center;font-size:13.5px;padding:7px 10px;z-index:1}
.ok-dugum.kaynak{border-color:var(--vurgu);box-shadow:0 0 0 3px rgba(255,181,71,.35);background:#3a2f1c}
.ok-dugum.bagli{border-color:var(--yesil)}
.ok-ag .bag-etiket{font-size:11.5px;fill:#ffd28a;font-weight:600;paint-order:stroke;stroke:#0f1724;stroke-width:4px}
.ok-ilerleme{font-size:13px;color:var(--metin-2);font-family:var(--mono)}
@media (max-width:760px){
  .ok-sahne{padding:12px 10px 20px;gap:10px}
  .ok-baslik{font-size:16px}
  .ok-kovalar{grid-template-columns:repeat(var(--nm,2),minmax(0,1fr));gap:8px}
  .ok-kart{font-size:13.5px;padding:7px 10px}
  .ok-dugum{font-size:12px;min-width:70px;max-width:34%;padding:5px 6px}
}`;

export function stilEkle(id, css) {
  if (document.getElementById(id)) return;
  document.head.append(el("style", { id }, css));
}
const stil = () => stilEkle("ok-stil", CSS);

/** Sahne alanına kaydırılabilir bir içerik kabı yerleştirir; içine bileşenler eklenir */
export function sahneKap(ctx, { baslik, aciklama, sinif = "" } = {}) {
  stil();
  const govde = el("div", { class: "ok-govde", style: "display:flex;flex-direction:column;gap:12px" });
  const kap = el("div", { class: `ok-sahne ${sinif}` },
    baslik ? el("div", { class: "ok-baslik", html: baslik }) : null,
    aciklama ? el("div", { class: "ok-aciklama", html: aciklama }) : null,
    govde);
  ctx.katman.append(kap);
  return govde;
}

/** Sahne içinde sekmeli bölümler: [{ad, kur(kap)}] — her sekme bir kez kurulur, geçişte gizlenir */
export function sekmeler(kap, liste) {
  stil();
  const cubuk = el("div", { class: "ok-sekmeler", role: "tablist" });
  const govdeler = liste.map(() => el("div", { style: "display:flex;flex-direction:column;gap:12px", hidden: true }));
  const dugmeler = liste.map((s, i) => el("button", { class: "d-btn kucuk", role: "tab", "aria-pressed": "false", "data-sekme": i, onclick: () => ac(i) }, s.ad));
  const kurulan = new Set();
  cubuk.append(...dugmeler);
  kap.append(cubuk, ...govdeler);
  function ac(i) {
    dugmeler.forEach((b, j) => b.setAttribute("aria-pressed", String(i === j)));
    govdeler.forEach((g, j) => (g.hidden = i !== j));
    if (!kurulan.has(i)) { kurulan.add(i); liste[i].kur(govdeler[i]); }
  }
  ac(0);
  return { ac, bitti: (i) => dugmeler[i].classList.add("bitti") };
}

/** Geri bildirim satırı */
export function geriBildirim(kap, ilk = "") {
  stil();
  const g = el("div", { class: "ok-geri", "aria-live": "polite", html: ilk });
  kap.append(g);
  return {
    el: g,
    yaz(html, tur = "") { g.className = `ok-geri ${tur}`; g.innerHTML = html; },
  };
}

/**
 * Sınıflandırma: kartları kategorilere yerleştirme.
 * kartlar: [{ id, metin (HTML), dogru: katId | katId[], aciklama?, yanlis?: {katId: "neden"}, ipucu? }]
 * kategoriler: [{ id, ad, renk?, aciklama? }]
 * deste: n → tepside yalnızca ilk n kart görünür ve ilki kendiliğinden seçilir (uzun kartlar için)
 * kip: "aninda" → her yerleştirmede geri bildirim, doğru kart kilitlenir;
 *      "serbest" → öğrenci yerleştirir, “Kontrol et” ile toplu denetler, yanlışları taşıyabilir.
 */
export function siniflandirma({ kap, kartlar, kategoriler, kip = "aninda", karistirma = true, bitti, degisti, ilkMesaj, kontrolSonrasi, sutun, deste }) {
  stil();
  let secili = null, hatalar = 0, bittiMi = false;
  const yer = new Map();
  const dogruMu = (k, kat) => [].concat(k.dogru).includes(kat);
  const tepsi = el("div", { class: `ok-tepsi${deste ? " deste" : ""}`, "aria-label": "Yerleştirilecek kartlar" });
  const desteSayac = el("div", { class: "ok-ilerleme" });
  const geri = geriBildirim(kap, ilkMesaj || (deste
    ? "Kartın ait olduğu kutuya dokun."
    : kip === "aninda"
    ? "Bir karta, sonra uygun kutuya dokun."
    : "Kartları kutulara yerleştir, sonra <b>Kontrol et</b>'e bas. Yerleştirdiğin bir kartı başka kutuya taşıyabilirsin."));
  kap.insertBefore(tepsi, geri.el);
  if (deste) kap.insertBefore(desteSayac, geri.el);
  const kovalar = el("div", { class: "ok-kovalar", style: `--n:${sutun || kategoriler.length};--nm:${Math.min(kategoriler.length, 2)}` });
  const kovaEl = {};
  for (const kat of kategoriler) {
    const icerik = el("div", { class: "ok-icerik" });
    const sayac = el("small", {}, "0");
    const kova = el("div", {
      class: "ok-kova", "data-kat": kat.id, role: "button", tabindex: "0", "aria-label": `${kat.ad} kutusu`,
      style: kat.renk ? `--renk:${kat.renk}` : null,
      onclick: () => birak(kat.id),
      onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); birak(kat.id); } },
    }, el("header", {}, el("i"), el("span", { html: kat.ad }), sayac), kat.aciklama ? el("div", { class: "ok-kova-not", html: kat.aciklama }) : null, icerik);
    kovaEl[kat.id] = { kova, icerik, sayac };
    kovalar.append(kova);
  }
  kap.append(kovalar);
  let kontrolBtn = null;
  if (kip === "serbest") {
    kontrolBtn = el("button", { class: "d-btn ana", onclick: kontrolEt }, "Kontrol et");
    kap.append(el("div", { class: "d-satir" }, kontrolBtn));
  }
  const kartEl = {};
  for (const k of karistirma ? karistir(kartlar) : kartlar) {
    const b = el("button", { class: "ok-kart", "data-kart": k.id, "aria-pressed": "false", html: k.metin, onclick: (e) => { e.stopPropagation(); sec(k.id); } });
    kartEl[k.id] = b; yer.set(k.id, null); tepsi.append(b);
  }
  desteGuncelle();

  function desteGuncelle() {
    if (!deste) return;
    const kalan = [...tepsi.querySelectorAll(".ok-kart")];
    kalan.forEach((b, i) => (b.hidden = i >= deste));
    desteSayac.textContent = kalan.length ? `Kalan kart: ${kalan.length}` : "";
    if (!secili && kalan[0] && !bittiMi) {
      secili = kalan[0].dataset.kart;
      kalan[0].setAttribute("aria-pressed", "true");
      kovalar.classList.add("secimli");
    }
  }

  function sec(id) {
    const b = kartEl[id], k = kartlar.find((x) => x.id === id);
    if (bittiMi || (kip === "aninda" && b.classList.contains("dogru"))) {
      if (k.aciklama) geri.yaz(k.aciklama, "dogru");
      return;
    }
    if (kip === "serbest" && b.classList.contains("yanlis")) {
      const kat = yer.get(id);
      geri.yaz(`✗ ${k.yanlis?.[kat] || k.ipucu || "Bu kart başka bir kutuya ait."}`, "yanlis");
    }
    secili = deste && b.parentNode === tepsi ? id : secili === id ? null : id;
    for (const [kid, kb] of Object.entries(kartEl)) kb.setAttribute("aria-pressed", String(kid === secili));
    kovalar.classList.toggle("secimli", !!secili);
  }
  function yerlestir(id, katId) {
    yer.set(id, katId);
    if (katId) kartEl[id].hidden = false;
    (katId ? kovaEl[katId].icerik : tepsi).append(kartEl[id]);
  }
  function sayaclar() {
    for (const kat of kategoriler) kovaEl[kat.id].sayac.textContent = String([...yer.values()].filter((v) => v === kat.id).length);
  }
  function birak(katId) {
    if (bittiMi) return;
    if (!secili) { geri.yaz("Önce yukarıdan bir kart seç, sonra kutuya dokun."); return; }
    const k = kartlar.find((x) => x.id === secili), b = kartEl[secili];
    secili = null; b.setAttribute("aria-pressed", "false"); kovalar.classList.remove("secimli");
    if (kip === "aninda") {
      if (dogruMu(k, katId)) {
        yerlestir(k.id, katId); b.classList.add("dogru");
        geri.yaz(`✓ ${k.aciklama || "Doğru."}`, "dogru");
      } else {
        hatalar++;
        b.classList.remove("sars"); void b.offsetWidth; b.classList.add("sars");
        geri.yaz(`✗ ${k.yanlis?.[katId] || k.ipucu || "Bu kutu değil. Kartı yeniden oku."}`, "yanlis");
      }
    } else {
      yerlestir(k.id, katId); b.classList.remove("dogru", "yanlis");
    }
    sayaclar();
    desteGuncelle();
    degisti?.(durum());
    if (kip === "aninda" && tumuDogru()) { bittiMi = true; bitti?.({ hatalar }); }
  }
  function tumuDogru() { return kartlar.every((k) => yer.get(k.id) && dogruMu(k, yer.get(k.id))); }
  function kontrolEt() {
    let yanlis = 0, bos = 0;
    for (const k of kartlar) {
      const b = kartEl[k.id], kat = yer.get(k.id);
      b.classList.remove("dogru", "yanlis");
      if (!kat) { bos++; continue; }
      if (dogruMu(k, kat)) b.classList.add("dogru"); else { b.classList.add("yanlis"); yanlis++; }
    }
    if (bos) { geri.yaz(`Önce tüm kartları yerleştir (${bos} kart kaldı).`, "yanlis"); return; }
    kontrolSonrasi?.({ yanlis, toplam: kartlar.length });
    if (yanlis) { hatalar += yanlis; geri.yaz(`${kartlar.length - yanlis}/${kartlar.length} doğru. Kırmızı kartlara dokunarak nedenini oku, sonra doğru kutuya taşı ve yeniden kontrol et.`, "yanlis"); return; }
    bittiMi = true;
    if (kontrolBtn) kontrolBtn.disabled = true;
    geri.yaz(`✓ Hepsi doğru! ${hatalar ? `(${hatalar} düzeltme yaptın.)` : "İlk denemede!"}`, "dogru");
    bitti?.({ hatalar });
  }
  function durum() { return Object.fromEntries(yer); }
  return { tepsi, kovalar, geri, kontrolEt, durum, tumuDogru, yerlestir };
}

/**
 * Sıralama: ögeler DOĞRU sırada verilir [{ id, metin, ek? }]; ekranda karışık görünür.
 * Öğrenci havuzdan sırayla dokunur; hepsi dizilince denetlenir. ek (ör. tarih) çözünce görünür.
 */
export function siralama({ kap, ogeler, bitti, basariMesaji = "Sıralama doğru!" }) {
  stil();
  let sira = [], bittiMi = false;
  const havuz = el("div", { class: "ok-tepsi" });
  const dizi = el("ol", { class: "ok-dizi" });
  const geri = geriBildirim(kap, "Olayları <b>ilkten sona</b> doğru sırayla seç. Yanlış seçtiğini geri almak için dizideki karta dokun.");
  kap.insertBefore(havuz, geri.el);
  kap.insertBefore(dizi, geri.el);
  const kartEl = {};
  for (const o of karistir(ogeler)) {
    const b = el("button", { class: "ok-kart", "data-oge": o.id, html: o.metin, onclick: () => tik(o.id) });
    kartEl[o.id] = b; havuz.append(b);
  }
  function ciz() {
    dizi.replaceChildren();
    ogeler.forEach((_, i) => {
      const id = sira[i];
      dizi.append(id ? el("li", {}, kartEl[id]) : el("li", { class: "bos" }, el("div", { class: "ok-yuva" })));
    });
  }
  function tik(id) {
    if (bittiMi) return;
    const i = sira.indexOf(id);
    if (i >= 0) { sira.splice(i, 1); havuz.append(kartEl[id]); kartEl[id].classList.remove("dogru", "yanlis"); }
    else sira.push(id);
    for (const s of sira) kartEl[s].classList.remove("dogru", "yanlis");
    ciz();
    if (sira.length === ogeler.length) denetle();
    else geri.yaz(`${sira.length}/${ogeler.length} yerleştirildi.`);
  }
  function denetle() {
    let dogru = 0;
    sira.forEach((id, i) => {
      const ok = ogeler[i].id === id;
      kartEl[id].classList.toggle("dogru", ok); kartEl[id].classList.toggle("yanlis", !ok);
      if (ok) dogru++;
    });
    if (dogru === ogeler.length) {
      bittiMi = true;
      for (const o of ogeler) if (o.ek) kartEl[o.id].append(el("span", { class: "ok-ek" }, o.ek));
      geri.yaz(`✓ ${basariMesaji}`, "dogru");
      bitti?.();
    } else geri.yaz(`${dogru}/${ogeler.length} olay doğru yerde. Kırmızı kartlara dokunup geri al, yeniden yerleştir.`, "yanlis");
  }
  ciz();
  return { geri, sira: () => [...sira], tik };
}

/* ---------- Zaman çizelgesi ---------- */
const adimlar = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
/**
 * seritler: [{ id, ad, renk }]
 * olaylar: [{ id, serit, bas, bit?, ad, yaklasik?, gizli? }] — yıllar ondalık sayı (MÖ negatif)
 */
export function zamanCizelgesi({ kap, seritler, olaylar, min, max, yilYaz = (y) => String(Math.round(y)), secildi, seritSecildi, temizlik, satir = 22 }) {
  stil();
  const kutu = el("div", { class: "ok-zc" });
  kap.append(kutu);
  let alan = [min, max], secili = null;
  const yeniler = new Set();
  const NS = "http://www.w3.org/2000/svg";
  const s = (ad, oz = {}, ...c) => {
    const e = document.createElementNS(NS, ad);
    for (const [k, v] of Object.entries(oz)) if (v != null) e.setAttribute(k, v);
    for (const x of c) e.append(x);
    return e;
  };
  function ciz() {
    const W = Math.max(300, kutu.clientWidth || 800);
    const dar = W < 560;
    const L = dar ? 6 : 128, R = 14;
    const [a, b] = alan;
    const x = (y) => L + ((y - a) / (b - a)) * (W - L - R);
    const svg = s("svg", { width: W, role: "img", "aria-label": "Zaman çizelgesi" });
    let y0 = 26;
    // eksen
    const adim = adimlar.find((d) => (b - a) / d <= Math.max(3, Math.floor((W - L) / 80))) || 1000;
    const eksen = s("g");
    for (let t = Math.ceil(a / adim) * adim; t <= b; t += adim) {
      eksen.append(s("line", { x1: x(t), x2: x(t), y1: 18, y2: "100%", stroke: "rgba(169,182,201,.14)" }));
      eksen.append(s("text", { x: x(t), y: 13, "text-anchor": "middle", "font-size": 11.5, fill: "var(--metin-2)", style: "fill:var(--metin-2)" }, yilYaz(t)));
    }
    svg.append(eksen);
    for (const [si, sr] of seritler.entries()) {
      const liste = olaylar.filter((o) => o.serit === sr.id && !o.gizli && (o.bit ?? o.bas) >= a && o.bas <= b).sort((p, q) => p.bas - q.bas);
      const satirSonu = [];
      const yerler = liste.map((o) => {
        const etiket = (o.yaklasik ? "~" : "") + o.ad;
        const genislik = etiket.length * 6.6 + 16;
        const x1 = Math.max(L, x(o.bas)), xb = o.bit != null ? Math.min(x(o.bit), W - R) : x1;
        const solda = x1 + genislik > W - R; // sağ kenara taşan etiket çubuğun soluna yazılır
        return { o, etiket, x1, solda, bas: solda ? x1 - genislik + 6 : x1, son: solda ? xb : Math.max(xb, x1 + genislik) };
      }).sort((p, q) => p.bas - q.bas);
      for (const y of yerler) {
        let r = satirSonu.findIndex((son) => son < y.bas - 3);
        if (r < 0) { r = satirSonu.length; satirSonu.push(0); }
        satirSonu[r] = y.son; y.r = r;
      }
      const yukseklik = Math.max(1, satirSonu.length) * satir + (dar ? 26 : 12);
      const zemin = s("rect", { x: 0, y: y0, width: W, height: yukseklik, fill: si % 2 ? "rgba(255,255,255,.025)" : "rgba(255,255,255,.055)", "data-serit": sr.id, style: seritSecildi ? "cursor:pointer" : null });
      if (seritSecildi) zemin.addEventListener("click", () => seritSecildi(sr.id));
      svg.append(zemin);
      svg.append(s("rect", { x: 0, y: y0, width: 4, height: yukseklik, fill: sr.renk }));
      const adY = dar ? y0 + 15 : y0 + yukseklik / 2 + 4;
      const ad = s("text", { class: "serit-ad", x: dar ? 10 : 12, y: adY, "data-serit": sr.id, style: seritSecildi ? "cursor:pointer" : null }, sr.ad);
      if (seritSecildi) ad.addEventListener("click", () => seritSecildi(sr.id));
      svg.append(ad);
      const ust = y0 + (dar ? 22 : 6);
      for (const { o, r, etiket, x1, solda } of yerler) {
        const yy = ust + r * satir;
        const g = s("g", { class: `olay${o.id === secili ? " secili" : ""}${yeniler.has(o.id) ? " yeni" : ""}`, "data-olay": o.id, tabindex: 0 });
        if (o.bit != null) {
          g.append(s("rect", { x: x1, y: yy + 2, width: Math.max(4, Math.min(x(o.bit), W - R) - x1), height: satir - 5, rx: 5, fill: sr.renk, "fill-opacity": .28, stroke: sr.renk, "stroke-dasharray": o.yaklasik ? "4 3" : null }));
          g.append(s("text", { x: solda ? x1 - 4 : x1 + 6, y: yy + satir / 2 + 3.5, "font-size": 12, "text-anchor": solda ? "end" : null }, etiket));
        } else {
          g.append(s("circle", { cx: x1, cy: yy + satir / 2, r: 5.5, fill: sr.renk, stroke: "#0f1724", "stroke-width": 1.5, "stroke-dasharray": o.yaklasik ? "2 2" : null }));
          g.append(s("text", { x: solda ? x1 - 9 : x1 + 9, y: yy + satir / 2 + 4, "font-size": 12, "text-anchor": solda ? "end" : null }, etiket));
        }
        g.addEventListener("click", () => { sec(o.id); seritSecildi?.(o.serit); });
        g.addEventListener("keydown", (e) => e.key === "Enter" && sec(o.id));
        svg.append(g);
      }
      y0 += yukseklik;
    }
    svg.setAttribute("height", y0 + 4);
    kutu.replaceChildren(svg);
    yeniler.clear();
  }
  function sec(id) {
    secili = id; ciz();
    secildi?.(olaylar.find((o) => o.id === id));
  }
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => ciz()) : null;
  ro?.observe(kutu);
  temizlik?.(() => ro?.disconnect());
  ciz();
  return {
    el: kutu, ciz, sec,
    goster(id) { const o = olaylar.find((q) => q.id === id); if (o) { o.gizli = false; yeniler.add(id); ciz(); } },
    aralik(a, b) { alan = [a, b]; ciz(); },
  };
}

/**
 * İlişki ağı: öğrenci önce kaynak düğüme, sonra hedef düğüme dokunarak yönlü bağ kurar.
 * dugumler: [{ id, metin, x, y }] (x, y yüzde) · baglar: [{ kaynak, hedef, etiket, aciklama }]
 */
export function iliskiAgi({ kap, dugumler, baglar, yukseklik = 430, bitti, temizlik, tersMesaj }) {
  stil();
  const ag = el("div", { class: "ok-ag", style: `height:${yukseklik}px` });
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  ag.append(svg);
  const ilerleme = el("div", { class: "ok-ilerleme" });
  const geri = geriBildirim(kap, "Önce <b>neden/kaynak</b> olan kutuya, sonra onun <b>sonucuna/etkilediği</b> kutuya dokun.");
  kap.insertBefore(ag, geri.el);
  kap.append(ilerleme);
  const bulunan = new Set();
  let kaynak = null, bittiMi = false;
  const dEl = {};
  for (const d of dugumler) {
    const b = el("button", { class: "d-btn ok-dugum", "data-dugum": d.id, style: `left:${d.x}%;top:${d.y}%`, html: d.metin, onclick: () => tik(d.id) });
    dEl[d.id] = b; ag.append(b);
  }
  const anahtar = (b) => `${b.kaynak}>${b.hedef}`;
  function tik(id) {
    if (!kaynak) { kaynak = id; dEl[id].classList.add("kaynak"); geri.yaz(`<b>${dugumler.find((d) => d.id === id).metin}</b> seçildi. Şimdi etkilediği kutuya dokun.`); return; }
    const k = kaynak; kaynak = null; dEl[k].classList.remove("kaynak");
    if (k === id) { geri.yaz("Seçim kaldırıldı."); return; }
    const bag = baglar.find((b) => b.kaynak === k && b.hedef === id);
    if (bag) {
      if (bulunan.has(anahtar(bag))) { geri.yaz(`Bu bağı zaten kurdun: ${bag.aciklama}`); return; }
      bulunan.add(anahtar(bag));
      dEl[k].classList.add("bagli"); dEl[id].classList.add("bagli");
      geri.yaz(`✓ ${bag.aciklama}`, "dogru");
      ciz();
      if (bulunan.size === baglar.length && !bittiMi) { bittiMi = true; bitti?.(); }
    } else if (baglar.some((b) => b.kaynak === id && b.hedef === k)) {
      geri.yaz(`✗ ${tersMesaj || "Bağ var ama yönü ters. Hangisi diğerini etkiliyor?"}`, "yanlis");
    } else geri.yaz("✗ Bu iki kutu arasında aradığımız doğrudan bir bağ yok. Başka bir eşleşme dene.", "yanlis");
    yaz();
  }
  function yaz() { ilerleme.textContent = `Kurulan bağ: ${bulunan.size}/${baglar.length}`; }
  function ciz() {
    const r0 = ag.getBoundingClientRect();
    // dar ekranda kenardan taşan düğümleri içeri kaydır
    for (const b of Object.values(dEl)) {
      b.style.marginLeft = "0px";
      const r = b.getBoundingClientRect();
      if (r.left < r0.left + 3) b.style.marginLeft = `${r0.left + 3 - r.left}px`;
      else if (r.right > r0.right - 3) b.style.marginLeft = `${r0.right - 3 - r.right}px`;
    }
    svg.replaceChildren();
    const defs = document.createElementNS(NS, "defs");
    defs.innerHTML = `<marker id="ok-ucu" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="#5ad38b"/></marker>`;
    svg.append(defs);
    for (const b of baglar) {
      if (!bulunan.has(anahtar(b))) continue;
      const ra = dEl[b.kaynak].getBoundingClientRect(), rb = dEl[b.hedef].getBoundingClientRect();
      const ca = { x: ra.left + ra.width / 2 - r0.left, y: ra.top + ra.height / 2 - r0.top };
      const cb = { x: rb.left + rb.width / 2 - r0.left, y: rb.top + rb.height / 2 - r0.top };
      const kes = (c, r, d) => { // merkezden d yönünde dikdörtgen kenarına kadar
        const tx = d.x ? (r.width / 2 + 4) / Math.abs(d.x) : Infinity, ty = d.y ? (r.height / 2 + 4) / Math.abs(d.y) : Infinity;
        const t = Math.min(tx, ty);
        return { x: c.x + d.x * t, y: c.y + d.y * t };
      };
      const uz = Math.hypot(cb.x - ca.x, cb.y - ca.y) || 1;
      const d = { x: (cb.x - ca.x) / uz, y: (cb.y - ca.y) / uz };
      const p1 = kes(ca, ra, d), p2 = kes(cb, rb, { x: -d.x, y: -d.y });
      // iki yönlü bağlarda oklar üst üste binmesin: yönüne göre sağa kaydır
      if (baglar.some((q) => q.kaynak === b.hedef && q.hedef === b.kaynak)) for (const p of [p1, p2]) { p.x += -d.y * 7; p.y += d.x * 7; }
      const cizgi = document.createElementNS(NS, "line");
      Object.entries({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: "#5ad38b", "stroke-width": 2.5, "marker-end": "url(#ok-ucu)" }).forEach(([k, v]) => cizgi.setAttribute(k, v));
      svg.append(cizgi);
      if (b.etiket) {
        const t = document.createElementNS(NS, "text");
        const cift = baglar.some((q) => q.kaynak === b.hedef && q.hedef === b.kaynak);
        t.setAttribute("x", (p1.x + p2.x) / 2 + (cift ? -d.y * 6 : 0)); t.setAttribute("y", (p1.y + p2.y) / 2 + (cift ? d.x * 6 + 4 : -4));
        t.setAttribute("text-anchor", cift ? (-d.y > 0 ? "start" : "end") : "middle"); t.setAttribute("class", "bag-etiket");
        t.textContent = b.etiket;
        svg.append(t);
      }
    }
  }
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => ciz()) : null;
  ro?.observe(ag);
  temizlik?.(() => ro?.disconnect());
  yaz();
  return { geri, tik, bulunan: () => bulunan.size };
}
