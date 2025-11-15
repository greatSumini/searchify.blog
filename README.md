이 프로젝트는 [`EasyNext`](https://github.com/easynext/easynext)를 사용해 생성된 [Next.js](https://nextjs.org) 프로젝트입니다.

## Getting Started

개발 서버를 실행합니다.<br/>
환경에 따른 명령어를 사용해주세요.

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인할 수 있습니다.

`app/page.tsx` 파일을 수정하여 페이지를 편집할 수 있습니다. 파일을 수정하면 자동으로 페이지가 업데이트됩니다.

## 기본 포함 라이브러리

- [Next.js](https://nextjs.org)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [ESLint](https://eslint.org)
- [Prettier](https://prettier.io)
- [Shadcn UI](https://ui.shadcn.com)
- [Lucide Icon](https://lucide.dev)
- [date-fns](https://date-fns.org)
- [react-use](https://github.com/streamich/react-use)
- [es-toolkit](https://github.com/toss/es-toolkit)
- [Zod](https://zod.dev)
- [React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com)
- [TS Pattern](https://github.com/gvergnaud/ts-pattern)

## 사용 가능한 명령어

한글버전 사용

```sh
easynext lang ko
```

최신버전으로 업데이트

```sh
pnpm add -g @easynext/cli@latest
```

Supabase 설정

```sh
easynext supabase
```

Next-Auth 설정

```sh
easynext auth

# ID,PW 로그인
easynext auth idpw
# 카카오 로그인
easynext auth kakao
```

유용한 서비스 연동

```sh
# Google Analytics
easynext gtag

# Microsoft Clarity
easynext clarity

# ChannelIO
easynext channelio

# Sentry
easynext sentry

# Google Adsense
easynext adsense
```

## Profiles + Clerk Webhook

- 이 템플릿은 Clerk 사용자 식별자를 직접 테이블에 저장하지 않고, `profiles` 테이블의 `id`를 모든 테이블이 참조합니다.
- Supabase 마이그레이션 `supabase/migrations/0006_create_profiles_and_migrate_refs.sql`를 실행하면 다음이 수행됩니다.
  - `profiles` 테이블 생성 및 `style_guides`, `articles`, `generation_quota`에 `profile_id` 도입/백필/제약(FK + CASCADE)
  - 기존 `clerk_user_id` 컬럼과 관련 인덱스 제거 (idempotent)

### Clerk Webhook 설정

- 엔드포인트: `/api/webhooks/clerk`
- 이벤트: `user.created`, `user.deleted`
- 서명 검증: 환경변수 `CLERK_WEBHOOK_SECRET`를 설정하면 Svix를 사용해 서명 검증을 수행합니다. 미설정 시 로컬 개발 편의를 위해 검증 없이 처리합니다.

### 환경 변수

`.env.local` 예시

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
CLERK_WEBHOOK_SECRET=...
```
