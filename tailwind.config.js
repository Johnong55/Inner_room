/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#11120f",
        "ink-raised": "#191a16",
        "ink-soft": "#22231e",
        cream: "#eee9dc",
        fog: "#aaa69c",
        moss: "#b9aa8d",
        rain: "#aaa69c",
        ember: "#b9aa8d",
      },
      fontFamily: {
        sans: ["Manrope_400Regular"],
        medium: ["Manrope_500Medium"],
        semibold: ["Manrope_600SemiBold"],
        display: ["CormorantGaramond_600SemiBold"],
      },
    },
  },
  plugins: [],
};
