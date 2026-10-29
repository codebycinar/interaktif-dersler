// 10. Sınıf Türk Dili ve Edebiyatı · 1. Tema: Sözün Ezgisi (A) — okuma (koşuk, türkü; ara metin koşma, ninni) ve şiir dinletisi
// TDE2.1–2.4 okuma · TDE3.1–3.4 konuşma (şiir dinletisi)
import { dersBaslat, el } from "../../../../engine/ders.js";
import { sahneAc, kart, siniflandir, eslestir, okuyucu, rubrik, radar, kaydedici, kalici, tik, bekle } from "../ortak/etkilesim.js";
import { dizeCoz, heceSayisi, durakDenetle, durakBul, heceTipi, acikKapaliDizisi, ARUZ, DURAK_KALIPLARI } from "./ahenk.js";
import { SIIRLER, KUTUPHANE, TEMALAR } from "./metinler.js";

const plan = kalici("edu:tde10-u1a-sozun-ezgisi:dinleti", { tema: null, ad: "", sure: 8, roller: {}, ortam: [], program: [], giris: "", kapanis: "" });
const kunye = (s) => `${s.sair}${s.olum ? ` (${s.olum})` : ""}`;

function siirKart(s, { dizeler = s.dizeler, sinif = "" } = {}) {
  return el("div", { class: `tde-siir ${sinif}`.trim() },
    el("div", { class: "tde-siir-ust" }, el("b", {}, s.ad), el("span", {}, ` · ${kunye(s)}`)),
    ...dizeler.map((d, i) => el("div", { class: "tde-dize", "data-dize": String(i) }, d)));
}

/** Bir şiir kartındaki dizeleri sırayla vurgulayarak okur */
function dizeDizeOku(oku, kap, dizeler, { hiz = 0.9, es = 600 } = {}) {
  const satirlar = kap.querySelectorAll(".tde-dize");
  return oku.oku(dizeler.map((d) => ({ metin: d })), {
    hiz, es,
    adim: (i) => satirlar.forEach((s, j) => s.classList.toggle("okunuyor", i === j)),
  });
}

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Sözün ezgisi: ahenk haritası",
    cikti: "TDE2.1",
    anlatim: `
      <p>Sözlü kültürde şiir önce <b>okunmaz, söylenir</b>. Kulakta kalması için sözler bir ezgiye, bir ritme yaslanır. Bu ses uyumuna <b>ahenk</b> denir.</p>
      <p>Yunus Emre'nin dörtlüğünü iki farklı biçimde dinle: önce tekdüze ve aceleyle, sonra dize sonlarında durarak, ezgili biçimde. Hangisi kulağında kaldı?</p>
      <p>Sonra kartları sınıflandırarak bir <b>bilgi görseli</b> oluştur: Bir şiirin ahengini neler sağlar, neler sağlamaz?</p>`,
    gorev: "İki okuyuşu karşılaştır ve tüm kartları doğru kutuya yerleştir.",
    ogretmen: "Program, şiir türüyle ilgili hazır bulunuşluğun bilgi görseliyle yoklanmasını öneriyor (TDE2.1). Kartları akıllı tahtada sınıfça yerleştirin; “şairin doğum yılı” gibi kartların neden ahenkle ilgisiz olduğunu tartıştırın. Okuma sırasında vurgu, tonlama ve telaffuzun sözün ezgili söylenişine etkisine dikkat çekin.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const oku = okuyucu(ctx);
      const s = SIIRLER.yunus;
      const siir = siirKart(s);
      S.append(kart("Dinle ve karşılaştır", siir, el("div", { class: "d-satir", style: "margin-top:10px" },
        el("button", { class: "d-btn", "data-oku": "duz", onclick: () => oku.oku([{ metin: s.dizeler.join(" ") }], { hiz: 1.45, adim: (i) => siir.classList.toggle("tekduze", i === 0) }) }, "▶ Tekdüze oku"),
        el("button", { class: "d-btn ana", "data-oku": "ezgili", onclick: () => dizeDizeOku(oku, siir, s.dizeler, { hiz: 0.85, es: 700 }) }, "▶ Ezgili oku"),
        el("button", { class: "d-btn", onclick: () => oku.durdur() }, "■"))));
      const k = kart("Bilgi görseli: Şiirde ahengi ne sağlar?");
      S.append(k);
      siniflandir(k, {
        kovalar: [{ id: "evet", baslik: "Ahengi sağlar" }, { id: "hayir", baslik: "Ahenkle ilgisi yok" }],
        ogeler: [
          { id: "olcu", metin: "Dizelerde hece sayısının eşit olması (ölçü)", kova: "evet" },
          { id: "durak", metin: "Durak: dizenin içindeki kısa ses molası", kova: "evet" },
          { id: "kafiye", metin: "Kafiye: dize sonlarındaki ses benzerliği", kova: "evet" },
          { id: "redif", metin: "Redif: dize sonlarında tekrarlanan ek ya da kelime", kova: "evet" },
          { id: "tekrar", metin: "Ses ve kelime tekrarları", kova: "evet" },
          { id: "vurgu", metin: "Vurgu ve tonlamayla okuma", kova: "evet" },
          { id: "renk", metin: "Şiirin hangi renk mürekkeple yazıldığı", kova: "hayir", neden: "Ahenk kulakla algılanır; yazının görünüşü sesi değiştirmez." },
          { id: "yil", metin: "Şairin doğduğu yıl", kova: "hayir", neden: "Şairin hayatı şiirin dönemini anlamaya yardım eder ama sesin uyumunu sağlamaz." },
          { id: "sayfa", metin: "Şiirin kaç sayfa tuttuğu", kova: "hayir", neden: "Uzunluk tek başına ahenk oluşturmaz." },
        ],
        bitti: () => ctx.gorevTamam(),
      });
    },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Hece ölçüsü: say ve durakla",
    cikti: "TDE2.3",
    anlatim: `
      <p><b>Hece ölçüsü</b>, dizelerdeki hece sayısının eşit olmasına dayanır. Türkçede her hecede <b>bir ünlü</b> vardır: ünlüleri sayarsan heceleri saymış olursun.</p>
      <p><b>Durak</b>, uzun dizeyi söylerken verilen kısa moladır. Kelimeyi bölmez; bir şiirde genellikle aynı düzende tekrarlanır (7'li: 4+3, 8'li: 4+4, 11'li: 6+5 ya da 4+4+3).</p>
      <p>Her dizenin hece sayısını kutuya yaz. Kelime aralarındaki çizgilere dokunarak durağı yerleştir, sonra kontrol et. “Hecelere vurarak oku” ile ritmi duyabilirsin.</p>`,
    gorev: "<b>İki şiirde</b> bütün dizelerin hece sayısını ve durağını doğru bul.",
    ogretmen: "Programdaki istasyon tekniğinin “yapı ve ahenk” istasyonu olarak kullanılabilir (TDE2.3). Öğrencilerin parmakla sıraya vurarak hece saymasını, ardından ekrandaki ritimle karşılaştırmasını isteyin. Durağın kelimeyi bölmemesi kuralını Karacaoğlan dörtlüğü üzerinde gösterin.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const oku = okuyucu(ctx);
      const tamam = new Set();
      let sec = "alp", durak = [], kutu = null, satirlar = [];
      const durum = el("div", { class: "ort-alt" });
      ctx.secenekler({
        etiket: "Şiir", deger: sec,
        liste: [{ deger: "alp", metin: "Alp Er Tunga Sagusu" }, { deger: "karacaoglan", metin: "Karacaoğlan" }, { deger: "yemen", metin: "Yemen Türküsü" }],
        degisti: (v) => { sec = v; ciz(); },
      });
      ctx.dugmeler([
        { metin: "Kontrol et", ana: true, tik: kontrol },
        { metin: "▶ Hecelere vurarak oku", tik: vur },
        { metin: "Heceleri göster", tik: () => kutu.classList.toggle("heceli") },
      ]);
      ctx.kontroller.append(durum);
      const geri = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(geri);

      function ciz() {
        oku.durdur();
        const s = SIIRLER[sec];
        durak = s.dizeler.map(() => new Set());
        kutu = el("div", { class: "tde-siir tde-sayac" }, el("div", { class: "tde-siir-ust" }, el("b", {}, s.ad), el("span", {}, ` · ${kunye(s)}`)));
        satirlar = s.dizeler.map((d, i) => {
          const kelimeler = dizeCoz(d);
          const sira = el("div", { class: "tde-kelimeler" });
          kelimeler.forEach((k, j) => {
            sira.append(el("span", { class: "tde-kelime" }, k.heceler.map((h) => el("span", { class: "tde-hece" }, h))));
            if (j < kelimeler.length - 1) {
              const y = el("button", { class: "tde-yuva", type: "button", "data-yuva": `${i}-${j}`, "aria-label": "Durak koy", onclick: () => {
                durak[i].has(j) ? durak[i].delete(j) : durak[i].add(j);
                y.classList.toggle("aktif", durak[i].has(j));
                y.textContent = durak[i].has(j) ? "/" : "";
                isaret.textContent = ""; satir.classList.remove("dogru", "yanlis");
              } });
              sira.append(y);
            }
          });
          const girdi = el("input", { class: "tde-sayi", inputmode: "numeric", "aria-label": `${i + 1}. dizenin hece sayısı`, "data-sayi": String(i), placeholder: "?" });
          const isaret = el("span", { class: "tde-isaret" });
          const not = el("div", { class: "tde-not" });
          const satir = el("div", { class: "tde-satir" }, sira, girdi, isaret, not);
          kutu.append(satir);
          return { satir, girdi, isaret, not, dize: d };
        });
        S.replaceChildren(kart("Heceyi say, durağı yerleştir", kutu));
        geri.textContent = ""; geri.className = "d-geri-bildirim";
        durum.textContent = `Tamamlanan şiir: ${tamam.size}/2`;
      }
      function kontrol() {
        const s = SIIRLER[sec];
        let hepsi = true;
        satirlar.forEach((r, i) => {
          const n = heceSayisi(r.dize);
          const yazilan = parseInt(r.girdi.value, 10);
          const d = durakDenetle(r.dize, [...durak[i]], s.olcu, s.durak);
          const sayiOk = yazilan === n;
          const ok = sayiOk && d.uygun;
          hepsi &&= ok;
          r.satir.classList.toggle("dogru", ok); r.satir.classList.toggle("yanlis", !ok);
          r.isaret.textContent = ok ? "✓" : "✗";
          r.not.textContent = !sayiOk
            ? (Number.isFinite(yazilan) ? `${yazilan} değil. Ünlüleri tek tek say.` : "Hece sayısını yaz.")
            : !durak[i].size ? "Durağı yerleştirmedin."
              : d.uygun ? `${d.gruplar.join(" + ")} ✓`
                : d.genelUygun ? `${d.gruplar.join(" + ")}: bu da bir durak kalıbı ama bu şiirde durak ${s.durak[0].join(" + ")} düzeninde.`
                  : `${d.gruplar.join(" + ")}: ${s.olcu}'li ölçüde durak ${DURAK_KALIPLARI[s.olcu].map((k) => k.join("+")).join(" ya da ")} olur.`;
        });
        if (hepsi) {
          tamam.add(sec);
          geri.className = "d-geri-bildirim dogru";
          geri.innerHTML = `Bu şiir <b>${s.olcu}'li hece ölçüsüyle</b> ve <b>${s.durak[0].join(" + ")}</b> duraklı söylenmiştir.`;
          tik(880);
        } else {
          geri.className = "d-geri-bildirim yanlis";
          geri.textContent = "Kırmızı satırları gözden geçir.";
        }
        durum.textContent = `Tamamlanan şiir: ${tamam.size}/2`;
        if (tamam.size >= 2) ctx.gorevTamam();
      }
      async function vur() {
        oku.durdur();
        const s = SIIRLER[sec];
        const benim = Symbol();
        vur.son = benim;
        for (let i = 0; i < satirlar.length; i++) {
          const ds = durakBul(satirlar[i].dize, s.olcu, s.durak);
          const kelimeler = [...satirlar[i].satir.querySelectorAll(".tde-kelime")];
          for (let j = 0; j < kelimeler.length; j++) {
            for (const h of kelimeler[j].querySelectorAll(".tde-hece")) {
              if (vur.son !== benim || !h.isConnected) return;
              h.classList.add("vurus"); tik(520);
              await bekle(260);
              h.classList.remove("vurus");
            }
            if (ds.includes(j)) await bekle(380);
          }
          await bekle(650);
        }
      }
      ctx.temizlik(() => { vur.son = null; });
      ciz();
    },
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Kafiye ve redif avı",
    cikti: "TDE2.3",
    anlatim: `
      <p>Dize sonlarına kulak ver. <b>Redif</b>, dize sonlarında aynı görevde tekrarlanan ek ya da kelimedir. Redifin hemen önündeki ses benzerliği ise <b>kafiye</b>dir.</p>
      <p>Önce redifi bul, sonra ondan geriye doğru git. Kafiye tek sesse <b>yarım</b>, iki sesse <b>tam</b>, üç ve daha çok sesse <b>zengin kafiye</b> olur.</p>
      <p>Paneldeki kalemi seç (turuncu kafiye, mavi redif), sonra harflere dokunarak boya.</p>`,
    gorev: "<b>İki şiirde</b> kafiye ve redifi doğru boya, kafiye türünü seç.",
    ogretmen: "Program, ahengi sağlayan unsurların ve kelimelerin ezgiyle ilişkisinin üzerinde durulmasını istiyor (TDE2.2–2.3). “Redifi bulmak için ekleri ayır” stratejisini önce Yemen Türküsü üzerinde birlikte uygulayın. Yunus Emre'nin dördüncü dizesinin neden kafiyesiz olduğunu (aaab) sorun.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const tamam = new Set();
      let sec = "yemen", kalem = "k", tur = null, harfler = [];
      const sekme = ctx.secenekler({
        etiket: "Şiir", deger: sec,
        liste: [{ deger: "yemen", metin: "Yemen Türküsü" }, { deger: "yunus", metin: "Yunus Emre" }, { deger: "alp", metin: "Alp Er Tunga" }],
        degisti: (v) => { sec = v; ciz(); },
      });
      ctx.secenekler({
        etiket: "Kalem", deger: kalem,
        liste: [{ deger: "k", metin: "🟧 Kafiye" }, { deger: "r", metin: "🟦 Redif" }, { deger: "", metin: "Silgi" }],
        degisti: (v) => { kalem = v; },
      });
      const turSec = ctx.secenekler({
        etiket: "Kafiye türü", deger: null,
        liste: [{ deger: "yarım", metin: "Yarım (tek ses)" }, { deger: "tam", metin: "Tam (iki ses)" }, { deger: "zengin", metin: "Zengin (üç+ ses)" }],
        degisti: (v) => { tur = v; },
      });
      ctx.dugmeler([{ metin: "Kontrol et", ana: true, tik: kontrol }]);
      const geri = el("div", { class: "d-geri-bildirim" });
      const durum = el("div", { class: "ort-alt" });
      ctx.kontroller.append(geri, durum);

      function ciz() {
        const s = SIIRLER[sec];
        tur = null; turSec.deger = null; harfler = [];
        const kutu = el("div", { class: "tde-siir" }, el("div", { class: "tde-siir-ust" }, el("b", {}, s.ad), el("span", {}, ` · ${kunye(s)}`)));
        s.dizeler.forEach((d, i) => {
          const parca = s.kafiye[i];
          if (!parca) { kutu.append(el("div", { class: "tde-dize" }, d, el("span", { class: "tde-not" }, "  (kafiyesiz dize)"))); return; }
          const son = parca.join("");
          const on = d.slice(0, d.length - son.length);
          const satir = el("div", { class: "tde-dize" }, on);
          parca.forEach((p, pi) => {
            for (const c of p) {
              if (c === " ") { satir.append(" "); continue; }
              const b = el("button", { class: "tde-harf", type: "button", "data-harf": String(harfler.length), onclick: () => {
                b.dataset.tip = kalem; b.className = `tde-harf${kalem ? " " + kalem : ""}`;
                geri.textContent = "";
              } }, c);
              harfler.push({ b, beklenen: ["", "k", "r"][pi] });
              satir.append(b);
            }
          });
          kutu.append(satir);
        });
        S.replaceChildren(kart("Dize sonlarını boya", kutu, el("p", { class: "ort-alt" }, "İpucu: Ekleri kelimeden ayır. Aynı görevdeki ekler rediftir; geriye kalan ortak sesler kafiyedir.")));
        geri.textContent = "";
        durum.textContent = `Tamamlanan şiir: ${tamam.size}/2`;
      }
      function kontrol() {
        const s = SIIRLER[sec];
        let yanlis = 0;
        for (const h of harfler) {
          const ok = (h.b.dataset.tip || "") === h.beklenen;
          if (!ok) yanlis++;
          h.b.classList.toggle("hata", !ok);
        }
        const turOk = tur === s.kafiyeTuru;
        if (!yanlis && turOk) {
          tamam.add(sec);
          geri.className = "d-geri-bildirim dogru";
          const [, k, r] = s.kafiye.find(Boolean);
          geri.innerHTML = `Doğru! Redif <b>“${r.trim()}”</b>, kafiye <b>“${k}”</b> (${s.kafiyeTuru} kafiye). Kafiye düzeni: <b>${s.sema}</b>.`;
          tik(880);
        } else {
          geri.className = "d-geri-bildirim yanlis";
          geri.textContent = yanlis ? `${yanlis} harf yanlış boyandı (altı kırmızı çizili).` : "Boyama doğru; kafiye türünü yeniden düşün: kafiye kaç sesten oluşuyor?";
        }
        durum.textContent = `Tamamlanan şiir: ${tamam.size}/2`;
        if (tamam.size >= 2) ctx.gorevTamam();
      }
      sekme.deger = sec;
      ciz();
    },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Ölçü dedektifi: hece, aruz, serbest",
    cikti: "TDE2.3",
    anlatim: `
      <p>Türk şiirinde üç ölçü anlayışı vardır. <b>Hece ölçüsü</b> hece sayısının eşitliğine dayanır; halk şiirinin ölçüsüdür.</p>
      <p><b>Aruz ölçüsü</b> hecelerin <b>açık</b> (ünlüyle biten, kısa “.”) ya da <b>kapalı</b> (ünsüzle biten, uzun “–”) olmasına göre kurulan kalıplara dayanır. Divan şiirinde kullanılmıştır; İstiklal Marşı da aruzla yazılmıştır.</p>
      <p><b>Serbest ölçüde</b> dizelerin hece sayısı ya da kalıbı eşit olmak zorunda değildir.</p>
      <p>Merceği kullanarak her metni incele, sonra kartları doğru ölçüye yerleştir.</p>`,
    gorev: "Altı dizeyi ölçülerine göre doğru sınıflandır.",
    ogretmen: "Aruz bu temanın ana konusu değildir; burada amaç ahengin farklı ölçü anlayışlarıyla da kurulabildiğini fark ettirmektir. Açık/kapalı hece kuralı basitleştirilmiştir (imale, zihaf ve ulama gibi ayrıntılar 11. ve 12. sınıfta ele alınır).",
    kur(ctx) {
      const S = sahneAc(ctx);
      const adlar = ["yunus", "karacaoglan", "yemen", "istiklal", "hasim", "orhan"];
      let secili = "istiklal", kalip = null;
      const mercek = el("div");
      const mercekKart = kart("Mercek", el("div", { class: "d-satir tde-mercek-sec" },
        adlar.map((a) => el("button", { class: "d-btn kucuk", "data-mercek": a, onclick: () => { secili = a; kalip = null; ciz(); } }, SIIRLER[a].ad))), mercek);
      S.append(mercekKart);
      function ciz() {
        const s = SIIRLER[secili];
        mercekKart.querySelectorAll("[data-mercek]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mercek === secili)));
        const satirlar = s.dizeler.map((d) => {
          const hece = dizeCoz(d).flatMap((k) => k.heceler);
          return el("div", { class: "tde-desen" },
            el("div", { class: "tde-desen-heceler" }, hece.map((h) => el("span", { class: heceTipi(h) === "–" ? "kapali" : "acik" }, el("i", {}, h), el("b", {}, heceTipi(h))))),
            el("span", { class: "tde-desen-sayi" }, `${hece.length} hece`));
        });
        const kalipSatiri = kalip ? (() => {
          const beklenen = [...ARUZ[kalip].replace(/\s/g, "")];
          const gercek = acikKapaliDizisi(s.dizeler[0]);
          const uyar = beklenen.length === gercek.length && beklenen.every((c, i) => c === gercek[i]);
          return el("div", { class: `tde-kalip ${uyar ? "uyar" : "uymaz"}` },
            el("div", {}, el("b", {}, kalip), " → ", ARUZ[kalip]),
            el("div", {}, uyar ? "İlk dizenin açık/kapalı hece dizisi bu kalıba tam uyuyor." : `Uymuyor: dizede ${gercek.length} hece var, kalıpta ${beklenen.length}; diziler de farklı.`));
        })() : null;
        mercek.replaceChildren(
          el("div", { class: "ort-alt" }, `${s.ad} · ${kunye(s)}`),
          ...satirlar,
          el("div", { class: "d-satir", style: "margin-top:8px" }, el("span", { class: "ort-alt" }, "Aruz kalıbıyla karşılaştır:"),
            Object.keys(ARUZ).map((k) => el("button", { class: "d-btn kucuk", "data-kalip": k, onclick: () => { kalip = k; ciz(); } }, k))),
          kalipSatiri || "");
      }
      ciz();
      const k = kart("Sınıflandır");
      S.append(k);
      const ilk = (a) => `“${SIIRLER[a].dizeler[0]}${SIIRLER[a].dizeler.length > 1 ? " …" : ""}” — ${SIIRLER[a].sair}`;
      siniflandir(k, {
        kovalar: [{ id: "hece", baslik: "Hece ölçüsü" }, { id: "aruz", baslik: "Aruz ölçüsü" }, { id: "serbest", baslik: "Serbest ölçü" }],
        ogeler: [
          { id: "yunus", metin: ilk("yunus"), kova: "hece", neden: "Yunus Emre'nin dizeleri yedişer hecelidir." },
          { id: "karacaoglan", metin: ilk("karacaoglan"), kova: "hece", neden: "Karacaoğlan'ın dizeleri sekizer hecelidir." },
          { id: "yemen", metin: ilk("yemen"), kova: "hece", neden: "Türkünün dizeleri on birer hecelidir." },
          { id: "istiklal", metin: ilk("istiklal"), kova: "aruz", neden: "İstiklal Marşı'nın hece dizisi “fâilâtün feilâtün feilâtün fa'lün” kalıbına uyar." },
          { id: "hasim", metin: ilk("hasim"), kova: "aruz", neden: "Ahmet Haşim'in dizesi “mefâilün feilâtün mefâilün feilün” kalıbına uyar." },
          { id: "orhan", metin: ilk("orhan"), kova: "serbest", neden: "Orhan Veli'nin dizeleri 14, 11, 8 ve 7 hecelidir; ne hece sayısı ne kalıp eşittir." },
        ],
        bitti: () => ctx.gorevTamam(),
      });
    },
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Koşuğun dili: dokuz yüz yıllık kelimeler",
    cikti: "TDE2.2",
    anlatim: `
      <p>Bu dörtlük, Kaşgarlı Mahmud'un 11. yüzyılda derlediği <b>Divanü Lugati't-Türk</b>'te yer alır. Destan kahramanı Alp Er Tunga'nın ölümü üzerine söylenmiş bir <b>sagu</b>dur (yuğ törenlerinde söylenen ağıt). Koşuk biçimindedir.</p>
      <p>Kelimelerin bir kısmı bugün de kullanılıyor, bir kısmı değişmiş ya da yerini başka kelimelere bırakmış. Bilmediğin kelimeyi önce <b>bağlamdan</b> tahmin et.</p>
      <p>Eski kelimeleri bugünkü karşılıklarıyla eşleştir, sonra değişimin nedenini sınıflandır.</p>`,
    gorev: "Tüm kelimeleri eşleştir ve değişim nedenlerini doğru sınıflandır.",
    ogretmen: "Program, koşuk metnindeki kelimelerin biçim ve anlam yönünden farklılaşma nedenlerinin listelenip tartışılmasını öneriyor (TDE2.2). “Dünya, felek, zaman” kelimelerinin Arapça ve Farsçadan geçtiğini; “öldi → öldü” gibi değişimlerin ses değişimi olduğunu vurgulayın. Sözlü geleneğin bu dörtlüğü yüzyıllarca nasıl taşıdığını sorun.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const oku = okuyucu(ctx);
      const s = SIIRLER.alp;
      let n = 0;
      const bit = () => { if (++n === 2) ctx.gorevTamam(); };
      const eski = siirKart(s);
      const yeni = siirKart({ ...s, ad: "Bugünkü Türkçeyle" }, { dizeler: s.gunumuz, sinif: "tde-gizli" });
      S.append(kart("Sagu", el("div", { class: "tde-ikili" }, eski, yeni),
        el("div", { class: "d-satir", style: "margin-top:8px" },
          el("button", { class: "d-btn", onclick: () => dizeDizeOku(oku, eski, s.dizeler, { hiz: 0.8, es: 700 }) }, "▶ Dinle"),
          el("button", { class: "d-btn", onclick: () => yeni.classList.toggle("tde-gizli") }, "Bugünkü Türkçeyi göster/gizle"))));
      const k1 = kart("Eşleştir: eski kelime → bugünkü karşılığı");
      S.append(k1);
      eslestir(k1, {
        solBaslik: "Divanü Lugati't-Türk", sagBaslik: "Bugün",
        ciftler: [
          { id: "ajun", sol: "ajun", sag: "dünya" },
          { id: "isiz", sol: "ısız", sag: "kötü" },
          { id: "odlek", sol: "ödlek", sag: "felek, zaman" },
          { id: "emdi", sol: "emdi", sag: "şimdi" },
          { id: "oldi", sol: "öldi mü", sag: "öldü mü" },
          { id: "yirtilur", sol: "yırtılur", sag: "yırtılır" },
        ],
        bitti: bit,
      });
      const k2 = kart("Değişimin nedeni ne?");
      S.append(k2);
      siniflandir(k2, {
        kovalar: [{ id: "ses", baslik: "Ses değişimi (kelime aynı, söyleniş değişti)" }, { id: "kelime", baslik: "Yerine başka kelime geçti" }],
        ogeler: [
          { id: "a", metin: "öldi → öldü", kova: "ses", neden: "Kelime aynı; yalnızca son ünlü uyuma girdi." },
          { id: "b", metin: "emdi → şimdi", kova: "ses" },
          { id: "c", metin: "yırtılur → yırtılır", kova: "ses" },
          { id: "d", metin: "kaldı mu → kaldı mı", kova: "ses" },
          { id: "e", metin: "ajun → dünya", kova: "kelime", neden: "“Dünya” Arapçadan geçmiş başka bir kelimedir." },
          { id: "f", metin: "ödlek → felek / zaman", kova: "kelime" },
          { id: "g", metin: "ısız → kötü", kova: "kelime" },
        ],
        bitti: bit,
      });
    },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Koşuk, koşma, türkü, ninni: karşılaştır",
    cikti: "TDE2.2",
    anlatim: `
      <p>Dört metin, dört ayrı söyleyiş. <b>Koşuk</b> İslamiyet öncesi Türk şiirinin, <b>koşma</b> âşık edebiyatının, <b>türkü</b> ve <b>ninni</b> anonim halk edebiyatının ürünüdür.</p>
      <p>Her örneği dinle. Sonra kartları ait oldukları türün altına yerleştirerek bir <b>karşılaştırma tablosu</b> oluştur: ölçü ve yapı, söylenme amacı ve ortamı, dönem ve gelenek.</p>
      <p>Benzerlikleri de not et: Dördü de <b>sözlü gelenekte</b> doğmuş ve ezgiyle söylenmiştir.</p>`,
    gorev: "On iki kartın hepsini doğru türün altına yerleştir.",
    ogretmen: "Program, koşuğun bir koşmayla T diyagramında, iki şiirin içerik, dönem, üslup ve iletiler bakımından karşılaştırma tablosunda değerlendirilmesini öneriyor (TDE2.2–2.3). Tabloyu tamamladıktan sonra öğrencilerden sözlü gelenekle ilgili bir genelleme cümlesi kurmalarını isteyin.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const oku = okuyucu(ctx);
      const ornek = (ad, baslik, dizeler) => {
        const k = siirKart({ ...SIIRLER[ad], ad: baslik }, { dizeler, sinif: "kucuk" });
        return el("div", { class: "tde-ornek" }, k, el("button", { class: "d-btn kucuk", onclick: () => dizeDizeOku(oku, k, dizeler, { hiz: 0.85, es: 500 }) }, "▶ Dinle"));
      };
      const kosuk = SIIRLER.kosuk;
      S.append(kart("Örnekler", el("div", { class: "tde-ornekler" },
        ornek("kosuk", "Koşuk", kosuk.dizeler),
        ornek("karacaoglan", "Koşma", SIIRLER.karacaoglan.dizeler),
        ornek("yemen", "Türkü", SIIRLER.yemen.dizeler),
        ornek("ninni", "Ninni", SIIRLER.ninni.dizeler)),
        el("p", { class: "ort-alt" }, `Koşuğun bugünkü anlamı: ${kosuk.gunumuz}`)));
      const k = kart("Karşılaştırma tablosu");
      S.append(k);
      siniflandir(k, {
        sutun: 4,
        kovalar: [{ id: "kosuk", baslik: "Koşuk" }, { id: "kosma", baslik: "Koşma" }, { id: "turku", baslik: "Türkü" }, { id: "ninni", baslik: "Ninni" }],
        ogeler: [
          { id: "k1", metin: "Çoğunlukla 7'li hece; dörtlük; aaab cccb", kova: "kosuk" },
          { id: "k2", metin: "Sığır ve şölen törenlerinde kopuz eşliğinde", kova: "kosuk" },
          { id: "k3", metin: "İslamiyet öncesi; Divanü Lugati't-Türk'te derlenmiş", kova: "kosuk" },
          { id: "m1", metin: "Çoğunlukla 11'li hece; dörtlük; xaxa bbba", kova: "kosma", neden: "Koşmalar çoğunlukla 11'li, bazen 8'li heceyle söylenir." },
          { id: "m2", metin: "Saz eşliğinde; son dörtlükte şairin adı (tapşırma)", kova: "kosma" },
          { id: "m3", metin: "İslamiyet sonrası âşık edebiyatı (ör. Karacaoğlan)", kova: "kosma" },
          { id: "t1", metin: "Bent ve kavuştaktan (nakarat) oluşur", kova: "turku" },
          { id: "t2", metin: "Toplumu derinden etkileyen olaylar, gurbet, sevda", kova: "turku" },
          { id: "t3", metin: "Anonim; ezgisi sözünden ayrılmaz, yöreden yöreye değişir", kova: "turku" },
          { id: "n1", metin: "Ölçüsü ezgiye göre esner; ses oyunları ve tekrarlar", kova: "ninni", neden: "Dandini'nin dizeleri 9, 8, 7, 7 hecelidir: ninnide ezgi ölçüden önce gelir." },
          { id: "n2", metin: "Çocuğu uyutmak, sevgi ve dilekleri aktarmak", kova: "ninni" },
          { id: "n3", metin: "Anonim; anneden çocuğa sözlü olarak aktarılır", kova: "ninni" },
        ],
        bitti: () => ctx.gorevTamam(),
      });
    },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Türkü ve ninni: söylenme amacı, beğeni",
    cikti: "TDE2.4",
    anlatim: `
      <p><b>Yemen Türküsü</b> bir bent ve bir kavuştaktan oluşuyor. Kavuştak her bentten sonra tekrarlanarak ezgiyi ve duyguyu pekiştirir.</p>
      <p>Türküyü ve ninniyi dinle. Her metnin <b>niçin söylendiğini</b> düşün: metindeki sözlerin düz anlamı ile asıl iletisi aynı olmayabilir.</p>
      <p>Sonra kendi <b>beğeni ölçütlerinle</b> üç metni puanla ve en çok beğendiğini gerekçesiyle yaz.</p>`,
    gorev: "İki söylenme amacı sorusunu doğru cevapla ve gerekçeli görüşünü yaz.",
    ogretmen: "Program, öğrencinin kendi beğeni ölçütleriyle öz değerlendirme yapmasını ve farklı metinlerden hangisini beğendiğine dair gerekçeli görüş belirtmesini öneriyor (TDE2.4). İkinci okuma metni türkü, ara metin ninnidir. Ninnideki “danalar, bostan” sözlerinin çocuğa ses oyunu olarak sunulduğunu fark ettirin.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const oku = okuyucu(ctx);
      const y = SIIRLER.yemen, n = SIIRLER.ninni;
      const tk = el("div", { class: "tde-siir" }, el("div", { class: "tde-siir-ust" }, el("b", {}, y.ad), el("span", {}, " · Anonim")),
        el("div", { class: "tde-etiket" }, "Bent"), ...y.dizeler.map((d) => el("div", { class: "tde-dize" }, d)),
        el("div", { class: "tde-etiket mavi" }, "Kavuştak"), ...y.kavustak.map((d) => el("div", { class: "tde-dize tde-kavustak" }, d)));
      const nk = siirKart(n);
      const tumu = [...y.dizeler, ...y.kavustak];
      S.append(el("div", { class: "tde-ikili" },
        kart("Türkü", tk, el("button", { class: "d-btn kucuk", style: "margin-top:8px", onclick: () => dizeDizeOku(oku, tk, tumu, { hiz: 0.8, es: 650 }) }, "▶ Dinle")),
        kart("Ninni", nk, el("button", { class: "d-btn kucuk", style: "margin-top:8px", onclick: () => dizeDizeOku(oku, nk, n.dizeler, { hiz: 0.7, es: 800 }) }, "▶ Dinle"))));
      const puanlar = { kosuk: 0, turku: 0, ninni: 0 };
      const grafik = el("div", { class: "tde-cubuklar" });
      const ciz = () => grafik.replaceChildren(...[["kosuk", "Bahar Koşuğu"], ["turku", "Yemen Türküsü"], ["ninni", "Dandini"]].map(([k, ad]) =>
        el("div", { class: "tde-cubuk" }, el("span", {}, ad), el("i", { style: `width:${puanlar[k] * 20}%` }), el("b", {}, puanlar[k] ? `${puanlar[k]}/5` : "—"))));
      S.append(kart("Beğeni puanların", grafik));
      ciz();

      let dogru = 0;
      const geri = el("div", { class: "d-geri-bildirim" });
      const soru = (etiket, liste, dogruDeger, aciklama) => {
        let bilindi = false;
        ctx.secenekler({ etiket, liste, deger: null, degisti: (v) => {
          const ok = v === dogruDeger;
          geri.className = `d-geri-bildirim ${ok ? "dogru" : "yanlis"}`;
          geri.innerHTML = ok ? aciklama : liste.find((o) => o.deger === v).neden;
          if (ok && !bilindi) { bilindi = true; dogru++; kontrol(); }
        } });
      };
      soru("Yemen Türküsü hangi amaçla söylenmiş olabilir?", [
        { deger: "a", metin: "Yemen'in güzelliğini tanıtmak", neden: "“Gülü çemendir” sözü süs değil, acıyla tezat oluşturur; “giden gelmiyor” dizesine bak." },
        { deger: "b", metin: "Gidip dönmeyen gençlerin acısını dile getirmek" },
        { deger: "c", metin: "Düğünde oyun havası olarak eğlenmek", neden: "Ezgi ve sözler yas ve özlem taşıyor; “bu ne figandır” (feryat) ifadesine dikkat et." },
      ], "b", "Doğru. Türkü, Yemen'e gönderilip geri dönmeyen askerlerin ardından duyulan acıyı anlatır; toplumu derinden etkileyen olaylar türkülere yansır.");
      soru("Dandini ninnisi niçin söylenir?", [
        { deger: "a", metin: "Bostana giren danaları kovmak için", neden: "Bu, sözlerin düz anlamı. Ninnide asıl amaç sözün ezgisidir: ses tekrarları çocuğu sakinleştirir." },
        { deger: "b", metin: "Bostancıyı övmek için", neden: "Bostancı yalnızca oyunun bir kişisidir." },
        { deger: "c", metin: "Çocuğu uyutmak, ona sevgiyi ezgiyle aktarmak" },
      ], "c", "Doğru. Ninnide “dandini, dastana, bostana” gibi ses oyunları ve tekrarlar uyutan bir ritim oluşturur.");
      ctx.kontroller.append(geri);
      for (const [k, ad] of [["kosuk", "Bahar Koşuğu"], ["turku", "Yemen Türküsü"], ["ninni", "Dandini"]]) {
        ctx.kaydirici({ etiket: `${ad}: beğeni puanın`, min: 0, max: 5, adim: 1, deger: 0, degisti: (v) => { puanlar[k] = v; ciz(); } });
      }
      let yazildi = false;
      ctx.yaziAlani({
        etiket: "En çok beğendiğin metin hangisi? <b>Kendi ölçütlerinle</b> (ahenk, duygu, anlam, ezgi…) gerekçelendir.",
        anahtar: "tde10-u1a-begeni", enAz: 60, yeterli: () => { yazildi = true; kontrol(); },
      });
      function kontrol() { if (dogru >= 2 && yazildi) ctx.gorevTamam(); }
    },
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Şiir dinletisi: tema, süre, görevler",
    cikti: "TDE3.1",
    anlatim: `
      <p>Şimdi sıra sende: grubunla bir <b>şiir dinletisi</b> hazırlayacaksın. Dinleti, belirli bir tema etrafında seçilen şiirlerin sırayla, etkili ve güzel biçimde sunulmasıdır.</p>
      <p>Önce kararları ver: <b>Tema</b> ne olacak? Dinleti <b>ne kadar</b> sürecek? Kim <b>hangi görevi</b> üstlenecek? Ortamda dinletiyi bozabilecek <b>engeller</b> (gürültü, ışık, oturma düzeni) nasıl kaldırılacak?</p>
      <p>Verdiğin her karar sahnedeki afişe yansır.</p>`,
    gorev: "Tema ve dinleti adını belirle, dört görevi paylaştır, en az dört ortam önlemi seç.",
    ogretmen: "Program, grupların önce temaya karar vermesini, dinletinin süresini belirleyip görev dağılımı yapmasını ve gürültü, ışık gibi engellerin ortadan kaldırılmasını öneriyor (TDE3.1). Performans görevi için sınıf dışında hazırlık yapılır, sunum sınıfta gerçekleştirilir.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const afis = el("div", { class: "tde-afis" });
      S.append(afis);
      const ROLLER = [["sunucu", "Sunucu (açılış, geçişler, kapanış)"], ["okuyucu", "Okuyucular"], ["muzik", "Müzik ve ses düzeni"], ["mekan", "Mekân, ışık ve görseller"]];
      const ORTAM = ["Pencere ve kapılar kapatılacak (gürültü)", "Sahne ışığı ayarlanacak", "Oturma düzeni herkes sahneyi görecek biçimde", "Mikrofon ve hoparlör önceden denenecek", "Bir süre tutucu belirlenecek", "Müzik araları ve fon müziği hazırlanacak", "Telefonlar sessize alınacak"];
      ctx.secenekler({ etiket: "Dinletinin teması", liste: TEMALAR, deger: plan.tema, degisti: (v) => { plan.tema = v; guncelle(); } });
      const ad = el("input", { type: "text", "aria-label": "Dinletinin adı", placeholder: "Ör. Sözün Ezgisinde Vatan", value: plan.ad, class: "tde-metin-girdi" });
      ad.addEventListener("input", () => { plan.ad = ad.value; guncelle(); });
      ctx.kontroller.append(el("div", { class: "d-anlatim" }, el("p", {}, "Dinletinin adı")), el("div", { class: "d-girdi" }, ad));
      ctx.kaydirici({ etiket: "Hedef süre", min: 6, max: 15, adim: 1, deger: plan.sure, birim: "dk", degisti: (v) => { plan.sure = v; guncelle(); } });
      for (const [k, etiket] of ROLLER) {
        const g = el("input", { type: "text", "aria-label": etiket, "data-rol": k, placeholder: "Ad(lar)", value: plan.roller[k] || "", class: "tde-metin-girdi" });
        g.addEventListener("input", () => { plan.roller[k] = g.value; guncelle(); });
        ctx.kontroller.append(el("label", { class: "tde-etiketli" }, el("span", {}, etiket), g));
      }
      const liste = el("div", { class: "tde-onay" }, el("div", { class: "ort-alt" }, "Ortam önlemleri"),
        ORTAM.map((o) => {
          const c = el("input", { type: "checkbox", "data-ortam": o, checked: plan.ortam.includes(o) });
          c.addEventListener("change", () => { plan.ortam = c.checked ? [...plan.ortam, o] : plan.ortam.filter((x) => x !== o); guncelle(); });
          return el("label", {}, c, " ", o);
        }));
      ctx.kontroller.append(liste);
      function guncelle() {
        plan.kaydet();
        const tema = TEMALAR.find((t) => t.deger === plan.tema);
        afis.replaceChildren(
          el("div", { class: "tde-afis-ust" }, "ŞİİR DİNLETİSİ"),
          el("h3", {}, plan.ad || "Dinletinin adı"),
          el("div", { class: "tde-afis-tema" }, tema ? tema.metin : "Tema seçilmedi"),
          el("div", { class: "tde-afis-sure" }, `Yaklaşık ${plan.sure} dakika`),
          el("ul", {}, ROLLER.map(([k, e]) => el("li", { class: plan.roller[k]?.trim() ? "" : "bos" }, el("b", {}, e.split(" (")[0]), ": ", plan.roller[k]?.trim() || "—"))),
          el("div", { class: "tde-afis-ortam" }, `Ortam hazırlığı: ${plan.ortam.length}/${ORTAM.length} önlem`));
        const tamam = plan.tema && plan.ad.trim().length >= 3 && ROLLER.every(([k]) => plan.roller[k]?.trim()) && plan.ortam.length >= 4;
        if (tamam) ctx.gorevTamam();
      }
      guncelle();
    },
  },

  /* 9 ------------------------------------------------------------------ */
  {
    baslik: "Dinletinin içeriği: şiirler ve akış",
    cikti: "TDE3.2",
    anlatim: `
      <p>Temana uygun şiirleri seç ve <b>bir akış</b> kur. Farklı dönemlerden şiirler seçersen dilin ve şiir anlayışının nasıl değiştiğini de dinleyiciye gösterebilirsin.</p>
      <p>Dinleti üç bölümden oluşur: dikkat çekici bir <b>açılış</b> (başlatma), şiirleri birbirine bağlayan <b>geçişler</b> (sürdürme) ve etkileyici bir <b>kapanış</b> (bitirme).</p>
      <p>Zaman çizelgesi toplam süreyi gösterir: hedef süreyi aşmamaya dikkat et.</p>`,
    gorev: "Temana uygun en az üç şiir seç, açılış ve kapanış konuşmalarını yaz; süre hedefe ±2 dakika yakın olsun.",
    ogretmen: "Program, dinletinin türüne uygun taslak plan oluşturulmasını, planın grup arkadaşlarıyla temaya uygunluk açısından karşılaştırılmasını ve geri bildirimlerle düzeltilip yeniden sunulmasını öneriyor (TDE3.2). Süreler yaklaşık değerlerdir; prova sırasında gerçek süreyi ölçtürün. Kütüphanedeki şiirlerin tam metinlerini öğrenciler kaynaklardan bulmalıdır.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const temaAd = TEMALAR.find((t) => t.deger === plan.tema)?.metin;
      const kutuphane = el("div", { class: "tde-kutuphane" });
      const akis = el("div", { class: "tde-akis" });
      const cizelge = el("div", { class: "tde-cizelge" });
      const ozet = el("div", { class: "ort-geri" });
      S.append(el("div", { class: "tde-ikili genis" },
        kart(`Şiir kütüphanesi${temaAd ? ` · temanız: ${temaAd}` : ""}`, kutuphane),
        kart("Program akışı", akis, cizelge, ozet)));
      if (!plan.tema) S.prepend(el("div", { class: "ort-kart tde-uyari" }, "Önceki adımda tema seçmedin; tema seçmek için 8. adıma dönebilirsin. Şimdilik “Vatan ve kahramanlık” kabul edildi."));
      const tema = plan.tema || "vatan";
      plan.program = plan.program.filter((id) => KUTUPHANE.some((s) => s.id === id));

      const giris = el("textarea", { "aria-label": "Açılış konuşması", placeholder: "Değerli dinleyiciler, …", "data-alan": "giris" }, plan.giris);
      const kapanis = el("textarea", { "aria-label": "Kapanış konuşması", placeholder: "Bizi dinlediğiniz için …", "data-alan": "kapanis" }, plan.kapanis);
      giris.value = plan.giris; kapanis.value = plan.kapanis;
      const kalip = (alan, metin) => el("button", { class: "d-btn kucuk", onclick: () => { alan.value = (alan.value + " " + metin).trim(); alan.dispatchEvent(new Event("input")); } }, metin);
      ctx.kontroller.append(
        el("div", { class: "d-anlatim" }, el("p", { html: "<b>Açılış</b> (başlatma)" })), el("div", { class: "d-girdi" }, giris),
        el("div", { class: "d-satir" }, kalip(giris, "Değerli dinleyiciler, hoş geldiniz."), kalip(giris, "Bugün sizi sözün ezgisiyle bir yolculuğa çıkarıyoruz.")),
        el("div", { class: "d-anlatim" }, el("p", { html: "<b>Kapanış</b> (bitirme)" })), el("div", { class: "d-girdi" }, kapanis),
        el("div", { class: "d-satir" }, kalip(kapanis, "Bizi dinlediğiniz için teşekkür ederiz."), kalip(kapanis, "Bu dizelerin gönlünüzde yankılanmasını dileriz.")));
      giris.addEventListener("input", () => { plan.giris = giris.value; guncelle(); });
      kapanis.addEventListener("input", () => { plan.kapanis = kapanis.value; guncelle(); });

      function ciz() {
        kutuphane.replaceChildren(...KUTUPHANE.map((s) => {
          const uygun = s.temalar.includes(tema);
          const ekli = plan.program.includes(s.id);
          return el("div", { class: `tde-kitap${uygun ? " uygun" : ""}` },
            el("div", {}, el("b", {}, s.ad), el("div", { class: "ort-alt" }, `${s.sair} · ~${String(s.sure).replace(".", ",")} dk · ${s.temalar.join(", ")}`)),
            el("button", { class: "d-btn kucuk", "data-ekle": s.id, disabled: ekli, onclick: () => { plan.program.push(s.id); ciz(); } }, ekli ? "Eklendi" : "+ Ekle"));
        }));
        const satir = (metin, sinif, ...dugme) => el("div", { class: `tde-akis-satir ${sinif}` }, el("span", { html: metin }), ...dugme);
        akis.replaceChildren(
          satir("🎤 Açılış konuşması · 1 dk", "sabit"),
          ...plan.program.map((id, i) => {
            const s = KUTUPHANE.find((x) => x.id === id);
            const uygun = s.temalar.includes(tema);
            const tasi = (j) => { const p = plan.program; [p[i], p[j]] = [p[j], p[i]]; ciz(); };
            return satir(`${i + 1}. <b>${s.ad}</b> — ${s.sair}${uygun ? "" : ' <em class="tde-uyumsuz">temaya uymuyor</em>'}`, uygun ? "" : "uyumsuz",
              el("button", { class: "d-btn kucuk", "aria-label": "Yukarı", disabled: i === 0, onclick: () => tasi(i - 1) }, "▲"),
              el("button", { class: "d-btn kucuk", "aria-label": "Aşağı", disabled: i === plan.program.length - 1, onclick: () => tasi(i + 1) }, "▼"),
              el("button", { class: "d-btn kucuk", "aria-label": "Çıkar", "data-cikar": id, onclick: () => { plan.program.splice(i, 1); ciz(); } }, "✕"));
          }),
          satir("🎤 Kapanış konuşması · 1 dk", "sabit"));
        guncelle();
      }
      function guncelle() {
        plan.kaydet();
        const siirler = plan.program.map((id) => KUTUPHANE.find((x) => x.id === id));
        const parcalar = [{ ad: "Açılış", sure: 1, renk: "#b89cff" }];
        siirler.forEach((s, i) => {
          if (i) parcalar.push({ ad: "geçiş", sure: 0.5, renk: "#4a5a75" });
          parcalar.push({ ad: s.ad, sure: s.sure, renk: s.temalar.includes(tema) ? "#ffb547" : "#ff6b6b" });
        });
        parcalar.push({ ad: "Kapanış", sure: 1, renk: "#b89cff" });
        const toplam = parcalar.reduce((a, p) => a + p.sure, 0);
        const olcek = Math.max(toplam, plan.sure + 2);
        cizelge.replaceChildren(
          el("div", { class: "tde-cizelge-bar" }, parcalar.map((p) => el("i", { style: `width:${(p.sure / olcek) * 100}%;background:${p.renk}`, title: `${p.ad} · ${p.sure} dk` })),
            el("b", { class: "tde-hedef", style: `left:${(plan.sure / olcek) * 100}%`, title: "Hedef süre" })),
          el("div", { class: "ort-alt" }, `Toplam ≈ ${String(toplam).replace(".", ",")} dk · hedef ${plan.sure} dk`));
        const uyumsuz = siirler.filter((s) => !s.temalar.includes(tema));
        const sorunlar = [];
        if (siirler.length < 3) sorunlar.push(`En az 3 şiir seç (${siirler.length}/3).`);
        if (uyumsuz.length) sorunlar.push(`Temaya uymayan şiir: ${uyumsuz.map((s) => s.ad).join(", ")}.`);
        if (Math.abs(toplam - plan.sure) > 2) sorunlar.push(toplam > plan.sure ? "Süre hedefi aşıyor; bir şiiri çıkar ya da hedefi değiştir." : "Süre hedefin çok altında; bir şiir daha ekleyebilirsin.");
        if (plan.giris.trim().length < 30) sorunlar.push("Açılış konuşmasını yaz (en az 30 karakter).");
        if (plan.kapanis.trim().length < 20) sorunlar.push("Kapanış konuşmasını yaz (en az 20 karakter).");
        ozet.className = `ort-geri ${sorunlar.length ? "yanlis" : "dogru"}`;
        ozet.innerHTML = sorunlar.length ? sorunlar.join("<br>") : "Program hazır! Şimdi provaya geçebilirsin.";
        if (!sorunlar.length) ctx.gorevTamam();
      }
      ciz();
    },
  },

  /* 10 ----------------------------------------------------------------- */
  {
    baslik: "Sesli okuma provası: hız, durak, vurgu",
    cikti: "TDE3.3",
    anlatim: `
      <p>Aynı şiir farklı okunduğunda farklı etki bırakır. <b>Hız</b>, <b>durakta verilen es</b>, <b>dize sonu esi</b> ve <b>vurgu</b> ile oynayarak en etkili okuyuşu bul.</p>
      <p>Sahnede vurgulamak istediğin kelimelere dokun: o kelime ayrı ve daha yavaş okunur. Her denemeden sonra okuyuşu <b>kaydet</b> ve karşılaştır.</p>
      <p>Mikrofonun varsa kendi sesini de kaydedip dinleyebilirsin: diksiyonuna, nefesine ve tonlamana dikkat et.</p>`,
    gorev: "En az <b>iki farklı ayarla</b> okut, en az bir kelimeyi vurgula ve denemeleri kaydet.",
    ogretmen: "Program, dinletide diksiyonun, beden dilinin, mekân ve zamanın etkin kullanılmasını ve Türkçenin doğru kullanımına dikkat edilmesini istiyor (TDE3.3). Ekrandaki ses yalnızca bir model; öğrencileri aynı dizeyi kendi sesleriyle farklı hız ve vurgularla okumaya teşvik edin. Ses kaydı cihazda kalır, hiçbir yere gönderilmez.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const oku = okuyucu(ctx);
      let sec = "karacaoglan", hiz = 1, durakEs = 250, dizeEs = 600;
      const vurgu = new Set();
      const denemeler = new Set();
      let kutu = null;
      ctx.secenekler({
        etiket: "Şiir", deger: sec,
        liste: [{ deger: "karacaoglan", metin: "Karacaoğlan" }, { deger: "yemen", metin: "Yemen Türküsü" }, { deger: "yunus", metin: "Yunus Emre" }, { deger: "alp", metin: "Alp Er Tunga" }],
        degisti: (v) => { sec = v; vurgu.clear(); ciz(); },
      });
      ctx.kaydirici({ etiket: "Okuma hızı", min: 0.6, max: 1.4, adim: 0.1, deger: hiz, birim: "×", degisti: (v) => (hiz = v) });
      ctx.kaydirici({ etiket: "Durakta es", min: 0, max: 800, adim: 50, deger: durakEs, birim: "ms", degisti: (v) => (durakEs = v) });
      ctx.kaydirici({ etiket: "Dize sonunda es", min: 0, max: 1500, adim: 100, deger: dizeEs, birim: "ms", degisti: (v) => (dizeEs = v) });
      ctx.dugmeler([{ metin: "▶ Oku", ana: true, tik: oynat }, { metin: "■ Durdur", tik: () => oku.durdur() }, { metin: "＋ Denemeyi kaydet", tik: kaydet }]);
      const tablo = ctx.tablo(["#", "Şiir", "Hız", "Durak", "Dize sonu", "Vurgu"]);
      const durum = el("div", { class: "d-geri-bildirim" });
      ctx.kontroller.append(durum);
      kaydedici(ctx.kontroller, ctx);

      function ciz() {
        oku.durdur();
        const s = SIIRLER[sec];
        kutu = el("div", { class: "tde-siir tde-prova" }, el("div", { class: "tde-siir-ust" }, el("b", {}, s.ad), el("span", {}, ` · ${kunye(s)}`)));
        s.dizeler.forEach((d, i) => {
          const ds = durakBul(d, s.olcu, s.durak);
          const satir = el("div", { class: "tde-dize" });
          d.split(/\s+/).forEach((w, j, hepsi) => {
            const anahtar = `${i}-${j}`;
            satir.append(el("button", { class: `tde-vurgu${vurgu.has(anahtar) ? " aktif" : ""}`, type: "button", "data-kelime": anahtar, onclick: (e) => {
              vurgu.has(anahtar) ? vurgu.delete(anahtar) : vurgu.add(anahtar);
              e.currentTarget.classList.toggle("aktif");
            } }, w));
            if (ds.includes(j)) satir.append(el("span", { class: "tde-durak-isaret" }, "/"));
            if (j < hepsi.length - 1) satir.append(" ");
          });
          kutu.append(satir);
        });
        S.replaceChildren(kart("Prova sahnesi · vurgulanacak kelimelere dokun", kutu));
      }
      function parcalar() {
        const s = SIIRLER[sec];
        const liste = [];
        s.dizeler.forEach((d, i) => {
          const ds = durakBul(d, s.olcu, s.durak);
          const kelimeler = d.split(/\s+/);
          let birikim = [];
          const bosalt = (es) => { if (birikim.length) { liste.push({ metin: birikim.map((x) => x.w).join(" "), es, anahtarlar: birikim.map((x) => x.k) }); birikim = []; } };
          kelimeler.forEach((w, j) => {
            const k = `${i}-${j}`;
            if (vurgu.has(k)) { bosalt(120); liste.push({ metin: w, hiz: hiz * 0.75, es: 120, anahtarlar: [k] }); }
            else birikim.push({ w, k });
            if (ds.includes(j)) { bosalt(durakEs); if (liste.length) liste[liste.length - 1].es = Math.max(liste[liste.length - 1].es, durakEs); }
          });
          bosalt(dizeEs);
          liste[liste.length - 1].es = dizeEs;
        });
        return liste;
      }
      function oynat() {
        const p = parcalar();
        oku.oku(p, { hiz, adim: (i) => kutu.querySelectorAll(".tde-vurgu").forEach((b) => b.classList.toggle("okunuyor", i >= 0 && p[i].anahtarlar.includes(b.dataset.kelime))) });
      }
      function kaydet() {
        const anahtar = `${sec}|${hiz}|${durakEs}|${dizeEs}|${[...vurgu].sort().join(",")}`;
        if (denemeler.has(anahtar)) { durum.className = "d-geri-bildirim yanlis"; durum.textContent = "Bu ayarla zaten bir deneme kaydettin; bir şeyi değiştir."; return; }
        denemeler.add(anahtar);
        tablo.satirEkle([denemeler.size, SIIRLER[sec].sair, `${String(hiz.toFixed(1)).replace(".", ",")}×`, `${durakEs} ms`, `${dizeEs} ms`, vurgu.size ? [...vurgu].map((k) => { const [i, j] = k.split("-"); return SIIRLER[sec].dizeler[i].split(/\s+/)[j]; }).join(", ") : "—"]);
        const vurgulu = [...denemeler].some((d) => d.split("|")[4]);
        durum.className = "d-geri-bildirim";
        durum.textContent = `${denemeler.size} deneme kaydedildi${vurgulu ? "" : " · henüz vurgulu deneme yok"}.`;
        if (denemeler.size >= 2 && vurgulu) { durum.className = "d-geri-bildirim dogru"; durum.textContent += " Hangi okuyuş daha etkiliydi? Nedenini grubunla tartış."; ctx.gorevTamam(); }
      }
      ciz();
    },
  },

  /* 11 ----------------------------------------------------------------- */
  {
    baslik: "Dinleti sonrası: değerlendir",
    cikti: "TDE3.4",
    anlatim: `
      <p>Dinletin bitti. Şimdi <b>dereceli puanlama anahtarıyla</b> hem kendini hem de bir akranını değerlendir: 1 = geliştirilmeli, 4 = çok iyi.</p>
      <p>Radar grafiği iki değerlendirmeyi üst üste gösterir. Kendini akranından farklı gördüğün ölçütler, gelişim için en değerli ipuçlarıdır.</p>
      <p>Son olarak <b>konuşmacı kimliğini</b> tarif et: Güçlü yanın ne, bir sonraki dinletide neyi değiştireceksin?</p>`,
    gorev: "Sekiz ölçütün hepsini kendin ve akranın için puanla, konuşmacı kimliğini yaz.",
    ogretmen: "Puanlama ölçütleri programın ölçme-değerlendirme bölümündeki dereceli puanlama anahtarından alınmıştır: içeriğe uygunluk, özgünlük, görsel unsurlar, sunum becerisi, zaman, mekân, beden dili, Türkçenin doğru kullanımı (TDE3.4). Akran değerlendirmesini sınıfta eşleşen öğrenciler birbirinin cihazında yapabilir. Dinleti dijital ortamda yayımlanmak üzere yeniden düzenlenebilir.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const olcutler = [
        { ad: "icerik", etiket: "İçeriğe uygunluk", kisa: "İçerik" }, { ad: "ozgun", etiket: "Özgünlük", kisa: "Özgünlük" },
        { ad: "gorsel", etiket: "Görsel unsurlar", kisa: "Görsel" }, { ad: "sunum", etiket: "Sunum becerisi", kisa: "Sunum" },
        { ad: "zaman", etiket: "Zamanı kullanma", kisa: "Zaman" }, { ad: "mekan", etiket: "Mekânı kullanma", kisa: "Mekân" },
        { ad: "beden", etiket: "Beden dili", kisa: "Beden dili" }, { ad: "turkce", etiket: "Türkçenin doğru kullanımı", kisa: "Türkçe" },
      ];
      const SEV = ["Geliştirilmeli", "Orta", "İyi", "Çok iyi"];
      const veri = kalici("edu:tde10-u1a-sozun-ezgisi:rubrik", { ben: {}, akran: {} });
      const grafikKap = el("div", { class: "tde-radar" });
      const ozet = el("div", { class: "ort-alt" });
      S.append(kart("Değerlendirme radarı", el("div", { class: "tde-radar-satir" }, grafikKap,
        el("div", {}, el("div", { class: "tde-lejant" }, el("i", { style: "background:#ffb547" }), " Öz değerlendirme"),
          el("div", { class: "tde-lejant" }, el("i", { style: "background:#4fc3f7" }), " Akran değerlendirmesi"), ozet))));
      let yazildi = false;
      const ciz = () => {
        veri.kaydet();
        grafikKap.replaceChildren(radar(olcutler, [{ degerler: veri.ben, renk: "#ffb547" }, { degerler: veri.akran, renk: "#4fc3f7" }]));
        const benTam = olcutler.every((o) => veri.ben[o.ad]), akranTam = olcutler.every((o) => veri.akran[o.ad]);
        const satirlar = [];
        if (benTam) {
          const sirali = [...olcutler].sort((a, b) => veri.ben[b.ad] - veri.ben[a.ad]);
          satirlar.push(`Güçlü yanın: <b>${sirali[0].etiket}</b>. Geliştirebileceğin: <b>${sirali[sirali.length - 1].etiket}</b>.`);
        }
        if (benTam && akranTam) {
          const fark = olcutler.filter((o) => Math.abs(veri.ben[o.ad] - veri.akran[o.ad]) >= 2);
          satirlar.push(fark.length ? `Akranınla en az 2 puan farklı gördüğünüz ölçüt: <b>${fark.map((o) => o.etiket).join(", ")}</b>. Bunu birlikte konuşun.` : "Akranınla değerlendirmeleriniz birbirine yakın.");
        }
        ozet.innerHTML = satirlar.join("<br>") || "Puanladıkça özet burada görünecek.";
        if (benTam && akranTam && yazildi) ctx.gorevTamam();
      };
      ctx.not("<p><b>Öz değerlendirme</b></p>");
      rubrik(ctx.kontroller, { olcutler, seviyeler: SEV, degerler: veri.ben, degisti: ciz });
      ctx.not("<p><b>Akran değerlendirmesi</b> (akranının dinletisi)</p>");
      const r2 = rubrik(ctx.kontroller, { olcutler, seviyeler: SEV, degerler: veri.akran, degisti: ciz, mavi: true });
      r2.dataset.akran = "1";
      ctx.yaziAlani({ etiket: "Konuşmacı kimliğim: Güçlü yanım … Bir sonraki dinletide …", anahtar: "tde10-u1a-kimlik", enAz: 50, yeterli: () => { yazildi = true; ciz(); } });
      ciz();
    },
  },

  /* 12 ----------------------------------------------------------------- */
  {
    baslik: "Değerlendirme: sözün ezgisini çöz",
    anlatim: `
      <p>Dokuz soruluk kısa bir değerlendirme. Her sorudan sonra açıklamayı oku.</p>
      <p>En az <b>7 doğru</b> yaparsan bu dersi tamamlamış olursun. Yanlış yaptığın konular için ilgili adıma dönebilirsin.</p>`,
    gorev: "Değerlendirmede en az <b>7/9</b> doğru yap.",
    ogretmen: "Sorular programdaki öğrenme kanıtlarıyla (kısa cevaplı sorular, karşılaştırma tablosu, çıkış kartı) uyumludur. Tema sonunda “Ne Biliyorum – Ne Bilmek İstiyorum – Ne Öğrendim” tablosunun son sütunu sınıfça doldurulabilir.",
    kur(ctx) {
      sahneAc(ctx);
      ctx.sinav([
        { tur: "sayi", metin: "“Gelin tanış olalım” dizesi kaç hecelidir?", dogru: 7, tolerans: 0, birim: "hece", aciklama: "Ge-lin ta-nış o-la-lım: yedi ünlü, yedi hece." },
        { tur: "coktan", metin: "“Havada bulut yok, bu ne dumandır” dizesinde durak nereye düşer?",
          siklar: ["Havada / bulut yok, bu ne dumandır", "Havada bulut yok, / bu ne dumandır", "Havada bulut yok, bu ne / dumandır", "Havada bulut / yok, bu ne dumandır"],
          dogru: 1, aciklama: "On bir heceli dize 6 + 5 duraklıdır: “Havada bulut yok” (6) / “bu ne dumandır” (5)." },
        { tur: "coktan", metin: "“dumandır / figandır / yamandır” sözcüklerinde redif ve kafiye hangisidir?",
          siklar: ["Redif “-dır”, kafiye “-an” (tam kafiye)", "Redif “-andır”, kafiye yok", "Redif “-an”, kafiye “-dır”", "Redif “-mandır”, kafiye “u”"],
          dogru: 0, aciklama: "“-dır” aynı görevdeki ektir: redif. Ondan önce gelen “an” iki sesli benzerliktir: tam kafiye." },
        { tur: "coktan", metin: "Hangi dize <b>aruz ölçüsüyle</b> yazılmıştır?",
          siklar: ["“Gelin tanış olalım”", "“İncecikten bir kar yağar”", "“Korkma, sönmez bu şafaklarda yüzen al sancak”", "“Yavaş yavaş sallanıyor”"],
          dogru: 2, aciklama: "İstiklal Marşı “fâilâtün feilâtün feilâtün fa'lün” kalıbıyla yazılmıştır; diğerleri hece ölçüsü ya da serbest ölçüdür." },
        { tur: "coktan", metin: "Koşuk ile koşma için hangisi <b>doğrudur</b>?",
          siklar: ["Koşuk İslamiyet öncesine, koşma âşık edebiyatına aittir.", "İkisi de aruz ölçüsüyle söylenir.", "Koşuğun son dörtlüğünde şairin adı geçer.", "Koşma, sığır törenlerinde kopuz eşliğinde söylenir."],
          dogru: 0, aciklama: "Koşuk İslamiyet öncesi Türk şiirinin, koşma âşık edebiyatının nazım biçimidir. Tapşırma koşmada görülür; kopuz ve sığır törenleri koşuğa aittir." },
        { tur: "coktan", metin: "Alp Er Tunga Sagusu'ndaki “Emdi yürek yırtılur” dizesinde <b>emdi</b> kelimesinin bugünkü karşılığı nedir?",
          siklar: ["artık bile", "şimdi", "elbette", "hemen sonra"], dogru: 1, aciklama: "“Emdi” bugün “şimdi” biçiminde kullanılır: kelime aynı kalmış, sesi değişmiştir." },
        { tur: "coktan", metin: "Türkülerde bentlerden sonra tekrarlanan bölüme ne ad verilir?",
          siklar: ["Durak", "Redif", "Kavuştak (nakarat)", "Döşeme"], dogru: 2, aciklama: "Kavuştak (bağlama, nakarat) her bentten sonra tekrarlanır; türkünün ezgisini ve duygusunu pekiştirir." },
        { tur: "coktan", metin: "Dizeleri 14, 11, 8 ve 7 heceli olan, belirli bir kalıba da uymayan bir şiir için hangisi söylenebilir?",
          siklar: ["Hece ölçüsüyle yazılmıştır.", "Aruz ölçüsüyle yazılmıştır.", "Serbest ölçüyle yazılmıştır.", "Koşuk biçimindedir."], dogru: 2, aciklama: "Hece sayısı ya da kalıp eşitliği yoksa şiir serbest ölçüyle yazılmıştır (ör. Orhan Veli)." },
        { tur: "coktan", metin: "Şiir dinletisinin <b>bitirme</b> aşamasına en uygun ifade hangisidir?",
          siklar: ["“Değerli dinleyiciler, bugün sizlere vatan şiirlerinden bir demet sunacağız.”", "“Şimdi sözü Yunus Emre'nin dizelerine bırakıyoruz.”", "“Bizi dinlediğiniz için teşekkür eder, bu dizelerin gönlünüzde yankılanmasını dileriz.”", "“Arkadaşlar, mikrofonu biraz yaklaştırır mısınız?”"],
          dogru: 2, aciklama: "İlk seçenek başlatma, ikincisi sürdürme (geçiş) ifadesidir. Teşekkür ve dilekle biten üçüncü ifade dinletiyi kapatır." },
      ], { baslik: "Sözün ezgisi", gecmeOrani: 0.75 });
    },
  },
];

dersBaslat({ adimlar, sahneKur: (kap) => kap.classList.add("tde-zemin") });
