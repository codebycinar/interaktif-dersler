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
    ...ek,
  };
  return api;
}
