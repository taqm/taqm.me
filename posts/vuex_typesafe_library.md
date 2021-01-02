---
title: "TypeScriptでVuexを型安全に扱うライブラリを作りました"
publishedAt: "2018-10-14T10:31:27+09:00"
tags:
  - Vue
  - TypeScript
---

# はじめに
こんにちは。
みなさんVue&Vuex&TypeScript やってますか？

Vueクラススタイルコンポーネント向けのライブラリのなかで
[vuex-class](https://github.com/ktsn/vuex-class)というライブラリがすごく気に入ったのですが型安全ではありません。
↑ リポジトリを見るとIssueは立ってるようです

そこで今回、車輪の再発明を承知でライブラリを作りました！
`vuex-class`的な使い心地で型安全なものを目指します:point_up:

# コード
まずは作ったものはこちら
[vuex-map-decorators](https://www.npmjs.com/package/vuex-map-decorators)

基本的にデコレータを実装しているので、
実装内容より先に使い方を説明します。

# 使い方
## シンプルな使い方
```typescript
import { State, Mutation } from 'vuex-map-decorators';

interface SampleState {
  count: number;
}
interface HogeState {
  message: string;
}
interface SampleMutation {
  increment: () => void;
}

@Component
class Sample extends Vue {
  @State<SampleState>('count')
  count!: number;

  @Mutation<SampleMutation>('increment')
  onClick!: () => void;

  @State<HogeState>('message', 'sample') // 第二引数はnamespace (sample/message)
  message!: string;

  // SampleStateに存在しないキーはコンパイルエラーになる
  @State<SampleState>('message') // <- Error
  message: any;
}
```
### 解説
`@State`をつけたプロパティへはVuexStoreのstate部分が割り当てられます。
例では`@State`と`@Mutation`のみですが、
`@Getter`と`@Action`も用意しており使い勝手は全て同じです。

引数|マップされる先
---|---|---
@State&lt;T>(key: keyof T, namespace?: string &#124; undefined)| computed
@Mutation&lt;T>(key: keyof T, namespace?: string &#124; undefined)| methods
@Getter&lt;T>(key: keyof T, namespace?: string &#124; undefined)| computed
@Actions&lt;T>(key: keyof T, namespace?: string &#124; undefined)| methods

デコレータの第一引数は`<T>(keyof T)`となっているため、
型引数`<T>`の型に存在しないキーを渡せないようになっています。

デコレータをつけるプロパティの型については、
このままだと任意になってしまい微妙なので対応したいところですね。
内容がライブラリと少し離れてしまうため別の記事にしたいと思います。

## Namespaceを意識した使い方
前述した内容では確かに型安全になりますが、あまりにも記述する内容が多すぎます。
そこでNamespaceを意識した方法を用意していますので紹介します。(むしろこっちがメイン

```typescript
import { namespace } from 'vuex-map-decorators';

interface SampleState {
  count: number;
}
const state: SampleState = {
  count: 0,
};

const mutations = { ... };
const getters = { ... };
const actions = { ... };

export const ns = namespace<
  SampleState,
  typeof mutations,
  typeof getters,
  typeof action,
>('sample');

@Component
class Sample extends Vue {
  @ns.State('count');
  count!: number;
}

// ↓ これと同じ意味になります
@State<SampleState>('count', 'sample')
```

### 解説

`namespace`関数に`state`, `mutaions`, `getters`, `actions`の順で型を渡して、
引数には名前空間を文字列で渡します。

もし「`getters`はないんだよね」って時は、型に`never`を渡してあげてください

```typescript
const ns = namespace<
  SampleState,
  typeof mutations,
  never,      // 実装していない部分はneverで
  typeof action,
>('sample');

ns.Getter // <- ここではエラーになる
```
型に`never`を渡すことで、返却されるオブジェクトの型が変わり、
参照そのものができなくなります。

```typescript
const ns1 = namespace<A, B, C, D>('sample');
/*
  ns1 = {
    State(k: keyof A){},
    Mutation(k: keyof B){},
    Getter(k: keyof C){},
    Action(k: keyof D){},
  }
*/

const ns2 = namespace<A, never, never, D>('sample');
/*
  ns2 = {
    State(k: keyof A){},
    Action(k: keyof D){},
  }
*/
```

### 従来のVuexコンテキストを利用する場合
デコレータを使わず`commit`や`dispatch`を利用する場合です。
やはりどうしてもデコレータだけだと辛いこともあるかもしれないので、
以下のような手段を用意しました

```typescript
interface Mutations {
  increment: (state: State) => void;
}

const ns = namespace<State>('views/sample');
const key = ns.Mutation('increment').key; // views/sample/increment
$store.commit(key);
```
少し野暮ったいですが、文字リテラルでも型に守られるため
この手段を使うこともありかと思います。
ただし、Payloadの型までは現時点で推論できないため今後の課題です。

## 実装内容
実装は１ファイルです。
まずはデコレータを作成するところをみてみます

### デコレータ作成部分
```typescript
function createVuexDecorator(
  bindTo: 'computed' | 'methods',
  mapper: VuexMapper,
) {
  return <T = unknown>(key: keyof T, namesapce?: string | undefined): VuexDecorator => {
    if (typeof(key) !== 'string') {
      throw Error(`key is not string: key=${key}, ns=${namesapce}`);
    }
    const dec = createDecorator((target, prop) => {
      if (!target[bindTo]) {
        target[bindTo] = {};
      }
      target[bindTo]![prop] = (
        namesapce ? mapper(namesapce, [key]) : mapper([key])
      )[key];
    }) as VuexDecorator;
    dec.key = namesapce ? `${namesapce}/${key}` : key;
    return dec;
  };
}

export const State = createVuexDecorator('computed', mapState);
export const Mutation = createVuexDecorator('methods', mapMutations);
export const Getter = createVuexDecorator('computed', mapGetters);
export const Action = createVuexDecorator('methods', mapActions);
```
`createVuexDecorator`を呼ぶことでそれぞれのデコレータを作成しています。

#### 引数
```typescript
type VuexMapper = (
  | typeof mapState
  | typeof mapMutations
  | typeof mapGetters
  | typeof mapActions
);

function createVuexDecorator(
  bindTo: 'computed' | 'methods',
  mapper: VuexMapper,
)
```
どこに何でマッピングするかを定義します。
`State`の場合は「computedにmapState」でマッピングを行なっています。
`VuexMapper`はvuex標準の`mapXXXX`のどれかです。

#### デコレータの実装部分
```typescript
import { createDecorator, VueDecorator } from 'vue-class-component';
interface VuexDecorator extends VueDecorator {
  key: string;
}
/*
  中略
*/
  return <T = unknown>(key: keyof T, namesapce?: string | undefined): VuexDecorator => {
    // 入力チェックは省略
    const dec = createDecorator((target, prop) => {
      if (!target[bindTo]) {
        target[bindTo] = {};
      }
      target[bindTo]![prop] = (
        namesapce ? mapper(namesapce, [key]) : mapper([key])
      )[key];
    }) as VuexDecorator;
    dec.key = namesapce ? `${namesapce}/${key}` : key;
    return dec;
  };
```

#### 戻り値
Vue公式の`vue-class-component`内の`VueDecorator`を拡張しており、
**従来のVuexコンテキストを利用する場合**内で説明した`key`を追加しています。

#### 本体
まずは受け取った型<T>から引数を絞ります。
ここではVue公式の`createDecorator`を利用することで実装がとてもシンプルになります。

`target`はコンポーネントで、`prop`はデコレータがついていたプロパティになり、
`target['computed' | 'methods']`へ `mapXXXX`の結果を突っ込んでいく形で実装しています。

### 名前空間作成部分
この戻りの型定義が一番面白いところです！
そしてなくても困らない部分です...:smile:

```typescript
export function namespace<
  S = never,
  M = never,
  G = never,
  A = never,
>(n: string): DecoratorInterface<S, M, G, A> {
  return {
    State: (k: keyof S) => State<S>(k, n),
    Mutation: (k: keyof M) => Mutation<M>(k, n),
    Getter: (k: keyof G) => Getter<G>(k, n),
    Action: (k: keyof A) => Action<A>(k, n),
  };
}
```
見ての通り、先ほど作成したデコレータにnamespaceを渡し、オブジェクトに固めているだけです。
この際にデコレータの引数で名前空間を受け取れなくしています。

ここで戻り値の型となっている`DecoratorInterface`の説明を行いましょう！

#### 名前空間オブジェクトの型
型定義は以下のようになっています。

```typescript
type IsNever<N> = [N] extends [never] ? 'T' : 'F';
export type IfNotNever<T, R> = {T: {}, F: R }[IsNever<T>];

type DecoratorMaker<T> = (k: keyof T) => VuexDecorator;
type DecoratorInterface<S, M, G, A> = (
  & IfNotNever<S, { State: DecoratorMaker<S> }>
  & IfNotNever<M, { Mutation: DecoratorMaker<M> }>
  & IfNotNever<G, { Getter: DecoratorMaker<G> }>
  & IfNotNever<A, { Action: DecoratorMaker<A> }>
);
```

はい出ました。TypeScript型遊びの時間です。

##### IsNever&lt;N>
NがNeverかどうかを判定し,
NがNeverの場合は`'T'`、違う場合は`'F'`を返却します。
ちなみにここでいう`'T'`は値ではなく`'T'`という型です。

ここで`[never]`のように配列にしなかった場合、うまくいきませんでした。
ハマったので調べてみるとTypeScript本家のIssueに書いてあってのでなんとか解決。
https://github.com/Microsoft/TypeScript/issues/23182

##### IfNotNever&lt;T, R>
先ほど定義した`IsNever`を利用します。
もし`T`がneverだった場合は空オブジェクトを、違う場合は`R`を返却します。
こうすることで、neverじゃない場合のみ、プロパティが参照できるようになります。

# あとがき
自分で作ったので当然ですが、
なかなか使い勝手がいい感じに仕上がりました。

実際に使い込んでみて都合が悪いことがあれば都度直していきたいと思います。

やっぱりTypeScriptの型でモニョモニョするのは楽しいですね:relaxed:

おしまい
