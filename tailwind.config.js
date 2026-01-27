/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mcg: {
          primary: '#1a472a',
          secondary: '#c9a227',
          dark: '#0d1f15',
          light: '#f5f5f5',
        },
      },
    },
  },
  plugins: [],
};
