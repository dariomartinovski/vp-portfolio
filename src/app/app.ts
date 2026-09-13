import { Component, OnDestroy, OnInit } from '@angular/core';
import { CursorService } from './core/services/cursor.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'portfolio';

  constructor(private cursorService: CursorService) {}

  ngOnInit(): void {
    this.cursorService.init();
  }

  ngOnDestroy(): void {
    this.cursorService.destroy();
  }
}
