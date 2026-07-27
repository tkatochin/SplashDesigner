# Splash Designer — Codex 引き継ぎ資料

更新日: 2026-07-27  
現在の段階: 入館UXと浴室の基本構図を復元済み  
次の作業: **Issue-0007（効果音と浴室環境音）**

## 1. プロジェクト概要

**Splash Designer** は、水風呂の写真や水面に触れて遊び、最終的に短い動画として共有できる、体験重視のCanvasアプリです。

- タイトル: **Splash Designer**
- サブタイトル: **水風呂で、ととのう。遊ぶ。シェアする。**
- 目標: 触った瞬間に「うわ、気持ちいい」と感じ、完成した水風呂体験をSNSへ投稿したくなる作品
- 基本技術: ブラウザのCanvas 2Dを中心とした静的Webアプリ
- 配布方針: ビルドを必須にせず、Netlify等へ静的ファイルを配置して起動できる構成

## 2. 最重要の設計思想

### 設備がUI

通常のボタンやコントロールパネルを並べず、画面内にある温浴施設の設備そのものを操作UIにします。

- 入場操作 → 暖簾を開く
- 水温切り替え → 水風呂に設置された温度計を触る
- バイブラ切り替え → 温度計横の赤外線センサーを触る
- 打たせ水 → 壁面のMADMAXボタンを押す

合言葉は、**「ボタンを置きたくなったら負け。」**です。ただし、MADMAXボタンのように現実の設備として存在するボタンは世界観に沿うため使用します。

### 体験を優先する

- 機能の多さより、布、水、音、間、手触りを重視する
- 派手な汎用UIを足さない
- 水風呂なので、安易に湯気を使わない
- 水面、飛沫、波紋、屈折、冷たさ、浴室の環境音などで水風呂らしさを表現する
- 最初は「一通り動くこと」を優先し、細かな演出強化はその後に行う

## 3. アーキテクチャ

### 正とする資料

- `ARCHITECTURE.md` を設計上の第一の根拠とする
- 実装と資料が矛盾した場合は、勝手に推測せず、資料と参照関係を調査して方針を提示する
- 過去の会話内容をAIが覚えている前提にしない

### 復元された実行経路

```text
index.html
  → main.js
    → Engine
      → SceneManager
        → EntranceScene
          ├── Camera
          ├── DragController / DragSpring
          ├── NorenRenderer
          └── PoolRenderer
```

現在の本来の構成は、後から追加されたPhaserデモ画面ではなく、**Canvas 2D + 独自Engine + SceneManager**です。

### 注意すべき混在コード

過去に、`Phaser.Scene` を継承した仮の `SplashScene` と `Phaser.Game` 用の `Game.js` が追加されました。これは `READY` / `START MADMAX` だけを表示するデモで、本来の水風呂画面ではありません。

- 本来の起動経路では使用しない
- 削除する場合は、最新ワークスペースで参照ゼロを確認してから行う
- Phaser系コードが残っていても、推測で一括削除しない

## 4. 完了したIssue

### Issue-0001 — ブラウザ起動基盤

目的: Netlify等でブラウザアプリとして読み込める入口を復元する。

実施内容:

- `index.html` を追加
- `main.js` を追加
- 当初は `Game.js` とPhaser起動を追加したが、本来の構成ではないことが後に判明
- CDN版Phaserとの不整合調査を経て、最終的に独自Canvasエンジン経路へ戻した

結果:

- ブラウザでJavaScriptを読み込み、画面表示へ進める土台を復元

### Issue-0002 — 本来のScene起動経路の復元

目的: 仮のPhaser `SplashScene` ではなく、本来の `EntranceScene` を起動する。

実施内容:

- `ARCHITECTURE.md`、`SceneManager.js`、`Scene.js`、`EntranceScene.js` を再解析
- 欠落していた `src/core/Engine.js` を設計に沿って復元
- Markdownが混入して壊れていた `src/core/Scene.js` をJavaScriptとして復元
- `main.js` を `Engine → SceneManager → EntranceScene` の経路へ変更
- `Game.js` は安全のため即時削除せず、起動経路から外した

結果:

- 独自Canvasエンジンの起動経路が復元された

### Issue-0003 — Camera復元

発生した症状:

```text
Camera.js:1 Failed to load resource: 404
```

解析で確認したCamera API:

- `constructor()`
- `moveToZoom(zoom, duration)`
- `update(dt)`
- `begin(ctx, width, height)`
- `end(ctx)`

設計上の役割:

- 単なる座標入れではなく、暖簾をくぐって中へ進むプレイヤー視点
- Renderer自身はCameraを知らず、CameraがCanvas Contextへ変換を適用する
- `begin()` / `end()` で描画変換を囲む

実施内容:

- `src/core/Camera.js` を必要最小限のAPIで復元
- ズーム補間とCanvasの `save` / `scale` / `restore` を実装

結果:

- Cameraの404を解消し、SceneManagerまで処理が進んだ

### Issue-0004 — Sceneライフサイクル復元

発生した症状:

```text
this.current._activate is not a function
```

実施内容:

- `Scene` に `constructor(engine)` を追加
- `this.engine` を保持
- `_activate()` から `enter()` を呼ぶようにした
- `_deactivate()` から `leave()` を呼ぶようにした
- `active` 状態を追加

結果:

- `SceneManager.change()` から `EntranceScene.enter()` へ進めるようになった

### Issue-0005 — EngineとEntranceSceneの接続修正

発生した症状:

```text
Cannot read properties of undefined (reading 'canvas')
```

原因:

- `EntranceScene` に `Engine` ではなく `SceneManager` を渡していた
- `Engine` にCanvas、Context、rendererが不足していた

実施内容:

- `main.js` の生成順を修正
- `Engine` を先に生成
- `new EntranceScene(engine)` に修正
- `Engine` にCanvas、2D Context、`renderer.canvas`、`renderer.ctx` を追加
- `requestAnimationFrame` ループを復元
- `sceneManager.update(dt)` と `sceneManager.render(ctx)` を接続

結果:

- 暖簾と水風呂が実際に表示された
- 暖簾の揺れとドラッグ操作が動作した

## 5. 現在の状態

起動基盤と主要クラスの接続は復元され、次の状態まで確認済みです。

- `EntranceScene` が起動する
- 暖簾が表示され、ゆらゆら動く
- 暖簾をドラッグして左右へ動かせる
- 水風呂が描画される
- `Camera`、`Scene`、`Engine`、`SceneManager` が実行経路上で動いている

現在の問題:

- 水風呂が最初から見えている
- 暖簾をドラッグしても完全に消えない
- 暖簾をくぐって中へ進む遷移が未完成
- 現在はタップではなくドラッグで開く挙動

これは基盤エラーではなく、**EntranceSceneの入館UXが未実装または不完全**な状態です。

## 6. 次の作業 — Issue-0006

### 目的

本来の入館体験を復元する。

### 期待する体験

```text
起動
  → 暖簾だけが見える
  → ユーザーが暖簾をドラッグする
  → 暖簾が左右に分かれて開く
  → 視点が中へ進む
  → 暖簾が拡大しながらフェードアウトする
  → 水風呂がフェードインする
  → 水風呂の操作体験へ移る
```

### Issue-0006aで判明したこと

- `EntranceScene.render()` が `PoolRenderer` と `NorenRenderer` を常時描画している
- 水風呂の表示アルファまたは遷移進捗がない
- `NorenRenderer` は左右へ開くが、フェードアウト処理がない
- Cameraは現在ズーム中心で、前進感との同期が不足している

### Issue-0006bで決めること

- 入館遷移の状態または進捗の持ち方
- ドラッグ量と暖簾の開き、Camera、各アルファ値をどう同期するか
- ドラッグ途中で離した場合の扱い
- 遷移完了後に同じSceneを継続するか、別Sceneへ切り替えるか

### 最小の完了条件

- 初期表示で水風呂が見えない
- 暖簾をドラッグして開けられる
- 開く動作に伴って前進感が生まれる
- 暖簾が消え、水風呂が現れる
- コンソールエラーがない

まずは最後まで動くことを優先し、効果音や隠し演出はIssue-0006の必須条件に含めません。

## 7. 将来機能・確認済みコンセプト

以下は前スレッドのコンセプト転載によって確認できた将来機能です。実装済みとは限りません。

### 写真とSplash操作

- ユーザーの写真を読み込む
- 指やマウスの軌跡に沿って水しぶき、波紋、水滴、キラキラを発生させる
- ドラッグ速度に応じて、かけ水 / Splash / ザバーン / MAD Splash相当へ効果を変える
- 勢いゲージ自体は画面に表示しない
- 水風呂の写真に入っているような作品を作り、SNSへ共有できるようにする

### 温度計

- 水風呂に設置された温度計をタップして、通常温度と「シングル」を切り替える
- シングルでは冷たい色や氷系の表現を検討
- 通常の設定ボタンではなく、温度計そのものがUI

細かな数値、表示方法、アニメーションは最新コードと今後の仕様確認が必要です。

### 赤外線センサーとバイブラ

- 温度計の横に、アトラクション風呂にあるような赤いランプの赤外線センサーを設置
- センサーをタップしてバイブラを切り替える
- 内側に見える赤いランプでスキャン操作を促す
- 通常ボタンやコントロールパネルは置かない

細かなセンサー反応や泡の段階制御は、現時点では確定情報として扱わず、コードと仕様から再確認すること。

### MADMAXボタンと打たせ水

- 水風呂のある壁面にMADMAXボタンを置く
- 湯らっくすのMADMAX系設備を着想源とする
- 押すとボタンが少し沈む
- 「カチッ」という音
- 約0.3秒の間
- 配管の振動音
- その後、上から一気に打たせ水が落ちる
- LED点灯は不要
- 水風呂の演出なので、湯気ではなく落水、飛沫、ミスト、水滴、波紋を中心にする

### 暖簾の音と隠しギミック

- 最初の暖簾操作をブラウザの音声アンロックに利用する
- 初回操作で `AudioContext.resume()`、音声準備、画像デコード等を自然に行う
- 暖簾を開けると布の「ファサッ」「シャッ」
- 浴室へ入ると遠くの桶の「カラン」、水音、環境音をフェードイン
- 暖簾を勢いよくドラッグした場合のみ、隠し演出として「いらっしゃいませー！」を再生する構想

### 動画出力

- 完成結果を2〜3秒程度の短い動画として出力する
- Splash → 波紋 → 静穏 → 初期状態が自然につながるループを目指す
- UIを隠した撮影・書き出し体験を将来的に検討する

### X共有

- 投稿文の案: `水風呂でととのいました。 #SplashDesigner {公開URL}`
- 動画をユーザー自身の投稿として添付する
- Web Intentだけでは画像・動画添付が難しい可能性があるため、X API連携案が挙がった
- X APIの認証、料金、権限、規約は変わり得るため、実装時に最新の公式情報を確認する
- Ver1.0の起動・基本体験より後のフェーズとする

## 8. 開発ワークフロー

各Issueは原則として3段階で進めます。

### `Issue-XXXXa` — 解析

- 最新ワークスペース全体を検索・確認
- エラーの直接原因と根本原因を区別
- 関係ファイルと参照関係を列挙
- この段階ではコードを変更しない

### `Issue-XXXXb` — 修正方針

- 変更対象ファイルを確定
- 各変更の理由、影響範囲、完了条件を示す
- 新規ファイルが必要な場合は、既存設計上の必要性を確認する
- ユーザーの承認を得る

### `Issue-XXXXc` — 実装と差分

- 承認された範囲だけ変更
- 最小限の差分にする
- 変更ファイル、理由、影響範囲、検証結果を報告
- 実行確認していない場合は「動作確認済み」と言わない

### 実装上の禁止事項

- 便利そうという理由だけで汎用クラスやAPIを増やさない
- 前スレッドを覚えているふりをしない
- 参照解析前に未使用ファイルを削除しない
- 仮画面やプレースホルダーを完成版として扱わない
- テスト前に「完成」「Final」と断言しない
- 仕様にない新提案で初版完成を遅らせない
- `EventSequence` を汎用ライブラリ化しない

## 9. 過去の過剰実装に関する注意

開発途中で `EventSequence` に統計、配列、オブジェクト操作など多数の汎用APIが追加されましたが、Splash Designerには不要でした。その後、必要最小限へ縮小するリファクタを実施しています。

また、次のようなほぼ同義のラッパークラスも一時的に追加されましたが、不要と判断され、ユーザー側ではPatch 0097以降を削除済みです。

- `SplashBootstrap`
- `SplashLauncher`
- `SplashApplication`
- `SplashDesigner`
- `SplashLifecycle`

最新ワークスペースを正として、これらを再導入しないでください。

## 10. 状態管理と引き継ぎ資料

長期開発では会話の記憶に依存せず、ワークスペース内の資料を更新します。

今後整備する資料:

- `PROJECT_STATE.md`
  - 現在のIssue
  - 完了Issue
  - 起動方法
  - 既知の問題
  - 次の作業
- `DESIGN_HISTORY.md`
  - なぜその設計にしたか
  - Cameraが「暖簾をくぐる視点」である理由
  - 「設備がUI」の背景
  - 採用・却下した案
- `ISSUE_HISTORY.md`
  - Issueごとの解析、変更ファイル、結果
- `AI_RULES.md`
  - architecture-first
  - 推測実装禁止
  - 最小差分
  - a/b/c運用

## 11. Codexへの作業開始指示

次回は、まずワークスペース内の次のファイルを全文確認してください。

1. `ARCHITECTURE.md`
2. `main.js`
3. `src/core/Engine.js`
4. `src/core/Scene.js`
5. `src/core/SceneManager.js`
6. `src/core/Camera.js`
7. `src/scenes/EntranceScene.js`
8. `src/renderers/NorenRenderer.js`
9. `src/renderers/PoolRenderer.js`
10. `src/input/DragController.js`
11. `src/input/DragSpring.js`

Issue-0007では加えて次を確認してください。

12. `src/audio/AudioManager.js`
13. `src/scenes/EntranceAudioBootstrap.js`
14. `src/scenes/SoundEffectManager.js`
15. `assets/sounds/` または音声素材の実在状況

その後、**Issue-0007a（解析）**として、現在の音声クラスの参照関係、ブラウザの音声アンロック経路、既存音声素材を調査してください。この段階ではコードを変更しません。

Issue-0006で、次の入館体験は完了しています。

```text
暖簾だけ表示
  → ドラッグで開く
  → 視点が前進
  → 暖簾が拡大・フェードアウト
  → 水風呂がフェードイン
```

後続のIssue-0007〜0016は`ARCHITECTURE.md`のIssue Roadmapを正とし、依存順に進めてください。

## 12. 現在のステータス

- Issue-0001: 起動基盤復元 — 実装済み
- Issue-0002: 独自Engine / EntranceScene起動経路復元 — 実装済み
- Issue-0003: Camera復元 — 実装済み
- Issue-0004: Sceneライフサイクル復元 — 実装済み
- Issue-0005: Engine rendererと生成順修正 — 実装済み
- Issue-0006a: 入館UXの問題解析 — 完了
- Issue-0006b: 修正方針の策定 — 完了
- Issue-0006c: 入館UX、レスポンシブ、浴室基本構図 — 実装済み
- Issue-0006: ブラウザ表示・操作・コンソールエラーなしをユーザー確認済み — 完了
- Issue-0007〜0016: `ARCHITECTURE.md`へ追加済み — 未着手
- Ver1.0: **未完成**
