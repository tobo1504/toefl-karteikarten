"""Fragetyp (skill) je Frage – Grundlage der Fehleranalyse.
classify(q) rät den Typ aus dem Fragetext; ein vorhandenes Feld "skill" hat Vorrang.
Schlüssel MC (Reading/Listening): main, detail, vocab, infer, purpose, neg, attitude, next
Schlüssel Choose: wh, yn, request, statement, idiom
Schlüssel Build a Sentence: passive, relative, indirect, compare, cond, verb, order
"""
import re
MCQ = ("main", "detail", "vocab", "infer", "purpose", "neg", "attitude", "next")
CHOOSE = ("wh", "yn", "request", "statement", "idiom")
BAS = ("passive", "relative", "indirect", "compare", "cond", "verb", "order")

def classify(q):
    t = q
    if re.search(r"closest in meaning|most nearly mean|[\"“”'][^\"“”']+[\"“”'] (in|as used)|what does .* mean\b|means that|is closest to", t, re.I): return "vocab"
    if re.search(r"\b(NOT|EXCEPT)\b", t): return "neg"
    if re.search(r"(probably|most likely|will) .*\b(do|go|happen)\b.*\b(next|after|now|later)\b|do next|happen next", t, re.I): return "next"
    if re.search(r"attitude|opinion of|feel about|how does .* feel|think (of|about)|view of|reaction", t, re.I): return "attitude"
    if re.search(r"infer|impl(y|ies|ied)|suggest(s|ed)? (about|that)|most likely|probably|can be concluded|what can be said", t, re.I): return "infer"
    if re.search(r"mainly about|main (idea|topic|purpose|point)|what is the (talk|passage|announcement|conversation|notice|email|message|text|post) (mainly |mostly )?about|best title|mainly discuss|what are the speakers (mainly )?discussing", t, re.I): return "main"
    if re.search(r"why does the (author|professor|speaker|man|woman|writer|lecturer) (mention|say|refer|describe|use|bring up)|purpose of|why is .* mentioned|what is the purpose|in order to|why did .* write|why was .* (sent|written|posted)", t, re.I): return "purpose"
    return "detail"
