/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: "#193f9e", dark: "#16347f", soft: "#e9eef9", line: "#cfd8ee" } },
      keyframes: { pop: { "0%": { opacity: "0", transform: "scale(.85)" }, "100%": { opacity: "1", transform: "scale(1)" } } },
      animation: { pop: "pop .45s cubic-bezier(.2,1.2,.4,1) both" },
    },
  },
  plugins: [],
};
