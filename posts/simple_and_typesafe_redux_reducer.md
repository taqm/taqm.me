---
title: "TypeScriptで Redux の Reducer部分を型安全かつスッキリ書く"
publishedAt: "2018-05-08T15:17:14+09:00"
---

# はじめに
TypeScript 2.8がリリースされ色々な機能が追加されました。
その中でも*Conditional types*、特に*ReturnType*がなかなか優秀で
今まで諦めていた部分がきれいに書けるようになっております。

そこで個人的にずさんになりがちな、ReduxのReducer周りを少し改良してみたのでご紹介

# コード
```typescript
const INCREMENT = 'app/example/INCREMENT' as const;
const SET_COUNT = 'app/example/SET_COUNT' as const;

export const increment = () => ({
  type: INCREMENT,
});

export const setCount = (num: number) => ({
  type: SET_COUNT,
  payload: {
    count: num,
  },
});

type Actions = (
  | ReturnType<typeof increment>
  | ReturnType<typeof setCount>
);

interface AppState {} // 本記事の趣旨に関係ないため割愛 
const initialState: AppState = {};

export default function reducer(
  state: AppState = initialState,
  action: Actions,
) {
  switch (action.type) {
    case INCREMENT:
      console.log(action.payload);
      // ↑ SET_COUNT以外でpayloadを参照するとエラーになる
      break;

    case SET_COUNT:
      console.log(action.payload);
      // ↑ OK
      break;

    default:
      const _: never = action;
      // ↑ ケースの定義もれがあった場合にエラーになる
  }
}
```
下で要点を解説していきます
また、今回は型をテーマにしていますので、
Reducerの処理自体は空っぽにしております

### ReturnTypeの利用


TypeScript2.8の機能であるReturnTypeを利用することで、
ActionCreator関数の戻り値からActionの型を特定することができるようになりました。
こうすることでAction型定義の管理が少しだけ楽になります。

```typescript
type Actions = (
  | ReturnType<typeof increment>
  | ReturnType<typeof setCount>
);

// ↓ こう解釈される

type Actions = {
    type: "app/example/INCREMENT";
} | {
    type: "app/example/SET_COUNT";
    payload: {
        count: number;
    };
}
```

TypeScript3.4で導入された `const assertion` を利用することで各定数が`string`ではなく、
その文字列の型として定義されるため↑のようにtypeが各アクションとして認識されます。

```typescript
const INCREMENT = 'app/example/INCREMENT' as const;
const SET_COUNT = 'app/example/SET_COUNT' as const;
```


### defaultの部分
`default`部分の`never`型への代入については[TypeScript 2.0のneverでTagged union typesの絞込を漏れ無くチェックする](https://qiita.com/wadahiro/items/9ec4af968a7314402499#_reference-ea5a7c38d951fc383cd3) の記事で紹介されている素敵なテクニックです。

# 最後に
TypeScriptではanyを多用すればエラーを黙らせることはできますが
いかにして型安全に設計・実装できるかを考えるのが楽しいですよね。

実はもっといい方法があるのではないかと
うずうずしていますので、いい案があればぜひ教えていただきたいです。

# 参考記事
色々参考にさせていただきました。

- [Redux typed actions でReducerを型安全に書く (TypeScriptのバージョン別)](https://qiita.com/wadahiro/items/7c421b668f28a99e2a29)
- [TypeScript 2.0のneverでTagged union typesの絞込を漏れ無くチェックする](https://qiita.com/wadahiro/items/9ec4af968a7314402499#_reference-ea5a7c38d951fc383cd3)
- [真・Flow & Redux で Reducer の実装パターンを考える
](https://qiita.com/mizchi/items/0e2db7c56541c46a7785)
