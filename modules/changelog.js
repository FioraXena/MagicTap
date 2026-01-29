// Changelog Module
const ChangelogModule = (function() {
    const changelog = [
        {
            version: '0.03',
            changes: [
                'Added Prestige system with Mana Crystals.',
                'Added Prestige Store with purchasable upgrades.',
                'Added Spell Core prestige upgrade (+5% MPS).',
                'Added new building: Magus.',
                'Added Arcane Focus and Components\' Pouch upgrades.',
                'Added Magic Fingers upgrade line (10 levels).',
                'Added 9 magic school upgrades (Abjuration, Conjuration, etc.).',
                'Prestige unlocks at 1 billion Mana gathered.',
                'Each Mana Crystal grants +1% production bonus.'
            ]
        },
        {
            version: '0.02',
            changes: [
                'Added save system with auto-save, manual save/load, and export/import.',
                'Added ability to reset progress in Options.',
                'Added new building: Wizard\'s Eye.',
                'Added new upgrades: Magic Sight and Arcane Tap.',
                'Renamed achievements for clarity.'
            ]
        },
        {
            version: '0.01',
            changes: [
                'Initial release.'
            ]
        }
    ];

    function getHTML() {
        return `
        <section id="changelog-panel" class="game-panel" hidden>
            <h2 id="changelog-heading" tabindex="-1">Changelog</h2>
            <div id="changelog-container" aria-labelledby="changelog-heading">
                <p>Current Version: <span id="current-version">${VERSION}</span></p>
                <div id="changelog-list"></div>
            </div>
        </section>`;
    }

    function renderChangelog() {
        const container = document.getElementById('changelog-list');
        if (!container) return;

        container.innerHTML = '';
        changelog.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'changelog-entry';
            entryDiv.innerHTML = `
                <h3>V${entry.version}</h3>
                <ul>
                    ${entry.changes.map(change => `<li>${change}</li>`).join('')}
                </ul>
            `;
            container.appendChild(entryDiv);
        });
    }

    function getChangelog() {
        return changelog;
    }

    return {
        getHTML,
        renderChangelog,
        getChangelog
    };
})();
