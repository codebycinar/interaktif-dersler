// 10. Sınıf Türk Dili ve Edebiyatı · 1. Tema: Sözün Ezgisi (B) — dinleme/izleme (masal) ve yazma (film şeridi)
// TDE1.1–1.4 dinleme/izleme · TDE4.1–4.4 yazma
import { dersBaslat, el } from "../../../../engine/ders.js";
import { sahneAc, kart, siniflandir, eslestir, sirala, okuyucu, rubrik, radar, kalici, tik } from "../ortak/etkilesim.js";
import { MASAL_ADI, BOLUMLER, UNSURLAR, OLAYLAR, BILGI_METNI } from "./masal.js";
import { yazimDenetle, gecisVarMi, sozVarligiBul, SOZ_VARLIGI } from "./yazim.js";
import { kareSvg, KAPAKLAR, ARKALAR, KISILER, CEKIMLER } from "./ciz.js";

const veri = kalici("edu:tde10-u1b-masal-film-seridi:veri", {
  tahminler: [], strateji: null, liste: [], notlar: {}, dinlenen: [], duydum: [],
  amac: null, kitle: null, kareSayisi: 6, anlatim: null, kareler: [], rubrik: {},
});
const LISTE = [
  ["olay", "Olay örgüsü: ne oldu, nasıl gelişti?"], ["kisiler", "Kişiler ve özellikleri"], ["zaman", "Zaman"], ["mekan", "Mekân"],
  ["tekerleme", "Tekerleme ve kalıp ifadeler"], ["olaganustu", "Olağanüstü unsurlar"], ["ana", "Ana düşünce / tema"],
  ["ileti", "Açık ve örtük iletiler"], ["amac", "Anlatılış amacı"], ["kaynak", "Kaynak: masalı kim, nereden aktarıyor? Güvenilir mi?"],
];
const TAHMINLER = [
  { id: "kaval", metin: "Kaval, olayların çözümünde önemli bir rol oynayacak.", dogru: true },
  { id: "kus", metin: "Bir hayvan insan gibi konuşacak.", dogru: true },
  { id: "yol", metin: "Keloğlan bir yolculuğa çıkacak.", dogru: true },
  { id: "sehir", metin: "Masal büyük ve kalabalık bir şehirde geçecek.", dogru: false },
  { id: "kayip", metin: "Masalın sonunda Keloğlan her şeyini kaybedecek.", dogru: false },
];
const SVG = (html, sinif = "") => el("div", { class: `tde-kare-svg ${sinif}`.trim(), html });
const yeniKare = () => ({ olay: "", arka: "", kisiler: [], cekim: "orta", metin: "", ses: "" });
function kareleriHazirla() {
  const n = veri.kareSayisi || 6;
  while (veri.kareler.length < n) veri.kareler.push(yeniKare());
  veri.kareler.length = n;
}
function secim(etiket, liste, deger, degisti, ozellik = {}) {
  const s = el("select", { "aria-label": etiket, ...ozellik },
    el("option", { value: "" }, "— seç —"), ...Object.entries(liste).map(([k, v]) => el("option", { value: k, selected: k === deger }, v)));
  s.addEventListener("change", () => degisti(s.value));
  return el("label", { class: "tde-etiketli" }, el("span", {}, etiket), s);
}

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Hangi kapak, hangi masal?",
    cikti: "TDE1.1",
    anlatim: `
      <p>Sınıfa üç masal geldi. Kapaklarına bak: <b>Kişiler, mekân, renkler</b> sana masal hakkında ipucu veriyor.</p>
      <p>Önce her başlığı uygun kapakla eşleştir. Sonra bugün dinleyeceğimiz masal için, yalnızca kapaktan ve başlıktan yola çıkarak <b>tahminlerini</b> seç. Dinledikten sonra tahminlerini kontrol edeceksin.</p>`,
    gorev: "Üç başlığı kapaklarla eşleştir ve en az iki tahmin seç.",
    ogretmen: "Program, birkaç masalın sınıfa getirilip adları ve görsellerinden hareketle hangisinin dinleneceğine sınıfça karar verilmesini öneriyor (TDE1.1). Kapakları akıllı tahtada gösterip öğrencilerin gerekçelerini dinleyin; tahminler 3. adımda kontrol edilecek.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const kapaklar = el("div", { class: "tde-kapaklar" },
        [["A", "kaval"], ["B", "dev"], ["C", "ay"]].map(([h, k]) => el("div", { class: "tde-kapak" }, SVG(kareSvg(KAPAKLAR[k])), el("b", {}, `Kapak ${h}`))));
      S.append(kart("Üç masal kapağı", kapaklar));
      let n = 0;
      const kontrol = () => { if (n >= 1 && veri.tahminler.length >= 2) ctx.gorevTamam(); };
      const k = kart("Başlığı kapağıyla eşleştir");
      S.append(k);
      eslestir(k, {
        solBaslik: "Başlık", sagBaslik: "Kapak",
        ciftler: [
          { id: "kaval", sol: MASAL_ADI, sag: "Kapak A: köy, bir çocuk, elinde kaval, yanında kuş", aciklama: "Kaval ve kuş, başlıktaki “konuşan kaval”a işaret ediyor." },
          { id: "dev", sol: "Dağdaki Devin Sırrı", sag: "Kapak B: karanlık dağ, mağara, iri bir varlık" },
          { id: "ay", sol: "Ay Işığında Bekleyen Kız", sag: "Kapak C: gece, hilal, yıldızlar, bir kız" },
        ],
        bitti: () => { n = 1; kontrol(); },
      });
      const t = kart(`Bugün dinleyeceğimiz masal: “${MASAL_ADI}” · Tahminlerin`);
      S.append(t);
      t.append(el("div", { class: "tde-onay" }, TAHMINLER.map((o) => {
        const c = el("input", { type: "checkbox", "data-tahmin": o.id, checked: veri.tahminler.includes(o.id) });
        c.addEventListener("change", () => {
          veri.tahminler = c.checked ? [...new Set([...veri.tahminler, o.id])] : veri.tahminler.filter((x) => x !== o.id);
          veri.kaydet(); kontrol();
        });
        return el("label", {}, c, " ", o.metin);
      })));
      kontrol();
    },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Dinlemeden önce: kontrol listem",
    cikti: "TDE1.2",
    anlatim: `
      <p>İyi bir dinleyici <b>neye dikkat edeceğini</b> önceden bilir. Masalı dinlerken not alacağın ölçütleri seçerek kendi <b>dinleme kontrol listeni</b> hazırla.</p>
      <p>Anlatmaya bağlı metinleri incelerken kullandığın ölçütleri hatırla: olay örgüsü, kişiler, zaman, mekân, dil ve anlatım…</p>
      <p>Bir de <b>dinleme stratejisi</b> seç: Bu masalı nasıl dinleyeceksin?</p>`,
    gorev: "Kontrol listene en az <b>beş</b> ölçüt ekle ve bir dinleme stratejisi seç.",
    ogretmen: "Program, dinleme öncesinde öğrencilerin anlatmaya bağlı edebî metinleri inceleme yöntemlerine ilişkin ölçütleri içeren bir kontrol listesi hazırlamalarını öneriyor (TDE1.2). Dijital ortamdan alınan masal metinlerinin güvenilirliğinin sorgulanması da bu adımda tartışılabilir.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const pano = el("div", { class: "tde-kontrol-listesi" });
      S.append(kart("Dinleme kontrol listem", pano));
      const ciz = () => {
        veri.kaydet();
        pano.replaceChildren(...(veri.liste.length ? veri.liste.map((k) => el("div", { class: "tde-madde" }, "☐ ", LISTE.find((x) => x[0] === k)[1])) : [el("div", { class: "ort-alt" }, "Henüz ölçüt seçmedin.")]),
          el("div", { class: "ort-alt", style: "margin-top:8px" }, `Strateji: ${veri.strateji || "—"}`));
        if (veri.liste.length >= 5 && veri.strateji) ctx.gorevTamam();
      };
      ctx.kontroller.append(el("div", { class: "tde-onay" }, el("div", { class: "ort-alt" }, "Ölçütler"), LISTE.map(([k, metin]) => {
        const c = el("input", { type: "checkbox", "data-olcut": k, checked: veri.liste.includes(k) });
        c.addEventListener("change", () => { veri.liste = c.checked ? [...veri.liste, k] : veri.liste.filter((x) => x !== k); ciz(); });
        return el("label", {}, c, " ", metin);
      })));
      ctx.secenekler({
        etiket: "Dinleme stratejim", deger: veri.strateji,
        liste: ["Not alarak dinleme", "Seçici dinleme (belirli unsurlara odaklanma)", "Katılımlı dinleme (soru sorarak)"].map((m) => ({ deger: m, metin: m })),
        degisti: (v) => { veri.strateji = v; ciz(); },
      });
      ciz();
    },
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Masalı dinle, notunu al",
    cikti: "TDE1.2",
    anlatim: `
      <p>Masal altı bölümde anlatılıyor. Her bölümü dinle; metin varsayılan olarak gizli, çünkü bu bir <b>dinleme</b> etkinliği.</p>
      <p>Dinlerken bir <b>tekerleme ya da kalıp söz</b>, bir <b>olağanüstü olay</b> ya da bir <b>üçleme/tekrar</b> duyarsan ilgili düğmeye bas.</p>
      <p>Panelde kontrol listendeki ölçütlere kısa notlar al. Tüm bölümler bitince tahminlerini kontrol et.</p>`,
    gorev: "Altı bölümün hepsini dinle, en az üç unsuru doğru yakala ve en az üç not al.",
    ogretmen: "Masal ders için özgün olarak yazılmıştır; döşeme ve bitiş kalıpları anonim halk masalı geleneğindendir. Program, dinleme sırasında konu, ana düşünce, açık ve örtük iletiler, karakter özellikleri gibi ölçütlere not alınmasını, ardından ikili gruplarla ortak form oluşturulmasını öneriyor (TDE1.2). Masalı öğretmen kendi sesiyle de anlatabilir: masal anlatıcılığı geleneğini canlandırır.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const oku = okuyucu(ctx);
      let simdi = Math.min(veri.dinlenen.length, BOLUMLER.length - 1), metinAcik = false;
      const cipler = el("div", { class: "tde-bolum-cipler" });
      const metin = el("div", { class: "tde-masal-metin gizli" });
      const geri = el("div", { class: "ort-geri" });
      const sayac = el("div", { class: "ort-alt" });
      const tahminKart = el("div");
      const duydumlar = el("div", { class: "d-satir" }, Object.entries(UNSURLAR).map(([k, u]) =>
        el("button", { class: "d-btn tde-duydum", "data-duydum": k, style: `--renk:${u.renk}`, onclick: () => duydum(k) }, `Duydum: ${u.ad}`)));
      S.append(kart(`“${MASAL_ADI}”`, cipler, metin,
        el("div", { class: "d-satir", style: "margin:10px 0" },
          el("button", { class: "d-btn ana", "data-oynat": "1", onclick: oynat }, "▶ Bölümü dinle"),
          el("button", { class: "d-btn", onclick: () => oku.durdur() }, "■ Durdur"),
          el("button", { class: "d-btn", onclick: () => sec(Math.min(simdi + 1, BOLUMLER.length - 1)) }, "Sonraki bölüm ›"),
          el("button", { class: "d-btn", onclick: () => { metinAcik = !metinAcik; metin.classList.toggle("gizli", !metinAcik); } }, "Metni göster/gizle")),
        duydumlar, geri, sayac), tahminKart);

      const liste = veri.liste.length ? veri.liste : ["olay", "kisiler", "zaman", "mekan", "olaganustu"];
      ctx.not("<p><b>Notlarım</b> (kontrol listemdeki ölçütler)</p>");
      for (const k of liste) {
        const t = el("textarea", { "aria-label": LISTE.find((x) => x[0] === k)[1], "data-not": k, rows: 2, placeholder: "Kısa not…" });
        t.value = veri.notlar[k] || "";
        t.addEventListener("input", () => { veri.notlar[k] = t.value; veri.kaydet(); kontrol(); });
        ctx.kontroller.append(el("label", { class: "tde-etiketli" }, el("span", {}, LISTE.find((x) => x[0] === k)[1]), t));
      }
      function ciz() {
        cipler.replaceChildren(...BOLUMLER.map((b, i) => el("button", {
          class: `d-btn kucuk${i === simdi ? " ana" : ""}${veri.dinlenen.includes(i) ? " dinlendi" : ""}`, "data-bolum": String(i), onclick: () => sec(i),
        }, `${veri.dinlenen.includes(i) ? "✓ " : ""}${i + 1}. ${b.baslik}`)));
        metin.replaceChildren(...BOLUMLER[simdi].cumleler.map((c) => el("span", { class: "tde-cumle" }, c, " ")));
        kontrol();
      }
      function sec(i) { oku.durdur(); simdi = i; geri.textContent = ""; ciz(); }
      async function oynat() {
        const b = BOLUMLER[simdi], benim = simdi;
        const spanlar = metin.querySelectorAll(".tde-cumle");
        const bitti = await oku.oku(b.cumleler.map((c) => ({ metin: c })), { hiz: 0.9, es: 350, adim: (i) => spanlar.forEach((s, j) => s.classList.toggle("okunuyor", i === j)) });
        if (bitti && benim === simdi) {
          if (!veri.dinlenen.includes(simdi)) veri.dinlenen.push(simdi);
          veri.kaydet();
          geri.className = "ort-geri dogru"; geri.textContent = `${simdi + 1}. bölüm bitti.`;
          ciz();
        }
      }
      function duydum(tur) {
        const b = BOLUMLER[simdi];
        const anahtar = `${simdi}:${tur}`;
        if (b.unsurlar.includes(tur)) {
          if (!veri.duydum.includes(anahtar)) veri.duydum.push(anahtar);
          veri.kaydet();
          geri.className = "ort-geri dogru"; geri.textContent = `Evet! ${simdi + 1}. bölümde ${UNSURLAR[tur].ad.toLocaleLowerCase("tr")} var.`;
          tik(880);
        } else {
          geri.className = "ort-geri yanlis"; geri.textContent = `Bu bölümde ${UNSURLAR[tur].ad.toLocaleLowerCase("tr")} yok gibi; dikkatle dinle.`;
          tik(220);
        }
        kontrol();
      }
      function kontrol() {
        const notSayisi = Object.values(veri.notlar).filter((n) => n.trim().length >= 10).length;
        sayac.textContent = `Dinlenen bölüm: ${veri.dinlenen.length}/6 · yakalanan unsur: ${veri.duydum.length} · not: ${notSayisi}`;
        if (veri.dinlenen.length === BOLUMLER.length) {
          tahminKart.replaceChildren(kart("Tahminlerini kontrol et", el("div", { class: "tde-onay" }, TAHMINLER.map((t) => {
            const secti = veri.tahminler.includes(t.id);
            const isaret = secti ? (t.dogru ? "✓ Tahminin doğru çıktı" : "✗ Bu olmadı") : t.dogru ? "• Bunu tahmin etmemiştin ama oldu" : "";
            return el("div", { class: `tde-tahmin${secti ? " secti" : ""}` }, t.metin, isaret ? el("em", {}, ` — ${isaret}`) : null);
          }))));
        }
        if (veri.dinlenen.length === BOLUMLER.length && veri.duydum.length >= 3 && notSayisi >= 3) ctx.gorevTamam();
      }
      ciz();
    },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Zihin haritası: masalın yapısı",
    cikti: "TDE1.3",
    anlatim: `
      <p>Notlarından yararlanarak masalın <b>yapı unsurlarını</b> bir zihin haritasında topla.</p>
      <p>Masallarda <b>zaman</b> ve <b>mekân</b> belirsizdir; kişiler çoğu zaman tek bir özellikleriyle öne çıkar. <b>Olağanüstülükler</b> masalın vazgeçilmezidir. Her masal bir <b>değeri</b> de taşır.</p>
      <p>Kartları zihin haritasının doğru dalına yerleştir.</p>`,
    gorev: "On dört kartı zihin haritasının doğru dallarına yerleştir.",
    ogretmen: "Program, dinleme sırasında oluşturulan formlardan yararlanarak yapı unsurlarının ve dil-anlatım özelliklerinin zihin haritasıyla belirlenmesini, ardından masalda öne çıkan değerlerin toplumsal yaşamdaki önemi üzerine görüş bildirilmesini öneriyor (TDE1.3).",
    kur(ctx) {
      const S = sahneAc(ctx);
      const k = kart("Zihin haritası");
      S.append(k);
      siniflandir(k, {
        kovalar: [{ id: "kisi", baslik: "Kişiler" }, { id: "zaman", baslik: "Zaman" }, { id: "mekan", baslik: "Mekân" }, { id: "olag", baslik: "Olağanüstülükler" }, { id: "deger", baslik: "Değerler" }],
        ogeler: [
          { id: "k1", metin: "Keloğlan: yoksul ama iyi kalpli ve cesur", kova: "kisi" },
          { id: "k2", metin: "Anası: oğluna yol gösteren bilge kadın", kova: "kisi" },
          { id: "k3", metin: "Gülsüm Sultan: üç yıldır susan padişah kızı", kova: "kisi" },
          { id: "z1", metin: "“Evvel zaman içinde”: belirsiz bir geçmiş", kova: "zaman" },
          { id: "z2", metin: "“Günlerden bir gün”", kova: "zaman", neden: "Hangi gün olduğu belli değil: masallarda zaman belirsizdir." },
          { id: "m1", metin: "Dağ eteğindeki köy", kova: "mekan" },
          { id: "m2", metin: "Çeşme başı", kova: "mekan" },
          { id: "m3", metin: "Kara Dağ'daki mağara ve saray", kova: "mekan" },
          { id: "o1", metin: "Bülbülün dile gelip konuşması", kova: "olag" },
          { id: "o2", metin: "İnsan yemek isteyen dev", kova: "olag" },
          { id: "o3", metin: "Devi uyutan büyülü ezgi", kova: "olag" },
          { id: "d1", metin: "İyilik karşılıksız kalmaz", kova: "deger" },
          { id: "d2", metin: "Korkuya rağmen soğukkanlı olmak (cesaret)", kova: "deger" },
          { id: "d3", metin: "Anaya vefa", kova: "deger", neden: "Keloğlan saraya yerleşince anasını unutmaz." },
        ],
        bitti: () => ctx.gorevTamam(),
      });
      const izgara = k.querySelector(".ort-kovalar");
      izgara.classList.add("tde-zihin");
      izgara.insertBefore(el("div", { class: "tde-zihin-merkez" }, el("b", {}, MASAL_ADI), el("span", {}, "masal · anonim gelenek")), izgara.children[2]);
    },
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Olay akışı ve kalıp sözler",
    cikti: "TDE1.3",
    anlatim: `
      <p>Masal belirli bir düzenle ilerler: <b>döşeme</b> (tekerleme) dinleyiciyi masal dünyasına hazırlar, <b>giriş</b> kişileri tanıtır, <b>gelişme</b>de olaylar düğümlenir, <b>sonuç</b>ta düğüm çözülür ve masal bir <b>dilek</b>le kapanır.</p>
      <p>Önce olayları doğru sıraya koy. Sonra kalıp sözlerin masalın hangi bölümünde kullanıldığını bul. Bu kalıplar sözün ezgisini oluşturur: anlatıcı onları neredeyse şarkı söyler gibi söyler.</p>`,
    gorev: "Altı olayı sırala ve altı kalıp sözü doğru bölüme yerleştir.",
    ogretmen: "Öğrencilerin masaldaki tekerlemelerin ve kalıplaşmış ifadelerin nasıl kullanıldığını fark etmeleri programın içerik çerçevesinde açıkça istenir. Kalıp sözlerin ahenk unsurlarını (ses tekrarı, iç kafiye: “zaman içinde / saman içinde”) birinci dersteki ahenk haritasıyla ilişkilendirin.",
    kur(ctx) {
      const S = sahneAc(ctx);
      let n = 0;
      const bit = () => { if (++n === 2) ctx.gorevTamam(); };
      const k1 = kart("Olayları sırala");
      S.append(k1);
      sirala(k1, { ogeler: OLAYLAR.map((o) => ({ id: o.id, metin: o.metin })), bitti: bit });
      const k2 = kart("Kalıp söz nerede kullanılır?");
      S.append(k2);
      siniflandir(k2, {
        kovalar: [{ id: "bas", baslik: "Başlangıç (döşeme)" }, { id: "ic", baslik: "Olayların içinde (geçiş, duyuru)" }, { id: "son", baslik: "Bitiş (dilek, kapanış)" }],
        ogeler: [
          { id: "a", metin: "“Evvel zaman içinde, kalbur saman içinde…”", kova: "bas" },
          { id: "b", metin: "“Develer tellal iken, pireler berber iken…”", kova: "bas" },
          { id: "c", metin: "“Az gitmiş, uz gitmiş, dere tepe düz gitmiş…”", kova: "ic", neden: "Bu kalıp yolculuğun uzunluğunu ahenkli biçimde anlatır." },
          { id: "d", metin: "“Duyduk duymadık demeyin!”", kova: "ic" },
          { id: "e", metin: "“Onlar ermiş muradına, biz çıkalım kerevetine.”", kova: "son" },
          { id: "f", metin: "“Gökten üç elma düşmüş…”", kova: "son" },
        ],
        bitti: bit,
      });
    },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Masal mı, bilgilendirici metin mi?",
    cikti: "TDE1.2",
    anlatim: `
      <p>Aşağıda iki metin var: dinlediğin masal ve masal anlatıcılığı üzerine kısa bir <b>bilgilendirici metin</b>.</p>
      <p>Edebî metin <b>duygu ve hayal gücüne</b> seslenir, kurmacadır, estetik bir zevk uyandırır. Bilgilendirici metin <b>düşünceye</b> seslenir, gerçek bilgi verir.</p>
      <p>Cümleleri ait oldukları metin türüne yerleştir.</p>`,
    gorev: "Sekiz cümleyi doğru sınıflandır ve dinleyici sorusunu cevapla.",
    ogretmen: "Program, bir bilgilendirici metinle dinlenen masalın öğrencinin duygularına mı düşüncelerine mi hitap ettiğinin sorgulanmasını; ayrıca masal dinlerken dinleyiciler arasında dayanışma ve birliktelik duygusunun oluştuğunun fark ettirilmesini öneriyor (TDE1.2). Masalların günümüzde daha çok aile içinde anlatıldığına, geleneğin ise sürdüğüne değinin.",
    kur(ctx) {
      const S = sahneAc(ctx);
      let n = 0;
      const bit = () => { if (++n === 2) ctx.gorevTamam(); };
      S.append(kart("Bilgilendirici metin: Masal anlatıcılığı", el("p", { class: "tde-bilgi" }, BILGI_METNI.join(" "))));
      const k = kart("Sınıflandır");
      S.append(k);
      const m = (i, j) => BOLUMLER[i].cumleler[j];
      siniflandir(k, {
        kovalar: [{ id: "edebi", baslik: "Edebî metin (masal): duyguya, hayale seslenir" }, { id: "bilgi", baslik: "Bilgilendirici metin: düşünceye seslenir" }],
        ogeler: [
          { id: "e1", metin: m(2, 5), kova: "edebi" },
          { id: "e2", metin: m(3, 3), kova: "edebi" },
          { id: "e3", metin: m(5, 3), kova: "edebi" },
          { id: "e4", metin: m(0, 4), kova: "edebi" },
          ...BILGI_METNI.map((c, i) => ({ id: `b${i}`, metin: c, kova: "bilgi", neden: "Bu cümle gerçek bir bilgi veriyor; kurmaca değil." })),
        ],
        bitti: bit,
      });
      const geri = el("div", { class: "d-geri-bildirim" });
      let bildi = false;
      ctx.secenekler({
        etiket: "Bir masal topluca dinlenirken dinleyiciler arasında en çok hangi duygu oluşur?", deger: null,
        liste: [
          { deger: "a", metin: "Rekabet ve yarışma" },
          { deger: "b", metin: "Dayanışma ve birliktelik" },
          { deger: "c", metin: "Sıkıntı ve yalnızlık" },
        ],
        degisti: (v) => {
          const ok = v === "b";
          geri.className = `d-geri-bildirim ${ok ? "dogru" : "yanlis"}`;
          geri.textContent = ok ? "Doğru. Aynı hikâyeyi birlikte dinlemek ortak bir duygu ve hafıza oluşturur." : "Masal dinlemek ortak bir deneyimdir; dinleyicileri birbirine yakınlaştırır.";
          if (ok && !bildi) { bildi = true; bit(); }
        },
      });
      ctx.kontroller.append(geri);
    },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Masalı değerlendir: başka bir yol",
    cikti: "TDE1.4",
    anlatim: `
      <p>Bir metni değerlendirmek için önce <b>kendi beğeni ölçütlerini</b> belirle: Seni bir masalda en çok ne etkiler?</p>
      <p>En az üç ölçüt seç ve masalı her biri için puanla. Sonra masalda bir <b>karar anı</b> seç ve kişinin başka türlü davrandığını düşünerek masala <b>alternatif bir gelişme</b> yaz.</p>`,
    gorev: "En az üç ölçütle puanla ve alternatif gelişmeni yaz.",
    ogretmen: "Program, öğrencinin kendi beğeni ölçütlerinin yer aldığı bir öz değerlendirme formu hazırlamasını ve metindeki olaya, duruma, karakterlerin davranışlarına alternatif görüşler üretip sınıfta sunmasını öneriyor (TDE1.4).",
    kur(ctx) {
      const S = sahneAc(ctx);
      const OLCUTLER = ["Olay örgüsü sürükleyici", "Dili ahenkli, kulakta kalıyor", "Kişiler ilgi çekici", "İletisi anlamlı", "Olağanüstülükler yaratıcı", "Sonu tatmin edici"];
      const puan = {};
      const form = el("div", { class: "tde-form" });
      S.append(kart("Öz değerlendirme formum", form));
      let yazildi = false;
      const ciz = () => {
        form.replaceChildren(...(Object.keys(puan).length ? Object.entries(puan).map(([o, p]) =>
          el("div", { class: "tde-form-satir" }, el("span", {}, o),
            el("span", { class: "tde-yildiz" }, [1, 2, 3, 4, 5].map((i) => el("button", { type: "button", class: i <= p ? "dolu" : "", "data-yildiz": `${o}|${i}`, "aria-label": `${o}: ${i}`, onclick: () => { puan[o] = i; ciz(); } }, "★"))))) : [el("div", { class: "ort-alt" }, "Paneldeki ölçütlerden en az üçünü seç.")]));
        const tamam = Object.values(puan).filter((p) => p > 0).length >= 3;
        if (tamam && yazildi) ctx.gorevTamam();
      };
      ctx.kontroller.append(el("div", { class: "tde-onay" }, el("div", { class: "ort-alt" }, "Beğeni ölçütlerim"), OLCUTLER.map((o) => {
        const c = el("input", { type: "checkbox", "data-begeni": o });
        c.addEventListener("change", () => { if (c.checked) puan[o] = 0; else delete puan[o]; ciz(); });
        return el("label", {}, c, " ", o);
      })));
      const ipucu = el("div", { class: "d-anlatim" });
      ctx.secenekler({
        etiket: "Karar anı", deger: null,
        liste: [
          { deger: "a", metin: "Keloğlan bülbüle yardım etmeseydi…" },
          { deger: "b", metin: "Keloğlan devden kaçsaydı…" },
          { deger: "c", metin: "Sultan kız yine konuşmasaydı…" },
        ],
        degisti: (v) => { ipucu.innerHTML = { a: "<p>Kavaldan hâlâ hırıltı mı çıkardı? Devin önünden nasıl geçerdi?</p>", b: "<p>Başka hangi yolu denerdi? Kavalın gücünü hiç keşfedemez miydi?</p>", c: "<p>Keloğlan başka ne denerdi? Sözün mü, ezginin mi gücü daha fazla?</p>" }[v]; },
      });
      ctx.kontroller.append(ipucu);
      ctx.yaziAlani({ etiket: "Alternatif gelişme: Bu durumda masal nasıl devam ederdi?", anahtar: "tde10-u1b-alternatif", enAz: 80, yeterli: () => { yazildi = true; ciz(); } });
      ciz();
    },
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Film şeridi: amaç ve kitle",
    cikti: "TDE4.1",
    anlatim: `
      <p><b>Film şeridi</b> (storyboard), bir hikâyenin sahne sahne çizilip altına anlatıcı metni, diyalog ve ses notlarının yazıldığı plandır. Filmler çekilmeden önce böyle hazırlanır.</p>
      <p>Dinlediğin masalı film şeridine dönüştüreceksin. İşe başlamadan karar ver: Film şeridini <b>hangi amaçla</b> ve <b>kimin için</b> hazırlıyorsun? Kaç kare olacak, anlatım nasıl olacak?</p>`,
    gorev: "Amacı, hedef kitleyi, kare sayısını ve anlatım biçimini seç.",
    ogretmen: "Program, öğrencilerin film şeridini hangi amaç için ve hangi kitleye hitaben hazırlayacaklarına karar vermelerini; kullanacakları malzemeleri ve metinden alacakları ifadeleri yapılandırmalarını öneriyor (TDE4.1). Performans görevi için sınıf dışında hazırlık yapılır.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const kartEl = el("div", { class: "tde-yapim" });
      S.append(kartEl);
      const ONERI = {
        ilkokul: "Kısa ve basit cümleler kullan, renkli ve büyük çizimler yap; kalıp sözleri tekrar ettir.",
        sinif: "Kalıp sözlerin ahengini ve masalın değerlerini öne çıkar; geçişleri ustaca kur.",
        aile: "Sözlü kültürü hatırlatan bir sunuş ekle; büyüklerinin bildiği masallarla karşılaştırmaya davet et.",
      };
      const ciz = () => {
        veri.kaydet();
        kartEl.replaceChildren(
          el("div", { class: "tde-afis-ust" }, "YAPIM KARTI"),
          el("h3", {}, MASAL_ADI),
          el("dl", {},
            el("dt", {}, "Amaç"), el("dd", {}, veri.amac || "—"),
            el("dt", {}, "Hedef kitle"), el("dd", {}, { ilkokul: "İlkokul öğrencileri", sinif: "Sınıf arkadaşlarım", aile: "Ailem ve büyüklerim" }[veri.kitle] || "—"),
            el("dt", {}, "Kare sayısı"), el("dd", {}, String(veri.kareSayisi)),
            el("dt", {}, "Anlatım"), el("dd", {}, veri.anlatim || "—")),
          veri.kitle ? el("p", { class: "tde-oneri" }, "💡 ", ONERI[veri.kitle]) : "",
          el("div", { class: "tde-mini-serit" }, Array.from({ length: veri.kareSayisi }, (_, i) => el("i", {}, String(i + 1)))));
        if (veri.amac && veri.kitle && veri.anlatim) ctx.gorevTamam();
      };
      ctx.secenekler({ etiket: "Amaç", deger: veri.amac, liste: ["Eğlendirmek", "Bir değeri aktarmak (iyilik, cesaret)", "Sözlü kültürü tanıtmak"].map((m) => ({ deger: m, metin: m })), degisti: (v) => { veri.amac = v; ciz(); } });
      ctx.secenekler({ etiket: "Hedef kitle", deger: veri.kitle, liste: [{ deger: "ilkokul", metin: "İlkokul öğrencileri" }, { deger: "sinif", metin: "Sınıf arkadaşlarım" }, { deger: "aile", metin: "Ailem ve büyüklerim" }], degisti: (v) => { veri.kitle = v; ciz(); } });
      ctx.secenekler({ etiket: "Kare sayısı", deger: veri.kareSayisi, liste: [{ deger: 6, metin: "6 kare" }, { deger: 8, metin: "8 kare" }], degisti: (v) => { veri.kareSayisi = v; kareleriHazirla(); ciz(); } });
      ctx.secenekler({ etiket: "Anlatım biçimi", deger: veri.anlatim, liste: ["Anlatıcı sesi ağırlıklı", "Diyalog ağırlıklı", "Altyazılı, sessiz kareler"].map((m) => ({ deger: m, metin: m })), degisti: (v) => { veri.anlatim = v; ciz(); } });
      ciz();
    },
  },

  /* 9 ------------------------------------------------------------------ */
  {
    baslik: "Sahne kartları: film şeridini kur",
    cikti: "TDE4.2",
    anlatim: `
      <p>Her kare için bir <b>olay</b> seç, <b>arka planı</b>, <b>kişileri</b> ve <b>çekim ölçeğini</b> belirle. Çizim kendiliğinden oluşur.</p>
      <p><b>Geniş çekim</b> mekânı tanıtır, <b>orta çekim</b> kişilerin etkileşimini, <b>yakın çekim</b> bir kişinin duygusunu gösterir.</p>
      <p>Altına anlatıcı metnini ya da diyaloğu yaz; masaldaki kalıp sözlerden ve deyimlerden yararlanabilirsin. Ses notu da ekle: kaval ezgisi, kuş sesi…</p>`,
    gorev: "Tüm karelere olay, en az bir kişi ve en az 20 karakterlik metin ekle.",
    ogretmen: "Program, öğrencilerin film şeridinde kullanılacak iletilere karar verip bunları sıraya koymalarını, içeriğe uygun söz varlığını seçmelerini, uygun görsel ve işitsel ögeleri seçip taslağı akranlarına sunmalarını öneriyor (TDE4.2). Öğrenciler ekrandaki çizimleri kendi el çizimleriyle değiştirebilir (TDE4.3: kendi çizimlerinden yararlanır).",
    kur(ctx) {
      const S = sahneAc(ctx);
      kareleriHazirla();
      let secili = 0;
      const serit = el("div", { class: "tde-serit" });
      const durum = el("div", { class: "ort-alt" });
      S.append(kart(`Film şeridi · ${veri.kareSayisi} kare`, serit, durum));
      const duzen = el("div", { class: "tde-kare-duzen" });
      ctx.kontroller.append(duzen);
      const SESLER = { kaval: "Kaval ezgisi", kus: "Kuş sesi", davul: "Davul ve tellal sesi", horultu: "Dev horultusu", dugun: "Düğün havası", sessiz: "Sessizlik" };
      const tamamMi = (k) => k.olay && k.kisiler.length && k.metin.trim().length >= 20;
      function ciz() {
        veri.kaydet();
        serit.replaceChildren(...veri.kareler.map((k, i) => el("button", { class: `tde-kare${i === secili ? " secili" : ""}${tamamMi(k) ? " tamam" : ""}`, "data-kare": String(i), onclick: () => { secili = i; ciz(); } },
          SVG(kareSvg(k)), el("span", { class: "tde-kare-no" }, `${i + 1}`), el("span", { class: "tde-kare-metin" }, k.metin || "…"), k.ses ? el("span", { class: "tde-kare-ses" }, `♪ ${SESLER[k.ses]}`) : null)));
        const n = veri.kareler.filter(tamamMi).length;
        durum.textContent = `Hazır kare: ${n}/${veri.kareler.length}`;
        if (n === veri.kareler.length) ctx.gorevTamam();
      }
      function duzenle() {
        const k = veri.kareler[secili];
        const metin = el("textarea", { "aria-label": "Anlatıcı metni / diyalog", "data-alan": "metin", rows: 3, placeholder: "Az gitmiş, uz gitmiş…" });
        metin.value = k.metin;
        metin.addEventListener("input", () => { k.metin = metin.value; ciz(); });
        const kisiler = el("div", { class: "d-satir" }, Object.entries(KISILER).map(([id, ad]) => el("button", {
          class: "d-btn kucuk", "aria-pressed": String(k.kisiler.includes(id)), "data-kisi": id,
          onclick: (e) => { k.kisiler = k.kisiler.includes(id) ? k.kisiler.filter((x) => x !== id) : [...k.kisiler, id]; e.currentTarget.setAttribute("aria-pressed", String(k.kisiler.includes(id))); ciz(); },
        }, ad)));
        const cekim = el("div", { class: "d-satir" }, Object.entries(CEKIMLER).map(([id, ad]) => el("button", {
          class: "d-btn kucuk", "aria-pressed": String(k.cekim === id), "data-cekim": id,
          onclick: () => { k.cekim = id; duzenle(); ciz(); },
        }, ad)));
        duzen.replaceChildren(
          el("div", { class: "d-anlatim" }, el("p", { html: `<b>${secili + 1}. kare</b>` })),
          secim("Olay", Object.fromEntries([...OLAYLAR.map((o, i) => [o.id, `${i + 1}. ${o.metin.slice(0, 48)}…`]), ["ozel", "Kendi sahnem (ara sahne)"]]), k.olay, (v) => {
            k.olay = v;
            const o = OLAYLAR.find((x) => x.id === v);
            if (o) { if (!k.arka) k.arka = o.arka; if (!k.kisiler.length) k.kisiler = [...o.kisiler]; }
            duzenle(); ciz();
          }, { "data-secim": "olay" }),
          secim("Arka plan", ARKALAR, k.arka, (v) => { k.arka = v; ciz(); }, { "data-secim": "arka" }),
          el("div", { class: "tde-etiketli" }, el("span", {}, "Kişiler"), kisiler),
          el("div", { class: "tde-etiketli" }, el("span", {}, "Çekim ölçeği"), cekim),
          el("label", { class: "tde-etiketli" }, el("span", {}, "Anlatıcı metni / diyalog"), metin),
          secim("Ses / müzik", SESLER, k.ses, (v) => { k.ses = v; ciz(); }, { "data-secim": "ses" }),
          el("div", { class: "d-satir" },
            el("button", { class: "d-btn", disabled: secili === 0, onclick: () => { secili--; duzenle(); ciz(); } }, "‹ Önceki kare"),
            el("button", { class: "d-btn ana", disabled: secili === veri.kareler.length - 1, onclick: () => { secili++; duzenle(); ciz(); } }, "Sonraki kare ›")));
      }
      serit.addEventListener("click", () => duzenle());
      duzenle();
      ciz();
    },
  },

  /* 10 ----------------------------------------------------------------- */
  {
    baslik: "Düzenle: yazım, noktalama, söz varlığı",
    cikti: "TDE4.3",
    anlatim: `
      <p>Taslağın hazır. Şimdi <b>editör</b> gözüyle oku. Denetleyici her karedeki metni yazım ve noktalama kurallarına göre tarar.</p>
      <p>Olay akışının kopmaması için kareleri <b>geçiş ifadeleriyle</b> bağla (Günlerden bir gün, Derken, O sırada, Sonunda…). Metnini zenginleştirmek için <b>bağlama uygun deyim ve atasözleri</b> kullan.</p>
      <p>Taslağın yoksa örnek taslağı yükle: içinde bilerek bırakılmış yanlışlar var.</p>`,
    gorev: "Tüm karelerdeki yanlışları düzelt; en az iki geçiş ifadesi ve bir deyim ya da atasözü kullan.",
    ogretmen: "Program, öğrencinin yazım kurallarını ve noktalama işaretlerini uygun biçimde kullanmasını, ifadeleri arasındaki geçiş ve bağlantılara, tutarlılığa dikkat etmesini, bağlama uygun söz varlığından (deyim, atasözü, mecaz) yararlanmasını istiyor (TDE4.3). Denetleyici kural tabanlıdır; her bulguyu öğrencinin gerekçesiyle açıklamasını isteyin.",
    kur(ctx) {
      const S = sahneAc(ctx);
      kareleriHazirla();
      const ORNEK = [
        "evvel zaman içinde dağ eteğindeki bir köyde keloğlan ile anası yaşarmış",
        "Günlerden bir gün tellallar bağırmış : “Duyduk duymadık demeyin!”",
        "Keloğlan yola düşmüş.Bir çeşme başında kanadı kırık bir bülbül görmüş.",
        "Derken Kara Dağdaki dev çıkagelmiş. Keloğlanın ödü kopmuş ama kavalını çalmış.",
        "Gülsüm Sultan pencereye gelmiş ve ve üç yıl sonra ilk kez dile gelmiş.",
        "Sonunda kırk gün kırk gece düğün yapılmış herkez sevinmiş",
      ];
      let secili = 0;
      const liste = el("div", { class: "tde-denetim" });
      const ozet = el("div", { class: "ort-geri" });
      S.append(kart("Editör masası", liste, ozet));
      const alan = el("textarea", { "aria-label": "Seçili karenin metni", "data-alan": "duzelt", rows: 4 });
      const bulgular = el("ul", { class: "tde-bulgular" });
      const baslik = el("div", { class: "d-anlatim" });
      alan.addEventListener("input", () => { veri.kareler[secili].metin = alan.value; ciz(); });
      ctx.kontroller.append(baslik, el("div", { class: "d-girdi" }, alan), bulgular,
        el("div", { class: "ort-alt" }, "Deyim ve atasözü öner (metne ekler):"),
        el("div", { class: "d-satir" }, SOZ_VARLIGI.slice(-2).map((s) => el("button", { class: "d-btn kucuk", onclick: () => { alan.value = `${alan.value.trim()} ${s.ad}`.trim(); alan.dispatchEvent(new Event("input")); } }, s.ad))));
      ctx.dugmeler([{ metin: "Örnek taslağı yükle", tik: () => {
        veri.kareSayisi = 6; veri.kareler = ORNEK.map((metin, i) => ({ ...yeniKare(), olay: OLAYLAR[i].id, arka: OLAYLAR[i].arka, kisiler: [...OLAYLAR[i].kisiler], metin }));
        secili = 0; ciz();
      } }]);
      function ciz() {
        veri.kaydet();
        let hata = 0, gecis = 0;
        const soz = new Set();
        liste.replaceChildren(...veri.kareler.map((k, i) => {
          const b = yazimDenetle(k.metin);
          hata += b.length;
          if (gecisVarMi(k.metin)) gecis++;
          sozVarligiBul(k.metin).forEach((s) => soz.add(s));
          return el("button", { class: `tde-denetim-satir${i === secili ? " secili" : ""}${b.length ? " hatali" : " temiz"}`, "data-denetim": String(i), onclick: () => { secili = i; ciz(); } },
            SVG(kareSvg(k), "kucuk"), el("span", {}, el("b", {}, `${i + 1}. kare`), " ", k.metin || "(boş)"), el("em", {}, b.length ? `${b.length} bulgu` : "✓"));
        }));
        const k = veri.kareler[secili];
        if (document.activeElement !== alan) alan.value = k.metin;
        baslik.innerHTML = `<p><b>${secili + 1}. karenin metni</b></p>`;
        const b = yazimDenetle(k.metin);
        bulgular.replaceChildren(...(b.length ? b.map((x) => el("li", {}, x.mesaj)) : [el("li", { class: "temiz" }, "Bu karede yazım ve noktalama bulgusu yok.")]));
        const sorun = [];
        if (hata) sorun.push(`${hata} yazım/noktalama bulgusu var.`);
        if (gecis < 2) sorun.push(`Geçiş ifadesiyle başlayan kare: ${gecis}/2.`);
        if (!soz.size) sorun.push("Henüz deyim ya da atasözü yok.");
        ozet.className = `ort-geri ${sorun.length ? "yanlis" : "dogru"}`;
        ozet.innerHTML = sorun.length ? sorun.join(" ") : `Metin temiz! Geçiş ifadesi: ${gecis}, söz varlığı: ${[...soz].join(", ")}.`;
        if (!sorun.length && veri.kareler.every((x) => x.metin.trim())) ctx.gorevTamam();
      }
      ciz();
    },
  },

  /* 11 ----------------------------------------------------------------- */
  {
    baslik: "Panoya as: değerlendir ve paylaş",
    cikti: "TDE4.4",
    anlatim: `
      <p>Film şeridin panoda. Dereceli puanlama anahtarıyla kendi çalışmanı değerlendir.</p>
      <p>Çalışmanı paylaştığında farklı yorumlar alacaksın. Yapıcı eleştiriden yararlanmak, kırıcı bir yorumla ise <b>sakin ve saygılı</b> biçimde başa çıkmak da yazma sürecinin parçasıdır.</p>`,
    gorev: "Altı ölçütü puanla ve kırıcı yoruma en uygun cevabı seç.",
    ogretmen: "Ölçütler programdaki dereceli puanlama anahtarından alınmıştır: akıcılık, görsel ögelerin kullanımı, karakter tasarımı, senaryo ve olay akışı, estetik, dil ve anlatım (TDE4.4). Ürünler sınıf/okul panosunda ya da okulun resmî çevrim içi ortamlarında paylaşılabilir; program dijital ortamlardaki olumsuz eleştirilerle başa çıkmayı da hedefler.",
    kur(ctx) {
      const S = sahneAc(ctx);
      kareleriHazirla();
      const olcutler = [
        { ad: "akicilik", etiket: "Akıcılık", kisa: "Akıcılık" }, { ad: "gorsel", etiket: "Görsel ögelerin kullanımı", kisa: "Görsel" },
        { ad: "karakter", etiket: "Karakter tasarımı", kisa: "Karakter" }, { ad: "senaryo", etiket: "Senaryo ve olay akışı", kisa: "Senaryo" },
        { ad: "estetik", etiket: "Estetik", kisa: "Estetik" }, { ad: "dil", etiket: "Dil ve anlatım", kisa: "Dil" },
      ];
      const pano = el("div", { class: "tde-pano" }, veri.kareler.map((k, i) => el("figure", {}, SVG(kareSvg(k)), el("figcaption", {}, el("b", {}, `${i + 1}. `), k.metin || "…"))));
      const radarKap = el("div", { class: "tde-radar" });
      const bosSerit = !veri.kareler.some((k) => k.arka || k.metin);
      S.append(kart(`Pano · ${MASAL_ADI}`, bosSerit ? el("p", { class: "ort-alt" }, "Film şeridin henüz boş: 9. adımda kareleri oluşturursan burada görünür.") : "", pano),
        kart("Akran yorumları", el("ul", { class: "tde-yorumlar" },
          el("li", {}, "“Dev sahnesinde yakın çekim çok etkili olmuş, korkuyu hissettim.”"),
          el("li", {}, "“3. ile 4. kare arasında bir geçiş eksik gibi; Keloğlan dağa nasıl vardı?”"),
          el("li", { class: "kirici" }, "“Bu çok kötü olmuş, hiç beğenmedim.”"))),
        kart("Öz değerlendirme radarı", radarKap));
      let cevap = false;
      const ciz = () => {
        veri.kaydet();
        radarKap.replaceChildren(radar(olcutler, [{ degerler: veri.rubrik, renk: "#ffb547" }], { boyut: 260 }));
        if (olcutler.every((o) => veri.rubrik[o.ad]) && cevap) ctx.gorevTamam();
      };
      rubrik(ctx.kontroller, { olcutler, seviyeler: ["Geliştirilmeli", "Orta", "İyi", "Çok iyi"], degerler: veri.rubrik, degisti: ciz });
      const geri = el("div", { class: "d-geri-bildirim" });
      ctx.secenekler({
        etiket: "“Bu çok kötü olmuş, hiç beğenmedim.” yorumuna nasıl cevap verirsin?", deger: null,
        liste: [
          { deger: "a", metin: "“Sen daha iyisini yap da görelim!”" },
          { deger: "b", metin: "“Hangi kısmı beğenmediğini söylersen düzeltmeye çalışırım.”" },
          { deger: "c", metin: "Çalışmamı hemen panodan kaldırırım." },
        ],
        degisti: (v) => {
          cevap = v === "b";
          geri.className = `d-geri-bildirim ${cevap ? "dogru" : "yanlis"}`;
          geri.textContent = cevap ? "Doğru. Kırıcı bir yorumu bile somut bir geri bildirime dönüştürmeye çalışmak olgun bir tutumdur." : v === "a" ? "Bu cevap tartışmayı büyütür ve sana bir şey kazandırmaz." : "Emeğini bir yorum yüzünden silme; önce yorumun gerekçesini öğrenmeye çalış.";
          ciz();
        },
      });
      ctx.kontroller.append(geri);
      ciz();
    },
  },

  /* 12 ----------------------------------------------------------------- */
  {
    baslik: "Değerlendirme: masaldan film şeridine",
    anlatim: `
      <p>Sekiz soruluk kısa bir değerlendirme. Her sorudan sonra açıklamayı oku.</p>
      <p>En az <b>6 doğru</b> yaparsan bu dersi tamamlamış olursun. Tema sonunda “Ne Öğrendim?” sorusunu sınıfça cevaplayın.</p>`,
    gorev: "Değerlendirmede en az <b>6/8</b> doğru yap.",
    ogretmen: "Sorular programdaki öğrenme kanıtlarıyla (kısa cevaplı sorular, zihin haritası, çıkış kartı) uyumludur. Tema sonu “Ne Biliyorum – Ne Bilmek İstiyorum – Ne Öğrendim” tablosunun son sütununu büyük grup tartışmasıyla tamamlayın.",
    kur(ctx) {
      sahneAc(ctx);
      ctx.sinav([
        { tur: "coktan", metin: "Masalların başında yer alan, olaylarla doğrudan ilgisi olmayan ahenkli söz dizisine ne ad verilir?",
          siklar: ["Döşeme (tekerleme)", "Kavuştak", "Redif", "Dilek"], dogru: 0, aciklama: "Döşeme dinleyiciyi masal dünyasına hazırlar: “Evvel zaman içinde, kalbur saman içinde…”" },
        { tur: "coktan", metin: "“Keloğlan ile Konuşan Kaval” masalındaki <b>olağanüstü</b> unsur hangisidir?",
          siklar: ["Padişahın tellal çıkarması", "Bülbülün dile gelip konuşması", "Keloğlan'ın anasının elini öpmesi", "Düğünün kırk gün sürmesi"], dogru: 1,
          aciklama: "Hayvanların insan gibi konuşması gerçek hayatta olmaz: olağanüstüdür. Diğerleri gerçek hayatta da olabilecek olaylardır." },
        { tur: "coktan", metin: "Masallarda zaman ve mekân genellikle nasıldır?",
          siklar: ["Tarihi ve yeri kesin olarak verilir.", "Belirsizdir.", "Her zaman bir şehirdir.", "Yalnızca gelecekte geçer."], dogru: 1, aciklama: "“Evvel zaman içinde”, “uzak bir ülkede” gibi ifadeler zamanı ve mekânı belirsiz bırakır." },
        { tur: "coktan", metin: "“Az gitmiş, uz gitmiş, dere tepe düz gitmiş” ifadesinin masaldaki işlevi nedir?",
          siklar: ["Kişinin dış görünüşünü anlatmak", "Yolculuğun uzunluğunu ahenkli bir kalıpla anlatmak", "Masalı bitirmek", "Dinleyiciye soru sormak"], dogru: 1,
          aciklama: "Bu kalıp söz, zamanın ve yolun uzunluğunu ses tekrarlarıyla, ahenkli biçimde anlatır." },
        { tur: "coktan", metin: "Film şeridinde <b>yakın çekim</b> en çok hangi amaçla kullanılır?",
          siklar: ["Mekânın tamamını tanıtmak", "Bir kişinin duygusunu, yüz ifadesini göstermek", "Kareleri numaralandırmak", "Ses efekti eklemek"], dogru: 1,
          aciklama: "Yakın çekim izleyiciyi kişinin duygusuna yaklaştırır; geniş çekim mekânı tanıtır." },
        { tur: "coktan", metin: "Film şeridi hazırlarken ilk yapılması gereken hangisidir?",
          siklar: ["Kareleri boyamak", "Amacı ve hedef kitleyi belirlemek", "Akran yorumlarını okumak", "Panoya asmak"], dogru: 1,
          aciklama: "Amaç ve kitle; kare sayısını, dili ve görselleri belirler. Yazma süreci planlamayla başlar." },
        { tur: "coktan", metin: "Hangi cümlede yazım ya da noktalama yanlışı <b>yoktur</b>?",
          siklar: ["keloğlan yola düştü.", "Keloğlan herkeze selam verdi.", "Keloğlan, kavalını beline soktu.", "Dev uyudu , Keloğlan geçti."], dogru: 2,
          aciklama: "Özel adlar büyük harfle başlar; “herkes” doğru yazımdır; virgülden önce boşluk bırakılmaz." },
        { tur: "coktan", metin: "Aynı masalın farklı yörelerde ya da farklı anlatıcılarca değişik biçimlerde anlatılmasına ne denir?",
          siklar: ["Varyant", "Redif", "Durak", "Tapşırma"], dogru: 0, aciklama: "Sözlü gelenekte her anlatıcı masala kendinden bir şey katar; böylece bir masalın birçok varyantı oluşur." },
      ], { baslik: "Masaldan film şeridine", gecmeOrani: 0.75 });
    },
  },
];

dersBaslat({ adimlar, sahneKur: (kap) => kap.classList.add("tde-zemin") });
