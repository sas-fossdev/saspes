## Contributing to SAS Powerschool Enhancement Suite

Thank you for considering contributing to SAS Powerschool Enhancement Suite.

If you're just starting out, have a look at the issues labeled [good first issue](https://github.com/gary-kim/saspes/labels/good%20first%20issue). You can also take a look at the issues labeled [help wanted](https://github.com/gary-kim/saspes/labels/help%20wanted).

### Developing
SAS PES uses Webpack so you will have to run a few commands to get a development version of the extension. After running the following commands, you will have a directory named `dist`. You can then add this directory in as an extension in your browser of choice.

#### For Firefox
```
npm install
npm run webpack:build:firefox
```

#### For Chromium/Chromium based browsers
```
npm install
npm run webpack:build:chromium
```


Once you fix an issue or add/improve a feature, make a pull request to this repository. It will be reviewed and , hopefully, get merged into the project and released as part of the next release. Your name will also be added to the changelog to credit your change.

By making a contribution to SAS Powerschool Enhancement Suite, you provide a [GPL-3.0-only](/LICENSE) license.
