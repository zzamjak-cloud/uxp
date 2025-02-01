const app = require("photoshop").app;
const fs = require('uxp').storage.localFileSystem;
const { speedSave } = require("./speedSave");
const { appIconMaker, appIconPSDGenerate } = require("./appIconMaker");
const { patchMaker } = require("./patchMaker");
const { sortingLayer, pickSortingLayer } = require("./sortingLayer");
const { savePngAndLinkToPSD } = require("./savePsdAndPng");
const { getPath } = require("./getPath");
const { renamerLayers } = require("./renamerLayers");
const { makeDocImportEntry, exportLayersAsDocSize, exportLayersFromImportPSD } = require("./importExportLayers");
const { cleanPSD } = require("./cleanPSD");
const { addGuide } = require("./addGuide");
const { test } = require("./test");
const { clearHiddenEffects } = require("./clearHiddenEffects");

// 포토샵을 통해 파일을 열때는 반드시 executeAsModal을 사용해야 한다.
document.getElementById("appiconPSDgenerate").addEventListener("click", appIconPSDGenerate);
document.getElementById("appiconmaker").addEventListener("click", appIconMaker);
document.getElementById("patch").addEventListener("click", patchMaker);
document.getElementById("sortlayer").addEventListener("click", sortingLayer);
document.getElementById("picksort").addEventListener("click", pickSortingLayer);
// document.getElementById("clearhiddeneffect").addEventListener("click", clearHiddenEffects);

document.getElementById("prefix").addEventListener("click", () => {renamerLayers("prefix")});
document.getElementById("sufix").addEventListener("click", () => {renamerLayers("sufix")});
document.getElementById("rename").addEventListener("click", () => {renamerLayers("rename")});
document.getElementById("replace").addEventListener("click", () => {renamerLayers("replace")});
document.getElementById("number").addEventListener("click", () => {renamerLayers("number")});
document.getElementById("reversenumber").addEventListener("click", () => {renamerLayers("reversenumber")});
document.getElementById("remove").addEventListener("click", () => {renamerLayers("remove")});

document.getElementById("getPath1").addEventListener("click", () => { getPath('getPath1') });
document.getElementById("savePath1").addEventListener("click", () => { savePngAndLinkToPSD('getPath1') });

document.getElementById("getPath2").addEventListener("click", () => { getPath('getPath2') });
document.getElementById("savePath2").addEventListener("click", () => { savePngAndLinkToPSD('getPath2') });

document.getElementById("saveforwebpng").addEventListener("click", () => { speedSave('png') });
document.getElementById("saveforwebjpg").addEventListener("click", () => { speedSave('jpg') });

document.getElementById("import64").addEventListener("click", () => { makeDocImportEntry(64) });
document.getElementById("import128").addEventListener("click", () => { makeDocImportEntry(128) });
document.getElementById("import256").addEventListener("click", () => { makeDocImportEntry(256) });
document.getElementById("import512").addEventListener("click", () => { makeDocImportEntry(512) });

document.getElementById("savecharacter").addEventListener("click", exportLayersAsDocSize);
document.getElementById("savecharacterallpsd").addEventListener("click", exportLayersFromImportPSD);
document.getElementById("cleanpsd").addEventListener("click", cleanPSD);
document.getElementById("vCenterGuide").addEventListener("click", () => { addGuide('vertical') });
document.getElementById("hCenterGuide").addEventListener("click", () => { addGuide('horizontal') });
document.getElementById("clearHiddenFX").addEventListener("click", clearHiddenEffects);

document.addEventListener("DOMContentLoaded", existSavePath("getPath1"));
document.addEventListener("DOMContentLoaded", existSavePath("getPath2"));

// 플러그인 로드시 getPath 버튼 정보 표기
// 만약 기존에 연결해둔 것이 있다면, 그대로 표기
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


// 확장 UI 처리
document.addEventListener("DOMContentLoaded", expandUI("etcExpandableUI", "etcExpandButton", "ETC"));
document.addEventListener("DOMContentLoaded", expandUI("layerRenameExpandableUI", "layerRenameExpandButton", "LAYERS RENAME"));
document.addEventListener("DOMContentLoaded", expandUI("exportExpandableUI", "exportExpandButton", "EXPORT"));
document.addEventListener("DOMContentLoaded", expandUI("importExpandableUI", "importExpandButton", "IMPORT"));
document.addEventListener("DOMContentLoaded", expandUI("guideExpandableUI", "guideExpandButton", "GUIDE"));

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

