module.exports = {
    setManifestVersion: function(contents, version, version_name) {
        let manifest = JSON.parse(contents);
        manifest.version = version;
        if (typeof version_name !== 'undefined') {
            manifest.version_name = version_name;
        }
        return JSON.stringify(manifest);
    }
}
