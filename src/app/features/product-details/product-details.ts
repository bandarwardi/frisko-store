import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SProduct } from '../../core/services/s-product';
import { Scart } from '../../core/services/scart';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IOptionValue, IProductOption, IVariant } from '../../core/models/iproduct';

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
  selectedOptionValues = signal<Record<number, number>>({});
  legacySelectedVariant = signal<IVariant | null>(null);

  hasStructuredOptions = computed(() => {
    const prod = this.product();
    return Array.isArray(prod?.options) && prod.options.length > 0 && Array.isArray(prod?.variants) && prod.variants.length > 0;
  });

  selectedVariant = computed<IVariant | null>(() => {
    const prod = this.product();
    if (!prod?.variants || prod.variants.length === 0) return null;

    if (!this.hasStructuredOptions()) {
      return this.legacySelectedVariant();
    }

    const selectedMap = this.selectedOptionValues();
    const selectedIds = Object.values(selectedMap);
    if (selectedIds.length === 0) return null;

    return (
      prod.variants.find((v: IVariant) => {
        const ids = v.option_value_ids || [];
        return selectedIds.every((id) => ids.includes(id));
      }) || null
    );
  });

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

    // Fallback to selected option value image (e.g. color swatch image)
    const prod = this.product();
    if (prod?.options) {
      const selectedMap = this.selectedOptionValues();
      for (const opt of prod.options as IProductOption[]) {
        const chosenId = selectedMap[opt.id];
        const val = opt.values?.find((item: IOptionValue) => item.id === chosenId);
        if (val?.image) return val.image;
      }
    }

    return prod?.primary_image || '';
  });

  displayStock = computed(() => {
    const v = this.selectedVariant();
    if (v) return Number(v.stock);
    if (this.hasStructuredOptions()) return 0;
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

          if (prod.options && prod.options.length > 0) {
            this.selectedOptionValues.set(this.buildSelectionMapForVariant(prod.options, firstInStock));
            this.legacySelectedVariant.set(null);
          } else {
            this.selectedOptionValues.set({});
            this.legacySelectedVariant.set(firstInStock);
          }
        } else {
          this.selectedOptionValues.set({});
          this.legacySelectedVariant.set(null);
        }
        this.isLoading.set(false);
      },
    });
  }

  private buildSelectionMapForVariant(options: IProductOption[], variant: IVariant): Record<number, number> {
    const map: Record<number, number> = {};
    const vIds = variant.option_value_ids || [];
    for (const opt of options) {
      const matchedVal = opt.values?.find((val) => vIds.includes(val.id)) || opt.values?.[0];
      if (matchedVal) {
        map[opt.id] = matchedVal.id;
      }
    }
    return map;
  }

  selectVariant(v: IVariant): void {
    this.legacySelectedVariant.set(v);
    this.quantity.set(1);
  }

  selectOptionValue(optionId: number, valueId: number): void {
    const prod = this.product();
    const options: IProductOption[] = prod?.options || [];
    const variants: IVariant[] = prod?.variants || [];

    const candidate = { ...this.selectedOptionValues(), [optionId]: valueId };
    const candidateIds = Object.values(candidate);
    const exactMatch = variants.find((v) => {
      const ids = v.option_value_ids || [];
      return candidateIds.every((id) => ids.includes(id));
    });

    if (exactMatch) {
      this.selectedOptionValues.set(candidate);
    } else {
      // Smart switch: pick first available (or first existing) variant containing the clicked value
      const fallbackVariant =
        variants.find((v) => (v.option_value_ids || []).includes(valueId) && Number(v.stock) > 0) ||
        variants.find((v) => (v.option_value_ids || []).includes(valueId));

      if (fallbackVariant) {
        this.selectedOptionValues.set(this.buildSelectionMapForVariant(options, fallbackVariant));
      } else {
        this.selectedOptionValues.set(candidate);
      }
    }
    this.quantity.set(1);
  }

  isOptionValueSelected(optionId: number, valueId: number): boolean {
    return this.selectedOptionValues()[optionId] === valueId;
  }

  getSelectedValueLabel(opt: IProductOption): string {
    const selectedId = this.selectedOptionValues()[opt.id];
    return opt.values?.find((v) => v.id === selectedId)?.value || '';
  }

  isOptionValueOutOfStock(optIndex: number, optionId: number, valueId: number): boolean {
    const variants: IVariant[] = this.product()?.variants || [];
    if (variants.length === 0) return true;

    // For primary axis (first option, usually Color), check if ANY variant with this value has stock
    if (optIndex === 0) {
      return !variants.some((v) => (v.option_value_ids || []).includes(valueId) && Number(v.stock) > 0);
    }

    // For secondary axes (e.g. Size), check stock combined with currently selected other options
    const otherIds = Object.entries(this.selectedOptionValues())
      .filter(([k]) => Number(k) !== optionId)
      .map(([, val]) => val);

    return !variants.some((v) => {
      const ids = v.option_value_ids || [];
      return ids.includes(valueId) && otherIds.every((id) => ids.includes(id)) && Number(v.stock) > 0;
    });
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
