import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { PenCursorComponent } from './shared/components/pen-cursor/pen-cursor.component';
import { LanguageToggleComponent } from './shared/components/language-toggle/language-toggle.component';
import { TranslatePipe } from './shared/pipes/translate.pipe';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), TranslatePipe],
      declarations: [
        AppComponent,
        NavbarComponent,
        FooterComponent,
        PenCursorComponent,
        LanguageToggleComponent,
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
