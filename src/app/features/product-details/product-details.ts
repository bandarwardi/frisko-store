import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SProduct } from '../../core/services/s-product';
import { Scart } from '../../core/services/scart';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IVariant } from '../../core/models/iproduct';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  route = inject(ActivatedRoute);
  productService = inject(SProduct);
  private scart = inject(Scart);
  private toastrService = inject(ToastrService);
  private translate = inject(TranslateService);

  isLoading = signal<boolean>(true);
  product = signal<any>('');
  quantity = signal<number>(1);
  selectedVariant = signal<IVariant | null>(null);

  displayPrice = computed(() => {
    const v = this.selectedVariant();
    if (v && v.price) return v.price;
    return this.product()?.price || '0';
  });

  displayOldPrice = computed(() => {
    const v = this.selectedVariant();
    if (v && v.old_price) return v.old_price;
    return this.product()?.old_price || null;
  });

  displayImage = computed(() => {
    const v = this.selectedVariant();
    if (v && v.image) return v.image;
    return this.product()?.primary_image || '';
  });

  displayStock = computed(() => {
    const v = this.selectedVariant();
    if (v) return Number(v.stock);
    return Number(this.product()?.stock || 0);
  });

  isOutOfStock = computed(() => this.displayStock() <= 0);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.fetchProductDetails(id);
      }
    });
  }

  fetchProductDetails(id: string | number): void {
    this.isLoading.set(true);
    this.productService.getProductDetails(id).subscribe({
      next: (req) => {
        const prod = req.data.product;
        this.product.set(prod);
        if (prod.variants && prod.variants.length > 0) {
          const firstInStock = prod.variants.find((v: IVariant) => Number(v.stock) > 0) || prod.variants[0];
          this.selectedVariant.set(firstInStock);
        } else {
          this.selectedVariant.set(null);
        }
        this.isLoading.set(false);
      },
    });
  }

  selectVariant(v: IVariant): void {
    this.selectedVariant.set(v);
    this.quantity.set(1);
  }

  addToCart(id: number | string): void {
    const prod = this.product();
    if (!prod) return;

    if (this.isOutOfStock()) {
      this.toastrService.warning(this.translate.instant('PRODUCT_DETAILS.OUT_OF_STOCK'), 'Frisko');
      return;
    }

    const variant = this.selectedVariant();
    const qty = this.quantity();
    const body: any = { product_id: id, quantity: qty };
    if (variant) {
      body.variant_id = variant.id;
    }

    this.scart.addProductCart(body).subscribe({
      next: (req) => {
        const msg = this.translate.instant('PRODUCT_DETAILS.ADDED_SUCCESS') || 'Product added successfully to your cart';
        this.toastrService.success(msg, 'Frisko', {
          progressBar: true,
          closeButton: true,
        });

        let existingCart: any[] = [];
        try {
          existingCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        } catch {
          existingCart = [];
        }

        const variantId = variant ? variant.id : null;
        const cartId = `${prod.id}_${variantId || 'default'}`;
        const itemIndex = existingCart.findIndex(
          (item: any) => (item.cart_id === cartId) || (item.product_id === prod.id && (item.variant_id ?? null) === variantId)
        );

        const currentPrice = variant ? variant.price : prod.price;
        const currentImage = (variant && variant.image) ? variant.image : prod.primary_image;
        const currentStock = variant ? variant.stock : prod.stock;

        if (itemIndex > -1) {
          existingCart[itemIndex].quantity = (Number(existingCart[itemIndex].quantity) || 0) + qty;
          existingCart[itemIndex].price = currentPrice;
        } else {
          existingCart.push({
            cart_id: cartId,
            id: prod.id,
            product_id: prod.id,
            variant_id: variantId,
            variant_name: variant ? variant.name : null,
            title: prod.title,
            price: currentPrice,
            primary_image: currentImage,
            quantity: qty,
            stock: currentStock,
            product: prod
          });
        }

        localStorage.setItem('localCart', JSON.stringify(existingCart));
      },
    });
  }
}
