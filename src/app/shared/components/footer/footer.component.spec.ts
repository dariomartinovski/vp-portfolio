import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { ARTIST_NAME, PERSON_NAME } from '../../../domain/const/site.const';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let root: HTMLElement;

  const links = (): HTMLAnchorElement[] =>
    Array.from(root.querySelectorAll<HTMLAnchorElement>('.footer__links a'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('shows the designer name from the shared constant', () => {
    expect(root.querySelector('.footer__name')?.textContent?.trim()).toBe(PERSON_NAME);
  });

  it('credits the artist alias under a dynamic copyright year', () => {
    const copy = root.querySelector('.footer__copy')?.textContent?.replace(/\s+/g, ' ').trim();

    expect(copy).toBe(`© ${new Date().getFullYear()} ${ARTIST_NAME} - All rights reserved`);
    expect(copy).not.toContain('2025');
  });

  it('renders the three social links in order', () => {
    expect(links().map((a) => a.textContent?.trim())).toEqual(['Instagram', 'Behance', 'Email']);
  });

  it('guards every external link against reverse tabnabbing', () => {
    links()
      .filter((a) => a.target === '_blank')
      .forEach((a) => expect(a.rel).toContain('noopener'));
  });

  it('uses a mailto link for the email entry', () => {
    const email = links().find((a) => a.textContent?.trim() === 'Email');

    expect(email?.getAttribute('href')).toMatch(/^mailto:/);
    expect(email?.target).toBe('');
  });
});
