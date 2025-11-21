import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',      // 移动端：16px 左右padding
        sm: '1.5rem',         // 小平板：24px
        lg: '2rem',           // 桌面端：32px
      },
      // 不设置screens，让container在小于lg断点时为100%宽度
      // lg及以上断点会使用Tailwind默认的max-width
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ff9903",
          foreground: "#FFFFFF",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [require("tailwindcss-animate")],
};
export default config;
