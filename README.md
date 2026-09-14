# BABI Web

BABI 서비스의 웹 프론트엔드 프로젝트입니다.

## 프로젝트 구조

```text
src
├── global
│   ├── api
│   ├── navigation
│   └── response
├── domain
│   ├── auth
│   ├── family
│   ├── voice-record
│   ├── care-record
│   ├── ai-report
│   ├── handoff
│   ├── growth
│   └── vaccination
├── shared
│   ├── components
│   └── utils
└── App.tsx
```

새 핵심 기능은 `domain` 아래에 같은 계층으로 추가합니다.  
공통 컴포넌트와 유틸리티는 `shared`에서 관리합니다.