import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E8',
        ink: '#1A1A1A',
        blue: '#1A5CFF',
        orange: '#FF6B35',
        yellow: '#FFD166',
        paper: '#FFFAF0'
      },
      fontFamily: {
        serifDisplay: ['DM Serif Display', 'serif'],
        mincho: ['Shippori Mincho', 'serif'],
        ud: ['BIZ UDMincho', 'serif']
      },
      boxShadow: {
        hard: '5px 5px 0 #1A1A1A',
        panel: '0 18px 48px rgba(26,26,26,0.10)'
      }
    }
  },
  plugins: []
}

export default config
