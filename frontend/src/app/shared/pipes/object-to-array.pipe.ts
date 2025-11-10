/**
 * @fileoverview Pipe for converting objects to arrays of key-value pairs
 */

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Angular pipe that transforms an object into an array of key-value pairs
 * Useful for iterating over objects in templates
 * @pipe
 */
@Pipe({
  name: 'objectToArray',
})
export class ObjectToArrayPipe implements PipeTransform {
  /**
   * Transforms an object into an array of objects with key and value properties
   * @param {any} value - The object to transform
   * @returns {any[]} Array of objects with key and value properties, or empty array if no value
   */
  transform(value: any): any[] {
    if (!value) return [];

    return Object.keys(value).map((key) => {
      return { key: key, value: value[key] };
    });
  }
}
