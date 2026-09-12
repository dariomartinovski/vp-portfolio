import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Navbar } from './shared/components/navbar/navbar';
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
    App,
    Navbar,
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
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
