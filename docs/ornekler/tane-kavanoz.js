// Örnek: gerçekçi tane ve cam kavanoz (mercimek, pirinç, nohut). Rehber 4a'daki araçların kullanımı.
// Bir derste kullanmak için kendi sahne.js dosyanıza uyarlayın; kap: sahnenin DOM öğesi.
import { sahne3dKur, THREE, malzeme, organiklestir, yuzeyDokusu, coklu, rastgele } from "../../engine/sahne3d.js";
export function taneSahnesi(kap) {
const S = sahne3dKur(kap, { kameraKonum: [0, 5.5, 9], hedef: [0, 1.2, 0], arkaPlan: [0xf3efe8, 0xd9d2c6] });
S.gunes.position.set(-6, 12, 8); S.gunes.shadow.camera.left = -10; S.gunes.shadow.camera.right = 10; S.gunes.shadow.camera.top = 10; S.gunes.shadow.camera.bottom = -10;
const masa = yuzeyDokusu({ boyut: 512, taban: "#9c6f47", koyu: "#6e4628", acik: "#b98c60", olcek: 4, uzama: [0.25, 3], lif: 0.45, lifSiklik: 14, benek: 0 });
masa.renk.repeat.set(5, 5); masa.puruz.repeat.set(5, 5);
const m = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: masa.renk, roughnessMap: masa.puruz, roughness: 1 }));
m.rotation.x = -Math.PI / 2; m.receiveShadow = true; S.scene.add(m);

// Tane biçimleri
function pirinc() { const g = new THREE.SphereGeometry(1, 24, 16); g.scale(0.045, 0.042, 0.13); organiklestir(g, { genlik: 0.004, olcek: 30, tohum: 2 }); return g; }
function mercimek() { const g = new THREE.SphereGeometry(1, 28, 14); g.scale(0.1, 0.034, 0.1); organiklestir(g, { genlik: 0.002, olcek: 30, tohum: 5 }); return g; }
function nohut() {
  const g = new THREE.SphereGeometry(1, 40, 28);
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i);
    const gaga = Math.max(0, v.x * 0.7 + v.y * 0.7) ** 6 * 0.35; // nohutun sivri ucu
    v.multiplyScalar(1 + gaga); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); g.scale(0.17, 0.155, 0.16);
  organiklestir(g, { genlik: 0.007, olcek: 24, tohum: 9, oktav: 4 }); return g;
}
const dPir = yuzeyDokusu({ taban: "#f4efe2", koyu: "#ddd3bd", acik: "#ffffff", olcek: 4, benek: 0.02, tohum: 4 });
const dMer = yuzeyDokusu({ taban: "#e2864a", koyu: "#c4683a", acik: "#f0a06a", olcek: 8, benek: 0.1, tohum: 7 });
const dNoh = yuzeyDokusu({ taban: "#d8b578", koyu: "#b88f50", acik: "#ead09a", olcek: 10, benek: 0.25, tohum: 11 });
const mPir = new THREE.MeshPhysicalMaterial({ map: dPir.renk, roughness: 0.32, sheen: 0.6, sheenColor: 0xffffff, clearcoat: 0.3 });
const mMer = new THREE.MeshStandardMaterial({ map: dMer.renk, roughnessMap: dMer.puruz, roughness: 0.55 });
const mNoh = new THREE.MeshStandardMaterial({ map: dNoh.renk, bumpMap: dNoh.puruz, bumpScale: 2, roughness: 0.8 });

function kavanoz(x, geo, mal, n, r0, tohum) {
  const g = new THREE.Group(); g.position.x = x; S.scene.add(g);
  const prof = [[0,0],[1.15,0],[1.25,0.08],[1.3,0.3],[1.3,2.6],[1.1,2.9],[1.0,3.1],[1.05,3.3]].map(([a,b]) => new THREE.Vector2(a,b));
  const cam = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), malzeme.cam({ kalinlik: 0.15 })); g.add(cam);
  const t = coklu(geo, mal, n, { golge: true }); g.add(t);
  const r = rastgele(tohum), H = 2.2, ust = Math.floor(n * 0.3);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, yuz = i < ust;
    const rr = yuz ? Math.sqrt(r()) * (1.24 - r0) : 1.24 - r0 - r() * r0 * 1.5;
    const y = yuz ? H - r() * r0 : r0 * 0.6 + r() * (H - r0);
    t.userData.yerlestir(i, Math.cos(a) * rr, y, Math.sin(a) * rr, 1, r() * 6.3, geo === mercimekG ? (r() - 0.5) * 2.5 : r() * 6.3);
  }
  t.userData.bitir();
  const dok = coklu(geo, mal, 14, { golge: true }); S.scene.add(dok);
  for (let j = 0; j < 14; j++) dok.userData.yerlestir(j, x + (r() - 0.5) * 2.2, r0 * 0.35, 2 + r() * 1.3, 1, r() * 6.3, geo === mercimekG ? 0 : r() * 6.3);
  dok.userData.bitir();
}
const mercimekG = mercimek();
kavanoz(-3.2, mercimekG, mMer, 6000, 0.06, 1);
kavanoz(0, pirinc(), mPir, 6000, 0.06, 2);
kavanoz(3.2, nohut(), mNoh, 1500, 0.16, 3);
S.igne([-3.2, 3.5, 0], "Mercimek"); S.igne([0, 3.5, 0], "Pirinç"); S.igne([3.2, 3.5, 0], "Nohut");
  return S;
}
