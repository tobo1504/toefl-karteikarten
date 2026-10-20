"""Hilfsfunktionen für neue Inhalte. Verwendung siehe gen_*_batch*.py.
- ctw(text): setzt nach ETS-Regel 10 Lücken (erster Satz intakt, danach jedes zweite Wort, zweite Hälfte fehlt).
- MC(start): Fragen-Fabrik; richtige Antwort zuerst übergeben, Position wird rotierend auf A–D verteilt.
- append(file, key, items): hängt Items an eine Liste in content/<file>.json an (ids müssen neu sein).
"""
import json, re, random, pathlib
CONTENT = pathlib.Path(__file__).resolve().parent.parent / "content"

def ctw(text):
    m = re.match(r"(.+?[.!?])\s+(.*)$", text, re.S)
    first, rest = m.group(1), m.group(2)
    out, want, n = [], False, 0
    for t in rest.split(" "):
        mm = re.match(r"^([A-Za-z']+)([^A-Za-z']*)$", t)
        eligible = bool(mm) and len(mm.group(1)) >= 2
        if n < 10 and want:
            if eligible:
                w, p = mm.group(1), mm.group(2); k = len(w) // 2
                out.append(w[:k] + "{" + w[k:] + "}" + p); n += 1; want = False
            else:
                out.append(t)
        else:
            out.append(t); want = True
    assert n == 10, ("zu wenige Lücken", n, text[:50])
    return first + " " + " ".join(out)

class MC:
    def __init__(self, start=0, seed=1):
        self.pos = start; self.rnd = random.Random(seed)
    def __call__(self, q, correct, wrong, why):
        a = self.pos % 4; self.pos += 1
        rest = wrong[:]; self.rnd.shuffle(rest); rest.insert(a, correct)
        return {"q": q, "options": rest, "answer": a, "why": why}

def append(file, key, items):
    p = CONTENT / f"{file}.json"
    data = json.loads(p.read_text(encoding="utf8"))
    have = {x["id"] for lst in data.values() for x in lst}
    new = [x for x in items if x["id"] not in have]
    data.setdefault(key, []).extend(new)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf8")
    return len(new)
