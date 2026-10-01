/**
 * Project 05 — Career Intelligence OS.
 *
 * A product thesis and its first working prototype. Wording for the prototype
 * (the sample reading, Attention Intelligence) is taken verbatim from
 * https://career-intelligence-beige.vercel.app, which is the source of truth.
 * The ecosystem is a concept map: only two surfaces are built. Nothing here is
 * a market claim; the 2030 line is framed as a thesis.
 */

export type Status = 'built' | 'explored' | 'future'

export const CI_URL = 'https://career-intelligence-beige.vercel.app'

export const CI = {
  question: 'What if your career could understand itself?',
  name: 'Career Intelligence OS',
  everywhere: 'Your career is everywhere.',
  isnt: 'Your intelligence isn’t.',
  fragments: ['Resume', 'Portfolio', 'LinkedIn', 'Projects', 'Applications', 'Feedback', 'Interviews', 'Network'],
  model: ['Experience', 'Evidence', 'Capability', 'Opportunity', 'Career Signal'],
  documents: 'A career shouldn’t just be a collection of documents.',
  living: 'It could become a living intelligence system.',
  first: 'The first question: what does your work actually prove?',
  beginning: 'The portfolio is only the beginning.',
  thesisLabel: '2030 thesis',
  thesisA: 'The career profile may no longer be a document.',
  thesisB: 'It may become a living intelligence layer.',
  thesisC: 'Career Intelligence is an exploration of what that could look like.',
  close: 'From portfolio → proof → opportunity → career signal.',
}

/** The sample reading, as the prototype shows it (a real portfolio, reviewed by its owner). */
export const READING = {
  claim: 'I design products for complexity.',
  excerpts: [
    { text: 'I start from the system, not the screen: who holds which piece of information, where the hand-offs break, and what the person in front of the product needs to decide next.', source: 'Home · How I think' },
    { text: 'Seven disconnected surfaces — phones, WhatsApp, paper slips, a shared sheet — became one order record.', source: 'Home · How I think · YouClean' },
    { text: 'Designing for healthcare means designing across systems, not screens.', source: 'Menopause Care · Reflection' },
  ],
  signal: 'Systems before screens',
  signalNote: 'Strong evidence · 3 excerpts',
  claim2: 'Design systems and end-to-end product experiences',
  excerpt2: { text: 'Validate–refine–override became a model for AI-assisted surfaces elsewhere in the platform.', source: 'Cornerstone · Outcome' },
  gap: 'Design systems',
  gapNote: 'Limited direct evidence',
  next: 'Make the design-systems evidence visible — or remove it from your stated strengths.',
}

/** Attention Intelligence sample: a fictional portfolio, nothing real was tracked. */
export const ATTENTION = {
  sample: 'Sample data · a fictional portfolio · nothing real was tracked',
  period: '7 days after the portfolio was shared',
  visits: 18,
  opened: [
    { n: 13, name: 'Ledger', note: '13 of 18 visits · case study' },
    { n: 10, name: 'Atlas', note: '10 of 18 visits · case study' },
    { n: 7, name: 'About', note: '7 of 18 visits · page' },
  ],
  observe: 'We can observe behaviour.',
  intent: 'We cannot know intent.',
  observed: { k: 'Observed', v: '18 visits. 13 opened Ledger.' },
  interpreted: { k: 'Interpreted', v: 'Case studies received more exploration than the About page in this period.' },
  never: { k: 'Never claimed', v: '“A recruiter viewed your portfolio.”' },
}

export type Surface = { name: string; status: Status }
export type IntelLayer = { name: string; surfaces: Surface[] }

const s = (name: string, status: Status = 'explored'): Surface => ({ name, status })

/** Six intelligence layers · 34 product surfaces explored. Two are built. */
export const LAYERS: IntelLayer[] = [
  { name: 'Identity', surfaces: [s('Career DNA'), s('Professional Identity'), s('Career Passport', 'future'), s('Experience Timeline')] },
  { name: 'Evidence', surfaces: [s('Portfolio Intelligence', 'built'), s('Resume Intelligence'), s('LinkedIn Intelligence'), s('Career Evidence Graph'), s('Proof Library'), s('Outcome Tracker')] },
  { name: 'Capability', surfaces: [s('Capability Map'), s('Skill Graph'), s('Strength Signals'), s('Gap Intelligence'), s('Career Narrative'), s('Evidence Confidence')] },
  { name: 'Opportunity', surfaces: [s('Opportunity Lens'), s('Role Intelligence'), s('Job Fit'), s('Career Path Explorer'), s('Application Intelligence'), s('Interview Intelligence')] },
  { name: 'Signals', surfaces: [s('Career Signals'), s('Market Signals'), s('Attention Intelligence', 'built'), s('Network Intelligence'), s('Reputation Signals'), s('Momentum Monitor')] },
  { name: 'Future', surfaces: [s('Career Forecast', 'future'), s('Career Scenario Planner', 'future'), s('Career Passport Exchange', 'future'), s('Recruiter Intelligence', 'future'), s('Employer Intelligence', 'future'), s('Talent Signal API', 'future')] },
]

export const SURFACE_COUNT = LAYERS.reduce((n, l) => n + l.surfaces.length, 0)

/** The surfaces named when the reel zooms back out from the prototype. */
export const NAMED = [
  'Career DNA', 'Career Passport', 'Portfolio Intelligence', 'Career Evidence Graph', 'Capability Map',
  'Opportunity Lens', 'Career Signals', 'Attention Intelligence', 'Career Forecast', 'Recruiter Intelligence',
]

export const STATUS_LABEL: Record<Status, string> = { built: 'Built', explored: 'Explored', future: 'Future' }
