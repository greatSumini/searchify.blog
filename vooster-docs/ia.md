# ContentCraft AI 정보 아키텍처 (IA)

## 1. 사이트맵 (사이트맵)

```
ContentCraft AI
├── / (홈페이지)
├── /auth
│   ├── /auth/login (로그인)
│   ├── /auth/signup (회원가입)
│   └── /auth/onboarding (온보딩 위저드)
├── /dashboard (대시보드) [인증 필요]
│   ├── /dashboard/stats (통계 현황)
│   └── /dashboard/history (작성 이력)
├── /new (새 글 작성) [인증 필요]
│   ├── /new/setup (주제 설정)
│   ├── /new/generate (AI 생성)
│   └── /new/edit (편집 및 완성)
├── /style-guides (스타일 가이드 관리) [인증 필요]
│   ├── /style-guides/list (가이드 목록)
│   ├── /style-guides/new (새 가이드 생성)
│   └── /style-guides/:id/edit (가이드 편집)
├── /account (계정 관리) [인증 필요]
│   ├── /account/profile (프로필 설정)
│   ├── /account/billing (결제 및 구독)
│   └── /account/usage (사용량 현황)
├── /docs (도움말)
│   ├── /docs/getting-started (시작 가이드)
│   ├── /docs/features (기능 설명)
│   └── /docs/faq (자주 묻는 질문)
└── /pricing (가격 정책)
```

## 2. 사용자 흐름 (사용자 흐름)

### **핵심 작업 1: 신규 사용자 온보딩**
1. 사용자가 홈페이지(/)에서 "무료로 시작하기" 버튼 클릭
2. 회원가입 페이지(/auth/signup)로 이동
3. 이메일, 패스워드 입력 후 계정 생성
4. 온보딩 위저드(/auth/onboarding)로 자동 이동
5. 5문항 브랜드 보이스 설정 완료
6. 대시보드(/dashboard)로 이동하여 첫 글 작성 유도

### **핵심 작업 2: AI 글 생성 및 편집**
1. 대시보드에서 "새 글 작성" 버튼 클릭
2. 새 글 작성 페이지(/new)로 이동
3. 주제 키워드와 간단한 설명 입력
4. 스타일 가이드 선택 (기본값 적용)
5. "생성하기" 버튼 클릭하여 AI 생성 시작
6. 5분 내 초안, 제목, SEO 메타데이터 자동 생성
7. 원스크린 편집기에서 문단별 재생성 및 수정
8. 실시간 SEO 점수 확인 및 최적화
9. 마크다운으로 다운로드 또는 클립보드 복사
10. 대시보드에서 완성 글 수 및 시간 절약 현황 확인

### **핵심 작업 3: 유료 전환**
1. 무료 3편 완성 후 새 글 작성 시도
2. 제한 도달 모달 팝업 표시
3. 프로 플랜($19/월) 혜택 및 비교표 확인
4. "구독하기" 버튼 클릭
5. 결제 정보 입력(/account/billing)
6. 결제 완료 후 무제한 글 생성 가능

## 3. 네비게이션 구조 (네비게이션 구조)

### **글로벌 네비게이션 바 (GNB)**
- **위치**: 상단 고정 (64px 높이)
- **좌측**: ContentCraft AI 로고 (홈페이지 링크)
- **우측**: 사용자 아바타 드롭다운 메뉴
  - 내 계정(/account/profile)
  - 결제 관리(/account/billing)
  - 도움말(/docs)
  - 로그아웃

### **사이드 네비게이션 (Sidebar)**
- **위치**: 좌측 고정 (280px 너비, 모바일에서 콜랩서블)
- **메뉴 구조**:
  - 대시보드 (/dashboard) - 홈 아이콘
  - 새 글 작성 (/new) - 펜 아이콘
  - 스타일 가이드 (/style-guides) - 팔레트 아이콘
  - 계정 관리 (/account) - 설정 아이콘
  - 도움말 (/docs) - 물음표 아이콘

### **브레드크럼 네비게이션**
- **표시 위치**: /new 페이지 내 상단
- **구조**: 대시보드 > 새 글 작성 > [현재 단계]
- **단계별**: 주제 설정 → AI 생성 → 편집 완성

### **푸터 네비게이션**
- **위치**: 페이지 하단 (인증 불필요 페이지만)
- **메뉴**: 개인정보처리방침, 이용약관, 고객지원, 회사 소개

## 4. 페이지 계층 구조 (페이지 계층 구조)

```
/ (Depth 1 - 루트)
├── /auth (Depth 1 - 인증)
│   ├── /auth/login (Depth 2)
│   ├── /auth/signup (Depth 2)
│   └── /auth/onboarding (Depth 2)
├── /dashboard (Depth 1 - 메인 앱)
│   ├── /dashboard/stats (Depth 2)
│   └── /dashboard/history (Depth 2)
├── /new (Depth 1 - 글 작성)
│   ├── /new/setup (Depth 2)
│   ├── /new/generate (Depth 2)
│   └── /new/edit (Depth 2)
├── /style-guides (Depth 1 - 스타일 관리)
│   ├── /style-guides/list (Depth 2)
│   ├── /style-guides/new (Depth 2)
│   └── /style-guides/:id/edit (Depth 3)
├── /account (Depth 1 - 계정)
│   ├── /account/profile (Depth 2)
│   ├── /account/billing (Depth 2)
│   └── /account/usage (Depth 2)
├── /docs (Depth 1 - 도움말)
│   ├── /docs/getting-started (Depth 2)
│   ├── /docs/features (Depth 2)
│   └── /docs/faq (Depth 2)
└── /pricing (Depth 1 - 가격)
```

## 5. 콘텐츠 구성 (콘텐츠 구성)

| 페이지 | 핵심 콘텐츠 요소 |
|--------|------------------|
| 홈페이지(/) | 히어로 섹션, 핵심 가치 제안, 데모 영상, 기능 소개, 가격 정보, 사용자 후기, CTA 버튼 |
| 대시보드(/dashboard) | 환영 메시지, 통계 카드(완성 글 수, 시간 절약), 월간 그래프, 최근 작성 이력, 새 글 작성 CTA |
| 새 글 작성(/new) | 3컬럼 레이아웃: 입력 폼(키워드, 설명, 스타일 가이드), 실시간 미리보기, SEO 점검 패널 |
| 스타일 가이드(/style-guides) | 가이드 카드 목록, 새 가이드 생성 버튼, 편집/삭제 액션, 미리보기 기능 |
| 계정 관리(/account) | 탭 네비게이션(프로필/결제/사용량), 폼 필드, 구독 상태, 사용량 차트 |
| 온보딩(/auth/onboarding) | 진행률 표시, 5단계 위저드, 브랜드 보이스 설정 폼, 실시간 미리보기 |

## 6. 인터랙션 패턴 (인터랙션 패턴)

### **모달 사용 패턴**
- **확인 모달**: 삭제, 구독 취소 등 중요한 액션
- **업그레이드 모달**: 무료 한도 초과 시 프로 플랜 안내
- **설정 모달**: 계정 설정, 스타일 가이드 빠른 편집

### **툴팁 패턴**
- **도움말 툴팁**: 복잡한 기능 설명 (SEO 점수, 브랜드 보이스)
- **상태 툴팁**: 진행 상황, 오류 메시지
- **단축키 툴팁**: 키보드 단축키 안내

### **인라인 편집 패턴**
- **문단별 재생성**: 각 문단에 재생성 버튼
- **제목 편집**: 클릭하여 즉시 편집 모드
- **실시간 저장**: 변경사항 자동 저장

### **피드백 패턴**
- **토스트 알림**: 성공/오류 메시지, 4초 자동 닫힘
- **프로그레스 바**: AI 생성 진행률, SEO 점수
- **스켈레톤 로딩**: 콘텐츠 로딩 중 레이아웃 유지

### **리스트 인터랙션**
- **무한 스크롤**: 작성 이력, 스타일 가이드 목록
- **필터링**: 날짜별, 상태별 필터
- **검색**: 실시간 검색 결과

## 7. URL 구조 (URL 구조)

### **URL 명명 규칙**
- **일반 리소스**: `/resource-name` (소문자, 하이픈 구분)
- **상세 페이지**: `/resource-name/:id`
- **편집 페이지**: `/resource-name/:id/edit`
- **중첩 리소스**: `/parent/child`

### **구체적 URL 구조**
```
/ - 홈페이지
/auth/login - 로그인
/auth/signup - 회원가입
/auth/onboarding - 온보딩

/dashboard - 대시보드 메인
/dashboard/stats - 통계 상세
/dashboard/history - 작성 이력

/new - 새 글 작성 (단일 페이지, 단계별 UI)
/new?step=setup - 주제 설정 단계
/new?step=generate - 생성 단계  
/new?step=edit - 편집 단계

/style-guides - 스타일 가이드 목록
/style-guides/new - 새 가이드 생성
/style-guides/[id] - 가이드 상세보기
/style-guides/[id]/edit - 가이드 편집

/account - 계정 관리 메인
/account/profile - 프로필 설정
/account/billing - 결제 관리
/account/usage - 사용량 현황

/docs - 도움말 메인
/docs/getting-started - 시작 가이드
/docs/features - 기능 설명
/docs/faq - 자주 묻는 질문

/pricing - 가격 정책
```

### **SEO 최적화**
- **의미있는 URL**: 기능과 내용을 명확히 표현
- **일관성**: 동일한 패턴 유지
- **계층 구조**: 논리적 깊이 관계

## 8. 컴포넌트 계층 구조 (컴포넌트 계층 구조)

### **글로벌 컴포넌트**
- **Layout**
  - `TopNavigation` - 상단 네비게이션 바
  - `Sidebar` - 좌측 사이드바 메뉴
  - `Footer` - 하단 푸터 (퍼블릭 페이지만)
- **UI 기본 컴포넌트**
  - `Button` - Primary, Secondary, Ghost 버튼
  - `Input` - 텍스트 입력, 텍스트에리어, 셀렉트
  - `Card` - 콘텐츠 카드, 통계 카드
  - `Modal` - 확인, 업그레이드, 설정 모달
  - `Toast` - 알림 메시지
  - `Tooltip` - 도움말 툴팁

### **페이지별 특화 컴포넌트**

#### **대시보드 컴포넌트**
- `StatsCard` - 완성 글 수, 시간 절약 통계
- `ActivityChart` - 월간 활동 그래프
- `RecentPosts` - 최근 작성 글 목록
- `QuickActions` - 빠른 작업 버튼들

#### **글 작성 컴포넌트**
- `ContentEditor` - 3컬럼 편집기 레이아웃
  - `InputPanel` - 키워드, 설명 입력 영역
  - `PreviewPanel` - 실시간 미리보기
  - `SEOPanel` - SEO 점검 및 최적화 도구
- `ParagraphRegenerate` - 문단별 재생성 버튼
- `ProgressTracker` - 생성 진행률 표시
- `ExportOptions` - 마크다운 다운로드/복사

#### **스타일 가이드 컴포넌트**
- `StyleGuideCard` - 가이드 카드 아이템
- `StyleGuideForm` - 가이드 생성/편집 폼
- `BrandVoicePreview` - 브랜드 보이스 미리보기
- `GuideTemplates` - 템플릿 선택기

#### **온보딩 컴포넌트**
- `OnboardingWizard` - 5단계 위저드 컨테이너
- `StepIndicator` - 진행률 표시
- `BrandVoiceForm` - 브랜드 보이스 설정 폼
- `PreviewGenerator` - 실시간 샘플 생성

#### **계정 관리 컴포넌트**
- `ProfileForm` - 프로필 정보 편집
- `BillingCard` - 구독 정보 및 결제 관리
- `UsageChart` - 사용량 현황 차트
- `PlanComparison` - 플랜 비교 테이블

### **상태 관리 컴포넌트**
- `LoadingSpinner` - 로딩 스피너
- `SkeletonLoader` - 스켈레톤 로딩 UI
- `EmptyState` - 빈 상태 일러스트레이션
- `ErrorBoundary` - 오류 처리 경계

### **반응형 컴포넌트**
- `MobileNavigation` - 모바일 햄버거 메뉴
- `ResponsiveLayout` - 화면 크기별 레이아웃 전환
- `CollapsibleSidebar` - 접을 수 있는 사이드바
- `TabletOptimized` - 태블릿 최적화 컴포넌트

### **접근성 컴포넌트**
- `SkipLink` - 키보드 네비게이션용 스킵 링크
- `FocusTrap` - 모달 내 포커스 트랩
- `ScreenReaderOnly` - 스크린 리더 전용 텍스트
- `KeyboardShortcuts` - 단축키 처리

이 정보 아키텍처는 MVP 출시를 위한 핵심 구조를 정의하며, 사용자 경험을 최적화하고 개발 효율성을 높이는 것을 목표로 합니다.