// lib/constants.js

module.exports = {
    // Document related constants
    DOCUMENT: {
        DEFAULT_RESOLUTION: 72,
        COLOR_MODE: 'RGBColorMode',
        BACKGROUND: 'transparent',
    },

    // Layer related constants
    LAYER: {
        DEFAULT_OPACITY: 100,
        TYPES: {
            SMART_OBJECT: 'smartObject',
            GROUP: 'group',
        }
    },

    // File formats
    FILE_FORMAT: {
        PSD: 'psd',
        PSB: 'psb',
        PNG: 'png',
        JPG: 'jpg'
    },

    // Guide related constants
    GUIDE: {
        ORIENTATIONS: {
            VERTICAL: 'vertical',
            HORIZONTAL: 'horizontal'
        }
    },

    // Common error messages
    ERROR_MESSAGES: {
        NO_SELECTION: 'Please select layers to process.',
        NO_SMART_OBJECT: 'Please select a Smart Object or group layer.',
        NO_GUIDES: 'No guides found in the document.',
        INVALID_PATH: 'Invalid file path or permissions.',
    }
};