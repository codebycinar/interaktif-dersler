# Ders Yazım Rehberi

Bu rehber, projeye yeni bir ders ekleyen herkes (insan ya da yapay zekâ ajanı) içindir. Kalite çıtası pilot derstir: `dersler/10/fizik/u1-hareket/`. Yazmaya başlamadan önce o klasördeki dosyaları ve `engine/` altındaki dört dosyayı okuyun.

## 1. Amaç ve hedef kitle

- Türkiye Yüzyılı Maarif Modeli (TYMM) öğretim programına **birebir uygun**, ünite ünite interaktif dersler.
- Kullanım: öğretmen akıllı tahtada sınıfla birlikte (dokunmatik, büyük ekran) **ve** öğrenci kendi cihazında (dizüstü / telefon).
- Dil: Türkçe. MEB ders kitaplarındaki terimleri kullanın. Öğrenciye “sen” diye hitap edin, sade ve kısa cümleler kurun.

## 2. Müfredat verisi

`mufredat/<sınıf>-sinif.json` → `dersler[].uniteler[]` her ünite için şunları içerir:

| Alan | Ne için kullanılır |
|---|---|
| `amac`, `ders_saati` | Ünitenin kapsamı |
| `ogrenme_ciktilari[]` (`kod`, `ifade`, `surec_bilesenleri`) | **Her adım bir süreç bileşenine bağlanır** (`cikti: "FİZ.10.1.1-a"`) |
| `icerik_cercevesi`, `anahtar_kavramlar` | Kapsam ve terimler |
| `temel_kabuller` | Öğrencinin bildiği kabul edilenler |
| `ogrenme_ogretme_uygulamalari` | MEB'in önerdiği etkinlikler: adımları ve öğretmen notlarını bunlardan türetin |
| `ogrenme_kanitlari` | Değerlendirme adımı için ipucu |

Ünitenin **tüm öğrenme çıktılarını** kapsayın. Bir derste 7–10 adım olsun. Ünite büyükse 2–3 derse bölün (`u1a-…`, `u1b-…`).

## 3. Ders klasörü

```
dersler/<sınıf>/<ders-slug>/u<no>-<konu>/
  ders.json     katalog kaydı (zorunlu)
  main.js       adımlar + dersBaslat(...) (zorunlu)
  *.js          sahne, model vb. (model kodunu sahneden ayırın: test edilebilsin)
  ders.css      derse özel stil (sınıf adlarına ders önekini koyun: .kim-…, .tar-…)
  duman.mjs     derse özel tarayıcı senaryosu (önerilir)
```

`ders.json`:

```json
{
  "slug": "kim10-u1-tepkimeler",
  "sinif": 10,
  "ders": "Kimya",
  "unite": "1. Tema: Etkileşim",
  "baslik": "Kısa, merak uyandıran başlık",
  "soru": "Günlük hayattan, Türkiye bağlamında bir merak sorusu",
  "tur": "3B simülasyon + …",
  "mufredat": "mufredat/10-sinif.json",
  "uniteId": 138,
  "ciktiKodlari": ["KİM.10.1.1", "KİM.10.1.2"]
}
```

`uniteId` müfredat dosyasındaki ünitenin `id` alanıdır (zorunlu tutun: bazı derslerde kodlar üniteler arasında tekrar eder, ör. `TDE1.1`). `ciktiKodlari` o ünitedeki kodlarla **birebir** (Türkçe büyük harfler dahil) aynı olmalı; yoksa derleme durur.

## 4. Ders kabuğu (engine)

`dersBaslat({ adimlar, sahneKur })`. `sahneKur(kap)` sahne alanını bir kez kurar ve `engine/sahne3d.js` ile 3B dünyayı oluşturur (bkz. 4a). Her adım şu biçimdedir:

```js
{ baslik, cikti, anlatim /* HTML, 2–4 kısa paragraf */, gorev /* HTML */, ogretmen /* HTML */,
  kur(ctx) { … }, kaldir(ctx) { … } /* isteğe bağlı */ }
```

`ctx` içinde şunlar var: `sahne`, `katman` (sahne üstü HTML katmanı; adım değişince temizlenir), `kontroller`, `kaydirici`, `dugmeler`, `secenekler`, `gostergeler`, `tablo`, `not`, `sayiSorusu`, `yaziAlani`, `grafikler`, `sinav`, `gorevTamam`, `temizlik`, `seslendir(metin, { dil, hiz })` (Promise; diyalog, şiir, dinleme etkinliği için). Ayrıntılar `engine/ders.js`'te.

Yabancı dil derslerinde `ders.json`'a `"dil": "en-GB"` (veya `en-US`) ekleyin. Anlatımın sesli okunması o dilde yapılır. Arayüz düğmeleri Türkçe kalır.

- Zamanlayıcı, animasyon ve dinleyicileri `ctx.temizlik(fn)` ile kaydedin; adım değişince durdurulmalı.
- `ctx.gorevTamam()` yalnızca görev **gerçekten** yapıldığında çağrılmalı.
- Son adım bir değerlendirme olmalı: `ctx.sinav(sorular, { gecmeOrani })`, 6–10 soru, her sorunun açıklaması olsun. Kabuktaki türler `coktan` ve `sayi`; `grafik: (kap) => …` ile soruya görsel eklenebilir.
- Kabukta olmayan bir bileşen gerekirse (eşleştirme, sıralama, sürükle-bırak, harita, ses vb.) **kendi ders klasörünüzde** yazın. `engine/`'i değiştirmeyin; ortak motora alınmaya aday bileşenleri raporunuzda belirtin.

## 4·0. Önce anlat, sonra uygulat (adım adım anlatım)

Öğrenci geri bildirimi: “Anlatmıyor, daha çok pratik bunlar.” Uzun paragraf + hemen alıştırma **olmaz**. Her adım üç bölümdür:

1. **Gösteriyorum** — `anlat` kareleri. Kısa cümleler tek tek gelir; her kare sahnede bir şey yapar (`yap(api, ctx)`: araç hareket eder, parça parlar, kamera yaklaşır).
2. **Birlikte yapalım** — çözümlü örnek (`cozum: [...]`, satır satır açılır) ve araya serpiştirilmiş mini sorular (`soru`, yanlışta ipucu verir, doğruyu bulmadan geçilmez).
3. **Şimdi sen dene** — adımın görevi ve kontrolleri. Kabuk bunları anlatım bitince açar.

```js
{
  baslik, cikti, gorev, ogretmen,
  anlatim: "<p>Kısa özet (📄 Özet düğmesinde ve tekrar ziyarette görünür)</p>",
  kur(ctx) { …; return { sur, yerlestir } },     // dönen nesne kareler için "api" olur
  anlat: [
    { s: "Araç şimdi <b>20 m</b> işaretinde. Bu, aracın <b>konumudur</b>.", yap: (api) => api.yerlestir(20) },
    { formul: [["Δx", "yer değiştirme"], ["="], ["x<sub>son</sub>", "son konum"], ["−"], ["x<sub>ilk</sub>", "ilk konum"]], oku: "…" },
    { cozum: ["İlk konum: 20 m", "Son konum: 70 m", "Δx = 70 − 20", "Δx = 50 m"] },
    { soru: "Toplam kaç metre yol aldı?", secenekler: ["20 m", "50 m", "80 m"], dogru: 2, aciklama: "…", ipucu: "…" },
    { s: "…", etkilesim(api, ctx, tamam, kap) { /* öğrenci sahnede bir şey yapınca tamam() */ } },
  ],
  anlatBitti(api) { /* gösterimin bıraktığı durumu alıştırma için sıfırla */ },
}
```

Kurallar:
- **Bir kare = bir fikir.** En fazla iki kısa cümle (≈ 20 kelime). Terimi önce gündelik dille, sonra adıyla verin: “Bir saniyede alınan yola **hız** diyoruz.”
- **Önce sezgi ve somut sayı, sonra formül.** Formül hiçbir zaman ilk karede gelmez. `formul` ile sembol sembol kurun; her sembolün altında Türkçe anlamı yazsın. Hemen ardından sayılarla bir `cozum` gelsin.
- **Her 3–4 karede bir mini soru.** Kavram yanılgısını hedefleyen çeldirici, yanlışta yol gösteren `ipucu`, doğruda “neden” açıklaması.
- **Anlatımda sahne sade olmalı.** Kareler oynarken motor grafik panellerini (`ctx.grafikler`) gizler; grafiğe değinen kare `{ s: "…", grafik: true }` ile açar. Sahne katmanına (`ctx.katman`) eklediğiniz alıştırma parçalarına (sınıflandırma kartı, soru kutusu) `d-alistirma` sınıfını verin; motor onları anlatım bitene dek gizler (`ctx.sinav` örtüsü bunu kendiliğinden yapar). Diğer yüzen panelleri `ctx.gosteriyor()` / `d-gosterim` olayıyla gizleyin; yalnızca karenin söz ettiği şey ekranda olsun. 3B iğneler bir panelin altına düşerse motor onları gizler.
- **Her kare tek bir odak.** Karede adı geçen nesne ekranda açıkça görünmeli: kamera ona gider (`kameraGit`), görüş alanının en az üçte birini kaplar, iğnesi vurgulanır, diğerleri soluklaşır. Öğrenci ilk bakışta "neye bakıyorum?" sorusunun cevabını görmeli.
- **Gözden geçirme.** Bitirmeden önce `node tools/gozden.mjs <slug>` ile her adımın ilk ve orta karesine 1520×900 ve telefon boyutunda bakın; boş grafik, üst üste binen etiket, odaksız kare kalmasın.
- **Gösterim görevi tamamlatmaz.** Kareler oynarken ve `anlatBitti` çalışırken motor `ctx.gorevTamam()` çağrılarını yok sayar (`ctx.gosteriyor()` true döner); ↺ Baştan ile yeniden izlemede de alıştırma bölümü gizlenir. Görev maddelerini kendiniz işaretliyorsanız `ctx.gosteriyor()` iken işaretlemeyin. Durum değişince `document` üzerinde `d-gosterim` olayı yayınlanır (`e.detail.gosteriyor`); alıştırma panellerini anlatım boyunca gizlemek için bunu dinleyin. Cevabı gösterimde vermeyin (öğrencinin bulacağı değeri değil, başka bir örneği kullanın); `anlatBitti` ile sahneyi alıştırmaya hazırlayın.
- Bir adımda 6–12 kare. Sağ ok tuşu ve sunum kumandası önce kareleri ilerletir.
- Sesli anlatım her kareyi okur (kare `oku` alanıyla özel okunuş verebilir: “delta x eşittir…”).

## 4a. Görsel kalite: 3B dünya ve gerçekçilik

Çıta: öğrenci ekrana baktığında bir **yer** görmeli (laboratuvar masası, çayır, sera, kale, sınıf), şema değil.

- **Her dersin kalıcı bir 3B dünyası olur.** Adımlar aynı dünyada geçer; kamera `S.kameraGit({ konum, hedef, sure })` ile adımlar arasında yumuşakça kayar (yaprak → hücre → kloroplast gibi ölçek geçişleri dahil). 2B yalnızca doğası gereği düzlem olan şeyler için: grafik, nota, formül, metin, harita üstü çizim. Bunlar da 3B sahnenin üstünde yüzen panel olarak gelir.
- **Tam ekran yerleşim:** `ders.json`'a `"yerlesim": "tam"` ekleyin. Sahne tüm ekranı kaplar, adım listesi, anlatım ve alt çubuk üstünde yüzer; öğretmen `P` ile paneli gizleyebilir. Kamera merkezi görünür alana kendiliğinden kaydırılır.
- **Gerçek biçim ve malzeme.** Kusursuz küre/silindir/kutu ile doğal nesne yapılmaz:
  - Biçim: `organiklestir(geo, { genlik, olcek })` ile yüzeye doğal düzensizlik verin; `LatheGeometry` ile kavanoz/beher/şişe, `TubeGeometry` ile boru/dal/damar, `ExtrudeGeometry` ile yaprak ve plaka. Gerçek oranlara uyun (nohut ≈ 3 mercimek çapı, pirinç tanesi boyu eninin ≈ 3 katı).
  - Yüzey: `yuzeyDokusu({ taban, koyu, acik, olcek, benek, lif, uzama })` ile renk + pürüz dokusu (benekli tane, lifli ahşap, damarlı yaprak, toprak).
  - Malzeme: `malzeme.cam()`, `sivi()`, `metal()`, `plastik()`, `mat()`, `isik()`. Sahnede stüdyo yansıması (PBR) ve gölge hazır; `MeshBasicMaterial` ile düz renk boyamayın.
  - Çok sayıda aynı nesne (tane, çimen, kabarcık, molekül, asker): `coklu(geo, malz, sayi)` (InstancedMesh). Binlerce kopya sorun değil; yalnızca görünen kabuğu doldurun.
  - Cam içindeki nesnelere `transmission` vermeyin (three.js cam arkasındaki saydam nesneyi çizmez); yarı saydamlık için `sheen`/`clearcoat` kullanın.
- **Etiketler nesneye bağlı:** `S.igne(nesne, "Tilakoit<small>ışığa bağımlı</small>", { renk, no, tik })`. Ekranda sabit duran yazı yerine nesneyle birlikte hareket eder.
- **Arka plan:** `arkaPlan: [üst, alt]` renk geçişi + `S.zemin()`; boşlukta yüzen nesne yerine bir zemin/masa/arazi olsun.
- **Kalite ve hız:** Motor `?kalite=dusuk|orta|yuksek` ile ve kare hızı düştüğünde kendiliğinden kaliteyi azaltır. Sahneyi 1400×840'ta 30 fps'nin üstünde tutun: geometri ayrıntısını uzaktaki nesnelerde düşürün, gölgeyi yalnızca gereken nesnelere verin.
- **Kendinize sorun:** Ekran görüntüsünü gerçek nesnenin fotoğrafıyla yan yana koysanız, öğrenci hangisinin ne olduğunu hemen tanır mı? Tanımıyorsa biçim, oran, renk ya da doku eksiktir.

## 5. İyi bir adımın ölçütü

- **Öğrenci bir şey yapar, ekran tepki verir.** “Metni oku, İleri'ye bas” slaytı olmaz. Her adımda değiştirilebilen bir model, görsel ya da karar olmalı.
- Önce tahmin ya da iddia, sonra deney ya da gözlem, sonra genelleme. MEB'in tümevarım ve sorgulama vurgusuna uyun.
- Gerçek hayat ve Türkiye bağlamı: şehirler, gündelik durumlar, yerel örnekler.
- Yanlış cevapta neden yanlış olduğunu söyleyen geri bildirim verin. Kavram yanılgılarını hedefleyen çeldiriciler kullanın.
- Öğretmen notu, MEB'in `ogrenme_ogretme_uygulamalari` metnindeki önerilere dayanmalı.

## 6. Teknik kurallar

- **İnternetsiz çalışmalı:** çalışma anında CDN, ağ isteği ya da harici görsel/font yok. Her şey paketlenir.
- Kullanılabilir kütüphaneler (kurulu): `three`, `d3-geo`, `topojson-client`, `world-atlas` (Natural Earth ülke sınırları, 110m/50m). **Yeni paket kurmayın.**
- Paket boyutu hedefi 2 MB'ın altı. 50m harita yerine mümkünse 110m kullanın, büyük JSON'ları kırpın.
- Görseller kodla üretilmeli: canvas, SVG, three.js. Telifli görsel kullanılmaz.
- 390 px genişlikte (telefon) ve 1400×840 (akıllı tahta) düzgün görünmeli. Dokunmatikle kullanılabilmeli.
- Ses: Web Audio API (müzik) ve kabuğun sesli okuması. Ses dosyası gömülmez.

## 7. İçerik doğruluğu ve telif

- Bilimsel, tarihî ve dinî bilgiler doğru olmalı; tarih, sayı ve formülleri iki kez kontrol edin. Hesaplanan her model için `tests/<slug>.test.mjs` yazın.
- **Edebî metinler:** yalnızca 1956'dan önce ölmüş yazarların eserleri (Türkiye'de telif ölümden sonra 70 yıl sürer) ya da **anonim halk edebiyatı** (türkü, mani, destan). Bunların dışında kalan metinleri kendiniz özgün olarak yazın. Ders kitabından ya da web sitelerinden metin kopyalamayın.
- Müzik: anonim türküler ve geleneksel ezgiler serbesttir. Telifli şarkı sözü ve melodi kullanılmaz.
- Din kültürü: MEB programına sadık, tarafsız ve saygılı bir dil kullanın. Ayet ve hadislerde kaynak gösterin (ör. Bakara 2/255) ve anlamı kısa, kendi ifadenizle verin; uzun meal metni kopyalamayın. Mezhepler arası konularda programın çerçevesinde kalın.
- Tarih ve coğrafya haritaları: elle çizilen sınırlar “yaklaşık/temsilî” diye etiketlenmeli. Modern sınırlar `world-atlas`'tan alınır.
- Emin olmadığınız her bilgiyi raporda **“uzman kontrolü gerekli”** başlığı altında listeleyin.

## 8. Derleme ve test

```bash
node tools/paketle.mjs --sadece <slug>        # yalnızca kendi dersinizi derleyin
node --test tests/<slug>.test.mjs             # model testleri
node tools/duman.mjs <slug>                   # görünmez Chrome'da tüm adımları gezer
```

`duman.mjs` her adımın ekran görüntüsünü yazdığı klasörü çıktının sonunda gösterir. Görüntüleri **tek tek açıp bakın**: üst üste binen öğe, taşan metin, boş sahne, okunmayan grafik varsa düzeltin. Derse özel `duman.mjs` ile görevleri programla tamamlayıp `kontrol(...)` ile doğrulayın (örnek: fizik dersi).

Ders bitti sayılmadan önce: derleme hatasız olmalı, duman testi `✓` vermeli, model testleri geçmeli ve tüm ekran görüntüleri gözden geçirilmiş olmalı.
