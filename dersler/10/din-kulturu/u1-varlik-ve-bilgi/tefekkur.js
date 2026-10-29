// Din Kültürü dersinin kalıcı 3B dünyası: kum tepelerine bakan taş bir seyir terası (tefekkür yeri).
// Terasta rahle üstünde açık bir kitap, kandil, su dolu kase ve içinde kamış kalem (duyu yanılması),
// kitaplar ve bir usturlap; uzakta duman yükselen bir kamp ateşi (akıl yürütme: duman → ateş).
// Gün, akşam ve gece arasında geçiş yapılır; gece yıldızlar ve Samanyolu görünür. Kişi tasviri yoktur.
import {
  dunyaKur, gokOrtami, arazi, dokuluMalzeme, birlestirici, agaclar, kayalar, dagit, doku,
  renkKat, yumusakAdim, fbm, rastgele, organiklestir, coklu, malzeme, THREE,
} from "../../felsefe/_ortak/dunya.js";

/* ---------- Arazi: 1 birim = 1 m ---------- */
function ham(x, z) {
  const r = Math.hypot(x, z);
  // Rüzgârla uzayan kum dalgaları
  const kum = 1.6 * Math.sin(x * 0.07 + 2.2 * Math.sin(z * 0.025)) * (0.6 + 0.4 * fbm(x * 0.01, 0, z * 0.01, { tohum: 3 }));
  let y = kum + 3.2 * fbm(x * 0.02, 1, z * 0.02, { oktav: 4, tohum: 5 });
  y += 5.5 * Math.exp(-((r / 26) ** 2));                                  // terasın üstünde durduğu tepe
  y += 110 * yumusakAdim(170, 360, r) * (0.45 + 0.7 * Math.max(0, fbm(x * 0.008, 2, z * 0.008, { tohum: 8 }) + 0.3)); // uzak dağlar
  return y;
}
const Y0 = ham(0, 0);
const yukseklik0 = () => Y0;
function yukseklik(x, z) {
  const y = ham(x, z), duz = 1 - yumusakAdim(5.5, 9, Math.hypot(x, z));
  return y + (Y0 - y) * duz;
}
function zeminRengi(x, z, y, egim) {
  const n = fbm(x * 0.05, 3, z * 0.05, { oktav: 3, tohum: 7 });
  const r = Math.hypot(x, z);
  return renkKat("#d2ad78",
    ["#e2c391", yumusakAdim(0.0, 0.5, n) * 0.6],
    ["#a7845c", yumusakAdim(0.12, 0.35, egim) * 0.7],
    ["#6e5848", yumusakAdim(0.35, 0.6, egim)],
    ["#9c8a78", yumusakAdim(170, 320, r) * 0.6]);
}

/* ---------- Gün saatleri ---------- */
const SAATLER = {
  gun: { ust: 0x4f8bd6, alt: 0xe9dcc2, gunesRenk: 0xfff0d8, gunes: 2.7, gok: 0.95, yildiz: 0, kandil: 0.6, ortam: 0.65, sis: [90, 700], gunesYon: [-0.45, 0.75, 0.48], pozlama: 1.0 },
  aksam: { ust: 0x27386c, alt: 0xf0a463, gunesRenk: 0xffab66, gunes: 1.6, gok: 0.5, yildiz: 0.25, kandil: 2.2, ortam: 0.35, sis: [70, 520], gunesYon: [-0.8, 0.18, -0.55], pozlama: 1.1 },
  gece: { ust: 0x040817, alt: 0x16213f, gunesRenk: 0x9fb4e0, gunes: 0.45, gok: 0.22, yildiz: 1, kandil: 6, ortam: 0.12, sis: [60, 460], gunesYon: [0.4, 0.7, -0.6], pozlama: 1.25 },
  safak: { ust: 0x2c4378, alt: 0xf2c48e, gunesRenk: 0xffc993, gunes: 1.7, gok: 0.6, yildiz: 0.15, kandil: 1.4, ortam: 0.4, sis: [80, 600], gunesYon: [0.85, 0.2, 0.5], pozlama: 1.05 },
};

/* ---------- Gökyüzü: yıldızlar, Samanyolu, hilal ---------- */
function yildizlar(S) {
  const r = rastgele(11);
  const grup = new THREE.Group();
  const kat = (sayi, boyut, samanyolu) => {
    const p = [], c = [], renk = new THREE.Color();
    for (let i = 0; i < sayi; i++) {
      let v;
      if (samanyolu) {
        // Gökyüzünde eğik bir şerit boyunca yoğunlaşan sönük yıldızlar
        const a = r() * Math.PI * 2, b = (r() - 0.5) * 0.35 * (0.4 + r());
        v = new THREE.Vector3(Math.cos(a), b, Math.sin(a)).applyAxisAngle(new THREE.Vector3(1, 0, 0.4).normalize(), 1.0);
      } else {
        v = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1);
      }
      v.normalize();
      if (v.y < 0.02) v.y = 0.02 + r() * 0.3;
      v.normalize().multiplyScalar(900);
      p.push(v.x, v.y, v.z);
      const t = r();
      renk.setHSL(t < 0.2 ? 0.08 : t < 0.4 ? 0.6 : 0.12, t < 0.4 ? 0.5 : 0.1, samanyolu ? 0.55 + r() * 0.2 : 0.75 + r() * 0.25);
      c.push(renk.r, renk.g, renk.b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(c, 3));
    const m = new THREE.PointsMaterial({ size: boyut, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, fog: false });
    const n = new THREE.Points(g, m);
    n.renderOrder = -1;
    grup.add(n);
    return m;
  };
  const malz = [kat(1400, 2.2, false), kat(260, 3.4, false), kat(3200, 1.6, true)];
  // Hilal: ay ışığı yönünde, kameraya dönük
  const t = document.createElement("canvas");
  t.width = t.height = 128;
  const c = t.getContext("2d");
  c.fillStyle = "#fff6dc"; c.beginPath(); c.arc(64, 64, 40, 0, Math.PI * 2); c.fill();
  c.globalCompositeOperation = "destination-out"; c.beginPath(); c.arc(80, 54, 38, 0, Math.PI * 2); c.fill();
  const hilalM = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(t), transparent: true, opacity: 0, depthWrite: false, fog: false });
  const hilal = new THREE.Sprite(hilalM);
  hilal.position.set(380, 300, -520); hilal.scale.setScalar(46);
  grup.add(hilal);
  malz.push(hilalM);
  S.scene.add(grup);
  return (opaklik) => { malz.forEach((m, i) => { m.opacity = opaklik * (i === 2 ? 0.8 : 1); }); grup.visible = opaklik > 0.01; };
}

/* ---------- Teras ve nesneler ---------- */
function terasKur(S, y0) {
  const b = birlestirici();
  const tas = dokuluMalzeme("tas", { tekrar: [5, 5], kabarti: 1.6 });
  const tasDuvar = dokuluMalzeme("tas", { tekrar: [1.5, 0.6], kabarti: 2, renk: 0xe9dfcc });
  // Yuvarlak taş zemin ve alçak korkuluk duvarı
  b.ekle(new THREE.CylinderGeometry(5.2, 5.5, 0.6, 48), tas, { konum: [0, y0 + 0.0, 0] });
  for (let i = 0; i < 22; i++) {
    const a = -Math.PI * 0.95 + (i / 21) * Math.PI * 1.25;
    b.ekle(new THREE.BoxGeometry(1.32, 0.62, 0.36), tasDuvar, { konum: [Math.cos(a) * 5.0, y0 + 0.6, Math.sin(a) * 5.0], donus: [0, -a + Math.PI / 2, 0] });
  }
  b.bitir(S.scene, { golge: true });
  const Y = y0 + 0.3;

  // Kilim: taş zeminde dokuma örtü
  const tuval = document.createElement("canvas");
  tuval.width = 256; tuval.height = 160;
  const c = tuval.getContext("2d");
  c.fillStyle = "#7a2a24"; c.fillRect(0, 0, 256, 160);
  c.strokeStyle = "#d9a441"; c.lineWidth = 6; c.strokeRect(12, 12, 232, 136);
  c.fillStyle = "#1f3b5a";
  for (let i = 0; i < 5; i++) { c.beginPath(); const x = 48 + i * 40; c.moveTo(x, 50); c.lineTo(x + 16, 80); c.lineTo(x, 110); c.lineTo(x - 16, 80); c.closePath(); c.fill(); }
  c.fillStyle = "#e8d6b0"; for (let i = 0; i < 5; i++) c.fillRect(44 + i * 40, 76, 8, 8);
  const kilimD = new THREE.CanvasTexture(tuval); kilimD.colorSpace = THREE.SRGBColorSpace;
  const kilim = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.02, 1.5), new THREE.MeshStandardMaterial({ map: kilimD, roughness: 1, bumpMap: doku("detay", { tohum: 41, olcek: 40 }).puruz, bumpScale: 1.5 }));
  kilim.position.set(0.2, Y + 0.01, 0.3); kilim.receiveShadow = true;
  S.scene.add(kilim);

  const ahsap = dokuluMalzeme("ahsap", { tekrar: [1, 1], puruz: 0.6, taban: "#8a5a34", koyu: "#5e3a1f", acik: "#a8774a" });
  // Rahle: çapraz geçmeli iki tahta
  const rahle = new THREE.Group();
  for (const s of [1, -1]) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.025, 0.34), ahsap);
    t.rotation.z = s * 0.62; t.castShadow = true; t.receiveShadow = true;
    rahle.add(t);
  }
  rahle.position.set(0, Y + 0.2, 0);
  S.scene.add(rahle);
  // Açık kitap: kavisli sayfalar, satır izleri (okunur metin değil)
  const sayfaT = document.createElement("canvas");
  sayfaT.width = 256; sayfaT.height = 320;
  const sc = sayfaT.getContext("2d");
  sc.fillStyle = "#efe3c6"; sc.fillRect(0, 0, 256, 320);
  sc.strokeStyle = "#8a6a3f"; sc.lineWidth = 3; sc.strokeRect(18, 18, 220, 284);
  sc.fillStyle = "rgba(40,30,20,.55)";
  const rr = rastgele(5);
  for (let y = 40; y < 290; y += 17) { let x = 226; while (x > 34) { const w = 6 + rr() * 22; sc.fillRect(x - w, y, w, 3 + rr() * 2); x -= w + 4 + rr() * 5; } }
  const sayfaD = new THREE.CanvasTexture(sayfaT); sayfaD.colorSpace = THREE.SRGBColorSpace;
  const sayfaM = new THREE.MeshStandardMaterial({ map: sayfaD, roughness: 0.85, side: THREE.DoubleSide });
  const kitap = new THREE.Group();
  for (const s of [1, -1]) {
    const g = new THREE.PlaneGeometry(0.2, 0.26, 10, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i) + 0.1; p.setXYZ(i, s * x, p.getY(i), 0.025 * Math.sin((x / 0.2) * Math.PI) + 0.012 * (x / 0.2)); }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, sayfaM); m.castShadow = true;
    kitap.add(m);
    const kapak = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.27, 0.008), new THREE.MeshStandardMaterial({ color: 0x5a1f1a, roughness: 0.55 }));
    kapak.position.set(s * 0.105, 0, -0.008); kitap.add(kapak);
  }
  kitap.rotation.x = -Math.PI / 2 + 0.62;
  kitap.position.set(0, Y + 0.31, 0.04);
  S.scene.add(kitap);

  // Kandil: pirinç kandil, alev ve sıcak ışık
  const pirinc = malzeme.metal(0xc89a4a, { puruz: 0.32 });
  const kandilG = new THREE.LatheGeometry([[0, 0], [0.05, 0.004], [0.075, 0.02], [0.08, 0.04], [0.06, 0.055], [0.02, 0.06], [0.012, 0.075], [0, 0.075]].map(([a, h]) => new THREE.Vector2(a, h)), 24);
  const kandil = new THREE.Mesh(kandilG, pirinc);
  kandil.scale.set(1.3, 1, 1); kandil.position.set(0.62, Y, -0.1); kandil.castShadow = true;
  const emzik = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.022, 0.09, 10), pirinc);
  emzik.rotation.z = -1.1; emzik.position.set(0.71, Y + 0.05, -0.1);
  const alevG = organiklestir(new THREE.SphereGeometry(0.02, 10, 8).scale(1, 2.4, 1), { genlik: 0.004, olcek: 40 });
  const alev = new THREE.Mesh(alevG, malzeme.isik(0xffa640, 3));
  alev.position.set(0.755, Y + 0.105, -0.1);
  const isik = new THREE.PointLight(0xffa24a, 1, 10, 1.2);
  isik.position.set(0.75, Y + 0.18, -0.1);
  isik.castShadow = false;
  S.scene.add(kandil, emzik, alev, isik);

  // Su dolu toprak kase ve içinde kamış kalem: su yüzeyinde kırık görünür (ışığın kırılması)
  const kil = dokuluMalzeme("kerpic", { tekrar: [2, 1], renk: 0xe2a77a, puruz: 0.7 });
  const kaseG = new THREE.LatheGeometry([[0, 0], [0.09, 0.0], [0.15, 0.03], [0.2, 0.1], [0.215, 0.16], [0.205, 0.165], [0.19, 0.11], [0.14, 0.045], [0.0, 0.02]].map(([a, h]) => new THREE.Vector2(a, h)), 40);
  const kase = new THREE.Mesh(kaseG, kil);
  const KASE = new THREE.Vector3(-0.9, Y, 0.75);
  kase.position.copy(KASE); kase.castShadow = true; kase.receiveShadow = true;
  const suYuz = new THREE.Mesh(new THREE.CircleGeometry(0.195, 40).rotateX(-Math.PI / 2),
    new THREE.MeshPhysicalMaterial({ color: 0x6fa6b8, roughness: 0.05, transparent: true, opacity: 0.34, clearcoat: 1, depthWrite: false }));
  suYuz.position.set(KASE.x, Y + 0.13, KASE.z);
  const kamis = new THREE.MeshStandardMaterial({ color: 0xc7a36a, roughness: 0.6, map: doku("ahsap", { tohum: 12, taban: "#c9a46a", koyu: "#a17d47", acik: "#e0c08a" }).renk });
  const ust = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.007, 0.24, 8), kamis);
  ust.position.set(KASE.x + 0.1, Y + 0.2, KASE.z); ust.rotation.z = 0.75;
  // Suyun altındaki kısım gerçekte düz devam eder; burada göze göründüğü gibi (kırık) çizilir
  const alt = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.13, 8), kamis);
  alt.position.set(KASE.x - 0.04, Y + 0.085, KASE.z); alt.rotation.z = 1.15;
  ust.castShadow = alt.castShadow = true;
  S.scene.add(kase, suYuz, ust, alt);

  // Kitap yığını ve usturlap
  const ciltler = [0x2f4a3a, 0x6a2a20, 0x3b3550, 0x7a5a2a];
  const sayfaKenar = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.9 });
  ciltler.forEach((renk, i) => {
    const cilt = new THREE.MeshStandardMaterial({ color: renk, roughness: 0.6 });
    const g = new THREE.BoxGeometry(0.28 - i * 0.015, 0.05, 0.2 - i * 0.01);
    const m = new THREE.Mesh(g, [sayfaKenar, cilt, cilt, cilt, sayfaKenar, sayfaKenar]);
    m.position.set(1.15, Y + 0.025 + i * 0.05, 0.55); m.rotation.y = (i % 2 ? 0.2 : -0.15) + i * 0.05; m.castShadow = true;
    S.scene.add(m);
  });
  const usturlap = new THREE.Group();
  const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.012, 48), pirinc);
  const halka = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.008, 8, 48), pirinc);
  halka.rotation.x = Math.PI / 2;
  const ag = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.004, 6, 40), malzeme.metal(0xe0c080, { puruz: 0.25 }));
  ag.rotation.x = Math.PI / 2; ag.position.set(0.02, 0.009, 0.01);
  const kulp = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 8, 20), pirinc);
  kulp.position.set(0, 0, -0.14); kulp.rotation.x = Math.PI / 2;
  usturlap.add(disk, halka, ag, kulp);
  usturlap.position.set(1.0, Y + 0.008, -0.45); usturlap.rotation.y = 0.5;
  usturlap.traverse((o) => { o.castShadow = true; });
  S.scene.add(usturlap);

  return { Y, kitap: new THREE.Vector3(0, Y + 0.42, 0.04), kandil: new THREE.Vector3(0.72, Y + 0.16, -0.1), kase: new THREE.Vector3(KASE.x, Y + 0.22, KASE.z), yigin: new THREE.Vector3(1.15, Y + 0.26, 0.55), usturlap: new THREE.Vector3(1.0, Y + 0.06, -0.45), isik, alev };
}

/** Uzaktaki kamp ateşi ve yükselen duman */
function atesKur(S, h, [x, z]) {
  const y = h(x, z);
  const odun = new THREE.MeshStandardMaterial({ color: 0x3b2a1e, roughness: 0.9 });
  for (let i = 0; i < 5; i++) {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.3, 6), odun);
    o.position.set(x, y + 0.2, z); o.rotation.set(1.2, (i / 5) * Math.PI * 2, 0);
    S.scene.add(o);
  }
  const alev = new THREE.Mesh(organiklestir(new THREE.ConeGeometry(0.45, 1.3, 10, 4), { genlik: 0.12, olcek: 3 }), malzeme.isik(0xff8a30, 2.6));
  alev.position.set(x, y + 0.75, z);
  const isik = new THREE.PointLight(0xff8a3a, 0, 40, 1.5);
  isik.position.set(x, y + 1.5, z);
  S.scene.add(alev, isik);
  // Duman: yükseldikçe büyüyen, rüzgârla eğilen yarı saydam topaklar
  const N = 46;
  const dumanM = new THREE.MeshStandardMaterial({ color: 0x9b958e, roughness: 1, transparent: true, opacity: 0.38, depthWrite: false });
  const duman = coklu(organiklestir(new THREE.IcosahedronGeometry(1, 2), { genlik: 0.25, olcek: 1.5 }), dumanM, N);
  const r = rastgele(3), faz = Array.from({ length: N }, () => r());
  S.scene.add(duman);
  let t = 0;
  S.herKare((dt) => {
    t += dt;
    for (let i = 0; i < N; i++) {
      const k = (faz[i] + t * 0.05) % 1;
      duman.userData.yerlestir(i, x + k * k * 26 + Math.sin(i + t * 0.4) * 0.8, y + 1.5 + k * 34, z + k * 6, 0.8 + k * 5.5, i + t * 0.1);
    }
    duman.userData.bitir();
    alev.scale.y = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06;
  });
  return { alev, isik, nokta: new THREE.Vector3(x, y + 2, z), duman: new THREE.Vector3(x + 6, y + 18, z + 2) };
}

/* ---------- Dünya ---------- */
export function tefekkurDunyasi(kap) {
  const S = dunyaKur(kap, {
    uzaklik: [0.6, 120],
    kameraKonum: [9, 9, 10], hedef: [0, 6.5, 0], arkaPlan: [SAATLER.gun.ust, SAATLER.gun.alt], sis: [90, 700], isik: "klasik", pozlama: 1.0,
  });
  S.camera.near = 0.05; S.camera.far = 3000; S.camera.updateProjectionMatrix();
  const g = S.gunes.shadow.camera;
  g.left = -9; g.right = 9; g.top = 9; g.bottom = -9; g.near = 1; g.far = 160; g.updateProjectionMatrix();
  S.gunes.shadow.bias = -0.0002;

  const { h } = arazi(S, { genislik: 900, derinlik: 900, bolum: 220, yukseklik, renk: zeminRengi, detayTekrar: 160 });
  const y0 = yukseklik0();
  S.gunes.target.position.set(0, y0, 0);
  const T = terasKur(S, y0);
  const ates = atesKur(S, h, [-44, -78]);
  const yildizAyarla = yildizlar(S);

  // Terasın yanında yaşlı bir akasya, kumda seyrek çalılar ve kayalar
  agaclar(S, "akasya", [[7.2, h(7.2, -3.5), -3.5, 2.1]], { tohum: 51 });
  agaclar(S, "akasya", dagit(45, { yaricap: 300, ic: 30, tohum: 53, h, olcek: [1.1, 1.7] }), { tohum: 53, golge: false });
  // Kumda seyrek, tozlu çalılar
  const calilar = agaclar(S, "asma", dagit(160, { yaricap: 160, ic: 9, tohum: 55, h, olcek: [0.5, 1.1] }), { tohum: 55, golge: false });
  calilar.tepe.material.color.set(0x8c8a5c); calilar.govde.visible = false;
  kayalar(S, [...dagit(26, { yaricap: 14, ic: 6, tohum: 57, h: (x, z) => h(x, z) - 0.1, olcek: [0.3, 0.9] }), ...dagit(80, { yaricap: 200, ic: 15, tohum: 59, h: (x, z) => h(x, z) - 0.3, olcek: [0.6, 2.4] })], { ad: "granit", tohum: 57 });

  S.bakislar = {
    genel: { konum: [6.8, y0 + 2.6, 7.4], hedef: [0, y0 + 0.4, 0] },
    kase: { konum: [T.kase.x + 0.75, T.Y + 0.62, T.kase.z + 0.8], hedef: [T.kase.x, T.Y + 0.12, T.kase.z] },
    kitap: { konum: [0.85, T.Y + 1.05, 1.25], hedef: [0.2, T.Y + 0.22, 0] },
    yigin: { konum: [2.4, T.Y + 1.0, 1.9], hedef: [1.0, T.Y + 0.1, 0.1] },
    gok: { konum: [-3, y0 + 1.8, 6.5], hedef: [18, y0 + 58, -40] },
    duman: { konum: [3.6, y0 + 2.2, 5.6], hedef: [-36, y0 + 6, -70] },
    ufuk: { konum: [-1.5, y0 + 2.4, 6], hedef: [8, y0 + 1, -40] },
  };
  S.yerler = { ...T, ates: ates.nokta, dumanUst: ates.duman, agac: new THREE.Vector3(7.2, h(7.2, -3.5) + 4.6, -3.5), gok: new THREE.Vector3(-60, y0 + 160, -260), dag: new THREE.Vector3(60, 60, -330) };

  // Gün saati geçişi: renkler ve ışıklar yumuşakça değişir
  const simdi = { ...SAATLER.gun }, renk = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t).getHex();
  let kaynak = { ...SAATLER.gun }, hedef = SAATLER.gun, t = 1, hedefAd = "gun";
  function uygula(s) {
    S.arkaPlan([s.ust, s.alt]);
    S.scene.fog.near = s.sis[0]; S.scene.fog.far = s.sis[1];
    S.gunes.color.set(s.gunesRenk); S.gunes.intensity = s.gunes;
    S.gunes.position.set(s.gunesYon[0] * 60, y0 + s.gunesYon[1] * 60, s.gunesYon[2] * 60);
    S.gok.intensity = s.gok;
    S.gok.color.set(renk(0xdfeaff, s.ust, 0.4));
    S.renderer.toneMappingExposure = s.pozlama;
    yildizAyarla(s.yildiz);
    T.isik.intensity = s.kandil;
    ates.isik.intensity = s.kandil * 6;
    S.scene.environmentIntensity = s.ortam;
  }
  function karistir(a, b, k) {
    const c = {};
    for (const ad of Object.keys(b)) {
      if (["ust", "alt", "gunesRenk"].includes(ad)) c[ad] = renk(a[ad], b[ad], k);
      else if (Array.isArray(b[ad])) c[ad] = b[ad].map((v, i) => a[ad][i] + (v - a[ad][i]) * k);
      else c[ad] = a[ad] + (b[ad] - a[ad]) * k;
    }
    return c;
  }
  const ortamKur = (s) => gokOrtami(S, { ust: s.ust, ufuk: s.alt, alt: 0x6b5641, gunes: { yon: s.gunesYon, renk: s.gunesRenk, parlaklik: s.gunes * 2 }, guc: s.ortam });
  ortamKur(SAATLER.gun);
  uygula(SAATLER.gun);
  S.herKare((dt) => {
    if (t >= 1) return;
    t = Math.min(1, t + dt / 1.6);
    const k = t * t * (3 - 2 * t);
    Object.assign(simdi, karistir(kaynak, hedef, k));
    uygula(simdi);
    if (t >= 1) ortamKur(hedef);
  });
  /** Gün saatini değiştir: "gun" | "aksam" | "gece" | "safak" */
  S.saat = (ad) => {
    if (ad === hedefAd) return;
    hedefAd = ad; kaynak = { ...simdi }; hedef = SAATLER[ad]; t = 0;
  };
  return S;
}

/** Adım için iğneler kurar; adım değişince kaldırılır */
export function igneler(ctx, liste) {
  const S = ctx.sahne;
  const kurulan = liste.map(([y, html, ayar = {}]) => S.igne(typeof y === "string" ? S.yerler[y] : y, html, ayar));
  ctx.temizlik(() => kurulan.forEach((i) => i.kaldir()));
  return kurulan;
}
