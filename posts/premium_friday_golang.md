---
title: "ひさしぶりのプレミアムフライデー（GO言語）"
publishedAt: "2018-11-30T18:48:37+09:00"
---

# はじめに
気づけば今日はプレミアムフライデーです（死語？）
せっかくなので久しぶりにプレミアムフライデーを求める処理を書いてみます。

# コード
## メイン
```go:main.go
package main

import (
	"fmt"
	"strconv"
	"time"
)

func main() {
	r := GetPremiumFriday(2018, 10)
	fmt.Println(r)
}

func GetPremiumFriday(year int, month int) time.Time {
	l := time.Date(year, time.Month(month+1), 0, 0, 0, 0, 0, time.UTC)
	w := l.Weekday()
	dh := strconv.Itoa(int(-(w+2)%7) * 24)
	d, _ := time.ParseDuration(dh + "h")
	return l.Add(d)
}
```
### 解説
あまり説明もないですが`time`パッケージを使っています。
`time.Date`関数の引数部分にある**日付部分**に0を渡すことで前月の末日が設定されます。
なので受け取った月＋１を設定して設定した月の末日を取得しました。

`ParseDuration`へ文字列で期間を渡すことで、シンプルに日付の減算が可能なのですが、
最大単位が**Hour**のようなのでちょこっとだけ計算を行っています。


## テスト
せっかく標準でテスト機構が備わっているのでどんどん使っていきましょう！
VSCodeだとコード上で`run test`できるのでこういう時すごく便利です

```go:main_test.go
package main

import (
	"testing"
)

type Fixture struct {
	Yaer      int
	Month     int
	ExpectDay int
}

var fixtures = []Fixture{
	Fixture{2016, 2, 26},
	Fixture{2018, 9, 28},
	Fixture{2018, 10, 26},
	Fixture{2018, 11, 30},
	Fixture{2018, 12, 28},
	Fixture{2019, 1, 25},
}

func TestGetPremiumFriday(t *testing.T) {
	for _, f := range fixtures {
		d := GetPremiumFriday(f.Yaer, f.Month).Day()
		if d != f.ExpectDay {
			t.Error(f)
		}
	}
}
```

#　まとめ
やってみたかっただけでした
そのうちシャイニングマンデーもやるかな

おしまい
