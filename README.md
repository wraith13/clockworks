# Never Stop Watch

🚧 This static web application is under development. / この Static Web アプリは開発中です。

## Features

- ✅️ Static Single Page Web Application. / 静的シングルページウェブアプリケーション。
- ✅️ Supports PCs and smartphones. / PCとスマフォをサポート。
- ✅️ ダークモード対応
- ✅️ 多言語対応

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

1. Fork [this repository](https://github.com/wraith13/never-stop-watch/) on GitHub.
2. Go `Settings`(→`Options`)→`GitHub Pages`, select `master branch` from drop down list, and click `Save`.

## License

[Boost Software License](./LICENSE_1_0.txt)
