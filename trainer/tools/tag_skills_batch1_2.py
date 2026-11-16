"""Schreibt das Feld "skill" in alle bestehenden Fragen (Batch 1–2). Einmalig; neue Batches setzen skill direkt."""
import json, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from skills import classify
C = pathlib.Path(__file__).resolve().parent.parent / "content"
OVR = {"d05#0": "main", "d11#1": "detail", "d10#1": "detail", "d16#1": "purpose", "ac02#1": "detail", "cv02#1": "next", "tk07#1": "purpose"}
CH = dict(zip([f"c{i:02d}" for i in range(1, 45)], """wh request wh wh request yn yn wh yn idiom request yn statement yn request request yn statement statement request
statement yn statement request yn request wh yn wh request wh yn yn request statement idiom yn statement statement request request idiom wh idiom""".split()))
BAS = dict(zip([f"bas{i:02d}" for i in range(1, 41)], """compare passive passive relative indirect compare cond relative verb indirect order relative order order order verb indirect passive cond indirect
compare verb verb cond order verb verb verb passive compare cond order order compare relative passive verb relative cond compare""".split()))
for f in ("reading", "listening", "writing"):
    p = C / f"{f}.json"; d = json.loads(p.read_text(encoding="utf8"))
    for k, v in d.items():
        for x in v:
            for i, q in enumerate(x.get("questions", [])):
                q["skill"] = OVR.get(f"{x['id']}#{i}") or q.get("skill") or classify(q["q"])
            if k == "choose": x["skill"] = CH[x["id"]]
            if k == "bas": x["skill"] = BAS[x["id"]]
    p.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf8")
print("ok")
