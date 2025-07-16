# スペースインベーダーゲーム

Dockerで動作するWebベースのスペースインベーダーゲームです。

## 起動方法

### Docker Composeを使用（推奨）

```bash
docker-compose up -d
```

ブラウザで http://localhost:8080 にアクセス

### Dockerを直接使用

```bash
# イメージをビルド
docker build -t space-invaders .

# コンテナを起動
docker run -d -p 8080:80 --name space-invaders-game space-invaders
```

## 操作方法

- **矢印キー（←→）**: プレイヤーの移動
- **スペースキー**: 弾を発射
- **Rキー**: ゲームオーバー時にリスタート

## ゲームの特徴

- クラシックなスペースインベーダーゲーム
- レスポンシブデザイン
- スコアシステム
- インベーダーからの反撃
- ゲームオーバー・リスタート機能

## 停止方法

```bash
# Docker Composeの場合
docker-compose down

# Dockerを直接使用した場合
docker stop space-invaders-game
docker rm space-invaders-game
```