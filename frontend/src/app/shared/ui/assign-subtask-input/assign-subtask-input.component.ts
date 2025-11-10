/**
 * @fileoverview assign subtask input.component
 */

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assign-subtask-input',
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-subtask-input.component.html',
  styleUrl: './assign-subtask-input.component.scss',
})
export class AssignSubtaskInputComponent {
  @Input() subtasks: {
    title: string;
    done: boolean;
    hover?: boolean;
    edit?: boolean;
  }[] = [];
  subtaskData: { title: string; done: boolean }[] = [
    { title: '', done: false },
  ];
  taskSubtask: any;

  subtaskActive: boolean = false;
  subtaskInput: boolean = false;
  subtaskEditInput: string = '';

  @Output() selectedSubTasks: EventEmitter<{ title: string; done: boolean }[]> =
    new EventEmitter<{ title: string; done: boolean }[]>();

  addSubtask() {
    if (this.taskSubtask) {
      this.subtasks.push({
        title: this.taskSubtask,
        done: false,
        hover: false,
        edit: false,
      });
      this.taskSubtask = '';
      this.emitSubtasks();
      this.subtaskInput = false;
    }
    this.subtaskActive = false;
  }

  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addSubtask();
    }
  }

  clearCreateInput() {
    this.taskSubtask = '';
    this.subtaskActive = false;
  }

  deleteSubtask(index: number) {
    this.subtasks.splice(index, 1);
  }

  editSubtask(index: number) {
    this.subtasks[index].title = this.subtaskEditInput;
    this.emitSubtasks();
  }

  emitSubtasks() {
    this.selectedSubTasks.emit(
      this.subtasks.map((subtask) => ({
        title: subtask.title,
        done: subtask.done,
      }))
    );
  }

  reloadInput(index: number) {
    this.subtaskEditInput = this.subtasks[index].title;
  }
}
