// Photoshop 및 UXP 모듈
const app = require("photoshop").app;
const fs = require('uxp').storage.localFileSystem;

// 사용자 정의 모듈
const { speedSave } = require("./speedSave");
const { appIconMaker, appIconPSDGenerate } = require("./appIconMaker");
const { patchMaker } = require("./patchMaker");
const { sortingLayer, pickSortingLayer } = require("./sortingLayer");
const { savePngAndLinkToPSD } = require("./savePsdAndPng");
const { getPath } = require("./getPath");
const { renamerLayers } = require("./renamerLayers");
const { makeDocImportEntry, exportLayersAsDocSize, exportLayersFromImportPSD, exportOnlySelectedLayers} = require("./importExportLayers");
const { cleanPSD } = require("./cleanPSD");
const { addGuide, addAllGuides } = require("./addGuide");
const { applyGridLayout } = require("./applyGridLayout");
//const { clearHiddenEffects } = require("./clearHiddenEffects");
//const { convertImageToPath } = require("./convertImageToPath");
const { exportMarketScreenshot } = require("./exportMarketScreenshot");
const { animationMatchLayers } = require("./animationMatchLayers");

// 경로 설정 객체
const pathConfig = {
    count: 2,
    prefix: 'getPath',
    handlers: {
        get: getPath,
        save: savePngAndLinkToPSD,
        init: existSavePath
    }
};

// Export
// 경로 ID 생성 및 처리
Array.from({length: pathConfig.count}, (_, i) => i + 1).forEach(num => {
    const pathId = `${pathConfig.prefix}${num}`;
    // 이벤트 리스너 등록
    document.getElementById(pathId)
        .addEventListener("click", () => pathConfig.handlers.get(pathId));
    document.getElementById(`savePath${num}`)
        .addEventListener("click", () => pathConfig.handlers.save(pathId));
    document.addEventListener("DOMContentLoaded", () => pathConfig.handlers.init(pathId)); // 초기화
});

document.getElementById("saveforwebpng").addEventListener("click", () => { speedSave('png') });
document.getElementById("saveforwebjpg").addEventListener("click", () => { speedSave('jpg') });

//document.getElementById("clearHiddenFX").addEventListener("click", clearHiddenEffects);
document.getElementById("savecharacter").addEventListener("click", exportLayersAsDocSize);
document.getElementById("savecharacterallpsd").addEventListener("click", exportLayersFromImportPSD);
document.getElementById("saveselctedlayer").addEventListener("click", exportOnlySelectedLayers);
document.getElementById("patch").addEventListener("click", patchMaker);
document.getElementById("sortlayer").addEventListener("click", sortingLayer);
document.getElementById("picksort").addEventListener("click", pickSortingLayer);
document.getElementById("exportMarketScreenshot").addEventListener("click", exportMarketScreenshot);

// Import extension_value '.psd' or '.png'
document.getElementById("importPSD").addEventListener("click", () => { makeDocImportEntry('.psd') });
document.getElementById("importPNG").addEventListener("click", () => { makeDocImportEntry('.png') });

// Layers Renamer
document.getElementById("prefix").addEventListener("click", () => {renamerLayers("prefix")});
document.getElementById("suffix").addEventListener("click", () => {renamerLayers("suffix")});
document.getElementById("rename").addEventListener("click", () => {renamerLayers("rename")});
document.getElementById("replace").addEventListener("click", () => {renamerLayers("replace")});
document.getElementById("number").addEventListener("click", () => {renamerLayers("number")});
document.getElementById("reversenumber").addEventListener("click", () => {renamerLayers("reversenumber")});

// Etc
document.getElementById("appiconPSDgenerate").addEventListener("click", appIconPSDGenerate);
document.getElementById("appiconmaker").addEventListener("click", () => appIconMaker("bicubicSharper"));
document.getElementById("appiconmakerDot").addEventListener("click", () => appIconMaker("nearestNeighbor"));
document.getElementById("cleanpsd").addEventListener("click", cleanPSD);
document.getElementById("applyGrid").addEventListener("click", applyGridLayout);
//document.getElementById("convertToPath").addEventListener("click", convertImageToPath);
document.getElementById("animationMatchLayers").addEventListener("click", animationMatchLayers);

//Guide
document.getElementById("applyGuide").addEventListener("click", () => { addAllGuides() });

// 확장 UI 처리
document.addEventListener("DOMContentLoaded", () => {
    expandUI("etcExpandableUI", "etcExpandButton", "ETC");
    expandUI("layerRenameExpandableUI", "layerRenameExpandButton", "LAYERS RENAME");
    expandUI("exportExpandableUI", "exportExpandButton", "EXPORT");
    expandUI("importExpandableUI", "importExpandButton", "IMPORT");
    expandUI("guideExpandableUI", "guideExpandButton", "GUIDE");
});

// 플러그인 로드시 getPath 버튼 정보 표기, 만약 기존에 연결해둔 것이 있다면, 그대로 표기
async function existSavePath(id) {
    // console.log('getPath!!')
    // 데이터 폴더의 엔트리들 얻은 후 모든 파일 리스트 추출
    const dataFolder = await fs.getDataFolder();
    const entries = await dataFolder.getEntries();
    // console.log(entries);

    try {
        // let txt_file = null;
        const saveFolder = document.getElementById(id);
        let flag = false;
        let folder_name = ""

        for (const entry of entries) {
            if (entry.name === `${id}.txt`) {
                flag = true;
                const folder_URL = await entry.read();
                const folder_name_array = folder_URL.split("\\");
                if (folder_name_array.length > 2) {
                    folder_name = folder_name_array[folder_name_array.length - 1];
                } else if (folder_name_array.length < 2) {
                    const folder_name_array_1 = folder_URL.split("/");
                    folder_name = folder_name_array_1[folder_name_array_1.length - 1];
                }
                break;
            }
        }

        if (flag) {
            saveFolder.innerText = folder_name;
        } 
    } catch(e) {
        console.log(e.message);
    }
}

function expandUI(ui_id, button_id, category_name) {
    const expandableUI = document.getElementById(ui_id);
    const expandButton = document.getElementById(button_id);
    
    // UI 요소를 보이도록 초기화
    expandableUI.style.display = "none";
    expandButton.textContent = `${category_name} +`;
    
    // 버튼 클릭 이벤트 처리
    expandButton.addEventListener("click", function() {
        if (expandableUI.style.display === "none") {
            expandableUI.style.display = "block";
            expandButton.textContent = `${category_name} -`;
        } else {
            expandableUI.style.display = "none";
            expandButton.textContent = `${category_name} +`;
        }
    });
}

