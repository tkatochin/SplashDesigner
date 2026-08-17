export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        Audio: "readonly",
        AudioContext: "readonly",
        Path2D: "readonly",
        document: "readonly",
        navigator: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        window: "readonly"
      }
    }
  }
];
