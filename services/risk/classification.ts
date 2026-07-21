// ==================== Risk Classification ====================
//
// Maps a numeric score (0 - 100) to a discrete RiskLevel.
// Thresholds are isolated here so they can be adjusted independently.

import { RiskLevel } from './types'

export interface ClassificationBand {
  level: RiskLevel
  min: number
  max: number
}

/**
 * Classification bands:
 *   0  - 20  => LOW
 *   21 - 50  => MEDIUM
 *   51 - 80  => HIGH
 *   81 - 100 => CRITICAL
 */
export const CLASSIFICATION_BANDS: ClassificationBand[] = [
  { level: 'LOW', min: 0, max: 20 },
  { level: 'MEDIUM', min: 21, max: 50 },
  { level: 'HIGH', min: 51, max: 80 },
  { level: 'CRITICAL', min: 81, max: 100 },
]

/**
 * Classify a numeric score into a RiskLevel.
 */
export function classifyScore(score: number): RiskLevel {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  const band = CLASSIFICATION_BANDS.find((b) => clamped >= b.min && clamped <= b.max)
  return band?.level ?? 'LOW'
}
