/**
 * About + contact. Matches the live portfolio (vimaladesigner.vercel.app):
 * hero statement, email and LinkedIn as published there.
 */
import { PORTFOLIO_URL } from './projects'

export { PORTFOLIO_URL }

export const LINKEDIN_URL = 'https://www.linkedin.com/in/vimalabanavath/'

export const PROFILE = {
  name: 'Vimala Banavath',
  title: 'Senior Product Designer',
  location: 'Hyderabad, India',
  statement: 'I design complex products and AI-powered workflows that turn ambiguity into clearer decisions.',
  bio: '8+ years designing enterprise, consumer and service products across AI, SaaS and complex workflows. Currently building YouClean.',
  /** The reel's spoken introduction, shown as it is said. */
  reelStatement: 'Turning complex problems into experiences people can actually use.',
  /** The closing thought: one idea, three connected parts. */
  belief: {
    lead: 'For me, good product design starts before the screen.',
    prefix: 'It’s about',
    phrases: ['understanding the system', 'making complexity easier to navigate', 'building experiences people can trust'],
  },
  words: ['AI', 'Enterprise', 'Systems', 'Product', 'Build'],
  portrait: '/img/about/portrait.jpg',
  email: 'vimalabanavath.design@gmail.com',
}

export const VCARD = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'N:Banavath;Vimala;;;',
  'FN:Vimala Banavath',
  'TITLE:Senior Product Designer',
  `EMAIL;TYPE=INTERNET:${PROFILE.email}`,
  `URL:${PORTFOLIO_URL}`,
  'END:VCARD',
].join('\n')
