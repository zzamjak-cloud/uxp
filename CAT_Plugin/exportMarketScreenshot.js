const app = require("photoshop").app;
const fs = require('uxp').storage.localFileSystem;
const { executeAsModal } = require('photoshop').core;
const { showAlert } = require("./lib/lib");
const { layerVisible } = require("./lib/lib_doc");
const { saveForWebPNG } = require("./lib/lib_export");

/**
 * Export PNGs for each country layer group in the current document
 * Country codes are typically: kr, jp, en, ch, fr, etc.
 */
async function exportMarketScreenshot() {
    try {
        const doc = app.activeDocument;
        
        const folder_URL = doc.path.replace(doc.name, "");
        const folder_entry = await fs.getEntryWithUrl(`file:${folder_URL}`);
        const folder_token = await fs.createSessionToken(folder_entry)
        
        // PSD 파일명 얻기
        const docName = doc.name.replace(/\.(psd|psb)$/i, '');
        
        // 모든 레이어 가져오기
        const allLayers = doc.layers;
        
        // 국가코드 식별
        const countryLayers = [];

        for (const layer of allLayers) {
            // Check if it's a group layer and has a country code name
            if (layer.kind === 'group' && isCountryCode(layer.name)) {
                countryLayers.push(layer);
                console.log(`Found country layer: ${layer.name}`);
            }
        }
        
        if (countryLayers.length === 0) {
            await showAlert("국가코드 레이어가 존재하지 않습니다.");
            return;
        }
        
        // 국가코드 레이어를 모두 비활성화
        await executeAsModal(async () => {
            for (const layer of countryLayers) {
                await layerVisible("hide", layer.name);
            }
        }, { commandName: "Hide All Country Layers" });
        
        // For each country layer: show it, export PNG, then hide it again
        for (const layer of countryLayers) {
            const countryCode = layer.name;
            const pngFileName = `${docName}_${countryCode}.png`;
            console.log(`Exporting: ${pngFileName}`);
            
            // Create the file entry for this export
            const pngFilePath = `${folder_URL}/${pngFileName}`;
            const pngFileEntry = await fs.createEntryWithUrl(`file:${pngFilePath}`, { overwrite: true });
            const pngFileToken = await fs.createSessionToken(pngFileEntry);
            
            // Show this country layer, export, then hide it again
            await executeAsModal(async () => {
                // Show only this country layer
                await layerVisible("show", countryCode);
                
                // Export as PNG
                await saveForWebPNG(pngFileName, folder_token, pngFileToken);
                
                // Hide this country layer again
                await layerVisible("hide", countryCode);
            }, { commandName: `Export ${countryCode}` });
        }
        
        await showAlert(`Successfully exported ${countryLayers.length} market screenshots!`);
        
    } catch (error) {
        console.error("Error in exportMarketScreenshot:", error);
        await showAlert(`Error: ${error.message}`);
    }
}

/**
 * Check if a layer name is a country code
 * This function can be expanded to include more country codes as needed
 */
function isCountryCode(name) {
    // Common country codes, can be expanded as needed
    const countryCodes = ['kr', 'jp', 'en', 'cn', 'fr', 'de', 'es', 'it', 'ru', 'pt', 'nl', 'ca', 'tw', 'hk'];
    
    // Check if the name exactly matches one of the country codes
    return countryCodes.includes(name.toLowerCase());
}

module.exports = {
    exportMarketScreenshot
};