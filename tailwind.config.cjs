/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {},
  },
  prefix: "tw-",
  plugins: [],
  corePlugins: {
    preflight: false,
  },
  safelist: process.env.NODE_ENV === 'development' ? [{ pattern: /.+/ }] : [],
};
console.log(process.env.NODE_ENV);