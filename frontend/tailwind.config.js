/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        mono: ['Source Code Pro', 'monospace'],
      },
      colors: {
        border: "#4E4E4E",
        background: "#212121",
        foreground: "#ffffff",
        white: {
          100: '#FFFFFF',
          200: '#FAFAFA',
          300: '#EEEEEE',
          400: '#EAEAEA',
          500: '#DDDDDD',
          600: '#CCCCCC',
          700: '#BBBBBB',
          800: '#AAAAAA',
          900: '#888888',
        },
        gray: {
          50: '#999999',
          100: '#8c8c8c',
          200: '#7f7f7f',
          300: '#727272',
          400: '#656565',
          500: '#585858',
          600: '#4b4b4b',
          700: '#3e3e3e',
          800: '#313131',
          850: '#282828',
          900: '#222222',
          925: '#191919',
          950: '#151515',
          750: '#2D2D2D', // Adjust this value as needed
        },
        // ... other color definitions ...
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        // Add more custom sizes as needed
      },
      borderWidth: {
        DEFAULT: '1px', // Set default border width to 1px
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require('@tailwindcss/typography')],
}