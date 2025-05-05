import { Routes } from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import {DashboadComponent} from "./components/dashboad/dashboad.component";
import {OrdersCatalogComponent} from "./pages/orders/orders-catalog/orders-catalog.component";
import {ConfigurationComponent} from "./pages/configuration/configuration.component";
import {AuthGuard} from "./guards/auth.guard";
import {ClienteComponent} from "./pages/cliente/cliente.component";
import {InventarioComponent} from "./pages/inventario/inventario.component";

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboadComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'orders',
    component: OrdersCatalogComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'configuration',
    component: ConfigurationComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'clientes',
    component: ClienteComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'inventario',
    component: InventarioComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
