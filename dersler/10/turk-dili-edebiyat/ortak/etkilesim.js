// Dil dersleri (Türk Dili ve Edebiyatı, İngilizce) için ortak etkileşim bileşenleri:
// sahne kabı, sesli okuma (zaman aşımı korumalı), sınıflandırma, eşleştirme, sıralama, dereceli puanlama, ses kaydı.
// Motor önerisi: siniflandir / eslestir / sirala / rubrik engine/ders.js'e alınmaya adaydır.
import { el } from "../../../../engine/ders.js";

const STIL = `
.ort-sahne { position:absolute; inset:0; overflow:auto; padding:18px 20px 28px; display:flex; flex-direction:column; gap:14px; }
.ort-kart { background:rgba(23,34,52,.94); border:1px solid var(--cizgi); border-radius:14px; padding:14px 16px; }
.ort-baslik { font-size:12.5px; font-weight:700; color:var(--vurgu); text-transform:uppercase; letter-spacing:.06em; margin:0 0 8px; }
.ort-alt { color:var(--metin-2); font-size:14px; }
.ort-cip { display:inline-flex; align-items:center; gap:6px; padding:7px 12px; border-radius:10px; background:var(--panel-2);
  border:1px solid var(--cizgi); cursor:pointer; font-size:15px; line-height:1.3; user-select:none; touch-action:manipulation; text-align:left; color:var(--metin); }
.ort-cip:hover { border-color:var(--metin-2); }
.ort-cip.secili { border-color:var(--vurgu); box-shadow:0 0 0 2px rgba(255,181,71,.35); }
.ort-cip.dogru { border-color:var(--yesil); background:rgba(90,211,139,.14); }
.ort-cip.yanlis { border-color:var(--kirmizi); background:rgba(255,107,107,.14); }
.ort-cip[disabled] { cursor:default; }
.ort-havuz { display:flex; flex-wrap:wrap; gap:8px; min-height:48px; padding:10px; border:1px dashed var(--cizgi); border-radius:12px; }
.ort-havuz:empty::after { content:attr(data-bos); color:var(--metin-2); font-size:13.5px; align-self:center; }
.ort-kovalar { display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:10px; }
.ort-kova { border:1px solid var(--cizgi); border-radius:12px; background:rgba(15,23,36,.75); padding:8px; min-height:96px;
  cursor:pointer; display:flex; flex-direction:column; gap:6px; }
.ort-kova.hedef { border-color:var(--vurgu-2); box-shadow:0 0 0 2px rgba(79,195,247,.25); }
.ort-kova > b { font-size:14px; color:var(--vurgu-2); }
.ort-kova > div { display:flex; flex-direction:column; gap:6px; }
.ort-kova .ort-cip { font-size:14px; padding:6px 10px; }
.ort-geri { font-size:14.5px; min-height:1.4em; }
.ort-geri.dogru { color:var(--yesil); } .ort-geri.yanlis { color:var(--kirmizi); }
.ort-eslestir { display:grid; grid-template-columns:1fr 1fr; gap:8px 14px; }
.ort-eslestir > div { display:flex; flex-direction:column; gap:8px; }
.ort-eslestir .ort-cip { width:100%; justify-content:flex-start; }
.ort-eslestir .ort-cip.eslesti { cursor:default; color:#0d1a12; font-weight:600; border-color:transparent; }
.ort-sirala { display:flex; flex-direction:column; gap:8px; counter-reset:sira; }
.ort-sira { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; background:var(--panel-2); border:1px solid var(--cizgi); }
.ort-sira::before { counter-increment:sira; content:counter(sira); flex:none; width:26px; height:26px; border-radius:50%; display:grid; place-items:center;
  background:var(--zemin); border:1px solid var(--cizgi); font-size:13px; font-weight:700; }
.ort-sira.dogru { border-color:var(--yesil); } .ort-sira.yanlis { border-color:var(--kirmizi); }
.ort-sira > span { flex:1; font-size:14.5px; }
.ort-sira button { flex:none; width:34px; height:34px; border-radius:8px; border:1px solid var(--cizgi); background:var(--zemin); color:var(--metin); cursor:pointer; font-size:14px; }
.ort-sira button:disabled { opacity:.3; cursor:default; }
.ort-sira.surukle { opacity:.5; }
.ort-rubrik { display:grid; grid-template-columns:minmax(120px, 1.2fr) repeat(4, minmax(44px, 1fr)); gap:4px 6px; align-items:center; font-size:13.5px; }
.ort-rubrik .ust { color:var(--metin-2); font-size:11.5px; text-align:center; line-height:1.15; }
.ort-rubrik button { height:34px; border-radius:8px; border:1px solid var(--cizgi); background:var(--zemin); color:var(--metin-2); cursor:pointer; font-weight:700; }
.ort-rubrik button[aria-pressed="true"] { background:var(--vurgu); border-color:var(--vurgu); color:#2a1a00; }
.ort-rubrik.mavi button[aria-pressed="true"] { background:var(--vurgu-2); border-color:var(--vurgu-2); color:#06212e; }
.ort-kayit { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.ort-kayit audio { height:34px; max-width:100%; }
@media (max-width:760px) {
  .ort-sahne { padding:12px 10px 20px; gap:10px; }
  .ort-eslestir { gap:6px 8px; }
  .ort-cip { font-size:14px; padding:6px 9px; }
}
`;
let stilEklendi = false;
export function stil() {
  if (stilEklendi) return;
  stilEklendi = true;
  document.head.append(el("style", {}, STIL));
}

export const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
export const karistir = (dizi) => dizi.map((v) => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

/** Sahne alanını kaplayan, kaydırılabilir içerik kabı (adım değişince katmanla birlikte silinir) */
export function sahneAc(ctx, sinif = "") {
  stil();
  const s = el("div", { class: `ort-sahne ${sinif}`.trim() });
  ctx.katman.append(s);
  return s;
}
export const kart = (baslik, ...cocuklar) => el("div", { class: "ort-kart" }, baslik ? el("div", { class: "ort-baslik" }, baslik) : null, ...cocuklar);

/* ---------- Kalıcı veri (adımlar arası paylaşım; tarayıcı depolaması yoksa bellekte) ---------- */
export function kalici(anahtar, varsayilan) {
  let veri;
  try { veri = { ...varsayilan, ...(JSON.parse(localStorage.getItem(anahtar)) || {}) }; } catch { veri = { ...varsayilan }; }
  Object.defineProperty(veri, "kaydet", {
    enumerable: false,
    value() { try { localStorage.setItem(anahtar, JSON.stringify(veri)); } catch { /* özel pencere */ } },
  });
  return veri;
}

/* ---------- Sesli okuma ---------- */
/**
 * Gerçekten konuşabilen bir ses var mı? Bazı cihazlarda ses listesi boştur; otomasyon altındaki
 * (duman testi) görünmez tarayıcıda konuşma bitiş olayı güvenilir gelmediği için görsel okumaya geçilir.
 */
export function sesVar(ctx) {
  try { return !!ctx.sesDestegi && !navigator.webdriver && speechSynthesis.getVoices().length > 0; } catch { return false; }
}
export function sureTahmini(metin, hiz = 1) {
  const n = String(metin).replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return (n * 420 + 250) / hiz;
}
/**
 * ctx.seslendir'i zaman aşımıyla sarar: Promise hiçbir ortamda takılı kalmaz.
 * Ses yoksa okuma süresi kısaltılmış bir bekleme ile "görsel okuma" yapılır.
 */
export async function sesliOku(ctx, metin, { hiz = 1, dil } = {}) {
  const t = sureTahmini(metin, hiz);
  if (!sesVar(ctx)) { await bekle(Math.min(t * 0.3, 1100)); return false; }
  await Promise.race([ctx.seslendir(metin, { hiz, dil }), bekle(t * 2 + 4000)]);
  return true;
}
/**
 * Parça parça okuyucu: her parça okunmadan önce adim(i) çağrılır (vurgulama için), sonra es (ms) beklenir.
 * Adım değişince ya da durdur() ile kesilir.
 */
export function okuyucu(ctx) {
  let nesil = 0, calisiyor = false;
  const api = {
    get calisiyor() { return calisiyor; },
    durdur() { nesil++; calisiyor = false; try { window.speechSynthesis?.cancel(); } catch { /* yok */ } },
    async oku(parcalar, { hiz = 1, es = 0, dil, adim } = {}) {
      api.durdur();
      const benim = ++nesil;
      calisiyor = true;
      for (let i = 0; i < parcalar.length; i++) {
        if (benim !== nesil) return false;
        const p = typeof parcalar[i] === "string" ? { metin: parcalar[i] } : parcalar[i];
        adim?.(i, p);
        await sesliOku(ctx, p.metin, { hiz: p.hiz ?? hiz, dil: p.dil ?? dil });
        if (benim !== nesil) return false;
        const e = p.es ?? es;
        if (e) await bekle(sesVar(ctx) ? e : Math.min(e, 300));
      }
      if (benim !== nesil) return false;
      calisiyor = false;
      adim?.(-1);
      return true;
    },
  };
  ctx.temizlik(() => api.durdur());
  return api;
}

/* ---------- Kısa ses efektleri (Web Audio) ---------- */
let sesBaglami = null;
export function tik(frekans = 660, sure = 0.06, hacim = 0.12) {
  try {
    sesBaglami ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = sesBaglami.createOscillator(), g = sesBaglami.createGain();
    o.frequency.value = frekans; o.type = "triangle";
    g.gain.setValueAtTime(hacim, sesBaglami.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, sesBaglami.currentTime + sure);
    o.connect(g).connect(sesBaglami.destination);
    o.start(); o.stop(sesBaglami.currentTime + sure + 0.02);
  } catch { /* ses yok */ }
}

/* ---------- Sınıflandırma (dokun-seç-bırak + sürükle-bırak) ---------- */
/**
 * @param {HTMLElement} kap
 * @param {{ ogeler: {id:string, metin:string, kova:string, neden?:string}[], kovalar: {id:string, baslik:string}[],
 *   bitti?: ()=>void, metinler?: object, karisik?: boolean, sutun?: number }} o
 */
export function siniflandir(kap, { ogeler, kovalar, bitti, metinler = {}, karisik = true, sutun }) {
  stil();
  const M = { kontrol: "Kontrol et", havuz: "Kartları uygun kutulara yerleştir: önce karta, sonra kutuya dokun.", bos: "Tüm kartlar yerleştirildi.",
    eksik: (n) => `${n} kart henüz yerleştirilmedi.`, sonuc: (d, n) => `${d}/${n} doğru.`, tamam: "Hepsi doğru!", ipucu: "İpucu:", ...metinler };
  let secili = null;
  const yer = new Map();
  const havuz = el("div", { class: "ort-havuz", "data-bos": M.bos, "data-kova": "" });
  const kartlar = new Map();
  const geri = el("div", { class: "ort-geri" });
  const kovaEl = new Map();
  const izgara = el("div", { class: "ort-kovalar", style: sutun ? `grid-template-columns:repeat(${sutun},minmax(0,1fr))` : "" });

  function sec(id) {
    secili = secili === id ? null : id;
    for (const [k, b] of kartlar) b.classList.toggle("secili", k === secili);
    for (const [, k] of kovaEl) k.kutu.classList.toggle("hedef", !!secili);
  }
  function tasi(id, kovaId) {
    const b = kartlar.get(id);
    if (!b) return;
    b.classList.remove("dogru", "yanlis", "secili");
    if (kovaId && kovaEl.has(kovaId)) { kovaEl.get(kovaId).liste.append(b); yer.set(id, kovaId); }
    else { havuz.append(b); yer.set(id, null); }
    secili = null;
    for (const [, k] of kovaEl) k.kutu.classList.remove("hedef");
    geri.textContent = ""; geri.className = "ort-geri";
  }
  for (const o of karisik ? karistir(ogeler) : ogeler) {
    const b = el("button", { class: "ort-cip", draggable: "true", "data-oge": o.id, type: "button" }, o.metin);
    b.addEventListener("click", (e) => { e.stopPropagation(); sec(o.id); });
    b.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", o.id); });
    kartlar.set(o.id, b);
    havuz.append(b);
    yer.set(o.id, null);
  }
  for (const k of kovalar) {
    const liste = el("div");
    const kutu = el("div", { class: "ort-kova", "data-kova": k.id, role: "button", tabindex: "0" }, el("b", {}, k.baslik), liste);
    const birak = () => secili && tasi(secili, k.id);
    kutu.addEventListener("click", birak);
    kutu.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && birak());
    kutu.addEventListener("dragover", (e) => e.preventDefault());
    kutu.addEventListener("drop", (e) => { e.preventDefault(); tasi(e.dataTransfer.getData("text/plain"), k.id); });
    kovaEl.set(k.id, { kutu, liste });
    izgara.append(kutu);
  }
  havuz.addEventListener("click", () => secili && tasi(secili, null));
  havuz.addEventListener("dragover", (e) => e.preventDefault());
  havuz.addEventListener("drop", (e) => { e.preventDefault(); tasi(e.dataTransfer.getData("text/plain"), null); });

  let bittiMi = false;
  function kontrol() {
    let dogru = 0, eksik = 0, ilkYanlis = null;
    for (const o of ogeler) {
      const b = kartlar.get(o.id), y = yer.get(o.id);
      b.classList.remove("dogru", "yanlis");
      if (!y) { eksik++; continue; }
      if (y === o.kova) { dogru++; b.classList.add("dogru"); } else { b.classList.add("yanlis"); ilkYanlis ||= o; }
    }
    const hepsi = dogru === ogeler.length;
    geri.className = `ort-geri ${hepsi ? "dogru" : "yanlis"}`;
    geri.innerHTML = hepsi ? M.tamam : [M.sonuc(dogru, ogeler.length), eksik ? M.eksik(eksik) : "", ilkYanlis?.neden ? `<br>${M.ipucu} ${ilkYanlis.neden}` : ""].join(" ");
    if (hepsi && !bittiMi) { bittiMi = true; bitti?.(); }
    return hepsi;
  }
  const btn = el("button", { class: "d-btn ana", type: "button", onclick: kontrol }, M.kontrol);
  kap.append(el("div", { class: "ort-alt" }, M.havuz), havuz, izgara, el("div", { class: "d-satir" }, btn, geri));
  return { kontrol, tasi, yer };
}

/* ---------- Eşleştirme ---------- */
const ESLESME_RENK = ["#ffb547", "#4fc3f7", "#5ad38b", "#b89cff", "#ff8a80", "#ffd54f", "#80deea", "#c5e1a5", "#f48fb1", "#a1887f"];
/**
 * @param {{ ciftler: {id:string, sol:string, sag:string, aciklama?:string}[], bitti?: ()=>void, metinler?: object, solBaslik?:string, sagBaslik?:string }} o
 */
export function eslestir(kap, { ciftler, bitti, metinler = {}, solBaslik = "", sagBaslik = "" }) {
  stil();
  const M = { yanlis: "Bu ikisi eşleşmiyor. Tekrar dene.", dogru: "Doğru eşleşme!", tamam: "Tüm eşleştirmeler tamam!", ...metinler };
  const geri = el("div", { class: "ort-geri" });
  let secSol = null, secSag = null, n = 0;
  const sol = el("div", {}, solBaslik ? el("div", { class: "ort-alt" }, solBaslik) : null);
  const sag = el("div", {}, sagBaslik ? el("div", { class: "ort-alt" }, sagBaslik) : null);
  const solB = new Map(), sagB = new Map();
  for (const c of ciftler) {
    const b = el("button", { class: "ort-cip", type: "button", "data-sol": c.id, onclick: () => secim("sol", c.id) }, c.sol);
    solB.set(c.id, b); sol.append(b);
  }
  for (const c of karistir(ciftler)) {
    const b = el("button", { class: "ort-cip", type: "button", "data-sag": c.id, onclick: () => secim("sag", c.id) }, c.sag);
    sagB.set(c.id, b); sag.append(b);
  }
  function boya() {
    for (const [k, b] of solB) b.classList.toggle("secili", k === secSol);
    for (const [k, b] of sagB) b.classList.toggle("secili", k === secSag);
  }
  function secim(taraf, id) {
    const b = (taraf === "sol" ? solB : sagB).get(id);
    if (b.classList.contains("eslesti")) return;
    if (taraf === "sol") secSol = secSol === id ? null : id; else secSag = secSag === id ? null : id;
    boya();
    if (secSol && secSag) {
      const c = ciftler.find((x) => x.id === secSol);
      if (secSol === secSag) {
        const renk = ESLESME_RENK[n++ % ESLESME_RENK.length];
        for (const x of [solB.get(secSol), sagB.get(secSag)]) { x.classList.add("eslesti"); x.classList.remove("secili"); x.style.background = renk; x.disabled = true; }
        geri.className = "ort-geri dogru";
        geri.innerHTML = c.aciklama ? `${M.dogru} ${c.aciklama}` : M.dogru;
        tik(880);
        if (n === ciftler.length) { geri.innerHTML = M.tamam; bitti?.(); }
      } else {
        const x1 = solB.get(secSol), x2 = sagB.get(secSag);
        x1.classList.add("yanlis"); x2.classList.add("yanlis");
        setTimeout(() => { x1.classList.remove("yanlis"); x2.classList.remove("yanlis"); }, 600);
        geri.className = "ort-geri yanlis"; geri.textContent = M.yanlis;
        tik(220);
      }
      secSol = secSag = null;
      boya();
    }
  }
  kap.append(el("div", { class: "ort-eslestir" }, sol, sag), geri);
  return { secim };
}

/* ---------- Sıralama ---------- */
/**
 * @param {{ ogeler: {id:string, metin:string}[] (doğru sırada), bitti?: ()=>void, metinler?: object, karisik?: boolean }} o
 */
export function sirala(kap, { ogeler, bitti, metinler = {}, karisik = true }) {
  stil();
  const M = { kontrol: "Sırayı kontrol et", tamam: "Sıralama doğru!", sonuc: (d, n) => `${d}/${n} kart doğru yerde.`, yukari: "Yukarı taşı", asagi: "Aşağı taşı", ...metinler };
  const liste = el("div", { class: "ort-sirala" });
  const geri = el("div", { class: "ort-geri" });
  let sira = karisik ? karistir(ogeler) : ogeler.slice();
  if (karisik && ogeler.length > 1 && sira.every((o, i) => o.id === ogeler[i].id)) sira = [...sira.slice(1), sira[0]];
  let suruklenen = null, bittiMi = false;
  function ciz() {
    liste.replaceChildren(...sira.map((o, i) => {
      const satir = el("div", { class: "ort-sira", draggable: "true", "data-sira": o.id },
        el("span", { html: o.metin }),
        el("button", { type: "button", title: M.yukari, "aria-label": M.yukari, disabled: i === 0, onclick: () => tasi(i, i - 1) }, "▲"),
        el("button", { type: "button", title: M.asagi, "aria-label": M.asagi, disabled: i === sira.length - 1, onclick: () => tasi(i, i + 1) }, "▼"));
      satir.addEventListener("dragstart", () => { suruklenen = i; satir.classList.add("surukle"); });
      satir.addEventListener("dragend", () => satir.classList.remove("surukle"));
      satir.addEventListener("dragover", (e) => e.preventDefault());
      satir.addEventListener("drop", (e) => { e.preventDefault(); if (suruklenen != null) tasi(suruklenen, i); suruklenen = null; });
      return satir;
    }));
  }
  function tasi(i, j) {
    if (j < 0 || j >= sira.length || i === j) return;
    const [o] = sira.splice(i, 1);
    sira.splice(j, 0, o);
    geri.textContent = ""; geri.className = "ort-geri";
    ciz();
  }
  function kontrol() {
    let d = 0;
    [...liste.children].forEach((s, i) => {
      const ok = sira[i].id === ogeler[i].id;
      if (ok) d++;
      s.classList.toggle("dogru", ok); s.classList.toggle("yanlis", !ok);
    });
    const hepsi = d === ogeler.length;
    geri.className = `ort-geri ${hepsi ? "dogru" : "yanlis"}`;
    geri.textContent = hepsi ? M.tamam : M.sonuc(d, ogeler.length);
    if (hepsi && !bittiMi) { bittiMi = true; bitti?.(); }
    return hepsi;
  }
  ciz();
  kap.append(liste, el("div", { class: "d-satir" }, el("button", { class: "d-btn ana", type: "button", onclick: kontrol }, M.kontrol), geri));
  return { kontrol, tasi, get sira() { return sira.map((o) => o.id); }, ayarla(ids) { sira = ids.map((id) => ogeler.find((o) => o.id === id)); ciz(); } };
}

/* ---------- Dereceli puanlama anahtarı + radar grafiği ---------- */
/**
 * @param {{ olcutler: {ad:string, etiket:string}[], seviyeler: string[], degerler: object, degisti?: (degerler)=>void, mavi?: boolean }} o
 */
export function rubrik(kap, { olcutler, seviyeler, degerler, degisti, mavi = false }) {
  stil();
  const izgara = el("div", { class: `ort-rubrik${mavi ? " mavi" : ""}` }, el("span"), seviyeler.map((s) => el("span", { class: "ust" }, s)));
  for (const o of olcutler) {
    const dugmeler = seviyeler.map((_, i) => el("button", {
      type: "button", "data-olcut": o.ad, "data-puan": String(i + 1), "aria-pressed": String(degerler[o.ad] === i + 1),
      "aria-label": `${o.etiket}: ${seviyeler[i]}`,
      onclick: () => { degerler[o.ad] = i + 1; dugmeler.forEach((b, j) => b.setAttribute("aria-pressed", String(j === i))); degisti?.(degerler); },
    }, String(i + 1)));
    izgara.append(el("span", {}, o.etiket), ...dugmeler);
  }
  kap.append(izgara);
  return izgara;
}

/** Radar (örümcek ağı) grafiği: seriler [{degerler, renk}] — değerler 0..enCok */
export function radar(olcutler, seriler, { enCok = 4, boyut = 300 } = {}) {
  const NS = "http://www.w3.org/2000/svg";
  const s = document.createElementNS(NS, "svg");
  s.setAttribute("viewBox", `${-boyut * 0.18} 0 ${boyut * 1.36} ${boyut}`);
  s.setAttribute("role", "img");
  const m = boyut / 2, r = boyut * 0.33, n = olcutler.length;
  const nokta = (i, oran) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return [m + Math.cos(a) * r * oran, m + Math.sin(a) * r * oran];
  };
  let html = "";
  for (let k = 1; k <= enCok; k++) {
    html += `<polygon points="${olcutler.map((_, i) => nokta(i, k / enCok).join(",")).join(" ")}" fill="none" stroke="rgba(129,147,173,.28)"/>`;
  }
  olcutler.forEach((o, i) => {
    const [x, y] = nokta(i, 1), [tx, ty] = nokta(i, 1.2);
    html += `<line x1="${m}" y1="${m}" x2="${x}" y2="${y}" stroke="rgba(129,147,173,.28)"/>`;
    const hiza = Math.abs(tx - m) < 8 ? "middle" : tx > m ? "start" : "end";
    html += `<text x="${tx}" y="${ty + 4}" fill="#c9d4e4" font-size="${boyut / 26}" text-anchor="${hiza}">${o.kisa || o.etiket}</text>`;
  });
  for (const sr of seriler) {
    const p = olcutler.map((o, i) => nokta(i, Math.max(0, sr.degerler[o.ad] || 0) / enCok).join(",")).join(" ");
    html += `<polygon points="${p}" fill="${sr.renk}" fill-opacity=".22" stroke="${sr.renk}" stroke-width="2.5"/>`;
  }
  s.innerHTML = html;
  return s;
}

/* ---------- Ses kaydı (mikrofon varsa; internet gerekmez) ---------- */
export function kaydedici(kap, ctx, metinler = {}) {
  const M = { kaydet: "● Sesimi kaydet", durdur: "■ Kaydı bitir", yok: "Bu cihazda ses kaydı kullanılamıyor.", izin: "Mikrofon izni verilmedi.", ...metinler };
  const destek = typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  const ses = el("audio", { controls: true, hidden: true });
  const bilgi = el("span", { class: "ort-alt" }, destek ? "" : M.yok);
  let kayit = null, akis = null;
  const btn = el("button", { class: "d-btn", type: "button", disabled: !destek, onclick: async () => {
    if (kayit) { kayit.stop(); return; }
    try {
      akis = await navigator.mediaDevices.getUserMedia({ audio: true });
      const parcalar = [];
      kayit = new MediaRecorder(akis);
      kayit.ondataavailable = (e) => parcalar.push(e.data);
      kayit.onstop = () => {
        ses.src = URL.createObjectURL(new Blob(parcalar, { type: kayit.mimeType }));
        ses.hidden = false; btn.textContent = M.kaydet; kayit = null;
        akis.getTracks().forEach((t) => t.stop());
      };
      kayit.start(); btn.textContent = M.durdur;
    } catch { bilgi.textContent = M.izin; }
  } }, M.kaydet);
  ctx.temizlik(() => { try { kayit?.stop(); akis?.getTracks().forEach((t) => t.stop()); } catch { /* yok */ } });
  kap.append(el("div", { class: "ort-kayit" }, btn, ses, bilgi));
}
