/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A3A5C",
        "primary-light": "#2563EB",
        accent: "#F59E0B",
        "accent-hover": "#D97706",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        surface: "#FFFFFF",
        bg: "#F8FAFC",
      },
      borderRadius: {
        'radius': '16px',
        'radius-sm': '8px',
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
