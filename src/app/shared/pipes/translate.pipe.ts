import { ChangeDetectorRef, Pipe, PipeTransform, effect, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

/**
 * Impure on purpose: a pure pipe caches against its input, and that input (the
 * English literal) never changes when the language flips, so a pure pipe would
 * keep rendering the stale language forever.
 *
 * Impure alone is not enough under zoneless + OnPush, because the consuming
 * view is only checked when something marks it dirty. The effect below watches
 * the language signal and marks the view that uses this pipe, so a switch
 * triggers exactly one re-check per affected view.
 */
@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly languageService = inject(LanguageService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      this.languageService.language();
      this.cdr.markForCheck();
    });
  }

  transform(value: string): string {
    return this.languageService.translate(value);
  }
}
