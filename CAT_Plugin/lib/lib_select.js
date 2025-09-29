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

async function selectionAreaTransparency() {
    await batchPlay([
        {
            _obj: "set",
            _target: [{
                _ref: "channel",
                _property: "selection"
            }],
            to: {
                _ref: "channel",
                _enum: "channel",
                _value: "transparencyEnum"
            }
        }
    ], {});
}

async function selectionExpand(tolerance) {
    await batchPlay([
        {
            _obj: "expand",
            by: {
                _unit: "pixelsUnit",
                _value: Math.floor(tolerance / 2)
            }
        }
    ], {});
}

// Bounds 영역을 선택하는 함수
// objValue : rectangle, point, polygon, freeform, ellipse, rectangleCorner
async function setBoundsRegion(objValue = "rectangle", bounds) {
    try {
        // 선택 영역 해제
        await deselectAll();
        
        // 사각형 영역 선택
        await batchPlay([
            {
                _obj: "set",
                _target: [{
                    _ref: "channel",
                    _property: "selection"
                }],
                to: {
                    _obj: objValue,
                    top: {
                        _unit: "pixelsUnit",
                        _value: bounds.y
                    },
                    left: {
                        _unit: "pixelsUnit",
                        _value: bounds.x
                    },
                    bottom: {
                        _unit: "pixelsUnit",
                        _value: bounds.y + bounds.height
                    },
                    right: {
                        _unit: "pixelsUnit",
                        _value: bounds.x + bounds.width
                    }
                }
            }
        ], {});
        
    } catch (error) {
        logger.error(`Failed to select bounds region`, error);
        throw error;
    }
}

module.exports = {
    deselectAll,
    selectionAreaTransparency,
    selectionExpand,
    setBoundsRegion
}