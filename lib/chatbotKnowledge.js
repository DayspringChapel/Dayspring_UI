// Rule-based knowledge base for the DaySpring Assistant.
// Each topic is tried in order; the first one whose `test` matches the
// normalized user message wins. Keep `test` keyword lists broad — users
// phrase the same question many different ways.

function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Word-boundary match so short keywords (e.g. "hi") don't false-positive
// inside unrelated words (e.g. "history").
function anyWord(msg, words) {
    return words.some((w) => new RegExp(`\\b${escapeRegExp(w)}\\b`, 'i').test(msg));
}

const GREETING_REPLY =
    "Hi! I'm the DaySpring Assistant 👋 How can I help you today? You can ask me about our services, events, how to book an appointment, or anything else about the church.";

export const TOPICS = [
    {
        id: 'greeting',
        test: (msg) => anyWord(msg, [
            'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
            'who are you', 'what are you', 'what can you do', 'help',
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
    {
        id: 'service-times',
        test: (msg) => anyWord(msg, ['service time', 'service times', 'what time', 'when is service', 'when do you meet', 'sunday service', 'bible study', 'prayer meeting', 'when is church', 'worship time']),
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
        test: (msg) => anyWord(msg, ['where', 'location', 'address', 'located', 'direction', 'find you', 'map', 'venue']),
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
        test: (msg) => anyWord(msg, ['event', 'events', 'upcoming', 'program', 'programme', 'what is happening', "what's happening", 'happening this week']),
        answer:
            "You can see everything coming up — with dates, locations, and countdowns — on our Events page: /events. " +
            "Past events are listed there too if you'd like to catch up on what you missed.",
    },
    {
        id: 'giving',
        test: (msg) => anyWord(msg, ['give', 'giving', 'donate', 'donation', 'tithe', 'offering', 'pay', 'account number', 'account details', 'bank details']),
        answer:
            "Thank you for your heart to give! Visit our Giving page at /donate — choose the purpose you'd like to give toward (e.g. tithe, offering, building fund), then reveal the account details to give via bank transfer. " +
            "\"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.\" — 2 Corinthians 9:7",
    },
    {
        id: 'library',
        test: (msg) => anyWord(msg, ['sermon', 'sermons', 'preach', 'message', 'messages', 'book', 'books', 'library', 'teaching', 'teachings', 'listen', 'watch a sermon']),
        answer:
            "Our Library at /library has audio and video sermons as well as a collection of Christian books to help you grow spiritually. " +
            "You can filter by preacher, series, or type (audio/video) once you're there.",
    },
    {
        id: 'gallery',
        test: (msg) => anyWord(msg, ['gallery', 'photo', 'photos', 'picture', 'pictures']),
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
        id: 'leadership',
        test: (msg) => anyWord(msg, ['pastor', 'leader', 'leadership', 'who leads', 'who is the pastor', 'senior pastor']),
        answer:
            "Our Pastor is Pastor Eniola Fabusoro, and our Associate Pastor is Pastor (Mrs) Busola Fabusoro. " +
            "You can see our full leadership structure on the About page: /about",
    },
    {
        id: 'small-groups',
        test: (msg) => anyWord(msg, ['small group', 'small groups', 'department', 'departments', 'unit', 'units', 'join a group', 'get involved', 'volunteer']),
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
];

export const FALLBACK_ANSWER =
    "I'm not totally sure about that one. I can help with our service times, location, events, appointments, sermons/books in our Library, giving, and general info about DaySpring Chapel. " +
    "For anything more specific, please reach out through our Appointment page (/appointment) and our team will follow up with you directly.";
