/**
 * @fileoverview Reusable button component with icon support
 */

import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SVGInlineService } from '../../services/svg-inline.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Reusable button component with customizable icon and styling
 * @component
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  providers: [SVGInlineService],
})
export class ButtonComponent {
  svgContent!: SafeHtml;

  @Input() iconSrc!: string;
  @Input() altText: string = 'Button icon';
  @Input() type: string = 'button';
  @Input() fontSize: string = '26px';
  @Input() size:
    | 'large'
    | 'medium'
    | 'small'
    | 'xsmall'
    | 'dynamic'
    | 'priority' = 'dynamic';
  @Input() active: boolean = false;
  @Input() invert: boolean = false;
  @Input() round: boolean = false;
  @Input() iconBtn: boolean = false;
  @Input() color: 'normal' | 'danger' | 'warn' | 'success' = 'normal';
  @Input() border: boolean = true;
  @Input() disabled: boolean | null = false;

  @Output() btnClick = new EventEmitter<void>();

  constructor(
    private svgService: SVGInlineService,
    private sanitizer: DomSanitizer
  ) {}

  handleClick() {
    this.btnClick.emit();
  }

  ngOnInit(): void {
    if (this.iconSrc) {
      this.svgService.getInlineSVG(this.iconSrc).subscribe({
        next: (svg: string) => {
          this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
        },
        error: (err) => console.error('SVG load error:', err),
      });
    }
  }
}
