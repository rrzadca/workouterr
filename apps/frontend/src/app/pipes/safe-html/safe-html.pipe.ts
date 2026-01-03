import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'rrSafeHtml',
})
export class SafeHtmlPipe implements PipeTransform {
    private readonly domSanitizer = inject(DomSanitizer);

    transform(value: string | null): SafeHtml {
        if (!value) {
            return '';
        }
        return this.domSanitizer.bypassSecurityTrustHtml(value);
    }
}
