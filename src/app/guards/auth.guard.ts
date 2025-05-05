import {inject, Injectable} from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import {SecurityService} from "../services/security/security.service";

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  isLoggedIn = inject(SecurityService).loginStatus;
  constructor(private router: Router) {}


  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {

    const isLogged = this.isLoggedIn();
    if (isLogged) {
      const targetUrl = state.url;

      const validRoutes = ['/dashboard', '/orders', '/configuration', '/clientes'];
      if (!validRoutes.includes(targetUrl)) {
        return this.router.createUrlTree(['/dashboard']);
      }

      return true;
    } else {
      this.router.navigate(['/login']).then();
      return false;
    }
  }
}
