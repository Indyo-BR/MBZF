const themedNights = [
  {
    id: 'white',
    title: 'White Night',
    date: 'Friday, April 23',
    img: 'https://loremflickr.com/800/400/white,party,elegant',
  },
  {
    id: 'pool',
    title: 'Pool Flamingo',
    date: 'Saturday, April 24',
    img: 'https://loremflickr.com/800/400/pool,flamingo,miami',
  },
  {
    id: 'carnaval',
    title: 'Carnaval Gala',
    date: 'Sunday, April 25',
    img: 'https://loremflickr.com/800/400/carnival,brazil,colorful',
  },
]

export default function BallroomsPage() {
  return (
    <div className="px-6 pt-6 pb-6">
      <h1 className="font-bebas text-5xl text-primary mb-6 leading-none">Themed Nights</h1>
      <div className="grid grid-cols-1 gap-6">
        {themedNights.map((n) => (
          <div key={n.id} className="relative h-48 rounded-2xl overflow-hidden shadow-lg group">
            <img src={n.img} alt={n.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h2 className="font-bebas text-4xl text-miami-gold leading-none">{n.title}</h2>
              <p className="font-bebas text-white text-sm tracking-widest mt-1">{n.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
