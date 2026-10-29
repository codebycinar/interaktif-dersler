// Tek ve kalıcı 3B dünya: çayır, hücre içi, laboratuvar masası ve sera. Adımlar istasyonlar arasında gezinir.
import { sahne3dKur, THREE } from "../../../../engine/sahne3d.js";
import { cayirKur } from "./cayir.js";
import { hucreKur } from "./hucre.js";
import { labKur } from "./lab.js";
import { seraKur } from "./sera.js";

const HUCRE_GOK = ["#163451", "#050b14"], LAB_GOK = ["#2b3038", "#14171c"];

export function biyoSahnesi(kap) {
  const S = sahne3dKur(kap, { kameraKonum: [0.6, 1.55, 8.6], hedef: [0, 0.55, -0.5], arkaPlan: ["#5d97d1", "#d7e6f1"], sis: [30, 140] });
  const { scene, camera, kontrol, gunes, gok } = S;
  const sisCayir = scene.fog, sisHucre = new THREE.Fog("#050b14", 30, 95), sisSera = new THREE.Fog("#d7e6f1", 40, 170);
  // laboratuvarda da (etkisiz) sis: sis açılıp kapanınca tüm gölgelendiriciler yeniden derlenmesin
  const sisLab = new THREE.Fog("#14171c", 500, 1000);

  const cayir = cayirKur(S), hucre = hucreKur(S), lab = labKur(S), sera = seraKur(S);
  const ORTAM = { cayir, hucre, lab, sera };
  for (const o of Object.values(ORTAM)) scene.add(o.grup);
  // Tüm ortamların gölgelendiricilerini baştan derle: ilk geçişte kare takılmasın
  try { S.renderer.compile(scene, camera); } catch (e) { console.warn(e); }
  for (const o of Object.values(ORTAM)) o.grup.visible = false;
  /* Gizli ortamın ışıkları sahneden düşerse ışık sayısı değişir ve tüm gölgelendiriciler yeniden
     derlenir (geçişte saniyelerce takılma). Bu yüzden ışıklar sönük biçimde sahnede park edilir. */
  const park = new THREE.Group(); scene.add(park);
  const ortamIsiklari = {};
  for (const [ad, o] of Object.entries(ORTAM)) {
    ortamIsiklari[ad] = [];
    o.grup.traverse((n) => { if (n.isLight) ortamIsiklari[ad].push({ isik: n, ebeveyn: n.parent, guc: n.intensity }); });
  }
  function isiklariTasi(ad, gorunur) {
    for (const k of ortamIsiklari[ad]) {
      if (gorunur && k.isik.parent === park) { k.ebeveyn.attach(k.isik); k.isik.intensity = k.guc; }
      if (!gorunur && k.isik.parent !== park) { k.guc = k.isik.intensity; park.attach(k.isik); k.isik.intensity = 0; }
    }
  }
  for (const ad of Object.keys(ORTAM)) isiklariTasi(ad, false);

  // Ortamlar arası geçişte kısa karartma
  const perde = document.createElement("div");
  perde.className = "bio-perde";
  kap.insertBefore(perde, S.renderer.domElement.nextSibling);

  function golgeKutusu(b) {
    const c = gunes.shadow.camera;
    c.left = -b; c.right = b; c.top = b; c.bottom = -b; c.near = 0.5; c.far = 120;
    c.updateProjectionMatrix();
  }
  /** Ortamın ışığı, arka planı ve sisi; x: laboratuvarda etkin istasyonun konumu */
  function ortamIsigi(ad, x = 0) {
    if (ad === "cayir") { scene.fog = sisCayir; golgeKutusu(cayir.golgeKutusu); }
    if (ad === "hucre") {
      scene.fog = sisHucre; S.arkaPlan(HUCRE_GOK);
      gunes.intensity = 1.5; gunes.position.set(10, 22, 16); gunes.target.position.set(0, 0, 0);
      gok.intensity = 0.45; scene.environmentIntensity = 0.75;
    }
    if (ad === "lab") {
      scene.fog = sisLab; S.arkaPlan(LAB_GOK);
      gunes.position.set(x + 7, 20, 13); gunes.target.position.set(x, 0, 0); golgeKutusu(8);
      labIsik(1);
    }
    if (ad === "sera") { scene.fog = sisSera; golgeKutusu(sera.golgeKutusu); }
  }
  function labIsik(k) {
    gunes.intensity = 0.15 + 2.1 * k; gok.intensity = 0.06 + 0.5 * k; scene.environmentIntensity = 0.05 + 0.75 * k;
    S.arkaPlan(k > 0.5 ? LAB_GOK : ["#0b0d11", "#050608"]);
  }

  /* İstasyonlar: ortam, kamera görünümü, giriş/çıkış */
  const yaklas = (g, k = 1.45) => ({ konum: g.hedef.map((h, i) => h + (g.konum[i] - h) * k), hedef: g.hedef });
  const IST = {
    cayir: { ortam: "cayir", gorunum: cayir.gorunum, gir: () => cayir.gir(), cik: () => cayir.cik() },
    kartlar: { ortam: "cayir", gorunum: { konum: [3, 1.7, 11], hedef: [0, 2.4, -8] }, donme: 0.35, gir: () => cayir.gir({ igne: false }), cik: () => cayir.cik() },
    sinav: { ortam: "cayir", gorunum: { konum: [-4, 1.9, 10.5], hedef: [0, 2.0, -7] }, donme: 0.25, gir: () => cayir.gir({ igne: false }), cik: () => cayir.cik() },
    atp: {
      ortam: "hucre", gorunum: { konum: [0, 1.8, 29], hedef: [0, 0.2, 0] }, giris: { konum: [16, 14, 60], hedef: [0, 0, 0] }, sure: 0.85,
      gir: () => { hucre.sec("atp"); hucre.atp.igneleriKur(); },
    },
    kloroplast: { ortam: "hucre", gorunum: { konum: [3, 7, 17.5], hedef: [0, 0, 0] }, gir: () => { hucre.sec("kloroplast"); hucre.kp.igneleriKur(null); } },
    kanit: { ortam: "hucre", gorunum: { konum: [0, 8.4, 24.5], hedef: [0, 6.4, 0] }, gir: () => hucre.sec("kanit") },
    engelmann: { ortam: "lab", x: -10, gorunum: lab.engelmann.gorunum, gir: () => { lab.sec("engelmann"); lab.engelmann.gir(); }, cik: () => lab.engelmann.cik() },
    fanus: { ortam: "lab", x: 0, gorunum: lab.fanus.gorunum, gir: () => { lab.sec("fanus"); lab.fanus.gir(); }, cik: () => { lab.fanus.cik(); labIsik(1); } },
    kabarcik: { ortam: "lab", x: 10, gorunum: lab.kabarcik.gorunum, gir: () => { lab.sec("kabarcik"); lab.kabarcik.gir(); }, cik: () => lab.kabarcik.cik() },
    sera: { ortam: "sera", gorunum: sera.gorunum, gir: () => sera.gir(), cik: () => sera.cik() },
  };

  let simdiki = null, ortam = null;
  S.herKare((dt) => {
    if (ortam === "cayir") cayir.kare(dt);
    if (ortam === "hucre") hucre.kare(dt);
    if (ortam === "lab") lab.kare(dt);
  });

  /** İstasyona geç. Aynı ortamda kamera süzülür; farklı ortamda kısa karartmayla geçilir. */
  function istasyon(ad) {
    const ist = IST[ad];
    if (simdiki) { IST[simdiki].cik?.(); hucre.atp.igneleriKaldir(); hucre.kp.igneleriKaldir(); }
    const eskiOrtam = ortam;
    if (ist.ortam !== ortam) {
      for (const [k, o] of Object.entries(ORTAM)) { o.grup.visible = k === ist.ortam; isiklariTasi(k, k === ist.ortam); }
      ortam = ist.ortam;
    }
    if (ist.ortam !== "lab") lab.sec(null);
    ortamIsigi(ortam, ist.x);
    simdiki = ad;
    ist.gir?.();
    kontrol.autoRotate = !!ist.donme; kontrol.autoRotateSpeed = ist.donme || 0;
    kontrol.maxPolarAngle = ortam === "hucre" ? Math.PI : Math.PI * 0.49;
    kontrol.minDistance = ortam === "hucre" ? 4 : 1.5;
    kontrol.maxDistance = ortam === "hucre" ? 60 : ortam === "lab" ? 22 : 40;
    if (eskiOrtam === null) { S.kameraKoy(ist.giris || ist.gorunum); return ist.giris ? S.kameraGit({ ...ist.gorunum, sure: ist.sure }) : Promise.resolve(); }
    if (eskiOrtam !== ortam) {
      perde.style.transition = "none"; perde.style.opacity = "1";
      void perde.offsetWidth;
      perde.style.transition = ""; perde.style.opacity = "0";
      S.kameraKoy(ist.giris || yaklas(ist.gorunum));
      return S.kameraGit({ ...ist.gorunum, sure: ist.sure || 0.7 });
    }
    return S.kameraGit({ ...ist.gorunum, sure: 0.8 });
  }

  return {
    ...S, cayir, hucre, lab, sera,
    atp: hucre.atp, kp: hucre.kp, izotop: hucre.izotop,
    istasyon, labIsik,
    /** Adım adım anlatımda: metni içeren iğneleri parlatır (boş çağrı vurguyu kaldırır) */
    vurgula(...metinler) {
      for (const e of kap.querySelectorAll(".d-igne")) e.classList.toggle("bio-vurgu", metinler.some((m) => e.textContent.includes(m)));
    },
    /** Kamerayı etkin istasyonun olağan görünümüne geri taşır */
    istasyonaDon(sure = 0.9) { return simdiki ? S.kameraGit({ ...IST[simdiki].gorunum, sure }) : Promise.resolve(); },
    get istasyonAdi() { return simdiki; },
    /** Kloroplast iğnelerini tıklanabilir yapar; fn(bolum): "dis" | "ic" | "tilakoit" | "stroma" */
    tikla(fn) { hucre.kp.igneleriKaldir(); hucre.kp.igneleriKur(fn); },
  };
}
