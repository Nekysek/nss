/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': 'rgb(20,20,20)',
        'box': 'rgb(30,30,30)',
        'contextmenu': 'rgb(40,40,40)',
        'expand': '#00a7ec',
        'sidebar-bg': '#4E31AA',
        'editor_option_hover_bg': 'rgba(0, 23, 99, 0.2)'
      }
    },
  },
  plugins: [],
}

