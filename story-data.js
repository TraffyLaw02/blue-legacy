/* Blue Legacy — Mode Histoire : Gol D. Roger */
(() => {
  "use strict";

  const ZONES = [
    ["story-roger-east-blue","East Blue","sea",{primary:"#176b87",secondary:"#8ed6f2",accent:"#f2c94c",text:"#12344a"}],
    ["story-roger-grand-line","Grand Line","grand-line",{primary:"#245c9c",secondary:"#8ec5eb",accent:"#f0b84b",text:"#17365c"}],
    ["story-roger-roadstar","Roadstar","island",{primary:"#16746d",secondary:"#8ed8c8",accent:"#e8c55b",text:"#123f3b"}],
    ["story-roger-legends-era","L’Ère des légendes","new-world",{primary:"#7b3f78",secondary:"#d1a1cb",accent:"#e6bd62",text:"#4b2649"}],
    ["story-roger-last-voyage","Les Secrets du Monde","new-world",{primary:"#a24d38",secondary:"#e7a07f",accent:"#f1cf72",text:"#55291f"}],
    ["story-roger-laugh-tale-route","Une Nouvelle Ère","new-world",{primary:"#3d356f",secondary:"#9e92cf",accent:"#f2d479",text:"#29234e"}],
  ].map(([id,name,type,theme]) => ({id,name,type,theme,tags:["story",type]}));

  const COMPANIONS = Object.freeze([
    {id:"roger-rayleigh",name:"Silvers Rayleigh",role:"Bras droit",icon:"⚔️",primaryStat:"haki",rarity:"legendary",minStage:1,maxStage:1,randomRecruitment:false,permanentEffects:{haki:4,combat:2},description:"Le futur bras droit de Roger apporte calme, puissance et jugement.",recruitmentText:"Rayleigh quitte sa barque et rejoint réellement l’équipage."},
    {id:"roger-gaban",name:"Scopper Gaban",role:"Officier et navigateur",icon:"🪓",primaryStat:"combat",rarity:"epic",minStage:2,maxStage:2,randomRecruitment:false,permanentEffects:{combat:4,intelligence:2},description:"Officier majeur des Roger Pirates, combattant et marin expérimenté.",recruitmentText:"Gaban pose ses haches contre le mât et prend son quart."},
    {id:"roger-crocus",name:"Crocus",role:"Médecin de bord",icon:"⚕️",primaryStat:"health",rarity:"epic",minStage:5,maxStage:6,permanentEffects:{health:7,intelligence:2},description:"Il surveille la maladie de Roger et prolonge le temps disponible.",recruitmentText:"Crocus embarque avec ses instruments et impose son protocole."},
    {id:"roger-oden",name:"Kozuki Oden",role:"Lecteur des Ponéglyphes",icon:"📜",primaryStat:"intelligence",rarity:"legendary",minStage:5,randomRecruitment:false,permanentEffects:{intelligence:5,combat:3},description:"Oden lit les Ponéglyphes pendant l’ultime voyage.",recruitmentText:"Par sa propre volonté, Oden rejoint le dernier voyage."},
    {id:"roger-sunbell",name:"Sunbell",role:"Timonier homme-poisson",icon:"🐟",primaryStat:"health",rarity:"rare",minStage:2,permanentEffects:{health:4,haki:1},description:"Membre attesté des Roger Pirates, expert des courants.",recruitmentText:"Sunbell saisit une aussière et rejoint le pont."},
    {id:"roger-polo-gram",name:"Polo Gram",role:"Combattant dissident",icon:"🛡️",primaryStat:"combat",rarity:"epic",minStage:4,maxStage:4,requiredFlags:{storyGodValleySurvivors:true},permanentEffects:{combat:4,charisma:1},description:"Survivant de God Valley, il refuse qu’un nouveau pavillon décide de sa route.",recruitmentText:"Polo Gram embarque comme homme libre, sans renier sa propre route."},
    {id:"roger-nozdon",name:"Seagull Guns Nozdon",role:"Éclaireur",icon:"🕊️",primaryStat:"intelligence",rarity:"rare",minStage:2,permanentEffects:{intelligence:3,charisma:1},description:"Membre attesté des Roger Pirates, spécialiste de la reconnaissance.",recruitmentText:"Nozdon gagne la vigie et ouvre un carnet de routes."},
    {id:"roger-spencer",name:"Spencer",role:"Combattant de pont",icon:"🗡️",primaryStat:"combat",rarity:"rare",minStage:3,permanentEffects:{combat:3,health:1},description:"Membre attesté des Roger Pirates, fiable dans les abordages.",recruitmentText:"Spencer rengaine sa lame et prend place sur le pont."},
  ]);
  const member = (id) => COMPANIONS.find((item) => item.id === id);
  const dlg = (...rows) => rows.map(([speaker,role,text])=>({speaker,role,text}));
  const out = (id,tier,result,effects,extra={}) => ({id,outcomeTier:tier,result,effects,...extra});
  const ch = (id,text,stat,results,extra={}) => ({id,text,resolutionWeights:{[stat]:.7,haki:.3},outcomes:results,...extra});
  const ev = (id,zone,title,description,choices,extra={}) => ({id,title,description,choices,zones:[zone],factions:["pirate"],unique:true,eventType:"ordinary",resolutionCategory:"social",tags:["story-roger","adventure"],...extra});
  const simple = (id,zone,title,description,lines,extra={}) => ev(id,zone,title,description,lines.map(([text,stat,success,mixed,failure],i)=>ch(`choice-${i+1}`,text,stat,[
    out("success","success",success,{[stat]:2,popularity:1}),out("mixed","mixed",mixed,{[stat]:1,health:extra.mixedHealth ?? -3}),out("failure","failure",failure,{health:extra.failureHealth ?? -7,popularity:-1}),
  ])),extra);

  const EVENTS = [
    simple("roger-east-sloop",ZONES[0].id,"Le sloop des condamnés","Un armateur retient une famille pour une dette fabriquée. Ses gardes ferment la jetée avant la marée.",[
      ["Briser le contrat devant les dockers","charisma","Les dockers témoignent et la famille part libre.","La famille fuit, mais la Marine retient ton nom.","Les gardes chargent et blessent tes hommes."],
      ["Extraire la famille par la cale","intelligence","Le courant emporte le canot hors du filet.","Tous sortent en abandonnant les vivres.","La cale s’effondre pendant l’extraction."],
      ["Ouvrir la jetée de force","combat","Le passage cède sans toucher les civils.","Vous passez avec plusieurs blessures.","Les gardes vous repoussent vers le sloop."],
    ],{introDialogue:dlg(["Roger","Capitaine","Une dette qui exige des vies est une chaîne. Je déteste les chaînes."])}),

    ev("roger-rayleigh",ZONES[0].id,"L’homme sur la barque volée","Rayleigh vit sur une petite barque volée après l’incendie de sa maison. Il écoute ton projet de retourner le monde quand des racketteurs viennent reprendre l’embarcation.",[
      ch("invite","Lui proposer de bâtir un équipage libre","charisma",[
        out("success","success","Rayleigh soutient ton regard : « Montre-moi un horizon qui mérite d’être volé. » Il rejoint réellement l’équipage.",{charisma:2},{crewMember:member("roger-rayleigh"),flags:{storyRayleighJoined:true}}),
        out("mixed","mixed","Rayleigh vous aide à repousser les racketteurs, puis reprend seul sa route. Vos chemins se séparent sur le quai.",{charisma:1,health:-2},{flags:{storyRayleighDeclined:true}}),
        out("failure","failure","Ton projet ne le convainc pas. Rayleigh récupère sa barque et disparaît derrière les jetées.",{popularity:-1},{flags:{storyRayleighDeclined:true}}),
      ]),
      ch("fight","Lui confier ton flanc contre les racketteurs","combat",[
        out("success","success","Dos à dos, vous protégez le port. Rayleigh rit et embarque pour de bon.",{combat:2},{crewMember:member("roger-rayleigh"),flags:{storyRayleighJoined:true}}),
        out("mixed","mixed","Vous gagnez en mettant des passants en danger. Rayleigh refuse de te suivre.",{combat:1,health:-3},{flags:{storyRayleighDeclined:true}}),
        out("failure","failure","Rayleigh couvre seul la retraite et ne confie pas sa vie à ton commandement.",{health:-7},{flags:{storyRayleighDeclined:true}}),
      ]),
      ch("freedom","Défendre sa liberté puis le laisser décider","haki",[
        out("success","success","Tu ne réclames aucune dette. Rayleigh saute sur ton pont : « C’est justement pour ça que je viens. »",{haki:2},{crewMember:member("roger-rayleigh"),flags:{storyRayleighJoined:true}}),
        out("mixed","mixed","Il te remercie, mais choisit de rester à terre. Sa silhouette s’éloigne tandis que ton navire quitte le quai.",{haki:1},{flags:{storyRayleighDeclined:true}}),
        out("failure","failure","La barque est détruite ; Rayleigh quitte le port sans se retourner.",{health:-5},{flags:{storyRayleighDeclined:true}}),
      ]),
    ],{storySignatureEncounter:"rayleigh",important:true,tags:["story-roger","signature-companion","signature-rayleigh"],introDialogue:dlg(["Rayleigh","Naufragé volontaire","Retourner le monde ? Tu n’as même pas un équipage."],["Roger","Capitaine","Alors monte. On commencera à deux."])}),

    simple("roger-east-garp",ZONES[0].id,"Le poing dans la baie","Monkey D. Garp fait évacuer les pêcheurs, puis ordonne à son navire de prendre le tien en chasse. Il veut t’arrêter sans mettre les civils en danger.",[
      ["L’attirer loin des pêcheurs","charisma","Garp mord à la provocation et libère la baie.","Les civils sont saufs, la poursuite dure la nuit.","La Marine coupe la seule sortie."],
      ["Traverser son sillage","intelligence","La manœuvre déjoue sa ligne de tir.","Vous passez avec un mât fendu.","Sa salve arrache le pont."],
      ["Tenir l’impact de front","combat","Le choc ouvre une sortie entre les navires.","Vous échappez au prix de blessures.","Garp repousse le navire dans le port."],
    ],{eventType:"risk",highStakes:true,introDialogue:dlg(["Garp","Marine","{firstName} ! Ne coule pas ce village avant que je t’arrête !"],["Roger","Capitaine","Essaie déjà de suivre !"])}),
    simple("roger-east-impostors",ZONES[0].id,"Le pavillon usurpé","Des pillards utilisent ton pavillon. Le village encerclé croit que tu les commandes.",[
      ["Faire témoigner les victimes","charisma","La vérité lave ton pavillon.","Le village doute encore malgré les preuves.","Les imposteurs retournent la foule."],
      ["Capturer leur capitaine vivant","combat","Son aveu met fin au mensonge.","Il est pris après un quai ravagé.","Il s’enfuit sous la confusion."],
      ["Saisir leurs registres","intelligence","Chaque complice est identifié.","Une liste partielle survit.","Les registres brûlent."],
    ]),
    simple("roger-east-lighthouse",ZONES[0].id,"La cloche sous l’orage","La foudre éteint le phare. Trois navires chargés de familles dérivent vers les récifs.",[
      ["Rallumer la tour sous les éclairs","health","Le feu guide les trois navires.","Deux navires virent à temps.","La foudre te projette de la tour."],
      ["Tracer un chenal au canon","intelligence","Les impacts dessinent une route sûre.","Un navire heurte le récif sans couler.","La fumée cache les rochers."],
      ["Remorquer le convoi","combat","Tous suivent ton sillage.","La coque ressort éventrée.","Le câble rompt sur le pont."],
    ],{eventType:"risk",highStakes:true}),

    simple("roger-grand-reverse",ZONES[1].id,"Reverse Mountain ne pardonne pas","Le courant vertical pousse la coque vers la paroi tandis qu’un bâtiment de la Marine bloque la sortie.",[
      ["Lire les pulsations du courant","intelligence","La coque passe entre roche et canon.","Vous passez sans une voile intacte.","Le navire frappe la paroi."],
      ["Forcer le gouvernail","health","L’équipage arrache la coque à la montagne.","Les cordages cèdent après le passage.","La manœuvre blesse plusieurs marins."],
      ["Écouter la passe dans le silence","haki","Ton instinct désigne l’ouverture invisible.","La passe apparaît une seconde trop tard.","Le vacarme couvre tout."],
    ],{eventType:"risk",highStakes:true}),
    ev("roger-grand-gaban",ZONES[1].id,"Les deux haches de Gaban","Sur Grand Line, Scopper Gaban retient des chasseurs de primes devant un entrepôt en feu. Leur chef a piégé les portes : sauver les cartographes ou poursuivre les assaillants exige une coordination immédiate.",[
      ch("fight-together","Combattre à son rythme et garder l’accès libre","combat",[
        out("success","success","Roger couvre les portes pendant que Gaban brise la ligne adverse. Les cartographes sortent vivants. Gaban rengaine ses haches : « Tu sais partager un champ de bataille. Voyons si tu sais partager une mer. » Il rejoint réellement l’équipage.",{combat:2},{crewMember:member("roger-gaban"),flags:{storyGabanJoined:true}}),
        out("mixed","mixed","Les cartographes survivent, mais Roger poursuit trop loin les chasseurs. Gaban refuse le pavillon et reprend sa propre route.",{combat:1,health:-4},{flags:{storyGabanDeclined:true}}),
        out("failure","failure","La ligne se rompt et Gaban doit sauver seul les derniers prisonniers. Il ne rejoint pas un capitaine qui a abandonné l’objectif.",{health:-8},{flags:{storyGabanDeclined:true}}),
      ]),
      ch("save-maps","Entrer dans l’incendie pour libérer les cartographes","intelligence",[
        out("success","success","Tu repères le mécanisme des portes et guides chaque prisonnier à travers la fumée. Gaban voit que ton ambition ne passe pas avant les vies : il embarque pour de bon.",{intelligence:2},{crewMember:member("roger-gaban"),flags:{storyGabanJoined:true}}),
        out("mixed","mixed","Les prisonniers sortent, mais toutes leurs cartes brûlent. Gaban salue le sauvetage sans accepter de rejoindre l’équipage.",{intelligence:1,health:-4},{flags:{storyGabanDeclined:true}}),
        out("failure","failure","Une mauvaise lecture du vent rabat les flammes vers la sortie. Gaban ouvre un autre passage et refuse ensuite ton offre.",{health:-8},{flags:{storyGabanDeclined:true}}),
      ]),
      ch("break-contract","Révéler aux chasseurs que leur commanditaire les sacrifiera","charisma",[
        out("success","success","Le chef perd ses hommes avant de pouvoir allumer la dernière charge. Gaban éclate de rire : « Gagner sans offrir de cadavres inutiles ? Ça mérite un voyage. » Il rejoint l’équipage.",{charisma:2},{crewMember:member("roger-gaban"),flags:{storyGabanJoined:true}}),
        out("mixed","mixed","Une partie des chasseurs dépose les armes, mais leur chef incendie les archives. Gaban reste aider les victimes et ne rejoint pas Roger.",{charisma:1,health:-3},{flags:{storyGabanDeclined:true}}),
        out("failure","failure","Le chef retourne l’accusation contre Roger. Gaban couvre la retraite, puis choisit de poursuivre seul.",{popularity:-2,health:-6},{flags:{storyGabanDeclined:true}}),
      ]),
    ],{storySignatureEncounter:"gaban",important:true,tags:["story-roger","signature-companion","signature-gaban"],introDialogue:dlg(["Gaban","Combattant aux deux haches","Si tu veux m’aider, choisis vite : les portes ou leurs armes."],["Roger","Capitaine","Je choisis les vivants : personne ne brûlera pour leurs cartes. Toi, prends le côté qui t’amuse."])}),
    simple("roger-grand-sunbell",ZONES[1].id,"La faille sous la quille","Un séisme ouvre une faille sous un port. Sunbell peut guider un seul convoi avant le retournement du courant.",[
      ["Lui confier la manœuvre","charisma","Sunbell mène tout le convoi.","Le convoi passe, votre coque paie le retard.","Des ordres contradictoires brisent la ligne."],
      ["Plonger avec lui","health","Vous libérez les navires piégés.","La dernière amarre cède avec peine.","La pression impose le repli."],
      ["Calculer le retournement","intelligence","Le port sort dans une fenêtre exacte.","Deux navires sont endommagés.","Le courant tourne avant le signal."],
    ]),
    simple("roger-grand-convoy",ZONES[1].id,"Le convoi aux deux cargaisons","Deux navires identiques transportent prisonniers et médicaments. La Marine tire pour empêcher qu’on sache lequel porte quoi.",[
      ["Séparer l’escorte","combat","Captifs et remèdes sont libérés.","Le convoi est pris avec des blessés.","Une coque prend feu."],
      ["Décoder les pavillons","intelligence","Le code révèle les cargaisons.","Tu identifies le bon navire trop tard.","Un faux signal vous piège."],
      ["Proposer un échange public","charisma","Les marins imposent une trêve.","L’échange ne sauve pas tous les captifs.","Le commandant vous encercle."],
    ]),
    simple("roger-grand-nozdon",ZONES[1].id,"L’œil au-dessus des nuages","Nozdon repère une île avant le Log Pose, mais une flotte rivale le prend pour un espion et ferme le ciel.",[
      ["Suivre ses indications","intelligence","Il trouve l’angle mort puis repart transmettre ses relevés ; il ne rejoint pas encore l’équipage.","La route coûte toutes les voiles.","Un tir coupe le mât."],
      ["Attirer les tirs","combat","Nozdon conserve sa position.","Il trouve la sortie après plusieurs impacts.","Le pont concentre le feu."],
      ["Exiger une trêve","charisma","La preuve de son innocence retourne la flotte.","La trêve tient quelques minutes.","Le rival tire pendant les pourparlers."],
    ]),

    ev("roger-roadstar",ZONES[2].id,"La dernière aiguille","Les aiguilles tournent follement. Les inscriptions et les voix perçues indiquent une île au-delà, sans livrer sa route ni donner à Roger la lecture des signes.",[
      ch("archives","Comparer inscriptions, journaux et anomalies","intelligence",[
        out("success","success","Les indices prouvent que Roadstar n’est pas la fin et désignent les Road Ponéglyphes comme clefs.",{intelligence:3},{flags:{storyRoadstarTruth:true,storyRoadstarMajorSuccess:true}}),
        out("mixed","mixed","La preuve suffit pour une seconde circumnavigation, avec de coûteuses lacunes.",{intelligence:1,health:-2},{flags:{storyRoadstarTruth:true,storyPoneglyphCost:true}}),
        out("failure","failure","Les archives s’effondrent. La conviction demeure, la future recherche coûtera davantage.",{health:-7},{flags:{storyRoadstarTruth:true,storyPoneglyphCost:true}}),
      ]),
      ch("voices","Suivre les voix sans prétendre lire","haki",[
        out("success","success","Tu distingues une direction et une intention, jamais un texte. L’équipage comprend cette limite.",{haki:3},{flags:{storyRoadstarTruth:true,storyRoadstarMajorSuccess:true}}),
        out("mixed","mixed","La voix confirme une présence sans coordonnées.",{haki:1,health:-3},{flags:{storyRoadstarTruth:true,storyPoneglyphCost:true}}),
        out("failure","failure","La cacophonie te terrasse et n’offre aucune traduction.",{health:-8},{flags:{storyRoadstarTruth:true,storyPoneglyphCost:true}}),
      ]),
      ch("vote","Faire choisir une nouvelle traversée à l’équipage","charisma",[
        out("success","success","Chaque marin choisit librement de chercher la véritable fin.",{charisma:3},{flags:{storyRoadstarTruth:true,storyRoadstarMajorSuccess:true}}),
        out("mixed","mixed","Le vote passe de peu.",{charisma:1},{flags:{storyRoadstarTruth:true,storyPoneglyphCost:true}}),
        out("failure","failure","L’équipage se divise avant d’accepter un sursis.",{popularity:-2,health:-4},{flags:{storyRoadstarTruth:true,storyPoneglyphCost:true}}),
      ]),
    ],{mandatory:true,priority:100,important:true,introDialogue:dlg(["Navigateur de quart","Équipage","Les aiguilles ne pointent plus nulle part."],["Roger","Capitaine","Alors notre instrument s’arrête. Pas la mer."])}),
    ...[
      ["roger-road-archives","La carte interdite","Le Gouvernement détruit les journaux revenus de Roadstar.","Exfiltrer le cartographe","intelligence","Le cartographe et ses relevés échappent à la saisie.","Une caisse d’archives survit.","Les agents emportent les cartes."],
      ["roger-road-linlin","Le relevé de Linlin","Sur le territoire contrôlé par Charlotte Linlin, une salle fortifiée conserve la copie d’un Road Ponéglyphe. Ses guetteurs ferment déjà le port : repartir avec un relevé exige une infiltration au cœur d’une grande puissance.","Infiltrer la salle et copier la pierre","intelligence","Le relevé complet quitte le territoire avant l’alerte.","La copie est lisible, mais la flotte de Linlin vous repère pendant la fuite.","L’alarme enferme l’équipe dans la forteresse et les gardes détruisent le matériel de copie."],
      ["roger-road-voice","La voix et les signes","Une pierre résonne ; un érudit sait comparer, pas traduire.","Consigner exactement la voix","haki","Le relevé distingue clairement la voix du texte inconnu.","Une impression partielle est conservée.","La pression efface les détails."],
      ["roger-road-pursuit","Les navires sans nom","Une escadre sans pavillon chasse tous les journaux de Roadstar.","Disperser les poursuivants","combat","L’escadre suit trois fausses routes.","Vous passez avec une coque ouverte.","Les poursuivants saisissent une partie des journaux."],
    ].map(([id,title,desc,action,stat,success,mixed,failure],i)=>simple(id,ZONES[2].id,title,desc,[[action,stat,success,mixed,failure],["Protéger les témoins","charisma","Les témoins quittent la zone sous une fausse identité.","Quelques témoins s’échappent.","Les poursuivants dispersent le groupe."],["Rompre l’encerclement","combat","La route s’ouvre sans abandonner les preuves.","Vous passez lourdement blessés.","La ligne ennemie tient et ferme le port."]],i===1?{eventType:"risk",highStakes:true,mixedHealth:-6,failureHealth:-12}:i===3?{eventType:"risk",highStakes:true}:{})),

    simple("roger-era-garp",ZONES[3].id,"Garp ferme la baie","Garp évacue les habitants puis place seul son navire dans la sortie. Ses canons sont chargés.",[
      ["L’attirer loin de l’île","combat","La baie reste intacte.","Le duel ouvre la route avec peine.","La flotte revient avant la sortie."],
      ["Proposer une trêve contre des pillards","charisma","La coopération temporaire sauve l’île.","La trêve tient jusqu’au dernier civil.","Les pillards profitent de la méfiance."],
      ["Passer sous un faux cap","intelligence","Garp comprend une seconde trop tard.","Il marque votre coque.","Le faux cap mène à ses renforts."],
    ],{eventType:"risk",highStakes:true,introDialogue:dlg(["Garp","Marine","Cette fois, {firstName}, tu ne passeras pas !"],["Roger","Capitaine","Tu dis ça à chaque fois !"])}),
    simple("roger-era-propaganda",ZONES[3].id,"Le monde choisit ses monstres","Des journaux payés attribuent chaque crise aux pirates tandis que les puissants de l’époque profitent du chaos.",[
      ["Faire témoigner les rescapés","charisma","Les habitants imposent leur récit.","La propagande se fissure.","Les témoins sont arrêtés."],
      ["Voler les ordres de censure","intelligence","Les preuves circulent.","Une partie est publiée.","Les documents sont remplacés."],
      ["Protéger l’imprimerie","combat","Le journal paraît.","Les presses survivent avec des blessés.","L’imprimerie brûle."],
    ]),
    simple("roger-era-polo",ZONES[3].id,"Un survivant ne se possède pas","Après le désastre de God Valley, Polo Gram protège des blessés poursuivis par d’anciens geôliers. Il refuse tout pavillon qui chercherait à remplacer leurs chaînes par une dette.",[
      ["Évacuer sans exiger d’allégeance","charisma","Polo retient que ton pavillon n’achète personne.","Il reste protéger les rescapés.","L’évacuation échoue."],
      ["Tenir jusqu’au dernier canot","combat","Votre ligne ouvre une alliance possible.","Le dernier canot part, Polo reste indépendant.","Les poursuivants vous séparent."],
      ["Offrir une place d’homme libre","haki","Il accepte si vos routes se recroisent.","Il décline pour protéger l’île.","Il prend l’offre pour une chaîne."],
    ],{requiredFlags:{storyGodValleySurvivors:true},introDialogue:dlg(["Polo Gram","Pirate de l’époque","Je ne quitte pas un maître pour un autre."],["Roger","Capitaine","Alors ne sers personne."])}),
    simple("roger-era-shiki",ZONES[3].id,"La flotte du Lion d’Or","Plusieurs navires de Shiki encerclent le port. Son officier exige les relevés de Roadstar et menace d’ouvrir le feu sur les quais si Roger refuse cette « alliance ».",[
      ["Refuser publiquement","charisma","Le refus devient un avertissement.","L’officier repart menaçant.","Le port vous isole."],
      ["Donner de fausses cartes","intelligence","La flotte poursuit une route morte.","La ruse gagne quelques jours.","L’encre est reconnue."],
      ["Désarmer son escorte","combat","L’offre forcée cesse.","L’escorte recule blessée.","Le quai devient un champ de bataille."],
    ],{eventType:"risk",highStakes:true,mixedHealth:-5,failureHealth:-11}),
    simple("roger-era-spencer",ZONES[3].id,"Le pont brisé","Spencer commande les survivants d’un navire pris entre deux flottes. Il exige d’abord que ses hommes atteignent la côte.",[
      ["Couvrir leur traversée","combat","Spencer sauve les siens.","Ils passent blessés.","Les tirs ferment le passage."],
      ["Négocier un cessez-le-feu","charisma","Les flottes laissent passer les naufragés.","Une seule respecte l’accord.","Les canons profitent du délai."],
      ["Construire un écran de débris","intelligence","Le passage devient invisible.","L’écran tient de justesse.","Le courant le disperse."],
    ]),

    simple("roger-last-diagnosis",ZONES[4].id,"Le dernier diagnostic","Dans une clinique portuaire, plusieurs médecins confirment que la maladie de Roger est incurable. Ils peuvent ralentir ses crises, mais chaque détour médical réduit le temps laissé au dernier voyage.",[
      ["Dire toute la vérité à l’équipage","charisma","Chaque marin choisit lucidement de poursuivre le dernier voyage.","Le groupe accepte la route malgré des désaccords durables.","La révélation tardive brise la confiance au pire moment."],
      ["Réorganiser la route autour des crises","intelligence","Les escales médicales s’intègrent au calendrier sans supprimer l’urgence.","Le plan gagne quelques semaines au prix de plusieurs objectifs.","Une estimation trop optimiste provoque une crise en mer."],
      ["Accepter des limites physiques strictes","health","Roger préserve assez de forces pour reprendre la mer.","Le traitement stabilise temporairement son état.","Son refus du repos aggrave brutalement la maladie."],
    ],{important:true,introDialogue:dlg(["Médecin du port","Clinicien","Nous pouvons ralentir la maladie, pas la guérir."],["Roger","Capitaine","Alors dites-moi combien de mer tient encore dans ce temps."]),storyCrewText:{memberId:"roger-crocus",presentDescription:"Dans une clinique portuaire, plusieurs médecins confirment que la maladie de Roger est incurable. Crocus confronte leurs observations à ses propres relevés et prépare un protocole capable de ralentir les crises sans promettre de guérison.",absentDescription:"Dans une clinique portuaire, plusieurs médecins confirment que la maladie de Roger est incurable. Ils remettent à l’équipage un protocole difficile à appliquer en mer, tandis que chaque détour médical réduit le temps du dernier voyage.",presentIntroDialogue:dlg(["Crocus","Médecin de bord","Je connais maintenant le rythme de ses crises. Donnez-moi vos relevés, puis laissez-moi imposer le reste."],["Roger","Capitaine","Impose ce que tu veux, tant que la mer reste devant nous."]),absentIntroDialogue:dlg(["Médecin du port","Clinicien","Nous pouvons ralentir la maladie, pas la guérir."],["Roger","Capitaine","Alors dites-moi combien de mer tient encore dans ce temps."])}}),
    simple("roger-last-blockade",ZONES[4].id,"Le blocus des archives","Une escadre gouvernementale ferme un port où sont conservés les journaux de plusieurs équipages disparus.",[
      ["Extraire les archives sans ouvrir le feu","intelligence","Les journaux quittent le port sous de faux manifestes.","Une partie des caisses est sauvée.","Les agents saisissent les documents."],
      ["Faire évacuer les archivistes","charisma","Les habitants ouvrent un passage aux témoins.","Quelques archivistes restent pris au piège.","La peur disperse le convoi."],
      ["Tenir l’escadre loin du quai","combat","Le dernier navire part sous les canons.","La coque quitte le port fragilisée.","Une salve ferme la passe."],
    ],{eventType:"risk",highStakes:true}),
    simple("roger-last-rival-port",ZONES[4].id,"Le port aux trois ultimatums","Trois équipages contemporains réclament la même cale sèche. La maladie progresse pendant que les négociations menacent de devenir une bataille.",[
      ["Partager les ateliers par urgence","charisma","Chaque navire reçoit les réparations vitales.","L’accord tient au prix d’un jour perdu.","Un capitaine rompt la trêve."],
      ["Réparer de nuit sous une fausse identité","intelligence","L’Oro Jackson repart avant l’aube.","La réparation reste incomplète.","Les rivaux découvrent la ruse."],
      ["Défendre la cale sans attaquer les ouvriers","combat","Les capitaines renoncent à l’assaut.","La cale tient avec des blessés.","Le combat détruit l’atelier."],
    ]),
    simple("roger-last-illness",ZONES[4].id,"La crise dans le cyclone","La maladie terrasse Roger au moment où trois canots disparaissent dans le cyclone. Le protocole médical exige du repos, mais l’équipage privé de son capitaine hésite sur la manœuvre de sauvetage.",[
      ["Laisser l’équipage agir pendant les soins","charisma","Le commandement partagé sauve les canots.","Ils reviennent après une crise sévère.","Le silence désorganise le sauvetage."],
      ["Diriger depuis l’infirmerie","intelligence","Chaque ordre précède la vague.","Le plan aggrave tes symptômes.","Une erreur coûte un canot."],
      ["Retourner sur le pont","health","Tu tiens jusqu’au dernier rescapé.","Tu t’effondres après leur retour.","La crise te terrasse trop tôt."],
    ],{eventType:"risk",highStakes:true,storyCrewText:{memberId:"roger-crocus",presentDescription:"La maladie terrasse Roger au moment où trois canots disparaissent dans le cyclone. Crocus prend immédiatement la direction des soins et confie la manœuvre de sauvetage au reste de l’équipage.",absentDescription:"La maladie terrasse Roger au moment où trois canots disparaissent dans le cyclone. Le protocole médical exige du repos, mais l’équipage privé de son capitaine hésite sur la manœuvre de sauvetage.",presentIntroDialogue:dlg(["Crocus","Médecin de bord","Je garde Roger en vie. À vous de ramener ces canots avant que le cyclone ne referme la passe."]),absentIntroDialogue:dlg(["Second de quart","Équipage","Le capitaine ne peut plus tenir debout et les canots ne répondent pas. Il faut choisir la manœuvre maintenant."])}}),
    simple("roger-last-time",ZONES[4].id,"Une année contre la mer","Un navire allié demande une semaine de secours qu’aucun médecin ne peut rendre.",[
      ["Le sauver malgré le délai","charisma","Les rescapés paient leur dette en informations.","Ils vivent, la maladie progresse.","Le secours échoue après des jours perdus."],
      ["Aider sans détour","intelligence","Une manœuvre distante sauve temps et vies.","Le détour reste limité.","Le signal est mal compris."],
      ["Poursuivre la route","haki","Le choix préserve le calendrier sans être héroïsé.","L’équipage se divise.","La culpabilité brise la cohésion."],
    ]),

    simple("roger-final-skypiea",ZONES[5].id,"Le message dans l’or","À Skypiea, la cloche d’or porte un Ponéglyphe dont Roger perçoit la présence sans pouvoir en lire les mots. Une patrouille protège le sanctuaire tandis que l’équipage cherche à préserver fidèlement chaque signe.",[
      ["Demander l’accès sacré","charisma","Le gardien autorise l’étude et le message.","L’accès bref impose une copie incomplète.","La patrouille vous chasse."],
      ["Suivre la voix sans la confondre avec la lecture","haki","La voix mène à la pierre et s’arrête là.","La présence est trouvée après une crise.","Elle se perd dans la tempête."],
      ["Protéger la cloche des pillards","combat","Le peuple accorde son aide.","Le socle est endommagé.","L’affrontement interdit l’étude."],
    ],{mandatory:true,priority:95,months:[21],important:true,introDialogue:dlg(["Roger","Capitaine","J’entends une présence, pas les mots."]),storyCrewText:{memberId:"roger-oden",presentDescription:"À Skypiea, la cloche d’or porte un Ponéglyphe dont Roger perçoit la présence. Oden s’approche pour en lire les mots pendant qu’une patrouille protège le sanctuaire contre toute intrusion.",absentDescription:"À Skypiea, la cloche d’or porte un Ponéglyphe dont Roger perçoit la présence sans pouvoir en lire les mots. Une patrouille protège le sanctuaire tandis que l’équipage cherche à préserver fidèlement chaque signe.",presentIntroDialogue:dlg(["Roger","Capitaine","J’entends une présence, pas les mots."],["Oden","Samouraï","Alors protège la cloche. Les mots sont ma part du voyage."]),absentIntroDialogue:dlg(["Roger","Capitaine","J’entends une présence, pas les mots. Copiez chaque signe sans prétendre lui donner un sens."])}}),
    simple("roger-final-water7",ZONES[5].id,"La coque et les chaînes","Tom inspecte l’Oro Jackson à Water Seven. Après la réparation, le chantier de revêtement à Sabaody attire la surveillance de la Marine tandis que des trafiquants déplacent des captifs sous les racines.",[
      ["Confier la coque à Tom puis protéger le chantier de résine","charisma","Tom renforce le navire et les artisans de Sabaody terminent le revêtement.","Les travaux tiennent mais révèlent votre passage.","Les agents interrompent le second chantier."],
      ["Aider sous la quille puis libérer les captifs","health","La coque ressort prête et les captifs quittent les racines.","Le sauvetage fragilise le revêtement.","Une pièce cède pendant la fuite."],
      ["Diffuser de faux départs dans les deux ports","intelligence","La Marine poursuit des navires fantômes de Water Seven à Sabaody.","Un seul faux plan convainc.","Le vrai départ est découvert."],
    ],{mandatory:true,priority:95,months:[22],important:true,introDialogue:dlg(["Tom","Charpentier","La coque peut atteindre le bout du monde. Dans quel état comptez-vous l’y pousser ?"],["Roger","Capitaine","Assez vivante pour plonger sous Red Line et nous ramener rire."])}),
    simple("roger-final-wano-zou",ZONES[5].id,"Trois gardiens","À la Forêt Marine, Neptune exige de connaître les intentions de Roger. Plus loin, Wano protège une indication et Zou un Road Ponéglyphe. Chaque peuple refuse que sa confiance soit confondue avec un droit de possession.",[
      ["Dire la vérité à Neptune puis laisser Oden guider les demandes","charisma","Neptune et les gardiens reconnaissent une quête qui ne cherche pas à posséder leurs peuples.","Les accès restent surveillés et le calendrier se resserre.","La méfiance impose des copies secondaires."],
      ["Écouter les voix puis croiser copies et marques Kozuki","intelligence","Les coordonnées sont reconstituées sans attribuer la lecture à Roger.","Les erreurs coûtent santé et temps.","Une faute impose une boucle en mer."],
      ["Protéger la coque et les gardiens des poursuivants","combat","La traversée sous-marine tient et rien n’est arraché à Wano ou Zou.","Les poursuivants reculent après des blessures.","L’attaque disperse les relevés."],
    ],{mandatory:true,priority:95,months:[23],important:true,introDialogue:dlg(["Neptune","Roi","Vous cherchez une route ou une arme ?"],["Roger","Capitaine","La fin de la route. Rien qui donne le droit de régner ici."]),storyCrewText:{memberId:"roger-oden",presentDescription:"À la Forêt Marine, Neptune exige de connaître les intentions de Roger. Plus loin, Oden reconnaît les marques de Wano puis se prépare à lire le Road Ponéglyphe protégé par Zou. Chaque peuple exige que sa confiance soit respectée.",absentDescription:"À la Forêt Marine, Neptune exige de connaître les intentions de Roger. Plus loin, Wano protège une indication et Zou un Road Ponéglyphe. Faute de lecteur, l’équipage doit obtenir le droit de copier chaque signe sans en altérer la forme.",presentIntroDialogue:dlg(["Neptune","Roi","Vous cherchez une route ou une arme ?"],["Roger","Capitaine","La fin de la route. Rien qui donne le droit de régner ici."],["Oden","Samouraï","Je lirai les pierres seulement si leurs gardiens nous ouvrent eux-mêmes le passage."]),absentIntroDialogue:dlg(["Neptune","Roi","Vous cherchez une route ou une arme ?"],["Roger","Capitaine","La fin de la route. Rien qui donne le droit de régner ici."],["Cartographe de bord","Équipage","Nous pouvons préserver les signes. Leur voix attendra un autre lecteur."]),presentChoices:["Dire la vérité à Neptune puis laisser Oden présenter la demande","Écouter les voix puis confier les inscriptions à Oden","Protéger la coque et les gardiens des poursuivants"],absentChoices:["Dire la vérité à Neptune et demander le droit de copier","Écouter les voix puis relever chaque marque Kozuki","Protéger la coque et les gardiens des poursuivants"]}}),
    simple("roger-final-no-oden",ZONES[5].id,"La route sans lecteur","Oden n’est pas à bord. Copies, relevés et cartes offrent une méthode, mais chaque hypothèse consume le temps restant.",[
      ["Vérifier chaque copie indépendamment","intelligence","Trois méthodes convergent.","Deux concordent après des semaines.","Les copies mènent en cercle."],
      ["Utiliser les voix seulement comme contrôle","haki","La voix confirme un cap déjà établi.","Elle élimine une hypothèse.","Elle trompe la distance."],
      ["Faire voter le surcoût","charisma","Tous assument la route dangereuse.","Le vote divise les quarts.","Des marins refusent le cap."],
    ],{eventType:"risk",highStakes:true,mixedHealth:-5,failureHealth:-10,forbiddenFlags:["storyOdenJoined"]}),
    ev("roger-laugh-tale",ZONES[5].id,"Au bout de la route","Les repères convergent. L’Oro Jackson franchit une mer qu’aucun Log Pose ne sait désigner. Au-delà du dernier courant attend le message laissé par Joy Boy et une vérité que Roger n’aurait jamais imaginée.",[
      ch("together","Accoster ensemble et accueillir la découverte","charisma",[
        out("success","success","Le silence cède au rire. Devant ce que Joy Boy a laissé, Roger donne à l’île le nom de Laugh Tale.",{charisma:4,haki:3,popularity:4},{flags:{reachedLaughTale:true}}),
        out("mixed","mixed","Vous atteignez Laugh Tale épuisés, certains d’être arrivés trop tôt.",{charisma:2,health:-5},{flags:{reachedLaughTale:true}}),
        out("failure","failure","L’île est atteinte malgré les blessures et les pertes.",{health:-9},{flags:{reachedLaughTale:true}}),
      ]),
      ch("return","Sécuriser une route de retour","intelligence",[
        out("success","success","Les cartes du retour précèdent la découverte.",{intelligence:4,health:2},{flags:{reachedLaughTale:true}}),
        out("mixed","mixed","Le retour reste fragile, l’arrivée réelle.",{intelligence:2,health:-4},{flags:{reachedLaughTale:true}}),
        out("failure","failure","La mer détruit les repères derrière vous.",{health:-9},{flags:{reachedLaughTale:true}}),
      ]),
      ch("protect","Consigner sans livrer les mystères","haki",[
        out("success","success","Les archives séparent faits, mystères et décisions.",{haki:3,intelligence:3},{flags:{reachedLaughTale:true}}),
        out("mixed","mixed","Les notes survivent avec des interprétations divisées.",{intelligence:2,health:-3},{flags:{reachedLaughTale:true}}),
        out("failure","failure","Des notes sont perdues ; aucune réponse n’est fabriquée.",{health:-7},{flags:{reachedLaughTale:true}}),
      ]),
    ],{mandatory:true,priority:100,months:[24],important:true,introDialogue:dlg(["Vigie","Équipage","Les cartes disent que cette mer ne devrait pas exister."],["Roger","Capitaine","Cessons de demander la permission aux cartes."],["Roger","Capitaine","Ha ha ha… Joy Boy, j’aurais voulu vivre à ton époque."])}),
  ];

  const NEW_RANDOM_EVENTS = Object.freeze([
    simple("roger-east-salt-tax",ZONES[0].id,"Le grenier sous scellés","À Goa, un collecteur royal saisit le grain d’un quartier côtier sous prétexte d’une taxe impayée. La marée emportera les barges avant que les familles puissent contester le registre.",[
      ["Comparer les sceaux au registre du port","intelligence","Le faux décret est exposé et les barges restent à quai.","Une incohérence retarde le départ d’une seule barge.","Le collecteur détruit le registre et emporte les réserves."],
      ["Faire témoigner les dockers devant la foule","charisma","Les dockers désignent ensemble le responsable et rouvrent le grenier.","Quelques sacs sont rendus sous surveillance.","Les gardes dispersent les témoins avant leur déclaration."],
      ["Bloquer les amarres sans frapper les ouvriers","combat","Les barges sont immobilisées jusqu’à l’arrivée d’un magistrat.","Une barge part tandis que les autres restent.","Les gardes coupent les amarres et blessent ton équipage."],
    ]),
    simple("roger-east-mapmaker-debt",ZONES[0].id,"La carte jamais livrée","Une cartographe promettait à trois villages une route entre les récifs. Son commanditaire retient désormais ses relevés pour réserver le passage à ses navires marchands.",[
      ["Reconstituer le chenal depuis ses brouillons","intelligence","Les villages reçoivent une carte complète et indépendante.","Un passage utilisable survit malgré plusieurs zones blanches.","Une erreur de profondeur échoue le premier canot."],
      ["Négocier la publication contre une escorte","charisma","Le marchand cède devant un accord qui protège aussi ses cargaisons.","Il autorise une copie limitée du chenal.","Il vend les relevés à un rival pendant les pourparlers."],
      ["Récupérer les plaques de gravure dans son entrepôt","combat","Les plaques sont saisies sans blesser les employés.","Une seule plaque échappe à l’incendie.","Les gardes détruisent les gravures avant ta sortie."],
    ]),
    simple("roger-east-burning-tar",ZONES[0].id,"Le quai de goudron","Un incendie gagne les cuves de goudron d’un chantier. Des apprentis sont coincés derrière les flammes et une citerne menace d’exploser au milieu des maisons.",[
      ["Ouvrir une tranchée vers la mer","intelligence","Le goudron en feu s’écoule loin des maisons et libère le chantier.","La tranchée détourne le pire mais détruit deux cales.","Le feu atteint la citerne avant la fin du canal."],
      ["Porter les apprentis à travers l’atelier","health","Tous franchissent les flammes avant l’effondrement du toit.","Les apprentis sortent au prix de graves brûlures.","Une poutre en feu coupe la retraite."],
      ["Organiser les habitants en chaîne de sable","charisma","Le quartier étouffe ensemble chaque foyer avant l’explosion.","La chaîne protège les maisons les plus proches.","La panique disperse les seaux et nourrit l’incendie."],
    ],{eventType:"risk",highStakes:true}),
    simple("roger-east-marine-decoy",ZONES[0].id,"La patrouille fantôme","Un navire sans équipage reproduit les signaux de la Marine et attire les pêcheurs vers un champ de mines flottantes. Le véritable poste côtier ignore encore que ses codes ont été copiés.",[
      ["Déchiffrer le rythme du faux signal","intelligence","Le signal révèle chaque mine et guide les pêcheurs hors du piège.","Une partie du champ est cartographiée avant l’arrivée du courant.","Le code erroné conduit un canot au milieu des charges."],
      ["Remorquer le navire-leurre loin de la flotte","combat","Le piège suit ta coque et explose au large sans victime.","Le leurre s’éloigne mais plusieurs mines restent dans la passe.","Une charge frappe le gouvernail pendant le remorquage."],
      ["Alerter le poste sans déclencher ses canons","charisma","Les soldats reconnaissent leurs codes et suspendent immédiatement le tir.","La trêve tient assez pour évacuer les pêcheurs.","Le poste prend ton avertissement pour une seconde ruse."],
    ],{eventType:"risk",highStakes:true}),

    simple("roger-grand-island-auction",ZONES[1].id,"L’île vendue en morceaux","Un courtier met aux enchères les sources, les quais et jusqu’aux maisons d’une petite île. Les habitants découvrent que leurs actes de propriété ont été remplacés pendant leur absence.",[
      ["Comparer les actes aux pierres cadastrales","intelligence","Les bornes anciennes prouvent la fraude avant la première vente.","Une partie des terres échappe aux enchères.","Les fausses bornes rendent les titres impossibles à départager."],
      ["Faire interrompre la vente par les capitaines présents","charisma","Aucun acheteur n’ose enchérir contre le témoignage collectif de l’île.","La vente est suspendue jusqu’à une audience.","Le courtier retourne les capitaines contre les habitants."],
      ["Saisir les matrices utilisées pour les faux actes","combat","Les matrices et leurs graveurs sont capturés vivants.","Une matrice survit mais le courtier s’enfuit.","Ses mercenaires emportent toutes les preuves."],
    ]),
    simple("roger-grand-song-current",ZONES[1].id,"Le courant qui chante","Une vibration traverse la coque chaque nuit et désoriente le Log Pose. Un village sous-marin utilise ce courant pour prévenir les navires d’un gouffre que personne ne voit depuis la surface.",[
      ["Comparer la vibration aux mouvements du Log Pose","intelligence","Le chant devient une carte précise du gouffre et de sa sortie.","Le cap est trouvé après la perte d’une voile.","Une mauvaise harmonique conduit la coque vers la fosse."],
      ["Plonger pour suivre les balises du village","health","Tu rétablis les balises arrachées et ouvres le passage aux deux peuples.","La route est réparée au prix d’une remontée dangereuse.","La pression force le groupe à abandonner les dernières balises."],
      ["Convaincre les capitaines de suivre le signal local","charisma","La flotte accepte de ralentir et traverse sans profaner le village.","La moitié des navires respecte le chenal.","Un capitaine impatient rompt la formation et déclenche la panique."],
    ]),
    simple("roger-grand-quarantine",ZONES[1].id,"Le pavillon jaune","Une fièvre inconnue frappe un navire marchand. Le port refuse son accostage, mais une tempête approche et les malades ne survivront pas une nuit supplémentaire au large.",[
      ["Établir une zone de soins sur un îlot","intelligence","Les malades sont isolés et traités sans exposer le port.","L’abri tient malgré un manque de médicaments.","La marée submerge l’îlot avant la fin du transfert."],
      ["Maintenir les deux navires bord à bord dans la tempête","health","Les soins continuent pendant que les coques franchissent ensemble le grain.","Les navires survivent avec plusieurs blessés.","Les amarres cèdent et projettent les malades sur le pont."],
      ["Obtenir du port une équipe volontaire","charisma","Médecins et familles organisent un accueil sûr avant l’orage.","Quelques volontaires apportent assez de matériel pour tenir.","La peur ferme les portes jusqu’au premier naufrage."],
    ],{eventType:"risk",highStakes:true}),
    simple("roger-grand-calm-belt-drift",ZONES[1].id,"La mer sans vent","Une avarie fait dériver l’équipage vers une bordure de Calm Belt. Les voiles pendent, les rames fatiguent et une ombre immense suit déjà la coque sous la surface.",[
      ["Utiliser les différences de température pour trouver un souffle","intelligence","Un mince courant d’air ramène le navire vers Grand Line.","Le souffle suffit à gagner quelques milles.","La voile se déchire avant que la coque ne vire."],
      ["Faire tracter la coque par les chaloupes","health","Les rameurs atteignent le courant extérieur avant l’approche du monstre.","La coque sort après l’abandon de plusieurs réserves.","L’épuisement immobilise les chaloupes sous l’ombre."],
      ["Coordonner les navires voisins en remorque commune","charisma","Trois équipages réunissent leur force et quittent ensemble la zone morte.","Un seul navire accepte de partager sa traction.","La rivalité brise la ligne au premier mouvement sous-marin."],
    ],{eventType:"risk",highStakes:true}),

    simple("roger-road-broken-compass",ZONES[2].id,"Les boussoles muettes","Après Roadstar, toutes les aiguilles restent immobiles. Un navigateur rival propose une route fondée sur les étoiles, mais exige les copies de vos inscriptions en paiement.",[
      ["Vérifier sa route sans céder les copies","intelligence","Les calculs révèlent un cap fiable et une erreur volontaire dans son offre.","Une route partielle est obtenue contre des relevés secondaires.","Le faux calcul éloigne le navire de toute île connue."],
      ["Proposer un échange de relevés non historiques","charisma","Les deux équipages partagent leurs observations sans livrer les inscriptions.","L’accord tient pour une seule traversée.","Le rival réclame publiquement les documents interdits."],
      ["Traverser la zone morte sans son aide","health","L’équipage maintient le cap à la rame jusqu’au retour des étoiles.","La sortie coûte vivres et forces.","La fatigue disperse les quarts et le navire tourne en cercle."],
    ]),
    simple("roger-road-stone-rubbings",ZONES[2].id,"Les empreintes effacées","Des frottages de pierres anciennes arrivent au marché de Roadstar. Leur vendeur mélange des copies authentiques à des inventions destinées à attirer le Gouvernement.",[
      ["Comparer les fibres, encres et cassures","intelligence","Les faux sont isolés sans altérer les empreintes authentiques.","Deux fragments fiables subsistent parmi les copies.","Une fausse concordance entraîne l’équipage vers un piège."],
      ["Faire confronter le vendeur par les érudits trompés","charisma","Les acheteurs unissent leurs témoignages et obtiennent sa source réelle.","Le vendeur rend une partie de l’argent et garde son contact.","Les érudits s’accusent entre eux et le marché se disperse."],
      ["Protéger les fragments pendant la saisie gouvernementale","combat","Les documents quittent le marché sans tomber aux mains des agents.","Une empreinte est sauvée au prix de plusieurs blessures.","La saisie emporte vendeur, fragments et noms des acheteurs."],
    ]),
    simple("roger-road-archive-prison",ZONES[2].id,"La prison des cartographes","Le Gouvernement enferme les navigateurs revenus de Roadstar dans une tour d’archives promise à la démolition. Leurs journaux sont stockés aux étages pendant que les prisonniers attendent sous les fondations.",[
      ["Détourner le plan d’évacuation de la tour","intelligence","Prisonniers et journaux empruntent séparément deux sorties sûres.","Les navigateurs sortent mais plusieurs cartes restent sous les gravats.","Le plan falsifié enferme le groupe dans l’aile condamnée."],
      ["Soutenir les fondations pendant l’extraction","health","L’équipage maintient le passage jusqu’au dernier prisonnier.","La tour tient assez pour sauver les personnes.","Une voûte s’effondre avant la fin de l’évacuation."],
      ["Retourner les gardiens contre l’ordre de démolition","charisma","Les gardiens ouvrent les cellules et témoignent sur la destruction programmée.","Quelques soldats accordent un délai précieux.","Le commandant remplace les hésitants et avance l’explosion."],
    ],{eventType:"risk",highStakes:true}),
    simple("roger-road-voice-fever",ZONES[2].id,"La voix sous la fièvre","Une pierre transportée par un navire d’érudits provoque chez Roger une pression si forte qu’il ne distingue plus les ordres de son équipage. Des agents suivent le bâtiment et attendent qu’il perde le contrôle.",[
      ["Isoler chaque sensation dans le journal de bord","haki","Roger distingue enfin la présence de la pierre du tumulte humain.","La pression recule assez pour reprendre la barre.","La voix couvre le signal d’alarme au moment de l’attaque."],
      ["Transférer la pierre sans exposer les érudits","intelligence","Un coffre suspendu éloigne la pression et conserve leurs recherches.","Le transfert réussit après la perte de plusieurs notes.","Le mécanisme cède et révèle la pierre aux poursuivants."],
      ["Rallier les deux équipages malgré la panique","charisma","Les marins maintiennent leurs postes jusqu’à la sortie de la zone.","Une discipline fragile évite l’abordage immédiat.","La peur divise les navires et livre les érudits aux agents."],
    ],{eventType:"risk",highStakes:true}),

    simple("roger-era-neutral-harbor",ZONES[3].id,"Le dernier port neutre","Un port accueille encore pirates, Marine et marchands sans livrer leurs noms. Une grande puissance exige son registre complet et bloque les réserves jusqu’à sa remise.",[
      ["Créer un registre qui protège les réfugiés sans mentir sur les cargaisons","intelligence","Le contrôle reçoit des comptes vérifiables sans aucune identité de fugitif.","Le compromis protège la majorité des noms.","Une incohérence expose les familles cachées dans le port."],
      ["Rallier les capitaines à la neutralité du quai","charisma","Chaque pavillon refuse séparément de recevoir le registre volé.","Une trêve fragile maintient le port ouvert.","Deux capitaines vendent les noms pour récupérer leurs vivres."],
      ["Rompre le blocus des réserves","combat","Les entrepôts sont ravitaillés sans bataille dans les rues.","Le passage s’ouvre au prix d’une coque perdue.","Le blocus repousse les navires vers les quartiers civils."],
    ]),
    simple("roger-era-broken-duel",ZONES[3].id,"Le duel interrompu","Deux capitaines célèbres doivent régler leur rivalité sur une île vide. Une flotte gouvernementale déplace pourtant des prisonniers à travers leur champ de bataille pour provoquer leur destruction.",[
      ["Révéler le convoi aux deux capitaines","charisma","Les rivaux suspendent leur duel et ouvrent ensemble les cages.","Le duel s’arrête assez longtemps pour un seul convoi.","Chacun croit que l’autre utilise les prisonniers comme diversion."],
      ["Détourner les prisonniers derrière les reliefs","intelligence","Le convoi disparaît de la ligne de choc sans alerter les gardes.","La moitié des cages atteint un abri.","Le nouveau trajet coupe la retraite des captifs."],
      ["Briser les chaînes au milieu du duel","combat","L’équipage traverse les impacts et libère les prisonniers.","Les cages s’ouvrent au prix de nombreuses blessures.","Le choc des capitaines disperse le groupe de sauvetage."],
    ]),
    simple("roger-era-celestial-inspection",ZONES[3].id,"L’inspection du tribut","Un convoi gouvernemental inspecte les îles qui n’ont pas livré leur tribut. Les agents retiennent les enfants des dirigeants locaux pendant que les réserves sont chargées sous bonne garde.",[
      ["Substituer des caisses marquées avant l’inventaire","intelligence","Le convoi repart avec du lest tandis que vivres et enfants restent sur l’île.","Une partie du tribut est sauvée sans libérer tous les otages.","Le double marquage révèle la substitution au dernier contrôle."],
      ["Extraire les otages par les citernes du palais","health","Les enfants rejoignent les familles avant que les agents ne comprennent la fuite.","L’extraction réussit mais laisse plusieurs blessés.","Une grille fermée piège le groupe sous le palais."],
      ["Forcer le responsable local à témoigner publiquement","charisma","Son témoignage rallie soldats et habitants contre l’inspection.","La foule obtient un délai et cache les dernières réserves.","La peur des représailles le pousse à confirmer les accusations."],
    ],{eventType:"risk",highStakes:true}),
    simple("roger-era-floating-arsenal",ZONES[3].id,"L’arsenal à la dérive","Une forteresse flottante abandonnée dérive vers trois îles. Ses canons automatiques tirent sur tout pavillon tandis qu’un équipage inconnu cherche à remettre son moteur en marche.",[
      ["Identifier le cycle des batteries","intelligence","Chaque canon se tait assez longtemps pour évacuer les îles et couper le moteur.","Une batterie reste active pendant le remorquage.","Le cycle change et prend la flotte d’évacuation en enfilade."],
      ["Aborder la salle des machines sous le feu","combat","L’équipage neutralise le moteur avant la première collision.","La forteresse dévie après de lourds dégâts.","Les défenses repoussent l’abordage vers les canons côtiers."],
      ["Coordonner les trois îles malgré leurs rivalités","charisma","Leurs flottes unissent remorques et signaux pour détourner l’arsenal.","Deux îles coopèrent et sauvent la troisième de justesse.","Les vieilles querelles retardent l’ordre jusqu’à l’impact."],
    ],{eventType:"risk",highStakes:true}),

    simple("roger-last-library-at-sea",ZONES[4].id,"La bibliothèque sur la mer","Une communauté de savants transporte ses archives sur des barges pour échapper à une purge. Une tempête approche et chaque caisse ajoutée menace la stabilité de leur convoi.",[
      ["Classer les archives avant de répartir le poids","intelligence","Textes uniques et témoins sont distribués sur les coques les plus sûres.","La sélection sauve les ouvrages irremplaçables.","Une erreur de charge retourne la barge principale."],
      ["Renforcer les barges avec le bois de vos réserves","health","Les renforts maintiennent toute la bibliothèque à flot.","Les barges passent mais l’Oro Jackson perd du matériel vital.","Les pièces posées trop vite cèdent dans la première vague."],
      ["Convaincre des navires voisins de partager les caisses","charisma","Chaque capitaine protège une part des archives jusqu’au prochain port.","Deux navires acceptent les volumes les plus fragiles.","La peur de la purge laisse les savants seuls face au grain."],
    ]),
    simple("roger-last-medicine-route",ZONES[4].id,"Les herbes de l’île close","Une plante capable d’apaiser les crises de Roger pousse sur une île fermée aux étrangers. Ses habitants refusent toute récolte depuis que des trafiquants ont ravagé leurs jardins médicinaux.",[
      ["Proposer de restaurer les cultures avant toute demande","charisma","Les guérisseurs partagent une récolte après avoir vu leurs jardins protégés.","Ils offrent seulement de quoi traverser la prochaine crise.","La demande trop pressante ravive leur méfiance envers les étrangers."],
      ["Identifier les plants sans toucher aux racines","intelligence","La récolte respecte le cycle de la plante et préserve le jardin.","Quelques feuilles utilisables sont prélevées sous surveillance.","Une confusion avec une espèce toxique détruit la préparation."],
      ["Chasser les trafiquants revenus piller la vallée","combat","Les jardins sont libérés sans devenir le prix du combat.","Les trafiquants fuient après avoir brûlé une parcelle.","Leur attaque transforme la vallée en champ de cendres."],
    ]),
    simple("roger-last-letter-home",ZONES[4].id,"Les lettres du dernier voyage","Des sacs de courrier destinés aux familles de l’équipage tombent aux mains d’un réseau qui vend les routes des pirates à la Marine. Les récupérer exige d’agir avant la prochaine transmission.",[
      ["Identifier les lettres piégées dans le lot","intelligence","Les faux messages conduisent au transmetteur sans exposer les familles.","Le réseau est localisé après la perte de plusieurs lettres.","Un nom réel est transmis avant que tu distingues les copies."],
      ["Faire remettre les sacs par les postiers eux-mêmes","charisma","Les employés refusent le trafic et restituent chaque lettre scellée.","Une partie du courrier revient sans ses registres.","Le responsable menace les familles et impose le silence."],
      ["Intercepter l’escargophone avant l’appel","combat","La transmission est coupée et les courriers récupérés intacts.","L’appel échoue mais le réseau détruit plusieurs sacs.","Les agents envoient les noms pendant l’affrontement."],
    ]),
    simple("roger-last-silent-fever",ZONES[4].id,"Le navire silencieux","Un bâtiment allié dérive sans répondre. À bord, une maladie prive les marins de leur voix et les empêche d’alerter sur un sabotage caché dans la réserve d’eau.",[
      ["Lire leurs gestes et isoler la source","intelligence","Les signes des malades désignent la citerne empoisonnée et son responsable.","La source est isolée après plusieurs nouvelles victimes.","Un geste mal compris contamine la réserve de secours."],
      ["Transférer les malades sans relier les deux eaux","health","Chaque patient atteint une zone propre avant la prochaine crise.","Le transfert réussit au prix de l’épuisement des soigneurs.","Une conduite commune propage le poison à ton propre navire."],
      ["Contraindre le saboteur à révéler l’antidote","charisma","Privé du silence de ses victimes, il livre la formule et son commanditaire.","Il révèle assez d’éléments pour stabiliser les cas graves.","Il gagne du temps avec une fausse préparation."],
    ],{eventType:"risk",highStakes:true}),

    simple("roger-final-four-copies",ZONES[5].id,"Quatre copies, une route","Les relevés réunis pendant le voyage donnent quatre positions incompatibles. Une seule erreur suffit à envoyer l’Oro Jackson dans une mer sans retour alors que le temps de Roger s’épuise.",[
      ["Comparer chaque copie à son support d’origine","intelligence","Les déformations du papier corrigent les quatre positions et révèlent leur convergence.","Trois coordonnées s’accordent après plusieurs jours perdus.","Une correction appliquée au mauvais relevé déplace toute la route."],
      ["Utiliser la voix comme contrôle du cap","haki","La présence ressentie confirme la route établie sans remplacer la lecture.","Deux caps sont écartés mais le dernier doute demeure.","La pression de plusieurs voix rend le contrôle inutilisable."],
      ["Faire accepter le risque à chaque quart","charisma","L’équipage choisit ensemble la route et maintient le cap malgré les anomalies.","La décision tient au prix d’une profonde division.","Les quarts corrigent chacun le cap et perdent toute convergence."],
    ]),
    simple("roger-final-sea-kings",ZONES[5].id,"Le corridor des Rois des Mers","Sous Red Line, des Rois des Mers ferment le passage pendant qu’une secousse détache le revêtement de plusieurs navires civils. Roger entend leur agitation sans pouvoir leur imposer une route.",[
      ["Comprendre ce qui provoque leur fuite","haki","La voix révèle une secousse plus profonde et permet d’éviter le prochain mouvement.","Le corridor s’ouvre quelques instants dans leur passage.","La multitude des voix écrase tout avertissement distinct."],
      ["Fixer les revêtements avant la prochaine secousse","health","Les plongeurs maintiennent chaque coque jusqu’à la sortie du corridor.","La majorité des navires remonte malgré des fuites.","Une membrane cède et entraîne les plongeurs vers le fond."],
      ["Synchroniser les équipages dans l’obscurité","charisma","Les navires suivent une même profondeur et quittent la zone sans se heurter.","Une ligne fragile traverse le premier mouvement.","Les signaux contradictoires dispersent le convoi parmi les géants."],
    ],{eventType:"risk",highStakes:true}),
    simple("roger-final-empty-port",ZONES[5].id,"Le port abandonné","Un port autrefois allié est vide. Les tables sont dressées, les navires encore amarrés et un message gravé sur la jetée avertit que le Gouvernement reviendra chercher ceux qui ont aidé Roger.",[
      ["Reconstituer l’évacuation depuis les traces laissées","intelligence","Les indices mènent à un refuge intact sans attirer les poursuivants.","Une partie des habitants est retrouvée avant la Marine.","Une fausse piste gouvernementale conduit l’équipage dans une rade fermée."],
      ["Effacer les preuves reliant le port à votre route","health","Les archives compromettantes disparaissent avant le retour des agents.","Les traces principales sont détruites au prix d’un précieux retard.","Le feu gagne les maisons que les habitants espéraient retrouver."],
      ["Laisser aux réfugiés un choix et des vivres","charisma","Le message atteint leur refuge et chacun décide librement de rester ou repartir.","Les vivres sont trouvés sans révéler ton prochain cap.","Les agents interceptent l’aide et localisent les familles."],
    ]),
  ]);

  const hakiBoss = (stage) => {
    const first = stage===1;
    const texts = first ? [
      ["Lire le geste de Garp et dévier le premier boulet","intelligence","Tu perçois la contraction de son épaule avant son lancer. Ton ordre déplace le navire une seconde trop tôt pour sembler humain : le projectile arrache les chaînes sans toucher les otages, et le Haki de l’Observation prend forme.","Tu devines la trajectoire assez tôt pour sauver le pont, mais cette perception disparaît aussitôt.","Tu réagis après le lancer. Garp détourne lui-même le projectile pour éviter les otages ; aucun éveil ne répond.","haki-observation"],
      ["Recevoir le projectile loin du pont","combat","Tu places ta lame entre le boulet et les prisonniers. Au contact, une protection invisible durcit ta garde : l’impact dévie vers la mer et le Haki de l’Armement s’éveille après le sauvetage.","Tu détournes le tir au prix d’une blessure grave ; le durcissement reste instable.","L’impact te brise la garde. L’équipage sauve les otages pendant que Garp suspend son attaque.","haki-armement"],
      ["Forcer les soldats à abandonner les détonateurs","charisma","« Aucun de vous ne tuera pour m’atteindre. » Ta volonté traverse les rangs ; les détonateurs tombent et même Garp marque un silence. Le Haki des Rois naît de ce refus absolu.","Une partie des soldats recule, offrant assez de temps au sauvetage, sans éveil maîtrisé.","Les soldats tiennent malgré tes mots. Garp ordonne lui-même de désamorcer le pont avant de reprendre la chasse.","haki-des-rois"],
    ] : [
      ["Anticiper la chute des navires soulevés par Shiki","intelligence","Tu lis l’instant où Shiki relâchera chaque coque et guides les évacués entre les impacts. Ta perception s’étend à toute la baie tandis que ton Haki souverain progresse.","La majorité des civils passe, mais deux navires s’écrasent sur la sortie.","Shiki change son rythme et ferme le corridor avant ton ordre.","haki-des-rois"],
      ["Traverser les débris et atteindre Shiki","combat","Tu bondis de coque en coque pendant qu’il les précipite vers la mer. Le choc de vos volontés fend les nuages et libère la passe : ton Haki franchit un nouveau seuil.","Tu atteins Shiki assez longtemps pour ouvrir la passe, puis sa puissance te rejette sur le pont.","Un navire lancé de flanc te coupe de Shiki et écrase la ligne d’évacuation.","haki-des-rois"],
      ["Imposer l’arrêt aux deux flottes","charisma","Tu refuses que les équipages meurent pour l’orgueil de deux capitaines. Ta volonté couvre la baie, abat les combattants les plus faibles et force Shiki à te répondre seul.","Une escadre hésite et laisse passer les civils, mais la bataille continue ailleurs.","La flotte de Shiki couvre ta voix par ses canons ; l’évacuation se fait sous le feu.","haki-des-rois"],
    ];
  return ev(`roger-haki-awakening-${stage}`,first?ZONES[1].id:ZONES[3].id,first?"Le boulet au-dessus des otages":"Les navires suspendus du Lion d’Or",first?"Sur Grand Line, une unité corrompue utilise des prisonniers comme appâts sur un pont miné. Garp arrive pour capturer Roger, découvre le piège au moment où son propre boulet a déjà quitté sa main et doit choisir entre poursuivre son rival ou protéger les otages.":"Après Edd War, une escadre restée fidèle à Shiki enferme des civils dans une baie. Le Lion d’Or soulève leurs navires au-dessus de la mer et exige les relevés de Roadstar. Une erreur de Roger transformera chaque coque en projectile.",texts.map(([text,stat,success,mixed,failure,title],i)=>ch(`haki-${stage}-${i+1}`,text,stat,[out("success","success",success,{haki:4,[stat]:2},{titles:[title]}),out("mixed","mixed",mixed,{haki:2,health:-6}),out("failure","failure",failure,{haki:1,health:-10})])),{eventType:"decisive",decisiveStage:stage,dreamIds:["one-piece"],resolutionCategory:"action",important:true,highStakes:true,loreCharacters:first?["Monkey D. Garp"]:["Shiki"],tags:["decisive",`decisive-stage-${stage}`,"pirate","haki-awakening","story-roger"],introDialogue:first?dlg(["Garp","Officier de la Marine","Écarte ton navire, {firstName} ! Mon tir va toucher le pont !"],["Roger","Capitaine","Trop tard pour l’écarter. On va changer l’endroit où il frappe."],["Commandant corrompu","Marine","Un geste de l’un ou de l’autre, et je fais sauter les chaînes !"]):dlg(["Shiki","Lion d’Or","Donne-moi les relevés de Roadstar, ou je laisse tomber chaque navire."],["Roger","Capitaine","Tu appelles ça négocier parce que le ciel t’obéit."],["Shiki","Lion d’Or","Non. J’appelle ça te montrer quel homme devrait régner."],["Roger","Capitaine","C’est justement là qu’on ne sera jamais d’accord."])});
  };

  const leg = (arc,step,title,description,intro,actions) => ev(`legendary-${arc}-pirate-${step}`,"",title,description,actions.map(([text,stat,success,mixed,failure],i)=>ch(`approach-${i+1}`,text,stat,[out("success","success",success,{[stat]:3,popularity:2},{flags:{[`story_${arc}_${step}_success`]:true,...(arc==="talent"&&step===3?{storyGodValleySurvivors:true}:{})}}),out("mixed","mixed",mixed,{[stat]:1,health:-5},{flags:{[`story_${arc}_${step}_mixed`]:true}}),out("failure","failure",failure,{health:-10,popularity:-2},{flags:{[`story_${arc}_${step}_failure`]:true}})])),{eventType:"legendary",legendaryArc:arc,legendaryStep:step,important:true,highStakes:true,tags:[`legendary-${arc}`,`legendary-step-${step}`,"story-roger"],introDialogue:intro});
  const LEGENDARIES = [
    leg("talent",1,"God Valley — La chasse humaine","Dragons Célestes, chasse, captifs et grandes puissances convergent. Les lacunes du canon ne sont pas remplies comme des certitudes.",dlg(["Vigie","Équipage","Tous regardent les trésors. Personne les cages."],["Roger","Capitaine","Nous, si."]),[["Ouvrir un corridor aux captifs","charisma","Les cages se vident.","Une partie atteint les navires.","Les geôliers ferment le corridor."],["Saboter les communications","intelligence","La chasse perd ses ordres.","Le réseau tombe par secteurs.","Un faux message vous expose."],["Attaquer les geôliers","combat","Les gardes cèdent.","Les cages s’ouvrent avec des blessures.","Les renforts repoussent l’assaut."]]),
    leg("talent",2,"God Valley — Garp et Roger","Rocks, Marine et Gouvernement se heurtent parmi les civils. La coopération avec Garp reste locale et temporaire.",dlg(["Garp","Marine","Après eux, je viens pour toi."],["Roger","Capitaine","Après les civils, essaie."]),[["Coordonner une trêve locale","charisma","Une voie d’évacuation s’ouvre.","La trêve tient sur une plage.","La méfiance ouvre une brèche."],["Briser la ligne des Rocks","combat","La menace quitte les canots.","Ils passent sous les débris.","La ligne vous enferme."],["Déplacer les signaux","intelligence","Les civils trouvent la plage sûre.","La moitié reçoit le signal.","Le code est intercepté."]]),
    leg("talent",3,"God Valley — Ce qui doit survivre","L’île disparaît dans le chaos. Sauver, poursuivre et documenter sont devenus incompatibles.",dlg(["Roger","Capitaine","Choisissez ce qui doit sortir vivant."]),[["Sauver les derniers captifs","charisma","Les survivants emportent leur mémoire.","Plusieurs canots partent.","La plage est coupée."],["Couvrir les navires civils","combat","La ligne tient jusqu’à la dernière voile.","La retraite réussit avec des pertes.","La mer avale un convoi."],["Préserver preuves et témoins","intelligence","Les deux échappent au silence.","Quelques preuves survivent.","Les archives disparaissent."]]),
    leg("marineford",1,"Edd War — La proposition de Shiki","La flotte du Lion d’Or couvre la mer. Shiki propose sa puissance contre les informations que Roger possède.",dlg(["Shiki","Lion d’Or","Ensemble, nous gouvernerons le monde."],["Roger","Capitaine","Je veux être libre de le parcourir."]),[["Refuser sans livrer le secret","haki","Le refus ferme la négociation.","Shiki prépare ses canons.","Il exploite ton hésitation."],["Étudier sa formation","intelligence","Une faille apparaît.","Une sortie reste probable.","Shiki voit la ruse."],["Proposer un passage mutuel","charisma","Son désir de domination est exposé.","La salve est retardée.","La flotte se referme."]]),
    leg("marineford",2,"Edd War — Une mer couverte de voiles","Des dizaines de navires ferment chaque cap tandis que l’Oro Jackson encaisse les bordées.",dlg(["Timonier","Équipage","Une flotte et une coque. Mauvais rapport."],["Roger","Capitaine","Excellent défi."]),[["Percer le commandement","combat","La coordination ennemie casse.","La coque paie la percée.","Le piège se referme."],["Brouiller les pavillons","intelligence","Les escadres se bloquent.","Deux lignes se confondent.","Le code est rétabli."],["Attendre une faille","health","Le gouvernail tient.","Le navire reste manœuvrable.","Une batterie ouvre la coque."]]),
    leg("marineford",3,"Edd War — La tempête","Le ciel bascule. La mer peut sauver Roger autant qu’engloutir les équipages.",dlg(["Shiki","Lion d’Or","Même le ciel te refuse !"],["Roger","Capitaine","Il choisit son propre camp."]),[["Rompre l’encerclement","intelligence","L’Oro Jackson traverse la fenêtre.","La flotte et votre coque sont brisées.","Le courant vous rejette."],["Secourir les navires","charisma","Même des ennemis survivent.","Quelques bâtiments sont sauvés.","Le secours vous enferme."],["Maintenir le duel","combat","Shiki rompt l’engagement.","Le duel reste sans vainqueur.","La mer frappe d’abord."]]),
    leg("emperor",1,"Le Choc des Titans — Trois jours","À la fin de la Zone 5, les équipages se heurtent trois jours sans guerre d’extermination.",dlg(["Barbe Blanche","Capitaine","Pourquoi ce sourire, {firstName} ?"],["Roger","Capitaine","D’abord le duel. Ensuite une demande insensée."]),[["Limiter les combattants","charisma","Les règles protègent les blessés.","Elles tiennent deux jours.","Une provocation élargit le combat."],["Affronter Barbe Blanche","combat","Le choc ouvre un duel égal.","Tu tiens avec des blessures.","Il disperse ta ligne."],["Protéger les navires","intelligence","Une retraite reste possible.","Une coque est endommagée.","La marée les pousse au combat."]]),
    leg("emperor",2,"Le Choc des Titans — La demande","Roger expose Roadstar et la limite de son écoute. Oden est le seul présent capable de lire ; Barbe Blanche refuse qu’il soit traité comme un objet.",dlg(["Roger","Capitaine","Prête-moi Oden pour un an."],["Barbe Blanche","Capitaine","Il n’est pas un trésor à échanger !"],["Oden","Samouraï","Explique-moi toute la route."]),[["Présenter toute la route","intelligence","Oden pose ses conditions.","Il doute du calendrier.","Le récit semble aveugle."],["S’incliner pour demander","charisma","Le geste respecte l’enjeu.","La colère retombe.","L’insistance offense."],["Admettre ne pas savoir lire","haki","Oden comprend la place de son savoir.","Il hésite encore.","La pression ferme le dialogue."]]),
    leg("emperor",3,"Le Choc des Titans — Le choix d’Oden","Oden veut voir la fin. La réussite majeure de l’arc seule l’ajoutera réellement aux compagnons.",dlg(["Oden","Samouraï","Je veux savoir pourquoi les pierres ont traversé huit siècles."],["Barbe Blanche","Capitaine","Pars parce que tu le choisis."],["Roger","Capitaine","Ta volonté restera la tienne."]),[["Laisser Oden décider","charisma","Oden choisit le voyage.","La séparation reste trop brutale.","Les familles se fracturent."],["Garantir son retour","intelligence","L’accord protège sa liberté.","Les garanties restent fragiles.","Le calendrier le réduit à un outil."],["Renoncer s’il le faut","haki","Ce refus de posséder convainc Oden.","Le geste apaise sans décision.","Le silence enterre la demande."]]),
  ];

  const FINAL = ev("roger-loguetown-scaffold",ZONES[5].id,"L’échafaud de Loguetown","Après avoir dissous son équipage et s’être livré, Roger monte sur l’échafaud. Une question jaillit ; la Marine veut le silence, le monde attend.",[
    ch("great-era","Révéler le trésor et lancer une nouvelle ère","charisma",[out("success","success","« Mon trésor ? Je vous le laisse. Trouvez-le ! » La place explose et la Grande Ère commence.",{charisma:4,popularity:8},{flags:{bossFinalDreamCompleted:true,bossFinalDreamId:"one-piece",storyRogerGreatEraLaunched:true}}),out("mixed","mixed","La Marine couvre une partie des mots ; la chasse commence malgré tout.",{popularity:4},{flags:{bossFinalDreamCompleted:true,bossFinalDreamId:"one-piece",storyRogerGreatEraLaunched:true}}),out("failure","failure","Les tambours étouffent l’appel et le rêve manque son élan.",{popularity:1},{flags:{bossFinalDreamCompleted:false,bossFinalDreamId:"one-piece"}})]),
    ch("protect","Protéger les secrets et confier la recherche","intelligence",[out("success","success","Tu livres la certitude d’une vérité, aucun mystère fabriqué.",{intelligence:4,popularity:6},{flags:{bossFinalDreamCompleted:true,bossFinalDreamId:"one-piece"}}),out("mixed","mixed","La foule comprend l’appel, pas sa destination.",{popularity:3},{flags:{bossFinalDreamCompleted:true,bossFinalDreamId:"one-piece"}}),out("failure","failure","La prudence ressemble au silence.",{},{flags:{bossFinalDreamCompleted:false,bossFinalDreamId:"one-piece"}})]),
    ch("defy","Dénoncer le contrôle et appeler chacun à choisir","haki",[out("success","success","L’appel à choisir sa route survit à l’échafaud.",{haki:4,popularity:7},{flags:{bossFinalDreamCompleted:true,bossFinalDreamId:"one-piece"}}),out("mixed","mixed","La place se fracture entre peur et révolte.",{popularity:3},{flags:{bossFinalDreamCompleted:true,bossFinalDreamId:"one-piece"}}),out("failure","failure","L’exécution coupe l’appel avant qu’il prenne forme.",{popularity:1},{flags:{bossFinalDreamCompleted:false,bossFinalDreamId:"one-piece"}})]),
  ],{eventType:"decisive",decisiveStage:3,dreamIds:["one-piece"],important:true,highStakes:true,tags:["decisive","decisive-stage-3","story-roger","final-dream"],introDialogue:dlg(["Spectateur","Foule","Roi des Pirates ! Où est ton trésor ?"],["Officier","Marine","Silence !"],["Roger","Condamné","Vous voulez mon trésor ?"])});

  const LEGENDARY_EDITORIAL_TEXT = Object.freeze({
    "legendary-talent-pirate-1": { title: "La chasse humaine", description: "À God Valley, les Dragons Célestes ont lancé une chasse où des captifs servent de proies. Les cages bordent encore la plage tandis que pirates, Marine et grandes puissances convergent vers les trésors de l’île." },
    "legendary-talent-pirate-2": { title: "Une alliance impossible", description: "Les hommes de Rocks avancent entre les canots civils. Garp et Roger se retrouvent face à la même ligne ennemie : ils devront ouvrir ensemble un passage avant de reprendre leur propre affrontement." },
    "legendary-talent-pirate-3": { title: "Ce qui doit survivre", description: "God Valley disparaît dans le chaos. Les derniers captifs gagnent la plage pendant que les poursuivants cherchent à effacer témoins et preuves avec l’île." },
    "legendary-marineford-pirate-1": { title: "La proposition de Shiki", description: "À Edd War, la flotte du Lion d’Or couvre l’horizon. Shiki propose à Roger de réunir leur puissance et les informations découvertes sur la route afin de gouverner le monde." },
    "legendary-marineford-pirate-2": { title: "Une mer couverte de voiles", description: "Les escadres de Shiki ferment chaque cap tandis que l’Oro Jackson encaisse les bordées. Rompre leur coordination est la seule manière de retrouver la haute mer." },
    "legendary-marineford-pirate-3": { title: "Le ciel se déchaîne", description: "Une tempête éclate au cœur d’Edd War. Les vagues brisent la formation de Shiki, mais menacent indistinctement poursuivants, blessés et navires de Roger." },
    "legendary-emperor-pirate-1": { title: "Trois jours", description: "Les équipages de Roger et de Barbe Blanche s’affrontent depuis trois jours sur une île isolée. Les duels restent contenus, mais chaque provocation menace d’entraîner navires et blessés dans une bataille sans retour." },
    "legendary-emperor-pirate-2": { title: "Une demande impossible", description: "Roger révèle la limite atteinte à Roadstar et la route qu’il cherche encore. Oden comprend que son savoir peut ouvrir cette voie, mais Barbe Blanche refuse qu’un membre de sa famille soit traité comme un objet d’échange." },
    "legendary-emperor-pirate-3": { title: "Le choix d’Oden", description: "Après trois jours d’affrontement, Roger expose enfin ce qu’il cherche au bout de la route. Oden veut découvrir la vérité portée par les Ponéglyphes, tandis que Barbe Blanche refuse qu’on décide à sa place. La décision appartient désormais à Oden." },
  });
  const GOD_VALLEY_NARRATIVE = Object.freeze({
    "legendary-talent-pirate-1": {
      title: "Face au même ennemi",
      description: "God Valley est devenue un champ de bataille. Les Rocks Pirates prennent l’avantage tandis que Marines et pirates se dispersent entre les explosions. Au cœur du chaos, Roger tombe nez à nez avec Garp. Ils restent ennemis, mais l’avancée de Xebec ne leur laisse plus le luxe de régler leurs comptes.",
      introDialogue: dlg(
        ["Garp","Vice-amiral","Ne va pas croire que ça change quoi que ce soit entre nous, Roger."],
        ["Roger","Capitaine","J’allais te dire la même chose. Mais Xebec ne nous laissera pas régler ça seuls."],
        ["Garp","Vice-amiral","Alors on le fait tomber. Après, je t’arrête."]
      ),
      choices: [
        {text:"Convaincre Garp de frapper Xebec avant de régler vos comptes",results:[
          "Garp accepte une trêve sans détour. Marines et équipage de Roger tournent leurs armes vers les Rocks : l’alliance tiendra jusqu’à la chute de Xebec.",
          "Garp accepte de coordonner une partie du front. La méfiance coûte des hommes aux deux camps, mais une ligne commune se forme face aux Rocks.",
          "Garp rejette tes ordres et les Rocks s’engouffrent entre vos groupes. La coordination échoue, mais Xebec menace désormais les deux camps et le combat continue."
        ]},
        {text:"Repérer l’ouverture permettant aux deux groupes d’attaquer ensemble",results:[
          "Tu désignes le point faible de l’offensive des Rocks. Garp le voit à son tour et vos forces frappent ensemble, liées par une trêve aussi nette que provisoire.",
          "L’ouverture existe, mais se referme trop vite. Une partie des Marines rejoint votre assaut au prix de lourdes blessures, tandis que le reste du front demeure instable.",
          "Tu lis trop tard le mouvement des Rocks. Leurs combattants séparent vos forces et punissent votre hésitation, sans toutefois arrêter votre progression vers Xebec."
        ]},
        {text:"Briser la première ligne des Rocks pour entraîner Garp dans l’assaut",results:[
          "Ton attaque fend la première ligne. Garp surgit dans la brèche et comprend immédiatement le plan : vos deux groupes avancent désormais contre le même ennemi.",
          "Tu ouvres une brèche étroite que Garp parvient à tenir. L’alliance naît dans la confusion et les blessés s’accumulent, mais les Rocks doivent reculer.",
          "La première ligne encaisse ton assaut et te repousse. Garp couvre ton repli malgré lui ; la trêve n’est pas établie, mais aucun de vous ne peut abandonner le terrain à Xebec."
        ]}
      ]
    },
    "legendary-talent-pirate-2": {
      title: "Côte à côte",
      description: "La trêve est engagée. Marines et Roger Pirates affrontent ensemble la ligne des Rocks, l’un des équipages les plus redoutables de cette époque. Pour atteindre Xebec au centre de l’île, Roger et Garp doivent transformer leur accord fragile en véritable assaut.",
      introDialogue: dlg(
        ["Garp","Vice-amiral","Essaie de ne pas te mettre devant mon poing."],
        ["Roger","Capitaine","Essaie déjà de suivre."],
        ["Vigie","Équipage","Xebec est derrière leur ligne. Les Rocks resserrent le front !"]
      ),
      choices: [
        {text:"Faire coordonner Marines et équipage de Roger pendant l’assaut",results:[
          "Tes ordres relient les deux groupes sans effacer leur rivalité. Leur poussée commune disloque le front des Rocks et ouvre la route vers Xebec.",
          "La coordination tient par secteurs seulement. Plusieurs combattants tombent dans les intervalles, mais Roger et Garp gagnent assez de terrain pour poursuivre Xebec.",
          "Les ordres se contredisent et les Rocks isolent plusieurs unités. Votre ligne vacille ; Roger et Garp doivent forcer seuls le passage encore ouvert vers Xebec."
        ]},
        {text:"Ouvrir la voie avec Garp au cœur de la ligne des Rocks",results:[
          "Roger et Garp frappent côte à côte. Leur percée brise le centre des Rocks et les porte jusqu’au dernier rempart protégeant Xebec.",
          "Votre charge traverse la ligne, mais chaque mètre se paie en blessures. Garp maintient la brèche assez longtemps pour que l’équipage suive vers Xebec.",
          "Les Rocks referment leur formation sur votre charge. Garp arrache une sortie au dernier instant ; meurtris et séparés de vos forces, vous atteignez malgré tout Xebec."
        ]},
        {text:"Séparer les forces des Rocks pour isoler Xebec",results:[
          "Ta manœuvre attire les ailes des Rocks loin de leur capitaine. Garp comprend le piège et frappe le centre : Xebec se retrouve enfin face à vous.",
          "Une partie des Rocks mord à l’appât, l’autre reste en place. Le détour vous coûte cher, mais il réduit assez leur défense pour atteindre Xebec.",
          "Les Rocks déjouent la manœuvre et vous prennent de flanc. Garp brise l’encerclement ; votre plan échoue, mais sa contre-attaque vous conduit jusqu’à Xebec."
        ]}
      ]
    },
    "legendary-talent-pirate-3": {
      title: "Rocks D. Xebec",
      description: "Au centre du champ de bataille ravagé, Rocks D. Xebec barre lui-même le passage. Derrière lui, son équipage lutte encore ; devant lui, Roger et Garp se placent côte à côte une dernière fois. Leur objectif est désormais simple : vaincre le capitaine des Rocks.",
      introDialogue: dlg(
        ["Xebec","Capitaine des Rocks","Un pirate et un Marine côte à côte… Voilà donc ce qu’il vous faut pour venir jusqu’à moi."],
        ["Garp","Vice-amiral","Notre accord s’arrête quand tu tombes."],
        ["Roger","Capitaine","Alors ne traînons pas."]
      ),
      choices: [
        {text:"Maintenir l’assaut commun face à la volonté de Xebec",results:[
          "Tu refuses de céder et maintiens l’alliance au bord de la rupture. Roger et Garp frappent dans un même élan : Xebec tombe, vaincu par leur assaut décisif. Garp promet que la prochaine rencontre sera une arrestation ; Roger rassemble les siens et l’Oro Jackson quitte aussitôt God Valley.",
          "Ta volonté maintient l’assaut, mais Xebec te blesse grièvement avant de fléchir. Garp reprend l’ouverture et vos forces finissent par le vaincre. La trêve prend fin sur un regard ; ton équipage te ramène à bord et l’Oro Jackson s’éloigne de God Valley.",
          "Ta volonté cède sous la pression de Xebec et tu es projeté parmi les débris. Garp reprend l’initiative ; la bataille générale permet finalement à l’alliance de vaincre Xebec sans faire de toi le héros de l’instant. Garp déclare la trêve terminée tandis que ton équipage t’emporte vers l’Oro Jackson, qui quitte God Valley."
        ]},
        {text:"Attaquer Xebec de front aux côtés de Garp",results:[
          "Ton attaque rejoint parfaitement celle de Garp. Pris entre vos coups, Xebec ne peut reprendre l’avantage et finit vaincu. « La prochaine fois, je t’arrête », lance Garp. « Essaie déjà de me rattraper », répond Roger avant de repartir avec son équipage sur l’Oro Jackson.",
          "Xebec brise ta garde et te laisse sérieusement blessé, mais Garp transforme ton choc en ouverture. Ensemble, vos forces achèvent de vaincre le capitaine des Rocks. Sans attendre, Roger rejoint son équipage ; la trêve est finie et l’Oro Jackson quitte God Valley.",
          "Ton assaut frontal se brise contre Xebec et te laisse à genoux. Garp doit reprendre seul l’ouverture avant que l’effort de toute l’alliance ne vienne finalement à bout de Xebec. La victoire est acquise, pas ta gloire. À peine relevé, tu rejoins l’Oro Jackson et quittes God Valley sous le regard de Garp."
        ]},
        {text:"Créer l’ouverture pour que Garp et Roger frappent ensemble",results:[
          "Ta feinte découvre enfin la garde de Xebec. Garp et Roger exploitent l’ouverture au même instant et portent l’assaut qui le terrasse. Leur alliance s’achève avec sa chute ; Roger refuse de s’attarder et fait lever l’ancre à l’Oro Jackson.",
          "Xebec évente une partie de ton plan et te frappe avant que l’ouverture soit complète. Garp la saisit malgré tout et votre effort commun finit par vaincre Xebec. Blessé, Roger échange un dernier défi avec son rival puis quitte God Valley avec son équipage.",
          "Xebec retourne ta feinte contre toi et t’écarte du combat. Garp rallie les forces encore debout ; après un affrontement acharné, l’alliance vainc finalement Xebec. Ta tentative reste un échec évident. Lorsque Garp met fin à la trêve, ton équipage t’a déjà ramené sur l’Oro Jackson, qui s’éloigne de God Valley."
        ]}
      ]
    }
  });

  const EDITED_LEGENDARIES = LEGENDARIES.map((event) => {
    const edited = { ...event, ...(LEGENDARY_EDITORIAL_TEXT[event.id] || {}) };
    const narrative = GOD_VALLEY_NARRATIVE[event.id];
    if (!narrative) return edited;
    return {
      ...edited,
      title: narrative.title,
      description: narrative.description,
      introDialogue: narrative.introDialogue,
      choices: event.choices.map((choice, choiceIndex) => ({
        ...choice,
        text: narrative.choices[choiceIndex].text,
        outcomes: choice.outcomes.map((outcome, outcomeIndex) => ({
          ...outcome,
          result: narrative.choices[choiceIndex].results[outcomeIndex],
        })),
      })),
    };
  });

  function auditRogerEditorialText(events) {
    const warnings = [];
    const suspicious = /\b(canon|divergence|recrut(?:é|ée|ement)|réussite (?:majeure )?de l’arc|issue majeure|flag|mandatory|eventType|stage|variante)\b/i;
    const inspect = (event, path, value) => {
      if (typeof value === "string" && suspicious.test(value)) warnings.push(`${event.id}/${path}: ${value}`);
    };
    events.forEach((event) => {
      inspect(event, "title", event.title);
      inspect(event, "description", event.description);
      if (String(event.title || "").includes("—")) warnings.push(`${event.id}/title: tiret cadratin à examiner`);
      (event.introDialogue || []).forEach((line, index) => inspect(event, `introDialogue.${index}`, line?.text));
      (event.choices || []).forEach((choice, choiceIndex) => {
        inspect(event, `choices.${choiceIndex}.text`, choice.text);
        (choice.outcomes || []).forEach((outcome, outcomeIndex) =>
          inspect(event, `choices.${choiceIndex}.outcomes.${outcomeIndex}`, outcome.result));
      });
    });
    return Object.freeze({ pass: warnings.length === 0, eventCount: events.length, warnings: Object.freeze(warnings) });
  }
  const ROGER_EDITORIAL_AUDIT = auditRogerEditorialText([
    ...EVENTS, ...NEW_RANDOM_EVENTS, hakiBoss(1), hakiBoss(2), FINAL, ...EDITED_LEGENDARIES,
  ]);
  if (["localhost", "127.0.0.1"].includes(window.location.hostname) && !ROGER_EDITORIAL_AUDIT.pass) {
    console.warn("[Blue Legacy] Audit éditorial Roger :", ROGER_EDITORIAL_AUDIT.warnings);
  }
  window.BLUE_LEGACY_ROGER_EDITORIAL_AUDIT = ROGER_EDITORIAL_AUDIT;

  function auditRogerRandomPool(baseEvents, addedEvents) {
    const isRandom = (event) => ["ordinary", "risk"].includes(event.eventType) && !event.mandatory;
    const summarize = (events) => ({
      ordinary: events.filter((event) => event.eventType === "ordinary").length,
      risk: events.filter((event) => event.eventType === "risk").length,
      total: events.length,
      byPeriod: Object.fromEntries(ZONES.map((zone) => [zone.name, {
        ordinary: events.filter((event) => event.zones?.includes(zone.id) && event.eventType === "ordinary").length,
        risk: events.filter((event) => event.zones?.includes(zone.id) && event.eventType === "risk").length,
      }])),
    });
    const before = baseEvents.filter(isRandom);
    const additions = addedEvents.filter(isRandom);
    const after = [...before, ...additions];
    const ids = after.map((event) => event.id);
    const warnings = [];
    if (new Set(ids).size !== ids.length) warnings.push("identifiant aléatoire dupliqué");
    if (additions.length !== before.length) warnings.push(`pool non doublé : ${before.length} + ${additions.length}`);
    additions.forEach((event) => {
      if (event.variants?.length) warnings.push(`variantes interdites : ${event.id}`);
      if (event.choices?.length !== 3 || event.choices.some((choice) => choice.outcomes?.length !== 3)) {
        warnings.push(`structure incomplète : ${event.id}`);
      }
    });
    return Object.freeze({ pass: warnings.length === 0, before: summarize(before), additions: summarize(additions), after: summarize(after), warnings: Object.freeze(warnings) });
  }
  const ROGER_RANDOM_POOL_AUDIT = auditRogerRandomPool(EVENTS, NEW_RANDOM_EVENTS);
  window.BLUE_LEGACY_ROGER_RANDOM_POOL_AUDIT = ROGER_RANDOM_POOL_AUDIT;
  if (["localhost", "127.0.0.1"].includes(window.location.hostname) && !ROGER_RANDOM_POOL_AUDIT.pass) {
    console.warn("[Blue Legacy] Audit du pool Roger :", ROGER_RANDOM_POOL_AUDIT.warnings);
  }

  window.BLUE_LEGACY_STORY_DATA = Object.freeze({roger:Object.freeze({zones:Object.freeze(ZONES),events:Object.freeze([...EVENTS,...NEW_RANDOM_EVENTS]),companions:COMPANIONS,decisiveEvents:Object.freeze([hakiBoss(1),hakiBoss(2),FINAL]),legendaryEvents:Object.freeze(EDITED_LEGENDARIES)})});
})();
