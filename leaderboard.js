/* Blue Legacy — classement mensuel Supabase */
(() => {
  "use strict";

  const LOG_PREFIX = "[Blue Legacy Leaderboard]";
  const CONFIG = Object.freeze({
    url: "https://njosnbahnbcacmqwmbff.supabase.co",
    publishableKey: "sb_publishable_EOeyk2sVpWdHCrxC_X6_cw_2ykfTKAt",
    table: "monthly_leaderboard",
    submitRpc: "submit_monthly_score",
    storyTable: "monthly_story_leaderboard",
    storySubmitRpc: "submit_monthly_story_score",
  });
  const AUTH_STORAGE_KEY = "blueLegacySupabaseAuth";
  const CACHE_STORAGE_KEY = "blueLegacyLeaderboardCache";
  const PROFILE_RPC = "upsert_player_profile";
  const PROFILE_D_RPC = "set_player_profile_d_cosmetic";
  const READ_RETRY_DELAYS = Object.freeze([500, 1500]);
  const REQUEST_TIMEOUT_MS = 10000;
  const MONTH_FORMATTER = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
  let profileProvider = () => ({ playerIdentity: {} });
  let identityFormatter = ({ playerIdentity = {}, profileCosmetics = {} }) => {
    const d = profileCosmetics.ownsCosmeticD && profileCosmetics.showD ? "D." : "";
    return [playerIdentity.lastName, d, playerIdentity.firstName].filter(Boolean).join(" ") || "Joueur anonyme";
  };
  let identityRenderer = null;
  let homeRequest = 0;
  let fullRequest = 0;
  let authPromise = null;
  let topFiveLoadPromise = null;
  let topFiftyLoadPromise = null;
  let manualRefreshPromise = null;

  function monthKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function monthLabel(date = new Date()) {
    const value = MONTH_FORMATTER.format(date);
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function readAuth() {
    try {
      const value = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
      return value?.access_token && value?.user?.id ? value : null;
    } catch (error) {
      return null;
    }
  }

  async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function authenticateAnonymously() {
    const existing = readAuth();
    if (existing && (!existing.expires_at || existing.expires_at * 1000 > Date.now() + 60000)) return existing;
    if (existing?.refresh_token) {
      const refreshResponse = await fetchWithTimeout(`${CONFIG.url}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { apikey: CONFIG.publishableKey, Authorization: `Bearer ${CONFIG.publishableKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: existing.refresh_token }),
      });
      if (refreshResponse.ok) {
        const refreshed = await refreshResponse.json();
        try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(refreshed)); } catch (error) { /* session utilisable en mémoire */ }
        return refreshed;
      }
      const refreshPayload = await refreshResponse.clone().json().catch(async () => ({ message: await refreshResponse.text().catch(() => "") }));
      logError("auth-refresh", createRequestError(refreshResponse, refreshPayload));
    }
    const response = await fetchWithTimeout(`${CONFIG.url}/auth/v1/signup`, {
      method: "POST",
      headers: { apikey: CONFIG.publishableKey, Authorization: `Bearer ${CONFIG.publishableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      const payload = await response.clone().json().catch(async () => ({ message: await response.text().catch(() => "") }));
      throw createRequestError(response, payload);
    }
    const auth = await response.json();
    try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth)); } catch (error) { /* session utilisable en mémoire */ }
    return auth;
  }

  function ensureAnonymousAuth() {
    const existing = readAuth();
    if (existing && (!existing.expires_at || existing.expires_at * 1000 > Date.now() + 60000)) {
      return Promise.resolve(existing);
    }
    if (authPromise) return authPromise;
    authPromise = authenticateAnonymously()
      .catch((error) => {
        logError("auth", error);
        throw error;
      })
      .finally(() => { authPromise = null; });
    return authPromise;
  }

  function logCurrentUserId(context, session) {
    console.info(`${LOG_PREFIX} Current user id: ${session?.user?.id || "unavailable"}`, { context });
  }

  function createRequestError(response, payload) {
    const error = new Error(payload?.message || `Supabase HTTP ${response.status}`);
    error.name = "SupabaseRequestError";
    error.status = response.status;
    error.code = payload?.code || null;
    error.details = payload?.details || null;
    error.hint = payload?.hint || null;
    return error;
  }

  function errorInfo(error) {
    return {
      message: error?.message || String(error),
      status: error?.status || null,
      code: error?.code || null,
      details: error?.details || null,
      hint: error?.hint || null,
    };
  }

  function normalizePlayerNamePart(value) {
    return String(value || "").trim().replace(/\s+/g, " ").slice(0, 40);
  }

  /* Cette politique doit rester synchronisée avec supabase-player-profiles.sql.
     La comparaison ignore casse, accents, séparateurs simples et quelques
     substitutions leetspeak fiables. Elle ne rapproche jamais les deux champs
     et ne réduit pas les lettres répétées. */
  const STRICT_BLOCKED_NAME_SKELETONS = Object.freeze([
    "nigger", "nigga", "negro", "negre", "bougnoule", "bamboula", "gook", "chink",
    "kike", "yid", "raghead", "sandnigger", "towelhead", "paki", "chinetoque",
    "youpin", "youpine", "feuj", "salejuif", "salejuive", "bicot", "crouille",
    "moukere", "faggot", "tranny",
    "shemale", "pede", "pedale", "tafiole", "tapette", "gouine",
  ]);
  const GENERAL_BLOCKED_NAME_TOKENS = new Set([
    "abruti", "abrutie", "batard", "batarde", "bite", "bordel", "con", "connard",
    "connasse", "couille", "couilles", "encule", "enculee", "fdp", "merde", "pute",
    "salope", "salaud", "asshole", "bitch", "cunt", "fuck", "fucker", "motherfucker",
    "retard", "shit", "slut", "whore",
  ]);
  const LEET_SKELETON = Object.freeze({
    "0": "o", "1": "i", "!": "i", "3": "e", "4": "a", "@": "a",
    "5": "s", "$": "s", "7": "t", "8": "b", "9": "g",
  });
  const DISCRIMINATORY_NAME_MESSAGE = "Ce nom contient un terme raciste ou discriminatoire et ne peut pas être utilisé.";
  const PROFANITY_NAME_MESSAGE = "Ce nom contient une insulte ou un terme inapproprié. Choisissez-en un autre.";

  function normalizePlayerNameForModeration(value) {
    return normalizePlayerNamePart(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\u0000-\u001f\u007f-\u009f\u00ad\u034f\u061c\u115f\u1160\u17b4\u17b5\u180e\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g, "")
      .toLocaleLowerCase("fr-FR")
      .replace(/œ/g, "oe")
      .replace(/æ/g, "ae")
      .replace(/[01345!@$789]/g, (character) => LEET_SKELETON[character] || character)
      .replace(/[^a-z]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function getModerationForms(value) {
    const normalized = normalizePlayerNameForModeration(value);
    const tokens = normalized.split(" ").filter(Boolean);
    const compact = tokens.join("");
    return {
      normalized,
      tokens,
      compact,
    };
  }

  function containsStrictBlockedName(forms) {
    return STRICT_BLOCKED_NAME_SKELETONS.some((blocked) => {
      if (blocked.length <= 4) {
        return forms.compact === blocked || forms.tokens.includes(blocked);
      }
      return forms.compact.includes(blocked);
    });
  }

  function getForbiddenNameReason(value) {
    const forms = getModerationForms(value);
    if (!forms.compact) return null;
    if (containsStrictBlockedName(forms)) return "forbidden-discriminatory-name";
    if (forms.tokens.some((token) => GENERAL_BLOCKED_NAME_TOKENS.has(token))) return "forbidden-profanity-name";
    return null;
  }

  function forbiddenNameMessage(reason) {
    return reason === "forbidden-discriminatory-name"
      ? DISCRIMINATORY_NAME_MESSAGE
      : PROFANITY_NAME_MESSAGE;
  }

  function validatePlayerNamePart(value) {
    const displayValue = normalizePlayerNamePart(value);
    if (!displayValue) return { ok: false, reason: "missing" };
    const reason = getForbiddenNameReason(displayValue);
    return { ok: !reason, reason, value: displayValue };
  }

  function validatePlayerIdentity({ firstName, lastName } = {}) {
    const first = validatePlayerNamePart(firstName);
    const last = validatePlayerNamePart(lastName);
    if (!first.ok || !last.ok) {
      const forbiddenReason = [first.reason, last.reason].find((reason) => reason?.startsWith("forbidden-"));
      return {
        ok: false,
        reason: forbiddenReason || "missing",
        message: forbiddenReason ? forbiddenNameMessage(forbiddenReason) : "Le nom et le prénom sont obligatoires.",
      };
    }
    return { ok: true, firstName: first.value, lastName: last.value };
  }

  function isUniqueProfileConflict(error) {
    return error?.code === "23505" || /unique|duplicate|player_profiles_normalized_name/i.test(
      `${error?.message || ""} ${error?.details || ""}`,
    );
  }

  function publicProfileFailure(error) {
    console.error("[Blue Legacy Profile]", errorInfo(error));
    const errorText = `${error?.message || ""} ${error?.details || ""}`;
    if (/Forbidden discriminatory player name/i.test(errorText)) {
      return { ok: false, reason: "forbidden-discriminatory-name", message: DISCRIMINATORY_NAME_MESSAGE, error };
    }
    if (/Forbidden profanity player name/i.test(errorText)) {
      return { ok: false, reason: "forbidden-profanity-name", message: PROFANITY_NAME_MESSAGE, error };
    }
    return isUniqueProfileConflict(error)
      ? { ok: false, reason: "name-taken", message: "Ce nom de joueur est déjà utilisé.", error }
      : { ok: false, reason: "unavailable", message: "Impossible de vérifier la disponibilité du nom pour le moment.", error };
  }

  async function reservePlayerProfile({ firstName, lastName, dCosmetic = false } = {}) {
    const validation = validatePlayerIdentity({ firstName, lastName });
    if (!validation.ok) return validation;
    const normalizedFirstName = validation.firstName;
    const normalizedLastName = validation.lastName;
    try {
      const session = await ensureAnonymousAuth();
      logCurrentUserId("public-profile-upsert", session);
      const result = await request(`/rest/v1/rpc/${PROFILE_RPC}`, {
        method: "POST",
        auth: true,
        body: {
          p_first_name: normalizedFirstName,
          p_last_name: normalizedLastName,
          p_d_cosmetic: dCosmetic === true,
        },
      });
      return { ok: true, profile: result.data?.[0] || result.data || null, firstName: normalizedFirstName, lastName: normalizedLastName };
    } catch (error) {
      return publicProfileFailure(error);
    }
  }

  async function syncPlayerDCosmetic(dCosmetic) {
    try {
      const result = await request(`/rest/v1/rpc/${PROFILE_D_RPC}`, {
        method: "POST",
        auth: true,
        body: { p_d_cosmetic: dCosmetic === true },
      });
      return { ok: true, profile: result.data?.[0] || result.data || null };
    } catch (error) {
      return publicProfileFailure(error);
    }
  }

  function logError(operation, error, attempt = null) {
    console.error(LOG_PREFIX, {
      operation,
      attempt,
      ...errorInfo(error),
    });
  }

  function isTransientError(error) {
    if ([408, 429, 500, 502, 503, 504].includes(Number(error?.status))) return true;
    if (["AbortError", "TimeoutError", "TypeError"].includes(error?.name)) return true;
    return /fetch|network|timeout|temporar|connexion|connection/i.test(String(error?.message || ""));
  }

  function delay(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  async function retryRead(operation, read) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        return await read();
      } catch (error) {
        logError(operation, error, attempt);
        if (!isTransientError(error) || attempt === 3) throw error;
        await delay(READ_RETRY_DELAYS[attempt - 1]);
      }
    }
    return null;
  }

  async function request(path, { method = "GET", body, auth = false, prefer } = {}) {
    const session = auth ? await ensureAnonymousAuth() : null;
    const headers = { apikey: CONFIG.publishableKey, Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    // Une lecture publique ne doit jamais hériter d'un JWT local expiré.
    headers.Authorization = `Bearer ${auth ? session.access_token : CONFIG.publishableKey}`;
    if (prefer) headers.Prefer = prefer;
    const response = await fetchWithTimeout(`${CONFIG.url}${path}`, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      const payload = await response.clone().json().catch(async () => ({ message: await response.text().catch(() => "") }));
      throw createRequestError(response, payload);
    }
    if (method === "HEAD" || response.status === 204) return { data: null, count: readCount(response) };
    return { data: await response.json(), count: readCount(response) };
  }

  function readCount(response) {
    const range = response.headers.get("content-range") || "";
    const count = Number(range.split("/")[1]);
    return Number.isFinite(count) ? count : null;
  }

  function normalizeEntry(row) {
    const rawLegendaryTitles = Array.isArray(row?.legendary_titles)
      ? row.legendary_titles
      : Array.isArray(row?.legendaryTitles) ? row.legendaryTitles : [];
    const legendaryTitles = rawLegendaryTitles
      .map((title) => String(title || "").trim()).filter(Boolean).slice(0, 3);
    const rawFirstName = String(row?.player_first_name || row?.first_name || row?.playerFirstName || "").trim();
    const rawLastName = String(row?.player_last_name || row?.last_name || row?.playerLastName || "").trim();
    const identityAllowed = validatePlayerIdentity({
      firstName: rawFirstName,
      lastName: rawLastName,
    }).ok;
    return {
      userId: String(row?.user_id || row?.userId || ""),
      playerFirstName: identityAllowed ? rawFirstName : "à renommer",
      playerLastName: identityAllowed ? rawLastName : "Joueur",
      playerDCosmetic: identityAllowed && (row?.player_d_cosmetic === true || row?.playerDCosmetic === true),
      identityMasked: !identityAllowed,
      characterName: String(row?.character_name || row?.characterName || "Légende sans nom").trim(),
      characterTitle: String(row?.character_title || row?.characterTitle || "").trim(),
      storyId: String(row?.story_id || row?.storyId || "").trim(),
      storyTitle: String(row?.story_title || row?.storyTitle || "").trim(),
      legendaryTitles,
      legendaryTitleCount: Math.min(3, Math.max(0, Number(row?.legendary_title_count ?? row?.legendaryTitleCount ?? legendaryTitles.length) || 0)),
      dreamCompleted: row?.dream_completed === true || row?.dreamCompleted === true,
      score: Math.max(0, Number(row?.score) || 0),
      updatedAt: String(row?.updated_at || row?.updatedAt || ""),
    };
  }

  function writeTopFiveCache(entries) {
    try {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify({
        monthKey: monthKey(),
        timestamp: Date.now(),
        entries,
      }));
    } catch (error) {
      logError("top5-cache-write", error);
    }
  }

  function readTopFiveCache() {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_STORAGE_KEY) || "null");
      if (cache?.monthKey !== monthKey() || !Array.isArray(cache.entries)) return null;
      return { ...cache, entries: cache.entries.map(normalizeEntry) };
    } catch (error) {
      logError("top5-cache-read", error);
      return null;
    }
  }

  async function getMonthlyTop(limit = 5) {
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit) || 5)));
    const select = "user_id,player_first_name,player_last_name,player_d_cosmetic,character_name,character_title,legendary_titles,legendary_title_count,dream_completed,score,updated_at";
    const query = new URLSearchParams({ select, month_key: `eq.${monthKey()}`, order: "score.desc,legendary_title_count.desc,updated_at.asc", limit: String(safeLimit) });
    const result = await request(`/rest/v1/${CONFIG.table}?${query}`);
    return (result.data || []).map(normalizeEntry);
  }

  async function getStoryMonthlyTop(limit = 5) {
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit) || 5)));
    const select = "user_id,player_first_name,player_last_name,player_d_cosmetic,character_name,story_id,story_title,score,updated_at";
    const query = new URLSearchParams({ select, month_key: `eq.${monthKey()}`, order: "score.desc,updated_at.asc", limit: String(safeLimit) });
    const result = await request(`/rest/v1/${CONFIG.storyTable}?${query}`);
    return (result.data || []).map(normalizeEntry);
  }

  async function getCurrentPlayerStoryEntry() {
    const session = await ensureAnonymousAuth();
    const select = "user_id,player_first_name,player_last_name,player_d_cosmetic,character_name,story_id,story_title,score,updated_at";
    const query = new URLSearchParams({ select, month_key: `eq.${monthKey()}`, user_id: `eq.${session.user.id}`, limit: "1" });
    const result = await request(`/rest/v1/${CONFIG.storyTable}?${query}`, { auth: true });
    return result.data?.[0] ? normalizeEntry(result.data[0]) : null;
  }

  function loadTopFive({ force = false } = {}) {
    if (topFiveLoadPromise) {
      return force
        ? topFiveLoadPromise.catch(() => null).then(() => loadTopFive({ force: true }))
        : topFiveLoadPromise;
    }
    const pending = retryRead("top5", () => getMonthlyTop(5))
      .then((entries) => {
        writeTopFiveCache(entries);
        return entries;
      });
    topFiveLoadPromise = pending;
    pending.then(() => {
      if (topFiveLoadPromise === pending) topFiveLoadPromise = null;
    }, () => {
      if (topFiveLoadPromise === pending) topFiveLoadPromise = null;
    });
    return pending;
  }

  function loadTopFifty({ force = false } = {}) {
    if (topFiftyLoadPromise) {
      return force
        ? topFiftyLoadPromise.catch(() => null).then(() => loadTopFifty({ force: true }))
        : topFiftyLoadPromise;
    }
    const pending = retryRead("top50", () => getMonthlyTop(50)).then((entries) => {
      writeTopFiveCache(entries.slice(0, 5));
      return entries;
    });
    topFiftyLoadPromise = pending;
    pending.then(() => {
      if (topFiftyLoadPromise === pending) topFiftyLoadPromise = null;
    }, () => {
      if (topFiftyLoadPromise === pending) topFiftyLoadPromise = null;
    });
    return pending;
  }

  async function getCurrentPlayerMonthlyEntry() {
    const session = await ensureAnonymousAuth();
    logCurrentUserId("personal-entry", session);
    const query = new URLSearchParams({ select: "user_id,player_first_name,player_last_name,player_d_cosmetic,character_name,character_title,legendary_titles,legendary_title_count,dream_completed,score,updated_at", month_key: `eq.${monthKey()}`, user_id: `eq.${session.user.id}`, limit: "1" });
    const result = await request(`/rest/v1/${CONFIG.table}?${query}`, { auth: true });
    return result.data?.[0] ? normalizeEntry(result.data[0]) : null;
  }

  async function countRows(filters) {
    const query = new URLSearchParams({ select: "user_id", month_key: `eq.${monthKey()}`, ...filters });
    const result = await request(`/rest/v1/${CONFIG.table}?${query}`, { method: "HEAD", auth: true, prefer: "count=exact" });
    return result.count || 0;
  }

  async function getCurrentPlayerRank(entry) {
    const current = entry || await getCurrentPlayerMonthlyEntry();
    if (!current) return null;
    const [higher, moreLegendaryTitles, earlierCompleteTie] = await Promise.all([
      countRows({ score: `gt.${current.score}` }),
      countRows({ score: `eq.${current.score}`, legendary_title_count: `gt.${current.legendaryTitleCount}` }),
      countRows({ score: `eq.${current.score}`, legendary_title_count: `eq.${current.legendaryTitleCount}`, updated_at: `lt.${current.updatedAt}` }),
    ]);
    return higher + moreLegendaryTitles + earlierCompleteTie + 1;
  }

  function compareLeaderboardEntries(left, right) {
    return (right.score - left.score) ||
      (right.legendaryTitleCount - left.legendaryTitleCount) ||
      String(left.updatedAt).localeCompare(String(right.updatedAt));
  }

  function shouldReplaceMonthlyBest(previous, candidate) {
    return candidate.score > previous.score ||
      (candidate.score === previous.score && candidate.legendaryTitleCount > previous.legendaryTitleCount);
  }

  function runLeaderboardTieBreakAudit() {
    const entry = (id, score, titles, updatedAt) => normalizeEntry({
      user_id: id, player_first_name: "Test", player_last_name: id,
      score, legendary_titles: Array.from({ length: titles }, (_, index) => `Titre ${index + 1}`), updated_at: updatedAt,
    });
    const ordered = [
      entry("recent-one", 100, 1, "2026-08-02T00:00:00Z"),
      entry("score-99", 99, 3, "2026-08-01T00:00:00Z"),
      entry("old-one", 100, 1, "2026-08-01T00:00:00Z"),
      entry("two", 100, 2, "2026-08-03T00:00:00Z"),
      entry("score-99-zero", 99, 0, "2026-08-01T00:00:00Z"),
    ].sort(compareLeaderboardEntries);
    const previous = entry("previous", 98, 2, "2026-08-01T00:00:00Z");
    const replacements = {
      equalMoreTitles: shouldReplaceMonthlyBest(previous, entry("new", 98, 3, "2026-08-02T00:00:00Z")),
      equalFewerTitles: !shouldReplaceMonthlyBest(previous, entry("new", 98, 1, "2026-08-02T00:00:00Z")),
      completeTie: !shouldReplaceMonthlyBest(previous, entry("new", 98, 2, "2026-08-02T00:00:00Z")),
      higherScore: shouldReplaceMonthlyBest(entry("old", 97, 3, "2026-08-01T00:00:00Z"), entry("new", 98, 0, "2026-08-02T00:00:00Z")),
      lowerScore: !shouldReplaceMonthlyBest(entry("old", 98, 3, "2026-08-01T00:00:00Z"), entry("new", 97, 3, "2026-08-02T00:00:00Z")),
    };
    const expectedOrder = ["two", "old-one", "recent-one", "score-99", "score-99-zero"];
    return Object.freeze({
      pass: ordered.map((item) => item.userId).join(",") === expectedOrder.join(",") && Object.values(replacements).every(Boolean),
      order: ordered.map((item) => item.userId), expectedOrder, replacements,
    });
  }

  async function submitCareer({ playerFirstName, playerLastName, playerDCosmetic = false, characterName, characterTitle = null, legendaryTitles = [], dreamCompleted = false, score, finishedAt }) {
    const identityValidation = validatePlayerIdentity({
      firstName: playerFirstName,
      lastName: playerLastName,
    });
    if (!identityValidation.ok) {
      return {
        submitted: false,
        skipped: identityValidation.reason === "missing" ? "missing-identity" : identityValidation.reason,
        reason: identityValidation.reason,
        message: identityValidation.message,
      };
    }
    const payload = {
      p_month_key: monthKey(new Date(finishedAt || Date.now())),
      p_player_first_name: identityValidation.firstName,
      p_player_last_name: identityValidation.lastName,
      p_player_d_cosmetic: playerDCosmetic === true,
      p_character_name: String(characterName || "Légende sans nom").trim().slice(0, 100),
      p_character_title: String(characterTitle || "").trim().slice(0, 120) || null,
      p_legendary_titles: (Array.isArray(legendaryTitles) ? legendaryTitles : [])
        .map((title) => String(title || "").trim().slice(0, 120))
        .filter(Boolean)
        .slice(0, 3),
      p_dream_completed: dreamCompleted === true,
      p_score: Math.min(100, Math.max(1, Math.round(Number(score) || 1))),
    };
    try {
      const session = await ensureAnonymousAuth();
      logCurrentUserId("submission", session);
      console.info(`${LOG_PREFIX} Submitting monthly score`, {
        month_key: payload.p_month_key,
        user_id: session.user.id,
        player_last_name: payload.p_player_last_name,
        player_first_name: payload.p_player_first_name,
        character_name: payload.p_character_name,
        score: payload.p_score,
        character_title: payload.p_character_title,
        legendary_titles: payload.p_legendary_titles,
        dream_completed: payload.p_dream_completed,
        player_d_cosmetic: payload.p_player_d_cosmetic,
      });
      const rpcResult = await request(`/rest/v1/rpc/${CONFIG.submitRpc}`, { method: "POST", body: payload, auth: true });
      console.info(`${LOG_PREFIX} Score submission successful`, rpcResult.data);
      let storedEntry = null;
      try {
        storedEntry = await getCurrentPlayerMonthlyEntry();
        console.info(`${LOG_PREFIX} Stored monthly score after submission`, {
          submitted_score: payload.p_score,
          stored_score: storedEntry?.score ?? null,
          row: storedEntry,
        });
        const submittedLegendaryCount = payload.p_legendary_titles.length;
        const expectedReplacement = storedEntry && (
          payload.p_score > storedEntry.score ||
          (payload.p_score === storedEntry.score && submittedLegendaryCount > storedEntry.legendaryTitleCount)
        );
        if (!storedEntry || (expectedReplacement && (
          storedEntry.score !== payload.p_score || storedEntry.legendaryTitleCount !== submittedLegendaryCount
        ))) {
          console.error(`${LOG_PREFIX} Score verification failed`, {
            submitted_score: payload.p_score,
            stored_score: storedEntry?.score ?? null,
            submitted_legendary_count: submittedLegendaryCount,
            stored_legendary_count: storedEntry?.legendaryTitleCount ?? null,
            diagnosis: "La RPC a répondu sans enregistrer le meilleur score attendu.",
          });
        }
      } catch (verificationError) {
        logError("post-submit-verification", verificationError);
      }
      await refreshHome({ force: true, preserveOnFailure: true });
      return { submitted: true, rpcResult: rpcResult.data, storedEntry };
    } catch (error) {
      console.error(`${LOG_PREFIX} Score submission failed`, errorInfo(error));
      const failure = publicProfileFailure(error);
      return { submitted: false, ...failure };
    }
  }

  async function submitStoryCareer({ playerFirstName, playerLastName, playerDCosmetic = false, characterName, storyId, storyTitle, score, finishedAt }) {
    const identityValidation = validatePlayerIdentity({ firstName: playerFirstName, lastName: playerLastName });
    if (!identityValidation.ok) return { submitted: false, reason: identityValidation.reason, message: identityValidation.message };
    const payload = {
      p_month_key: monthKey(new Date(finishedAt || Date.now())),
      p_player_first_name: identityValidation.firstName,
      p_player_last_name: identityValidation.lastName,
      p_player_d_cosmetic: playerDCosmetic === true,
      p_character_name: String(characterName || "Légende sans nom").trim().slice(0, 100),
      p_story_id: String(storyId || "").trim().slice(0, 50),
      p_story_title: String(storyTitle || "").trim().slice(0, 120),
      p_score: Math.min(100, Math.max(1, Math.round(Number(score) || 1))),
    };
    if (!payload.p_story_id || !payload.p_story_title) return { submitted: false, reason: "missing-story" };
    try {
      await ensureAnonymousAuth();
      const result = await request(`/rest/v1/rpc/${CONFIG.storySubmitRpc}`, { method: "POST", body: payload, auth: true });
      void refreshStoryHome();
      return { submitted: true, rpcResult: result.data };
    } catch (error) {
      logError("story-submission", error);
      return { submitted: false, ...publicProfileFailure(error) };
    }
  }

  function clear(element) { while (element?.firstChild) element.removeChild(element.firstChild); }
  function text(tag, className, value) { const node = document.createElement(tag); if (className) node.className = className; node.textContent = value; return node; }

  function formatLeaderboardIdentity(entry) {
    const identityProfile = {
      playerIdentity: { firstName: entry.playerFirstName, lastName: entry.playerLastName },
      profileCosmetics: {
        ownsCosmeticD: entry.playerDCosmetic,
        showD: entry.playerDCosmetic,
      },
    };
    return identityFormatter(identityProfile);
  }

  function getRankTierClass(rank) {
    if (rank >= 1 && rank <= 3) return "leaderboard-rank-mythic";
    if (rank >= 4 && rank <= 10) return "leaderboard-rank-gold";
    if (rank >= 11 && rank <= 24) return "leaderboard-rank-silver";
    if (rank >= 25 && rank <= 50) return "leaderboard-rank-bronze";
    return "";
  }

  function createRow(entry, rank, full = false) {
    const row = document.createElement("article");
    row.className = `leaderboard-entry ${getRankTierClass(rank)}`.trim();
    const rankNode = text("strong", "leaderboard-entry__rank", `#${rank}`);
    const names = document.createElement("div"); names.className = "leaderboard-entry__names";
    const playerIdentity = text("strong", "leaderboard-entry__player", "");
    if (entry.storyTitle) {
      playerIdentity.textContent = entry.characterName;
    } else if (identityRenderer) {
      identityRenderer(playerIdentity, {
        playerIdentity: { firstName: entry.playerFirstName, lastName: entry.playerLastName },
        profileCosmetics: {
          ownsCosmeticD: entry.playerDCosmetic,
          showD: entry.playerDCosmetic,
        },
      });
    } else {
      playerIdentity.textContent = formatLeaderboardIdentity(entry);
    }
    names.append(playerIdentity);
    if (!entry.storyTitle) names.append(text("span", "leaderboard-entry__character", entry.characterName));
    if (entry.storyTitle) names.append(text("span", "leaderboard-entry__title", `Roger — ${entry.storyTitle}`));
    if (entry.characterTitle) names.append(text("span", "leaderboard-entry__title", entry.characterTitle));
    if (entry.legendaryTitles?.length) {
      const legendaryTitles = document.createElement("div");
      legendaryTitles.className = "leaderboard-entry__legendary-titles";
      entry.legendaryTitles.forEach((titleName) => legendaryTitles.append(text("span", "leaderboard-entry__legendary-title", titleName)));
      names.append(legendaryTitles);
    }
    const meta = document.createElement("div"); meta.className = "leaderboard-entry__meta";
    meta.append(text("strong", "leaderboard-entry__score", `${entry.score} Popularité`));
    if (entry.dreamCompleted) meta.append(text("span", "leaderboard-entry__dream", "Rêve accompli"));
    row.append(rankNode, names, meta);
    return row;
  }

  function renderList(element, entries, { full = false, story = false } = {}) {
    clear(element);
    if (!entries.length) {
      const empty = document.createElement("div"); empty.className = "monthly-leaderboard-empty";
      empty.append(text("p", "", story ? "Aucune légende n’a encore été écrite en Mode Histoire." : "Aucune légende n’a encore marqué les mers ce mois-ci."), text("small", "", "Soyez le premier."));
      element.append(empty); return;
    }
    entries.forEach((entry, index) => element.append(createRow(entry, index + 1, full)));
  }

  function renderError(element, includeRetry = true) {
    clear(element);
    const box = document.createElement("div"); box.className = "monthly-leaderboard-error";
    box.append(text("strong", "", "Classement indisponible"), text("small", "", "Impossible de rejoindre les mers pour le moment."));
    if (includeRetry) { const button = text("button", "button leaderboard-retry", "Réessayer"); button.type = "button"; button.dataset.leaderboardRetry = ""; box.append(button); }
    element.append(box);
  }

  function renderCachedTopFive(element, cache) {
    renderList(element, cache.entries);
    const notice = document.createElement("div"); notice.className = "monthly-leaderboard-cache-notice";
    notice.append(text("small", "", "Dernier classement connu · Actualisation impossible"));
    const button = text("button", "leaderboard-cache-retry", "Réessayer");
    button.type = "button";
    button.dataset.leaderboardRetry = "";
    notice.append(button);
    element.append(notice);
  }

  function renderPersonalUnavailable(element) {
    clear(element);
    element.append(text("p", "leaderboard-personal-message", "Votre classement est temporairement indisponible."));
  }

  async function refreshHome({ force = false, preserveOnFailure = false } = {}) {
    const element = document.getElementById("monthly-leaderboard-top-five");
    if (!element) return;
    const requestId = ++homeRequest;
    const hadVisibleRanking = element.children.length > 0 && !element.querySelector(".monthly-leaderboard-status");
    if (!preserveOnFailure || !hadVisibleRanking) {
      clear(element); element.append(text("p", "monthly-leaderboard-status", "Chargement des légendes…"));
    }
    try {
      const entries = await loadTopFive({ force });
      if (requestId === homeRequest) renderList(element, entries);
    } catch (error) {
      if (requestId !== homeRequest) return;
      if (preserveOnFailure && hadVisibleRanking) return;
      const cache = readTopFiveCache();
      if (cache) renderCachedTopFive(element, cache);
      else renderError(element);
    }
  }

  async function refreshStoryHome() {
    const element = document.getElementById("leaderboard-story-empty-home");
    if (!element) return;
    clear(element);
    element.append(text("p", "monthly-leaderboard-status", "Chargement des histoires…"));
    try {
      renderList(element, await getStoryMonthlyTop(5), { story: true });
    } catch (error) {
      logError("story-top5", error);
      clear(element);
      element.append(text("p", "", "Le classement Histoire sera disponible après l’installation de son extension Supabase."));
    }
  }

  async function refreshStoryFull() {
    const element = document.getElementById("leaderboard-story-empty-full");
    if (!element) return;
    clear(element);
    element.append(text("p", "monthly-leaderboard-status", "Chargement des histoires…"));
    try {
      renderList(element, await getStoryMonthlyTop(50), { full: true, story: true });
    } catch (error) {
      logError("story-top50", error);
      clear(element);
      element.append(text("p", "", "Le classement Histoire sera disponible après l’installation de son extension Supabase."));
    }
  }

  function hasIdentity(profile) { return Boolean(String(profile?.playerIdentity?.firstName || "").trim() && String(profile?.playerIdentity?.lastName || "").trim()); }

  function runPlayerIdentityModerationAudit() {
    const blockedParts = [
      "NIGGER", "n.i.g.g.e.r", "n-i-g-g-e-r", "n_i_g_g_e_r", "n i g g e r",
      "n1gg3r", "b.o.u.g.n.o.u.l.e", "f4gg0t", "s-a-l-e-j-u-i-f",
      "m0therfucker",
    ];
    const splitIdentities = [
      { firstName: "nig", lastName: "ger" },
      { firstName: "ger", lastName: "nig" },
    ];
    const allowedIdentities = [
      { firstName: "Li", lastName: "Wei" },
      { firstName: "Élodie", lastName: "Martin" },
      { firstName: "Sean", lastName: "O'Connor" },
      { firstName: "Jean-Luc", lastName: "Picard" },
      { firstName: "Nigel", lastName: "Smith" },
      { firstName: "Nami", lastName: "Monkey" },
      { firstName: "Kaïa", lastName: "D. Storm" },
      { firstName: "DUPONT", lastName: "DUPONT" },
      { firstName: "DuPoNt", lastName: "XxTraffyxX" },
      { firstName: "Loooop", lastName: "Kaaaido" },
      { firstName: "Miiiiilo", lastName: "Zzzed" },
      { firstName: "R0ger", lastName: "Player7" },
      { firstName: "niiiigger", lastName: "Fantasy" },
    ];
    const blockedPartResults = blockedParts.map((value) => !validatePlayerNamePart(value).ok);
    const splitIdentityResults = splitIdentities.map((identity) => validatePlayerIdentity(identity).ok);
    const allowedResults = allowedIdentities.map((identity) => validatePlayerIdentity(identity).ok);
    const masked = normalizeEntry({
      player_first_name: blockedParts[0], player_last_name: "Test", score: 50,
    });
    return Object.freeze({
      pass: blockedPartResults.every(Boolean) && splitIdentityResults.every(Boolean) &&
        allowedResults.every(Boolean) && masked.identityMasked === true &&
        `${masked.playerLastName} ${masked.playerFirstName}` === "Joueur à renommer",
      blockedPartCount: blockedPartResults.length,
      blockedPartPassed: blockedPartResults.filter(Boolean).length,
      splitIdentityCount: splitIdentityResults.length,
      splitIdentityPassed: splitIdentityResults.filter(Boolean).length,
      allowedCount: allowedResults.length,
      allowedPassed: allowedResults.filter(Boolean).length,
      defensiveMaskPassed: masked.identityMasked === true,
    });
  }

  function renderPersonal(element, profile, entry, rank) {
    clear(element);
    if (!hasIdentity(profile)) { element.append(text("p", "leaderboard-personal-message", "Renseignez votre prénom et votre nom dans Carte de légende pour apparaître dans le classement.")); return; }
    if (!entry) {
      element.append(text("p", "leaderboard-personal-message", "Vous n’avez pas encore de score ce mois-ci."), text("small", "", "Terminez une aventure pour tenter d’entrer dans la légende.")); return;
    }
    element.append(text("strong", "leaderboard-personal-rank", `Vous êtes #${rank}`), createRow(entry, rank, false));
  }

  async function loadAndRenderTopFifty(list, requestId, { force = false, preserveOnFailure = false } = {}) {
    try {
      const entries = await loadTopFifty({ force });
      if (requestId === fullRequest) renderList(list, entries, { full: true });
    } catch (error) {
      if (requestId === fullRequest && !preserveOnFailure) renderError(list);
    }
  }

  async function loadAndRenderPersonal(personal, profile, requestId, { preserveOnFailure = false } = {}) {
    if (!hasIdentity(profile)) {
      if (requestId === fullRequest) renderPersonal(personal, profile, null, null);
      return;
    }
    try {
      const personalEntry = await getCurrentPlayerMonthlyEntry();
      const rank = personalEntry ? await getCurrentPlayerRank(personalEntry) : null;
      if (requestId === fullRequest) renderPersonal(personal, profile, personalEntry, rank);
    } catch (error) {
      logError("personal-rank", error);
      if (requestId === fullRequest && !preserveOnFailure) renderPersonalUnavailable(personal);
    }
  }

  function refreshFull({ force = false, preserveOnFailure = false } = {}) {
    const list = document.getElementById("monthly-leaderboard-top-fifty");
    const personal = document.getElementById("monthly-leaderboard-personal");
    if (!list || !personal) return;
    const requestId = ++fullRequest;
    if (!preserveOnFailure) {
      clear(list); list.append(text("p", "monthly-leaderboard-status", "Chargement des légendes…"));
      clear(personal); personal.append(text("p", "monthly-leaderboard-status", "Chargement…"));
    }
    const profile = profileProvider() || {};
    return Promise.all([
      loadAndRenderTopFifty(list, requestId, { force, preserveOnFailure }),
      loadAndRenderPersonal(personal, profile, requestId, { preserveOnFailure }),
    ]);
  }

  function setRefreshButtonsLoading(loading) {
    document.querySelectorAll("[data-leaderboard-refresh]").forEach((button) => {
      button.disabled = loading;
      button.textContent = loading ? "Actualisation…" : "Actualiser";
    });
  }

  function refreshOnline(scope = "home") {
    if (manualRefreshPromise) return manualRefreshPromise;
    setRefreshButtonsLoading(true);
    const operation = scope === "full"
      ? refreshFull({ force: true, preserveOnFailure: true })
      : refreshHome({ force: true, preserveOnFailure: true });
    manualRefreshPromise = Promise.resolve(operation).finally(() => {
      manualRefreshPromise = null;
      setRefreshButtonsLoading(false);
    });
    return manualRefreshPromise;
  }

  function setMonthLabels() {
    ["monthly-leaderboard-home-month", "monthly-leaderboard-full-month"].forEach((id) => { const node = document.getElementById(id); if (node) { node.textContent = monthLabel(); node.setAttribute("datetime", monthKey()); } });
  }

  function initialize({ getProfile, formatIdentity, renderIdentity } = {}) {
    if (typeof getProfile === "function") profileProvider = getProfile;
    if (typeof formatIdentity === "function") identityFormatter = formatIdentity;
    if (typeof renderIdentity === "function") identityRenderer = renderIdentity;
    setMonthLabels();
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-leaderboard-retry]")) {
        document.getElementById("leaderboard-screen")?.hidden ? refreshHome({ force: true }) : refreshFull();
      }
      const refreshButton = event.target.closest("[data-leaderboard-refresh]");
      if (refreshButton) void refreshOnline(refreshButton.dataset.leaderboardRefresh);
    });
    const existingSession = readAuth();
    if (existingSession) logCurrentUserId("leaderboard-initialize", existingSession);
    if (new URLSearchParams(window.location.search).has("identityModerationAudit")) {
      const audit = runPlayerIdentityModerationAudit();
      document.documentElement.dataset.identityModerationAudit = JSON.stringify(audit);
      const output = document.createElement("output");
      output.id = "identity-moderation-audit-output";
      output.setAttribute("popover", "manual");
      output.style.cssText = "position:fixed;inset:8px auto auto 8px;margin:0;padding:12px;background:#fff;color:#111;border:3px solid #111;font:700 22px monospace";
      output.textContent = `IDENTITY MODERATION AUDIT: ${audit.pass ? "PASS" : "FAIL"} · blocked ${audit.blockedPartPassed}/${audit.blockedPartCount} · split allowed ${audit.splitIdentityPassed}/${audit.splitIdentityCount} · allowed ${audit.allowedPassed}/${audit.allowedCount} · mask ${audit.defensiveMaskPassed ? "PASS" : "FAIL"}`;
      document.body.append(output);
      output.showPopover?.();
    }
    if (new URLSearchParams(window.location.search).has("leaderboardTieBreakAudit")) {
      const audit = runLeaderboardTieBreakAudit();
      document.documentElement.dataset.leaderboardTieBreakAudit = JSON.stringify(audit);
      const output = document.createElement("output");
      output.id = "leaderboard-tiebreak-audit-output";
      output.style.cssText = "position:fixed;inset:8px auto auto 8px;z-index:99999;padding:12px;background:#fff;color:#111;border:3px solid #111;font:700 20px monospace";
      output.textContent = `LEADERBOARD TIE-BREAK AUDIT: ${audit.pass ? "PASS" : "FAIL"}`;
      document.body.append(output);
    }
  }

  window.BlueLegacyLeaderboard = Object.freeze({ initialize, refreshHome, refreshFull, refreshStoryHome, refreshStoryFull, refreshOnline, submitCareer, submitStoryCareer, reservePlayerProfile, syncPlayerDCosmetic, normalizePlayerNamePart, normalizePlayerNameForModeration, validatePlayerNamePart, validatePlayerIdentity, runPlayerIdentityModerationAudit, runLeaderboardTieBreakAudit, getMonthlyTop, getStoryMonthlyTop, getCurrentPlayerMonthlyEntry, getCurrentPlayerRank, getMonthKey: monthKey });
})();
