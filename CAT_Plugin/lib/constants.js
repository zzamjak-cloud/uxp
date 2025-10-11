// lib/constants.js

module.exports = {
    // Document related constants
    DOCUMENT: {
        BACKGROUND: {
            TRANSPARENT: 'transparent',
            BLACK: 'black',
            WHITE: 'white',
        },
        COLOR_MODE: {
            INDEXED: 'indexedColorMode',
            RGB: 'RGBColorMode',
            CMYK: 'CMYKColorMode',
            GRAYSCALE: 'grayscaleColorMode',
        },
        UNIT: {
            PIXELS: 'pixelsUnit',
            PERCENT: 'percentUnit'
        }
    },

    // Layer related constants
    LAYER: {
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
        },
        ORDINAL: {
            NEXT: 'next',
            PREVIOUS: 'previous',
            FRONT: 'front',
            BACK: 'back'
        },
        PLACE: {
            BEFORE: 'placeBefore',
            AFTER: 'placeAfter',
            INSIDE: 'placeInside'
        },
        STYLE: {
            BEVEL_EMBOSS: 'bevelEmboss',
            STROKE: 'frameFX',
            INNER_SHADOW: 'innerShadow',
            INNER_GLOW: 'innerGlow',
            SATIN: 'satin',
            COLOR_OVERLAY: 'colorOverlay',
            GRADIENT_OVERLAY: 'gradientFill',
            PATTERN_OVERLAY: 'patternFill',
            OUTER_GLOW: 'outerGlow',
            DROP_SHADOW: 'dropShadow',
        },
        STYLE_CONFIG: {
            // Stroke 설정
            STROKE: {
                STYLE: {
                    OUTSET: 'outsetFrame',
                    INSET: 'insetFrame',
                    CENTER: 'centerFrame'
                },
                FILL_TYPE: {
                    SOLID_COLOR: 'solidColor',
                    GRADIENT: 'gradient',
                    PATTERN: 'pattern'
                },
                POSITION: {
                    OUTSIDE: 'outside',
                    INSIDE: 'inside',
                    CENTER: 'center'
                }
            },
            // Drop Shadow 설정
            DROP_SHADOW: {
                BLEND_MODE: {
                    NORMAL: 'normal',
                    MULTIPLY: 'multiply',
                    SCREEN: 'screen',
                    OVERLAY: 'overlay',
                    SOFT_LIGHT: 'softLight',
                    HARD_LIGHT: 'hardLight'
                }
            },
            // Inner Shadow 설정
            INNER_SHADOW: {
                BLEND_MODE: {
                    NORMAL: 'normal',
                    MULTIPLY: 'multiply',
                    SCREEN: 'screen',
                    OVERLAY: 'overlay',
                    SOFT_LIGHT: 'softLight',
                    HARD_LIGHT: 'hardLight'
                }
            },
            // Glow 설정
            GLOW: {
                TECHNIQUE: {
                    SOFTER: 'softer',
                    PRECISE: 'precise'
                },
                SOURCE: {
                    EDGE: 'edge',
                    CENTER: 'center'
                }
            },
            // Bevel & Emboss 설정
            BEVEL_EMBOSS: {
                STYLE: {
                    OUTER_BEVEL: 'outerBevel',
                    INNER_BEVEL: 'innerBevel',
                    EMBOSS: 'emboss',
                    PILLOW_EMBOSS: 'pillowEmboss',
                    STROKE_EMBOSS: 'strokeEmboss'
                },
                TECHNIQUE: {
                    SMOOTH: 'smooth',
                    CHISEL_HARD: 'chiselHard',
                    CHISEL_SOFT: 'chiselSoft'
                }
            }
        }
    },

    BOUNDS: {
        RECTANGLE: 'rectangle',
        POINT: 'point',
        POLYGON: 'polygon',
        FREEFORM: 'freeform',
        ELLIPSE: 'ellipse',
    },

    SHAPE: {
        TYPE: {
            RECTANGLE: 'rectangle',
            ELLIPSE: 'ellipse',
        }
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
        JPG: 'jpg',
        GIF: 'gif',
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

    FILL: {
        FOREGROUND_COLOR: 'foregroundColor',
        BACKGROUND_COLOR: 'backgroundColor'
    },

    TEXT: {
        ALIGNMENT: {
            LEFT: 'left',
            CENTER: 'center',
            RIGHT: 'right'
        },
        ORIENTATION: {
            HORIZONTAL: 'horizontal',
            VERTICAL: 'vertical'
        }
    },

    TOOL: {
        RECTANGLE: 'rectangleTool',
        ELLIPSE: 'ellipseTool',
        TRIANGLE: 'triangleTool',
        POLYGON: 'polygonTool',
        FREEFORM: 'freeformTool',
        PEN : 'penTool'
    },

    COMMAND: {
        CUT_TO_LAYER: 'cutToLayer',
        CLEAR_ALL_GUIDES: 'clearAllGuides',
        MERGE_LAYERS_NEW: 'mergeLayersNew',
        MERGE_VISIBLE: 'mergeVisible',
        NEW_PLACED_LAYER: 'newPlacedLayer',
        PLACED_LAYER_EDIT_CONTENTS: 'placedLayerEditContents',
        PLACED_LAYER_RELINK_TO_FILE: 'placedLayerRelinkToFile',
        DISABLE_SINGLE_FX: 'disableSingleFX',
        DISABLE_ALL_FX: 'disableAllFX',
    },

    ERROR_MESSAGES: {
        NO_SELECTION_LAYERS: '선택된 레이어가 없습니다.',
        NO_GROUP_LAYER: '그룹 레이어를 선택해주세요.',
        NO_SMART_OBJECT: '스마트 오브젝트를 선택해주세요.',
        NO_GUIDES: '가이드가 없습니다.',
        NO_PERMISSION: '적절한 권한이 있는지 확인하세요.',
        NO_PATH: '파일 경로가 유효하지 않습니다.',
    },
};