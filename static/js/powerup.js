class PowerUp {
    constructor(canvas, speed, type, x, y) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 30;
        this.height = 30;
        this.x = x || canvas.width;
        this.y = y || (Math.random() * (canvas.height - 200) + 100); // Fallback to random position if no y provided
        this.speed = speed;
        this.type = type;
        this.collected = false;
        this.colors = {
            shield: '#1E90FF',
            multiplier: '#FFD700',
            slowMotion: '#9932CC'
        };
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        if (this.collected) return;

        this.ctx.save();
        this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        // Draw power-up base
        this.ctx.fillStyle = this.colors[this.type];
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw power-up symbol
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = '20px Arial';

        switch(this.type) {
            case 'shield':
                this.ctx.fillText('S', 0, 0);
                break;
            case 'multiplier':
                this.ctx.fillText('2×', 0, 0);
                break;
            case 'slowMotion':
                this.ctx.fillText('⏱', 0, 0);
                break;
        }

        this.ctx.restore();
    }

    isOffscreen() {
        return this.x + this.width < 0;
    }

    checkCollision(bird) {
        if (this.collected) return false;

        return (
            bird.x < this.x + this.width &&
            bird.x + bird.width > this.x &&
            bird.y < this.y + this.height &&
            bird.y + bird.height > this.y
        );
    }
}