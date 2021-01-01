---
title: "TypeScriptでFunction.bindを使うのはよくない"
publishedAt: "2018-10-02T15:05:33+09:00"
---


# 追記
TypeScript 3.2 RC にてBind周りに変更が入りました

詳細については以下の記事を参考にしてください！
https://qiita.com/vvakame/items/79557e00cfe6d3c612cd

# はじめに

みなさんご存知かと思いますが、
JavaScriptの`this`は他の言語では考えられない動きをします。
そこで`this`を固定するために`.bind`関数を使うことが一般的ですが、
TypeScriptの場合はそうはいきません。

# 何故なのか
まずはbindがどういう定義になっているのか見てみましょう

```typescript
 Function.bind(this: Function, thisArg: any, ...argArray: any[]): any
```

はい。
色々と`any`です。

せっかくの型を大事にする言語なのにこれでは台無しです。

# じゃあどうすれば？
マイクロソフト公式がthisの扱いについてページを作っているので
ここを元に解説していきます。[公式](https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript)

## Use Instance Functions

TypeScriptのクラスとしてデフォルトのプロトタイプメソッドではなく、
インスタンスにアロー関数を生やす形で定義します。

```typescript
class MyClass {
    private status = "blah";
    
    public run = () => { // <-- note syntax here
        alert(this.status);
    }
}
var x = new MyClass();
$(document).ready(x.run); // SAFE, 'run' will always have correct 'this'
```

### いい点
- 使用する人が`this`ついて処理漏れが起きません
- 型安全です
- 関数にパラメータがある場合は、追加作業は必要ありません

３つ目についてはどういったメリットなのかはあまり汲み取れていません…
**どなたか分かる方コメントなどでおしえていただけると嬉しいです**

### 悪い点
- そのクラスを継承した際に、派生クラスから`super.XXX`でアクセスすることができません
- そのメソッドは事前にバインドされ、型安全ではないコントラクトがクラスとコンシューマの間で追加されることはありません
    - 原文: The exact semantics of which methods are "pre-bound" and which aren't create an additional non-typesafe contract between the class and its consumers

正直２つ目はよく意味がわかりませんでした…(ダメダメだ
**どなたか分かる方コメントなどでおしえていただけると嬉しいです**(２度目)

### いい点 かつ 悪い点
この方法だと、クラスインスタンスを作るたびに、クロージャが作成されてしまいます。
もし普通のインスタンスメソッドとしてしか実行しなのであれば、この実装方法は過剰すぎます。
ただし、このメソッドをコールバック関数としてよく使うのであれば、
その都度クロージャを作るよりもこのほうが良いでしょう

## Local Fat Arrow
その都度クロージャを作ってあげるパターンです。

```ts
var x = new SomeClass();
someCallback((n, m) => x.doSomething(n, m));
```

### いい点
- これは100%型安全です！
- ECMAScript3でも動きます
- インスタンス名の記述が１度いいです

### 悪い点
- パラメータを２度記述しないといけません
- 可変長引数可変長引数を利用する場合動作しません

### いい点 かつ 悪い点
パフォーマンス/メモリついてはインスタンス関数と比較すると正反対です
(こちらの方がメモリは使わないが、少しパフォーマンスが悪い)

# まとめ
一応元記事には`Function.bind`についての記載もあったのですが、
現時点で型安全ではないので、採用はないかなと思います。

