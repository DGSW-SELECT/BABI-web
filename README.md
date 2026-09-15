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

## 브랜치 전략

- `develop`: 개발 기능이 통합되는 기본 브랜치입니다.
- `main`: 배포 가능한 최종 코드를 관리하는 브랜치입니다.
- 배포가 결정되면 `develop`에서 `main`으로 PR을 생성합니다.