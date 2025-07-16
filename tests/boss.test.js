const Game = require('../game.js');

describe('Boss Tests', () => {
    let game;
    
    beforeEach(() => {
        const mockCanvas = new HTMLCanvasElement();
        document.getElementById = jest.fn().mockReturnValue(mockCanvas);
        
        game = new Game();
        game.gameLoop = jest.fn();
    });

    test('ボス生成', () => {
        expect(game.boss).toBeNull();
        
        game.spawnBoss();
        
        expect(game.boss).not.toBeNull();
        expect(game.boss.hp).toBe(10);
        expect(game.boss.maxHp).toBe(10);
        expect(game.boss.width).toBe(120);
        expect(game.boss.height).toBe(80);
        expect(game.boss.speed).toBe(2);
        expect(game.boss.direction).toBe(1);
    });

    test('ボス移動パターン', () => {
        game.spawnBoss();
        const initialX = game.boss.x;
        
        game.updateBoss();
        
        expect(game.boss.x).toBe(initialX + game.boss.speed * game.boss.direction);
    });

    test('ボス端到達時の方向転換', () => {
        game.spawnBoss();
        game.boss.x = game.canvas.width - game.boss.width; // 右端
        game.boss.direction = 1;
        
        game.updateBoss();
        
        expect(game.boss.direction).toBe(-1);
    });

    test('ボス通常射撃（3方向弾）', () => {
        game.spawnBoss();
        game.boss.shootTimer = 60; // 射撃タイミング
        
        const initialBulletsCount = game.bossBullets.length;
        game.updateBoss();
        
        expect(game.bossBullets.length).toBe(initialBulletsCount + 3);
        expect(game.boss.shootTimer).toBe(0); // タイマーリセット
    });

    test('ボス特殊攻撃（5方向弾）', () => {
        game.spawnBoss();
        game.boss.specialAttackTimer = 180; // 特殊攻撃タイミング
        
        const initialBulletsCount = game.bossBullets.length;
        game.updateBoss();
        
        expect(game.bossBullets.length).toBe(initialBulletsCount + 5);
        expect(game.boss.specialAttackTimer).toBe(0); // タイマーリセット
    });

    test('ボス弾丸の角度移動', () => {
        game.bossBullets.push({
            x: 400,
            y: 100,
            width: 6,
            height: 12,
            speed: 4,
            angle: 0.3
        });
        
        const bullet = game.bossBullets[0];
        const initialX = bullet.x;
        const initialY = bullet.y;
        
        game.update();
        
        expect(bullet.x).toBe(initialX + Math.sin(0.3) * 4);
        expect(bullet.y).toBe(initialY + 4);
    });

    test('ボス弾丸の画面外削除', () => {
        game.bossBullets.push({
            x: -25, // 画面外
            y: 100,
            width: 6,
            height: 12,
            speed: 4,
            angle: -1
        });
        
        game.update();
        
        expect(game.bossBullets).toHaveLength(0);
    });

    test('3ウェーブごとのボス出現', () => {
        // 全インベーダーを撃破してウェーブ3に
        game.wave = 2;
        game.invaders.forEach(invader => invader.alive = false);
        
        game.checkGameOver();
        
        expect(game.wave).toBe(3);
        expect(game.boss).not.toBeNull();
    });

    test('ボス撃破時の処理', () => {
        game.spawnBoss();
        const initialScore = game.score;
        
        // ボスのHPを1に設定して弾丸でヒット
        game.boss.hp = 1;
        game.bullets.push({
            x: game.boss.x + 10,
            y: game.boss.y + 10,
            width: 4,
            height: 10,
            speed: 7
        });
        
        game.checkCollisions();
        
        expect(game.boss).toBeNull();
        expect(game.score).toBe(initialScore + 50 + 500); // ヒット50 + 撃破500
    });
});