/**
 * 텍스트 프리셋 관리 라이브러리
 * 텍스트 프리셋을 저장하고 관리하는 기능을 제공합니다.
 */

// 텍스트 프리셋 관리 클래스
class TextPresetManager {
    constructor(storageKey = 'textPresets') {
        this.storageKey = storageKey;
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
        return trimmedText;
    }

    // 프리셋 제거
    removePreset(text) {
        const index = this.presets.indexOf(text);
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
    hasPreset(text) {
        return this.presets.includes(text);
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

    // 특정 인덱스의 프리셋 가져오기
    getPresetByIndex(index) {
        return this.presets[index] || null;
    }

    // 프리셋 업데이트
    updatePreset(oldText, newText) {
        const index = this.presets.indexOf(oldText);
        if (index > -1) {
            if (!newText || newText.trim() === '') {
                throw new Error('새로운 프리셋 텍스트를 입력해주세요.');
            }
            
            const trimmedNewText = newText.trim();
            if (this.presets.includes(trimmedNewText) && trimmedNewText !== oldText) {
                throw new Error('이미 존재하는 프리셋입니다.');
            }
            
            this.presets[index] = trimmedNewText;
            this.savePresets();
            return trimmedNewText;
        }
        return null;
    }
}

module.exports = {
    TextPresetManager
};
