---
title: "@types/react の中を少し読んでみる"
publishedAt: "2019-12-14T08:32:19+09:00"
description: "Reactの型定義として提供されている'@types/react'の実装を読んでみて解説です。"
tags:
  - React
  - TypeScript
---

# 注意
この記事は2019/12時点の記事です。
Reactのバージョンも上がり`React.VFC`なども登場しているのでご注意ください

# はじめに
ここ最近はTypeScriptを利用することがデファクトスタンダードになりつつありますね。
そこでその際に必要になるReactの型定義(`@types/react`)について色々おさらいしてみます。

対象のパッケージは[こちら](https://www.npmjs.com/package/@types/react)

npm: https://www.npmjs.com/package/@types/react
GitHub: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react


# 解説
`@types/react`では`global.d.ts`と`index.d.ts`の２つのファイルが提供されていますので
それぞれを見ていきましょう。

## `global.d.ts`
https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/global.d.ts

見てみるとわかるのですが空のinterface定義が並んでいます。
そしてファイルの先頭に下記のコメントが。

```ts
/*
React projects that don't include the DOM library need these interfaces to compile.
React Native applications use React, but there is no DOM available. The JavaScript runtime
is ES6/ES2015 only. These definitions allow such projects to compile with only `--lib ES6`.
Warning: all of these interfaces are empty. If you want type definitions for various properties
(such as HTMLInputElement.prototype.value), you need to add `--lib DOM` (via command line or tsconfig.json).
*/
```

適当に訳すと
「これらの定義を用意することで`lib.dom`を読み込まなくてもコンパイルできるようになります」
「ただし、空の定義なのでプロパティなどにアクセスしたいのならちゃんと読み込んでね」
ってことみたいです。

大体は`lib.dom`を読み込むと思うのでこのファイルはあまり気にしなくていいかもしれません。

## `index.d.ts`
https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts

それではReact本体の型定義を見ていきます。
今回紹介する定義は以下になります。

- [React.Component](#reactcomponent)
- [React.ComponentClass](#reactcomponentclass)
- [React.FunctionComponent](#reactfunctioncomponent)
- [React.ComponentType](#reactcomponenttype)
- [React.ComponentProps](#reactcomponentprops)
- [React.ReactNode](#reactreactnode)
- [React.ComponentProps](#reactcomponentprops)
- [React.ReactDOM](#reactreactdom)

### React.Component
言わずとしれたクラスコンポーネントの型です。
正確にはクラスなのですが重要なのでとりあげます。

```ts:型定義
interface Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> { }
```

実際はクラスなので継承して使うことになります。

```tsx
type Props = {};
type State = {};
class Sample extends React.Component<Props, State> {
}
```

これで`this.props`や`this.state`,`this.setState`などが型安全になりました。

#### contextType
クラスの定義をよく読むとこんな記述が。

```tsx
static contextType?: Context<any>;
context: any;
```
これはContextAPIをクラスコンポーネントで利用する際の型定義になるのですが
`any`と書かれているので実際に使う際は以下のようにしてあげましょう。

```tsx
const hogeCtx = React.createContext({ count: 0 });
class Child extends React.Component<Props, State> {
    static contextType = hogeCtx;
    context!: React.ContextType<typeof hogeCtx>;

    render() {
        return <h1>{this.context.count}</h1>;
    }
}
```

TypeScript3.7以降であれば以下の書き方になります

```tsx
class Child extends React.Component<Props, State> {
    static contextType = hogeCtx;
    declare context: React.ContextType<typeof hogeCtx>
    // ↑ここが変数の再定義ではなく型の定義のみでよい
    ...
```

こうすることで `this.context` が型安全に利用することができます。

#### 注記
React 16.3より前から存在する`Legacy Context`についても同様に`this.context`を利用していました。
その場合は`contextType`の定義はせず`any`のまま利用するほうが良いかと思います。

### React.ComponentClass

これは`React.Component`などのインターフェースになります。

```ts:型定義
interface ComponentClass<P = {}, S = ComponentState> extends StaticLifecycle<P, S> {
    new (props: P, context?: any): Component<P, S>;
    propTypes?: WeakValidationMap<P>;
    contextType?: Context<any>;
    contextTypes?: ValidationMap<any>;
    childContextTypes?: ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
}
```

クラスとインターフェースと何が違うのかというと言語化が難しいのですが以下のような挙動になります。

```tsx
type Props = {};
class Hoge extends React.Component<Props> {
}
const hoge: Hoge = Hoge; // これはエラー
const hogeType: React.ComponentClass<Props> = Hoge;
```

クラスにするということはインスタンスの型となるため、
純粋なコンポーネントのインターフェースが欲しい場合はこちらの型を使うことになります。
具体的な利用例は後述する`React.ComponentType`でご紹介します。

### React.FunctionComponent
関数型コンポーネントの型となる`FunctionComponent`です。
最近はクラスコンポーネントよりもこちらのほうが主流ですね。

エイリアスとして`React.FC`というものもあります。（私は短いほうが好きなのでこちらを多用しています

```ts:型定義
interface FunctionComponent<P = {}> {
    (props: PropsWithChildren<P>, context?: any): ReactElement | null;
    propTypes?: WeakValidationMap<P>;
    contextTypes?: ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
}
type FC<P = {}> = FunctionComponent<P>;
```

ここではそれぞれのプロパティについて説明します。

#### 関数本体
関数の第２引数は`Legacy Context`の値になるので最近だと利用することはないです。
(非推奨なのでanyのまま放置されているのだと思います)

#### propsTypes
`propsTypes`もありますがTypeScriptの場合はコンパイルエラーでカバーできるので
わざわざ記述することはなくなりました。

#### contextTypes
`contextTypes`についても`Legacy Context`関連なので無視！

#### defaultProps
こちらは`props`に対してデフォルト値を与えるものになります（そのまま
個人的には`defaultProps`で定義した項目はoptionalじゃなくできるようになってほしいです...

####  displayName
これを設定しておくことでデバッグ時などにコンポーネント名として表示してくれます。
minify時に関数名などは消えてしまいデバッグが辛いので極力設定しましょう!


**ちなみに**
Hooksが出てくるまでは`StatelessFunctionComponent`(`SFC`)というものがありましたが
現在は非推奨になっているためこちらに切り替えましょう。

### React.ComponentType

まずは型定義

```ts:型定義
type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;
```

上記で説明した「クラスコンポーネントor関数コンポーネント」という型で、
「とにかくコンポーネントがほしい！！」って場合に利用します。
具体的な例はこちら

```tsx
interface WithHoge {
  hoge: string
}

function withHoge<P extends WithHoge>(
    Component: React.ComponentType<P>
): React.FC<Omit<P, keyof WithHoge>> {
    return (props) => {
        const inProps = {...props, hoge: 'value' } as P;
        return <Component {...inProps} />;
    }
}
```
このようなHOCを作ったりする場合は、
関数コンポーネントでもクラスコンポーネントでもよいのでComponentTypeを利用すると良いです。
その他にもコンポーネントそのものを受け渡す場合はこちら利用していきましょう。

### React.ReactNode
`React.Component`の`render()`の戻り値など色んな所で登場してくる`React.ReactNode`。
簡単に言うと「JSXの中で存在できる要素」を指します。(この表現が正しいかはあやしい)

```ts:型定義
type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;

// 関連↓
type ReactText = string | number;
type ReactChild = ReactElement | ReactText;
```

コンポーネントでも文字列でも数字でもなんでも来い！っていう定義で
「とにかくJSXの中に突っ込みたいけど型がバラバラ」といった場合に活躍します。

**ちなみに**
関数コンポーネント(`FunctionComponent`)の戻り値は`ReactElement`です。
なので`undefined`や数値など適当なものは返却できないようになっています。
（Component.renderはできるのに）


### React.ComponentProps
これは便利な型として紹介いたします。
コンポーネントからPropsのを抜き出す際に利用します。

```ts:型定義
type ComponentProps<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> =
    T extends JSXElementConstructor<infer P>
        ? P
        : T extends keyof JSX.IntrinsicElements
            ? JSX.IntrinsicElements[T]
            : {};
```

`infer`で目的の型を抜き出しているのですが難しい定義ですね。

使用例)

```tsx
const Sample = (props: { name: string; age: number }) => {
  return <>hello</>;
};

type SampleProps = React.ComponentProps<typeof Sample>;
/*
    type SampleProps = {
        name: string;
        age: number;
    }
*/
```

このようにコンポーネントからPropsの型を抜き出すことができました。
利用しているライブラリで`Props`が公開されていない場合でも型を抜き出すことができるので重宝します。

### React.ReactDOM
こちらは自作のコンポーネントではなく`div`や`input`などのHTML,SVGタグの定義となります。

```ts:型定義
interface ReactDOM extends ReactHTML, ReactSVG { }

interface ReactHTML {
    a: DetailedHTMLFactory<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    abbr: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    address: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
    ....
}
interface ReactSVG {
    animate: SVGFactory;
    circle: SVGFactory;
    ...
}
```

これを単体で使うことはあまりないのですが`ComponentProps`と組み合わせると以下のようなことが可能です。

```tsx
type Div = React.ReactDOM['div'];
type DivProps = React.ComponentProps<Div>;
const props: DivProps = { className: 'class-name' };
return <div {...props} />
```

自作コンポーネントじゃないタグに動的な`props`を設定したいとき、
型安全な変数として定義することができます。

このようなショートハンドの型を定義するともっと使いやすくなりそうです。

```ts
type DOMProps<E extends keyof React.ReactDOM> = React.ComponentProps<React.ReactDOM[E]>;

// 使う
type DivProps = DOMProps<'div'>;

```

### 追記
`JSX.IntrinsicElements`という型が存在しており
これを使うことで上記と同じようなことができます。
そしてどうやら`IntrinsicElements`のほうがスタンダードのようです...!

# まとめ
実際にはコンポーネントの型定義が他にもいくつかあって複雑に絡み合っているのですが
今回はこのあたりのよく目にする部分のみをまとめてみました。(時間がなかった)

Reactなど関数的な考え方を持ち込んでいるライブラリは型定義が面白かったりと勉強になるので
皆さんもぜひ読んでみてはいかがでしょうか。

---

おしまい
