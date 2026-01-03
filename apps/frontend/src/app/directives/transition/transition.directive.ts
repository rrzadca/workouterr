import {
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    OnInit,
    output,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, filter, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
    selector: '[rrTransition]',
})
export class TransitionDirective implements OnInit {
    private readonly destroyRef = inject(DestroyRef);

    rrTransitionEntering = input<string>('');
    rrTransitionEnteringFrom = input<string>('');
    rrTransitionEnteringTo = input<string>('');
    rrTransitionLeaving = input<string>('');
    rrTransitionLeavingFrom = input<string>('');
    rrTransitionLeavingTo = input<string>('');
    hideFromDOMWhenNotVisible = input<boolean>(false);
    hideByDefault = input<boolean>(false);

    onTransitionEnteringEnd = output<void>();
    onTransitionLeavingEnd = output<void>();

    private visible = false;

    rrTransition = input<boolean>();

    constructor(private elementRef: ElementRef) {
        this.observeElementTransition();

        effect(() => {
            const transitionValue = this.rrTransition();

            if (this.visible === transitionValue || !this.element) {
                return;
            }

            this.visible = !!transitionValue;

            if (transitionValue) {
                this.removeClasses('hidden');
                this.addClasses(this.rrTransitionEntering());
                this.addClasses(this.rrTransitionEnteringFrom());

                requestAnimationFrame(() => {
                    this.removeClasses(this.rrTransitionEnteringFrom());
                    this.addClasses(this.rrTransitionEnteringTo());
                });
            } else {
                this.removeClasses(this.rrTransitionEntering());
                this.removeClasses(this.rrTransitionEnteringTo());
                this.addClasses(this.rrTransitionLeaving());
                this.addClasses(this.rrTransitionLeavingFrom());

                requestAnimationFrame(() => {
                    this.removeClasses(this.rrTransitionLeavingFrom());
                    this.addClasses(this.rrTransitionLeavingTo());
                });
            }
        });
    }

    ngOnInit(): void {
        if (this.hideByDefault()) {
            this.addClasses('hidden');
        }
    }

    get element(): HTMLElement | null {
        return this.elementRef?.nativeElement ?? null;
    }

    private observeElementTransition(): void {
        if (!this.element) {
            return;
        }
        fromEvent(this.element, 'transitionend')
            .pipe(
                filter((event) => event.target === this.element),
                // debounce to ignore many events from different properties of the element
                debounceTime(50),
                tap((event) => {
                    if (!this.visible) {
                        this.onTransitionLeavingEnd.emit();
                        this.removeClasses(this.rrTransitionLeavingTo());

                        if (this.hideFromDOMWhenNotVisible()) {
                            if (!this.element) {
                                return;
                            }
                            this.addClasses('hidden');
                        }
                    } else {
                        this.onTransitionEnteringEnd.emit();
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    private addClasses(classes: string): void {
        if (!this.element) {
            return;
        }
        this.element.classList.add(...classes.split(' '));
    }

    private removeClasses(classes: string): void {
        if (!this.element) {
            return;
        }
        this.element.classList.remove(...classes.split(' '));
    }
}
