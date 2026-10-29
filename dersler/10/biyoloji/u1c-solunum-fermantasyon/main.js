// 10. Sınıf Biyoloji · 1. Tema: Enerji — C dersi: Hücresel solunum, fermantasyon ve enerji
// BİY.10.1.7 solunum modeli · BİY.10.1.8 besin grupları · BİY.10.1.9 fermantasyon deneyi · BİY.10.1.10 enerji ve metabolizma
import { dersBaslat, sayi, el, Grafik } from "../../../../engine/ders.js";
import { yazi, yuvarlakKutu, siniflandir, sirala, izgara } from "../ortak/bilesenler.js";
import { yuzenTuval } from "../ortak/dunya3b.js";
import { anlatApi } from "../ortak/anlat3b.js";
import { solunumSahnesi } from "./sahne.js";
import {
  BASAMAKLAR, toplamUrun, atpVerimi, karbonDurumu, calisanBasamaklar, KAPILAR, BESIN_GIRIS, KCAL_G,
  kasAdim, kasBaslangic, MAYA, mayaAdim, mayaDeney, tasarimDenetle,
  YIYECEKLER, besinEnerjisi, tabakOzeti, gunlukHarcama, KARB_ARALIK, URUNLER, OLAYLAR, ATP_DAGILIM,
} from "./model.js";

const YESIL = "#5ad38b", TURUNCU = "#ffb547", MAVI = "#4fc3f7", MOR = "#b89cff", SOLUK = "#8193ad", KIRMIZI = "#ff6b6b", SARI = "#ffe066";
const geriBildirim = (ctx) => { const g = el("div", { class: "d-geri-bildirim" }); ctx.kontroller.append(g); return g; };
const yaz = (g, dogru, html) => { g.className = `d-geri-bildirim ${dogru ? "dogru" : "yanlis"}`; g.innerHTML = html; };
const yuzde = (v, o = 0) => `%${sayi(100 * v, o)}`;
const renkVer = (igne, renk) => igne.el.style.setProperty("--renk", renk);
/** Sınıflandırma bileşeninde doğru kutuya yerleşmiş kartların metinleri */
const yerlesenler = () => [...document.querySelectorAll(".bio-kutu[data-kutu] .bio-kart.dogru")].map((k) => k.textContent);

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Glikozun yolculuğu",
    cikti: "BİY.10.1.7-a",
    anlatim: `
      <p>Hücrelerin çoğu ATP'yi <b>oksijenli solunumla</b> üretir: glikoz, O₂ kullanılarak CO₂ ve suya kadar parçalanır, açığa çıkan enerjinin bir kısmı ATP'ye aktarılır.</p>
      <p class="formul">C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + enerji (ATP)</p>
      <p>Bu iş tek adımda değil, dört temel basamakta olur. Düğmelerle basamakları sırayla çalıştır; <b>karbon atomlarını</b> (siyah toplar) ve oluşan ürünleri izle.</p>`,
    gorev: "Dört basamağı da çalıştır ve bir glikozdan kaç CO₂ çıktığını bul.",
    ogretmen: "Program, hücresel solunumun temel adımlarını (glikoliz, piruvatın oksidasyonu, Krebs döngüsü, elektron taşıma sistemi) gösteren bir animasyon izletilmesini öneriyor. <b>Krebs döngüsünün ara reaksiyonlarına değinilmez; yalnızca karbon sayılarındaki değişim ve ürünlerin çıkışı verilir. ETS'de görev alan proteinlerin yapı ve isimleri ile kimyasal ozmoz verilmez</b>; süreç sonunda ATP üretildiği vurgulanır. Toplam ATP sayısı: eski kaynaklarda en fazla 38, güncel ölçümlere göre yaklaşık 30–32 (uzman kontrolü gerekli: hangi değerin kullanılacağı ders kitabına göre belirlenmeli).",
    kur(ctx) {
      const S = ctx.sahne, H = S.hucre, N = H.noktalar;
      S.git("hucre");
      H.sifirla(); ctx.temizlik(() => H.sifirla());
      H.karbonEvre(0, { anlik: true });
      let evre = 0, cevap = false;
      const A = anlatApi(S, ctx, "hucre");
      const igA = A.igne(N.zincirA, "glikoz (6C)<small>siyah toplar: karbon</small>", { renk: "#c9d4e4" });
      const igB = A.igne(N.zincirB, "", { renk: "#c9d4e4", yon: "alt" }); igB.gizle();
      A.ig = {
        a: igA, b: igB,
        sitoplazma: A.igne(N.sitoplazma, "Sitoplazma", { renk: MAVI }),
        mito: A.igne(N.mito, "Mitokondri<small>yarısı kesilmiş</small>", { renk: "#e58f6a" }),
        matriks: A.igne(N.matriks, "matriks", { renk: "#e8b0a0", yon: "alt" }),
        zar: A.igne(N.dismZar, "dış zar ve iç zar", { renk: "#e8b0a0" }),
      };
      const igK = A.igne(N.krebs, "Krebs döngüsü", { renk: TURUNCU, yon: "alt" }); igK.gizle();
      const igE = A.igne(N.ets, "Elektron taşıma sistemi<small>O₂ + e⁻ → H₂O · ATP'nin çoğu</small>", { renk: "#bfefff", yon: "sag" }); igE.gizle();
      const igC = A.igne(N.o2, "CO₂ açığa çıkar", { renk: "#c9d4e4" }); igC.gizle();
      const EVRE = ["Başlangıç", "Glikoliz", "Piruvat oksidasyonu", "Krebs döngüsü", "ETS"];
      const gs = ctx.gostergeler([
        { ad: "evre", etiket: "Basamak" },
        { ad: "atp", etiket: "ATP", ondalik: 0 }, { ad: "nadh", etiket: "NADH", ondalik: 0 },
        { ad: "fadh2", etiket: "FADH₂", ondalik: 0 }, { ad: "co2", etiket: "CO₂", ondalik: 0 }, { ad: "c", etiket: "Organik C", ondalik: 0 },
      ]);
      const dugmeler = ctx.dugmeler(BASAMAKLAR.map((b, i) => ({ metin: `▶ ${b.metin}`, ana: i === 0, tik: () => calistir(i + 1) })));
      dugmeler.forEach((b, i) => (b.disabled = i > 0));
      const g = geriBildirim(ctx);
      ctx.sayiSorusu({
        etiket: "Bir glikoz molekülü oksijenli solunumla tamamen parçalanınca kaç CO₂ açığa çıkar?",
        kontrol: (v) => { if (v === 6) { cevap = true; bitir(); return true; } return v > 6 ? "Glikozda yalnızca 6 karbon var." : "Karbon sayacına bak: kaç karbon CO₂ olarak ayrıldı?"; },
        dogruMesaj: "Doğru: glikozun 6 karbonunun hepsi CO₂ olarak ayrılır (2'si piruvat oksidasyonunda, 4'ü Krebs döngüsünde).",
      });
      function guncelle() {
        const p = toplamUrun(Math.min(evre, 3)), k = karbonDurumu(Math.min(evre, 3));
        gs.ayarla("evre", EVRE[evre]);
        gs.ayarla("atp", evre >= 4 ? `${p.atp} + ETS` : p.atp); gs.ayarla("nadh", p.nadh); gs.ayarla("fadh2", p.fadh2); gs.ayarla("co2", k.co2); gs.ayarla("c", k.organik);
      }
      /** Sahnede e. basamağın durumunu gösterir (alıştırma ve anlatım ortak kullanır) */
      function sahneEvre(e, anlik = false) {
        H.karbonEvre(e, { anlik });
        H.ayarla({ glikoliz: e >= 1, krebs: e >= 3, ets: e >= 4 ? 1 : 0, o2: e >= 4 });
        const ad = ["glikoz (6C)<small>siyah toplar: karbon</small>", "piruvat (3C)", "asetil-KoA (2C)"][e] || "";
        igA.metin(ad); igA.gizle(e > 2); igB.metin(ad); igB.gizle(!(e === 1 || e === 2));
        igK.gizle(e < 3); igE.gizle(e < 4); igC.gizle(!(e === 2 || e === 3));
      }
      function calistir(e) {
        evre = e;
        dugmeler.forEach((b, i) => { b.disabled = i !== e; b.classList.toggle("ana", i === e); if (i < e) b.classList.add("bio-yapildi"); });
        sahneEvre(e);
        const B = BASAMAKLAR[e - 1];
        const ek = e === 4
          ? `NADH ve FADH₂'nin taşıdığı elektronlar iç zardaki sistemden geçerek <b>O₂</b>'ye ulaşır, su oluşur ve <b>ATP'nin çoğu</b> burada üretilir. Bir glikozdan toplam en fazla <b>${atpVerimi("klasik")} ATP</b> (eski hesap), güncel ölçümlere göre yaklaşık <b>30–32 ATP</b> elde edilir.`
          : `${B.karbon}. ${B.atp ? `${B.atp} ATP, ` : ""}${B.nadh} NADH${B.fadh2 ? `, ${B.fadh2} FADH₂` : ""} oluştu.${e === 1 ? " Glikoliz O₂ gerektirmez; net 2 ATP kazanılır." : ""}`;
        yaz(g, true, `<b>${B.metin}</b> (${B.yer}): ${ek}`);
        guncelle(); bitir();
      }
      function bitir() { if (evre >= 4 && cevap && !ctx.gorevTamamMi()) ctx.gorevTamam(); }
      guncelle();
      return Object.assign(A, { sahneEvre, yakin: (ad, u, dy) => A.odak(N[ad], u, 1.3, dy) });
    },
    anlat: [
      { s: "Bir hücrenin içindeyiz. Yediğin ekmekten gelen <b>glikoz</b> buraya kadar ulaştı.", yap: (api) => { api.sahneEvre(0, true); api.vurgula(api.ig.a); api.yakin("zincirA", 6); } },
      { s: "Siyah toplar glikozun <b>6 karbon</b> atomu. Yolculuk boyunca onları izleyeceğiz." },
      { s: "Hücre glikozdaki enerjiyi doğrudan kullanamaz. Önce onu <b>ATP</b>'ye aktarması gerekir.", yap: (api) => api.don() },
      { s: "Glikoz adım adım parçalanır, açığa çıkan enerji ATP'ye geçer. Buna <b>hücresel solunum</b> diyoruz." },
      { soru: "Hücre iş yaparken enerjiyi doğrudan hangisinden alır?", secenekler: ["Glikozdan", "ATP'den", "O₂'den"], dogru: 1,
        aciklama: "Glikozun enerjisi önce ATP'ye aktarılır; hücre işlerini ATP ile yapar.", ipucu: "Hücrenin şarj edilebilir pilini hatırla." },
      { s: "İlk basamak <b>sitoplazmada</b> olur: glikoz ikiye bölünür. Buna <b>glikoliz</b> diyoruz.", yap: (api) => { api.sahneEvre(1); api.vurgula(api.ig.sitoplazma, api.ig.a, api.ig.b); } },
      { s: "Oluşan iki parçanın adı <b>piruvat</b>. Bu sırada biraz ATP de kazanılır." },
      { soru: "6 karbonlu glikoz iki eşit parçaya bölündü. Her piruvatta kaç karbon var?", secenekler: ["2", "3", "6"], dogru: 1,
        aciklama: "6 karbon ikiye bölününce her parçada 3 karbon kalır.", ipucu: "Siyah topları say ve ikiye böl." },
      { s: "Piruvatlar şimdi <b>mitokondriye</b> girecek. Mitokondri, hücrenin enerji santralidir.", yap: (api) => { api.vurgula(api.ig.mito); api.yakin("mito", 9, -0.6); } },
      { s: "Mitokondrinin iki zarı ve içinde <b>matriks</b> denen bir sıvısı var. Kalan basamaklar burada olur.", yap: (api) => api.vurgula(api.ig.matriks, api.ig.zar) },
      { s: "Sıra sende: basamakları sırayla çalıştır. Karbonların nereye gittiğini sayaçtan izle.", yap: (api) => api.don() },
    ],
    anlatBitti: (api) => { api.sahneEvre(0, true); api.don(); },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Modelini kanıtlarla sına",
    cikti: "BİY.10.1.7-b",
    anlatim: `
      <p>Şimdi kendi modelini kur: oksijenli solunumun olaylarını <b>doğru sıraya</b> diz. Sonra modelini iki deneysel kanıtla karşılaştır; kanıta uymayan bir düşüncen varsa modelini yeniden yapılandır.</p>
      <p>Sahnede <b>O₂'yi kes</b> düğmesiyle hangi basamakların durduğunu da inceleyebilirsin.</p>`,
    gorev: "Olayları doğru sırala ve iki kanıt sorusunu doğru cevapla.",
    ogretmen: "Program, grupların oluşturdukları modelleri bilimsel modellerle ve diğer grupların modelleriyle karşılaştırmasını, genel kabul görmüş modele en yakın modele karar vermesini istiyor. Sıralama etkinliğini önce gruplara kâğıt üzerinde yaptırıp sonra burada sınamalarını önerebilirsiniz. Kanıt 2, “Krebs döngüsü O₂ kullanmadığına göre oksijensiz ortamda da çalışır” yanılgısını hedefler.",
    kur(ctx) {
      const S = ctx.sahne, H = S.hucre, N = H.noktalar;
      S.git("hucre");
      H.sifirla(); ctx.temizlik(() => H.sifirla());
      let o2 = true, sirali = false;
      const kanit = [false, false];
      const YERI = { glikoliz: [N.kGlikoliz, "ust"], piruvat: [N.kAsetil, "alt"], krebs: [N.krebs, "alt"], ets: [N.ets, "sag"] };
      const A = anlatApi(S, ctx, "hucre");
      const igler = BASAMAKLAR.map((b) => [b, A.igne(YERI[b.ad][0], "", { renk: YESIL, yon: YERI[b.ad][1] })]);
      const igO = A.igne(N.o2, "", { renk: MAVI });
      const igN = A.igne(N.dismZar, "", { renk: TURUNCU });
      A.ig = { basamak: igler.map(([, ig]) => ig), o2: igO, nad: igN };
      function goster() {
        const calisan = calisanBasamaklar(o2);
        H.ayarla({ glikoliz: true, krebs: true, krebsDon: o2, o2, ets: o2 ? 1 : 0, co2Surekli: o2 });
        for (const [b, ig] of igler) {
          const on = calisan.includes(b.ad);
          renkVer(ig, on ? YESIL : KIRMIZI);
          ig.metin(`${b.metin}<small>${on ? (b.ad === "glikoliz" && !o2 ? "sürer, ancak NAD⁺ fermantasyonla yenilenirse" : "çalışıyor") : "DURDU"}</small>`);
        }
        igO.metin(o2 ? "O₂ var<small>ETS'nin son elektron alıcısı</small>" : "O₂ yok!"); renkVer(igO, o2 ? MAVI : KIRMIZI);
        igN.metin(o2 ? "ETS, NADH ve FADH₂'yi geri dönüştürür<small>NAD⁺ ve FAD yeniden kullanılır</small>" : "NAD⁺ ve FAD yenilenemiyor<small>Krebs ve piruvat oksidasyonu durur</small>");
        renkVer(igN, o2 ? TURUNCU : KIRMIZI);
      }
      goster();
      const [o2Btn] = ctx.dugmeler([{ metin: "O₂'yi kes", tik: () => { o2 = !o2; o2Btn.textContent = o2 ? "O₂'yi kes" : "O₂'yi geri ver"; goster(); } }]);
      const kap = el("div"); ctx.kontroller.append(kap);
      sirala(kap, {
        ogeler: [
          "Glikoz sitoplazmada iki piruvata ayrılır.",
          "Piruvat mitokondriye girer; CO₂ ayrılır, asetil-KoA oluşur.",
          "Asetil-KoA Krebs döngüsüne girer; kalan karbonlar CO₂ olarak ayrılır.",
          "NADH ve FADH₂, elektronlarını iç zardaki elektron taşıma sistemine verir.",
          "Elektronlar O₂'ye aktarılır, su oluşur; ATP'nin çoğu bu sırada üretilir.",
        ],
        ipucu: "Karbon zincirinin kısalma sırasını düşün: 6C → 3C → 2C → CO₂.",
        tamam: () => { sirali = true; bitir(); },
      });
      ctx.secenekler({
        etiket: "<b>Kanıt 1:</b> Mitokondrileri ayrılmış hücre özütüne glikoz verilince piruvat oluşuyor ama CO₂ çıkmıyor. Bu kanıt neyi destekler?",
        liste: [
          { deger: 0, metin: "Glikoliz sitoplazmada olur; CO₂ mitokondride açığa çıkar." },
          { deger: 1, metin: "Glikoliz mitokondride olur." },
          { deger: 2, metin: "CO₂ glikolizde açığa çıkar." },
        ],
        deger: null, degisti: (v) => { kanit[0] = v === 0; yaz(k1, kanit[0], kanit[0] ? "Doğru. Glikoliz için mitokondri gerekmez; karbonların CO₂ olarak ayrılması mitokondride olur." : "Modelin bu kanıtla çelişiyor: mitokondri yokken de piruvat oluşuyor, ama CO₂ oluşmuyor."); bitir(); },
      });
      const k1 = geriBildirim(ctx);
      ctx.secenekler({
        etiket: "<b>Kanıt 2:</b> O₂ kesilince Krebs döngüsü de birkaç saniyede duruyor; oysa Krebs döngüsünde O₂ doğrudan kullanılmaz. Neden?",
        liste: [
          { deger: 0, metin: "Krebs döngüsü aslında O₂ ile karbonu yakar." },
          { deger: 1, metin: "ETS durunca NADH ve FADH₂ geri dönüştürülemez; Krebs döngüsü NAD⁺ ve FAD olmadan dönemez." },
          { deger: 2, metin: "O₂ yokken glikoz hücreye giremez." },
        ],
        deger: null, degisti: (v) => { kanit[1] = v === 1; yaz(k2, kanit[1], kanit[1] ? "Doğru. Basamaklar birbirine bağlıdır: ETS'nin durması, Krebs döngüsünün ihtiyaç duyduğu NAD⁺ ve FAD'nin tükenmesine yol açar. Sahnede O₂'yi keserek bunu görebilirsin." : "Sahnede O₂'yi kes ve mitokondrinin üstündeki NAD⁺ etiketine bak: Krebs döngüsünün ürettiği NADH'ye ne oluyor?"); bitir(); },
      });
      const k2 = geriBildirim(ctx);
      function bitir() { if (sirali && kanit[0] && kanit[1] && !ctx.gorevTamamMi()) ctx.gorevTamam(); }
      return A;
    },
    anlat: [
      { s: "Önceki adımda dört basamağı tek tek çalıştırdın. Şimdi hepsi <b>birlikte</b> çalışıyor.", yap: (api) => { api.vurgula(api.ig.basamak); api.bak(); } },
      { formul: [["C₆H₁₂O₆", "glikoz"], ["+"], ["6 O₂", "oksijen"], ["→"], ["6 CO₂", "karbondioksit"], ["+"], ["6 H₂O", "su"], ["+"], ["ATP", "enerji"]],
        s: "Bütün solunumu tek satırda özetleyebiliriz.", oku: "glikoz artı altı oksijen, altı karbondioksit, altı su ve ATP verir.", yap: (api) => api.vurgula() },
      { s: "Okun solu <b>girenler</b>, sağı <b>çıkanlar</b>. Glikozun 6 karbonu 6 CO₂ olarak çıkar." },
      { soru: "Bu formüle göre solunumda hangisi <b>kullanılır</b>?", secenekler: ["CO₂", "O₂", "H₂O"], dogru: 1,
        aciklama: "O₂ okun solunda, yani kullanılanlar arasında. CO₂ ve su ise ürün.", ipucu: "Okun solunda ne var?" },
      { s: "O₂ en son basamakta, <b>elektron taşıma sisteminde</b> elektronları alır ve suya dönüşür.", yap: (api) => api.vurgula(api.ig.basamak[3], api.ig.o2) },
      { s: "<b>NADH</b> ve <b>FADH₂</b> elektron taşıyan araçlardır. Elektronu bırakınca boşalıp geri dönerler.", yap: (api) => api.vurgula(api.ig.nad) },
      { s: "Bilimsel bir model <b>kanıtla</b> sınanır. Kanıta uymayan model düzeltilir.", yap: (api) => api.vurgula() },
      { s: "Basamaklar bir fabrika bandı gibi bağlıdır: birinin ürünü, diğerinin hammaddesidir." },
      { soru: "Bir bantta son işçi durursa ne olur?", secenekler: ["Yalnızca o işçi durur", "Ürünler birikir, bant zamanla tümüyle durur", "Bant hızlanır"], dogru: 1,
        aciklama: "Son işçinin işleyemediği ürünler birikir; öndekiler de bir süre sonra çalışamaz.", ipucu: "Ürünleri alacak kimse kalmazsa ne olur?" },
      { baslik: "Birlikte yapalım: bir kanıtı yorumla", cozum: [
        "Kanıt: Alyuvarlarda mitokondri yoktur.",
        "Yine de alyuvarlar glikozdan ATP üretir.",
        "Demek ki ATP'nin bir kısmı mitokondri dışında üretilebilir.",
        "Bu, glikolizin <b>sitoplazmada</b> olduğu modelimizi destekler.",
      ] },
      { s: "Sıra sende: olayları sırala, sonra iki kanıtı modelinle karşılaştır." },
    ],
    anlatBitti: (api) => api.don(),
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Besinler hangi kapıdan girer?",
    cikti: "BİY.10.1.8-a",
    anlatim: `
      <p>Hücreler yalnızca glikozdan değil, <b>yağlardan</b> ve <b>proteinlerden</b> de enerji elde edebilir. Ama her besin solunuma aynı basamaktan katılmaz.</p>
      <p>Düşün: Bir besinin hangi basamaktan gireceği, karbon sayısına bağlı mı? Her besin Krebs döngüsüne girer mi?</p>
      <p>Kartları, besinin hücresel solunuma katıldığı <b>kapıya</b> yerleştir. Doğru yerleşen besinler sahnede yollarını gösterecek.</p>`,
    gorev: "Altı besin kartının hepsini doğru kapıya yerleştir.",
    ogretmen: "Program, “Besinlerin oksijenli solunumun hangi basamağında tepkimeye gireceği, içeriğindeki organik bileşiğin karbon sayısına bağlı mıdır?”, “Hücresel solunumda kullanılan her besin Krebs döngüsüne girer mi?” sorularıyla bilgi ihtiyacının fark ettirilmesini öneriyor. <b>Yağ asitlerinin oksidasyonu (alfa, beta, omega), amino asitlerin transdeaminasyonu ve farklı monosakkaritlerin glikolize girişi verilmez.</b> Bu nedenle kartlarda yalnızca “iki karbonlu parçalara ayrılır” ve “NH₃ ayrılır” ifadeleri kullanıldı.",
    kur(ctx) {
      const S = ctx.sahne, H = S.hucre, N = H.noktalar;
      S.git("hucre", "besin");
      H.sifirla(); ctx.temizlik(() => H.sifirla());
      H.ayarla({ glikoliz: true, krebs: true, o2: true, ets: 1, co2Surekli: true });
      const RENK = { karbonhidrat: SARI, yag: TURUNCU, protein: "#ff8a8a" };
      const AKIS = { "Glikoz": "glikoz", "Nişasta (sindirilince)": "nisasta", "Glikojen (depodan)": "glikojen", "Gliserol": "gliserol", "Yağ asidi": "yagAsidi", "Amino asit (NH₃ ayrıldıktan sonra)": "aminoAsit" };
      const A = anlatApi(S, ctx, ["hucre", "besin"]);
      const kapilar = [
        A.igne(N.kGlikoliz, "Glikolizin başı", { renk: MAVI }),
        A.igne(N.kAra, "glikolizin ara basamağı", { renk: MAVI }),
        A.igne(N.kPiruvat, "piruvat", { renk: "#cfd8e6", yon: "alt" }),
        A.igne(N.kAsetil, "asetil-KoA", { renk: "#cfd8e6", yon: "alt" }),
        A.igne(N.krebs, "Krebs", { renk: TURUNCU, yon: "alt" }),
      ];
      A.igne(N.ets, "ETS → ATP", { renk: SARI, yon: "sag" });
      const kaynak = [
        [N.glikoz, "glikoz", ["Glikoz"], "karbonhidrat"], [N.nisasta, "nişasta zinciri", ["Nişasta (sindirilince)"], "karbonhidrat"],
        [N.glikojen, "glikojen granülü", ["Glikojen (depodan)"], "karbonhidrat"],
        [N.yag, "yağ damlası<small>gliserol + yağ asitleri</small>", ["Gliserol", "Yağ asidi"], "yag"],
        [N.protein, "protein<small>amino asitlerden oluşur</small>", ["Amino asit (NH₃ ayrıldıktan sonra)"], "protein"],
      ].map(([n, m, adlar, grup]) => ({ ig: A.igne(n, m, { renk: SOLUK, yon: "alt" }), adlar, grup }));
      const igNH3 = A.igne(N.nh3, "NH₃ ayrılır", { renk: "#7fc8ff", yon: "sag" }); igNH3.gizle();
      A.ig = { kapilar, kaynak: kaynak.map((k) => k.ig), glikoz: kaynak[0].ig, protein: kaynak[4].ig };
      let son = null;
      S.adimKare(ctx, () => {
        const t = yerlesenler(), a = t.join("|");
        if (a === son) return;
        son = a;
        for (const [ad, ak] of Object.entries(AKIS)) H.akisAc(ak, t.includes(ad));
        for (const k of kaynak) renkVer(k.ig, k.adlar.some((x) => t.includes(x)) ? RENK[k.grup] : SOLUK);
        igNH3.gizle(!t.includes("Amino asit (NH₃ ayrıldıktan sonra)"));
      });
      const kap = el("div"); ctx.kontroller.append(kap);
      siniflandir(kap, {
        kutular: KAPILAR, sutun: 2,
        ogeler: BESIN_GIRIS.map((b) => ({ metin: b.ad, dogru: b.kapi, neden: b.neden })),
        tamam: () => { ctx.gorevTamam(); ctx.not("<p><b>Çıkarım:</b> Giriş noktası karbon sayısıyla ilişkilidir: 6 karbonlu glikoz glikolizin başından, 3 karbonlu gliserol glikolizin ortasından, iki karbonlu parçalara ayrılan yağ asitleri asetil-KoA olarak girer. Hangi kapıdan girerse girsin, karbonlar sonunda Krebs döngüsünde CO₂'ye dönüşür ve elektronlar ETS'ye taşınır.</p>"); },
      });
      return Object.assign(A, {
        akis: (ad, acik) => H.akisAc(ad, acik),
        /** Gösterimden sonra akışları yerleşen kartlara göre yeniden kur */
        yenile: () => { H.akisAc("glikoz", false); son = null; },
      });
    },
    anlat: [
      { s: "Hücre yalnızca glikoz kullanmaz. <b>Yağ</b> ve <b>protein</b> de enerji kaynağıdır.", yap: (api) => { api.vurgula(api.ig.kaynak); api.bak(); } },
      { s: "Önde besin kaynakları var: glikoz, nişasta, glikojen, yağ damlası ve protein." },
      { s: "Solunum yolunun farklı yerlerinde <b>kapılar</b> var. Her besin kendine uyan kapıdan girer.", yap: (api) => api.vurgula(api.ig.kapilar) },
      { s: "Kapıyı bulmanın ipucu: besin parçalanınca kaç <b>karbonlu</b> parçalar oluşuyor?" },
      { baslik: "Birlikte yapalım: glikoz", cozum: [
        "Glikoz 6 karbonlu bir şekerdir.",
        "Glikoliz de 6 karbonlu glikozla başlar.",
        "O hâlde glikoz <b>glikolizin başından</b> girer. Sarı yolu izle.",
      ], yap: (api) => { api.akis("glikoz", true); api.vurgula(api.ig.glikoz, api.ig.kapilar[0]); } },
      { soru: "1. adımı hatırla: asetil-KoA kaç karbonludur?", secenekler: ["2", "3", "6"], dogru: 0,
        aciklama: "Piruvat (3C) bir CO₂ kaybedince 2 karbonlu asetil-KoA oluşur.", ipucu: "3 karbonlu piruvattan bir CO₂ ayrılıyordu." },
      { s: "Proteinler önce <b>amino asitlere</b> ayrılır. Amino asitte karbonun yanında <b>azot</b> da vardır.", yap: (api) => { api.akis("glikoz", false); api.vurgula(api.ig.protein); } },
      { s: "Azotlu kısım <b>NH₃</b> olarak ayrılır; geri kalan karbon iskeleti solunuma katılır." },
      { soru: "Hangi besin grubunda azot bulunur?", secenekler: ["Karbonhidrat", "Yağ", "Protein"], dogru: 2,
        aciklama: "Amino asitlerde azot vardır; karbonhidrat ve yağlarda yoktur.", ipucu: "Hangisi amino asitlerden yapılır?" },
      { s: "Sıra sende: kartları doğru kapıya yerleştir. Doğru yerleşen besin, yolunu sahnede gösterecek.", yap: (api) => api.don() },
    ],
    anlatBitti: (api) => { api.yenile(); api.don(); },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Benzerlikler ve farklılıklar",
    cikti: "BİY.10.1.8-b, c",
    anlatim: `
      <p>Karbonhidrat, yağ ve proteinden enerji eldesini karşılaştırma zamanı. Önce <b>yapılandırılmış ızgarayı</b> doldur, sonra ifadeleri <b>benzerlik</b> ya da <b>farklılık</b> olarak ayır.</p>
      <p>Mutfak tezgâhındaki örnekler ve sahnenin üstündeki grafik, her besin grubunun 1 gramından açığa çıkan yaklaşık enerjiyi gösteriyor.</p>`,
    gorev: "Izgaradaki 15 hücreyi doğru doldur ve altı ifadeyi sınıflandır.",
    ogretmen: "Program, farklı besin gruplarından enerji eldesine ilişkin benzerlik ve farklılıkların listelenmesi için yapılandırılmış grid kullanılmasını ve gridin puanlama anahtarıyla puanlanmasını öneriyor. Öğrencilerden benzerlik/farklılık listesini web araçlarıyla bir sunuma dönüştürmeleri istenebilir. Proteinlerin enerji kaynağı olarak “son tercih” olması genellemedir; açlıkta ve uzun süreli egzersizde protein yıkımı artar.",
    kur(ctx) {
      const S = ctx.sahne, N = S.mutfak.noktalar.kalori;
      S.git("mutfak", "kalori");
      let izgaraTamam = false, listeTamam = false;
      const A = anlatApi(S, ctx, ["mutfak", "kalori"]);
      A.ig = {
        k: A.igne(N.karbonhidrat, `Karbonhidrat (şeker)<small>1 g ≈ ${KCAL_G.karbonhidrat} kcal</small>`, { renk: SARI }),
        y: A.igne(N.yag, `Yağ (zeytinyağı)<small>1 g ≈ ${KCAL_G.yag} kcal</small>`, { renk: TURUNCU, yon: "alt" }),
        p: A.igne(N.protein, `Protein (tavuk eti)<small>1 g ≈ ${KCAL_G.protein} kcal</small>`, { renk: "#ff8a8a" }),
      };
      yuzenTuval(ctx, {
        gen: 560, yuk: 230, konum: "ust", genislik: "min(420px, 92%)",
        ciz(c) {
          yazi(c, "1 gramdan açığa çıkan yaklaşık enerji", 280, 20, { boyut: 17, kalin: true });
          [["Karbonhidrat", KCAL_G.karbonhidrat, SARI], ["Protein", KCAL_G.protein, "#ff8a8a"], ["Yağ", KCAL_G.yag, TURUNCU]].forEach(([ad, v, r], i) => {
            const x = 70 + i * 160, h = v * 15;
            yuvarlakKutu(c, x, 190 - h, 110, h, 8, { dolgu: r });
            yazi(c, `${v} kcal`, x + 55, 178 - h, { boyut: 17, kalin: true, renk: r });
            yazi(c, ad, x + 55, 208, { boyut: 15, kalin: true });
          });
          c.strokeStyle = "#4a5568"; c.lineWidth = 2; c.beginPath(); c.moveTo(40, 190); c.lineTo(520, 190); c.stroke();
        },
      });
      ctx.not("<p>Yağlar gram başına iki kattan fazla enerji verir; bu yüzden uzun süreli enerji deposudur.</p>");
      const k1 = el("div"); ctx.kontroller.append(k1);
      izgara(k1, {
        satirlar: [{ ad: "Karbonhidrat", dogru: [0, 0, 1, 0, 0] }, { ad: "Yağ", dogru: [1, 0, 1, 1, 1] }, { ad: "Protein", dogru: [2, 0, 0, 0, 2] }],
        sutunlar: [
          { baslik: "Solunuma giriş", secenekler: ["Glikoliz", "Glikoliz (gliserol) + asetil-KoA (yağ asidi)", "Türüne göre farklı basamaklar"] },
          { baslik: "Krebs ve ETS'yi kullanır mı?", secenekler: ["Evet", "Hayır"] },
          { baslik: "Azotlu atık (NH₃) oluşur mu?", secenekler: ["Evet", "Hayır"] },
          { baslik: "1 g'dan enerji", secenekler: ["≈ 4 kcal", "≈ 9 kcal"] },
          { baslik: "Vücutta öncelikli rolü", secenekler: ["Hızlı enerji kaynağı", "Uzun süreli enerji deposu", "Yapı ve onarım; enerji için son tercih"] },
        ],
        tamam: () => { izgaraTamam = true; bitir(); },
      });
      const k2 = el("div"); ctx.kontroller.append(k2);
      siniflandir(k2, {
        kutular: [{ ad: "b", baslik: "Benzerlik" }, { ad: "f", baslik: "Farklılık" }], sutun: 2,
        ogeler: [
          { metin: "Üçünün de karbonları sonunda CO₂'ye dönüşür.", dogru: "b", neden: "Hangi kapıdan girerse girsin, karbon iskeleti Krebs döngüsünde CO₂'ye kadar yıkılır." },
          { metin: "Üçünden elde edilen enerji ATP'ye aktarılır.", dogru: "b", neden: "Hücre her besinden aldığı enerjiyi ATP olarak kullanır." },
          { metin: "Üçü de Krebs döngüsü ve ETS'yi kullanır.", dogru: "b", neden: "Ortak son yol Krebs döngüsü ve ETS'dir." },
          { metin: "Yalnızca proteinlerden azotlu atık oluşur.", dogru: "f", neden: "Karbonhidrat ve yağlarda azot yoktur; amino asitlerden NH₃ ayrılır." },
          { metin: "Yağlar gram başına en çok enerjiyi verir.", dogru: "f", neden: "Yağ ≈ 9 kcal/g, karbonhidrat ve protein ≈ 4 kcal/g." },
          { metin: "Yağ asitleri glikoliz basamağını kullanmaz.", dogru: "f", neden: "Yağ asitleri doğrudan asetil-KoA olarak katılır." },
        ],
        tamam: () => { listeTamam = true; bitir(); },
      });
      function bitir() { if (izgaraTamam && listeTamam && !ctx.gorevTamamMi()) ctx.gorevTamam(); }
      return A;
    },
    anlat: [
      { s: "Tezgâhta üç örnek var: <b>1 g şeker</b>, <b>1 g zeytinyağı</b> ve <b>1 g tavuk eti</b>.", yap: (api) => { api.vurgula(api.ig.k, api.ig.y, api.ig.p); api.bak(); } },
      { s: "Şeker bir <b>karbonhidrattır</b>. Zeytinyağı <b>yağdır</b>. Tavuk eti çoğunlukla <b>proteindir</b>." },
      { s: "Besindeki enerjiyi <b>kilokalori (kcal)</b> ile ölçeriz. Üstteki grafik, her birinin 1 gramındaki enerjiyi gösteriyor.", yap: (api) => { api.vurgula(); api.grafik(); } },
      { soru: "Grafiğe göre hangisinin 1 gramı en çok enerji verir?", secenekler: ["Şeker", "Zeytinyağı", "Tavuk eti"], dogru: 1,
        aciklama: "Yağın 1 gramı yaklaşık 9 kcal verir; şeker ve protein yaklaşık 4 kcal.", ipucu: "Grafikteki en uzun çubuğa bak.", yap: (api) => api.vurgula(api.ig.y) },
      { formul: [["enerji", "kcal"], ["="], ["kütle", "gram"], ["×"], ["kcal/g", "1 gramın enerjisi"]],
        s: "Bir besinin enerjisini kütlesiyle hesaplayabiliriz.", oku: "enerji eşittir kütle çarpı bir gramın enerjisi", yap: (api) => api.vurgula() },
      { baslik: "Birlikte yapalım", cozum: [
        "20 g bal (karbonhidrat): 20 × 4 = <b>80 kcal</b>",
        "10 g tereyağı (yağ): 10 × 9 = <b>90 kcal</b>",
        "Yarı kütledeki yağ, daha çok enerji verdi!",
      ] },
      { s: "Benzerliği de hatırla: üç besin de sonunda aynı yola girer ve enerjisi <b>ATP</b>'ye aktarılır." },
      { soru: "3. adımı hatırla: glikoz ve yağ asitlerinin karbonları sonunda hangi döngüde buluşur?", secenekler: ["Krebs döngüsü", "Glikoliz", "Hiçbirinde"], dogru: 0,
        aciklama: "Hangi kapıdan girerse girsin karbonlar Krebs döngüsünde CO₂'ye dönüşür.", ipucu: "Asetil-KoA hangi döngüye giriyordu?" },
      { s: "Sıra sende: önce ızgarayı doldur, sonra ifadeleri benzerlik ya da farklılık olarak ayır." },
    ],
    anlatBitti: (api) => api.don(),
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Oksijen yetmezse: fermantasyon",
    cikti: "BİY.10.1.9-a",
    anlatim: `
      <p>Hızlı koşarken kas hücrelerinin ATP ihtiyacı, kanın getirebildiği O₂'nin karşılayabileceğinden fazla olabilir. O zaman kas hücresi glikozu <b>oksijensiz</b> yıkar: <b>laktik asit fermantasyonu</b>.</p>
      <p class="formul">glikoz → 2 laktik asit + 2 ATP</p>
      <p>Fermantasyonda glikoz tam parçalanmaz; enerjinin çoğu laktik asitte kalır. Mayalar ve bazı bakteriler ise <b>etil alkol fermantasyonu</b> yapar: glikoz → 2 etil alkol + 2 CO₂ + 2 ATP.</p>
      <p>Koşu şiddetini seç ve 60 saniyelik bir koşu yap. Grafikte ATP'nin nereden geldiğini izle.</p>`,
    gorev: "Biri <b>%90'ın altında</b>, biri <b>%150'nin üstünde</b> iki koşu yap ve fermantasyonun ATP verimini bul.",
    ogretmen: "Program, “Ekmeğin mayalanması, peynir ve yoğurt üretimi nasıl gerçekleşir?”, “Fermantasyon sürecini etkileyen faktörler nelerdir?” sorularıyla dikkat çekilmesini ve bilgilerin enerji eldesi açısından yapılandırılarak deney tasarımına hazırlanmasını öneriyor. Bu adım, sonraki adımdaki maya deneyinin bilgi temelini oluşturur. Dikkat: Kas yorgunluğunun tek nedeni laktik asit değildir (H⁺ birikimi, fosfat, iyon dengesi gibi etkenler de rol oynar); ertesi gün hissedilen kas ağrısı ise laktik asitten değil kas liflerindeki küçük hasarlardan kaynaklanır. Laktat, egzersizden sonra büyük ölçüde yeniden kullanılır. Modelde egzersiz başındaki oksijen açığının tamamı fermantasyonla karşılanıyor; gerçekte kastaki kreatin fosfat ve O₂ depoları da kullanılır (uzman kontrolü gerekli).",
    kur(ctx) {
      const S = ctx.sahne, KS = S.kas, N = KS.noktalar;
      S.git("kas");
      let I = 0.8, d = kasBaslangic(), kosuyor = false, cevap = false, atpO = 0, atpF = 0;
      const kosular = [];
      const [gr] = ctx.grafikler([{ baslik: "ATP kaynağı (göreli)", x: { etiket: "s", min: 0, max: 60 }, y: { etiket: "ATP/s", min: 0, max: 2.2 } }]);
      const sO = gr.seri("oksijenli", { renk: MAVI, kalinlik: 3 }), sF = gr.seri("fermantasyon", { renk: KIRMIZI, kalinlik: 3 });
      const A = anlatApi(S, ctx, "kas");
      const igL = A.igne(N.laktat, "laktik asit birikiyor", { renk: "#ff9aa8", yon: "alt" }); igL.gizle();
      A.ig = {
        kilcal: A.igne(N.kilcal, "kılcal damar<small>alyuvarlar O₂ getirir; glikoz da kanla gelir</small>", { renk: KIRMIZI }),
        lif: A.igne(N.lif, "kas hücresi (lif)<small>büyütülmüş, boyuna kesilmiş</small>", { renk: "#f2b8b8" }),
        mito: A.igne(N.mito, "mitokondriler<small>oksijenli solunum yapar</small>", { renk: TURUNCU, yon: "sag" }),
        laktat: igL,
      };
      // anlatım sırasında sahnenin gösterdiği temsilî durum (null: simülasyon)
      let gosterim = null;
      const sifirKas = () => KS.ayarla({ oks: 0, ferm: 0, laktat: 0, kosuyor: false });
      sifirKas(); ctx.temizlik(() => { kosuyor = false; sifirKas(); });
      const gs = ctx.gostergeler([
        { ad: "t", etiket: "Süre", ondalik: 0, birim: "s" }, { ad: "g", etiket: "Glikoz (göreli)", ondalik: 1 },
        { ad: "l", etiket: "Laktik asit", ondalik: 1 }, { ad: "f", etiket: "Fermantasyon" },
      ]);
      ctx.not(`<p><span style="color:${MAVI}">━━</span> oksijenli solunum &nbsp; <span style="color:${KIRMIZI}">━━</span> fermantasyon (grafik)</p>`);
      let son = performance.now(), son0 = null;
      S.adimKare(ctx, () => {
        const simdi = performance.now(); son0 = son; son = simdi;
        if (gosterim) { KS.ayarla(gosterim); igL.gizle(gosterim.laktat < 1.5); return; }
        if (kosuyor) {
          // simülasyon gerçek zamanın 10 katı hızda (60 s'lik koşu ~6 s); yavaş makinede kare seyrekleşse de hız aynı kalır
          const h = Math.min(1, (simdi - (son0 ?? simdi)) / 1000) * 10, n = Math.max(1, Math.ceil(h / 0.1)), adim = h / n;
          for (let i = 0; i < n; i++) {
            d = kasAdim(d, I, adim); atpO += d.oksijenli * adim; atpF += d.fermantasyon * adim;
            if (Math.round(d.t * 10) % 5 === 0) { sO.ekle(d.t, d.oksijenli); sF.ekle(d.t, d.fermantasyon); }
            if (d.t >= 60) { kosuyor = false; bitirKosu(); break; }
          }
        }
        const fOran = d.oksijenli + d.fermantasyon > 0 ? d.fermantasyon / (d.oksijenli + d.fermantasyon) : 0;
        KS.ayarla({ oks: d.oksijenli, ferm: d.fermantasyon, laktat: d.laktat, kosuyor });
        gs.ayarla("t", d.t); gs.ayarla("g", d.glikoz); gs.ayarla("l", d.laktat); gs.ayarla("f", yuzde(fOran));
        igL.gizle(d.laktat < 1.5);
      });
      ctx.kaydirici({ etiket: "Koşu şiddeti (aerobik kapasitenin %)", min: 40, max: 200, adim: 10, deger: 80, birim: "%", degisti: (v) => (I = v / 100) });
      const [kBtn] = ctx.dugmeler([{ metin: "▶ 60 saniye koş", ana: true, tik: () => {
        if (kosuyor) return;
        d = kasBaslangic(); atpO = atpF = 0; sO.temizle(); sF.temizle(); kosuyor = true; kBtn.disabled = true;
      } }]);
      const tablo = ctx.tablo(["Şiddet", "Glikoz (göreli)", "Laktik asit", "Fermantasyon payı"]);
      const g = geriBildirim(ctx);
      ctx.sayiSorusu({
        etiket: "Laktik asit fermantasyonunda bir glikozdan <b>net</b> kaç ATP kazanılır?",
        kontrol: (v) => { if (v === 2) { cevap = true; bitir(); return true; } return "Fermantasyonda yalnızca glikoliz çalışır. Glikolizin net kazancı neydi?"; },
        dogruMesaj: "Doğru: net 2 ATP. Oksijenli solunumun yaklaşık 30–38 ATP'sine göre çok azdır; bu yüzden aynı ATP için çok daha fazla glikoz harcanır.",
      });
      function bitirKosu() {
        kBtn.disabled = false;
        const f = atpF / (atpO + atpF || 1);
        kosular.push({ I, f });
        tablo.satirEkle([yuzde(I), sayi(d.glikoz, 1), sayi(d.laktat, 1), yuzde(f)]);
        const m = I > 1
          ? `Şiddet kapasiteyi aştı: ihtiyacın bir kısmı sürekli <b>fermantasyonla</b> karşılandı, laktik asit birikti ve glikoz çok hızlı tükendi.`
          : `Şiddet kapasitenin altında: yalnızca koşunun <b>ilk saniyelerinde</b> O₂ alımı yetişemediği için fermantasyon oldu, sonra oksijenli solunum işi devraldı.`;
        yaz(g, true, m);
        bitir();
      }
      function bitir() {
        if (ctx.gorevTamamMi()) return;
        if (cevap && kosular.some((k) => k.I < 0.9) && kosular.some((k) => k.I > 1.5)) {
          ctx.gorevTamam();
          g.innerHTML += " <br><b>Karşılaştırma:</b> Yüksek şiddette aynı sürede çok daha fazla glikoz harcandı. Fermantasyon hızlı ama verimsiz bir ATP kaynağıdır.";
        }
      }
      return Object.assign(A, { goster: (d) => (gosterim = d && { oks: 0, ferm: 0, laktat: 0, kosuyor: false, ...d }) });
    },
    anlat: [
      { s: "Bir bacak kasının içindeyiz. Bu kalın lif tek bir <b>kas hücresi</b>.", yap: (api) => { api.goster({ oks: 0.6 }); api.vurgula(api.ig.lif); api.bak(); } },
      { s: "Kas ATP'sinin çoğunu <b>mitokondrilerde</b>, oksijenli solunumla üretir.", yap: (api) => api.vurgula(api.ig.mito) },
      { s: "Gereken O₂'yi kılcal damardaki <b>alyuvarlar</b> getirir.", yap: (api) => api.vurgula(api.ig.kilcal) },
      { s: "Şimdi hızlı koşmaya başladın! Kasın ATP ihtiyacı birden arttı.", yap: (api) => { api.goster({ oks: 1, kosuyor: true }); api.vurgula(); } },
      { soru: "Kan, O₂'yi yeterince hızlı getiremezse kas ne yapar?", secenekler: ["Hemen durur", "O₂ kullanmadan da bir miktar ATP üretir", "Kendi O₂'sini üretir"], dogru: 1,
        aciklama: "Kas hücresi kısa süre O₂ olmadan da ATP üretebilir. Şimdi bunun nasıl olduğuna bakalım.", ipucu: "Hücreler O₂ üretebilir mi?" },
      { s: "Kas hücresi glikozu <b>oksijensiz</b> yıkmaya başlar. Yalnızca ilk basamak, <b>glikoliz</b> çalışır.", yap: (api) => api.goster({ oks: 1, ferm: 1, laktat: 4, kosuyor: true }) },
      { s: "Piruvat <b>laktik aside</b> dönüşür. Pembe noktalar biriken laktik asit.", yap: (api) => { api.goster({ oks: 1, ferm: 1, laktat: 30, kosuyor: true }); api.vurgula(api.ig.laktat); } },
      { s: "O₂ kullanmadan glikozdan enerji elde etmeye <b>fermantasyon</b> diyoruz. Bu, <b>laktik asit fermantasyonudur</b>." },
      { soru: "Fermantasyonda glikoz tamamen parçalanır mı?", secenekler: ["Evet, CO₂ ve suya kadar", "Hayır, enerjinin çoğu laktik asitte kalır"], dogru: 1,
        aciklama: "Glikoz yalnızca piruvata kadar yıkılır; enerjinin çoğu laktik asitte kalır.", ipucu: "Krebs döngüsü ve ETS çalışıyor mu?" },
      { s: "Fermantasyon hızlıdır ama <b>az</b> ATP verir. Aynı iş için çok daha fazla glikoz harcanır." },
      { s: "Alttaki grafik koşu boyunca ATP'nin kaynağını çizecek: mavi oksijenli solunum, kırmızı fermantasyon.", grafik: true, yap: (api) => { api.goster(null); api.don(); } },
      { s: "Sıra sende: iki farklı şiddette koş ve grafikte ATP'nin nereden geldiğini izle." },
    ],
    anlatBitti: (api) => { api.goster(null); api.don(); },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Maya balon deneyi",
    cikti: "BİY.10.1.9-a, b",
    anlatim: `
      <p>Maya (tek hücreli bir mantar) oksijensiz ortamda şekeri <b>etil alkol ve CO₂</b>'ye dönüştürür. Ağzına balon geçirilmiş şişelerde oluşan CO₂ balonu şişirir.</p>
      <p><b>Deneyini tasarla:</b> Dört şişe için sıcaklık, şeker ve maya miktarını seç. İyi bir deneyde <b>yalnızca bir değişken</b> değiştirilir (bağımsız değişken), diğerleri sabit tutulur. Ölçülen şey balondaki gaz hacmidir (bağımlı değişken).</p>
      <p>Tasarımını onayla, sonra 60 dakikalık deneyi başlat.</p>`,
    gorev: "Geçerli bir deney tasarla, deneyi çalıştır ve iki analiz sorusunu doğru cevapla.",
    ogretmen: "Program, grupların fermantasyon hakkında topladıkları bilgileri sentezleyerek sınıf/laboratuvar ortamında yapabilecekleri bir deney tasarlamasını, hata kaynaklarını ortadan kaldıracak tedbirler almasını ve sonuçları analiz ederek fermantasyonu açıklamasını istiyor. Gerçek deney önerisi: 250 mL şişe, 100 mL ılık su, 1 paket (≈10 g) kuru maya, 1–2 yemek kaşığı şeker, ağzına balon; 15–20 dakika arayla balon çevresi ölçülür. Hata kaynakları: balonun ağızdan kaçırması, su sıcaklığının zamanla değişmesi, mayanın tazeliği. Modeldeki hızlar temsilîdir (Vmax ≈ 0,4 g şeker/g maya/saat, optimum ≈ 35 °C, 50 °C'nin üstünde maya ölür); CO₂'nin bir kısmının suda çözünmesi ihmal edildi.",
    kur(ctx) {
      const SEC = { T: [5, 20, 35, 50, 70], seker: [0, 5, 10, 20], maya: [0, 2, 5, 10] };
      const ISIM = { T: "Sıcaklık", seker: "Şeker", maya: "Maya" }, BIRIM = { T: "°C", seker: "g", maya: "g" };
      // tasarim: öğrencinin seçtiği koşullar; siseler: deney sırasında değişen durum (şeker azalır, CO₂ birikir)
      const tasarim = Array.from({ length: 4 }, () => ({ T: 35, seker: 10, maya: 5 }));
      const siseler = tasarim.map((t) => ({ ...t, co2: 0 }));
      let onayli = null, calisiyor = false, dakika = 0;
      const cevap = [false, false];
      const RENK = [MAVI, YESIL, TURUNCU, MOR];
      const [gr] = ctx.grafikler([{ baslik: "Balondaki gaz", x: { etiket: "dakika", min: 0, max: 60 }, y: { etiket: "mL", min: 0, max: 700 } }]);
      const seriler = siseler.map((_, i) => gr.seri(`Şişe ${i + 1}`, { renk: RENK[i], kalinlik: 3 }));
      const S = ctx.sahne, L = S.lab, N = L.noktalar;
      S.git("lab");
      const hiz = [0, 0, 0, 0];
      const A = anlatApi(S, ctx, "lab");
      const igS = siseler.map((_, i) => A.igne(N.balon[i], "", { renk: RENK[i] }));
      const igT = siseler.map((_, i) => A.igne(N.termoAlt[i], "", { renk: "#c9d4e4", yon: "alt" }));
      A.ig = { balon: igS, termo: igT };
      let gosterimT = null;
      const gs = ctx.gostergeler([{ ad: "dk", etiket: "Süre", ondalik: 0, birim: "dk" }]);
      function sahneGuncelle() {
        siseler.forEach((s, i) => {
          L.ayarla(i, { T: s.T, maya: s.maya, seker: tasarim[i].seker, co2: s.co2, hiz: hiz[i] });
          igS[i].metin(`Şişe ${i + 1}<small>${sayi(s.co2, 0)} mL gaz</small>`);
          igT[i].metin(`${s.T} °C<small>şeker ${tasarim[i].seker} g · maya ${tasarim[i].maya} g</small>`);
        });
        gs.ayarla("dk", Math.min(60, dakika));
      }
      let son = performance.now();
      S.adimKare(ctx, () => {
        const t = performance.now(), gercek = Math.min(1, (t - son) / 1000); son = t;
        // anlatım: balonlar temsilî olarak yavaşça şişer
        if (gosterimT != null) { gosterimT += gercek; siseler.forEach((s, i) => { s.co2 = Math.min(260, gosterimT * 45); hiz[i] = s.co2 < 260 ? 3 : 0; }); }
        if (calisiyor) {
          // saniyede 6 dakika: 60 dakikalık deney yaklaşık 10 saniyede izlenir (en fazla 1,5 dk'lık alt adımlarla)
          const dk = Math.min(gercek * 6, 60 - dakika), n = Math.max(1, Math.ceil(dk / 1.5));
          for (let j = 0; j < n; j++) {
            dakika += dk / n;
            siseler.forEach((s, i) => { const once = s.co2; Object.assign(s, mayaAdim(s, dk / n / 60)); hiz[i] = (s.co2 - once) / Math.max(1e-6, dk / n); seriler[i].ekle(dakika, s.co2); });
          }
          if (dakika >= 60 - 1e-9) { calisiyor = false; hiz.fill(0); deneyBitti(); }
        }
        sahneGuncelle();
      });
      // tasarım tablosu
      const govde = el("tbody");
      tasarim.forEach((s, i) => {
        const tr = el("tr", {}, el("th", {}, `Şişe ${i + 1}`));
        for (const d of ["T", "seker", "maya"]) {
          const sel = el("select", { "aria-label": `Şişe ${i + 1} ${ISIM[d]}`, "data-sise": i, "data-d": d }, SEC[d].map((v) => el("option", { value: String(v) }, `${v} ${BIRIM[d]}`)));
          sel.value = String(s[d]);
          sel.addEventListener("change", () => { s[d] = +sel.value; onayli = null; baslat.disabled = true; sifirla(); });
          tr.append(el("td", {}, sel));
        }
        govde.append(tr);
      });
      ctx.kontroller.append(el("div", { class: "bio-izgara-kutu" }, el("table", { class: "bio-izgara bio-deney" },
        el("thead", {}, el("tr", {}, el("th", {}, ""), ["Sıcaklık", "Şeker", "Maya"].map((b) => el("th", {}, b)))), govde)));
      const [, baslat] = ctx.dugmeler([
        { metin: "Tasarımı onayla", tik: onayla },
        { metin: "▶ Deneyi başlat (60 dk)", ana: true, tik: () => {
          if (!onayli || calisiyor) return;
          sifirla();
          const enFazla = Math.max(...tasarim.map((s) => mayaDeney(s).son.co2));
          gr.eksenAyarla({ y: { min: 0, max: Math.max(200, Math.ceil(enFazla / 100) * 100 + 100) } });
          calisiyor = true; baslat.disabled = true;
        } },
      ]);
      baslat.disabled = true;
      const g = geriBildirim(ctx);
      const analiz = el("div", { hidden: true });
      ctx.kontroller.append(analiz);
      function onayla() {
        const d = tasarimDenetle(tasarim);
        if (!d.gecerli) {
          const m = {
            "hepsi-ayni": "Dört şişe de aynı. Etkisini merak ettiğin <b>bir</b> değişkeni şişeler arasında değiştir.",
            "cok-degisken": `Birden çok değişken farklı (${d.farkli.map((x) => ISIM[x].toLocaleLowerCase("tr")).join(", ")}). Sonuçtaki farkın hangisinden kaynaklandığını bilemezsin; yalnızca birini değiştir.`,
            "az-duzey": `${ISIM[d.degisken]} yalnızca iki düzeyde. Eğilimi görebilmek için en az <b>üç farklı</b> değer dene.`,
          }[d.neden];
          yaz(g, false, m); return;
        }
        onayli = d; baslat.disabled = false;
        const kontrolVar = d.degisken !== "T" && tasarim.some((s) => s[d.degisken] === 0);
        yaz(g, true, `Geçerli tasarım! Bağımsız değişken: <b>${ISIM[d.degisken].toLocaleLowerCase("tr")}</b>. Bağımlı değişken: balondaki gaz hacmi. ${kontrolVar ? "Değişkenin 0 olduğu şişe <b>kontrol grubun</b>." : d.degisken !== "T" ? "İpucu: değişkenin 0 olduğu bir <b>kontrol</b> şişesi eklemek sonucu güçlendirir." : ""}`);
      }
      function sifirla() {
        dakika = 0; calisiyor = false;
        siseler.forEach((s, i) => { Object.assign(s, tasarim[i], { co2: 0 }); seriler[i].temizle(); seriler[i].ekle(0, 0); });
        analiz.hidden = true; cevap[0] = cevap[1] = false; hiz.fill(0);
      }
      function deneyBitti() {
        baslat.disabled = false;
        const enCok = siseler.reduce((b, s, i) => (s.co2 > siseler[b].co2 ? i : b), 0);
        const dv = onayli.degisken;
        analiz.hidden = false;
        analiz.replaceChildren();
        const sor = (etiket, liste, dogru, i, aciklama) => {
          const geri = el("div", { class: "d-geri-bildirim" });
          const grup = el("div", { class: "d-grup" }, liste.map((m, j) => el("button", { class: "d-btn", type: "button", onclick: (e) => {
            [...grup.children].forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget)));
            cevap[i] = j === dogru;
            yaz(geri, cevap[i], cevap[i] ? aciklama : "Grafiğe ve sahnedeki balonlara yeniden bak.");
            if (cevap.every(Boolean) && !ctx.gorevTamamMi()) ctx.gorevTamam();
          } }, m)));
          analiz.append(el("div", { class: "d-secenekler" }, el("span", { html: etiket }), grup), geri);
        };
        sor("<b>Analiz 1:</b> Balonları şişiren gaz hangisi ve nasıl oluştu?", [
          "O₂; maya fotosentez yaptı.",
          "CO₂; maya şekeri etil alkol ve CO₂'ye parçaladı.",
          "CO₂; maya şekeri laktik aside dönüştürdü.",
        ], 1, 0, "Doğru: etil alkol fermantasyonu. Şişedeki sıvı bu yüzden alkol kokar.");
        const yorum = {
          T: `Hız, sıcaklık arttıkça optimuma (~${MAYA.Topt} °C) kadar arttı; çok sıcakta mayanın enzimleri bozulup maya öldüğü için gaz oluşmadı.`,
          seker: "Şeker arttıkça gaz arttı; şekersiz şişede maya fermantasyon yapamadı. Şeker, fermantasyonun hem enerji hem karbon kaynağıdır.",
          maya: "Maya arttıkça gaz arttı; mayasız şişede şeker kendiliğinden gaza dönüşmedi. Gazı oluşturan canlı mayadır.",
        }[dv];
        sor(`<b>Analiz 2:</b> En çok gaz hangi şişede oluştu?`, siseler.map((s, i) => `Şişe ${i + 1}`), enCok, 1, `Doğru: Şişe ${enCok + 1}. ${yorum}`);
        yaz(g, true, "Deney bitti. Balonları ve grafikteki eğrileri karşılaştır, analiz sorularını cevapla.");
      }
      sifirla();
      ctx.temizlik(() => (calisiyor = false));
      return Object.assign(A, {
        sisir(b) { gosterimT = b ? 0 : null; if (!b) sifirla(); },
        yakin: (i, u, dy) => A.odak(N.sise[i], u, 1.3, dy),
      });
    },
    anlat: [
      { s: "Laboratuvardayız. Şişelerde ılık su, şeker ve <b>maya</b> var.", yap: (api) => { api.sisir(false); api.vurgula(api.ig.balon); api.bak(); } },
      { s: "Maya tek hücreli bir <b>mantardır</b>. Ekmek yaparken kullandığımız maya da budur." },
      { s: "Oksijen azalınca maya da fermantasyon yapar; ama ürünü farklıdır: <b>etil alkol ve CO₂</b>.", yap: (api) => { api.vurgula(api.ig.balon[2]); api.yakin(2, 9, 0.9); } },
      { s: "Oluşan CO₂ gazı şişenin ağzındaki balonda toplanır. İzle…", yap: (api) => api.sisir(true) },
      { s: "Bilim insanı bir soru sorar: Mayanın gaz üretmesini <b>neler</b> etkiler? Sıcaklık mı, şeker mi, maya miktarı mı?", yap: (api) => { api.vurgula(api.ig.termo); api.bak(); } },
      { s: "Bir etkiyi sınamak için <b>yalnızca bir şeyi</b> değiştiririz; diğer her şeyi aynı tutarız." },
      { s: "Değiştirdiğimiz şeye <b>bağımsız değişken</b>, ölçtüğümüz sonuca <b>bağımlı değişken</b> deriz." },
      { baslik: "Birlikte yapalım: başka bir deney", cozum: [
        "Soru: Su miktarı fasulyenin boyunu etkiler mi?",
        "Değiştirdiğimiz: su miktarı → <b>bağımsız değişken</b>",
        "Ölçtüğümüz: fasulyenin boyu → <b>bağımlı değişken</b>",
        "Aynı tuttuklarımız: ışık, toprak, saksı, sıcaklık",
      ], yap: (api) => api.vurgula() },
      { soru: "Bir öğrenci aynı anda hem sıcaklığı hem şekeri değiştirdi. Sorun ne?", secenekler: ["Sorun yok, daha çok bilgi alır", "Sonuçtaki farkın hangisinden geldiğini bilemez", "Deney çok uzun sürer"], dogru: 1,
        aciklama: "İki şey birden değişirse etkileri birbirine karışır.", ipucu: "Balon daha çok şişse bunu neye bağlarsın?" },
      { soru: "Mayası olmayan bir şişe ne işe yarar?", secenekler: ["Hiçbir işe yaramaz", "Gazı mayanın ürettiğini gösterir: karşılaştırma için kontrol şişesidir"], dogru: 1,
        aciklama: "Değişkenin 0 olduğu şişe <b>kontrol grubudur</b>; diğer şişeler onunla karşılaştırılır.", ipucu: "Mayasız şişede balon şişmezse ne anlarız?" },
      { s: "Alttaki grafik, deney boyunca her balondaki gaz hacmini dakika dakika çizecek.", grafik: true, yap: (api) => { api.sisir(false); api.don(); } },
      { s: "Sıra sende: dört şişeni tasarla, onayla ve deneyi başlat." },
    ],
    anlatBitti: (api) => { api.sisir(false); api.don(); },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Mutfakta fermantasyon",
    cikti: "BİY.10.1.9-b",
    anlatim: `
      <p>Deney sonuçlarını günlük yaşamla ilişkilendir. Mutfağımızdaki pek çok ürün <b>mikroorganizmaların fermantasyonu</b> sayesinde yapılır.</p>
      <ul>
        <li><b>Laktik asit fermantasyonu:</b> laktik asit bakterileri (ve kas hücreleri) — ürün laktik asit.</li>
        <li><b>Etil alkol fermantasyonu:</b> mayalar — ürün etil alkol ve CO₂.</li>
      </ul>
      <p>Ürünleri doğru fermantasyon türüne yerleştir.</p>`,
    gorev: "Yedi ürünü sınıflandır ve ekmek sorusunu doğru cevapla.",
    ogretmen: "Program, deney sonuçlarından hareketle fermantasyon ile yoğurdun, peynirin, kefirin ve ekmeğin mayalanması, turşu yapımı vb. arasında ilişki kurulmasını ve fermantasyonun insan sağlığı açısından öneminin vurgulanmasını istiyor. Şalgam suyu ve boza yerel örneklerdir; boza ve kefirde laktik asit bakterileri ile mayalar birlikte çalışır. Turşu ve şalgam suyunun tuz içeriği nedeniyle ölçülü tüketilmesi gerektiğini de tartışın.",
    kur(ctx) {
      const S = ctx.sahne, U = S.mutfak.noktalar.urun;
      S.git("mutfak", "urunler");
      let siniflandi = false, soru = false;
      const NOK = { "Yoğurt": "yogurt", "Peynir": "peynir", "Turşu": "tursu", "Şalgam suyu": "salgam", "Ekmek hamurunun kabarması": "ekmek", "Kefir": "kefir", "Boza": "boza" };
      const TUR = { laktik: ["laktik asit fermantasyonu", "#ff9a9a"], alkol: ["etil alkol fermantasyonu", SARI], ikisi: ["ikisi birlikte", MOR] };
      const kisa = (ad) => (ad === "Ekmek hamurunun kabarması" ? "Ekmek hamuru" : ad);
      const A = anlatApi(S, ctx, ["mutfak", "urunler"]);
      const ig = {};
      URUNLER.forEach((u, i) => (ig[u.ad] = A.igne(U[NOK[u.ad]], `${kisa(u.ad)}<small>?</small>`, { renk: SOLUK, yon: i < 4 ? "ust" : "alt" })));
      A.ig = Object.values(ig);
      yuzenTuval(ctx, {
        gen: 720, yuk: 70, konum: "ust", genislik: "min(600px, 94%)",
        ciz(c) {
          yazi(c, "Laktik asit fermantasyonu: glikoz → 2 laktik asit + 2 ATP", 360, 21, { boyut: 16, kalin: true, renk: "#ff9a9a" });
          yazi(c, "Etil alkol fermantasyonu: glikoz → 2 etil alkol + 2 CO₂ + 2 ATP", 360, 50, { boyut: 16, kalin: true, renk: SARI });
        },
      });
      let son = null;
      S.adimKare(ctx, () => {
        const t = yerlesenler(), a = t.join("|");
        if (a === son) return;
        son = a;
        for (const u of URUNLER) {
          const on = t.includes(u.ad), [m, rk] = TUR[u.tur];
          ig[u.ad].metin(`${kisa(u.ad)}<small>${on ? m : "?"}</small>`); renkVer(ig[u.ad], on ? rk : SOLUK);
        }
      });
      const kap = el("div"); ctx.kontroller.append(kap);
      siniflandir(kap, {
        kutular: [{ ad: "laktik", baslik: "Laktik asit" }, { ad: "ikisi", baslik: "İkisi birlikte" }, { ad: "alkol", baslik: "Etil alkol" }], sutun: 3,
        ogeler: URUNLER.map((u) => ({ metin: u.ad, dogru: u.tur, neden: u.neden })),
        tamam: () => { siniflandi = true; bitir(); },
      });
      ctx.secenekler({
        etiket: "Mayalı ekmek hamurunda oluşan etil alkole ne olur?",
        liste: [
          { deger: 0, metin: "Ekmekte kalır; ekmek alkollü olur." },
          { deger: 1, metin: "Fırında pişerken büyük ölçüde buharlaşır." },
          { deger: 2, metin: "Laktik aside dönüşür." },
        ],
        deger: null, degisti: (v) => { soru = v === 1; yaz(sg, soru, soru ? "Doğru. Hamuru kabartan CO₂'dir; etil alkol pişirme sırasında buharlaşır. Ekmeğin gözenekleri CO₂ kabarcıklarının izidir." : "Etil alkolün kaynama noktası (78 °C) fırın sıcaklığından çok düşüktür."); bitir(); },
      });
      const sg = geriBildirim(ctx);
      ctx.not("<p><b>Sağlıklı yaşam:</b> Yoğurt ve kefir gibi canlı mikroorganizma içeren fermente ürünler bağırsak mikrobiyotasını destekleyebilir. Fermantasyon ayrıca besinlerin bozulmadan saklanmasını sağlar.</p>");
      function bitir() { if (siniflandi && soru && !ctx.gorevTamamMi()) ctx.gorevTamam(); }
      return A;
    },
    anlat: [
      { s: "Mutfağa döndük. Tezgâhtaki bu ürünlerin hepsinin ortak bir sırrı var.", yap: (api) => { api.vurgula(api.ig); api.bak(); } },
      { s: "Hepsi gözle göremediğimiz canlıların, <b>bakteri ve mayaların</b>, fermantasyonuyla yapılır.", yap: (api) => api.vurgula() },
      { formul: [["glikoz"], ["→"], ["2 laktik asit", "ekşi tat"], ["+"], ["2 ATP"]],
        s: "<b>Laktik asit bakterileri</b> şekeri laktik aside çevirir. Kasında olan da buydu.", oku: "glikoz, iki laktik asit ve iki ATP verir" },
      { formul: [["glikoz"], ["→"], ["2 etil alkol"], ["+"], ["2 CO₂", "gaz"], ["+"], ["2 ATP"]],
        s: "<b>Mayalar</b> ise şekeri etil alkol ve CO₂'ye çevirir. Balonu şişiren buydu.", oku: "glikoz, iki etil alkol, iki karbondioksit ve iki ATP verir" },
      { soru: "Hangi fermantasyonda gaz oluşur?", secenekler: ["Laktik asit fermantasyonu", "Etil alkol fermantasyonu"], dogru: 1,
        aciklama: "Etil alkol fermantasyonunda CO₂ çıkar; laktik asit fermantasyonunda gaz oluşmaz.", ipucu: "Hangi formülde CO₂ var?" },
      { s: "İpucu: <b>ekşi tat</b> çoğunlukla laktik asitten, <b>kabarma ve köpük</b> ise CO₂'den gelir." },
      { baslik: "Birlikte yapalım: sucuk", cozum: [
        "Geleneksel sucuk günlerce dinlendirilerek olgunlaştırılır.",
        "Bu sırada tadı hafifçe ekşir; kabarma olmaz.",
        "Ekşiliği laktik asit bakterileri yapar.",
        "Sonuç: <b>laktik asit fermantasyonu</b>.",
      ] },
      { soru: "Hem ekşi hem hafif köpüklü bir içecekte hangi canlılar çalışmış olabilir?", secenekler: ["Yalnızca laktik asit bakterileri", "Laktik asit bakterileri ve mayalar birlikte"], dogru: 1,
        aciklama: "Ekşilik bakterilerden, köpük mayaların ürettiği CO₂'den gelir.", ipucu: "Köpük hangi gazdan oluşur, o gazı kim üretir?" },
      { s: "Sıra sende: ürünleri doğru fermantasyon türüne yerleştir." },
    ],
    anlatBitti: (api) => api.don(),
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Günlük enerji bütçen",
    cikti: "BİY.10.1.10-a, b",
    anlatim: `
      <p>Besinlerden aldığın enerji; <b>hücresel faaliyetlerin</b> sürmesi, <b>organların çalışması</b>, <b>vücut sıcaklığının korunması</b> ve günlük aktiviteler için kullanılır. Bir besinin enerji değeri, içindeki karbonhidrat, protein ve yağ miktarına bağlıdır.</p>
      <p>Günlük harcamanı kabaca <b>MET × kütle (kg) × süre (saat)</b> ile hesaplayabilirsin (MET: etkinliğin dinlenmeye göre kaç kat enerji gerektirdiği).</p>
      <p>Gününü ayarla, tabağını doldur ve dengeli bir menüyü tabloya kaydet.</p>`,
    gorev: "Alınan enerjinin harcamaya <b>±%10</b> yakın olduğu ve karbonhidrat payının <b>%45–65</b> arasında kaldığı bir menüyü kaydet.",
    ogretmen: "Program, “Farklı besinlerden nasıl ve ne kadar enerji elde edilebilir?” sorusuyla başlanmasını, besinlerden elde edilen enerjinin rolünün açıklanmasını ve verilerin tablo/grafik gibi görsel formatlarda kaydedilmesini istiyor. MET değerleri yetişkinler için hazırlanmış çizelgelerden alınmıştır; büyüme çağındaki gençlerin gerçek ihtiyacı daha yüksek olabilir. Porsiyon değerleri temsilîdir (uzman kontrolü gerekli: güncel Türkiye besin kompozisyonu verileriyle karşılaştırılabilir). Kütle ve beslenme konuşulurken öğrencilerin kişisel verilerini paylaşmaya zorlanmamasına dikkat edin.",
    kur(ctx) {
      const S = ctx.sahne, MU = S.mutfak, N = MU.noktalar;
      S.git("mutfak", "tabak");
      const gun = { kg: 55, uyku: 8, yuruyus: 1, spor: 1 };
      const tabak = new Map();
      const kayitlar = [];
      const A = anlatApi(S, ctx, ["mutfak", "tabak"]);
      const igA = A.igne(N.alinan, "", { renk: YESIL, yon: "sol" });
      const igH = A.igne(N.harcanan, "", { renk: TURUNCU });
      const igT = A.igne(N.tabak, "", { renk: "#c9d4e4", yon: "alt" });
      A.ig = { alinan: igA, harcanan: igH, tabak: igT };
      ctx.temizlik(() => MU.tabakGoster(new Map()));
      let ozet = tabakOzeti(tabak);
      function guncelle() {
        const h = gunlukHarcama(gun.kg, gun), o = tabakOzeti(tabak);
        ozet = o;
        MU.tabakGoster(tabak);
        MU.sutunAyarla(o.kcal, h, Math.max(3500, h, o.kcal));
        igA.metin(`Alınan<small>${sayi(o.kcal, 0)} kcal</small>`);
        igH.metin(`Harcanan<small>${sayi(h, 0)} kcal</small>`);
        const fark = h ? (o.kcal - h) / h : 0;
        igT.metin(o.kcal ? `Tabağın<small>fark: ${fark >= 0 ? "+" : "−"}${yuzde(Math.abs(fark))}</small>` : "Tabak boş<small>yiyecek ekle</small>");
        renkVer(igT, o.kcal && Math.abs(fark) <= 0.1 ? YESIL : "#c9d4e4");
      }
      yuzenTuval(ctx, {
        gen: 440, yuk: 200, konum: "ust", genislik: "min(360px, 90%)",
        ciz(c) {
          const o = ozet;
          yazi(c, "Enerjinin kaynağı", 220, 18, { boyut: 16, kalin: true });
          [["Karbonhidrat", o.oran.k, SARI, KARB_ARALIK], ["Protein", o.oran.p, "#ff8a8a"], ["Yağ", o.oran.y, TURUNCU]].forEach(([ad, v, r, ar], i) => {
            const y = 44 + i * 48;
            yazi(c, ad, 16, y, { boyut: 14, hiza: "left" });
            yazi(c, yuzde(v || 0), 424, y, { boyut: 14, kalin: true, hiza: "right", renk: r });
            c.fillStyle = "#2b3444"; c.fillRect(16, y + 13, 408, 13);
            c.fillStyle = r; c.fillRect(16, y + 13, 408 * (v || 0), 13);
            if (ar) { c.strokeStyle = "#e8eef7"; c.setLineDash([4, 3]); c.lineWidth = 1.5; c.strokeRect(16 + 408 * ar[0], y + 9, 408 * (ar[1] - ar[0]), 21); c.setLineDash([]); }
          });
          yazi(c, "Kesikli kutu: önerilen aralık", 220, 188, { boyut: 12, renk: SOLUK });
        },
      });
      ctx.kaydirici({ etiket: "Kütle", min: 35, max: 90, adim: 1, deger: gun.kg, birim: "kg", degisti: (v) => { gun.kg = v; guncelle(); } });
      ctx.kaydirici({ etiket: "Uyku", min: 5, max: 11, adim: 0.5, deger: gun.uyku, birim: "saat", ondalik: 1, degisti: (v) => { gun.uyku = v; guncelle(); } });
      ctx.kaydirici({ etiket: "Yürüyüş", min: 0, max: 4, adim: 0.5, deger: gun.yuruyus, birim: "saat", ondalik: 1, degisti: (v) => { gun.yuruyus = v; guncelle(); } });
      ctx.kaydirici({ etiket: "Spor (koşu, futbol)", min: 0, max: 4, adim: 0.5, deger: gun.spor, birim: "saat", ondalik: 1, degisti: (v) => { gun.spor = v; guncelle(); } });
      ctx.not("<p><b>Tabağına ekle</b> (her dokunuş bir porsiyon):</p>");
      const yb = ctx.dugmeler(YIYECEKLER.map((f, i) => ({ metin: `${f.ad} · ${sayi(besinEnerjisi(f), 0)}`, tik: () => { tabak.set(i, (tabak.get(i) || 0) + 1); guncelle(); } })));
      yb[0].parentElement.classList.add("bio-yiyecekler");
      ctx.dugmeler([{ metin: "Tabağı boşalt", tik: () => { tabak.clear(); guncelle(); } }, { metin: "Menüyü tabloya kaydet", ana: true, tik: kaydet }]);
      const tablo = ctx.tablo(["Harcanan", "Alınan", "Karb.", "Prot.", "Yağ"]);
      const g = geriBildirim(ctx);
      function kaydet() {
        const h = gunlukHarcama(gun.kg, gun), o = tabakOzeti(tabak);
        if (!o.kcal) { yaz(g, false, "Tabağın boş."); return; }
        tablo.satirEkle([sayi(h, 0), sayi(o.kcal, 0), yuzde(o.oran.k), yuzde(o.oran.p), yuzde(o.oran.y)]);
        const fark = (o.kcal - h) / h, karbOk = o.oran.k >= KARB_ARALIK[0] && o.oran.k <= KARB_ARALIK[1];
        kayitlar.push({ fark, karbOk });
        if (Math.abs(fark) <= 0.1 && karbOk) {
          if (!ctx.gorevTamamMi()) ctx.gorevTamam();
          yaz(g, true, "Dengeli bir gün! Aldığın enerji harcamana yakın ve karbonhidrat payı önerilen aralıkta. Fazla alınan enerji vücutta çoğunlukla <b>yağ</b> olarak depolanır; eksik kalırsa önce glikojen, sonra yağ depoları kullanılır.");
        } else yaz(g, false, `${Math.abs(fark) > 0.1 ? `Alınan enerji harcamadan ${yuzde(Math.abs(fark))} ${fark > 0 ? "fazla" : "az"}. ` : ""}${karbOk ? "" : `Karbonhidrat payı ${yuzde(o.oran.k)}; %45–65 aralığına getir. `}Kaydın tabloda; menünü değiştirip yeniden dene.`);
      }
      guncelle();
      return Object.assign(A, {
        ekle(ad) { const i = YIYECEKLER.findIndex((f) => f.ad.startsWith(ad)); tabak.set(i, (tabak.get(i) || 0) + 1); guncelle(); },
        bosalt() { tabak.clear(); guncelle(); },
      });
    },
    anlat: [
      { s: "Vücudun gün boyu enerji harcar; uyurken bile!", yap: (api) => { api.bosalt(); api.vurgula(api.ig.harcanan); api.bak(); } },
      { s: "Bu enerji kalbin atması, beynin çalışması ve <b>vücut sıcaklığının</b> korunması için gerekir." },
      { s: "Turuncu sütun gün boyu <b>harcadığın</b>, yeşil sütun yiyeceklerle <b>aldığın</b> enerji.", yap: (api) => api.vurgula(api.ig.harcanan, api.ig.alinan) },
      { s: "Harcamayı etkinliğin ne kadar yorucu olduğu belirler. Bunu <b>MET</b> ile ölçeriz: uyku ≈ 1, koşu ≈ 7.", yap: (api) => api.vurgula() },
      { formul: [["enerji", "kcal"], ["="], ["MET", "etkinliğin katsayısı"], ["×"], ["kütle", "kg"], ["×"], ["süre", "saat"]],
        s: "Bir etkinlikte harcanan enerjiyi kabaca böyle hesaplarız.", oku: "enerji eşittir MET çarpı kütle çarpı süre" },
      { baslik: "Birlikte yapalım", cozum: ["60 kg biri 2 saat yürüyor (MET 3,5).", "3,5 × 60 × 2", "= <b>420 kcal</b>"] },
      { soru: "50 kg biri 1 saat koşuyor (MET 7). Yaklaşık kaç kcal harcar?", secenekler: ["57 kcal", "350 kcal", "700 kcal"], dogru: 1,
        aciklama: "7 × 50 × 1 = 350 kcal.", ipucu: "Üç sayıyı çarp: MET × kütle × süre." },
      { s: "Tabağa bir porsiyon <b>pilav</b> koyalım: yeşil sütun yükseliyor.", yap: (api) => { api.ekle("Pilav"); api.vurgula(api.ig.alinan, api.ig.tabak); } },
      { s: "Üstteki çubuklar, aldığın enerjinin ne kadarının karbonhidrat, protein ve yağdan geldiğini gösterir.", yap: (api) => { api.vurgula(); api.grafik(); } },
      { soru: "Aldığın enerji harcadığından çok daha fazla olursa ne olur?", secenekler: ["Fazlası hemen atılır", "Fazlası çoğunlukla yağ olarak depolanır", "Hiçbir şey olmaz"], dogru: 1,
        aciklama: "Kullanılmayan enerji, vücutta çoğunlukla yağ dokusunda depolanır.", ipucu: "Yağlar vücutta ne işe yarıyordu?" },
      { s: "Sıra sende: gününü ayarla, tabağını doldur ve dengeli menüyü kaydet.", yap: (api) => { api.bosalt(); api.don(); } },
    ],
    anlatBitti: (api) => { api.bosalt(); api.don(); },
  },

  /* 9 ------------------------------------------------------------------ */
  {
    baslik: "ATP nereye harcanıyor?",
    cikti: "BİY.10.1.10-c",
    anlatim: `
      <p>Besinlerden elde edilen enerji ATP'ye aktarılır ve <b>metabolik süreçlerde</b> kullanılır: kas faaliyetleri, biyosentez (protein, DNA yapımı), sinirsel iletim, aktif taşıma… Bu süreçlerde açığa çıkan ısı da vücut sıcaklığını korur.</p>
      <p>Sahnedeki grafik, dinlenme hâlindeki bir insanda ATP'nin yaklaşık nereye harcandığını gösteriyor. Grafiği yorumla, sonra olayları ATP harcayıp harcamamasına göre ayır.</p>`,
    gorev: "Sekiz olayı doğru sınıflandır ve beslenme sorusunu doğru cevapla.",
    ogretmen: "Program, öğrencilerin topladıkları bilgileri yorumlayıp değerlendirmesini ve hazır/işlenmiş gıda tüketimi, tek tip besin tüketimi gibi alışkanlıkların metabolizmaya etkilerini tartışmasını istiyor. Grafik, Rolfe ve Brown (1997) derlemesindeki yaklaşık değerlerin yuvarlanmasıyla hazırlandı; dokuya ve ölçüm yöntemine göre değişir (uzman kontrolü gerekli).",
    kur(ctx) {
      const S = ctx.sahne, H = S.hucre, N = H.noktalar;
      S.git("hucre", "tuketim");
      H.sifirla(); ctx.temizlik(() => H.sifirla());
      H.ayarla({ glikoliz: true, krebs: true, o2: true, ets: 1, co2Surekli: true, tuketim: true });
      let siniflandi = false, soru = false;
      const pay = (ad) => ATP_DAGILIM.find((d) => d.ad === ad).pay;
      const A = anlatApi(S, ctx, ["hucre", "tuketim"]);
      A.ig = {
        atp: A.igne(N.mitoAtp, "ATP üretimi<small>mitokondri</small>", { renk: SARI }),
        ribozom: A.igne(N.ribozom, `Protein sentezi<small>ribozom · %${pay("Protein sentezi")}</small>`, { renk: "#ff8a8a" }),
        naK: A.igne(N.naK, `Na⁺/K⁺ pompası<small>hücre zarı · %${pay("Na⁺/K⁺ pompası")}</small>`, { renk: MOR }),
        ca: A.igne(N.ca, `Ca²⁺ pompası<small>endoplazmik retikulum · %${pay("Ca²⁺ pompası")}</small>`, { renk: MAVI, yon: "sag" }),
      };
      yuzenTuval(ctx, {
        gen: 560, yuk: 262, konum: "alt", genislik: "min(430px, 92%)",
        ciz(c) {
          yazi(c, "Dinlenirken ATP nereye harcanır? (yaklaşık %)", 280, 18, { boyut: 15, kalin: true });
          const RN = [YESIL, MAVI, SARI, MOR, KIRMIZI, TURUNCU, SOLUK];
          ATP_DAGILIM.forEach((d, i) => {
            const y = 38 + i * 29;
            yazi(c, d.ad, 214, y + 10, { boyut: 12.5, hiza: "right" });
            c.fillStyle = "#2b3444"; c.fillRect(222, y, 290, 20);
            c.fillStyle = RN[i]; c.fillRect(222, y, 290 * (d.pay / 30), 20);
            yazi(c, `%${d.pay}`, 228 + 290 * (d.pay / 30), y + 10, { boyut: 12.5, kalin: true, hiza: "left", renk: RN[i] });
          });
          yazi(c, "Kaynak: Rolfe ve Brown (1997) derlemesinden yuvarlanmış değerler", 280, 250, { boyut: 11, renk: SOLUK });
        },
      });
      const kap = el("div"); ctx.kontroller.append(kap);
      siniflandir(kap, {
        kutular: [{ ad: "e", baslik: "ATP harcar" }, { ad: "h", baslik: "ATP harcamaz" }], sutun: 2,
        ogeler: OLAYLAR.map((o) => ({ metin: o.metin, dogru: o.atp ? "e" : "h", neden: o.neden })),
        tamam: () => { siniflandi = true; bitir(); },
      });
      ctx.secenekler({
        etiket: "Bir genç haftalarca neredeyse yalnızca beyaz ekmek, şekerli içecek ve cips tüketiyor. Enerji ihtiyacı karşılansa bile hangi sorun beklenir?",
        liste: [
          { deger: 0, metin: "Hiçbir sorun olmaz; önemli olan yalnızca kalori miktarıdır." },
          { deger: 1, metin: "Protein sentezi, onarım ve büyüme için gereken amino asit, vitamin ve mineraller eksik kalır." },
          { deger: 2, metin: "Hücreler ATP üretmeyi tamamen durdurur." },
        ],
        deger: null, degisti: (v) => { soru = v === 1; yaz(sg, soru, soru ? "Doğru. Grafikte gördüğün gibi ATP'nin büyük kısmı protein sentezine gidiyor; bunun için yalnızca enerji değil, amino asit gibi yapı taşları da gerekir. İşlenmiş gıdalardaki fazla şeker ve yağ ise fazla enerji olarak depolanır." : "Enerji, metabolizmanın yalnızca bir ihtiyacıdır. Hücre neyi üretmek için ATP harcıyor? Grafiğe bak."); bitir(); },
      });
      const sg = geriBildirim(ctx);
      ctx.yaziAlani({ etiket: "<b>Değerlendir:</b> Hazır ve işlenmiş gıdaların sık tüketilmesi metabolizmayı nasıl etkileyebilir? Grafikten ve topladığın verilerden yararlanarak yorumla.", anahtar: "metabolizma-yorum", enAz: 60 });
      function bitir() { if (siniflandi && soru && !ctx.gorevTamamMi()) ctx.gorevTamam(); }
      return Object.assign(A, { yakin: (ad, u) => A.odak(N[ad], u, 1.3, -0.8) });
    },
    anlat: [
      { s: "Hücreye geri döndük. Mitokondri durmadan <b>ATP</b> üretiyor.", yap: (api) => { api.vurgula(api.ig.atp); api.bak(); } },
      { s: "Peki bu ATP nereye gidiyor? Sarı parçacıkların yolunu izle." },
      { s: "<b>Ribozomlar</b> ATP harcayarak amino asitleri birleştirir ve <b>protein</b> yapar.", yap: (api) => { api.vurgula(api.ig.ribozom); api.yakin("ribozom", 7); } },
      { s: "Zardaki <b>Na⁺/K⁺ pompası</b>, iyonları az olduğu yerden çok olduğu yere taşır.", yap: (api) => { api.vurgula(api.ig.naK); api.yakin("naK", 7); } },
      { soru: "Bir top yokuş aşağı kendiliğinden yuvarlanır. Yokuş yukarı çıkması için ne gerekir?", secenekler: ["Hiçbir şey", "Enerji"], dogru: 1,
        aciklama: "Pompalar da maddeleri “yokuş yukarı” taşır; bu iş ATP harcar. Buna <b>aktif taşıma</b> denir.", ipucu: "Topu yukarı kim, nasıl çıkarır?" },
      { s: "Maddelerin çok olduğu yerden az olduğu yere kendiliğinden geçmesi ise <b>difüzyondur</b>; ATP gerekmez.", yap: (api) => api.bak() },
      { s: "Alttaki grafik, dinlenirken ATP'nin <b>yaklaşık</b> nereye harcandığını gösteriyor.", yap: (api) => { api.vurgula(); api.grafik(); } },
      { soru: "Grafiğe göre dinlenirken ATP'nin en büyük payı nereye gidiyor?", secenekler: ["Kas kasılması", "Protein sentezi", "Üre yapımı"], dogru: 1,
        aciklama: "Dinlenirken bile hücreler sürekli protein yapar; ATP'nin en büyük payı buraya gider.", ipucu: "En uzun çubuğa bak." },
      { s: "Harcanan enerjinin bir kısmı da <b>ısıya</b> dönüşür; bu ısı vücut sıcaklığını korur." },
      { s: "Sıra sende: olayları ATP harcayıp harcamamasına göre ayır.", yap: (api) => api.don() },
    ],
    anlatBitti: (api) => api.don(),
  },

  /* 10 ----------------------------------------------------------------- */
  {
    baslik: "Değerlendirme: Solunum ve fermantasyon",
    anlatim: `
      <p>Dokuz soruluk kısa bir değerlendirme. Her sorudan sonra açıklamayı oku.</p>
      <p>En az <b>7 doğru</b> yaparsan dersi tamamlamış olursun.</p>`,
    gorev: "Değerlendirmede en az <b>7/9</b> doğru yap.",
    ogretmen: "Sorular programdaki öğrenme kanıtlarıyla (model, yapılandırılmış grid, deney raporu) uyumludur. Fermantasyon deneyinin raporu için 6. adımdaki tasarım ve grafik kullanılabilir.",
    kur(ctx) {
      const S = ctx.sahne, H = S.hucre;
      S.git("hucre", "genel");
      H.sifirla(); ctx.temizlik(() => H.sifirla());
      H.ayarla({ glikoliz: true, krebs: true, o2: true, ets: 1, co2Surekli: true, tuketim: true });
      S.dondur(ctx, 0.35);
      const grafikSoru = (ayar, fn, renk) => (kap) => {
        const gg = new Grafik(kap, ayar);
        const n = []; for (let x = ayar.x.min; x <= ayar.x.max; x += (ayar.x.max - ayar.x.min) / 60) n.push([x, fn(x)]);
        gg.seri("s", { renk, kalinlik: 3 }).ayarla(n);
      };
      ctx.sinav([
        {
          tur: "coktan", metin: "Glikoliz hücrenin neresinde gerçekleşir?",
          siklar: ["Mitokondri matriksinde", "Sitoplazmada", "Mitokondri iç zarında", "Çekirdekte"], dogru: 1,
          aciklama: "Glikoliz sitoplazmada olur ve O₂ gerektirmez. Piruvat oksidasyonu ve Krebs döngüsü matrikste, ETS iç zarda gerçekleşir.",
        },
        {
          tur: "sayi", metin: "Bir glikoz oksijenli solunumla tamamen parçalanınca kaç CO₂ açığa çıkar?",
          dogru: 6, tolerans: 0, birim: "CO₂",
          aciklama: "Glikozun 6 karbonu da CO₂ olur: 2'si piruvatın oksidasyonunda, 4'ü Krebs döngüsünde.",
        },
        {
          tur: "coktan", metin: "Oksijenli solunumda O₂'nin görevi nedir?",
          siklar: ["Glikozu ikiye bölmek", "Krebs döngüsünde karbonları CO₂'ye çevirmek", "ETS'de son elektron alıcısı olarak su oluşturmak", "Glikolizi başlatmak"], dogru: 2,
          aciklama: "O₂, elektron taşıma sisteminin sonunda elektronları alır ve suya dönüşür. O₂ olmazsa ETS ve ona bağlı Krebs döngüsü durur.",
        },
        {
          tur: "coktan", metin: "Yağ asitleri hücresel solunuma hangi basamaktan katılır?",
          siklar: ["Glikolizin başından", "Asetil-KoA olarak Krebs döngüsünden", "Yalnızca ETS'den", "Hiç katılmaz"], dogru: 1,
          aciklama: "Yağ asitleri iki karbonlu parçalara ayrılıp asetil-KoA olarak Krebs döngüsüne girer. Gliserol ise glikolizin ara basamağından katılır.",
        },
        {
          tur: "coktan", metin: "Aşağıdakilerden hangisi yalnızca <b>proteinlerin</b> solunumda kullanılmasında görülür?",
          siklar: ["CO₂ oluşması", "ATP üretilmesi", "Azotlu atık (NH₃) oluşması", "Krebs döngüsünün kullanılması"], dogru: 2,
          aciklama: "Amino asitlerde azot bulunur; solunumda kullanılmadan önce NH₃ olarak ayrılır. Diğer seçenekler üç besin grubunda ortaktır.",
        },
        {
          tur: "sayi", metin: "Grafikte maya ile yapılan bir deneyde 60 dakikada oluşan CO₂ hacminin sıcaklıkla değişimi görülüyor. Fermantasyon hangi sıcaklıkta (°C) en hızlıdır?",
          grafik: grafikSoru({ baslik: "CO₂ – sıcaklık", x: { etiket: "T (°C)", min: 0, max: 60 }, y: { etiket: "mL", min: 0, max: 600 } }, (T) => mayaDeney({ T, seker: 10, maya: 5 }).son.co2, TURUNCU),
          dogru: MAYA.Topt, tolerans: 3, birim: "°C",
          aciklama: "Eğri yaklaşık 35 °C'de en yüksektir. Daha sıcakta mayanın enzimleri bozulur; 50 °C'nin üstünde maya ölür.",
        },
        {
          tur: "coktan", metin: "Ekmek hamurunu kabartan gaz hangisidir ve hangi olayla oluşur?",
          siklar: ["O₂ – fotosentez", "CO₂ – etil alkol fermantasyonu", "CO₂ – laktik asit fermantasyonu", "N₂ – oksijenli solunum"], dogru: 1,
          aciklama: "Maya, hamurdaki şekerleri etil alkol ve CO₂'ye dönüştürür. Laktik asit fermantasyonunda CO₂ oluşmaz.",
        },
        {
          tur: "sayi", metin: "Bir atıştırmalıkta 50 g karbonhidrat ve 30 g yağ var. Bu atıştırmalık yaklaşık kaç kcal enerji sağlar? (karbonhidrat 4, yağ 9 kcal/g)",
          dogru: 470, tolerans: 1, birim: "kcal",
          aciklama: "50 × 4 + 30 × 9 = 200 + 270 = 470 kcal.",
        },
        {
          tur: "coktan", metin: "Hangisinde ATP harcanmaz?",
          siklar: ["Kas kasılması", "Protein sentezi", "O₂'nin difüzyonla kana geçmesi", "Aktif taşıma"], dogru: 2,
          aciklama: "Difüzyon, maddelerin çok olduğu yerden az olduğu yere kendiliğinden geçişidir; ATP gerektirmez.",
        },
      ], { baslik: "Solunum ve fermantasyon", gecmeOrani: 0.75 });
      return {
        git: (yer, bakis) => S.git(yer, bakis),
        bitir() { S.git("hucre", "genel").then(() => S.dondur(ctx, 0.35)); },
      };
    },
    anlat: [
      { s: "Glikozun yolculuğunu hatırla: glikoliz, piruvat oksidasyonu, Krebs döngüsü ve ETS.", yap: (api) => { api.git("hucre", "ana"); } },
      { s: "O₂ yetmezse yalnızca glikoliz çalışır: <b>fermantasyon</b>. Kasta laktik asit oluşur.", yap: (api) => api.git("kas") },
      { s: "Mayada ise etil alkol ve CO₂ oluşur. Ekmeği kabartan bu CO₂'dir.", yap: (api) => api.git("lab") },
      { soru: "Hangisi bir glikozdan en çok ATP elde etmeyi sağlar?", secenekler: ["Laktik asit fermantasyonu", "Oksijenli solunum", "Etil alkol fermantasyonu"], dogru: 1,
        aciklama: "Oksijenli solunumda glikoz CO₂'ye kadar yıkılır; ATP'nin çoğu ETS'de üretilir.", ipucu: "Hangisinde Krebs döngüsü ve ETS çalışır?" },
      { s: "Yağ ve protein de solunuma katılır; besinin enerjisi içindeki karbonhidrat, yağ ve proteine bağlıdır.", yap: (api) => api.git("mutfak", "kalori") },
      { s: "ATP; protein yapımı, pompalar ve kas kasılması gibi işlere harcanır. Şimdi bildiklerini sına.", yap: (api) => api.git("hucre", "tuketim") },
    ],
    anlatBitti: (api) => api.bitir(),
  },
];

dersBaslat({ adimlar, sahneKur: solunumSahnesi });
