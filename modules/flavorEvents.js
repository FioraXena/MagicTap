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
        // Ley Line events (unlocked after purchasing 1 Ley Line)
        { text: 'Light from the Ley Lines illuminate a distant city.', unlockCondition: () => buildings.find(b => b.id === 'ley-line').owned >= 1 },
        { text: 'The Ley Lines appear to mesmerize both people and animals.', unlockCondition: () => buildings.find(b => b.id === 'ley-line').owned >= 1 },
        // Mana Crystal events (unlocked after purchasing 1 Mana Crystal)
        { text: 'Crystals sit upon pedestals situated in a circle.', unlockCondition: () => buildings.find(b => b.id === 'mana-crystal').owned >= 1 },
        { text: 'Crystals begin to crack, overflowing with power.', unlockCondition: () => buildings.find(b => b.id === 'mana-crystal').owned >= 1 },
        // Mana Shard events
        { text: 'Shards of pure magic reflect rainbows across the walls.', unlockCondition: () => buildings.find(b => b.id === 'mana-shard')?.owned >= 1 },
        { text: 'The shards hum with a frequency only mages can hear.', unlockCondition: () => buildings.find(b => b.id === 'mana-shard')?.owned >= 1 },
        // Mana Fountain events (unlocked after purchasing 1 Mana Fountain)
        { text: 'Mana bubbles eerily like water.', unlockCondition: () => buildings.find(b => b.id === 'mana-fountain')?.owned >= 1 },
        { text: 'Mana laps at the edges of the constructed fountains.', unlockCondition: () => buildings.find(b => b.id === 'mana-fountain')?.owned >= 1 },
        { text: 'You discover another pocket of Mana within a cave.', unlockCondition: () => buildings.find(b => b.id === 'mana-fountain')?.owned >= 1 },
        { text: 'Natural Mana Fountains burble softly.', unlockCondition: () => buildings.find(b => b.id === 'mana-fountain')?.owned >= 1 },
        { text: 'Somebody mistakes the glow of Mana for something else... how silly of them.', unlockCondition: () => buildings.find(b => b.id === 'mana-fountain')?.owned >= 1 },
        // Church of Mana events
        { text: 'Worshippers chant in unison, their voices echoing with power.', unlockCondition: () => buildings.find(b => b.id === 'church-of-mana')?.owned >= 1 },
        { text: 'The stained glass windows depict scenes of the Weave.', unlockCondition: () => buildings.find(b => b.id === 'church-of-mana')?.owned >= 1 },
        // Mages\' Guild events
        { text: 'Apprentices practice their cantrips in the courtyard.', unlockCondition: () => buildings.find(b => b.id === 'mages-guild')?.owned >= 1 },
        { text: 'A heated debate about spell theory echoes from the guild hall.', unlockCondition: () => buildings.find(b => b.id === 'mages-guild')?.owned >= 1 },
        // Magic Library events
        { text: 'Ancient tomes whisper secrets to those who listen.', unlockCondition: () => buildings.find(b => b.id === 'magic-library')?.owned >= 1 },
        { text: 'A forbidden text glows ominously on a distant shelf.', unlockCondition: () => buildings.find(b => b.id === 'magic-library')?.owned >= 1 },
        // Magic Spire events
        { text: 'The spire\'s peak is lost in clouds of pure magical energy.', unlockCondition: () => buildings.find(b => b.id === 'magic-spire')?.owned >= 1 },
        { text: 'Lightning arcs between the spires, dancing with arcane purpose.', unlockCondition: () => buildings.find(b => b.id === 'magic-spire')?.owned >= 1 },
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
