import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#10131a",
        ink: "#f6f7fb",
        muted: "#9ca3af",
      },
      boxShadow: {
        glow: "0 30px 80px rgba(15, 23, 42, 0.45)",
      },
      fontFamily: {
        sans: ["'Sansita'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
