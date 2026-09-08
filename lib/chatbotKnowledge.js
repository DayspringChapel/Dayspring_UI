// Rule-based knowledge base for the DaySpring Assistant.
// Each topic is tried in order; the first one whose `test` matches the
// normalized user message wins. Keep `test` keyword lists broad — users
// phrase the same question many different ways.
//
// ORDERING MATTERS: topics with specific, unambiguous triggers (service
// times, giving, appointments...) are listed before topics with short,
// generic triggers (greeting, thanks, leadership's bare "pastor"...). That
// way "hi, what time is service" matches service-times instead of being
// swallowed by the "hi" greeting, and "thanks for the info about giving"
// matches giving instead of just "thanks". Greeting/thanks/bye are checked
// last, right before the fallback, so they only fire when nothing more
// specific matched.

function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Word-boundary match so short keywords (e.g. "hi") don't false-positive
// inside unrelated words (e.g. "history"). Trailing "s?" lets a singular
// keyword also catch its plural (e.g. "direction" catches "directions")
// without having to list both forms everywhere.
function anyWord(msg, words) {
    return words.some((w) => new RegExp(`\\b${escapeRegExp(w)}s?\\b`, 'i').test(msg));
}

const GREETING_REPLY =
    "Hi! I'm the DaySpring Assistant 👋 How can I help you today? You can ask me about our services, events, how to book an appointment, or anything else about the church.";

export const TOPICS = [
    {
        id: 'service-times',
        test: (msg) => anyWord(msg, [
            'service time', 'what time', 'when is service', 'when do you meet', 'sunday service',
            'bible study', 'prayer meeting', 'when is church', 'worship time', 'meeting time',
            'church service', 'church program', 'church programme', 'service', 'services',
        ]),
        answer:
            "Our regular gathering times are:\n" +
            "• Sunday First Service — 7:00 AM\n" +
            "• Sunday Second Service — 8:00 AM\n" +
            "• Wednesday Bible Study — 5:30 PM\n" +
            "• Friday Prayer Meeting — 6:00 PM\n\n" +
            "Times can occasionally change for special programs, so it's a good idea to check our Events page or confirm with the church office if you're planning a first visit.",
    },
    {
        id: 'location',
        // NOTE: no bare "where" — it prefixes questions about lots of other
        // topics ("where do I give", "where can I watch the sermon"), so it
        // needs to be paired with a location-specific word to count.
        test: (msg) => anyWord(msg, [
            'location', 'address', 'located', 'direction', 'find you', 'map', 'venue',
            'where are you', 'where is the church', 'where is dayspring', 'where do you meet',
            'where can i find you', 'how do i get there', 'get there',
        ]),
        answer:
            "We're located at DaySpring Chapel, Obantoko, Conoil, Abeokuta, Ogun State, Nigeria. " +
            "You'll find a map and a \"Get Directions\" link in the footer of our website to guide you here.",
    },
    {
        id: 'appointment',
        test: (msg) => anyWord(msg, ['appointment', 'book a meeting', 'meet the pastor', 'counsel', 'counselling', 'counseling', 'schedule a', 'talk to someone', 'talk to a pastor']),
        answer:
            "You can request a meeting with our pastoral team on the Appointment page. " +
            "Just share your name, email, and phone number, choose whether you'd prefer to meet Online, at the Church Office, or via a Home Visit, and tell us the purpose of the meeting. " +
            "We'll get back to you as soon as possible. You can start here: /appointment",
    },
    {
        id: 'events',
        test: (msg) => anyWord(msg, ['event', 'upcoming', 'program', 'programme', 'what is happening', "what's happening", 'happening this week']),
        answer:
            "You can see everything coming up — with dates, locations, and countdowns — on our Events page: /events. " +
            "Past events are listed there too if you'd like to catch up on what you missed.",
    },
    {
        id: 'giving',
        // NOTE: deliberately no bare "give" or "pay" here — those are too
        // generic and false-positive on unrelated phrasing like "give me
        // directions" or "give me church services". Require a clearer
        // giving-specific word or phrase instead.
        test: (msg) => anyWord(msg, [
            'giving', 'donate', 'donation', 'tithe', 'offering', 'contribute', 'contribution',
            'want to give', 'wish to give', 'how to give', 'give offering', 'give tithe',
            'give to the church', 'give online', 'ways to give', 'account number', 'account details', 'bank details',
        ]),
        answer:
            "Thank you for your heart to give! Visit our Giving page at /donate — choose the purpose you'd like to give toward (e.g. tithe, offering, building fund), then reveal the account details to give via bank transfer. " +
            "\"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.\" — 2 Corinthians 9:7",
    },
    {
        id: 'library',
        // NOTE: no bare "message" or "listen" — both are common in unrelated
        // sentences ("did you get my message", "please listen to my prayer
        // request") and would wrongly hijack those.
        test: (msg) => anyWord(msg, [
            'sermon', 'preach', 'book', 'library', 'teaching', 'watch a sermon',
            'listen to a sermon', 'audio sermon', 'video sermon', 'sermon message',
        ]),
        answer:
            "Our Library at /library has audio and video sermons as well as a collection of Christian books to help you grow spiritually. " +
            "You can filter by preacher, series, or type (audio/video) once you're there.",
    },
    {
        id: 'gallery',
        test: (msg) => anyWord(msg, ['gallery', 'photo', 'picture']),
        answer: "You can browse photos from our services and events in the Gallery: /gallery",
    },
    {
        id: 'livestream',
        test: (msg) => anyWord(msg, ['livestream', 'live stream', 'live now', 'watch online', 'watch live', 'stream']),
        answer:
            "When we're live, you'll see a \"LIVE NOW\" button on our Home page where you can watch on YouTube, Facebook, or Instagram. " +
            "If nothing's live right now, we're not currently streaming — check back around service time.",
    },
    {
        id: 'about-history',
        test: (msg) => anyWord(msg, ['history', 'founded', 'when did you start', 'about dayspring', 'about the church', 'what is dayspring', 'vision', 'mission', 'who is dayspring']),
        answer:
            "DaySpring Chapel was established in August 2012 by Victory Life Bible Church, as a modern-day center for young elites and students to worship in a contemporary, supernatural atmosphere. " +
            "Our vision is a place where purpose is discovered, potentials are built, and dreams are fulfilled. You can read more on our About page: /about",
    },
    {
        id: 'small-groups',
        test: (msg) => anyWord(msg, ['small group', 'department', 'unit', 'join a group', 'get involved', 'volunteer']),
        answer:
            "We'd love to have you get involved! The best way is to visit us in person or reach out through our Appointment page (/appointment) so our team can connect you with a small group or department that fits you.",
    },
    {
        id: 'prayer',
        test: (msg) => anyWord(msg, ['pray for', 'prayer request', 'please pray', 'need prayer', 'pray for me']),
        answer:
            "Thank you for sharing that with us — our church community cares about you and is praying with you. " +
            "For personal follow-up, you're welcome to request a pastoral appointment at /appointment and let us know more.",
    },
    {
        id: 'contact',
        test: (msg) => anyWord(msg, ['contact', 'phone number', 'call you', 'email', 'reach you', 'whatsapp']),
        answer:
            "The best way to reach us directly is by requesting a pastoral appointment at /appointment — share your phone number or email there and our team will get back to you. " +
            "You're also always welcome to visit us in person at a service.",
    },
    {
        // Checked late on purpose — bare "pastor"/"leader" are generic enough
        // to appear inside prayer requests or appointment/contact requests
        // ("please pray for my pastor", "book a meeting with the pastor"),
        // which should win over this one.
        id: 'leadership',
        test: (msg) => anyWord(msg, ['leadership', 'who leads', 'who is the pastor', 'senior pastor', 'pastor', 'leader']),
        answer:
            "Our Pastor is Pastor Eniola Fabusoro, and our Associate Pastor is Pastor (Mrs) Busola Fabusoro. " +
            "You can see our full leadership structure on the About page: /about",
    },
    {
        // Checked last of all: "hi"/"hey" are short enough to appear inside
        // a longer question ("hi, what time is service"), so anything more
        // specific above should win first.
        id: 'greeting',
        test: (msg) => anyWord(msg, [
            'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
            'who are you', 'what are you', 'what can you do',
        ]),
        answer: GREETING_REPLY,
    },
    {
        id: 'thanks',
        test: (msg) => anyWord(msg, ['thank', 'thanks', 'appreciate', 'bless you', 'thx']),
        answer: "You're very welcome! Is there anything else I can help you with?",
    },
    {
        id: 'bye',
        test: (msg) => anyWord(msg, ['bye', 'goodbye', 'see you', 'that is all', "that's all", 'no more questions']),
        answer: "Take care, and God bless you! Feel free to come back anytime you have a question. 🙏",
    },
];

export const FALLBACK_ANSWER =
    "I'm not totally sure about that one. I can help with our service times, location, events, appointments, sermons/books in our Library, giving, and general info about DaySpring Chapel. " +
    "For anything more specific, please reach out through our Appointment page (/appointment) and our team will follow up with you directly.";
