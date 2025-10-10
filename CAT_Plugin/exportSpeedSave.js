const app = require('photoshop').app;
const fs = require('uxp').storage.localFileSystem;
const { executeAsModal } = require('photoshop').core;
const { saveForWebPNG, saveForWebJPG, saveForWebGIF } = require("./lib/lib_export");

async function speedSave(extension) {
   try {
      const doc = app.activeDocument;
      
      const folder_URL = doc.path.replace(doc.name, "");
      const folder_entry = await fs.getEntryWithUrl(`file:${folder_URL}`);
      const folder_token = await fs.createSessionToken(folder_entry)
      
      const file_URL = doc.path.replace("psd", extension);
      const file_entry = await fs.createEntryWithUrl(`file:${file_URL}`, { overwrite: true });
      const file_token = await fs.createSessionToken(file_entry);

      if (extension === 'png') {
         await executeAsModal( () => {
            saveForWebPNG(file_entry.name, folder_token, file_token) 
         }, 
         {"commandName": "SaveForWeb PNG"});
      } else if (extension === 'jpg') {
         await executeAsModal( () => { 
            saveForWebJPG(file_entry.name, folder_token, file_token) 
         }, 
         {"commandName": "SaveForWeb JPG"});
      } else if (extension === 'gif') {
         await executeAsModal( () => {
            saveForWebGIF(file_entry.name, folder_token, file_token, 256) 
         }, 
         {"commandName": "SaveForWeb GIF"});
      }
      console.log(`${extension} 저장 완료`);

   } catch (error) {
      console.log(error);
   }
}

module.exports = {
   speedSave
};
 