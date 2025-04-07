module.exports = {
  presets: [
    "module:metro-react-native-babel-preset",
    "@babel/preset-typescript",
  ],
  plugins: [
    ["@babel/plugin-transform-class-properties", { loose: true }],
    ["@babel/plugin-transform-private-methods", { loose: true }],
    ["react-native-reanimated/plugin"],
  ],
  overrides: [
    {
      test: /node_modules\/problematic-library/,
      plugins: [["@babel/plugin-transform-class-properties", { loose: true }]],
    },
  ],
};
