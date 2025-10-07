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

// 전경색 얻기 (RGB)
async function getForegroundRGBColor() {
   const result = await batchPlay(
      [
         {
            _obj: "get",
            _target: [
               {
                  _ref: "property",
                  _property: "foregroundColor"
               },
               {
                  _ref: "application",
                  _enum: "ordinal",
                  _value: "targetEnum"
               }
            ]
         }
      ],
      {
         synchronousExecution: false,
         modalBehavior: "fail"
      }
   );
   
   const color = result[0]?.foregroundColor;
   
   // RGB 값 추출
   if (color?._obj === "HSBColorClass") {
      return hsbToRgb(
         color.hue._value,
         color.saturation,
         color.brightness
      );
   }

   console.log("color : ", color);
   
   return color;
}

// HSB를 RGB로 변환
function hsbToRgb(hue, saturation, brightness) {
   const h = hue / 360;
   const s = saturation / 100;
   const v = brightness / 100;
   
   let r, g, b;
   
   const i = Math.floor(h * 6);
   const f = h * 6 - i;
   const p = v * (1 - s);
   const q = v * (1 - f * s);
   const t = v * (1 - (1 - f) * s);
   
   switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
   }
   
   return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
   };
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
// value : "foregroundColor", "backgroundColor"
async function fillColor(value) {
   await batchPlay(
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
   fillColor,                   // 채우기 색상 설정
   getForegroundRGBColor,       // 전경색 얻기 (RGB)
   rectangularMarqueeTool,      // 직사각형 선택
   selectTool,                  // Tool 선택
   setForegroundColor,          // 전경색 설정
   setPathFinderType            // 경로 찾기 타입 설정
};