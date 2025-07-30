class Game {
    // ゲーム設定定数
    static CONFIG = {
        PLAYER_SPEED: 6,
        BULLET_SPEED: 7,
        BULLET_COOLDOWN: 8,
        INVADER_SHOOT_PROBABILITY: 0.002,
        INVADER_BULLET_SPEED: 2,
        INVADER_MOVE_SPEED: 1,
        INVADER_DROP_DISTANCE: 20,
        BOSS_HP: 7,
        BOSS_SPEED: 2,
        BOSS_SHOOT_INTERVAL: 60,
        BOSS_SPECIAL_INTERVAL: 180,
        BOSS_BULLET_SPEED: 4,
        BOSS_SPECIAL_SPEED: 5,
        CANVAS_WIDTH: 800,
        CANVAS_HEIGHT: 600,
        INVADER_ROWS: 5,
        INVADER_COLS: 10,
        INVADER_WIDTH: 30,
        INVADER_HEIGHT: 20,
        INVADER_SPACING: 40,
        INVADER_START_X: 100,
        INVADER_START_Y: 50,
        PLAYER_WIDTH: 30,
        PLAYER_HEIGHT: 20
    };
    
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('Canvas element with id "gameCanvas" not found');
        }
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Failed to get 2D context from canvas');
        }
        
        this.animationFrameId = null;
        this.score = 0;
        this.gameOver = false;
        
        this.player = {
            x: this.canvas.width / 2 - Game.CONFIG.PLAYER_WIDTH / 2,
            y: this.canvas.height - 50,
            width: Game.CONFIG.PLAYER_WIDTH,
            height: Game.CONFIG.PLAYER_HEIGHT,
            speed: Game.CONFIG.PLAYER_SPEED
        };
        
        this.bullets = [];
        this.invaders = [];
        this.invaderBullets = [];
        this.boss = null;
        this.bossBullets = [];
        this.wave = 1;
        this.shootTimer = 0;
        this.shootCooldown = Game.CONFIG.BULLET_COOLDOWN;
        
        this.keys = {};
        
        this.initInvaders();
        this.bindEvents();
        this.gameLoop();
    }
    
    initInvaders() {
        this.invaders = [];
        
        for (let row = 0; row < Game.CONFIG.INVADER_ROWS; row++) {
            for (let col = 0; col < Game.CONFIG.INVADER_COLS; col++) {
                this.invaders.push({
                    x: Game.CONFIG.INVADER_START_X + col * Game.CONFIG.INVADER_SPACING,
                    y: Game.CONFIG.INVADER_START_Y + row * Game.CONFIG.INVADER_SPACING,
                    width: Game.CONFIG.INVADER_WIDTH,
                    height: Game.CONFIG.INVADER_HEIGHT,
                    alive: true,
                    direction: 1
                });
            }
        }
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                e.preventDefault();
            }
            
            if (e.code === 'KeyR' && this.gameOver) {
                this.restart();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    shoot() {
        if (this.gameOver) return;
        
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: Game.CONFIG.BULLET_SPEED
        });
    }
    
    update() {
        if (this.gameOver) return;
        
        // プレイヤー移動
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        
        // 自動連射
        this.shootTimer++;
        if (this.keys['Space'] && this.shootTimer >= this.shootCooldown) {
            this.shoot();
            this.shootTimer = 0;
        }
        
        // 弾丸更新
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > 0;
        });
        
        // インベーダー弾丸更新
        this.invaderBullets = this.invaderBullets.filter(bullet => {
            bullet.y += bullet.speed;
            return bullet.y < this.canvas.height;
        });
        
        // ボス弾丸更新
        this.bossBullets = this.bossBullets.filter(bullet => {
            if (bullet.angle) {
                bullet.x += Math.sin(bullet.angle) * bullet.speed;
            }
            bullet.y += bullet.speed;
            return bullet.y < this.canvas.height && bullet.x > -20 && bullet.x < this.canvas.width + 20;
        });
        
        // インベーダー移動
        this.moveInvaders();
        
        // インベーダーの射撃
        if (Math.random() < Game.CONFIG.INVADER_SHOOT_PROBABILITY) {
            this.invaderShoot();
        }
        
        // ボス更新
        if (this.boss) {
            this.updateBoss();
        }
        
        // 衝突判定
        this.checkCollisions();
        
        // ゲームオーバー判定
        this.checkGameOver();
    }
    
    moveInvaders() {
        let moveDown = false;
        const speed = Game.CONFIG.INVADER_MOVE_SPEED;
        
        // 端に到達したかチェック
        for (let invader of this.invaders) {
            if (!invader.alive) continue;
            if (invader.x <= 0 || invader.x >= this.canvas.width - invader.width) {
                moveDown = true;
                break;
            }
        }
        
        // インベーダー移動
        for (let invader of this.invaders) {
            if (!invader.alive) continue;
            
            if (moveDown) {
                invader.y += Game.CONFIG.INVADER_DROP_DISTANCE;
                invader.direction = invader.direction === 1 ? -1 : 1;
            } else {
                invader.x += speed * invader.direction;
            }
        }
    }
    
    invaderShoot() {
        const aliveInvaders = this.invaders.filter(invader => invader.alive);
        if (aliveInvaders.length === 0) return;
        
        const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
        this.invaderBullets.push({
            x: shooter.x + shooter.width / 2 - 2,
            y: shooter.y + shooter.height,
            width: 4,
            height: 10,
            speed: Game.CONFIG.INVADER_BULLET_SPEED
        });
    }

    spawnBoss() {
        this.boss = {
            x: this.canvas.width / 2 - 60,
            y: 50,
            width: 120,
            height: 80,
            hp: Game.CONFIG.BOSS_HP,
            maxHp: Game.CONFIG.BOSS_HP,
            speed: Game.CONFIG.BOSS_SPEED,
            direction: 1,
            shootTimer: 0,
            specialAttackTimer: 0
        };
    }

    updateBoss() {
        if (!this.boss) return;
        
        // ボス移動
        this.boss.x += this.boss.speed * this.boss.direction;
        if (this.boss.x <= 0 || this.boss.x >= this.canvas.width - this.boss.width) {
            this.boss.direction *= -1;
        }
        
        // ボス射撃
        this.boss.shootTimer++;
        if (this.boss.shootTimer > Game.CONFIG.BOSS_SHOOT_INTERVAL) {
            this.bossShoot();
            this.boss.shootTimer = 0;
        }
        
        // 特殊攻撃
        this.boss.specialAttackTimer++;
        if (this.boss.specialAttackTimer > Game.CONFIG.BOSS_SPECIAL_INTERVAL) {
            this.bossSpecialAttack();
            this.boss.specialAttackTimer = 0;
        }
    }

    bossShoot() {
        if (!this.boss) return;
        
        // 3方向弾
        for (let i = -1; i <= 1; i++) {
            this.bossBullets.push({
                x: this.boss.x + this.boss.width / 2 - 3,
                y: this.boss.y + this.boss.height,
                width: 6,
                height: 12,
                speed: Game.CONFIG.BOSS_BULLET_SPEED,
                angle: i * 0.3
            });
        }
    }

    bossSpecialAttack() {
        if (!this.boss) return;
        
        // 5方向弾（扇状）
        for (let i = -2; i <= 2; i++) {
            this.bossBullets.push({
                x: this.boss.x + this.boss.width / 2 - 4,
                y: this.boss.y + this.boss.height,
                width: 8,
                height: 15,
                speed: Game.CONFIG.BOSS_SPECIAL_SPEED,
                angle: i * 0.5
            });
        }
    }
    
    checkCollisions() {
        // プレイヤー弾丸 vs インベーダー
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.invaders.length - 1; j >= 0; j--) {
                const invader = this.invaders[j];
                
                if (invader.alive && this.isColliding(bullet, invader)) {
                    invader.alive = false;
                    this.bullets.splice(i, 1);
                    this.score += 10;
                    const scoreElement = document.getElementById('score');
                    if (scoreElement) {
                        scoreElement.textContent = this.score;
                    }
                    break;
                }
            }
        }
        
        // プレイヤー弾丸 vs ボス
        if (this.boss) {
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                
                if (this.isColliding(bullet, this.boss)) {
                    this.boss.hp--;
                    this.bullets.splice(i, 1);
                    this.score += 50;
                    const scoreElement = document.getElementById('score');
                    if (scoreElement) {
                        scoreElement.textContent = this.score;
                    }
                    
                    if (this.boss.hp <= 0) {
                        this.boss = null;
                        this.score += 500;
                        if (scoreElement) {
                            scoreElement.textContent = this.score;
                        }
                    }
                    break;
                }
            }
        }
        
        // インベーダー弾丸 vs プレイヤー
        for (let i = this.invaderBullets.length - 1; i >= 0; i--) {
            const bullet = this.invaderBullets[i];
            
            if (this.isColliding(bullet, this.player)) {
                this.gameOver = true;
                this.invaderBullets.splice(i, 1);
                break;
            }
        }
        
        // ボス弾丸 vs プレイヤー
        for (let i = this.bossBullets.length - 1; i >= 0; i--) {
            const bullet = this.bossBullets[i];
            
            if (this.isColliding(bullet, this.player)) {
                this.gameOver = true;
                this.bossBullets.splice(i, 1);
                break;
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    drawPlayer() {
        const x = this.player.x;
        const y = this.player.y;
        const w = this.player.width;
        const h = this.player.height;
        
        // メイン船体（明るい緑）
        this.ctx.fillStyle = '#0f0';
        this.ctx.fillRect(x + w * 0.3, y + h * 0.4, w * 0.4, h * 0.6);
        
        // 船の先端（三角形）
        this.ctx.fillStyle = '#0d0';
        this.ctx.beginPath();
        this.ctx.moveTo(x + w * 0.5, y);
        this.ctx.lineTo(x + w * 0.2, y + h * 0.4);
        this.ctx.lineTo(x + w * 0.8, y + h * 0.4);
        this.ctx.closePath();
        this.ctx.fill();
        
        // ウィング
        this.ctx.fillStyle = '#0a0';
        this.ctx.fillRect(x, y + h * 0.6, w * 0.3, h * 0.2);
        this.ctx.fillRect(x + w * 0.7, y + h * 0.6, w * 0.3, h * 0.2);
        
        // エンジン
        this.ctx.fillStyle = '#ff0';
        this.ctx.fillRect(x + w * 0.2, y + h * 0.8, w * 0.2, h * 0.2);
        this.ctx.fillRect(x + w * 0.6, y + h * 0.8, w * 0.2, h * 0.2);
    }

    drawInvader(invader) {
        const x = invader.x;
        const y = invader.y;
        const w = invader.width;
        const h = invader.height;
        
        // メイン本体
        this.ctx.fillStyle = '#f00';
        this.ctx.fillRect(x + w * 0.2, y + h * 0.3, w * 0.6, h * 0.4);
        
        // 頭部
        this.ctx.fillStyle = '#ff4444';
        this.ctx.fillRect(x + w * 0.3, y, w * 0.4, h * 0.4);
        
        // 触手/脚
        this.ctx.fillStyle = '#cc0000';
        this.ctx.fillRect(x, y + h * 0.7, w * 0.2, h * 0.3);
        this.ctx.fillRect(x + w * 0.3, y + h * 0.7, w * 0.1, h * 0.3);
        this.ctx.fillRect(x + w * 0.6, y + h * 0.7, w * 0.1, h * 0.3);
        this.ctx.fillRect(x + w * 0.8, y + h * 0.7, w * 0.2, h * 0.3);
        
        // 目
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x + w * 0.35, y + h * 0.1, w * 0.1, h * 0.1);
        this.ctx.fillRect(x + w * 0.55, y + h * 0.1, w * 0.1, h * 0.1);
        
        // 瞳
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + w * 0.37, y + h * 0.12, w * 0.06, h * 0.06);
        this.ctx.fillRect(x + w * 0.57, y + h * 0.12, w * 0.06, h * 0.06);
    }

    drawBoss() {
        if (!this.boss) return;
        
        const x = this.boss.x;
        const y = this.boss.y;
        const w = this.boss.width;
        const h = this.boss.height;
        
        // メイン本体（大きな艦体）
        this.ctx.fillStyle = '#800080';
        this.ctx.fillRect(x + w * 0.1, y + h * 0.3, w * 0.8, h * 0.5);
        
        // 中央コア
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.fillRect(x + w * 0.4, y + h * 0.1, w * 0.2, h * 0.6);
        
        // 側面ウィング
        this.ctx.fillStyle = '#600060';
        this.ctx.fillRect(x, y + h * 0.4, w * 0.3, h * 0.3);
        this.ctx.fillRect(x + w * 0.7, y + h * 0.4, w * 0.3, h * 0.3);
        
        // エンジン部
        this.ctx.fillStyle = '#ff8000';
        this.ctx.fillRect(x + w * 0.05, y + h * 0.8, w * 0.1, h * 0.2);
        this.ctx.fillRect(x + w * 0.2, y + h * 0.8, w * 0.1, h * 0.2);
        this.ctx.fillRect(x + w * 0.7, y + h * 0.8, w * 0.1, h * 0.2);
        this.ctx.fillRect(x + w * 0.85, y + h * 0.8, w * 0.1, h * 0.2);
        
        // コックピット
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(x + w * 0.42, y + h * 0.05, w * 0.16, h * 0.15);
        
        // HPバー
        const hpBarWidth = w * 0.8;
        const hpBarHeight = 6;
        const hpPercentage = this.boss.hp / this.boss.maxHp;
        
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x + w * 0.1, y - 15, hpBarWidth, hpBarHeight);
        this.ctx.fillStyle = hpPercentage > 0.5 ? '#0f0' : hpPercentage > 0.25 ? '#ff0' : '#f00';
        this.ctx.fillRect(x + w * 0.1, y - 15, hpBarWidth * hpPercentage, hpBarHeight);
    }

    checkGameOver() {
        // 全インベーダー撃破
        if (this.invaders.every(invader => !invader.alive)) {
            this.wave++;
            this.initInvaders();
            
            // 3ウェーブごとにボス出現
            if (this.wave % 3 === 0 && !this.boss) {
                this.spawnBoss();
            }
        }
        
        // インベーダーがプレイヤーまで到達
        for (let invader of this.invaders) {
            if (invader.alive && invader.y + invader.height >= this.player.y) {
                this.gameOver = true;
                break;
            }
        }
        
        if (this.gameOver) {
            const gameOverElement = document.getElementById('gameOver');
            if (gameOverElement) {
                gameOverElement.style.display = 'block';
            }
        }
    }
    
    render() {
        // 画面クリア
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // プレイヤー描画（詳細な宇宙船）
        this.drawPlayer();
        
        // インベーダー描画
        for (let invader of this.invaders) {
            if (invader.alive) {
                this.drawInvader(invader);
            }
        }
        
        // ボス描画
        if (this.boss) {
            this.drawBoss();
        }
        
        // 弾丸描画
        this.ctx.fillStyle = '#0f0';
        for (let bullet of this.bullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // インベーダー弾丸描画
        this.ctx.fillStyle = '#f00';
        for (let bullet of this.invaderBullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // ボス弾丸描画
        this.ctx.fillStyle = '#f0f';
        for (let bullet of this.bossBullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    }
    
    restart() {
        this.score = 0;
        this.gameOver = false;
        this.player.x = this.canvas.width / 2 - Game.CONFIG.PLAYER_WIDTH / 2;
        this.bullets = [];
        this.invaderBullets = [];
        this.boss = null;
        this.bossBullets = [];
        this.wave = 1;
        this.shootTimer = 0;
        this.initInvaders();
        const scoreElement = document.getElementById('score');
        const gameOverElement = document.getElementById('gameOver');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        if (gameOverElement) {
            gameOverElement.style.display = 'none';
        }
    }
    
    gameLoop() {
        if (this.stopped) return;
        this.update();
        this.render();
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
    
    stop() {
        this.stopped = true;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}

// ゲーム開始
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        new Game();
    });
}

// Node.js環境でのエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}