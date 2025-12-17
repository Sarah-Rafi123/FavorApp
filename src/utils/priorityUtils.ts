/**
 * Utility functions for handling favor priority display
 */

export type Priority = 'immediate' | 'delayed' | 'no_rush';

/**
 * Get the color for a priority type
 * @param priority - The priority value
 * @returns The color string for the priority
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'immediate':
      return '#DC2626'; // Red
    case 'delayed':
      return '#D97706'; // Mustard/Orange
    case 'no_rush':
      return '#059669'; // Green
    default:
      return '#6B7280'; // Gray fallback
  }
};

/**
 * Get the background color for a priority type (lighter version)
 * @param priority - The priority value
 * @returns The background color string for the priority
 */
export const getPriorityBackgroundColor = (priority: string): string => {
  switch (priority) {
    case 'immediate':
      return '#FEE2E2'; // Light red
    case 'delayed':
      return '#FEF3C7'; // Light mustard/yellow
    case 'no_rush':
      return '#D1FAE5'; // Light green
    default:
      return '#F3F4F6'; // Light gray fallback
  }
};

/**
 * Format priority text for display
 * @param priority - The priority value
 * @returns The formatted priority text
 */
export const formatPriority = (priority: string): string => {
  switch (priority) {
    case 'no_rush':
      return 'No Rush';
    case 'immediate':
      return 'Immediate';
    case 'delayed':
      return 'Delayed';
    default:
      return 'Unknown';
  }
};