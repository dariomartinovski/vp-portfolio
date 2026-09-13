import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { PenCursorComponent } from './shared/components/pen-cursor/pen-cursor.component';
import { SectionRevealComponent } from './shared/components/section-reveal/section-reveal.component';
import { ArtworkCardComponent } from './shared/components/artwork-card/artwork-card.component';
import { ImageViewerComponent } from './shared/components/image-viewer/image-viewer.component';
import { SkillBadgeComponent } from './shared/components/skill-badge/skill-badge.component';
import { ContactFormComponent } from './shared/components/contact-form/contact-form.component';
import { HomePage } from './pages/home/home.page';
import { WorkPage } from './pages/work/work.page';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    PenCursorComponent,
    SectionRevealComponent,
    ArtworkCardComponent,
    ImageViewerComponent,
    SkillBadgeComponent,
    ContactFormComponent,
    HomePage,
    WorkPage,
  ],
  imports: [BrowserModule, ReactiveFormsModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [AppComponent],
})
export class AppModule {}
