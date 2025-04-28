const { batchPlay } = require("photoshop").action;

// 모든 선택 해제
async function deselectAll() {
    await batchPlay(
        [
            {
                _obj: "deselectAll"
            }
        ],
        {}
    );
}

module.exports = {
    deselectAll
}