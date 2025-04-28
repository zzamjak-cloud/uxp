const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;


async function convertImageToPath() {
    try {
        console.log("Convert Image To Path!!");
        const doc = app.activeDocument;
        const curPathItem = doc.pathItems.getByName["Rectangle 1"];
        // curPathItem.select();
        console.log(curPathItem);
        
    } catch (e) {
        console.log(e.message);
    }
}


module.exports = {
    convertImageToPath
}