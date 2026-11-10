import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { MyTranslateService } from '../../../core/services/my-translate-service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'btnLang',
  imports: [],
  templateUrl: './btn-lang.html',
  styleUrl: './btn-lang.css',
})
export class BtnLang implements OnInit {
  currentLang = signal<string>('tr');
  private readonly pLATFORM_ID = inject(PLATFORM_ID);
  ngOnInit(): void {
    if (isPlatformBrowser(this.pLATFORM_ID) && localStorage.getItem('lang')) {
      this.currentLang.set(localStorage.getItem('lang')!);
    }
  }
  private readonly myTranslateService = inject(MyTranslateService);
  change(lang: string): void {
    console.log(lang);
    this.myTranslateService.changeLang(lang);
  }
}
