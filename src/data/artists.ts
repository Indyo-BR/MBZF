export interface Artist {
  id: string
  /** 'instructor' couples vs 'dj'. DJs show only Instagram (no Privates). */
  kind: 'instructor' | 'dj'
  name: string
  role: string
  origin: string
  photo: string
  color: string
  bio: string
  /** Fun fact / curiosity — placeholder text, replace later. */
  curiosity: string
  /** WhatsApp number, digits only with country code. Empty = no Privates button. */
  whatsapp: string
  /** Instagram handle WITHOUT the @ (e.g. brunogalhardo). */
  instagram: string
}

const CURIOSITY_PLACEHOLDER =
  'Fun fact coming soon — this space will be filled with an interesting detail about the artist.'
const BIO_PLACEHOLDER = 'Bio coming soon.'

// Placeholder photos until the real ones arrive. We optimize + drop in real photos later.
const phArtist = (lock: number) => `https://loremflickr.com/600/600/dance,couple?lock=${lock}`
const phDj = (lock: number) => `https://loremflickr.com/600/600/dj,music?lock=${lock}`

const PALETTE = ['#E8638A', '#F5C842', '#4BBFBF', '#3A7D2C', '#E8722A']
const color = (i: number) => PALETTE[i % PALETTE.length]

// Real teacher couples taken from the official schedule. Photos / bios / Instagram /
// WhatsApp are placeholders — the owner will send the real info to fill them in.
const COUPLES = [
  'Matheus & Nina',
  'Luan & Adriana',
  'Pedro & Ana',
  'Rachel & Bruna',
  'Renato & Tamara',
  'Deborah & Douglas',
  'Ryel & Romina',
  'Jorge & Anabella',
  'Paulo & Luiza',
  'Val & Vanessa',
  'Leandro & Nayara',
]

// Festival DJs. Instagram comes later; DJs have no Privates contact.
const DJS = [
  'DJ Fab',
  'DJ Kakah',
  'DJ Matheus',
  'DJ Sharkynho',
  'DJ Yasaf',
  'DJ Kel',
  'DJ Bandido',
  'DJ InstinX',
  'DJ Val',
]

const instructors: Artist[] = COUPLES.map((name, i): Artist => ({
  id: String(i + 1),
  kind: 'instructor',
  name,
  role: 'Instructors',
  origin: '',
  photo: phArtist(101 + i),
  color: color(i),
  bio: BIO_PLACEHOLDER,
  curiosity: CURIOSITY_PLACEHOLDER,
  whatsapp: '',
  instagram: '',
}))

const djs: Artist[] = DJS.map((name, i): Artist => ({
  id: String(COUPLES.length + 1 + i),
  kind: 'dj',
  name,
  role: 'DJ',
  origin: '',
  photo: phDj(201 + i),
  color: color(i),
  bio: BIO_PLACEHOLDER,
  curiosity: CURIOSITY_PLACEHOLDER,
  whatsapp: '',
  instagram: '',
}))

export const artists: Artist[] = [...instructors, ...djs]
