const Game = require('../game.js');

describe('Player Movement and Shooting Tests', () => {
    let game;
    
    beforeEach(() => {
        const mockCanvas = new HTMLCanvasElement();
        document.getElementById = jest.fn().mockReturnValue(mockCanvas);
        
        game = new Game();
        game.gameLoop = jest.fn();
    });

    test('プレイヤー左移動', () => {
        const initialX = game.player.x;
        game.keys['ArrowLeft'] = true;
        game.keys['ArrowRight'] = false;
        
        game.update();
        
        expect(game.player.x).toBe(initialX - game.player.speed);
    });

    test('プレイヤー右移動', () => {
        const initialX = game.player.x;
        game.keys['ArrowLeft'] = false;
        game.keys['ArrowRight'] = true;
        
        game.update();
        
        expect(game.player.x).toBe(initialX + game.player.speed);
    });

    test('プレイヤー左端制限', () => {
        game.player.x = 0;
        game.keys['ArrowLeft'] = true;
        
        game.update();
        
        expect(game.player.x).toBe(0);
    });

    test('プレイヤー右端制限', () => {
        game.player.x = game.canvas.width - game.player.width;
        game.keys['ArrowRight'] = true;
        
        game.update();
        
        expect(game.player.x).toBe(game.canvas.width - game.player.width);
    });

    test('弾丸射撃', () => {
        expect(game.bullets).toHaveLength(0);
        
        game.shoot();
        
        expect(game.bullets).toHaveLength(1);
        const bullet = game.bullets[0];
        expect(bullet.x).toBe(game.player.x + game.player.width / 2 - 2);
        expect(bullet.y).toBe(game.player.y);
        expect(bullet.width).toBe(4);
        expect(bullet.height).toBe(10);
        expect(bullet.speed).toBe(7);
    });

    test('自動連射機能', () => {
        game.keys['Space'] = true;
        game.shootTimer = game.shootCooldown; // クールダウン完了状態
        
        game.update();
        
        expect(game.bullets).toHaveLength(1);
        expect(game.shootTimer).toBe(0); // タイマーリセット確認
    });

    test('連射クールダウン中は射撃不可', () => {
        game.keys['Space'] = true;
        game.shootTimer = 5; // クールダウン中
        
        game.update();
        
        expect(game.bullets).toHaveLength(0);
    });

    test('弾丸移動と画面外削除', () => {
        game.shoot();
        const bullet = game.bullets[0];
        const initialY = bullet.y;
        
        game.update();
        
        expect(bullet.y).toBe(initialY - bullet.speed);
        
        // 弾丸を画面外に移動
        bullet.y = -10;
        game.update();
        
        expect(game.bullets).toHaveLength(0);
    });
});