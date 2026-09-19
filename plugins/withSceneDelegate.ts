import type { ExpoConfig } from 'expo/config';
import { withInfoPlist, withXcodeProject } from 'expo/config-plugins';
import fs from 'fs';
import path from 'path';

function addInfoPlistSceneManifest(config: ExpoConfig) {
  return withInfoPlist(config, (nextConfig) => {
    // eslint-disable-next-line no-param-reassign
    nextConfig.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate'
          }
        ]
      }
    };

    return nextConfig;
  });
}

function addSceneDelegateToProject(config: ExpoConfig) {
  return withXcodeProject(config, (config) => {
    const proj = config.modResults;
    const projectName = config.modRequest.projectName;
    if (!projectName) return config;

    if (proj.hasFile(path.join(projectName, 'SceneDelegate.swift')) !== false) {
      throw new Error('SceneDelegate.swift already declared in project.');
    }

    const platformProjectRoot = config.modRequest.platformProjectRoot;
    const sourceFile = path.resolve(__dirname, 'SceneDelegate.swift');
    const destFile = path.resolve(
      platformProjectRoot,
      projectName,
      'SceneDelegate.swift'
    );
    fs.copyFileSync(sourceFile, destFile);

    const group = proj.pbxGroupByName(projectName);
    if (!group || !group.name) return config;
    const key = proj.findPBXGroupKey({
      name: group.name
    });

    config.modResults.addSourceFile(
      path.join(projectName, `SceneDelegate.swift`),
      undefined,
      key
    );

    return config;
  });
}

export default function withSceneDelegate(config: ExpoConfig) {
  return addInfoPlistSceneManifest(addSceneDelegateToProject(config));
}
