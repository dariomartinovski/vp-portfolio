import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { CursorService } from '../../../core/services/cursor.service';

@Component({
  selector: 'app-pen-cursor',
  standalone: false,
  styleUrl: './pen-cursor.component.scss',
  templateUrl: './pen-cursor.component.html',
  host: {
    '[class.pen--active]': 'cursor.penActive()',
  },
})
export class PenCursorComponent implements AfterViewInit, OnDestroy {
  constructor(
    protected readonly cursor: CursorService,
    private readonly elementRef: ElementRef<HTMLElement>,
  ) {}

  ngAfterViewInit(): void {
    this.cursor.registerPen(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.cursor.unregisterPen(this.elementRef.nativeElement);
  }
}
