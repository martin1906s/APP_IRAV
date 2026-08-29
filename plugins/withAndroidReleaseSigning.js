const {
  withAppBuildGradle,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const PROGUARD_RULES = `
# IRAV — keep Expo / RN modules used by release minify (R8)
-keep class expo.modules.** { *; }
-keep class expo.modules.kotlin.** { *; }
-keep class expo.modules.securestore.** { *; }
-dontwarn expo.modules.kotlin.types.**
-dontwarn expo.modules.kotlin.types.descriptors.**
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.worklets.** { *; }
-keep class com.facebook.react.** { *; }
`;

/** Inyecta firma release + reglas ProGuard tras cada prebuild */
function withAndroidReleaseSigning(config) {
  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const rulesPath = path.join(
        cfg.modRequest.platformProjectRoot,
        'app',
        'proguard-rules.pro',
      );
      let existing = '';
      if (fs.existsSync(rulesPath)) {
        existing = fs.readFileSync(rulesPath, 'utf8');
      }
      if (!existing.includes('IRAV — keep Expo')) {
        fs.writeFileSync(rulesPath, `${existing.trimEnd()}\n${PROGUARD_RULES}\n`, 'utf8');
      }
      return cfg;
    },
  ]);

  return withAppBuildGradle(config, (gradleConfig) => {
    let contents = gradleConfig.modResults.contents;

    if (!contents.includes('MYAPP_UPLOAD_STORE_FILE')) {
      contents = contents.replace(
        /signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\}\s*\}/,
        `signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }`,
      );

      contents = contents.replace(
        /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
        '$1signingConfig signingConfigs.release',
      );
    }

    gradleConfig.modResults.contents = contents;
    return gradleConfig;
  });
}

module.exports = withAndroidReleaseSigning;
