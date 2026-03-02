import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-policies',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './public-policies.html',
  styleUrls: ['../public-shared/public-pages.css', './public-policies.css']
})
export class PublicPoliciesComponent {}

