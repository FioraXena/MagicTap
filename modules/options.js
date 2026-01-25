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

        // Save/Load buttons
        const saveButton = document.getElementById('save-game-button');
        const loadButton = document.getElementById('load-game-button');
        const exportButton = document.getElementById('export-save-button');
        const importButton = document.getElementById('import-save-button');
        const resetButton = document.getElementById('reset-game-button');

        if (saveButton) {
            saveButton.addEventListener('click', () => {
                if (SaveManager.save()) {
                    alert('Game saved!');
                } else {
                    alert('Error saving game.');
                }
            });
        }

        if (loadButton) {
            loadButton.addEventListener('click', () => {
                if (confirm('Load saved game? Any unsaved progress will be lost.')) {
                    if (SaveManager.load()) {
                        alert('Game loaded!');
                    } else {
                        alert('No save data found or error loading.');
                    }
                }
            });
        }

        if (exportButton) {
            exportButton.addEventListener('click', () => {
                const saveString = SaveManager.exportSave();
                if (saveString) {
                    // Create a text area with the save string for copying
                    const textarea = document.createElement('textarea');
                    textarea.value = saveString;
                    textarea.style.position = 'fixed';
                    textarea.style.left = '-9999px';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    alert('Save data copied to clipboard!');
                } else {
                    alert('Error exporting save.');
                }
            });
        }

        if (importButton) {
            importButton.addEventListener('click', () => {
                const saveString = prompt('Paste your save data:');
                if (saveString && saveString.trim()) {
                    if (confirm('Import this save? Your current progress will be replaced.')) {
                        if (SaveManager.importSave(saveString.trim())) {
                            alert('Save imported successfully!');
                        } else {
                            alert('Invalid save data.');
                        }
                    }
                }
            });
        }

        if (resetButton) {
            resetButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset the game? ALL progress will be lost!')) {
                    if (confirm('This cannot be undone. Reset game?')) {
                        SaveManager.resetGame();
                        alert('Game has been reset.');
                    }
                }
            });
        }
    }

    function loadOptions(savedOptions) {
        if (savedOptions) {
            options.soundEnabled = savedOptions.soundEnabled !== undefined ? savedOptions.soundEnabled : true;
            options.notificationsEnabled = savedOptions.notificationsEnabled !== undefined ? savedOptions.notificationsEnabled : true;
            options.autoSaveEnabled = savedOptions.autoSaveEnabled !== undefined ? savedOptions.autoSaveEnabled : true;
            options.autoSaveInterval = savedOptions.autoSaveInterval || 30;

            // Update checkboxes to match loaded options
            const soundCheckbox = document.getElementById('option-sound');
            const notificationsCheckbox = document.getElementById('option-notifications');
            const autosaveCheckbox = document.getElementById('option-autosave');

            if (soundCheckbox) soundCheckbox.checked = options.soundEnabled;
            if (notificationsCheckbox) notificationsCheckbox.checked = options.notificationsEnabled;
            if (autosaveCheckbox) autosaveCheckbox.checked = options.autoSaveEnabled;
        }
    }

    function getOptions() {
        return options;
    }

    return {
        getHTML,
        init,
        getOptions,
        loadOptions
    };
})();
