/**
 * Shared chart type defaults for consistency across chart components
 */

/**
 * Default line type for time-series charts
 * Using 'stepAfter' for step-like behavior that better represents discrete sensor readings
 */
export const DEFAULT_LINE_TYPE = 'stepAfter' as const

/**
 * Alternative line type for smooth curves (e.g., baseline comparisons)
 * Using 'monotone' for smooth interpolation
 */
export const SMOOTH_LINE_TYPE = 'monotone' as const

