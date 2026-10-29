// Matematik derslerinde gerçek dünya bağlamları için 3B sahne: tahtanın yerine açılır, adım değişince kapanır.
// Ölçülen nesne 3B dünyada durur; çizim ve hesap yüzen panelde (yuzenPanel) yapılır.
// Ayrıca: zeminde sürüklenebilir tutamaklar, doğal yapı parçaları (ağaç, ev, insan, taş zemin).
import { el } from "../../../../engine/ders.js";
import { sahne3dKur, malzeme, organiklestir, yuzeyDokusu, coklu, rastgele, THREE } from "../../../../engine/sahne3d.js";
import { stilEkle } from "./stil.js";

export { THREE, malzeme, organiklestir, yuzeyDokusu, coklu, rastgele };

/**
 * Adım için 3B dünyayı açar (tahtayı gizler). Adım değişince renderer ve tüm kaynaklar serbest bırakılır.
 * Dönen: { S, kap, tutamak, ekran }
 */
export function dunyaAc(ctx, ayar = {}) {
  stilEkle();
  ctx.sahne.gizle(true);
  const kap = el("div", { class: "mt-dunya" });
  ctx.katman.parentElement.insertBefore(kap, ctx.katman);
  const S = sahne3dKur(kap, { isik: "studyo", ...ayar });
  const tutamaklar = {};
  const v = new THREE.Vector3();
  /** Dünya noktasının sayfadaki konumu (duman testleri de kullanır) */
  const ekran = (x, y, z) => {
    v.set(x, y, z).project(S.camera);
    const r = S.renderer.domElement.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  };
  kap.__ekran = ekran;
  // kamera geçişi sürerken duman testleri beklesin
  kap.__gecis = 0;
  const git = S.kameraGit;
  S.kameraGit = (o) => { kap.__gecis++; return git(o).finally(() => { kap.__gecis--; }); };
  kap.__tutamak = (ad) => { const t = tutamaklar[ad]; t.nesne.getWorldPosition(v); return ekran(v.x, v.y, v.z); };

  /* Sürükleme: tutamağa basılınca yörünge kontrolü durur, nokta y yüksekliğindeki yatay düzlemde gezer */
  const isin = new THREE.Raycaster(), fare = new THREE.Vector2(), duzlem = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), kesis = new THREE.Vector3();
  let surulen = null;
  const fareyiAyarla = (e) => {
    const r = S.renderer.domElement.getBoundingClientRect();
    fare.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    isin.setFromCamera(fare, S.camera);
  };
  const tuval = S.renderer.domElement;
  const bas = (e) => {
    fareyiAyarla(e);
    const adaylar = Object.values(tutamaklar).filter((t) => t.etkin());
    const vur = isin.intersectObjects(adaylar.map((t) => t.alan), true)[0];
    if (!vur) return;
    surulen = adaylar.find((t) => t.alan === vur.object || t.alan.getObjectById(vur.object.id));
    if (!surulen) return;
    S.kontrol.enabled = false;
    tuval.setPointerCapture?.(e.pointerId);
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  const tasi = (e) => {
    fareyiAyarla(e);
    if (!surulen) {
      const ust = isin.intersectObjects(Object.values(tutamaklar).filter((t) => t.etkin()).map((t) => t.alan), true).length;
      tuval.style.cursor = ust ? "grab" : "";
      return;
    }
    duzlem.constant = -surulen.y;
    if (!isin.ray.intersectPlane(duzlem, kesis)) return;
    const p = surulen.kisit({ x: kesis.x, z: kesis.z });
    if (p) surulen.degisti(p);
    tuval.style.cursor = "grabbing";
  };
  const birak = () => {
    if (!surulen) return;
    const t = surulen;
    surulen = null;
    S.kontrol.enabled = true;
    tuval.style.cursor = "";
    t.birakti?.();
  };
  tuval.addEventListener("pointerdown", bas, { capture: true });
  tuval.addEventListener("pointermove", tasi);
  tuval.addEventListener("pointerup", birak);
  tuval.addEventListener("pointercancel", birak);

  ctx.temizlik(() => {
    S.renderer.setAnimationLoop(null);
    S.kontrol.dispose();
    S.scene.traverse((o) => {
      o.geometry?.dispose();
      const m = o.material;
      for (const x of Array.isArray(m) ? m : m ? [m] : []) {
        for (const d of ["map", "roughnessMap", "bumpMap", "normalMap"]) x[d]?.dispose?.();
        x.dispose();
      }
    });
    S.scene.environment?.dispose?.();
    S.scene.background?.dispose?.();
    S.renderer.dispose();
    S.renderer.forceContextLoss();
    kap.remove();
  });

  return {
    S, kap, ekran,
    /**
     * Sürüklenebilir nesne. alan: tıklanacak nesne (Object3D), nesne: konumu okunacak nesne.
     * kisit({x, z}) → {x, z} | null ; degisti({x, z}) ; birakti()
     */
    tutamak(ad, { alan, nesne = alan, y = 0, kisit = (p) => p, degisti, birakti, etkin = () => true }) {
      tutamaklar[ad] = { alan, nesne, y, kisit, degisti, birakti, etkin };
    },
  };
}

/** Sahnenin üstünde yüzen küçük çizim/hesap paneli (konum: "sol-alt" | "sag-ust" | "sag-alt"). İçine sekilCiz ile çizim yapılır. */
export function yuzenPanel(ctx, baslik, { konum = "sol-alt" } = {}) {
  stilEkle();
  const govde = el("div", { class: "mt-yuzen-govde" });
  const kap = el("div", { class: `mt-yuzen ${konum}` }, baslik ? el("div", { class: "mt-yuzen-baslik" }, baslik) : null, govde);
  ctx.katman.append(kap);
  return govde;
}

/** Küçük nesneleri kolay tutmak için görünmez, geniş dokunma alanı (tutamak alanı olarak verilir) */
export function dokunmaAlani(yaricap = 2, boy = 4) {
  const m = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
  const c = new THREE.Mesh(new THREE.CylinderGeometry(yaricap, yaricap, boy, 12), m);
  c.position.y = boy / 2;
  return c;
}

/** Sürüklenebilir nesnenin altındaki parlak halka */
export function halka(yaricap = 1.2, renk = 0xffb547) {
  const h = new THREE.Mesh(new THREE.RingGeometry(yaricap * 0.78, yaricap, 40), malzeme.isik(renk, 1.1));
  h.rotation.x = -Math.PI / 2;
  h.position.y = 0.04;
  return h;
}

/* ---------------- Doğal yapı parçaları ---------------- */

/** Dokulu zemin (taş, çim, toprak). tekrar: doku kaç kez tekrarlansın */
export function dokuluMalzeme({ tekrar = [1, 1], puruz = 0.9, ...doku } = {}) {
  const d = yuzeyDokusu(doku);
  for (const t of [d.renk, d.puruz]) t.repeat.set(...tekrar);
  return new THREE.MeshStandardMaterial({ map: d.renk, roughnessMap: d.puruz, bumpMap: d.puruz, bumpScale: 0.6, roughness: puruz, metalness: 0 });
}

/** Yaprak kümesi gövdeli ağaç; boy metre */
export function agac(r, boy = 6) {
  const g = new THREE.Group();
  const govde = new THREE.Mesh(organiklestir(new THREE.CylinderGeometry(boy * 0.035, boy * 0.06, boy * 0.45, 7, 3), { genlik: boy * 0.01, olcek: 2 }), malzeme.mat(0x5b4330));
  govde.position.y = boy * 0.22;
  govde.castShadow = true;
  g.add(govde);
  const yesil = [0x3f6b35, 0x4b7a3a, 0x355e2e][Math.floor(r() * 3)];
  for (let i = 0; i < 4; i++) {
    const t = new THREE.Mesh(organiklestir(new THREE.IcosahedronGeometry(boy * (0.2 + r() * 0.08), 2), { genlik: boy * 0.05, olcek: 1.2 / boy * 4, tohum: i + 1 }), malzeme.mat(yesil, { puruz: 0.95 }));
    t.position.set((r() - 0.5) * boy * 0.25, boy * (0.55 + r() * 0.25), (r() - 0.5) * boy * 0.25);
    t.castShadow = true;
    g.add(t);
  }
  return g;
}

/** Kırma çatılı ev: gen × der taban, yuk duvar yüksekliği (metre) */
export function ev({ gen = 8, der = 7, yuk = 6, duvar = 0xe8dcc8, cati = 0xa4553a, duvarMalz, catiMalz } = {}) {
  const g = new THREE.Group();
  const d = new THREE.Mesh(new THREE.BoxGeometry(gen, yuk, der), duvarMalz || malzeme.mat(duvar));
  d.position.y = yuk / 2;
  d.castShadow = d.receiveShadow = true;
  // dört yüzlü kırma çatı
  const c = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(gen, der) / 2 * 1.08, Math.min(gen, der) * 0.42, 4, 1), catiMalz || malzeme.mat(cati, { puruz: 0.7 }));
  c.rotation.y = Math.PI / 4;
  c.scale.set(1, 1, der / gen);
  c.position.y = yuk + Math.min(gen, der) * 0.21;
  c.castShadow = true;
  // pencereler
  const cam = malzeme.plastik(0x24364a, { puruz: 0.15, parlak: 0.8 });
  const katSayisi = Math.max(1, Math.round(yuk / 3));
  for (let k = 0; k < katSayisi; k++) for (let i = 0; i < Math.max(1, Math.floor(gen / 3)); i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 0.1), cam);
    p.position.set(-gen / 2 + (i + 0.5) * (gen / Math.max(1, Math.floor(gen / 3))), 1.7 + k * 3, der / 2 + 0.03);
    g.add(p);
  }
  g.add(d, c);
  return g;
}

/** Basit insan figürü (≈1,7 m); göz yüksekliği ≈ 1,6 m */
export function insan({ giysi = 0x3d6fb6, pantolon = 0x2b2f3a, ten = 0xd9a77c } = {}) {
  const g = new THREE.Group();
  const m = (r) => malzeme.mat(r, { puruz: 0.8 });
  for (const z of [-0.11, 0.11]) {
    const bacak = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.72, 4, 8), m(pantolon));
    bacak.position.set(0, 0.44, z);
    g.add(bacak);
  }
  const govde = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.42, 4, 10), m(giysi));
  govde.position.y = 1.16;
  govde.scale.set(0.8, 1, 1.15);
  g.add(govde);
  const bas = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 12), m(ten));
  bas.position.y = 1.6;
  g.add(bas);
  const sac = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), m(0x2a1d14));
  sac.position.y = 1.62;
  g.add(sac);
  for (const z of [-0.26, 0.26]) {
    const kol = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.5, 4, 8), m(giysi));
    kol.position.set(0, 1.08, z);
    g.add(kol);
  }
  g.traverse((o) => { o.castShadow = true; });
  return g;
}

/** İki 3B nokta arasında ince çubuk/ışın (bakış çizgisi, ölçü ipi). ust: true ise öbür nesnelerin üstünde görünür */
export function cubuk(p, q, { renk = 0xffe066, kalinlik = 0.08, isikli = true, ust = false, opaklik = 1 } = {}) {
  const a = new THREE.Vector3(...p), b = new THREE.Vector3(...q);
  const m = isikli ? malzeme.isik(renk, 1.2) : malzeme.mat(renk);
  if (ust || opaklik < 1) { m.transparent = true; m.opacity = opaklik; m.depthTest = !ust; }
  const c = new THREE.Mesh(new THREE.CylinderGeometry(kalinlik, kalinlik, 1, 8), m);
  c.userData.ayarla = (p2, q2) => {
    a.set(...p2); b.set(...q2);
    const L = a.distanceTo(b);
    c.scale.set(1, Math.max(L, 1e-4), 1);
    c.position.copy(a).add(b).multiplyScalar(0.5);
    c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  };
  c.userData.ayarla(p, q);
  if (ust) c.renderOrder = 10;
  return c;
}

/** Yerdeki boya şeridi (inşa çizgisi): (x, z) düzleminde p → q, yerden y yukarıda */
export function serit(p, q, { renk = 0xffe066, genislik = 0.25, y = 0.03, isikli = true } = {}) {
  const m = isikli ? malzeme.isik(renk, 0.9) : malzeme.mat(renk);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m);
  s.rotation.x = -Math.PI / 2;
  s.userData.ayarla = (p2, q2) => {
    const dx = q2.x - p2.x, dz = q2.z - p2.z, L = Math.hypot(dx, dz) || 1e-4;
    s.scale.set(L, genislik, 1);
    s.position.set((p2.x + q2.x) / 2, y, (p2.z + q2.z) / 2);
    s.rotation.set(-Math.PI / 2, 0, -Math.atan2(dz, dx));
  };
  s.userData.ayarla(p, q);
  return s;
}
