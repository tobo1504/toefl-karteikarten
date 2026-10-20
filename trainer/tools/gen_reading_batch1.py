import json, re, random
random.seed(7)

def ctw(text):
    # erster Satz bleibt vollständig, danach jedes zweite Wort: zweite Hälfte fehlt; 10 Lücken
    m = re.match(r"(.+?[.!?])\s+(.*)$", text, re.S)
    first, rest = m.group(1), m.group(2)
    toks = rest.split(" ")
    out, want, n = [], False, 0
    for t in toks:
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
    assert n == 10, (n, text[:40])
    return first + " " + " ".join(out)

POS = [0]
def mc(q, correct, wrong, why):
    opts = [correct] + wrong
    a = POS[0] % 4; POS[0] += 1
    rest = wrong[:]; random.shuffle(rest)
    rest.insert(a, correct)
    return {"q": q, "options": rest, "answer": a, "why": why}

CTW = [
 ("ctw01", 2, "Scientists have long suspected that sleep plays an important role in learning. During deep sleep, the brain replays information that was gathered during the day and moves it from temporary to permanent storage. In one experiment, students who slept after studying remembered more words than students who stayed awake. Researchers believe that certain brain waves help strengthen the connections between neurons. This may explain why students who sleep poorly often struggle in exams."),
 ("ctw02", 1, "Public libraries offer much more than books. Many of them lend laptops, cameras, and even musical instruments to their members. Some libraries also run free classes on topics such as cooking, coding, and personal finance. Because these services cost nothing, they are especially helpful for families with small budgets. In many towns, the library has become a meeting place where people of all ages can study, work, or simply relax."),
 ("ctw03", 3, "Cities are often several degrees warmer than the surrounding countryside. This phenomenon, known as the urban heat island effect, arises because asphalt and concrete absorb solar radiation during the day and release it slowly at night. The scarcity of vegetation intensifies the problem, since plants cool their surroundings through evaporation. Municipal planners increasingly counteract the effect by installing reflective roofing materials and expanding green spaces, measures that can substantially reduce energy consumption during summer heat waves."),
 ("ctw04", 2, "Honeybees have a remarkable way of sharing information. When a worker bee discovers a good source of food, it returns to the hive and performs a special dance. The direction of the dance shows other bees which way to fly, while its length indicates how far away the flowers are. Scientists first described this behavior many decades ago, and later studies confirmed that bees can follow these instructions with surprising accuracy."),
 ("ctw05", 1, "More people are riding bicycles to work than ever before. In many cities, new bike lanes make the trip safer and faster. Cycling is cheap, and it also helps people stay fit without going to a gym. Some companies even pay workers a small bonus for leaving their cars at home. However, bad weather and long distances still keep many commuters from making the switch."),
 ("ctw06", 3, "The placebo effect remains one of the most intriguing phenomena in medicine. Patients who receive an inactive substance sometimes report genuine improvements in their symptoms, particularly when the condition involves pain or anxiety. Researchers attribute this response to expectation, which appears to trigger the release of natural chemicals in the brain. Consequently, clinical trials must compare new drugs against placebos rather than against no treatment at all, ensuring that observed benefits exceed those produced by belief alone."),
]

DAILY = []
def daily(id, level, genre, title, text, qs, me=None):
    d = {"id": id, "level": level, "genre": genre, "title": title, "text": text, "questions": qs}
    if me: d["me"] = me
    DAILY.append(d)

daily("d01", 2, "notice", "Library notice", """# Notice to All Library Users
The second floor of Hartwell Library will be closed from March 4 to March 18 while new study rooms are built.
During this time, the group study area will move to Room 105 on the first floor. Printers from the second floor have been relocated next to the main desk on the first floor.
Books from the second-floor collection can still be requested online and picked up within 24 hours. We apologize for the inconvenience.""", [
 mc("What is the main purpose of the notice?", "To inform users about a temporary closure", ["To announce new library opening hours", "To advertise study rooms that can be rented", "To ask users to return books early"], "Der Aushang kündigt an, dass der 2. Stock vom 4. bis 18. März geschlossen ist."),
 mc("According to the notice, how can users get books from the second floor during the closure?", "By requesting them online", ["By asking a librarian on the second floor", "By going to Room 105", "By waiting until March 18"], "„Books … can still be requested online and picked up within 24 hours.“"),
 mc("The word \"relocated\" in the notice is closest in meaning to", "moved", ["repaired", "replaced", "removed"], "relocate = an einen anderen Ort bringen."),
])
daily("d02", 2, "email", "Team lunch", """From: Dana Whitfield
To: All Marketing Staff
Subject: Friday's team lunch
Hi everyone,
Just a reminder that our team lunch is this Friday at 12:30 at Rosa's Kitchen on Elm Street. The restaurant has asked for final numbers by Wednesday, so please reply to this email if you haven't already.
Vegetarian and gluten-free options are available, but let me know about any other dietary needs. The company will cover the cost of meals, though drinks other than water and soft drinks will not be reimbursed.
Thanks,
Dana""", [
 mc("What does Dana ask the staff to do?", "Confirm whether they are coming by Wednesday", ["Choose a restaurant for the lunch", "Pay for their meals in advance", "Bring food to the office on Friday"], "Das Restaurant braucht bis Mittwoch die finale Zahl – wer noch nicht geantwortet hat, soll antworten."),
 mc("What is indicated about drinks?", "Employees must pay for some drinks themselves", ["Only water will be served", "The company will pay for all drinks", "Drinks must be ordered by Wednesday"], "Getränke außer Wasser und Softdrinks werden nicht erstattet."),
])
daily("d03", 2, "chat", "Study session", """Maya: Hey, are you still coming to the study session tonight?
Jordan: Yes, but I might be 15 minutes late. My lab runs until 7.
Maya: No problem. We moved it to the third-floor lounge, by the way. The library was packed.
Jordan: Good to know. Should I bring anything?
Maya: If you still have the practice problems from last week, bring those. Nobody else saved them.""", [
 mc("Why will Jordan be late?", "His lab ends at 7.", ["He forgot about the session.", "The library is too crowded.", "He has to find the practice problems."], "„My lab runs until 7.“"),
 mc("Why did the group change the location of the session?", "The library was too full.", ["The lounge has better equipment.", "Jordan asked them to.", "The library closes early."], "„The library was packed.“ – packed = überfüllt."),
 mc("What does Maya ask Jordan to bring?", "Practice problems from the previous week", ["Snacks for the group", "A copy of the textbook", "Notes from his lab"], "„If you still have the practice problems from last week, bring those.“"),
], me="Jordan")
daily("d04", 2, "menu", "Café specials", """# Green Fork Café – Weekday Lunch Specials
Item | Price
Soup of the day | $4.50
Grilled chicken wrap | $8.75
Quinoa salad bowl | $9.25
Combo: any half sandwich + soup | $9.00
Specials are served Monday through Friday from 11:00 a.m. to 2:30 p.m. Show a valid student ID to receive 10% off any combo.
Online orders placed before 10:30 a.m. are guaranteed to be ready by noon.""", [
 mc("How much would a student with a valid ID pay for the combo?", "$8.10", ["$9.00", "$8.75", "$9.90"], "10 % Rabatt auf $9.00 = $8.10."),
 mc("What is true about online orders?", "Orders placed early will be ready by midday.", ["They are only available for combos.", "They must be paid for in cash.", "They are delivered to campus."], "Vor 10:30 bestellt = garantiert bis 12 Uhr fertig."),
 mc("When can a customer NOT order the specials?", "On Saturday at noon", ["On Tuesday at 1:00 p.m.", "On Friday at 11:30 a.m.", "On Monday at 2:00 p.m."], "Die Specials gibt es nur Montag bis Freitag."),
])
daily("d05", 2, "post", "Garden volunteers", """# Riverside Community Garden
Posted by Riverside Garden Club
Volunteers needed! This Saturday from 9 a.m. to noon we'll be preparing the beds for spring planting. No experience necessary – we'll provide gloves and tools. Just wear clothes you don't mind getting dirty.
Anyone who volunteers three times this season will get their own small plot for free next year. Coffee and pastries will be provided by Main Street Bakery.""", [
 mc("What is the purpose of the post?", "To find people to help in a garden", ["To sell plots in a garden", "To advertise a local bakery", "To announce a gardening class"], "„Volunteers needed!“ – es werden Helfer gesucht."),
 mc("What will people who volunteer three times receive?", "A garden plot at no cost", ["A set of garden tools", "Free coffee for a year", "A discount at a bakery"], "„… will get their own small plot for free next year.“"),
])
daily("d06", 2, "receipt", "Bookstore receipt", """# Campus Bookstore – Receipt
Sept. 3 · Transaction #40217
Item | Price
Intro to Psychology (used) | $62.00
Lab notebook | $11.50
Graphing calculator (rental, 1 semester) | $25.00
Total | $98.50
Used books may be returned for a full refund within 14 days with this receipt. Rental items must be returned by December 20, or the full purchase price will be charged.""", [
 mc("What will happen if the calculator is returned on December 22?", "The student will be charged the calculator's full price.", ["The student will receive a partial refund.", "The rental period will be extended.", "Nothing, because the semester is over."], "Leihartikel bis 20.12. zurück, sonst wird der volle Kaufpreis berechnet."),
 mc("What is indicated about the psychology book?", "It can be returned for a refund for two weeks.", ["It was bought new.", "It must be returned by December 20.", "It is a rental item."], "Gebrauchte Bücher: volle Erstattung innerhalb von 14 Tagen."),
])
daily("d07", 1, "notice", "Pool closed", """# Pool Closed
The campus swimming pool will be closed on Monday, October 14, for cleaning. It will open again on Tuesday at 6:00 a.m.
Swim classes planned for Monday will take place on Wednesday at the same time. Thank you for your patience!""", [
 mc("Why is the pool closed?", "It is being cleaned.", ["There is a swim competition.", "It is a holiday.", "The weather is bad."], "„… closed … for cleaning.“"),
 mc("What will happen to Monday's swim classes?", "They will be held on Wednesday.", ["They are canceled.", "They will be held on Tuesday.", "They will start at 6:00 a.m."], "„… will take place on Wednesday at the same time.“"),
])
daily("d08", 1, "chat", "Movie tonight", """Lena: Are you going to the movie tonight?
Sam: I want to, but I have to finish my essay first.
Lena: It starts at 8. Can you make it?
Sam: Probably. Save me a seat just in case!""", [
 mc("What does Sam need to do before the movie?", "Finish an essay", ["Buy tickets", "Meet a professor", "Eat dinner"], "„I have to finish my essay first.“"),
 mc("What does Sam ask Lena to do?", "Keep a seat for him", ["Wait outside the theater", "Help him with his essay", "Change the movie time"], "„Save me a seat“ = halte mir einen Platz frei."),
], me="Sam")
daily("d09", 1, "ad", "Room for rent", """# Room for Rent
Quiet room available in a shared apartment, 10 minutes from campus by bus. $550 per month, including electricity and internet. Shared kitchen and bathroom. No pets.
Available from January 1. Contact Mark at 555-0147 after 5 p.m.""", [
 mc("What is included in the rent?", "Internet", ["Meals", "A bus pass", "Parking"], "„$550 per month, including electricity and internet.“"),
 mc("When should people call Mark?", "In the evening", ["In the morning", "At lunchtime", "Only on January 1"], "„after 5 p.m.“"),
 mc("Who would NOT be able to rent the room?", "A person who has a cat", ["A student without a car", "Someone who cooks often", "Someone who wants to move in in January"], "„No pets.“"),
])
daily("d10", 1, "email", "No class", """From: Prof. Alvarez
To: BIO 101 Students
Subject: No class on Thursday
Dear students,
I will be at a conference this week, so there is no class on Thursday. Please read Chapter 6 instead. We will discuss it next Tuesday.
The quiz planned for Thursday will also take place on Tuesday.
Best,
Professor Alvarez""", [
 mc("Why is there no class on Thursday?", "The professor is attending a conference.", ["The professor is sick.", "It is a holiday.", "The classroom is being repaired."], "„I will be at a conference this week.“"),
 mc("What will students do next Tuesday?", "Discuss Chapter 6 and take a quiz", ["Read Chapter 6 in class", "Go to a conference", "Hand in a lab report"], "Kapitel 6 wird besprochen, und das Quiz findet ebenfalls Dienstag statt."),
])
daily("d11", 1, "schedule", "Shuttle bus", """# Shuttle Bus: Campus to Downtown
Stop | Weekdays | Weekends
Main Gate | every 15 min | every 30 min
Science Building | every 15 min | every 30 min
Downtown Station | every 15 min | every 30 min
The last bus leaves Main Gate at 11:45 p.m. Students ride free with their ID card.""", [
 mc("How often does the shuttle run on Saturdays?", "Every 30 minutes", ["Every 15 minutes", "Every hour", "It does not run on Saturdays."], "Wochenende: every 30 min."),
 mc("What do students need in order to ride for free?", "Their ID card", ["A paper ticket", "A monthly pass", "Nothing at all"], "„Students ride free with their ID card.“"),
])
daily("d12", 3, "email", "Water outage", """From: Facilities Management
To: Residents of Whitmore Hall
Subject: Scheduled water outage – please read
Dear residents,
Contractors will be replacing a corroded main valve in Whitmore Hall on Thursday. To complete the work safely, the water supply to the entire building will be shut off between 8:00 a.m. and approximately 2:00 p.m.
Although we anticipate finishing on schedule, residents should be aware that unforeseen complications occasionally prolong such repairs. Shower facilities in the adjacent Recreation Center will remain open to Whitmore residents throughout the day.
We recommend filling containers with drinking water the night before.
Facilities Management""", [
 mc("Why will the water be shut off?", "A damaged part of the water system is being replaced.", ["The building's water tanks are being cleaned.", "A new shower system is being tested.", "The building is being connected to the Recreation Center."], "„replacing a corroded main valve“ – ein beschädigtes Ventil wird ersetzt."),
 mc("What does Facilities Management suggest about the repair?", "It might take longer than planned.", ["It will definitely end before 2:00 p.m.", "It has already been postponed several times.", "It requires residents to leave the building."], "„unforeseen complications occasionally prolong such repairs“ – es kann länger dauern."),
 mc("The word \"adjacent\" in the email is closest in meaning to", "nearby", ["newly built", "public", "larger"], "adjacent = angrenzend, benachbart."),
])
daily("d13", 3, "post", "Sustainability office", """# Campus Sustainability Office
Last semester's "Bring Your Own Mug" campaign exceeded every expectation: disposable cup use in campus cafés fell by 38 percent.
Encouraged by these results, we are extending the 25-cent discount for reusable containers to all dining halls starting next month. We are also piloting a deposit system in two cafés, in which customers pay $1 for a reusable cup and get their dollar back when the cup is returned.
Should the pilot prove successful, it will be introduced campus-wide in the fall.""", [
 mc("What is the main purpose of the post?", "To report the results of a campaign and announce next steps", ["To announce that cafés will stop selling coffee", "To criticize students for using disposable cups", "To explain why prices in dining halls are rising"], "Ergebnis der Kampagne (−38 %) plus Ausweitung und Pilotprojekt."),
 mc("What can be inferred about the deposit system?", "Whether it is expanded depends on how well it works at first.", ["It is already used in all dining halls.", "It costs customers 25 cents per cup.", "It has replaced the discount for reusable containers."], "„Should the pilot prove successful, it will be introduced campus-wide.“"),
 mc("The phrase \"exceeded every expectation\" means that the campaign was", "more successful than expected", ["more expensive than expected", "shorter than expected", "less popular than expected"], "exceed = übertreffen."),
])
daily("d14", 3, "chat", "Draft feedback", """Daniel: Did you get a chance to look at the draft I sent?
Priya: I did. The data section is really strong.
Daniel: And the introduction?
Priya: Well… I think a reader who isn't in our field might have a hard time figuring out why the topic matters.
Daniel: So, back to the drawing board?
Priya: Not entirely – just a couple of paragraphs. I can go over it with you tomorrow if you want.""", [
 mc("What does Priya imply about the introduction?", "It does not clearly explain why the topic is important.", ["It is too long.", "It contains incorrect data.", "It is ready to be submitted."], "Leser außerhalb des Fachs verstehen nicht, warum das Thema wichtig ist."),
 mc("What does Daniel mean when he says \"back to the drawing board\"?", "He thinks he has to start over.", ["He wants to add some drawings.", "He plans to meet in the art room.", "He disagrees with Priya's opinion."], "back to the drawing board = noch einmal von vorn anfangen."),
 mc("What does Priya offer to do?", "Review the draft together with Daniel", ["Rewrite the data section", "Send Daniel her own paper", "Explain the topic to other readers"], "„I can go over it with you tomorrow.“"),
], me="Priya")
daily("d15", 3, "webpage", "Extension policy", """# Requesting an Extension on a Final Paper
Students who cannot meet a final paper deadline because of circumstances beyond their control may request an extension of up to seven days.
Requests must be submitted through the Student Portal no later than 48 hours before the original deadline and should be accompanied by supporting documentation where possible. Instructors are not obligated to grant extensions requested after this point, except in documented emergencies.
Approved extensions do not affect a student's eligibility for honors, but papers submitted after an extended deadline will be penalized at the instructor's discretion.""", [
 mc("According to the page, when must most extension requests be made?", "At least two days before the original deadline", ["Within seven days after the deadline", "On the day of the deadline", "At the start of the semester"], "„no later than 48 hours before the original deadline“."),
 mc("What is true about requests made later than this?", "Instructors may refuse them unless there is a documented emergency.", ["They are always rejected.", "They are usually accepted with documentation.", "They reduce the student's chance of receiving honors."], "„not obligated to grant … except in documented emergencies“."),
 mc("The phrase \"at the instructor's discretion\" means that the penalty", "is decided by the instructor", ["is the same for all students", "must be approved by the university", "is explained in the Student Portal"], "discretion = Ermessen."),
])
daily("d16", 3, "review", "Restaurant review", """# Review: The Lantern Room ★★★☆☆
I had high hopes for this new place after reading so much praise online. The setting is undeniably charming – exposed brick, soft lighting, and a view of the harbor.
Unfortunately, the food did not live up to the atmosphere. My grilled fish arrived lukewarm, and the much-advertised seasonal vegetables were little more than a handful of overcooked carrots.
To be fair, our server was attentive and apologized sincerely, even removing the fish from our bill. I might return for drinks on the terrace, but I would think twice before ordering dinner again.""", [
 mc("What is the reviewer's overall opinion of the restaurant?", "The atmosphere is better than the food.", ["It is excellent in every way.", "The service was the main problem.", "It is too expensive for what it offers."], "„the food did not live up to the atmosphere“."),
 mc("Why does the reviewer mention the server?", "To give a fair, balanced picture of the visit", ["To complain about slow service", "To explain why the food was cold", "To recommend a specific employee for promotion"], "„To be fair …“ leitet einen positiven Gegenpunkt ein."),
])

ACAD = []
def acad(id, level, title, text, qs): ACAD.append({"id": id, "level": level, "title": title, "text": text, "questions": qs})

acad("ac01", 2, "Mangrove Forests", """Mangroves are trees that grow in the salty, shallow waters along tropical coastlines. Few plants can survive in such conditions, but mangroves have developed several unusual adaptations. Some species filter salt out of seawater through their roots, while others store excess salt in older leaves that eventually fall off. Because the muddy soil contains very little oxygen, many mangroves also grow special roots that stick up out of the mud like pencils, allowing the trees to absorb air directly.
These forests provide important benefits to both wildlife and people. Their dense root systems act as nurseries for young fish, which hide from predators among the roots until they are large enough to survive in open water. Mangroves also protect coastal communities: during storms, the tangled roots reduce the force of waves and help prevent the erosion of shorelines.
Despite these benefits, mangrove forests have declined significantly in recent decades. Large areas have been cleared to make room for shrimp farms and coastal development. Scientists warn that losing mangroves not only harms fish populations but also leaves coastal towns more vulnerable to storm damage.""", [
 mc("According to paragraph 1, why do some mangroves have roots that stick up out of the mud?", "To take in oxygen from the air", ["To collect rainwater", "To store excess salt", "To hold the trees in place during storms"], "Der Schlamm enthält kaum Sauerstoff; die Wurzeln „absorb air directly“."),
 mc("The word \"dense\" in paragraph 2 is closest in meaning to", "thick", ["shallow", "ancient", "fragile"], "dense = dicht."),
 mc("Why does the author mention young fish in paragraph 2?", "To show one way mangroves benefit wildlife", ["To explain how mangroves obtain nutrients", "To describe a threat to mangrove forests", "To compare mangroves with coral reefs"], "Junge Fische nutzen die Wurzeln als „nurseries“ – Beispiel für Nutzen für Tiere."),
 mc("Which of the following is NOT mentioned as a way mangroves deal with salt?", "Releasing it through their flowers", ["Filtering it out through their roots", "Storing it in older leaves", "Losing it when old leaves fall off"], "Blüten werden im Text nicht erwähnt."),
 mc("What can be inferred from paragraph 3?", "Clearing mangroves may increase storm damage to coastal towns.", ["Shrimp farms help protect shorelines.", "Mangrove forests are expanding in most regions.", "Scientists generally support coastal development."], "Ohne Mangroven sind Küstenorte „more vulnerable to storm damage“."),
])
acad("ac02", 1, "Why Do We Yawn?", """Everyone yawns, but scientists are still not sure why. For many years, people believed that yawning brings more oxygen into the body when we are tired. However, experiments have shown that breathing extra oxygen does not make people yawn less, so this explanation is probably wrong.
A newer idea is that yawning helps cool the brain. When we yawn, we take in a large amount of air, and the jaw stretches widely. This movement increases blood flow to the head and may lower the temperature of the brain slightly. In one study, people yawned less often when they held a cold pack against their forehead.
Yawning is also contagious. Seeing, hearing, or even reading about someone yawning can make us yawn too. Interestingly, people are more likely to "catch" a yawn from a family member or a close friend than from a stranger. Some researchers think this shows that contagious yawning is connected to empathy, the ability to understand how others feel.""", [
 mc("What is the passage mainly about?", "Different explanations for why people yawn", ["Ways to stop yawning", "Why tired people need more oxygen", "The connection between sleep and body temperature"], "Der Text stellt mehrere Erklärungen für das Gähnen vor."),
 mc("According to paragraph 1, why is the oxygen explanation probably wrong?", "Breathing extra oxygen does not reduce yawning.", ["Yawning lowers the amount of oxygen in the body.", "Only tired people yawn.", "Scientists have never tested it."], "„breathing extra oxygen does not make people yawn less“."),
 mc("The word \"contagious\" in paragraph 3 is closest in meaning to", "easily passed to others", ["dangerous", "difficult to stop", "common in families"], "contagious = ansteckend."),
 mc("What did people do in the study mentioned in paragraph 2?", "They held something cold against their forehead.", ["They breathed extra oxygen.", "They read about yawning.", "They watched family members yawn."], "„held a cold pack against their forehead“."),
 mc("What can be inferred about contagious yawning?", "It happens more often between people who are close.", ["It only happens when people see someone yawn.", "It is a sign that a person is tired.", "Strangers cause the most yawns."], "Man „fängt“ das Gähnen eher bei Familie und Freunden."),
])
acad("ac03", 3, "The Paradox of Choice", """Conventional economic thinking holds that having more options is always beneficial: if an option is added that no one wants, people can simply ignore it. Yet a growing body of psychological research suggests that an abundance of options can, under certain conditions, undermine both decision-making and satisfaction.
In a widely cited field experiment, shoppers encountered a tasting booth offering either six or twenty-four varieties of jam. Although the larger display attracted more visitors, those who saw the smaller selection were roughly ten times more likely to make a purchase. The researchers proposed that comparing many similar alternatives imposes a cognitive burden that can lead people to postpone or avoid decisions altogether.
Even when people do choose, an extensive range of options may diminish their contentment. With more alternatives available, it becomes easier to imagine that a different selection would have been superior, and this anticipated regret can reduce the pleasure derived from the chosen item.
Subsequent studies, however, have complicated the picture. Several attempts to replicate the original findings produced weak or inconsistent effects, and analyses suggest that choice overload emerges mainly when options are difficult to compare or when decision-makers lack clear preferences. Experts in a particular domain, for instance, appear largely immune to it.""", [
 mc("According to paragraph 1, what does conventional economic thinking assume?", "Additional options never make people worse off.", ["People generally prefer fewer options.", "Unwanted options should be removed from stores.", "Satisfaction depends mainly on price."], "„having more options is always beneficial“ – man kann Unerwünschtes ignorieren."),
 mc("What was surprising about the result of the jam experiment?", "The larger display led to fewer purchases even though it attracted more visitors.", ["Fewer people visited the smaller display.", "Shoppers preferred jams with fewer ingredients.", "Visitors tasted more jam at the smaller display."], "Mehr Besucher, aber zehnmal weniger Käufe bei 24 Sorten."),
 mc("The word \"diminish\" in paragraph 3 is closest in meaning to", "reduce", ["reveal", "delay", "replace"], "diminish = verringern."),
 mc("Why does the author mention experts in the final paragraph?", "To show that choice overload does not affect everyone equally", ["To argue that experts make worse decisions", "To explain why the jam study was repeated", "To suggest that shoppers should consult experts"], "Experten sind „largely immune“ – der Effekt hängt von Bedingungen ab."),
 mc("Which statement best describes the author's view of the original findings?", "They may hold only under certain conditions.", ["They have been completely disproven.", "They apply to all decisions people make.", "They are irrelevant to economics."], "Wiederholungen zeigten schwache Effekte; der Effekt tritt „mainly when …“ auf."),
])
acad("ac04", 3, "Life at Hydrothermal Vents", """In 1977, researchers exploring the floor of the Pacific Ocean made a discovery that overturned long-standing assumptions about life on Earth. Near volcanic openings called hydrothermal vents, where water heated by magma bursts from the seafloor at temperatures exceeding 350°C, they found thriving communities of giant tube worms, clams, and crabs.
The finding was puzzling because sunlight never penetrates these depths, and nearly all known ecosystems ultimately depend on photosynthesis. The explanation turned out to lie in chemosynthesis. Bacteria living around the vents derive energy from chemical reactions involving hydrogen sulfide, a compound abundant in the vent fluid but toxic to most organisms. These bacteria form the base of the food web; giant tube worms, which lack both a mouth and a digestive system, host billions of them inside their bodies and absorb the nutrients they produce.
The implications extend beyond marine biology. Because vent ecosystems function independently of the sun, some scientists have proposed that life on Earth may have originated in similar environments. The discovery has also encouraged the search for life on moons such as Europa and Enceladus, whose ice-covered oceans may conceal comparable hydrothermal activity.""", [
 mc("Why was the 1977 discovery surprising?", "The animals survived without depending on sunlight.", ["The water near the vents was colder than expected.", "The vents were located in the Pacific Ocean.", "Clams had never been observed before."], "Fast alle Ökosysteme hängen an Photosynthese – hier gibt es kein Licht."),
 mc("The word \"abundant\" in paragraph 2 is closest in meaning to", "plentiful", ["dangerous", "rare", "hidden"], "abundant = reichlich vorhanden."),
 mc("According to paragraph 2, how do giant tube worms obtain food?", "From bacteria living inside their bodies", ["By filtering plankton from the water", "By eating smaller animals near the vents", "Through photosynthesis in their skin"], "Sie beherbergen Bakterien und nehmen deren Nährstoffe auf."),
 mc("What does the author indicate about hydrogen sulfide?", "It is harmful to most living things.", ["It is produced by the tube worms.", "It cools the vent fluid.", "It is found mainly on Europa."], "„toxic to most organisms“."),
 mc("Why does the author mention Europa and Enceladus?", "To show that the discovery influenced the search for life elsewhere", ["To compare their temperatures with Earth's oceans", "To argue that life definitely exists there", "To explain where vents were first discovered"], "Die Entdeckung „encouraged the search for life on moons such as …“."),
])
acad("ac05", 2, "The Origins of Paper Money", """Paper money first appeared in China more than a thousand years ago. Merchants during the Tang dynasty found heavy metal coins inconvenient for large transactions, so they began leaving their coins with trusted agents in exchange for paper receipts. These receipts could be traded among merchants and later exchanged back for coins.
By the eleventh century, the Song government had recognized the usefulness of this system and began issuing official paper notes. Government control brought both advantages and risks. On the one hand, official notes were accepted throughout the empire. On the other hand, the government could print as many notes as it wished, and during times of war it often printed far more than it could support. The result was inflation: prices rose sharply, and the notes lost much of their value.
European travelers such as Marco Polo described Chinese paper money with amazement, but the idea spread slowly. It was not until the seventeenth century that banks in Sweden and England began issuing paper notes of their own. Today, paper money is used everywhere, although electronic payments are steadily replacing it in many countries.""", [
 mc("Why did merchants in the Tang dynasty begin using paper receipts?", "Metal coins were inconvenient for large payments.", ["The government required them to.", "Paper was cheaper to produce than metal.", "Foreign traders refused to accept coins."], "„found heavy metal coins inconvenient for large transactions“."),
 mc("The word \"issuing\" in paragraph 2 is closest in meaning to", "officially giving out", ["collecting", "destroying", "designing"], "issue = (offiziell) ausgeben."),
 mc("According to paragraph 2, what was a disadvantage of government-controlled paper money?", "The government sometimes printed too much, which caused prices to rise.", ["It was accepted only in a few cities.", "Merchants could not exchange it for coins.", "Criminals could copy it easily."], "Zu viel gedrucktes Geld → Inflation."),
 mc("Why does the author mention Marco Polo?", "To show that Europeans found Chinese paper money remarkable", ["To explain how paper money quickly reached Europe", "To describe a famous Chinese merchant", "To argue that paper money was invented in Europe"], "Er beschrieb das Papiergeld „with amazement“."),
 mc("What can be inferred from the last sentence of the passage?", "Paper money may become less common in the future.", ["Electronic payments are less secure than cash.", "Sweden was the first country to stop using paper money.", "Paper money is no longer printed."], "Elektronische Zahlungen ersetzen Papiergeld „steadily“."),
])

data = {"ctw": [{"id": i, "level": l, "text": ctw(t)} for i, l, t in CTW], "daily": DAILY, "academic": ACAD}
json.dump(data, open("/home/claude/toefl-karteikarten/trainer/content/reading.json", "w"), ensure_ascii=False, indent=1)
for c in data["ctw"]: print(c["id"], c["text"][:200])
