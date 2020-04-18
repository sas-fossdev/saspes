## Contributing to SAS Powerschool Enhancement Suite

Thank you for considering contributing to SAS Powerschool Enhancement Suite.

If you're just starting out, have a look at the issues labeled [good first issue](https://github.com/gary-kim/saspes/labels/good%20first%20issue). You can also take a look at the issues labeled [help wanted](https://github.com/gary-kim/saspes/labels/help%20wanted).

### Building
SAS PES uses Webpack so you will have to run a few commands to get a development version of the extension.

First of all, you will need to install [Node.js](https://nodejs.org/en/) for your platform. Follow the installation instructions on the [Node.js Website](https://nodejs.org/en/) or take a look in your OS's package manager.

After running the following commands, you will have a directory named `dist`. You can then add this directory in as an extension in your browser of choice.

#### For Firefox
```
npm install

# Development Mode
npm run webpack:dev:firefox

# Production Mode
npm run webpack:build:firefox
```

#### For Chromium/Chromium based browsers
```
npm install

# Development Mode
npm run webpack:dev:chromium

# Production Mode
npm run webpack:build:chromium
```

### Sign-off your commit

When you commit your change, please sign off on your work to certify that you have read and agreed to the [Developer Certificate of Origin](#developer-certificate-of-origin). By signing off on your commit, you certify that the changes are yours or you have the right to use it in an open source contribution.

You can easily sign off on your work by adding the `-s` flag when you commit your change.
```
git commit -s
```
Otherwise, you can add the following line to your commit message to certify the DCO.
```
Signed-off-by: Random J Developer <random@developer.example.org>
```

### Pull Request

Once you fix an issue or add/improve a feature, make a pull request to this repository. Your pull request will be tested automatically, manually reviewed and, hopefully, get merged into the project and released as part of the next release. Your name will also be added to the changelog to credit your change. You should also add your name to the [AUTHORS](AUTHORS) file for your first commit to the repo.

By making a contribution to SAS Powerschool Enhancement Suite, you provide a [AGPL-3.0-only](/LICENSE) license but you keep copyright ownership of your contribution.

### License Header

If you modify an existing file, add your copyright notice to the file. Something like this:
```
@copyright Copyright (c) <year> <your name> <<your email address>>
```
For a new file, add this license header to the top of the file:
```
/**
 *
 * @copyright Copyright (c) <year> <your name> <<your email address>>
 *
 * @author <your name> <<your email address>>
 *
 * @license GNU AGPL version 3 only
 *
 * SAS Powerschool Enhancement Suite - A browser extension to improve the experience of SAS Powerschool.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
```

### Make a new release

1. Ensure that all CI tests pass on the latest commit.
2. Update the version number with `npm version [major|minor|patch] --no-git`.
3. Run [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator) with `--since-tag <LAST VERSION> --future-release <NEW VERSION>` and take the resulting generated changelog and adjust it to our changelog style. ([gary-kim/gcg-fork](https://github.com/gary-kim/gcg-fork) has a patch for making the changelog in SASPES's style)
4. Commit with the message `Open Beta v[VERSION] Release`.  Add this to the [CHANGELOG.md](CHANGELOG.md) file and make a PR for the new version. Wait until this PR gets merged (unlike other PRs, this PR should be merged with `--ff-only` rather then a merge commit).
5. Run `npm ci` to install all dependencies for building from [package-lock.json](package-lock.json).
6. Tag the new release with `git tag VERSION -s` (ex: `git tag v0.20.0 -s`), add the new version name as the annotation (ex: `Open Beta 0.20.0`), then run `git push origin VERSION`.
7. Run `npm run libraries` to generate third-party library attributions.
8. Run `npm run clean`, `SASPES_OFFICIAL_RELEASE=true npm run webpack:build:firefox`, then `npm run package`. Upload the resulting package to [AMO](https://addons.mozilla.org/en-US/developers/addons) to have the extension signed. Upload the result into GitHub releases then update the update server to point to the new release.
9. Run `npm run clean`, `SASPES_OFFICIAL_RELEASE=true npm run webpack:build:chromium`, then `npm run package`. Upload the resulting package to [CWS](https://chrome.google.com/webstore/developer/dashboard) to have the new version signed and released.

### Developer Certificate of Origin
```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.
1 Letterman Drive
Suite D4700
San Francisco, CA, 94129

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.


Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.

```
