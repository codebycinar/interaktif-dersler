"""MEB Türkiye Yüzyılı Maarif Modeli (tymm.meb.gov.tr) öğretim programlarını
sınıf bazında çekip yapılandırılmış JSON'a dönüştürür.

Kullanım:
    python -X utf8 tools/mufredat_cek.py --sinif 10
    python -X utf8 tools/mufredat_cek.py --sinif 9 --cikti mufredat/9-sinif.json

Çıktı: mufredat/<sinif>-sinif.json
"""
import argparse
import html
import json
import re
import ssl
import sys
import time
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

TABAN = "https://tymm.meb.gov.tr"

# Sitedeki sinifId / kademe eşlemesi (ana sayfadaki <select> değerleri)
SINIFLAR = {
    # ortaöğretim (kademe=3)
    "hazirlik": (10, 3), "9": (11, 3), "10": (12, 3), "11": (13, 3), "12": (14, 3),
}

# Sitenin sertifika zinciri eksik olduğu için doğrulama kapalı (yalnızca okuma yapılıyor)
_SSL = ssl.create_default_context()
_SSL.check_hostname = False
_SSL.verify_mode = ssl.CERT_NONE


def getir(yol, params=None):
    url = TABAN + yol
    if params:
        url += "?" + urllib.parse.urlencode(params)
    for deneme in range(3):
        try:
            with urllib.request.urlopen(url, context=_SSL, timeout=30) as r:
                return r.read().decode("utf-8")
        except Exception:
            if deneme == 2:
                raise
            time.sleep(2)


class SatirAyristirici(HTMLParser):
    """Ünite sayfasındaki 'title' / 'content' div çiftlerini toplar."""

    def __init__(self):
        super().__init__()
        self.satirlar = []  # (baslik, html)
        self._mod = None    # 'title' | 'content'
        self._derinlik = 0
        self._tampon = []
        self._baslik = None

    def handle_starttag(self, tag, attrs):
        sinif = dict(attrs).get("class", "") or ""
        if self._mod is None and tag == "div":
            parcalar = sinif.split()
            if "title" in parcalar and "col-md-3" in parcalar:
                self._mod, self._derinlik, self._tampon = "title", 1, []
                return
            if "content" in parcalar and "col-md-9" in parcalar and self._baslik is not None:
                self._mod, self._derinlik, self._tampon = "content", 1, []
                return
        if self._mod:
            if tag == "div":
                self._derinlik += 1
            self._tampon.append(self.get_starttag_text())

    def handle_endtag(self, tag):
        if not self._mod:
            return
        if tag == "div":
            self._derinlik -= 1
            if self._derinlik == 0:
                metin = "".join(self._tampon)
                if self._mod == "title":
                    self._baslik = temizle(metin)
                else:
                    self.satirlar.append((self._baslik, metin))
                    self._baslik = None
                self._mod = None
                return
        self._tampon.append(f"</{tag}>")

    def handle_data(self, data):
        if self._mod:
            self._tampon.append(data)

    def handle_entityref(self, name):
        if self._mod:
            self._tampon.append(f"&{name};")

    def handle_charref(self, name):
        if self._mod:
            self._tampon.append(f"&#{name};")


def temizle(parca):
    """HTML parçasını düz metne çevirir; paragrafları satır olarak korur."""
    parca = re.sub(r"</p>|<br\s*/?>|</li>", "\n", parca, flags=re.I)
    parca = re.sub(r"<[^>]+>", " ", parca)
    parca = html.unescape(parca)
    satirlar = []
    for s in parca.split("\n"):
        s = re.sub(r"\s+", " ", s).strip()
        s = re.sub(r"\(\s+", "(", s)
        s = re.sub(r"\s+\)", ")", s)
        s = re.sub(r"\s+([,.;])", r"\1", s)
        if s:
            satirlar.append(s)
    return "\n".join(satirlar)


# FİZ.10.1.1. / TDE1.1. / ENG.10.1.L1. biçimlerinin hepsini yakalar
KOD = re.compile(r"^([A-ZÇĞİÖŞÜ]{2,}\.?\d+(?:\.[A-Z]?\d+)+)\.?\s+(.*)$")
ALT = re.compile(r"^([a-zçğıöşü])\)\s*(.*)$")


def ciktilari_ayir(metin):
    ciktilar = []
    # Türk Dili ve Edebiyatı gibi derslerde "Metin Tahlili (Anlama)" > "Okuma" gibi ara başlıklar var
    gruplar, bekleyen = [], []
    for satir in metin.split("\n"):
        m = KOD.match(satir)
        if m:
            # art arda iki başlık: üst + alt başlık; tek başlık: aynı üst başlık altında yeni alt başlık
            if len(bekleyen) >= 2:
                gruplar = bekleyen
            elif bekleyen:
                gruplar = gruplar[:-1] + bekleyen if len(gruplar) > 1 else bekleyen
            bekleyen = []
            c = {"kod": m.group(1), "ifade": m.group(2).strip(), "surec_bilesenleri": []}
            if gruplar:
                c["grup"] = " / ".join(gruplar)
            ciktilar.append(c)
            continue
        a = ALT.match(satir)
        if a and ciktilar:
            ciktilar[-1]["surec_bilesenleri"].append(f"{a.group(1)}) {a.group(2).strip()}")
        elif len(satir) < 60 and not satir.endswith("."):
            bekleyen.append(satir)
        elif ciktilar:
            # bölünmüş satır: bir öncekine ekle
            hedef = ciktilar[-1]
            if hedef["surec_bilesenleri"]:
                hedef["surec_bilesenleri"][-1] += " " + satir
            else:
                hedef["ifade"] += " " + satir
    return ciktilar


def uniteyi_cek(ders_url, unite_id):
    sayfa = getir(f"/{ders_url}/unite/{unite_id}")
    p = SatirAyristirici()
    p.feed(sayfa)
    alanlar = {b: temizle(h) for b, h in p.satirlar}

    # Ünite amacı: "Yazdır" butonundan sonra, ilk satırdan önce gelen paragraf
    amac = ""
    m = re.search(r"Yazdır.*?</a>(.*?)<div class=\"row", sayfa, flags=re.S)
    if m:
        amac = temizle(m.group(1))

    cikti_metni = alanlar.get("Öğrenme Çıktıları ve Süreç Bileşenleri", "")
    saat = alanlar.get("Ders Saati", "")
    return {
        "amac": amac,
        "ders_saati": int(saat) if saat.isdigit() else saat,
        "ogrenme_ciktilari": ciktilari_ayir(cikti_metni),
        "icerik_cercevesi": [s for s in alanlar.get("İçerik Çerçevesi", "").split("\n") if s],
        "anahtar_kavramlar": alanlar.get("Anahtar Kavramlar", ""),
        "alan_becerileri": alanlar.get("Alan Becerileri", ""),
        "disiplinler_arasi": alanlar.get("Disiplinler Arası İlişkiler", ""),
        "temel_kabuller": alanlar.get("Temel Kabuller", ""),
        "ogrenme_kanitlari": alanlar.get("Öğrenme Kanıtları (Ölçme ve Değerlendirme)", ""),
        "ogrenme_ogretme_uygulamalari": alanlar.get("Öğrenme-Öğretme Uygulamaları", ""),
        "kaynak": f"{TABAN}/{ders_url}/unite/{unite_id}",
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sinif", required=True, choices=SINIFLAR.keys())
    ap.add_argument("--cikti")
    args = ap.parse_args()

    sinif_id, kademe = SINIFLAR[args.sinif]
    cikti = Path(args.cikti or f"mufredat/{args.sinif}-sinif.json")
    cikti.parent.mkdir(parents=True, exist_ok=True)

    # Sitenin ana listesi bazı dersleri (ör. Din Kültürü ve Ahlak Bilgisi) göstermiyor; hepsini alıp işaretliyoruz
    dersler = json.loads(getir("/Ders/GetDerslerBySinif",
                               {"sinifId": sinif_id, "kademe": kademe, "programListedOnly": "false"}))
    sonuc = {
        "sinif": args.sinif,
        "model": "Türkiye Yüzyılı Maarif Modeli",
        "kaynak": TABAN,
        "cekilme_tarihi": time.strftime("%Y-%m-%d"),
        "dersler": [],
    }
    for d in dersler:
        uniteler = json.loads(getir("/Unite/GetUnitelerByDersId", {"dersId": d["id"], "sinifId": sinif_id}))
        print(f"{d['dersAdi']}: {len(uniteler)} ünite", file=sys.stderr)
        ders = {
            "ad": d["dersAdi"],
            "slug": d["url"],
            "sitede_listeli": bool(d.get("ogretimProgramindaGoster")),
            "program_pdf": f"{TABAN}/assets/pdf/{d['pdf']}" if d.get("pdf") else None,
            "uniteler": [],
        }
        for u in uniteler:
            ayrinti = uniteyi_cek(u["url"], u["id"])
            ders["uniteler"].append({"id": u["id"], "baslik": u["title"].strip(), **ayrinti})
            print(f"   - {u['title'].strip()} ({len(ayrinti['ogrenme_ciktilari'])} çıktı)", file=sys.stderr)
            time.sleep(0.3)
        sonuc["dersler"].append(ders)

    cikti.write_text(json.dumps(sonuc, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Yazıldı: {cikti}", file=sys.stderr)


if __name__ == "__main__":
    main()
