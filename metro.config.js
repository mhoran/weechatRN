/* eslint-disable @typescript-eslint/no-require-imports */
const { getDefaultConfig } = require('@expo/metro-config');
const { mergeConfig } = require('metro-config');
const path = require('path');

const watchFolders = [];
const extraNodeModules = {};
const dependencies = require('./package.json').dependencies;
const devDependencies = require('./package.json').devDependencies;
Object.entries(dependencies)
  .concat(Object.entries(devDependencies))
  .forEach(([dependencyName, dependencyVersion]) => {
    if (dependencyVersion.match(/^file:/)) {
      const fullPath = path.resolve(
        __dirname,
        dependencyVersion.replace(/^file:/, '')
      );
      watchFolders.push(fullPath);
      extraNodeModules[dependencyName] = fullPath;
    }
  });

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: watchFolders,
  resolver: {
    extraNodeModules: new Proxy(extraNodeModules, {
      get: (target, name) =>
        // redirects dependencies referenced from extraNodeModules to local node_modules
        name in target
          ? target[name]
          : path.join(process.cwd(), `node_modules/${name}`)
    })
  }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
