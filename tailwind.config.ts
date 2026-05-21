import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'flamingo-pink': '#E8638A',
        'flamingo-dark': '#A8395C',
        'miami-gold': '#F5C842',
        'miami-turquoise': '#4BBFBF',
        'tropical-green': '#3A7D2C',
        'wood-brown': '#5C3A1E',
        'dark-surface': '#1f1b12',
        'surface': '#fff8f1',
        primary: '#755b00',
        secondary: '#a83159',
        'on-surface': '#1f1b12',
        outline: '#7f7662',
        'outline-variant': '#d1c5ae',
        'surface-container': '#f6edde',
        'surface-container-highest': '#eae1d3',
        'secondary-container': '#fc739a',
        'on-secondary-container': '#720032',
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        vibes: ['"Great Vibes"', 'cursive'],
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
