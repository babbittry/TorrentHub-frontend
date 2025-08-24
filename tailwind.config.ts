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
            foreground: "#FFFFFF",
          },
          success: {
            DEFAULT: "#18a34a",
            foreground: "#FFFFFF",
          },
          warning: {
            DEFAULT: "#f59e0b",
            foreground: "#FFFFFF",
          },
        },
      },
      dark: {
        colors: {
          primary: {
            DEFAULT: "#ff9903",
            foreground: "#FFFFFF",
          },
          success: {
            DEFAULT: "#18a34a",
            foreground: "#FFFFFF",
          },
          warning: {
            DEFAULT: "#f59e0b",
            foreground: "#FFFFFF",
          },
        },
      },
    },
  })],
};
export default config;
