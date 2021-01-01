---
title: "ExpressでServer Sent Event (SSE) を簡単に扱ってみる"
publishedAt: "2018-06-26T19:38:36+09:00"
---

# 概要
「暇だし簡単なチャットでも作ってみようかなー」と思い
車輪の再発明とわかりつつ、ライブラリっぽいものを作ってみました。

## Server Sent Event(SSE)ってなに
すごく大雑把に言うと
「コネクションを張りっぱなしにして、必要な時にメッセージ送信を行う仕組み」です。

これだけを聞くとWebSocketと一緒なのかな？と思いますが、
SSEは**サーバ → クライアント**への一方通行となっています。

クライアントはSSEのエンドポイントへ接続しレスポンスを待つのではなく、
ソケットをそのままlistenし続け、サーバサイドでなにかしらPushしたいタイミングで、
クライアント側へデータを送信し処理を行います。

とても省略しましたが、とてもシンプルな仕組みであり
、
HTTP通信に親しみのある方なら、とっつきやすいと思います。

### 参考になった記事
- https://www.webprofessional.jp/real-time-apps-websockets-server-sent-events/
- https://uhyohyo.net/javascript/13_2.html
- https://www.slideshare.net/mawarimichi/push-37869433

# 環境

型定義が大好きなので、TypeScriptを使っています

# 完成したもの
ソースコードは[こちら](https://github.com/taqm/express-sse-middleware)

完全にドキュメントが面倒になったパターンなので、
READMEなどはあとでちゃんと整備します


# 使い方
まずはインストール
`npm install express-sse-middleware`
yarn を使う場合は
`yarn add express-sse-middleware`

README通りですが一番シンプルな使い方が↓

```javascript
import express from 'express';
import { sseMiddleware } from 'express-sse-middleware';

app.use(sseMiddleware);
app.get('/path', (req, res) => {
  const sentMsg = res.sse();

  let count = 0;
  setInterval(() => {
    sentMsg(String(count++));
  }, 1000); // １秒おきに数値を送信する
});
app.listen(3000);
```

`res.sse()`の戻り値である`sentMsg`を実行するタイミングで
クライアントへと値が送信されます。

実装は60行程度なので非常にシンプルに作っています。
ぜひソースコードを見てみてください。

# demo
~~[サンプルプロジェクトのソース](https://github.com/taqm/express-sse-sample)~~
~~Herokuで実際に動かしています。~~

こちら閉鎖しました

# 感想
仕様を完全に実装できてはいませんが、簡単に作ることができました。
むしろTypeScriptでNpmモジュールを作ったのが初めてなので
そちらのほうが大変だったかも・・・

SSEに関しては、Spring5でも採用されていたり
リアクティブプログラミングと相性が良かったりするので、今後は主流の技術になるかも知れません。

ちなみに、とりあえず動かしてみたかった系の実装なので
もし危険な処理や、他にベストプラクティスがあるのであれば、ぜひ教えてください！


