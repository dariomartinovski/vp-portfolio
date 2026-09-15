import { Component } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { LANGUAGES, Language } from '../../../domain/const/translations.const';

@Component({
  selector: 'app-language-toggle',
  standalone: false,
  templateUrl: './language-toggle.component.html',
  styleUrl: './language-toggle.component.scss',
})
export class LanguageToggleComponent {
  readonly languages = LANGUAGES;

  constructor(protected readonly languageService: LanguageService) {}

  isActive(code: Language): boolean {
    return this.languageService.language() === code;
  }

  select(code: Language): void {
    this.languageService.setLanguage(code);
  }
}
