"""Zweite Runde Längenausgleich."""
import json, pathlib
C = pathlib.Path(__file__).resolve().parent.parent / "content"
FIX = {
"ac05#2":{"Criminals found it easy to make copies of the notes.":"Criminals found it far too easy to make copies of the official notes."},
"c22":{"Happy holidays to you and your family too.":"Happy holidays to you and your whole family as well."},
"tk01#3":{"To produce chlorophyll faster before winter":"To produce chlorophyll more quickly before the winter begins"},
"d14#0":{"It is too long for a short research paper.":"It is much too long for a short research paper like this."},
"tk03#0":{"The history of paved sidewalks in modern cities":"The long history of paved sidewalks in modern cities and towns"},
"ac08#2":{"It prevents new mutations from appearing in bacteria.":"It prevents new mutations from appearing in most types of bacteria."},
"d13#0":{"To explain why prices in dining halls are rising":"To explain why prices in campus dining halls are rising this year"},
"an11#1":{"They will not be admitted to the concert at all.":"They will not be admitted to the concert hall at all that night."},
"cv06#0":{"Whether to ask the consulting firm for a higher salary":"Whether to ask the consulting firm for a considerably higher salary"},
"c10":{"I can lend you a longer one if you need it.":"I can lend you a longer one if you really need it."},
"ac06#3":{"To show that exercise is a difficult habit":"To show that exercise is an especially difficult habit to form"},
"ac05#3":{"To explain how paper money quickly reached Europe":"To explain how paper money quickly reached Europe through trade"},
"tk06#1":{"To explain how the United Nations was formed":"To explain how the United Nations was originally formed"},
"c20":{"I submitted my application last week.":"I submitted my application for the program last week."},
}
for f in ("reading", "listening"):
    p = C / f"{f}.json"; d = json.loads(p.read_text(encoding="utf8"))
    for lst in d.values():
        for x in lst:
            targets = [(f"{x['id']}#{i}", q["options"]) for i, q in enumerate(x.get("questions", []))]
            if "options" in x: targets.append((x["id"], x["options"]))
            for key, opts in targets:
                for old, new in FIX.get(key, {}).items():
                    if old in opts: opts[opts.index(old)] = new; print("ok", key)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf8")
