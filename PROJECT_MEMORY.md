# Renation Project Memory (작업 메모리 기록 - 업데이트)

## 프로젝트 개요
- **프로젝트명**: 전생의 문: 글로벌 환생 시뮬레이터 (Re:Born World Simulator)
- **스택**: React 19, TypeScript, Vite 8, Tailwind CSS v4, React-Leaflet, Leaflet, Lucide Icons, Canvas-Confetti
- **배포 타겟**: 정적 웹 호스팅 (GitHub Pages, Netlify 등) - Express/Next.js 배제, `base: './'` 설정

## 공식 데이터 출처 (Data Sources & Attribution)
1. **UNdata Live births by month of birth** (`https://data.un.org/Data.aspx?d=POP&f=tableCode%3A55`) -> 최신 연간 출생아 수 집계
2. **Simplemaps World Cities Database** (`https://simplemaps.com/data/world-cities`) -> 50,250개 전체 도시 데이터, 인구 가중치 및 위경도 매핑

## GitHub Pages 배포 설정 완료
1. **상대 경로 Base URL (`base: './'`)**:
   - `vite.config.ts`: `base: './'` 설정으로 GitHub Pages의 서브 경로(`https://<user>.github.io/<repo>/`)에서도 CSS/JS 번들이 404 없이 정상 로드되도록 구성.
   - `src/utils/reincarnationEngine.ts`: `getBasePath()` 헬퍼를 통해 `data/countries.json` 및 `data/cities/*.json` fetch 시 올바른 경로로 자동 연결.
2. **GitHub Actions 자동 배포 파이프라인 구축**:
   - `.github/workflows/deploy.yml` 워크플로우 생성 (Node 20, npm run build, Pages artifact 업로드 및 자동 배포).
   - 레포지토리에 push 시 자동으로 GitHub Pages에 배포됨.
3. **로컬 배포 스크립트 지원**:
   - `package.json`: `gh-pages` 패키지 설치 및 `"predeploy": "npm run build"`, `"deploy": "gh-pages -d dist"` 스크립트 추가.
4. **Git 형상 관리 설정**:
   - `.gitignore` 작성 완료 (`node_modules`, `dist`, `*.tsbuildinfo` 제외).
   - `git init` 초기화 완료.
