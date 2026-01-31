// Prestige Module
const PrestigeModule = (function() {
    // Prestige state
    let manaCrystals = 0;  // Current spendable Mana Crystals
    let totalManaCrystalsEarned = 0;  // Total ever earned (for prestige level)
    let bonusPrestigeLevels = 0;  // Bonus levels from upgrades (shown as pending)
    let timesPrestiged = 0;
    let isInPrestigeMode = false;

    // Constants (Cookie Clicker formula)
    const PRESTIGE_BASE = 1e12;  // 1 trillion mana for first Mana Crystal
    const PRESTIGE_UNLOCK_THRESHOLD = 1e9;  // 1 billion mana to see prestige button (first run)

    // Prestige Upgrades (permanent upgrades bought with Mana Crystals)
    const prestigeUpgrades = [
        {
            id: 'spell-core',
            name: 'Spell Core',
            description: 'Boosts MPS by 5%.',
            flavorText: 'A wizard must always be aware of their inner self, and their connection to the arcane and metaphysical. Spell Cores help them channel their will into reality.',
            cost: 10,
            mpsBonus: 0.05,  // 5% MPS boost
            isPurchased: false
        },
        {
            id: '20-20-vision',
            name: '20/20 Vision',
            description: 'Wizard\'s Eyes are twice as effective.',
            flavorText: 'Perfect magical sight grants perfect magical insight.',
            cost: 5,
            buildingBoost: { buildingId: 'wizards-eye', multiplier: 2 },
            isPurchased: false
        }
        // Future prestige upgrades go here
    ];

    // Calculate Mana Crystals from total mana using Cookie Clicker formula
    // Mana Crystals = floor(cubeRoot(totalMana / 1e12))
    function calculateManaCrystals(totalMana) {
        if (totalMana < PRESTIGE_BASE) return 0;
        return Math.floor(Math.pow(totalMana / PRESTIGE_BASE, 1/3));
    }

    // Calculate mana needed to reach a specific Mana Crystal count
    // Mana needed = crystals^3 * 1e12
    function manaForCrystals(crystals) {
        return Math.pow(crystals, 3) * PRESTIGE_BASE;
    }

    // Get the prestige multiplier (crystals + upgrade bonuses)
    function getPrestigeMultiplier() {
        // Base: each crystal = +1% MPS
        let multiplier = 1 + (totalManaCrystalsEarned / 100);

        // Add bonuses from purchased prestige upgrades
        prestigeUpgrades.forEach(upgrade => {
            if (upgrade.isPurchased && upgrade.mpsBonus) {
                multiplier += upgrade.mpsBonus;
            }
        });

        return multiplier;
    }

    // Get total bonus percentage for display
    function getTotalBonusPercent() {
        let bonus = totalManaCrystalsEarned;  // Each crystal = 1%

        prestigeUpgrades.forEach(upgrade => {
            if (upgrade.isPurchased && upgrade.mpsBonus) {
                bonus += upgrade.mpsBonus * 100;
            }
        });

        return bonus;
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

    // Format time for countdown
    function formatTime(seconds) {
        if (!isFinite(seconds) || seconds <= 0) return 'never (no production)';
        if (seconds > 365 * 24 * 3600) return 'a very long time';

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    function getHTML() {
        return `
        <section id="prestige-panel" class="game-panel" hidden>
            <h2 id="prestige-heading" tabindex="-1">Prestige</h2>
            <div id="prestige-container" aria-labelledby="prestige-heading">
                <div id="prestige-pre-unlock" style="display: none;">
                    <p>You will acquire your first Mana Crystal in <span id="prestige-countdown">calculating...</span></p>
                    <p class="prestige-note">Reach 1 billion Mana gathered to unlock prestige.</p>
                </div>
                <div id="prestige-unlocked" style="display: none;">
                    <p id="prestige-gain-info">Prestige: (Gain <span id="prestige-pending-crystals">0</span> Mana Crystals)</p>
                    <p>Time until next Mana Crystal: <span id="prestige-next-countdown">calculating...</span></p>
                    <p>Current Mana Crystals: <span id="prestige-current-crystals">0</span></p>
                    <p id="prestige-bonus-levels-display" style="display: none;">Bonus Prestige Levels: <span id="prestige-bonus-levels">0</span></p>
                    <p>Production Bonus: <span id="prestige-bonus">+0%</span></p>
                    <p>Times Ascended: <span id="times-prestiged">0</span></p>
                    <button id="prestige-action-button" class="prestige-button">Prestige</button>
                </div>
            </div>
        </section>
        <section id="prestige-store-panel" class="game-panel" style="display: none;">
            <h2 id="prestige-store-heading" tabindex="-1">Prestige Store</h2>
            <div id="prestige-store-container">
                <p>Mana Crystals: <span id="prestige-store-crystals">0</span></p>
                <div id="prestige-upgrades-container"></div>
            </div>
        </section>`;
    }

    function init() {
        const prestigeButton = document.getElementById('prestige-action-button');
        if (prestigeButton) {
            prestigeButton.addEventListener('click', enterPrestigeMode);
        }

        const finishButton = document.getElementById('finish-prestige-button');
        if (finishButton) {
            finishButton.addEventListener('click', finishPrestige);
        }
    }

    function renderPrestigeUpgrades() {
        const container = document.getElementById('prestige-upgrades-container');
        if (!container) return;

        container.innerHTML = '';

        prestigeUpgrades.forEach(upgrade => {
            const upgradeDiv = document.createElement('div');
            upgradeDiv.className = 'prestige-upgrade-item';
            upgradeDiv.id = `prestige-upgrade-${upgrade.id}`;

            if (upgrade.isPurchased) {
                upgradeDiv.classList.add('purchased');
                upgradeDiv.innerHTML = `
                    <p class="prestige-upgrade-name">${upgrade.name} (Owned)</p>
                    <p class="prestige-upgrade-description">${upgrade.description}</p>
                    <p class="prestige-upgrade-flavor">${upgrade.flavorText}</p>
                `;
            } else {
                const canAfford = manaCrystals >= upgrade.cost;
                upgradeDiv.innerHTML = `
                    <p class="prestige-upgrade-name">${upgrade.name}</p>
                    <p class="prestige-upgrade-description">${upgrade.description}</p>
                    <p class="prestige-upgrade-flavor">${upgrade.flavorText}</p>
                    <p class="prestige-upgrade-cost">Cost: <span>${upgrade.cost}</span> Mana Crystals</p>
                    <button class="prestige-upgrade-button ${canAfford ? 'can-afford' : 'cannot-afford'}"
                            data-upgrade-id="${upgrade.id}"
                            ${canAfford ? '' : 'disabled'}>
                        ${canAfford ? 'Purchase' : 'Not Enough Crystals'}
                    </button>
                `;

                const buyButton = upgradeDiv.querySelector('.prestige-upgrade-button');
                if (buyButton && canAfford) {
                    buyButton.addEventListener('click', () => purchasePrestigeUpgrade(upgrade.id));
                }
            }

            container.appendChild(upgradeDiv);
        });
    }

    function purchasePrestigeUpgrade(upgradeId) {
        const upgrade = prestigeUpgrades.find(u => u.id === upgradeId);
        if (!upgrade || upgrade.isPurchased) return;

        if (manaCrystals >= upgrade.cost) {
            manaCrystals -= upgrade.cost;
            upgrade.isPurchased = true;

            // Apply building boost if applicable
            if (upgrade.buildingBoost) {
                applyBuildingBoost(upgrade.buildingBoost);
            }

            // Re-render the store
            renderPrestigeUpgrades();
            updateDisplay();

            // Announce purchase
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'alert');
            announcement.className = 'sr-only';
            announcement.textContent = `Purchased ${upgrade.name}!`;
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        }
    }

    function applyBuildingBoost(boost) {
        if (typeof buildings !== 'undefined') {
            const building = buildings.find(b => b.id === boost.buildingId);
            if (building) {
                building.productionPerSecond *= boost.multiplier;
                if (typeof recalculateMPS === 'function') {
                    recalculateMPS();
                }
            }
        }
    }

    function applyAllPrestigeBuildingBoosts() {
        prestigeUpgrades.forEach(upgrade => {
            if (upgrade.isPurchased && upgrade.buildingBoost) {
                applyBuildingBoost(upgrade.buildingBoost);
            }
        });
    }

    function shouldShowPrestige() {
        const stats = StatisticsModule.getStats();
        // Show if player has prestiged before OR has reached 1 billion mana
        return timesPrestiged > 0 || stats.manaTotal >= PRESTIGE_UNLOCK_THRESHOLD;
    }

    function updateDisplay() {
        const stats = StatisticsModule.getStats();
        const totalMana = stats.manaTotal;
        const effectiveMPS = typeof getEffectiveMPS === 'function' ? getEffectiveMPS() : 0;

        // Calculate pending crystals (what they'd gain on prestige)
        const totalCrystalsFromMana = calculateManaCrystals(totalMana);
        const pendingCrystals = Math.max(0, totalCrystalsFromMana - totalManaCrystalsEarned);

        // Get elements
        const preUnlockDiv = document.getElementById('prestige-pre-unlock');
        const unlockedDiv = document.getElementById('prestige-unlocked');
        const countdownEl = document.getElementById('prestige-countdown');
        const pendingEl = document.getElementById('prestige-pending-crystals');
        const nextCountdownEl = document.getElementById('prestige-next-countdown');
        const currentCrystalsEl = document.getElementById('prestige-current-crystals');
        const bonusEl = document.getElementById('prestige-bonus');
        const timesEl = document.getElementById('times-prestiged');
        const storeCrystalsEl = document.getElementById('prestige-store-crystals');

        const showPrestige = shouldShowPrestige();

        if (!showPrestige) {
            // Not yet unlocked - show countdown to first crystal
            if (preUnlockDiv) preUnlockDiv.style.display = 'block';
            if (unlockedDiv) unlockedDiv.style.display = 'none';

            // Calculate time until first crystal (1 trillion mana)
            const manaNeeded = PRESTIGE_BASE - totalMana;
            if (countdownEl) {
                if (effectiveMPS > 0) {
                    const secondsUntil = manaNeeded / effectiveMPS;
                    countdownEl.textContent = formatTime(secondsUntil);
                } else {
                    countdownEl.textContent = 'never (no production)';
                }
            }
        } else {
            // Prestige unlocked
            if (preUnlockDiv) preUnlockDiv.style.display = 'none';
            if (unlockedDiv) unlockedDiv.style.display = 'block';

            // Update pending crystals
            if (pendingEl) {
                pendingEl.textContent = pendingCrystals;
            }

            // Calculate time until next crystal
            const nextCrystalCount = totalCrystalsFromMana + 1;
            const manaForNextCrystal = manaForCrystals(nextCrystalCount);
            const manaNeededForNext = manaForNextCrystal - totalMana;

            if (nextCountdownEl) {
                if (effectiveMPS > 0) {
                    const secondsUntil = manaNeededForNext / effectiveMPS;
                    nextCountdownEl.textContent = formatTime(secondsUntil);
                } else {
                    nextCountdownEl.textContent = 'never (no production)';
                }
            }

            // Update current crystals and bonus
            if (currentCrystalsEl) {
                currentCrystalsEl.textContent = manaCrystals;
            }

            // Update bonus prestige levels display
            const bonusLevelsDisplay = document.getElementById('prestige-bonus-levels-display');
            const bonusLevelsEl = document.getElementById('prestige-bonus-levels');
            if (bonusLevelsDisplay && bonusLevelsEl) {
                if (bonusPrestigeLevels > 0) {
                    bonusLevelsDisplay.style.display = 'block';
                    bonusLevelsEl.textContent = bonusPrestigeLevels;
                } else {
                    bonusLevelsDisplay.style.display = 'none';
                }
            }

            if (bonusEl) {
                bonusEl.textContent = '+' + getTotalBonusPercent() + '%';
            }
            if (timesEl) {
                timesEl.textContent = timesPrestiged;
            }
        }

        // Update store crystals display
        if (storeCrystalsEl) {
            storeCrystalsEl.textContent = manaCrystals;
        }
    }

    function enterPrestigeMode() {
        const stats = StatisticsModule.getStats();
        const totalMana = stats.manaTotal;
        const totalCrystalsFromMana = calculateManaCrystals(totalMana);
        const pendingCrystals = Math.max(0, totalCrystalsFromMana - totalManaCrystalsEarned);

        if (pendingCrystals <= 0) {
            alert('You have no Mana Crystals to gain yet. Keep gathering mana!');
            return;
        }

        // Confirm entering prestige mode
        const confirmed = confirm(
            'Enter Prestige Mode?\n\n' +
            'You will gain ' + pendingCrystals + ' Mana Crystal(s).\n' +
            'Your new production bonus will be +' + (getTotalBonusPercent() + pendingCrystals) + '%.\n\n' +
            'Your mana, buildings, and upgrades will be reset when you finish.'
        );

        if (!confirmed) return;

        // Award the crystals
        manaCrystals += pendingCrystals;
        totalManaCrystalsEarned += pendingCrystals;

        // Enter prestige mode
        isInPrestigeMode = true;

        // Hide game elements
        hideGameElements();

        // Show prestige store
        const storePanel = document.getElementById('prestige-store-panel');
        if (storePanel) {
            storePanel.style.display = 'block';
        }

        // Render prestige upgrades
        renderPrestigeUpgrades();

        // Show finish button
        const finishButton = document.getElementById('finish-prestige-button');
        if (finishButton) {
            finishButton.style.display = 'block';
        }

        // Close the prestige panel
        const prestigePanel = document.getElementById('prestige-panel');
        if (prestigePanel) {
            prestigePanel.hidden = true;
        }

        updateDisplay();
    }

    function hideGameElements() {
        // Hide main game sections
        const elementsToHide = [
            '.game-stats',
            '.game-actions',
            '#events-heading',
            '#events-log',
            '#upgrades-heading',
            '#upgrades-container',
            '#buildings-heading',
            '#buildings-container',
            '#purchased-upgrades-panel'
        ];

        elementsToHide.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                el.dataset.prestigeHidden = 'true';
                el.style.display = 'none';
            }
        });
    }

    function showGameElements() {
        // Show main game sections
        const elementsToShow = document.querySelectorAll('[data-prestige-hidden="true"]');
        elementsToShow.forEach(el => {
            el.style.display = '';
            delete el.dataset.prestigeHidden;
        });
    }

    function finishPrestige() {
        if (!isInPrestigeMode) return;

        const confirmed = confirm(
            'Finish Prestige?\n\n' +
            'Your mana, buildings, and upgrades will be reset.\n' +
            'Your Mana Crystals, prestige upgrades, and production bonus will be kept.'
        );

        if (!confirmed) return;

        // Increment prestige count
        timesPrestiged++;

        // Exit prestige mode
        isInPrestigeMode = false;

        // Hide prestige store
        const storePanel = document.getElementById('prestige-store-panel');
        if (storePanel) {
            storePanel.style.display = 'none';
        }

        // Hide finish button
        const finishButton = document.getElementById('finish-prestige-button');
        if (finishButton) {
            finishButton.style.display = 'none';
        }

        // Show game elements
        showGameElements();

        // Reset game state (keeping prestige data and total mana)
        if (typeof resetForPrestige === 'function') {
            resetForPrestige();
        }

        updateDisplay();
    }

    function getPrestigeLevel() {
        return totalManaCrystalsEarned + bonusPrestigeLevels;
    }

    function addBonusPrestigeLevel(amount) {
        bonusPrestigeLevels += amount;
        updateDisplay();
    }

    function getBonusPrestigeLevels() {
        return bonusPrestigeLevels;
    }

    function getManaCrystals() {
        return manaCrystals;
    }

    function spendManaCrystals(amount) {
        if (manaCrystals >= amount) {
            manaCrystals -= amount;
            updateDisplay();
            return true;
        }
        return false;
    }

    function getTimesPrestiged() {
        return timesPrestiged;
    }

    function isPrestigeMode() {
        return isInPrestigeMode;
    }

    // For save/load
    function getPrestigeData() {
        return {
            manaCrystals,
            totalManaCrystalsEarned,
            bonusPrestigeLevels,
            timesPrestiged,
            isInPrestigeMode,
            prestigeUpgrades: prestigeUpgrades.map(u => ({
                id: u.id,
                isPurchased: u.isPurchased
            }))
        };
    }

    function loadPrestigeData(data) {
        if (data) {
            manaCrystals = data.manaCrystals || 0;
            totalManaCrystalsEarned = data.totalManaCrystalsEarned || 0;
            bonusPrestigeLevels = data.bonusPrestigeLevels || 0;
            timesPrestiged = data.timesPrestiged || 0;
            isInPrestigeMode = data.isInPrestigeMode || false;

            // Load prestige upgrade states
            if (data.prestigeUpgrades) {
                data.prestigeUpgrades.forEach(savedUpgrade => {
                    const upgrade = prestigeUpgrades.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.isPurchased = savedUpgrade.isPurchased || false;
                    }
                });
            }

            // If loading into prestige mode, restore that state
            if (isInPrestigeMode) {
                hideGameElements();
                const storePanel = document.getElementById('prestige-store-panel');
                if (storePanel) storePanel.style.display = 'block';
                const finishButton = document.getElementById('finish-prestige-button');
                if (finishButton) finishButton.style.display = 'block';
                renderPrestigeUpgrades();
            }
        }
    }

    function reset() {
        manaCrystals = 0;
        totalManaCrystalsEarned = 0;
        timesPrestiged = 0;
        isInPrestigeMode = false;
        prestigeUpgrades.forEach(u => u.isPurchased = false);
    }

    return {
        getHTML,
        init,
        updateDisplay,
        getPrestigeLevel,
        addBonusPrestigeLevel,
        getBonusPrestigeLevels,
        getManaCrystals,
        spendManaCrystals,
        getTimesPrestiged,
        getPrestigeMultiplier,
        getPrestigeData,
        loadPrestigeData,
        calculateManaCrystals,
        manaForCrystals,
        isPrestigeMode,
        shouldShowPrestige,
        renderPrestigeUpgrades,
        applyAllPrestigeBuildingBoosts,
        reset
    };
})();
