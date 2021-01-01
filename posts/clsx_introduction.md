---
title: "Reactでよく使う classnames を置き換えるライブラリ。その名も「clsx」"
publishedAt: "2019-06-29T06:51:52+09:00"
---

# はじめに

みなさんReactでクラス名を動的に設定する場合どうしてますか？
ほとんどの人が`classnames`というライブラリを使っているのではないでしょうか。

ここ最近その`classnames`を置き換えるようなライブラリが登場していたようなので紹介します。

### classnames
まずライブラリの紹介の前に比較対象である`classnames`についてですが
Reactを利用する人ならほぼ全員が知っているであろうライブラリです。
というか[公式で推奨](https://reactjs.org/docs/faq-styling.html)されてるんですね。

https://www.npmjs.com/package/classnames

# 紹介
ここからが本題

## clsx


今回紹介するのは [clsx](https://www.npmjs.com/package/clsx) というライブラリです。
https://www.npmjs.com/package/clsx

今のバージョンは1.0.4でメジャーリリースは2018/12/25。
つまり去年のクリスマス生まれのだいぶ新しいライブラリですね。:snowman2:
npmのインストールグラフを見る限り、今年の5月から爆発的に利用者が増えてきているライブラリです。

コンセプトは**classnamesより小さく高速な代替品**とのこと。

どうやらあの`material-ui`がバンドルサイズを小さくするためにこちらに移行したようで、
それが突然ダウンロード数が爆発した要因かと思われます。

https://material-ui.com/blog/material-ui-v4-is-out/

||GitHub Star|サイズ(minifed)|サイズ（+gzip)|参考
|---|---|---|---|---|
|classnames|10,781|588B|371B|[リンク](https://bundlephobia.com/result?p=classnames@2.2.6)|
|clsx|467|512B|306B|[リンク](https://bundlephobia.com/result?p=clsx@1.0.4)|


バンドルサイズについてgzip時は306Bと`classnames`よりも18%(65B)ほど小さくなっております。

### 使い方
以下公式のコピペ

```js
import clsx from 'clsx';
 
// Strings (variadic)
clsx('foo', true && 'bar', 'baz');
//=> 'foo bar baz'
 
// Objects
clsx({ foo:true, bar:false, baz:isTrue() });
//=> 'foo baz'
 
// Objects (variadic)
clsx({ foo:true }, { bar:false }, null, { '--foobar':'hello' });
//=> 'foo --foobar'
 
// Arrays
clsx(['foo', 0, false, 'bar']);
//=> 'foo bar'
 
// Arrays (variadic)
clsx(['foo'], ['', 0, false, 'bar'], [['baz', [['hello'], 'there']]]);
//=> 'foo bar baz hello there'
 
// Kitchen sink (with nesting)
clsx('foo', [1 && 'bar', { baz:false, bat:null }, ['hello', ['world']]], 'cya');
//=> 'foo bar hello world cya'
```

Usageの癖が強いぃ！
やりたいことはわかりますがUsageにしてはトリッキー過ぎてスッと入ってこない・・・
一言で言うとおそらく`classnames`の完全互換です。（普段使いする分には実証済み）


### ベンチマーク

<details>
<summary>ベンチマーク結果（ちょっと長いので折りたたみます。）</summary>
<div>

```
# Strings
  classcat ≠   x  8,590,994 ops/sec ±0.27% (94 runs sampled)
  classnames   x  3,987,311 ops/sec ±1.68% (94 runs sampled)
  clsx         x 11,066,632 ops/sec ±0.23% (96 runs sampled)

# Objects
  classcat ≠   x 8,566,516 ops/sec ±0.42% (97 runs sampled)
  classnames   x 3,697,182 ops/sec ±1.31% (98 runs sampled)
  clsx         x 7,147,168 ops/sec ±0.30% (95 runs sampled)

# Arrays
  classcat ≠   x 7,538,840 ops/sec ±0.56% (95 runs sampled)
  classnames   x 1,697,776 ops/sec ±1.41% (97 runs sampled)
  clsx         x 7,922,225 ops/sec ±0.18% (95 runs sampled)

# Nested Arrays
  classcat ≠   x 6,462,158 ops/sec ±0.22% (97 runs sampled)
  classnames   x 1,201,570 ops/sec ±0.22% (96 runs sampled)
  clsx         x 6,132,222 ops/sec ±0.49% (95 runs sampled)

# Nested Arrays w/ Objects
  classcat ≠   x 6,277,187 ops/sec ±0.62% (93 runs sampled)
  classnames   x 1,613,328 ops/sec ±1.69% (96 runs sampled)
  clsx         x 5,156,844 ops/sec ±0.22% (95 runs sampled)

# Mixed
  classcat ≠   x 7,073,536 ops/sec ±0.26% (95 runs sampled)
  classnames   x 2,149,952 ops/sec ±1.24% (95 runs sampled)
  clsx         x 5,577,715 ops/sec ±0.20% (93 runs sampled)

# Mixed (Bad Data)
  classcat ≠   x 1,770,852 ops/sec ±0.14% (97 runs sampled)
  classnames   x 1,148,353 ops/sec ±0.54% (97 runs sampled)
  clsx         x 1,887,010 ops/sec ±0.14% (96 runs sampled)
```

</div>
</details>

今回の主役`clsx`ですが`classnames`と比べた結果、差が大きいものでは５倍近くのパフォーマンスがでるようです。


**ちなみに**
ここで`classcat`というライブラリが比較対象に含まれていますね。
こちらはコンセプトは同じ「打倒`classnames`」なのですがAPIの互換性がないライブラリなので
この記事では扱わないことにしています（興味がある方は調べてみてください）

# まとめ

個人的な感想としては使ってみてもいいかな？という感じです。

が、正直なところ置き換えるメリットもそれほど大きくないですし、
なにより`classnames`に依存しているライブラリが山ほどあるので、
`classnames`がデファクトスタンダードから引きずり降ろされることもないと思います。
（つまりタイトルは煽りです:sweat_smile:）


ちなみに`classnames`のIssueに[「clsxっていうのが最近出てきたけどこのままでよいのか?」]
(https://github.com/JedWatson/classnames/issues/187)といった物もあり、
ひょっとするとclassnamesの性能がこれからまた上がるかも知れませんね。

こうやって対抗ライブラリが出てきては比較して〜というのは面白いし学びもあるので、
みなさんも普段使っているライブラリに他の似たものがないか調べてみてはいかがでしょうか？

---

おしまい
