import type { Config } from 'tailwindcss';
import {heroui} from "@heroui/react";

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/react/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      light: {
        colors: {
          primary: {
            DEFAULT: "#ff9903",
            foreground: "#FFFFFF", // White text on the primary button
          },
        },
      },
      dark: {
        colors: {
          primary: {
            DEFAULT: "#ff9903",
            foreground: "#FFFFFF", // White text on the primary button
          },
        },
      },
    },
  })],
};
export default config;
