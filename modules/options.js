// Options Module
const OptionsModule = (function() {
    const options = {
        soundEnabled: true,
        notificationsEnabled: true,
        autoSaveEnabled: true,
        autoSaveInterval: 30,
        truncateLargeNumbers: false,
        numberFormat: 'basic' // 'basic' or 'scientific'
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
                <div class="option-group">
                    <h3>Number Display</h3>
                    <label class="option-item">
                        <input type="checkbox" id="option-truncate">
                        Truncate Large Numbers
                    </label>
                    <label class="option-item">
                        <span id="number-format-label">Number Format:</span>
                        <select id="option-number-format" aria-labelledby="number-format-label">
                            <option value="basic">Basic Numbers</option>
                            <option value="scientific">Scientific Notation</option>
                        </select>
                    </label>
                </div>
                <div class="option-group">
                    <button id="save-options-button">Save Changes</button>
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

        // Number display options
        const truncateCheckbox = document.getElementById('option-truncate');
        const numberFormatSelect = document.getElementById('option-number-format');
        const saveOptionsButton = document.getElementById('save-options-button');

        if (truncateCheckbox) {
            truncateCheckbox.addEventListener('change', (e) => {
                options.truncateLargeNumbers = e.target.checked;
            });
        }

        if (numberFormatSelect) {
            numberFormatSelect.addEventListener('change', (e) => {
                options.numberFormat = e.target.value;
            });
        }

        if (saveOptionsButton) {
            saveOptionsButton.addEventListener('click', () => {
                if (SaveManager.save()) {
                    // Close the options panel
                    const optionsPanel = document.getElementById('options-panel');
                    if (optionsPanel) {
                        optionsPanel.hidden = true;
                    }
                    // Return focus to options button
                    const optionsButton = document.getElementById('options-button');
                    if (optionsButton) {
                        optionsButton.focus();
                    }
                }
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
            options.truncateLargeNumbers = savedOptions.truncateLargeNumbers !== undefined ? savedOptions.truncateLargeNumbers : false;
            options.numberFormat = savedOptions.numberFormat || 'basic';

            // Update checkboxes to match loaded options
            const soundCheckbox = document.getElementById('option-sound');
            const notificationsCheckbox = document.getElementById('option-notifications');
            const autosaveCheckbox = document.getElementById('option-autosave');
            const truncateCheckbox = document.getElementById('option-truncate');
            const numberFormatSelect = document.getElementById('option-number-format');

            if (soundCheckbox) soundCheckbox.checked = options.soundEnabled;
            if (notificationsCheckbox) notificationsCheckbox.checked = options.notificationsEnabled;
            if (autosaveCheckbox) autosaveCheckbox.checked = options.autoSaveEnabled;
            if (truncateCheckbox) truncateCheckbox.checked = options.truncateLargeNumbers;
            if (numberFormatSelect) numberFormatSelect.value = options.numberFormat;
        }
    }

    // Format a number based on current options
    function formatNumber(num) {
        if (options.numberFormat === 'scientific' && Math.abs(num) >= 1000000) {
            return num.toExponential(2);
        }

        if (options.truncateLargeNumbers && Math.abs(num) >= 1000) {
            const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
            let tier = Math.floor(Math.log10(Math.abs(num)) / 3);
            if (tier > suffixes.length - 1) tier = suffixes.length - 1;
            const suffix = suffixes[tier];
            const scale = Math.pow(10, tier * 3);
            const scaled = num / scale;
            return scaled.toFixed(2) + suffix;
        }

        // Basic format with commas
        if (Number.isInteger(num)) {
            return num.toLocaleString();
        }
        return num.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }

    function getOptions() {
        return options;
    }

    return {
        getHTML,
        init,
        getOptions,
        loadOptions,
        formatNumber
    };
})();
