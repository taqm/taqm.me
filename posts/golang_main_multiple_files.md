---
title: "Go言語でmainパッケージに複数ファイルある場合にハマった（基礎）"
publishedAt: "2018-09-10T09:28:41+09:00"
tags:
  - Golang
---

main.goの１ファイルから卒業するため、
とりあえずファイルを分けたらハマったのでメモ

前提としてプロジェクトがこうなっているとします。

```
.
├── main.go
└── foo.go
```

各ファイルの中身は以下の通り

■ **main.go**

```go
package main

func main() {
	Bar()
}
```

■ **foo.go**

```go
package main

import "fmt"

func Bar() {
	fmt.Println("hello main package")
}
```

とてもシンプルですね。
それでは実行してみましょう! `hello main package` と出力されるはずです！

```bash
$ go run main.go
```

> ./main.go:4:2: undefined: Bar

おや？なにかエラーが・・・

どうやら`foo.go`が認識されていないようです。

すごく基本的な部分なのですが実行の仕方がまずかったようです。
正しく動くパターンはこちら

```bash
$ go run *.go

# もしくはすべてのファイルを渡す
$ go run main.go foo.go
```

こうしないと本当に`main.go`しか対象としてくれないため、
別ファイルで定義されたものが参照できなかったということです。

おしまい。
