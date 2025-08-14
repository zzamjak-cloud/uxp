const app = require("photoshop").app;
const fs = require('uxp').storage.localFileSystem;
const { renamerLayers } = require("./renamerLayers");


document.getElementById("prefix").addEventListener("click", () => {renamerLayers("prefix")});
document.getElementById("sufix").addEventListener("click", () => {renamerLayers("sufix")});
document.getElementById("rename").addEventListener("click", () => {renamerLayers("rename")});
document.getElementById("replace").addEventListener("click", () => {renamerLayers("replace")});
document.getElementById("number").addEventListener("click", () => {renamerLayers("number")});
document.getElementById("reversenumber").addEventListener("click", () => {renamerLayers("reversenumber")});

// for Spine2D Animator : 1 line
document.getElementById("prefixignore").addEventListener("click", () => {renamerLayers("ignore")});
document.getElementById("prefixfolder").addEventListener("click", () => {renamerLayers("folder")});
document.getElementById("prefixorigin").addEventListener("click", () => {renamerLayers("origin")});
document.getElementById("prefixmerge").addEventListener("click", () => {renamerLayers("merge")});
// for Spine2D Animator : 2 line
document.getElementById("prefixhead").addEventListener("click", () => {renamerLayers("head")});
document.getElementById("prefixbody").addEventListener("click", () => {renamerLayers("body")});
document.getElementById("prefixarm").addEventListener("click", () => {renamerLayers("arm")});
document.getElementById("prefixleg").addEventListener("click", () => {renamerLayers("leg")});
document.getElementById("prefixfoot").addEventListener("click", () => {renamerLayers("foot")});
document.getElementById("prefixhair").addEventListener("click", () => {renamerLayers("hair")});
document.getElementById("prefixhand").addEventListener("click", () => {renamerLayers("hand")});
// for Spine2D Animator : 3 line
document.getElementById("prefixf").addEventListener("click", () => {renamerLayers("_F")});
document.getElementById("prefixb").addEventListener("click", () => {renamerLayers("_B")});
document.getElementById("prefixr").addEventListener("click", () => {renamerLayers("_R")});
document.getElementById("prefixl").addEventListener("click", () => {renamerLayers("_L")});




document.addEventListener("DOMContentLoaded", expandUI("layerRenameExpandableUI", "layerRenameExpandButton", "LAYERS RENAME"));

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

