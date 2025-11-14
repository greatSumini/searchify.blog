"use client";

import { useState } from "react";
import { useDebounce } from "react-use";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useKeywordList } from "@/features/keywords/hooks/useKeywordQuery";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeywordPickerProps {
  value: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function KeywordPicker({
  value,
  onChange,
  placeholder = "키워드 검색...",
  disabled = false,
}: KeywordPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useDebounce(
    () => {
      setDebouncedQuery(searchQuery);
    },
    300,
    [searchQuery]
  );

  const { data, isLoading } = useKeywordList(debouncedQuery, 1, 20);

  const handleSelect = (keyword: string) => {
    if (value.includes(keyword)) {
      onChange(value.filter((k) => k !== keyword));
    } else {
      onChange([...value, keyword]);
    }
  };

  const handleRemove = (keyword: string) => {
    onChange(value.filter((k) => k !== keyword));
  };

  return (
    <div className="space-y-2">
      {/* Selected Keywords as Badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((keyword) => (
            <Badge key={keyword} variant="secondary" className="gap-1">
              {keyword}
              <button
                type="button"
                onClick={() => handleRemove(keyword)}
                disabled={disabled}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Keyword Picker Combobox */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="키워드 검색..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading ? (
                <CommandEmpty>검색 중...</CommandEmpty>
              ) : !data || data.items.length === 0 ? (
                <CommandEmpty>검색 결과가 없습니다</CommandEmpty>
              ) : (
                <CommandGroup>
                  {data.items.map((keyword) => (
                    <CommandItem
                      key={keyword.id}
                      value={keyword.phrase}
                      onSelect={() => {
                        handleSelect(keyword.phrase);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(keyword.phrase) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <p>{keyword.phrase}</p>
                        <div className="flex gap-2 text-xs text-gray-500">
                          {keyword.searchVolume !== null && (
                            <span>검색량: {keyword.searchVolume.toLocaleString()}</span>
                          )}
                          {keyword.cpc !== null && (
                            <span>CPC: ${keyword.cpc.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
