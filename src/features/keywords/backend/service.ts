import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppLogger, AppConfig } from '@/backend/hono/context';
import { normalizeKeyword, validateKeywordPhrase } from '@/features/keywords/lib/normalize';
import { success, failure, type HandlerResult } from '@/backend/http/response';
import { keywordErrorCodes, type KeywordServiceError } from './error';
import type {
  Keyword,
  KeywordListResponse,
  ListKeywordsInput,
  CreateKeywordInput,
  BulkCreateKeywordsInput,
  KeywordSuggestionsInput,
  KeywordSuggestionsResponse,
  SuggestionItem,
} from './schema';

// ===== 목록 조회 (Full-Text Search 지원) =====
export async function listKeywords(
  supabase: SupabaseClient,
  input: ListKeywordsInput,
): Promise<HandlerResult<KeywordListResponse, KeywordServiceError>> {
  try {
    const { query, page, limit } = input;
    const offset = (page - 1) * limit;

    let countQuery = supabase.from('keywords').select('*', { count: 'exact', head: true });
    let dataQuery = supabase
      .from('keywords')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query && query.trim().length > 0) {
      const searchTerm = query.trim();
      const filter = `phrase.ilike.%${searchTerm}%`;
      countQuery = countQuery.or(filter);
      dataQuery = dataQuery.or(filter);
    }

    const [{ count }, { data, error }] = await Promise.all([
      countQuery,
      dataQuery,
    ]);

    if (error) {
      return failure(500, keywordErrorCodes.fetchError, 'Failed to fetch keywords', error);
    }

    const items: Keyword[] = (data || []).map((row) => ({
      id: row.id,
      phrase: row.phrase,
      normalized: row.normalized,
      source: row.source,
      searchVolume: row.search_volume,
      cpc: row.cpc ? parseFloat(row.cpc) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return success({
      items,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + items.length,
    });
  } catch (err) {
    return failure(500, keywordErrorCodes.fetchError, 'Unexpected error fetching keywords', err);
  }
}

// ===== 단건 생성 =====
export async function createKeyword(
  supabase: SupabaseClient,
  input: CreateKeywordInput,
): Promise<HandlerResult<Keyword, KeywordServiceError>> {
  const validation = validateKeywordPhrase(input.phrase);
  if (!validation.valid) {
    return failure(400, keywordErrorCodes.invalidPhrase, validation.error!);
  }

  const normalized = normalizeKeyword(input.phrase);

  try {
    const { data, error } = await supabase
      .from('keywords')
      .insert({
        phrase: input.phrase.trim(),
        normalized,
        source: 'manual',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return failure(409, keywordErrorCodes.duplicateNormalized, 'Keyword already exists');
      }
      return failure(500, keywordErrorCodes.createError, 'Failed to create keyword', error);
    }

    return success({
      id: data.id,
      phrase: data.phrase,
      normalized: data.normalized,
      source: data.source,
      searchVolume: data.search_volume,
      cpc: data.cpc ? parseFloat(data.cpc) : null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }, 201);
  } catch (err) {
    return failure(500, keywordErrorCodes.createError, 'Unexpected error creating keyword', err);
  }
}

// ===== 다건 생성 (중복 무시) =====
export async function bulkCreateKeywords(
  supabase: SupabaseClient,
  logger: AppLogger,
  input: BulkCreateKeywordsInput,
): Promise<HandlerResult<{ created: number; skipped: number; keywords: Keyword[] }, KeywordServiceError>> {
  const rows = input.phrases.map((phrase) => {
    const validation = validateKeywordPhrase(phrase);
    if (!validation.valid) {
      return null;
    }
    return {
      phrase: phrase.trim(),
      normalized: normalizeKeyword(phrase),
      source: 'dataforseo',
    };
  }).filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) {
    return failure(400, keywordErrorCodes.bulkInsertError, 'No valid keywords to insert');
  }

  try {
    const { data, error } = await supabase
      .from('keywords')
      .upsert(rows, { onConflict: 'normalized', ignoreDuplicates: true })
      .select();

    if (error) {
      logger.error('Bulk insert error:', error);
      return failure(500, keywordErrorCodes.bulkInsertError, 'Failed to bulk insert keywords', error);
    }

    const created = data?.length || 0;
    const skipped = rows.length - created;

    logger.info(`Bulk insert: ${created} created, ${skipped} skipped (duplicates)`);

    return success({
      created,
      skipped,
      keywords: (data || []).map((row) => ({
        id: row.id,
        phrase: row.phrase,
        normalized: row.normalized,
        source: row.source,
        searchVolume: row.search_volume,
        cpc: row.cpc ? parseFloat(row.cpc) : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    }, 201);
  } catch (err) {
    logger.error('Unexpected bulk insert error:', err);
    return failure(500, keywordErrorCodes.bulkInsertError, 'Unexpected error during bulk insert', err);
  }
}

// ===== DataForSEO 연관 검색어 조회 (캐시 우선) =====
export async function fetchKeywordSuggestions(
  supabase: SupabaseClient,
  logger: AppLogger,
  config: AppConfig,
  input: KeywordSuggestionsInput,
): Promise<HandlerResult<KeywordSuggestionsResponse, KeywordServiceError>> {
  const { seeds, languageName, locationCode, limit, forceRefresh } = input;

  // 1) Check cache (unless forceRefresh)
  if (!forceRefresh) {
    const cacheResult = await getCachedSuggestions(supabase, seeds, languageName, locationCode);
    if (cacheResult) {
      logger.info('Returning cached DataForSEO suggestions');
      return success({
        suggestions: cacheResult.suggestions,
        cached: true,
        cacheExpiresAt: cacheResult.expiresAt,
      });
    }
  }

  // 2) Call DataForSEO API
  logger.info('Fetching suggestions from DataForSEO API', { seeds, languageName, locationCode, limit });

  const auth = Buffer.from(`${config.dataForSEO.login}:${config.dataForSEO.password}`).toString('base64');
  const postData = [{
    keyword: seeds.join(', '),
    language_name: languageName,
    location_code: locationCode,
    limit,
  }];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_suggestions/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        return failure(401, keywordErrorCodes.dataForSEOInvalidCredentials, 'Invalid DataForSEO credentials');
      }
      if (response.status === 429) {
        return failure(429, keywordErrorCodes.dataForSEORateLimit, 'DataForSEO rate limit exceeded');
      }
      return failure(500, keywordErrorCodes.dataForSEOError, `DataForSEO API error: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.status_code !== 20000) {
      logger.error('DataForSEO API error:', json.status_message);
      return failure(500, keywordErrorCodes.dataForSEOError, json.status_message || 'DataForSEO API failed');
    }

    const rawResults = json.tasks?.[0]?.result || [];
    const suggestions: SuggestionItem[] = rawResults.map((item: any) => ({
      keyword: item.keyword,
      searchVolume: item.keyword_info?.search_volume || null,
      cpc: item.keyword_info?.cpc || null,
      competition: item.keyword_info?.competition || null,
    }));

    // 3) Cache the result (TTL: 24 hours)
    await cacheSuggestions(supabase, logger, seeds, languageName, locationCode, suggestions);

    return success({
      suggestions,
      cached: false,
      cacheExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      logger.error('DataForSEO request timeout');
      return failure(504, keywordErrorCodes.dataForSEOTimeout, 'DataForSEO request timed out');
    }
    logger.error('Unexpected DataForSEO error:', err);
    return failure(500, keywordErrorCodes.dataForSEOError, 'Unexpected error calling DataForSEO', err);
  }
}

// ===== 캐시 조회 헬퍼 =====
async function getCachedSuggestions(
  supabase: SupabaseClient,
  seeds: string[],
  languageName: string,
  locationCode: number,
): Promise<{ suggestions: SuggestionItem[]; expiresAt: string } | null> {
  try {
    const { data, error } = await supabase
      .from('keyword_suggestions_cache')
      .select('response_data, expires_at')
      .eq('language_name', languageName)
      .eq('location_code', locationCode)
      .contains('seeds', seeds)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      suggestions: data.response_data as SuggestionItem[],
      expiresAt: data.expires_at,
    };
  } catch {
    return null;
  }
}

// ===== 캐시 저장 헬퍼 =====
async function cacheSuggestions(
  supabase: SupabaseClient,
  logger: AppLogger,
  seeds: string[],
  languageName: string,
  locationCode: number,
  suggestions: SuggestionItem[],
): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    await supabase.from('keyword_suggestions_cache').insert({
      seeds,
      language_name: languageName,
      location_code: locationCode,
      response_data: suggestions,
      expires_at: expiresAt.toISOString(),
    });
  } catch (err) {
    logger.warn('Failed to cache suggestions (non-critical):', err);
  }
}
