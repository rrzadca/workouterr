import { inject, Pipe, type PipeTransform } from '@angular/core';
import type { DateFormat } from './formats';
import { Formatter } from './formatter';

/** `{{ session.startedAt | formatDate: 'long' }}` */
@Pipe({
  name: 'formatDate',
  // Not pure: the output also changes when the language changes, not only when the value does
  pure: false,
})
export class FormatDatePipe implements PipeTransform {
  private readonly formatter = inject(Formatter);

  transform(value: Date | string | number | null | undefined, format?: DateFormat): string {
    return value === null || value === undefined ? '' : this.formatter.formatDate(value, format);
  }
}
