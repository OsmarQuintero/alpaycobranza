import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-features',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './public-features.html',
  styleUrls: ['../public-shared/public-pages.css', './public-features.css']
})
export class PublicFeaturesComponent {}
