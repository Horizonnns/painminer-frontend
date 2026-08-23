/** Зеркало painminer/api/schemas.py. Инлайновых типов в компонентах нет. */

export type Verdict = "yes" | "no" | "maybe";
export type AuthStage = "phone" | "code" | "password" | "done" | "unknown";
export type RunStatus = "running" | "done" | "failed" | "stopped";
export type ChatStatus =
  | "new"
  | "ok"
  | "private"
  | "not_found"
  | "admin_required"
  | "error";

export interface ApiErrorBody {
  error: { code: string; message: string };
}

export interface Settings {
  days_back: number;
  limit_per_query: number;
  min_length: number;
  pause_seconds: number;
}

export interface NicheBrief {
  name: string;
  chats: number;
  findings: number;
  hits: number;
  last_scanned_at: string | null;
}

export interface NicheConfig {
  niche: string;
  chats: string[];
  queries: string[];
  noise_patterns: string[];
  settings: Settings;
}

export interface NicheConfigPatch {
  queries?: string[];
  noise_patterns?: string[];
  settings?: Settings;
}

/**
 * Находка. Автора сообщения здесь нет и не будет: инструмент собирает
 * формулировки проблем, а не профили участников чатов.
 */
export interface Finding {
  message_id: number;
  chat_id: number;
  chat_title: string;
  chat_username: string | null;
  tg_msg_id: number;
  date: string | null;
  text: string;
  replies: number;
  reactions: number;
  link: string | null;
  queries: string[];
  cluster: string | null;
  verdict: string | null;
  score: number;
  has_money: boolean;
  is_question: boolean;
  /** Сколько раз этот текст встретился дословно. 1 — обычная находка. */
  repeats: number;
  first_seen: string | null;
  last_seen: string | null;
}

export interface FacetItem {
  value: string;
  label: string;
  count: number;
}

export interface Facets {
  chats: FacetItem[];
  queries: FacetItem[];
  clusters: FacetItem[];
}

export interface FindingsPage {
  items: Finding[];
  total: number;
  limit: number;
  offset: number;
  facets: Facets;
}

export interface FindingsQuery {
  chat?: number;
  query?: string;
  verdict?: string;
  cluster?: string;
  money?: boolean;
  question?: boolean;
  search?: string;
  hide_repeated?: boolean;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface QueryCount {
  query: string;
  count: number;
}

export interface Chat {
  id: number;
  tg_id: number | null;
  username: string | null;
  title: string;
  members: number | null;
  status: ChatStatus;
  added_at: string | null;
  last_scanned_at: string | null;
  findings: number;
  queries: QueryCount[];
}

export interface NicheSummary {
  niche: string;
  counts: Record<string, number>;
  chats: Chat[];
  top: Finding[];
  money: Finding[];
  clusters: FacetItem[];
  last_scanned_at: string | null;
}

export interface Ngram {
  gram: string;
  count: number;
}

export interface Report {
  niche: string;
  counts: Record<string, number>;
  top: Finding[];
  per_chat: Chat[];
  bigrams: Ngram[];
  trigrams: Ngram[];
  money: Finding[];
}

export interface Candidate {
  tg_id: number;
  title: string;
  username: string | null;
  members: number | null;
  kind: "group" | "channel";
}

export interface NotePayload {
  cluster?: string | null;
  verdict?: Verdict | null;
  comment?: string | null;
}

export interface RunParams {
  days?: number | null;
  full?: boolean;
  join?: boolean;
}

export interface ScanStats {
  chats_ok: number;
  chats_failed: number;
  queries_run: number;
  new_messages: number;
  updated_messages: number;
  refreshed: number;
  hits: number;
  skipped_empty: number;
  skipped_short: number;
  skipped_noise: number;
  skipped_crosspost: number;
  flood_waits: number;
  flood_seconds: number;
  errors: string[];
  interrupted: boolean;
}

export interface RunState {
  run_id: string;
  niche: string;
  status: RunStatus;
  started_at: string;
  finished_at: string | null;
  done: number;
  total: number;
  current: string | null;
  stats: ScanStats | null;
  errors: string[];
}

export interface AuthStatus {
  stage: AuthStage;
  authorized: boolean;
  /** false — состояние проверить не удалось (например, сессию занял прогон). */
  checked: boolean;
  has_credentials: boolean;
  user: string | null;
  phone: string | null;
}
