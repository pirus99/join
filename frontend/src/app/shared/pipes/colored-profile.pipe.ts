/**
 * @fileoverview Pipe for generating consistent colors for user profiles based on input strings
 */

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Angular pipe that generates a consistent color for a given input string
 * Useful for creating colored profile avatars or badges
 * @pipe
 */
@Pipe({
  name: 'coloredProfile',
})
export class ColoredProfilePipe implements PipeTransform {
  /** Color palette with high contrast colors for accessibility */
  private colorPalette = [
    '#0038FF', // Kontrast: 6.04:1
    '#00BEE8', // Kontrast: 4.57:1
    '#6E52FF', // Kontrast: 4.88:1
    '#9327FF', // Kontrast: 4.67:1

    '#009A87', // Ersetzt das zu helle Türkis #1FD7C1 (Kontrast: 5.09:1)
    '#398500', // Ersetzt das zu helle Grün #a2df08ff (Kontrast: 4.96:1)
    '#E700F9', // Ersetzt das zu helle Pink #FC71FF (Kontrast: 4.81:1)
    '#C4006B', // Ersetzt das zu helle Magenta #FF5EB3 (Kontrast: 4.88:1)
    '#F03211', // Ersetzt das zu helle Rot-Orange #FF745E (Kontrast: 4.99:1)
    '#E35000', // Ersetzt das zu helle Orange #FFA35E (Kontrast: 4.75:1)
    '#F2A800', // Ersetzt das zu helle Goldgelb #FFBB2B (Kontrast: 4.64:1)
    '#E0AF00', // Ersetzt das zu helle Gelb #FFC701 (Kontrast: 5.06:1)
    '#D7C700', // Ersetzt das zu helle leuchtende Gelb #FFE62B (Kontrast: 4.53:1)

    '#FF4646', // Kontrast: 4.62:1
    '#FF7A00', // Kontrast: 5.61:1
  ];

  /**
   * Transforms an input string into a consistent color from the predefined palette
   * Uses hash function to ensure the same input always returns the same color
   * @param {any} value - Input string to generate color for
   * @returns {string} Hex color code from the color palette, or empty string if no value
   */
  transform(value: any) {
    if (!value) return '';

    let hash = 0;

    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }

    const positiveHash = Math.abs(hash);

    const colorIndex = positiveHash % this.colorPalette.length;

    return this.colorPalette[colorIndex];
  }
}
