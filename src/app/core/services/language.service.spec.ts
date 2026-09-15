import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';
import { DEFAULT_LANGUAGE } from '../../domain/const/translations.const';

const STORAGE_KEY = 'vp-portfolio-language';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguageService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  it('defaults to English', () => {
    expect(service.language()).toBe(DEFAULT_LANGUAGE);
  });

  it('translates known keys', () => {
    service.setLanguage('mk');

    expect(service.translate('Home')).toBe('Почетна');
  });

  it('falls back to the key itself when no translation exists', () => {
    service.setLanguage('mk');

    expect(service.translate('Not a real key')).toBe('Not a real key');
  });

  it('persists the choice and restores it on a fresh instance', () => {
    service.setLanguage('mk');

    expect(localStorage.getItem(STORAGE_KEY)).toBe('mk');
    expect(new LanguageService().language()).toBe('mk');
  });

  it('ignores unrecognised values in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'fr');

    expect(new LanguageService().language()).toBe(DEFAULT_LANGUAGE);
  });

  it('keeps the document language attribute in sync', () => {
    service.setLanguage('mk');
    expect(document.documentElement.lang).toBe('mk');

    service.setLanguage('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
