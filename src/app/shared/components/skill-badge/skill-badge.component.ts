import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skill-badge',
  standalone: false,
  templateUrl: './skill-badge.component.html',
  styleUrl: './skill-badge.component.scss',
})
export class SkillBadgeComponent {
  @Input() name = '';
  @Input() icon = ''; // path to svg icon in assets

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
