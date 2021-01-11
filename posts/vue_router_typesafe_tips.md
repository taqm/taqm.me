---
title: "vue-routerを無理やりTypeScriptで型安全にする"
publishedAt: "2018-11-07T14:13:53+09:00"
description: "TypeScriptでVue-routerを使う際に可能な限り方安全にするためのtipsです。"
tags:
  - Vue
  - TypeScript
---

vue-routerをTypeScriptで使うと
どうも型安全じゃないのが気になります。

```typescript
this.$router.push('ここになんでも入っちゃう！', {
  query: {
    'ここにもなんでも入っちゃう！！': 'hogehoge',
  },
});
```

そこですこし無理やりですがVueRouterを拡張して
いい感じになるようにしてみました。

# ゴール
少し長くなるので最終的にどうなるかを先に書いちゃいます。
今回の目的はライブラリの作成ではなく、
スニペットの作成だと思っていただけると良いです。

```ts
this.$router.pushTo(RouteNames.Detail, {
  params: {
    id: 'sample',
    hoge: 'fuga', // 定義していないparamsはエラー
  },
});

this.$router.pushTo('test', { ... });
// もちろん 定義したenumじゃないとエラー
```

新しいメソッドをVueRouterに実装します。
第１引数に`enum`を渡し、
第２引数には**第１引数に応じたパラメータ**しか渡せないようになっています。

ソースコードは[こちら(GitHub)](https://github.com/taqm/typesafe-vue-router-sample)

# 解説！
## ディレクトリ構造
ディレクトリ構成は以下のような状況です。
トップ画面 → 検索結果画面 → 詳細画面
といったありがちなルーティングをサンプルとして扱っていきます。

```
├── App.vue
├── main.ts
├── router
│   ├── extension.ts
│   ├── index.ts
│   └── route.types.ts
└── views
    ├── DetailPage.vue
    ├── IndexPage.vue
    └── ListPage.vue
```

他にもいろいろ必要なのですが今回は省略しています。
一応`App.vue`と`main.ts`の中身を先に紹介しますが
最小限になっていますので無視していただいても大丈夫です。

```typescript:./main.ts
import Vue from 'vue'
import App from './App.vue'
import router from './router'

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
```

```vue:./App.vue
<template>
  <div>
    <router-view/>
  </div>
</template>
```

`main.ts`について１つだけ補足

```ts
import router from './router';
```
知っている人も多いかと思いますが、
`from` でディレクトリを指定することで、`index.ts`が読み込まれます。
特に今回重要な要素ではないので特に触れません。

## VueRouterを拡張
型が曖昧なライブラリ群を型安全にするためには以下の方法が考えられます。

1. ラッパークラス(モジュール)を作成する
2. 本体を拡張する

今回は「2. 本体を拡張する」を選択しました。

### ルーティングの定義
まずは型安全にするために、各ルーティングを定義していきましょう！
今回は

- Index
- List
- Detail

といった3つの画面を作成します。
`List`に行くためには検索ワード`keyword`を。
`Detail`に行くためには`id`を渡す想定としましょう。

```ts:./router/route.types.ts
export enum RouteNames {
  INDEX = 'index',
  LIST = 'list',
  DETAIL = 'detail',
}

type StrRecord = Record<string, any>
type Query<T extends StrRecord> = { query: T };
type Params<T extends StrRecord> = { params: T };

export type ListOption = (
  Query<{ keyword: string }>
);

export type DetailOption = (
  Params<{ id: string }>
);

export type RouteOption = {
  ［RouteNames.INDEX]: {},
  ［RouteNames.LIST]: ListOption,
  ［RouteNames.DETAIL]: DetailOption,
};
```

各画面を`enum RouteNames`として定義しますが
後に`router`の`name`に指定するので文字列にすることが必須。

`RouteOption`にて各画面遷移時にどういったパラメータが必要なのかを関連付けます。
（Indexなどパラメータがない場合は空にしています)

画面遷移時に渡すものの標準として`Query`と`Params`を定義していますが、
もし`hash`なども渡したい場合は同じ要領でtypeを定義してください。

この`Query`などは`this.$route.xxxx`とアクセスするときのIFなので
正しく定義する必要がある点が注意するポイントです。

あえて説明は不要かもしれませんが、
`Query`と`Params`をそれぞれ送りたい！と言った場合には以下のようにすると良いです。

```ts
type SampleOption = (
  & Query<{ hoge: boolean }>
  & Params<{ fuga: boolean }>
);
```

### VueRouterの拡張
前項で定義したルーティング定義を用いて
VueRouterそのものを拡張していきます。

#### 定義の拡張
```ts:./router/extension.ts
import VueRouter from 'vue-router';

import { RouteOption } from './route.types';

declare module 'vue-router/types/router' {
  interface VueRouter {
    pushTo<T extends keyof RouteOption>(to: T, option: RouteOption[T]): Promise<void>;
  }
}
```
この定義で`VueRouter`の型定義へメソッドを追加します。
メソッド名は`pushTo`としており

- 第１引数は 遷移先
- 第２引数は 遷移先が求めるパラメータ

となります。
第一引数の値の型(`enum`)からRouteOptionへ参照させていますが
RouteOptionのキーは`RouteNames`なので、
呼び出し時は

```ts
this.$router.pushTo(RouteNames.List, {/* */});
```
といったように記述することができます。

そして、第２引数は`RouteOption`で定義した
`Query`や`Params`のオブジェクトしか受け付けないようになっており
遷移時に誤ったパラメータを渡すことを防ぎます！

#### 定義の実装
前項で定義したメソッドを実際に実装します。

```ts:./router/extension.ts
export function enhance(router: VueRouter): VueRouter {
  router.pushTo = function<T extends keyof RouteOption>(
    to: T,
    option: RouteOption[T],
  ) {
    return new Promise<void>((resolve, reject) => {
      this.push({
        name: to,
        ...(option as any)
      }, resolve, reject);
    }).catch(() => console.error('エラー発生'));
  };
  return router;
};
```
この`enhance`関数へ、`VueRouter`のインスタンスを渡し、
拡張する作りとなっています。

この関数の中でメソッドを実装しましょう。
一言で言うと`pushTo`メソッドは、本家の`push`メソッドのラップメソッドです。

第一引数を`push`のnameへ。
その他はそのままオプションとして追加しております。
`RouteOption[T]`だと`push`の引数に与えられないので
ここは素直に`any`にすることで解決しました。(これは仕方ないはず！)


###### 課題
ここで課題として残ったことが、`Index`など
パラメータを必要としないものかどうかを判定して、
メソッドの引数を`Optional`にできなかった点です。

そのため`Index`へ遷移する際は、第２引数に空オブジェクトを渡す必要があります:frowning2:
悔しいですが今後の課題としてここは前に進みました。

## ルーティングの実装
ほぼ基本通りの作りになります

```ts:./router/index.ts
import Vue from 'vue'
import Router from 'vue-router'

import { RouteNames } from './route.types';
import { enhance } from './extension';

import IndexPage from '../views/IndexPage.vue';
import ListPage from '../views/ListPage.vue';
import DetailPage from '../views/DetailPage.vue';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: RouteNames.INDEX,
      component: IndexPage,
    },
    {
      path: '/items',
      name: RouteNames.LIST,
      component: ListPage,
    },
    {
      path: '/items/:id',
      name: RouteNames.DETAIL,
      component: DetailPage,
    },
  ]
});

export default enhance(router);
```

一つだけ絶対に忘れてはいけないことあります。
exportする前に先ほど作成した`enhance`関数を呼び出して、
routerを拡張した状態で外部へ提供しましょう。

## 実際にコンポーネントから使ってみる
```vuejs:./views/IndexPage.vue
<template>
  <form @submit.prevent="onSubmit">
    <input v-model="keyword" required>
    <input type="submit" value="送信">
  </form>
</template>

<script lang="ts">
import Vue from 'vue'
import { RouteNames } from '@/router/route.types';

export default Vue.extend({
  data() {
    return {
      keyword: '',
    };
  },
  methods: {
    onSubmit() {
      this.$router.pushTo(RouteNames.LIST, {
        query: {
          keyword: this.keyword,
        },
      });
    },
  },
});
</script>
```

`methods`内の`onSubmit`で今回実装した`puthTo`を使っています。
`RouteNAmes.LIST`へ遷移するためには、`keyword`が必要なので
第２引数ではこの形のオブジェクトを渡すことを強制しています。

実際に動くサンプルをGitHubへ上げているので
他の画面については割愛させてもらいます。
[サンプル](https://github.com/taqm/typesafe-vue-router-sample)


# 残った課題
今回モジュールの拡張を行ってみましたが、
大きく２つの課題が残りました。

上でも書いたのですが、
**パラメータを必要としないルーティングには空オブジェクトを渡す必要がある**
です。まあ野暮ったいだけで実害はあまりないのでよいです。

もう一つが**パラメータを利用する側が型に守られない**ことです。

遷移先のコンポーネントでは以下のようにして値を取る必要があります。

```ts
  computed: {
    keyword() {
      const option: ListOption = this.$route as any;
      return option.query.keyword;
    },
  },
```
各コンポーネントに`any`が入ってくるのはとてもつらいです
今の所「これだ！！！」という解決策は見つかっていないので
どこかでちゃんと対策してみたいです。

# 最後に
今回やってみた内容は実際に業務でも使ってみました。
実際に使ってみるとルーティング周りのミスはかなり減りました。
やはり型に縛られるのは気持ちいですね:relaxed:

ただし、こういった拡張を乱発しすぎると
なにか起きたときに問題の切り分けなどが難しくなりかねないので
ほどほどにしましょう。

---

おしまい
