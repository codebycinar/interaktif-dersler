// Felsefe dersinin kalıcı 3B dünyası: MÖ 6. yüzyılda Milet limanı (temsilî canlandırma).
// Izgara planlı kent, taş rıhtım ve ahşap iskele, agora ve stoa, tepede bir tapınak, zeytinlikler.
// Limanda Theseus'un gemisi bağlıdır; tahtaları 3. adımda tek tek değiştirilir.
import {
  dunyaKur, gokOrtami, arazi, su, dokuluMalzeme, birlestirici, evEkle, besikCatiGeo, sutunGeo,
  agaclar, kayalar, dagit, renkKat, yumusakAdim, fbm, rastgele, THREE,
} from "../_ortak/dunya.js";
import { gemiKur, tahtaDenetci, tahtaYigini, kizak, TAHTA } from "./gemi.js";

const AGORA = { x: 18, z: 30, en: 30, derin: 20 };
const TAPINAK = { x: -34, z: 50, en: 14, derin: 28 };
const RIHTIM = { x0: -44, x1: 44, z: 0, y: 1.1 };
const ISKELE = { x: -3, z0: 0, z1: -22, en: 3.2 };
const GEMI = { x: 8.6, z: -12 };
const IKINCI = { x: -16, z: 9 };

/* ---------- Arazi ---------- */
const kiyi = (x) => (Math.abs(x) < 46 ? 0 : -(Math.abs(x) - 46) * 0.55 + 2.5 * Math.sin(x * 0.08));
function duzlestir(y, x, z, a, hy) {
  const dx = Math.abs(x - a.x) - a.en / 2, dz = Math.abs(z - a.z) - a.derin / 2;
  const m = 1 - yumusakAdim(0, 6, Math.max(dx, dz));
  return y + (hy - y) * m;
}
function hamYukseklik(x, z) {
  const d = z - kiyi(x);
  const kara = yumusakAdim(-3, 2, d);
  let y = -4 * (1 - kara) + RIHTIM.y * kara;
  const ic = Math.max(0, d);
  y += kara * (0.035 * ic + 16 * yumusakAdim(55, 130, ic) * (0.7 + 0.5 * fbm(x * 0.02, 1, z * 0.02, { tohum: 2 })));
  y += kara * yumusakAdim(8, 50, ic) * 3.2 * fbm(x * 0.035, 0, z * 0.035, { oktav: 4, tohum: 5 });
  y += 42 * yumusakAdim(150, 240, ic) * (0.6 + 0.6 * fbm(x * 0.012, 3, z * 0.012, { tohum: 8 }));
  return y;
}
const YA = hamYukseklik(AGORA.x, AGORA.z), YT = hamYukseklik(TAPINAK.x, TAPINAK.z) + 1.2;
function yukseklik(x, z) {
  let y = hamYukseklik(x, z);
  y = duzlestir(y, x, z, AGORA, YA);
  y = duzlestir(y, x, z, TAPINAK, YT);
  if (Math.abs(x) < RIHTIM.x1 + 2 && z > -1 && z < 6) y = Math.max(y, RIHTIM.y - 0.02);
  return y;
}
function zeminRengi(x, z, y, egim) {
  const d = z - kiyi(x);
  const n = fbm(x * 0.08, 7, z * 0.08, { oktav: 3, tohum: 3 });
  if (y < -0.2) return renkKat("#7a6d55", ["#5d5444", yumusakAdim(-0.5, -3.5, y)]);
  return renkKat("#a39466",
    ["#cfbd97", 1 - yumusakAdim(1, 6, d)],                 // kıyı kumu
    ["#7e8048", yumusakAdim(-0.1, 0.4, n) * 0.7],           // otlu lekeler
    ["#8b7a5c", yumusakAdim(0.15, 0.4, egim)],              // dik yamaç toprağı
    ["#8d8578", yumusakAdim(0.35, 0.6, egim)],              // kaya
    ["#9aa0a8", yumusakAdim(160, 230, d) * 0.5]);           // uzak dağların puslu rengi
}

/* ---------- Kent ---------- */
function kentKur(S, h) {
  const b = birlestirici();
  const M = {
    duvar: dokuluMalzeme("siva", { tekrar: [1, 1], kabarti: 0.8 }),
    duvar2: dokuluMalzeme("tas", { tekrar: [1, 1], kabarti: 1.2, renk: 0xf2ece0 }),
    cati: dokuluMalzeme("kiremit", { tekrar: [0.7, 0.7], kabarti: 1.4 }),
    bosluk: new THREE.MeshStandardMaterial({ color: 0x241c16, roughness: 1 }),
    ahsap: dokuluMalzeme("ahsap", { tekrar: [1, 1] }),
  };
  const r = rastgele(17);
  const dolu = (x, z, pay = 0) =>
    (Math.abs(x - AGORA.x) < AGORA.en / 2 + 3 + pay && Math.abs(z - AGORA.z) < AGORA.derin / 2 + 3 + pay) ||
    (Math.abs(x - TAPINAK.x) < TAPINAK.en / 2 + 5 + pay && Math.abs(z - TAPINAK.z) < TAPINAK.derin / 2 + 5 + pay);
  // Arkaik dönem kenti: düzensiz adalar (ızgara plan MÖ 5. yüzyılda geldi)
  for (let gx = -66; gx <= 66; gx += 13) for (let gz = 10; gz <= 86; gz += 12) {
    if (dolu(gx, gz)) continue;
    if (Math.abs(gx) < 8 && gz < 14) continue;
    if (Math.abs(gx - IKINCI.x) < 10 && gz < 26) continue;
    const sayi = 2 + Math.floor(r() * 3);
    for (let i = 0; i < sayi; i++) {
      const en = 3.2 + r() * 2.2, derin = 3.2 + r() * 1.8;
      const x = gx + (i % 2 ? 2.6 : -2.6) + (r() - 0.5) * 2.4, z = gz + (i < 2 ? -2.3 : 2.4) + (r() - 0.5) * 2;
      const y = Math.min(h(x - en / 2, z), h(x + en / 2, z), h(x, z - derin / 2), h(x, z + derin / 2));
      evEkle(b, { ...M, duvar: r() < 0.65 ? M.duvar : M.duvar2 }, { x, y, z, en, derin, yuk: 2.3 + r() * 1.4, donus: (r() < 0.5 ? 0 : Math.PI) + (r() - 0.5) * 0.5 + Math.sin(gz * 0.05) * 0.3, cati: "besik", catiYuk: 0.8 + r() * 0.3, pencere: 1 + Math.floor(r() * 2) });
    }
  }
  b.bitir(S.scene, { golge: true });
}

function agoraKur(S) {
  const b = birlestirici();
  const tas = dokuluMalzeme("tas", { tekrar: [6, 4], kabarti: 1 });
  const mermer = dokuluMalzeme("mermer", { tekrar: [1, 1], puruz: 0.45, kabarti: 0.3 });
  const cati = dokuluMalzeme("kiremit", { tekrar: [0.6, 0.6], kabarti: 1.4 });
  const { x, z, en, derin } = AGORA, y = YA;
  // Taş döşeme
  b.ekle(new THREE.BoxGeometry(en, 0.3, derin), tas, { konum: [x, y - 0.1, z] });
  // Kuzey kenarında stoa: önde sütun dizisi, arkada duvar, eğimli çatı
  const sz = z + derin / 2 - 2.5, sutun = sutunGeo(4.2, 0.26);
  for (let i = 0; i < 15; i++) b.ekle(sutun, mermer, { konum: [x - en / 2 + 1.2 + i * ((en - 2.4) / 14), y + 0.05, sz - 2] });
  b.ekle(new THREE.BoxGeometry(en, 0.3, 5.4), mermer, { konum: [x, y + 0.02, sz] });
  b.ekle(new THREE.BoxGeometry(en, 4.6, 0.5), tas, { konum: [x, y + 2.3, sz + 2.5] });
  b.ekle(new THREE.BoxGeometry(en + 0.4, 0.55, 0.7), mermer, { konum: [x, y + 4.5, sz - 2] });
  b.ekle(new THREE.BoxGeometry(en + 0.6, 0.18, 6.2), cati, { konum: [x, y + 5.0, sz + 0.2], donus: [-0.18, 0, 0] });
  // Doğu kenarında ikinci stoa (L biçimi)
  const sx = x + en / 2 - 2.5;
  for (let i = 0; i < 9; i++) b.ekle(sutun, mermer, { konum: [sx - 2, y + 0.05, z - derin / 2 + 1.2 + i * ((derin - 6) / 8)] });
  b.ekle(new THREE.BoxGeometry(0.5, 4.6, derin - 4), tas, { konum: [sx + 2.5, y + 2.3, z - 2] });
  b.ekle(new THREE.BoxGeometry(0.7, 0.55, derin - 4), mermer, { konum: [sx - 2, y + 4.5, z - 2] });
  b.ekle(new THREE.BoxGeometry(6.2, 0.18, derin - 3.6), cati, { konum: [sx + 0.2, y + 5.0, z - 2], donus: [0, 0, 0.18] });
  // Ortada sunak ve birkaç taş sıra
  b.ekle(new THREE.BoxGeometry(2.2, 1.1, 1.4), mermer, { konum: [x - 3, y + 0.55, z - 2] });
  for (const [bx, bz, r] of [[x - 9, z - 5, 0.2], [x + 3, z - 6, -0.3], [x - 6, z + 3, 0]]) b.ekle(new THREE.BoxGeometry(3, 0.45, 0.6), tas, { konum: [bx, y + 0.22, bz], donus: [0, r, 0] });
  b.bitir(S.scene);
  return { merkez: [x, y, z], stoa: [x, y + 3, sz] };
}

function tapinakKur(S) {
  const b = birlestirici();
  const mermer = dokuluMalzeme("mermer", { tekrar: [1, 1], puruz: 0.42, kabarti: 0.3 });
  const mermerB = dokuluMalzeme("mermer", { tekrar: [4, 2], puruz: 0.5, kabarti: 0.4 });
  const cati = dokuluMalzeme("kiremit", { tekrar: [0.5, 0.5], kabarti: 1.4 });
  const { x, z, en, derin } = TAPINAK, y = YT;
  // Üç basamaklı krepis
  for (let i = 0; i < 3; i++) b.ekle(new THREE.BoxGeometry(en + 2.4 - i * 0.8, 0.45, derin + 2.4 - i * 0.8), mermerB, { konum: [x, y - 1.2 + 0.225 + i * 0.45, z] });
  const yt = y + 0.15, H = 6.2, sutun = sutunGeo(H, 0.45);
  const nx = 6, nz = 12;
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    if (i > 0 && i < nx - 1 && j > 0 && j < nz - 1) continue;
    b.ekle(sutun, mermer, { konum: [x - en / 2 + 0.9 + i * ((en - 1.8) / (nx - 1)), yt, z - derin / 2 + 0.9 + j * ((derin - 1.8) / (nz - 1))] });
  }
  // Naos (iç oda), arşitrav, friz ve alınlıklı çatı
  b.ekle(new THREE.BoxGeometry(en - 5.4, H - 0.3, derin - 8), mermerB, { konum: [x, yt + (H - 0.3) / 2, z + 0.5] });
  b.ekle(new THREE.BoxGeometry(en + 0.2, 0.75, derin + 0.2), mermer, { konum: [x, yt + H + 0.37, z] });
  b.ekle(new THREE.BoxGeometry(en + 0.3, 0.6, derin + 0.3), mermerB, { konum: [x, yt + H + 1.05, z] });
  b.ekle(besikCatiGeo(en + 0.9, derin + 0.9, 2.3), cati, { konum: [x, yt + H + 1.35, z] });
  b.ekle(besikCatiGeo(en + 0.2, 0.3, 2.0), mermer, { konum: [x, yt + H + 1.35, z - derin / 2 - 0.2] });
  b.ekle(besikCatiGeo(en + 0.2, 0.3, 2.0), mermer, { konum: [x, yt + H + 1.35, z + derin / 2 + 0.2] });
  b.bitir(S.scene);
  return [x, yt + H, z];
}

function limanKur(S, h) {
  const b = birlestirici();
  const tas = dokuluMalzeme("tas", { tekrar: [14, 1.2], kabarti: 2 });
  const tasUst = dokuluMalzeme("tas", { tekrar: [20, 1], kabarti: 1.2, renk: 0xe8e0d0 });
  const ahsap = dokuluMalzeme("ahsap", { tekrar: [1, 6], kabarti: 0.8, taban: "#7a5c3f", koyu: "#4f3a27", acik: "#97775a" });
  const kazik = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.9 });
  const { x0, x1, y } = RIHTIM;
  // Taş rıhtım duvarı: büyük kesme bloklar (hafif düzensiz sıralar)
  b.ekle(new THREE.BoxGeometry(x1 - x0, y + 4, 2.2), tas, { konum: [(x0 + x1) / 2, (y - 4) / 2, -1.1] });
  b.ekle(new THREE.BoxGeometry(x1 - x0 + 0.3, 0.32, 2.5), tasUst, { konum: [(x0 + x1) / 2, y + 0.02, -1.1] });
  const r = rastgele(4);
  for (let x = x0 + 1; x < x1; x += 2.4 + r() * 1.5) b.ekle(new THREE.CylinderGeometry(0.22, 0.28, 0.6, 10), tasUst, { konum: [x, y + 0.45, -1.8] }); // bağlama babaları
  // Ahşap iskele: kazıklar ve döşeme tahtaları
  const { x: ix, z0, z1, en } = ISKELE;
  for (let zz = z0 - 2.4; zz > z1; zz -= 2.6) for (const s of [-1, 1]) b.ekle(new THREE.CylinderGeometry(0.16, 0.2, 5.4, 8), kazik, { konum: [ix + s * (en / 2 - 0.2), -1.6, zz] });
  for (let zz = z0 - 1.5; zz > z1; zz -= 0.42) b.ekle(new THREE.BoxGeometry(en, 0.1, 0.38), ahsap, { konum: [ix + (r() - 0.5) * 0.08, y - 0.2, zz], donus: [0, (r() - 0.5) * 0.03, 0] });
  for (const s of [-1, 1]) b.ekle(new THREE.BoxGeometry(0.22, 0.22, z0 - z1 - 1.5), ahsap, { konum: [ix + s * (en / 2 - 0.2), y - 0.36, (z0 + z1) / 2 - 0.7] });
  // Halat sarılı baba ve birkaç amfora/ sandık (yük)
  const kil = dokuluMalzeme("kerpic", { tekrar: [1, 1], renk: 0xe0a77d, puruz: 0.75 });
  const amfora = new THREE.LatheGeometry([[0, 0], [0.12, 0.02], [0.28, 0.35], [0.33, 0.7], [0.3, 0.95], [0.12, 1.15], [0.1, 1.38], [0.14, 1.42], [0, 1.42]].map(([a, c]) => new THREE.Vector2(a, c)), 16);
  for (let i = 0; i < 9; i++) b.ekle(amfora, kil, { konum: [-6 + (i % 3) * 0.7 + r() * 0.1, y + 0.17, 2.2 + Math.floor(i / 3) * 0.7], donus: [0, r() * 6, (r() - 0.5) * 0.1] });
  for (let i = 0; i < 4; i++) b.ekle(new THREE.BoxGeometry(1, 0.8, 0.8), ahsap, { konum: [-11 + i * 1.15, y + 0.55, 2.4], donus: [0, r() * 0.3, 0] });
  b.bitir(S.scene);
}

/* ---------- Dünya ---------- */
export function miletDunyasi(kap) {
  const S = dunyaKur(kap, {
    uzaklik: [2, 320],
    kameraKonum: [60, 30, -64], hedef: [0, 4, 18], arkaPlan: [0x5f93cf, 0xdfe7ea], sis: [140, 520], isik: "klasik", pozlama: 1.05,
    bakislar: {
      genel: { konum: [58, 28, -62], hedef: [2, 5, 22] },
      stoa: { konum: [6, 5.2, 14], hedef: [16, 3.6, 40] },
      gemi: { konum: [30, 7.5, -16], hedef: [8.6, 2.2, -11.5] },
      gemiIki: { konum: [30, 34, -50], hedef: [-4, 1.5, -1] },
      havadan: { konum: [-80, 110, -120], hedef: [0, 0, 32] },
      ufuk: { konum: [-4, 3.4, 3], hedef: [-28, 2.4, -70] },
      agora: { konum: [40, 16, 8], hedef: [16, 3, 32] },
      sokak: { konum: [-48, 9, 4], hedef: [-12, 4, 40] },
      tapinak: { konum: [-8, 10, 24], hedef: [-34, 6, 50] },
      tepe: { konum: [-68, 30, 120], hedef: [0, 2, 8] },
    },
  });
  S.gunes.position.set(-70, 85, -60);
  S.gunes.color.set(0xfff0dc);
  S.gunes.intensity = 2.6;
  S.gok.intensity = 0.9;
  gokOrtami(S, { ust: 0x4f86c6, ufuk: 0xe6edf0, alt: 0x7a6e58, gunes: { yon: [-0.55, 0.62, -0.5] }, guc: 0.75 });
  const g = S.gunes.shadow.camera;
  g.left = -90; g.right = 90; g.top = 90; g.bottom = -90; g.far = 400; g.updateProjectionMatrix();

  const { h } = arazi(S, { genislik: 420, derinlik: 340, bolum: 230, merkez: [0, 96], yukseklik, renk: zeminRengi, detayTekrar: 70 });
  su(S, { genislik: 900, derinlik: 520, merkez: [0, -200], y: 0, renk: 0x184c63, tekrar: 170, opaklik: 1 });

  limanKur(S, h);
  kentKur(S, h);
  const agora = agoraKur(S);
  const tapinak = tapinakKur(S);

  // Bitki örtüsü ve kayalar
  const kentDisi = (x, z) => { const d = z - kiyi(x); return d > 92 || Math.abs(x) > 72; };
  agaclar(S, "zeytin", dagit(340, { merkez: [0, 120], yaricap: 170, tohum: 3, h, uygun: (x, z) => kentDisi(x, z) && z - kiyi(x) < 200 && z - kiyi(x) > 6 }), { tohum: 3 });
  agaclar(S, "selvi", [
    ...dagit(16, { merkez: [TAPINAK.x, TAPINAK.z], yaricap: 26, ic: 17, tohum: 5, h }),
    ...dagit(40, { merkez: [0, 120], yaricap: 160, tohum: 9, h, uygun: kentDisi }),
  ], { tohum: 5 });
  agaclar(S, "yuvarlak", dagit(40, { merkez: [0, 50], yaricap: 70, tohum: 12, h, uygun: (x, z) => z > 8 && !(Math.abs(x - AGORA.x) < 18 && Math.abs(z - AGORA.z) < 13) && !(Math.abs(x - TAPINAK.x) < 12 && Math.abs(z - TAPINAK.z) < 18) }), { tohum: 12 });
  kayalar(S, [
    ...dagit(60, { merkez: [0, 0], yaricap: 120, tohum: 21, h: (x, z) => h(x, z) - 0.2, uygun: (x, z) => Math.abs(x) > 48 && Math.abs(z - kiyi(x)) < 4 }),
    ...dagit(80, { merkez: [0, 140], yaricap: 150, tohum: 23, h: (x, z) => h(x, z) - 0.3, uygun: (x, z) => z - kiyi(x) > 100, olcek: [1, 2.6] }),
  ], { ad: "tas" });

  // Theseus'un gemisi iskelenin yanında, pruvası denize dönük
  const gemi = gemiKur({ tohum: 2 });
  gemi.rotation.y = Math.PI / 2;
  gemi.position.set(GEMI.x, -0.85, GEMI.z);
  S.scene.add(gemi);
  const tahtalar = tahtaDenetci(S, gemi);
  // Sökülen tahtalar rıhtımda yığılır; ikinci gemi karada kızak üstünde kurulur
  const yigin = tahtaYigini(TAHTA);
  yigin.position.set(-14, RIHTIM.y + 0.1, 3.4);
  S.scene.add(yigin);
  const ikinci = new THREE.Group();
  const eskiGemi = gemiKur({ hepsiEski: true, direk: false, tohum: 4 });
  eskiGemi.position.y = 0.55;
  ikinci.add(eskiGemi, kizak());
  ikinci.rotation.y = Math.PI / 2 + 0.25;
  ikinci.position.set(IKINCI.x, h(IKINCI.x, IKINCI.z) - 0.1, IKINCI.z);
  ikinci.visible = false;
  S.scene.add(ikinci);

  // Limanda küçük tekneler ve açıkta yelken açmış iki gemi
  const tekneler = [[-22, -5.5, 0.42, 0.1], [-30, -6, 0.38, -0.2], [26, -6, 0.45, 0.15]].map(([x, z, o, d]) => {
    const t = gemiKur({ olcek: o, direk: false, gozler: false, tohum: 9 });
    t.rotation.y = Math.PI / 2 + d; t.position.set(x, -0.35, z);
    S.scene.add(t);
    return t;
  });
  const acik = [[-120, -150, 0.9], [140, -230, 0.8]].map(([x, z, o]) => {
    const t = gemiKur({ olcek: o, yelken: "acik", tohum: 7 });
    t.rotation.y = 0.15; t.position.set(x, -0.8 * o, z);
    S.scene.add(t);
    return t;
  });

  // Hafif dalga salınımı ve açıktaki gemilerin yavaş yolculuğu
  let zaman = 0;
  S.herKare((dt) => {
    zaman += dt;
    gemi.position.y = -0.85 + Math.sin(zaman * 0.9) * 0.05;
    gemi.rotation.x = Math.sin(zaman * 0.7) * 0.012;
    tekneler.forEach((t, i) => { t.position.y = -0.35 + Math.sin(zaman * 1.1 + i) * 0.04; t.rotation.z = Math.sin(zaman * 0.8 + i * 2) * 0.02; });
    acik.forEach((t, i) => {
      t.position.x += dt * (1.4 + i * 0.4);
      if (t.position.x > 260) t.position.x = -260;
      t.rotation.z = Math.sin(zaman * 0.6 + i) * 0.03;
    });
  });

  const yerler = {
    liman: [0, 2, -4], iskele: [ISKELE.x, 1.4, -14], agora: agora.merkez, stoa: agora.stoa, tapinak,
    gemi: new THREE.Vector3(GEMI.x, 4.2, GEMI.z - 2), yigin: new THREE.Vector3(-14, RIHTIM.y + 1.2, 3.4),
    ikinci: new THREE.Vector3(IKINCI.x, 5.5, IKINCI.z), kent: [-30, 6, 24], dag: [40, 30, 210], deniz: [-40, 0.5, -90],
  };
  S.yerler = yerler;
  S.gemi = {
    degistir: (n) => { tahtalar.ayarla(n); yigin.userData.goster(n); },
    ikinci: (b) => { ikinci.visible = b; yigin.visible = !b; },
  };
  return S;
}

/** Adım için iğneler kurar; adım değişince kaldırılır. liste: [[yerAdı|nokta, html, ayar]] */
export function igneler(ctx, liste) {
  const S = ctx.sahne;
  const kurulan = liste.map(([yer, html, ayar = {}]) => {
    const n = typeof yer === "string" ? S.yerler[yer] : yer;
    return S.igne(n, html, ayar);
  });
  ctx.temizlik(() => kurulan.forEach((i) => i.kaldir()));
  return kurulan;
}
