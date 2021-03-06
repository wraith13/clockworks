# Clockworks

ð§ This static web application is under development. / ãã® Static Web ã¢ããªã¯éçºä¸­ã§ãã

## Features

- âï¸ Static Single Page Web Application. / éçã·ã³ã°ã«ãã¼ã¸ã¦ã§ãã¢ããªã±ã¼ã·ã§ã³ã
- âï¸ Supports PCs and smartphones. / PCã¨ã¹ããã©ããµãã¼ãã
- âï¸ ãã¼ã¯ã¢ã¼ãå¯¾å¿
- âï¸ å¤è¨èªå¯¾å¿
- ð§ PWSå¯¾å¿

## Development environment construction

0. Install [Visual Studio Code](https://code.visualstudio.com/) ( Not required, but recommended. )
1. Install [Node.js](https://nodejs.org/ja/)
2. Execute `npm install`.

## Build commands

- `npm run-script "build all"`
- `npm run-script "build html"`
- `npm run-script "build style"`
- `npm run-script "build script"`
- `npm run-script "debug build all"`
- `npm run-script "debug build style"`
- `npm run-script "debug build script"`
- `npm run-script "watch script"`

Debug builds embed map files.

## Files

|path|description|
|---|---|
|[`./build.js`](./build.js)|build command script.|
|[`./build.json`](./build.json)|build settings.|
|[`./index.html`](./index.html)|This file is genereted by build.js|
|[`./index.template.html`](./index.template.html)|HTML template|
|[`./resource/images.json`](./resource/images.json)|define image files.|
|[`./resource/lang.en.json`](./resource/lang.en.json)|English language data.|
|[`./resource/lang.ja.json`](./resource/lang.ja.json)|Japanese language data.|
|[`./style/index.less`](./style/index.less)|style source file|
|[`./script/index.ts`](./script/index.ts)|script source file|

## How to publish

1. Fork [this repository](https://github.com/wraith13/clockworks/) on GitHub.
2. Go `Settings`(â`Options`)â`GitHub Pages`, select `master branch` from drop down list, and click `Save`.

## License

[Boost Software License](./LICENSE_1_0.txt)
