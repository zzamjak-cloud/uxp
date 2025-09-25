const { batchPlay } = require("photoshop").action;

// position = px, axis = 'vertical', 'horizontal'
async function makeGuide(position, axis) {
    const action = {
        _obj: "make",
        new: {
        _obj: "good",
        position: {
            _unit: "pixelsUnit",
            _value: position
        },
        orientation: {
            _enum: "orientation",
            _value: axis
        },
        kind: {
            _enum: "kind",
            _value: "document"
        },
        _target: [
            {
                _ref: "document",
                _id: 388
            },
            {
                _ref: "good",
                _index: 1
            }
        ],
        $GdCA: 0,
        $GdCR: 74,
        $GdCG: 255,
        $GdCB: 255
        },
        _target: [
        {
            _ref: "good"
        }
        ],
        guideTarget: {
        _enum: "guideTarget",
        _value: "guideTargetCanvas"
        },
        _options: {
        dialogOptions: "dontDisplay"
        }
    }
    await batchPlay([action],{});
}

module.exports = {
    makeGuide
}