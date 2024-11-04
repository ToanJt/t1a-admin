/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      width: {
        1286: "1286px",
      },
      fontSize: {
        15: "15px",
        17: "17px",
        19: "19px",
        28: "28px",
      },
      colors: {
        primary: "#39465f",
        "vr-light-gray": "rgb(249, 249, 249)",
        "vr-light-gray-blur": "rgb(0, 0, 0, 0.65)",
        "black-rgba": "rgba(0, 0, 0, 0.65)",
      },
    },
  },
  plugins: [],
};
