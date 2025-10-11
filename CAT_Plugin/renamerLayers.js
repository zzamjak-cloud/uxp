const app = require("photoshop").app;
const { batchPlay } = require("photoshop").action;
const { 
    selectByLayerID, 
    addSelectLayerIndividual, 
    createLayerRenameCommands 
    } = require("./lib/lib_layer");
const { executeModalWithHistoryGrouping } = require("./lib/lib");
const { showAlert } = require("./lib/lib");
const { TextPresetManager } = require("./lib/lib_text_preset");

// 전역 프리셋 매니저 인스턴스
const presetManager = new TextPresetManager('layerRenamerPresets');

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
    selectButton.textContent = 'v';
    selectButton.title = '선택';
    selectButton.addEventListener('click', () => {
        const renameTextField = document.getElementById('renameText');
        if (renameTextField) {
            renameTextField.value = text;
        }
    });

    // 제거 버튼
    const removeButton = document.createElement('sp-action-button');
    removeButton.className = 'preset-remove';
    removeButton.textContent = 'x';
    removeButton.title = '제거';
    removeButton.addEventListener('click', () => {
        presetManager.removePreset(text);
        presetItem.remove();
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
        
        // 성공 시 텍스트 필드 초기화 및 포커스
        renameTextField.value = '';
        renameTextField.placeholder = 'Enter Text';
        renameTextField.focus();
        
    } catch (error) {
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


// 원래 선택 상태 복원
async function restoreOriginalSelection(originalLayerIDs) {
    try {
        if (originalLayerIDs.length === 0) {
            return;
        }
        
        // 첫 번째 레이어 선택
        await selectByLayerID(originalLayerIDs[0]);
        
        // 나머지 레이어들을 개별적으로 추가 선택
        for (let i = 1; i < originalLayerIDs.length; i++) {
            try {
                await addSelectLayerIndividual(originalLayerIDs[i]);
            } catch (error) {
                console.log(`Failed to add layer ${originalLayerIDs[i]} to selection: ${error.message}`);
            }
        }
    } catch (error) {
        console.log(`원래 선택 상태 복원 실패 : ${error.message}`);
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

        let processedCount = 0;
        const totalLayers = actLays.length;

        // 새로운 범용 히스토리 그룹핑 함수 사용
        await executeModalWithHistoryGrouping(
            async (context) => {
                // 모든 레이어의 새 이름을 미리 계산
                const layerNamePairs = [];
                for (const [index, layer] of actLays.entries()) {
                    const newName = generateNewName(layer, type, text, replaceText, index, totalLayers);
                    layerNamePairs.push({
                        layerID: layer.id,
                        newName: newName
                    });
                }

                // 히스토리 그룹핑과 함께 레이어 이름 변경
                const batchCommands = createLayerRenameCommands(layerNamePairs);
                await batchPlay(batchCommands, {});
                processedCount = totalLayers;
                
                // 원래 선택 상태 복원
                await restoreOriginalSelection(originalLayerIDs);
            },
            "레이어 일괄 이름 변경",  // 히스토리 이름
            "Rename Layers"  // 명령 이름
        );

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    renamerLayers,
    setupPresetEventListeners
};