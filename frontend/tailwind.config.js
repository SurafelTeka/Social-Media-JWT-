/** @type {import('tailwindcss').Config} */
export default {
  // This content array tells Tailwind CSS which files to scan for class names
  // It is essential for Tailwind to generate the correct styles
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
