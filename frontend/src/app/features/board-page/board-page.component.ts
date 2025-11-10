/**
 * @fileoverview Board page component for task management with drag-and-drop functionality.
 */

import { Component, inject, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import {
    CdkDragDrop,
    moveItemInArray,
    transferArrayItem,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import { TaskCardComponent } from '../../shared/task-card/task-card.component';
import { TasksService } from '../../shared/services/firebase/tasks.service';
import { Task } from '../../shared/interfaces/task';
import { TaskCardModalComponent } from '../../shared/task-card-modal/task-card-modal.component';
import { AddTaskModalComponent } from '../../shared/add-task-modal/add-task-modal.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeleteModalComponent } from '../../shared/delete-modal/delete-modal.component';

/**
 * Board page component for managing tasks with kanban-style drag and drop
 * @component
 */
@Component({
    selector: 'app-board-page',
    imports: [
        ButtonComponent,
        CdkDropList,
        CdkDrag,
        CdkDropListGroup,
        TaskCardComponent,
        TaskCardModalComponent,
        AddTaskModalComponent,
        FormsModule,
        DeleteModalComponent,
    ],
    templateUrl: './board-page.component.html',
    styleUrl: './board-page.component.scss',
})
export class BoardPageComponent implements OnInit {
    /**
     * List of all tasks fetched from the TasksService.
     */
    tasks: Task[] = [];

    /**
     * Kanban board representation with its columns.
     * Status mapping:
     * 1 = To do, 2 = In progress, 3 = Await feedback, 4 = Done
     */
    board: { lists: { name: string; listIndex: number; items: Task[] }[] } = {
        lists: [
            {
                name: 'To do',
                listIndex: 1,
                items: [],
            },
            {
                name: 'In progress',
                listIndex: 2,
                items: [],
            },
            {
                name: 'Await feedback',
                listIndex: 3,
                items: [],
            },
            {
                name: 'Done',
                listIndex: 4,
                items: [],
            },
        ],
    };

    /**
     * Preselected status for a new task to be created (1-4).
     */
    addTaskStatus: number = 1;

    /**
     * Service for task management and synchronization.
     */
    tasksService: TasksService = inject(TasksService);

    /**
     * Currently selected task (e.g., for view or delete modals).
     */
    selectedTask: Task | null = null;

    /**
     * Controls visibility of the task detail modal.
     */
    isModalOpen = false;

    /**
     * Current search term used to filter tasks by title or description.
     */
    searchTerm: string = '';

    /**
     * Reference to the Add Task modal component.
     */
    @ViewChild(AddTaskModalComponent) AddTaskModal!: AddTaskModalComponent;

    /**
     * Reference to the Delete modal component.
     */
    @ViewChild(DeleteModalComponent) DeleteModal!: DeleteModalComponent;

    /**
     * Reference to the Task Card modal component.
     */
    @ViewChild(TaskCardModalComponent) TaskCardModal!: TaskCardModalComponent;

    /**
     * Optional task ID to edit.
     */
    taskToEdit: string = '';

    /**
     * Whether the Add Task modal is opened in edit mode.
     */
    asEdit: boolean = false;

    /**
     * Creates the BoardPageComponent.
     * @param router Angular Router used for navigation.
     */
    constructor(private router: Router) {}

    /**
     * Returns the tasks filtered by the current search term (case-insensitive).
     * If the term is empty, returns all tasks.
     * @returns Filtered list of tasks.
     */
    get filteredTasks(): Task[] {
        if (this.searchTerm.trim().length < 1) return this.tasks;
        const term = this.searchTerm.trim().toLowerCase();
        return this.tasks.filter(
            (t) => t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)
        );
    }

    /**
     * Subscribes to the task stream and updates the board when tasks change.
     */
    ngOnInit(): void {
        this.tasksService.tasks$.subscribe((tasks) => {
            this.tasks = tasks;
            this.handleTaskUpdate();
        });
    }

    /**
     * Opens the delete modal for the given task.
     * @param task Task to be deleted.
     */
    openDeleteModal(task: Task) {
        this.selectedTask = task;
        this.DeleteModal.deleteTaskModal(this.selectedTask);
    }

    /**
     * Opens the task detail modal for the given task.
     * @param task Task to display.
     */
    openTask(task: Task) {
        this.selectedTask = task;
        this.isModalOpen = true;
        setTimeout(() => {
            this.TaskCardModal.isSlide = true;
        }, 25);
    }

    /**
     * Closes the task detail modal.
     */
    closeTask() {
        this.isModalOpen = false;
    }

    /**
     * Sets the target status for a new task and opens the appropriate UI
     * depending on the device (modal for desktop, route for touch devices).
     * @param status Target status (1-4).
     */
    setTaskStatus(status: number) {
        this.addTaskStatus = status;

        if (this.isTouchDevice()) {
            this.openAddTaskPage();
        } else {
            this.addTaskModal();
        }
    }

    /**
     * Detects whether the current device likely uses touch input.
     * @returns True if a coarse pointer is detected; otherwise false.
     */
    isTouchDevice(): boolean {
        return window.matchMedia('(pointer: coarse)').matches;
    }

    /**
     * Navigates to the Add Task page with the desired status and a redirect flag back to the board.
     */
    openAddTaskPage() {
        this.router.navigate(['/addTask'], {
            queryParams: { status: this.addTaskStatus, redirectToBoard: true },
        });
    }

    /**
     * Drag and drop handler for moving tasks within or between board columns.
     * When moved to a different column, updates the task's status via the service.
     * The drop list id is expected in the form 'list-{index}'.
     * @param event CDK drag and drop event containing source and target containers.
     */
    drop(event: CdkDragDrop<Task[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );

            const targetListId = event.container.id;
            const targetListIndex = parseInt(targetListId.replace('list-', ''));
            const updateData = {
                status: targetListIndex + 1,
            };
            this.tasksService.updateTask(updateData, event.container.data[event.currentIndex].id);
        }
    }

    /**
     * Updates the items in each board list based on the current filtered tasks.
     * Clears lists beforehand to avoid duplicates.
     */
    handleTaskUpdate() {
        this.clearList();
        this.filteredTasks.forEach((task) => {
            this.board.lists[task.status! - 1].items.push(task);
        });
    }

    /**
     * Clears all items from every board list.
     */
    clearList() {
        this.board.lists.forEach((list) => {
            list.items = [];
        });
    }

    /**
     * Returns the names of all lists except the provided one.
     * @param currentListName Name of the current list.
     * @returns Names of the other lists.
     */
    others(currentListName: string) {
        let otherLists: string[] = [];
        this.board.lists.forEach((list) => {
            if (list.name !== currentListName) {
                otherLists.push(list.name);
            }
        });
        return otherLists;
    }

    /**
     * Handles search input or click events and refreshes the board to reflect filtering.
     * @param event Input or click event.
     */
    searchTask(event: any) {
        if (event.type === 'input' || event.type === 'click') {
            this.handleTaskUpdate();
        }
    }

    /**
     * Opens the Add Task modal (desktop flow).
     */
    addTaskModal() {
        this.AddTaskModal.openModal();
    }
}
