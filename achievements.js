/* ==========================================================
   BLUE LEGACY — CATALOGUE DES SUCCÈS
   Les Succès sont permanents et ne produisent aucun effet.
========================================================== */

(() => {
  "use strict";

  const categoryMeta = Object.freeze({
    "story-roger": { label: "Mode Histoire › Gol D. Roger", icon: "📖" },
    adventure: { label: "Aventure", icon: "🌊" },
    exploration: { label: "Exploration", icon: "🧭" },
    factions: { label: "Factions", icon: "⚑" },
    dreams: { label: "Rêves et destin", icon: "✨" },
    combat: { label: "Combat et Défense", icon: "⚔️" },
    crew: { label: "Équipage et leadership", icon: "👥" },
    fortune: { label: "Fortune et prime", icon: "💰" },
    "rare-events": { label: "Événements rares", icon: "🌟" },
    challenges: { label: "Défis", icon: "🔥" },
    collection: { label: "Collection", icon: "🏆" },
  });

  const categoryOrder = Object.freeze([
    "adventure", "exploration", "factions", "dreams", "combat",
    "crew", "fortune", "rare-events", "challenges", "collection",
    "story-roger",
  ]);

  const achievementBerryRewards = Object.freeze({
    common: 30,
    uncommon: 50,
    rare: 85,
    epic: 135,
    legendary: 210,
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
    achievement("story-roger-first-completion", "Une vie de Roi", "Une première destinée du Roi des Pirates a rejoint le Panthéon.", "story-roger", "uncommon", "📖", "Terminer une histoire de Gol D. Roger.", { type: "story-run-completed", storyId: "roger" }),
    achievement("story-roger-rayleigh-gaban", "Les deux premiers piliers", "Rayleigh et Gaban ont réellement navigué ensemble sous le même pavillon.", "story-roger", "rare", "⚔️", "Réunir Silvers Rayleigh et Scopper Gaban dans le même équipage.", { type: "story-crew-members", storyId: "roger", memberIds: ["roger-rayleigh", "roger-gaban"] }),
    achievement("story-roger-oden-companion", "Le lecteur de Ponéglyphe", "Kozuki Oden a rejoint l’équipage et apporté sa capacité à lire les Ponéglyphes au dernier voyage.", "story-roger", "legendary", "📜", "Faire réellement rejoindre Kozuki Oden à l’équipage.", { type: "story-crew-members", storyId: "roger", memberIds: ["roger-oden"] }),
    achievement("story-roger-three-legendary-arcs", "Trois chapitres d’une légende", "God Valley, Edd War et le Choc des Titans ont tous été vécus dans la même destinée.", "story-roger", "mythic", "◆", "Jouer les trois arcs légendaires au cours d’une même histoire de Roger.", { type: "story-arcs", storyId: "roger", arcIds: ["talent", "marineford", "emperor"], status: "encountered" }),
    achievement("story-roger-reach-laugh-tale", "Le rire au bout de la route", "L’Oro Jackson a atteint Laugh Tale.", "story-roger", "epic", "🏝️", "Atteindre Laugh Tale.", { type: "story-flag", storyId: "roger", flag: "reachedLaughTale" }),
    achievement("story-roger-heritage-complete", "L’Héritage accompli", "Le dernier choix de Roger a ouvert la voie à l’ère suivante.", "story-roger", "legendary", "👑", "Terminer l’histoire de Roger avec l’Héritage accompli.", { type: "story-ending", storyId: "roger", completed: true }),
    achievement("story-roger-great-pirate-era", "La Grande Ère des Pirates", "Les derniers mots ont lancé une vague impossible à contenir.", "story-roger", "mythic", "☀️", "Condition secrète", { type: "all-of", conditions: [{ type: "story-flag", storyId: "roger", flag: "storyRogerGreatEraLaunched" }, { type: "story-ending", storyId: "roger", completed: true }] }, { secret: true }),
    achievement("story-roger-perfect-score", "Une légende parfaite", "Cette vie de Roger s’est figée au sommet exact de la popularité.", "story-roger", "mythic", "💯", "Condition secrète", { type: "story-final-popularity", storyId: "roger", target: 100, exact: true }, { secret: true }),
    achievement("complete-first-run", "Premier voyage", "Une première aventure a rejoint ton histoire.", "adventure", "common", "🌊", "Terminer une aventure.", { type: "runs-completed", target: 1 }, { progressLabel: "Aventures terminées" }),
    achievement("complete-five-runs", "Le monde se souvient", "Plusieurs vies ont laissé leur trace sur les mers.", "adventure", "epic", "📚", "Enregistrer cinq anciennes vies dans le Panthéon.", { type: "runs-completed", target: 5 }, { progressLabel: "Anciennes vies" }),
    achievement("divelca", "Divelca", "Le roi des bêta-testeurs.", "adventure", "mythic", "👑", "Condition secrète", {
      type: "all-of",
      conditions: [
        { type: "runs-completed", target: 25 },
        { type: "dreams-completed", target: 1 },
      ],
    }, { secret: true }),
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
    // L'identifiant historique reste inchangé afin de préserver les profils et
    // les berrys déjà versés ; le Succès décrit désormais la statistique réelle.
    achievement("reach-high-haki", "Défense inébranlable", "Ta garde résiste aux dangers qui briseraient une carrière moins préparée.", "combat", "epic", "🛡️", "Atteindre 35 en Défense.", { type: "stat-at-least", stat: "haki", target: 35 }),
    achievement("awaken-first-haki", "Premier éveil", "Un véritable pouvoir de Haki s’est éveillé au cours d’une épreuve décisive.", "combat", "rare", "👁️", "Obtenir un premier Titre de Haki.", { type: "has-any-title", titleIds: ["haki-observation", "haki-armement", "haki-des-rois", "maitrise-haki-des-rois-plus"] }),
    achievement("awaken-kings-haki", "Volonté souveraine", "Une volonté capable d’ébranler les autres s’est manifestée.", "combat", "legendary", "👑", "Obtenir le Titre Haki des Rois.", { type: "has-any-title", titleIds: ["haki-des-rois", "maitrise-haki-des-rois-plus"] }),
    achievement("master-kings-haki", "Volonté maîtrisée", "Le Haki des Rois répond désormais à une intention consciente.", "combat", "mythic", "🌈", "Condition secrète", { type: "has-title", titleId: "maitrise-haki-des-rois-plus" }, { secret: true }),
    achievement("finish-low-combat", "Sans lever le poing", "La route s’est achevée sans faire de la force ta réponse principale.", "combat", "epic", "🕊️", "Terminer une aventure avec 12 ou moins en Combat.", { type: "finished-stat-at-most", stat: "combat", target: 12 }),
    achievement("reach-high-intelligence", "L’autre voie", "Une carrière entière s’est construite sur l’analyse et la stratégie.", "combat", "rare", "🧠", "Atteindre 60 en Intelligence.", { type: "stat-at-least", stat: "intelligence", target: 60 }),
    achievement("reach-high-charisma", "Une voix qui rassemble", "Ton influence personnelle a uni des alliés que tout séparait.", "crew", "rare", "✨", "Atteindre 75 en Charisme.", { type: "stat-at-least", stat: "charisma", target: 75 }),

    achievement("gather-large-crew", "Tous à bord", "Un équipage imposant s’est rassemblé autour de toi.", "crew", "uncommon", "👥", "Réunir au moins quatre membres d’équipage.", { type: "max-stat-at-least", stat: "crew", target: 4 }),
    achievement("recruit-legendary-companion", "Rencontre légendaire", "Une figure légendaire a accepté de partager temporairement cette route.", "crew", "legendary", "🤝", "Recruter un premier compagnon légendaire.", { type: "legendary-companion-recruited" }),
    achievement("shinsekai-damaged-ship", "Seul contre la mer", "Un équipage réduit a tout de même atteint le Nouveau Monde.", "crew", "epic", "👤", "Atteindre le Nouveau Monde avec un membre d’équipage ou moins.", { type: "zone-with-stat-at-most", zoneId: "shinsekai", stat: "crew", target: 1 }),

    achievement("gather-great-fortune", "Les poches pleines", "Ta Fortune dépasse celle de bien des capitaines.", "fortune", "uncommon", "💰", "Atteindre 150 000 berrys de Fortune.", { type: "stat-at-least", stat: "fortune", target: 150000 }),
    achievement("pirate-great-bounty", "Le journal parle de toi", "Ta prime pirate est devenue une nouvelle mondiale.", "fortune", "legendary", "☠️", "Atteindre une prime de 1 500 000 000 en tant que Pirate.", { type: "faction-stat", faction: "pirate", stat: "bounty", minimum: 5000000 }),

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
    achievement("complete-shop", "Collection du grand large", "Les sept objets d’aventure de la Boutique font désormais partie de ta collection.", "collection", "legendary", "🎒", "Posséder les sept objets d’aventure de la Boutique.", { type: "shop-items-owned", target: 7 }, { progressLabel: "Objets possédés" }),
    achievement("finish-with-two-items", "Bien préparé", "Deux héritages permanents ont soutenu une aventure complète sans décider de son destin à ta place.", "adventure", "rare", "🧰", "Terminer une aventure avec deux objets de Boutique actifs.", { type: "finished-with-shop-items", target: 2 }),
    achievement("popular-legend", "Au sommet des nouvelles", "Ta carrière s’est achevée parmi les noms les plus connus des mers.", "fortune", "legendary", "⭐", "Terminer une aventure avec au moins 95 de Popularité.", { type: "finished-popularity", target: 95 }),

    achievement("reach-marineford", "La forteresse se souvient", "Une carrière a été entraînée dans la nouvelle crise de Marineford.", "rare-events", "rare", "◆", "Atteindre l’arc légendaire de Marineford.", { type: "legendary-arc-encountered", arcId: "marineford" }),
    achievement("earn-marineford-title", "Trois actes à Marineford", "Une carrière a transformé les trois étapes de Marineford en légende.", "rare-events", "legendary", "⚓", "Obtenir un Titre exclusif de Marineford.", { type: "legendary-arc-title", arcId: "marineford" }),
    achievement("face-an-emperor", "Sous un pavillon impérial", "Une carrière a affronté directement l’influence d’un Empereur.", "rare-events", "epic", "👑", "Atteindre un Combat contre un Empereur.", { type: "legendary-arc-encountered", arcId: "emperor" }),
    achievement("earn-emperor-title", "Le monde retient le choc", "Une confrontation impériale s’est achevée sur un exploit incontestable.", "rare-events", "mythic", "🌊", "Obtenir un Titre exclusif lié à un Empereur.", { type: "legendary-arc-title", arcId: "emperor" }),
    achievement("face-an-admiral", "Face à un Amiral", "Une carrière révolutionnaire s’est retrouvée face à l’une des plus grandes forces de la Marine.", "rare-events", "epic", "⚓", "Atteindre l’arc VS Amiral.", { type: "legendary-arc-encountered", arcId: "admiral" }),
    achievement("earn-admiral-title", "La Révolution tient debout", "Une opération révolutionnaire a résisté à un Amiral et inscrit son exploit dans l’histoire.", "rare-events", "mythic", "✊", "Obtenir un Titre exclusif de VS Amiral.", { type: "legendary-arc-title", arcId: "admiral" }),
    achievement("earn-talent-title", "Une ascension prodigieuse", "Une carrière a transformé une promesse de Paradise en reconnaissance légendaire.", "rare-events", "legendary", "◆", "Obtenir un Titre exclusif de l’arc Un talent prodigieux ?", { type: "legendary-arc-title", arcId: "talent" }),
    achievement("play-davy-back-fight", "Le jeu des pirates", "Les règles du Davy Back Fight ont engagé deux équipages dans trois épreuves.", "rare-events", "epic", "🏁", "Participer à un Davy Back Fight.", { type:"legendary-arc-encountered",arcId:"davy" }),
    achievement("earn-davy-title", "Les règles sont les règles", "Deux manches remportées ont consacré un champion du Davy Back Fight.", "rare-events", "legendary", "🏆", "Obtenir Champion du Davy Back Fight.", {type:"legendary-arc-title",arcId:"davy"}),
    achievement("davy-perfect", "Trois victoires, trois nakamas", "Trois manches et trois choix ont bouleversé les deux équipages.", "challenges", "mythic", "☠️", "Condition secrète", {type:"davy-perfect"},{secret:true}),
    achievement("reach-impel-down", "Sous les six niveaux", "Une carrière a pénétré dans la plus grande prison du Gouvernement.", "rare-events", "epic", "⛓️", "Atteindre Impel Down.", {type:"legendary-arc-encountered",arcId:"impel-down"}),
    achievement("earn-impel-down-title", "Personne ne ferme cette porte", "La mission menée à Impel Down est devenue une légende.", "rare-events", "legendary", "🚪", "Obtenir un Titre exclusif d’Impel Down.", {type:"legendary-arc-title",arcId:"impel-down"}),
    achievement("face-warlord", "Face à un Grand Corsaire", "Une carrière a affronté l’une des puissances reconnues par le Gouvernement.", "rare-events", "epic", "⚔️", "Atteindre l’arc VS Grand Corsaire.", {type:"legendary-arc-encountered",arcId:"warlord"}),
    achievement("earn-warlord-title", "Au-dessus du décret", "Le statut de Grand Corsaire n’a pas suffi à fermer la route.", "rare-events", "legendary", "📜", "Obtenir un Titre exclusif VS Grand Corsaire.", {type:"legendary-arc-title",arcId:"warlord"}),
    achievement("complete-both-legendary-arcs", "Deux pages de légende", "Deux événements légendaires différents ont été remportés dans une même carrière.", "challenges", "mythic", "◆", "Réussir au moins deux arcs légendaires différents dans une même carrière.", { type: "both-legendary-arcs" }),
    achievement("encounter-three-legendary-arcs", "Trois pages de légende", "Trois événements légendaires différents ont marqué une même carrière.", "challenges", "mythic", "◆", "Rencontrer trois arcs légendaires différents dans une même carrière.", { type: "three-legendary-arcs" }, { secret: true }),

    achievement("unlock-ten-titles", "Collection de légendes", "Ta collection rassemble déjà de nombreuses identités remarquables.", "collection", "rare", "🎖️", "Débloquer dix Titres.", { type: "titles-unlocked", target: 10 }, { progressLabel: "Titres débloqués" }),
    achievement("three-temperaments", "Trois tempéraments", "Rusé, Bagarreur et Calme ont chacun marqué l’une de tes aventures.", "collection", "rare", "🎭", "Obtenir les Titres Rusé, Bagarreur et Calme.", { type: "specific-titles-collected", titleIds: ["temperament-cunning", "temperament-brawler", "temperament-calm"], target: 3 }, { progressLabel: "Tempéraments découverts" }),
    achievement("collect-three-haki-colors", "Les trois couleurs", "Les trois grandes formes de Haki ont marqué différentes vies de ta légende.", "collection", "legendary", "🌈", "Débloquer les trois couleurs fondamentales du Haki.", { type: "title-collection", titleIds: ["haki-observation", "haki-armement", "haki-des-rois"], aliases: { "haki-des-rois": ["maitrise-haki-des-rois-plus"] } }, { progressLabel: "Hakis découverts" }),
    achievement("collect-all-talent-titles", "Les quatre prodiges", "Chaque grande voie a laissé derrière elle un prodige reconnu sur Paradise.", "collection", "legendary", "◆", "Obtenir tous les Titres Prodige.", { type: "title-collection", filter: { category: "prodige" } }, { progressLabel: "Titres Prodige" }),
    achievement("collect-all-marineford-titles", "Marineford sous tous les pavillons", "Pirate, Marine, Chasseur et Révolutionnaire ont chacun inscrit une légende différente à Marineford.", "collection", "mythic", "⚓", "Obtenir tous les Titres de Marineford.", { type: "title-collection", filter: { category: "marineford" } }, { progressLabel: "Titres Marineford" }),
    achievement("collect-all-impel-down-titles", "Aucune porte ne tient", "Les quatre grandes voies ont chacune laissé leur marque dans les profondeurs d’Impel Down.", "collection", "legendary", "⛓️", "Obtenir tous les Titres d’Impel Down.", { type: "title-collection", filter: { category: "impel-down" } }, { progressLabel: "Titres Impel Down" }),
    achievement("collect-all-warlord-titles", "Le décret ne protège plus personne", "Tous les Grands Corsaires rencontrés ont dû reconnaître une légende qui dépassait leur statut.", "collection", "mythic", "⚔️", "Obtenir tous les Titres VS Grand Corsaire.", { type: "title-collection", filter: { category: "warlord" } }, { progressLabel: "Titres VS Grand Corsaire" }),
    achievement("collect-all-emperor-titles", "Au-dessus des Empereurs", "Toutes les grandes puissances impériales rencontrées ont fini par laisser un Titre dans ta collection.", "collection", "mythic", "👑", "Obtenir tous les Titres VS Empereur.", { type: "title-collection", filter: { category: "emperor" } }, { progressLabel: "Titres VS Empereur" }),
    achievement("collect-all-admiral-titles", "La justice ne suffit plus", "La Révolution a tenu tête à chacun des Amiraux inscrits dans cette époque.", "collection", "mythic", "✊", "Obtenir tous les Titres VS Amiral.", { type: "title-collection", filter: { category: "admiral" } }, { progressLabel: "Titres VS Amiral" }),
    achievement("collect-all-classic-legendary-titles", "Toutes les pages de légende", "Chaque famille d’événements légendaires du mode classique a laissé derrière elle tous ses Titres.", "collection", "mythic", "◆", "Condition secrète", { type: "title-collection", filter: { sourceTypes: ["legendary-talent", "legendary-marineford", "legendary-emperor", "legendary-admiral", "legendary-davy", "legendary-impel-down", "legendary-warlord"] } }, { secret: true, progressLabel: "Titres d’arcs légendaires" }),
    achievement("collect-all-mythic-titles", "Au sommet du mythe", "Tous les Titres Mythiques accessibles ont rejoint ta collection permanente.", "collection", "mythic", "🌈", "Condition secrète", { type: "title-collection", filter: { rarity: "mythic" } }, { secret: true, progressLabel: "Titres Mythiques" }),
    achievement("record-ten-lives", "Une mer de souvenirs", "Le Panthéon raconte désormais une véritable génération d’aventuriers.", "collection", "legendary", "👑", "Condition secrète", { type: "runs-completed", target: 10 }, { secret: true, progressLabel: "Anciennes vies" }),
  ];

  window.BLUE_LEGACY_ACHIEVEMENT_CATEGORY_META = categoryMeta;
  window.BLUE_LEGACY_ACHIEVEMENT_CATEGORY_ORDER = categoryOrder;
  window.BLUE_LEGACY_LEGACY_ACHIEVEMENT_ID_MAP = Object.freeze({});
  window.BLUE_LEGACY_ACHIEVEMENT_BERRY_REWARDS = achievementBerryRewards;
  window.SEA_OF_LEGENDS_ACHIEVEMENTS = Object.freeze(achievements);
})();
