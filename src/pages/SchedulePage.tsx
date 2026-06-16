import { useRef, useState } from 'react'
import type { EventType, ScheduleSlot, SlotEntry } from '../data/schedule'
import { days, schedule } from '../data/schedule'

const typeColors: Record<EventType, string> = {
  workshop: 'bg-miami-turquoise',
  pool: 'bg-tropical-green',
  party: 'bg-flamingo-pink',
  social: 'bg-secondary',
}

const typeLabels: Record<EventType, string> = {
  workshop: 'Workshop',
  pool: 'Pool Party',
  party: 'Party',
  social: 'Social',
}

/** Secondary line: title when there's an artist, otherwise the note. */
const secondaryText = (e: SlotEntry) => (e.artist ? e.title : e.note)

/** Renders a couple's name on two lines, breaking after the "&" (e.g. "Deborah &" / "Douglas"). */
function ArtistName({ name }: { name: string }) {
  const parts = name.split(' & ')
  if (parts.length === 2) {
    return (
      <>
        {parts[0]} &<br />
        {parts[1]}
      </>
    )
  }
  return <>{name}</>
}

function TypeBadge({ type }: { type: EventType }) {
  return (
    <span
      className={`inline-block px-3 py-0.5 rounded-full text-white text-[10px] font-bold uppercase ${typeColors[type]}`}
    >
      {typeLabels[type]}
    </span>
  )
}

/** Card body shared by main (full-width) and room columns. */
function EntryCard({ entry, type }: { entry: SlotEntry; type: EventType }) {
  const secondary = secondaryText(entry)
  return (
    <div>
      <div className="mb-1.5">
        <TypeBadge type={type} />
      </div>
      <h3 className="text-base font-semibold text-dark-surface leading-tight break-words">
        {entry.artist ? <ArtistName name={entry.artist} /> : entry.title}
      </h3>
      {secondary && <p className="text-sm text-outline leading-snug break-words">{secondary}</p>}
      {entry.artist && entry.note && (
        <p className="text-xs text-outline/80 leading-snug break-words">{entry.note}</p>
      )}
      {entry.timeRange && <p className="text-xs text-outline/80 leading-snug mt-0.5 break-words">{entry.timeRange}</p>}
    </div>
  )
}

function RoomColumn({ label, entry, type }: { label: string; entry?: SlotEntry; type: EventType }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold text-outline/70 tracking-widest mb-1.5">{label}</p>
      {entry ? (
        <EntryCard entry={entry} type={type} />
      ) : (
        <p className="text-sm text-outline/40 italic">—</p>
      )}
    </div>
  )
}

function SlotRow({ slot, delay }: { slot: ScheduleSlot; delay: number }) {
  return (
    <div className="reveal flex gap-4" style={{ animationDelay: `${delay}ms` }}>
      <div className="w-16 flex-shrink-0 pt-1">
        <p className="font-bebas text-xl text-miami-gold leading-none">{slot.time}</p>
        <p className="text-[10px] uppercase font-bold text-outline mt-1">{slot.ampm}</p>
      </div>

      <div className="flex-grow pb-6 border-b border-outline-variant/30">
        {slot.main ? (
          <EntryCard entry={slot.main} type={slot.type} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <RoomColumn label="Room 1" entry={slot.room1} type={slot.type} />
            <RoomColumn label="Room 2" entry={slot.room2} type={slot.type} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState(0)
  const filtered = schedule.filter((e) => e.day === activeDay)

  // Horizontal swipe changes the day, from anywhere in the scroll (vertical scroll stays native).
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    // Only act on a clearly horizontal swipe.
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    setActiveDay((d) => {
      const i = days.findIndex((x) => x.n === d)
      const ni = dx < 0 ? Math.min(i + 1, days.length - 1) : Math.max(i - 1, 0)
      return days[ni].n
    })
  }

  return (
    <div className="pb-6" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Title + day selector stay pinned while the slots scroll underneath. */}
      <div className="sticky top-0 z-30 bg-surface px-6 pt-6 pb-3 shadow-[0_6px_8px_-6px_rgba(31,27,18,0.12)]">
        <h1 className="reveal font-bebas text-5xl text-primary mb-5 leading-none">Schedule</h1>

        <div className="reveal flex gap-1.5" style={{ animationDelay: '70ms' }}>
          {days.map((d) => (
            <button
              key={d.n}
              onClick={() => setActiveDay(d.n)}
              className={`flex-1 px-1 py-1.5 rounded-lg text-center transition-all duration-200 active:scale-95 ${
                activeDay === d.n
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-highest text-dark-surface'
              }`}
            >
              <span className="block font-bebas tracking-wide text-sm leading-none whitespace-nowrap">Day {d.n}</span>
              <span
                className={`block text-[8px] font-bold uppercase tracking-tight mt-0.5 whitespace-nowrap ${
                  activeDay === d.n ? 'text-white/80' : 'text-outline'
                }`}
              >
                {d.dow} · {d.date}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pt-6 space-y-6">
        {filtered.map((slot, i) => (
          <SlotRow key={slot.id} slot={slot} delay={i * 70} />
        ))}
      </div>
    </div>
  )
}
