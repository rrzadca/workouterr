import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { translateSignal, TranslocoPipe } from '@jsverse/transloco';
import { LucideDynamicIcon, LucideHouse, LucideMoon, LucideSun } from '@lucide/angular';
import { Button, SidebarNav, type SidebarNavSection } from '@radinf/ui';
import { FormatDatePipe } from '../formatting/format-date.pipe';
import { ThemeService } from '../theme/theme.service';

/** The frame around every signed-in screen: header, sidebar navigation and the routed page. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TranslocoPipe, LucideDynamicIcon, Button, SidebarNav, FormatDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex h-dvh flex-col' },
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly themeService = inject(ThemeService);
  protected readonly today = new Date();

  // The -dark logo files are navy for light backgrounds, the -light files teal for dark ones
  protected readonly logoVariant = computed(() => (this.themeService.theme() === 'dark' ? 'light' : 'dark'));
  protected readonly themeToggleIcon = computed(() => (this.themeService.theme() === 'dark' ? LucideSun : LucideMoon));
  protected readonly themeToggleLabelKey = computed(() =>
    this.themeService.theme() === 'dark' ? 'shell.switchToLightTheme' : 'shell.switchToDarkTheme',
  );

  private readonly trainingLabel = translateSignal('shell.sections.training');
  private readonly startLabel = translateSignal('shell.navigation.start');

  // Later tickets add Exercises, Routines and Settings here
  protected readonly sections = computed<SidebarNavSection[]>(() => [
    { label: this.trainingLabel(), items: [{ link: '/', label: this.startLabel(), icon: LucideHouse }] },
  ]);
}
