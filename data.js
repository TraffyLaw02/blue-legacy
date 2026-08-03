/* ==========================================================
   BLUE LEGACY — DONNÉES GÉNÉRALES V1.1

   Ce fichier contient uniquement les catalogues généraux.
   Les événements, titres et succès vivent dans leurs fichiers dédiés.
========================================================== */

const GAME_DATA = {
  /* Création du personnage */
  sexes: [
    { id: "male", label: "Homme" },
    { id: "female", label: "Femme" },
  ],

  factions: [
    {
      id: "pirate",
      label: "🏴‍☠️ Pirate",
      description:
        "Choisis la liberté, rassemble un équipage et défie l’ordre établi.",
      desc:
        "Choisis la liberté, rassemble un équipage et défie l’ordre établi.",
      effects: { combat: 4, charisma: 3, bounty: 100000 },
    },
    {
      id: "bounty-hunter",
      label: "🎯 Chasseur de primes",
      description:
        "Vis de contrats, traque les criminels et préserve ton indépendance.",
      desc:
        "Vis de contrats, traque les criminels et préserve ton indépendance.",
      effects: { intelligence: 4, combat: 2, fortune: 15000 },
    },
    {
      id: "revolutionary",
      label: "🔥 Révolutionnaire",
      description:
        "Agis dans l’ombre pour libérer les peuples et combattre l’oppression.",
      desc:
        "Agis dans l’ombre pour libérer les peuples et combattre l’oppression.",
      effects: { intelligence: 3, charisma: 4, haki: 2 },
    },
    {
      id: "marine",
      label: "⚓ Marine",
      description:
        "Suis une justice exigeante, impose ta discipline et gravis la hiérarchie.",
      desc:
        "Suis une justice exigeante, impose ta discipline et gravis la hiérarchie.",
      effects: { health: 4, combat: 3, intelligence: 2 },
    },
  ],

  /* Rêves disponibles pour chaque voie */
  dreams: {
    pirate: [
      {
        id: "one-piece",
        label: "Trouver le One Piece",
        description:
          "Rassemble les indices, traverse les mers les plus dangereuses et atteins la destination ultime.",
        ultimate: "Roi des Pirates",
        ultimateId: "roi-des-pirates",
      },
      {
        id: "sea-emperor",
        label: "Devenir un Empereur des mers",
        description:
          "Bâtis une puissance capable de rivaliser avec les plus grandes flottes.",
        ultimate: "Empereur des mers",
        ultimateId: "empereur-des-mers",
      },
      {
        id: "worlds-greatest-fortune",
        label: "Amasser la plus grande fortune du monde",
        description:
          "Découvre des trésors, négocie habilement et protège tes richesses.",
        ultimate: "Seigneur des trésors",
        ultimateId: "seigneur-des-tresors",
      },
      {
        id: "forgotten-history",
        label: "Découvrir l’Histoire oubliée",
        description:
          "Recherche les traces du passé et révèle les secrets que le monde dissimule.",
        ultimate: "Gardien de l’Histoire oubliée",
        ultimateId: "gardien-histoire-oubliee",
      },
    ],
    "bounty-hunter": [
      {
        id: "greatest-bounty-hunter",
        label: "Devenir le plus grand chasseur de primes",
        description:
          "Enchaîne les contrats difficiles sans perdre ton indépendance.",
        ultimate: "Légende des chasseurs",
        ultimateId: "legende-des-chasseurs",
      },
      {
        id: "most-dangerous-criminals",
        label: "Capturer les criminels les plus dangereux",
        description:
          "Prépare tes traques et livre les cibles que personne d’autre n’approche.",
        ultimate: "Fléau des criminels",
        ultimateId: "fleau-des-criminels",
      },
      {
        id: "hunt-an-emperor",
        label: "Traquer un Empereur",
        description:
          "Développe une force et un réseau suffisants pour affronter une puissance mondiale.",
        ultimate: "Tombeur d’Empereur",
        ultimateId: "tombeur-empereur",
      },
      {
        id: "contract-fortune",
        label: "Amasser une fortune grâce aux contrats",
        description:
          "Sélectionne les missions les plus rentables et survis aux pièges des commanditaires.",
        ultimate: "Maître des contrats",
        ultimateId: "maitre-des-contrats",
      },
    ],
    revolutionary: [
      {
        id: "break-the-chains",
        label: "Briser les chaînes",
        description:
          "Mettre fin à l’esclavage, démanteler ses réseaux et libérer ceux que le monde a condamnés à vivre enchaînés.",
        ultimate: "Briseur de chaînes",
        ultimateId: "chain-breaker",
        progressionTags: [
          "prisoner-rescue",
          "slavery-network",
          "trafficking",
          "oppressed-people",
        ],
      },
      {
        id: "reveal-void-century",
        label: "Révéler le Siècle oublié",
        description:
          "Découvrir la véritable histoire du monde et la rendre impossible à étouffer.",
        ultimate: "Porteur de la vérité",
        ultimateId: "truth-bearer",
        progressionTags: [
          "poneglyph",
          "forbidden-archive",
          "protected-witness",
          "truth-broadcast",
        ],
      },
      {
        id: "build-underground-network",
        label: "Bâtir le plus grand réseau clandestin",
        description:
          "Étendre l’Armée révolutionnaire dans toutes les mers grâce à un réseau de cellules, d’agents et de routes secrètes.",
        ultimate: "Architecte de la Révolution",
        ultimateId: "architect-of-revolution",
        progressionTags: [
          "revolutionary-cell",
          "agent-recruitment",
          "secret-route",
          "coordinated-operation",
        ],
      },
      {
        id: "found-free-nation",
        label: "Fonder une nation libre",
        description:
          "Créer un territoire indépendant du Gouvernement mondial et protéger durablement son peuple.",
        ultimate: "Fondateur du peuple libre",
        ultimateId: "founder-of-free-people",
        progressionTags: [
          "liberated-territory",
          "free-institution",
          "alliance",
          "lasting-defense",
        ],
      },
    ],
    marine: [
      {
        id: "admiral",
        label: "Devenir Amiral",
        description:
          "Accomplis des missions majeures et impose ta vision de la justice.",
        ultimate: "Amiral",
        ultimateId: "amiral",
      },
      {
        id: "fleet-admiral",
        label: "Devenir Amiral en chef",
        description:
          "Gravis toute la hiérarchie et assume la direction de la Marine.",
        ultimate: "Amiral en chef",
        ultimateId: "amiral-en-chef",
      },
      {
        id: "reform-the-marines",
        label: "Réformer la Marine",
        description:
          "Gagne assez d’influence pour combattre les abus depuis l’intérieur.",
        ultimate: "Justice nouvelle",
        ultimateId: "justice-nouvelle",
      },
      {
        id: "greatest-marine-hero",
        label: "Devenir le plus grand héros de la Marine",
        description:
          "Protège les innocents lors des crises qui marqueront l’histoire.",
        ultimate: "Héros de la Marine",
        ultimateId: "heros-de-la-marine",
      },
    ],
  },

  origins: [
    {
      id: "east-blue",
      label: "East Blue",
      description:
        "Une mer relativement paisible où les légendes apprennent à rêver.",
      hint:
        "Une mer paisible où les liens forgés au départ peuvent porter une légende très loin.",
      zoneId: "east-blue",
      effects: { charisma: 2 },
    },
    {
      id: "north-blue",
      label: "North Blue",
      description:
        "Une mer froide marquée par les conflits, les familles et la stratégie.",
      hint:
        "Grandir ici apprend à rester debout lorsque le monde devient hostile.",
      zoneId: "north-blue",
      effects: { intelligence: 3, combat: 1 },
    },
    {
      id: "south-blue",
      label: "South Blue",
      description:
        "Une mer vivante où l’entraide et les communautés occupent une place centrale.",
      hint:
        "Dans cette mer animée, une rencontre peut rapidement devenir un équipage.",
      zoneId: "south-blue",
      effects: { health: 3, fortune: 5000 },
    },
    {
      id: "west-blue",
      label: "West Blue",
      description:
        "Une mer de réseaux secrets où survivre demande intuition et maîtrise.",
      hint:
        "Ici, lire les gens et saisir les bonnes occasions vaut parfois mieux qu’une arme.",
      zoneId: "west-blue",
      effects: { intelligence: 2, haki: 1 },
    },
  ],

  /* Référentiels narratifs utilisés par les événements */
  styles: [
    {
      id: "epeiste",
      label: "Épéiste",
      description: "Spécialiste des sabres, de la précision et du duel.",
      category: "combat",
    },
    {
      id: "sniper",
      label: "Sniper",
      description: "Combattant patient privilégiant la distance et la visée.",
      category: "combat",
    },
    {
      id: "corps-a-corps",
      label: "Corps-à-corps",
      description: "Combattant résistant qui maîtrise prises et affrontements rapprochés.",
      category: "combat",
    },
    {
      id: "artiste-martial",
      label: "Artiste martial",
      description: "Spécialiste d’une discipline physique précise et maîtrisée.",
      category: "combat",
    },
    {
      id: "navigateur",
      label: "Navigateur",
      description: "Expert des courants, des cartes et des routes impossibles.",
      category: "specialisation",
    },
    {
      id: "medecin",
      label: "Médecin",
      description: "Soigneur capable d’agir malgré la pression et le danger.",
      category: "specialisation",
    },
    {
      id: "musicien",
      label: "Musicien",
      description: "Artiste qui soutient les autres et marque les mémoires.",
      category: "specialisation",
    },
    {
      id: "inventeur",
      label: "Inventeur",
      description: "Créateur de mécanismes, d’outils et de solutions inattendues.",
      category: "specialisation",
    },
    {
      id: "utilisateur-armes",
      label: "Utilisateur d’armes",
      description: "Combattant adaptable sachant exploiter différentes armes.",
      category: "combat",
    },
  ],

  traits: [
    { id: "prudent", label: "Prudent", description: "Évalue les dangers avant d’agir.", category: "temperament" },
    { id: "calme", label: "Calme", description: "Garde son sang-froid sous pression.", category: "temperament" },
    { id: "impulsif", label: "Impulsif", description: "Agit souvent avant d’avoir tout évalué.", category: "temperament" },
    { id: "compatissant", label: "Compatissant", description: "Accorde de l’importance à la souffrance des autres.", category: "valeur" },
    { id: "courageux", label: "Courageux", description: "Affronte le danger malgré la peur.", category: "valeur" },
    { id: "rusé", label: "Rusé", description: "Préfère les détours intelligents à la force brute.", category: "methode" },
    { id: "charismatique", label: "Charismatique", description: "Sait rallier et inspirer les autres.", category: "social" },
    { id: "curieux", label: "Curieux", description: "Cherche à comprendre ce qui lui est inconnu.", category: "methode" },
    { id: "pragmatique", label: "Pragmatique", description: "Choisit les solutions concrètes et efficaces.", category: "methode" },
    { id: "organisé", label: "Organisé", description: "Structure les efforts d’un groupe avec méthode.", category: "social" },
    { id: "tenace", label: "Tenace", description: "Continue malgré les revers et la fatigue.", category: "temperament" },
    { id: "créatif", label: "Créatif", description: "Imagine des réponses que les autres ne voient pas.", category: "methode" },
    { id: "patient", label: "Patient", description: "Accepte d’attendre le bon moment.", category: "temperament" },
    { id: "responsable", label: "Responsable", description: "Assume les conséquences de ses décisions.", category: "valeur" },
    { id: "discipliné", label: "Discipliné", description: "Progresse par l’entraînement et la maîtrise.", category: "temperament" },
    { id: "opportuniste", label: "Opportuniste", description: "Repère rapidement les occasions avantageuses.", category: "methode" },
    { id: "altruiste", label: "Altruiste", description: "Place volontiers l’intérêt collectif avant le sien.", category: "valeur" },
    { id: "arrogant", label: "Arrogant", description: "Surestime parfois ses capacités face aux autres.", category: "temperament" },
  ],

  /* Catalogues des surprises. Les bonus restent permanents mais ne garantissent jamais une issue. */
  devilFruits: [
    {
      id: "tori-tori-phoenix", name: "Tori Tori no Mi, modèle Phénix", type: "Zoan mythique", icon: "🔥",
      description: "Une régénération prodigieuse portée par les flammes bleues.",
      loreDescription: "Permet de devenir un phénix et de régénérer les blessures grâce à des flammes bleues.",
      primaryStat: "health", secondaryStat: "haki", permanentEffects: { health: 10, haki: 3 }, rarity: "legendary",
    },
    {
      id: "nikyu-nikyu", name: "Nikyu Nikyu no Mi", type: "Paramecia", icon: "🐾",
      description: "Repousse attaques, douleur et fatigue d’un simple contact.",
      loreDescription: "Crée des coussinets capables de repousser presque toute chose, y compris la douleur et la fatigue.",
      primaryStat: "health", secondaryStat: "haki", permanentEffects: { health: 8, haki: 4 }, rarity: "legendary",
    },
    {
      id: "gura-gura", name: "Gura Gura no Mi", type: "Paramecia", icon: "💥",
      description: "Déchaîne des secousses capables d’ébranler la mer elle-même.",
      loreDescription: "Permet de produire de puissantes vibrations et des séismes dans l’air, la terre et la mer.",
      primaryStat: "combat", secondaryStat: "bounty", permanentEffects: { combat: 11, bounty: 250000 }, rarity: "legendary",
    },
    {
      id: "supa-supa", name: "Supa Supa no Mi", type: "Paramecia", icon: "🗡️",
      description: "Transforme le corps en lames d’acier redoutables.",
      loreDescription: "Permet de transformer n’importe quelle partie de son corps en lame d’acier.",
      primaryStat: "combat", secondaryStat: "haki", permanentEffects: { combat: 8, haki: 3 }, rarity: "epic",
    },
    {
      id: "bari-bari", name: "Bari Bari no Mi", type: "Paramecia", icon: "🔰",
      description: "Érige des barrières presque impossibles à briser.",
      loreDescription: "Permet de créer des barrières solides aux formes variées.",
      primaryStat: "haki", secondaryStat: "health", permanentEffects: { haki: 10, health: 2 }, rarity: "epic",
    },
    {
      id: "kira-kira", name: "Kira Kira no Mi", type: "Paramecia", icon: "💎",
      description: "Change le corps en diamant pour encaisser les pires chocs.",
      loreDescription: "Permet de transformer tout ou partie de son corps en diamant.",
      primaryStat: "haki", secondaryStat: "health", permanentEffects: { haki: 8, health: 4 }, rarity: "epic",
    },
    {
      id: "mero-mero", name: "Mero Mero no Mi", type: "Paramecia", icon: "💗",
      description: "Exploite les émotions pour pétrifier ceux qui y succombent.",
      loreDescription: "Permet de pétrifier les personnes qui éprouvent de l’attirance envers son utilisateur.",
      primaryStat: "charisma", secondaryStat: null, permanentEffects: { charisma: 10 }, rarity: "epic",
    },
    {
      id: "horo-horo", name: "Horo Horo no Mi", type: "Paramecia", icon: "👻",
      description: "Des Hollows capables de briser le moral et d’explorer à distance.",
      loreDescription: "Permet de créer et contrôler des Hollows qui affectent le moral de leurs cibles.",
      primaryStat: "charisma", secondaryStat: "intelligence", permanentEffects: { charisma: 8, intelligence: 3 }, rarity: "epic",
    },
    {
      id: "giro-giro", name: "Giro Giro no Mi", type: "Paramecia", icon: "👁️",
      description: "Observe à très longue distance et perce les pensées.",
      loreDescription: "Accorde une vision à travers les obstacles, sur de longues distances, et permet de lire les pensées.",
      primaryStat: "intelligence", secondaryStat: null, permanentEffects: { intelligence: 10 }, rarity: "epic",
    },
    {
      id: "hana-hana", name: "Hana Hana no Mi", type: "Paramecia", icon: "🌸",
      description: "Fait éclore des membres partout pour observer et agir simultanément.",
      loreDescription: "Permet de faire éclore des parties de son corps sur toute surface à portée.",
      primaryStat: "intelligence", secondaryStat: "combat", permanentEffects: { intelligence: 8, combat: 3 }, rarity: "epic",
    },
    {
      id: "magu-magu", name: "Magu Magu no Mi", type: "Logia", icon: "🌋",
      description: "Une puissance de magma dont la seule réputation inspire la crainte.",
      loreDescription: "Permet de créer, contrôler et devenir du magma.",
      primaryStat: "bounty", secondaryStat: "combat", permanentEffects: { bounty: 400000, combat: 5 }, rarity: "legendary",
    },
    {
      id: "goro-goro", name: "Goro Goro no Mi", type: "Logia", icon: "⚡",
      description: "La foudre offre une puissance spectaculaire et une perception hors norme.",
      loreDescription: "Permet de créer, contrôler et devenir la foudre.",
      primaryStat: "bounty", secondaryStat: "intelligence", permanentEffects: { bounty: 350000, intelligence: 4 }, rarity: "legendary",
    },
    { id: "horu-horu", name: "Horu Horu no Mi", type: "Paramecia", icon: "💉", description: "Des hormones capables de stimuler fortement le corps.", loreDescription: "Permet de créer et injecter diverses hormones modifiant le corps.", primaryStat: "health", secondaryStat: "charisma", permanentEffects: { health: 7, charisma: 2 }, rarity: "epic" },
    { id: "chiyu-chiyu", name: "Chiyu Chiyu no Mi", type: "Paramecia", icon: "💧", description: "Des larmes qui accélèrent la guérison des êtres vivants.", loreDescription: "Permet de soigner les blessures grâce à des larmes curatives.", primaryStat: "health", secondaryStat: "charisma", permanentEffects: { health: 8, charisma: 1 }, rarity: "epic" },
    { id: "bomu-bomu", name: "Bomu Bomu no Mi", type: "Paramecia", icon: "💣", description: "Transforme chaque partie du corps en arme explosive.", loreDescription: "Rend le corps explosif sans blesser son utilisateur avec ses propres détonations.", primaryStat: "combat", secondaryStat: "health", permanentEffects: { combat: 7, health: 2 }, rarity: "rare" },
    { id: "neko-neko-leopard", name: "Neko Neko no Mi, modèle Léopard", type: "Zoan", icon: "🐆", description: "Une forme léopard rapide, puissante et prédatrice.", loreDescription: "Permet de devenir un léopard ou une forme hybride.", primaryStat: "combat", secondaryStat: "health", permanentEffects: { combat: 8, health: 2 }, rarity: "epic" },
    { id: "doru-doru", name: "Doru Doru no Mi", type: "Paramecia", icon: "🕯️", description: "Produit une cire assez solide pour former armes et remparts.", loreDescription: "Permet de créer et manipuler une cire durcie résistante.", primaryStat: "haki", secondaryStat: "intelligence", permanentEffects: { haki: 7, intelligence: 2 }, rarity: "rare" },
    { id: "sube-sube", name: "Sube Sube no Mi", type: "Paramecia", icon: "🫧", description: "Fait glisser les attaques sur une peau parfaitement lisse.", loreDescription: "Rend le corps extrêmement lisse, faisant dévier de nombreux contacts.", primaryStat: "haki", secondaryStat: "health", permanentEffects: { haki: 6, health: 2 }, rarity: "rare" },
    { id: "kobu-kobu", name: "Kobu Kobu no Mi", type: "Paramecia", icon: "📣", description: "Éveille le courage et la force de ceux qui écoutent.", loreDescription: "Permet d'encourager une foule et d'accroître sa détermination.", primaryStat: "charisma", secondaryStat: "combat", permanentEffects: { charisma: 8, combat: 1 }, rarity: "epic" },
    { id: "mane-mane", name: "Mane Mane no Mi", type: "Paramecia", icon: "🎭", description: "Copie parfaitement le visage et le corps d'une personne touchée.", loreDescription: "Permet d'adopter l'apparence d'une personne préalablement touchée.", primaryStat: "charisma", secondaryStat: "intelligence", permanentEffects: { charisma: 6, intelligence: 3 }, rarity: "rare" },
    { id: "ope-ope", name: "Ope Ope no Mi", type: "Paramecia", icon: "🔵", description: "Crée une zone où chaque élément peut être réorganisé avec précision.", loreDescription: "Permet de manipuler les êtres et objets situés dans une ROOM.", primaryStat: "intelligence", secondaryStat: "combat", permanentEffects: { intelligence: 9, combat: 2 }, rarity: "legendary" },
    { id: "nagi-nagi", name: "Nagi Nagi no Mi", type: "Paramecia", icon: "🔇", description: "Supprime tout son dans une zone choisie.", loreDescription: "Permet de créer un espace entièrement silencieux.", primaryStat: "intelligence", secondaryStat: "charisma", permanentEffects: { intelligence: 7, charisma: 2 }, rarity: "rare" },
    { id: "suna-suna", name: "Suna Suna no Mi", type: "Logia", icon: "🏜️", description: "Le sable impose une présence redoutée sur tout un territoire.", loreDescription: "Permet de créer, contrôler et devenir du sable.", primaryStat: "bounty", secondaryStat: "combat", permanentEffects: { bounty: 300000, combat: 3 }, rarity: "legendary" },
    { id: "zushi-zushi", name: "Zushi Zushi no Mi", type: "Paramecia", icon: "☄️", description: "La gravité confère une puissance et une autorité écrasantes.", loreDescription: "Permet de manipuler les forces gravitationnelles.", primaryStat: "bounty", secondaryStat: "haki", permanentEffects: { bounty: 320000, haki: 3 }, rarity: "legendary" },
  ],

  crewRecruitments: [
    { id: "marco", name: "Marco", role: "Médecin", icon: "🔥", description: "Protège les blessés le temps de régler une dette envers leur équipage.", primaryStat: "health", rarity: "legendary", minStage: 5, allowedFactions: ["pirate", "revolutionary"], permanentEffects: { health: 5, haki: 1 } },
    { id: "chopper", name: "Chopper", role: "Médecin légendaire", category: "medical", icon: "🦌", description: "Séparé momentanément de l’équipage de Luffy, il conclut une alliance médicale exceptionnelle pour soigner les blessés de la route.", recruitmentText: "Chopper accompagne temporairement ton groupe dans le cadre d’une mission médicale commune.", primaryStat: "health", rarity: "legendary", minStage: 4, allowedFactions: ["pirate", "bounty-hunter", "revolutionary"], permanentEffects: { health: 7, intelligence: 3, charisma: 2, popularity: 2 } },
    { id: "mansherry", name: "Mansherry", role: "Guérisseuse alliée", icon: "💧", description: "Accompagne temporairement une cause qui protège les innocents.", primaryStat: "health", rarity: "epic", allowedFactions: ["revolutionary", "bounty-hunter"], permanentEffects: { health: 5, charisma: 1 } },
    { id: "kureha", name: "Kureha", role: "Médecin", icon: "🩺", description: "Accepte la route pour transmettre son savoir médical à un groupe prometteur.", primaryStat: "health", rarity: "rare", allowedFactions: ["pirate", "bounty-hunter", "revolutionary"], permanentEffects: { health: 4, intelligence: 1 } },
    { id: "aladine", name: "Aladine", role: "Médecin et timonier", icon: "🐟", description: "Prête son expérience à ceux qui respectent les peuples de la mer.", primaryStat: "health", rarity: "epic", minStage: 3, allowedFactions: ["pirate", "revolutionary"], permanentEffects: { health: 4, charisma: 1 } },
    { id: "bepo", name: "Bepo", role: "Navigateur", icon: "🐻", description: "Cherche un passage sûr après avoir été séparé de ses compagnons.", primaryStat: "intelligence", rarity: "rare", allowedFactions: ["pirate", "bounty-hunter"], permanentEffects: { intelligence: 4, health: 1 } },
    { id: "nami", name: "Nami", role: "Navigatrice légendaire", category: "navigation", icon: "🧭", description: "Une carte et une tempête imposent une navigation commune exceptionnelle sans rompre ses liens avec l’équipage de Luffy.", recruitmentText: "Nami accepte une navigation temporaire pour mener ton groupe au-delà d’une route météorologique impossible.", primaryStat: "intelligence", rarity: "legendary", minStage: 4, allowedFactions: ["pirate", "bounty-hunter", "revolutionary"], permanentEffects: { intelligence: 7, haki: 4, charisma: 2, fortune: 5000, popularity: 2 } },
    { id: "jean-bart", name: "Jean Bart", role: "Timonier", active: false, icon: "⚓", description: "Protège une traversée en échange d'une route loin des trafiquants.", primaryStat: "health", rarity: "rare", allowedFactions: ["pirate", "bounty-hunter", "revolutionary"], permanentEffects: { health: 4, combat: 1 } },
    { id: "shachi", name: "Shachi", role: "Marin", active: false, icon: "🌊", description: "Met sa mobilité au service d'une opération maritime précise.", primaryStat: "intelligence", rarity: "uncommon", allowedFactions: ["pirate", "bounty-hunter"], permanentEffects: { intelligence: 3, health: 1 } },
    { id: "penguin", name: "Penguin", role: "Marin", active: false, icon: "🐧", description: "Propose ses relevés de courants contre une place pour la prochaine étape.", primaryStat: "intelligence", rarity: "uncommon", allowedFactions: ["pirate", "bounty-hunter"], permanentEffects: { intelligence: 3, charisma: 1 } },
    { id: "hatchan", name: "Hatchan", role: "Guide des fonds marins", category: "navigation", icon: "🐙", description: "Met sa connaissance des courants sous-marins au service d’une traversée qui protège les habitants de la mer.", primaryStat: "health", rarity: "rare", allowedFactions: ["pirate", "bounty-hunter", "revolutionary"], permanentEffects: { health: 3, haki: 2 } },
    { id: "cabaji", name: "Cabaji", role: "Manœuvrier agile", category: "navigation", icon: "🎪", description: "Apporte ses manœuvres rapides et sa discipline d’équipage à une alliance de circonstance.", primaryStat: "haki", rarity: "uncommon", allowedFactions: ["pirate", "bounty-hunter"], permanentEffects: { haki: 2, combat: 2, charisma: 1 } },
    { id: "vito", name: "Vito", role: "Coordinateur naval", category: "navigation", icon: "🔫", description: "Coordonne une opération navale et une infiltration pour servir un accord strictement limité.", primaryStat: "intelligence", rarity: "rare", minStage: 3, allowedFactions: ["pirate", "bounty-hunter", "revolutionary"], permanentEffects: { intelligence: 3, combat: 2, charisma: 1 } },
    { id: "wadatsumi", name: "Wadatsumi", role: "Protecteur maritime", icon: "🐋", description: "Escorte ceux qui ont défendu les Hommes-Poissons.", primaryStat: "health", rarity: "epic", minStage: 4, allowedFactions: ["pirate", "revolutionary"], permanentEffects: { health: 5 } },
    { id: "kinemon", name: "Kin’emon", role: "Samouraï", icon: "🦊", description: "Accompagne une alliance dont les intérêts croisent ceux de Wano.", primaryStat: "combat", rarity: "epic", minStage: 4, allowedFactions: ["pirate", "revolutionary"], permanentEffects: { combat: 5, charisma: 1 } },
    { id: "kawamatsu", name: "Kawamatsu", role: "Protecteur", icon: "🐡", description: "Soutient une route qui libère des prisonniers et protège les faibles.", primaryStat: "haki", rarity: "epic", minStage: 4, allowedFactions: ["pirate", "revolutionary"], permanentEffects: { haki: 4, combat: 1 } },
    { id: "killer", name: "Killer", role: "Combattant", icon: "⚔️", description: "Conclut une alliance de circonstance contre un ennemi commun.", primaryStat: "combat", rarity: "epic", minStage: 5, allowedFactions: ["pirate", "bounty-hunter"], permanentEffects: { combat: 5 } },
    { id: "daz-bonez", name: "Daz Bonez", role: "Combattant", icon: "🗡️", description: "Accepte un contrat commun lorsque les objectifs restent clairement définis.", primaryStat: "combat", rarity: "rare", allowedFactions: ["pirate", "bounty-hunter"], permanentEffects: { combat: 4, haki: 1 } },
    { id: "bartolomeo", name: "Bartolomeo", role: "Protecteur", icon: "🛡️", description: "Offre sa barrière à un capitaine dont les actes l'ont impressionné.", primaryStat: "haki", rarity: "epic", minStage: 3, allowedFactions: ["pirate"], permanentEffects: { haki: 5, charisma: 1 } },
    { id: "cavendish", name: "Cavendish", role: "Bretteur", icon: "🌹", description: "S'associe à une aventure capable de replacer son nom à la une.", primaryStat: "charisma", rarity: "epic", minStage: 3, allowedFactions: ["pirate", "bounty-hunter"], permanentEffects: { charisma: 4, combat: 2 } },
    { id: "sai", name: "Sai", role: "Combattant", icon: "🐉", description: "Engage sa force auprès d'une alliance qui respecte ses responsabilités.", primaryStat: "combat", rarity: "rare", minStage: 3, allowedFactions: ["pirate", "revolutionary"], permanentEffects: { combat: 4, charisma: 1 } },
    { id: "yamato", name: "Yamato", role: "Combattante et protectrice", category: "combat", icon: "🪨", description: "Guidée par la volonté d’Oden et son désir de liberté, elle protège une alliance liée à Wano sans devenir une recrue ordinaire.", recruitmentText: "Yamato accompagne ton groupe dans une alliance exceptionnelle liée à la liberté de Wano.", primaryStat: "combat", rarity: "legendary", minStage: 5, allowedFactions: ["pirate", "bounty-hunter", "revolutionary"], permanentEffects: { combat: 8, haki: 6, health: 4, charisma: 2, popularity: 3 } },
    { id: "capone-bege", name: "Capone Bege", role: "Stratège", icon: "🏰", description: "Propose une alliance limitée contre une puissance qui menace aussi sa famille.", primaryStat: "intelligence", rarity: "epic", minStage: 4, allowedFactions: ["pirate", "bounty-hunter"], permanentEffects: { intelligence: 5, charisma: -1 } },
    { id: "viola", name: "Viola", role: "Informatrice alliée", icon: "👁️", description: "Partage ses informations pour protéger Dressrosa d'une menace persistante.", primaryStat: "intelligence", rarity: "epic", minStage: 3, allowedFactions: ["revolutionary", "bounty-hunter"], permanentEffects: { intelligence: 5, charisma: 1 } },
    { id: "pudding", name: "Charlotte Pudding", role: "Informatrice", icon: "🎞️", description: "Coopère pour préserver un secret et détourner une poursuite familiale.", primaryStat: "intelligence", rarity: "epic", minStage: 5, allowedFactions: ["pirate", "bounty-hunter"], permanentEffects: { intelligence: 5 } },
    { id: "perona", name: "Perona", role: "Éclaireuse", icon: "👻", description: "Cherche une traversée confortable et un objectif suffisamment étrange.", primaryStat: "charisma", rarity: "rare", allowedFactions: ["pirate", "bounty-hunter"], permanentEffects: { charisma: 4, intelligence: 1 } },
    { id: "bon-clay", name: "Bon Clay", role: "Infiltrateur", icon: "🦢", description: "Rejoint une cause qui place l'amitié et la liberté au-dessus du profit.", primaryStat: "charisma", rarity: "epic", minStage: 3, allowedFactions: ["pirate", "revolutionary"], permanentEffects: { charisma: 5, intelligence: 1 } },
    { id: "belo-betty", name: "Belo Betty", role: "Commandante alliée", icon: "📣", description: "Coordonne une campagne destinée à rendre un peuple capable de se défendre.", primaryStat: "charisma", rarity: "legendary", minStage: 4, allowedFactions: ["revolutionary"], permanentEffects: { charisma: 6 } },
    { id: "lindbergh", name: "Lindbergh", role: "Inventeur", icon: "🛠️", description: "Déploie ses inventions pour une opération révolutionnaire exigeante.", primaryStat: "intelligence", rarity: "epic", minStage: 4, allowedFactions: ["revolutionary"], permanentEffects: { intelligence: 5, combat: 1 } },
    { id: "vegapunk", name: "Vegapunk", role: "Scientifique et stratège", category: "strategy", icon: "🧠", description: "Une extraction urgente transforme sa protection en collaboration scientifique exceptionnelle, limitée à cette carrière.", recruitmentText: "Vegapunk rejoint temporairement ta route sous protection afin de poursuivre une collaboration scientifique décisive.", primaryStat: "intelligence", rarity: "legendary", minStage: 5, allowedFactions: ["pirate", "bounty-hunter", "revolutionary"], permanentEffects: { intelligence: 9, haki: 3, combat: 2, charisma: 2, popularity: 3 } },
    { id: "hiluluk", name: "Hiluluk", role: "Médecin idéaliste", category: "medical", icon: "🌸", description: "Médecin atypique et risqué, il soutient les blessés avec une conviction assez forte pour rendre courage à tout un groupe.", primaryStat: "health", rarity: "rare", allowedFactions: ["pirate", "bounty-hunter", "revolutionary"], permanentEffects: { health: 3, charisma: 2 } },
    { id: "paulie", name: "Paulie", role: "Charpentier", active: false, icon: "🪢", description: "Embarque le temps de remettre un navire et son équipage en état.", primaryStat: "health", rarity: "rare", allowedFactions: ["pirate", "bounty-hunter", "revolutionary"], permanentEffects: { health: 3, intelligence: 2 } },
  ],

  marineRecruitments: [
    { id: "garp", name: "Garp", rank: "Vice-Amiral", role: "Mentor exceptionnel", icon: "👊", description: "Supervise temporairement une unité dont la justice lui paraît digne d'intérêt.", primaryStat: "haki", rarity: "legendary", minStage: 5, permanentEffects: { haki: 5, combat: 1 } },
    { id: "tsuru", name: "Tsuru", rank: "Vice-Amirale", role: "Conseillère stratégique", icon: "🕊️", description: "Place l'unité sous son conseil pour démanteler un réseau complexe.", primaryStat: "intelligence", rarity: "legendary", minStage: 5, permanentEffects: { intelligence: 5, charisma: 1 } },
    { id: "smoker", name: "Smoker", rank: "Vice-Amiral", role: "Commandant de terrain", icon: "💨", description: "Joint ses forces à l'unité lorsqu'un ordre officiel protège mal les civils.", primaryStat: "combat", rarity: "epic", minStage: 3, permanentEffects: { combat: 4, haki: 1 } },
    { id: "momonga", name: "Momonga", rank: "Vice-Amiral", role: "Sabreur", icon: "🗡️", description: "Renforce une opération qui exige discipline et résistance.", primaryStat: "haki", rarity: "epic", minStage: 3, permanentEffects: { haki: 4, combat: 1 } },
    { id: "onigumo", name: "Onigumo", rank: "Vice-Amiral", role: "Commandant offensif", icon: "🕷️", description: "Prend en charge la ligne d'assaut d'une mission autorisée.", primaryStat: "combat", rarity: "rare", minStage: 3, permanentEffects: { combat: 4 } },
    { id: "doberman", name: "Doberman", rank: "Vice-Amiral", role: "Commandant", icon: "🐕", description: "Apporte l'expérience des opérations de grande ampleur.", primaryStat: "charisma", rarity: "rare", minStage: 3, permanentEffects: { charisma: 3, combat: 1 } },
    { id: "dalmatian", name: "Dalmatian", rank: "Vice-Amiral", role: "Combattant", icon: "🐾", description: "Renforce une unité confrontée à des adversaires particulièrement mobiles.", primaryStat: "combat", rarity: "rare", minStage: 3, permanentEffects: { combat: 4, health: 1 } },
    { id: "stainless", name: "Stainless", rank: "Vice-Amiral", role: "Coordinateur", icon: "⚓", description: "Coordonne plusieurs bâtiments pendant une opération délicate.", primaryStat: "intelligence", rarity: "rare", minStage: 3, permanentEffects: { intelligence: 3, charisma: 1 } },
    { id: "yamakaji", name: "Yamakaji", rank: "Vice-Amiral", role: "Commandant vétéran", icon: "🚬", description: "Stabilise la chaîne de commandement pendant une crise.", primaryStat: "charisma", rarity: "rare", minStage: 3, permanentEffects: { charisma: 4 } },
    { id: "bastille", name: "Bastille", rank: "Vice-Amiral", role: "Combattant lourd", icon: "🪓", description: "Tient la ligne lors d'une bataille de grande ampleur.", primaryStat: "health", rarity: "rare", minStage: 3, permanentEffects: { health: 3, combat: 2 } },
    { id: "maynard", name: "Maynard", rank: "Vice-Amiral", role: "Officier d'infiltration", icon: "🎖️", description: "Apporte son expérience des opérations sous couverture.", primaryStat: "intelligence", rarity: "rare", minStage: 3, permanentEffects: { intelligence: 3, combat: 1 } },
    { id: "john-giant", name: "John Giant", rank: "Vice-Amiral", role: "Protecteur de ligne", icon: "🗿", description: "Sa présence renforce une défense confrontée à une flotte entière.", primaryStat: "health", rarity: "epic", minStage: 4, permanentEffects: { health: 4, haki: 1 } },
    { id: "tashigi", name: "Tashigi", rank: "Capitaine", role: "Sabreuse et enquêtrice", icon: "👓", description: "Rejoint l'enquête pour récupérer des sabres volés et protéger leurs victimes.", primaryStat: "intelligence", rarity: "rare", permanentEffects: { intelligence: 3, combat: 1 } },
    { id: "gion", name: "Gion", rank: "Vice-Amirale", role: "Commandante", icon: "🌸", description: "Renforce une mission tardive exigeant autorité et maîtrise du combat.", primaryStat: "charisma", rarity: "epic", minStage: 4, permanentEffects: { charisma: 4, combat: 1 } },
    { id: "tokikake", name: "Tokikake", rank: "Vice-Amiral", role: "Commandant", icon: "🐷", description: "Soutient une opération tardive dont les renseignements ont été vérifiés.", primaryStat: "intelligence", rarity: "epic", minStage: 4, permanentEffects: { intelligence: 4, charisma: 1 } },
    { id: "hina", name: "Hina", rank: "Contre-Amirale", role: "Officière d'arrestation", icon: "⛓️", description: "Coordonne une série d'arrestations lorsque les preuves sont solides.", primaryStat: "charisma", rarity: "rare", minStage: 2, permanentEffects: { charisma: 3, combat: 1 } },
  ],

  /*
   * Zones de départ. Leur faible poids limite leur retour après l’origine,
   * sans prétendre imposer une progression séquentielle au moteur actuel.
   */
  zones: [
    {
      id: "east-blue", name: "East Blue", type: "sea", factions: [],
      tags: ["starting", "blue-sea"], originIds: ["east-blue"],
      canStart: true, weight: 0.4, duration: 4, icon: "🏝️",
      transitionText: "Le début d’une grande aventure.",
      theme: { primary: "#2D9CDB", secondary: "#8ED6F2", accent: "#F2C94C", text: "#12344A" },
    },
    {
      id: "west-blue", name: "West Blue", type: "sea", factions: [],
      tags: ["starting", "blue-sea", "networks"], originIds: ["west-blue"],
      canStart: true, weight: 0.4, duration: 4, icon: "🌇",
      transitionText: "Ici, les sourires cachent souvent un marché.",
      theme: { primary: "#49366E", secondary: "#192A4A", accent: "#D8879D", text: "#241735" },
    },
    {
      id: "north-blue", name: "North Blue", type: "sea", factions: [],
      tags: ["starting", "blue-sea", "cold"], originIds: ["north-blue"],
      canStart: true, weight: 0.4, duration: 4, icon: "❄️",
      transitionText: "Dans le froid, chaque ambition se paie.",
      theme: { primary: "#39769A", secondary: "#AFC7D7", accent: "#F4FAFF", text: "#102D40" },
    },
    {
      id: "south-blue", name: "South Blue", type: "sea", factions: [],
      tags: ["starting", "blue-sea", "warm"], originIds: ["south-blue"],
      canStart: true, weight: 0.4, duration: 4, icon: "🌴",
      transitionText: "Les rencontres façonnent déjà ton destin.",
      theme: { primary: "#169B8C", secondary: "#75D6B0", accent: "#F2A65A", text: "#123B35" },
    },
    {
      id: "grand-line", name: "Paradise", type: "sea", factions: [],
      tags: ["grand-line", "dangerous"], originIds: [],
      canStart: false, weight: 1, duration: 4, icon: "🌊",
      transitionText: "Tu entres dans Paradise, la première moitié de Grand Line.",
      theme: { primary: "#006E9E", secondary: "#24C8D8", accent: "#F2C94C", text: "#07344C" },
    },

    /* Passage vers Grand Line */
    {
      id: "reverse-mountain", name: "Reverse Mountain", type: "passage",
      factions: [], tags: ["grand-line", "dangerous", "passage"], originIds: [],
      canStart: false, weight: 2, duration: 4, icon: "⛰️",
      transitionText: "Le courant ne laisse aucune place à l’hésitation.",
      theme: { primary: "#174D6D", secondary: "#8296A3", accent: "#EAF8FF", text: "#102D40" },
    },

    /* Destinations de Paradise */
    { id: "whispering-reefs", name: "Récifs Murmurants", type: "sea", factions: [], tags: ["grand-line", "reefs", "mystery"], originIds: [], canStart: false, weight: 2, duration: 4, transitionText: "Le Log Pose hésite parmi des récifs que la brume fait chanter." },
    { id: "kingdom-of-brass", name: "Royaume de Cuivre", type: "kingdom", factions: [], tags: ["grand-line", "kingdom", "politics"], originIds: [], canStart: false, weight: 1.7, duration: 4, transitionText: "Sur cette île métallurgique, la couronne et les guildes se disputent chaque cargaison." },
    { id: "port-azur", name: "Port-Azur du Royaume de Cuivre", type: "city", factions: [], tags: ["grand-line", "city", "trade", "kingdom-of-brass"], originIds: [], canStart: false, weight: 1.8, duration: 4, transitionText: "Le grand port du Royaume de Cuivre marchande aussi bien les secrets que le métal." },
    { id: "seven-current-archipelago", name: "Archipel des Sabaody", type: "archipelago", factions: [], tags: ["grand-line", "sabaody", "red-line", "mangroves"], originIds: [], canStart: false, weight: 1.6, duration: 4, transitionText: "Les bulles montent entre les racines des mangroves géants, au pied de Red Line." },

    /* Red Line et mers tardives */
    {
      id: "red-line", name: "Red Line", type: "passage", factions: [],
      tags: ["red-line", "dangerous", "late-game"], originIds: [],
      canStart: false, weight: 1.2, duration: 4, icon: "🟥",
      transitionText: "Le monde se resserre autour de ta route.",
      theme: { primary: "#A04432", secondary: "#6B2430", accent: "#F09A69", text: "#3E1515" },
    },
    {
      id: "shinsekai", name: "Nouveau Monde", type: "sea", factions: [],
      tags: ["new-world", "dangerous", "late-game"], originIds: [],
      canStart: false, weight: 1.1, duration: 4, icon: "🌪️",
      transitionText: "Seuls les plus grands peuvent espérer survivre.",
      theme: { primary: "#38245F", secondary: "#111D3B", accent: "#E36A78", text: "#211534" },
    },

    /* Zones spéciales à faible probabilité */
    {
      id: "starless-sea", name: "Mer sans étoiles", type: "sea", factions: [],
      tags: ["special", "grand-line", "darkness", "magnetic-anomaly"], special: true, originIds: [],
      canStart: false, weight: 0.35, duration: 4, icon: "🌑",
      transitionText: "Sous cette anomalie magnétique de Grand Line, même les étoiles et le Log Pose refusent d’indiquer la route.",
      theme: { primary: "#222A4D", secondary: "#58648C", accent: "#B9C7FF", text: "#19203A" },
    },
    {
      id: "wandering-archipelago", name: "Archipel mouvant", type: "archipelago",
      factions: [], tags: ["special", "moving-islands", "exploration"], special: true, originIds: [],
      canStart: false, weight: 0.3, duration: 4, icon: "🧭",
      transitionText: "Les courants de Grand Line déplacent sans cesse ces îlots et dérèglent leurs champs magnétiques.",
      theme: { primary: "#227C72", secondary: "#7EC8A8", accent: "#F4C95D", text: "#123A35" },
    },
    {
      id: "tempest-isle", name: "Île de la Tempête", type: "island", factions: [],
      tags: ["special", "storm", "dangerous"], special: true, originIds: [],
      canStart: false, weight: 0.25, duration: 4, icon: "⛈️",
      transitionText: "Un orage permanent et les paratonnerres des gardiens locaux maintiennent cette île hors des routes ordinaires.",
      theme: { primary: "#405584", secondary: "#8296BD", accent: "#FFD95A", text: "#17233D" },
    },
  ],
};

window.GAME_DATA = GAME_DATA;
