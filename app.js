const VERSION = '0.01';

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
        baseCost: 10,
        productionPerSecond: 0.1,
        owned: 0,
        element: null // To store the DOM element for easy access
    }
    // Future buildings will go here
];

const upgrades = [
    {
        id: 'magic-theory',
        name: 'Magic Theory',
        description: 'Increases mana per click by 1.',
        cost: 30,
        effect: () => { manaPerClick += 1; },
        isPurchased: false,
        element: null // To store the DOM element for easy access
    }
    // Future upgrades will go here
];

// --- Helper Functions ---
function getBuildingCurrentCost(building) {
    // Exponential cost increase: baseCost * 1.15^owned
    return building.baseCost * Math.pow(1.15, building.owned);
}

// Function to update the display elements
function updateDisplay() {
    manaDisplay.textContent = `${mana.toFixed(0)} Mana`;
    mpsDisplay.textContent = `${manaPerSecond.toFixed(1)} MPS`;
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
        <h3 id="building-name-${building.id}" class="building-name">${building.name}</h3>
        <p class="building-description">${building.description}</p>
        <p class="building-owned" aria-live="polite" aria-atomic="true">Owned: <span>${building.owned}</span></p>
        <p class="building-cost">Cost: <span class="cost-value">${getBuildingCurrentCost(building).toFixed(0)}</span> Mana</p>
        <button id="buy-${building.id}-button" class="buy-building-button" aria-label="Buy ${building.name}">Buy</button>
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
        buildingsContainer.appendChild(createBuildingElement(building));
    });
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
        <h3 id="upgrade-name-${upgrade.id}" class="upgrade-name">${upgrade.name}</h3>
        <p class="upgrade-description">${upgrade.description}</p>
        <p class="upgrade-cost">Cost: <span class="cost-value">${upgrade.cost.toFixed(0)}</span> Mana</p>
        <button id="buy-${upgrade.id}-button" class="buy-upgrade-button" aria-label="Buy ${upgrade.name}">${upgrade.isPurchased ? 'Purchased' : 'Buy'}</button>
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
        upgradesContainer.appendChild(createUpgradeElement(upgrade));
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
                buyButton.textContent = 'Buy';
                buyButton.setAttribute('aria-label', `Buy ${building.name} - Can Buy`);
                buyButton.classList.add('can-buy');
                buyButton.classList.remove('cannot-buy');
            } else {
                buyButton.disabled = true;
                buyButton.textContent = 'Too expensive';
                buyButton.setAttribute('aria-label', `Buy ${building.name} - Not Affordable`);
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
                buyButton.textContent = 'Buy';
                buyButton.setAttribute('aria-label', `Buy ${upgrade.name} - Can Buy`);
                buyButton.classList.add('can-buy');
                buyButton.classList.remove('cannot-buy');
            } else {
                buyButton.disabled = true;
                buyButton.textContent = 'Too expensive';
                buyButton.setAttribute('aria-label', `Buy ${upgrade.name} - Not Affordable`);
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

function gameLoop() {
    const manaFromBuildings = manaPerSecond / 10;
    mana += manaFromBuildings;
    if (manaFromBuildings > 0) {
        StatisticsModule.addManaByBuildings(manaFromBuildings);
    }
    StatisticsModule.setCurrentMana(mana);

    // Check achievements
    AchievementsModule.checkAchievements(StatisticsModule.getStats());

    updateDisplay();
}

setInterval(gameLoop, 100);

// Initial setup
initializePanels();
setupNavigation();
updateDisplay();
renderBuildings();
renderUpgrades();

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
