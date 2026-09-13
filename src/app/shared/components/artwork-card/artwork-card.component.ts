import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Artwork } from '../../../domain/interfaces/artwork.interface';

@Component({
  selector: 'app-artwork-card',
  standalone: false,
  templateUrl: './artwork-card.component.html',
  styleUrl: './artwork-card.component.scss',
  host: {
    // Opt this card into the contextual pen nib (see CursorService DRAW_ZONE_SELECTOR).
    'data-draw-zone': '',
  },
})
export class ArtworkCardComponent {
  @Input() artwork!: Artwork;
  @Output() clicked = new EventEmitter<Artwork>();

  isLoaded = false;
  hasError = false;

  onLoad(): void {
    this.isLoaded = true;
  }

  onError(): void {
    this.hasError = true;
    this.isLoaded = true; // remove skeleton even on error
  }

  onClick(): void {
    this.clicked.emit(this.artwork);
  }
}
