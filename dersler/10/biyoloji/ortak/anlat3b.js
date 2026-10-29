// Biyoloji 10 (u1b, u1c): adım adım anlatım karelerinin (rehber 4·0) 3B sahneyle konuşması için yardımcılar.
// Motor adayı: iğne vurgulama (seçileni parlat, diğerlerini soldur) ve nesneye yaklaşan kamera.
import { THREE } from "./dunya3b.js";

const _v = new THREE.Vector3();
/** Kamerayı sahnedeki bir nesneye yaklaştırır (şimdiki bakış yönünü koruyarak); dy < 0 nesneyi ekranda yukarı alır */
export function odakla(S, hedef, uzak = 6, sure = 1.2, dy = 0) {
  hedef.getWorldPosition(_v);
  _v.y += dy;
  const k = S.camera.position.clone().sub(_v).setY(0).normalize();
  return S.uc({ konum: [_v.x + k.x * uzak, _v.y + uzak * 0.55, _v.z + k.z * uzak], hedef: [_v.x, _v.y, _v.z], sure });
}

/**
 * Bir adımın anlatım api'si. igne() ile açılan iğneler vurgulanabilir.
 *   bak(bakış | {konum, hedef}) · odak(nesne, uzaklık) · vurgula(...iğneler) · don()
 * yer: yer adı ya da [yer adı, adımın bakışı]; ek: adıma özgü işlevler (api'ye eklenir)
 */
export function anlatApi(S, ctx, yer, ek = {}) {
  const [yerAd, anaBakis = "ana"] = [].concat(yer);
  const igneler = new Set();
  // Yüzen şema panelleri (.bio-yuzen) de motorun grafik panelleri gibi anlatımda gizlidir; api.grafik() açar
  const yuzenler = () => ctx.katman.querySelectorAll(".bio-yuzen");
  const gosterim = (e) => { if (e.detail.adim === ctx.adimNo && e.detail.gosteriyor) yuzenler().forEach((p) => p.classList.remove("acik")); };
  document.addEventListener("d-gosterim", gosterim);
  ctx.temizlik(() => document.removeEventListener("d-gosterim", gosterim));
  // Sahne üstünde yüzen panellerin (grafik, şema) altına düşen iğneler soluklaşır; etiket panelin üstüne binmez
  let kare = 0;
  S.adimKare(ctx, () => {
    if (++kare % 4) return;
    // görünmeyen (anlatımda gizli) paneller sayılmaz
    const paneller = [...ctx.katman.querySelectorAll(".d-grafikler, .bio-yuzen")].filter((p) => +getComputedStyle(p).opacity > 0.5).map((p) => p.getBoundingClientRect());
    for (const n of igneler) {
      const r = n.el.querySelector("span").getBoundingClientRect();
      n.el.classList.toggle("bio-ortuk", paneller.some((p) => r.right > p.left && r.left < p.right && r.bottom > p.top && r.top < p.bottom));
    }
  });
  const api = {
    /** S.adimIgne gibi; iğneyi vurgulanabilir listeye de ekler */
    igne(hedef, html, ayar) { const n = S.adimIgne(ctx, hedef, html, ayar); igneler.add(n); return n; },
    bak: (b = anaBakis, sure = 1.4) => S.git(yerAd, b, { sure }),
    odak: (nesne, uzak, sure, dy) => odakla(S, nesne, uzak, sure, dy),
    /** Verilen iğneleri parlatır, diğerlerini soldurur; boş çağrı hepsini normale döndürür */
    vurgula(...secilen) {
      const v = new Set(secilen.flat().filter(Boolean));
      for (const n of igneler) {
        n.el.classList.toggle("bio-vurgu", v.has(n));
        n.el.classList.toggle("bio-soluk", v.size > 0 && !v.has(n));
      }
    },
    don() { api.vurgula(); return api.bak(); },
    /** Anlatımda yüzen şema panelini gösterir (grafiğe değinen kare) */
    grafik() { yuzenler().forEach((p) => p.classList.add("acik")); },
    ...ek,
  };
  return api;
}
