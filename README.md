# İnteraktif Dersler

Türkiye Yüzyılı Maarif Modeli öğretim programlarına uygun, ünite ünite hazırlanan interaktif ders içerikleri: 3B simülasyon, canlı grafik, sesli anlatım, adım adım görev ve değerlendirme.

Her ders **tek bir HTML dosyasıdır**; internetsiz açılır, akıllı tahtaya USB ile taşınabilir.

**Canlı:** <https://education.modernisler.com>

[![Yayın](https://github.com/codebycinar/interaktif-dersler/actions/workflows/yayin.yml/badge.svg)](https://github.com/codebycinar/interaktif-dersler/actions/workflows/yayin.yml)

## Hızlı başlangıç

```bash
npm install
npm run build        # dist/ altına tüm dersleri üretir
npm run dev          # değişiklikte otomatik yeniden derler
npm test             # fizik/kimya modellerinin sayısal testleri
npm run duman        # derlenmiş dersleri görünmez Chrome'da adım adım gezer
```

Derlenen dersi çift tıklayarak açabilirsiniz: `dist/10/fizik/u1-hareket.html`. Tüm dersler: `dist/index.html`.

## Müfredat verisi

MEB'in [tymm.meb.gov.tr](https://tymm.meb.gov.tr) sitesindeki öğretim programları ders, ünite ve öğrenme çıktısı düzeyinde çekilir:

```bash
python -X utf8 tools/mufredat_cek.py --sinif 10    # → mufredat/10-sinif.json
python -X utf8 tools/mufredat_md.py mufredat/10-sinif.json   # → mufredat/10-sinif.md
```

JSON'da her ünite için amaç, ders saati, öğrenme çıktıları (kod + süreç bileşenleri), içerik çerçevesi ve MEB'in önerdiği öğrenme-öğretme uygulamaları bulunur. Şu an `hazirlik`, `9`–`12` desteklenir; ortaokul/ilkokul için `SINIFLAR` eşlemesine `kademe=2` değerleri eklenecek.

## Klasör yapısı

```
engine/          Ortak ders kabuğu (tüm derslerde aynı)
  ders.js        adımlar, anlatım + sesli okuma, görevler, kontroller, sınav, ilerleme kaydı
  ders.css       arayüz (akıllı tahta / dizüstü / telefon)
  grafik.js      canlı grafik çizici (eğim üçgeni, alan boyama, sürükleme)
  sahne3d.js     three.js kurulumu, yazı etiketleri, vektör okları
dersler/<sınıf>/<ders>/<ünite>/
  main.js        dersin adımları
  sahne.js       derse özel 3B sahne
  fizik.js       sahneden bağımsız model (test edilir)
  ders.css       (isteğe bağlı) derse özel stil
katalog.json     ders listesi: başlık, merak sorusu, öğrenme çıktısı kodları, kaynak/çıktı yolu
mufredat/        MEB'den çekilen müfredat haritaları
tests/           model testleri
tools/           müfredat çekici, paketleyici
```

## Yeni ders eklemek

1. `katalog.json`'a bir kayıt ekleyin. `ciktiKodlari` müfredat dosyasındaki kodlarla birebir eşleşmeli; paketleyici resmî ifadeleri oradan alır, yanlış kodda derleme durur.
2. `dersler/...` altında `main.js` oluşturun ve `dersBaslat({ adimlar, sahneKur })` çağırın. Her adım:
   ```js
   { baslik, cikti: "FİZ.10.1.1-a", anlatim: "<p>…</p>", gorev: "…", ogretmen: "…",
     kur(ctx) { /* ctx.kaydirici, ctx.grafikler, ctx.sayiSorusu, ctx.sinav, ctx.gorevTamam … */ } }
   ```
3. `npm run build`.

## Dersler

| Sınıf | Ders | Ünite | Ders | Öğrenme çıktıları |
|---|---|---|---|---|
| 10 | Fizik | 1. Kuvvet ve Hareket | Yolda Hareket: Sabit Hız ve Sabit İvme | FİZ.10.1.1 · FİZ.10.1.2 · FİZ.10.1.3 |
| 10 | Matematik | 1. Tema: Geometrik Şekiller | Dik Üçgende Trigonometri: Açının Değişmeyen Oranları | MAT.10.1.1 |
| 10 | Matematik | 1. Tema: Geometrik Şekiller | Üçgenin Gizli Merkezleri: Yardımcı Elemanlar | MAT.10.1.2 |
| 10 | Matematik | 1. Tema: Geometrik Şekiller | Üçgende Alan, Sinüs ve Kosinüs Teoremleri | MAT.10.1.3 · MAT.10.1.4 |
| 10 | Felsefe | 1. Ünite: Felsefenin Doğası | Bilgeliği Sevmek: Felsefe Nedir, Ne İşe Yarar? | FEL.10.1.1 |
| 10 | Din Kültürü ve Ahlak Bilgisi | 1. Ünite: İslam'da Varlık ve Bilgi | Bunu Nereden Biliyorsun? Bilgi, Varlık ve Tefekkür | DKAB.10.1.1 · DKAB.10.1.2 · DKAB.10.1.3 |
| 10 | Peygamberimizin Hayatı | 1. Ünite: Taif | Taşlandığı Şehir İçin Dua: Taif'in On Bir Yılı | PH.10.1.1 · PH.10.1.2 |
| 10 | Türk Dili ve Edebiyatı | 1. Tema: Sözün Ezgisi | Koşuktan Türküye: Sözün Ezgisi | TDE2.1 · TDE2.2 · TDE2.3 · TDE2.4 · TDE3.1 · TDE3.2 · TDE3.3 · TDE3.4 |
| 10 | Türk Dili ve Edebiyatı | 1. Tema: Sözün Ezgisi | Masaldan Film Şeridine: Konuşan Kaval | TDE1.1 · TDE1.2 · TDE1.3 · TDE1.4 · TDE4.1 · TDE4.2 · TDE4.3 · TDE4.4 |
| 10 | İngilizce | Theme 1: School Life & Education | Schools Around the World: Listen and Read | ENG.10.1.L1 · ENG.10.1.L2 · ENG.10.1.L3 · ENG.10.1.L4 · ENG.10.1.P1 · ENG.10.1.R1 · ENG.10.1.R2 · ENG.10.1.R3 · ENG.10.1.R4 · ENG.10.1.V1 |
| 10 | İngilizce | Theme 1: School Life & Education | Clubs, Stress and Celebrations: Speak and Write | ENG.10.1.G1 · ENG.10.1.S1 · ENG.10.1.S2 · ENG.10.1.S3 · ENG.10.1.S4 · ENG.10.1.S5 · ENG.10.1.S6 · ENG.10.1.W1 · ENG.10.1.W2 · ENG.10.1.W3 · ENG.10.1.W4 · ENG.10.1.W5 · ENG.10.1.W6 · ENG.10.1.W7 |

Tarih, coğrafya, kimya ve bazı başka derslerde geçen tarih, sayı ve konum bilgileri öğretmen/uzman kontrolünü bekliyor; temsilî olan yerler derste belirtilir.

Yol haritası: [PLAN.md](PLAN.md)

## Yayın

`main` dalına her gönderimde GitHub Actions ([`.github/workflows/yayin.yml`](.github/workflows/yayin.yml)) sırasıyla model testlerini çalıştırır, tüm dersleri derler, görünmez Chrome'da duman testinden geçirir ve sonucu GitHub Pages'e (`education.modernisler.com`) yayınlar. Herhangi bir adım başarısız olursa yayın yapılmaz. Elle yayın yapılmaz.

## Katkı

Yeni ders yazmadan önce [docs/ders-yazim-rehberi.md](docs/ders-yazim-rehberi.md) dosyasını okuyun. Her ders MEB öğretim programındaki öğrenme çıktılarına bağlı olmalı, `npm test` ve `npm run duman` geçmelidir. Hatalı bir bilgi ya da öneri için issue açabilirsiniz; öğretmen geri bildirimleri özellikle değerlidir.

## Lisans

- **Kod** (`engine/`, `tools/`, `tests/`): [MIT](LICENSE)
- **Ders içerikleri** (`dersler/`, `docs/`): [CC BY-NC-SA 4.0](LICENSE-CONTENT.md). Okulda ve ücretsiz eğitimde serbestçe kullanılabilir ve uyarlanabilir; ticari kullanım için izin gerekir.
- **Müfredat verisi** (`mufredat/`): MEB'in kamuya açık öğretim programlarından derlenmiştir. Proje MEB ile bağlantılı değildir.
- Üçüncü taraf kütüphaneler: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

## Notlar

- **Özgünlük:** İçerikler özgün olarak yazılmıştır. İlham alınan [Tongjiang Lab](https://github.com/smithjohn78390/tongjiang-lab) CC BY-NC 4.0 lisanslıdır; oradan kod veya içerik kopyalanmamıştır.
- **Sesli anlatım** şu an tarayıcının Türkçe sesini (Web Speech API) kullanır; ses kalitesi cihaza göre değişir. Yayın öncesi kaliteli TTS ile üretilmiş ses dosyaları gömülebilir.
- **İlerleme** öğrencinin tarayıcısında saklanır (localStorage); sunucu gerekmez.
