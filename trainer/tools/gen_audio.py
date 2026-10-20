"""Erzeugt natürliche Audiodateien (Kokoro-TTS, offline) für alle Listening- und Speaking-Inhalte.

Einmalig: pip install --break-system-packages kokoro-onnx soundfile
Modelle (GitHub-Release, ~350 MB):
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
Aufruf: KOKORO_DIR=<ordner mit beiden dateien> python3 trainer/tools/gen_audio.py
Erzeugt nur fehlende oder geänderte Dateien (Text-Hash in audio/manifest.json).
"""
import json, os, re, hashlib, subprocess, tempfile, pathlib
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUD = ROOT / "audio"; AUD.mkdir(exist_ok=True)
MAN = AUD / "manifest.json"
man = json.loads(MAN.read_text()) if MAN.exists() else {}
KD = pathlib.Path(os.environ.get("KOKORO_DIR", "."))
k = Kokoro(str(KD / "kokoro-v1.0.onnx"), str(KD / "voices-v1.0.bin"))

FEMALE = ["af_heart", "af_bella", "bf_emma", "af_aoede"]
MALE = ["am_michael", "am_fenrir", "bm_george", "am_puck"]
PAIRS = [("af_heart", "am_michael"), ("af_bella", "am_fenrir"), ("bf_emma", "bm_george"), ("af_aoede", "am_puck")]
h = lambda s: int(hashlib.md5(s.encode()).hexdigest(), 16)
lang = lambda v: "en-gb" if v.startswith("b") else "en-us"
voice = lambda g, key: (FEMALE if g == "W" else MALE)[h(key) % 4]

def sentences(t):
    return [s.strip() for s in re.findall(r"[^.!?]+[.!?]*[\"”']?", t) if s.strip()]

def synth(parts, sr=24000):
    """parts: [(text, voice, pause_after_seconds)]"""
    out = []
    for text, v, pause in parts:
        for i, s in enumerate(sentences(text)):
            a, sr = k.create(s, voice=v, speed=1.0, lang=lang(v))
            out.append(a); out.append(np.zeros(int(sr * 0.22), dtype=a.dtype))
        out.append(np.zeros(int(sr * pause), dtype=np.float32))
    return np.concatenate(out), sr

def write(key, parts):
    sig = hashlib.md5(json.dumps(parts).encode()).hexdigest()[:10]
    f = AUD / f"{key}.mp3"
    if man.get(key, {}).get("sig") == sig and f.exists(): return False
    a, sr = synth(parts)
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        sf.write(tmp.name, a, sr)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp.name, "-ac", "1", "-b:a", "48k", str(f)], check=True)
    man[key] = {"sig": sig, "dur": round(len(a) / sr, 1)}
    return True

L = json.loads((ROOT / "content/listening.json").read_text())
SP = json.loads((ROOT / "content/speaking.json").read_text())
n = 0
for x in L.get("choose", []): n += write(x["id"], [(x["prompt"], voice(x["voice"], x["id"]), 0.1)])
for x in L.get("announcement", []): n += write(x["id"], [(x["text"], voice(x["voice"], x["id"]), 0.1)])
for x in L.get("talk", []): n += write(x["id"], [(x["text"], voice(x["voice"], x["id"]), 0.1)])
for x in L.get("conversation", []):
    w, m = PAIRS[h(x["id"]) % 4]
    n += write(x["id"], [(l["text"], w if l["who"] == "W" else m, 0.45) for l in x["lines"]])
for x in SP.get("repeat", []):
    v = voice(x.get("voice", "W"), x["id"])
    for i, s in enumerate(x["sentences"]): n += write(f"{x['id']}-{i}", [(s, v, 0.05)])
for x in SP.get("interview", []):
    v = voice(x.get("voice", "W"), x["id"])
    for i, q in enumerate(x["questions"]): n += write(f"{x['id']}-{i}", [(q, v, 0.05)])
MAN.write_text(json.dumps(man, indent=0, sort_keys=True))
print("neu erzeugt:", n, "| gesamt:", len(man), "| Größe MB:", round(sum(p.stat().st_size for p in AUD.glob("*.mp3")) / 1e6, 1))
