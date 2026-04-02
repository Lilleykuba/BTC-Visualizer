/** @type {import("tailwindcss").Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "rgb(var(--color-base) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        surfaceAlt: "rgb(var(--color-surface-alt) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        accentStrong: "rgb(var(--color-accent-strong) / <alpha-value>)",
        mint: "rgb(var(--color-mint) / <alpha-value>)",
        sky: "rgb(var(--color-sky) / <alpha-value>)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      boxShadow: {
        panel: "0 20px 60px rgba(24, 24, 27, 0.08)"
      },
      fontFamily: {
        sans: ['"Manrope Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Newsreader Variable"', "ui-serif", "Georgia", "serif"]
      },
      backgroundImage: {
        grid:
          "linear-gradient(to right, rgba(115, 115, 115, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(115, 115, 115, 0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};
