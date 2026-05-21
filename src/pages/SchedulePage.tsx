import { useState } from 'react'
import type { ScheduleEvent } from '../data/schedule'
import { schedule } from '../data/schedule'

const typeColors: Record<ScheduleEvent['type'], string> = {
  workshop: 'bg-miami-turquoise',
  pool: 'bg-tropical-green',
  performance: 'bg-flamingo-pink',
  social: 'bg-secondary',
}

const typeLabels: Record<ScheduleEvent['type'], string> = {
  workshop: 'Workshop',
  pool: 'Pool Party',
  performance: 'Performance',
  social: 'Social',
}

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState(1)
  const filtered = schedule.filter((e) => e.day === activeDay)

  return (
    <div className="px-6 pt-6 pb-6">
      <h1 className="font-bebas text-5xl text-primary mb-6 leading-none">Schedule</h1>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-8 -mx-6 px-6">
        {[1, 2, 3, 4, 5].map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`shrink-0 px-6 py-2 rounded-full font-bebas tracking-widest text-base ${
              activeDay === d ? 'bg-primary text-white' : 'bg-surface-container-highest text-dark-surface'
            }`}
          >
            Day {d}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.map((event) => (
          <div key={event.id} className="flex gap-4">
            <div className="w-16 flex-shrink-0 pt-1">
              <p className="font-bebas text-xl text-miami-gold leading-none">{event.time}</p>
              <p className="text-[10px] uppercase font-bold text-outline mt-1">{event.ampm}</p>
            </div>
            <div className="flex-grow pb-6 border-b border-outline-variant/30">
              <span className={`inline-block px-3 py-0.5 rounded-full text-white text-[10px] font-bold uppercase mb-2 ${typeColors[event.type]}`}>
                {typeLabels[event.type]}
              </span>
              <h3 className="text-base font-semibold text-dark-surface leading-tight">{event.title}</h3>
              <p className="text-sm text-outline">{event.location}{event.instructor && ` • ${event.instructor}`}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
