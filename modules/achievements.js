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
        description: 'Purchase 1 Wizard\'s Hand.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 1,
        isEarned: false
    },
        {
        id: 'magic-sight',
        name: 'Magic Sight',
        description: 'Purchase 1 Wizard\'s Eye.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-eye').owned >= 1,
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
        name: 'Many Hands Make Light Work',
        description: 'Purchase 25 Wizard\'s Hands.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 25,
        isEarned: false
    },
    {
        id: 'thats-handy',
        name: 'That\'s Handy',
        description: 'Purchase 50 Wizard\'s Hands.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 50,
        isEarned: false
    },
    {
        id: 'hundred-handed',
        name: 'Hundred-Handed',
        description: 'Purchase 100 Wizard\'s Hands.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 100,
        isEarned: false
    },
    {
        id: 'whos-hand-is-that',
        name: 'Who\'s Hand Is That?',
        description: 'Purchase 200 Wizard\'s Hands.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 200,
        isEarned: false
    },
    {
        id: 'out-of-hand',
        name: 'Out Of Hand',
        description: 'Purchase 500 Wizard\'s Hands.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 500,
        isEarned: false
    },
    {
        id: 'see-no-evil',
        name: 'See No Evil',
        description: 'Purchase 25 Wizard\'s Eyes.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-eye').owned >= 25,
        isEarned: false
    },
    {
        id: 'spectral-sight',
        name: 'Spectral Sight',
        description: 'Purchase 50 Wizard\'s Eyes.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-eye').owned >= 50,
        isEarned: false
    },
    {
        id: 'perfect-point-of-view',
        name: 'Perfect Point Of View',
        description: 'Purchase 100 Wizard\'s Eyes.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-eye').owned >= 100,
        isEarned: false
    },
    {
        id: 'disturbing-amount-of-eyes',
        name: 'Disturbing Amount of Eyes',
        description: 'Purchase 200 Wizard\'s Eyes.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-eye').owned >= 200,
        isEarned: false
    },
    {
        id: 'all-seeing',
        name: 'All-Seeing',
        description: 'Purchase 500 Wizard\'s Eyes.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-eye').owned >= 500,
        isEarned: false
    },
    {
        id: 'new-hire',
        name: 'New Hire',
        description: 'Purchase 1 Magus.',
        condition: (stats) => buildings.find(b => b.id === 'magus').owned >= 1,
        isEarned: false
    },
    {
        id: 'hiring-spree',
        name: 'Hiring Spree',
        description: 'Purchase 25 Magi.',
        condition: (stats) => buildings.find(b => b.id === 'magus').owned >= 25,
        isEarned: false
    },
    {
        id: 'magic-community',
        name: 'Magic Community',
        description: 'Purchase 50 Magi.',
        condition: (stats) => buildings.find(b => b.id === 'magus').owned >= 50,
        isEarned: false
    },
    {
        id: 'it-takes-a-village',
        name: 'It Takes A Village',
        description: 'Purchase 100 Magi.',
        condition: (stats) => buildings.find(b => b.id === 'magus').owned >= 100,
        isEarned: false
    },
    {
        id: 'small-town-of-magic',
        name: 'Small Town of Magic',
        description: 'Purchase 200 Magi.',
        condition: (stats) => buildings.find(b => b.id === 'magus').owned >= 200,
        isEarned: false
    },
    {
        id: 'conclave-of-the-magi',
        name: 'Conclave of the Magi',
        description: 'Purchase 500 Magi.',
        condition: (stats) => buildings.find(b => b.id === 'magus').owned >= 500,
        isEarned: false
    },
    {
        id: 'glowing-with-power',
        name: 'Glowing With Power',
        description: 'Have 1,000 current Mana.',
        condition: (stats) => stats.currentMana >= 1000,
        isEarned: false
    },
    {
        id: 'ask-the-magic-8-ball',
        name: 'Ask The Magic 8-Ball',
        description: 'Have 7,777 current Mana.',
        condition: (stats) => stats.currentMana >= 7777,
        isEarned: false
    },
    {
        id: 'flooding-the-ley-lines',
        name: 'Flooding the Ley Lines',
        description: 'Have 10,000 current Mana.',
        condition: (stats) => stats.currentMana >= 10000,
        isEarned: false
    },
    {
        id: 'magic-adept',
        name: 'Magic Adept',
        description: 'Have 100,000 current Mana.',
        condition: (stats) => stats.currentMana >= 100000,
        isEarned: false
    },
    {
        id: 'mr-million-mana',
        name: 'Mr. Million Mana',
        description: 'Have 1,000,000 current Mana.',
        condition: (stats) => stats.currentMana >= 1000000,
        isEarned: false
    },
    {
        id: 'mana-powered-universe',
        name: 'Mana-Powered Universe',
        description: 'Have 10,000,000 current Mana.',
        condition: (stats) => stats.currentMana >= 10000000,
        isEarned: false
    },
    {
        id: 'overruled-by-magic',
        name: 'Overruled By Magic',
        description: 'Have 100,000,000 current Mana.',
        condition: (stats) => stats.currentMana >= 100000000,
        isEarned: false
    },
    {
        id: 'arcana-through-the-ages',
        name: 'Arcana Through The Ages',
        description: 'Have 1,000,000,000 current Mana.',
        condition: (stats) => stats.currentMana >= 1000000000,
        isEarned: false
    },
    {
        id: 'tap-to-gather',
        name: 'Tap To Gather',
        description: 'Gather 1 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 1,
        isEarned: false
    },
    {
        id: 'we-all-click',
        name: 'We All Click',
        description: 'Gather 100 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 100,
        isEarned: false
    },
    {
        id: 'magic-hands',
        name: 'Magic Hands',
        description: 'Gather 1,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 1000,
        isEarned: false
    },
    {
        id: 'are-you-actually-clicking-this-much',
        name: 'Are You Actually Clicking This Much?',
        description: 'Gather 10,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 10000,
        isEarned: false
    },
    {
        id: 'tap-to-continue-gathering',
        name: 'Tap To Continue Gathering',
        description: 'Gather 100,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 100000,
        isEarned: false
    },
    {
        id: 'mind-numbing-mana-activity',
        name: 'Mind-Numbing Mana Activity',
        description: 'Gather 1,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 1000000,
        isEarned: false
    },
    {
        id: 'autoclicker',
        name: 'Autoclicker',
        description: 'Gather 10,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 10000000,
        isEarned: false
    },
    {
        id: 'gatherer',
        name: 'Gatherer',
        description: 'Gather 100,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 100000000,
        isEarned: false
    },
    {
        id: 'mana-collector',
        name: 'Mana Collector',
        description: 'Gather 1,000,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 1000000000,
        isEarned: false
    },
    {
        id: 'mana-hoarder',
        name: 'Mana Hoarder',
        description: 'Gather 10,000,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 10000000000,
        isEarned: false
    },
    {
        id: 'what-do-you-even-need-this-much-for',
        name: 'What Do You Even Need This Much For?',
        description: 'Gather 100,000,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 100000000000,
        isEarned: false
    },
    {
        id: 'magictapped-a-lot-of-mana',
        name: 'MagicTapped A Lot Of Mana',
        description: 'Gather 1,000,000,000,000 Mana by clicking.',
        condition: (stats) => stats.manaByClick >= 1000000000000,
        isEarned: false
    },
    {
        id: 'schools-in-session',
        name: 'School\'s In Session',
        description: 'Purchase the Magic Schools upgrade.',
        condition: (stats) => upgrades.find(u => u.id === 'magic-schools').isPurchased,
        isEarned: false
    },
    {
        id: 'you-finished-the-tutorial',
        name: 'You Finished The Tutorial!',
        description: 'Purchase all magic school upgrades.',
        condition: (stats) => upgrades.find(u => u.id === 'magic-schools').isPurchased &&
            upgrades.find(u => u.id === 'abjuration').isPurchased &&
            upgrades.find(u => u.id === 'conjuration').isPurchased &&
            upgrades.find(u => u.id === 'evocation').isPurchased &&
            upgrades.find(u => u.id === 'enchantment').isPurchased &&
            upgrades.find(u => u.id === 'illusion').isPurchased &&
            upgrades.find(u => u.id === 'necromancy').isPurchased &&
            upgrades.find(u => u.id === 'summoning').isPurchased &&
            upgrades.find(u => u.id === 'transmutation').isPurchased &&
            upgrades.find(u => u.id === 'prestidigitation').isPurchased,
        isEarned: false
    },
    {
        id: 'take-a-sip',
        name: 'Take A Sip',
        description: 'Purchase 1 Ley Line.',
        condition: (stats) => buildings.find(b => b.id === 'ley-line').owned >= 1,
        isEarned: false
    },
    {
        id: 'just-a-little-taste',
        name: 'Just A Little Taste',
        description: 'Purchase 25 Ley Lines.',
        condition: (stats) => buildings.find(b => b.id === 'ley-line').owned >= 25,
        isEarned: false
    },
    {
        id: 'drink-your-fill',
        name: 'Drink Your Fill',
        description: 'Purchase 50 Ley Lines.',
        condition: (stats) => buildings.find(b => b.id === 'ley-line').owned >= 50,
        isEarned: false
    },
    {
        id: 'quench-your-thirst',
        name: 'Quench Your Thirst',
        description: 'Purchase 100 Ley Lines.',
        condition: (stats) => buildings.find(b => b.id === 'ley-line').owned >= 100,
        isEarned: false
    },
    {
        id: 'vampiric-magic',
        name: 'Vampiric Magic',
        description: 'Purchase 200 Ley Lines.',
        condition: (stats) => buildings.find(b => b.id === 'ley-line').owned >= 200,
        isEarned: false
    },
    {
        id: 'drain-the-planet-dry',
        name: 'Drain The Planet Dry',
        description: 'Purchase 500 Ley Lines.',
        condition: (stats) => buildings.find(b => b.id === 'ley-line').owned >= 500,
        isEarned: false
    },
    {
        id: 'handicraft',
        name: 'Handicraft',
        description: 'Purchase 1,000 Wizard\'s Hands.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-hand').owned >= 1000,
        isEarned: false
    },
    {
        id: 'arcane-visionary',
        name: 'Arcane Visionary',
        description: 'Purchase 1,000 Wizard\'s Eyes.',
        condition: (stats) => buildings.find(b => b.id === 'wizards-eye').owned >= 1000,
        isEarned: false
    },
    {
        id: 'mage-of-many-talents',
        name: 'Mage Of Many Talents',
        description: 'Purchase 1,000 Magi.',
        condition: (stats) => buildings.find(b => b.id === 'magus').owned >= 1000,
        isEarned: false
    },
    {
        id: 'mana-desert',
        name: 'Mana Desert',
        description: 'Purchase 1,000 Ley Lines.',
        condition: (stats) => buildings.find(b => b.id === 'ley-line').owned >= 1000,
        isEarned: false
    },
    {
        id: 'refined',
        name: 'Refined',
        description: 'Purchase 1 Mana Crystal.',
        condition: (stats) => buildings.find(b => b.id === 'mana-crystal').owned >= 1,
        isEarned: false
    },
    {
        id: 'crystallize',
        name: 'Crystallize',
        description: 'Purchase 25 Mana Crystals.',
        condition: (stats) => buildings.find(b => b.id === 'mana-crystal').owned >= 25,
        isEarned: false
    },
    {
        id: 'tangible',
        name: 'Tangible',
        description: 'Purchase 50 Mana Crystals.',
        condition: (stats) => buildings.find(b => b.id === 'mana-crystal').owned >= 50,
        isEarned: false
    },
    {
        id: 'arcane-forger',
        name: 'Arcane Forger',
        description: 'Purchase 100 Mana Crystals.',
        condition: (stats) => buildings.find(b => b.id === 'mana-crystal').owned >= 100,
        isEarned: false
    },
    {
        id: 'you-cant-prestige-with-these',
        name: 'You Can\'t Prestige With These',
        description: 'Purchase 200 Mana Crystals.',
        condition: (stats) => buildings.find(b => b.id === 'mana-crystal').owned >= 200,
        isEarned: false
    },
    {
        id: 'wrong-currency',
        name: 'Wrong Currency',
        description: 'Purchase 500 Mana Crystals.',
        condition: (stats) => buildings.find(b => b.id === 'mana-crystal').owned >= 500,
        isEarned: false
    },
    {
        id: 'glittering-arcana',
        name: 'Glittering Arcana',
        description: 'Purchase 1,000 Mana Crystals.',
        condition: (stats) => buildings.find(b => b.id === 'mana-crystal').owned >= 1000,
        isEarned: false
    },
    {
        id: 'suit-and-tie',
        name: 'Suit And Tie',
        description: 'Purchase all Apparel upgrades.',
        condition: (stats) =>
            upgrades.find(u => u.id === 'wizards-cape').isPurchased &&
            upgrades.find(u => u.id === 'wizards-staff').isPurchased &&
            upgrades.find(u => u.id === 'witchs-broom').isPurchased &&
            upgrades.find(u => u.id === 'wizards-hat').isPurchased &&
            upgrades.find(u => u.id === 'wizards-mantle').isPurchased &&
            upgrades.find(u => u.id === 'enchanted-amulet').isPurchased &&
            upgrades.find(u => u.id === 'warding-ring').isPurchased &&
            upgrades.find(u => u.id === 'magic-wand').isPurchased &&
            upgrades.find(u => u.id === 'ancient-scroll').isPurchased &&
            upgrades.find(u => u.id === 'magic-monocle').isPurchased &&
            upgrades.find(u => u.id === 'crystal-ball').isPurchased,
        isEarned: false
    },
    // === INSERT NEW ACHIEVEMENTS HERE ===
    ];

    let earnedCount = 0;

    function updateDismissAllButton() {
        const notificationArea = document.getElementById('notification-area');
        if (!notificationArea) return;

        const notifications = notificationArea.querySelectorAll('.notification');
        let dismissAllBtn = document.getElementById('dismiss-all-notifications');

        if (notifications.length >= 3) {
            if (!dismissAllBtn) {
                dismissAllBtn = document.createElement('button');
                dismissAllBtn.id = 'dismiss-all-notifications';
                dismissAllBtn.className = 'dismiss-all-button';
                dismissAllBtn.setAttribute('aria-label', 'Dismiss all notifications');
                dismissAllBtn.textContent = 'Dismiss All';
                dismissAllBtn.addEventListener('click', () => {
                    const allNotifications = notificationArea.querySelectorAll('.notification');
                    allNotifications.forEach(n => n.remove());
                    dismissAllBtn.remove();
                });
                notificationArea.prepend(dismissAllBtn);
            }
        } else if (dismissAllBtn) {
            dismissAllBtn.remove();
        }
    }

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
            updateDismissAllButton();
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
        updateDismissAllButton();
    }

    function getHTML() {
        return `
        <section id="achievements-panel" class="game-panel" hidden>
            <h2 id="achievements-heading" tabindex="-1">Achievements</h2>
            <div id="wizard-rank-display" class="wizard-rank-section">
                <p><strong>Wizard Rank:</strong> <span id="wizard-rank-name">Mana-Blind</span></p>
                <p><strong>Magic Proficiency:</strong> <span id="magic-proficiency">0%</span></p>
                <p id="rank-progress">25 achievements until Initiate</p>
            </div>
            <p id="achievements-count">Achievements Earned: <span>0</span></p>
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

        // Update wizard rank display
        if (typeof WizardRankModule !== 'undefined') {
            WizardRankModule.updateDisplay();
        }
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
