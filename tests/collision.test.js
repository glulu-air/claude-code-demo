const Game = require('../game.js');

describe('Collision Detection Tests', () => {
    let game;
    
    beforeEach(() => {
        const mockCanvas = new HTMLCanvasElement();
        document.getElementById = jest.fn().mockReturnValue(mockCanvas);
        
        game = new Game();
        game.gameLoop = jest.fn();
    });

    test('衝突判定関数の基本動作', () => {
        const rect1 = { x: 10, y: 10, width: 20, height: 20 };
        const rect2 = { x: 20, y: 20, width: 20, height: 20 };
        const rect3 = { x: 50, y: 50, width: 20, height: 20 };
        
        // 重複している場合
        expect(game.isColliding(rect1, rect2)).toBe(true);
        
        // 重複していない場合
        expect(game.isColliding(rect1, rect3)).toBe(false);
    });

    test('プレイヤー弾丸とインベーダーの衝突', () => {
        // プレイヤー弾丸を作成
        game.bullets.push({
            x: game.invaders[0].x + 10,
            y: game.invaders[0].y + 10,
            width: 4,
            height: 10,
            speed: 7
        });
        
        const initialScore = game.score;
        const initialBulletsCount = game.bullets.length;
        
        game.checkCollisions();
        
        // インベーダーが撃破され、弾丸が削除され、スコアが増加
        expect(game.invaders[0].alive).toBe(false);
        expect(game.bullets.length).toBe(initialBulletsCount - 1);
        expect(game.score).toBe(initialScore + 10);
    });

    test('インベーダー弾丸とプレイヤーの衝突', () => {
        // インベーダー弾丸を作成（プレイヤーと重複する位置）
        game.invaderBullets.push({
            x: game.player.x + 10,
            y: game.player.y + 10,
            width: 4,
            height: 10,
            speed: 3
        });
        
        game.checkCollisions();
        
        expect(game.gameOver).toBe(true);
        expect(game.invaderBullets).toHaveLength(0);
    });

    test('ボス弾丸とプレイヤーの衝突', () => {
        // ボス弾丸を作成
        game.bossBullets.push({
            x: game.player.x + 10,
            y: game.player.y + 10,
            width: 6,
            height: 12,
            speed: 4,
            angle: 0
        });
        
        game.checkCollisions();
        
        expect(game.gameOver).toBe(true);
        expect(game.bossBullets).toHaveLength(0);
    });

    test('プレイヤー弾丸とボスの衝突', () => {
        game.spawnBoss();
        
        // プレイヤー弾丸を作成
        game.bullets.push({
            x: game.boss.x + 50,
            y: game.boss.y + 40,
            width: 4,
            height: 10,
            speed: 7
        });
        
        const initialHp = game.boss.hp;
        const initialScore = game.score;
        
        game.checkCollisions();
        
        expect(game.boss.hp).toBe(initialHp - 1);
        expect(game.score).toBe(initialScore + 50);
        expect(game.bullets).toHaveLength(0);
    });

    test('ボス撃破時の特別処理', () => {
        game.spawnBoss();
        game.boss.hp = 1; // 最後の1HP
        
        game.bullets.push({
            x: game.boss.x + 50,
            y: game.boss.y + 40,
            width: 4,
            height: 10,
            speed: 7
        });
        
        const initialScore = game.score;
        
        game.checkCollisions();
        
        expect(game.boss).toBeNull();
        expect(game.score).toBe(initialScore + 50 + 500); // ヒット + 撃破ボーナス
    });

    test('衝突判定の境界値テスト', () => {
        const rect1 = { x: 0, y: 0, width: 10, height: 10 };
        const rect2 = { x: 10, y: 10, width: 10, height: 10 }; // 角が接触
        const rect3 = { x: 11, y: 11, width: 10, height: 10 }; // 接触なし
        
        // 境界での接触は衝突として扱わない
        expect(game.isColliding(rect1, rect2)).toBe(false);
        expect(game.isColliding(rect1, rect3)).toBe(false);
    });

    test('完全に内包される場合の衝突判定', () => {
        const outerRect = { x: 0, y: 0, width: 100, height: 100 };
        const innerRect = { x: 25, y: 25, width: 50, height: 50 };
        
        expect(game.isColliding(outerRect, innerRect)).toBe(true);
        expect(game.isColliding(innerRect, outerRect)).toBe(true);
    });
});