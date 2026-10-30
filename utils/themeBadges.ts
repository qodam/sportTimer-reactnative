// Petits calculs pour les badges des cartes de mondes

const NEW_DAYS = 7; // « Nouveau » pendant 2 semaines

export const isNewTheme = (createdAt?: string | null) =>
  !!createdAt &&
  Date.now() - new Date(createdAt).getTime() < NEW_DAYS * 24 * 3600 * 1000;
