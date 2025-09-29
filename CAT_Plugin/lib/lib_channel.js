// ContiguityMask 채널 선택
const { batchPlay } = require('photoshop').action;

async function selectMaskByName(channelName = "ContiguityMask") {
    await batchPlay([
        {
            _obj: "select",
            _target: [{
                _ref: "channel",
                _name: channelName
            }]
        }
    ], {});
}

async function selectRGBChannel() {
    await batchPlay([
    {
        _obj: "select",
        _target: [{
            _ref: "channel",
            _enum: "channel",
            _value: "RGB"
        }]
    }], {});
}

// 채널 생성
async function createMask(channelName = "ContiguityMask", r=255, g=0, b=0, opacity=50) {
    await batchPlay([
        {
            _obj: "make",
            new: {
                _class: "channel",
                name: channelName,
                colorIndicates: {
                    _enum: "maskIndicator",
                    _value: "maskedAreas"
                },
                color: {
                    _obj: "RGBColor",
                    red: r,
                    grain: g,
                    blue: b
                },
                opacity: opacity
            },
            using: {
                _ref: "channel",
                _property: "selection"
            }
        }
    ], {});
}

// 선택 영역으로부터 마스크 생성
// selectionValue : revealSelection, revealSelectionOnly, none
async function createMaskFromSelection(selectionValue = "revealSelection") {
    await batchPlay([
        {
            _obj: "make",
            new: {
                _class: "channel"
            },
            at: {
                _ref: "channel",
                _enum: "channel",
                _value: "mask"
            },
            using: {
                _enum: "userMaskEnabled",
                _value: selectionValue
            }
        }
    ], {});
}

// 채널에서 선택 영역 설정 (Magic Wand로 연속 영역 선택)
async function setMaskRegionSelection(region) {
    await batchPlay([
        {
            _obj: "set",
            _target: [{
                _ref: "channel",
                _property: "selection"
            }],
            to: {
                _obj: "point",
                horizontal: {
                    _unit: "pixelsUnit",
                    _value: region.x
                },
                vertical: {
                    _unit: "pixelsUnit",
                    _value: region.y
                }
            },
            tolerance: 1,
            antiAlias: true,
            contiguous: true
        }
    ], {});
}

// 채널 삭제
async function deleteMaskByName(channelName = "ContiguityMask") {
    await batchPlay([
        {
            _obj: "delete",
            _target: [{
                _ref: "channel",
                _name: channelName
            }]
        }
    ], {});
}

module.exports = {
    selectMaskByName,
    createMask,
    createMaskFromSelection,
    setMaskRegionSelection,
    selectRGBChannel,
    deleteMaskByName,
};