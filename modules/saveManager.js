// Save Manager Module
const SaveManager = (function() {
    const SAVE_KEY = 'magictap_save';
    const SAVE_VERSION = 1;
    let autoSaveInterval = null;

    function getSaveData() {
        return {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            game: {
                mana: mana,
                manaPerClick: manaPerClick,
                manaPerSecond: manaPerSecond,
                baseManaPerClick: baseManaPerClick,
                manaPerClickFromUpgrades: manaPerClickFromUpgrades,
                mpsFromUpgrades: mpsFromUpgrades,
                mpsUpgradeMultiplier: mpsUpgradeMultiplier
            },
            buildings: buildings.map(b => ({
                id: b.id,
                owned: b.owned,
                isUnlocked: b.isUnlocked
            })),
            upgrades: upgrades.map(u => ({
                id: u.id,
                isPurchased: u.isPurchased,
                isUnlocked: u.isUnlocked
            })),
            statistics: StatisticsModule.getStats(),
            achievements: AchievementsModule.getAchievements().map(a => ({
                id: a.id,
                isEarned: a.isEarned
            })),
            prestige: PrestigeModule.getPrestigeData(),
            options: OptionsModule.getOptions(),
            wishingWell: WishingWellModule.getState()
        };
    }

    function applySaveData(data) {
        if (!data) return false;

        try {
            // Restore game state
            if (data.game) {
                mana = data.game.mana || 0;
                manaPerClick = data.game.manaPerClick || 1;
                manaPerSecond = data.game.manaPerSecond || 0;
                baseManaPerClick = data.game.baseManaPerClick || 1;
                manaPerClickFromUpgrades = data.game.manaPerClickFromUpgrades || 0;
                mpsFromUpgrades = data.game.mpsFromUpgrades || 0;
                mpsUpgradeMultiplier = data.game.mpsUpgradeMultiplier || 1;
            }

            // Restore buildings
            if (data.buildings) {
                data.buildings.forEach(savedBuilding => {
                    const building = buildings.find(b => b.id === savedBuilding.id);
                    if (building) {
                        building.owned = savedBuilding.owned || 0;
                        building.isUnlocked = savedBuilding.isUnlocked || false;
                    }
                });
            }

            // Restore upgrades
            if (data.upgrades) {
                data.upgrades.forEach(savedUpgrade => {
                    const upgrade = upgrades.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.isPurchased = savedUpgrade.isPurchased || false;
                        upgrade.isUnlocked = savedUpgrade.isUnlocked || false;
                    }
                });
            }

            // Restore statistics
            if (data.statistics) {
                StatisticsModule.loadStats(data.statistics);
            }

            // Restore achievements
            if (data.achievements) {
                AchievementsModule.loadAchievements(data.achievements);
            }

            // Restore prestige
            if (data.prestige) {
                PrestigeModule.loadPrestigeData(data.prestige);
            }

            // Restore options
            if (data.options) {
                OptionsModule.loadOptions(data.options);
            }

            // Restore Wishing Well
            if (data.wishingWell) {
                WishingWellModule.loadState(data.wishingWell);
            }

            return true;
        } catch (e) {
            console.error('Error applying save data:', e);
            return false;
        }
    }

    function save() {
        try {
            const saveData = getSaveData();
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            console.log('Game saved successfully');
            return true;
        } catch (e) {
            console.error('Error saving game:', e);
            return false;
        }
    }

    function load() {
        try {
            const saveString = localStorage.getItem(SAVE_KEY);
            if (!saveString) {
                console.log('No save data found');
                return false;
            }

            const saveData = JSON.parse(saveString);
            if (applySaveData(saveData)) {
                // Recalculate MPS with loaded multiplier and building data
                recalculateMPS();
                // Re-render everything after loading
                renderBuildings();
                renderUpgrades();
                // Re-apply purchased upgrade effects
                upgrades.forEach(upgrade => {
                    if (upgrade.isPurchased) {
                        // Move to purchased panel
                        if (upgrade.element) {
                            const buyButton = upgrade.element.querySelector('.buy-upgrade-button');
                            if (buyButton) buyButton.remove();
                            const costEl = upgrade.element.querySelector('.upgrade-cost');
                            if (costEl) costEl.remove();
                            purchasedUpgradesContainer.appendChild(upgrade.element);
                            upgrade.element.classList.remove('upgrade-item');
                            upgrade.element.classList.add('purchased-upgrade-item');
                        }
                    }
                });
                AchievementsModule.renderAchievements();
                updateDisplay();
                updateWishingWellButton();
                console.log('Game loaded successfully');
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error loading game:', e);
            return false;
        }
    }

    function exportSave() {
        try {
            const saveData = getSaveData();
            const saveString = JSON.stringify(saveData);
            const encoded = btoa(saveString);
            return encoded;
        } catch (e) {
            console.error('Error exporting save:', e);
            return null;
        }
    }

    function importSave(encoded) {
        try {
            const saveString = atob(encoded);
            const saveData = JSON.parse(saveString);
            if (applySaveData(saveData)) {
                recalculateMPS();
                renderBuildings();
                renderUpgrades();
                upgrades.forEach(upgrade => {
                    if (upgrade.isPurchased && upgrade.element) {
                        const buyButton = upgrade.element.querySelector('.buy-upgrade-button');
                        if (buyButton) buyButton.remove();
                        const costEl = upgrade.element.querySelector('.upgrade-cost');
                        if (costEl) costEl.remove();
                        purchasedUpgradesContainer.appendChild(upgrade.element);
                        upgrade.element.classList.remove('upgrade-item');
                        upgrade.element.classList.add('purchased-upgrade-item');
                    }
                });
                AchievementsModule.renderAchievements();
                updateDisplay();
                updateWishingWellButton();
                save(); // Save the imported data to localStorage
                console.log('Save imported successfully');
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error importing save:', e);
            return false;
        }
    }

    function resetGame() {
        // Stop auto-save to prevent saving during reset
        stopAutoSave();

        // Clear the save data from localStorage
        localStorage.removeItem(SAVE_KEY);

        // Force reload the page to ensure clean state
        window.location.href = window.location.href;
    }

    function startAutoSave(intervalSeconds) {
        stopAutoSave();
        autoSaveInterval = setInterval(() => {
            if (OptionsModule.getOptions().autoSaveEnabled) {
                save();
            }
        }, intervalSeconds * 1000);
    }

    function stopAutoSave() {
        if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
            autoSaveInterval = null;
        }
    }

    function init() {
        // Try to load existing save
        load();
        // Start auto-save (every 30 seconds)
        startAutoSave(30);
    }

    return {
        save,
        saveGame: save,  // Alias for save
        load,
        exportSave,
        importSave,
        resetGame,
        startAutoSave,
        stopAutoSave,
        init
    };
})();
