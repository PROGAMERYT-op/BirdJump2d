class AudioManager {
    constructor() {
        this.synth = new Tone.Synth().toDestination();
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            await Tone.start();
            this.initialized = true;
        }
    }

    playJump() {
        this.synth.triggerAttackRelease('C5', '0.1');
    }

    playScore() {
        this.synth.triggerAttackRelease('E5', '0.1');
    }

    playGameOver() {
        this.synth.triggerAttackRelease('A3', '0.3');
    }
}
