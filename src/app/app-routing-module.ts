import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Inventory } from './pages/inventory/inventory';
import { AddMedicine } from './pages/add-medicine/add-medicine';
import { Sales } from './pages/sales/sales';
import { SettingsComponent } from './pages/settings/settings';
import { Reports } from './pages/reports/reports';

const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'inventory', component: Inventory },
  { path: 'add-medicine', component: AddMedicine },
  { path: 'sales', component: Sales },
  { path: 'reports', component: Reports },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
