import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const pLATFORM_ID = inject(PLATFORM_ID);

  let lang = 'tr';
  if (isPlatformBrowser(pLATFORM_ID)) {
    try {
      lang = localStorage.getItem('lang') || 'tr';
    } catch {
      lang = 'tr';
    }
  }

  const headers: Record<string, string> = {
    'Accept-Language': lang,
  };

  if (isPlatformBrowser(pLATFORM_ID)) {
    const token = localStorage.getItem('freshToken');
    if (token) {
      headers['token'] = token;
    }
  }

  // Attach locale parameter only to API calls (not to static files like .json, .svg, etc.)
  if (req.url.includes('/api/')) {
    req = req.clone({
      setHeaders: headers,
      setParams: {
        locale: lang,
      },
    });
  } else {
    req = req.clone({
      setHeaders: headers,
    });
  }

  return next(req);
};
