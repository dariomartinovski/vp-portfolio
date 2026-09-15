import { Component, NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { LanguageService } from '../../core/services/language.service';

@Component({
  standalone: false,
  template: `<span id="out">{{ 'See My Work' | translate }}</span>`,
})
class HostComponent {}

// The host needs a compile-time NgModule scope for the pipe to resolve.
@NgModule({ declarations: [HostComponent], imports: [TranslatePipe] })
class TestModule {}

describe('TranslatePipe', () => {
  let fixture: ComponentFixture<HostComponent>;
  let languageService: LanguageService;

  const out = (): string => fixture.nativeElement.querySelector('#out').textContent.trim();

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [TestModule] }).compileComponents();

    languageService = TestBed.inject(LanguageService);
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('renders the key itself while English is active', () => {
    expect(out()).toBe('See My Work');
  });

  it('renders the Macedonian translation when active', async () => {
    languageService.setLanguage('mk');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(out()).toBe('Погледни ги проектите');
  });

  // The pipe's string input never changes, so this is the regression guard:
  // switching language must invalidate and re-check the consuming view.
  it('re-renders when the language changes after the first render', async () => {
    expect(out()).toBe('See My Work');

    languageService.setLanguage('mk');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(out()).toBe('Погледни ги проектите');

    languageService.setLanguage('en');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(out()).toBe('See My Work');
  });
});
