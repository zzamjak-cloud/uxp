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


module.exports = {
    addGuide
}