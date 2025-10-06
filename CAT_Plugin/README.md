# CAT Panel - Photoshop UXP Plugin

CAT Panel은 Adobe Photoshop용 UXP 플러그인으로, 디자이너의 작업 효율성을 높이기 위한 다양한 도구들을 제공합니다.

## 주요 기능

### 📤 Export (내보내기)
- **Export & Link**: 선택된 레이어를 PNG로 내보내고 PSD에 링크
- **Export PSD**: 선택된 레이어를 PSD 형식으로 내보내기
- **Export PNG**: 선택된 레이어를 PNG 형식으로 내보내기
- **SaveForWeb**: JPG/PNG 형식으로 웹 최적화 저장
- **PNG Slice Patch**: PNG 슬라이스 패치 생성
- **동적 폴더 선택**: 자주 사용하는 폴더를 프리셋으로 저장

### 📥 Import (가져오기)
- **PSD Import**: 폴더 내 모든 PSD 파일을 문서로 가져오기
- **PNG Import**: 폴더 내 모든 PNG 파일을 문서로 가져오기
- **Grid Layout**: 그리드 레이아웃 자동 적용

### 🏷️ Layers Rename (레이어 이름 변경)
- **Prefix/Suffix**: 레이어 이름 앞/뒤에 텍스트 추가
- **Number/Reverse Number**: 숫자 순서대로 이름 변경
- **Rename/Replace**: 텍스트 이름 변경 및 교체
- **Remove**: 특정 텍스트 제거
- **프리셋 시스템**: 자주 사용하는 이름 변경 규칙 저장

### 🎨 Layer Effects (레이어 효과)
- **Stroke**: 테두리 효과 (외부/내부/중앙)
- **Drop Shadow**: 그림자 효과
- **Inner Shadow**: 내부 그림자 효과
- **Outer Glow**: 외부 글로우 효과
- **Inner Glow**: 내부 글로우 효과
- **Bevel & Emboss**: 입체 효과
- **Color Overlay**: 색상 오버레이
- **Gradient Overlay**: 그라디언트 오버레이
- **범용 적용**: 여러 효과를 한 번에 적용 가능
- **복사/붙여넣기**: 레이어 스타일 복사 및 붙여넣기

### 🛠️ ETC (기타 도구)
- **App Icon Maker**: 앱 아이콘 생성 (일반/도트)
- **Animation Match Layers**: 애니메이션 레이어 매칭
- **Clean PSD**: PSD 파일 정리
- **Split to Layers**: 레이어 분할
- **Sort Layers**: 레이어 정렬 (전체/선택)
- **Clear Empty Layers**: 빈 레이어 제거
- **Clear Hidden Effects**: 숨겨진 효과 제거

### 📏 Guide (가이드)
- **Apply Guide**: 화면을 행/열로 나누는 가이드 생성
- **Clear Guide**: 가이드 제거
- **Generate Numbers**: 가이드에 번호 자동 생성

## 호환성

- **Photoshop**: 22.0.0 이상
- **UXP API**: 버전 2
- **플랫폼**: Windows, macOS

## 설치 및 사용법

1. **Photoshop 실행**: Photoshop이 실행 중인지 확인
2. **UDT에서 플러그인 추가**: 
   - UXP Developer Tools (UDT) 애플리케이션 실행
   - "Developer Workspace"에서 "Add Plugin" 클릭
   - 이 프로젝트의 `manifest.json` 파일 선택
3. **플러그인 로드**: 
   - 해당 워크스페이스 항목 옆의 ••• 버튼 클릭
   - "Load" 클릭
4. **Photoshop에서 사용**: 
   - Photoshop으로 전환하면 "CAT Tools" 패널이 실행됩니다

## 프로젝트 구조

```
CAT_Plugin/
├── main.js              # 메인 로직 및 이벤트 핸들러
├── index.html           # UI 레이아웃
├── style.css            # 스타일시트
├── manifest.json        # 플러그인 매니페스트
├── lib/                 # 유틸리티 라이브러리
│   ├── lib.js          # 공통 함수
│   ├── lib_layer.js    # 레이어 관련 함수
│   ├── lib_export.js   # 내보내기 관련 함수
│   ├── lib_effects.js  # 레이어 효과 관련 함수
│   ├── constants.js    # 상수 정의
│   └── ...
├── icons/              # 아이콘 리소스
└── [기능별 JS 파일들]   # 각 기능별 구현 파일
```

## 개발자 정보

- **개발자**: choijinpyoung
- **버전**: 0.0.5
- **라이선스**: Apache-2.0

## 참고 자료

- [UXP Developer Tools 가이드](https://developer.adobe.com/photoshop/uxp/2022/guides/devtool/udt-walkthrough/)
- [UXP 문서 편집 가이드](https://developer.adobe.com/photoshop/uxp/2022/guides/getting-started/editing-the-document/)
- [UXP 파일 쓰기 가이드](https://developer.adobe.com/photoshop/uxp/2022/guides/getting-started/writing-a-file/) 
