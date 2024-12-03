const {getDefaultConfig} = require('@expo/metro-config');
const {mergeConfig} = require('metro-config');
const path = require('path');

const myExtraModuleDir = path.resolve(__dirname, "../react-native-reanimated/packages/react-native-reanimated");
const extraNodeModules = {
  'react-native-reanimated': myExtraModuleDir,
};
/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
 watchFolders: [myExtraModuleDir],
  resolver: {
    extraNodeModules: new Proxy(extraNodeModules, {
      get: (target, name) =>
        // redirects dependencies referenced from myExtraModule/ to local node_modules
        name in target ? target[name] : path.join(process.cwd(), `node_modules/${name}`),
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
