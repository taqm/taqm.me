---
title: "Docker(Compose)を使ったローカル開発用MySQLの準備"
publishedAt: "2018-09-10T09:45:48+09:00"
tags:
  - MySQL
  - Docker
---

忘れないようにメモ

あくまでローカル開発用のコンテナ作成を目的としており、
本番環境や、永続化するような環境へ適応する場合には色々と他の手順が必要ですのでご注意ください。

基本的にオフィシャルページに書いてあることしかやってません！
[公式ページ](https://hub.docker.com/_/mysql/)

## ディレクトリ構成

とりあえず↓のような構成で進めていきます

```
.
├── docker-compose.yml
├── docker-entrypoint-initdb.d
│   ├── 01_create_tables.sql
│   └── 02_test_user.sql
└── my.cnf
```

後述しますが`docker-entrypoint-initdb.d`配下には構築時に実行したいものを配置します。

## docker-compose.ymlの中身
まずは内容を先に紹介

```yaml
version: '3'
services:
  db:
    image: mysql:タグ
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: database_name
      MYSQL_USER: user_name
      MYSQL_PASSWORD: password
      MYSQL_ALLOW_EMPTY_PASSWORD: "yes"
    volumes:
      - ./docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d
      - ./my.cnf:/etc/mysql/conf.d/my.cnf
```

要点だけ簡単に説明してきます

### environment
環境変数です。
せっかくなので公式ページに載っているものすべてを説明します。

|変数名|説明|
|---|---|
|MYSQL_ROOT_PASSWORD| この変数の設定は**必須**です!名前の通りROOTユーザのパスワードになります。 |
|MYSQL_DATABASE| 起動時に作成されるDBの名前です。|
|MYSQL_USER| 起動時に新しいユーザを作成します。ここで作成したユーザには[MYSQL_DATABASE] で指定したDBへの**GRANT ALL** 権限が付与されます。|
|MYSQL_PASSWORD|上記の[MYSQL_USER] で作成したユーザのパスワードです。<br>ユーザを作成する場合にはこちらが必須になります。|
|MYSQL_ALLOW_EMPTY_PASSWORD|[MYSQL_ROOT_PASSWORD] に空を設定できる用にするフラグです。<br>`"yes"`を設定することで空を設定することが可能になります。ただし、よくわからないならおすすめしない設定です。|
|MYSQL_RANDOM_ROOT_PASSWORD|`"yes"`を設定することでランダムなパスワードが発行されます。<br>起動時の標準出力へ`GENERATED ROOT PASSWORD:  xxxxxxx`と出力されますが、正直ローカル開発用ならこのオプションを使うことはないと思います。|
|MYSQL_ONETIME_PASSWORD|rootユーザのパスワード一度で期限切れにしてくれるらしいです。試してみたのですが、何故かうまく行かなかったので動作確認はできていません・・・ |

これらを踏まえてもう一度見てみると

```yaml
    environment:
      MYSQL_DATABASE: database_name
      MYSQL_USER: user_name
      MYSQL_PASSWORD: password
      MYSQL_ALLOW_EMPTY_PASSWORD: "yes"
```

本当に必要最小限の設定ですね＾＾

### volumes
マウントするボリュームです。

#### docker-entrypoint-initdb.d
mysqlのイメージは`/docker-entrypoint-initdb.d`配下のファイルを実行してくれます。
そのパスにマウントすることで、ローカルにあるSQLを実行してもらう作戦です。

実行してくれるのは  `.sh`, `.sql`, `.sql.gz` とのこと。
また、実行の順番はアルファベット順とのことなので、
ファイル名の先頭に01_,02_などをつけて実行順を制御してあげると良さそうです。

そしてこのSQLは環境変数「MYSQL_DATABASE」へ設定したDBで実行されます。

#### my.cof
MySQLでマルチバイト文字を扱う場合に設定するものです。
詳しい内容は[こちら](https://qiita.com/luccafort/items/0553c589dcc6459746bc)を参考にしてください!

ちなみに中身はこんなんです↓

```
[mysqld]
character-set-server=utf8
collation-server=utf8_general_ci

[client]
default-character-set=utf8
```

## そして実行
```bash
# 起動
$ docker-compose up -d # 起動

# rootユーザで接続
$ docker-compose exec db mysql

# 作成したユーザでログインする場合は↓
# docker-compose exec db mysql -u user_name -p

```

これでmysqlへ接続できるはずです！
２つめのコマンドは、「dbコンテナで`mysql`コマンドを実行する」ということになります。
この設定ではrootパスワードを設定していないので`mysql`だけでも接続できています。

ちなみに`mysql`の部分を`bash`にすることで、
bash起動も可能ですのでそこは目的に応じて使い分けてください。

# 注意
もしローカルDBのデータも永続化したい！って場合だと、
このままではコンテナを作り直すとデータが吹っ飛んでしまうので、`/var/lib/mysql`をマウントしてあげるなどの必要があります。
ただし、今の構成は最初にSQLが流れてしまうので色々な**調整が必要です**・・・

# 感想
実際はクライアントツールの設定も同時に行うことになると思いますが、
最小構成としてはこの様になると思います。

思った以上にシンプルな設定で済んだので積極的に利用していきます＾＾
