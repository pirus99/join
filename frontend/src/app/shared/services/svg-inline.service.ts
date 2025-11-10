/**
 * @fileoverview SVG inline service for fetching and caching SVG content
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay, map } from 'rxjs';

/**
 * Service for retrieving and caching inline SVG content
 * @injectable
 */
@Injectable({
    providedIn: 'root',
})
export class SVGInlineService {
    /** Cache for storing fetched SVG observables to avoid repeated requests */
    private cache = new Map<string, Observable<string>>();

    /**
     * Creates an instance of SVGInlineService
     * @param {HttpClient} http - Injected HTTP client for making requests
     */
    constructor(private http: HttpClient) {}

    /**
     * Retrieves an inline SVG from a specified path.
     *
     * This function handles caching to optimize performance by reusing previously fetched SVGs.
     * It uses HTTP GET to fetch the SVG content and parses it into a DOM structure, then extracts
     * the <svg> element. The parsed SVG is serialized back into a string for further processing.
     * The function also shares the Observable to ensure that all subscribers receive the same instance of the Observable.
     * 
     * Also it injects the SVG als inline element so it can be properly styled with CSS
     *
     * @param {string} path - The URL or file path of the SVG to be fetched.
     * @returns {Observable<string>} An Observable emitting the parsed SVG as a string.
     * @throws {Error} If no <svg> element is found at the specified path, indicating an error in parsing.
     */
    getInlineSVG(path: string): Observable<string> {
        if (this.cache.has(path)) {
            // Return the cached SVG if it exists
            return this.cache.get(path)!;
        }
        const svg$ = this.http.get(path, { responseType: 'text' }).pipe(
            map((svgText) => {
                // Parse the SVG text into a DOM structure
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgText, 'image/svg+xml');
                // Extract the <svg> element from the parsed document
                const svg = doc.querySelector('svg');
                if (!svg) {
                    throw new Error(`Error! No <svg> element found at path: ${path}`);
                }
                // Serialize the SVG back into a string for further processing
                const serializer = new XMLSerializer();
                return serializer.serializeToString(svg);
            }),
            shareReplay(1)
        );
        // Cache the Observable to avoid repeated network requests and improve performance
        this.cache.set(path, svg$);
        return svg$;
    }
}
