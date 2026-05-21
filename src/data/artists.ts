export interface Artist {
  id: string
  name: string
  role: string
  origin: string
  photo: string
  color: string
  bio: string
  /** Fun fact / curiosity — placeholder text, replace later. */
  curiosity: string
  /** WhatsApp number, digits only with country code (e.g. 5511999990001). */
  whatsapp: string
  /** Instagram handle WITHOUT the @ (e.g. brunogalhardo). */
  instagram: string
}

const CURIOSITY_PLACEHOLDER =
  'Fun fact coming soon — this space will be filled with an interesting detail about the artist.'

export const artists: Artist[] = [
  {
    id: '1',
    name: 'Bruno Galhardo',
    role: 'Master Instructor',
    origin: 'Brazil',
    photo: 'https://loremflickr.com/400/400/man,portrait?lock=11',
    color: '#E8638A',
    bio: 'World-renowned Brazilian Zouk master, known for fluid technique and musical interpretation.',
    curiosity: CURIOSITY_PLACEHOLDER,
    whatsapp: '5511999990001',
    instagram: 'brunogalhardo',
  },
  {
    id: '2',
    name: 'Paloma Alves',
    role: 'Choreographer',
    origin: 'Brazil',
    photo: 'https://loremflickr.com/400/400/woman,portrait?lock=22',
    color: '#F5C842',
    bio: 'Award-winning choreographer blending zouk with contemporary movement styles.',
    curiosity: CURIOSITY_PLACEHOLDER,
    whatsapp: '5511999990002',
    instagram: 'palomaalves',
  },
  {
    id: '3',
    name: 'Kadu Pires',
    role: 'Artist',
    origin: 'Brazil',
    photo: 'https://loremflickr.com/400/400/man,face?lock=33',
    color: '#4BBFBF',
    bio: 'Touring zouk artist and DJ — pioneer of the modern festival sound.',
    curiosity: CURIOSITY_PLACEHOLDER,
    whatsapp: '5511999990003',
    instagram: 'kadupires',
  },
  {
    id: '4',
    name: 'Larissa',
    role: 'Performer',
    origin: 'Brazil',
    photo: 'https://loremflickr.com/400/400/woman,face?lock=44',
    color: '#E8722A',
    bio: 'Rising star known for her expressive stage performances.',
    curiosity: CURIOSITY_PLACEHOLDER,
    whatsapp: '5511999990004',
    instagram: 'larissa.zouk',
  },
  {
    id: '5',
    name: 'Walter',
    role: 'Instructor',
    origin: 'Brazil',
    photo: 'https://loremflickr.com/400/400/man,smile?lock=55',
    color: '#3A7D2C',
    bio: 'Co-headlining instructor known for transitions and connection workshops.',
    curiosity: CURIOSITY_PLACEHOLDER,
    whatsapp: '5511999990005',
    instagram: 'walter.zouk',
  },
  {
    id: '6',
    name: 'Brenda',
    role: 'Instructor',
    origin: 'Brazil',
    photo: 'https://loremflickr.com/400/400/woman,smile?lock=66',
    color: '#E8638A',
    bio: 'Beloved instructor focused on ladies styling and musicality.',
    curiosity: CURIOSITY_PLACEHOLDER,
    whatsapp: '5511999990006',
    instagram: 'brenda.zouk',
  },
]
