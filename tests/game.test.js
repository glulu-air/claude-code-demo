const Game = require('../game.js');

describe('Game Class Basic Tests', () => {
    let game;
    
    beforeEach(() => {
        // モックキャンバス要素を作成
        const mockCanvas = new HTMLCanvasElement();
        document.getElementById = jest.fn().mockReturnValue(mockCanvas);
        
        // ゲームインスタンスを作成（イベントバインドとゲームループを無効化）
        game = new Game();
        game.gameLoop = jest.fn(); // ゲームループを無効化
    });

    test('Game初期化時の初期状態', () => {
        expect(game.score).toBe(0);
        expect(game.gameOver).toBe(false);
        expect(game.wave).toBe(1);
        expect(game.bullets).toHaveLength(0);
        expect(game.invaderBullets).toHaveLength(0);
        expect(game.bossBullets).toHaveLength(0);
        expect(game.boss).toBeNull();
    });

    test('プレイヤー初期位置と設定', () => {
        expect(game.player.x).toBe(game.canvas.width / 2 - 15);
        expect(game.player.y).toBe(game.canvas.height - 50);
        expect(game.player.width).toBe(30);
        expect(game.player.height).toBe(20);
        expect(game.player.speed).toBe(5);
    });

    test('インベーダー初期化', () => {
        expect(game.invaders).toHaveLength(50); // 5行 × 10列
        
        // 全インベーダーが生きていることを確認
        const aliveInvaders = game.invaders.filter(inv => inv.alive);
        expect(aliveInvaders).toHaveLength(50);
        
        // インベーダーのプロパティ確認
        const firstInvader = game.invaders[0];
        expect(firstInvader).toHaveProperty('x');
        expect(firstInvader).toHaveProperty('y'); 
        expect(firstInvader).toHaveProperty('width', 30);
        expect(firstInvader).toHaveProperty('height', 20);
        expect(firstInvader).toHaveProperty('alive', true);
    });
});