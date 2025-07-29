/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}","./src/**/*.{js,jsx,ts,tsx}",],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
      mainOrange: '#FF6B00',
      mainWhite: '#FFFFFF',
      mainGray: '#F3F4F6',
      mainDark: '#374151',
      mainDarkGray: '#6B7280',
      mainRed: '#EF4444',
      mainGrayText: '#4B5563',
      mainLightGrayText: '#9CA3AF',
      bizButton: '#1F2937',
      recruitBg: '#FEF9C3',
      recruitText: '#CA8404',
      reserveBg: '#DBEAFE',
      reserveText: '#2563EB',
      confirmBg: '#DCFCE7',
      confirmText: '#16A34A',
      chatBg: '#EF4444',
      payInfoBg: '#FFF7ED',
      requiredStar: '#EF4444',
      gray150: '#E5E7EB', // gray-100과 gray-200 사이 색상
    },
  },
  },
  plugins: [],
}