/**
 * @fileoverview Task interface definition for the Join application
 */

/**
 * Interface representing a task in the Join application
 * @interface Task
 */
export interface Task {
  /** Task priority level (null if not set) */
  priority: number | null;
  /** Task title */
  title: string;
  /** Task category ID (null if not set) */
  category: number | null;
  /** Array of subtasks with their completion status */
  subtasks: { title: string; done: boolean }[];
  /** Due date in string format */
  dueDate: string;
  /** Array of user IDs assigned to this task */
  assignedTo: string[];
  /** Detailed description of the task */
  description: string;
  /** Current status of the task (null if not set) */
  status: number | null;
  /** Unique identifier for the task */
  id: string;
}
