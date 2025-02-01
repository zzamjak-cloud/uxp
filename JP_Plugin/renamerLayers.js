const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { showAlert } = require("./lib/lib");
const { setLayerName, selectByLayerID } = require("./lib/lib_layer");
const { handleError } = require("./lib/errorHandler");
const { Logger } = require("./lib/logger");

const logger = new Logger('LayerRenamer');

const RENAME_TYPES = {
    PREFIX: 'prefix',       // 앞에 텍스트 추가
    SUFFIX: 'suffix',        // 뒤에 텍스트 추가
    RENAME: 'rename',       // 이름 변경
    REPLACE: 'replace',     // 텍스트 대체
    REMOVE: 'remove',       // 텍스트 제거
    NUMBER: 'number',       // 뒤에 숫자 추가
    REVERSE_NUMBER: 'reversenumber'  // 뒤에 역순 숫자 추가
};

// 입력값 검증
function validateInputs(type, text, replaceText = '') {
    const validTypes = Object.values(RENAME_TYPES);
    if (!validTypes.includes(type)) {
        throw new Error(`유효하지 않은 이름 변경 타입: ${type}`);
    }

    if (type !== RENAME_TYPES.RENAME && !text) {
        throw new Error('변경할 텍스트를 입력해주세요.');
    }

    if (type === RENAME_TYPES.REPLACE && !replaceText) {
        throw new Error('대체할 텍스트를 입력해주세요.');
    }
}

// 새 레이어 이름 생성
function generateNewName(layer, type, text, replaceText = '', index = 0, totalLayers = 0) {
    switch (type) {
        case RENAME_TYPES.PREFIX:
            return `${text}${layer.name}`;

        case RENAME_TYPES.SUFFIX:
            return `${layer.name}${text}`;

        case RENAME_TYPES.RENAME:
            return text || layer.name;

        case RENAME_TYPES.REPLACE:
            return layer.name.replace(text, replaceText);

        case RENAME_TYPES.REMOVE:
            return layer.name.replace(text, '');

        case RENAME_TYPES.NUMBER: {
            const num = totalLayers - index;
            return `${layer.name}_${String(num).padStart(2, '0')}`;
        }

        case RENAME_TYPES.REVERSE_NUMBER: {
            const num = index + 1;
            return `${layer.name}_${String(num).padStart(2, '0')}`;
        }

        default:
            return layer.name;
    }
}

// 단일 레이어 이름 변경
async function renameLayer(layer, newName) {
    try {
        await selectByLayerID(layer.id);
        await setLayerName(newName);
        logger.info(`Renamed layer: ${layer.name} → ${newName}`);
    } catch (error) {
        throw new Error(`Failed to rename layer ${layer.name}: ${error.message}`);
    }
}

// 메인 함수
async function renamerLayers(type) {
    try {
        const actLays = app.activeDocument.activeLayers;
        if (actLays.length === 0) {
            throw new Error('선택된 레이어가 없습니다.');
        }

        const textField = document.getElementById('renameText');
        const replaceTextField = document.getElementById('replaceText');
        const text = textField?.value || '';
        const replaceText = replaceTextField?.value || '';

        // 입력값 검증
        validateInputs(type, text, replaceText);

        let processedCount = 0;
        const totalLayers = actLays.length;

        await executeAsModal(async () => {
            logger.info(`Starting rename operation: ${type}`);
            logger.info(`Processing ${totalLayers} layers`);

            // 정순 또는 역순 처리
            const layers = type === RENAME_TYPES.REVERSE_NUMBER ? 
                [...actLays].reverse() : actLays;

            for (const [index, layer] of layers.entries()) {
                const newName = generateNewName(layer, type, text, replaceText, index, totalLayers);
                await renameLayer(layer, newName);
                processedCount++;
                logger.info(`Progress: ${processedCount}/${totalLayers}`);
            }

            logger.info('Rename operation completed successfully');
        }, { commandName: "Rename Layers" });

    } catch (error) {
        await handleError(error, 'layer_renamer');
    }
}

module.exports = {
    renamerLayers,
    // Export for testing
    validateInputs,
    generateNewName
};