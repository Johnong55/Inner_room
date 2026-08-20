/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#0d171b",
        "ink-raised": "#15252a",
        "ink-soft": "#1d3034",
        cream: "#efe7d8",
        fog: "#a5b2ae",
        moss: "#91aa9d",
        rain: "#7897ad",
        ember: "#c5a477",
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
