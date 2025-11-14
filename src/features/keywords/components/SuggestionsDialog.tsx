"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useKeywordSuggestions, useBulkCreateKeywords } from "@/features/keywords/hooks/useKeywordQuery";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Plus, X } from "lucide-react";
import type { SuggestionItem } from "@/features/keywords/lib/dto";

interface SuggestionsDialogProps {
  children?: React.ReactNode;
}

export function SuggestionsDialog({ children }: SuggestionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [seedKeywords, setSeedKeywords] = useState<string[]>([""]);
  const [currentInput, setCurrentInput] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [cacheInfo, setCacheInfo] = useState<{ cached: boolean; expiresAt: string | null }>({
    cached: false,
    expiresAt: null,
  });

  const { toast } = useToast();
  const suggestionsMutation = useKeywordSuggestions();
  const bulkCreateMutation = useBulkCreateKeywords();

  const handleAddSeed = () => {
    if (currentInput.trim() && seedKeywords.length < 5) {
      setSeedKeywords([...seedKeywords.filter((s) => s.trim()), currentInput.trim()]);
      setCurrentInput("");
    }
  };

  const handleRemoveSeed = (index: number) => {
    setSeedKeywords(seedKeywords.filter((_, i) => i !== index));
  };

  const handleFetchSuggestions = async () => {
    const validSeeds = seedKeywords.filter((s) => s.trim());

    if (validSeeds.length === 0) {
      toast({
        title: "시드 키워드 필요",
        description: "최소 1개의 시드 키워드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await suggestionsMutation.mutateAsync({
        seeds: validSeeds,
        languageName: "Korean",
        locationCode: 2410,
        limit: 25,
      });

      setSuggestions(result.suggestions);
      setCacheInfo({
        cached: result.cached,
        expiresAt: result.cacheExpiresAt,
      });
      setSelectedKeywords(new Set());

      toast({
        title: "연관 검색어 조회 완료",
        description: `${result.suggestions.length}개의 연관 검색어를 찾았습니다.`,
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        "연관 검색어 조회에 실패했습니다";
      toast({
        title: "조회 실패",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleToggleKeyword = (keyword: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  const handleAddSelected = async () => {
    if (selectedKeywords.size === 0) {
      toast({
        title: "키워드 미선택",
        description: "추가할 키워드를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await bulkCreateMutation.mutateAsync(Array.from(selectedKeywords));
      toast({
        title: "키워드 추가 완료",
        description: `${result.created}개 추가, ${result.skipped}개 중복 건너뜀`,
      });

      // Reset state
      setSuggestions([]);
      setSelectedKeywords(new Set());
      setSeedKeywords([""]);
      setOpen(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        "키워드 추가에 실패했습니다";
      toast({
        title: "추가 실패",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSuggestions([]);
    setSelectedKeywords(new Set());
    setSeedKeywords([""]);
    setCurrentInput("");
    setCacheInfo({ cached: false, expiresAt: null });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Lightbulb className="mr-2 h-4 w-4" />
            연관 검색어 조회
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>연관 검색어 조회</DialogTitle>
          <DialogDescription>
            시드 키워드를 입력하면 DataForSEO API를 통해 연관 검색어를 조회합니다. (최대 5개)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seed Keywords Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">시드 키워드</label>
            <div className="flex gap-2">
              <Input
                placeholder="시드 키워드 입력 (예: 블로그, SEO)"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSeed();
                  }
                }}
                disabled={seedKeywords.filter((s) => s.trim()).length >= 5 || suggestionsMutation.isPending}
              />
              <Button
                type="button"
                onClick={handleAddSeed}
                disabled={
                  !currentInput.trim() ||
                  seedKeywords.filter((s) => s.trim()).length >= 5 ||
                  suggestionsMutation.isPending
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Seed Keyword Tags */}
            {seedKeywords.filter((s) => s.trim()).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {seedKeywords
                  .filter((s) => s.trim())
                  .map((seed, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {seed}
                      <button
                        onClick={() => handleRemoveSeed(index)}
                        className="ml-1 hover:text-red-500"
                        disabled={suggestionsMutation.isPending}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
              </div>
            )}

            <Button
              onClick={handleFetchSuggestions}
              disabled={
                suggestionsMutation.isPending ||
                seedKeywords.filter((s) => s.trim()).length === 0
              }
              className="w-full"
            >
              {suggestionsMutation.isPending ? "조회 중..." : "연관 검색어 조회"}
            </Button>
          </div>

          {/* Cache Status */}
          {suggestions.length > 0 && (
            <div className="text-xs text-gray-500">
              {cacheInfo.cached ? (
                <Badge variant="outline">캐시된 결과</Badge>
              ) : (
                <Badge variant="outline">새로운 조회</Badge>
              )}
            </div>
          )}

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  연관 검색어 목록 ({suggestions.length}개)
                </label>
                <span className="text-xs text-gray-500">
                  {selectedKeywords.size}개 선택됨
                </span>
              </div>
              <div className="border rounded-md max-h-96 overflow-y-auto">
                <div className="divide-y">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleToggleKeyword(suggestion.keyword)}
                    >
                      <Checkbox
                        checked={selectedKeywords.has(suggestion.keyword)}
                        onCheckedChange={() => handleToggleKeyword(suggestion.keyword)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{suggestion.keyword}</p>
                        <div className="flex gap-3 text-xs text-gray-500">
                          {suggestion.searchVolume !== null && (
                            <span>검색량: {suggestion.searchVolume.toLocaleString()}</span>
                          )}
                          {suggestion.cpc !== null && (
                            <span>CPC: ${suggestion.cpc.toFixed(2)}</span>
                          )}
                          {suggestion.competition && (
                            <span>경쟁도: {suggestion.competition}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {suggestions.length > 0 && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={bulkCreateMutation.isPending}
            >
              취소
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={selectedKeywords.size === 0 || bulkCreateMutation.isPending}
            >
              {bulkCreateMutation.isPending
                ? "추가 중..."
                : `선택 항목 추가 (${selectedKeywords.size})`}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
