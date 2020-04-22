module.exports = {
  "presets": ["@babel/preset-env"],
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": 3
      }
    ],
    // import() 按需加载
    "@babel/plugin-syntax-dynamic-import"
  ]
}
