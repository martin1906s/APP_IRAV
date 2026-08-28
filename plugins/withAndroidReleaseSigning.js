const { withAppBuildGradle } = require('@expo/config-plugins');

/** Inyecta firma release en build.gradle tras cada prebuild */
function withAndroidReleaseSigning(config) {
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
