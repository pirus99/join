/**
 * @fileoverview Tasks service for managing task data using Firebase Firestore
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Task } from '../../interfaces/task';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { GlobalConfig } from '../../../global-config';

/**
 * Enumeration of task priority levels
 * @enum {number}
 */
export enum TaskPriority {
  /** Low priority task */
  LOW = 1,
  /** Medium priority task */
  MEDIUM = 2,
  /** High priority task */
  HIGH = 3,
}

/**
 * Enumeration of task categories
 * @enum {number}
 */
export enum TaskCategory {
  /** User story type task */
  USER_STORY = 1,
  /** Technical task type */
  TECHNICAL_TASK = 2,
}

/**
 * Enumeration of task status values
 * @enum {number}
 */
export enum TaskStatus {
  /** To do status */
  TODO = 1,
  /** In progress status */
  DOING = 2,
  /** Awaiting feedback status */
  AWAIT_FEEDBACK = 3,
  /** Completed status */
  DONE = 4,
}

/**
 * Service for managing tasks using Firebase Firestore
 * @injectable
 */
@Injectable({
  providedIn: 'root',
})
export class TasksService {
  /** BehaviorSubject holding the current tasks array */
  private tasksSubject = new BehaviorSubject<Task[]>([]);

  /**
   * The specific API endpoint for tasks.
   * @type {string}
   */
  private apiEndpoint: string = 'api/v1/task/';

  /**
   * The HTTP client for making requests to the server.
   * @type {HttpClient}
   */
  private http: HttpClient = inject(HttpClient);

  /**
   * Automatically fetch tasks when the service is initialized.
   * @type {any}
   */
  private autoFetch: any;

  /** Observable stream of tasks */
  public tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

  /**
   * Initializes the service and subscribes to the tasks collection.
   */
  constructor() {
    this.getTasks();
    this.autoFetch = setInterval(() => {
      this.getTasks();
    }, 10000);
  }

  /**
   * Updates a task in API database from ID.
   * @param {object} task - The task object with updated data.
   * @param {string} id - The ID of the task to update.
   * @throws Will throw an error if no ID is provided.
   * @returns {Promise<void>} Promise that resolves when update is complete.
   */
  async updateTask(task: {}, id: string): Promise<void> {
    if (!id || task === null) {
      throw new Error('Task id is required');
    }
    const url = GlobalConfig.apiUrl + this.apiEndpoint + id + '/';
    const options = { headers: GlobalConfig.authHeader() };

    try {
      await firstValueFrom(this.http.patch(url, task, options));
      this.getTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Adds a new task to the API database.
   * @param {Task} task - The Task object to add (without an id).
   * @returns {Promise<void>} A promise that resolves when the task is added.
   */
  async addTaskToDatabase(task: Task): Promise<void> {
    const url = GlobalConfig.apiUrl + this.apiEndpoint;
    const options = { headers: GlobalConfig.authHeader() };

    try {
      await firstValueFrom(this.http.post(url, task, options));
      this.getTasks();
    } catch (error) {
      console.error('Error adding task to database:', error);
      throw error;
    }
  }

  /**
   * Deletes a task from the API database.
   * @param {string} taskId - The ID of the task to delete.
   * @returns {Promise<void>} A promise that resolves when the task is deleted.
   */
  async deleteTask(taskId: string): Promise<void> {
    const options = { headers: GlobalConfig.authHeader() };

    try {
      await firstValueFrom(this.http.delete(GlobalConfig.apiUrl + this.apiEndpoint + taskId + '/', options));
      this.getTasks();
    } catch (error) {
      console.error('Error deleting task from database:', error);
      throw error;
    }
  }

  /**
   * Retrieves a single task by ID from the API database.
   * @param {string} taskId - The ID of the task to retrieve.
   * @returns {Promise<{}>} Promise that resolves to the Task object.
   */
  async getTaskById(taskId: string): Promise<{}> {
    const options = { headers: GlobalConfig.authHeader() };

    const response = await firstValueFrom(this.http.get(GlobalConfig.apiUrl + this.apiEndpoint + taskId + '/', options));
    return response;
  }

  /**
   * Fetches tasks from the external API and updates the tasks BehaviorSubject.
   * @returns Promise that resolves when tasks are fetched and updated.
   */
  async getTasks(): Promise<void> {
    const options = { headers: GlobalConfig.authHeader() };

    try {
      const response = await firstValueFrom(this.http.get<Task[]>(GlobalConfig.apiUrl + this.apiEndpoint, options));
      this.tasksSubject.next(response);
    } catch (error) {
      console.error('Error fetching tasks from API:', error);
      throw error;
    }
  }
}
export type { Task };

