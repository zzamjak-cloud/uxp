/**
 * 폴더 프리셋 관리 라이브러리
 * 폴더 경로를 프리셋으로 저장하고 관리하는 기능을 제공합니다.
 */

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
            console.log(`프리셋 로드 실패 : ${error.message}`);
            return [];
        }
    }

    // 로컬 스토리지에 프리셋 저장
    savePresets() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.presets));
        } catch (error) {
            console.log(`프리셋 저장 실패 : ${error.message}`);
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
        return preset;
    }

    // 프리셋 제거
    removePreset(presetId) {
        const index = this.presets.findIndex(p => p.id === presetId);
        if (index > -1) {
            const removed = this.presets.splice(index, 1)[0];
            this.savePresets();
            return removed;
        }
        return null;
    }

    // 모든 프리셋 가져오기
    getAllPresets() {
        return [...this.presets];
    }

    // 프리셋 존재 여부 확인
    hasPreset(folderPath) {
        return this.presets.some(p => p.path === folderPath);
    }

    // ID로 프리셋 찾기
    getPresetById(presetId) {
        return this.presets.find(p => p.id === presetId);
    }

    // 프리셋 개수 가져오기
    getPresetCount() {
        return this.presets.length;
    }

    // 최대 프리셋 개수 가져오기
    getMaxPresets() {
        return this.maxPresets;
    }

    // 모든 프리셋 초기화
    clearAllPresets() {
        this.presets = [];
        this.savePresets();
    }
}

module.exports = {
    FolderPresetManager
};
