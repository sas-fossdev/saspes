/*
This is a slightly modified version of rahatarmanahmed's get-key-range npm package. You can see the package at 
https://www.npmjs.com/package/get-key-range
*/

function getKeyRange(obj, key) {
    let ranges = Object.keys(obj);
    for (let i = ranges.length - 1; i >= 0; i--) {
        if (isInRange(ranges[i], key)) return obj[ranges[i]]
    }
}
function isInRange(ranges, n) {
    ranges = ranges.split(/\s*,\s*/);
    return ranges.some(inRange.bind(null, n));

    function inRange(n, range) {
        var limits = range.split(/\s*-\s*/);

        if (limits.length === 1) return range == n;
        if (limits.length !== 2) throw new Error('Invalid range:' + range);

        var max = Math.max(limits[0], limits[1]);
        var min = Math.min(limits[0], limits[1]);

        return min <= n && n <= max;
    }
}

window.getKeyRange = getKeyRange;