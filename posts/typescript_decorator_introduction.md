---
title: "TypeScriptによるデコレータの基礎と実践"
publishedAt: "2018-12-11T03:11:30+09:00"
---

# はじめに
まずはじめに、
アドベントカレンダーに参加した途端に仕事が超絶忙しくなったため、
死にそうになりながらこの記事を書いています。

御託は置いておいて、タイトルの通り「デコレータ」について少しまとめてみましょう。

#### 書くこと
- デコレータの基礎
- reflect-metadata
- 実践

# デコレータの基礎
## 公式
とりあえず何事も本家のドキュメントを見てみるのが一番

- [公式](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [公式の日本語訳](https://mae.chab.in/archives/59845)

デコレータはJavaScriptの`Stage-2`状態の機能であり、
今後仕様変更が入る可能性があります。

ドラフト状態の仕様についての詳しい内容は
[ここ](https://github.com/tc39/proposal-decorators)とか[ここ](https://tc39.github.io/proposal-decorators/)！

↑の日本語訳サイトを読めば大体わかりますし
[こういった素晴らしい記事](https://qiita.com/Quramy/items/e3a43bb1734b8a7331e8)もあるので
本記事では簡単なおさらい程度にします。

## デコレータとは
デコレータとはクラスの宣言などにアタッチできる特別な宣言です。

- クラス宣言
- メソッド
- アクセサ(get, set)
- プロパティ
- メソッド引数

↑これらに適用することができます

## 前準備
あくまで実験的機能という立ち位置であり、
デフォルトでは使うことができません。

そこでコンパイルの設定に「`デコレータ使うよ！`」と追記してあげる必要があります。
以下設定内容

```bash
tsc --target ES5 --experimentalDecorators
```
or

```json:tsoncig.json
{
  "compilerOptions": {
    "target": "ES5",
    "experimentalDecorators": true
  }
}
```

## Decorator Factories
デコレータを作る関数みたいなものです。
デコレータに対して値を渡したい場合に利用します

```ts
function color(value: string) { // this is the decorator factory
    return function (target) { // ここがデコレータ
        // ここでtargetやvalueを使って色々やる
    }
}
```

## Decorator Composition
デコレータは１つの対象に複数適用することができ、
Decorator Factoriesを利用した宣言を行なった場合は、以下のような順序で評価されます。

```ts
function f() {
    console.log("f(): evaluated");
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("f(): called");
    }
}

function g() {
    console.log("g(): evaluated");
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("g(): called");
    }
}

class C {
    @f()
    @g()
    method() {}
}
```

出力は↓のような感じ

```
f(): evaluated
g(): evaluated
g(): called
f(): called
```

## Decorator Evaluation
デコレータの評価される順番についてです。
評価される順番というのは厳格に決まっており、
これらを把握していないと痛い目をみることがあります。

1. インスタンスメンバーへ適用
	1. パラメータ・デコレータ
	1. メソッド・デコレータ
	1. アクセサ・デコレータ
	1. プロパティ・デコレータ
1. Staticメンバーへ適用
	1. パラメータ・デコレータ
	1. メソッド・デコレータ
	1. アクセサ・デコレータ
	1. プロパティ・デコレータ
1. コンストラクタ関数
	1. パラメータ・デコレータ
1. クラス
	1. クラス・デコレータ

↑の順番でデコレータ関数が評価されていきます。

また、複数のデコレータがついている場合の評価順は
一つ前の項目で触れたとおりになっています。

後ほど出てくる`reflect-metadata`の説明で少し触れるつもりなので、
とりあえず評価の順番が決まっていることだけ抑えておきましょう。

## Class Decorators: クラス・デコレータ
クラス宣言の直前で宣言します。

```ts
function classDecorator(fnc: Function) {
    // fnc = コンストラクタ関数
    // prototypeをいじったりする
}

@classDecorator
class Sample {
}
```

## Method Decoratos: メソッド・デコレータ
メソッド宣言の直前で宣言します。

```ts
function methodDecorator(target: any, props: string, descriptor: PropertyDescriptor) {
    // ここでごにょごにょする
    // 具体的な使い方は後ほど
}

class Sample {
    @methodDecorator
    hoge() {
    }
}
```

### 引数

| | |
|---|---|
|第１引数|メソッドがstaticの場合は、コンストラクタ関数。<br>インスタンスメンバの場合は、クラスのprototype|
|第２引数|メンバのキー名|
|第３引数|プロパティ・ディスクリプタ|

### 戻り値
値を返却すると、
戻り値がプロパティ・ディスクリプタとして使用されます。

ここで`プロパティ・ディスクリプタ`ってのが出てきますが
[このMDNのページ](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor)を見ると大体の使い方はわかります。

すごくざっくりいうと
「プロトタイプではなく、プロパティそのものに対してアクセスできるもの」
という認識で大丈夫です。

## Accessor Decorators: アクセサ・デコレータ
アクセサ宣言の直前で宣言します。
引数や動きはメソッド・デコレータと同じです。

## Property Decorators: プロパティ・デコレータ
プロパティ宣言の直前で宣言します。

前述したデコレータと似た宣言方法ですが、
メソッドやアクセサと違って、プロパティディスクリプタが提供されないので要注意です。

ただし、デコレータ関数の戻り値としてプロパティディスクリプタを返却することで
利用する事が可能です。

```ts
function propertiyDecorator(target: any, props: string) {
    // ここでごにょごにょする
    // return { ... } // 戻り値を返却することも可能
}

class Sample {
    @propertiyDecorator
    message?: string;
}
```

## Paramerter Decorators: パラメータ・デコレータ
パラメータ宣言の直前で宣言します。

```ts
function parameterDecorator(target: any, props: string, index: number) {
    // ここでごにょごにょする
}

class Sample {
    hoge(@parameterDecorator param: string) {
    }
}
```
### 引数

| | |
|---|---|
|第１引数|メソッドがstaticの場合は、コンストラクタ関数。<br>インスタンスメンバの場合は、クラスのprototype|
|第２引数|メソッドの名前|
|第３引数|引数の順番|

第２引数は、デコレータを宣言した引数の名前ではなく
メソッドそのものの名前になるので注意してください

--- 

あってもなくてもいいようなまとめを書いてみましたが、
「結局どんなことができるの？」ってわけです。

公式ドキュメントにもそれっぽいものが書いてありますが、
正直「ふーん」って感じです。（みなさんどうですか？

というかデコレータの説明中にいきなり`reflect-metadata`の話をブチ込んでくるあたり
ちょっと初学者には優しくない感じがします。
そこで次の章で**すこし**だけ`reflect-metadata`に触れて、そのあと実際の使いみちを紹介します。

## reflect-metadata
`Metadata Reflection API`といわれるものの
Polyfillを追加するライブラリになります。

内容はReflectオブジェクトを拡張して、
メタデータを保持させたり取得したりできるようにするものです。

デコレータでゴニョゴニョする場合は割とお世話になることがあり、
気づいたら何かの依存で`node_modules`に入っていたりすることも...

### 使用例
```ts
import 'reflect-metadata';

const KEY = Symbol('test key');
function hoge(target: any, propKey: string, desc: PropertyDescriptor) {
  const sample = Reflect.getMetadata(KEY, target, propKey);
  console.log(`値は ${sample} です`);
}

function fuga(sample: string) {
  return (target: any, propKey: string, idx: number) => {
    Reflect.defineMetadata(KEY, sample, target, propKey);
  };
}

class SomeClass {
  @hoge
  someMethod(@fuga('テスト') name: string) {
  }
}

// 実行結果
// -> 値は テスト です
```
あくまで`使用例`という口実のもと実用的ではないサンプルにしてます

こういったように
デコレータのついたメソッドにメタデータを付与して
別のデコレータから参照することができるのが、この機能の重要なポイントです。

そして、ここでデコレータの呼ばれる順番がかなり重要になってきます。
先に述べた「Decorator Evaluation」のとおり、
デコレータの評価順は厳格に定められております。

つまり、クラス・デコレータで付与したメタデータは
メソッド・デコレータで参照することができないということになるのです。

--- 

なんとなく可能性を感じてもらえることはできたでしょうか？
次の章から、実際にデコレータを使って何ができるのかを紹介していきます。

# 実践！
ここからはデコレータと`reflect-metadata`を使って
実際に使えそうな？実装を紹介していきます。

コードをベタッと貼り付けたので少し長いですが参考になればと思います。

## 実践１. ログ出力
まずデコレータといって大体の人が思いつくのがログの出力ですね。
このようにAOPに活用することが、一般的？なのだと思います。

```ts
function outputLog(
  target: any,
  propKey: string,
  descriptor: PropertyDescriptor,
) {
  const original = descriptor.value;
  descriptor.value = function () {
    const key = `${target.constructor.name}#${propKey}`;
    console.log(`${key}: start`);
    console.time(key);
    const ret = Reflect.apply(original, this, arguments);
    if (/* ret が Promiseか判定 */) {
      return ret.then((ret) => {
        console.timeEnd(key);
        return ret;
      });
    }
    console.timeEnd(key);
    return ret;
  };
}

function sleep(sec: number) {
  const start = Date.now();
  let now = Date.now();
  while (now - start <= sec * 1000) {
    now = Date.now();
  }
}

function delay(sec: number): Promise<void> {
  return new Promise(r => setTimeout(r, sec * 1000));
}

class Sample {
  constructor(private name: string) {}

  @outputLog
  greet() {
    sleep(3);
    console.log(`hello ${this.name}`);
  }
  @outputLog
  async greetAsync() {
    await delay(3);
    console.log(`hello ${this.name}`);
  }
}

new Sample('world').greet();
new Sample('async workd').greetAsync();
// 出力↓
/*
Sample#greet: start
hello world
Sample#greet: 3001.297ms
Sample#greetAsync: start
hello async workd
Sample#greetAsync: 3005.303ms
*/
```

このようにプロパティディスクリプタを利用して、
本来の関数をラップすることで実現可能です。

計測のログなどのロジックとは関係ない部分を切り出すことで
クラスの中では業務ロジックに集中することができます。

`async/await`対応しようと思ったのですが
ちょっと調べてみると、オブジェクトがPromiseかどうかの判定が
思ったより面倒そうだったので仮実装にしています。

## 実践２. 引数のチェック
引数の検証などを行ってみます。
↓の例では`@notBlank`をつけた引数に
空文字orスペースのみが来た場合にエラーにしています

```ts
import 'reflect-metadata';
const NOT_BLANK = 'not blank';

function validate(target: any, propKey: string, desc: PropertyDescriptor) {
  const list: number[] = Reflect.getOwnMetadata(NOT_BLANK, target, propKey);
  if (!list) return;
  const method = desc.value;
  desc.value = function(...args) {
    const blanks = list.filter(n => args[n].trim().length === 0);
    if (blanks.length > 0) throw '引数がブランクです';
    Reflect.apply(method, this, args);
  }
}

function notBlank(target: any, propKey: string, idx: number) {
  const list = Reflect.getOwnMetadata(NOT_BLANK, target, propKey);
  if (list) list.push(idx);
  else Reflect.defineMetadata(NOT_BLANK, [idx], target, propKey);
}

class Sample {
  @validate
  greet(@notBlank name: string) {
    console.log(`hello ${name}`);
  }
}

new Sample().greet(' ');
// → エラー発生
```
パラメータ・デコレータだけではメソッドの実行に干渉できないため、
メタデータを付与してメソッド・デコレータ内で処理を行っています。

## 実践３. 関数の結果を書き換え
実践１の内容に似ていますが、
関数の戻り値を上書きすることも可能です。

```ts
function uriEncoded(target: any, propKey: string, desc: PropertyDescriptor) {
  const method = desc.value;
  desc.value = function () {
    const res = Reflect.apply(method, this, arguments);
    if (typeof(res) === 'string') {
      return encodeURIComponent(res);
    }
    return res;
  };
}

class Sample {
  @uriEncoded
  hoge(): string {
    return 'こんにちは';
  }
}

console.log(new Sample().hoge());
// 出力
// %E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF
```

`@uriEncoded`がついたメソッドの戻り値が`string`だった場合
URIエンコードして返すようにしています。
ここでは簡単なエンコードですが、
もっと複雑な暗号化・復号化を行う場合には有効になってきます。

## 実践４. 依存関係の注入（DI）
ここでは実践というよりライブラリの紹介になります。
[InversifyJS](https://github.com/inversify/InversifyJS) というライブラリを使ってデコレータによるDIを実現してみます。

```ts
import { injectable, inject, Container } from 'inversify';
import 'reflect-metadata';

const USER_REPOS_KEY = Symbol('userRepository');
const GREETER_KEY = Symbol('greeter')

interface User { name: string; }
interface UserRepository {
  getById(id: string): User;
}

@injectable()
class UserRepositoryImpl implements UserRepository {
  getById(id: string): User {
    // 外部に依存した実装
    return { name: '花子' };
  }
}

@injectable()
class Greeter {
  constructor(
    @inject(USER_REPOS_KEY)
    private userRepos: UserRepository,
  ) {}
  greet(id: string) {
    const user = this.userRepos.getById(id);
    console.log(`hello ${user.name}`);
  }
}

// コンテナにDI対象のクラスたちを追加していく
const container = new Container();
container.bind(USER_REPOS_KEY).to(UserRepositoryImpl);
container.bind(GREETER_KEY).to(Greeter);

const greeter = container.get<Greeter>(GREETER_KEY);
greeter.greet('sample id');
// → hello 花子

```

公式のサンプルをすごく縮めてみた版になります。
こうすることでDBアクセスなどを行う処理を抽象化し
テストが書きやすい様になりました。

内部では`reflect-metadata`によって
「この関数の○番目の引数はこのキーで紐付ける」など
ガシガシと処理が動いています。

便利なライブラリなのでぜひ使ってみてください。

## 実践５. WEBフレームワークを作ってみる
デコレータを使ってWEBフレームワークを作ってみましょう。
などと言いつつも、１から作るのはきついので`Express`を拡張する形で...
Javaの`SpringBoot`のようなものを目指します。

```ts:fw.ts
import 'reflect-metadata';
import * as express from 'express';

export abstract class MyRouter {
  readonly route!: express.Router;
}

interface ActionMetadata {
  path: string;
  method: 'get' | 'post';
  actionName: string;
}

const ACTION_KEY = Symbol('action');

export function Controller(path: string) {
  return (fn: new() => MyRouter) => class extends fn {
    constructor() {
      super();
      const route = express.Router();
      const list: ActionMetadata[] = Reflect.getMetadata(ACTION_KEY, fn.prototype);
      list.forEach((meta) => {
        route[meta.method](meta.path, (req, res) => {
          const ret = this[meta.actionName](req, res);
          if (typeof(ret) === 'string') res.send(ret);
          else if (ret) res.json(ret);
          res.end();
        });
      });
      // readonly対策でany化
      (this as any).route = express.Router();
      this.route.use(path, route);
    }
  } as any;
}

export const GetMapping = mappingFactory('get');
export const PostMapping = mappingFactory('post');

function mappingFactory(method: ActionMetadata['method']) {
  return (path: string = '/') =>
    (target: any, actionName: string, dsc: PropertyDescriptor) => {
      const meta: ActionMetadata = { path, method, actionName };
      addMetadata(meta, target, ACTION_KEY);
    };
}

function addMetadata<T>(value: T, target: any, key: Symbol, propKey?: string) {
  const list = Reflect.getMetadata(key, target, propKey);
  if (list) {
    list.push(value);
    return;
  }
  Reflect.defineMetadata(key, [value], target, propKey);
}
```
デコレータの定義は↑のような感じです。

1. アクションとして扱いたいメソッドにデコレータを付与
2. メソッドデコレータの中で、HTTPメソッド・パス・アクション名をメタデータとして登録
3. 最後に評価されるクラス・デコレータでコンストラクタを上書きし、2.で登録したメタデータを元にRouterを定義

日本語で書くと難しいですが以上のような流れになります。

※今回メソッドの戻り値をそのままレスポンスにするようにしました。

##### ミニテクニック

```ts
function (fn: new() => MyRouter) {
}
```
というクラス・デコレータを定義しています。
これで　`MyRouter`を実装しているクラスのみに付与できるようになります。

### 実際に使ってみる
こんな感じになります！

```ts:index.ts
import * as express from 'express';
import { Controller, MyRouter, GetMapping } from './fw';

@Controller('/')
class MainController extends MyRouter {

  @GetMapping()
  index() {
    return 'hello express boot';
  }

  @GetMapping('/hello')
  hello(req: express.Request) {
    return `hello ${req.query.name}`;
  }

  @GetMapping('/json')
  json(req: express.Request) {
    return {
      message: 'this is json response',
    };
  }
}

const app = express();
app.use(new MainController().route);
app.listen(3000);
```

おお！だいぶSpringBootっぽい！
あとは**実践４．**で扱ったようなDIなどを使ったり、
パラメータとのマッピングも行うことができればかなり近づくのではないでしょうか。
今まで説明した機能を使えばすべてSpringBootのような機能もほぼ実現可能です！

作ってみたら予想以上に面白かったので
~~時間ができたらちゃんと仕上げてnpmに公開する予定ですのでお楽しみに:relaxed:~~
~~（その時はまた記事を書こうと思います~~

すでに似たようなライブラリが存在してました・・・
[routing-controllers](https://www.npmjs.com/package/routing-controllers)

驚くくらいやってることが一緒です。
なので今回作ってみたものは完成することはないでしょう（泣）

# あとがき
デコレータについて

- 存在は知っているけど使ったことない
- フレームワークが推奨してるからなんとなく使っている

という人が結構多いのではないでしょうか？
実際に見てみるとただの関数であり、だれでも簡単に作れるようなものです。

ただし、乱用すると型情報が欠落したり、パフォーマンスに影響が出るなどの
デメリットも存在するため、ご利用は計画的に:point_up:

では皆さんよいデコレータライフを！o(･ω･｡)

---

おしまい
