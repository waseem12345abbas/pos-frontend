import { Injectable } from '@angular/core';

export type Theme = 'blue' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme: Theme = 'blue';

  constructor() {
    // Restore saved theme on app load
    const saved = localStorage.getItem('pharma-theme') as Theme | null;
    if (saved) this.applyTheme(saved);
    else this.applyTheme('blue');
  }

  setTheme(theme: Theme): void {
    this.applyTheme(theme);
    localStorage.setItem('pharma-theme', theme);
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  private applyTheme(theme: Theme): void {
    this.currentTheme = theme;
    document.body.classList.remove('theme-blue', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
  }
}
