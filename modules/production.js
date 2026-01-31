// Production Module
const ProductionModule = (function() {
    let mpsFromUpgrades = 0;
    let manaPerClickFromUpgrades = 0;
    let mpsMultiplier = 1;

    function getHTML() {
        return `
        <section id="production-panel" class="game-panel" hidden>
            <h2 id="production-heading" tabindex="-1">Production</h2>
            <div id="production-container" aria-labelledby="production-heading">
                <div class="production-upgrades">
                    <p>MPS Multiplier from Upgrades: <span id="prod-mps-multiplier">1.00x</span></p>
                    <p>MPS Bonus from Upgrades: <span id="prod-mps-upgrades">+0</span></p>
                    <p>Mana per Click from Upgrades: <span id="prod-mpc-upgrades">+0</span></p>
                </div>
                <h3>Buildings</h3>
                <ul id="production-buildings-list" class="production-list"></ul>
            </div>
        </section>`;
    }

    function setMPSFromUpgrades(amount) {
        mpsFromUpgrades = amount;
    }

    function setMPSMultiplier(multiplier) {
        mpsMultiplier = multiplier;
    }

    function setManaPerClickFromUpgrades(amount) {
        manaPerClickFromUpgrades = amount;
    }

    function updateDisplay(buildings) {
        const mpsMultiplierEl = document.getElementById('prod-mps-multiplier');
        const mpsUpgradesEl = document.getElementById('prod-mps-upgrades');
        const mpcUpgradesEl = document.getElementById('prod-mpc-upgrades');
        const buildingsList = document.getElementById('production-buildings-list');

        if (mpsMultiplierEl) {
            mpsMultiplierEl.textContent = mpsMultiplier.toFixed(2) + 'x';
        }
        if (mpsUpgradesEl) {
            mpsUpgradesEl.textContent = '+' + mpsFromUpgrades.toFixed(1);
        }
        if (mpcUpgradesEl) {
            mpcUpgradesEl.textContent = '+' + manaPerClickFromUpgrades.toFixed(0);
        }

        if (buildingsList && buildings) {
            buildingsList.innerHTML = '';
            buildings.forEach(building => {
                if (building.owned > 0) {
                    const li = document.createElement('li');
                    li.className = 'production-building-item';
                    const perBuilding = building.productionPerSecond;
                    const totalProduction = perBuilding * building.owned;
                    li.innerHTML = `
                        <span class="building-name">${building.name}</span>
                        <span class="building-production">
                            ${perBuilding.toFixed(1)} MPS each |
                            ${building.owned} owned |
                            ${totalProduction.toFixed(1)} MPS total
                        </span>
                    `;
                    buildingsList.appendChild(li);
                }
            });

            if (buildingsList.children.length === 0) {
                buildingsList.innerHTML = '<li class="no-buildings">No buildings owned yet.</li>';
            }
        }
    }

    return {
        getHTML,
        setMPSFromUpgrades,
        setMPSMultiplier,
        setManaPerClickFromUpgrades,
        updateDisplay
    };
})();
