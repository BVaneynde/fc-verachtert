/**
 * Clean opponent name by removing "- FCV" suffix
 * @param {string} opponent - The opponent name
 * @returns {string} - Cleaned opponent name
 */
export const cleanOpponentName = (opponent) => {
  if (!opponent) return opponent
  // Remove trailing "- FCV" or " - FCV"
  return opponent.replace(/\s*-\s*FCV\s*$/, '').trim()
}
