---
title: "Unicodeの丸数字（①とか）でやられた件"
publishedAt: "2019-01-11T07:20:07+09:00"
---

# 注意
記事の内容上、機種依存文字を使用しているため、
環境によっては文字が読みづらい状況となっていますがご了承くださいm(_ _)m

# はじめに
みなさん、丸数字というもの使っていますか？？
`①`みたいに数字をまるで囲んであるやつです。ちなみに`㊿`まで存在します。

そんなに進んで利用することも少ないと思いますが、
今回要件でリストの上から順番に丸数字を振ってほしいとリクエストが有りました。

「ただ連番降るだけっしょ！」と取り掛かったのですが、
考えていた実装と異なる内容になったのでよかったら参考にしてください。

# 実装
まず`㊿`までしかないです！ってことで、`㊿`までで良いとお許しをもらえました。
とりあえず一安心:relaxed:

## 実装その①

`①`のコードを取得して順に足していけば、それっぽくなるだろうという考えから
↓のようなコードを書きました（JavaScriptです）

```javascript
function toCircled(num) {
  const base = '①'.charCodeAt(0);
  return String.fromCharCode(base + num - 1);
}
// 入力チェックは省略
```
それっぽい関数もできたのでいざ動作確認

```javascript
for (let i = 1; i <= 50; i++) {
  console.log(toCircled(i));
}

// ①
// ②
// ③
// ...   いい調子！
// ⑲
// ⑳
// ⑴    ！？
// ⑵    ！！？？
```

`⑳`から先で違うパターンの数字が出てきたー:scream:
`㉑`から別の場所にあるのか...

### コード値を調べてみる

```javascript
'①'.charCodeAt(0); // -> 9312
'⑳'.charCodeAt(0); // -> 9331
'㉑'.charCodeAt(0); // -> 12881
```
だいぶ飛んでる。
２０で条件分岐するようにします！

## 実装その②

２１以上の場合は`㉑`を基準にするように変更しました。

```javascript
function toCircled(num) {
  if (num <= 20) {
    const base = '①'.charCodeAt(0);
    return String.fromCharCode(base + num - 1);
  }
  const base = '㉑'.charCodeAt(0);
  return String.fromCharCode(base + num - 21);
}
```
いざ動作確認

```javascript
for (let i = 1; i <= 50; i++) {
  console.log(toCircled(i));
}

// ①
// ...
// ⑳
// ㉑    よっしゃ！！
// ㉒
// ...
// ㉞
// ㉟
// ㉠    ！？
// ㉡    ！！？？
```

３６にまた見えない壁があったのか...
ここでようやくGoogle先生にご相談　
Wikipadiaにまさに[丸数字のページ](https://ja.wikipedia.org/wiki/%E4%B8%B8%E6%95%B0%E5%AD%97)が！！！

最初に２０で躓いたときに見るべきでした:weary:

## 実装その③ （最終版）

```javascript
function toCircled(num) {
  if (num <= 20) {
    const base = '①'.charCodeAt(0);
    return String.fromCharCode(base + num - 1);
  }
  if (num <= 35) {
    const base = '㉑'.charCodeAt(0);
    return String.fromCharCode(base + num - 21);
  }
  const base = '㊱'.charCodeAt(0);
  return String.fromCharCode(base + num - 36);
}
```
これで動くはず...っ！！


```javascript
for (let i = 1; i <= 50; i++) {
  console.log(toCircled(i));
}

// ①
// ...
// ㉟
// ㊱    やったー！
// ㊲
// ...
// ㊿
```

# あとがき
２,３行で終わると思っていたので、ここまで大きくなるとは思っていませんでした。
そして最初につまずいた段階で「他にもあるのでは...?」という疑問を持てなかったことが今回の敗因です。

もし何かの参考になればと思います( ˘꒳˘  )

おしまい

