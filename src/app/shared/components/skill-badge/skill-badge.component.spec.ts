import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkillBadgeComponent } from './skill-badge.component';

describe('SkillBadgeComponent', () => {
  let fixture: ComponentFixture<SkillBadgeComponent>;
  let component: SkillBadgeComponent;
  let root: HTMLElement;

  const img = (): HTMLImageElement | null => root.querySelector('.badge__icon');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkillBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkillBadgeComponent);
    component = fixture.componentInstance;
    root = fixture.nativeElement as HTMLElement;
  });

  it('renders the name', () => {
    fixture.componentRef.setInput('name', 'Figma');
    fixture.detectChanges();

    expect(root.querySelector('.badge__name')?.textContent?.trim()).toBe('Figma');
  });

  it('renders an image with the name as alt text when an icon is supplied', () => {
    fixture.componentRef.setInput('name', 'Figma');
    fixture.componentRef.setInput('icon', 'assets/images/icons/figma.svg');
    fixture.detectChanges();

    expect(img()).toBeTruthy();
    expect(img()!.getAttribute('src')).toBe('assets/images/icons/figma.svg');
    expect(img()!.getAttribute('alt')).toBe('Figma');
    expect(img()!.getAttribute('loading')).toBe('lazy');
  });

  it('renders no image element when the icon is empty', () => {
    fixture.componentRef.setInput('name', 'Procreate');
    fixture.detectChanges();

    expect(img()).toBeNull();
  });

  it('hides the image rather than showing a broken icon when it fails to load', () => {
    fixture.componentRef.setInput('name', 'Figma');
    fixture.componentRef.setInput('icon', 'assets/images/icons/missing.svg');
    fixture.detectChanges();

    img()!.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(img()!.style.display).toBe('none');
    // The label must survive a missing icon.
    expect(root.querySelector('.badge__name')?.textContent?.trim()).toBe('Figma');
  });

  it('exposes onImgError for the template error binding', () => {
    expect(typeof component.onImgError).toBe('function');
  });
});
