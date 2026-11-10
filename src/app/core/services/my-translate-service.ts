import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class MyTranslateService {
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);

  chengeDirection(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const lang = localStorage.getItem('lang');
    if (lang === 'tr') {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'tr');
    } else if (lang === 'en') {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
    } else if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    }
  }

  changeLang(lang: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const prev = localStorage.getItem('lang');
      localStorage.setItem('lang', lang);
      this.translate.use(lang);
      this.chengeDirection();
      if (prev && prev !== lang) {
        window.location.reload();
      }
    } else {
      this.translate.use(lang);
    }
  }
}
