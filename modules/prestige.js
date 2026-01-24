// Prestige Module
const PrestigeModule = (function() {
    let prestigePoints = 0;
    let timesPrestiged = 0;

    function getHTML() {
        return `
        <section id="prestige-panel" class="game-panel" hidden>
            <h2 id="prestige-heading" tabindex="-1">Prestige</h2>
            <div id="prestige-container" aria-labelledby="prestige-heading">
                <p>Prestige Points: <span id="prestige-points">0</span></p>
                <p>Times Prestiged: <span id="times-prestiged">0</span></p>
                <p class="prestige-description">Prestige to reset your progress and gain powerful bonuses.</p>
                <button id="prestige-action-button" class="prestige-button" disabled>Prestige (Coming Soon)</button>
            </div>
        </section>`;
    }

    function updateDisplay() {
        const pointsEl = document.getElementById('prestige-points');
        const timesEl = document.getElementById('times-prestiged');

        if (pointsEl) {
            pointsEl.textContent = prestigePoints;
        }
        if (timesEl) {
            timesEl.textContent = timesPrestiged;
        }
    }

    function getPrestigePoints() {
        return prestigePoints;
    }

    function getTimesPrestiged() {
        return timesPrestiged;
    }

    return {
        getHTML,
        updateDisplay,
        getPrestigePoints,
        getTimesPrestiged
    };
})();
