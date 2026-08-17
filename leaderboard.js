/* Blue Legacy — classement mensuel Supabase */
(() => {
  "use strict";

  const LOG_PREFIX = "[Blue Legacy Leaderboard]";
  const CONFIG = Object.freeze({
    url: "https://njosnbahnbcacmqwmbff.supabase.co",
    publishableKey: "sb_publishable_EOeyk2sVpWdHCrxC_X6_cw_2ykfTKAt",
    table: "monthly_leaderboard",
    submitRpc: "submit_monthly_score",
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

  function isUniqueProfileConflict(error) {
    return error?.code === "23505" || /unique|duplicate|player_profiles_normalized_name/i.test(
      `${error?.message || ""} ${error?.details || ""}`,
    );
  }

  function publicProfileFailure(error) {
    console.error("[Blue Legacy Profile]", errorInfo(error));
    return isUniqueProfileConflict(error)
      ? { ok: false, reason: "name-taken", message: "Ce nom de joueur est déjà utilisé.", error }
      : { ok: false, reason: "unavailable", message: "Impossible de vérifier la disponibilité du nom pour le moment.", error };
  }

  async function reservePlayerProfile({ firstName, lastName, dCosmetic = false } = {}) {
    const normalizedFirstName = normalizePlayerNamePart(firstName);
    const normalizedLastName = normalizePlayerNamePart(lastName);
    if (!normalizedFirstName || !normalizedLastName) {
      return { ok: false, reason: "invalid", message: "Le nom et le prénom sont obligatoires." };
    }
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
    return {
      userId: String(row?.user_id || ""),
      playerFirstName: String(row?.player_first_name || row?.first_name || "").trim(),
      playerLastName: String(row?.player_last_name || row?.last_name || "").trim(),
      playerDCosmetic: row?.player_d_cosmetic === true,
      characterName: String(row?.character_name || "Légende sans nom").trim(),
      characterTitle: String(row?.character_title || "").trim(),
      dreamCompleted: row?.dream_completed === true,
      score: Math.max(0, Number(row?.score) || 0),
      updatedAt: String(row?.updated_at || ""),
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
      return cache;
    } catch (error) {
      logError("top5-cache-read", error);
      return null;
    }
  }

  async function getMonthlyTop(limit = 5) {
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit) || 5)));
    const select = "user_id,player_first_name,player_last_name,player_d_cosmetic,character_name,character_title,dream_completed,score,updated_at";
    const query = new URLSearchParams({ select, month_key: `eq.${monthKey()}`, order: "score.desc,updated_at.asc", limit: String(safeLimit) });
    const result = await request(`/rest/v1/${CONFIG.table}?${query}`);
    return (result.data || []).map(normalizeEntry);
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
    const query = new URLSearchParams({ select: "user_id,player_first_name,player_last_name,player_d_cosmetic,character_name,character_title,dream_completed,score,updated_at", month_key: `eq.${monthKey()}`, user_id: `eq.${session.user.id}`, limit: "1" });
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
    const [higher, earlierTie] = await Promise.all([
      countRows({ score: `gt.${current.score}` }),
      countRows({ score: `eq.${current.score}`, updated_at: `lt.${current.updatedAt}` }),
    ]);
    return higher + earlierTie + 1;
  }

  async function submitCareer({ playerFirstName, playerLastName, playerDCosmetic = false, characterName, characterTitle = null, dreamCompleted = false, score, finishedAt }) {
    if (!String(playerFirstName || "").trim() || !String(playerLastName || "").trim()) return { skipped: "missing-identity" };
    const payload = {
      p_month_key: monthKey(new Date(finishedAt || Date.now())),
      p_player_first_name: String(playerFirstName).trim().slice(0, 40),
      p_player_last_name: String(playerLastName).trim().slice(0, 40),
      p_player_d_cosmetic: playerDCosmetic === true,
      p_character_name: String(characterName || "Légende sans nom").trim().slice(0, 100),
      p_character_title: String(characterTitle || "").trim().slice(0, 120) || null,
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
        if (!storedEntry || storedEntry.score < payload.p_score) {
          console.error(`${LOG_PREFIX} Score verification failed`, {
            submitted_score: payload.p_score,
            stored_score: storedEntry?.score ?? null,
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
      return { submitted: false, error };
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
    if (rank === 1) return "leaderboard-rank-mythic";
    if (rank >= 2 && rank <= 5) return "leaderboard-rank-gold";
    if (rank >= 6 && rank <= 15) return "leaderboard-rank-silver";
    if (rank >= 16 && rank <= 50) return "leaderboard-rank-bronze";
    return "";
  }

  function createRow(entry, rank, full = false) {
    const row = document.createElement("article");
    row.className = `leaderboard-entry ${getRankTierClass(rank)}`.trim();
    const rankNode = text("strong", "leaderboard-entry__rank", `#${rank}`);
    const names = document.createElement("div"); names.className = "leaderboard-entry__names";
    const playerIdentity = text("strong", "leaderboard-entry__player", "");
    if (identityRenderer) {
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
    names.append(text("span", "leaderboard-entry__character", entry.characterName));
    if (entry.characterTitle) names.append(text("span", "leaderboard-entry__title", entry.characterTitle));
    const meta = document.createElement("div"); meta.className = "leaderboard-entry__meta";
    meta.append(text("strong", "leaderboard-entry__score", `${entry.score} Popularité`));
    if (entry.dreamCompleted) meta.append(text("span", "leaderboard-entry__dream", "Rêve accompli"));
    row.append(rankNode, names, meta);
    return row;
  }

  function renderList(element, entries, { full = false } = {}) {
    clear(element);
    if (!entries.length) {
      const empty = document.createElement("div"); empty.className = "monthly-leaderboard-empty";
      empty.append(text("p", "", "Aucune légende n’a encore marqué les mers ce mois-ci."), text("small", "", "Soyez le premier."));
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

  function hasIdentity(profile) { return Boolean(String(profile?.playerIdentity?.firstName || "").trim() && String(profile?.playerIdentity?.lastName || "").trim()); }

  function renderPersonal(element, profile, entry, rank) {
    clear(element);
    if (!hasIdentity(profile)) { element.append(text("p", "leaderboard-personal-message", "Renseignez votre prénom et votre nom dans Statistiques pour apparaître dans le classement.")); return; }
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
  }

  window.BlueLegacyLeaderboard = Object.freeze({ initialize, refreshHome, refreshFull, refreshOnline, submitCareer, reservePlayerProfile, syncPlayerDCosmetic, normalizePlayerNamePart, getMonthlyTop, getCurrentPlayerMonthlyEntry, getCurrentPlayerRank, getMonthKey: monthKey });
})();
