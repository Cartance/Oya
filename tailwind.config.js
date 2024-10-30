/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paste your color code inside here
        satin: "#C25873",
        violetBlue: "#7B67C8",
        violet: "#983F85",
        mustard: "#C98707",
        cultured: "#F7F7F7",
      },
      fontFamily: {
        // paste your font family inside here
        bolota: ["Bolota Bold", "san-serif"],
        alegreya: ["", ""],
      },
    },
  },
  plugins: [],
};
