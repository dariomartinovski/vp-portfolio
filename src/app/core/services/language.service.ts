import { Injectable, signal } from '@angular/core';
import { DEFAULT_LANGUAGE, Language, TRANSLATIONS } from '../../domain/const/translations.const';

const STORAGE_KEY = 'vp-portfolio-language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly language = signal<Language>(this.readStored());

  constructor() {
    document.documentElement.lang = this.language();
  }

  /** English keys fall through to themselves, so missing entries stay readable. */
  translate(key: string): string {
    const language = this.language();
    return TRANSLATIONS[language][key] ?? TRANSLATIONS[DEFAULT_LANGUAGE][key] ?? key;
  }

  setLanguage(language: Language): void {
    this.language.set(language);
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Storage blocked (private browsing): the choice just won't persist.
    }
  }

  private readStored(): Language {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'mk' || stored === 'en' ? stored : DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  }
}
