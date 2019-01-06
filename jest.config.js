const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  preset: "jest-expo",
  transform: {
    ...tsjPreset.transform,
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  globals: {
    'ts-jest': {
      babelConfig: true
    }
  }
}
