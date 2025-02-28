class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audio = new AudioManager();
        this.background = new Background(this.canvas);

        // Set canvas size
        this.canvas.width = 400;
        this.canvas.height = 600;

        // Game state
        this.gameStarted = false;
        this.gameOver = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.lastThemeUpdate = 0;
        this.themeUpdateInterval = 30000; // 30 seconds

        // Game objects
        this.bird = new Bird(this.canvas);
        this.pipes = [];
        this.powerUps = [];
        this.pipeSpawnInterval = 2000;
        this.powerUpSpawnInterval = 15000;
        this.lastPipeSpawn = 0;
        this.lastPowerUpSpawn = 0;
        this.gameSpeed = 3;
        this.minScoreForPowerUps = 5;

        // Power-up states
        this.activeEffects = {
            shield: false,
            multiplier: false,
            slowMotion: false
        };
        this.effectTimers = {
            shield: null,
            multiplier: null,
            slowMotion: null
        };

        // Event listeners
        this.bindEvents();

        // Start game loop
        this.lastTime = 0;
        this.animate(0);

        // Update UI
        this.updateScoreDisplay();
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.handleInput();
            }
        });

        this.canvas.addEventListener('click', () => {
            this.handleInput();
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.restart();
        });
    }

    handleInput() {
        if (!this.gameStarted) {
            this.startGame();
        } else if (!this.gameOver) {
            this.bird.jump();
            this.audio.playJump();
        }
    }

    startGame() {
        this.gameStarted = true;
        this.audio.initialize();
        document.getElementById('startScreen').classList.add('hidden');
    }

    restart() {
        this.bird = new Bird(this.canvas);
        this.pipes = [];
        this.powerUps = [];
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = true;
        this.lastPipeSpawn = 0;
        this.lastPowerUpSpawn = 0;
        this.gameSpeed = 3;
        this.activeEffects = {
            shield: false,
            multiplier: false,
            slowMotion: false
        };
        this.effectTimers = {
            shield: null,
            multiplier: null,
            slowMotion: null
        };
        this.updateScoreDisplay();
        document.getElementById('gameOverScreen').classList.add('hidden');
    }

    updateScoreDisplay() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('highScoreValue').textContent = this.highScore;
        document.getElementById('finalScore').textContent = this.score;

        // Update localStorage whenever score changes
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
    }

    spawnPipe() {
        // Check if there's enough space for a new pipe
        const lastPipe = this.pipes[this.pipes.length - 1];
        if (lastPipe && lastPipe.x > this.canvas.width - 200) {
            return; // Don't spawn if the last pipe is too close
        }
        this.pipes.push(new Pipe(this.canvas, this.gameSpeed));
    }

    spawnPowerUp() {
        // Only spawn power-ups after reaching minimum score
        if (this.score < this.minScoreForPowerUps) return;

        // Find safe spot between pipes
        let safePipe = this.pipes.find(pipe =>
            pipe.x > this.canvas.width / 2 &&
            pipe.x < this.canvas.width * 0.75
        );

        if (safePipe) {
            const types = ['shield', 'multiplier', 'slowMotion'];
            const randomType = types[Math.floor(Math.random() * types.length)];

            // Position power-up in the middle of the pipe gap
            const powerUpY = safePipe.gapStart + (safePipe.gapHeight / 2);

            const powerUp = new PowerUp(
                this.canvas,
                this.gameSpeed,
                randomType,
                this.canvas.width,  // x position
                powerUpY            // y position
            );

            this.powerUps.push(powerUp);
        }
    }

    activatePowerUp(type) {
        this.activeEffects[type] = true;

        // Clear existing timer if any
        if (this.effectTimers[type]) {
            clearTimeout(this.effectTimers[type]);
        }

        // Set power-up duration and effects
        switch (type) {
            case 'shield':
                this.effectTimers[type] = setTimeout(() => {
                    this.activeEffects[type] = false;
                }, 5000); // 5 seconds of invincibility
                break;
            case 'multiplier':
                this.effectTimers[type] = setTimeout(() => {
                    this.activeEffects[type] = false;
                }, 8000); // 8 seconds of double points
                break;
            case 'slowMotion':
                // Store original speed and interval
                const originalSpeed = this.gameSpeed;
                const originalInterval = this.pipeSpawnInterval;

                // Slow down game speed and increase spawn interval
                this.gameSpeed *= 0.5;
                this.pipeSpawnInterval *= 2;

                // Update existing pipes and power-ups speed
                this.pipes.forEach(pipe => pipe.speed = this.gameSpeed);
                this.powerUps.forEach(powerUp => powerUp.speed = this.gameSpeed);

                this.effectTimers[type] = setTimeout(() => {
                    this.activeEffects[type] = false;
                    this.gameSpeed = originalSpeed;
                    this.pipeSpawnInterval = originalInterval;

                    // Reset speeds of existing objects
                    this.pipes.forEach(pipe => pipe.speed = this.gameSpeed);
                    this.powerUps.forEach(powerUp => powerUp.speed = this.gameSpeed);
                }, 6000); // 6 seconds of slow motion
                break;
        }
    }

    drawPowerUpEffects() {
        if (Object.values(this.activeEffects).some(effect => effect)) {
            this.ctx.save();
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'left';
            let yOffset = 60;

            for (const [effect, active] of Object.entries(this.activeEffects)) {
                if (active) {
                    let text = '';
                    switch (effect) {
                        case 'shield': text = '🛡️ Shield Active'; break;
                        case 'multiplier': text = '2️⃣ Double Points'; break;
                        case 'slowMotion': text = '⏱️ Slow Motion'; break;
                    }
                    this.ctx.fillText(text, 20, yOffset);
                    yOffset += 25;
                }
            }
            this.ctx.restore();
        }
    }

    updateAndDrawPipes() {
        this.pipes = this.pipes.filter(pipe => !pipe.isOffscreen());
        this.pipes.forEach(pipe => {
            pipe.update();
            pipe.draw();

            // Check for passing pipes
            if (!pipe.passed && this.bird.x > pipe.x + pipe.width) {
                pipe.passed = true;
                const points = this.activeEffects.multiplier ? 2 : 1;
                this.score += points;
                this.audio.playScore();
                this.updateScoreDisplay();
            }

            // Check collision
            if (this.bird.checkCollision(pipe) && !this.activeEffects.shield) {
                this.gameOver = true;
                this.audio.playGameOver();
                document.getElementById('gameOverScreen').classList.remove('hidden');
            }
        });
    }

    updateAndDrawPowerUps() {
        this.powerUps = this.powerUps.filter(powerUp => !powerUp.isOffscreen());
        this.powerUps.forEach(powerUp => {
            powerUp.update();
            powerUp.draw();

            // Check collision with power-ups
            if (!powerUp.collected && powerUp.checkCollision(this.bird)) {
                powerUp.collected = true;
                this.activatePowerUp(powerUp.type);
                this.audio.playScore(); // Reuse score sound for power-up collection
            }
        });
    }


    animate(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update background theme
        if (currentTime - this.lastThemeUpdate > this.themeUpdateInterval) {
            this.background.updateTheme();
            this.lastThemeUpdate = currentTime;
        }

        if (this.gameStarted && !this.gameOver) {
            // Clear canvas and draw background
            this.background.update();
            this.background.draw();

            // Spawn pipes with adjusted timing for slow motion
            const currentInterval = this.activeEffects.slowMotion ?
                this.pipeSpawnInterval * 2 : this.pipeSpawnInterval;

            if (currentTime - this.lastPipeSpawn > currentInterval) {
                this.spawnPipe();
                this.lastPipeSpawn = currentTime;
            }

            // Spawn power-ups
            if (currentTime - this.lastPowerUpSpawn > this.powerUpSpawnInterval) {
                this.spawnPowerUp();
                this.lastPowerUpSpawn = currentTime;
            }

            // Update and draw game objects
            this.updateAndDrawPipes();
            this.updateAndDrawPowerUps();
            this.bird.update();
            this.bird.draw();
            this.drawPowerUpEffects();

            // Check ground collision
            if (this.bird.y + this.bird.height >= this.canvas.height && !this.activeEffects.shield) {
                this.gameOver = true;
                this.audio.playGameOver();
                document.getElementById('gameOverScreen').classList.remove('hidden');
            }
        } else if (!this.gameStarted) {
            // Draw title screen with background
            this.background.update();
            this.background.draw();
            this.bird.draw();
        }

        requestAnimationFrame((time) => this.animate(time));
    }
}

// Start game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});