// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // index.html 파일에서 Tailwind 클래스를 사용함을 명시
    "./src/**/*.{js,ts,jsx,tsx}", // (선택) 나중에 JS파일 내에서 클래스를 다룰 경우 대비
  ],
  theme: {
    extend: {
      // 기존에 사용하던 커스텀 설정을 여기에 그대로 옮깁니다.
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
    require('@tailwindcss/line-clamp'), // 이 줄을 추가합니다.
  ],
}