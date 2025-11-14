"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeywordTable } from "@/features/keywords/components/KeywordTable";
import { KeywordCreateDialog } from "@/features/keywords/components/KeywordCreateDialog";
import { SuggestionsDialog } from "@/features/keywords/components/SuggestionsDialog";
import { Plus, Lightbulb } from "lucide-react";

type KeywordsPageProps = {
  params: Promise<Record<string, never>>;
};

export default function KeywordsPage({ params }: KeywordsPageProps) {
  void params;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FCFCFD" }}>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#1F2937" }}>
                키워드 관리
              </h1>
              <p className="mt-2 text-base" style={{ color: "#6B7280" }}>
                글 작성에 사용할 키워드를 관리하고 연관 검색어를 조회하세요
              </p>
            </div>
            <div className="flex gap-2">
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
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card
          className="p-6"
          style={{
            borderColor: "#E1E5EA",
            borderRadius: "12px",
          }}
        >
          <KeywordTable />
        </Card>
      </div>
    </div>
  );
}
