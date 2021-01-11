---
title: "Go言語のtext/templateでNewするときの名前について"
publishedAt: "2018-09-10T09:34:00+09:00"
description: "Go言語の標準パッケージ'text/template'を利用した際にハマった罠の解説です。"
tags:
  - Golang
---

Go言語の標準パッケージである`text/template`について
けっこうハマってしまったのでメモとして残します。

# .ParseFilesを利用する場合の、template.Newの引数
まずは以下のコードを見てください

```go
package main

import (
	tmpl "text/template"
	"os"
)

func main() {
	t := tmpl.Must(tmpl.New("mytemplate").ParseFiles("test.txt"))
	if err := t.Execute(os.Stdout, "taqm"); err != nil {
		panic(err)
	}
}
```

■ test.txt

```
Hello {{ . }}
```

test.txtを読み込んで、"taqm"というパラメータを渡して標準出力へ吐き出しています。
実際にこのコードを実行してみると...

> panic: template: "mytemplate" is an incomplete or empty template

なんか怒られた...
こういうときはじっくりエラー文言を呼んでみることが重要！

> "mytemplate"は不完全または空のテンプレートです [by Google翻訳]

「中身は空じゃないし文法がおかしかったのかな？」ってことで、
テンプレートの文法がおかしいのかもう一度調べ直してみました。

`template.New`をせずに`template.ParseFiles`だと問題なく動くことを確認。
つまり`New`していることが原因なのか？

調べていると[ある記事](https://qiita.com/akiraak/items/aa259b3988e00c2a3820)に答えはありました。

`template.New`の後ろで`ParseFiles`を呼ぶ場合は、
`ParseFiles`の引数に設定するファイルパスの**ファイル名**を設定する必要があるらしい！

```go
t := tmpl.Must(tmpl.New("mytemplate").ParseFiles("test.txt"))
```
↓ mytemplateをファイル名に変更

```go
t := tmpl.Must(tmpl.New("test.txt").ParseFiles("test.txt"))
```

やっと動きました・・・＾＾
なんだかんだ1時間くらいハマってしまいました。

素直にエラーメッセージでGoogle検索していればもっと早くに気付けたのかもしれません。
ですが、Goの公式ドキュメント見たり、ソースコードを見たりしたので
結果的に得るものは多かったのかなと思います。

もし同じことでハマった人がすぐにこのページにたどり着けるといいなってことで！

おわり＾＾

# 参考ページ
- [html/templateで自作の関数を利用する](https://qiita.com/akiraak/items/aa259b3988e00c2a3820)
