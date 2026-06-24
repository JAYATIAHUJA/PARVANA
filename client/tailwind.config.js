/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ember: {
          deep:    '#0e0a06',
          dark:    '#1a1009',
          mid:     '#2d1a09',
        },
        flame: {
          amber:   '#c8772a',
          gold:    '#e8a83a',
          cream:   '#f5e6c8',
          warm:    '#f0d4a0',
        },
        ash: {
          light:   '#e8ddc8',
          dark:    '#d4c8a8',
        },
        moth: {
          ivory:     '#faf4e8',
          parchment: '#ede3cc',
        },
        // Keep vinyl aliases for backwards compat
        vinyl: {
          cream:    '#f5e6c8',
          paper:    '#ede3cc',
          charcoal: '#1a1009',
          gold:     '#c8772a',
          orange:   '#e8600a',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height%3D'100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
}
