import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { translateSignal, TranslocoPipe } from '@jsverse/transloco';
import { LucideDynamicIcon, LucideHouse, LucideMoon, LucideSun } from '@lucide/angular';
import { Button, SidebarNav, type SidebarNavSection } from '@radinf/ui';
import { FormatDatePipe } from '../formatting/format-date.pipe';
import { ThemeService, type Theme } from '../theme/theme.service';

// The -dark logo files are navy for light backgrounds, the -light files teal for dark ones
const shellAppearanceByTheme = {
  light: { logoVariant: 'dark', themeToggleIcon: LucideMoon, themeToggleLabelKey: 'shell.switchToDarkTheme' },
  dark: { logoVariant: 'light', themeToggleIcon: LucideSun, themeToggleLabelKey: 'shell.switchToLightTheme' },
} as const satisfies Record<Theme, object>;

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

  protected readonly appearance = computed(() => shellAppearanceByTheme[this.themeService.theme()]);

  private readonly trainingLabel = translateSignal('shell.sections.training');
  private readonly startLabel = translateSignal('shell.navigation.start');

  // Later tickets add Exercises, Routines and Settings here
  protected readonly sections = computed<SidebarNavSection[]>(() => [
    { label: this.trainingLabel(), items: [{ link: '/', label: this.startLabel(), icon: LucideHouse }] },
  ]);
}
