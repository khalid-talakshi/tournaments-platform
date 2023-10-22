import type { Config } from "tailwindcss";
import radixPlugin from "tailwindcss-radix";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: "IBM Plex Sans, ui-sans-serif",
      },
    },
  },
  plugins: [radixPlugin],
} satisfies Config;
