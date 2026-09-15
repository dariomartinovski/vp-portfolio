import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageToggleComponent } from './language-toggle.component';
import { LanguageService } from '../../../core/services/language.service';

describe('LanguageToggleComponent', () => {
  let fixture: ComponentFixture<LanguageToggleComponent>;
  let root: HTMLElement;
  let service: LanguageService;

  const buttons = (): HTMLButtonElement[] =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('.lang-toggle__btn'));

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      declarations: [LanguageToggleComponent],
    }).compileComponents();

    service = TestBed.inject(LanguageService);
    fixture = TestBed.createComponent(LanguageToggleComponent);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => localStorage.clear());

  it('renders one flag button per language', () => {
    expect(buttons().length).toBe(2);
    expect(buttons()[0].querySelector('img')!.getAttribute('src')).toContain('en.svg');
    expect(buttons()[1].querySelector('img')!.getAttribute('src')).toContain('mk.svg');
  });

  it('marks only the active language', () => {
    expect(buttons()[0].classList.contains('active')).toBe(true);
    expect(buttons()[1].classList.contains('active')).toBe(false);
    expect(buttons()[0].getAttribute('aria-pressed')).toBe('true');
  });

  it('switches and persists the language when a flag is clicked', () => {
    buttons()[1].click();
    fixture.detectChanges();

    expect(service.language()).toBe('mk');
    expect(localStorage.getItem('vp-portfolio-language')).toBe('mk');
    expect(buttons()[1].classList.contains('active')).toBe(true);
    expect(buttons()[0].classList.contains('active')).toBe(false);
  });
});
