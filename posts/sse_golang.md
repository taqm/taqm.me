---
title: "Go言語でServerSentEvents(SSE)"
publishedAt: "2018-10-16T10:38:26+09:00"
tags:
  - Golang
---

# はじめに
タイトルの通りGo言語でServerSentEvent(以下SSE)を実装してみます。

まずSSEとはなあに？って方はこちらが参考になります

- https://www.webprofessional.jp/real-time-apps-websockets-server-sent-events/
- http://labs.gree.jp/blog/2014/08/11070/
- https://www.w3.org/TR/eventsource/

正直「WebSocketで良くない？」って雰囲気のある技術ですが、
仕様がシンプルなので好きな技術なのです:smirk_cat:

# コード
まずはプロジェクト構成

```
├── main.go
└── static
    └── index.html
```
とてもシンプルです
実際の各ファイルの中身を見ていきます

## ./main.go


```go:./main.go
package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

func sse(w http.ResponseWriter, r *http.Request) {
	flusher, _ := w.(http.Flusher)

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	// 1秒おきにデータを流す
	t := time.NewTicker(1 * time.Second)
	defer t.Stop()
	go func() {
		cnt := 1
		for {
			select {
			case <-t.C:
				fmt.Fprintf(w, "data: %d\n\n", cnt)
				cnt++
				flusher.Flush()
			}
		}
	}()
	<-r.Context().Done()
	log.Println("コネクションが閉じました")
}

func main() {
	dir := http.Dir("./static")
	http.HandleFunc("/event", sse)
	http.Handle("/", http.FileServer(dir))
	http.ListenAndServe(":8080", nil)
}
```
### 解説

`main`関数については特に説明は不要かと思いますので
`func sse(...)`について処理を追って説明をしていきます。

#### レスポンスヘッダーの設定
```go
w.Header().Set("Content-Type", "text/event-stream")
w.Header().Set("Cache-Control", "no-cache")
w.Header().Set("Connection", "keep-alive")
```
まずはレスポンスヘッダーに必要な項目を設定します。
ここについては見慣れたコードになりますね。


#### Flusherへのキャスト
```go
flusher, _ := w.(http.Flusher)
```
ここが一番のキモです！:point_up:
`http.ResponseWriter`を`http.Flusher`へキャストします。
`http.Flusher`とはResponseWritersに実装されたインタフェースで、
バッファしているデータをクライアントへフラッシュするものです。

後述しますが`flusher.Flush()`をすることで、
書き込んだ内容をすぐにクライアントサイドへ送信することができます。

#### イベントの送信
```go
t := time.NewTicker(1 * time.Second)
defer t.Stop()
go func() {
	cnt := 1
	for {
		select {
		case <-t.C:
			fmt.Fprintf(w, "data: %d\n\n", cnt)
			cnt++
			flusher.Flush()
		}
	}
}()
```
１秒おきにカウントアップした値を送信しています。
`fmt.Fprintf`で書き込んだ後に、先程用意した`flusher.Flush()`を読んであげましょう。
こうすることで書き込んだ内容がクライアントへ送信されます。
`data: XX\n\n`というのはSSEの仕様であり、
他にも`event`や`id`を設定することで柔軟なイベント駆動が可能になるのですが、
ここではシンプルに`data`だけを送信します。

### クローズ処理
```go
// notify := w.(http.CloseNotifier).CloseNotify()
// <-notify
<-r.Context().Done()
log.Println("コネクションが閉じました")
```

~~ここでは`http.ResponseWriter`を`http.CloseNotifier`へとキャストします。
キャスト後に`CloseNotify()`の戻り値で~~
コネクションが閉じたかどうかが`chan bool`返却されるため取得します。

**-- 2020/03/05 追記 --**
`CloseNotifier`はだいぶ前に非推奨になったということなので
`r.Context().Done()` を利用してコネクションが閉じたかを判定するほうが良いです。
**-- 追記ここまで --**


あとはこのチャンネルを監視し処理を止めておくことでSSE実装完了です！
ちなみに前述した`Ticker`は`defer t.Stop()`しているので勝手に止まってくれます。

## ./static/index.html
用意したエンドポイントへつなぐ部分です。
headタグなど書いても仕方ないので、bodyの中身だけ抜粋します。

```html:./static/index.html<body>
  <h1>count: <span id="cnt">0</span></h1>
  <script>
    const ev = new EventSource('/event');
    ev.addEventListener('message', (e) => {
      cnt.textContent = e.data;
    });
  </script>
```
`EventSource`といったものを利用することで、
簡単に先程用意したエンドポイントへ接続することができます。

# まとめ
SSE自体がHTTPの簡単な仕様の上で成り立っているので、
標準ライブラリのみで簡単に実装ができました。

実際に利用する場合には、
`flusher`をハンドラ外で管理したり、外部のイベントストリームを監視したりと、
色々とロジックが必要になりますが、SSEの実装部分としてはこれだけです。

簡単にサーバーサイドプッシュを実装したいときには
有力な候補になるかなとおもいます:relaxed:

おしまい
