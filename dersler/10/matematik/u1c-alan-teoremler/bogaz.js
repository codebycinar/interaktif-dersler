// 8. adım: Boğaz'ın iki yakası — teodolitle açı ölçüp sinüs ve kosinüs teoremleriyle karşı kıyıdaki uzaklıkları bulma.
// Sahne temsilîdir: kıyı biçimi, yapılar ve uzaklıklar gerçek ölçümler değildir. 1 birim = 10 m.
import { el, sayi } from "../../../../engine/ders.js";
import { sekilCiz, RENK } from "../ortak/tahta.js";
import { hud, gorevListesi, trigHesap } from "../ortak/yardim.js";
import { dunyaAc, yuzenPanel, dokuluMalzeme, agac, ev, serit, THREE, malzeme, organiklestir, yuzeyDokusu, rastgele } from "../ortak/dunya3b.js";
import { BOGAZ, tabanAcisi, bakisYonu, acHesapla, cdHesapla, gercekUzaklik, tabanMetre } from "./model.js";
import { gecis, durdurHepsi } from "../ortak/anlat.js";

const K = (p, y = 0) => new THREE.Vector3(p.x, y, p.y); // harita (x, y) → sahne (x, yükseklik, z)
const KARA = 1.2; // kıyı yüksekliği
const ISIN_BOY = 150;

function sahneyiKur(S) {
  const { scene } = S;
  const r = rastgele(12);

  // deniz: dalga dokusu yavaşça kayar
  const dalga = yuzeyDokusu({ taban: "#2a6e96", koyu: "#1b5273", acik: "#4a93bb", olcek: 22, benek: 0.35, uzama: [1, 5], tohum: 8 });
  for (const t of [dalga.renk, dalga.puruz]) t.repeat.set(40, 40);
  const deniz = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ map: dalga.renk, bumpMap: dalga.puruz, bumpScale: 0.5, roughness: 0.2, metalness: 0.1 }));
  deniz.rotation.x = -Math.PI / 2;
  deniz.receiveShadow = true;
  scene.add(deniz);
  S.herKare((dt) => { dalga.renk.offset.x += dt * 0.004; dalga.puruz.offset.x += dt * 0.004; dalga.puruz.offset.y += dt * 0.002; });

  // kıyılar: taş rıhtım + çim; yakın kıyıda sahil yolu
  const cim = (tohum) => dokuluMalzeme({ taban: "#6c8c4a", koyu: "#4f6d34", acik: "#8aa862", olcek: 14, benek: 0.3, tekrar: [60, 24], tohum });
  const rihtim = dokuluMalzeme({ taban: "#b5ada0", koyu: "#8e877b", acik: "#cfc9be", olcek: 10, benek: 0.2, uzama: [3, 1], tekrar: [90, 1] });
  const kiyi = (z0, z1, kenarZ, tohum) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(900, KARA, Math.abs(z1 - z0)), [rihtim, rihtim, cim(tohum), rihtim, rihtim, rihtim]);
    m.position.set(0, KARA / 2, (z0 + z1) / 2);
    m.receiveShadow = true;
    scene.add(m);
    const kenar = new THREE.Mesh(new THREE.BoxGeometry(900, 0.25, 1.6), rihtim);
    kenar.position.set(0, KARA + 0.12, kenarZ);
    kenar.receiveShadow = true;
    scene.add(kenar);
  };
  kiyi(34, 400, 34.8, 3);
  kiyi(-400, -40, -40.8, 5);
  const asfalt = dokuluMalzeme({ taban: "#55585e", koyu: "#45484d", acik: "#6a6d72", olcek: 30, benek: 0.4, tekrar: [120, 1] });
  const yol = new THREE.Mesh(new THREE.BoxGeometry(900, 0.06, 6), asfalt);
  yol.position.set(0, KARA + 0.03, 45);
  yol.receiveShadow = true;
  scene.add(yol);

  // karşı kıyı: tepeler, evler, ağaçlar
  const tepeMalz = dokuluMalzeme({ taban: "#5e7d43", koyu: "#46622f", acik: "#7d9a58", olcek: 8, benek: 0.4, tekrar: [3, 2], tohum: 9 });
  for (let i = 0; i < 9; i++) {
    const t = new THREE.Mesh(organiklestir(new THREE.IcosahedronGeometry(45 + r() * 30, 3), { genlik: 6, olcek: 0.04, tohum: i + 2 }), tepeMalz);
    t.scale.y = 0.32;
    t.position.set(-210 + i * 52, 0, -175 - r() * 40);
    t.receiveShadow = true;
    scene.add(t);
  }
  const duvarlar = [0xe9e1d3, 0xd9c7a8, 0xc9b79b, 0xe6d6c0, 0xd4b8a0, 0xf0ebe3, 0xbfc9cf];
  for (let i = 0; i < 80; i++) {
    const x = -160 + r() * 320, z = -50 - r() * 75;
    if (Math.hypot(x - BOGAZ.C.x, z - BOGAZ.C.y) < 10 || Math.hypot(x - BOGAZ.D.x, z - BOGAZ.D.y) < 10) continue;
    const e = ev({ gen: 5 + r() * 4, der: 4 + r() * 3, yuk: 3 * (1 + Math.floor(r() * 3)), duvar: duvarlar[i % duvarlar.length] });
    e.position.set(x, KARA, z);
    e.rotation.y = (r() - 0.5) * 0.4;
    scene.add(e);
  }
  for (let i = 0; i < 40; i++) {
    const t = agac(r, 4 + r() * 3);
    t.position.set(-160 + r() * 320, KARA, -48 - r() * 80);
    scene.add(t);
  }
  for (let i = 0; i < 36; i++) {
    const x = -150 + r() * 300, z = 52 + r() * 45;
    if (Math.abs(x) < 30 && z < 62) continue;
    const t = agac(r, 4 + r() * 3);
    t.position.set(x, KARA, z);
    scene.add(t);
  }

  // C: saat kulesi
  const tas = dokuluMalzeme({ taban: "#e3d8c3", koyu: "#bfb29b", acik: "#f0e9dc", olcek: 6, benek: 0.15, uzama: [1, 3], tekrar: [1, 3] });
  const kule = new THREE.Group();
  const govde = new THREE.Mesh(new THREE.BoxGeometry(3.2, 13, 3.2), tas);
  govde.position.y = 6.5;
  const tepe = new THREE.Mesh(new THREE.ConeGeometry(2.7, 4, 4), malzeme.metal(0x5a6b7d, { puruz: 0.45 }));
  tepe.position.y = 15; tepe.rotation.y = Math.PI / 4;
  kule.add(govde, tepe);
  for (let i = 0; i < 4; i++) {
    const saat = new THREE.Mesh(new THREE.CircleGeometry(1, 24), malzeme.plastik(0xf6f2e8, { puruz: 0.3 }));
    const a = (i * Math.PI) / 2;
    saat.position.set(Math.sin(a) * 1.62, 10.5, Math.cos(a) * 1.62);
    saat.rotation.y = a;
    kule.add(saat);
  }
  kule.traverse((o) => { o.castShadow = true; });
  kule.position.copy(K(BOGAZ.C, KARA));
  scene.add(kule);

  // D: iskele
  const ahsap = dokuluMalzeme({ taban: "#7a5a3c", koyu: "#5a412b", acik: "#987454", olcek: 4, lif: 0.6, lifSiklik: 30, tekrar: [1, 3] });
  const iskele = new THREE.Group();
  const kopru = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 10), ahsap);
  kopru.position.set(0, 0.9, 6);
  const bina = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 3.5), malzeme.mat(0xdfe6ea));
  bina.position.set(0, KARA + 1.5, 0);
  const catiD = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.4, 4.2), malzeme.metal(0x2e6fa7, { puruz: 0.5 }));
  catiD.position.set(0, KARA + 3.2, 0);
  iskele.add(kopru, bina, catiD);
  iskele.traverse((o) => { o.castShadow = true; });
  iskele.position.copy(K(BOGAZ.D));
  scene.add(iskele);

  // vapurlar
  for (const [x, z, a] of [[-60, -8, 0.3], [40, 10, -0.2], [95, -18, 1.1]]) {
    const v = new THREE.Group();
    const tekne = new THREE.Mesh(new THREE.BoxGeometry(9, 1.4, 3), malzeme.plastik(0xf4f4f4));
    const bant = new THREE.Mesh(new THREE.BoxGeometry(9.05, 0.3, 3.05), malzeme.plastik(0x1f2a36));
    bant.position.y = -0.4;
    const ust = new THREE.Mesh(new THREE.BoxGeometry(5, 1.4, 2.4), malzeme.plastik(0xe8e8e8));
    ust.position.y = 1.4;
    const baca = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.6), malzeme.plastik(0x1d1d1d));
    baca.position.set(-0.5, 2.6, 0);
    const bacaBant = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.35), malzeme.plastik(0xc0392b));
    bacaBant.position.set(-0.5, 3, 0);
    v.add(tekne, bant, ust, baca, bacaBant);
    v.traverse((o) => { o.castShadow = true; });
    v.position.set(x, 0.6, z);
    v.rotation.y = a;
    scene.add(v);
  }

  // A ve B istasyonları: üç ayaklı teodolit (görünür olsun diye büyütülmüş)
  const istasyonlar = {};
  for (const ad of ["A", "B"]) {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const ayak = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4), malzeme.metal(0x3b3b3b, { puruz: 0.5 }));
      const a = (i * 2 * Math.PI) / 3;
      ayak.position.set(Math.cos(a) * 0.45, 1.1, Math.sin(a) * 0.45);
      ayak.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35);
      g.add(ayak);
    }
    const bas = new THREE.Group();
    bas.position.y = 2.4;
    const kutu = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.6), malzeme.plastik(0xf2c230));
    const durbun = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.4, 12), malzeme.plastik(0x222222, { puruz: 0.3 }));
    durbun.rotation.z = Math.PI / 2;
    durbun.position.set(0.6, 0.35, 0);
    // bakış ışını: istasyondan karşı kıyıya
    const isinMalz = malzeme.isik(0xffe066, 1.3);
    isinMalz.transparent = true; isinMalz.opacity = 0.85;
    const isin = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, ISIN_BOY, 6), isinMalz);
    isin.rotation.z = Math.PI / 2;
    isin.position.x = ISIN_BOY / 2;
    bas.add(kutu, durbun, isin);
    g.add(bas);
    g.traverse((o) => { if (o !== isin) o.castShadow = true; });
    // ölçülen açının yere çizilen yayı
    const yayMalz = malzeme.isik(0xffb547, 0.9);
    yayMalz.transparent = true; yayMalz.opacity = 0.85; yayMalz.side = THREE.DoubleSide;
    const yay = new THREE.Mesh(new THREE.RingGeometry(5, 6, 48, 1, 0, 1), yayMalz);
    yay.rotation.x = -Math.PI / 2;
    yay.position.y = 0.08;
    g.add(yay);
    g.position.copy(K(BOGAZ[ad], KARA));
    scene.add(g);
    istasyonlar[ad] = { g, bas, isin, yay };
    S.igne(K(BOGAZ[ad], KARA + 4.2), ad, { renk: "#ffb547", yon: "ust" });
  }
  // taban AB
  scene.add(serit({ x: BOGAZ.A.x, z: BOGAZ.A.y }, { x: BOGAZ.B.x, z: BOGAZ.B.y }, { renk: 0xffffff, genislik: 0.4, y: KARA + 0.05 }));
  S.igne(new THREE.Vector3(0, KARA + 0.2, BOGAZ.A.y), `AB = ${sayi(tabanMetre(), 0)} m`, { renk: "#e8edf3", yon: "ust" });
  const hedefIgneleri = {};
  for (const [ad, y] of [["C", 18], ["D", 6]]) hedefIgneleri[ad] = S.igne(K(BOGAZ[ad], y), `${ad} · ${BOGAZ[ad].ad}`, { renk: "#ffe066", yon: "ust" });
  return { istasyonlar, hedefIgneleri };
}

export const bogazAdimi = {
  baslik: "Boğaz'ın iki yakası: karşı kıyıya uzaklık",
  cikti: "MAT.10.1.4-b",
  anlatim: `
    <p>Bir harita ekibi denizi geçmeden karşı kıyıdaki <b>saat kulesine</b> (C) ve <b>iskeleye</b> (D) olan uzaklıkları bulmak istiyor. Yakın kıyıda aralarında <b>400 m</b> olan A ve B noktalarına teodolit (açı ölçer) kurdular.</p>
    <p>Teodolitin dürbününü çevirerek hedeflere olan açıları ölç (taban AB'den itibaren). Sonra ispatladığın teoremleri bu <b>yeni duruma uyarla</b>.</p>
    <p><small>Sahne temsilîdir; kıyılar, yapılar ve uzaklıklar gerçek ölçümler değildir.</small></p>`,
  gorev: "Üç açıyı ölç, sinüs teoremiyle AC'yi ve kosinüs teoremiyle CD'yi bul.",
  ogretmen: "Programda doğrulanan teoremlerin gerçek yaşam problemlerinde kullanılması (MAB2) ve ispat adımlarının yeni durumlara uyarlanması bekleniyor. Üçgenleme (nirengi) yöntemi haritacılıkta kullanılır. Öğrencilere ölçülen açıyı 0,1° yuvarlamanın sonuca etkisini sorun; okul bahçesinde iki nokta arasında benzer bir ölçüm yaptırılabilir.",
  anlat: [
    { s: "Karşı kıyıdaki <b>saat kulesine</b> (C) olan uzaklığı, denizi hiç geçmeden bulmak istiyoruz.", yap: (api) => api.aci(40, 0.01) },
    { s: "Yakın kıyıda aralarında <b>400 m</b> olan A ve B noktalarına birer teodolit (açı ölçer) kurduk." },
    { s: "A'daki teodolitin dürbününü çevirelim. Sarı ışın baktığı yönü gösteriyor. İzle…", yap: (api) => api.aci(56) },
    { s: "Işın bir hedefin tam üstüne gelince <b>yeşile</b> döner ve açı tabloya yazılır." },
    { s: "A'dan ve B'den C'ye açıları ölçersek ABC üçgeninde <b>bir kenar ve iki açı</b> bilinir." },
    { soru: "Bir kenarı ve iki açısı bilinen üçgende hangi teorem işe yarar?", secenekler: ["Sinüs teoremi", "Kosinüs teoremi", "Pisagor teoremi"], dogru: 0,
      aciklama: "Sinüs teoremi kenarları karşılarındaki açılara bağlar.", ipucu: "Hangi teoremde kenar ve karşısındaki açı birlikte geçiyor?" },
    { soru: "Bir üçgenin iki açısı 70° ve 80° ise üçüncü açı kaç derece?", secenekler: ["30°", "90°", "150°"], dogru: 0,
      aciklama: "180° − 70° − 80° = 30°.", ipucu: "İç açıların toplamı 180°." },
    { s: "AC'nin karşısındaki açı <b>B</b>, AB'nin karşısındaki açı <b>C</b>." },
    { formul: [["AC / sin B"], ["="], ["AB / sin C"]], s: "Buradan AC = AB · sin B ÷ sin C.", oku: "A C bölü sinüs B eşittir A B bölü sinüs C." },
    { s: "CD için iki kenar (AC ve AD) ile aradaki açı bilinecek: bu kez <b>kosinüs teoremi</b>." },
    { s: "Şimdi sen: üç açıyı ölç ve iki uzaklığı hesapla. Hesap makinesi panelde." },
  ],
  anlatBitti: (api) => api.sifirla(),
  kur(ctx) {
    const D = dunyaAc(ctx, { kameraKonum: [-14, 96, 124], hedef: [-4, 0, 14], arkaPlan: [0x8dbbe0, 0xe2ecf3], sis: [220, 520] });
    const dar = D.kap.clientWidth < 600;
    // istasyon değişince kamera o istasyonun arkasına doğru kayar
    const kamera = (ist) => {
      const y = ist === "A" ? -1 : 1;
      return dar ? { konum: [y * 6, 128, 150], hedef: [y * 2, 0, 14] } : { konum: [y * 14, 96, 124], hedef: [y * 4, 0, 14] };
    };
    D.S.kameraKoy(kamera("A"));
    const s = sahneyiKur(D.S);

    const h = hud(ctx, [{ ad: "ist", etiket: "İstasyon" }, { ad: "aci", etiket: "Teodolit açısı" }, { ad: "hedef", etiket: "Hedef" }]);
    let istasyon = "A";
    const acilar = { A: 40, B: 40 };
    const olcumler = {}; // "A-C": 72.0

    // yüzen panel: ölçümlerin kuşbakışı çizimi (karşı kıyı yukarıda: harita y'si ters çevrilir)
    const ust = (p) => ({ x: p.x, y: -p.y });
    const panel = yuzenPanel(ctx, "Kuşbakışı çizim", { konum: "sag-alt" });
    const cizim = sekilCiz(panel, { alan: { xmin: -42, xmax: 34, ymin: -46, ymax: 52 }, izgara: 0 }, (c) => {
      const [A, B, C, Dn] = [BOGAZ.A, BOGAZ.B, BOGAZ.C, BOGAZ.D].map(ust);
      c.cokgen([{ x: -80, y: -34 }, { x: 80, y: -34 }, { x: 80, y: 40 }, { x: -80, y: 40 }], { dolgu: "rgba(40,110,160,.3)", renk: null });
      if (olcumler["A-C"] != null && olcumler["B-C"] != null) c.cokgen([A, B, C], { dolgu: "rgba(255,181,71,.2)", renk: null });
      if (olcumler["A-C"] != null && olcumler["A-D"] != null) c.cokgen([A, C, Dn], { dolgu: "rgba(184,156,255,.22)", renk: null });
      for (const k of Object.keys(olcumler)) {
        const [i, hd] = k.split("-");
        c.parca(ust(BOGAZ[i]), ust(BOGAZ[hd]), { renk: RENK.yesil, kalinlik: 1.6 });
      }
      const S0 = BOGAZ[istasyon], y = bakisYonu(istasyon, acilar[istasyon]);
      c.parca(ust(S0), ust({ x: S0.x + y.x * 110, y: S0.y + y.y * 110 }), { renk: RENK.sari, kalinlik: 1.6, kesikli: "5 4" });
      c.parca(A, B, { renk: "#ffffff", kalinlik: 2 });
      for (const [P, ad] of [[A, "A"], [B, "B"], [C, "C"], [Dn, "D"]]) {
        const yakin = ad === "A" || ad === "B";
        c.nokta(P, { renk: yakin ? "#ffb547" : "#ffe066", r: 4 });
        c.yazi(P, ad, { dy: yakin ? 14 : -10, renk: "#e8edf3", kalin: true, boyut: 12 });
      }
    });
    ctx.secenekler({
      etiket: "Teodolit", deger: "A",
      liste: [{ deger: "A", metin: "A istasyonu" }, { deger: "B", metin: "B istasyonu" }],
      degisti: (v) => { istasyon = v; kay.deger = acilar[v]; D.S.kameraGit({ ...kamera(v), sure: 1 }); guncelle(); },
    });
    const kay = ctx.kaydirici({ etiket: "Dürbünü çevir (AB'den itibaren)", min: 0, max: 180, adim: 0.05, deger: 40, birim: "°", ondalik: 2, degisti: (v) => { acilar[istasyon] = v; guncelle(); } });
    ctx.dugmeler([-1, -0.1, 0.1, 1].map((d) => ({
      metin: `${d > 0 ? "+" : "−"}${sayi(Math.abs(d), Math.abs(d) < 1 ? 1 : 0)}°`,
      tik: () => { acilar[istasyon] = Math.min(180, Math.max(0, Math.round((acilar[istasyon] + d) * 100) / 100)); kay.deger = acilar[istasyon]; guncelle(); },
    })));
    const tablo = ctx.tablo(["İstasyon", "Hedef", "Ölçülen açı"]);
    const liste = gorevListesi(ctx, ["A'dan saat kulesine (C) açıyı ölç", "B'den saat kulesine (C) açıyı ölç", "A'dan iskeleye (D) açıyı ölç", "AC'yi sinüs teoremiyle bul", "CD'yi kosinüs teoremiyle bul"]);
    const soruKap = el("div");
    ctx.kontroller.append(soruKap);
    trigHesap(ctx);
    const sonuc = ctx.not("");

    let acSoru = false, cdSoru = false, bulunanAC = null;
    function guncelle() {
      const a = acilar[istasyon], ist = s.istasyonlar[istasyon];
      const don = istasyon === "A" ? (a * Math.PI) / 180 : Math.PI - (a * Math.PI) / 180;
      ist.bas.rotation.y = don;
      ist.yay.geometry.dispose();
      ist.yay.geometry = new THREE.RingGeometry(5, 6, 48, 1, istasyon === "A" ? 0 : Math.PI - (a * Math.PI) / 180, Math.max(0.001, (a * Math.PI) / 180));
      let kilit = null;
      for (const hd of ["C", "D"]) if (Math.abs(a - tabanAcisi(istasyon, hd)) <= BOGAZ.kilit) kilit = hd;
      const renk = kilit ? 0x5ad38b : 0xffe066;
      ist.isin.material.color.set(renk); ist.isin.material.emissive.set(renk);
      for (const [ad, e] of Object.entries(s.hedefIgneleri)) e.el.style.setProperty("--renk", ad === kilit ? "#5ad38b" : "#ffe066");
      h.ayarla("ist", istasyon); h.ayarla("aci", `${sayi(a, 2)}°`);
      h.ayarla("hedef", kilit ? `${BOGAZ[kilit].ad} ✓` : "—");
      if (kilit) kaydet(istasyon, kilit);
      cizim.yenile();
    }
    function kaydet(ist, hd) {
      const anahtar = `${ist}-${hd}`;
      if (olcumler[anahtar] != null) return;
      olcumler[anahtar] = Math.round(tabanAcisi(ist, hd) * 10) / 10;
      tablo.satirEkle([ist, `${hd} (${BOGAZ[hd].ad})`, `${sayi(olcumler[anahtar], 1)}°`]);
      const sira = { "A-C": 0, "B-C": 1, "A-D": 2 }[anahtar];
      if (sira == null) return;
      liste.isaretle(sira);
      sorular();
    }
    function sorular() {
      const A = olcumler["A-C"], B = olcumler["B-C"], D = olcumler["A-D"];
      if (!acSoru && A != null && B != null) {
        acSoru = true;
        const C = Math.round((180 - A - B) * 10) / 10;
        soruKap.append(ctx.sayiSorusu({
          etiket: `ABC üçgeninde AB = 400 m, m(A) = ${sayi(A, 1)}°, m(B) = ${sayi(B, 1)}° ölçüldü; öyleyse m(C) = ${sayi(C, 1)}°. Sinüs teoremiyle <b>AC</b> kaç metredir?`,
          birim: "m",
          kontrol: (v) => {
            const dogru = gercekUzaklik("A", "C");
            if (Math.abs(v - dogru) / dogru <= 0.015) { bulunanAC = v; liste.isaretle(3); sorular(); bitir(); return true; }
            const bc = gercekUzaklik("B", "C");
            if (Math.abs(v - bc) / bc <= 0.015) return "Bu BC'nin uzunluğu. AC'nin karşısındaki açı B'dir: AC / sin B = AB / sin C.";
            return "AB'nin karşısındaki açı C'dir: AC = AB · sin B / sin C.";
          },
          dogruMesaj: `Doğru! AC = 400 · sin ${sayi(B, 1)}° / sin ${sayi(C, 1)}° ≈ ${sayi(acHesapla(A, B), 0)} m.`,
        }).el);
      }
      if (!cdSoru && bulunanAC != null && D != null) {
        cdSoru = true;
        const fark = Math.round((D - A) * 10) / 10;
        soruKap.append(ctx.sayiSorusu({
          etiket: `Lazer uzaklık ölçerle AD = ${BOGAZ.AD_metre} m bulundu. m(CAD) = ${sayi(D, 1)}° − ${sayi(A, 1)}° = ${sayi(fark, 1)}°. Kosinüs teoremiyle <b>CD</b> kaç metredir?`,
          birim: "m",
          kontrol: (v) => {
            const dogru = gercekUzaklik("C", "D");
            if (Math.abs(v - dogru) / dogru <= 0.02) { liste.isaretle(4); bitir(); return true; }
            return "CD² = AC² + AD² − 2 · AC · AD · cos(CAD). Aradaki açı, iki ölçümün farkıdır.";
          },
          dogruMesaj: `Doğru! CD² = AC² + AD² − 2·AC·AD·cos ${sayi(fark, 1)}° → CD ≈ ${sayi(cdHesapla(bulunanAC, BOGAZ.AD_metre, fark), 0)} m.`,
        }).el);
      }
    }
    function bitir() {
      if (!liste.hepsi() || ctx.gorevTamamMi()) return;
      sonuc.innerHTML = `<p class="d-geri-bildirim dogru">Karşı kıyıya hiç gitmeden iki uzaklığı buldun!</p>
        <p>Sinüs teoremi için <b>bir kenar + iki açı</b>, kosinüs teoremi için <b>iki kenar + aradaki açı</b> yetti. Haritacılar bu yönteme <b>üçgenleme</b> der.</p>`;
      ctx.gorevTamam();
    }
    guncelle();
    return {
      // anlatım: A istasyonunun dürbününü çevirir (hedeflerin açılarından uzak tutulur, ölçüm kaydedilmez)
      aci(v, sure = 1.4) { const a0 = acilar.A; return gecis(acilar, sure, (k) => { acilar.A = Math.round((a0 + (v - a0) * k) * 100) / 100; kay.deger = acilar.A; guncelle(); }); },
      sifirla() { durdurHepsi(); acilar.A = 40; kay.deger = 40; guncelle(); },
    };
  },
};
