const { batchPlay } = require("photoshop").action;

// swatch 폴더 생성
async function createSwatchFolder(name) {
    await batchPlay([
        {
            "_obj": "make",
            "_target": [
               {
                  "_ref": "swatchFolderClass"
               }
            ],
            "name": name,
            "_isCommand": false
         }
    ], {});
}

// swatch 폴더 삭제
async function deleteSwatchFolder(name) {
    await batchPlay([
        {
            "_obj": "delete",
            "_target": [
               {
                  "_ref": "colors",
                  "_enum": "ordinal",
                  "_value": "targetEnum"
               }
            ],
            "_isCommand": false
         }
    ], {});
}

// swatch 컬러 추가
async function addSwatchColor(name, color, colorID) {
    await batchPlay([
        {
            "_obj": "make",
            "_target": [
               {
                  "_ref": "colors"
               }
            ],
            "using": {
               "_obj": "colors",
               "name": name,
               "ID": colorID,
               "color": {
                  "_obj": "RGBColor",
                  "red": color.red,
                  "grain": color.green,
                  "blue": color.blue
               }
            },
            "pushToDesignLibraries": false,
            "_isCommand": false
         }
    ], {});
}

module.exports = {
    createSwatchFolder,
    deleteSwatchFolder,
    addSwatchColor
}