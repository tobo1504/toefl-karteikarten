#!/usr/bin/env python3
"""Baut den TOEFL-Trainer: prüft Inhalte, erzeugt trainer/index.html (PWA) und trainer/dist/trainer-artifact.html."""
import json, re, sys, hashlib, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC, CONTENT, DIST = ROOT / "src", ROOT / "content", ROOT / "dist"
errors = []

def err(m): errors.append(m)

def check_mcq(where, qs, n=None):
    if n and len(qs) not in (n if isinstance(n, tuple) else (n,)):
        err(f"{where}: erwartet {n} Fragen, hat {len(qs)}")
    for i, q in enumerate(qs):
        w = f"{where} Frage {i+1}"
        if not q.get("q"): err(f"{w}: Fragetext fehlt")
        if len(q.get("options", [])) != 4: err(f"{w}: braucht 4 Optionen")
        if q.get("answer") not in (0, 1, 2, 3): err(f"{w}: answer muss 0–3 sein")
        if not q.get("why"): err(f"{w}: Begründung (why) fehlt")

def load(name):
    p = CONTENT / f"{name}.json"
    return json.loads(p.read_text(encoding="utf8")) if p.exists() else {}

data = {k: load(k) for k in ("reading", "writing", "listening", "speaking")}
ids = set()
def uid(x, where):
    i = x.get("id")
    if not i: err(f"{where}: id fehlt"); return
    if i in ids: err(f"doppelte id {i}")
    ids.add(i)
    if x.get("level", 2) not in (1, 2, 3): err(f"{i}: level muss 1–3 sein")

R = data["reading"]
for x in R.get("ctw", []):
    uid(x, "ctw")
    gaps = re.findall(r"\{([^}]+)\}", x["text"])
    if len(gaps) != 10: err(f"{x['id']}: braucht 10 Lücken, hat {len(gaps)}")
    wc = len(re.sub(r"[{}]", "", x["text"]).split())
    if not 60 <= wc <= 115: err(f"{x['id']}: {wc} Wörter (Ziel 70–100)")
for x in R.get("daily", []):
    uid(x, "daily"); check_mcq(x["id"], x.get("questions", []), (2, 3))
for x in R.get("academic", []):
    uid(x, "academic"); check_mcq(x["id"], x.get("questions", []), 5)

W = data["writing"]
for x in W.get("bas", []):
    uid(x, "bas")
    joined = " ".join(x.get("chunks", []))
    ans = re.sub(r"[.?!]$", "", x.get("answer", "")).replace(",", "")
    if joined.lower() != ans.lower(): err(f"{x['id']}: chunks ergeben nicht den Antwortsatz:\n   {joined}\n   {ans}")
    if not 4 <= len(x.get("chunks", [])) <= 9: err(f"{x['id']}: 4–9 Blöcke erwartet")
for x in W.get("email", []):
    uid(x, "email")
    if len(x.get("tasks", [])) != 3: err(f"{x['id']}: braucht 3 tasks")
for x in W.get("discussion", []):
    uid(x, "discussion")
    if len(x.get("students", [])) != 2: err(f"{x['id']}: braucht 2 students")

L = data["listening"]
for x in L.get("choose", []):
    uid(x, "choose")
    if len(x.get("options", [])) != 4 or x.get("answer") not in (0,1,2,3) or not x.get("prompt") or not x.get("why"): err(f"{x['id']}: prompt, 4 Optionen, answer, why nötig")
    if x.get("voice") not in ("M", "W"): err(f"{x['id']}: voice M oder W")
for x in L.get("conversation", []):
    uid(x, "conversation"); check_mcq(x["id"], x.get("questions", []), 2)
    if any(l.get("who") not in ("M", "W") for l in x.get("lines", [])): err(f"{x['id']}: who muss M oder W sein")
for x in L.get("announcement", []):
    uid(x, "announcement"); check_mcq(x["id"], x.get("questions", []), 2)
    wc = len(x["text"].split())
    if not 35 <= wc <= 95: err(f"{x['id']}: {wc} Wörter (Ziel 40–85)")
for x in L.get("talk", []):
    uid(x, "talk"); check_mcq(x["id"], x.get("questions", []), 4)
    wc = len(x["text"].split())
    if not 100 <= wc <= 260: err(f"{x['id']}: {wc} Wörter (Ziel 100–250)")
SP = data["speaking"]
for x in SP.get("repeat", []):
    uid(x, "repeat")
    if len(x.get("sentences", [])) != 7: err(f"{x['id']}: braucht 7 Sätze")
for x in SP.get("interview", []):
    uid(x, "interview")
    if len(x.get("questions", [])) != 4: err(f"{x['id']}: braucht 4 Fragen")

# Antwortverteilung prüfen (Hinweis, kein Fehler)
dist = [0, 0, 0, 0]
for sec in ("reading", "listening"):
    for lst in data[sec].values():
        for x in lst:
            for q in x.get("questions", []): dist[q["answer"]] += 1
            if "answer" in x and isinstance(x["answer"], int): dist[x["answer"]] += 1

if errors:
    print("FEHLER in den Inhalten:"); [print(" -", e) for e in errors]; sys.exit(1)

style = (SRC / "styles.css").read_text(encoding="utf8")
appjs = (SRC / "app.js").read_text(encoding="utf8")
shell = (SRC / "shell.html").read_text(encoding="utf8")
content = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

def build(artifact):
    b = json.dumps({"artifact": artifact, "version": hashlib.sha1((style + appjs + content).encode()).hexdigest()[:8]})
    return shell.replace("/*STYLE*/", style).replace("/*CONTENT*/", content).replace("/*BUILD*/", b).replace("/*APP*/", appjs)

DIST.mkdir(exist_ok=True)
(DIST / "trainer-artifact.html").write_text(build(True), encoding="utf8")

pwa_head = """<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f4f5f3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#131716" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="TOEFL-Trainer">
<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="../apple-touch-icon.png"><link rel="icon" href="../icon-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}</style>
"""
sw_reg = '<script>if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}))</script>\n'
html = build(False)
(ROOT / "index.html").write_text(pwa_head + html + sw_reg, encoding="utf8")
ver = hashlib.sha1(html.encode()).hexdigest()[:10]
(ROOT / "sw.js").write_text(f"""const CACHE="trainer-{ver}";
const CORE=["./","index.html","manifest.webmanifest","../icon-192.png","../icon-512.png","../icon-maskable-512.png","../apple-touch-icon.png"];
self.addEventListener("install",e=>{{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))}});
self.addEventListener("activate",e=>{{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k.startsWith("trainer-")).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))}});
self.addEventListener("fetch",e=>{{const r=e.request;if(r.method!=="GET")return;
  if(r.mode==="navigate"){{e.respondWith(fetch(r).then(res=>{{const cp=res.clone();caches.open(CACHE).then(c=>c.put("index.html",cp));return res}}).catch(()=>caches.match("index.html")));return}}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{{if(res&&(res.ok||res.type==="opaque")){{const cp=res.clone();caches.open("trainer-assets").then(c=>c.put(r,cp))}}return res}})))}});
""", encoding="utf8")
(ROOT / "manifest.webmanifest").write_text(json.dumps({"name": "TOEFL-Trainer", "short_name": "Trainer", "lang": "de",
  "start_url": "./", "scope": "./", "display": "standalone", "background_color": "#f4f5f3", "theme_color": "#2e5e57",
  "icons": [{"src": "../icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "../icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "../icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}, ensure_ascii=False, indent=1), encoding="utf8")

counts = {sec: {k: len(v) for k, v in d.items()} for sec, d in data.items() if d}
print("OK", counts, "Antwortverteilung A–D:", dist)
