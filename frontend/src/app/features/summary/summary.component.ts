/**
 * @fileoverview Summary component displaying task statistics and user dashboard
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TasksService, TaskStatus, TaskPriority } from '../../shared/services/firebase/tasks.service';
import { Task } from '../../shared/services/firebase/tasks.service';
import { RouterLink } from '@angular/router';
import { Timestamp } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';
import { UserService } from '../../shared/services/firebase/user.service';

/**
 * Summary dashboard component showing task statistics and greetings
 * @component
 */
@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  imports: [RouterLink, DatePipe],
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit, OnDestroy {
  /** Number of tasks with TODO status */
  todoCount: number = 0;
  
  /** Number of tasks with DONE status */
  doneCount: number = 0;
  
  /** Number of urgent (high priority) tasks */
  urgentCount: number = 0;
  
  /** Next upcoming urgent task date */
  upcomingDate: Date | null = null;
  
  /** Time-based greeting message */
  greeting: string = '';
  
  /** Total number of tasks */
  boardCount: number = 0;
  
  /** Number of tasks in progress */
  inProgressCount: number = 0;
  
  /** Number of tasks awaiting feedback */
  feedbackCount: number = 0;

  /** Subscription for tasks data */
  private tasksSub: Subscription | undefined;
  
  /** Current user's display name */
  userName: string = 'Guest';
  
  /** Subscription for user data */
  private userSub: Subscription | undefined;

  /**
   * Creates an instance of SummaryComponent
   * @param {TasksService} tasksService - Injected tasks service
   * @param {UserService} userService - Injected user service
   */
  constructor(private tasksService: TasksService, private userService: UserService) { }

  /** Initialize subscriptions for tasks and user data */
  ngOnInit(): void {
    this.subscribeTasks();
    this.subscribeUser();
  }

  /** Clean up subscriptions on destroy */
  ngOnDestroy(): void {
    this.tasksSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  /** Subscribe to tasks observable and update counts and dates */
  private subscribeTasks(): void {
    this.tasksSub = this.tasksService.tasks$.subscribe(tasks => {
      this.updateCounts(tasks);
      this.upcomingDate = this.getNextUrgentDate(tasks);
      this.boardCount = tasks.length;
      this.setGreeting();
    });
  }

  /** Subscribe to user observable and set user name */
  private subscribeUser(): void {
    this.userSub = this.userService.user$.subscribe(user => {
      this.userName = user?.displayName || 'Guest';
    });
  }

  /**
   * Counts tasks by their status
   * @param {Task[]} tasks - Array of tasks to filter
   * @param {TaskStatus} status - Status to filter by
   * @returns {number} Count of tasks with the specified status
   */
  private updateCounts(tasks: Task[]): void {
    this.todoCount = this.countByStatus(tasks, TaskStatus.TODO);
    this.doneCount = this.countByStatus(tasks, TaskStatus.DONE);
    this.inProgressCount = this.countByStatus(tasks, TaskStatus.DOING);
    this.feedbackCount = this.countByStatus(tasks, TaskStatus.AWAIT_FEEDBACK);
    this.urgentCount = this.countByPriority(tasks, TaskPriority.HIGH);
  }

  /** Count tasks by a given status */
  private countByStatus(tasks: Task[], status: TaskStatus): number {
    return tasks.filter(t => t.status === status).length;
  }


  /**
   * Counts tasks by their priority level
   * @param {Task[]} tasks - Array of tasks to filter
   * @param {TaskPriority} priority - Priority level to filter by
   * @returns {number} Count of tasks with the specified priority
   */
  private countByPriority(tasks: Task[], priority: TaskPriority): number {
    return tasks.filter(t => t.priority === priority).length;
  }

  /**
   * Finds the next upcoming urgent task date
   * @param {Task[]} tasks - Array of tasks to search
   * @returns {Date | null} The earliest urgent task date or null if none found
   */
  private getNextUrgentDate(tasks: Task[]): Date | null {
    const times = tasks
      .filter(t => t.priority === TaskPriority.HIGH && t.dueDate)
      .map(t => this.getTime(t.dueDate))
      .filter(t => !isNaN(t));

    return times.length ? new Date(Math.min(...times)) : null;
  }

  /**
   * Convert various dueDate types to timestamp
   * @param due Due date in Timestamp, Date or string
   * @returns Milliseconds since epoch or NaN
   */
  private getTime(due: any): number {
    if (due instanceof Timestamp) return due.toDate().getTime();
    if (due instanceof Date) return due.getTime();
    if (typeof due === 'string') {
      const parsed = new Date(due);
      return isNaN(parsed.getTime()) ? NaN : parsed.getTime();
    }
    return NaN;
  }

  /**
   * Sets the appropriate greeting based on current time
   */
  private setGreeting(): void {
    const h = new Date().getHours();
    this.greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }
}
