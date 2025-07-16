const Game = require('../game.js');

describe('Game State Management Tests', () => {
    let game;
    
    beforeEach(() => {
        const mockCanvas = new HTMLCanvasElement();
        document.getElementById = jest.fn().mockReturnValue(mockCanvas);
        
        game = new Game();
        game.gameLoop = jest.fn();
    });

    test('ゲーム初期状態', () => {
        expect(game.gameOver).toBe(false);
        expect(game.score).toBe(0);
        expect(game.wave).toBe(1);
    });

    test('ゲームオーバー状態での更新停止', () => {
        game.gameOver = true;
        const initialPlayerX = game.player.x;
        
        game.keys['ArrowRight'] = true;
        game.update();
        
        // ゲームオーバー時は更新されない
        expect(game.player.x).toBe(initialPlayerX);
    });

    test('ゲームオーバー状態での射撃不可', () => {
        game.gameOver = true;
        const initialBulletsCount = game.bullets.length;
        
        game.shoot();
        
        expect(game.bullets.length).toBe(initialBulletsCount);
    });

    test('スコア加算システム', () => {
        const initialScore = game.score;
        
        // インベーダー撃破
        game.bullets.push({
            x: game.invaders[0].x + 10,
            y: game.invaders[0].y + 10,
            width: 4,
            height: 10,
            speed: 7
        });
        
        game.checkCollisions();
        expect(game.score).toBe(initialScore + 10);
    });

    test('ウェーブ進行システム', () => {
        const initialWave = game.wave;
        
        // 全インベーダーを撃破
        game.invaders.forEach(invader => invader.alive = false);
        game.checkGameOver();
        
        expect(game.wave).toBe(initialWave + 1);
    });

    test('リスタート機能', () => {
        // ゲーム状態を変更
        game.score = 1000;
        game.gameOver = true;
        game.wave = 5;
        game.player.x = 200;
        game.bullets.push({ x: 100, y: 100, width: 4, height: 10, speed: 7 });
        game.invaderBullets.push({ x: 150, y: 150, width: 4, height: 10, speed: 3 });
        game.spawnBoss();
        game.bossBullets.push({ x: 200, y: 200, width: 6, height: 12, speed: 4 });
        game.invaders[0].alive = false;
        
        game.restart();
        
        // 全て初期状態に戻る
        expect(game.score).toBe(0);
        expect(game.gameOver).toBe(false);
        expect(game.wave).toBe(1);
        expect(game.player.x).toBe(game.canvas.width / 2 - 15);
        expect(game.bullets).toHaveLength(0);
        expect(game.invaderBullets).toHaveLength(0);
        expect(game.boss).toBeNull();
        expect(game.bossBullets).toHaveLength(0);
        expect(game.invaders[0].alive).toBe(true);
    });

    test('連射タイマーの動作', () => {
        game.shootTimer = 0;
        
        // スペースキーを押さない状態での更新
        game.update();
        expect(game.shootTimer).toBe(1);
        
        // スペースキーを押した状態での更新（クールダウン未完了）
        game.keys['Space'] = true;
        game.shootTimer = 5; // クールダウン中
        const initialBulletsCount = game.bullets.length;
        
        game.update();
        expect(game.bullets.length).toBe(initialBulletsCount);
        expect(game.shootTimer).toBe(6);
    });

    test('ボス出現条件', () => {
        // ウェーブ3の手前
        game.wave = 2;
        game.invaders.forEach(invader => invader.alive = false);
        
        game.checkGameOver();
        
        expect(game.wave).toBe(3);
        expect(game.boss).not.toBeNull();
        
        // ボスがいる状態で次のウェーブ
        game.wave = 3;
        game.invaders.forEach(invader => invader.alive = false);
        game.boss = { hp: 5 }; // 既存ボス
        
        const existingBoss = game.boss;
        game.checkGameOver();
        
        // ボスが生きている場合は新しいボスは生成されない
        expect(game.boss).toBe(existingBoss);
    });

    test('DOM要素の更新', () => {
        const mockScoreElement = { textContent: '' };
        const mockGameOverElement = { style: { display: '' } };
        
        document.getElementById = jest.fn()
            .mockReturnValueOnce(mockScoreElement)
            .mockReturnValueOnce(mockGameOverElement);
        
        // スコア更新
        game.score = 500;
        game.bullets.push({
            x: game.invaders[0].x + 10,
            y: game.invaders[0].y + 10,
            width: 4,
            height: 10,
            speed: 7
        });
        
        game.checkCollisions();
        
        // ゲームオーバー表示
        game.gameOver = true;
        game.checkGameOver();
        
        expect(mockGameOverElement.style.display).toBe('block');
    });
});