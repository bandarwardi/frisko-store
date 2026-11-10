import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Scart } from '../../../core/services/scart';
import { Iproduct } from '../../../core/models/iproduct';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { SProduct } from '../../../core/services/s-product';
import { isPlatformBrowser } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-product',
  imports: [TranslatePipe],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private route = inject(Router);
  private product = inject(SProduct);
  private scart = inject(Scart);
  private pLATFORM_ID = inject(PLATFORM_ID);
  private toastrService = inject(ToastrService);
  isLoading = signal<boolean>(false);
  productList = signal<Iproduct[]>([]);

  ngOnInit(): void {
    this.getProduct();
  }

  getProduct(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.isLoading.set(true);
      this.product.getProduct(params).subscribe({
        next: (res) => {
          let data = res.data?.data || [];
          this.productList.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
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
