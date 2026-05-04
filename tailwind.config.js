/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Noto Sans JP"',
          '"Hiragino Kaku Gothic ProN"',
          '"Yu Gothic"',
          "Meiryo",
          "sans-serif"
        ],
        mono: [
          '"Roboto Mono"',
          '"SFMono-Regular"',
          "Consolas",
          '"Liberation Mono"',
          "monospace"
        ]
      }
    }
  },
  plugins: []
};
