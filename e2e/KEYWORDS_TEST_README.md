# Keywords Management E2E Tests

## 개요

이 문서는 `/e2e/keywords.spec.ts`에 있는 키워드 관리 기능 E2E 테스트에 대한 실행 가이드입니다.

## 테스트 범위

### 1. 키워드 CRUD 작업
- ✅ 키워드 관리 페이지 접근
- ✅ 수동으로 새 키워드 생성
- ✅ 빈 키워드 유효성 검증
- ✅ 길이 제한 (100자) 유효성 검증
- ✅ 중복 키워드 방지
- ✅ 키워드 검색
- ✅ 키워드 삭제

### 2. DataForSEO 통합
- ✅ 연관 검색어 조회 (DataForSEO API)
- ✅ 연관 검색어에서 다중 선택 및 일괄 추가
- ✅ 캐시 동작 확인 (24시간 TTL)
- ✅ 강제 새로고침 옵션
- ⏭️ 타임아웃 처리 (현재 스킵됨)

### 3. 새 글 작성 페이지의 키워드 선택기
- ✅ 키워드 입력 필드 표시
- ✅ 쉼표로 구분된 키워드 입력
- ✅ 글 생성 폼에서 키워드 통합
- ⏭️ 자동완성 기능 (KeywordPicker 컴포넌트 구현 후 테스트)

### 4. 페이지네이션 및 성능
- ✅ 키워드 목록 페이지네이션
- ✅ 목록 로딩 성능 (3초 이내)

### 5. 에러 처리
- ✅ 네트워크 에러 처리
- ✅ API 실패 에러 메시지 표시

## 사전 요구사항

### 1. 환경 변수 설정

**필수 환경 변수** (`.env.local`에 추가):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# DataForSEO (연관 검색어 조회 기능용)
DATAFORSEO_LOGIN=your_dataforseo_login
DATAFORSEO_PASSWORD=your_dataforseo_password
```

### 2. DataForSEO API 설정

DataForSEO 관련 테스트를 실행하려면:

1. **DataForSEO 계정 생성**: https://dataforseo.com/
2. **API 크레딧 충전**: 최소 $100 권장
3. **비용 주의**:
   - Keyword Suggestions API 호출당 약 $0.01~$0.02
   - 테스트 실행 시 실제 API 비용 발생
   - 캐시를 활용하여 비용 절감

### 3. 데이터베이스 마이그레이션

테스트 전에 Supabase 마이그레이션 적용:
```bash
# migration 파일: supabase/migrations/0007_create_keywords_table.sql
# Supabase 대시보드에서 SQL 실행 또는 CLI 사용
```

## 테스트 실행 방법

### 1. 전체 테스트 실행
```bash
# Headless 모드
npm run test:e2e

# 브라우저 UI 모드 (권장)
npm run test:e2e:watch
```

### 2. 키워드 테스트만 실행
```bash
npx playwright test e2e/keywords.spec.ts

# UI 모드로 실행
npx playwright test e2e/keywords.spec.ts --ui

# 특정 브라우저로 실행
npx playwright test e2e/keywords.spec.ts --project=chromium
```

### 3. 특정 테스트만 실행
```bash
# 테스트 이름으로 필터링
npx playwright test e2e/keywords.spec.ts -g "should create a new keyword manually"

# 특정 describe 블록만 실행
npx playwright test e2e/keywords.spec.ts -g "Keyword CRUD Operations"
```

### 4. 디버그 모드
```bash
# 디버그 모드로 실행 (브라우저가 느리게 실행되며 DevTools 활성화)
npx playwright test e2e/keywords.spec.ts --debug

# 특정 테스트만 디버그
npx playwright test e2e/keywords.spec.ts -g "should fetch keyword suggestions" --debug
```

## DataForSEO API 비용 관리

### 비용 절감 전략

1. **캐시 활용**:
   - 같은 시드 키워드는 24시간 동안 캐시됨
   - `forceRefresh=false` (기본값) 사용

2. **테스트 제한**:
   ```bash
   # DataForSEO 테스트만 실행 (주의해서 실행)
   npx playwright test e2e/keywords.spec.ts -g "DataForSEO"
   ```

3. **CI/CD 환경**:
   - CI/CD에서는 DataForSEO API 크레딧이 없을 수 있음
   - 테스트가 gracefully skip되도록 설계됨
   - API 실패 시 에러 대신 경고 로그 출력

### 비용 모니터링

테스트 실행 후 DataForSEO 대시보드에서 사용량 확인:
- https://app.dataforseo.com/billing

## 인증 설정

현재 테스트는 인증을 건너뜀. 실제 환경에서 실행하려면:

### Option 1: 수동 로그인 후 테스트
```bash
# 브라우저 UI 모드로 실행
npx playwright test e2e/keywords.spec.ts --ui

# UI에서 수동으로 로그인 후 테스트 실행
```

### Option 2: 테스트 코드에 인증 추가

`beforeEach` 블록에 Clerk 인증 로직 추가:
```typescript
test.beforeEach(async ({ page }) => {
  // Clerk 로그인
  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill('test@example.com');
  await page.getByLabel(/password/i).fill('testpassword');
  await page.getByRole('button', { name: /sign in/i }).click();

  // 로그인 완료 대기
  await page.waitForURL('/dashboard');
});
```

## 트러블슈팅

### 문제: 키워드 관리 페이지를 찾을 수 없음
**해결**:
- 키워드 관리 페이지가 아직 구현되지 않았을 수 있음
- `src/app/[locale]/(protected)/keywords/page.tsx` 파일 확인
- 라우트가 보호되어 있는 경우 인증 추가

### 문제: DataForSEO API 에러
**해결**:
```bash
# 환경 변수 확인
npm run env:check

# .env.local 파일에 DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD 확인
cat .env.local | grep DATAFORSEO
```

**일반적인 에러**:
- `401 Unauthorized`: API 크레딧 부족 또는 잘못된 인증 정보
- `429 Rate Limit`: API 호출 제한 초과 (레이트 리밋)
- `504 Timeout`: API 응답 시간 초과 (30초)

### 문제: 테스트가 너무 느림
**해결**:
```bash
# 특정 테스트만 실행
npx playwright test e2e/keywords.spec.ts -g "should create a new keyword manually"

# DataForSEO 테스트 제외 (가장 느림)
npx playwright test e2e/keywords.spec.ts --grep-invert "DataForSEO"
```

### 문제: 요소를 찾을 수 없음 (selector timeout)
**해결**:
- UI 컴포넌트가 아직 구현되지 않았을 수 있음
- 다이얼로그, 버튼, 입력 필드의 실제 이름/레이블 확인
- 테스트의 selector 패턴 업데이트 필요

## 테스트 결과 확인

### 1. HTML 리포트
```bash
# 테스트 실행 후 자동으로 생성됨
npx playwright show-report

# 수동으로 열기
open playwright-report/index.html
```

### 2. 스크린샷 및 비디오
실패한 테스트의 스크린샷과 비디오는 `test-results/` 디렉토리에 저장됨:
```
test-results/
  keywords-spec-should-create-a-new-keyword-manually/
    test-failed-1.png
    video.webm
```

### 3. Trace Viewer
```bash
# 실패한 테스트의 trace 확인
npx playwright show-trace test-results/.../trace.zip
```

## CI/CD 통합

### GitHub Actions 예시

```yaml
name: E2E Tests - Keywords

on:
  pull_request:
    paths:
      - 'src/features/keywords/**'
      - 'e2e/keywords.spec.ts'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          # DataForSEO: 비용 때문에 CI에서는 생략 가능
          # DATAFORSEO_LOGIN: ${{ secrets.DATAFORSEO_LOGIN }}
          # DATAFORSEO_PASSWORD: ${{ secrets.DATAFORSEO_PASSWORD }}
        run: npm run test:e2e -- e2e/keywords.spec.ts

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## 테스트 유지보수

### UI 변경 시 업데이트 필요 항목

1. **버튼/레이블 이름 변경**:
   - 테스트의 `getByRole`, `getByText` selector 업데이트

2. **새로운 컴포넌트 추가**:
   - 해당 컴포넌트를 테스트하는 새 테스트 케이스 추가

3. **API 스키마 변경**:
   - 응답 데이터 검증 로직 업데이트

### 테스트 추가 가이드

새 테스트를 추가할 때:

1. **적절한 describe 블록에 추가**:
   ```typescript
   test.describe('Keyword CRUD Operations', () => {
     test('your new test', async ({ page }) => {
       // 테스트 로직
     });
   });
   ```

2. **AAA 패턴 따르기**:
   - **Arrange**: 테스트 데이터 준비
   - **Act**: 사용자 액션 수행
   - **Assert**: 결과 검증

3. **Korean 텍스트 사용**:
   - UI가 한국어로 되어 있으면 regex에 한국어 포함
   - 예: `/저장|save/i`

## 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Testing Library 쿼리 우선순위](https://testing-library.com/docs/queries/about/#priority)
- [DataForSEO Keyword Suggestions API](https://docs.dataforseo.com/v3/dataforseo_labs/google/keyword_suggestions/live/)
- [프로젝트 테스트 가이드](.ruler/test.md)

## 연락처

테스트 관련 문의사항:
- 테스트 실패: GitHub Issues에 보고
- API 설정 문제: DataForSEO 지원팀 문의
- 버그 발견: 재현 단계와 스크린샷 포함하여 보고
