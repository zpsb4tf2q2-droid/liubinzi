import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx,mdx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff',
        },
      },
      boxShadow: {
        focus: '0 0 0 4px rgba(37, 99, 235, 0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
