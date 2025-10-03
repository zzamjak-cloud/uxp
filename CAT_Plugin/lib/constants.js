// lib/constants.js

module.exports = {
    // Document related constants
    DOCUMENT: {
        RESOLUTION: 72,
        COLOR_MODE: 'RGBColorMode',
        BACKGROUND: {
            TRANSPARENT: 'transparent',
            BLACK: 'black',
            WHITE: 'white',
        },
        SIZE: {
            MOBILE_PORTRAIT: {
                WIDTH: 720,
                HEIGHT: 1280
            },
            MOBILE_LANDSCAPE: {
                WIDTH: 1280,
                HEIGHT: 720
            },
            TABLET_PORTRAIT: {
                WIDTH: 1024,
                HEIGHT: 1366
            },
            TABLET_LANDSCAPE: {
                WIDTH: 1366,
                HEIGHT: 1024
            },
            DESKTOP_LANDSCAPE: {
                WIDTH: 1920,
                HEIGHT: 1080
            }
        }
    },

    // Layer related constants
    LAYER: {
        OPACITY: 100,
        TYPES: {
            SMART_OBJECT: 'smartObject',
            GROUP: 'group',
            TEXT: 'textLayer',
            PIXEL: 'pixel',
            BITMAP: 'bitmap',
            VECTOR: 'vector',
            GRAPHIC: 'graphic',
            SHAPE: 'shape',
            VIDEO: 'video',
            AUDIO: 'audio',
            DOCUMENT: 'document',
            LINK: 'link',
        },
        VISIBLE: {
            SHOW: 'show',
            HIDE: 'hide'
        },
        BLEND_MODES: {
            NORMAL: 'normal',
            MULTIPLY: 'multiply',
            SCREEN: 'screen',
            OVERLAY: 'overlay',
            SOFT_LIGHT: 'softLight',
            HARD_LIGHT: 'hardLight',
            DIFFERENCE: 'difference',
            EXCLUSION: 'exclusion',
            COLOR_DODGE: 'colorDodge',
            COLOR_BURN: 'colorBurn',
            HARD_MIX: 'hardMix',
            LIGHTEN_ONLY: 'lightenOnly',
            DARKEN_ONLY: 'darkenOnly',
            LINEAR_BURN: 'linearBurn',
            LINEAR_DODGE: 'linearDodge',
            VIVID_LIGHT: 'vividLight',
            LINEAR_LIGHT: 'linearLight',
        }
    },

    BOUNDS: {
        RECTANGLE: 'rectangle',
        POINT: 'point',
        POLYGON: 'polygon',
        FREEFORM: 'freeform',
        ELLIPSE: 'ellipse',
    },

    SELECTION: {
        REVEAL_SELECTION: 'revealSelection',
        REVEAL_SELECTION_ONLY: 'revealSelectionOnly',
        NONE: 'none'
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

    INTERPOLATION: {
        AUTOMATIC: 'automaticInterpolation',
        PRESERVE_DETAILS: 'preserveDetailsUpscale',
        BICUBIC_SHARPER: 'bicubicSharper',
        BICUBIC_SMOOTHER: 'bicubicSmoother',
        BICUBIC: 'bicubic',
        NEAREST_NEIGHBOR: 'nearestNeighbor',
        BILINEAR: 'bilinear'
    },

    FILL_COLOR: {
        FOREGROUND: 'forgroundColor',
        BACKGROUND: 'backgroundColor'
    },

    TEXT_ALIGNMENT: {
        LEFT: 'left',
        CENTER: 'center',
        RIGHT: 'right'
    },

    TEXT_ORIENTATION: {
        HORIZONTAL: 'horizontal',
        VERTICAL: 'vertical'
    },

    // Common error messages
    ERROR_MESSAGES: {
        NO_SELECTION: 'Please select layers to process.',
        NO_SMART_OBJECT: 'Please select a Smart Object or group layer.',
        NO_GUIDES: 'No guides found in the document.',
        INVALID_PATH: 'Invalid file path or permissions.',
    },

    COMMAND: {
        MERGE_VISIBLE: 'mergeVisible',
        CUT_TO_LAYER: 'cutToLayer',
        CLEAR_ALL_GUIDES: 'clearAllGuides',
        PLACED_LAYER_EDIT_CONTENTS: 'placedLayerEditContents',
        NEW_PLACED_LAYER: 'newPlacedLayer',
        MERGE_LAYERS_NEW: 'mergeLayersNew',
    },

    MESSAGES: {
        NO_SELECTION_LAYERS: '선택된 레이어가 없습니다.',
        NO_GROUP_LAYER: '그룹 레이어를 선택해주세요.',
        NO_SMART_OBJECT: '스마트 오브젝트를 선택해주세요.',
        NO_GUIDES: '가이드가 없습니다.',
        NO_PERMISSION: '적절한 권한이 있는지 확인하세요.',
        NO_PATH: '파일 경로가 유효하지 않습니다.',
    },
};