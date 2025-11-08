# ContentCraft AI Design Guide

## 1. Overall Mood (전체적인 무드)

ContentCraft AI는 **신뢰할 수 있고 전문적인(Trustworthy & Professional)** 무드를 지향합니다. 인디해커와 솔로 창업자들이 콘텐츠 생성에 집중할 수 있도록 깔끔하고 직관적인 인터페이스를 제공합니다. 

핵심 디자인 철학:
- **미니멀리즘**: 불필요한 요소를 제거하고 콘텐츠에 집중
- **신뢰성**: 쿨톤과 저채도로 안정감과 전문성 표현
- **효율성**: 사용자의 작업 흐름을 방해하지 않는 직관적 레이아웃
- **접근성**: 초보자와 전문가 모두 사용할 수 있는 유연한 인터페이스

## 2. Reference Service (참조 서비스)

- **Name**: Notion
- **Description**: 올인원 워크스페이스 및 노트 테이킹 도구
- **Design Mood**: 깔끔하고 모노톤적이며 콘텐츠 중심의 미니멀 디자인
- **Primary Color**: #2F3437 (다크 그레이)
- **Secondary Color**: #F7F6F3 (오프 화이트)

Notion의 콘텐츠 중심적 접근법과 깔끔한 타이포그래피, 직관적인 블록 편집 시스템을 벤치마킹하여 글쓰기에 최적화된 환경을 구현합니다.

## 3. Color & Gradient (색상 & 그라데이션)

### 메인 컬러 팔레트
- **Primary Color**: #1E2A38 (Navy) - 메인 브랜드 컬러, 신뢰성과 전문성 표현
- **Secondary Color**: #F5F7FA (Soft Gray) - 배경 및 카드 컬러
- **Accent Color**: #3BA2F8 (Sky Blue) - CTA 버튼, 링크, 강조 요소
- **Background**: #FCFCFD (Off-White) - 메인 배경
- **Border**: #E1E5EA (Light Gray) - 구분선 및 테두리

### 보조 컬러
- **Success**: #10B981 (Emerald)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)
- **Info**: #3B82F6 (Blue)

### 그레이스케일
- **Gray 900**: #111827
- **Gray 700**: #374151
- **Gray 500**: #6B7280
- **Gray 300**: #D1D5DB
- **Gray 100**: #F3F4F6

### Mood
- **톤**: 쿨톤 (Cool Tone)
- **채도**: 저채도 (Low Saturation)

### Color Usage
1. **최우선**: Primary Navy (#1E2A38) - 네비게이션, 메인 헤더
2. **강조**: Accent Sky Blue (#3BA2F8) - CTA 버튼, 활성 상태
3. **배경**: Soft Gray (#F5F7FA) - 카드, 사이드바
4. **텍스트**: Gray 900 (#111827) - 본문, Gray 700 (#374151) - 보조 텍스트

## 4. Typography & Font (타이포그래피 & 폰트)

### 폰트 패밀리
- **영문**: Inter (Google Fonts)
- **한글**: Pretendard (시스템 폰트 대체)
- **모노스페이스**: JetBrains Mono (코드 블록용)

### 타이포그래피 스케일
- **Heading 1**: 32px, Bold (700), Letter-spacing: -0.025em
- **Heading 2**: 24px, Semibold (600), Letter-spacing: -0.025em
- **Heading 3**: 20px, Semibold (600)
- **Body Large**: 18px, Regular (400), Line-height: 1.7
- **Body**: 16px, Regular (400), Line-height: 1.6
- **Body Small**: 14px, Regular (400), Line-height: 1.5
- **Caption**: 12px, Medium (500), Line-height: 1.4

### 텍스트 컬러
- **Primary**: Gray 900 (#111827)
- **Secondary**: Gray 700 (#374151)
- **Muted**: Gray 500 (#6B7280)
- **Placeholder**: Gray 300 (#D1D5DB)

## 5. Layout & Structure (레이아웃 & 구조)

### 그리드 시스템
- **Container Max Width**: 1440px
- **Breakpoints**: 
  - Mobile: <640px
  - Tablet: 640px-1024px  
  - Desktop: >1024px
- **Spacing Scale**: 4px 기본 단위 (4, 8, 12, 16, 20, 24, 32, 40, 48, 64px)

### 메인 레이아웃 구조
```
┌─────────────────────────────────────────┐
│ Topbar (64px height)                    │
├───────────┬─────────────────────────────┤
│ Sidebar   │ Main Content Area           │
│ (280px)   │                             │
│           │ ┌─────┬─────────┬─────────┐ │
│           │ │Input│Preview  │SEO Panel│ │
│           │ │     │         │         │ │
│           │ └─────┴─────────┴─────────┘ │
└───────────┴─────────────────────────────┘
```

### 3-Column 콘텐츠 레이아웃
- **입력 영역**: 360px (최소 320px)
- **미리보기**: 가변 (최소 480px)
- **SEO 패널**: 320px (콜랩서블)

### 반응형 규칙
- **Mobile (<640px)**: 사이드바 숨김, 1-Column 스택, 플로팅 FAB
- **Tablet (640-1024px)**: 2-Column (입력+미리보기), SEO 패널 하단
- **Desktop (>1024px)**: 3-Column 전체 표시

## 6. Visual Style (비주얼 스타일)

### 아이콘 시스템
- **라이브러리**: Lucide React
- **스타일**: 선형 아이콘 (Line Icons)
- **Stroke Width**: 1.5px
- **크기**: 16px (Small), 20px (Medium), 24px (Large)

### 이미지 가이드라인
- **종횡비**: 16:9 (히어로), 1:1 (프로필), 4:3 (카드)
- **코너 반경**: 8px (카드), 12px (대형 이미지)
- **오버레이**: rgba(30, 42, 56, 0.6) 텍스트 가독성 확보

### 일러스트레이션
- **스타일**: 미니멀 선형 일러스트
- **컬러**: 브랜드 컬러 팔레트 내에서 2-3색 사용
- **용도**: 온보딩, 빈 상태(Empty State), 에러 페이지

### 그림자 시스템
- **Small**: 0 1px 3px rgba(0, 0, 0, 0.1)
- **Medium**: 0 4px 6px rgba(0, 0, 0, 0.07)
- **Large**: 0 10px 15px rgba(0, 0, 0, 0.1)
- **XL**: 0 20px 25px rgba(0, 0, 0, 0.1)

## 7. UX Guide (UX 가이드)

### 타겟 사용자 접근법
**Both (전문가 + 초보자)** 지원을 위한 적응형 인터페이스

### 초보자를 위한 UX
- **온보딩**: 첫 방문 시 3-Step 코치마크 튜토리얼
- **기본값 최적화**: 가장 일반적인 설정을 기본값으로 제공
- **도움말 시스템**: 컨텍스트 툴팁, 인라인 가이드
- **프로그레스 표시**: 단계별 진행률, 완료 상태 명확히 표시

### 전문가를 위한 UX
- **고급 옵션**: 토글로 숨김/표시 가능한 세부 설정
- **단축키 지원**: Cmd/Ctrl + 키 조합으로 빠른 작업
- **배치 작업**: 여러 글 동시 처리 기능
- **커스터마이제이션**: 작업 공간 레이아웃 조정

### 핵심 UX 원칙
1. **즉시성**: 5분 내 글 생성 완료, 실시간 피드백
2. **투명성**: 진행 상황, 비용, 제한사항 명확히 표시  
3. **제어감**: 문단별 재생성, 실시간 편집 가능
4. **성취감**: 시간 절약, 완성 글 수 등 가시적 성과 표시

### 마이크로카피 가이드라인
- **톤**: 격식 있으나 친근함
- **길이**: 6단어 이하 간결함
- **유머**: 지나친 유머 지양, 전문성 유지
- **예시**: "글 생성 중..." → "AI가 작성 중입니다" (X) → "생성 중" (O)

## 8. UI Component Guide (UI 컴포넌트 가이드)

### 버튼 시스템

#### Primary Button
- **배경**: Accent Blue (#3BA2F8)
- **텍스트**: White
- **높이**: 40px (Medium), 48px (Large)
- **패딩**: 16px 24px
- **코너**: 8px 반경
- **호버**: 배경 20% 어둡게
- **예시**: "글 생성하기", "저장하기"

#### Secondary Button  
- **배경**: Transparent
- **테두리**: 1px solid Gray 300
- **텍스트**: Gray 700
- **호버**: 배경 Gray 50
- **예시**: "취소", "다시 생성"

#### Ghost Button
- **배경**: Transparent  
- **텍스트**: Accent Blue
- **호버**: 배경 Blue 50
- **예시**: "더 보기", "편집"

### 입력 필드 (Input Fields)

#### Text Input
- **높이**: 40px
- **패딩**: 12px 16px
- **테두리**: 1px solid Gray 300
- **코너**: 6px 반경
- **포커스**: 테두리 Accent Blue, 그림자 추가
- **플레이스홀더**: Gray 400

#### Textarea
- **최소 높이**: 120px
- **리사이즈**: 세로만 가능
- **라인 높이**: 1.5

#### Select Dropdown
- **높이**: 40px
- **아이콘**: Chevron Down (Lucide)
- **옵션**: 최대 높이 200px, 스크롤

### 카드 시스템

#### Content Card
- **배경**: White
- **테두리**: 1px solid Gray 200
- **코너**: 12px 반경
- **패딩**: 24px
- **그림자**: Medium Shadow
- **호버**: 그림자 증가

#### Stats Card
- **배경**: Gradient (White → Gray 50)
- **아이콘**: 20px, Accent Blue
- **제목**: 14px Medium
- **수치**: 24px Bold

### 네비게이션

#### Top Navigation
- **높이**: 64px
- **배경**: White
- **테두리**: 하단 1px solid Gray 200
- **로고**: 좌측, 32px 높이
- **메뉴**: 우측, 사용자 아바타 포함

#### Sidebar
- **너비**: 280px (콜랩서블)
- **배경**: Gray 50
- **메뉴 아이템**: 40px 높이, 12px 패딩
- **활성 상태**: Accent Blue 배경, White 텍스트

### 피드백 컴포넌트

#### Progress Bar (SEO 점수용)
- **높이**: 8px
- **배경**: Gray 200
- **진행**: Accent Blue → Success Green
- **코너**: 4px 반경
- **레이블**: 상단 우측 표시

#### Toast Notification
- **위치**: 우측 상단
- **너비**: 360px
- **자동 닫힘**: 4초
- **타입별 컬러**: Success, Warning, Error

#### Loading States
- **스켈레톤**: Gray 200 배경, 애니메이션
- **스피너**: Accent Blue, 24px
- **진행률**: 카운트다운 타이머 포함

### 데이터 시각화

#### Dashboard Cards
- **시간 절약**: 큰 숫자 + 단위, Success Green
- **완성 글 수**: 월간 그래프, Accent Blue
- **SEO 점수**: 원형 프로그레스, 그라데이션

#### Charts
- **라이브러리**: Recharts
- **컬러**: 브랜드 팔레트 순서대로
- **그리드**: Gray 100, 미세한 선

### 애니메이션 가이드

#### 전환 효과
- **지속시간**: 150-250ms
- **이징**: ease-out
- **타입**: fade, slide, scale

#### 로딩 애니메이션  
- **스켈레톤**: 좌우 이동 그라데이션
- **펄스**: 투명도 변화
- **스피너**: 회전

### 접근성 (Accessibility)

#### 컬러 대비
- **최소 기준**: WCAG AA (4.5:1)
- **텍스트**: Gray 900 on White (15.6:1)
- **링크**: Accent Blue on White (8.2:1)

#### 키보드 네비게이션
- **Tab 순서**: 논리적 흐름
- **포커스 표시**: 2px Accent Blue 아웃라인
- **단축키**: Cmd/Ctrl 조합

#### 스크린 리더
- **aria-label**: 모든 인터랙티브 요소
- **role 속성**: 적절한 시맨틱 역할
- **alt 텍스트**: 의미있는 이미지 설명

### 반응형 컴포넌트 규칙

#### 모바일 (<640px)
- **버튼**: 전체 너비, 48px 높이
- **입력 필드**: 전체 너비
- **카드**: 16px 패딩
- **네비게이션**: 햄버거 메뉴

#### 태블릿 (640-1024px)  
- **그리드**: 2-Column 레이아웃
- **사이드바**: 오버레이 모드
- **카드**: 20px 패딩

#### 데스크톱 (>1024px)
- **그리드**: 3-Column 전체 표시
- **호버 상태**: 모든 인터랙티브 요소
- **툴팁**: 마우스 오버 시 표시