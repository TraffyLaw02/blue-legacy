/* ==========================================================
   BLUE LEGACY — CATALOGUE DES SUCCÈS
   Les Succès sont permanents et ne produisent aucun effet.
========================================================== */

(() => {
  "use strict";

  const categoryMeta = Object.freeze({
    adventure: { label: "Aventure", icon: "🌊" },
    exploration: { label: "Exploration", icon: "🧭" },
    factions: { label: "Factions", icon: "⚑" },
    dreams: { label: "Rêves et destin", icon: "✨" },
    combat: { label: "Combat et Haki", icon: "⚔️" },
    crew: { label: "Équipage et leadership", icon: "👥" },
    fortune: { label: "Fortune et prime", icon: "💰" },
    "rare-events": { label: "Événements rares", icon: "🌟" },
    challenges: { label: "Défis", icon: "🔥" },
    collection: { label: "Collection", icon: "🏆" },
  });

  const categoryOrder = Object.freeze([
    "adventure", "exploration", "factions", "dreams", "combat",
    "crew", "fortune", "rare-events", "challenges", "collection",
  ]);

  const achievementBerryRewards = Object.freeze({
    common: 50,
    uncommon: 75,
    rare: 110,
    epic: 160,
    legendary: 230,
    mythic: 300,
  });

  const achievement = (
    id, name, description, category, rarity, icon, unlockHint, condition,
    options = {},
  ) => Object.freeze({
    id, name, description, category, rarity, icon, unlockHint, condition,
    secret: false,
    berryReward: achievementBerryRewards[rarity] || 0,
    ...options,
  });

  const achievements = [
    achievement("complete-first-run", "Premier voyage", "Une première aventure a rejoint ton histoire.", "adventure", "common", "🌊", "Terminer une aventure.", { type: "runs-completed", target: 1 }, { progressLabel: "Aventures terminées" }),
    achievement("complete-five-runs", "Le monde se souvient", "Plusieurs vies ont laissé leur trace sur les mers.", "adventure", "epic", "📚", "Enregistrer cinq anciennes vies dans le Panthéon.", { type: "runs-completed", target: 5 }, { progressLabel: "Anciennes vies" }),
    achievement("reach-final-month", "Jusqu’au dernier mois", "Cette aventure a tenu jusqu’au terme prévu.", "adventure", "uncommon", "📅", "Atteindre le vingt-quatrième mois d’une aventure.", { type: "final-month", target: 24 }),

    achievement("cross-reverse-mountain", "À contre-courant", "Reverse Mountain n’est plus une frontière.", "exploration", "common", "⛰️", "Franchir Reverse Mountain.", { type: "zone-visited", zoneId: "reverse-mountain" }),
    achievement("reach-shinsekai", "Nouveau Monde", "Le Nouveau Monde s’est ouvert devant toi.", "exploration", "rare", "🌪️", "Atteindre le Nouveau Monde.", { type: "zone-visited", zoneId: "shinsekai" }),
    achievement("start-from-four-blues", "Les quatre horizons", "Chacune des quatre mers cardinales a vu naître l’une de tes aventures.", "exploration", "epic", "🧭", "Commencer une aventure dans chacune des quatre mers de départ.", { type: "origins-played", target: 4 }, { progressLabel: "Mers de départ" }),
    achievement("visit-three-special-zones", "Routes imprévisibles", "Les routes les plus instables ont toutes été explorées.", "exploration", "legendary", "🗺️", "Visiter les trois zones spéciales au fil de plusieurs aventures.", { type: "special-zones-visited", target: 3 }, { progressLabel: "Zones spéciales" }),

    achievement("pirate-lasting-mark", "Le pavillon se remarque", "Une carrière pirate a fait parler d’elle.", "factions", "rare", "🏴‍☠️", "Terminer une aventure Pirate avec une forte prime.", { type: "faction-stat", faction: "pirate", stat: "bounty", minimum: 2500000, finished: true }),
    achievement("marine-lasting-mark", "La justice en marche", "Une carrière Marine a gagné la confiance du monde.", "factions", "rare", "⚓", "Terminer une aventure Marine avec une Popularité élevée.", { type: "faction-stat", faction: "marine", stat: "popularity", minimum: 90, finished: true }),
    achievement("hunter-lasting-mark", "La cible parfaite", "Une carrière de chasse a rempli ses coffres.", "factions", "rare", "🎯", "Terminer une aventure de Chasseur de primes avec une grande Fortune.", { type: "faction-stat", faction: "bounty-hunter", stat: "fortune", minimum: 120000, finished: true }),
    achievement("revolutionary-lasting-mark", "Le vent de la révolte", "Une carrière révolutionnaire a changé un destin.", "factions", "rare", "✊", "Accomplir un rêve au cours d’une aventure Révolutionnaire.", { type: "faction-dream-completed", faction: "revolutionary" }),

    achievement("complete-first-dream", "Le rêve d’une vie", "Un rêve poursuivi sur les mers est devenu réel.", "dreams", "uncommon", "💫", "Accomplir un premier rêve.", { type: "dreams-completed", target: 1 }, { progressLabel: "Rêves accomplis" }),
    achievement("complete-three-dreams", "Des destins différents", "Plusieurs ambitions ont trouvé leur conclusion.", "dreams", "legendary", "🌠", "Accomplir trois rêves différents au fil des aventures.", { type: "unique-dreams-completed", target: 3 }, { progressLabel: "Rêves différents" }),
    achievement("discover-will-of-d", "La volonté demeure", "Une initiale ancienne accompagne désormais l’une de tes légendes.", "dreams", "legendary", "D.", "Condition secrète", { type: "has-d" }, { secret: true }),

    achievement("reach-high-combat", "L’épreuve du fer", "Ta maîtrise du combat a atteint un niveau remarquable.", "combat", "uncommon", "⚔️", "Atteindre 55 en Combat.", { type: "stat-at-least", stat: "combat", target: 55 }),
    achievement("reach-high-haki", "La volonté prend forme", "Ton Haki impose désormais sa présence.", "combat", "epic", "🛡️", "Atteindre 35 en Haki.", { type: "stat-at-least", stat: "haki", target: 35 }),
    achievement("finish-low-combat", "Sans lever le poing", "La route s’est achevée sans faire de la force ta réponse principale.", "combat", "epic", "🕊️", "Terminer une aventure avec 12 ou moins en Combat.", { type: "finished-stat-at-most", stat: "combat", target: 12 }),
    achievement("reach-high-intelligence", "L’autre voie", "Une carrière entière s’est construite sur l’analyse et la stratégie.", "combat", "rare", "🧠", "Atteindre 60 en Intelligence.", { type: "stat-at-least", stat: "intelligence", target: 60 }),
    achievement("reach-high-charisma", "Une voix qui rassemble", "Ton influence personnelle a uni des alliés que tout séparait.", "crew", "rare", "✨", "Atteindre 75 en Charisme.", { type: "stat-at-least", stat: "charisma", target: 75 }),

    achievement("gather-large-crew", "Tous à bord", "Un équipage imposant s’est rassemblé autour de toi.", "crew", "uncommon", "👥", "Réunir au moins quatre membres d’équipage.", { type: "max-stat-at-least", stat: "crew", target: 4 }),
    achievement("shinsekai-damaged-ship", "Seul contre la mer", "Un équipage réduit a tout de même atteint le Nouveau Monde.", "crew", "epic", "👤", "Atteindre le Nouveau Monde avec un membre d’équipage ou moins.", { type: "zone-with-stat-at-most", zoneId: "shinsekai", stat: "crew", target: 1 }),

    achievement("gather-great-fortune", "Les poches pleines", "Ta Fortune dépasse celle de bien des capitaines.", "fortune", "uncommon", "💰", "Atteindre 150 000 berrys de Fortune.", { type: "stat-at-least", stat: "fortune", target: 150000 }),
    achievement("pirate-great-bounty", "Le journal parle de toi", "Ta prime pirate est devenue une nouvelle mondiale.", "fortune", "legendary", "☠️", "Atteindre une prime de 5 000 000 en tant que Pirate.", { type: "faction-stat", faction: "pirate", stat: "bounty", minimum: 5000000 }),

    achievement("survive-first-danger-event", "Le rouge des mers", "Tu as traversé un événement où chaque choix pouvait être le dernier.", "rare-events", "common", "🔴", "Survivre à un premier événement dangereux.", { type: "telemetry-at-least", key: "dangerEventsSurvived", target: 1 }),
    achievement("resolve-three-rare-events", "Quand la mer insiste", "Les rencontres rares ne sont plus de simples rumeurs.", "rare-events", "rare", "🌟", "Résoudre trois événements rares ou très rares dans une aventure.", { type: "telemetry-at-least", key: "rareEventsResolved", target: 3 }, { progressLabel: "Événements rares" }),
    achievement("resolve-callback-chain", "Le passé revient toujours", "Une histoire commencée plus tôt a trouvé sa conclusion.", "rare-events", "epic", "🔗", "Résoudre un événement de callback.", { type: "telemetry-at-least", key: "callbacksResolved", target: 1 }),

    achievement("obtain-devil-fruit", "Un pouvoir maudit", "Un Fruit du Démon a changé le cours d’une aventure.", "challenges", "common", "🍈", "Obtenir un Fruit du Démon.", { type: "has-fruit" }),
    achievement("reach-shinsekai-without-fruit", "Par ses propres forces", "Le Nouveau Monde a été atteint sans pouvoir surnaturel.", "challenges", "uncommon", "🌊", "Atteindre le Nouveau Monde sans Fruit du Démon.", { type: "zone-without-fruit", zoneId: "shinsekai" }),
    achievement("finish-critical-health", "Contre toute attente", "L’aventure s’est achevée alors qu’il ne restait presque plus de forces.", "challenges", "mythic", "❤️‍🩹", "Condition secrète", { type: "finished-stat-at-most", stat: "health", target: 10 }, { secret: true }),
    achievement("d-complete-dream", "Une volonté transmise", "Le D. et un rêve accompli se sont rencontrés dans une même destinée.", "challenges", "mythic", "☀️", "Condition secrète", { type: "d-and-dream-completed" }, { secret: true }),

    achievement("all-factions-played", "Les quatre pavillons", "Chaque grande voie des mers a porté l’une de tes aventures.", "adventure", "epic", "⚑", "Terminer une aventure avec chacune des quatre factions.", { type: "factions-played", target: 4 }, { progressLabel: "Factions terminées" }),
    achievement("social-resolutions", "La parole ouvre la voie", "Tes décisions sociales ont résolu de nombreuses crises sans dépendre uniquement de la force.", "combat", "rare", "🤝", "Obtenir huit issues favorables lors d’événements Social dans une même aventure.", { type: "telemetry-at-least", key: "socialSuccesses", target: 8 }, { progressLabel: "Issues Social favorables" }),
    achievement("exceptional-chain", "Le vent en poupe", "Plusieurs décisions ont produit des résultats véritablement exceptionnels.", "rare-events", "epic", "🌟", "Obtenir trois issues exceptionnelles dans une même aventure.", { type: "telemetry-at-least", key: "exceptionalOutcomes", target: 3 }, { progressLabel: "Issues exceptionnelles" }),
    achievement("finish-with-fruit", "Pouvoir jusqu’au bout", "Un pouvoir de Fruit du Démon a accompagné une aventure jusqu’à sa conclusion.", "challenges", "uncommon", "🍈", "Terminer une aventure en possédant un Fruit du Démon.", { type: "finished-with-fruit" }),
    achievement("discover-three-fruits", "Encyclopédie maudite", "Plusieurs pouvoirs différents ont marqué les vies conservées dans ton Panthéon.", "collection", "epic", "📚", "Terminer des aventures avec trois Fruits du Démon différents.", { type: "unique-fruits", target: 3 }, { progressLabel: "Fruits différents" }),
    achievement("first-shop-item", "Premier héritage", "Une récompense permanente accompagnera désormais tes prochaines aventures.", "collection", "common", "🛍️", "Acheter un premier objet dans la Boutique.", { type: "shop-items-owned", target: 1 }, { progressLabel: "Objets possédés" }),
    achievement("complete-shop", "Collection du grand large", "Tous les objets permanents de la Boutique font désormais partie de ta collection.", "collection", "legendary", "🎒", "Posséder les cinq objets de la Boutique.", { type: "shop-items-owned", target: 5 }, { progressLabel: "Objets possédés" }),
    achievement("finish-with-two-items", "Bien préparé", "Deux héritages permanents ont soutenu une aventure complète sans décider de son destin à ta place.", "adventure", "rare", "🧰", "Terminer une aventure avec deux objets de Boutique actifs.", { type: "finished-with-shop-items", target: 2 }),
    achievement("popular-legend", "Au sommet des nouvelles", "Ta carrière s’est achevée parmi les noms les plus connus des mers.", "fortune", "legendary", "⭐", "Terminer une aventure avec au moins 95 de Popularité.", { type: "finished-popularity", target: 95 }),

    achievement("unlock-ten-titles", "Collection de légendes", "Ta collection rassemble déjà de nombreuses identités remarquables.", "collection", "rare", "🎖️", "Débloquer dix Titres.", { type: "titles-unlocked", target: 10 }, { progressLabel: "Titres débloqués" }),
    achievement("record-ten-lives", "Une mer de souvenirs", "Le Panthéon raconte désormais une véritable génération d’aventuriers.", "collection", "legendary", "👑", "Condition secrète", { type: "runs-completed", target: 10 }, { secret: true, progressLabel: "Anciennes vies" }),
  ];

  window.BLUE_LEGACY_ACHIEVEMENT_CATEGORY_META = categoryMeta;
  window.BLUE_LEGACY_ACHIEVEMENT_CATEGORY_ORDER = categoryOrder;
  window.BLUE_LEGACY_LEGACY_ACHIEVEMENT_ID_MAP = Object.freeze({});
  window.BLUE_LEGACY_ACHIEVEMENT_BERRY_REWARDS = achievementBerryRewards;
  window.SEA_OF_LEGENDS_ACHIEVEMENTS = Object.freeze(achievements);
})();
