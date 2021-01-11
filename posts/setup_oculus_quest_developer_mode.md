---
title: OculusQuestを開発者モードにするメモ
publishedAt: "2021-01-09"
tags:
  - OculusQuest
---

# はじめに

タイトルの通りOculusQuestを開発者モードにするメモを書きます。

# 前提
以下の状態であることを前提とします。

- OculusQuestのセットアップが完了済み
- スマートフォンアプリでOculusQuestと接続済み
- OculusDevelopersアカウントを作成済み

# スマートフォンアプリから設定を行う

スマートフォンのOculusアプリを開いて対象となるOculusQuestと接続状態にします。  
そして「その他の設定」→「開発者モード」→「開発者モードのスイッチON」と進めます。

OculusDevelpersで組織を作成していない場合はこのタイミングで警告が出て、
ウェブページでの作業を求められるため言われるがままに作成開始を押します。


![](/static/setup_oculus_quest_developer_mode/ss1.png) 
![](/static/setup_oculus_quest_developer_mode/ss2.png) 
![](/static/setup_oculus_quest_developer_mode/ss3.png) 
![](/static/setup_oculus_quest_developer_mode/ss4.png) 

# 組織作成

前の手順で作成開始を押したら↓のページが表示されますので「コンセプトドキュメントをレビュー用に提出」をクリックしてください。

そうすると英語のページが出てきますがデザインが崩れたりとちょっと怪しいページなので、
このURLをPCで開いて作業を進めていきます。（PC側でもOculusDevelopersへログインする必要があります

![](/static/setup_oculus_quest_developer_mode/ss5.png)
![](/static/setup_oculus_quest_developer_mode/ss6.png)
![](/static/setup_oculus_quest_developer_mode/ss7.png)

PCで同じページを開いたら「Begin Application Process」をクリックします。  

![](/static/setup_oculus_quest_developer_mode/ss8.png)

そうしたら 「開発者機密保持契約」に同意して組織名を入力すれば完了になります！
（開発者機密保持契約のページはキャプチャが取れてなかったのでありません（泣）


![](/static/setup_oculus_quest_developer_mode/ss9.png)

# ふたたび開発者モードをONにする

組織の作成が完了したらふたたび  
「その他の設定」→「開発者モード」→「開発者モードのスイッチON」と進めます。  
これで無事に開発者モードに変更ができるはずです！

# 最後に
ドキュメントの提出など記載があったため、もしかすると文章など書かされるのではないかとドキドキしましたが特に大したこともなく達成できたためホッとしました。
（Twitterの開発者アカウントは色々と面倒だったので

色々と変化が早いため気づくと画面UIは変わっているかもしれませんがだれかの役に立つと良いなと思います。

--- 

おしまい
