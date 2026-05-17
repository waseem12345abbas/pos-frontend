import { Component, OnInit } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // ThemeService constructor handles theme initialization
  }
}
