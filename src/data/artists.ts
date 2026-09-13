export interface Artist {
  id: string
  /** 'instructor' couples vs 'dj'. Both get the Privates button when they sent a contact. */
  kind: 'instructor' | 'dj'
  name: string
  role: string
  origin: string
  photo: string
  color: string
  /** Line breaks are kept on the page (paragraphs and bullet lists). */
  bio: string
  /** Fun fact / curiosity shown under "Did you know?". */
  curiosity: string
  /** WhatsApp number, digits only with country code. Empty = no WhatsApp. */
  whatsapp: string
  /** Instagram handle WITHOUT the @ (e.g. brunogalhardo). Empty = no Instagram button. */
  instagram: string
  /** No WhatsApp, and the artist asked to be reached for Privates by Instagram DM. */
  privatesViaInstagram: boolean
}

/** The fields the artists filled in on the "Artists MBZF" Google Form. */
type ArtistInfo = Partial<
  Pick<Artist, 'origin' | 'bio' | 'curiosity' | 'whatsapp' | 'instagram' | 'privatesViaInstagram'>
>

/** Joins paragraphs with a blank line between them. */
const p = (...paragraphs: string[]) => paragraphs.join('\n\n')

const CURIOSITY_PLACEHOLDER =
  'Fun fact coming soon: this space will be filled with an interesting detail about the artist.'
const BIO_PLACEHOLDER = 'Bio coming soon.'

// Placeholder photos until the real ones arrive. We optimize + drop in real photos later.
const phArtist = (lock: number) => `https://loremflickr.com/600/600/dance,couple?lock=${lock}`
const phDj = (lock: number) => `https://loremflickr.com/600/600/dj,music?lock=${lock}`

const PALETTE = ['#E8638A', '#F5C842', '#4BBFBF', '#3A7D2C', '#E8722A']
const color = (i: number) => PALETTE[i % PALETTE.length]

// Real teacher couples taken from the official schedule. Bios and contacts come
// from INFO below; photos are still placeholders until the real ones arrive.
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
] as const

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
] as const

/** A typo in an INFO key is a build error, so the info can't silently go missing. */
type ArtistName = (typeof COUPLES)[number] | (typeof DJS)[number]

// ---------------------------------------------------------------------------
// Real info from the artists' answers to the "Artists MBZF" Google Form
// (Aug/Sep 2026). Texts lightly copy-edited. Anyone not listed here keeps the
// "coming soon" placeholders. Keys must match the names in COUPLES / DJS.
// ---------------------------------------------------------------------------

// Rachel and Jorge answered as individuals. Each is one half of a teaching duo
// AND a festival DJ, so the same info fills both pages (origin only on the DJ
// page, since it describes one person, not the duo).
const RACHEL: ArtistInfo = {
  origin: 'Rio de Janeiro, Brazil',
  bio: p(
    'Rachel Ramalho is a Brazilian dancer, teacher, and international artist deeply rooted in the Brazilian Zouk & Lambada community. Born in Rio de Janeiro, Brazil, she began her journey with Lambada in 2006 while performing with the renowned Jaime Arôxa Dance Company.',
    'Since 2010, Rachel has traveled the world teaching, performing, judging, and creating events dedicated to Brazilian Zouk & Lambada. Her work brings together the roots, culture, energy, and evolution of both dances.',
    'Today, Rachel continues to share Brazilian Zouk & Lambada worldwide, honoring their history while contributing to their evolution and inspiring new generations of dancers.',
  ),
  curiosity:
    'A distinctive part of Rachel’s journey is that she has danced as both leader and follower from the very beginning of her career, developing a deep understanding of both roles and perspectives within Brazilian Zouk and Lambada.',
  whatsapp: '16822487570',
  instagram: 'rachelramalho.djkel',
}

const JORGE: ArtistInfo = {
  origin: 'South Florida',
  bio: p(
    'Jorge Valero is a South Florida-based Bachata and Brazilian Zouk instructor and DJ with over a decade of teaching experience. Trained in Bachata through professional team and cabaret work with Jonathan Troncoso and formal dance training with Billy Fajardo, Jorge began Brazilian Zouk in 2019 under Paulo & Luiza.',
    'His teaching focuses on technique, connection, and the fine details of leading and following, with an emphasis on movements that are practical and socially leadable, not just choreography.',
    'A four-time consecutive 1st-place Brazilian Zouk World Championship Teams competitor, Jorge also DJs Brazilian Zouk events as DJ InstinX.',
  ),
  curiosity:
    'Jorge enjoys both leading and following! Being comfortable on both sides of the connection has helped him develop a deeper understanding of what makes a movement feel good for both partners.',
  whatsapp: '19546438521',
  instagram: 'mercenario_116',
}

const INFO: Partial<Record<ArtistName, ArtistInfo>> = {
  'Matheus & Nina': {
    origin: 'Campinas, Brazil',
    bio: 'They’re from Campinas, SP, Brazil. Official partners since 2018, Brazilian Zouk dancers for 15 years, and directors of Barracão da Dança.',
    curiosity:
      'They’ve known each other for 15 years. Matheus even danced with Nina at her 15th birthday party.',
    instagram: 'ninaandmatheus',
    privatesViaInstagram: true,
  },

  'Luan & Adriana': {
    bio: p(
      'Their goal: “Dance with your partner, not with the movement!”',
      [
        '• Working in ballroom dancing for more than 15 years',
        '• Zouk teachers at national and international congresses',
        '• Classes on 6 continents and in more than 25 countries',
        '• Two-time World Lambada Champions',
        '• Two-time Brazilian Latin Dance Champions',
        '• Two-time Regional Ballroom Dancing Champions (Santos)',
        '• Coaches, speakers, and Emotional Intelligence trainers (Lyouman Institute)',
        '• Creators and directors of Musical Training: The Hero’s Journey',
        '• Creators and directors of Arte ao Encantar (training for speakers and teachers)',
        '• Creators and directors of 24 Hours with LA (an emotional intelligence course that uses dance as its tool)',
      ].join('\n'),
    ),
    curiosity: 'Luan loves bolero, and Adriana loves to dance in flip-flops.',
    instagram: 'luaneadrianaofc',
    privatesViaInstagram: true,
  },

  'Pedro & Ana': {
    origin: 'Rio de Janeiro, Brazil',
    bio: p(
      'Brazilian Zouk World Champions from Rio, Pedro and Ana came up through Alex de Carvalho’s school. They are instructors, choreographers, performers, and certified judges with the Brazilian Zouk Dance Council.',
      'The couple is known for their contribution to artistry and creativity in the Zouk and Lambada scene, and as community builders with leadership roles in Toronto, NYC, Boston, and Upstate NY.',
      'Today they are developing their own dance community in Rochester while teaching across the US, Canada, Brazil, and Europe. Their teaching follows one idea: the dance happens in between the steps.',
    ),
    curiosity:
      'Even with over 25 years of combined dance experience, Pedro and Ana are still in their 20s.',
    whatsapp: '5521964451315',
    instagram: 'pedroandanadance',
  },

  'Rachel & Bruna': { ...RACHEL, origin: '' },
  'Jorge & Anabella': { ...JORGE, origin: '' },

  'Leandro & Nayara': {
    origin: 'São Paulo, Brazil',
    bio: p(
      'Leandro and Nayara are dancers, teachers, and choreographers from São Paulo, Brazil. They are the current Brazilian Zouk World Champions and three-time World Championship runners-up. Today, they travel across the United States teaching workshops, mentoring dancers, and training competitors.',
      'With extensive experience in Jack & Jill competitions and competitor development, they are known for their focus on musicality, partner connection, and performance. They also run a dance school in Brazil and continue to work with students from around the world.',
    ),
    curiosity:
      'Before falling in love with the diversity of Brazilian Zouk, they spent years dancing only Urban Zouk and were completely obsessed with R&B music. What started as a passion for interpreting music soon became a curiosity to understand the origins of the dance, and that journey made them fall in love with the many styles, influences, and possibilities within Brazilian Zouk today.',
    whatsapp: '17206878287',
    instagram: 'leandroandnayara',
  },

  'DJ Fab': {
    origin: 'Rio de Janeiro, Brazil',
    bio: p(
      '2025/2026 DJ World Champion.',
      'Fab is an internationally acclaimed DJ and a key figure in the Brazilian Zouk scene. He began his career in 2006 spinning tribal house in Rio de Janeiro and evolved with the industry, mastering vinyl, CDJs, and digital controllers.',
      'After discovering Zouk in 2007, Fab immersed himself not only as a DJ but also as a dancer and instructor, developing a deep understanding of the music’s connection to movement.',
      'He is the creator of several well-known Zouk events, including Cremozouk in Rio de Janeiro, Zouk Journey in San Francisco, and The Chill Experience in Miami/San Francisco. After living in Rio his entire life, he moved to Miami in 2024, and then to San Jose, California, in 2025, with the dream of helping grow the West Coast Zouk scene.',
      'With nearly two decades of experience, Fab is now recognized as one of the leading Zouk DJs in both Brazil and the United States. He’s celebrated for his musical versatility, deep knowledge of dance, and charismatic presence behind the decks.',
      'His sets are known for their creativity, energy, and intuitive connection to the dance floor, qualities that make him a favorite among dancers and organizers worldwide.',
    ),
    curiosity:
      'There’s no party without vibe. DJ Fab is always dancing and having fun, whether he’s playing or just hanging out with people. Fun fact: sometimes people think he’s Paulo, lol.',
    whatsapp: '17863609195',
    instagram: 'fabioaraujodj',
  },

  'DJ Kel': RACHEL,
  'DJ InstinX': JORGE,
}

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
  privatesViaInstagram: false,
  ...INFO[name],
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
  privatesViaInstagram: false,
  ...INFO[name],
}))
export const artists: Artist[] = [...instructors, ...djs]
