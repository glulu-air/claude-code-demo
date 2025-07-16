const Game = require('../game.js');

describe('Invader Tests', () => {
    let game;
    
    beforeEach(() => {
        const mockCanvas = new HTMLCanvasElement();
        document.getElementById = jest.fn().mockReturnValue(mockCanvas);
        
        game = new Game();
        game.gameLoop = jest.fn();
    });

    test('インベーダー移動パターン', () => {
        const firstInvader = game.invaders[0];
        const initialX = firstInvader.x;
        
        // 最初は右方向（directionが未設定または1）
        game.moveInvaders();
        expect(firstInvader.x).toBe(initialX + 1);
    });

    test('インベーダー端到達時の下降', () => {
        // インベーダーを右端に配置
        game.invaders.forEach(invader => {
            invader.x = game.canvas.width - invader.width;
            invader.direction = 1;
        });
        
        const initialY = game.invaders[0].y;
        game.moveInvaders();
        
        // 下に移動し、方向転換
        expect(game.invaders[0].y).toBe(initialY + 20);
        expect(game.invaders[0].direction).toBe(-1);
    });

    test('インベーダー射撃', () => {
        // ランダム要素を固定するためにMath.randomをモック
        const originalRandom = Math.random;
        Math.random = jest.fn().mockReturnValue(0.001); // 射撃確率以下
        
        const initialBulletsCount = game.invaderBullets.length;
        game.update();
        
        expect(game.invaderBullets.length).toBeGreaterThan(initialBulletsCount);
        
        Math.random = originalRandom; // 元に戻す
    });

    test('インベーダー弾丸の移動', () => {
        // インベーダー弾丸を手動で追加
        game.invaderBullets.push({
            x: 100,
            y: 100,
            width: 4,
            height: 10,
            speed: 3
        });
        
        const bullet = game.invaderBullets[0];
        const initialY = bullet.y;
        
        game.update();
        
        expect(bullet.y).toBe(initialY + bullet.speed);
    });

    test('インベーダー弾丸の画面外削除', () => {
        game.invaderBullets.push({
            x: 100,
            y: game.canvas.height + 10, // 画面外
            width: 4,
            height: 10,
            speed: 3
        });
        
        game.update();
        
        expect(game.invaderBullets).toHaveLength(0);
    });

    test('全インベーダー撃破時の新ウェーブ生成', () => {
        // 全インベーダーを撃破
        game.invaders.forEach(invader => invader.alive = false);
        
        const initialWave = game.wave;
        game.checkGameOver();
        
        expect(game.wave).toBe(initialWave + 1);
        
        // 新しいインベーダーが生成されることを確認
        const aliveInvaders = game.invaders.filter(inv => inv.alive);
        expect(aliveInvaders).toHaveLength(50);
    });

    test('インベーダーがプレイヤーラインに到達時のゲームオーバー', () => {
        // インベーダーをプレイヤーラインまで移動
        game.invaders[0].y = game.player.y;
        
        game.checkGameOver();
        
        expect(game.gameOver).toBe(true);
    });
});