export type EventType = 'workshop' | 'pool' | 'party' | 'social'

export interface SlotEntry {
  /** Artist / couple name — becomes the BOLD line when present. */
  artist?: string
  /** Workshop / activity title. Secondary line; becomes the bold line when there is no artist. */
  title: string
  /** Extra line (e.g. "LOBBY", "Drinks & Snacks included", "Novice / Intermediate"). */
  note?: string
  /** Time range shown on its own small line (e.g. "10:30 PM – 5:00 AM", "7–8:30 PM"). */
  timeRange?: string
}

export interface ScheduleSlot {
  id: string
  day: number // 0..4
  time: string // start time, e.g. '1:30'
  ampm: 'AM' | 'PM'
  type: EventType
  /** Full-width event (rooms merged). */
  main?: SlotEntry
  /** ROOM 1 column. */
  room1?: SlotEntry
  /** ROOM 2 column. */
  room2?: SlotEntry
}

export const days = [
  { n: 0, dow: 'THU', date: '22' },
  { n: 1, dow: 'FRI', date: '23' },
  { n: 2, dow: 'SAT', date: '24' },
  { n: 3, dow: 'SUN', date: '25' },
  { n: 4, dow: 'MON', date: '26' },
]

const TBD = 'Topic T.B.D.'

export const schedule: ScheduleSlot[] = [
  // ───────── DAY 0 · Thursday, Apr 22 ─────────
  {
    id: 'd0-pool',
    day: 0,
    time: '5:00',
    ampm: 'PM',
    type: 'pool',
    main: { title: 'Welcome Pool Party', note: 'Drinks & Snacks included', timeRange: '5:00 – 7:30 PM' },
  },
  { id: 'd0-1', day: 0, time: '8:30', ampm: 'PM', type: 'workshop', main: { artist: 'Matheus & Nina', title: TBD } },
  { id: 'd0-2', day: 0, time: '9:30', ampm: 'PM', type: 'workshop', main: { artist: 'Luan & Adriana', title: TBD } },
  { id: 'd0-preparty', day: 0, time: '10:30', ampm: 'PM', type: 'party', main: { title: 'Pre-Party', note: 'Start your vibe' } },

  // ───────── DAY 1 · Friday, Apr 23 ─────────
  { id: 'd1-reg', day: 1, time: '1:00', ampm: 'PM', type: 'social', main: { title: 'Registration', note: 'LOBBY' } },
  {
    id: 'd1-1',
    day: 1,
    time: '1:30',
    ampm: 'PM',
    type: 'workshop',
    room1: { artist: 'Pedro & Ana', title: TBD },
    room2: { artist: 'Rachel & Bruna', title: 'Lambada' },
  },
  {
    id: 'd1-2',
    day: 1,
    time: '3:15',
    ampm: 'PM',
    type: 'workshop',
    room1: { artist: 'Renato & Tamara', title: TBD },
    room2: { artist: 'Deborah & Douglas', title: TBD },
  },
  {
    id: 'd1-3',
    day: 1,
    time: '5:00',
    ampm: 'PM',
    type: 'workshop',
    room1: { artist: 'Ryel & Romina', title: 'Lambada' },
    room2: { artist: 'Jorge & Anabella', title: TBD },
  },
  {
    id: 'd1-4',
    day: 1,
    time: '6:45',
    ampm: 'PM',
    type: 'workshop',
    room1: { artist: 'Paulo & Luiza', title: TBD },
    room2: { artist: 'Matheus & Nina', title: TBD },
  },
  {
    id: 'd1-party',
    day: 1,
    time: '10:30',
    ampm: 'PM',
    type: 'party',
    main: { title: 'NEON Party', note: 'Performances', timeRange: '10:30 PM – 5:00 AM' },
  },

  // ───────── DAY 2 · Saturday, Apr 24 ─────────
  {
    id: 'd2-1',
    day: 2,
    time: '11:00',
    ampm: 'AM',
    type: 'workshop',
    room1: { artist: 'Val & Vanessa', title: TBD },
    room2: { artist: 'Leandro & Nayara', title: TBD },
  },
  {
    id: 'd2-2',
    day: 2,
    time: '12:45',
    ampm: 'PM',
    type: 'workshop',
    room1: { artist: 'Matheus & Nina', title: TBD },
    room2: { artist: 'Ryel & Romina', title: 'Lambada' },
  },
  {
    id: 'd2-3',
    day: 2,
    time: '2:00',
    ampm: 'PM',
    type: 'workshop',
    room1: { artist: 'Leandro & Nayara', title: TBD },
    room2: { artist: 'Renato & Tamara', title: TBD },
  },
  {
    id: 'd2-4',
    day: 2,
    time: '3:45',
    ampm: 'PM',
    type: 'workshop',
    room1: { artist: 'Rachel & Bruna', title: 'Lambada move for Zoukers' },
    room2: { artist: 'Pedro & Ana', title: TBD },
  },
  {
    id: 'd2-5',
    day: 2,
    time: '5:30',
    ampm: 'PM',
    type: 'workshop',
    room1: { artist: 'Val & Vanessa', title: TBD },
    room2: { artist: 'Luan & Adriana', title: TBD },
  },
  {
    id: 'd2-jj',
    day: 2,
    time: '7:00',
    ampm: 'PM',
    type: 'social',
    room1: { title: 'Jack & Jill', note: 'Novice / Intermediate', timeRange: '7–8:30 PM' },
    room2: { title: 'Social Dancing' },
  },
  {
    id: 'd2-party',
    day: 2,
    time: '10:30',
    ampm: 'PM',
    type: 'party',
    main: { title: 'LAS VEGAS Party', note: 'All-Star / Champion J&J', timeRange: '10:30 PM – 6:00 AM' },
  },

  // ───────── DAY 3 · Sunday, Apr 25 ─────────
  { id: 'd3-yoga', day: 3, time: '11:00', ampm: 'AM', type: 'social', main: { title: 'Yoga at the Beach' } },
  {
    id: 'd3-1',
    day: 3,
    time: '12:00',
    ampm: 'PM',
    type: 'workshop',
    room1: { artist: 'Luan & Adriana', title: TBD },
    room2: { artist: 'Val & Vanessa', title: TBD },
  },
  {
    id: 'd3-2',
    day: 3,
    time: '1:45',
    ampm: 'PM',
    type: 'workshop',
    room1: { artist: 'Nina / Tamara / Ana Reis', title: 'Followers Choreo' },
    room2: { artist: 'Luan / Leandro / Pedro', title: 'Leaders Choreo' },
  },
  {
    id: 'd3-jj',
    day: 3,
    time: '3:00',
    ampm: 'PM',
    type: 'social',
    room1: { title: 'Jack & Jill', note: 'Novice/Int/Advanced · Finals', timeRange: '3–4:30 PM' },
    room2: { title: 'Social Dancing' },
  },
  {
    id: 'd3-party',
    day: 3,
    time: '10:30',
    ampm: 'PM',
    type: 'party',
    main: { title: 'TROPICAL Party', note: 'Awards', timeRange: '10:30 PM – 5:00 AM' },
  },

  // ───────── DAY 4 · Monday, Apr 26 ─────────
  {
    id: 'd4-after',
    day: 4,
    time: '6:00',
    ampm: 'PM',
    type: 'party',
    main: { title: 'After Party', note: 'Location: T.B.D.', timeRange: '6:00 – 10:00 PM' },
  },
]
