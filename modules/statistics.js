// Statistics Module
const StatisticsModule = (function() {
    // Statistics tracking
    const stats = {
        manaByClick: 0,
        manaByBuildings: 0,
        currentMana: 0,
        manaTotal: 0,
        manaThisRun: 0,
        manaSpentOnPrestige: 0,
        totalBuildingsOwned: 0,
        upgradesPurchased: 0,
        achievementsEarned: 0,
        spellsCastThisRun: 0,
        spellsCastTotal: 0
    };

    function getHTML() {
        return `
        <section id="statistics-panel" class="game-panel" hidden>
            <h2 id="statistics-heading" tabindex="-1">Statistics</h2>
            <div id="statistics-container" aria-labelledby="statistics-heading">
                <ul class="statistics-list">
                    <li>Mana Gathered by Click: <span id="stat-mana-by-click">0</span></li>
                    <li>Mana Gathered by Buildings: <span id="stat-mana-by-buildings">0</span></li>
                    <li>Current Mana: <span id="stat-current-mana">0</span></li>
                    <li>Mana Gathered Total: <span id="stat-mana-total">0</span></li>
                    <li>Mana Gathered This Run: <span id="stat-mana-this-run">0</span></li>
                    <li>Mana Spent on Prestige: <span id="stat-mana-prestige">0</span></li>
                    <li>Total Buildings Owned: <span id="stat-buildings-owned">0</span></li>
                    <li>Upgrades Purchased: <span id="stat-upgrades-purchased">0</span></li>
                    <li>Achievements Earned: <span id="stat-achievements-earned">0</span></li>
                    <li>Spells Cast This Run: <span id="stat-spells-this-run">0</span></li>
                    <li>Spells Cast Total: <span id="stat-spells-total">0</span></li>
                </ul>
            </div>
        </section>`;
    }

    function updateDisplay() {
        document.getElementById('stat-mana-by-click').textContent = stats.manaByClick.toFixed(0);
        document.getElementById('stat-mana-by-buildings').textContent = stats.manaByBuildings.toFixed(0);
        document.getElementById('stat-current-mana').textContent = stats.currentMana.toFixed(0);
        document.getElementById('stat-mana-total').textContent = stats.manaTotal.toFixed(0);
        document.getElementById('stat-mana-this-run').textContent = stats.manaThisRun.toFixed(0);
        document.getElementById('stat-mana-prestige').textContent = stats.manaSpentOnPrestige.toFixed(0);
        document.getElementById('stat-buildings-owned').textContent = stats.totalBuildingsOwned;
        document.getElementById('stat-upgrades-purchased').textContent = stats.upgradesPurchased;
        document.getElementById('stat-achievements-earned').textContent = stats.achievementsEarned;
        document.getElementById('stat-spells-this-run').textContent = stats.spellsCastThisRun;
        document.getElementById('stat-spells-total').textContent = stats.spellsCastTotal;
    }

    function addManaByClick(amount) {
        stats.manaByClick += amount;
        stats.manaTotal += amount;
        stats.manaThisRun += amount;
    }

    function addManaByBuildings(amount) {
        stats.manaByBuildings += amount;
        stats.manaTotal += amount;
        stats.manaThisRun += amount;
    }

    function setCurrentMana(amount) {
        stats.currentMana = amount;
    }

    function addBuildingOwned() {
        stats.totalBuildingsOwned++;
    }

    function addUpgradePurchased() {
        stats.upgradesPurchased++;
    }

    function addAchievementEarned() {
        stats.achievementsEarned++;
    }

    function addSpellCast() {
        stats.spellsCastThisRun++;
        stats.spellsCastTotal++;
    }

    function getStats() {
        return stats;
    }

    function loadStats(savedStats) {
        if (savedStats) {
            stats.manaByClick = savedStats.manaByClick || 0;
            stats.manaByBuildings = savedStats.manaByBuildings || 0;
            stats.currentMana = savedStats.currentMana || 0;
            stats.manaTotal = savedStats.manaTotal || 0;
            stats.manaThisRun = savedStats.manaThisRun || 0;
            stats.manaSpentOnPrestige = savedStats.manaSpentOnPrestige || 0;
            stats.totalBuildingsOwned = savedStats.totalBuildingsOwned || 0;
            stats.upgradesPurchased = savedStats.upgradesPurchased || 0;
            stats.achievementsEarned = savedStats.achievementsEarned || 0;
            stats.spellsCastThisRun = savedStats.spellsCastThisRun || 0;
            stats.spellsCastTotal = savedStats.spellsCastTotal || 0;
        }
    }

    function reset() {
        stats.manaByClick = 0;
        stats.manaByBuildings = 0;
        stats.currentMana = 0;
        stats.manaTotal = 0;
        stats.manaThisRun = 0;
        stats.manaSpentOnPrestige = 0;
        stats.totalBuildingsOwned = 0;
        stats.upgradesPurchased = 0;
        stats.achievementsEarned = 0;
        stats.spellsCastThisRun = 0;
        stats.spellsCastTotal = 0;
    }

    // Reset for prestige - keeps total mana
    function resetForPrestige() {
        const keepTotalMana = stats.manaTotal;
        stats.manaByClick = 0;
        stats.manaByBuildings = 0;
        stats.currentMana = 0;
        stats.manaThisRun = 0;
        stats.totalBuildingsOwned = 0;
        stats.upgradesPurchased = 0;
        stats.spellsCastThisRun = 0;
        // Keep these:
        stats.manaTotal = keepTotalMana;
        // stats.achievementsEarned stays
        // stats.spellsCastTotal stays
        // stats.manaSpentOnPrestige stays
    }

    return {
        getHTML,
        updateDisplay,
        addManaByClick,
        addManaByBuildings,
        setCurrentMana,
        addBuildingOwned,
        addUpgradePurchased,
        addAchievementEarned,
        addSpellCast,
        getStats,
        loadStats,
        reset,
        resetForPrestige
    };
})();
