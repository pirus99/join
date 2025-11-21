/**
 * @fileoverview Modal component for creating a new task.
 * Hosts the AddTaskComponent, loads an inline close icon SVG, handles slide-in/out animation,
 * and closes on outside click.
 */

import { Component, Input, Renderer2 } from '@angular/core';
import { AddTaskComponent } from '../add-task/add-task.component';
import { SVGInlineService } from '../services/svg-inline.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-add-task-modal',
    imports: [AddTaskComponent],
    templateUrl: './add-task-modal.component.html',
    styleUrl: './add-task-modal.component.scss',
})
export class AddTaskModalComponent {
    /**
     * Preselected contacts to be shown as assigned in the add-task form.
     */
    @Input() selectedContacts: any[] = [];

    /**
     * Preselected task status for the new task.
     * Typical mapping: 1 = To do, 2 = In progress, 3 = Await feedback, 4 = Done.
     */
    @Input() taskStatus: number = 1;

    /**
     * Whether the modal is currently mounted/open.
     */
    isOpen: boolean = false;

    /**
     * Whether the slide-in animation state is active.
     */
    isSlide: boolean = false;

    /**
     * Sanitized inline SVG content for the close icon.
     */
    svgContent!: SafeHtml;

    /**
     * Path to the close icon SVG asset.
     */
    iconSrc = 'assets/icons/close.svg';

    /**
     * Creates the component and registers a global pointerdown listener
     * to close the modal when clicking outside of it.
     * @param renderer Angular Renderer2 used to register the global event listener.
     * @param svgService Service to fetch inline SVG content.
     * @param sanitizer Angular DomSanitizer to trust loaded SVG safely.
     */
    constructor(private renderer: Renderer2, private svgService: SVGInlineService, private sanitizer: DomSanitizer) {
        this.renderer.listen('window', 'pointerdown', (event) => {
            const modal = document.querySelector('.modal-content');
            if (this.isOpen && modal && !modal.contains(event.target as Node)) {
                this.closeModal();
            }
        });
    }

    /**
     * Preloads and sanitizes the close icon as inline SVG.
     */
    ngOnInit() {
        if (this.iconSrc) {
            this.svgService.getInlineSVG(this.iconSrc).subscribe({
                next: (svg: string) => {
                    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
                },
                error: (err) => console.error('SVG load error:', err),
            });
        }
    }

    /**
     * Opens the modal and triggers the slide-in animation.
     */
    openModal() {
        this.isOpen = true;
        setTimeout(() => {
            this.isSlide = true;
        }, 25);
    }

    /**
     * Closes the modal with a slide-out animation.
     */
    closeModal() {
        this.isSlide = false;
        setTimeout(() => {
            this.isOpen = false;
        }, 600);
    }
}
