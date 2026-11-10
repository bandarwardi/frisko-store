import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SProduct } from '../../../core/services/s-product';
import { IProductFiltersData } from '../../../core/models/iproduct';

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './product-filter.component.html',
  styleUrl: './product-filter.component.css',
})
export class ProductFilterComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(SProduct);
  private platformId = inject(PLATFORM_ID);

  // Filter aggregations from server
  filtersData = signal<IProductFiltersData | null>(null);
  isLoadingFilters = signal<boolean>(true);

  // Mobile Drawer State
  isMobileDrawerOpen = signal<boolean>(false);

  // Active filter states
  selectedCategory = signal<string | null>(null);
  selectedBrand = signal<string | null>(null);
  selectedVariants = signal<string[]>([]);
  minPriceInput = signal<number | null>(null);
  maxPriceInput = signal<number | null>(null);
  inStockOnly = signal<boolean>(false);
  currentSort = signal<string>('latest');
  searchKeyword = signal<string | null>(null);

  // Active filter count for badge
  activeFilterCount = computed(() => {
    let count = 0;
    if (this.selectedCategory()) count++;
    if (this.selectedBrand()) count++;
    if (this.selectedVariants().length > 0) count += this.selectedVariants().length;
    if (this.minPriceInput() !== null || this.maxPriceInput() !== null) count++;
    if (this.inStockOnly()) count++;
    return count;
  });

  // Active chips for quick removal
  activeChips = computed(() => {
    const chips: { type: string; label: string; value: string }[] = [];

    const catSlug = this.selectedCategory();
    if (catSlug && this.filtersData()) {
      const cat = this.filtersData()?.categories.find(
        (c) => c.slug === catSlug || c.id.toString() === catSlug
      );
      chips.push({
        type: 'category',
        label: cat ? cat.name : catSlug,
        value: catSlug,
      });
    }

    const brandSlug = this.selectedBrand();
    if (brandSlug && this.filtersData()) {
      const b = this.filtersData()?.brands.find(
        (item) => item.slug === brandSlug || item.id.toString() === brandSlug
      );
      chips.push({
        type: 'brand',
        label: b ? b.name : brandSlug,
        value: brandSlug,
      });
    }

    for (const v of this.selectedVariants()) {
      chips.push({
        type: 'variant',
        label: v,
        value: v,
      });
    }

    if (this.minPriceInput() !== null || this.maxPriceInput() !== null) {
      const min = this.minPriceInput() ?? 0;
      const max = this.maxPriceInput() ? `${this.maxPriceInput()} TL` : '...';
      chips.push({
        type: 'price',
        label: `${min} - ${max}`,
        value: 'price',
      });
    }

    if (this.inStockOnly()) {
      chips.push({
        type: 'stock',
        label: 'In Stock',
        value: 'stock',
      });
    }

    return chips;
  });

  ngOnInit(): void {
    this.loadAvailableFilters();

    // Listen to query parameters
    this.route.queryParams.subscribe((params) => {
      this.selectedCategory.set(params['category'] || null);
      this.selectedBrand.set(params['brand'] || null);

      if (params['variants']) {
        const raw = params['variants'];
        const list = Array.isArray(raw) ? raw : raw.split(',').map((s: string) => s.trim());
        this.selectedVariants.set(list.filter((x: string) => !!x));
      } else {
        this.selectedVariants.set([]);
      }

      this.minPriceInput.set(params['min_price'] ? Number(params['min_price']) : null);
      this.maxPriceInput.set(params['max_price'] ? Number(params['max_price']) : null);
      this.inStockOnly.set(params['in_stock'] === 'true' || params['in_stock'] === '1');
      this.currentSort.set(params['sort'] || 'latest');
      this.searchKeyword.set(params['search'] || null);
    });
  }

  loadAvailableFilters(): void {
    this.isLoadingFilters.set(true);
    this.productService.getFilters().subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          this.filtersData.set(res.data);
        }
        this.isLoadingFilters.set(false);
      },
      error: () => {
        this.isLoadingFilters.set(false);
      },
    });
  }

  // Navigation / Query Params Update
  private updateQueryParams(newParams: Record<string, any>): void {
    const queryParams: Record<string, any> = { ...this.route.snapshot.queryParams, ...newParams };

    // Clean null/empty keys
    Object.keys(queryParams).forEach((k) => {
      if (queryParams[k] === null || queryParams[k] === undefined || queryParams[k] === '') {
        delete queryParams[k];
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: '', // replace with cleaned set
    });
  }

  // Category Toggle
  onSelectCategory(slugOrId: string | number | null): void {
    const val = slugOrId ? slugOrId.toString() : null;
    const current = this.selectedCategory();
    this.updateQueryParams({ category: current === val ? null : val });
  }

  // Brand Toggle
  onSelectBrand(slugOrId: string | number | null): void {
    const val = slugOrId ? slugOrId.toString() : null;
    const current = this.selectedBrand();
    this.updateQueryParams({ brand: current === val ? null : val });
  }

  // Variant (Size, Color, Volume, Other) Toggle
  toggleVariant(name: string): void {
    const current = [...this.selectedVariants()];
    const index = current.findIndex((item) => item.toLowerCase() === name.toLowerCase());

    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(name);
    }

    this.updateQueryParams({
      variants: current.length > 0 ? current.join(',') : null,
    });
  }

  isVariantSelected(name: string): boolean {
    return this.selectedVariants().some((v) => v.toLowerCase() === name.toLowerCase());
  }

  // Price Filter Apply
  applyPriceFilter(): void {
    this.updateQueryParams({
      min_price: this.minPriceInput() !== null ? this.minPriceInput() : null,
      max_price: this.maxPriceInput() !== null ? this.maxPriceInput() : null,
    });
  }

  // Quick Price Presets
  setPricePreset(min: number | null, max: number | null): void {
    this.minPriceInput.set(min);
    this.maxPriceInput.set(max);
    this.applyPriceFilter();
  }

  // In Stock Toggle
  toggleInStock(): void {
    const nextVal = !this.inStockOnly();
    this.inStockOnly.set(nextVal);
    this.updateQueryParams({ in_stock: nextVal ? 'true' : null });
  }

  // Sort Change
  onSortChange(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    this.currentSort.set(val);
    this.updateQueryParams({ sort: val });
  }

  // Clear Single Chip
  removeChip(chip: { type: string; value: string }): void {
    if (chip.type === 'category') {
      this.updateQueryParams({ category: null });
    } else if (chip.type === 'brand') {
      this.updateQueryParams({ brand: null });
    } else if (chip.type === 'variant') {
      this.toggleVariant(chip.value);
    } else if (chip.type === 'price') {
      this.minPriceInput.set(null);
      this.maxPriceInput.set(null);
      this.updateQueryParams({ min_price: null, max_price: null });
    } else if (chip.type === 'stock') {
      this.inStockOnly.set(false);
      this.updateQueryParams({ in_stock: null });
    }
  }

  // Clear All
  clearAll(): void {
    this.selectedCategory.set(null);
    this.selectedBrand.set(null);
    this.selectedVariants.set([]);
    this.minPriceInput.set(null);
    this.maxPriceInput.set(null);
    this.inStockOnly.set(false);

    // Keep search if present
    const search = this.searchKeyword();
    this.updateQueryParams({
      category: null,
      brand: null,
      variants: null,
      min_price: null,
      max_price: null,
      in_stock: null,
      sort: null,
      search: search || null,
    });
  }

  // Mobile Drawer
  openMobileDrawer(): void {
    this.isMobileDrawerOpen.set(true);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }
}

