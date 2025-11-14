"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "react-use";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useKeywordList } from "@/features/keywords/hooks/useKeywordQuery";
import { format } from "date-fns";

export function KeywordTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  useDebounce(
    () => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    },
    300,
    [searchQuery]
  );

  const { data, isLoading, error } = useKeywordList(debouncedQuery, page, limit);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (data?.hasMore) {
      setPage(page + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="키워드 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>키워드</TableHead>
              <TableHead>출처</TableHead>
              <TableHead>검색량</TableHead>
              <TableHead>CPC</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-red-500">
                  데이터를 불러오는데 실패했습니다
                </TableCell>
              </TableRow>
            ) : !data || data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  검색 결과가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((keyword) => (
                <TableRow key={keyword.id}>
                  <TableCell className="font-medium">{keyword.phrase}</TableCell>
                  <TableCell>
                    <Badge
                      variant={keyword.source === "manual" ? "default" : "secondary"}
                    >
                      {keyword.source === "manual" ? "직접 입력" : "DataForSEO"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {keyword.searchVolume !== null
                      ? keyword.searchVolume.toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {keyword.cpc !== null ? `$${keyword.cpc.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(keyword.createdAt), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Edit functionality
                          console.log("Edit keyword:", keyword.id);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Delete functionality
                          console.log("Delete keyword:", keyword.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.items.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            총 {data.total}개 중 {(page - 1) * limit + 1}-
            {Math.min(page * limit, data.total)}개 표시
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>
            <span className="text-sm">
              {page} / {Math.ceil(data.total / limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!data.hasMore}
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
