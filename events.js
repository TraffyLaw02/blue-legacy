/* ==========================================================
   BLUE LEGACY — EVENTS.JS
   Version 1.1

   Ce fichier contient uniquement les événements narratifs.

   Organisation actuelle :
   1. Outils de création des événements
   2. Événements communs
   3. Événements propres aux différentes voies
   4. Événements propres aux quatre Blues
   5. Événements rares et très rares
   6. Événements de suivi et conséquences
   7. Regroupement final transmis à app.js
========================================================== */

(() => {
  "use strict";

  const IS_DEVELOPMENT = ["localhost", "127.0.0.1"].includes(
    window.location.hostname,
  );

  /* ========================================================
     1. CONSTANTES
  ======================================================== */

  const STARTING_BLUES = Object.freeze([
    "east-blue",
    "west-blue",
    "north-blue",
    "south-blue",
  ]);

  const PATHS = Object.freeze({
    PIRATE: "pirate",
    BOUNTY_HUNTER: "bounty-hunter",
    REVOLUTIONARY: "revolutionary",
    MARINE: "marine",
  });

  const EVENT_RARITY = Object.freeze({
    COMMON: "common",
    UNCOMMON: "uncommon",
    RARE: "rare",
    VERY_RARE: "veryRare",
  });

  const EVENT_TYPES = Object.freeze({
    ORDINARY: "ordinary",
    RISK: "risk",
    DECISIVE: "decisive",
    LEGENDARY: "legendary",
    SURPRISE_FRUIT: "surprise-fruit",
    SURPRISE_RECRUIT: "surprise-recruit",
  });

  const ACTION_CONTEXT = /combat|attaque|assaut|bataille|guerre|war|danger|survie|survival|sauvetage|rescue|libération|liberation|chasse|hunt|haki|fluide|défense|navigation|tempête|blocus/i;

  function inferResolutionCategory(event = {}) {
    if (["action", "social"].includes(event.resolutionCategory)) {
      return event.resolutionCategory;
    }
    const context = `${event.category || ""} ${(event.tags || []).join(" ")} ${event.title || ""} ${event.description || ""}`;
    return ACTION_CONTEXT.test(context) ? "action" : "social";
  }

  function inferEventType(event = {}) {
    if (Object.values(EVENT_TYPES).includes(event.eventType)) return event.eventType;
    if (event.bossEvent) return EVENT_TYPES.DECISIVE;
    if (event.dangerTheme) return EVENT_TYPES.RISK;
    return EVENT_TYPES.ORDINARY;
  }

  const RARITY_WEIGHTS = Object.freeze({
    common: 18,
    uncommon: 10,
    rare: 4,
    veryRare: 1,
  });

  /*
   * Les choix les plus risqués disposent de variantes écrites à la main.
   * Les seuils restent volontairement invisibles dans l'interface.
   */
  const EVENT_OUTCOME_OVERRIDES = Object.freeze({
    "open-carefully": [
      {
        id: "clean-find",
        result: "Tu démontes patiemment le couvercle et récupères des outils encore utilisables.",
        effects: { fortune: 12000, ship: 1 },
        minimumStats: { ship: 1 },
        flags: { foundFloatingTools: true },
        weight: 3,
      },
      {
        id: "salt-water",
        fallback: true,
        result: "Le couvercle cède trop vite : une vague remplit la caisse et ruine presque tout son contenu.",
        effects: { morale: -2 },
        maximumStats: { ship: 0 },
        weight: 2,
      },
      {
        id: "stubborn-gull",
        result: "Le goéland défend son bien avec une férocité absurde. Tu sauves quelques pièces, mais pas ta dignité.",
        effects: { health: -2, fortune: 4000 },
        weight: 2,
      },
    ],
    "trust-fisherman": [
      {
        id: "harbor-saved",
        result: "L’orage frappe comme annoncé. Ton calme aide le port à renforcer ses amarres à temps.",
        effects: { fortune: -4000, popularity: 4, morale: 3 },
        minimumStats: { morale: 55 },
        flags: { trustedStormFisherman: true, helpedStormHarbor: true },
        important: true,
        weight: 3,
      },
      {
        id: "partial-warning",
        fallback: true,
        result: "Seule une partie du port t’écoute. Plusieurs bateaux sont sauvés, d’autres subissent la tempête.",
        effects: { fortune: -5000, ship: -1, popularity: 1 },
        flags: { trustedStormFisherman: true },
        weight: 3,
      },
      {
        id: "false-alarm",
        result: "L’orage contourne finalement l’île. Les taverniers se moquent de toi, mais le pêcheur reste convaincu.",
        effects: { popularity: -2, morale: -1 },
        chance: 0.18,
        weight: 1,
      },
    ],
    "free-dog": [
      {
        id: "earned-trust",
        result: "Tu approches sans geste brusque. Une fois libéré, le chien accepte de te suivre jusqu’au rivage.",
        effects: { health: -1, morale: 4, popularity: 2 },
        minimumStats: { morale: 55 },
        flags: { rescuedDockDog: true },
        titles: ["ami-des-betes"],
        important: true,
        weight: 3,
      },
      {
        id: "painful-rescue",
        result: "Le chien panique et te mord profondément avant de fuir. La corde est coupée, mais il ne te fait pas confiance.",
        effects: { health: -7, morale: -2 },
        maximumStats: { health: 70 },
        flags: { freedDockDog: true },
        important: true,
        weight: 2,
      },
      {
        id: "quiet-compassion",
        result: "Ta patience finit par calmer l’animal. Ce geste confirme une compassion déjà montrée ailleurs.",
        effects: { morale: 3 },
        requiredFlags: { clinicVolunteer: true },
        addTraits: ["compatissant"],
        flags: { rescuedDockDog: true },
        important: true,
        weight: 2,
      },
      {
        id: "cautious-rescue",
        result: "Tu coupes la corde à distance. Le chien reste méfiant, mais sa patte est libre.",
        effects: { morale: 2 },
        flags: { freedDockDog: true },
        fallback: true,
        important: true,
        weight: 3,
      },
    ],
    "study-map": [
      {
        id: "read-the-waves",
        result: "Tu distingues la logique cachée sous les taches de soupe et évites les récifs.",
        effects: { ship: 2 },
        minimumStats: { ship: 2 },
        flags: { learnedWaveReading: true },
        weight: 3,
      },
      {
        id: "misread-current",
        fallback: true,
        result: "Une tache de graisse ressemble trop à une île. Tu corriges la route après une mauvaise frayeur.",
        effects: { ship: -1, morale: -1 },
        maximumStats: { ship: 1 },
        weight: 2,
      },
      {
        id: "navigator-instinct",
        result: "Les indications réveillent un véritable instinct de navigation que tes voyages avaient déjà préparé.",
        effects: { ship: 1 },
        requiredFlags: { trustedStormFisherman: true },
        minimumStats: { ship: 3 },
        combatStyle: "navigateur",
        flags: { learnedWaveReading: true },
        weight: 1,
      },
    ],
    "help-patients": [
      {
        id: "steady-hands",
        result: "Tu suis le manuel avec méthode et stabilises les blessés jusqu’au retour du médecin.",
        effects: { morale: 3, popularity: 3 },
        minimumStats: { morale: 55 },
        flags: { clinicVolunteer: true },
        weight: 3,
      },
      {
        id: "overwhelmed",
        result: "Le nombre de blessés te dépasse. Tu aides comme tu peux, mais une erreur te hante après ton départ.",
        effects: { morale: -4 },
        maximumStats: { morale: 40 },
        flags: { clinicVolunteer: true },
        weight: 2,
      },
      {
        id: "field-medic",
        result: "Tes expériences précédentes te permettent d’agir avec une précision inattendue.",
        effects: { health: 3 },
        requiredTraits: ["calme"],
        requiredFlags: { rescuedDockDog: true },
        combatStyle: "medecin",
        flags: { clinicVolunteer: true },
        weight: 1,
      },
      {
        id: "imperfect-help",
        result: "Tu appliques le manuel avec hésitation. Ton aide reste modeste, mais elle soulage l’assistant.",
        effects: { morale: 1 },
        flags: { clinicVolunteer: true },
        fallback: true,
        weight: 3,
      },
    ],
    "pull-sword": [
      {
        id: "clean-draw",
        result: "Le sabre sort d’un coup sec. La foule se tait avant d’exploser en applaudissements.",
        effects: { combat: 2, popularity: 2 },
        minimumStats: { combat: 18 },
        flags: { ownsRustySword: true },
        weight: 3,
      },
      {
        id: "barrel-wins",
        fallback: true,
        result: "Le tonneau refuse de céder et tu termines dans l’étal de melons sous les rires.",
        effects: { health: -4, popularity: -1 },
        maximumStats: { combat: 14 },
        weight: 2,
      },
      {
        id: "stubborn-training",
        result: "Tu échoues plusieurs fois, puis ajustes enfin ta prise. Ta ténacité commence à devenir une habitude.",
        effects: { health: -2, combat: 1 },
        requiredFlags: { trainedWithBellSniper: true },
        addTraits: ["tenace"],
        flags: { ownsRustySword: true },
        weight: 2,
      },
    ],
    "sing-song": [
      {
        id: "dockside-hit",
        result: "Le refrain se répand sur les quais avant même ton départ.",
        effects: { morale: 4, popularity: 3 },
        minimumStats: { morale: 55 },
        flags: { bottleSong: true },
        weight: 3,
      },
      {
        id: "merciful-silence",
        result: "Après le premier couplet, même les mouettes quittent le quai.",
        effects: { popularity: -2, morale: 1 },
        maximumStats: { morale: 40 },
        flags: { bottleSong: true },
        weight: 2,
      },
      {
        id: "born-performer",
        result: "Tu transformes les paroles absurdes en chanson que tout le monde veut reprendre.",
        effects: { morale: 3, popularity: 4 },
        requiredTraits: ["charismatique"],
        requiredFlags: { keptBottleLyrics: true },
        combatStyle: "musicien",
        flags: { bottleSong: true },
        weight: 1,
      },
      {
        id: "rough-chorus",
        result: "La mélodie hésite, puis quelques dockers finissent par battre la mesure.",
        effects: { morale: 2, popularity: 1 },
        flags: { bottleSong: true },
        fallback: true,
        weight: 3,
      },
    ],
    "learn-shooting": [
      {
        id: "useful-lesson",
        result: "Après plusieurs essais, ta respiration et ta visée deviennent plus régulières.",
        effects: { combat: 2 },
        minimumStats: { combat: 15 },
        flags: { trainedWithBellSniper: true },
        weight: 3,
      },
      {
        id: "broken-sign",
        fallback: true,
        result: "Ton tir manque la cible et détruit l’enseigne d’un marchand particulièrement rancunier.",
        effects: { fortune: -6000, popularity: -1 },
        maximumStats: { combat: 14 },
        flags: { trainedWithBellSniper: true },
        weight: 2,
      },
      {
        id: "sniper-discipline",
        result: "Ta patience transforme l’exercice en véritable spécialisation.",
        effects: { combat: 2 },
        requiredTraits: ["patient"],
        minimumStats: { combat: 22 },
        combatStyle: "sniper",
        flags: { trainedWithBellSniper: true },
        weight: 1,
      },
    ],
    "enter-tournament": [
      {
        id: "finalist",
        result: "Tu atteins la finale et quittes l’arène couvert de sable, mais respecté.",
        effects: { combat: 3, health: -3, popularity: 4 },
        minimumStats: { combat: 20, health: 55 },
        weight: 3,
      },
      {
        id: "early-defeat",
        result: "Ton premier adversaire te projette hors du cercle avant que tu comprennes sa prise.",
        effects: { health: -6, morale: -3 },
        maximumStats: { combat: 15 },
        weight: 2,
      },
      {
        id: "hard-earned-style",
        result: "Tes entraînements antérieurs s’assemblent enfin en une manière de combattre qui t’appartient.",
        effects: { combat: 2, health: -2 },
        requiredTraits: ["tenace"],
        minimumStats: { combat: 25 },
        combatStyle: "corps-a-corps",
        weight: 1,
      },
      {
        id: "sand-and-skewers",
        result: "Tu gagnes un combat, en perds un autre et repars avec les deux brochettes promises.",
        effects: { health: -3, morale: 2 },
        fallback: true,
        weight: 3,
      },
    ],
    "repair-crab": [
      {
        id: "successful-repair",
        result: "Le mécanisme repart. Le crabe marche droit trois secondes avant de choisir de nouveau le côté.",
        effects: { ship: 2 },
        minimumStats: { ship: 2 },
        flags: { repairedClockworkCrab: true },
        weight: 3,
      },
      {
        id: "spring-explosion",
        fallback: true,
        result: "Un ressort traverse ton sac et le crabe disparaît sous une planche.",
        effects: { fortune: -5000, morale: -1 },
        maximumStats: { ship: 1 },
        weight: 2,
      },
      {
        id: "inventive-breakthrough",
        result: "Les pièces révèlent une logique que seules tes expériences précédentes te permettent de comprendre.",
        effects: { ship: 2 },
        requiredTraits: ["curieux"],
        requiredFlags: { foundAbandonedWorkshop: true },
        combatStyle: "inventeur",
        flags: { repairedClockworkCrab: true },
        weight: 1,
      },
    ],
  });


  /* ========================================================
     2. OUTILS DE CRÉATION
  ======================================================== */

  /**
   * Crée un choix d’événement avec toutes les propriétés
   * reconnues par le moteur.
   */
  function limitOrdinaryEffects(effects = {}) {
    const entries = Object.entries(effects);
    if (entries.length <= 2) return { ...effects };

    const negative = entries.find(([, value]) => Number(value) < 0);
    const positive = entries.find(([, value]) => Number(value) > 0);
    const selected = negative && positive
      ? [positive, negative]
      : entries.slice(0, 2);

    return Object.fromEntries(selected);
  }

  function createChoice(choice) {
    const configuredOutcomes =
      EVENT_OUTCOME_OVERRIDES[choice.id] ||
      choice.outcomes ||
      choice.results ||
      choice.possibleOutcomes;

    const fallbackOutcome = {
      id: "default",
      result: choice.result,
      effects: limitOrdinaryEffects(choice.effects),
      flags: choice.flags || {},
      removeFlags: choice.removeFlags || [],
      dreamProgress: choice.dreamProgress || 0,
      important: Boolean(choice.important),
      ending: choice.ending || null,
    };

    /*
     * Les anciens champs de récompense restent dans les définitions historiques
     * pour faciliter leur relecture, mais ne sont plus accordés implicitement.
     * Une récompense majeure doit désormais figurer dans une issue explicite.
     */
    return {
      id: choice.id,
      text: choice.text,
      choiceTag: choice.choiceTag || choice.tag || "",
      hint: choice.hint || choice.riskLabel || choice.visibleHint || "",
      resolutionWeights: choice.resolutionWeights || null,
      condition: choice.condition || null,
      outcomes: (configuredOutcomes || [fallbackOutcome]).map((outcome) => ({
        weight: 1,
        chance: 1,
        ...outcome,
      })),
    };
  }


  /**
   * Crée un événement complet.
   *
   * Les valeurs par défaut permettent d’éviter de répéter
   * les mêmes propriétés dans chaque événement.
   */
  function convertLegacyStatMap(values = {}, context = "", mode = "effects") {
    const converted = {};
    const text = String(context).toLowerCase();
    const cognitive =
      /carte|route|courant|navigation|log pose|archive|indice|enqu|plan|strat|code|document|lecture|obser|comprendre|myst|sabot/.test(text);
    const leadership =
      /équipage|alliance|discours|négoci|command|foule|recrut|confiance|intimid|rallier|cellule|officier/.test(text);
    const add = (key, value) => {
      converted[key] = (Number(converted[key]) || 0) + Number(value);
    };

    Object.entries(values || {}).forEach(([key, rawValue]) => {
      const value = Number(rawValue);
      if (!Number.isFinite(value)) return;

      if (key === "morale") {
        add(cognitive && !leadership ? "intelligence" : "charisma", value);
        return;
      }

      if (key === "ship") {
        if (mode === "requirements") {
          add("intelligence", 10 + Math.max(0, value) * 5);
        } else if (value < 0) {
          add("fortune", value * 4000);
        } else if (leadership && !cognitive) {
          add("charisma", value * 2);
        } else {
          add("intelligence", value * 2);
        }
        return;
      }

      if (!["reputation", "score"].includes(key)) {
        add(key, value);
      } else {
        add("popularity", value);
      }
    });

    return converted;
  }

  function convertLegacyChoiceStats(choice, eventContext) {
    const choiceContext = `${eventContext} ${choice.text || ""}`;
    return {
      ...choice,
      outcomes: (choice.outcomes || []).map((outcome) => {
        const outcomeContext =
          `${choiceContext} ${outcome.result || ""}`;
        return {
          ...outcome,
          effects: convertLegacyStatMap(
            outcome.effects,
            outcomeContext,
            "effects",
          ),
          minimumStats: convertLegacyStatMap(
            outcome.minimumStats,
            outcomeContext,
            "requirements",
          ),
          maximumStats: convertLegacyStatMap(
            outcome.maximumStats,
            outcomeContext,
            "requirements",
          ),
        };
      }),
    };
  }

  const BALANCE_LEDGER = {
    outcomesAnalyzed: 0,
    outcomesCorrected: 0,
    emptyOutcomesBefore: 0,
    statisticCoherenceCorrections: 0,
  };

  function classifyEditorialOutcome(outcome = {}) {
    if (["exceptional_success", "success", "mixed", "failure", "severe_failure"].includes(outcome.outcomeTier)) {
      return outcome.outcomeTier;
    }
    if (!outcome.fallback) return "success";
    const values = Object.values(outcome.effects || {}).map(Number);
    return values.some((value) => value < 0) ? "failure" : "mixed";
  }

  function balanceOutcome(outcome, event, choice) {
    BALANCE_LEDGER.outcomesAnalyzed += 1;
    const before = JSON.stringify(outcome.effects || {});
    const effects = { ...(outcome.effects || {}) };
    const tier = classifyEditorialOutcome(outcome);
    const narrative = `${event.title || ""} ${event.description || ""} ${outcome.result || ""}`;
    const physicalContext = /bless|coup|chute|brûl|poison|impact|explosion|tir|feu|tempête|foudre|attaque|combat|assaut|noy|écras|fatigue|épuis/i;
    if (event.resolutionCategory === "social" && Number(effects.health) < 0 && !physicalContext.test(narrative)) {
      effects.charisma = Math.min(-1, Number(effects.charisma) || Number(effects.health));
      delete effects.health;
      BALANCE_LEDGER.statisticCoherenceCorrections += 1;
    }
    const hasMajorChange = Boolean(
      outcome.ending || outcome.devilFruit || outcome.crewMember || outcome.combatStyle ||
      outcome.dreamProgress || outcome.callback || outcome.relationship ||
      outcome.addTraits?.length || outcome.titles?.length,
    );
    if (!Object.keys(effects).length && !hasMajorChange) BALANCE_LEDGER.emptyOutcomesBefore += 1;

    const coreCap = event.eventType === "ordinary" ? 4 : event.eventType === "risk" ? 5 : 9;
    Object.entries(effects).forEach(([stat, raw]) => {
      const value = Number(raw);
      if (!Number.isFinite(value)) return;
      if (["health", "combat", "haki", "intelligence", "charisma"].includes(stat)) {
        const negativeCap = event.eventType === "ordinary"
          ? tier === "severe_failure" ? -4 : tier === "failure" ? -2 : -1
          : -coreCap;
        effects[stat] = Math.max(negativeCap, Math.min(coreCap, value));
      } else if (stat === "crew") {
        effects[stat] = Math.max(event.eventType === "ordinary" ? -1 : -2, Math.min(2, value));
      } else if (stat === "fortune" && event.eventType === "ordinary") {
        effects[stat] = Math.max(-12000, Math.min(18000, value));
      }
    });

    if (JSON.stringify(effects) !== before) BALANCE_LEDGER.outcomesCorrected += 1;
    return { ...outcome, outcomeTier: tier, effects };
  }

  function balanceEventOutcomes(event) {
    return {
      ...event,
      choices: event.choices.map((choice) => ({
        ...choice,
        outcomes: choice.outcomes.map((outcome) => balanceOutcome(outcome, event, choice)),
      })),
    };
  }

  function createEvent(event) {
    const rarity = event.rarity || EVENT_RARITY.COMMON;
    const eventType = inferEventType(event);
    const resolutionCategory = inferResolutionCategory(event);
    const eventContext =
      `${event.title || ""} ${event.description || ""} ${(event.tags || []).join(" ")}`;

    const balancedEvent = {
      id: event.id,
      title: event.title,

      description: event.description,
      text: event.description,

      category: event.category || "narrative",
      tags: event.tags || [],
      eventType,
      resolutionCategory,

      rarity,
      weight: event.weight ?? RARITY_WEIGHTS[rarity],

      paths: event.paths || [],
      zones: event.zones || STARTING_BLUES,

      zoneTypes: event.zoneTypes || [],
      zoneTags: event.zoneTags || [],

      minMonth: event.minMonth ?? 1,
      maxMonth: event.maxMonth ?? 4,
      months: event.months || [],

      unique: event.unique !== false,
      important: Boolean(event.important),
      highStakes: Boolean(event.highStakes),
      decisiveStage: Number(event.decisiveStage || event.bossTier) || null,
      dreamIds: event.dreamIds || [],
      loreCharacters: event.loreCharacters || [],
      decisiveKind: event.decisiveKind || event.bossType || "",
      intro: event.intro || "",
      introDialogue: event.introDialogue || null,

      requiresD: event.requiresD ?? null,
      requiresFruit: event.requiresFruit ?? null,

      fruitIds: event.fruitIds || [],

      requiredStats: convertLegacyStatMap(
        event.requiredStats,
        eventContext,
        "requirements",
      ),
      minimumStats: convertLegacyStatMap(
        event.minimumStats,
        eventContext,
        "requirements",
      ),
      maximumStats: convertLegacyStatMap(
        event.maximumStats,
        eventContext,
        "requirements",
      ),

      requiredFlags: event.requiredFlags || {},
      forbiddenFlags: event.forbiddenFlags || [],

      requiredEvents: event.requiredEvents || [],
      forbiddenEvents: event.forbiddenEvents || [],

      requiredTraits: event.requiredTraits || [],
      forbiddenTraits: event.forbiddenTraits || [],

      requiredCombatStyles: event.requiredCombatStyles || [],
      forbiddenCombatStyles: event.forbiddenCombatStyles || [],

      condition: event.condition || null,

      choices: (event.choices || [])
        .map(createChoice)
        .map((choice, choiceIndex) => ({
          ...choice,
          resolutionWeights: choice.resolutionWeights || (
            resolutionCategory === "action"
              ? [
                  { health: 0.15, combat: 0.60, haki: 0.25 },
                  { health: 0.20, combat: 0.25, haki: 0.55 },
                  { health: 0.55, combat: 0.25, haki: 0.20 },
                ][choiceIndex] || { health: 0.25, combat: 0.45, haki: 0.30 }
              : [
                  { charisma: 0.60, intelligence: 0.25, renown: 0.15 },
                  { charisma: 0.20, intelligence: 0.60, renown: 0.20 },
                  { charisma: 0.20, intelligence: 0.25, renown: 0.55 },
                ][choiceIndex] || { charisma: 0.40, intelligence: 0.40, renown: 0.20 }
          ),
        }))
        .map((choice) => convertLegacyChoiceStats(choice, eventContext)),
    };
    return balanceEventOutcomes(balancedEvent);
  }

  /*
   * Fabrique éditoriale des packs de voie concentrés sur les Blues et
   * Reverse Mountain. Elle produit des événements ordinaires du moteur :
   * aucune règle de sélection ou de résolution parallèle n'est introduite.
   */
  /*
   * REPÈRES DE LORE
   * L'aventure se déroule après Marineford et après l'abolition du système
   * des Grands Corsaires, sans se fixer à une semaine précise du récit canon.
   * Les grandes batailles du manga appartiennent donc au passé ou au contexte.
   * Les personnages non canoniques restent anonymes. Les anciens noms présents
   * dans certains flags sont conservés uniquement pour la compatibilité des sauvegardes.
   */

  const STORY_RELATION_FLAGS = Object.freeze({
    "rival-feast": { trusted: "sparedAlbaRival", failed: "humiliatedAlbaRival" },
    "west-blue-corrupt-base": { trusted: "reportedCommanderSoria", failed: "angeredCommanderSoria" },
    "reverse-rival-race": { trusted: "sharedContractWithJasko", failed: "defeatedByJaskoRival" },
    "north-blue-frozen-cell": { trusted: "trustedAgentCendre", failed: "suspectedAgentCendreSpy" },
  });

  function describeNarrativeEffects(effects = {}) {
    return "";
  }

  function contextualResult(title, action, development, effects = {}) {
    return String(development || "").trim();
  }

  function createFactionStory(path, prefix, index, story) {
    const [slug, title, description, firstChoice, secondChoice, zone = "blues"] = story;
    const physicalContext = /combat|attaqu|affront|assaut|embuscade|tir|explos|tempête|orage|courant|chute|poursu|captur|briser|forcer|défendre|sauver|bless|danger|navire|flotte|arme|duel/i
      .test(`${description} ${firstChoice}`);
    const isRisk = [
      "reverse-marine-ambush",
      "reverse-civilian-convoy",
      "reverse-exceptional-bounty",
      "reverse-government-chains",
    ].includes(slug);
    const resolutionCategory = physicalContext ? "action" : "social";
    const actionStats = ["health", "combat", "haki"];
    const socialStats = ["charisma", "intelligence", "bounty"];
    const positiveStat = (physicalContext ? actionStats : socialStats)[index % 3];
    const riskStat = physicalContext ? "health" : index % 2 ? "charisma" : "bounty";
    const eventId = `${prefix}-${slug}`;
    const relation = STORY_RELATION_FLAGS[slug];
    const directEffects = index >= 22
        ? { [positiveStat]: positiveStat === "bounty" ? 70000 : 2, popularity: 3 }
        : { [positiveStat]: positiveStat === "bounty" ? 40000 : 2 };
    const directSetbackEffects = { [riskStat]: riskStat === "bounty" ? -40000 : physicalContext ? -5 : -2 };
    const subtleEffects = physicalContext ? { haki: 2 } : { intelligence: 2 };
    const subtleFallbackEffects = physicalContext ? { haki: 1 } : { intelligence: 1 };
    const flagBase = `${prefix}${slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")}`;

    const rarity =
      index < 12 ? EVENT_RARITY.COMMON :
      index < 18 ? EVENT_RARITY.UNCOMMON :
      index < 22 ? EVENT_RARITY.RARE :
      EVENT_RARITY.VERY_RARE;

    return createEvent({
      id: eventId,
      title,
      description,
      category: prefix,
      tags: [prefix, zone === "reverse" ? "reverse-mountain" : "blue-sea"],
      eventType: isRisk ? EVENT_TYPES.RISK : EVENT_TYPES.ORDINARY,
      resolutionCategory,
      paths: [path],
      zones: zone === "reverse"
        ? ["reverse-mountain"]
        : STARTING_BLUES.includes(zone)
          ? [zone]
          : STARTING_BLUES,
      rarity,
      weight: RARITY_WEIGHTS[rarity],
      important: index >= 22,
      highStakes: index >= 22,
      minMonth: zone === "reverse" ? 5 : 1,
      maxMonth: zone === "reverse" ? 24 : 12,
      choices: [
        createChoice({
          id: `${eventId}-direct`,
          text: firstChoice,
          choiceTag: index >= 22 ? "Sans retour" : index >= 18 ? "Audace" : "",
          resolutionWeights: physicalContext
            ? { health: 0.2, combat: 0.55, haki: 0.25 }
            : { charisma: 0.45, intelligence: 0.2, renown: 0.35 },
          outcomes: [
            {
              id: `${eventId}-direct-success`,
              result: contextualResult(
                    title,
                    firstChoice,
                    physicalContext
                      ? "La manœuvre atteint son objectif avant que l'opposition puisse se réorganiser."
                      : "Les personnes impliquées acceptent ta décision et modifient leur position.",
                    directEffects,
                  ),
              effects: directEffects,
              flags: {
                [`${flagBase}DirectlyResolved`]: true,
                ...(relation ? { [relation.trusted]: true } : {}),
              },
              weight: 3,
            },
            {
              id: `${eventId}-direct-setback`,
              result: contextualResult(
                title,
                firstChoice,
                physicalContext
                  ? "L'opposition brise la manœuvre et te force à couvrir une retraite difficile."
                  : "La discussion se referme sans accord et affaiblit ta position auprès des témoins.",
                directSetbackEffects,
              ),
              effects: directSetbackEffects,
              flags: {
                [`${flagBase}DirectlyAttempted`]: true,
                ...(relation ? { [relation.failed]: true } : {}),
              },
              fallback: true,
              weight: 2,
            },
          ],
        }),
        createChoice({
          id: `${eventId}-subtle`,
          text: secondChoice,
          choiceTag: index >= 22 ? "Prudence" : index >= 18 ? "Intuition" : "",
          resolutionWeights: physicalContext
            ? { health: 0.15, combat: 0.2, haki: 0.65 }
            : { charisma: 0.2, intelligence: 0.65, renown: 0.15 },
          outcomes: [
            {
              id: `${eventId}-subtle-success`,
              result: contextualResult(
                title,
                secondChoice,
                "Un détail négligé révèle la faille de la situation. Tu l'exploites avant d'être remarqué.",
                subtleEffects,
              ),
              effects: subtleEffects,
              requiredTraits: index % 2 ? ["prudent"] : ["rusé"],
              flags: { [`${flagBase}SubtlyResolved`]: true },
              weight: 2,
            },
            {
              id: `${eventId}-subtle-fallback`,
              result: contextualResult(
                title,
                secondChoice,
                "La piste se referme avant de livrer la preuve espérée. Tes observations permettent seulement d'éviter une seconde erreur.",
                subtleFallbackEffects,
              ),
              effects: subtleFallbackEffects,
              flags: { [`${flagBase}Observed`]: true },
              fallback: true,
              weight: 3,
            },
          ],
        }),
      ],
    });
  }

  /*
   * Fabrique commune au pack Paradise. Chaque entrée conserve ses textes,
   * ses conséquences et ses personnages propres, tandis que cette fonction
   * garantit deux issues stables par choix et un fallback systématique.
   */
  function createGrandLineFactionEvent(config) {
    return createEvent({
      id: config.id,
      title: config.title,
      description: config.description,
      category: config.category || "grand-line",
      tags: ["grand-line", config.path, ...(config.tags || [])],
      paths: [config.path],
      zones: config.zones || ["grand-line"],
      rarity: config.rarity,
      weight: RARITY_WEIGHTS[config.rarity],
      minMonth: config.minMonth ?? 9,
      maxMonth: config.maxMonth ?? 20,
      important: Boolean(config.important),
      dangerTheme: Boolean(config.dangerTheme),
      requiredFlags: config.requiredFlags || {},
      forbiddenFlags: config.forbiddenFlags || [],
      choices: config.choices.map((choice) => ({
        id: `${config.id}-${choice.id}`,
        text: choice.text,
        choiceTag: choice.choiceTag || "",
        outcomes: [
          {
            id: `${config.id}-${choice.id}-${choice.success.id || "success"}`,
            weight: 3,
            ...choice.success,
          },
          {
            id: `${config.id}-${choice.id}-${choice.setback.id || "setback"}`,
            weight: 2,
            fallback: true,
            ...choice.setback,
          },
        ],
      })),
    });
  }

  const PIRATE_BLUE_REVERSE_STORIES = [
    ["stolen-jolly-roger", "Le pavillon dans le clocher", "Le maire d’un port des quatre mers a enfermé un pavillon pirate dans son clocher. Chaque nuit, des enfants le hissent à nouveau et jurent qu'il leur raconte des aventures.", "Reprendre le pavillon au grand jour", "Parler aux enfants"],
    ["salt-bone-treasure", "Le trésor aux os de sel", "Une carte mène à un squelette entièrement cristallisé par le sel. Sa main désigne une auberge plutôt que la mer.", "Fouiller l'auberge", "Interroger les anciens"],
    ["mutinous-rowboat", "La chaloupe en mutinerie", "Quatre pirates dérivent dans une chaloupe et ont déjà élu cinq capitaines. Leur véritable navire attend derrière un cap.", "Les aider à reprendre leur navire", "Proposer une alliance temporaire"],
    ["marine-payroll", "La solde de la Marine", "Une sacoche de solde tombe d'un navire de la Marine. Un village affamé et un équipage rival l'ont vue en même temps.", "S'emparer de la sacoche", "La remettre au village"],
    ["powder-monkeys", "Les singes poudriers", "Des singes ont pillé la poudrière d'un pirate local. Ils imitent maintenant les saluts de la Marine avec des mèches allumées.", "Récupérer la poudre", "Attirer les singes loin du port"],
    ["rival-feast", "Le banquet de la capitaine rivale", "L’équipage rival a préparé un banquet pour célébrer ta défaite avant même de te combattre. La capitaine rivale tarde à revenir, et ses hommes ont déjà mangé le dessert.", "Prendre sa place à table", "Piéger le retour de la capitaine rivale"],
    ["wreck-divers", "Les plongeurs de l'épave royale", "Des plongeurs clandestins remontent la vaisselle d'un ancien royaume d’une mer cardinale. Une cloche engloutie sonne sous leurs pieds.", "Plonger jusqu'à la cloche", "Négocier une part"],
    ["false-log-pose", "Le faux Log Pose de Loguetown", "Un marchand de Loguetown vend des Log Pose aux pirates qui n'ont jamais vu Grand Line. Tous indiquent sa propre boutique, tandis qu’une patrouille de Smoker remonte le marché.", "Démasquer le marchand", "Retourner l'arnaque contre lui"],
    ["captains-shadow", "Les signaux découpés dans la voile", "À midi, des entailles dans la grand-voile projettent sur le pont un ancien code de navigation. Quelqu'un a saboté la toile pour guider le navire vers une crique surveillée.", "Suivre le cap pour surprendre les guetteurs", "Décoder le signal avant de changer de route"],
    ["smuggler-wedding", "Le mariage des contrebandiers", "Deux familles de contrebandiers célèbrent une union sur trois navires attachés ensemble. La dot est une carte des patrouilles de la Marine.", "S'inviter à la cérémonie", "Voler une copie de la carte"],
    ["silent-cannon", "La pièce d'artillerie sabotée", "Un canon acheté à North Blue contient un mécanisme qui bloque les tirs à hauteur de coque et dévie les boulets vers les récifs. Le marchand qui l'a vendu réclame maintenant sa restitution avant une inspection de la Marine.", "Démonter le mécanisme et conserver le canon", "Contraindre le marchand à révéler son commanditaire"],
    ["wanted-painter", "Le photographe des avis de recherche", "Un photographe travaillant pour la Marine propose un cliché plus terrifiant pour ton prochain avis de recherche. Sa dernière photo a cadré trois passants au lieu du capitaine visé.", "Poser pour le cliché", "Lui dicter une fausse légende"],
    ["east-blue-dreamers", "Les apprentis d’Orange Town", "Près d’Orange Town, de jeunes mousses ont bâti un navire avec des portes de grange. Ils te demandent de bénir leur pavillon avant que leurs parents ne découvrent le vol.", "Tester leur navire", "Leur apprendre à choisir un cap", "east-blue"],
    ["east-blue-marine-net", "Le barrage de Shells Town", "Une unité rattachée à Shells Town tend un barrage de filets entre deux phares. Le lieutenant promet sa première promotion à celui qui capturera ton pavillon.", "Percer le barrage", "Faire diversion au marché", "east-blue"],
    ["north-blue-clockwork", "Le calculateur de tir de North Blue", "Une mécanicienne de North Blue propose un calculateur expérimental capable d'anticiper le roulis. Des agents cherchent à saisir l'appareil avant qu'elle puisse prouver qu'il fonctionne.", "Tester l'appareil sous le feu", "Protéger la mécanicienne et ses plans", "north-blue"],
    ["north-blue-blood-feud", "Les deux blasons gelés", "Deux familles de North Blue se disputent un détroit depuis trois générations. Chacune offre une alliance si tu attaques l’autre avant la nuit.", "Choisir un camp", "Imposer une trêve pirate", "north-blue"],
    ["south-blue-carnival", "Le carnaval des cent pavillons", "À South Blue, un port célèbre les équipages étrangers avec des masques géants. Un voleur utilise ton costume pour piller la caisse du festival.", "Pourchasser ton imitateur", "Sauver la fête avant tout", "south-blue"],
    ["west-blue-black-table", "La table noire du port", "À West Blue, des courtiers mafieux vendent la position de navires isolés. Ton propre trajet figure déjà au menu, accompagné d’un prix.", "Racheter l’information", "Retourner le réseau contre lui", "west-blue"],
    ["reverse-whale-song", "Le chant sous la montagne", "Un chant immense résonne sous Reverse Mountain et dérègle les instruments. Un ancien marin du Cap des Jumeaux parle d’une baleine qui attend toujours quelqu’un.", "Chercher l’origine du chant", "Calmer l’équipage", "reverse"],
    ["reverse-lost-convoy", "Le convoi à contre-courant", "Trois navires pirates redescendent Reverse Mountain à reculons. Leur capitaine jure que le sommet a changé de place.", "Les guider vers une passe", "Récupérer leur cargaison", "reverse"],
    ["reverse-pilot-debt", "La dette du vieux pilote", "Un pilote de Reverse Mountain reconnaît ton pavillon et réclame une dette contractée par un capitaine mort depuis vingt ans. Il possède pourtant sa signature.", "Contester la dette", "Payer pour entendre l'histoire", "reverse"],
    ["reverse-last-toast", "Le dernier toast avant Grand Line", "Une taverne accrochée à la falaise sert un dernier verre avant Grand Line. Chaque client doit laisser un souvenir qu'il regrettera peut-être.", "Confier un souvenir", "Boire sans rien laisser", "reverse"],
    ["reverse-marine-ambush", "Les canons dans les nuages", "Une patrouille de la Marine attend dans une poche de calme au milieu de l’ascension. Ses chaînes peuvent immobiliser ton navire ou précipiter les deux bâtiments.", "Briser leur formation", "Utiliser le courant comme écran", "reverse"],
    ["reverse-captains-oath", "Le serment au sommet", "Au sommet de Reverse Mountain, un équipage vétéran te propose de franchir Grand Line sous son pavillon. Ton équipage attend de savoir si tu crois encore au tien.", "Refuser devant tous", "Accepter une alliance sans soumission", "reverse"],
  ];

  const MARINE_BLUE_REVERSE_STORIES = [
    ["cadet-first-watch", "La première garde", "Une escouade de cadets protège un quai d’une mer cardinale pendant que leur supérieur dort dans l'armurerie. Un bateau de pêche revient criblé d'impacts.", "Prendre le commandement", "Réveiller le supérieur"],
    ["missing-rations", "Les rations disparues", "Les réserves d'une base de la Marine diminuent chaque nuit. Les traces mènent vers un orphelinat que le quartier-maître veut fouiller.", "Mener l'inspection", "Surveiller discrètement l'entrepôt"],
    ["corrupt-lieutenant", "Le registre du lieutenant", "Un lieutenant falsifie les saisies de contrebande et invoque les besoins de la base. Son registre porte le sceau d'un notable local.", "Le dénoncer", "Remonter le réseau"],
    ["pirate-surrender", "Le pavillon blanc cousu trop vite", "Un petit équipage pirate se rend avant le combat. Dans sa cale se cachent des civils qu'il affirme avoir sauvés.", "Procéder aux arrestations", "Écouter les civils"],
    ["justice-statue", "La statue de la Justice", "Une ville veut ériger ta statue après une arrestation mineure. Le véritable héros est une vendeuse de légumes qui a bloqué la fuite.", "Refuser l'honneur", "Partager la cérémonie"],
    ["cipher-pol-envelope", "L'enveloppe sans expéditeur", "Un ordre du Cipher Pol exige la libération immédiate d'un trafiquant. Aucun supérieur de la base n'ose signer le reçu.", "Refuser l'ordre", "Obéir en préparant une filature"],
    ["tax-riot", "L'émeute des taxes", "Des habitants encerclent un bureau du Gouvernement mondial. Les soldats attendent ton ordre tandis qu'un enfant brandit le registre des taxes.", "Protéger le bureau", "Examiner le registre"],
    ["marine-doctor", "L'infirmerie sans médecin", "Une épidémie de rire nerveux frappe la garnison. L'unique médecin s'est enfermé parce que son Escargophone se moque de lui.", "Organiser les soins", "Faire sortir le médecin"],
    ["stolen-uniforms", "Les uniformes du dimanche", "Tous les uniformes de parade ont disparu avant l'inspection d'un commodore. Une troupe de théâtre joue justement une pièce sur la Marine.", "Fouiller le théâtre", "Négocier avant l'inspection"],
    ["bounty-error", "La prime du boulanger", "Une faute d'impression place une prime énorme sur un boulanger paisible. Trois chasseurs de primes approchent déjà du port.", "Protéger le boulanger", "Corriger l'avis officiel"],
    ["deserter-boat", "La barque du déserteur", "Un jeune soldat fuit avec une barque et un dossier sur des abus commis par son capitaine. La hiérarchie ordonne son arrestation immédiate.", "Poursuivre le déserteur", "Lire le dossier d'abord"],
    ["prisoner-choir", "Le chœur de la prison", "Les détenus d'une base chantent chaque relève avec des paroles codées. Le geôlier prétend qu'il s'agit seulement d'une chanson de soupe.", "Déchiffrer les paroles", "Changer l'heure de relève"],
    ["east-blue-village-watch", "La cloche de Shells Town", "À East Blue, une cloche de garnison sonne sans qu’aucun soldat ne l’ait touchée. Des pêcheurs affirment qu’un ancien officier cachait ses saisies sous le quai.", "Fouiller les fondations", "Protéger les témoins", "east-blue"],
    ["east-blue-first-poster", "Le mauvais cliché de Loguetown", "Une base d’East Blue reçoit de Loguetown l’avis de recherche d’un pirate encore inconnu. Le cliché photographique montre par erreur le garçon qui distribue le journal.", "Suspendre la chasse", "Retrouver le véritable modèle", "east-blue"],
    ["north-blue-weapon-lab", "Le laboratoire sous la neige", "À North Blue, un ingénieur affilié au Gouvernement mondial teste des armes sur des épaves habitées. Ton ordre officiel exige seulement de sécuriser ses plans.", "Arrêter les essais", "Saisir les preuves en silence", "north-blue"],
    ["north-blue-family-orders", "L’ordre au blason d’argent", "Une famille influente de North Blue exige l’arrestation de ses opposants politiques. Le mandat porte un sceau authentique et des accusations manifestement copiées.", "Refuser le mandat", "Obéir pour infiltrer la famille", "north-blue"],
    ["south-blue-beast-rescue", "Le lézard du marché", "À South Blue, un lézard de trait gigantesque panique au milieu d’une fête portuaire. Des contrebandiers profitent du chaos pour déplacer leurs caisses.", "Sauver la foule", "Suivre les contrebandiers", "south-blue"],
    ["west-blue-corrupt-base", "La base aux fenêtres fermées", "À West Blue, une base de la Marine protège ouvertement un syndicat criminel. La commandante de la base te propose une promotion contre ton silence.", "Rédiger un rapport complet", "Feindre d’accepter", "west-blue"],
    ["reverse-smuggler", "Le contrebandier du sommet", "Un contrebandier cache des médicaments sous des boulets factices. Son chargement est illégal mais destiné à un village isolé.", "Saisir la cargaison", "Vérifier sa destination", "reverse"],
    ["reverse-orders", "Deux ordres, un seul passage", "Deux commodores donnent des ordres opposés pour sécuriser Reverse Mountain. Chaque Escargophone affirme que l'autre ligne est compromise.", "Choisir un ordre", "Suspendre les deux transmissions", "reverse"],
    ["reverse-memorial", "Les noms sur la pierre rouge", "Des familles gravent les noms de marins disparus au pied de Reverse Mountain. Un pirate recherché vient ajouter celui de son frère.", "Procéder à l'arrestation", "Respecter la cérémonie", "reverse"],
    ["reverse-promotion", "Les galons dans le courant", "Une promotion t'attend de l'autre côté de Reverse Mountain. Pour la recevoir, il faut abandonner une mission de secours en cours.", "Poursuivre la mission", "Rejoindre la cérémonie", "reverse"],
    ["reverse-civilian-convoy", "Les voiles prises au piège", "Un convoi civil se disperse dans les courants verticaux de Reverse Mountain. Ton supérieur ordonne de poursuivre un pirate plutôt que de sauver les familles.", "Désobéir pour sauver le convoi", "Diviser ton unité", "reverse"],
    ["reverse-cipher-pol-order", "L’ordre sans signature", "Au Cap des Jumeaux, un agent du Cipher Pol réclame la remise d’un réfugié. Il refuse de montrer autre chose qu’un Escargophone silencieux.", "Exiger une preuve", "Organiser la fuite du réfugié", "reverse"],
  ];

  const BOUNTY_HUNTER_BLUE_REVERSE_STORIES = [
    ["poster-rain", "La pluie d'affiches", "Une caisse d'avis de recherche éclate au-dessus du port. Le vent mélange criminels, disparus et portraits de mariage.", "Trier les vraies primes", "Suivre l'affiche la plus étrange"],
    ["sleeping-target", "La cible qui ronfle", "Un pirate recherché dort au milieu d'une auberge remplie de chasseurs. Chacun attend qu'un autre paie les dégâts.", "Tenter l'arrestation", "Négocier avec l'aubergiste"],
    ["shared-contract", "Le contrat partagé", "Trois chasseurs possèdent le même contrat original. L'Escargophone du commanditaire nie les connaître.", "Former une équipe", "Remonter jusqu'au commanditaire"],
    ["false-bounty", "La prime inventée", "Un maire offre une récompense privée contre un pêcheur qui refuse de vendre son quai. Aucun crime ne figure au dossier.", "Refuser le contrat", "Enquêter sur le maire"],
    ["masked-witness", "Le témoin au masque de poisson", "Le seul témoin d'un pillage refuse d'enlever un masque de carnaval. Il reconnaît pourtant chaque pirate à son odeur.", "Suivre son témoignage", "Vérifier ses alibis"],
    ["bounty-rivals", "Les Jumeaux du Reçu", "Deux chasseurs rivaux capturent toujours leurs cibles ensemble puis se battent pour le reçu. Ils te proposent une troisième signature.", "Accepter leur marché", "Les devancer"],
    ["empty-hideout", "La planque trop propre", "La cache d'un pirate recherché vient d'être lavée du sol au plafond. Une tasse encore chaude porte l'emblème de la Marine.", "Fouiller la planque", "Surveiller la patrouille"],
    ["dock-sniper", "Le tireur du clocher", "Un tireur inconnu immobilise les navires sans blesser personne. Sa cible réelle semble être une cargaison du Gouvernement mondial.", "Monter au clocher", "Protéger la cargaison"],
    ["wanted-cook", "Le cuisinier recherché", "Une prime vise un cuisinier accusé d'avoir empoisonné un équipage. Tous ses anciens clients réclament pourtant sa soupe.", "Goûter la soupe", "Retrouver l'équipage plaignant"],
    ["auction-captive", "L'enchère au prisonnier", "Des chasseurs vendent entre eux le droit de livrer une cible déjà ligotée. Le prisonnier affirme être le frère innocent du recherché.", "Suspendre l'enchère", "Comparer les avis de recherche"],
    ["black-market-ledger", "Le carnet des primes mortes", "Un receleur vend la liste de pirates officiellement morts mais toujours actifs. Ton propre nom apparaît dans la marge.", "Acheter le carnet", "Piéger le receleur"],
    ["marine-clerk", "Le guichet numéro neuf", "La Marine refuse de payer une capture car le formulaire utilise une encre bleue non réglementaire. Le prisonnier commence à ronger ses liens.", "Exiger le paiement", "Sécuriser d'abord la cible"],
    ["east-blue-innocent-target", "La voleuse de tartes", "À East Blue, une affiche accuse une adolescente d’avoir pillé douze navires. Le seul témoin est un pâtissier furieux dont elle a volé une tarte.", "Examiner les attaques", "Confronter le pâtissier", "east-blue"],
    ["east-blue-local-legend", "Le pirate au bateau minuscule", "Une prime locale vise un pirate qui navigue dans une baignoire renforcée. Chaque tentative d’arrestation finit par une course dans les canaux.", "Bloquer les canaux", "L’attirer avec une fausse affiche", "east-blue"],
    ["north-blue-mercenary", "Le contrat sous la glace", "À North Blue, un mercenaire recherché se cache dans un convoi diplomatique. Les deux familles escortées paieront pour que tu accuses l’autre.", "Inspecter les deux délégations", "Suivre les traces sur la glace", "north-blue"],
    ["north-blue-cybernetic-trail", "Les empreintes de cuivre", "Une cible de North Blue laisse derrière elle des empreintes métalliques encore chaudes. Une ingénieure locale reconnaît une prothèse de sa fabrication.", "Demander à l’ingénieure de guider la piste", "Tendre un piège magnétique", "north-blue"],
    ["south-blue-festival-contract", "La cible sous cent masques", "À South Blue, ton contrat se cache dans un carnaval où tout le monde porte son visage. La foule croit participer à un jeu.", "Observer les gestes", "Faire fermer les sorties", "south-blue"],
    ["west-blue-mafia-bounty", "La prime que personne n’imprime", "À West Blue, un chef mafieux possède une prime officielle que les imprimeurs refusent de publier. Une informatrice connaît son véritable itinéraire.", "Faire confiance à l’informatrice", "Vendre une fausse route au réseau", "west-blue"],
    ["reverse-cage", "La cage qui remonte seule", "Une cage vide remonte le courant de Reverse Mountain. Ses barreaux portent les marques d'un Fruit du Démon.", "Récupérer la cage", "Chercher son ancien occupant", "reverse"],
    ["reverse-competing-contract", "Le contrat du sommet", "Marine et marchands offrent deux récompenses différentes pour la même contrebandière. Elle transporte des médicaments.", "Choisir un commanditaire", "Entendre sa version", "reverse"],
    ["reverse-tracker", "Les traces sur la roche rouge", "Des pas apparaissent sur une paroi verticale de Reverse Mountain. La cible que tu poursuis ne possède pourtant aucun navire.", "Escalader la paroi", "Attendre au passage", "reverse"],
    ["reverse-last-capture", "La dernière prise avant Grand Line", "Un vieux chasseur veut réussir une dernière capture avant Grand Line. Sa cible est le pirate qui lui a autrefois sauvé la vie.", "L'aider à conclure", "Proposer une autre issue", "reverse"],
    ["reverse-rival-race", "La chasse verticale", "Ton rival poursuit la même cible dans le courant ascendant. Il propose de partager le contrat tout en sabotant discrètement ta voile.", "Accepter la course commune", "Le devancer par les rochers", "reverse"],
    ["reverse-exceptional-bounty", "La prime au bord de Grand Line", "Une prime exceptionnelle vise un capitaine qui franchira Reverse Mountain avant l’aube. Sa capture vaut une fortune, mais son navire transporte des enfants évacués.", "Intercepter le capitaine", "Vérifier l’histoire des passagers", "reverse"],
  ];

  const REVOLUTIONARY_BLUE_REVERSE_STORIES = [
    ["secret-press", "La presse sous la boulangerie", "Une imprimerie clandestine fonctionne sous un fournil d’une mer cardinale. L'encre manque au moment où le Gouvernement mondial annonce une nouvelle taxe.", "Imprimer les tracts", "Voler l'encre officielle"],
    ["tax-caravan", "La caravane des impôts", "Des agents escortent les économies d'un village vers un navire gouvernemental. Les habitants ont remplacé les pièces par des boutons.", "Protéger la ruse", "Détourner l'escorte"],
    ["cell-password", "Le mot de passe oublié", "Une cellule révolutionnaire a oublié son propre mot de passe après l'avoir changé six fois. Un espion attend dans la même file que toi.", "Identifier l'espion", "Inventer un nouveau signe"],
    ["oppressed-miners", "La mine aux cloches", "Des mineurs sonnent une cloche à chaque accident pour que le propriétaire perde le compte. Aujourd'hui, elle ne cesse plus.", "Évacuer la mine", "Saboter les machines"],
    ["cipher-pol-tail", "L'homme au journal immobile", "Un lecteur suit ta cellule de port en port sans jamais tourner une page. Son journal porte le filigrane du Cipher Pol.", "Le confronter", "L'entraîner sur une fausse piste"],
    ["prison-laundry", "La buanderie de la prison", "Les draps d'une prison gouvernementale transportent des messages brodés. Une nouvelle inspectrice sait lire les coutures.", "Extraire les messages", "Détourner l'inspectrice"],
    ["royal-banquet", "Le banquet financé par Goa", "Le roi d’une île des quatre mers organise un festin financé par des négociants du Royaume de Goa pendant que son quartier pauvre manque de grain. Les cuisines communiquent avec les égouts.", "Redistribuer les réserves", "Remplacer le discours royal"],
    ["marine-sympathizer", "La caporale au ruban rouge", "Une caporale laisse volontairement s'échapper des manifestants. Son supérieur lui ordonne maintenant de tirer.", "Organiser son extraction", "Fabriquer un faux ordre"],
    ["den-den-broadcast", "L'Escargophone pirate", "Un technicien a détourné le réseau d'Escargophones d'une île. Il reste assez de temps pour un seul message.", "Diffuser des témoignages", "Donner les consignes de révolte"],
    ["weapon-crates", "Les caisses de charrues", "Une cargaison étiquetée comme armes contient des outils agricoles. Le Gouvernement mondial veut tout saisir malgré l'hiver.", "Sauver les outils", "Exposer la saisie"],
    ["missing-agent", "L'agent qui ne revient pas", "Un messager manque trois rendez-vous mais continue d'envoyer des rapports parfaits. Son écriture devient plus régulière chaque jour.", "Retrouver le messager", "Tester le faux correspondant"],
    ["freedom-song", "La chanson interdite", "Une chanson de travail devient l'hymne involontaire d'une grève. La Marine cherche son auteur, qui prétend l'avoir apprise d'un perroquet.", "Cacher l'auteur", "Répandre la chanson"],
    ["east-blue-hidden-school", "L’école derrière les filets", "À East Blue, une institutrice enseigne l’histoire interdite derrière des filets de pêche. Une inspection du Gouvernement mondial arrive avec une heure d’avance.", "Cacher les livres", "Faire diversion au port", "east-blue"],
    ["east-blue-marine-friend", "Le soldat qui baisse son fusil", "Un jeune soldat d’East Blue laisse passer des familles recherchées. Son supérieur veut un exemple avant la relève.", "Extraire le soldat", "Fabriquer un rapport crédible", "east-blue"],
    ["north-blue-spy-engine", "La machine à reconnaître les mensonges", "À North Blue, un noble teste une machine censée identifier les révolutionnaires. Elle accuse surtout les personnes enrhumées.", "Saboter la démonstration", "Retourner l’inventeur", "north-blue"],
    ["north-blue-frozen-cell", "La cellule sous le lac", "Une cellule révolutionnaire de North Blue se cache sous un lac gelé. L’agente de liaison arrive avec un code périmé et du sang sur sa manche.", "Faire confiance à l’agente de liaison", "L’interroger avant d’ouvrir", "north-blue"],
    ["south-blue-tribute-feast", "Le banquet du tribut", "À South Blue, un royaume transforme la collecte du tribut céleste en fête obligatoire. Les habitants dansent tandis que leurs réserves quittent le port.", "Détourner les navires du tribut", "Révéler les comptes au public", "south-blue"],
    ["west-blue-secret-auction", "L’enchère des noms", "À West Blue, une société secrète vend les identités d’agents révolutionnaires. Ton propre nom doit être annoncé après minuit.", "Infiltrer les acheteurs", "Détruire le registre", "west-blue"],
    ["reverse-refugees", "Les voiles sans pavillon", "Un convoi de réfugiés hésite devant le courant ascendant. Une patrouille approche avec l'ordre de les ramener.", "Guider le convoi", "Retarder la patrouille", "reverse"],
    ["reverse-spy", "L'espion du dernier verre", "Dans la dernière taverne avant Reverse Mountain, chaque client prétend rejoindre Grand Line. L'un récite trop parfaitement les slogans révolutionnaires.", "Le démasquer", "Lui transmettre une fausse mission", "reverse"],
    ["reverse-propaganda-kite", "Le cerf-volant rouge", "Un immense cerf-volant doit porter un message au sommet de Reverse Mountain. Le vent le dirige droit vers un poste de la Marine.", "Maintenir le lancement", "Changer le message", "reverse"],
    ["reverse-cell-choice", "La cellule de l'autre versant", "Une cellule attend de l'autre côté de Reverse Mountain, mais son chef exige l'abandon d'alliés restés dans les quatre mers.", "Refuser l'ordre", "Négocier un délai", "reverse"],
    ["reverse-secret-route", "La veine sèche de Red Line", "L’agente de liaison révèle un ancien conduit de maintenance longeant Reverse Mountain. Le passage est étroit, mais permettrait aux agents d’éviter tous les contrôles.", "Ouvrir la route clandestine", "Garder le passage secret", "reverse"],
    ["reverse-government-chains", "Les chaînes du passage", "Le Gouvernement mondial installe des chaînes de contrôle au pied de Reverse Mountain. Elles mettront bientôt réfugiés et dissidents à sa merci.", "Saboter les treuils", "Remplacer les ordres de fermeture", "reverse"],
  ];


  /* ========================================================
     3. ÉVÉNEMENTS COMMUNS

     Ils peuvent apparaître pour toutes les voies et dans
     chacun des quatre Blues.
  ======================================================== */

const COMMON_EVENTS = [

  createEvent({
    id: "common-floating-crate",
    title: "La caisse qui refuse de couler",

    description:
      "Une caisse dérive au milieu des vagues. Elle porte trois inscriptions contradictoires : « Fragile », « Ne pas ouvrir » et « Biscuits ». Un goéland assis dessus te fixe comme s’il détenait légalement la cargaison.",

    category: "exploration",
    tags: ["commun", "humour", "butin"],

    choices: [
      {
        id: "open-carefully",
        text: "L’ouvrir avec précaution",

        result:
          "Sous une couche de linge humide, tu trouves quelques outils, des pièces et un biscuit miraculeusement sec. Le goéland paraît personnellement offensé.",

        effects: {
          fortune: 15000,
          ship: 1,
          morale: 2,
        },

        addTraits: ["prudent"],

        flags: {
          foundFloatingTools: true,
        },
      },

      {
        id: "leave-crate",
        text: "La laisser à son propriétaire ailé",

        result:
          "Le goéland pousse lentement la caisse vers l’horizon avec une détermination admirable. Tu ne sauras jamais ce qu’il comptait en faire.",

        effects: {
          morale: 1,
        },

        addTraits: ["calme"],
      },

      {
        id: "break-crate",
        text: "La briser d’un grand coup",

        result:
          "La caisse contenait effectivement des biscuits. Elle contenait aussi un ressort industriel qui te frappe directement au front.",

        effects: {
          health: -3,
          morale: 3,
        },

        addTraits: ["impulsif"],

        combatStyle: "utilisateur-armes",
      },
    ],
  }),


  createEvent({
    id: "common-storm-bell",
    title: "La cloche avant l’orage",

    description:
      "Un vieux pêcheur secoue une cloche sur le quai en criant que l’orage arrive. Le ciel est bleu, les tavernes rient de lui et ton départ est prévu dans l’heure. Puis les poissons commencent à sauter hors de l’eau.",

    category: "survie",
    tags: ["commun", "météo", "dilemme"],

    choices: [
      {
        id: "trust-fisherman",
        text: "Retarder le départ et l’aider à prévenir le port",

        result:
          "L’orage frappe brutalement. Grâce aux amarres renforcées, plusieurs embarcations survivent. Le vieux pêcheur se contente de dire : « Les poissons ne mentent pas. Les gens, si. »",

        effects: {
          fortune: -5000,
          ship: 2,
          morale: 4,
        },

        addTraits: ["prudent", "altruiste"],

        flags: {
          trustedStormFisherman: true,
        },

        important: true,
      },

      {
        id: "leave-before-storm",
        text: "Partir avant que la météo change",

        result:
          "Tu gagnes du temps, puis tu le reperds en luttant contre des vagues hautes comme des maisons. Tu atteins finalement une crique avec les bras en feu.",

        effects: {
          health: -5,
          ship: -2,
          combat: 2,
        },

        addTraits: ["courageux"],

        combatStyle: "navigateur",
      },

      {
        id: "mock-fisherman",
        text: "Parier avec les taverniers qu’il se trompe",

        result:
          "Tu remportes les paris pendant exactement vingt-sept minutes. Ensuite, le toit de la taverne s’envole avec ta mise.",

        effects: {
          fortune: -10000,
          morale: -2,
        },

        addTraits: ["arrogant"],
      },
    ],
  }),


  createEvent({
    id: "common-wounded-dog",
    title: "Le chien du navire fantôme",

    description:
      "Sur un îlot désert, un chien garde les restes d’une barque brisée. Il grogne dès que tu approches, mais sa patte est prise dans une corde. Derrière lui, un sac de provisions est encore intact.",

    category: "dramatique",
    tags: ["commun", "animal", "dilemme"],

    important: true,

    choices: [
      {
        id: "free-dog",
        text: "Le libérer, quitte à te faire mordre",
        choiceTag: "Sacrifice",

        result:
          "Le chien te mord. Puis il te lèche. Puis il te remord, apparemment par principe. Il finit par te suivre jusqu’au rivage.",

        effects: {
          health: -2,
          morale: 5,
        },

        addTraits: ["compatissant", "courageux"],

        flags: {
          rescuedDockDog: true,
        },

        title: {
          id: "ami-des-betes",
          name: "Ami des bêtes",
        },

        important: true,
      },

      {
        id: "steal-food",
        text: "L’attirer loin du sac et prendre les provisions",
        choiceTag: "Sans retour",

        result:
          "Tu repars avec les vivres. Le chien reste seul sur l’îlot, silhouette minuscule derrière ton sillage.",

        effects: {
          fortune: 8000,
          morale: -5,
        },

        addTraits: ["rusé"],

        flags: {
          abandonedDockDog: true,
        },

        important: true,
      },

      {
        id: "share-food",
        text: "Partager tes propres provisions à distance",

        result:
          "Après une longue hésitation, le chien mange sans quitter la barque. Tu respectes sa décision et reprends la mer.",

        effects: {
          fortune: -3000,
          morale: 3,
        },

        addTraits: ["calme"],
      },
    ],
  }),


  createEvent({
    id: "common-tavern-map",
    title: "La carte dessinée sur une nappe",

    description:
      "Dans une taverne, une navigatrice ivre trace une route entre les taches de soupe. Elle affirme que ce passage évite les récifs. Le patron affirme qu’elle n’a jamais possédé de bateau. Elle répond qu’un bateau est « une opinion en bois ».",

    category: "style-combat",
    tags: ["commun", "navigateur", "humour"],

    choices: [
      {
        id: "study-map",
        text: "Étudier sérieusement son tracé",

        result:
          "Sous les blagues et la soupe, ses calculs sont brillants. Elle t’apprend à lire la houle plutôt que les cartes.",

        effects: {
          ship: 2,
          morale: 2,
        },

        addTraits: ["curieux"],

        combatStyle: "navigateur",

        flags: {
          learnedWaveReading: true,
        },
      },

      {
        id: "buy-napkin-map",
        text: "Acheter la nappe",

        result:
          "Le patron te facture la nappe, la soupe et une chaise mystérieusement cassée. La route, elle, fonctionne réellement.",

        effects: {
          fortune: -12000,
          ship: 3,
        },

        addTraits: ["pragmatique"],

        combatStyle: "navigateur",
      },

      {
        id: "challenge-navigator",
        text: "Lui demander de prouver ses talents en mer",

        result:
          "Elle accepte, prend la barre, évite trois récifs et vomit sur le quatrième. Tu as trouvé une excellente professeure et une très mauvaise passagère.",

        effects: {
          crew: 1,
          ship: 2,
          morale: 3,
        },

        flags: {
          recruitedNessa: true,
        },
      },
    ],
  }),


  createEvent({
    id: "common-clinic-no-doctor",
    title: "La clinique sans médecin",

    description:
      "Une petite clinique déborde de blessés après l’effondrement d’un marché. Le médecin est parti chercher des remèdes et son assistant tremble devant une aiguille comme si elle allait l’attaquer.",

    category: "style-combat",
    tags: ["commun", "médecin", "dramatique"],

    choices: [
      {
        id: "help-patients",
        text: "Suivre le manuel et aider les blessés",

        result:
          "Tu fais quelques erreurs mineures, aucune fatale, et découvres que garder une main stable compte parfois plus que connaître le nom de tous les os.",

        effects: {
          health: 3,
          morale: 4,
        },

        addTraits: ["calme", "compatissant"],

        combatStyle: "medecin",

        flags: {
          clinicVolunteer: true,
        },
      },

      {
        id: "find-doctor",
        text: "Partir chercher le médecin",

        result:
          "Tu le retrouves coincé sous une enseigne tombée. Le ramener à temps demande autant de force que de sang-froid.",

        effects: {
          health: -2,
          combat: 2,
          morale: 3,
        },

        addTraits: ["courageux"],
      },

      {
        id: "organize-clinic",
        text: "Organiser les habitants plutôt que soigner",

        result:
          "Tu répartis les tâches, calmes les familles et libères de l’espace. Personne ne t’appelle médecin, mais tout le monde respire mieux.",

        effects: {
          crew: 1,
          morale: 3,
        },

        addTraits: ["charismatique", "organisé"],

        flags: {
          organizedClinic: true,
        },
      },
    ],
  }),


  createEvent({
    id: "common-sword-barrel",
    title: "Le sabre dans le tonneau",

    description:
      "Un marchand vend un vieux sabre planté dans un tonneau. Selon lui, personne n’a jamais réussi à le retirer. Selon sa fille, il a simplement rouillé dans le fond. Une petite foule attend ton humiliation.",

    category: "style-combat",
    tags: ["commun", "épéiste", "humour"],

    choices: [
      {
        id: "pull-sword",
        text: "Tirer de toutes tes forces",

        result:
          "Le sabre sort, le tonneau aussi. Tu traverses la place avec les deux avant de tomber dans un étal de melons. La foule applaudit quand même.",

        effects: {
          combat: 3,
          health: -2,
          morale: 3,
        },

        addTraits: ["tenace"],

        combatStyle: "epeiste",

        flags: {
          ownsRustySword: true,
        },
      },

      {
        id: "inspect-barrel",
        text: "Examiner le tonneau avant d’agir",

        result:
          "Tu repères un clou caché, démontes deux planches et libères le sabre sans effort. Le marchand te traite de tricheur avec beaucoup de respect.",

        effects: {
          combat: 1,
          fortune: 5000,
        },

        addTraits: ["rusé"],

        combatStyle: "inventeur",
      },

      {
        id: "refuse-challenge",
        text: "Refuser de jouer au héros pour une foule",

        result:
          "La fille du marchand hoche la tête : « Enfin quelqu’un de normal. » Elle t’offre un repas.",

        effects: {
          fortune: 2000,
          morale: 2,
        },

        addTraits: ["calme"],
      },
    ],
  }),


  createEvent({
    id: "common-bottle-song",
    title: "La chanson dans la bouteille",

    description:
      "Tu repêches une bouteille contenant non pas un message, mais des paroles de chanson. Le refrain parle d’un marin qui perd sa boussole, son pantalon et finalement toute dignité.",

    category: "récit",
    tags: ["commun", "musicien", "humour"],

    choices: [
      {
        id: "sing-song",
        text: "Inventer une mélodie et la chanter",

        result:
          "Le refrain est catastrophique et immédiatement mémorable. Des dockers le reprennent avant même ton départ.",

        effects: {
          morale: 5,
          crew: 1,
        },

        addTraits: ["charismatique", "créatif"],

        combatStyle: "musicien",

        flags: {
          bottleSong: true,
        },
      },

      {
        id: "keep-lyrics",
        text: "Conserver les paroles pour plus tard",

        result:
          "Tu plies soigneusement le papier. Certaines légendes commencent par un trésor. D’autres par une chanson idiote.",

        effects: {
          morale: 2,
        },

        flags: {
          keptBottleLyrics: true,
        },
      },

      {
        id: "throw-bottle-back",
        text: "Remettre la bouteille à la mer",

        result:
          "Elle revient immédiatement avec la vague suivante. Tu acceptes la défaite et la gardes.",

        effects: {
          morale: 3,
        },
      },
    ],
  }),


  createEvent({
    id: "common-rooftop-sniper",
    title: "Le tireur du clocher",

    description:
      "Des noix de coco explosent autour de toi. Un adolescent perché sur un clocher teste une fronde géante et hurle : « Ne bougez surtout pas, j’ajuste encore ! »",

    category: "style-combat",
    tags: ["commun", "sniper", "humour"],

    choices: [
      {
        id: "learn-shooting",
        text: "Monter lui demander de t’apprendre",

        result:
          "Il t’enseigne à respirer avant le tir et à ne jamais viser quelqu’un qui tient une soupe chaude. La deuxième règle vient d’une histoire très précise.",

        effects: {
          combat: 3,
          morale: 2,
        },

        addTraits: ["patient"],

        combatStyle: "sniper",

        flags: {
          trainedWithBellSniper: true,
        },
      },

      {
        id: "dodge-coconuts",
        text: "Traverser la place en esquivant",

        result:
          "Tu atteins l’autre côté sans être touché. Une noix de coco détruit cependant ton sac. Victoire morale, défaite logistique.",

        effects: {
          combat: 2,
          fortune: -4000,
        },

        addTraits: ["courageux"],
      },

      {
        id: "report-shooter",
        text: "Prévenir les habitants",

        result:
          "Le clocher est évacué. L’adolescent promet de devenir plus prudent, puis demande si tirer depuis le moulin serait acceptable.",

        effects: {
          morale: 2,
        },

        addTraits: ["responsable"],
      },
    ],
  }),


  createEvent({
    id: "common-beach-tournament",
    title: "Le tournoi sans trophée",

    description:
      "Un village organise un tournoi de lutte sur la plage. Le trophée a été volé l’année précédente, alors le vainqueur reçoit désormais « la satisfaction d’avoir gagné » et deux brochettes.",

    category: "style-combat",
    tags: ["commun", "combat", "humour"],

    choices: [
      {
        id: "enter-tournament",
        text: "Participer au tournoi",

        result:
          "Tu apprends à encaisser, à tomber et à sourire avec du sable dans les dents. Tu ne gagnes pas, mais personne ne t’oublie.",

        effects: {
          combat: 4,
          health: -3,
          morale: 3,
        },

        addTraits: ["tenace"],

        combatStyle: "corps-a-corps",
      },

      {
        id: "study-champion",
        text: "Observer la championne locale",

        result:
          "Ses mouvements sont précis, économes, presque dansés. Elle accepte de corriger ta posture après le tournoi.",

        effects: {
          combat: 3,
          health: 1,
        },

        addTraits: ["calme", "discipliné"],

        combatStyle: "artiste-martial",
      },

      {
        id: "sell-drinks",
        text: "Vendre des boissons aux participants",

        result:
          "Tu gagnes davantage que le champion, qui te demande ensuite une boisson à crédit.",

        effects: {
          fortune: 18000,
          morale: 2,
        },

        addTraits: ["opportuniste"],
      },
    ],
  }),


  createEvent({
    id: "common-clockwork-crab",
    title: "Le crabe qui fait tic-tac",

    description:
      "Sur une plage, tu trouves un crabe mécanique avançant de travers avec une minuscule clé dans le dos. Une étiquette indique : « Prototype 7. Ne pas nourrir. »",

    category: "style-combat",
    tags: ["commun", "inventeur", "humour"],

    choices: [
      {
        id: "repair-crab",
        text: "Le démonter et le réparer",

        result:
          "Après plusieurs heures, le crabe marche droit pendant trois secondes avant de choisir volontairement de repartir de travers.",

        effects: {
          ship: 2,
          morale: 3,
        },

        addTraits: ["curieux", "créatif"],

        combatStyle: "inventeur",

        flags: {
          repairedClockworkCrab: true,
        },
      },

      {
        id: "follow-crab",
        text: "Le suivre",

        result:
          "Il te conduit à un atelier abandonné rempli de pièces détachées et d’un mot : « Je reviens mardi. » Le mot date de onze ans.",

        effects: {
          fortune: 12000,
          ship: 1,
        },

        flags: {
          foundAbandonedWorkshop: true,
        },
      },

      {
        id: "feed-crab",
        text: "Le nourrir malgré l’étiquette",

        result:
          "Le crabe mange le biscuit, accélère soudainement et disparaît dans la mer. L’étiquette avait donc raison, sans expliquer pourquoi.",

        effects: {
          morale: 4,
        },

        addTraits: ["impulsif"],
      },
    ],
  }),

];




  /* ========================================================
     4. ÉVÉNEMENTS SPÉCIFIQUES AUX VOIES
  ======================================================== */

  const PIRATE_EVENTS = [
    ...PIRATE_BLUE_REVERSE_STORIES.map((story, index) =>
      createFactionStory(PATHS.PIRATE, "pirate", index, story),
    ),

    createEvent({
      id: "pirate-castaway-navigator",
      title: "La navigatrice sur son mât",
      description:
        "Au milieu d’une mer parfaitement calme, une jeune navigatrice dérive assise sur le mât de son navire englouti. Elle refuse de demander de l’aide et prétend attendre « que l’océan présente ses excuses ».",
      category: "recrutement",
      tags: ["pirate", "equipage", "navigateur", "sauvetage"],
      paths: [PATHS.PIRATE],
      choices: [
        {
          id: "rescue-navigator",
          text: "L’accueillir à bord",
          outcomes: [
            {
              id: "joins-crew",
              result:
                "Impressionnée par ton équipage et ta route, la naufragée accepte de devenir ta navigatrice jusqu’à la prochaine île — puis oublie opportunément de partir.",
              effects: { crew: 1, ship: 1 },
              minimumStats: { morale: 52 },
              flags: { rescuedNavigator: true, recruitedMaelysNavigator: true },
              weight: 3,
            },
            {
              id: "temporary-passenger",
              result:
                "Elle accepte le sauvetage, corrige trois erreurs sur ta carte, puis débarque au premier port sans un adieu.",
              effects: { ship: 1 },
              flags: { rescuedNavigator: true },
              fallback: true,
              weight: 2,
            },
          ],
        },
        {
          id: "question-wreck",
          text: "L’interroger sur le naufrage",
          outcomes: [
            {
              id: "current-secret",
              result:
                "Elle décrit un courant circulaire absent des cartes. Son avertissement t’évite le même sort quelques heures plus tard.",
              effects: { ship: 2 },
              minimumStats: { popularity: 2 },
              flags: { learnedHiddenCurrent: true },
              weight: 3,
            },
            {
              id: "offended-navigator",
              result:
                "Elle prend tes questions pour une accusation et plonge pour rejoindre une barque de pêche au loin.",
              effects: { morale: -2 },
              fallback: true,
              weight: 2,
            },
          ],
        },
      ],
    }),
    createEvent({
      id: "pirate-reverse-mountain-prisoner",
      title: "La cellule du cap des Jumeaux",
      description:
        "Près de Reverse Mountain, une chaloupe de la Marine s’est brisée contre les rochers. Dans sa cellule, un prisonnier affirme connaître le rythme du courant ascendant. La jeune garde blessée jure qu’il est un trafiquant dangereux.",
      category: "dilemme",
      tags: ["pirate", "prisonnier", "marine", "reverse-mountain"],
      paths: [PATHS.PIRATE],
      zones: ["reverse-mountain"],
      rarity: EVENT_RARITY.UNCOMMON,
      minMonth: 5,
      maxMonth: 24,
      choices: [
        {
          id: "free-current-prisoner",
          text: "Libérer le prisonnier",
          outcomes: [
            { id: "prisoner-guides-passage", result: "Il tient parole et guide ton navire entre les vagues verticales avant de disparaître au cap.", effects: { ship: 2 }, minimumStats: { morale: 45 }, flags: { freedCurrentPrisoner: true, learnedReverseMountainRhythm: true }, weight: 3 },
            { id: "prisoner-steals-supplies", result: "Libéré, il vole une caisse et plonge vers une barque complice.", effects: { fortune: -4000, morale: -2 }, flags: { freedCurrentPrisoner: true }, fallback: true, weight: 2 },
          ],
        },
        {
          id: "save-marine-guard",
          text: "Secourir la garde de la Marine",
          outcomes: [
            { id: "cadet-rescued", result: "La garde survit et tait ton identité dans son rapport.", effects: { health: -2, popularity: 2 }, requiredTraits: ["compatissant"], flags: { savedMarineGuardAtReverseMountain: true, abandonedCurrentPrisoner: true }, weight: 2 },
            { id: "guard-keeps-duty", result: "Elle accepte les soins mais refuse d’abandonner sa cellule. Tu reprends la mer avec ce choix sur la conscience.", effects: { morale: -2 }, flags: { abandonedCurrentPrisoner: true }, fallback: true, weight: 3 },
          ],
        },
      ],
    }),
    createEvent({
      id: "pirate-black-squall",
      title: "Le grain noir",
      description:
        "Une ligne d’encre coupe l’horizon. Les oiseaux fuient vers la côte tandis que le Log Pose d’un marchand croisé plus tôt s’agite sans raison. La tempête sera sur vous avant la nuit.",
      category: "survie",
      tags: ["pirate", "tempete", "navigation"],
      paths: [PATHS.PIRATE],
      zones: ["grand-line"],
      minMonth: 9,
      maxMonth: 32,
      choices: [
        {
          id: "face-squall",
          text: "Maintenir le cap",
          outcomes: [
            {
              id: "ride-the-wave",
              result:
                "Ton navire grimpe sur les vagues au lieu de les subir. Au matin, tu as gagné plusieurs jours de voyage.",
              effects: { ship: 1, morale: 2 },
              minimumStats: { ship: 2, morale: 48 },
              requiredCombatStyles: ["navigateur"],
              flags: { crossedBlackSquall: true },
              weight: 4,
            },
            {
              id: "storm-damage",
              result:
                "Le cap tient, mais une vergue se brise et plusieurs réserves disparaissent dans les flots.",
              effects: { ship: -2, fortune: -4000 },
              fallback: true,
              weight: 3,
            },
          ],
        },
        {
          id: "seek-storm-shelter",
          text: "Chercher un abri",
          outcomes: [
            {
              id: "hidden-cove",
              result:
                "Une lecture attentive des falaises révèle une crique invisible depuis le large.",
              effects: { morale: 2 },
              minimumStats: { haki: 2 },
              flags: { foundStormCove: true },
              weight: 3,
            },
            {
              id: "reef-scrape",
              result:
                "La baie choisie est peu profonde. La coque racle les récifs avant que l’ancre ne tienne.",
              effects: { ship: -1 },
              fallback: true,
              weight: 2,
            },
          ],
        },
      ],
    }),
    createEvent({
      id: "pirate-red-line-black-market",
      title: "Le courtier sous Red Line",
      description:
        "Dans l’ombre de Red Line, un courtier masqué vend des routes interdites par Escargophone. Il propose un laissez-passer du Gouvernement mondial contre un service futur. Son appareil transpire davantage que lui.",
      category: "marche-noir",
      tags: ["pirate", "marche-noir", "red-line"],
      paths: [PATHS.PIRATE],
      zones: ["red-line"],
      minMonth: 13,
      maxMonth: 44,
      choices: [
        {
          id: "accept-broker-nox-deal",
          text: "Accepter son marché",
          outcomes: [
            { id: "authentic-government-pass", result: "Le laissez-passer ouvre un poste de contrôle. Au dos, une date et ton nom ont déjà été inscrits.", effects: { ship: 1, bounty: 300000 }, minimumStats: { fortune: 5000 }, flags: { acceptedBlackMarketDeal: true, owesBrokerNoxFavor: true }, weight: 3 },
            { id: "marked-forgery", result: "Le document fonctionne, puis se couvre d’une encre rouge visible sous les lampes de la Marine.", effects: { bounty: 600000, morale: -2 }, flags: { acceptedBlackMarketDeal: true, markedByBrokerNox: true }, fallback: true, weight: 2 },
          ],
        },
        {
          id: "refuse-broker-nox-deal",
          text: "Refuser et retenir son visage",
          outcomes: [
            { id: "broker-respects-refusal", result: "Le courtier rit et te laisse partir. Il semble apprécier les dettes que personne n’accepte.", effects: { morale: 2 }, requiredTraits: ["prudent"], flags: { refusedBlackMarketDeal: true }, weight: 2 },
            { id: "broker-sells-name", result: "Avant ton départ, l’Escargophone transmet déjà ton signalement à un autre acheteur.", effects: { bounty: 300000 }, flags: { refusedBlackMarketDeal: true, angeredBrokerNox: true }, fallback: true, weight: 3 },
          ],
        },
      ],
    }),
    createEvent({
      id: "pirate-baratie-apprentice",
      title: "Un tablier du Baratie",
      description:
        "Dans un port d’East Blue, un cuisinier au sourcil fendu affirme avoir travaillé quelques semaines au Baratie. Il fuit un restaurateur à qui il doit quatre-vingts assiettes et une porte.",
      category: "recrutement",
      tags: ["pirate", "equipage", "cuisinier", "baratie"],
      paths: [PATHS.PIRATE],
      zones: STARTING_BLUES,
      choices: [
        {
          id: "hire-cook",
          text: "Lui proposer ta cuisine",
          outcomes: [
            {
              id: "cook-joins",
              result:
                "Après avoir goûté vos réserves, le cuisinier déclare que vous mourrez sans lui. Il embarque pour sauver vos estomacs.",
              effects: { crew: 1, morale: 2 },
              minimumStats: { crew: 1 },
              flags: { recruitedBasileCook: true, baratieApprenticeMet: true },
              weight: 3,
            },
            {
              id: "one-good-meal",
              result:
                "Il refuse la piraterie, mais prépare un repas assez généreux pour rendre le silence heureux à bord.",
              effects: { morale: 3 },
              flags: { baratieApprenticeMet: true },
              fallback: true,
              weight: 2,
            },
          ],
        },
        {
          id: "pay-cooks-debt",
          text: "Régler sa dette",
          outcomes: [
            {
              id: "grateful-cook",
              result:
                "Le restaurateur accepte les berrys. le cuisinier, bouleversé, jure de rembourser sa dette en servant ton équipage.",
              effects: { fortune: -8000, crew: 1 },
              minimumStats: { fortune: 8000 },
              flags: { recruitedBasileCook: true, paidBasileDebt: true },
              weight: 4,
            },
            {
              id: "debt-too-large",
              result:
                "La somme annoncée double dès que le restaurateur comprend que tu es pirate. Tu repars avant que la vaisselle vole.",
              effects: { popularity: -1 },
              fallback: true,
              weight: 2,
            },
          ],
        },
      ],
    }),
    createEvent({
      id: "pirate-grand-line-bounty-tavern",
      title: "La taverne aux affiches retournées",
      description:
        "Dans un port de Paradise, chaque client boit devant une affiche de prime posée face contre table. Le journal évoque les exploits récents de l’équipage du Chapeau de paille. L’aubergiste parle à un Escargophone caché dans une soupière, et les chasseurs de primes viennent de reconnaître ton rire.",
      category: "strategie",
      tags: ["pirate", "chasseurs-de-primes", "grand-line", "journal"],
      paths: [PATHS.PIRATE],
      zones: ["grand-line"],
      rarity: EVENT_RARITY.UNCOMMON,
      minMonth: 9,
      maxMonth: 36,
      choices: [
        {
          id: "drink-with-bounty-hunters",
          text: "Rester à leur table",
          outcomes: [
            { id: "buy-hunters-silence", result: "Une tournée et une histoire bien placée transforment la capture en soirée mémorable.", effects: { fortune: -6000, popularity: 3 }, minimumStats: { fortune: 6000 }, flags: { befriendedBountyTavernHunters: true }, weight: 3 },
            { id: "tavern-brawl", result: "Une chaise part avant la fin de ta phrase. La soupière-Escargophone appelle des renforts.", effects: { health: -5, bounty: 400000 }, fallback: true, weight: 2 },
          ],
        },
        {
          id: "escape-bounty-tavern",
          text: "Sortir par les cuisines",
          outcomes: [
            { id: "quiet-kitchen-exit", result: "Tu traverses les cuisines sous un tablier emprunté et repars avec ton anonymat.", effects: { morale: 2 }, requiredTraits: ["calme"], flags: { escapedBountyTavern: true }, weight: 3 },
            { id: "wrong-kitchen-door", result: "La porte mène à la réserve où trois chasseurs comptaient justement leur arsenal.", effects: { health: -3, popularity: -1 }, fallback: true, weight: 2 },
          ],
        },
      ],
    }),
    createEvent({
      id: "pirate-map-in-rum-barrel",
      title: "La carte au fond du rhum",
      description:
        "Une taverne organise un concours dont le prix est un tonneau jamais ouvert. Sous le double fond, une carte indique une île absente de tous les atlas et porte le sceau effacé d’un ancien équipage pirate.",
      category: "tresor",
      tags: ["pirate", "taverne", "carte", "mystere"],
      paths: [PATHS.PIRATE],
      choices: [
        {
          id: "follow-rum-map",
          text: "Suivre la carte",
          outcomes: [
            {
              id: "charted-island",
              result:
                "Les récifs correspondent aux marques. Tu découvres une petite île couverte de statues tournées vers l’ouest.",
              effects: { morale: 2, fortune: 6000 },
              minimumStats: { ship: 1 },
              flags: { foundRumMapIsland: true, foundTreasureMapFragment: true },
              weight: 3,
            },
            {
              id: "map-trap",
              result:
                "La route conduit à un banc de sable où des pilleurs attendaient les curieux. Tu t’échappes, mais pas gratuitement.",
              effects: { health: -4, fortune: -3000 },
              fallback: true,
              weight: 2,
            },
          ],
        },
        {
          id: "sell-rum-map",
          text: "Vendre la carte",
          outcomes: [
            {
              id: "collector-pays",
              result:
                "Un collectionneur reconnaît le sceau et paie sans négocier. Son empressement rend la vente presque inquiétante.",
              effects: { fortune: 10000 },
              minimumStats: { popularity: 3 },
              flags: { soldMysteriousTreasureMap: true },
              weight: 3,
            },
            {
              id: "map-stolen",
              result:
                "Le prétendu acheteur disparaît par la fenêtre avec la carte pendant que son complice renverse une table.",
              effects: { morale: -2 },
              flags: { stolenTreasureMap: true },
              fallback: true,
              weight: 2,
            },
          ],
        },
      ],
    }),

    createEvent({
      id: "pirate-marine-customs-cutter",
      title: "La patrouille au canon mouillé",
      description:
        "Une petite unité de la Marine bloque la sortie du port après une nuit de tempête. Sa poudre a pris l’eau, son canon est rafistolé et une jeune cadette tente de cacher la panique de ses hommes. Ton pavillon vient d’être reconnu.",
      category: "marine",
      tags: ["pirate", "marine", "fraude", "humour"],
      paths: [PATHS.PIRATE],
      choices: [
        {
          id: "submit-inspection",
          text: "Les laisser monter",
          outcomes: [
            {
              id: "expose-impostors",
              result:
                "Tu reconnais les uniformes mal cousus. Les escrocs abandonnent leur butin et fuient dans leur chaloupe.",
              effects: { fortune: 5000, popularity: 2 },
              requiredTraits: ["rusé"],
              flags: { exposedFakeMarines: true },
              weight: 3,
            },
            {
              id: "supplies-taxed",
              result:
                "Les faux soldats repartent avec plusieurs caisses avant que ton équipage comprenne la supercherie.",
              effects: { fortune: -5000, morale: -2 },
              fallback: true,
              weight: 2,
            },
          ],
        },
        {
          id: "challenge-customs",
          text: "Refuser l’inspection",
          outcomes: [
            {
              id: "impostors-flee",
              result:
                "Un seul coup de semonce suffit : leur navire perd sa fausse cheminée en faisant demi-tour.",
              effects: { morale: 2 },
              minimumStats: { combat: 16 },
              flags: { scaredFakeMarines: true },
              weight: 3,
            },
            {
              id: "real-patrol-alerted",
              result:
                "Les escrocs tirent une fusée avant de fuir. Une véritable patrouille aperçoit le signal.",
              effects: { bounty: 500000 },
              fallback: true,
              weight: 2,
            },
          ],
        },
      ],
    }),

    createEvent({
      id: "pirate-rival-red-sails",
      title: "L’équipage rival",
      description:
        "Un équipage rival bloque l’entrée du port. Sa capitaine — qui possède manifestement quatre dents — exige que tu salues son pavillon.",
      category: "rivalite",
      tags: ["pirate", "rival", "duel"],
      paths: [PATHS.PIRATE],
      zones: STARTING_BLUES,
      rarity: EVENT_RARITY.UNCOMMON,
      important: true,
      choices: [
        {
          id: "duel-alba",
          text: "Défier la capitaine rivale en duel",
          choiceTag: "Honneur",
          outcomes: [
            {
              id: "honorable-victory",
              result:
                "Le duel traverse deux quais et une poissonnerie. La capitaine rivale reconnaît sa défaite et promet une revanche.",
              effects: { combat: 2, popularity: 3 },
              minimumStats: { combat: 18, health: 45 },
              flags: { defeatedAlbaRival: true, sparedAlbaRival: true },
              important: true,
              weight: 4,
            },
            {
              id: "painful-draw",
              result:
                "Aucun de vous ne parvient à conclure. La marée sépare finalement deux capitaines trop épuisés pour protester.",
              effects: { health: -6, morale: 1 },
              fallback: true,
              weight: 3,
            },
          ],
        },
        {
          id: "humiliate-alba",
          text: "Retourner son équipage contre lui",
          choiceTag: "Audace",
          outcomes: [
            {
              id: "crew-laughs-at-alba",
              result:
                "Tu révèles que son terrible pavillon est une nappe volée. Ses propres hommes éclatent de rire.",
              effects: { popularity: 4, morale: 2 },
              requiredTraits: ["charismatique"],
              flags: { humiliatedAlbaRival: true, albaRivalSeeksRevenge: true },
              important: true,
              weight: 3,
            },
            {
              id: "insult-remembered",
              result:
                "La plaisanterie tombe à plat. La capitaine rivale prend la fuite, ton nom gravé sur son sabre.",
              effects: { popularity: -2, morale: -1 },
              flags: { albaRivalEscaped: true, albaRivalSeeksRevenge: true },
              fallback: true,
              weight: 2,
            },
          ],
        },
      ],
    }),

    createEvent({
      id: "pirate-village-protection",
      title: "Le pavillon sur le puits",
      description:
        "Un village côtier verse chaque mois des vivres à un équipage pirate qui promet de le protéger. Cette fois, les protecteurs ne sont pas venus, mais leur pavillon flotte encore sur la place.",
      category: "dilemme",
      tags: ["pirate", "village", "morale", "protection"],
      paths: [PATHS.PIRATE],
      zones: ["grand-line", "red-line", "shinsekai"],
      rarity: EVENT_RARITY.UNCOMMON,
      minMonth: 5,
      maxMonth: 24,
      important: true,
      choices: [
        {
          id: "defend-village",
          text: "Protéger le village",
          choiceTag: "Sacrifice",
          outcomes: [
            {
              id: "villagers-rally",
              result:
                "Tu organises les habitants plutôt que de les traiter en victimes. Ensemble, vous repoussez les pillards.",
              effects: { popularity: 4, health: -2 },
              minimumStats: { morale: 55 },
              flags: { defendedTidewellVillage: true, villagersTrustPirate: true },
              important: true,
              weight: 3,
            },
            {
              id: "costly-defense",
              result:
                "Le village est sauvé, mais ton équipage paie le prix d’une défense improvisée.",
              effects: { health: -5, morale: -1 },
              flags: { defendedTidewellVillage: true },
              fallback: true,
              weight: 2,
            },
          ],
        },
        {
          id: "claim-protection-payment",
          text: "Réclamer les vivres à leur place",
          choiceTag: "Sans retour",
          outcomes: [
            {
              id: "intimidated-village",
              result:
                "Les habitants obéissent en silence. Les réserves sont pleines, mais ton pavillon devient un avertissement.",
              effects: { fortune: 7000, popularity: -4 },
              minimumStats: { combat: 17 },
              flags: { extortedTidewellVillage: true },
              weight: 3,
            },
            {
              id: "village-resists",
              result:
                "Le maire sonne la cloche. Tout le village apparaît avec des casseroles, des fourches et une détermination embarrassante.",
              effects: { popularity: -2, morale: -2 },
              fallback: true,
              weight: 2,
            },
          ],
        },
      ],
    }),

    createEvent({
      id: "pirate-abandoned-marine-brig",
      title: "Le bâtiment sans pavillon",
      description:
        "Un brick de la Marine dérive, voiles intactes et canots absents. Dans la cabine du commandant, un Escargophone répète seulement : « Ordre annulé. Aucun témoin. »",
      category: "mystere",
      tags: ["pirate", "navire-abandonne", "marine", "cipher-pol"],
      paths: [PATHS.PIRATE],
      zones: ["grand-line"],
      minMonth: 9,
      maxMonth: 32,
      important: true,
      choices: [
        {
          id: "search-marine-brig",
          text: "Fouiller le bâtiment",
          choiceTag: "Intuition",
          outcomes: [
            {
              id: "cipher-pol-orders",
              result:
                "Un compartiment dissimulé contient des ordres chiffrés portant le sceau du Cipher Pol.",
              effects: { fortune: 5000 },
              minimumStats: { ship: 2 },
              flags: { foundCipherPolOrders: true, boardedGhostBrig: true },
              important: true,
              weight: 3,
            },
            {
              id: "powder-trap",
              result:
                "Une porte piégée enflamme la poudre d’un pistolet. Tu évites l’explosion principale de justesse.",
              effects: { health: -5 },
              flags: { boardedGhostBrig: true },
              fallback: true,
              weight: 2,
            },
          ],
        },
        {
          id: "tow-marine-brig",
          text: "Remorquer le navire",
          choiceTag: "Prudence",
          outcomes: [
            {
              id: "salvaged-timber",
              result:
                "Le brick ne peut être conservé, mais son bois et ses voiles permettent de renforcer ton propre bâtiment.",
              effects: { ship: 2 },
              minimumStats: { crew: 2 },
              flags: { salvagedMarineBrig: true },
              weight: 3,
            },
            {
              id: "tow-line-breaks",
              result:
                "La ligne casse pendant la nuit. Le bâtiment disparaît dans le brouillard comme s’il n’avait jamais existé.",
              effects: { ship: -1, morale: -1 },
              fallback: true,
              weight: 2,
            },
          ],
        },
      ],
    }),

    createEvent({
      id: "pirate-first-ship",
      title: "La coque aux trois capitaines",
      description:
        "Une vieille caravelle est vendue à l’encan dans un port d’une mer cardinale. Trois frères prétendent chacun en être le capitaine, tandis qu’un crabe occupe déjà la cabine. La Marine arrivera avant la fin de leur dispute.",
      category: "navire",
      tags: ["pirate", "navire", "port"],
      paths: [PATHS.PIRATE],
      zones: STARTING_BLUES,
      maxMonth: 12,
      choices: [
        {
          id: "buy-first-caravel",
          text: "Racheter la caravelle",
          outcomes: [
            { id: "honest-purchase", result: "Les frères acceptent une bourse commune et te remettent trois clés dont une seule fonctionne.", effects: { fortune: -8000, ship: 2 }, minimumStats: { fortune: 8000 }, flags: { acquiredFirstPirateShip: true }, weight: 3 },
            { id: "inherited-debt", result: "L’enchère dissimulait les dettes du navire. Tu gardes la coque, mais le port saisit tes réserves.", effects: { fortune: -5000, ship: 1 }, flags: { acquiredFirstPirateShip: true, inheritedShipDebt: true }, fallback: true, weight: 2 },
          ],
        },
        {
          id: "steal-first-caravel",
          text: "Profiter de la dispute pour appareiller",
          outcomes: [
            { id: "clean-theft", result: "Tu largues les amarres pendant que les frères votent encore. Le crabe conserve sa cabine.", effects: { ship: 2, bounty: 300000 }, minimumStats: { combat: 13 }, flags: { stoleFirstPirateShip: true }, weight: 3 },
            { id: "harbor-chase", result: "La caravelle quitte le quai sous les cris, les casseroles et un tir de semonce de la Marine.", effects: { health: -3, bounty: 500000 }, flags: { stoleFirstPirateShip: true }, fallback: true, weight: 2 },
          ],
        },
      ],
    }),

    createEvent({
      id: "pirate-vice-admiral-wake",
      title: "Dans le sillage d’un vice-amiral",
      description:
        "Un cuirassé commandé par un vice-amiral traverse une zone avancée sans ralentir. Un message capté par Escargophone évoque les survivants d’un Buster Call. Le navire ne poursuit que les menaces qu’il juge dignes de son temps.",
      category: "monde",
      tags: ["pirate", "marine", "vice-amiral", "buster-call"],
      paths: [PATHS.PIRATE],
      zones: ["grand-line", "red-line", "shinsekai"],
      rarity: EVENT_RARITY.RARE,
      minMonth: 13,
      maxMonth: 60,
      choices: [
        {
          id: "follow-vice-admiral",
          text: "Suivre le cuirassé à distance",
          choiceTag: "Risqué",
          outcomes: [
            { id: "hear-buster-call-orders", result: "Tu interceptes un ordre chiffré sur les conséquences d’un Buster Call. Même les soldats parlent à voix basse.", effects: { haki: 1, morale: -1 }, minimumStats: { ship: 2 }, flags: { heardBusterCallOrders: true, followedViceAdmiral: true }, important: true, weight: 3 },
            { id: "lookout-spots-pirates", result: "Une vigie repère ton pavillon. Le cuirassé ne dévie pas, mais transmet ton signalement.", effects: { bounty: 700000 }, fallback: true, weight: 2 },
          ],
        },
        {
          id: "leave-vice-admiral-wake",
          text: "Quitter discrètement son sillage",
          choiceTag: "Sagesse",
          outcomes: [
            { id: "clean-warship-escape", result: "Tu utilises le tumulte laissé par le cuirassé pour disparaître avant le prochain contrôle.", effects: { morale: 2 }, requiredTraits: ["prudent"], flags: { avoidedViceAdmiral: true }, weight: 3 },
            { id: "rushed-rigging", result: "La manœuvre emmêle le gréement. Le cuirassé ne t’avait jamais remarqué.", effects: { ship: -1 }, fallback: true, weight: 2 },
          ],
        },
      ],
    }),

    createEvent({
      id: "pirate-emperor-cargo",
      title: "L’héritage du croissant blanc",
      description:
        "Près de Red Line, un marchand protège un tonneau de médicaments portant l’ancien emblème de Barbe Blanche. Cette cargaison destinée aux îles autrefois sous sa protection attire déjà plusieurs navires. Le marchand demande une escorte, pas des questions.",
      category: "monde",
      tags: ["pirate", "empereur", "barbe-blanche", "red-line"],
      paths: [PATHS.PIRATE],
      zones: ["red-line"],
      rarity: EVENT_RARITY.RARE,
      important: true,
      minMonth: 13,
      maxMonth: 48,
      choices: [
        {
          id: "protect-emperor-medicine",
          text: "Escorter la cargaison",
          choiceTag: "Honneur",
          outcomes: [
            { id: "medicine-delivered", result: "Tu repousses les voleurs sans ouvrir le tonneau. Ton nom rejoint les registres d’un ancien réseau de ravitaillement du Nouveau Monde.", effects: { popularity: 4, health: -3 }, minimumStats: { combat: 17 }, flags: { protectedWhitebeardMedicine: true }, important: true, weight: 3 },
            { id: "medicine-damaged", result: "L’escorte survit, mais plusieurs fioles se brisent. Le marchand n’oubliera ni l’aide ni la perte.", effects: { health: -5, morale: -2 }, flags: { triedProtectingWhitebeardMedicine: true }, fallback: true, weight: 2 },
          ],
        },
        {
          id: "steal-emperor-medicine",
          text: "S’emparer du tonneau",
          choiceTag: "Sans retour",
          outcomes: [
            { id: "emperor-cargo-stolen", result: "Tu prends les médicaments. Leur emblème rend chaque port soudain plus étroit.", effects: { health: 4, bounty: 900000 }, minimumStats: { combat: 18 }, flags: { stoleWhitebeardMedicine: true, angeredEmperorNetwork: true }, important: true, weight: 2 },
            { id: "merchant-escapes", result: "Le marchand déclenche un fumigène et fuit. Des témoins ont parfaitement vu ton pavillon.", effects: { popularity: -3, bounty: 500000 }, fallback: true, weight: 3 },
          ],
        },
      ],
    }),

    createEvent({
      id: "pirate-black-blade-turning-point",
      title: "Une entaille dans l’horizon",
      description:
        "Dans une zone avancée, des survivants jurent que Mihawk, ancien Grand Corsaire, a tranché leur galion depuis une embarcation en forme de cercueil. Toutes les épaves portent la même coupe parfaite. Une voile noire attend au bout du champ de débris.",
      category: "tournant",
      tags: ["pirate", "grand-corsaire", "mihawk"],
      paths: [PATHS.PIRATE],
      zones: ["grand-line", "red-line", "shinsekai"],
      rarity: EVENT_RARITY.VERY_RARE,
      important: true,
      dangerTheme: true,
      minMonth: 13,
      maxMonth: 60,
      choices: [
        {
          id: "approach-black-blade",
          text: "Approcher de la voile noire",
          choiceTag: "Audace",
          outcomes: [
            { id: "endure-black-blade-presence", result: "La lame noire ne se lève pas. Soutenir seulement son regard éveille une perception nouvelle du danger.", effects: { haki: 2, morale: 3 }, minimumStats: { haki: 2, combat: 20 }, flags: { facedMihawkAtDistance: true, survivedBlackBladeTest: true }, important: true, weight: 2 },
            { id: "warning-slash", result: "Une entaille fend la mer devant ta proue. Le message est clair et la retraite immédiate.", effects: { ship: -2, morale: -3 }, flags: { warnedByMihawk: true }, fallback: true, important: true, weight: 3 },
          ],
        },
        {
          id: "rescue-black-blade-survivors",
          text: "Sauver les survivants et repartir",
          choiceTag: "Prudence",
          outcomes: [
            { id: "survivors-swear-loyalty", result: "Les naufragés reconnaissent ton sang-froid et transmettent ton pavillon dans tous les ports.", effects: { crew: 1, popularity: 5 }, minimumStats: { morale: 55 }, flags: { rescuedBlackBladeSurvivors: true }, important: true, weight: 2 },
            { id: "panicked-survivors", result: "Les survivants montent à bord, puis paniquent à la vue de chaque voile sombre.", effects: { morale: -3, health: -2 }, flags: { rescuedBlackBladeSurvivors: true }, fallback: true, weight: 3 },
          ],
        },
      ],
    }),
  ].slice(0, 24);

  const BOUNTY_HUNTER_EVENTS = BOUNTY_HUNTER_BLUE_REVERSE_STORIES.map(
    (story, index) =>
      createFactionStory(PATHS.BOUNTY_HUNTER, "bounty-hunter", index, story),
  );
  const REVOLUTIONARY_EVENTS = REVOLUTIONARY_BLUE_REVERSE_STORIES.map(
    (story, index) =>
      createFactionStory(PATHS.REVOLUTIONARY, "revolutionary", index, story),
  );
  const MARINE_EVENTS = MARINE_BLUE_REVERSE_STORIES.map(
    (story, index) =>
      createFactionStory(PATHS.MARINE, "marine", index, story),
  );

  /* ========================================================
     GRAND LINE — PIRATES (18)
  ======================================================== */

  // GRAND LINE — Événements généraux
  PIRATE_EVENTS.push(
    createGrandLineFactionEvent({
      id: "pirate-grand-line-log-pose-duel", path: PATHS.PIRATE,
      title: "Deux aiguilles pour une route",
      description: "Le Log Pose d’une navigatrice aux lunettes toujours embuées pointe vers une île sûre. Un capitaine vétéran affirme que l’aiguille a été truquée et réclame l’objet.",
      rarity: EVENT_RARITY.COMMON, tags: ["log-pose", "rivalry", "navigation"],
      choices: [
        { id: "defend-pose", text: "Défendre le Log Pose devant les équipages", choiceTag: "Honneur",
          success: { result: "Tu démontres la cohérence du champ magnétique et le capitaine vétéran recule sous les huées.", effects: { morale: 3, popularity: 2 }, minimumStats: { ship: 3 }, flags: { earnedYseeCompassTrust: true, embarrassedBrannFoam: true } },
          setback: { result: "L’aiguille s’affole au pire moment. le capitaine vétéran repart avec les rires du port et une copie de ta route.", effects: { morale: -3, ship: -1 }, flags: { brannFoamKnowsRoute: true } } },
        { id: "trade-readings", text: "Comparer les relevés loin de la foule", choiceTag: "Prudence",
          success: { result: "Les deux aiguilles réagissent à une masse métallique sous-marine. La navigatrice corrige la route à temps.", effects: { ship: 2, morale: 1 }, requiredTraits: ["prudent"], flags: { mappedMagneticAnomaly: true, metYseeCompass: true } },
          setback: { result: "Le capitaine vétéran échange discrètement les cadrans et te laisse suivre une direction capricieuse.", effects: { ship: -2 }, flags: { deceivedByBrannFoam: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "pirate-grand-line-temporary-alliance", path: PATHS.PIRATE,
      title: "Le pacte des trois pavillons",
      description: "Une flotte de la Marine bloque le seul courant praticable. Une capitaine pirate propose une alliance jusqu’au coucher du soleil, puis exige que chacun redevienne ennemi.",
      rarity: EVENT_RARITY.COMMON, tags: ["alliance", "marine", "crew"],
      choices: [
        { id: "accept-alliance", text: "Jurer une alliance jusqu’au crépuscule", choiceTag: "Diplomatie",
          success: { result: "Les trois équipages brisent le blocus sans tirer l’un sur l’autre. La capitaine pirate respecte exactement l’heure convenue.", effects: { ship: 1, morale: 3 }, minimumStats: { crew: 2 }, flags: { alliedWithSolaAnchorfist: true, brokeGrandLineBlockade: true }, important: true },
          setback: { result: "Un équipage panique et coupe la formation. La flotte passe, mais ton gréement paie le désordre.", effects: { ship: -2, morale: -1 }, flags: { unstablePirateAlliance: true } } },
        { id: "use-alliance", text: "Laisser les autres ouvrir le passage", choiceTag: "Ruse",
          success: { result: "Tu profites du chaos et franchis le barrage intact, sous le regard glacé de la capitaine pirate.", effects: { ship: 2 }, requiredTraits: ["rusé"], flags: { betrayedSunsetAlliance: true, solaAnchorfistSeeksDebt: true } },
          setback: { result: "Les canons de la Marine anticipent la manœuvre et te rabattent au centre du combat.", effects: { health: -5, ship: -2 }, flags: { trappedInsideBlockade: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "pirate-grand-line-crew-confidence", path: PATHS.PIRATE,
      title: "La carte clouée au mât",
      description: "Après trois jours de pluie ascendante, une partie de l’équipage veut rebrousser chemin. le tireur, s’il est encore à bord, plante une flèche dans la carte pour réclamer un vote.",
      rarity: EVENT_RARITY.COMMON, tags: ["crew", "mutiny", "weather"],
      choices: [
        { id: "hold-vote", text: "Donner la parole à tout l’équipage", choiceTag: "Sagesse",
          success: { result: "Les griefs éclatent, puis un cap commun est choisi. La confiance ressort cabossée mais réelle.", effects: { morale: 4, crew: 1 }, minimumStats: { morale: 48 }, requiredFlags: { recruitedKipoSniper: true }, flags: { crewChoseGrandLineTogether: true } },
          setback: { result: "Le vote se transforme en concours de cris. Tu gardes le cap, mais les quarts deviennent silencieux.", effects: { morale: -4 }, flags: { grandLineCrewResentment: true } } },
        { id: "prove-route", text: "Prendre seul la barre dans la tempête", choiceTag: "Audace",
          success: { result: "Tu traverses le mur de pluie et rends à l’équipage l’envie d’avancer.", effects: { ship: 2, morale: 2 }, minimumStats: { ship: 4 }, addTraits: ["responsable"], flags: { captainedImpossibleRain: true } },
          setback: { result: "Une vague latérale arrache une vergue. Personne ne quitte le navire, mais personne n’applaudit.", effects: { ship: -3, health: -3 }, flags: { damagedShipProvingRoute: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "pirate-grand-line-public-victory", path: PATHS.PIRATE,
      title: "Le canon qui devait annoncer ta chute",
      description: "Un capitaine pirate fanfaron a convié les journaux à ton exécution publique. Son canon de cérémonie porte toutefois un bouchon de liège géant oublié par son artilleur.",
      rarity: EVENT_RARITY.COMMON, tags: ["public", "rival", "newspaper"],
      choices: [
        { id: "face-ravel", text: "Affronter le capitaine fanfaron sous les objectifs", choiceTag: "Audace",
          success: { result: "Tu renverses le capitaine fanfaron avant que son canon débouche enfin. Le cliché de sa moustache en flammes fait le tour de Paradise.", effects: { combat: 3, bounty: 400000, popularity: 4 }, minimumStats: { combat: 20 }, flags: { publiclyDefeatedRavel: true }, important: true },
          setback: { result: "Le capitaine fanfaron résiste assez longtemps pour transformer le duel en mêlée confuse.", effects: { health: -7, morale: -2 }, flags: { ravelGoldenMustacheRival: true } } },
        { id: "ruin-spectacle", text: "Saboter sa mise en scène", choiceTag: "Ruse",
          success: { result: "Les journaux découvrent les cages vides et les faux témoins. Le capitaine fanfaron fuit sous une pluie de bouchons.", effects: { popularity: 3, morale: 2 }, requiredTraits: ["créatif"], flags: { exposedRavelFraud: true } },
          setback: { result: "Le mécanisme explose trop tôt et détruit surtout l’étal d’un marchand innocent.", effects: { fortune: -10000, popularity: -2 }, flags: { owesGrandLineMerchant: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "pirate-grand-line-vice-admiral-chase", path: PATHS.PIRATE,
      title: "Les boulets du vice-amiral",
      description: "Le vice-amiral chargé de la poursuite poursuit ton pavillon sans relâche. Son navire traverse les changements de climat comme s’il disposait d’un Log Pose pour chacun de ses canons.",
      rarity: EVENT_RARITY.COMMON, tags: ["marine", "vice-admiral", "chase"],
      choices: [
        { id: "cross-cyclone", text: "Traverser le cyclone magnétique", choiceTag: "Risqué",
          success: { result: "Le navire ressort de l’autre côté, voiles déchirées mais hors de portée des canons.", effects: { ship: -1, popularity: 3 }, minimumStats: { ship: 4 }, flags: { escapedViceAdmiralOrme: true } },
          setback: { result: "Le cyclone te rejette dans la ligne de tir. Un boulet traverse deux ponts.", effects: { ship: -3, health: -6 }, flags: { markedByViceAdmiralOrme: true } } },
        { id: "false-wreck", text: "Simuler un naufrage", choiceTag: "Intuition",
          success: { result: "Le vice-amiral chargé de la poursuite passe devant l’épave factice. Son silence laisse penser qu’il a compris et apprécié l’effort.", effects: { morale: 2 }, requiredTraits: ["rusé"], flags: { fooledViceAdmiralOrme: true } },
          setback: { result: "La Marine récupère ton faux pavillon et l’exhibe comme trophée.", effects: { popularity: -3, morale: -2 }, flags: { lostFlagToViceAdmiral: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "pirate-grand-line-broker-offer", path: PATHS.PIRATE,
      title: "Le courtier aux gants blancs",
      description: "Un courtier du marché noir propose la position d’un trésor en échange d’un service futur. Il change de gants à chaque mensonge, et sa malle en contient beaucoup.",
      rarity: EVENT_RARITY.COMMON, tags: ["broker", "black-market", "debt"],
      choices: [
        { id: "accept-debt", text: "Accepter le marché sans demander le service", choiceTag: "Quitte ou double",
          success: { result: "La carte est authentique. Le courtier inscrit ton nom dans un carnet dont les pages semblent blindées.", effects: { fortune: 15000 }, flags: { owesVaroVelvetFavor: true, receivedVaroTreasureMap: true } },
          setback: { result: "La carte mène à un récif déjà pillé. Le courtier considère pourtant la dette comme entière.", effects: { ship: -1, morale: -2 }, flags: { owesVaroVelvetFavor: true, deceivedByVaroVelvet: true } } },
        { id: "counteroffer", text: "Exiger une information vérifiable", choiceTag: "Prudence",
          success: { result: "Le courtier livre l’horaire d’une patrouille et range ses gants avec un sourire contrarié.", effects: { ship: 1, fortune: 5000 }, minimumStats: { popularity: 45 }, flags: { negotiatedWithVaroVelvet: true } },
          setback: { result: "Le courtier retire son offre et vend aussitôt ta position à un autre équipage.", effects: { bounty: 200000 }, flags: { offendedVaroVelvet: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "pirate-grand-line-civilian-or-ship", path: PATHS.PIRATE,
      title: "Le ferry sous la grêle brûlante",
      description: "Une grêle incandescente frappe un ferry civil tandis que ton propre navire prend l’eau. Les deux bâtiments n’ont qu’une seule voile de rechange.",
      rarity: EVENT_RARITY.COMMON, tags: ["civilians", "weather", "dilemma"],
      choices: [
        { id: "save-ferry", text: "Donner la voile aux civils", choiceTag: "Sacrifice",
          success: { result: "Le ferry atteint une bande de ciel clair. Les survivants racontent quel pavillon est resté sous la grêle.", effects: { ship: -2, popularity: 4, morale: 3 }, minimumStats: { morale: 45 }, flags: { savedEmberHailFerry: true }, important: true },
          setback: { result: "La voile se déchire entre les deux coques. Tu sauves les passagers, mais ton navire dérive lourdement.", effects: { ship: -3, health: -3 }, flags: { rescuedFerryPassengers: true } } },
        { id: "save-own-ship", text: "Préserver le navire et guider le ferry", choiceTag: "Pragmatisme",
          success: { result: "Tes signaux conduisent le ferry hors du front sans sacrifier ton gréement.", effects: { ship: 1, morale: 1 }, requiredCombatStyles: ["navigateur"], flags: { guidedEmberHailFerry: true } },
          setback: { result: "Le ferry disparaît dans la vapeur. L’équipage comprend ton choix, mais ne le célèbre pas.", effects: { morale: -5 }, flags: { abandonedEmberHailFerry: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "pirate-grand-line-blue-rival-return", path: PATHS.PIRATE,
      title: "Le retour de la capitaine rivale",
      description: "La capitaine rivale surgit d’un tonneau de provisions, furieux d’avoir voyagé trois îles dans le mauvais navire. Son équipage attend au large et réclame une revanche dont parleront les quatre mers.",
      rarity: EVENT_RARITY.COMMON, tags: ["callback", "rival", "blues"],
      choices: [
        { id: "share-table", text: "Proposer une revanche autour d’une table", choiceTag: "Diplomatie",
          success: { result: "La capitaine rivale reconnaît la dette de clémence et partage une route sûre avant de voler le dessert.", effects: { morale: 3, ship: 1 }, requiredFlags: { sparedAlbaRival: true }, flags: { reconciledWithAlba: true } },
          setback: { result: "Le repas devient une bataille de couverts qui ne règle absolument rien.", effects: { health: -3, morale: 2 }, flags: { albaRivalryContinues: true } } },
        { id: "accept-duel", text: "Accepter le duel sur les vergues", choiceTag: "Honneur",
          success: { result: "Tu remportes le duel sans faire tomber la capitaine rivale. Son équipage salue enfin ton pavillon.", effects: { combat: 2, popularity: 2 }, minimumStats: { combat: 18 }, flags: { defeatedAlbaOnGrandLine: true } },
          setback: { result: "La capitaine rivale coupe la vergue au lieu de combattre dessus, fidèle à sa réputation très personnelle de l’honneur.", effects: { ship: -2, morale: -1 }, requiredFlags: { humiliatedAlbaRival: true }, flags: { albaSabotagedMast: true } } },
      ],
    }),

    // GRAND LINE — Destinations spécifiques
    createGrandLineFactionEvent({
      id: "pirate-grand-line-whispering-captain-treasure", path: PATHS.PIRATE,
      title: "Le coffre du capitaine disparu",
      description: "Aux Récifs Murmurants, chaque vague répète les derniers mots d’un capitaine disparu. Son coffre repose dans une grotte qui répond aux mensonges par des chutes de pierre.",
      zones: ["whispering-reefs"], rarity: EVENT_RARITY.UNCOMMON, tags: ["treasure", "old-captain", "mystery"],
      choices: [
        { id: "speak-truth", text: "Entrer en répondant sincèrement aux murmures", choiceTag: "Sagesse",
          success: { result: "La grotte laisse passer ton équipage et révèle le journal du vieux capitaine avec ses dernières pièces.", effects: { fortune: 18000, morale: 2 }, requiredTraits: ["responsable"], flags: { foundCaptainNoEchoJournal: true } },
          setback: { result: "Une vérité mal formulée déclenche un éboulement aussi susceptible qu’un juge.", effects: { health: -6, fortune: 5000 }, flags: { angeredWhisperingCave: true } } },
        { id: "silence-cave", text: "Couvrir les murmures avec les canons", choiceTag: "Audace",
          success: { result: "La détonation révèle une chambre creuse derrière la paroi.", effects: { fortune: 15000, combat: 1 }, minimumStats: { combat: 20 }, flags: { blastedNoEchoVault: true } },
          setback: { result: "Les récifs renvoient le bruit jusqu’à fendre la coque.", effects: { ship: -3, morale: -2 }, flags: { wokeWhisperingReefs: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "pirate-grand-line-brass-local-lord", path: PATHS.PIRATE,
      title: "Le pavillon sur le Royaume de Cuivre",
      description: "Un pirate local en armure taxe chaque cheminée du Royaume de Cuivre et prétend posséder même la fumée. Des ouvriers demandent que ton pavillon défie le sien.",
      zones: ["kingdom-of-brass"], rarity: EVENT_RARITY.UNCOMMON, tags: ["territory", "local-pirate", "workers"],
      choices: [
        { id: "challenge-duke", text: "Défier le pirate en armure sur la place des Forges", choiceTag: "Audace",
          success: { result: "Le pirate en armure tombe dans sa propre armure articulée. Les ouvriers arrachent son pavillon.", effects: { combat: 3, bounty: 300000, popularity: 3 }, minimumStats: { combat: 22 }, flags: { freedBrassKingdomForges: true, defeatedDukeTinwhite: true }, important: true },
          setback: { result: "Son armure absorbe les premiers coups et ses hommes te repoussent vers les canaux de refroidissement.", effects: { health: -8, morale: -2 }, flags: { dukeTinwhiteEnemy: true } } },
        { id: "organize-workers", text: "Aider les ouvriers à reprendre les forges", choiceTag: "Rébellion",
          success: { result: "Les marteaux couvrent les ordres du tyran. Le royaume se libère sans changer de maître pirate.", effects: { morale: 4, popularity: 2 }, requiredTraits: ["charismatique"], flags: { armedBrassWorkers: true, helpedBrassTerritory: true } },
          setback: { result: "Un contremaître vend le plan à le pirate en armure et les ateliers ferment.", effects: { morale: -4, fortune: -8000 }, flags: { betrayedByBrassForeman: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "pirate-grand-line-port-azur-doctor", path: PATHS.PIRATE,
      title: "Le médecin aux remèdes salés",
      description: "À Port-Azur, le médecin de la clinique flottante soigne pirates et soldats avec les mêmes grimaces. Sa clinique flottante est saisie par un prêteur qui confond intérêts et nombre de pansements.",
      zones: ["port-azur"], rarity: EVENT_RARITY.UNCOMMON, tags: ["recruitment", "doctor", "debt"],
      important: true,
      choices: [
        { id: "free-clinic", text: "Racheter la clinique sans discuter", choiceTag: "Sacrifice",
          success: { result: "Le médecin rembourse ta générosité en rejoignant l’équipage avec une armoire entière de sirops imbuvables.", effects: { fortune: -12000, crew: 1 }, minimumStats: { fortune: 12000 }, flags: { recruitedTomaSaltDoctor: true, freedFloatingClinic: true }, combatStyle: "medecin", important: true },
          setback: { result: "Le prêteur augmente le prix au moment de signer. Le médecin sauve ses instruments, mais reste à quai.", effects: { fortune: -8000, morale: -2 }, flags: { helpedTomaSaltDoctor: true } } },
        { id: "expose-lender", text: "Retourner ses registres contre le prêteur", choiceTag: "Ruse",
          success: { result: "Les dettes inventées apparaissent dans le journal local. La clinique reste libre et le médecin devient un allié sûr.", effects: { popularity: 2, morale: 2 }, requiredTraits: ["rusé"], flags: { exposedPortAzurLender: true, alliedWithTomaSaltDoctor: true } },
          setback: { result: "Les registres sont écrits dans un code qui ressemble à des ordonnances. Le prêteur appelle ses gardes.", effects: { health: -4, fortune: -5000 }, flags: { portAzurLenderEnemy: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "pirate-grand-line-seven-currents-pose", path: PATHS.PIRATE,
      title: "Les aiguilles affolées de Sabaody",
      description: "Dans l’Archipel des Sabaody, le Log Pose s’affole entre les mangroves géants. Des pilotes jurent chacun connaître l’unique passage parmi les racines et les bulles de résine.",
      zones: ["seven-current-archipelago"], rarity: EVENT_RARITY.UNCOMMON, tags: ["log-pose", "currents", "navigation"],
      choices: [
        { id: "trust-ysee", text: "Confier les relevés à la navigatrice", choiceTag: "Intuition",
          success: { result: "La navigatrice superpose les trajectoires et découvre que chaque pilote décrit un passage praticable à une heure différente.", effects: { ship: 3 }, requiredFlags: { earnedYseeCompassTrust: true }, flags: { masteredSevenCurrentCycle: true } },
          setback: { result: "Sans assez de relevés, l’équipage boucle deux fois autour du même mangrove, sous les rires des artisans enduiseurs.", effects: { morale: -2, ship: -1 }, flags: { lostInSevenCurrents: true } } },
        { id: "hire-pilots", text: "Engager tous les pilotes", choiceTag: "Quitte ou double",
          success: { result: "Leurs disputes produisent accidentellement une navigation parfaite.", effects: { fortune: -10000, ship: 2 }, flags: { hiredSevenQuarrelingPilots: true } },
          setback: { result: "Les pilotes quittent le navire dans des bulles différentes en emportant chacun une partie du paiement.", effects: { fortune: -12000, morale: -1 }, flags: { cheatedBySevenPilots: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "pirate-grand-line-port-azur-warlord-rumor", path: PATHS.PIRATE,
      title: "La table réservée à l’ancien Grand Corsaire",
      description: "Une taverne de Port-Azur garde chaque soir une table vide au nom d’un ancien Grand Corsaire. Depuis l’abolition du système, un courtier du marché noir vend pourtant des invitations numérotées à ceux qui espèrent contacter son réseau.",
      zones: ["port-azur"], rarity: EVENT_RARITY.UNCOMMON, tags: ["warlord", "rumor", "broker"],
      choices: [
        { id: "buy-invitation", text: "Acheter une invitation et observer", choiceTag: "Prudence",
          success: { result: "L’ancien Grand Corsaire ne vient pas, mais un intermédiaire laisse une liste de capitaines surveillés où figure ton nom.", effects: { bounty: 200000 }, flags: { seenWarlordWatchlist: true, watchedByWarlordNetwork: true } },
          setback: { result: "L’invitation est un menu de desserts particulièrement coûteux.", effects: { fortune: -8000, morale: 1 }, flags: { boughtVaroDessertMenu: true } } },
        { id: "take-table", text: "S’asseoir à la table réservée", choiceTag: "Audace",
          success: { result: "Personne ne vient te chasser. Le geste nourrit une rumeur plus grande que la soirée.", effects: { popularity: 3, morale: 2 }, minimumStats: { popularity: 50 }, flags: { claimedWarlordTable: true } },
          setback: { result: "Douze courtiers réclament simultanément les frais de réservation.", effects: { fortune: -10000, popularity: -1 }, flags: { angeredPortAzurBrokers: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "pirate-grand-line-whispering-shipwreck", path: PATHS.PIRATE,
      title: "Le navire qui appelle par ton nom",
      description: "Une épave coincée dans les Récifs Murmurants imite la voix de chaque membre d’équipage. Elle promet un trésor différent à chacun et une sortie à personne.",
      zones: ["whispering-reefs"], rarity: EVENT_RARITY.UNCOMMON, tags: ["mystery", "crew", "shipwreck"],
      choices: [
        { id: "board-together", text: "Monter à bord sans séparer l’équipage", choiceTag: "Prudence",
          success: { result: "Les voix perdent leur pouvoir face aux réponses collectives. Une ancienne boussole est sauvée de la cabine.", effects: { crew: 1, morale: 3 }, minimumStats: { morale: 55 }, flags: { resistedWhisperingWreck: true } },
          setback: { result: "Les promesses divisent le groupe assez longtemps pour qu’une lame de récif frappe la coque.", effects: { ship: -2, morale: -3 }, flags: { crewHeardWhisperingPromises: true } } },
        { id: "burn-wreck", text: "Incendier l’épave depuis le large", choiceTag: "Pragmatisme",
          success: { result: "La fumée révèle un courant invisible qui traverse les récifs.", effects: { ship: 2 }, requiredTraits: ["pragmatique"], flags: { revealedWhisperingCurrent: true } },
          setback: { result: "Le feu saute sur une nappe d’huile et te force à une retraite précipitée.", effects: { health: -4, ship: -1 }, flags: { burnedWhisperingWaters: true } } },
      ],
    }),

    // GRAND LINE — Événements rares
    createGrandLineFactionEvent({
      id: "pirate-grand-line-rare-bounty-surge", path: PATHS.PIRATE,
      title: "La une aux cent millions de mensonges",
      description: "Un journal attribue à ton équipage la chute simultanée de trois forts que tu n’as jamais vus. La nouvelle fait bondir ta prime tandis que les vrais responsables approchent.",
      rarity: EVENT_RARITY.RARE, tags: ["bounty", "newspaper", "public"],
      important: true,
      choices: [
        { id: "claim-story", text: "Assumer publiquement la légende", choiceTag: "Quitte ou double",
          success: { result: "La foule adopte ta version avant que les faits arrivent. Ta prime entre dans une nouvelle catégorie.", effects: { bounty: 700000, popularity: 5, morale: 3 }, minimumStats: { popularity: 65 }, flags: { claimedThreeFortLegend: true, huntedByThreeFortCrew: true }, important: true },
          setback: { result: "Les véritables vainqueurs diffusent les preuves et jurent de laver leur honneur.", effects: { bounty: 400000, popularity: -4 }, flags: { exposedThreeFortClaim: true, threeFortCrewEnemy: true }, important: true } },
        { id: "correct-record", text: "Faire publier un démenti", choiceTag: "Honneur",
          success: { result: "Le démenti révèle tes exploits réels et attire un respect moins spectaculaire mais plus solide.", effects: { bounty: 300000, popularity: 3 }, requiredTraits: ["responsable"], flags: { correctedThreeFortStory: true } },
          setback: { result: "Le journal imprime ton démenti sous la rubrique des plaisanteries.", effects: { popularity: -2, morale: -2 }, flags: { mockedByGrandLinePress: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "pirate-grand-line-rare-haki-veteran", path: PATHS.PIRATE,
      title: "Le vétéran qui frappe sans toucher",
      description: "Un vétéran du Nouveau Monde arrête une rixe d’un regard et fend une chope sans la toucher. Il propose une leçon de Fluide de l’Armement en échange d’un duel honnête.",
      rarity: EVENT_RARITY.RARE, tags: ["haki", "veteran", "training"],
      choices: [
        { id: "accept-training", text: "Accepter le duel de le vétéran", choiceTag: "Honneur",
          success: { result: "Tu commences à sentir l’instant où sa volonté durcit avant son poing.", effects: { haki: 2, combat: 2, health: -4 }, minimumStats: { combat: 24 }, addTraits: ["discipliné"], flags: { trainedWithGaroCalmhand: true } },
          setback: { result: "Le vétéran t’envoie dans un tonneau et affirme que le tonneau a mieux compris la leçon.", effects: { health: -7, morale: -1 }, flags: { challengedGaroCalmhand: true } } },
        { id: "observe-garo", text: "Observer son geste plutôt que combattre", choiceTag: "Sagesse",
          success: { result: "Ton attention saisit le déplacement avant l’impact, première intuition du Fluide de l’Observation.", effects: { haki: 1, morale: 2 }, requiredTraits: ["patient"], flags: { observedGaroHaki: true } },
          setback: { result: "Le vétéran commande douze autres boissons et te présente l’addition comme un exercice d’attention.", effects: { fortune: -6000, morale: 1 }, flags: { paidGaroLesson: true } } },
      ],
    }),

    // GRAND LINE — Événements très rares
    createGrandLineFactionEvent({
      id: "pirate-grand-line-very-rare-warlord-shadow", path: PATHS.PIRATE,
      title: "L’ombre sur la mer coupée",
      description: "Une entaille parfaite traverse un banc de brouillard devant ton navire. Au loin, une silhouette associée aux Grands Corsaires referme lentement une lame sans prendre la peine de regarder.",
      rarity: EVENT_RARITY.VERY_RARE, tags: ["warlord", "haki", "legend"],
      important: true,
      choices: [
        { id: "hold-course", text: "Maintenir le cap sans provoquer la silhouette", choiceTag: "Sang-froid",
          success: { result: "Tu franchis la coupure dans la mer sans détourner les yeux. L’équipage comprend l’écart qui reste à combler.", effects: { haki: 2, morale: 4 }, minimumStats: { haki: 3, morale: 55 }, flags: { crossedWarlordBladeWake: true }, important: true },
          setback: { result: "La pression suffit à faire céder une partie du gréement avant que la silhouette disparaisse.", effects: { ship: -3, morale: -3 }, flags: { shakenByWarlordShadow: true } } },
        { id: "follow-wake", text: "Suivre la trace laissée sur l’eau", choiceTag: "Sans retour",
          success: { result: "La trace mène à un cimetière de navires et au journal d’un capitaine disparu.", effects: { fortune: 20000, haki: 1 }, minimumStats: { ship: 5 }, flags: { foundWarlordShipGraveyard: true } },
          setback: { result: "Le sillage se referme comme une mâchoire et broie le gouvernail.", effects: { ship: -3, health: -5 }, flags: { lostRudderInBladeWake: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "pirate-grand-line-very-rare-kings-pressure", path: PATHS.PIRATE,
      title: "Le silence de mille volontés",
      description: "Deux flottes rivales s’immobilisent lorsqu’une volonté inconnue balaie l’horizon. Les plus faibles s’effondrent, tandis qu’un coffre sans pavillon dérive entre les navires.",
      rarity: EVENT_RARITY.VERY_RARE, tags: ["haki", "kings-haki", "mystery"],
      dangerTheme: true,
      choices: [
        { id: "protect-crew", text: "Rester debout auprès de l’équipage", choiceTag: "Volonté",
          success: { result: "Tu maintiens les tiens conscients sans comprendre encore la force qui vient de passer.", effects: { haki: 3, morale: 4 }, requiresD: true, minimumStats: { haki: 5 }, flags: { enduredUnknownKingsHaki: true }, important: true },
          setback: { result: "Tu te réveilles le dernier, la main toujours serrée autour du gouvernail.", effects: { morale: -3, health: -3 }, flags: { overwhelmedByUnknownWill: true } } },
        { id: "recover-chest", text: "Profiter du silence pour récupérer le coffre", choiceTag: "Audace",
          success: { result: "Le coffre contient des Eternal Pose brisés et une lettre évoquant un ancien équipage.", effects: { fortune: 18000, ship: 1 }, minimumStats: { morale: 60 }, flags: { recoveredWillstormChest: true } },
          setback: { result: "Les flottes se réveillent ensemble et prennent ton navire pour responsable.", effects: { bounty: 500000, ship: -2 }, flags: { blamedForWillstorm: true } } },
      ],
    })
  );

  /* ========================================================
     GRAND LINE — MARINE (18)
  ======================================================== */

  // GRAND LINE — Événements généraux
  MARINE_EVENTS.push(
    createGrandLineFactionEvent({
      id: "marine-grand-line-official-escort", path: PATHS.MARINE,
      title: "Le navire aux rideaux fermés",
      description: "Une commandante de la Marine te confie l’escorte d’un bâtiment officiel. Ses passagers exigent que les civils s’écartent du courant, mais refusent d’ouvrir leurs rideaux.",
      rarity: EVENT_RARITY.COMMON, tags: ["escort", "government", "civilians"],
      choices: [
        { id: "secure-convoy", text: "Maintenir la formation officielle", choiceTag: "Devoir",
          success: { result: "L’escorte traverse le front climatique sans perdre un bâtiment.", effects: { ship: 2, morale: 1 }, minimumStats: { ship: 4 }, flags: { completedCurtainedEscort: true, earnedAvelineTrust: true } },
          setback: { result: "Les manœuvres imposées provoquent une collision avec un caboteur civil.", effects: { ship: -2, popularity: -2 }, flags: { officialEscortCollision: true } } },
        { id: "inspect-passengers", text: "Exiger l’identité des passagers", choiceTag: "Justice",
          success: { result: "Les rideaux cachent un comptable recherché et des registres de détournement.", effects: { popularity: 3, morale: 2 }, requiredTraits: ["responsable"], flags: { exposedEscortEmbezzlement: true } },
          setback: { result: "L’ordre est authentique et ton inspection déclenche une plainte politique immédiate.", effects: { morale: -2, popularity: -1 }, flags: { censuredForEscortInspection: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "marine-grand-line-dangerous-crew-operation", path: PATHS.MARINE,
      title: "Les Pirates du Matin Rouge",
      description: "Un équipage expérimenté attaque les navires-hôpitaux à l’aube. Son capitaine, un pirate blessé, promet de se rendre si la Marine soigne aussi ses blessés.",
      rarity: EVENT_RARITY.COMMON, tags: ["pirates", "operation", "medical"],
      choices: [
        { id: "accept-surrender", text: "Garantir des soins à tous les blessés", choiceTag: "Honneur",
          success: { result: "Le capitaine blessé tient parole et remet ses armes. Les médecins travaillent sans demander de pavillon.", effects: { morale: 4, popularity: 3 }, minimumStats: { morale: 50 }, flags: { capturedRedMorningCrew: true, treatedPirateWounded: true }, important: true },
          setback: { result: "Une partie de l’équipage profite des soins pour s’échapper dans la brume.", effects: { morale: -2 }, flags: { redMorningFugitives: true } } },
        { id: "storm-deck", text: "Prendre leur pont avant le lever du soleil", choiceTag: "Audace",
          success: { result: "L’assaut désarme l’équipage avant qu’il n’utilise les navires-hôpitaux comme écran.", effects: { combat: 3, health: -3 }, minimumStats: { combat: 21 }, flags: { stormedRedMorningDeck: true } },
          setback: { result: "Le combat s’étire parmi les blessés et laisse une victoire amère.", effects: { health: -7, morale: -4 }, flags: { costlyRedMorningRaid: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "marine-grand-line-sieged-base", path: PATHS.MARINE,
      title: "La base aux canons muets",
      description: "La base G-Prime est assiégée par des pirates et ses canons refusent de tirer : l’intendant a rangé les boulets par couleur au lieu du calibre.",
      rarity: EVENT_RARITY.COMMON, tags: ["base", "siege", "ally"],
      choices: [
        { id: "organize-defense", text: "Réorganiser la défense avec l’intendant", choiceTag: "Discipline",
          success: { result: "L’intendant transforme son classement absurde en chaîne logistique efficace et la base tient.", effects: { combat: 2, morale: 3 }, requiredTraits: ["organisé"], flags: { defendedGPrimeBase: true, alliedWithInspectorPloc: true } },
          setback: { result: "Les boulets bleus correspondent finalement aux canons rouges. La première salve détruit une cuisine.", effects: { morale: -2, fortune: -6000 }, flags: { gPrimeKitchenDestroyed: true } } },
        { id: "break-siege", text: "Sortir affronter le navire amiral", choiceTag: "Audace",
          success: { result: "La sortie surprend les assiégeants et force leur capitaine à rompre le blocus.", effects: { combat: 3, popularity: 3 }, minimumStats: { combat: 23 }, flags: { brokeGPrimeSiege: true } },
          setback: { result: "Le navire amiral feint la fuite et te prend entre deux bordées.", effects: { health: -6, ship: -2 }, flags: { caughtInGPrimeCrossfire: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "marine-grand-line-vice-admiral-order", path: PATHS.MARINE,
      title: "L’ordre du vice-amiral chargé de la poursuite",
      description: "Le vice-amiral chargé de la poursuite ordonne de poursuivre un capitaine dangereux malgré un village pris dans une trombe marine. Son Escargophone répète l’ordre avec une voix beaucoup trop joyeuse.",
      rarity: EVENT_RARITY.COMMON, tags: ["vice-admiral", "order", "civilians"],
      choices: [
        { id: "obey-pursuit", text: "Poursuivre la cible", choiceTag: "Devoir",
          success: { result: "La poursuite se termine par une arrestation nette avant le prochain front.", effects: { combat: 2, popularity: 2 }, minimumStats: { ship: 4 }, flags: { obeyedOrmePursuitOrder: true, capturedCycloneCaptain: true } },
          setback: { result: "La cible s’échappe et les nouvelles du village arrivent avant ton rapport.", effects: { morale: -4, popularity: -3 }, flags: { failedOrmePursuit: true } } },
        { id: "save-village", text: "Détourner l’unité vers le village", choiceTag: "Justice",
          success: { result: "Les habitants survivent et le vice-amiral chargé de la poursuite exige ton rapport en personne.", effects: { morale: 4, popularity: 3 }, requiredTraits: ["compatissant"], flags: { savedWaterspoutVillage: true, defiedViceAdmiralOrme: true }, important: true },
          setback: { result: "Le sauvetage réussit partiellement, mais plusieurs navires de l’unité sont endommagés.", effects: { ship: -2, morale: 1 }, flags: { defiedViceAdmiralOrme: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "marine-grand-line-cipher-pol-inquiry", path: PATHS.MARINE,
      title: "L’agent au masque de verre",
      description: "Une agente du Cipher Pol exige la disparition d’un dossier. Son masque transparent ne cache rien, sauf peut-être le fait qu’elle en porte un second dessous.",
      rarity: EVENT_RARITY.COMMON, tags: ["cipher-pol", "investigation", "secret"],
      choices: [
        { id: "preserve-file", text: "Mettre le dossier sous scellés de la Marine", choiceTag: "Justice",
          success: { result: "Une copie atteint la commandante avant que l’agente du Cipher Pol ne puisse agir.", effects: { morale: 3 }, minimumStats: { popularity: 45 }, flags: { preservedCipherPolFile: true, cipherAgentGlassEnemy: true } },
          setback: { result: "Le dossier disparaît pendant le transfert et ton sceau reste sur une chemise vide.", effects: { morale: -3 }, flags: { cipherPolStoleFile: true } } },
        { id: "follow-verre", text: "Feindre d’obéir et suivre l’agente du Cipher Pol", choiceTag: "Intuition",
          success: { result: "La filature révèle une réunion entre l’agent et le commodore le commodore corrompu.", effects: { popularity: 1, morale: 2 }, requiredTraits: ["patient"], flags: { discoveredGlassRonceMeeting: true } },
          setback: { result: "L’agente du Cipher Pol te conduit jusqu’à une blanchisserie et disparaît parmi cinquante masques identiques.", effects: { fortune: -4000, morale: -1 }, flags: { lostCipherAgentGlass: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "marine-grand-line-falsified-reports", path: PATHS.MARINE,
      title: "Les victoires du commodore corrompu",
      description: "Le commodore corrompu revendique onze victoires dans des rapports impeccables. Les onze équipages pirates concernés continuent pourtant d’envoyer des cartes postales.",
      rarity: EVENT_RARITY.COMMON, tags: ["corruption", "reports", "officer"],
      choices: [
        { id: "audit-reports", text: "Comparer les rapports aux registres portuaires", choiceTag: "Prudence",
          success: { result: "Les horaires prouvent la fraude et relient le commodore corrompu à des saisies revendues.", effects: { popularity: 2, morale: 3 }, requiredFlags: { reportedCommanderSoria: true }, flags: { exposedCommodoreRonce: true } },
          setback: { result: "Le commodore corrompu a remplacé les registres par des menus de cantine soigneusement tamponnés.", effects: { morale: -2 }, flags: { ronceDestroyedRecords: true } } },
        { id: "confront-ronce", text: "Le confronter devant ses officiers", choiceTag: "Honneur",
          success: { result: "Deux officiers témoignent et le commodore corrompu perd le contrôle de sa propre mise en scène.", effects: { popularity: 3 }, minimumStats: { popularity: 55 }, flags: { officersTurnedAgainstRonce: true } },
          setback: { result: "Le commodore corrompu transforme l’accusation en insubordination et te retire le commandement du jour.", effects: { morale: -3, popularity: -1 }, flags: { targetedByCommodoreRonce: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "marine-grand-line-important-prisoner", path: PATHS.MARINE,
      title: "Le prisonnier qui connaît trois noms",
      description: "Un ancien agent de Baroque Works affirme connaître trois complices encore infiltrés. Il donnera un nom pour sa sécurité, un autre pour sa liberté et gardera le troisième « pour les jours de pluie ».",
      rarity: EVENT_RARITY.COMMON, tags: ["baroque-works", "prisoner", "intelligence"],
      choices: [
        { id: "protect-prisoner", text: "Garantir sa protection, pas sa liberté", choiceTag: "Justice",
          success: { result: "Le premier nom mène à une cellule active et le prisonnier accepte finalement de témoigner.", effects: { morale: 2, popularity: 2 }, requiredTraits: ["responsable"], flags: { protectedBaroqueWitness: true, uncoveredBaroqueCell: true } },
          setback: { result: "Une fuite interne révèle son transfert et force la Marine à changer de route.", effects: { ship: -1, morale: -2 }, flags: { baroqueWorksKnowsTransfer: true } } },
        { id: "offer-freedom", text: "Négocier sa liberté contre les trois noms", choiceTag: "Pragmatisme",
          success: { result: "Les trois renseignements sont vérifiés avant sa disparition dans un port bondé.", effects: { popularity: 1, fortune: 5000 }, flags: { tradedFreedomForBaroqueNames: true } },
          setback: { result: "Deux noms sont faux et le troisième appartient à son ancien tailleur.", effects: { morale: -3 }, flags: { deceivedByBaroquePrisoner: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "marine-grand-line-multi-unit-operation", path: PATHS.MARINE,
      title: "Quatre unités, cinq commandants",
      description: "Une opération coordonnée doit encercler une flotte de contrebandiers. Cinq commandants donnent des horaires différents, dont un fixé à hier.",
      rarity: EVENT_RARITY.COMMON, tags: ["coordination", "smugglers", "command"],
      choices: [
        { id: "single-plan", text: "Imposer un plan commun aux unités", choiceTag: "Discipline",
          success: { result: "La formation se referme au même instant et saisit la cargaison sans combat prolongé.", effects: { morale: 3, popularity: 2 }, requiredTraits: ["organisé"], flags: { coordinatedFourMarineUnits: true } },
          setback: { result: "Deux commandants refusent le changement et ouvrent un passage involontaire.", effects: { morale: -3, ship: -1 }, flags: { fracturedMarineCoordination: true } } },
        { id: "adapt-signals", text: "Adapter les signaux en pleine opération", choiceTag: "Intuition",
          success: { result: "Tes pavillons corrigent les décalages avant que les contrebandiers comprennent.", effects: { ship: 2, combat: 1 }, requiredCombatStyles: ["navigateur"], flags: { improvisedMarineSignals: true } },
          setback: { result: "Un signal inversé déclenche trois salves de semonce dans trois directions inutiles.", effects: { fortune: -7000, popularity: -1 }, flags: { marineSignalConfusion: true } } },
      ],
    }),

    // GRAND LINE — Destinations spécifiques
    createGrandLineFactionEvent({
      id: "marine-grand-line-brass-tax-riot", path: PATHS.MARINE,
      title: "Les taxes du Royaume de Cuivre",
      description: "Au Royaume de Cuivre, les collecteurs saisissent jusqu’aux casseroles. La population bloque le port tandis que le ministre du royaume exige une intervention de la Marine.",
      zones: ["kingdom-of-brass"], rarity: EVENT_RARITY.UNCOMMON, tags: ["kingdom", "taxes", "politics"],
      choices: [
        { id: "protect-civilians", text: "Séparer les soldats des manifestants", choiceTag: "Justice",
          success: { result: "La journée s’achève sans tir et les comptes du ministre deviennent publics.", effects: { morale: 4, popularity: 3 }, minimumStats: { morale: 50 }, flags: { protectedBrassProtesters: true, ministerTalcHostile: true }, important: true },
          setback: { result: "Une provocation déclenche une charge avant que la ligne ne soit stabilisée.", effects: { health: -4, morale: -3 }, flags: { brassRiotEscalated: true } } },
        { id: "enforce-order", text: "Dégager le port selon l’ordre reçu", choiceTag: "Devoir",
          success: { result: "Le port rouvre rapidement, mais les regards suivent chaque uniforme.", effects: { popularity: -2, fortune: 6000 }, flags: { enforcedBrassTaxOrder: true } },
          setback: { result: "Les manifestants déplacent le blocage dans toutes les rues à la fois.", effects: { morale: -3, popularity: -2 }, flags: { failedBrassCrackdown: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "marine-grand-line-port-azur-promotion", path: PATHS.MARINE,
      title: "Les galons de Port-Azur",
      description: "La commandante propose une promotion après une opération réussie. Le poste appartenait à un officier disparu dont l’enquête vient d’être classée beaucoup trop vite.",
      zones: ["port-azur"], rarity: EVENT_RARITY.UNCOMMON, tags: ["promotion", "investigation", "hierarchy"],
      important: true,
      choices: [
        { id: "accept-rank", text: "Accepter les galons et rouvrir l’enquête", choiceTag: "Devoir",
          success: { result: "Le nouveau rang donne accès aux dossiers scellés et révèle la signature du commodore corrompu.", effects: { popularity: 3, morale: 3 }, minimumStats: { popularity: 60 }, flags: { promotedAtPortAzur: true, reopenedMissingOfficerCase: true }, important: true },
          setback: { result: "Les dossiers ont été déplacés avant ta prise de fonction.", effects: { morale: -2 }, flags: { promotedAtPortAzur: true, promotionFilesMissing: true } } },
        { id: "delay-promotion", text: "Refuser tant que l’officier n’est pas retrouvé", choiceTag: "Honneur",
          success: { result: "La commandante respecte la décision et confie l’enquête sans condition de grade.", effects: { morale: 4 }, requiredTraits: ["responsable"], flags: { refusedPortAzurPromotion: true, earnedAvelineRespect: true } },
          setback: { result: "La hiérarchie nomme le commodore corrompu à ta place et ferme définitivement les archives.", effects: { morale: -4 }, flags: { ronceTookPortAzurPost: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "marine-grand-line-whispering-cipher-archive", path: PATHS.MARINE,
      title: "Les archives sous les récifs",
      description: "Aux Récifs Murmurants, une chambre étanche contient des rapports du Cipher Pol. Les murs répètent chaque nom lu à voix haute jusque dans la baie.",
      zones: ["whispering-reefs"], rarity: EVENT_RARITY.UNCOMMON, tags: ["cipher-pol", "archive", "mystery"],
      choices: [
        { id: "copy-silently", text: "Copier les dossiers sans prononcer un nom", choiceTag: "Prudence",
          success: { result: "L’enquêteur rejoint ton unité avec les copies cousues dans sa veste à rayures.", effects: { crew: 1, morale: 2 }, requiredTraits: ["patient"], flags: { recruitedSennMarineInvestigator: true, copiedCipherReefFiles: true }, important: true },
          setback: { result: "Un éternuement de l’enquêteur réveille l’écho et annonce votre présence à toute la baie.", effects: { health: -3, morale: -1 }, flags: { exposedAtCipherReefArchive: true } } },
        { id: "seal-archive", text: "Sceller la chambre pour une unité spécialisée", choiceTag: "Devoir",
          success: { result: "Le sceau tient et la commandante reçoit les coordonnées complètes.", effects: { popularity: 2 }, flags: { securedCipherReefArchive: true } },
          setback: { result: "À votre retour, la chambre est vide et le sceau repose soigneusement plié.", effects: { morale: -3 }, flags: { cipherPolClearedReefArchive: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "marine-grand-line-seven-current-rescue", path: PATHS.MARINE,
      title: "Le convoi sous les mangroves",
      description: "Un convoi de réfugiés se disperse entre les racines de l’Archipel des Sabaody. L’ordre officiel réserve les remorqueurs au transport d’un coffre gouvernemental.",
      zones: ["seven-current-archipelago"], rarity: EVENT_RARITY.UNCOMMON, tags: ["rescue", "convoy", "government"],
      choices: [
        { id: "use-tugs", text: "Envoyer les remorqueurs vers les réfugiés", choiceTag: "Justice",
          success: { result: "Les groupes sont ramenés un à un sous les mangroves. Le coffre arrive plus tard, parfaitement capable d’attendre.", effects: { popularity: 4, morale: 4 }, minimumStats: { ship: 4 }, flags: { rescuedSevenCurrentRefugees: true, delayedGovernmentChest: true }, important: true },
          setback: { result: "Deux remorqueurs se percutent dans un changement de courant.", effects: { ship: -2, health: -3 }, flags: { attemptedSevenCurrentRescue: true } } },
        { id: "split-unit", text: "Diviser l’unité entre le coffre et le convoi", choiceTag: "Prudence",
          success: { result: "Une navigation précise sauve les familles tout en maintenant l’escorte.", effects: { ship: 2, morale: 2 }, requiredCombatStyles: ["navigateur"], flags: { balancedSevenCurrentMission: true } },
          setback: { result: "Les forces dispersées récupèrent le coffre mais perdent plusieurs embarcations civiles.", effects: { morale: -4, popularity: -3 }, flags: { lostSevenCurrentBoats: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "marine-grand-line-port-azur-baroque", path: PATHS.MARINE,
      title: "Le bureau sans employés",
      description: "À Port-Azur, une agence de cactus vend des itinéraires aux marchands. La nuit, d’anciens agents réemploient les codes de Baroque Works pour guider des pillards vers leurs cargaisons.",
      zones: ["port-azur"], rarity: EVENT_RARITY.UNCOMMON, tags: ["baroque-works", "investigation", "trade"],
      choices: [
        { id: "raid-office", text: "Perquisitionner l’agence au grand jour", choiceTag: "Devoir",
          success: { result: "Les faux employés sont arrêtés avec leurs listes de cibles.", effects: { combat: 2, popularity: 2 }, minimumStats: { combat: 20 }, flags: { raidedPortAzurBaroqueOffice: true } },
          setback: { result: "L’agence se vide par un plancher escamotable et ne laisse que des cactus indignés.", effects: { morale: -2, health: -2 }, flags: { baroqueAgentsEscapedPortAzur: true } } },
        { id: "feed-false-route", text: "Leur vendre une fausse route commerciale", choiceTag: "Ruse",
          success: { result: "Plusieurs agents se rassemblent au même faux rendez-vous.", effects: { morale: 3, fortune: 6000 }, requiredTraits: ["rusé"], flags: { trappedPortAzurBaroqueAgents: true } },
          setback: { result: "Les héritiers du réseau identifient la source et inscrivent ton unité sur leur liste.", effects: { popularity: -1 }, flags: { targetedByBaroqueWorks: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "marine-grand-line-brass-forge-sabotage", path: PATHS.MARINE,
      title: "Les fusils qui tirent en arrière",
      description: "Une forge du Royaume de Cuivre livre des armes défectueuses à la Marine. La propriétaire jure qu’un saboteur transforme chaque mécanisme pendant la pause déjeuner.",
      zones: ["kingdom-of-brass"], rarity: EVENT_RARITY.UNCOMMON, tags: ["forge", "sabotage", "weapons"],
      choices: [
        { id: "test-weapons", text: "Tester toute la livraison avec les ouvriers", choiceTag: "Prudence",
          success: { result: "Une série de pièces marquées conduit à un atelier clandestin.", effects: { combat: 1, morale: 2 }, requiredTraits: ["organisé"], flags: { tracedBrassWeaponSabotage: true } },
          setback: { result: "Un fusil particulièrement créatif détruit le banc d’essai derrière lui.", effects: { health: -4, fortune: -6000 }, flags: { brassWeaponBackfire: true } } },
        { id: "follow-saboteur", text: "Laisser une caisse comme appât", choiceTag: "Intuition",
          success: { result: "Le saboteur avoue agir pour empêcher le commodore corrompu de revendre les armes.", effects: { morale: 2 }, requiredFlags: { exposedCommodoreRonce: true }, flags: { alliedWithBrassSaboteur: true } },
          setback: { result: "L’appât disparaît avec la caisse et le chariot qui la portait.", effects: { fortune: -8000, morale: -1 }, flags: { lostBrassWeaponBait: true } } },
      ],
    }),

    // GRAND LINE — Événements rares
    createGrandLineFactionEvent({
      id: "marine-grand-line-rare-armament-lesson", path: PATHS.MARINE,
      title: "La leçon du poing noir",
      description: "La commandante bloque une lame avec son avant-bras couvert de Fluide de l’Armement. Elle propose un entraînement avant la prochaine opération.",
      rarity: EVENT_RARITY.RARE, tags: ["haki", "training", "officer"],
      choices: [
        { id: "train-armament", text: "Suivre l’entraînement jusqu’au bout", choiceTag: "Discipline",
          success: { result: "La sensation du Fluide apparaît brièvement au moment d’encaisser le dernier coup.", effects: { haki: 2, combat: 2, health: -3 }, minimumStats: { combat: 22 }, addTraits: ["discipliné"], flags: { trainedArmamentWithAveline: true } },
          setback: { result: "L’exercice finit dans l’infirmerie, où la commandante dépose un formulaire d’excuses déjà rempli.", effects: { health: -7, morale: -1 }, flags: { failedAvelineArmamentDrill: true } } },
        { id: "study-defense", text: "Étudier sa défense pendant les exercices", choiceTag: "Sagesse",
          success: { result: "Tu apprends à reconnaître l’instant où sa garde se renforce.", effects: { haki: 1, morale: 2 }, requiredTraits: ["calme"], flags: { studiedAvelineArmament: true } },
          setback: { result: "L’intendant prend tes notes pour le planning de cantine et les affiche dans toute la base.", effects: { morale: 1 }, flags: { hakiNotesPostedAsMenu: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "marine-grand-line-rare-cipher-pol-break", path: PATHS.MARINE,
      title: "Le mandat qui n’existe pas",
      description: "L’agente du Cipher Pol présente un mandat autorisant l’effacement d’un village des cartes. Le papier porte le bon sceau, mais une date qui n’existera que l’année prochaine.",
      rarity: EVENT_RARITY.RARE, tags: ["cipher-pol", "politics", "village"],
      important: true,
      choices: [
        { id: "reject-mandate", text: "Refuser publiquement le mandat", choiceTag: "Justice",
          success: { result: "Plusieurs unités suivent ton refus et l’agente du Cipher Pol se retire en promettant que l’administration se souviendra.", effects: { popularity: 5, morale: 4 }, minimumStats: { popularity: 70 }, flags: { rejectedFutureDatedMandate: true, cipherPolMarkedMarine: true }, important: true },
          setback: { result: "La hiérarchie confirme provisoirement le mandat et te relève de l’opération.", effects: { popularity: -2, morale: -4 }, flags: { suspendedOverCipherMandate: true } } },
        { id: "prove-forgery", text: "Faire authentifier chaque détail", choiceTag: "Prudence",
          success: { result: "L’encre vient d’un bureau fermé depuis dix ans. Le mandat s’effondre sans bataille.", effects: { popularity: 3, morale: 3 }, requiredFlags: { preservedCipherPolFile: true }, flags: { provedCipherMandateForgery: true } },
          setback: { result: "Les experts se contredisent assez longtemps pour permettre l’évacuation forcée.", effects: { morale: -3 }, flags: { cipherMandateDelayedOnly: true } } },
      ],
    }),

    // GRAND LINE — Événements très rares
    createGrandLineFactionEvent({
      id: "marine-grand-line-very-rare-reputation-hearing", path: PATHS.MARINE,
      title: "Le conseil des cinq uniformes",
      description: "Un conseil exceptionnel examine toute ta carrière. La commandante défend tes choix, le commodore corrompu les déforme et l’agente du Cipher Pol apporte un dossier dont les pages sont noires.",
      rarity: EVENT_RARITY.VERY_RARE, tags: ["reputation", "hearing", "career"],
      important: true,
      choices: [
        { id: "defend-record", text: "Défendre chaque décision sans renier les civils", choiceTag: "Honneur",
          success: { result: "Les témoignages des populations et des unités imposent un récit que le conseil ne peut effacer.", effects: { popularity: 5, morale: 5 }, minimumStats: { popularity: 85 }, flags: { vindicatedBeforeMarineCouncil: true, majorMarineReputation: true }, important: true },
          setback: { result: "Le conseil conserve ton uniforme mais bloque toute promotion immédiate.", effects: { morale: -4, popularity: -2 }, flags: { careerFrozenByMarineCouncil: true }, important: true } },
        { id: "expose-ronce", text: "Centrer l’audience sur les falsifications du commodore corrompu", choiceTag: "Justice",
          success: { result: "Les registres concordent et le commodore corrompu est arrêté devant les cinq uniformes.", effects: { popularity: 4, morale: 4 }, requiredFlags: { exposedCommodoreRonce: true }, flags: { commodoreRonceConvicted: true }, important: true },
          setback: { result: "Le commodore corrompu détruit sa carrière pour sauver l’agente du Cipher Pol, qui quitte l’audience intact.", effects: { morale: -2 }, flags: { cipherAgentGlassEscapedHearing: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "marine-grand-line-very-rare-buster-call-warning", path: PATHS.MARINE,
      title: "Le signal avant le Buster Call",
      description: "Un Escargophone doré transmet par erreur les préparatifs d’un Buster Call contre une île encore habitée. L’ordre final n’est pas donné, mais la flotte se rassemble.",
      rarity: EVENT_RARITY.VERY_RARE, tags: ["buster-call", "civilians", "government"],
      important: true,
      dangerTheme: true,
      choices: [
        { id: "evacuate-island", text: "Organiser l’évacuation avant l’ordre", choiceTag: "Sans retour",
          success: { result: "Les habitants quittent l’île sous couvert d’un exercice. Lorsque l’ordre est suspendu, ils sont déjà hors de portée.", effects: { popularity: 5, morale: 5, ship: -1 }, minimumStats: { ship: 5, morale: 60 }, flags: { evacuatedIslandBeforeBusterCall: true, governmentSuspectsLeak: true }, important: true },
          setback: { result: "La flotte remarque le mouvement et verrouille les routes, sans encore ouvrir le feu.", effects: { morale: -5, ship: -2 }, flags: { busterCallEvacuationBlocked: true }, important: true } },
        { id: "trace-order", text: "Remonter l’origine du signal", choiceTag: "Prudence",
          success: { result: "Le signal vient d’une manipulation interne destinée à couvrir un trafic du Cipher Pol.", effects: { popularity: 3, morale: 3 }, requiredFlags: { provedCipherMandateForgery: true }, flags: { exposedFalseBusterCallPlot: true }, important: true },
          setback: { result: "La piste se ferme et ton accès aux transmissions stratégiques est révoqué.", effects: { morale: -3 }, flags: { lostStrategicSignalAccess: true } } },
      ],
    })
  );

  /* ========================================================
     GRAND LINE — CHASSEURS DE PRIMES (18)
  ======================================================== */

  // GRAND LINE — Événements généraux
  BOUNTY_HUNTER_EVENTS.push(
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-devil-fruit-target", path: PATHS.BOUNTY_HUNTER,
      title: "La cible aux bras innombrables",
      description: "Une pirate utilisant le Hana Hana no Mi fait éclore des bras sur les cloisons pour verrouiller les passages et disparaître entre les ponts.",
      rarity: EVENT_RARITY.COMMON, tags: ["devil-fruit", "target", "hunt"],
      choices: [
        { id: "corner-miska", text: "La pousser vers un espace sans cloisons", choiceTag: "Prudence",
          success: { result: "Sur le pont découvert, le pouvoir de la pirate ne lui offre plus aucune issue.", effects: { combat: 2, fortune: 12000 }, minimumStats: { combat: 20 }, flags: { capturedMiskaScreenfold: true } },
          setback: { result: "Des bras surgissent sous tes pieds et l’arrachent au pont avec ton mandat.", effects: { health: -5, morale: -2 }, flags: { miskaScreenfoldEscaped: true } } },
        { id: "track-folds", text: "Repérer les surfaces qu’elle surveille", choiceTag: "Intuition",
          success: { result: "Les regards dérobés de ses yeux éclos révèlent la direction de sa cache.", effects: { fortune: 8000, morale: 2 }, requiredTraits: ["curieux"], flags: { metOraPaleye: true, mappedMiskaFolds: true } },
          setback: { result: "Une main surgit derrière la porte et verrouille le placard avant sa fuite.", effects: { morale: -2, popularity: -1 }, flags: { foldedIntoCloset: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-forged-contract", path: PATHS.BOUNTY_HUNTER,
      title: "La signature à l’encre lavable",
      description: "Une courtière méticuleuse aux boucles d’oreilles en forme de reçus, repère un contrat falsifié visant un marchand sans prime. Le commanditaire a déjà payé la moitié.",
      rarity: EVENT_RARITY.COMMON, tags: ["contract", "fraud", "contact"],
      choices: [
        { id: "trace-client", text: "Remonter jusqu’au faux commanditaire", choiceTag: "Prudence",
          success: { result: "La courtière suit les numéros de série des billets jusqu’à un réseau de racket.", effects: { fortune: 10000, popularity: 2 }, requiredTraits: ["patient"], flags: { exposedWashinkContract: true, alliedWithSiaLedger: true } },
          setback: { result: "L’encre disparaît avec les preuves et le commanditaire ferme son bureau.", effects: { fortune: -5000, morale: -2 }, flags: { lostForgedContractTrail: true } } },
        { id: "warn-target", text: "Prévenir discrètement le marchand", choiceTag: "Honneur",
          success: { result: "Le marchand organise un faux enlèvement qui attire les racketteurs.", effects: { morale: 3, fortune: 7000 }, requiredTraits: ["rusé"], flags: { protectedFalselyTargetedMerchant: true } },
          setback: { result: "Le marchand panique, fuit et te fait passer pour son ravisseur.", effects: { popularity: -2, morale: -1 }, flags: { mistakenForMerchantKidnapper: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-many-competitors", path: PATHS.BOUNTY_HUNTER,
      title: "La prime aux vingt chasseurs",
      description: "Une prime exceptionnelle attire vingt chasseurs dans la même auberge. Un chasseur rival, ton rival à la veste quadrillée, a réservé toutes les sorties sauf la fenêtre des cuisines.",
      rarity: EVENT_RARITY.COMMON, tags: ["competitors", "bounty", "rival"],
      choices: [
        { id: "share-information", text: "Proposer une chasse coordonnée", choiceTag: "Diplomatie",
          success: { result: "Les chasseurs encerclent la cible et la courtière répartit la récompense sans perdre un berry.", effects: { fortune: 12000, morale: 3 }, minimumStats: { popularity: 45 }, flags: { coordinatedTwentyHunters: true } },
          setback: { result: "Le chasseur rival transmet trois horaires différents et arrive seul au bon rendez-vous.", effects: { morale: -3 }, flags: { deceivedByNilsSquare: true } } },
        { id: "take-kitchen-route", text: "Passer par la fenêtre des cuisines", choiceTag: "Intuition",
          success: { result: "Tu devances le chasseur rival et trouves la cible cachée dans un chariot de desserts.", effects: { fortune: 15000, popularity: 2 }, requiredFlags: { defeatedByJaskoRival: true }, flags: { outpacedNilsSquare: true } },
          setback: { result: "La fenêtre donne sur une autre cuisine, puis une autre, toutes furieuses.", effects: { fortune: -6000, morale: 1 }, flags: { bannedFromHunterInnKitchens: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-marine-negotiation", path: PATHS.BOUNTY_HUNTER,
      title: "Le reçu de la Marine",
      description: "Une base accepte ta capture, mais refuse de payer sans le formulaire bleu azur numéro huit. L’intendant affirme que le bleu océan n’est juridiquement pas la même couleur.",
      rarity: EVENT_RARITY.COMMON, tags: ["marine", "payment", "bureaucracy"],
      choices: [
        { id: "follow-procedure", text: "Retrouver le formulaire réglementaire", choiceTag: "Patience",
          success: { result: "La courtière découvre le formulaire sous la tasse de l’intendant et obtient le paiement complet.", effects: { fortune: 15000, morale: 2 }, requiredTraits: ["patient"], flags: { masteredMarineBountyForms: true } },
          setback: { result: "Le bureau ferme pendant que tu attends devant le bon guichet.", effects: { morale: -3, fortune: -3000 }, flags: { marinePaymentDelayed: true } } },
        { id: "negotiate-officer", text: "Demander audience à l’officier de quart", choiceTag: "Diplomatie",
          success: { result: "L’officier valide la prise et te confie une ligne directe pour les futurs contrats.", effects: { fortune: 12000, popularity: 2 }, minimumStats: { popularity: 50 }, flags: { marineBountyContact: true } },
          setback: { result: "L’officier découvre une erreur de date et réduit la récompense.", effects: { fortune: 5000, morale: -1 }, flags: { disputedMarineBounty: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-innocent-target", path: PATHS.BOUNTY_HUNTER,
      title: "Le portrait qui ne ressemble à personne",
      description: "Une institutrice est accusée d’avoir attaqué un navire royal. Son avis de recherche représente un homme moustachu, mais le numéro d’identité est bien le sien.",
      rarity: EVENT_RARITY.COMMON, tags: ["innocent", "false-accusation", "ethics"],
      choices: [
        { id: "investigate-alibi", text: "Vérifier son histoire avant toute arrestation", choiceTag: "Honneur",
          success: { result: "Les élèves prouvent qu’elle enseignait au moment de l’attaque et identifient le vrai pirate grâce à sa moustache.", effects: { morale: 4, popularity: 2 }, requiredTraits: ["responsable"], flags: { clearedInnocentTeacher: true, identifiedRoyalShipAttacker: true } },
          setback: { result: "Les témoins ont peur de parler et l’avis reste actif.", effects: { morale: -3 }, flags: { unresolvedTeacherBounty: true } } },
        { id: "deliver-questioning", text: "La conduire à une base en garantissant sa sécurité", choiceTag: "Prudence",
          success: { result: "L’enquête officielle reconnaît l’erreur et annule la prime.", effects: { popularity: 2, morale: 2 }, requiredFlags: { marineBountyContact: true }, flags: { escortedTeacherSafely: true } },
          setback: { result: "Un agent royal tente de la faire disparaître pendant le transfert.", effects: { health: -5, morale: -2 }, flags: { royalAgentTargetedTeacher: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-storm-hunt", path: PATHS.BOUNTY_HUNTER,
      title: "La chasse dans la pluie horizontale",
      description: "La cible traverse une tempête dont la pluie tombe alternativement de gauche à droite. La pisteuse affirme pouvoir suivre les traces laissées sur les nuages.",
      rarity: EVENT_RARITY.COMMON, tags: ["storm", "hunt", "tracker"],
      choices: [
        { id: "follow-ora", text: "Suivre les indications de la pisteuse", choiceTag: "Intuition",
          success: { result: "La pisteuse retrouve la cible et accepte de devenir ta pisteuse, à condition de ne jamais expliquer comment.", effects: { crew: 1, ship: 1 }, minimumStats: { morale: 50 }, flags: { recruitedOraPaleyeTracker: true, caughtCloudstepTarget: true }, important: true },
          setback: { result: "Les traces appartenaient à un troupeau d’oiseaux très organisé.", effects: { ship: -2, morale: 1 }, flags: { followedStormBirdTracks: true } } },
        { id: "cut-through-storm", text: "Couper directement à travers le front", choiceTag: "Audace",
          success: { result: "La manœuvre intercepte la cible au moment où elle croyait avoir disparu.", effects: { fortune: 12000, ship: -1 }, minimumStats: { ship: 4 }, flags: { interceptedHorizontalRainTarget: true } },
          setback: { result: "Le vent retourne une voile et la cible gagne plusieurs heures.", effects: { ship: -3 }, flags: { lostTargetInHorizontalRain: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-recruitable-target", path: PATHS.BOUNTY_HUNTER,
      title: "La tireuse sans crime",
      description: "Une tireuse recherchée possède une prime pour avoir refusé d’abattre des civils. Elle vise ton chapeau à chaque phrase et ne le manque jamais.",
      rarity: EVENT_RARITY.COMMON, tags: ["target", "recruitment", "sniper"],
      important: true,
      choices: [
        { id: "hear-pica", text: "Écouter sa version avant de décider", choiceTag: "Honneur",
          success: { result: "Les preuves confirment le complot. La tireuse rejoint ta chasse pour retrouver le véritable commanditaire.", effects: { crew: 1, morale: 3 }, requiredTraits: ["compatissant"], combatStyle: "sniper", flags: { recruitedPicaTwomoonSniper: true, protectedPicaFromFalseBounty: true }, important: true },
          setback: { result: "Les preuves sont incomplètes et la tireuse disparaît en laissant ton chapeau cloué au mur.", effects: { morale: -1, popularity: -1 }, flags: { picaTwomoonAtLarge: true } } },
        { id: "offer-surrender", text: "Proposer une remise encadrée à la Marine", choiceTag: "Prudence",
          success: { result: "Ton contact Marine accepte une enquête avant détention.", effects: { popularity: 2, morale: 2 }, requiredFlags: { marineBountyContact: true }, flags: { arrangedPicaInquiry: true } },
          setback: { result: "La base veut exécuter le mandat sans enquête et la tireuse prend la fuite.", effects: { morale: -3 }, flags: { marineRejectedPicaInquiry: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-jasko-callback", path: PATHS.BOUNTY_HUNTER,
      title: "Le chasseur rival au bout de la piste",
      description: "Le chasseur rival revendique la même cible et porte encore les traces de votre course à Reverse Mountain. Il propose une dernière association, sourire compris mais confiance non fournie.",
      rarity: EVENT_RARITY.COMMON, tags: ["callback", "competitor", "rival"],
      choices: [
        { id: "honor-old-deal", text: "Reprendre le partage convenu", choiceTag: "Diplomatie",
          success: { result: "Le chasseur rival respecte cette fois chaque mot du contrat et couvre ta retraite.", effects: { fortune: 10000, morale: 3 }, requiredFlags: { sharedContractWithJasko: true }, flags: { restoredJaskoPartnership: true } },
          setback: { result: "La cible exploite vos anciennes rancœurs et s’échappe entre les deux lignes de tir.", effects: { morale: -3 }, flags: { targetUsedJaskoRivalry: true } } },
        { id: "settle-rivalry", text: "Régler la rivalité avant la chasse", choiceTag: "Honneur",
          success: { result: "Le duel se termine sans rancune et le chasseur rival te cède la piste la plus fraîche.", effects: { combat: 2, popularity: 2 }, minimumStats: { combat: 20 }, flags: { defeatedJaskoFairly: true } },
          setback: { result: "Le chasseur rival te devance encore et laisse une lance courte plantée dans l’avis de recherche.", effects: { morale: -2, popularity: -1 }, requiredFlags: { defeatedByJaskoRival: true }, flags: { jaskoGrandLineAdvantage: true } } },
      ],
    }),

    // GRAND LINE — Destinations spécifiques
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-brass-hidden-target", path: PATHS.BOUNTY_HUNTER,
      title: "La cible derrière le trône de cuivre",
      description: "Au Royaume de Cuivre, un pirate recherché conseille officiellement le ministre du royaume. Le capturer peut déclencher une crise que le contrat omet soigneusement.",
      zones: ["kingdom-of-brass"], rarity: EVENT_RARITY.UNCOMMON, tags: ["kingdom", "protected-target", "politics"],
      choices: [
        { id: "expose-adviser", text: "Révéler son identité devant le conseil", choiceTag: "Audace",
          success: { result: "Les preuves forcent le ministre à abandonner son conseiller et la garde ouvre les portes.", effects: { fortune: 15000, popularity: 3 }, minimumStats: { popularity: 55 }, flags: { exposedBrassPirateAdviser: true } },
          setback: { result: "Le ministre déclare les preuves fabriquées et place une récompense locale sur ta tête.", effects: { popularity: -2 }, flags: { wantedByMinisterTalc: true } } },
        { id: "extract-target", text: "L’attirer hors du royaume", choiceTag: "Ruse",
          success: { result: "Une fausse vente d’armes conduit la cible au-delà de la protection royale.", effects: { fortune: 18000 }, requiredTraits: ["rusé"], flags: { extractedBrassProtectedTarget: true } },
          setback: { result: "La cible reconnaît le piège et fait fermer les frontières.", effects: { fortune: -7000, morale: -2 }, flags: { brassBordersClosedToHunter: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-port-azur-warlord-contract", path: PATHS.BOUNTY_HUNTER,
      title: "Le contrat de l’ancien Grand Corsaire",
      description: "À Port-Azur, un courtier corrompu offre une fortune pour capturer l’ancien subordonné d’un Grand Corsaire déchu. La cible affirme posséder la preuve d’un trafic autrefois couvert par le système.",
      zones: ["port-azur"], rarity: EVENT_RARITY.UNCOMMON, tags: ["warlord", "contract", "broker"],
      choices: [
        { id: "take-contract", text: "Accepter le contrat de le courtier corrompu", choiceTag: "Quitte ou double",
          success: { result: "La capture est rapide et le courtier corrompu paie avec des pièces toutes frappées le même jour.", effects: { fortune: 20000 }, minimumStats: { combat: 22 }, flags: { completedWarlordBrokerContract: true, owesCalameSilence: true } },
          setback: { result: "Des hommes liés à l’ancien Grand Corsaire interceptent le transfert et récupèrent la cible.", effects: { health: -6, morale: -2 }, flags: { angeredWarlordContractNetwork: true } } },
        { id: "hear-evidence", text: "Examiner les preuves de la cible", choiceTag: "Prudence",
          success: { result: "Les registres relient le courtier corrompu à des ventes humaines. La courtière en conserve une copie.", effects: { popularity: 2, morale: 3 }, requiredFlags: { alliedWithSiaLedger: true }, flags: { uncoveredCalameTrafficking: true, protectedWarlordWitness: true } },
          setback: { result: "Les preuves sont un montage et le courtier corrompu retire tous ses contrats.", effects: { fortune: -5000, popularity: -1 }, flags: { blacklistedByCalameBroker: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-whispering-many-factions", path: PATHS.BOUNTY_HUNTER,
      title: "La cible aux quatre poursuivants",
      description: "Dans les Récifs Murmurants, Marine, pirates, révolutionnaires et chasseurs suivent la même contrebandière. Les échos imitent les ordres de chaque camp.",
      zones: ["whispering-reefs"], rarity: EVENT_RARITY.UNCOMMON, tags: ["multi-faction", "target", "reefs"],
      choices: [
        { id: "separate-signals", text: "Identifier les vrais signaux parmi les échos", choiceTag: "Intuition",
          success: { result: "La pisteuse distingue le rythme respiratoire derrière les ordres et trouve la contrebandière.", effects: { fortune: 15000, morale: 2 }, requiredFlags: { recruitedOraPaleyeTracker: true }, flags: { capturedFourFactionTarget: true } },
          setback: { result: "Tu suis un ordre prononcé par un récif et arrives au rendez-vous d’un autre camp.", effects: { health: -4, morale: -2 }, flags: { misledByFactionEchoes: true } } },
        { id: "negotiate-hunters", text: "Négocier une priorité de capture", choiceTag: "Diplomatie",
          success: { result: "Les camps acceptent un transfert neutre contre le partage des renseignements.", effects: { popularity: 3, fortune: 8000 }, minimumStats: { popularity: 65 }, flags: { brokeredFourFactionCapture: true } },
          setback: { result: "Chaque camp accepte séparément puis accuse les trois autres de trahison.", effects: { morale: -3, ship: -1 }, flags: { fourFactionStandoff: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-seven-current-duel", path: PATHS.BOUNTY_HUNTER,
      title: "Le duel des chasseurs en dérive",
      description: "À Sabaody, un chasseur rival t’attend sur deux barques-bulles entraînées autour d’un mangrove géant. Il propose un duel dont les règles tiennent sur un mouchoir déjà tombé à l’eau.",
      zones: ["seven-current-archipelago"], rarity: EVENT_RARITY.UNCOMMON, tags: ["competitor", "duel", "currents"],
      choices: [
        { id: "accept-duel", text: "Accepter le duel en mouvement", choiceTag: "Honneur",
          success: { result: "Tu anticipes le croisement des courants et désarmes le chasseur rival au seul instant possible.", effects: { combat: 3, popularity: 3 }, minimumStats: { combat: 23 }, combatStyle: "utilisateur-armes", flags: { defeatedNilsSquareInCurrents: true } },
          setback: { result: "Les barques se séparent avant le premier coup et le chasseur rival proclame sa victoire depuis très loin.", effects: { popularity: -2, morale: -1 }, flags: { nilsClaimedDriftingVictory: true } } },
        { id: "rewrite-rules", text: "Transformer le duel en chasse commune", choiceTag: "Ruse",
          success: { result: "La cible surgit entre les barques et vous la capturez avant de reprendre la dispute.", effects: { fortune: 12000, morale: 2 }, requiredTraits: ["pragmatique"], flags: { sharedCurrentCaptureWithNils: true } },
          setback: { result: "Le chasseur rival accepte, puis facture sa coopération plus cher que la prime.", effects: { fortune: -8000 }, flags: { owesNilsSquareFee: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-port-azur-information-market", path: PATHS.BOUNTY_HUNTER,
      title: "La criée aux secrets",
      description: "À Port-Azur, les informations sont vendues à la criée. Un lot contient la route de trois cibles et le nom de la personne qui t’a trahi.",
      zones: ["port-azur"], rarity: EVENT_RARITY.UNCOMMON, tags: ["information", "market", "betrayal"],
      choices: [
        { id: "buy-lot", text: "Miser sur le lot complet", choiceTag: "Quitte ou double",
          success: { result: "Deux pistes sont authentiques et la troisième révèle un réseau de contrats truqués.", effects: { fortune: 12000, popularity: 2 }, minimumStats: { fortune: 10000 }, flags: { boughtPortAzurSecretLot: true, knowsContractForgerNetwork: true } },
          setback: { result: "La salle pousse les enchères jusqu’à vider ta bourse pour des noms périmés.", effects: { fortune: -12000, morale: -2 }, flags: { overpaidForOldSecrets: true } } },
        { id: "watch-bidders", text: "Observer qui veut faire disparaître le lot", choiceTag: "Intuition",
          success: { result: "La courtière identifie le courtier corrompu sous un chapeau si large qu’il bloque deux rangées.", effects: { morale: 2 }, requiredFlags: { uncoveredCalameTrafficking: true }, flags: { linkedCalameToForgedContracts: true } },
          setback: { result: "Un faux enchérisseur te repère et alerte le marché noir.", effects: { popularity: -1 }, flags: { watchedByPortAzurSecretMarket: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-brass-prisoner-transfer", path: PATHS.BOUNTY_HUNTER,
      title: "La prime dans l’armure creuse",
      description: "Une cible est transférée hors du Royaume de Cuivre cachée dans une statue officielle. La statue salue chaque fois que quelqu’un prononce « contrôle douanier ».",
      zones: ["kingdom-of-brass"], rarity: EVENT_RARITY.UNCOMMON, tags: ["target", "transfer", "smuggling"],
      choices: [
        { id: "inspect-statue", text: "Faire ouvrir la statue au poste frontière", choiceTag: "Devoir",
          success: { result: "La cible tombe avec trois faux passeports et une clé de cellule.", effects: { fortune: 15000, popularity: 2 }, minimumStats: { popularity: 45 }, flags: { capturedArmoredTransferTarget: true } },
          setback: { result: "La statue active ses roulettes et traverse la frontière à une vitesse humiliante.", effects: { popularity: -2, morale: -1 }, flags: { rollingStatueTargetEscaped: true } } },
        { id: "follow-convoy", text: "Suivre le convoi jusqu’au commanditaire", choiceTag: "Prudence",
          success: { result: "La filature révèle un atelier produisant des identités protégées.", effects: { fortune: 10000, morale: 2 }, requiredTraits: ["patient"], flags: { uncoveredBrassFalseIdentityForge: true } },
          setback: { result: "Le convoi se divise entre six statues identiques qui se saluent entre elles.", effects: { morale: -2 }, flags: { lostAmongSalutingStatues: true } } },
      ],
    }),

    // GRAND LINE — Événements rares
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-rare-observation-hunt", path: PATHS.BOUNTY_HUNTER,
      title: "La cible invisible au regard",
      description: "Un vétéran insaisissable disparaît avant chaque embuscade, comme s’il entendait les intentions. La pisteuse suggère de chasser sans décider à l’avance du prochain geste.",
      rarity: EVENT_RARITY.RARE, tags: ["haki", "observation", "target"],
      choices: [
        { id: "empty-mind", text: "Suivre la piste sans préparer l’attaque", choiceTag: "Intuition",
          success: { result: "Un bref instant, tu perçois le vétéran avant de penser à le saisir.", effects: { haki: 2, combat: 1 }, minimumStats: { haki: 2 }, addTraits: ["calme"], flags: { sensedHobbWithObservation: true } },
          setback: { result: "Essayer de ne penser à rien produit surtout beaucoup de pensées sur le fait de ne penser à rien.", effects: { morale: -2 }, flags: { hobbReadHunterIntent: true } } },
        { id: "create-chaos", text: "Lancer plusieurs pistes contradictoires", choiceTag: "Ruse",
          success: { result: "Le vétéran ne peut anticiper une équipe qui ignore elle-même quel plan sera choisi.", effects: { fortune: 18000, morale: 2 }, requiredTraits: ["créatif"], flags: { capturedHobbNoBell: true } },
          setback: { result: "Ton équipe suit réellement les fausses pistes et le vétéran quitte l’île tranquillement.", effects: { fortune: -6000, morale: -3 }, flags: { lostHobbInOwnDecoys: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-rare-protected-pirate", path: PATHS.BOUNTY_HUNTER,
      title: "La prime que personne ne paiera",
      description: "Un pirate à la prime immense est secrètement protégé par des fonctionnaires et des courtiers. La courtière découvre que chaque chasseur victorieux a ensuite disparu.",
      rarity: EVENT_RARITY.RARE, tags: ["protected-target", "conspiracy", "career"],
      important: true,
      choices: [
        { id: "capture-publicly", text: "Organiser une capture impossible à étouffer", choiceTag: "Audace",
          success: { result: "La chute du pirate est diffusée par Escargophone avant que ses protecteurs réagissent.", effects: { fortune: 20000, popularity: 5 }, minimumStats: { combat: 25, popularity: 70 }, flags: { publiclyCapturedProtectedPirate: true, offendedProtectedPirateNetwork: true }, important: true },
          setback: { result: "La cible s’échappe et ses protecteurs détruisent officiellement le contrat.", effects: { health: -7, popularity: -3 }, flags: { huntedByProtectedPirateNetwork: true } } },
        { id: "sell-proof", text: "Vendre les preuves à une faction rivale", choiceTag: "Pragmatisme",
          success: { result: "Les documents rapportent gros et déclenchent une lutte interne chez les protecteurs.", effects: { fortune: 20000 }, requiredTraits: ["opportuniste"], flags: { soldProtectedPirateEvidence: true } },
          setback: { result: "L’acheteur travaille pour le réseau et récupère toutes les copies.", effects: { fortune: -8000, morale: -3 }, flags: { evidenceTakenByProtectedNetwork: true } } },
      ],
    }),

    // GRAND LINE — Événements très rares
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-very-rare-career-contract", path: PATHS.BOUNTY_HUNTER,
      title: "Le contrat qui change une carrière",
      description: "Un mandat scellé vise le courtier corrompu lui-même et promet une somme capable de rendre tout autre contrat dérisoire. Trois gouvernements nient simultanément l’avoir émis.",
      rarity: EVENT_RARITY.VERY_RARE, tags: ["contract", "broker", "career"],
      important: true,
      choices: [
        { id: "hunt-calame", text: "Accepter la chasse malgré les démentis", choiceTag: "Sans retour",
          success: { result: "Le courtier corrompu est capturé avec ses registres. Les chasseurs de Paradise connaissent désormais ton nom.", effects: { fortune: 25000, popularity: 5, combat: 2 }, minimumStats: { combat: 26, popularity: 80 }, flags: { capturedBrokerCalame: true, masterGrandLineHunterReputation: true }, important: true },
          setback: { result: "Le courtier corrompu transforme la chasse en piège et fait circuler un contrat contre toi.", effects: { health: -8, popularity: -2 }, flags: { bountyHuntersNowHuntPlayer: true }, important: true } },
        { id: "expose-mandate", text: "Révéler publiquement les trois signatures", choiceTag: "Honneur",
          success: { result: "Les gouvernements doivent reconnaître leurs liens avec le courtier et son marché s’effondre.", effects: { popularity: 5, morale: 4 }, requiredFlags: { linkedCalameToForgedContracts: true }, flags: { exposedThreeGovernmentContract: true }, important: true },
          setback: { result: "Les signatures disparaissent des archives et le mandat devient officiellement un faux.", effects: { popularity: -3, morale: -3 }, flags: { discreditedByCalameNetwork: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "bounty-hunter-grand-line-very-rare-warlord-prey", path: PATHS.BOUNTY_HUNTER,
      title: "La proie de l’ancien Grand Corsaire",
      description: "Une cible blessée arrive avec la marque d’un ancien Grand Corsaire et supplie d’être capturée avant que les héritiers de son réseau ne la trouvent. Elle transporte un registre de Fruits du Démon vendus au marché noir.",
      rarity: EVENT_RARITY.VERY_RARE, tags: ["warlord", "devil-fruit", "witness"],
      important: true,
      choices: [
        { id: "protect-capture", text: "La placer sous ta protection officielle", choiceTag: "Honneur",
          success: { result: "Tu repousses les poursuivants et remets la cible avec le registre intact.", effects: { popularity: 5, combat: 2, health: -4 }, minimumStats: { combat: 25 }, flags: { protectedWarlordPrey: true, securedDevilFruitLedger: true }, important: true },
          setback: { result: "Les hommes de l’ancien réseau récupèrent le registre pendant le combat.", effects: { health: -8, morale: -3 }, flags: { warlordNetworkRecoveredLedger: true } } },
        { id: "trade-ledger", text: "Négocier le registre contre une sortie sûre", choiceTag: "Pragmatisme",
          success: { result: "La courtière obtient une copie avant l’échange et la cible disparaît sous une nouvelle identité.", effects: { fortune: 20000, morale: 2 }, requiredFlags: { alliedWithSiaLedger: true }, flags: { copiedDevilFruitBlackMarketLedger: true } },
          setback: { result: "Le négociateur prend le registre et refuse toute garantie.", effects: { morale: -4, popularity: -2 }, flags: { betrayedInWarlordLedgerDeal: true } } },
      ],
    })
  );

  /* ========================================================
     GRAND LINE — RÉVOLUTIONNAIRES (18)
  ======================================================== */

  // GRAND LINE — Événements généraux
  REVOLUTIONARY_EVENTS.push(
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-discovered-cell", path: PATHS.REVOLUTIONARY,
      title: "La cellule aux fenêtres rouges",
      description: "Une cellule clandestine a été découverte après que chaque membre a peint sa fenêtre en rouge le même soir. Une agente clandestine attend un plan d’évacuation.",
      rarity: EVENT_RARITY.COMMON, tags: ["cell", "cipher-pol", "evacuation"],
      choices: [
        { id: "evacuate-cell", text: "Évacuer les agents par petits groupes", choiceTag: "Prudence",
          success: { result: "L’agente clandestine disperse la cellule sur trois routes et conserve tous les contacts essentiels.", effects: { morale: 3, crew: 1 }, minimumStats: { ship: 3 }, dreamProgressByDream: { "build-underground-network": 2 }, flags: { savedRedWindowCell: true, alliedWithLuneFiligree: true } },
          setback: { result: "Un groupe est suivi et force le réseau à abandonner plusieurs caches.", effects: { morale: -3, fortune: -6000 }, flags: { redWindowRoutesCompromised: true } } },
        { id: "feed-false-cell", text: "Transformer la cellule en leurre", choiceTag: "Ruse",
          success: { result: "Le Cipher Pol surveille des appartements vides pendant que l’agente clandestine rétablit les liaisons.", effects: { morale: 2 }, requiredTraits: ["rusé"], dreamProgressByDream: { "build-underground-network": 2 }, flags: { deceivedCipherPolAtRedWindows: true } },
          setback: { result: "Un agent reconnaît le leurre et remonte jusqu’à un dépôt réel.", effects: { morale: -2, fortune: -8000 }, flags: { cipherPolFoundRevolutionaryDepot: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-strangled-kingdom", path: PATHS.REVOLUTIONARY,
      title: "Le royaume qui paie pour respirer",
      description: "Un royaume affilié taxe l’air des mines au nom du Tribut céleste. Le ministre du royaume porte un compteur autour du cou et facture même ses propres soupirs.",
      rarity: EVENT_RARITY.COMMON, tags: ["kingdom", "taxes", "oppression"],
      choices: [
        { id: "publish-ledgers", text: "Voler et diffuser les registres", choiceTag: "Rébellion",
          success: { result: "Les chiffres circulent par Escargophone et déclenchent une grève générale.", effects: { popularity: 4, morale: 3 }, minimumStats: { popularity: 45 }, dreamProgressByDream: { "found-free-nation": 2, "reveal-void-century": 1 }, flags: { exposedBreathTaxLedgers: true, ministerTalcRevolutionaryEnemy: true }, important: true },
          setback: { result: "Le ministre accuse des comptables innocents et augmente la surveillance.", effects: { morale: -3 }, flags: { breathTaxClerksArrested: true } } },
        { id: "disable-counters", text: "Saboter les compteurs pendant la relève", choiceTag: "Prudence",
          success: { result: "La saboteuse bloque chaque compteur sur zéro sans toucher aux galeries.", effects: { morale: 3, fortune: 5000 }, requiredTraits: ["créatif"], flags: { disabledBreathTaxCounters: true, metPivoineSaboteur: true } },
          setback: { result: "Les compteurs sonnent tous ensemble et alertent la garde.", effects: { health: -4, morale: -2 }, flags: { breathTaxSabotageExposed: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-infiltrated-agent", path: PATHS.REVOLUTIONARY,
      title: "L’agent qui connaît trop bien le mot de passe",
      description: "Un nouvel agent récite les codes, les gestes et même les erreurs prévues. L’agente de liaison le reconnaît, mais sa propre loyauté a déjà été mise en doute dans les quatre mers.",
      rarity: EVENT_RARITY.COMMON, tags: ["infiltration", "callback", "agent"],
      choices: [
        { id: "trust-cendre", text: "Suivre l’intuition de l’agente de liaison", choiceTag: "Confiance",
          success: { result: "L’agente de liaison démasque un agent du Cipher Pol grâce à une faute que seule la vraie cellule utilise.", effects: { morale: 3 }, requiredFlags: { trustedAgentCendre: true }, dreamProgressByDream: { "build-underground-network": 1 }, flags: { cendreExposedCipherInfiltrator: true } },
          setback: { result: "Le suspect s’enfuit avant l’interrogatoire et emporte plusieurs codes.", effects: { morale: -3 }, flags: { infiltratorStoleCellCodes: true } } },
        { id: "verify-both", text: "Vérifier séparément les deux identités", choiceTag: "Prudence",
          success: { result: "L’agente clandestine confirme les soupçons de l’agente de liaison et isole l’infiltré sans fracture interne.", effects: { morale: 2 }, requiredTraits: ["patient"], flags: { restoredCendreTrust: true, capturedCipherInfiltrator: true } },
          setback: { result: "L’enquête nourrit les soupçons et l’agente de liaison quitte la cellule avant la conclusion.", effects: { morale: -4 }, requiredFlags: { suspectedAgentCendreSpy: true }, flags: { cendreLeftRevolutionaryNetwork: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-secret-archive", path: PATHS.REVOLUTIONARY,
      title: "L’archive qui respire",
      description: "L’archiviste clandestin, archiviste dont le manteau contient plus de poches que de tissu, découvre des documents interdits ventilés par un Escargophone endormi.",
      rarity: EVENT_RARITY.COMMON, tags: ["archive", "cipher-pol", "void-century"],
      choices: [
        { id: "copy-archive", text: "Copier les documents sans réveiller l’Escargophone", choiceTag: "Prudence",
          success: { result: "L’archiviste reproduit les sceaux et plusieurs références au Siècle oublié.", effects: { morale: 3 }, requiredTraits: ["patient"], dreamProgressByDream: { "reveal-void-century": 3 }, flags: { copiedBreathingArchive: true, metNeroDrypaper: true }, important: true },
          setback: { result: "L’Escargophone ouvre un œil, bâille et transmet l’alerte en dormant.", effects: { morale: -2, health: -3 }, flags: { breathingArchiveAlerted: true } } },
        { id: "steal-index", text: "Prendre uniquement l’index des dossiers", choiceTag: "Intuition",
          success: { result: "L’index révèle où le Gouvernement mondial déplace les archives interdites.", effects: { morale: 2 }, dreamProgressByDream: { "reveal-void-century": 2, "build-underground-network": 1 }, flags: { stoleForbiddenArchiveIndex: true } },
          setback: { result: "L’index est un faux destiné à cartographier les voleurs.", effects: { morale: -3 }, flags: { markedByArchiveCounterintelligence: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-prison-liberation", path: PATHS.REVOLUTIONARY,
      title: "Les chaînes sous la ligne de flottaison",
      description: "Un navire-prison transporte des opposants et des esclaves libérés puis repris. Ses chaînes sont reliées à la coque : les briser trop brutalement peut couler tout le monde.",
      rarity: EVENT_RARITY.COMMON, tags: ["prison", "slavery", "rescue"],
      important: true,
      choices: [
        { id: "cut-chains-carefully", text: "Détacher les chaînes une section après l’autre", choiceTag: "Prudence",
          success: { result: "Chaque prisonnier atteint les canots et la saboteuse neutralise le mécanisme central.", effects: { morale: 5, crew: 1 }, minimumStats: { ship: 3 }, dreamProgressByDream: { "break-the-chains": 3 }, flags: { liberatedHullChainPrisoners: true, recruitedPivoineSaboteur: true }, important: true },
          setback: { result: "Une section cède trop tôt et l’évacuation se termine dans l’eau glacée.", effects: { health: -6, morale: -2 }, flags: { partialHullChainRescue: true } } },
        { id: "seize-prison-ship", text: "Prendre le contrôle du navire-prison", choiceTag: "Audace",
          success: { result: "La garde se rend et le bâtiment devient une route mobile pour les évacuations.", effects: { combat: 3, popularity: 3 }, minimumStats: { combat: 22 }, dreamProgressByDream: { "break-the-chains": 2, "build-underground-network": 2 }, flags: { seizedGovernmentPrisonShip: true }, important: true },
          setback: { result: "La garde saborde les commandes et force une retraite avec une partie des captifs.", effects: { health: -7, morale: -4 }, flags: { prisonShipPartiallyEvacuated: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-secret-route", path: PATHS.REVOLUTIONARY,
      title: "La route sous les journaux",
      description: "Des livreurs cachent des agents dans des piles de journaux imperméables. La responsable des presses clandestines, leur contact, veut étendre la route à plusieurs mers.",
      rarity: EVENT_RARITY.COMMON, tags: ["route", "newspaper", "network"],
      choices: [
        { id: "expand-route", text: "Relier la route aux cellules voisines", choiceTag: "Organisation",
          success: { result: "L’agente clandestine synchronise les livraisons et crée une chaîne clandestine stable.", effects: { morale: 3, fortune: 5000 }, requiredTraits: ["organisé"], dreamProgressByDream: { "build-underground-network": 3 }, flags: { expandedNewspaperAgentRoute: true, alliedWithMorganeRotary: true }, important: true },
          setback: { result: "Une édition en retard bloque deux agents dans un kiosque pendant toute une journée.", effects: { morale: -2 }, flags: { newspaperRouteDelayed: true } } },
        { id: "keep-route-small", text: "Conserver une route discrète et locale", choiceTag: "Prudence",
          success: { result: "La liaison reste invisible et fiable pour les témoins les plus sensibles.", effects: { morale: 2 }, dreamProgressByDream: { "build-underground-network": 1 }, flags: { securedLocalNewspaperRoute: true } },
          setback: { result: "Le manque de relais oblige à abandonner une livraison importante.", effects: { morale: -2, fortune: -4000 }, flags: { lostRemoteCellMessage: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-human-trafficking", path: PATHS.REVOLUTIONARY,
      title: "La vente aux bracelets numérotés",
      description: "Un marché flottant vend des personnes sous couvert de contrats de travail. Le trafiquant porte les clés comme une couronne et ne regarde jamais les visages.",
      rarity: EVENT_RARITY.COMMON, tags: ["slavery", "trafficking", "rescue"],
      choices: [
        { id: "break-auction", text: "Interrompre la vente et ouvrir les cages", choiceTag: "Rébellion",
          success: { result: "Les cages s’ouvrent avant que les acheteurs puissent réagir. Le trafiquant perd sa couronne de clés.", effects: { combat: 2, morale: 5, popularity: 3 }, minimumStats: { combat: 21 }, dreamProgressByDream: { "break-the-chains": 3 }, flags: { destroyedNumberedBraceletAuction: true, masterTinTraffickerEnemy: true }, important: true },
          setback: { result: "Les gardes ferment les passerelles et plusieurs cages quittent le marché.", effects: { health: -7, morale: -4 }, flags: { braceletAuctionPartiallyDisrupted: true } } },
        { id: "replace-ledgers", text: "Remplacer les contrats par des actes de libération", choiceTag: "Ruse",
          success: { result: "L’archiviste falsifie les sceaux et transforme juridiquement les captifs en passagers libres.", effects: { morale: 4 }, requiredFlags: { metNeroDrypaper: true }, dreamProgressByDream: { "break-the-chains": 2, "reveal-void-century": 1 }, flags: { forgedAuctionLiberationPapers: true } },
          setback: { result: "Un acheteur reconnaît le faux sceau et alerte le trafiquant.", effects: { morale: -3 }, flags: { masterTinKnowsRevolutionarySeal: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-insurrection-choice", path: PATHS.REVOLUTIONARY,
      title: "La cloche avant le soulèvement",
      description: "Une ville est prête à se soulever, mais ses réserves ne tiendront pas un siège. L’agente clandestine propose d’attendre ; les dockers veulent sonner la cloche ce soir.",
      rarity: EVENT_RARITY.COMMON, tags: ["insurrection", "strategy", "territory"],
      choices: [
        { id: "delay-uprising", text: "Reporter le soulèvement pour préparer les réserves", choiceTag: "Sagesse",
          success: { result: "Les cellules stockent nourriture et médicaments sans éveiller la garnison.", effects: { fortune: -8000, morale: 3 }, requiredTraits: ["prudent"], dreamProgressByDream: { "found-free-nation": 2, "build-underground-network": 1 }, flags: { preparedSustainableUprising: true } },
          setback: { result: "L’attente permet à la garnison d’arrêter plusieurs meneurs.", effects: { morale: -4 }, flags: { uprisingLeadersArrested: true } } },
        { id: "ring-bell", text: "Soutenir l’insurrection immédiate", choiceTag: "Rébellion",
          success: { result: "La garnison tombe avant de verrouiller le port et la ville forme un conseil provisoire.", effects: { combat: 3, popularity: 4 }, minimumStats: { combat: 23, morale: 55 }, dreamProgressByDream: { "found-free-nation": 3 }, flags: { liberatedBellportCity: true, foundedBellportCouncil: true }, important: true },
          setback: { result: "Le soulèvement prend le port mais pas les réserves, ouvrant une lutte difficile.", effects: { health: -6, morale: -3 }, flags: { bellportUprisingUnfinished: true } } },
      ],
    }),

    // GRAND LINE — Destinations spécifiques
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-brass-free-district", path: PATHS.REVOLUTIONARY,
      title: "Le quartier sans couronne",
      description: "Au Royaume de Cuivre, un quartier chasse les collecteurs et demande de l’aide pour survivre sans l’administration royale.",
      zones: ["kingdom-of-brass"], rarity: EVENT_RARITY.UNCOMMON, tags: ["territory", "institutions", "kingdom"],
      important: true,
      choices: [
        { id: "build-council", text: "Aider à former un conseil et des réserves", choiceTag: "Organisation",
          success: { result: "Les habitants répartissent les ateliers, les vivres et la défense sous des règles publiques.", effects: { morale: 4, fortune: -8000 }, requiredTraits: ["organisé"], dreamProgressByDream: { "found-free-nation": 3 }, flags: { builtBrassFreeDistrictCouncil: true, brassFreeDistrictEndures: true }, important: true },
          setback: { result: "Les anciennes rivalités bloquent le conseil et épuisent les premières réserves.", effects: { morale: -3, fortune: -5000 }, flags: { brassFreeDistrictDivided: true } } },
        { id: "arm-district", text: "Préparer d’abord la défense du quartier", choiceTag: "Prudence",
          success: { result: "La saboteuse transforme les ateliers en réseau défensif sans militariser les rues.", effects: { combat: 2, morale: 2 }, requiredFlags: { recruitedPivoineSaboteur: true }, dreamProgressByDream: { "found-free-nation": 2 }, flags: { fortifiedBrassFreeDistrict: true } },
          setback: { result: "La garde royale présente les préparatifs comme une menace et encercle le quartier.", effects: { morale: -4 }, flags: { brassFreeDistrictBesieged: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-port-azur-witness", path: PATHS.REVOLUTIONARY,
      title: "Le témoin au manteau de tickets",
      description: "À Port-Azur, un comptable a cousu les preuves d’un trafic humain dans son manteau. Chaque ticket arraché détruit une partie de la comptabilité.",
      zones: ["port-azur"], rarity: EVENT_RARITY.UNCOMMON, tags: ["witness", "trafficking", "protection"],
      choices: [
        { id: "escort-witness", text: "Protéger le témoin jusqu’à une presse clandestine", choiceTag: "Sacrifice",
          success: { result: "Le témoin atteint la responsable des presses clandestines et les comptes paraissent dans plusieurs journaux.", effects: { popularity: 4, morale: 3 }, minimumStats: { ship: 3 }, dreamProgressByDream: { "break-the-chains": 2, "reveal-void-century": 1 }, flags: { protectedTicketcoatWitness: true, publishedTraffickingAccounts: true }, important: true },
          setback: { result: "Une poursuite arrache plusieurs tickets, mais le témoin survit avec une partie des preuves.", effects: { health: -5, morale: -2 }, flags: { ticketcoatEvidenceDamaged: true } } },
        { id: "copy-coat", text: "Copier les tickets avant le déplacement", choiceTag: "Prudence",
          success: { result: "L’archiviste reconstitue la comptabilité et crée plusieurs copies sûres.", effects: { morale: 3 }, requiredFlags: { metNeroDrypaper: true }, dreamProgressByDream: { "reveal-void-century": 2 }, flags: { copiedTicketcoatEvidence: true } },
          setback: { result: "L’encre se transfère mal et rend certains noms illisibles.", effects: { morale: -2 }, flags: { partialTicketcoatCopy: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-whispering-poneglyph", path: PATHS.REVOLUTIONARY,
      title: "Le Ponéglyphe sous les voix",
      description: "Aux Récifs Murmurants, une pierre gravée affleure à marée basse. Les échos répètent une traduction différente selon la personne qui approche.",
      zones: ["whispering-reefs"], rarity: EVENT_RARITY.UNCOMMON, tags: ["poneglyph", "void-century", "archive"],
      important: true,
      choices: [
        { id: "document-stone", text: "Documenter chaque symbole avant la marée", choiceTag: "Sagesse",
          success: { result: "L’archiviste réalise un relevé complet et distingue une référence au Siècle oublié.", effects: { morale: 4 }, requiredTraits: ["curieux"], dreamProgressByDream: { "reveal-void-century": 3 }, flags: { documentedWhisperingPoneglyph: true }, important: true },
          setback: { result: "La marée recouvre les dernières lignes et brouille plusieurs relevés.", effects: { health: -3, morale: -2 }, flags: { partialWhisperingPoneglyphRubbing: true } } },
        { id: "hide-stone", text: "Masquer la pierre avant l’arrivée du Cipher Pol", choiceTag: "Prudence",
          success: { result: "La saboteuse dévie le courant et ensevelit la pierre sous un récif artificiel.", effects: { ship: 1, morale: 2 }, requiredFlags: { metPivoineSaboteur: true }, dreamProgressByDream: { "reveal-void-century": 2 }, flags: { concealedWhisperingPoneglyph: true } },
          setback: { result: "Le déplacement attire l’attention d’un navire d’observation.", effects: { morale: -3 }, flags: { cipherPolSawPoneglyphSite: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-seven-current-route", path: PATHS.REVOLUTIONARY,
      title: "La route sous les racines de Sabaody",
      description: "L’agente clandestine découvre un passage qui n’apparaît qu’entre les racines de deux mangroves géants. Il pourrait relier plusieurs cellules sans franchir les contrôles des quais.",
      zones: ["seven-current-archipelago"], rarity: EVENT_RARITY.UNCOMMON, tags: ["route", "network", "currents"],
      choices: [
        { id: "map-route", text: "Cartographier le passage avec plusieurs équipages", choiceTag: "Organisation",
          success: { result: "Les relevés concordent et la route sous les racines devient un axe clandestin majeur.", effects: { ship: 3, morale: 3 }, minimumStats: { ship: 4 }, dreamProgressByDream: { "build-underground-network": 3 }, flags: { mappedEighthSecretCurrent: true }, important: true },
          setback: { result: "Un changement magnétique sépare les équipes et détruit plusieurs repères.", effects: { ship: -2, morale: -2 }, flags: { eighthCurrentMarkersLost: true } } },
        { id: "limit-route", text: "Réserver la route aux évacuations urgentes", choiceTag: "Prudence",
          success: { result: "Le passage reste presque inconnu et sauve immédiatement une cellule menacée.", effects: { morale: 3 }, dreamProgressByDream: { "build-underground-network": 2, "break-the-chains": 1 }, flags: { reservedEighthCurrentForRescue: true } },
          setback: { result: "Le manque de pilotes limite la première évacuation.", effects: { morale: -2 }, flags: { eighthCurrentNeedsPilots: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-brass-power-sabotage", path: PATHS.REVOLUTIONARY,
      title: "La chaudière du palais",
      description: "La centrale du Royaume de Cuivre alimente le palais et les colliers de travail des mines. La détruire libérerait les ouvriers mais priverait aussi l’hôpital d’énergie.",
      zones: ["kingdom-of-brass"], rarity: EVENT_RARITY.UNCOMMON, tags: ["sabotage", "slavery", "infrastructure"],
      choices: [
        { id: "separate-grid", text: "Isoler le réseau des colliers", choiceTag: "Prudence",
          success: { result: "La saboteuse coupe le bon circuit : les colliers s’ouvrent et l’hôpital reste éclairé.", effects: { morale: 5, combat: 1 }, requiredFlags: { recruitedPivoineSaboteur: true }, dreamProgressByDream: { "break-the-chains": 3 }, flags: { disabledBrassLaborCollars: true }, important: true },
          setback: { result: "Le plan est obsolète et une partie de la mine plonge dans le noir.", effects: { health: -4, morale: -3 }, flags: { brassMineBlackout: true } } },
        { id: "seize-plant", text: "Occuper la centrale avec les ouvriers", choiceTag: "Rébellion",
          success: { result: "Les ouvriers prennent le contrôle et organisent une distribution publique de l’énergie.", effects: { popularity: 3, morale: 4 }, minimumStats: { morale: 55 }, dreamProgressByDream: { "found-free-nation": 2, "break-the-chains": 2 }, flags: { workersControlBrassPowerPlant: true }, important: true },
          setback: { result: "La garde encercle la centrale et coupe les conduites extérieures.", effects: { health: -6, morale: -3 }, flags: { brassPowerPlantBesieged: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-port-azur-broadcast", path: PATHS.REVOLUTIONARY,
      title: "L’Escargophone aux mille oreilles",
      description: "À Port-Azur, un relais peut diffuser un message dans plusieurs royaumes. Une seule transmission est possible avant l’arrivée du Cipher Pol.",
      zones: ["port-azur"], rarity: EVENT_RARITY.UNCOMMON, tags: ["broadcast", "propaganda", "truth"],
      choices: [
        { id: "broadcast-testimony", text: "Diffuser les témoignages et les preuves", choiceTag: "Vérité",
          success: { result: "Les voix des victimes traversent Paradise avant que le relais soit coupé.", effects: { popularity: 5, morale: 4 }, requiredFlags: { publishedTraffickingAccounts: true }, dreamProgressByDream: { "reveal-void-century": 2, "break-the-chains": 2 }, flags: { broadcastGrandLineTestimonies: true }, important: true },
          setback: { result: "Le signal est brouillé après quelques noms, mais suffisamment de ports l’entendent.", effects: { popularity: 2, morale: -1 }, flags: { partialGrandLineTestimonyBroadcast: true } } },
        { id: "coordinate-cells", text: "Transmettre des instructions aux cellules", choiceTag: "Organisation",
          success: { result: "L’agente clandestine déclenche une série d’opérations coordonnées dans plusieurs mers.", effects: { morale: 4 }, requiredFlags: { expandedNewspaperAgentRoute: true }, dreamProgressByDream: { "build-underground-network": 3 }, flags: { coordinatedMultiSeaRevolutionaryOperation: true }, important: true },
          setback: { result: "Le Cipher Pol localise plusieurs récepteurs avant la fin du message.", effects: { morale: -4 }, flags: { cipherPolMappedBroadcastReceivers: true } } },
      ],
    }),

    // GRAND LINE — Événements rares
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-rare-cipher-pol-hunt", path: PATHS.REVOLUTIONARY,
      title: "La nuit des masques blancs",
      description: "Une unité du Cipher Pol chasse l’agente clandestine, l’archiviste et la saboteuse simultanément. L’agente du Cipher Pol dirige l’opération depuis un Escargophone dont l’écran reflète toujours une pièce vide.",
      rarity: EVENT_RARITY.RARE, tags: ["cipher-pol", "allies", "operation"],
      important: true,
      choices: [
        { id: "counter-operation", text: "Coordonner une extraction simultanée", choiceTag: "Organisation",
          success: { result: "Les trois routes se croisent sans se révéler et l’unité de l’agente du Cipher Pol capture ses propres leurres.", effects: { morale: 5, ship: 1 }, minimumStats: { crew: 3 }, dreamProgressByDream: { "build-underground-network": 3 }, flags: { defeatedWhiteMaskOperation: true, savedGrandLineContacts: true }, important: true },
          setback: { result: "Deux contacts échappent au piège, mais une route majeure est brûlée.", effects: { morale: -4, fortune: -10000 }, flags: { lostRouteToWhiteMasks: true }, important: true } },
        { id: "strike-verre", text: "Remonter l’opération jusqu’à l’agente du Cipher Pol", choiceTag: "Audace",
          success: { result: "L’agente du Cipher Pol abandonne son poste et laisse derrière lui une liste d’agents compromis.", effects: { combat: 2, popularity: 3 }, requiredFlags: { cendreExposedCipherInfiltrator: true }, flags: { forcedCipherAgentGlassRetreat: true, seizedWhiteMaskList: true }, important: true },
          setback: { result: "L’agente du Cipher Pol n’était qu’une projection d’Escargophone et l’embuscade se referme.", effects: { health: -8, morale: -3 }, flags: { ambushedByCipherAgentGlass: true } } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-rare-void-century-fragment", path: PATHS.REVOLUTIONARY,
      title: "Le nom effacé du Siècle oublié",
      description: "Un fragment d’archive et le relevé d’un Ponéglyphe mentionnent le même royaume disparu. L’archiviste peut publier immédiatement ou chercher une preuve supplémentaire.",
      rarity: EVENT_RARITY.RARE, tags: ["void-century", "poneglyph", "truth"],
      important: true,
      choices: [
        { id: "publish-fragment", text: "Diffuser le rapprochement avec ses incertitudes", choiceTag: "Vérité",
          success: { result: "Le monde découvre une piste vérifiable plutôt qu’une certitude fabriquée.", effects: { popularity: 5, morale: 4 }, requiredFlags: { documentedWhisperingPoneglyph: true }, dreamProgressByDream: { "reveal-void-century": 4 }, flags: { publishedVoidCenturyKingdomClue: true }, important: true },
          setback: { result: "Le Gouvernement mondial noie la révélation sous de faux documents.", effects: { popularity: -2, morale: -3 }, flags: { truthBuriedUnderForgeries: true } } },
        { id: "seek-proof", text: "Protéger le fragment et chercher une autre source", choiceTag: "Prudence",
          success: { result: "L’agente clandestine sécurise trois copies sur des routes différentes.", effects: { morale: 3 }, requiredFlags: { mappedEighthSecretCurrent: true }, dreamProgressByDream: { "reveal-void-century": 3, "build-underground-network": 1 }, flags: { securedVoidCenturyFragmentCopies: true } },
          setback: { result: "Le déplacement attire le Cipher Pol et force à détruire une copie.", effects: { morale: -2 }, flags: { cipherPolHuntsVoidFragment: true } } },
      ],
    }),

    // GRAND LINE — Événements très rares
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-very-rare-four-dream-operation", path: PATHS.REVOLUTIONARY,
      title: "L’aube de quatre chemins",
      description: "Une île-prison contrôle une archive interdite, une route secrète et les ressources d’un peuple prêt à se gouverner. L’opération peut faire avancer un rêve, mais pas tous à la fois.",
      rarity: EVENT_RARITY.VERY_RARE, tags: ["dream", "prison", "archive", "territory"],
      important: true,
      choices: [
        { id: "follow-chosen-dream", text: "Concentrer l’opération sur ton rêve", choiceTag: "Sans retour",
          success: { result: "Toute l’opération s’aligne sur l’objectif poursuivi depuis le départ et obtient une avancée décisive.", effects: { popularity: 5, morale: 5 }, minimumStats: { morale: 65 }, dreamProgressByDream: { "break-the-chains": 5, "reveal-void-century": 5, "build-underground-network": 5, "found-free-nation": 5 }, flags: { achievedDecisiveGrandLineDreamAdvance: true }, important: true },
          setback: { result: "La concentration sauve l’essentiel, mais oblige à abandonner les autres objectifs de l’île.", effects: { health: -7, morale: -3 }, flags: { paidPriceForChosenDream: true }, important: true } },
        { id: "balance-objectives", text: "Tenter de préserver les quatre objectifs", choiceTag: "Sacrifice",
          success: { result: "Les équipes se relaient avec une précision exceptionnelle : captifs, archives, route et conseil survivent.", effects: { morale: 5, crew: 1 }, minimumStats: { crew: 4, ship: 5 }, dreamProgressByDream: { "break-the-chains": 3, "reveal-void-century": 3, "build-underground-network": 3, "found-free-nation": 3 }, flags: { preservedFourIslandObjectives: true }, important: true },
          setback: { result: "L’opération se disperse ; les prisonniers sont libérés, mais les archives et la route sont perdues.", effects: { morale: -4, health: -5 }, dreamProgressByDream: { "break-the-chains": 2 }, flags: { savedPrisonersLostIslandNetwork: true }, important: true } },
      ],
    }),
    createGrandLineFactionEvent({
      id: "revolutionary-grand-line-very-rare-free-nation-defense", path: PATHS.REVOLUTIONARY,
      title: "Sept jours pour une nation libre",
      description: "Le quartier libre du Royaume de Cuivre proclame son autonomie. Une flotte gouvernementale arrivera dans sept jours ; le conseil demande si la Révolution restera pour la défense.",
      zones: ["kingdom-of-brass"], rarity: EVENT_RARITY.VERY_RARE, tags: ["free-nation", "defense", "politics"],
      important: true,
      choices: [
        { id: "stand-with-nation", text: "Rester et préparer une défense durable", choiceTag: "Sans retour",
          success: { result: "Les ateliers, les routes et les habitants repoussent la flotte sans remplacer un maître par un autre.", effects: { combat: 3, popularity: 5, morale: 5 }, minimumStats: { combat: 25, morale: 65 }, requiredFlags: { builtBrassFreeDistrictCouncil: true }, dreamProgressByDream: { "found-free-nation": 5 }, flags: { defendedFirstFreeBrassNation: true, governmentLostBrassTerritory: true }, important: true },
          setback: { result: "La défense sauve la population mais pas le territoire, évacué avant la dernière salve.", effects: { health: -9, ship: -2, morale: -3 }, dreamProgressByDream: { "found-free-nation": 2 }, flags: { evacuatedBrassFreeNation: true }, important: true } },
        { id: "secure-recognition", text: "Chercher des alliances avant l’arrivée de la flotte", choiceTag: "Diplomatie",
          success: { result: "Des royaumes voisins et des journaux rendent le coût politique de l’attaque trop élevé.", effects: { popularity: 5, morale: 4 }, minimumStats: { popularity: 80 }, requiredFlags: { broadcastGrandLineTestimonies: true }, dreamProgressByDream: { "found-free-nation": 4, "build-underground-network": 2 }, flags: { securedRecognitionForFreeNation: true }, important: true },
          setback: { result: "Les alliés promettent leur soutien après la bataille, une précision arrivée beaucoup trop tard.", effects: { morale: -4 }, flags: { freeNationAlliesDelayed: true }, important: true } },
      ],
    })
  );

  /* ========================================================
     PACK DES MERS AVANCÉES
     Red Line, zones spéciales et Nouveau Monde

     Les scènes ci-dessous utilisent le moteur normal. La fabrique ne décide
     ni de la sélection ni des récompenses : elle garantit seulement la
     structure commune des issues et adapte les revers des zones spéciales à
     leur position réelle dans la route.
  ======================================================== */

  const ADVANCED_ZONE_BLOCKS = Object.freeze([
    { zone: "red-line", count: 18, rarities: [8, 6, 2, 2] },
    { zone: "starless-sea", count: 6, rarities: [2, 2, 1, 1] },
    { zone: "wandering-archipelago", count: 6, rarities: [2, 2, 1, 1] },
    { zone: "tempest-isle", count: 6, rarities: [2, 2, 1, 1] },
    { zone: "shinsekai", count: 18, rarities: [6, 6, 4, 2] },
  ]);

  const ADVANCED_DREAM_PROGRESS = Object.freeze({
    pirate: {
      "one-piece": 3,
      "sea-emperor": 3,
      "worlds-greatest-fortune": 3,
      "forgotten-history": 3,
    },
    marine: {
      "admiral": 3,
      "fleet-admiral": 3,
      "reform-the-marines": 3,
      "greatest-marine-hero": 3,
    },
    "bounty-hunter": {
      "greatest-bounty-hunter": 3,
      "most-dangerous-criminals": 3,
      "hunt-an-emperor": 3,
      "contract-fortune": 3,
    },
    revolutionary: {
      "break-the-chains": 3,
      "reveal-void-century": 3,
      "build-underground-network": 3,
      "found-free-nation": 3,
    },
  });

  function advancedRarity(block, index) {
    const [common, uncommon, rare] = block.rarities;
    if (index < common) return EVENT_RARITY.COMMON;
    if (index < common + uncommon) return EVENT_RARITY.UNCOMMON;
    if (index < common + uncommon + rare) return EVENT_RARITY.RARE;
    return EVENT_RARITY.VERY_RARE;
  }

  function advancedFlag(id, suffix) {
    return id
      .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/^[a-z]/, (letter) => letter.toLowerCase()) + suffix;
  }

  const SPECIAL_ZONE_IDS = Object.freeze([
    "starless-sea",
    "wandering-archipelago",
    "tempest-isle",
  ]);

  // Dette de migration : certains IDs et flags spéciaux conservent les anciens
  // noms Nox, Jasko, Cendre, Plico ou Fulga pour relire les sauvegardes V1.
  // Ces alias restent strictement techniques et ne doivent jamais être affichés.

  const SPECIAL_FACTION_CONTEXT = Object.freeze({
    pirate: {
      "starless-sea": "Cette anomalie coupe ta route et ton équipage doit résoudre la situation avant de pouvoir retrouver un cap sûr.",
      "wandering-archipelago": "Les îles mobiles ferment le passage de ton équipage : il faut intervenir pour retrouver une route navigable.",
      "tempest-isle": "L’orage enferme ton navire près de l’île et oblige ton équipage à agir avant la prochaine salve.",
    },
    marine: {
      "starless-sea": "La sécurité de la route relève de ta mission de Marine et les personnes présentes attendent une décision immédiate.",
      "wandering-archipelago": "Ta mission de Marine t’oblige à protéger les habitants et à rétablir une route praticable entre les îles.",
      "tempest-isle": "La garnison sollicite ton unité de Marine, seule force disponible avant que l’orage n’aggrave la crise.",
    },
    "bounty-hunter": {
      "starless-sea": "La piste et la sortie de la zone dépendent du même problème : terminer la chasse exige de le résoudre.",
      "wandering-archipelago": "Le déplacement des îles brouille ton contrat et t’oblige à intervenir pour conserver la piste de ta cible.",
      "tempest-isle": "Ta cible profite de l’orage pour disparaître ; résoudre la crise est le seul moyen de préserver le contrat.",
    },
    revolutionary: {
      "starless-sea": "La survie du réseau clandestin dépend de ta décision avant que le Gouvernement mondial ne repère cette route.",
      "wandering-archipelago": "La cellule locale demande ton aide : le mouvement des îles menace directement son opération et les habitants.",
      "tempest-isle": "La cellule locale ne peut agir sous la surveillance du Gouvernement mondial sans ton appui immédiat.",
    },
  });

  function getSpecialFactionContext(path, zoneId) {
    return SPECIAL_FACTION_CONTEXT[path]?.[zoneId] ||
      "Le phénomène bloque ta progression et exige une décision immédiate.";
  }

  function specialSceneIsPhysical(scene) {
    const context = `${scene.title} ${scene.description} ${(scene.tags || []).join(" ")}`.toLowerCase();
    return /storm|tempête|foudre|combat|battle|duel|prison|rescue|sauvetage|chasse|hunt|target|cible|sea-beast|créature|collision|harbor|port|navigation|courant|escalad|assaut|patrouille/.test(context);
  }

  function getSpecialResult(scene, action, kind) {
    if (kind === "bold") {
      return "L'intervention neutralise le danger immédiat et permet aux personnes concernées de reprendre leur route.";
    }
    if (kind === "setback") {
      return specialSceneIsPhysical(scene)
        ? "Le danger propre à la zone referme le passage. Tu extrais les tiens dans l'urgence sans atteindre l'objectif immédiat."
        : "Un élément essentiel échappe au plan. Le groupe renonce avant que la situation ne s'aggrave.";
    }
    return "La précaution révèle une ouverture, protège les personnes concernées et résout la crise sans l'aggraver.";
  }

  function createAdvancedEvent(path, block, index, scene) {
    const rarity = advancedRarity(block, index);
    const id = `${path === PATHS.BOUNTY_HUNTER ? "bounty-hunter" : path}-${scene.id}`;
    const late = block.zone === "shinsekai";
    const special = SPECIAL_ZONE_IDS.includes(block.zone);
    const major = rarity === EVENT_RARITY.VERY_RARE && Boolean(scene.major);
    const resolutionCategory = specialSceneIsPhysical(scene) ? "action" : "social";
    const configuredStat = scene.stat || (resolutionCategory === "action" ? "combat" : "charisma");
    const mainStat = resolutionCategory === "action"
      ? (["health", "combat", "haki"].includes(configuredStat) ? configuredStat : "combat")
      : (["charisma", "intelligence", "bounty"].includes(configuredStat) ? configuredStat : "charisma");
    const winEffects = late
      ? { [mainStat]: mainStat === "bounty" ? 120000 : 3, popularity: 2 }
      : { [mainStat]: mainStat === "bounty" ? 70000 : 2, popularity: 1 };
    const carefulEffects = late
      ? { [resolutionCategory === "action" ? "haki" : "intelligence"]: 2, popularity: 1 }
      : { [resolutionCategory === "action" ? "haki" : "intelligence"]: 1, popularity: 1 };
    const setback = resolutionCategory === "action"
      ? { health: late ? -10 : -7, fortune: late ? -7000 : -4000 }
      : { charisma: late ? -4 : -3, fortune: late ? -7000 : -4000 };
    const dreamProgressByDream = major
      ? ADVANCED_DREAM_PROGRESS[path] || {}
      : {};
    const specialistEffects = resolutionCategory === "action" ? { combat: 1, haki: 1 } : { charisma: 1, intelligence: 1 };
    const lateRouteEffects = { [resolutionCategory === "action" ? "haki" : "intelligence"]: late ? 2 : 1, popularity: 1 };
    const measuredFallbackEffects = { [resolutionCategory === "action" ? "haki" : "charisma"]: -1 };
    const boldSetbackEffects = special
      ? specialSceneIsPhysical(scene)
        ? {
            health: -5,
            morale: -2,
            ...(block.zone === "tempest-isle" ? { ship: -1 } : {}),
          }
        : { charisma: -2, fortune: -2500 }
      : setback;
    const description = special
      ? `${scene.description} ${getSpecialFactionContext(path, block.zone)}`
      : scene.description;
    const eventRequiredFlags = special && scene.tags?.includes("callback")
      ? { ...(scene.requiredFlags || {}), ...(scene.callbackFlags || {}) }
      : scene.requiredFlags || {};

    return createEvent({
      id,
      title: scene.title,
      description,
      category: block.zone,
      tags: [path, block.zone, ...(scene.tags || [])],
      eventType: scene.dangerTheme ? EVENT_TYPES.RISK : EVENT_TYPES.ORDINARY,
      resolutionCategory,
      paths: [path],
      zones: [block.zone],
      rarity,
      weight: RARITY_WEIGHTS[rarity],
      minMonth: 1,
      maxMonth: 24,
      important: major,
      highStakes: Boolean(
        scene.highStakes ||
        (major && (scene.dangerTheme || rarity === EVENT_RARITY.VERY_RARE)),
      ),
      requiresD: scene.requiresD ?? null,
      requiresFruit: scene.requiresFruit ?? null,
      requiredFlags: eventRequiredFlags,
      forbiddenFlags: scene.forbiddenFlags || [],
      condition: special
        ? ({ zoneId, specialZoneId }) =>
            zoneId === block.zone && specialZoneId === block.zone
        : null,
      choices: [
        {
          id: `${id}-bold`,
          text: scene.bold,
          choiceTag: scene.boldTag || (major ? "Sans retour" : ""),
          resolutionWeights: resolutionCategory === "action"
            ? { health: 0.2, combat: 0.55, haki: 0.25 }
            : { charisma: 0.45, intelligence: 0.2, renown: 0.35 },
          outcomes: [
            {
              id: `${id}-bold-mastered`,
              result: `${special ? getSpecialResult(scene, scene.bold, "bold") : scene.boldResult} ${describeNarrativeEffects(winEffects)}`.trim(),
              effects: winEffects,
              minimumStats: { [mainStat]: mainStat === "bounty" ? (late ? 900000 : 400000) : late ? 26 : 20 },
              requiredTraits: scene.boldTrait ? [scene.boldTrait] : [],
              requiredFlags: scene.callbackFlags || {},
              flags: {
                [advancedFlag(id, "Mastered")]: true,
                ...(scene.winFlags || {}),
              },
              dreamProgressByDream,
              important: major,
              weight: 3,
            },
            {
              id: `${id}-bold-specialist`,
              result: scene.styleResult
                ? `${scene.styleResult} ${describeNarrativeEffects(specialistEffects)}`.trim()
                : special
                ? `${getSpecialResult(scene, scene.bold, "bold")} Ta spécialité te permet d’exécuter la manœuvre malgré l’anomalie de la zone. ${describeNarrativeEffects(specialistEffects)}`.trim()
                :
                contextualResult(
                  scene.title,
                  scene.bold,
                  `Ta spécialité te permet d’adapter la manœuvre au dernier instant dans « ${scene.title} ». Tu contiens le danger et dégages le navire avant que la situation ne se referme.`,
                  specialistEffects,
                ),
              effects: specialistEffects,
              requiredCombatStyles: resolutionCategory === "action"
                ? (scene.style ? [scene.style] : ["navigateur"])
                : [],
              requiredTraits: resolutionCategory === "social"
                ? [scene.measuredTrait || "prudent"]
                : [],
              flags: { [advancedFlag(id, "Specialist")]: true },
              weight: 1,
            },
            {
              id: `${id}-bold-setback`,
              result: `${special ? getSpecialResult(scene, scene.bold, "setback") : scene.setback} ${describeNarrativeEffects(boldSetbackEffects)}`.trim(),
              effects: boldSetbackEffects,
              condition: special
                ? ({ routeStage }) => routeStage <= 3
                : null,
              flags: { [advancedFlag(id, "CostPaid")]: true },
              fallback: true,
              weight: 2,
            },
          ],
        },
        {
          id: `${id}-measured`,
          text: scene.measured,
          choiceTag: scene.measuredTag || "",
          resolutionWeights: resolutionCategory === "action"
            ? { health: 0.15, combat: 0.2, haki: 0.65 }
            : { charisma: 0.2, intelligence: 0.65, renown: 0.15 },
          outcomes: [
            {
              id: `${id}-measured-success`,
              result: `${special ? getSpecialResult(scene, scene.measured, "measured") : scene.measuredResult} ${describeNarrativeEffects(carefulEffects)}`.trim(),
              effects: carefulEffects,
              requiredTraits: [scene.measuredTrait || "prudent"],
              flags: {
                [advancedFlag(id, "Prepared")]: true,
                ...(scene.preparedFlags || {}),
              },
              weight: 3,
            },
            {
              id: `${id}-measured-late-route`,
              result: scene.lateResult
                ? `${scene.lateResult} ${describeNarrativeEffects(lateRouteEffects)}`.trim()
                : special
                ? `${getSpecialResult(scene, scene.measured, "measured")} L’expérience acquise plus tôt sur la route te fait anticiper la prochaine réaction de la zone. ${describeNarrativeEffects(lateRouteEffects)}`.trim()
                :
                contextualResult(
                  scene.title,
                  scene.measured,
                  `L’expérience de la route t’aide à sentir le danger avant qu’il ne se manifeste. Dans « ${scene.title} », cette anticipation protège les témoins et marque durablement les esprits.`,
                  lateRouteEffects,
                ),
              effects: lateRouteEffects,
              condition: ({ routeIndex, zoneDifficulty }) =>
                routeIndex >= 3 || zoneDifficulty >= 4,
              flags: { [advancedFlag(id, "LateRouteInsight")]: true },
              weight: 1,
            },
            {
              id: `${id}-measured-fallback`,
              result: scene.measuredFallback
                ? `${scene.measuredFallback} ${describeNarrativeEffects(measuredFallbackEffects)}`.trim()
                : special
                ? `${getSpecialResult(scene, scene.measured, "setback")} ${describeNarrativeEffects(measuredFallbackEffects)}`.trim()
                :
                contextualResult(
                  scene.title,
                  scene.measured,
                  `La précaution évite le pire, mais l’objectif central de « ${scene.title} » reste hors d’atteinte. Le groupe repart frustré d’avoir dû abandonner une partie du plan.`,
                  measuredFallbackEffects,
                ),
              effects: measuredFallbackEffects,
              flags: { [advancedFlag(id, "Observed")]: true },
              fallback: true,
              weight: 2,
            },
          ],
        },
      ],
    });
  }

  function scene(id, title, description, bold, measured, extra = {}) {
    return {
      id, title, description, bold, measured,
      boldResult: extra.boldResult ||
        "L'initiative prend l'opposition de vitesse et ouvre le passage recherché. Les personnes présentes comprennent aussitôt le risque engagé.",
      setback: extra.setback ||
        "La riposte bloque la manœuvre. Tu extrais les tiens sous les coups, sans pouvoir atteindre l'objectif immédiat.",
      measuredResult: extra.measuredResult ||
        "La préparation révèle le moment exact où intervenir. L'objectif est atteint sans exposer inutilement le groupe.",
      ...extra,
    };
  }

  const ADVANCED_SCENES = Object.freeze({
    pirate: [
      // RED LINE — passages, institutions et Gouvernement mondial
      scene("red-line-government-convoy", "Les coffres aux cinq sceaux", "Un convoi du Gouvernement mondial gravit un canal fortifié. Ses manifestes mentionnent des vivres ; ses gardes portent des chaînes d’esclaves.", "Aborder le vaisseau de tête", "Substituer les manifestes", { tags: ["government", "convoy"], boldTag: "Audace", stat: "bounty", winFlags: { seizedFiveSealCargo: true } }),
      scene("red-line-port-inspection", "L’inspectrice au monocle carré", "Une inspectrice portuaire qui mesure les pavillons à la règle, bloque ton navire pour une irrégularité qu’elle vient d’inventer.", "Faire voler la barrière", "Jouer avec son règlement", { tags: ["inspection", "port"], measuredTrait: "rusé", preparedFlags: { fooledInspectorQuarte: true } }),
      scene("red-line-underground-passage", "La veine sous le continent", "Un mineur local connaît un tunnel dont les rails plongent sous Red Line, mais une garnison utilise déjà sa sortie.", "Forcer la sortie", "Détourner le wagon postal", { tags: ["passage", "smuggling"], style: "inventeur", winFlags: { openedSilexPassage: true } }),
      scene("red-line-smuggler-offer", "La barque de la passeuse", "Une passeuse de Red Line propose un passage dans des tonneaux diplomatiques. Elle réclame en échange une faveur dont elle refuse encore de préciser la nature.", "Accepter sa dette", "Négocier une faveur limitée", { tags: ["smuggling", "debt"], stat: "fortune", preparedFlags: { owesMotherContrabandFavor: true } }),
      scene("red-line-marine-chain", "La chaîne des douze canons", "Une escadre de la Marine tend une chaîne entre deux forts et attend que le courant livre ton équipage.", "Briser le maillon central", "Faire croire à une collision", { tags: ["marine", "chase"], style: "utilisateur-armes", boldTag: "Risqué" }),
      scene("red-line-rival-route", "La capitaine rivale et la porte trop étroite", "La capitaine rivale surgit devant l’unique écluse clandestine. Selon votre histoire, elle apporte du rhum, des canons ou les deux.", "Passer côte à côte", "Lui céder la première manœuvre", { tags: ["callback", "rival"], callbackFlags: { sparedAlbaRival: true }, winFlags: { crossedRedLineWithAlba: true } }),
      scene("red-line-prison-barge", "La cale qui chante faux", "Des prisonniers politiques chantent sous le pont d’une barge. Leur libération révélerait immédiatement ta position.", "Rompre leurs chaînes", "Organiser une fuite au prochain sas", { tags: ["prisoners", "choice"], boldTag: "Sacrifice", winFlags: { freedRedLinePrisoners: true } }),
      scene("red-line-celestial-cargo", "Les caisses qui ne touchent pas le sol", "Une cargaison destinée aux Nobles Mondiaux voyage sur des coussins portés par des condamnés. Même les douaniers refusent de la regarder.", "Saisir la cargaison", "Libérer les porteurs sans voler", { tags: ["celestial-dragons", "slavery"], boldTag: "Rébellion" }),
      scene("red-line-corrupt-officer", "Le capitaine aux poches sonores", "Un capitaine corrompu accepte les pots-de-vin, mais chaque pièce cousue dans son manteau trahit ses mouvements.", "Acheter son silence", "Enregistrer ses aveux", { tags: ["corruption", "marine"], stat: "fortune", measuredTrait: "opportuniste" }),
      scene("red-line-repair-yard", "Le chantier suspendu", "Le chantier naval local répare les navires au-dessus du vide. La Marine vient de réquisitionner toutes ses chaînes.", "Voler les chaînes", "Réparer pendant la relève", { tags: ["ship", "repair"], stat: "ship", style: "inventeur" }),
      scene("red-line-rival-smugglers", "La guerre des faux passeports", "Deux réseaux vendent le même passage secret et chacun accuse l’autre d’avoir livré des équipages au Cipher Pol.", "Imposer un accord", "Tester les deux itinéraires", { tags: ["smugglers", "cipher-pol"], measuredTrait: "prudent" }),
      scene("red-line-prisoner-choice", "Le géomètre condamné", "Un géomètre sait où Red Line est creuse. Il a aussi vendu autrefois un village entier à un trafiquant.", "L’embarquer malgré son passé", "Prendre sa carte et le laisser juger", { tags: ["prisoner", "secret"], boldTag: "Quitte ou double" }),
      scene("red-line-forbidden-elevator", "L’ascenseur des ministres absents", "Un ascenseur officiel descend vide vers un port interdit. Son Escargophone récite la liste des ministres attendus.", "Prendre leur place", "Saboter les contrepoids", { tags: ["government", "infiltration"], style: "inventeur" }),
      scene("red-line-buster-ledger", "Le registre des îles à effacer", "Dans un bureau abandonné, un registre classe des îles selon la probabilité d’un futur Buster Call.", "Voler le registre", "Modifier les priorités", { tags: ["buster-call", "secret"], boldTag: "Sans retour", winFlags: { stoleFutureBusterCallLedger: true } }),
      scene("red-line-rare-world-bounty", "La prime qui couvre un mur", "Le journal attribue à ton équipage trois attaques commises la même nuit. La prime devient assez grande pour transformer chaque port en piège.", "Revendiquer les trois exploits", "Démasquer le faussaire", { tags: ["bounty", "newspaper"], stat: "bounty", boldTag: "Quitte ou double", major: false }),
      scene("red-line-rare-vice-admiral", "Le poing du vice-amiral", "Le vice-amiral chargé de la poursuite ferme lui-même la dernière passe. Son Fluide de l’Armement fend le quai avant même qu’il ne frappe ton navire.", "Tenir le passage", "L’attirer loin de l’équipage", { tags: ["vice-admiral", "haki"], stat: "haki", style: "epeiste" }),
      scene("red-line-very-rare-buster-choice", "La cloche du Buster Call", "Le registre volé permet de détourner un ordre visant une île innocente, mais toute intervention désignera ton équipage comme responsable.", "Briser la chaîne de commandement", "Évacuer l’île en secret", { tags: ["buster-call", "world"], boldTag: "Sans retour", major: true, dangerTheme: true, requiredFlags: { stoleFutureBusterCallLedger: true }, winFlags: { preventedRedLineBusterCall: true } }),
      scene("red-line-very-rare-lore-shadow", "Le manteau rouge sur la passerelle", "Une silhouette connue du monde entier traverse la passerelle d’un navire révolutionnaire. Son simple regard immobilise les poursuivants.", "Couvrir son passage", "Profiter du silence pour franchir Red Line", { tags: ["lore", "revolutionary-army"], boldTag: "Honneur", major: true, winFlags: { aidedLegendaryRevolutionaryPassage: true } }),

      // MER SANS ÉTOILES — obscurité, voix et navigation aveugle
      scene("special-starless-sea-blind-compass", "La boussole faussée par les vibrations", "Dans la Mer sans étoiles, une boussole modifiée dévie chaque fois qu'un Escargophone transmet à proximité. Quelqu'un utilise les communications du bord pour fausser le cap.", "Naviguer sans instrument", "Isoler la transmission clandestine", { tags: ["darkness", "navigation", "sabotage"], stat: "ship", style: "navigateur" }),
      scene("special-starless-sea-lantern-pirates", "Les pirates aux lanternes éteintes", "Un équipage peint des flammes noires sur ses lanternes et rançonne ceux qui suivent leur lumière invisible.", "Suivre leur sillage", "Allumer cent leurres", { tags: ["darkness", "rivalry"], style: "sniper" }),
      scene("special-starless-sea-voice-wreck", "Les Tone Dials de l’épave", "Une épave diffuse les voix de précédents naufragés grâce à des Tone Dials endommagés. Parmi les enregistrements, une voix décrit pourtant ton navire actuel.", "Monter à bord pour retrouver l'enregistreur", "Diffuser une fausse réponse depuis le navire", { tags: ["mystery", "tone-dial"], measuredTrait: "rusé" }),
      scene("special-starless-sea-black-feast", "Le banquet derrière les paravents", "Des habitants de la Mer sans étoiles servent un banquet derrière d'épais paravents pour ne révéler ni leurs visages ni leur refuge. Une place d'honneur attend ton capitaine.", "Accepter leur protocole", "Offrir une chanson avant de négocier", { tags: ["humor", "inhabitants"], style: "musicien" }),
      scene("special-starless-sea-rare-observation", "Voir ce que la nuit cache", "Une navigatrice aveugle affirme que l’obscurité totale peut éveiller le Fluide de l’Observation.", "Suivre son épreuve", "Observer sa manière d’écouter", { tags: ["haki", "mentor"], stat: "haki", winFlags: { trainedWithNoxClear: true } }),
      scene("special-starless-sea-very-rare-king-echo", "Le battement sous la mer noire", "Quelque chose sous la coque répond à la volonté du capitaine. Les plus faibles s’évanouissent sans qu’aucune créature apparaisse.", "Protéger l’équipage par ta volonté", "Quitter le cercle sans provoquer l’abîme", { tags: ["kings-haki", "mystery"], boldTag: "Sans retour", major: true, requiresD: true }),

      // ARCHIPEL MOUVANT — îles vivantes, cartographie et peuples nomades
      scene("special-wandering-archipelago-stolen-island", "L’île volée pendant le déjeuner", "L’équipage revient de la plage : l’île voisine a changé de place avec le trésor et la chaloupe.", "Poursuivre l’île", "Attendre son prochain passage", { tags: ["moving-islands", "humor"], stat: "ship" }),
      scene("special-wandering-archipelago-turtle-map", "La carte sur la tortue géante", "Le cartographe tatoue ses routes sur une tortue qui refuse obstinément le nord.", "Suivre la tortue", "Copier ses cicatrices", { tags: ["exploration", "inhabitants"], style: "navigateur" }),
      scene("special-wandering-archipelago-nomad-market", "Le marché qui change d’île", "Chaque étal dérive sur une île différente et les prix varient selon la distance parcourue en criant.", "Acheter en pleine collision", "Unir les îlots avec des amarres", { tags: ["market", "humor"], stat: "fortune" }),
      scene("special-wandering-archipelago-island-duel", "Le duel des deux rivages", "Un rival revendique une plage qui se détache de son île au début du duel.", "Continuer sur les rochers mouvants", "Transformer le duel en course", { tags: ["rival", "geography"], boldTag: "Honneur" }),
      scene("special-wandering-archipelago-rare-living-log", "Le Log Pose vivant", "Une graine magnétique pousse autour du Log Pose et pointe vers les désirs de l’équipage plutôt que vers une île.", "Planter la graine sur le mât", "Étudier ses quatre directions", { tags: ["log-pose", "mystery"], stat: "ship", winFlags: { grewLivingLogPose: true } }),
      scene("special-wandering-archipelago-very-rare-united-isles", "Le jour où les îles se rassemblent", "Une fois par génération, toutes les îles forment un continent éphémère où les clans choisissent le gardien de leurs routes.", "Défendre leur réunion", "Refuser la couronne des routes", { tags: ["territory", "alliance"], boldTag: "Sans retour", major: true, winFlags: { alliedWanderingIslandClans: true } }),

      // ÎLE DE LA TEMPÊTE — foudre, installations et peuple des paratonnerres
      scene("special-tempest-isle-lightning-harbor", "Le port entre deux éclairs", "Le port n’existe que pendant les sept secondes séparant deux impacts réguliers.", "Entrer à pleine voile", "Compter le rythme avec les habitants", { tags: ["storm", "harbor"], stat: "ship" }),
      scene("special-tempest-isle-thunder-kitchen", "La cuisine au tonnerre", "Un cuisinier insulaire utilise la foudre pour saisir cent poissons à la fois et vient de charger le mauvais nuage.", "Détourner l’éclair", "Déplacer le banquet", { tags: ["humor", "feast"], style: "inventeur" }),
      scene("special-tempest-isle-storm-smugglers", "Les contrebandiers du paratonnerre", "Des trafiquants cachent des Fruits du Démon factices dans les paratonnerres sacrés de l’île.", "Grimper sous l’orage", "Faire parler leur acheteur", { tags: ["devil-fruit", "smuggling"], boldTag: "Risqué" }),
      scene("special-tempest-isle-copper-chief", "La cheffe aux cheveux debout", "La cheffe des gardiens accuse ton pavillon d’avoir volé la cloche qui commande les éclairs.", "Retrouver la cloche dans l’œil", "Prouver le faux témoignage", { tags: ["inhabitants", "politics"], stat: "popularity" }),
      scene("special-tempest-isle-rare-storm-fruit", "Le fruit dans la cage de cuivre", "Un véritable Fruit du Démon repose dans une cage frappée par la foudre. Trois équipages attendent que quelqu’un touche le verrou.", "Ouvrir la cage", "Vendre seulement sa position", { tags: ["devil-fruit", "treasure"], boldTag: "Quitte ou double", winFlags: { locatedTempestDevilFruit: true } }),
      scene("special-tempest-isle-very-rare-eternal-eye", "L’œil éternel de la tempête", "Au centre du cyclone, un Ponéglyphe météorologique décrit une route que même les journaux du Gouvernement mondial ont effacée.", "Graver le relevé sous la foudre", "Sauver d’abord les gardiens piégés", { tags: ["poneglyph", "history"], boldTag: "Sacrifice", major: true, dangerTheme: true, winFlags: { copiedTempestWeatherPoneglyph: true } }),

      // NOUVEAU MONDE — Empereurs, flottes et rêve final
      scene("shinsekai-emperor-territory", "Le port qui paie un Empereur", "Chaque maison porte le même pavillon d’Empereur. Les habitants paient en nourriture pour éviter les razzias d’un commandant glouton.", "Arracher son pavillon", "Convaincre le port de cesser le tribut", { tags: ["emperor", "territory"], boldTag: "Rébellion", winFlags: { challengedEmperorTerritory: true } }),
      scene("shinsekai-alliance-offer", "La coupe de l’alliance brisée", "Trois capitaines proposent une alliance, mais la coupe cérémonielle porte déjà une fissure correspondant exactement à ton pavillon.", "Boire malgré le présage", "Réécrire les termes devant tous", { tags: ["alliance", "fleet"], boldTag: "Diplomatie" }),
      scene("shinsekai-ultimatum", "Trois jours pour plier le genou", "Un commandant d’Empereur exige ton pavillon, ton Log Pose et le meilleur dessert de ton cuisinier.", "Répondre par le canon", "Livrer un dessert piégé d’humiliation", { tags: ["emperor", "ultimatum", "humor"], measuredTrait: "créatif" }),
      scene("shinsekai-fleet-war", "La mer couverte de voiles", "Deux flottes ferment l’horizon et demandent ton choix avant la première salve.", "Percer le centre de la bataille", "Unir les capitaines indépendants", { tags: ["war", "fleet"], boldTag: "Sans retour", winFlags: { ledIndependentNewWorldFleet: true } }),
      scene("shinsekai-crew-crisis", "Le vote sous le mât fendu", "Après des semaines de guerre, l’équipage exige de choisir entre ton rêve et la survie du navire.", "Défendre ton rêve sans mentir", "Confier la décision à l’équipage", { tags: ["crew", "dream"], boldTag: "Honneur" }),
      scene("shinsekai-public-battle", "Le combat diffusé au monde", "La responsable des presses clandestines détourne un réseau d’Escargophones : ta bataille contre les un équipage pirate sera vue dans toutes les mers.", "Combattre sous les objectifs", "Couper le signal et sauver les otages", { tags: ["newspaper", "public"], stat: "popularity" }),
      scene("shinsekai-road-poneglyph-rubbing", "Le rouge sous la forteresse", "Une copie de Road Ponéglyphe repose sous la salle du trésor d’un commandant d’Empereur.", "Descendre pendant le banquet", "Échanger une route contre un relevé", { tags: ["road-poneglyph", "one-piece"], boldTag: "Audace", winFlags: { securedRoadPoneglyphRubbing: true } }),
      scene("shinsekai-alba-return", "Le quatrième retour de la capitaine rivale", "La capitaine rivale commande désormais une flotte dont chaque navire prétend être l’amiral. Votre ancienne relation décide de l’accueil.", "Lui proposer une guerre commune", "Régler enfin votre rivalité", { tags: ["callback", "rival"], callbackFlags: { sparedAlbaRival: true }, winFlags: { alliedAlbaNewWorldFleet: true } }),
      scene("shinsekai-kingdom-choice", "La couronne dans la cale", "Un royaume chassé de son île offre sa couronne à qui reprendra le port occupé.", "Reconquérir le port sans garder la couronne", "Transformer la flotte royale en alliance", { tags: ["kingdom", "territory"], boldTag: "Honneur" }),
      scene("shinsekai-black-market-fruit", "L’enchère aux pouvoirs enfermés", "Le marché noir vend un Fruit du Démon authentique au milieu de neuf imitations explosives.", "Voler la caisse authentique", "Détruire le registre des acheteurs", { tags: ["devil-fruit", "black-market"], boldTag: "Quitte ou double" }),
      scene("shinsekai-advanced-haki", "Le pont que les poings ne touchent pas", "Un vétéran du Nouveau Monde attend sur un pont détruit et enseigne à frapper sans laisser la volonté se disperser.", "Affronter son dernier exercice", "Protéger l’équipage pendant sa démonstration", { tags: ["haki", "mentor"], stat: "haki", callbackFlags: { trainedByGaroHandcalm: true } }),
      scene("shinsekai-emperor-banquet", "Le banquet des cent desserts", "Un Empereur absent invite cent équipages à dîner ; chaque gâteau contient un ordre différent.", "Lire ton ordre à voix haute", "Échanger les gâteaux entre capitaines", { tags: ["emperor", "feast", "humor"], measuredTrait: "rusé" }),
      scene("shinsekai-rare-world-bounty", "Le chiffre que le journal hésite à imprimer", "Ta prime dépasse celle de plusieurs royaumes réunis. Les imprimeurs demandent si ton portrait doit sourire.", "Assumer la légende", "Faire imprimer les noms de l’équipage", { tags: ["bounty", "newspaper"], stat: "bounty", boldTag: "Quitte ou double" }),
      scene("shinsekai-rare-emperor-seat", "Le siège laissé vide", "La chute d’un seigneur pirate libère un territoire assez vaste pour faire de toi un Empereur, si les peuples et les flottes te reconnaissent.", "Réunir les pavillons libres", "Protéger le territoire sans revendiquer le titre", { tags: ["emperor", "status"], boldTag: "Sans retour", major: true, winFlags: { candidateForEmperorStatus: true } }),
      scene("shinsekai-rare-forgotten-route", "La route effacée des quatre cartes", "Les relevés de la tempête, des récifs et d’un Road Ponéglyphe désignent une mer absente de toutes les cartes officielles.", "Suivre la convergence", "Partager la découverte avec les alliés", { tags: ["history", "road-poneglyph"], boldTag: "Intuition", major: true }),
      scene("shinsekai-rare-fleet-betrayal", "La salve venue de l’alliance", "Au milieu d’une guerre de territoire, un pavillon allié tourne ses canons vers ton navire.", "Aborder le traître", "Sauver les équipages trompés", { tags: ["betrayal", "fleet"], boldTag: "Sans retour" }),
      scene("shinsekai-very-rare-kings-crossing", "Quand deux volontés fendent le ciel", "Face à une puissance du Nouveau Monde, la mer se retire et les nuages se séparent avant le premier coup.", "Rester debout pour ton rêve", "Placer l’équipage hors du choc", { tags: ["kings-haki", "legend"], boldTag: "Sans retour", major: true, dangerTheme: true, requiresD: true, winFlags: { survivedKingsWillCollision: true } }),
      scene("shinsekai-very-rare-road-to-king", "La dernière aiguille du monde", "Les décisions de toute ta route convergent : alliés, relevés et dettes peuvent ouvrir un cap vers le One Piece, sans garantir ce qui attend au bout.", "Donner l’ordre de suivre le cap", "Attendre que chaque allié soit prêt", { tags: ["one-piece", "dream", "road-poneglyph"], boldTag: "Dernière chance", major: true, requiredFlags: { securedRoadPoneglyphRubbing: true }, winFlags: { openedPathTowardPirateKing: true } }),
    ],

    marine: [
      // RED LINE
      scene("red-line-dignitary-escort", "Le dignitaire et ses douze oreillers", "Un ministre exige une escorte pour lui-même, ses bagages et douze oreillers diplomatiques tandis qu’un village attend des médicaments.", "Diviser l’escorte", "Imposer un chargement prioritaire", { tags: ["escort", "government"], boldTag: "Devoir", winFlags: { protectedMinisterPalanAndMedicine: true } }),
      scene("red-line-convoy-inspection", "Le treizième navire", "Un convoi officiel compte douze bâtiments sur le manifeste et treize dans le canal.", "Monter à bord du treizième", "Fermer les deux sorties", { tags: ["inspection", "convoy"], style: "sniper" }),
      scene("red-line-pirate-interception", "Les pavillons sous la peinture", "Un transport civil dissimule trois pavillons pirates sous une peinture encore fraîche.", "Intercepter avant l’écluse", "Vérifier les passagers", { tags: ["pirates", "civilians"], boldTag: "Prudence" }),
      scene("red-line-cipher-collaboration", "Le masque posé sur ton bureau", "L’agente du Cipher Pol demande ton unité pour une arrestation sans mandat et laisse son masque en guise de signature.", "Exiger le dossier", "Participer pour surveiller l’opération", { tags: ["cipher-pol", "justice"], measuredTrait: "responsable" }),
      scene("red-line-unjust-order", "L’ordre de fermer les pompes", "La hiérarchie ordonne de couper l’eau d’un quartier qui refuse une nouvelle taxe du Gouvernement mondial.", "Maintenir les pompes", "Retarder l’ordre par la procédure", { tags: ["justice", "taxes"], boldTag: "Justice", winFlags: { defiedRedLineWaterOrder: true } }),
      scene("red-line-civilian-shield", "Le quai entre deux tirs", "Des familles restent prises entre une batterie pirate et les canons du fort.", "Former un écran d’évacuation", "Négocier une minute de silence", { tags: ["civilians", "battle"], boldTag: "Sacrifice" }),
      scene("red-line-corrupt-officer", "Les clés du commandant corrompu", "Le commandant corrompu loue les cellules de la Marine à des trafiquants durant la nuit.", "L’arrêter devant la garnison", "Réunir ses registres", { tags: ["corruption", "prison"], boldTag: "Honneur", winFlags: { arrestedCommanderBell: true } }),
      scene("red-line-truth-or-career", "Le rapport aux pages blanches", "Un vice-amiral te remet un rapport déjà signé où les victimes civiles n’existent pas.", "Réécrire le rapport", "Joindre les preuves sous scellés", { tags: ["career", "truth"], boldTag: "Sans retour" }),
      scene("red-line-strategic-gate", "La porte des deux océans", "Une panne menace de bloquer le passage stratégique avec trois flottes de chaque côté.", "Prendre le contrôle des treuils", "Coordonner les capitaines", { tags: ["strategy", "passage"], stat: "ship", style: "inventeur" }),
      scene("red-line-mutiny", "Les fusils posés en cercle", "Une compagnie refuse d’escorter des esclaves présentés comme prisonniers administratifs.", "Écouter les mutins", "Désarmer tout le monde avant le débat", { tags: ["mutiny", "slavery"], boldTag: "Justice" }),
      scene("red-line-promotion-offer", "Les galons dans l’enveloppe noire", "Le Cipher Pol propose une promotion immédiate si un rapport compromettant disparaît.", "Refuser les galons", "Accepter pour conserver le dossier", { tags: ["promotion", "cipher-pol"], boldTag: "Honneur" }),
      scene("red-line-joint-operation", "Cinq uniformes, aucun commandement", "Marine, douanes et trois services secrets encerclent le même contrebandier avec cinq plans incompatibles.", "Unifier l’opération", "Laisser le contrebandier révéler sa sortie", { tags: ["operation", "smuggling"], measuredTrait: "organisé" }),
      scene("red-line-prisoner-transfer", "La prisonnière au nom censuré", "Une historienne transférée vers une prison secrète affirme pouvoir prouver que son ordre d’arrestation est postérieur à sa capture.", "Suspendre le transfert", "Authentifier les dates", { tags: ["prisoner", "history"], boldTag: "Justice" }),
      scene("red-line-celestial-tribute", "Le tribut avant les secours", "Le tribut destiné aux Nobles Mondiaux occupe les remorqueurs nécessaires à un quartier menacé d’effondrement.", "Réquisitionner les remorqueurs", "Faire évacuer le tribut à la main", { tags: ["celestial-dragons", "civilians"], boldTag: "Sacrifice" }),
      scene("red-line-rare-secret-audit", "Les comptes du commodore corrompu", "Les falsifications du commodore corrompu relient plusieurs bases à un trafic protégé par le Gouvernement mondial.", "Publier l’audit", "Remonter jusqu’au protecteur", { tags: ["callback", "corruption"], callbackFlags: { reportedCommanderSoria: true }, winFlags: { exposedRonceRedLineNetwork: true } }),
      scene("red-line-rare-vice-admiral-command", "La carte du vice-amiral chargé de la poursuite", "Le vice-amiral chargé de la poursuite te confie la défense de trois passages avec assez de forces pour deux.", "Protéger les populations", "Tendre un piège entre les portes", { tags: ["vice-admiral", "command"], boldTag: "Devoir" }),
      scene("red-line-very-rare-five-elders-order", "L’ordre venu des Cinq Doyens", "Un ordre du Conseil des Cinq Doyens exige qu’un témoin et toute son escorte disparaissent des registres.", "Protéger le témoin", "Retourner l’ordre contre ses auteurs locaux", { tags: ["five-elders", "government"], boldTag: "Sans retour", major: true, dangerTheme: true, winFlags: { defiedFiveEldersWitnessOrder: true } }),
      scene("red-line-very-rare-great-operation", "Les portes de la grande opération", "Un Amiral apparaît par Escargophone pour coordonner l’interception d’une flotte pirate au milieu d’un exode civil.", "Commander l’aile d’évacuation", "Couper la retraite de la flotte", { tags: ["admiral", "fleet"], boldTag: "Devoir", major: true, winFlags: { commandedRedLineGrandOperation: true } }),

      // MER SANS ÉTOILES
      scene("special-starless-sea-dark-patrol", "La patrouille sans fanaux", "Dans la Mer sans étoiles, les signaux lumineux attirent des silhouettes qui copient les formations de la Marine.", "Maintenir la formation dans le noir", "Changer tous les codes", { tags: ["darkness", "patrol"], stat: "ship" }),
      scene("special-starless-sea-missing-unit", "L’unité qui répond demain", "Une unité disparue répond aux appels avec exactement un jour d’avance.", "Suivre ses coordonnées", "Poser une question dont tu ignores la réponse", { tags: ["mystery", "escargophone"], measuredTrait: "curieux" }),
      scene("special-starless-sea-prison-lights", "Les cellules aux yeux fermés", "Un navire-prison éteint dérive ; ses détenus refusent toute lumière et accusent le geôlier d’attirer la nuit.", "Monter avec une équipe", "Évacuer les détenus à distance", { tags: ["prison", "darkness"], boldTag: "Prudence" }),
      scene("special-starless-sea-nox-test", "Le rapport de la navigatrice aveugle", "Une navigatrice locale, habituée à se diriger par le son, accuse un officier de la Marine d’avoir vendu les routes sûres à des pirates aux lanternes noires.", "Suivre ses indications sonores", "Comparer son rapport aux échos de la patrouille", { tags: ["local", "investigation"], stat: "haki" }),
      scene("special-starless-sea-rare-observation", "La bataille que personne ne voit", "Deux navires combattent sans lumière ni bruit. Seul le Fluide de l’Observation permet de distinguer l’agresseur.", "Intervenir selon les présences", "Attendre le premier tir", { tags: ["haki", "battle"], stat: "haki" }),
      scene("special-starless-sea-very-rare-void-signal", "Le signal sous le silence", "Un ancien relais du Gouvernement mondial diffuse un nom associé au Siècle oublié avant de s’autodétruire.", "Sauver l’enregistrement", "Sauver les techniciens prisonniers", { tags: ["void-century", "government"], boldTag: "Sacrifice", major: true, winFlags: { securedStarlessVoidSignal: true } }),

      // ARCHIPEL MOUVANT
      scene("special-wandering-archipelago-mobile-base", "La base partie sans permission", "Une petite base de la Marine s’est réveillée sur une autre île, laissant son port et tous ses formulaires derrière elle.", "Remorquer la base", "Déclarer officiellement son déménagement", { tags: ["moving-islands", "humor"], stat: "ship" }),
      scene("special-wandering-archipelago-cartographer", "Le procès du cartographe", "Un cartographe local est accusé d’avoir falsifié une carte officielle, alors que l’île représentée a réellement changé de position.", "Présenter les relevés du cartographe", "Reconstituer le déplacement devant le tribunal", { tags: ["justice", "local"], measuredTrait: "patient" }),
      scene("special-wandering-archipelago-border", "La frontière qui dérive", "Deux royaumes se déclarent la guerre chaque fois que leurs îles se touchent, puis signent la paix en s’éloignant.", "Imposer une zone neutre mobile", "Organiser une conférence sur radeau", { tags: ["politics", "moving-islands"], boldTag: "Diplomatie" }),
      scene("special-wandering-archipelago-smuggler-islet", "L’îlot sous séquestre", "Un îlot entier sert d’entrepôt de contrebande et tente de s’éloigner pendant l’inspection.", "L’encercler avec les patrouilleurs", "Marquer sa route magnétique", { tags: ["smuggling", "geography"], style: "navigateur" }),
      scene("special-wandering-archipelago-rare-rescue", "La collision des neuf villages", "Neuf îles convergent vers le même point avec leurs villages incapables de manœuvrer.", "Commander l’évacuation générale", "Modifier les courants avec les flottes", { tags: ["rescue", "disaster"], boldTag: "Devoir", winFlags: { savedNineWanderingVillages: true } }),
      scene("special-wandering-archipelago-very-rare-charter", "La charte du peuple mouvant", "Les clans demandent à la Marine de reconnaître un territoire dont aucune frontière ne reste en place.", "Garantir leur autonomie", "Créer une juridiction maritime", { tags: ["politics", "justice"], boldTag: "Sans retour", major: true, winFlags: { recognizedWanderingPeopleCharter: true } }),

      // ÎLE DE LA TEMPÊTE
      scene("special-tempest-isle-rescue", "Sept secondes pour accoster", "Un navire civil dérive vers le port entre deux impacts réguliers.", "Le remorquer dans l’intervalle", "Faire évacuer par petites embarcations", { tags: ["storm", "rescue"], stat: "ship" }),
      scene("special-tempest-isle-garrison", "La garnison en bottes de bois", "La garnison locale porte des bottes isolantes si hautes que personne ne peut plier les genoux pendant l’inspection.", "Adapter les patrouilles", "Faire rire l’inspecteur jusqu’à la relève", { tags: ["humor", "garrison"], measuredTrait: "charismatique" }),
      scene("special-tempest-isle-fruit-trafficking", "Les faux fruits sous parafoudre", "Un réseau vend des Fruits du Démon peints aux soldats, puis reprend les caisses après chaque électrocution.", "Arrêter les vendeurs", "Suivre l’argent", { tags: ["devil-fruit", "fraud"], boldTag: "Devoir" }),
      scene("special-tempest-isle-fulga-dispute", "La cloche des gardiens", "La responsable des gardiens accuse une unité du Gouvernement mondial d’avoir volé la cloche qui détourne les éclairs du village avant une nouvelle salve.", "Inspecter le navire officiel malgré les ordres", "Protéger le village pendant la recherche des preuves", { tags: ["local", "government"], boldTag: "Justice" }),
      scene("special-tempest-isle-rare-haki", "Le coup porté dans la foudre", "Un instructeur affirme que le Fluide de l’Armement peut détourner un impact sans condamner celui qui le reçoit.", "Tenter l’interception", "Étudier le point de décharge", { tags: ["haki", "training"], stat: "haki" }),
      scene("special-tempest-isle-very-rare-weather-weapon", "Le canon qui commande aux nuages", "Une installation ancienne pourrait devenir une arme météorologique. Cipher Pol ordonne son transfert immédiat.", "Détruire le mécanisme", "Le placer sous la garde de la cheffe des gardiens", { tags: ["ancient-weapon-rumor", "cipher-pol"], boldTag: "Sans retour", major: true, dangerTheme: true, winFlags: { deniedCipherPolStormEngine: true } }),

      // NOUVEAU MONDE
      scene("shinsekai-admiral-operation", "L’ordre de l’Amiral", "Un Amiral dirige une offensive contre un commandant d’Empereur et te confie un front où des civils refusent d’évacuer.", "Tenir le front et le village", "Modifier le plan d’attaque", { tags: ["admiral", "emperor"], boldTag: "Devoir", winFlags: { servedUnderAdmiralOperation: true } }),
      scene("shinsekai-fleet-battle", "La ligne blanche dans la mer rouge", "La flotte de la Marine affronte des dizaines de navires pirates dans une mer colorée par des algues écarlates.", "Commander la percée", "Créer un corridor de reddition", { tags: ["fleet", "war"], boldTag: "Honneur" }),
      scene("shinsekai-buster-call", "Les dix sonneries", "Un ordre de Buster Call vise une île où Cipher Pol cherche un seul document parmi une population entière.", "Refuser d’ouvrir le feu", "Évacuer avant la dixième sonnerie", { tags: ["buster-call", "cipher-pol"], boldTag: "Sans retour", winFlags: { opposedNewWorldBusterCall: true } }),
      scene("shinsekai-evacuation", "Le volcan aux maisons attachées", "Les habitants ont attaché leurs maisons au volcan pour qu’elles ne s’envolent pas ; l’éruption les entraîne maintenant vers la mer.", "Couper toutes les chaînes", "Remorquer le quartier entier", { tags: ["rescue", "humor"], stat: "ship" }),
      scene("shinsekai-corrupt-superior", "L’amiral de papier", "Un haut officier gonfle ses victoires et sacrifie des unités pour préserver sa légende.", "Refuser son prochain ordre", "Présenter les journaux de bord", { tags: ["corruption", "justice"], boldTag: "Honneur" }),
      scene("shinsekai-high-rank-offer", "La veste aux épaulettes lourdes", "Une promotion vers le haut commandement arrive avant une mission presque impossible.", "Accepter la responsabilité", "Exiger des moyens avant les galons", { tags: ["promotion", "career"], boldTag: "Devoir" }),
      scene("shinsekai-emperor-confrontation", "L’ombre d’un Empereur", "La présence d’un Empereur immobilise les lignes de la Marine sans qu’il ait encore donné un ordre.", "Maintenir l’évacuation sous son regard", "Négocier le retrait des civils", { tags: ["emperor", "haki"], stat: "haki", boldTag: "Courage" }),
      scene("shinsekai-justice-crisis", "La justice sous deux pavillons", "Un royaume allié exige l’arrestation de résistants qui ont protégé sa population contre un équipage pirate.", "Refuser l’extradition", "Organiser un jugement public", { tags: ["justice", "kingdom"], boldTag: "Justice" }),
      scene("shinsekai-five-elders-mission", "Le dossier des Cinq Doyens", "Le Conseil des Cinq Doyens ordonne de récupérer une pierre gravée sans laisser de témoin.", "Protéger les archéologues", "Remplacer la pierre par une copie", { tags: ["five-elders", "poneglyph"], measuredTrait: "rusé" }),
      scene("shinsekai-cipher-operation", "Le masque de l’agente du Cipher Pol se fissure", "L’agente du Cipher Pol mène une opération contre un réseau révolutionnaire et réclame tes soldats sans expliquer les charges.", "Retirer ton unité", "Infiltrer son opération", { tags: ["cipher-pol", "callback"], callbackFlags: { suspectedAgentCendreSpy: true } }),
      scene("shinsekai-reform-council", "Le conseil des justices", "Des officiers débattent de la justice absolue, morale et pragmatique tandis qu’une base assiégée attend une décision concrète.", "Proposer une doctrine nouvelle", "Donner la parole aux soldats", { tags: ["reform", "marine"], boldTag: "Sagesse" }),
      scene("shinsekai-hero-rescue", "Le navire-hôpital sous les tirs", "Un navire-hôpital transporte blessés pirates et soldats, ce qui en fait une cible pour les deux flottes.", "Le défendre contre tous", "Révéler sa cargaison au monde", { tags: ["hero", "rescue"], boldTag: "Sacrifice" }),
      scene("shinsekai-rare-admiral-candidate", "Le vote des vice-amiraux", "Plusieurs vice-amiraux proposent ton nom pour un poste d’Amiral, mais ton dossier contient chaque désobéissance commise pour sauver des civils.", "Défendre ton parcours", "Refuser d’effacer une seule faute", { tags: ["admiral", "promotion"], boldTag: "Honneur", major: true, winFlags: { becameAdmiralCandidate: true } }),
      scene("shinsekai-rare-fleet-admiral-choice", "La salle de guerre sans fenêtre", "Le haut commandement veut une stratégie totale contre les Empereurs ; tes choix détermineront quelle justice dirigera la flotte.", "Présenter une stratégie protectrice", "Dénoncer les objectifs politiques", { tags: ["fleet-admiral", "strategy"], boldTag: "Sans retour", major: true }),
      scene("shinsekai-rare-rebellion", "Les manteaux retournés", "Une flotte entière refuse un ordre visant des civils et attend de savoir si tu la traiteras en ennemie.", "Prendre la tête du refus", "Forcer une audience officielle", { tags: ["rebellion", "justice"], boldTag: "Rébellion" }),
      scene("shinsekai-rare-world-hero", "Les survivants aux mille pavillons", "Des peuples ennemis affirment tous que ton unité les a sauvés. Le Gouvernement mondial veut choisir une version plus utile.", "Laisser chacun témoigner", "Refuser la cérémonie officielle", { tags: ["hero", "world"], stat: "popularity", major: true }),
      scene("shinsekai-very-rare-marine-dream", "La justice au bord du monde", "Amiral, réforme, commandement ou héroïsme : une crise mondiale offre une avancée décisive vers le rêve poursuivi depuis ta mer de départ.", "Agir selon ta justice", "Unir les officiers fidèles", { tags: ["dream", "justice"], boldTag: "Sans retour", major: true, winFlags: { achievedDecisiveMarineDreamAdvance: true } }),
      scene("shinsekai-very-rare-government-break", "Le drapeau au-dessus de l’ordre", "Le Gouvernement mondial exige le sacrifice d’une flotte pour protéger un secret. Toute la Marine observe ta réponse.", "Sauver la flotte et révéler l’ordre", "Arrêter les agents responsables", { tags: ["government", "world"], boldTag: "Sans retour", major: true, dangerTheme: true, winFlags: { putMarineJusticeAboveGovernmentOrder: true } }),
    ],

    "bounty-hunter": [
      // RED LINE
      scene("red-line-cipher-protected-target", "La cible sous le masque blanc", "Ta cible marche entourée d’agents du Cipher Pol qui prétendent ne pas la connaître.", "L’arracher à leur escorte", "Prouver la protection secrète", { tags: ["cipher-pol", "target"], boldTag: "Risqué" }),
      scene("red-line-fraud-contract", "Le contrat imprimé demain", "Un contrat daté du lendemain promet une prime déjà encaissée par quelqu’un d’autre.", "Retrouver l’encaisseur", "Faire authentifier l’encre", { tags: ["fraud", "contract"], measuredTrait: "prudent" }),
      scene("red-line-convoy-target", "La troisième cabine blindée", "Une cible voyage dans un convoi officiel où chaque cabine porte le même numéro.", "Ouvrir les cabines en marche", "Identifier ses habitudes", { tags: ["convoy", "hunt"], style: "sniper" }),
      scene("red-line-veteran-competitor", "Une chasseuse vétérane ne manque jamais", "Une chasseuse vétérane annonce toujours sa capture avant de commencer et n’a encore jamais corrigé une affiche.", "Accepter sa course", "Partager une fausse piste", { tags: ["competitor", "rival"], measuredTrait: "rusé" }),
      scene("red-line-former-officer", "La prime du manteau retourné", "Un ancien officier recherché possède les preuves d’un trafic de prisonniers dans sa propre base.", "Le capturer avec ses preuves", "Négocier son témoignage", { tags: ["marine", "corruption"], boldTag: "Honneur" }),
      scene("red-line-secret-bounty", "Le chiffre écrit sous le papier", "En chauffant l’affiche, une seconde prime apparaît, dix fois supérieure et payable dans un bureau sans adresse.", "Suivre le paiement secret", "Avertir la cible", { tags: ["secret", "bounty"], boldTag: "Quitte ou double" }),
      scene("red-line-innocent-target", "Le visage ajouté au dernier instant", "Le portrait de ta cible a été collé sur une vieille affiche après son arrestation.", "Suspendre la chasse", "Retrouver le commanditaire", { tags: ["innocent", "ethics"], boldTag: "Honneur" }),
      scene("red-line-marine-negotiation", "Le reçu à trois signatures", "La Marine accepte de payer si trois services rivaux reconnaissent la capture.", "Obtenir les trois signatures", "Négocier directement avec le commandant", { tags: ["marine", "payment"], measuredTrait: "charismatique" }),
      scene("red-line-celestial-contract", "Le gant du Noble Mondial", "Un intermédiaire offre une fortune pour reprendre un esclave évadé décrit comme une propriété perdue.", "Retourner le contrat contre l’intermédiaire", "Faire disparaître la cible", { tags: ["celestial-dragons", "slavery"], boldTag: "Rébellion" }),
      scene("red-line-conspiracy-witness", "La cible qui mémorise les sceaux", "Un faussaire recherché connaît la chaîne reliant des contrats secrets au Gouvernement mondial.", "Le garder vivant", "Copier sa mémoire dessinée", { tags: ["conspiracy", "witness"], winFlags: { protectedSealMemoryWitness: true } }),
      scene("red-line-port-duel", "Le duel sur les grues", "Le chasseur rival te défie sur des grues suspendues au-dessus du port, tandis que la cible tente discrètement de prendre un billet.", "Accepter sans perdre la cible", "Transformer le duel en chasse", { tags: ["callback", "duel"], callbackFlags: { sharedContractWithJasko: true } }),
      scene("red-line-smuggler-hunt", "Le passeur aux sept doublures", "Chaque couche du manteau de la cible contient un passeport différent et une personnalité encore plus convaincante.", "L’arrêter au contrôle", "Identifier son vrai nom", { tags: ["smuggling", "humor"], measuredTrait: "curieux" }),
      scene("red-line-prison-contract", "La prime derrière les barreaux", "Une prison offre une prime pour retrouver un détenu qui n’a jamais quitté sa cellule.", "Inspecter la prison", "Interroger le détenu", { tags: ["prison", "mystery"], boldTag: "Intuition" }),
      scene("red-line-corrupt-broker", "Le courtier corrompu vend deux fois la même tête", "Le courtier corrompu a promis la même cible au Gouvernement mondial et à un réseau clandestin.", "Exiger le vrai contrat", "Vendre une troisième version", { tags: ["callback", "broker"], callbackFlags: { capturedBrokerCalame: true } }),
      scene("red-line-rare-conspiracy", "La liste des primes impossibles", "Une archive révèle que certaines primes servent à faire disparaître des témoins plutôt qu’à punir des criminels.", "Publier la liste", "Traquer ses auteurs", { tags: ["conspiracy", "government"], winFlags: { exposedPoliticalBountyList: true } }),
      scene("red-line-rare-haki-target", "L’homme qui entend les menottes", "Une cible dotée du Fluide de l’Observation prévoit chaque arrestation au bruit des menottes.", "Combattre sans métal", "Créer cent faux départs", { tags: ["haki", "target"], stat: "haki" }),
      scene("red-line-very-rare-reputation-contract", "Le contrat que tous refusent", "Arrêter un trafiquant protégé par les puissances de Red Line ferait de toi une référence mondiale ou un ennemi sans refuge.", "Accepter publiquement", "Bâtir un dossier inattaquable", { tags: ["career", "legend"], boldTag: "Sans retour", major: true, winFlags: { becameRedLineContractAuthority: true } }),
      scene("red-line-very-rare-celestial-prey", "La prime du Dragon absent", "Un Noble Mondial a placé une prime secrète sur son propre intendant, dépositaire de la liste de ses esclaves.", "Sauver l’intendant et la liste", "Livrer uniquement les preuves", { tags: ["celestial-dragons", "slavery"], boldTag: "Sacrifice", major: true, winFlags: { securedCelestialSlaveLedger: true } }),

      // MER SANS ÉTOILES
      scene("special-starless-sea-silent-target", "La cible qui efface son sillage", "Dans l’obscurité, la cible remonte derrière ton navire et efface chaque remous avec une rame capitonnée.", "Couper les voiles et écouter", "Semer des clochettes flottantes", { tags: ["darkness", "hunt"], style: "sniper" }),
      scene("special-starless-sea-false-voices", "Quatre voix pour une prime", "Quatre voix revendiquent le nom de la cible depuis quatre directions, mais une seule respire.", "Choisir selon le souffle", "Répondre avec un faux montant", { tags: ["mystery", "target"], measuredTrait: "calme" }),
      scene("special-starless-sea-nox-contract", "Le contrat de la navigatrice aveugle", "Une navigatrice locale offre un contrat contre un pilleur qui vole les lanternes des naufragés et les utilise pour attirer de nouvelles victimes.", "Suivre la piste des lumières volées", "Tendre un fanal sans flamme au pilleur", { tags: ["local", "contract"], stat: "haki" }),
      scene("special-starless-sea-jasko-shadow", "Le rival et la voix volée", "Le chasseur rival rencontré lors d’un ancien contrat poursuit un imitateur qui revendique ses crimes avec sa voix. Votre accord passé explique pourquoi il te demande de l’aide.", "Coordonner la capture avec le chasseur rival", "Enregistrer les deux voix avant d’intervenir", { tags: ["callback", "competitor"], callbackFlags: { sharedContractWithJasko: true } }),
      scene("special-starless-sea-rare-invisible-bounty", "L’affiche entièrement noire", "Une affiche noire ne révèle le portrait qu’à ceux qui maîtrisent leur peur dans l’obscurité.", "Accepter la chasse aveugle", "Chercher pourquoi le visage est caché", { tags: ["rare-bounty", "mystery"], boldTag: "Intuition" }),
      scene("special-starless-sea-very-rare-abyss-target", "La prime sous la coque", "Une créature recherchée pour cent naufrages porte sur son dos les restes d’une prison du Gouvernement mondial.", "Descendre jusqu’à la prison", "Attirer la créature vers la surface", { tags: ["sea-beast", "government"], boldTag: "Sans retour", major: true, winFlags: { recoveredStarlessPrisonArchive: true } }),

      // ARCHIPEL MOUVANT
      scene("special-wandering-archipelago-moving-target", "La cible sur l’île d’à côté", "Chaque fois que tu accostes, l’île de la cible échange sa place avec une autre.", "Sauter pendant l’échange", "Prévoir la séquence des îles", { tags: ["moving-islands", "hunt"], stat: "ship" }),
      scene("special-wandering-archipelago-turtle-warrant", "Le mandat tatoué", "Le seul mandat reconnu par les clans est tatoué sur la tortue du cartographe local, partie nager entre les îles mouvantes.", "Rattraper la tortue entre deux dérives", "Faire certifier une copie par les clans", { tags: ["humor", "contract"], style: "navigateur" }),
      scene("special-wandering-archipelago-nomad-thief", "Le voleur de rivages", "Une cible vole des plages entières en détachant les îlots pendant le sommeil des habitants.", "Reprendre les rivages", "Piéger son prochain détachement", { tags: ["local", "target"], boldTag: "Honneur" }),
      scene("special-wandering-archipelago-competitors", "La chasse aux six cartes", "Six chasseurs possèdent chacun une carte correcte d’une heure différente.", "Organiser les six itinéraires", "Acheter seulement la carte suivante", { tags: ["competitors", "navigation"], measuredTrait: "organisé" }),
      scene("special-wandering-archipelago-rare-island-prisoner", "Le prisonnier devenu île", "Un utilisateur de Fruit du Démon transforme son corps en refuge mouvant pour des fugitifs.", "Négocier avec l’île vivante", "Capturer le véritable criminel caché", { tags: ["devil-fruit", "ethics"], boldTag: "Diplomatie" }),
      scene("special-wandering-archipelago-very-rare-world-map", "La carte qui refuse les frontières", "Le cartographe possède un relevé unique des routes secrètes vers le Nouveau Monde, convoité par tous les chasseurs du monde.", "Défendre le cartographe", "Partager la carte sous serment", { tags: ["world-route", "alliance"], boldTag: "Sans retour", major: true, winFlags: { earnedWanderingWorldMap: true } }),

      // ÎLE DE LA TEMPÊTE
      scene("special-tempest-isle-lightning-target", "La cible entre les impacts", "La cible ne se déplace que pendant les sept secondes où le port est accessible.", "L’intercepter dans l’intervalle", "Bloquer son prochain abri", { tags: ["storm", "hunt"], stat: "ship" }),
      scene("special-tempest-isle-burned-poster", "L’affiche frappée par la foudre", "Chaque impact change le visage et le montant de la prime.", "Capturer le modèle original", "Suivre le papier conducteur", { tags: ["humor", "bounty"], measuredTrait: "curieux" }),
      scene("special-tempest-isle-fruit-broker", "Le courtier aux gants de cuivre", "Un courtier vend l’emplacement d’un Fruit du Démon et porte des gants reliés à tous les paratonnerres du marché.", "Le saisir entre deux éclairs", "Acheter le nom de son fournisseur", { tags: ["devil-fruit", "black-market"], boldTag: "Risqué" }),
      scene("special-tempest-isle-fulga-warrant", "Le mandat contre la cheffe des gardiens", "Le Gouvernement mondial offre une prime sur la cheffe des gardiens pour avoir refusé de céder le mécanisme météorologique de son peuple.", "Refuser le contrat", "Enquêter sur le mécanisme", { tags: ["government", "local"], boldTag: "Honneur" }),
      scene("special-tempest-isle-rare-armament-target", "Le fugitif qui saisit la foudre", "La cible recouvre ses bras de Fluide de l’Armement et dévie les impacts vers ses poursuivants.", "Briser son rythme", "L’épuiser sans combattre", { tags: ["haki", "target"], stat: "haki" }),
      scene("special-tempest-isle-very-rare-legendary-contract", "Le contrat dans l’œil du cyclone", "Une prime légendaire attend dans l’œil, attachée à une cible responsable d’avoir vendu des villages entiers.", "Entrer dans l’œil", "Libérer les témoins d’abord", { tags: ["legendary-contract", "slavery"], boldTag: "Sacrifice", major: true, dangerTheme: true, winFlags: { completedTempestLegendaryContract: true } }),

      // NOUVEAU MONDE
      scene("shinsekai-emperor-linked-target", "La cuisinière de l’Empereur", "Une cuisinière recherchée connaît les mouvements d’une flotte d’Empereur, mais sa prime punit surtout son refus d’empoisonner un banquet.", "La protéger de la flotte", "Négocier son témoignage", { tags: ["emperor", "target"], boldTag: "Honneur" }),
      scene("shinsekai-impossible-contract", "Capturer un navire sans toucher l’équipage", "Le commanditaire exige un navire d’élite intact, sans blessé et avant le dîner.", "Aborder pendant le repas", "Retourner son propre équipage", { tags: ["contract", "elite"], measuredTrait: "rusé" }),
      scene("shinsekai-world-bounty", "L’affiche traduite en cent langues", "Une prime mondiale déclenche des chasses simultanées dans tous les ports du Nouveau Monde.", "Former une équipe internationale", "Garder seul la piste principale", { tags: ["world-bounty", "competitors"], boldTag: "Diplomatie" }),
      scene("shinsekai-temporary-alliance", "Les menottes partagées", "Toi et le chasseur rival êtes attachés à la même chaîne par une cible qui tient les clés.", "Combattre ensemble", "Faire croire à votre dispute", { tags: ["callback", "alliance"], callbackFlags: { sharedContractWithJasko: true } }),
      scene("shinsekai-rival-return", "Le chasseur rival et la dernière affiche", "Le chasseur rival possède une moitié de l’affiche ; tu possèdes l’autre, et le portrait complet change tout.", "Réunir les deux moitiés", "Courir jusqu’à la cible", { tags: ["callback", "rival"], callbackFlags: { defeatedByJaskoRival: true } }),
      scene("shinsekai-powerful-haki-target", "La femme qui voit trois secondes", "Une cible au Fluide de l’Observation avancé esquive chaque piège avant sa fermeture.", "Créer un choix sans bonne issue", "Masquer ton intention", { tags: ["haki", "target"], stat: "haki" }),
      scene("shinsekai-political-target", "Le prince aux deux actes de naissance", "Deux royaumes revendiquent la même cible comme héritier et criminel.", "Organiser une confrontation publique", "Vérifier les archives royales", { tags: ["politics", "kingdom"], boldTag: "Justice" }),
      scene("shinsekai-rigged-bounty", "La prime qui augmente à chaque refus", "Le montant monte chaque fois qu’un chasseur décline, signe évident que le client achète le silence.", "Accepter pour approcher le client", "Détruire le marché", { tags: ["fraud", "black-market"], boldTag: "Quitte ou double" }),
      scene("shinsekai-world-changing-target", "La gardienne du fragment rouge", "Une archéologue recherchée transporte un fragment permettant d’identifier un Road Ponéglyphe.", "La défendre", "Séparer la piste du fragment", { tags: ["road-poneglyph", "history"], boldTag: "Sacrifice" }),
      scene("shinsekai-marine-offer", "Le bureau flottant de la Marine", "Une base avancée offre immunité et fortune pour une série de captures impossibles.", "Négocier chaque cible", "Refuser l’immunité", { tags: ["marine", "career"], measuredTrait: "pragmatique" }),
      scene("shinsekai-black-market-auction", "La vente des chasseurs eux-mêmes", "Un marché noir met aux enchères les contrats et les chasseurs capables de les remplir.", "Enchérir sur ton propre nom", "Libérer les chasseurs endettés", { tags: ["black-market", "humor"], boldTag: "Rébellion" }),
      scene("shinsekai-emperor-officer", "La prime au bout de la flotte", "Un officier d’Empereur ne quitte jamais le centre de cent navires.", "Traverser la flotte", "Faire sortir la cible par une fausse rébellion", { tags: ["emperor", "fleet"], boldTag: "Sans retour" }),
      scene("shinsekai-rare-legendary-contract", "La chasse des quatre océans", "Quatre gouvernements et trois Empereurs recherchent le même trafiquant de secrets.", "Prendre le contrat légendaire", "Retourner les commanditaires entre eux", { tags: ["legendary-contract", "world"], boldTag: "Sans retour", major: true }),
      scene("shinsekai-rare-emperor-hunt", "L’affiche sans montant", "Une affiche portant le portrait d’un Empereur ne promet aucun montant, seulement une place dans l’histoire.", "Commencer la traque", "Cartographier d’abord ses commandants", { tags: ["emperor", "dream"], boldTag: "Sans retour", major: true, winFlags: { beganEmperorHunt: true } }),
      scene("shinsekai-rare-ora-return", "La pisteuse voit la piste impossible", "Une pisteuse intuitive reconnaît dans une pluie inversée la trace d’une cible disparue depuis dix ans.", "Lui confier la chasse", "Croiser son intuition avec les archives", { tags: ["callback", "ally"], callbackFlags: { recruitedOraPaleyeTracker: true } }),
      scene("shinsekai-rare-professional-code", "Le tribunal des chasseurs", "Les plus grands chasseurs du monde jugent tes contrats, tes refus et les vies laissées derrière toi.", "Défendre ton code", "Révéler leurs contrats secrets", { tags: ["career", "reputation"], boldTag: "Honneur", major: true }),
      scene("shinsekai-very-rare-greatest-hunter", "La cible que personne ne pouvait ramener", "Une capture réputée impossible peut consacrer le plus grand chasseur de primes, mais la cible détient une vérité capable de bouleverser le monde.", "Ramener la cible vivante", "Protéger sa révélation", { tags: ["dream", "legend"], boldTag: "Dernière chance", major: true, winFlags: { achievedDecisiveHunterDreamAdvance: true } }),
      scene("shinsekai-very-rare-emperor-shadow", "La chasse sous le regard d’un Empereur", "L’Empereur apparaît brièvement au bout du quai pour reprendre ton prisonnier. La prime cesse soudain d’avoir la moindre importance.", "Tenir jusqu’à l’extraction", "Négocier la vérité du prisonnier", { tags: ["emperor", "lore"], boldTag: "Sans retour", major: true, dangerTheme: true, requiresD: true, winFlags: { survivedEmperorIntervention: true } }),
    ],

    revolutionary: [
      // RED LINE
      scene("red-line-free-prisoners", "Le train des cages", "Un train blindé transporte des prisonniers politiques à travers Red Line. La saboteuse a caché une clé dans chaque essieu.", "Faire dérailler les cages vides", "Ouvrir les serrures en marche", { tags: ["prison", "liberation"], boldTag: "Rébellion", winFlags: { freedRedLineTrainPrisoners: true } }),
      scene("red-line-infiltrate-convoy", "Le convoi aux uniformes neufs", "Des agents clandestins doivent remplacer l’escorte d’un convoi sans qu’aucun uniforme ne porte deux fois la même taille.", "Prendre la relève", "Créer une inspection fictive", { tags: ["infiltration", "convoy"], measuredTrait: "rusé" }),
      scene("red-line-steal-archives", "Les archives qui descendent seules", "Chaque nuit, les archives du Gouvernement mondial empruntent un ascenseur sans gardien.", "Entrer avec les dossiers", "Remplacer les caisses", { tags: ["archive", "government"], winFlags: { stoleDescendingArchives: true } }),
      scene("red-line-sabotage-installation", "La porte alimentée par les chaînes", "Une installation utilise le travail forcé pour actionner la porte militaire.", "Saboter les engrenages", "Organiser l’arrêt des travailleurs", { tags: ["sabotage", "slavery"], style: "inventeur" }),
      scene("red-line-smuggle-agents", "Les pèlerins aux chaussures identiques", "Douze agents doivent franchir un contrôle où l’inspecteur reconnaît les mensonges aux semelles.", "Traverser en procession", "Diviser le groupe dans les convois", { tags: ["network", "infiltration"], boldTag: "Prudence" }),
      scene("red-line-protect-witness", "Le témoin qui compte les marches", "Un comptable évadé connaît chaque versement du tribut céleste mais ne se calme qu’en comptant les marches.", "L’escorter par le grand escalier", "Créer une route sans marche", { tags: ["witness", "tribute"], boldTag: "Sacrifice" }),
      scene("red-line-unjust-tax", "La taxe sur les fenêtres ouvertes", "Un quartier doit payer pour chaque fenêtre donnant sur les installations du Gouvernement mondial.", "Publier le registre", "Murer les bureaux fiscaux", { tags: ["tax", "propaganda"], stat: "popularity" }),
      scene("red-line-save-slaves", "Les porteurs du tribut", "Des esclaves portent une cargaison destinée aux Nobles Mondiaux sur un pont interdit aux personnes libres.", "Briser les colliers", "Substituer des mannequins", { tags: ["slavery", "celestial-dragons"], boldTag: "Rébellion", winFlags: { savedCelestialTributePorters: true } }),
      scene("red-line-expose-trafficking", "Les passeports numérotés", "L’archiviste découvre que les numéros de passeport correspondent aux bracelets d’une vente clandestine.", "Diffuser la correspondance", "Remonter jusqu’au ministère", { tags: ["trafficking", "documents"], measuredTrait: "curieux" }),
      scene("red-line-establish-cell", "La blanchisserie des drapeaux", "Une blanchisserie lave les pavillons officiels et peut cacher une cellule au cœur du port.", "Installer le relais", "Tester d’abord les employés", { tags: ["cell", "network"], winFlags: { foundedRedLineLaundryCell: true } }),
      scene("red-line-prepare-uprising", "La cloche des trois quartiers", "Trois quartiers veulent se soulever à trois heures différentes et chacun refuse de changer son horaire.", "Unifier le signal", "Préparer trois retraites", { tags: ["uprising", "coordination"], boldTag: "Organisation" }),
      scene("red-line-cipher-agent", "Les leurres du couloir des miroirs", "Une agente du Cipher Pol utilise des projections et des vitres sans tain pour surveiller chaque accès. L’agente de liaison repère le seul reflet qui ne reproduit pas la lumière.", "Neutraliser la salle de projection", "Suivre le reflet décalé", { tags: ["cipher-pol", "callback"], callbackFlags: { trustedAgentCendre: true } }),
      scene("red-line-secret-route", "La rampe des serviteurs", "Une route réservée aux serviteurs des Nobles Mondiaux contourne tous les contrôles et mène à leurs entrepôts.", "Ouvrir la route aux fugitifs", "La conserver pour les extractions", { tags: ["escape-route", "celestial-dragons"], boldTag: "Prudence" }),
      scene("red-line-political-prisoner", "Le maire sans ville", "Un maire emprisonné continue de signer les lois d’une ville rasée pour empêcher le Gouvernement mondial d’en saisir les terres.", "Le libérer avec ses sceaux", "Faire reconnaître ses actes", { tags: ["prisoner", "politics"], boldTag: "Honneur" }),
      scene("red-line-rare-void-record", "Le siècle entre deux lignes", "Une archive fiscale mentionne un royaume taxé pendant une année officiellement absente de l’Histoire.", "Publier l’anomalie", "Chercher le royaume", { tags: ["void-century", "archive"], winFlags: { foundRedLineVoidTaxRecord: true } }),
      scene("red-line-rare-cipher-purge", "La nuit des cellules muettes", "Cipher Pol lance simultanément des arrestations contre tous les relais connus de l’agente de liaison.", "Déclencher les évacuations", "Retourner les listes contre les agents", { tags: ["cipher-pol", "network"], boldTag: "Sans retour" }),
      scene("red-line-very-rare-slave-route", "La route des mille chaînes", "Une carte révèle le principal axe d’esclavage alimentant les domaines des Nobles Mondiaux.", "Libérer tous les convois ensemble", "Diffuser la carte au monde", { tags: ["slavery", "world"], boldTag: "Sans retour", major: true, dangerTheme: true, winFlags: { shatteredRedLineSlaveRoute: true } }),
      scene("red-line-very-rare-forgotten-name", "Le nom sous le sceau des Doyens", "Un document portant un ancien sceau du Conseil des Cinq Doyens conserve le nom d’un peuple effacé du Siècle oublié.", "Sauver le document", "Diffuser immédiatement le nom", { tags: ["five-elders", "void-century"], boldTag: "Dernière chance", major: true, winFlags: { recoveredForgottenPeopleName: true } }),

      // MER SANS ÉTOILES
      scene("special-starless-sea-hidden-cell", "La cellule qui ne s’allume jamais", "Une cellule clandestine communique par silences de durées différentes pour ne pas attirer les formes de la nuit.", "Apprendre leur code", "Installer un relais sans lumière", { tags: ["darkness", "network"] }),
      scene("special-starless-sea-refugees", "Les barques sans lanternes", "Des réfugiés dérivent en silence, poursuivis par une patrouille qui tire sur toute lumière.", "Les guider à l’aveugle", "Attirer la patrouille ailleurs", { tags: ["refugees", "rescue"], boldTag: "Sacrifice" }),
      scene("special-starless-sea-cendre-echo", "Les mots de passe dans le noir", "Une voix reproduit les codes de l’agente de liaison déjà soupçonnée d’espionnage. Les codes les plus récents prouvent que le réseau est encore compromis.", "Tester la voix avec un ancien code erroné", "Couper les transmissions et déplacer la cellule", { tags: ["callback", "spy"], callbackFlags: { suspectedAgentCendreSpy: true } }),
      scene("special-starless-sea-black-prison", "La prison sans murs", "Des prisonniers restent immobiles parce que leurs geôliers leur ont appris que la mer noire n’avait aucun rivage.", "Prouver que la terre existe", "Former un convoi silencieux", { tags: ["prison", "psychology"], boldTag: "Sagesse" }),
      scene("special-starless-sea-rare-void-voice", "La voix d’un royaume effacé", "Un vieil Escargophone répète une proclamation dans une langue liée aux fragments du Siècle oublié.", "Enregistrer chaque syllabe", "Chercher l’émetteur", { tags: ["void-century", "escargophone"], winFlags: { recordedStarlessLostKingdomVoice: true } }),
      scene("special-starless-sea-very-rare-network", "Le réseau sous la nuit", "Les routes aveugles relient des dizaines de refuges que le Gouvernement mondial n’a jamais pu cartographier.", "Unir les refuges", "Préserver leur indépendance", { tags: ["network", "world"], boldTag: "Sans retour", major: true, winFlags: { unitedStarlessRefugeNetwork: true } }),

      // ARCHIPEL MOUVANT
      scene("special-wandering-archipelago-moving-cell", "La cellule qui change d’adresse seule", "Chaque réunion se tient sur une île différente sans que les agents aient besoin de bouger.", "Synchroniser les rencontres", "Cartographier les dérives", { tags: ["moving-islands", "network"] }),
      scene("special-wandering-archipelago-displaced-people", "Le peuple dont l’île est partie", "Une communauté s’est réveillée sans son île, emportée avec les archives et les récoltes.", "Retrouver l’île", "Partager les terres voisines", { tags: ["people", "rescue"], boldTag: "Solidarité" }),
      scene("special-wandering-archipelago-border-revolt", "La révolution qui franchit la frontière", "Une révolte commence dans un royaume et dérive physiquement dans un autre avant midi.", "Maintenir le soulèvement uni", "Négocier avec les deux peuples", { tags: ["uprising", "politics"], boldTag: "Rébellion" }),
      scene("special-wandering-archipelago-plico", "Le cartographe et la route interdite", "Un cartographe local connaît un chemin mobile vers des prisons secrètes du Gouvernement, mais refuse de créer une carte qui pourrait être saisie.", "Mémoriser la séquence des îles", "Escorter le cartographe pendant le repérage", { tags: ["local", "escape-route"], style: "navigateur" }),
      scene("special-wandering-archipelago-rare-free-council", "Le conseil sans capitale", "Les clans veulent fonder une communauté libre où la capitale change d’île chaque semaine.", "Écrire leur charte", "Organiser la première rotation", { tags: ["free-nation", "politics"], winFlags: { helpedWanderingFreeCouncil: true } }),
      scene("special-wandering-archipelago-very-rare-liberation", "Toutes les îles au même rivage", "La réunion générationnelle permet de libérer simultanément les camps de travail dispersés dans l’archipel.", "Déclencher la libération", "Évacuer les familles avant l’assaut", { tags: ["liberation", "world"], boldTag: "Sans retour", major: true, winFlags: { liberatedWanderingLaborCamps: true } }),

      // ÎLE DE LA TEMPÊTE
      scene("special-tempest-isle-storm-cell", "Le relais dans le tonnerre", "Une cellule révolutionnaire locale utilise les impacts pour masquer ses transmissions, mais son unique relais menace d’être repéré par le Gouvernement.", "Émettre le message entre deux éclairs", "Répartir les communications entre plusieurs relais", { tags: ["storm", "network"] }),
      scene("special-tempest-isle-forced-workers", "Les mineurs du paratonnerre", "Des travailleurs forcés entretiennent les tours qui protègent uniquement le quartier officiel.", "Ouvrir les tours à tous", "Organiser l’arrêt du travail", { tags: ["slavery", "infrastructure"], boldTag: "Rébellion" }),
      scene("special-tempest-isle-fruit-prisoner", "La prisonnière dans la cage de cuivre", "Une utilisatrice de Fruit du Démon est enfermée dans une cage conductrice pour alimenter des expériences météorologiques.", "Briser la cage", "Couper les instruments", { tags: ["devil-fruit", "prison"], boldTag: "Sacrifice" }),
      scene("special-tempest-isle-fulga-alliance", "Le serment de la cheffe des gardiens", "La cheffe des gardiens offre les routes de son peuple si la Révolution garantit que personne ne prendra le contrôle de la tempête.", "Jurer l’autonomie", "Écrire un pacte révocable", { tags: ["local", "alliance"], boldTag: "Diplomatie" }),
      scene("special-tempest-isle-rare-weather-proof", "Les plans de l’arme de nuages", "Les plans prouvent que Cipher Pol veut transformer l’ancien mécanisme en arme météorologique.", "Diffuser les plans", "Saboter chaque copie", { tags: ["cipher-pol", "ancient-weapon-rumor"], winFlags: { exposedCipherStormWeaponPlan: true } }),
      scene("special-tempest-isle-very-rare-free-island", "L’île qui choisit l’orage", "Les habitants peuvent quitter la protection officielle et devenir un territoire libre, au risque d’affronter seuls les flottes.", "Défendre leur choix", "Construire une alliance maritime", { tags: ["free-nation", "storm"], boldTag: "Sans retour", major: true, dangerTheme: true, winFlags: { foundedFreeTempestIsland: true } }),

      // NOUVEAU MONDE
      scene("shinsekai-mass-prison-liberation", "Les cales de la flotte-prison", "Une flotte entière transporte des prisonniers politiques entre les territoires d’Empereurs et les geôles gouvernementales.", "Libérer toutes les cales", "Retourner les navires-gardiens", { tags: ["prison", "liberation"], boldTag: "Sans retour", winFlags: { liberatedNewWorldPrisonFleet: true } }),
      scene("shinsekai-historical-discovery", "La chronique sous le volcan", "Une chronique protégée par la lave relie un royaume actuel à une nation du Siècle oublié.", "Sauver les plaques", "Sauver les gardiens du savoir", { tags: ["void-century", "history"], boldTag: "Sacrifice" }),
      scene("shinsekai-great-cell", "La cellule aux cent ports", "Des relais indépendants peuvent devenir le plus grand réseau clandestin du Nouveau Monde, mais aucun ne veut de chef.", "Créer un conseil distribué", "Garantir l’autonomie de chaque relais", { tags: ["network", "world"], boldTag: "Organisation" }),
      scene("shinsekai-free-territory", "Le pays sans trône", "Un territoire libéré refuse de remplacer son roi par un chef révolutionnaire.", "Fonder des institutions civiles", "Confier immédiatement le pouvoir local", { tags: ["free-nation", "politics"], boldTag: "Sagesse" }),
      scene("shinsekai-major-sabotage", "La forge des chaînes océaniques", "Une installation majeure fabrique les colliers et les armes employés dans plusieurs royaumes.", "Détruire la chaîne de production", "Retourner les livraisons contre les trafiquants", { tags: ["sabotage", "slavery"], style: "inventeur" }),
      scene("shinsekai-cipher-attack", "L’assaut des masques sans nombre", "Cipher Pol attaque simultanément les archives, les refuges et les émetteurs de ton réseau.", "Défendre les trois fronts", "Sacrifier les installations pour sauver les agents", { tags: ["cipher-pol", "war"], boldTag: "Sacrifice" }),
      scene("shinsekai-protect-kingdom", "Le royaume sous trois pavillons", "Un royaume libre est menacé par le Gouvernement mondial, un équipage d’Empereur et ses propres anciens nobles.", "Unir la défense populaire", "Diviser les trois adversaires", { tags: ["kingdom", "war"], boldTag: "Diplomatie" }),
      scene("shinsekai-coordinated-revolt", "Minuit dans douze royaumes", "Douze peuples attendent le même signal pour se soulever ; un seul Escargophone est déjà compromis.", "Maintenir le signal", "Donner à chaque cellule son heure", { tags: ["uprising", "network"], boldTag: "Sans retour" }),
      scene("shinsekai-world-broadcast", "La vérité dans chaque journal", "La responsable des presses clandestines peut publier une preuve mondiale, mais les presses seront découvertes dès la première page.", "Lancer toutes les presses", "Diffuser les matrices aux peuples", { tags: ["truth", "newspaper"], stat: "popularity" }),
      scene("shinsekai-slavery-network", "Les enchères sous pavillon d’Empereur", "Un réseau d’esclavage paie tribut à un commandant d’Empereur et fournit des Nobles Mondiaux.", "Libérer la vente", "Saisir les livres de comptes", { tags: ["slavery", "emperor"], boldTag: "Rébellion" }),
      scene("shinsekai-cendre-return", "L’agente de liaison au centre de la toile", "L’agente de liaison réapparaît avec les noms de plusieurs agents doubles. La confiance accordée autrefois détermine qui l’écoute.", "Lui confier l’opération", "Vérifier les noms avant d’agir", { tags: ["callback", "agent"], callbackFlags: { trustedAgentCendre: true } }),
      scene("shinsekai-pivoine-operation", "Le dernier détonateur de la saboteuse", "La saboteuse peut détruire une forteresse sans toucher la ville, mais doit rester pour déclencher la charge.", "Prendre sa place", "Trouver un déclenchement distant", { tags: ["callback", "sabotage"], callbackFlags: { recruitedPivoineSaboteur: true }, boldTag: "Sacrifice" }),
      scene("shinsekai-rare-break-chains", "La nuit sans chaînes", "Des milliers de captifs peuvent être libérés au même instant si toutes les cellules renoncent à leur couverture.", "Briser toutes les chaînes", "Préparer les refuges avant le signal", { tags: ["dream", "liberation"], boldTag: "Sans retour", major: true }),
      scene("shinsekai-rare-reveal-century", "Le texte que le monde doit lire", "Trois Ponéglyphes et les archives récupérées composent une révélation vérifiable sur le Siècle oublié.", "Diffuser la traduction", "Inviter des témoins indépendants", { tags: ["dream", "void-century"], boldTag: "Vérité", major: true }),
      scene("shinsekai-rare-world-network", "La toile des quatre mers", "Les routes des quatre mers cardinales, de Grand Line et des zones secrètes peuvent enfin former un réseau mondial.", "Relier tous les relais", "Conserver des cellules autonomes", { tags: ["dream", "network"], boldTag: "Organisation", major: true }),
      scene("shinsekai-rare-free-nation", "Le premier matin sans maître", "Un peuple libéré demande de l’aide pour survivre sans tribut, sans roi et sans armée d’occupation.", "Bâtir ses institutions", "Obtenir sa reconnaissance", { tags: ["dream", "free-nation"], boldTag: "Sagesse", major: true }),
      scene("shinsekai-very-rare-four-dreams", "L’aube choisit son héritage", "Prisonniers, archives, réseau et territoire convergent dans une opération capable d’accomplir le rêve révolutionnaire poursuivi depuis le départ.", "Consacrer toutes les forces au rêve", "Préserver les peuples avant la victoire", { tags: ["dream", "world"], boldTag: "Dernière chance", major: true, winFlags: { achievedDecisiveRevolutionaryDreamAdvance: true } }),
      scene("shinsekai-very-rare-world-revolution", "Le jour où les drapeaux tombent", "Une révolte mondiale éclate tandis que le Gouvernement mondial prépare sa réponse. Chaque ancienne alliance décide si l’aube durera.", "Coordonner le soulèvement", "Protéger les nations déjà libres", { tags: ["world", "revolution"], boldTag: "Sans retour", major: true, dangerTheme: true, requiredFlags: { coordinatedMultiSeaRevolutionaryOperation: true }, winFlags: { openedPathToWorldwideLiberation: true } }),
    ],
  });

  const ADVANCED_EVENT_PACK = [];
  [
    [PATHS.PIRATE, PIRATE_EVENTS],
    [PATHS.MARINE, MARINE_EVENTS],
    [PATHS.BOUNTY_HUNTER, BOUNTY_HUNTER_EVENTS],
    [PATHS.REVOLUTIONARY, REVOLUTIONARY_EVENTS],
  ].forEach(([path, collection]) => {
    const scenes = ADVANCED_SCENES[path];
    let offset = 0;

    ADVANCED_ZONE_BLOCKS.forEach((block) => {
      const blockScenes = scenes.slice(offset, offset + block.count);
      blockScenes.forEach((entry, index) => {
        const event = createAdvancedEvent(path, block, index, entry);
        ADVANCED_EVENT_PACK.push(event);
        collection.push(event);
      });
      offset += block.count;
    });
  });

  /* ========================================================
     MINI-ARCS CANONIQUES DES TROIS ZONES SPÉCIALES
     Les anciennes scènes restent définies pour relire une sauvegarde qui en
     contient une copie, mais seuls les événements marqués ci-dessous entrent
     encore dans les nouveaux tirages.
  ======================================================== */
  const SPECIAL_CANONICAL_CAST = Object.freeze({
    "starless-sea": Object.freeze({
      pirate: ["Borsalino", "Kizaru"],
      marine: ["Borsalino", "Kizaru"],
      "bounty-hunter": ["Basil Hawkins", "Hawkins"],
      revolutionary: ["Karasu", "Karasu"],
    }),
    "wandering-archipelago": Object.freeze({
      pirate: ["Trafalgar Law", "Law"],
      marine: ["Issho", "Fujitora"],
      "bounty-hunter": ["Dracule Mihawk", "Mihawk"],
      revolutionary: ["Morley", "Morley"],
    }),
    "tempest-isle": Object.freeze({
      pirate: ["Eustass Kid", "Kid"],
      marine: ["Smoker", "Smoker"],
      "bounty-hunter": ["Killer", "Killer"],
      revolutionary: ["Sabo", "Sabo"],
    }),
  });

  const SPECIAL_CANONICAL_DIALOGUES = Object.freeze({
    "Borsalino": [
      "Oooh… quelle route inquiétante. Voyons si tu la suivras encore quand la lumière cessera de t’aider.",
      "Tu as donc trouvé ton cap dans cette nuit… Quelle bande de jeunes gens terrifiants.",
    ],
    "Basil Hawkins": [
      "Tes chances de quitter cette mer avec la cible sont faibles. Celles de changer ce calcul ne sont pourtant pas nulles.",
      "La carte annonçait ta défaite. Il semble que je doive enfin corriger la probabilité.",
    ],
    "Karasu": [
      "Mes corbeaux porteront le message. Ta tâche est de préserver le silence autour de ceux qui doivent le recevoir.",
      "La route existe désormais. Ne laisse pas notre victoire révéler les noms qu’elle devait protéger.",
    ],
    "Trafalgar Law": [
      "Ne confonds pas alliance et confiance. Suis le plan, et chacun repartira avec ce qu’il aura su préserver.",
      "L’accord s’arrête à la sortie de l’archipel. Jusque-là, aucune vie ne sera une monnaie d’échange.",
    ],
    "Issho": [
      "Une loi qui abandonne les innocents ne pèse pas lourd face à leur vie. Montrez-moi quelle justice vous choisirez.",
      "Je soutiendrai votre décision si vous pouvez encore la regarder en face lorsque cette île sera loin.",
    ],
    "Dracule Mihawk": [
      "Je ne suis pas venu réclamer un duel. Montre-moi seulement si ta chasse possède davantage de tranchant que ton orgueil.",
      "Tu as évité les combats inutiles sans abandonner ta cible. C’est un jugement plus rare qu’une victoire.",
    ],
    "Morley": [
      "Je peux ouvrir la terre, mais pas décider qui vous laisserez derrière. Donne le signal quand tout le monde sera prêt.",
      "Héhé ! Le pont tiendra pour les derniers aussi. Une révolution ne ferme pas la porte aux retardataires !",
    ],
    "Eustass Kid": [
      "Cette île et son tonnerre seront à moi. Si ton pavillon veut le noyau, qu’il ose me devancer !",
      "Tch… tu n’as pas plié. Ne t’imagine pas que ça fait de nous des alliés.",
    ],
    "Smoker": [
      "Je veux les trafiquants, mais pas au prix du village. Donne-moi un plan qui ne sacrifie ni la justice ni les civils.",
      "Ton rapport tiendra s’il dit les faits. Les excuses, elles, partiront avec la prochaine averse.",
    ],
    "Killer": [
      "La cible t’appartient si ton contrat est honnête. Touche à un innocent de l’équipage, et la chasse change de proie.",
      "Fais vérifier chaque clause. Kid n’attendra pas une seconde trahison du commanditaire.",
    ],
    "Sabo": [
      "On détruit le relais après l’évacuation. Une révolution qui oublie les habitants ne mérite pas sa victoire.",
      "Le signal doit voyager sans désigner ceux qui nous ont aidés. Trouve la méthode, je fournirai la flamme.",
    ],
  });

  function getSpecialCanonicalDialogue(canonicalName, shortName, sceneIndex) {
    if (sceneIndex !== 0 && sceneIndex < 3) return null;
    const lines = SPECIAL_CANONICAL_DIALOGUES[canonicalName];
    if (!lines) return null;
    return {
      speaker: shortName,
      role: canonicalName,
      text: lines[sceneIndex === 0 ? 0 : 1],
    };
  }

  const specialArcScene = (slug, title, description, resolutionCategory, risk, choices, success, mixed, failure) => ({
    slug, title, description, resolutionCategory, risk, choices, success, mixed, failure,
  });

  const SPECIAL_CANONICAL_ARCS = Object.freeze({
    "starless-sea": Object.freeze({
      pirate: Object.freeze([
        specialArcScene("light-on-black-water", "La lumière sur la mer noire", "Dans l’obscurité absolue, le corps lumineux de Kizaru devient l’unique amer — et révèle qu’il a déjà localisé ton pavillon. L’Amiral propose avec son calme ironique de choisir toi-même la direction de la fuite.", "social", false, ["Lui donner un faux cap assez crédible pour attirer son attention", "Éteindre tout le bord et lire seulement le reflet de ses déplacements", "Provoquer Kizaru pour couvrir la retraite de l’équipage"], "Kizaru suit le leurre assez longtemps pour que ton pavillon disparaisse de sa ligne d’interception ; son commentaire amusé confirme qu’il a compris la ruse.", "Le navire sort de son axe, mais un rayon coupe les dernières voiles et transforme la fuite en dérive contrôlée.", "Kizaru traverse le leurre et ferme la route ; tu dois abandonner du matériel pour soustraire l’équipage à l’Amiral."),
        specialArcScene("mirror-wrecks", "Les rayons entre les épaves", "Kizaru ricoche entre des épaves couvertes de plaques réfléchissantes et coupe méthodiquement toutes les sorties. Le vaincre n’est pas réaliste : il faut retourner sa lumière contre la géographie de la Mer sans étoiles.", "action", true, ["Attirer ses rayons vers les coques réfléchissantes", "Tenir le pont pendant que l’équipage change silencieusement de cap", "Traverser son faisceau au seul instant où les épaves l’occultent"], "La lumière se disperse entre les coques et Kizaru interrompt son tir pour ne pas frapper sa propre ligne ; ton objectif est atteint sans prétendre avoir vaincu l’Amiral.", "Tu encaisses la pression et sauves le pavillon, mais Kizaru marque la coque avant de perdre le contact.", "Un reflet imprévu livre ta position ; l’équipage arrache le navire au barrage au prix de blessures et de dégâts sérieux."),
        specialArcScene("last-illuminated-crew", "Le dernier équipage éclairé", "Kizaru immobilise un équipage pirate blessé dont les lanternes attirent chaque rayon. Il te laisse une ouverture évidente vers la sortie, comme s’il voulait mesurer ce que vaut ton pavillon lorsqu’une fuite facile exige un abandon.", "action", true, ["Interposer ton navire jusqu’à l’évacuation des blessés", "Briser les lanternes à distance puis guider les deux équipages en anticipant le prochain rayon", "Feindre une attaque frontale pour déplacer Kizaru loin des naufragés"], "Les blessés quittent la zone pendant que Kizaru suspend sa poursuite ; tu n’as pas battu l’Amiral, mais tu as accompli le sauvetage sous son regard.", "Une partie des naufragés est sauvée avant que l’interception reprenne et force les deux pavillons à se séparer.", "La lumière referme le passage trop tôt ; tu extrais les survivants les plus proches mais perds le cap et plusieurs réserves."),
      ]),
      marine: Object.freeze([
        specialArcScene("admiral-vague-order", "L’ordre volontairement incomplet", "L’Amiral Kizaru supervise une flotte privée de tout repère et ordonne simplement d’« intercepter ce qui semble suspect ». Son imprécision est un test : obéir aveuglément mettrait des civils dans la ligne de tir.", "social", false, ["Définir toi-même des règles d’identification et les assumer", "Demander à Kizaru de jouer la cible pendant que les unités apprennent ses trajectoires", "Contester l’ordre avant de répartir les observateurs"], "Kizaru valide d’un sourire les règles qui protègent les civils et confie à ton unité la coordination de l’interception.", "L’exercice identifie les vrais navires suspects, mais plusieurs unités contestent encore ton interprétation de l’ordre.", "La flotte suit des signaux contradictoires et Kizaru reprend le commandement avant qu’une collision ne transforme l’exercice en désastre."),
        specialArcScene("light-projection-drill", "Les silhouettes de lumière", "Kizaru projette des éclats mobiles dans la Mer sans étoiles pour simuler une attaque venue de toutes les directions. Il évalue la perception, la discipline et la protection mutuelle, pas la capacité absurde à le battre.", "action", true, ["Couvrir la formation plutôt que poursuivre les éclats", "Marquer chaque projection par son écho sur la coque", "Intercepter uniquement la lumière qui menace les transports"], "Ton unité ignore les leurres et protège chaque transport ; Kizaru reconnaît que ta discipline vaut davantage qu’une poursuite spectaculaire.", "La formation tient, mais deux projections franchissent l’écran et exposent les failles du dispositif.", "Les unités se dispersent derrière la vitesse de Kizaru et l’exercice s’achève sur une évacuation chaotique des navires simulés."),
        specialArcScene("civilian-convoy-verdict", "Le convoi dans la ligne lumineuse", "Une interception réelle commence lorsque des contrebandiers se mêlent à un convoi civil. Kizaru peut fermer toute la zone en quelques tirs, mais te donne quelques instants pour proposer une méthode moins dangereuse.", "social", false, ["Faire séparer les navires par des codes sonores vérifiables", "Prendre la responsabilité d’une inspection rapprochée", "Coordonner les unités pour rabattre les contrebandiers hors du convoi"], "Ton dispositif isole les contrebandiers sans toucher aux civils et Kizaru laisse officiellement l’opération sous ton commandement.", "La majorité du convoi est protégée, mais une cible profite du tri pour s’échapper dans la nuit.", "Les codes sont compromis et Kizaru doit neutraliser les moteurs au dernier instant ; la mission réussit sans que ton commandement soit validé."),
      ]),
      "bounty-hunter": Object.freeze([
        specialArcScene("unspoken-percentage", "La probabilité que Hawkins tait", "Basil Hawkins attend la même cible dans la nuit sans horizon. Ses cartes donnent un pourcentage à chaque route, sauf une qu’il refuse d’annoncer ; son calcul sert déjà à pousser les chasseurs vers les issues qu’il contrôle.", "social", false, ["Suivre la seule route qu’il ne chiffre pas", "Modifier publiquement la valeur du contrat pour fausser ses réactions", "L’obliger à révéler ce que ses cartes protègent"], "Tu identifies l’angle mort volontaire de Hawkins et atteins la cible avant que ses probabilités puissent enfermer la chasse.", "Le calcul de Hawkins perd sa précision, mais la cible s’échappe avec une partie des preuves.", "Tu choisis exactement la route prévue ; des hommes de paille referment le piège et t’obligent à sacrifier le contrat pour sortir."),
        specialArcScene("straw-decoys", "Les silhouettes de paille", "Des doubles de paille dérivent autour du navire de Hawkins et rendent chaque présence incertaine. Les dommages détournés par son pouvoir et ses préparatifs font d’un duel frontal une mauvaise chasse.", "action", true, ["Couper les amarres des doubles sans frapper Hawkins", "Repérer la seule silhouette qui commande les autres", "Traverser le cercle avant qu’il ne redistribue le danger"], "Tu démontes le dispositif sans offrir de dommage à transférer et saisis l’indice que Hawkins gardait au centre du cercle.", "Le cercle est brisé, mais Hawkins conserve la cible et reconnaît seulement que ses cartes t’avaient sous-estimé.", "Les poupées absorbent la première attaque et retournent la pression contre ton groupe ; la retraite coûte cher et la piste disparaît."),
        specialArcScene("recalculated-hunt", "La chasse recalculée", "Après tes choix dans la Mer sans étoiles, Hawkins annonce que ta survie a fait chuter la fiabilité de ses prédictions. Il propose une dernière course vers la cible, où chaque balise allumée modifie les probabilités suivantes.", "social", false, ["Éteindre les balises dans un ordre que ses cartes ne modélisent pas", "Partager une fausse prédiction avec les chasseurs concurrents", "Parier le contrat sur une interception unique"], "Hawkins doit recalculer trop tard : tu sécurises la cible et le paiement tout en gagnant son respect prudent.", "La cible est neutralisée, mais Hawkins obtient les preuves qui décident du commanditaire final.", "Le pari confirme sa meilleure probabilité et livre la cible à Hawkins ; tu conserves ta vie, pas le contrat."),
      ]),
      revolutionary: Object.freeze([
        specialArcScene("crows-without-lanterns", "Les corbeaux sans lanternes", "Karasu disperse ses corbeaux de suie dans l’obscurité pour porter des messages entre des réfugiés invisibles. Il te demande de trouver le seul essaim compromis sans allumer la moindre lumière gouvernementale.", "social", false, ["Comparer les silences entre les messages de Karasu", "Créer un faux ordre que seul l’essaim infiltré relaiera", "Coordonner les réfugiés par des signaux frappés sur les coques"], "Tu isoles la fausse liaison et Karasu confie à ta cellule une partie de la route clandestine.", "Le convoi passe, mais l’essaim compromis emporte l’emplacement d’un refuge secondaire.", "Le faux signal se propage au mauvais groupe et Karasu disperse toute l’opération avant l’arrivée de la patrouille."),
        specialArcScene("soot-interception-test", "L’interception de suie", "Karasu transforme la nuit en exercice : ses corbeaux encerclent ton navire, déplacent les ordres et simulent une patrouille gouvernementale. La confrontation teste la discrétion et la résistance, pas une hostilité entre Révolutionnaires.", "action", true, ["Traverser l’essaim sans rompre la formation", "Protéger les messagers pendant la fausse attaque", "Capturer le corbeau porteur du véritable ordre"], "Ton groupe conserve ses codes et son cap sous la pression ; Karasu met fin au test et reconnaît la fiabilité de ta cellule.", "Tu protèges les messagers mais révèles un relais, que Karasu fait immédiatement déplacer.", "L’essaim sépare le groupe et l’exercice expose une faille qui aurait condamné la cellule lors d’une vraie interception."),
        specialArcScene("black-convoy", "Le convoi derrière Karasu", "Un navire gouvernemental suit les réfugiés grâce aux vibrations de leurs rames. Karasu veut aveugler ses guetteurs avec la suie ; ton plan doit décider comment sauver le convoi sans transformer l’obscurité en piège pour les civils.", "social", false, ["Faire de la suie un faux sillage vers une épave", "Répartir les réfugiés derrière plusieurs essaims", "Défendre une route plus lente mais vérifiable par tous"], "La patrouille poursuit le faux sillage et Karasu conduit chaque embarcation jusqu’au refuge sans perdre un seul agent.", "Les réfugiés atteignent la côte, mais un relais et plusieurs réserves doivent être abandonnés.", "La patrouille comprend la diversion et force Karasu à couvrir une évacuation précipitée ; le réseau survit amputé de cette route."),
      ]),
    }),
    "wandering-archipelago": Object.freeze({
      pirate: Object.freeze([
        specialArcScene("room-before-landfall", "La ROOM avant l’accostage", "Trafalgar Law déploie sa ROOM sur deux îles qui s’apprêtent à échanger leur position. Il poursuit une archive médicale et te prévient que ton équipage deviendra une pièce de son plan si tu entres sans accord.", "social", false, ["Négocier une limite précise à sa ROOM", "Proposer un échange d’informations plutôt qu’une alliance", "Refuser son plan et annoncer ta propre route"], "Law respecte les limites convenues et ton équipage atteint son objectif sans servir de monnaie d’échange.", "Les deux capitaines obtiennent une partie de ce qu’ils cherchent, mais Law garde l’avantage sur la prochaine dérive.", "Law échange les positions au moment critique et te laisse sur l’îlot que ton refus avait rendu prévisible."),
        specialArcScene("cut-island-course", "La course sur l’île découpée", "Law sépare spatialement les passages d’un îlot mouvant pour atteindre sa cible avant toi. Les morceaux restent indemnes, mais chaque échange de position transforme la traversée en confrontation tactique.", "action", true, ["Bondir entre les fragments avant leur prochain échange", "Ancrer l’équipage sur le seul relief hors de sa ROOM", "Protéger le porteur de carte pendant que Law déplace le terrain"], "Tu atteins l’objectif avant la fermeture de la ROOM et Law admet que tu n’étais pas une pièce facile à déplacer.", "L’équipage reste groupé et sauve la carte, mais Law récupère l’archive recherchée le premier.", "Un échange spatial sépare le groupe ; tu récupères les tiens au prix du matériel et abandonnes la compétition."),
        specialArcScene("captains-temporary-line", "La ligne provisoire des capitaines", "Une collision d’îles menace les deux équipages et le village installé entre eux. Law propose une alliance limitée : sa ROOM déplacera les structures, mais ton pavillon devra maintenir le passage sous les éboulements.", "action", false, ["Tenir le passage pendant les échanges de Law", "Marquer les maisons que sa ROOM doit déplacer en priorité", "Imposer que chaque capitaine protège l’équipage de l’autre"], "La manœuvre sauve le village et les deux équipages ; Law rompt l’alliance dès l’objectif atteint, avec un respect net pour ton commandement.", "Le village est évacué, mais une partie des navires reste prisonnière du nouveau relief.", "Les priorités divergent au pire instant et chaque capitaine ne sauve que son propre bord avant la collision."),
      ]),
      marine: Object.freeze([
        specialArcScene("gravity-evacuation-order", "L’ordre sous la gravité", "Fujitora maintient deux masses terrestres séparées par sa gravité pendant une évacuation. Un ordre officiel exige d’abord de sauver les archives gouvernementales ; l’Amiral attend de voir quelle justice guidera ton unité.", "social", false, ["Donner publiquement la priorité aux civils", "Répartir les unités pour sauver personnes et preuves", "Demander à Fujitora de juger ton plan avant l’effondrement"], "Fujitora soutient ta priorité et la population quitte l’île avant qu’il ne relâche la gravité.", "Les civils survivent, mais les archives disparaissent et la hiérarchie ouvre une enquête sur ton ordre.", "L’hésitation consume le temps offert par Fujitora ; l’évacuation devient une fuite désordonnée entre les fragments."),
        specialArcScene("pressure-command-test", "Le commandement sous pression", "Fujitora augmente progressivement la gravité sur un plateau vide pendant que ton unité doit déplacer des charges de secours. L’exercice mesure la résistance, le Haki et la capacité à protéger les plus faibles.", "action", true, ["Porter la charge centrale sous la pression", "Former une chaîne protégée par le Haki", "Renoncer à la vitesse pour évacuer chaque soldat"], "Toute l’unité franchit la ligne sans abandon et Fujitora relâche la pression en validant ton commandement.", "Les secours arrivent, mais plusieurs soldats s’effondrent et révèlent une organisation trop dépendante de toi.", "La formation cède sous la gravité ; Fujitora interrompt immédiatement l’exercice avant des blessures irréversibles."),
        specialArcScene("moving-border-justice", "La justice d’une frontière mouvante", "Deux villages revendiquent le même terrain chaque fois que leurs îles se rejoignent. Fujitora peut les séparer par la gravité, mais refuse qu’une solution physique remplace une décision juste et durable.", "social", false, ["Créer une administration commune pour les jours de jonction", "Faire témoigner les habitants avant de déplacer les îles", "Défendre une frontière maritime qui suit les personnes"], "Fujitora stabilise les îles le temps que les villages ratifient une règle commune, puis laisse leur justice fonctionner sans lui.", "Un accord provisoire évite la crise, mais devra être renégocié à chaque grande dérive.", "La solution favorise un village et Fujitora refuse de l’imposer ; les deux terres se séparent sans régler le conflit."),
      ]),
      "bounty-hunter": Object.freeze([
        specialArcScene("black-blade-line", "La ligne tracée par la lame noire", "Mihawk coupe d’un seul geste le passage devant ta cible, puis attend au bord du fragment détaché. Il n’est ni une prime raisonnable ni un adversaire à vaincre : il observe si ta chasse mérite de franchir sa ligne.", "social", false, ["Demander le droit de poursuivre sans dégainer", "Expliquer pourquoi la cible doit être prise vivante", "Contourner sa ligne en assumant le refus du duel"], "Mihawk reconnaît la précision de ton intention et te laisse poursuivre sans transformer l’épreuve en duel suicidaire.", "Il ouvre un passage étroit, mais la cible gagne assez de temps pour préparer sa défense.", "Ta justification ne résiste pas à son silence ; Mihawk maintient la ligne et le contrat s’éloigne avec l’île suivante."),
        specialArcScene("single-strike-trial", "Une seule attaque de Mihawk", "Mihawk annonce une unique attaque contre le pont rocheux que tu dois franchir. Réussir signifie préserver la chasse malgré sa puissance, pas le vaincre ni soutenir un duel complet.", "action", true, ["Dévier les éclats plutôt que sa lame", "Lire son intention et quitter l’axe", "Protéger la cible capturée pendant l’effondrement"], "Tu traverses avec ta capture intacte et survis à l’onde qui tranche le pont ; Mihawk accorde simplement le droit de continuer.", "La capture reste sous contrôle, mais ton groupe perd son équipement dans la coupure du terrain.", "L’attaque sépare la cible de ton groupe ; Mihawk n’en porte pas une seconde, mais la chasse doit être abandonnée."),
        specialArcScene("precision-over-pride", "La précision plutôt que l’orgueil", "La cible utilise Mihawk comme bouclier en provoquant publiquement les chasseurs. Le véritable test consiste à accomplir le contrat sans offrir au meilleur sabreur un combat inutile.", "social", false, ["Révéler la fuite cachée derrière la provocation", "Attendre que la dérive sépare Mihawk de la cible", "Reconnaître l’écart de puissance et concentrer tous les chasseurs sur le contrat"], "Tu neutralises la cible sans diriger une arme vers Mihawk ; son bref acquiescement vaut reconnaissance de ton jugement professionnel.", "La cible est capturée, mais un rival revendique la manœuvre décisive devant les témoins.", "L’orgueil gagne les chasseurs et Mihawk détruit leur dispositif d’un geste ; la cible profite du chaos pour fuir."),
      ]),
      revolutionary: Object.freeze([
        specialArcScene("morley-moving-tunnel", "Le tunnel qui change d’île", "Morley ouvre dans le sol mouvant un passage pour une cellule traquée, mais chaque rapprochement d’îles menace d’écraser une galerie. La commandante révolutionnaire teste ta capacité à synchroniser agents et terrain.", "social", false, ["Cadencer les départs sur les signaux de Morley", "Répartir la cellule entre plusieurs sorties autonomes", "Demander aux habitants de guider les agents par la surface"], "La cellule traverse chaque galerie au rythme des transformations de Morley et disparaît avant l’arrivée du Gouvernement.", "Les agents passent, mais une sortie et son stock clandestin doivent être condamnés.", "Une mauvaise synchronisation enferme un groupe ; Morley le libère au prix de révéler toute la route."),
        specialArcScene("terrain-control-drill", "L’épreuve du relief vivant", "Morley remodèle un plateau en vagues de terre pour simuler l’assaut d’une prison. L’exercice confronte ta cellule au terrain sans jamais devenir un combat mortel entre Révolutionnaires.", "action", true, ["Maintenir la formation sur les crêtes mobiles", "Protéger les porteurs pendant l’ouverture des passages", "Atteindre le point de sortie avant que Morley ne referme le sol"], "Ta cellule garde sa cohésion et atteint l’objectif ; Morley transforme aussitôt l’exercice réussi en plan d’opération réel.", "Le groupe atteint la sortie, mais abandonne plusieurs charges et révèle une faiblesse logistique.", "Le relief disperse la cellule et Morley arrête le test pour extraire les agents coincés."),
        specialArcScene("village-or-secret-route", "Le village au-dessus de la route", "Une opération de Morley peut déplacer un village entier loin d’une garnison, mais condamnerait la meilleure route clandestine de l’archipel. Le désaccord porte sur la priorité, pas sur la loyauté.", "social", false, ["Défendre le déplacement immédiat des civils", "Créer avec Morley une route secondaire avant l’opération", "Faire choisir les habitants après avoir exposé les risques"], "Morley ouvre une nouvelle voie pendant que le village glisse vers un refuge sûr ; civils et réseau survivent ensemble.", "Les habitants sont sauvés, mais la route principale disparaît définitivement sous le relief.", "Le débat dure trop longtemps et la garnison approche ; Morley évacue le village dans l’urgence en sacrifiant tout le réseau local."),
      ]),
    }),
    "tempest-isle": Object.freeze({
      pirate: Object.freeze([
        specialArcScene("kid-lightning-grid", "Le réseau de paratonnerres de Kid", "Eustass Kid arrache le métal des tours conductrices et construit un assemblage magnétique au cœur de l’orage. Il revendique le réseau entier et défie ton pavillon d’atteindre le noyau avant lui.", "social", false, ["Le provoquer sur une course plutôt qu’un duel destructeur", "Convaincre les gardiens de couper les conducteurs qu’il contrôle", "Miser ton pavillon sur le premier capitaine au noyau"], "Tu détournes la rivalité vers une compétition limitée et atteins l’objectif avant Kid, qui reconnaît furieusement la victoire sans se soumettre.", "Les deux capitaines atteignent le noyau ensemble et se partagent l’accès sous une trêve explosive.", "Kid refuse tes règles, magnétise les accès et te chasse du réseau avant que l’orage ne le surcharge."),
        specialArcScene("magnetic-storm-clash", "Le géant de métal sous la foudre", "Kid absorbe armes, rails et débris dans une masse magnétique frappée par les éclairs. Lui tenir tête signifie préserver ton équipage et le dispositif de l’île, pas écraser facilement un capitaine de sa puissance.", "action", true, ["Ancrer le navire hors de l’attraction magnétique", "Frapper les articulations seulement entre deux éclairs", "Tenir Kid assez longtemps pour évacuer les gardiens"], "Ton équipage reste hors de l’emprise et l’évacuation s’achève ; Kid interrompt l’affrontement pour sauver son propre navire de la surcharge.", "Tu résistes à l’assaut et protèges le pavillon, mais l’objectif métallique tombe sous le contrôle de Kid.", "L’attraction arrache les défenses du bord et la foudre frappe le pont ; la retraite évite l’anéantissement au prix de lourds dégâts."),
        specialArcScene("two-crews-one-cyclone", "Deux équipages dans le même cyclone", "Le cœur de la tempête aspire les deux navires tandis que l’assemblage de Kid attire chaque éclair. Une alliance forcée peut sauver les équipages, mais aucun capitaine n’acceptera de paraître soumis.", "action", true, ["Guider la décharge pendant que Kid disperse le métal", "Attacher les deux navires sous deux pavillons distincts", "Prendre le gouvernail du passage et lui laisser le noyau magnétique"], "Les deux équipages sortent du cyclone et Kid admet que ton pavillon a tenu sans plier, avant de rompre l’alliance sur-le-champ.", "Les navires survivent, mais Kid emporte la majeure partie du métal et proclame sa version de l’exploit.", "La coordination cède sous les provocations ; chaque équipage s’arrache seul au cyclone en abandonnant cargaison et réparations."),
      ]),
      marine: Object.freeze([
        specialArcScene("smoker-storm-interception", "L’interception dans la fumée", "Le vice-amiral Smoker mène un exercice où sa fumée se confond avec les nuages bas et masque une cible entre les paratonnerres. Il teste la poursuite et la lecture du terrain, pas un combat hostile entre Marines.", "action", false, ["Couper sa trajectoire au pied des tours", "Repérer sa jitte dans la fumée", "Protéger la sortie civile plutôt que poursuivre son leurre"], "Tu identifies la vraie interception et Smoker confie à ton unité la tête de la prochaine patrouille.", "La cible simulée est contenue, mais Smoker franchit ton dispositif et note une faille dans la protection.", "Sa fumée divise l’unité et l’exercice s’arrête lorsque la foudre menace les retardataires."),
        specialArcScene("arrest-or-rescue", "L’arrestation ou le village", "Des trafiquants fuient vers les tours au moment où la foudre incendie un quartier. Smoker veut maintenir la poursuite, mais écoute ton plan si tu peux empêcher que la cible et les civils soient sacrifiés l’un à l’autre.", "social", true, ["Convaincre Smoker de te laisser le sauvetage pendant qu’il poursuit", "Bloquer les sorties avec sa fumée avant d’évacuer", "Donner la priorité au village et assumer la fuite possible"], "Smoker verrouille les trafiquants tandis que ton unité évacue le quartier ; arrestation et protection réussissent sans trahir sa justice.", "Les civils sont sauvés, mais le chef du réseau s’échappe entre les éclairs.", "La répartition arrive trop tard : Smoker abandonne la poursuite pour éviter des victimes et critique sévèrement ton commandement."),
        specialArcScene("jitte-conductor-operation", "La jitte et les conducteurs", "Smoker traque le dernier convoi du réseau à travers une usine saturée de métal. Sa mobilité de fumée est rapide, mais la foudre suit les conducteurs et menace les prisonniers utilisés comme couverture.", "social", false, ["Tracer pour Smoker une route sans conducteur", "Faire déposer les armes avant qu’elles attirent la prochaine salve", "Coordonner une fausse évacuation pour isoler le convoi"], "Smoker frappe le véhicule de tête pendant que ton plan libère les prisonniers ; il reconnaît une opération menée selon les priorités justes.", "Le convoi est arrêté, mais plusieurs preuves brûlent dans la décharge électrique.", "La foudre suit une arme oubliée et force toutes les unités à rompre l’encerclement pour sauver les captifs."),
      ]),
      "bounty-hunter": Object.freeze([
        specialArcScene("killer-conductive-trail", "La piste conductrice de Killer", "Killer poursuit le même fugitif entre des rails chargés d’électricité. Ses lames rotatives font vibrer les structures métalliques et lui révèlent chaque déplacement avant les autres chasseurs.", "social", false, ["Créer une fausse vibration dans le réseau de rails", "Proposer une règle de priorité sur la capture", "Suivre la seule structure que Killer évite de toucher"], "Tu lis la piste négligée et atteins le fugitif avant Killer, qui respecte la qualité de la chasse sans renier son équipage.", "Les deux chasseurs coincent la cible, mais aucun ne sécurise seul les preuves et le paiement reste disputé.", "Killer identifie ton leurre et retourne la vibration contre ta piste ; le fugitif change de secteur sous sa couverture."),
        specialArcScene("rotating-blades-race", "La course des lames sous l’orage", "Killer transforme les passerelles conductrices en arène de poursuite, ses lames rotatives ouvrant les obstacles à chaque impact. La cible est liée aux intérêts de l’équipage de Kid et il ne te laissera pas la prendre sans épreuve.", "action", true, ["Tenir sa vitesse jusqu’au prochain paratonnerre", "Dévier ses lames loin des témoins", "Couper la route de la cible plutôt que celle de Killer"], "Tu sécurises la cible sans vaincre Killer en duel ; il suspend l’affrontement parce que ta capture respecte la limite qu’il avait fixée.", "La cible est immobilisée, mais Killer garde l’objet qu’elle transportait pour son équipage.", "Ses lames détruisent ton raccourci et te forcent à protéger les témoins ; Killer extrait la cible avant la prochaine salve."),
        specialArcScene("loyalty-clause", "La clause que Killer refuse", "Le commanditaire révèle que le contrat exige de livrer un mécanicien de Kid avec le véritable fugitif. Killer vient empêcher cette remise, et sa loyauté transforme la fin de chasse en choix professionnel dangereux.", "social", true, ["Démontrer devant Killer que la seconde cible est une clause frauduleuse", "Livrer seulement le fugitif sous témoins", "Retourner le contrat contre le commanditaire"], "Killer laisse la remise légitime s’accomplir et emporte le mécanicien ; tu conserves paiement, indépendance et respect professionnel.", "Le fugitif est remis, mais le commanditaire retient une partie de la prime pour la clause refusée.", "Les preuves ne suffisent pas et Killer détruit le dispositif de remise ; le contrat échoue avant qu’un innocent soit livré."),
      ]),
      revolutionary: Object.freeze([
        specialArcScene("sabo-firebreak", "Le coupe-feu de Sabo", "Sabo utilise le Mera Mera no Mi pour ouvrir un passage dans une installation gouvernementale, mais le métal surchauffé attire la foudre vers les quartiers ouvriers. Il exige un plan qui détruise le relais sans condamner les civils.", "social", false, ["Défendre une évacuation complète avant le sabotage", "Répartir les charges loin des conducteurs", "Coordonner les ouvriers avec les signaux de feu de Sabo"], "Sabo détruit le relais au moment prévu tandis que ton réseau évacue chaque quartier ; l’opération valide ta capacité de commandement.", "L’installation tombe et les civils survivent, mais plusieurs agents doivent abandonner leur couverture.", "Le plan sous-estime la conduction et Sabo détourne ses flammes pour protéger les habitants, laissant l’objectif gouvernemental intact."),
        specialArcScene("haki-in-thunder", "La garde dans le tonnerre", "Sabo impose un entraînement défensif sous les impacts, utilisant ses techniques martiales pour tester garde, volonté et protection. La confrontation est contrôlée, mais l’orage rend chaque erreur réellement dangereuse.", "action", true, ["Maintenir ta garde face à ses frappes sans reculer vers le métal", "Protéger un partenaire pendant l’enchaînement", "Lire son intention entre le tonnerre et la chaleur"], "Tu tiens l’épreuve sans exposer ton partenaire et Sabo reconnaît une volonté prête pour l’opération finale.", "La garde résiste, mais Sabo doit interrompre l’enchaînement avant qu’un éclair ne frappe la zone d’exercice.", "Une erreur de placement attire la décharge ; Sabo évacue le groupe et l’entraînement s’achève sur des blessures évitables."),
        specialArcScene("storm-prison-operation", "La prison au centre de l’orage", "Sabo veut libérer les travailleurs enfermés dans une centrale conductrice tandis que la cellule locale préfère détruire immédiatement les données du Gouvernement. Ton choix de méthode décidera si l’opération reste une libération.", "social", false, ["Faire des prisonniers la priorité avant les archives", "Demander à Sabo de contenir l’incendie pendant l’extraction", "Séparer la cellule entre sauvetage et sabotage contrôlé"], "Tous les prisonniers sortent avant que Sabo et les agents neutralisent la centrale ; les preuves utiles survivent sans passer avant les vies.", "Les captifs sont libérés, mais les archives et une partie du réseau local disparaissent dans l’orage.", "Les deux objectifs se gênent et Sabo abandonne le sabotage pour extraire les derniers prisonniers sous le feu gouvernemental."),
      ]),
    }),
  });

  const SPECIAL_CANONICAL_EPILOGUES = Object.freeze({
    "starless-sea": Object.freeze({
      pirate: specialArcScene("kizaru-final-bearing", "Le cap laissé par Kizaru", "À la limite de la Mer sans étoiles, Kizaru éclaire trois routes d’un même rayon puis attend de voir laquelle ton pavillon osera prendre. Sa dernière interception mesure ce que tu as appris de sa vitesse et de ses feintes.", "social", false, ["Choisir le cap que sa lumière évite", "Faire naviguer l’équipage sur ses seuls échos", "Laisser un faux pavillon suivre le rayon évident"], "Ton navire retrouve la route du Nouveau Monde et Kizaru abandonne la poursuite avec une remarque ironique qui vaut reconnaissance.", "Le cap est retrouvé, mais le faux pavillon et plusieurs réserves restent derrière.", "La lumière t’amène sur un courant fermé et Kizaru force une dernière retraite coûteuse."),
      marine: specialArcScene("kizaru-final-report", "Le rapport que Kizaru ne dicte pas", "Kizaru te remet le rapport de l’opération entièrement vide. Il veut savoir si ton unité décrira honnêtement les erreurs, protégera sa réputation ou transformera l’exercice en doctrine utile pour les prochaines flottes.", "social", false, ["Consigner chaque erreur et chaque sauvetage", "Proposer un protocole de navigation sans lumière", "Défendre devant Kizaru les décisions contestées"], "Kizaru signe le protocole et transmet ton rapport aux unités appelées à traverser la zone.", "Le rapport est accepté, mais ses conclusions restent limitées à ta flotte.", "Les omissions sont découvertes et Kizaru classe l’exercice sans te confier la doctrine suivante."),
      "bounty-hunter": specialArcScene("hawkins-final-card", "La carte retournée de Hawkins", "Avant de quitter la nuit, Hawkins retourne une dernière carte et annonce que le contrat ne peut être payé que par l’un de vous. La cible, les preuves et le commanditaire se trouvent pourtant sur trois routes distinctes.", "social", false, ["Sécuriser les preuves avant le paiement", "Forcer le commanditaire à reconnaître les deux chasseurs", "Parier sur la route que la carte donne perdante"], "Tu réunis cible, preuves et garantie de paiement avant Hawkins, qui corrige enfin ses probabilités à ton sujet.", "Le contrat est reconnu, mais la prime doit être partagée avec Hawkins.", "Le commanditaire exploite votre rivalité et disparaît avec la prime pendant que Hawkins garde les preuves."),
      revolutionary: specialArcScene("karasu-last-message", "Le dernier message de Karasu", "Karasu doit faire franchir la limite de la zone à un message dont chaque corbeau ne porte qu’un fragment. Une patrouille a appris à reconnaître ses essaims et attend le premier regroupement.", "action", false, ["Protéger les essaims jusqu’au point de dispersion", "Porter toi-même le fragment qui attire la patrouille", "Créer un regroupement factice autour de ton navire"], "Tous les fragments quittent la zone séparément et Karasu confirme que le réseau possède désormais une route fiable.", "Le message passe, mais ton navire reste identifié par la patrouille.", "Le faux regroupement est percé et Karasu détruit plusieurs fragments pour protéger leurs destinataires."),
    }),
    "wandering-archipelago": Object.freeze({
      pirate: specialArcScene("law-last-exchange", "Le dernier échange de Law", "À la sortie de l’archipel, Law place dans sa ROOM ton cap, son archive et deux équipages menacés par la séparation des îles. Il propose un échange final où aucun capitaine ne recevra tout ce qu’il demande.", "social", false, ["Échanger ton cap contre l’évacuation des deux équipages", "Déduire la position de l’archive avant l’échange", "Imposer un accord où chacun garde son objectif"], "Les équipages et les objectifs traversent la dernière dérive ; Law reconnaît un accord entre capitaines, pas une dette.", "Tout le monde survit, mais Law repart avec l’information la plus précieuse.", "La méfiance brise l’accord et la séparation des îles emporte vos deux objectifs."),
      marine: specialArcScene("fujitora-last-weight", "Le poids du dernier ordre", "Fujitora stabilise la route vers le Nouveau Monde, mais un ordre gouvernemental réserve le passage aux navires officiels. Des familles de l’archipel attendent sur un fragment condamné à dériver.", "social", false, ["Ouvrir le passage aux familles sous ton autorité", "Réorganiser le convoi sans désobéir au texte de l’ordre", "Demander à Fujitora de soutenir publiquement ton interprétation"], "Les familles franchissent la route et Fujitora assume avec toi une justice qui ne confond pas ordre et abandon.", "Le convoi civil passe en dernier, au prix de matériel officiel perdu.", "La procédure consume le temps et Fujitora doit déplacer seul le fragment, révélant l’échec de ton commandement."),
      "bounty-hunter": specialArcScene("mihawk-final-passage", "Le passage accordé par Mihawk", "Mihawk attend sur l’unique île qui croisera la sortie. Il ne réclame aucun duel : il demande ce que ta chasse a prouvé lorsque chaque raccourci invitait à sacrifier une cible, un témoin ou un rival.", "social", false, ["Présenter la cible et les preuves intactes", "Reconnaître les combats que tu as choisi d’éviter", "Demander simplement le droit de franchir son île"], "Mihawk ouvre la route d’un geste précis et reconnaît que ton jugement a servi la chasse mieux que l’orgueil.", "Il te laisse passer sans reconnaissance, mais avec le contrat préservé.", "Tes preuves contredisent tes choix et Mihawk refuse le passage jusqu’à la prochaine dérive."),
      revolutionary: specialArcScene("morley-last-bridge", "Le dernier pont de Morley", "Morley soulève une bande de terre entre l’archipel et la route suivante. La cellule, les civils et les poursuivants atteindront le pont presque ensemble ; il faut décider quand le refermer.", "action", false, ["Tenir l’entrée jusqu’au passage du dernier civil", "Faire traverser les agents par groupes autonomes", "Refermer le terrain derrière la patrouille attirée sur un leurre"], "Morley referme le pont après le dernier passage et la cellule quitte l’archipel sans abandonner les civils.", "Le groupe s’échappe, mais plusieurs caches restent accessibles aux poursuivants.", "Le signal arrive trop tôt et Morley doit rouvrir le terrain sous le feu pour extraire les retardataires."),
    }),
    "tempest-isle": Object.freeze({
      pirate: specialArcScene("kid-last-thunder", "Le dernier tonnerre de Kid", "Kid plante son pavillon sur le dernier paratonnerre et annonce que le capitaine qui conduira la décharge ouvrira la route. L’épreuve décidera lequel quittera l’île sans devoir sa survie à l’autre.", "action", true, ["Conduire la foudre loin des deux navires", "Tenir le mécanisme pendant que Kid rassemble le métal", "Atteindre la sortie avant la décharge finale"], "La route s’ouvre sous ton commandement et Kid reconnaît que ton pavillon a quitté l’île sans plier devant le sien.", "Les deux navires franchissent ensemble la décharge et chacun revendique la victoire.", "Kid prend le contrôle du mécanisme et ton navire ne sort qu’après avoir abandonné une partie de son équipement."),
      marine: specialArcScene("smoker-final-debrief", "Le débriefing sous la dernière averse", "Smoker réunit les unités autour des trafiquants capturés et des civils sauvés. Les rapports se contredisent sur les priorités prises pendant l’orage, et il exige une version qui résiste aux faits.", "social", false, ["Assumer publiquement les décisions de ton unité", "Faire témoigner civils et soldats avant les officiers", "Proposer une procédure commune pour les prochaines tempêtes"], "Smoker valide le rapport et adopte ta procédure pour les opérations où arrestation et sauvetage entrent en conflit.", "Les faits sont établis, mais la hiérarchie partage les responsabilités entre les unités.", "Les témoignages révèlent des ordres incompatibles que personne n’assume ; Smoker clôt l’opération sans valider ton commandement."),
      "bounty-hunter": specialArcScene("killer-final-remittance", "La remise sous le regard de Killer", "Killer attend au port conducteur pendant la remise du fugitif. Le commanditaire peut encore trahir le contrat, et les hommes de Kid n’accepteront pas qu’un innocent soit livré avec la cible.", "social", true, ["Faire vérifier chaque clause par les témoins", "Séparer le paiement avant l’arrivée du commanditaire", "Garantir à Killer que seule la vraie cible sera remise"], "La cible légitime est remise, le paiement sécurisé et Killer quitte le port sans avoir à défendre un innocent.", "Le contrat aboutit, mais une part de la prime finance la protection du mécanicien menacé.", "Le commanditaire tente la double remise et Killer détruit le quai ; personne n’est livré, mais contrat et paiement disparaissent."),
      revolutionary: specialArcScene("sabo-final-signal", "Le signal de Sabo dans l’orage", "Sabo doit transmettre la réussite de l’opération aux cellules voisines, mais ses flammes et la foudre rendraient tout signal visible au Gouvernement. La dernière confrontation porte sur la méthode et le risque imposé aux habitants.", "social", false, ["Encoder le message dans les extinctions des paratonnerres", "Faire porter le signal par les ouvriers déjà évacués", "Demander à Sabo une flamme brève derrière le front orageux"], "Le message franchit l’orage sans révéler les quartiers et Sabo confie à ta cellule la coordination de la route libérée.", "Les cellules reçoivent le signal, mais le Gouvernement localise l’installation détruite.", "Le signal est intercepté et Sabo ordonne la dispersion avant que la victoire ne compromette les habitants."),
    }),
  });

  function createCanonicalSpecialEvent(zoneId, path, sceneData, sceneIndex) {
    const [canonicalName, shortName] = SPECIAL_CANONICAL_CAST[zoneId][path];
    const canonicalKey = canonicalName.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const id = `canonical-special-${zoneId}-${path}-${sceneData.slug}`;
    const phaseFlag = `specialArc_${zoneId}_${path}_${sceneIndex + 1}`.replace(/-/g, "_");
    const previousFlag = sceneIndex > 0
      ? `specialArc_${zoneId}_${path}_${sceneIndex}`.replace(/-/g, "_")
      : null;
    const action = sceneData.resolutionCategory === "action";
    const approachStats = action
      ? ["combat", "haki", "health"]
      : ["charisma", "intelligence", "bounty"];
    return createEvent({
      id,
      title: sceneData.title,
      description: sceneData.description,
      category: zoneId,
      // La zone est dÃ©jÃ  portÃ©e par `zones`. Ne pas la dupliquer dans les tags :
      // le moteur rÃ©serve cette ancienne signature aux introductions gÃ©nÃ©riques.
      tags: ["canonical-special-arc", path, canonicalKey, `arc-scene-${sceneIndex + 1}`],
      eventType: sceneData.risk ? EVENT_TYPES.RISK : EVENT_TYPES.ORDINARY,
      resolutionCategory: sceneData.resolutionCategory,
      paths: [path],
      zones: [zoneId],
      minMonth: 1,
      maxMonth: 24,
      rarity: sceneData.risk ? EVENT_RARITY.RARE : EVENT_RARITY.UNCOMMON,
      weight: sceneData.risk ? 2 : 3,
      unique: true,
      important: true,
      highStakes: sceneData.risk,
      loreCharacters: [canonicalName],
      introDialogue: getSpecialCanonicalDialogue(canonicalName, shortName, sceneIndex),
      condition: ({ zoneId: currentZoneId, specialZoneId }) =>
        currentZoneId === zoneId && specialZoneId === zoneId,
      choices: sceneData.choices.map((choiceText, choiceIndex) => {
        const stat = approachStats[choiceIndex];
        const weights = action
          ? choiceIndex === 0 ? { health: .15, combat: .6, haki: .25 }
            : choiceIndex === 1 ? { health: .15, combat: .2, haki: .65 }
              : { health: .6, combat: .15, haki: .25 }
          : choiceIndex === 0 ? { charisma: .6, intelligence: .2, renown: .2 }
            : choiceIndex === 1 ? { charisma: .15, intelligence: .65, renown: .2 }
              : { charisma: .25, intelligence: .2, renown: .55 };
        const highThreshold = stat === "bounty" ? 180000 : stat === "haki" ? 28 : 52;
        const positiveEffects = stat === "bounty" ? { bounty: 90000, popularity: 3 } : { [stat]: 3, popularity: 3 };
        const successEffects = stat === "bounty" ? { bounty: 55000, popularity: 2 } : { [stat]: 2, popularity: 2 };
        const mixedEffects = action ? { haki: 1, health: -2 } : { intelligence: 1, popularity: -1 };
        const failureEffects = action ? { health: sceneData.risk ? -9 : -6, fortune: -4000 } : { charisma: -2, popularity: -2 };
        return {
          id: `${id}-choice-${choiceIndex + 1}`,
          text: choiceText,
          choiceTag: choiceIndex === 0 ? "Initiative" : choiceIndex === 1 ? "Lecture" : "Maîtrise",
          resolutionWeights: weights,
          outcomes: [
            createDecisiveOutcome(`${id}-choice-${choiceIndex + 1}-exceptional`, `${sceneData.success} ${shortName} retient personnellement la manière dont tu as retourné l’épreuve.`, positiveEffects, { outcomeTier: "exceptional_success", minimumStats: { [stat]: highThreshold }, flags: { [phaseFlag]: true, [`specialRespect_${canonicalKey}`]: true }, weight: 1, chance: .45 }),
            ...(previousFlag ? [createDecisiveOutcome(`${id}-choice-${choiceIndex + 1}-recognized`, `${shortName} reconnaît les choix de votre précédente rencontre et adapte son épreuve ; cette continuité te permet d’atteindre l’objectif sans répéter le même face-à-face.`, successEffects, { outcomeTier: "success", requiredFlags: { [previousFlag]: true }, flags: { [phaseFlag]: true, [`specialRecognized_${canonicalKey}`]: true }, weight: 2 })] : []),
            createDecisiveOutcome(`${id}-choice-${choiceIndex + 1}-success`, sceneData.success, successEffects, { outcomeTier: "success", flags: { [phaseFlag]: true, [`specialMet_${canonicalKey}`]: true }, weight: 3 }),
            createDecisiveOutcome(`${id}-choice-${choiceIndex + 1}-mixed`, sceneData.mixed, mixedEffects, { outcomeTier: "mixed", flags: { [`specialTension_${canonicalKey}`]: true }, weight: 2 }),
            createDecisiveOutcome(`${id}-choice-${choiceIndex + 1}-failure`, sceneData.failure, failureEffects, { outcomeTier: sceneData.risk ? "severe_failure" : "failure", fallback: true, flags: { [`specialSetback_${canonicalKey}`]: true }, weight: 2 }),
          ],
        };
      }),
    });
  }

  const CANONICAL_SPECIAL_EVENT_PACK = Object.freeze(
    Object.entries(SPECIAL_CANONICAL_ARCS).flatMap(([zoneId, factionArcs]) =>
      Object.entries(factionArcs).flatMap(([path, scenes]) =>
        [...scenes, SPECIAL_CANONICAL_EPILOGUES[zoneId][path]]
          .map((sceneData, sceneIndex) => createCanonicalSpecialEvent(zoneId, path, sceneData, sceneIndex)))),
  );

  CANONICAL_SPECIAL_EVENT_PACK.forEach((event) => {
    const collection = event.paths.includes(PATHS.PIRATE) ? PIRATE_EVENTS
      : event.paths.includes(PATHS.MARINE) ? MARINE_EVENTS
        : event.paths.includes(PATHS.BOUNTY_HUNTER) ? BOUNTY_HUNTER_EVENTS
          : REVOLUTIONARY_EVENTS;
    collection.push(event);
  });

  function validateSpecialZoneEvents() {
    const warnings = [];
    const allFactionEvents = [
      ...PIRATE_EVENTS,
      ...MARINE_EVENTS,
      ...BOUNTY_HUNTER_EVENTS,
      ...REVOLUTIONARY_EVENTS,
    ];
    const specialEvents = allFactionEvents.filter((event) =>
      event.tags?.includes("canonical-special-arc"));
    const eventIds = new Set();
    const genericChoices = new Set(["agir", "attendre", "réfléchir", "analyser la situation"]);
    const retiredVisibleNames = /\b(?:Nox|Jasko|Cendre|Plico|Fulga)\b/i;

    if (specialEvents.length !== 48) {
      warnings.push(`48 événements spéciaux canoniques attendus, ${specialEvents.length} trouvés`);
    }

    SPECIAL_ZONE_IDS.forEach((zoneId) => {
      const count = specialEvents.filter((event) => event.zones?.includes(zoneId)).length;
      if (count !== 16) warnings.push(`${zoneId} : 16 événements attendus, ${count} trouvés`);
    });

    [PATHS.PIRATE, PATHS.MARINE, PATHS.BOUNTY_HUNTER, PATHS.REVOLUTIONARY]
      .forEach((path) => {
        const count = specialEvents.filter((event) => event.paths?.includes(path)).length;
        if (count !== 12) warnings.push(`${path} : 12 événements spéciaux attendus, ${count} trouvés`);
      });

    SPECIAL_ZONE_IDS.forEach((zoneId) => {
      Object.entries(SPECIAL_CANONICAL_CAST[zoneId]).forEach(([path, [canonicalName]]) => {
        const combination = specialEvents.filter((event) =>
          event.zones?.length === 1 && event.zones[0] === zoneId &&
          event.paths?.length === 1 && event.paths[0] === path);
        if (combination.length !== 4) warnings.push(`${zoneId}/${path} : ${combination.length} événement(s)`);
        if (!combination.every((event) => event.loreCharacters?.length === 1 && event.loreCharacters[0] === canonicalName)) {
          warnings.push(`${zoneId}/${path} : personnage canonique incorrect`);
        }
        if (!combination.some((event) => event.resolutionCategory === "action") ||
            !combination.some((event) => event.resolutionCategory === "social")) {
          warnings.push(`${zoneId}/${path} : diversité Action/Social insuffisante`);
        }
      });
    });

    specialEvents.forEach((event) => {
      if (eventIds.has(event.id)) warnings.push(`identifiant dupliqué : ${event.id}`);
      eventIds.add(event.id);
      if (!event.description || event.description.split(/[.!?](?:\s|$)/).filter(Boolean).length < 2) {
        warnings.push(`introduction insuffisante : ${event.id}`);
      }
      if (event.choices?.length !== 3) warnings.push(`trois choix attendus : ${event.id}`);
      if (event.paths?.length !== 1 || event.zones?.length !== 1) warnings.push(`portée ambiguë : ${event.id}`);
      if (!event.unique) warnings.push(`événement spécial répétable : ${event.id}`);
      if (event.tags?.some((tag) => SPECIAL_ZONE_IDS.includes(tag))) {
        warnings.push(`signature d’introduction générique encore active : ${event.id}`);
      }
      if (event.tags?.includes("callback") && !Object.keys(event.requiredFlags || {}).length) {
        warnings.push(`callback sans flag d’entrée : ${event.id}`);
      }

      const visibleText = [event.title, event.description];
      (event.choices || []).forEach((choice) => {
        visibleText.push(choice.text);
        if (genericChoices.has(String(choice.text || "").trim().toLowerCase())) {
          warnings.push(`choix trop générique : ${event.id}/${choice.id}`);
        }
        if (!choice.outcomes?.length) warnings.push(`choix sans issue : ${event.id}/${choice.id}`);
        (choice.outcomes || []).forEach((outcome) => {
          visibleText.push(outcome.result);
          if (!outcome.result) warnings.push(`issue sans texte : ${event.id}/${outcome.id}`);
        });
      });
      if (retiredVisibleNames.test(visibleText.filter(Boolean).join(" "))) {
        warnings.push(`ancien nom inventé encore visible : ${event.id}`);
      }
    });

    if (warnings.length) {
      console.warn("[Blue Legacy] Validation des événements de zones spéciales :", warnings);
    }
    const combinations = Object.fromEntries(SPECIAL_ZONE_IDS.flatMap((zoneId) =>
      Object.keys(SPECIAL_CANONICAL_CAST[zoneId]).map((path) => {
        const rows = specialEvents.filter((event) => event.zones[0] === zoneId && event.paths[0] === path);
        let seed = [...`${zoneId}/${path}`].reduce((sum, character) => sum + character.charCodeAt(0), 0) >>> 0;
        const drawCounts = Object.fromEntries(rows.map((event) => [event.id, 0]));
        let repeatedInRun = 0;
        let missingDraw = 0;
        for (let run = 0; run < 60; run += 1) {
          const seen = new Set();
          for (let month = 0; month < 4; month += 1) {
            const eligible = rows.filter((event) => !seen.has(event.id));
            if (!eligible.length) { missingDraw += 1; continue; }
            seed = (seed * 1664525 + 1013904223) >>> 0;
            const selected = eligible[seed % eligible.length];
            if (seen.has(selected.id)) repeatedInRun += 1;
            seen.add(selected.id);
            drawCounts[selected.id] += 1;
          }
        }
        return [`${zoneId}/${path}`, {
          count: rows.length,
          ids: rows.map((event) => event.id),
          titles: rows.map((event) => event.title),
          character: rows[0]?.loreCharacters?.[0] || null,
          action: rows.filter((event) => event.resolutionCategory === "action").length,
          social: rows.filter((event) => event.resolutionCategory === "social").length,
          risk: rows.filter((event) => event.eventType === EVENT_TYPES.RISK).length,
          ordinary: rows.filter((event) => event.eventType === EVENT_TYPES.ORDINARY).length,
          drawCounts,
          repeatedInRun,
          missingDraw,
        }];
      })));
    return {
      total: specialEvents.length,
      risk: specialEvents.filter((event) => event.eventType === EVENT_TYPES.RISK).length,
      ordinary: specialEvents.filter((event) => event.eventType === EVENT_TYPES.ORDINARY).length,
      action: specialEvents.filter((event) => event.resolutionCategory === "action").length,
      social: specialEvents.filter((event) => event.resolutionCategory === "social").length,
      choices: specialEvents.reduce((sum, event) => sum + event.choices.length, 0),
      combinations,
      warnings,
    };
  }

  const SPECIAL_ZONE_EVENT_AUDIT = validateSpecialZoneEvents();

  /* ========================================================
     ÉTAPE 3 — ÉVÉNEMENTS EXCEPTIONNELS DU MONDE

     Douze événements par faction. Les deux premiers choix conservent des
     formulations opaques ; toutes les conditions et récompenses restent
     exclusivement dans les issues.
  ======================================================== */

  const EXCEPTIONAL_ZONE_PLAN = Object.freeze([
    STARTING_BLUES,
    ["reverse-mountain"],
    ["grand-line"],
    ["grand-line"],
    ["grand-line"],
    ["red-line"],
    ["red-line"],
    ["starless-sea", "wandering-archipelago", "tempest-isle"],
    ["starless-sea", "wandering-archipelago", "tempest-isle"],
    ["shinsekai"],
    ["shinsekai"],
    ["shinsekai"],
  ]);

  const EXCEPTIONAL_DREAMS = Object.freeze({
    pirate: {
      "one-piece": 4,
      "sea-emperor": 4,
      "worlds-greatest-fortune": 4,
      "forgotten-history": 4,
    },
    marine: {
      admiral: 4,
      "fleet-admiral": 4,
      "reform-the-marines": 4,
      "greatest-marine-hero": 4,
    },
    "bounty-hunter": {
      "greatest-bounty-hunter": 4,
      "most-dangerous-criminals": 4,
      "hunt-an-emperor": 4,
      "contract-fortune": 4,
    },
    revolutionary: {
      "break-the-chains": 4,
      "reveal-void-century": 4,
      "build-underground-network": 4,
      "found-free-nation": 4,
    },
  });

  function getExceptionalFruit(fruitId) {
    const fruit = window.GAME_DATA?.devilFruits?.find(
      (candidate) => candidate.id === fruitId,
    );
    return fruit ? { ...fruit, permanentEffects: { ...fruit.permanentEffects } } : null;
  }

  function createExceptionalEvent(path, index, entry) {
    const prefix = path === PATHS.BOUNTY_HUNTER ? "bounty-hunter" : path;
    const id = `${prefix}-${entry.kind || "rare"}-${entry.slug}`;
    const rarity = index < 6 ? EVENT_RARITY.RARE : EVENT_RARITY.VERY_RARE;
    const zones = entry.zones || EXCEPTIONAL_ZONE_PLAN[index];
    const fruit = entry.obtainFruit ? getExceptionalFruit(entry.fruitId) : null;
    const worldFlag = entry.worldFlag || `${prefix}${entry.slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")}Resolved`;
    const dreamProgressByDream = entry.dream
      ? EXCEPTIONAL_DREAMS[path] || {}
      : {};
    const masteryEffects = entry.masteryEffects || { combat: 4, morale: 3 };
    const insightEffects = entry.insightEffects || { haki: 2, morale: 2 };
    const costEffects = entry.costEffects || {
      health: rarity === EVENT_RARITY.VERY_RARE ? -11 : -7,
      morale: rarity === EVENT_RARITY.VERY_RARE ? -5 : -3,
    };
    const redirectEffects = entry.redirectEffects || { ship: 2, popularity: 2 };
    const redirectFallbackEffects = { morale: -2 };

    return createEvent({
      id,
      title: entry.title,
      description: entry.description,
      category: `exceptional-${entry.kind || "rare"}`,
      tags: [
        "exceptional",
        path,
        entry.kind || "rare",
        ...(entry.tags || []),
      ],
      eventType: entry.dangerTheme ? EVENT_TYPES.RISK : EVENT_TYPES.ORDINARY,
      resolutionCategory: inferResolutionCategory(entry),
      paths: [path],
      zones,
      rarity,
      weight: rarity === EVENT_RARITY.RARE ? 2 : 0.55,
      minMonth: entry.minMonth ?? (index === 0 ? 1 : index === 1 ? 5 : 9),
      maxMonth: 24,
      unique: true,
      important: Boolean(entry.important),
      loreCharacters: entry.loreCharacters || [],
      requiredFlags: entry.requiredFlags || {},
      forbiddenFlags: [worldFlag, ...(entry.forbiddenFlags || [])],
      requiresFruit: entry.eventRequiresFruit ?? null,
      condition: entry.condition || null,
      choices: [
        {
          id: `${id}-commit`,
          text: entry.commit,
          choiceTag: entry.commitTag || "",
          resolutionWeights: inferResolutionCategory(entry) === "action"
            ? { health: 0.2, combat: 0.55, haki: 0.25 }
            : { charisma: 0.3, intelligence: 0.25, renown: 0.45 },
          outcomes: [
            {
              id: `${id}-mastery`,
              result: `${entry.mastery} ${describeNarrativeEffects(masteryEffects)}`.trim(),
              effects: masteryEffects,
              minimumStats: entry.minimumStats || {
                combat: rarity === EVENT_RARITY.VERY_RARE ? 27 : 20,
              },
              requiredTraits: entry.requiredTraits || [],
              requiredCombatStyles: entry.requiredCombatStyles || [],
              requiredFlags: entry.callbackFlags || {},
              requiresD: entry.kings ? true : null,
              requiresFruit: fruit ? false : null,
              chance: fruit ? 0.12 : 1,
              devilFruit: fruit,
              dreamProgressByDream,
              flags: {
                [worldFlag]: true,
                ...(entry.masteryFlags || {}),
                ...(fruit ? { exceptionalFruitObtained: true } : {}),
              },
              important: Boolean(entry.important || fruit),
              weight: fruit ? 1 : 3,
            },
            {
              id: `${id}-insight`,
              result: entry.insight
                ? `${entry.insight} ${describeNarrativeEffects(insightEffects)}`.trim()
                : contextualResult(
                  entry.title,
                  entry.commit,
                  "La première tentative échoue, mais ton sang-froid révèle une issue qui préserve l'objectif essentiel.",
                  insightEffects,
                ),
              effects: insightEffects,
              minimumStats: { haki: rarity === EVENT_RARITY.VERY_RARE ? 5 : 3 },
              requiredTraits: [entry.insightTrait || "calme"],
              flags: {
                [worldFlag]: true,
                [`${worldFlag}Insight`]: true,
                ...(entry.insightFlags || {}),
              },
              dreamProgressByDream,
              important: Boolean(entry.important),
              weight: 2,
            },
            {
              id: `${id}-cost`,
              result: `${entry.cost} ${describeNarrativeEffects(costEffects)}`.trim(),
              effects: costEffects,
              flags: { [worldFlag]: true, [`${worldFlag}CostPaid`]: true },
              important: Boolean(entry.important),
              fallback: true,
              weight: 3,
            },
          ],
        },
        {
          id: `${id}-redirect`,
          text: entry.redirect,
          choiceTag: entry.redirectTag || "",
          resolutionWeights: inferResolutionCategory(entry) === "action"
            ? { health: 0.15, combat: 0.2, haki: 0.65 }
            : { charisma: 0.2, intelligence: 0.65, renown: 0.15 },
          outcomes: [
            {
              id: `${id}-redirected`,
              result: `${entry.redirected} ${describeNarrativeEffects(redirectEffects)}`.trim(),
              effects: redirectEffects,
              requiredTraits: [entry.redirectTrait || "prudent"],
              flags: {
                [worldFlag]: true,
                [`${worldFlag}Redirected`]: true,
              },
              dreamProgressByDream,
              weight: 3,
            },
            {
              id: `${id}-redirect-fallback`,
              result: entry.redirectFallback
                ? `${entry.redirectFallback} ${describeNarrativeEffects(redirectFallbackEffects)}`.trim()
                : contextualResult(
                  entry.title,
                  entry.redirect,
                  `Cette autre voie protège l’essentiel dans « ${entry.title} », mais elle laisse échapper l’objectif principal. Le groupe comprend pourquoi tu as choisi la prudence, sans pouvoir cacher sa déception.`,
                  redirectFallbackEffects,
                ),
              effects: redirectFallbackEffects,
              flags: { [worldFlag]: true },
              fallback: true,
              weight: 2,
            },
          ],
        },
      ],
    });
  }

  const EXCEPTIONAL_SCENES = Object.freeze({
    pirate: [
      { slug: "red-haired-rumor", title: "Le verre que Shanks laissa derrière lui", description: "Dans une taverne d’une mer cardinale, personne n’ose reprendre un verre que Shanks aurait laissé des années plus tôt. Une carte humide glissée dessous mentionne un équipage disparu.", commit: "Suivre la carte avant la marée", redirect: "Retrouver les familles des disparus", mastery: "La carte mène aux survivants, qui racontent qu’un simple avertissement de Shanks leur a sauvé la vie.", redirected: "Les familles arment une expédition et promettent de transmettre ton pavillon.", cost: "La carte était suivie par des pillards ; tu échappes à leur embuscade avec un mât fendu.", tags: ["shanks", "indirect"], insightTrait: "curieux" },
      { slug: "reverse-impossible-pursuit", title: "La silhouette au sommet du courant", description: "Un éclaireur arborant le pavillon de Barbe Noire traverse le sommet de Reverse Mountain sans ralentir. Il ne te poursuit pas encore, mais ses vigies ont remarqué ton pavillon.", commit: "Tenir le courant sans céder la route", redirect: "Disparaître derrière les navires en dérive", mastery: "Tu franchis le sommet sans provoquer une bataille impossible et gagnes le respect silencieux de tes hommes.", redirected: "Les courants avalent ton sillage avant que les vigies puissent confirmer ton identité.", cost: "Un tir perdu pulvérise la roche près de la coque ; la fuite devient la seule victoire raisonnable.", tags: ["blackbeard", "emperor"], dangerTheme: true, important: true, minimumStats: { ship: 4, morale: 58 }, masteryFlags: { emperorCrewNoticedPlayer: true } },
      { slug: "world-bounty-edition", title: "L’édition que Morgans refuse de corriger", description: "Le journal de Big News Morgans attribue à ton équipage une victoire publique contre trois capitaines. Le vrai vainqueur exige un démenti avant que la nouvelle prime ne circule.", commit: "Assumer la version imprimée", redirect: "Publier la vérité avec ton propre récit", mastery: "L’édition spéciale traverse Grand Line et ta prime entre brutalement dans une nouvelle catégorie.", masteryEffects: { bounty: 1800000, popularity: 7 }, redirected: "Le démenti devient plus populaire encore que le mensonge et protège l’équipage lésé.", cost: "Les preuves arrivent après les affiches ; ta prime monte, mais ta parole perd du poids.", costEffects: { bounty: 700000, popularity: -5 }, tags: ["newspaper", "bounty"], important: true },
      { slug: "fruit-black-market", kind: "devil-fruit", title: "La caisse aux enchères", description: "Dans Paradise, un marché noir prétend vendre un Fruit du Démon authentique tandis que plusieurs agents infiltrés se disputent la caisse.", commit: "Atteindre la caisse pendant la panique", redirect: "Démasquer les trafiquants avant la vente", mastery: "La caisse est sécurisée et confiée à un dépôt neutre avant que le marché puisse reprendre.", redirected: "Les registres désignent les chefs du marché et les acheteurs fuient sans leur marchandise.", cost: "La caisse disparaît par un passage dérobé pendant que les trafiquants ferment toutes les sorties.", tags: ["devil-fruit", "black-market"], important: true, commitTag: "Quitte ou double", masteryEffects: { morale: 3 }, minimumStats: { combat: 25, haki: 4 } },
      { slug: "marineford-side-channel", kind: "lore", title: "Le couloir oublié de Marineford", description: "Des années après la guerre, un ancien canal de service de Marineford s’effondre sur des blessés, des contrebandiers et des détenus oubliés dans les registres.", commit: "Ouvrir une voie d’évacuation", redirect: "Libérer les détenus du pont inférieur", mastery: "Ta manœuvre sauve les occupants du canal sans altérer les vestiges du champ de bataille.", redirected: "Les cellules s’ouvrent et les évadés disparaissent parmi les navires-hôpitaux.", cost: "L’effondrement ferme le canal ; tu arraches ton équipage aux ruines au prix de lourds dégâts.", tags: ["marineford", "war"], dangerTheme: true, important: true, commitTag: "Sacrifice", worldFlag: "pirateMarinefordEventResolved" },
      { slug: "warlord-bargain", title: "Le contrat du sable", description: "Crocodile, ancien Grand Corsaire, fait transmettre une offre par un homme au cigare éteint : détourner un convoi contre une information sur une ruine ensevelie.", commit: "Accepter sans servir ses ambitions", redirect: "Vendre une fausse route au messager", mastery: "Le convoi change de cap et l’information reçue s’avère exacte, sans que Crocodile te considère comme un allié.", redirected: "Le messager repart satisfait avec une carte qui mène à un entrepôt déjà vide.", cost: "Le marché comportait une clause invisible ; plusieurs chasseurs réclament désormais ta part.", tags: ["crocodile", "warlord"], important: false },
      { slug: "protected-island", title: "Le pavillon au-dessus des maisons", description: "Une île de Red Line demande la protection de ton pavillon contre un seigneur local. La défendre attire la Marine ; l’abandonner condamne le village au tribut.", commit: "Placer ton pavillon sans prendre le pouvoir", redirect: "Former les habitants à défendre le port", mastery: "Le seigneur recule devant une population organisée et ton pavillon devient une promesse plutôt qu’une occupation.", redirected: "Les habitants établissent leurs propres tours de garde et refusent de remplacer un maître par un autre.", cost: "La première attaque est repoussée, mais le port brûle avant l’arrivée des renforts.", tags: ["territory", "island"], dream: true, masteryFlags: { protectedIndependentIsland: true } },
      { slug: "hollow-rival", kind: "devil-fruit", title: "Les Hollows dans la nuit", description: "Dans la Mer sans étoiles, les Hollows de Perona traversent un convoi abandonné et brisent la volonté de ceux qu’ils touchent. Son objectif reste invisible dans l'obscurité.", commit: "Repérer leur trajectoire au Fluide", redirect: "Éloigner les Hollows de l’équipage", mastery: "Ton Fluide suit leur trajectoire jusqu'à leur point d'origine et force Perona à rappeler ses fantômes.", redirected: "Des leurres attirent les Hollows loin du pont et dégagent une route de fuite.", cost: "Le découragement disperse les postes de défense ; une partie des vivres disparaît pendant le repli.", tags: ["devil-fruit", "perona"], dangerTheme: true, minimumStats: { haki: 5 }, loreCharacters: ["Perona"], masteryFlags: { survivedPeronaHollows: true } },
      { slug: "road-fragment", title: "Le rouge derrière le cuivre", description: "Un fragment de relevé lié à un Road Ponéglyphe apparaît dans les archives de Red Line. Trois traductions incompatibles circulent déjà.", commit: "Comparer le fragment aux anciennes routes", redirect: "Confier une copie à des archéologues indépendants", mastery: "Les routes concordent sur un point encore inconnu du Nouveau Monde.", redirected: "Trois copies quittent Red Line par des chemins différents, rendant leur effacement impossible.", cost: "Cipher Pol saisit l’original ; une seule ligne reste mémorisée.", tags: ["road-poneglyph", "history"], dream: true, masteryFlags: { exceptionalRoadFragmentRecovered: true } },
      { slug: "law-short-alliance", title: "Le plan de Law en trois silences", description: "Dans le Nouveau Monde, Trafalgar Law propose une alliance limitée à une seule nuit. Il ne promet ni explication ni secours après l’aube.", commit: "Suivre le plan sans lui céder le commandement", redirect: "Négocier une sortie pour les deux équipages", mastery: "L’opération réussit parce que chacun respecte exactement la limite annoncée.", redirected: "La route de retraite sauve les blessés des deux camps avant la rupture de l’accord.", cost: "La cible avait prévu l’alliance ; Law disparaît avec ses hommes tandis que tu couvres seul la retraite.", tags: ["law", "short-appearance"], important: false },
      { slug: "emperor-clash", kind: "lore", title: "Le ciel fendu au-dessus de la flotte", description: "Deux puissances d’Empereur se rencontrent au-delà de l’horizon. Leur choc fend les nuages et transforme les flottes voisines en débris potentiels.", commit: "Maintenir l’équipage debout sous la pression", redirect: "Sauver les navires pris entre les volontés", mastery: "Ta volonté protège les tiens sans prétendre rivaliser avec les monstres qui se font face.", insight: "Un instant, ta présence répond à la pression avant de disparaître ; personne ne sait encore ce qu’elle signifie.", redirected: "Plusieurs petits équipages survivent grâce au corridor que tu ouvres.", cost: "La mer elle-même rejette ton navire hors de la zone, coque brisée mais équipage vivant.", tags: ["emperor", "kings-haki"], dangerTheme: true, important: true, kings: true, minimumStats: { haki: 7, popularity: 82, morale: 70 }, requiredTraits: ["courageux"], insightFlags: { kingsHakiMayAwaken: true }, worldFlag: "pirateEmperorClashResolved" },
      { slug: "emperor-candidate", title: "Les pavillons qui demandent un nom", description: "Après la chute d’un tyran pirate, plusieurs capitaines libres proposent de placer leurs navires sous ton pavillon. Les habitants veulent savoir quel monde tu bâtirais.", commit: "Former une flotte sans soumission", redirect: "Protéger le territoire sans revendiquer de couronne", mastery: "Les capitaines jurent une alliance révocable et ton nom entre parmi ceux que le Nouveau Monde surveille.", redirected: "Le territoire reste libre et reconnaît ton équipage comme garant, non comme propriétaire.", cost: "Les ambitions incompatibles brisent la réunion avant que l’alliance ne soit scellée.", tags: ["emperor", "fleet", "dream"], important: true, dream: true, masteryFlags: { exceptionalEmperorCandidacy: true }, commitTag: "Sans retour" },
    ],
    marine: [
      { slug: "garp-training-rumor", title: "Le cratère signé Garp", description: "Dans une base d’une mer cardinale, un mur porte l’empreinte du poing de Garp et vingt cadets jurent des versions différentes de son passage.", commit: "Reconstituer son exercice", redirect: "Interroger le seul cadet silencieux", mastery: "L’exercice enseigne que protéger derrière soi compte davantage que frapper devant.", redirected: "Le cadet révèle que Garp était venu saluer un vieux cuisinier, pas inspecter la base.", cost: "La reproduction de l’exercice détruit le second mur et transforme l’entraînement en corvée générale.", tags: ["garp", "indirect"], important: false },
      { slug: "reverse-admiral-order", title: "L’ordre dans le courant montant", description: "Un Amiral ordonne par Escargophone de garder Reverse Mountain ouverte malgré une flotte pirate en approche et des civils bloqués dans l’ascension.", commit: "Tenir le passage et évacuer les civils", redirect: "Créer un faux chenal militaire", mastery: "Le passage reste ouvert et les civils franchissent la montagne derrière ta ligne.", redirected: "La flotte pirate suit le faux signal pendant que les navires civils atteignent le sommet.", cost: "Le courant disperse les unités et la défense ne tient qu’au prix de plusieurs navires.", tags: ["admiral", "order"], important: true, commitTag: "Devoir" },
      { slug: "sengoku-sealed-report", title: "Le rapport annoté par Sengoku", description: "Un ancien rapport de Sengoku contredit l’ordre actuel concernant un prisonnier lié à un grand équipage.", commit: "Suspendre le transfert", redirect: "Faire authentifier chaque annotation", mastery: "Le prisonnier reste vivant et le rapport ouvre une enquête que la hiérarchie ne peut refermer.", redirected: "Les sceaux sont authentiques ; le transfert change officiellement de destination.", cost: "Cipher Pol récupère le dossier avant l’audience et nie jusqu’à son existence.", tags: ["sengoku", "prisoner"] },
      { slug: "magma-fugitive", kind: "lore", title: "Les quais vitrifiés", description: "Une ancienne zone frappée par le magma de Sakazuki se fissure sous un convoi de prisonniers. La chaleur remonte tandis que les geôliers abandonnent les cellules.", commit: "Traverser la chaleur au Fluide", redirect: "Évacuer les cellules par la mer", mastery: "Le Fluide de l’Armement résiste assez longtemps pour libérer les captifs avant l'effondrement.", redirected: "Les canots ouvrent une route hors des quais vitrifiés.", cost: "La pierre cède avant l'ouverture de toutes les cellules ; les survivants sont évacués au prix de lourdes brûlures.", tags: ["sakazuki", "aftermath"], dangerTheme: true, minimumStats: { haki: 5, health: 62 }, loreCharacters: ["Sakazuki"] },
      { slug: "marineford-infirmary", kind: "lore", title: "L’infirmerie derrière Marineford", description: "Une ancienne infirmerie de campagne, restée condamnée depuis la guerre, abrite aujourd’hui soldats blessés, pirates inconscients et civils après un nouvel incident naval.", commit: "Défendre l’infirmerie contre les deux camps", redirect: "Organiser son évacuation avant l’effondrement", mastery: "Les blessés restent hors du conflit et aucun pavillon n’entre avec une arme.", redirected: "Les lits quittent la place par un tunnel de service avant le prochain effondrement.", cost: "Une paroi fragilisée détruit l’aile principale ; tu sauves les patients, pas le bâtiment.", tags: ["marineford", "war"], dangerTheme: true, important: true, worldFlag: "marineMarinefordEventResolved", commitTag: "Sacrifice" },
      { slug: "five-elders-report", title: "Le rapport destiné aux Cinq Doyens", description: "Un rapport sur une île entière doit être transmis au Conseil des Cinq Doyens. Une phrase ajoutée par Cipher Pol suffirait à justifier sa disparition.", commit: "Retirer l’accusation fabriquée", redirect: "Joindre les témoignages civils", mastery: "Le rapport officiel ne peut plus servir de prétexte à une opération d’effacement.", redirected: "Les témoignages circulent avant le rapport et rendent toute falsification visible.", cost: "Le dossier part sous une autre couverture ; tu conserves seulement une copie incomplète.", tags: ["five-elders", "cipher-pol"] },
      { slug: "admiral-candidate-review", title: "Les trois fauteuils du conseil", description: "Trois vice-amiraux évaluent ton aptitude à un haut commandement pendant qu’une base voisine appelle à l’aide.", commit: "Répondre à l’appel avant l’entretien", redirect: "Transformer l’évaluation en opération réelle", mastery: "Le sauvetage devient la seule réponse nécessaire au conseil, sans garantir le grade.", redirected: "Les évaluateurs prennent eux-mêmes place dans l’opération et observent ton commandement.", cost: "La base tient, mais ton absence est utilisée pour retarder toute promotion.", tags: ["promotion", "admiral"], important: true, dream: true, masteryFlags: { exceptionalAdmiralPathOpened: true } },
      { slug: "barrier-cipher-mission", kind: "devil-fruit", title: "Les cellules derrière la barrière", description: "Un agent du Cipher Pol utilisant le Bari Bari no Mi cloisonne prisonniers et documents derrière des barrières transparentes.", commit: "Marquer chaque barrière avant l’assaut", redirect: "Forcer l’agent à déplacer sa protection", mastery: "Tes marques révèlent l’ordre des cellules et permettent d’extraire les prisonniers.", redirected: "Une diversion oblige l’agent à déplacer sa barrière et libère le passage.", cost: "La barrière coupe l’unité en deux ; l’évacuation réussit, mais le dossier disparaît.", tags: ["devil-fruit", "cipher-pol"], requiredCombatStyles: ["inventeur"] },
      { slug: "buster-call-refusal", title: "La dernière sonnerie du Buster Call", description: "Les neuf premières sonneries ont retenti. La dixième déclenchera le feu sur une île où le document recherché a déjà disparu.", commit: "Bloquer la transmission finale", redirect: "Évacuer sans révéler la fuite", mastery: "Le signal est suspendu assez longtemps pour qu’une commission découvre l’absence de cible.", redirected: "Les habitants quittent l’île sous couvert d’un exercice naval.", cost: "Les premiers tirs frappent le port ; ton unité sauve la population sous le feu.", tags: ["buster-call", "government"], dangerTheme: true, important: true, worldFlag: "exceptionalBusterCallResolved", commitTag: "Sans retour" },
      { slug: "smoker-crossroads", title: "La justice de Smoker", description: "Smoker bloque une poursuite parce que les ordres reçus sacrifieraient un quartier entier. Il te demande seulement si ton unité protégera la rue opposée.", commit: "Prendre position auprès des habitants", redirect: "Poursuivre la cible sans exposer le quartier", mastery: "Les deux rues tiennent et Smoker repart sans discours, visiblement satisfait.", redirected: "La cible est arrêtée loin des maisons grâce à une manœuvre conjointe.", cost: "La cible s’échappe, mais aucun civil ne paie le prix de la poursuite.", tags: ["smoker", "short-appearance"], important: false },
      { slug: "emperor-fleet-battle", kind: "lore", title: "La ligne face à l’Empereur", description: "Une flotte d’Empereur apparaît dans le Nouveau Monde. L’ordre officiel impose de tenir, pas de prétendre vaincre la puissance qui arrive.", commit: "Maintenir le corridor d’évacuation", redirect: "Retarder l’avant-garde sans duel frontal", mastery: "La ligne plie sans rompre jusqu’au départ du dernier civil.", redirected: "Les balises et les mines factices ralentissent l’avant-garde assez longtemps.", cost: "La pression du Fluide couche les soldats ; la retraite ordonnée évite l’anéantissement.", tags: ["emperor", "fleet"], dangerTheme: true, important: true, worldFlag: "marineEmperorFleetIncidentResolved" },
      { slug: "justice-dream-verdict", title: "Le procès de ta justice", description: "Une crise oppose directement la hiérarchie, le Gouvernement mondial et les populations que la Marine prétend défendre.", commit: "Rendre une décision conforme à ta justice", redirect: "Faire voter les unités et les civils", mastery: "Ta décision ouvre une voie réelle vers le rêve poursuivi, sans effacer les résistances à venir.", redirected: "Le verdict partagé devient un précédent que plusieurs bases reprennent.", cost: "La hiérarchie enterre la décision, mais les témoins en conservent chaque mot.", tags: ["dream", "justice"], important: true, dream: true, commitTag: "Sans retour" },
    ],
    "bounty-hunter": [
      { slug: "buggy-crew-target", title: "La prime au nez rouge barré", description: "Dans une mer cardinale, une affiche vise un comptable de la Cross Guild. Quelqu’un a barré le nez de Buggy sur chaque exemplaire, détail apparemment plus dangereux que la prime.", commit: "Capturer le comptable vivant", redirect: "Suivre celui qui corrige les affiches", mastery: "Le comptable se rend pour échapper à ses propres collègues et livre un registre de contrats.", redirected: "Le correcteur mène à un relais secondaire de la Cross Guild.", cost: "Une troupe de sosies de Buggy transforme la chasse en parade explosive.", tags: ["buggy", "indirect"], important: false },
      { slug: "reverse-secret-bounty", title: "La cible dans le courant contraire", description: "Une prime secrète vise un ancien pilote de Reverse Mountain qui transporte des réfugiés vers Grand Line.", commit: "Atteindre son navire avant les concurrents", redirect: "Vérifier l’origine du contrat", mastery: "Tu prends le contrôle de la situation sans livrer les réfugiés aux commanditaires.", redirected: "Le contrat remonte à un trafiquant qui voulait récupérer ses victimes.", cost: "Les concurrents ouvrent le feu dans le courant et la cible disparaît au sommet.", tags: ["secret-contract", "refugees"] },
      { slug: "legendary-competitor", title: "Une chasseuse vétérane et les cent menottes", description: "Une chasseuse vétérane dont aucune menotte ne porte la même clé, revendique une cible avant même la publication de l’affiche.", commit: "Accepter sa chasse parallèle", redirect: "Proposer un partage des preuves", mastery: "La cible tombe dans un piège construit à partir de vos méthodes opposées.", redirected: "Les preuves révèlent deux commanditaires et imposent un partage équitable.", cost: "Une chasseuse vétérane capture le leurre ; toi, tu perds la vraie piste.", tags: ["competitor", "hunt"], callbackFlags: { sharedContractWithJasko: true } },
      { slug: "blade-target", kind: "devil-fruit", title: "La piste de Daz Bonez", description: "Daz Bonez taille des prises dans les falaises avec le Supa Supa no Mi et coupe les cordages de ceux qui le suivent. Le contrat ne précise pas pourquoi il protège cette route.", commit: "Fermer la piste au Fluide", redirect: "L’attirer loin des falaises", mastery: "Ton Fluide anticipe sa dernière lame et permet de l'arrêter sans chute mortelle.", redirected: "Une fausse piste conduit Daz Bonez sur une plage ouverte où la raison de sa présence peut être vérifiée.", cost: "Il traverse les récifs de nuit et laisse derrière lui plusieurs pièges tranchants.", tags: ["devil-fruit", "daz-bonez"], dangerTheme: true, minimumStats: { haki: 4, combat: 22 }, loreCharacters: ["Daz Bonez"] },
      { slug: "marineford-contract", kind: "lore", title: "La liste resurgie de Marineford", description: "Une liste de blessés disparue pendant la guerre de Marineford refait surface. Un commanditaire offre une fortune pour capturer son messager avant qu’elle n’atteigne les navires-hôpitaux.", commit: "Sauver le messager et sa liste", redirect: "Identifier le véritable commanditaire", mastery: "La liste atteint les navires-hôpitaux et ta décision devient connue des chasseurs présents.", redirected: "Le paiement mène à un courtier qui exploitait les blessés des deux camps depuis la fin de la guerre.", cost: "Les agents du courtier engloutissent la piste ; tu quittes les ruines avant qu’ils ne ferment toute retraite.", tags: ["marineford", "war"], dangerTheme: true, important: true, worldFlag: "hunterMarinefordEventResolved" },
      { slug: "warlord-contract", title: "Le marché des Grands Corsaires déchus", description: "L’abolition du système des Grands Corsaires laisse derrière elle des contrats sans maître et des chasseurs prêts à s’entretuer pour les reprendre.", commit: "Sécuriser les contrats originaux", redirect: "Rendre publics les commanditaires", mastery: "Les sceaux authentiques placent plusieurs cibles hors de portée des faux chasseurs.", redirected: "Les noms publiés détruisent le marché avant sa reprise.", cost: "Les contrats brûlent, mais chaque concurrent pense que tu en as gardé une copie.", tags: ["warlord", "world-event"] },
      { slug: "celestial-contract", title: "Le paiement du Noble Mondial", description: "Un Noble Mondial propose une prime clandestine sur un témoin de ses ventes d’esclaves. La Marine protège officiellement le commanditaire.", commit: "Retourner la chasse contre ses agents", redirect: "Faire disparaître le témoin", mastery: "Les agents tombent avec leurs propres ordres signés et le témoin conserve sa liberté.", redirected: "La pisteuse efface la piste du témoin dans trois ports successifs.", cost: "Le contrat est annulé, puis remplacé par une prime sur ton propre nom.", tags: ["celestial-dragons", "politics"], important: true, callbackFlags: { recruitedOraPaleyeTracker: true } },
      { slug: "fruit-as-payment", kind: "devil-fruit", title: "La caisse promise en paiement", description: "Dans une zone spéciale, un client propose un Fruit du Démon non identifié comme paiement. La caisse porte pourtant les marques d’au moins quatre propriétaires récents.", commit: "Saisir la caisse avant les anciens propriétaires", redirect: "Remplacer le paiement par leurs registres", mastery: "La caisse est authentique, mais tu la confies à un dépôt neutre avant qu’elle ne divise les chasseurs.", redirected: "Les registres valent davantage que le Fruit et révèlent un trafic gouvernemental.", cost: "Le Fruit était déjà parti ; la caisse contient un Escargophone qui récite tes dettes.", tags: ["devil-fruit", "payment"], important: false },
      { slug: "poneglyph-scholar", title: "La prime sur la lectrice de pierre", description: "Une archéologue capable d’identifier un fragment de Ponéglyphe est recherchée par trois royaumes sous trois accusations différentes.", commit: "La capturer pour la soustraire aux armées", redirect: "Démonter les trois dossiers", mastery: "La fausse capture permet à l’archéologue de quitter Red Line avec ses relevés.", redirected: "Les signatures identiques prouvent que les trois contrats viennent du même bureau.", cost: "Cipher Pol récupère une partie des notes tandis que l’archéologue s’échappe seule.", tags: ["poneglyph", "politics"], dream: true, masteryFlags: { protectedExceptionalPoneglyphScholar: true } },
      { slug: "mihawk-test", title: "La cible derrière la lame noire", description: "Mihawk se tient entre toi et un fugitif qui a tenté de voler son embarcation. Il ne semble pas défendre l’homme, seulement attendre une décision intéressante.", commit: "Demander le droit de poursuivre", redirect: "Attendre que le fugitif quitte son ombre", mastery: "Mihawk s’écarte après quelques mots, sans offrir ni aide ni seconde chance.", redirected: "La patience force le fugitif à courir et la capture se fait loin de la lame noire.", cost: "Un simple regard suffit à faire comprendre que toute attaque frontale finirait la chasse définitivement.", tags: ["mihawk", "direct-brief"], important: true },
      { slug: "emperor-information-war", kind: "lore", title: "La prime née d’une guerre d’Empereurs", description: "Deux réseaux liés à des Empereurs publient des primes contradictoires sur le même officier, chacun prétendant qu’il détient un Road Ponéglyphe.", commit: "Capturer l’officier avant les flottes", redirect: "Vendre une fausse position aux deux réseaux", mastery: "L’officier est extrait vivant et révèle que les deux camps poursuivaient un faux relevé.", redirected: "Les flottes se neutralisent autour d’une île vide pendant que la cible disparaît.", cost: "Les avant-gardes ferment la mer et tu abandonnes la capture pour sauver ton navire.", tags: ["emperor", "road-poneglyph"], dangerTheme: true, important: true, worldFlag: "hunterEmperorInformationWarResolved" },
      { slug: "greatest-contract", title: "Le contrat que le monde regardera", description: "Une capture légendaire, publique et politiquement explosive peut te rapprocher du sommet du métier. La cible doit impérativement rester vivante.", commit: "Achever la chasse devant les témoins", redirect: "Garantir d’abord un jugement indépendant", mastery: "La capture est reconnue dans tous les ports sans transformer la cible en trophée.", redirected: "Le jugement donne du poids à la capture et détruit les accusations fabriquées.", cost: "La cible survit mais disparaît dans une extraction gouvernementale avant la remise officielle.", tags: ["dream", "legendary-contract"], important: true, dream: true, commitTag: "Dernière chance", masteryFlags: { exceptionalGreatestHunterPath: true } },
    ],
    revolutionary: [
      { slug: "dragon-wind-order", title: "Le message porté par le vent", description: "Dans une mer cardinale, un Escargophone transmet trois mots attribués à Dragon : protéger le port, pas le drapeau. Personne ne peut confirmer davantage.", commit: "Défendre les habitants sans révéler la cellule", redirect: "Évacuer le relais avant l’attaque", mastery: "Le port tient et la cellule reste invisible, fidèle au sens du message plutôt qu’à sa légende.", redirected: "Les agents disparaissent avant la perquisition et laissent les habitants organisés.", cost: "La garnison prend le port, mais les dossiers et les familles ont déjà quitté les quais.", tags: ["dragon", "indirect"] },
      { slug: "reverse-koala-crossing", title: "Les cartes de Koala", description: "Un courrier de l’Armée révolutionnaire tente de franchir Reverse Mountain avec des cartes de routes esclavagistes préparées pour Koala. Une patrouille reconnaît le code porté par son navire au sommet.", commit: "Couvrir son passage", redirect: "Échanger les cartes entre trois embarcations", mastery: "Le courrier gagne Grand Line et confirme par Escargophone que les cartes atteindront Koala.", redirected: "Les cartes franchissent le sommet séparément et se recomposent de l’autre côté.", cost: "La patrouille brise la formation ; le courrier s’échappe, mais ta cellule est désormais signalée.", tags: ["koala", "indirect"] },
      { slug: "world-slave-network", title: "Les bracelets de quatre mers", description: "Les numéros saisis à Grand Line prouvent qu’un même réseau vend des esclaves à East Blue, North Blue, South Blue et West Blue.", commit: "Frapper les quatre dépôts ensemble", redirect: "Publier les noms des acheteurs", mastery: "Les dépôts tombent avant que le réseau puisse déplacer ses captifs.", redirected: "Les acheteurs perdent leurs protections et plusieurs royaumes ouvrent des enquêtes.", cost: "Deux dépôts sont vidés avant l’assaut, mais des centaines de captifs quittent les deux autres.", tags: ["slavery", "world-operation"], important: true, dream: true, masteryFlags: { exceptionalFourSeaSlaveNetworkBroken: true } },
      { slug: "hollow-broadcast", kind: "devil-fruit", title: "Les aveux sous l’emprise des Hollows", description: "Un trafiquant utilisant le Horo Horo no Mi brise le moral de prisonniers pour fabriquer de faux aveux dans tout Grand Line.", commit: "Protéger les prisonniers au Fluide", redirect: "Diffuser leurs témoignages originaux", mastery: "Les Hollows sont repoussés et les faux aveux s’effondrent.", redirected: "Les témoignages véritables remplacent les montages sur les relais clandestins.", cost: "Le désespoir gagne les émetteurs ; le trafiquant fuit, mais ses archives restent.", tags: ["devil-fruit", "user"], minimumStats: { haki: 5 } },
      { slug: "marineford-archives", kind: "lore", title: "Les dossiers sous Marineford", description: "Une annexe murée depuis la guerre de Marineford contient encore les dossiers de prisonniers politiques étrangers au combat historique. Cipher Pol vient d’en retrouver l’accès.", commit: "Extraire les dossiers et les détenus", redirect: "Détruire les listes avant l’évacuation", mastery: "Les détenus oubliés quittent l’annexe avant l’arrivée des agents.", redirected: "Les listes brûlent et privent Cipher Pol de futures arrestations.", cost: "L’effondrement force à choisir les vies avant les archives ; les prisonniers sortent sans leurs noms.", tags: ["marineford", "prison"], dangerTheme: true, important: true, worldFlag: "revolutionaryMarinefordEventResolved" },
      { slug: "void-century-archive", title: "L’année absente des comptes", description: "Une archive de Red Line mentionne un royaume ayant payé tribut pendant une année effacée du calendrier officiel.", commit: "Voler le registre original", redirect: "Multiplier les copies vérifiables", mastery: "L’archive rejoint les fragments déjà protégés et renforce une piste sur le Siècle oublié.", redirected: "Les copies gagnent plusieurs presses avant que le Gouvernement mondial ne ferme le dépôt.", cost: "L’original est détruit, mais l’archiviste mémorise les noms et les montants essentiels.", tags: ["void-century", "archive"], dream: true, callbackFlags: { metNeroDrypaper: true }, masteryFlags: { exceptionalVoidCenturyLedgerRecovered: true } },
      { slug: "celestial-dragon-incident", title: "Le cortège du Noble Mondial", description: "Un Noble Mondial traverse Red Line avec des esclaves et un témoin capable d’identifier tout son réseau d’acheteurs.", commit: "Extraire le témoin et les captifs", redirect: "Retourner l’escorte contre les trafiquants", mastery: "Les chaînes tombent pendant que le témoin rejoint une route sûre.", redirected: "Les preuves de paiement divisent l’escorte et ouvrent une brèche sans affrontement direct avec le Noble.", cost: "Les agents ferment le passage ; tu libères les captifs proches mais le témoin reste hors d’atteinte.", tags: ["celestial-dragons", "slavery"], dangerTheme: true, important: true, worldFlag: "celestialDragonIncidentResolved", commitTag: "Sans retour" },
      { slug: "phoenix-cache", kind: "lore", title: "La vivre card au sommet du paratonnerre", description: "Sur l’Île de la Tempête, un fragment de vivre card attribué à Marco attire Cipher Pol et les gardiens vers le même sanctuaire.", commit: "Atteindre le sommet avant les agents", redirect: "Confier la vivre card au conseil de l’île", mastery: "La foudre ouvre un passage et le fragment est placé hors de portée des agents.", redirected: "Le conseil confie chaque partie de la vivre card à un gardien différent.", cost: "Cipher Pol emporte un faux fragment, mais un gardien est blessé pendant le déplacement du véritable indice.", tags: ["marco", "storm"], commitTag: "Quitte ou double", masteryEffects: { morale: 4 }, minimumStats: { ship: 5, haki: 5 }, loreCharacters: ["Marco"] },
      { slug: "cipher-infiltration", title: "Le masque au conseil libre", description: "Un agent du Cipher Pol siège depuis des mois dans le conseil d’un territoire candidat à l’indépendance.", commit: "Démasquer l’agent pendant la séance", redirect: "Lui transmettre un faux plan de défense", mastery: "L’agente de liaison identifie l’imposteur sans livrer le réseau qui l’a découvert.", redirected: "Le faux plan conduit l’unité du Cipher Pol vers des fortifications abandonnées.", cost: "L’agent s’échappe après avoir détruit les registres du conseil.", tags: ["cipher-pol", "free-nation"], callbackFlags: { trustedAgentCendre: true }, masteryFlags: { exceptionalCipherInfiltratorExposed: true } },
      { slug: "sabo-flame-signal", title: "Le salut de feu de Sabo", description: "Dans le Nouveau Monde, une colonne de flammes dessine brièvement le signal d’évacuation de l’Armée révolutionnaire. Sabo apparaît seulement le temps de retenir une avant-garde.", commit: "Évacuer les cellules pendant son intervention", redirect: "Ouvrir une seconde route pour les civils", mastery: "Sabo couvre le dernier départ, échange quelques mots, puis rejoint un combat hors de ta portée.", redirected: "La seconde route sauve les quartiers que le premier signal ne pouvait atteindre.", cost: "L’avant-garde ferme la voie principale ; Sabo force une brèche pendant que tu abandonnes le matériel.", tags: ["sabo", "short-appearance"] },
      { slug: "world-truth-broadcast", kind: "lore", title: "La vérité sur toutes les fréquences", description: "Archives, témoignages et relevés de Ponéglyphes peuvent être diffusés simultanément par un réseau mondial d’Escargophones.", commit: "Lancer la diffusion complète", redirect: "Distribuer les preuves avant le message", mastery: "Le monde reçoit une vérité vérifiable que le Gouvernement mondial ne peut réduire à une rumeur.", redirected: "Même si les relais tombent, chaque preuve possède désormais des gardiens indépendants.", cost: "Cipher Pol coupe la moitié des fréquences, mais les premières révélations ont déjà traversé les mers.", tags: ["void-century", "world-broadcast"], important: true, dream: true, worldFlag: "exceptionalWorldTruthBroadcastResolved", commitTag: "Sans retour" },
      { slug: "four-dream-convergence", title: "Quatre chemins vers l’aube", description: "Un territoire libre, un convoi d’esclaves, une archive interdite et un réseau menacé convergent dans une seule opération du Nouveau Monde.", commit: "Consacrer l’opération au rêve poursuivi", redirect: "Sauver d’abord les personnes prises entre les fronts", mastery: "Toutes les forces se concentrent sur ton objectif de toujours et ouvrent une possibilité réelle d’accomplissement.", redirected: "Les personnes survivent et emportent avec elles les graines des quatre objectifs.", cost: "L’opération sauve une partie de chaque front sans obtenir la victoire historique espérée.", tags: ["dream", "world-operation"], dangerTheme: true, important: true, dream: true, commitTag: "Dernière chance", masteryFlags: { exceptionalRevolutionaryDreamMayBeFulfilled: true } },
    ],
  });

  const EXCEPTIONAL_EVENT_PACK = [];
  [
    [PATHS.PIRATE, PIRATE_EVENTS],
    [PATHS.MARINE, MARINE_EVENTS],
    [PATHS.BOUNTY_HUNTER, BOUNTY_HUNTER_EVENTS],
    [PATHS.REVOLUTIONARY, REVOLUTIONARY_EVENTS],
  ].forEach(([path, collection]) => {
    EXCEPTIONAL_SCENES[path].forEach((entry, index) => {
      const event = createExceptionalEvent(path, index, entry);
      EXCEPTIONAL_EVENT_PACK.push(event);
      collection.push(event);
    });
  });

  /*
   * Contrôle éditorial léger. Il ne modifie aucune donnée et ne produit un
   * message que si le pack devient incohérent pendant le développement.
   */
  function validateExceptionalEventPack(events) {
    const knownZones = new Set([
      ...STARTING_BLUES,
      "reverse-mountain", "grand-line", "red-line",
      "starless-sea", "wandering-archipelago", "tempest-isle", "shinsekai",
    ]);
    const knownPaths = new Set(Object.values(PATHS));
    const knownRarities = new Set([EVENT_RARITY.RARE, EVENT_RARITY.VERY_RARE]);
    const knownStats = new Set([
      "health", "combat", "haki", "intelligence", "charisma",
      "bounty", "fortune", "crew", "popularity",
    ]);
    const knownFruits = new Set(
      (window.GAME_DATA?.devilFruits || []).map((fruit) => fruit.id),
    );
    const ids = new Set();
    const warnings = [];

    events.forEach((event) => {
      if (ids.has(event.id)) warnings.push(`identifiant dupliqué : ${event.id}`);
      ids.add(event.id);
      if (event.paths.length !== 1 || !knownPaths.has(event.paths[0])) {
        warnings.push(`faction invalide : ${event.id}`);
      }
      if (event.zones.some((zone) => !knownZones.has(zone))) {
        warnings.push(`zone inconnue : ${event.id}`);
      }
      if (!knownRarities.has(event.rarity)) warnings.push(`rareté invalide : ${event.id}`);
      if (event.choices.length < 2 || event.choices.length > 3) {
        warnings.push(`nombre de choix invalide : ${event.id}`);
      }
      if (!event.choices.some((choice) => choice.outcomes.length >= 3)) {
        warnings.push(`aucun choix à trois issues : ${event.id}`);
      }
      event.choices.forEach((choice) => {
        if (!choice.outcomes.length) warnings.push(`choix sans issue : ${event.id}/${choice.id}`);
        if (!choice.outcomes.some((outcome) => outcome.fallback)) {
          warnings.push(`fallback absent : ${event.id}/${choice.id}`);
        }
        choice.outcomes.forEach((outcome) => {
          Object.keys(outcome.effects || {}).forEach((stat) => {
            if (!knownStats.has(stat)) warnings.push(`statistique inconnue : ${event.id}/${stat}`);
          });
          if (outcome.devilFruit) {
            if (!knownFruits.has(outcome.devilFruit.id)) {
              warnings.push(`Fruit inconnu : ${event.id}/${outcome.devilFruit.id}`);
            }
            if (outcome.requiresFruit !== false) {
              warnings.push(`Fruit attribuable sans contrôle : ${event.id}`);
            }
          }
        });
      });
      if (event.tags.includes("lore") && event.unique === false) {
        warnings.push(`événement historique répétable : ${event.id}`);
      }
    });

    if (warnings.length) {
      console.warn("[Blue Legacy] Validation du pack exceptionnel :", warnings);
    }
  }

  if (IS_DEVELOPMENT) validateExceptionalEventPack(EXCEPTIONAL_EVENT_PACK);

  const EAST_BLUE_EVENTS = [];
  const WEST_BLUE_EVENTS = [];
  const NORTH_BLUE_EVENTS = [];
  const SOUTH_BLUE_EVENTS = [];
  const RARE_EVENTS = [];
  const VERY_RARE_EVENTS = [];
  const CALLBACK_EVENTS = [];

  function createRiskEvent(config) {
    return createEvent({
      id: config.id,
      title: config.title,
      description: config.description,
      eventType: EVENT_TYPES.RISK,
      resolutionCategory: config.resolutionCategory,
      category: "risk-event",
      tags: ["risk", ...((config.paths || []).length ? [] : ["common"]), ...(config.tags || [])],
      paths: config.paths || [],
      zones: config.zones,
      minMonth: config.minMonth ?? 1,
      maxMonth: config.maxMonth ?? 24,
      rarity: EVENT_RARITY.RARE,
      weight: 3,
      unique: true,
      important: true,
      choices: config.choices.map((choice, index) => ({
        id: `${config.id}-${choice.id}`,
        text: choice.text,
        choiceTag: choice.tag,
        resolutionWeights: choice.resolutionWeights,
        outcomes: [
          {
            id: `${config.id}-${choice.id}-success`,
            result: choice.success,
            effects: choice.successEffects,
            outcomeTier: "success",
            weight: 3,
          },
          {
            id: `${config.id}-${choice.id}-failure`,
            result: choice.failure,
            effects: choice.failureEffects,
            flags: choice.failureFlags || {},
            outcomeTier: index === 0 ? "severe_failure" : "failure",
            fallback: true,
            weight: 2,
          },
        ],
      })),
    });
  }

  const RISK_EVENTS = [
    createRiskEvent({ id: "risk-common-reverse-crosscurrent", title: "Deux coques dans le courant vertical", description: "Deux navires sont projetés sur la même voie ascendante de Reverse Mountain. Une collision fermerait le passage à tous ceux qui suivent.", resolutionCategory: "action", zones: ["reverse-mountain"], tags: ["navigation", "collision"], choices: [
      { id: "hold-line", text: "Maintenir la coque dans le courant", tag: "Endurance", resolutionWeights: { health: 0.55, combat: 0.15, haki: 0.3 }, success: "Ta coque absorbe le choc et les deux navires franchissent le sommet.", successEffects: { haki: 2, popularity: 2 }, failure: "Le choc ouvre une voie d'eau avant le sommet. Les réparations engloutissent une partie des réserves.", failureEffects: { health: -8, fortune: -12000 } },
      { id: "break-wave", text: "Fendre la vague entre les navires", tag: "Maîtrise", resolutionWeights: { health: 0.15, combat: 0.5, haki: 0.35 }, success: "La vague se sépare assez longtemps pour laisser passer les deux proues.", successEffects: { combat: 2, haki: 1 }, failure: "La manœuvre évite la collision frontale, mais arrache une partie du gréement.", failureEffects: { fortune: -9000, health: -4 } },
    ]}),
    createRiskEvent({ id: "risk-common-paradise-climate-wall", title: "Le mur des quatre climats", description: "Dans Paradise, quatre fronts météorologiques se referment autour du Log Pose et rendent chaque cap dangereux.", resolutionCategory: "action", zones: ["grand-line"], tags: ["weather", "navigation"], choices: [
      { id: "endure-front", text: "Traverser le front le moins instable", tag: "Résistance", resolutionWeights: { health: 0.45, combat: 0.1, haki: 0.45 }, success: "Le navire ressort couvert de givre, mais conserve son cap.", successEffects: { haki: 2 }, failure: "La grêle blesse plusieurs marins et détruit les réserves exposées.", failureEffects: { health: -9, fortune: -10000 } },
      { id: "read-pressure", text: "Attendre la rupture entre les fronts", tag: "Perception", resolutionWeights: { health: 0.15, combat: 0.15, haki: 0.7 }, success: "Tu perçois l'accalmie avant qu'elle apparaisse et ouvres une route sûre.", successEffects: { haki: 3 }, failure: "L'accalmie se referme trop vite. Le navire s'échappe au prix de lourds dégâts.", failureEffects: { health: -5, fortune: -14000 } },
    ]}),
    createRiskEvent({ id: "risk-common-redline-sealed-pass", title: "Le laissez-passer aux trois sceaux", description: "À Red Line, un contrôle officiel déclare faux les laissez-passer de tout le convoi. Les agents préparent déjà les cellules.", resolutionCategory: "social", zones: ["red-line"], tags: ["government", "inspection"], choices: [
      { id: "challenge-register", text: "Exiger la consultation du registre central", tag: "Autorité", resolutionWeights: { charisma: 0.3, intelligence: 0.25, renown: 0.45 }, success: "Le registre confirme les sceaux et force les agents à rouvrir le passage.", successEffects: { bounty: 60000, popularity: 2 }, failure: "Le responsable fait disparaître la page et confisque la cargaison contestée.", failureEffects: { fortune: -18000, bounty: -50000 } },
      { id: "expose-seal", text: "Démontrer lequel des trois sceaux a été copié", tag: "Enquête", resolutionWeights: { charisma: 0.2, intelligence: 0.65, renown: 0.15 }, success: "L'encre trahit le faussaire au sein même du poste de contrôle.", successEffects: { intelligence: 2, popularity: 2 }, failure: "La preuve arrive trop tard et le convoi doit payer une garantie ruineuse.", failureEffects: { fortune: -16000, charisma: -2 } },
    ]}),
    createRiskEvent({ id: "risk-common-starless-hull", title: "Quelque chose sous la coque", description: "Dans la Mer sans étoiles, une créature invisible frappe la coque en suivant les vibrations des voix.", resolutionCategory: "action", zones: ["starless-sea"], tags: ["sea-beast", "darkness"], choices: [
      { id: "hold-silence", text: "Tenir le pont dans un silence total", tag: "Volonté", resolutionWeights: { health: 0.35, combat: 0.1, haki: 0.55 }, success: "La présence s'éloigne lorsque le navire cesse enfin de vibrer.", successEffects: { haki: 2 }, failure: "Un cri rompt le silence et la créature fend la coque avant de plonger.", failureEffects: { health: -8, fortune: -11000 } },
      { id: "strike-shadow", text: "Repérer l'impact et frapper sous la ligne d'eau", tag: "Combat", resolutionWeights: { health: 0.2, combat: 0.6, haki: 0.2 }, success: "Le coup atteint la créature et libère le navire de sa poursuite.", successEffects: { combat: 3 }, failure: "Le coup manque sa cible et la riposte projette plusieurs marins contre le bastingage.", failureEffects: { health: -10 } },
    ]}),
    createRiskEvent({ id: "risk-common-wandering-split", title: "L'île se sépare sous le camp", description: "Dans l'Archipel errant, l'îlot du campement se divise et entraîne les provisions vers deux courants opposés.", resolutionCategory: "action", zones: ["wandering-archipelago"], tags: ["moving-islands", "rescue"], choices: [
      { id: "save-people", text: "Relier les deux rives avant la séparation", tag: "Protection", resolutionWeights: { health: 0.45, combat: 0.2, haki: 0.35 }, success: "Les cordages tiennent jusqu'au passage du dernier voyageur.", successEffects: { haki: 2, popularity: 2 }, failure: "Les voyageurs survivent, mais les réserves disparaissent avec la seconde rive.", failureEffects: { fortune: -15000, health: -4 } },
      { id: "anchor-ridge", text: "Ancrer le navire dans la faille", tag: "Force", resolutionWeights: { health: 0.35, combat: 0.5, haki: 0.15 }, success: "La coque maintient les deux fragments assez longtemps pour l'évacuation.", successEffects: { combat: 2 }, failure: "L'ancre cède brutalement et blesse ceux qui tenaient la ligne.", failureEffects: { health: -9, fortune: -7000 } },
    ]}),
    createRiskEvent({ id: "risk-common-tempest-village", title: "La foudre descend vers le village", description: "Sur l'Île de la Tempête, le principal paratonnerre s'effondre tandis qu'une nouvelle salve charge les nuages.", resolutionCategory: "action", zones: ["tempest-isle"], tags: ["storm", "evacuation"], choices: [
      { id: "raise-conductor", text: "Redresser le conducteur sous la foudre", tag: "Sacrifice", resolutionWeights: { health: 0.45, combat: 0.1, haki: 0.45 }, success: "Le conducteur reprend la décharge et le village reste intact.", successEffects: { haki: 3, popularity: 3 }, failure: "La décharge traverse la ligne avant que le conducteur soit fixé.", failureEffects: { health: -12 } },
      { id: "shield-evacuation", text: "Protéger l'évacuation jusqu'aux galeries", tag: "Défense", resolutionWeights: { health: 0.3, combat: 0.15, haki: 0.55 }, success: "Ta protection tient jusqu'à la fermeture des galeries.", successEffects: { haki: 2, popularity: 2 }, failure: "Tout le monde atteint les galeries, mais la dernière décharge te frappe de plein fouet.", failureEffects: { health: -10 } },
    ]}),
    createRiskEvent({ id: "risk-common-shinsekai-tribute", title: "Le tribut d'une flotte d'Empereur", description: "Dans le Nouveau Monde, une flotte exige vivres et armes au nom d'un Empereur absent. Plusieurs petits équipages attendent ta réponse.", resolutionCategory: "social", zones: ["shinsekai"], tags: ["emperor", "tribute"], choices: [
      { id: "unite-captains", text: "Former un refus commun entre capitaines", tag: "Leadership", resolutionWeights: { charisma: 0.55, intelligence: 0.2, renown: 0.25 }, success: "Aucun équipage ne cède et la flotte renonce à attaquer tous les ports à la fois.", successEffects: { charisma: 3, popularity: 4 }, failure: "Deux capitaines trahissent l'accord et livrent la position des réserves.", failureEffects: { charisma: -4, fortune: -18000 } },
      { id: "question-mandate", text: "Exiger la preuve du mandat de l'Empereur", tag: "Renommée", resolutionWeights: { charisma: 0.2, intelligence: 0.25, renown: 0.55 }, success: "Le faux sceau transforme les percepteurs en imposteurs aux yeux de tous.", successEffects: { bounty: 120000, popularity: 3 }, failure: "Le commandant fait arrêter les messagers et double le tribut.", failureEffects: { bounty: -90000, fortune: -14000 } },
    ]}),
    createRiskEvent({ id: "risk-common-blue-fever-ransom", title: "Le remède retenu au port", description: "Dans une mer cardinale, un marchand bloque une cargaison de remèdes pendant qu'une fièvre gagne les villages côtiers.", resolutionCategory: "social", zones: STARTING_BLUES, tags: ["medicine", "extortion"], choices: [
      { id: "rally-harbor", text: "Rallier les dockers pour libérer la cargaison", tag: "Solidarité", resolutionWeights: { charisma: 0.65, intelligence: 0.2, renown: 0.15 }, success: "Les dockers ouvrent l'entrepôt et distribuent les caisses sous contrôle des médecins.", successEffects: { charisma: 2, popularity: 3 }, failure: "Le marchand fait fermer le port et vend les premières doses au plus offrant.", failureEffects: { charisma: -3, fortune: -9000 } },
      { id: "trace-ownership", text: "Prouver que la cargaison appartient aux villages", tag: "Preuves", resolutionWeights: { charisma: 0.15, intelligence: 0.65, renown: 0.2 }, success: "Les manifestes révèlent le détournement et rendent les remèdes à leurs destinataires.", successEffects: { intelligence: 2, popularity: 2 }, failure: "Les documents ont été remplacés et l'urgence impose de racheter une partie des doses.", failureEffects: { fortune: -13000, charisma: -1 } },
    ]}),
    createRiskEvent({ id: "risk-hunter-redline-forged-order", title: "Le contrat signé par un bureau fantôme", description: "À Red Line, un contrat de capture porte le sceau d'un service gouvernemental aboli. La cible est déjà encerclée.", resolutionCategory: "social", paths: [PATHS.BOUNTY_HUNTER], zones: ["red-line"], tags: ["contract", "forgery"], choices: [
      { id: "halt-hunt", text: "Suspendre la chasse devant les concurrents", tag: "Réputation", resolutionWeights: { charisma: 0.25, intelligence: 0.2, renown: 0.55 }, success: "Ta réputation impose une vérification et le faux commanditaire disparaît des quais.", successEffects: { bounty: 90000, popularity: 3 }, failure: "Les concurrents livrent la mauvaise cible et t'accusent d'avoir saboté le paiement.", failureEffects: { bounty: -100000, charisma: -3 } },
      { id: "trace-seal", text: "Remonter l'encre du sceau jusqu'à l'imprimeur", tag: "Enquête", resolutionWeights: { charisma: 0.15, intelligence: 0.7, renown: 0.15 }, success: "L'imprimeur identifie le courtier qui fabriquait les mandats.", successEffects: { intelligence: 3, fortune: 9000 }, failure: "L'atelier brûle avant ton arrivée et le commanditaire efface sa piste.", failureEffects: { fortune: -7000, charisma: -2 } },
    ]}),
    createRiskEvent({ id: "risk-hunter-shinsekai-emperor-prey", title: "La cible sous le pavillon d'un Empereur", description: "Dans le Nouveau Monde, ta cible se réfugie sur un navire protégé par une flotte d'Empereur. L'extraction doit réussir avant l'arrivée du commandant.", resolutionCategory: "action", paths: [PATHS.BOUNTY_HUNTER], zones: ["shinsekai"], tags: ["hunt", "emperor"], choices: [
      { id: "board-fast", text: "Aborder avant le signal de la flotte", tag: "Combat", resolutionWeights: { health: 0.2, combat: 0.6, haki: 0.2 }, success: "La cible tombe avant que les renforts comprennent l'objectif réel.", successEffects: { combat: 3, fortune: 18000 }, failure: "Les renforts ferment le pont et la retraite se fait sous un feu nourri.", failureEffects: { health: -12, fortune: -9000 } },
      { id: "shield-extraction", text: "Couvrir l'extraction sous la pression du commandant", tag: "Défense", resolutionWeights: { health: 0.25, combat: 0.15, haki: 0.6 }, success: "Ta garde tient assez longtemps pour extraire la cible vivante.", successEffects: { haki: 3, bounty: 120000 }, failure: "La pression brise la formation et la cible disparaît dans la flotte.", failureEffects: { health: -8, bounty: -90000 } },
    ]}),
    createRiskEvent({ id: "risk-revolutionary-redline-chain-convoy", title: "Le convoi suspendu à Red Line", description: "Un convoi d'esclaves traverse une voie extérieure de Red Line. Une rupture des chaînes condamnerait aussi les prisonniers à la chute.", resolutionCategory: "action", paths: [PATHS.REVOLUTIONARY], zones: ["red-line"], tags: ["slavery", "rescue"], choices: [
      { id: "hold-bridge", text: "Tenir le pont pendant l'ouverture des colliers", tag: "Endurance", resolutionWeights: { health: 0.5, combat: 0.25, haki: 0.25 }, success: "Le pont reste stable jusqu'à la libération du dernier prisonnier.", successEffects: { haki: 2, popularity: 4 }, failure: "Le pont cède partiellement. Les prisonniers survivent, mais tu encaisses l'effondrement.", failureEffects: { health: -12 } },
      { id: "break-escort", text: "Neutraliser l'escorte sans toucher aux chaînes", tag: "Précision", resolutionWeights: { health: 0.15, combat: 0.55, haki: 0.3 }, success: "L'escorte tombe avant de pouvoir actionner le mécanisme de chute.", successEffects: { combat: 3, popularity: 3 }, failure: "Un garde déclenche le mécanisme. Tu sauves le convoi, mais la riposte te blesse lourdement.", failureEffects: { health: -10, fortune: -6000 } },
    ]}),
  ];

  function createRestoredCommonEvent(config) {
    return createEvent({
      id: config.id,
      title: config.title,
      description: config.description,
      eventType: EVENT_TYPES.ORDINARY,
      resolutionCategory: config.resolutionCategory,
      category: "common-event",
      tags: ["common", ...(config.tags || [])],
      paths: [],
      zones: config.zones,
      minMonth: 1,
      maxMonth: 24,
      rarity: EVENT_RARITY.COMMON,
      weight: 2,
      unique: true,
      choices: config.choices.map((choice) => ({
        id: `${config.id}-${choice.id}`,
        text: choice.text,
        choiceTag: choice.tag,
        resolutionWeights: choice.resolutionWeights,
        outcomes: [
          { id: `${config.id}-${choice.id}-success`, result: choice.success, effects: choice.successEffects, outcomeTier: "success", weight: 3 },
          { id: `${config.id}-${choice.id}-failure`, result: choice.failure, effects: choice.failureEffects, outcomeTier: "failure", fallback: true, weight: 2 },
        ],
      })),
    });
  }

  const RESTORED_COMMON_EVENTS = [
    createRestoredCommonEvent({ id: "common-blue-lighthouse-debt", title: "La lanterne sous scellés", description: "Dans une mer cardinale, un créancier a fait saisir l'huile du phare avant la nuit.", resolutionCategory: "social", zones: STARTING_BLUES, tags: ["lighthouse", "village"], choices: [
      { id: "rally", text: "Réunir les pêcheurs autour du gardien", tag: "Solidarité", resolutionWeights: { charisma: .6, intelligence: .25, renown: .15 }, success: "Les habitants rachètent ensemble l'huile et rallument la lanterne.", successEffects: { charisma: 1, popularity: 2 }, failure: "La collecte échoue et le port reste fermé jusqu'au matin.", failureEffects: { fortune: -4000 } },
      { id: "audit", text: "Examiner le contrat de saisie", tag: "Enquête", resolutionWeights: { charisma: .2, intelligence: .65, renown: .15 }, success: "Une clause frauduleuse annule la saisie avant le coucher du soleil.", successEffects: { intelligence: 1 }, failure: "Le contrat tient et tu finances une nuit d'éclairage.", failureEffects: { fortune: -6000 } },
    ]}),
    createRestoredCommonEvent({ id: "common-reverse-stranded-navigator", title: "Le navigateur accroché à la roche", description: "À Reverse Mountain, un navigateur isolé s'agrippe à une corniche au-dessus du courant.", resolutionCategory: "action", zones: ["reverse-mountain"], tags: ["rescue", "navigation"], choices: [
      { id: "reach", text: "Gagner la corniche à contre-courant", tag: "Endurance", resolutionWeights: { health: .5, combat: .15, haki: .35 }, success: "Tu ramènes le navigateur à bord avant la prochaine vague.", successEffects: { popularity: 2 }, failure: "Le sauvetage réussit, mais la coque heurte la paroi.", failureEffects: { health: -4, fortune: -3000 } },
      { id: "line", text: "Guider un cordage depuis le sommet", tag: "Précision", resolutionWeights: { health: .2, combat: .45, haki: .35 }, success: "Le cordage arrache le naufragé au courant.", successEffects: { combat: 1 }, failure: "Le premier lancer manque et coûte une partie du gréement.", failureEffects: { fortune: -4500 } },
    ]}),
    createRestoredCommonEvent({ id: "common-paradise-logpose-exchange", title: "Le comptoir des aiguilles", description: "Dans Paradise, deux relevés de Log Pose contradictoires indiquent la prochaine île.", resolutionCategory: "social", zones: ["grand-line"], tags: ["log-pose", "trade"], choices: [
      { id: "journals", text: "Comparer les journaux des derniers équipages", tag: "Analyse", resolutionWeights: { charisma: .2, intelligence: .65, renown: .15 }, success: "Les dates révèlent la carte encore fiable.", successEffects: { intelligence: 1, fortune: 5000 }, failure: "Les relevés maquillés imposent un long détour.", failureEffects: { fortune: -5000 } },
      { id: "sailors", text: "Faire témoigner les marins du comptoir", tag: "Contact", resolutionWeights: { charisma: .6, intelligence: .25, renown: .15 }, success: "Un vieux timonier reconnaît le faux relevé.", successEffects: { charisma: 1 }, failure: "Les témoignages font manquer la marée favorable.", failureEffects: { fortune: -3500 } },
    ]}),
    createRestoredCommonEvent({ id: "common-redline-refugee-manifest", title: "Les noms absents du manifeste", description: "À Red Line, plusieurs familles d'un convoi ont disparu du manifeste officiel.", resolutionCategory: "social", zones: ["red-line"], tags: ["refugees", "government"], choices: [
      { id: "restore", text: "Reconstituer la liste devant les agents", tag: "Mémoire", resolutionWeights: { charisma: .25, intelligence: .55, renown: .2 }, success: "Les registres confirment chaque nom et le convoi repart entier.", successEffects: { intelligence: 1, popularity: 2 }, failure: "La vérification impose une nuit sous surveillance.", failureEffects: { fortune: -6500 } },
      { id: "vouch", text: "Engager ta parole pour les familles", tag: "Autorité", resolutionWeights: { charisma: .45, intelligence: .15, renown: .4 }, success: "Ta parole suspend l'ordre et ouvre le passage.", successEffects: { charisma: 1 }, failure: "L'agent refuse et consigne ton intervention.", failureEffects: { bounty: -25000 } },
    ]}),
    createRestoredCommonEvent({ id: "common-starless-silent-beacon", title: "La balise qui répond sans lumière", description: "Dans la Mer sans étoiles, une balise éteinte frappe pourtant un rythme contre la coque.", resolutionCategory: "action", zones: ["starless-sea"], tags: ["beacon", "darkness"], choices: [
      { id: "follow", text: "Suivre le rythme dans l'obscurité", tag: "Perception", resolutionWeights: { health: .2, combat: .1, haki: .7 }, success: "Le signal conduit le navire hors des récifs invisibles.", successEffects: { haki: 1 }, failure: "Le rythme se décale et la coque racle un récif.", failureEffects: { health: -3, fortune: -3000 } },
      { id: "recover", text: "Remonter la balise pour l'examiner", tag: "Maîtrise", resolutionWeights: { health: .25, combat: .4, haki: .35 }, success: "Le mécanisme révèle une ancienne route praticable.", successEffects: { intelligence: 1, fortune: 4000 }, failure: "Le câble cède et emporte du matériel.", failureEffects: { fortune: -4500 } },
    ]}),
    createRestoredCommonEvent({ id: "common-shinsekai-neutral-harbor", title: "Le serment du port neutre", description: "Dans le Nouveau Monde, un petit port exige que les querelles restent loin de ses quais.", resolutionCategory: "social", zones: ["shinsekai"], tags: ["harbor", "truce"], choices: [
      { id: "oath", text: "Accepter le serment devant les habitants", tag: "Honneur", resolutionWeights: { charisma: .4, intelligence: .15, renown: .45 }, success: "Le port t'accorde sa confiance et ouvre ses réserves.", successEffects: { popularity: 2, fortune: 5000 }, failure: "Une vieille rivalité ferme plusieurs entrepôts.", failureEffects: { fortune: -3000 } },
      { id: "mediate", text: "Régler la querelle qui menace la trêve", tag: "Médiation", resolutionWeights: { charisma: .6, intelligence: .25, renown: .15 }, success: "Les deux équipages déposent les armes.", successEffects: { charisma: 1, popularity: 2 }, failure: "Ton départ devient la condition du calme.", failureEffects: { popularity: -1 } },
    ]}),
  ];

  /* Les respirations communes restent possibles, mais deviennent minoritaires. */
  COMMON_EVENTS.forEach((event) => {
    event.weight = Math.min(event.weight, 2);
  });

  /* ========================================================
     ÉVÉNEMENTS DÉCISIFS — 16 rêves × 3 étapes
  ======================================================== */
  const DECISIVE_STAGE_LABELS = Object.freeze([
    "Premier tournant", "Crise du rêve", "Accomplissement du rêve",
  ]);

  function getDecisiveStageMeta(stage) {
    const final = stage === 3;
    return {
      label: DECISIVE_STAGE_LABELS[stage - 1] || `Étape ${stage}`,
      threshold: Math.min(68, 18 + stage * 4),
      gain: final ? 10 : 3 + Math.ceil(stage / 4),
      renown: final ? 350000 : 35000 + stage * 12000,
      dream: final ? 8 : stage % 4 === 0 ? 2 : 1,
    };
  }

  const bossTrial = (title, premise, direct, strategy, social, type, loreCharacters = []) => ({
    title, premise, direct, strategy, social, type, loreCharacters,
  });

  const finalDreamScene = (title, premise, direct, strategy, social, type, results, requirements = [], loreCharacters = []) => ({
    title, premise, direct, strategy, social, type, results, requirements, loreCharacters,
  });

  /* Les deux premiers tournants restent modulaires. La troisième étape utilise
     une scène écrite pour le rêve exact : aucune de ces conclusions ne peut
     être partagée avec un autre rêve. */
  const FINAL_DREAM_SCENES = Object.freeze({
    "one-piece": finalDreamScene(
      "Le cap que nul Log Pose n’indique",
      "Les relevés des quatre Road Ponéglyphes convergent enfin. Au-delà d’une mer où le Log Pose devient muet se trouve Laugh Tale, mais une flotte rivale fonce sur les mêmes coordonnées et la moindre erreur condamnera la route.",
      "Ouvrir la route vers Laugh Tale sous le feu rival",
      "Superposer les quatre relevés et lire le dernier courant",
      "Unir les équipages alliés autour d’un cap unique",
      "navigation",
      {
        success: ["Tu contiens la flotte rivale jusqu’au courant décisif. Ton navire franchit la mer impossible, atteint Laugh Tale et ton équipage découvre enfin ce que Roger y avait trouvé : le One Piece est trouvé, sans que son secret soit livré au reste du monde.", "Les quatre relevés révèlent l’erreur cachée dans les coordonnées. Tu guides seul ton équipage jusqu’à Laugh Tale et comprends la portée du trésor laissé au terme de Grand Line.", "Les pavillons alliés protègent la traversée sans se disputer la découverte. Tu poses le pied sur Laugh Tale et deviens la personne qui a trouvé le One Piece."],
        mixed: "La route exacte apparaît, mais la flotte rivale détruit un relevé avant le départ. Laugh Tale reste localisée sans pouvoir être atteinte cette fois.",
        failure: "La mer sans repère disperse les navires et la flotte rivale emporte un élément essentiel. Laugh Tale disparaît de nouveau derrière ses courants.",
      },
      [{ haki: 24, crew: 2 }, { intelligence: 50 }, { health: 50, crew: 3 }],
    ),
    "sea-emperor": finalDreamScene(
      "Le jour où le Nouveau Monde reconnaît un pavillon",
      "Le port fortifié de l’Archipel d’Obsidienne commande trois routes du Nouveau Monde. Son peuple accepte ton pacte, mais une grande flotte pirate vient reprendre le tribut : tenir ce territoire décidera si ton pavillon devient une puissance mondiale ou un souvenir.",
      "Tenir les passes jusqu’au retrait de la grande flotte",
      "Couper ses dépôts et retourner ses routes de ravitaillement",
      "Fédérer les ports libres sous un pacte de défense",
      "war",
      { success: ["La flotte recule et les passes restent sous ta protection. Les journaux annoncent qu’un nouveau pavillon contrôle désormais une puissance territoriale du Nouveau Monde : le monde te reconnaît comme Empereur des mers.", "Privée de vivres et de munitions, la grande flotte abandonne le tribut. Ton réseau de ports devient un territoire cohérent et les puissances du monde te comptent parmi les Empereurs.", "Les ports combattent ensemble sans perdre leur autonomie. Leur pacte porte ton pavillon et transforme ton influence en puissance impériale reconnue."], mixed: "Le port est sauvé, mais les routes restent disputées et aucun bloc durable ne reconnaît encore ton autorité impériale.", failure: "La coalition se brise sous le blocus. Les habitants sont évacués, mais le territoire stratégique et la reconnaissance mondiale t’échappent." },
      [{ combat: 52, crew: 3 }, { haki: 24, intelligence: 46 }, { health: 52, crew: 3 }],
    ),
    "worlds-greatest-fortune": finalDreamScene(
      "La réserve des sept comptoirs",
      "Les livres du monde souterrain localisent une réserve historique alimentée depuis des décennies par sept comptoirs. Le coffre dérive vers un gouffre volcanique tandis que créanciers et corsaires contestent chaque titre de propriété.",
      "Arracher la réserve au convoi avant le gouffre",
      "Dénouer les sociétés-écrans et réclamer chaque actif",
      "Financer le sauvetage puis racheter les sept créances",
      "commerce",
      { success: ["Tu prends le convoi intact et sécurises ses coffres dans plusieurs ports. Leur valeur dépasse toutes les fortunes pirates recensées : tu deviens le Seigneur des trésors.", "Les faux propriétaires s’effondrent devant leurs propres registres. Comptoirs, cargaisons et réserves te reviennent légalement dans le monde souterrain, constituant une fortune sans équivalent.", "Ton capital sauve les cargaisons et absorbe les créances au juste moment. Les sept comptoirs passent sous ton réseau et consacrent la plus grande fortune des mers."], mixed: "Une partie de la réserve est sauvée, mais les dettes et les pertes empêchent ta fortune de dépasser celles des plus grands trésoriers.", failure: "Le gouffre engloutit les coffres pendant que les faux créanciers saisissent le réseau. L’occasion d’amasser la plus grande fortune disparaît." },
      [{ bounty: 100000, fortune: 5000 }, { intelligence: 48, fortune: 5000 }, { charisma: 28, fortune: 8000 }],
    ),
    "forgotten-history": finalDreamScene(
      "La dernière page sauvée d’Ohara",
      "Un Ponéglyphe du Nouveau Monde complète les fragments sauvés d’Ohara. Cipher Pol encercle le sanctuaire et prépare son effacement ; il faut interpréter la pierre puis préserver la vérité sans prétendre révéler ce que le monde ignore encore.",
      "Protéger le sanctuaire jusqu’à la fin du relevé",
      "Reconstituer la chronologie avec les fragments d’Ohara",
      "Confier des copies chiffrées à plusieurs gardiens",
      "history",
      { success: ["Le relevé s’achève avant la chute des portes. Les fragments concordent : tu comprends une part décisive de l’Histoire oubliée et sauves la pierre de l’effacement.", "Les notes d’Ohara donnent enfin leur sens au Ponéglyphe. Tu reconstitues la vérité générale sans en inventer les pages manquantes et deviens son gardien.", "Aucun gardien ne possède seul toute l’archive, mais leurs copies réunies sont indestructibles. Tu préserves la connaissance retrouvée pour les générations futures."], mixed: "Tu sauves assez de fragments pour prouver qu’une vérité existe, mais pas assez pour en comprendre la portée décisive.", failure: "Cipher Pol détruit le relevé et remonte jusqu’aux copies. Les bribes conservées ne permettent pas d’accomplir la recherche de toute une vie." },
      [{ haki: 22, health: 48 }, { intelligence: 52 }, { charisma: 34, intelligence: 46 }],
    ),
    "greatest-bounty-hunter": finalDreamScene(
      "La cible que tous avaient perdue",
      "Le cerveau anonyme d’un réseau de fausses primes réapparaît dans le Nouveau Monde avec trois doublures et des contrats contradictoires. Les meilleurs chasseurs ont tous échoué ; cette capture décidera qui devient la référence mondiale de la profession.",
      "Démasquer la cible et la prendre vivante devant les rivaux",
      "Piéger les doublures avec la signature des faux contrats",
      "Imposer une remise publique indépendante des commanditaires",
      "hunt",
      { success: ["Tu identifies la bonne cible au cœur de la mêlée et la captures vivante. Les chasseurs présents reconnaissent la maîtrise qui fait de toi leur plus grande légende.", "Les faux contrats conduisent chaque doublure dans ton piège et isolent le cerveau du réseau. Cette traque irréprochable devient la nouvelle mesure du métier.", "Les preuves, la cible et les témoins arrivent ensemble à une remise publique. Ni la Marine ni le monde souterrain ne peuvent voler la capture qui consacre ta légende."], mixed: "La cible est neutralisée, mais un commanditaire confisque les preuves et revendique la réussite. Ta maîtrise reste contestée.", failure: "Une doublure est livrée à la place du cerveau, qui disparaît avec les contrats. La traque ultime échoue." },
      [{ combat: 50, bounty: 90000 }, { haki: 22, intelligence: 46 }, { health: 48, bounty: 120000 }],
    ),
    "most-dangerous-criminals": finalDreamScene(
      "La rafle des trois pavillons noirs",
      "Trois cellules responsables des crimes suivis durant ta carrière se réunissent dans une forteresse flottante. Leurs chefs préparent de nouvelles identités et une fuite séparée ; une erreur condamnerait des innocents à leur place.",
      "Fermer les trois ponts et capturer les chefs vivants",
      "Croiser les preuves avant de déclencher la rafle",
      "Retourner les équipages contre les trois cellules",
      "hunt",
      { success: ["Les trois chefs tombent sans atteindre leurs otages ni leurs issues. Leur capture vivante met définitivement fin au sommet du réseau criminel.", "Chaque preuve désigne la bonne cible et l’heure exacte de sa fuite. La rafle saisit criminels, registres et complices sans une fausse arrestation.", "Les marins livrent les chefs et ouvrent les cellules. Privé de cadres, d’argent et de routes, le réseau ne peut renaître le lendemain."], mixed: "Deux cellules sont neutralisées, mais la troisième s’échappe avec ses registres. La menace recule sans disparaître.", failure: "Les fausses identités déclenchent la rafle au mauvais endroit. Les chefs fuient et les preuves deviennent inutilisables." },
      [{ combat: 50, crew: 2 }, { haki: 22, intelligence: 48 }, { health: 48, charisma: 32 }],
    ),
    "hunt-an-emperor": finalDreamScene(
      "La chasse sous le pavillon impérial",
      "Le lieutenant qui tient les routes, les armes et les tributs d’une puissance impériale rejoint son navire-amiral. L’Empereur ne peut être abattu seul, mais arracher ce pilier à sa flotte ferait vaciller un empire que personne n’osait traquer.",
      "Capturer le lieutenant au milieu de l’avant-garde",
      "Effondrer simultanément ses routes et isoler son navire",
      "Soulever les ports tributaires pendant l’extraction",
      "hunt",
      { success: ["Tu survis au choc de l’avant-garde et extrais le lieutenant vivant. La perte de ce pilier force la puissance impériale à abandonner plusieurs mers : ta traque mérite le nom de Tombeur d’Empereur.", "Dépôts, relais et navire-amiral sont isolés au même instant. La puissance impériale recule sans bataille absurde contre l’Empereur lui-même, vaincue par ta traque.", "Les ports refusent ensemble le tribut et couvrent ta capture. L’empire perd son lieutenant et son assise ; le monde retient que tu as osé le faire tomber."], mixed: "Le lieutenant perd son réseau, mais rejoint l’Empereur avant la capture. La puissance impériale est blessée, pas tombée.", failure: "L’avant-garde referme le piège et le lieutenant s’échappe. Tu survis à la puissance impériale sans accomplir la traque décisive." },
      [{ combat: 52, haki: 22 }, { haki: 20, intelligence: 46 }, { health: 50, crew: 2 }],
    ),
    "contract-fortune": finalDreamScene(
      "Le contrat aux cent millions de clauses",
      "Le plus grand contrat indépendant jamais publié exige la capture d’un réseau de contrebandiers, mais une clause secrète autorise le commanditaire à saisir la cible, les preuves et le paiement. Toute ta fortune et ta liberté se jouent à la remise.",
      "Accomplir la capture et verrouiller physiquement le paiement",
      "Retourner la clause cachée contre le commanditaire",
      "Garantir la remise auprès de chasseurs et courtiers rivaux",
      "commerce",
      { success: ["La cible et les preuves sont remises pendant que ton équipe sécurise chaque coffre. Le contrat est accompli, payé et impossible à confisquer : ta fortune vient bien de ta carrière de chasseur.", "La clause secrète prouve la fraude du client et déclenche ses propres garanties. Tu encaisses le contrat ultime sans devenir son pion.", "Les garants assistent ensemble à la remise et imposent le paiement intégral. Ton indépendance survit et tes contrats ont bâti une fortune légendaire."], mixed: "Le contrat est accompli, mais les frais, les litiges et une partie du paiement saisi empêchent la fortune ultime.", failure: "Le commanditaire active la clause avant la remise et disparaît avec paiement et preuves. Le contrat ruine sa propre récompense." },
      [{ bounty: 100000, fortune: 18000 }, { intelligence: 50, fortune: 14000 }, { charisma: 34, bounty: 90000 }],
    ),
    "break-the-chains": finalDreamScene(
      "La route où les chaînes prennent fin",
      "Le centre du plus vaste réseau d’esclavage du Nouveau Monde coordonne convois, ventes et colliers pour des intermédiaires des Dragons Célestes. Des milliers de captifs attendent le signal qui peut libérer tous les sites et rendre la route inutilisable.",
      "Prendre le centre de contrôle et ouvrir chaque convoi",
      "Saboter colliers, comptes et routes au même instant",
      "Donner aux captifs et aux cellules le signal du soulèvement",
      "liberation",
      { success: ["Le centre tombe et chaque convoi reçoit les codes d’ouverture. Les captifs sont libres, les responsables arrêtés et la route de trafic détruite.", "Les colliers s’ouvrent tandis que comptes et itinéraires deviennent publics. Sans argent, matériel ni anonymat, le réseau ne peut redémarrer.", "Les captifs prennent les postes de garde pendant que les cellules sécurisent les évacuations. Le réseau principal s’effondre sous ceux qu’il retenait."], mixed: "Les captifs du centre s’échappent, mais plusieurs routes et responsables survivent. Les chaînes sont brisées ici, pas partout.", failure: "Le signal est coupé et les convois se dispersent. Des prisonniers sont sauvés, mais le réseau principal reste capable de reprendre le trafic." },
      [{ combat: 50, crew: 3 }, { haki: 22, intelligence: 46 }, { health: 52, charisma: 34 }],
    ),
    "reveal-void-century": finalDreamScene(
      "La vérité sur toutes les fréquences",
      "Les fragments authentifiés et les témoins sont réunis. Cipher Pol attaque le dernier relais d’Escargophones avant une diffusion simultanée vers plusieurs mers ; il ne s’agit plus de découvrir la vérité, mais de la rendre impossible à effacer.",
      "Tenir le relais jusqu’à la dernière transmission",
      "Fractionner preuves et témoignages entre mille récepteurs",
      "Faire certifier la diffusion par des peuples de chaque mer",
      "information",
      { success: ["Le relais tient assez longtemps : preuves et témoignages atteignent toutes les mers. Le Gouvernement ne peut plus supprimer chaque copie de la vérité interdite.", "Chaque fragment isolé paraît anodin, mais mille récepteurs les recomposent ensemble. La révélation du Siècle oublié devient impossible à étouffer.", "Savants, témoins et peuples authentifient publiquement les mêmes éléments. Sans inventer les pages encore inconnues, le monde reçoit enfin la vérité conservée."], mixed: "Une partie des preuves circule, mais sans authentification commune. Le monde soupçonne la vérité sans pouvoir encore l’établir.", failure: "Cipher Pol coupe les relais et saisit les témoins avant la certification. Quelques rumeurs survivent, pas une révélation mondiale." },
      [{ combat: 48, haki: 22 }, { intelligence: 52 }, { charisma: 36, intelligence: 46 }],
    ),
    "build-underground-network": finalDreamScene(
      "Le réseau sans centre à abattre",
      "Toutes les cellules, routes et soutiens de ta carrière doivent se connecter cette nuit par un protocole d’Escargophones traversant Red Line. Cipher Pol a infiltré un relais et espère détruire le réseau au moment même de sa naissance.",
      "Extraire l’infiltré sans interrompre la connexion mondiale",
      "Déployer un protocole distribué sans quartier général",
      "Unifier les cellules rivales autour de codes communs",
      "network",
      { success: ["L’infiltré est isolé et chaque cellule reste en ligne. Le réseau coordonne sa première opération mondiale avant que Cipher Pol comprenne qu’il n’a plus de centre à frapper.", "Les relais se vérifient mutuellement et remplacent aussitôt tout nœud détruit. Ton infrastructure clandestine traverse désormais les mers et Red Line.", "Les cellules conservent leur autonomie tout en partageant routes, alertes et ressources. Leur première action commune consacre le plus grand réseau clandestin révolutionnaire."], mixed: "Les cellules communiquent, mais l’infiltration impose de sacrifier plusieurs routes. Le réseau existe sans encore devenir l’infrastructure mondiale rêvée.", failure: "Le faux relais divise les cellules et révèle leurs codes. Les survivants se dispersent avant que le réseau puisse fonctionner." },
      [{ bounty: 90000, crew: 3 }, { intelligence: 51 }, { charisma: 36, crew: 3 }],
    ),
    "found-free-nation": finalDreamScene(
      "L’aube de la République des Récifs",
      "Le territoire libéré proclame son nom et son conseil élu, mais une flotte gouvernementale ferme le port tandis que pénurie et anciens dignitaires menacent sa première journée. La nation n’existera que si sa population peut la défendre et la gouverner durablement.",
      "Briser le blocus en protégeant les quartiers civils",
      "Garantir vivres, institutions et défense pour cent jours",
      "Obtenir du peuple et des ports voisins un pacte de reconnaissance",
      "politics",
      { success: ["Le blocus recule sans reprendre les quartiers libérés. Le conseil demeure, la population hisse son propre pavillon et la République des Récifs survit à sa première attaque.", "Réserves, tribunaux et milice civile fonctionnent lorsque la flotte ferme le port. La nation prouve qu’elle peut vivre sans son ancien oppresseur.", "Les habitants ratifient le pacte et les ports voisins garantissent son indépendance. Reconnu et défendable, le territoire devient réellement une nation libre."], mixed: "Le peuple garde son conseil, mais doit évacuer le territoire. Une nation en exil naît sans le sol durable que promettait le rêve.", failure: "Le blocus affame le port et les anciens dignitaires reprennent les institutions. La proclamation ne devient jamais une nation viable." },
      [{ bounty: 90000, charisma: 32 }, { intelligence: 50, fortune: 12000 }, { charisma: 40, crew: 3 }],
    ),
    "admiral": finalDreamScene(
      "Le siège vacant de l’Amiral",
      "Une crise du Nouveau Monde coupe un corridor rempli de civils tandis qu’un siège d’Amiral est soumis à sélection. L’état-major observe qui peut commander plusieurs unités, vaincre la menace et refuser de sacrifier la population pour une victoire rapide.",
      "Prendre la ligne de front et maintenir le corridor",
      "Coordonner les unités autour d’une évacuation offensive",
      "Assumer devant l’état-major la priorité donnée aux civils",
      "war",
      { success: ["Tu contiens la menace jusqu’au dernier navire civil et ramènes les unités. L’état-major confirme officiellement ta nomination comme Amiral.", "Chaque unité ouvre puis referme le corridor selon ton plan. La crise est gagnée sans abandonner les civils et la Marine te confie le siège d’Amiral.", "Soldats et survivants témoignent de ton commandement. La hiérarchie reconnaît que ta justice possède la force et l’autorité d’un Amiral."], mixed: "Le corridor est évacué, mais la désobéissance désorganise les unités. Ta valeur est reconnue sans que la nomination soit confirmée.", failure: "La menace coupe le corridor et la hiérarchie retire ta candidature. La crise survit à ton opération, pas ton accession au rang d’Amiral." },
      [{ combat: 50, haki: 22 }, { haki: 22, crew: 3 }, { health: 50, bounty: 90000 }],
    ),
    "fleet-admiral": finalDreamScene(
      "Le commandement de toutes les flottes",
      "Une crise mondiale rend les ordres actuels incompatibles et ouvre une transition à la tête de la Marine. Plusieurs flottes attendent une doctrine unique tandis que le Gouvernement et les vice-amiraux évaluent qui peut empêcher l’institution de se déchirer.",
      "Prendre le commandement opérationnel des flottes divisées",
      "Présenter une doctrine qui résout les trois crises ensemble",
      "Obtenir l’adhésion des vice-amiraux et du Gouvernement",
      "command",
      { success: ["Les flottes exécutent ton ordre commun et la crise s’achève sans guerre interne. La transition est ratifiée : tu deviens officiellement Amiral en chef.", "Ta doctrine protège les populations tout en restaurant la chaîne de commandement. Aucun autre plan ne tient face à l’état-major, qui te confie la direction de la Marine.", "Vice-amiraux et représentants gouvernementaux acceptent une même ligne de justice. Leur vote difficile confirme ton accession au poste d’Amiral en chef."], mixed: "Les flottes cessent de s’affronter, mais aucun accord institutionnel ne confirme la transition. Tu sauves la Marine sans la diriger.", failure: "Les ordres concurrents divisent l’opération et la hiérarchie choisit une autre transition. Le commandement suprême t’échappe." },
      [{ bounty: 1, health: 45 }, { intelligence: 46, bounty: 10000 }, { charisma: 28, bounty: 15000 }],
    ),
    "reform-the-marines": finalDreamScene(
      "L’ordre général qui change la Marine",
      "Les preuves d’abus accumulées convergent avec une crise où l’ancienne procédure condamne des civils. L’état-major doit voter un ordre général contraignant sur les détentions, la protection des populations et la responsabilité du commandement.",
      "Appliquer la nouvelle procédure pendant la crise",
      "Rendre les preuves et le dispositif juridiquement indissociables",
      "Former une majorité d’officiers autour de l’ordre général",
      "justice",
      { success: ["Ton opération sauve les civils en suivant la procédure proposée, rendant le statu quo indéfendable. L’ordre général est adopté et appliqué dans toutes les bases.", "Chaque abus prouve la nécessité d’un article précis et chaque article reçoit un contrôle réel. L’état-major ratifie une réforme impossible à enterrer dans un rapport.", "Les officiers imposent ensemble le vote et s’engagent à l’exécuter. La chaîne de commandement, les détentions et la protection civile changent durablement."], mixed: "L’état-major adopte des recommandations sans mécanisme d’application. Un précédent existe, mais la Marine n’est pas encore durablement réformée.", failure: "Les preuves sont isolées de la crise et l’ordre général est rejeté. Quelques responsables tombent sans que l’institution change." },
      [{ bounty: 80000, charisma: 32 }, { intelligence: 52 }, { charisma: 40, bounty: 80000 }],
    ),
    "greatest-marine-hero": finalDreamScene(
      "Le rempart des cent mille vies",
      "Une île du Nouveau Monde s’effondre sous une attaque et une catastrophe maritime. L’ordre officiel privilégie la victoire navale, mais cent mille civils et des unités encerclées n’ont qu’un corridor ; vaincre sans les sauver ne ferait de personne un héros.",
      "Tenir seul l’entrée du corridor pendant l’évacuation",
      "Transformer toute l’opération militaire en sauvetage",
      "Conduire soldats et civils contre l’ordre d’abandon",
      "heroism",
      { success: ["Ta défense tient la ligne jusqu’au passage du dernier convoi. Cent mille vies sont sauvées et soldats comme civils te donnent le titre de Héros de la Marine.", "La flotte ennemie devient l’écran involontaire d’une évacuation totale. Ta victoire se mesure aux survivants, et la Marine reconnaît publiquement son plus grand héros.", "Les unités te suivent malgré l’ordre discutable et aucun quartier n’est abandonné. Les témoignages traversent toutes les mers : ton acte de protection devient une légende propre, sans copier celle de Garp."], mixed: "La majorité des civils échappe au désastre, mais plusieurs unités sont abandonnées et la vérité reste étouffée. L’acte est grand sans devenir le symbole espéré.", failure: "Le corridor cède avant la fin de l’évacuation. Tu survis avec des rescapés, mais trop de vies sont perdues pour appeler cette journée un accomplissement." },
      [{ haki: 20, health: 48 }, { combat: 46, haki: 18 }, { health: 50, crew: 2 }],
    ),
  });

  const BOSS_DREAM_PROFILES = Object.freeze([
    { id: "one-piece", faction: "pirate", label: "la route du One Piece", organization: "les équipages du Nouveau Monde", trials: [
      bossTrial("Le relevé impossible", "Un fragment de route vers un Road Ponéglyphe divise plusieurs équipages.", "Forcer le passage jusqu’au relevé", "Comparer les routes gravées sur le fragment", "Obtenir des capitaines qu’ils partagent leurs cartes", "navigation"),
      bossTrial("La nouvelle de Morgans", "Morgans possède une piste capitale, mais veut transformer l’expédition en spectacle mondial.", "Saisir l’Escargophone avant la diffusion", "Distinguer la véritable piste de son récit", "Négocier une publication qui protège l’équipage", "information", ["Morgans"]),
      bossTrial("Le prix du dernier cap", "Une voie sûre exige d’abandonner des alliés poursuivis par le Gouvernement mondial.", "Couvrir leur fuite malgré la flotte", "Tracer une route qui sauve les deux objectifs", "Convaincre les alliés de naviguer sous un même plan", "moral"),
    ]},
    { id: "sea-emperor", faction: "pirate", label: "la naissance d’une puissance pirate", organization: "les flottes d’Empereurs", trials: [
      bossTrial("Le territoire sans pavillon", "Une île cherche une protection sans devenir la propriété d’un nouveau maître.", "Briser le blocus qui encercle l’île", "Retourner les routes de ravitaillement du blocus", "Faire reconnaître un pacte libre par les habitants", "politics"),
      bossTrial("La flotte de papier", "Buggy fait diffuser une alliance fictive assez crédible pour provoquer une guerre.", "Démanteler la flotte qui exploite la rumeur", "Prouver comment les affiches ont été falsifiées", "Retourner la mise en scène de Buggy contre les faussaires", "information", ["Buggy"]),
      bossTrial("Le tribut du Nouveau Monde", "Un commandant d’Empereur exige un tribut qui condamnerait plusieurs ports.", "Tenir le port face à son avant-garde", "Couper le tribut à sa source logistique", "Rallier les ports à une défense commune", "war"),
    ]},
    { id: "worlds-greatest-fortune", faction: "pirate", label: "la plus grande fortune du monde", organization: "le monde souterrain", trials: [
      bossTrial("La cargaison aux doubles sceaux", "Une cargaison historique appartient sur le papier à trois puissances concurrentes.", "Prendre le contrôle du convoi", "Démontrer lequel des actes de propriété est faux", "Vendre un partage qui évite une guerre", "commerce"),
      bossTrial("Les comptes de Crocodile", "D’anciens registres de Baroque Works révèlent un trésor et les dettes qui le protègent.", "Traverser les mercenaires jusqu’aux coffres", "Déchiffrer le système de sociétés-écrans", "Négocier avec les créanciers du réseau", "investigation", ["Crocodile"]),
      bossTrial("La fortune ou les naufragés", "Un trésor dérive vers un gouffre tandis qu’un convoi civil sombre à proximité.", "Sauver le convoi avant de récupérer les coffres", "Utiliser les courants pour atteindre les deux", "Payer les sauveteurs et coordonner l’évacuation", "rescue"),
    ]},
    { id: "forgotten-history", faction: "pirate", label: "l’Histoire oubliée", organization: "Cipher Pol", trials: [
      bossTrial("La pierre sous les canons", "Un relevé de Ponéglyphe est pris entre une fouille clandestine et une opération de Cipher Pol.", "Protéger les archéologues pendant l’extraction", "Reconstituer le relevé avant sa destruction", "Convaincre les témoins d’en préserver plusieurs copies", "history"),
      bossTrial("L’écho d’Ohara", "Des notes sauvées d’Ohara contredisent une archive officielle gardée par le Gouvernement mondial.", "Extraire les archives avant leur incendie", "Comparer les deux versions ligne par ligne", "Organiser la fuite des archivistes", "investigation"),
      bossTrial("La vérité incomplète", "Une révélation immédiate sauverait une source mais condamnerait tout son réseau.", "Tenir l’émetteur contre les agents", "Retirer les éléments qui exposent la source", "Obtenir des presses qu’elles vérifient avant de publier", "moral"),
    ]},
    { id: "greatest-bounty-hunter", faction: "bounty-hunter", label: "la légende des chasseurs", organization: "Cross Guild", trials: [
      bossTrial("La cible aux trois contrats", "Trois affiches réclament la même cible vivante pour des raisons incompatibles.", "Capturer la cible avant les concurrents", "Identifier le contrat authentique", "Imposer un jugement indépendant aux commanditaires", "hunt"),
      bossTrial("Le tableau de Cross Guild", "Cross Guild publie une prime sur les chasseurs qui refusent ses contrats.", "Traverser les chasseurs retournés", "Remonter la chaîne de publication", "Convaincre les indépendants de rompre le marché", "investigation"),
      bossTrial("Le reçu du siècle", "Une capture irréprochable peut définir la profession pour toute une génération.", "Achever la chasse devant les témoins", "Préparer une arrestation sans victime", "Faire reconnaître les preuves par tous les camps", "legacy"),
    ]},
    { id: "most-dangerous-criminals", faction: "bounty-hunter", label: "la chasse aux criminels les plus dangereux", organization: "les réseaux criminels", trials: [
      bossTrial("La prison flottante", "Une cible transforme les prisonniers de son navire en boucliers humains.", "Ouvrir une brèche jusqu’aux cellules", "Neutraliser les verrous sans alerter la cible", "Retourner les gardes contre leur capitaine", "rescue"),
      bossTrial("L’affiche sans visage", "Un criminel change d’identité dans chaque port grâce à un réseau de faux témoins.", "Fermer toutes les sorties du port", "Recouper les signatures des fausses dépositions", "Convaincre un témoin de rompre le silence", "investigation"),
      bossTrial("La remise interdite", "Le Gouvernement réclame une cible que ses propres agents veulent faire disparaître.", "Protéger la cible jusqu’au tribunal", "Copier ses preuves avant la remise", "Obtenir une audience publique", "politics"),
    ]},
    { id: "hunt-an-emperor", faction: "bounty-hunter", label: "la traque d’une puissance impériale", organization: "les flottes d’Empereurs", trials: [
      bossTrial("La piste sous le pavillon", "Un officier d’Empereur supervise une route de contrebande protégée par une flotte entière.", "Capturer l’officier pendant le transfert", "Isoler son navire du reste de la flotte", "Retourner les ports soumis à son tribut", "hunt"),
      bossTrial("Le banquet de la fausse victoire", "Une invitation promet une cible impériale, mais chaque table dissimule un piège.", "Briser l’encerclement du banquet", "Identifier le véritable objectif de l’invitation", "Faire basculer les équipages invités", "infiltration"),
      bossTrial("Trois secondes devant l’Empereur", "La puissance impériale arrive elle-même ; la victoire consiste à sauver la cible et repartir vivant.", "Retenir l’avant-garde le temps de l’extraction", "Masquer toute intention hostile jusqu’au départ", "Négocier la vie des civils pris entre les camps", "survival"),
    ]},
    { id: "contract-fortune", faction: "bounty-hunter", label: "la fortune des grands contrats", organization: "les courtiers du monde souterrain", trials: [
      bossTrial("Le contrat qui paie deux fois", "Un courtier vend la même capture à la Marine et au monde souterrain.", "Saisir la cible et les deux paiements", "Exposer les clauses contradictoires", "Forcer les commanditaires à garantir la remise", "commerce"),
      bossTrial("La prime en Fruit du Démon", "Un Fruit du Démon promis en paiement attire des propriétaires successifs.", "Sécuriser la caisse jusqu’à la remise", "Authentifier le Fruit et son origine", "Négocier un paiement qui ne divise pas les chasseurs", "commerce"),
      bossTrial("Le dernier acompte", "Le contrat le plus rentable exige de livrer un innocent avec la véritable cible.", "Retourner la chasse contre les agents du client", "Réunir les preuves de la clause criminelle", "Convaincre les chasseurs de renoncer à l’acompte", "moral"),
    ]},
    { id: "break-the-chains", faction: "revolutionary", label: "la fin des chaînes", organization: "les réseaux esclavagistes", trials: [
      bossTrial("Les cales sans registre", "Un convoi transporte des captifs que le Gouvernement a effacés des registres.", "Libérer toutes les cales sous le feu", "Saboter les verrous et les communications", "Retourner les marins contre les trafiquants", "liberation"),
      bossTrial("Le cortège du Noble Mondial", "Un Noble Mondial traverse la zone avec des esclaves et une escorte intouchable.", "Extraire les captifs sans viser le Noble", "Créer une panne qui sépare l’escorte", "Mobiliser les témoins autour de la fuite", "rescue"),
      bossTrial("La nuit des ventes", "Plusieurs marchés d’esclaves ouvrent au même instant pour disperser les révolutionnaires.", "Frapper le centre de commandement", "Coordonner la libération des sites à distance", "Donner aux captifs le signal du soulèvement", "war"),
    ]},
    { id: "reveal-void-century", faction: "revolutionary", label: "la révélation du Siècle oublié", organization: "Cipher Pol", trials: [
      bossTrial("Les plaques interdites", "Des fragments de Ponéglyphes doivent franchir un barrage de Cipher Pol.", "Couvrir le passage des porteurs", "Répartir les fragments entre plusieurs routes", "Convaincre des savants de certifier les copies", "history"),
      bossTrial("La fréquence de Robin", "Un message indirect de Robin permet de vérifier une traduction avant sa destruction.", "Défendre l’Escargophone jusqu’au dernier mot", "Comparer la traduction avec les archives saisies", "Organiser des témoins indépendants", "information", ["Nico Robin"]),
      bossTrial("Le monde doit-il savoir", "La preuve est réelle, mais sa diffusion immédiate condamnerait plusieurs îles.", "Maintenir les presses malgré l’assaut", "Fractionner la révélation pour protéger les sources", "Obtenir l’accord des peuples exposés", "moral"),
    ]},
    { id: "build-underground-network", faction: "revolutionary", label: "le réseau clandestin mondial", organization: "l’Armée révolutionnaire", trials: [
      bossTrial("La cellule compromise", "Cipher Pol connaît un relais mais ignore encore les autres.", "Extraire tous les agents avant l’assaut", "Nourrir l’ennemi avec un faux réseau", "Convaincre les cellules de changer leurs codes", "infiltration"),
      bossTrial("Les cartes de Koala", "Koala transmet des routes qui ne fonctionnent que si chaque cellule accepte de perdre son autonomie.", "Protéger les courriers pendant la convergence", "Créer un protocole sans centre unique", "Obtenir un accord entre les responsables", "network", ["Koala"]),
      bossTrial("Le signal de Sabo", "Une opération mondiale attend un signal que l’ennemi peut désormais imiter.", "Tenir l’émetteur contre l’attaque", "Authentifier le signal par plusieurs preuves", "Rallier les cellules malgré le doute", "war", ["Sabo"]),
    ]},
    { id: "found-free-nation", faction: "revolutionary", label: "la fondation d’une nation libre", organization: "le Gouvernement mondial", trials: [
      bossTrial("Le conseil sans trône", "Les factions libérées refusent de reconnaître une autorité commune.", "Protéger le conseil contre le coup d’État", "Écrire des institutions qui limitent chaque camp", "Faire accepter une transition civile", "politics"),
      bossTrial("Le blocus de reconnaissance", "Le Gouvernement affame le nouveau territoire avant même sa proclamation.", "Briser le blocus maritime", "Organiser des routes de ravitaillement invisibles", "Rallier des ports à la reconnaissance du territoire", "war"),
      bossTrial("La première loi", "La population exige une vengeance qui reproduirait les crimes de l’ancien régime.", "Empêcher les exécutions dans la rue", "Établir un procès indépendant", "Convaincre les victimes de défendre une justice libre", "moral"),
    ]},
    { id: "admiral", faction: "marine", label: "l’accession au rang d’Amiral", organization: "la Marine", trials: [
      bossTrial("La ligne de l’Amiral", "Une flotte pirate menace un corridor civil que la hiérarchie refuse d’évacuer.", "Tenir le corridor jusqu’au dernier navire", "Diviser la flotte sans bataille frontale", "Rallier les unités à une évacuation commune", "war"),
      bossTrial("Le sabre de Tashigi", "Tashigi découvre que des armes saisies ont été revendues par des officiers.", "Arrêter les responsables dans leur propre base", "Retracer chaque arme jusqu’au registre", "Convaincre les soldats de témoigner", "investigation", ["Tashigi"]),
      bossTrial("La décision de Fujitora", "Fujitora refuse de couvrir une victoire obtenue au prix des civils.", "Protéger la population contre l’ordre reçu", "Prouver qu’une autre opération reste possible", "Assumer publiquement la responsabilité", "justice", ["Fujitora"]),
    ]},
    { id: "fleet-admiral", faction: "marine", label: "le commandement suprême de la Marine", organization: "la hiérarchie de la Marine", trials: [
      bossTrial("Les trois ordres contradictoires", "Trois états-majors donnent des priorités incompatibles pendant une crise mondiale.", "Prendre le commandement des flottes", "Établir quel ordre protège réellement les civils", "Obtenir l’adhésion des vice-amiraux", "command"),
      bossTrial("Le rapport que Sakazuki attend", "Sakazuki exige une victoire immédiate malgré les pertes annoncées.", "Achever l’opération avant l’effondrement", "Présenter un plan plus efficace que l’assaut", "Défendre ton commandement devant l’état-major", "politics", ["Sakazuki"]),
      bossTrial("La Marine divisée", "Plusieurs bases menacent de rompre la chaîne de commandement.", "Empêcher les unités de s’affronter", "Isoler les ordres falsifiés", "Réunir les officiers autour d’une doctrine commune", "crisis"),
    ]},
    { id: "reform-the-marines", faction: "marine", label: "la réforme de la Marine", organization: "le Gouvernement mondial", trials: [
      bossTrial("La prison hors des rapports", "Une base détient des innocents pour améliorer artificiellement ses résultats.", "Ouvrir les cellules malgré la garnison", "Réunir les preuves administratives", "Convaincre les soldats de refuser les ordres", "justice"),
      bossTrial("Le témoignage de Koby", "Koby apporte la preuve d’un ordre illégal, mais sa publication briserait plusieurs unités.", "Protéger Koby pendant l’audience", "Démontrer la chaîne exacte des responsabilités", "Rallier les jeunes officiers à la réforme", "politics", ["Koby"]),
      bossTrial("La justice contre l’obéissance", "Le Gouvernement ordonne de sacrifier une île pour préserver un secret.", "Bloquer l’opération d’anéantissement", "Rendre le secret inutile avant l’attaque", "Faire voter les unités et les civils", "moral"),
    ]},
    { id: "greatest-marine-hero", faction: "marine", label: "la naissance d’un héros de la Marine", organization: "les populations protégées", trials: [
      bossTrial("Le port sous trois feux", "Pirates, trafiquants et soldats corrompus prennent une ville en étau.", "Ouvrir un corridor à travers les trois lignes", "Retourner les groupes les uns contre les autres", "Organiser la défense des habitants", "rescue"),
      bossTrial("L’héritage de Garp", "Garp observe une opération où sauver les innocents semble incompatible avec la victoire officielle.", "Choisir les civils et tenir la ligne", "Transformer le sauvetage en objectif tactique", "Inspirer les soldats à désobéir sans fuir", "heroism", ["Garp"]),
      bossTrial("Le héros sans médaille", "Le Gouvernement propose d’effacer les victimes en échange d’une reconnaissance mondiale.", "Refuser la cérémonie devant les caméras", "Faire parvenir les preuves à Morgans", "Donner la parole aux survivants", "moral", ["Morgans"]),
    ]},
  ]);

  function createDecisiveOutcome(id, result, effects, options = {}) {
    return {
      id, result, effects,
      outcomeTier: options.outcomeTier || null,
      weight: options.weight ?? 3,
      chance: options.chance ?? 1,
      fallback: Boolean(options.fallback),
      minimumStats: options.minimumStats || {},
      requiredTraits: options.requiredTraits || [],
      requiredFlags: options.requiredFlags || {},
      condition: typeof options.condition === "function" ? options.condition : null,
      requiresD: options.requiresD ?? null,
      dreamProgress: options.dreamProgress || 0,
      dreamProgressByDream: options.dreamProgressByDream || {},
      flags: options.flags || {},
      titles: options.titles || [],
      important: true,
    };
  }

  function getFinalResolutionWeights(requirements = {}, fallback = {}) {
    const supported = Object.keys(requirements)
      .map((stat) => stat === "bounty" ? "renown" : stat)
      .filter((stat) => ["health", "combat", "haki", "intelligence", "charisma", "renown"].includes(stat));
    if (!supported.length) return fallback;
    const weight = 1 / supported.length;
    return Object.fromEntries(supported.map((stat) => [stat, weight]));
  }

  function createBossEvent(profile, tier, variantIndex) {
    const stageMeta = getDecisiveStageMeta(tier);
    const meta = {
      ...stageMeta,
      popularity: tier === 3 ? 8 : tier === 2 ? 5 : 3,
    };
    // Chaque rang correspond désormais à une scène précise du rêve. Les trois
    // variantes ne peuvent plus faire apparaître une conclusion au premier rang.
    const trial = tier === 3 ? FINAL_DREAM_SCENES[profile.id] : profile.trials[tier - 1];
    const id = `boss-t${tier}-${profile.id}-v${variantIndex + 1}`;
    const scale = meta.gain;
    const dreamData = Object.values(window.GAME_DATA?.dreams || {})
      .flat()
      .find((dream) => dream.id === profile.id);
    const titleId = tier === 3 && dreamData?.ultimateId
      ? dreamData.ultimateId
      : `boss-${profile.id}-turning-point`;
    const dreamProgress = { [profile.id]: meta.dream };
    const finalSuccessFlags = tier === 3
      ? { bossFinalDreamCompleted: true, bossFinalDreamId: profile.id, [`bossDream_${profile.id}`]: true }
      : { [`bossTier${tier}_${profile.id}Advanced`]: true };
    const masteryFlags = tier === 3
      ? { bossFinalDreamPartial: true, [`bossDream_${profile.id}_partial`]: true }
      : finalSuccessFlags;
    const failureFlags = tier === 3
      ? { bossFinalDreamFailed: true }
      : { [`bossTier${tier}_${profile.id}Setback`]: true };
    const previousAdvanceFlag = tier > 1 ? `bossTier${tier - 1}_${profile.id}Advanced` : null;
    const previousSetbackFlag = tier > 1 ? `bossTier${tier - 1}_${profile.id}Setback` : null;
    const historyRequirements = tier === 3 || tier === 1 || variantIndex === 2
      ? {}
      : { [variantIndex === 0 ? previousAdvanceFlag : previousSetbackFlag]: true };
    const historyExclusions = tier < 3 && tier > 1 && variantIndex === 2
      ? [previousAdvanceFlag, previousSetbackFlag]
      : [];

    const directStat = ["navigation", "survival", "heroism"].includes(trial.type)
      ? "haki"
      : "combat";
    const decisiveCategory = /war|hunt|survival|liberation|rescue|navigation|heroism/.test(trial.type)
      ? "action"
      : "social";
    const organizationVerb = /^(?:les|des)\b/i.test(profile.organization) ? "doivent" : "doit";
    const sceneWitness = trial.loreCharacters.length
      ? `${trial.loreCharacters.join(" et ")} assiste à la façon dont la situation bascule. `
      : `${profile.organization} ${organizationVerb} réagir à la façon dont la situation bascule. `;
    const tierContext = {
      1: "Les premiers choix de ta carrière reviennent déjà peser sur cette crise.",
      2: "Tes alliances, tes dettes et ta réputation accumulées donnent à cette crise une portée nouvelle.",
      3: "Il n’existe désormais plus de détour entre cette crise et l’accomplissement de ton rêve.",
    }[tier];

    const approaches = decisiveCategory === "action"
      ? [
          { id: "decisive", text: trial.direct, stat: directStat, secondary: directStat === "haki" ? "combat" : "haki", tag: tier === 3 ? "Sans retour" : "Audace", weights: { health: 0.2, combat: 0.55, haki: 0.25 } },
          { id: "strategic", text: trial.strategy, stat: "haki", secondary: "combat", tag: "Anticipation", weights: { health: 0.15, combat: 0.25, haki: 0.6 } },
          { id: "rally", text: trial.social, stat: "health", secondary: "haki", tag: "Endurance", weights: { health: 0.55, combat: 0.15, haki: 0.3 } },
        ]
      : [
          { id: "decisive", text: trial.direct, stat: "bounty", secondary: "charisma", tag: tier === 3 ? "Sans retour" : "Autorité", weights: { charisma: 0.25, intelligence: 0.15, renown: 0.6 } },
          { id: "strategic", text: trial.strategy, stat: "intelligence", secondary: "bounty", tag: "Stratégie", weights: { charisma: 0.15, intelligence: 0.65, renown: 0.2 } },
          { id: "rally", text: trial.social, stat: "charisma", secondary: "intelligence", tag: "Leadership", weights: { charisma: 0.6, intelligence: 0.25, renown: 0.15 } },
        ];

    return createEvent({
      id,
      title: trial.title,
      description: `${trial.premise} À {zone}, ${profile.organization} ${organizationVerb} désormais prendre position. ${tierContext}`,
      eventType: EVENT_TYPES.DECISIVE,
      resolutionCategory: decisiveCategory,
      category: `decisive-stage-${tier}`,
      tags: ["decisive", `decisive-stage-${tier}`, profile.faction, profile.id, trial.type],
      paths: [profile.faction],
      zones: [],
      rarity: tier === 3 ? EVENT_RARITY.VERY_RARE : tier === 2 ? EVENT_RARITY.RARE : EVENT_RARITY.UNCOMMON,
      weight: 1,
      unique: true,
      important: true,
      highStakes: tier >= 2,
      decisiveStage: tier,
      dreamIds: [profile.id],
      requiredFlags: historyRequirements,
      forbiddenFlags: historyExclusions,
      loreCharacters: trial.loreCharacters,
      decisiveKind: trial.type,
      intro: tier === 3
        ? "Le rêve qui t’a conduit jusqu’ici est enfin à portée de main."
        : "Ton parcours t’a conduit jusqu’à un tournant impossible à éviter.",
      choices: approaches.map((approach) => {
        const masteryGain = approach.stat === "bounty" ? tier * 120000 : scale;
        const masteryThreshold = approach.stat === "bounty" ? meta.threshold * 25000 : meta.threshold;
        const setbackEffects = decisiveCategory === "action"
          ? { health: -(tier * 6 + 1), fortune: -(tier * 4000) }
          : approach.id === "strategic"
            ? { intelligence: -tier, fortune: -(tier * 12000) }
            : { charisma: -(tier + 1), bounty: -(tier * 10000) };
        const finalResults = tier === 3 ? trial.results : null;
        const finalRequirement = tier === 3 ? (trial.requirements?.[approaches.indexOf(approach)] || {}) : {};
        const resolutionWeights = tier === 3
          ? getFinalResolutionWeights(finalRequirement, approach.weights)
          : approach.weights;
        const setbackResult = finalResults?.failure || (decisiveCategory === "action"
          ? `À {zone}, la résistance adverse brise la manœuvre et te force à protéger la retraite.`
          : approach.id === "strategic"
            ? `À {zone}, une information falsifiée ruine le plan et les ressources engagées.`
            : `À {zone}, ton intervention divise les témoins et affaiblit ton autorité.`);
        return {
          id: `${id}-${approach.id}`,
          text: approach.text,
          choiceTag: approach.tag,
          resolutionWeights,
          outcomes: [
          createDecisiveOutcome(
            `${id}-${approach.id}-mastery`,
            finalResults?.mixed || `À {zone}, ton initiative atteint son objectif. ${sceneWitness}Une voie concrète s'ouvre vers ${profile.label}.`,
            { [approach.stat]: masteryGain, popularity: meta.popularity },
            {
              minimumStats: tier === 3 ? finalRequirement : { [approach.stat]: masteryThreshold },
              dreamProgressByDream: dreamProgress,
              flags: masteryFlags,
              titles: tier === 2 ? [titleId] : [],
              outcomeTier: tier === 3 ? "mixed" : "success",
              weight: 3,
              chance: { 1: 0.72, 2: 0.60, 3: 0.55 }[tier],
            },
          ),
          createDecisiveOutcome(
            `${id}-${approach.id}-exceptional`,
            finalResults?.success?.[approaches.indexOf(approach)] || `À {zone}, tu retournes la situation au moment décisif. ${sceneWitness}Cette avancée donne une force inattendue à ${profile.label}.`,
            { [approach.stat]: approach.stat === "bounty" ? masteryGain + 60000 : masteryGain + 3, [approach.secondary]: ["fortune", "bounty"].includes(approach.secondary) ? 30000 : 3, popularity: meta.popularity + 2 },
            {
              minimumStats: tier === 3 ? finalRequirement : { [approach.stat]: approach.stat === "bounty" ? masteryThreshold - 100000 : masteryThreshold - 6 },
              requiresD: variantIndex === 2 ? true : null,
              dreamProgressByDream: { [profile.id]: meta.dream + 2 },
              flags: finalSuccessFlags,
              titles: [titleId],
              outcomeTier: "success",
              weight: 1,
              chance: { 1: 0.18, 2: 0.18, 3: 0.18 }[tier],
            },
          ),
          createDecisiveOutcome(
            `${id}-${approach.id}-setback`,
            `${setbackResult} ${sceneWitness}${tier === 3 ? `Le rêve de ${profile.label} reste hors d'atteinte.` : `La piste vers ${profile.label} se referme pour l'instant.`}`,
            setbackEffects,
            {
              fallback: true,
              dreamProgressByDream: { [profile.id]: tier === 3 ? -3 : 0 },
              flags: failureFlags,
              outcomeTier: "failure",
              weight: tier === 1 ? 2 : 3,
            },
          ),
          ],
        };
      }),
    });
  }

  const HAKI_TITLE_IDS = Object.freeze({
    observation: "haki-observation",
    armament: "haki-armement",
    kings: "haki-des-rois",
    kingsMastery: "maitrise-haki-des-rois-plus",
  });

  const HAKI_DECISIVE_SCENES = Object.freeze({
    pirate: Object.freeze({
      stage1: Object.freeze({
        id: "haki-awakening-pirate",
        title: "Le regard de Crocus",
        description: "À {zone}, Laboon percute la passe au moment où des pillards tentent de monter à bord. Crocus refuse d’abandonner la baleine ou ton navire : sous son regard d’ancien compagnon de Roger, l’urgence pousse tes sens, ta garde et ta volonté au-delà de leur limite.",
        introDialogue: { speaker: "Crocus", role: "Gardien du phare de Reverse Mountain", text: "Laboon ne déviera pas, et ces pillards comptent sur ta panique. Je vais protéger la baleine ; montre-moi ce que ta volonté protège, elle." },
        loreCharacters: ["Crocus"],
        choices: ["Lire le prochain mouvement de Laboon et des pillards", "Faire de ton corps le rempart du pont", "Briser l’élan des assaillants par ta seule volonté"],
      }),
      stage2: Object.freeze({
        id: "haki-confrontation-pirate",
        title: "Sous le regard des grands noms",
        introDialogue: { zoneVariants: {
          "starless-sea": { speaker: "Kizaru", role: "Amiral", text: "Oooh… tu tiens encore debout ? Alors essaie donc d’ouvrir une route avant que ma lumière ne referme toute cette mer." },
          "wandering-archipelago": { speaker: "Trafalgar Law", role: "Capitaine du Heart", text: "Ta volonté impressionne peut-être ton équipage. Ici, elle devra maintenir deux îles séparées assez longtemps pour sauver les deux nôtres." },
          "tempest-isle": { speaker: "Eustass Kid", role: "Capitaine du Kid", text: "Tch… si ton pavillon plie devant cet orage, il n’avait rien à faire sur ma route. Fais bouger cette ferraille avec ta volonté ou dégage !" }
        }, default: { speaker: "Shanks le Roux", role: "Empereur", text: "Une volonté qui écrase les autres ne suffit pas. Montre-moi si la tienne peut ouvrir une route sans sacrifier ceux qui la suivent." } },
        loreCharacters: ["Borsalino", "Trafalgar Law", "Eustass Kid", "Shanks"],
        description: "Près de {zone}, une figure dont le nom résonne sur toutes les mers verrouille le passage et impose une pression qui couche les moins aguerris. La vaincre seul est irréaliste ; les tiens attendent de voir si ta volonté peut néanmoins leur ouvrir une route.",
        choices: ["Protéger le pont jusqu’au passage du dernier allié", "Frapper le navire qui transmet les ordres", "Avancer seul et refuser le tribut"],
      }),
    }),
    marine: Object.freeze({
      stage1: Object.freeze({
        id: "haki-awakening-marine",
        title: "La fumée dans la passe",
        introDialogue: { speaker: "Smoker", role: "Chasseur Blanc", text: "Le convoi passe avant la capture. Je retiens leur navire avec ma fumée ; trouve l’ouverture que leurs canons n’ont pas encore montrée." },
        loreCharacters: ["Smoker"],
        description: "À {zone}, la poursuite menée par Smoker tourne au sauvetage lorsqu’un convoi civil dérive entre les tirs des pirates. Sa fumée retient l’avant-garde, mais ton unité doit découvrir en quelques secondes comment protéger les embarcations.",
        choices: ["Anticiper la prochaine salve et déplacer le convoi", "Recevoir l’impact devant les embarcations", "Rappeler toute la ligne à son devoir"],
      }),
      stage2: Object.freeze({
        id: "haki-confrontation-marine",
        title: "La justice des grandes puissances",
        introDialogue: { zoneVariants: {
          "starless-sea": { speaker: "Kizaru", role: "Amiral", text: "Le quartier ou le bâtiment officiel… voilà un choix bien effrayant. Tu voulais commander ? Décide avant que la lumière n’arrive." },
          "wandering-archipelago": { speaker: "Fujitora", role: "Amiral", text: "Un ordre qui détourne les yeux des civils mérite d’être pesé. Je retiendrai les îles ; à vous d’assumer la justice qui restera." },
          "tempest-isle": { speaker: "Smoker", role: "Vice-amiral", text: "Le quartier n’est pas une ligne à rayer d’un rapport. Je prends l’avant-garde ; change cet ordre si tu as le courage de le porter." }
        }, default: { speaker: "Garp", role: "Héros de la Marine", text: "Bwahaha ! Un ordre absurde reste absurde avec de beaux galons. Sauve les gens, et assume le reste devant moi." } },
        loreCharacters: ["Borsalino", "Issho", "Smoker", "Garp"],
        description: "Aux abords de {zone}, un ordre gouvernemental exige d’abandonner un quartier pour préserver un bâtiment officiel. Une présence écrasante accompagne l’assaut ennemi ; tes soldats hésitent entre la chaîne de commandement et les civils restés derrière.",
        choices: ["Tenir le corridor autour des civils", "Prendre l’initiative contre l’avant-garde", "Imposer un nouvel ordre à toute l’unité"],
      }),
    }),
    "bounty-hunter": Object.freeze({
      stage1: Object.freeze({
        id: "haki-awakening-bounty-hunter",
        title: "La bombe de Mr. 5",
        introDialogue: { speaker: "Mr. 5", role: "Agent de Baroque Works", text: "Tu as suivi la prime jusqu’au bout de la route ? Parfait. Une seule de mes explosions est réelle… mais elle suffira à effacer ton contrat." },
        loreCharacters: ["Mr. 5"],
        description: "À {zone}, Mr. 5 transforme le relief en piège et mêle ses hommes à une succession d’explosions factices. Le contrat n’exige pas un duel glorieux : il faut lire son intention, survivre à l’impact ou briser l’assurance de sa bande.",
        choices: ["Attendre le seul mouvement qui ne ment pas", "Fermer la garde et absorber sa charge", "Faire déposer les armes à toute sa bande"],
      }),
      stage2: Object.freeze({
        id: "haki-confrontation-bounty-hunter",
        title: "La chasse des monstres",
        introDialogue: { zoneVariants: {
          "starless-sea": { speaker: "Basil Hawkins", role: "Supernova", text: "Tes chances de conserver la cible après mon attaque sont de huit pour cent. Celles de t’éveiller à une volonté nouvelle restent… impossibles à chiffrer." },
          "wandering-archipelago": { speaker: "Dracule Mihawk", role: "Œil de Faucon", text: "La prime ne m’intéresse pas. Je veux savoir si ta volonté demeure lorsque la cible, les preuves et ta propre survie exigent trois décisions différentes." },
          "tempest-isle": { speaker: "Killer", role: "Massacreur", text: "Le contrat vise l’un des nôtres. Protège tes preuves si tu y crois vraiment : je ne retiendrai pas mes lames une seconde fois." }
        }, default: { speaker: "Crocodile", role: "Ancien Corsaire", text: "Un chasseur sans volonté n’est qu’un employé armé. Voyons ce que vaut la tienne quand le contrat cesse de te protéger." } },
        loreCharacters: ["Basil Hawkins", "Dracule Mihawk", "Killer", "Crocodile"],
        description: "Près de {zone}, une cible bien plus dangereuse retourne les autres chasseurs contre toi puis libère une pression qui fige les équipages. La capture n’est plus le seul enjeu : preuves, survivants et réputation peuvent disparaître ensemble.",
        choices: ["Couvrir les chasseurs pris dans la pression", "Arracher la preuve au navire de la cible", "Réclamer seul le droit de poursuivre le contrat"],
      }),
    }),
    revolutionary: Object.freeze({
      stage1: Object.freeze({
        id: "haki-awakening-revolutionary",
        title: "Le dernier signal de Koala",
        introDialogue: { speaker: "Koala", role: "Armée révolutionnaire", text: "Les relais sont coupés et les familles se dispersent. Je prends les agents du Gouvernement ; toi, deviens le signal qu’elles peuvent encore suivre." },
        loreCharacters: ["Koala"],
        description: "À {zone}, Koala dirige l’évacuation de familles traquées lorsqu’une unité gouvernementale brouille tous les signaux. Séparée de son groupe par l’assaut, elle te confie l’extraction : instinct, garde ou volonté décideront de son issue.",
        choices: ["Lire les patrouilles dans leurs angles morts", "Protéger la sortie jusqu’au dernier passage", "Faire reculer l’unité par un refus sans appel"],
      }),
      stage2: Object.freeze({
        id: "haki-confrontation-revolutionary",
        title: "La volonté des commandants",
        introDialogue: { zoneVariants: {
          "starless-sea": { speaker: "Karasu", role: "Commandant révolutionnaire", text: "Mes corbeaux ne peuvent porter les évacués. Tiens sous cette pression, et je disperserai le réseau avant que le Gouvernement ne le voie." },
          "wandering-archipelago": { speaker: "Morley", role: "Commandante révolutionnaire", text: "Je peux ouvrir la terre, pas décider à ta place ! Impose une route à cette peur, et je ferai passer chaque cellule." },
          "tempest-isle": { speaker: "Sabo", role: "Chef d’état-major", text: "La pression ennemie veut nous figer avant l’assaut. Je retiens leur chef ; montre aux cellules qu’une volonté peut encore les remettre debout." }
        }, default: { speaker: "Dragon", role: "Chef de l’Armée révolutionnaire", text: "Un réseau ne survit pas grâce à un seul chef. Donne à chacun la volonté de tenir lorsque plus aucun ordre ne peut l’atteindre." } },
        loreCharacters: ["Karasu", "Morley", "Sabo", "Dragon"],
        description: "Aux abords de {zone}, une force gouvernementale encercle un relais qui protège plusieurs cellules. Sa pression étouffe toute tentative de sortie. Détruire l’ennemi est irréaliste ; préserver le réseau exige de tenir, surprendre ou imposer une volonté collective.",
        choices: ["Former un rempart autour des évacués", "Ouvrir une brèche dans le dispositif", "Donner aux cellules un ordre que la peur ne couvre pas"],
      }),
    }),
  });

  function hasRunTitle(game, titleId) {
    return Boolean(game?.runTitles?.some((title) => (title?.id || title) === titleId));
  }

  function createHakiStageOneChoice(eventId, path, choiceIndex, text) {
    const routes = [
      {
        id: "perception", tag: "Anticipation",
        weights: { health: 0.15, combat: 0.10, haki: 0.45, intelligence: 0.30 },
        title: HAKI_TITLE_IDS.observation,
        success: "Tu perçois l’intention hostile avant le mouvement et guides les tiens à travers l’unique ouverture.",
        mixed: "Tu cherches à lire l’intention hostile, mais le tumulte brouille encore tes sens. Aucun nouvel éveil ne répond à l’urgence.",
        failure: "Les intentions se confondent avec le chaos. Tu sauves l’essentiel, au prix d’une retraite éprouvante.",
        reward: { intelligence: 2, bounty: 160000 }, penalty: { health: -4, popularity: -1 },
      },
      {
        id: "guard", tag: "Garde",
        weights: { health: 0.30, combat: 0.30, haki: 0.40 },
        title: HAKI_TITLE_IDS.armament,
        success: "Ta garde se durcit au point d’arrêter l’impact et maintient tous ceux qui comptent hors de portée.",
        mixed: "Tu tiens aussi longtemps que possible, mais ta garde finit par céder. Aucune force nouvelle ne s’éveille dans l’impact.",
        failure: "L’impact traverse ta garde. La mission continue, mais chaque mouvement rappelle le prix payé.",
        reward: { combat: 2, bounty: 170000 }, penalty: { health: -6, haki: -2 },
      },
      {
        id: "sovereign", tag: "Volonté",
        weights: { health: 0.10, combat: 0.10, haki: 0.10, charisma: 0.50, renown: 0.20 },
        title: HAKI_TITLE_IDS.kings,
        success: "Une onde de volonté fait vaciller les plus faibles. Ceux qui restent debout comprennent qu’ils ne pourront pas t’imposer leur loi.",
        noTitle: "Ta voix traverse la peur et rassemble les tiens, mais aucune puissance souveraine ne répond encore à ton refus.",
        failure: "Ta volonté rencontre une pression plus vaste qu’elle. Le silence qui suit n’accorde aucun éveil, seulement une leçon difficile.",
        reward: { charisma: 2, bounty: 230000 }, penalty: { health: -3, charisma: -2, popularity: -1 },
      },
    ];
    const route = routes[choiceIndex];
    const commonFlags = {
      completedDecisiveStage1: true,
      hakiAwakeningAttempted: true,
      conquerorsHakiAwakenedAtFirstDecisive: false,
    };
    const outcomes = route.id === "sovereign"
      ? [
          createDecisiveOutcome(`${eventId}-${route.id}-awakened`, route.success, route.reward, { outcomeTier: "success", weight: 1, chance: 1, titles: [route.title], flags: { ...commonFlags, awakenedHakiKings: true, firstDecisiveHakiType: "conquerors", conquerorsHakiAwakenedAtFirstDecisive: true } }),
          createDecisiveOutcome(`${eventId}-${route.id}-uncertain`, route.noTitle, { health: -2, charisma: -1 }, { outcomeTier: "mixed", flags: { ...commonFlags, firstDecisiveHakiType: "none", resistedKingsAwakening: true } }),
          createDecisiveOutcome(`${eventId}-${route.id}-failed`, route.failure, route.penalty, { outcomeTier: "failure", fallback: true, flags: { ...commonFlags, firstDecisiveHakiType: "none", failedKingsAwakening: true } }),
        ]
      : [
          createDecisiveOutcome(`${eventId}-${route.id}-awakened`, route.success, route.reward, { outcomeTier: "success", titles: [route.title], flags: { ...commonFlags, firstDecisiveHakiType: route.id === "perception" ? "observation" : "armament", [`awakened_${route.title}`]: true } }),
          createDecisiveOutcome(`${eventId}-${route.id}-emerging`, route.mixed, { health: -2, haki: -1 }, { outcomeTier: "mixed", flags: { ...commonFlags, firstDecisiveHakiType: "none", hakiAwakeningSetback: true } }),
          createDecisiveOutcome(`${eventId}-${route.id}-failed`, route.failure, route.penalty, { outcomeTier: "failure", fallback: true, flags: { ...commonFlags, firstDecisiveHakiType: "none", hakiAwakeningSetback: true } }),
        ];
    return { id: `${eventId}-${route.id}`, text, choiceTag: route.tag, resolutionWeights: route.weights, outcomes };
  }

  function createHakiStageTwoChoice(eventId, choiceIndex, text) {
    const routes = [
      { id: "protect", tag: "Protection", weights: { health: 0.32, combat: 0.13, haki: 0.40, charisma: 0.15 }, penalty: { health: -7, haki: -3, popularity: -2 } },
      { id: "initiative", tag: "Initiative", weights: { health: 0.15, combat: 0.45, haki: 0.30, charisma: 0.10 }, penalty: { health: -6, combat: -4, bounty: -80000 } },
      { id: "command", tag: "Volonté", weights: { health: 0.10, combat: 0.10, haki: 0.25, charisma: 0.40, renown: 0.15 }, penalty: { charisma: -5, haki: -3, popularity: -3 } },
    ];
    const route = routes[choiceIndex];
    const completed = { completedDecisiveStage2: true, hakiConfrontationResolved: true };
    return {
      id: `${eventId}-${route.id}`, text, choiceTag: route.tag, resolutionWeights: route.weights,
      outcomes: [
        createDecisiveOutcome(`${eventId}-${route.id}-mastery`, "Ta volonté souveraine cesse d’être un éclat incontrôlé : elle traverse la confrontation avec précision et protège ceux que tu as choisis.", { health: 1, combat: 1, haki: 1, charisma: 1, bounty: 520000 }, { outcomeTier: "success", titles: [HAKI_TITLE_IDS.kingsMastery], flags: { ...completed, masteredHakiKings: true }, condition: ({ game }) => game?.flags?.firstDecisiveHakiType === "conquerors" && game?.flags?.secondDecisiveHakiBranch === "mastery" }),
        createDecisiveOutcome(`${eventId}-${route.id}-awakened`, "Face à la pression, ton Haki des Rois s’éveille pour la première fois : une onde renverse les plus faibles et ouvre la voie sans prétendre vaincre la puissance adverse.", { charisma: 3, haki: 2, bounty: 420000 }, { outcomeTier: "success", titles: [HAKI_TITLE_IDS.kings], flags: { ...completed, awakenedHakiKings: true, conquerorsHakiAwakenedAtSecondDecisive: true }, condition: ({ game }) => ["observation", "armament", "none"].includes(game?.flags?.firstDecisiveHakiType) && game?.flags?.secondDecisiveHakiBranch === "base-conquerors" }),
        createDecisiveOutcome(`${eventId}-${route.id}-resisted`, "Tu empêches la confrontation de devenir un désastre immédiat, mais la pression adverse étouffe ta tentative. Aucun nouvel éveil ne répond cette fois-ci.", { haki: -1 }, { outcomeTier: "mixed", flags: { ...completed, resistedHakiConfrontation: true } }),
        createDecisiveOutcome(`${eventId}-${route.id}-failed`, "La pression brise ta tentative et force une retraite coûteuse. La volonté déjà acquise demeure, mais cette confrontation laisse une marque réelle.", route.penalty, { outcomeTier: "failure", fallback: true, flags: { ...completed, hakiConfrontationSetback: true } }),
      ],
    };
  }

  function createHakiDecisiveEvent(faction, stage) {
    const scene = HAKI_DECISIVE_SCENES[faction][`stage${stage}`];
    const dreamIds = (window.GAME_DATA?.dreams?.[faction] || []).map((dream) => dream.id);
    return createEvent({
      id: scene.id,
      title: scene.title,
      description: scene.description,
      eventType: EVENT_TYPES.DECISIVE,
      resolutionCategory: "action",
      category: `decisive-stage-${stage}`,
      tags: ["decisive", `decisive-stage-${stage}`, faction, "haki-awakening"],
      paths: [faction], zones: [], rarity: stage === 1 ? EVENT_RARITY.UNCOMMON : EVENT_RARITY.RARE,
      weight: 1, unique: true, important: true, highStakes: stage === 2,
      decisiveStage: stage, dreamIds,
      requiredFlags: stage === 2 ? { completedDecisiveStage1: true } : {},
      loreCharacters: scene.loreCharacters || [], decisiveKind: stage === 1 ? "awakening" : "will-confrontation",
      intro: stage === 1 ? "Une faculté encore inconnue cherche sa forme dans l’urgence." : "La pression adverse met ta volonté personnelle à l’épreuve.",
      introDialogue: scene.introDialogue,
      choices: scene.choices.map((text, index) => stage === 1
        ? createHakiStageOneChoice(scene.id, faction, index, text)
        : createHakiStageTwoChoice(scene.id, index, text)),
    });
  }

  const HAKI_DECISIVE_EVENTS = Object.freeze(
    ["pirate", "marine", "bounty-hunter", "revolutionary"].flatMap((faction) => [
      createHakiDecisiveEvent(faction, 1),
      createHakiDecisiveEvent(faction, 2),
    ]),
  );

  const BOSS_EVENTS = Object.freeze(
    [
      ...HAKI_DECISIVE_EVENTS,
      ...BOSS_DREAM_PROFILES.flatMap((profile) =>
        [0, 1, 2].map((variantIndex) => createBossEvent(profile, 3, variantIndex)),
      ),
    ],
  );

  function validateBossEvents(events) {
    const warnings = [];
    const ids = new Set();
    const dreamIds = new Set(BOSS_DREAM_PROFILES.map((profile) => profile.id));
    const officialCharacters = new Set([
      "Morgans", "Buggy", "Crocodile", "Nico Robin", "Koala", "Sabo",
      "Tashigi", "Fujitora", "Sakazuki", "Koby", "Garp",
      "Crocus", "Smoker", "Mr. 5", "Borsalino", "Trafalgar Law",
      "Eustass Kid", "Shanks", "Issho", "Basil Hawkins", "Dracule Mihawk",
      "Killer", "Karasu", "Morley", "Dragon",
    ]);
    const validFactions = new Set(["pirate", "bounty-hunter", "revolutionary", "marine"]);
    const knownTitles = new Set((window.SEA_OF_LEGENDS_TITLES || []).map((title) => title.id));
    BOSS_DREAM_PROFILES.forEach((profile) => {
      [1, 2, 3].forEach((tier) => {
        const variants = events.filter((event) =>
          event.decisiveStage === tier && event.dreamIds?.includes(profile.id));
        const expected = tier === 3 ? 3 : 1;
        if (variants.length !== expected) warnings.push(`${profile.id}/tier ${tier} : ${variants.length} variante(s), ${expected} attendue(s)`);
      });
    });
    events.forEach((event) => {
      const factions = event.factions || event.paths || [];
      if (ids.has(event.id)) warnings.push(`identifiant dupliqué : ${event.id}`);
      ids.add(event.id);
      if (event.eventType !== EVENT_TYPES.DECISIVE || ![1, 2, 3].includes(event.decisiveStage)) warnings.push(`métadonnées décisives invalides : ${event.id}`);
      if (!event.dreamIds?.every((id) => dreamIds.has(id))) warnings.push(`rêve invalide : ${event.id}`);
      if (!factions.length || !factions.every((id) => validFactions.has(id))) warnings.push(`faction invalide : ${event.id}`);
      if (!String(event.description || "").includes("{zone}")) warnings.push(`contexte de zone absent : ${event.id}`);
      if (event.eventType === EVENT_TYPES.DECISIVE && event.choices.length !== 3) {
        warnings.push(`nombre de choix décisifs invalide : ${event.id}/${event.choices.length}`);
      }
      event.choices.forEach((choice) => {
        if (!choice.outcomes.length || !choice.outcomes.some((outcome) => outcome.fallback)) warnings.push(`issues incomplètes : ${event.id}/${choice.id}`);
        choice.outcomes.forEach((outcome) => {
          if (!String(outcome.result || "").trim()) warnings.push(`résultat narratif absent : ${event.id}/${outcome.id}`);
          if (!outcome.fallback && !getBossDreamProgress(outcome, event.dreamIds[0])) warnings.push(`progression du rêve absente : ${event.id}/${outcome.id}`);
          if (knownTitles.size) {
            (outcome.titles || []).forEach((titleId) => {
              if (!knownTitles.has(titleId)) warnings.push(`Titre Boss inconnu : ${event.id}/${titleId}`);
            });
          }
        });
      });
      (event.loreCharacters || []).forEach((name) => {
        if (!officialCharacters.has(name)) warnings.push(`personnage non confirmé : ${event.id}/${name}`);
      });
      if (event.decisiveStage === 3) {
        const dreamId = event.dreamIds?.[0];
        if (!dreamId) warnings.push(`Conclusion décisive sans rêve : ${event.id}`);
        event.choices.forEach((choice) => {
          const completions = choice.outcomes.filter((outcome) => outcome.flags?.bossFinalDreamCompleted);
          if (completions.length !== 1) warnings.push(`réussite finale ambiguë : ${event.id}/${choice.id}`);
          completions.forEach((outcome) => {
            if (outcome.outcomeTier !== "success" || outcome.flags?.bossFinalDreamId !== dreamId) {
              warnings.push(`marqueur final incohérent : ${event.id}/${outcome.id}`);
            }
          });
          choice.outcomes.filter((outcome) => outcome.outcomeTier !== "success").forEach((outcome) => {
            if (outcome.flags?.bossFinalDreamCompleted || outcome.titles?.length) {
              warnings.push(`récompense ultime hors réussite : ${event.id}/${outcome.id}`);
            }
          });
        });
      }
    });
    if (warnings.length) console.warn("[Blue Legacy] Validation des Boss :", warnings);
  }

  function getBossDreamProgress(outcome, dreamId) {
    return Number(outcome?.dreamProgressByDream?.[dreamId]) || Number(outcome?.dreamProgress) || 0;
  }

  if (IS_DEVELOPMENT) {
    validateBossEvents(BOSS_EVENTS);
    window.setTimeout(() => validateBossEvents(BOSS_EVENTS), 0);
  }

  /* ========================================================
     ARCS LÉGENDAIRES
     Ces événements restent hors du tirage narratif ordinaire. Le moteur de
     partie les réserve et les enchaîne sans les insérer dans la route.
  ======================================================== */

  const LEGENDARY_ARC_STORIES = Object.freeze({
    talent: {
      pirate: [
        ["Le nom dans le journal", "À Paradise, Morgans vient personnellement vérifier si tes derniers exploits annoncent une nouvelle génération de pirates. Une patrouille veut saisir ses clichés et empêcher l’impression.", ["Défendre publiquement Morgans", "Faire parvenir ses clichés par une route secrète", "Attirer la patrouille loin de son ballon"]],
        ["L’épreuve du rookie", "Bellamy provoque ton pavillon devant un port entier pour vérifier si la réputation qui grandit repose sur autre chose que des rumeurs.", ["Accepter un affrontement bref et décisif", "Retourner ses hommes contre sa mise en scène", "Protéger le port avant de répondre à la provocation"]],
        ["Une affiche pour la génération suivante", "Morgans attend la preuve qui fera de ton nom celui d’une nouvelle Supernova, tandis que la Marine referme la baie.", ["Briser le blocus sous les regards", "Révéler les preuves des exploits accomplis", "Faire sortir tous les pavillons alliés ensemble"]],
      ],
      marine: [
        ["L’escadre sans commandant", "À Paradise, Smoker te confie une escadre dont l’officier supérieur vient d’être blessé. Pirates et civils sont pris dans la même tempête.", ["Prendre la tête de l’interception", "Organiser d’abord l’évacuation civile", "Diviser l’escadre en unités autonomes"]],
        ["La justice mise à l’épreuve", "Une opération ordonnée par le quartier général menace un village utilisé comme couverture. Tsuru observe la manière dont tu commanderas les renforts.", ["Modifier le plan sans abandonner l’objectif", "Tenir la ligne et ouvrir un corridor", "Présenter les preuves avant de lancer l’assaut"]],
        ["Les insignes du quartier général", "Garp assiste à la dernière opération : neutraliser une flotte sans sacrifier les recrues décidera de ta promotion.", ["Diriger l’abordage avec l’avant-garde", "Piéger la flotte loin des habitants", "Confier chaque front à l’officier le plus capable"]],
      ],
      revolutionary: [
        ["Le rapport destiné à Dragon", "À Paradise, Koala transmet à Dragon le récit de tes libérations. Une cellule compromise doit encore être évacuée avant que ce potentiel soit confirmé.", ["Prendre la tête de l’extraction", "Créer de faux itinéraires pour Cipher Pol", "Rallier les habitants à la protection de la cellule"]],
        ["La confiance de Sabo", "Sabo te confie plusieurs groupes qui ne se connaissent pas. Une garnison exploite leur méfiance pour encercler un village insurgé.", ["Unir les groupes dans une attaque commune", "Détruire le réseau de surveillance", "Évacuer les familles avant de fermer le piège"]],
        ["Sous l’autorité de Dragon", "Dragon attend ton rapport tandis qu’une dernière opération peut sauver tout un réseau sans remplacer aucun commandant historique.", ["Coordonner les cellules depuis le front", "Retourner les communications ennemies", "Préserver le réseau avant de revendiquer la victoire"]],
      ],
      "bounty-hunter": [
        ["Le contrat de Crocodile", "À Paradise, Crocodile révèle que trois contrats mènent au même réseau pirate. Il ne cherche pas un exécutant : il veut savoir si ton nom peut obliger des guildes rivales à suivre un seul plan.", ["Réunir les chasseurs sous un plan commun", "Suivre seul la piste la plus dangereuse", "Retourner les receleurs du réseau"]],
        ["Le grand bluff de Baggy", "Baggy prétend avoir déjà soumis le capitaine rookie qui rachète les ports témoins. Derrière sa mise en scène, une vraie piste traverse son réseau de mercenaires.", ["L’intercepter pendant le transfert", "Infiltrer son marché clandestin", "Protéger les témoins et couper sa retraite"]],
        ["Le jugement de Mihawk", "Mihawk attend la preuve de la chute du réseau. Il ne reconnaîtra le surnom de Cauchemar des pirates qu’à un chasseur capable de ramener une cible et des preuves intactes sans confondre prestige et carnage.", ["Capturer le capitaine vivant", "Livrer les registres aux ports victimes", "Forcer toute la flotte à déposer les armes"]],
      ],
    },
    marineford: {
      pirate: [
        ["La brèche des condamnés", "Un transfert secret traverse la forteresse reconstruite. Kizaru verrouille la baie tandis qu’un ancien allié de ton pavillon attend dans les cales.", ["Masquer l’approche derrière les épaves", "Créer une diversion sur les batteries", "Négocier un passage avec les pirates encerclés"]],
        ["Le corridor de Sentomaru", "L’extraction a déclenché l’encerclement. Sentomaru dirige les Pacifistas qui ferment les quais, et chaque décision prise à l’arrivée détermine désormais qui peut encore fuir.", ["Tenir le quai pour les retardataires", "Détourner les Pacifistas vers la digue", "Confier le prisonnier à l’équipage et ouvrir la route"]],
        ["Le pavillon dans la baie", "Akainu ordonne de condamner les accès plutôt que de poursuivre chaque navire. Il ne s’agit pas de le vaincre, mais d’arracher une flotte entière à son dispositif.", ["Briser la chaîne du port", "Protéger le dernier navire sous le bombardement", "Retourner le plan d’évacuation contre le blocus"]],
      ],
      marine: [
        ["L’alarme de la forteresse", "Un commando profite d’un transfert du Cipher Pol pour frapper Marineford. Coby découvre que des familles d’ouvriers sont enfermées dans le secteur visé.", ["Évacuer les familles avant de fermer les portes", "Sécuriser le transfert sans abandonner les quais", "Réorganiser les recrues autour de Coby"]],
        ["La ligne que l’ordre oublie", "Ryokugyu exige de tenir le dépôt tandis que les saboteurs poussent les civils vers les tirs. Ton premier ordre est déjà discuté dans toute la garnison.", ["Former un corridor sous les tirs", "Isoler les saboteurs de leurs otages", "Désobéir et déplacer la ligne défensive"]],
        ["Le symbole et les vivants", "La place centrale menace de s’effondrer. Fujitora couvre une partie de l’évacuation, mais te laisse choisir ce que ton unité fera du temps gagné.", ["Sauver les dernières recrues", "Neutraliser le détonateur central", "Coordonner la retraite de toute la baie"]],
      ],
      "bounty-hunter": [
        ["Le contrat de Crocodile", "Crocodile finance la capture d’un courtier pendant qu’un convoi gouvernemental entre à Marineford. Il confirme froidement que la Cross Guild ne paiera que pour la cible, pas pour les prisonniers civils attachés à elle.", ["Accepter le contrat mais protéger les prisonniers", "Révéler la clause cachée aux autres chasseurs", "Suivre la cible à travers le convoi"]],
        ["La cible aux deux commanditaires", "Le courtier détient les preuves d’un marché entre le Cipher Pol et des pirates. Smoker veut les documents ; ton commanditaire veut le silence.", ["Capturer la cible avec les preuves", "Livrer une copie à Smoker", "Retourner les chasseurs corrompus contre le courtier"]],
        ["Le sabre et les cellules", "Tashigi rejoint les quais au moment où la bataille se referme. Elle peut garantir la remise de la cible, mais refuse de partir tant que des dizaines de prisonniers restent dans la zone bombardée.", ["Sécuriser la cible et ouvrir les cellules", "Renoncer à une part du contrat pour évacuer", "Imposer un cessez-le-feu par les preuves"]],
      ],
      revolutionary: [
        ["Les noms sous la forteresse", "Sabo transmet l’existence d’un registre de prisonniers politiques caché sous Marineford. Le Cipher Pol commence leur déplacement avant l’aube.", ["Infiltrer les archives du transfert", "Saboter les portes sans exposer la cellule", "Faire sortir les familles par les tunnels"]],
        ["La flamme dans les galeries", "Le premier mouvement a révélé un réseau de cellules sous la baie. Lucci dirige la chasse tandis que Sabo retient les agents les plus dangereux.", ["Libérer les prisonniers pendant l’affrontement", "Détruire les registres biométriques", "Maintenir une route de retraite pour Sabo"]],
        ["Les chaînes devant le monde", "Les survivants atteignent les quais, mais le Gouvernement prépare une version officielle niant leur existence. Une dernière transmission peut changer leur destin.", ["Diffuser les preuves avec les témoignages", "Briser le blocus pour évacuer les prisonniers", "Protéger l’émetteur jusqu’au dernier navire"]],
      ],
    },
    emperor: {
      pirate: [
        ["Le pavillon sur la route", "La flotte de {emperor} contrôle l’objectif lié à ton rêve : {objective}. Reculer préserverait tes forces, mais abandonnerait cette piste.", ["Infiltrer la flotte extérieure", "Défier publiquement son autorité", "Négocier avec un commandant dissident"]],
        ["Le cercle impérial", "Ton premier mouvement force {emperor} à engager un commandant majeur. L’objectif reste accessible derrière la bataille.", ["Affronter le commandant en protégeant l’équipage", "Percer jusqu’à l’objectif", "Retourner le terrain contre la flotte"]],
        ["La volonté d’un Empereur", "{emperor} entre dans la confrontation. La victoire dépend d’un effort collectif et de ta capacité à accomplir l’objectif, pas d’un duel irréaliste.", ["Porter l’action décisive avec les alliés", "Sauver l’objectif sous sa pression", "Forcer la flotte impériale à céder le passage"]],
      ],
      marine: [
        ["L’ordre contre un Empereur", "La Marine engage une opération contre {emperor} autour de {objective}. Ton unité reçoit un objectif que la force seule ne peut sécuriser.", ["Établir un blocus mobile", "Protéger les populations prises entre les flottes", "Infiltrer la chaîne de commandement adverse"]],
        ["La flotte sous pression", "La réponse impériale disperse les unités avancées. Tes choix initiaux déterminent les renforts qui te font encore confiance.", ["Rassembler les navires isolés", "Neutraliser un commandant sans sacrifier les civils", "Exposer la faille tactique à l’état-major"]],
        ["Justice face au pavillon", "{emperor} intervient alors que l’objectif est presque sécurisé. La flotte entière doit créer l’ouverture que ton unité exploitera.", ["Diriger l’assaut collectif", "Achever la mission malgré la présence impériale", "Obtenir une retraite qui protège l’île"]],
      ],
      "bounty-hunter": [
        ["Le contrat impossible", "Un consortium offre un contrat lié à {emperor} : {objective}. La prime masque plusieurs intérêts contradictoires.", ["Vérifier le commanditaire avant d’approcher", "Suivre la cible jusque dans la flotte", "Former une coalition de chasseurs"]],
        ["Les menottes de l’Empereur", "Un commandant impérial protège désormais la cible. La capture de {emperor} reste improbable, mais une preuve ou un lieutenant changerait ta carrière.", ["Isoler le commandant", "Voler la preuve recherchée", "Transformer le contrat en piège public"]],
        ["La prise qui fait légende", "{emperor} couvre la retraite de son organisation. Il faut obtenir un résultat réel sans prétendre dominer seul toute sa puissance.", ["Conclure la capture avec les renforts", "Arracher l’objectif puis survivre", "Forcer une capitulation politique"]],
      ],
      revolutionary: [
        ["L’île sous un pavillon", "L’influence de {emperor} protège un système d’oppression autour de {objective}. Une population entière attend que quelqu’un ouvre la première brèche.", ["Armer la résistance locale", "Infiltrer le réseau impérial", "Évacuer les familles avant l’insurrection"]],
        ["Le commandant et la révolte", "Un commandant de {emperor} écrase le soulèvement. Les choix initiaux ont toutefois conservé une route vers le cœur du dispositif.", ["Unir les cellules pour tenir la place", "Détruire l’infrastructure d’oppression", "Retourner les soldats exploités contre leurs maîtres"]],
        ["Le jour où l’île répond", "{emperor} intervient au-dessus d’une bataille collective. Libérer l’île exige de préserver le mouvement, même sans vaincre personnellement l’Empereur.", ["Porter l’assaut avec la population", "Protéger l’évacuation sous sa présence", "Briser définitivement son contrôle politique"]],
      ],
    },
  });

  const LEGENDARY_MARINEFORD_TITLES = Object.freeze({
    pirate: "fleau-de-marineford", marine: "heros-de-marineford",
    "bounty-hunter": "arbitre-de-marineford", revolutionary: "liberateur-de-marineford",
  });

  const LEGENDARY_DIALOGUES = Object.freeze({
    talent: Object.freeze({
      pirate: [
        { speaker: "Morgans", role: "Président du World Economy News Paper", text: "Le monde adore les nouveaux monstres ! Donne-moi une raison d’imprimer ton nom plus gros que celui des autres rookies." },
        { speaker: "Bellamy", role: "La Hyène", text: "Une belle affiche ne fait pas un grand pirate. Montre à ce port ce qu’il reste quand les rumeurs se taisent." },
        { speaker: "Morgans", role: "Président du World Economy News Paper", text: "Une génération ne naît pas en silence ! Sors de cette baie et je ferai de ton exploit une nouvelle mondiale." },
      ],
      marine: [
        { speaker: "Smoker", role: "Vice-amiral", text: "Je te confie cette escadre, pas ma confiance. Ramène les civils et prouve que tu sais commander dans le chaos." },
        { speaker: "Tsuru", role: "Grande stratège de la Marine", text: "La justice se révèle lorsque chaque ordre coûte quelque chose. Choisis ce que tes soldats pourront encore défendre demain." },
        { speaker: "Garp", role: "Héros de la Marine", text: "Wahaha ! Les galons ne sauveront aucune recrue. Montre-moi plutôt pourquoi ils devraient te suivre." },
      ],
      revolutionary: [
        { speaker: "Koala", role: "Armée révolutionnaire", text: "Dragon a lu tes rapports. Cette fois, ce sont des vies qui diront si leur promesse était réelle." },
        { speaker: "Sabo", role: "Chef d’état-major", text: "Ces cellules ne se font pas confiance. Unis-les sans leur voler la raison pour laquelle elles se battent." },
        { speaker: "Dragon", role: "Chef de l’Armée révolutionnaire", text: "Un nom n’a de valeur que s’il ouvre une voie aux peuples. Fais que cette opération survive à ta propre victoire." },
      ],
      "bounty-hunter": [
        { speaker: "Crocodile", role: "Fondateur de Cross Guild", text: "Trois contrats, trois guildes incapables de voir le même réseau. Unis-les ou chasse seul ; dans les deux cas, rapporte-moi un résultat qui mérite ton nom." },
        { speaker: "Baggy", role: "Empereur autoproclamé de la chasse", text: "Ce rookie ? Évidemment qu’il tremble déjà devant le grand Baggy ! Trouve-le vite… avant qu’il raconte une version moins glorieuse." },
        { speaker: "Dracule Mihawk", role: "Œil de Faucon", text: "Une réputation achetée ne résiste pas aux preuves. Ramène la cible intacte, et les pirates prononceront eux-mêmes ton nouveau surnom." },
      ],
    }),
    marineford: Object.freeze({
      pirate: [
        { speaker: "Kizaru", role: "Amiral", text: "Oooh… venir chercher un prisonnier ici ? Voilà des pirates bien pressés de devenir de la lumière." },
        { speaker: "Sentomaru", role: "Commandant des Pacifistas", text: "Ma défense est la plus solide du monde ! Aucun prisonnier ne franchira ce quai, et ton pavillon coulera avec les retardataires." },
        { speaker: "Akainu", role: "Amiral en chef", text: "Aucun pavillon criminel ne quittera cette baie. Marineford sera la fin de votre fuite." },
      ],
      marine: [
        { speaker: "Coby", role: "Officier de la Marine", text: "Les familles sont encore dans le secteur. Si nous fermons ces portes maintenant, notre victoire les condamnera." },
        { speaker: "Ryokugyu", role: "Amiral", text: "Le dépôt tient, le reste est secondaire. Un bon soldat ne demande pas à l’ordre d’être confortable." },
        { speaker: "Fujitora", role: "Amiral", text: "Je peux retenir l’effondrement un instant. À vous de décider quelles vies donneront un sens à ce temps." },
      ],
      "bounty-hunter": [
        { speaker: "Crocodile", role: "Cross Guild", text: "Le courtier est la cible. Les prisonniers attachés à lui ne figurent pas au contrat ; si tu les sauves, fais-le sur ton temps et sans perdre ma preuve." },
        { speaker: "Smoker", role: "Vice-amiral", text: "Ton contrat sent le piège. Garde ta cible si tu veux, mais ne laisse pas ses preuves brûler avec les innocents." },
        { speaker: "Tashigi", role: "Capitaine de la Marine", text: "Je garantirai la remise de ta cible. Mais si tu abandonnes ces cellules pour préserver ta prime, ne prétends plus que cette chasse servait la justice." },
      ],
      revolutionary: [
        { speaker: "Sabo", role: "Chef d’état-major", text: "Ce registre contient des noms que le Gouvernement a déjà effacés. Fais sortir les prisonniers ; je retiendrai la porte." },
        { speaker: "Rob Lucci", role: "Cipher Pol", text: "Les archives et leurs témoins disparaîtront ensemble. Votre flamme n’éclairera rien sous cette forteresse." },
        { speaker: "Sabo", role: "Chef d’état-major", text: "Les survivants sont là. Maintenant, protège leur voix assez longtemps pour que le monde ne puisse plus nier leur existence." },
      ],
    }),
  });

  const EMPEROR_DIALOGUES = Object.freeze({
    blackbeard: { speaker: "Barbe Noire", role: "Empereur", text: "Zehahaha ! Les rêves ne meurent jamais… mais les faibles, eux, abandonnent leur trésor au premier vrai monstre." },
    kaido: { speaker: "Kaido", role: "Empereur", text: "Tu veux franchir ma route ? Alors montre-moi si ta volonté survit quand la force ne suffit plus." },
    "big-mom": { speaker: "Big Mom", role: "Impératrice", text: "Mamamama ! Tout ici m’appartient. Ton objectif, tes alliés… et bientôt les années qu’il te reste." },
    shanks: { speaker: "Shanks le Roux", role: "Empereur", text: "Si cet objectif vaut vraiment ton voyage, avance. Mais ne mise pas la vie des tiens sur une fierté vide." },
    luffy: { speaker: "Luffy", role: "Empereur", text: "Je ne te laisserai pas faire du mal à mes amis. Si tu veux passer, viens défendre ton choix toi-même !" },
    buggy: { speaker: "Baggy", role: "Empereur", text: "Tu crois pouvoir défier le grand Baggy ?! Très bien… essaie donc de traverser toute ma flotte !" },
  });

  const EMPEROR_APPROACH_DIALOGUES = Object.freeze({
    blackbeard: [
      { speaker: "Jesus Burgess", role: "Commandant de Barbe Noire", text: "Wi-hahaha ! Ce que tu cherches appartient au commodore Teach. Viens donc le reprendre avec tes propres poings !" },
      { speaker: "Shiryu", role: "Capitaine du deuxième navire", text: "Tu as franchi la flotte extérieure. Maintenant, essaie d’atteindre ton objectif avant que ma lame invisible ne choisisse qui repart." },
    ],
    kaido: [
      { speaker: "Queen", role: "All-Star aux Cent Bêtes", text: "Mwahaha ! Tu veux traverser le territoire de Kaido ? J’espère au moins que ta défaite sera assez spectaculaire pour mon show !" },
      { speaker: "King", role: "Incendie", text: "Tu as attiré l’attention de Kaido. C’est la dernière erreur que ton équipage aura le temps de comprendre." },
    ],
    "big-mom": [
      { speaker: "Perospero", role: "Ministre des Bonbons", text: "Perorin ! Tout objectif sur ce territoire appartient à Mama. Offre quelque chose d’assez précieux, ou reste ici pour toujours." },
      { speaker: "Katakuri", role: "Commandant de Big Mom", text: "J’ai vu la route que tu comptes prendre. Change ton avenir maintenant, ou je l’arrêterai moi-même." },
    ],
    shanks: [
      { speaker: "Yasopp", role: "Officier du Roux", text: "Notre capitaine ne cherche pas la guerre. Mais si ton objectif menace nos amis, mon prochain tir mettra fin à ton approche." },
      { speaker: "Ben Beckman", role: "Bras droit du Roux", text: "Tu es arrivé assez loin pour être entendu. Choisis bien ton prochain geste : Shanks jugera ce qu’il protège, pas ce qu’il promet." },
    ],
    luffy: [
      { speaker: "Jinbe", role: "Timonier des Mugiwara", text: "Cet objectif se trouve sous la protection de notre capitaine. Expose tes raisons, ou prépare-toi à affronter tout l’équipage." },
      { speaker: "Roronoa Zoro", role: "Sabreur des Mugiwara", text: "Tu as franchi notre ligne. Un pas de plus vers ce qu’on protège, et c’est moi qui t’arrête." },
    ],
    buggy: [
      { speaker: "Crocodile", role: "Dirigeant de Cross Guild", text: "Oublie le cirque de Baggy. L’objectif est sous mon contrôle ; avance seulement si tu peux payer son véritable prix." },
      { speaker: "Dracule Mihawk", role: "Œil de Faucon", text: "Le titre d’Empereur attire beaucoup d’ambitieux. Montre-moi si la tienne mérite que je dégaine." },
    ],
  });

  function getEmperorApproachVariants(step) {
    return Object.fromEntries(Object.entries(EMPEROR_APPROACH_DIALOGUES)
      .map(([emperorId, dialogues]) => [emperorId, dialogues[step - 1]]));
  }

  function getLegendaryIntroDialogue(arcId, faction, step) {
    if (arcId === "emperor") {
      return step === 3
        ? { emperorVariants: EMPEROR_DIALOGUES }
        : { emperorVariants: getEmperorApproachVariants(step) };
    }
    return LEGENDARY_DIALOGUES[arcId]?.[faction]?.[step - 1] || null;
  }

  function createLegendaryArcEvent(arcId, faction, step, story) {
    const [title, description, choiceTexts] = story;
    const successFlag = `legendary_${arcId}_${step}_success`;
    const failureFlag = `legendary_${arcId}_${step}_failure`;
    return createEvent({
      id: `legendary-${arcId}-${faction}-${step}`,
      title, description, paths: [faction], zones: [], minMonth: 1, maxMonth: 24,
      eventType: "legendary", resolutionCategory: step === 1 ? "social" : "action",
      rarity: EVENT_RARITY.VERY_RARE, unique: true, important: true, highStakes: true,
      tags: ["legendary-arc", `legendary-${arcId}`, `legendary-step-${step}`],
      introDialogue: getLegendaryIntroDialogue(arcId, faction, step),
      choices: choiceTexts.map((text, choiceIndex) => ({
        id: `approach-${choiceIndex + 1}`, text,
        resolutionWeights: step === 1
          ? [{ intelligence: .45, charisma: .35, renown: .20 }, { charisma: .45, intelligence: .25, renown: .30 }, { intelligence: .35, charisma: .40, renown: .25 }][choiceIndex]
          : [{ health: .22, combat: .43, haki: .35 }, { health: .28, combat: .32, haki: .40 }, { health: .18, combat: .37, haki: .30, charisma: .15 }][choiceIndex],
        outcomes: [
          { id: "legendary-success", result: step === 3 ? "Ton action transforme la conclusion collective en exploit dont le monde conservera la trace." : "Ton choix préserve l’objectif et donne un avantage réel pour la suite de l’opération.", effects: { combat: step > 1 ? 2 : 0, intelligence: step === 1 ? 2 : 0, popularity: 1, bounty: arcId === "emperor" ? 260000 : 160000 }, flags: { [successFlag]: true }, outcomeTier: "success", weight: 3 },
          { id: "legendary-mixed", result: "L’objectif avance, mais les pertes et les compromis réduisent la portée de cette étape.", effects: { health: -1, haki: 1, bounty: 80000 }, flags: { [`legendary_${arcId}_${step}_mixed`]: true }, outcomeTier: "mixed", weight: 2 },
          { id: "legendary-failure", result: "La puissance adverse impose un revers sévère. La séquence continue, mais le prestige final s’éloigne.", effects: { health: -5, combat: -2, popularity: -1 }, flags: { [failureFlag]: true }, outcomeTier: "failure", fallback: true, weight: 1 },
        ],
      })),
    });
  }

  const LEGENDARY_ARC_EVENTS = Object.freeze(Object.entries(LEGENDARY_ARC_STORIES)
    .flatMap(([arcId, factions]) => Object.entries(factions)
      .flatMap(([faction, stories]) => stories.map((story, index) =>
        createLegendaryArcEvent(arcId, faction, index + 1, story)))));

  const ALL_EVENTS = Object.freeze([
    ...COMMON_EVENTS,
    ...RESTORED_COMMON_EVENTS,
    ...RISK_EVENTS,
    ...PIRATE_EVENTS,
    ...BOUNTY_HUNTER_EVENTS,
    ...REVOLUTIONARY_EVENTS,
    ...MARINE_EVENTS,
    ...EAST_BLUE_EVENTS,
    ...WEST_BLUE_EVENTS,
    ...NORTH_BLUE_EVENTS,
    ...SOUTH_BLUE_EVENTS,
    ...RARE_EVENTS,
    ...VERY_RARE_EVENTS,
    ...CALLBACK_EVENTS,
  ].filter((event) =>
    !event.zones?.some((zoneId) => SPECIAL_ZONE_IDS.includes(zoneId)) ||
    event.tags?.includes("canonical-special-arc")));

  /*
   * Garde-fou éditorial pour les éventuelles troisièmes options futures.
   * Une statistique peut conditionner une issue, mais elle ne constitue jamais
   * à elle seule un contexte narratif autorisant une action supplémentaire.
   */
  function validateContextualThirdChoices(events) {
    const contextRules = Object.freeze({
      intelligence: /enqu|indice|document|archive|myst|navigation|route|courant|plan|strat|pi[eè]ge|infiltr|sabot|polit|commerce|contrat|information/i,
      charisma: /n[ée]goci|accord|foule|population|recrut|alliance|command|discours|t[ée]moin|interrog|autorit|intimid|polit/i,
      haki: /haki|fluide|combat|menace|danger|ennemi|attaque|d[ée]fense|pr[ée]sence|volont[ée]|poursuite|embuscade/i,
      combat: /combat|attaque|assaut|bataille|menace|ennemi|garde|blocus|poursuite|arrestation|d[ée]fendre|affronter/i,
      fortune: /commerce|march[ée]|prix|payer|achat|vente|contrat|prime|r[ée]compense|cargaison|corruption|r[ée]paration|financ/i,
      crew: /[ée]quipage|groupe|[ée]quipe|alli[ée]|compagnon|marins|agents|cellule|unit[ée]/i,
    });
    const genericLabels = /^(utiliser (son|sa) (intelligence|charisme|haki|combat|fortune)|faire preuve de (charisme|haki|force|combat)|observer la situation|r[ée]fl[ée]chir [àa] un plan|prendre les choses en main|chercher une faiblesse|analyser les rapports de force|observer les rapports de force|construire un plan [àa] partir des indices|tenter de (les )?convaincre|d[ée]ployer son haki)/i;
    const warnings = [];

    events.forEach((event) => {
      const thirdChoice = event.choices?.[2];
      if (!thirdChoice) return;

      const reference = `${event.id}/${thirdChoice.id || "troisième-choix"}`;
      const context = [
        event.category,
        ...(event.tags || []),
        event.title,
        event.description,
      ].filter(Boolean).join(" ");
      const testedStats = new Set(
        (thirdChoice.outcomes || []).flatMap((outcome) => [
          ...Object.keys(outcome.minimumStats || {}),
          ...Object.keys(outcome.maximumStats || {}),
        ]),
      );

      if (!context.trim()) warnings.push(`troisième choix sans contexte : ${reference}`);
      if (!String(thirdChoice.text || "").trim()) warnings.push(`troisième choix sans libellé : ${reference}`);
      if (!thirdChoice.outcomes?.length) warnings.push(`troisième choix sans issue : ${reference}`);
      if (genericLabels.test(String(thirdChoice.text || "").trim())) {
        warnings.push(`libellé générique à contextualiser : ${reference}`);
      }

      testedStats.forEach((stat) => {
        const rule = contextRules[stat];
        if (rule && !rule.test(context)) {
          warnings.push(`${stat} sans contexte narratif compatible : ${reference}`);
        }
      });

      const resultText = (thirdChoice.outcomes || [])
        .map((outcome) => outcome.result || "")
        .join(" ");
      if (thirdChoice.outcomes?.length && !resultText.trim()) {
        warnings.push(`issues sans résultat narratif : ${reference}`);
      }
    });

    if (warnings.length) {
      console.warn("[Blue Legacy] Validation des troisièmes choix :", warnings);
    }
  }

  function validateEventOutcomeNarratives(events) {
    const knownStats = new Set([
      "health", "combat", "haki", "intelligence", "charisma",
      "bounty", "fortune", "crew", "popularity", "morale", "ship",
    ]);
    const physicalConsequences = /bless|coup|chute|brûl|brul|poison|épuis|epuis|impact|explosion|tir|feu|tempête|tempete|foudre|plaie|sang|fracture|douleur|attaque|combat|assaut|accident|noy|écras|ecras/i;
    const genericResults = /^(ton choix porte ses fruits|la situation tourne à ton avantage|les choses ne se passent pas comme prévu|tu parviens à tes fins|ton plan échoue|tu t’en sors de justesse|ta tentative échoue|cette décision aura des conséquences)[.!]?$/i;
    const repeatedResults = new Map();
    const warnings = [];

    events.forEach((event) => {
      (event.choices || []).forEach((choice, choiceIndex) => {
        if (!choice.outcomes?.length) {
          warnings.push(`choix sans issue : ${event.id}/${choice.id}`);
          return;
        }

        choice.outcomes.forEach((outcome) => {
          const reference = `${event.id}/${choice.id}/${outcome.id}`;
          const result = String(outcome.result || "").trim();
          if (!result) warnings.push(`issue sans texte : ${reference}`);
          if (genericResults.test(result)) warnings.push(`résultat trop générique : ${reference}`);

          if (result) {
            const uses = repeatedResults.get(result) || [];
            uses.push(reference);
            repeatedResults.set(result, uses);
          }

          Object.keys(outcome.effects || {}).forEach((stat) => {
            if (!knownStats.has(stat)) warnings.push(`effet inconnu (${stat}) : ${reference}`);
          });

          if (Number(outcome.effects?.health) < 0 && !physicalConsequences.test(result)) {
            warnings.push(`perte de Santé sans conséquence physique explicite : ${reference}`);
          }
          if ((outcome.titles?.length || outcome.title) && !/titre|surnom|appel|nomm|connu|réputation/i.test(result)) {
            warnings.push(`Titre sans justification narrative : ${reference}`);
          }
          if (Object.keys(outcome.flags || {}).length && result.length < 45) {
            warnings.push(`flag sans trace narrative suffisante : ${reference}`);
          }
          if (choiceIndex === 2 && /porte ses fruits|situation tourne|tentative échoue|trouve une solution/i.test(result)) {
            warnings.push(`troisième choix avec résultat générique : ${reference}`);
          }
        });
      });
    });

    repeatedResults.forEach((references, result) => {
      if (references.length >= 5) {
        warnings.push(`résultat partagé par ${references.length} issues : « ${result.slice(0, 80)} »`);
      }
    });

    if (warnings.length) {
      console.warn("[Blue Legacy] Validation narrative des issues :", warnings);
    }
  }

  if (IS_DEVELOPMENT) {
    validateContextualThirdChoices(ALL_EVENTS);
    validateEventOutcomeNarratives(ALL_EVENTS);
  }

  const EDITORIALLY_REPLACED_EVENT_IDS = Object.freeze([
    "pirate-captains-shadow",
    "pirate-silent-cannon",
    "pirate-north-blue-clockwork",
    "pirate-devil-fruit-hollow-rival",
    "marine-lore-magma-fugitive",
    "bounty-hunter-devil-fruit-blade-target",
    "revolutionary-lore-phoenix-cache",
  ]);
  const FACTORY_STORY_EVENT_IDS = Object.freeze([
    ...PIRATE_BLUE_REVERSE_STORIES.map(([slug]) => `pirate-${slug}`),
    ...MARINE_BLUE_REVERSE_STORIES.map(([slug]) => `marine-${slug}`),
    ...BOUNTY_HUNTER_BLUE_REVERSE_STORIES.map(([slug]) => `bounty-hunter-${slug}`),
    ...REVOLUTIONARY_BLUE_REVERSE_STORIES.map(([slug]) => `revolutionary-${slug}`),
  ]);

  window.SEA_OF_LEGENDS_EVENTS = ALL_EVENTS;
  window.BLUE_LEGACY_LEGENDARY_ARC_EVENTS = LEGENDARY_ARC_EVENTS;
  window.BLUE_LEGACY_LEGENDARY_MARINEFORD_TITLES = LEGENDARY_MARINEFORD_TITLES;
  window.BLUE_LEGACY_DECISIVE_EVENTS = BOSS_EVENTS;
  window.BLUE_LEGACY_SPECIAL_ZONE_AUDIT = Object.freeze(SPECIAL_ZONE_EVENT_AUDIT);
  if (new URLSearchParams(window.location.search).has("audit")) {
    document.documentElement.dataset.specialZoneAudit = JSON.stringify(SPECIAL_ZONE_EVENT_AUDIT);
  }
  // Alias technique conservé pour la compatibilité avec les anciennes sauvegardes.
  window.SEA_OF_LEGENDS_BOSS_EVENTS = BOSS_EVENTS;
  window.BLUE_LEGACY_EDITORIAL_LEDGER = Object.freeze({
    factoryStoryIds: FACTORY_STORY_EVENT_IDS,
    exceptionalIds: Object.freeze(EXCEPTIONAL_EVENT_PACK.map((event) => event.id)),
    advancedIds: Object.freeze(ADVANCED_EVENT_PACK.map((event) => event.id)),
    decisiveIds: Object.freeze(BOSS_EVENTS.map((event) => event.id)),
    replacedIds: EDITORIALLY_REPLACED_EVENT_IDS,
    balance: Object.freeze({ ...BALANCE_LEDGER }),
  });
  window.SEA_OF_LEGENDS_EVENT_COLLECTIONS = Object.freeze({
    common: COMMON_EVENTS,
    paths: Object.freeze({
      pirate: PIRATE_EVENTS,
      bountyHunter: BOUNTY_HUNTER_EVENTS,
      revolutionary: REVOLUTIONARY_EVENTS,
      marine: MARINE_EVENTS,
    }),
    blues: Object.freeze({
      eastBlue: EAST_BLUE_EVENTS,
      westBlue: WEST_BLUE_EVENTS,
      northBlue: NORTH_BLUE_EVENTS,
      southBlue: SOUTH_BLUE_EVENTS,
    }),
    rare: RARE_EVENTS,
    veryRare: VERY_RARE_EVENTS,
    callbacks: CALLBACK_EVENTS,
  });

})();
