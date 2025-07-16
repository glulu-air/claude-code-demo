class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameOver = false;
        
        this.player = {
            x: this.canvas.width / 2 - 15,
            y: this.canvas.height - 50,
            width: 30,
            height: 20,
            speed: 5
        };
        
        this.bullets = [];
        this.invaders = [];
        this.invaderBullets = [];
        
        this.keys = {};
        
        this.initInvaders();
        this.bindEvents();
        this.gameLoop();
    }
    
    initInvaders() {
        this.invaders = [];
        const rows = 5;
        const cols = 10;
        const invaderWidth = 30;
        const invaderHeight = 20;
        const spacing = 40;
        const startX = 100;
        const startY = 50;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.invaders.push({
                    x: startX + col * spacing,
                    y: startY + row * spacing,
                    width: invaderWidth,
                    height: invaderHeight,
                    alive: true
                });
            }
        }
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                e.preventDefault();
                this.shoot();
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
            speed: 7
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
        
        // インベーダー移動
        this.moveInvaders();
        
        // インベーダーの射撃
        if (Math.random() < 0.005) {
            this.invaderShoot();
        }
        
        // 衝突判定
        this.checkCollisions();
        
        // ゲームオーバー判定
        this.checkGameOver();
    }
    
    moveInvaders() {
        let moveDown = false;
        const speed = 1;
        
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
                invader.y += 20;
                invader.direction = invader.direction === 1 ? -1 : 1;
            } else {
                invader.x += speed * (invader.direction || 1);
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
            speed: 3
        });
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
                    document.getElementById('score').textContent = this.score;
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
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    checkGameOver() {
        // 全インベーダー撃破
        if (this.invaders.every(invader => !invader.alive)) {
            this.initInvaders();
        }
        
        // インベーダーがプレイヤーまで到達
        for (let invader of this.invaders) {
            if (invader.alive && invader.y + invader.height >= this.player.y) {
                this.gameOver = true;
                break;
            }
        }
        
        if (this.gameOver) {
            document.getElementById('gameOver').style.display = 'block';
        }
    }
    
    render() {
        // 画面クリア
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // プレイヤー描画
        this.ctx.fillStyle = '#0f0';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // インベーダー描画
        this.ctx.fillStyle = '#f00';
        for (let invader of this.invaders) {
            if (invader.alive) {
                this.ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
            }
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
    }
    
    restart() {
        this.score = 0;
        this.gameOver = false;
        this.player.x = this.canvas.width / 2 - 15;
        this.bullets = [];
        this.invaderBullets = [];
        this.initInvaders();
        document.getElementById('score').textContent = this.score;
        document.getElementById('gameOver').style.display = 'none';
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// ゲーム開始
window.addEventListener('load', () => {
    new Game();
});