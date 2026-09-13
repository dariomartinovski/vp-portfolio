import { CommonModule } from '@angular/common';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
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
import { TruncatePipe } from './shared/pipes/truncate.pipe';
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
    TruncatePipe,
    HomePage,
    WorkPage,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [AppComponent],
})
export class AppModule {}
