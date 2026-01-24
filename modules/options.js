// Options Module
const OptionsModule = (function() {
    const options = {
        soundEnabled: true,
        notificationsEnabled: true,
        autoSaveEnabled: true,
        autoSaveInterval: 30
    };

    function getHTML() {
        return `
        <section id="options-panel" class="game-panel" hidden>
            <h2 id="options-heading" tabindex="-1">Options</h2>
            <div id="options-container" aria-labelledby="options-heading">
                <div class="option-group">
                    <h3>Save</h3>
                    <button id="save-game-button">Save Game</button>
                    <button id="load-game-button">Load Game</button>
                    <button id="export-save-button">Export Save</button>
                    <button id="import-save-button">Import Save</button>
                </div>
                <div class="option-group">
                    <h3>Settings</h3>
                    <label class="option-item">
                        <input type="checkbox" id="option-sound" checked>
                        Enable Sound
                    </label>
                    <label class="option-item">
                        <input type="checkbox" id="option-notifications" checked>
                        Enable Notifications
                    </label>
                    <label class="option-item">
                        <input type="checkbox" id="option-autosave" checked>
                        Enable Auto-Save
                    </label>
                </div>
                <div class="option-group danger-zone">
                    <h3>Danger Zone</h3>
                    <button id="reset-game-button" class="danger-button">Reset Game</button>
                </div>
            </div>
        </section>`;
    }

    function init() {
        // Set up event listeners for options
        const soundCheckbox = document.getElementById('option-sound');
        const notificationsCheckbox = document.getElementById('option-notifications');
        const autosaveCheckbox = document.getElementById('option-autosave');

        if (soundCheckbox) {
            soundCheckbox.addEventListener('change', (e) => {
                options.soundEnabled = e.target.checked;
            });
        }

        if (notificationsCheckbox) {
            notificationsCheckbox.addEventListener('change', (e) => {
                options.notificationsEnabled = e.target.checked;
            });
        }

        if (autosaveCheckbox) {
            autosaveCheckbox.addEventListener('change', (e) => {
                options.autoSaveEnabled = e.target.checked;
            });
        }
    }

    function getOptions() {
        return options;
    }

    return {
        getHTML,
        init,
        getOptions
    };
})();
