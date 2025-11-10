/**
 * @fileoverview Pipe for intelligently truncating strings at word boundaries
 */

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Angular pipe that truncates strings at the nearest word boundary to a specified length
 * Adds ellipsis (...) to indicate truncation
 * @pipe
 */
@Pipe({
  name: 'truncateString',
})
export class TruncateStringPipe implements PipeTransform {
  /**
   * Truncates a string to the specified maximum length, preferring word boundaries
   * @param {string} value - The string to truncate
   * @param {number} maxLength - Maximum length of the resulting string (excluding ellipsis)
   * @returns {string} The truncated string with ellipsis if truncated, or original string if shorter than maxLength
   */
  transform(value: string, maxLength: number): string {
    if (!value || value.length <= maxLength) return value;

    const previousSpace = value.lastIndexOf(' ', maxLength);
    const nextSpace = value.indexOf(' ', maxLength);

    let cutIndex: number;
    if (previousSpace === -1 && nextSpace === -1) {
      cutIndex = maxLength;
    } else if (previousSpace === -1) {
      cutIndex = nextSpace;
    } else if (nextSpace === -1) {
      cutIndex = previousSpace;
    } else {
      cutIndex =
        maxLength - previousSpace <= nextSpace - maxLength
          ? previousSpace
          : nextSpace;
    }

    return value.slice(0, cutIndex).trimEnd() + '...';
  }
}
