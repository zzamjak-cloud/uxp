const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require("photoshop").action;
const { showAlert } = require("./lib/lib");
const { selectNoLays, selectByLayerID } = require("./lib/lib_layer");

/**
 * 타임라인의 모든 프레임에 대해 레이어 선택후 Match 처리하는 함수
 * 각 프레임에 활성화된 레이어를 선택 ("Layer 1" 이름의 레이어만 제외)
 * animationMatchLayer 적용
 */
async function animationMatchLayers() {
    try {
        await executeAsModal(async () => {

            const framesCount = await getFramesCount(); // 총 프레임 수 가져오기
            console.log(`총 프레임 수: ${framesCount}개 처리 시작`);

            // 각 프레임 처리
            for (let frameIndex = 0; frameIndex < framesCount; frameIndex++) {
                try {
                    await selectFrame(frameIndex + 1); // 프레임 선택
                    await new Promise(resolve => setTimeout(resolve, 100)); // 약간의 지연시간 추가 : 레이어 가시성을 업데이트 시간
                    await selectVisibleLayer();  // 활성화된 레이어만 선택
                    await applyAnimationMatchLayer(); // 레이어 속성 일치 적용

                    console.log(`프레임 ${frameIndex + 1} 처리 완료`);

                } catch (frameError) {
                    console.error(`프레임 ${frameIndex + 1} 처리 중 오류:`, frameError);
                    // 오류 무시하고 다음 프레임으로 진행
                    continue;
                }
            }
        });
    } catch (error) {
        console.error("animationMatchLayers 오류:", error);
        await showAlert("애니메이션 레이어 매칭 중 오류가 발생했습니다.");
    }
}

// 프레임 수를 가져오는 함수
async function getFramesCount() {
    try {
        const info = await batchPlay(
            [{
                _obj: "get",
                _target: [
                    {_property: 'frameCount'},
                    {
                        _ref: 'animationClass',
                        _enum: 'ordinal',
                        _value: 'targetEnum'
                    }
                ],
                _options: {
                dialogOptions: 'dontDisplay'
                }
            }],{}
        );

        console.log(info[0].frameCount);
        return info[0].frameCount; // 프레임 수 반환
    } catch (error) {
        console.error("타임라인 프레임 수 가져오기 오류:", error);
    }
}

// 프레임 선택 함수
// 프레임 인덱스는 0부터 시작하므로, UI에서는 1부터 시작하는 것에 유의
async function selectFrame(frameIndex) {
    try {
        await batchPlay(
            [{
                _obj: "select",
                _target: [{
                    _ref: "animationFrameClass",
                    _index: frameIndex
                }],
                _options: {
                    dialogOptions: "dontDisplay"
                }
            }],
            { synchronousExecution: true }
        );
    } catch (error) {
        console.error(`프레임 ${frameIndex} 선택 중 오류:`, error);
    }
}

// 레이어 선택 함수
async function selectVisibleLayer() {
    try {

        const doc = app.activeDocument;

        // 기존 선택 항목 지우기
        await selectNoLays();
        
        // 보이는 레이어 선택하기
        for (const layer of doc.layers) {

            // Layer 1 건너뛰기
            if (layer.name == "Layer 1") {
                continue;
            }
            
            // 레이어가 보이는지 확인
            if (layer.visible) {
                console.log(`활성 레이어: ${layer.name}`);
                await selectByLayerID(layer.id);
                break; // 첫 번째 보이는 레이어만 선택
            }
        }
        
    } catch (error) {
        console.error("selectVisibleLayer 오류:", error);
    }
}

// 레이어 Match 적용 함수
async function applyAnimationMatchLayer() {
    try {
        await batchPlay(
            [{
                _obj: "animationMatchLayer",
                animationMatchLayerPosition: true, // 위치 매칭
                animationMatchLayerVisibility: false, // 가시성 매칭
                animationMatchLayerStyle: false, // 스타일 매칭
                _options: {
                    dialogOptions: "dontDisplay"
                }
            }],
            { synchronousExecution: true }
        );
        console.log("레이어 매칭 적용됨");
    } catch (error) {
        console.error("애니메이션 레이어 매칭 적용 오류:", error);
    }
}

module.exports = {
    animationMatchLayers
};