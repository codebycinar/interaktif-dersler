# Üretim Planı

Sıra: **10. sınıf → 9. sınıf → ortaokul (7 → 6 → 5) → ilkokul**. Her sınıfta önce görselleştirmeden en çok fayda gören üniteler.

Müfredat haritaları: [`mufredat/10-sinif.md`](mufredat/10-sinif.md), [`mufredat/9-sinif.md`](mufredat/9-sinif.md)

Durum: ✅ hazır · 🔜 sıradaki · ⬜ planlandı

## Format türleri

| Kod | Format | Nerede |
|---|---|---|
| **3B** | three.js sahne + canlı grafik + adım adım görev (Tongjiang tarzı) | Fizik, kimya, biyoloji, coğrafya |
| **GRF** | Etkileşimli grafik/geometri: sürüklenebilir nokta, kaydırıcı, anlık hesap | Matematik, fizik grafikleri |
| **HRT** | Hareketli harita + zaman çizelgesi | Tarih, coğrafya |
| **SES** | Sesli okuma, dinleme-anlama, telaffuz, ritim/ölçü görselleştirme | Türk Dili ve Edebiyatı, İngilizce, müzik |
| **SNR** | Senaryo/diyalog, seçimli hikâye, argüman haritası | Felsefe, DKAB, tarih kaynak analizi |

Her ders aynı kabuğu kullanır (`engine/`): merak sorusu, öğrenme çıktısına bağlı adımlar, sesli anlatım, görev, öğretmen notu, değerlendirme.

## 10. Sınıf

### Fizik
| Ünite | Format | Ders fikri | Durum |
|---|---|---|---|
| 1. Kuvvet ve Hareket | 3B | Yolda Hareket: sabit hız, ivme, grafik dönüşümleri, yeşil dalga | ✅ |
| 4. Dalgalar | 3B | Yay ve su dalga leğeni (yansıma, kırılma); **rezonans ve deprem**: farklı kat yüksekliğindeki binaların sarsıntı tablasında salınımı | 🔜 |
| 3. Elektrik | 3B/GRF | Devre tezgâhı: sürükle-bırak devre, akımın parçacık animasyonu, Ohm yasası ölçümü, seri/paralel bağlama, topraklama senaryosu | ⬜ |
| 2. Enerji | 3B | Kaykay rampası: kinetik ve potansiyel enerji çubukları, F–x grafiğinin altındaki alan = iş, güç; Türkiye enerji kaynakları haritası | ⬜ |

### Kimya
| Tema | Format | Ders fikri | Durum |
|---|---|---|---|
| 1. Etkileşim | 3B | Tepkime denkleştirme atölyesi (molekül modelleri), mol köprüsü, pistonlu silindirde gaz yasaları (parçacık simülasyonu) | 🔜 |
| 2. Çeşitlilik | 3B/GRF | Parçacık düzeyinde çözünme, sıcaklık/basınç ve çözünürlük eğrisi, derişim hazırlama laboratuvarı | ⬜ |
| 3. Sürdürülebilirlik | 3B | Atmosfer tepkimeleri: ozon tabakası ve asit yağmuru senaryosu, yeşil kimya ilkeleri | ⬜ |

### Biyoloji
| Tema | Format | Ders fikri | Durum |
|---|---|---|---|
| 1. Enerji | 3B | Kloroplast ve mitokondri içi yolculuk; ışık şiddeti, CO₂ ve sıcaklığın fotosentez hızına etkisi deneyi | 🔜 |
| 2. Ekoloji | GRF/3B | Av–avcı popülasyon simülasyonu, besin ağı kurma, karbon ve azot döngüsü, süksesyon zaman atlaması | ⬜ |

### Matematik
| Tema | Format | Ders fikri | Durum |
|---|---|---|---|
| 1. Geometrik Şekiller | GRF | Benzer üçgenlerde korunan oranlar → trigonometrik oranlar; sinüs/kosinüs teoremi ile gerçek bir mesafe ölçümü | 🔜 |
| 4. Nicelikler ve Değişimler | GRF | Fonksiyon oynatıcı: karesel, karekök ve rasyonel fonksiyonların parametrelerini kaydırıp grafiği izleme | ⬜ |
| 7. Veriden Olasılığa | GRF | Koşullu olasılık ve Bayes: ağaç diyagramı + binlerce deneyle simülasyon (ör. tıbbi test) | ⬜ |
| 6. Analitik İnceleme | GRF | Koordinat düzleminde nokta/doğru, eğim ve uzaklık; harita üzerinde rota problemi | ⬜ |
| 2. İstatistiksel Araştırma | GRF | İki kategorik değişkenli veri: sınıfın kendi verisiyle çapraz tablo ve grafik | ⬜ |
| 3. Sayılar | GRF | Asal çarpan ağacı, EBOB/EKOK görselleştirme | ⬜ |
| 5. Sayma, Algoritma ve Bilişim | GRF | Blok tabanlı algoritma kurma, sayma stratejileri | ⬜ |

### Coğrafya
| Ünite | Format | Ders fikri | Durum |
|---|---|---|---|
| 3. Doğal Sistemler ve Süreçler | 3B | Levha hareketleri, aşınma–birikim ile yeryüzü şekillerinin oluşumu (3B arazi) | 🔜 |
| 6. Afetler ve Sürdürülebilir Çevre | 3B/SNR | Afete dirençli yaşam alanı tasarlama, deprem/sel senaryoları | ⬜ |
| 2. Mekânsal Bilgi Teknolojileri | HRT | Katmanlı harita (CBS), uydu görüntüsü yorumlama | ⬜ |
| 4, 5, 7 | HRT | Yerleşme, ekonomik sektörler, Türk kültürünün mekânsal izleri | ⬜ |

### Tarih
| Ünite | Format | Ders fikri | Durum |
|---|---|---|---|
| 1. Türkistan'dan Türkiye'ye (1040–1299) | HRT | Hareketli harita: Dandanakan → Malazgirt → Miryokefalon; ordu ve devlet teşkilatı | 🔜 |
| 2. Beylikten Devlete Osmanlı (1299–1453) | HRT/SNR | Kuruluşa dair farklı görüşler (kaynak analizi), İstanbul'un fethi 3B | ⬜ |
| 3. Cihan Devleti Osmanlı (1453–1683) | HRT | Sınırların değişimi, ticaret yolları ve sömürgecilik | ⬜ |

### Türk Dili ve Edebiyatı
| Tema | Format | Ders fikri | Durum |
|---|---|---|---|
| 1. Sözün Ezgisi | SES | Şiir dinletisi: hece/aruz ölçüsü ve ritmin görselleştirilmesi, sesli okuma | ⬜ |
| 2–4 | SES/SNR | Metin tahlili rehberi, film şeridi (storyboard) oluşturma aracı | ⬜ |

### İngilizce (B1.2 / B2.2)
8 tema · **SES**: dinleme diyalogları, telaffuz pratiği (konuşma tanıma), kelime oyunları. ⬜

### Felsefe · Din Kültürü ve Ahlak Bilgisi · Peygamberimizin Hayatı
**SNR**: düşünce deneyleri, argüman haritaları, tartışma senaryoları. ⬜

### Görsel Sanatlar · Müzik · Beden Eğitimi
Müzik: ritim/nota atölyesi (Web Audio). Görsel sanatlar: perspektif ve kompozisyon aracı. Beden eğitimi: düşük öncelik. ⬜

## Her ders için kalite kontrol listesi

- [ ] Her adım bir öğrenme çıktısına / süreç bileşenine bağlı (`cikti` alanı)
- [ ] Fizik/kimya modelleri `tests/` altında sayısal olarak doğrulandı
- [ ] Branş öğretmeni içerik ve terim kontrolü yaptı
- [ ] Akıllı tahtada (dokunmatik) ve telefonda denendi
- [ ] İnternetsiz açılıyor (tek HTML dosyası)
