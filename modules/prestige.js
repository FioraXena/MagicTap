// Prestige Module
const PrestigeModule = (function() {
    // Prestige state
    let currentPrestigeLevel = 0;  // Prestige level from previous ascensions
    let pendingPrestigeLevel = 0;  // Prestige level that would be gained on next ascension
    let timesPrestiged = 0;

    // Constants (Cookie Clicker formula)
    const PRESTIGE_BASE = 1e12;  // 1 trillion mana for first prestige level

    // Calculate prestige level from total mana using Cookie Clicker formula
    // Prestige Level = floor(cubeRoot(totalMana / 1e12))
    function calculatePrestigeLevel(totalMana) {
        if (totalMana < PRESTIGE_BASE) return 0;
        return Math.floor(Math.pow(totalMana / PRESTIGE_BASE, 1/3));
    }

    // Calculate mana needed to reach a specific prestige level
    // Mana needed = prestigeLevel^3 * 1e12
    function manaForPrestigeLevel(level) {
        return Math.pow(level, 3) * PRESTIGE_BASE;
    }

    // Calculate mana needed to reach the next prestige level from current
    function manaForNextLevel(currentLevel) {
        return manaForPrestigeLevel(currentLevel + 1);
    }

    // Get the prestige multiplier (each level = +1% MPS)
    // Returns multiplier like 1.0, 1.01, 1.05, 1.10, etc.
    function getPrestigeMultiplier() {
        return 1 + (currentPrestigeLevel / 100);
    }

    // Format large numbers for display
    function formatNumber(num) {
        if (num >= 1e15) return (num / 1e15).toFixed(2) + ' quadrillion';
        if (num >= 1e12) return (num / 1e12).toFixed(2) + ' trillion';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + ' billion';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + ' million';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + ' thousand';
        return num.toFixed(0);
    }

    function getHTML() {
        return `
        <section id="prestige-panel" class="game-panel" hidden>
            <h2 id="prestige-heading" tabindex="-1">Prestige</h2>
            <div id="prestige-container" aria-labelledby="prestige-heading">
                <p>Current Prestige Level: <span id="prestige-level">0</span></p>
                <p>Production Bonus: <span id="prestige-bonus">+0%</span></p>
                <p>Times Ascended: <span id="times-prestiged">0</span></p>
                <hr>
                <p id="prestige-pending-info">Ascending now would grant: <span id="pending-prestige-level">0</span> prestige levels</p>
                <p id="prestige-progress-info">Progress to next level: <span id="prestige-progress">0</span></p>
                <p id="prestige-next-info">Mana needed for next level: <span id="prestige-next-mana">1 trillion</span></p>
                <button id="prestige-action-button" class="prestige-button" disabled>Ascend</button>
            </div>
        </section>`;
    }

    function init() {
        // Set up the ascend button click handler
        const ascendButton = document.getElementById('prestige-action-button');
        if (ascendButton) {
            ascendButton.addEventListener('click', performAscension);
        }
    }

    function updateDisplay() {
        const stats = StatisticsModule.getStats();
        const totalMana = stats.manaTotal;

        // Calculate what prestige level player would have based on total mana
        const totalPrestigeFromMana = calculatePrestigeLevel(totalMana);
        pendingPrestigeLevel = totalPrestigeFromMana - currentPrestigeLevel;
        if (pendingPrestigeLevel < 0) pendingPrestigeLevel = 0;

        // Update display elements
        const levelEl = document.getElementById('prestige-level');
        const bonusEl = document.getElementById('prestige-bonus');
        const timesEl = document.getElementById('times-prestiged');
        const pendingEl = document.getElementById('pending-prestige-level');
        const progressEl = document.getElementById('prestige-progress');
        const nextManaEl = document.getElementById('prestige-next-mana');
        const ascendButton = document.getElementById('prestige-action-button');

        if (levelEl) {
            levelEl.textContent = currentPrestigeLevel;
        }
        if (bonusEl) {
            bonusEl.textContent = '+' + currentPrestigeLevel + '%';
        }
        if (timesEl) {
            timesEl.textContent = timesPrestiged;
        }
        if (pendingEl) {
            pendingEl.textContent = pendingPrestigeLevel;
        }

        // Calculate progress to next level
        const nextTotalLevel = totalPrestigeFromMana + 1;
        const manaForCurrent = manaForPrestigeLevel(totalPrestigeFromMana);
        const manaForNext = manaForPrestigeLevel(nextTotalLevel);
        const manaProgress = totalMana - manaForCurrent;
        const manaNeeded = manaForNext - manaForCurrent;
        const progressPercent = manaNeeded > 0 ? Math.min(100, (manaProgress / manaNeeded) * 100) : 0;

        if (progressEl) {
            progressEl.textContent = progressPercent.toFixed(1) + '%';
        }
        if (nextManaEl) {
            nextManaEl.textContent = formatNumber(manaForNext);
        }

        // Enable/disable ascend button based on whether there are pending levels
        if (ascendButton) {
            if (pendingPrestigeLevel > 0) {
                ascendButton.disabled = false;
                ascendButton.textContent = 'Ascend (+' + pendingPrestigeLevel + ' levels)';
            } else {
                ascendButton.disabled = true;
                ascendButton.textContent = 'Ascend (no levels to gain)';
            }
        }
    }

    function performAscension() {
        if (pendingPrestigeLevel <= 0) return;

        // Confirm ascension
        const confirmed = confirm(
            'Are you sure you want to ascend?\n\n' +
            'You will gain ' + pendingPrestigeLevel + ' prestige level(s).\n' +
            'Your new production bonus will be +' + (currentPrestigeLevel + pendingPrestigeLevel) + '%.\n\n' +
            'This will reset your mana, buildings, and upgrades!'
        );

        if (!confirmed) return;

        // Apply prestige
        currentPrestigeLevel += pendingPrestigeLevel;
        timesPrestiged++;
        pendingPrestigeLevel = 0;

        // Trigger game reset (keeping prestige data and total mana stat)
        if (typeof resetForPrestige === 'function') {
            resetForPrestige();
        }

        updateDisplay();
    }

    function getPrestigeLevel() {
        return currentPrestigeLevel;
    }

    function getTimesPrestiged() {
        return timesPrestiged;
    }

    function getPendingPrestigeLevel() {
        return pendingPrestigeLevel;
    }

    // For save/load
    function getPrestigeData() {
        return {
            currentPrestigeLevel,
            timesPrestiged
        };
    }

    function loadPrestigeData(data) {
        if (data) {
            currentPrestigeLevel = data.currentPrestigeLevel || 0;
            timesPrestiged = data.timesPrestiged || 0;
        }
    }

    function reset() {
        currentPrestigeLevel = 0;
        pendingPrestigeLevel = 0;
        timesPrestiged = 0;
    }

    return {
        getHTML,
        init,
        updateDisplay,
        getPrestigeLevel,
        getTimesPrestiged,
        getPendingPrestigeLevel,
        getPrestigeMultiplier,
        getPrestigeData,
        loadPrestigeData,
        calculatePrestigeLevel,
        manaForPrestigeLevel,
        reset
    };
})();
