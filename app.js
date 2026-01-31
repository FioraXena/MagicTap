const VERSION = '0.4';

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
let mpsUpgradeMultiplier = 1; // Multiplier from upgrades that boost all MPS

// --- Initialize Panels ---
function initializePanels() {
    // Insert panel HTML into the panels container
    panelsContainer.innerHTML =
        StatisticsModule.getHTML() +
        AchievementsModule.getHTML() +
        ProductionModule.getHTML() +
        PrestigeModule.getHTML() +
        WishingWellModule.getHTML() +
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
        baseProduction: 0.1,
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
        baseProduction: 0.5,
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
        baseProduction: 2,
        productionPerSecond: 2,
        owned: 0,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'ley-line',
        name: 'Ley Line',
        description: 'Draw upon the planet to gain Mana.',
        flavorText: 'Draws raw Mana from within the planet.',
        baseCost: 1550,
        baseProduction: 15,
        productionPerSecond: 15,
        owned: 0,
        unlockCondition: () => upgrades.find(u => u.id === 'ley-lines').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-crystal',
        name: 'Mana Crystal',
        description: 'Crystallize raw Mana into a refined form for 38 Mana per second.',
        flavorText: 'Mana, refined into a tangible form.',
        baseCost: 21750,
        baseProduction: 38,
        productionPerSecond: 38,
        owned: 0,
        unlockCondition: () => mana >= 17500,
        isUnlocked: false,
        element: null
    },
    // === INSERT NEW BUILDINGS HERE ===
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
        id: 'glowing-fingers',
        name: 'Glowing Fingers',
        description: 'Wizard\'s Hands are twice as effective.',
        flavorText: 'Push for just a little more flair with glowing fingers.',
        cost: 500,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-hand').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'tunnel-vision',
        name: 'Tunnel Vision',
        description: 'Wizard\'s Eyes are twice as effective.',
        flavorText: 'Narrow your magic sight to focus on Mana, and only Mana. All for more Mana.',
        cost: 1500,
        effect: () => { const we = buildings.find(b => b.id === 'wizards-eye'); if(we) we.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-eye').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'optical-illusion',
        name: 'Optical Illusion',
        description: 'Wizard\'s Eyes are twice as effective.',
        flavorText: 'Appear more effective. In the world of the metaphysical, that actually does work.',
        cost: 12500,
        effect: () => { const we = buildings.find(b => b.id === 'wizards-eye'); if(we) we.productionPerSecond *= 2; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-eye').owned >= 25,
        isUnlocked: false,
        element: null
    },
    {
        id: 'hand-eye-coordination',
        name: 'Hand-Eye Coordination',
        description: 'Train the hands and eyes to collaborate.',
        flavorText: 'A simple training manual, nothing arcane about it, other than its application to the metaphysical.',
        cost: 500,
        effect: () => { manaPerClick *= 2; const sb = buildings.find(b => b.id === 'wizards-eye'); if(sb) sb.productionPerSecond *= 2; recalculateMPS(); },
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
        effect: () => { mpsUpgradeMultiplier *= 2; recalculateMPS(); },
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
    },
    {
        id: 'magic-fingers-1',
        name: 'Magic Fingers LV. 1',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 1000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'wizards-hand').owned >= 25,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-2',
        name: 'Magic Fingers LV. 2',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 10000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-1').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-3',
        name: 'Magic Fingers LV. 3',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 100000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-2').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-4',
        name: 'Magic Fingers LV. 4',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 1000000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-3').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-5',
        name: 'Magic Fingers LV. 5',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 10000000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-4').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-6',
        name: 'Magic Fingers LV. 6',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 100000000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-5').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-7',
        name: 'Magic Fingers LV. 7',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 1000000000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-6').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-8',
        name: 'Magic Fingers LV. 8',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 10000000000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-7').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-9',
        name: 'Magic Fingers LV. 9',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 100000000000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-8').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'magic-fingers-10',
        name: 'Magic Fingers LV. 10',
        description: 'Boosts Wizard\'s Hand production by 1% and doubles Mana per click.',
        flavorText: 'Train your Wizard\'s Hands by focusing power into each individual finger.',
        cost: 1000000000000,
        effect: () => { const wh = buildings.find(b => b.id === 'wizards-hand'); if(wh) wh.productionPerSecond *= 1.01; manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-fingers-9').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'abjuration',
        name: 'Abjuration',
        description: 'Increases Mana per second by 1%.',
        flavorText: '',
        cost: 15000,
        effect: () => { mpsUpgradeMultiplier *= 1.01; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'conjuration',
        name: 'Conjuration',
        description: 'Increases Mana per second by 1%.',
        flavorText: '',
        cost: 19999,
        effect: () => { mpsUpgradeMultiplier *= 1.01; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'evocation',
        name: 'Evocation',
        description: 'Increases Mana per second by 2%.',
        flavorText: '',
        cost: 499999,
        effect: () => { mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'enchantment',
        name: 'Enchantment',
        description: 'Increases Mana per second by 1%.',
        flavorText: '',
        cost: 49999,
        effect: () => { mpsUpgradeMultiplier *= 1.01; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'illusion',
        name: 'Illusion',
        description: 'Increases Mana per second by 2%.',
        flavorText: '',
        cost: 49999,
        effect: () => { mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'necromancy',
        name: 'Necromancy',
        description: 'Increases Mana per second by 2%.',
        flavorText: '',
        cost: 99999,
        effect: () => { mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'summoning',
        name: 'Summoning',
        description: 'Increases Mana per second by 2%.',
        flavorText: '',
        cost: 199999,
        effect: () => { mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'transmutation',
        name: 'Transmutation',
        description: 'Increases Mana per second by 2%.',
        flavorText: '',
        cost: 49999,
        effect: () => { mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'prestidigitation',
        name: 'Prestidigitation',
        description: 'Increases Mana per second by 1%.',
        flavorText: 'A wizard\'s first spell, and an all-purpose magic tool.',
        cost: 9999,
        effect: () => { mpsUpgradeMultiplier *= 1.01; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased && buildings.find(b => b.id === 'magus').owned >= 10,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-manipulation-techniques',
        name: 'Mana Manipulation Techniques',
        description: 'Doubles Mana per click.',
        flavorText: 'Advanced methods for channeling and shaping raw mana.',
        cost: 1111,
        effect: () => { manaPerClick *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-theory').isPurchased && upgrades.find(u => u.id === 'magic-sight').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'ley-lines',
        name: 'Ley Lines',
        description: 'Unlocks the Ley Line building.',
        flavorText: 'Tap into the ancient rivers of magic that flow beneath the earth.',
        cost: 500,
        effect: () => { const b = buildings.find(b => b.id === 'ley-line'); if(b) b.isUnlocked = true; },
        isPurchased: false,
        unlockCondition: () => true,
        isUnlocked: true,
        element: null
    },
    {
        id: 'invocation',
        name: 'Invocation',
        description: 'Doubles Magus production.',
        flavorText: 'Call upon greater powers to amplify your magical workings.',
        cost: 25000,
        effect: () => { const m = buildings.find(b => b.id === 'magus'); if(m) m.productionPerSecond *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'prestidigitation').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'blood-magic',
        name: 'Blood Magic',
        description: 'Doubles Magus production.',
        flavorText: 'A forbidden art that draws power from life force itself.',
        cost: 1000000,
        effect: () => { const m = buildings.find(b => b.id === 'magus'); if(m) m.productionPerSecond *= 2; },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'magic-schools').isPurchased &&
            upgrades.find(u => u.id === 'abjuration').isPurchased &&
            upgrades.find(u => u.id === 'conjuration').isPurchased &&
            upgrades.find(u => u.id === 'evocation').isPurchased &&
            upgrades.find(u => u.id === 'enchantment').isPurchased &&
            upgrades.find(u => u.id === 'illusion').isPurchased &&
            upgrades.find(u => u.id === 'necromancy').isPurchased &&
            upgrades.find(u => u.id === 'summoning').isPurchased &&
            upgrades.find(u => u.id === 'transmutation').isPurchased &&
            upgrades.find(u => u.id === 'prestidigitation').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-touched',
        name: 'Mana-Touched',
        description: 'Gain +1 bonus prestige level and +2% Mana per second.',
        flavorText: 'The mana has begun to seep into your very being.',
        cost: 1000000000000000,
        effect: () => { PrestigeModule.addBonusPrestigeLevel(1); mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => mana >= 1000000000000,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-drenched',
        name: 'Mana-Drenched',
        description: 'Gain +1 bonus prestige level and +2% Mana per second.',
        flavorText: 'You are saturated with arcane energy.',
        cost: 1000000000000000,
        effect: () => { PrestigeModule.addBonusPrestigeLevel(1); mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'mana-touched').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-gorged',
        name: 'Mana-Gorged',
        description: 'Gain +1 bonus prestige level and +2% Mana per second.',
        flavorText: 'You have consumed more mana than any mortal should.',
        cost: 1000000000000000,
        effect: () => { PrestigeModule.addBonusPrestigeLevel(1); mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'mana-drenched').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-warped',
        name: 'Mana-Warped',
        description: 'Gain +1 bonus prestige level and +2% Mana per second.',
        flavorText: 'The mana has changed you, reshaping your essence.',
        cost: 1000000000000000,
        effect: () => { PrestigeModule.addBonusPrestigeLevel(1); mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'mana-gorged').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'mana-empowered',
        name: 'Mana-Empowered',
        description: 'Gain +1 bonus prestige level and +2% Mana per second.',
        flavorText: 'Raw magical power courses through your veins.',
        cost: 1000000000000000,
        effect: () => { PrestigeModule.addBonusPrestigeLevel(1); mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'mana-warped').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'one-with-the-weave',
        name: 'One With The Weave',
        description: 'Gain +1 bonus prestige level and +2% Mana per second.',
        flavorText: 'You have become one with the fabric of magic itself.',
        cost: 1000000000000000,
        effect: () => { PrestigeModule.addBonusPrestigeLevel(1); mpsUpgradeMultiplier *= 1.02; recalculateMPS(); },
        isPurchased: false,
        unlockCondition: () => upgrades.find(u => u.id === 'mana-empowered').isPurchased,
        isUnlocked: false,
        element: null
    },
    {
        id: 'reinforced-ley-lines',
        name: 'Reinforced Ley Lines',
        description: 'Ley Lines are twice as effective.',
        flavorText: 'Withdraw more Mana with these reinforcements to your Ley Lines.',
        cost: 11550,
        effect: () => { const ll = buildings.find(b => b.id === 'ley-line'); if(ll) ll.productionPerSecond *= 2; },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'ley-line').owned >= 1,
        isUnlocked: false,
        element: null
    },
    {
        id: 'refinement-process',
        name: 'Refinement Process',
        description: 'Mana Crystals are twice as effective.',
        flavorText: 'Enhance your refinement techniques to make more Mana Crystals.',
        cost: 45000,
        effect: () => { const mc = buildings.find(b => b.id === 'mana-crystal'); if(mc) mc.productionPerSecond *= 2; },
        isPurchased: false,
        unlockCondition: () => buildings.find(b => b.id === 'mana-crystal').owned >= 1,
        isUnlocked: false,
        element: null
    },
    {
        id: 'wishing-well',
        name: 'Wishing Well',
        description: 'Unlock the Wishing Well, an upgradeable fortune-mechanic.',
        flavorText: 'Toss a coin, for a chance at...',
        cost: 25000,
        effect: () => { WishingWellModule.unlock(); },
        isPurchased: false,
        unlockCondition: () => mana >= 50000,
        isUnlocked: false,
        element: null
    },
    // === INSERT NEW UPGRADES HERE ===
];

// --- Helper Functions ---
function getBuildingCurrentCost(building) {
    // Exponential cost increase: baseCost * 1.15^owned
    return building.baseCost * Math.pow(1.15, building.owned);
}

// Recalculate total MPS from all buildings (call after upgrades modify production rates)
function recalculateMPS() {
    let baseMPS = 0;
    buildings.forEach(building => {
        baseMPS += building.productionPerSecond * building.owned;
    });
    manaPerSecond = baseMPS * mpsUpgradeMultiplier;

    // Update Production panel with MPS bonus and multiplier
    const mpsBonus = baseMPS * (mpsUpgradeMultiplier - 1);
    ProductionModule.setMPSFromUpgrades(mpsBonus);
    ProductionModule.setMPSMultiplier(mpsUpgradeMultiplier);
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

    manaDisplay.textContent = `${OptionsModule.formatNumber(Math.floor(mana))} Mana`;
    if (prestigeBonus > 0) {
        mpsDisplay.textContent = `${OptionsModule.formatNumber(effectiveMPS)} MPS (+${prestigeBonus}%)`;
    } else {
        mpsDisplay.textContent = `${OptionsModule.formatNumber(effectiveMPS)} MPS`;
    }
    mpcDisplay.textContent = `${OptionsModule.formatNumber(Math.floor(manaPerClick))} per click`;
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
        recalculateMPS();
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
        <p class="building-cost">Cost: <span class="cost-value">${OptionsModule.formatNumber(Math.floor(getBuildingCurrentCost(building)))}</span> Mana</p>
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
    building.element.querySelector('.building-cost .cost-value').textContent = OptionsModule.formatNumber(Math.floor(getBuildingCurrentCost(building)));
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

    // Check Wishing Well button visibility
    updateWishingWellButton();
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
        // Recalculate MPS in case upgrade modified building production
        recalculateMPS();
        // Track mana per click from upgrades
        manaPerClickFromUpgrades = manaPerClick - baseManaPerClick;
        ProductionModule.setManaPerClickFromUpgrades(manaPerClickFromUpgrades);
        updateUpgradeDisplay(upgrade);
        renderBuildings(); // Re-render buildings in case upgrade unlocked one
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
        <p class="upgrade-cost">Cost: <span class="cost-value">${OptionsModule.formatNumber(Math.floor(upgrade.cost))}</span> Mana</p>
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
        upgrade.element.querySelector('.upgrade-cost .cost-value').textContent = OptionsModule.formatNumber(Math.floor(upgrade.cost));
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
        'wishing-well-button': document.getElementById('wishing-well-panel'),
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

// Check if Wishing Well button should be visible
function updateWishingWellButton() {
    const wishingWellUpgrade = upgrades.find(u => u.id === 'wishing-well');
    const wishingWellButton = document.getElementById('wishing-well-button');
    if (wishingWellButton && wishingWellUpgrade && wishingWellUpgrade.isPurchased) {
        wishingWellButton.style.display = '';
    }
}

// --- Game Loop and Initialization ---
gatherManaButton.addEventListener('click', gatherMana);

// Calculate effective MPS with prestige bonus
function getEffectiveMPS() {
    return manaPerSecond * PrestigeModule.getPrestigeMultiplier();
}

function gameLoop() {
    // Skip production if in prestige mode
    if (PrestigeModule.isPrestigeMode()) {
        return;
    }

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

    // Update prestige display (for countdown timers)
    PrestigeModule.updateDisplay();

    updateDisplay();
}

// Reset game for prestige ascension (keeps prestige data and total mana stat)
function resetForPrestige() {
    // Reset game state
    mana = 0;
    manaPerClick = 1;
    manaPerSecond = 0;
    baseManaPerClick = 1;
    manaPerClickFromUpgrades = 0;
    mpsFromUpgrades = 0;
    mpsUpgradeMultiplier = 1;

    // Reset buildings
    buildings.forEach(building => {
        building.owned = 0;
        building.productionPerSecond = building.baseProduction;
        building.isUnlocked = false;
        building.element = null;
    });
    // Ensure first building is unlocked
    const firstBuilding = buildings.find(b => b.id === 'wizards-hand');
    if (firstBuilding) firstBuilding.isUnlocked = true;

    // Apply prestige building boosts
    PrestigeModule.applyAllPrestigeBuildingBoosts();

    // Reset upgrades
    upgrades.forEach(upgrade => {
        upgrade.isPurchased = false;
        upgrade.isUnlocked = false;
        upgrade.element = null;
    });
    // Ensure starting upgrades are unlocked
    const startingUpgrades = ['magic-theory', 'magic-sight', 'magic-schools', 'ley-lines'];
    startingUpgrades.forEach(id => {
        const upgrade = upgrades.find(u => u.id === id);
        if (upgrade) upgrade.isUnlocked = true;
    });

    // Clear purchased upgrades container
    purchasedUpgradesContainer.innerHTML = '';

    // Reset statistics but keep total mana
    StatisticsModule.resetForPrestige();

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

// Display version in title
document.getElementById('game-title').textContent = 'MagicTap, V.' + VERSION;
document.title = 'MagicTap, V.' + VERSION;

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
