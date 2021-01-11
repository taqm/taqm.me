---
title: "TypeScriptの keyof を特定の型でフィルタする"
publishedAt: "2018-04-26T11:16:00+09:00"
description: "TypeScriptでkeyofで取得するプロパティ名を型によってフィルタするtipsです。"
tags:
  - TypeScript
---

TypeScriptで少しハマったのでメモ

↓のようなインタフェースがあったとして

```typescript
interface Sample {
  name    : string;
  age     : number;
  email   : string;
  address : string;
  birthday: Date;
}

type Hoge = keyof Sample;
// -> name | age | email | adress | birthday
```

型が`string`のキーだけの一覧が欲しい！となったので以下のようなTypeを使いました。

```typescript
type FilteredKeys<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never
}[keyof T];

type Hoge = FilteredKeys<Sample, string>;
// -> name | email | address
```

こんなことをしたい時点で少し無理やりな実装になってる可能性が高いですが
忘れないようにメモ
