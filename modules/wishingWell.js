// Wishing Well Module
const WishingWellModule = (function() {
    // Wishing Well state
    let coins = 0;
    let maxCoins = 15;
    let level = 1;
    let isUnlocked = false;

    // Coin generation rate (coins per second, starts very slow)
    function getCoinGenerationRate() {
        // Snowball effect: more coins = faster generation
        return coins / 150;
    }

    function getHTML() {
        return `
        <section id="wishing-well-panel" class="game-panel" hidden>
            <h2 id="wishing-well-heading" tabindex="-1">Wishing Well</h2>
            <div id="wishing-well-container" aria-labelledby="wishing-well-heading">
                <div class="wishing-well-status">
                    <p>Coins: <span id="wishing-well-coins">0</span> / <span id="wishing-well-max-coins">15</span></p>
                    <p>Well Level: <span id="wishing-well-level">1</span></p>
                </div>
                <div class="wishing-well-effects">
                    <h3>Effects</h3>
                    <p class="wishing-well-coming-soon">Wishing Well effects coming soon...</p>
                </div>
            </div>
        </section>`;
    }

    function updateDisplay() {
        const coinsEl = document.getElementById('wishing-well-coins');
        const maxCoinsEl = document.getElementById('wishing-well-max-coins');
        const levelEl = document.getElementById('wishing-well-level');

        if (coinsEl) coinsEl.textContent = Math.floor(coins);
        if (maxCoinsEl) maxCoinsEl.textContent = maxCoins;
        if (levelEl) levelEl.textContent = level;
    }

    function unlock() {
        isUnlocked = true;
    }

    function isWellUnlocked() {
        return isUnlocked;
    }

    function getCoins() {
        return coins;
    }

    function getMaxCoins() {
        return maxCoins;
    }

    function getLevel() {
        return level;
    }

    function loadState(savedState) {
        if (savedState) {
            coins = savedState.coins || 0;
            maxCoins = savedState.maxCoins || 15;
            level = savedState.level || 1;
            isUnlocked = savedState.isUnlocked || false;
        }
    }

    function getState() {
        return {
            coins: coins,
            maxCoins: maxCoins,
            level: level,
            isUnlocked: isUnlocked
        };
    }

    function reset() {
        coins = 0;
        maxCoins = 15;
        level = 1;
        isUnlocked = false;
    }

    return {
        getHTML,
        updateDisplay,
        unlock,
        isWellUnlocked,
        getCoins,
        getMaxCoins,
        getLevel,
        loadState,
        getState,
        reset
    };
})();
