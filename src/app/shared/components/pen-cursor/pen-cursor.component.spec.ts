import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PenCursorComponent } from './pen-cursor.component';
import { CursorService } from '../../../core/services/cursor.service';

describe('PenCursorComponent', () => {
  let fixture: ComponentFixture<PenCursorComponent>;
  let cursor: CursorService;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PenCursorComponent],
    }).compileComponents();

    cursor = TestBed.inject(CursorService);
    fixture = TestBed.createComponent(PenCursorComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('registers its host element with the cursor service for positioning', () => {
    const registerPen = vi.spyOn(cursor, 'registerPen');

    fixture.detectChanges();

    expect(registerPen).toHaveBeenCalledWith(host);
  });

  it('unregisters its host element on destroy', () => {
    fixture.detectChanges();
    const unregisterPen = vi.spyOn(cursor, 'unregisterPen');

    fixture.destroy();

    expect(unregisterPen).toHaveBeenCalledWith(host);
  });

  it('renders the nib as a decorative svg', () => {
    fixture.detectChanges();

    const svg = host.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute('aria-hidden')).toBe('true');
  });

  it('carries no active class while the pointer is outside a draw zone', () => {
    fixture.detectChanges();

    expect(host.classList.contains('pen--active')).toBe(false);
  });

  it('adds the active class once the cursor service reports a draw zone', () => {
    fixture.detectChanges();

    cursor.penActive.set(true);
    fixture.detectChanges();

    expect(host.classList.contains('pen--active')).toBe(true);
  });
});
