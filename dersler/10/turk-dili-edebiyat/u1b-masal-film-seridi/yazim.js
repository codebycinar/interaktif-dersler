// Film şeridi metinleri için basit yazım ve noktalama denetimi (TDE4.3). Kural tabanlıdır; her bulgu bir açıklama taşır.

const KUCUK = "a-zçğıöşü";
const BUYUK_HARF = (c) => c !== c.toLocaleLowerCase("tr") && c === c.toLocaleUpperCase("tr");

/** Sık yapılan yazım yanlışları → doğrusu */
export const SIK_YANLISLAR = {
  herkez: "herkes", yalnış: "yanlış", yanlız: "yalnız", yanlızca: "yalnızca", birşey: "bir şey", herşey: "her şey",
  hiçbirşey: "hiçbir şey", şuan: "şu an", malesef: "maalesef", yada: "ya da", deyil: "değil", orjinal: "orijinal",
  pekçok: "pek çok", herzaman: "her zaman", hergün: "her gün", birgün: "bir gün", heryer: "her yer", "bir kaç": "birkaç",
  "tabi ki": "tabii ki",
};

/** Özel adlar (masalın kişileri ve yerleri) */
export const OZEL_ADLAR = ["Keloğlan", "Gülsüm Sultan", "Gülsüm", "Kara Dağ"];

/**
 * @param {string} metin
 * @returns {{kural:string, mesaj:string}[]}
 */
export function yazimDenetle(metin) {
  const m = String(metin ?? "");
  const t = m.trim();
  const bulgular = [];
  const ekle = (kural, mesaj) => { if (!bulgular.some((b) => b.kural === kural && b.mesaj === mesaj)) bulgular.push({ kural, mesaj }); };
  if (!t) { ekle("bos", "Metin boş."); return bulgular; }

  const ilk = [...t.replace(/^[“"'‘(«\s—–-]+/, "")][0] || "";
  if (/\p{L}/u.test(ilk) && !BUYUK_HARF(ilk)) ekle("buyuk-bas", "Cümle büyük harfle başlar.");

  const sonsuz = t.replace(/[”"'’)»\s]+$/, "");
  if (!/[.!?…:]$/.test(sonsuz)) ekle("son-nokta", "Cümlenin sonuna uygun noktalama işareti (. ! ? …) koy.");

  if (/\s[,.;:!?](?!\.)/.test(m)) ekle("once-bosluk", "Noktalama işaretinden önce boşluk bırakılmaz.");
  if (/[,;:!?](?=[^\s"'”’)»!?.…])/.test(m) || /[.](?=[A-ZÇĞİÖŞÜa-zçğıöşü])/.test(m)) ekle("sonra-bosluk", "Noktalama işaretinden sonra bir boşluk bırak.");
  if (new RegExp(`[.!?…]\\s+[${KUCUK}]`).test(m)) ekle("cumle-basi", "Nokta, ünlem ya da soru işaretinden sonra yeni cümle büyük harfle başlar.");
  if (/ {2,}/.test(m)) ekle("cift-bosluk", "Kelimeler arasında fazladan boşluk var.");
  if (/(^|\s)(ve|ile|de|da|ki|bu|şu)\s+\2(\s|[.,!?]|$)/iu.test(m)) ekle("tekrar", "Aynı bağlaç ya da kelime üst üste yazılmış.");

  const kucukMetin = m.toLocaleLowerCase("tr");
  for (const [yanlis, dogru] of Object.entries(SIK_YANLISLAR)) {
    if (new RegExp(`(^|[^${KUCUK}])${yanlis}`, "u").test(kucukMetin)) ekle("sik-yanlis", `“${yanlis}” değil, “${dogru}” yazılır.`);
  }
  const harf = (c) => !!c && /\p{L}/u.test(c);
  for (const ad of OZEL_ADLAR) {
    const kucukAd = ad.toLocaleLowerCase("tr");
    for (let i = kucukMetin.indexOf(kucukAd); i >= 0; i = kucukMetin.indexOf(kucukAd, i + 1)) {
      if (harf(m[i - 1])) continue;
      if (!BUYUK_HARF(m[i])) ekle("ozel-ad", `Özel adlar büyük harfle başlar: “${ad}”.`);
      // özel ada gelen çekim eki kesmeyle ayrılır: Keloğlanın → Keloğlan'ın
      else if (harf(m[i + ad.length]) && !OZEL_ADLAR.some((o) => o !== ad && o.startsWith(ad) && m.startsWith(o, i))) ekle("kesme", `Özel ada gelen ek kesme işaretiyle ayrılır: “${ad}'…”.`);
    }
  }
  if (new RegExp(`[${KUCUK}]{2,}(mı|mi|mu|mü)\\?`, "u").test(kucukMetin)) ekle("soru-eki", "Soru eki “mı, mi, mu, mü” ayrı yazılır.");
  return bulgular;
}

/** Cümle geçiş ifadeleri (olay akışını bağlar) */
export const GECISLER = ["günlerden bir gün", "derken", "o sırada", "ertesi gün", "sonunda", "az gitmiş", "az gittik", "bunun üzerine", "o günden sonra", "bir zamanlar", "evvel zaman"];
export const gecisVarMi = (metin) => GECISLER.some((g) => String(metin).toLocaleLowerCase("tr").trim().replace(/^[“"]/, "").startsWith(g));

/** Bağlama uygun söz varlığı: deyim ve atasözleri */
export const SOZ_VARLIGI = [
  { ad: "dile gelmek", re: /dile gel/ },
  { ad: "yola düşmek", re: /yola düş/ },
  { ad: "gözleri dolmak", re: /göz(ler)?i dol/ },
  { ad: "ağzını bıçak açmamak", re: /ağzını bıçak aç/ },
  { ad: "ödü kopmak", re: /ödü kop/ },
  { ad: "kulak vermek", re: /kulak ver/ },
  { ad: "Tatlı dil yılanı deliğinden çıkarır.", re: /tatlı dil yılanı deliğinden çıkarır/ },
  { ad: "İyilik eden iyilik bulur.", re: /iyilik eden iyilik bulur/ },
];
export const sozVarligiBul = (metin) => SOZ_VARLIGI.filter((s) => s.re.test(String(metin).toLocaleLowerCase("tr"))).map((s) => s.ad);
