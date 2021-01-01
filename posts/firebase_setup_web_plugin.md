---
title: "FirebaseのWebプロジェクトをビルドしやすくするモジュールを作った"
publishedAt: "2019-03-14T07:34:57+09:00"
---

# 注意
2020/11/12現在このライブラリは動作しないです。
そのうち更新しますがご注意ください

# はじめに
FirebaseでWebプロジェクトを作る際に
`API_KEY`などをGitでどう管理するか悩んだ結果、
管理しなくて済むようにビルド時に解決するモジュールを作ったので紹介します。

# 成果物
とりあえず成果物を見たい方はこちらをどうぞ

[GitHub](https://github.com/taqm/firebase-setup-web)
[npm](https://www.npmjs.com/package/firebase-setup-web)


# 背景
最近よく目にする`Firebase`ですが、
Webプロジェクトでは初期化のため以下のような記述が必要です。

```javascript
const firebase = require("firebase");
const config = {
  apiKey: "XXXXX",
  authDomain: "XXXXX.firebaseapp.com",
  databaseURL: "https://XXXXX.firebaseio.com",
  projectId: "XXXXX",
  storageBucket: "XXXXX.appspot.com",
  messagingSenderId: "XXXXX"
};
firebase.initializeApp(config);
```
（↑ 公式のサンプルを少しいじったもの


こういうチュートリアル的な記述って
キーとかが文字リテラルでべた書きされていることが多いのですが
「Gitでどう管理するんだ？」ってなりますよね :rolling_eyes:

# 管理方法
## ベタ書きのまま
別に見られて困るものでもないのでそれでもいいと思います。
さらにプライベートリポジトリならまず問題ないでしょう。

でも定数がソースコードにベタ書きなのは、
精神衛生上は良くないのでこれは採用したくないです。

（あと開発が１環境で済むはずがないですし

## ビルド時に環境変数から取得

大体の場合は環境変数に突っ込むことが選択肢の上位になりますよね。

`webpack.config.js`や`nuxt.config.js`、`gulpfile.js`など
ビルド設定スクリプトで環境変数を参照することで解決します。

そしてローカル環境で環境変数の設定は面倒なので
`dotenv`や`env-cmd`を使うことになると思います。

割といい感じかと思いましたが、
ボクは値そのものを管理したくないし見たくもないのです。

**ちなみに**
この`.env`ファイルや↑のベタ書きファイルを
GitHubのパブリックリポジトリに突っ込むとGitHubさんから連絡がきます。

## firebase-toolsを使って動的に取得
firebaseのcliとしてインストールする `firebase-tools`。
こちらを使うことで現在有効になっているfirebaseプロジェクトの設定が取得できます。

```javascript
const firebaseTools = require('firebase-tools');
firebaseTools.setup.web().then((config) => {
  // ここで設定から処理を行える
});
```

かなりいい感じです！
ただし困った点が...

この機能は非同期な処理なので、
同期的な処理の中に組み込みづらいんですよね :frowning2:

# 作りました

結局どれもしっくり来なかったので
↓この２つを要件として作りました

- 同期的にJSONが取得できる
- このために別モジュールを必要としない（なにかに依存しない）



## 使い方

このモジュールは対象のプロジェクトで
`firebase setup:web`コマンドが実行できることが前提です！
firebaseの開発者はみんな実行できますよね...?

今回作成した`firebase-setup-web`を読み込むことで
同期的に設定を読み込みJSONで扱えるようにしてくれます。
Webpackで利用する場合を例として紹介します。

■ `Webpack.DefinePlugin`で使う場合

```javascript:webpack.config.js
const config = require('firebase-setup-web');

const defParams = {
  'process.env.FB_PROJECT_ID': JSON.stringify(config.projectId),
}

// webpack config
module.exports = {
  plugins: [
    new webpack.DefinePlugin(defParam),
  ],
};
```
↑のように設定情報を変換したい文字列として登録してあげます。

読み込むだけで設定オブジェクトが取得できるので、自由にビルドの設定を行いましょう。
もちろんただのスクリプトなので`nuxt.config.js`などでも使えます:ok_hand:

## CIの中で使う
CIで利用する場合には
`firebase login:ci`というコマンドで取得できるトークンを利用します。
ビルド時に環境変数`FB_CI_TOKEN`へ上記コマンドの結果を設定してください。

環境変数が存在すればそのトークンからプロジェクト情報を取得します。

## 型定義
ちゃんと`index.d.ts`も用意したのでTypeScriptでも扱いやすいです！

## 実装の解説

`firebase`コマンドの中に`setup:web`というサブコマンドがあり、
これを実行することで現在有効なプロジェクト設定を取得することができます。
（前述した**firebase-toolsを使って動的に取得**と内部的には同じ処理が動くようです。

早速実行!

```bash
$ firebase setup:web

// Copy and paste this into your JavaScript code to initialize the Firebase SDK.
// You will also need to load the Firebase SDK.
// See https://firebase.google.com/docs/web/setup for more details.

firebase.initializeApp({
  "apiKey": "XXXXX",
  "authDomain": "XXXXX.firebaseapp.com",
  "databaseURL": "https://XXXXX.firebaseio.com",
  "projectId": "XXXXX",
  "storageBucket": "XXXXX.appspot.com",
  "messagingSenderId": "XXXXX"
});
```

うぐっ！！！
なんと使いづらい....

すごく親切で「これをコピペしてね！」って言ってますが、
今回欲しいのは中のJSONだけなのです。

### コマンドの結果をパース
最終的なビルドはJavaScriptで書くので、パース処理もJavaScriptで記述します。
コマンドは`child_process`を使って実行！

```javascript:index.js
const { execSync } = require('child_process');

const firebase = {
  initializeApp: c => c,
};

const CMD = 'firebase setup:web';
const res = execSync(CMD);
const fnc = Buffer.from(res, 'utf-8').toString();
const config = eval(fnc); // eslint-disable-line no-eval
module.exports = config;
```

せっかくGoogleさんが親切に実行できる形で出力してくれているので、
`firebase.initializeApp`を実際に用意して実行してあげましょう。

`initializeApp`には設定オブジェクトが渡ってくるのでそのまま返却します。
そしてエクスポート。

これでこのモジュールを読み込むとfirebaseの設定が取得できます :relaxed:

# 課題
１つのアプリで複数のFirebaseプロジェクトを扱う場合には
このモジュールを使うことはできません。
どれくらい需要がある機能なのかも不明なためとりあえずそのままで。

# まとめ

実装は１ファイルで依存もなし。これだけ聞くとかなり優秀なモジュールが完成しました。

ただコマンド叩いていたり、evalを使ったりとあまりよくない実装ですが
ビルド用のスクリプトなので目をつむっていただけると...（汗

あまり類似ツールが存在するかは調べていないので
他に良いツールがあったりする場合は教えていただけると嬉しいです！

--- 

おしまい
