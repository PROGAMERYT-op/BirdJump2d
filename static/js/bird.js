class Bird {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = canvas.width / 3;
        this.y = canvas.height / 2;
        this.width = 40;
        this.height = 30;
        this.velocity = 0;
        this.gravity = 0.35;
        this.jumpForce = -8;
        this.rotation = 0;
    }

    jump() {
        this.velocity = this.jumpForce;
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Rotation based on velocity
        this.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, this.velocity * 0.1));

        // Keep bird within canvas
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
        if (this.y + this.height > this.canvas.height) {
            this.y = this.canvas.height - this.height;
            this.velocity = 0;
        }
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        this.ctx.rotate(this.rotation);

        // Draw shield effect if active
        if (window.game && window.game.activeEffects && window.game.activeEffects.shield) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.width * 0.75, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#1E90FF';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }

        // Draw bird body
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw wing
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.ellipse(-5, 0, this.width / 4, this.height / 3, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw eye
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(10, -5, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(12, -5, 2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    checkCollision(pipe) {
        return (
            this.x < pipe.x + pipe.width &&
            this.x + this.width > pipe.x &&
            (this.y < pipe.gapStart || this.y + this.height > pipe.gapStart + pipe.gapHeight)
        );
    }
}