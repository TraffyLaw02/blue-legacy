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
      price: 250,
      rarity: "uncommon",
      description: "Des indications incomplètes, mais suffisamment précises pour commencer l’aventure avec une longueur d’avance.",
      effect: "Commence chaque aventure avec 15 000 berrys de Fortune supplémentaires.",
      initialEffects: { fortune: 15000 },
    },
    {
      id: "vivre-card",
      name: "Vivre Card",
      icon: "📄",
      price: 375,
      rarity: "rare",
      description: "Une carte liée à la présence de ceux que le destin place sur ta route.",
      effect: "Augmente fortement les chances de rencontrer un compagnon ou un soutien.",
      recruitmentWeightMultiplier: 1.6,
    },
    {
      id: "eternal-pose",
      name: "Eternal Pose",
      icon: "🧿",
      price: 475,
      rarity: "rare",
      description: "Une aiguille qui garde son cap lorsque la route et les décisions deviennent incertaines.",
      effect: "Améliore légèrement les chances d’obtenir une issue favorable lors des événements classiques.",
      ordinaryResolutionBonus: 5,
    },
    {
      id: "reinforced-jolly-roger",
      name: "Jolly Roger renforcé",
      icon: "🏴‍☠️",
      price: 625,
      rarity: "epic",
      description: "Un emblème personnel conçu pour rappeler à son porteur la légende qu’il veut bâtir.",
      effect: "Santé, Combat, Défense, Intelligence et Charisme commencent avec un léger bonus.",
      initialEffects: { health: 2, combat: 2, haki: 2, intelligence: 2, charisma: 2 },
    },
    {
      id: "chest",
      name: "Coffre",
      icon: "🧰",
      price: 900,
      rarity: "legendary",
      description: "Un coffre récupéré avant le départ. Personne ne sait vraiment ce qu’il contient.",
      effect: "Le premier événement d’une nouvelle aventure devient une rencontre avec un Fruit du Démon.",
      firstEventFruit: true,
    },
  ].map((item) => Object.freeze(item));

  window.BLUE_LEGACY_SHOP_ITEMS = Object.freeze(items);
  const profileCosmetics = [
    { id: "classic", type: "background", name: "Fond classique", rarity: "common", price: 0, description: "La palette crème et bleue emblématique de Blue Legacy." },
    { id: "rare", type: "background", name: "Fond rare", rarity: "rare", price: 200, description: "Un bleu océan profond, premium et sobre." },
    { id: "epic", type: "background", name: "Fond épique", rarity: "epic", price: 350, description: "Des nuances violettes dignes des grandes routes." },
    { id: "legendary", type: "background", name: "Fond légendaire", rarity: "legendary", price: 550, description: "Une finition dorée pour les légendes des mers." },
    { id: "mythic", type: "background", name: "Fond mythique", rarity: "mythic", price: 850, description: "Un prisme marin subtil inspiré des raretés mythiques." },
    { id: "cosmetic-d", type: "name-decoration", name: "D. cosmétique", rarity: "legendary", price: 500, description: "Ajoute visuellement le D. à la Carte de légende, sans aucun effet en aventure." },
  ].map((item) => Object.freeze(item));
  window.BLUE_LEGACY_PROFILE_COSMETICS = Object.freeze(profileCosmetics);
})();
