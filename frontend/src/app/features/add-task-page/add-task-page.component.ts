/**
 * @fileoverview Add task page component wrapping the add task functionality
 */

import { Component } from '@angular/core';
import { AddTaskComponent } from '../../shared/add-task/add-task.component';

/**
 * Page component for adding new tasks
 * @component
 */
@Component({
  selector: 'app-add-task-page',
  imports: [AddTaskComponent],
  templateUrl: './add-task-page.component.html',
  styleUrl: './add-task-page.component.scss'
})
export class AddTaskPageComponent {

}
