import { Pipe, PipeTransform } from '@angular/core';
import { DictionaryItem } from '@services/dictionaries.service';

@Pipe({
    name: 'dictionaryList',
})
export class DictionaryListPipe implements PipeTransform {
    transform(value: DictionaryItem[]): string {
        if (!value || value.length === 0) {
            return '';
        }
        return value.map((item) => item.name).join(', ');
    }
}
