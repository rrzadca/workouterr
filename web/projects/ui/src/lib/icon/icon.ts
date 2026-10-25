import { Component, computed, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { type IconName, icons } from './icons';

// A decorative Lucide icon in the current text colour. The control around it carries the accessible name.
@Component({
  imports: [LucideDynamicIcon],
  selector: 'rad-icon',
  templateUrl: './icon.html',
  host: {
    class: 'inline-flex shrink-0 items-center justify-center leading-none',
    'aria-hidden': 'true',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
})
export class Icon {
  readonly name = input.required<IconName>();
  // Width and height in pixels.
  readonly size = input(16);

  protected readonly icon = computed(() => icons[this.name()]);
}
