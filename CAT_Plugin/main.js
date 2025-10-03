// Photoshop 및 UXP 모듈
const app = require("photoshop").app;
const fs = require('uxp').storage.localFileSystem;

// 사용자 정의 모듈
const { showAlert } = require("./lib/lib");
const { speedSave } = require("./exportSpeedSave");
const { exportSelectedFile, setupFolderPresetEventListeners } = require("./exportSelectedLayers");
const { savePngAndLinkToPSD } = require("./exportSelectedAndLink");
const { appIconMaker, appIconPSDGenerate } = require("./appIconMaker");
const { patchMaker } = require("./patchMaker");
const { sortingLayer, pickSortingLayer } = require("./sortingLayer");
const { renamerLayers, setupPresetEventListeners } = require("./renamerLayers");
const { makeDocImportEntry} = require("./importFiles");
const { addAllGuides, clearGuides } = require("./addGuide");
const { applyGridLayout } = require("./applyGridLayout");
const { animationMatchLayers } = require("./animationMatchLayers");
const { cleanPSD } = require("./cleanPSD");
const { clearHiddenEffects } = require("./clearHiddenEffects");
const { splitToLayers } = require("./splitToLayers");
const { clearEmptyLayers } = require("./clearEmptyLayers");

// Export - 새로운 동적 폴더 시스템 사용
// 기존 경로 설정 시스템은 제거됨

// 새로운 Export 버튼들 (동적 폴더 선택 사용)
document.getElementById("exportLink").addEventListener("click", () => { savePngAndLinkToPSD('dynamic') });
document.getElementById("exportPSD").addEventListener("click", () => { exportSelectedFile('dynamic', 'psd') });
document.getElementById("exportPNG").addEventListener("click", () => { exportSelectedFile('dynamic', 'png') });

document.getElementById("saveforwebpng").addEventListener("click", () => { speedSave('png') });
document.getElementById("saveforwebjpg").addEventListener("click", () => { speedSave('jpg') });
document.getElementById("patch").addEventListener("click", patchMaker);
document.getElementById("sortlayer").addEventListener("click", sortingLayer);
document.getElementById("picksort").addEventListener("click", pickSortingLayer);
document.getElementById("clearHiddenFX").addEventListener("click", () => {clearHiddenEffects()});
document.getElementById("clearEmptyLayers").addEventListener("click", () => {clearEmptyLayers()});

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
document.getElementById("remove").addEventListener("click", () => {renamerLayers("remove")});

// Etc
document.getElementById("appiconPSDgenerate").addEventListener("click", appIconPSDGenerate);
document.getElementById("appiconmaker").addEventListener("click", () => appIconMaker("bicubicSharper"));
document.getElementById("appiconmakerDot").addEventListener("click", () => appIconMaker("nearestNeighbor"));
document.getElementById("applyGrid").addEventListener("click", applyGridLayout);
// document.getElementById("animationMatchLayers").addEventListener("click", animationMatchLayers);
document.getElementById("cleanPSD").addEventListener("click", cleanPSD);
document.getElementById("splitToLayers").addEventListener("click", splitToLayers);
//Guide
document.getElementById("applyGuide").addEventListener("click", () => { addAllGuides() });
document.getElementById("clearGuide").addEventListener("click", () => { clearGuides() });

// 확장 UI 처리
document.addEventListener("DOMContentLoaded", () => {
    expandUI("etcExpandableUI", "etcExpandButton", "ETC");
    expandUI("layerRenameExpandableUI", "layerRenameExpandButton", "LAYERS RENAME");
    expandUI("exportExpandableUI", "exportExpandButton", "EXPORT");
    expandUI("importExpandableUI", "importExpandButton", "IMPORT");
    expandUI("guideExpandableUI", "guideExpandButton", "GUIDE");
    
    // 프리셋 이벤트 리스너 설정
    setupPresetEventListeners();
    
    // 폴더 프리셋 이벤트 리스너 설정
    setupFolderPresetEventListeners();
});

// 기존 existSavePath 함수는 제거됨 (새로운 동적 폴더 시스템 사용)

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

