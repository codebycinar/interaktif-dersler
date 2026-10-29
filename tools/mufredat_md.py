"""mufredat/<sinif>-sinif.json dosyasından okunabilir bir Markdown özet üretir.

Kullanım:
    python -X utf8 tools/mufredat_md.py mufredat/10-sinif.json
"""
import json
import sys
from pathlib import Path


def main():
    kaynak = Path(sys.argv[1])
    d = json.loads(kaynak.read_text(encoding="utf-8"))
    s = [
        f"# {d['sinif']}. Sınıf Müfredat Haritası",
        "",
        f"Kaynak: {d['model']} — {d['kaynak']} (çekilme: {d['cekilme_tarihi']})",
        "",
        "Bu dosya `tools/mufredat_md.py` ile otomatik üretilir; elle düzenlemeyin.",
        "",
        "| Ders | Ünite/Tema | Öğrenme çıktısı | Ders saati |",
        "|---|---:|---:|---:|",
    ]
    for ders in d["dersler"]:
        saat = sum(u["ders_saati"] for u in ders["uniteler"] if isinstance(u["ders_saati"], int))
        n = sum(len(u["ogrenme_ciktilari"]) for u in ders["uniteler"])
        isaret = "" if ders.get("sitede_listeli", True) else " ¹"
        s.append(f"| {ders['ad']}{isaret} | {len(ders['uniteler'])} | {n} | {saat} |")
    s += ["", "¹ MEB sitesinin öğretim programları listesinde görünmüyor (seçmeli dersler ve DKAB); sitenin arayüzünden alındı.", ""]

    for ders in d["dersler"]:
        s += [f"## {ders['ad']}", ""]
        if ders.get("program_pdf"):
            s += [f"Öğretim programı: {ders['program_pdf']}", ""]
        for u in ders["uniteler"]:
            s += [f"### {u['baslik']}", "", f"*{u['ders_saati']} ders saati* · [kaynak]({u['kaynak']})", ""]
            if u["amac"]:
                s += [u["amac"], ""]
            if u["icerik_cercevesi"]:
                s += ["**İçerik çerçevesi:** " + " · ".join(u["icerik_cercevesi"]), ""]
            grup = None
            for c in u["ogrenme_ciktilari"]:
                if c.get("grup") and c["grup"] != grup:
                    grup = c["grup"]
                    s += [f"*{grup}*", ""]
                s.append(f"- **{c['kod']}** {c['ifade']}")
            s.append("")
    hedef = kaynak.with_suffix(".md")
    hedef.write_text("\n".join(s), encoding="utf-8")
    print(f"Yazıldı: {hedef}")


if __name__ == "__main__":
    main()
