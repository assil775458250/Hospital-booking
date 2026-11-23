import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthSessionService } from '../auth/auth-session.service';
import { API_BASE_URL } from '../config/api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Dep
  const sessionService = inject(AuthSessionService);

  // يجلب التوكن من الذاكرة
  const token = sessionService.getToken();

  if (token && req.url.startsWith(API_BASE_URL)) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  }

  return next(req);
};
