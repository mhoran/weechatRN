import type { ExpoConfig } from 'expo/config';
import {
  withAppDelegate,
  withInfoPlist,
  withXcodeProject
} from 'expo/config-plugins';
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

function patchAppDelegate(contents: string) {
  if (
    contents.includes(
      'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
    )
  ) {
    return contents;
  }

  let nextContents = contents;

  const classDeclarationPattern = `class AppDelegate: ExpoAppDelegate {`;
  if (!nextContents.includes(classDeclarationPattern)) {
    throw new Error(
      'Could not find the expected AppDelegate class declaration.'
    );
  }
  nextContents = nextContents.replace(
    classDeclarationPattern,
    'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
  );

  const startupBlockPattern = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

`;
  if (!nextContents.includes(startupBlockPattern)) {
    throw new Error(
      'Could not find the Expo AppDelegate React Native startup block.'
    );
  }

  nextContents = nextContents.replace(startupBlockPattern, '');

  const linkingApiPattern = `
  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
`;

  if (!nextContents.includes(linkingApiPattern)) {
    throw new Error('Could not find the Expo AppDelegate Linking API block.');
  }

  nextContents = nextContents.replace(linkingApiPattern, '');

  return nextContents;
}

function withPatchedAppDelegate(config: ExpoConfig) {
  return withAppDelegate(config, (nextConfig) => {
    if (nextConfig.modResults.language !== 'swift') {
      throw new Error(
        `Cannot apply iOS scene lifecycle plugin to ${nextConfig.modResults.language} AppDelegate. Swift is required.`
      );
    }

    // eslint-disable-next-line no-param-reassign
    nextConfig.modResults.contents = patchAppDelegate(
      nextConfig.modResults.contents
    );
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

export default function withIosSceneLifecycle(config: ExpoConfig) {
  return withPatchedAppDelegate(
    addInfoPlistSceneManifest(addSceneDelegateToProject(config))
  );
}
