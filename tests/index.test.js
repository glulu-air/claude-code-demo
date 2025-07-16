// 全テストのエントリーポイント
const Game = require('../game.js');

describe('Integration Tests', () => {
    let game;
    
    beforeEach(() => {
        const mockCanvas = new HTMLCanvasElement();
        document.getElementById = jest.fn().mockReturnValue(mockCanvas);
        
        game = new Game();
        game.gameLoop = jest.fn();
    });

    test('完全なゲームフロー統合テスト', () => {
        // 初期状態確認
        expect(game.score).toBe(0);
        expect(game.gameOver).toBe(false);
        expect(game.wave).toBe(1);
        
        // プレイヤー移動
        game.keys['ArrowRight'] = true;
        game.update();
        expect(game.player.x).toBeGreaterThan(game.canvas.width / 2 - 15);
        
        // 射撃
        game.keys['Space'] = true;
        game.shootTimer = 10;
        game.update();
        expect(game.bullets.length).toBe(1);
        
        // インベーダー撃破
        game.bullets[0].x = game.invaders[0].x + 10;
        game.bullets[0].y = game.invaders[0].y + 10;
        game.checkCollisions();
        expect(game.score).toBe(10);
        expect(game.invaders[0].alive).toBe(false);
        
        // 全インベーダー撃破
        game.invaders.forEach(invader => invader.alive = false);
        game.checkGameOver();
        expect(game.wave).toBe(2);
        
        // 新しいインベーダーが生成される
        const aliveInvaders = game.invaders.filter(inv => inv.alive);
        expect(aliveInvaders.length).toBe(50);
    });

    test('ボス戦統合テスト', () => {
        // ウェーブ3でボス出現
        game.wave = 2;
        game.invaders.forEach(invader => invader.alive = false);
        game.checkGameOver();
        
        expect(game.wave).toBe(3);
        expect(game.boss).not.toBeNull();
        
        // ボス攻撃
        game.boss.shootTimer = 60;
        game.updateBoss();
        expect(game.bossBullets.length).toBe(3);
        
        // ボス撃破
        for (let i = 0; i < 10; i++) {
            game.bullets.push({
                x: game.boss.x + 50,
                y: game.boss.y + 40,
                width: 4,
                height: 10,
                speed: 7
            });
            game.checkCollisions();
        }
        
        expect(game.boss).toBeNull();
        expect(game.score).toBeGreaterThan(500); // ボス撃破ボーナス込み
    });

    test('ゲームオーバーからリスタートまでの統合テスト', () => {
        // ゲームオーバー状態にする
        game.gameOver = true;
        game.score = 1500;
        game.wave = 4;
        
        // リスタート
        game.restart();
        
        // 初期状態に戻ることを確認
        expect(game.gameOver).toBe(false);
        expect(game.score).toBe(0);
        expect(game.wave).toBe(1);
        
        // ゲームが正常に動作することを確認
        game.keys['ArrowLeft'] = true;
        game.update();
        expect(game.player.x).toBeLessThan(game.canvas.width / 2 - 15);
    });
});