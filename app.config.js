const IS_PROD = process.env.APP_VARIANT === 'production';

export default {
  name: IS_PROD ? 'WeechatRN' : 'WeechatRN (Dev)',
  description: 'Weechat relay client using websockets',
  slug: 'WeechatRN',
  newArchEnabled: false,
  ios: {
    bundleIdentifier: IS_PROD
      ? 'com.matthoran.weechatrn'
      : 'com.matthoran.weechatrn.dev',
    supportsTablet: true,
    config: {
      usesNonExemptEncryption: false
    },
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType:
            'NSPrivacyAccessedAPICategorySystemBootTime',
          NSPrivacyAccessedAPITypeReasons: ['35F9.1']
        }
      ]
    },
    buildNumber: '11'
  },
  android: {
    package: IS_PROD ? 'com.matthoran.weechatrn' : 'com.matthoran.weechatrn.dev'
  },
  platforms: ['ios', 'android'],
  version: '1.3.0',
  icon: './assets/icon.png',
  plugins: [
    [
      'expo-splash-screen',
      {
        backgroundColor: '#ffffff',
        image: './assets/splash.png',
        imageWidth: 1242
      }
    ]
  ],
  updates: {
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/5e51d3f0-dc9c-11e8-9dfe-b9e5abc941a4'
  },
  assetBundlePatterns: ['**/*'],
  githubUrl: 'https://github.com/mhoran/weechatRN',
  extra: {
    eas: {
      projectId: '5e51d3f0-dc9c-11e8-9dfe-b9e5abc941a4'
    }
  },
  ...(IS_PROD && {
    runtimeVersion: {
      policy: 'nativeVersion'
    }
  })
};
