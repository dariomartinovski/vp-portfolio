import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { auditTime, distinctUntilChanged } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  private activeSectionSubject = new BehaviorSubject<string>('home');
  // auditTime fires once per window for as long as the user keeps scrolling, so
  // the same id would be re-published ~20x/second. Subscribers only want changes.
  activeSection$ = this.activeSectionSubject.asObservable().pipe(distinctUntilChanged());

  private sectionIds = ['home', 'featured', 'about', 'services', 'contact'];

  constructor(private ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'scroll')
        .pipe(auditTime(50))
        .subscribe(() => this.updateActiveSection());
    });
  }

  scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private updateActiveSection(): void {
    const offset = window.innerHeight * 0.35;
    for (const id of this.sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= offset && rect.bottom > offset) {
        this.ngZone.run(() => this.activeSectionSubject.next(id));
        break;
      }
    }
  }
}
