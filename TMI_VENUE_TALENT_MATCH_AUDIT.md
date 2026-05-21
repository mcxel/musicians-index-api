# TMI VENUE & TALENT MATCH AUDIT

This audit enforces the structural and functional completeness of the Venue, Ticket, and Talent Booking systems. 

## 1. Area: World Concert Billboard + Concert Access Economy
- [ ] Does the `/billboards/world-concerts` page exist and is it separate from ranking billboards?
- [ ] Do live preview cards exist for each concert?
- [ ] Does each card instantly show the correct join rule based on the viewer's tier (e.g., "$1 Join" vs "Included")?
- [ ] Can Free/Bronze/Pro users pay $1 to join?
- [ ] Do Gold/Platinum/Diamond users bypass the paywall and join for free?
- [ ] Does the artist receive paid join revenue (e.g., 70 cents on $1 joins)?
- [ ] Does the artist receive premium participation credits for Gold+ joins?
- [ ] Is every transaction and entry written to the ledger?
- [ ] Is Stripe connected for payment intents, success, and payouts?

## 2. Area: Venue Billboard + Ticket Economy
- [ ] Can venues sign up via `/venue/signup`?
- [ ] Can venues create events and set low-cost ticket pricing ($0.75 - $9.99)?
- [ ] Do venue events automatically push to the Global Venue Billboard?
- [ ] Can users filter the billboard by proximity ("Near Me"), genre, and price?
- [ ] Can users buy tickets and is ownership tracked in the Ownership Engine?
- [ ] Does the Seat Binding Engine enforce seat/zone limits and prevent duplicate tickets?
- [ ] Does the Access Engine check tickets before granting room entry?
- [ ] Is revenue split correctly (Venue/Artist/Platform) and payouts triggered?
- [ ] Is the Fraud Engine checking for duplicate tickets and abuse?

## 3. Area: Venue Talent Match + Booking Logistics Engine
- [ ] Does talent suggestion automatically trigger after a venue creates a ticket campaign?
- [ ] Do performer suggestions appear as animated, floating bubble cards?
- [ ] Do suggestions use real distance/location and genre match logic?
- [ ] Can the venue select artists and set an offer price?
- [ ] Can travel, hotel, and ride logistics be added to the offer transparently?
- [ ] Does the Booking Calculator show a live breakdown of artist pay, platform fee, and logistics?
- [ ] Does the artist receive the detailed offer and can they accept/decline?
- [ ] Does the Ledger record the full deal, logistics costs, and fee splits?

## 4. Area: Venue Talent Discovery + Fair Rotation System
- [ ] Are performers ranked by real fan/stream signals rather than just raw popularity?
- [ ] Are multiple talent types included (musicians, comedians, hosts, DJs) in the bubble sets?
- [ ] Is the Exposure Fairness Engine enforcing cooldowns so the same artist isn't surfaced repeatedly?
- [ ] Can venues move forward/back through bubble sets to discover more talent?
- [ ] Are previous suggestions searchable and pinnable?
- [ ] Does the suggestion layer feel alive, colorful, and match the TMI 80s neon magazine visual style?