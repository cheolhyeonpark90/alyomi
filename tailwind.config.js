// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html", // 루트의 html 파일
    "./*.js",   // 루트의 js 파일 (ui.js, home.js 등)
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        'alyomi-pink': '#ff8fab',
        'alyomi-coral': '#ff9a8b',
        'alyomi-yellow': '#fff8e1',
        'alyomi-bg': '#fdfcff',
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'), // ✅ 플러그인 추가
  ],
}