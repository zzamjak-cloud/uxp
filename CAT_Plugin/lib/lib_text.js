const { batchPlay } = require("photoshop").action;
const { TEXT_ALIGNMENT, TEXT_ORIENTATION } = require('./constants');

/**
 * 텍스트 레이어 생성
 * @param {string} text - 텍스트 내용
 * @param {number} x - X 좌표 (픽셀)
 * @param {number} y - Y 좌표 (픽셀)
 * @param {string} fontName - 폰트명 (예: "Arial-BoldMT", "맑은 고딕")
 * @param {number} fontSize - 폰트 크기 (포인트)
 * @param {number} r - 빨간색 (0-255)
 * @param {number} g - 초록색 (0-255)
 * @param {number} b - 파란색 (0-255)
 * @param {string} alignment - 텍스트 정렬 ("left", "center", "right")
 */
async function createTextLayer(text, x = 0, y = 0, fontName = "Arial-BoldMT", fontSize = 24, r = 0, g = 0, b = 0, alignment = "left") {
    await batchPlay([
        {
            _obj: "make",
            _target: [
                {
                    _ref: "textLayer"
                }
            ],
            using: {
                _obj: "textLayer",
                textKey: text,
                warp: {
                    _obj: "warp",
                    warpStyle: {
                        _enum: "warpStyle",
                        _value: "warpNone"
                    },
                    warpValue: 0,
                    warpPerspective: 0,
                    warpPerspectiveOther: 0,
                    warpRotate: {
                        _enum: "orientation",
                        _value: TEXT_ORIENTATION.HORIZONTAL
                    }
                },
                textShape: [
                    {
                        _obj: "textShape",
                        char: {
                            _enum: "char",
                            _value: "paint"
                        },
                        orientation: {
                            _enum: "orientation",
                            _value: TEXT_ORIENTATION.HORIZONTAL
                        },
                        transform: {
                            _obj: "transform",
                            xx: 1,
                            xy: 0,
                            yx: 0,
                            yy: 1,
                            tx: x,
                            ty: y
                        }
                    }
                ],
                textStyleRange: [
                    {
                        _obj: "textStyleRange",
                        from: 0,
                        to: text.length,
                        textStyle: {
                            _obj: "textStyle",
                            fontPostScriptName: fontName,
                            fontName: fontName,
                            size: {
                                _unit: "pointsUnit",
                                _value: fontSize
                            },
                            color: {
                                _obj: "RGBColor",
                                red: r,
                                grain: g,
                                blue: b
                            },
                            fontCaps: {
                                _enum: "fontCaps",
                                _value: "normal"
                            },
                            baseline: {
                                _enum: "baseline",
                                _value: "normal"
                            },
                            otbaseline: {
                                _enum: "otbaseline",
                                _value: "normal"
                            },
                            strikethrough: {
                                _enum: "strikethrough",
                                _value: "strikethroughOff"
                            },
                            underline: {
                                _enum: "underline",
                                _value: "underlineOff"
                            },
                            ligature: true,
                            altligature: false,
                            contextualLigatures: false,
                            alternateLigatures: false,
                            oldStyle: false,
                            fractions: false,
                            ordinals: false,
                            swash: false,
                            titling: false,
                            connectionForms: false,
                            stylisticAlternates: false,
                            ornaments: false,
                            justificationAlternates: false,
                            specialFeatures: false,
                            characterRotation: 0
                        }
                    }
                ],
                paragraphStyleRange: [
                    {
                        _obj: "paragraphStyleRange",
                        from: 0,
                        to: text.length,
                        paragraphStyle: {
                            _obj: "paragraphStyle",
                            align: {
                                _enum: "alignmentType",
                                _value: alignment
                            },
                            firstLineIndent: {
                                _unit: "pointsUnit",
                                _value: 0
                            },
                            startIndent: {
                                _unit: "pointsUnit",
                                _value: 0
                            },
                            endIndent: {
                                _unit: "pointsUnit",
                                _value: 0
                            },
                            spaceBefore: {
                                _unit: "pointsUnit",
                                _value: 0
                            },
                            spaceAfter: {
                                _unit: "pointsUnit",
                                _value: 0
                            },
                            dropCapMultiplier: 1,
                            hyphenate: true,
                            hyphenatedWordSize: 6,
                            preHyphen: 2,
                            postHyphen: 2,
                            consecutiveHyphens: 8,
                            zone: {
                                _unit: "pointsUnit",
                                _value: 36
                            },
                            wordSpacing: [
                                {
                                    _unit: "percentUnit",
                                    _value: 80
                                },
                                {
                                    _unit: "percentUnit",
                                    _value: 100
                                },
                                {
                                    _unit: "percentUnit",
                                    _value: 133
                                }
                            ],
                            letterSpacing: [
                                {
                                    _unit: "percentUnit",
                                    _value: 0
                                },
                                {
                                    _unit: "percentUnit",
                                    _value: 0
                                },
                                {
                                    _unit: "percentUnit",
                                    _value: 0
                                }
                            ],
                            glyphSpacing: [
                                {
                                    _unit: "percentUnit",
                                    _value: 100
                                },
                                {
                                    _unit: "percentUnit",
                                    _value: 100
                                },
                                {
                                    _unit: "percentUnit",
                                    _value: 100
                                }
                            ],
                            autoLeading: {
                                _unit: "percentUnit",
                                _value: 120
                            },
                            leadingType: {
                                _enum: "leadingType",
                                _value: "leadingBelow"
                            }
                        }
                    }
                ],
                kerningRange: []
            },
            layerID: 1,
            _options: {
                dialogOptions: "dontDisplay"
            }
        }
    ], {});
}

/**
 * 간단한 텍스트 레이어 생성 (기본 설정)
 * @param {string} text - 텍스트 내용
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 */
async function createSimpleTextLayer(text, x = 100, y = 100) {
    await createTextLayer(text, x, y, "Arial-BoldMT", 24, 0, 0, 0, "left");
}

// 선택한 텍스트 레이어의 내용 변경
async function setTextContent(newText) {
    await batchPlay([
        {
            _obj: "set",
            _target: [
                {
                    _ref: "textLayer",
                    _enum: "ordinal",
                    _value: "targetEnum"
                }
            ],
            to: {
                _obj: "textLayer",
                textKey: newText
            },
            _options: {
                dialogOptions: "dontDisplay"
            }
        }
    ], {});
}

// 선택한 텍스트 레이어의 폰트 크기 변경
async function setTextSize(fontSize) {
    await batchPlay([
        {
            _obj: "set",
            _target: [
                {
                    _ref: "textLayer",
                    _enum: "ordinal",
                    _value: "targetEnum"
                }
            ],
            to: {
                _obj: "textLayer",
                textStyleRange: [
                    {
                        _obj: "textStyleRange",
                        from: 0,
                        to: -1, // 전체 텍스트
                        textStyle: {
                            _obj: "textStyle",
                            size: {
                                _unit: "pointsUnit",
                                _value: fontSize
                            }
                        }
                    }
                ]
            },
            _options: {
                dialogOptions: "dontDisplay"
            }
        }
    ], {});
}

// 선택한 텍스트 레이어의 색상 변경
async function setTextColor(r, g, b) {
    await batchPlay([
        {
            _obj: "set",
            _target: [
                {
                    _ref: "textLayer",
                    _enum: "ordinal",
                    _value: "targetEnum"
                }
            ],
            to: {
                _obj: "textLayer",
                textStyleRange: [
                    {
                        _obj: "textStyleRange",
                        from: 0,
                        to: -1, // 전체 텍스트
                        textStyle: {
                            _obj: "textStyle",
                            color: {
                                _obj: "RGBColor",
                                red: r,
                                grain: g,
                                blue: b
                            }
                        }
                    }
                ]
            },
            _options: {
                dialogOptions: "dontDisplay"
            }
        }
    ], {});
}

// 선택한 텍스트 레이어의 폰트 변경
async function setTextFont(fontName) {
    await batchPlay([
        {
            _obj: "set",
            _target: [
                {
                    _ref: "textLayer",
                    _enum: "ordinal",
                    _value: "targetEnum"
                }
            ],
            to: {
                _obj: "textLayer",
                textStyleRange: [
                    {
                        _obj: "textStyleRange",
                        from: 0,
                        to: -1, // 전체 텍스트
                        textStyle: {
                            _obj: "textStyle",
                            fontPostScriptName: fontName,
                            fontName: fontName
                        }
                    }
                ]
            },
            _options: {
                dialogOptions: "dontDisplay"
            }
        }
    ], {});
}

// 선택한 텍스트 레이어의 정렬 방식 변경
async function setTextAlignment(alignment) {
    await batchPlay([
        {
            _obj: "set",
            _target: [
                {
                    _ref: "textLayer",
                    _enum: "ordinal",
                    _value: "targetEnum"
                }
            ],
            to: {
                _obj: "textLayer",
                paragraphStyleRange: [
                    {
                        _obj: "paragraphStyleRange",
                        from: 0,
                        to: -1, // 전체 텍스트
                        paragraphStyle: {
                            _obj: "paragraphStyle",
                            align: {
                                _enum: "alignmentType",
                                _value: alignment
                            }
                        }
                    }
                ]
            },
            _options: {
                dialogOptions: "dontDisplay"
            }
        }
    ], {});
}

// 텍스트 레이어 위치 이동
async function setTextPosition(x, y) {
    await batchPlay([
        {
            _obj: "set",
            _target: [
                {
                    _ref: "textLayer",
                    _enum: "ordinal",
                    _value: "targetEnum"
                }
            ],
            to: {
                _obj: "textLayer",
                textShape: [
                    {
                        _obj: "textShape",
                        transform: {
                            _obj: "transform",
                            xx: 1,
                            xy: 0,
                            yx: 0,
                            yy: 1,
                            tx: x,
                            ty: y
                        }
                    }
                ]
            },
            _options: {
                dialogOptions: "dontDisplay"
            }
        }
    ], {});
}

// 한국어 텍스트 레이어 생성 (한국어 폰트 기본값)
async function createKoreanTextLayer(text, x = 100, y = 100, fontSize = 24) {
    await createTextLayer(text, x, y, "맑은 고딕", fontSize, 0, 0, 0, "left");
}

module.exports = {
    createTextLayer,           // 완전한 설정으로 텍스트 레이어 생성
    createSimpleTextLayer,     // 간단한 텍스트 레이어 생성
    createKoreanTextLayer,     // 한국어 텍스트 레이어 생성
    setTextContent,            // 텍스트 내용 변경
    setTextSize,               // 폰트 크기 변경
    setTextColor,              // 텍스트 색상 변경
    setTextFont,               // 폰트 변경
    setTextAlignment,          // 텍스트 정렬 변경
    setTextPosition            // 텍스트 위치 변경
};