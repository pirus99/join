/**
 * @fileoverview Help page component displaying application help and documentation
 */

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Help page component with application documentation
 * @component
 */
@Component({
  selector: 'app-help-page',
  imports: [RouterLink],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.scss'
})
export class HelpPageComponent {

}
