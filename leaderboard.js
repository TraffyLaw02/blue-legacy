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
  const MONTH_FORMATTER = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
  let profileProvider = () => ({ playerIdentity: {} });
  let homeRequest = 0;
  let fullRequest = 0;

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

  async function ensureAnonymousAuth() {
    const existing = readAuth();
    if (existing && (!existing.expires_at || existing.expires_at * 1000 > Date.now() + 60000)) return existing;
    if (existing?.refresh_token) {
      const refreshResponse = await fetch(`${CONFIG.url}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { apikey: CONFIG.publishableKey, Authorization: `Bearer ${CONFIG.publishableKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: existing.refresh_token }),
      });
      if (refreshResponse.ok) {
        const refreshed = await refreshResponse.json();
        try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(refreshed)); } catch (error) { /* session utilisable en mémoire */ }
        return refreshed;
      }
    }
    const response = await fetch(`${CONFIG.url}/auth/v1/signup`, {
      method: "POST",
      headers: { apikey: CONFIG.publishableKey, Authorization: `Bearer ${CONFIG.publishableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!response.ok) throw new Error(`Authentification anonyme impossible (${response.status})`);
    const auth = await response.json();
    try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth)); } catch (error) { /* session utilisable en mémoire */ }
    return auth;
  }

  async function request(path, { method = "GET", body, auth = false, prefer } = {}) {
    const session = auth ? await ensureAnonymousAuth() : readAuth();
    const headers = { apikey: CONFIG.publishableKey, Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    headers.Authorization = `Bearer ${session?.access_token || CONFIG.publishableKey}`;
    if (prefer) headers.Prefer = prefer;
    const response = await fetch(`${CONFIG.url}${path}`, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Supabase ${response.status}${detail ? ` — ${detail}` : ""}`);
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
      characterName: String(row?.character_name || "Légende sans nom").trim(),
      score: Math.max(0, Number(row?.score) || 0),
      updatedAt: String(row?.updated_at || ""),
    };
  }

  async function getMonthlyTop(limit = 5) {
    const safeLimit = Math.min(50, Math.max(1, Math.floor(Number(limit) || 5)));
    const select = "user_id,player_first_name,player_last_name,character_name,score,updated_at";
    const query = new URLSearchParams({ select, month_key: `eq.${monthKey()}`, order: "score.desc,updated_at.asc", limit: String(safeLimit) });
    const result = await request(`/rest/v1/${CONFIG.table}?${query}`);
    return (result.data || []).map(normalizeEntry);
  }

  async function getCurrentPlayerMonthlyEntry() {
    const session = await ensureAnonymousAuth();
    const query = new URLSearchParams({ select: "user_id,player_first_name,player_last_name,character_name,score,updated_at", month_key: `eq.${monthKey()}`, user_id: `eq.${session.user.id}`, limit: "1" });
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

  async function submitCareer({ playerFirstName, playerLastName, characterName, score }) {
    if (!String(playerFirstName || "").trim() || !String(playerLastName || "").trim()) return { skipped: "missing-identity" };
    const payload = {
      p_month_key: monthKey(),
      p_player_first_name: String(playerFirstName).trim().slice(0, 40),
      p_player_last_name: String(playerLastName).trim().slice(0, 40),
      p_character_name: String(characterName || "Légende sans nom").trim().slice(0, 100),
      p_score: Math.max(0, Math.round(Number(score) || 0)),
    };
    try {
      await request(`/rest/v1/rpc/${CONFIG.submitRpc}`, { method: "POST", body: payload, auth: true });
      refreshHome();
      return { submitted: true };
    } catch (error) {
      console.error(LOG_PREFIX, "Soumission du score impossible.", error);
      return { submitted: false, error };
    }
  }

  function clear(element) { while (element?.firstChild) element.removeChild(element.firstChild); }
  function text(tag, className, value) { const node = document.createElement(tag); if (className) node.className = className; node.textContent = value; return node; }

  function createRow(entry, rank, full = false) {
    const row = document.createElement("article");
    row.className = `leaderboard-entry leaderboard-entry--rank-${rank}${rank <= 3 ? " leaderboard-entry--podium" : ""}`;
    const rankNode = text("strong", "leaderboard-entry__rank", `#${rank}`);
    const names = document.createElement("div"); names.className = "leaderboard-entry__names";
    names.append(text("strong", "leaderboard-entry__player", `${entry.playerFirstName} ${entry.playerLastName}`.trim() || "Joueur anonyme"));
    names.append(text("span", "leaderboard-entry__character", entry.characterName));
    const score = text("strong", "leaderboard-entry__score", full ? `${entry.score} Popularité` : String(entry.score));
    row.append(rankNode, names, score);
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

  async function refreshHome() {
    const element = document.getElementById("monthly-leaderboard-top-five");
    if (!element) return;
    const requestId = ++homeRequest;
    clear(element); element.append(text("p", "monthly-leaderboard-status", "Chargement des légendes…"));
    try { const entries = await getMonthlyTop(5); if (requestId === homeRequest) renderList(element, entries); }
    catch (error) { console.error(LOG_PREFIX, "Top 5 indisponible.", error); if (requestId === homeRequest) renderError(element); }
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

  async function refreshFull() {
    const list = document.getElementById("monthly-leaderboard-top-fifty");
    const personal = document.getElementById("monthly-leaderboard-personal");
    if (!list || !personal) return;
    const requestId = ++fullRequest;
    clear(list); list.append(text("p", "monthly-leaderboard-status", "Chargement des légendes…"));
    clear(personal); personal.append(text("p", "monthly-leaderboard-status", "Chargement…"));
    try {
      const profile = profileProvider() || {};
      const [entries, personalEntry] = await Promise.all([getMonthlyTop(50), hasIdentity(profile) ? getCurrentPlayerMonthlyEntry() : Promise.resolve(null)]);
      const rank = personalEntry ? await getCurrentPlayerRank(personalEntry) : null;
      if (requestId !== fullRequest) return;
      renderList(list, entries, { full: true }); renderPersonal(personal, profile, personalEntry, rank);
    } catch (error) {
      console.error(LOG_PREFIX, "Classement complet indisponible.", error);
      if (requestId === fullRequest) { renderError(list); renderError(personal, false); }
    }
  }

  function setMonthLabels() {
    ["monthly-leaderboard-home-month", "monthly-leaderboard-full-month"].forEach((id) => { const node = document.getElementById(id); if (node) { node.textContent = monthLabel(); node.setAttribute("datetime", monthKey()); } });
  }

  function initialize({ getProfile } = {}) {
    if (typeof getProfile === "function") profileProvider = getProfile;
    setMonthLabels();
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-leaderboard-retry]")) {
        document.getElementById("leaderboard-screen")?.hidden ? refreshHome() : refreshFull();
      }
    });
  }

  window.BlueLegacyLeaderboard = Object.freeze({ initialize, refreshHome, refreshFull, submitCareer, getMonthlyTop, getCurrentPlayerMonthlyEntry, getCurrentPlayerRank, getMonthKey: monthKey });
})();
