import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { Artwork } from '../../../domain/interfaces/artwork.interface';
import { SeoService } from '../../../core/services/seo.service';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

@Component({
  selector: 'app-image-viewer',
  standalone: false,
  templateUrl: './image-viewer.component.html',
  styleUrl: './image-viewer.component.scss',
})
export class ImageViewerComponent implements OnChanges, OnDestroy {
  @Input() artworks: Artwork[] = [];
  @Input() currentIndex = 0;
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  @ViewChild('dialog') private dialog?: ElementRef<HTMLElement>;
  @ViewChild('closeButton') private closeButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('artImage') private artImage?: ElementRef<HTMLImageElement>;

  isImageLoaded = false;
  private touchStartX = 0;
  private previouslyFocused: HTMLElement | null = null;

  constructor(
    private seoService: SeoService,
    private cdr: ChangeDetectorRef,
  ) {}

  get current(): Artwork {
    return this.artworks[this.currentIndex];
  }

  get hasPrev(): boolean {
    return this.currentIndex > 0;
  }
  get hasNext(): boolean {
    return this.currentIndex < this.artworks.length - 1;
  }

  get dialogLabel(): string {
    return this.current ? `${this.current.title}, artwork viewer` : 'Artwork viewer';
  }

  ngOnChanges(): void {
    if (this.visible && this.current) {
      document.body.style.overflow = 'hidden';
      this.isImageLoaded = false;
      this.seoService.updateForArtwork(this.current);
      this.moveFocusIntoDialog();
      // The browser fires no `load` event when `src` is assigned the value it
      // already holds (reopening the last-viewed artwork, or index 0 which the
      // always-mounted <img> fetched at page load), which would leave the image
      // stuck invisible behind the skeleton. Re-check once the new src is applied.
      Promise.resolve().then(() => this.syncLoadedState());
    } else {
      // A parent can hide the viewer by setting `visible` without going through
      // close(); without this branch the scroll lock would never be released.
      document.body.style.overflow = '';
      this.restoreFocus();
    }
  }

  close(): void {
    document.body.style.overflow = '';
    this.restoreFocus();
    this.closed.emit();
  }

  prev(): void {
    if (this.hasPrev) {
      this.currentIndex--;
      this.isImageLoaded = false;
      this.seoService.updateForArtwork(this.current);
    }
  }

  next(): void {
    if (this.hasNext) {
      this.currentIndex++;
      this.isImageLoaded = false;
      this.seoService.updateForArtwork(this.current);
    }
  }

  onImageLoad(): void {
    this.isImageLoaded = true;
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('viewer')) {
      this.close();
    }
  }

  // Touch swipe support
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    const delta = this.touchStartX - event.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      delta > 0 ? this.next() : this.prev();
    }
  }

  // Keyboard navigation
  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (!this.visible) return;
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'Escape') this.close();
    if (e.key === 'Tab') this.trapFocus(e);
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  private moveFocusIntoDialog(): void {
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    // The dialog is still visibility:hidden until change detection applies
    // .open, and a hidden element cannot receive focus - defer one microtask.
    Promise.resolve().then(() => this.closeButton?.nativeElement.focus());
  }

  private restoreFocus(): void {
    this.previouslyFocused?.focus?.();
    this.previouslyFocused = null;
  }

  private syncLoadedState(): void {
    const img = this.artImage?.nativeElement;
    if (img && img.complete && img.naturalWidth > 0 && !this.isImageLoaded) {
      this.isImageLoaded = true;
      // Raw microtask, not an Angular event: notify the zoneless scheduler.
      this.cdr.markForCheck();
    }
  }

  private trapFocus(e: KeyboardEvent): void {
    const focusable = this.focusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    const outsideDialog = !this.dialog?.nativeElement.contains(active ?? null);

    if (e.shiftKey && (active === first || outsideDialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || outsideDialog)) {
      e.preventDefault();
      first.focus();
    }
  }

  private focusableElements(): HTMLElement[] {
    const nodes = this.dialog?.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!nodes) return [];
    // Arrows at the ends of the set are hidden but would still be focusable.
    return Array.from(nodes).filter((el) => !el.classList.contains('hidden'));
  }
}
