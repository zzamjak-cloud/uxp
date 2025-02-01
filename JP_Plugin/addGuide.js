const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { makeGuide } = require('./lib/lib_guide');


async function addGuide(axis) {
    const doc = app.activeDocument;
    
    if (axis === 'vertical') {
        let position = doc.width * 0.5;
        await executeAsModal(() => {makeGuide(position, axis)}, {});
    } else if (axis === 'horizontal') {
        let position = doc.height * 0.5;
        await executeAsModal(() => {makeGuide(position, axis)}, {});
    }
}

async function addAllGuides() {
    try {
        await executeAsModal(async () => {
            const doc = app.activeDocument;
            const rows = parseInt(document.getElementById('guideRows').value) || 2;
            const cols = parseInt(document.getElementById('guideCols').value) || 2;
            
            // 수평 가이드 생성 (행)
            const sectionHeight = doc.height / rows;
            for (let i = 1; i < rows; i++) {
                const position = sectionHeight * i;
                await makeGuide(position, 'horizontal');
            }
            
            // 수직 가이드 생성 (열)
            const sectionWidth = doc.width / cols;
            for (let i = 1; i < cols; i++) {
                const position = sectionWidth * i;
                await makeGuide(position, 'vertical');
            }
        }, { commandName: 'Add All Guides' });
    } catch (error) {
        console.error('Error adding all guides:', error);
    }
}

module.exports = {
    addGuide,
    addAllGuides
}