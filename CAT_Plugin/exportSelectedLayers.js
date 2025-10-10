const fs = require('uxp').storage.localFileSystem;
const app = require('photoshop').app;
const { executeAsModal } = require('photoshop').core;
const { getSaveFolderPath, sanitizeFileName } = require('./lib/lib');
const { docCloseWithoutSaving, createDocCopyLayers } = require('./lib/lib_doc');
const { saveForWebPNG, saveAsPSD } = require('./lib/lib_export');
const { selectByLayerID, selectNoLays, layerTrim } = require('./lib/lib_layer');
const { showAlert } = require('./lib/lib');

// 폴더 프리셋 관리 클래스
class FolderPresetManager {
    constructor() {
        this.storageKey = 'exportFolderPresets';
        this.maxPresets = 6;
        this.presets = this.loadPresets();
    }

    // 로컬 스토리지에서 프리셋 로드
    loadPresets() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.log(`${error.message}`);
            return [];
        }
    }

    // 로컬 스토리지에 프리셋 저장
    savePresets() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.presets));
            console.log(`Saved ${this.presets.length} folder presets`);
        } catch (error) {
            console.log(`Failed to save folder presets: ${error.message}`);
        }
    }

    // 프리셋 추가
    addPreset(folderPath, folderName) {
        if (this.presets.length >= this.maxPresets) {
            throw new Error(`최대 ${this.maxPresets}개의 폴더 프리셋만 추가할 수 있습니다.`);
        }
        
        if (!folderPath || !folderName) {
            throw new Error('폴더 경로와 이름을 모두 입력해주세요.');
        }

        const preset = {
            path: folderPath,
            name: folderName,
            id: `folder_${Date.now()}`
        };

        // 중복 확인
        if (this.presets.some(p => p.path === folderPath)) {
            throw new Error('이미 존재하는 폴더 경로입니다.');
        }

        this.presets.push(preset);
        this.savePresets();
        console.log(`폴더 프리셋 추가 : ${folderName} (${folderPath})`);
        return preset;
    }

    // 프리셋 제거
    removePreset(presetId) {
        const index = this.presets.findIndex(p => p.id === presetId);
        if (index > -1) {
            const removed = this.presets.splice(index, 1)[0];
            this.savePresets();
            console.log(`폴더 프리셋 제거 : ${removed.name}`);
        }
    }

    // 모든 프리셋 가져오기
    getAllPresets() {
        return [...this.presets];
    }

    // 프리셋 존재 여부 확인
    hasPreset(folderPath) {
        return this.presets.some(p => p.path === folderPath);
    }
}

// 전역 폴더 프리셋 매니저 인스턴스
const folderPresetManager = new FolderPresetManager();

// 폴더 프리셋 UI 관리 함수들
function createFolderPresetItem(preset) {
    const presetItem = document.createElement('div');
    presetItem.className = 'folder-preset-item';
    presetItem.setAttribute('data-id', preset.id);

    // 폴더명 표시
    const folderDisplay = document.createElement('span');
    folderDisplay.className = 'folder-preset-name';
    folderDisplay.textContent = preset.name;
    folderDisplay.title = preset.path; // 툴팁으로 전체 경로 표시

    // 선택 버튼 (V 표시)
    const selectButton = document.createElement('sp-action-button');
    selectButton.className = 'folder-preset-select';
    selectButton.textContent = '✓';
    selectButton.title = '선택';
    selectButton.addEventListener('click', () => {
        selectFolderPreset(preset);
    });

    // 제거 버튼
    const removeButton = document.createElement('sp-action-button');
    removeButton.className = 'folder-preset-remove';
    removeButton.textContent = '×';
    removeButton.title = '제거';
    removeButton.addEventListener('click', () => {
        folderPresetManager.removePreset(preset.id);
        presetItem.remove();
    });

    presetItem.appendChild(folderDisplay);
    presetItem.appendChild(selectButton);
    presetItem.appendChild(removeButton);

    return presetItem;
}

function renderFolderPresets() {
    const container = document.getElementById('folderPresetContainer');
    if (!container) return;

    // 기존 프리셋들 제거
    container.innerHTML = '';

    // 저장된 프리셋들 렌더링
    const presets = folderPresetManager.getAllPresets();
    presets.forEach(preset => {
        const presetItem = createFolderPresetItem(preset);
        container.appendChild(presetItem);
    });
}

async function addNewFolderPreset() {
    try {
        // 폴더 선택 다이얼로그 열기
        const folder = await fs.getFolder();
        if (!folder) {
            throw new Error('폴더가 선택되지 않았습니다.');
        }

        const folderPath = folder.nativePath;
        const folderName = folder.name;

        // 프리셋 추가
        const preset = folderPresetManager.addPreset(folderPath, folderName);
        renderFolderPresets();
        
        console.log(`폴더 프리셋이 추가되었습니다: ${folderName}`);
        
    } catch (error) {
        console.error(`폴더 프리셋 추가 실패: ${error.message}`);
        await showAlert(error.message);
    }
}

function selectFolderPreset(preset) {
    try {
        // 현재 선택된 폴더 표시 업데이트
        const currentFolderDisplay = document.getElementById('currentFolderDisplay');
        if (currentFolderDisplay) {
            currentFolderDisplay.textContent = preset.name;
            currentFolderDisplay.title = preset.path;
        }

        // 선택된 프리셋을 데이터 폴더에 저장
        saveSelectedFolder(preset);
        
    } catch (error) {
        console.log(`폴더 프리셋 선택 실패 : ${error.message}`);
    }
}

async function saveSelectedFolder(preset) {
    try {
        // 현재 선택된 폴더를 데이터 폴더에 저장
        const dataFolder = await fs.getDataFolder();
        const file = await dataFolder.createFile('selectedFolder.txt', { overwrite: true });
        await file.write(JSON.stringify(preset));
        
    } catch (error) {
        console.log(`선택된 폴더 저장 실패 : ${error.message}`);
    }
}

async function loadSelectedFolder() {
    try {
        const dataFolder = await fs.getDataFolder();
        const entries = await dataFolder.getEntries();
        
        for (const entry of entries) {
            if (entry.name === 'selectedFolder.txt') {
                const content = await entry.read();
                const preset = JSON.parse(content);
                
                // UI 업데이트
                const currentFolderDisplay = document.getElementById('currentFolderDisplay');
                if (currentFolderDisplay) {
                    currentFolderDisplay.textContent = preset.name;
                    currentFolderDisplay.title = preset.path;
                }
                
                return preset;
            }
        }
        
        // 폴더가 선택되지 않은 경우 디폴트 텍스트 설정
        const currentFolderDisplay = document.getElementById('currentFolderDisplay');
        if (currentFolderDisplay) {
            currentFolderDisplay.textContent = '지정 폴더 없음';
            currentFolderDisplay.title = '';
        }
        
        return null;
    } catch (error) {
        console.log(`선택된 폴더 로드 실패 : ${error.message}`);
        
        // 에러 발생 시에도 디폴트 텍스트 설정
        const currentFolderDisplay = document.getElementById('currentFolderDisplay');
        if (currentFolderDisplay) {
            currentFolderDisplay.textContent = '지정 폴더 없음';
            currentFolderDisplay.title = '';
        }
        
        return null;
    }
}

// 폴더 프리셋 관련 이벤트 리스너 설정
function setupFolderPresetEventListeners() {
    // + 버튼 클릭 이벤트
    const addFolderPresetButton = document.getElementById('addFolderPreset');
    if (addFolderPresetButton) {
        addFolderPresetButton.addEventListener('click', addNewFolderPreset);
    }

    // 페이지 로드 시 기존 프리셋들 렌더링
    document.addEventListener('DOMContentLoaded', () => {
        renderFolderPresets();
        loadSelectedFolder();
    });

    // DOM이 이미 로드된 경우 즉시 렌더링
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            renderFolderPresets();
            loadSelectedFolder();
        });
    } else {
        renderFolderPresets();
        loadSelectedFolder();
    }
}

// 선택된 그룹 또는 스마트 오브젝트를 새 문서로 내보내기
// @param {string} pathId - 저장 경로 ID (getPath3) 또는 'dynamic' (동적 폴더 선택)
async function exportSelectedFile(pathId, fileType) {
    try {
        // 현재 문서 및 선택된 레이어 확인
        const originalDoc = app.activeDocument;
        const selectedLayers = [...originalDoc.activeLayers]; // 배열 복사로 안정성 확보

        // 체크박스 상태 확인 (문서 크기 유지 옵션)
        const maintainDocSizeCheckbox = document.getElementById('maintainDocSize');
        const isMaintainDocSize = maintainDocSizeCheckbox ? maintainDocSizeCheckbox.checked : false;

        if (selectedLayers.length === 0) {
            throw new Error('레이어를 선택해주세요.');
        }

        // fileType에 따른 유효한 레이어 필터링
        let validLayers;
        if (fileType === 'png') {
            // PNG일 경우 모든 레이어 타입 허용
            validLayers = selectedLayers;
        } else {
            // PSD일 경우 그룹 또는 스마트 오브젝트만 허용
            validLayers = selectedLayers.filter(layer => 
                layer.kind === 'group' || layer.kind === 'smartObject'
            );
        }

        if (validLayers.length === 0) {
            if (fileType === 'png') {
                throw new Error('레이어를 선택해주세요.');
            } else {
                throw new Error('그룹 레이어 또는 스마트 오브젝트를 선택해주세요.');
            }
        }

        // 저장 폴더 경로 가져오기
        let saveFolder;
        if (pathId === 'dynamic') {
            // 동적 폴더 선택 사용
            const selectedPreset = await loadSelectedFolder();
            if (!selectedPreset) {
                throw new Error('저장 폴더가 지정되지 않았습니다. 먼저 폴더 프리셋을 선택해주세요.');
            }
            
            // 프리셋에서 폴더 정보 생성
            const folderEntry = await fs.getEntryWithUrl(`file:${selectedPreset.path}`);
            const folderToken = await fs.createSessionToken(folderEntry);
            
            saveFolder = {
                folderPath: selectedPreset.path,
                folderToken: folderToken,
                folderName: selectedPreset.name
            };
        } else {
            // 기존 방식 사용
            saveFolder = await getSaveFolderPath(pathId);
            if (!saveFolder) {
                throw new Error('저장 폴더가 지정되지 않았습니다. 먼저 폴더를 선택해주세요.');
            }
        }

        // 처리 통계
        let successCount = 0;
        let failedLayers = [];

        // 각 레이어별로 개별 처리 (순차 처리로 안정성 확보)
        for (let i = 0; i < validLayers.length; i++) {
            const layer = validLayers[i];
            try {
                await processLayer(layer, originalDoc, saveFolder, fileType, isMaintainDocSize);
                successCount++;
            } catch (error) {
                failedLayers.push({
                    name: layer.name,
                    error: error.message
                });
                continue;
            }
        }
    } catch (error) {
        console.log(error);
    }
}

// 개별 레이어 처리
async function processLayer(layer, originalDoc, saveFolder, fileType, isMaintainDocSize) {
    try {
        // 원본 문서가 활성 상태인지 확인
        if (app.activeDocument.id !== originalDoc.id)  
            app.activeDocument = originalDoc;

        await executeAsModal(async () => {
            await copyLayerToNewDocument(layer, originalDoc, saveFolder, fileType, isMaintainDocSize);
        }, { 
            commandName: `Export ${layer.name}`,
            historyStateInfo: {
                name: `Export Layer: ${layer.name}`,
                target: originalDoc
            }
        });
    } catch (error) {
        console.log(`❌ Error processing layer ${layer.name}: ${error.message}`);
        
        // 원본 문서로 안전하게 복귀
        try {
            if (app.activeDocument && app.activeDocument.id !== originalDoc.id) {
                app.activeDocument = originalDoc;
            }
        } catch (docError) {
            console.log(`Failed to return to original document: ${docError.message}`);
        }
        
        throw new Error(`레이어 "${layer.name}" 처리 실패: ${error.message}`);
    }
}

// 레이어를 새 문서로 복사하고 저장
async function copyLayerToNewDocument(layer, originalDoc, saveFolder, fileType, isMaintainDocSize) {
    
    let newDoc = null;
    
    try {
        // 1. 원본 문서에서 레이어 선택
        app.activeDocument = originalDoc;
        await selectNoLays();
        await selectByLayerID(layer.id);

        // 2. 선택된 레이어를 새 문서로 복사
        await createDocCopyLayers(layer.name);

        // 3. 새 문서 참조 가져오기
        newDoc = app.activeDocument;
        
        if (!newDoc || newDoc.id === originalDoc.id) {
            throw new Error('새 문서 생성에 실패했습니다.');
        }

        // 4. 문서 크기 유지 옵션에 따른 처리
        if (!isMaintainDocSize) 
            await layerTrim();

        // 5. 파일 저장
        await saveFiles(layer.name, saveFolder, fileType);

        // 6. 새 문서 닫기
        await docCloseWithoutSaving(newDoc);

        // 7. 원본 문서로 안전하게 복귀
        app.activeDocument = originalDoc;

    } catch (error) {
        console.log(`Error in copyLayerToNewDocument: ${error.message}`);
        
        // 에러 발생 시 정리 작업
        try {
            if (newDoc && newDoc.id !== originalDoc.id) {
                console.log(`Cleaning up: closing document ${newDoc.name}`);
                await docCloseWithoutSaving(newDoc);
            }
        } catch (cleanupError) {
            console.log(`Cleanup failed: ${cleanupError.message}`);
        }
        
        // 원본 문서로 복귀
        try {
            app.activeDocument = originalDoc;
        } catch (docError) {
            console.log(`Failed to return to original document: ${docError.message}`);
        }
        
        throw error;
    }
}

// PSD 및 PNG 파일 저장
async function saveFiles(layerName, saveFolder, fileType) {
    try {
        const sanitizedName = sanitizeFileName(layerName);
        
        // PNG 저장 (PSD와 PNG 타입 모두에서 필요)
        const pngFileName = `${sanitizedName}.png`;
        const pngFilePath = `${saveFolder.folderPath}/${pngFileName}`;
        const pngFileEntry = await fs.createEntryWithUrl(`file:${pngFilePath}`, { overwrite: true });
        const pngFileToken = await fs.createSessionToken(pngFileEntry);
        
        await saveForWebPNG(pngFileName, saveFolder.folderToken, pngFileToken);
        
        // PSD 저장 (PSD 타입일 때만)
        if (fileType === 'psd') {
            const psdFileName = `${sanitizedName}.psd`;
            const psdFilePath = `${saveFolder.folderPath}/${psdFileName}`;
            const psdFileEntry = await fs.createEntryWithUrl(`file:${psdFilePath}`, { overwrite: true });
            const psdFileToken = await fs.createSessionToken(psdFileEntry);
            
            await saveAsPSD(psdFileToken);
            console.log(`Saved PSD: ${psdFileName}`);
        }

    } catch (error) {
        throw new Error(`파일 저장 실패: ${error.message}`);
    }
}

module.exports = {
    exportSelectedFile,
    setupFolderPresetEventListeners,
    renderFolderPresets,
    folderPresetManager
};