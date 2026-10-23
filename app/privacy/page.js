import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | DaySpring Chapel',
    description:
        'How DaySpring Chapel collects, uses and protects personal information, including how the website uses YouTube API Services.',
};

const CONTACT_EMAIL = 'dayspringchapelmedia@gmail.com';
const LAST_UPDATED = '23 October 2026';

function Section({ title, children }) {
    return (
        <section className="mt-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{title}</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">{children}</div>
        </section>
    );
}

export default function PrivacyPolicyPage() {
    return (
        <main className="bg-white">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16">
                <h1 className="text-3xl md:text-4xl font-bold uppercase text-gray-900">Privacy Policy</h1>
                <p className="mt-2 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

                <p className="mt-6 text-gray-700 leading-relaxed">
                    This policy explains what information the DaySpring Chapel website and its supporting services
                    (together, &ldquo;DaySpring Chapel&rdquo;, &ldquo;we&rdquo; or &ldquo;the app&rdquo;) collect, why we collect it,
                    and the choices you have. DaySpring Chapel is an arm of Victory Life Bible Church. The website is
                    available at <a className="text-primary underline" href="https://dayspring-ui.vercel.app/">https://dayspring-ui.vercel.app/</a>.
                </p>

                <Section title="Information we collect and why">
                    <ul className="list-disc pl-6 space-y-2">
                        <li>
                            <strong>Appointment requests.</strong> Your name, email address, phone number, preferred meeting venue and the
                            reason for your request. We use it only to schedule and respond to your request.
                        </li>
                        <li>
                            <strong>Newsletter.</strong> Your email address, so we can send you church updates. You can ask to be removed at any time.
                        </li>
                        <li>
                            <strong>Comments.</strong> If you comment under a video, the name you type and your comment text. To limit spam, your
                            internet address is used briefly in the server&rsquo;s memory to count how often a comment is posted; it is not
                            saved with your comment.
                        </li>
                        <li>
                            <strong>Church members and staff.</strong> Church staff and volunteers who sign in to the admin area have an
                            account (name, email, role). Member records, such as contact details, units and small groups, are entered by authorised church staff.
                        </li>
                        <li>
                            <strong>Giving.</strong> The Giving page only shows the church&rsquo;s bank account details. We do not process
                            payments or collect card or bank details from visitors.
                        </li>
                        <li>
                            <strong>Technical information.</strong> Our hosting providers keep standard server logs (such as the page requested and
                            the time). Signed-in staff have a sign-in token stored in their browser. The site also keeps copies of public pages and
                            images in your browser so they load faster and work offline. We do not use advertising or tracking cookies.
                        </li>
                    </ul>
                </Section>

                <Section title="YouTube API Services and Google user data">
                    <p>
                        Our website embeds YouTube videos and shows comments made under those videos. To do this, DaySpring Chapel&rsquo;s own
                        server connects to YouTube using authorisation given by the church&rsquo;s YouTube channel owner. That connection is used to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>create and end live broadcasts on the church&rsquo;s own channel;</li>
                        <li>read the public comments on the church&rsquo;s own videos so they can be shown on our website next to the video; and</li>
                        <li>let authorised church staff hide or remove comments on the church&rsquo;s own videos.</li>
                    </ul>
                    <p>
                        <strong>We do not ask website visitors to sign in with Google, and we do not collect or store Google account data from visitors.</strong>{' '}
                        The only Google user data the app handles is the church channel owner&rsquo;s authorisation (an access token) and the
                        public comment information that YouTube already shows publicly (the commenter&rsquo;s display name, profile picture and comment text).
                        We store those public comments so we can display them on our website, and we remove a comment from our site when it is
                        deleted on YouTube or when a moderator removes it.
                    </p>
                    <p>
                        We use this information only to provide and improve these features for the church&rsquo;s own channel. We do not sell it,
                        use it for advertising, or transfer it to others except as needed to run the service or as the law requires. The
                        app&rsquo;s use and transfer of information received from Google APIs adheres to the{' '}
                        <a className="text-primary underline" href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
                            Google API Services User Data Policy
                        </a>
                        , including its Limited Use requirements. By using the video features of this website you are also subject to the{' '}
                        <a className="text-primary underline" href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube Terms of Service</a>{' '}
                        and the{' '}
                        <a className="text-primary underline" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.
                    </p>
                    <p>
                        The channel owner can withdraw the app&rsquo;s access at any time from their Google Account at{' '}
                        <a className="text-primary underline" href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
                            myaccount.google.com/permissions
                        </a>
                        .
                    </p>
                </Section>

                <Section title="Who we share information with">
                    <p>
                        We do not sell personal information. We use trusted service providers to run the website: Vercel (website hosting),
                        Render (application hosting), Neon (database), Cloudinary (image, audio and video storage) and YouTube (video). They process
                        information only on our behalf. When church staff share content on social platforms or messaging services, that content is
                        what the church chooses to publish, not your personal details. We may also disclose information if the law requires it.
                    </p>
                </Section>

                <Section title="How long we keep information">
                    <p>
                        We keep appointment and member information for as long as it is needed for church ministry and record keeping. Newsletter
                        subscriptions are kept until you ask to be removed. Event media is removed automatically some time after the event, while
                        anonymous totals used for reports are kept. You can ask us to correct or delete your information at any time.
                    </p>
                </Section>

                <Section title="Your choices">
                    <p>
                        To see, correct or delete the information we hold about you, to stop newsletter emails, or to have a comment removed,
                        email us at <a className="text-primary underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will respond
                        as soon as we reasonably can.
                    </p>
                </Section>

                <Section title="Children">
                    <p>
                        The public website is not directed at children, and we do not knowingly collect personal information from children through it.
                        Records about members&rsquo; children are entered by authorised church staff.
                    </p>
                </Section>

                <Section title="Security">
                    <p>
                        Connections to the website are encrypted, staff access is controlled by individual accounts and permissions, and passwords are
                        stored in hashed form. No online service can be completely secure, but we take reasonable steps to protect your information.
                    </p>
                </Section>

                <Section title="Changes to this policy">
                    <p>
                        We may update this policy from time to time. The date at the top shows when it was last changed.
                    </p>
                </Section>

                <Section title="Contact us">
                    <p>
                        DaySpring Chapel, an arm of Victory Life Bible Church.<br />
                        Email: <a className="text-primary underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                    </p>
                </Section>

                <p className="mt-12 text-sm">
                    <Link href="/" className="text-primary underline">Back to the home page</Link>
                </p>
            </div>
        </main>
    );
}
