const app = require('photoshop').app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require('photoshop').action;
const { handleError } = require('./lib/errorHandler');
const { Logger } = require('./lib/logger');
const { showAlert } = require('./lib/lib');
const { createDocCopyLayers, docResizeOptions } = require('./lib/lib_doc');
const { createMaskFromSelection } = require('./lib/lib_channel');
const { 
    createLay,
    duplicateLayer,
    getWorkPath,
    makeWorkPath,
    mergeLayers,
    rasterizeLayer,
    removeMask,
    setLayerName, 
    selectByLayerID
} = require('./lib/lib_layer');
const { deselectAll, selectionAreaTransparency, selectionExpand, setBoundsRegion } = require('./lib/lib_select');
const logger = new Logger('SplitToLayers');

/**
 * 레이어를 알파 채널 기준으로 분할하는 메인 함수 (Bounds 기반 방식)
 */
async function splitToLayers() {
    try {
        const doc = app.activeDocument;
        if (!doc.activeLayers || doc.activeLayers.length === 0) {
            throw new Error('레이어를 선택해주세요.');
        }

        const activeLayer = doc.activeLayers[0];
        if (activeLayer.kind === undefined || activeLayer.isBackgroundLayer) {
            throw new Error('지원되는 레이어 타입이 아닙니다.');
        }

        // 설정값 가져오기
        const config = {
            tolerance: 0,
            suffix: "_",
            addCount: true,
            confirmThreshold: 20,
            padding: 1  // 패딩 값 (픽셀)
        };
        
        await executeAsModal(async () => {
            await splitOperationBounds(activeLayer, config);
        }, { commandName: "Split to Layers" });

    } catch (error) {
        await handleError(error, 'split_to_layers');
    }
}

// Bounds 기반 분할 작업을 수행하는 함수
async function splitOperationBounds(baseLayer, config) {
    console.log('Bounds 기반 split 시작');
    
    try {
        // 1. 원본 레이어 선택
        await selectByLayerID(baseLayer.id);
        
        // 2. 레이어 래스터화 (필요한 경우)
        await rasterizeLayer();
        
        // 3. 마스크 제거 (있는 경우)
        await removeMask();
        
        // 4. 투명도 기반 선택 영역 생성
        await makeTransparencySelection(config.tolerance);
        
        if (!app.activeDocument.selection.bounds) {
            throw new Error('선택할 수 있는 영역이 없습니다.');
        }

        // 5. 패스 정보에서 bounds 계산
        const regionBounds = await collectRegionBounds(config);
        
        if (!regionBounds || regionBounds.length === 0) {
            throw new Error('분할할 영역을 찾을 수 없습니다.');
        }
        
        // 6. 각 영역을 개별 레이어로 복제
        const successCount = await createLayersFromBounds(baseLayer, regionBounds, config);
        
        // 7. 원본 레이어 숨기기
        baseLayer.visible = false;
        
    } catch (error) {
        logger.error('Split operation failed:', error);
        throw error;
    }
}

// 투명도 기반 선택 영역 생성
async function makeTransparencySelection(tolerance) {
    // 투명도 채널로 선택 영역 생성
    await selectionAreaTransparency();

    // tolerance 적용 (확장)
    if (tolerance >= 2) {
        await selectionExpand(tolerance);
    }
}

// 영역의 bounds 정보를 수집하는 함수
async function collectRegionBounds(config) {
    console.log('영역 bounds 수집 시작');
    
    // 1. 임시 문서 생성하여 패스 정보 수집
    const pathInfo = await collectPathInfoFromTempDoc();
    
    if (!pathInfo || pathInfo.length === 0) {
        return [];
    }
    
    // 2. 각 패스의 bounds 계산
    const regionBounds = [];
    
    for (let i = 0; i < pathInfo.length; i++) {
        const region = pathInfo[i];
        const bounds = calculateRegionBounds(region, config.padding);
        
        if (bounds) {
            regionBounds.push({
                ...bounds,
                originalIndex: i,
                originalRegion: region
            });
            
            console.log(`영역 ${i + 1} bounds: x=${bounds.x}, y=${bounds.y}, width=${bounds.width}, height=${bounds.height}`);
        }
    }
    
    return regionBounds;
}

// 임시 문서에서 패스 정보 수집
async function collectPathInfoFromTempDoc() {
    console.log('임시 문서에서 패스 정보 수집');
    
    // 새 문서 생성
    await createDocCopyLayers('temp');
    const tempDoc = app.activeDocument;
    
    try {
        // 이미지 크기를 2배로 확대 (정확한 패스 생성을 위해)
        await docResizeOptions(tempDoc, 200, 200, 'percentUnit', 'nearestNeighbor');
        await makeTransparencySelection(0);

        // 선택 영역을 패스로 변환
        await makeWorkPath(0.5);

        // 패스 정보 수집
        const pathInfo = await collectPathInfo();

        // 임시 문서 닫기
        await tempDoc.closeWithoutSaving();
        
        return pathInfo;
        
    } catch (error) {
        await tempDoc.closeWithoutSaving();
        throw error;
    }
}

// 패스 정보 수집 함수
async function collectPathInfo() {
    try {
        const result = await getWorkPath();  // WorkPath 정보 얻기

        if (!result?.[0]?.pathContents?.pathComponents) {
            console.warn('패스 데이터를 찾을 수 없습니다');
            return [];
        }

        const pathComponents = result[0].pathContents.pathComponents;
        const regions = [];

        // WorkPath 정보 처리 후 regions 배열에 추가
        for (const component of pathComponents) {
            if (!component.subpathListKey?.length) continue;
            
            for (const subpath of component.subpathListKey) {
                if (!subpath.points?.length) continue;
                
                // 각 서브패스의 모든 포인트 정보 수집
                const points = [];
                for (const point of subpath.points) {
                    if (point.anchor?.horizontal?._value !== undefined && 
                        point.anchor?.vertical?._value !== undefined) {
                        
                        const x = Math.round(point.anchor.horizontal._value);
                        const y = Math.round(point.anchor.vertical._value);
                        points.push({ x, y });
                    }
                }
                
                if (points.length > 0) {
                    // 첫 번째 포인트를 대표 좌표로 사용
                    const firstPoint = points[0];
                    console.log(`패스 좌표 발견: x=${firstPoint.x}, y=${firstPoint.y} (${points.length}개 포인트)`);
                    regions.push({ 
                        x: firstPoint.x, 
                        y: firstPoint.y,
                        points: points,
                        subpathIndex: regions.length
                    });
                }
            }
        }

        return regions;

    } catch (error) {
        console.error('패스 정보 수집 실패:', error);
        return [];
    }
}

// 영역의 bounds를 계산하는 함수
function calculateRegionBounds(region, padding) {
    try {
        if (!region.points || region.points.length === 0) {
            return null;
        }
        
        // 임시 문서에서 2배 확대했으므로 좌표를 원래 크기로 변환
        const points = region.points.map(point => ({
            x: Math.round(point.x / 2),
            y: Math.round(point.y / 2)
        }));
        
        // 최소/최대 좌표 찾기
        const minX = Math.min(...points.map(p => p.x));
        const maxX = Math.max(...points.map(p => p.x));
        const minY = Math.min(...points.map(p => p.y));
        const maxY = Math.max(...points.map(p => p.y));
        
        // bounds 계산 (패딩 포함)
        const bounds = {
            x: Math.max(0, minX - padding),
            y: Math.max(0, minY - padding),
            width: (maxX - minX) + (padding * 2),
            height: (maxY - minY) + (padding * 2)
        };
        
        // 최소 크기 보장
        if (bounds.width < 1) bounds.width = 1;
        if (bounds.height < 1) bounds.height = 1;
        
        return bounds;
        
    } catch (error) {
        console.error('Bounds 계산 실패:', error);
        return null;
    }
}

// Bounds 정보를 바탕으로 개별 레이어 생성
async function createLayersFromBounds(baseLayer, regionBounds, config) {
    
    let successCount = 0;
    
    for (let i = 0; i < regionBounds.length; i++) {
        try {
            await createLayerFromBounds(baseLayer, regionBounds[i], config, i + 1);
            successCount++;
        } catch (error) {
            logger.error(`Failed to create layer ${i + 1}`, error);
            // 에러가 발생해도 계속 진행
        }
    }
    
    return successCount;
}

// 개별 bounds에서 레이어 생성 (잘라내기 방식)
async function createLayerFromBounds(baseLayer, bounds, config, layerIndex) {
    try {
        // 1. 원본 레이어 복제
        await selectByLayerID(baseLayer.id);
        await duplicateLayer();
        
        // 2. bounds 영역 선택
        await setBoundsRegion("rectangle", bounds);
        if (!app.activeDocument.selection.bounds) {
            logger.warn(`No selection found for bounds at (${bounds.x}, ${bounds.y})`);
            return;
        }

        await createMaskFromSelection("revealSelection");  // 선택 영역을 마스크로 변환
        
        await deselectAll();  // 선택 영역 해제
        await createLay();    // 신규 레이어 생성
        await mergeLayers();  // 머지 레이어
        
        // 6. 레이어 이름 설정
        const layerName = generateLayerName(baseLayer.name, config, layerIndex);
        await setLayerName(layerName);
        
    } catch (error) {
        logger.error(`Failed to create layer from bounds at (${bounds.x}, ${bounds.y})`, error);
        await deselectAll();
        throw error;
    }
}

function generateLayerName(baseName, config, index) {
    let name = baseName + config.suffix;
    if (config.addCount) {
        name += index.toString().padStart(2, '0');
    }
    return name;
}

module.exports = {
    splitToLayers
};