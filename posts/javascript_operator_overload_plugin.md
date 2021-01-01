---
title: "JavaScriptで演算子オーバーロードしてみる(BabelでAST)"
publishedAt: "2019-12-08T11:18:34+09:00"
---

# はじめに
この記事は[JavaScript Advent Calendar 2019](https://qiita.com/advent-calendar/2019/javascript)の８日目の記事になります。

実は前々から思っていたことがありました。
それは**「JavaScriptでも演算子オーバーロードしたい...!」** です。
ということで今回やってみました。

# アプローチ方法
JavaScriptは暗黙的に呼ばれる関数群がいくつかあります(`valueOf`や`toString`など)
ただこれらをどういじっても演算子オーバーロードにはなりません。
そこでタグ付きテンプレートリテラルを頑張って解析するかなぁとか考えていたのですが
あまりにも見栄えが悪かったので最終手段であるASTをいじっていく方法に決めました。
今回はbabelのプラグインとして実装します。

# 制作物
先に作ったものを載せます。
- [GitHub](https://github.com/taqm/babel-plugin-transform-operator-overload)
- [NPM](https://www.npmjs.com/package/babel-plugin-transform-operator-overload)

~~npmへ上げたかったのですが
色々とトラブルが重なりログインできないため断念 :crying_cat_face:~~
publishしました！
プラグイン名が重複していたので少し変わっています。

実際に使うとこんな感じです。

```js
opol: {
  const puts = { '<<': console.log };
  puts << 'hello world'; 
  // => hello world

  class Hoge {
    constructor(value) {
      this.value = value;
    }
    '+'(arg) {
      return this.value + arg.value;
    }
  }
  const a = new Hoge(100);
  const b = new Hoge(100);
  puts << (a + b);
  // => 200
}
```

# 作ってみる
## 使用ライブラリ
ASTやbebelプラグインについては良記事がたくさんあるのでここではあまり深くは触れないでおきます。（後ろに書く参考サイト参照
利用しているライブラリは以下です。

- [@babel/parser](https://www.npmjs.com/package/@babel/parser) → コードをASTに変換する
- [@babel/traverse](https://www.npmjs.com/package/@babel/traverse) → ASTを操作する
- [@babel/types](https://www.npmjs.com/package/@babel/types) → ASTの要素を操作（作成）する

実際はライブラリとして公開する関数に、パース済みの値が渡されてくるためライブラリを使っているという実感はあまりないです。

### 小話
ASTへの変換をウェブを調べると`babylon`を使っている記事が多いですが、
`babylon`はすでにアーカイブされており`@babel/parser`への移行を推奨しています。
気をつけましょう。

## 実装
演算子オーバーロードというくらいなので演算部分にフォーカスを当てることで実現できると考えていました。
実装方針は「演算時の左の要素に`+`などのプロパティがあった場合はそのプロパティの関数を呼び出す」です。

まずはコードを記載します。

```js
parentPath.traverse({
  BinaryExpression(path) {
    if (path.node.opolMarked) return;

    const { left, right, operator } = path.node;
    const leftId = t.identifier('left');
    const rightId = t.identifier('right');

    // ここで追加するBinaryExpressionも処理の対象となってしまうため
    // 印をつけて処理を行わないようにする
    original.opolMarked = true;

    const leftOp = t.memberExpression(leftId, t.stringLiteral(operator), true);
    const overloaded = t.callExpression(leftOp, [rightId]);
    const original = t.binaryExpression(operator, leftId, rightId);

    const fnc = t.callExpression(
      t.arrowFunctionExpression([leftId, rightId],
        t.conditionalExpression(leftOp, overloaded, original)),
      [left, right],
    );
  },
```

この`BinaryExpression`というのが`+`や`<`などの演算を示すものです。

<details><div>
<summary>AST</summary>

```js
  "expression": {
    "type": "BinaryExpression",
    "left": {
      "type": "Identifier",
      "name": "a"
    },
    "operator": "+",
      "right": {
        "type": "Identifier",
       " name": "b"
      }
    }
  }
```
</div></details>
これを使うことで以下のような変換が行われます。

```js:変換前
a + b;
```

↓

```js:変換後
((left, right) => left['+'] ? left['+'](right) : left + right)(a, b);
```

いきなり読みづらいコードが現れましたね。
↑でも触れましたがやっていることは**左の要素**に**演算子**と同じ記号のプロパティが存在するのなら
そのプロパティを右の要素を引数として呼び出し、
プロパティが存在しないのであれば通常通りの演算を行うというものです。
(`left['+']`が`undefined`ではない → オーバーロードしているという割り切り)

なぜ複雑に見える即時関数にする必要が？と感じると思いますがこれはとある問題があるからです。
`a + b` 程度の式ならいいですが `a() + b()`という式になった場合に計算結果を使い回す必要が出てきます。
事前に計算を行い変数に入れるというのもありなのですが、変数名の重複などの考慮が面倒だったので即時関数の引数とすることでスコープの狭い変数として計算結果を渡すことで解決しています。

#### ちなみに

> if (path.node.opolMarked) return;

という記述がありますがこれがないと追加された `left + right` に対して
同じ処理が走りstackoverflowを起こしてしまいます!


## 完成か？
動きだけを見ると完成かと思いました。
ですが...流石にコード量が増えすぎますし、すべてのコードにこれを適用してしまうととんでもないことになってしまいます。
なので今回は特定の文字列のラベルがついたブロック内でのみ↑の処理を行うようにしました。
こうすることで最小限のコードの増加で済みそうです。

```js
opol: {
  // ... このブロック内のみ変換処理を行う。
}
```

```js
  visitor: {
    LabeledStatement(parentPath) {
      if (parentPath.node.label.name !== 'opol') {
        return;
      }
```
# 本当の完成
これで完成！

```js
Array.prototype['<<'] = function(items) {
  this.push(items);
}

opol: {
  const a = [];
  a << 1;
  a << 2;
  a << 3;
  puts << a;
  // => [1,2,3]

  const a = { '===': () => true };
  puts << (a === 1 && a === 2 && a === 3);
  // true
}
```

これできれいな構文や気味の悪い構文を自由にかけるようになりました。

## 課題
ESLintや型の解決が一切行われないので
知らない人が見ると一体何が起きているのかわからない状態となります...:grimacing:
もちろんですがTypeScriptでは使えません。

~~あとテストも書けてません。（動作確認も怪しいです）~~ テスト書きました
課題まみれです。

# 最後に

長年の夢だったJavaScriptでの演算子オーバーロードを実現することができました。
正直実用的ではないですが、普段の業務では扱わないような技術で頭の体操になりますね。
本当はもっといろんなことをやりたかったのですが間に合わなかったので少しずつ機能を足していければと思います。(npmへもそのうち上げたいです）

そして、今回はbabel経由でASTの操作を行いました。
ASTを扱うのはハードルが高いように感じますがとても簡単なのでぜひ皆さんも触ってみてください。

--- 
おしまい

# 参考サイト
- https://github.com/jamiebuilds/babel-handbook/blob/master/translations/ja/plugin-handbook.md
- https://efcl.info/2019/12/03/dive-to-ast/
- https://sakura.io/blog/2017/12/13/babel-plugins/
