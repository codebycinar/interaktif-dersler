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
