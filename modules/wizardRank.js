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
        { name: 'Dark Magician', minAchievements: 150 },
        { name: 'White Magician', minAchievements: 175 },
        { name: 'Magus', minAchievements: 200 },
        { name: 'Fire Magus', minAchievements: 225 },
        { name: 'Water Magus', minAchievements: 250 },
        { name: 'Air Magus', minAchievements: 275 },
        { name: 'Earth Magus', minAchievements: 300 },
        { name: 'Ice Magus', minAchievements: 325 },
        { name: 'Stone Magus', minAchievements: 350 },
        { name: 'Lightning Magus', minAchievements: 375 },
        { name: 'Mind Magus', minAchievements: 400 },
        { name: 'Metal Magus', minAchievements: 425 },
        { name: 'Solar Magus', minAchievements: 450 },
        { name: 'Lunar Magus', minAchievements: 475 },
        { name: 'Astral Magus', minAchievements: 500 },
        { name: 'Light Magus', minAchievements: 525 },
        { name: 'Dark Magus', minAchievements: 550 },
        { name: 'White Magus', minAchievements: 575 },
        { name: 'Black Magus', minAchievements: 600 },
        { name: 'Silver Magus', minAchievements: 625 },
        { name: 'Gold Magus', minAchievements: 650 },
        { name: 'Arch Magus', minAchievements: 675 },
        { name: 'Grand Magus', minAchievements: 700 },
        { name: 'Void Magus', minAchievements: 725 },
        { name: 'Archmage', minAchievements: 750 },
        { name: 'Arcane Weaver', minAchievements: 775 },
        { name: 'Eldritch', minAchievements: 800 },
        { name: 'Deity', minAchievements: 825 },
        { name: 'Living Spell', minAchievements: 850 },
        { name: 'True Arcana', minAchievements: 875 },
        { name: 'Basic Cheater?', minAchievements: 900 },
        { name: 'Completionist', minAchievements: 925 }
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
