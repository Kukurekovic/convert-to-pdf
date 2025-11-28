/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: "#3E7BFA",
        "primary-dark": "#2F5FCC",
        "primary-light": "#AECBFF",

        secondary: "#FF7F50",
        "secondary-dark": "#CC653F",

        success: "#4CAF50",
        warning: "#FFC107",
        danger: "#E53935",

        surface: "#F7F7F7",
        border: "#E1E1E1",

        text: "#1A1A1A",
        "text-light": "#777777",

        white: "#FFFFFF",
        black: "#000000",
      },

      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
      },

      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
      },
    },
  },

  plugins: [],
};
