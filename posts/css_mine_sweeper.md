---
title: "CSS（SCSS）だけでマインスイーパーを作ってみる"
publishedAt: "2019-02-05T07:41:06+09:00"
description: 'JavaScriptを使わず、CSS(SCSS)のみでブラウザ上でマインスイーパーを実装してみた際の解説です。'
tags:
  - CSS
  - SASS
---

# はじめに
みなさんマインスイーパーをご存知ですか？
そうです！昔のWindowsに入っていたゲームです！

プログラミングの勉強の一環として作ったりすることも多い題材だと思いますが
今回はSass（SCSS）のみで作ってみたいと思います。（JavaScriptは一切書きません）

※ これはマインスイーパーの記事になるので、Sass(SCSS)の解説は控えめになっております

# 成果物
まず動くものは[こちら](https://taqm.github.io/css-mine-sweeper/)です
ソース →　[GitHub](https://github.com/taqm/css-mine-sweeper)

本当は**CodePen**に投稿しようと思ったのですが
ソースコードの質が悪いようで動かなかったので諦めました:pensive:

あと、後述しますがビルド時のSCSSからCSSへ変換するタイミングで地雷の位置が決まるので
上記のリンクは地雷の位置が変わることはありません...

# 利用技術
以下のものを使っています

- yarn
- SCSS
- Pug
- node-sass

プロジェクトには`stylelint`が入っていますが
有効化するの忘れてたので警告（or エラー）まみれです。

## スタイリング
今回はFlexboxにてスタイリングを行っています。

そして、キレイなスタイリングよりも、ロジカルな部分に重きをおいているので
見るに堪えないコードを書いている可能性があります。
その点ご了承ください（`!important`とかは使ってないです）

# 解説
すべてを解説するのは大変なので
苦労したところ、工夫した以下を解説していきます。

- 地雷をランダムに配置
- マスを開く、フラグを立てる
- マスの周辺の地雷数を表示
- 開いたマスの周りに地雷がない場合は周辺を探索
- 残りの地雷数を表示
- クリア判定、ゲームオーバー判定

解説中に出てくるコードについてはかなり省略していますので、
詳細が気になる方はGitHubのほうを参照してください

## 最初に
今回のSCSSで書くにあたって以下の変数を用意しております。

```scss
$row: 8; // 横幅
$col: 8; // 縦幅
$mineCount: 10; // 地雷の数
```

用途はコメントの通りです！
では各要素の解説をしていきます。

## 地雷をランダムに配置

まずは地雷を配置しないことには始まりません。
地雷の位置をべた書きではあんまりなのでランダムに配置したいところです。

「ランダムとか無理だろ・・・」と思っていたらうってつけの機能がありました。
SCSSの組み込み関数に`random(n)`というものがあり、これがそのまま使えます。

[参考記事はこちら](https://qiita.com/tonkotsuboy_com/items/909b4073459ecaf7a435)

これを使うことでランダムに配置することは実現できそうですね。
では実際のコードを見てみます。

```scss:style.scss
$minePos: (); // 地雷の位置配列

@for $i from 0 to $mineCount {
  $mine: 0;
  $continue: true;

  @while $continue != null {
    $mine: random(($row * $col) - 1);
    $continue: index($minePos, $mine);
  }
  $minePos: append($minePos, $mine);
}
```
`$col`, `$row`, `$mineCount`は事前に説明した変数たちになります。

今回の設計ではそれぞれのマスに「0〜63」の数字を振っています。
`random`の結果すでに地雷として選出済みの数字が選ばれた場合は
ループを継続し、重複なく地雷が指定の個数選択されるようにしました。

これで地雷をランダムに配置するという課題は完了です。

### 問題
この`random関数`はあくまでトランスパイルの時にランダムな数字を選ぶため
一度CSSへ書き出してしまうともう変わることはありません。

ここの点は残念ですが仕方がないです...

## マスを開く、フラグを立てる
ユーザが行うことができるアクションの２つを実装していきましょう。
もちろんSCSS縛りなので動的にクラス付与などはできません。

今回はINPUTタグのチェックボックスを用いて状態を判定していきます。

そして右クリックの判定など到底無理なので、
「マスを開くモード」と「フラグを立てるモード」の２つを用意し、
モードごとにチェックできるチェックボックスを切り替えていきます。

まずはHTML（Pug）の構造です。

```pug:index.pug

input#normal-mode(type="radio", name="mode", checked)
input#flag-mode(type="radio", name="mode")
p.mode_control
  label.normal_mode(for="normal-mode")
    span 通常　
  label.flag_mode(for="flag-mode")
    span フラグ

- for (let i = 0; i < 64; i++)
  input(id = `input-${i}-open`, type = "checkbox")
- for (let i = 0; i < 64; i++)
  input.flag_check(id = `input-${i}-flag`, type = "checkbox")

.field
  - for (let i = 0; i < 64; i++)
    .cell
      label.mark_as_opened(for = `input-${i}-open`)
      label.mark_as_flag(for = `input-${i}-flag`)
```

これをHTMLへ変換すると以下のような形となります。

```html:index.html
<input id="normal-mode" type="radio" name="mode" checked>
<input id="flag-mode" type="radio" name="mode" checked>
<p class="mode_control">
  <label class="normal_mode" for="normal-mode">
    <span>通常</span>
  </label>
  <label class="flag_mode" for="flag-mode">
    <span>フラグ</span>
  </label>
</p>

<input id="input-{i}-open" type="checkbox"> <!-- i = 0 ~ 64 -->
...
<input id="input-{i}-flag" type="checkbox" class="flag_check">
...
<div class="field">
  <div class="cell">
    <label class="mark_as_opend" for="input-{i}-open"></label>
    <label class="mark_as_flag" for="input-{i}-flag"></label>
  </div>
  ...
</div>
```

それではスタイルになりますー

```scss
#normal-mode:checked ~ .field {
  .mark_as_opened {
    display: block;
  }
  .mark_as_flag {
    display: none;
  }
}

#flag-mode:checked ~ .field {
  .mark_as_opened {
    display: none;
  }
  .mark_as_flag {
    display: block;
  }
}

@mixin open {
  background-color: #EEE;
  .mark_as_opened,
  .mark_as_flag {
    display: none;
  }
}

@for $i from 0 to $col * $row {
  .cell:nth-child(#{$i + 1}) {
    #input-#{$i}-open:checked ~ .field & {
      @include open;
    }
    #input-#{$i}-flag:checked ~ .field & {
      &::before {
        content: "🚩";
      }
      .mark_as_opened {
        display: none;
      }
    }
  }
}
```

マスを開く動作は
中にLABELを配置して、クリックしたら遠くのチェックボックスをチェックさせ
無理やりな兄弟セレクタにより開いた状態となります。
そして開いたマスには操作させたくないのでLABELを非表示にしちゃいましょう。

通常モードとフラグモードはラジオボタンで制御します。
`#normal-mode`を選択している場合のみ`.mark_as_opened`を有効化。
そして`#flag-mode`の時は`.mark_as_flag`を有効化。

これでマスをクリック時にチェックされるチェックボックスを切り分けることができるようになりました。

INPUTタグをかなり上の方に定義することで、兄弟要素としてセレクタを書きやすくなります。



## マスの周辺の地雷数を表示
マスを開いたので次は開いたときに表示するものを設定します。

表示されるものは以下の２つです。

- 地雷の数
- 地雷そのもの

そこが地雷でないかつ、周りに地雷が１つもない場合は何も表示しません。
（次のステップで詳しく触れます）

表示の方法は疑似要素`::before`にて表示していきましょう。

```scss
@mixin open {
  &::before {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
  }
}

$mineSelector: ();
@for $i from 0 to $col * $row {
  $mines: countMine($i);
  $isMine: isMine($i);
  .cell:nth-child(#{$i + 1}) {
    &::before {
      @if $isMine {
        $mineSelector: append($mineSelector, #{&}, 'comma');
      } @else {
        content: if($mines > 0, "#{$mines}", '');
      }
      display: none;
    }
  }
}

#{$mineSelector} {
  content: '■';
}
```

`.cell`の疑似要素`::before`に`content`を設定していきます。
デフォルトは`display:none`で、開いたときのみ表示させるようにしましょう。
地雷の`content`をわざわざ外に出しているのは、
当初は爆弾の画像をbase64で持たせようとして無駄を減らすつもりでしたが
面倒になったので`■`にしてます:joy:

### isMine, countMine

ここで登場した`isMine`と`countMine`という自作関数の中身を見てきます。

```scss
// そこが地雷かどうか
@function isMine($pos) {
  @return index($minePos, $pos) != null;
}

// 周囲８マスの地雷の数を返却
@function countMine($pos) {
  $count: 0;
  @each $n in getNeighborIndex($pos) {
    @if isMine($n) {
      $count: $count + 1;
    }
  }
  @return $count;
}
```

`getNeighborIndex`では引数中心とした時の、周りの８マスに対応する数字の配列を返却してくれます。

先程の**地雷をランダムに配置**の章で準備した地雷の位置配列に
周囲８マスの数字いくつ含まれるのかを判定します。

### getNeighborIndex

マスの周りの数字を返却してくれる関数です。
今回は各マスを１次元の数値で管理しているためちょっと大変です。

```scss

$areaOffsets: (
  (-$col, $col), // 上下
  (-$col - 1, -1, $col - 1), // 左側
  (-$col + 1, +1, $col + 1), // 右側
);

// フィールドの範囲内か判定
@function isValidPos($pos) {
  @return (
    $pos >= 0 and
    $pos < $row * $col
  );
}

// 周辺８マスのポジションを取得
@function getNeighborIndex($center) {
  $wk: nth($areaOffsets, 1);
  @if $center % $col != 0 { // 左端の場合スキップ
    $wk: join($wk, nth($areaOffsets, 2));
  }
  @if $center % $col != $col - 1 { // 右恥の場合スキップ
    $wk: join($wk, nth($areaOffsets, 3));
  }
  $ret: ();
  @each $offset in $wk {
    @if isValidPos($center + $offset) { // 範囲外は省く
      $ret: append($ret, $center + $offset);
    }
  }
  @return $ret;
}
```

まずは中心に対する周りのマスのオフセットを保持します。（`areaOffsets`）
そして上下左右それぞれが有効なもののみ返却します。

## 開いたマスの周りに地雷がない場合は周辺を探索

マインスイーパー自作時の醍醐味になります。
大体の実装が再帰により実現されていると思いますが、
今回も例に漏れず再帰を行います。

```scss
@function getLinks($center, $linked) {
  $neighber: getNeighborIndex($center);
  $tmp: $linked;

  @each $n in $neighber {
    @if index($tmp, $n) == null {
      $c: countMine($n);
      $tmp: append($tmp, $n);
      @if $c == 0 {
        $tmp: getLinks($n, $tmp);
      }
    }
  }
  @return $tmp;
}

@for $i from 0 to $col * $row {
  $mines: countMine($i);
  $isMine: isMine($i);

  @if not($isMine) and $mines == 0 {
    $selector: ();
    @each $p in getLinks($i, ()) {
      $selector: append($selector, "#input-#{$i}-open:checked ~ .field .cell:nth-child(#{$p + 1})");
    }
    #{join($selector, (), 'comma')} {
      @include open;
    }
    $debug: $selector;
  }
}
```
周りに地雷がない場合のみ、再帰による探索を行います。

一度探索した値をキャッシュとして保持すれば少し効率が上がるのですが
出力されるCSSが変わるわけではないのでずさんな処理のままです。

「チェックの付いたチェックボックスと兄弟の`.field`内にあるマスN」
という定義を大量に作っています。
都度スタイルを宣言していてはCSSが大変なことになるので、
配列にセレクタを詰めて一発でスタイルを当てましょう。

## 残りの地雷数を表示
ゲームとして何個の地雷があるのかわからないと不便ですよね。
そこで地雷が残りいくつあるのかを表示できるようにしましょう！

```scss
$lastSelector: "";
@for $n from 1 through $row * $col {
  $lastSelector: $lastSelector + ".flag_check:checked ~";

  #{$lastSelector} .notice_area .last {
    &::before {
      content: "#{$mineCount - $n}";
    }
  }
}
.notice_area .last {
  &::before {
    content: "#{$mineCount}";
  }
  &::after {
    content: '個';
  }
}
```

チェックの数をカウントするような形にしてみました。
地雷の数 - チェックした数になるように兄弟セレクタを延々と並べます。

ちなみに０のときのセレクタはこんな感じ

```css
.flag_check:checked ~ .flag_check:checked ~ .flag_check:checked ~ .flag_check:checked ~ .flag_check:checked ~ .flag_check:checked ~ .flag_check:checked ~ .flag_check:checked ~ .flag_check:checked ~ .flag_check:checked ~ .notice_area .last::before {
  content: "0";
}
```

人間が読むものじゃないですねー

## クリア判定、ゲームオーバー判定
やっと最後のゲーム終了判定です。
ここもチェックボックスの状態に応じてスタイル当ててあげることで対応しましょう。

**ゲームオーバーの判定**

```scss
// ゲームオーバー判定
$overSelector: ();
@each $p in $minePos {
  #input-#{$p}-open:checked ~ .game_over {
    $overSelector: append($overSelector, #{&}, 'comma');
  }
}

#{$overSelector} {
  display: flex;
}
```

地雷のチェックボックスが一つでもチェック状態になったら
ゲームオーバー領域の`display: none`を解除し、
画面全体を覆うようにゲームオーバー画面を表示します。
これはとても素直です。

**ゲームクリアの判定**
すべての地雷のマスにフラグが立ったらクリア判定にしたいです。
しかし、それだとすべてのマスにフラグを立てたらクリアになってしまうので
地雷以外の場所にフラグが立っていないことも条件とする必要がありました。

```scss
$clearSelector: "input";
@for $i from 0 to $col * $row {
  $wk: "";
  @if isMine($i) {
    $wk: "#input-#{$i}-flag:checked";
  } @else {
    $wk: "#input-#{$i}-flag:not(:checked)";
  }
  $clearSelector: $clearSelector + ' ~ ' + $wk;
}

#{$clearSelector} ~ .game_clear {
  display: flex;
}
```

「これで地雷の場所にのみフラグが立っている」というセレクタの完成です！！

あと**ゲームオーバー**と**ゲームクリア**の要素をlabel要素にし、
INPUT(type=reset)に紐づけています。

こうすることで各要素クリック時にすべてのチェックが外れ
初期状態に戻るようにしています。

これで何度でも遊べる！！！

# あとがき
軽い気持ちで始めてみましたが中々に骨が折れました...
ただ、配列操作や乱数生成など普通にスタイリングしているだけでは
中々触ることのない機能を触ることができたので面白かったです:relaxed:

あと普通のプログラム言語にはない視点でのロジックを考える必要があり、色々と刺激を受けました！

今回は「CSSってこんな事もできるんですよ！」という紹介ということでやってみましたが、
他にもやってる方が結構いるので実装を見比べてみるとおもしろいかもしれませんね:sunny:

それでは皆さんよいSassライフを！(^_^)/~

---

おしまい
