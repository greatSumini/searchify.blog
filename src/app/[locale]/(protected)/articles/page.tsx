"use client";

import { PageLayout } from "@/components/layout/page-layout";

type ArticlesPageProps = {
  params: Promise<Record<string, never>>;
};

export default function ArticlesPage({ params }: ArticlesPageProps) {
  void params;

  return (
    <PageLayout
      title="글 목록"
      description="작성한 글들을 한 눈에 확인하고 관리할 수 있어요."
    >
      <div
        className="rounded-lg border border-dashed p-8 text-center text-muted-foreground"
        style={{ borderColor: "#E1E5EA" }}
      >
        글 목록 기능은 준비 중입니다.
      </div>
    </PageLayout>
  );
}
