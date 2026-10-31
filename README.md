# Conflict

**日本語** · [English](#english) · [简体中文](#简体中文) · [繁體中文](#繁體中文)

> **Conflict ― 層塔の戦線** — ポケットRTS / a pocket RTS / 掌上即时战略 / 掌上即時戰略

HTML1ファイルだけで動く、ブラウザのリアルタイムストラテジー。16ステージ・4言語・スマホ縦/横画面対応・ローカルセーブ。
`index.html` をダブルクリックするだけで遊べます(サーバー不要・オフライン可)。

---

## 日本語

### 概要

**Conflict ― 層塔の戦線** は、単一の `index.html` で完結するブラウザRTSです。
本城から作業員を掘り出し、金鉱を掘らせ、建物を建て、兵を集めて敵拠点を攻略します。
インストール不要、通信不要、セーブデータはブラウザの localStorage に保存されます。

### ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` | ゲーム本体(これ1ファイルで完結) |
| `test/smoke.js` | 全16ステージのヘッドレス自動対戦テスト |
| `test/cdp_probe.ps1` | ヘッドレスEdgeで実ブラウザ描画検証 |

### 遊び方

1. `index.html` をブラウザで開く(スマートフォンは**横画面**推奨、縦画面にも対応)
2. 「ゲーム開始」→ ステージを選んでクリック/タップ
3. 本城(★)を中心に、左下ヒントに従って開拓 → 編成 → 攻略

### ステージと目標(全16ステージ)

- ⚔ **全殲滅** — 敵本城をすべて破壊するか、敵の建物とユニットをすべて撃破
- 🛡 **防衛** — 制限時間まで持ちこたえる(敵本城をすべて破壊した場合は即クリア)
- ⏳ **本城破壊** — 制限時間以内に敵の本城を壊す
- **勝敗** — 自軍の本城がすべて破壊されると敗北。敵本城が複数ある場合は、すべて破壊するとクリア。

クリア時間に応じて ★×3 まで評価。後続ステージが順に解禁され、各ステージのベスト記録が保存されます。
難易度は **イージー / ノーマル / ハード**(タイトル画面・ポーズ画面で変更)。

### 経済と人口

- **ゴールド**が唯一の資源。本城が自動収入(最初の本城で1.0 gold/秒、追加の本城ごとに+0.4 gold/秒)を発生させ、作業員が**金鉱(有限)**を往復して運びます
- **人口上限**は建物で増加(本城+8、農場+6、兵舎・弓矢場+2、馬小屋+3)。兵も作業員も人口を消費します

### 兵種(兵舎 / 弓矢場 / 馬小屋 / 本城で生産)

| 兵種 | コスト | 生産時間 | HP | 攻撃 | 射程 | 特徴 |
|---|---|---|---|---|---|---|
| 労働者 | 50 | 6s | 45 | 3 | 14 | 採掘・建設・修理 |
| 民兵 | 70 | 7s | 64 | 9 | 16 | **弓兵に強い** |
| 槍兵 | 100 | 9s | 90 | 13 | 20 | **騎兵に強い** |
| 弓兵 | 110 | 9s | 55 | 8 | 110 | **建物に強い** |
| 斥候騎兵 | 130 | 10s | 85 | 8 | 18 | 高速(偵察・撹乱) |
| 重騎兵 | 200 | 14s | 140 | 16 | 18 | 歩兵・弓兵に強い(人口2) |
| 具足騎兵 | 340 | 20s | 240 | 22 | 18 | 装甲+3(人口3) |
| 英雄 | 500 | 30s | 420 | 30 | 20 | 装甲+4・1体限定・本城で生産 |

**相関図:槍兵 > 騎兵 > 歩兵 > 弓兵**(有利側へダメージ加算)
敵AIは自軍の編成に応じて、相性のよい兵種を優先して生産します。

### 建物(本城を選択 → パネルから配置)

| 建物 | コスト | HP | 人口 | 備考 |
|---|---|---|---|---|
| 本城 | — | 1650 | +8 | 労働者・英雄の生産、自衛攻撃 |
| 兵舎 | 220 | 800 | +2 | 民兵・槍兵 |
| 弓矢場 | 260 | 650 | +2 | 弓兵 |
| 馬小屋 | 320 | 800 | +3 | 斥候・重騎・具足 |
| 農場 | 80 | 420 | +6 | 人口の要 |
| 監視塔 | 180 | 620 | — | 射程200の防御施設 |

建設は空闲の労働者が自動で駆けつけ、完成後は修理も可能。

### 操作

**マウス & キーボード(PC)**
- 左クリックで選択 / 左ドラッグで囲み選択
- 右クリックで 移動・攻撃・採掘命令・建設手伝い・修理
- ホイールまたはトラックパッドピンチでズーム、ミニマップのクリック/ドラッグで視点移動、矢印キーでスクロール
- `Space` 一時停止、`1` `2` `3` 遊速(倍速対応)、`Esc` 取消→ポーズメニュー
- `F1` 全労働者を選択、`Q W E R` 生産建物のキュー1〜4番を生産
- `B` 農場 `V` 兵舎 `N` 弓矢場 `C` 馬小屋 `T` 監視塔(即配置モード)
- `H` 攻勢スタンス、`G` 防御スタンス、`S` 停止、`A` 攻撃移動(→目的地をクリック)

**タッチ(スマホ・タブレット)**
- 通常は1本指ドラッグで視点移動、ピンチでズーム
- HUDの「範囲」ボタンをオンにしてマップをドラッグすると、自軍ユニットを範囲選択
- タップで選択。選んだ後にタップ = 地面へ移動 / 敵へ攻撃 / 金鉱で採掘 / 建設中建物へ建設手伝い / 傷んだ建物へ修理
- 同じ兵種をダブルタップで同種一括選択
- 生産・建設は画面下のパネルから

### 言語・サウンド・データ

- **4言語**:日本語 / English / 简体中文 / 繁體中文(タイトル・ポーズ・ゲーム内🌐ボタンで随時切替、ブラウザ言語を自動検出)
- サウンドはすべてブラウザ内の合成音(ファイル同梱なし)。🔊ボタンでON/OFF
- セーブは localStorage キー `Conflict_save_v1`(解禁状況・星・ベスト記録・設定)。ポーズ画面の🗑で初期化できます

### 開発者向け:自動テスト

```bash
node test/smoke.js        # 全16ステージのAI対戦シミュ+UI/セーブ/4言語の整合チェック
```
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File test/cdp_probe.ps1   # ヘッドレスEdgeで実描画+スクリーンショット検証
```

### 動作環境

Chrome / Edge / Firefox / Safari の最新版(iOS Safari・Android Chrome含む)。ネットワーク接続なしで動作、外部送信なし。

---

## English

### Overview

**Conflict — Stratified Front** is a complete browser RTS that lives in a single `index.html`.
Start from a Stronghold, send workers to gold mines, build an economy, train counter-units, and break the enemy base.
No install, no network — progress is saved to browser localStorage.

### Files

| File | Role |
|---|---|
| `index.html` | The entire game (self-contained) |
| `test/smoke.js` | Headless auto-play test across all 16 levels |
| `test/cdp_probe.ps1` | Real-browser render verification with headless Edge |

### How to play

1. Open `index.html` in a browser (**landscape** recommended on phones; portrait is supported)
2. Press *Start* → pick a stage card
3. Follow the on-screen hints: expand economy → build an army → take the objective

### Levels & objectives (16 levels)

- ⚔ **Annihilate** — destroy every enemy Stronghold or eliminate all enemy buildings and units
- 🛡 **Defend** — hold out until the timer ends (destroying every enemy Stronghold wins immediately)
- ⏳ **Destroy** — wreck the enemy Stronghold before time runs out
- **Victory / defeat** — losing all player Strongholds means defeat. If there are multiple enemy Strongholds, destroy all of them to win.

Clears are rated up to ★★★ by time; stages unlock in order and best times are saved.
Difficulty: **Easy / Normal / Hard** (title or pause screen).

### Economy & population

- **Gold** is the only resource. The first Stronghold generates 1.0 gold/s, with +0.4 gold/s per additional Stronghold; workers haul gold from **finite mines**.
- **Population cap** comes from buildings (Stronghold +8, Farm +6, Barracks/Archery +2, Stable +3). Workers count toward population too.

### Units (trained at Barracks / Archery Range / Stable / Stronghold)

| Unit | Cost | Time | HP | DMG | Range | Notes |
|---|---|---|---|---|---|---|
| Worker | 50 | 6s | 45 | 3 | 14 | Gathers, builds, repairs |
| Militia | 70 | 7s | 64 | 9 | 16 | **Strong vs archers** |
| Spearmen | 100 | 9s | 90 | 13 | 20 | **Strong vs cavalry** |
| Archers | 110 | 9s | 55 | 8 | 110 | **Strong vs buildings** |
| Scout Cavalry | 130 | 10s | 85 | 8 | 18 | Very fast |
| Knights | 200 | 14s | 140 | 16 | 18 | Strong vs infantry/ranged (pop 2) |
| Cataphracts | 340 | 20s | 240 | 22 | 18 | Armor +3 (pop 3) |
| Hero | 500 | 30s | 420 | 30 | 20 | Armor +4, one only, built at Stronghold |

**Counter triangle: Spearmen > Cavalry > Infantry > Archers** (bonus damage to the countered side)
The enemy AI adapts its unit production to your army composition.

### Buildings (select your Stronghold, then place from the panel)

| Building | Cost | HP | Pop | Notes |
|---|---|---|---|---|
| Stronghold | — | 1650 | +8 | Trains Workers/Hero, defends itself |
| Barracks | 220 | 800 | +2 | Militia, Spearmen |
| Archery Range | 260 | 650 | +2 | Archers |
| Stable | 320 | 800 | +3 | Scouts, Knights, Cataphracts |
| Farm | 80 | 420 | +6 | Cheap population |
| Tower | 180 | 620 | — | Defensive, range 200 |

Idle workers automatically rush to construct new buildings; finished ones can be repaired.

### Controls

**Mouse & keyboard (PC)**
- Left click to select · left-drag for box select
- Right click: move / attack / mine / help build / repair
- Mouse wheel or trackpad pinch to zoom; click or drag the minimap; arrow keys to pan
- `Space` pause · `1` `2` `3` game speed · `Esc` cancel → pause menu
- `F1` select all workers · `Q W E R` train queue slots 1–4 of the selected building
- `B` Farm · `V` Barracks · `N` Archery · `C` Stable · `T` Tower (quick place)
- `H` aggressive stance · `G` defensive stance · `S` stop · `A` attack-move (then click a spot)

**Touch (phone / tablet)**
- One-finger drag to pan, pinch to zoom
- Turn on the HUD's **Box** button, then drag on the map to select your units
- Tap to select; then tap to move / attack / mine / help build / repair
- Double-tap a unit to select all of the same type
- Training & construction live in the bottom panel

### Language, sound & data

- **4 languages**: 日本語 / English / 简体中文 / 繁體中文 — switch anytime (title, pause, in-game 🌐); browser language auto-detected
- All SFX are synthesized in-browser (no audio files). Toggle with 🔊
- Save: localStorage key `Conflict_save_v1` (unlocks, stars, best times, settings). Reset with 🗑 on the pause screen

### For developers: automated tests

```bash
node test/smoke.js        # full 16-level AI simulation + UI/save/i18n consistency checks
```
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File test/cdp_probe.ps1   # real render check with headless Edge + screenshots
```

### Requirements

Latest Chrome / Edge / Firefox / Safari (incl. iOS Safari & Android Chrome). Works fully offline from `file://`; no data leaves your device.

---

## 简体中文

### 概述

**Conflict ― 层塔战线** 是一个只靠单个 `index.html` 运行的浏览器即时战略游戏。
从主城出发,派出工人开采金矿、建设经济、训练克制兵种、攻破敌方基地。
无需安装、无需联网,存档保存在浏览器 localStorage 中。

### 文件构成

| 文件 | 作用 |
|---|---|
| `index.html` | 游戏本体(单文件即完整游戏) |
| `test/smoke.js` | 全部16关的无头自动对战测试 |
| `test/cdp_probe.ps1` | 无头Edge真实浏览器渲染验证 |

### 开始游玩

1. 用浏览器打开 `index.html`(手机建议**横屏**,也支持竖屏)
2. 点击「开始游戏」→ 选择关卡卡片
3. 跟随屏幕提示:发展经济 → 组建军队 → 完成目标

### 关卡与目标(共16关)

- ⚔ **全歼灭** — 摧毁所有敌方主城,或击败敌方所有建筑与单位
- 🛡 **防守** — 坚持到倒计时结束(摧毁所有敌方主城会立即获胜)
- ⏳ **摧毁主城** — 在时限内击毁敌方主城
- **胜负** — 我方所有主城被摧毁时失败;敌方有多个主城时,需全部摧毁才能获胜。

按通关时间最高评 ★★★;关卡依次解锁,最佳成绩自动保存。
难度分为 **简单 / 普通 / 困难**(标题页或暂停页切换)。

### 经济与人口

- **金币**是唯一资源。首座主城每秒产生1.0 gold,之后每增加一座主城再加0.4 gold;工人往返于**有限金矿**采矿。
- **人口上限**来自建筑(主城+8、农场+6、兵营/弓场+2、马厩+3)。工人也占人口。

### 兵种(兵营 / 弓场 / 马厩 / 主城生产)

| 兵种 | 费用 | 时间 | HP | 攻击 | 射程 | 特点 |
|---|---|---|---|---|---|---|
| 工人 | 50 | 6s | 45 | 3 | 14 | 采矿、建造、修理 |
| 民兵 | 70 | 7s | 64 | 9 | 16 | **克制弓手** |
| 枪兵 | 100 | 9s | 90 | 13 | 20 | **克制骑兵** |
| 弓手 | 110 | 9s | 55 | 8 | 110 | **对建筑加成** |
| 斥候骑兵 | 130 | 10s | 85 | 8 | 18 | 高速机动 |
| 重骑兵 | 200 | 14s | 140 | 16 | 18 | 克制步兵/弓手(人口2) |
| 具装铁骑 | 340 | 20s | 240 | 22 | 18 | 护甲+3(人口3) |
| 英雄 | 500 | 30s | 420 | 30 | 20 | 护甲+4、仅限1体、主城生产 |

**克制关系:枪兵 > 骑兵 > 步兵 > 弓手**(克制方获得伤害加成)
敌方AI会根据你的军队构成,优先生产克制兵种。

### 建筑(选中主城 → 面板放置)

| 建筑 | 费用 | HP | 人口 | 说明 |
|---|---|---|---|---|
| 主城 | — | 1650 | +8 | 生产工人/英雄、自卫攻击 |
| 兵营 | 220 | 800 | +2 | 民兵、枪兵 |
| 弓场 | 260 | 650 | +2 | 弓手 |
| 马厩 | 320 | 800 | +3 | 斥候、重骑、具装 |
| 农场 | 80 | 420 | +6 | 经济的人口来源 |
| 箭塔 | 180 | 620 | — | 射程200的防御设施 |

空闲工人会自动前往建造;建成后可修理。

### 操作

**鼠标 + 键盘(PC)**
- 左键选择 / 左键拖拽框选
- 右键:移动、攻击、采矿、协助建造、修理
- 滚轮或触控板捏合缩放;点击/拖拽小地图;方向键平移
- `Space` 暂停、`1` `2` `3` 游戏速度、`Esc` 取消 → 暂停菜单
- `F1` 全选工人、`Q W E R` 生产所选建筑队列1~4格
- `B` 农场、`V` 兵营、`N` 弓场、`C` 马厩、`T` 箭塔(快速放置)
- `H` 进攻姿态、`G` 防守姿态、`S` 停止、`A` 攻击移动(再点击目标点)

**触屏(手机 / 平板)**
- 单指拖动平移,双指捏合缩放
- 点击HUD中的“框选”按钮后,拖动地图即可框选我方单位
- 点击选择;选中后点击 = 移动 / 攻击 / 采矿 / 协助建造 / 修理
- 双击同兵种可一键全选同种
- 生产与建造均在底部面板

### 语言、音效与数据

- **4种语言**:日本語 / English / 简体中文 / 繁體中文 — 随时切换(标题、暂停、游戏内🌐),自动检测浏览器语言
- 音效全部为浏览器内合成(不含音频文件),🔊按钮开关
- 存档为 localStorage 键 `Conflict_save_v1`(解锁、星级、最佳成绩、设置)。暂停页🗑可重置

### 开发者:自动化测试

```bash
node test/smoke.js        # 16关全AI对战模拟 + UI/存档/4语言一致性检查
```
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File test/cdp_probe.ps1   # 无头Edge真实渲染 + 截图验证
```

### 运行环境

Chrome / Edge / Firefox / Safari 最新版(含 iOS Safari 与 Android Chrome)。完全离线运行,无任何数据上传。

---

## 繁體中文

### 概述

**Conflict ― 層塔戰線** 是一個只靠單一 `index.html` 執行的瀏覽器即時戰略遊戲。
從主城出發,派出工人開採金礦、建設經濟、訓練克制兵種、攻破敵方基地。
無需安裝、無需連線,儲存檔案保存在瀏覽器 localStorage 中。

### 檔案構成

| 檔案 | 作用 |
|---|---|
| `index.html` | 遊戲本體(單一檔案即完整遊戲) |
| `test/smoke.js` | 全部16關的無頭自動對戰測試 |
| `test/cdp_probe.ps1` | 無頭Edge真實瀏覽器渲染驗證 |

### 開始遊玩

1. 用瀏覽器開啟 `index.html`(手機建議**橫屏**,也支援直向畫面)
2. 點擊「開始遊戲」→ 選擇關卡卡片
3. 跟隨螢幕提示:發展經濟 → 組建軍隊 → 完成目標

### 關卡與目標(共16關)

- ⚔ **全殲滅** — 摧毀所有敵方主城,或擊敗敵方所有建築與單位
- 🛡 **防守** — 堅持到倒數計時結束(摧毀所有敵方主城會立即獲勝)
- ⏳ **摧毀主城** — 在時限內擊毀敵方主城
- **勝負** — 我方所有主城被摧毀時失敗;敵方有多座主城時,需全部摧毀才能獲勝。

依通關時間最高評 ★★★;關卡依次解鎖,最佳成績自動儲存。
難度分為 **簡單 / 普通 / 困難**(標題頁或暫停頁切換)。

### 經濟與人口

- **金幣**是唯一資源。第一座主城每秒產生1.0 gold,之後每增加一座主城再加0.4 gold;工人往返於**有限金礦**開採。
- **人口上限**來自建築(主城+8、農場+6、兵營/弓場+2、馬廄+3)。工人也佔人口。

### 兵種(兵營 / 弓場 / 馬廄 / 主城生產)

| 兵種 | 費用 | 時間 | HP | 攻擊 | 射程 | 特點 |
|---|---|---|---|---|---|---|
| 工人 | 50 | 6s | 45 | 3 | 14 | 開採、建造、修理 |
| 民兵 | 70 | 7s | 64 | 9 | 16 | **剋制弓手** |
| 槍兵 | 100 | 9s | 90 | 13 | 20 | **克制騎兵** |
| 弓手 | 110 | 9s | 55 | 8 | 110 | **對建築加成** |
| 斥候騎兵 | 130 | 10s | 85 | 8 | 18 | 高速機動 |
| 重騎兵 | 200 | 14s | 140 | 16 | 18 | 克制步兵/弓手(人口2) |
| 具裝鐵騎 | 340 | 20s | 240 | 22 | 18 | 護甲+3(人口3) |
| 英雄 | 500 | 30s | 420 | 30 | 20 | 護甲+4、僅限1體、主城生產 |

**克制關係:槍兵 > 騎兵 > 步兵 > 弓手**(克制方獲得傷害加成)
敵方AI會依照你的軍隊組成,優先生產剋制兵種。

### 建築(選取主城 → 面板放置)

| 建築 | 費用 | HP | 人口 | 說明 |
|---|---|---|---|---|
| 主城 | — | 1650 | +8 | 生產工人/英雄、自衛攻擊 |
| 兵營 | 220 | 800 | +2 | 民兵、槍兵 |
| 弓場 | 260 | 650 | +2 | 弓手 |
| 馬廄 | 320 | 800 | +3 | 斥候、重騎、具裝 |
| 農場 | 80 | 420 | +6 | 經濟的人口來源 |
| 箭塔 | 180 | 620 | — | 射程200的防禦設施 |

空閒工人會自動前往建造;建成後可修理。

### 操作

**滑鼠 + 鍵盤(PC)**
- 左鍵選取 / 左鍵拖曳框選
- 右鍵:移動、攻擊、開採、協助建造、修理
- 滾輪或觸控板捏合縮放;點擊/拖曳小地圖;方向鍵平移
- `Space` 暫停、`1` `2` `3` 遊戲速度、`Esc` 取消 → 暫停選單
- `F1` 全選工人、`Q W E R` 生產所選建築隊列1~4格
- `B` 農場、`V` 兵營、`N` 弓場、`C` 馬廄、`T` 箭塔(快速放置)
- `H` 進攻姿態、`G` 防守姿態、`S` 停止、`A` 攻擊移動(再點擊目標點)

**觸控(手機 / 平板)**
- 單指拖曳平移,雙指捏合縮放
- 開啟HUD中的「框選」按鈕後,拖曳地圖即可框選我方單位
- 點擊選取;選取後點擊 = 移動 / 攻擊 / 開採 / 協助建造 / 修理
- 雙擊同兵種可一鍵全選同種
- 生產與建造均在底部面板

### 語言、音效與資料

- **4種語言**:日本語 / English / 简体中文 / 繁體中文 — 隨時切換(標題、暫停、遊戲內🌐),自動偵測瀏覽器語言
- 音效全部為瀏覽器內合成(不含音訊檔案),🔊按鈕開關
- 儲存檔案為 localStorage 鍵 `Conflict_save_v1`(解鎖、星級、最佳成績、設定)。暫停頁🗑可重置

### 開發者:自動化測試

```bash
node test/smoke.js        # 16關全AI對戰模擬 + UI/儲存/4語言一致性檢查
```
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File test/cdp_probe.ps1   # 無頭Edge真實渲染 + 截圖驗證
```

### 執行環境

Chrome / Edge / Firefox / Safari 最新版(含 iOS Safari 與 Android Chrome)。完全離線執行,無任何資料上傳。

---

*Conflict v1.0 — single-file pocket RTS, 16 stages, 4 languages.*
