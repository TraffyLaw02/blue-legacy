/* ==========================================================
   BLUE LEGACY — CATALOGUE DE LA BOUTIQUE PERMANENTE
========================================================== */

(() => {
  "use strict";

  const items = [
    {
      id: "treasure-map",
      name: "Carte au trésor",
      icon: "🗺️",
      price: 200,
      rarity: "uncommon",
      description: "Des indications incomplètes, mais suffisamment précises pour commencer l’aventure avec une longueur d’avance.",
      effect: "Commence chaque aventure avec 15 000 berrys de Fortune supplémentaires.",
      initialEffects: { fortune: 15000 },
    },
    {
      id: "vivre-card",
      name: "Vivre Card",
      icon: "🧭",
      price: 300,
      rarity: "rare",
      description: "Une carte liée à la présence de ceux que le destin place sur ta route.",
      effect: "Augmente fortement les chances de rencontrer un compagnon ou un soutien.",
      recruitmentWeightMultiplier: 1.6,
    },
    {
      id: "eternal-pose",
      name: "Eternal Pose",
      icon: "🧿",
      price: 375,
      rarity: "rare",
      description: "Une aiguille qui garde son cap lorsque la route et les décisions deviennent incertaines.",
      effect: "Améliore légèrement les chances d’obtenir une issue favorable lors des événements classiques.",
      ordinaryResolutionBonus: 5,
    },
    {
      id: "reinforced-jolly-roger",
      name: "Jolly Roger renforcé",
      icon: "🏴‍☠️",
      price: 450,
      rarity: "epic",
      description: "Un emblème personnel conçu pour rappeler à son porteur la légende qu’il veut bâtir.",
      effect: "Santé, Combat, Défense, Intelligence et Charisme commencent avec un léger bonus.",
      initialEffects: { health: 2, combat: 2, haki: 2, intelligence: 2, charisma: 2 },
    },
    {
      id: "straw-hat",
      name: "Chapeau de paille",
      icon: "👒",
      price: 700,
      rarity: "legendary",
      description: "Un symbole de liberté qui semble attirer les destins les plus improbables.",
      effect: "Le premier événement d’une nouvelle aventure devient une rencontre avec un Fruit du Démon.",
      firstEventFruit: true,
    },
  ].map((item) => Object.freeze(item));

  window.BLUE_LEGACY_SHOP_ITEMS = Object.freeze(items);
})();
