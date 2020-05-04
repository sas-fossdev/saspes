const package = require('./package.json');
const { execSync } = require('child_process');
const commandExistsSync = require('command-exists').sync;

module.exports = {
    setManifestVersion: function(contents, version, version_name) {
        let manifest = JSON.parse(contents);
        manifest.version = version;
        if (version_name) {
            manifest.version_name = this.versionName();
        }
        return JSON.stringify(manifest);
    },
    isRelease: function() {
        return !!process.env.SASPES_OFFICIAL_RELEASE;
    },
    versionName: function () {
        const version_name = package.version_name_prefix + package.version
        if (this.isRelease()) {
            return version_name;
        }
        return version_name + " Development " + (commandExistsSync('git')? execSync('git describe --tags'): "(Exact Version Unknown)");
    }
}
