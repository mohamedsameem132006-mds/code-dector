/**
 * Code Quality Metric Calculator
 * Computes transparent, auditable scores (0 - 100) based on detected issues,
 * category weights, severity penalties, and code volume.
 */

function calculateQualityMetrics(issues = [], code = '') {
  const lineCount = (code || '').split('\n').filter(l => l.trim().length > 0).length || 1;

  let criticalCount = 0;
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;

  const categoryCounts = {
    syntax: 0,
    type: 0,
    logic: 0,
    runtime: 0,
    security: 0,
    style: 0,
    performance: 0
  };

  issues.forEach(issue => {
    const sev = (issue.severity || '').toLowerCase();
    if (sev === 'critical') criticalCount++;
    else if (sev === 'error') errorCount++;
    else if (sev === 'warning') warningCount++;
    else infoCount++;

    const cat = (issue.category || '').toLowerCase();
    if (categoryCounts[cat] !== undefined) {
      categoryCounts[cat]++;
    }
  });

  // Base score 100 with penalties scaled to line density
  // Penalties: Critical = 25, Error = 15, Warning = 5, Info = 2
  const rawPenalty = (criticalCount * 25) + (errorCount * 15) + (warningCount * 5) + (infoCount * 2);
  
  // Dampen penalty slightly for large files (e.g. 500 lines has more leeway than 5 lines)
  const sizeFactor = Math.max(1, Math.log10(lineCount + 9));
  const normalizedPenalty = Math.round(rawPenalty / sizeFactor);

  let overallScore = Math.max(10, Math.min(100, 100 - normalizedPenalty));

  // If no issues found: don't grant 100 if it's trivial 1-liner, give 95-98
  if (issues.length === 0) {
    overallScore = lineCount > 10 ? 98 : 95;
  }

  // Sub-scores
  const correctness = Math.max(10, Math.min(100, 100 - ((categoryCounts.syntax * 20) + (categoryCounts.type * 15) + (categoryCounts.logic * 15))));
  const security = Math.max(10, Math.min(100, 100 - ((categoryCounts.security * 30))));
  const maintainability = Math.max(20, Math.min(100, 100 - ((categoryCounts.style * 10) + (categoryCounts.runtime * 10))));
  const performance = Math.max(30, Math.min(100, 100 - ((categoryCounts.performance * 20))));

  return {
    overallScore,
    subscores: {
      correctness,
      security,
      maintainability,
      performance
    },
    counts: {
      critical: criticalCount,
      error: errorCount,
      warning: warningCount,
      info: infoCount,
      total: issues.length
    },
    categoryCounts,
    formula: "Score starts at 100 with penalties for Critical (-25), Error (-15), Warning (-5), and Info (-2), normalized by code length.",
    lineCount
  };
}

module.exports = {
  calculateQualityMetrics
};
