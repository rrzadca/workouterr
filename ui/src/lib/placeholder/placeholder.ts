import { Component, input } from '@angular/core';

// Proves the library, Tailwind and Storybook work; replaced by real components from issue 03 on.
@Component({
  selector: 'rad-placeholder',
  template: `<p class="rounded-lg border border-dashed border-gray-400 p-4 text-gray-600">{{ label() }}</p>`,
})
export class Placeholder {
  readonly label = input.required<string>();
}
