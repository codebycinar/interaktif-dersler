// 7. adım: Minarenin boyu — cami avlusunda 3B sahne. Öğrenci kendini (gözlemciyi) sürükleyip klinometreyle
// minarenin tepesine bakar; dik üçgen çizimi ve hesap yüzen panelde. Sahne temsilîdir (minare 38 m kabul edildi).
import { sayi } from "../../../../engine/ders.js";
import { sekilCiz, RENK } from "../ortak/tahta.js";
import { hud, gorevListesi } from "../ortak/yardim.js";
import { dunyaAc, yuzenPanel, dokuluMalzeme, agac, ev, insan, cubuk, serit, THREE, malzeme, organiklestir, rastgele } from "../ortak/dunya3b.js";
import { MINARE, bakisAcisi } from "./model.js";

const DMIN = 10, DMAX = 60;

function avluKur(S) {
  const { scene } = S;
  const r = rastgele(7);
  // avlu taşı ve çevredeki çimen
  const tas = dokuluMalzeme({ taban: "#b9b2a4", koyu: "#8f877a", acik: "#d6d0c3", olcek: 10, benek: 0.25, tekrar: [10, 6] });
  const avlu = new THREE.Mesh(new THREE.PlaneGeometry(110, 50), tas);
  avlu.rotation.x = -Math.PI / 2; avlu.position.set(15, 0, 0); avlu.receiveShadow = true;
  scene.add(avlu);
  const cim = dokuluMalzeme({ taban: "#5d7f3e", koyu: "#3f5d2a", acik: "#7f9f52", olcek: 14, benek: 0.3, tekrar: [14, 14] });
  const zemin = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), cim);
  zemin.rotation.x = -Math.PI / 2; zemin.position.y = -0.02; zemin.receiveShadow = true;
  scene.add(zemin);

  // cami: ana gövde, kasnak, kubbe, yarım kubbeler, pencereler
  const duvar = dokuluMalzeme({ taban: "#e3dccd", koyu: "#c3b9a6", acik: "#f1ece2", olcek: 8, benek: 0.1, uzama: [1, 3], tekrar: [3, 2] });
  const kursun = malzeme.metal(0x8d969f, { puruz: 0.55 });
  const cami = new THREE.Group();
  const govde = new THREE.Mesh(new THREE.BoxGeometry(20, 11, 18), duvar);
  govde.position.y = 5.5; govde.castShadow = govde.receiveShadow = true;
  const kasnak = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 6.6, 2.4, 24), duvar);
  kasnak.position.y = 12.2; kasnak.castShadow = true;
  const kubbe = new THREE.Mesh(new THREE.SphereGeometry(6.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), kursun);
  kubbe.position.y = 13.4; kubbe.castShadow = true;
  const alemK = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), malzeme.metal(0xd8b25a, { puruz: 0.25 }));
  alemK.position.y = 20.6;
  cami.add(govde, kasnak, kubbe, alemK);
  for (const [x, z, a] of [[-10, 0, Math.PI / 2], [10, 0, -Math.PI / 2]]) {
    const yk = new THREE.Mesh(new THREE.SphereGeometry(4, 24, 12, 0, Math.PI, 0, Math.PI / 2), kursun);
    yk.position.set(x * 0.62, 11, z); yk.rotation.y = a; yk.castShadow = true;
    cami.add(yk);
  }
  const pencere = malzeme.plastik(0x1e2c3c, { puruz: 0.2, parlak: 0.6 });
  for (const yuz of [1, -1]) for (let i = 0; i < 5; i++) for (const y of [3, 7.5]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.2, 0.15), pencere);
    p.position.set(-8 + i * 4, y, yuz * 9.03);
    cami.add(p);
    const kemer = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.15, 16, 1, false, 0, Math.PI), pencere);
    kemer.rotation.set(Math.PI / 2, Math.PI / 2, 0);
    kemer.position.set(-8 + i * 4, y + 1.1, yuz * 9.03);
    cami.add(kemer);
  }
  cami.position.set(-14, 0, -12);
  scene.add(cami);

  // minare (eksen x = 0, z = 0)
  const minare = new THREE.Group();
  const tasM = dokuluMalzeme({ taban: "#dcd5c6", koyu: "#b8ad98", acik: "#eee9df", olcek: 6, benek: 0.12, uzama: [1, 4], tekrar: [2, 6] });
  const kaide = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.6, 5, 8), tasM);
  kaide.position.y = 2.5;
  const gov = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.75, 22, 16, 4), tasM);
  gov.position.y = 16;
  const serefe = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 1.8, 1.3, 16), tasM);
  serefe.position.y = 27.4;
  const korkuluk = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.07, 6, 32), malzeme.metal(0x6e6a63, { puruz: 0.5 }));
  korkuluk.rotation.x = Math.PI / 2; korkuluk.position.y = 29;
  minare.add(kaide, gov, serefe, korkuluk);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const dikme = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 4), malzeme.metal(0x6e6a63));
    dikme.position.set(Math.cos(a) * 2.6, 28.5, Math.sin(a) * 2.6);
    minare.add(dikme);
  }
  const ust = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 3, 16), tasM);
  ust.position.y = 29.6;
  const kulah = new THREE.Mesh(new THREE.ConeGeometry(1.85, 6.1, 16), kursun);
  kulah.position.y = 31.1 + 3.05;
  const alem = new THREE.Group();
  const altin = malzeme.metal(0xd8b25a, { puruz: 0.25 });
  for (const [y, rr] of [[37.35, 0.22], [37.7, 0.16]]) { const k = new THREE.Mesh(new THREE.SphereGeometry(rr, 12, 8), altin); k.position.y = y; alem.add(k); }
  const ay = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 6, 16, Math.PI * 1.3), altin);
  ay.position.y = MINARE.h - 0.1; ay.rotation.z = -Math.PI * 0.15;
  alem.add(ay);
  minare.add(ust, kulah, alem);
  minare.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
  scene.add(minare);

  // çevre: ağaçlar ve evler (uzakta)
  for (let i = 0; i < 14; i++) {
    const a = agac(r, 5 + r() * 4);
    a.position.set(-40 + r() * 110, 0, -24 - r() * 16);
    scene.add(a);
  }
  for (let i = 0; i < 9; i++) {
    const e = ev({ gen: 7 + r() * 4, der: 7, yuk: 6 + Math.round(r() * 2) * 3, duvar: [0xe8dcc8, 0xd9c4a3, 0xf0e6d6, 0xcbb59a][i % 4] });
    e.position.set(-60 + i * 16, 0, -48 - r() * 10);
    e.rotation.y = (r() - 0.5) * 0.3;
    scene.add(e);
  }
  // avlu çeşmesi (şadırvan) ve birkaç taş saksı
  const sadirvan = new THREE.Mesh(organiklestir(new THREE.CylinderGeometry(2.2, 2.4, 1, 12), { genlik: 0.04 }), tasM);
  sadirvan.position.set(-14, 0.5, 6); sadirvan.castShadow = true;
  scene.add(sadirvan);
  const sadCati = new THREE.Mesh(new THREE.ConeGeometry(3, 1.6, 12), kursun);
  sadCati.position.set(-14, 4.2, 6); sadCati.castShadow = true;
  scene.add(sadCati);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 6), tasM);
    s.position.set(-14 + Math.cos(a) * 2.6, 1.7, 6 + Math.sin(a) * 2.6);
    scene.add(s);
  }
}

export const minareAdimi = {
  baslik: "Minarenin boyu kaç metre?",
  cikti: "MAT.10.1.1-d",
  anlatim: `
    <p>Mahallenin camisinin minaresine çıkmadan boyunu ölçmek istiyorsun. Elinde bir <b>açıölçer (klinometre)</b> ve bir şerit metre var.</p>
    <p>Avluda <b>kendini sürükle</b> (ya da kaydırıcıyı kullan): minarenin eksenine yatay uzaklığın (d) ve minarenin tepesine bakış açın (α) değişir. Gözün yerden <b>1,6 m</b> yukarıda.</p>
    <p>Hangi trigonometrik oran <b>karşı dik kenarı</b> ve <b>komşu dik kenarı</b> birbirine bağlar? Ölçümünü yap, minarenin yüksekliğini hesapla.</p>`,
  gorev: "<b>İki farklı yerden</b> ölçüm kaydet ve minarenin yüksekliğini bul (±0,6 m).",
  ogretmen: "Programda ulaşılan oranların gerçek yaşam problemlerinde kullanılması ve trigonometrik oranlar gerektiren performans görevleri öneriliyor. Okul bahçesinde kâğıt ve iletki ile yapılmış basit bir klinometreyle aynı ölçüm yaptırılabilir. Araştırma ödevi için Uluğ Bey'in Semerkant rasathanesinde hazırlattığı yıldız cetvelindeki (Zîc) sinüs ve tanjant tabloları önerilebilir. Sahne temsilîdir; minare yüksekliği 38 m kabul edilmiştir.",
  kur(ctx) {
    const { h: HM, goz } = MINARE;
    const D = dunyaAc(ctx, { kameraKonum: [24, 13, 80], hedef: [21, 15, 0], arkaPlan: [0x7fb0dc, 0xdfe9f1], sis: [140, 420] });
    const { S } = D;
    avluKur(S);
    let d = 30;
    const aciOku = () => Math.round(bakisAcisi(HM, d) * 10) / 10;

    // gözlemci, klinometre, bakış çizgisi, şerit metre
    const sen = insan({ giysi: 0xd9822b });
    S.scene.add(sen);
    const klino = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 16, 1, false, 0, Math.PI), malzeme.plastik(0xf2c230));
    klino.rotation.x = Math.PI / 2;
    const klinoG = new THREE.Group();
    klinoG.add(klino);
    S.scene.add(klinoG);
    const bakis = cubuk([d, goz, 0], [0, HM, 0], { renk: 0xffe066, kalinlik: 0.07, opaklik: 0.9 });
    const serit3 = serit({ x: 0, z: 1.2 }, { x: d, z: 1.2 }, { renk: 0xf2c230, genislik: 0.12, y: 0.02 });
    S.scene.add(bakis, serit3);
    S.igne(new THREE.Vector3(0, HM, 0), "Minarenin tepesi<small>h = ?</small>", { renk: "#5ad38b", yon: "sag" });
    // iğneler bu iki noktaya bağlı; noktalar her güncellemede taşınır
    const gozNoktasi = new THREE.Object3D(), seritOrta = new THREE.Object3D();
    S.scene.add(gozNoktasi, seritOrta);
    const iA = S.igne(gozNoktasi, "", { renk: "#ffe066", yon: "sag" });
    const iD = S.igne(seritOrta, "", { renk: "#4fc3f7", yon: "alt" });

    const h = hud(ctx, [{ ad: "d", etiket: "Yatay uzaklık d" }, { ad: "a", etiket: "Bakış açısı α" }, { ad: "tan", etiket: "tan α" }]);
    // yüzen panel: ölçümün dik üçgen modeli
    const panel = yuzenPanel(ctx, "Ölçümün modeli (yandan görünüş)");
    const cizim = sekilCiz(panel, { alan: { xmin: -6, xmax: 64, ymin: -5, ymax: 42 }, izgara: 0 }, (c) => {
      const g = { x: d, y: goz }, ayak = { x: 0, y: goz }, tepe = { x: 0, y: HM };
      c.parca({ x: -6, y: 0 }, { x: 64, y: 0 }, { renk: RENK.soluk, kalinlik: 1.5 });
      c.parca({ x: 0, y: 0 }, tepe, { renk: "#d9d4c7", kalinlik: 5 });
      c.cokgen([g, ayak, tepe], { dolgu: "rgba(255,181,71,.12)", renk: null });
      c.parca(g, tepe, { renk: RENK.sari, kalinlik: 2, kesikli: "8 5" });
      c.parca(g, ayak, { renk: RENK.mavi, kalinlik: 2 });
      c.parca(ayak, tepe, { renk: RENK.yesil, kalinlik: 2.5 });
      c.dikAci(g, ayak, tepe, { boyut: 8 });
      c.aci(ayak, g, tepe, { etiket: "α", r: 26, etiketPay: 12 });
      c.parca({ x: d, y: 0 }, g, { renk: RENK.kenar, kalinlik: 2 });
      c.yazi({ x: d / 2, y: goz }, `d = ${d} m`, { dy: 12, renk: RENK.mavi, kalin: true, boyut: 13 });
      c.yazi({ x: 0, y: (HM + goz) / 2 }, "h − 1,6", { dx: 8, hiza: "start", renk: RENK.yesil, kalin: true, boyut: 13 });
      c.yazi({ x: d, y: 0 }, "1,6 m", { dx: 6, dy: -10, hiza: "start", renk: RENK.soluk, boyut: 11 });
    });

    const kay = ctx.kaydirici({ etiket: "Minareye uzaklığın (d)", min: DMIN, max: DMAX, adim: 1, deger: d, birim: "m", degisti: (v) => { d = v; guncelle(); } });
    D.tutamak("sen", {
      alan: sen, nesne: sen.children[2],
      kisit: (p) => ({ x: Math.min(DMAX, Math.max(DMIN, Math.round(p.x))), z: 0 }),
      degisti: (p) => { if (p.x !== d) { d = p.x; kay.deger = d; guncelle(); } },
    });
    function guncelle() {
      const a = aciOku();
      gozNoktasi.position.set(d, goz + 0.3, 0);
      seritOrta.position.set(d / 2, 0, 1.2);
      sen.position.set(d, 0, 0);
      klinoG.position.set(d - 0.25, goz, 0.12);
      klinoG.rotation.z = (a * Math.PI) / 180;
      bakis.userData.ayarla([d - 0.25, goz, 0], [0, HM, 0]);
      serit3.userData.ayarla({ x: 0, z: 1.2 }, { x: d, z: 1.2 });
      iA.metin(`α = ${sayi(a, 1)}°`);
      iD.metin(`d = ${d} m`);
      h.ayarla("d", `${d} m`); h.ayarla("a", `${sayi(a, 1)}°`); h.ayarla("tan", sayi(Math.tan(a * Math.PI / 180), 3));
      cizim.yenile();
    }
    guncelle();

    const olcumler = new Set();
    let cevaplandi = false;
    const liste = gorevListesi(ctx, ["İlk ölçümü kaydet", "Başka bir yerden ikinci ölçümü kaydet", "Minarenin yüksekliğini hesapla"]);
    ctx.dugmeler([{
      metin: "📐 Ölçümü kaydet", ana: true, tik: () => {
        if (olcumler.has(d)) return;
        olcumler.add(d);
        const a = aciOku();
        tablo.satirEkle([`${d} m`, `${sayi(a, 1)}°`, sayi(Math.tan(a * Math.PI / 180), 3)]);
        liste.isaretle(0); if (olcumler.size >= 2) liste.isaretle(1);
        bitir();
      },
    }]);
    const tablo = ctx.tablo(["d", "α", "tan α"]);
    ctx.sayiSorusu({
      etiket: "Minarenin yerden yüksekliği (h) kaç metre?", birim: "m",
      kontrol: (v) => {
        const a = aciOku(), t = Math.tan(a * Math.PI / 180);
        if (Math.abs(v - HM) <= 0.6) { cevaplandi = true; liste.isaretle(2); bitir(); return true; }
        if (Math.abs(v - d * t) <= 0.6) return "Göz yüksekliğini (1,6 m) eklemeyi unuttun: bakış çizgisi gözünden başlıyor.";
        if (Math.abs(v - (d / t + goz)) <= 0.8 || Math.abs(v - d / t) <= 0.8) return "tan α = karşı / komşu. Karşı dik kenar = komşu · tan α olmalı.";
        if (Math.abs(v - (d * Math.sin(a * Math.PI / 180) + goz)) <= 0.8 || Math.abs(v - (d * Math.cos(a * Math.PI / 180) + goz)) <= 0.8) return "sin ve cos hipotenüs içerir; burada bildiğin kenar komşu dik kenar (d).";
        return "h = d · tan α + 1,6 hesabını yeniden yap.";
      },
      dogruMesaj: "Doğru!",
    });
    const sonuc = ctx.not("");
    function bitir() {
      if (!cevaplandi) return;
      if (olcumler.size < 2) { sonuc.innerHTML = "<p>Doğru! Şimdi başka bir yerden ölçüm alıp aynı sonucu bulduğunu kontrol et.</p>"; return; }
      sonuc.innerHTML = `<p class="d-geri-bildirim dogru">Farklı uzaklıklardan aynı yüksekliği buldun: <b>h = d · tan α + 1,6 = ${HM} m</b>.</p>
        <p>Uzaklaştıkça α küçülür ama d · tan α çarpımı değişmez. Trigonometri, ulaşamadığın yükseklikleri ve uzaklıkları ölçmenin yoludur.</p>`;
      ctx.gorevTamam();
    }
  },
};
