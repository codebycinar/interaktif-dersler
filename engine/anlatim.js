// Adım adım (etkileşimli) anlatım: kısa "kareler" tek tek gelir, her kare sahnede bir şey yapar.
// Formül sembol sembol kurulur, çözümlü örnek satır satır açılır, arada mini sorular sorulur.
// Anlatım bitince adımın alıştırma bölümü ("Şimdi sen dene") açılır.
//
// Adım tanımında:
//   anlat: [
//     { s: "Kısa bir cümle.", yap(api, ctx) { /* sahnede göster */ } },
//     { formul: [["v", "hız"], ["="], ["Δx", "yer değiştirme"], ["/"], ["Δt", "geçen süre"]], s: "…", oku: "ve eşittir delta x bölü delta t" },
//     { cozum: ["Verilen: …", "Formül: …", "Yerine koy: …", "Sonuç: …"], baslik: "Çözümlü örnek" },
//     { soru: "…?", secenekler: ["…", "…"], dogru: 1, aciklama: "…", ipucu: "…" },
//     { s: "…", etkilesim(api, ctx, tamam, kap) { /* öğrenci bir şey yapınca tamam() */ } },
//   ]
// api: adımın kur(ctx) fonksiyonunun döndürdüğü nesne (sahne tutamaçları).

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

const SESLI_ANAHTAR = "edu:sesli";
const sesliMi = () => { try { return localStorage.getItem(SESLI_ANAHTAR) === "1"; } catch { return false; } };
const sesliYaz = (v) => { try { localStorage.setItem(SESLI_ANAHTAR, v ? "1" : "0"); } catch { /* depolama kapalı */ } };

/** Çözüm satırlarını ayrı karelere açar (her satır ayrı "Devam" ile gelir) */
function duzlestir(kareler) {
  const sonuc = [];
  for (const k of kareler) {
    if (Array.isArray(k.cozum)) {
      k.cozum.forEach((satir, j) => sonuc.push({ ...k, cozum: undefined, s: satir, cozumSatiri: j, cozumBaslik: j === 0 ? (k.baslik || "Çözümlü örnek") : null, cozumSon: j === k.cozum.length - 1 }));
    } else sonuc.push(k);
  }
  return sonuc;
}

/**
 * @returns {{ el: HTMLElement, ileri: () => boolean, bitti: () => boolean, baslat: () => void }}
 * ileri(): bir sonraki kareye geçebildiyse true; anlatım bitmişse ya da kare cevap bekliyorsa false
 */
export function anlatimAkisi({ kareler, api, ctx, ses, bitince, ozetHtml }) {
  const liste = duzlestir(kareler);
  let n = -1, bitti = false, bekliyor = false;

  const sesliBtn = el("button", { class: "d-btn kucuk", "aria-pressed": String(sesliMi()), title: "Her kareyi sesli oku", disabled: !ses.destek }, sesliMi() ? "🔊 Sesli: açık" : "🔈 Sesli: kapalı");
  sesliBtn.onclick = () => {
    const v = !sesliMi(); sesliYaz(v);
    sesliBtn.setAttribute("aria-pressed", String(v));
    sesliBtn.textContent = v ? "🔊 Sesli: açık" : "🔈 Sesli: kapalı";
    if (v && n >= 0) oku(liste[n]); else ses.sus();
  };
  const bastanBtn = el("button", { class: "d-btn kucuk", title: "Anlatımı baştan izle", onclick: () => baslat() }, "↺ Baştan");
  const ozetBtn = ozetHtml ? el("button", { class: "d-btn kucuk", title: "Bu adımın kısa özeti" }, "📄 Özet") : null;
  const ozetKutu = ozetHtml ? el("div", { class: "d-anlatim d-adim-ozet", html: ozetHtml, hidden: true }) : null;
  if (ozetBtn) ozetBtn.onclick = () => { ozetKutu.hidden = !ozetKutu.hidden; };

  const akis = el("div", { class: "d-akis" });
  const devamBtn = el("button", { class: "d-btn ana d-devam" }, "Devam ›");
  devamBtn.onclick = () => ileri();
  const kok = el("div", { class: "d-anlat" },
    el("div", { class: "d-anlat-ust" }, sesliBtn, el("span", { class: "d-bosluk" }), ozetBtn, bastanBtn),
    ozetKutu, akis,
    el("div", { class: "d-anlat-alt" }, el("span", { class: "d-kare-sayac" }), devamBtn));
  const sayac = kok.querySelector(".d-kare-sayac");

  function oku(k) {
    if (!sesliMi() || !ses.destek) return;
    const metin = k.oku ?? [k.cozumBaslik, k.s, k.soru].filter(Boolean).join(". ");
    if (metin) ses.konus(metin);
  }

  function formulCiz(parcalar) {
    return el("div", { class: "d-formul-kur", role: "math" },
      parcalar.map(([t, ac], j) => el("span", { class: `d-fparca${ac ? " anlamli" : ""}`, style: `animation-delay:${j * 0.45}s` },
        el("b", { html: t }), ac ? el("small", { html: ac }) : null)));
  }

  function soruCiz(k, kap) {
    const geri = el("div", { class: "d-geri-bildirim" });
    const siklar = el("div", { class: "d-kare-siklar" }, k.secenekler.map((m, j) => el("button", { class: "d-btn", html: m, onclick: (e) => {
      const b = e.currentTarget;
      if (j === k.dogru) {
        siklar.querySelectorAll("button").forEach((x) => (x.disabled = true));
        b.classList.add("dogru");
        geri.className = "d-geri-bildirim dogru";
        geri.innerHTML = `✓ ${k.aciklama || "Doğru!"}`;
        cevaplandi();
      } else {
        b.classList.add("yanlis"); b.disabled = true;
        geri.className = "d-geri-bildirim yanlis";
        geri.innerHTML = k.ipucu ? `Tam değil. İpucu: ${k.ipucu}` : "Tam değil, bir daha düşün.";
      }
    } })));
    kap.append(el("p", { class: "d-kare-soru", html: `🤔 ${k.soru}` }), siklar, geri);
  }

  function cevaplandi() { bekliyor = false; dugmeGuncelle(); }

  function dugmeGuncelle() {
    const son = n >= liste.length - 1;
    devamBtn.disabled = bekliyor;
    devamBtn.textContent = bekliyor ? "Önce cevapla" : son ? "Anladım, şimdi deneyeyim ›" : "Devam ›";
    sayac.textContent = `${Math.min(n + 1, liste.length)}/${liste.length}`;
  }

  function goster(k) {
    akis.querySelector(".d-kare.simdi")?.classList.remove("simdi");
    const kap = el("div", { class: `d-kare simdi${k.cozumSatiri != null ? " cozum" : ""}${k.cozumSon ? " cozum-son" : ""}` });
    if (k.cozumBaslik) kap.append(el("div", { class: "d-cozum-baslik" }, k.cozumBaslik));
    if (k.formul) kap.append(formulCiz(k.formul));
    if (k.s) kap.append(el("p", { html: k.s }));
    bekliyor = false;
    if (k.soru) { bekliyor = true; soruCiz(k, kap); }
    if (k.etkilesim) {
      bekliyor = true;
      const ek = el("div", { class: "d-kare-etkilesim" });
      kap.append(ek);
      try { k.etkilesim(api, ctx, () => { if (bekliyor) cevaplandi(); }, ek); } catch (e) { console.error(e); bekliyor = false; }
    }
    akis.append(kap);
    try { k.yap?.(api, ctx); } catch (e) { console.error(e); }
    oku(k);
    dugmeGuncelle();
    requestAnimationFrame(() => kap.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }

  function ileri() {
    if (bitti || bekliyor) return false;
    if (n >= liste.length - 1) {
      bitti = true;
      akis.querySelector(".d-kare.simdi")?.classList.remove("simdi");
      kok.classList.add("bitti");
      devamBtn.hidden = true;
      ses.sus();
      bitince?.();
      return true;
    }
    n++;
    goster(liste[n]);
    return true;
  }

  function baslat() {
    ses.sus();
    akis.replaceChildren();
    n = -1; bitti = false; bekliyor = false;
    kok.classList.remove("bitti");
    devamBtn.hidden = false;
    ileri();
  }

  /** Daha önce izlenmiş adım: anlatım kapalı, özet açık, istenirse baştan izlenir */
  function izlendi() {
    bitti = true;
    kok.classList.add("bitti");
    devamBtn.hidden = true;
    if (ozetKutu) ozetKutu.hidden = false;
    akis.replaceChildren(el("p", { class: "d-kare-not" }, "Bu adımın anlatımını izledin. Tekrar izlemek için ↺ Baştan."));
  }

  return { el: kok, ileri, bitti: () => bitti, baslat, izlendi };
}
