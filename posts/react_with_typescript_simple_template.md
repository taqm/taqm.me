---
title: "React & TypeScript をシンプルに始める(create-react-appなし)"
publishedAt: "2018-09-21T18:10:39+09:00"
tags:
  - TypeScript
  - React
---


ココ最近では
「Reactを触るなら**TypeScript**！」っていうのが
デファクトスタンダードになっていると思います。（願望）

布教も兼ねて
**TypeScript & React** を１からシンプルに始める方法をまとめてみました。

ちなみに本家が出している`create-react-app`は利用しません！

# 環境構築
利用する技術について最初にまとめておきます

- Yarn
- TypeScript
- React.js
- webpack
- webpack-dev-server

## プロジェクトの作成
```bash
mkdir ts-react-sample
cd ts-react-sample

yarn init -y
mkdir src
```

これで最小限のフロントエンドのプロジェクトが整いました。
用途に合わせて`package.json`はカスタマイズしてください

## TypeScriptの準備

続いてTypeScriptを使えるようにしていきましょう!

```bash
yarn add -D typescript ts-node
touch tsconfig.json
```
ts-nodeを利用することで、webpackの設定をTypeScriptで記述することができます。
後述するのでここではこの程度の理解で大丈夫です。

tsconfig.jsonにTypeScriptでどういった事を行うのか設定していきましょう。
深掘りしだすとここだけで記事にできるレベルなので簡潔に！

```json:./tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./",
    "target": "es5",
    "strict": true,
    "module": "commonjs",
    "jsx": "react",
    "lib": [
      "es5",
      "es6",
      "dom",
    ]
  }
}
```

Reactを利用するため`jsx: "react"`を設定しています。

## Reactの準備
```bash
yarn add react react-dom
yarn add -D @types/react @types/react-dom
```
`react`とは別に`react-dom`を追加する必要があります。
DOMというHTML的な要素を操作するものは、reactの本質ではないということで
一部の機能が切り出されたものが`react-dom`になります。

そしてTypeScriptに必要な定義ファイルも忘れずに追加します。

## webpackの準備
ここではwebpackと開発用サーバの設定を行います

```bash
yarn add -D webpack webpack-cli @types/webpack #webpack
yarn add -D awesome-typescript-loader # typescript
yarn add -D webpack-dev-server @types/webpack-dev-server # server
```

webpack4系からcliが分離されたため別に追加します。
そして`@types/webpack`も追加してしまいましょう。

先程`ts-node`を追加したことで、
webpackの設定をTypeScriptで記述することができます
設定ファイルもなかなか覚えることが多いので、
補完が効く&コンパイルエラーが出てくれるのは非常に快適です。[公式ページ](https://webpack.js.org/configuration/configuration-languages/#typescript)

ではwebpackの設定ファイルを記述していきましょう

```typescript:webpack.config.ts
import * as path from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
  context: path.join(__dirname, 'src'),
  entry: './index.tsx',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/assets',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'awesome-typescript-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', 'jsx'],
  },
  devServer: {
    contentBase: path.join(__dirname, 'static'),
    host: '0.0.0.0',
  },
};

export default config;
```

ほとんどwebpackの説明になってしまいますが、
せっかくなのである程度の説明を行います。

### $.context
ビルド対象となるディレクトリ。
後述するentryポイントはこのディレクトリからの相対パスになります。

### $.entry
エントリーポイントとなるファイル。
まだ作成していませんが`src/index.tsx`を作る予定です。

複数のファイルをエントリーとして、複数ファイルを出力したい場合は、
ここをオブジェクトにすることができます。

```typescript
{
  entry: {
    index: './index.tsx',
    about: './about.tsx',
  },
}
```

### $.output
成果物に対する設定。

**path**
成果物の出力先。
ここは絶対パスである必要があるので**要注意**です。

**filename**
成果物のファイル名。
entryが複数ある場合は`[name].bundle.js`とすることで
複数のファイルを出力することになります。

**publickPath**
webpack-dev-serverを利用してローカルサーバを起動したときに、
成果物をどのパスにマッピングするのかを設定します。
上記の記述であれば
`http://localhost:8080/assets/bundle.js`でアクセスできるようになります。

### $.module.rules
特定のルールに当てはまるものをどう処理していくかの定義。
今回は正規表現`\.tsx?$/`に当てはまるものに
`awesome-typescript-loader`を使ってトランスパイルを行うようにしています。

`ts-loader`とどちらを紹介するのか悩んだのですが、単純にスターが多い方を選びました

**※ 追記**
現在`awesome-typescript-loader`はアーカイブされているので
ここ最近では`ts-loader`、もしくは`babel-loader`でトランスパイルするほうが主流となってそうです。

### $.resolve.extensions
ソースの中で`import`するときに解決してくれる拡張子。
今回はTypeScriptなので`.ts`と`.tsx`でいいかと思いきや、
Reactなどyarn(npm)でインストールしたものの解決も必要なので`.js`と`.jsx`も設定します。

`.(ドット)`がないと動かないので**要注意**です

### $.devServer
ローカル開発用サーバの設定。

**contentBase**
ドキュメントルートをどこにするかです。
今は空ですが`./static`を設定します。

**host**
実はこの設定はなくても動くのですが、
他の端末からローカルIPで接続するときにはこの設定が必要になります。
僕はMacで開発しながら、WindowsマシンのIEで確認などを行うのでこの設定を入れています。

# 動かしてみる

## HTMLの準備
webpack-dev-serverで表示するためのHTMLを用意しましょう。

```html:./static/index.html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Example</title>
</head>
<body>
  <div id="app"></div>
  <script src="/assets/bundle.js"></script>
</body>
</html>
```
最高にシンプルですね
IDが`app`のdivが存在していることだけ頭において次へ進みます！

## ついにReact
やっと本題であるReact&TypeScriptが登場です！！
webpackに記載したエントリーポイントのファイルを作成しましょう

```tsx:./src/index.tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom';

ReactDOM.render(
  <h1>Hello React with TypeScript!!!</h1>,
  document.getElementById('app'),
);
```
Reactの説明はなしにしますが、これで動くはず。
以下のコマンドでサーバを起動してみましょう

```bash
yarn webpack-dev-server --mode development
# 何度も使うコマンドなのでscriptsに登録してしまうことをおすすめします
```

無事に起動したら[http://localhost:8080](http://localhost:8080)へアクセスしてみましょう。

こんな画面がでたら成功です
<img width="587" alt="" src="https://qiita-image-store.s3.amazonaws.com/0/122918/2eba80fe-a3da-682c-ba4e-a9846aa179dd.png">

無事にTypeScriptでReactを動かすことができました！

# せめて、TypeScriptらしく
今のままだとほぼES6と変わらずTypeScript感があまりありませんね
TypeScriptだと実際にどんないいことがあるのかを実例を載せながら紹介します。

## PropsとStateの型を定義する
JavaScriptだと`prop-types`といったもの使っていたのですが、
実行時にしかチェックが走らない上に、扱いづらい代物です。

TypeScriptを利用することで、強力な型チェックの恩恵をうけることができます。

```tsx:./src/App.tsx
import * as React from 'react';

interface OuterProps {
  onClick(): void;
}
interface AppState {
  sec: number;
}

class App extends React.Component<OuterProps, AppState> {
  state: AppState = {
    sec: 0,
  };

  // thisを縛るためにはTypeScriptだとBindは使わず
  // アロー関数を定義する
  incrementeSec = () => {
    this.setState({
      sec: this.state.sec + 1, // ← ここで補完が効く!あと型が違うとエラーになる！
      message: 'unknown fields...', // ← AppStateに定義されていないのでエラー！
    });
  };
  componentDidMount() {
    setInterval(this.incrementeSec, 1000);
  }

  render() {
    const sec = this.state.sec; // ← ここで補完が効く！！
    console.log(this.state.hoge); // ← AppStateに定義されていないのでエラー
    console.log(this.props.fuga); // ← OuterPropsに定義されていないのでエラー
    return (
      <div>
        <span>いま...{sec}秒経過しました</span><br />
        <button onClick={this.props.onClick}>ボタンです</button>
      </div>
    );
  }
}
export default App;

// StatelessFunctionComponent(SFC)の場合はこんな感じ
const App2: React.SFC<OuterProps> = props => (
  <button onClick={props.onClick}>ボタン</button>
);

```

```tsx:./index.tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './App';

ReactDOM.render(
  <App
    onClick={() => alert('test')} // ← onClickがないとエラー
    onChange={() => {}} // ← 未定義の属性はエラー
  />,
  document.getElementById('app'),
);
```
すごくざっくりですがTypeScriptの紹介はこんな感じになります

`React.Component<Props, State>`と宣言することで
色々と補完やエラーチェックが効くのでとても快適です。

また、`index.tsx`を見てもらうと分かるように
JSX形式の記述に対しても型の補完がやエラーチェックがかかるため、
実行時エラーが格段に減ります。

あとはES6でやっていたことをTypeScriptに置き換えるだけで
型安全なプログラムを組むことが保証されます。

#　最後に
ほとんどがwebpackの説明でしたが、簡単に動くところまで行けました！
実はES6で動かすよりもTypeScriptのほうが設定は簡単です。(babelは色々と大変)

正直Reactに限らず、ある程度大きなプロダクトなら
TypeScriptを使わないメリットはないと思っているので、
皆さんTypeScriptをどんどん利用していきましょう！

おしまい＾＾

