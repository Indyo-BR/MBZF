export interface ScheduleEvent {
  id: string
  day: number // 1-5
  time: string
  ampm: 'AM' | 'PM'
  title: string
  type: 'workshop' | 'pool' | 'performance' | 'social'
  location: string
  instructor?: string
}

export const schedule: ScheduleEvent[] = [
  // Day 1
  { id: 'd1-1', day: 1, time: '10:00', ampm: 'AM', title: 'Zouk Flow & Transitions', type: 'workshop', location: 'Main Ballroom', instructor: 'Walter & Brenda' },
  { id: 'd1-2', day: 1, time: '02:30', ampm: 'PM', title: 'Sunset Social Mix', type: 'pool', location: 'Poolside', instructor: 'DJ Kadu' },
  { id: 'd1-3', day: 1, time: '10:00', ampm: 'PM', title: 'Gala Show: Night of Stars', type: 'performance', location: 'Grand Theater', instructor: 'All Artists' },
  // Day 2
  { id: 'd2-1', day: 2, time: '09:00', ampm: 'AM', title: 'Foundations of Brazilian Zouk', type: 'workshop', location: 'Studio A', instructor: 'Bruno Galhardo' },
  { id: 'd2-2', day: 2, time: '12:00', ampm: 'PM', title: 'Ladies Styling Workshop', type: 'workshop', location: 'Studio B', instructor: 'Paloma Alves' },
  { id: 'd2-3', day: 2, time: '04:00', ampm: 'PM', title: 'White Pool Party', type: 'pool', location: 'Resort Pool', instructor: 'DJ Larissa' },
  { id: 'd2-4', day: 2, time: '11:00', ampm: 'PM', title: 'White Night Ball', type: 'social', location: 'Main Ballroom' },
  // Day 3
  { id: 'd3-1', day: 3, time: '11:00', ampm: 'AM', title: 'Musicality & Connection', type: 'workshop', location: 'Main Ballroom', instructor: 'Kadu Pires' },
  { id: 'd3-2', day: 3, time: '03:00', ampm: 'PM', title: 'Flamingo Pool Party', type: 'pool', location: 'Poolside', instructor: 'DJ Bruno' },
  { id: 'd3-3', day: 3, time: '09:00', ampm: 'PM', title: 'International Showcase', type: 'performance', location: 'Grand Theater', instructor: 'All Artists' },
  // Day 4
  { id: 'd4-1', day: 4, time: '10:00', ampm: 'AM', title: 'Advanced Combinations', type: 'workshop', location: 'Studio A', instructor: 'Bruno & Paloma' },
  { id: 'd4-2', day: 4, time: '02:00', ampm: 'PM', title: 'Body Movement Lab', type: 'workshop', location: 'Studio B', instructor: 'Larissa' },
  { id: 'd4-3', day: 4, time: '10:00', ampm: 'PM', title: 'Carnival Gala', type: 'performance', location: 'Grand Theater', instructor: 'All Artists' },
  // Day 5
  { id: 'd5-1', day: 5, time: '11:00', ampm: 'AM', title: 'Farewell Workshop', type: 'workshop', location: 'Main Ballroom', instructor: 'All Instructors' },
  { id: 'd5-2', day: 5, time: '03:00', ampm: 'PM', title: 'Beach Social', type: 'social', location: 'Ocean Drive' },
  { id: 'd5-3', day: 5, time: '08:00', ampm: 'PM', title: 'Closing Ceremony', type: 'performance', location: 'Grand Theater', instructor: 'All Artists' },
]
