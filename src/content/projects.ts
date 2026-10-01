/**
 * Project content for the DesignUp showreel + overviews.
 *
 * Source of truth: the LIVE portfolio (vimaladesigner.vercel.app, source in
 * ~/Documents/Sept 2026/src/v3/data/caseStudies.ts) and the resume it cites.
 * Copy is Vimala's own wording from there, condensed. Two reel-only lines
 * come from the earlier portfolio at the brief's request (see REEL_FACTS).
 * Nothing is invented.
 */

import { CI_URL } from './career'

export type Screen = {
  src: string
  alt: string
  caption: string
  /** Transparent PNG / UI crop: shown contained on a panel, never cropped. */
  panel?: boolean
}

export type Decision = {
  heading: string
  decision: string
  why: string
  image?: Screen
  /** Shown in place of an image when the decision has no product UI. */
  note?: string
}

export type Project = {
  id: 'youclean' | 'cornerstone' | 'flyin' | 'civtech' | 'career'
  /** Route on the live portfolio. */
  liveSlug: string
  /** Where "Explore" goes when it isn't a live-portfolio case study (and how it's labelled). */
  external?: { url: string; label: string; hint: string }
  /** Show the intelligence-layer ecosystem section on the overview. */
  ecosystem?: boolean
  index: string
  shortName: string
  name: string
  company: string
  category: string
  dimension: string
  roleTitle: string
  period: string
  lede: string
  thesis: string
  highlights: string[]
  decisions: Decision[]
  cover: Screen
  screens: Screen[]
  /** Accent used for this project's scene in the reel. */
  tint: string
}

export const PORTFOLIO_URL = 'https://vimaladesigner.vercel.app'

export const caseStudyUrl = (p: Project) => p.external?.url ?? `${PORTFOLIO_URL}/work/${p.liveSlug}`

const img = {
  ycCover: { src: '/img/youclean/dashboard.jpg', alt: 'YouClean CRM dashboard: orders, revenue, in progress, ready for pickup, revenue trend, today’s schedule and recent orders.', caption: 'The CRM and operations system behind YouClean Laundry.' },
  ycTracking: { src: '/img/youclean/tracking.jpg', alt: 'Customer order tracking: order confirmed, processing, out for delivery, delivered.', caption: 'Customers follow the same order states the store works from.', panel: true },
  ycDash: { src: '/img/youclean/dashboard.jpg', alt: 'YouClean dashboard: total orders, revenue, in progress, ready for pickup with Notify customers, revenue trend, service distribution, today’s schedule, low inventory, quick actions.', caption: '“Ready for pickup” sits directly above “Notify customers”: the state and its next step together.', panel: true },
  ycMobile: { src: '/img/youclean/mobile.jpg', alt: 'YouClean mobile: the store’s day, and the order list filtered by state.', caption: 'The same states on mobile: the store’s day, and every order filtered by where it is.', panel: true },
  csCover: { src: '/img/cornerstone/cover.jpg', alt: 'Cornerstone Content Manager on a laptop, showing Apollo AI recommendations and the all-content table.', caption: 'Cornerstone Content Manager.' },
  csPanel: { src: '/img/cornerstone/ai-panel.png', alt: 'Create material form with the Apollo AI panel: title, description, subjects, keywords and skills each drafted and marked Added.', caption: 'Each field is drafted separately and marked “Added”. The form stays editable.', panel: true },
  csAssist: { src: '/img/cornerstone/assistant.png', alt: 'Assistant panel offering Resume smart edit and Add translations for the current page.', caption: 'Actions are scoped to the current page and started by the author.', panel: true },
  csTranslate: { src: '/img/cornerstone/translate.png', alt: 'Assistant summarising the applied fields, then offering eight languages with Translate all or Translate selected.', caption: 'A plain summary of what was applied, then a choice: translate all, or only what the author selects.', panel: true },
  flCover: { src: '/img/flyin/cover.jpg', alt: 'Flyin desktop search homepage on a laptop beside the Flyin mobile app home screen.', caption: 'Flyin search, across web and app.' },
  flDesktop: { src: '/img/flyin/desktop.jpg', alt: 'Flyin desktop homepage with flight search and current deals.', caption: 'Flight search on web.' },
  flMobile: { src: '/img/flyin/mobile.jpg', alt: 'Flyin mobile app home with flights, hotels, packages and cars.', caption: 'The app home.', panel: true },
  flHotel: { src: '/img/flyin/hotel.jpg', alt: 'Flyin hotel details page with room options and pricing.', caption: 'Hotel details and room selection.', panel: true },
  cvCover: { src: '/img/civtech/cover.jpg', alt: 'Menopause Care concept cover, “Support through change”, with four support pillars.', caption: 'An AI-powered concept for inclusive, accessible and connected menopause care.' },
  cvJourney: { src: '/img/civtech/journey-map.jpg', alt: 'Care journey map from awareness through GP, diagnosis, treatment and specialist care, with wait times highlighted.', caption: 'The journey as disconnected stages, with wait-time friction highlighted.', panel: true },
  cvStructure: { src: '/img/civtech/structure.jpg', alt: 'Map of responsibility for menopause care in Scotland, from national policy to providers.', caption: 'Responsibility for care, from national policy down to individual providers.', panel: true },
  cvBrainstorm: { src: '/img/civtech/brainstorm.jpg', alt: 'Team journey brainstorm board.', caption: 'Eight research inputs, one investigation.' },
  ciHero: { src: '/img/career/hero.jpg', alt: 'Career Intelligence home: “Your portfolio tells a story.” Lines of evidence converge into one signal.', caption: 'The working prototype: Portfolio Intelligence.' },
  ciReading: { src: '/img/career/reading.jpg', alt: 'Sample reading: the claim “I design products for complexity”, three excerpts converging into the signal “Systems before screens”, the gap “Design systems”, and the next move.', caption: 'A claim, the excerpts that test it, the signal or the gap, and one next move.', panel: true },
  ciAttention: { src: '/img/career/attention.jpg', alt: 'Attention Intelligence sample: 18 visits, 13 opened Ledger, 10 opened Atlas, 7 opened About, and a repeated path.', caption: 'Attention Intelligence on sample data: a fictional portfolio, nothing real was tracked.', panel: true },
  ciObserve: { src: '/img/career/observe.jpg', alt: '“We can observe behaviour. We cannot know intent.” Observed, interpreted and never claimed, side by side.', caption: 'What was observed, what can be interpreted, and what is never claimed.' },
} satisfies Record<string, Screen>

export const PROJECTS: Project[] = [
  {
    id: 'youclean',
    liveSlug: 'youclean',
    index: '01',
    shortName: 'YouClean',
    name: 'YouClean CRM',
    company: 'YouClean Laundry',
    category: 'Service · Product · Business systems',
    dimension: 'Ownership, 0 → 1',
    roleTitle: 'Founder & UX/Brand Designer',
    period: 'Jun 2022 – Present',
    lede: 'Building the product while running the business changed how I approached the design. The goal wasn’t a feature-rich CRM. It was to remove operational friction without adding another layer of complexity.',
    thesis: 'The CRM and operations system behind YouClean Laundry: orders, customers, pickups, deliveries, payments and inventory in one place.',
    highlights: ['~30% revenue growth', '~25% improvement in customer retention', '~40% faster go-to-market', '4.7★ · 290+ reviews'],
    decisions: [
      {
        heading: 'Put the next action where the state is',
        decision: '“Ready for pickup” carries its own “Notify customers” action, and quick actions cover the day’s common starts: create an order, add a customer, record a payment, schedule a pickup.',
        why: 'Reduce context switching: see the state and act on it in the same place.',
        image: img.ycDash,
      },
      {
        heading: 'Every order, one status away',
        decision: 'Orders are organised by state (New, In Progress, Ready, Delivered, Cancelled) on desktop and mobile, searchable by order ID, name or phone.',
        why: 'Grouping by state makes the next action obvious across the whole order list.',
        image: img.ycMobile,
      },
      {
        heading: 'Customers see the same progress',
        decision: 'Customers follow their own order (confirmed, processing, out for delivery, delivered), and the store sends status updates over WhatsApp and SMS.',
        why: 'Customers are kept informed from the same order data the store works from.',
        image: img.ycTracking,
      },
    ],
    cover: img.ycCover,
    screens: [img.ycDash, img.ycMobile, img.ycTracking],
    tint: '#6bb0d0',
  },
  {
    id: 'cornerstone',
    liveSlug: 'cornerstone',
    index: '02',
    shortName: 'Cornerstone',
    name: 'Cornerstone Content Manager',
    company: 'Cornerstone OnDemand',
    category: 'AI · Enterprise · Content systems',
    dimension: 'AI at enterprise scale',
    roleTitle: 'Senior Product Designer',
    period: 'Jul 2024 – Sep 2025',
    lede: 'The challenge wasn’t simply automating metadata. It was making automation useful without taking control away from the person responsible for the result.',
    thesis: 'AI-assisted workflows that turned repetitive content operations into a faster, more controllable system.',
    highlights: ['1,700 → 160 min / month', '−91% manual metadata effort', '4,000+ enterprise content pages'],
    decisions: [
      {
        heading: 'AI drafts, the author decides',
        decision: 'Apollo AI drafts title, description, subjects, keywords and skills, and the author reviews them instead of building them by hand.',
        why: 'Each field is applied and editable on its own, so a wrong suggestion costs one correction, not a rebuild.',
        image: img.csPanel,
      },
      {
        heading: 'An assistant in the workflow, not an authority',
        decision: 'Apollo AI sits beside the work and offers actions for the current page (resume smart edit, add translations) rather than acting on its own.',
        why: 'Users validate, refine and override. That only works if the assistant stays visible and is invoked by the author.',
        image: img.csAssist,
      },
      {
        heading: 'Say what changed, then ask before doing more',
        decision: 'After applying metadata, the assistant reports exactly which fields changed, then asks before the next step: translate all, or only the selected languages.',
        why: 'Explicit confirmation keeps the workflow recoverable.',
        image: img.csTranslate,
      },
    ],
    cover: img.csCover,
    screens: [img.csPanel, img.csAssist, img.csTranslate, img.csCover],
    tint: '#6bb0d0',
  },
  {
    id: 'flyin',
    liveSlug: 'flyin',
    index: '03',
    shortName: 'Flyin',
    name: 'Flyin Search & Discovery',
    company: 'Flyin.com',
    category: 'Search · Discovery · Conversion',
    dimension: 'Consumer product impact',
    roleTitle: 'UX Lead',
    period: 'Jul 2016 – May 2018',
    lede: 'Travellers had to fix their dates before seeing how prices changed, and the filters that decide a trip were buried below the fold. The redesign moved comparison to the front of the search.',
    thesis: 'Rethinking flight and hotel search into a faster, more legible booking flow across web and app.',
    // Figures held: the live portfolio hides Flyin metrics pending verification.
    highlights: ['Shipped across web and app', 'Became the template for Flyin’s hotel-search redesign'],
    decisions: [
      {
        heading: 'Flexible-date pricing, up front',
        decision: 'Surface how price moves around the chosen dates before the traveller commits to them.',
        why: 'Travellers can compare dates without re-running the same search.',
        image: img.flDesktop,
      },
      {
        heading: 'Surfacing the filters that decide a trip',
        decision: 'Bring price flexibility, layovers and cabin class up from below the fold.',
        why: 'The information that decides a booking should sit where the decision is made.',
      },
      {
        heading: 'Fewer steps from result to booking',
        decision: 'Shorten the path from a chosen result to a completed booking.',
        why: 'Every extra step between a result and a booking is a point where the booking can be lost.',
        image: img.flHotel,
      },
    ],
    cover: img.flCover,
    screens: [img.flDesktop, img.flMobile, img.flHotel, img.flCover],
    tint: '#6bb0d0',
  },
  {
    id: 'civtech',
    liveSlug: 'menopause-care',
    index: '04',
    shortName: 'Menopause Care',
    name: 'Menopause Care',
    company: 'CivTech Scotland',
    category: 'Healthcare · AI · Social impact',
    dimension: 'Leading through ambiguity',
    roleTitle: 'Design Lead',
    period: '15-day design sprint',
    lede: 'An AI-powered concept for inclusive, accessible and connected menopause care, designed in a 15-day CivTech Scotland social-impact sprint.',
    thesis: 'Led 1 experience designer, 2 researchers and 4 junior designers from research to a proposed service model.',
    highlights: ['CivTech Scotland finalist', '15-day design sprint'],
    decisions: [
      {
        heading: 'Mapping a fragmented journey',
        decision: 'Map the whole journey, from awareness through diagnosis, treatment and post-menopause, using eight research inputs.',
        why: 'The journey was not one path but disconnected stages and hand-offs, with friction at awareness, waiting and follow-up.',
        image: img.cvJourney,
      },
      {
        heading: 'Designing for the ecosystem, not just an app',
        decision: 'Map who actually holds responsibility for menopause care in Scotland: national policy, health boards and dozens of partnerships.',
        why: 'The opportunity was a connected support ecosystem, not another isolated information product.',
        image: img.cvStructure,
      },
      {
        heading: 'A proposed service model',
        decision: 'A predictive, AI-assisted model: personalised information, severity-based triage, faster access to the right specialist, and ongoing support.',
        why: 'No product UI was designed: the submission is a research-and-strategy proposal.',
      },
    ],
    cover: img.cvCover,
    screens: [img.cvJourney, img.cvStructure, img.cvBrainstorm, img.cvCover],
    tint: '#d9a868',
  },
  {
    id: 'career',
    liveSlug: '',
    external: { url: CI_URL, label: 'Open the working prototype', hint: '(opens Career Intelligence in a new tab)' },
    ecosystem: true,
    index: '05',
    shortName: 'Career Intelligence',
    name: 'Career Intelligence OS',
    company: 'Product thesis & working prototype',
    category: 'Product strategy · AI · Future of work · Systems',
    dimension: 'Future-facing product systems',
    roleTitle: 'Product vision, design & prototype',
    period: '2026',
    lede: 'A career-intelligence system exploring how professional evidence, capabilities, opportunities and behavioural signals could become one living career model.',
    thesis: 'The résumé tells people what you’ve done. Career Intelligence asks what your work actually proves.',
    highlights: ['6 intelligence layers · 30+ product surfaces explored', 'Working prototype: Portfolio Intelligence and Attention Intelligence', 'Observation kept separate from inference'],
    decisions: [
      {
        heading: 'Test the claim against the evidence',
        decision: 'Portfolio Intelligence reads a claim against the excerpts that test it. Where they converge, a signal; where they’re thin, a gap; then one next move.',
        why: 'Polished claims are easy to produce. What a person can act on is what their work actually proves, and what is still missing.',
        image: img.ciReading,
      },
      {
        heading: 'Observe behaviour, never assume intent',
        decision: 'Attention Intelligence keeps what was observed, what can be interpreted, and what is never claimed in separate places.',
        why: 'A visit count can’t say who visited or why, so the product never implies that a recruiter looked.',
        image: img.ciObserve,
      },
      {
        heading: 'One surface of a larger system',
        decision: 'Portfolio Intelligence is the first working surface of six intelligence layers: identity, evidence, capability, opportunity, signals and a future ecosystem.',
        why: 'Most career products optimise one artifact. The thesis is the connective layer between them: evidence → capability → opportunity → signal.',
        note: 'Concept ecosystem · explored, not built',
      },
    ],
    cover: img.ciHero,
    screens: [img.ciHero, img.ciReading, img.ciAttention, img.ciObserve],
    tint: '#6bb0d0',
  },
]

export const projectById = (id: string) => PROJECTS.find((p) => p.id === id)

/** Reel-only lines requested in the brief, from the earlier portfolio. */
export const REEL_FACTS = {
  youcleanBefore: '3–5 MIN',
  youcleanAfter: '< 1 MIN',
  youcleanLabel: 'Order entry',
  cornerstoneClicks: 40,
}
