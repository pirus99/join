/**
 * @fileoverview Tasks service for managing task data using Firebase Firestore
 */

import { inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  getDoc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { Task } from '../../interfaces/task';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';

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
  /** Unsubscribe function for tasks listener 
  unsubTasks;*/

  /** BehaviorSubject holding the current tasks array */
  private tasksSubject = new BehaviorSubject<Task[]>([]);

  private apiUrl = 'http://127.0.0.1:8000/';
  private apiEndpoint = 'api/v1/task/';
  private http = inject(HttpClient);
  private autoFetch: any;

  /** Observable stream of tasks */
  public tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

  /** Firestore instance */
  firestore: Firestore = inject(Firestore);

  /**
   * Initializes the service and subscribes to the tasks collection.
   */
  constructor() {
    this.getTasks();
    this.autoFetch = setInterval(() => {
      this.getTasks();
    }, 5000);
  }

  /**
   * Subscribes to the tasks collection in Firestore and updates the local tasks array on changes.
   * @returns {Function} Unsubscribe function to stop listening for updates.
   */
  subTasks() {
    return onSnapshot(this.getTasksRef(), (snapshot) => {
      const tasks = snapshot.docs.map((doc) => {
        return this.setTaskObject(doc.data(), doc.id);
      });
      this.tasksSubject.next(tasks);
    });
  }

  /**
   * Returns a reference to the 'tasks' collection in Firestore.
   * @returns {CollectionReference} Reference to the tasks collection.
   */
  getTasksRef() {
    return collection(this.firestore, 'tasks');
  }

  /**
   * Converts Firestore document data to a Task object.
   * @param {any} obj - The Firestore document data.
   * @param {string} id - The document ID.
   * @returns {Task} The constructed Task object.
   */
  setTaskObject(obj: any, id: string): Task {
    return {
      priority: obj.priority || '',
      title: obj.title || '',
      category: obj.category || null,
      subtasks: obj.subtasks || [],
      dueDate: obj.dueDate || new Timestamp(0, 0),
      assignedTo: obj.assignedTo || [],
      description: obj.description || '',
      status: obj.status || null,
      id: id,
    };
  }

  /**
   * Updates a task in API database from ID.
   * @param {object} task - The task object with updated data.
   * @param {string} id - The ID of the task to update.
   * @throws Will throw an error if no ID is provided.
   * @returns {Promise<void>} Promise that resolves when update is complete.
   */
  async updateTask(task: {}, id: string) {
    if (!id || task === null) {
      throw new Error('Task id is required');
    }
    try {
      console.log('Updating task with id:', id, 'and data:', task);
      await firstValueFrom(this.http.patch(this.apiUrl + this.apiEndpoint + id + '/', task));
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
  async addTaskToDatabase(task: Task) {
    try {
      await firstValueFrom(this.http.post(this.apiUrl + this.apiEndpoint, task));
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
  async deleteTask(taskId: string) {
    await deleteDoc(doc(this.firestore, 'tasks', taskId));
    this.getTasks();
  }

  /**
   * Retrieves a single task by ID from the API database.
   * @param {string} taskId - The ID of the task to retrieve.
   * @returns {Promise<Task>} Promise that resolves to the Task object.
   */
  async getTaskById(taskId: string) {
    const response = await firstValueFrom(this.http.get(this.apiUrl + this.apiEndpoint + taskId + '/'));
    return this.setTaskObject(response, taskId);
  }

  /**
   * Fetches tasks from the external API and updates the tasks BehaviorSubject.
   * @returns Promise that resolves when tasks are fetched and updated.
   */
  async getTasks(): Promise<void> {
    try {
    this.http.get(this.apiUrl + this.apiEndpoint).subscribe({
      next: (data: any) => {
        const tasks: Task[] = data.map((item: any) => this.setTaskObject(item, item.id));
        this.tasksSubject.next(tasks);
      },
      error: (error) => {
        console.error('Error fetching tasks from API:', error);
        throw error;
      }
    });
    } catch (error) {
      console.error('Error in fetchTasksFromApi:', error);
      throw error;
    }
  }
}
export type { Task };

