// Flavor Events Module
const FlavorEventsModule = (function() {
    // Events can be strings (always visible) or objects with text and unlockCondition
    const flavorTexts = [
        'The air shimmers with magical potential.',
        'A faint hum of arcane energy fills the room.',
        'Motes of light dance at the edge of your vision.',
        'You sense a surge in the ley lines.',
        'The mana flows strongly today.',
        'Ancient whispers echo through the aether.',
        'A cool breeze carries the scent of magic.',
        'The crystals pulse with inner light.',
        'Somewhere, a spell is being cast.',
        'The veil between worlds grows thin.',
        'You feel your power growing.',
        'The stars align in your favor.',
        'A distant tower glows on the horizon.',
        'The familiar hum of magic comforts you.',
        'Runes flicker briefly in the shadows.',
        // === INSERT NEW EVENTS HERE ===
    ];

    let eventsLog = null;
    let timeoutId = null;
    const MAX_MESSAGES = 5;

    function init() {
        eventsLog = document.getElementById('events-log');
        scheduleNextEvent();
    }

    function getRandomInterval() {
        // Random number between 45 and 300 seconds
        return (Math.floor(Math.random() * 256) + 45) * 1000;
    }

    function getAvailableEvents() {
        // Filter to only events that are unlocked
        return flavorTexts.filter(event => {
            if (typeof event === 'string') {
                return true; // Simple strings are always available
            }
            // Object with unlockCondition
            if (event.unlockCondition) {
                try {
                    return event.unlockCondition();
                } catch (e) {
                    return false;
                }
            }
            return true;
        });
    }

    function getEventText(event) {
        if (typeof event === 'string') {
            return event;
        }
        return event.text;
    }

    function getRandomFlavorText() {
        const available = getAvailableEvents();
        if (available.length === 0) return null;
        const event = available[Math.floor(Math.random() * available.length)];
        return getEventText(event);
    }

    function showFlavorEvent() {
        if (!eventsLog) return;

        const message = getRandomFlavorText();
        if (!message) {
            // No available events, try again later
            scheduleNextEvent();
            return;
        }

        const eventElement = document.createElement('p');
        eventElement.textContent = message;
        eventElement.className = 'flavor-event';
        eventElement.setAttribute('role', 'status');
        eventElement.setAttribute('aria-live', 'polite');
        eventElement.setAttribute('aria-atomic', 'true');

        // Insert at the top
        eventsLog.prepend(eventElement);

        // Remove aria-live after announcement to prevent re-reading
        setTimeout(() => {
            eventElement.removeAttribute('aria-live');
            eventElement.removeAttribute('role');
        }, 1000);

        // Remove oldest if over max
        while (eventsLog.children.length > MAX_MESSAGES) {
            eventsLog.removeChild(eventsLog.lastChild);
        }

        // Schedule next event
        scheduleNextEvent();
    }

    function scheduleNextEvent() {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(showFlavorEvent, getRandomInterval());
    }

    function addFlavorText(text) {
        flavorTexts.push(text);
    }

    function getFlavorTexts() {
        return flavorTexts;
    }

    return {
        init,
        addFlavorText,
        getFlavorTexts
    };
})();
