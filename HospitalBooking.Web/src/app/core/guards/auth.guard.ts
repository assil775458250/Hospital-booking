import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthSessionService } from '../auth/auth-session.service';
import { UserRole } from '../../models/auth/auth-user.model';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const sessionService = inject(AuthSessionService);
  const router = inject(Router);

  if (!sessionService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = route.data?.['roles'] as UserRole | UserRole[] | undefined;
  if (allowedRoles) {
    const currentRole = sessionService.getCurrentRole();
    if (!currentRole) {
      return false;
    }

    const hasRole = Array.isArray(allowedRoles)
      ? allowedRoles.includes(currentRole)
      : allowedRoles === currentRole;

    if (!hasRole) {
      return false;
    }
  }

  return true;
};
