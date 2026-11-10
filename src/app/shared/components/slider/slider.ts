import { Component, effect, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Shome } from '../../../core/services/shome';
import { Islids } from '../../../core/models/islids';
import { initFlowbite } from 'flowbite';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-slider',
  imports: [],
  templateUrl: './slider.html',
  styleUrl: './slider.css',
})
export class Slider implements OnInit {
  ngOnInit(): void {
    this.loadSlids();
    if (isPlatformBrowser(PLATFORM_ID)) {
      initFlowbite();
    }
  }
  private shome = inject(Shome);
  heroSlids = signal<Islids[]>([]);

  private pLATFORM_ID = inject(PLATFORM_ID);
  constructor() {
    effect(() => {
      const slides = this.heroSlids();
      if (slides.length > 0) {
        if (isPlatformBrowser(this.pLATFORM_ID)) {
          setTimeout(() => {
            initFlowbite();
          }, 200);
        }
      }
    });
  }

  loadSlids(): void {
    this.shome.getHome().subscribe({
      next: (res) => {
        const homeData = res.data.hero_slides;
        this.heroSlids.set(homeData);

        // console.log(this.heroSlids());
      },
      error: (err) => {},
    });
  }
}
