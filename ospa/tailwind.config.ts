import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          500: "#2f5fd8",
          600: "#2449ad",
          900: "#111b3d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
