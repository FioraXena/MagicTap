// Achievements Module
const AchievementsModule = (function() {
    const achievements = [
        {
            id: 'first-mana',
            name: 'First Spark',
            description: 'Gather your first mana.',
            condition: (stats) => stats.manaTotal >= 1,
            isEarned: false
        },
        {
            id: 'hundred-mana',
            name: 'Mana Collector',
            description: 'Gather 100 mana total.',
            condition: (stats) => stats.manaTotal >= 100,
            isEarned: false
        },
        {
            id: 'first-building',
            name: 'Apprentice Builder',
            description: 'Purchase your first building.',
            condition: (stats) => stats.totalBuildingsOwned >= 1,
            isEarned: false
        },
        {
            id: 'first-upgrade',
            name: 'Student of Magic',
            description: 'Purchase your first upgrade.',
            condition: (stats) => stats.upgradesPurchased >= 1,
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

    return {
        getHTML,
        renderAchievements,
        checkAchievements,
        getEarnedCount,
        getAchievements
    };
})();
