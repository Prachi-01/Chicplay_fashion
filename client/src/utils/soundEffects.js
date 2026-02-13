// Sound Effects Utility for Gamification System
// Uses Web Audio API for better performance

class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.isMuted = this.loadMutePreference();
        this.sounds = {};
        this.initialized = false;
    }

    loadMutePreference() {
        try {
            return localStorage.getItem('soundMuted') === 'true';
        } catch {
            return false;
        }
    }

    saveMutePreference(muted) {
        try {
            localStorage.setItem('soundMuted', muted.toString());
        } catch {
            // localStorage not available
        }
    }

    async init() {
        if (this.initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    // Generate sounds using oscillators (no external files needed)
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (this.isMuted || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            // Fail silently
        }
    }

    // Points increase sound (cha-ching)
    playPointsSound() {
        if (this.isMuted) return;
        this.init().then(() => {
            // Quick ascending notes
            this.playTone(523.25, 0.1, 'sine', 0.2); // C5
            setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.2), 50); // E5
            setTimeout(() => this.playTone(783.99, 0.15, 'sine', 0.25), 100); // G5
        });
    }

    // Level up sound (fanfare)
    playLevelUpSound() {
        if (this.isMuted) return;
        this.init().then(() => {
            // Triumphant ascending melody
            const notes = [
                { freq: 523.25, time: 0 },     // C5
                { freq: 659.25, time: 100 },   // E5
                { freq: 783.99, time: 200 },   // G5
                { freq: 1046.50, time: 300 },  // C6
                { freq: 783.99, time: 450 },   // G5
                { freq: 1046.50, time: 550 },  // C6
            ];
            notes.forEach(note => {
                setTimeout(() => this.playTone(note.freq, 0.2, 'triangle', 0.3), note.time);
            });
        });
    }

    // Achievement unlocked sound (ding)
    playAchievementSound() {
        if (this.isMuted) return;
        this.init().then(() => {
            // Pleasant bell-like sound
            this.playTone(880, 0.3, 'sine', 0.3); // A5
            setTimeout(() => this.playTone(1108.73, 0.4, 'sine', 0.2), 150); // C#6
        });
    }

    // Button click sound (soft tap)
    playClickSound() {
        if (this.isMuted) return;
        this.init().then(() => {
            this.playTone(400, 0.05, 'sine', 0.1);
        });
    }

    // Streak increase sound
    playStreakSound() {
        if (this.isMuted) return;
        this.init().then(() => {
            // Warm ascending tone
            this.playTone(440, 0.1, 'triangle', 0.2);
            setTimeout(() => this.playTone(554.37, 0.15, 'triangle', 0.25), 80);
        });
    }

    // XP gain sound
    playXPSound() {
        if (this.isMuted) return;
        this.init().then(() => {
            this.playTone(600, 0.08, 'sine', 0.15);
        });
    }

    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.saveMutePreference(this.isMuted);
        return this.isMuted;
    }

    setMuted(muted) {
        this.isMuted = muted;
        this.saveMutePreference(muted);
    }

    getMuted() {
        return this.isMuted;
    }

    // Vibration feedback for mobile
    vibrate(pattern = [50]) {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch {
                // Fail silently
            }
        }
    }

    // Light vibration for button taps
    vibrateLight() {
        this.vibrate([30]);
    }

    // Medium vibration for achievements
    vibrateMedium() {
        this.vibrate([50, 30, 50]);
    }

    // Strong vibration for level ups
    vibrateStrong() {
        this.vibrate([100, 50, 100, 50, 100]);
    }
}

// Singleton instance
const soundEffects = new SoundEffects();

export default soundEffects;
export { SoundEffects };
