"""Reading Batch 3: Material für Probetest 3 und 4 (3 CtW, 20 Daily, 4 Academic)."""
from contentlib import ctw, MC, append
mc = MC(start=0, seed=305)
S = lambda *a: list(a) if len(a) > 1 else a[0].split("|")

CTW = [
 ("ctw10", 2, "Coral reefs are among the most diverse ecosystems on Earth. Although they cover less than one percent of the ocean floor, they provide a home for about a quarter of all marine species. Corals are actually tiny animals that live together in large colonies and build hard skeletons over many years. They depend on small algae inside their bodies for most of their food. When the water becomes too warm, corals lose these algae and turn white, a process known as bleaching."),
 ("ctw11", 1, "Dogs have an amazing sense of smell. Their noses are much better than ours, so they can find things that people cannot see. For this reason, dogs often work with the police and help to find lost people. Some dogs can even tell when a person is sick. Training these dogs takes a long time, but most of them enjoy the work because it feels like a game."),
 ("ctw12", 3, "Urban planners increasingly recognize that transportation policy shapes public health. Neighborhoods designed primarily around automobiles tend to discourage walking, which contributes to higher rates of obesity and cardiovascular disease among residents. Conversely, districts featuring continuous sidewalks, protected bicycle lanes, and reliable transit encourage routine physical activity without requiring deliberate exercise. Critics caution, however, that such improvements frequently raise property values, potentially displacing the very communities they were intended to benefit."),
]
append("reading", "ctw", [{"id": i, "level": l, "text": ctw(t)} for i, l, t in CTW])

D = []
def daily(id, level, genre, title, text, qs, me=None):
    d = {"id": id, "level": level, "genre": genre, "title": title, "text": text, "questions": qs}
    if me: d["me"] = me
    D.append(d)

# ---------- Level 1 (je 3 Fragen) ----------
daily("d29", 1, "flyer", "Yoga in the park", """# Free Yoga in the Park
Every Saturday in June · 9:00–10:00 a.m.
Meet at the big fountain in Riverside Park.
All levels are welcome. Please bring your own mat and a bottle of water.
If it rains, the class moves to the Community Center on Oak Street.
Questions? Call Nina at 555-0142.""", [
 mc("When does the class take place?", "On Saturday mornings in June", S("Every morning in June|On Saturday evenings all summer|On the first Saturday of each month"), "„Every Saturday in June · 9:00–10:00 a.m.“", "detail"),
 mc("What should people bring?", "A mat and some water", S("A towel and sports shoes|Money for the teacher|An umbrella and a mat"), "„bring your own mat and a bottle of water“.", "detail"),
 mc("What happens if it rains?", "The class is held indoors.", S("The class is canceled.|The class starts an hour later.|The class moves to Sunday."), "Bei Regen im Community Center.", "detail"),
])
daily("d30", 1, "chat", "Birthday gift", """Emma: Hi Ben! Tom's birthday is on Friday. Do you have a gift yet?
Ben: Not yet. Any ideas?
Emma: He loves cooking. Maybe a cookbook?
Ben: Good idea. We could buy it together.
Emma: Sure! The bookstore on King Street has a sale this week.
Ben: Great. Let's go tomorrow after class. I finish at 3.
Emma: Perfect. See you at the front gate.""", [
 mc("What are Emma and Ben planning to do?", "Buy a present for a friend", S("Cook dinner for Tom's birthday|Sell their old books at a store|Study together after class"), "Sie wollen gemeinsam ein Geschenk für Tom kaufen.", "main"),
 mc("Why does Emma suggest a cookbook?", "Tom enjoys cooking.", S("Tom asked for one.|Cookbooks are on sale.|Ben has one already."), "„He loves cooking.“", "detail"),
 mc("Where will Emma and Ben meet tomorrow?", "At the front gate", S("At the bookstore|In their classroom|On King Street"), "„See you at the front gate.“", "detail"),
], me="Ben")
daily("d31", 1, "menu", "Pizza lunch", """# Tony's Pizza – Lunch Menu
Item | Small | Large
Cheese pizza | $7 | $11
Vegetable pizza | $8 | $12
Chicken pizza | $9 | $13
Lunch deal (11 a.m.–2 p.m.): any small pizza + a drink for $9.
Free delivery for orders over $20.""", [
 mc("How much is a large vegetable pizza?", "$12", S("$8|$11|$13"), "Zeile Vegetable pizza, Spalte Large.", "detail"),
 mc("What is included in the lunch deal?", "A small pizza and a drink", S("A large pizza and a drink|Two small pizzas|A small pizza and free delivery"), "„any small pizza + a drink for $9“.", "detail"),
 mc("Which order would be delivered for free?", "Two large chicken pizzas", S("One large cheese pizza|Two small cheese pizzas|One lunch deal"), "Nur 2 × $13 = $26 liegt über $20.", "infer"),
])
daily("d32", 1, "notice", "Elevator repair", """# Notice: Elevator Repair
The elevator in Baker Hall will be out of service on Tuesday, May 6, from 8 a.m. to 4 p.m.
Please use the stairs on that day.
If you need help carrying heavy things, ask at the front desk. Staff will be happy to help you.
Thank you for your patience.""", [
 mc("What is the notice about?", "An elevator that cannot be used for a day", S("A new elevator that opens in May|Stairs that are closed for repair work|A front desk that is moving upstairs"), "Der Aufzug ist am 6. Mai außer Betrieb.", "main"),
 mc("How long will the elevator be out of service?", "Eight hours", S("Four hours|Two days|One week"), "Von 8 bis 16 Uhr.", "detail"),
 mc("What can people do at the front desk?", "Ask for help with heavy things", S("Get a key for the elevator|Report a broken stair|Leave their bags for the day"), "„If you need help carrying heavy things, ask at the front desk.“", "detail"),
])
daily("d33", 1, "email", "Dentist appointment", """From: Bright Smile Dental
To: Alex Moreno
Subject: Your appointment
Dear Alex,
This is a reminder of your appointment with Dr. Lee on Monday, April 14, at 10:30 a.m.
Please arrive ten minutes early to fill out a form. If you cannot come, call us at least one day before. Our office is on the second floor, above the pharmacy.
See you soon!""", [
 mc("Why was this email sent?", "To remind Alex of an appointment", S("To cancel a visit to the dentist|To ask Alex to pay a bill|To tell Alex about a new office"), "„This is a reminder of your appointment“.", "main"),
 mc("When should Alex arrive?", "At 10:20 a.m.", S("At 10:00 a.m.|At 10:30 a.m.|At 10:40 a.m."), "Zehn Minuten vor 10:30 Uhr.", "detail"),
 mc("Where is the dentist's office?", "Over a pharmacy", S("Next to a pharmacy|Inside a hospital|On the first floor"), "„on the second floor, above the pharmacy“.", "detail"),
])
daily("d34", 1, "ad", "Bike for sale", """# For Sale: Mountain Bike – $120
Blue mountain bike, three years old, in good condition. New tires and brakes last month.
I am selling it because I am moving to another city.
A helmet and a lock are included in the price.
You can see the bike any evening after 6 p.m. Text Carla: 555-0199""", [
 mc("Why is Carla selling the bike?", "She is moving away.", S("She bought a new one.|It needs new brakes.|She needs the money."), "„because I am moving to another city“.", "detail"),
 mc("What does the buyer get together with the bike?", "A helmet and a lock", S("A lock and new lights|A helmet and a pump|Two extra tires"), "„A helmet and a lock are included“.", "detail"),
 mc("What is NOT true about the bike?", "It is one year old.", S("It is blue.|It has new tires.|It costs $120."), "Das Rad ist drei Jahre alt.", "neg"),
])
daily("d35", 1, "schedule", "City pool", """# City Pool – Opening Hours
Day | Hours | Notes
Monday–Friday | 6 a.m.–9 p.m. | Lanes for fast swimmers until 8 a.m.
Saturday | 8 a.m.–8 p.m. | Children's lessons 9–11 a.m.
Sunday | 10 a.m.–6 p.m. | Family day
Tickets: adults $5, students $3. Children under 6 swim free.""", [
 mc("When does the pool open on Saturdays?", "At 8 a.m.", S("At 6 a.m.|At 9 a.m.|At 10 a.m."), "Zeile Saturday.", "detail"),
 mc("How much does a student pay?", "$3", S("$5|$6|Nothing"), "„students $3“.", "detail"),
 mc("When are the children's lessons?", "On Saturday mornings", S("On Sunday mornings|On weekday mornings|On Saturday afternoons"), "Saturday, 9–11 a.m.", "detail"),
])

# ---------- Level 2 ----------
daily("d36", 2, "email", "Internship interview", """From: Rachel Kim, Human Resources
To: Daniel Ortega
Subject: Interview for summer internship
Dear Mr. Ortega,
Thank you for applying for the marketing internship at Northline Media. We would like to invite you to an interview on Thursday, March 12, at 2:00 p.m. The interview will be held online and will last about 30 minutes; a link will be sent the day before.
Please prepare a short presentation (no more than five minutes) about a social media campaign you admire. If the time does not suit you, reply by Monday so that we can arrange an alternative.
Best regards,
Rachel Kim""", [
 mc("What is the purpose of the email?", "To invite an applicant to an interview", S("To offer an applicant a summer job|To ask an applicant for more documents|To confirm that an application has arrived"), "„We would like to invite you to an interview“.", "main"),
 mc("What is Daniel asked to prepare?", "A brief talk about a campaign he likes", S("A list of his social media accounts|A five-page report on Northline Media|A link for the online interview"), "Kurze Präsentation über eine Kampagne, die er bewundert.", "detail"),
 mc("What should Daniel do if he is not available on Thursday?", "Answer the email by Monday", S("Call the office on Thursday morning|Wait for a link on Wednesday|Send his presentation in writing"), "„reply by Monday so that we can arrange an alternative“.", "detail"),
])
daily("d37", 2, "webpage", "Bike sharing", """# CityCycle – How It Works
1. Download the app and create an account.
2. Scan the code on any bike to unlock it.
3. Ride! The first 30 minutes of every trip are free for members.
4. Return the bike to any CityCycle station and wait for the green light.
After 30 minutes, trips cost $1 for each additional 15 minutes. Bikes left outside a station are subject to a $25 fee. Monthly membership: $12; students: $8.""", [
 mc("How much would a member pay for a 45-minute trip?", "$1", S("$2|$3|Nothing"), "30 Minuten frei, weitere 15 Minuten kosten $1.", "detail"),
 mc("What happens if a rider leaves a bike outside a station?", "The rider has to pay $25.", S("The membership is canceled.|The bike locks after 30 minutes.|The rider pays $1 every 15 minutes."), "„subject to a $25 fee“.", "detail"),
 mc("What can be inferred about the green light?", "It shows that the bike has been returned correctly.", S("It shows that the bike needs to be repaired.|It shows that the free 30 minutes are over.|It shows that the station has no space left."), "Man soll nach dem Abstellen auf das grüne Licht warten.", "infer"),
])
daily("d38", 2, "chat", "Apartment viewing", """Mia: I just saw the apartment on Cedar Street. It's bright, and it's only ten minutes from campus.
Jonas: Sounds great. What's the catch?
Mia: The rent is $150 more than we planned, and there's no washing machine.
Jonas: Hmm. Is there a laundromat nearby?
Mia: Right across the street. The landlord needs an answer by Friday.
Jonas: Let's look at the one on Hill Road tomorrow first, then decide.""", [
 mc("What does Jonas mean when he asks, \"What's the catch?\"", "He wants to know the disadvantages.", S("He wants to know who the landlord is.|He wants to know when they can move in.|He wants to know how Mia found the place."), "the catch = der Haken.", "vocab"),
 mc("What will Mia and Jonas probably do before Friday?", "Visit another apartment", S("Buy a washing machine|Ask the landlord for a lower rent|Sign the contract for Cedar Street"), "Erst die Wohnung in der Hill Road ansehen, dann entscheiden.", "next"),
], me="Jonas")
daily("d39", 2, "instructions", "Printing", """# How to Print from Your Laptop
1. Connect to the campus Wi-Fi network.
2. Go to print.westfield.edu and log in with your student account.
3. Upload your file and choose black-and-white or color.
4. Walk to any library printer and tap your student card to release the job.
Jobs that are not released within 12 hours are deleted automatically. Printing costs 5 cents per page (color: 20 cents) and is charged to your card only when the job is released.""", [
 mc("What must students do at the printer?", "Tap their student card", S("Log in to the website again|Choose between color and black-and-white|Connect their laptop with a cable"), "„tap your student card to release the job“.", "detail"),
 mc("What can be inferred about a job that is uploaded but never released?", "The student does not pay for it.", S("The student is charged after 12 hours.|It is printed in black-and-white.|It stays in the system until the end of term."), "Abgerechnet wird erst bei der Freigabe; nach 12 Stunden wird gelöscht.", "infer"),
])
daily("d40", 2, "post", "Campus radio", """# Campus Radio 91.3 is looking for hosts!
Do you love music, sports, or talking about campus life? We have three open slots for weekly one-hour shows next semester. No experience is necessary – we offer training in the first two weeks of the term.
To apply, send us a two-minute audio sample and a short description of your show idea by December 5. Shows that feature local artists will be given priority.""", [
 mc("What do applicants have to send?", "A short recording and a description of their idea", S("A list of their favorite local artists|Proof of earlier experience in radio|A one-hour sample of a complete show"), "„a two-minute audio sample and a short description of your show idea“.", "detail"),
 mc("Which applicant would most likely be chosen?", "Someone who plans to play music by bands from the area", S("Someone who has hosted a show at another station|Someone who wants to report on national sports|Someone who can start before the semester begins"), "„Shows that feature local artists will be given priority.“", "infer"),
])
daily("d41", 2, "notice", "Parking changes", """# Parking Changes – Lot C
Beginning October 1, Lot C will be reserved for vehicles with a commuter permit on weekdays between 7 a.m. and 5 p.m. Outside these hours, the lot remains open to all permit holders.
Visitors should use the parking garage on College Avenue, where the first hour is free. Vehicles parked without the correct permit will be ticketed.""", [
 mc("Who may park in Lot C on a Tuesday at 10 a.m.?", "Drivers with a commuter permit", S("Anyone with a campus permit|Visitors staying under an hour|Nobody, because the lot is closed"), "Werktags 7–17 Uhr nur mit commuter permit.", "detail"),
 mc("What is true about the parking garage?", "The first hour costs nothing.", S("It is reserved for commuters.|It closes at 5 p.m. on weekdays.|It requires a visitor permit."), "„where the first hour is free“.", "detail"),
])

# ---------- Level 3 (je 2 Fragen) ----------
daily("d42", 3, "email", "Conference abstract", """From: Program Committee, Regional Linguistics Conference
To: Hannah Fischer
Subject: Decision on your abstract
Dear Ms. Fischer,
We are pleased to inform you that your abstract has been accepted for a poster presentation rather than the oral presentation you requested. The number of submissions far exceeded the available speaking slots, and the committee felt your data would lend itself particularly well to a visual format.
Please confirm your participation by May 2. Presenters who have not registered by that date will be removed from the program.""", [
 mc("Why was the abstract not accepted as an oral presentation?", "There were more submissions than speaking slots.", S("The committee found the data unconvincing.|The abstract arrived after the deadline.|Ms. Fischer had not registered in time."), "„The number of submissions far exceeded the available speaking slots“.", "detail"),
 mc("The phrase \"lend itself particularly well to\" is closest in meaning to", "be especially suitable for", S("be easily confused with|be borrowed from|be less important than"), "lend itself to = sich eignen für.", "vocab"),
])
daily("d43", 3, "review", "Laptop review", """# Review: AeroBook 14 ★★★☆☆
I wanted to love this laptop. It weighs next to nothing, and the screen is gorgeous. The battery, however, is another story: the advertised twelve hours turned out to be closer to six with ordinary use. The keyboard also takes some getting used to, since the keys barely move. For the price, I expected fewer compromises. If you mostly work near a power outlet, it may still be worth considering.""", [
 mc("What is the reviewer's overall opinion of the laptop?", "It is disappointing despite some strengths.", S("It is the best laptop available at this price.|It is too heavy to carry around every day.|It is poorly designed in every respect."), "Lob für Gewicht und Bildschirm, aber Akku und Tastatur enttäuschen.", "attitude"),
 mc("For whom might the laptop still be suitable, according to the reviewer?", "People who rarely depend on the battery", S("People who type for many hours a day|People who travel on long flights|People who want the lowest price"), "„If you mostly work near a power outlet“.", "infer"),
])
daily("d44", 3, "webpage", "AI tools policy", """# Use of AI Tools in Coursework
Unless an instructor states otherwise, students may use AI tools to brainstorm ideas and to check grammar. Submitting text generated by such tools as one's own work, however, constitutes academic misconduct.
Whenever an AI tool has been used, students must disclose this in a brief note at the end of the assignment. Failure to do so will be treated in the same way as plagiarism, regardless of how the tool was used.""", [
 mc("According to the policy, what are students generally allowed to do?", "Use AI tools to come up with ideas", S("Submit AI-generated text if they add a note|Use AI tools only when an instructor asks them to|Leave out the note for small assignments"), "„may use AI tools to brainstorm ideas and to check grammar“.", "detail"),
 mc("What can be inferred about a student who uses an AI tool only to check grammar but does not mention it?", "The student could be penalized as if for plagiarism.", S("The student has followed the policy correctly.|The student must rewrite the assignment by hand.|The student will only receive a warning."), "Fehlende Angabe gilt wie Plagiat, „regardless of how the tool was used“.", "infer"),
])
daily("d45", 3, "chat", "Proposal feedback", """Lucas: Did you read the professor's comments on our proposal?
Sofia: Just now. She thinks the research question is too broad to be answered in ten pages.
Lucas: She has a point. We're basically trying to cover the entire history of the minimum wage.
Sofia: What if we limited it to one state over the last decade?
Lucas: That would make the data far more manageable. Though we'd have to scrap most of section two.
Sofia: Better now than the night before the deadline.""", [
 mc("How does Lucas react to the professor's criticism?", "He agrees with it.", S("He is offended by it.|He does not understand it.|He decides to ignore it."), "She has a point = Sie hat recht.", "attitude"),
 mc("What does Sofia imply in her last message?", "Major changes are easier to make early than at the last minute.", S("The deadline should be moved to a later date.|Section two is the strongest part of the proposal.|They should have limited the topic a decade ago."), "„Better now than the night before the deadline.“", "infer"),
], me="Sofia")
daily("d46", 3, "notice", "Sleep study", """# Participants Needed: Sleep and Memory Study
The Department of Psychology is recruiting volunteers aged 18–30 for a two-session study. Participants will complete memory tasks in the evening and again the following morning after wearing a sleep-tracking wristband overnight.
Compensation is $40, paid upon completion of both sessions. Individuals who regularly work night shifts or have traveled across more than two time zones in the past month are ineligible.""", [
 mc("Who would NOT be able to take part in the study?", "A 25-year-old who flew from New York to London last week", S("A 19-year-old who has never been in a study before|A 30-year-old who works in an office during the day|A 22-year-old who usually goes to bed after midnight"), "New York–London sind fünf Zeitzonen; mehr als zwei schließen aus.", "neg"),
 mc("When do participants receive the payment?", "After they have finished the second session", S("Before the first evening session begins|As soon as they return the wristband|Half after each of the two sessions"), "„paid upon completion of both sessions“.", "detail"),
])
daily("d47", 3, "email", "Lease renewal", """From: Greenway Property Management
To: Residents of 48 Alder Street
Subject: Lease renewal for next year
Dear residents,
Your current lease expires on July 31. Should you wish to remain in your apartment, please return the attached renewal form no later than May 15. Owing to rising maintenance costs, the monthly rent will increase by 4 percent for leases beginning August 1.
Residents who do not respond by the deadline will be assumed to be moving out, and their apartments will be advertised to new tenants.""", [
 mc("Why is the rent going up?", "Maintenance has become more expensive.", S("The apartments have been renovated.|Demand from new tenants has risen.|The lease period has been extended."), "„Owing to rising maintenance costs“.", "detail"),
 mc("What will happen if a resident does not reply to the email?", "The apartment will be offered to other people.", S("The lease will be renewed automatically.|The rent will rise by more than 4 percent.|The resident will have to move out on May 15."), "Wer nicht antwortet, gilt als ausziehend; die Wohnung wird inseriert.", "infer"),
])
daily("d48", 3, "ad", "Travel grant", """# Dalton Travel Grant – Call for Applications
The Dalton Foundation awards up to ten grants of $2,000 each to undergraduates conducting independent research abroad during the summer. Preference is given to projects that could not be carried out at the applicant's home institution.
Applications must include a two-page proposal, a budget, and a letter of support from a faculty member. Incomplete applications will not be reviewed. Recipients are required to present their findings at the autumn research fair.""", [
 mc("Which project would most likely receive a grant?", "One that needs an archive found only in another country", S("One that continues a professor's study on campus|One that requires more than $2,000 in equipment|One that is planned for the autumn semester"), "Bevorzugt: Projekte, die an der Heimathochschule nicht möglich wären.", "infer"),
 mc("What must grant recipients do afterward?", "Share their results at a university event", S("Return any money they did not spend|Write a letter of support for a new applicant|Submit a second two-page proposal"), "„present their findings at the autumn research fair“.", "detail"),
])
append("reading", "daily", D)

AC = []
def ac(id, level, title, text, qs): AC.append({"id": id, "level": level, "title": title, "text": text, "questions": qs})
ac("ac09", 2, "How Wolves Became Dogs", """Dogs were the first animals to be domesticated, long before sheep, goats, or cattle. Genetic studies indicate that they descend from an extinct population of wolves and that the split occurred at least 15,000 years ago, when humans still lived as hunter-gatherers.
How did a dangerous predator become a companion? One popular hypothesis suggests that wolves largely domesticated themselves. According to this view, the boldest wolves began to scavenge leftover food near human camps. Animals that were less fearful and less aggressive obtained more food and therefore raised more offspring. Over many generations, this process produced tamer animals without any deliberate plan on the part of humans.
A famous experiment supports the idea that selecting for tameness alone can transform a species. Beginning in 1959, Soviet scientists bred only the friendliest foxes from each generation. Within a few decades, the foxes not only sought human contact but had also developed floppy ears, curled tails, and spotted coats, features typical of dogs but rare in wild animals.
Once dogs lived alongside people, both sides benefited. Dogs warned of danger and helped in hunting, while humans provided a reliable source of food.""", [
 mc("According to paragraph 1, what is true about the domestication of dogs?", "It took place before people kept farm animals.", S("It began when humans started to grow crops.|It involved wolves that still exist today.|It happened later than that of goats."), "„long before sheep, goats, or cattle“; Menschen waren noch Jäger und Sammler.", "detail"),
 mc("The word \"deliberate\" in paragraph 2 is closest in meaning to", "intentional", S("successful", "dangerous", "complicated"), "deliberate = absichtlich.", "vocab"),
 mc("Why does the author describe the fox experiment?", "To show that breeding for friendliness alone can change a species", S("To argue that foxes make better companions than wolves do", "To explain why Soviet scientists were interested in dogs", "To suggest that dogs are descended from wild foxes"), "Das Experiment stützt die Selbstdomestikations-Hypothese.", "purpose"),
 mc("What can be inferred about wolves that stayed away from human camps?", "They were unlikely to become the ancestors of dogs.", S("They were hunted by the people in the camps.", "They had more offspring than bolder wolves.", "They soon developed spotted coats as well."), "Nur die zutraulichen Wölfe profitierten vom Futter und vermehrten sich in Menschennähe.", "infer"),
 mc("According to paragraph 4, how did humans benefit from dogs?", "Dogs alerted them to threats and assisted with hunting.", S("Dogs kept their camps free of leftover food.", "Dogs protected their sheep and goats from wolves.", "Dogs carried supplies between distant camps."), "„Dogs warned of danger and helped in hunting“.", "detail"),
])
ac("ac10", 1, "How Emperor Penguins Stay Warm", """Emperor penguins live in Antarctica, the coldest place on Earth. In winter, the temperature can fall to minus forty degrees, and strong winds make it feel even colder. How do these birds survive?
First, their bodies are built for the cold. Under the skin, penguins have a thick layer of fat that keeps heat inside. Their feathers are short and very close together, so wind and water cannot reach the skin.
Second, penguins work as a team. Thousands of birds stand close together in a large group called a huddle. The penguins in the middle are warm, while those on the outside are cold. But the birds do not stay in one place. They slowly move, so every penguin spends some time in the warm center.
Finally, emperor penguins can go without food for a long time. A male penguin eats nothing for about two months while he keeps the egg warm on his feet. During this time, he lives on the fat in his body.""", [
 mc("What is the passage mainly about?", "How emperor penguins survive extreme cold", S("Why emperor penguins live in large groups", "What emperor penguins eat in winter", "How emperor penguins raise their young"), "Drei Gründe, warum die Pinguine die Kälte überstehen.", "main"),
 mc("According to paragraph 2, why can't wind and water reach a penguin's skin?", "Its feathers are short and tightly packed.", S("Its skin is covered with a layer of ice.", "Its fat forms a layer on top of the feathers.", "Its body is always turned away from the wind."), "„short and very close together“.", "detail"),
 mc("The word \"survive\" in paragraph 1 is closest in meaning to", "stay alive", S("find food", "move fast", "keep quiet"), "survive = überleben.", "vocab"),
 mc("Why do the penguins in a huddle keep moving?", "So that each bird gets a turn in the warm middle", S("So that they can look for food together", "So that the eggs do not touch the ice", "So that the wind cannot blow them over"), "„every penguin spends some time in the warm center“.", "detail"),
 mc("What does a male penguin do for about two months?", "He keeps the egg warm without eating.", S("He searches for food far out at sea.", "He stands on the outside of the huddle.", "He builds a nest out of small stones."), "Er frisst zwei Monate nichts und wärmt das Ei auf den Füßen.", "detail"),
])
ac("ac11", 1, "Why Onions Make Us Cry", """Almost everyone has cried while cutting an onion. But why does this happen? The answer is chemistry.
Onions grow under the ground, where small animals might eat them. To protect itself, the onion takes in a substance called sulfur from the soil and stores it in its cells. When a knife cuts through the onion, the cells break open. The chemicals inside mix together and form a gas. This gas rises into the air and reaches our eyes. There, it mixes with the water in our eyes and makes a weak acid. The acid burns a little, so our eyes produce tears to wash it away.
Luckily, there are simple ways to reduce the tears. A cold onion releases less gas, so you can put the onion in the refrigerator before cutting it. A sharp knife also helps because it breaks fewer cells. Some cooks even cut onions under running water.""", [
 mc("According to the passage, why do onions store sulfur?", "To protect themselves from animals", S("To grow faster under the ground", "To keep water inside their cells", "To make their taste sweeter"), "„To protect itself, the onion takes in … sulfur“.", "detail"),
 mc("What happens when an onion is cut?", "Its cells break, and a gas forms.", S("Its cells take in water from the air.", "Its sulfur turns into a weak acid.", "Its smell disappears after a while."), "Zellen platzen, die Stoffe mischen sich zu einem Gas.", "detail"),
 mc("The word \"reduce\" in paragraph 3 is closest in meaning to", "lessen", S("explain", "collect", "notice"), "reduce = verringern.", "vocab"),
 mc("Why does the author mention the refrigerator?", "To give an example of how to cry less", S("To explain where onions should be stored", "To show that onions go bad quickly", "To describe how the gas is produced"), "Kalte Zwiebeln geben weniger Gas ab.", "purpose"),
 mc("What can be inferred about cutting a warm onion with a dull knife?", "It would cause more tears than usual.", S("It would make the onion taste bitter.", "It would stop the gas from forming.", "It would take less time than usual."), "Warm = mehr Gas, stumpfes Messer = mehr zerstörte Zellen.", "infer"),
])
ac("ac12", 3, "The Rebound Effect", """When a technology uses a resource more efficiently, it seems self-evident that total consumption of that resource should fall. In 1865, however, the English economist William Stanley Jevons observed precisely the opposite. Improvements to the steam engine had made the use of coal far more economical, yet Britain's coal consumption soared.
Jevons's explanation was simple. Greater efficiency lowered the effective cost of steam power, which made it profitable in industries where it had previously been too expensive. The resulting expansion in demand more than offset the savings achieved by each individual engine.
Economists now refer to this phenomenon as the rebound effect, and contemporary examples are not hard to find. As car engines have become more fuel-efficient, many drivers have responded by purchasing larger vehicles or traveling greater distances. Similarly, the advent of inexpensive LED lighting has encouraged people to illuminate spaces that were formerly left dark.
The rebound is seldom large enough to cancel out the gains entirely; most studies suggest that it erodes somewhere between ten and thirty percent of the expected savings. Nevertheless, it implies that efficiency standards alone are unlikely to deliver the reductions that policymakers anticipate. For this reason, some economists argue that such standards should be accompanied by measures, such as taxes, that keep the cost of consumption from falling.""", [
 mc("According to paragraph 1, what did Jevons observe?", "Coal use rose although engines had become more efficient.", S("Steam engines wasted more coal than earlier machines.", "Britain began to run out of coal in the 1860s.", "Efficient engines were too costly for most industries."), "Effizientere Dampfmaschinen, aber stark steigender Kohleverbrauch.", "detail"),
 mc("The word \"erodes\" in paragraph 4 is closest in meaning to", "gradually reduces", S("accurately measures", "temporarily hides", "greatly exceeds"), "erode = nach und nach abtragen/verringern.", "vocab"),
 mc("Why does the author mention LED lighting?", "To give a modern example of efficiency leading to greater use", S("To show that some technologies have no rebound effect", "To explain why electricity has become more expensive", "To argue that older lamps were better for the environment"), "Billiges Licht → mehr Flächen werden beleuchtet.", "purpose"),
 mc("What can be inferred from paragraph 4 about efficiency standards?", "They save resources, but less than predicted.", S("They usually increase total consumption.", "They work only when no taxes are charged.", "They have been abandoned by most governments."), "Der Rebound frisst 10–30 % der Einsparung, nicht alles.", "infer"),
 mc("According to the passage, why do some economists propose taxes?", "To prevent cheaper use from driving up consumption", S("To pay for research into more efficient engines", "To punish companies that ignore the standards", "To make efficient technology affordable for everyone"), "Steuern sollen verhindern, dass die Nutzungskosten sinken.", "detail"),
])
append("reading", "academic", AC)
print("daily", len(D), "academic", len(AC), [len(a["text"].split()) for a in AC])
