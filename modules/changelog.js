// Changelog Module
const ChangelogModule = (function() {
    const changelog = [
        {
            version: '0.01',
            date: '2026-01-24',
            changes: [
                'Initial release',
                'Added mana gathering mechanic',
                'Added Wizard\'s Hand building',
                'Added Magic Theory upgrade',
                'Added Statistics panel',
                'Added Achievements panel',
                'Added Production panel',
                'Added Purchased Upgrades panel',
                'Added Prestige panel (coming soon)',
                'Added Options panel'
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
                <h3>Version ${entry.version} <span class="changelog-date">(${entry.date})</span></h3>
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
