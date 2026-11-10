import { Component, inject, OnInit, signal } from '@angular/core';
import { Slider } from '../../../shared/components/slider/slider';
import { Router, RouterLink } from '@angular/router';
import { Shome } from '../../../core/services/shome';
import { Icategories } from '../../../core/models/icategories';
import { IlatestProducts } from '../../../core/models/ilatest-products';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [Slider, RouterLink, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  ngOnInit(): void {
    this.loadHomeData();
  }
  private shome = inject(Shome);
  private route = inject(Router);

  categories = signal<Icategories[]>([]);
  latestProducts = signal<IlatestProducts[]>([]);
  banners = signal<any>('');
  loadHomeData(): void {
    this.shome.getHome().subscribe({
      next: (res) => {
        const homeData = res.data;

        this.categories.set(homeData.categories);
        this.latestProducts.set(homeData.latest_products);
        this.banners.set(homeData.banners.home_middle[0]);
      },
    });
  }

  openProductDetails(id: string | number): void {
    this.route.navigate(['/productDetails', id]);
  }

  isNewProduct(created_at: string): boolean {
    const productDate = new Date(created_at).getTime();
    const currentDate = new Date().getTime();
    const diffDays = (currentDate - productDate) / (1000 * 3600 * 24);
    return diffDays <= 14;
  }
}
