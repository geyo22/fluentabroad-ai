import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FluentAbroad AI database...');

  // 1. Default User Profile
  const user = await prisma.userProfile.upsert({
    where: { id: 'default-user' },
    update: {},
    create: {
      id: 'default-user',
      name: 'Rian Pratama',
      targetLevel: 'B2',
      currentLevel: 'B1',
      targetDate: new Date('2027-01-01T00:00:00.000Z'),
      dailyGoalMinutes: 90,
      explanationLanguage: 'id',
      isOnboarded: true,
      preferences: {
        create: {
          listeningMinutes: 20,
          shadowingMinutes: 25,
          speakingMinutes: 30,
          vocabMinutes: 15,
          aiDifficulty: 'adaptive',
          aiResponseLength: 'medium',
          voiceSpeed: 1.0,
          voicePitch: 1.0,
          theme: 'system'
        }
      }
    }
  });
  console.log(`User profile ready: ${user.name}`);

  // 2. Curriculum Weeks and Lessons (7 Weeks)
  const curriculumData = [
    {
      weekNumber: 1,
      title: 'Basic Survival English',
      theme: 'Pondasi Komunikasi & Memperkenalkan Diri',
      description: 'Membangun kepercayaan diri untuk memperkenalkan diri, meminta bantuan, dan mengklarifikasi ketika belum paham.',
      lessons: [
        {
          dayNumber: 1,
          title: 'Introducing Yourself Naturally',
          objectives: JSON.stringify([
            'State your name, major, and hometown confidently',
            'Explain why you are going abroad in simple terms',
            'Handle introductory greetings without awkward silence'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "I'm originally from [City], but currently studying [Major] at [University].", meaning: "Menyatakan asal dan latar belakang studi secara natural", example: "I'm originally from Jakarta, but currently studying Computer Science at Universitas Indonesia." },
            { pattern: "Nice to meet you! I'm here for [Reason/Program].", meaning: "Menyapa dan menjelaskan tujuan kehadiran", example: "Nice to meet you! I'm here for the student exchange program." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "exchange student", translation: "mahasiswa pertukaran", context: "I will be an exchange student starting next semester." },
            { phrase: "get settled in", translation: "beradaptasi / beres-beres tempat baru", context: "I just arrived yesterday and I'm trying to get settled in." },
            { phrase: "pursue a degree", translation: "menempuh gelar", context: "I am going abroad to pursue my master's degree." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Introduce yourself in 3 sentences: your name, where you are from in Indonesia, and your field of study.",
            "Say one thing you are excited to experience when living abroad."
          ]),
          dialogueScript: "A: Hi there! Are you new here?\nB: Yes, I am! I just arrived from Indonesia. My name is Rian.\nA: Welcome! What are you studying?\nB: I'm majoring in Information Systems. Great to meet you!"
        },
        {
          dayNumber: 2,
          title: 'Asking Basic Questions Politely',
          objectives: JSON.stringify([
            'Use indirect polite questions instead of blunt commands',
            'Ask for locations, operating hours, and basic information'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Could you tell me where [Place/Item] is?", meaning: "Bisa beri tahu di mana letak...", example: "Could you tell me where the international student office is?" },
            { pattern: "Do you happen to know if [Question]?", meaning: "Apakah Anda kebetulan tahu jika...", example: "Do you happen to know if the library is open on weekends?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "around the corner", translation: "di dekat kelokan / sangat dekat", context: "The restroom is just around the corner." },
            { phrase: "operating hours", translation: "jam operasional", context: "What are the operating hours for the campus cafeteria?" }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Ask a stranger politely where the nearest subway entrance is.",
            "Ask a receptionist if Wi-Fi is available in this hall."
          ]),
          dialogueScript: "A: Excuse me, could you tell me where the nearest pharmacy is?\nB: Sure! Walk two blocks straight, and it's right next to the bakery.\nA: Thank you so much!"
        },
        {
          dayNumber: 3,
          title: 'Clarifying & Asking for Repetition',
          objectives: JSON.stringify([
            'Overcome embarrassment when not understanding native speech',
            'Use natural clarification phrases instead of just saying "What?"'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Sorry, would you mind repeating that a bit slower?", meaning: "Maaf, boleh tolong ulangi sedikit lebih pelan?", example: "Sorry, would you mind repeating that a bit slower? My English is still developing." },
            { pattern: "Did you mean [Summary of what you caught]?", meaning: "Apakah maksud Anda...", example: "Did you mean I should take bus number 4?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "catch that", translation: "menangkap / mendengar dengan jelas", context: "Sorry, I didn't quite catch that." },
            { phrase: "spell that out", translation: "mengeja huruf per huruf", context: "Could you spell that out for me, please?" }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Practice saying: 'Sorry, I didn't quite catch that. Could you say it again please?' with calm intonation."
          ]),
          dialogueScript: "A: The dorm check-in is on floor 3, wing B, between ten and two.\nB: Sorry, I didn't catch the room wing. Did you say wing B?\nA: Yes, wing B, room 304."
        },
        {
          dayNumber: 4,
          title: 'Requesting Help & Emergency Inquiries',
          objectives: JSON.stringify([
            'Explain an urgent situation clearly',
            'Ask for assistance with directions or technical trouble'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "I'm having a bit of trouble with [Problem]. Could you assist me?", meaning: "Saya mengalami sedikit kendala dengan...", example: "I'm having a bit of trouble with the ticket machine. Could you assist me?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "out of order", translation: "rusak / tidak berfungsi", context: "The card reader seems to be out of order." },
            { phrase: "assistance", translation: "bantuan", context: "I need some assistance finding my gate." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Ask a train station staff for help because your payment card was declined."
          ]),
          dialogueScript: "A: Excuse me, officer. I seem to have lost my boarding pass.\nB: Don't worry. May I have your passport and flight number?\nA: Here is my passport. Flight GA-871."
        },
        {
          dayNumber: 5,
          title: 'Simple Small Talk & Closing Conversations',
          objectives: JSON.stringify([
            'Conclude interactions warmly and naturally',
            'Express gratitude effectively'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "It was really nice chatting with you! Have a great day.", meaning: "Senang mengobrol dengan Anda! Semoga harimu menyenangkan.", example: "It was really nice chatting with you! Good luck with your exams." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "take care", translation: "hati-hati / jaga diri", context: "Safe travels and take care!" },
            { phrase: "appreciate it", translation: "sangat berterima kasih", context: "Thanks for your help, I really appreciate it." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Thank someone for giving you directions and wish them a great afternoon."
          ]),
          dialogueScript: "A: The museum is just past the fountain.\nB: Wonderful! Thank you so much for your time, I really appreciate it. Have a great day!"
        }
      ]
    },
    {
      weekNumber: 2,
      title: 'Airport and Transportation',
      theme: 'Navigasi Bandara, Imigrasi & Transportasi Umum',
      description: 'Latihan skenario penting saat mendarat, wawancara imigrasi, klaim bagasi, dan naik kereta/bus.',
      lessons: [
        {
          dayNumber: 1,
          title: 'Airport Check-in & Baggage Drop',
          objectives: JSON.stringify([
            'Confirm flight details and ask for seat preferences',
            'Handle questions about luggage weight and contents'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Is it possible to get a [window/aisle] seat?", meaning: "Apakah memungkinkan dapat kursi dekat jendela/lorong?", example: "Is it possible to get an aisle seat, please?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "carry-on bag", translation: "tas kabin", context: "You are allowed one carry-on bag and one personal item." },
            { phrase: "checked luggage", translation: "bagasi tercatat", context: "My checked luggage weighs 22 kilograms." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Tell the airline agent you have one checked suitcase and ask for an aisle seat."
          ]),
          dialogueScript: "Agent: Hello, where are you flying today?\nPassenger: Hi! I'm flying to Melbourne. Here's my passport.\nAgent: Do you have any luggage to check in?\nPassenger: Just this one suitcase, and I have this backpack as carry-on."
        },
        {
          dayNumber: 2,
          title: 'Conquering the Immigration Officer',
          objectives: JSON.stringify([
            'Answer questions about purpose of visit, length of stay, and accommodation',
            'Provide direct, calm, and accurate responses'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "I am here to [Purpose] for [Duration].", meaning: "Saya di sini untuk... selama...", example: "I am here to attend a student exchange program for 6 months." },
            { pattern: "I will be staying at [Accommodation/Address].", meaning: "Saya akan tinggal di...", example: "I will be staying at the university dorms on Campus Way." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "purpose of your visit", translation: "tujuan kunjungan Anda", context: "What is the primary purpose of your visit?" },
            { phrase: "letter of acceptance", translation: "surat penerimaan universitas", context: "Here is my university letter of acceptance and student visa." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Answer the officer's question: 'What is the purpose of your visit and how long will you stay?'"
          ]),
          dialogueScript: "Officer: Passport and landing card, please.\nStudent: Good morning, here you go.\nOfficer: What brings you to Sydney?\nStudent: I am attending an academic exchange at UNSW for one semester."
        },
        {
          dayNumber: 3,
          title: 'Baggage Claim & Lost Luggage Inquiries',
          objectives: JSON.stringify([
            'Describe luggage appearance (color, brand, tags)',
            'File a lost luggage inquiry calmly'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "My luggage hasn't appeared on carousel [Number].", meaning: "Koper saya belum muncul di conveyor nomor...", example: "My luggage hasn't appeared on carousel 4." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "baggage claim carousel", translation: "ban berjalan pengambilan koper", context: "Check screen 3 to see your baggage claim carousel." },
            { phrase: "file a claim", translation: "mengajukan laporan klaim", context: "I'd like to file a lost baggage claim, please." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Describe a black medium hard-case suitcase with an orange ribbon tag."
          ]),
          dialogueScript: "Passenger: Excuse me, our flight GA-872 landed an hour ago, but my suitcase never came out.\nStaff: Let me look up your baggage tag number. Can you describe the bag?"
        },
        {
          dayNumber: 4,
          title: 'Purchasing Train and Subway Tickets',
          objectives: JSON.stringify([
            'Ask for single vs round-trip tickets',
            'Inquire about reloadable transit cards (Opal/Oyster/Suica)'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "I'd like a [one-way/round-trip] ticket to [Destination], please.", meaning: "Saya mau tiket sekali jalan / pulang pergi ke...", example: "I'd like a one-way ticket to Central Station, please." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "top up", translation: "isi saldo kartu transportasi", context: "Where can I top up my transit card?" },
            { phrase: "transfer / change trains", translation: "pindah jalur / transit kereta", context: "Do I need to transfer at the next station?" }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Ask the ticket booth clerk which train line goes directly to the university campus."
          ]),
          dialogueScript: "Clerk: Next in line, please!\nStudent: Hi, I'd like to buy a transit pass for one week. Does this cover both trains and buses?\nClerk: Yes, unlimited rides on all city zones."
        },
        {
          dayNumber: 5,
          title: 'Taking Taxis and Ride-Shares',
          objectives: JSON.stringify([
            'Communicate destination clearly to a driver',
            'Ask about estimated fare and arrival time'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Could you drop me off near [Landmark/Corner]?", meaning: "Bisa turunkan saya dekat...", example: "Could you drop me off near the main campus library?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "drop-off point", translation: "titik penurunan penumpang", context: "The app marked the hotel entrance as the drop-off point." },
            { phrase: "keep the change", translation: "kembaliannya ambil saja (tip)", context: "Here is twenty dollars, please keep the change." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Tell the driver you are in a slight rush to catch a train, but safety comes first."
          ]),
          dialogueScript: "Driver: Where to, buddy?\nPassenger: Hi! To 142 Elmwood Street, please. How long do you think it'll take in this traffic?\nDriver: About 15 minutes if highway 9 is clear."
        }
      ]
    },
    {
      weekNumber: 3,
      title: 'Everyday Conversation',
      theme: 'Kehidupan Sehari-hari, Pesan Makan & Belanja',
      description: 'Percakapan natural di kafe, restoran, supermarket, dan membangun interaksi sosial.',
      lessons: [
        {
          dayNumber: 1,
          title: 'Ordering Coffee and Food Confidently',
          objectives: JSON.stringify([
            'Order meals and customize drinks without hesitation',
            'Ask about ingredients and allergies'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Can I get a [Food/Drink], [for here / to go]?", meaning: "Bisa saya pesan... makan di sini / bawa pulang?", example: "Can I get an iced oat latte to go, please?" },
            { pattern: "Does this dish contain [Ingredient/Nut/Dairy]?", meaning: "Apakah hidangan ini mengandung...", example: "Does this soup contain any peanut or shellfish?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "for here or to go", translation: "makan di tempat atau bawa pulang", context: "Is that for here or to go today?" },
            { phrase: "dietary restrictions", translation: "pantangan makanan", context: "Do you have any dietary restrictions?" }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Order a hot sandwich and an orange juice, and request no mayonnaise."
          ]),
          dialogueScript: "Barista: Morning! What can I get started for you?\nCustomer: Can I please get an iced americano and an almond croissant?\nBarista: Sure thing! For here or takeaway?\nCustomer: Takeaway, thank you."
        },
        {
          dayNumber: 2,
          title: 'Grocery Shopping & Asking Store Clerks',
          objectives: JSON.stringify([
            'Ask for items in grocery stores and retail shops',
            'Inquire about discounts and self-checkout'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Excuse me, which aisle can I find [Item]?", meaning: "Permisi, di lorong mana saya bisa temukan...", example: "Excuse me, which aisle can I find cooking oil and spices?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "aisle", translation: "lorong toko / supermarket", context: "Dairy products are in aisle 4." },
            { phrase: "self-checkout", translation: "kasir mandiri", context: "You can scan your items at the self-checkout counter." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Ask a store clerk if they have fresh eggs in stock."
          ]),
          dialogueScript: "Shopper: Excuse me, do you have any brown rice left?\nClerk: Let me check the shelf. Looks like we're restocked right here in aisle 2.\nShopper: Thanks a lot!"
        },
        {
          dayNumber: 3,
          title: 'Making Friends & Casual Campus Chat',
          objectives: JSON.stringify([
            'Initiate friendly small talk with international peers',
            'Ask about hobbies, study habits, and weekend plans'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "How are you finding the classes so far?", meaning: "Bagaimana kesanmu terhadap kuliah sejauh ini?", example: "How are you finding the lectures so far? Quite fast-paced, right?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "hang out", translation: "nongkrong bersama", context: "We usually hang out at the student lounge after class." },
            { phrase: "hit the books", translation: "belajar giat", context: "I need to hit the books before the midterm test." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Ask a classmate what they usually do on weekends in this city."
          ]),
          dialogueScript: "A: Mind if I sit here?\nB: Not at all! Go ahead.\nA: Thanks! I'm Rian by the way. Are you taking Professor Miller's course too?\nB: Yes! The assignment is tough, isn't it?"
        },
        {
          dayNumber: 4,
          title: 'Asking for Recommendations',
          objectives: JSON.stringify([
            'Ask locals for recommendations on food, sights, and hidden gems',
            'React enthusiastically to suggestions'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Do you have any recommendations for good [Food/Place] around here?", meaning: "Punya rekomendasi... enak di sekitar sini?", example: "Do you have any recommendations for authentic local food around here?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "hidden gem", translation: "tempat bagus yang belum banyak diketahui orang", context: "This small cafe in the alley is a real hidden gem." },
            { phrase: "worth a visit", translation: "layak dikunjungi", context: "The botanical garden is definitely worth a visit on sunny days." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Ask a friend what affordable lunch spot they recommend near campus."
          ]),
          dialogueScript: "A: What's your favorite spot for cheap lunch nearby?\nB: Check out the noodle house on Green Street. Enormous portions for eight dollars.\nA: Sounds fantastic, I'll definitely check it out!"
        },
        {
          dayNumber: 5,
          title: 'Splitting the Bill & Payment Etiquette',
          objectives: JSON.stringify([
            'Manage dining bills, separate checks, and tipping norms'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Can we split the bill, or do you prefer one payment?", meaning: "Bisa kita pisah tagihannya?", example: "Can we split the check evenly between three cards?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "split the bill / go Dutch", translation: "bayar masing-masing / bagi rata", context: "Let's split the bill evenly." },
            { phrase: "tap to pay / contactless", translation: "pembayaran nirsentuh tap kartu", context: "You can just tap your card on the terminal." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Tell the server that you and your friend would like separate bills."
          ]),
          dialogueScript: "Server: Here is your total, whenever you're ready.\nCustomer: Thank you! Could we pay separately for the two orders?\nServer: Absolutely. I can ring up each item individually."
        }
      ]
    },
    {
      weekNumber: 4,
      title: 'Explaining and Asking Questions',
      theme: 'Menjelaskan Pengalaman, Pendapat & Proyek Kuliah',
      description: 'Kemampuan inti mahasiswa: menjelaskan ide, latar belakang riset, dan berdiskusi secara mendalam.',
      lessons: [
        {
          dayNumber: 1,
          title: 'Describing Your Background & Past Experiences',
          objectives: JSON.stringify([
            'Use past tense and transition words naturally',
            'Share interesting anecdotes from Indonesia'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Back in Indonesia, I used to [Activity/Project] where I [Learned/Built].", meaning: "Dulu di Indonesia, saya biasanya... di mana saya...", example: "Back in Indonesia, I worked on a web project where I helped local small businesses go digital." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "hands-on experience", translation: "pengalaman praktik langsung", context: "This internship provided great hands-on experience in cloud architecture." },
            { phrase: "broaden my horizons", translation: "memperluas wawasan", context: "Studying abroad will really broaden my academic horizons." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Explain one meaningful project you completed in university or during an internship."
          ]),
          dialogueScript: "Peer: What kind of projects did you work on back home?\nStudent: Last year, my team developed an automated water monitoring system for rural farmers. It was challenging but very rewarding."
        },
        {
          dayNumber: 2,
          title: 'Explaining Your University Major & Research',
          objectives: JSON.stringify([
            'Explain technical concepts in accessible English',
            'Articulate your academic goals clearly'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "My focus is mainly on [Field], specifically how we can [Goal/Solution].", meaning: "Fokus saya terutama pada... khususnya bagaimana kita...", example: "My focus is mainly on Artificial Intelligence, specifically how natural language processing helps language learners." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "cutting-edge", translation: "mutakhir / terdepan", context: "Our lab focuses on cutting-edge machine learning research." },
            { phrase: "capstone project", translation: "proyek tugas akhir / skripsi", context: "For my capstone project, I created a smart IoT device." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Explain what your major is to a person who is not from your field."
          ]),
          dialogueScript: "Lecturer: Tell me about your academic background.\nStudent: I completed my degree in Software Engineering with a focus on web systems. I am particularly interested in educational technology."
        },
        {
          dayNumber: 3,
          title: 'Expressing & Justifying Your Opinions',
          objectives: JSON.stringify([
            'State viewpoints politely using qualifying phrases',
            'Support opinions with reasons and examples'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "From my perspective, [Statement], because [Reason].", meaning: "Dari sudut pandang saya... karena...", example: "From my perspective, practical speaking practice is more critical than grammar tests, because communication requires spontaneous reaction." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "on the flip side", translation: "di sisi sebaliknya", context: "Online classes are flexible; on the flip side, in-person discussions feel more engaging." },
            { phrase: "point of view", translation: "sudut pandang", context: "That is an interesting point of view, let's explore it." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "State whether you prefer studying alone or in a study group, and give two reasons."
          ]),
          dialogueScript: "Classmate: Do you think AI will replace human teachers?\nStudent: Personally, I don't think so. While AI is great for interactive drills, human tutors provide empathy, mentorship, and nuanced cultural understanding."
        },
        {
          dayNumber: 4,
          title: 'Asking Thoughtful Follow-up Questions',
          objectives: JSON.stringify([
            'Keep conversations two-way instead of passive nodding',
            'Probe deeper into what the other person is saying'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "That sounds fascinating! What made you choose that approach?", meaning: "Itu terdengar menarik! Apa yang membuatmu memilih pendekatan itu?", example: "That sounds fascinating! What made you decide to focus on renewable energy?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "probe further", translation: "menggali lebih dalam", context: "Let me ask a follow-up question to probe further." },
            { phrase: "how did that turn out", translation: "bagaimana hasilnya kemudian?", context: "You mentioned testing the prototype last week—how did that turn out?" }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Respond to someone who just said they traveled to Japan, and ask a meaningful follow-up question."
          ]),
          dialogueScript: "A: I spent three weeks volunteering in a small town last summer.\nB: That sounds like an unforgettable experience! What was the biggest cultural difference you noticed?"
        },
        {
          dayNumber: 5,
          title: 'Explaining a Problem & Requesting Advice',
          objectives: JSON.stringify([
            'Describe a dilemma or obstacle clearly',
            'Invite constructive feedback'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "I've hit a roadblock with [Task]. How would you suggest I tackle it?", meaning: "Saya menemui jalan buntu dengan... Bagaimana saranmu untuk menanganinya?", example: "I've hit a roadblock with setting up the database. How would you suggest I tackle it?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "hit a roadblock", translation: "menemui kendala / hambatan besar", context: "We hit a roadblock when the API rate limit was exceeded." },
            { phrase: "tackle an issue", translation: "mengatasi masalah", context: "Here is how our team usually tackles this issue." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Ask a senior student how to manage time between heavy coursework and part-time commitments."
          ]),
          dialogueScript: "Student: Hi Maya, could I ask for your advice? I'm struggling to balance lab reports and reading assignments.\nSenior: I totally get it. What helped me was blocking three focused hours every morning before checking messages."
        }
      ]
    },
    {
      weekNumber: 5,
      title: 'Natural Listening and Speaking',
      theme: 'Kecepatan Natural, Connected Speech & Respons Spontan',
      description: 'Melatih telinga untuk memahami reduksi kata (gonna, wanna, shoulda), intonasi, dan berbicara tanpa jeda lama.',
      lessons: [
        {
          dayNumber: 1,
          title: 'Decoding Connected Speech & Reductions',
          objectives: JSON.stringify([
            'Recognize common sound linkages (wanna, gonna, what d’you think)',
            'Understand fast native speech without subtitles'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "What are you going to do? -> /Whatcha gonna do?/", meaning: "Pemahaman reduksi percakapan santai", example: "What're you gonna do after graduation?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "connected speech", translation: "penghubungan bunyi kata saat berbicara cepat", context: "Connected speech makes English sound smooth and fluid." },
            { phrase: "reduction", translation: "penyingkatan bunyi alami", context: "'Kind of' often reduces to 'kinda' in fast speech." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Practice saying: 'I'm gonna head over to the library, wanna join?' naturally."
          ]),
          dialogueScript: "A: Whatcha doing this afternoon? Wanna grab coffee?\nB: I'd love to, but I've gotta finish this draft before five.\nA: No worries, catch you later!"
        },
        {
          dayNumber: 2,
          title: 'Thinking in English: Bypassing Mental Translation',
          objectives: JSON.stringify([
            'Train immediate association between concepts and English phrases',
            'Reduce response latency to under 3 seconds'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Well, off the top of my head, I'd say [Quick reaction].", meaning: "Tanpa berpikir panjang, menurut saya...", example: "Well, off the top of my head, I'd say the blue one looks more professional." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "off the top of my head", translation: "spontan / tanpa perlu mengecek data lama", context: "Off the top of my head, the flight was around five hundred dollars." },
            { phrase: "filler phrase", translation: "frasa transisi saat berpikir (let's see, well, you know)", context: "Using filler phrases gives your brain time to formulate thoughts naturally." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Answer immediately: What is your favorite place to relax in your hometown?"
          ]),
          dialogueScript: "Q: What's the best movie you saw recently?\nA: That's an easy one—Interstellar! The cinematography and sound design were absolutely breathtaking."
        },
        {
          dayNumber: 3,
          title: 'Mastering Natural Fillers & Buying Time',
          objectives: JSON.stringify([
            'Use conversational lubricants instead of silence or "uhhh"',
            'Sound fluent while formulating complex points'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "That's a really good question. Let me think for a second...", meaning: "Itu pertanyaan bagus. Beri saya waktu sebentar berpikir...", example: "That's a really interesting point. If I look back at my experience..." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "as a matter of fact", translation: "sebenarnya / faktanya", context: "As a matter of fact, I lived in Bandung for three years." },
            { phrase: "to be honest", translation: "sejujurnya", context: "To be honest, I was quite nervous when I first spoke in front of the class." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Use 'That's a great question, let me consider that for a moment' to start answering: What is the biggest challenge facing university students today?"
          ]),
          dialogueScript: "Interviewer: Where do you see yourself in five years?\nCandidate: That's a great question. Let me think... In five years, I hope to be leading technical projects that create positive social impact."
        },
        {
          dayNumber: 4,
          title: 'Question Intonation and Emotion Nuances',
          objectives: JSON.stringify([
            'Distinguish rising intonation (yes/no) and falling intonation (wh-questions)',
            'Express empathy and genuine surprise through vocal tone'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Are you serious?! That is incredible news!", meaning: "Intonasi antusias dan kejutan positif", example: "You got the scholarship?! That is absolutely incredible news!" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "intonation", translation: "nada dan lagu kalimat saat berbicara", context: "Rising intonation at the end of a statement often signals uncertainty or a question." },
            { phrase: "nuance", translation: "nuansa makna yang halus", context: "Tone of voice adds emotional nuance to everyday words." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Congratulate a friend who just passed their IELTS or exam with warm, energetic intonation."
          ]),
          dialogueScript: "Friend: I just got accepted into the Melbourne master's program!\nYou: No way! Congratulations, I am so thrilled for you! You worked so hard for this!"
        },
        {
          dayNumber: 5,
          title: 'Spontaneous Speaking Sprint',
          objectives: JSON.stringify([
            'Speak for 60 seconds continuously on random prompt without stopping',
            'Focus on flow and message delivery over minor grammar slips'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Speaking of [Topic], one thing that comes to mind is [Idea].", meaning: "Membicarakan tentang... satu hal yang terlintas adalah...", example: "Speaking of travel, one thing that comes to mind is how food connects cultures." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "fluency", translation: "kelancaran mengalirkan kata-kata", context: "Fluency means expressing your ideas smoothly without mental blocks." },
            { phrase: "train of thought", translation: "alur pemikiran", context: "I lost my train of thought for a second, but what I meant was..." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Speak for one minute answering: If you could visit any city in the world tomorrow, where would you go and why?"
          ]),
          dialogueScript: "Tutor: Ready for your 60-second spontaneous sprint? Tell me about a memory that always makes you smile.\nStudent: One memory that always brings a smile to my face is our high school camping trip in West Java..."
        }
      ]
    },
    {
      weekNumber: 6,
      title: 'Problem Solving and Social Interaction',
      theme: 'Penyelesaian Masalah, Komplain Sopan & Interaksi Sosial',
      description: 'Menangani situasi tidak terduga di luar negeri: barang hilang, kendala akomodasi, dan perbedaan budaya.',
      lessons: [
        {
          dayNumber: 1,
          title: 'Polite Complaints & Service Corrections',
          objectives: JSON.stringify([
            'Address mistakes in bills or service diplomatically',
            'Request solutions without being aggressive'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "I hate to be a bother, but there seems to be a mistake on [Item/Bill].", meaning: "Maaf merepotkan, tapi tampaknya ada kesalahan pada...", example: "I hate to be a bother, but there seems to be an extra charge on our receipt." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "overcharged", translation: "dikenakan biaya berlebih", context: "I think we were accidentally overcharged for the second beverage." },
            { phrase: "sort this out", translation: "membereskan / menyelesaikan masalah ini", context: "Could you help us sort this out with the manager?" }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Politely inform a hotel receptionist that the hot water in your shower is not working."
          ]),
          dialogueScript: "Guest: Hello, good evening. I'm staying in room 412. I'm afraid the shower heater doesn't seem to be working.\nFront Desk: Oh, I'm very sorry about that! I'll send maintenance right away."
        },
        {
          dayNumber: 2,
          title: 'Reporting Incidents & Lost Property',
          objectives: JSON.stringify([
            'File reports with security or campus administration',
            'Give accurate time, location, and description details'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "I believe I left my [Item] at [Place] around [Time].", meaning: "Saya rasa saya meninggalkan... di... sekitar jam...", example: "I believe I left my black backpack in lecture hall 3 around 2 PM." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "lost and found", translation: "bagian barang hilang dan temuan", context: "Has anyone turned in a blue water bottle to lost and found?" },
            { phrase: "turn in", translation: "menyerahkan barang temuan", context: "A kind student turned in your wallet earlier today." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Ask the campus security if anyone handed in a student ID card found in the library."
          ]),
          dialogueScript: "Student: Hi, has anyone turned in a black laptop sleeve today?\nOfficer: Yes, someone found one near the cafeteria stairs. What brand is it?"
        },
        {
          dayNumber: 3,
          title: 'Handling Misunderstandings Diplomatically',
          objectives: JSON.stringify([
            'De-escalate awkward conversational moments',
            'Clarify intentions and apologize gracefully'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "I apologize if that came out wrong, what I meant was [Explanation].", meaning: "Saya minta maaf jika penyampaian saya kurang tepat, maksud saya adalah...", example: "I apologize if that came out wrong, what I meant was that we could try a different approach." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "come out wrong", translation: "terdengar salah / disalahartikan", context: "I'm sorry if my phrase came out wrong, English is my second language." },
            { phrase: "on the same page", translation: "sependapat / memiliki pemahaman yang sama", context: "Let's review the notes to make sure we're on the same page." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Clarify a misunderstanding where a friend thought you canceled plans when you just asked to delay by 30 minutes."
          ]),
          dialogueScript: "A: Did you cancel our study session?\nB: Oh no, not at all! I'm so sorry if my text was confusing. I just asked if we could meet at 4:30 instead of 4:00."
        },
        {
          dayNumber: 4,
          title: 'Visiting the Pharmacy or Doctor Clinic',
          objectives: JSON.stringify([
            'Describe symptoms (fever, headache, upset stomach, allergies)',
            'Understand dosage and medication instructions'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "I've been feeling [Symptom] since [Time period].", meaning: "Saya merasa... sejak...", example: "I've been feeling dizzy and nauseous since yesterday evening." },
            { pattern: "Do I need a prescription for this, or is it over-the-counter?", meaning: "Apakah ini butuh resep dokter atau obat bebas?", example: "Do I need a prescription for this allergy medication?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "over-the-counter", translation: "obat bebas tanpa resep", context: "You can buy pain relievers over-the-counter at any drugstore." },
            { phrase: "dosage", translation: "dosis pemakaian obat", context: "Take one tablet twice a day after meals." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Tell the pharmacist you have a sore throat and slight fever and ask what medicine they recommend."
          ]),
          dialogueScript: "Pharmacist: Hello, how can I help you today?\nCustomer: Hi, I've had a bad cough and sore throat for three days. Could you recommend something to relieve the irritation?\nPharmacist: Sure. Take these lozenges every four hours, and drink plenty of warm water."
        },
        {
          dayNumber: 5,
          title: 'Networking & Keeping in Touch',
          objectives: JSON.stringify([
            'Exchange social media and contact details naturally',
            'Suggest meeting up again casually'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Are you on [Platform/Instagram/WhatsApp]? We should definitely stay in touch!", meaning: "Apakah kamu pakai... Kita harus tetap berkabar!", example: "Are you on WhatsApp or Instagram? We should definitely stay in touch!" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "keep in touch", translation: "tetap saling berkabar", context: "Let's definitely keep in touch after the conference ends." },
            { phrase: "reach out", translation: "menghubungi", context: "Feel free to reach out anytime if you visit my city." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Ask a new international friend if you can connect on LinkedIn or Instagram."
          ]),
          dialogueScript: "A: I really enjoyed our chat today!\nB: Me too! Let's swap numbers. Are you on WhatsApp?\nA: Yes, here is my QR code. Let's grab lunch sometime next week!"
        }
      ]
    },
    {
      weekNumber: 7,
      title: 'Full Abroad Simulation',
      theme: 'Simulasi Kehidupan Nyata: Hari Pertama di Luar Negeri',
      description: 'Mengintegrasikan seluruh kemampuan: dari bandara hingga dormitori, diskusi akademik, dan kehidupan mandiri.',
      lessons: [
        {
          dayNumber: 1,
          title: 'Arrival Day: From Airport to Campus Dorm',
          objectives: JSON.stringify([
            'Navigate shuttle services and arrive at student accommodation',
            'Complete dormitory check-in and key collection'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "I have a reservation under the name [Name]. Here is my confirmation letter.", meaning: "Saya punya reservasi atas nama... Ini surat konfirmasinya.", example: "I have a dorm room reservation under Rian Pratama. Here is my student ID and room offer." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "security deposit", translation: "uang jaminan deposit", context: "The dorm requires a refundable two-hundred dollar security deposit." },
            { phrase: "key fob / key card", translation: "kartu akses kunci pintu elektronik", context: "Use this key fob to tap into the main entrance and elevator." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Check in at the university housing desk with your booking confirmation."
          ]),
          dialogueScript: "Dorm Officer: Welcome to International Student House! Name please?\nStudent: Good afternoon, Rian Pratama. I have a booking for room 204.\nDorm Officer: Excellent! Here is your key fob and welcome packet."
        },
        {
          dayNumber: 2,
          title: 'First Campus Orientation & Meeting Classmates',
          objectives: JSON.stringify([
            'Participate in icebreakers and social introductions',
            'Find lecture halls and academic advisors'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Is this the orientation session for [Program]?", meaning: "Apakah ini sesi orientasi untuk program...", example: "Is this the orientation session for postgraduate engineering students?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "orientation week (O-Week)", translation: "minggu orientasi mahasiswa baru", context: "O-Week is full of club fairs and campus tours." },
            { phrase: "syllabus", translation: "silabus / rencana pembelajaran perkuliahan", context: "Check the syllabus for reading lists and assignment due dates." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Introduce yourself to a circle of 3 new students during orientation."
          ]),
          dialogueScript: "Leader: Welcome everyone! Turn to your neighbor and share where you're from.\nYou: Hi! I'm Rian from Indonesia. I'm starting the software engineering program. What about you guys?"
        },
        {
          dayNumber: 3,
          title: 'Consulting a Professor During Office Hours',
          objectives: JSON.stringify([
            'Ask thoughtful academic questions respectfully',
            'Seek clarification on assignments or essay topics'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Professor [Name], do you have a few minutes to discuss [Topic]?", meaning: "Profesor..., apakah Anda punya waktu beberapa menit untuk berdiskusi tentang...", example: "Professor Miller, do you have a few minutes to discuss the literature review assignment?" }
          ]),
          vocabList: JSON.stringify([
            { phrase: "office hours", translation: "jam konsultasi dosen", context: "Professors hold office hours on Tuesdays and Thursdays." },
            { phrase: "constructive feedback", translation: "masukan yang membangun", context: "I'd really value your constructive feedback on my research proposal." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Politely ask your professor for guidance on narrowing down your final essay topic."
          ]),
          dialogueScript: "Student: Good afternoon, Professor Evans. Thanks for meeting with me.\nProfessor: Come in, Rian! What can I help you with regarding the research paper?\nStudent: I wanted to ask your advice on whether my topic scope is too broad."
        },
        {
          dayNumber: 4,
          title: 'Opening a Bank Account & SIM Card Setup',
          objectives: JSON.stringify([
            'Navigate administrative banking procedures in English',
            'Choose an appropriate mobile phone data plan'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "I'd like to open a student checking account, please.", meaning: "Saya ingin membuka rekening tabungan mahasiswa.", example: "I'd like to open a student checking account. I have my passport and enrollment letter here." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "checking account", translation: "rekening koran / transaksi harian", context: "Most international students open a fee-free checking account." },
            { phrase: "proof of address", translation: "bukti alamat domisili", context: "Do you have a dorm contract or utility bill as proof of address?" }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Ask a telecom rep which prepaid SIM plan offers the most data for international calls and daily internet."
          ]),
          dialogueScript: "Bank Rep: Good morning! How can we assist you today?\nCustomer: Hi! I just arrived for university and need to open a bank account to receive tuition and living funds.\nBank Rep: Fantastic. May I see your passport and proof of university enrollment?"
        },
        {
          dayNumber: 5,
          title: 'The Capstone Abroad Milestone',
          objectives: JSON.stringify([
            'Synthesize your learning into a 3-minute self-presentation',
            'Reflect on your confidence transformation and readiness for 2027'
          ]),
          sentencePatterns: JSON.stringify([
            { pattern: "Over these weeks, I have built the confidence to express my ideas clearly and handle any abroad situation.", meaning: "Pernyataan refleksi kesiapan mandiri", example: "I am now prepared to travel abroad with confidence, curiosity, and spontaneity." }
          ]),
          vocabList: JSON.stringify([
            { phrase: "readiness", translation: "kesiapan", context: "Our consistent practice builds true conversational readiness." },
            { phrase: "self-reliance", translation: "kemandirian", context: "Living abroad teaches incredible resilience and self-reliance." }
          ]),
          guidedSpeakingPrompts: JSON.stringify([
            "Deliver a short speech reflecting on your journey from hesitation to conversational confidence."
          ]),
          dialogueScript: "Mentor: Congratulations on reaching this milestone! How do you feel about your English now?\nStudent: I feel so much more spontaneous. I no longer translate every word mentally, and I'm excited rather than anxious about moving abroad!"
        }
      ]
    }
  ];

  for (const week of curriculumData) {
    const createdWeek = await prisma.curriculumWeek.upsert({
      where: { weekNumber: week.weekNumber },
      update: {
        title: week.title,
        theme: week.theme,
        description: week.description
      },
      create: {
        weekNumber: week.weekNumber,
        title: week.title,
        theme: week.theme,
        description: week.description
      }
    });

    for (const [index, lesson] of week.lessons.entries()) {
      const existingLesson = await prisma.lesson.findFirst({
        where: { weekId: createdWeek.id, dayNumber: lesson.dayNumber }
      });
      if (!existingLesson) {
        await prisma.lesson.create({
          data: {
            weekId: createdWeek.id,
            dayNumber: lesson.dayNumber,
            title: lesson.title,
            objectives: lesson.objectives,
            sentencePatterns: lesson.sentencePatterns,
            vocabList: lesson.vocabList,
            guidedSpeakingPrompts: lesson.guidedSpeakingPrompts,
            dialogueScript: lesson.dialogueScript,
            orderIndex: index
          }
        });
      }
    }
  }
  console.log('Curriculum (7 weeks & 35 lessons) successfully seeded.');

  // 3. 20+ Curated Practical Listening Dialogues
  const listeningExercises = [
    {
      title: 'Flight Announcement & Gate Change',
      category: 'AIRPORT',
      difficulty: 'A2',
      audioDurationSec: 35,
      dialogueJson: JSON.stringify([
        { speaker: 'Announcement', text: 'Attention all passengers on flight QF-42 bound for Sydney. There has been an immediate gate change. Flight QF-42 will now depart from Gate B18 instead of Gate A4. Boarding will commence in approximately twenty minutes. Please have your boarding pass and passport ready.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What is the flight destination?', options: ['Melbourne', 'Sydney', 'Brisbane', 'Perth'], correctIndex: 1, explanation: 'The announcement clearly states: "bound for Sydney".' },
        { id: 'q2', question: 'Which is the new departure gate?', options: ['Gate A4', 'Gate B14', 'Gate B18', 'Gate A18'], correctIndex: 2, explanation: 'The announcer says: "Flight QF-42 will now depart from Gate B18 instead of Gate A4".' },
        { id: 'q3', question: 'When will boarding start?', options: ['In 20 minutes', 'Immediately', 'In 45 minutes', 'Tomorrow morning'], correctIndex: 0, explanation: 'The announcer notes: "Boarding will commence in approximately twenty minutes".' }
      ]),
      tips: 'Perhatikan kata kunci seperti "bound for" (tujuan) dan "instead of" (menggantikan yang lama).'
    },
    {
      title: 'Ordering at a Fast-Casual Melbourne Cafe',
      category: 'RESTAURANT',
      difficulty: 'B1',
      audioDurationSec: 45,
      dialogueJson: JSON.stringify([
        { speaker: 'Barista', text: 'Hey there, what can I grab for you today?' },
        { speaker: 'Customer', text: 'Hi! Could I please get a flat white with oat milk, and an avocado toast on sourdough?' },
        { speaker: 'Barista', text: 'No worries. Would you like a poached egg on top of the avo toast?' },
        { speaker: 'Customer', text: 'Yes, please! And make sure it is for dine-in.' },
        { speaker: 'Barista', text: 'Easy. That comes to fifteen dollars fifty. Take a seat by the window and we will bring it right over.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What milk preference did the customer choose?', options: ['Cow milk', 'Soy milk', 'Oat milk', 'Almond milk'], correctIndex: 2, explanation: 'The customer ordered: "a flat white with oat milk".' },
        { id: 'q2', question: 'What extra topping was added to the toast?', options: ['Bacon', 'Poached egg', 'Mushrooms', 'Extra cheese'], correctIndex: 1, explanation: 'The barista asked: "Would you like a poached egg on top?", and customer replied "Yes, please!".' },
        { id: 'q3', question: 'Where will the customer sit?', options: ['Outside patio', 'By the window', 'At the counter', 'Taking away'], correctIndex: 1, explanation: 'Barista instructed: "Take a seat by the window".' }
      ]),
      tips: 'Istilah "Flat white" adalah racikan kopi espresso khas Australia/Selandia Baru.'
    },
    {
      title: 'Immigration Passport Control Interview',
      category: 'AIRPORT',
      difficulty: 'B1',
      audioDurationSec: 50,
      dialogueJson: JSON.stringify([
        { speaker: 'Officer', text: 'Good morning. Passport and incoming passenger card, please.' },
        { speaker: 'Student', text: 'Good morning, officer. Here you go.' },
        { speaker: 'Officer', text: 'What is the purpose of your trip to the UK?' },
        { speaker: 'Student', text: 'I am here to attend a one-year Master of Data Science program at the University of Manchester.' },
        { speaker: 'Officer', text: 'Where will you be staying while studying?' },
        { speaker: 'Student', text: 'I have a room reserved at the university halls of residence on Oxford Road.' },
        { speaker: 'Officer', text: 'Do you have your biometric residence permit letter?' },
        { speaker: 'Student', text: 'Yes, right here with my CAS statement.' },
        { speaker: 'Officer', text: 'Everything looks in order. Enjoy your studies in Manchester!' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What degree is the student studying?', options: ['Bachelor of Business', 'Master of Data Science', 'PhD in Linguistics', 'Diploma in Nursing'], correctIndex: 1, explanation: 'The student states: "Master of Data Science program".' },
        { id: 'q2', question: 'How long is the program?', options: ['6 months', 'One year', 'Three years', 'Two weeks'], correctIndex: 1, explanation: 'The student mentions: "a one-year Master of Data Science program".' },
        { id: 'q3', question: 'What document confirmed the student accommodation?', options: ['A hotel receipt', 'University halls on Oxford Road', 'A relative home', 'An Airbnb invoice'], correctIndex: 1, explanation: 'The student said: "university halls of residence on Oxford Road".' }
      ]),
      tips: 'Jawab petugas imigrasi dengan tenang, to the point, dan siapkan dokumen pendukung di tangan.'
    },
    {
      title: 'Asking for Directions to the Metro Station',
      category: 'DIRECTIONS',
      difficulty: 'A2',
      audioDurationSec: 40,
      dialogueJson: JSON.stringify([
        { speaker: 'Tourist', text: 'Excuse me, sorry to bother you! Could you tell me where the nearest metro station is?' },
        { speaker: 'Local', text: 'Sure thing! Head straight down this street until you hit the big traffic light next to the cathedral.' },
        { speaker: 'Tourist', text: 'Okay, straight to the traffic light by the cathedral.' },
        { speaker: 'Local', text: 'Then take a sharp left onto King Street. Walk past the bookstore, and the metro entrance is right on your right.' },
        { speaker: 'Tourist', text: 'How long of a walk is it?' },
        { speaker: 'Local', text: 'Not far at all, about five or six minutes on foot.' },
        { speaker: 'Tourist', text: 'Thank you very much for your help!' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What landmark is near the traffic light?', options: ['A cathedral', 'A supermarket', 'A stadium', 'A train bridge'], correctIndex: 0, explanation: 'Local said: "next to the cathedral".' },
        { id: 'q2', question: 'Which turn should the tourist make after the cathedral?', options: ['Right turn', 'Sharp left', 'U-turn', 'Cross over'], correctIndex: 1, explanation: 'Local said: "take a sharp left onto King Street".' },
        { id: 'q3', question: 'Estimated walking time is:', options: ['20 minutes', '5-6 minutes', '15 minutes', '1 minute'], correctIndex: 1, explanation: 'Local noted: "about five or six minutes on foot".' }
      ]),
      tips: 'Ulangi instruksi yang Anda dengar (paraphrasing) untuk memastikan Anda tidak salah belok.'
    },
    {
      title: 'Discussing a Group Project Assignment',
      category: 'ACADEMIC',
      difficulty: 'B2',
      audioDurationSec: 55,
      dialogueJson: JSON.stringify([
        { speaker: 'Emma', text: 'Hey Rian, we need to finalize the outline for our marketing case study before Friday.' },
        { speaker: 'Rian', text: 'Right. I have already drafted the market research section and the competitor analysis.' },
        { speaker: 'Emma', text: 'Great work! Could you take a look at the slide deck? I feel like the financial projections need more supporting charts.' },
        { speaker: 'Rian', text: 'I agree. Let me compile the revenue forecast into a clean graph tonight. Shall we do a quick dry run on Thursday afternoon?' },
        { speaker: 'Emma', text: 'Sounds like a plan. Let us book a study room in the main library for 2 PM Thursday.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What section had Rian already drafted?', options: ['Introduction and conclusion', 'Market research and competitor analysis', 'Financial budget only', 'Appendix'], correctIndex: 1, explanation: 'Rian said: "market research section and the competitor analysis".' },
        { id: 'q2', question: 'What improvement did Emma suggest for the slides?', options: ['Fewer slides', 'More supporting charts for financial projections', 'Change font colors', 'Remove references'], correctIndex: 1, explanation: 'Emma felt: "the financial projections need more supporting charts".' },
        { id: 'q3', question: 'When will the team do a dry run?', options: ['Friday morning', 'Thursday afternoon at 2 PM', 'Next Monday', 'Tonight at 8 PM'], correctIndex: 1, explanation: 'They agreed on Thursday at 2 PM in the main library.' }
      ]),
      tips: '"Dry run" artinya latihan gladi bersih atau simulasi presentasi sebelum hari-H.'
    },
    {
      title: 'Opening a Local Student Bank Account',
      category: 'SERVICES',
      difficulty: 'B1',
      audioDurationSec: 45,
      dialogueJson: JSON.stringify([
        { speaker: 'Representative', text: 'Welcome to Commonwealth Bank. How can I help you today?' },
        { speaker: 'Student', text: 'Hello, I am an international student and I would like to open an everyday checking account.' },
        { speaker: 'Representative', text: 'Certainly! As long as you are enrolled full-time, our student account has zero monthly maintenance fees.' },
        { speaker: 'Student', text: 'That sounds perfect. What documents do I need to provide?' },
        { speaker: 'Representative', text: 'I will just need your passport, your electronic Confirmation of Enrolment, and proof of your local residential address.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What is special about the student account?', options: ['High interest rate', 'Zero monthly maintenance fees', 'Free airline tickets', 'Cash bonus'], correctIndex: 1, explanation: 'Representative said: "our student account has zero monthly maintenance fees".' },
        { id: 'q2', question: 'Which document proves enrollment?', options: ['Driver license', 'Electronic Confirmation of Enrolment (eCoE)', 'High school report', 'Birth certificate'], correctIndex: 1, explanation: 'Representative requested: "electronic Confirmation of Enrolment".' }
      ]),
      tips: '"Everyday checking account" adalah rekening harian untuk transaksi kartu debit.'
    },
    {
      title: 'Reporting Lost Property on the Bus',
      category: 'SERVICES',
      difficulty: 'B1',
      audioDurationSec: 40,
      dialogueJson: JSON.stringify([
        { speaker: 'Clerk', text: 'City Transit Lost and Found desk, how may I assist you?' },
        { speaker: 'Passenger', text: 'Hi! I took route 400 from the airport to Bondi Junction this morning, and I accidentally left my blue umbrella and a grey cardigan on the upper deck.' },
        { speaker: 'Clerk', text: 'What time did you get off the bus?' },
        { speaker: 'Passenger', text: 'Around 10:15 AM at the main bus terminal.' },
        { speaker: 'Clerk', text: 'Let me inspect our logged items. Yes, the driver turned in a grey cardigan about twenty minutes ago. You can collect it with photo ID.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What items did the passenger leave behind?', options: ['A wallet and phone', 'A blue umbrella and grey cardigan', 'A suitcase', 'A laptop'], correctIndex: 1, explanation: 'Passenger mentioned: "a blue umbrella and a grey cardigan".' },
        { id: 'q2', question: 'Which item was already turned in by the driver?', options: ['The umbrella', 'The cardigan', 'Both items', 'Neither item'], correctIndex: 1, explanation: 'Clerk stated: "the driver turned in a grey cardigan about twenty minutes ago".' }
      ]),
      tips: 'Sebutkan rute bus (route 400), waktu, dan lokasi saat melapor barang tertinggal.'
    },
    {
      title: 'Consulting a Pharmacist for Cold Symptoms',
      category: 'SERVICES',
      difficulty: 'A2',
      audioDurationSec: 35,
      dialogueJson: JSON.stringify([
        { speaker: 'Pharmacist', text: 'Hello, how can I assist you today?' },
        { speaker: 'Customer', text: 'Hi, I have developed a congested nose, mild fever, and dry cough since yesterday.' },
        { speaker: 'Pharmacist', text: 'Are you taking any other prescription medications or do you have allergies?' },
        { speaker: 'Customer', text: 'No other medication and no known drug allergies.' },
        { speaker: 'Pharmacist', text: 'I recommend this daytime decongestant tablet. Take one tablet every six hours with a glass of water.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What symptoms did the customer experience?', options: ['Sprained ankle', 'Congested nose, mild fever, and dry cough', 'Earache', 'Tooth pain'], correctIndex: 1, explanation: 'Customer described: "congested nose, mild fever, and dry cough".' },
        { id: 'q2', question: 'How frequently should the medicine be taken?', options: ['Every hour', 'Every six hours', 'Once a week', 'Only before bed'], correctIndex: 1, explanation: 'Pharmacist advised: "Take one tablet every six hours".' }
      ]),
      tips: '"Decongestant" adalah obat untuk melegakan hidung tersumbat.'
    },
    {
      title: 'Campus Dormitory Fire Safety Briefing',
      category: 'ACADEMIC',
      difficulty: 'B2',
      audioDurationSec: 45,
      dialogueJson: JSON.stringify([
        { speaker: 'Warden', text: 'Welcome residents. Please pay close attention to this mandatory fire drill protocol. In the event of an alarm, do not use elevators under any circumstances. Proceed calmly through the stairwells marked with green exit signs. Our designated assembly muster point is the open grass lawn opposite building C.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What must residents avoid during a fire alarm?', options: ['Using stairs', 'Using elevators', 'Leaving rooms', 'Calling friends'], correctIndex: 1, explanation: 'Warden explicitly warned: "do not use elevators under any circumstances".' },
        { id: 'q2', question: 'Where is the assembly muster point?', options: ['The parking lot', 'The cafeteria', 'The open grass lawn opposite building C', 'The basement'], correctIndex: 2, explanation: 'Warden said: "the open grass lawn opposite building C".' }
      ]),
      tips: '"Muster point" atau "assembly point" adalah titik kumpul darurat.'
    },
    {
      title: 'Negotiating Secondhand Furniture Online',
      category: 'SOCIAL',
      difficulty: 'B1',
      audioDurationSec: 40,
      dialogueJson: JSON.stringify([
        { speaker: 'Buyer', text: 'Hi Sarah! I saw your post for the study desk and swivel chair. Is it still available?' },
        { speaker: 'Seller', text: 'Yes, both are available. The desk is in mint condition, practically brand new.' },
        { speaker: 'Buyer', text: 'Would you be open to fifty dollars for both if I pick them up myself this evening?' },
        { speaker: 'Seller', text: 'I was asking seventy, but since you can collect today, fifty-five works for me.' },
        { speaker: 'Buyer', text: 'Deal! Send me your address and I will see you around six.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What condition was the desk in?', options: ['Damaged', 'Mint condition / practically brand new', 'Painted black', 'Needs repair'], correctIndex: 1, explanation: 'Seller described: "mint condition, practically brand new".' },
        { id: 'q2', question: 'What was the final agreed price?', options: ['$50', '$55', '$70', '$60'], correctIndex: 1, explanation: 'Seller countered with: "fifty-five works for me", and Buyer agreed: "Deal!".' }
      ]),
      tips: '"Mint condition" artinya barang bekas yang kondisinya masih sangat prima seperti baru.'
    },
    {
      title: 'Joining a University Student Society',
      category: 'SOCIAL',
      difficulty: 'A2',
      audioDurationSec: 35,
      dialogueJson: JSON.stringify([
        { speaker: 'Club Officer', text: 'Hey there! Are you looking for student clubs to join this semester?' },
        { speaker: 'Student', text: 'Yes! What is this club about?' },
        { speaker: 'Club Officer', text: 'We are the International Cultural Exchange Society. We organize weekend hikes, language exchange cafes, and international food fairs.' },
        { speaker: 'Student', text: 'That sounds amazing! How much is the membership fee?' },
        { speaker: 'Club Officer', text: 'It is just ten dollars for the whole academic year.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What activities does this society organize?', options: ['Competitive gaming only', 'Weekend hikes, language cafes, and food fairs', 'Flight bookings', 'Coding competitions only'], correctIndex: 1, explanation: 'Club officer listed: "weekend hikes, language exchange cafes, and international food fairs".' },
        { id: 'q2', question: 'How much is the annual membership?', options: ['Free', '$10', '$50', '$100'], correctIndex: 1, explanation: 'Officer said: "It is just ten dollars for the whole academic year".' }
      ]),
      tips: 'Bergabung dengan "Student Society" adalah cara tercepat melatih percakapan santai di luar kelas.'
    },
    {
      title: 'Train Delay and Platform Announcement',
      category: 'AIRPORT',
      difficulty: 'B1',
      audioDurationSec: 30,
      dialogueJson: JSON.stringify([
        { speaker: 'Broadcaster', text: 'May I have your attention please. The 14:15 express service to Oxford has been delayed by approximately 15 minutes due to signal maintenance outside Reading. Passengers are advised to wait on platform 3. We apologize for any inconvenience caused.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What is the cause of the train delay?', options: ['Bad weather', 'Signal maintenance outside Reading', 'Driver sickness', 'Strike action'], correctIndex: 1, explanation: 'Broadcaster said: "due to signal maintenance outside Reading".' },
        { id: 'q2', question: 'Which platform should passengers wait on?', options: ['Platform 1', 'Platform 3', 'Platform 5', 'Platform 7'], correctIndex: 1, explanation: 'Broadcaster said: "wait on platform 3".' }
      ]),
      tips: '"Due to" adalah kata sambung formal untuk menyatakan sebab/alasan keterlambatan.'
    },
    {
      title: 'Asking a Librarian for Research Materials',
      category: 'ACADEMIC',
      difficulty: 'B1',
      audioDurationSec: 40,
      dialogueJson: JSON.stringify([
        { speaker: 'Student', text: 'Excuse me, I am looking for peer-reviewed journal articles on renewable energy policies in Southeast Asia. Where should I start?' },
        { speaker: 'Librarian', text: 'You can access our online research databases through the student portal. Try searching on Scopus or JSTOR. If you need printed archives, they are located on level 4 under shelf code HD-9502.' },
        { speaker: 'Student', text: 'Can I print articles directly here?' },
        { speaker: 'Librarian', text: 'Yes, just tap your student card on any multifunction printer in the computer lab.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'Which online databases did the librarian recommend?', options: ['Wikipedia and Reddit', 'Scopus and JSTOR', 'Twitter and YouTube', 'Google Books only'], correctIndex: 1, explanation: 'Librarian recommended: "Scopus or JSTOR".' },
        { id: 'q2', question: 'How can the student pay for printing?', options: ['Cash coins only', 'By tapping their student card', 'Credit card swiping', 'Free vouchers'], correctIndex: 1, explanation: 'Librarian said: "tap your student card on any multifunction printer".' }
      ]),
      tips: '"Peer-reviewed journal" adalah artikel jurnal ilmiah yang telah melalui telaah sejawat pakar.'
    },
    {
      title: 'Renting a Bicycle from a City Share Dock',
      category: 'SERVICES',
      difficulty: 'A2',
      audioDurationSec: 35,
      dialogueJson: JSON.stringify([
        { speaker: 'Customer Support', text: 'City Bike Support, how can I help you unlock a bike?' },
        { speaker: 'Rider', text: 'Hi, the QR code on bike number 204 is scratched. Can I unlock it via the bike ID?' },
        { speaker: 'Customer Support', text: 'Yes, certainly. In your mobile app, tap manual entry and type in code 204. The dock light will turn green and release the lock.' },
        { speaker: 'Rider', text: 'Got it, the light just flashed green. Thank you!' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What was wrong with the bike?', options: ['Flat tire', 'QR code was scratched', 'Broken chain', 'No seat'], correctIndex: 1, explanation: 'Rider explained: "the QR code on bike number 204 is scratched".' },
        { id: 'q2', question: 'What color signals the lock has been released?', options: ['Red', 'Yellow', 'Green', 'Blue'], correctIndex: 2, explanation: 'Support explained: "The dock light will turn green and release the lock".' }
      ]),
      tips: '"Manual entry" berguna jika kamera ponsel tidak bisa memindai barcode/QR.'
    },
    {
      title: 'Booking a Dental Appointment',
      category: 'SERVICES',
      difficulty: 'B1',
      audioDurationSec: 40,
      dialogueJson: JSON.stringify([
        { speaker: 'Receptionist', text: 'Bright Smile Dental Clinic, this is Chloe speaking.' },
        { speaker: 'Patient', text: 'Hi Chloe, I would like to schedule a routine dental cleaning and check-up for next week, please.' },
        { speaker: 'Receptionist', text: 'Sure! Do you have international student health cover with Allianz or Bupa?' },
        { speaker: 'Patient', text: 'Yes, I am covered under Bupa OSHC.' },
        { speaker: 'Receptionist', text: 'Wonderful, that covers preventive cleanings with zero out-of-pocket expenses. We have an opening next Wednesday at 10 AM.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What service did the patient request?', options: ['Tooth extraction', 'Routine cleaning and check-up', 'Braces installation', 'Cosmetic whitening'], correctIndex: 1, explanation: 'Patient requested: "routine dental cleaning and check-up".' },
        { id: 'q2', question: 'What does "zero out-of-pocket" mean?', options: ['Expensive', 'Free / 100% covered by health insurance', 'Cash only', 'Half price'], correctIndex: 1, explanation: 'It means the student does not have to pay extra money from their own pocket.' }
      ]),
      tips: '"OSHC" adalah Overseas Student Health Cover (asuransi kesehatan wajib mahasiswa internasional).'
    },
    {
      title: 'Supermarket Grocery Checkout Inquiry',
      category: 'RESTAURANT',
      difficulty: 'A1',
      audioDurationSec: 30,
      dialogueJson: JSON.stringify([
        { speaker: 'Cashier', text: 'Hello, how are you today? Do you need any shopping bags?' },
        { speaker: 'Customer', text: 'Good thanks! No bags needed, I brought my own canvas tote.' },
        { speaker: 'Cashier', text: 'Do you have a rewards loyalty card to scan?' },
        { speaker: 'Customer', text: 'Not yet. Can I pay with contactless Apple Pay?' },
        { speaker: 'Cashier', text: 'Sure, whenever you are ready. Just tap against the terminal screen.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'Did the customer need plastic bags?', options: ['Yes, 3 bags', 'No, brought own canvas tote', 'Paper bags only', 'Undecided'], correctIndex: 1, explanation: 'Customer said: "No bags needed, I brought my own canvas tote".' },
        { id: 'q2', question: 'How did the customer pay?', options: ['Cash notes', 'Cheque', 'Contactless Apple Pay', 'Store credit'], correctIndex: 2, explanation: 'Customer asked: "Can I pay with contactless Apple Pay?".' }
      ]),
      tips: 'Di banyak negara maju, kantong belanja plastik berbayar, jadi bawalah tote bag sendiri.'
    },
    {
      title: 'Asking a Professor for an Extension',
      category: 'ACADEMIC',
      difficulty: 'B2',
      audioDurationSec: 45,
      dialogueJson: JSON.stringify([
        { speaker: 'Student', text: 'Professor Henderson, I wanted to reach out regarding the midterm essay due this Friday. Unfortunately, I fell ill with the flu this week and was bedridden for three days.' },
        { speaker: 'Professor', text: 'I am sorry to hear that. Do you have a medical certificate from the university health service?' },
        { speaker: 'Student', text: 'Yes, I received one from Dr. Sarah yesterday morning.' },
        { speaker: 'Professor', text: 'Please email that certificate to the department office, and I can grant you a 48-hour extension until Sunday evening.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'Why is the student requesting an extension?', options: ['Overslept', 'Fell ill with the flu', 'Forgot the deadline', 'Had family vacation'], correctIndex: 1, explanation: 'Student explained: "I fell ill with the flu this week".' },
        { id: 'q2', question: 'How long was the granted extension?', options: ['One week', '48 hours until Sunday evening', '2 weeks', 'No extension'], correctIndex: 1, explanation: 'Professor said: "grant you a 48-hour extension until Sunday evening".' }
      ]),
      tips: 'Selalu sertakan surat dokter (medical certificate) resmi saat meminta perpanjangan tugas kuliah.'
    },
    {
      title: 'Inquiring About an Apartment Lease',
      category: 'SERVICES',
      difficulty: 'B2',
      audioDurationSec: 50,
      dialogueJson: JSON.stringify([
        { speaker: 'Property Agent', text: 'Good afternoon. Are you calling regarding the studio apartment on Carlton Street?' },
        { speaker: 'Tenant', text: 'Yes, I am. Does the weekly rent of 350 dollars include water, electricity, and unlimited internet?' },
        { speaker: 'Property Agent', text: 'Water and high-speed Wi-Fi are fully included. Electricity is billed quarterly based on your individual usage meter.' },
        { speaker: 'Tenant', text: 'Understood. What is the minimum lease agreement length?' },
        { speaker: 'Property Agent', text: 'We require a minimum 6-month lease with one month bond held by the residential tenancy authority.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'Which utilities are included in the weekly rent?', options: ['Electricity and gas only', 'Water and high-speed Wi-Fi', 'Everything is included', 'Nothing is included'], correctIndex: 1, explanation: 'Agent confirmed: "Water and high-speed Wi-Fi are fully included".' },
        { id: 'q2', question: 'What is the minimum lease period?', options: ['1 month', '6 months', '1 year', '2 years'], correctIndex: 1, explanation: 'Agent said: "We require a minimum 6-month lease".' }
      ]),
      tips: '"Bond" adalah uang jaminan sewa rumah yang disimpan oleh badan resmi pemerintah setempat.'
    },
    {
      title: 'Discussing Weekend Travel Plans',
      category: 'SOCIAL',
      difficulty: 'B1',
      audioDurationSec: 40,
      dialogueJson: JSON.stringify([
        { speaker: 'Lucas', text: 'Hey Rian, a bunch of us are renting a van to drive down the Great Ocean Road this weekend. Have you been there yet?' },
        { speaker: 'Rian', text: 'Not yet! I have seen stunning photos of the Twelve Apostles rock formations, though. How long is the drive?' },
        { speaker: 'Lucas', text: 'About four hours each way, so we will camp out near Apollo Bay on Saturday night and head back Sunday afternoon. Want to come along?' },
        { speaker: 'Rian', text: 'Count me in! That sounds like an unforgettable road trip. Let me know how much my share of gas and camping fees will be.' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'Where is the group traveling this weekend?', options: ['Blue Mountains', 'The Great Ocean Road', 'Gold Coast', 'Uluru'], correctIndex: 1, explanation: 'Lucas said: "drive down the Great Ocean Road this weekend".' },
        { id: 'q2', question: 'Where will they stay Saturday night?', options: ['A luxury hotel', 'Camping near Apollo Bay', 'In the van on the highway', 'Airbnb in Melbourne'], correctIndex: 1, explanation: 'Lucas said: "camp out near Apollo Bay on Saturday night".' }
      ]),
      tips: '"Count me in!" adalah ungkapan santai yang sangat natural untuk mengatakan "Saya ikut!".'
    },
    {
      title: 'Ordering Takeout on a Rainy Evening',
      category: 'RESTAURANT',
      difficulty: 'A2',
      audioDurationSec: 35,
      dialogueJson: JSON.stringify([
        { speaker: 'Server', text: 'Thai Orchid, how can I help you?' },
        { speaker: 'Customer', text: 'Hi, I would like to place a pickup order for one chicken Pad Thai and two vegetable spring rolls.' },
        { speaker: 'Server', text: 'Sure thing. How spicy would you like the Pad Thai? Mild, medium, or hot?' },
        { speaker: 'Customer', text: 'Medium spice please. How long will it take to be ready?' },
        { speaker: 'Server', text: 'It will be ready for pickup in about fifteen to twenty minutes. Your name, please?' },
        { speaker: 'Customer', text: 'Rian. Thank you!' }
      ]),
      questionsJson: JSON.stringify([
        { id: 'q1', question: 'What dishes did the customer order?', options: ['Green curry and rice', 'Chicken Pad Thai and two vegetable spring rolls', 'Beef noodles', 'Fried rice and soup'], correctIndex: 1, explanation: 'Customer ordered: "one chicken Pad Thai and two vegetable spring rolls".' },
        { id: 'q2', question: 'What spice level was selected?', options: ['Mild', 'Medium', 'Hot', 'Extra hot'], correctIndex: 1, explanation: 'Customer selected: "Medium spice please".' }
      ]),
      tips: 'Sebutkan jenis pemesanan: "pickup order" (ambil sendiri) atau "delivery" (antar).'
    }
  ];

  for (const ex of listeningExercises) {
    const existing = await prisma.listeningExercise.findFirst({
      where: { title: ex.title }
    });
    if (!existing) {
      await prisma.listeningExercise.create({
        data: ex
      });
    }
  }
  console.log(`Listening exercises (20 curated dialogues) seeded successfully.`);

  // 4. Initial Vocabulary Library with 30+ practical phrases
  const vocabItems = [
    {
      phrase: "Could you tell me where...",
      translation: "Bisakah Anda memberi tahu saya di mana...",
      exampleSentence: "Excuse me, could you tell me where the campus library is located?",
      context: "Asking directions politely",
      topic: "Directions",
      difficulty: "Easy"
    },
    {
      phrase: "I didn't quite catch that",
      translation: "Saya tadi tidak begitu menangkap/mendengar perkataan itu",
      exampleSentence: "I am sorry, I didn't quite catch that. Would you mind repeating?",
      context: "Clarification without awkwardness",
      topic: "Survival",
      difficulty: "Easy"
    },
    {
      phrase: "For here or to go?",
      translation: "Makan di sini atau dibawa pulang?",
      exampleSentence: "The cashier asked if my breakfast order was for here or to go.",
      context: "Cafe & restaurant orders",
      topic: "Food",
      difficulty: "Easy"
    },
    {
      phrase: "Off the top of my head",
      translation: "Secara spontan / tanpa berpikir lama",
      exampleSentence: "Off the top of my head, I think lecture hall B is on the second floor.",
      context: "Conversational transition",
      topic: "Fluency",
      difficulty: "Medium"
    },
    {
      phrase: "Hit a roadblock",
      translation: "Mengalami hambatan / jalan buntu",
      exampleSentence: "Our group hit a roadblock while configuring the server deployment.",
      context: "Explaining problems & projects",
      topic: "Academic",
      difficulty: "Medium"
    },
    {
      phrase: "Broaden one's horizons",
      translation: "Memperluas wawasan dan sudut pandang",
      exampleSentence: "Studying abroad allows students to broaden their horizons and embrace diversity.",
      context: "Interviews & goal discussions",
      topic: "Academic",
      difficulty: "Medium"
    },
    {
      phrase: "Split the bill",
      translation: "Membagi tagihan makanan secara merata",
      exampleSentence: "Shall we split the bill three ways, or pay separately?",
      context: "Dining with friends",
      topic: "Social",
      difficulty: "Easy"
    },
    {
      phrase: "Come out wrong",
      translation: "Terdengar salah / tidak sesuai maksud sebenarnya",
      exampleSentence: "I apologize if my comment came out wrong, I truly meant to support your idea.",
      context: "Resolving misunderstandings",
      topic: "Social",
      difficulty: "Hard"
    },
    {
      phrase: "Out of order",
      translation: "Rusak / tidak beroperasi",
      exampleSentence: "The subway ticket vending machine was out of order, so I queued at the booth.",
      context: "Public transit",
      topic: "Transit",
      difficulty: "Easy"
    },
    {
      phrase: "Hands-on experience",
      translation: "Pengalaman praktik kerja secara langsung",
      exampleSentence: "During my internship in Indonesia, I gained hands-on experience in full-stack development.",
      context: "Explaining projects & interviews",
      topic: "Professional",
      difficulty: "Medium"
    },
    {
      phrase: "Cut straight to the chase",
      translation: "Langsung ke inti pokok masalah",
      exampleSentence: "To cut straight to the chase, we need to submit our visa applications by Friday.",
      context: "Natural speaking flow",
      topic: "Fluency",
      difficulty: "Hard"
    },
    {
      phrase: "Over-the-counter",
      translation: "Obat bebas yang dapat dibeli tanpa resep dokter",
      exampleSentence: "You can purchase throat lozenges over-the-counter at the chemist.",
      context: "Healthcare & pharmacy",
      topic: "Healthcare",
      difficulty: "Medium"
    },
    {
      phrase: "Mind if I sit here?",
      translation: "Boleh saya duduk di sini?",
      exampleSentence: "Excuse me, mind if I sit here? All the other tables in the cafeteria are taken.",
      context: "Making friends on campus",
      topic: "Social",
      difficulty: "Easy"
    },
    {
      phrase: "Touch base",
      translation: "Menghubungi sebentar untuk memperbarui kabar / koordinasi",
      exampleSentence: "Let us touch base tomorrow afternoon to review our slide presentation.",
      context: "Academic group work",
      topic: "Academic",
      difficulty: "Medium"
    },
    {
      phrase: "Keep in touch",
      translation: "Tetap saling berkabar",
      exampleSentence: "It was wonderful meeting you! Let us keep in touch on WhatsApp.",
      context: "Parting politely",
      topic: "Social",
      difficulty: "Easy"
    }
  ];

  for (const v of vocabItems) {
    const existing = await prisma.vocabularyItem.findFirst({
      where: { userId: user.id, phrase: v.phrase }
    });
    if (!existing) {
      await prisma.vocabularyItem.create({
        data: {
          userId: user.id,
          phrase: v.phrase,
          translation: v.translation,
          exampleSentence: v.exampleSentence,
          context: v.context,
          topic: v.topic,
          difficulty: v.difficulty,
          masteryLevel: 1,
          intervalDays: 1,
          easeFactor: 2.5,
          repetitions: 1,
          nextReviewDate: new Date()
        }
      });
    }
  }
  console.log(`Vocabulary items seeded successfully.`);

  // 5. Daily Challenges
  const today = new Date().toISOString().split('T')[0];
  await prisma.dailyChallenge.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      title: "Introduce Your Background in 60 Seconds",
      description: "Practice spontaneous speaking: record or speak out loud your name, hometown, university field, and one reason why traveling abroad in 2027 matters to you.",
      targetSkill: "SPEAKING",
      targetMinutes: 10,
      difficulty: "Medium",
      prompt: "Tell me about yourself, what you study in Indonesia, and what excites you about going abroad!"
    }
  });

  // Seed sample initial learning sessions for realistic streak & progress
  const sessionCount = await prisma.learningSession.count({ where: { userId: user.id } });
  if (sessionCount === 0) {
    await prisma.learningSession.createMany({
      data: [
        {
          userId: user.id,
          activityType: 'LISTENING',
          durationMinutes: 20,
          score: 90,
          createdAt: new Date(Date.now() - 24 * 3600 * 1000)
        },
        {
          userId: user.id,
          activityType: 'SPEAKING',
          durationMinutes: 30,
          score: 85,
          createdAt: new Date(Date.now() - 24 * 3600 * 1000)
        },
        {
          userId: user.id,
          activityType: 'VOCABULARY',
          durationMinutes: 15,
          score: 100,
          createdAt: new Date(Date.now() - 24 * 3600 * 1000)
        }
      ]
    });
  }

  // Seed an initial Journal Entry
  const journalCount = await prisma.journalEntry.count({ where: { userId: user.id } });
  if (journalCount === 0) {
    await prisma.journalEntry.create({
      data: {
        userId: user.id,
        title: "First Day Practicing with FluentAbroad AI",
        content: "Hari ini saya mulai latihan berbicara bahasa Inggris lagi. Rasanya masih agak terbata-bata dan sering menerjemahkan di kepala terlebih dahulu. Tapi waktu mencoba frasa 'off the top of my head' dan 'I didn't quite catch that', percakapan terasa jauh lebih santai.",
        difficulties: "Kadang bingung memilih kata kerja bentuk lampau saat menjelaskan proyek kuliah.",
        newPhrases: "off the top of my head, get settled in, broaden my horizons",
        confidenceRating: 3
      }
    });
  }

  console.log('Seeding complete! FluentAbroad AI database is fully primed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

