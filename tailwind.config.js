/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: '#5B4FE8',
        primaryDark: '#9D8FFF',
        secondary: '#7C3AED',
        secondaryDark: '#C084FC',
        tertiary: '#C026D3',
        tertiaryDark: '#E879A0',
        background: '#F5F3FF',
        backgroundDark: '#0A0818',
        surface: '#FFFFFF',
        surfaceDark: '#13102A',
        surfaceVariant: '#EDE9FE',
        surfaceVariantDark: '#1E1B40',
        onSurface: '#1A1635',
        onSurfaceDark: '#E8E5FF',
        onSurfaceVariant: '#4C4578',
        onSurfaceVariantDark: '#C4BCFF',
        error: '#DC2626',
        errorDark: '#FCA5A5',
      },
    },
  },
  plugins: [],
}
