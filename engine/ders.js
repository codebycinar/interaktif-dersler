// Ortak ders kabuğu: giriş ekranı, adımlar, anlatım + sesli okuma, görevler, kontroller, sınav, ilerleme
import { Grafik } from "./grafik.js";
import { anlatimAkisi } from "./anlatim.js";

export { Grafik };

// Paketleyici (tools/paketle.mjs) katalog kaydını buraya gömer
/* global __DERS_META__ */
const META = typeof __DERS_META__ !== "undefined" ? __DERS_META__ : { slug: "gelistirme", baslik: "Ders", ciktilar: [] };

const el = (etiket, ozellik = {}, ...cocuklar) => {
  const e = document.createElement(etiket);
  for (const [k, v] of Object.entries(ozellik)) {
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null && v !== false) e.setAttribute(k, v === true ? "" : v);
  }
  for (const c of cocuklar.flat()) if (c != null) e.append(c);
  return e;
};
export { el };

export const sayi = (v, ondalik = 1) =>
  Number.isFinite(v) ? v.toFixed(ondalik).replace(".", ",").replace(/^-(0,?0*)$/, "$1") : "—";

/* ---------- Kalıcı ilerleme (tarayıcı depolaması yoksa sessizce bellekte tutar) ---------- */
const DEPO_ANAHTARI = `edu:${META.slug}`;
function depoOku() {
  try { return JSON.parse(localStorage.getItem(DEPO_ANAHTARI)) || {}; } catch { return {}; }
}
function depoYaz(veri) {
  try { localStorage.setItem(DEPO_ANAHTARI, JSON.stringify(veri)); } catch { /* özel pencere vb. */ }
}

/* ---------- Sesli anlatım (Web Speech API) ---------- */
// Dersin dili ders.json'daki "dil" alanından gelir (varsayılan tr-TR); İngilizce dersler "en-US" kullanır
const DERS_DILI = META.dil || "tr-TR";
const ses = {
  destek: typeof window !== "undefined" && "speechSynthesis" in window,
  /** dil kodu ("tr-TR", "en-GB" …) için en uygun sesi seçer; doğal/çevrim içi sesler öncelikli */
  sesBul(dil) {
    const kok = dil.split("-")[0].toLowerCase();
    const liste = speechSynthesis.getVoices();
    const uyan = (v) => v.lang.toLowerCase().replace("_", "-").startsWith(kok);
    const tam = (v) => v.lang.toLowerCase().replace("_", "-") === dil.toLowerCase();
    return liste.find((v) => tam(v) && /natural|online/i.test(v.name)) || liste.find(tam)
      || liste.find((v) => uyan(v) && /natural|online/i.test(v.name)) || liste.find(uyan) || null;
  },
  hazirla() {
    if (!this.destek) return;
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener?.("voiceschanged", () => speechSynthesis.getVoices());
  },
  /** Metni (HTML olabilir) okur; bittiğinde bitti() çağrılır */
  konus(html, bitti, { dil = DERS_DILI, hiz = 1 } = {}) {
    if (!this.destek) { bitti?.(); return; }
    this.sus();
    const gecici = document.createElement("div");
    gecici.innerHTML = html;
    let metin = gecici.textContent.replace(/\s+/g, " ").trim();
    if (dil.startsWith("tr")) {
      // formüllerdeki sembolleri okunur hâle getir
      metin = metin.replace(/Δ/g, "delta ").replace(/·/g, " çarpı ").replace(/²/g, " kare").replace(/\bm\/s\b/g, "metre bölü saniye");
    }
    const s = new SpeechSynthesisUtterance(metin);
    s.lang = dil;
    const v = this.sesBul(dil);
    if (v) s.voice = v;
    s.rate = hiz;
    s.onend = s.onerror = () => bitti?.();
    speechSynthesis.speak(s);
  },
  sus() { if (this.destek) speechSynthesis.cancel(); },
};

/**
 * Dersi başlatır.
 * @param {{ adimlar: Array<{baslik:string, cikti?:string, anlatim:string, gorev?:string, ogretmen?:string, kur:(ctx)=>void, kaldir?:(ctx)=>void}>, sahneKur?: (kap:HTMLElement)=>any }} tanim
 */
export function dersBaslat({ adimlar, sahneKur, yerlesim = META.yerlesim }) {
  ses.hazirla();
  // "tam": 3B sahne tüm ekranı kaplar, paneller üstünde yüzer (ders.json → "yerlesim": "tam")
  const tam = yerlesim === "tam";
  if (tam) document.body.classList.add("d-tam");
  const depo = depoOku();
  depo.tamam ||= [];
  depo.yazilar ||= {};
  if (depo.ogretmen) document.body.classList.add("ogretmen-modu");

  document.title = `${META.baslik} · ${META.ders || ""} ${META.sinif ? META.sinif + ". sınıf" : ""}`.trim();

  /* ---------- İskelet ---------- */
  const ciktiCipleri = (META.ciktilar || []).map((c) => el("span", { class: "d-cip", title: c.ifade, "data-kod": c.kod }, c.kod));
  const ogretmenBtn = el("button", {
    class: "d-btn kucuk", "aria-pressed": String(!!depo.ogretmen), title: "Her adımda öğretmen notlarını göster",
    onclick: () => {
      depo.ogretmen = !depo.ogretmen;
      document.body.classList.toggle("ogretmen-modu", depo.ogretmen);
      ogretmenBtn.setAttribute("aria-pressed", String(depo.ogretmen));
      depoYaz(depo);
    },
  }, "Öğretmen modu");

  /* ---------- Dersler arası gezinme ---------- */
  const GEZ = META.gezinti || { ana: null, dersler: [] };
  const ayniDers = GEZ.dersler.filter((d) => d.ders === META.ders);
  const dersSira = ayniDers.findIndex((d) => d.slug === META.slug);
  const sonrakiDers = dersSira >= 0 ? ayniDers[dersSira + 1] : null;
  const oncekiDers = dersSira > 0 ? ayniDers[dersSira - 1] : null;
  try { localStorage.setItem("edu:son", JSON.stringify({ slug: META.slug, zaman: Date.now() })); } catch { /* depolama kapalı */ }
  const menuBtn = el("button", { class: "d-btn kucuk d-menu-btn", title: "Tüm dersler (M)", "aria-haspopup": "dialog", onclick: () => menuAc() }, "☰ Dersler");
  const evBtn = GEZ.ana ? el("a", { class: "d-btn kucuk d-ev", href: GEZ.ana, title: "Ana sayfa", "aria-label": "Ana sayfa" }, "⌂") : null;

  const ust = el("header", { class: "d-ust" },
    evBtn, menuBtn,
    el("div", { style: "min-width:0" },
      el("div", { class: "d-yol" }, [META.sinif && `${META.sinif}. Sınıf`, META.ders, META.unite].filter(Boolean).join(" › ")),
      el("h1", {}, META.baslik)),
    el("div", { class: "d-bosluk" }),
    el("div", { class: "d-ciktilar" }, ciktiCipleri),
    ogretmenBtn);

  const adimListesi = el("ol");
  const adimNav = el("nav", { class: "d-adimlar", "aria-label": "Ders adımları" }, adimListesi);
  const sahne = el("main", { class: "d-sahne" });
  const katman = el("div", { class: "d-katman" });
  sahne.append(katman);
  const panel = el("aside", { class: "d-panel", "aria-live": "polite" });
  const ilerleme = el("i");
  const sayac = el("span", { class: "d-sayac" });
  const geriBtn = el("button", { class: "d-btn", onclick: () => git(simdiki - 1) }, "‹ Geri");
  const ileriBtn = el("button", { class: "d-btn ana", onclick: () => {
    if (simdiki === adimlar.length - 1 && sonrakiDers) location.href = sonrakiDers.href;
    else git(simdiki + 1);
  } }, "İleri ›");
  const alt = el("footer", { class: "d-alt" }, geriBtn, el("div", { class: "d-ilerleme" }, ilerleme), sayac, ileriBtn);

  const uygulama = el("div", { class: "d-uygulama" }, ust, adimNav, sahne, panel, alt);
  document.body.append(uygulama);

  /* Tam ekran yerleşimde: panelleri daralt/gizle ve sahneye görünür alanı bildir */
  if (tam) {
    const durum = { solDar: !!depo.solDar, panelGizli: false };
    const solBtn = el("button", { class: "d-kenar-btn sol", title: "Adım listesini daralt / genişlet", "aria-label": "Adım listesini daralt" }, "‹");
    const panelBtn = el("button", { class: "d-kenar-btn sag", title: "Anlatım panelini gizle / göster (P)", "aria-label": "Anlatım panelini gizle" }, "›");
    adimNav.append(solBtn);
    uygulama.append(panelBtn);
    const uygula = () => {
      document.body.classList.toggle("d-sol-dar", durum.solDar);
      document.body.classList.toggle("d-panel-gizli", durum.panelGizli);
      solBtn.textContent = durum.solDar ? "›" : "‹";
      panelBtn.textContent = durum.panelGizli ? "‹ Anlatım" : "›";
      yerlesimGuncelle();
    };
    solBtn.onclick = () => { durum.solDar = !durum.solDar; depo.solDar = durum.solDar; depoYaz(depo); uygula(); };
    panelBtn.onclick = () => { durum.panelGizli = !durum.panelGizli; uygula(); };
    document.addEventListener("keydown", (e) => {
      if (e.target.closest("input, textarea, select")) return;
      if (e.key === "p" || e.key === "P") panelBtn.click();
    });
    function yerlesimGuncelle() {
      const genis = window.innerWidth > 760;
      const s = uygulama.style;
      const gorunur = (e) => e.offsetParent !== null && getComputedStyle(e).visibility !== "hidden";
      s.setProperty("--ust-bosluk", `${genis ? ust.offsetHeight + 12 : 0}px`);
      s.setProperty("--alt-bosluk", `${genis ? alt.offsetHeight + 12 : 0}px`);
      s.setProperty("--sol-bosluk", `${genis && gorunur(adimNav) ? adimNav.offsetWidth + 12 : 0}px`);
      s.setProperty("--sag-bosluk", `${genis && !durum.panelGizli ? panel.offsetWidth + 12 : 0}px`);
      window.dispatchEvent(new Event("d-yerlesim"));
    }
    const ro = new ResizeObserver(yerlesimGuncelle);
    [ust, alt, adimNav, panel].forEach((e) => ro.observe(e));
    window.addEventListener("resize", yerlesimGuncelle);
    uygula();
    // Panel geçişi (CSS) bittiğinde son konumu bir kez daha bildir
    panel.addEventListener("transitionend", yerlesimGuncelle);
  }

  const adimDugmeleri = adimlar.map((a, i) => {
    const li = el("li", {},
      el("button", { onclick: () => git(i) }, el("span", { class: "d-no" }, el("span", {}, String(i + 1))), el("span", {}, a.baslik)));
    adimListesi.append(li);
    return li;
  });

  const sahneApi = sahneKur ? sahneKur(sahne) : null;

  /* ---------- Adım bağlamı ---------- */
  let simdiki = -1;
  let temizlikler = [];
  let gorevKutusu = null;

  function ilerlemeGuncelle() {
    adimDugmeleri.forEach((li, i) => li.classList.toggle("tamam", depo.tamam.includes(i)));
    const gorevli = adimlar.filter((a) => a.gorev).length || 1;
    const biten = depo.tamam.filter((i) => adimlar[i]?.gorev).length;
    ilerleme.style.width = `${(biten / gorevli) * 100}%`;
    sayac.textContent = `Adım ${simdiki + 1}/${adimlar.length} · ${biten}/${gorevli} görev`;
    // Ana sayfa ve ders menüsü ilerlemeyi buradan okur
    depo.ozet = { biten, toplam: gorevli };
    depoYaz(depo);
  }

  /* Ders menüsü: aynı sınıfın dersleri, derse göre gruplu, ilerlemeyle */
  function ilerlemeOku(slug) {
    try { return JSON.parse(localStorage.getItem(`edu:${slug}`))?.ozet || null; } catch { return null; }
  }
  function menuAc() {
    if (document.querySelector(".d-menu-ortu")) return;
    const kapat = () => { ortu.remove(); document.removeEventListener("keydown", esc); menuBtn.focus(); };
    const esc = (e) => { if (e.key === "Escape") kapat(); };
    const ara = el("input", { type: "search", placeholder: "Ders ara…", "aria-label": "Ders ara" });
    const liste = el("div", { class: "d-menu-liste" });
    const ciz = () => {
      const q = ara.value.trim().toLocaleLowerCase("tr");
      const gruplar = new Map();
      for (const d of GEZ.dersler) {
        if (q && !`${d.ders} ${d.unite} ${d.baslik}`.toLocaleLowerCase("tr").includes(q)) continue;
        if (!gruplar.has(d.ders)) gruplar.set(d.ders, []);
        gruplar.get(d.ders).push(d);
      }
      liste.replaceChildren(...[...gruplar].map(([ders, ds]) => el("section", {},
        el("h4", {}, ders),
        ds.map((d) => {
          const o = ilerlemeOku(d.slug);
          const yuzde = o ? Math.round((o.biten / o.toplam) * 100) : 0;
          const buDers = d.slug === META.slug;
          return el("a", { class: `d-menu-ders${buDers ? " simdi" : ""}`, href: buDers ? "#" : d.href, onclick: buDers ? (e) => { e.preventDefault(); kapat(); } : null },
            el("span", { class: "d-menu-unite" }, d.unite),
            el("b", {}, d.baslik),
            el("span", { class: "d-menu-ilerleme", title: o ? `${o.biten}/${o.toplam} görev` : "Başlanmadı" },
              el("i", { style: `width:${yuzde}%` }), el("em", {}, buDers ? "Şu an buradasın" : o ? (yuzde === 100 ? "Tamamlandı ✓" : `%${yuzde}`) : "Başlanmadı")));
        }))));
      if (!gruplar.size) liste.append(el("p", { class: "d-menu-bos" }, "Eşleşen ders yok."));
    };
    ara.addEventListener("input", ciz);
    const ortu = el("div", { class: "d-ortu d-menu-ortu", role: "dialog", "aria-label": "Dersler", onclick: (e) => e.target === ortu && kapat() },
      el("div", { class: "d-kart d-menu" },
        el("div", { class: "d-menu-ust" },
          el("h3", {}, `${META.sinif ? META.sinif + ". Sınıf " : ""}Dersler`),
          el("div", { class: "d-bosluk" }),
          GEZ.ana ? el("a", { class: "d-btn kucuk", href: GEZ.ana }, "⌂ Ana sayfa") : null,
          el("button", { class: "d-btn kucuk", onclick: kapat, "aria-label": "Kapat" }, "✕")),
        el("div", { class: "d-satir d-menu-komsu" },
          oncekiDers ? el("a", { class: "d-btn", href: oncekiDers.href }, `‹ ${oncekiDers.baslik}`) : null,
          el("div", { class: "d-bosluk" }),
          sonrakiDers ? el("a", { class: "d-btn ana", href: sonrakiDers.href }, `${sonrakiDers.baslik} ›`) : null),
        ara, liste));
    ciz();
    document.body.append(ortu);
    document.addEventListener("keydown", esc);
    ara.focus();
    liste.querySelector(".simdi")?.scrollIntoView({ block: "center" });
  }
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select") || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "m" || e.key === "M") { e.preventDefault(); menuAc(); }
  });

  function baglamOlustur(i, kontroller) {
    // Anlatım kareleri oynarken (ve anlatBitti sıfırlarken) yapılan gösterim görevi tamamlamaz
    let gosterim = false;
    const ctx = {
      meta: META,
      sahne: sahneApi,
      katman,
      kontroller,
      adimNo: i,
      /** Adım değişince çalışacak temizlik fonksiyonu */
      temizlik(fn) { temizlikler.push(fn); },
      gorevTamam() {
        if (gosterim) return;
        if (!depo.tamam.includes(i)) { depo.tamam.push(i); depoYaz(depo); }
        gorevKutusu?.classList.add("tamam");
        gorevKutusu?.classList.remove("onceden");
        ilerlemeGuncelle();
      },
      gorevTamamMi: () => depo.tamam.includes(i),
      /** Adım adım anlatım şu an oynuyor mu (gösterim görev saymaz) */
      gosteriyor: () => gosterim,
      _gosterim(v) { gosterim = v; },
      kaydirici(o) { const k = kaydirici(o); kontroller.append(k.el); return k; },
      dugmeler(liste) {
        const satir = el("div", { class: "d-satir" });
        const sonuc = liste.map((o) => {
          const b = el("button", { class: `d-btn${o.ana ? " ana" : ""}`, onclick: o.tik }, o.metin);
          satir.append(b);
          return b;
        });
        kontroller.append(satir);
        return sonuc;
      },
      secenekler(o) { const s = secenekler(o); kontroller.append(s.el); return s; },
      gostergeler(liste, hedef = kontroller) {
        const kap = el("div", { class: "d-gostergeler" });
        const harita = {};
        for (const g of liste) {
          const b = el("b", {}, "—");
          kap.append(el("div", { class: "d-gosterge" }, el("span", {}, g.etiket), b));
          harita[g.ad] = { b, g };
        }
        hedef.append(kap);
        return {
          el: kap,
          ayarla(ad, v) {
            const h = harita[ad];
            if (!h) return;
            h.b.textContent = typeof v === "string" ? v : `${sayi(v, h.g.ondalik ?? 1)}${h.g.birim ? " " + h.g.birim : ""}`;
          },
        };
      },
      tablo(basliklar) {
        const govde = el("tbody");
        const kutu = el("div", { class: "d-tablo-kutu" },
          el("table", { class: "d-tablo" }, el("thead", {}, el("tr", {}, basliklar.map((b) => el("th", {}, b)))), govde));
        kontroller.append(kutu);
        return {
          el: kutu,
          satirEkle(hucreler) { govde.append(el("tr", {}, hucreler.map((h) => el("td", {}, h)))); kutu.scrollTop = kutu.scrollHeight; },
          temizle() { govde.replaceChildren(); },
        };
      },
      not(html) { const n = el("div", { class: "d-anlatim", html }); kontroller.append(n); return n; },
      /** Sayısal cevap kutusu; kontrol(v) true dönerse doğru kabul edilir */
      sayiSorusu({ etiket, birim, kontrol, dogruMesaj = "Doğru!", yanlisMesaj = "Tekrar dene." }) {
        const girdi = el("input", { type: "text", inputmode: "decimal", "aria-label": etiket });
        const geri = el("div", { class: "d-geri-bildirim" });
        const dene = () => {
          const v = parseFloat(girdi.value.replace(",", "."));
          if (!Number.isFinite(v)) { geri.className = "d-geri-bildirim yanlis"; geri.textContent = "Bir sayı yaz."; return; }
          const sonuc = kontrol(v);
          const dogru = sonuc === true;
          geri.className = `d-geri-bildirim ${dogru ? "dogru" : "yanlis"}`;
          geri.textContent = dogru ? dogruMesaj : typeof sonuc === "string" ? sonuc : yanlisMesaj;
        };
        girdi.addEventListener("keydown", (e) => e.key === "Enter" && dene());
        const kap = el("div", {},
          el("div", { class: "d-anlatim" }, el("p", { html: etiket })),
          el("div", { class: "d-girdi" }, girdi, birim ? el("span", {}, birim) : null, el("button", { class: "d-btn", onclick: dene }, "Kontrol et")),
          geri);
        kontroller.append(kap);
        return { el: kap, girdi, geri };
      },
      /** Öğrencinin kendi cümleleriyle yazdığı, cihazda saklanan açıklama */
      yaziAlani({ etiket, anahtar, enAz = 40, yeterli }) {
        const t = el("textarea", { "aria-label": etiket, placeholder: "Kendi cümlelerinle yaz…" });
        t.value = depo.yazilar[anahtar] || "";
        const bilgi = el("div", { class: "d-geri-bildirim" });
        const guncelle = () => {
          depo.yazilar[anahtar] = t.value;
          depoYaz(depo);
          const n = t.value.trim().length;
          bilgi.textContent = n < enAz ? `${n}/${enAz} karakter` : "Kaydedildi ✓";
          bilgi.className = `d-geri-bildirim ${n >= enAz ? "dogru" : ""}`;
          if (n >= enAz) yeterli?.(t.value);
        };
        t.addEventListener("input", guncelle);
        const kap = el("div", {}, el("div", { class: "d-anlatim" }, el("p", { html: etiket })), el("div", { class: "d-girdi" }, t), bilgi);
        kontroller.append(kap);
        guncelle();
        return kap;
      },
      /** Sahnenin altına grafik paneli açar */
      grafikler(tanimlar) {
        const kap = el("div", { class: "d-grafikler", style: `--sutun:${tanimlar.length}` });
        katman.append(kap);
        const liste = tanimlar.map((t) => {
          const k = el("div", { class: "d-grafik" });
          kap.append(k);
          return new Grafik(k, t);
        });
        temizlikler.push(() => liste.forEach((g) => g.yokEt()));
        return liste;
      },
      /**
       * Bir metni sesli okur (diyalog, şiir, dinleme etkinliği). Promise, okuma bitince çözülür.
       * Adım değişince okuma otomatik durur. Tarayıcı desteklemiyorsa hemen çözülür.
       */
      seslendir(metin, { dil, hiz } = {}) {
        return new Promise((coz) => ses.konus(metin, coz, { dil, hiz }));
      },
      sesDestegi: ses.destek,
      /** Sahne üstünde çoktan seçmeli / sayısal sorulardan oluşan sınav */
      sinav(sorular, secenek = {}) { return sinav(katman, sorular, secenek, () => ctx.gorevTamam()); },
    };
    return ctx;
  }

  function git(i) {
    if (i < 0 || i >= adimlar.length || i === simdiki) return;
    ses.sus();
    if (simdiki >= 0) {
      adimlar[simdiki].kaldir?.(sonCtx);
      for (const fn of temizlikler.splice(0)) { try { fn(); } catch (e) { console.error(e); } }
    }
    katman.replaceChildren();
    simdiki = i;
    const a = adimlar[i];

    adimDugmeleri.forEach((li, j) => {
      const b = li.querySelector("button");
      if (j === i) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });
    ciktiCipleri.forEach((c) => c.classList.toggle("aktif", !!a.cikti && a.cikti.startsWith(c.dataset.kod)));

    const dinleBtn = el("button", {
      class: "d-btn kucuk", disabled: !ses.destek,
      title: ses.destek ? "Anlatımı sesli oku" : "Bu tarayıcı sesli okumayı desteklemiyor",
      onclick: () => {
        if (dinleBtn.dataset.caliyor) { ses.sus(); return; }
        dinleBtn.dataset.caliyor = "1"; dinleBtn.textContent = "■ Durdur";
        ses.konus(a.anlatim, () => { delete dinleBtn.dataset.caliyor; dinleBtn.textContent = "🔊 Dinle"; });
      },
    }, "🔊 Dinle");

    const kontroller = el("div", { class: "d-kontroller" });
    gorevKutusu = a.gorev ? el("div", { class: `d-gorev${depo.tamam.includes(i) ? " tamam onceden" : ""}`, html: a.gorev }) : null;
    // Adım adım anlatım varsa: önce kareler, bitince "Şimdi sen dene" bölümü açılır
    const adimAdim = Array.isArray(a.anlat) && a.anlat.length > 0;
    const uygulamaBlok = el("div", { class: "d-uygulama-blok" },
      adimAdim ? el("div", { class: "d-sen-dene" }, "Şimdi sen dene") : null, gorevKutusu, kontroller);
    const anlatimKap = el("div");
    // replaceChildren null'u "null" metni olarak ekler; boş parçalar ayıklanır
    panel.replaceChildren(...[
      el("div", {},
        a.cikti ? el("div", { class: "d-adim-cikti", title: ciktiIfadesi(a.cikti) }, a.cikti) : null,
        el("h2", {}, `${i + 1}. ${a.baslik}`)),
      adimAdim ? null : el("div", { class: "d-sesli" }, dinleBtn),
      adimAdim ? anlatimKap : el("div", { class: "d-anlatim", html: a.anlatim }),
      uygulamaBlok,
      a.ogretmen ? el("div", { class: "d-ogretmen", html: a.ogretmen }) : null,
    ].filter(Boolean));
    panel.scrollTop = 0;

    geriBtn.disabled = i === 0;
    // Son adımda İleri düğmesi aynı dersin bir sonraki konusuna götürür
    const son = i === adimlar.length - 1;
    ileriBtn.disabled = son && !sonrakiDers;
    ileriBtn.textContent = son && sonrakiDers ? "Sonraki ders ›" : "İleri ›";
    ileriBtn.title = son && sonrakiDers ? sonrakiDers.baslik : "";
    depo.sonAdim = i; depoYaz(depo);

    sonCtx = baglamOlustur(i, kontroller);
    let api = null;
    try { api = a.kur(sonCtx); } catch (e) { console.error(e); kontroller.append(el("div", { class: "d-geri-bildirim yanlis" }, "Bu adım yüklenirken hata oluştu: " + e.message)); }
    aktifAkis = null;
    if (adimAdim) {
      depo.anlatildi ||= [];
      const izlendi = depo.anlatildi.includes(i);
      aktifAkis = anlatimAkisi({
        kareler: a.anlat, api, ctx: sonCtx, ses, ozetHtml: a.anlatim,
        // ↺ Baştan dahil: anlatım oynarken alıştırma gizli, gösterim görev saymaz
        basladi: () => { uygulamaBlok.hidden = true; sonCtx._gosterim(true); },
        bitince: () => {
          // Adım, anlatımdaki gösterimin bıraktığı durumu alıştırma için sıfırlayabilir
          try { a.anlatBitti?.(api, sonCtx); } catch (e) { console.error(e); }
          sonCtx._gosterim(false);
          uygulamaBlok.hidden = false;
          if (!depo.anlatildi.includes(i)) { depo.anlatildi.push(i); depoYaz(depo); }
          requestAnimationFrame(() => uygulamaBlok.scrollIntoView({ block: "start", behavior: "smooth" }));
        },
      });
      anlatimKap.replaceWith(aktifAkis.el);
      if (izlendi) aktifAkis.izlendi();
      else aktifAkis.baslat();
    }
    ilerlemeGuncelle();
  }
  let sonCtx = null;
  let aktifAkis = null;

  function ciktiIfadesi(kod) {
    const ana = (META.ciktilar || []).find((c) => kod.startsWith(c.kod));
    return ana ? `${ana.kod} ${ana.ifade}` : kod;
  }

  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select") || document.querySelector(".d-menu-ortu")) return;
    // Sağ ok / sunum kumandası: önce anlatımın bir sonraki karesi, anlatım bitince sonraki adım
    if (e.key === "ArrowRight" || e.key === "PageDown") {
      if (aktifAkis && !aktifAkis.bitti()) aktifAkis.ileri();
      else git(simdiki + 1);
    }
    if (e.key === "ArrowLeft" || e.key === "PageUp") git(simdiki - 1);
  });

  /* ---------- Giriş ekranı ---------- */
  const baslangic = Math.min(depo.sonAdim ?? 0, adimlar.length - 1);
  git(baslangic);
  // İlk açılışta ya da ders yarıda bırakılmışsa giriş ekranı gösterilir; öğrenci baştan başlamayı veya devam etmeyi seçer
  if (!depo.girisGoruldu || baslangic > 0) girisGoster();

  function girisGoster() {
    const ortu = el("div", { class: "d-ortu" });
    const kapat = (hedef) => { ortu.remove(); depo.girisGoruldu = true; depoYaz(depo); if (hedef != null) git(hedef); };
    ortu.append(el("div", { class: "d-kart d-giris" },
      el("div", { class: "d-ust-baslik" }, [META.ders, META.unite].filter(Boolean).join(" · ")),
      el("div", { class: "d-soru" }, META.soru || META.baslik),
      META.ciktilar?.length ? el("div", {}, el("b", {}, "Bu derste:"),
        el("ul", {}, META.ciktilar.map((c) => el("li", {}, el("code", {}, c.kod), " ", c.ifade)))) : null,
      el("div", { class: "d-satir" },
        el("button", { class: "d-btn ana", onclick: () => kapat(0) }, depo.sonAdim ? "Baştan başla" : "Başla"),
        depo.sonAdim ? el("button", { class: "d-btn", onclick: () => kapat(depo.sonAdim) }, `Kaldığın yerden devam et (${depo.sonAdim + 1}. adım)`) : null)));
    sahne.append(ortu);
  }
  // Başlıktaki ders adına tıklayınca giriş ekranı tekrar açılır
  ust.querySelector("h1").style.cursor = "pointer";
  ust.querySelector("h1").addEventListener("click", girisGoster);

  return { git, sahne: sahneApi };
}

/* ---------- Kontrol bileşenleri ---------- */
let kimlikSayaci = 0;
function kaydirici({ etiket, min, max, adim = 1, deger, birim = "", ondalik, degisti }) {
  const id = `k${++kimlikSayaci}`;
  const ond = ondalik ?? (String(adim).split(".")[1]?.length || 0);
  const girdi = el("input", { type: "range", id, min, max, step: adim, value: deger });
  const cikti = el("output", { for: id });
  const yaz = () => (cikti.textContent = `${sayi(+girdi.value, ond)} ${birim}`.trim());
  girdi.addEventListener("input", () => { yaz(); degisti?.(+girdi.value); });
  yaz();
  return {
    el: el("div", { class: "d-kaydirici" }, el("label", { for: id }, etiket), cikti, girdi),
    get deger() { return +girdi.value; },
    set deger(v) { girdi.value = v; yaz(); },
    etkin(acik) { girdi.disabled = !acik; },
  };
}

function secenekler({ etiket, liste, deger, degisti }) {
  const grup = el("div", { class: "d-grup", role: "group", "aria-label": etiket });
  let secili = deger;
  const dugmeler = liste.map((o) => {
    const b = el("button", { class: "d-btn", "aria-pressed": String(o.deger === secili), onclick: () => sec(o.deger, true) }, o.metin);
    grup.append(b);
    return [o.deger, b];
  });
  function sec(v, kullanici) {
    secili = v;
    for (const [d, b] of dugmeler) b.setAttribute("aria-pressed", String(d === v));
    if (kullanici) degisti?.(v);
  }
  return {
    el: el("div", { class: "d-secenekler" }, etiket ? el("span", {}, etiket) : null, grup),
    get deger() { return secili; },
    set deger(v) { sec(v, false); },
    etkin(acik) { for (const [, b] of dugmeler) b.disabled = !acik; },
  };
}

/* ---------- Sınav ---------- */
/**
 * sorular: [{ metin, tur: "coktan"|"sayi", siklar?, dogru, tolerans?, birim?, aciklama, grafik?: (kap)=>void }]
 */
function sinav(katman, sorular, { baslik = "Değerlendirme", gecmeOrani = 0.7 } = {}, gecti) {
  const ortu = el("div", { class: "d-ortu" });
  const kart = el("div", { class: "d-kart d-sinav" });
  ortu.append(kart);
  katman.append(ortu);
  const sonuclar = [];
  let n = 0;

  function noktalar() {
    return el("div", { class: "d-ilerleme-noktalari" },
      sorular.map((_, i) => el("i", { class: sonuclar[i] === true ? "dogru" : sonuclar[i] === false ? "yanlis" : i === n ? "simdi" : "" })));
  }

  function goster() {
    const s = sorular[n];
    const aciklama = el("div", { class: "d-aciklama", hidden: true });
    const sonraki = el("button", { class: "d-btn ana", hidden: true, onclick: () => { n++; n < sorular.length ? goster() : bitir(); } },
      n === sorular.length - 1 ? "Sonucu gör" : "Sonraki soru ›");
    const cevapla = (dogru) => {
      sonuclar[n] = dogru;
      aciklama.hidden = false;
      aciklama.innerHTML = `<b style="color:var(--${dogru ? "yesil" : "kirmizi"})">${dogru ? "Doğru!" : "Yanlış."}</b> ${s.aciklama || ""}`;
      sonraki.hidden = false;
      kart.querySelector(".d-ilerleme-noktalari").replaceWith(noktalar());
      sonraki.focus();
    };
    let govde;
    if (s.tur === "sayi") {
      const girdi = el("input", { type: "text", inputmode: "decimal", "aria-label": "Cevap" });
      const btn = el("button", { class: "d-btn", onclick: () => {
        const v = parseFloat(girdi.value.replace(",", "."));
        if (!Number.isFinite(v)) return;
        girdi.disabled = btn.disabled = true;
        cevapla(Math.abs(v - s.dogru) <= (s.tolerans ?? 0.01 * Math.abs(s.dogru) + 1e-9));
      } }, "Cevapla");
      girdi.addEventListener("keydown", (e) => e.key === "Enter" && btn.click());
      govde = el("div", { class: "d-girdi" }, girdi, s.birim ? el("span", {}, s.birim) : null, btn);
      setTimeout(() => girdi.focus(), 0);
    } else {
      govde = el("div", { class: "d-siklar" });
      s.siklar.forEach((sik, i) => {
        govde.append(el("button", { class: "d-btn", onclick: (e) => {
          govde.querySelectorAll("button").forEach((b, j) => { b.disabled = true; if (j === s.dogru) b.classList.add("dogru"); });
          if (i !== s.dogru) e.currentTarget.classList.add("yanlis");
          cevapla(i === s.dogru);
        } }, `${"ABCDE"[i]}) ${sik}`));
      });
    }
    const grafikKap = s.grafik ? el("div", { class: "d-sinav-grafik" }) : null;
    kart.replaceChildren(
      el("h3", {}, `${baslik} · Soru ${n + 1}/${sorular.length}`),
      noktalar(),
      ...(grafikKap ? [grafikKap] : []),
      el("div", { class: "d-soru-metni", html: s.metin }),
      govde, aciklama,
      el("div", { class: "d-satir", style: "margin-top:14px;justify-content:flex-end" }, sonraki));
    if (grafikKap) requestAnimationFrame(() => s.grafik(grafikKap));
  }

  function bitir() {
    const dogru = sonuclar.filter(Boolean).length;
    const oran = dogru / sorular.length;
    if (oran >= gecmeOrani) gecti();
    kart.replaceChildren(
      el("h3", {}, baslik),
      el("div", { class: "d-puan" }, `${dogru} / ${sorular.length}`),
      el("p", {}, oran === 1 ? "Mükemmel! Tüm soruları doğru cevapladın." : oran >= gecmeOrani ? "Tebrikler, bu dersi başarıyla tamamladın." : "Yanlış yaptığın soruların konusuna ait adımlara dönüp tekrar deneyebilirsin."),
      el("div", { class: "d-satir" }, el("button", { class: "d-btn ana", onclick: () => { sonuclar.length = 0; n = 0; goster(); } }, "Tekrar dene")));
  }

  goster();
  return ortu;
}
