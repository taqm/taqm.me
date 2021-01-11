---
title: 'Unity & Oculus Questでコントローラーを表示してみる'
publishedAt: '2021-01-10'
tags:
  - Unity
  - OculusQuest
---

# 前準備
まずはAssetsStoreから[Oculus Integration](https://assetstore.unity.com/packages/tools/integration/oculus-integration-82022)をimportしておきます。  
（今回使うのは `/VR`の中のみなのでほかはimportしなくても良いです）


# カメラを準備する

`Assets/Oculus/VR/OVROculusCameraRig`をHierarchyに追加します。  
ここでMainCameraは不要になるので削除してしまいましょう。

# コントローラーを追加する

前の手順で追加した `OVRCameraRig`内に以下の階層があるはずです。

- `OVRCameraRig/TrackingSpace/LeftHandAnchor`
- `OVRCameraRig/TrackingSpace/RIghtHandAnchor`

このそれぞれへ `Assets/Oculus/VR/OVRControllerPrefab`を１つずつ追加しましょう。

![](/static/unity_display_oculus_controller/add_to_hierarchy.png?w=300)

このPrefabは見た目がごちゃごちゃしていて本当にこれで良いのか心配になりますが、
動作する端末に対応じた見た目になるらしいので心配は無用です！

見た目はこんな感じ↓

![](/static/unity_display_oculus_controller/controller_prefab.png?w=300)

## スクリプトへの変数を修正する
追加したコントローラーのPrefabに設定されている`OVR Controller Helper`というスクリプトにある、
Controllerというパラメータを変更してあげる必要があります。

`LeftHandAnchor`の方は `L Touch`に、`RightHandAnchor`の方は`R Touch`にしましょう。

![](/static/unity_display_oculus_controller/set_script_param.png?w=300)

---

おしまい
