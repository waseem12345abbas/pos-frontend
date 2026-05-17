import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  constructor(public themeService: ThemeService) {}

  navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/inventory', label: 'Inventory', icon: '💊' },
    { path: '/add-medicine', label: 'Add Medicine', icon: '➕' },
    { path: '/sales', label: 'Sales / POS', icon: '🛒' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ];
}
