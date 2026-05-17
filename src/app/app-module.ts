import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { TableModule } from 'primeng/table';

import { AppRoutingModule } from './app-routing-module';


import { App } from './app';

import { Navbar } from './components/navbar/navbar';
import { Dashboard } from './pages/dashboard/dashboard';
import { Inventory } from './pages/inventory/inventory';
import { AddMedicine } from './pages/add-medicine/add-medicine';
import { Sales } from './pages/sales/sales';
import { SettingsComponent } from './pages/settings/settings';
import { Reports } from './pages/reports/reports';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

@NgModule({
  declarations: [
    App,
    Navbar,
    Dashboard,
    Inventory,
    AddMedicine,
    Sales,
    SettingsComponent,
    Reports
  ],
imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TableModule
  ],

  providers: [
    provideBrowserGlobalErrorListeners(),
  providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ],
  bootstrap: [App]
})
export class AppModule { }
