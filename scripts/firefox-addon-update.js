const Axios = require('axios');
const fs = require('fs');
const path = require('path');

async function main () {
    // Check for required argument
    if (process.argv.length < 3) {
        console.log("Script requires the path of the update.json file as an argument");
        process.exit(1);
    }
    let res = await Axios.get('https://api.github.com/repos/gary-kim/saspes/releases', {
        headers: requestHeaders(),
    }).catch(() => {
        process.exit(1);
    });
    if (res.status !== 200) {
        process.exit(1);
    }
    let asset;
    let i = 0;
    for (; i < res.data.length; i++) {
        let assets = res.data[i].assets.filter(e => extension(e.name) === "xpi");
        if (assets.length !== 0) {
            asset = assets[0];
            break;
        }
    }
    if (!asset) {
        process.exit(1);
    }

    let tr = {
        addons: {
            "saspowerschoolff@ydgkim.com": {
                updates: [
                    {
                        version: res.data[i].tag_name.substring(1),
                        "update_link": asset.browser_download_url,
                    }
                ]
            }
        }
    };
    if (process.argv[2] === '-') {
        console.log(JSON.stringify(tr));
        return;
    }
    fs.writeFileSync(path.resolve(process.cwd(), process.argv[2]), JSON.stringify(tr));
    console.log("Update successful!");
}

function extension (input) {
    let split = input.toString().split(".");
    return split[split.length - 1];
}

function requestHeaders () {
    if (!process.env.GITHUB_TOKEN) {
        return {}
    }
    return {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
    }
}

main().catch(() => {
    process.exit(1);
});
