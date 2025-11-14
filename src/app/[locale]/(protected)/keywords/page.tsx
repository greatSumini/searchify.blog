"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeywordTable } from "@/features/keywords/components/KeywordTable";
import { KeywordCreateDialog } from "@/features/keywords/components/KeywordCreateDialog";
import { SuggestionsDialog } from "@/features/keywords/components/SuggestionsDialog";
import { Plus, Lightbulb } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";

type KeywordsPageProps = {
  params: Promise<Record<string, never>>;
};

export default function KeywordsPage({ params }: KeywordsPageProps) {
  void params;

  return (
    <PageLayout
      title="키워드 관리"
      description="새 글 작성에서 사용할 키워드를 미리 저장하고, 연관 검색어도 함께 찾아보세요"
      actions={
        <>
          <SuggestionsDialog>
            <Button variant="outline">
              <Lightbulb className="mr-2 h-4 w-4" />
              연관 검색어 조회
            </Button>
          </SuggestionsDialog>
          <KeywordCreateDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              새 키워드
            </Button>
          </KeywordCreateDialog>
        </>
      }
    >
      <Card className="p-6" style={{ borderColor: "#E1E5EA", borderRadius: "12px" }}>
        <KeywordTable />
      </Card>
    </PageLayout>
  );
}
