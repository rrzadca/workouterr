import { inject, Pipe, type PipeTransform } from '@angular/core';
import type { NumberFormat } from './formats';
import { Formatter } from './formatter';

/** `{{ weight | formatNumber }}`, `{{ sets | formatNumber: 'integer' }}` */
@Pipe({
  name: 'formatNumber',
  // Not pure: the output also changes when the language changes, not only when the value does
  pure: false,
})
export class FormatNumberPipe implements PipeTransform {
  private readonly formatter = inject(Formatter);

  transform(value: number | null | undefined, format?: NumberFormat): string {
    return value === null || value === undefined ? '' : this.formatter.formatNumber(value, format);
  }
}
