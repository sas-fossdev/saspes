const package = require('./package.json');
const { execSync } = require('child_process');
const commandExistsSync = require('command-exists').sync;

module.exports = {
    setManifestVersion: function(contents, version, version_name) {
        let manifest = JSON.parse(contents);
        manifest.version = version;
        if (typeof version_name !== 'undefined') {
            manifest.version_name = version_name;
        }
        return JSON.stringify(manifest);
    },
    isRelease: function() {
        return !!process.env.SASPES_OFFICIAL_RELEASE;
    },
    versionName: function () {
        if (this.isRelease()) {
            return package.version_name;
        }
        return package.version_name + " Development " + (commandExistsSync('git')? execSync('git describe --tags'): "(Exact Version Unknown)");
    }
}
