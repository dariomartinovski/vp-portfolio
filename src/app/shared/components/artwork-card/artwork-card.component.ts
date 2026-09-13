import { Component } from '@angular/core';

@Component({
  selector: 'app-artwork-card',
  standalone: false,
  styleUrl: './artwork-card.component.scss',
  templateUrl: './artwork-card.component.html',
  host: {
    'data-draw-zone': '',
  },
})
export class ArtworkCardComponent {}
