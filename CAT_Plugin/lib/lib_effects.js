// lib/lib_effects.js
// 레이어 이펙트 관리 - 범용적인 Layer Style 적용

const { batchPlay } = require("photoshop").action;
const constants = require("./constants");

/**
 * 범용적인 Layer Style 적용 함수
 * @param {string} layerID - 레이어 ID
 * @param {Object} styleConfig - 스타일 설정 객체
 * @param {string} styleType - 스타일 타입 (constants.LAYER_STYLE 참조)
 * @returns {Promise<boolean>} - 성공 여부
 */
async function applyLayerStyle(layerID, styleConfig, styleType) {
    try {
        if (!layerID || !styleConfig || !styleType) {
            throw new Error("필수 매개변수가 누락되었습니다.");
        }

        const styleData = buildStyleData(styleType, styleConfig);
        
        await batchPlay([
            {
                "_obj": "set",
                "_target": [
                    {
                        "_ref": "property",
                        "_property": "layerEffects"
                    },
                    {
                        "_ref": "layer",
                        "_enum": "ordinal",
                        "_value": "targetEnum"
                    }
                ],
                "to": styleData,
                "_isCommand": false
            }
        ], {});

        return true;
    } catch (error) {
        console.error(`Layer style 적용 실패 (${styleType}):`, error);
        return false;
    }
}

/**
 * 스타일 타입에 따른 데이터 구조 생성
 * @param {string} styleType - 스타일 타입
 * @param {Object} config - 설정 객체
 * @returns {Object} - batchPlay용 데이터 구조
 */
function buildStyleData(styleType, config) {
    const baseData = {
        "_obj": "layerEffects",
        "scale": {
            "_unit": "percentUnit",
            "_value": 100
        }
    };

    switch (styleType) {
        case constants.LAYER_STYLE.STROKE:
            return {
                ...baseData,
                "frameFX": buildStrokeData(config)
            };
        case constants.LAYER_STYLE.DROP_SHADOW:
            return {
                ...baseData,
                "dropShadow": buildDropShadowData(config)
            };
        case constants.LAYER_STYLE.INNER_SHADOW:
            return {
                ...baseData,
                "innerShadow": buildInnerShadowData(config)
            };
        case constants.LAYER_STYLE.OUTER_GLOW:
            return {
                ...baseData,
                "outerGlow": buildOuterGlowData(config)
            };
        case constants.LAYER_STYLE.INNER_GLOW:
            return {
                ...baseData,
                "innerGlow": buildInnerGlowData(config)
            };
        case constants.LAYER_STYLE.BEVEL_EMBOSS:
            return {
                ...baseData,
                "bevelEmboss": buildBevelEmbossData(config)
            };
        case constants.LAYER_STYLE.COLOR_OVERLAY:
            return {
                ...baseData,
                "colorOverlay": buildColorOverlayData(config)
            };
        case constants.LAYER_STYLE.GRADIENT_OVERLAY:
            return {
                ...baseData,
                "gradientFill": buildGradientOverlayData(config)
            };
        default:
            throw new Error(`지원하지 않는 스타일 타입: ${styleType}`);
    }
}

/**
 * Stroke 스타일 데이터 생성
 * @param {Object} config - Stroke 설정
 * @returns {Object} - Stroke 데이터
 */
function buildStrokeData(config) {
    const {
        enabled = true,
        size = 3,
        position = constants.LAYER_STYLE_CONFIG.STROKE.STYLE.OUTSET,
        fillType = constants.LAYER_STYLE_CONFIG.STROKE.FILL_TYPE.SOLID_COLOR,
        color = { red: 0, green: 0, blue: 0 },
        opacity = 100,
        blendMode = constants.LAYER.BLEND_MODES.NORMAL
    } = config;

    return {
        "_obj": "frameFX",
        "enabled": enabled,
        "present": true,
        "showInDialog": true,
        "style": {
            "_enum": "frameStyle",
            "_value": position
        },
        "paintType": {
            "_enum": "frameFill",
            "_value": fillType
        },
        "mode": {
            "_enum": "blendMode",
            "_value": blendMode
        },
        "opacity": {
            "_unit": "percentUnit",
            "_value": opacity
        },
        "size": {
            "_unit": "pixelsUnit",
            "_value": size
        },
        "color": {
            "_obj": "RGBColor",
            "red": color.red,
            "grain": color.green,
            "blue": color.blue
        },
        "overprint": false
    };
}

/**
 * Drop Shadow 스타일 데이터 생성
 * @param {Object} config - Drop Shadow 설정
 * @returns {Object} - Drop Shadow 데이터
 */
function buildDropShadowData(config) {
    const {
        enabled = true,
        blendMode = constants.LAYER_STYLE_CONFIG.DROP_SHADOW.BLEND_MODE.MULTIPLY,
        color = { red: 0, green: 0, blue: 0 },
        opacity = 75,
        angle = 120,
        distance = 5,
        spread = 0,
        size = 5,
        noise = 0
    } = config;

    return {
        "_obj": "dropShadow",
        "enabled": enabled,
        "present": true,
        "showInDialog": true,
        "mode": {
            "_enum": "blendMode",
            "_value": blendMode
        },
        "color": {
            "_obj": "RGBColor",
            "red": color.red,
            "grain": color.green,
            "blue": color.blue
        },
        "opacity": {
            "_unit": "percentUnit",
            "_value": opacity
        },
        "angle": {
            "_unit": "angleUnit",
            "_value": angle
        },
        "distance": {
            "_unit": "pixelsUnit",
            "_value": distance
        },
        "spread": {
            "_unit": "percentUnit",
            "_value": spread
        },
        "size": {
            "_unit": "pixelsUnit",
            "_value": size
        },
        "noise": {
            "_unit": "percentUnit",
            "_value": noise
        }
    };
}

/**
 * Inner Shadow 스타일 데이터 생성
 * @param {Object} config - Inner Shadow 설정
 * @returns {Object} - Inner Shadow 데이터
 */
function buildInnerShadowData(config) {
    const {
        enabled = true,
        blendMode = constants.LAYER_STYLE_CONFIG.INNER_SHADOW.BLEND_MODE.MULTIPLY,
        color = { red: 0, green: 0, blue: 0 },
        opacity = 75,
        angle = 120,
        distance = 5,
        choke = 0,
        size = 5,
        noise = 0
    } = config;

    return {
        "_obj": "innerShadow",
        "enabled": enabled,
        "present": true,
        "showInDialog": true,
        "mode": {
            "_enum": "blendMode",
            "_value": blendMode
        },
        "color": {
            "_obj": "RGBColor",
            "red": color.red,
            "grain": color.green,
            "blue": color.blue
        },
        "opacity": {
            "_unit": "percentUnit",
            "_value": opacity
        },
        "angle": {
            "_unit": "angleUnit",
            "_value": angle
        },
        "distance": {
            "_unit": "pixelsUnit",
            "_value": distance
        },
        "choke": {
            "_unit": "percentUnit",
            "_value": choke
        },
        "size": {
            "_unit": "pixelsUnit",
            "_value": size
        },
        "noise": {
            "_unit": "percentUnit",
            "_value": noise
        }
    };
}

/**
 * Outer Glow 스타일 데이터 생성
 * @param {Object} config - Outer Glow 설정
 * @returns {Object} - Outer Glow 데이터
 */
function buildOuterGlowData(config) {
    const {
        enabled = true,
        blendMode = constants.LAYER.BLEND_MODES.SCREEN,
        color = { red: 255, green: 255, blue: 0 },
        opacity = 75,
        technique = constants.LAYER_STYLE_CONFIG.GLOW.TECHNIQUE.SOFTER,
        spread = 0,
        size = 10,
        range = 50,
        jitter = 0
    } = config;

    return {
        "_obj": "outerGlow",
        "enabled": enabled,
        "present": true,
        "showInDialog": true,
        "mode": {
            "_enum": "blendMode",
            "_value": blendMode
        },
        "color": {
            "_obj": "RGBColor",
            "red": color.red,
            "grain": color.green,
            "blue": color.blue
        },
        "opacity": {
            "_unit": "percentUnit",
            "_value": opacity
        },
        "technique": {
            "_enum": "glowTechnique",
            "_value": technique
        },
        "spread": {
            "_unit": "percentUnit",
            "_value": spread
        },
        "size": {
            "_unit": "pixelsUnit",
            "_value": size
        },
        "range": {
            "_unit": "percentUnit",
            "_value": range
        },
        "jitter": {
            "_unit": "percentUnit",
            "_value": jitter
        }
    };
}

/**
 * Inner Glow 스타일 데이터 생성
 * @param {Object} config - Inner Glow 설정
 * @returns {Object} - Inner Glow 데이터
 */
function buildInnerGlowData(config) {
    const {
        enabled = true,
        blendMode = constants.LAYER.BLEND_MODES.SCREEN,
        color = { red: 255, green: 255, blue: 0 },
        opacity = 75,
        technique = constants.LAYER_STYLE_CONFIG.GLOW.TECHNIQUE.SOFTER,
        source = constants.LAYER_STYLE_CONFIG.GLOW.SOURCE.EDGE,
        choke = 0,
        size = 10,
        range = 50,
        jitter = 0
    } = config;

    return {
        "_obj": "innerGlow",
        "enabled": enabled,
        "present": true,
        "showInDialog": true,
        "mode": {
            "_enum": "blendMode",
            "_value": blendMode
        },
        "color": {
            "_obj": "RGBColor",
            "red": color.red,
            "grain": color.green,
            "blue": color.blue
        },
        "opacity": {
            "_unit": "percentUnit",
            "_value": opacity
        },
        "technique": {
            "_enum": "glowTechnique",
            "_value": technique
        },
        "source": {
            "_enum": "glowSource",
            "_value": source
        },
        "choke": {
            "_unit": "percentUnit",
            "_value": choke
        },
        "size": {
            "_unit": "pixelsUnit",
            "_value": size
        },
        "range": {
            "_unit": "percentUnit",
            "_value": range
        },
        "jitter": {
            "_unit": "percentUnit",
            "_value": jitter
        }
    };
}

/**
 * Bevel & Emboss 스타일 데이터 생성
 * @param {Object} config - Bevel & Emboss 설정
 * @returns {Object} - Bevel & Emboss 데이터
 */
function buildBevelEmbossData(config) {
    const {
        enabled = true,
        style = constants.LAYER_STYLE_CONFIG.BEVEL_EMBOSS.STYLE.OUTER_BEVEL,
        technique = constants.LAYER_STYLE_CONFIG.BEVEL_EMBOSS.TECHNIQUE.SMOOTH,
        depth = 100,
        direction = "up",
        size = 5,
        soften = 0,
        angle = 120,
        altitude = 30,
        highlightMode = constants.LAYER.BLEND_MODES.SCREEN,
        highlightOpacity = 75,
        shadowMode = constants.LAYER.BLEND_MODES.MULTIPLY,
        shadowOpacity = 75
    } = config;

    return {
        "_obj": "bevelEmboss",
        "enabled": enabled,
        "present": true,
        "showInDialog": true,
        "style": {
            "_enum": "bevelStyle",
            "_value": style
        },
        "technique": {
            "_enum": "bevelTechnique",
            "_value": technique
        },
        "depth": {
            "_unit": "percentUnit",
            "_value": depth
        },
        "direction": {
            "_enum": "bevelDirection",
            "_value": direction
        },
        "size": {
            "_unit": "pixelsUnit",
            "_value": size
        },
        "soften": {
            "_unit": "pixelsUnit",
            "_value": soften
        },
        "angle": {
            "_unit": "angleUnit",
            "_value": angle
        },
        "altitude": {
            "_unit": "angleUnit",
            "_value": altitude
        },
        "highlightMode": {
            "_enum": "blendMode",
            "_value": highlightMode
        },
        "highlightOpacity": {
            "_unit": "percentUnit",
            "_value": highlightOpacity
        },
        "shadowMode": {
            "_enum": "blendMode",
            "_value": shadowMode
        },
        "shadowOpacity": {
            "_unit": "percentUnit",
            "_value": shadowOpacity
        }
    };
}

/**
 * Color Overlay 스타일 데이터 생성
 * @param {Object} config - Color Overlay 설정
 * @returns {Object} - Color Overlay 데이터
 */
function buildColorOverlayData(config) {
    const {
        enabled = true,
        blendMode = constants.LAYER.BLEND_MODES.NORMAL,
        color = { red: 255, green: 0, blue: 0 },
        opacity = 100
    } = config;

    return {
        "_obj": "colorOverlay",
        "enabled": enabled,
        "present": true,
        "showInDialog": true,
        "mode": {
            "_enum": "blendMode",
            "_value": blendMode
        },
        "color": {
            "_obj": "RGBColor",
            "red": color.red,
            "grain": color.green,
            "blue": color.blue
        },
        "opacity": {
            "_unit": "percentUnit",
            "_value": opacity
        }
    };
}

/**
 * Gradient Overlay 스타일 데이터 생성
 * @param {Object} config - Gradient Overlay 설정
 * @returns {Object} - Gradient Overlay 데이터
 */
function buildGradientOverlayData(config) {
    const {
        enabled = true,
        blendMode = constants.LAYER.BLEND_MODES.NORMAL,
        opacity = 100,
        gradient = "Foreground to Background",
        style = "linear",
        angle = 90,
        scale = 100,
        reverse = false,
        dither = false,
        alignWithLayer = true
    } = config;

    return {
        "_obj": "gradientFill",
        "enabled": enabled,
        "present": true,
        "showInDialog": true,
        "mode": {
            "_enum": "blendMode",
            "_value": blendMode
        },
        "opacity": {
            "_unit": "percentUnit",
            "_value": opacity
        },
        "gradient": gradient,
        "style": {
            "_enum": "gradientStyle",
            "_value": style
        },
        "angle": {
            "_unit": "angleUnit",
            "_value": angle
        },
        "scale": {
            "_unit": "percentUnit",
            "_value": scale
        },
        "reverse": reverse,
        "dither": dither,
        "alignWithLayer": alignWithLayer
    };
}

// 편의 함수들
/**
 * Stroke 적용 (기존 함수와 호환성 유지)
 * @param {string} layerID - 레이어 ID
 * @param {Object} strokeConfig - Stroke 설정
 * @returns {Promise<boolean>} - 성공 여부
 */
async function applyStroke(layerID, strokeConfig = {}) {
    const defaultConfig = {
        size: 3,
        color: { red: 0, green: 0, blue: 0 },
        opacity: 100,
        position: constants.LAYER_STYLE_CONFIG.STROKE.STYLE.OUTSET,
        fillType: constants.LAYER_STYLE_CONFIG.STROKE.FILL_TYPE.SOLID_COLOR,
        blendMode: constants.LAYER.BLEND_MODES.NORMAL
    };

    return await applyLayerStyle(layerID, { ...defaultConfig, ...strokeConfig }, constants.LAYER_STYLE.STROKE);
}

/**
 * Drop Shadow 적용
 * @param {string} layerID - 레이어 ID
 * @param {Object} shadowConfig - Drop Shadow 설정
 * @returns {Promise<boolean>} - 성공 여부
 */
async function applyDropShadow(layerID, shadowConfig = {}) {
    const defaultConfig = {
        distance: 5,
        size: 5,
        color: { red: 0, green: 0, blue: 0 },
        opacity: 75,
        angle: 120,
        blendMode: constants.LAYER_STYLE_CONFIG.DROP_SHADOW.BLEND_MODE.MULTIPLY
    };

    return await applyLayerStyle(layerID, { ...defaultConfig, ...shadowConfig }, constants.LAYER_STYLE.DROP_SHADOW);
}

/**
 * Inner Shadow 적용
 * @param {string} layerID - 레이어 ID
 * @param {Object} shadowConfig - Inner Shadow 설정
 * @returns {Promise<boolean>} - 성공 여부
 */
async function applyInnerShadow(layerID, shadowConfig = {}) {
    const defaultConfig = {
        distance: 5,
        size: 5,
        color: { red: 0, green: 0, blue: 0 },
        opacity: 75,
        angle: 120,
        blendMode: constants.LAYER_STYLE_CONFIG.INNER_SHADOW.BLEND_MODE.MULTIPLY
    };

    return await applyLayerStyle(layerID, { ...defaultConfig, ...shadowConfig }, constants.LAYER_STYLE.INNER_SHADOW);
}

/**
 * Outer Glow 적용
 * @param {string} layerID - 레이어 ID
 * @param {Object} glowConfig - Outer Glow 설정
 * @returns {Promise<boolean>} - 성공 여부
 */
async function applyOuterGlow(layerID, glowConfig = {}) {
    const defaultConfig = {
        size: 10,
        color: { red: 255, green: 255, blue: 0 },
        opacity: 75,
        blendMode: constants.LAYER.BLEND_MODES.SCREEN,
        technique: constants.LAYER_STYLE_CONFIG.GLOW.TECHNIQUE.SOFTER
    };

    return await applyLayerStyle(layerID, { ...defaultConfig, ...glowConfig }, constants.LAYER_STYLE.OUTER_GLOW);
}

/**
 * Inner Glow 적용
 * @param {string} layerID - 레이어 ID
 * @param {Object} glowConfig - Inner Glow 설정
 * @returns {Promise<boolean>} - 성공 여부
 */
async function applyInnerGlow(layerID, glowConfig = {}) {
    const defaultConfig = {
        size: 10,
        color: { red: 255, green: 255, blue: 0 },
        opacity: 75,
        blendMode: constants.LAYER.BLEND_MODES.SCREEN,
        technique: constants.LAYER_STYLE_CONFIG.GLOW.TECHNIQUE.SOFTER,
        source: constants.LAYER_STYLE_CONFIG.GLOW.SOURCE.EDGE
    };

    return await applyLayerStyle(layerID, { ...defaultConfig, ...glowConfig }, constants.LAYER_STYLE.INNER_GLOW);
}

/**
 * Bevel & Emboss 적용
 * @param {string} layerID - 레이어 ID
 * @param {Object} bevelConfig - Bevel & Emboss 설정
 * @returns {Promise<boolean>} - 성공 여부
 */
async function applyBevelEmboss(layerID, bevelConfig = {}) {
    const defaultConfig = {
        style: constants.LAYER_STYLE_CONFIG.BEVEL_EMBOSS.STYLE.OUTER_BEVEL,
        technique: constants.LAYER_STYLE_CONFIG.BEVEL_EMBOSS.TECHNIQUE.SMOOTH,
        depth: 100,
        size: 5,
        angle: 120,
        altitude: 30
    };

    return await applyLayerStyle(layerID, { ...defaultConfig, ...bevelConfig }, constants.LAYER_STYLE.BEVEL_EMBOSS);
}

/**
 * Color Overlay 적용
 * @param {string} layerID - 레이어 ID
 * @param {Object} overlayConfig - Color Overlay 설정
 * @returns {Promise<boolean>} - 성공 여부
 */
async function applyColorOverlay(layerID, overlayConfig = {}) {
    const defaultConfig = {
        color: { red: 255, green: 0, blue: 0 },
        opacity: 100,
        blendMode: constants.LAYER.BLEND_MODES.NORMAL
    };

    return await applyLayerStyle(layerID, { ...defaultConfig, ...overlayConfig }, constants.LAYER_STYLE.COLOR_OVERLAY);
}

/**
 * Gradient Overlay 적용
 * @param {string} layerID - 레이어 ID
 * @param {Object} gradientConfig - Gradient Overlay 설정
 * @returns {Promise<boolean>} - 성공 여부
 */
async function applyGradientOverlay(layerID, gradientConfig = {}) {
    const defaultConfig = {
        opacity: 100,
        blendMode: constants.LAYER.BLEND_MODES.NORMAL,
        gradient: "Foreground to Background",
        style: "linear",
        angle: 90,
        scale: 100
    };

    return await applyLayerStyle(layerID, { ...defaultConfig, ...gradientConfig }, constants.LAYER_STYLE.GRADIENT_OVERLAY);
}

/**
 * 여러 Layer Style을 한 번에 적용
 * @param {string} layerID - 레이어 ID
 * @param {Array} styles - 스타일 배열 [{ type, config }, ...]
 * @returns {Promise<boolean>} - 성공 여부
 */
async function applyMultipleStyles(layerID, styles) {
    try {
        for (const style of styles) {
            const success = await applyLayerStyle(layerID, style.config, style.type);
            if (!success) {
                console.warn(`스타일 적용 실패: ${style.type}`);
            }
        }
        return true;
    } catch (error) {
        console.error("여러 스타일 적용 실패:", error);
        return false;
    }
}

/**
 * Layer Style 제거
 * @param {string} layerID - 레이어 ID
 * @param {string} styleType - 제거할 스타일 타입
 * @returns {Promise<boolean>} - 성공 여부
 */
async function removeLayerStyle(layerID, styleType) {
    try {
        const styleData = {
            "_obj": "layerEffects",
            "scale": {
                "_unit": "percentUnit",
                "_value": 100
            }
        };

        // 해당 스타일을 비활성화
        styleData[styleType] = {
            "_obj": styleType,
            "enabled": false,
            "present": false
        };

        await batchPlay([
            {
                "_obj": "set",
                "_target": [
                    {
                        "_ref": "property",
                        "_property": "layerEffects"
                    },
                    {
                        "_ref": "layer",
                        "_enum": "ordinal",
                        "_value": "targetEnum"
                    }
                ],
                "to": styleData,
                "_isCommand": false
            }
        ], {});

        return true;
    } catch (error) {
        console.error(`Layer style 제거 실패 (${styleType}):`, error);
        return false;
    }
}

/**
 * Layer Style 복사
 * @param {string} sourceLayerID - 복사할 소스 레이어 ID
 * @returns {Promise<boolean>} - 성공 여부
 */
async function copyLayerStyle(sourceLayerID) {
    try {
        if (!sourceLayerID) {
            throw new Error("소스 레이어 ID가 필요합니다.");
        }

        await batchPlay([
            {
                "_obj": "copyEffects",
                "_isCommand": false
            }
        ], {});

        return true;
    } catch (error) {
        console.error("Layer style 복사 실패:", error);
        return false;
    }
}

/**
 * Layer Style 붙여넣기
 * @param {string} targetLayerID - 붙여넣을 대상 레이어 ID
 * @param {boolean} allowPasteFXOnLayerSet - 레이어 세트에 효과 붙여넣기 허용 여부
 * @returns {Promise<boolean>} - 성공 여부
 */
async function pasteLayerStyle(targetLayerID, allowPasteFXOnLayerSet = true) {
    try {
        if (!targetLayerID) {
            throw new Error("대상 레이어 ID가 필요합니다.");
        }

        await batchPlay([
            {
                "_obj": "pasteEffects",
                "allowPasteFXOnLayerSet": allowPasteFXOnLayerSet,
                "_isCommand": false
            }
        ], {});

        return true;
    } catch (error) {
        console.error("Layer style 붙여넣기 실패:", error);
        return false;
    }
}

/**
 * Layer Style 복사 및 붙여넣기 (한 번에 실행)
 * @param {string} sourceLayerID - 복사할 소스 레이어 ID
 * @param {string} targetLayerID - 붙여넣을 대상 레이어 ID
 * @param {boolean} allowPasteFXOnLayerSet - 레이어 세트에 효과 붙여넣기 허용 여부
 * @returns {Promise<boolean>} - 성공 여부
 */
async function copyPasteLayerStyle(sourceLayerID, targetLayerID, allowPasteFXOnLayerSet = true) {
    try {
        if (!sourceLayerID || !targetLayerID) {
            throw new Error("소스 레이어 ID와 대상 레이어 ID가 모두 필요합니다.");
        }

        // 먼저 복사
        const copySuccess = await copyLayerStyle(sourceLayerID);
        if (!copySuccess) {
            throw new Error("Layer style 복사에 실패했습니다.");
        }

        // 그 다음 붙여넣기
        const pasteSuccess = await pasteLayerStyle(targetLayerID, allowPasteFXOnLayerSet);
        if (!pasteSuccess) {
            throw new Error("Layer style 붙여넣기에 실패했습니다.");
        }

        return true;
    } catch (error) {
        console.error("Layer style 복사 및 붙여넣기 실패:", error);
        return false;
    }
}

module.exports = {
    // 메인 함수
    applyLayerStyle,
    applyMultipleStyles,
    removeLayerStyle,
    
    // 복사/붙여넣기 함수들
    copyLayerStyle,
    pasteLayerStyle,
    copyPasteLayerStyle,
    
    // 개별 스타일 함수들
    applyStroke,
    applyDropShadow,
    applyInnerShadow,
    applyOuterGlow,
    applyInnerGlow,
    applyBevelEmboss,
    applyColorOverlay,
    applyGradientOverlay,
    
    // 유틸리티 함수들
    buildStyleData,
    buildStrokeData,
    buildDropShadowData,
    buildInnerShadowData,
    buildOuterGlowData,
    buildInnerGlowData,
    buildBevelEmbossData,
    buildColorOverlayData,
    buildGradientOverlayData
};
