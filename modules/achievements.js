// Achievements Module
const AchievementsModule = (function() {
    const achievements = [
        {
        id: 'drop-in-the-bucket',
        name: 'Drop In The Bucket',
        description: 'Gather 1 mana',
        condition: (stats) => stats.currentMana >= 1,
        isEarned: false
    },
        {
        id: 'mana-to-spare',
        name: 'Mana To Spare',
        description: 'Have 100 current Mana.',
        condition: (stats) => stats.currentMana >= 100,
        isEarned: false
    },
        {
        id: 'three-hands',
        name: 'Three Hands',
        description: 'Purchase 3 Wizard\'s Hands.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 3,
        isEarned: false
    },
        {
        id: 'start-your-studies',
        name: 'Start Your Studies!',
        description: 'Purchase Magic Theory.',
        condition: (stats) => upgrades.find(u => u.id === 'magic-theory').isPurchased,
        isEarned: false
    },
    {
        id: 'many-hands',
        name: 'Many Hands',
        description: 'Purchase 25 Wizard\'s Hands.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 25,
        isEarned: false
    }
    ];

    let earnedCount = 0;

    function showNotification(achievementName) {
        const notificationArea = document.getElementById('notification-area');
        if (!notificationArea) return;

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.setAttribute('role', 'alert');

        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'notification-dismiss';
        dismissBtn.setAttribute('aria-label', 'Dismiss notification');
        dismissBtn.textContent = 'X';
        dismissBtn.addEventListener('click', () => {
            notification.remove();
        });

        const title = document.createElement('p');
        title.className = 'notification-title';
        title.textContent = 'New Achievement!';

        const content = document.createElement('p');
        content.className = 'notification-content';
        content.textContent = achievementName;

        notification.appendChild(dismissBtn);
        notification.appendChild(title);
        notification.appendChild(content);

        notificationArea.prepend(notification);
    }

    function getHTML() {
        return `
        <section id="achievements-panel" class="game-panel" hidden>
            <h2 id="achievements-heading" tabindex="-1">Achievements</h2>
            <p id="achievements-count" aria-live="polite">Achievements Earned: <span>0</span></p>
            <div id="achievements-container" aria-labelledby="achievements-heading">
                <ul id="achievements-list" class="achievements-list"></ul>
            </div>
        </section>`;
    }

    function renderAchievements() {
        const list = document.getElementById('achievements-list');
        if (!list) return;

        list.innerHTML = '';
        achievements.forEach(achievement => {
            if (achievement.isEarned) {
                const li = document.createElement('li');
                li.className = 'achievement-item earned';
                li.innerHTML = `
                    <span class="achievement-name">${achievement.name}</span>
                    <span class="achievement-description">${achievement.description}</span>
                `;
                list.appendChild(li);
            }
        });

        document.querySelector('#achievements-count span').textContent = earnedCount;
    }

    function checkAchievements(stats) {
        let newAchievements = false;
        achievements.forEach(achievement => {
            if (!achievement.isEarned && achievement.condition(stats)) {
                achievement.isEarned = true;
                earnedCount++;
                newAchievements = true;
                StatisticsModule.addAchievementEarned();
                showNotification(achievement.name);
            }
        });

        if (newAchievements) {
            renderAchievements();
        }
    }

    function getEarnedCount() {
        return earnedCount;
    }

    function getAchievements() {
        return achievements;
    }

    function loadAchievements(savedAchievements) {
        if (savedAchievements) {
            earnedCount = 0;
            savedAchievements.forEach(savedAch => {
                const achievement = achievements.find(a => a.id === savedAch.id);
                if (achievement) {
                    achievement.isEarned = savedAch.isEarned || false;
                    if (achievement.isEarned) {
                        earnedCount++;
                    }
                }
            });
        }
    }

    function reset() {
        earnedCount = 0;
        achievements.forEach(achievement => {
            achievement.isEarned = false;
        });
    }

    return {
        getHTML,
        renderAchievements,
        checkAchievements,
        getEarnedCount,
        getAchievements,
        loadAchievements,
        reset
    };
})();
