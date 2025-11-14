export type ParsedAIArticle = {
  title: string;
  content: string;
  metaDescription?: string;
  keywords: string[];
  headings?: string[];
};

/**
 * AI가 생성한 텍스트를 파싱하여 구조화합니다.
 * 우선순위:
 * 1) JSON 코드블록
 * 2) key: value 텍스트 블록 (title, content, metaDescription, keywords, headings)
 * 3) 마크다운 H1을 제목으로 간주하고 본문 추출
 */
export function parseGeneratedText(raw: string): ParsedAIArticle {
  const text = raw.trim();

  // 1) JSON fenced code block
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]+?)```/i);
  if (fenceMatch) {
    try {
      const obj = JSON.parse(fenceMatch[1]);
      if (obj && typeof obj === 'object') {
        const title = String(obj.title ?? '');
        const content = String(obj.content ?? '');
        const metaDescription = obj.metaDescription ? String(obj.metaDescription) : undefined;
        const keywords = Array.isArray(obj.keywords)
          ? obj.keywords.map((k: unknown) => String(k)).filter(Boolean)
          : [];
        const headings = Array.isArray(obj.headings)
          ? obj.headings.map((h: unknown) => String(h)).filter(Boolean)
          : undefined;

        if (title || content) {
          return { title, content, metaDescription, keywords, headings };
        }
      }
    } catch {
      // fallthrough
    }
  }

  // 2) key: value style parsing
  const lines = text.split(/\r?\n/);
  let title = '';
  let content = '';
  let metaDescription: string | undefined;
  let keywords: string[] = [];
  let headings: string[] | undefined;

  let i = 0;
  const eatBlock = (startIndex: number) => {
    const parts: string[] = [];
    for (let j = startIndex; j < lines.length; j++) {
      const line = lines[j];
      if (/^\s*(title|content|metaDescription|keywords|headings)\s*:/i.test(line) && j !== startIndex) {
        break;
      }
      parts.push(line);
      i = j;
    }
    return parts.join('\n').trim();
  };

  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^\s*(title|content|metaDescription|keywords|headings)\s*:\s*(.*)$/i);
    if (m) {
      const key = m[1].toLowerCase();
      const rest = m[2] ?? '';
      if (key === 'title') {
        title = rest.trim();
      } else if (key === 'content') {
        const body = rest ? rest + '\n' + eatBlock(i + 1) : eatBlock(i + 1);
        content = body.trim();
      } else if (key === 'metadescription') {
        metaDescription = rest.trim();
      } else if (key === 'keywords') {
        // Support comma-separated or list
        const segment = rest.trim();
        if (segment) {
          keywords = segment
            .split(/[,|\n]/)
            .map((s) => s.replace(/^[-\s]+/, '').trim())
            .filter(Boolean);
        } else {
          // try to read following list lines
          const block = eatBlock(i + 1);
          const arr = block
            .split(/\n/)
            .map((s) => s.replace(/^[-\s]+/, '').trim())
            .filter(Boolean);
          if (arr.length) keywords = arr;
        }
      } else if (key === 'headings') {
        const segment = rest.trim();
        if (segment) {
          headings = segment
            .split(/[,|\n]/)
            .map((s) => s.replace(/^[-\s]+/, '').trim())
            .filter(Boolean);
        } else {
          const block = eatBlock(i + 1);
          const arr = block
            .split(/\n/)
            .map((s) => s.replace(/^[-\s]+/, '').trim())
            .filter(Boolean);
          if (arr.length) headings = arr;
        }
      }
    }
    i++;
  }

  if (title || content) {
    return { title, content, metaDescription, keywords, headings };
  }

  // 3) Fallback: use first H1 as title
  const h1Match = text.match(/^#\s+(.+)$/m);
  const fallbackTitle = h1Match ? h1Match[1].trim() : 'AI 생성 글';
  const body = h1Match ? text.slice(text.indexOf(h1Match[0]) + h1Match[0].length).trim() : text;
  return { title: fallbackTitle, content: body, metaDescription, keywords, headings };
}

/**
 * Markdown 텍스트에서 헤딩(제목) 추출
 */
function extractHeadings(text: string): Array<{ level: number; text: string }> {
  const headings: Array<{ level: number; text: string }> = [];
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    // Match markdown headings (# H1, ## H2, etc.)
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
      });
    }
  }

  return headings;
}

/**
 * 스트리밍 중간 텍스트를 안전하게 JSON 형태로 파싱합니다.
 * - 절대 throw 하지 않습니다.
 * - 일부만 파싱되어도 가능한 정보만 채워 반환합니다.
 */
export function parseStreamingTextToJson(raw: string): Partial<ParsedAIArticle> {
  const safe: Partial<ParsedAIArticle> = {};
  try {
    if (!raw || !raw.trim()) return safe;

    // 우선 간단한 키-값 패턴을 전역에서 탐색하여 제목/메타/키워드 힌트를 확보
    const strictTitle = raw.match(/"title"\s*:\s*"([^"\n\r]*)"/i)?.[1];
    if (strictTitle) safe.title = strictTitle.trim();

    const strictMeta = raw.match(/"metaDescription"\s*:\s*"([^"\n\r]*)"/i)?.[1];
    if (strictMeta) safe.metaDescription = strictMeta.trim();

    if (!safe.keywords) {
      const kwStrictBlock = raw.match(/"keywords"\s*:\s*\[([\s\S]*?)\]/i)?.[1]
        ?? raw.match(/"keywords"\s*:\s*\[([\s\S]*?)$/i)?.[1];
      if (kwStrictBlock) {
        const tokens = kwStrictBlock
          .split(',')
          .map((s) => s.replace(/^[\s\n\r\t\-\*]*"?/, '').replace(/"?\s*$/, '').trim())
          .filter(Boolean);
        if (tokens.length) safe.keywords = [...new Set(tokens)].slice(0, 20);
      }
    }

    // 0) 먼저 명시적 JSON 코드블록을 직접 시도 (닫힘/미닫힘 모두 대응)
    const codeStartIdx = raw.indexOf('```json');
    if (codeStartIdx >= 0) {
      const after = raw.slice(codeStartIdx + '```json'.length);
      const endIdx = after.indexOf('```');
      const jsonCandidate = (endIdx >= 0 ? after.slice(0, endIdx) : after).trim();
      try {
        const obj = JSON.parse(jsonCandidate);
        if (obj && typeof obj === 'object') {
          if (obj.title) safe.title = String(obj.title);
          if (obj.content) safe.content = String(obj.content);
          if (obj.metaDescription) safe.metaDescription = String(obj.metaDescription);
          if (Array.isArray(obj.keywords)) safe.keywords = obj.keywords.map((k: unknown) => String(k)).filter(Boolean);
          if (Array.isArray(obj.headings)) safe.headings = obj.headings.map((h: unknown) => String(h)).filter(Boolean);
        }
      } catch {
        // ignore - 불완전 JSON일 수 있음
      }
    }

    // 우선 완전 파서 재사용 (내부적으로 실패해도 안전)
    const full = parseGeneratedText(raw);
    if (full.title && !safe.title) safe.title = full.title;
    if (full.metaDescription) safe.metaDescription = full.metaDescription;
    if (full.content) safe.content = full.content;
    if (full.keywords?.length) safe.keywords = [...new Set(full.keywords)].slice(0, 20);

    // 헤딩은 원문에서 추출 (부분 텍스트여도 동작)
    const heads = extractHeadings(raw).map((h) => h.text);
    if (heads.length) safe.headings = heads.slice(0, 20);

    // JSON 코드블록이 열렸지만 닫히지 않은 경우의 힌트 추출 (title: "...")
    const hintTitle = raw.match(/\btitle\s*[:=]\s*"?([^\n\r",}]+)"?/i)?.[1];
    if (hintTitle) safe.title = hintTitle.trim();

    const hintMeta = raw.match(/(?:\bmeta\s*description\b|\bmetaDescription\b)\s*[:=]\s*"?([^\n\r",}]+)"?/i)?.[1];
    if (hintMeta) safe.metaDescription = hintMeta.trim();

    // 키워드 힌트: keywords: [a, b, c] 혹은 리스트
    if (!safe.keywords || safe.keywords.length === 0) {
      const kwBlockMatch = raw.match(/\bkeywords\b\s*[:=]\s*([\s\S]+)/i);
      if (kwBlockMatch) {
        const block = kwBlockMatch[1].split(/\n\s*(title|content|metaDescription|headings)\s*[:=]/i)[0] ?? kwBlockMatch[1];
        const list: string[] = [];
        // 배열 표현 ["a","b",
        const arrMatch = block.match(/\[([\s\S]*?)$/);
        if (arrMatch) {
          const rawItems = arrMatch[1]
            .replace(/\]/g, "")
            .split(/,/) // 느슨하게 분리
            .map((s) => s.replace(/^\s*["'\-]?/, "").replace(/["']?\s*$/, "").trim())
            .filter(Boolean);
          list.push(...rawItems);
        } else {
          // 하이픈 리스트
          block
            .split(/\n/)
            .map((l) => l.replace(/^\s*[-*]\s*/, "").trim())
            .filter(Boolean)
            .forEach((v) => list.push(v));
        }
        if (list.length) safe.keywords = [...new Set(list)].slice(0, 20);
      }
    }
  } catch {
    // 절대 throw 하지 않음
    return safe;
  }
  return safe;
}
