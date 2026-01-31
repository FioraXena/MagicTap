// Wizard Rank Module - Magic Proficiency System
const WizardRankModule = (function() {
    // Rank thresholds (25-achievement increments)
    const ranks = [
        { name: 'Mana-Blind', minAchievements: 0 },
        { name: 'Initiate', minAchievements: 25 },
        { name: 'Novice', minAchievements: 50 },
        { name: 'Apprentice', minAchievements: 75 },
        { name: 'Journeyman', minAchievements: 100 },
        { name: 'Adept', minAchievements: 125 },
        // New ranks between Adept and Dark Magician
        { name: 'Sorcerer', minAchievements: 150 },
        { name: 'Witch', minAchievements: 175 },
        { name: 'Warlock', minAchievements: 200 },
        { name: 'Enchanter', minAchievements: 225 },
        { name: 'Wizard', minAchievements: 250 },
        { name: 'Magician', minAchievements: 275 },
        { name: 'Dark Magician', minAchievements: 300 },
        { name: 'White Magician', minAchievements: 325 },
        // New ranks between White Magician and Magus
        { name: 'Conjurer', minAchievements: 350 },
        { name: 'Enchantress', minAchievements: 375 },
        { name: 'Abjurer', minAchievements: 400 },
        { name: 'Illusionist', minAchievements: 425 },
        { name: 'Transmuter', minAchievements: 450 },
        { name: 'Alchemist', minAchievements: 475 },
        { name: 'Summoner', minAchievements: 500 },
        { name: 'Necromancer', minAchievements: 525 },
        { name: 'Evoker', minAchievements: 550 },
        { name: 'Magus', minAchievements: 575 },
        { name: 'Fire Magus', minAchievements: 600 },
        { name: 'Water Magus', minAchievements: 625 },
        { name: 'Air Magus', minAchievements: 650 },
        { name: 'Earth Magus', minAchievements: 675 },
        { name: 'Ice Magus', minAchievements: 700 },
        { name: 'Stone Magus', minAchievements: 725 },
        { name: 'Lightning Magus', minAchievements: 750 },
        // New rank: Plant Magus
        { name: 'Plant Magus', minAchievements: 775 },
        { name: 'Mind Magus', minAchievements: 800 },
        { name: 'Metal Magus', minAchievements: 825 },
        { name: 'Solar Magus', minAchievements: 850 },
        { name: 'Lunar Magus', minAchievements: 875 },
        { name: 'Astral Magus', minAchievements: 900 },
        // New ranks: Life Magus, Death Magus
        { name: 'Life Magus', minAchievements: 925 },
        { name: 'Death Magus', minAchievements: 950 },
        { name: 'Light Magus', minAchievements: 975 },
        { name: 'Dark Magus', minAchievements: 1000 },
        { name: 'White Magus', minAchievements: 1025 },
        { name: 'Black Magus', minAchievements: 1050 },
        { name: 'Silver Magus', minAchievements: 1075 },
        { name: 'Gold Magus', minAchievements: 1100 },
        { name: 'Arch Magus', minAchievements: 1125 },
        { name: 'Grand Magus', minAchievements: 1150 },
        { name: 'Void Magus', minAchievements: 1175 },
        { name: 'Archmage', minAchievements: 1200 },
        { name: 'Arcane Weaver', minAchievements: 1225 },
        // New ranks: Grand Weaver, True Weaver
        { name: 'Grand Weaver', minAchievements: 1250 },
        { name: 'True Weaver', minAchievements: 1275 },
        { name: 'Eldritch', minAchievements: 1300 },
        { name: 'Deity', minAchievements: 1325 },
        { name: 'Living Spell', minAchievements: 1350 },
        { name: 'True Arcana', minAchievements: 1375 },
        { name: 'Basic Cheater?', minAchievements: 1400 },
        { name: 'Completionist', minAchievements: 1425 }
    ];

    // Calculate Magic Proficiency (4% per achievement)
    function getMagicProficiency() {
        const achievementCount = AchievementsModule.getEarnedCount();
        return achievementCount * 4;
    }

    // Get current rank based on achievements earned
    function getCurrentRank() {
        const achievementCount = AchievementsModule.getEarnedCount();
        let currentRank = ranks[0];

        for (let i = ranks.length - 1; i >= 0; i--) {
            if (achievementCount >= ranks[i].minAchievements) {
                currentRank = ranks[i];
                break;
            }
        }

        return currentRank;
    }

    // Get next rank (for progress display)
    function getNextRank() {
        const achievementCount = AchievementsModule.getEarnedCount();

        for (let i = 0; i < ranks.length; i++) {
            if (achievementCount < ranks[i].minAchievements) {
                return ranks[i];
            }
        }

        return null; // Max rank reached
    }

    // Get progress to next rank
    function getProgressToNextRank() {
        const achievementCount = AchievementsModule.getEarnedCount();
        const currentRank = getCurrentRank();
        const nextRank = getNextRank();

        if (!nextRank) {
            return { current: achievementCount, needed: achievementCount, percent: 100 };
        }

        const currentMin = currentRank.minAchievements;
        const nextMin = nextRank.minAchievements;
        const progress = achievementCount - currentMin;
        const total = nextMin - currentMin;
        const percent = Math.floor((progress / total) * 100);

        return {
            current: achievementCount,
            needed: nextMin,
            remaining: nextMin - achievementCount,
            percent: percent
        };
    }

    // Update the rank display
    function updateDisplay() {
        const rankNameEl = document.getElementById('wizard-rank-name');
        const proficiencyEl = document.getElementById('magic-proficiency');
        const progressEl = document.getElementById('rank-progress');

        const currentRank = getCurrentRank();
        const proficiency = getMagicProficiency();
        const progress = getProgressToNextRank();
        const nextRank = getNextRank();

        if (rankNameEl) {
            rankNameEl.textContent = currentRank.name;
        }

        if (proficiencyEl) {
            proficiencyEl.textContent = proficiency + '%';
        }

        if (progressEl) {
            if (nextRank) {
                progressEl.textContent = progress.remaining + ' achievements until ' + nextRank.name;
            } else {
                progressEl.textContent = 'Maximum rank achieved!';
            }
        }
    }

    // Get all ranks (for display purposes)
    function getAllRanks() {
        return ranks;
    }

    return {
        getMagicProficiency,
        getCurrentRank,
        getNextRank,
        getProgressToNextRank,
        updateDisplay,
        getAllRanks
    };
})();
