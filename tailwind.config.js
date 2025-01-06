/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        typing: 'typing 3s steps(40) 1s infinite normal both',
        blink: 'blink 0.75s step-end infinite'
      },
      keyframes: {
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' }
        },
        blink: {
          '50%': { opacity: '0' }
        }
      }
    },
  },
  plugins: [require('daisyui')],
}
