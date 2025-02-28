class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.currentTheme = 'day';
        this.transitionProgress = 0;
        this.transitionSpeed = 0.005;
        this.isTransitioning = false;
        this.targetTheme = null;
        
        // Cloud parameters
        this.clouds = [];
        this.initClouds();
        
        // Theme colors
        this.themes = {
            day: {
                sky: ['#87CEEB', '#E0F6FF'],
                clouds: '#FFFFFF',
                mountains: '#2E8B57'
            },
            sunset: {
                sky: ['#FF7F50', '#FFB6C1'],
                clouds: '#FFE4E1',
                mountains: '#4A4A4A'
            },
            night: {
                sky: ['#191970', '#000033'],
                clouds: '#483D8B',
                mountains: '#1A1A1A'
            }
        };
    }

    initClouds() {
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height / 2),
                width: Math.random() * 100 + 50,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * 0.5 + 0.5
            });
        }
    }

    transitionTo(theme) {
        if (this.currentTheme !== theme && !this.isTransitioning) {
            this.isTransitioning = true;
            this.targetTheme = theme;
            this.transitionProgress = 0;
        }
    }

    updateTheme() {
        // Change theme every 30 seconds
        const themes = ['day', 'sunset', 'night'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.transitionTo(themes[nextIndex]);
    }

    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    lerpColor(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        return `rgb(${
            Math.round(this.lerp(c1.r, c2.r, t))
        }, ${
            Math.round(this.lerp(c1.g, c2.g, t))
        }, ${
            Math.round(this.lerp(c1.b, c2.b, t))
        })`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    drawCloud(x, y, width, color, opacity) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = opacity;
        
        // Draw cloud shape
        this.ctx.beginPath();
        this.ctx.arc(x, y, width * 0.3, 0, Math.PI * 2);
        this.ctx.arc(x + width * 0.2, y - width * 0.1, width * 0.25, 0, Math.PI * 2);
        this.ctx.arc(x + width * 0.4, y, width * 0.3, 0, Math.PI * 2);
        this.ctx.arc(x + width * 0.2, y + width * 0.1, width * 0.25, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    update() {
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.canvas.width + cloud.width;
                cloud.y = Math.random() * (this.canvas.height / 2);
            }
        });

        // Handle theme transition
        if (this.isTransitioning) {
            this.transitionProgress += this.transitionSpeed;
            if (this.transitionProgress >= 1) {
                this.currentTheme = this.targetTheme;
                this.isTransitioning = false;
                this.transitionProgress = 0;
            }
        }
    }

    draw() {
        const currentTheme = this.themes[this.currentTheme];
        const targetTheme = this.isTransitioning ? this.themes[this.targetTheme] : currentTheme;
        
        // Draw gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        
        if (this.isTransitioning) {
            const color1 = this.lerpColor(currentTheme.sky[0], targetTheme.sky[0], this.transitionProgress);
            const color2 = this.lerpColor(currentTheme.sky[1], targetTheme.sky[1], this.transitionProgress);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
        } else {
            gradient.addColorStop(0, currentTheme.sky[0]);
            gradient.addColorStop(1, currentTheme.sky[1]);
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw clouds
        const cloudColor = this.isTransitioning
            ? this.lerpColor(currentTheme.clouds, targetTheme.clouds, this.transitionProgress)
            : currentTheme.clouds;
            
        this.clouds.forEach(cloud => {
            this.drawCloud(cloud.x, cloud.y, cloud.width, cloudColor, cloud.opacity);
        });
    }
}
