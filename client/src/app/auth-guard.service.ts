import { Injectable } from "@angular/core";
import {
  CanActivate,
  Router,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class AuthGuardService implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (localStorage.getItem("token")) {
      //if the user is logged in it allows access to user profile
      //and blocks access to login and register page;
      return state.url.startsWith("/profile")
        ? true
        : (this.router.navigate(["/"]), false);
    } else {
      //if the user is not logged in its blocks access to routes which starts with profile
      //and allow access to login and register page;
      return state.url.startsWith("/profile")
        ? (this.router.navigate(["/"]), false)
        : true;
    }
  }
}
