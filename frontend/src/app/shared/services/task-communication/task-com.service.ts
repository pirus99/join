/**
 * @fileoverview Task communication service for managing task change notifications
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service for handling communication about task changes across components
 * @injectable
 */
@Injectable({
    providedIn: 'root',
})
export class TaskComService {
    /** BehaviorSubject for tracking task changes */
    taskChanged = new BehaviorSubject(0);
    
    /** Observable stream for task change notifications */
    taskChanged$ = this.taskChanged.asObservable();

    /**
     * Triggers a task change notification with a specific value
     * @param {number} value - Value to emit indicating the type or ID of task change
     */
    triggerTaskChange(value: number) {
        this.taskChanged.next(value);
    }

    /**
     * Creates an instance of TaskComService
     */
    constructor() {}
}
