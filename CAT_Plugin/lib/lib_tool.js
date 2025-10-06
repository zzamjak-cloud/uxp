const { batchPlay } = require("photoshop").action;

// 직사각형 선택
async function rectangularMarqueeTool(top_value, left_value, bottom_value, right_value) {
    console.log("Marquee Selection");
    await batchPlay(
       [
          {
             _obj: "set",
             _target: [
                {
                   _ref: "channel",
                   _property: "selection"
                }
             ],
             to: {
                _obj: "rectangle",
                top: {
                   _unit: "pixelsUnit",
                   _value: top_value
                },
                left: {
                   _unit: "pixelsUnit",
                   _value: left_value
                },
                bottom: {
                   _unit: "pixelsUnit",
                   _value: bottom_value
                },
                right: {
                   _unit: "pixelsUnit",
                   _value: right_value
                }
             },
             _options: {
                dialogOptions: "dontDisplay"
             }
          }
       ],
       {}
    );
}

// 전경색 설정
async function setForegroundColor(r, g, b) {
   const result = await batchPlay(
      [
         {
            _obj: "set",
            _target: [
               {
                  _ref: "color",
                  _property: "foregroundColor"
               }
            ],
            to: {
               _obj: "RGBColor",
               red: r,
               grain: g,
               blue: b
            },
            source: "photoshopPicker",
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

// Tool 선택
async function selectTool(tool) {
   await batchPlay(
      [
         {
            "_obj": "select",
            "_target": [
               {
                  "_ref": tool
               }
            ],
            "dontRecord": true,
            "forceNotify": true,
            "_isCommand": false
         }
      ],
      {}
   );
}

// 채우기 색상 설정
// value : "forgroundColor", "backgroundColor"
async function fillColor(value) {
   const result = await batchPlay(
      [
         {
            _obj: "fill",
            using: {
               _enum: "fillContents",
               _value: value
            },
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}


// 0:Combine 1:Subtract 2:Intersect 3:Exclude Overraping
async function setPathFinderType(value) {
   const result = await batchPlay(
      [
         {
            _obj: "changePathDetails",
            keyOriginType: 3,
            keyOriginResolution: 72,
            keyActionMode: value,
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

module.exports = {
   fillColor,
   rectangularMarqueeTool,
   selectTool,
   setForegroundColor,
   setPathFinderType
};