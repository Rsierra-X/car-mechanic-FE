import { Routes } from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {DashboadComponent} from "./components/dashboad/dashboad.component";
import {OrdersCatalogComponent} from "./pages/orders/orders-catalog/orders-catalog.component";

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboadComponent,
  },
  {
    path: 'orders',
    component: OrdersCatalogComponent,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
