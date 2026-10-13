import { insertContentsInsideSwiftClassBlock } from '@expo/config-plugins/build/ios/codeMod';
import type { ExpoConfig } from 'expo/config';
import { withDangerousMod } from 'expo/config-plugins';
import fs from 'fs/promises';
import path from 'path';

export default function withSceneDelegate(config: ExpoConfig) {
  return withDangerousMod(config, [
    'ios',
    async (nextConfig) => {
      const sceneDelegatePath = path.join(
        nextConfig.modRequest.platformProjectRoot,
        nextConfig.modRequest.projectName as string,
        'SceneDelegate.swift'
      );
      let contents = await fs.readFile(sceneDelegatePath, 'utf8');

      const codeToInject = `
  @available(iOS 26.0, *)
  func preferredWindowingControlStyle(for windowScene: UIWindowScene) -> UIWindowScene.WindowingControlStyle {
    return .minimal
  }
`;
      contents = insertContentsInsideSwiftClassBlock(
        contents,
        'class SceneDelegate',
        codeToInject,
        { position: 'tail' }
      );

      await fs.writeFile(sceneDelegatePath, contents);

      return nextConfig;
    }
  ]);
}
