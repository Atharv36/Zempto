/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors : {
            "primary-200":"#ffffff",
            "primary-100":"#ffc929",
            "secondary-200":"#00b050",
            "secondary-100":"#0b1a78",
            danger: '#ff0000'

            
        }
    },
  },
  plugins: [],
}
export default config;