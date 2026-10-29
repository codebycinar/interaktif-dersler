// 8. adım: Boğaz'ın iki yakası — teodolitle açı ölçüp sinüs ve kosinüs teoremleriyle karşı kıyıdaki uzaklıkları bulma.
// Sahne temsilîdir: kıyı biçimi, yapılar ve uzaklıklar gerçek ölçümler değildir. 1 birim = 10 m.
import { el, sayi } from "../../../../engine/ders.js";
import { sahne3dKur, yaziEtiketi, THREE } from "../../../../engine/sahne3d.js";
import { hud, gorevListesi, trigHesap, kisa } from "../ortak/yardim.js";
import { BOGAZ, tabanAcisi, acHesapla, cdHesapla, gercekUzaklik, tabanMetre } from "./model.js";

/** Tohumlu sözde rastgele sayı (sahne her açılışta aynı görünsün) */
function rastgele(tohum) {
  return () => {
    tohum |= 0; tohum = (tohum + 0x6d2b79f5) | 0;
    let t = Math.imul(tohum ^ (tohum >>> 15), 1 | tohum);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const K = (p, y = 0) => new THREE.Vector3(p.x, y, p.y); // harita (x, y) → sahne (x, yükseklik, z)
const KARA = 1.2; // kıyı yüksekliği

function sahneyiKur(kap) {
  const dar = kap.clientWidth < kap.clientHeight;
  const s = sahne3dKur(kap, { kameraKonum: dar ? [0, 82, 128] : [0, 62, 112], hedef: [-4, 0, -6], arkaPlan: 0x9cc3e0, sis: [180, 420] });
  const { scene } = s;
  const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });

  // deniz ve kıyılar
  const deniz = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), mat(0x1f5f86, { roughness: 0.3, metalness: 0.15 }));
  deniz.rotation.x = -Math.PI / 2;
  deniz.receiveShadow = true;
  scene.add(deniz);
  const kiyi = (z0, z1, renk) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(900, KARA, Math.abs(z1 - z0)), mat(renk));
    m.position.set(0, KARA / 2, (z0 + z1) / 2);
    m.receiveShadow = true;
    scene.add(m);
  };
  kiyi(34, 400, 0x6f8f4e);
  kiyi(-400, -40, 0x7b9a58);
  // yakın kıyıda sahil yolu
  const yol = new THREE.Mesh(new THREE.BoxGeometry(900, 0.06, 5), mat(0x8d8f93));
  yol.position.set(0, KARA + 0.03, 37);
  scene.add(yol);

  // karşı kıyıdaki yapılar
  const r = rastgele(12);
  const renkler = [0xe9e1d3, 0xd9c7a8, 0xc9b79b, 0xe6d6c0, 0xbfa58a, 0xf0ebe3];
  for (let i = 0; i < 70; i++) {
    const x = -150 + r() * 300, z = -48 - r() * 70;
    if (Math.hypot(x - BOGAZ.C.x, z - BOGAZ.C.y) < 9 || Math.hypot(x - BOGAZ.D.x, z - BOGAZ.D.y) < 9) continue;
    const y = 2 + r() * 6, g = 3 + r() * 4;
    const ev = new THREE.Mesh(new THREE.BoxGeometry(g, y, 3 + r() * 3), mat(renkler[i % renkler.length]));
    ev.position.set(x, KARA + y / 2, z);
    ev.castShadow = true;
    scene.add(ev);
    const cati = new THREE.Mesh(new THREE.ConeGeometry(g * 0.75, 1.6, 4), mat(0xa4553a));
    cati.position.set(x, KARA + y + 0.8, z);
    cati.rotation.y = Math.PI / 4;
    scene.add(cati);
  }
  // tepeler
  for (let i = 0; i < 9; i++) {
    const t = new THREE.Mesh(new THREE.SphereGeometry(40 + r() * 30, 20, 12), mat(0x5f7f45));
    t.scale.y = 0.35;
    t.position.set(-200 + i * 50, 0, -170 - r() * 40);
    scene.add(t);
  }
  // yakın kıyıda ağaçlar
  for (let i = 0; i < 40; i++) {
    const x = -150 + r() * 300, z = 46 + r() * 50;
    if (Math.abs(z - 40) < 7 && Math.abs(x) < 28) continue;
    const ag = new THREE.Mesh(new THREE.ConeGeometry(1.4, 4, 8), mat(0x2f5d34));
    ag.position.set(x, KARA + 2, z);
    ag.castShadow = true;
    scene.add(ag);
  }

  // C: saat kulesi
  const kule = new THREE.Group();
  const govde = new THREE.Mesh(new THREE.BoxGeometry(3.2, 13, 3.2), mat(0xe8dcc6));
  govde.position.y = 6.5;
  const tepe = new THREE.Mesh(new THREE.ConeGeometry(2.7, 4, 4), mat(0x5a6b7d, { metalness: 0.3 }));
  tepe.position.y = 15; tepe.rotation.y = Math.PI / 4;
  kule.add(govde, tepe);
  for (let i = 0; i < 4; i++) {
    const saat = new THREE.Mesh(new THREE.CircleGeometry(1, 24), mat(0xffffff, { emissive: 0x666666 }));
    const a = (i * Math.PI) / 2;
    saat.position.set(Math.sin(a) * 1.62, 10.5, Math.cos(a) * 1.62);
    saat.rotation.y = a;
    kule.add(saat);
  }
  kule.traverse((o) => { o.castShadow = true; });
  kule.position.copy(K(BOGAZ.C, KARA));
  scene.add(kule);

  // D: iskele
  const iskele = new THREE.Group();
  const kopru = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 10), mat(0x7a5a3c));
  kopru.position.set(0, 0.9, 6);
  const bina = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 3.5), mat(0xd9e3ea));
  bina.position.set(0, KARA + 1.5, 0);
  const catiD = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.4, 4.2), mat(0x2e6fa7));
  catiD.position.set(0, KARA + 3.2, 0);
  iskele.add(kopru, bina, catiD);
  iskele.position.copy(K(BOGAZ.D));
  scene.add(iskele);

  // birkaç vapur
  for (const [x, z, a] of [[-60, -8, 0.3], [40, 10, -0.2], [95, -18, 1.1]]) {
    const v = new THREE.Group();
    const tekne = new THREE.Mesh(new THREE.BoxGeometry(9, 1.4, 3), mat(0xf4f4f4));
    const ust = new THREE.Mesh(new THREE.BoxGeometry(5, 1.4, 2.4), mat(0xe2e2e2));
    ust.position.y = 1.4;
    const baca = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.6), mat(0x1d1d1d));
    baca.position.set(-0.5, 2.6, 0);
    v.add(tekne, ust, baca);
    v.position.set(x, 0.6, z);
    v.rotation.y = a;
    scene.add(v);
  }

  // A ve B istasyonları: üç ayaklı teodolit (görünür olsun diye büyütülmüş)
  const istasyonlar = {};
  for (const ad of ["A", "B"]) {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const ayak = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4), mat(0x3b3b3b));
      const a = (i * 2 * Math.PI) / 3;
      ayak.position.set(Math.cos(a) * 0.45, 1.1, Math.sin(a) * 0.45);
      ayak.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35);
      g.add(ayak);
    }
    const bas = new THREE.Group();
    bas.position.y = 2.4;
    const kutu = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.6), mat(0xf2c230));
    const durbun = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.4, 12), mat(0x222222));
    durbun.rotation.z = Math.PI / 2;
    durbun.position.set(0.6, 0.35, 0);
    // bakış ışını: istasyondan karşı kıyıya
    const isin = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 150, 6), new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.85 }));
    isin.rotation.z = Math.PI / 2;
    isin.position.x = 75;
    bas.add(kutu, durbun, isin);
    g.add(bas);
    // ölçülen açının yere çizilen yayı
    const yay = new THREE.Mesh(new THREE.RingGeometry(5, 6, 48, 1, 0, 1), new THREE.MeshBasicMaterial({ color: 0xffb547, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
    yay.rotation.x = -Math.PI / 2;
    yay.position.y = 0.08;
    g.add(yay);
    g.position.copy(K(BOGAZ[ad], KARA));
    const etk = yaziEtiketi(ad, { boyut: 3.2, renk: "#ffb547" });
    etk.position.set(0, 6, 0);
    g.add(etk);
    scene.add(g);
    istasyonlar[ad] = { g, bas, isin, yay };
  }
  // taban AB
  const taban = new THREE.Mesh(new THREE.BoxGeometry(40, 0.1, 0.35), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  taban.position.set(0, KARA + 0.06, 40);
  scene.add(taban);
  const tabanYazi = yaziEtiketi(`AB = ${sayi(tabanMetre(), 0)} m`, { boyut: 2.6 });
  tabanYazi.position.set(0, KARA + 2.5, 43);
  scene.add(tabanYazi);
  const hedefEtiketleri = {};
  for (const [ad, y] of [["C", 20], ["D", 7]]) {
    const e = yaziEtiketi(`${ad} · ${BOGAZ[ad].ad}`, { boyut: 3.4, renk: "#ffe066" });
    e.position.copy(K(BOGAZ[ad], y));
    scene.add(e);
    hedefEtiketleri[ad] = e;
  }
  return { ...s, istasyonlar, hedefEtiketleri };
}

function sahneyiKaldir(s, kap) {
  s.renderer.setAnimationLoop(null);
  s.kontrol.dispose();
  s.scene.traverse((o) => {
    o.geometry?.dispose();
    const m = o.material;
    for (const x of Array.isArray(m) ? m : m ? [m] : []) { x.map?.dispose(); x.dispose(); }
  });
  s.renderer.dispose();
  s.renderer.forceContextLoss();
  kap.remove();
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
  kur(ctx) {
    const T = ctx.sahne;
    T.sifirla();
    T.gizle(true);
    const kap = el("div", { style: "position:absolute;inset:0" });
    ctx.katman.append(kap);
    const s = sahneyiKur(kap);
    ctx.temizlik(() => sahneyiKaldir(s, kap));

    const h = hud(ctx, [{ ad: "ist", etiket: "İstasyon" }, { ad: "aci", etiket: "Teodolit açısı" }, { ad: "hedef", etiket: "Hedef" }]);
    let istasyon = "A";
    const acilar = { A: 40, B: 40 };
    const olcumler = {}; // "A-C": 72.0
    ctx.secenekler({
      etiket: "Teodolit", deger: "A",
      liste: [{ deger: "A", metin: "A istasyonu" }, { deger: "B", metin: "B istasyonu" }],
      degisti: (v) => { istasyon = v; kay.deger = acilar[v]; guncelle(); },
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
      ist.isin.material.color.set(kilit ? 0x5ad38b : 0xffe066);
      for (const [ad, e] of Object.entries(s.hedefEtiketleri)) e.material.color.set(ad === kilit ? 0x5ad38b : 0xffffff);
      h.ayarla("ist", istasyon); h.ayarla("aci", `${sayi(a, 2)}°`);
      h.ayarla("hedef", kilit ? `${BOGAZ[kilit].ad} ✓` : "—");
      if (kilit) kaydet(istasyon, kilit);
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
  },
};
