/* ==========================================================
   BLUE LEGACY — APP.JS V1.1
========================================================== */

(() => {
  "use strict";

  /* ========================================================
     CONFIGURATION
  ======================================================== */

  const STORAGE_KEYS = Object.freeze({
    save: "seaOfLegendsV11Save",
    profile: "seaOfLegendsV11Profile",
    legacySaves: Object.freeze(["grandLineV1Save"]),
    legacyProfiles: Object.freeze(["grandLineV1Profile"]),
  });
  const PLAYER_PROFILE_STORAGE_KEYS = Object.freeze([
    STORAGE_KEYS.save,
    STORAGE_KEYS.profile,
    ...STORAGE_KEYS.legacySaves,
    ...STORAGE_KEYS.legacyProfiles,
  ]);

  const CONFIG = Object.freeze({
    version: "1.3.0",
    saveKey: STORAGE_KEYS.save,
    profileKey: STORAGE_KEYS.profile,
    legacySaveKeys: STORAGE_KEYS.legacySaves,
    legacyProfileKeys: STORAGE_KEYS.legacyProfiles,
    maxMonths: 24,
    logbookInterval: 4,
    dProbability: 0.04,
    dPityStart: 20,
    dGuaranteeAfterMisses: 39,
    dPityStep: 0.01,
    dInitialStatBonus: 3,
    dResolutionBonus: 4,
    recentEventLimit: 6,
    actionsPerMonth: 1,
    maxMajorRewards: 2,
  });

  const RESOLUTION_DEBUG = false;

  const SCREEN = Object.freeze({
    HOME: "home",
    CREATION: "creation",
    D_REVEAL: "dReveal",
    GAME: "game",
    RESULT: "result",
    LOGBOOK: "logbook",
    ZONE_TRANSITION: "zoneTransition",
    REWARD_REVEAL: "rewardReveal",
    ACHIEVEMENTS: "achievements",
    SHOP: "shop",
    STATISTICS: "statistics",
    LEADERBOARD: "leaderboard",
    TITLES: "titles",
    PANTHEON: "pantheon",
    PAST_LIFE: "pastLife",
    SETTINGS: "settings",
  });

  const SCREEN_IDS = Object.freeze({
    [SCREEN.HOME]: "home-screen",
    [SCREEN.CREATION]: "creation-screen",
    [SCREEN.D_REVEAL]: "d-reveal-slide",
    [SCREEN.GAME]: "game-screen",
    [SCREEN.RESULT]: "result-screen",
    [SCREEN.LOGBOOK]: "logbook-screen",
    [SCREEN.ZONE_TRANSITION]: "zone-transition-screen",
    [SCREEN.REWARD_REVEAL]: "reward-reveal-screen",
    [SCREEN.ACHIEVEMENTS]: "achievements-screen",
    [SCREEN.SHOP]: "shop-screen",
    [SCREEN.STATISTICS]: "statistics-screen",
    [SCREEN.LEADERBOARD]: "leaderboard-screen",
    [SCREEN.TITLES]: "titles-screen",
    [SCREEN.PANTHEON]: "pantheon-screen",
    [SCREEN.PAST_LIFE]: "past-life-screen",
    [SCREEN.SETTINGS]: "settings-screen",
  });

  const SCREEN_BY_ID = Object.freeze(
    Object.fromEntries(
      Object.entries(SCREEN_IDS).map(([name, id]) => [id, name]),
    ),
  );

  const BLUE_ZONE_IDS = Object.freeze([
    "east-blue",
    "north-blue",
    "south-blue",
    "west-blue",
  ]);

  const MAIN_ROUTE_IDS = Object.freeze([
    "reverse-mountain",
    "grand-line",
    "red-line",
    "shinsekai",
  ]);

  const CREATION_STEPS = Object.freeze([
    "sex",
    "faction",
    "dream",
    "origin",
    "name",
    "summary",
  ]);

  const CREATION_SLIDES = Object.freeze({
    sex: "sex-slide",
    faction: "faction-slide",
    dream: "dream-slide",
    origin: "origin-slide",
    name: "name-slide",
    summary: "summary-slide",
  });

  const STATS = Object.freeze({
    health: { label: "Santé", icon: "❤️", min: 1, max: 100 },
    combat: { label: "Combat", icon: "⚔️", min: 1, max: 100 },
    // `haki` reste la clé historique unique des sauvegardes. Son sens
    // mécanique est désormais la Défense ; les Hakis du lore sont des Titres.
    haki: { label: "Défense", icon: "🛡️", min: 1, max: 100 },
    intelligence: { label: "Intelligence", icon: "🧠", min: 1, max: 100 },
    charisma: { label: "Charisme", icon: "✨", min: 1, max: 100 },
    bounty: { label: "Prime", icon: "☠️", min: 0, max: 20000000, money: true },
    fortune: { label: "Fortune", icon: "💰", min: 0, max: 1000000, money: true },
    crew: { label: "Équipage", icon: "👥", min: 0, max: 10 },
    popularity: { label: "Popularité", icon: "⭐", min: 1, max: 100 },
  });

  const FACTION_META = Object.freeze({
    pirate: Object.freeze({ label: "Pirate", icon: "🏴‍☠️" }),
    marine: Object.freeze({ label: "Marine", icon: "⚓" }),
    "bounty-hunter": Object.freeze({ label: "Chasseur de primes", icon: "🎯" }),
    revolutionary: Object.freeze({ label: "Révolutionnaire", icon: "✊" }),
  });

  const EVENT_TYPE_META = Object.freeze({
    ordinary: Object.freeze({ label: "Événement", icon: "🌊", themeClass: "is-ordinary-event", difficulty: 0 }),
    risk: Object.freeze({ label: "Événement à risque", icon: "⚠️", themeClass: "is-risk-event", difficulty: 10 }),
    decisive: Object.freeze({ label: "Événement décisif", icon: "⭐", themeClass: "is-decisive-event", difficulty: 7 }),
    legendary: Object.freeze({ label: "Arc légendaire", icon: "◆", themeClass: "is-legendary-event", difficulty: 11 }),
    "surprise-fruit": Object.freeze({ label: "Surprise — Fruit du Démon", icon: "🍈", themeClass: "is-fruit-surprise", difficulty: 0 }),
    "surprise-recruit": Object.freeze({ label: "Surprise — Recrutement", icon: "🤝", themeClass: "is-recruit-surprise", difficulty: 0 }),
  });

  const FACTION_RENOWN_META = Object.freeze({
    pirate: Object.freeze({ label: "Prime", icon: "☠️", description: "La prime placée sur ta tête par le Gouvernement mondial.", money: true }),
    revolutionary: Object.freeze({ label: "Dangerosité", icon: "🔥", description: "Le niveau de menace que le Gouvernement mondial t’attribue.", money: true }),
    "bounty-hunter": Object.freeze({ label: "Renommée", icon: "🎯", description: "Ta réputation professionnelle et la valeur des contrats accomplis.", money: true }),
    marine: Object.freeze({ label: "Autorité", icon: "⚓", description: "Ton influence opérationnelle et la confiance de la hiérarchie.", money: true }),
  });

  const RESOLUTION_DEFAULT_WEIGHTS = Object.freeze({
    action: Object.freeze({ health: 0.22, combat: 0.42, haki: 0.36 }),
    social: Object.freeze({ charisma: 0.40, intelligence: 0.40, renown: 0.20 }),
  });

  const OUTCOME_PROBABILITY_CURVES = Object.freeze({
    ordinary: Object.freeze({ base: 0.20, score: 0.007, mixed: 0.30, severe: 0.18 }),
    risk: Object.freeze({ base: 0.08, score: 0.0065, mixed: 0.25, severe: 0.34 }),
    decisive: Object.freeze({ base: 0.12, score: 0.0065, mixed: 0.27, severe: 0.28 }),
    surprise: Object.freeze({ base: 0.72, score: 0.002, mixed: 0.22, severe: 0.05 }),
  });

  const OUTCOME_TIER_ORDER = Object.freeze([
    "severe_failure", "failure", "mixed", "success", "exceptional_success",
  ]);

  const SHORT_OUTCOME_PHRASES = Object.freeze({
    action: Object.freeze({
      exceptional_success: "Ta maîtrise retourne entièrement la situation.",
      success: "Ta manœuvre atteint son objectif.",
      mixed: "Tu préserves l’essentiel, sans obtenir tout ce que tu visais.",
      failure: "L’action échoue, mais tu parviens à te retirer.",
      severe_failure: "L’erreur te coûte cher et brise ton élan.",
    }),
    social: Object.freeze({
      exceptional_success: "Tes paroles font basculer tous les témoins.",
      success: "Ton approche convainc les personnes décisives.",
      mixed: "Tu sèmes le doute, sans emporter pleinement l’adhésion.",
      failure: "La discussion tourne court et affaiblit ta position.",
      severe_failure: "La situation se retourne publiquement contre toi.",
    }),
  });

  function getFactionRenownMeta(factionId) {
    return FACTION_RENOWN_META[getDataId(factionId)] || FACTION_RENOWN_META.pirate;
  }

  const CORE_STAT_MIN = 1;
  const CORE_STAT_MAX = 100;
  const POPULARITY_MIN = CORE_STAT_MIN;
  const POPULARITY_MAX = CORE_STAT_MAX;
  const CORE_STAT_IDS = Object.freeze([
    "health",
    "combat",
    "haki",
    "intelligence",
    "charisma",
    "popularity",
  ]);
  const STARTING_STAT_VARIANCE_IDS = Object.freeze([
    "health", "combat", "haki", "intelligence", "charisma",
  ]);
  const NON_NEGATIVE_STAT_IDS = Object.freeze(["bounty", "fortune", "crew"]);
  const LEGACY_SHIP_STAT_IDS = Object.freeze(["ship", "navire"]);
  const LEGACY_MORALE_STAT_IDS = Object.freeze(["morale", "moral"]);
  const LEGACY_POPULARITY_STAT_IDS = Object.freeze(["score", "reputation"]);
  const OBSOLETE_STAT_IDS = Object.freeze([
    ...LEGACY_SHIP_STAT_IDS,
    ...LEGACY_MORALE_STAT_IDS,
    ...LEGACY_POPULARITY_STAT_IDS,
  ]);

  const CAREER_FLAG_SCORES = Object.freeze({
    defeatedAlbaRival: 4,
    sparedAlbaRival: 2,
    humiliatedAlbaRival: 2,
    defendedReverseMountainVillage: 3,
    freedCurrentPrisoner: 2,
    savedMarineGuardAtReverseMountain: 3,
    protectedWhitebeardMedicine: 4,
    rescuedBlackBladeSurvivors: 4,
    liberatedGovernmentConvoy: 5,
    abandonedCurrentPrisoner: -2,
    extortedReverseMountainVillage: -3,
    angeredEmperorNetwork: -3,
    markedByWorldGovernment: -2,
  });

  const DREAM_INITIAL_EFFECTS = Object.freeze({
    "one-piece": { intelligence: 2 },
    "sea-emperor": { charisma: 2, haki: 1 },
    "worlds-greatest-fortune": { intelligence: 2, fortune: 5000 },
    "forgotten-history": { intelligence: 3 },
    "greatest-bounty-hunter": { combat: 2 },
    "most-dangerous-criminals": { intelligence: 2 },
    "hunt-an-emperor": { haki: 2 },
    "contract-fortune": { intelligence: 2, fortune: 5000 },
    "break-the-chains": { charisma: 2 },
    "reveal-void-century": { intelligence: 3 },
    "build-underground-network": { intelligence: 2, charisma: 1 },
    "found-free-nation": { charisma: 3 },
    admiral: { combat: 2 },
    "fleet-admiral": { charisma: 2, intelligence: 1 },
    "reform-the-marines": { intelligence: 2, charisma: 1 },
    "greatest-marine-hero": { health: 2, haki: 1 },
  });

  const STAT_ALIASES = Object.freeze({
    health: "health",
    sante: "health",
    combat: "combat",
    haki: "haki",
    defense: "haki",
    "défense": "haki",
    intelligence: "intelligence",
    intellect: "intelligence",
    charisma: "charisma",
    charisme: "charisma",
    bounty: "bounty",
    prime: "bounty",
    fortune: "fortune",
    crew: "crew",
    equipage: "crew",
    popularity: "popularity",
    score: "popularity",
    popularite: "popularity",
    "popularité": "popularity",
  });

  const NAMES = Object.freeze({
    male: [
      "Akio", "Arlen", "Bram", "Dario", "Elio", "Finn", "Goro",
      "Harun", "Ilan", "Jin", "Kael", "Lio", "Milo", "Nero",
      "Oran", "Ren", "Riku", "Soren", "Toma", "Vann", "Yori", "Zed",
      "Adem", "Akim", "Aldo", "Amaru", "Ansel", "Aren", "Bao", "Bastien",
      "Caius", "Caleb", "Ciro", "Dagan", "Daigo", "Daren", "Eidan", "Enzo",
      "Fares", "Faron", "Gaël", "Haku", "Hector", "Isao", "Ivo", "Jarek",
      "Jiro", "Kamil", "Kenzo", "Kiran", "Levan", "Luan", "Marek", "Masao",
      "Naël", "Nassim", "Nilo", "Oren", "Pavel", "Qadir", "Rael", "Rayan",
      "Ryo", "Samir", "Silas", "Tarek", "Tenzin", "Vadim", "Yago", "Yanis",
      "Zahir", "Zoran", "Aster", "Boro", "César", "Dimas", "Eren", "Kento",
    ],
    female: [
      "Asha", "Aya", "Celia", "Elya", "Hana", "Iris", "June",
      "Kaia", "Lina", "Lyra", "Maë", "Mira", "Nora", "Rin",
      "Sora", "Talia", "Uma", "Yuna", "Zia",
      "Adara", "Aïna", "Alba", "Amaya", "Anouk", "Azra", "Béryl", "Brisa",
      "Cassia", "Cléo", "Dahlia", "Darya", "Eira", "Elara", "Enya", "Farah",
      "Gaïa", "Hina", "Ilona", "Inaya", "Isolde", "Jaya", "Kalya", "Kira",
      "Lale", "Leïla", "Liora", "Malia", "Mei", "Naïa", "Nila", "Oona",
      "Priya", "Ranya", "Réva", "Sanaa", "Sena", "Shirin", "Tara", "Théa",
      "Vega", "Yara", "Ysia", "Zara", "Aelis", "Doria", "Ilyne", "Kenza",
      "Luma", "Neria", "Oria", "Sélène", "Tessa", "Vanya", "Zélie", "Mouna",
    ],
    neutral: [
      "Ari", "Eden", "Kai", "Noa", "Robin", "Sasha", "Sol", "Tao",
      "Aki", "Alix", "Ciel", "Dani", "Eli", "Ezra", "Ira", "Jade",
      "Kei", "Loan", "Lou", "Mika", "Nell", "Nima", "Paz", "Sami",
      "Soraï", "Tima", "Val", "Yaël",
    ],
    surnames: [
      "Amber", "Ashford", "Blacktide", "Crow", "Dawn", "Drake",
      "Flint", "Gale", "Harbor", "Marrow", "Reef", "Rook",
      "Salt", "Storm", "Tide", "Vane", "Wave", "Westwind",
      "Aigremont", "Alizé", "Ancrebrune", "Aubeclaire", "Balafre", "Bellebrume",
      "Bois-Salé", "Briselame", "Brumeciel", "Caldera", "Cap-Rouge", "Carmin",
      "Cendremer", "Corail", "Cornebrume", "Courant", "Crochelune", "Dague",
      "Dérive", "Écume", "Éperon", "Étoilemer", "Falaise", "Fer-Ancre",
      "Flotsombre", "Forgevent", "Givre", "Grandelame", "Houle", "Lagune",
      "Lamebleue", "Lanterne", "Levant", "Longécume", "Marée-Haute", "Mistral",
      "Noroît", "Orage", "Pavillon", "Pointe-Noire", "Récif-Rouge", "Ronce",
      "Sablétoile", "Sillage", "Solevent", "Souffremer", "Tonnebrume", "Tramontane",
      "Vaguebrune", "Vent-Sec", "Vigie", "Voilegrise", "Abyssal", "Brisefer",
      "Cap-Serein", "Éclat", "Millecaps", "Rive-Noire", "Rochebrume", "Vif-Argent",
    ],
  });

  /* ========================================================
     ÉTAT GLOBAL
  ======================================================== */

  const state = {
    screen: SCREEN.HOME,
    creationStep: 0,
    creation: createEmptyCreation(),
    nameMemory: createEmptyNameMemory(),
    game: null,
    result: null,
    selectedPastLifeId: null,
    returnScreen: SCREEN.HOME,
    resumeScreen: SCREEN.GAME,
    gameStatsExpanded: false,
    gameDetailsExpanded: false,
    pendingShopPurchaseId: null,
    pendingCosmeticPurchaseId: null,
    statisticsIdentityEditing: false,
    statisticsAppearanceOpen: false,
    isResolvingEvent: false,
    isContinuingResult: false,
    isResettingProfile: false,
    profileResetCompletedAt: 0,
  };

  const GAME_STATS_EXPANDED_SESSION_KEY = "blueLegacyGameStatsExpanded";
  const GAME_DETAILS_EXPANDED_SESSION_KEY = "blueLegacyGameDetailsExpanded";

  const dom = {};

  /* ========================================================
     DOM
  ======================================================== */

  function collectDom() {
    const byId = (id) => document.getElementById(id);

    dom.screens = [...document.querySelectorAll(".screen")];
    dom.slides = [...document.querySelectorAll(".creation-slide")];
    dom.gameScreen = byId("game-screen");

    dom.startAdventure = byId("start-adventure-btn");
    dom.resumeAdventure = byId("resume-adventure-btn");
    dom.abandonAdventure = byId("abandon-adventure-btn");
    dom.resetProfile = byId("reset-profile-btn");
    dom.resetProfileStatus = byId("reset-profile-status");
    dom.openGameMenu = byId("open-game-menu-btn");
    dom.homeBerryBalance = byId("home-berry-balance");
    dom.shopBerryBalance = byId("shop-berry-balance");
    dom.shopEquippedCount = byId("shop-equipped-count");
    dom.shopEquippedItems = byId("shop-equipped-items");
    dom.shopItems = byId("shop-items");
    dom.shopCosmetics = byId("shop-cosmetics");
    dom.statisticsContent = byId("statistics-content");
    dom.shopCurrentRunNote = byId("shop-current-run-note");

    dom.creationPrevious = byId("creation-previous-btn");
    dom.creationHome = byId("creation-home-btn");
    dom.creationStepCurrent = byId("creation-step-current");
    dom.creationStepTotal = byId("creation-step-total");

    dom.generatedName = byId("generated-name");
    dom.rerollFullName = byId("reroll-full-name-btn");
    dom.rerollFirstName = byId("reroll-first-name-btn");
    dom.rerollLastName = byId("reroll-last-name-btn");
    dom.confirmName = byId("confirm-name-btn");
    dom.createCharacter = byId("create-character-btn");

    dom.summaryName = byId("summary-name");
    dom.summarySex = byId("summary-sex");
    dom.summaryFaction = byId("summary-faction");
    dom.summaryDream = byId("summary-dream");
    dom.summaryOrigin = byId("summary-origin");
    dom.summaryStats = byId("summary-stats-list");

    dom.standardDeparture = byId("standard-departure-content");
    dom.standardDepartureText = byId("standard-departure-text");
    dom.willOfD = byId("will-of-d-content");
    dom.dRevealName = byId("d-reveal-name");
    dom.startingStatVariance = byId("starting-stat-variance");
    dom.startingStatVarianceList = byId("starting-stat-variance-list");
    dom.beginGame = byId("begin-game-btn");

    dom.gameDate = byId("game-date");
    dom.gameZone = byId("game-screen-title");
    dom.gameRegion = byId("game-region");
    dom.gameCharacterName = byId("game-character-name");
    dom.gameStatsToggle = byId("game-stats-toggle");
    dom.gameStatsPanel = byId("game-stats-panel");
    dom.gameStats = byId("game-stats-list");
    dom.gameDetailsToggle = byId("game-details-toggle");
    dom.gameDetailsPanel = byId("game-details-panel");
    dom.gameCareerAssets = byId("game-career-assets");
    dom.gameFruitSection = byId("game-fruit-section");
    dom.gameDevilFruit = byId("game-devil-fruit");
    dom.gameCrewSection = byId("game-crew-section");
    dom.gameCrewTitle = byId("game-crew-title");
    dom.gameCrewMembers = byId("game-crew-members");
    dom.gameActiveTitles = byId("game-active-titles");
    dom.gameShopItemsSection = byId("game-shop-items-section");
    dom.gameShopItems = byId("game-shop-items");
    dom.eventEyebrow = byId("event-eyebrow");
    dom.eventTitle = byId("event-title");
    dom.eventDescription = byId("event-description");
    dom.eventChoices = byId("event-choices");

    dom.resultTitle = byId("result-screen-title");
    dom.resultDescription = byId("result-description");
    dom.resultStats = byId("result-stat-changes");
    dom.resultRewards = byId("result-rewards");
    dom.continueResult = byId("continue-after-result-btn");

    dom.logbookZone = byId("logbook-zone");
    dom.logbookPeriod = byId("logbook-period");
    dom.logbookNarrative = byId("logbook-narrative");
    dom.logbookHighlights = byId("logbook-highlights");
    dom.logbookStats = byId("logbook-stat-changes");
    dom.logbookReward = byId("logbook-reward");
    dom.logbookTitles = byId("logbook-titles");
    dom.logbookDiscoveriesSection = byId("logbook-discoveries-section");
    dom.logbookDiscoveries = byId("logbook-discoveries");
    dom.logbookNext = byId("logbook-next-destination");
    dom.continueLogbook = byId("continue-from-logbook-btn");

    dom.zoneTransitionScreen = byId("zone-transition-screen");
    dom.zoneTransitionIcon = byId("zone-transition-icon");
    dom.zoneTransitionEyebrow = byId("zone-transition-eyebrow");
    dom.zoneTransitionProgress = byId("zone-transition-progress");
    dom.zoneTransitionTitle = byId("zone-transition-title");
    dom.zoneTransitionDescription = byId("zone-transition-description");
    dom.continueZoneTransition = byId("continue-zone-transition-btn");

    dom.rewardRevealScreen = byId("reward-reveal-screen");
    dom.rewardRevealCard = byId("reward-reveal-card");
    dom.rewardRevealIcon = byId("reward-reveal-icon");
    dom.rewardRevealEyebrow = byId("reward-reveal-eyebrow");
    dom.rewardRevealName = byId("reward-reveal-name");
    dom.rewardRevealRarity = byId("reward-reveal-rarity");
    dom.rewardRevealDescription = byId("reward-reveal-description");
    dom.continueRewardReveal = byId("continue-reward-reveal-btn");

    dom.achievements = byId("achievements-list");
    dom.achievementsSummary = byId("achievements-collection-summary");
    dom.titles = byId("titles-list");
    dom.titlesSummary = byId("titles-collection-summary");
    dom.pastLives = byId("past-lives-list");
    dom.pantheonSummary = byId("pantheon-collection-summary");
    dom.pantheonOverview = byId("pantheon-overview");

    dom.pastLifeHero = byId("past-life-hero");
    dom.pastLifeTitle = byId("past-life-title");
    dom.pastLifeFactionIcon = byId("past-life-faction-icon");
    dom.pastLifePopularity = byId("past-life-popularity");
    dom.pastLifePopularityText = byId("past-life-popularity-text");
    dom.pastLifeFaction = byId("past-life-faction");
    dom.pastLifeDream = byId("past-life-dream");
    dom.pastLifeOrigin = byId("past-life-origin");
    dom.pastLifeFinalTitle = byId("past-life-final-title");
    dom.pastLifeRunTitles = byId("past-life-run-titles");
    dom.pastLifeDuration = byId("past-life-duration");
    dom.pastLifeEnding = byId("past-life-ending");
    dom.pastLifeFinalZone = byId("past-life-final-zone");
    dom.pastLifeStats = byId("past-life-stats");
    dom.pastLifeStartingVariance = byId("past-life-starting-variance");
    dom.pastLifeAssetsSection = byId("past-life-assets-section");
    dom.pastLifeAssets = byId("past-life-assets");
    dom.pastLifeLogbook = byId("past-life-logbook");
    dom.pastLifeExportArea = byId("past-life-export-area");
    dom.pastLifeExportButton = byId("past-life-export-button");
    dom.pastLifeExportStatus = byId("past-life-export-status");

    dom.settings = byId("settings-content");

    dom.welcomeIdentityModal = byId("welcome-identity-modal");
    dom.welcomeIdentityForm = byId("welcome-identity-form");
    dom.welcomeIdentityError = byId("welcome-identity-error");

    dom.abandonModal = byId("abandon-modal");
    dom.confirmAbandon = byId("confirm-abandon-btn");
    dom.newGameModal = byId("new-game-modal");
    dom.confirmNewGame = byId("confirm-new-game-btn");
    dom.shopPurchaseModal = byId("shop-purchase-modal");
    dom.shopPurchaseModalText = byId("shop-purchase-modal-text");
    dom.confirmShopPurchase = byId("confirm-shop-purchase-btn");
    dom.resetProfileFirstModal = byId("reset-profile-first-modal");
    dom.cancelResetProfileFirst = byId("cancel-reset-profile-first-btn");
    dom.continueResetProfile = byId("continue-reset-profile-btn");
    dom.resetProfileFinalModal = byId("reset-profile-final-modal");
    dom.cancelResetProfileFinal = byId("cancel-reset-profile-final-btn");
    dom.confirmResetProfile = byId("confirm-reset-profile-btn");
  }

  /* ========================================================
     PROFIL
  ======================================================== */

  const LEGACY_REVOLUTIONARY_DREAM_MAP = Object.freeze({
    "overthrow-world-government": "build-underground-network",
    "liberate-the-oppressed": "break-the-chains",
    "reveal-forgotten-history": "reveal-void-century",
    "world-symbol-of-freedom": "found-free-nation",
  });

  function normalizeDreamId(dreamId, factionId) {
    if (!dreamId || factionId !== "revolutionary") return dreamId || null;
    return LEGACY_REVOLUTIONARY_DREAM_MAP[dreamId] || dreamId;
  }

  function createDefaultProfile() {
    return {
      version: CONFIG.version,
      achievements: [],
      titles: [],
      pantheon: [],
      runsSinceLastD: 0,
      berries: 0,
      ownedShopItems: [],
      equippedShopItems: [],
      rewardedAchievementIds: [],
      playerIdentity: { firstName: "", lastName: "" },
      profileCosmetics: {
        ownedBackgrounds: ["classic"],
        selectedBackground: "classic",
        ownsCosmeticD: false,
        showD: false,
      },
      settings: {
        reducedMotion: false,
        confirmAbandon: true,
        textSpeed: "normal",
        volume: 100,
      },
      statistics: {
        startedAdventures: 0,
        abandonedAdventures: 0,
        completedAdventures: 0,
        successfulAdventures: 0,
      },
    };
  }

  function normalizeFirstUnlockedBy(value, pantheon = []) {
    if (!value || typeof value !== "object") return null;
    const matchingEntry = pantheon.find((entry) =>
      entry?.id && entry.id === value.adventureId &&
      (entry.firstName || entry.lastName),
    );
    const characterName = matchingEntry
      ? buildNameWithD(matchingEntry)
      : String(value.characterName || "").trim();
    const faction = String(value.faction || "").trim();
    if (!characterName || !faction) return null;
    return {
      characterName,
      faction,
      adventureId: value.adventureId || null,
      unlockedAt: value.unlockedAt || null,
    };
  }

  function inferFirstUnlockedBy(titleId, pantheon = []) {
    const candidates = pantheon
      .filter((entry) => {
        const titles = [
          ...(entry.runTitles || []),
          entry.finalTitle,
        ].filter(Boolean);
        return titles.some((title) => getDataId(title) === titleId);
      })
      .filter((entry) => entry.name && entry.faction)
      .sort((a, b) =>
        String(a.finishedAt || "").localeCompare(String(b.finishedAt || "")),
      );
    const first = candidates[0];
    return first
      ? {
          characterName: first.name,
          faction: first.faction,
          adventureId: first.id || null,
          unlockedAt: first.finishedAt || null,
        }
      : null;
  }

  function normalizeAchievementRecords(values = [], pantheon = []) {
    const legacyMap =
      window.BLUE_LEGACY_LEGACY_ACHIEVEMENT_ID_MAP || {};
    const records = new Map();

    (Array.isArray(values) ? values : []).forEach((value) => {
      const rawId = getDataId(value);
      const id = legacyMap[rawId] || rawId;
      if (!id || records.has(id)) return;
      const unlockedBy = value && typeof value === "object" && value.unlockedBy
        ? normalizeFirstUnlockedBy(value.unlockedBy, pantheon)
        : null;
      records.set(id, {
        id,
        unlockedAt:
          (value && typeof value === "object" && value.unlockedAt) || null,
        unlockedBy,
      });
    });

    return [...records.values()];
  }

  function normalizeProfile(profile = {}) {
    const defaults = createDefaultProfile();
    const pantheon = Array.isArray(profile.pantheon)
      ? profile.pantheon.map((entry) => {
          if (!entry || typeof entry !== "object") return entry;
          const normalizedEntry = {
            ...entry,
            name: buildNameWithD(entry),
            dream: normalizeDreamId(entry.dream, entry.faction),
            stats: normalizeStats(entry.stats || entry.finalStats || {}),
            finalStats: normalizeStats(entry.finalStats || entry.stats || {}),
            devilFruit: entry.devilFruit ? normalizeDevilFruit(entry.devilFruit) : null,
            crewMembers: Array.isArray(entry.crewMembers)
              ? entry.crewMembers.filter(Boolean).map(normalizeCrewMember)
              : [],
            route: Array.isArray(entry.route) ? entry.route.map(normalizeZone) : [],
            journal: Array.isArray(entry.journal)
              ? entry.journal.map(normalizeHistoricalZoneRecord)
              : [],
            importantEvents: Array.isArray(entry.importantEvents)
              ? entry.importantEvents.map(normalizeHistoricalZoneRecord)
              : [],
            legendaryArcs: normalizeLegendaryArcs(entry.legendaryArcs, { ...entry, isFinished: true }),
          };
          return migrateLegacyCareerFinalTitle(normalizedEntry, entry);
        })
      : [];
    const titles = Array.isArray(profile.titles)
      ? profile.titles.map((titleData) => {
          const title = normalizeTitleData(getDataId(titleData), titleData);
          return {
            ...title,
            firstUnlockedBy:
              normalizeFirstUnlockedBy(titleData?.firstUnlockedBy, pantheon) ||
              inferFirstUnlockedBy(title.id, pantheon),
          };
        })
      : [];
    pantheon.filter(Boolean).forEach((entry) => {
      const titleId = slugify(getDataId(entry.finalTitle));
      if (!CAREER_FINAL_TITLE_IDS.has(titleId) ||
          titles.some((title) => getDataId(title) === titleId)) return;
      const title = normalizeTitleData(titleId, findTitleData(titleId) || entry.finalTitle);
      titles.push({
        ...title,
        firstUnlockedBy: entry.name && entry.faction
          ? {
              characterName: entry.name,
              faction: entry.faction,
              adventureId: entry.id || null,
              unlockedAt: entry.finishedAt || null,
            }
          : null,
      });
    });

    const knownShopIds = new Set(getShopItems().map((item) => item.id));
    const ownedShopItems = uniqueArray(profile.ownedShopItems)
      .filter((id) => knownShopIds.has(id));
    const ownedSet = new Set(ownedShopItems);
    const equippedShopItems = uniqueArray(profile.equippedShopItems)
      .filter((id) => knownShopIds.has(id) && ownedSet.has(id))
      .slice(0, 2);
    const knownBackgrounds = new Set(getProfileCosmetics().filter((item) => item.type === "background").map((item) => item.id));
    const ownedBackgrounds = uniqueArray(profile.profileCosmetics?.ownedBackgrounds || ["classic"])
      .filter((id) => knownBackgrounds.has(id));
    if (!ownedBackgrounds.includes("classic")) ownedBackgrounds.unshift("classic");
    const selectedBackground = ownedBackgrounds.includes(profile.profileCosmetics?.selectedBackground)
      ? profile.profileCosmetics.selectedBackground : "classic";
    const completedKnown = pantheon.filter(Boolean).length;
    const rawStatistics = profile.statistics || {};

    return {
      ...defaults,
      ...profile,
      achievements: normalizeAchievementRecords(profile.achievements, pantheon),
      titles,
      pantheon,
      runsSinceLastD: Math.max(
        0,
        Math.floor(Number(profile.runsSinceLastD) || 0),
      ),
      berries: Math.max(0, Math.floor(Number(profile.berries) || 0)),
      ownedShopItems,
      equippedShopItems,
      rewardedAchievementIds: uniqueArray(profile.rewardedAchievementIds)
        .filter((id) => Boolean(findAchievementData(id))),
      settings: {
        ...defaults.settings,
        ...(profile.settings || {}),
      },
      playerIdentity: {
        firstName: String(profile.playerIdentity?.firstName || "").trim().slice(0, 40),
        lastName: String(profile.playerIdentity?.lastName || "").trim().slice(0, 40),
      },
      profileCosmetics: {
        ownedBackgrounds,
        selectedBackground,
        ownsCosmeticD: profile.profileCosmetics?.ownsCosmeticD === true,
        showD: profile.profileCosmetics?.ownsCosmeticD === true && profile.profileCosmetics?.showD === true,
      },
      statistics: {
        ...defaults.statistics,
        ...rawStatistics,
        startedAdventures: Math.max(completedKnown, Math.floor(Number(rawStatistics.startedAdventures) || 0)),
        abandonedAdventures: Math.max(0, Math.floor(Number(rawStatistics.abandonedAdventures) || 0)),
        completedAdventures: Math.max(completedKnown, Math.floor(Number(rawStatistics.completedAdventures) || 0)),
      },
    };
  }

  function loadProfile() {
    const stored = safeParse(localStorage.getItem(CONFIG.profileKey));

    if (stored) {
      const normalized = normalizeProfile(stored);
      if (grantOutstandingAchievementBerries(normalized)) {
        localStorage.setItem(CONFIG.profileKey, JSON.stringify(normalized));
      }
      return normalized;
    }

    const legacy = findLegacyData(CONFIG.legacyProfileKeys);

    if (legacy) {
      const migrated = normalizeProfile(legacy);
      grantOutstandingAchievementBerries(migrated);
      saveProfile(migrated);
      return migrated;
    }

    return createDefaultProfile();
  }

  function saveProfile(profile) {
    const normalized = normalizeProfile(profile);

    if (state.isResettingProfile) return normalized;

    try {
      localStorage.setItem(CONFIG.profileKey, JSON.stringify(normalized));
    } catch (error) {
      console.error("[Blue Legacy] Sauvegarde du profil impossible.", error);
    }

    return normalized;
  }

  function getProfile() {
    return loadProfile();
  }

  function hasPermanentPlayerIdentity(profile = getProfile()) {
    return Boolean(
      String(profile.playerIdentity?.lastName || "").trim() &&
      String(profile.playerIdentity?.firstName || "").trim()
    );
  }

  function showWelcomeIdentityIfNeeded() {
    if (!dom.welcomeIdentityModal || hasPermanentPlayerIdentity()) return false;
    if (dom.welcomeIdentityError) dom.welcomeIdentityError.textContent = "";
    openDialog(dom.welcomeIdentityModal);
    window.setTimeout(() => dom.welcomeIdentityForm?.elements.lastName?.focus(), 0);
    return true;
  }

  function saveWelcomeIdentity(event) {
    event.preventDefault();
    event.stopPropagation();
    const lastName = String(dom.welcomeIdentityForm?.elements.lastName?.value || "").trim().slice(0, 40);
    const firstName = String(dom.welcomeIdentityForm?.elements.firstName?.value || "").trim().slice(0, 40);
    if (!lastName || !firstName) {
      if (dom.welcomeIdentityError) dom.welcomeIdentityError.textContent = "Le nom et le prénom sont obligatoires.";
      return false;
    }
    const profile = getProfile();
    profile.playerIdentity.lastName = lastName;
    profile.playerIdentity.firstName = firstName;
    saveProfile(profile);
    closeDialog(dom.welcomeIdentityModal);
    updateHomeScreen();
    if (state.screen === SCREEN.STATISTICS) updateStatisticsScreen();
    window.BlueLegacyLeaderboard?.refreshHome();
    return true;
  }

  function getShopItems() {
    return Array.isArray(window.BLUE_LEGACY_SHOP_ITEMS)
      ? window.BLUE_LEGACY_SHOP_ITEMS
      : [];
  }

  function getProfileCosmetics() {
    return Array.isArray(window.BLUE_LEGACY_PROFILE_COSMETICS) ? window.BLUE_LEGACY_PROFILE_COSMETICS : [];
  }

  function findProfileCosmetic(itemId) {
    return getProfileCosmetics().find((item) => item.id === itemId) || null;
  }

  function findShopItem(itemId) {
    return getShopItems().find((item) => item.id === itemId) || null;
  }

  function getAchievementBerryReward(achievement) {
    return Math.max(0, Math.floor(Number(achievement?.berryReward) || 0));
  }

  function grantOutstandingAchievementBerries(profile) {
    if (!profile) return false;
    const claimed = new Set(profile.rewardedAchievementIds || []);
    let changed = false;
    (profile.achievements || []).forEach((record) => {
      const id = getDataId(record);
      if (!id || claimed.has(id)) return;
      const achievement = findAchievementData(id);
      if (!achievement) return;
      profile.berries += getAchievementBerryReward(achievement);
      claimed.add(id);
      changed = true;
    });
    profile.rewardedAchievementIds = [...claimed];
    return changed;
  }

  /* ========================================================
     SAUVEGARDE DE PARTIE
  ======================================================== */

  function hasSavedGame() {
    const save = safeParse(localStorage.getItem(CONFIG.saveKey));
    return Boolean(save?.game || findLegacyData(CONFIG.legacySaveKeys));
  }

  function buildSavePayload() {
    return {
      version: CONFIG.version,
      savedAt: new Date().toISOString(),
      screen: state.screen,
      resumeScreen: state.resumeScreen,
      creationStep: state.creationStep,
      creation: cloneData(state.creation),
      game: cloneData(state.game),
      result: cloneData(state.result),
      selectedPastLifeId: state.selectedPastLifeId,
      returnScreen: state.returnScreen,
    };
  }

  function saveGame() {
    if (!state.game || state.isResettingProfile) {
      return false;
    }

    try {
      localStorage.setItem(CONFIG.saveKey, JSON.stringify(buildSavePayload()));
      updateHomeScreen();
      return true;
    } catch (error) {
      console.error("[Blue Legacy] Sauvegarde impossible.", error);
      return false;
    }
  }

  function loadGame() {
    let payload = safeParse(localStorage.getItem(CONFIG.saveKey));

    if (!payload?.game) {
      const legacy = findLegacyData(CONFIG.legacySaveKeys);

      if (legacy) {
        payload = migrateLegacySave(legacy);
      }
    }

    if (!payload?.game) {
      updateHomeScreen();
      return false;
    }

    state.creationStep = Number.isInteger(payload.creationStep)
      ? payload.creationStep
      : 0;

    state.creation = {
      ...createEmptyCreation(),
      ...(payload.creation || {}),
    };
    state.creation.dream = normalizeDreamId(
      state.creation.dream,
      state.creation.faction,
    );

    const savedGame = { ...payload.game };
    if (
      !savedGame.pendingResult &&
      payload.result &&
      savedGame.currentEvent &&
      (!payload.result.eventId || payload.result.eventId === savedGame.currentEvent.id)
    ) {
      // Anciennes sauvegardes : la slide est restaurée comme déjà appliquée,
      // jamais recalculée.
      savedGame.pendingResult = {
        ...payload.result,
        effectsApplied: true,
        resultConsumed: false,
      };
    }
    state.game = normalizeGame(savedGame);
    // Le résultat persistant du jeu est la source de vérité. Un ancien
    // `payload.result` divergent ne doit jamais afficher une conséquence
    // appartenant à un autre événement.
    state.result = state.game.pendingResult
      ? cloneData(state.game.pendingResult)
      : null;
    state.selectedPastLifeId = payload.selectedPastLifeId || null;
    state.returnScreen = payload.returnScreen || SCREEN.HOME;
    const savedScreen = Object.values(SCREEN).includes(payload.screen)
      ? payload.screen
      : SCREEN.GAME;
    state.resumeScreen = Object.values(SCREEN).includes(payload.resumeScreen)
      ? payload.resumeScreen
      : savedScreen === SCREEN.HOME
        ? inferPlayableScreen(payload)
        : savedScreen;
    state.screen = savedScreen === SCREEN.HOME
      ? state.resumeScreen
      : savedScreen;
    if (state.screen === SCREEN.RESULT && !state.game.pendingResult) {
      state.screen = inferPlayableScreen({ game: state.game, result: null });
      state.resumeScreen = state.screen;
    }

    openScreen(state.screen, { save: false });

    return true;
  }

  function deleteSave() {
    localStorage.removeItem(CONFIG.saveKey);

    CONFIG.legacySaveKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    updateHomeScreen();
  }

  function clearSave() {
    deleteSave();
  }

  function getPreservedProfileSettings() {
    const stored = safeParse(localStorage.getItem(CONFIG.profileKey));
    return {
      ...createDefaultProfile().settings,
      ...(stored?.settings && typeof stored.settings === "object" ? stored.settings : {}),
    };
  }

  function resetPlayerProfile() {
    if (state.isResettingProfile || Date.now() - state.profileResetCompletedAt < 1000) return false;
    state.isResettingProfile = true;
    if (dom.confirmResetProfile) dom.confirmResetProfile.disabled = true;
    const preservedSettings = getPreservedProfileSettings();

    try {
      PLAYER_PROFILE_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      state.game = null;
      state.result = null;
      state.creation = createEmptyCreation();
      state.creationStep = 0;
      state.selectedPastLifeId = null;
      state.returnScreen = SCREEN.HOME;
      state.resumeScreen = SCREEN.GAME;
      state.pendingShopPurchaseId = null;
      state.isResolvingEvent = false;
      state.isContinuingResult = false;
      achievementNotificationQueue.length = 0;
      achievementNotificationActive = false;
      document.querySelectorAll(".achievement-toast").forEach((toast) => toast.remove());
      const freshProfile = { ...createDefaultProfile(), settings: preservedSettings };
      localStorage.setItem(CONFIG.profileKey, JSON.stringify(freshProfile));
      closeDialog(dom.resetProfileFinalModal);
      closeDialog(dom.resetProfileFirstModal);
      openScreen(SCREEN.HOME, { save: false });
      updateHomeScreen();
      if (dom.resetProfileStatus) {
        dom.resetProfileStatus.textContent = "Profil réinitialisé. Une nouvelle aventure peut commencer.";
      }
      state.profileResetCompletedAt = Date.now();
      if (!showWelcomeIdentityIfNeeded()) dom.startAdventure?.focus();
      return true;
    } finally {
      state.isResettingProfile = false;
      window.setTimeout(() => {
        if (dom.confirmResetProfile) dom.confirmResetProfile.disabled = false;
      }, 1000);
    }
  }

  function cancelProfileReset(dialog) {
    closeDialog(dialog);
    dom.resetProfile?.focus();
  }

  function migrateLegacySave(legacy) {
    const character = {
      name: legacy.name || "Aventurier inconnu",
      firstName: legacy.firstName || "",
      lastName: legacy.lastName || "",
      sex: legacy.sex || null,
      faction: legacy.faction || legacy.path || null,
      dream: legacy.dream || null,
      origin: legacy.origin || null,
      hasD: Boolean(legacy.hasD),
      combatStyle: legacy.style || legacy.combatStyle || null,
      traits: legacy.trait ? [legacy.trait] : legacy.traits || [],
      devilFruit: legacy.hasFruit
        ? {
            id: "legacy-fruit",
            name: "Fruit inconnu",
            type: "unknown",
            permanentEffects: {},
            obtainedAtMonth: legacy.month || 1,
          }
        : null,
    };

    return {
      version: CONFIG.version,
      screen: SCREEN.GAME,
      resumeScreen: SCREEN.GAME,
      creationStep: 0,
      creation: createEmptyCreation(),
      result: null,
      selectedPastLifeId: null,
      returnScreen: SCREEN.HOME,
      game: normalizeGame({
        ...legacy,
        character,
        stats: legacy.stats || legacy,
        seenEvents: legacy.seenEvents || legacy.used || legacy.recent || [],
        recentEvents: legacy.recentEvents || legacy.recent || [],
        runTitles: legacy.runTitles || legacy.titles || [],
        journal: legacy.journal || legacy.timeline || [],
      }),
    };
  }

  /* ========================================================
     NAVIGATION
  ======================================================== */

  function showScreen(screenId) {
    if (
      screenId !== SCREEN_IDS[SCREEN.GAME] &&
      screenId !== SCREEN_IDS[SCREEN.RESULT]
    ) {
      updateEventTheme(null);
    }

    dom.screens.forEach((screen) => {
      const active = screen.id === screenId;
      screen.hidden = !active;
      screen.classList.toggle("active", active);
    });

    const credit = document.getElementById("game-credit");
    if (credit) {
      const creditScreens = new Set([
        SCREEN_IDS[SCREEN.HOME],
        SCREEN_IDS[SCREEN.SHOP],
        SCREEN_IDS[SCREEN.STATISTICS],
        SCREEN_IDS[SCREEN.ACHIEVEMENTS],
        SCREEN_IDS[SCREEN.TITLES],
        SCREEN_IDS[SCREEN.PANTHEON],
        SCREEN_IDS[SCREEN.SETTINGS],
      ]);
      const visible = creditScreens.has(screenId);
      credit.hidden = !visible;
      document.body.classList.toggle("has-game-credit", visible);
    }
  }

  function openScreen(screenName, options = {}) {
    if (!SCREEN_IDS[screenName]) {
      screenName = SCREEN.HOME;
    }

    if (options.returnScreen) {
      state.returnScreen = options.returnScreen;
    }

    closeGameMenu();
    state.screen = screenName;
    if (state.game && isPlayableScreen(screenName)) {
      state.resumeScreen = screenName;
    }

    showScreen(SCREEN_IDS[screenName]);
    updateScreen(screenName);

    if (state.game && options.save !== false) {
      saveGame();
    }
  }

  function isPlayableScreen(screenName) {
    return [
      SCREEN.D_REVEAL,
      SCREEN.GAME,
      SCREEN.RESULT,
      SCREEN.LOGBOOK,
      SCREEN.ZONE_TRANSITION,
      SCREEN.REWARD_REVEAL,
    ].includes(
      screenName,
    );
  }

  function inferPlayableScreen(payload = {}) {
    if (payload.game?.pendingLogbookEntry) return SCREEN.LOGBOOK;
    if (payload.result || payload.game?.pendingResult) return SCREEN.RESULT;
    if (payload.game?.pendingRewardReveals?.length) return SCREEN.REWARD_REVEAL;
    if (payload.game?.pendingZoneTransition) return SCREEN.ZONE_TRANSITION;
    if (payload.game?.currentEvent) return SCREEN.GAME;
    return payload.game?.month ? SCREEN.GAME : SCREEN.D_REVEAL;
  }

  function returnToMainMenu() {
    if (!state.game) return false;
    if (isPlayableScreen(state.screen)) state.resumeScreen = state.screen;
    saveGame();
    closeGameMenu();
    state.screen = SCREEN.HOME;
    showScreen(SCREEN_IDS[SCREEN.HOME]);
    updateHomeScreen();
    return true;
  }

  function updateScreen(screenName) {
    const handlers = {
      [SCREEN.HOME]: updateHomeScreen,
      [SCREEN.CREATION]: updateCreationScreen,
      [SCREEN.D_REVEAL]: updateDRevealScreen,
      [SCREEN.GAME]: updateGameScreen,
      [SCREEN.RESULT]: updateResultScreen,
      [SCREEN.LOGBOOK]: updateLogbookScreen,
      [SCREEN.ZONE_TRANSITION]: updateZoneTransitionScreen,
      [SCREEN.REWARD_REVEAL]: updateRewardRevealScreen,
      [SCREEN.ACHIEVEMENTS]: updateAchievementsScreen,
      [SCREEN.SHOP]: updateShopScreen,
      [SCREEN.STATISTICS]: updateStatisticsScreen,
      [SCREEN.LEADERBOARD]: updateLeaderboardScreen,
      [SCREEN.TITLES]: updateTitlesScreen,
      [SCREEN.PANTHEON]: updatePantheonScreen,
      [SCREEN.PAST_LIFE]: updatePastLifeScreen,
      [SCREEN.SETTINGS]: updateSettingsScreen,
    };

    handlers[screenName]?.();
  }

  function updateHomeScreen() {
    const hasSave = hasSavedGame();
    const profile = getProfile();

    if (dom.resumeAdventure) {
      dom.resumeAdventure.hidden = !hasSave;
    }

    if (dom.abandonAdventure) {
      dom.abandonAdventure.hidden = !hasSave;
    }
    if (dom.homeBerryBalance) {
      dom.homeBerryBalance.textContent = `💰 ${formatBerryAmount(profile.berries)} berrys`;
    }
    if (state.screen === SCREEN.HOME) {
      window.BlueLegacyLeaderboard?.refreshHome();
    }
  }

  function updateLeaderboardScreen() {
    window.BlueLegacyLeaderboard?.refreshFull();
  }

  function formatBerryAmount(value) {
    return new Intl.NumberFormat("fr-FR").format(Math.max(0, Math.floor(Number(value) || 0)));
  }

  function createShopItemBadgeHtml(item) {
    return `<span class="shop-equipped-badge" data-rarity="${escapeAttribute(item.rarity)}">
      <span aria-hidden="true">${escapeHtml(item.icon)}</span>${escapeHtml(item.name)}
    </span>`;
  }

  function finiteRecord(values) {
    const valid = values.map(Number).filter(Number.isFinite);
    return valid.length ? Math.max(...valid) : null;
  }

  function calculateProfileStatistics(profile = getProfile()) {
    const runs = (profile.pantheon || []).filter(Boolean);
    const value = (run, key) => Number(run.finalStats?.[key] ?? run.stats?.[key]);
    const coreRecords = Object.fromEntries(["health", "combat", "haki", "intelligence", "charisma"]
      .map((key) => [key, finiteRecord(runs.map((run) => value(run, key)))]));
    const popularity = finiteRecord(runs.map((run) => Number(run.popularityScore ?? value(run, "popularity"))));
    const factionCounts = runs.reduce((counts, run) => {
      const id = getDataId(run.faction); if (FACTION_META[id]) counts[id] = (counts[id] || 0) + 1; return counts;
    }, {});
    const maxFaction = finiteRecord(Object.values(factionCounts)) || 0;
    const favorites = Object.keys(factionCounts).filter((id) => factionCounts[id] === maxFaction);
    const fruitIds = new Set(runs.map((run) => getDataId(run.devilFruit)).filter(Boolean));
    return {
      started: Math.max(runs.length, Number(profile.statistics?.startedAdventures) || 0),
      completed: runs.length,
      abandoned: Math.max(0, Number(profile.statistics?.abandonedAdventures) || 0),
      dreamsCompleted: runs.filter((run) => run.dreamCompleted === true).length,
      exceptionalRuns: runs.filter((run) => Number(run.popularityScore ?? value(run, "popularity")) >= 95).length,
      popularity, coreRecords,
      bestFortune: finiteRecord(runs.map((run) => value(run, "fortune"))),
      bestRenown: finiteRecord(runs.map((run) => value(run, "bounty"))),
      largestCrew: finiteRecord(runs.map((run) => Math.max(Number(value(run, "crew")) || 0, run.crewMembers?.length || 0))),
      mostTitles: finiteRecord(runs.map((run) => run.runTitles?.length || 0)),
      mostCompanions: finiteRecord(runs.map((run) => run.crewMembers?.length || 0)),
      favoriteFaction: favorites.length === 1 ? FACTION_META[favorites[0]].label : "Équilibre",
      fruitsDiscovered: fruitIds.size,
    };
  }

  function formatPlayerIdentity(profileOrIdentity = {}) {
    const identity = profileOrIdentity.playerIdentity || profileOrIdentity;
    const first = String(identity.firstName || "").trim();
    const last = String(identity.lastName || "").trim();
    if (!first && !last) return "Aventurier inconnu";
    const cosmetics = profileOrIdentity.profileCosmetics || {};
    const d = cosmetics.ownsCosmeticD && cosmetics.showD ? "D." : "";
    return [last, d, first].filter(Boolean).join(" ");
  }

  function renderPlayerIdentity(element, profileOrIdentity = {}) {
    if (!element) return;
    const identity = profileOrIdentity.playerIdentity || profileOrIdentity;
    const cosmetics = profileOrIdentity.profileCosmetics || {};
    const first = String(identity.firstName || "").trim();
    const last = String(identity.lastName || "").trim();
    const showD = cosmetics.ownsCosmeticD && cosmetics.showD;
    element.replaceChildren();
    if (!first && !last) {
      element.textContent = "Aventurier inconnu";
      return;
    }
    const parts = [
      { value: last, className: "player-identity-last-name" },
      { value: showD ? "D." : "", className: "player-identity-d" },
      { value: first, className: "player-identity-first-name" },
    ].filter((part) => part.value);
    parts.forEach((part, index) => {
      if (index) element.append(document.createTextNode(" "));
      const span = document.createElement("span");
      span.className = part.className;
      span.textContent = part.value;
      element.append(span);
    });
  }

  function formatProfileIdentity(profile) {
    return formatPlayerIdentity(profile);
  }

  function runProfileStatisticsAudit() {
    const base = createDefaultProfile();
    base.pantheon = [
      { faction: "pirate", popularityScore: 79, dreamCompleted: false, stats: { popularity: 79, health: 82, combat: 50 } },
      { faction: "marine", popularityScore: 92, dreamCompleted: true, stats: { popularity: 92, combat: 83, intelligence: 88 } },
      { faction: "pirate", popularityScore: 97, dreamCompleted: true, stats: { popularity: 97, health: 91, combat: 71, intelligence: 95 } },
    ];
    const result = calculateProfileStatistics(base);
    const checks = {
      completed: result.completed === 3,
      exceptionalRuns: result.exceptionalRuns === 1,
      popularity: result.popularity === 97,
      health: result.coreRecords.health === 91,
      combat: result.coreRecords.combat === 83,
      intelligence: result.coreRecords.intelligence === 95,
    };
    return { pass: Object.values(checks).every(Boolean), checks, result };
  }

  function recordDisplay(value, money = false) {
    return value === null || !Number.isFinite(Number(value)) ? "—" : money ? `${formatBerryAmount(value)} berrys` : String(Math.floor(Number(value)));
  }

  function updateStatisticsScreen() {
    if (!dom.statisticsContent) return;
    const profile = getProfile();
    const summary = calculateProfileStatistics(profile);
    const identityDefined = Boolean(profile.playerIdentity.firstName || profile.playerIdentity.lastName);
    const editing = state.statisticsIdentityEditing || !identityDefined;
    const ownedBackgrounds = getProfileCosmetics().filter((item) => item.type === "background" && profile.profileCosmetics.ownedBackgrounds.includes(item.id));
    const recordCells = [["health", "❤️"], ["combat", "⚔️"], ["haki", "🛡️"], ["intelligence", "🧠"], ["charisma", "✨"]]
      .map(([key, icon]) => `<div class="legend-record"><span aria-hidden="true">${icon}</span><small>${escapeHtml(STATS[key].label)}</small><strong>${recordDisplay(summary.coreRecords[key])}</strong></div>`).join("");
    const identityFormHtml = editing ? `<form class="profile-identity-form" id="profile-identity-form"><label>Nom<input name="lastName" maxlength="40" value="${escapeAttribute(profile.playerIdentity.lastName)}" autocomplete="family-name"></label><label>Prénom<input name="firstName" maxlength="40" value="${escapeAttribute(profile.playerIdentity.firstName)}" autocomplete="given-name"></label><div><button class="button button-primary" data-statistics-save-identity type="button">Enregistrer</button>${identityDefined ? '<button class="button" data-statistics-cancel-identity type="button">Annuler</button>' : ""}</div></form>` : "";
    const editIdentityButtonHtml = editing ? "" : `<button class="statistics-edit-button" data-statistics-edit-identity type="button">Modifier</button>`;
    const backgroundsHtml = state.statisticsAppearanceOpen ? `<div class="background-selector" aria-label="Fonds possédés">${ownedBackgrounds.map((item) => `<button type="button" class="background-choice" data-statistics-background="${escapeAttribute(item.id)}" data-background="${escapeAttribute(item.id)}" aria-pressed="${item.id === profile.profileCosmetics.selectedBackground}"><span>${escapeHtml(item.name)}</span><small>${item.id === profile.profileCosmetics.selectedBackground ? "Actif" : "Sélectionner"}</small></button>`).join("")}</div>` : "";
    const dControl = profile.profileCosmetics.ownsCosmeticD ? `<label class="cosmetic-d-toggle"><input type="checkbox" data-statistics-cosmetic-d ${profile.profileCosmetics.showD ? "checked" : ""}> Afficher le D.</label>` : '<p class="locked-cosmetic">🔒 D. cosmétique · À débloquer dans la Boutique</p>';
    dom.statisticsContent.innerHTML = `<article class="legend-card" data-background="${escapeAttribute(profile.profileCosmetics.selectedBackground)}"><header class="legend-card-header"><div class="legend-card-identity"><p>CARTE DE LÉGENDE</p><h3 id="profile-identity-display"></h3></div><div class="legend-card-header-actions">${editIdentityButtonHtml}<img src="assets/icone.png" alt="Emblème Blue Legacy"></div></header>${identityFormHtml}<p class="legend-popularity">⭐ Record de Popularité : <strong>${recordDisplay(summary.popularity)}${summary.popularity === null ? "" : " / 100"}</strong></p><div class="legend-highlights"><span>🌊 Aventures <strong>${summary.started}</strong></span><span>✨ Rêves accomplis <strong>${summary.dreamsCompleted}</strong></span><span>👑 Runs exceptionnelles <strong>${summary.exceptionalRuns}</strong></span></div><section><h4>Records</h4><div class="legend-records">${recordCells}</div></section><div class="legend-collections"><span>🏆 Succès ${profile.achievements.length}/${getAllAchievements().length}</span><span>🎖️ Titres ${profile.titles.length}/${getAllTitles().length}</span><span>🎒 Objets ${profile.ownedShopItems.length}/${getShopItems().length}</span></div><p class="legend-faction">Voie favorite : <strong>${escapeHtml(summary.favoriteFaction)}</strong></p></article><section class="card-customization"><div><h3>Personnaliser la carte</h3><p>Utilise uniquement les cosmétiques déjà possédés.</p></div><button class="button" data-statistics-toggle-appearance type="button" aria-expanded="${state.statisticsAppearanceOpen}">🎨 Changer le fond</button>${backgroundsHtml}${dControl}</section><section class="detailed-statistics"><h3>Statistiques détaillées</h3><dl><div><dt>Aventures lancées</dt><dd>${summary.started}</dd></div><div><dt>Aventures terminées</dt><dd>${summary.completed}</dd></div><div><dt>Abandons connus</dt><dd>${summary.abandoned}</dd></div><div><dt>Meilleure Fortune</dt><dd>${recordDisplay(summary.bestFortune, true)}</dd></div><div><dt>Record de renommée</dt><dd>${recordDisplay(summary.bestRenown, true)}</dd></div><div><dt>Plus grand équipage</dt><dd>${recordDisplay(summary.largestCrew)}</dd></div><div><dt>Titres maximum dans une run</dt><dd>${recordDisplay(summary.mostTitles)}</dd></div><div><dt>Compagnons maximum</dt><dd>${recordDisplay(summary.mostCompanions)}</dd></div><div><dt>Fruits découverts</dt><dd>${summary.fruitsDiscovered}</dd></div></dl></section>`;
    renderPlayerIdentity(document.getElementById("profile-identity-display"), profile);
  }

  function updateShopScreen() {
    const profile = getProfile();
    const owned = new Set(profile.ownedShopItems);
    const equipped = new Set(profile.equippedShopItems);
    if (dom.shopBerryBalance) dom.shopBerryBalance.textContent = `💰 ${formatBerryAmount(profile.berries)} berrys`;
    if (dom.shopEquippedCount) dom.shopEquippedCount.textContent = `Objets équipés : ${equipped.size} / 2`;
    if (dom.shopCurrentRunNote) dom.shopCurrentRunNote.hidden = !hasSavedGame();
    if (dom.shopEquippedItems) {
      const active = getShopItems().filter((item) => equipped.has(item.id));
      dom.shopEquippedItems.innerHTML = active.length
        ? active.map(createShopItemBadgeHtml).join("")
        : '<p class="shop-empty-equipment">Aucun objet équipé.</p>';
    }
    if (!dom.shopItems) return;
    dom.shopItems.innerHTML = getShopItems().map((item) => {
      const isOwned = owned.has(item.id);
      const isEquipped = equipped.has(item.id);
      const missing = Math.max(0, item.price - profile.berries);
      const status = isEquipped ? "Équipé" : isOwned ? "Possédé" : missing ? "Solde insuffisant" : "Non acheté";
      let action = `<button class="button button-primary" data-shop-buy="${escapeAttribute(item.id)}" type="button">Acheter pour ${formatBerryAmount(item.price)} berrys</button>`;
      if (!isOwned && missing) {
        action = `<button class="button" type="button" disabled>Il manque ${formatBerryAmount(missing)} berrys</button>`;
      } else if (isEquipped) {
        action = `<button class="button" data-shop-unequip="${escapeAttribute(item.id)}" type="button">Retirer</button>`;
      } else if (isOwned) {
        const full = equipped.size >= 2;
        action = `<button class="button button-primary" data-shop-equip="${escapeAttribute(item.id)}" type="button" ${full ? "disabled" : ""}>${full ? "Limite de deux atteinte" : "Équiper"}</button>`;
      }
      return `<article class="shop-item-card" data-rarity="${escapeAttribute(item.rarity)}">
        <header class="shop-item-heading"><span class="shop-item-icon" aria-hidden="true">${escapeHtml(item.icon)}</span><div><span class="shop-item-rarity">${escapeHtml(getRarityLabel(item.rarity))}</span><h3>${escapeHtml(item.name)}</h3></div></header>
        <p>${escapeHtml(item.description)}</p>
        <p class="shop-item-effect"><strong>Effet</strong>${escapeHtml(item.effect)}</p>
        <footer><span class="shop-item-status">${escapeHtml(status)}</span><strong class="shop-item-price">💰 ${formatBerryAmount(item.price)}</strong>${action}</footer>
      </article>`;
    }).join("");
    if (dom.shopCosmetics) {
      dom.shopCosmetics.innerHTML = getProfileCosmetics().map((item) => {
        const isBackground = item.type === "background";
        const isOwned = isBackground ? profile.profileCosmetics.ownedBackgrounds.includes(item.id) : profile.profileCosmetics.ownsCosmeticD;
        const missing = Math.max(0, item.price - profile.berries);
        const preview = isBackground ? `<span class="cosmetic-preview" data-background="${escapeAttribute(item.id)}" aria-hidden="true"></span>` : '<span class="cosmetic-preview cosmetic-d-preview" aria-hidden="true">D.</span>';
        const action = isOwned ? '<span class="shop-cosmetic-owned">Possédé · À utiliser depuis Statistiques</span>' : missing ? `<button class="button" disabled>Il manque ${formatBerryAmount(missing)} berrys</button>` : `<button class="button button-primary" data-cosmetic-buy="${escapeAttribute(item.id)}" type="button">Acheter pour ${formatBerryAmount(item.price)} berrys</button>`;
        return `<article class="shop-item-card cosmetic-shop-card" data-rarity="${escapeAttribute(item.rarity)}"><header class="shop-item-heading">${preview}<div><span class="shop-item-rarity">${escapeHtml(getRarityLabel(item.rarity))}</span><h3>${escapeHtml(item.name)}</h3></div></header><p>${escapeHtml(item.description)}</p><footer><strong class="shop-item-price">${item.price ? `💰 ${formatBerryAmount(item.price)}` : "Gratuit"}</strong>${action}</footer></article>`;
      }).join("");
    }
  }

  function requestShopPurchase(itemId) {
    const item = findShopItem(itemId);
    const profile = getProfile();
    if (!item || profile.ownedShopItems.includes(itemId) || profile.berries < item.price) return false;
    state.pendingShopPurchaseId = itemId;
    if (dom.shopPurchaseModalText) dom.shopPurchaseModalText.textContent = `Acheter ${item.name} pour ${formatBerryAmount(item.price)} berrys ?`;
    openDialog(dom.shopPurchaseModal);
    return true;
  }

  function purchaseProfileCosmetic(itemId) {
    const item = findProfileCosmetic(itemId);
    const profile = getProfile();
    if (!item || item.id === "classic" || profile.berries < item.price) return false;
    const owned = item.type === "background" ? profile.profileCosmetics.ownedBackgrounds.includes(item.id) : profile.profileCosmetics.ownsCosmeticD;
    if (owned) return false;
    profile.berries -= item.price;
    if (item.type === "background") profile.profileCosmetics.ownedBackgrounds.push(item.id);
    else profile.profileCosmetics.ownsCosmeticD = true;
    saveProfile(profile);
    updateShopScreen(); updateHomeScreen();
    return true;
  }

  function purchaseShopItem(itemId = state.pendingShopPurchaseId) {
    const item = findShopItem(itemId);
    const profile = getProfile();
    if (!item || profile.ownedShopItems.includes(itemId) || profile.berries < item.price) return false;
    profile.berries -= item.price;
    profile.ownedShopItems.push(itemId);
    saveProfile(profile);
    checkAchievements(null);
    state.pendingShopPurchaseId = null;
    closeDialog(dom.shopPurchaseModal);
    updateShopScreen();
    updateHomeScreen();
    return true;
  }

  function equipShopItem(itemId) {
    const profile = getProfile();
    if (!findShopItem(itemId) || !profile.ownedShopItems.includes(itemId) || profile.equippedShopItems.includes(itemId) || profile.equippedShopItems.length >= 2) return false;
    profile.equippedShopItems.push(itemId);
    saveProfile(profile);
    updateShopScreen();
    return true;
  }

  function unequipShopItem(itemId) {
    const profile = getProfile();
    if (!profile.equippedShopItems.includes(itemId)) return false;
    profile.equippedShopItems = profile.equippedShopItems.filter((id) => id !== itemId);
    saveProfile(profile);
    updateShopScreen();
    return true;
  }

  /* ========================================================
     CRÉATION
  ======================================================== */

  function createEmptyCreation() {
    return {
      sex: null,
      faction: null,
      dream: null,
      origin: null,
      firstName: null,
      lastName: null,
    };
  }

  function createEmptyNameMemory() {
    return { firstNames: [], lastNames: [], fullNames: [] };
  }

  function startCreation(forceNewGame = false) {
    if (hasSavedGame() && !forceNewGame) {
      openDialog(dom.newGameModal);
      return;
    }

    if (forceNewGame) {
      deleteSave();
    }

    state.creationStep = 0;
    state.creation = createEmptyCreation();
    state.nameMemory = createEmptyNameMemory();
    state.game = null;
    state.result = null;
    state.selectedPastLifeId = null;

    resetCreationCards();
    openScreen(SCREEN.CREATION, { save: false });
    showCreationSlide(0);
  }

  function showCreationSlide(stepIndex) {
    const index = Math.max(
      0,
      Math.min(Number(stepIndex) || 0, CREATION_STEPS.length - 1),
    );

    state.creationStep = index;

    const stepName = CREATION_STEPS[index];
    const slideId = CREATION_SLIDES[stepName];

    dom.slides.forEach((slide) => {
      const active = slide.id === slideId;
      slide.hidden = !active;
      slide.classList.toggle("active", active);
    });

    if (dom.creationStepCurrent) {
      dom.creationStepCurrent.textContent = String(index + 1);
    }

    if (dom.creationStepTotal) {
      dom.creationStepTotal.textContent = String(CREATION_STEPS.length);
    }

    if (dom.creationPrevious) {
      dom.creationPrevious.hidden = index === 0;
    }

    updateCreationScreen();
  }

  function previousCreationStep() {
    if (state.creationStep > 0) {
      showCreationSlide(state.creationStep - 1);
    }
  }

  function selectCreationChoice(type, value, card) {
    if (!["sex", "faction", "dream", "origin"].includes(type)) {
      return;
    }

    if (type === "faction") {
      state.creation.faction = value;
      state.creation.dream = null;
      clearSelectedCards("dream");
      updateDreamGroups();
    } else {
      state.creation[type] = value;
    }

    markChoiceSelected(type, card);

    const nextSteps = {
      sex: 1,
      faction: 2,
      dream: 3,
      origin: 4,
    };

    if (type === "origin" && !state.creation.firstName) {
      generateFullName(false);
    }

    showCreationSlide(nextSteps[type]);
  }

  function markChoiceSelected(type, selectedCard) {
    document
      .querySelectorAll(`[data-choice-type="${type}"]`)
      .forEach((card) => {
        const selected = card === selectedCard;
        card.classList.toggle("selected", selected);

        if (card.hasAttribute("aria-checked")) {
          card.setAttribute("aria-checked", String(selected));
        }
      });
  }

  function clearSelectedCards(type) {
    document
      .querySelectorAll(`[data-choice-type="${type}"]`)
      .forEach((card) => {
        card.classList.remove("selected");

        if (card.hasAttribute("aria-checked")) {
          card.setAttribute("aria-checked", "false");
        }
      });
  }

  function resetCreationCards() {
    document.querySelectorAll(".choice-card").forEach((card) => {
      card.classList.remove("selected");

      if (card.hasAttribute("aria-checked")) {
        card.setAttribute("aria-checked", "false");
      }
    });
  }

  function confirmGeneratedName() {
    if (!state.creation.firstName || !state.creation.lastName) {
      generateFullName(false);
    }

    showCreationSlide(5);
  }

  function createCharacter() {
    const creation = state.creation;

    if (
      !creation.sex ||
      !creation.faction ||
      !creation.dream ||
      !creation.origin
    ) {
      return null;
    }

    if (!creation.firstName || !creation.lastName) {
      generateFullName(false);
    }

    return {
      name: buildNameWithD(creation),
      firstName: creation.firstName,
      lastName: creation.lastName,
      sex: creation.sex,
      faction: creation.faction,
      dream: creation.dream,
      origin: creation.origin,
      hasD: false,
      combatStyle: null,
      traits: [],
      devilFruit: null,
    };
  }

  function updateCreationScreen() {
    updateFactionEffects();
    updateOriginHints();
    updateDreamGroups();
    updateNameSlide();

    if (CREATION_STEPS[state.creationStep] === "summary") {
      updateSummarySlide();
    }
  }

  function updateOriginHints() {
    document
      .querySelectorAll("[data-origin-hint]")
      .forEach((element) => {
        const origin = findGameDataItem(
          ["origins"],
          element.dataset.originHint,
        );

        element.textContent =
          origin?.hint ||
          "Chaque mer façonne différemment celles et ceux qui y grandissent.";
      });
  }

  function updateFactionEffects() {
    document
      .querySelectorAll("[data-faction-effects]")
      .forEach((element) => {
        const faction = findGameDataItem(
          ["factions", "paths"],
          element.dataset.factionEffects,
        );

        element.textContent =
          formatEffectsText(faction?.effects || {}) ||
          "Aucun bonus de départ.";
      });
  }

  function updateDreamGroups() {
    const selectedFaction = state.creation.faction;

    document
      .querySelectorAll("[data-faction-dreams]")
      .forEach((group) => {
        group.hidden =
          group.dataset.factionDreams !== selectedFaction;
      });

    if (!selectedFaction) {
      return;
    }

    const list = document.querySelector(
      `[data-dream-list="${selectedFaction}"]`,
    );

    if (!list) {
      return;
    }

    list.innerHTML = getDreamsForFaction(selectedFaction)
      .map((dream) => {
        const id = getDataId(dream);

        return `
          <button
            class="choice-card dream-card"
            data-choice-type="dream"
            data-choice-value="${escapeAttribute(id)}"
            type="button"
          >
            <span class="choice-title">
              ${escapeHtml(dream.label || dream.name || id)}
            </span>

            <span class="choice-description">
              ${escapeHtml(dream.description || dream.desc || "")}
            </span>

            ${
              dream.ultimate || dream.ultimateTitle
                ? `
                  <span class="ultimate-title">
                    Titre ultime :
                    ${escapeHtml(dream.ultimate || dream.ultimateTitle)}
                  </span>
                `
                : ""
            }
          </button>
        `;
      })
      .join("");
  }

  /* ========================================================
     NOMS
  ======================================================== */

  function normalizeSex(sex) {
    const value = String(sex || "").toLowerCase();

    if (["male", "man", "homme", "masculin"].includes(value)) {
      return "male";
    }

    if (["female", "woman", "femme", "féminin", "feminin"].includes(value)) {
      return "female";
    }

    return "neutral";
  }

  function generateFirstName(update = true) {
    const pool = NAMES[normalizeSex(state.creation.sex)] || NAMES.neutral;
    state.creation.firstName = pickFreshName(pool, state.nameMemory.firstNames) || "Morgan";
    rememberGeneratedName("firstNames", state.creation.firstName, 8);
    rememberCurrentFullName();

    if (update) {
      updateNameSlide();
    }

    return state.creation.firstName;
  }

  function generateLastName(update = true) {
    state.creation.lastName = pickFreshName(NAMES.surnames, state.nameMemory.lastNames) || "Storm";
    rememberGeneratedName("lastNames", state.creation.lastName, 8);
    rememberCurrentFullName();

    if (update) {
      updateNameSlide();
    }

    return state.creation.lastName;
  }

  function generateFullName(update = true) {
    const pool = NAMES[normalizeSex(state.creation.sex)] || NAMES.neutral;
    const recentFullNames = new Set(state.nameMemory.fullNames);
    const firstCandidates = pool.filter((name) => !state.nameMemory.firstNames.includes(name));
    const lastCandidates = NAMES.surnames.filter((name) => !state.nameMemory.lastNames.includes(name));
    const combinations = (firstCandidates.length ? firstCandidates : pool).flatMap((firstName) =>
      (lastCandidates.length ? lastCandidates : NAMES.surnames).map((lastName) => ({
        firstName,
        lastName,
        fullName: buildNameWithD({ firstName, lastName, hasD: false }),
      })),
    );
    const freshCombinations = combinations.filter(({ fullName }) => !recentFullNames.has(fullName));
    const selected = getRandomItem(freshCombinations.length ? freshCombinations : combinations);
    state.creation.firstName = selected?.firstName || "Morgan";
    state.creation.lastName = selected?.lastName || "Storm";
    rememberGeneratedName("firstNames", state.creation.firstName, 8);
    rememberGeneratedName("lastNames", state.creation.lastName, 8);
    rememberCurrentFullName();

    if (update) {
      updateNameSlide();
    }

    return getCreationFullName();
  }

  function pickFreshName(pool, recent = []) {
    const available = pool.filter((name) => !recent.includes(name));
    return getRandomItem(available.length ? available : pool);
  }

  function rememberGeneratedName(memoryKey, value, limit) {
    if (!value) return;
    const history = state.nameMemory[memoryKey];
    state.nameMemory[memoryKey] = [...history.filter((item) => item !== value), value].slice(-limit);
  }

  function rememberCurrentFullName() {
    const fullName = getCreationFullName();
    if (fullName) rememberGeneratedName("fullNames", fullName, 16);
  }

  function generateName(part = "full", update = true) {
    if (["first", "firstName"].includes(part)) {
      return generateFirstName(update);
    }

    if (["last", "lastName", "surname"].includes(part)) {
      return generateLastName(update);
    }

    return generateFullName(update);
  }

  function getCreationFullName() {
    return buildNameWithD(state.creation);
  }

  function updateNameSlide() {
    if (dom.generatedName) {
      const nextName = getCreationFullName() || "Nom généré";
      const hasChanged = dom.generatedName.textContent !== nextName;
      dom.generatedName.textContent = nextName;

      if (hasChanged) {
        dom.generatedName.classList.remove("is-refreshing");
        requestAnimationFrame(() => {
          dom.generatedName?.classList.add("is-refreshing");
        });
      }
    }
  }

  function buildNameWithD(character) {
    if (!character) {
      return "";
    }

    const cleanPart = (value) => String(value ?? "")
      .trim()
      .replace(/\s+/g, " ");
    const removeExistingD = (value) => cleanPart(value)
      .split(" ")
      .filter((part) => part !== "D.")
      .join(" ");
    const firstName = character.hasD
      ? removeExistingD(character.firstName)
      : cleanPart(character.firstName);
    const lastName = character.hasD
      ? removeExistingD(character.lastName)
      : cleanPart(character.lastName);

    if (!firstName && !lastName) {
      return cleanPart(character.name || character.fullName || "Aventurier inconnu");
    }

    const parts = [lastName];

    if (character.hasD && firstName && lastName) {
      parts.push("D.");
    }

    parts.push(firstName);

    return parts.filter(Boolean).join(" ");
  }

  function normalizeRunsSinceLastD(value) {
    return Math.max(0, Math.floor(Number(value) || 0));
  }

  function getWillOfDProbability(runsSinceLastD = 0) {
    const misses = normalizeRunsSinceLastD(runsSinceLastD);

    if (misses >= CONFIG.dGuaranteeAfterMisses) {
      return 1;
    }

    const pitySteps = Math.max(0, misses - CONFIG.dPityStart + 1);
    return Math.min(1, CONFIG.dProbability + pitySteps * CONFIG.dPityStep);
  }

  function rollWillOfD(runsSinceLastD = 0, randomValue = Math.random()) {
    const misses = normalizeRunsSinceLastD(runsSinceLastD);
    const probability = getWillOfDProbability(misses);
    const guaranteed = misses >= CONFIG.dGuaranteeAfterMisses;
    const hasD = guaranteed || Number(randomValue) < probability;

    return {
      hasD,
      probability,
      guaranteed,
      previousMisses: misses,
      nextRunsSinceLastD: hasD ? 0 : misses + 1,
    };
  }

  function determineWillOfDForNewRun(profile = getProfile()) {
    const result = rollWillOfD(profile?.runsSinceLastD, Math.random());
    profile.runsSinceLastD = result.nextRunsSinceLastD;
    saveProfile(profile);
    return result;
  }

  /* ========================================================
     STATISTIQUES
  ======================================================== */

  function createDefaultStats() {
    return {
      health: 55,
      combat: 20,
      // Une garde générique existe dès le départ, contrairement à l'ancien
      // Haki narratif qui justifiait une valeur presque nulle.
      haki: 18,
      intelligence: 20,
      charisma: 20,
      bounty: 0,
      fortune: 0,
      crew: 0,
      popularity: POPULARITY_MIN,
    };
  }

  function normalizeStatKey(key) {
    return STAT_ALIASES[key] || key;
  }

  function hasAnyOwnProperty(object, keys) {
    return keys.some((key) => Object.hasOwn(object, key));
  }

  function usesLegacyPopularityScale(stats = {}) {
    return (
      hasAnyOwnProperty(stats, LEGACY_MORALE_STAT_IDS) ||
      hasAnyOwnProperty(stats, LEGACY_SHIP_STAT_IDS) ||
      Number(stats.popularity ?? stats.score) > 100
    );
  }

  function normalizeLegacyPopularity(value) {
    return Math.round(((value - 20) / 180) * 99 + 1);
  }

  function normalizeStats(stats = {}) {
    const normalized = createDefaultStats();
    const hasLegacyMorale = hasAnyOwnProperty(stats, LEGACY_MORALE_STAT_IDS);
    const legacyPopularity = Number(stats.popularity ?? stats.score);
    const shouldConvertPopularity = usesLegacyPopularityScale(stats);

    Object.entries(stats).forEach(([rawKey, rawValue]) => {
      if (
        LEGACY_SHIP_STAT_IDS.includes(rawKey) ||
        LEGACY_MORALE_STAT_IDS.includes(rawKey)
      ) return;
      const key = normalizeStatKey(rawKey);
      const value = Number(rawValue);

      if (STATS[key] && Number.isFinite(value)) {
        normalized[key] = value;
      }
    });

    if (hasLegacyMorale && !Object.hasOwn(stats, "charisma")) {
      normalized.charisma = Number(stats.morale ?? stats.moral) || 20;
    }

    if (!Object.hasOwn(stats, "intelligence")) {
      normalized.intelligence = 20;
    }

    if (shouldConvertPopularity && Number.isFinite(legacyPopularity)) {
      normalized.popularity = normalizeLegacyPopularity(legacyPopularity);
    }

    return clampStats(normalized);
  }

  function normalizeHistoricalStatChanges(changes = {}, legacyPopularityScale = false) {
    const normalized = {};
    Object.entries(changes || {}).forEach(([rawKey, rawValue]) => {
      if (LEGACY_SHIP_STAT_IDS.includes(rawKey)) return;
      const key = LEGACY_MORALE_STAT_IDS.includes(rawKey)
        ? "charisma"
        : LEGACY_POPULARITY_STAT_IDS.includes(rawKey)
          ? "popularity"
          : normalizeStatKey(rawKey);
      if (!STATS[key] || !Number.isFinite(Number(rawValue))) return;
      // L'ancienne échelle 20–200 ne doit être convertie qu'au premier chargement.
      const scale = key === "popularity" && legacyPopularityScale ? 0.5 : 1;
      normalized[key] =
        (Number(normalized[key]) || 0) + Number(rawValue) * scale;
    });
    return normalized;
  }

  function getActiveTitleGainModifier(game, statId) {
    if (!game || !statId) return 0;
    return Math.min(0.2, (game.runTitles || []).reduce((total, titleData) => {
      const title = normalizeTitleData(getDataId(titleData), titleData);
      const passive = title.effects?.passive;
      return total + (
        !title.finalTitle && passive?.type === "statGainModifier" && passive.stat === statId
          ? Math.max(0, Number(passive.value) || 0)
          : 0
      );
    }, 0));
  }

  function scaleCoreStatGain(currentValue, rawGain, context = {}) {
    if (rawGain <= 0 || context.ignoreDiminishingReturns) return rawGain;
    const stage = Math.max(1, Math.min(6, Number(context.routeStage) || 1));
    const progressionMultiplier = context.source === "boss"
      ? 1.35
      : context.source === "event"
        ? stage <= 2 ? 1.2 : stage <= 4 ? 1.45 : 1.7
        : 1;
    const distributionMultiplier = {
      health: 1.05,
      combat: 1.15,
      haki: 1.10,
      intelligence: 1,
      charisma: 1,
    }[context.statId] || 1;
    const focusValues = Object.values(context.game?.statGrowthFocus || {}).map(Number);
    const focusCount = Number(context.game?.statGrowthFocus?.[context.statId]) || 0;
    const focusMultiplier = focusCount >= 3 && focusCount >= Math.max(0, ...focusValues)
      ? 1.3
      : 1;
    const passiveMultiplier = context.ignoreTitlePassives
      ? 1
      : 1 + getActiveTitleGainModifier(context.game, context.statId);
    let scaled = rawGain * progressionMultiplier * distributionMultiplier * focusMultiplier * passiveMultiplier;
    if (currentValue >= 90) scaled *= context.source === "decisive" ? 0.75 : 0.5;
    else if (currentValue >= 75) scaled *= context.source === "decisive" ? 0.9 : 0.72;
    else if (currentValue >= 50) scaled *= 0.9;
    const maximumGain = context.source === "boss" || context.major ? 18 : 12;
    return Math.min(maximumGain, Math.max(1, Math.round(scaled)));
  }

  function applyStatChanges(changes = {}, target = state.game?.stats, options = {}) {
    if (!target) {
      return {};
    }

    const applied = {};

    Object.entries(changes).forEach(([rawKey, rawValue]) => {
      const key = normalizeStatKey(rawKey);
      let value = Number(rawValue);

      if (!STATS[key] || !Number.isFinite(value)) {
        return;
      }

      const game = options.game || state.game;
      if (key === "bounty" && value > 0 && target === game?.stats) {
        // Échelle publique 0.9.3 : les gains narratifs deviennent perceptibles
        // sans amplifier les pertes, la Fortune ou la monnaie permanente.
        if (options.source === "decisive") value = Math.round(value * 1.5);
        else if (options.source === "event") value = Math.round(value * 2.5);
      }
      if (
        value > 0 &&
        CORE_STAT_IDS.includes(key) &&
        key !== "popularity" &&
        ["event", "boss"].includes(options.source) &&
        game
      ) {
        game.statGrowthFocus ||= {};
        game.statGrowthFocus[key] = (Number(game.statGrowthFocus[key]) || 0) + 1;
      }
      if (value > 0 && CORE_STAT_IDS.includes(key) && key !== "popularity") {
        value = scaleCoreStatGain(Number(target[key]) || 0, value, {
          ...options,
          game,
          statId: key,
          routeStage: options.routeStage || Number(getCurrentZone(game)?.routeStage) || 1,
        });
      }

      if (key === "popularity" && target === game?.stats && game) {
        game.popularityModifiers =
          (Number(game.popularityModifiers) || 0) + value;
      } else {
        target[key] = (Number(target[key]) || 0) + value;
      }
      if (key === "crew" && value > 0 && target === game?.stats && game) {
        game.flags.crewHasBeenRecruited = true;
      }
      applied[key] = (applied[key] || 0) + value;
    });

    clampStats(target);
    const activeGame = options.game || state.game;
    if (target === activeGame?.stats) {
      activeGame.crewMembers = Array.isArray(activeGame.crewMembers) ? activeGame.crewMembers : [];
      while (activeGame.crewMembers.length > Number(target.crew || 0)) {
        activeGame.crewMembers.pop();
      }
      refreshPopularityScore(activeGame);
    }

    return applied;
  }

  function clampStats(stats) {
    Object.entries(STATS).forEach(([key, definition]) => {
      let value = Number(stats[key]);

      if (!Number.isFinite(value)) {
        value = 0;
      }

      if (Number.isFinite(definition.min)) {
        value = Math.max(definition.min, value);
      }

      if (Number.isFinite(definition.max)) {
        value = Math.min(definition.max, value);
      }

      if (["bounty", "fortune", "crew"].includes(key)) {
        value = Math.round(value);
      }

      stats[key] = value;
    });

    delete stats.reputation;

    return stats;
  }

  function checkRunEndingConditions(game = state.game) {
    if (!game) return null;

    if (Number(game.stats?.health) <= CORE_STAT_MIN) {
      return {
        type: "death",
        destiny: "Tes blessures ont eu raison de ton voyage.",
        title: "Destin brisé",
        success: false,
      };
    }

    if (
      Number(game.stats?.crew) <= 0 &&
      game.flags?.crewHasBeenRecruited
    ) {
      return {
        type: "defeat",
        destiny:
          "Les pertes et les départs ont dispersé ton équipage. Sans personne pour manœuvrer, le voyage s’arrête.",
        title: "Équipage dispersé",
        success: false,
      };
    }

    if ((Number(game.flags?.criticalFailures) || 0) >= 6) {
      return {
        type: "defeat",
        destiny:
          "Les blessures, les avaries et les pertes accumulées rendent toute nouvelle traversée impossible.",
        title: "Voyage brisé",
        success: false,
      };
    }

    return null;
  }

  function getStatsSnapshot(stats = state.game?.stats) {
    return Object.fromEntries(
      Object.keys(STATS).map((key) => [key, Number(stats?.[key]) || 0]),
    );
  }

  function getStatsDifference(before = {}, after = {}) {
    const difference = {};

    Object.keys(STATS).forEach((key) => {
      const delta =
        (Number(after[key]) || 0) -
        (Number(before[key]) || 0);

      if (delta !== 0) {
        difference[key] = delta;
      }
    });

    return difference;
  }

  function clampCareerScore(value) {
    return Math.max(POPULARITY_MIN, Math.min(POPULARITY_MAX, Math.round(value)));
  }

  function getCareerTitleNames(source = {}) {
    return uniqueArray([
      source.finalTitle?.name || source.finalTitle,
      ...(source.runTitles || []).map((title) => title?.name || title?.label || title),
    ].filter(Boolean));
  }

  function getMajorCareerStatus(source = {}) {
    const titles = getCareerTitleNames(source);
    const joined = titles.join(" ").toLowerCase();
    const statuses = [
      ["roi des pirates", "Roi des Pirates"],
      ["amiral en chef", "Amiral en chef"],
      ["empereur des mers", "Empereur des mers"],
      ["héros de la marine", "Héros de la Marine"],
      ["vice-amiral", "Vice-amiral"],
      ["amiral", "Amiral"],
      ["chef de l’armée révolutionnaire", "Chef de l’Armée révolutionnaire"],
      ["chef de l'armée révolutionnaire", "Chef de l’Armée révolutionnaire"],
      ["libérateur", "Libérateur"],
      ["plus grand chasseur de primes", "Plus grand chasseur de primes"],
    ];
    return statuses.find(([needle]) => joined.includes(needle))?.[1] || null;
  }

  function calculatePopularityScore(source = state.game) {
    if (!source) return POPULARITY_MIN;
    return calculateCareerPopularityV12(source);
  }

  function boundedContribution(value, maximum, points) {
    return Math.min(points, Math.max(0, Number(value) || 0) / maximum * points);
  }

  function calculateProgressionScore(source) {
    const reachedZones = Math.max(
      Number(source.currentZoneIndex) || 0,
      (source.visitedZoneIds?.length || 1) - 1,
    );
    return boundedContribution(source.month, CONFIG.maxMonths, 12) +
      boundedContribution(reachedZones, 5, 6);
  }

  function calculateCareerStatsScore(source) {
    const stats = source.stats || {};
    const oriented = ["combat", "haki", "intelligence", "charisma"]
      .map((id) => Math.max(1, Number(stats[id]) || 1))
      .sort((a, b) => b - a);
    const remainingAverage = (oriented[2] + oriented[3]) / 2;
    const curved = (value, points) => Math.sqrt(Math.max(0, Math.min(100, value)) / 100) * points;
    return curved(oriented[0], 10) + curved(oriented[1], 8) +
      curved(remainingAverage, 7) + curved(Number(stats.health) || 1, 5);
  }

  function calculateFactionRenownScore(source) {
    const renown = Math.max(0, Number(source.stats?.bounty) || 0);
    const faction = source.character?.faction || source.faction;
    const scale = faction === "pirate" ? 50000 : 20000;
    // Toutes les factions partagent l'échelle technique ; la courbe logarithmique
    // empêche les très grandes primes d'écraser l'Autorité ou la Dangerosité.
    return Math.min(10, Math.log10(1 + renown / scale) * 3.1);
  }

  function calculateResourcesScore(source) {
    const fortune = Math.min(4, Math.log10(1 + Math.max(0, Number(source.stats?.fortune) || 0) / 3000) * 1.55);
    const members = source.crewMembers || [];
    const roles = new Set(members.map((member) => member.role).filter(Boolean)).size;
    return fortune + boundedContribution(source.stats?.crew, 8, 4) + boundedContribution(roles, 5, 2);
  }

  function calculateCollectionScore(source) {
    const rarityPoints = { common: 0.5, uncommon: 0.8, rare: 1.2, epic: 1.8, legendary: 2.4, mythic: 3 };
    const titles = Math.min(5, (source.runTitles || []).reduce((sum, title) =>
      sum + (rarityPoints[normalizeRarity(title.careerScoreRarity || title.rarity)] || 0.5), 0));
    const fruit = source.character?.devilFruit || source.devilFruit ? 2 : 0;
    const encounters = Math.min(1, (source.crewMembers?.length || 0) * 0.25);
    return titles + fruit + encounters;
  }

  function calculateNarrativeScore(source) {
    const events = source.importantEvents || [];
    const positive = (event) => ["success", "exceptional_success"].includes(event.outcomeTier);
    const decisive = events.filter((event) => event.eventType === "decisive" && positive(event)).length;
    const risks = events.filter((event) => event.eventType === "risk" && positive(event)).length;
    const callbacks = events.filter((event) => event.tags?.includes("callback")).length;
    return boundedContribution(decisive, 3, 5) +
      boundedContribution(risks, 4, 2) +
      boundedContribution(source.flags?.dreamProgress, 18, 2) +
      boundedContribution(callbacks, 3, 1);
  }

  function calculateEndingScore(source) {
    const ending = source.ending || source;
    const completed = Number(source.month) >= CONFIG.maxMonths;
    const interrupted = ["death", "defeat", "capture"].includes(ending.type || ending.endingType);
    return (completed ? 4 : 0) + (ending.success ? 2 : 0) +
      (ending.dreamCompleted ? 8 : 0) - (interrupted ? 6 : 0);
  }

  function calculateCareerPopularityV12(source) {
    return calculateCareerPopularityBreakdown(source).score;
  }

  function calculateCareerPopularityBreakdown(source) {
    const subscores = {
      progression: calculateProgressionScore(source),
      careerStats: calculateCareerStatsScore(source),
      factionRenown: calculateFactionRenownScore(source),
      resources: calculateResourcesScore(source),
      collection: calculateCollectionScore(source),
      narrative: calculateNarrativeScore(source),
      ending: calculateEndingScore(source),
      directModifiers: Math.max(-3, Math.min(3, (Number(source.popularityModifiers) || 0) / 10)),
    };
    const rawCareerScore = Object.values(subscores).reduce((sum, value) => sum + value, 0);
    // Les plafonds empêchent le double comptage ; ce coefficient convertit leur
    // somme conservatrice sur l'échelle joueur 1–100 calibrée par simulations.
    const calibratedScore = rawCareerScore * 1.33;
    const prestigeCompressed = calibratedScore <= 90
      ? calibratedScore
      : 90 + (calibratedScore - 90) * 0.20;
    return {
      subscores,
      rawCareerScore,
      calibratedScore,
      preCapScore: prestigeCompressed,
      capLoss: Math.max(0, prestigeCompressed - POPULARITY_MAX),
      score: clampCareerScore(prestigeCompressed),
    };
  }

  /* Ancien calcul conservé uniquement comme documentation de migration. */
  function calculateLegacyPopularityScore(source = state.game) {
    if (!source) return POPULARITY_MIN;
    const stats = source.stats || {};
    const faction = source.character?.faction || source.faction || "pirate";
    const cap = (value, maximum, points) =>
      Math.min(points, Math.max(0, Number(value) || 0) / maximum * points);
    const money = (value, scale, points) =>
      Math.min(points, Math.log10(1 + Math.max(0, Number(value) || 0) / scale) * points / 2);

    let score = POPULARITY_MIN;
    score += cap(source.month, CONFIG.maxMonths, 15);
    score += cap(Math.max(Number(source.currentZoneIndex) || 0, (source.visitedZoneIds?.length || 1) - 1), 5, 10);
    const coreCareerStats = ["combat", "haki", "intelligence", "charisma"]
      .map((statId) => Number(stats[statId]) || CORE_STAT_MIN).sort((a, b) => b - a);
    const [best = 1, second = 1, third = 1, fourth = 1] = coreCareerStats;
    score += cap(best, 100, 10) + cap(second, 100, 4) + cap((third + fourth) / 2, 100, 3);
    score += cap(stats.health, 100, 2);
    score += cap(stats.crew, 8, faction === "pirate" ? 3 : 2);
    score += money(stats.bounty, 150000, 5) + money(stats.fortune, 15000, 2);

    const titles = (source.runTitles || []).map((title) =>
      normalizeTitleData(getDataId(title), title),
    );
    const titleRarityPoints = {
      common: 1,
      uncommon: 2,
      rare: 4,
      epic: 7,
      legendary: 10,
      mythic: 14,
    };
    score += Math.min(8, titles.reduce((sum, title) =>
      sum + (Number(title.effects?.popularity) || titleRarityPoints[title.rarity] || 1), 0));
    const majorStatus = getMajorCareerStatus(source);
    if (majorStatus) {
      score += /Roi des Pirates|Amiral en chef|Empereur des mers|Chef de l’Armée|Plus grand chasseur/.test(majorStatus)
        ? 5
        : 3;
    }

    score += Math.min(5, (Number(source.flags?.dreamProgress) || 0) * 0.5);
    score += Math.min(4, (source.importantEvents?.length || 0) * 0.5);
    score += Math.min(
      2,
      (Number(source.achievementProgress?.dangerEventsSurvived) || 0) * 2,
    );
    score += Math.min(
      2,
      (Number(source.achievementProgress?.callbacksResolved) || 0),
    );
    score += Object.entries(CAREER_FLAG_SCORES).reduce(
      (sum, [flag, value]) => sum + (source.flags?.[flag] ? value : 0), 0,
    );
    score += (Number(source.popularityModifiers) || 0) / 5;

    const ending = source.ending || source;
    if (ending.dreamCompleted) score += 5;
    if (ending.success) score += 2;
    if (Number(source.month) >= CONFIG.maxMonths) score += 8;
    if (["death", "defeat", "capture"].includes(ending.type || ending.endingType)) score -= 7;
    score -= 7;
    if (faction === "pirate") score += 3;
    const importantCount = source.importantEvents?.length || 0;
    if (
      best >= 85 && second >= 55 && importantCount >= 3 &&
      titles.length >= 4
    ) {
      score += 3;
    }
    if (
      best >= 95 && second >= 75 && importantCount >= 5 &&
      titles.length >= 5 && ending.dreamCompleted
    ) {
      score += 12;
    }
    if (
      best >= 99 && second >= 88 && importantCount >= 6 &&
      titles.length >= 6 && ending.dreamCompleted
    ) {
      score += 8;
    }
    return clampCareerScore(score);
  }

  function refreshPopularityScore(game = state.game) {
    if (!game?.stats) return POPULARITY_MIN;
    const breakdown = calculateCareerPopularityBreakdown(game);
    game.stats.popularity = breakdown.score;
    game.popularityScore = game.stats.popularity;
    game.popularityBeforeCap = breakdown.preCapScore;
    game.popularityBreakdown = breakdown.subscores;
    game.popularityText = getPopularityCareerText(game);
    return game.stats.popularity;
  }

  const POPULARITY_CAREER_TEXTS = Object.freeze({
    pirate: ["Un pirate de passage dont peu de ports se souviennent.", "Un petit capitaine qui commence à attirer les regards.", "Un pirate reconnu dans plusieurs mers.", "Un capitaine redouté dont les exploits ne passent plus inaperçus.", "Une figure montante de la piraterie.", "Un grand pirate dont les exploits voyagent au-delà des quatre mers cardinales.", "Une légende pirate qui ébranle les puissances établies.", "Un prétendant sérieux au sommet des mers.", "Une légende vivante redoutée dans le monde entier.", "Un nom entré dans l’Histoire de la piraterie."],
    marine: ["Un soldat discret parmi les rangs de la Marine.", "Un officier prometteur remarqué par ses supérieurs.", "Un officier respecté dans plusieurs bases.", "Un commandant reconnu pour ses missions.", "Un haut gradé dont la justice commence à faire autorité.", "Une grande figure de la Marine au service du peuple.", "Un représentant redoutable de la justice.", "L’un des plus grands défenseurs des mers.", "Une figure légendaire de la Marine.", "Un symbole absolu de la justice à travers le monde."],
    "bounty-hunter": ["Un chasseur vivant de quelques contrats locaux.", "Un pisteur dont les tavernes commencent à retenir le nom.", "Un professionnel reconnu dans plusieurs ports.", "Un chasseur capable de captures majeures.", "Une référence du métier que les pirates surveillent.", "Une terreur des équipages recherchés.", "Un maître de la chasse aux criminels.", "Un nom qui fait abandonner les fugitifs.", "Une légende de la chasse aux primes.", "Le chasseur dont le nom suffit à faire fuir les pirates les plus dangereux."],
    revolutionary: ["Un militant clandestin encore inconnu du Gouvernement mondial.", "Un agent de cellule digne de confiance.", "Un libérateur local dont les actes inspirent les opprimés.", "Une figure reconnue de la résistance.", "Un organisateur dont l’influence traverse les quatre mers cardinales.", "Un commandant révolutionnaire suivi par plusieurs peuples.", "Un grand visage de la lutte contre l’oppression.", "Un symbole de liberté que le Gouvernement ne peut ignorer.", "Une légende vivante de la Révolution.", "L’un des grands visages mondiaux de la liberté."],
  });

  const REVOLUTIONARY_ULTIMATE_CAREER_TEXTS = Object.freeze({
    "Briseur de chaînes":
      "Une figure révolutionnaire dont les victoires ont fait tomber les réseaux d’esclavage.",
    "Porteur de la vérité":
      "Une figure révolutionnaire dont les révélations ont ébranlé le monde.",
    "Architecte de la Révolution":
      "Le stratège d’un réseau révolutionnaire étendu jusque dans les mers les plus lointaines.",
    "Fondateur du peuple libre":
      "Le fondateur d’une nation libre qui résiste durablement au Gouvernement mondial.",
  });

  function getPopularityCareerText(source = state.game) {
    if (!source) return "";
    const revolutionaryUltimate = getCareerTitleNames(source)
      .find((title) => REVOLUTIONARY_ULTIMATE_CAREER_TEXTS[title]);
    if (revolutionaryUltimate) {
      return REVOLUTIONARY_ULTIMATE_CAREER_TEXTS[revolutionaryUltimate];
    }
    const status = getMajorCareerStatus(source);
    const endingType = source.ending?.type || source.endingType;
    if (status) {
      const tragic = ["death", "defeat", "capture"].includes(endingType);
      return tragic ? `${status}, dont l’ascension s’est achevée brutalement.` : `${status}, un statut gravé dans l’Histoire.`;
    }
    const faction = source.character?.faction || source.faction || "pirate";
    const score = clampCareerScore(source.popularityScore ?? source.stats?.popularity ?? calculatePopularityScore(source));
    const index = Math.min(9, Math.max(0, Math.ceil(score / 10) - 1));
    return (POPULARITY_CAREER_TEXTS[faction] || POPULARITY_CAREER_TEXTS.pirate)[index];
  }

  function createLogbookStatsHtml(stats = {}, changes = {}, source = state.game) {
    const rows = Object.keys(STATS).map((key) => {
      const delta = Number(changes[key]) || 0;
      const tone = delta > 0 ? "positive" : delta < 0 ? "negative" : "neutral";
      return `<div class="logbook-stat-row ${tone}"><span class="logbook-stat-label">${escapeHtml(getStatLabel(key, source))}</span><strong class="logbook-stat-value">${escapeHtml(formatStatValue(key, stats[key]))}</strong><span class="logbook-stat-delta">(${delta === 0 ? "0" : escapeHtml(formatStatDelta(key, delta))})</span></div>`;
    }).join("");
    return `${rows}<p class="popularity-career-text">${escapeHtml(getPopularityCareerText(source))}</p>`;
  }

  function getStatDefinition(key, source = state.game) {
    const normalizedKey = normalizeStatKey(key);
    if (normalizedKey === "bounty") {
      const faction = source?.character?.faction || source?.faction;
      return { ...STATS.bounty, ...getFactionRenownMeta(faction) };
    }
    return STATS[normalizedKey] || {
      label: key,
      icon: "•",
      min: 0,
    };
  }

  function getStatLabel(key, source = state.game) {
    const stat = getStatDefinition(key, source);
    return `${stat.icon} ${stat.label}`;
  }

  function formatStatValue(key, value) {
    const stat = getStatDefinition(key);

    return stat.money
      ? formatMoney(value)
      : String(Math.round(Number(value) || 0));
  }

  function formatStatDelta(key, value) {
    const number = Number(value) || 0;
    return `${number > 0 ? "+" : ""}${formatStatValue(key, number)}`;
  }

  function getInitialStats(character, equippedShopItems = getProfile().equippedShopItems) {
    const stats = createDefaultStats();

    const faction = findGameDataItem(
      ["factions", "paths"],
      character.faction,
    );

    const origin = findGameDataItem(
      ["origins"],
      character.origin,
    );

    applyStatChanges(faction?.effects || {}, stats);
    applyStatChanges(origin?.effects || {}, stats);
    applyStatChanges(DREAM_INITIAL_EFFECTS[character.dream] || {}, stats);
    if (character.hasD) {
      applyStatChanges({
        health: CONFIG.dInitialStatBonus,
        combat: CONFIG.dInitialStatBonus,
        haki: CONFIG.dInitialStatBonus,
        intelligence: CONFIG.dInitialStatBonus,
        charisma: CONFIG.dInitialStatBonus,
      }, stats);
    }
    uniqueArray(equippedShopItems).forEach((itemId) => {
      const item = findShopItem(itemId);
      if (item?.initialEffects) applyStatChanges(item.initialEffects, stats);
    });

    return clampStats(stats);
  }

  function createNeutralStartingStatVariance() {
    return Object.fromEntries(STARTING_STAT_VARIANCE_IDS.map((id) => [id, 0]));
  }

  function normalizeStartingStatVariance(value = {}) {
    return Object.fromEntries(STARTING_STAT_VARIANCE_IDS.map((id) => {
      const raw = id === "haki" ? (value?.haki ?? value?.defense) : value?.[id];
      const number = Number(raw);
      return [id, Number.isFinite(number) ? Math.max(-3, Math.min(3, Math.trunc(number))) : 0];
    }));
  }

  function rollStartingStatVariance(random = Math.random) {
    return Object.fromEntries(STARTING_STAT_VARIANCE_IDS.map((id) => {
      const roll = Math.max(0, Math.min(6, Math.floor(Number(random()) * 7)));
      return [id, roll - 3];
    }));
  }

  function applyStartingStatVariance(game, variance) {
    if (!game?.stats || game.startingStatVarianceRolled) return false;
    const normalized = normalizeStartingStatVariance(variance);
    STARTING_STAT_VARIANCE_IDS.forEach((id) => {
      game.stats[id] = (Number(game.stats[id]) || 0) + normalized[id];
    });
    clampStats(game.stats);
    game.startingStatVariance = normalized;
    game.startingStatVarianceRolled = true;
    return true;
  }

  function createStartingStatVarianceHtml(variance = {}) {
    const normalized = normalizeStartingStatVariance(variance);
    return STARTING_STAT_VARIANCE_IDS.map((id) => {
      const value = normalized[id];
      const tone = value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
      return `<span class="starting-variance-chip ${tone}"><span>${escapeHtml(getStatLabel(id))}</span><strong>${value > 0 ? "+" : ""}${value}</strong></span>`;
    }).join("");
  }

  function createStatsHtml(stats = {}, source = state.game) {
    return Object.keys(STATS)
      .map(
        (key) => `
          <article class="stat-card">
            <span class="stat-label">
              ${escapeHtml(getStatLabel(key, source))}
            </span>

            <strong class="stat-value">
              ${escapeHtml(formatStatValue(key, stats[key]))}
            </strong>
          </article>
        `,
      )
      .join("");
  }

  function createPastLifeStatsHtml(stats = {}, source = null) {
    return Object.keys(STATS)
      .map((key) => {
        const stat = getStatDefinition(key, source);
        return `
          <article class="stat-card">
            <span class="stat-label">
              <span aria-hidden="true">${escapeHtml(stat.icon)}</span>
              ${escapeHtml(stat.label)}
            </span>
            <strong class="stat-value">
              ${escapeHtml(formatStatValue(key, stats[key]))}
            </strong>
          </article>
        `;
      })
      .join("");
  }

  function createStatChangesHtml(changes = {}) {
    const entries = Object.entries(changes);

    if (entries.length === 0) {
      return renderEmptyState("Aucune statistique n’a changé.", {
        icon: "📊",
      });
    }

    return entries
      .map(
        ([key, value]) => `
          <div class="stat-change ${value >= 0 ? "positive" : "negative"}">
            <span>${escapeHtml(getStatLabel(key))}</span>
            <strong>${escapeHtml(formatStatDelta(key, value))}</strong>
          </div>
        `,
      )
      .join("");
  }

  function formatEffectsText(effects = {}) {
    return Object.entries(effects)
      .map(([rawKey, value]) => {
        const key = normalizeStatKey(rawKey);

        if (!STATS[key]) {
          return "";
        }

        return `${getStatLabel(key)} ${formatStatDelta(key, value)}`;
      })
      .filter(Boolean)
      .join(" • ");
  }

  function updateSummarySlide() {
    const character = createCharacter();

    if (!character) {
      return;
    }

    const faction = findGameDataItem(
      ["factions", "paths"],
      character.faction,
    );

    const dream = findDreamData(
      character.dream,
      character.faction,
    );

    const origin = findGameDataItem(
      ["origins"],
      character.origin,
    );

    if (dom.summaryName) {
      dom.summaryName.textContent = character.name;
    }

    if (dom.summarySex) {
      dom.summarySex.textContent =
        normalizeSex(character.sex) === "female"
          ? "Femme"
          : "Homme";
    }

    if (dom.summaryFaction) {
      dom.summaryFaction.textContent =
        faction?.label || faction?.name || character.faction;
    }

    if (dom.summaryDream) {
      dom.summaryDream.textContent =
        dream?.label || dream?.name || character.dream;
    }

    if (dom.summaryOrigin) {
      dom.summaryOrigin.textContent =
        origin?.label || origin?.name || character.origin;
    }

    if (dom.summaryStats) {
      dom.summaryStats.innerHTML = createStatsHtml(
        getInitialStats(character),
        { character },
      );
    }
  }

  /* ========================================================
     ÉTAT DE PARTIE
  ======================================================== */

  const LEGENDARY_ARC_STATUS = Object.freeze([
    "unassessed", "selected", "in-progress", "succeeded", "failed",
    "completed-no-title", "not-selected",
  ]);

  function normalizeLegendaryArcState(value = {}, defaults = {}) {
    return {
      ...defaults,
      ...(value && typeof value === "object" ? value : {}),
      status: LEGENDARY_ARC_STATUS.includes(value?.status)
        ? value.status : defaults.status || "unassessed",
      step: Math.max(0, Math.min(3, Math.floor(Number(value?.step) || 0))),
      roll: Number.isFinite(Number(value?.roll)) ? Number(value.roll) : null,
      chance: Number.isFinite(Number(value?.chance)) ? Number(value.chance) : null,
      titleId: value?.titleId || null,
      conclusion: value?.conclusion && typeof value.conclusion === "object"
        ? { ...value.conclusion }
        : null,
      conclusionPending: value?.conclusionPending === true,
      conclusionShown: value?.conclusionShown === true,
      routeResumed: value?.routeResumed === true,
    };
  }

  function normalizeLegendaryArcs(value = {}, game = {}) {
    const finished = Boolean(game.isFinished || game.ending);
    const month = Number(game.month) || 1;
    const marineford = normalizeLegendaryArcState(value?.marineford, {
        status: finished ? "not-selected" : "unassessed",
        emperorId: null,
      });
    const marinefordWasEvaluatedAfterParadise = value?.marineford?.evaluatedAfterParadise === true ||
      Number(value?.marineford?.evaluatedAtMonth) >= 13;
    if (!finished && marineford.status === "not-selected" && !marinefordWasEvaluatedAfterParadise) {
      marineford.status = "unassessed";
      marineford.roll = null;
      marineford.chance = null;
      marineford.quality = null;
      marineford.qualityBand = null;
    }
    return {
      talent: normalizeLegendaryArcState(value?.talent, {
        status: finished || month >= 13 ? "not-selected" : "unassessed",
        emperorId: null,
      }),
      marineford,
      emperor: normalizeLegendaryArcState(value?.emperor, {
        status: finished || game.bossProgress?.completedTiers?.includes?.(3)
          ? "not-selected" : "unassessed",
        emperorId: null,
      }),
    };
  }

  function createDefaultGameState(character) {
    const activeShopItems = character
      ? cloneData(getProfile().equippedShopItems)
      : [];
    const initialStats = character
      ? getInitialStats(character, activeShopItems)
      : createDefaultStats();

    return {
      version: CONFIG.version,
      id: createUniqueId("adventure"),
      startedAt: new Date().toISOString(),
      character,
      activeShopItems,
      shopInitialBonusesApplied: Boolean(character),
      startingStatVariance: createNeutralStartingStatVariance(),
      startingStatVarianceRolled: false,
      shopEffects: {
        strawHatTriggered: false,
        strawHatConsumed: false,
      },
      completionBerriesGranted: 0,
      stats: cloneData(initialStats),
      month: 1,
      actionsThisMonth: CONFIG.actionsPerMonth,
      currentAction: 0,
      currentEvent: null,
      currentEventId: null,
      currentChoiceIndex: null,
      pendingResult: null,
      resolutionSequence: 0,
      appliedResolutionIds: [],
      consumedResolutionIds: [],
      route: [],
      currentZoneIndex: 0,
      specialZoneId: null,
      specialZoneRouteIndex: null,
      visitedZoneIds: [],
      seenEvents: [],
      seenWorldNewsIds: [],
      recentEvents: [],
      flags: {},
      rewards: [],
      permanentEffects: [],
      crewMembers: [],
      runTitles: [],
      appliedTitleEffects: [],
      statGrowthFocus: {},
      runAchievements: [],
      achievementProgress: {
        dangerEventsSurvived: 0,
        rareEventsResolved: 0,
        callbacksResolved: 0,
        highStakesEventsResolved: 0,
        noReturnChoices: 0,
        exceptionalOutcomes: 0,
        actionSuccesses: 0,
        socialSuccesses: 0,
        maxStats: {},
      },
      journal: [],
      periodEvents: [],
      periodStartStats: cloneData(initialStats),
      importantEvents: [],
      popularityModifiers: Math.max(
        0,
        (Number(initialStats.popularity) || POPULARITY_MIN) - POPULARITY_MIN,
      ),
      popularityScore: POPULARITY_MIN,
      popularityText: "",
      lastLogbookMonth: 0,
      pendingLogbookEntry: null,
      pendingZoneTransition: null,
      pendingRewardReveals: [],
      legendaryArcs: {
        talent: { status: "unassessed", step: 0, roll: null, chance: null, titleId: null },
        marineford: { status: "unassessed", step: 0, roll: null, chance: null, titleId: null },
        emperor: { status: "unassessed", step: 0, roll: null, chance: null, emperorId: null, titleId: null },
      },
      bossProgress: {
        completedTiers: [],
        selectedBossIds: {},
        activeBossId: null,
        finalOutcome: null,
      },
      completedLogbookPeriods: [],
      ending: null,
      isFinished: false,
    };
  }

  function normalizeGame(game = {}) {
    const rawCharacter = game.character || {};
    const faction =
      rawCharacter.faction ||
      rawCharacter.path ||
      game.faction ||
      game.path ||
      null;

    const character = {
      name: rawCharacter.name || game.name || "Aventurier inconnu",
      firstName: rawCharacter.firstName || game.firstName || "",
      lastName: rawCharacter.lastName || game.lastName || "",
      sex: rawCharacter.sex || game.sex || null,
      faction,
      dream: normalizeDreamId(
        rawCharacter.dream || game.dream || null,
        faction,
      ),
      origin: normalizeOriginId(
        rawCharacter.origin || game.origin || null,
      ),
      hasD: Boolean(rawCharacter.hasD ?? game.hasD),
      combatStyle:
        rawCharacter.combatStyle ||
        game.combatStyle ||
        game.style ||
        null,
      traits: uniqueArray(
        rawCharacter.traits ||
        game.traits ||
        (game.trait ? [game.trait] : []),
      ),
      devilFruit:
        rawCharacter.devilFruit ||
        game.devilFruit ||
        null,
    };

    character.name = buildNameWithD(character);

    const base = createDefaultGameState(character);

    const normalized = {
      ...base,
      ...game,
      character,
      stats: normalizeStats(game.stats || game),
      route: Array.isArray(game.route)
        ? game.route.map(normalizeZone)
        : [],
      visitedZoneIds: uniqueArray(game.visitedZoneIds || []),
      seenEvents: uniqueArray(
        game.seenEvents ||
        game.used ||
        [],
      ),
      seenWorldNewsIds: uniqueArray(game.seenWorldNewsIds || []),
      recentEvents: uniqueArray(
        game.recentEvents ||
        game.recent ||
        [],
      ),
      flags: { ...(game.flags || {}) },
      crewMembers: Array.isArray(game.crewMembers)
        ? game.crewMembers.filter(Boolean).map(normalizeCrewMember)
        : [],
      rewards: Array.isArray(game.rewards) ? game.rewards : [],
      permanentEffects: Array.isArray(game.permanentEffects)
        ? game.permanentEffects
        : [],
      runTitles: Array.isArray(game.runTitles)
        ? game.runTitles.map((title) => normalizeTitleData(getDataId(title), title))
        : Array.isArray(game.titles)
          ? game.titles.map((title) => normalizeTitleData(getDataId(title), title))
          : [],
      appliedTitleEffects: uniqueArray(game.appliedTitleEffects || []),
      statGrowthFocus: { ...(game.statGrowthFocus || {}) },
      runAchievements: Array.isArray(game.runAchievements)
        ? game.runAchievements
        : [],
      achievementProgress: {
        dangerEventsSurvived:
          Number(game.achievementProgress?.dangerEventsSurvived) || 0,
        rareEventsResolved:
          Number(game.achievementProgress?.rareEventsResolved) || 0,
        callbacksResolved:
          Number(game.achievementProgress?.callbacksResolved) || 0,
        highStakesEventsResolved:
          Number(game.achievementProgress?.highStakesEventsResolved) || 0,
        noReturnChoices:
          Number(game.achievementProgress?.noReturnChoices) || 0,
        exceptionalOutcomes:
          Number(game.achievementProgress?.exceptionalOutcomes) || 0,
        actionSuccesses:
          Number(game.achievementProgress?.actionSuccesses) || 0,
        socialSuccesses:
          Number(game.achievementProgress?.socialSuccesses) || 0,
        maxStats: {
          ...(game.achievementProgress?.maxStats || {}),
        },
      },
      journal: Array.isArray(game.journal)
        ? game.journal
        : Array.isArray(game.timeline)
          ? game.timeline
          : [],
      periodEvents: Array.isArray(game.periodEvents)
        ? game.periodEvents
        : [],
      importantEvents: Array.isArray(game.importantEvents)
        ? game.importantEvents
        : [],
      completedLogbookPeriods: Array.isArray(
        game.completedLogbookPeriods,
      )
        ? game.completedLogbookPeriods
        : [],
      pendingZoneTransition:
        game.pendingZoneTransition &&
        typeof game.pendingZoneTransition === "object"
          ? { ...game.pendingZoneTransition }
          : null,
      pendingRewardReveals: Array.isArray(game.pendingRewardReveals)
        ? game.pendingRewardReveals
            .filter((reward) => reward && typeof reward === "object")
            .map((reward) => ({ ...reward }))
        : [],
      legendaryArcs: normalizeLegendaryArcs(game.legendaryArcs, game),
      resolutionSequence: Math.max(0, Math.floor(Number(game.resolutionSequence) || 0)),
      appliedResolutionIds: uniqueArray(game.appliedResolutionIds || []).slice(-100),
      consumedResolutionIds: uniqueArray(game.consumedResolutionIds || []).slice(-100),
      bossProgress: normalizeBossProgress(
        game.bossProgress,
        getZoneIndexForMonth(game.month),
        game.month,
        game.version,
      ),
      popularityModifiers: 0,
      activeShopItems: Array.isArray(game.activeShopItems)
        ? uniqueArray(game.activeShopItems).filter((id) => Boolean(findShopItem(id))).slice(0, 2)
        : [],
      shopInitialBonusesApplied: game.shopInitialBonusesApplied !== false,
      startingStatVariance: normalizeStartingStatVariance(game.startingStatVariance),
      startingStatVarianceRolled: game.startingStatVarianceRolled === true,
      shopEffects: {
        strawHatTriggered: Boolean(game.shopEffects?.strawHatTriggered),
        strawHatConsumed: Boolean(game.shopEffects?.strawHatConsumed),
      },
      completionBerriesGranted: Math.max(0, Math.floor(Number(game.completionBerriesGranted) || 0)),
    };

    const legacyScale = usesLegacyPopularityScale(game.stats || game);
    normalized.popularityModifiers = Number.isFinite(Number(game.popularityModifiers))
      ? Number(game.popularityModifiers) / (legacyScale ? 2 : 1)
      : Math.max(
          0,
          Number(normalized.stats.popularity) - POPULARITY_MIN,
        );

    normalized.periodStartStats = normalizeStats(
      game.periodStartStats || normalized.stats,
    );
    normalized.character.devilFruit = normalized.character.devilFruit
      ? normalizeDevilFruit(normalized.character.devilFruit)
      : null;
    normalized.flags.fruitSurpriseTriggered = Boolean(
      normalized.flags.fruitSurpriseTriggered || normalized.character.devilFruit,
    );
    normalized.flags.lastRecruitmentMonth = Number(normalized.flags.lastRecruitmentMonth) || 0;
    normalized.stats.crew = Math.max(
      Number(normalized.stats.crew) || 0,
      normalized.crewMembers.length,
    );
    if (normalized.pendingResult && typeof normalized.pendingResult === "object") {
      const legacyResolutionId = [
        "legacy-resolution",
        normalized.id || "adventure",
        normalized.pendingResult.eventId || normalized.currentEventId || "event",
        normalized.pendingResult.choiceId || normalized.currentChoiceIndex || "choice",
        normalized.month || 1,
        normalized.currentAction || 0,
      ].join(":");
      normalized.pendingResult = {
        ...normalized.pendingResult,
        resolutionId: normalized.pendingResult.resolutionId || legacyResolutionId,
        effectsApplied: true,
        resultConsumed: false,
      };
      if (!normalized.appliedResolutionIds.includes(normalized.pendingResult.resolutionId)) {
        normalized.appliedResolutionIds.push(normalized.pendingResult.resolutionId);
      }
      normalized.pendingRewardReveals = normalized.pendingRewardReveals.map((reward) => ({
        ...reward,
        sourceResolutionId: reward.sourceResolutionId || normalized.pendingResult.resolutionId,
        eventId: reward.eventId || normalized.pendingResult.eventId || null,
      }));
    }
    if (normalized.pendingZoneTransition?.reason === "boss-event") {
      normalized.pendingZoneTransition = null;
    }

    OBSOLETE_STAT_IDS.forEach((statId) => {
      delete normalized[statId];
      delete normalized.stats[statId];
    });

    repairGameRoute(normalized);
    normalized.runTitles.forEach((title) => {
      if (normalized.isFinished) {
        if (!normalized.appliedTitleEffects.includes(title.id)) {
          normalized.appliedTitleEffects.push(title.id);
        }
      } else {
        applyTitleImmediateEffect(title, normalized);
      }
    });
    if (normalized.currentEvent?.id && !normalized.pendingResult) {
      const catalogEvent = getAllEvents().find(
        (event) => event.id === normalized.currentEvent.id,
      );
      if (catalogEvent && isSpecialZoneEvent(catalogEvent)) {
        normalized.currentEvent = localizeSpecialZoneEvent(catalogEvent, normalized);
        normalized.currentEventId = catalogEvent.id;
      } else if (catalogEvent) {
        // Une sauvegarde ancienne reprend toujours la définition canonique
        // actuelle : aucun choix générique autrefois injecté ne peut réapparaître.
        normalized.currentEvent = cloneData(catalogEvent);
        normalized.currentEventId = catalogEvent.id;
      } else if (normalized.currentEvent.tags?.includes("legendary-arc")) {
        const legendaryEvent = getLegendaryArcEvents().find((event) => event.id === normalized.currentEvent.id);
        if (legendaryEvent) {
          normalized.currentEvent = localizeLegendaryArcEvent(legendaryEvent, normalized);
          normalized.currentEventId = legendaryEvent.id;
        }
      }
    }
    normalized.journal = normalized.journal.map((entry) => {
      const migrated = {
        ...normalizeHistoricalZoneRecord(entry),
        events: Array.isArray(entry.events)
          ? entry.events.map(normalizeHistoricalZoneRecord)
          : [],
        importantEvents: Array.isArray(entry.importantEvents)
          ? entry.importantEvents.map(normalizeHistoricalZoneRecord)
          : [],
        statChanges: normalizeHistoricalStatChanges(entry.statChanges, legacyScale),
        statsAfter: normalizeStats(entry.statsAfter || normalized.stats),
        gainedTitles: Array.isArray(entry.gainedTitles)
          ? entry.gainedTitles
          : [],
        visitedLocations: Array.isArray(entry.visitedLocations)
          ? entry.visitedLocations
          : getLogbookVisitedLocations(entry.events || [], entry.zoneName),
      };
      migrated.bigNews = normalizeStoredBigNews(entry.bigNews);
      if (!migrated.bigNews.length) {
        migrated.bigNews = buildLegacyBigNews(migrated, normalized);
      }
      migrated.highlights = Array.isArray(entry.highlights) && entry.highlights.length
        ? entry.highlights.slice(0, 3)
        : buildLogbookHighlights(migrated);
      migrated.narrative = entry.narrative ||
        buildLogbookNarrative(migrated, normalized);
      return migrated;
    });
    normalized.periodEvents = normalized.periodEvents.map(normalizeHistoricalZoneRecord);
    normalized.importantEvents = normalized.importantEvents.map(normalizeHistoricalZoneRecord);
    // Une ancienne run conserve ses étapes décisives sans devoir rejouer les
    // nouvelles scènes de Haki. Aucun Titre de Haki n'est accordé rétroactivement.
    if (normalized.bossProgress.completedTiers.includes(1)) {
      normalized.flags.completedDecisiveStage1 = true;
    }
    if (normalized.bossProgress.completedTiers.includes(2)) {
      normalized.flags.completedDecisiveStage2 = true;
    }
    // Migration prudente : l'origine du Haki des Rois n'est déduite que d'un
    // enregistrement explicite du premier décisif. La simple présence du Titre
    // est ambiguë, puisqu'il peut avoir été obtenu au deuxième décisif.
    if (!["observation", "armament", "conquerors", "none"].includes(
      normalized.flags.firstDecisiveHakiType,
    )) {
      const history = [...normalized.periodEvents, ...normalized.importantEvents];
      const firstDecisiveRecord = history.find((record) =>
        String(record?.eventId || record?.id || "").startsWith("haki-awakening-"));
      const historicalTitleIds = (firstDecisiveRecord?.rewards || [])
        .filter((reward) => reward?.type === "title")
        .map((reward) => getDataId(reward.data || reward.title || reward));
      const recordedType = firstDecisiveRecord?.flagChanges?.firstDecisiveHakiType;
      if (["observation", "armament", "conquerors", "none"].includes(recordedType)) {
        normalized.flags.firstDecisiveHakiType = recordedType;
      } else if (historicalTitleIds.includes("haki-des-rois")) {
        normalized.flags.firstDecisiveHakiType = "conquerors";
      } else if (historicalTitleIds.includes("haki-observation")) {
        normalized.flags.firstDecisiveHakiType = "observation";
      } else if (historicalTitleIds.includes("haki-armement")) {
        normalized.flags.firstDecisiveHakiType = "armament";
      } else if (normalized.flags.completedDecisiveStage1) {
        normalized.flags.firstDecisiveHakiType = "none";
      }
    }
    if (normalized.flags.completedDecisiveStage1 &&
        !["observation", "armament", "conquerors"].includes(
          normalized.flags.firstDecisiveHakiType,
        )) {
      normalized.flags.firstDecisiveHakiType = "none";
    }
    // Le résultat historique explicite est l'unique autorité. Un ancien
    // booléen incohérent ne peut plus transformer Armement/Observation en Rois.
    normalized.flags.conquerorsHakiAwakenedAtFirstDecisive =
      normalized.flags.firstDecisiveHakiType === "conquerors";
    if (normalized.flags.completedDecisiveStage1 &&
        !normalized.flags.completedDecisiveStage2) {
      normalized.flags.secondDecisiveHakiBranch =
        normalized.flags.firstDecisiveHakiType === "conquerors"
          ? "mastery"
          : "base-conquerors";
    }
    if (normalized.flags.secondDecisiveHakiBranch === "awakening") {
      normalized.flags.secondDecisiveHakiBranch = "base-conquerors";
    }
    // Une correction automatique n'est sûre que si la sauvegarde prouve à la
    // fois l'origine non souveraine et l'application antérieure des deux
    // niveaux. Le bonus de base reste acquis ; seul le petit supplément est
    // retiré, sans réappliquer aucun effet.
    const masteryId = "maitrise-haki-des-rois-plus";
    const kingsId = "haki-des-rois";
    const safelyBuggedActiveRun =
      !normalized.isFinished && !normalized.finishedAt &&
      !normalized.endingType && !normalized.ending &&
      normalized.flags.completedDecisiveStage2 === true &&
      ["observation", "armament", "none"].includes(normalized.flags.firstDecisiveHakiType) &&
      normalized.runTitles.some((title) => getDataId(title) === masteryId) &&
      normalized.appliedTitleEffects.includes(kingsId) &&
      normalized.appliedTitleEffects.includes(masteryId);
    if (safelyBuggedActiveRun) {
      const mastery = findTitleData(masteryId);
      Object.entries(mastery?.effects?.immediate || {}).forEach(([stat, value]) => {
        if (Number.isFinite(Number(normalized.stats?.[stat]))) {
          normalized.stats[stat] = Number(normalized.stats[stat]) - Number(value || 0);
        }
      });
      normalized.runTitles = normalized.runTitles.filter((title) => getDataId(title) !== masteryId);
      if (!normalized.runTitles.some((title) => getDataId(title) === kingsId)) {
        normalized.runTitles.push(normalizeTitleData(kingsId, findTitleData(kingsId)));
      }
      normalized.appliedTitleEffects = normalized.appliedTitleEffects.filter((id) => id !== masteryId);
      normalized.flags.masteredHakiKings = false;
      normalized.flags.correctedInvalidHakiMastery = true;
      normalized.stats = normalizeStats(normalized.stats);
    }
    // Le niveau supérieur remplace seulement l'affichage actif du niveau de
    // base ; appliedTitleEffects garde les deux identifiants pour empêcher
    // toute réapplication au chargement.
    if (normalized.runTitles.some((title) => getDataId(title) === "maitrise-haki-des-rois-plus")) {
      normalized.runTitles = normalized.runTitles.filter(
        (title) => getDataId(title) !== "haki-des-rois",
      );
    }
    refreshPopularityScore(normalized);

    return normalized;
  }

  function normalizeBossProgress(progress, currentZoneIndex = 0, month = 1, version = "") {
    const legacySave = version !== CONFIG.version;
    const storedTiers = (Array.isArray(progress?.completedTiers) ? progress.completedTiers : [])
      .map(Number)
      .filter(Number.isFinite);
    const usedTwelveStageCalendar = version === "1.2.0" || storedTiers.some((tier) => tier > 3);
    const migratedStoredTiers = legacySave
      ? uniqueArray(storedTiers.map((tier) => usedTwelveStageCalendar ? Math.ceil(tier / 4) : tier))
      : storedTiers;
    const legacyCompleted = legacySave
      ? Array.from({ length: Math.max(0, Math.min(3, Math.floor((Number(month) - 1) / 8))) }, (_, index) => index + 1)
      : [];
    return {
      completedTiers: uniqueArray([
        ...migratedStoredTiers,
        ...legacyCompleted,
      ]).map(Number).filter((tier) => tier >= 1 && tier <= 3),
      selectedBossIds:
        progress?.selectedBossIds && typeof progress.selectedBossIds === "object"
          ? { ...progress.selectedBossIds }
          : {},
      activeBossId: progress?.activeBossId || null,
      finalOutcome:
        progress?.finalOutcome && typeof progress.finalOutcome === "object"
          ? { ...progress.finalOutcome }
          : null,
    };
  }

  function validateCharacterCreation() {
    if (state.game?.flags?.dRollCompleted) {
      return false;
    }

    const character = createCharacter();

    if (!character) {
      return false;
    }

    const dRoll = determineWillOfDForNewRun();
    character.hasD = dRoll.hasD;
    character.name = buildNameWithD(character);

    state.game = createDefaultGameState(character);
    applyStartingStatVariance(state.game, rollStartingStatVariance());
    state.game.flags.dRollCompleted = true;
    state.game.route = generateRoute(character);
    synchronizeRouteMetadata(state.game);
    state.game.currentZoneIndex = 0;
    state.game.visitedZoneIds = state.game.route[0]?.id
      ? [state.game.route[0].id]
      : [];
    state.game.periodStartStats = getStatsSnapshot(state.game.stats);
    state.result = null;

    checkAchievements(state.game);
    saveGame();
    openScreen(SCREEN.D_REVEAL);

    return true;
  }

  function updateDRevealScreen() {
    const character = state.game?.character;

    if (!character) {
      return;
    }

    if (dom.standardDeparture) {
      dom.standardDeparture.hidden = character.hasD;
    }

    if (dom.willOfD) {
      dom.willOfD.hidden = !character.hasD;
    }

    if (dom.standardDepartureText) {
      dom.standardDepartureText.textContent =
        `${character.name} prend la mer, prêt à écrire sa propre légende.`;
    }

    if (dom.dRevealName) {
      dom.dRevealName.textContent = character.name;
    }
    if (dom.startingStatVariance && dom.startingStatVarianceList) {
      dom.startingStatVariance.hidden = !state.game.startingStatVarianceRolled;
      dom.startingStatVarianceList.innerHTML = createStartingStatVarianceHtml(
        state.game.startingStatVariance,
      );
    }
  }

  function startAdventure() {
    if (!state.game) {
      return false;
    }

    if (!state.game.profileStartCounted) {
      const profile = getProfile();
      profile.statistics.startedAdventures = Math.max(profile.pantheon.length, Number(profile.statistics.startedAdventures) || 0) + 1;
      state.game.profileStartCounted = true;
      saveProfile(profile);
      saveGame();
    }

    if (!state.game.route.length) {
      state.game.route = generateRoute(state.game.character);
      synchronizeRouteMetadata(state.game);
    }

    if (!state.game.visitedZoneIds.length && state.game.route[0]?.id) {
      state.game.visitedZoneIds.push(state.game.route[0].id);
    }

    const firstZone = state.game.route[0];
    if (!firstZone) {
      return false;
    }

    return openZoneTransition(firstZone, 0, "adventure-start");
  }

  function continueAfterDReveal() {
    return startAdventure();
  }  /* ========================================================
     ZONES ET ROUTE
  ======================================================== */

  function getZoneCatalog() {
    const source =
      window.SEA_OF_LEGENDS_ZONES ||
      window.GAME_DATA?.zones;

    if (Array.isArray(source)) {
      return source.map(normalizeZone);
    }

    return getDefaultZones();
  }

  function getDefaultZones() {
    return [
      {
        id: "east-blue",
        name: "East Blue",
        type: "sea",
        canStart: true,
        tags: ["starting", "blue-sea"],
      },
      {
        id: "north-blue",
        name: "North Blue",
        type: "sea",
        canStart: true,
        tags: ["starting", "blue-sea", "cold"],
      },
      {
        id: "south-blue",
        name: "South Blue",
        type: "sea",
        canStart: true,
        tags: ["starting", "blue-sea", "warm"],
      },
      {
        id: "west-blue",
        name: "West Blue",
        type: "sea",
        canStart: true,
        tags: ["starting", "blue-sea", "dangerous"],
      },
      {
        id: "grand-line",
        name: "Paradise",
        type: "sea",
        canStart: true,
        tags: ["starting", "grand-line"],
      },
      {
        id: "reverse-mountain",
        name: "Reverse Mountain",
        type: "passage",
        tags: ["grand-line"],
      },
      {
        id: "whiskey-peak",
        name: "Whiskey Peak",
        type: "island",
        tags: ["grand-line", "bounty-hunters"],
      },
      {
        id: "little-garden",
        name: "Little Garden",
        type: "island",
        tags: ["grand-line", "wild", "ancient"],
      },
      {
        id: "drum",
        name: "Royaume de Drum",
        type: "kingdom",
        tags: ["grand-line", "snow", "medical"],
      },
      {
        id: "alabasta",
        name: "Alabasta",
        type: "kingdom",
        tags: ["grand-line", "desert", "war"],
      },
      {
        id: "jaya",
        name: "Jaya",
        type: "island",
        tags: ["grand-line", "pirates"],
      },
      {
        id: "water-seven",
        name: "Water Seven",
        type: "city",
        tags: ["grand-line", "shipwrights"],
      },
      {
        id: "thriller-bark",
        name: "Thriller Bark",
        type: "island",
        tags: ["grand-line", "supernatural"],
      },
      {
        id: "sabaody",
        name: "Archipel Sabaody",
        type: "archipelago",
        tags: ["grand-line", "world-government"],
      },
      {
        id: "fishman-island",
        name: "Île des Hommes-Poissons",
        type: "island",
        tags: ["underwater", "new-world-passage"],
      },
      {
        id: "punk-hazard",
        name: "Punk Hazard",
        type: "island",
        tags: ["new-world", "laboratory", "danger"],
      },
      {
        id: "dressrosa",
        name: "Dressrosa",
        type: "kingdom",
        tags: ["new-world"],
      },
      {
        id: "zou",
        name: "Zou",
        type: "moving-island",
        tags: ["new-world", "minks"],
      },
      {
        id: "whole-cake",
        name: "Whole Cake",
        type: "archipelago",
        tags: ["new-world", "emperor"],
      },
      {
        id: "wano",
        name: "Pays de Wa",
        type: "country",
        tags: ["new-world", "samurai"],
      },
      {
        id: "elbaf",
        name: "Elbaf",
        type: "kingdom",
        tags: ["new-world", "giants"],
      },
    ].map(normalizeZone);
  }

  function normalizeZone(zone, index = 0) {
    const id =
      zone?.id ||
      slugify(zone?.name || zone?.label || `zone-${index + 1}`);

    return {
      id,
      name: getVisibleZoneName(zone?.name || zone?.label || id, id),
      type: zone?.type || "island",
      factions: uniqueArray(zone?.factions || zone?.paths || []),
      tags: uniqueArray(zone?.tags || []),
      originIds: uniqueArray(zone?.originIds || zone?.origins || []),
      canStart: Boolean(
        zone?.canStart ||
        zone?.starting ||
        zone?.isOrigin,
      ),
      weight: Math.max(0, Number(zone?.weight) || 1),
      duration: Math.max(
        1,
        Number(zone?.duration) || CONFIG.logbookInterval,
      ),
      icon: zone?.icon || "🗺️",
      transitionText:
        zone?.transitionText ||
        "Une nouvelle étape commence.",
      theme: {
        primary: zone?.theme?.primary || "#176B87",
        secondary: zone?.theme?.secondary || "#8ED6F2",
        accent: zone?.theme?.accent || "#F2C94C",
        text: zone?.theme?.text || "#12344A",
      },
      special: Boolean(
        zone?.special ||
        zone?.isSpecial ||
        zone?.tags?.includes("special"),
      ),
      routeIndex: Number.isInteger(zone?.routeIndex)
        ? zone.routeIndex
        : null,
      routeStage: Number.isFinite(Number(zone?.routeStage))
        ? Number(zone.routeStage)
        : null,
      routeDifficulty: Number.isFinite(Number(zone?.routeDifficulty))
        ? Number(zone.routeDifficulty)
        : null,
      isSpecial: Boolean(zone?.isSpecial),
    };
  }

  function getVisibleZoneName(name, zoneId = null) {
    const rawName = String(name || "").trim();
    const normalizedId = slugify(getDataId(zoneId));
    const compactName = slugify(rawName).replaceAll("-", "");
    if (normalizedId === "shinsekai" || compactName === "shinsekai") {
      return "Nouveau Monde";
    }
    return normalizedId === "grand-line" || rawName === "Grand Line"
      ? "Paradise"
      : name;
  }

  function normalizeHistoricalZoneRecord(record = {}) {
    const zoneId = record.zoneId || null;
    return {
      ...record,
      zoneName: getVisibleZoneName(record.zoneName, zoneId),
      events: Array.isArray(record.events)
        ? record.events.map(normalizeHistoricalZoneRecord)
        : record.events,
      importantEvents: Array.isArray(record.importantEvents)
        ? record.importantEvents.map(normalizeHistoricalZoneRecord)
        : record.importantEvents,
    };
  }

  function getOriginZone(originId) {
    const catalog = getZoneCatalog();

    const origin = findGameDataItem(
      ["origins"],
      originId,
    );

    const possibleIds = uniqueArray([
      originId,
      origin?.zoneId,
      origin?.zone,
      origin?.sea,
    ]).filter(Boolean);

    const matchingZone = catalog.find((zone) => {
      return (
        possibleIds.includes(zone.id) ||
        zone.originIds.some((id) => possibleIds.includes(id))
      );
    });

    if (matchingZone) {
      return cloneData(matchingZone);
    }

    return normalizeZone({
      id: originId || "unknown-origin",
      name:
        origin?.label ||
        origin?.name ||
        originId ||
        "Mer d’origine",
      type: "sea",
      canStart: true,
      originIds: [originId].filter(Boolean),
    });
  }

  function normalizeOriginId(originId) {
    if (BLUE_ZONE_IDS.includes(originId)) {
      return originId;
    }

    if (originId) {
      console.warn(
        `[Blue Legacy] Origine obsolète "${originId}" remplacée par "east-blue".`,
      );
    }

    return "east-blue";
  }

  function getAvailableZones(
    character = state.game?.character,
    excludedIds = [],
  ) {
    const excluded = new Set(excludedIds);

    return getZoneCatalog().filter((zone) => {
      if (excluded.has(zone.id)) {
        return false;
      }

      if (BLUE_ZONE_IDS.includes(zone.id)) {
        return false;
      }

      if (
        zone.factions.length > 0 &&
        !zone.factions.includes(character?.faction)
      ) {
        return false;
      }

      return true;
    });
  }

  function isSpecialZone(zone) {
    return Boolean(
      zone?.tags?.includes("special") ||
      getZoneCatalog().find(
        (candidate) =>
          candidate.id === zone?.id &&
          candidate.tags.includes("special"),
      ),
    );
  }

  function getZoneIndexForMonth(month) {
    return Math.min(
      Math.max(0, Math.floor(((Number(month) || 1) - 1) / 4)),
      5,
    );
  }

  function decorateGeneratedRoute(route, specialIndex) {
    return route.map((zone, index) => ({
      ...cloneData(zone),
      routeIndex: index,
      routeStage: index + 1,
      routeDifficulty: index + 1,
      isSpecial: index === specialIndex,
    }));
  }

  function validateGeneratedRoute(route, originId) {
    if (!Array.isArray(route) || route.length !== 6) return false;

    const ids = route.map((zone) => zone?.id);
    const count = (id) => ids.filter((current) => current === id).length;
    const specialIndexes = route
      .map((zone, index) => (isSpecialZone(zone) ? index : -1))
      .filter((index) => index >= 0);

    if (ids[0] !== normalizeOriginId(originId) || ids[5] !== "shinsekai") {
      return false;
    }

    if (
      MAIN_ROUTE_IDS.some((id) => count(id) !== 1) ||
      specialIndexes.length !== 1 ||
      specialIndexes[0] < 1 ||
      specialIndexes[0] > 4
    ) {
      return false;
    }

    if (
      BLUE_ZONE_IDS.some((blueId) => {
        const expected = blueId === ids[0] ? 1 : 0;
        return count(blueId) !== expected;
      })
    ) {
      return false;
    }

    return (
      ids.indexOf("reverse-mountain") < ids.indexOf("grand-line") &&
      ids.indexOf("grand-line") < ids.indexOf("red-line") &&
      ids.indexOf("red-line") < ids.indexOf("shinsekai")
    );
  }

  function generateRoute(
    character = state.game?.character,
    options = {},
  ) {
    const originId = normalizeOriginId(character?.origin);
    const catalog = getZoneCatalog();
    const byId = (zoneId) =>
      catalog.find((zone) => zone.id === zoneId) ||
      normalizeZone({ id: zoneId, name: zoneId });

    const specialZones = catalog.filter((zone) =>
      zone.tags.includes("special"),
    );
    const preferredSpecial = specialZones.find(
      (zone) => zone.id === options.specialZoneId,
    );
    const specialZone =
      preferredSpecial ||
      getWeightedRandomItem(specialZones, (zone) => zone.weight) ||
      byId("starless-sea");

    const baseRoute = [
      getOriginZone(originId),
      cloneData(byId("reverse-mountain")),
      cloneData(byId("grand-line")),
      cloneData(byId("red-line")),
      cloneData(byId("shinsekai")),
    ];

    const requestedIndex = Number(options.specialZoneRouteIndex);
    const insertionIndex =
      Number.isInteger(requestedIndex) &&
      requestedIndex >= 1 &&
      requestedIndex <= 4
        ? requestedIndex
        : 4;

    baseRoute.splice(insertionIndex, 0, cloneData(specialZone));
    const route = decorateGeneratedRoute(baseRoute, insertionIndex);

    if (!validateGeneratedRoute(route, originId)) {
      console.error("[Blue Legacy] Route générée invalide.", route);
      return [];
    }

    return route;
  }

  function synchronizeRouteMetadata(game) {
    if (!game) return false;

    const specialIndex = game.route.findIndex(isSpecialZone);
    game.route = decorateGeneratedRoute(game.route, specialIndex);
    game.specialZoneRouteIndex = specialIndex;
    game.specialZoneId =
      specialIndex >= 0 ? game.route[specialIndex]?.id || null : null;
    return specialIndex >= 1 && specialIndex <= 4;
  }

  function repairGameRoute(game) {
    if (!game?.character) return false;

    const originId = normalizeOriginId(game.character.origin);
    const existingSpecialIndex = game.route.findIndex(isSpecialZone);
    const preferredSpecialId =
      game.specialZoneId ||
      (existingSpecialIndex >= 0
        ? game.route[existingSpecialIndex]?.id
        : null);
    const savedIndex = Number(game.specialZoneRouteIndex);
    const preferredIndex =
      Number.isInteger(savedIndex) && savedIndex >= 1 && savedIndex <= 4
        ? savedIndex
        : existingSpecialIndex >= 1 && existingSpecialIndex <= 4
          ? existingSpecialIndex
          : undefined;

    if (!validateGeneratedRoute(game.route, originId)) {
      console.warn(
        "[Blue Legacy] Ancienne route invalide réparée sans réinitialiser la partie.",
      );
      game.route = generateRoute(game.character, {
        specialZoneId: preferredSpecialId,
        specialZoneRouteIndex: preferredIndex,
      });
    }

    synchronizeRouteMetadata(game);
    game.currentZoneIndex = getZoneIndexForMonth(game.month);
    game.visitedZoneIds = game.route
      .slice(0, game.currentZoneIndex + 1)
      .map((zone) => zone.id);

    return validateGeneratedRoute(game.route, originId);
  }

  function getCurrentZone(game = state.game) {
    if (!game) {
      return null;
    }

    return game.route[game.currentZoneIndex] || null;
  }

  function getNextZone(game = state.game) {
    if (!game) {
      return null;
    }

    return game.route[game.currentZoneIndex + 1] || null;
  }

  function createZoneTransitionData(
    zone,
    routeIndex,
    reason = "zone-change",
    game = state.game,
  ) {
    if (!zone) return null;
    const index = Number.isInteger(routeIndex)
      ? routeIndex
      : Math.max(0, game?.route?.findIndex((candidate) => candidate.id === zone.id));
    return {
      zoneId: zone.id,
      routeIndex: index,
      reason,
    };
  }

  function openZoneTransition(
    zone,
    routeIndex,
    reason = "zone-change",
  ) {
    const game = state.game;
    if (!game || !zone) return false;

    game.currentEvent = null;
    game.currentEventId = null;
    game.pendingResult = null;
    state.result = null;
    game.pendingZoneTransition =
      createZoneTransitionData(zone, routeIndex, reason, game);

    openScreen(SCREEN.ZONE_TRANSITION, { save: false });
    saveGame();
    return true;
  }

  function getPendingTransitionZone(game = state.game) {
    const pending = game?.pendingZoneTransition;
    if (!pending) return null;
    return game.route?.[pending.routeIndex] ||
      game.route?.find((zone) => zone.id === pending.zoneId) ||
      getZoneCatalog().find((zone) => zone.id === pending.zoneId) ||
      null;
  }

  function applyZoneTheme(element, zone) {
    if (!element || !zone) return;
    const theme = normalizeZone(zone).theme;
    Object.entries(theme).forEach(([key, value]) => {
      element.style.setProperty(
        `--zone-${key}`,
        value,
      );
    });
    element.dataset.zoneTheme = zone.id;
  }

  function applyZoneTransitionTheme(zone) {
    applyZoneTheme(dom.zoneTransitionScreen, zone);
  }

  function applyGameZoneTheme(zone) {
    applyZoneTheme(dom.gameScreen, zone);
  }

  function updateZoneTransitionScreen() {
    const game = state.game;
    const pending = game?.pendingZoneTransition;
    const zone = getPendingTransitionZone(game);
    if (!game || !pending || !zone) return;

    const routeLength = game.route.length || 6;
    const special = isSpecialZone(zone);
    const isBossTransition = pending.reason === "boss-event";
    const isLegendaryTransition = pending.reason === "legendary-arc";
    const isLegendaryConclusion = pending.reason === "legendary-conclusion";
    const isHakiConclusion = pending.reason === "haki-conclusion";
    const isDreamFailureConclusion = pending.reason === "dream-failure-conclusion";
    const isDecisiveConclusion = isHakiConclusion || isDreamFailureConclusion;
    const boss = isBossTransition ? game.currentEvent : null;
    applyZoneTransitionTheme(zone);
    resetBossTransitionTheme();
    if (isBossTransition || isDecisiveConclusion) {
      dom.zoneTransitionScreen?.classList.add("boss-transition");
      if (boss?.eventType === "risk") {
        dom.zoneTransitionScreen?.classList.add("boss-danger-transition");
      }
    }
    dom.zoneTransitionScreen?.classList.toggle("legendary-arc-transition", isLegendaryTransition || isLegendaryConclusion);
    dom.zoneTransitionScreen?.classList.toggle("legendary-arc-conclusion", isLegendaryConclusion);
    dom.zoneTransitionScreen?.classList.toggle("haki-conclusion", isHakiConclusion);
    dom.zoneTransitionScreen?.classList.toggle("dream-failure-conclusion", isDreamFailureConclusion);
    dom.zoneTransitionScreen?.classList.toggle(
      "talent-arc-transition",
      isLegendaryTransition && game.currentEvent?.legendaryArc === "talent",
    );

    if (dom.zoneTransitionIcon) {
      dom.zoneTransitionIcon.textContent = isLegendaryTransition || isLegendaryConclusion ? "◆" : isDecisiveConclusion
        ? pending.icon || "✦"
        : isBossTransition
        ? (boss?.decisiveStage === 3 ? "👑" : "⭐")
        : zone.icon || "🗺️";
    }
    if (dom.zoneTransitionEyebrow) {
      dom.zoneTransitionEyebrow.textContent =
        isLegendaryTransition || isLegendaryConclusion ? "Arc légendaire" : isDecisiveConclusion
          ? pending.eyebrow || "Épreuve décisive"
          : isBossTransition
          ? "Événement décisif"
          : special ? "Étape inattendue • Zone spéciale" : "Nouvelle zone";
    }
    if (dom.zoneTransitionProgress) {
      dom.zoneTransitionProgress.hidden = isLegendaryTransition || isLegendaryConclusion || isDecisiveConclusion;
      dom.zoneTransitionProgress.textContent =
        isLegendaryTransition || isLegendaryConclusion || isDecisiveConclusion
          ? ""
          : isBossTransition
          ? `${zone.name} • Événement décisif`
          : `Étape ${pending.routeIndex + 1} sur ${routeLength}`;
    }
    if (dom.zoneTransitionTitle) {
      dom.zoneTransitionTitle.textContent = isLegendaryTransition
        ? (game.currentEvent?.legendaryArc === "talent" ? "UN TALENT PRODIGIEUX ?"
          : game.currentEvent?.legendaryArc === "marineford" ? "MARINEFORD" : "COMBAT CONTRE UN EMPEREUR !")
        : isLegendaryConclusion || isDecisiveConclusion
        ? pending.title || "LA ROUTE CONTINUE"
        : isBossTransition
        ? boss?.title || "Événement décisif"
        : zone.name || "Nouvelle zone";
    }
    if (dom.zoneTransitionDescription) {
      dom.zoneTransitionDescription.textContent =
        isLegendaryTransition
          ? (game.currentEvent?.legendaryArc === "talent"
              ? LEGENDARY_TALENT_INTROS[game.character?.faction] || "Le monde commence à retenir ton nom."
            : game.currentEvent?.legendaryArc === "marineford"
              ? "La guerre n’a jamais vraiment quitté cette forteresse."
              : `${LEGENDARY_EMPEROR_NAMES[game.legendaryArcs?.emperor?.emperorId] || "Un Empereur"} bloque désormais ta route.`)
          : isLegendaryConclusion || isDecisiveConclusion
          ? pending.description || "La bataille s’achève et ta route reprend."
          : isBossTransition
          ? boss?.intro || "Ton parcours t’a conduit jusqu’ici."
          : zone.transitionText || "Une nouvelle étape commence.";
    }
    if (dom.continueZoneTransition) {
      dom.continueZoneTransition.disabled = false;
      dom.continueZoneTransition.textContent = isLegendaryConclusion || isDecisiveConclusion
        ? pending.buttonLabel || "Reprendre la route"
        : "Continuer";
    }
  }

  function continueAfterZoneTransition() {
    const game = state.game;
    if (!game?.pendingZoneTransition) return false;

    if (dom.continueZoneTransition) {
      dom.continueZoneTransition.disabled = true;
    }
    const transitionReason = game.pendingZoneTransition.reason;
    const conclusionArcId = game.pendingZoneTransition.arcId || null;
    game.pendingZoneTransition = null;
    if (transitionReason === "legendary-conclusion") {
      const arc = game.legendaryArcs?.[conclusionArcId];
      if (arc) {
        arc.conclusionPending = false;
        arc.conclusionShown = true;
        arc.routeResumed = true;
      }
    }
    saveGame();
    if (["haki-conclusion", "dream-failure-conclusion"].includes(transitionReason)) {
      openScreen(SCREEN.GAME, { save: false });
      if (game.currentAction >= game.actionsThisMonth) {
        return finishMonth({ deferEndingUntilLogbook: true });
      }
      return startNextEvent();
    }
    openScreen(SCREEN.GAME, { save: false });
    if (["boss-event", "legendary-arc"].includes(transitionReason)) {
      return true;
    }
    if (transitionReason === "legendary-conclusion") return startNextEvent();
    return startMonth();
  }

  function moveToNextZone() {
    const game = state.game;

    if (!game) {
      return null;
    }

    const nextIndex = getZoneIndexForMonth(game.month);

    if (
      nextIndex >= game.route.length ||
      nextIndex <= game.currentZoneIndex
    ) {
      return null;
    }

    game.currentZoneIndex = nextIndex;

    const zone = getCurrentZone(game);

    if (zone && !game.visitedZoneIds.includes(zone.id)) {
      game.visitedZoneIds.push(zone.id);
    }

    checkCatalogTitles(game);
    checkAchievements(game);
    saveGame();

    return zone;
  }

  /* ========================================================
     ÉVÉNEMENTS
  ======================================================== */

  const LEGENDARY_EMPERORS = Object.freeze({
    pirate: ["blackbeard", "kaido", "big-mom", "shanks"],
    marine: ["luffy", "buggy", "blackbeard", "shanks"],
    "bounty-hunter": ["buggy", "blackbeard", "kaido"],
    revolutionary: ["blackbeard", "kaido", "big-mom", "shanks", "luffy"],
  });
  const LEGENDARY_EMPEROR_NAMES = Object.freeze({
    blackbeard: "Barbe Noire", kaido: "Kaido", "big-mom": "Big Mom",
    shanks: "Shanks le Roux", luffy: "Luffy", buggy: "Baggy",
  });
  const LEGENDARY_EMPEROR_TITLES = Object.freeze({
    blackbeard: "fleau-de-barbe-noire", kaido: "tombeur-de-kaido",
    "big-mom": "briseur-de-totto-land", shanks: "rival-du-roux",
    luffy: "adversaire-du-chapeau-de-paille", buggy: "geolier-de-baggy",
  });
  const LEGENDARY_TALENT_TITLES = Object.freeze({
    pirate: "supernova",
    marine: "vice-amiral",
    revolutionary: "vice-commandant-de-dragon",
    "bounty-hunter": "cauchemar-des-pirates",
  });
  const LEGENDARY_TALENT_INTROS = Object.freeze({
    pirate: "Le monde commence à retenir ton nom.",
    marine: "Le quartier général surveille ton ascension.",
    revolutionary: "Dragon a entendu parler de tes exploits.",
    "bounty-hunter": "Les pirates redoutent désormais ta silhouette.",
  });
  const LEGENDARY_DREAM_OBJECTIVES = Object.freeze({
    "one-piece": "une copie d’un Road Ponéglyphe", "sea-emperor": "la reconnaissance d’un territoire libre",
    "worlds-greatest-fortune": "une cargaison impériale légendaire", "forgotten-history": "une archive interdite",
    "greatest-bounty-hunter": "la preuve du plus grand contrat jamais proposé", "most-dangerous-criminals": "un réseau de criminels protégé par le pavillon",
    "hunt-an-emperor": "la piste directe de l’Empereur", "contract-fortune": "un contrat capable de changer le marché mondial",
    "break-the-chains": "la libération d’une population soumise", "reveal-void-century": "un fragment d’histoire confisqué",
    "build-underground-network": "un relais clandestin au cœur du territoire", "found-free-nation": "la défense d’une future nation libre",
    admiral: "le commandement d’une opération impériale", "fleet-admiral": "la cohésion de plusieurs flottes de la Marine",
    "reform-the-marines": "la protection des civils contre un ordre politique", "greatest-marine-hero": "le sauvetage d’une île menacée",
  });

  let legendaryArcEventCache = null;
  function getLegendaryArcEvents() {
    if (!legendaryArcEventCache) {
      legendaryArcEventCache = (Array.isArray(window.BLUE_LEGACY_LEGENDARY_ARC_EVENTS)
        ? window.BLUE_LEGACY_LEGENDARY_ARC_EVENTS : []).map(normalizeEvent);
    }
    return legendaryArcEventCache;
  }

  function calculateLegendaryRunQuality(game = state.game) {
    if (!game) return 0;
    const core = ["health", "combat", "haki", "intelligence", "charisma"]
      .reduce((sum, key) => sum + Math.min(100, Math.max(0, Number(game.stats?.[key]) || 0)), 0) / 500;
    const popularity = Math.min(1, Math.max(0, (Number(game.stats?.popularity) || 0) / 100));
    const renown = Math.min(1, Math.log10(1 + Math.max(0, Number(game.stats?.bounty) || 0)) / 7);
    const crew = Math.min(1, Math.max(0, Number(game.stats?.crew) || 0) / 6);
    const titles = Math.min(1, (game.runTitles?.length || 0) / 6);
    const decisive = Math.min(1, (game.bossProgress?.completedTiers?.length || 0) / 3);
    const important = Math.min(1, (game.importantEvents?.length || 0) / 8);
    return Math.max(0, Math.min(1,
      core * .42 + popularity * .16 + renown * .13 + crew * .08 +
      titles * .08 + decisive * .08 + important * .05));
  }

  function getLegendaryArcChance(arcId, game = state.game) {
    const quality = calculateLegendaryRunQuality(game);
    if (arcId === "talent") {
      const anchors = [[0, .04], [.24, .08], [.40, .19], [.57, .34], [.73, .49], [1, .62]];
      const upperIndex = anchors.findIndex(([threshold]) => quality <= threshold);
      if (upperIndex <= 0) return anchors[0][1];
      const [lowerQuality, lowerChance] = anchors[upperIndex - 1];
      const [upperQuality, upperChance] = anchors[upperIndex];
      return lowerChance + (upperChance - lowerChance) *
        ((quality - lowerQuality) / (upperQuality - lowerQuality));
    }
    if (arcId === "marineford") {
      const anchors = [[0, .02], [.24, .05], [.40, .15], [.57, .30], [.73, .45], [1, .58]];
      const upperIndex = anchors.findIndex(([threshold]) => quality <= threshold);
      if (upperIndex <= 0) return anchors[0][1];
      const [lowerQuality, lowerChance] = anchors[upperIndex - 1];
      const [upperQuality, upperChance] = anchors[upperIndex];
      const ratio = (quality - lowerQuality) / (upperQuality - lowerQuality);
      return lowerChance + (upperChance - lowerChance) * ratio;
    }
    const hakiTitles = (game?.runTitles || []).filter((title) =>
      ["haki-observation", "haki-armement", "haki-des-rois", "maitrise-haki-des-rois-plus"].includes(getDataId(title))).length;
    const dreamProgress = Math.min(1, Math.max(0, Number(game?.flags?.dreamProgress) || 0) / 8);
    return Math.min(.48, Math.max(.005,
      .002 + Math.pow(quality, 2) * .47 + hakiTitles * .01 + dreamProgress * .01));
  }

  function getLegendaryQualityBand(quality) {
    if (quality < .24) return "weak";
    if (quality < .40) return "average";
    if (quality < .57) return "good";
    if (quality < .73) return "very-good";
    return "exceptional";
  }

  function selectLegendaryEmperor(game = state.game, random = Math.random) {
    const faction = game?.character?.faction;
    const available = LEGENDARY_EMPERORS[faction] || LEGENDARY_EMPERORS.pirate;
    const dream = game?.character?.dream;
    const preferred = dream === "hunt-an-emperor" ? ["kaido", "blackbeard"]
      : ["one-piece", "forgotten-history", "reveal-void-century"].includes(dream) ? ["blackbeard", "big-mom"]
      : dream === "contract-fortune" ? ["buggy", "blackbeard"] : [];
    const weighted = available.flatMap((id) => preferred.includes(id) ? [id, id] : [id]);
    return weighted[Math.min(weighted.length - 1, Math.floor(random() * weighted.length))];
  }

  function localizeLegendaryArcEvent(event, game = state.game) {
    const localized = cloneData(event);
    const emperorId = game?.legendaryArcs?.emperor?.emperorId;
    const emperor = LEGENDARY_EMPEROR_NAMES[emperorId] || "un Empereur";
    const objective = LEGENDARY_DREAM_OBJECTIVES[game?.character?.dream] || "un objectif capable de changer ta destinée";
    localized.description = String(localized.description || "").replaceAll("{emperor}", emperor).replaceAll("{objective}", objective);
    localized.text = localized.description;
    localized.legendaryArc = localized.tags?.includes("legendary-talent")
      ? "talent"
      : localized.tags?.includes("legendary-marineford") ? "marineford" : "emperor";
    localized.legendaryStep = Number(localized.tags?.find((tag) => tag.startsWith("legendary-step-"))?.split("-").at(-1)) || 1;
    localized.emperorId = localized.legendaryArc === "emperor" ? emperorId : null;
    return localized;
  }

  function getLegendaryArcEvent(arcId, step, game = state.game) {
    const faction = game?.character?.faction;
    const id = `legendary-${arcId}-${faction}-${step}`;
    const event = getLegendaryArcEvents().find((candidate) => candidate.id === id);
    return event ? localizeLegendaryArcEvent(event, game) : null;
  }

  function isMarinefordEligible(game = state.game) {
    if (!game || game.isFinished || game.ending) return false;
    return Number(game.month) === 13 && getCurrentZone(game)?.id === "red-line";
  }

  function isTalentArcEligible(game = state.game) {
    return Boolean(game && !game.isFinished && !game.ending &&
      [11, 12].includes(Number(game.month)) && getCurrentZone(game)?.id === "grand-line");
  }

  function getLegendaryArcTitleId(arcId, game = state.game) {
    if (arcId === "talent") return LEGENDARY_TALENT_TITLES[game?.character?.faction] || null;
    if (arcId === "marineford") return window.BLUE_LEGACY_LEGENDARY_MARINEFORD_TITLES?.[game?.character?.faction] || null;
    return LEGENDARY_EMPEROR_TITLES[game?.legendaryArcs?.emperor?.emperorId] || null;
  }

  function startLegendaryArc(arcId, game = state.game) {
    const arc = game?.legendaryArcs?.[arcId];
    if (!game || !arc) return false;
    if (arcId === "emperor" && !arc.emperorId) arc.emperorId = selectLegendaryEmperor(game);
    arc.status = "in-progress";
    arc.step = Math.max(1, arc.step || 1);
    const event = getLegendaryArcEvent(arcId, arc.step, game);
    if (!event) { arc.status = "failed"; return false; }
    game.currentEvent = event;
    game.currentEventId = event.id;
    game.currentChoiceIndex = null;
    game.pendingResult = null;
    game.pendingZoneTransition = createZoneTransitionData(getCurrentZone(game), game.currentZoneIndex, "legendary-arc", game);
    checkAchievements(game);
    saveGame();
    openScreen(SCREEN.ZONE_TRANSITION, { save: false });
    return true;
  }

  function evaluateLegendaryArc(arcId, game = state.game, random = Math.random) {
    const arc = game?.legendaryArcs?.[arcId];
    if (!arc || arc.status !== "unassessed") return arc?.status === "selected";
    if (arcId === "talent" && !isTalentArcEligible(game)) return false;
    if (arcId === "marineford" && !isMarinefordEligible(game)) return false;
    if (arcId === "emperor" && !(Number(game.month) === 24 && getCurrentZone(game)?.id === "shinsekai")) return false;
    const chance = getLegendaryArcChance(arcId, game);
    const roll = random();
    arc.chance = chance;
    arc.roll = roll;
    arc.quality = calculateLegendaryRunQuality(game);
    arc.qualityBand = getLegendaryQualityBand(arc.quality);
    arc.evaluatedAtMonth = Number(game.month) || null;
    if (arcId === "marineford") arc.evaluatedAfterParadise = true;
    arc.status = roll < chance ? "selected" : "not-selected";
    if (arc.status === "selected" && arcId === "emperor") arc.emperorId = selectLegendaryEmperor(game, random);
    return arc.status === "selected";
  }

  function maybeStartLegendaryArc(game = state.game) {
    if (!game || game.currentEvent || game.pendingResult || game.pendingLogbookEntry || game.pendingZoneTransition || game.pendingRewardReveals?.length || game.ending || game.isFinished) return false;
    if (isTalentArcEligible(game) && game.legendaryArcs.talent.status === "unassessed") {
      evaluateLegendaryArc("talent", game);
    }
    if (game.legendaryArcs.talent.status === "selected") return startLegendaryArc("talent", game);
    return false;
  }

  function finalizeLegendaryArc(arcId, game = state.game) {
    const arc = game?.legendaryArcs?.[arcId];
    if (!arc) return false;
    const successes = [1, 2, 3].filter((step) => game.flags?.[`legendary_${arcId}_${step}_success`]).length;
    const failures = [1, 2, 3].filter((step) => game.flags?.[`legendary_${arcId}_${step}_failure`]).length;
    const earned = successes >= 2 && failures === 0 && Boolean(game.flags?.[`legendary_${arcId}_3_success`]);
    if (earned) {
      const titleId = getLegendaryArcTitleId(arcId, game);
      if (titleId) { unlockTitle(titleId, null, game, false); arc.titleId = titleId; }
      arc.status = "succeeded";
    } else {
      arc.status = failures >= 2 ? "failed" : "completed-no-title";
    }
    arc.step = 3;
    arc.completedAtMonth = game.month;
    arc.result = earned ? "title-earned" : failures >= 2 ? "failed" : "survived";
    checkAchievements(game);
    return earned;
  }

  function getLegendaryConclusionCopy(arcId, game = state.game) {
    const faction = getDataId(game?.character?.faction) || "pirate";
    const factionEnding = {
      pirate: "Tu préserves ton équipage et ton pavillon avant de reprendre la mer.",
      marine: "L’ordre de repli ramène ton unité auprès du commandement.",
      "bounty-hunter": "Tu abandonnes le contrat avant de risquer davantage pour une cible hors d’atteinte.",
      revolutionary: "Ta cellule évacue la zone et transforme ce revers en repli stratégique.",
    }[faction] || "Tu quittes le champ de bataille vivant et reprends ta route.";

    if (arcId === "talent") {
      const descriptions = {
        pirate: "Ton nom circule désormais sur plusieurs mers, mais tes exploits ne suffisent pas encore à te faire entrer parmi les Supernovas.",
        marine: "Le quartier général reconnaît ton potentiel, mais estime que tu n’es pas encore prêt à porter les insignes d’un Vice-Amiral.",
        revolutionary: "Dragon salue ton engagement, mais le commandement d’une force révolutionnaire attendra encore.",
        "bounty-hunter": "Les pirates connaissent désormais ton visage, mais ton nom ne provoque pas encore la terreur espérée.",
      };
      return { title: "UNE PROMESSE REMARQUÉE", description: descriptions[faction] || descriptions.pirate };
    }
    if (arcId === "marineford") {
      return {
        title: "LA BATAILLE S’ACHÈVE",
        description: `Malgré tes efforts, ta mission dans la forteresse ne suffit pas à inscrire ton nom dans la légende de Marineford. ${factionEnding}`,
      };
    }
    const emperor = LEGENDARY_EMPEROR_NAMES[game?.legendaryArcs?.emperor?.emperorId] || "L’Empereur";
    return {
      title: "LA ROUTE CONTINUE",
      description: `Malgré tes efforts, la puissance de ${emperor} te force à battre en retraite. Tu survis à l’affrontement sans accomplir l’exploit légendaire. ${factionEnding}`,
    };
  }

  function queueLegendaryConclusion(arcId, game = state.game) {
    const arc = game?.legendaryArcs?.[arcId];
    const zone = getCurrentZone(game);
    if (!arc || !zone || arc.titleId || arc.conclusionShown || arc.routeResumed) return false;
    if (!arc.conclusion) arc.conclusion = getLegendaryConclusionCopy(arcId, game);
    arc.conclusionPending = true;
    game.pendingZoneTransition = {
      ...createZoneTransitionData(zone, game.currentZoneIndex, "legendary-conclusion", game),
      arcId,
      title: arc.conclusion.title,
      description: arc.conclusion.description,
      buttonLabel: arcId === "talent" ? "Poursuivre dans Paradise" : "Reprendre la route",
    };
    return true;
  }

  const HAKI_TITLE_REWARD_IDS = Object.freeze([
    "haki-observation",
    "haki-armement",
    "haki-des-rois",
    "maitrise-haki-des-rois-plus",
  ]);

  function queueHakiFailureConclusion(event, outcome, rewards, resolutionId, game = state.game) {
    const stage = Number(event?.decisiveStage);
    const zone = getCurrentZone(game);
    if (!game || !zone || !event?.tags?.includes("haki-awakening") || ![1, 2].includes(stage)) return false;
    const gainedHaki = (rewards || []).some((reward) =>
      reward?.type === "title" && HAKI_TITLE_REWARD_IDS.includes(getDataId(reward.data || reward.title || reward)),
    );
    const tier = outcome?.resolvedOutcomeTier || outcome?.outcomeTier || inferOutcomeTier(outcome || {});
    const failedAwakening = ["mixed", "failure", "severe_failure"].includes(tier);
    if (gainedHaki || !failedAwakening) return false;
    if (game.pendingZoneTransition?.reason === "haki-conclusion" &&
        game.pendingZoneTransition.resolutionId === resolutionId) return false;

    const masteryAttempt = stage === 2 && game.flags?.firstDecisiveHakiType === "conquerors";
    const copy = stage === 1
      ? {
          id: "haki-awakening-failure",
          icon: "◇",
          title: "L’éveil n’a pas eu lieu",
          description: "Tu pousses ta volonté jusqu’à ses limites, mais rien ne répond encore. Malgré tes efforts, aucun Haki ne s’éveille cette fois-ci.",
        }
      : masteryAttempt
        ? {
            id: "conquerors-mastery-failure",
            icon: "👑",
            title: "Une maîtrise encore incomplète",
            description: "Ton Haki des Rois se manifeste avec puissance, mais il échappe encore à ton contrôle. Tu conserves ce pouvoir, sans parvenir à atteindre une véritable maîtrise.",
          }
        : {
            id: "conquerors-awakening-failure",
            icon: "✦",
            title: "La volonté reste silencieuse",
            description: "Tu cherches à imposer ta volonté au monde, mais la pression retombe sans provoquer l’éveil espéré. Le Haki des Rois demeure encore hors de ta portée.",
          };
    game.pendingZoneTransition = {
      ...createZoneTransitionData(zone, game.currentZoneIndex, "haki-conclusion", game),
      ...copy,
      resolutionId,
      eyebrow: "ÉPREUVE DÉCISIVE",
      buttonLabel: "Poursuivre l’aventure",
    };
    return true;
  }

  function getFinalDreamFailureCopy(game = state.game) {
    const popularity = Number(game?.stats?.popularity) || 0;
    const faction = getDataId(game?.character?.faction) || "pirate";
    const careerOpening = popularity >= 90
      ? "Tu as marqué les mers et bâti une véritable légende. Pourtant, malgré ce parcours exceptionnel, le rêve qui guidait ton voyage demeure hors de portée."
      : popularity >= 75
        ? "Ton parcours restera dans les mémoires, mais la dernière marche était encore trop haute. Tu ne parviens pas à accomplir le rêve qui t’avait poussé à prendre la mer."
        : "Tu as poursuivi ton rêve jusqu’au bout, mais cette dernière épreuve dépasse encore tes forces. Ton aventure s’achève sans que ton ambition devienne réalité.";
    const factionClosing = {
      pirate: "Les mers se souviendront néanmoins de la légende bâtie sous ton pavillon.",
      marine: "Les responsabilités assumées et les batailles remportées continueront néanmoins de porter ton nom au sein de la Marine.",
      "bounty-hunter": "Les contrats accomplis et les cibles terrassées demeurent les marques d’une carrière que la dernière prise ne peut effacer.",
      revolutionary: "Les peuples aidés et les chaînes brisées sur ta route survivront à ce projet resté inachevé.",
    }[faction] || "Tout ce que tu as accompli sur les mers demeure inscrit dans ton histoire.";
    return {
      id: "final-dream-failure",
      icon: "☆",
      title: "Un rêve hors de portée",
      description: `${careerOpening} ${factionClosing}`,
    };
  }

  function queueFinalDreamFailureConclusion(event, resolutionId, game = state.game) {
    const finalOutcome = game?.bossProgress?.finalOutcome;
    const zone = getCurrentZone(game);
    if (!game || !zone || event?.eventType !== "decisive" || Number(event?.decisiveStage) !== 3) return false;
    if (!finalOutcome || finalOutcome.dreamCompleted !== false) return false;
    if (finalOutcome.dreamId && finalOutcome.dreamId !== game.character?.dream) return false;
    if (finalOutcome.factionId && finalOutcome.factionId !== game.character?.faction) return false;
    if (game.pendingZoneTransition?.reason === "dream-failure-conclusion" &&
        game.pendingZoneTransition.resolutionId === resolutionId) return false;
    game.pendingZoneTransition = {
      ...createZoneTransitionData(zone, game.currentZoneIndex, "dream-failure-conclusion", game),
      ...getFinalDreamFailureCopy(game),
      resolutionId,
      eyebrow: "DERNIÈRE ÉPREUVE",
      buttonLabel: "Découvrir la fin de ma carrière",
    };
    return true;
  }

  function getBossEvents() {
    const catalog = Array.isArray(window.BLUE_LEGACY_DECISIVE_EVENTS)
      ? window.BLUE_LEGACY_DECISIVE_EVENTS
      : window.SEA_OF_LEGENDS_BOSS_EVENTS;
    return (Array.isArray(catalog) ? catalog : [])
      .filter(Boolean)
      .map(normalizeEvent);
  }

  function getBossTierForFinishedMonth(month) {
    const value = Number(month);
    return ({ 8: 1, 16: 2, 24: 3 })[value] || null;
  }

  function getSeenBossCount(bossId) {
    return getProfile().pantheon.reduce((count, run) =>
      count + (run.importantEvents || []).filter((event) => event.eventId === bossId).length,
    0);
  }

  function selectBossEvent(tier, game = state.game) {
    if (!game) return null;
    const progress = game.bossProgress;
    const savedId = progress.selectedBossIds?.[tier] || progress.activeBossId;
    const catalog = getBossEvents();
    const saved = savedId ? catalog.find((event) => event.id === savedId) : null;
    if (saved) return saved;

    const dreamId = game.character?.dream;
    const faction = game.character?.faction;
    const catalogTier = Math.min(3, Math.max(1, tier));
    const eligible = catalog.filter((event) =>
      event.decisiveStage === catalogTier &&
      event.dreamIds.includes(dreamId) &&
      (!event.factions.length || event.factions.includes(faction)));
    const selected = getWeightedRandomItem(
      eligible,
      (event) => 1 / (1 + getSeenBossCount(event.id) * 0.55),
    );
    if (!selected) return null;
    progress.selectedBossIds[tier] = selected.id;
    progress.activeBossId = selected.id;
    return selected;
  }

  function localizeBossEvent(event, zone, stage = event?.decisiveStage || event?.bossTier || 1) {
    const localized = cloneData(event);
    const zoneName = zone?.name || "cette mer";
    localized.id = `${localized.id}-stage-${stage}`;
    localized.title = localized.title.replace(
      /^(Première épreuve|Tournant de carrière|Dernière épreuve|Étape \d+ sur 3) — /,
      "",
    );
    localized.eventType = "decisive";
    localized.decisiveStage = stage;
    localized.description = String(localized.description || "")
      .replaceAll("{zone}", zoneName);
    localized.choices?.forEach((choice) => {
      choice.outcomes?.forEach((outcome) => {
        outcome.result = String(outcome.result || "").replaceAll("{zone}", zoneName);
        if (localized.dreamIds?.[0]) {
          outcome.dreamProgressByDream = {
            ...(outcome.dreamProgressByDream || {}),
            [localized.dreamIds[0]]: stage === 3
              ? Number(outcome.dreamProgressByDream?.[localized.dreamIds[0]]) || 0
              : outcome.fallback ? 0 : stage === 2 ? 2 : 1,
          };
        }
        if (stage === 1 && !localized.tags?.includes("haki-awakening")) {
          delete outcome.flags?.bossFinalDreamCompleted;
          delete outcome.flags?.bossFinalDreamId;
          delete outcome.flags?.bossFinalDreamFailed;
          outcome.titles = [];
        }
      });
    });
    localized.zones = zone?.id ? [zone.id] : [];
    return normalizeEvent(localized);
  }

  function startBossEvent(tier, game = state.game) {
    if (!game || game.bossProgress.completedTiers.includes(tier)) return false;
    const selected = selectBossEvent(tier, game);
    const zone = getCurrentZone(game);
    if (!selected || !zone) {
      console.warn(`[Blue Legacy] Aucun événement décisif éligible pour l’étape ${tier}.`);
      game.bossProgress.completedTiers.push(tier);
      return false;
    }

    const boss = localizeBossEvent(selected, zone, tier);
    if (tier === 2 && boss.tags?.includes("haki-awakening")) {
      // Verrouillé avant l'affichage et avant toute récompense de l'étape 2.
      game.flags.secondDecisiveHakiBranch =
        getFirstDecisiveHakiType(game) === "conquerors"
          ? "mastery"
          : "base-conquerors";
    }
    game.currentEvent = boss;
    game.currentEventId = boss.id;
    game.currentChoiceIndex = null;
    game.pendingResult = null;
    game.bossProgress.activeBossId = boss.id;
    game.pendingZoneTransition = null;
    saveGame();
    openScreen(SCREEN.GAME, { save: false });
    return true;
  }

  function getAllEvents() {
    const sources = [
      window.SEA_OF_LEGENDS_EVENTS,
      window.GAME_EVENTS,
      window.EVENTS,
      window.GAME_DATA?.events,
    ];

    const source = sources.find(Array.isArray) || [];

    return source
      .filter(Boolean)
      .map(normalizeEvent);
  }

  function normalizeEventType(event = {}) {
    if (EVENT_TYPE_META[event.eventType]) return event.eventType;
    if (event.bossEvent) return "decisive";
    if (event.dangerTheme) return "risk";
    return "ordinary";
  }

  function inferResolutionCategory(event = {}) {
    if (["action", "social"].includes(event.resolutionCategory)) {
      return event.resolutionCategory;
    }
    const context = `${event.category || ""} ${(event.tags || []).join(" ")} ${event.title || ""} ${event.description || event.text || ""}`;
    return /combat|attaque|assaut|bataille|guerre|war|danger|survie|survival|sauvetage|rescue|libération|liberation|chasse|hunt|haki|fluide|défense|navigation|tempête|blocus/i.test(context)
      ? "action"
      : "social";
  }

  function normalizeEvent(event, index = 0) {
    const id =
      event?.id ||
      slugify(
        event?.title ||
        event?.name ||
        `event-${index + 1}`,
      );

    const eventType = normalizeEventType(event || {});
    return {
      id,
      title: event?.title || event?.name || "Événement",
      description:
        event?.description ||
        event?.text ||
        "",
      category: event?.category || "narrative",
      tags: uniqueArray(event?.tags || []),
      eventType,
      resolutionCategory: inferResolutionCategory(event || {}),

      factions: uniqueArray(
        event?.factions ||
        event?.paths ||
        event?.ways ||
        [],
      ),

      zones: uniqueArray(
        event?.zones ||
        event?.zoneIds ||
        (event?.zone ? [event.zone] : []),
      ),

      zoneTypes: uniqueArray(event?.zoneTypes || []),
      // Les tags narratifs ne sont pas des contraintes géographiques.
      zoneTags: uniqueArray(event?.zoneTags || []),

      minMonth: Number.isFinite(Number(event?.minMonth))
        ? Number(event.minMonth)
        : null,

      maxMonth: Number.isFinite(Number(event?.maxMonth))
        ? Number(event.maxMonth)
        : null,

      months: uniqueArray(event?.months || []).map(Number),

      requiredStats: { ...(event?.requiredStats || {}) },
      minimumStats: { ...(event?.minimumStats || {}) },
      maximumStats: { ...(event?.maximumStats || {}) },

      requiredFlags: { ...(event?.requiredFlags || {}) },
      forbiddenFlags: uniqueArray(event?.forbiddenFlags || []),

      requiredEvents: uniqueArray(event?.requiredEvents || []),
      forbiddenEvents: uniqueArray(event?.forbiddenEvents || []),

      requiredTraits: uniqueArray(event?.requiredTraits || []),
      forbiddenTraits: uniqueArray(event?.forbiddenTraits || []),

      requiredCombatStyles: uniqueArray(
        event?.requiredCombatStyles ||
        (event?.requiredCombatStyle
          ? [event.requiredCombatStyle]
          : []),
      ),

      requiresD:
        typeof event?.requiresD === "boolean"
          ? event.requiresD
          : null,

      requiresFruit:
        typeof event?.requiresFruit === "boolean"
          ? event.requiresFruit
          : null,

      fruitIds: uniqueArray(event?.fruitIds || []),

      unique: event?.unique !== false,
      mandatory: Boolean(event?.mandatory || event?.required),
      important: Boolean(event?.important),
      highStakes: Boolean(event?.highStakes),
      decisiveStage: Number(event?.decisiveStage || event?.bossTier) || null,
      dreamIds: uniqueArray(event?.dreamIds || []),
      loreCharacters: uniqueArray(event?.loreCharacters || []),
      decisiveKind: event?.decisiveKind || event?.bossType || "",
      intro: event?.intro || "",
      rarity: event?.rarity || "common",

      priority: Number(event?.priority) || 0,
      weight: Math.max(0, Number(event?.weight) || 1),

      condition:
        typeof event?.condition === "function"
          ? event.condition
          : null,

      choices: Array.isArray(event?.choices)
        ? event.choices.map(normalizeChoice)
        : [],
    };
  }

  function normalizeChoice(choice, index = 0) {
    const normalized = {
      id: choice?.id || `choice-${index + 1}`,
      text:
        choice?.text ||
        choice?.label ||
        `Choix ${index + 1}`,
      hint: choice?.hint || choice?.riskLabel || choice?.visibleHint || "",
      choiceTag: choice?.choiceTag || choice?.tag || "",
      resolutionWeights:
        choice?.resolutionWeights && typeof choice.resolutionWeights === "object"
          ? { ...choice.resolutionWeights }
          : null,
      condition:
        typeof choice?.condition === "function"
          ? choice.condition
          : null,
    };

    const sources = choice?.outcomes || choice?.results || choice?.possibleOutcomes;
    normalized.outcomes = (Array.isArray(sources) && sources.length
      ? sources
      : [{ ...choice, id: "default" }]
    ).map(normalizeOutcome);
    return normalized;
  }

  function normalizeOutcome(outcome, index = 0) {
    const forbiddenFlags = outcome?.forbiddenFlags || [];
    return {
      id: outcome?.id || `outcome-${index + 1}`,
      result: outcome?.result || outcome?.text || "",
      effects: { ...(outcome?.effects || {}) },
      flags: { ...(outcome?.flags || {}) },
      removeFlags: uniqueArray(outcome?.removeFlags || []),
      addTraits: uniqueArray(outcome?.addTraits || (outcome?.trait ? [outcome.trait] : [])),
      allowMultipleTraits: Boolean(outcome?.allowMultipleTraits),
      combatStyle: outcome?.combatStyle || outcome?.style || null,
      replaceCombatStyle: Boolean(outcome?.replaceCombatStyle),
      devilFruit: outcome?.devilFruit || outcome?.fruit || null,
      crewMember: outcome?.crewMember || null,
      outcomeTier: OUTCOME_TIER_ORDER.includes(outcome?.outcomeTier)
        ? outcome.outcomeTier
        : null,
      titles: uniqueArray(outcome?.titles || (outcome?.title ? [outcome.title] : [])),
      allowMultipleTitles: Boolean(outcome?.allowMultipleTitles),
      achievement: outcome?.achievement || null,
      rewards: uniqueArray(outcome?.rewards || (outcome?.reward ? [outcome.reward] : [])),
      dreamProgress: Number(outcome?.dreamProgress) || 0,
      dreamProgressByDream:
        outcome?.dreamProgressByDream &&
        typeof outcome.dreamProgressByDream === "object"
          ? { ...outcome.dreamProgressByDream }
          : {},
      dreamTags: uniqueArray(outcome?.dreamTags || []),
      important: Boolean(outcome?.important),
      ignoreDiminishingReturns: Boolean(outcome?.ignoreDiminishingReturns),
      importantReward: Boolean(
        outcome?.importantReward ||
        outcome?.majorReward,
      ),
      combatStyleDescription:
        outcome?.combatStyleDescription ||
        outcome?.styleDescription ||
        "",
      ending: outcome?.ending || null,
      fallback: Boolean(outcome?.fallback),
      weight: Math.max(0, Number(outcome?.weight) || 1),
      chance: normalizeChance(outcome?.chance),
      minimumStats: { ...(outcome?.minimumStats || {}) },
      maximumStats: { ...(outcome?.maximumStats || {}) },
      requiredTraits: uniqueArray(outcome?.requiredTraits || []),
      forbiddenTraits: uniqueArray(outcome?.forbiddenTraits || []),
      requiredCombatStyles: uniqueArray(outcome?.requiredCombatStyles || []),
      requiredFlags: { ...(outcome?.requiredFlags || {}) },
      forbiddenFlags,
      requiredEvents: uniqueArray(outcome?.requiredEvents || []),
      forbiddenEvents: uniqueArray(outcome?.forbiddenEvents || []),
      requiresD: typeof outcome?.requiresD === "boolean" ? outcome.requiresD : null,
      requiresFruit: typeof outcome?.requiresFruit === "boolean" ? outcome.requiresFruit : null,
      fruitIds: uniqueArray(outcome?.fruitIds || []),
      condition: typeof outcome?.condition === "function" ? outcome.condition : null,
      allowMultipleMajorRewards: Boolean(outcome?.allowMultipleMajorRewards),
      maxMajorRewards: Number.isFinite(Number(outcome?.maxMajorRewards))
        ? Math.max(0, Number(outcome.maxMajorRewards))
        : CONFIG.maxMajorRewards,
    };
  }

  function getOutcomeDreamProgress(outcome, game = state.game) {
    const dreamId = game?.character?.dream;
    const specificProgress = Number(
      outcome?.dreamProgressByDream?.[dreamId],
    );
    return Number.isFinite(specificProgress)
      ? specificProgress
      : Number(outcome?.dreamProgress) || 0;
  }

  function isFinalDreamSuccess(outcome, event, game = state.game) {
    if (!outcome?.flags?.bossFinalDreamCompleted || !game) return false;
    const dreamId = game.character?.dream;
    const factionId = game.character?.faction;
    const markedDreamId = outcome.flags.bossFinalDreamId;
    return event?.eventType === "decisive" && Number(event.decisiveStage) === 3 &&
      event.dreamIds?.length === 1 && event.dreamIds[0] === dreamId &&
      (!event.factions?.length || event.factions.includes(factionId)) &&
      (!markedDreamId || markedDreamId === dreamId);
  }

  function secureFinalDreamOutcome(selectedOutcome, event, game = state.game) {
    if (!selectedOutcome?.flags?.bossFinalDreamCompleted ||
        isFinalDreamSuccess(selectedOutcome, event, game)) return selectedOutcome;
    const outcome = cloneData(selectedOutcome);
    delete outcome.flags.bossFinalDreamCompleted;
    delete outcome.flags.bossFinalDreamId;
    outcome.titles = [];
    return outcome;
  }

  function normalizeChance(chance) {
    if (chance === undefined || chance === null || chance === "") return 1;
    const value = Number(chance);
    if (!Number.isFinite(value)) return 1;
    return Math.max(0, Math.min(1, value > 1 ? value / 100 : value));
  }

  function isOutcomeCompatible(outcome, game = state.game, event = null) {
    if (!outcome || !game) return false;
    const character = game.character;
    if (!checkMinimumStats(outcome.minimumStats, game.stats) ||
        !checkMaximumStats(outcome.maximumStats, game.stats) ||
        !checkRequiredFlags(outcome.requiredFlags, game.flags)) return false;
    if (outcome.requiredTraits.some((id) => !hasTrait(id, game)) ||
        outcome.forbiddenTraits.some((id) => hasTrait(id, game)) ||
        outcome.requiredEvents.some((id) => !game.seenEvents.includes(id)) ||
        outcome.forbiddenEvents.some((id) => game.seenEvents.includes(id))) return false;
    if (outcome.requiredCombatStyles.length &&
        !outcome.requiredCombatStyles.includes(character.combatStyle)) return false;
    if (outcome.requiresD !== null && Boolean(character.hasD) !== outcome.requiresD) return false;
    if (outcome.requiresFruit !== null &&
        Boolean(character.devilFruit) !== outcome.requiresFruit) return false;
    if (outcome.fruitIds.length && !outcome.fruitIds.includes(character.devilFruit?.id)) return false;
    const forbidden = outcome.forbiddenFlags;
    if (Array.isArray(forbidden) &&
        forbidden.some((id) => Boolean(game.flags[id]))) return false;
    if (!Array.isArray(forbidden) &&
        Object.entries(forbidden).some(([id, value]) => game.flags[id] === value)) return false;
    if (outcome.condition) {
      try {
        if (!outcome.condition(createEventContext(game, event))) return false;
      } catch (error) {
        console.error(`[Blue Legacy] Issue invalide "${outcome.id}".`, error);
        return false;
      }
    }
    return true;
  }

  function getCompatibleOutcomes(choice, game = state.game, event = null) {
    return (choice?.outcomes || []).filter((outcome) =>
      isOutcomeCompatible(outcome, game, event),
    );
  }

  const FIRST_DECISIVE_HAKI_TYPES = Object.freeze([
    "observation", "armament", "conquerors", "none",
  ]);

  function getFirstDecisiveHakiType(game = state.game) {
    const value = game?.flags?.firstDecisiveHakiType;
    if (FIRST_DECISIVE_HAKI_TYPES.includes(value)) return value;
    return game?.flags?.completedDecisiveStage1 === true ? "none" : null;
  }

  function isSecondDecisiveHakiEvent(event = state.game?.currentEvent) {
    return Number(event?.decisiveStage) === 2 && event?.tags?.includes("haki-awakening");
  }

  function secureHakiDecisiveOutcome(selectedOutcome, event, game = state.game) {
    if (!selectedOutcome || !isSecondDecisiveHakiEvent(event)) return selectedOutcome;
    const firstHaki = getFirstDecisiveHakiType(game);
    const requestsMastery = (selectedOutcome.titles || [])
      .some((title) => getDataId(title) === "maitrise-haki-des-rois-plus");
    if (!requestsMastery || firstHaki === "conquerors") return selectedOutcome;
    console.error("[Blue Legacy] Issue Haki interdite corrigée : Maîtrise+ exige le Haki des Rois au premier décisif.", {
      outcomeId: selectedOutcome.id,
      firstDecisiveHakiType: firstHaki,
    });
    const secured = cloneData(selectedOutcome);
    secured.titles = (secured.titles || []).map((title) =>
      getDataId(title) === "maitrise-haki-des-rois-plus" ? "haki-des-rois" : title);
    secured.flags ||= {};
    delete secured.flags.masteredHakiKings;
    secured.flags.awakenedHakiKings = true;
    secured.flags.conquerorsHakiAwakenedAtSecondDecisive = true;
    return secured;
  }

  function secureHakiOutcomeCoherence(selectedOutcome, choice, event, game = state.game) {
    if (!selectedOutcome || !event?.tags?.includes("haki-awakening")) return selectedOutcome;
    const tier = selectedOutcome.resolvedOutcomeTier || selectedOutcome.outcomeTier || inferOutcomeTier(selectedOutcome);
    const positive = ["success", "exceptional_success"].includes(tier);
    const hasHakiTitle = (selectedOutcome.titles || []).some((title) =>
      HAKI_TITLE_REWARD_IDS.includes(getDataId(title)));
    if (positive && hasHakiTitle) return selectedOutcome;

    if (positive) {
      const replacement = getCompatibleOutcomes(choice, game, event).find((outcome) =>
        ["success", "exceptional_success"].includes(outcome.outcomeTier || inferOutcomeTier(outcome)) &&
        (outcome.titles || []).some((title) => HAKI_TITLE_REWARD_IDS.includes(getDataId(title))));
      console.error("[Blue Legacy] Résultat Haki incohérent : une réussite positive doit provoquer un éveil.", {
        eventId: event.id,
        outcomeId: selectedOutcome.id,
        replacementId: replacement?.id || null,
      });
      if (replacement) {
        return {
          ...cloneData(replacement),
          outcomeTier: replacement.outcomeTier || "success",
          resolvedOutcomeTier: tier,
        };
      }
    }

    const secured = cloneData(selectedOutcome);
    secured.outcomeTier = positive ? "failure" : tier;
    secured.resolvedOutcomeTier = secured.outcomeTier;
    secured.titles = (secured.titles || []).filter((title) =>
      !HAKI_TITLE_REWARD_IDS.includes(getDataId(title)));
    secured.effects = Object.fromEntries(Object.entries(secured.effects || {})
      .filter(([, value]) => Number(value) <= 0));
    if (!Object.values(secured.effects).some((value) => Number(value) < 0)) {
      secured.effects.health = -1;
    }
    secured.flags ||= {};
    if (Number(event.decisiveStage) === 1) {
      secured.flags.firstDecisiveHakiType = "none";
      secured.flags.conquerorsHakiAwakenedAtFirstDecisive = false;
    }
    delete secured.flags.awakenedHakiKings;
    delete secured.flags.masteredHakiKings;
    delete secured.flags.conquerorsHakiAwakenedAtSecondDecisive;
    return secured;
  }

  function getRenownResolutionValue(game = state.game) {
    const value = Math.max(0, Number(game?.stats?.bounty) || 0);
    return Math.min(100, Math.log10(1 + value / 25000) * 32);
  }

  function getEventResolutionScore(game = state.game, event = null, choice = null) {
    const category = event?.resolutionCategory === "social" ? "social" : "action";
    const broadDecisiveWeights = event?.eventType === "decisive" && (
      Number(event?.decisiveStage) === 3 || event?.tags?.includes("haki-awakening")
    );
    const allowed = broadDecisiveWeights
      ? new Set(["health", "combat", "haki", "charisma", "intelligence", "renown"])
      : category === "action"
      ? new Set(["health", "combat", "haki"])
      : new Set(["charisma", "intelligence", "renown"]);
    const configured = choice?.resolutionWeights || RESOLUTION_DEFAULT_WEIGHTS[category];
    const weights = Object.fromEntries(
      Object.entries(configured).filter(([stat, value]) => allowed.has(stat) && Number(value) > 0),
    );
    const totalWeight = Object.values(weights).reduce((sum, value) => sum + Number(value), 0) || 1;
    const values = {
      health: Number(game?.stats?.health) || 1,
      combat: Number(game?.stats?.combat) || 1,
      haki: Number(game?.stats?.haki) || 1,
      charisma: Number(game?.stats?.charisma) || 1,
      intelligence: Number(game?.stats?.intelligence) || 1,
      renown: getRenownResolutionValue(game),
    };
    const weighted = Object.entries(weights).reduce(
      (sum, [stat, weight]) => sum + values[stat] * Number(weight) / totalWeight,
      0,
    );
    const specialization = Math.max(...Object.keys(weights).map((stat) => values[stat]));
    // Une spécialisation forte compense une faiblesse secondaire sans rendre
    // les profils équilibrés inutiles.
    const base = weighted * 0.82 + specialization * 0.18;
    const typeDifficulty = EVENT_TYPE_META[event?.eventType]?.difficulty || 0;
    const stageDifficulty = event?.eventType === "decisive"
      ? Math.max(0, (Number(event.decisiveStage) || 1) - 1) * 1.25
      : Math.max(0, (Number(getCurrentZone(game)?.routeStage) || 1) - 1) * 0.75;
    const shopBonus = event?.eventType === "ordinary" && game?.activeShopItems?.includes("eternal-pose")
      ? Number(findShopItem("eternal-pose")?.ordinaryResolutionBonus) || 5
      : 0;
    const dBonus = game?.character?.hasD && ["ordinary", "risk", "decisive", "legendary"].includes(event?.eventType)
      ? CONFIG.dResolutionBonus
      : 0;
    const firstAwakeningBonus = event?.tags?.includes("haki-awakening") &&
      Number(event?.decisiveStage) === 1 &&
      !String(choice?.id || "").endsWith("-sovereign")
      ? 5
      : 0;
    return Math.max(1, Math.min(100, base - typeDifficulty - stageDifficulty + shopBonus + dBonus + firstAwakeningBonus));
  }

  function getOutcomeTierProbabilities(game = state.game, event = null, choice = null) {
    const score = getEventResolutionScore(game, event, choice);
    const family = ["ordinary", "risk", "decisive", "legendary"].includes(event?.eventType)
      ? (event.eventType === "legendary" ? "risk" : event.eventType)
      : "surprise";
    const curve = OUTCOME_PROBABILITY_CURVES[family];
    const positive = Math.max(0.08, Math.min(0.90, curve.base + score * curve.score));
    const exceptional = positive * Math.max(0.08, Math.min(0.22, (score - 35) / 250));
    const mixed = Math.min(curve.mixed, 1 - positive);
    const negative = Math.max(0, 1 - positive - mixed);
    return {
      score,
      exceptional_success: exceptional,
      success: positive - exceptional,
      mixed,
      failure: negative * (1 - curve.severe),
      severe_failure: negative * curve.severe,
    };
  }

  function calculateOutcomeTier(game = state.game, event = null, choice = null) {
    const probabilities = getOutcomeTierProbabilities(game, event, choice);
    let roll = Math.random();
    let tier = "severe_failure";
    for (const candidate of ["exceptional_success", "success", "mixed", "failure", "severe_failure"]) {
      roll -= probabilities[candidate];
      if (roll <= 0) {
        tier = candidate;
        break;
      }
    }
    if (event?.resolutionCategory === "action" && tier === "severe_failure" && Number(game?.stats?.haki) >= 55) {
      tier = "failure";
    }
    return tier;
  }

  function inferOutcomeTier(outcome = {}) {
    if (OUTCOME_TIER_ORDER.includes(outcome.outcomeTier)) return outcome.outcomeTier;
    const id = String(outcome.id || "").toLowerCase();
    if (/exception|perfect|mastery|triumph/.test(id)) return "exceptional_success";
    if (/success|win|victory|clean|master/.test(id) && !outcome.fallback) return "success";
    if (!outcome.fallback) return "success";
    const negativeImpact = Object.values(outcome.effects || {}).reduce(
      (sum, value) => sum + Math.max(0, -(Number(value) || 0)),
      0,
    );
    return negativeImpact >= 10 ? "severe_failure" : negativeImpact > 0 ? "failure" : "mixed";
  }

  function selectOutcome(choice, game = state.game, event = null) {
    const compatible = getCompatibleOutcomes(choice, game, event);
    const pool = compatible;
    if (!pool.length) {
      const progressStat = event?.resolutionCategory === "social" ? "intelligence" : "health";
      return normalizeOutcome({
        id: "fallback-progress",
        result: "Tu ne maîtrises pas entièrement la situation, mais l’expérience te prépare à la suite.",
        outcomeTier: "mixed",
        effects: { [progressStat]: 1 },
      });
    }
    const targetTier = calculateOutcomeTier(game, event, choice);
    const targetRank = OUTCOME_TIER_ORDER.indexOf(targetTier);
    const closestDistance = Math.min(...pool.map((outcome) =>
      Math.abs(OUTCOME_TIER_ORDER.indexOf(inferOutcomeTier(outcome)) - targetRank)));
    const closest = pool.filter((outcome) =>
      Math.abs(OUTCOME_TIER_ORDER.indexOf(inferOutcomeTier(outcome)) - targetRank) === closestDistance);
    const selected = getWeightedRandomItem(closest, (outcome) =>
      outcome.weight * Math.max(0.05, Number(outcome.chance) || 1)) || closest[0];
    return { ...selected, outcomeTier: inferOutcomeTier(selected), resolvedOutcomeTier: targetTier };
  }

  function getAvailableEvents(game = state.game) {
    if (!game) {
      return [];
    }

    return getAllEvents().filter((event) => {
      return isEventCompatible(event, game);
    });
  }

  function isEventCompatible(event, game = state.game) {
    if (!event || !game) {
      return false;
    }

    const character = game.character;
    const zone = getCurrentZone(game);

    if (
      event.unique &&
      game.seenEvents.includes(event.id)
    ) {
      return false;
    }

    if (
      event.factions.length > 0 &&
      !event.factions.includes(character.faction)
    ) {
      return false;
    }

    if (
      event.zones.length > 0 &&
      !event.zones.includes(zone?.id)
    ) {
      return false;
    }

    if (
      event.zoneTypes.length > 0 &&
      !event.zoneTypes.includes(zone?.type)
    ) {
      return false;
    }

    if (
      event.zoneTags.length > 0 &&
      !event.zoneTags.some((tag) => zone?.tags?.includes(tag))
    ) {
      return false;
    }

    if (
      event.minMonth !== null &&
      game.month < event.minMonth
    ) {
      return false;
    }

    if (
      event.maxMonth !== null &&
      game.month > event.maxMonth
    ) {
      return false;
    }

    if (
      event.months.length > 0 &&
      !event.months.includes(game.month)
    ) {
      return false;
    }

    if (
      event.requiresD !== null &&
      character.hasD !== event.requiresD
    ) {
      return false;
    }

    const hasFruit = Boolean(character.devilFruit);

    if (
      event.requiresFruit !== null &&
      hasFruit !== event.requiresFruit
    ) {
      return false;
    }

    if (
      event.fruitIds.length > 0 &&
      !event.fruitIds.includes(character.devilFruit?.id)
    ) {
      return false;
    }

    if (!checkExactStats(event.requiredStats, game.stats)) {
      return false;
    }

    if (!checkMinimumStats(event.minimumStats, game.stats)) {
      return false;
    }

    if (!checkMaximumStats(event.maximumStats, game.stats)) {
      return false;
    }

    if (!checkRequiredFlags(event.requiredFlags, game.flags)) {
      return false;
    }

    if (
      event.forbiddenFlags.some((flagId) => {
        return Boolean(game.flags[flagId]);
      })
    ) {
      return false;
    }

    if (
      event.requiredEvents.some((eventId) => {
        return !game.seenEvents.includes(eventId);
      })
    ) {
      return false;
    }

    if (
      event.forbiddenEvents.some((eventId) => {
        return game.seenEvents.includes(eventId);
      })
    ) {
      return false;
    }

    if (
      event.requiredTraits.some((traitId) => {
        return !hasTrait(traitId, game);
      })
    ) {
      return false;
    }

    if (
      event.forbiddenTraits.some((traitId) => {
        return hasTrait(traitId, game);
      })
    ) {
      return false;
    }

    if (
      event.requiredCombatStyles.length > 0 &&
      !event.requiredCombatStyles.includes(character.combatStyle)
    ) {
      return false;
    }

    if (event.condition) {
      try {
        if (!event.condition(createEventContext(game, event))) {
          return false;
        }
      } catch (error) {
        console.error(
          `[Blue Legacy] Condition invalide pour "${event.id}".`,
          error,
        );

        return false;
      }
    }

    return true;
  }

  function checkExactStats(requirements, stats) {
    return Object.entries(requirements || {}).every(
      ([rawKey, expected]) => {
        const key = normalizeStatKey(rawKey);
        return Number(stats[key]) === Number(expected);
      },
    );
  }

  function checkMinimumStats(requirements, stats) {
    return Object.entries(requirements || {}).every(
      ([rawKey, minimum]) => {
        const key = normalizeStatKey(rawKey);
        return Number(stats[key]) >= Number(minimum);
      },
    );
  }

  function checkMaximumStats(requirements, stats) {
    return Object.entries(requirements || {}).every(
      ([rawKey, maximum]) => {
        const key = normalizeStatKey(rawKey);
        return Number(stats[key]) <= Number(maximum);
      },
    );
  }

  function checkRequiredFlags(requirements, flags) {
    return Object.entries(requirements || {}).every(
      ([flagId, expected]) => {
        return flags[flagId] === expected;
      },
    );
  }

  function createEventContext(game = state.game, event = null) {
    const zone = getCurrentZone(game);

    return {
      game,
      event,
      character: game?.character || null,
      stats: game?.stats || {},
      flags: game?.flags || {},
      month: game?.month || 1,
      zone,
      zoneId: zone?.id || null,
      zoneName: zone?.name || null,
      zoneTags: zone?.tags || [],
      zoneDifficulty:
        Number(zone?.routeDifficulty) ||
        getZoneIndexForMonth(game?.month) + 1,
      routeIndex:
        Number.isInteger(game?.currentZoneIndex)
          ? game.currentZoneIndex
          : getZoneIndexForMonth(game?.month),
      routeStage:
        Number(zone?.routeStage) ||
        getZoneIndexForMonth(game?.month) + 1,
      route: game?.route || [],
      originSea: game?.character?.origin || null,
      specialZoneId: game?.specialZoneId || null,
      specialZoneRouteIndex:
        Number.isInteger(game?.specialZoneRouteIndex)
          ? game.specialZoneRouteIndex
          : null,
      faction: game?.character?.faction || null,
      hasD: Boolean(game?.character?.hasD),
      hasFruit: Boolean(game?.character?.devilFruit),
      fruit: game?.character?.devilFruit || null,
      combatStyle: game?.character?.combatStyle || null,
      traits: game?.character?.traits || [],

      hasTrait: (traitId) => hasTrait(traitId, game),

      hasSeenEvent: (eventId) => {
        return Boolean(game?.seenEvents?.includes(eventId));
      },

      hasFlag: (flagId) => {
        return Boolean(game?.flags?.[flagId]);
      },

      getStat: (statId) => {
        const key = normalizeStatKey(statId);
        return Number(game?.stats?.[key]) || 0;
      },
    };
  }

  function selectEvent(events = getAvailableEvents()) {
    if (!Array.isArray(events) || events.length === 0) {
      return null;
    }

    const mandatory = events.filter((event) => event.mandatory);
    const source = mandatory.length > 0 ? mandatory : events;

    const highestPriority = Math.max(
      ...source.map((event) => event.priority),
    );

    const priorityPool = source.filter((event) => {
      return event.priority === highestPriority;
    });

    return getWeightedRandomItem(
      priorityPool,
      (event) => event.weight * (event.highStakes ? 1.75 : 1),
    );
  }

  function selectNarrativeEvent(game = state.game) {
    const available = getAvailableEvents(game).filter((event) =>
      ["ordinary", "risk"].includes(event.eventType));
    const lastType = game.flags?.lastNarrativeEventType || game.periodEvents?.at(-1)?.eventType || null;
    if (!available.length) {
      const zone = getCurrentZone(game);
      const lastEventId = game.periodEvents?.at(-1)?.eventId || null;
      const reusable = getAllEvents().filter((event) =>
        ["ordinary", "risk"].includes(event.eventType) &&
        !(lastType === "risk" && event.eventType === "risk") &&
        game.seenEvents.includes(event.id) && event.id !== lastEventId &&
        (!event.factions.length || event.factions.includes(game.character?.faction)) &&
        (!event.zones.length || event.zones.includes(zone?.id)) &&
        (!event.zoneTypes.length || event.zoneTypes.includes(zone?.type)) &&
        (!event.zoneTags.length || event.zoneTags.some((tag) => zone?.tags?.includes(tag))));
      const reused = selectEvent(reusable);
      if (reused) game.flags.lastNarrativeEventType = reused.eventType;
      return reused;
    }
    if (lastType === "risk") {
      const ordinaryAvailable = available.filter((event) => event.eventType === "ordinary");
      let selected = selectEvent(ordinaryAvailable);
      if (!selected) {
        const zone = getCurrentZone(game);
        const lastEventId = game.periodEvents?.at(-1)?.eventId || null;
        const reusableOrdinary = getAllEvents().filter((event) =>
          event.eventType === "ordinary" &&
          game.seenEvents.includes(event.id) && event.id !== lastEventId &&
          (!event.factions.length || event.factions.includes(game.character?.faction)) &&
          (!event.zones.length || event.zones.includes(zone?.id)) &&
          (!event.zoneTypes.length || event.zoneTypes.includes(zone?.type)) &&
          (!event.zoneTags.length || event.zoneTags.some((tag) => zone?.tags?.includes(tag))));
        selected = selectEvent(reusableOrdinary);
      }
      if (selected) game.flags.lastNarrativeEventType = "ordinary";
      return selected;
    }
    const riskChance = Math.min(
      0.26,
      0.10 + (Number(getCurrentZone(game)?.routeStage) || 1) * 0.025,
    );
    const wantedType = Math.random() < riskChance ? "risk" : "ordinary";
    const preferred = available.filter((event) => event.eventType === wantedType);
    const alternate = available.filter((event) => event.eventType !== wantedType);
    const selected = selectEvent(preferred.length ? preferred : alternate);
    if (selected) game.flags.lastNarrativeEventType = selected.eventType;
    return selected;
  }

  function createFallbackEvent() {
    const zone = getCurrentZone();

    return normalizeEvent({
      id: `fallback-${state.game?.month || 1}`,
      title: "Une traversée calme",
      description: zone
        ? `La traversée de ${zone.name} se déroule sans incident majeur.`
        : "La mer reste calme durant cette étape du voyage.",
      unique: false,
      choices: [
        {
          id: "continue",
          text: "Profiter du calme",
          result:
            "Tu profites de cette accalmie pour reprendre des forces.",
          effects: {
            charisma: 2,
          },
        },
      ],
    });
  }

  const SPECIAL_EVENT_ZONE_IDS = Object.freeze([
    "starless-sea",
    "wandering-archipelago",
    "tempest-isle",
  ]);

  function isSpecialZoneEvent(event) {
    return SPECIAL_EVENT_ZONE_IDS.some((zoneId) =>
      event?.zones?.includes(zoneId) && event?.tags?.includes(zoneId),
    );
  }

  function localizeSpecialZoneEvent(event, game = state.game) {
    if (!isSpecialZoneEvent(event)) return event;

    const routeStage = Number(getCurrentZone(game)?.routeStage) ||
      Number(game?.currentZoneIndex) + 1;
    const stageContext = routeStage <= 2
      ? "À ce stade encore précoce de ta route, les groupes locaux ne connaissent pas ta réputation et l’enjeu reste limité à la zone."
      : routeStage <= 4
        ? "Ta réputation commence à précéder ton arrivée, si bien que plusieurs groupes locaux observeront la manière dont tu règles cette crise."
        : "Arrivée tard sur ta route, la crise attire déjà l’attention au-delà de la zone par les rapports transmis sur Escargophone.";

    return {
      ...event,
      description: `${String(event.description || "").trim()} ${stageContext}`.trim(),
    };
  }

  function getOfferWeight(item = {}) {
    return ({ uncommon: 1.35, common: 1.2, rare: 1, epic: 0.55, legendary: 0.16 })[
      normalizeRarity(item.rarity || "rare")
    ] || 1;
  }

  function pickDistinctOffers(catalog = [], excludedIds = []) {
    const excluded = new Set(excludedIds);
    const available = catalog.filter((item) => item?.id && !excluded.has(item.id));
    const first = getWeightedRandomItem(available, getOfferWeight);
    if (!first) return [];
    const differentRole = available.filter((item) =>
      item.id !== first.id &&
      (item.primaryStat || item.role) !== (first.primaryStat || first.role));
    const second = getWeightedRandomItem(differentRole.length
      ? differentRole
      : available.filter((item) => item.id !== first.id), getOfferWeight);
    return second ? [first, second] : [];
  }

  function isRecruitmentEligible(member, game = state.game) {
    const faction = game?.character?.faction;
    const stage = Number(getCurrentZone(game)?.routeStage) || 1;
    const zoneId = getCurrentZone(game)?.id;
    if (member.active === false) return false;
    if (member.allowedFactions?.length && !member.allowedFactions.includes(faction)) return false;
    if (Number(member.minStage) > stage) return false;
    if (Number(member.maxStage) && stage > Number(member.maxStage)) return false;
    if (member.zones?.length && !member.zones.includes(zoneId)) return false;
    if (!checkRequiredFlags(member.requiredFlags || {}, game?.flags || {})) return false;
    if ((member.forbiddenFlags || []).some((flag) => game?.flags?.[flag])) return false;
    return true;
  }

  function createFruitSurpriseEvent(game = state.game) {
    if (!game || game.character?.devilFruit || game.flags.fruitSurpriseTriggered) return null;
    const offers = pickDistinctOffers(window.GAME_DATA?.devilFruits || []);
    if (offers.length !== 2) return null;
    game.flags.fruitSurpriseTriggered = true;
    return normalizeEvent({
      id: `surprise-fruit-${game.id}-${game.month}`,
      title: "Deux pouvoirs sur la même table",
      description: "Dans un coffre abandonné reposent deux Fruits du Démon authentiques. Une fois le sceau brisé, un seul pourra accompagner ta route.",
      eventType: "surprise-fruit",
      resolutionCategory: "social",
      unique: true,
      important: true,
      choices: offers.map((fruit) => ({
        id: `choose-${fruit.id}`,
        text: `Choisir ${fruit.name}`,
        choiceTag: fruit.type,
        hint: fruit.description,
        outcomes: [{
          id: `obtain-${fruit.id}`,
          result: `${fruit.name} devient le pouvoir qui accompagnera désormais ta carrière.`,
          devilFruit: fruit,
          outcomeTier: "success",
          important: true,
        }],
      })),
    });
  }

  function createRecruitmentSurpriseEvent(game = state.game) {
    if (!game) return null;
    const lastMonth = Number(game.flags.lastRecruitmentMonth) || 0;
    if (lastMonth && game.month - lastMonth < 4) return null;
    const catalog = (game.character?.faction === "marine"
      ? window.GAME_DATA?.marineRecruitments || []
      : window.GAME_DATA?.crewRecruitments || [])
      .filter((member) => isRecruitmentEligible(member, game));
    const offers = pickDistinctOffers(catalog, (game.crewMembers || []).map((member) => member.id));
    if (offers.length !== 2) return null;
    game.flags.lastRecruitmentMonth = game.month;
    const marine = game.character?.faction === "marine";
    return normalizeEvent({
      id: `surprise-recruit-${game.id}-${game.month}`,
      title: marine ? "Deux officiers pour la prochaine opération" : "Deux destins croisent ta route",
      description: marine
        ? `Deux officiers répondent au même ordre de renfort à ${getCurrentZone(game)?.name || "cette étape"}. La hiérarchie ne peut détacher qu’un seul soutien.`
        : `Deux alliés potentiels poursuivent un objectif compatible avec le tien à ${getCurrentZone(game)?.name || "cette étape"}. Les circonstances ne permettent d’en accompagner qu’un seul.`,
      eventType: "surprise-recruit",
      resolutionCategory: "social",
      unique: true,
      important: true,
      choices: offers.map((member) => ({
        id: `recruit-${member.id}`,
        text: `Accueillir ${member.name}`,
        choiceTag: `${getRarityLabel(member.rarity)} • ${member.rank || member.role}`,
        hint: `${member.description} ${formatEffectsText(member.permanentEffects)}`,
        outcomes: [{
          id: `joined-${member.id}`,
          result: member.recruitmentText || `${member.name} rejoint ${marine ? "ton unité" : "ton groupe"}${marine && member.rank ? ` avec le grade de ${member.rank}` : ` en tant que ${member.role.toLowerCase()}`}.`,
          crewMember: member,
          outcomeTier: "success",
          important: true,
        }],
      })),
    });
  }

  function selectSurpriseEvent(game = state.game) {
    if (!game || game.currentAction > 0) return null;
    const strawHatActive = game.activeShopItems?.includes("straw-hat");
    if (game.month === 1 && strawHatActive && !game.character?.devilFruit &&
        !game.shopEffects?.strawHatConsumed) {
      const fruitEvent = createFruitSurpriseEvent(game);
      if (fruitEvent) {
        game.shopEffects = {
          ...(game.shopEffects || {}),
          strawHatTriggered: true,
          strawHatConsumed: true,
        };
        game.flags.fruitSurpriseTriggered = true;
        return fruitEvent;
      }
    }
    // Les surprises restent minoritaires : une tentative seulement au début du mois.
    const routeStage = Number(getCurrentZone(game)?.routeStage) || 1;
    const fruitChance = Math.min(0.065, 0.03 + routeStage * 0.006);
    if (!game.character?.devilFruit && !game.flags.fruitSurpriseTriggered && Math.random() < fruitChance) {
      return createFruitSurpriseEvent(game);
    }
    const lastType = game.periodEvents?.at(-1)?.eventType || null;
    const recruitmentMultiplier = game.activeShopItems?.includes("vivre-card")
      ? Number(findShopItem("vivre-card")?.recruitmentWeightMultiplier) || 1.6
      : 1;
    const recruitmentChance = lastType === "surprise-recruit"
      ? 0
      : Math.min(0.16, (0.055 + routeStage * 0.007) * recruitmentMultiplier);
    if (Math.random() < recruitmentChance) return createRecruitmentSurpriseEvent(game);
    return null;
  }

  function startEvent(event = null) {
    const game = state.game;

    if (!game) {
      return false;
    }

    const selected =
      event ||
      selectSurpriseEvent(game) ||
      selectNarrativeEvent(game) ||
      createFallbackEvent();

    const localized = localizeSpecialZoneEvent(selected, game);

    game.currentEvent = localized;
    game.currentEventId = localized.id;
    game.currentChoiceIndex = null;
    game.pendingResult = null;

    state.result = null;

    saveGame();
    openScreen(SCREEN.GAME, { save: false });

    return true;
  }

  function startNextEvent() {
    const game = state.game;

    if (!game) {
      return false;
    }

    // Un second clic sur le bouton de transition ne doit jamais remplacer
    // un événement qui attend encore le choix du joueur.
    if (game.currentEvent) {
      openScreen(SCREEN.GAME);
      return false;
    }

    if (game.flags?.deferredZoneTransitionAfterArc === "marineford" &&
        ["succeeded", "failed", "completed-no-title", "not-selected"].includes(game.legendaryArcs?.marineford?.status)) {
      delete game.flags.deferredZoneTransitionAfterArc;
      return openZoneTransition(getCurrentZone(game), game.currentZoneIndex, "zone-change");
    }

    if (game.currentAction >= game.actionsThisMonth) {
      return finishMonth();
    }

    if (maybeStartLegendaryArc(game)) return true;

    return startEvent();
  }

  /* ========================================================
     CYCLE MENSUEL
  ======================================================== */

  function getActionsForMonth(game = state.game) {
    const configured =
      window.SEA_OF_LEGENDS_CONFIG?.actionsPerMonth;

    if (typeof configured === "function") {
      try {
        const value = Number(
          configured(createEventContext(game)),
        );

        if (Number.isFinite(value)) {
          return Math.max(1, Math.round(value));
        }
      } catch (error) {
        console.error(
          "[Blue Legacy] Calcul des actions mensuelles impossible.",
          error,
        );
      }
    }

    if (Number.isFinite(Number(configured))) {
      return Math.max(1, Math.round(Number(configured)));
    }

    return CONFIG.actionsPerMonth;
  }

  function startMonth() {
    const game = state.game;

    if (!game || game.isFinished || game.ending) {
      return false;
    }

    if (game.month > CONFIG.maxMonths) {
      return finishAdventure({
        type: "retirement",
        destiny:
          "Après deux années d’aventure, ton voyage atteint son terme.",
        title: "Vétéran des mers",
        success: false,
      });
    }

    const automaticEnding = checkRunEndingConditions(game);
    if (automaticEnding) return finishAdventure(automaticEnding);

    game.actionsThisMonth = getActionsForMonth(game);
    game.currentAction = Math.max(
      0,
      Number(game.currentAction) || 0,
    );

    if (game.currentEvent) {
      openScreen(SCREEN.GAME);
      return true;
    }

    return startNextEvent();
  }

  function finishEvent() {
    const game = state.game;

    if (!game) {
      return false;
    }

    const completedEvent = game.currentEvent;
    const completedBoss = completedEvent?.eventType === "decisive";
    const legendaryArcId = completedEvent?.legendaryArc || null;
    const legendaryStep = Number(completedEvent?.legendaryStep) || 0;
    game.currentEvent = null;
    game.currentEventId = null;
    game.currentChoiceIndex = null;
    game.pendingResult = null;
    if (!legendaryArcId) game.currentAction += 1;

    state.result = null;

    saveGame();

    if (["haki-conclusion", "dream-failure-conclusion"].includes(
      game.pendingZoneTransition?.reason,
    )) {
      openScreen(SCREEN.ZONE_TRANSITION, { save: false });
      return true;
    }

    if (legendaryArcId) {
      const arc = game.legendaryArcs?.[legendaryArcId];
      if (legendaryStep < 3 && arc) {
        arc.step = legendaryStep + 1;
        const nextEvent = getLegendaryArcEvent(legendaryArcId, arc.step, game);
        if (nextEvent) {
          game.currentEvent = nextEvent;
          game.currentEventId = nextEvent.id;
          saveGame();
          openScreen(SCREEN.GAME, { save: false });
          return true;
        }
      }
      const earnedLegendaryTitle = finalizeLegendaryArc(legendaryArcId, game);
      if (!earnedLegendaryTitle && queueLegendaryConclusion(legendaryArcId, game)) {
        saveGame();
        openScreen(SCREEN.ZONE_TRANSITION, { save: false });
        return true;
      }
      saveGame();
      return startNextEvent();
    }

    const automaticEnding = checkRunEndingConditions(game);
    if (automaticEnding && !completedBoss) return finishAdventure(automaticEnding);

    if (game.currentAction >= game.actionsThisMonth) {
      return finishMonth({ deferEndingUntilLogbook: completedBoss });
    }

    return startNextEvent();
  }

  function finishMonth(options = {}) {
    const game = state.game;

    if (!game) {
      return false;
    }

    const finishedMonth = game.month;
    const bossTier = getBossTierForFinishedMonth(finishedMonth);

    if (bossTier === 3) {
      const emperor = game.legendaryArcs?.emperor;
      if (emperor?.status === "unassessed") evaluateLegendaryArc("emperor", game);
      if (["selected", "in-progress"].includes(emperor?.status) && startLegendaryArc("emperor", game)) {
        return true;
      }
    }

    if (
      bossTier &&
      !game.bossProgress.completedTiers.includes(bossTier) &&
      startBossEvent(bossTier, game)
    ) {
      return true;
    }

    game.currentEvent = null;
    game.currentEventId = null;
    game.currentChoiceIndex = null;
    game.pendingResult = null;
    game.currentAction = 0;
    game.month += 1;

    const automaticEnding = checkRunEndingConditions(game);
    if (automaticEnding && !options.deferEndingUntilLogbook) {
      return finishAdventure(automaticEnding);
    }

    if (
      finishedMonth % CONFIG.logbookInterval === 0
    ) {
      return openLogbook(finishedMonth);
    }

    if (automaticEnding) return finishAdventure(automaticEnding);

    if (game.month > CONFIG.maxMonths) {
      return finishAdventure({
        type: "retirement",
        destiny:
          "Après deux années d’aventure, ton voyage atteint son terme.",
        title: "Vétéran des mers",
        success: false,
      });
    }

    saveGame();

    return startMonth();
  }

  /* ========================================================
     RÉSOLUTION DES CHOIX
  ======================================================== */

  function debugResolution(stage, details = {}) {
    if (!RESOLUTION_DEBUG) return;
    console.debug(`[Blue Legacy][Resolution][${stage}]`, details);
  }

  function assertResolutionIntegrity(game, resolutionId) {
    if (!RESOLUTION_DEBUG || !game || !resolutionId) return;
    const effectApplications = (game.appliedResolutionIds || [])
      .filter((id) => id === resolutionId).length;
    const outcomeSlides = game.pendingResult?.resolutionId === resolutionId ? 1 : 0;
    const journalEntries = (game.periodEvents || [])
      .filter((entry) => entry.resolutionId === resolutionId).length;
    console.assert(effectApplications === 1, "Une résolution doit appliquer ses effets exactement une fois.", {
      resolutionId,
      effectApplications,
    });
    console.assert(outcomeSlides <= 1, "Une résolution ne peut produire qu’une slide de conséquence.", {
      resolutionId,
      outcomeSlides,
    });
    console.assert(journalEntries === 1, "Une résolution doit produire une seule entrée d’événement.", {
      resolutionId,
      journalEntries,
    });
  }

  function resolveChoice(choiceIndex) {
    const game = state.game;
    const event = game?.currentEvent;
    const choice = event?.choices?.[Number(choiceIndex)];

    if (!game || !event || !choice) {
      return false;
    }

    if (
      state.isResolvingEvent ||
      game.pendingResult ||
      game.currentChoiceIndex !== null
    ) {
      return false;
    }

    state.isResolvingEvent = true;
    dom.eventChoices
      ?.querySelectorAll("[data-event-choice-index]")
      .forEach((button) => {
        button.disabled = true;
      });

    if (choice.condition) {
      try {
        if (!choice.condition(createEventContext(game, event))) {
          state.isResolvingEvent = false;
          updateGameScreen();
          return false;
        }
      } catch (error) {
        console.error(
          `[Blue Legacy] Condition invalide pour le choix "${choice.id}".`,
          error,
        );

        state.isResolvingEvent = false;
        updateGameScreen();
        return false;
      }
    }

    game.resolutionSequence = Math.max(0, Number(game.resolutionSequence) || 0) + 1;
    const resolutionId = `${game.id || "adventure"}:resolution:${game.resolutionSequence}`;
    debugResolution("start", {
      resolutionId,
      eventId: event.id,
      choiceId: choice.id,
      outcomeQueueBefore: game.pendingResult ? 1 : 0,
      rewardQueueBefore: game.pendingRewardReveals?.length || 0,
      screen: state.screen,
      isResolving: state.isResolvingEvent,
    });

    const outcome = secureHakiOutcomeCoherence(
      secureHakiDecisiveOutcome(
        secureFinalDreamOutcome(selectOutcome(choice, game, event), event, game),
        event,
        game,
      ),
      choice,
      event,
      game,
    );
    if (event.legendaryArc && event.legendaryStep === 3 &&
        ["success", "exceptional_success"].includes(outcome.resolvedOutcomeTier || outcome.outcomeTier)) {
      const arcId = event.legendaryArc;
      const priorSuccesses = [1, 2].filter((step) => game.flags?.[`legendary_${arcId}_${step}_success`]).length;
      const priorFailures = [1, 2].filter((step) => game.flags?.[`legendary_${arcId}_${step}_failure`]).length;
      if (priorSuccesses >= 1 && priorFailures === 0) {
        const titleId = getLegendaryArcTitleId(arcId, game);
        if (titleId) outcome.titles = uniqueArray([...(outcome.titles || []), titleId]);
      }
    }
    const outcomeNarrative = getOutcomeNarrative(outcome, choice, event);
    const statsBefore = getStatsSnapshot(game.stats);
    const flagsBefore = { ...game.flags };
    applyStatChanges(
      getDifficultyAdjustedEffects(
        getNarrativelyCoherentEffects(event, outcome),
        game,
      ),
      game.stats,
      {
        game,
        source: event.eventType === "decisive" ? "decisive" : "event",
        major: Boolean(event.important || outcome.important),
        routeStage: Number(getCurrentZone(game)?.routeStage) || 1,
        ignoreDiminishingReturns: Boolean(outcome.ignoreDiminishingReturns),
      },
    );
    applyChoiceFlags(outcome, game, { event });
    if (
      (outcome.resolvedOutcomeTier || outcome.outcomeTier) === "severe_failure" ||
      outcome.criticalFailure === true
    ) {
      game.flags.criticalFailures = (Number(game.flags.criticalFailures) || 0) + 1;
    }
    const rewards = applyOutcomeMajorRewards(outcome, game);
    queueRewardReveals(rewards, game, { resolutionId, eventId: event.id });
    queueHakiFailureConclusion(event, outcome, rewards, resolutionId, game);

    const dreamProgress = getOutcomeDreamProgress(outcome, game);
    if (dreamProgress) {
      game.flags.dreamProgress =
        (Number(game.flags.dreamProgress) || 0) +
        dreamProgress;
    }

    if (event.eventType === "decisive" && event.decisiveStage) {
      const tier = Number(event.decisiveStage);
      if (!game.bossProgress.completedTiers.includes(tier)) {
        game.bossProgress.completedTiers.push(tier);
      }
      game.bossProgress.activeBossId = null;
      if (tier === 3) {
        game.bossProgress.finalOutcome = {
          bossId: event.id,
          bossTitle: event.title,
          choiceId: choice.id,
          choiceText: choice.text,
          outcomeId: outcome.id,
          result: outcomeNarrative,
          dreamCompleted: isFinalDreamSuccess(outcome, event, game),
          dreamId: game.character?.dream || null,
          factionId: game.character?.faction || null,
          survived: Number(game.stats.health) > 0,
        };
      }
    }

    game.currentChoiceIndex = Number(choiceIndex);

    markEventAsSeen(event, game);
    const catalogTitleIds = rewards.some((reward) => reward.type === "title")
      ? []
      : checkCatalogTitles(game, 1);
    catalogTitleIds.forEach((titleId) => {
      const title = game.runTitles.find((item) => getDataId(item) === titleId);
      if (!title) return;
      const record = { type: "title", text: `Titre obtenu : ${title.name}`, data: cloneData(title) };
      rewards.push(record);
      queueRewardReveal(record, game, { resolutionId, eventId: event.id });
    });
    refreshPopularityScore(game);
    queueFinalDreamFailureConclusion(event, resolutionId, game);

    const statsAfter = getStatsSnapshot(game.stats);
    const statChanges = getStatsDifference(
      statsBefore,
      statsAfter,
    );

    const eventRecord = {
      id: createUniqueId("event-record"),
      resolutionId,
      eventId: event.id,
      title: event.title,
      description: event.description,
      choiceId: choice.id,
      choiceText: choice.text,
      outcomeId: outcome.id,
      outcomeResult: outcomeNarrative,
      result: outcomeNarrative,
      month: game.month,
      zoneId: getCurrentZone(game)?.id || null,
      zoneName: getCurrentZone(game)?.name || null,
      effects: cloneData(statChanges),
      rewards: cloneData(rewards),
      flagChanges: Object.fromEntries(
        Object.entries(game.flags).filter(
          ([flagId, value]) => flagsBefore[flagId] !== value,
        ),
      ),
      important: Boolean(
        event.important ||
        outcome.important,
      ),
      rarity: event.rarity,
      highStakes: Boolean(event.highStakes),
      tags: cloneData(event.tags),
      legendaryArc: event.legendaryArc || null,
      legendaryStep: event.legendaryStep || null,
      emperorId: event.emperorId || null,
      decisiveStage: event.decisiveStage || null,
      eventType: event.eventType,
      resolutionCategory: event.resolutionCategory,
      outcomeTier: outcome.resolvedOutcomeTier || outcome.outcomeTier,
      loreCharacters: cloneData(event.loreCharacters || []),
      dreamProgress,
      newsPriority: getEventNewsPriority({
        ...event,
        effects: statChanges,
        rewards,
        flagChanges: Object.fromEntries(
          Object.entries(game.flags).filter(
            ([flagId, value]) => flagsBefore[flagId] !== value,
          ),
        ),
      }),
      createdAt: new Date().toISOString(),
    };

    game.periodEvents.push(eventRecord);

    if (eventRecord.important) {
      game.importantEvents.push(cloneData(eventRecord));
    }

    updateAchievementTelemetry(event, choice, game, outcome);
    checkAchievements(game);

    game.pendingResult = {
      resolutionId,
      eventId: event.id,
      eventTitle: event.title,
      choiceId: choice.id,
      choiceText: choice.text,
      outcomeId: outcome.id,
      description:
        outcomeNarrative,
      statChanges,
      rewards,
      important: eventRecord.important,
      ending: outcome.ending || null,
      effectsApplied: true,
      resultConsumed: false,
    };

    game.appliedResolutionIds = uniqueArray([
      ...(game.appliedResolutionIds || []),
      resolutionId,
    ]).slice(-100);
    assertResolutionIntegrity(game, resolutionId);
    debugResolution("committed", {
      resolutionId,
      eventId: event.id,
      choiceId: choice.id,
      outcomeId: outcome.id,
      outcomeQueueAfter: 1,
      rewardQueueAfter: game.pendingRewardReveals?.length || 0,
      screen: SCREEN.RESULT,
      isResolving: state.isResolvingEvent,
    });

    state.result = cloneData(game.pendingResult);

    saveGame();

    if (outcome.ending) {
      state.isResolvingEvent = false;
      return finishAdventure(
        normalizeEndingData(outcome.ending),
      );
    }

    openScreen(SCREEN.RESULT, { save: false });
    state.isResolvingEvent = false;

    return true;
  }

  function getOutcomeNarrative(outcome, choice, event) {
    const configured = String(outcome?.result || "").trim();
    const category = event?.resolutionCategory === "social" ? "social" : "action";
    const tier = outcome?.resolvedOutcomeTier || outcome?.outcomeTier || inferOutcomeTier(outcome);
    if (!configured) return SHORT_OUTCOME_PHRASES[category][tier];
    const cleaned = configured
      .replace(/^Tu mets (?:ton choix|en œuvre)[^.!?]*[.!?]\s*/i, "")
      .replace(/^Tu (?:choisis|tentes) de «[^»]+»[,.]?\s*/i, "")
      .replace(/^À [^,]+, tu (?:choisis|tentes) de «[^»]+»[,.]?\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
    const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
    return sentences.slice(0, 3).join(" ").trim();
  }

  function getDifficultyAdjustedEffects(effects = {}, game = state.game) {
    // La difficulté des zones agit sur les probabilités. Elle ne double plus
    // discrètement les pertes déjà écrites dans l'issue.
    return { ...effects };
  }

  function getNarrativelyCoherentEffects(event = {}, outcome = {}) {
    const effects = { ...(outcome.effects || {}) };
    const narrative = `${event.title || ""} ${event.description || ""} ${outcome.result || ""}`;
    const physical = /bless|coup|chute|brûl|poison|impact|explosion|tir|feu|tempête|foudre|attaque|combat|assaut|noy|écras|fatigue|épuis/i;
    if (event.resolutionCategory === "social" && Number(effects.health) < 0 && !physical.test(narrative)) {
      effects.charisma = Math.min(-1, Number(effects.charisma) || -1);
      delete effects.health;
    }
    const positiveRules = {
      intelligence: /analys|compr|indice|enqu|plan|strat|information|archive|découvr|apprend|observation/i,
      combat: /combat|attaque|affront|duel|entraîn|arme|bataille|assaut|frappe/i,
      fortune: /berry|argent|trésor|contrat|prime|cargaison|commerce|réserve|réparation|paiement|économie/i,
      charisma: /convain|ralli|command|impression|rassur|discours|autorité|négoci|témoin|foule|accord/i,
      haki: /fluide|haki|pression|volonté|résist|défend|protège|anticip|présence|endure/i,
      bounty: /public|témoin|journal|rapport|marine|gouvernement|réputation|autorité|contrat|prime/i,
    };
    Object.entries(positiveRules).forEach(([statId, rule]) => {
      if (Number(effects[statId]) > 0 && !rule.test(narrative)) {
        // Le validateur signale la discordance, mais l'effet n'est plus effacé
        // silencieusement au moment où le joueur reçoit son résultat.
      }
    });
    return effects;
  }

  function applyChoiceFlags(choice, game, { event = game?.currentEvent } = {}) {
    const firstDecisiveWasCompleted = game.flags.completedDecisiveStage1 === true;
    Object.entries(choice.flags || {}).forEach(
      ([flagId, value]) => {
        if (flagId === "firstDecisiveHakiType") {
          if (firstDecisiveWasCompleted || Number(event?.decisiveStage) !== 1) {
            console.error("[Blue Legacy] Réécriture interdite de l’historique du premier décisif Haki.", {
              attemptedValue: value,
              eventId: event?.id,
            });
            return;
          }
          if (!FIRST_DECISIVE_HAKI_TYPES.includes(value)) value = "none";
        }
        game.flags[flagId] = value;
      },
    );

    choice.removeFlags.forEach((flagId) => {
      delete game.flags[flagId];
    });
  }

  function applyOutcomeMajorRewards(outcome, game) {
    const applied = [];
    let remaining = outcome.allowMultipleMajorRewards
      ? Number.POSITIVE_INFINITY
      : outcome.maxMajorRewards;
    const record = (reward) => {
      if (!reward || remaining <= 0) return false;
      applied.push(reward);
      remaining -= 1;
      return true;
    };

    if (remaining > 0 && outcome.devilFruit &&
        grantDevilFruit(outcome.devilFruit, game, false)) {
      record({
        type: "devilFruit",
        text: `Fruit du Démon : ${game.character.devilFruit.name}`,
        data: cloneData(game.character.devilFruit),
      });
    }

    if (remaining > 0 && outcome.crewMember &&
        recruitCrewMember(outcome.crewMember, game, false)) {
      const member = game.crewMembers.find((item) => item.id === outcome.crewMember.id);
      record({
        type: "crewMember",
        text: `${member.role} recruté : ${member.name}`,
        data: cloneData(member),
      });
    }

    if (remaining > 0 && outcome.combatStyle) {
      const change = setCombatStyle(
        outcome.combatStyle, game, false, outcome.replaceCombatStyle,
      );
      if (change) {
        record({
          type: "combatStyle",
          data: {
            name: change.style,
            description: outcome.combatStyleDescription || "",
            important: Boolean(outcome.importantReward),
          },
          text: change.replaced
            ? `Style remplacé : ${change.replaced} → ${change.style}`
            : `Style obtenu : ${change.style}`,
        });
      }
    }

    const newTraits = outcome.addTraits.filter((traitId) => !hasTrait(traitId, game));
    const traits = outcome.allowMultipleTraits
      ? newTraits
      : newTraits.slice(0, 1);
    for (const traitId of traits) {
      if (remaining <= 0) break;
      if (addTrait(traitId, game, false)) {
        record({ type: "trait", text: `Nouveau trait : ${traitId}` });
      }
    }

    const protectedTitles = (outcome.titles || []).map((title) => {
      const id = getDataId(title);
      if (id !== "maitrise-haki-des-rois-plus" ||
          getFirstDecisiveHakiType(game) === "conquerors") return title;
      console.error("[Blue Legacy] Récompense Maîtrise+ interdite par l’historique du premier décisif.", {
        outcomeId: outcome.id,
        firstDecisiveHakiType: getFirstDecisiveHakiType(game),
      });
      return isSecondDecisiveHakiEvent(game.currentEvent)
        ? "haki-des-rois"
        : null;
    }).filter(Boolean);
    const newTitles = protectedTitles.filter((title) =>
      !game.runTitles.some((current) => getDataId(current) === getDataId(title)),
    );
    const titles = outcome.allowMultipleTitles
      ? newTitles
      : newTitles.slice(0, 1);
    for (const titleData of titles) {
      if (remaining <= 0) break;
      const id = getDataId(titleData);
      if (unlockTitle(id, titleData, game, false)) {
        const title = game.runTitles.find((item) => getDataId(item) === id);
        record({
          type: "title",
          text: `Titre obtenu : ${title?.name || id}`,
          data: cloneData(title),
        });
      }
    }

    if (remaining > 0 && outcome.achievement) {
      const id = getDataId(outcome.achievement);
      if (unlockAchievement(id, game, false)) {
        const data = findAchievementData(id);
        record({
          type: "achievement",
          text: `Succès obtenu : ${data?.label || data?.name || id}`,
          data: cloneData(data || outcome.achievement),
        });
      }
    }

    for (const rewardData of outcome.rewards) {
      if (remaining <= 0) break;
      if (grantReward(rewardData, game, false)) {
        const reward = normalizeReward(rewardData);
        record({
          type: reward.type || "reward",
          text: reward.text,
          data: reward,
        });
      }
    }
    return applied;
  }

  function buildChoiceRewards(choice) {
    const rewards = [];

    choice.addTraits.forEach((traitId) => {
      rewards.push({
        type: "trait",
        text: `Nouveau trait : ${traitId}`,
      });
    });

    if (choice.combatStyle) {
      rewards.push({
        type: "combatStyle",
        text: `Style obtenu : ${choice.combatStyle}`,
      });
    }

    if (choice.devilFruit) {
      const fruit = normalizeDevilFruit(choice.devilFruit);

      rewards.push({
        type: "devilFruit",
        text: `Fruit du Démon : ${fruit.name}`,
      });
    }

    if (choice.title) {
      const title = normalizeTitleData(
        getDataId(choice.title),
        choice.title,
      );

      rewards.push({
        type: "title",
        text: `Titre obtenu : ${title.name}`,
      });
    }

    if (choice.achievement) {
      rewards.push({
        type: "achievement",
        text: "Nouveau succès obtenu",
      });
    }

    if (choice.reward) {
      const reward = normalizeReward(choice.reward);

      rewards.push({
        type: "reward",
        text: reward.text,
      });
    }

    return rewards;
  }

  function markEventAsSeen(event, game = state.game) {
    if (!event || !game) {
      return;
    }

    if (!game.seenEvents.includes(event.id)) {
      game.seenEvents.push(event.id);
    }

    game.recentEvents.push(event.id);

    game.recentEvents = game.recentEvents.slice(
      -CONFIG.recentEventLimit,
    );
  }

  function updateAchievementTelemetry(event, choice, game = state.game, outcome = null) {
    if (!game) return;
    const progress = game.achievementProgress ||= {
      dangerEventsSurvived: 0,
      rareEventsResolved: 0,
      callbacksResolved: 0,
      highStakesEventsResolved: 0,
      noReturnChoices: 0,
      exceptionalOutcomes: 0,
      actionSuccesses: 0,
      socialSuccesses: 0,
      maxStats: {},
    };
    progress.maxStats ||= {};
    Object.keys(STATS).forEach((statId) => {
      progress.maxStats[statId] = Math.max(
        Number(progress.maxStats[statId]) || 0,
        Number(game.stats?.[statId]) || 0,
      );
    });
    if (event?.eventType === "risk") progress.dangerEventsSurvived += 1;
    if (event?.highStakes) progress.highStakesEventsResolved += 1;
    if (["rare", "veryRare"].includes(event?.rarity)) progress.rareEventsResolved += 1;
    if (event?.tags?.includes("callback")) progress.callbacksResolved += 1;
    if (choice?.choiceTag === "Sans retour") progress.noReturnChoices += 1;
    const tier = outcome?.resolvedOutcomeTier || outcome?.outcomeTier || inferOutcomeTier(outcome || {});
    if (tier === "exceptional_success") progress.exceptionalOutcomes += 1;
    if (["success", "exceptional_success"].includes(tier)) {
      if (event?.resolutionCategory === "social") progress.socialSuccesses += 1;
      if (event?.resolutionCategory === "action") progress.actionSuccesses += 1;
    }
  }

  function continueAfterResult() {
    const game = state.game;
    const result = game?.pendingResult;
    if (
      !game ||
      !result ||
      result.resultConsumed ||
      state.isContinuingResult ||
      state.screen !== SCREEN.RESULT
    ) {
      return false;
    }

    state.isContinuingResult = true;
    if (dom.continueResult) dom.continueResult.disabled = true;
    result.resultConsumed = true;
    if (result.resolutionId) {
      game.consumedResolutionIds = uniqueArray([
        ...(game.consumedResolutionIds || []),
        result.resolutionId,
      ]).slice(-100);
      game.pendingRewardReveals = (game.pendingRewardReveals || []).filter(
        (reward) => reward.sourceResolutionId === result.resolutionId,
      );
    }
    state.result = null;
    game.pendingResult = null;

    if (game.pendingRewardReveals?.length) {
      openScreen(SCREEN.REWARD_REVEAL);
      state.isContinuingResult = false;
      return true;
    }

    const continued = finishEvent();
    state.isContinuingResult = false;
    return continued;
  }

  function normalizeEndingData(ending) {
    if (typeof ending === "string") {
      return {
        type: ending,
        destiny: ending,
        title: null,
        success: false,
        dreamCompleted: false,
      };
    }

    return {
      type: ending?.type || "other",
      destiny:
        ending?.destiny ||
        ending?.text ||
        "Ton aventure prend fin.",
      title: ending?.title || null,
      success: Boolean(ending?.success),
      dreamCompleted: Boolean(ending?.dreamCompleted),
    };
  }

  /* ========================================================
     JOURNAL DE BORD
  ======================================================== */

  function openLogbook(
    finishedMonth = state.game?.month - 1,
  ) {
    const game = state.game;

    if (!game) {
      return false;
    }

    const periodNumber = Math.ceil(
      finishedMonth / CONFIG.logbookInterval,
    );

    if (
      game.completedLogbookPeriods.includes(periodNumber)
    ) {
      openScreen(SCREEN.LOGBOOK);
      return true;
    }

    const entry = buildLogbookEntry(finishedMonth);

    game.pendingLogbookEntry = entry;
    game.journal.push(entry);
    game.completedLogbookPeriods.push(periodNumber);
    game.lastLogbookMonth = finishedMonth;
    game.periodEvents = [];
    game.periodStartStats = getStatsSnapshot(game.stats);

    moveToNextZone();
    openScreen(SCREEN.LOGBOOK, { save: false });
    saveGame();

    return true;
  }

  function limitLogbookText(text, maximumWords = 100) {
    const words = String(text || "").trim().split(/\s+/).filter(Boolean);
    return words.length <= maximumWords
      ? words.join(" ")
      : `${words.slice(0, maximumWords).join(" ").replace(/[,:;]$/, "")}…`;
  }

  const WORLD_NEWS_CATALOG = Object.freeze([
    { id: "world-1-marine-routes", stages: [1], icon: "⚓", type: "marine", text: "La Marine renforce ses patrouilles sur les routes commerciales des quatre mers après plusieurs disparitions de convois." },
    { id: "world-1-bounty-posters", stages: [1], icon: "💰", type: "economy", text: "Le Journal de l’économie mondiale signale une circulation inhabituelle de nouvelles affiches de recherche dans les ports régionaux." },
    { id: "world-1-revolution-leaflets", stages: [1], icon: "✊", type: "revolution", text: "Des tracts révolutionnaires apparaissent dans plusieurs royaumes affiliés au Gouvernement mondial, malgré les saisies répétées." },
    { id: "world-1-reverse-mountain", stages: [1], icon: "🏴‍☠️", type: "piracy", text: "Plusieurs équipages pirates convergent vers Reverse Mountain ; les autorités des mers de départ redoutent une nouvelle vague de départs." },
    { id: "world-1-morgans-rumors", stages: [1], icon: "📰", type: "world", text: "Morgans promet une édition consacrée aux nouvelles figures capables de bouleverser l’équilibre des mers." },

    { id: "world-2-crocus-passage", stages: [2], icon: "🧭", type: "world", text: "Des navigateurs affirment que les courants autour de Reverse Mountain deviennent plus difficiles à prévoir pour les nouveaux équipages." },
    { id: "world-2-supernova-rumors", stages: [2], icon: "🌍", type: "world", text: "Une rumeur persistante évoque de nouveaux équipages assez audacieux pour attirer l’attention des Supernovas." },
    { id: "world-2-government-inspections", stages: [2], icon: "⚠️", type: "crisis", text: "Le Gouvernement mondial ordonne des inspections supplémentaires sur plusieurs voies d’accès à Grand Line." },
    { id: "world-2-revolution-couriers", stages: [2], icon: "✊", type: "revolution", text: "Des courriers clandestins liés à l’Armée révolutionnaire auraient franchi les barrages installés près de Grand Line." },
    { id: "world-2-marine-logposes", stages: [2], icon: "⚓", type: "marine", text: "La Marine met en garde les navires civils contre un trafic de Log Poses falsifiés visant les voyageurs inexpérimentés." },

    { id: "world-3-fujitora-justice", stages: [3], icon: "⚓", type: "marine", text: "Fujitora réclame de nouveaux rapports sur la protection des civils pendant les opérations de la Marine dans Paradise.", loreCharacters: ["Fujitora"] },
    { id: "world-3-cipher-pol-archives", stages: [3], icon: "⚠️", type: "crisis", text: "Cipher Pol intensifie sa recherche d’archives interdites après la disparition de plusieurs documents gouvernementaux." },
    { id: "world-3-law-sighting", stages: [3], icon: "🏴‍☠️", type: "piracy", text: "Selon plusieurs témoins, le sous-marin de Trafalgar Law aurait été aperçu près d’une route rarement empruntée de Paradise.", loreCharacters: ["Trafalgar Law"] },
    { id: "world-3-sabo-message", stages: [3], icon: "✊", type: "revolution", text: "Un message attribué à Sabo circule parmi les royaumes où la contestation du Gouvernement mondial progresse.", loreCharacters: ["Sabo"] },
    { id: "world-3-buggy-recruits", stages: [3], icon: "💰", type: "economy", text: "Les réseaux associés à Buggy recrutent de nouveaux combattants, tandis que Cross Guild étend son influence.", loreCharacters: ["Buggy"] },

    { id: "world-4-cross-guild-bounties", stages: [4], icon: "💰", type: "economy", text: "Cross Guild diffuse de nouvelles récompenses visant des officiers de la Marine, provoquant des tensions dans plusieurs bases." },
    { id: "world-4-sakazuki-orders", stages: [4], icon: "⚓", type: "marine", text: "Sakazuki exige un contrôle renforcé des routes stratégiques après une succession d’incidents impliquant pirates et contrebandiers.", loreCharacters: ["Sakazuki"] },
    { id: "world-4-koala-liberations", stages: [4], icon: "✊", type: "revolution", text: "Koala aurait coordonné l’évacuation de prisonniers dans un royaume affilié au Gouvernement mondial.", loreCharacters: ["Koala"] },
    { id: "world-4-mihawk-sighting", stages: [4], icon: "🏴‍☠️", type: "piracy", text: "Un navire transportant Mihawk aurait été aperçu loin des routes habituelles de Cross Guild.", loreCharacters: ["Mihawk"] },
    { id: "world-4-government-kingdoms", stages: [4], icon: "🌍", type: "world", text: "Plusieurs royaumes demandent au Gouvernement mondial davantage de protection face à l’instabilité grandissante de Grand Line." },

    { id: "world-5-shanks-ship", stages: [5], icon: "🏴‍☠️", type: "piracy", text: "Un navire lié à l’équipage du Roux aurait été aperçu au large d’une île disputée du Nouveau Monde.", loreCharacters: ["Shanks"] },
    { id: "world-5-blackbeard-movements", stages: [5], icon: "⚠️", type: "crisis", text: "Des mouvements attribués à l’équipage de Barbe Noire inquiètent plusieurs territoires du Nouveau Monde.", loreCharacters: ["Barbe Noire"] },
    { id: "world-5-crocodile-markets", stages: [5], icon: "💰", type: "economy", text: "Des courtiers affirment que Crocodile s’intéresse à plusieurs marchés clandestins récemment déstabilisés.", loreCharacters: ["Crocodile"] },
    { id: "world-5-dragon-cells", stages: [5], icon: "✊", type: "revolution", text: "Des cellules rattachées à Dragon multiplient les déplacements entre des royaumes sous forte surveillance.", loreCharacters: ["Dragon"] },
    { id: "world-5-koby-officers", stages: [5], icon: "⚓", type: "marine", text: "De jeunes officiers citent Koby lorsqu’ils réclament des opérations donnant la priorité au sauvetage des populations.", loreCharacters: ["Koby"] },

    { id: "world-6-emperor-territories", stages: [6], icon: "👑", type: "major", text: "Des territoires du Nouveau Monde réévaluent leurs alliances face aux mouvements récents des équipages d’Empereurs." },
    { id: "world-6-cross-guild-expansion", stages: [6], icon: "💰", type: "economy", text: "Les activités de Cross Guild modifient l’équilibre entre chasseurs, pirates et officiers jusque dans les ports les plus reculés." },
    { id: "world-6-sakazuki-fleets", stages: [6], icon: "⚓", type: "marine", text: "Sakazuki redéploie plusieurs forces de la Marine alors que les crises du Nouveau Monde gagnent en intensité.", loreCharacters: ["Sakazuki"] },
    { id: "world-6-sabo-uprisings", stages: [6], icon: "✊", type: "revolution", text: "Le nom de Sabo accompagne désormais plusieurs soulèvements dont les conséquences dépassent les frontières d’un seul royaume.", loreCharacters: ["Sabo"] },
    { id: "world-6-morgans-presses", stages: [6], icon: "📰", type: "world", text: "Morgans mobilise ses presses pour une édition consacrée aux événements capables de redessiner l’équilibre mondial.", loreCharacters: ["Morgans"] },
  ]);

  function validateWorldNewsCatalog(catalog = WORLD_NEWS_CATALOG) {
    const warnings = [];
    const ids = new Set();
    const officialCharacters = new Set([
      "Fujitora", "Trafalgar Law", "Sabo", "Buggy", "Sakazuki", "Koala",
      "Mihawk", "Shanks", "Barbe Noire", "Crocodile", "Dragon", "Koby", "Morgans",
    ]);
    catalog.forEach((item) => {
      if (!item.id || !item.text) warnings.push("nouvelle mondiale incomplète");
      if (ids.has(item.id)) warnings.push(`identifiant mondial dupliqué : ${item.id}`);
      ids.add(item.id);
      if (!item.stages?.length || item.stages.some((stage) => stage < 1 || stage > 6)) {
        warnings.push(`progression incompatible : ${item.id}`);
      }
      (item.loreCharacters || []).forEach((name) => {
        if (!officialCharacters.has(name)) warnings.push(`personnage non confirmé : ${item.id}/${name}`);
      });
    });
    if (warnings.length) console.warn("[Blue Legacy] Validation des nouvelles mondiales :", warnings);
  }

  validateWorldNewsCatalog();

  function normalizeStoredBigNews(news) {
    if (!Array.isArray(news)) return [];
    return news
      .filter((item) => item && typeof item === "object")
      .map((item, index) => ({
        id: String(item.id || `archived-news-${index + 1}`),
        type: String(item.type || "archive"),
        icon: String(item.icon || "📰"),
        label: String(item.label || (item.type === "player" ? "Ta légende" : "Le monde")),
        headline: limitLogbookText(item.headline || item.text || "", 48),
        priority: Math.max(0, Math.min(5, Number(item.priority) || 0)),
        subject: String(item.subject || item.loreCharacters?.[0] || item.type || "world"),
        sourceEventId: item.sourceEventId || null,
        lead: Boolean(item.lead),
      }))
      .filter((item) => item.headline);
  }

  function getEventNewsPriority(event = {}) {
    const effects = event.effects || {};
    const rewards = event.rewards || [];
    const titleRank = rewards
      .filter((reward) => reward.type === "title")
      .reduce((rank, reward) => Math.max(
        rank,
        TITLE_RARITIES[normalizeRarity(reward.data?.rarity)].rank,
      ), 0);
    const flags = event.flagChanges || {};
    const dreamCompleted = Boolean(flags.bossFinalDreamCompleted || flags.dreamCompleted);
    const majorCallback = event.tags?.includes("callback") && Object.keys(flags).length > 0;
    const popularityImpact = Math.abs(Number(effects.popularity) || 0);
    const bountyImpact = Math.abs(Number(effects.bounty) || 0);
    const totalImpact = Object.values(effects).reduce((sum, value) => sum + Math.abs(Number(value) || 0), 0);
    return Math.max(
      Number(event.newsPriority) || 0,
      event.eventType === "decisive" || dreamCompleted ? 5 : 0,
      event.highStakes ? 4 : 0,
      titleRank >= TITLE_RARITIES.legendary.rank ? 4 : titleRank >= TITLE_RARITIES.rare.rank ? 3 : 0,
      popularityImpact >= 7 ? 4 : popularityImpact >= 4 ? 3 : 0,
      bountyImpact >= 10000000 ? 4 : bountyImpact >= 1000000 ? 3 : 0,
      Math.abs(Number(event.dreamProgress) || 0) >= 3 ? 4 :
        Math.abs(Number(event.dreamProgress) || 0) > 0 ? 3 : 0,
      majorCallback ? 3 : 0,
      event.loreCharacters?.length ? 3 : 0,
      event.important ? 3 : 0,
      event.eventType === "risk" && totalImpact >= 10 ? 3 : 0,
    );
  }

  function getMajorTitleFromEvent(event = {}) {
    return (event.rewards || [])
      .filter((reward) => reward.type === "title" && reward.data)
      .map((reward) => reward.data)
      .sort((a, b) =>
        TITLE_RARITIES[normalizeRarity(b.rarity)].rank -
        TITLE_RARITIES[normalizeRarity(a.rarity)].rank,
      )[0] || null;
  }

  function createPlayerNewsItem(event, game = state.game) {
    const name = game?.character?.name || "Une figure encore inconnue";
    const faction = game?.character?.faction || "pirate";
    const priority = getEventNewsPriority(event);
    const effects = event.effects || {};
    const result = event.eventType === "decisive"
      ? limitLogbookText(event.result || event.outcomeResult || "", 24)
      : Math.abs(Number(event.dreamProgress) || 0) >= 3
        ? "Cette décision ouvre une avancée décisive vers le rêve poursuivi."
        : Math.abs(Number(effects.bounty) || 0) >= 1000000
          ? "La Marine et les chasseurs réévaluent désormais sa place dans leurs rapports."
          : Math.abs(Number(effects.popularity) || 0) >= 4
            ? "Les récits de cette intervention circulent déjà bien au-delà de la zone."
            : Number(effects.health) <= -8
              ? "L’opération atteint son terme au prix de lourdes blessures."
              : Object.keys(event.flagChanges || {}).length
                ? "Cette décision provoque des conséquences durables dans la région."
                : "L’affaire attire désormais l’attention du Journal de l’économie mondiale.";
    const title = getMajorTitleFromEvent(event);
    const titleText = title && TITLE_RARITIES[normalizeRarity(title.rarity)].rank >= TITLE_RARITIES.rare.rank
      ? ` Le monde le connaît désormais sous le titre « ${title.name} ».`
      : "";
    const introductions = {
      pirate: `${name} fait parler de son pavillon`,
      marine: `La Marine attribue à ${name} une opération décisive`,
      "bounty-hunter": `${name} impose sa réputation parmi les chasseurs`,
      revolutionary: `Les autorités relient ${name} à une opération révolutionnaire majeure`,
    };
    const lead = Boolean(event.eventType === "decisive" || event.flagChanges?.bossFinalDreamCompleted || priority >= 5);
    const headline = event.eventType === "decisive"
      ? `${name} a surmonté « ${event.title} » en choisissant de ${String(event.choiceText || "tenir sa position").replace(/^[A-ZÀ-ÖØ-Þ]/, (letter) => letter.toLowerCase())}. ${result}${titleText}`
      : `${introductions[faction] || introductions.pirate} lors de « ${event.title || "un événement majeur"} ». ${result}${titleText}`;
    return {
      id: `player-news-${event.eventId || event.id}`,
      type: "player",
      icon: lead ? "👑" : "⭐",
      label: lead ? "Édition spéciale • Ta légende" : "Ta légende",
      headline: limitLogbookText(headline, 48),
      priority,
      sourceEventId: event.eventId || event.id || null,
      subject: "player",
      lead,
    };
  }

  function getWorldNewsSubject(item = {}) {
    return String(item.subject || item.loreCharacters?.[0] || item.type || item.id || "world");
  }

  function getStableNewsOrder(seed) {
    let hash = 2166136261;
    String(seed || "").split("").forEach((character) => {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    });
    return hash >>> 0;
  }

  function selectWorldNews(entry, game = state.game, count = 2) {
    const stage = Math.max(1, Math.min(6,
      Number(entry.period) || Number(game?.currentZoneIndex) + 1 || 1));
    const seen = new Set(game?.seenWorldNewsIds || []);
    const recentSubjects = new Set((game?.journal || [])
      .slice(-2)
      .flatMap((period) => normalizeStoredBigNews(period.bigNews))
      .filter((item) => item.type !== "player")
      .map(getWorldNewsSubject));
    const stableSeed = `${game?.id || game?.character?.id || "run"}-${entry.period || stage}`;
    const eligible = WORLD_NEWS_CATALOG
      .filter((item) => item.stages.includes(stage) && !seen.has(item.id))
      .sort((a, b) =>
        Number(recentSubjects.has(getWorldNewsSubject(a))) - Number(recentSubjects.has(getWorldNewsSubject(b))) ||
        Number(b.type === "major") - Number(a.type === "major") ||
        getStableNewsOrder(`${stableSeed}-${a.id}`) - getStableNewsOrder(`${stableSeed}-${b.id}`));
    const selected = [];
    while (eligible.length && selected.length < count) {
      const distinctIndex = eligible.findIndex((candidate) =>
        !selected.some((chosen) => chosen.subject === getWorldNewsSubject(candidate)));
      const item = eligible.splice(distinctIndex >= 0 ? distinctIndex : 0, 1)[0];
      selected.push({
        id: item.id,
        type: item.type,
        icon: item.icon,
        label: "Le monde",
        headline: item.text,
        priority: item.type === "major" ? 3 : 2,
        subject: getWorldNewsSubject(item),
        sourceEventId: null,
        lead: false,
      });
      if (game) game.seenWorldNewsIds = uniqueArray([...(game.seenWorldNewsIds || []), item.id]);
    }
    return selected;
  }

  function buildBigNews(entry = {}, game = state.game, options = {}) {
    const events = getLogbookEvents(entry)
      .map((event, index) => ({
        ...event,
        newsPriority: getEventNewsPriority(event),
        newsRecency: index,
      }))
      .filter((event) => event.newsPriority >= 3)
      .sort((a, b) =>
        b.newsPriority - a.newsPriority ||
        getLogbookEventPriority(b) - getLogbookEventPriority(a) ||
        b.newsRecency - a.newsRecency);
    const playerNews = events.length ? [createPlayerNewsItem(events[0], game)] : [];
    const desiredWorldCount = options.includeWorldNews === false
      ? 0
      : playerNews.length ? 1 : 2;
    const worldNews = selectWorldNews(entry, game, desiredWorldCount);
    const combined = selectBigNewsForDisplay([...playerNews, ...worldNews]);
    const leadIndex = combined.findIndex((item) => item.lead);
    combined.forEach((item, index) => { item.lead = index === leadIndex; });
    validateBigNews(entry, combined);
    return combined;
  }

  function selectBigNewsForDisplay(news = []) {
    const normalized = normalizeStoredBigNews(news)
      .map((item, index) => ({ ...item, editorialIndex: index }))
      .filter((item, index, list) => list.findIndex((candidate) =>
        candidate.id === item.id ||
        (candidate.sourceEventId && candidate.sourceEventId === item.sourceEventId) ||
        slugify(candidate.headline) === slugify(item.headline)) === index);
    const byEditorialPriority = (a, b) =>
      b.priority - a.priority || b.editorialIndex - a.editorialIndex;
    const player = normalized.filter((item) => item.type === "player").sort(byEditorialPriority)[0] || null;
    const worlds = normalized.filter((item) => item.type !== "player").sort(byEditorialPriority);
    const selected = player ? [player] : [];
    for (const item of worlds) {
      if (selected.length >= 2) break;
      if (selected.some((chosen) =>
        chosen.id === item.id ||
        (chosen.sourceEventId && chosen.sourceEventId === item.sourceEventId) ||
        (chosen.type !== "player" && getWorldNewsSubject(chosen) === getWorldNewsSubject(item)))) continue;
      selected.push(item);
    }
    const leadIndex = selected.findIndex((item) => item.type === "player" && item.lead);
    return selected.map((item, index) => {
      const { editorialIndex: _editorialIndex, ...newsItem } = item;
      return {
        ...newsItem,
        label: item.type === "player" ? item.label || "Ta légende" : "Le monde",
        lead: index === leadIndex,
      };
    });
  }

  function buildLegacyBigNews(entry = {}, game = state.game) {
    const reconstructed = buildBigNews(entry, game, { includeWorldNews: false });
    if (reconstructed.length) return reconstructed;
    const archiveText = String(entry.narrative || "").trim();
    return archiveText ? [{
      id: `archive-${entry.id || entry.period || "period"}`,
      type: "archive",
      icon: "🗞️",
      label: "Archives de la période",
      headline: limitLogbookText(archiveText, 48),
      priority: 1,
      sourceEventId: null,
      lead: false,
    }] : [];
  }

  function validateBigNews(entry, news) {
    const warnings = [];
    const ids = new Set();
    news.forEach((item) => {
      if (!item.id) warnings.push("actualité sans identifiant");
      if (!item.headline) warnings.push(`actualité sans texte : ${item.id || "inconnue"}`);
      if (ids.has(item.id)) warnings.push(`doublon : ${item.id}`);
      ids.add(item.id);
    });
    if (news.length > 2) warnings.push(`plus de deux actualités : période ${entry.period}`);
    if (news.filter((item) => item.type === "player").length > 1) {
      warnings.push("plus d’une actualité joueur");
    }
    if (news.length > 1 && !news.some((item) => item.type !== "player")) {
      warnings.push("actualité mondiale absente");
    }
    if (warnings.length) console.warn("[Blue Legacy] Validation Big News Morgans :", warnings);
  }

  function runBigNewsEditorialAudit() {
    const player = (id, priority) => ({
      id, type: "player", subject: "player", priority, headline: `Action ${id}`,
    });
    const world = (id, subject, priority = 2) => ({
      id, type: "world", subject, priority, headline: `Nouvelle ${id}`,
    });
    const cases = [
      {
        name: "action majeure et monde",
        result: selectBigNewsForDisplay([player("minor", 3), player("major", 5), world("marine", "marine")]),
        expected: ["major", "marine"],
      },
      {
        name: "aucune action majeure",
        result: selectBigNewsForDisplay([world("law", "Trafalgar Law"), world("marine", "marine")]),
        expected: ["marine", "law"],
      },
      {
        name: "ancienne période de quatre nouvelles",
        result: selectBigNewsForDisplay([
          world("older", "piracy", 1), player("major", 5),
          world("government", "government", 3), player("other", 4),
        ]),
        expected: ["major", "government"],
      },
      {
        name: "déduplication des sujets",
        result: selectBigNewsForDisplay([
          world("marine-a", "marine", 3), world("marine-b", "marine", 2), world("revolution", "revolution", 2),
        ]),
        expected: ["marine-a", "revolution"],
      },
    ].map((test) => ({
      ...test,
      actual: test.result.map((item) => item.id),
      pass: test.result.length <= 2 &&
        test.result.filter((item) => item.type === "player").length <= 1 &&
        test.expected.every((id, index) => test.result[index]?.id === id),
    }));
    const report = { cases, pass: cases.every((test) => test.pass) };
    console.warn("[Blue Legacy] Audit éditorial Big News Morgans", report);
    return report;
  }

  function createBigNewsHtml(news = []) {
    if (!news.length) {
      return `<li class="logbook-news-empty"><span aria-hidden="true">📰</span><span><strong>Une période étonnamment calme</strong>Aucun événement n’a suffisamment secoué les mers pour faire la une.</span></li>`;
    }
    return news.map((item) => `
      <li class="logbook-news-item${item.type === "player" ? " is-player-news" : ""}${item.lead ? " is-lead-news" : ""}">
        <span class="logbook-news-icon" aria-hidden="true">${escapeHtml(item.icon || "📰")}</span>
        <span class="logbook-news-copy">
          <span class="logbook-news-label">${escapeHtml(item.label || "Le monde")}</span>
          <span>${escapeHtml(item.headline)}</span>
        </span>
      </li>
    `).join("");
  }

  function getLogbookEventPriority(event = {}) {
    const impact = Object.values(event.effects || {}).reduce(
      (sum, value) => sum + Math.abs(Number(value) || 0),
      0,
    );
    const hasRecruitment = Object.keys(event.flagChanges || {}).some(
      (flag) => /^recruited[A-Z]/.test(flag),
    );
    return (event.eventType === "decisive" ? 300 : 0) + (event.important ? 100 : 0) +
      (hasRecruitment ? 60 : 0) + impact;
  }

  function getLogbookEvents(entry = {}) {
    const events = [
      ...(entry.events || []),
      ...(entry.importantEvents || []),
    ];
    return events.filter((event, index) => {
      const key = event.id || event.eventId;
      return !key || events.findIndex(
        (candidate) => (candidate.id || candidate.eventId) === key,
      ) === index;
    });
  }

  function buildLogbookNarrative(entry = {}, game = state.game) {
    const character = game?.character || entry.character || {};
    const name = character.name || entry.characterName || "L’aventurier";
    const faction = character.faction || entry.faction || "pirate";
    const zone = entry.zoneName || "les mers";
    const events = getLogbookEvents(entry)
      .sort((a, b) => getLogbookEventPriority(b) - getLogbookEventPriority(a))
      .slice(0, 3);
    const introductions = {
      pirate: `Durant cette période, ${name} a poursuivi sa route librement à travers ${zone}.`,
      marine: `Durant cette période, ${name} a servi la Marine au cœur de ${zone}.`,
      "bounty-hunter": `Durant cette période, ${name} a suivi contrats et pistes à travers ${zone}.`,
      revolutionary: `Durant cette période, ${name} a mené ses opérations dans l’ombre de ${zone}.`,
    };
    const sentences = [introductions[faction] || introductions.pirate];

    events.forEach((event) => {
      const choice = event.choiceText
        ? ` en choisissant de ${String(event.choiceText).replace(/^[A-ZÀ-ÖØ-Þ]/, (letter) => letter.toLowerCase())}`
        : "";
      const result = limitLogbookText(event.result || event.outcomeResult || "", 18);
      sentences.push(event.eventType === "decisive"
        ? `L’événement décisif « ${event.title || "Un tournant décisif"} » a changé le cours du voyage${choice}${result ? ` : ${result}` : "."}`
        : `L’épisode « ${event.title || "Une rencontre inattendue"} » a marqué le voyage${choice}${result ? ` : ${result}` : "."}`);
    });

    const changes = entry.statChanges || {};
    if ((Number(changes.health) || 0) <= -5 || (Number(changes.charisma) || 0) <= -4) {
      sentences.push("La période s’achève dans l’épreuve, mais la route reste ouverte.");
    } else if ((Number(changes.crew) || 0) > 0) {
      sentences.push("De nouveaux compagnons donnent désormais une autre ampleur à la suite du voyage.");
    } else if ((entry.gainedTitles || []).length) {
      sentences.push("Les actes accomplis ont valu un nouveau titre et changé le regard porté sur cette carrière.");
    } else {
      sentences.push("Ces rencontres ont préparé la prochaine étape sans encore révéler tout ce qu’elles provoqueront.");
    }

    return limitLogbookText(sentences.slice(0, 5).join(" "), 100);
  }

  function buildLogbookHighlights(entry = {}) {
    const highlights = [];
    const push = (item) => {
      if (item?.text && highlights.length < 3 &&
          !highlights.some((current) => current.text === item.text)) {
        highlights.push(item);
      }
    };

    const events = getLogbookEvents(entry)
      .sort((a, b) => getLogbookEventPriority(b) - getLogbookEventPriority(a))
    events.forEach((event) => {
        const recruitment = Object.keys(event.flagChanges || {}).some(
          (flag) => /^recruited[A-Z]/.test(flag),
        );
        if (event.eventType === "decisive") {
          push({
            type: "boss-event",
            icon: event.decisiveStage === 3 ? "👑" : "⚔️",
            text: `Événement décisif : ${event.title}${event.choiceText ? ` — ${event.choiceText}` : ""}`,
            sourceEventId: event.eventId || event.id || null,
          });
        } else if (recruitment) {
          const recruitmentFlag = Object.keys(event.flagChanges).find(
            (flag) => /^recruited[A-Z]/.test(flag),
          );
          const recruitName = recruitmentFlag
            ?.replace(/^recruited/, "")
            .replace(/([a-z])([A-Z])/g, "$1 $2");
          push({
            type: "recruitment",
            icon: "👥",
            text: limitLogbookText(
              event.result ||
              event.outcomeResult ||
              `${recruitName || "Un nouveau compagnon"} a rejoint l’aventure.`,
              16,
            ),
            sourceEventId: event.eventId || event.id || null,
          });
        } else if (event.important) {
          push({
            type: "event",
            icon: getEventIcon(event) || "⭐",
            text: `${event.title}${event.choiceText ? ` — ${event.choiceText}` : ""}`,
            sourceEventId: event.eventId || event.id || null,
          });
        }
      });
    events.forEach((event) => {
      (event.rewards || []).forEach((reward) => {
        push({
          type: reward.type || "reward",
          icon: reward.type === "devilFruit" ? "🍈" :
            reward.type === "combatStyle" ? "🥋" : "🎁",
          text: limitLogbookText(reward.text, 16),
          sourceEventId: event.eventId || event.id || null,
        });
      });
      if (Object.keys(event.flagChanges || {}).length) {
        push({
          type: "decision",
          icon: "⚑",
          text: `${event.title || "Une décision durable"}${event.choiceText ? ` — ${event.choiceText}` : ""}`,
          sourceEventId: event.eventId || event.id || null,
        });
      }
    });

    (entry.gainedTitles || []).forEach((title) => push({
      type: "title",
      icon: "🎖️",
      text: `Titre obtenu : ${title?.name || title?.label || title}.`,
    }));

    if (!highlights.length && entry.reward) {
      push({
        type: "reward",
        icon: "🎁",
        text: entry.reward.text || "Une récompense de période a été obtenue.",
      });
    }
    if (!highlights.length && entry.events?.length) {
      const event = entry.events[0];
      push({
        type: "event",
        icon: getEventIcon(event) || "📜",
        text: `${event.title}${event.choiceText ? ` — ${event.choiceText}` : ""}`,
      });
    }
    if (!highlights.length) {
      push({
        type: "journey",
        icon: "🧭",
        text: `La traversée de ${entry.zoneName || "la zone"} s’est poursuivie sans incident majeur.`,
      });
    }
    return highlights.slice(0, 3);
  }

  function getLogbookVisitedLocations(events = [], fallbackZone = null) {
    return uniqueArray([
      ...events.map((event) => event.zoneName).filter(Boolean),
      fallbackZone,
    ].filter(Boolean));
  }

  function formatVisitedLocations(locations = []) {
    const unique = uniqueArray(locations.filter(Boolean));
    if (unique.length <= 3) return unique.join(", ");
    return `${unique.slice(0, 2).join(", ")} et ${unique.length - 2} autres escales`;
  }

  function buildLogbookEntry(finishedMonth) {
    const game = state.game;
    const currentZone = getCurrentZone(game);
    const nextZone = getNextZone(game);

    const statsBefore =
      game.periodStartStats ||
      getStatsSnapshot(game.stats);

    const periodTitleIds = uniqueArray(game.periodEvents.flatMap((event) =>
      (event.rewards || [])
        .filter((reward) => reward.type === "title")
        .map((reward) => getDataId(reward.data || reward)),
    ));
    const titleIdsBefore = game.runTitles.map(getDataId);

    const reward = grantPeriodReward(finishedMonth);
    refreshPopularityScore(game);

    const titlesGrantedByPeriodReward = game.runTitles
      .map(getDataId)
      .filter((titleId) => !titleIdsBefore.includes(titleId));
    const gainedTitleIds = uniqueArray([...periodTitleIds, ...titlesGrantedByPeriodReward]);
    const gainedTitles = gainedTitleIds
      .map((titleId) => game.runTitles.find((title) => getDataId(title) === titleId))
      .filter(Boolean);

    const statsAfter = getStatsSnapshot(game.stats);
    const entry = {
      id: createUniqueId("logbook"),
      period: Math.ceil(
        finishedMonth / CONFIG.logbookInterval,
      ),
      fromMonth: Math.max(
        1,
        finishedMonth - CONFIG.logbookInterval + 1,
      ),
      toMonth: finishedMonth,
      zoneId: currentZone?.id || null,
      zoneName: currentZone?.name || "Zone inconnue",
      events: cloneData(game.periodEvents),
      importantEvents: cloneData(
        game.periodEvents.filter((event) => event.important),
      ),
      statChanges: getStatsDifference(
        statsBefore,
        statsAfter,
      ),
      statsAfter,
      reward: cloneData(reward),
      gainedTitles: cloneData(gainedTitles),
      visitedLocations: getLogbookVisitedLocations(
        game.periodEvents,
        currentZone?.name,
      ),
      nextZoneId: nextZone?.id || null,
      nextZoneName: nextZone?.name || null,
      createdAt: new Date().toISOString(),
    };
    entry.highlights = buildLogbookHighlights(entry);
    entry.narrative = buildLogbookNarrative(entry, game);
    entry.bigNews = buildBigNews(entry, game);
    return entry;
  }

  function grantPeriodReward(finishedMonth) {
    const game = state.game;

    const periodNumber = Math.ceil(
      finishedMonth / CONFIG.logbookInterval,
    );

    const rewardId = `period-reward-${periodNumber}`;

    const existing = game.rewards.find(
      (reward) => reward.id === rewardId,
    );

    if (existing) {
      return existing;
    }

    const reward = createPeriodReward(periodNumber);

    applyStatChanges(reward.effects, game.stats);
    game.rewards.push(reward);

    return reward;
  }

  function createPeriodReward(periodNumber) {
    const templates = [
      {
        text:
          "Ton expérience sur les mers renforce ton moral.",
        effects: { charisma: 4 },
      },
      {
        text:
          "Tu mets la main sur une réserve de berrys.",
        effects: { fortune: 20000 },
      },
      {
        text:
          "Tes récents affrontements t’ont rendu plus redoutable.",
        effects: { combat: 1 },
      },
      {
        text:
          "Ton équipage gagne en cohésion.",
        effects: { crew: 1, charisma: 1 },
      },
      {
        text:
          "Les réparations t’apprennent à mieux anticiper les avaries.",
        effects: { intelligence: 2 },
      },
      {
        text:
          "Une escale calme permet de soigner les blessures les plus urgentes.",
        effects: { health: 6 },
      },
    ];

    const selected =
      getRandomItem(templates) ||
      templates[0];

    return {
      id: `period-reward-${periodNumber}`,
      period: periodNumber,
      zoneId: getCurrentZone()?.id || null,
      text: selected.text,
      effects: cloneData(selected.effects),
      grantedAtMonth: state.game?.month || null,
      grantedAt: new Date().toISOString(),
    };
  }

  function closeLogbook() {
    const game = state.game;

    if (!game) {
      return false;
    }

    game.pendingLogbookEntry = null;

    if (game.month > CONFIG.maxMonths) {
      return finishAdventure(createBossFinalEnding(game));
    }

    const automaticEnding = checkRunEndingConditions(game);
    if (automaticEnding) {
      return finishAdventure(automaticEnding);
    }

    if (Number(game.month) === 13 && getCurrentZone(game)?.id === "red-line") {
      const marineford = game.legendaryArcs?.marineford;
      if (marineford?.status === "unassessed") evaluateLegendaryArc("marineford", game);
      if (["selected", "in-progress"].includes(marineford?.status)) {
        game.flags.deferredZoneTransitionAfterArc = "marineford";
        return startLegendaryArc("marineford", game);
      }
    }

    const zone = getCurrentZone(game);
    if (!zone) {
      saveGame();
      return startMonth();
    }

    return openZoneTransition(
      zone,
      game.currentZoneIndex,
      "zone-change",
    );
  }  /* ========================================================
     FRUITS DU DÉMON
  ======================================================== */

  function createBossFinalEnding(game = state.game) {
    const finalOutcome = game?.bossProgress?.finalOutcome;
    if (!finalOutcome) {
      return {
        type: "retirement",
        destiny: "Après deux années d’aventure, ton voyage atteint son terme.",
        title: "Vétéran des mers",
        success: false,
      };
    }

    const dream = findDreamData(game.character?.dream, game.character?.faction);
    const selectedDreamId = game.character?.dream;
    const selectedFactionId = game.character?.faction;
    const outcomeMatchesCharacter =
      (!finalOutcome.dreamId || finalOutcome.dreamId === selectedDreamId) &&
      (!finalOutcome.factionId || finalOutcome.factionId === selectedFactionId);
    if (finalOutcome.dreamCompleted && outcomeMatchesCharacter) {
      return {
        type: "dreamCompleted",
        destiny: `${finalOutcome.bossTitle} a conclu ta route. ${finalOutcome.result} Ton choix décisif — « ${finalOutcome.choiceText} » — accomplit ${dream?.label || "le rêve poursuivi"}.`,
        title: dream?.ultimate || "Légende des mers",
        success: true,
        dreamCompleted: true,
      };
    }

    return {
      type: finalOutcome.survived ? "dreamUnfulfilled" : "death",
      destiny: `${finalOutcome.bossTitle} a marqué la fin de ta route. ${finalOutcome.result} Ton rêve reste inachevé, mais cette dernière décision appartient désormais à ta légende.`,
      title: finalOutcome.survived ? "Rêve inachevé" : "Dernier sacrifice",
      success: false,
      dreamCompleted: false,
    };
  }

  function normalizeCrewMember(member = {}) {
    const name = member.name || member.label || "Compagnon anonyme";
    return {
      id: member.id || slugify(name),
      name,
      role: member.role || "Compagnon",
      rank: member.rank || "",
      icon: member.icon || "👤",
      description: member.description || "Un compagnon rencontré au cours de la route.",
      permanentEffects: { ...(member.permanentEffects || member.effects || {}) },
      primaryStat: normalizeStatKey(member.primaryStat || ""),
      rarity: normalizeRarity(member.rarity || "rare"),
      category: member.category || "",
      active: member.active !== false,
      recruitmentText: member.recruitmentText || "",
      allowedFactions: uniqueArray(member.allowedFactions || []),
      minStage: Math.max(1, Number(member.minStage) || 1),
      maxStage: Number(member.maxStage) || null,
      zones: uniqueArray(member.zones || []),
      requiredFlags: { ...(member.requiredFlags || {}) },
      forbiddenFlags: uniqueArray(member.forbiddenFlags || []),
      recruitedAtMonth: Number(member.recruitedAtMonth) || state.game?.month || 1,
    };
  }

  function recruitCrewMember(memberData, game = state.game, shouldSave = true) {
    if (!game || !memberData) return false;
    game.crewMembers = Array.isArray(game.crewMembers) ? game.crewMembers : [];
    const member = normalizeCrewMember(memberData);
    if (game.crewMembers.some((candidate) => candidate.id === member.id)) return false;
    member.recruitedAtMonth = game.month;
    game.crewMembers.push(member);
    applyStatChanges({ crew: 1, ...member.permanentEffects }, game.stats, {
      game,
      source: "recruitment",
      ignoreDiminishingReturns: true,
    });
    game.permanentEffects.push({
      id: `crew-member-${member.id}`,
      source: "crewMember",
      sourceId: member.id,
      effects: cloneData(member.permanentEffects),
      obtainedAtMonth: game.month,
    });
    if (shouldSave) saveGame();
    return true;
  }

  function normalizeDevilFruit(fruitData) {
    if (typeof fruitData === "string") {
      return {
        id: slugify(fruitData),
        name: fruitData,
        type: "unknown",
        description: "",
        rarity: "epic",
        icon: "🍈",
        permanentEffects: {},
        obtainedAtMonth: state.game?.month || 1,
      };
    }

    const name =
      fruitData?.name ||
      fruitData?.label ||
      "Fruit inconnu";

    return {
      id: fruitData?.id || slugify(name),
      name,
      type: fruitData?.type || "unknown",
      description:
        fruitData?.description ||
        fruitData?.desc ||
        "",
      loreDescription: fruitData?.loreDescription || "",
      primaryStat: normalizeStatKey(fruitData?.primaryStat || ""),
      secondaryStat: normalizeStatKey(fruitData?.secondaryStat || Object.keys(fruitData?.permanentEffects || {})
        .find((statId) => normalizeStatKey(statId) !== normalizeStatKey(fruitData?.primaryStat || "")) || ""),
      rarity: normalizeRarity(fruitData?.rarity || "epic"),
      icon: fruitData?.icon || "🍈",
      permanentEffects: {
        ...(fruitData?.permanentEffects || fruitData?.effects || {}),
      },
      obtainedAtMonth: Number(fruitData?.obtainedAtMonth) || state.game?.month || 1,
    };
  }

  function grantDevilFruit(
    fruitData,
    game = state.game,
    shouldSave = true,
  ) {
    if (!game?.character || !fruitData) {
      return false;
    }

    if (game.character.devilFruit) {
      return false;
    }

    const fruit = normalizeDevilFruit(fruitData);

    game.character.devilFruit = fruit;
    game.flags.fruitSurpriseTriggered = true;

    game.permanentEffects.push({
      id: `devil-fruit-${fruit.id}`,
      source: "devilFruit",
      sourceId: fruit.id,
      effects: cloneData(fruit.permanentEffects),
      obtainedAtMonth: game.month,
    });

    applyStatChanges(
      fruit.permanentEffects,
      game.stats,
    );

    if (shouldSave) {
      saveGame();
    }

    return true;
  }

  function hasDevilFruit(game = state.game) {
    return Boolean(game?.character?.devilFruit);
  }

  /* ========================================================
     STYLES DE COMBAT
  ======================================================== */

  function setCombatStyle(
    styleId,
    game = state.game,
    shouldSave = true,
    replaceExisting = false,
  ) {
    if (!game?.character || !styleId) return null;
    const style = String(styleId);
    const current = game.character.combatStyle;
    if (current === style || (current && !replaceExisting)) return null;
    game.character.combatStyle = style;

    if (shouldSave) {
      saveGame();
    }

    return { style, replaced: current || null };
  }

  function getCombatStyle(game = state.game) {
    return game?.character?.combatStyle || null;
  }

  /* ========================================================
     TRAITS
  ======================================================== */

  function addTrait(
    traitId,
    game = state.game,
    shouldSave = true,
  ) {
    if (!game?.character || !traitId) {
      return false;
    }

    if (!Array.isArray(game.character.traits)) {
      game.character.traits = [];
    }

    if (game.character.traits.includes(traitId)) {
      return false;
    }

    game.character.traits.push(traitId);

    if (shouldSave) {
      saveGame();
    }

    return true;
  }

  function removeTrait(
    traitId,
    game = state.game,
    shouldSave = true,
  ) {
    if (!Array.isArray(game?.character?.traits)) {
      return false;
    }

    const previousLength =
      game.character.traits.length;

    game.character.traits =
      game.character.traits.filter(
        (currentTrait) =>
          currentTrait !== traitId,
      );

    const removed =
      previousLength !== game.character.traits.length;

    if (removed && shouldSave) {
      saveGame();
    }

    return removed;
  }

  function hasTrait(
    traitId,
    game = state.game,
  ) {
    return Boolean(
      game?.character?.traits?.includes(traitId),
    );
  }

  /* ========================================================
     TITRES
  ======================================================== */

  const TITLE_RARITIES = Object.freeze({
    common: { label: "Commun", icon: "🏅", rank: 0 },
    uncommon: { label: "Peu commun", icon: "🎖️", rank: 1 },
    rare: { label: "Rare", icon: "💠", rank: 2 },
    epic: { label: "Épique", icon: "🔮", rank: 3 },
    legendary: { label: "Légendaire", icon: "👑", rank: 4 },
    mythic: { label: "Mythique", icon: "🌟", rank: 5 },
  });

  const TITLE_CATEGORY_META = Object.freeze({
    ultimate: { label: "Titres ultimes", icon: "👑" },
    destiny: { label: "Destin", icon: "🌊" },
    piracy: { label: "Piraterie", icon: "🏴‍☠️" },
    marine: { label: "Marine", icon: "⚓" },
    "bounty-hunting": { label: "Chasse aux primes", icon: "🎯" },
    revolution: { label: "Révolution", icon: "✊" },
    combat: { label: "Combat", icon: "⚔️" },
    haki: { label: "Hakis", icon: "👁️" },
    prodige: { label: "Prodige", icon: "◆" },
    marineford: { label: "Marineford", icon: "⚓" },
    emperor: { label: "Empereur", icon: "👑" },
    crew: { label: "Équipage", icon: "👥" },
    exploration: { label: "Exploration", icon: "🧭" },
    wealth: { label: "Richesse", icon: "💰" },
    adventure: { label: "Aventure", icon: "⛵" },
  });

  const TITLE_CATEGORY_ORDER = Object.freeze([
    "ultimate",
    "destiny",
    "piracy",
    "marine",
    "bounty-hunting",
    "revolution",
    "combat",
    "haki",
    "prodige",
    "marineford",
    "emperor",
    "crew",
    "exploration",
    "wealth",
    "adventure",
  ]);

  function normalizeTitleCategory(category) {
    const aliases = {
      relation: "crew",
      reputation: "adventure",
      exploit: "combat",
      trait: "adventure",
      bounty: "bounty-hunting",
      revolutionary: "revolution",
    };
    const normalized = aliases[category] || category || "adventure";
    return TITLE_CATEGORY_META[normalized] ? normalized : "adventure";
  }

  function normalizeRarity(rarity) {
    const aliases = {
      "peu-commun": "uncommon",
      inhabituel: "uncommon",
      "tres-rare": "epic",
      "very-rare": "epic",
      veryrare: "epic",
      unique: "legendary",
      ultime: "mythic",
    };
    const slug = slugify(String(rarity || "common"));
    const normalized = (aliases[slug] || slug)
      .replace("peu-commun", "uncommon")
      .replace("inhabituel", "uncommon")
      .replace("commun", "common")
      .replace("epique", "epic")
      .replace("legendaire", "legendary")
      .replace("mythique", "mythic");
    return TITLE_RARITIES[normalized] ? normalized : "common";
  }

  function getRarityLabel(rarity) {
    return TITLE_RARITIES[normalizeRarity(rarity)].label;
  }

  function getRarityIcon(rarity) {
    return TITLE_RARITIES[normalizeRarity(rarity)].icon;
  }

  function getRewardTypeIcon(reward = {}) {
    if (reward.icon) return reward.icon;
    return {
      title: getRarityIcon(reward.rarity),
      devilFruit: "🍈",
      crewMember: "🤝",
      item: "🎁",
      reward: "🎁",
      weapon: "⚔️",
      navigation: "🧭",
      ship: "⛵",
      achievement: "🏆",
      combatStyle: "✨",
      style: "✨",
    }[reward.type] || "🎁";
  }

  function getTitleCategoryLabel(category) {
    return TITLE_CATEGORY_META[normalizeTitleCategory(category)].label;
  }

  function getAllTitles() {
    const sources = [
      window.SEA_OF_LEGENDS_TITLES,
      window.GAME_TITLES,
      window.TITLES,
      window.GAME_DATA?.titles,
    ];

    const arraySource =
      sources.find(Array.isArray);

    if (arraySource) {
      return arraySource;
    }

    const objectSource =
      sources.find(
        (source) =>
          source &&
          typeof source === "object",
      );

    return objectSource
      ? Object.values(objectSource)
      : [];
  }

  function findTitleData(titleId) {
    const normalizedId = slugify(titleId);
    return (
      getAllTitles().find(
        (title) =>
          getDataId(title) === titleId ||
          slugify(getDataId(title)) === normalizedId ||
          slugify(title?.name || title?.label) === normalizedId,
      ) || null
    );
  }

  const SUPREME_DREAM_TITLE_IDS = new Set([
    "roi-des-pirates", "empereur-des-mers", "seigneur-des-tresors", "gardien-histoire-oubliee",
    "legende-des-chasseurs", "fleau-des-criminels", "tombeur-empereur", "maitre-des-contrats",
    "chain-breaker", "truth-bearer", "architect-of-revolution", "founder-of-free-people",
    "amiral", "amiral-en-chef", "justice-nouvelle", "heros-de-la-marine",
  ]);

  function resolveTitleRarity(titleId, archivedTitle = null) {
    const archived = archivedTitle && typeof archivedTitle === "object" ? archivedTitle : {};
    const lookupId = slugify(archived.id || titleId || archived.name || archived.label || "");
    const catalog = findTitleData(lookupId) || findTitleData(archived.name || archived.label || "");
    const canonicalId = slugify(getDataId(catalog) || lookupId);
    // Ces identifiants représentent les seize accomplissements suprêmes : les
    // anciennes copies dorées sont une donnée d'affichage obsolète, pas une
    // rareté explicite à préserver.
    if (SUPREME_DREAM_TITLE_IDS.has(canonicalId)) return "mythic";
    const archivedRarity = slugify(archived.rarity || "");
    const knownArchivedRarities = new Set([
      ...Object.keys(TITLE_RARITIES), "commun", "inhabituel", "peu-commun",
      "epique", "legendaire", "mythique", "tres-rare", "very-rare", "veryrare", "unique", "ultime",
    ]);
    if (knownArchivedRarities.has(archivedRarity)) {
      return normalizeRarity(archivedRarity);
    }
    return normalizeRarity(catalog?.rarity || "common");
  }

  function getTitleRarityClass(titleId, archivedTitle = null) {
    return `rarity-${resolveTitleRarity(titleId, archivedTitle)}`;
  }

  function normalizeTitleData(
    titleId,
    titleData,
  ) {
    const stringCatalog = typeof titleData === "string"
      ? findTitleData(titleData)
      : null;
    const inline = typeof titleData === "string"
      ? (stringCatalog ? {} : { name: titleData })
      : (titleData || {});
    const lookupId =
      inline.id ||
      titleId ||
      slugify(inline.name || inline.label || "");
    const catalog = stringCatalog || findTitleData(lookupId) || {};
    const source = { ...catalog, ...inline };
    const name =
      source.name ||
      source.label ||
      titleId ||
      "Titre inconnu";

    return {
      id:
        source.id ||
        titleId ||
        slugify(name),
      name,
      description:
        source.description ||
        source.desc ||
        "",
      category:
        normalizeTitleCategory(catalog.category || source.category),
      rarity: resolveTitleRarity(lookupId, inline),
      careerScoreRarity: normalizeRarity(source.careerScoreRarity || source.rarity),
      icon:
        source.icon ||
        getRarityIcon(source.rarity),
      secret: Boolean(source.secret),
      unlockHint:
        catalog.unlockHint || source.unlockHint ||
        "",
      factions: Array.isArray(source.factions)
        ? uniqueArray(source.factions.map((faction) => String(faction)))
        : [],
      timing: ["early", "mid", "late", "final"].includes(source.timing)
        ? source.timing
        : source.finalTitle || source.category === "ultimate" ? "final" : "mid",
      finalTitle: Boolean(source.finalTitle || source.category === "ultimate"),
      effects: {
        immediate: { ...(source.effects?.immediate || {}) },
        passive: source.effects?.passive ? { ...source.effects.passive } : null,
        popularity: Number(source.effects?.popularity) || 0,
      },
      unlockReason: source.unlockReason || source.reason || "",
      firstUnlockedBy:
        normalizeFirstUnlockedBy(source.firstUnlockedBy),
      historical: Boolean(source.historical || (!Object.keys(catalog).length && source.id)),
      active: source.active !== false,
      unlockedAtMonth:
        source.unlockedAtMonth ||
        state.game?.month ||
        null,
    };
  }

  const TITLE_FACTION_PATTERNS = Object.freeze({
    pirate: [
      "roi-des-pirates",
      "empereur-des-mers",
      "seigneur-des-pirates",
      "grand-pirate",
      "capitaine-pirate-legendaire",
    ],
    marine: [
      "marine",
      "contre-amiral",
      "vice-amiral",
      "amiral",
      "justice-nouvelle",
    ],
    "bounty-hunter": [
      "chasseur-de-primes",
      "chasseurs",
      "maitre-des-contrats",
      "fleau-des-criminels",
      "tombeur-empereur",
      "terreur-des-pirates",
    ],
    revolutionary: [
      "revolution",
      "revolutionnaire",
      "liberateur",
      "resistance",
      "liberte",
      "porteur-de-la-verite",
    ],
  });

  function getTitleFactionRestrictions(titleData) {
    const title = normalizeTitleData(getDataId(titleData), titleData);
    if (title.factions.length) return title.factions;

    const searchable = slugify(`${title.id} ${title.name}`);
    return uniqueArray(
      Object.entries(TITLE_FACTION_PATTERNS)
        .filter(([, patterns]) =>
          patterns.some((pattern) => searchable.includes(pattern)),
        )
        .map(([factionId]) => factionId),
    );
  }

  function isTitleCompatibleWithFaction(titleData, factionId) {
    if (!titleData || !factionId) return true;
    const factions = getTitleFactionRestrictions(titleData);
    return factions.length === 0 || factions.includes(factionId);
  }

  function getGenericFinalTitle(endingType = "other") {
    const genericTitles = {
      death: { id: "destin-brise", name: "Destin brisé" },
      capture: { id: "prisonnier-des-mers", name: "Prisonnier des mers" },
      defeat: { id: "vaincu-par-les-mers", name: "Vaincu par les mers" },
      retirement: { id: "veteran-des-mers", name: "Vétéran des mers" },
      other: { id: "legende-inachevee", name: "Légende inachevée" },
    };
    const source = genericTitles[endingType] || genericTitles.other;
    return normalizeTitleData(source.id, source);
  }

  const CAREER_FINAL_TITLE_MATRIX = Object.freeze({
    pirate: Object.freeze(["capitaine-de-renom", "terreurs-des-grandes-routes", "legende-des-mers"]),
    marine: Object.freeze(["officier-de-renom", "rempart-de-la-justice", "legende-de-la-marine"]),
    "bounty-hunter": Object.freeze(["chasseur-de-renom", "maitre-de-la-traque", "traqueur-de-legende"]),
    revolutionary: Object.freeze(["voix-de-la-revolte", "etendard-de-la-liberte", "legende-de-la-revolution"]),
  });
  const CAREER_FINAL_TITLE_IDS = new Set([
    "legende-inachevee",
    ...Object.values(CAREER_FINAL_TITLE_MATRIX).flat(),
  ]);
  const INTERRUPTED_ENDING_TYPES = new Set(["death", "defeat", "capture"]);
  const NORMAL_COMPLETION_ENDING_TYPES = new Set(["retirement", "completed", "dreamUnfulfilled", "other"]);

  function normalizeCareerFactionId(factionId) {
    const normalized = slugify(getDataId(factionId));
    const aliases = {
      pirate: "pirate",
      marine: "marine",
      revolutionary: "revolutionary",
      revolutionnaire: "revolutionary",
      "bounty-hunter": "bounty-hunter",
      bountyhunter: "bounty-hunter",
      "chasseur-de-primes": "bounty-hunter",
    };
    return aliases[normalized] || null;
  }

  function getCareerFinalTitle(factionId, popularityValue) {
    const popularity = Number(popularityValue);
    if (!Number.isFinite(popularity)) return getGenericFinalTitle("other");
    const score = Math.max(POPULARITY_MIN, Math.min(POPULARITY_MAX, Math.round(popularity)));
    if (score < 60) return normalizeTitleData("legende-inachevee", findTitleData("legende-inachevee"));
    const faction = normalizeCareerFactionId(factionId);
    const titles = CAREER_FINAL_TITLE_MATRIX[faction];
    if (!titles) return normalizeTitleData("legende-inachevee", findTitleData("legende-inachevee"));
    const titleId = score >= 90 ? titles[2] : score >= 75 ? titles[1] : titles[0];
    return normalizeTitleData(titleId, findTitleData(titleId));
  }

  function getReliableHistoricalPopularity(entry = {}) {
    if (Number.isFinite(Number(entry.popularityScore))) return Number(entry.popularityScore);
    const stats = entry.stats || entry.finalStats;
    if (stats && typeof stats === "object" && Object.keys(stats).length) {
      return calculatePopularityScore(entry);
    }
    return null;
  }

  function isCompletedCareerRecord(entry = {}) {
    const duration = Number(entry.duration ?? entry.finalMonth ?? entry.ending?.finalMonth);
    const endingType = entry.endingType || entry.ending?.type || null;
    return Number.isFinite(duration) && duration >= CONFIG.maxMonths &&
      Boolean(endingType) && NORMAL_COMPLETION_ENDING_TYPES.has(endingType) &&
      !INTERRUPTED_ENDING_TYPES.has(endingType);
  }

  function migrateLegacyCareerFinalTitle(entry = {}, historicalSource = entry) {
    if (!entry || typeof entry !== "object") return entry;
    if (slugify(getDataId(entry.finalTitle)) !== "legende-inachevee" ||
        entry.dreamCompleted === true || entry.ending?.dreamCompleted === true ||
        !isCompletedCareerRecord(entry)) return entry;
    const popularity = getReliableHistoricalPopularity(historicalSource);
    if (!Number.isFinite(popularity) || popularity < 60) return entry;
    const faction = normalizeCareerFactionId(entry.faction);
    if (!faction) return entry;
    const finalTitle = getCareerFinalTitle(faction, popularity);
    return getDataId(finalTitle) === "legende-inachevee"
      ? entry
      : { ...entry, finalTitle };
  }

  function resolveFinalCareerTitle(game, ending, frozenPopularity = null) {
    const factionId = normalizeCareerFactionId(game?.character?.faction);
    const endingType = ending?.type || "other";
    const finalMonth = Number(ending?.finalMonth ?? game?.month);
    const completedCareer = Number.isFinite(finalMonth) && finalMonth >= CONFIG.maxMonths;

    if (INTERRUPTED_ENDING_TYPES.has(endingType) || (!completedCareer && ending?.title)) {
      const destinyTitle = normalizeTitleData(
        slugify(ending?.title?.name || ending?.title || ""),
        ending?.title,
      );
      if (ending?.title && isTitleCompatibleWithFaction(destinyTitle, factionId)) return destinyTitle;
      return getGenericFinalTitle(endingType);
    }

    if (ending?.dreamCompleted || endingType === "dreamCompleted") {
      const dream = findDreamData(game?.character?.dream, game?.character?.faction);
      const ultimateTitle = dream?.ultimate || dream?.ultimateTitle || "Légende des mers";
      const dreamTitle = normalizeTitleData(dream?.ultimateId || slugify(ultimateTitle), ultimateTitle);
      if (isTitleCompatibleWithFaction(dreamTitle, factionId)) return dreamTitle;
    }

    if (completedCareer && !ending?.dreamCompleted) {
      return getCareerFinalTitle(factionId, frozenPopularity);
    }

    if (ending?.title) {
      const endingTitle = normalizeTitleData(slugify(ending.title?.name || ending.title), ending.title);
      if (isTitleCompatibleWithFaction(endingTitle, factionId)) return endingTitle;
    }
    return getGenericFinalTitle(endingType);
  }

  function isMajorFinalTitle(titleData) {
    const title = normalizeTitleData(getDataId(titleData), titleData);
    return title.finalTitle;
  }

  function getBestCompatibleRunTitle(runTitles = [], factionId) {
    return runTitles
      .map((title) => normalizeTitleData(getDataId(title), title))
      .filter(
        (title) =>
          isTitleCompatibleWithFaction(title, factionId) &&
          isMajorFinalTitle(title),
      )
      .sort((a, b) => {
        const ultimateDifference =
          Number(b.category === "ultimate") - Number(a.category === "ultimate");
        if (ultimateDifference) return ultimateDifference;
        return TITLE_RARITIES[b.rarity].rank - TITLE_RARITIES[a.rarity].rank;
      })[0] || null;
  }

  function getCompatibleFinalTitle(titleData, factionId, entry = {}) {
    if (titleData) {
      const normalized = normalizeTitleData(getDataId(titleData), titleData);
      if (isTitleCompatibleWithFaction(normalized, factionId)) return normalized;
    }

    return (
      getBestCompatibleRunTitle(entry.runTitles, factionId) ||
      getGenericFinalTitle(entry.endingType || entry.ending?.type || "other")
    );
  }

  function applyPastLifeHeroRarity(titleData) {
    if (!dom.pastLifeHero) return "neutral";
    const visualRarity = titleData
      ? resolveTitleRarity(getDataId(titleData), titleData)
      : "neutral";
    dom.pastLifeHero.dataset.rarity = visualRarity;
    return visualRarity;
  }

  function createTitleCardHtml(titleData, options = {}) {
    const mode = ["full", "compact", "badge"].includes(options.mode)
      ? options.mode
      : "full";
    const locked = Boolean(options.locked);
    const title = normalizeTitleData(getDataId(titleData), titleData);
    const rarity = normalizeRarity(title.rarity);
    const icon = locked ? "🔒" : title.icon || getRarityIcon(rarity);
    const hiddenName = locked && title.secret;
    const name = hiddenName ? "Titre secret" : title.name;
    const description = hiddenName
      ? "Poursuis ton aventure pour révéler ce titre."
      : title.description;
    const unlockHint = locked
      ? "Moyen d’obtention inconnu"
      : title.unlockHint || "Condition non documentée.";
    const firstUnlockedBy = title.firstUnlockedBy;
    const immediateEffect = formatEffectsText(title.effects?.immediate || {});
    const passive = title.effects?.passive;
    const passiveText = passive?.type === "statGainModifier" && STATS[passive.stat]
      ? `Les futurs gains de ${STATS[passive.stat].label} sont renforcés de ${Math.round((Number(passive.value) || 0) * 100)} %.`
      : "";
    const boostText = title.finalTitle
      ? "Titre de conclusion — aucune amélioration active."
      : [immediateEffect && `Bonus : ${immediateEffect}`, passiveText].filter(Boolean).join(" ");

    if (mode === "badge") {
      return `
        <span
          class="title-card title-card-badge${locked ? " locked" : " unlocked"}"
          data-rarity="${escapeAttribute(rarity)}"
          aria-label="Titre ${escapeAttribute(getRarityLabel(rarity).toLowerCase())} : ${escapeAttribute(name)}"
        >
          <span class="title-card-icon" aria-hidden="true">${escapeHtml(icon)}</span>
          <span class="title-card-name">${escapeHtml(name)}</span>
        </span>
      `;
    }

    return `
      <article
        class="title-card title-card-${mode}${locked ? " locked" : " unlocked"}"
        data-rarity="${escapeAttribute(rarity)}"
        aria-label="Titre ${escapeAttribute(getRarityLabel(rarity).toLowerCase())} : ${escapeAttribute(name)}"
      >
        <span class="title-card-icon" aria-hidden="true">${escapeHtml(icon)}</span>
        <div class="title-card-content">
          ${mode !== "badge" ? `
            <p class="title-card-rarity">${escapeHtml(getRarityLabel(rarity))}</p>
          ` : ""}
          <h3 class="title-card-name">${escapeHtml(name)}</h3>
          ${!locked && boostText ? `
            <p class="title-card-boost">${escapeHtml(boostText)}</p>
          ` : ""}
          ${mode === "full" && description ? `
            <p class="title-card-description">${escapeHtml(description)}</p>
          ` : ""}
          ${mode === "compact" && options.showReason && title.unlockReason ? `
            <p class="title-card-reason">${escapeHtml(title.unlockReason)}</p>
          ` : ""}
          ${mode === "full" && title.category ? `
            <p class="title-card-category">${escapeHtml(
              getTitleCategoryLabel(title.category),
            )}</p>
          ` : ""}
          ${mode === "full" ? `
            <div class="title-card-unlock">
              <strong>Obtention</strong>
              <span>${escapeHtml(unlockHint)}</span>
            </div>
            ${locked ? `
              <p class="title-card-status">🔒 Non débloqué</p>
            ` : `
              <p class="title-card-owner">
                <strong>Obtenu par :</strong>
                ${firstUnlockedBy ? `
                  <span aria-hidden="true">${getFactionIcon(firstUnlockedBy.faction)}</span>
                  ${escapeHtml(firstUnlockedBy.characterName)}
                ` : "Personnage d’origine inconnu"}
              </p>
            `}
          ` : ""}
        </div>
      </article>
    `;
  }

  function unlockTitle(
    titleId,
    titleData = null,
    game = state.game,
    shouldSave = true,
  ) {
    if (!game || !titleId) {
      return false;
    }

    const alreadyUnlocked =
      game.runTitles.some(
        (title) =>
          getDataId(title) === titleId,
      );

    if (alreadyUnlocked) {
      return false;
    }

    if (titleId === "maitrise-haki-des-rois-plus") {
      if (getFirstDecisiveHakiType(game) !== "conquerors") {
        console.error("[Blue Legacy] Attribution interdite de Maîtrise du Haki des Rois+ : le Haki des Rois n’a pas été éveillé au premier événement décisif.", {
          firstDecisiveHakiType: getFirstDecisiveHakiType(game),
          eventId: game.currentEvent?.id,
        });
        return false;
      }
      game.runTitles = game.runTitles.filter(
        (title) => getDataId(title) !== "haki-des-rois",
      );
    }

    const source =
      titleData ||
      findTitleData(titleId) ||
      titleId;

    const normalizedTitle = normalizeTitleData(titleId, source);
    if (!normalizedTitle.unlockReason) {
      normalizedTitle.unlockReason = game.currentEvent?.title
        ? `Obtenu après « ${game.currentEvent.title} ».`
        : `Obtenu au mois ${Math.min(Number(game.month) || 1, CONFIG.maxMonths)}.`;
    }
    game.runTitles.push(normalizedTitle);
    applyTitleImmediateEffect(normalizedTitle, game);
    refreshPopularityScore(game);

    if (shouldSave) {
      saveGame();
    }

    return true;
  }

  function applyTitleImmediateEffect(titleData, game = state.game) {
    if (!game || !titleData) return false;
    const title = normalizeTitleData(getDataId(titleData), titleData);
    game.appliedTitleEffects ||= [];
    if (game.appliedTitleEffects.includes(title.id)) return false;
    if (!title.finalTitle) {
      applyStatChanges(title.effects?.immediate || {}, game.stats, {
        game,
        source: "title",
        ignoreDiminishingReturns: true,
        ignoreTitlePassives: true,
      });
    }
    game.appliedTitleEffects.push(title.id);
    return true;
  }

  function checkCatalogTitles(game = state.game, maximum = Infinity) {
    if (!game) return [];
    const unlocked = [];
    getAllTitles().forEach((title) => {
      if (unlocked.length >= maximum) return;
      const id = getDataId(title);
      if (!id || typeof title.condition !== "function" ||
          game.runTitles.some((current) => getDataId(current) === id)) return;
      try {
        if (title.condition({ ...createEventContext(game), game })) {
          if (unlockTitle(id, title, game, false)) unlocked.push(id);
        }
      } catch (error) {
        console.warn(`[Blue Legacy] Condition invalide pour le titre "${id}".`, error);
      }
    });
    return unlocked;
  }

  /* ========================================================
     SUCCÈS
  ======================================================== */

  function getAllAchievements() {
    const sources = [
      window.SEA_OF_LEGENDS_ACHIEVEMENTS,
      window.GAME_ACHIEVEMENTS,
      window.ACHIEVEMENTS,
      window.GAME_DATA?.achievements,
    ];

    const arraySource =
      sources.find(Array.isArray);

    if (arraySource) {
      return arraySource;
    }

    const objectSource =
      sources.find(
        (source) =>
          source &&
          typeof source === "object",
      );

    return objectSource
      ? Object.values(objectSource)
      : [];
  }

  function findAchievementData(
    achievementId,
  ) {
    return (
      getAllAchievements().find(
        (achievement) =>
          getDataId(achievement) === achievementId,
      ) || null
    );
  }

  function getAchievementRecord(profile, achievementId) {
    return (profile?.achievements || []).find(
      (record) => getDataId(record) === achievementId,
    ) || null;
  }

  function getAchievementRuns(profile = getProfile(), game = state.game) {
    return [
      ...(profile.pantheon || []),
      ...(game ? [game] : []),
    ];
  }

  const ACHIEVEMENT_CONDITION_TYPES = new Set([
    "all-of", "runs-completed", "final-month", "zone-visited", "origins-played",
    "factions-played", "special-zones-visited", "faction-stat",
    "faction-dream-completed", "dreams-completed", "unique-dreams-completed",
    "has-d", "stat-at-least", "max-stat-at-least", "finished-stat-at-most",
    "zone-with-stat-at-most", "telemetry-at-least", "has-fruit",
    "finished-with-fruit", "unique-fruits", "zone-without-fruit",
    "d-and-dream-completed", "titles-unlocked", "has-title", "has-any-title",
    "legendary-companion-recruited", "shop-items-owned", "finished-with-shop-items",
    "finished-popularity", "legendary-arc-encountered", "legendary-arc-title",
    "both-legendary-arcs", "three-legendary-arcs",
  ]);

  function getAchievementProgress(achievement, profile = getProfile(), game = state.game) {
    const condition = achievement?.condition || {};
    const runs = getAchievementRuns(profile, game);
    const finishedRuns = runs.filter((run) =>
      Boolean(run?.isFinished || run?.finishedAt || run?.endingType || run?.ending),
    );
    const uniqueValues = (values) => new Set(values.filter(Boolean)).size;
    const runStats = (run) => run?.stats || {};
    const visited = (run, zoneId) =>
      (run?.visitedZoneIds || []).includes(zoneId);
    const matchingRuns = (predicate) => runs.filter(predicate);
    let current = 0;
    let target = Number(condition.target) || 1;

    switch (condition.type) {
      case "all-of": {
        const conditions = Array.isArray(condition.conditions) ? condition.conditions : [];
        const results = conditions.map((nestedCondition) =>
          getAchievementProgress({ condition: nestedCondition }, profile, game));
        current = results.filter((result) => result.unlocked).length;
        target = conditions.length || 1;
        break;
      }
      case "runs-completed":
        current = (profile.pantheon?.length || 0) +
          (game?.isFinished && !profile.pantheon?.some((entry) => entry.id === game.id) ? 1 : 0);
        break;
      case "final-month":
        current = Math.max(0, ...runs.map((run) =>
          Number(run.duration || run.finalMonth || run.ending?.finalMonth || run.month) || 0,
        ));
        break;
      case "zone-visited":
        current = runs.some((run) => visited(run, condition.zoneId)) ? 1 : 0;
        break;
      case "origins-played":
        current = uniqueValues(runs.map((run) => run.origin || run.character?.origin));
        break;
      case "factions-played":
        current = uniqueValues(finishedRuns.map((run) => run.faction || run.character?.faction));
        break;
      case "special-zones-visited": {
        const specialIds = new Set(
          (window.GAME_DATA?.zones || []).filter((zone) => zone.special).map((zone) => zone.id),
        );
        current = uniqueValues(runs.flatMap((run) =>
          (run.visitedZoneIds || []).filter((id) => specialIds.has(id)),
        ));
        break;
      }
      case "faction-stat":
        current = matchingRuns((run) => {
          const faction = run.faction || run.character?.faction;
          const finished = run.isFinished || run.finishedAt || run.endingType || run.ending;
          return faction === condition.faction &&
            (!condition.finished || finished) &&
            Number(runStats(run)[condition.stat]) >= Number(condition.minimum);
        }).length ? 1 : 0;
        break;
      case "faction-dream-completed":
        current = finishedRuns.some((run) =>
          (run.faction || run.character?.faction) === condition.faction &&
          Boolean(run.dreamCompleted || run.ending?.dreamCompleted),
        ) ? 1 : 0;
        break;
      case "dreams-completed":
        current = finishedRuns.filter((run) =>
          Boolean(run.dreamCompleted || run.ending?.dreamCompleted),
        ).length;
        break;
      case "unique-dreams-completed":
        current = uniqueValues(finishedRuns
          .filter((run) => run.dreamCompleted || run.ending?.dreamCompleted)
          .map((run) => run.dream || run.character?.dream));
        break;
      case "has-d":
        current = runs.some((run) => Boolean(run.hasD || run.character?.hasD)) ? 1 : 0;
        break;
      case "stat-at-least":
        current = Math.max(0, ...runs.map((run) => Number(runStats(run)[condition.stat]) || 0));
        break;
      case "max-stat-at-least":
        current = Math.max(0, ...runs.map((run) =>
          Number(run.achievementProgress?.maxStats?.[condition.stat] ?? runStats(run)[condition.stat]) || 0,
        ));
        break;
      case "finished-stat-at-most":
        current = finishedRuns.some((run) =>
          Number(runStats(run)[condition.stat]) <= Number(condition.target),
        ) ? 1 : 0;
        target = 1;
        break;
      case "zone-with-stat-at-most":
        current = runs.some((run) =>
          visited(run, condition.zoneId) &&
          Number(runStats(run)[condition.stat]) <= Number(condition.target),
        ) ? 1 : 0;
        target = 1;
        break;
      case "telemetry-at-least":
        current = Math.max(0, ...runs.map((run) =>
          Number(run.achievementProgress?.[condition.key]) || 0,
        ));
        break;
      case "has-fruit":
        current = runs.some((run) => Boolean(run.devilFruit || run.character?.devilFruit)) ? 1 : 0;
        break;
      case "finished-with-fruit":
        current = finishedRuns.some((run) => Boolean(run.devilFruit || run.character?.devilFruit)) ? 1 : 0;
        break;
      case "unique-fruits":
        current = uniqueValues(finishedRuns.map((run) =>
          getDataId(run.devilFruit || run.character?.devilFruit),
        ));
        break;
      case "zone-without-fruit":
        current = runs.some((run) =>
          visited(run, condition.zoneId) &&
          !Boolean(run.devilFruit || run.character?.devilFruit),
        ) ? 1 : 0;
        break;
      case "d-and-dream-completed":
        current = finishedRuns.some((run) =>
          Boolean(run.hasD || run.character?.hasD) &&
          Boolean(run.dreamCompleted || run.ending?.dreamCompleted),
        ) ? 1 : 0;
        break;
      case "titles-unlocked":
        current = profile.titles?.length || 0;
        break;
      case "has-title": {
        const titleId = condition.titleId;
        current = runs.some((run) => (run.runTitles || []).some((title) => getDataId(title) === titleId)) ||
          (profile.titles || []).some((title) => getDataId(title) === titleId) ? 1 : 0;
        target = 1;
        break;
      }
      case "has-any-title": {
        const titleIds = new Set(condition.titleIds || []);
        current = runs.some((run) => (run.runTitles || []).some((title) => titleIds.has(getDataId(title)))) ||
          (profile.titles || []).some((title) => titleIds.has(getDataId(title))) ? 1 : 0;
        target = 1;
        break;
      }
      case "legendary-companion-recruited":
        current = runs.some((run) => (run.crewMembers || []).some((member) =>
          normalizeRarity(member?.rarity) === "legendary" ||
          normalizeRarity((window.GAME_DATA?.crewRecruitments || [])
            .find((candidate) => candidate.id === getDataId(member))?.rarity) === "legendary",
        )) ? 1 : 0;
        target = 1;
        break;
      case "shop-items-owned":
        current = uniqueArray(profile.ownedShopItems).length;
        break;
      case "finished-with-shop-items":
        current = Math.max(0, ...finishedRuns.map((run) =>
          uniqueArray(run.activeShopItems).length,
        ));
        break;
      case "finished-popularity":
        current = Math.max(0, ...finishedRuns.map((run) =>
          Number(runStats(run).popularity ?? run.popularityScore) || 0,
        ));
        break;
      case "legendary-arc-encountered":
        current = runs.some((run) => {
          const arc = run.legendaryArcs?.[condition.arcId];
          return arc && !["unassessed", "not-selected"].includes(arc.status);
        }) ? 1 : 0;
        target = 1;
        break;
      case "legendary-arc-title":
        current = runs.some((run) => Boolean(run.legendaryArcs?.[condition.arcId]?.titleId)) ? 1 : 0;
        target = 1;
        break;
      case "both-legendary-arcs":
        current = runs.some((run) => ["marineford", "emperor"].every((arcId) => {
          const arc = run.legendaryArcs?.[arcId];
          return arc && ["succeeded", "failed", "completed-no-title"].includes(arc.status);
        })) ? 1 : 0;
        target = 1;
        break;
      case "three-legendary-arcs":
        current = runs.some((run) => ["talent", "marineford", "emperor"].every((arcId) => {
          const arc = run.legendaryArcs?.[arcId];
          return arc && !["unassessed", "not-selected"].includes(arc.status);
        })) ? 1 : 0;
        target = 1;
        break;
      default:
        current = 0;
    }

    return {
      current: Math.max(0, Math.min(current, target)),
      target,
      unlocked: current >= target,
    };
  }

  const achievementNotificationQueue = [];
  let achievementNotificationActive = false;

  function queueAchievementNotification(achievement) {
    if (!achievement) return;
    achievementNotificationQueue.push(achievement);
    showNextAchievementNotification();
  }

  function showNextAchievementNotification() {
    if (achievementNotificationActive || !achievementNotificationQueue.length) return;
    achievementNotificationActive = true;
    const achievement = achievementNotificationQueue.shift();
    const rarity = normalizeRarity(achievement.rarity);
    const toast = document.createElement("div");
    toast.className = "achievement-toast";
    toast.dataset.rarity = rarity;
    toast.setAttribute("role", "status");
    toast.setAttribute("tabindex", "0");
    toast.setAttribute("aria-label", `Succès débloqué : ${achievement.name}. Cliquer pour fermer.`);
    toast.innerHTML = `
      <span class="achievement-toast-icon" aria-hidden="true">${escapeHtml(achievement.icon || "🏆")}</span>
      <span><small>🏆 Succès débloqué</small><strong>${escapeHtml(achievement.name)}</strong></span>
    `;
    document.body.append(toast);
    let dismissed = false;
    const dismiss = (event) => {
      if (dismissed) return;
      dismissed = true;
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      window.clearTimeout(autoDismissTimer);
      toast.remove();
      achievementNotificationActive = false;
      showNextAchievementNotification();
    };
    toast.addEventListener("click", dismiss);
    toast.addEventListener("keydown", (event) => {
      if (["Enter", " ", "Escape"].includes(event.key)) dismiss(event);
    });
    const autoDismissTimer = window.setTimeout(
      dismiss,
      document.body.classList.contains("reduced-motion") ? 1800 : 3200,
    );
  }

  function unlockAchievement(
    achievementId,
    game = state.game,
    shouldSave = true,
    notify = true,
  ) {
    if (!achievementId) {
      return false;
    }

    const achievement = findAchievementData(achievementId);
    if (!achievement) return false;
    const profile = getProfile();
    if (getAchievementRecord(profile, achievementId)) return false;
    const unlockedAt = new Date().toISOString();
    profile.achievements.push({
      id: achievementId,
      unlockedAt,
      unlockedBy: game?.character?.name
        ? {
            characterName: game.character.name,
            faction: game.character.faction || null,
            adventureId: game.id || null,
          }
        : null,
    });
    if (!profile.rewardedAchievementIds.includes(achievementId)) {
      profile.berries += getAchievementBerryReward(achievement);
      profile.rewardedAchievementIds.push(achievementId);
    }
    if (game && !game.runAchievements.includes(achievementId)) {
      game.runAchievements.push(achievementId);
    }
    saveProfile(profile);
    if (notify) queueAchievementNotification(achievement);

    if (shouldSave) {
      saveGame();
    }

    return true;
  }

  function checkAchievements(game = state.game, { retroactive = false } = {}) {
    const profile = getProfile();
    const unlocked = [];

    getAllAchievements().forEach((achievement) => {
        const id = getDataId(achievement);
        if (!id || getAchievementRecord(profile, id)) return;
        try {
          const progress = getAchievementProgress(achievement, profile, game);
          if (progress.unlocked && unlockAchievement(id, game, false, !retroactive)) {
            unlocked.push(id);
          }
        } catch (error) {
          console.error(
            `[Blue Legacy] Erreur dans le succès "${id}".`,
            error,
          );
        }
      });

    if (game && unlocked.length) saveGame();

    return unlocked;
  }

  function validateAchievementCatalog() {
    const achievements = getAllAchievements();
    const categories = window.BLUE_LEGACY_ACHIEVEMENT_CATEGORY_META || {};
    const validStats = new Set(Object.keys(STATS));
    const validRarities = new Set(Object.keys(TITLE_RARITIES));
    const seen = new Set();
    const warnings = [];
    const validateCondition = (condition, achievementId, path = "condition") => {
      if (!condition?.type) {
        warnings.push(`Condition manquante : ${achievementId}/${path}`);
        return;
      }
      if (!ACHIEVEMENT_CONDITION_TYPES.has(condition.type)) {
        warnings.push(`Type de condition inconnu : ${achievementId}/${path}/${condition.type}`);
      }
      if (condition.type === "all-of") {
        if (!Array.isArray(condition.conditions) || condition.conditions.length < 2) {
          warnings.push(`Condition all-of invalide : ${achievementId}/${path}`);
          return;
        }
        condition.conditions.forEach((nested, index) =>
          validateCondition(nested, achievementId, `${path}.conditions[${index}]`));
      }
      if (condition.stat && !validStats.has(condition.stat)) warnings.push(`Statistique inconnue : ${achievementId}/${path}`);
      if ("target" in condition && Number(condition.target) <= 0) warnings.push(`Cible invalide : ${achievementId}/${path}`);
    };
    achievements.forEach((achievement) => {
      const id = getDataId(achievement);
      if (!id || seen.has(id)) warnings.push(`Identifiant de Succès invalide ou dupliqué : ${id || "(vide)"}`);
      seen.add(id);
      if (!categories[achievement.category]) warnings.push(`Catégorie inconnue : ${id}`);
      if (!validRarities.has(normalizeRarity(achievement.rarity))) warnings.push(`Rareté inconnue : ${id}`);
      validateCondition(achievement.condition, id);
      if (!achievement.description) warnings.push(`Description manquante : ${id}`);
      if (!achievement.unlockHint) warnings.push(`Moyen d’obtention manquant : ${id}`);
      if (achievement.secret && achievement.unlockHint !== "Condition secrète") warnings.push(`Secret révélant sa condition : ${id}`);
      if (achievement.effects || achievement.boost || achievement.rewards) warnings.push(`Effet interdit sur un Succès : ${id}`);
    });
    if (achievements.length < 25) warnings.push("Le catalogue contient moins de 25 Succès.");
    const titles = getAllTitles();
    if (titles.length < 25) warnings.push("Le catalogue contient moins de 25 Titres.");
    const seenTitleIds = new Set();
    const validTitleTimings = new Set(["early", "mid", "late", "final"]);
    titles.forEach((title) => {
      const id = getDataId(title);
      if (!id || seenTitleIds.has(id)) warnings.push(`Identifiant de Titre invalide ou dupliqué : ${id || "(vide)"}`);
      seenTitleIds.add(id);
      if (!title.category) warnings.push(`Titre sans catégorie : ${id}`);
      if (!Array.isArray(title.factions)) warnings.push(`Titre sans compatibilité de faction : ${id}`);
      const normalized = normalizeTitleData(id, title);
      if (!validTitleTimings.has(normalized.timing)) warnings.push(`Moment d’obtention invalide : ${id}`);
      if (normalized.finalTitle && normalized.timing !== "final") warnings.push(`Titre final mal classé : ${id}`);
      const immediateEntries = Object.entries(normalized.effects?.immediate || {});
      immediateEntries.forEach(([statId, value]) => {
        if (!STATS[statId] || ["ship", "morale"].includes(statId)) warnings.push(`Statistique de Titre invalide : ${id}/${statId}`);
        if (!Number.isFinite(Number(value))) warnings.push(`Bonus de Titre invalide : ${id}/${statId}`);
      });
      const immediateTotal = immediateEntries.reduce((sum, [, value]) => sum + Math.abs(Number(value) || 0), 0);
      if (immediateTotal > 15) warnings.push(`Bonus immédiat excessif : ${id}/${immediateTotal}`);
      const passive = normalized.effects?.passive;
      if (passive && (passive.type !== "statGainModifier" || !STATS[passive.stat] || Number(passive.value) <= 0 || Number(passive.value) > 0.15)) {
        warnings.push(`Passif de Titre invalide : ${id}`);
      }
      if (normalized.finalTitle && immediateTotal) warnings.push(`Titre final avec boost actif inutile : ${id}`);
      if (!normalized.finalTitle && !immediateTotal && !passive && !Number(normalized.effects?.popularity)) {
        warnings.push(`Titre non final sans effet : ${id}`);
      }
    });
    if (!dom.gameActiveTitles) warnings.push("Section des Titres actifs absente du panneau de statistiques.");
    warnings.forEach((warning) => console.warn(`[Blue Legacy] ${warning}`));
    return warnings;
  }

  function runDivelcaAchievementAudit() {
    const achievement = findAchievementData("divelca");
    const makeProfile = (runCount, dreamCount) => {
      const profile = createDefaultProfile();
      profile.pantheon = Array.from({ length: runCount }, (_, index) => ({
        id: `divelca-audit-${index}`,
        finishedAt: "2026-01-01T00:00:00.000Z",
        dreamCompleted: index < dreamCount,
        stats: {},
      }));
      return profile;
    };
    const cases = [
      [0, 0, false], [24, 1, false], [25, 0, false], [25, 1, true],
      [25, 8, true], [40, 0, false], [40, 1, true], [27, 3, true],
    ];
    const checks = Object.fromEntries(cases.map(([runs, dreams, expected]) => {
      const unlocked = getAchievementProgress(achievement, makeProfile(runs, dreams), null).unlocked;
      return [`${runs}-runs-${dreams}-dreams`, unlocked === expected];
    }));
    const liveProfile = makeProfile(24, 1);
    const liveGame = { id: "divelca-live-25", isFinished: true, dreamCompleted: false, stats: {} };
    checks["25th-run-counted-immediately"] = getAchievementProgress(achievement, liveProfile, liveGame).unlocked;
    const firstDreamProfile = makeProfile(25, 0);
    const firstDreamGame = { id: "divelca-live-26", isFinished: true, dreamCompleted: true, stats: {} };
    checks["first-dream-after-25"] = getAchievementProgress(achievement, firstDreamProfile, firstDreamGame).unlocked;
    checks["catalog-valid"] = !validateAchievementCatalog().some((warning) => warning.includes("divelca"));
    checks["secret-hint"] = achievement?.secret === true && achievement?.unlockHint === "Condition secrète";
    checks["mythic-reward"] = getAchievementBerryReward(achievement) === 300;
    return { pass: Object.values(checks).every(Boolean), checks };
  }

  function runDivelcaPersistenceAudit() {
    const originalProfile = localStorage.getItem(CONFIG.profileKey);
    try {
      const profile = createDefaultProfile();
      profile.pantheon = Array.from({ length: 27 }, (_, index) => ({
        id: `divelca-retroactive-${index}`,
        finishedAt: "2026-01-01T00:00:00.000Z",
        dreamCompleted: index < 3,
        stats: {},
      }));
      localStorage.setItem(CONFIG.profileKey, JSON.stringify(profile));
      const firstUnlocks = checkAchievements(null, { retroactive: true });
      const afterFirst = getProfile();
      const firstBerries = afterFirst.berries;
      const secondUnlocks = checkAchievements(null, { retroactive: true });
      const afterSecond = getProfile();
      const divelcaRecords = afterSecond.achievements.filter((record) => getDataId(record) === "divelca").length;
      const rewardRecords = afterSecond.rewardedAchievementIds.filter((id) => id === "divelca").length;
      const checks = {
        "retroactive-unlock-once": firstUnlocks.includes("divelca") && !secondUnlocks.includes("divelca"),
        "single-achievement-record": divelcaRecords === 1,
        "single-reward-record": rewardRecords === 1,
        "no-second-payment": afterSecond.berries === firstBerries,
      };
      return { pass: Object.values(checks).every(Boolean), checks };
    } finally {
      if (originalProfile === null) localStorage.removeItem(CONFIG.profileKey);
      else localStorage.setItem(CONFIG.profileKey, originalProfile);
    }
  }

  /* ========================================================
     RÉCOMPENSES
  ======================================================== */

  function normalizeReward(rewardData) {
    if (typeof rewardData === "string") {
      return {
        id: createUniqueId("reward"),
        type: "reward",
        name: rewardData,
        text: rewardData,
        description: "",
        rarity: "common",
        icon: null,
        important: false,
        major: false,
        effects: {},
        title: null,
        achievement: null,
        grantedAtMonth: state.game?.month || null,
      };
    }

    return {
      id:
        rewardData?.id ||
        createUniqueId("reward"),
      type:
        rewardData?.type ||
        "reward",
      name:
        rewardData?.name ||
        rewardData?.label ||
        rewardData?.text ||
        "Récompense obtenue",
      text:
        rewardData?.text ||
        rewardData?.label ||
        "Récompense obtenue",
      description:
        rewardData?.description ||
        rewardData?.desc ||
        "",
      rarity: normalizeRarity(rewardData?.rarity),
      icon: rewardData?.icon || null,
      important: Boolean(rewardData?.important),
      major: Boolean(
        rewardData?.major ||
        rewardData?.isMajor,
      ),
      effects: {
        ...(rewardData?.effects || {}),
      },
      title:
        rewardData?.title ||
        null,
      achievement:
        rewardData?.achievement ||
        null,
      grantedAtMonth:
        state.game?.month ||
        null,
    };
  }

  function grantReward(
    rewardData,
    game = state.game,
    shouldSave = true,
  ) {
    if (!game || !rewardData) {
      return false;
    }

    const reward =
      normalizeReward(rewardData);

    if (
      game.rewards.some(
        (existingReward) =>
          existingReward.id === reward.id,
      )
    ) {
      return false;
    }

    game.rewards.push(reward);

    applyStatChanges(
      reward.effects,
      game.stats,
    );

    if (reward.title) {
      const titleId = getDataId(reward.title);
      const unlocked = unlockTitle(
        titleId,
        reward.title,
        game,
        false,
      );
      if (unlocked) {
        queueRewardReveal({
          type: "title",
          data: game.runTitles.find((title) => getDataId(title) === titleId),
        }, game);
      }
    }

    if (reward.achievement) {
      unlockAchievement(
        getDataId(reward.achievement),
        game,
        false,
      );
    }

    if (shouldSave) {
      saveGame();
    }

    return true;
  }

  function createRewardRevealData(rewardRecord) {
    if (!rewardRecord) return null;
    const type = rewardRecord.type || rewardRecord.data?.type || "reward";
    const raw = rewardRecord.data || rewardRecord;

    if (type === "title") {
      const title = normalizeTitleData(getDataId(raw), raw);
      const rarity = normalizeRarity(title.rarity);
      const immediate = formatEffectsText(title.effects?.immediate || {});
      const passive = title.effects?.passive;
      const passiveText = passive?.type === "statGainModifier" && STATS[passive.stat]
        ? `Gains futurs de ${STATS[passive.stat].label} +${Math.round((Number(passive.value) || 0) * 100)} %.`
        : "";
      return {
        type,
        id: title.id,
        name: title.name,
        description: [title.unlockReason, immediate && `Bonus immédiat : ${immediate}.`, passiveText]
          .filter(Boolean).join(" ") || title.description,
        rarity,
        icon: title.icon || getRarityIcon(rarity),
        meta: getRarityLabel(rarity),
      };
    }

    if (type === "devilFruit") {
      const fruit = normalizeDevilFruit(raw);
      return {
        type,
        id: fruit.id,
        name: fruit.name,
        description: fruit.description || "",
        rarity: normalizeRarity(fruit.rarity || "epic"),
        icon: fruit.icon || "🍈",
        meta: `Fruit du Démon • ${fruit.type || "Type inconnu"}`,
      };
    }

    const reward = normalizeReward(raw);
    const rarity = normalizeRarity(reward.rarity);
    const revealableType = [
      "item",
      "weapon",
      "navigation",
      "ship",
      "reward",
      "combatStyle",
      "style",
      "achievement",
    ].includes(type);
    const important =
      reward.major ||
      reward.important ||
      raw.major ||
      raw.important ||
      TITLE_RARITIES[rarity].rank >= TITLE_RARITIES.rare.rank;
    if (!revealableType || !important) return null;

    return {
      type,
      id: reward.id,
      name: reward.name || reward.text,
      description: reward.description || "",
      rarity,
      icon: getRewardTypeIcon({ ...reward, type }),
      meta:
        type === "combatStyle" || type === "style"
          ? "Style exceptionnel"
          : getRarityLabel(rarity),
    };
  }

  function queueRewardReveal(rewardRecord, game = state.game, source = {}) {
    if (!game) return false;
    const reveal = createRewardRevealData(rewardRecord);
    if (!reveal) return false;
    reveal.sourceResolutionId = source.resolutionId || rewardRecord?.sourceResolutionId || null;
    reveal.eventId = source.eventId || rewardRecord?.eventId || null;
    game.pendingRewardReveals ||= [];
    const duplicate = game.pendingRewardReveals.some(
      (queued) =>
        queued.type === reveal.type &&
        queued.id === reveal.id &&
        queued.sourceResolutionId === reveal.sourceResolutionId,
    );
    if (!duplicate) game.pendingRewardReveals.push(reveal);
    return !duplicate;
  }

  function queueRewardReveals(rewards = [], game = state.game, source = {}) {
    return rewards.reduce(
      (count, reward) => count + (queueRewardReveal(reward, game, source) ? 1 : 0),
      0,
    );
  }

  const REWARD_REVEAL_RARITY_CLASSES = Object.freeze(
    Object.keys(TITLE_RARITIES).map((rarity) => `reward-reveal--${rarity}`),
  );

  function applyRewardRevealRarityTheme(reveal, rarity) {
    if (!dom.rewardRevealCard) return;
    dom.rewardRevealCard.classList.remove(...REWARD_REVEAL_RARITY_CLASSES);
    dom.rewardRevealCard.classList.add(`reward-reveal--${rarity}`);
    dom.rewardRevealCard.dataset.rarity = rarity;
    dom.rewardRevealCard.dataset.rewardType = reveal?.type || "reward";
  }

  function updateRewardRevealScreen() {
    const reveal = state.game?.pendingRewardReveals?.[0];
    if (!reveal) return;
    const rarity = normalizeRarity(reveal.rarity);

    if (dom.rewardRevealCard) {
      applyRewardRevealRarityTheme(reveal, rarity);
      dom.rewardRevealCard.classList.remove("reward-reveal-animate");
      void dom.rewardRevealCard.offsetWidth;
      dom.rewardRevealCard.classList.add("reward-reveal-animate");
      dom.rewardRevealCard.tabIndex = -1;
      requestAnimationFrame(() => dom.rewardRevealCard?.focus());
    }
    if (dom.rewardRevealIcon) {
      dom.rewardRevealIcon.textContent =
        reveal.icon || getRewardTypeIcon(reveal);
    }
    if (dom.rewardRevealEyebrow) {
      dom.rewardRevealEyebrow.textContent =
        reveal.type === "devilFruit"
          ? "Fruit du Démon"
          : reveal.type === "title"
            ? "Titre obtenu"
          : "Récompense majeure";
    }
    if (dom.rewardRevealName) {
      dom.rewardRevealName.textContent = reveal.name || "Récompense obtenue";
    }
    if (dom.rewardRevealRarity) {
      dom.rewardRevealRarity.textContent =
        reveal.meta || getRarityLabel(rarity);
    }
    if (dom.rewardRevealDescription) {
      dom.rewardRevealDescription.textContent =
        reveal.description || "Cette récompense marque une nouvelle étape de ton aventure.";
    }
    if (dom.continueRewardReveal) {
      dom.continueRewardReveal.disabled = false;
    }
  }

  function continueAfterRewardReveal() {
    const game = state.game;
    if (!game?.pendingRewardReveals?.length) return false;
    if (dom.continueRewardReveal) dom.continueRewardReveal.disabled = true;

    game.pendingRewardReveals.shift();
    saveGame();
    if (game.pendingRewardReveals.length) {
      updateRewardRevealScreen();
      return true;
    }
    openScreen(SCREEN.GAME, { save: false });
    return finishEvent();
  }

  /* ========================================================
     FIN D'AVENTURE
  ======================================================== */

  function finishAdventure(finalData = {}) {
    const game = state.game;

    if (!game || game.isFinished) {
      return false;
    }

    const ending =
      normalizeEndingData(finalData);

    game.ending = {
      ...ending,
      finishedAt: new Date().toISOString(),
      finalMonth: Math.min(
        game.month,
        CONFIG.maxMonths,
      ),
    };

    game.isFinished = true;

    checkCatalogTitles(game);
    checkAchievements(game);
    refreshPopularityScore(game);
    const frozenPopularity = clampCareerScore(game.stats.popularity);

    const finalTitle =
      determineFinalTitle(
        ending,
        game,
        frozenPopularity,
      );

    if (finalTitle) {
      unlockTitle(
        getDataId(finalTitle),
        finalTitle,
        game,
        false,
      );
    }
    refreshPopularityScore(game);

    const profile = getProfile();
    grantCompletionBerries(profile, game, ending);

    const pantheonEntry =
      createPantheonEntry(
        ending,
        finalTitle,
        game,
      );

    profile.statistics.completedAdventures += 1;

    if (ending.success) {
      profile.statistics.successfulAdventures += 1;
    }

    validateRunRewards(
      profile,
      game,
    );
    grantOutstandingAchievementBerries(profile);

    addToPantheon(
      pantheonEntry,
      profile,
    );

    saveProfile(profile);
    deleteSave();

    state.result = {
      type: "adventureEnd",
      ending,
      finalTitle,
      pantheonEntryId:
        pantheonEntry.id,
    };

    state.selectedPastLifeId =
      pantheonEntry.id;

    state.game = null;

    openScreen(
      SCREEN.PANTHEON,
      {
        save: false,
      },
    );

    // La carrière locale est déjà enregistrée et affichée avant tout accès réseau.
    void window.BlueLegacyLeaderboard?.submitCareer({
      playerFirstName: profile.playerIdentity?.firstName,
      playerLastName: profile.playerIdentity?.lastName,
      playerDCosmetic:
        profile.profileCosmetics?.ownsCosmeticD === true &&
        profile.profileCosmetics?.showD === true,
      characterName: pantheonEntry.name,
      characterTitle: getCompatibleFinalTitle(
        pantheonEntry.finalTitle,
        pantheonEntry.faction,
        pantheonEntry,
      )?.name || null,
      dreamCompleted: pantheonEntry.dreamCompleted === true,
      score: pantheonEntry.popularityScore,
      finishedAt: pantheonEntry.finishedAt,
    });

    return true;
  }

  function calculateCompletionBerries(game, ending) {
    if (!game || Number(game.month) < CONFIG.maxMonths) return 0;
    let amount = 30;
    if (ending?.dreamCompleted) amount += 10;
    if (Number(game.stats?.popularity) >= 90) amount += 10;
    return amount;
  }

  function grantCompletionBerries(profile, game, ending) {
    if (!profile || !game || Number(game.completionBerriesGranted) > 0) return 0;
    const amount = calculateCompletionBerries(game, ending);
    if (!amount) return 0;
    game.completionBerriesGranted = amount;
    profile.berries += amount;
    saveGame();
    return amount;
  }

  function determineFinalTitle(
    ending,
    game,
    frozenPopularity = game?.stats?.popularity,
  ) {
    return resolveFinalCareerTitle(game, ending, frozenPopularity);
  }

  function validateRunRewards(
    profile,
    game,
  ) {
    game.runTitles.forEach(
      (title) => {
        const id = getDataId(title);

        const exists =
          profile.titles.some(
            (permanentTitle) =>
              getDataId(permanentTitle) === id,
          );

        if (!exists) {
          const firstUnlockedBy = game.character?.name &&
            game.character?.faction
            ? {
                characterName: game.character.name,
                faction: game.character.faction,
                adventureId: game.id || null,
                unlockedAt: new Date().toISOString(),
              }
            : null;
          profile.titles.push(
            {
              ...cloneData(title),
              firstUnlockedBy,
            },
          );
        }
      },
    );

    game.runAchievements.forEach(
      (achievementId) => {
        if (
          !profile.achievements.some(
            (record) => getDataId(record) === achievementId,
          )
        ) {
          profile.achievements.push(
            {
              id: achievementId,
              unlockedAt: new Date().toISOString(),
              unlockedBy: game.character?.name
                ? {
                    characterName: game.character.name,
                    faction: game.character.faction || null,
                    adventureId: game.id || null,
                  }
                : null,
            },
          );
        }
      },
    );
  }

  /* ========================================================
     PANTHÉON
  ======================================================== */

  function createPantheonEntry(
    ending,
    finalTitle,
    game = state.game,
  ) {
    const character = game.character;

    refreshPopularityScore(game);
    const popularityScore = game.stats.popularity;
    const popularityText = getPopularityCareerText(game);
    return {
      id: createUniqueId("past-life"),
      name: buildNameWithD(character),
      firstName: character.firstName,
      lastName: character.lastName,
      sex: character.sex,
      faction: character.faction,
      dream: character.dream,
      origin: character.origin,
      hasD: Boolean(character.hasD),
      devilFruit: cloneData(character.devilFruit),
      crewMembers: cloneData(game.crewMembers || []),
      combatStyle: character.combatStyle,
      traits: cloneData(character.traits),
      duration: Math.min(
        game.month,
        CONFIG.maxMonths,
      ),
      finalTitle: cloneData(finalTitle),
      runTitles: cloneData(game.runTitles),
      runAchievements: cloneData(game.runAchievements),
      achievementProgress: cloneData(game.achievementProgress),
      flags: cloneData(game.flags),
      startingStatVariance: cloneData(game.startingStatVariance),
      startingStatVarianceRolled: game.startingStatVarianceRolled === true,
      stats: getStatsSnapshot(game.stats),
      popularityScore,
      popularityText,
      popularityModifiers: Number(game.popularityModifiers) || 0,
      journal: cloneData(game.journal),
      importantEvents: cloneData(
        game.importantEvents,
      ),
      bossProgress: cloneData(game.bossProgress),
      legendaryArcs: cloneData(game.legendaryArcs),
      rewards: cloneData(game.rewards),
      route: cloneData(game.route),
      specialZoneId: game.specialZoneId || null,
      specialZoneRouteIndex:
        Number.isInteger(game.specialZoneRouteIndex)
          ? game.specialZoneRouteIndex
          : null,
      visitedZoneIds: cloneData(game.visitedZoneIds),
      destiny: ending.destiny,
      endingType: ending.type,
      success: Boolean(ending.success),
      dreamCompleted: Boolean(
        ending.dreamCompleted,
      ),
      finishedAt: new Date().toISOString(),
    };
  }

  function addToPantheon(
    entry,
    profile = getProfile(),
  ) {
    if (!entry) {
      return false;
    }

    profile.pantheon.unshift(entry);

    return true;
  }

  function openPastLife(entryId) {
    const profile = getProfile();

    const entry =
      profile.pantheon.find(
        (pastLife) =>
          pastLife.id === entryId,
      );

    if (!entry) {
      return false;
    }

    state.selectedPastLifeId = entryId;

    openScreen(
      SCREEN.PAST_LIFE,
      {
        returnScreen:
          SCREEN.PANTHEON,
        save: false,
      },
    );

    return true;
  }

  function getSelectedPastLife() {
    return (
      getProfile().pantheon.find(
        (entry) =>
          entry.id ===
          state.selectedPastLifeId,
      ) || null
    );
  }

  /* ========================================================
     MENU DE PARTIE
  ======================================================== */

  function createGameMenu() {
    if (dom.gameMenu) return dom.gameMenu;

    const panel = document.createElement("div");
    panel.id = "game-menu-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Menu de partie");
    panel.className = "game-menu-overlay";
    panel.innerHTML = `
      <div class="modal-content game-menu-dialog">
        <h2>Menu de partie</h2>
        <div class="modal-actions">
          <button class="button button-primary" data-game-menu-action="resume" type="button"><span aria-hidden="true">▶️</span><span>Reprendre</span></button>
          <button class="button" data-game-menu-action="home" type="button"><span aria-hidden="true">⌂</span><span>Accueil</span></button>
          <button class="button" data-game-menu-action="settings" type="button"><span aria-hidden="true">⚙️</span><span>Paramètres</span></button>
          <button class="button button-danger" data-game-menu-action="abandon" type="button"><span aria-hidden="true">⚠️</span><span>Abandonner</span></button>
        </div>
      </div>
    `;
    document.body.append(panel);
    dom.gameMenu = panel;
    return panel;
  }

  function openGameMenu() {
    const panel = createGameMenu();
    panel.hidden = false;
    dom.openGameMenu?.setAttribute("aria-expanded", "true");
    saveGame();
    panel.querySelector("button")?.focus();
  }

  function closeGameMenu() {
    if (!dom.gameMenu || dom.gameMenu.hidden) return;
    dom.gameMenu.hidden = true;
    dom.openGameMenu?.setAttribute("aria-expanded", "false");
    if (state.screen === SCREEN.GAME) {
      dom.openGameMenu?.focus();
    }
  }

  function toggleGameMenu() {
    if (dom.gameMenu && !dom.gameMenu.hidden) closeGameMenu();
    else openGameMenu();
  }

  /* ========================================================
     ABANDON
  ======================================================== */

  function requestAbandonAdventure() {
    if (!hasSavedGame()) {
      return;
    }

    if (
      getSetting("confirmAbandon") !== false
    ) {
      openDialog(dom.abandonModal);
      return;
    }

    abandonAdventure();
  }

  function abandonAdventure() {
    if (state.game?.profileStartCounted && !state.game?.isFinished) {
      const profile = getProfile();
      profile.statistics.abandonedAdventures = (Number(profile.statistics.abandonedAdventures) || 0) + 1;
      saveProfile(profile);
    }
    deleteSave();

    state.game = null;
    state.result = null;
    state.creationStep = 0;
    state.creation =
      createEmptyCreation();
    state.selectedPastLifeId = null;

    closeDialog(dom.abandonModal);

    openScreen(
      SCREEN.HOME,
      {
        save: false,
      },
    );
    showWelcomeIdentityIfNeeded();

    return true;
  }

  function resumeGame() {
    return loadGame();
  }

  /* ========================================================
     AFFICHAGE DU JEU
  ======================================================== */

  function getFactionIcon(factionId) {
    return FACTION_META[factionId]?.icon || "🌊";
  }

  function getPantheonDuration(entry = {}) {
    const duration = [
      entry.duration,
      entry.finalMonth,
      entry.ending?.finalMonth,
    ]
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          value !== "",
      )
      .map(Number)
      .find((value) => Number.isFinite(value) && value >= 0);
    return duration ?? null;
  }

  function formatPantheonDuration(entry = {}) {
    const duration = getPantheonDuration(entry);
    return duration === null ? "Durée inconnue" : `${duration} mois`;
  }

  function getHistoricalDisplayValue(value, fallback) {
    if (typeof value === "string" || typeof value === "number") {
      const text = String(value).trim();
      if (text && !["undefined", "null", "NaN", "[object Object]"].includes(text)) {
        return normalizeHistoricalVisibleText(text);
      }
    }
    if (value && typeof value === "object") {
      const text = value.label || value.name;
      if (typeof text === "string" && text.trim()) {
        return normalizeHistoricalVisibleText(text.trim());
      }
    }
    return fallback;
  }

  function normalizeHistoricalVisibleText(value) {
    return String(value || "")
      .replace(/\bau\s+shin[\s-]*sekai\b/gi, "dans le Nouveau Monde")
      .replace(/\bshin[\s-]*sekai\b/gi, "Nouveau Monde");
  }

  function getPastLifeFinalZoneName(entry = {}) {
    const storedFinalZone = entry.finalZoneName || entry.finalZone;
    if (storedFinalZone) {
      return getVisibleZoneName(
        getHistoricalDisplayValue(storedFinalZone, ""),
        getDataId(storedFinalZone),
      );
    }
    const journal = Array.isArray(entry.journal) ? entry.journal : [];
    const journalZone = [...journal]
      .reverse()
      .find((log) => log?.zoneName)?.zoneName;
    if (journalZone) return getVisibleZoneName(journalZone);

    const lastVisitedId = Array.isArray(entry.visitedZoneIds)
      ? entry.visitedZoneIds[entry.visitedZoneIds.length - 1]
      : null;
    const routeZone = Array.isArray(entry.route)
      ? entry.route.find((zone) => getDataId(zone) === lastVisitedId)
      : null;
    if (routeZone) {
      return getVisibleZoneName(routeZone.name || routeZone.label, getDataId(routeZone));
    }
    const legacyZone = lastVisitedId || entry.zone;
    return legacyZone
      ? getVisibleZoneName(
          getHistoricalDisplayValue(legacyZone, ""),
          getDataId(legacyZone),
        )
      : "Zone finale inconnue";
  }

  function resetHistoricalJournalAccordions() {
    dom.pastLifeLogbook
      ?.querySelectorAll(".past-life-logbook-period")
      .forEach((period) => {
        period.open = false;
        period.querySelector("summary")?.setAttribute("aria-expanded", "false");
      });
  }

  function createPastLifeLogbookHtml(entry = {}) {
    const journal = Array.isArray(entry.journal) ? entry.journal : [];
    if (!journal.length) {
      return renderEmptyState("Aucune période enregistrée.", {
        icon: "📖",
        detail: "Les périodes de cette ancienne vie ne sont pas disponibles.",
      });
    }

    return journal.map((log, index) => {
      const period = Number(log.period) || index + 1;
      const fromMonth = Number(log.fromMonth) ||
        Math.max(1, (period - 1) * CONFIG.logbookInterval + 1);
      const toMonth = Number(log.toMonth) ||
        fromMonth + CONFIG.logbookInterval - 1;
      const narrative = log.narrative ||
        buildLogbookNarrative(log, {
          character: entry,
        });
      const bigNews = normalizeStoredBigNews(log.bigNews);
      const displayedNews = selectBigNewsForDisplay(bigNews.length
        ? bigNews
        : buildLegacyBigNews({ ...log, narrative }, { character: entry }));
      const highlights = log.highlights?.length
        ? log.highlights.slice(0, 3)
        : buildLogbookHighlights(log);
      const newsSourceIds = new Set(displayedNews.map((item) => item.sourceEventId).filter(Boolean));
      const displayedHighlights = highlights.filter((highlight) =>
        !highlight.sourceEventId || !newsSourceIds.has(highlight.sourceEventId));
      const statChanges = Object.entries(log.statChanges || {})
        .filter(([, value]) => Number(value) !== 0);

      return `
        <details class="past-life-logbook-period">
          <summary aria-controls="past-life-period-${period}-${index}" aria-expanded="false">
            <span>
              <strong>Période ${period}</strong>
              <span>Mois ${fromMonth} à ${toMonth}</span>
            </span>
            <span class="past-life-logbook-zone">
              ${escapeHtml(log.zoneName || "Zone inconnue")}
            </span>
          </summary>
          <div class="past-life-logbook-content" id="past-life-period-${period}-${index}">
            <section class="past-life-news" aria-label="Big News Morgans">
              <div class="past-life-news-heading">
                <strong><span aria-hidden="true">📰</span> Big News Morgans</strong>
                <span>Archives du Journal de l’économie mondiale</span>
              </div>
              <ul class="logbook-news-list">
                ${createBigNewsHtml(displayedNews)}
              </ul>
            </section>
            ${displayedHighlights.length ? `
              <ul class="past-life-logbook-highlights">
                ${displayedHighlights.map((highlight) => `
                  <li>
                    <span aria-hidden="true">${escapeHtml(highlight.icon || "✦")}</span>
                    <span>${escapeHtml(highlight.text || highlight)}</span>
                  </li>
                `).join("")}
              </ul>
            ` : ""}
            ${statChanges.length ? `
              <div class="past-life-logbook-changes" aria-label="Principales variations">
                ${statChanges.map(([key, value]) => `
                  <span class="${Number(value) > 0 ? "positive" : "negative"}">
                    <span aria-hidden="true">${escapeHtml(getStatDefinition(key).icon)}</span>
                    ${escapeHtml(getStatDefinition(key).label)}
                    ${escapeHtml(formatStatDelta(key, value))}
                  </span>
                `).join("")}
              </div>
            ` : ""}
            ${log.nextZoneName ? `
              <p class="past-life-next-destination">
                <span aria-hidden="true">🧭</span>
                Prochaine destination : ${escapeHtml(log.nextZoneName)}
              </p>
            ` : ""}
          </div>
        </details>
      `;
    }).join("");
  }

  function getZoneIcon(zone) {
    const icons = {
      "east-blue": "🌅",
      "north-blue": "❄️",
      "south-blue": "🌴",
      "west-blue": "🌇",
      "reverse-mountain": "⛰️",
      "grand-line": "🧭",
      "red-line": "🟥",
      shinsekai: "🌊",
    };
    return icons[zone?.id] || (zone?.tags?.includes("special") ? "✨" : "🗺️");
  }

  function getLocationIcon(location) {
    return {
      island: "🏝️", kingdom: "🏰", city: "🏙️", port: "⚓",
      village: "🏘️", archipelago: "🏝️", passage: "🧭",
      sea: "🌊", mountain: "⛰️", base: "🏢", "sky-island": "☁️",
    }[location?.type] || "📍";
  }

  function getEventIcon(event) {
    if (!event) return "📜";
    const title = String(event.title || "").trim();
    if (/^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})/u.test(title)) return "";
    if (event.rarity === "veryRare") return "🌟";
    if (event.important) return "❗";
    if (event.rarity === "rare") return "✨";
    const source = [event.category, ...(event.tags || []), ...(event.zoneTags || [])]
      .join(" ").toLowerCase();
    const mappings = [
      [/combat|duel/, "⚔️"], [/marine/, "⚓"], [/pirate/, "🏴‍☠️"],
      [/treasure|tresor|butin/, "💰"], [/exploration|carte/, "🗺️"],
      [/mystery|mystere/, "❓"], [/survival|survie|courant/, "🌊"],
      [/storm|tempete|meteo/, "⛈️"], [/animal|chien/, "🐾"],
      [/medical|medecin|soin/, "🩺"], [/crew|equipage|recrutement/, "👥"],
      [/ship|navire/, "⛵"], [/tavern|taverne/, "🍻"],
      [/government|gouvernement|cipher/, "🌐"], [/revolution/, "✊"],
      [/bounty|chasseur/, "🎯"], [/humour/, "😄"], [/drame|dramatic/, "💔"],
    ];
    return mappings.find(([pattern]) => pattern.test(source))?.[1] || "📜";
  }

  function getBroadZoneLabel(zone) {
    if (!zone) return "Zone inconnue";
    if (["east-blue", "north-blue", "south-blue", "west-blue"].includes(zone.id)) {
      return zone.name;
    }
    if (zone.id === "reverse-mountain") return "Passage vers Grand Line";
    if (zone.tags?.includes("new-world") || zone.id === "shinsekai") return "Nouveau Monde";
    if (zone.tags?.includes("special")) return "Zone spéciale";
    if (zone.id === "grand-line" || zone.tags?.includes("grand-line")) return "Paradise";
    return zone.name;
  }

  function createDevilFruitCardHtml(fruitData, compact = false) {
    if (!fruitData) return "";
    const fruit = normalizeDevilFruit(fruitData);
    return `
      <article class="devil-fruit-card${compact ? " is-compact" : ""}">
        <span class="career-asset-icon" aria-hidden="true">${escapeHtml(fruit.icon || "🍈")}</span>
        <span class="career-asset-copy">
          <strong>${escapeHtml(fruit.name)}</strong>
          <small>${escapeHtml(fruit.type)} • ${escapeHtml(fruit.description)}</small>
          <span>${escapeHtml(formatEffectsText(fruit.permanentEffects))}</span>
        </span>
      </article>`;
  }

  function createCrewMembersHtml(members = [], compact = false) {
    const rarityRank = { legendary: 4, epic: 3, rare: 2, uncommon: 1, common: 0 };
    const normalized = members.filter(Boolean).map(normalizeCrewMember)
      .sort((left, right) => (rarityRank[right.rarity] || 0) - (rarityRank[left.rarity] || 0));
    if (!normalized.length) return "";
    const visible = compact ? normalized.slice(0, 4) : normalized;
    return `${visible.map((member) => `
      <article class="crew-member-card rarity-${escapeHtml(member.rarity)}${compact ? " is-compact" : ""}">
        <span class="career-asset-icon" aria-hidden="true">${escapeHtml(member.icon)}</span>
        <span class="career-asset-copy">
          <strong>${escapeHtml(member.name)}</strong>
          <small><span class="crew-rarity-label">${escapeHtml(getRarityLabel(member.rarity))}</span> • ${escapeHtml(member.role)}</small>
          ${compact ? "" : `<span>${escapeHtml(formatEffectsText(member.permanentEffects))}</span>`}
        </span>
      </article>`).join("")}${compact && normalized.length > visible.length
        ? `<span class="crew-more-badge">+${normalized.length - visible.length}</span>`
        : ""}`;
  }

  function updateGameScreen() {
    const game = state.game;

    if (!game) {
      return;
    }
    refreshPopularityScore(game);

    const character = game.character;
    const zone = getCurrentZone(game);
    const event = game.currentEvent;
    applyGameZoneTheme(zone);
    updateEventTheme(event);

    if (dom.gameDate) {
      dom.gameDate.textContent =
        `Mois ${game.month}`;
    }

    if (dom.gameZone) {
      dom.gameZone.textContent = `${getLocationIcon(zone)} ${zone?.name || "Zone inconnue"}`;
    }

    if (dom.gameRegion) {
      dom.gameRegion.textContent = `${getZoneIcon(zone)} ${getBroadZoneLabel(zone)}`;
    }

    if (dom.gameCharacterName) {
      const details = [];

      if (character.combatStyle) {
        details.push(
          character.combatStyle,
        );
      }

      dom.gameCharacterName.innerHTML = `
        ${escapeHtml(character.name)}
        ${
          details.length
            ? `
              <span class="character-details">
                ${escapeHtml(details.join(" • "))}
              </span>
            `
            : ""
        }
      `;
    }

    if (dom.gameStats) {
      dom.gameStats.innerHTML =
        createStatsHtml(game.stats, game);
    }
    const hasFruit = Boolean(character.devilFruit);
    const hasCrewMembers = Boolean(game.crewMembers?.length);
    if (dom.gameCareerAssets) dom.gameCareerAssets.hidden = !hasFruit && !hasCrewMembers;
    if (dom.gameFruitSection) dom.gameFruitSection.hidden = !hasFruit;
    if (dom.gameDevilFruit) dom.gameDevilFruit.innerHTML = createDevilFruitCardHtml(character.devilFruit, true);
    if (dom.gameCrewSection) dom.gameCrewSection.hidden = !hasCrewMembers;
    if (dom.gameCrewTitle) {
      dom.gameCrewTitle.textContent = character.faction === "marine" ? "⚓ Unité Marine" : "👥 Compagnons";
    }
    if (dom.gameCrewMembers) {
      dom.gameCrewMembers.innerHTML = createCrewMembersHtml(game.crewMembers || [], true);
    }
    if (dom.gameActiveTitles) {
      const activeTitles = (game.runTitles || []).filter((title) => !title.finalTitle);
      dom.gameActiveTitles.innerHTML = activeTitles.length
        ? activeTitles.map((title) => createTitleCardHtml(title, { mode: "compact" })).join("")
        : '<p class="active-titles-empty">Aucun Titre actif pour le moment.</p>';
    }
    if (dom.gameShopItems && dom.gameShopItemsSection) {
      const activeItems = (game.activeShopItems || []).map(findShopItem).filter(Boolean);
      dom.gameShopItemsSection.hidden = activeItems.length === 0;
      dom.gameShopItems.innerHTML = activeItems.map(createShopItemBadgeHtml).join("");
    }

    if (!event) {
      if (dom.eventEyebrow) {
        dom.eventEyebrow.textContent = "Événement";
      }
      if (dom.eventTitle) {
        dom.eventTitle.textContent =
          "La mer t’attend";
      }

      if (dom.eventDescription) {
        dom.eventDescription.textContent =
          "Prépare-toi pour la prochaine étape de ton aventure.";
      }

      if (dom.eventChoices) {
        dom.eventChoices.innerHTML = `
          <button
            class="button button-primary"
            data-start-next-event
            type="button"
          >
            Continuer
          </button>
        `;
      }

      return;
    }

    if (dom.eventEyebrow) {
      const typeMeta = EVENT_TYPE_META[event.eventType] || EVENT_TYPE_META.ordinary;
      dom.eventEyebrow.textContent = `${typeMeta.icon} ${typeMeta.label}`;
    }

    if (dom.eventTitle) {
      const icon = getEventIcon(event);
      dom.eventTitle.innerHTML = `${icon ? `<span class="event-title-icon" aria-hidden="true">${icon}</span>` : ""}${escapeHtml(event.title)}`;
    }

    if (dom.eventDescription) {
      dom.eventDescription.textContent =
        event.description;
    }

    if (dom.eventChoices) {
      dom.eventChoices.innerHTML =
        createEventChoicesHtml(
          event,
          game,
        );
    }
  }

  const EVENT_THEME_CLASSES = [
    "is-danger-event",
    "is-boss-event",
    "is-boss-danger-event",
    ...Object.values(EVENT_TYPE_META).map((meta) => meta.themeClass),
  ];

  function resetBossTransitionTheme() {
    dom.zoneTransitionScreen?.classList.remove(
      "boss-transition",
      "boss-danger-transition",
      "legendary-arc-transition",
    );
  }

  function updateEventTheme(event) {
    document.body.classList.remove(...EVENT_THEME_CLASSES);

    const typeMeta = EVENT_TYPE_META[event?.eventType] || EVENT_TYPE_META.ordinary;
    document.body.classList.add(typeMeta.themeClass);
    document.body.classList.toggle("is-legendary-arc", Boolean(event?.legendaryArc));
  }

  function getChoiceTagToneClass(choiceTag) {
    return /danger|risqu|sacrifice|sans retour|quitte ou double|fatal|péril/i.test(
      choiceTag || "",
    )
      ? " choice-tag-danger"
      : "";
  }

  function createEventChoicesHtml(
    event,
    game,
  ) {
    const choices = event.choices.map(
      (choice, index) => `
              <button
                class="choice-card event-choice"
                data-event-choice-index="${index}"
                type="button"
              >
                <span class="choice-title">
                  ${escapeHtml(choice.text)}
                </span>

                ${choice.choiceTag ? `<span class="choice-tag${getChoiceTagToneClass(choice.choiceTag)}">${escapeHtml(choice.choiceTag)}</span>` : ""}
                ${choice.hint ? `<span class="choice-description">${escapeHtml(choice.hint)}</span>` : ""}
              </button>
            `,
    );

    if (
      (["localhost", "127.0.0.1"].includes(window.location.hostname) ||
        new URLSearchParams(window.location.search).has("audit")) &&
      choices.length !== event.choices.length
    ) {
      console.error(
        `[Blue Legacy] Choix affichés incohérents pour ${event.id}: ` +
        `${choices.length}/${event.choices.length}`,
      );
    }

    if (!choices.length) {
      return `
        <button
          class="button button-primary"
          data-start-next-event
          type="button"
        >
          Continuer
        </button>
      `;
    }

    return choices.join("");
  }

  /* ========================================================
     AFFICHAGE DU RÉSULTAT
  ======================================================== */

  function updateResultScreen() {
    const result =
      state.result ||
      state.game?.pendingResult;

    if (!result) {
      return;
    }

    updateEventTheme(state.game?.currentEvent || null);

    if (dom.resultTitle) {
      dom.resultTitle.textContent =
        result.eventTitle ||
        "Résultat";
    }

    if (dom.resultDescription) {
      dom.resultDescription.textContent =
        result.description ||
        "Ton choix entraîne de nouvelles conséquences.";
    }

    if (dom.resultStats) {
      dom.resultStats.innerHTML =
        createStatChangesHtml(
          result.statChanges || {},
        );
    }

    if (dom.resultRewards) {
      const rewards =
        Array.isArray(result.rewards)
          ? result.rewards
          : [];

      dom.resultRewards.innerHTML =
        rewards
          .map(
            (reward) => `
              <div class="reward-card result-reward-card">
                <span aria-hidden="true">${escapeHtml(getRewardTypeIcon(reward))}</span>
                <span>${escapeHtml(
                  reward.type === "devilFruit" ||
                  (reward.type === "title" &&
                    TITLE_RARITIES[normalizeRarity(reward.data?.rarity)].rank >=
                    TITLE_RARITIES.rare.rank)
                    ? "Une récompense majeure a été obtenue."
                    : reward.text || "",
                )}</span>
              </div>
            `,
          )
          .join("");
    }
    if (dom.continueResult) dom.continueResult.disabled = false;
  }

  /* ========================================================
     AFFICHAGE DU JOURNAL
  ======================================================== */

  function updateLogbookScreen() {
    const game = state.game;

    const entry =
      game?.pendingLogbookEntry ||
      game?.journal?.[
        game.journal.length - 1
      ];

    if (!game || !entry) {
      return;
    }

    const period = entry.period || game.period || 1;
    const fromMonth = entry.fromMonth || Math.max(1, (period - 1) * 4 + 1);
    const toMonth = entry.toMonth || fromMonth + 3;
    const visitedLocations = (
      entry.visitedLocations?.length
        ? entry.visitedLocations
        : getLogbookVisitedLocations(entry.events, entry.zoneName)
    ).filter((location) => location && location !== entry.zoneName);
    const storedNews = normalizeStoredBigNews(entry.bigNews);
    const bigNews = selectBigNewsForDisplay(storedNews.length
      ? storedNews
      : buildLegacyBigNews(entry, game));
    const highlights =
      entry.highlights?.length
        ? entry.highlights.slice(0, 3)
        : buildLogbookHighlights(entry);
    const newsSourceIds = new Set(bigNews.map((item) => item.sourceEventId).filter(Boolean));
    const displayedHighlights = highlights.filter((highlight) =>
      !highlight.sourceEventId || !newsSourceIds.has(highlight.sourceEventId));

    if (dom.logbookPeriod) {
      dom.logbookPeriod.textContent =
        `Période ${period} • Mois ${fromMonth} à ${toMonth}`;
    }

    if (dom.logbookZone) {
      dom.logbookZone.textContent = [
        entry.zoneName || "Mer parcourue",
        visitedLocations.length
          ? formatVisitedLocations(visitedLocations)
          : "",
      ].filter(Boolean).join(" — ");
    }

    if (dom.logbookNarrative) {
      dom.logbookNarrative.innerHTML = createBigNewsHtml(bigNews);
    }

    if (dom.logbookHighlights) {
      const highlightsSection = dom.logbookHighlights.closest(".logbook-highlights-section");
      if (highlightsSection) highlightsSection.hidden = displayedHighlights.length === 0;
      dom.logbookHighlights.innerHTML = displayedHighlights
        .map(
          (highlight) => `
            <li>
              <span aria-hidden="true">${escapeHtml(highlight.icon || "✦")}</span>
              ${escapeHtml(highlight.text || highlight)}
            </li>
          `,
        )
        .join("");
    }

    if (dom.logbookStats) {
      dom.logbookStats.innerHTML =
        createLogbookStatsHtml(
          entry.statsAfter || game.stats,
          entry.statChanges || {},
          game,
        );
    }

    if (dom.logbookReward) {
      dom.logbookReward.innerHTML =
        entry.reward
          ? `
            <strong>
              ${escapeHtml(entry.reward.text || "Récompense")}
            </strong>
            ${
              Object.keys(entry.reward.effects || {}).length
                ? `
                  <span>
                    ${escapeHtml(
                      formatEffectsText(
                        entry.reward.effects,
                      ),
                    )}
                  </span>
                `
                : ""
            }
          `
          : "Aucune récompense particulière.";
    }

    if (dom.logbookTitles) {
      const titles =
        entry.gainedTitles || [];

      dom.logbookTitles.innerHTML =
        titles.length
          ? titles.map((title) =>
              createTitleCardHtml(title, { mode: "compact", showReason: true }),
            ).join("")
          : renderEmptyState("Aucun nouveau titre.", {
              icon: "🎖️",
            });
    }

    if (dom.logbookDiscoveries && dom.logbookDiscoveriesSection) {
      const discoveries = getLogbookEvents(entry).flatMap((eventRecord) =>
        (eventRecord.rewards || []).filter((reward) =>
          ["devilFruit", "crewMember"].includes(reward.type)));
      dom.logbookDiscoveriesSection.hidden = discoveries.length === 0;
      dom.logbookDiscoveries.innerHTML = discoveries.map((reward) =>
        reward.type === "devilFruit"
          ? createDevilFruitCardHtml(reward.data, true)
          : createCrewMembersHtml([reward.data], false)).join("");
    }

    if (dom.logbookNext) {
      dom.logbookNext.textContent =
        entry.nextZoneName ||
        getNextZone(game)?.name ||
        getCurrentZone(game)?.name ||
        "La route reste à tracer";
    }
  }

  /* ========================================================
     COLLECTIONS
  ======================================================== */

  function updateAchievementsScreen() {
    if (!dom.achievements) {
      return;
    }

    const profile = getProfile();
    const achievements =
      getAllAchievements();

    if (!achievements.length) {
      dom.achievements.innerHTML = renderEmptyState(
        "Aucun succès n’est encore défini.",
        {
          icon: "🏆",
          detail: "Les futurs exploits apparaîtront dans cette collection.",
        },
      );

      return;
    }
    const categoryMeta =
      window.BLUE_LEGACY_ACHIEVEMENT_CATEGORY_META || {};
    const categoryOrder =
      window.BLUE_LEGACY_ACHIEVEMENT_CATEGORY_ORDER || [];
    const unlockedCount = achievements.filter((achievement) =>
      Boolean(getAchievementRecord(profile, getDataId(achievement))),
    ).length;
    if (dom.achievementsSummary) {
      dom.achievementsSummary.textContent =
        `${unlockedCount} succès débloqué${unlockedCount > 1 ? "s" : ""} sur ${achievements.length}`;
    }

    dom.achievements.innerHTML = categoryOrder.map((categoryId) => {
      const categoryAchievements = achievements
        .map((achievement, catalogIndex) => ({
          achievement,
          catalogIndex,
          record: getAchievementRecord(profile, getDataId(achievement)),
          progress: getAchievementProgress(achievement, profile, state.game),
        }))
        .filter(({ achievement }) => achievement.category === categoryId)
        .sort((left, right) => {
          const unlockDifference = Number(Boolean(right.record)) - Number(Boolean(left.record));
          if (unlockDifference) return unlockDifference;
          const leftRatio = left.progress.current / left.progress.target;
          const rightRatio = right.progress.current / right.progress.target;
          if (rightRatio !== leftRatio) return rightRatio - leftRatio;
          const rarityDifference =
            TITLE_RARITIES[normalizeRarity(right.achievement.rarity)].rank -
            TITLE_RARITIES[normalizeRarity(left.achievement.rarity)].rank;
          return rarityDifference || left.catalogIndex - right.catalogIndex;
        });
      if (!categoryAchievements.length) return "";
      const categoryUnlocked = categoryAchievements.filter(({ record }) => record).length;
      const meta = categoryMeta[categoryId] || { label: categoryId, icon: "🏆" };
      return `
        <section class="achievement-category-section">
          <header class="achievement-category-header">
            <h3><span aria-hidden="true">${escapeHtml(meta.icon)}</span> ${escapeHtml(meta.label)}</h3>
            <span>${categoryUnlocked} / ${categoryAchievements.length}</span>
          </header>
          <div class="achievement-category-grid">
            ${categoryAchievements.map(({ achievement, record, progress }) => {
              const unlocked = Boolean(record);
              const secretLocked = achievement.secret && !unlocked;
              const rarity = normalizeRarity(achievement.rarity);
              const unlockedDate = record?.unlockedAt
                ? new Date(record.unlockedAt).toLocaleDateString("fr-FR")
                : "";
              return `
                <article class="achievement-card ${unlocked ? "unlocked" : "locked"}"
                  data-rarity="${escapeAttribute(rarity)}">
                  <div class="achievement-card-heading">
                    <span class="achievement-card-icon" aria-hidden="true">${secretLocked ? "🔒" : escapeHtml(achievement.icon || "🏆")}</span>
                    <div>
                      <p class="achievement-card-rarity">${escapeHtml(getRarityLabel(rarity))} • ${escapeHtml(meta.label)}</p>
                      <h4>${secretLocked ? "???" : escapeHtml(achievement.name)}</h4>
                    </div>
                  </div>
                  <p class="achievement-card-description">${secretLocked ? "Un accomplissement reste à découvrir." : escapeHtml(achievement.description)}</p>
                  <p class="achievement-card-hint"><strong>Objectif</strong>${secretLocked ? "Condition secrète" : escapeHtml(achievement.unlockHint)}</p>
                  <p class="achievement-berry-reward">💰 ${unlocked ? "Récompense obtenue" : "Récompense"} : ${formatBerryAmount(getAchievementBerryReward(achievement))} berrys</p>
                  ${progress.target > 1 && !secretLocked ? `
                    <div class="achievement-progress">
                      <div class="achievement-progress-label">
                        <span>${escapeHtml(achievement.progressLabel || "Progression")}</span>
                        <strong>${progress.current} / ${progress.target}</strong>
                      </div>
                      <progress class="achievement-progress-track"
                        aria-label="${escapeAttribute(achievement.progressLabel || achievement.name)}"
                        max="${progress.target}" value="${progress.current}"></progress>
                    </div>
                  ` : ""}
                  <p class="achievement-card-status">
                    ${unlocked ? `✓ Débloqué${unlockedDate ? ` le ${escapeHtml(unlockedDate)}` : ""}` : "🔒 Non débloqué"}
                  </p>
                </article>
              `;
            }).join("")}
          </div>
        </section>
      `;
    }).join("");
  }

  function updateTitlesScreen() {
    if (!dom.titles) {
      return;
    }

    const profileTitles = getProfile().titles;
    const unlockedById = new Map(
      profileTitles.map((title) => [getDataId(title), title]),
    );
    const catalog = getAllTitles();
    const catalogIds = new Set(catalog.map(getDataId));
    const titles = catalog.length
      ? [
          ...catalog,
          ...profileTitles.filter((title) => !catalogIds.has(getDataId(title))),
        ].map((title) => unlockedById.get(getDataId(title)) || title)
      : profileTitles;

    if (!titles.length) {
      dom.titles.innerHTML = renderEmptyState(
        "Aucun titre débloqué.",
        {
          icon: "🎖️",
          detail: "Poursuis une aventure pour enrichir cette collection.",
        },
      );

      return;
    }

    const uniqueTitles = [...new Map(
      titles.map((title) => [getDataId(title), title]),
    ).values()];
    const modernTitles = uniqueTitles.filter((title) => catalogIds.has(getDataId(title)) && title.active !== false);
    const unlockedCount = modernTitles.filter(
      (title) => unlockedById.has(getDataId(title)),
    ).length;

    if (dom.titlesSummary) {
      dom.titlesSummary.textContent =
        `Collection : ${unlockedCount} / ${modernTitles.length}`;
    }

    const rarityRank = (title) =>
      TITLE_RARITIES[normalizeRarity(title.rarity)].rank;
    const compareTitles = (left, right) => {
      const rarityDifference = rarityRank(right) - rarityRank(left);
      if (rarityDifference) return rarityDifference;
      const unlockDifference =
        Number(unlockedById.has(getDataId(right))) -
        Number(unlockedById.has(getDataId(left)));
      if (unlockDifference) return unlockDifference;
      return String(left.name || left.label || "").localeCompare(
        String(right.name || right.label || ""),
        "fr",
      );
    };

    const grouped = new Map();
    uniqueTitles.forEach((titleData) => {
      const title = normalizeTitleData(getDataId(titleData), titleData);
      if (!grouped.has(title.category)) grouped.set(title.category, []);
      grouped.get(title.category).push(titleData);
    });

    dom.titles.innerHTML = TITLE_CATEGORY_ORDER
      .filter((category) => grouped.has(category))
      .map((category) => {
        const categoryTitles = grouped.get(category).sort(compareTitles);
        const categoryUnlocked = categoryTitles.filter(
          (title) => unlockedById.has(getDataId(title)),
        ).length;
        const meta = TITLE_CATEGORY_META[category];
        return `
          <section class="title-category-section" data-title-category="${escapeAttribute(category)}">
            <header class="title-category-header">
              <h3>
                <span aria-hidden="true">${meta.icon}</span>
                ${escapeHtml(meta.label)}
              </h3>
              <span>${categoryUnlocked} / ${categoryTitles.length}</span>
            </header>
            <div class="title-category-grid">
              ${categoryTitles.map((title) =>
                createTitleCardHtml(title, {
                  mode: "full",
                  locked: !unlockedById.has(getDataId(title)),
                }),
              ).join("")}
            </div>
          </section>
        `;
      })
      .join("");
  }

  function createTitleHtml(titleData) {
    return createTitleCardHtml(titleData, { mode: "badge" });
  }

  /* ========================================================
     AFFICHAGE DU PANTHÉON
  ======================================================== */

  function updatePantheonScreen() {
    if (!dom.pastLives) {
      return;
    }

    const pantheon =
      getProfile().pantheon;

    const popularityScores = pantheon.map((entry) =>
      clampCareerScore(
        entry.popularityScore ?? calculatePopularityScore(entry),
      ),
    );
    const completedDreams = pantheon.filter(
      (entry) => entry.dreamCompleted === true || entry.ending?.dreamCompleted === true,
    ).length;
    const representedFactions = new Set(
      pantheon.map((entry) => entry.faction).filter(Boolean),
    ).size;
    const legendLabel = `${pantheon.length} légende${pantheon.length > 1 ? "s" : ""} enregistrée${pantheon.length > 1 ? "s" : ""}`;

    if (dom.pantheonSummary) {
      dom.pantheonSummary.textContent = legendLabel;
    }
    if (dom.pantheonOverview) {
      dom.pantheonOverview.innerHTML = `
        <div class="pantheon-overview-item">
          <span aria-hidden="true">🏛️</span>
          <span><strong>${pantheon.length}</strong> légende${pantheon.length > 1 ? "s" : ""}</span>
        </div>
        <div class="pantheon-overview-item">
          <span aria-hidden="true">⭐</span>
          <span>Meilleure Popularité <strong>${popularityScores.length ? Math.max(...popularityScores) : "—"}</strong></span>
        </div>
        <div class="pantheon-overview-item">
          <span aria-hidden="true">🧭</span>
          <span><strong>${representedFactions}</strong> faction${representedFactions > 1 ? "s" : ""}</span>
        </div>
        <div class="pantheon-overview-item">
          <span aria-hidden="true">✨</span>
          <span><strong>${completedDreams}</strong> rêve${completedDreams > 1 ? "s" : ""} accompli${completedDreams > 1 ? "s" : ""}</span>
        </div>
      `;
    }

    if (!pantheon.length) {
      dom.pastLives.innerHTML = `
        <div class="empty-state pantheon-empty-state" role="status">
          <span class="empty-state-icon" aria-hidden="true">🏛️</span>
          <strong class="empty-state-title">Le Panthéon est encore vide</strong>
          <p class="empty-state-detail">Termine une première aventure pour y inscrire ta légende.</p>
          <button class="button button-primary" data-screen-target="home-screen" type="button">Retour à l’accueil</button>
        </div>
      `;

      return;
    }

    dom.pastLives.innerHTML =
      pantheon
        .map(
          (entry) => {
            const popularityScore = clampCareerScore(
              entry.popularityScore ?? calculatePopularityScore(entry),
            );
            const finalTitle = getCompatibleFinalTitle(
              entry.finalTitle,
              entry.faction,
              entry,
            );
            const rarity = normalizeRarity(finalTitle?.rarity);
            const characterName = entry.name || "Légende sans nom";
            const dream = findDreamData(entry.dream, entry.faction);
            const dreamLabel = dream?.label || dream?.name || entry.dream || "Rêve non enregistré";
            const careerText = entry.popularityText || "Une carrière désormais inscrite dans les mémoires.";
            const dreamCompleted = entry.dreamCompleted === true || entry.ending?.dreamCompleted === true;
            return `
            <button
              class="collection-card past-life-card rarity-${escapeAttribute(rarity)}"
              data-past-life-id="${escapeAttribute(entry.id)}"
              data-rarity="${escapeAttribute(rarity)}"
              aria-label="Voir la fiche de ${escapeAttribute(characterName)}"
              type="button"
            >
              <span class="pantheon-card-header">
                <span class="pantheon-character-heading">
                  <span class="pantheon-faction-icon" aria-hidden="true">
                    ${getFactionIcon(entry.faction)}
                  </span>
                  <span class="sr-only">
                    Voie : ${escapeHtml(getFactionLabel(entry.faction))}.
                  </span>
                  <span class="pantheon-character-name" role="heading" aria-level="3">
                    ${escapeHtml(characterName)}
                  </span>
                </span>
                <span class="pantheon-card-title">
                  ${createTitleCardHtml(finalTitle, { mode: "badge" })}
                </span>
              </span>

              <span class="pantheon-card-body">
                <span class="pantheon-dream${dreamCompleted ? " is-complete" : ""}">
                  <span aria-hidden="true">${dreamCompleted ? "✓" : "✦"}</span>
                  <span>${dreamCompleted ? "Rêve accompli" : `Rêve non accompli : ${escapeHtml(dreamLabel)}`}</span>
                </span>
                <span class="pantheon-career-text">${escapeHtml(careerText)}</span>
                ${entry.devilFruit ? `<span class="pantheon-asset-badge">${escapeHtml(entry.devilFruit.icon || "🍈")} ${escapeHtml(entry.devilFruit.name || "Fruit du Démon")}</span>` : ""}
                ${(entry.crewMembers || []).length ? `<span class="pantheon-asset-badge">👥 ${entry.crewMembers.length} compagnon${entry.crewMembers.length > 1 ? "s" : ""}</span>` : ""}
                ${Object.values(entry.legendaryArcs || {}).some((arc) => arc && !["unassessed", "not-selected"].includes(arc.status)) ? `<span class="pantheon-asset-badge legendary-exploit-badge">◆ Exploit légendaire</span>` : ""}
              </span>

              <span class="pantheon-card-footer">
                <span class="pantheon-card-meta">
                  <span class="pantheon-meta-item pantheon-duration">
                    <span aria-hidden="true">📅</span>
                    <span>${escapeHtml(formatPantheonDuration(entry))}</span>
                  </span>
                  <span class="pantheon-meta-item pantheon-popularity">
                    <span aria-hidden="true">⭐</span>
                    <span>Popularité : ${popularityScore} / 100</span>
                  </span>
                </span>
                <span class="pantheon-card-action" aria-hidden="true">Voir la fiche <span>→</span></span>
              </span>
            </button>
          `;
          },
        )
        .join("");
  }

  function updatePastLifeScreen() {
    const entry =
      getSelectedPastLife();

    if (!entry) {
      return;
    }
    setCareerExportStatus("");
    const finalTitle = getCompatibleFinalTitle(
      entry.finalTitle,
      entry.faction,
      entry,
    );
    applyPastLifeHeroRarity(finalTitle);

    const dream =
      findDreamData(
        entry.dream,
        entry.faction,
      );

    const origin =
      findGameDataItem(
        ["origins"],
        entry.origin,
      );

    if (dom.pastLifeTitle) {
      dom.pastLifeTitle.textContent =
        getHistoricalDisplayValue(entry.name, "Légende sans nom");
    }
    if (dom.pastLifeFactionIcon) {
      dom.pastLifeFactionIcon.textContent =
        getFactionIcon(entry.faction);
    }

    const popularityScore = clampCareerScore(
      entry.popularityScore ?? calculatePopularityScore(entry),
    );
    const popularityText =
      entry.popularityText || getPopularityCareerText({
        ...entry,
        popularityScore,
      });
    if (dom.pastLifePopularity) {
      dom.pastLifePopularity.textContent =
        `Popularité : ${popularityScore} / 100`;
    }
    if (dom.pastLifePopularityText) {
      dom.pastLifePopularityText.textContent = popularityText;
    }

    if (dom.pastLifeFaction) {
      dom.pastLifeFaction.textContent =
        entry.faction && FACTION_META[getDataId(entry.faction)]
          ? getFactionLabel(getDataId(entry.faction))
          : "Voie non enregistrée";
    }

    if (dom.pastLifeDream) {
      dom.pastLifeDream.textContent =
        dream?.label ||
        dream?.name ||
        getHistoricalDisplayValue(entry.dream, "Rêve non enregistré");
    }

    if (dom.pastLifeOrigin) {
      dom.pastLifeOrigin.textContent =
        origin?.label ||
        origin?.name ||
        getHistoricalDisplayValue(entry.origin, "Origine inconnue");
    }

    if (dom.pastLifeFinalTitle) {
      dom.pastLifeFinalTitle.innerHTML =
        createTitleCardHtml(
          finalTitle,
          { mode: "badge" },
        );
    }

    if (dom.pastLifeRunTitles) {
      const finalId = getDataId(finalTitle);
      const otherTitles = (entry.runTitles || []).filter(
        (title) =>
          getDataId(title) !== finalId &&
          isTitleCompatibleWithFaction(title, entry.faction),
      );
      dom.pastLifeRunTitles.innerHTML = otherTitles.length
        ? otherTitles.map((title) =>
            createTitleCardHtml(title, { mode: "badge" }),
          ).join("")
        : renderEmptyState("Aucun autre titre obtenu.", {
            icon: "🎖️",
            detail: "Cette carrière s’est achevée avec son titre final.",
          });
    }

    if (dom.pastLifeDuration) {
      dom.pastLifeDuration.textContent =
        formatPantheonDuration(entry);
    }

    if (dom.pastLifeEnding) {
      dom.pastLifeEnding.textContent =
        getHistoricalDisplayValue(entry.destiny, "Destin non enregistré");
    }

    if (dom.pastLifeFinalZone) {
      dom.pastLifeFinalZone.textContent =
        getPastLifeFinalZoneName(entry);
    }

    if (dom.pastLifeStats) {
      dom.pastLifeStats.innerHTML =
        createPastLifeStatsHtml(entry.stats || {}, entry);
    }
    if (dom.pastLifeStartingVariance) {
      dom.pastLifeStartingVariance.hidden = entry.startingStatVarianceRolled !== true;
      dom.pastLifeStartingVariance.innerHTML = entry.startingStatVarianceRolled === true
        ? `<h4>Variations de départ</h4><div class="starting-variance-list">${createStartingStatVarianceHtml(entry.startingStatVariance)}</div>`
        : "";
    }
    if (dom.pastLifeAssets && dom.pastLifeAssetsSection) {
      const fruit = entry.devilFruit || entry.character?.devilFruit || null;
      const members = Array.isArray(entry.crewMembers) ? entry.crewMembers : [];
      dom.pastLifeAssetsSection.hidden = !fruit && members.length === 0;
      dom.pastLifeAssets.innerHTML = [
        createDevilFruitCardHtml(fruit),
        createCrewMembersHtml(members),
      ].filter(Boolean).join("");
    }

    if (dom.pastLifeLogbook) {
      resetHistoricalJournalAccordions();
      dom.pastLifeLogbook.innerHTML =
        createPastLifeLogbookHtml(entry);
      resetHistoricalJournalAccordions();
    }

    updateLegendaryCareerSection(entry);
  }

  function updateLegendaryCareerSection(entry = {}) {
    if (!dom.pastLifeLogbook) return;
    const arcs = entry.legendaryArcs || {};
    const encountered = Object.entries(arcs).filter(([, arc]) =>
      arc && !["unassessed", "not-selected"].includes(arc.status));
    let section = document.getElementById("past-life-legendary-exploits");
    if (!encountered.length) { section?.remove(); return; }
    if (!section) {
      section = document.createElement("section");
      section.id = "past-life-legendary-exploits";
      section.className = "past-life-panel legendary-exploits-panel";
      dom.pastLifeLogbook.parentElement?.insertBefore(section, dom.pastLifeLogbook.parentElement.firstChild);
    }
    const label = (arcId, arc) => {
      const title = arc.titleId ? findTitleData(arc.titleId)?.name : null;
      const result = title || (arc.status === "failed" ? "Échec de la séquence" : "Séquence terminée sans Titre");
      if (arcId === "emperor") return `Empereur affronté : ${LEGENDARY_EMPEROR_NAMES[arc.emperorId] || "inconnu"} — ${result}`;
      if (arcId === "talent") return `Talent prodigieux : ${result}`;
      return `Marineford : ${result}`;
    };
    section.innerHTML = `<h3>◆ Exploits légendaires</h3><ul>${encountered.map(([id, arc]) => `<li>${escapeHtml(label(id, arc))}</li>`).join("")}</ul>`;
  }

  let careerExportInProgress = false;

  function getCareerExportFilename(entry = {}) {
    const parts = entry.lastName && entry.firstName
      ? [entry.lastName, entry.hasD ? "D" : "", entry.firstName]
      : [entry.name || ""];
    const safeName = parts
      .filter(Boolean)
      .join("-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return safeName
      ? `Blue-Legacy_${safeName}_Fiche-de-carriere.png`
      : "Blue-Legacy_Fiche-de-carriere.png";
  }

  function setCareerExportStatus(message = "", error = false) {
    if (!dom.pastLifeExportStatus) return;
    dom.pastLifeExportStatus.textContent = message;
    dom.pastLifeExportStatus.classList.toggle("is-error", error);
  }

  function waitForExportImages(root) {
    const pending = [...root.querySelectorAll("img")]
      .filter((image) => !image.complete)
      .map((image) => new Promise((resolve) => {
        const timeout = window.setTimeout(resolve, 5000);
        const finish = () => {
          window.clearTimeout(timeout);
          resolve();
        };
        image.addEventListener("load", finish, { once: true });
        image.addEventListener("error", finish, { once: true });
      }));
    return Promise.all(pending);
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), { once: true });
      reader.addEventListener("error", reject, { once: true });
      reader.readAsDataURL(blob);
    });
  }

  async function inlineExportImages(root) {
    await Promise.all([...root.querySelectorAll("img")].map(async (image) => {
      const source = image.currentSrc || image.src;
      if (!source || source.startsWith("data:")) return;
      try {
        const response = await fetch(source);
        if (!response.ok) return;
        image.src = await blobToDataUrl(await response.blob());
      } catch (_error) {
        // Une ressource locale non incorporable ne doit pas annuler toute la fiche.
      }
    }));
  }

  function waitForExportFrame() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
  }

  async function waitForExportFonts() {
    if (!document.fonts?.ready) return;
    await Promise.race([
      document.fonts.ready.catch(() => undefined),
      new Promise((resolve) => window.setTimeout(resolve, 3000)),
    ]);
  }

  const UNSUPPORTED_EXPORT_COLOR = /(?:color|color-mix|lab|lch|oklab|oklch)\(/i;
  const EXPORT_COLOR_PROPERTIES = [
    "color", "background-color", "background-image", "border-top-color",
    "border-right-color", "border-bottom-color", "border-left-color",
    "outline-color", "text-decoration-color", "box-shadow", "text-shadow",
    "fill", "stroke",
  ];

  function assertExportUsesSafeColors(root) {
    const unsupported = [];
    const nodes = [root, ...root.querySelectorAll("*")];
    nodes.forEach((element) => {
      [null, "::before", "::after"].forEach((pseudo) => {
        const computed = getComputedStyle(element, pseudo);
        const invalid = EXPORT_COLOR_PROPERTIES.find((property) =>
          UNSUPPORTED_EXPORT_COLOR.test(computed.getPropertyValue(property)));
        if (invalid) unsupported.push(`${element.tagName.toLowerCase()}${pseudo || ""}.${invalid}`);
      });
      const inlineStyle = element.getAttribute("style") || "";
      if (UNSUPPORTED_EXPORT_COLOR.test(inlineStyle)) {
        unsupported.push(`${element.tagName.toLowerCase()}.style`);
      }
    });
    if (unsupported.length) {
      throw new Error(`${unsupported.length} couleur(s) d’export non compatible(s) : ${unsupported.slice(0, 6).join(", ")}`);
    }
    return true;
  }

  function canvasToPngBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("PNG indisponible"));
      }, "image/png");
    });
  }

  function downloadCareerBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    return true;
  }

  function isLikelyMobileExportContext() {
    return Number(navigator.maxTouchPoints) > 0 &&
      Boolean(window.matchMedia?.("(pointer: coarse)")?.matches);
  }

  function openCareerPngFallback(blob) {
    const url = URL.createObjectURL(blob);
    const opened = window.open(url, "_blank");
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    if (!opened) throw new Error("Ouverture de l’image bloquée");
    try { opened.opener = null; } catch (_error) { /* Fenêtre isolée par le navigateur. */ }
    return "opened";
  }

  async function deliverCareerPng(blob, filename, options = {}) {
    const mobile = options.mobile ?? isLikelyMobileExportContext();
    if (mobile && typeof File === "function" && typeof navigator.share === "function") {
      try {
        const file = new File([blob], filename, { type: "image/png" });
        if (typeof navigator.canShare !== "function" || navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Fiche de carrière Blue Legacy",
          });
          return "shared";
        }
      } catch (error) {
        if (error?.name === "AbortError") return "cancelled";
        console.warn("[Blue Legacy] Partage natif indisponible, téléchargement utilisé.", error);
      }
    }

    if ("download" in document.createElement("a")) {
      try {
        downloadCareerBlob(blob, filename);
        return "downloaded";
      } catch (error) {
        console.warn("[Blue Legacy] Téléchargement direct indisponible, ouverture de l’image utilisée.", error);
      }
    }
    return openCareerPngFallback(blob);
  }

  async function exportPastLifeCareer() {
    if (careerExportInProgress || !dom.pastLifeExportArea || !dom.pastLifeExportButton) return;
    careerExportInProgress = true;
    const button = dom.pastLifeExportButton;
    const originalLabel = button.textContent;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.textContent = "Création de l’image…";
    setCareerExportStatus("Préparation de la fiche…");
    let exportStep = "prepare";
    let stage = null;
    let clone = null;
    let canvas = null;
    let exportDimensions = null;

    try {
      if (typeof window.html2canvas !== "function") {
        throw new Error("html2canvas n’est pas chargé");
      }
      document.body.classList.add("is-exporting-career");
      dom.pastLifeExportArea.classList.add("career-sheet--exporting");
      exportStep = "fonts";
      await waitForExportFonts();
      exportStep = "images";
      await waitForExportImages(dom.pastLifeExportArea);

      exportStep = "clone";
      stage = document.createElement("div");
      stage.className = "career-export-stage";
      clone = dom.pastLifeExportArea.cloneNode(true);
      clone.classList.add("career-export-clone", "career-export-safe");
      clone.querySelectorAll(".no-career-export").forEach((element) => element.remove());
      clone.querySelectorAll("details").forEach((details) => {
        details.open = true;
        details.querySelector("summary")?.setAttribute("aria-expanded", "true");
      });
      stage.append(clone);
      document.body.append(stage);
      exportStep = "images";
      await inlineExportImages(clone);
      await waitForExportImages(clone);
      exportStep = "fonts";
      await waitForExportFonts();
      await waitForExportFrame();
      await waitForExportFrame();

      exportStep = "layout";
      const rect = clone.getBoundingClientRect();
      const width = Math.ceil(Math.max(rect.width, clone.scrollWidth, stage.scrollWidth));
      const height = Math.ceil(Math.max(rect.height, clone.scrollHeight, stage.scrollHeight));
      if (!width || !height) throw new Error("Dimensions d’export invalides");
      assertExportUsesSafeColors(clone);
      const maxPixels = 28000000;
      const maxSide = 16000;
      const scale = Math.min(2, maxSide / width, maxSide / height, Math.sqrt(maxPixels / (width * height)));
      if (!Number.isFinite(scale) || scale <= 0) throw new Error("Échelle d’export invalide");
      const outputWidth = Math.max(1, Math.floor(width * scale));
      const outputHeight = Math.max(1, Math.floor(height * scale));
      if (outputWidth > maxSide || outputHeight > maxSide || outputWidth * outputHeight > maxPixels) {
        throw new Error("Fiche trop grande pour un export PNG sûr");
      }
      exportDimensions = { width, height, scale, outputWidth, outputHeight };
      exportStep = "capture";
      canvas = await window.html2canvas(clone, {
        backgroundColor: "#fff9ec",
        scale,
        useCORS: true,
        allowTaint: false,
        logging: false,
        removeContainer: true,
        imageTimeout: 10000,
        width,
        height,
        windowWidth: width,
        windowHeight: height,
        scrollX: 0,
        scrollY: 0,
      });
      if (!canvas.width || !canvas.height) throw new Error("Canvas d’export vide");
      exportStep = "blob";
      const png = await canvasToPngBlob(canvas);
      if (png.type !== "image/png" || png.size === 0) throw new Error("Blob PNG invalide");
      document.documentElement.dataset.careerExportResult = JSON.stringify({
        type: png.type,
        size: png.size,
        ...exportDimensions,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
      });
      document.dispatchEvent(new CustomEvent("bluelegacy:career-export-ready", {
        detail: { blob: png, canvas, dimensions: exportDimensions },
      }));
      exportStep = "delivery";
      const delivery = await deliverCareerPng(
        png,
        getCareerExportFilename(getSelectedPastLife() || {}),
      );
      if (delivery === "downloaded") {
        setCareerExportStatus("Fiche de carrière enregistrée en PNG.");
      } else if (delivery === "shared" || delivery === "opened") {
        setCareerExportStatus("L’image de ta carrière est prête.");
      } else {
        setCareerExportStatus("");
      }
    } catch (error) {
      console.error(`[Blue Legacy] Export échoué pendant l’étape ${exportStep}`, {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        dimensions: exportDimensions,
        userAgent: navigator.userAgent,
        error,
      });
      const localDevelopment = location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(location.hostname);
      setCareerExportStatus(
        localDevelopment
          ? `Échec de l’export : ${exportStep} — ${error?.message || "erreur inconnue"}`
          : "Impossible de créer l’image de la fiche. Réessaie dans quelques instants.",
        true,
      );
    } finally {
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
        canvas.remove();
      }
      clone?.classList.remove("career-export-clone", "career-export-safe");
      stage?.remove();
      dom.pastLifeExportArea.classList.remove("career-sheet--exporting");
      document.body.classList.remove("is-exporting-career");
      button.disabled = false;
      button.removeAttribute("aria-busy");
      button.textContent = originalLabel;
      careerExportInProgress = false;
    }
  }

  /* ========================================================
     PARAMÈTRES
  ======================================================== */

  function getSetting(settingId) {
    return getProfile().settings[settingId];
  }

  function updateSetting(
    settingId,
    value,
  ) {
    const profile = getProfile();

    profile.settings[settingId] = value;

    saveProfile(profile);
    applySettings();

    return value;
  }

  function applySettings() {
    const settings =
      getProfile().settings;

    document.body.classList.toggle(
      "reduced-motion",
      Boolean(settings.reducedMotion),
    );

    document.documentElement.dataset.textSpeed =
      settings.textSpeed ||
      "normal";
  }

  function updateSettingsScreen() {
    if (!dom.settings) {
      return;
    }

    const settings =
      getProfile().settings;
    const settingsBackButton =
      document.getElementById("settings-back-btn");
    const returnScreen =
      state.game && state.returnScreen !== SCREEN.HOME
        ? state.returnScreen
        : SCREEN.HOME;

    if (settingsBackButton) {
      settingsBackButton.dataset.screenTarget =
        SCREEN_IDS[returnScreen] || SCREEN_IDS[SCREEN.HOME];
      settingsBackButton.textContent =
        returnScreen === SCREEN.HOME ? "⌂ Accueil" : "← Retour";
    }

    dom.settings.innerHTML = `
      <label class="setting-row">
        <span>✨ Réduire les animations</span>
        <input
          data-setting-id="reducedMotion"
          type="checkbox"
          ${settings.reducedMotion ? "checked" : ""}
        />
      </label>

      <label class="setting-row">
        <span>⚠️ Confirmer avant un abandon</span>
        <input
          data-setting-id="confirmAbandon"
          type="checkbox"
          ${settings.confirmAbandon ? "checked" : ""}
        />
      </label>

      <label class="setting-row">
        <span>💬 Vitesse d’affichage</span>
        <select data-setting-id="textSpeed">
          <option
            value="slow"
            ${settings.textSpeed === "slow" ? "selected" : ""}
          >
            Lente
          </option>
          <option
            value="normal"
            ${settings.textSpeed === "normal" ? "selected" : ""}
          >
            Normale
          </option>
          <option
            value="fast"
            ${settings.textSpeed === "fast" ? "selected" : ""}
          >
            Rapide
          </option>
        </select>
      </label>

      <label class="setting-row">
        <span>
          🔊 Volume :
          ${Number(settings.volume) || 0} %
        </span>

        <input
          data-setting-id="volume"
          min="0"
          max="100"
          type="range"
          value="${Number(settings.volume) || 0}"
        />
      </label>
    `;
  }

  /* ========================================================
     DONNÉES
  ======================================================== */

  function getGameDataCollection(names) {
    for (const name of names) {
      const gameData =
        window.GAME_DATA?.[name];

      if (Array.isArray(gameData)) {
        return gameData;
      }

      const globalData =
        window[
          `SEA_OF_LEGENDS_${name.toUpperCase()}`
        ];

      if (Array.isArray(globalData)) {
        return globalData;
      }
    }

    return [];
  }

  function findGameDataItem(
    collectionNames,
    itemId,
  ) {
    return (
      getGameDataCollection(
        collectionNames,
      ).find(
        (item) =>
          getDataId(item) === itemId,
      ) || null
    );
  }

  function getDreamsForFaction(
    factionId,
  ) {
    const dreams =
      window.GAME_DATA?.dreams ||
      window.SEA_OF_LEGENDS_DREAMS ||
      {};

    if (Array.isArray(dreams)) {
      return dreams.filter(
        (dream) => {
          const dreamFaction =
            dream.faction ||
            dream.path ||
            null;

          return (
            !dreamFaction ||
            dreamFaction === factionId
          );
        },
      );
    }

    return Array.isArray(dreams[factionId])
      ? dreams[factionId]
      : [];
  }

  function findDreamData(
    dreamId,
    factionId,
  ) {
    return (
      getDreamsForFaction(
        factionId,
      ).find(
        (dream) =>
          getDataId(dream) === dreamId,
      ) || null
    );
  }

  function getFactionLabel(factionId) {
    if (FACTION_META[factionId]) {
      return FACTION_META[factionId].label;
    }

    const faction =
      findGameDataItem(
        ["factions", "paths"],
        factionId,
      );

    const label = (
      faction?.label ||
      faction?.name ||
      factionId ||
      "Voie inconnue"
    );
    return String(label)
      .replace(/^[^\p{L}\p{N}]+/u, "")
      .trim() || "Voie inconnue";
  }

  /* ========================================================
     ÉVÉNEMENTS DOM
  ======================================================== */

  function readExpandedPreference(key, defaultValue = false) {
    try {
      const stored = sessionStorage.getItem(key);
      return stored === null ? defaultValue : stored === "true";
    } catch (error) {
      return defaultValue;
    }
  }

  function readGameStatsExpandedPreference() {
    return readExpandedPreference(GAME_STATS_EXPANDED_SESSION_KEY);
  }

  function readGameDetailsExpandedPreference() {
    return readExpandedPreference(GAME_DETAILS_EXPANDED_SESSION_KEY);
  }

  function setGameStatsExpanded(expanded, { persist = true } = {}) {
    const nextExpanded = Boolean(expanded);
    state.gameStatsExpanded = nextExpanded;

    if (dom.gameStatsPanel) dom.gameStatsPanel.hidden = !nextExpanded;
    if (dom.gameStatsToggle) {
      dom.gameStatsToggle.setAttribute("aria-expanded", String(nextExpanded));
      dom.gameStatsToggle.setAttribute(
        "aria-label",
        `${nextExpanded ? "Masquer" : "Afficher"} les statistiques du personnage`,
      );
    }

    if (persist) {
      try {
        sessionStorage.setItem(GAME_STATS_EXPANDED_SESSION_KEY, String(nextExpanded));
      } catch (error) {
        // L’état en mémoire reste suffisant si le stockage de session est indisponible.
      }
    }
  }

  function toggleGameStatsPanel() {
    setGameStatsExpanded(!state.gameStatsExpanded);
  }

  function setGameDetailsExpanded(expanded, { persist = true } = {}) {
    const nextExpanded = Boolean(expanded);
    state.gameDetailsExpanded = nextExpanded;

    if (dom.gameDetailsPanel) dom.gameDetailsPanel.hidden = !nextExpanded;
    if (dom.gameDetailsToggle) {
      dom.gameDetailsToggle.setAttribute("aria-expanded", String(nextExpanded));
      dom.gameDetailsToggle.setAttribute(
        "aria-label",
        `${nextExpanded ? "Masquer" : "Afficher"} les détails du personnage`,
      );
    }

    if (persist) {
      try {
        sessionStorage.setItem(GAME_DETAILS_EXPANDED_SESSION_KEY, String(nextExpanded));
      } catch (error) {
        // L’état en mémoire reste suffisant si le stockage de session est indisponible.
      }
    }
  }

  function toggleGameDetailsPanel() {
    setGameDetailsExpanded(!state.gameDetailsExpanded);
  }

  function bindEvents() {
    dom.welcomeIdentityForm?.addEventListener("submit", saveWelcomeIdentity);
    dom.openGameMenu?.setAttribute("aria-label", "Ouvrir le menu");
    dom.openGameMenu?.setAttribute("aria-expanded", "false");
    dom.openGameMenu?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleGameMenu();
    });

    dom.gameStatsToggle?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleGameStatsPanel();
    });

    dom.gameDetailsToggle?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleGameDetailsPanel();
    });

    dom.pastLifeExportButton?.addEventListener("click", (event) => {
      event.preventDefault();
      exportPastLifeCareer();
    });

    dom.startAdventure?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        startCreation(false);
      },
    );

    dom.resumeAdventure?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        resumeGame();
      },
    );

    dom.abandonAdventure?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        requestAbandonAdventure();
      },
    );

    dom.resetProfile?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (dom.resetProfileStatus) dom.resetProfileStatus.textContent = "";
      openDialog(dom.resetProfileFirstModal);
      dom.cancelResetProfileFirst?.focus();
    });

    dom.cancelResetProfileFirst?.addEventListener("click", (event) => {
      event.preventDefault();
      cancelProfileReset(dom.resetProfileFirstModal);
    });

    dom.continueResetProfile?.addEventListener("click", (event) => {
      event.preventDefault();
      closeDialog(dom.resetProfileFirstModal);
      openDialog(dom.resetProfileFinalModal);
      dom.cancelResetProfileFinal?.focus();
    });

    dom.cancelResetProfileFinal?.addEventListener("click", (event) => {
      event.preventDefault();
      cancelProfileReset(dom.resetProfileFinalModal);
    });

    [dom.resetProfileFirstModal, dom.resetProfileFinalModal].forEach((dialog) => {
      dialog?.addEventListener("cancel", () => {
        window.setTimeout(() => dom.resetProfile?.focus(), 0);
      });
    });

    dom.confirmResetProfile?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (dom.confirmResetProfile.disabled || state.isResettingProfile) return;
      dom.confirmResetProfile.disabled = true;
      resetPlayerProfile();
    });

    dom.creationPrevious?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        previousCreationStep();
      },
    );

    dom.creationHome?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        openScreen(SCREEN.HOME, { save: false });
      },
    );

    dom.rerollFullName?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        generateFullName();
      },
    );

    dom.rerollFirstName?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        generateFirstName();
      },
    );

    dom.rerollLastName?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        generateLastName();
      },
    );

    dom.confirmName?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        confirmGeneratedName();
      },
    );

    dom.createCharacter?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        validateCharacterCreation();
      },
    );

    dom.beginGame?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        continueAfterDReveal();
      },
    );

    dom.continueResult?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        continueAfterResult();
      },
    );

    dom.continueLogbook?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeLogbook();
      },
    );

    dom.continueZoneTransition?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        continueAfterZoneTransition();
      },
    );

    dom.continueRewardReveal?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        continueAfterRewardReveal();
      },
    );

    dom.confirmAbandon?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        abandonAdventure();
      },
    );

    dom.confirmNewGame?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        closeDialog(dom.newGameModal);
        startCreation(true);
      },
    );

    dom.confirmShopPurchase?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      purchaseShopItem();
    });

    dom.pastLifeLogbook?.addEventListener(
      "toggle",
      (event) => {
        const period = event.target.closest?.(".past-life-logbook-period");
        if (!period) return;
        period.querySelector("summary")?.setAttribute(
          "aria-expanded",
          String(period.open),
        );
      },
      true,
    );

    document.addEventListener(
      "click",
      handleDocumentClick,
      true,
    );

    document.addEventListener(
      "change",
      handleDocumentChange,
      true,
    );

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeGameMenu();
    });
  }

  function handleDocumentClick(event) {
    if (event.target === dom.gameMenu) {
      closeGameMenu();
      return;
    }

    const target =
      event.target.closest("button");

    if (!target) {
      return;
    }

    if (target.dataset.shopBuy) {
      event.preventDefault();
      requestShopPurchase(target.dataset.shopBuy);
      return;
    }
    if (target.dataset.cosmeticBuy) {
      event.preventDefault();
      purchaseProfileCosmetic(target.dataset.cosmeticBuy);
      return;
    }
    if (target.hasAttribute("data-statistics-edit-identity")) {
      state.statisticsIdentityEditing = true; updateStatisticsScreen(); return;
    }
    if (target.hasAttribute("data-statistics-cancel-identity")) {
      state.statisticsIdentityEditing = false; updateStatisticsScreen(); return;
    }
    if (target.hasAttribute("data-statistics-save-identity")) {
      const form = document.getElementById("profile-identity-form");
      const profile = getProfile();
      profile.playerIdentity.firstName = String(form?.elements.firstName?.value || "").trim().slice(0, 40);
      profile.playerIdentity.lastName = String(form?.elements.lastName?.value || "").trim().slice(0, 40);
      saveProfile(profile); state.statisticsIdentityEditing = false; updateStatisticsScreen(); return;
    }
    if (target.hasAttribute("data-statistics-toggle-appearance")) {
      state.statisticsAppearanceOpen = !state.statisticsAppearanceOpen; updateStatisticsScreen(); return;
    }
    if (target.dataset.statisticsBackground) {
      const profile = getProfile();
      if (profile.profileCosmetics.ownedBackgrounds.includes(target.dataset.statisticsBackground)) {
        profile.profileCosmetics.selectedBackground = target.dataset.statisticsBackground; saveProfile(profile); updateStatisticsScreen();
      }
      return;
    }
    if (target.dataset.shopEquip) {
      event.preventDefault();
      equipShopItem(target.dataset.shopEquip);
      return;
    }
    if (target.dataset.shopUnequip) {
      event.preventDefault();
      unequipShopItem(target.dataset.shopUnequip);
      return;
    }

    const menuAction = target.dataset.gameMenuAction;
    if (menuAction) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (menuAction === "resume") closeGameMenu();
      if (menuAction === "home") returnToMainMenu();
      if (menuAction === "settings") {
        closeGameMenu();
        state.returnScreen = state.resumeScreen;
        openScreen(SCREEN.SETTINGS, { save: false });
      }
      if (menuAction === "abandon") {
        closeGameMenu();
        requestAbandonAdventure();
      }
      return;
    }

    const screenTarget =
      target.dataset.screenTarget;

    if (screenTarget) {
      const screenName =
        SCREEN_BY_ID[screenTarget];

      if (screenName) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (screenName === SCREEN.SETTINGS) {
          state.returnScreen = state.screen;
        }

        openScreen(
          screenName,
          {
            save: Boolean(state.game),
          },
        );
      }

      return;
    }

    if (
      target.matches(
        "[data-choice-type]",
      )
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();

      selectCreationChoice(
        target.dataset.choiceType,
        target.dataset.choiceValue,
        target,
      );

      return;
    }

    if (
      target.dataset.eventChoiceIndex !==
      undefined
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();

      resolveChoice(
        Number(
          target.dataset.eventChoiceIndex,
        ),
      );

      return;
    }

    if (
      target.hasAttribute(
        "data-start-next-event",
      )
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();

      startNextEvent();
      return;
    }

    if (target.dataset.pastLifeId) {
      event.preventDefault();
      event.stopImmediatePropagation();

      openPastLife(
        target.dataset.pastLifeId,
      );
    }
  }

  function handleDocumentChange(event) {
    const target = event.target;

    if (target.matches("[data-statistics-cosmetic-d]")) {
      const profile = getProfile();
      if (profile.profileCosmetics.ownsCosmeticD) {
        profile.profileCosmetics.showD = target.checked; saveProfile(profile); updateStatisticsScreen();
      }
      return;
    }

    const settingId =
      target.dataset?.settingId;

    if (!settingId) {
      return;
    }

    let value;

    if (target.type === "checkbox") {
      value = target.checked;
    } else if (target.type === "range") {
      value = Number(target.value);
    } else {
      value = target.value;
    }

    updateSetting(settingId, value);

    if (
      state.screen === SCREEN.SETTINGS
    ) {
      updateSettingsScreen();
    }
  }

  /* ========================================================
     DIALOGUES
  ======================================================== */

  function openDialog(dialog) {
    if (!dialog) {
      return;
    }

    if (
      typeof dialog.showModal === "function"
    ) {
      if (!dialog.open) {
        dialog.showModal();
      }

      return;
    }

    dialog.setAttribute("open", "");
  }

  function closeDialog(dialog) {
    if (!dialog) {
      return;
    }

    if (
      typeof dialog.close === "function" &&
      dialog.open
    ) {
      dialog.close();
      return;
    }

    dialog.removeAttribute("open");
  }

  /* ========================================================
     UTILITAIRES
  ======================================================== */

  function safeParse(value) {
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn(
        "[Blue Legacy] Données locales invalides.",
        error,
      );

      return null;
    }
  }

  function findLegacyData(keys) {
    for (const key of keys) {
      const value =
        safeParse(
          localStorage.getItem(key),
        );

      if (value) {
        return value;
      }
    }

    return null;
  }

  function cloneData(data) {
    if (data === undefined) {
      return undefined;
    }

    return JSON.parse(
      JSON.stringify(data),
    );
  }

  function renderEmptyState(
    title,
    {
      icon = "🌊",
      detail = "",
    } = {},
  ) {
    return `
      <div class="empty-state" role="status">
        <span class="empty-state-icon" aria-hidden="true">${escapeHtml(icon)}</span>
        <strong class="empty-state-title">${escapeHtml(title || "Aucun élément à afficher.")}</strong>
        ${detail ? `<p class="empty-state-detail">${escapeHtml(detail)}</p>` : ""}
      </div>
    `;
  }

  function uniqueArray(array) {
    return Array.isArray(array)
      ? [...new Set(array)]
      : [];
  }

  function getRandomItem(array) {
    if (
      !Array.isArray(array) ||
      !array.length
    ) {
      return null;
    }

    return array[
      Math.floor(
        Math.random() *
        array.length,
      )
    ];
  }

  function getWeightedRandomItem(
    items,
    getWeight = () => 1,
  ) {
    if (
      !Array.isArray(items) ||
      !items.length
    ) {
      return null;
    }

    const weighted =
      items.map(
        (item) => ({
          item,
          weight: Math.max(
            0,
            Number(getWeight(item)) || 0,
          ),
        }),
      );

    const total =
      weighted.reduce(
        (sum, entry) =>
          sum + entry.weight,
        0,
      );

    if (total <= 0) {
      return getRandomItem(items);
    }

    let random =
      Math.random() * total;

    for (const entry of weighted) {
      random -= entry.weight;

      if (random <= 0) {
        return entry.item;
      }
    }

    return weighted[
      weighted.length - 1
    ].item;
  }

  function createUniqueId(
    prefix = "id",
  ) {
    return `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  }

  function slugify(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      );
  }

  function getDataId(data) {
    if (typeof data === "string") {
      return data;
    }

    return (
      data?.id ||
      slugify(
        data?.name ||
        data?.label ||
        "",
      )
    );
  }

  function formatMoney(value) {
    const number =
      Number(value) || 0;

    if (
      Math.abs(number) >= 1_000_000_000
    ) {
      return `${(
        number / 1_000_000_000
      )
        .toFixed(2)
        .replace(".", ",")} Md`;
    }

    if (
      Math.abs(number) >= 1_000_000
    ) {
      return `${(
        number / 1_000_000
      )
        .toFixed(1)
        .replace(".", ",")} M`;
    }

    if (
      Math.abs(number) >= 1_000
    ) {
      return `${Math.round(
        number / 1_000,
      )} k`;
    }

    return String(
      Math.round(number),
    );
  }

  function formatDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "";
    }

    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    ).format(date);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  function runCareerFinalTitleAudit() {
    const expectations = {
      pirate: ["legende-inachevee", "capitaine-de-renom", "capitaine-de-renom", "terreurs-des-grandes-routes", "terreurs-des-grandes-routes", "legende-des-mers", "legende-des-mers"],
      marine: ["legende-inachevee", "officier-de-renom", "officier-de-renom", "rempart-de-la-justice", "rempart-de-la-justice", "legende-de-la-marine", "legende-de-la-marine"],
      "bounty-hunter": ["legende-inachevee", "chasseur-de-renom", "chasseur-de-renom", "maitre-de-la-traque", "maitre-de-la-traque", "traqueur-de-legende", "traqueur-de-legende"],
      revolutionary: ["legende-inachevee", "voix-de-la-revolte", "voix-de-la-revolte", "etendard-de-la-liberte", "etendard-de-la-liberte", "legende-de-la-revolution", "legende-de-la-revolution"],
    };
    const boundaries = [59, 60, 74, 75, 89, 90, 100];
    const matrix = Object.entries(expectations).flatMap(([faction, ids]) =>
      boundaries.map((popularity, index) => {
        const actual = getDataId(getCareerFinalTitle(faction, popularity));
        return { faction, popularity, expected: ids[index], actual, pass: actual === ids[index] };
      }));
    const gameFor = (faction, dream, popularity, month = CONFIG.maxMonths) => ({
      month,
      character: { faction, dream },
      stats: { popularity },
      runTitles: [],
    });
    const priorities = [
      { name: "dream-low", actual: getDataId(resolveFinalCareerTitle(gameFor("pirate", "one-piece", 45), { type: "dreamCompleted", dreamCompleted: true }, 45)), expected: "roi-des-pirates" },
      { name: "dream-high", actual: getDataId(resolveFinalCareerTitle(gameFor("marine", "admiral", 95), { type: "dreamCompleted", dreamCompleted: true }, 95)), expected: "amiral" },
      { name: "interrupted-high", actual: getDataId(resolveFinalCareerTitle(gameFor("pirate", "one-piece", 90, 12), { type: "defeat", title: "Voyage brisé" }, 90)), expected: "voyage-brise" },
      ...[[58, "legende-inachevee"], [67, "capitaine-de-renom"], [82, "terreurs-des-grandes-routes"], [94, "legende-des-mers"]]
        .map(([popularity, expected]) => ({ name: `complete-${popularity}`, actual: getDataId(resolveFinalCareerTitle(gameFor("pirate", "one-piece", popularity), { type: "dreamUnfulfilled", dreamCompleted: false }, popularity)), expected })),
      { name: "below-minimum", actual: getDataId(getCareerFinalTitle("pirate", -5)), expected: "legende-inachevee" },
      { name: "above-maximum", actual: getDataId(getCareerFinalTitle("marine", 150)), expected: "legende-de-la-marine" },
      { name: "missing-popularity", actual: getDataId(getCareerFinalTitle("pirate", null)), expected: "legende-inachevee" },
      { name: "unknown-faction", actual: getDataId(getCareerFinalTitle("unknown", 95)), expected: "legende-inachevee" },
    ].map((row) => ({ ...row, pass: row.actual === row.expected }));
    const legacy = [
      { id: "legacy-pirate", name: "P", faction: "pirate", duration: 24, endingType: "dreamUnfulfilled", dreamCompleted: false, popularityScore: 92, finalTitle: "legende-inachevee" },
      { id: "legacy-marine", name: "M", faction: "marine", duration: 24, endingType: "retirement", dreamCompleted: false, popularityScore: 78, finalTitle: { id: "legende-inachevee", name: "Légende inachevée" } },
      { id: "legacy-revolution", name: "R", faction: "revolutionary", duration: 24, endingType: "completed", dreamCompleted: false, popularityScore: 65, finalTitle: "Légende inachevée" },
      { id: "legacy-hunter-low", name: "C", faction: "bounty-hunter", duration: 24, endingType: "retirement", dreamCompleted: false, popularityScore: 52, finalTitle: "legende-inachevee" },
      { id: "legacy-defeat", name: "D", faction: "pirate", duration: 12, endingType: "defeat", dreamCompleted: false, popularityScore: 91, finalTitle: { id: "voyage-brise", name: "Voyage brisé" } },
      { id: "legacy-dream", name: "U", faction: "pirate", duration: 24, endingType: "dreamCompleted", dreamCompleted: true, popularityScore: 40, finalTitle: "roi-des-pirates" },
      { id: "legacy-incomplete-data", name: "I", faction: "pirate", duration: 24, endingType: "retirement", dreamCompleted: false, finalTitle: "legende-inachevee" },
    ];
    const migratedOnce = normalizeProfile({ pantheon: legacy, titles: [] });
    const migratedTwice = normalizeProfile(migratedOnce);
    const migrationExpected = ["legende-des-mers", "rempart-de-la-justice", "voix-de-la-revolte", "legende-inachevee", "voyage-brise", "roi-des-pirates", "legende-inachevee"];
    const migration = migratedOnce.pantheon.map((entry, index) => ({
      id: entry.id,
      actual: slugify(getDataId(entry.finalTitle)),
      expected: migrationExpected[index],
      pass: slugify(getDataId(entry.finalTitle)) === migrationExpected[index],
      stable: JSON.stringify(entry.finalTitle) === JSON.stringify(migratedTwice.pantheon[index].finalTitle),
    }));
    const legendaryPantheon = Object.keys(expectations).map((faction) => {
      const title = getCareerFinalTitle(faction, 94);
      return {
        faction,
        title: getDataId(title),
        rarity: title.rarity,
        compatible: isTitleCompatibleWithFaction(title, faction),
        badgeHasLegendaryRarity: createTitleCardHtml(title, { mode: "badge" }).includes('data-rarity="legendary"'),
        dreamCompleted: false,
      };
    });
    const collectionIds = migratedTwice.titles.map(getDataId);
    const report = {
      matrix,
      priorities,
      migration,
      legendaryPantheon,
      uniqueCatalogIds: new Set(getAllTitles().map(getDataId)).size === getAllTitles().length,
      singleTierPerRun: matrix.every((row) => row.pass),
      noDuplicateCollectionTitles: new Set(collectionIds).size === collectionIds.length,
    };
    report.pass = matrix.every((row) => row.pass) && priorities.every((row) => row.pass) &&
      migration.every((row) => row.pass && row.stable) && legendaryPantheon.every((row) =>
        row.rarity === "legendary" && row.compatible && row.badgeHasLegendaryRarity && !row.dreamCompleted) &&
      report.uniqueCatalogIds && report.noDuplicateCollectionTitles;
    return report;
  }

  function runShopSystemAudit() {
    const originalProfile = localStorage.getItem(CONFIG.profileKey);
    const originalGame = state.game;
    const results = {};
    try {
      const items = getShopItems();
      results.catalog = {
        count: items.length,
        uniqueIds: new Set(items.map((item) => item.id)).size === 5,
        totalPrice: items.reduce((sum, item) => sum + item.price, 0),
        exactPrices: JSON.stringify(items.map((item) => item.price)) === JSON.stringify([250, 375, 475, 625, 900]),
      };

      const invalid = normalizeProfile({
        berries: -20,
        ownedShopItems: ["treasure-map", "treasure-map", "unknown"],
        equippedShopItems: ["unknown", "treasure-map", "vivre-card", "eternal-pose"],
      });
      results.normalization = {
        berries: invalid.berries,
        owned: invalid.ownedShopItems,
        equipped: invalid.equippedShopItems,
      };

      const rarityIds = ["complete-first-run", "reach-final-month", "reach-shinsekai", "complete-five-runs", "visit-three-special-zones", "finish-critical-health"];
      const rewardProfile = normalizeProfile({ achievements: rarityIds });
      const migrated = grantOutstandingAchievementBerries(rewardProfile);
      const afterFirst = rewardProfile.berries;
      const migratedTwice = grantOutstandingAchievementBerries(rewardProfile);
      results.achievements = {
        migrated,
        total: afterFirst,
        claimed: rewardProfile.rewardedAchievementIds.length,
        idempotent: !migratedTwice && rewardProfile.berries === afterFirst,
      };

      saveProfile({ ...createDefaultProfile(), berries: 250 });
      const bought = purchaseShopItem("treasure-map");
      const doubleBuy = purchaseShopItem("treasure-map");
      const afterPurchase = getProfile();
      const purchaseBalance = afterPurchase.berries;
      afterPurchase.berries = 5000;
      afterPurchase.ownedShopItems = items.map((item) => item.id);
      afterPurchase.equippedShopItems = ["treasure-map", "vivre-card"];
      saveProfile(afterPurchase);
      const thirdEquip = equipShopItem("eternal-pose");
      results.purchase = {
        bought,
        doubleBuyBlocked: !doubleBuy,
        exactBalance: purchaseBalance === 0,
        owned: afterPurchase.ownedShopItems.includes("treasure-map"),
        thirdEquipBlocked: !thirdEquip,
      };

      const character = { faction: "pirate", origin: "east-blue", dream: "one-piece", hasD: false };
      const baseline = getInitialStats(character, []);
      const treasure = getInitialStats(character, ["treasure-map"]);
      const jolly = getInitialStats(character, ["reinforced-jolly-roger"]);
      const scoreGame = createDefaultGameState(null);
      scoreGame.stats = { ...createDefaultStats(), health: 40, combat: 40, haki: 40, intelligence: 40, charisma: 40 };
      scoreGame.route = [{ id: "east-blue", routeStage: 1 }];
      scoreGame.activeShopItems = [];
      const ordinaryEvent = { eventType: "ordinary", resolutionCategory: "action" };
      const riskEvent = { eventType: "risk", resolutionCategory: "action" };
      const ordinaryBase = getEventResolutionScore(scoreGame, ordinaryEvent, {});
      const riskBase = getEventResolutionScore(scoreGame, riskEvent, {});
      scoreGame.activeShopItems = ["eternal-pose"];
      results.effects = {
        treasureFortune: treasure.fortune - baseline.fortune,
        jolly: ["health", "combat", "haki", "intelligence", "charisma"].map((stat) => jolly[stat] - baseline[stat]),
        eternalOrdinary: getEventResolutionScore(scoreGame, ordinaryEvent, {}) - ordinaryBase,
        eternalRisk: getEventResolutionScore(scoreGame, riskEvent, {}) - riskBase,
        vivreMultiplier: findShopItem("vivre-card")?.recruitmentWeightMultiplier,
        strawFirstEvent: Boolean(findShopItem("straw-hat")?.firstEventFruit),
      };
      const strawGame = createDefaultGameState(character);
      strawGame.activeShopItems = ["straw-hat"];
      strawGame.route = [{ id: "east-blue", name: "East Blue", routeStage: 1 }];
      strawGame.visitedZoneIds = ["east-blue"];
      strawGame.currentAction = 0;
      strawGame.month = 1;
      const strawEvent = selectSurpriseEvent(strawGame);
      results.strawHat = {
        firstType: strawEvent?.eventType || null,
        triggered: strawGame.shopEffects.strawHatTriggered,
        consumed: strawGame.shopEffects.strawHatConsumed,
      };
      const itemIds = items.map((item) => item.id);
      const scenarios = [[], ...itemIds.map((id) => [id])];
      itemIds.forEach((left, index) => itemIds.slice(index + 1).forEach((right) => scenarios.push([left, right])));
      let seed = 0xB10E;
      const random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      results.simulations = scenarios.map((activeItems) => {
        const simulated = createDefaultGameState(null);
        simulated.stats = getInitialStats(character, activeItems);
        simulated.route = [{ id: "grand-line", routeStage: 3 }];
        simulated.activeShopItems = activeItems;
        const probabilities = getOutcomeTierProbabilities(simulated, ordinaryEvent, {});
        const successThreshold = probabilities.exceptional_success + probabilities.success;
        const recruitmentThreshold = Math.min(0.16, (0.055 + 3 * 0.007) * (activeItems.includes("vivre-card") ? 1.6 : 1));
        let ordinarySuccesses = 0;
        let recruitments = 0;
        for (let index = 0; index < 10000; index += 1) {
          if (random() < successThreshold) ordinarySuccesses += 1;
          if (random() < recruitmentThreshold) recruitments += 1;
        }
        return {
          items: activeItems,
          ordinarySuccessRate: ordinarySuccesses / 10000,
          recruitmentRate: recruitments / 10000,
          firstEventFruit: activeItems.includes("straw-hat"),
        };
      });

      const completionGame = (month, popularity) => ({ month, stats: { popularity } });
      results.completion = [
        calculateCompletionBerries(completionGame(24, 76), { dreamCompleted: false }),
        calculateCompletionBerries(completionGame(24, 84), { dreamCompleted: true }),
        calculateCompletionBerries(completionGame(24, 92), { dreamCompleted: false }),
        calculateCompletionBerries(completionGame(24, 94), { dreamCompleted: true }),
        calculateCompletionBerries(completionGame(12, 100), { dreamCompleted: true }),
      ];
    } finally {
      state.game = originalGame;
      if (originalProfile === null) localStorage.removeItem(CONFIG.profileKey);
      else localStorage.setItem(CONFIG.profileKey, originalProfile);
      updateHomeScreen();
    }
    results.pass = results.catalog.count === 5 && results.catalog.uniqueIds &&
      results.catalog.totalPrice === 2625 && results.catalog.exactPrices &&
      results.normalization.berries === 0 && results.normalization.owned.length === 1 &&
      results.normalization.equipped.length === 1 && results.achievements.total === 810 &&
      results.achievements.claimed === 6 && results.achievements.idempotent &&
      results.purchase.bought && results.purchase.doubleBuyBlocked && results.purchase.exactBalance &&
      results.purchase.owned && results.purchase.thirdEquipBlocked &&
      results.effects.treasureFortune === 15000 && results.effects.jolly.every((value) => value === 2) &&
      results.effects.eternalOrdinary === 5 && results.effects.eternalRisk === 0 &&
      results.effects.vivreMultiplier === 1.6 && results.effects.strawFirstEvent &&
      results.strawHat.firstType === "surprise-fruit" && results.strawHat.triggered && results.strawHat.consumed &&
      results.simulations.length === 16 && results.simulations.every((row) => row.ordinarySuccessRate < 0.9 && row.recruitmentRate < 0.2) &&
      JSON.stringify(results.completion) === JSON.stringify([30, 40, 40, 50, 0]);
    return results;
  }

  function createSeededRandom(seed = 0xD092) {
    let value = Number(seed) >>> 0;
    return () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function simulateWillOfD({ runs = 100000, seed = 0xD092, pity = true } = {}) {
    const totalRuns = Math.max(1, Math.floor(Number(runs) || 100000));
    const random = createSeededRandom(seed);
    let misses = 0;
    let dCount = 0;
    let guaranteeTriggers = 0;
    let longestDrought = 0;
    let intervalTotal = 0;
    let completedIntervals = 0;
    const droughtDistribution = {
      "0-9": 0,
      "10-19": 0,
      "20-29": 0,
      "30-38": 0,
      "39+": 0,
    };

    for (let index = 0; index < totalRuns; index += 1) {
      const result = pity
        ? rollWillOfD(misses, random())
        : {
            hasD: random() < CONFIG.dProbability,
            guaranteed: false,
            nextRunsSinceLastD: misses + 1,
          };
      if (result.hasD) {
        dCount += 1;
        if (result.guaranteed) guaranteeTriggers += 1;
        intervalTotal += misses + 1;
        completedIntervals += 1;
        const bucket = misses < 10
          ? "0-9"
          : misses < 20
            ? "10-19"
            : misses < 30
              ? "20-29"
              : misses < 39
                ? "30-38"
                : "39+";
        droughtDistribution[bucket] += 1;
        misses = 0;
      } else {
        misses = result.nextRunsSinceLastD;
        longestDrought = Math.max(longestDrought, misses);
      }
    }

    return {
      runs: totalRuns,
      dCount,
      observedRate: dCount / totalRuns,
      averageInterval: completedIntervals ? intervalTotal / completedIntervals : null,
      longestDrought,
      guaranteeTriggers,
      droughtDistribution,
    };
  }

  function runWillOfDAudit() {
    const curveCounters = [0, 19, 20, 21, 22, 25, 30, 35, 39];
    const expectedCurve = [0.04, 0.04, 0.05, 0.06, 0.07, 0.10, 0.15, 0.20, 1];
    const curve = curveCounters.map((misses, index) => ({
      misses,
      probability: getWillOfDProbability(misses),
      expected: expectedCurve[index],
    }));
    const resetRoll = rollWillOfD(25, 0);
    const missRoll = rollWillOfD(20, 0.99);
    const guaranteedRoll = rollWillOfD(39, 0.999999);
    const oldProfile = normalizeProfile({ achievements: [], pantheon: [] });
    const invalidProfile = normalizeProfile({ runsSinceLastD: -12.8 });
    const baseCharacter = {
      firstName: "Luffy", lastName: "Monkey", faction: "pirate",
      origin: "east-blue", dream: "one-piece", hasD: false,
    };
    const dCharacter = { ...baseCharacter, hasD: true };
    const baseStats = getInitialStats(baseCharacter, []);
    const dStats = getInitialStats(dCharacter, []);
    const dJollyStats = getInitialStats(dCharacter, ["reinforced-jolly-roger"]);
    const coreStats = ["health", "combat", "haki", "intelligence", "charisma"];
    const factions = ["pirate", "marine", "bounty-hunter", "revolutionary"];
    const factionChecks = factions.map((faction) => {
      const factionCharacter = { ...baseCharacter, faction };
      const withoutD = getInitialStats(factionCharacter, []);
      const withD = getInitialStats({ ...factionCharacter, hasD: true }, []);
      return {
        faction,
        probability: getWillOfDProbability(20),
        statDeltas: coreStats.map((stat) => withD[stat] - withoutD[stat]),
      };
    });
    const scoreGame = createDefaultGameState(null);
    scoreGame.character = baseCharacter;
    scoreGame.stats = { ...createDefaultStats(), health: 40, combat: 40, haki: 40, intelligence: 40, charisma: 40 };
    scoreGame.route = [{ id: "east-blue", routeStage: 1 }];
    scoreGame.activeShopItems = [];
    const eventTypes = ["ordinary", "risk", "decisive"];
    const baseScores = Object.fromEntries(eventTypes.map((eventType) => [
      eventType,
      getEventResolutionScore(scoreGame, { eventType, resolutionCategory: "action" }, {}),
    ]));
    scoreGame.character = dCharacter;
    const dScoreDeltas = Object.fromEntries(eventTypes.map((eventType) => [
      eventType,
      getEventResolutionScore(scoreGame, { eventType, resolutionCategory: "action" }, {}) - baseScores[eventType],
    ]));
    scoreGame.activeShopItems = ["eternal-pose"];
    const dAndPoseDelta = getEventResolutionScore(
      scoreGame,
      { eventType: "ordinary", resolutionCategory: "action" },
      {},
    ) - baseScores.ordinary;
    const namedCharacter = { ...dCharacter, name: buildNameWithD(dCharacter) };
    const pantheonGame = createDefaultGameState(null);
    pantheonGame.character = namedCharacter;
    pantheonGame.stats = cloneData(dStats);
    const pantheonEntry = createPantheonEntry({ type: "completed" }, null, pantheonGame);
    const achievementProfile = normalizeProfile({ pantheon: [{
      id: "d-audit", character: namedCharacter, hasD: true,
      dreamCompleted: true, finishedAt: "2026-01-01T00:00:00.000Z",
    }] });
    const report = {
      config: {
        baseProbability: CONFIG.dProbability,
        pityStart: CONFIG.dPityStart,
        guaranteeAfterMisses: CONFIG.dGuaranteeAfterMisses,
      },
      curve,
      counter: {
        oldProfileDefault: oldProfile.runsSinceLastD,
        invalidProfileNormalized: invalidProfile.runsSinceLastD,
        resetAfterD: resetRoll.nextRunsSinceLastD,
        incrementAfterMiss: missRoll.nextRunsSinceLastD,
        guaranteedAt39: guaranteedRoll.hasD && guaranteedRoll.guaranteed,
      },
      names: {
        generated: namedCharacter.name,
        markerCount: (namedCharacter.name.match(/\bD\./g) || []).length,
        pantheonName: pantheonEntry.name,
        pantheonHasD: pantheonEntry.hasD,
      },
      initialStatDeltas: Object.fromEntries(coreStats.map((stat) => [stat, dStats[stat] - baseStats[stat]])),
      dAndJollyDeltas: Object.fromEntries(coreStats.map((stat) => [stat, dJollyStats[stat] - baseStats[stat]])),
      untouchedStatDeltas: Object.fromEntries(["bounty", "fortune", "crew", "popularity"].map((stat) => [stat, dStats[stat] - baseStats[stat]])),
      factionChecks,
      resolutionDeltas: dScoreDeltas,
      dAndEternalPoseOrdinaryDelta: dAndPoseDelta,
      achievements: {
        discoverD: getAchievementProgress({ condition: { type: "has-d" } }, achievementProfile, null).current,
        dAndDream: getAchievementProgress({ condition: { type: "d-and-dream-completed" } }, achievementProfile, null).current,
      },
      simulation: simulateWillOfD({ runs: 100000, seed: 0xD092, pity: true }),
      rawFourPercentSimulation: simulateWillOfD({ runs: 100000, seed: 0xD092, pity: false }),
    };
    report.pass = curve.every((row) => Math.abs(row.probability - row.expected) < 1e-12) &&
      report.counter.oldProfileDefault === 0 && report.counter.invalidProfileNormalized === 0 &&
      report.counter.resetAfterD === 0 && report.counter.incrementAfterMiss === 21 &&
      report.counter.guaranteedAt39 && report.names.markerCount === 1 &&
      report.names.pantheonName === namedCharacter.name && report.names.pantheonHasD &&
      Object.values(report.initialStatDeltas).every((value) => value === 3) &&
      Object.values(report.dAndJollyDeltas).every((value) => value === 5) &&
      Object.values(report.untouchedStatDeltas).every((value) => value === 0) &&
      report.factionChecks.every((row) => row.probability === 0.05 && row.statDeltas.every((value) => value === 3)) &&
      Object.values(report.resolutionDeltas).every((value) => value === 4) &&
      report.dAndEternalPoseOrdinaryDelta === 9 &&
      report.achievements.discoverD === 1 && report.achievements.dAndDream === 1 &&
      report.simulation.longestDrought <= CONFIG.dGuaranteeAfterMisses;
    return report;
  }

  function runCharacterNameAudit() {
    const cases = [
      {
        id: "without-d",
        character: { firstName: "Kenzo", lastName: "Écume", hasD: false },
        expected: "Écume Kenzo",
      },
      {
        id: "with-d",
        character: { firstName: "Kenzo", lastName: "Écume", hasD: true },
        expected: "Écume D. Kenzo",
      },
      {
        id: "compound-first-name",
        character: { firstName: "Jean Bart", lastName: "Montbrume", hasD: true },
        expected: "Montbrume D. Jean Bart",
      },
      {
        id: "compound-last-name",
        character: { firstName: "Anna", lastName: "De la Vega", hasD: false },
        expected: "De la Vega Anna",
      },
      {
        id: "first-name-only",
        character: { firstName: "Kenzo", lastName: "", hasD: false },
        expected: "Kenzo",
      },
      {
        id: "last-name-only",
        character: { firstName: "", lastName: "Écume", hasD: false },
        expected: "Écume",
      },
      {
        id: "extra-spaces",
        character: { firstName: "  Jean   Bart ", lastName: " De la   Vega  ", hasD: true },
        expected: "De la Vega D. Jean Bart",
      },
      {
        id: "existing-d-particle",
        character: { firstName: "D. Kenzo", lastName: "Écume D.", hasD: true },
        expected: "Écume D. Kenzo",
      },
      {
        id: "historical-name-only",
        character: { name: "Kenzo Écume", hasD: false },
        expected: "Kenzo Écume",
      },
      {
        id: "empty",
        character: {},
        expected: "Aventurier inconnu",
      },
    ].map((test) => {
      const actual = buildNameWithD(test.character);
      return { ...test, actual, pass: actual === test.expected };
    });
    const legacyWithFields = normalizeGame({
      character: {
        name: "Kenzo D. Écume",
        firstName: "Kenzo",
        lastName: "Écume",
        hasD: true,
      },
    });
    const legacyNameOnly = normalizeGame({
      character: { name: "Ancien Nom Composé", hasD: false },
    });
    const normalizedProfile = normalizeProfile({
      pantheon: [{
        id: "past-name-audit",
        name: "Kenzo D. Écume",
        firstName: "Kenzo",
        lastName: "Écume",
        hasD: true,
      }],
      titles: [{
        id: "audit-title",
        firstUnlockedBy: {
          characterName: "Kenzo D. Écume",
          faction: "pirate",
          adventureId: "past-name-audit",
        },
      }],
      achievements: [{
        id: "audit-achievement",
        unlockedBy: {
          characterName: "Kenzo D. Écume",
          faction: "pirate",
          adventureId: "past-name-audit",
        },
      }],
    });
    const profileEntry = normalizedProfile.pantheon[0];
    const report = {
      cases,
      legacy: {
        separatedFieldsName: legacyWithFields.character.name,
        separatedFieldsPreserved: legacyWithFields.character.firstName === "Kenzo" &&
          legacyWithFields.character.lastName === "Écume",
        historicalNameOnly: legacyNameOnly.character.name,
      },
      pantheon: {
        name: profileEntry?.name,
        firstName: profileEntry?.firstName,
        lastName: profileEntry?.lastName,
        hasD: profileEntry?.hasD,
      },
      attributions: {
        title: normalizedProfile.titles[0]?.firstUnlockedBy?.characterName,
        achievement: normalizedProfile.achievements[0]?.unlockedBy?.characterName,
      },
      rerollDoesNotAffectD: buildNameWithD({ firstName: "Luffy", lastName: "Monkey", hasD: true }) === "Monkey D. Luffy" &&
        buildNameWithD({ firstName: "Ace", lastName: "Portgas", hasD: true }) === "Portgas D. Ace",
    };
    report.pass = cases.every((test) => test.pass) &&
      report.legacy.separatedFieldsName === "Écume D. Kenzo" &&
      report.legacy.separatedFieldsPreserved &&
      report.legacy.historicalNameOnly === "Ancien Nom Composé" &&
      report.pantheon.name === "Écume D. Kenzo" &&
      report.pantheon.firstName === "Kenzo" && report.pantheon.lastName === "Écume" &&
      report.pantheon.hasD === true &&
      report.attributions.title === "Écume D. Kenzo" &&
      report.attributions.achievement === "Écume D. Kenzo" &&
      report.rerollDoesNotAffectD;
    return report;
  }

  function runHakiDecisiveAudit() {
    const factions = ["pirate", "marine", "bounty-hunter", "revolutionary"];
    const firstTypes = ["none", "observation", "armament", "conquerors"];
    const cases = [];
    const coherenceCases = getBossEvents()
      .filter((event) => [1, 2].includes(Number(event.decisiveStage)) && event.tags?.includes("haki-awakening"))
      .flatMap((event) => event.choices.flatMap((choice) => choice.outcomes.map((outcome) => {
        const positive = ["success", "exceptional_success"].includes(outcome.outcomeTier);
        const hasHakiTitle = (outcome.titles || []).some((title) =>
          HAKI_TITLE_REWARD_IDS.includes(getDataId(title)));
        const hasPositiveEffect = Object.values(outcome.effects || {}).some((value) => Number(value) > 0);
        return {
          eventId: event.id,
          choice: choice.choiceTag || choice.id,
          outcomeId: outcome.id,
          tier: outcome.outcomeTier,
          hasHakiTitle,
          hasPositiveEffect,
          pass: positive ? hasHakiTitle : !hasHakiTitle && !hasPositiveEffect,
        };
      })));
    const makeGame = (faction, firstType) => {
      const game = createDefaultGameState({
        name: "Audit Haki", faction, dream: faction === "marine" ? "admiral" : "one-piece",
        origin: "east-blue", traits: [],
      });
      game.flags.completedDecisiveStage1 = true;
      game.flags.firstDecisiveHakiType = firstType;
      game.flags.conquerorsHakiAwakenedAtFirstDecisive = firstType === "conquerors";
      game.flags.secondDecisiveHakiBranch = firstType === "conquerors" ? "mastery" : "base-conquerors";
      const initialTitle = {
        observation: "haki-observation",
        armament: "haki-armement",
        conquerors: "haki-des-rois",
      }[firstType];
      if (initialTitle) unlockTitle(initialTitle, findTitleData(initialTitle), game, false);
      return game;
    };

    factions.forEach((faction) => {
      const event = getBossEvents().find((candidate) =>
        candidate.id === `haki-confrontation-${faction}`);
      (event?.choices || []).forEach((choice) => {
        firstTypes.forEach((firstType) => {
          const game = makeGame(faction, firstType);
          game.currentEvent = event;
          const expectedTitle = firstType === "conquerors"
            ? "maitrise-haki-des-rois-plus"
            : "haki-des-rois";
          const compatible = getCompatibleOutcomes(choice, game, event);
          const success = compatible.find((outcome) =>
            (outcome.titles || []).some((title) => getDataId(title) === expectedTitle));
          const selected = success
            ? selectOutcome({ ...choice, outcomes: [success] }, game, event)
            : null;
          const secured = secureHakiDecisiveOutcome(selected, event, game);
          if (secured) {
            applyChoiceFlags(secured, game, { event });
            applyOutcomeMajorRewards(secured, game);
          }
          const titleIds = game.runTitles.map(getDataId);
          const retainedFirstTitle = {
            observation: "haki-observation",
            armament: "haki-armement",
          }[firstType];
          const forbidden = firstType === "conquerors"
            ? "haki-des-rois"
            : "maitrise-haki-des-rois-plus";
          cases.push({
            faction,
            choice: choice.choiceTag || choice.id,
            firstHaki: firstType,
            branch: game.flags.secondDecisiveHakiBranch,
            compatibleOutcomeIds: compatible.map((outcome) => outcome.id),
            selectedOutcomeId: selected?.id || null,
            expectedTitle,
            actualTitles: titleIds,
            pass: Boolean(success) && titleIds.includes(expectedTitle) &&
              !titleIds.includes(forbidden) &&
              (!retainedFirstTitle || titleIds.includes(retainedFirstTitle)) &&
              game.flags.firstDecisiveHakiType === firstType,
          });
        });
      });
    });

    const directBlockedGame = makeGame("pirate", "none");
    const directBlocked = unlockTitle(
      "maitrise-haki-des-rois-plus",
      findTitleData("maitrise-haki-des-rois-plus"),
      directBlockedGame,
      false,
    ) === false && !directBlockedGame.appliedTitleEffects.includes("maitrise-haki-des-rois-plus");
    const directAllowedGame = makeGame("pirate", "conquerors");
    const directAllowed = unlockTitle(
      "maitrise-haki-des-rois-plus",
      findTitleData("maitrise-haki-des-rois-plus"),
      directAllowedGame,
      false,
    ) === true;
    const corruptedGame = makeGame("pirate", "none");
    const corruptedEvent = getBossEvents().find((event) => event.id === "haki-confrontation-pirate");
    corruptedGame.currentEvent = corruptedEvent;
    const corrupted = secureHakiDecisiveOutcome(normalizeOutcome({
      id: "corrupted-mastery",
      outcomeTier: "success",
      titles: ["maitrise-haki-des-rois-plus"],
      flags: { masteredHakiKings: true },
    }), corruptedEvent, corruptedGame);
    applyChoiceFlags(corrupted, corruptedGame, { event: corruptedEvent });
    applyOutcomeMajorRewards(corrupted, corruptedGame);
    const corruptedRecovered = corruptedGame.runTitles.some((title) => getDataId(title) === "haki-des-rois") &&
      !corruptedGame.runTitles.some((title) => getDataId(title) === "maitrise-haki-des-rois-plus") &&
      corruptedGame.flags.firstDecisiveHakiType === "none";
    const reloadedNone = normalizeGame(cloneData(makeGame("pirate", "none")));
    const reloadedObservation = normalizeGame(cloneData(makeGame("pirate", "observation")));
    const reloadStable = reloadedNone.flags.firstDecisiveHakiType === "none" &&
      reloadedNone.flags.secondDecisiveHakiBranch === "base-conquerors" &&
      reloadedObservation.flags.firstDecisiveHakiType === "observation" &&
      reloadedObservation.flags.secondDecisiveHakiBranch === "base-conquerors";
    const resolveReloadedSuccess = (game) => {
      const event = getBossEvents().find((candidate) => candidate.id === "haki-confrontation-pirate");
      game.currentEvent = event;
      const success = getCompatibleOutcomes(event.choices[0], game, event).find((outcome) =>
        (outcome.titles || []).some((title) => getDataId(title) === "haki-des-rois"));
      applyChoiceFlags(success, game, { event });
      applyOutcomeMajorRewards(success, game);
      return game.runTitles.map(getDataId);
    };
    const noneAfterReload = resolveReloadedSuccess(reloadedNone);
    const observationAfterReload = resolveReloadedSuccess(reloadedObservation);
    const reloadThenSuccess = noneAfterReload.includes("haki-des-rois") &&
      !noneAfterReload.includes("maitrise-haki-des-rois-plus") &&
      observationAfterReload.includes("haki-observation") &&
      observationAfterReload.includes("haki-des-rois") &&
      !observationAfterReload.includes("maitrise-haki-des-rois-plus");
    const profile = createDefaultProfile();
    const sovereignAchievement = getAllAchievements().find((item) => item.id === "awaken-kings-haki");
    const masteryAchievement = getAllAchievements().find((item) => item.id === "master-kings-haki");
    const baseAchievementGame = makeGame("pirate", "none");
    unlockTitle("haki-des-rois", findTitleData("haki-des-rois"), baseAchievementGame, false);
    const achievementsCorrect =
      getAchievementProgress(sovereignAchievement, profile, baseAchievementGame).unlocked &&
      !getAchievementProgress(masteryAchievement, profile, baseAchievementGame).unlocked &&
      getAchievementProgress(masteryAchievement, profile, directAllowedGame).unlocked;
    const incoherentGame = makeGame("pirate", "none");
    const incoherentEvent = getBossEvents().find((event) => event.id === "haki-confrontation-pirate");
    const incoherentChoice = incoherentEvent.choices[0];
    const validAwakening = getCompatibleOutcomes(incoherentChoice, incoherentGame, incoherentEvent)
      .find((outcome) => outcome.id.endsWith("-awakened"));
    const repairedPositive = secureHakiOutcomeCoherence(
      { ...cloneData(validAwakening), id: "positive-without-haki", titles: [] },
      incoherentChoice,
      incoherentEvent,
      incoherentGame,
    );
    const positiveWithoutHakiRepaired = (repairedPositive.titles || [])
      .some((title) => getDataId(title) === "haki-des-rois");
    const report = {
      pass: cases.length === 48 && cases.every((test) => test.pass) &&
        coherenceCases.length === 84 && coherenceCases.every((test) => test.pass) &&
        directBlocked && directAllowed && corruptedRecovered && reloadStable &&
        reloadThenSuccess && achievementsCorrect && positiveWithoutHakiRepaired,
      cases,
      coherenceCases,
      safeguards: {
        directBlocked, directAllowed, corruptedRecovered, reloadStable,
        reloadThenSuccess, achievementsCorrect, positiveWithoutHakiRepaired,
      },
    };
    return report;
  }

  function runCollectionCatalogAudit() {
    const achievements = getAllAchievements();
    const titles = getAllTitles();
    const factions = ["pirate", "marine", "bounty-hunter", "revolutionary"];
    const origins = ["east-blue", "north-blue", "south-blue", "west-blue"];
    const dreams = [
      "one-piece", "sea-emperor", "worlds-greatest-fortune", "forgotten-history",
      "greatest-bounty-hunter", "most-dangerous-criminals", "hunt-an-emperor", "contract-fortune",
      "break-the-chains", "reveal-void-century", "build-underground-network", "found-free-nation",
      "admiral", "fleet-admiral", "reform-the-marines", "greatest-marine-hero",
    ];
    const specialZones = (window.GAME_DATA?.zones || []).filter((zone) => zone.special).map((zone) => zone.id);
    const richRuns = Array.from({ length: 10 }, (_, index) => ({
      id: `audit-run-${index}`,
      faction: factions[index % factions.length],
      origin: origins[index % origins.length],
      dream: dreams[index],
      dreamCompleted: index < 4,
      hasD: index === 0,
      duration: 24,
      finishedAt: new Date(2025, 0, index + 1).toISOString(),
      endingType: "completed",
      visitedZoneIds: [origins[index % origins.length], "reverse-mountain", ...specialZones, "shinsekai"],
      stats: {
        ...createDefaultStats(),
        health: index === 1 ? 10 : 90,
        combat: index === 2 ? 12 : 80,
        haki: 75,
        intelligence: 75,
        charisma: 85,
        bounty: 6000000,
        fortune: 180000,
        crew: index === 3 ? 1 : 6,
        popularity: 96,
      },
      achievementProgress: {
        dangerEventsSurvived: 4,
        rareEventsResolved: 5,
        callbacksResolved: 2,
        exceptionalOutcomes: 4,
        actionSuccesses: 10,
        socialSuccesses: 10,
        maxStats: { crew: 6 },
      },
      devilFruit: index < 3 ? { id: `audit-fruit-${index}`, name: `Fruit ${index}` } : null,
      activeShopItems: ["treasure-map", "eternal-pose"],
      runTitles: [
        { id: "haki-observation" },
        { id: "haki-des-rois" },
        { id: "maitrise-haki-des-rois-plus" },
      ],
      crewMembers: [{ id: "chopper", rarity: "legendary" }],
      legendaryArcs: {
        talent: { status: "succeeded", titleId: "supernova" },
        marineford: { status: "succeeded", titleId: "fleau-de-marineford" },
        emperor: { status: "succeeded", titleId: "tombeur-de-kaido" },
      },
    }));
    const richProfile = normalizeProfile({
      pantheon: richRuns,
      titles: titles.slice(0, 12),
      ownedShopItems: getShopItems().map((item) => item.id),
    });
    const emptyProfile = normalizeProfile({});
    const achievementRows = achievements.map((achievement) => {
      const positive = getAchievementProgress(achievement, richProfile, null);
      const negative = getAchievementProgress(achievement, emptyProfile, null);
      return {
        id: achievement.id,
        type: achievement.condition?.type,
        positive: positive.unlocked,
        negative: negative.unlocked,
      };
    });
    const ultimateExpected = [
      "roi-des-pirates", "empereur-des-mers", "seigneur-des-tresors", "gardien-histoire-oubliee",
      "legende-des-chasseurs", "fleau-des-criminels", "tombeur-empereur", "maitre-des-contrats",
      "chain-breaker", "truth-bearer", "architect-of-revolution", "founder-of-free-people",
      "amiral", "amiral-en-chef", "justice-nouvelle", "heros-de-la-marine",
    ];
    const dreamFactions = [
      ...Array(4).fill("pirate"),
      ...Array(4).fill("bounty-hunter"),
      ...Array(4).fill("revolutionary"),
      ...Array(4).fill("marine"),
    ];
    const dreamRows = dreams.map((dreamId, index) => {
      const character = {
        id: `dream-audit-${dreamId}`,
        name: `Audit ${dreamId}`,
        faction: dreamFactions[index],
        dream: dreamId,
        origin: origins[index % 4],
        traits: [],
        devilFruit: null,
      };
      const game = createDefaultGameState(character);
      game.month = CONFIG.maxMonths;
      game.route = generateRoute(character);
      game.visitedZoneIds = game.route.map((zone) => zone.id);
      game.stats.popularity = 90;
      const successEnding = { type: "dreamCompleted", dreamCompleted: true, finalMonth: 24 };
      const failureEnding = { type: "dreamUnfulfilled", dreamCompleted: false, finalMonth: 24 };
      const mixedEnding = { type: "completed", dreamCompleted: false, finalMonth: 24 };
      const successTitle = resolveFinalCareerTitle(game, successEnding, 90);
      const failureTitle = resolveFinalCareerTitle(game, failureEnding, 90);
      const mixedTitle = resolveFinalCareerTitle(game, mixedEnding, 75);
      const pantheon = createPantheonEntry(successEnding, successTitle, game);
      return {
        dreamId,
        expected: ultimateExpected[index],
        success: getDataId(successTitle),
        failure: getDataId(failureTitle),
        mixed: getDataId(mixedTitle),
        pantheon: getDataId(pantheon.finalTitle),
        pass: getDataId(successTitle) === ultimateExpected[index] &&
          getDataId(failureTitle) !== ultimateExpected[index] &&
          getDataId(mixedTitle) !== ultimateExpected[index] &&
          getDataId(pantheon.finalTitle) === ultimateExpected[index],
      };
    });
    const lockedLeaks = titles.filter((title) =>
      createTitleCardHtml(title, { mode: "full", locked: true }).includes(title.unlockHint),
    ).map((title) => title.id);
    const titleRows = titles.filter((title) => typeof title.condition === "function").map((title) => {
      const game = createDefaultGameState(null);
      game.stats = { ...createDefaultStats(), health: 90, combat: 80, haki: 80, intelligence: 80, charisma: 80, crew: 6 };
      game.visitedZoneIds = ["shinsekai"];
      game.achievementProgress.dangerEventsSurvived = 2;
      return {
        id: title.id,
        positive: Boolean(title.condition({ ...createEventContext(game), game })),
      };
    });
    const eventTitleIds = new Set([...getAllEvents(), ...getBossEvents()].flatMap((event) =>
      event.choices.flatMap((choice) => choice.outcomes.flatMap((outcome) => outcome.titles.map(getDataId))),
    ));
    const titleSourceRows = titles.filter((title) => !title.finalTitle && typeof title.condition !== "function")
      .map((title) => ({
        id: title.id,
        eventSource: eventTitleIds.has(title.id) || Boolean(title.sourceType),
      }));
    const rarityCounts = Object.fromEntries(Object.keys(TITLE_RARITIES).map((rarity) => [
      rarity,
      achievements.filter((achievement) => normalizeRarity(achievement.rarity) === rarity).length,
    ]));
    const report = {
      achievements: {
        count: achievements.length,
        uniqueIds: new Set(achievements.map(getDataId)).size === achievements.length,
        uniqueNames: new Set(achievements.map((item) => item.name)).size === achievements.length,
        types: uniqueArray(achievements.map((item) => item.condition?.type)),
        rows: achievementRows,
        rarityCounts,
        totalBerries: achievements.reduce((sum, item) => sum + getAchievementBerryReward(item), 0),
      },
      titles: {
        count: titles.length,
        uniqueIds: new Set(titles.map(getDataId)).size === titles.length,
        uniqueNames: new Set(titles.map((item) => item.name)).size === titles.length,
        conditionRows: titleRows,
        eventSourceRows: titleSourceRows,
        ultimatePreserved: ultimateExpected.every((id) => Boolean(findTitleData(id))),
        dreamRows,
        lockedHintLeaks: lockedLeaks,
        career: runCareerFinalTitleAudit(),
      },
    };
    report.pass = report.achievements.count >= 35 && report.achievements.count <= 60 &&
      report.achievements.uniqueIds && report.achievements.uniqueNames &&
      achievementRows.every((row) => row.positive && !row.negative) &&
      report.titles.count >= 40 && report.titles.count <= 90 &&
      report.titles.uniqueIds && report.titles.uniqueNames && report.titles.ultimatePreserved &&
      dreamRows.every((row) => row.pass) && titleRows.every((row) => row.positive) &&
      titleSourceRows.every((row) => row.eventSource) &&
      !lockedLeaks.length && report.titles.career.pass;
    return report;
  }

  /* ========================================================
     FONCTIONS PUBLIQUES
  ======================================================== */

  Object.assign(window, {
    openScreen,
    startCreation,
    createCharacter,
    generateName,
    generateFirstName,
    generateLastName,
    generateFullName,
    generateRoute,
    validateGeneratedRoute,
    getZoneIndexForMonth,
    startAdventure,
    resumeGame,
    returnToMainMenu,
    openGameMenu,
    closeGameMenu,
    toggleGameMenu,
    setGameStatsExpanded,
    setGameDetailsExpanded,
    loadGame,
    saveGame,
    clearSave,
    deleteSave,
    requestAbandonAdventure,
    abandonAdventure,
    startMonth,
    finishMonth,
    startNextEvent,
    getAvailableEvents,
    isEventCompatible,
    resolveChoice,
    normalizeOutcome,
    getCompatibleOutcomes,
    isOutcomeCompatible,
    selectOutcome,
    continueAfterResult,
    openLogbook,
    closeLogbook,
    grantDevilFruit,
    hasDevilFruit,
    setCombatStyle,
    getCombatStyle,
    addTrait,
    removeTrait,
    hasTrait,
    unlockTitle,
    normalizeProfile,
    getWillOfDProbability,
    rollWillOfD,
    simulateWillOfD,
    runWillOfDAudit,
    runCharacterNameAudit,
    runHakiDecisiveAudit,
    validateRunRewards,
    normalizeRarity,
    getFactionRenownMeta,
    getEventResolutionScore,
    getOutcomeTierProbabilities,
    calculateOutcomeTier,
    calculatePopularityScore,
    runBlueLegacyEventAudit,
    runBlueLegacySelectionSimulations,
    runBalanceSimulation,
    runBalanceAudit,
    runBigNewsEditorialAudit,
    getRarityLabel,
    getRarityIcon,
    getRewardTypeIcon,
    createTitleCardHtml,
    createRewardRevealData,
    queueRewardReveal,
    updateRewardRevealScreen,
    continueAfterRewardReveal,
    unlockAchievement,
    finishAdventure,
    createPantheonEntry,
    getCareerFinalTitle,
    resolveFinalCareerTitle,
    migrateLegacyCareerFinalTitle,
    runCareerFinalTitleAudit,
    openPastLife,
    exportPastLifeCareer,
    assertExportUsesSafeColors,
    getCareerExportFilename,
    canvasToPngBlob,
    deliverCareerPng,
    updateSetting,
    getSetting,
    getShopItems,
    getProfileCosmetics,
    calculateProfileStatistics,
    formatPlayerIdentity,
    renderPlayerIdentity,
    formatProfileIdentity,
    runProfileStatisticsAudit,
    purchaseProfileCosmetic,
    purchaseShopItem,
    equipShopItem,
    unequipShopItem,
    calculateCompletionBerries,
    runShopSystemAudit,
    runCollectionCatalogAudit,
    runDivelcaAchievementAudit,
    runDivelcaPersistenceAudit,
  });
  window.BLUE_LEGACY_DEV = Object.freeze({
    runBalanceSimulation,
    runBalanceAudit,
    runBalanceValidation: runBlueLegacyEventAudit,
    getOutcomeTierProbabilities,
    runCareerFinalTitleAudit,
    getWillOfDProbability,
    simulateWillOfD,
    runWillOfDAudit,
    runCharacterNameAudit,
    runHakiDecisiveAudit,
  });

  /* ========================================================
     INITIALISATION
  ======================================================== */

  function initializeApplication() {
    collectDom();
    window.BlueLegacyLeaderboard?.initialize({
      getProfile,
      formatIdentity: formatPlayerIdentity,
      renderIdentity: renderPlayerIdentity,
    });
    setGameStatsExpanded(readGameStatsExpandedPreference(), { persist: false });
    setGameDetailsExpanded(readGameDetailsExpandedPreference(), { persist: false });
    createGameMenu();
    bindEvents();
    applySettings();
    validateAchievementCatalog();
    validateEventCatalogInDevelopment();
    validateStatisticsInDevelopment();
    checkAchievements(null, { retroactive: true });

    const developmentQuery = new URLSearchParams(window.location.search);
    if (developmentQuery.has("balanceAudit")) {
      const runsPerFaction = Math.max(1, Number(developmentQuery.get("runsPerFaction")) || 2000);
      const seed = Number(developmentQuery.get("balanceSeed")) || 11092026;
      const report = runBalanceSimulation({ runsPerFaction, seed });
      document.documentElement.dataset.balanceAudit = JSON.stringify(report);
    }
    if (developmentQuery.has("careerTitleAudit")) {
      document.documentElement.dataset.careerTitleAudit = JSON.stringify(runCareerFinalTitleAudit());
    }
    if (developmentQuery.has("shopAudit")) {
      document.documentElement.dataset.shopAudit = JSON.stringify(runShopSystemAudit());
    }
    if (developmentQuery.has("collectionAudit")) {
      document.documentElement.dataset.collectionAudit = JSON.stringify(runCollectionCatalogAudit());
    }
    if (developmentQuery.has("dAudit")) {
      document.documentElement.dataset.dAudit = JSON.stringify(runWillOfDAudit());
    }
    if (developmentQuery.has("nameAudit")) {
      document.documentElement.dataset.nameAudit = JSON.stringify(runCharacterNameAudit());
    }
    state.screen = SCREEN.HOME;

    showCreationSlide(0);

    openScreen(
      SCREEN.HOME,
      {
        save: false,
      },
    );
    if (developmentQuery.has("shopPreview")) {
      openScreen(SCREEN.SHOP, { save: false });
      requestAnimationFrame(() => {
        const cards = [...document.querySelectorAll(".shop-item-card")];
        document.documentElement.dataset.shopLayoutAudit = JSON.stringify({
          viewport: [window.innerWidth, window.innerHeight],
          cards: cards.length,
          cardWidths: cards.map((card) => Math.round(card.getBoundingClientRect().width)),
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        });
      });
    }
  }

  function validateEventCatalogInDevelopment() {
    const auditEnabled = ["localhost", "127.0.0.1"].includes(window.location.hostname) ||
      new URLSearchParams(window.location.search).has("audit");
    if (!auditEnabled) return;

    const events = [...getAllEvents(), ...getBossEvents()];
    const seenEventIds = new Set();
    const structuralWarnings = [];
    const removedNpcNamePattern =
      /\b(?:Alba|Jasko|Cendre|Pivoine|Néro|Morgane Rotative|Orme Gris|Garo Main-Calme|Nox la Claire|Maëlys|Basile|Ysée|Brann|Sola|Ravel|Varo|Fer-Blanc|Toma|Aveline|Lysandre|Talc|Senn|Soria|Sia|Nils|Ora|Calame|Hobb|Miska|Fulga|Ploc|Grelot)\b/i;

    events.forEach((event) => {
      if (!event.id || seenEventIds.has(event.id)) {
        structuralWarnings.push(`Identifiant d’événement invalide ou dupliqué : ${event.id || "(vide)"}.`);
      }
      seenEventIds.add(event.id);

      if (!event.choices.length) {
        structuralWarnings.push(`Événement sans choix : ${event.id}.`);
      }
      if (!["ordinary", "risk", "decisive", "surprise-fruit", "surprise-recruit"].includes(event.eventType)) {
        structuralWarnings.push(`Nomenclature obsolète : ${event.id}/${event.eventType}.`);
      }
      if (!EVENT_TYPE_META[event.eventType]) {
        structuralWarnings.push(`Type d’événement invalide : ${event.id}/${event.eventType}.`);
      }
      if (!["action", "social"].includes(event.resolutionCategory)) {
        structuralWarnings.push(`Catégorie de résolution invalide : ${event.id}/${event.resolutionCategory}.`);
      }
      if (event.eventType === "decisive" && event.choices.length !== 3) {
        structuralWarnings.push(`Événement décisif sans exactement trois choix : ${event.id}.`);
      }
      if (["surprise-fruit", "surprise-recruit"].includes(event.eventType) && event.choices.length !== 2) {
        structuralWarnings.push(`Surprise sans exactement deux propositions : ${event.id}.`);
      }
      if (["ordinary", "risk"].includes(event.eventType) && ![2, 3].includes(event.choices.length)) {
        structuralWarnings.push(`Nombre de choix invalide : ${event.id}/${event.choices.length}.`);
      }
      if (!event.factions.length && !/commun|common/i.test(`${event.category} ${(event.tags || []).join(" ")}`) && event.eventType !== "decisive") {
        structuralWarnings.push(`Événement sans faction ni statut commun : ${event.id}.`);
      }
      if (!event.zones.length && event.eventType !== "decisive") {
        structuralWarnings.push(`Événement sans zone : ${event.id}.`);
      }

      const visibleTexts = [event.title, event.description];
      const seenChoiceIds = new Set();
      event.choices.forEach((choice) => {
        if (!choice.id) structuralWarnings.push(`Choix sans ID : ${event.id}.`);
        if (seenChoiceIds.has(choice.id)) structuralWarnings.push(`ID de choix dupliqué : ${event.id}/${choice.id}.`);
        seenChoiceIds.add(choice.id);
        if (!choice.outcomes.length) structuralWarnings.push(`Choix sans issue : ${event.id}/${choice.id}.`);
        visibleTexts.push(choice.text);
        const seenOutcomeIds = new Set();
        choice.outcomes.forEach((outcome) => {
          if (!outcome.id) structuralWarnings.push(`Issue sans ID : ${event.id}/${choice.id}.`);
          if (seenOutcomeIds.has(outcome.id)) structuralWarnings.push(`ID d’issue dupliqué : ${event.id}/${choice.id}/${outcome.id}.`);
          seenOutcomeIds.add(outcome.id);
          visibleTexts.push(outcome.result);
          if (!String(outcome.result || "").trim()) {
            structuralWarnings.push(`Issue sans texte : ${event.id}/${choice.id}/${outcome.id}.`);
          }
        });
      });

      if (visibleTexts.some((text) => removedNpcNamePattern.test(String(text || "")))) {
        structuralWarnings.push(`Ancien personnage original encore visible : ${event.id}.`);
      }
      if (visibleTexts.some((text) => /(?:étape|épreuve)\s*[123x]\s*sur\s*3/i.test(String(text || "")))) {
        structuralWarnings.push(`Étape décisive visible : ${event.id}.`);
      }

      const renderedChoices = createEventChoicesHtml(event, state.game || {}).match(/data-event-choice-index=/g)?.length || 0;
      if (renderedChoices !== event.choices.length) {
        structuralWarnings.push(`Choix définis/affichés différents : ${event.id} (${event.choices.length}/${renderedChoices}).`);
      }
    });

    const knownZoneIds = new Set(getZoneCatalog().map((zone) => zone.id));
    const knownDreamIds = new Set(
      Object.values(window.GAME_DATA?.dreams || {}).flat().map((dream) => dream.id),
    );
    const knownLoreCharacters = new Set([
      "Morgans", "Buggy", "Crocodile", "Nico Robin", "Koala", "Sabo",
      "Tashigi", "Fujitora", "Sakazuki", "Koby", "Garp", "Marco",
      "Perona", "Daz Bonez", "Smoker", "Tsuru", "Borsalino", "Basil Hawkins",
      "Karasu", "Trafalgar Law", "Issho", "Dracule Mihawk", "Morley",
      "Eustass Kid", "Killer",
      ...(window.GAME_DATA?.crewRecruitments || []).map((member) => member.name),
      ...(window.GAME_DATA?.marineRecruitments || []).map((member) => member.name),
    ]);
    const producedFlags = new Set();
    events.forEach((event) => event.choices.forEach((choice) =>
      choice.outcomes.forEach((outcome) =>
        Object.entries(outcome.flags || {}).forEach(([flag, value]) => {
          if (value) producedFlags.add(flag);
        }),
      ),
    ));
    events.forEach((event) => {
      event.zones.forEach((zoneId) => {
        if (!knownZoneIds.has(zoneId)) structuralWarnings.push(`Zone inconnue : ${event.id}/${zoneId}.`);
      });
      event.dreamIds.forEach((dreamId) => {
        if (!knownDreamIds.has(dreamId)) structuralWarnings.push(`Rêve inconnu : ${event.id}/${dreamId}.`);
      });
      event.loreCharacters.forEach((name) => {
        if (!knownLoreCharacters.has(name)) structuralWarnings.push(`Personnage canonique non répertorié : ${event.id}/${name}.`);
      });
      [...event.requiredEvents, ...event.forbiddenEvents].forEach((eventId) => {
        if (!seenEventIds.has(eventId)) structuralWarnings.push(`Référence d’événement inconnue : ${event.id}/${eventId}.`);
      });
      if (event.tags.includes("callback")) {
        Object.keys(event.requiredFlags || {}).forEach((flag) => {
          if (!producedFlags.has(flag)) {
            structuralWarnings.push(`Callback inaccessible : ${event.id}/${flag}.`);
          }
        });
      }
    });

    const thirdChoiceLabels = new Map();
    events.forEach((event) => {
      if (event.eventType === "decisive") return;
      const label = event.choices[2]?.text?.trim().toLowerCase();
      if (!label) return;
      const owners = thirdChoiceLabels.get(label) || [];
      owners.push(event.id);
      thirdChoiceLabels.set(label, owners);
    });
    thirdChoiceLabels.forEach((owners, label) => {
      if (owners.length > 1) structuralWarnings.push(`Troisième choix partagé (${owners.length}) : « ${label} ».`);
    });

    const withTwoChoices = events.filter((event) => event.choices.length === 2);
    const withThreeChoices = events.filter((event) => event.choices.length === 3);
    const importantWithTwoChoices = withTwoChoices.filter(
      (event) => event.important,
    );
    const vagueTitles = /^(une rencontre|le choix du destin|un danger|le poids du passé|un étrange personnage|une décision|le grand affrontement)$/i;
    const loreWarnings = events.filter((event) => {
      const visibleText = `${event.title} ${event.description}`;
      return /\b(?:les|des|aux|dans les) Blues\b/i.test(visibleText) ||
        /peintre.{0,30}avis de recherche/i.test(visibleText) ||
        vagueTitles.test(event.title.trim());
    });
    if ((window.GAME_DATA?.devilFruits || []).length < 24) {
      structuralWarnings.push("Le catalogue de Fruits du Démon doit contenir au moins vingt-quatre fruits.");
    }
    if ((window.GAME_DATA?.crewRecruitments || []).length < 24) {
      structuralWarnings.push("Le catalogue de recrutements doit contenir au moins vingt-quatre compagnons.");
    }
    if ((window.GAME_DATA?.marineRecruitments || []).length < 16) {
      structuralWarnings.push("Le catalogue Marine doit proposer au moins seize officiers ou soutiens.");
    }
    const validateUniqueCatalog = (items, label) => {
      const ids = new Set();
      (items || []).forEach((item) => {
        if (!item?.id || ids.has(item.id)) structuralWarnings.push(`${label} dupliqué ou sans identifiant : ${item?.id || "(vide)"}.`);
        ids.add(item?.id);
      });
    };
    validateUniqueCatalog(window.GAME_DATA?.devilFruits, "Fruit");
    validateUniqueCatalog(window.GAME_DATA?.crewRecruitments, "Compagnon");
    validateUniqueCatalog(window.GAME_DATA?.marineRecruitments, "Soutien Marine");
    const forbiddenCrew = /^(Monkey D\. Luffy|Roronoa Zoro|Nami|Usopp|Sanji|Tony Tony Chopper|Nico Robin|Franky|Brook|Jinbe)$/i;
    (window.GAME_DATA?.crewRecruitments || []).forEach((member) => {
      if (forbiddenCrew.test(member.name || "")) {
        structuralWarnings.push(`Membre du Chapeau de paille interdit au recrutement : ${member.name}.`);
      }
      if (!member.allowedFactions?.length) structuralWarnings.push(`Compagnon sans factions autorisées : ${member.id}.`);
    });
    (window.GAME_DATA?.marineRecruitments || []).forEach((member) => {
      if (!member.rank) structuralWarnings.push(`Soutien Marine sans grade : ${member.id}.`);
    });

    console.warn("[Blue Legacy] Audit narratif de développement", {
      total: events.length,
      twoChoices: withTwoChoices.length,
      threeChoices: withThreeChoices.length,
      importantWithTwoChoices: importantWithTwoChoices.map((event) => event.id),
      loreWarnings: loreWarnings.map((event) => event.id),
      structuralWarnings,
    });
    window.__blueLegacyStructuralWarnings = structuralWarnings;
    runBlueLegacyEventAudit();
  }

  function runBlueLegacyEventAudit() {
    const events = [...getAllEvents(), ...getBossEvents()];
    const surpriseGame = createDefaultGameState({
      id: "audit-surprises", name: "Audit", firstName: "Audit", lastName: "",
      sex: "neutral", faction: "pirate", dream: "one-piece", origin: "east-blue",
      hasD: false, traits: [], combatStyle: null, devilFruit: null,
    });
    surpriseGame.currentZoneIndex = 0;
    const surpriseSamples = [];
    const surpriseErrors = [];
    [createFruitSurpriseEvent, createRecruitmentSurpriseEvent].forEach((factory) => {
      try {
        const sample = factory(surpriseGame);
        if (sample) surpriseSamples.push(sample);
      } catch (error) {
        surpriseErrors.push(String(error?.message || error));
      }
    });
    const countBy = (selector) => events.reduce((counts, event) => {
      const values = selector(event);
      (Array.isArray(values) ? values : [values]).filter(Boolean).forEach((value) => {
        counts[value] = (counts[value] || 0) + 1;
      });
      return counts;
    }, {});
    const countSubsetBy = (predicate, selector) => events.filter(predicate).reduce((counts, event) => {
      const values = selector(event);
      (Array.isArray(values) ? values : [values]).filter(Boolean).forEach((value) => {
        counts[value] = (counts[value] || 0) + 1;
      });
      return counts;
    }, {});
    const decisivePaths = {};
    getBossEvents().forEach((event) => {
      const dreamId = event.dreamIds[0];
      if (!dreamId) return;
      decisivePaths[dreamId] ||= {};
      decisivePaths[dreamId][event.decisiveStage] ||= [];
      if (!decisivePaths[dreamId][event.decisiveStage].includes(event.title)) {
        decisivePaths[dreamId][event.decisiveStage].push(event.title);
      }
    });
    const editorialLedger = window.BLUE_LEGACY_EDITORIAL_LEDGER || {};
    const replacedIds = new Set(editorialLedger.replacedIds || []);
    const touchedIds = new Set([
      ...(editorialLedger.factoryStoryIds || []),
      ...(editorialLedger.exceptionalIds || []),
      ...(editorialLedger.advancedIds || []),
      ...(editorialLedger.decisiveIds || []),
    ]);
    const rewrittenIds = [...touchedIds].filter((id) => !replacedIds.has(id));
    const coverageZones = [
      "east-blue", "west-blue", "north-blue", "south-blue", "reverse-mountain",
      "grand-line", "red-line", "starless-sea", "wandering-archipelago",
      "tempest-isle", "shinsekai",
    ];
    const factionZoneCoverage = Object.fromEntries(
      ["pirate", "marine", "bounty-hunter", "revolutionary"].map((faction) => [
        faction,
        Object.fromEntries(coverageZones.map((zoneId) => [
          zoneId,
          events.filter((event) =>
            ["ordinary", "risk"].includes(event.eventType) &&
            event.factions.includes(faction) && event.zones.includes(zoneId)).length,
        ])),
      ]),
    );
    const decisiveConclusionContracts = Object.fromEntries(
      Object.keys(decisivePaths).map((dreamId) => {
        const endings = getBossEvents().filter((event) =>
          event.decisiveStage === 3 && event.dreamIds.includes(dreamId));
        const tiers = new Set(endings.flatMap((event) =>
          event.choices.flatMap((choice) => choice.outcomes.map((outcome) => outcome.outcomeTier))));
        return [dreamId, {
          success: tiers.has("success"),
          mixed: tiers.has("mixed"),
          failure: tiers.has("failure"),
          exactlyThreeChoices: endings.every((event) => event.choices.length === 3),
        }];
      }),
    );
    const outcomeRows = events.flatMap((event) => event.choices.flatMap((choice) =>
      choice.outcomes.map((outcome) => ({ event, choice, outcome, tier: inferOutcomeTier(outcome) }))));
    const hasMechanicalChange = (outcome) => Boolean(
      Object.keys(outcome.effects || {}).length || Object.keys(outcome.flags || {}).length ||
      outcome.removeFlags?.length || outcome.dreamProgress || outcome.ending || outcome.devilFruit ||
      outcome.crewMember || outcome.combatStyle || outcome.addTraits?.length || outcome.titles?.length,
    );
    const balanceWarnings = [];
    outcomeRows.forEach(({ event, outcome, tier }) => {
      const values = Object.values(outcome.effects || {}).map(Number).filter(Number.isFinite);
      const reference = `${event.id}/${outcome.id}`;
      if (!hasMechanicalChange(outcome)) balanceWarnings.push(`Issue sans changement : ${reference}`);
      if (["success", "exceptional_success"].includes(tier) && values.length && values.every((value) => value <= 0)) {
        balanceWarnings.push(`Issue positive uniquement négative : ${reference}`);
      }
      const normalizedPositiveImpact = Object.entries(outcome.effects || {}).reduce((sum, [stat, raw]) => {
        const value = Math.max(0, Number(raw) || 0);
        if (stat === "fortune") return sum + value / 5000;
        if (stat === "bounty") return sum + value / 50000;
        return sum + value;
      }, 0);
      const normalizedNegativeImpact = Object.values(outcome.effects || {}).reduce(
        (sum, raw) => sum + Math.max(0, -(Number(raw) || 0)), 0,
      );
      if (["failure", "severe_failure"].includes(tier) && normalizedPositiveImpact - normalizedNegativeImpact > 12) {
        balanceWarnings.push(`Gains disproportionnés sur issue négative : ${reference}`);
      }
    });
    events.filter((event) => event.choices.every((choice) => choice.outcomes.every((outcome) =>
      ["failure", "severe_failure"].includes(inferOutcomeTier(outcome))))).forEach((event) =>
      balanceWarnings.push(`Toutes les issues sont négatives : ${event.id}`));
    const tierCounts = Object.fromEntries(OUTCOME_TIER_ORDER.map((tier) => [tier,
      outcomeRows.filter((row) => row.tier === tier).length]));
    const meanEffectsByType = Object.fromEntries(
      Object.keys(EVENT_TYPE_META).map((type) => {
        const rows = outcomeRows.filter((row) => row.event.eventType === type);
        const totals = rows.map(({ outcome }) => Object.entries(outcome.effects || {}).reduce((sum, [stat, raw]) => {
          const value = Number(raw) || 0;
          if (stat === "fortune") return sum + value / 5000;
          if (stat === "bounty") return sum + value / 50000;
          return sum + value;
        }, 0));
        return [type, totals.length ? totals.reduce((sum, value) => sum + value, 0) / totals.length : 0];
      }),
    );
    const audit = {
      total: events.length,
      byFamily: countBy((event) => event.eventType),
      byResolution: countBy((event) => event.resolutionCategory),
      byFaction: countBy((event) => event.factions.length ? event.factions : ["common"]),
      byZone: countBy((event) => event.zones.length ? event.zones : ["all-zones"]),
      byDream: countBy((event) => event.dreamIds),
      decisivePaths,
      editorialClassification: {
        before: events.length,
        after: events.length,
        conserved: events.length - touchedIds.size,
        rewritten: rewrittenIds.length,
        replaced: replacedIds.size,
        removed: 0,
        replacedIds: [...replacedIds],
      },
      factionZoneCoverage,
      decisiveConclusionContracts,
      ordinaryByFaction: countSubsetBy((event) => event.eventType === "ordinary", (event) => event.factions.length ? event.factions : ["common"]),
      riskByFaction: countSubsetBy((event) => event.eventType === "risk", (event) => event.factions.length ? event.factions : ["common"]),
      riskByResolution: countSubsetBy((event) => event.eventType === "risk", (event) => event.resolutionCategory),
      callbacksByFaction: countSubsetBy(
        (event) => event.tags.includes("callback"),
        (event) => event.factions.length ? event.factions : ["common"],
      ),
      invalid: events.filter((event) =>
        !EVENT_TYPE_META[event.eventType] ||
        !["action", "social"].includes(event.resolutionCategory) ||
        !event.id || !event.choices.length).map((event) => event.id || "(sans id)"),
      structuralWarnings: window.__blueLegacyStructuralWarnings || [],
      activeLegacyFields: events.filter((event) =>
        Object.hasOwn(event, "bossEvent") ||
        Object.hasOwn(event, "dangerTheme") ||
        Object.hasOwn(event, "bossTier")
      ).map((event) => event.id),
      visibleDecisiveStepMentions: events.filter((event) =>
        [event.title, event.description, ...event.choices.map((choice) => choice.text)]
          .some((text) => /(?:étape|épreuve)\s*[123x]\s*sur\s*3/i.test(String(text || "")))
      ).map((event) => event.id),
      surpriseContracts: surpriseSamples.map((event) => ({
        id: event.id,
        type: event.eventType,
        resolutionCategory: event.resolutionCategory,
        choices: event.choices.length,
      })),
      surpriseErrors,
      balance: {
        outcomesAnalyzed: outcomeRows.length,
        tierCounts,
        meanEffectsByType,
        proportions: Object.fromEntries(Object.entries(tierCounts).map(([tier, count]) => [tier, count / Math.max(1, outcomeRows.length)])),
        warnings: balanceWarnings,
        editorialLedger: editorialLedger.balance || null,
      },
      bootErrors: window.__blueLegacyBootErrors || [],
      sources: {
        narrative: Array.isArray(window.SEA_OF_LEGENDS_EVENTS),
        decisive: Array.isArray(window.BLUE_LEGACY_DECISIVE_EVENTS),
      },
      simulations: runBlueLegacySelectionSimulations(),
    };
    console.warn("[Blue Legacy] EVENT_CATALOG_AUDIT", JSON.stringify(audit));
    if (new URLSearchParams(window.location.search).has("audit")) {
      document.documentElement.dataset.eventCatalogAudit = JSON.stringify(audit);
    }
    return audit;
  }

  function runBlueLegacySelectionSimulations() {
    const factions = ["pirate", "marine", "bounty-hunter", "revolutionary"];
    const origins = ["east-blue", "north-blue", "south-blue", "west-blue"];
    const catalog = getZoneCatalog();
    const zoneById = (id) => cloneData(catalog.find((zone) => zone.id === id));
    const dreamsByFaction = Object.fromEntries(factions.map((faction) => [
      faction,
      (window.GAME_DATA?.dreams?.[faction] || []).map((dream) => dream.id),
    ]));
    const decisiveCoverage = {};
    Object.entries(dreamsByFaction).forEach(([faction, dreamIds]) => {
      dreamIds.forEach((dreamId) => {
        decisiveCoverage[dreamId] = [1, 2, 3].map((tier) =>
          getBossEvents().filter((event) =>
            event.decisiveStage === tier && event.dreamIds.includes(dreamId) &&
            (!event.factions.length || event.factions.includes(faction))).length);
      });
    });
    const runs = factions.map((faction, factionIndex) => {
      const character = {
        id: `audit-${faction}`,
        name: `Audit ${faction}`,
        firstName: "Audit",
        lastName: faction,
        sex: "neutral",
        faction,
        dream: dreamsByFaction[faction][0],
        origin: origins[factionIndex],
        hasD: false,
        traits: [],
        combatStyle: null,
        devilFruit: null,
      };
      const game = createDefaultGameState(character);
      game.stats = normalizeStats({ health: 65, combat: 55, haki: 45, charisma: 55, intelligence: 55, bounty: 1000000, fortune: 100000, crew: 3, popularity: 50 });
      game.route = [origins[factionIndex], "reverse-mountain", "grand-line", "red-line", "tempest-isle", "shinsekai"]
        .map((id, index) => ({ ...zoneById(id), routeIndex: index, routeStage: index + 1, routeDifficulty: index + 1 }));
      game.specialZoneId = "tempest-isle";
      game.specialZoneRouteIndex = 4;
      const selected = { ordinary: 0, risk: 0, decisive: 0, action: 0, social: 0, callbacks: 0, fallback: 0, fallbackAt: [], immediateRepeats: 0, consecutiveRisks: 0 };
      let previousEventId = null;
      let previousEventType = null;
      for (let month = 1; month <= 24; month += 1) {
        game.month = month;
        game.currentZoneIndex = getZoneIndexForMonth(month);
        for (let action = 0; action < game.actionsThisMonth; action += 1) {
          game.currentAction = action;
          const event = selectNarrativeEvent(game);
          if (!event) {
            selected.fallback += 1;
            selected.fallbackAt.push({ month, zone: getCurrentZone(game)?.id || null });
            continue;
          }
          selected[event.eventType] += 1;
          selected[event.resolutionCategory] += 1;
          if (event.tags.includes("callback")) selected.callbacks += 1;
          if (event.id === previousEventId) selected.immediateRepeats += 1;
          if (event.eventType === "risk" && previousEventType === "risk") selected.consecutiveRisks += 1;
          previousEventId = event.id;
          previousEventType = event.eventType;
          game.seenEvents.push(event.id);
          game.periodEvents.push({ eventId: event.id, eventType: event.eventType });
        }
        const tier = getBossTierForFinishedMonth(month);
        if (tier) {
          const variants = getBossEvents().filter((event) =>
            event.decisiveStage === tier && event.dreamIds.includes(character.dream) &&
            (!event.factions.length || event.factions.includes(faction)));
          if (variants.length) selected.decisive += 1;
          else {
            selected.fallback += 1;
            selected.fallbackAt.push({ month, zone: getCurrentZone(game)?.id || null, decisiveTier: tier });
          }
        }
        if (month % CONFIG.logbookInterval === 0) game.periodEvents = [];
      }
      const surpriseChecks = [createFruitSurpriseEvent, createRecruitmentSurpriseEvent].map((factory) => {
        try {
          const event = factory(game);
          return event ? { type: event.eventType, choices: event.choices.length, category: event.resolutionCategory } : null;
        } catch (error) {
          return { error: String(error?.message || error) };
        }
      });
      const resumed = normalizeGame(cloneData(game));
      const saveResume = Boolean(
        resumed && resumed.month === game.month &&
        resumed.character?.faction === faction &&
        resumed.route?.length === game.route.length,
      );
      return { faction, dream: character.dream, selected, surpriseChecks, saveResume };
    });
    return { runs, decisiveCoverage };
  }

  const BALANCE_SIMULATION_STRATEGIES = Object.freeze([
    "random", "coherent", "action", "social", "prudent", "bold",
  ]);

  function chooseSimulationChoice(event, game, strategy) {
    const choices = event.choices.filter((choice) => {
      if (!choice.condition) return true;
      try { return choice.condition(createEventContext(game, event)); } catch { return false; }
    });
    if (!choices.length || strategy === "random") return Math.floor(Math.random() * Math.max(1, choices.length));
    const danger = (choice) => /risqu|audace|sans retour|danger/i.test(`${choice.hint} ${choice.choiceTag}`) ? 18 : 0;
    const potential = (choice) => Math.max(0, ...choice.outcomes.map((outcome) =>
      Object.values(outcome.effects || {}).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0)));
    const score = (choice) => {
      const fit = getEventResolutionScore(game, event, choice);
      if (strategy === "coherent") return fit;
      if (strategy === "prudent") return fit - danger(choice);
      if (strategy === "bold") return potential(choice) + danger(choice);
      if (strategy === "action") return event.resolutionCategory === "action" ? fit + 15 : fit - 8;
      if (strategy === "social") return event.resolutionCategory === "social" ? fit + 15 : fit - 8;
      return fit;
    };
    return event.choices.indexOf([...choices].sort((a, b) => score(b) - score(a))[0]);
  }

  function applySimulatedEvent(event, game, strategy) {
    const choiceIndex = chooseSimulationChoice(event, game, strategy);
    const choice = event.choices[choiceIndex] || event.choices[0];
    if (!choice) return null;
    const outcome = secureFinalDreamOutcome(selectOutcome(choice, game, event), event, game);
    const tier = outcome.resolvedOutcomeTier || outcome.outcomeTier || inferOutcomeTier(outcome);
    applyStatChanges(
      getDifficultyAdjustedEffects(getNarrativelyCoherentEffects(event, outcome), game),
      game.stats,
      {
        game,
        source: event.eventType === "decisive" ? "decisive" : "event",
        major: Boolean(event.important || outcome.important),
        routeStage: Number(getCurrentZone(game)?.routeStage) || 1,
        ignoreDiminishingReturns: Boolean(outcome.ignoreDiminishingReturns),
      },
    );
    applyChoiceFlags(outcome, game);
    applyOutcomeMajorRewards(outcome, game);
    const dreamProgress = getOutcomeDreamProgress(outcome, game);
    if (dreamProgress) game.flags.dreamProgress = (Number(game.flags.dreamProgress) || 0) + dreamProgress;
    if (tier === "severe_failure" || outcome.criticalFailure === true) {
      game.flags.criticalFailures = (Number(game.flags.criticalFailures) || 0) + 1;
    }
    markEventAsSeen(event, game);
    const record = {
      eventId: event.id, eventType: event.eventType, outcomeTier: tier,
      dreamProgress, tags: cloneData(event.tags || []), important: Boolean(event.important || outcome.important),
    };
    game.periodEvents.push(record);
    if (record.important) game.importantEvents.push(record);
    updateAchievementTelemetry(event, choice, game, outcome);
    checkCatalogTitles(game, 1);
    if (event.eventType === "decisive" && event.decisiveStage === 3) {
      game.ending = {
        type: outcome.ending?.type || "completed",
        success: ["success", "exceptional_success"].includes(tier),
        dreamCompleted: isFinalDreamSuccess(outcome, event, game),
      };
    }
    return tier;
  }

  function createSimulationRoute(origin) {
    const catalog = getZoneCatalog();
    const ids = [origin, "reverse-mountain", "grand-line", "red-line", "tempest-isle", "shinsekai"];
    return ids.map((id, index) => ({
      ...cloneData(catalog.find((zone) => zone.id === id)),
      id, routeIndex: index, routeStage: index + 1, routeDifficulty: index + 1,
    }));
  }

  function selectSimulatedNarrativeEvent(game, catalog) {
    const lastType = game.flags?.lastNarrativeEventType || game.periodEvents?.at(-1)?.eventType;
    let available = catalog.filter((event) =>
      ["ordinary", "risk"].includes(event.eventType) && isEventCompatible(event, game));
    if (lastType === "risk") {
      const ordinary = available.filter((event) => event.eventType === "ordinary");
      if (ordinary.length) available = ordinary;
    }
    const selected = selectEvent(available);
    if (selected) game.flags.lastNarrativeEventType = selected.eventType;
    return selected;
  }

  function runSingleBalanceSimulation(faction, runIndex, strategy, eventCatalog) {
    const origins = ["east-blue", "north-blue", "south-blue", "west-blue"];
    const dreams = window.GAME_DATA?.dreams?.[faction] || [];
    const character = {
      id: `balance-${faction}-${runIndex}`, name: "Simulation", firstName: "Simulation", lastName: "",
      sex: "neutral", faction, dream: dreams[runIndex % dreams.length]?.id,
      origin: origins[runIndex % origins.length], hasD: runIndex % 8 === 0,
      traits: [], combatStyle: null, devilFruit: null,
    };
    const game = createDefaultGameState(character);
    game.route = createSimulationRoute(character.origin);
    game.specialZoneId = "tempest-isle";
    game.specialZoneRouteIndex = 4;
    game.visitedZoneIds = [character.origin];
    const counts = { positive: 0, mixed: 0, negative: 0 };
    let ending = null;
    for (let month = 1; month <= CONFIG.maxMonths && !ending; month += 1) {
      game.month = month;
      game.currentZoneIndex = getZoneIndexForMonth(month);
      const zoneId = getCurrentZone(game)?.id;
      if (zoneId && !game.visitedZoneIds.includes(zoneId)) game.visitedZoneIds.push(zoneId);
      game.actionsThisMonth = getActionsForMonth(game);
      for (let action = 0; action < game.actionsThisMonth && !ending; action += 1) {
        game.currentAction = action;
        const event = selectSurpriseEvent(game) || selectSimulatedNarrativeEvent(game, eventCatalog);
        if (!event) continue;
        const tier = applySimulatedEvent(event, game, strategy);
        if (["success", "exceptional_success"].includes(tier)) counts.positive += 1;
        else if (tier === "mixed") counts.mixed += 1;
        else counts.negative += 1;
        ending = checkRunEndingConditions(game);
      }
      const decisiveStage = getBossTierForFinishedMonth(month);
      if (decisiveStage && !ending) {
        const candidates = getBossEvents().filter((event) =>
          event.decisiveStage === decisiveStage && event.dreamIds.includes(character.dream) &&
          (!event.factions.length || event.factions.includes(faction)));
        const decisive = candidates[Math.floor(Math.random() * candidates.length)];
        if (decisive) applySimulatedEvent(localizeBossEvent(decisive, getCurrentZone(game), decisiveStage), game, strategy);
        ending = checkRunEndingConditions(game);
      }
      if (month % CONFIG.logbookInterval === 0) game.periodEvents = [];
    }
    const completed = !ending && game.month >= CONFIG.maxMonths;
    game.ending = game.ending || (ending ? { ...ending, success: false, dreamCompleted: false } : {
      type: "completed", success: completed, dreamCompleted: Boolean(game.flags.bossFinalDreamCompleted),
    });
    game.isFinished = true;
    refreshPopularityScore(game);
    return {
      faction, dream: character.dream, strategy, completed, dreamCompleted: Boolean(game.ending.dreamCompleted),
      popularity: game.stats.popularity, stats: cloneData(game.stats), companions: game.crewMembers.length,
      positive: counts.positive, mixed: counts.mixed, negative: counts.negative,
      titleIds: game.runTitles.map(getDataId),
    };
  }

  function summarizeBalanceRuns(runs) {
    const sorted = runs.map((run) => run.popularity).sort((a, b) => a - b);
    const mean = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    const percentile = (ratio) => sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio))] || 0;
    const statIds = ["health", "combat", "haki", "intelligence", "charisma", "bounty", "fortune", "crew"];
    return {
      runs: runs.length,
      completionRate: mean(runs.map((run) => run.completed ? 1 : 0)),
      popularityMean: mean(sorted), median: percentile(0.5), p10: percentile(0.1), p25: percentile(0.25),
      p75: percentile(0.75), p90: percentile(0.9), p95: percentile(0.95), p99: percentile(0.99),
      under70: mean(runs.map((run) => run.popularity < 70 ? 1 : 0)),
      from70to74: mean(runs.map((run) => run.popularity >= 70 && run.popularity <= 74 ? 1 : 0)),
      from75to82: mean(runs.map((run) => run.popularity >= 75 && run.popularity <= 82 ? 1 : 0)),
      from83to89: mean(runs.map((run) => run.popularity >= 83 && run.popularity <= 89 ? 1 : 0)),
      from90to94: mean(runs.map((run) => run.popularity >= 90 && run.popularity <= 94 ? 1 : 0)),
      from95to99: mean(runs.map((run) => run.popularity >= 95 && run.popularity <= 99 ? 1 : 0)),
      exactly100: mean(runs.map((run) => run.popularity === 100 ? 1 : 0)),
      atLeast90: mean(runs.map((run) => run.popularity >= 90 ? 1 : 0)),
      atLeast95: mean(runs.map((run) => run.popularity >= 95 ? 1 : 0)),
      dreamCompletionRate: mean(runs.map((run) => run.dreamCompleted ? 1 : 0)),
      averageStats: Object.fromEntries(statIds.map((id) => [id, mean(runs.map((run) => Number(run.stats[id]) || 0))])),
      averageCompanions: mean(runs.map((run) => run.companions)),
      averagePositiveEvents: mean(runs.map((run) => run.positive)),
      averageMixedEvents: mean(runs.map((run) => run.mixed)),
      averageNegativeEvents: mean(runs.map((run) => run.negative)),
      averageNonFinalTitles: mean(runs.map((run) => run.titleIds?.length || 0)),
      titleOccurrences: Object.fromEntries(getAllTitles()
        .filter((title) => !title.finalTitle)
        .map((title) => [title.id, runs.filter((run) => run.titleIds?.includes(title.id)).length])),
    };
  }

  function runBalanceSimulation(options = {}) {
    const factions = ["pirate", "marine", "bounty-hunter", "revolutionary"];
    const runsPerFaction = Math.max(1, Number(options.runsPerFaction) || 2000);
    const seed = Number(options.seed) || 11092026;
    let currentSeed = seed >>> 0;
    const originalRandom = Math.random;
    const eventCatalog = getAllEvents();
    Math.random = () => ((currentSeed = (currentSeed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const runs = [];
    try {
      factions.forEach((faction) => {
        for (let index = 0; index < runsPerFaction; index += 1) {
          const strategy = BALANCE_SIMULATION_STRATEGIES[index % BALANCE_SIMULATION_STRATEGIES.length];
          runs.push(runSingleBalanceSimulation(faction, index, strategy, eventCatalog));
        }
      });
    } finally {
      Math.random = originalRandom;
    }
    const group = (key, value) => summarizeBalanceRuns(runs.filter((run) => run[key] === value));
    const report = {
      seed, totalRuns: runs.length, overall: summarizeBalanceRuns(runs),
      byFaction: Object.fromEntries(factions.map((faction) => [faction, group("faction", faction)])),
      byDream: Object.fromEntries(
        uniqueArray(runs.map((run) => run.dream)).map((dreamId) => [dreamId, group("dream", dreamId)]),
      ),
      byStrategy: Object.fromEntries(BALANCE_SIMULATION_STRATEGIES.map((strategy) => [strategy, group("strategy", strategy)])),
    };
    console.warn("[Blue Legacy] BALANCE_SIMULATION", report);
    return report;
  }

  function runBalanceAudit(options = {}) {
    const events = [...getAllEvents(), ...getBossEvents()];
    const eventIds = new Set(events.map((event) => event.id));
    const titleIds = new Set(getAllTitles().map((title) => title.id));
    const writtenFlags = new Set(events.flatMap((event) => event.choices.flatMap((choice) =>
      choice.outcomes.flatMap((outcome) => Object.keys(outcome.flags || {})))));
    const readFlags = new Set(events.flatMap((event) => Object.keys(event.requiredFlags || {})));
    const invalidReferences = [];
    events.forEach((event) => {
      (event.requiredEvents || []).forEach((id) => {
        if (!eventIds.has(id)) invalidReferences.push({ eventId: event.id, kind: "requiredEvent", id });
      });
      event.choices.forEach((choice) => choice.outcomes.forEach((outcome) =>
        (outcome.titles || []).map(getDataId).forEach((id) => {
          if (id && !titleIds.has(id)) invalidReferences.push({ eventId: event.id, kind: "title", id });
        })));
    });
    const accessibility = events.map((event) => {
      const faction = event.factions?.[0] || "pirate";
      const dreams = window.GAME_DATA?.dreams?.[faction] || [];
      const character = {
        name: "Audit", faction, dream: event.dreamIds?.[0] || dreams[0]?.id,
        origin: "east-blue", hasD: true, traits: cloneData(event.requiredTraits || []),
        combatStyle: event.styles?.[0] || null,
        devilFruit: { id: "audit-fruit", name: "Fruit d'audit", rarity: "legendary" },
      };
      const game = createDefaultGameState(character);
      const zoneId = event.zones?.[0] || "grand-line";
      const zone = cloneData(getZoneCatalog().find((item) => item.id === zoneId) || { id: zoneId, routeStage: 3 });
      game.route = Array.from({ length: 6 }, (_, index) => ({ ...zone, routeIndex: index, routeStage: index + 1 }));
      game.month = Math.max(1, Number(event.minMonth) || 12);
      game.currentZoneIndex = getZoneIndexForMonth(game.month);
      game.stats = normalizeStats({ health: 100, combat: 100, haki: 100, intelligence: 100,
        charisma: 100, bounty: 20000000, fortune: 1000000, crew: 10, popularity: 100 });
      game.flags = { ...game.flags, ...(event.requiredFlags || {}) };
      game.seenEvents = cloneData(event.requiredEvents || []);
      let compatible = false;
      let error = null;
      try { compatible = isEventCompatible(event, game); } catch (caught) { error = String(caught?.message || caught); }
      return { id: event.id, compatible, error };
    });
    const catalog = runCollectionCatalogAudit();
    const eventAudit = runBlueLegacyEventAudit();
    const runsPerFaction = Math.max(1, Math.floor(Number(options.runsPerFaction) || 250));
    const report = {
      generatedAt: new Date().toISOString(),
      events: {
        total: events.length,
        accessible: accessibility.filter((row) => row.compatible).length,
        inaccessible: accessibility.filter((row) => !row.compatible),
        invalidReferences,
        callbacksBroken: invalidReferences.filter((row) => row.kind === "requiredEvent"),
        editorialWarnings: eventAudit.balance?.warnings || [],
        rarityCounts: events.reduce((counts, event) => {
          counts[event.rarity] = (counts[event.rarity] || 0) + 1; return counts;
        }, {}),
      },
      titles: {
        total: catalog.titles.count,
        obtainable: catalog.titles.conditionRows.filter((row) => row.positive).length +
          catalog.titles.eventSourceRows.filter((row) => row.eventSource).length,
        potentiallyImpossible: [
          ...catalog.titles.conditionRows.filter((row) => !row.positive),
          ...catalog.titles.eventSourceRows.filter((row) => !row.eventSource),
        ],
      },
      achievements: {
        total: catalog.achievements.count,
        obtainable: catalog.achievements.rows.filter((row) => row.positive).length,
        impossible: catalog.achievements.rows.filter((row) => !row.positive),
      },
      companions: {
        total: (window.GAME_DATA?.crewRecruitments?.length || 0) + (window.GAME_DATA?.marineRecruitments?.length || 0),
        regular: window.GAME_DATA?.crewRecruitments?.length || 0,
        marine: window.GAME_DATA?.marineRecruitments?.length || 0,
      },
      devilFruits: { total: window.GAME_DATA?.devilFruits?.length || 0 },
      dreams: { total: Object.values(window.GAME_DATA?.dreams || {}).flat().length },
      flags: {
        written: writtenFlags.size, read: readFlags.size,
        readButNeverWrittenInCatalog: [...readFlags].filter((id) => !writtenFlags.has(id)),
        writtenButNeverReadByEvent: [...writtenFlags].filter((id) => !readFlags.has(id)),
      },
      simulations: runBalanceSimulation({ runsPerFaction, seed: options.seed || 16082026 }),
    };
    report.pass = !report.events.inaccessible.length && !invalidReferences.length &&
      !report.titles.potentiallyImpossible.length && !report.achievements.impossible.length;
    console.warn("[Blue Legacy] BALANCE_AUDIT", report);
    return report;
  }

  function validateStatisticsInDevelopment() {
    if (!["localhost", "127.0.0.1"].includes(window.location.hostname) &&
        !new URLSearchParams(window.location.search).has("audit")) return;

    const warnings = [];
    const allowedStats = new Set(Object.keys(STATS));
    const obsoleteStats = new Set(OBSOLETE_STAT_IDS);
    const inspectStatMap = (map, source) => {
      Object.entries(map || {}).forEach(([statId, value]) => {
        if (obsoleteStats.has(statId) || !allowedStats.has(statId)) {
          warnings.push(`${source} utilise la statistique inconnue "${statId}".`);
        }
        if (!Number.isFinite(Number(value))) {
          warnings.push(`${source} contient une valeur non numérique pour "${statId}".`);
        }
        if (statId === "crew" && !Number.isInteger(Number(value))) {
          warnings.push(`${source} utilise une variation d’Équipage non entière.`);
        }
      });
    };

    getAllEvents().forEach((event) => {
      inspectStatMap(event.minimumStats, `${event.id}/minimumStats`);
      inspectStatMap(event.maximumStats, `${event.id}/maximumStats`);
      event.choices.forEach((choice) => choice.outcomes.forEach((outcome) => {
        inspectStatMap(outcome.effects, `${event.id}/${outcome.id}/effects`);
        inspectStatMap(outcome.minimumStats, `${event.id}/${outcome.id}/minimumStats`);
        inspectStatMap(outcome.maximumStats, `${event.id}/${outcome.id}/maximumStats`);
      }));
    });

    const sample = clampStats({
      ...createDefaultStats(),
      health: 200,
      combat: -4,
      popularity: 500,
      bounty: -1,
      fortune: -1,
      crew: -1.5,
    });
    Object.entries(sample).forEach(([statId, value]) => {
      if (!Number.isFinite(value)) warnings.push(`${statId} produit NaN.`);
      if (CORE_STAT_IDS.includes(statId) &&
          (value < CORE_STAT_MIN || value > CORE_STAT_MAX)) {
        warnings.push(`${statId} sort des bornes 1–100.`);
      }
      if (NON_NEGATIVE_STAT_IDS.includes(statId) && value < 0) {
        warnings.push(`${statId} devient négatif.`);
      }
    });

    if (warnings.length) {
      console.warn("[Blue Legacy] Audit des statistiques", warnings);
    }
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeApplication,
      {
        once: true,
      },
    );
  } else {
    initializeApplication();
  }
})();
