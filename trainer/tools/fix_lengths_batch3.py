"""Längenausgleich für Batch 3: Fehlantworten verlängern, damit die richtige Antwort nicht an der Länge erkennbar ist."""
import json, pathlib
C = pathlib.Path(__file__).resolve().parent.parent / "content"
CH = {  # Choose: drei neue Fehlantworten (Reihenfolge wie bisher, richtige Antwort bleibt an ihrer Stelle)
"c45": ["It's my favorite class this semester.", "Yes, I have a class with Dr. Hill.", "Last semester, I think, in room four."],
"c47": ["On the third floor, next to the stairs.", "I like the room. It's very bright.", "Since September, when classes began."],
"c48": ["I had pasta there last Sunday.", "It's right next to the new gym.", "Yes, I opened it this morning."],
"c49": ["Yes, please. That would be great.", "I'm fine, thanks. How are you?", "It's due on Friday, I think."],
"c51": ["Yes, I like it very much there.", "The coffee shop closes at five.", "I made it early this morning."],
"c53": ["The late bus leaves at eleven.", "You're welcome. Come back soon.", "Yes, see you later tonight."],
"c57": ["It broke yesterday, I'm afraid.", "It's too short for me, really.", "I took it already this morning."],
"c59": ["Yes, I've seen that movie three times.", "No, I have my own key to the house.", "The kitchen is very clean today, isn't it?"],
"c60": ["The air conditioner is brand new.", "About ten minutes ago, I think.", "It's fresh from the bakery downtown."],
"c61": ["Yes, I think so. It's tomorrow at nine.", "It's on the fifth of May, in the main hall.", "I thought about it, too, but I can't go."],
"c62": ["She knows the subject very well.", "No, we should be absent more.", "Yes, she is absent again today."],
"c63": ["Turn left at the corner, then right.", "Yes, I left it there this morning.", "It's right, but it's not early."],
"c65": ["Yes, I do. Thanks for asking me.", "It's a long drive to the coast.", "I should have, I guess. Sorry."],
"c66": ["I came by bus, as I always do.", "I signed the birthday card already.", "The workshop is on Friday at ten."],
"c67": ["I picked it up last week.", "The way is very long from here.", "Yes, pick me up at the station."],
"c68": ["No, it's at ten. We still have plenty of time.", "It was quite quiet there, so I could study.", "Yes, I'll be there. Save me a seat, please."],
"c69": ["My hand is much better, thanks.", "I gave it to her yesterday.", "They're made of thick cardboard."],
"c70": ["Don't be afraid. It's perfectly safe.", "I'll make it for you, if you like.", "Dinner was delicious. Thank you."],
"c71": ["Yes, I know the store. It's on Main Street.", "I bought mine new, so they cost a lot.", "The weather is fine, so let's walk there."],
"c72": ["I said it last night, but nobody heard.", "I'd say he's about seven years old.", "The order is wrong. I asked for soup."],
"c73": ["It starts at nine, I believe.", "Yes, I registered last week.", "The line is long but straight."],
"c74": ["I decided yesterday afternoon.", "Yes, you can, if you hurry up.", "There are two of them upstairs."],
"c75": ["Yes, you can take it. I don't need it anymore.", "I planned it for Monday, but then it rained.", "It goes on until five, so there's no hurry."],
"c76": ["I'm up at six every single day.", "The present is for her birthday.", "Yes, it's on the first floor."],
"c77": ["No, it doesn't hurt at all anymore.", "My back is fine now, thank you.", "I filed them yesterday afternoon."],
"c78": ["You should get over there before it closes.", "It goes up the hill and then turns left.", "I'll get it tomorrow, when the bank opens."],
"c79": ["The chances are about fifty-fifty, I'd say.", "Cover it with a lid, or it will get cold.", "It shifted a little, but it still works."],
"c80": ["How much was it? I'd like to pay my share.", "Yes, we finished it early, as we planned.", "So much the better. Let's celebrate."],
"c81": ["Yes, it's much better now, thanks.", "We had it last year at the same hotel.", "The reservation was very good."],
"c82": ["We gathered in the hall before the talk.", "The speakers are too loud in that room.", "I guess he arrived at two, as scheduled."],
"c83": ["The construction ends in May, they say.", "What did you make? It smells wonderful.", "I'll take the detour, then. Thanks."],
"c84": ["I suppose it was yesterday, around noon.", "Yes, late in the day, after the lecture.", "They handed it to me at the front desk."],
"c85": ["I've already cut it out of the newspaper for you.", "The rumor was about him, not about the department.", "It has three sections, and each one is quite long."],
"c87": ["Because the printer bothers me a lot.", "The tablets are on the table by the door.", "Don't bother me, please. I'm working."],
"c88": ["The airport is very close to my house.", "I missed you, too. It's been a while.", "Which flight did you miss this time?"],
}
MC = {  # (id, Frage-Index): {alte Fehlantwort: neue Fehlantwort}
("d32",0): {"A new elevator that opens in May": "A new elevator that will open at the beginning of May"},
("d32",2): {"Report a broken stair": "Report a broken stair or a broken light"},
("d36",1): {"A five-page report on Northline Media": "A five-page report about Northline Media's history"},
("d37",2): {"It shows that the free 30 minutes are over.": "It shows that the free 30 minutes of the trip are now over."},
("d40",0): {"A one-hour sample of a complete show": "A one-hour sample of a complete show with music and talk"},
("d40",1): {"Someone who has hosted a show at another station": "Someone who has already hosted a show at another radio station"},
("d42",0): {"The committee found the data unconvincing.": "The committee found the data in the abstract unconvincing."},
("d43",1): {"People who travel on long flights": "People who often travel on very long flights"},
("d44",1): {"The student must rewrite the assignment by hand.": "The student must rewrite the whole assignment without any tools."},
("d45",1): {"They should have limited the topic a decade ago.": "They should have limited the topic before writing the first section."},
("d46",0): {"A 19-year-old who has never been in a study before": "A 19-year-old who has never taken part in a research study before"},
("d46",1): {"Before the first evening session begins": "Before the first evening session begins at the lab"},
("d47",1): {"The resident will have to move out on May 15.": "The resident will have to move out of the apartment on May 15."},
("d48",0): {"One that continues a professor's study on campus": "One that continues a professor's long-term study on the home campus"},
("ac09",2): {"To argue that foxes make better companions than wolves do": "To argue that foxes make better and safer companions than wolves ever could"},
("ac09",3): {"They had more offspring than bolder wolves.": "They had far more offspring than the bolder wolves did."},
("ac09",4): {"Dogs protected their sheep and goats from wolves.": "Dogs protected their sheep and goats from wolves at night."},
("ac12",0): {"Efficient engines were too costly for most industries.": "Efficient engines remained too costly for most British industries."},
("ac12",2): {"To argue that older lamps were better for the environment": "To argue that older lamps were actually better for the environment"},
("cv21",0): {"Her results contradict those of a larger study.": "Her results contradict those of a larger, earlier study."},
("cv22",0): {"How to divide the remaining sections of a report": "How to divide the remaining sections of a report fairly"},
("an20",0): {"The Chemistry Building has larger rooms.": "The Chemistry Building has larger and newer rooms."},
("an24",0): {"To protect the building from sudden light": "To protect the building from sudden changes in light"},
("tk16",2): {"New bottles are cheaper than bottles made from sand.": "New bottles are much cheaper than bottles made from sand."},
("tk16",3): {"Recycling trucks use less fuel than other trucks.": "Recycling trucks use far less fuel than other kinds of trucks."},
("tk17",0): {"Animals that are more numerous than scientists expected": "Animals that are far more numerous than scientists once expected"},
("tk18",2): {"There is less sunlight in the east in the morning.": "There is far less sunlight in the east in the morning."},
("tk19",2): {"To describe how the press reached other continents": "To describe how the printing press later reached other continents"},
("tk19",3): {"It was harder to print than Chinese or Korean writing.": "It was much harder to print than Chinese or Korean writing."},
("tk20",2): {"To prove that most shoppers choose the cheapest item": "To prove that most shoppers simply choose the cheapest item"},
("tk21",0): {"To describe the best way to recover money already spent": "To describe the best way to recover money that has already been spent"},
("tk21",2): {"They are legally required to complete what they start.": "They are legally required to complete every project they start."},
("tk22",0): {"A scientist who changed his field in order to study fossils": "A scientist who changed his field in order to study reptile fossils"},
("tk22",3): {"Wegener would have been believed if he had lived a few years longer.": "Wegener would certainly have been believed if he had only lived a few more years, until the 1950s."},
("tk23",0): {"Experiments on color have failed to produce clear results.": "Experiments on color have so far failed to produce any clear results."},
("tk23",2): {"To suggest that the task was too difficult for most people": "To suggest that the task was too difficult for most of the people"},
("tk24",1): {"The toads were killed by the pesticides of the day.": "The toads were quickly killed by the pesticides of the day."},
("tk24",2): {"As evidence that the toads' poison has become weaker": "As evidence that the toads' poison has become much weaker"},
}
n = 0
for f in ("reading", "listening"):
    p = C / f"{f}.json"; d = json.loads(p.read_text(encoding="utf8"))
    for lst in d.values():
        for x in lst:
            if x["id"] in CH:
                new = iter(CH[x["id"]]); x["options"] = [o if i == x["answer"] else next(new) for i, o in enumerate(x["options"])]; n += 1
            for qi, q in enumerate(x.get("questions", [])):
                for old, neu in MC.get((x["id"], qi), {}).items():
                    assert old in q["options"], (x["id"], qi, old)
                    q["options"][q["options"].index(old)] = neu; n += 1
    p.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf8")
print("geändert:", n)
