const VERSION = '0.02';

let mana = 0;
let manaPerClick = 1;
let manaPerSecond = 0;

const manaDisplay = document.getElementById('mana-display');
const mpsDisplay = document.getElementById('mps-display');
const mpcDisplay = document.getElementById('mpc-display');
const gatherManaButton = document.getElementById('gather-mana-button');
const buildingsContainer = document.getElementById('buildings-container');
const upgradesContainer = document.getElementById('upgrades-container'); // Get upgrades container
const eventsLog = document.getElementById('events-log');
const purchasedUpgradesContainer = document.getElementById('purchased-upgrades-container');
const purchasedUpgradesPanel = document.getElementById('purchased-upgrades-panel');
const purchasedUpgradesHeading = document.getElementById('purchased-upgrades-heading');
const panelsContainer = document.getElementById('panels-container');

// Track mana per click bonus from upgrades (base is 1)
let baseManaPerClick = 1;
let manaPerClickFromUpgrades = 0;
let mpsFromUpgrades = 0;

// --- Initialize Panels ---
function initializePanels() {
    // Insert panel HTML into the panels container
    panelsContainer.innerHTML =
        StatisticsModule.getHTML() +
        AchievementsModule.getHTML() +
        ProductionModule.getHTML() +
        PrestigeModule.getHTML() +
        ChangelogModule.getHTML() +
        OptionsModule.getHTML();

    // Initialize modules that need it
    OptionsModule.init();
    PrestigeModule.init();
    ChangelogModule.renderChangelog();
    AchievementsModule.renderAchievements();
}

// Navigation buttons - will be populated after panels are initialized
let navButtons = {};

// --- Game Data Structures ---
const buildings = [
    {
        id: 'wizards-hand',
        name: 'Wizard\'s Hand',
        description: 'Generates 0.1 Mana per second.',
        flavorText: 'A spectral hand that gathers ambient mana from the air.',
        baseCost: 10,
        productionPerSecond: 0.1,
        owned: 0,
        unlockCondition: () => true,
        isUnlocked: true,
        element: null
    },
    {
        id: 'wizards-eye',
        name: 'Wizard\'s Eye',
        description: 'Generates 0.5 Mana per second.',
        flavorText: 'One must see power, to be able to grasp it.',
        baseCost: 50,
        productionPerSecond: 0.5,
        owned: 0,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-sight').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magus',
        name: 'Magus',
        description: 'Casts spells to generate Mana.',
        flavorText: 'Practitioners of the arcane who go by far too many names.',
        baseCost: 550,
        productionPerSecond: 2,
        owned: 0,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased,
        isUnlocked: false,
        element: null
    }
    // Future buildings will go here
];

const upgrades = [
    {
        id: 'magic-theory',
        name: 'Magic Theory',
        description: 'Increases mana per click by 1.',
        flavorText: 'Understanding the fundamentals amplifies your natural talent.',
        cost: 30,
        effect: () => { manaPerClick += 1; },
        isPurchased: false,
        unlockCondition: () => true, // Always visible
        isUnlocked: true,
        element: null
    },
    {
        id: 'magic-sight',
        name: 'Magic Sight',
        description: 'Unlocks the Wizard\'s Eye building.',
        flavorText: 'To peer into the unknown is to accept the unknown exists.',
        cost: 30,
        effect: () => { const b = buildings.find(b => b.id === 'wizards-eye'); if(b) b.isUnlocked = true; },
        isPurchased: false,
        unlockCondition: () => true,
        isUnlocked: true,
        element: null
    },
    {
        id: 'hand-eye-coordination',
        name: 'Hand-Eye Coordination',
        description: 'Train the hands and eyes to collaborate.',
        flavorText: 'A simple training manual, nothing arcane about it, other than its application to the metaphysical.',
        cost: 500,
        effect: () => { manaPerClick *= 2; const sb = buildings.find(b => b.id === 'wizards-eye'); if(sb) sb.productionPerSecond *= 2; },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-eye').owned >= 25,
        isUnlocked: false,
        element: null
    },
    {
        id: 'arcane-tap',
        name: 'Arcane Tap',
        description: 'Increase Mana per click.',
        flavorText: 'Learn how to improve the gathering of mana, gaining more with less effort.',
        cost: 25,
        effect: () => { manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-theory').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-schools',
        name: 'Magic Schools',
        description: 'Increases Mana per second.',
        flavorText: 'Theory gives way to practice.',
        cost: 500,
        effect: () => { manaPerSecond *= 2; },
        isPurchased: false,
        unlockCondition: () => true,
        isUnlocked: true,
        element: null
    },
    {
        id: 'arcane-focus',
        name: 'Arcane Focus',
        description: 'Doubles Magus production.',
        flavorText: 'One of a mages\' first tools.',
        cost: 5000,
        effect: () => { const m = buildings.find(b => b.id === 'magus'); if(m) m.productionPerSecond *= 2; },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'magus').owned >= 1,
        isUnlocked: false,
        element: null
    },
    {
        id: 'components-pouch',
        name: 'Components\' Pouch',
        description: 'Doubles Mana per click.',
        flavorText: 'One of a mages\' first tools.',
        cost: 5000,
        effect: () => { manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'magus').owned >= 1,
        isUnlocked: false,
        element: null
    }
    // Future upgrades will go here
];

// --- Helper Functions ---
function getBuildingCurrentCost(building) {
    // Exponential cost increase: baseCost * 1.15^owned
    return building.baseCost * Math.pow(1.15, building.owned);
}

function formatTime(seconds) {
    if (seconds <= 0 || !isFinite(seconds)) return '';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
    } else {
        return `${secs}s`;
    }
}

function getTimeUntilAffordable(cost) {
    if (mana >= cost) return 0;
    const effectiveMPS = typeof getEffectiveMPS === 'function' ? getEffectiveMPS() : manaPerSecond;
    if (effectiveMPS <= 0) return Infinity;
    return (cost - mana) / effectiveMPS;
}

// Function to update the display elements
function updateDisplay() {
    // Show effective MPS with prestige bonus
    const effectiveMPS = typeof getEffectiveMPS === 'function' ? getEffectiveMPS() : manaPerSecond;
    const prestigeBonus = typeof PrestigeModule !== 'undefined' ? PrestigeModule.getPrestigeLevel() : 0;

    manaDisplay.textContent = `${mana.toFixed(0)} Mana`;
    if (prestigeBonus > 0) {
        mpsDisplay.textContent = `${effectiveMPS.toFixed(1)} MPS (+${prestigeBonus}%)`;
    } else {
        mpsDisplay.textContent = `${effectiveMPS.toFixed(1)} MPS`;
    }
    mpcDisplay.textContent = `${manaPerClick.toFixed(0)} per click`;
    checkAffordability(); // Check affordability for both buildings and upgrades
}

// Function to gather mana when the button is clicked
function gatherMana() {
    mana += manaPerClick;
    StatisticsModule.addManaByClick(manaPerClick);
    updateDisplay();
}

// --- Building Logic ---
function buyBuilding(buildingId) {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) {
        console.error('Building not found:', buildingId);
        return;
    }

    const cost = getBuildingCurrentCost(building);
    if (mana >= cost) {
        mana -= cost;
        building.owned++;
        manaPerSecond += building.productionPerSecond;
        StatisticsModule.addBuildingOwned();
        updateBuildingDisplay(building);
        updateDisplay(); // Update main displays and affordability
    } else {
        // Do nothing if cannot afford
    }
}

function createBuildingElement(building) {
    const buildingDiv = document.createElement('div');
    buildingDiv.id = `building-${building.id}`;
    buildingDiv.className = 'building-item';
    buildingDiv.setAttribute('role', 'region');
    buildingDiv.setAttribute('aria-labelledby', `building-name-${building.id}`);

    buildingDiv.innerHTML = `
        <p id="building-name-${building.id}" class="building-name">${building.name}</p>
        <p class="building-description">${building.description}</p>
        <p class="building-flavor">${building.flavorText}</p>
        <p class="building-owned" aria-live="polite" aria-atomic="true">Owned: <span>${building.owned}</span></p>
        <p class="building-cost">Cost: <span class="cost-value">${getBuildingCurrentCost(building).toFixed(0)}</span> Mana</p>
        <button id="buy-${building.id}-button" class="buy-building-button">${building.name}, Can Buy</button>
    `;

    const buyButton = buildingDiv.querySelector(`#buy-${building.id}-button`);
    buyButton.addEventListener('click', () => buyBuilding(building.id));

    building.element = buildingDiv;
    return buildingDiv;
}

function updateBuildingDisplay(building) {
    if (!building.element) return;

    building.element.querySelector('.building-owned span').textContent = building.owned;
    building.element.querySelector('.building-cost .cost-value').textContent = getBuildingCurrentCost(building).toFixed(0);
}

function renderBuildings() {
    buildingsContainer.innerHTML = '';
    buildings.forEach(building => {
        if (building.isUnlocked) {
            buildingsContainer.appendChild(createBuildingElement(building));
        }
    });
}

function checkUnlocks() {
    let newUnlocks = false;

    buildings.forEach(building => {
        if (!building.isUnlocked && building.unlockCondition()) {
            building.isUnlocked = true;
            newUnlocks = true;
        }
    });

    upgrades.forEach(upgrade => {
        if (!upgrade.isUnlocked && !upgrade.isPurchased && upgrade.unlockCondition()) {
            upgrade.isUnlocked = true;
            newUnlocks = true;
        }
    });

    if (newUnlocks) {
        renderBuildings();
        renderUpgrades();
    }
}

// --- Upgrade Logic ---
function buyUpgrade(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.isPurchased) {
        console.error('Upgrade not found or already purchased:', upgradeId);
        return;
    }

    if (mana >= upgrade.cost) {
        mana -= upgrade.cost;
        upgrade.effect(); // Apply the upgrade's effect
        upgrade.isPurchased = true;
        StatisticsModule.addUpgradePurchased();
        // Track mana per click from upgrades
        manaPerClickFromUpgrades = manaPerClick - baseManaPerClick;
        ProductionModule.setManaPerClickFromUpgrades(manaPerClickFromUpgrades);
        updateUpgradeDisplay(upgrade);
        updateDisplay(); // Update main displays and affordability
    } else {
        // Do nothing if cannot afford
    }
}

function createUpgradeElement(upgrade) {
    const upgradeDiv = document.createElement('div');
    upgradeDiv.id = `upgrade-${upgrade.id}`;
    upgradeDiv.className = 'upgrade-item';
    upgradeDiv.setAttribute('role', 'region');
    upgradeDiv.setAttribute('aria-labelledby', `upgrade-name-${upgrade.id}`);

    upgradeDiv.innerHTML = `
        <p id="upgrade-name-${upgrade.id}" class="upgrade-name">${upgrade.name}</p>
        <p class="upgrade-description">${upgrade.description}</p>
        <p class="upgrade-flavor">${upgrade.flavorText}</p>
        <p class="upgrade-cost">Cost: <span class="cost-value">${upgrade.cost.toFixed(0)}</span> Mana</p>
        <button id="buy-${upgrade.id}-button" class="buy-upgrade-button">${upgrade.name}, Can Buy</button>
    `;

    const buyButton = upgradeDiv.querySelector(`#buy-${upgrade.id}-button`);
    buyButton.addEventListener('click', () => buyUpgrade(upgrade.id));

    upgrade.element = upgradeDiv;
    return upgradeDiv;
}

function updateUpgradeDisplay(upgrade) {
    if (!upgrade.element) return;

    const buyButton = upgrade.element.querySelector('.buy-upgrade-button');
    if (upgrade.isPurchased) {
        buyButton.remove();
        upgrade.element.querySelector('.upgrade-cost').remove();
        purchasedUpgradesContainer.appendChild(upgrade.element);
        upgrade.element.classList.remove('upgrade-item');
        upgrade.element.classList.add('purchased-upgrade-item');
    } else {
        // Affordability handled by checkAffordability
        upgrade.element.querySelector('.upgrade-cost .cost-value').textContent = upgrade.cost.toFixed(0);
    }
}

function renderUpgrades() {
    upgradesContainer.innerHTML = '';
    upgrades.forEach(upgrade => {
        if (upgrade.isUnlocked && !upgrade.isPurchased) {
            upgradesContainer.appendChild(createUpgradeElement(upgrade));
        }
    });
}

// --- Affordability Check (for both buildings and upgrades) ---
function checkAffordability() {
    buildings.forEach(building => {
        if (building.element) {
            const buyButton = building.element.querySelector('.buy-building-button');
            const cost = getBuildingCurrentCost(building);
            if (mana >= cost) {
                buyButton.disabled = false;
                buyButton.textContent = `${building.name}, Can Buy`;
                buyButton.setAttribute('aria-label', `${building.name}, Can Buy`);
                buyButton.classList.add('can-buy');
                buyButton.classList.remove('cannot-buy');
            } else {
                buyButton.disabled = true;
                const timeUntil = getTimeUntilAffordable(cost);
                const timeStr = formatTime(timeUntil);
                const timerDisplay = timeStr ? `, ${timeStr}` : '';
                buyButton.textContent = `${building.name}, Not Affordable${timerDisplay}`;
                buyButton.setAttribute('aria-label', `${building.name}, Not Affordable${timerDisplay}`);
                buyButton.classList.add('cannot-buy');
                buyButton.classList.remove('can-buy');
            }
        }
    });

    upgrades.forEach(upgrade => {
        if (upgrade.element && !upgrade.isPurchased) {
            const buyButton = upgrade.element.querySelector('.buy-upgrade-button');
            if (mana >= upgrade.cost) {
                buyButton.disabled = false;
                buyButton.textContent = `${upgrade.name}, Can Buy`;
                buyButton.setAttribute('aria-label', `${upgrade.name}, Can Buy`);
                buyButton.classList.add('can-buy');
                buyButton.classList.remove('cannot-buy');
            } else {
                buyButton.disabled = true;
                const timeUntil = getTimeUntilAffordable(upgrade.cost);
                const timeStr = formatTime(timeUntil);
                const timerDisplay = timeStr ? `, ${timeStr}` : '';
                buyButton.textContent = `${upgrade.name}, Not Affordable${timerDisplay}`;
                buyButton.setAttribute('aria-label', `${upgrade.name}, Not Affordable${timerDisplay}`);
                buyButton.classList.add('cannot-buy');
                buyButton.classList.remove('can-buy');
            }
        }
    });
}

// --- Navigation ---
let currentOpenPanel = null;

function togglePanel(panel, heading) {
    if (!panel) return;

    // If clicking the same panel, close it
    if (currentOpenPanel === panel) {
        panel.hidden = true;
        currentOpenPanel = null;
        return;
    }

    // Close any currently open panel
    if (currentOpenPanel) {
        currentOpenPanel.hidden = true;
    }

    // Open the new panel
    panel.hidden = false;
    currentOpenPanel = panel;

    // Scroll to and focus the heading
    if (heading) {
        heading.scrollIntoView({ behavior: 'smooth' });
        heading.focus();
    }
}

function setupNavigation() {
    // Map buttons to their panels
    navButtons = {
        'statistics-button': document.getElementById('statistics-panel'),
        'achievements-button': document.getElementById('achievements-panel'),
        'upgrades-button': purchasedUpgradesPanel,
        'production-button': document.getElementById('production-panel'),
        'prestige-button': document.getElementById('prestige-panel'),
        'changelog-button': document.getElementById('changelog-panel'),
        'options-button': document.getElementById('options-panel')
    };

    // Set up navigation button listeners
    Object.keys(navButtons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        const panel = navButtons[buttonId];

        if (button && panel) {
            button.addEventListener('click', () => {
                const heading = panel.querySelector('h2[tabindex="-1"]');
                togglePanel(panel, heading);

                // Update panel contents when opened
                if (panel.id === 'statistics-panel') {
                    StatisticsModule.updateDisplay();
                } else if (panel.id === 'production-panel') {
                    ProductionModule.updateDisplay(buildings);
                }
            });
        }
    });
}

// --- Game Loop and Initialization ---
gatherManaButton.addEventListener('click', gatherMana);

// Calculate effective MPS with prestige bonus
function getEffectiveMPS() {
    return manaPerSecond * PrestigeModule.getPrestigeMultiplier();
}

function gameLoop() {
    // Apply prestige multiplier to production
    const effectiveMPS = getEffectiveMPS();
    const manaFromBuildings = effectiveMPS / 10;
    mana += manaFromBuildings;
    if (manaFromBuildings > 0) {
        StatisticsModule.addManaByBuildings(manaFromBuildings);
    }
    StatisticsModule.setCurrentMana(mana);

    // Check achievements and unlocks
    AchievementsModule.checkAchievements(StatisticsModule.getStats());
    checkUnlocks();

    updateDisplay();
}

// Reset game for prestige ascension (keeps prestige data and total mana stat)
function resetForPrestige() {
    // Save total mana before reset
    const stats = StatisticsModule.getStats();
    const totalMana = stats.manaTotal;
    const prestigeData = PrestigeModule.getPrestigeData();

    // Reset game state
    mana = 0;
    manaPerClick = 1;
    manaPerSecond = 0;
    baseManaPerClick = 1;
    manaPerClickFromUpgrades = 0;
    mpsFromUpgrades = 0;

    // Reset buildings
    buildings.forEach(building => {
        building.owned = 0;
        building.isUnlocked = building.unlockCondition === (() => true) || building.id === 'wizards-hand';
        building.element = null;
    });
    // Ensure first building is unlocked
    const firstBuilding = buildings.find(b => b.id === 'wizards-hand');
    if (firstBuilding) firstBuilding.isUnlocked = true;

    // Reset upgrades
    upgrades.forEach(upgrade => {
        upgrade.isPurchased = false;
        upgrade.isUnlocked = upgrade.unlockCondition === (() => true) || upgrade.id === 'magic-theory' || upgrade.id === 'magic-sight' || upgrade.id === 'magic-schools';
        upgrade.element = null;
    });

    // Clear purchased upgrades container
    purchasedUpgradesContainer.innerHTML = '';

    // Reset statistics but keep total mana
    StatisticsModule.reset();
    const newStats = StatisticsModule.getStats();
    newStats.manaTotal = totalMana;

    // Restore prestige data
    PrestigeModule.loadPrestigeData(prestigeData);

    // Re-render UI
    renderBuildings();
    renderUpgrades();
    updateDisplay();

    // Save the game
    SaveManager.saveGame();
}

setInterval(gameLoop, 100);

// Initial setup
initializePanels();
setupNavigation();
updateDisplay();
renderBuildings();
renderUpgrades();
FlavorEventsModule.init();
SaveManager.init();

// Function for general announcements (kept for future use, but not for purchases)
function announce(message) {
    const announcement = document.createElement('p');
    announcement.textContent = message;
    announcement.classList.add('sr-only');
    eventsLog.prepend(announcement);

    while (eventsLog.children.length > 5) {
        eventsLog.removeChild(eventsLog.lastChild);
    }
}
