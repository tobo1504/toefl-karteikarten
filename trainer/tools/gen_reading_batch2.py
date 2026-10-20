"""Reading Batch 2: Material für einen zweiten vollständigen Reading-Test."""
from contentlib import ctw, MC, append
mc = MC(start=2, seed=22)

CTW = [
 ("ctw07", 2, "Many animals use camouflage to avoid predators. Some insects look almost exactly like leaves or twigs, which makes them very difficult to see. Other animals can change their colors to match their surroundings, as octopuses and some lizards do. Camouflage is not only useful for prey, however. Predators such as tigers use their striped coats to hide in tall grass while they wait for the right moment to attack."),
 ("ctw08", 1, "Drinking enough water is important for good health. Our bodies use water to control temperature and to carry nutrients to our cells. Many people only drink when they feel thirsty, but by then the body may already need more water. Doctors suggest keeping a bottle nearby during the day. Fruits and vegetables also contain a lot of water, so they can help too."),
 ("ctw09", 3, "Language extinction has accelerated dramatically over the past century. Linguists estimate that roughly half of the world's languages could disappear within the next hundred years. When a language vanishes, communities frequently lose irreplaceable knowledge about local ecosystems, medicinal plants, and cultural traditions. Revitalization programs, which typically combine immersive schooling with digital archives, have achieved notable success in several regions, demonstrating that the decline is not necessarily irreversible when communities receive sustained institutional support."),
]
append("reading", "ctw", [{"id": i, "level": l, "text": ctw(t)} for i, l, t in CTW])

D = []
def daily(id, level, genre, title, text, qs, me=None):
    d = {"id": id, "level": level, "genre": genre, "title": title, "text": text, "questions": qs}
    if me: d["me"] = me
    D.append(d)

daily("d17", 2, "email", "Soccer schedule", """From: Campus Recreation
To: Intramural Soccer Participants
Subject: Schedule change for Sunday
Hello players,
Because heavy rain is forecast for Sunday afternoon, all intramural soccer games scheduled between 1 p.m. and 5 p.m. will be moved indoors to the Field House. Please note that indoor games are shortened to two 20-minute halves, and cleats are not permitted on the indoor surface – flat-soled shoes only.
Evening games will be played outdoors as planned unless you receive another update by noon on Sunday.
Campus Recreation""", [
 mc("Why are some games being moved?", "Heavy rain is expected.", ["The fields are being repaired.", "Too many teams have signed up.", "The Field House is closer to campus."], "„Because heavy rain is forecast …“"),
 mc("What must players do for indoor games?", "Wear shoes without cleats", ["Arrive 20 minutes early", "Bring their own ball", "Register again online"], "„cleats are not permitted … flat-soled shoes only“."),
 mc("What can be inferred about the evening games?", "Their plans could still change.", ["They have been canceled.", "They will be shortened.", "They will take place in the Field House."], "„as planned unless you receive another update“."),
])
daily("d18", 2, "notice", "Lost and found", """# Lost & Found – Student Union
Items turned in at the Student Union are kept for 30 days. After that, clothing is donated to local charities, and electronics are recycled.
To claim an item, visit the Information Desk (Mon–Fri, 8 a.m.–6 p.m.) and describe it in detail. Phones, laptops, and wallets will only be returned after you show a photo ID.
We cannot hold items for other people or mail them to you.""", [
 mc("What happens to a jacket that nobody claims within a month?", "It is given to a charity.", ["It is recycled.", "It is sold online.", "It is mailed to the owner."], "Kleidung wird nach 30 Tagen gespendet."),
 mc("What is required to claim a lost wallet?", "A photo ID", ["A receipt", "An online form", "A friend's signature"], "Telefone, Laptops und Geldbörsen nur gegen Lichtbildausweis."),
])
daily("d19", 2, "chat", "Bus pass", """Leo: Did you see that the bus pass price is going up next semester?
Ava: Seriously? By how much?
Leo: From $90 to $120. But if you buy before December 1, you still get the old price.
Ava: Then I'm buying mine this week. Thanks for the heads-up!
Leo: No worries. You can do it online – it only takes a minute.""", [
 mc("What will happen to the price of the bus pass?", "It will increase by $30.", ["It will decrease to $90.", "It will stay the same.", "It will double."], "Von $90 auf $120."),
 mc("What does Ava decide to do?", "Buy her pass soon to save money", ["Stop taking the bus", "Wait until December", "Ask for a refund"], "Vor dem 1. Dezember gilt noch der alte Preis."),
 mc("What does Ava mean by \"Thanks for the heads-up\"?", "Thanks for the warning.", ["Thanks for helping with my homework.", "Thanks for paying for me.", "Thanks for the ride."], "heads-up = Vorwarnung, Hinweis."),
], me="Ava")
daily("d20", 2, "schedule", "Writing Center hours", """# Writing Center – Fall Hours
Day | In person | Online
Monday–Thursday | 10 a.m.–7 p.m. | 10 a.m.–10 p.m.
Friday | 10 a.m.–3 p.m. | 10 a.m.–3 p.m.
Weekend | closed | 2 p.m.–8 p.m.
Appointments are 45 minutes long. Please bring a printed copy of your draft to in-person sessions. Students may book up to two appointments per week.""", [
 mc("How can a student get help from the Writing Center on a Saturday?", "Online in the afternoon or evening", ["In person in the morning", "Not at all", "In person until 3 p.m."], "Wochenende: nur online, 14–20 Uhr."),
 mc("What should students bring to an in-person appointment?", "A printed copy of their draft", ["Their laptop", "A completed booking form", "Two copies of the assignment"], "„bring a printed copy of your draft“."),
 mc("What is the maximum number of appointments a student can have in one week?", "Two", ["One", "Three", "As many as needed"], "„up to two appointments per week“."),
])
daily("d21", 1, "notice", "Flu shots", """# Free Flu Shots
The Student Health Center is offering free flu shots for all students next week, Monday to Thursday, from 9 a.m. to 4 p.m.
No appointment is needed. Just bring your student ID. The shots take about five minutes.""", [
 mc("What is being offered?", "Free flu shots", ["Free health check-ups", "Cheap medicine", "A health class"], "„free flu shots for all students“."),
 mc("What do students need to bring?", "Their student ID", ["An appointment card", "Some money", "A doctor's note"], "„Just bring your student ID.“"),
])
daily("d22", 1, "chat", "Shopping", """Noah: Hey, I'm at the store. Do we need anything for dinner?
Kim: Yes, can you get some rice and onions?
Noah: Sure. Anything else?
Kim: Maybe some apples for tomorrow. Thanks!""", [
 mc("Where is Noah?", "At a store", ["At home", "In a restaurant", "At school"], "„I'm at the store.“"),
 mc("What does Kim want for tomorrow?", "Apples", ["Rice", "Onions", "Dinner"], "„some apples for tomorrow“."),
], me="Kim")
daily("d23", 1, "ad", "Guitar lessons", """# Guitar Lessons
Learn to play the guitar! Lessons for beginners every Tuesday and Thursday evening at the Music Building, Room 12. Each lesson is one hour.
$15 per lesson, or $50 for four lessons. Guitars are available to borrow. Email Ms. Torres to sign up.""", [
 mc("How much do four lessons cost?", "$50", ["$15", "$60", "$45"], "„$50 for four lessons“."),
 mc("What is true about the lessons?", "Students can borrow a guitar.", ["They are on weekends.", "They are for advanced players.", "They last two hours."], "„Guitars are available to borrow.“"),
])
daily("d24", 1, "email", "Book club", """From: Jenna
To: Book Club Members
Subject: Next meeting
Hi all,
Our next meeting is on Friday at 6 p.m. in the café on Pine Street, not in the library this time. We will talk about the first half of the book. Please let me know if you can't come.
See you soon,
Jenna""", [
 mc("Where will the next meeting take place?", "In a café", ["In the library", "At Jenna's house", "Online"], "„in the café on Pine Street, not in the library“."),
 mc("What will the club talk about?", "Part of the book", ["The whole book", "A new book", "The café's menu"], "„the first half of the book“."),
])
daily("d25", 3, "email", "Graduate application", """From: Office of Graduate Admissions
To: Applicant
Subject: Application materials
Dear applicant,
Our records indicate that your application is complete with the exception of one letter of recommendation. Please note that applications lacking any required document by January 15 will not be forwarded to the admissions committee.
Recommenders who experience difficulty with the online portal may email their letters directly to our office, provided the message originates from an institutional email address.
Should you wish to replace a recommender, you may do so through your applicant dashboard at any time before the deadline.
Office of Graduate Admissions""", [
 mc("Why did the applicant receive this email?", "A letter of recommendation is still missing.", ["The application was rejected.", "The deadline has been extended.", "The online portal has been closed."], "„complete with the exception of one letter of recommendation“."),
 mc("What will happen if the application is still incomplete on January 15?", "It will not be reviewed by the committee.", ["The applicant will be charged a fee.", "The deadline will be extended automatically.", "The committee will contact the recommender."], "„will not be forwarded to the admissions committee“."),
 mc("What condition applies to letters sent by email?", "They must come from an institutional email address.", ["They must be sent before January 1.", "They must be signed by hand.", "They must be sent by the applicant."], "„provided the message originates from an institutional email address“."),
])
daily("d26", 3, "post", "Library hours", """# From the Desk of the Dean
Several students have asked why the library's 24-hour schedule ends after midterms. The answer is simple: usage data show that overnight attendance drops by more than 80 percent once exams are over, and staffing the building around the clock is costly.
That said, we recognize that some students rely on late-night study space. Beginning this semester, the ground-floor study lounge will remain accessible with a student ID until 2 a.m. throughout the term.
We will continue to monitor demand and adjust hours accordingly.""", [
 mc("Why does the library stop opening 24 hours a day after midterms?", "Few students use it at night then, and staffing is expensive.", ["The building needs repairs.", "Students complained about noise.", "Staff members go on vacation."], "Nutzung −80 % und hohe Personalkosten."),
 mc("What change is announced?", "A study lounge will stay open late throughout the semester.", ["The library will be open 24 hours all term.", "The library will close earlier than before.", "Students will need a new type of ID."], "Lounge bis 2 Uhr mit Studierendenausweis."),
 mc("What does the dean suggest about future opening hours?", "They may change depending on how much the space is used.", ["They are final and will not change.", "They will be decided by a student vote.", "They will be reduced next year."], "„monitor demand and adjust hours accordingly“."),
])
daily("d27", 3, "chat", "Presentation sources", """Owen: Are you presenting first or second on Thursday?
Grace: Second, thank goodness. I need every minute I can get.
Owen: Isn't your part pretty much done?
Grace: The slides are, but the professor wants us to cite at least five peer-reviewed sources, and I've only got three.
Owen: Have you tried the interlibrary loan service? It's usually quicker than people think.
Grace: I hadn't thought of that. I'll put in a request tonight.""", [
 mc("Why is Grace relieved to present second?", "She needs more time to prepare.", ["She is nervous about speaking in public.", "Her slides are not finished.", "She wants to see Owen's presentation first."], "„I need every minute I can get.“"),
 mc("What problem does Grace have?", "She does not have enough academic sources.", ["She cannot open her slides.", "She has missed the deadline.", "Her partner has left the group."], "Fünf Fachquellen gefordert, sie hat drei."),
 mc("What does Owen imply about the interlibrary loan service?", "It might solve her problem in time.", ["It is usually too slow to be useful.", "It is only available to professors.", "It is expensive for students."], "„usually quicker than people think“."),
], me="Grace")
daily("d28", 3, "instructions", "3D printing lab", """# Using the 3D Printing Lab
Before printing for the first time, all users must complete a 30-minute safety orientation, offered every Wednesday at noon.
Prints longer than four hours require advance approval from lab staff and are scheduled overnight. Users are responsible for removing completed prints within 24 hours; unclaimed items will be discarded.
Material costs are charged to your student account at $0.10 per gram.""", [
 mc("What must new users do before printing?", "Attend a safety orientation", ["Pay a fee in advance", "Get approval from a professor", "Buy their own material"], "Pflicht: 30-minütige Sicherheitseinweisung."),
 mc("What happens to a print job that takes six hours?", "It needs approval and is printed overnight.", ["It is not allowed.", "It is free of charge.", "It must be printed on a Wednesday."], "Über vier Stunden: Genehmigung, Druck über Nacht."),
 mc("How much would a 50-gram print cost?", "$5.00", ["$0.50", "$10.00", "$50.00"], "50 × $0,10 = $5,00."),
])
append("reading", "daily", D)

A = []
def acad(id, level, title, text, qs): A.append({"id": id, "level": level, "title": title, "text": text, "questions": qs})
acad("ac06", 2, "The Science of Habits", """Psychologists define a habit as a behavior that has become automatic through repetition. According to one widely used model, every habit consists of three parts: a cue, a routine, and a reward. The cue is a trigger, such as a time of day or a feeling. The routine is the behavior itself, and the reward is the benefit the brain receives, which makes it more likely that the behavior will be repeated.
Research suggests that habits form gradually. In one study, participants who tried to adopt a new daily behavior, such as eating fruit at lunch, needed an average of about two months before the action felt automatic. The time varied widely, however, from less than three weeks to almost a year, depending on the person and the complexity of the behavior.
Because cues are so powerful, experts often recommend changing the environment rather than relying on willpower alone. Someone who wants to snack less, for example, might simply avoid keeping chips at home. Likewise, placing running shoes next to the door can serve as a cue that makes exercise easier to start.""", [
 mc("According to paragraph 1, what is the role of the reward?", "It makes the behavior more likely to be repeated.", ["It signals the start of a routine.", "It replaces the cue.", "It reduces the need for repetition."], "Die Belohnung macht Wiederholung wahrscheinlicher."),
 mc("The word \"gradually\" in paragraph 2 is closest in meaning to", "slowly over time", ["suddenly", "rarely", "easily"], "gradually = allmählich."),
 mc("What did the study described in paragraph 2 find?", "The time needed to form a habit differed greatly between people.", ["All habits form in exactly two months.", "Eating fruit is the easiest habit to form.", "Complex habits form faster than simple ones."], "Von unter drei Wochen bis fast ein Jahr."),
 mc("Why does the author mention running shoes?", "To give an example of using the environment as a cue", ["To show that exercise is a difficult habit", "To compare exercise with snacking", "To recommend a particular type of shoe"], "Schuhe an der Tür als Auslöser."),
 mc("What can be inferred about willpower?", "It may be less effective than changing one's surroundings.", ["It is the most important factor in forming habits.", "It increases with repetition.", "It has no connection to habits."], "„changing the environment rather than relying on willpower alone“."),
])
acad("ac07", 1, "The Journey of Coffee", """Coffee is one of the most popular drinks in the world, and it has a surprisingly long history. According to a well-known story, a goat herder in Ethiopia noticed that his goats became very energetic after eating red berries from a certain bush. He tried the berries himself and felt more awake.
Whether or not the story is true, we know that by the fifteenth century, people in Yemen were roasting coffee beans and making a drink from them. Coffee houses soon opened in cities across the Middle East. They became popular places where people met to talk, listen to music, and share news.
In the seventeenth century, coffee arrived in Europe. At first, some people were suspicious of the new drink, but it quickly became fashionable. Today, coffee is grown in more than fifty countries, and Brazil produces more coffee than any other nation.""", [
 mc("What is the passage mainly about?", "The history of coffee", ["How to grow coffee plants", "Why goats like berries", "Coffee houses in modern cities"], "Der Text erzählt die Geschichte des Kaffees."),
 mc("According to the story, what did the goat herder notice?", "His goats had more energy after eating certain berries.", ["His goats became sick.", "The berries tasted sweet.", "The bush grew very quickly."], "„became very energetic after eating red berries“."),
 mc("What does the author say about the goat herder story?", "It might not be true.", ["It is definitely true.", "It took place in Yemen.", "It is only told in Europe."], "„Whether or not the story is true …“"),
 mc("According to paragraph 2, what did people do in coffee houses?", "They talked and shared news.", ["They grew coffee plants.", "They roasted beans for export.", "They studied medicine."], "„met to talk, listen to music, and share news“."),
 mc("Which country produces the most coffee today?", "Brazil", ["Ethiopia", "Yemen", "Italy"], "„Brazil produces more coffee than any other nation“."),
])
acad("ac08", 3, "The Problem of Antibiotic Resistance", """Since their introduction in the 1940s, antibiotics have transformed medicine, turning once-fatal infections into routine illnesses. Yet their very success has created a formidable problem. Bacteria reproduce rapidly, and random genetic mutations occasionally render some individuals less vulnerable to a particular drug. When an antibiotic is administered, susceptible bacteria die, but resistant ones survive and multiply, gradually producing populations that the drug can no longer control.
Compounding this process, bacteria can exchange genetic material directly, sometimes even across species, through a mechanism known as horizontal gene transfer. A resistance gene that arises in one organism may therefore spread far more quickly than inheritance alone would allow.
Human behavior accelerates the problem. Antibiotics are frequently prescribed for viral infections, against which they are entirely ineffective, and patients often stop treatment once symptoms subside, potentially leaving the hardiest bacteria alive. Meanwhile, pharmaceutical companies have little financial incentive to develop new antibiotics, which are typically used sparingly and for short periods, making them far less profitable than medications for chronic conditions.""", [
 mc("According to paragraph 1, why do resistant bacteria become more common?", "They survive treatment while other bacteria die.", ["Antibiotics cause them to mutate.", "They reproduce more slowly than other bacteria.", "They attack susceptible bacteria."], "Empfindliche sterben, resistente vermehren sich."),
 mc("The word \"formidable\" in paragraph 1 is closest in meaning to", "serious and difficult", ["unexpected", "temporary", "minor"], "formidable = gewaltig, schwerwiegend."),
 mc("What does paragraph 2 suggest about horizontal gene transfer?", "It lets resistance spread faster than through reproduction alone.", ["It only occurs within a single species.", "It prevents mutations.", "It makes bacteria more vulnerable to drugs."], "„far more quickly than inheritance alone would allow“."),
 mc("Why does the author mention viral infections?", "To give an example of antibiotics being used inappropriately", ["To explain how viruses become resistant", "To compare the size of viruses and bacteria", "To show that antibiotics work against viruses"], "Antibiotika wirken nicht gegen Viren, werden aber verschrieben."),
 mc("What can be inferred about why few new antibiotics are developed?", "They are not very profitable for drug companies.", ["They are illegal in many countries.", "Scientists believe enough antibiotics already exist.", "They cannot be tested on patients."], "„little financial incentive … far less profitable“."),
])
append("reading", "academic", A)
print("Reading Batch 2 ergänzt")
