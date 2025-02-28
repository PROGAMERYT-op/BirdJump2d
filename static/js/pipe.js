class Pipe {
    constructor(canvas, speed) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 60;
        this.x = canvas.width;
        this.speed = speed;
        this.gapHeight = 200; // Increased from 150 to make gaps wider
        this.gapStart = Math.random() * (canvas.height - this.gapHeight - 100) + 50;
        this.passed = false;
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        this.ctx.fillStyle = '#2ECC71';
        
        // Top pipe
        this.ctx.fillRect(this.x, 0, this.width, this.gapStart);
        
        // Bottom pipe
        this.ctx.fillRect(
            this.x,
            this.gapStart + this.gapHeight,
            this.width,
            this.canvas.height - (this.gapStart + this.gapHeight)
        );
        
        // Pipe caps
        this.ctx.fillStyle = '#27AE60';
        this.ctx.fillRect(this.x - 5, this.gapStart - 20, this.width + 10, 20);
        this.ctx.fillRect(this.x - 5, this.gapStart + this.gapHeight, this.width + 10, 20);
    }

    isOffscreen() {
        return this.x + this.width < 0;
    }
}