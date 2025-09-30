const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { setLayerName, selectByLayerID, addSelectLayerIndividual } = require("./lib/lib_layer");
const { handleError } = require("./lib/errorHandler");
const { Logger } = require("./lib/logger");
const { showAlert } = require("./lib/lib");

const logger = new Logger('LayerRenamer');

// 프리셋 관리 클래스
class PresetManager {
    constructor() {
        this.storageKey = 'layerRenamerPresets';
        this.maxPresets = 6;
        this.presets = this.loadPresets();
    }

    // 로컬 스토리지에서 프리셋 로드
    loadPresets() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            logger.error(`Failed to load presets: ${error.message}`);
            return [];
        }
    }

    // 로컬 스토리지에 프리셋 저장
    savePresets() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.presets));
            logger.info(`Saved ${this.presets.length} presets`);
        } catch (error) {
            logger.error(`Failed to save presets: ${error.message}`);
        }
    }

    // 프리셋 추가
    addPreset(text) {
        if (this.presets.length >= this.maxPresets) {
            throw new Error(`최대 ${this.maxPresets}개의 프리셋만 추가할 수 있습니다.`);
        }
        
        if (!text || text.trim() === '') {
            throw new Error('프리셋 텍스트를 입력해주세요.');
        }

        const trimmedText = text.trim();
        if (this.presets.includes(trimmedText)) {
            throw new Error('이미 존재하는 프리셋입니다.');
        }

        this.presets.push(trimmedText);
        this.savePresets();
        logger.info(`Added preset: ${trimmedText}`);
    }

    // 프리셋 제거
    removePreset(text) {
        const index = this.presets.indexOf(text);
        if (index > -1) {
            this.presets.splice(index, 1);
            this.savePresets();
            logger.info(`Removed preset: ${text}`);
        }
    }

    // 모든 프리셋 가져오기
    getAllPresets() {
        return [...this.presets];
    }

    // 프리셋 존재 여부 확인
    hasPreset(text) {
        return this.presets.includes(text);
    }
}

// 전역 프리셋 매니저 인스턴스
const presetManager = new PresetManager();

// 프리셋 UI 관리 함수들
function createPresetItem(text) {
    const presetItem = document.createElement('div');
    presetItem.className = 'preset-item';
    presetItem.setAttribute('data-text', text);

    // 텍스트 표시 (읽기 전용)
    const textDisplay = document.createElement('span');
    textDisplay.className = 'preset-text';
    textDisplay.textContent = text;

    // 선택 버튼 (V 표시)
    const selectButton = document.createElement('sp-action-button');
    selectButton.className = 'preset-select';
    selectButton.textContent = '✓';
    selectButton.title = '선택';
    selectButton.addEventListener('click', () => {
        const renameTextField = document.getElementById('renameText');
        if (renameTextField) {
            renameTextField.value = text;
            logger.info(`Applied preset: ${text}`);
        }
    });

    // 제거 버튼
    const removeButton = document.createElement('sp-action-button');
    removeButton.className = 'preset-remove';
    removeButton.textContent = '×';
    removeButton.title = '제거';
    removeButton.addEventListener('click', () => {
        presetManager.removePreset(text);
        presetItem.remove();
        logger.info(`Removed preset: ${text}`);
    });

    presetItem.appendChild(textDisplay);
    presetItem.appendChild(selectButton);
    presetItem.appendChild(removeButton);

    return presetItem;
}

function renderPresets() {
    const container = document.getElementById('presetContainer');
    if (!container) return;

    // 기존 프리셋들 제거
    container.innerHTML = '';

    // 저장된 프리셋들 렌더링
    const presets = presetManager.getAllPresets();
    presets.forEach(preset => {
        const presetItem = createPresetItem(preset);
        container.appendChild(presetItem);
    });
}

async function addNewPreset() {
    try {
        const renameTextField = document.getElementById('renameText');
        if (!renameTextField) {
            throw new Error('텍스트 입력 필드를 찾을 수 없습니다.');
        }

        const text = renameTextField.value.trim();
        if (!text) {
            // 텍스트 필드에 포커스하고 placeholder를 강조
            renameTextField.focus();
            renameTextField.placeholder = '⚠️ 먼저 텍스트를 입력해주세요!';
            throw new Error('텍스트를 입력한 후 프리셋을 추가해주세요.');
        }

        presetManager.addPreset(text);
        renderPresets();
        
        // 성공 메시지 (선택사항)
        logger.info(`프리셋이 추가되었습니다: ${text}`);
        
        // 성공 시 텍스트 필드 초기화 및 포커스
        renameTextField.value = '';
        renameTextField.placeholder = 'Enter Text';
        renameTextField.focus();
        
    } catch (error) {
        logger.error(`Failed to add preset: ${error.message}`);
        console.error(`프리셋 추가 실패: ${error.message}`);
        
        // showAlert를 사용하여 에러 메시지 표시
        await showAlert(error.message);
        
        // 에러 메시지를 텍스트 필드에 임시로 표시
        const renameTextField = document.getElementById('renameText');
        if (renameTextField) {
            const originalValue = renameTextField.value;
            const originalPlaceholder = renameTextField.placeholder;
            
            renameTextField.value = `오류: ${error.message}`;
            renameTextField.style.color = '#ff6b6b';
            
            // 3초 후 원래 값으로 복원
            setTimeout(() => {
                renameTextField.value = originalValue;
                renameTextField.placeholder = originalPlaceholder;
                renameTextField.style.color = '';
            }, 3000);
        }
    }
}

// 프리셋 관련 이벤트 리스너 설정
function setupPresetEventListeners() {
    // + 버튼 클릭 이벤트
    const addPresetButton = document.getElementById('addPreset');
    if (addPresetButton) {
        addPresetButton.addEventListener('click', addNewPreset);
    }

    // 페이지 로드 시 기존 프리셋들 렌더링
    document.addEventListener('DOMContentLoaded', () => {
        renderPresets();
    });

    // DOM이 이미 로드된 경우 즉시 렌더링
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderPresets);
    } else {
        renderPresets();
    }
}

const RENAME_TYPES = {
    PREFIX: 'prefix',       // 앞에 텍스트 추가
    SUFFIX: 'suffix',        // 뒤에 텍스트 추가
    RENAME: 'rename',       // 이름 변경
    REPLACE: 'replace',     // 텍스트 대체
    NUMBER: 'number',       // 뒤에 숫자 추가
    REVERSE_NUMBER: 'reversenumber',  // 뒤에 역순 숫자 추가
    REMOVE: 'remove'        // 텍스트 제거
};

// 입력값 검증
function validateInputs(type, text, replaceText = '') {
    const validTypes = Object.values(RENAME_TYPES);
    if (!validTypes.includes(type)) {
        throw new Error(`유효하지 않은 이름 변경 타입: ${type}`);
    }

    if (type === RENAME_TYPES.NUMBER || type === RENAME_TYPES.REVERSE_NUMBER) {
        return;
    }

    if (type !== RENAME_TYPES.RENAME && !text) {
        throw new Error('변경할 텍스트를 입력해주세요.');
    }

    if (type === RENAME_TYPES.REPLACE && !replaceText) {
        throw new Error('대체할 텍스트를 입력해주세요.');
    }

    if (type === RENAME_TYPES.REMOVE && !text) {
        throw new Error('제거할 텍스트를 입력해주세요.');
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

        case RENAME_TYPES.NUMBER: {
            const num = totalLayers - index;
            return `${layer.name}_${String(num).padStart(2, '0')}`;
        }

        case RENAME_TYPES.REVERSE_NUMBER: {
            const num = index + 1;
            return `${layer.name}_${String(num).padStart(2, '0')}`;
        }

        case RENAME_TYPES.REMOVE:
            return layer.name.replace(text, '');

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

// 원래 선택 상태 복원
async function restoreOriginalSelection(originalLayerIDs) {
    try {
        if (originalLayerIDs.length === 0) {
            return;
        }

        logger.info(`Restoring selection for ${originalLayerIDs.length} layers`);
        
        // 첫 번째 레이어 선택
        await selectByLayerID(originalLayerIDs[0]);
        
        // 나머지 레이어들을 개별적으로 추가 선택
        for (let i = 1; i < originalLayerIDs.length; i++) {
            try {
                await addSelectLayerIndividual(originalLayerIDs[i]);
            } catch (error) {
                logger.warn(`Failed to add layer ${originalLayerIDs[i]} to selection: ${error.message}`);
            }
        }
        
        logger.info(`Selection restored: ${originalLayerIDs.length} layers`);
    } catch (error) {
        logger.error(`Failed to restore original selection: ${error.message}`);
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

        // 처음 선택된 레이어들의 ID를 저장
        const originalLayerIDs = actLays.map(layer => layer.id);
        logger.info(`Original selection saved: ${originalLayerIDs.length} layers`);

        let processedCount = 0;
        const totalLayers = actLays.length;

        await executeAsModal(async () => {
            logger.info(`Starting rename operation: ${type}`);
            logger.info(`Processing ${totalLayers} layers`);

            // 정순 또는 역순 처리
            //const layers = type === RENAME_TYPES.REVERSE_NUMBER ? [...actLays].reverse() : actLays;

            for (const [index, layer] of actLays.entries()) {
                const newName = generateNewName(layer, type, text, replaceText, index, totalLayers);
                await renameLayer(layer, newName);
                processedCount++;
                logger.info(`Progress: ${processedCount}/${totalLayers}`);
            }

            logger.info('Rename operation completed successfully');
            
            // 원래 선택 상태 복원
            await restoreOriginalSelection(originalLayerIDs);
        }, { commandName: "Rename Layers" });

    } catch (error) {
        await handleError(error, 'layer_renamer');
    }
}

module.exports = {
    renamerLayers,
    setupPresetEventListeners,
    renderPresets,
    presetManager
};