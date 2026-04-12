/**
 * Candidate portal uses plain CSS (`@import` of design tokens + portal styles).
 * Do not add `@tailwindcss/postcss` here — it processes those files without Tailwind
 * directives and strips or breaks the imported stylesheets, leaving the UI unstyled.
 */
export default {
  plugins: {},
};
