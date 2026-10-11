import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A screen: a sticky toolbar with the title and actions, then the content with the screen gutter.
 *
 * ```html
 * <rad-page-layout title="Exercises">
 *   <button pageActions rad-button variant="primary">New exercise</button>
 *   …content…
 * </rad-page-layout>
 * ```
 */
@Component({
  selector: 'rad-page-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-full flex-col' },
  templateUrl: './page-layout.html',
})
export class PageLayout {
  readonly title = input.required<string>();
}
