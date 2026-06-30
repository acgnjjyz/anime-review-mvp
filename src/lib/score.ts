type ScoredItem = {
  score: number;
};

export function averageScore(items: ScoredItem[]) {
  if (items.length === 0) {
    return null;
  }

  const total = items.reduce((sum, item) => sum + item.score, 0);
  return total / items.length;
}

export function formatScore(score: number | null) {
  if (score === null) {
    return "未評価";
  }

  return score.toFixed(1);
}
