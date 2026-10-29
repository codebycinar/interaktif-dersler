// Matematik derslerinde ortak panel bileşenleri: gösterge kutusu, görev listesi, formül listesi,
// doğru/yanlış önermeleri, ispat adımı sıralama, seçmeli tablo, trigonometri hesaplayıcısı.
// Bunlar ders kabuğunda (engine/ders.js) olmayan bileşenlerdir; ortak motora alınmaya adaydır.
import { el, sayi } from "../../../../engine/ders.js";
import { stilEkle } from "./stil.js";
import { trigOranlar } from "./geometri.js";

stilEkle();

/** Sondaki sıfırları atan kısa sayı yazımı: 2,50 → 2,5 */
export function kisa(v, ondalik = 2) {
  if (!Number.isFinite(v)) return "—";
  const t = sayi(v, ondalik);
  return t.includes(",") ? t.replace(/0+$/, "").replace(/,$/, "") : t;
}
export const sec = (dizi) => dizi[Math.floor(Math.random() * dizi.length)];
export const karistir = (dizi) => dizi.map((v) => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

/** Sahnenin sol üstüne gösterge şeridi */
export function hud(ctx, liste) {
  const kap = el("div", { class: "d-etiket-hud mt-hud" });
  ctx.katman.append(kap);
  return ctx.gostergeler(liste, kap);
}

/** İşaretlenebilir görev listesi */
export function gorevListesi(ctx, maddeler, hedef = ctx.kontroller) {
  const ul = el("ul", { class: "mt-liste" });
  const li = maddeler.map((m) => el("li", { html: m }));
  ul.append(...li);
  hedef.append(ul);
  return {
    el: ul,
    isaretle(i, tamam = true) { li[i].classList.toggle("tamam", !!tamam); },
    tamamMi: (i) => li[i].classList.contains("tamam"),
    hepsi: () => li.every((l) => l.classList.contains("tamam")),
  };
}

/** Formül → değer listesi (HTML etiketli). ayarla(i, metin) */
export function formulListesi(ctx, satirlar, hedef = ctx.kontroller) {
  const kap = el("div", { class: "mt-formuller" });
  const degerler = satirlar.map((s) => {
    if (s === "-") { kap.append(el("div", { class: "mt-ayrac" })); return null; }
    const d = el("span", { class: "mt-deger" }, "—");
    kap.append(el("span", { html: s }), d);
    return d;
  }).filter(Boolean);
  hedef.append(kap);
  return { el: kap, ayarla(i, metin) { degerler[i].textContent = metin; } };
}

/**
 * Doğru / yanlış önermeler. Her yanlış cevapta açıklama gösterilir, öğrenci cevabını değiştirebilir.
 * liste: [{ metin, dogru: true|false, aciklama }]; hepsiDogru() tümü doğru cevaplanınca çağrılır.
 */
export function onermeler(ctx, liste, hepsiDogru) {
  const durum = liste.map(() => null);
  const kap = el("div", { style: "display:grid;gap:8px" });
  liste.forEach((o, i) => {
    const geri = el("div", { class: "d-geri-bildirim" });
    const kutu = el("div", { class: "mt-onerme" }, el("div", { html: o.metin }));
    const btnler = [true, false].map((v) => el("button", {
      class: "d-btn", "aria-pressed": "false",
      onclick: () => {
        btnler.forEach((b, j) => b.setAttribute("aria-pressed", String(j === (v ? 0 : 1))));
        durum[i] = v === o.dogru;
        kutu.classList.toggle("dogru", durum[i]);
        kutu.classList.toggle("yanlis", !durum[i]);
        geri.className = `d-geri-bildirim ${durum[i] ? "dogru" : "yanlis"}`;
        geri.innerHTML = durum[i] ? `Doğru. ${o.aciklama}` : `Tekrar düşün. ${o.ipucu || "Üçgen üzerinde birkaç açı deneyerek sına."}`;
        if (durum.every(Boolean)) hepsiDogru?.();
      },
    }, v ? "Doğru" : "Yanlış"));
    kutu.append(el("div", { class: "d-satir" }, btnler), geri);
    kap.append(kutu);
  });
  ctx.kontroller.append(kap);
  return { el: kap, dogruSayisi: () => durum.filter(Boolean).length };
}

/**
 * İspat adımlarını sıralama: kartlar karışık gelir, öğrenci sıradaki adımı seçer.
 * Yanlış seçimde karta özel ipucu gösterilir. bitti() tüm adımlar dizilince çağrılır.
 */
export function ispatSirala(ctx, adimlar, bitti) {
  const kap = el("div", { class: "mt-sirala" });
  const dizilen = el("ol");
  const geri = el("div", { class: "d-geri-bildirim" });
  const kartlar = el("div", { class: "mt-sirala" });
  let sira = 0;
  karistir(adimlar.map((a, i) => ({ ...a, i }))).forEach((a) => {
    const b = el("button", { class: "d-btn mt-kart", html: a.metin });
    b.addEventListener("click", () => {
      if (a.i === sira) {
        b.remove();
        dizilen.append(el("li", {}, el("span", { html: a.metin })));
        sira++;
        geri.className = "d-geri-bildirim dogru";
        geri.textContent = sira === adimlar.length ? "İspat tamamlandı ✓" : "Doğru adım. Sıradaki?";
        if (sira === adimlar.length) bitti?.();
      } else {
        b.classList.remove("yanlis"); void b.offsetWidth; b.classList.add("yanlis");
        geri.className = "d-geri-bildirim yanlis";
        geri.innerHTML = a.erken || "Bu adım için önce başka bir adıma ihtiyaç var.";
      }
    });
    kartlar.append(b);
  });
  kap.append(dizilen, kartlar, geri);
  ctx.kontroller.append(kap);
  return kap;
}

/**
 * Hücreleri açılır listeden seçilen tablo.
 * satirlar: [{ etiket, hucreler: [{ dogru, ipucu }] }], sutunlar: başlıklar, secenekler: metin listesi
 */
export function secimTablosu(ctx, { sutunlar, satirlar, secenekler, bitti }) {
  const tablo = el("table", { class: "mt-secim-tablo" });
  tablo.append(el("tr", {}, el("th"), sutunlar.map((s) => el("th", {}, s))));
  const hucreler = [];
  for (const s of satirlar) {
    const tr = el("tr", {}, el("td", {}, s.etiket));
    for (const h of s.hucreler) {
      const sel = el("select", { "aria-label": `${s.etiket} ${sutunlar[s.hucreler.indexOf(h)]}` },
        el("option", { value: "" }, "?"), secenekler.map((o) => el("option", { value: o }, o)));
      sel.addEventListener("change", () => sel.classList.remove("dogru", "yanlis"));
      hucreler.push({ sel, ...h });
      tr.append(el("td", {}, sel));
    }
    tablo.append(tr);
  }
  const geri = el("div", { class: "d-geri-bildirim" });
  const kontrol = () => {
    const yanlislar = hucreler.filter((h) => {
      const ok = h.sel.value === h.dogru;
      h.sel.classList.toggle("dogru", ok);
      h.sel.classList.toggle("yanlis", !ok && h.sel.value !== "");
      return !ok;
    });
    if (!yanlislar.length) { geri.className = "d-geri-bildirim dogru"; geri.textContent = "Tablonun tamamı doğru!"; bitti?.(); return; }
    const bos = yanlislar.filter((h) => !h.sel.value).length;
    const ilk = yanlislar.find((h) => h.sel.value);
    geri.className = "d-geri-bildirim yanlis";
    geri.innerHTML = `${hucreler.length - yanlislar.length}/${hucreler.length} doğru.${bos ? ` ${bos} hücre boş.` : ""}${ilk ? ` İpucu: ${ilk.ipucu}` : ""}`;
  };
  const kap = el("div", { style: "display:grid;gap:8px;overflow-x:auto" }, tablo,
    el("div", { class: "d-satir" }, el("button", { class: "d-btn ana", onclick: kontrol }, "Tabloyu kontrol et")), geri);
  ctx.kontroller.append(kap);
  return { el: kap, hucreler, kontrol };
}

/** Küçük trigonometri hesaplayıcısı: açı gir → sin, cos (ve istenirse tan) */
export function trigHesap(ctx, { tan = false } = {}) {
  const girdi = el("input", { type: "text", inputmode: "decimal", "aria-label": "Açı (derece)", value: "30" });
  const cikti = el("output");
  const yaz = () => {
    const v = parseFloat(girdi.value.replace(",", "."));
    if (!Number.isFinite(v)) { cikti.textContent = "—"; return; }
    const t = trigOranlar(v);
    cikti.textContent = `sin = ${sayi(t.sin, 4)}  cos = ${sayi(t.cos, 4)}${tan ? `  tan = ${Number.isFinite(t.tan) ? sayi(t.tan, 4) : "tanımsız"}` : ""}`;
  };
  girdi.addEventListener("input", yaz);
  yaz();
  const kap = el("div", { class: "mt-hesap" }, el("span", {}, "Trigonometri cetveli:"), girdi, el("span", {}, "°"), cikti);
  ctx.kontroller.append(kap);
  return kap;
}

/** Üçgen şekli belirgin biçimde değişti mi? (farklı üçgen sayacı için) */
export function sekilSayaci(esik = 0.6) {
  const goruldu = [];
  return {
    ekle(noktalar) {
      const yeni = noktalar.map((p) => [p.x, p.y]);
      const farkli = goruldu.every((g) => g.some(([x, y], i) => Math.hypot(x - yeni[i][0], y - yeni[i][1]) > esik));
      if (farkli) goruldu.push(yeni);
      return goruldu.length;
    },
    get sayi() { return goruldu.length; },
  };
}
