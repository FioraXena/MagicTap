// Sound Module - Cross-platform audio for PC and mobile
const SoundModule = (function() {
    // Sound definitions
    const sounds = {
        achievement: { src: 'sounds/achievement.mp3', volume: 1.0 },
        buildingPurchase: { src: 'sounds/BuildingPurchase.mp3', volume: 0.8 },
        gather1: { src: 'sounds/gather1.mp3', volume: 0.6 },
        gather2: { src: 'sounds/gather2.mp3', volume: 0.6 },
        gather3: { src: 'sounds/gather3.mp3', volume: 0.6 },
        gather4: { src: 'sounds/gather4.mp3', volume: 0.6 },
        gather5: { src: 'sounds/gather5.mp3', volume: 0.6 },
        gather6: { src: 'sounds/gather6.mp3', volume: 0.6 },
        gatherLoop: { src: 'sounds/GatherLoop.mp3', volume: 0.5, loop: true },
        menuClick: { src: 'sounds/MenuClick.mp3', volume: 0.7 },
        menuOpen: { src: 'sounds/MenuOpen.mp3', volume: 0.7 },
        menuClose: { src: 'sounds/MenuClose.mp3', volume: 0.7 },
        enterPrestige: { src: 'sounds/PrestigeEnter.mp3', volume: 0.8 },
        exitPrestige: { src: 'sounds/PrestigeComplete.mp3', volume: 0.8 },
        prestigeUpgrade: { src: 'sounds/PrestigePurchase.mp3', volume: 0.8 },
        upgradePurchase: { src: 'sounds/UpgradePurchase.mp3', volume: 0.8 }
    };

    // Gather sounds array for random selection
    const gatherSounds = ['gather1', 'gather2', 'gather3', 'gather4', 'gather5', 'gather6'];

    // Audio context and buffers (Web Audio API)
    let audioContext = null;
    let audioBuffers = {};
    let isInitialized = false;
    let isUnlocked = false;
    let masterVolume = 0.5;
    let soundEnabled = true;

    // Currently playing sounds (for stopping loops)
    let activeSources = {};

    // Fallback HTML5 Audio elements
    let audioElements = {};

    // Gather loop state
    let gatherLoopPlaying = false;
    let isHoldingGather = false;
    let holdTimeout = null;

    // Initialize audio context (must be called after user interaction on mobile)
    function init() {
        // Try to create audio context
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioContext = new AudioContext();
            }
        } catch (e) {
            console.log('Web Audio API not supported, using HTML5 Audio fallback');
        }

        // Create HTML5 Audio fallbacks
        Object.keys(sounds).forEach(key => {
            const audio = new Audio();
            audio.src = sounds[key].src;
            audio.preload = 'auto';
            audio.volume = sounds[key].volume * masterVolume;
            if (sounds[key].loop) {
                audio.loop = true;
            }
            audioElements[key] = audio;
        });

        // Set up user interaction unlock for mobile
        setupMobileUnlock();

        isInitialized = true;
    }

    // Mobile browsers require user interaction before playing audio
    function setupMobileUnlock() {
        const unlockAudio = function() {
            if (isUnlocked) return;

            // Try to unlock Web Audio API
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    isUnlocked = true;
                    loadAllSounds();
                }).catch(e => {
                    console.log('Could not resume audio context:', e);
                });
            } else {
                isUnlocked = true;
                loadAllSounds();
            }

            // Try to unlock HTML5 Audio by playing silent sounds
            Object.values(audioElements).forEach(audio => {
                audio.play().then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }).catch(() => {});
            });
        };

        // Listen for various user interactions
        const events = ['click', 'touchstart', 'touchend', 'keydown'];
        events.forEach(event => {
            document.addEventListener(event, unlockAudio, { once: false, passive: true });
        });
    }

    // Load all sounds into Web Audio API buffers
    function loadAllSounds() {
        if (!audioContext) return;

        Object.keys(sounds).forEach(key => {
            loadSound(key, sounds[key].src);
        });
    }

    // Load a single sound into a buffer
    function loadSound(key, url) {
        if (!audioContext) return;

        fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                audioBuffers[key] = audioBuffer;
            })
            .catch(e => {
                console.log(`Could not load sound ${key}:`, e);
            });
    }

    // Play a sound by key
    function play(soundKey) {
        if (!soundEnabled || !isInitialized) return;

        const soundDef = sounds[soundKey];
        if (!soundDef) {
            console.warn('Unknown sound:', soundKey);
            return;
        }

        // Try to resume audio context if suspended (mobile browsers)
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().catch(() => {});
        }

        // Try Web Audio API first (better for mobile)
        if (audioContext && audioBuffers[soundKey] && audioContext.state === 'running') {
            playWithWebAudio(soundKey, soundDef);
        } else {
            // Fallback to HTML5 Audio
            playWithHTML5Audio(soundKey, soundDef);
        }
    }

    // Play using Web Audio API
    function playWithWebAudio(soundKey, soundDef) {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffers[soundKey];

        const gainNode = audioContext.createGain();
        gainNode.gain.value = soundDef.volume * masterVolume;

        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (soundDef.loop) {
            source.loop = true;
            activeSources[soundKey] = { source, gainNode };
        }

        source.start(0);
    }

    // Play using HTML5 Audio (fallback)
    function playWithHTML5Audio(soundKey, soundDef) {
        const audio = audioElements[soundKey];
        if (!audio) return;

        audio.volume = soundDef.volume * masterVolume;

        // For non-looping sounds, clone to allow overlapping
        if (!soundDef.loop) {
            const clone = audio.cloneNode();
            clone.volume = soundDef.volume * masterVolume;
            clone.play().catch(() => {});
        } else {
            audio.currentTime = 0;
            audio.play().catch(() => {});
            activeSources[soundKey] = { audio };
        }
    }

    // Stop a looping sound
    function stop(soundKey) {
        if (activeSources[soundKey]) {
            if (activeSources[soundKey].source) {
                // Web Audio API
                try {
                    activeSources[soundKey].source.stop();
                } catch (e) {}
            }
            if (activeSources[soundKey].audio) {
                // HTML5 Audio
                activeSources[soundKey].audio.pause();
                activeSources[soundKey].audio.currentTime = 0;
            }
            delete activeSources[soundKey];
        }
    }

    // Play a random gather sound
    function playGather() {
        if (!soundEnabled) return;
        const randomIndex = Math.floor(Math.random() * gatherSounds.length);
        play(gatherSounds[randomIndex]);
    }

    // Start gather loop (when holding the button)
    function startGatherLoop() {
        if (!soundEnabled || gatherLoopPlaying) return;
        gatherLoopPlaying = true;
        play('gatherLoop');
    }

    // Stop gather loop
    function stopGatherLoop() {
        if (!gatherLoopPlaying) return;
        gatherLoopPlaying = false;
        stop('gatherLoop');
    }

    // Handle gather button press (start)
    function onGatherStart() {
        if (!soundEnabled) return;

        // Clear any pending timeout
        if (holdTimeout) {
            clearTimeout(holdTimeout);
            holdTimeout = null;
        }

        isHoldingGather = true;

        // Play single gather sound immediately
        playGather();

        // After holding for 300ms, start the loop
        holdTimeout = setTimeout(() => {
            if (isHoldingGather && soundEnabled) {
                startGatherLoop();
            }
        }, 300);
    }

    // Handle gather button release (end)
    function onGatherEnd() {
        isHoldingGather = false;
        if (holdTimeout) {
            clearTimeout(holdTimeout);
            holdTimeout = null;
        }
        stopGatherLoop();
    }

    // Set master volume (0.0 to 1.0)
    function setMasterVolume(volume) {
        masterVolume = Math.max(0, Math.min(1, volume));

        // Update all HTML5 Audio elements
        Object.keys(audioElements).forEach(key => {
            audioElements[key].volume = sounds[key].volume * masterVolume;
        });

        // Update active Web Audio sources
        Object.keys(activeSources).forEach(key => {
            if (activeSources[key].gainNode) {
                activeSources[key].gainNode.gain.value = sounds[key].volume * masterVolume;
            }
        });
    }

    // Get master volume
    function getMasterVolume() {
        return masterVolume;
    }

    // Enable/disable sound
    function setEnabled(enabled) {
        soundEnabled = enabled;
        if (!enabled) {
            // Stop all active sounds
            Object.keys(activeSources).forEach(key => stop(key));
        }
    }

    // Check if sound is enabled
    function isEnabled() {
        return soundEnabled;
    }

    // Get save data
    function getSaveData() {
        return {
            masterVolume,
            soundEnabled
        };
    }

    // Load save data
    function loadSaveData(data) {
        if (data) {
            if (typeof data.masterVolume === 'number') {
                setMasterVolume(data.masterVolume);
            }
            if (typeof data.soundEnabled === 'boolean') {
                soundEnabled = data.soundEnabled;
            }
        }
    }

    return {
        init,
        play,
        stop,
        playGather,
        startGatherLoop,
        stopGatherLoop,
        onGatherStart,
        onGatherEnd,
        setMasterVolume,
        getMasterVolume,
        setEnabled,
        isEnabled,
        getSaveData,
        loadSaveData
    };
})();
