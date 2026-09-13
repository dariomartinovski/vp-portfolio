import { Component } from '@angular/core';
import { ARTIST_NAME, PERSON_NAME } from '../../../domain/const/site.const';

@Component({
  selector: 'app-footer',
  standalone: false,
  styleUrl: './footer.component.scss',
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  readonly personName = PERSON_NAME;
  readonly artistName = ARTIST_NAME;
  readonly currentYear = new Date().getFullYear();
}
