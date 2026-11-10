import { Component, inject, Inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { initFlowbite } from 'flowbite';
import { isPlatformBrowser } from '@angular/common';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { MyTranslateService } from './core/services/my-translate-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, NgxSpinnerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Frisko-store');
  private translate = inject(TranslateService);
  private myTranslateService = inject(MyTranslateService);
  private pLATFORM_ID = inject(PLATFORM_ID);
  constructor() {
    // call addLangs() to register additional languages the user can switch to.
    this.translate.addLangs(['tr', 'en', 'ar']);
    if (isPlatformBrowser(this.pLATFORM_ID)) {
      const activeLang = localStorage.getItem('lang') || 'tr';
      this.translate.use(activeLang);
      this.myTranslateService.chengeDirection();
      initFlowbite();
    }
  }
}
