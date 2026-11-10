import { Component } from '@angular/core';
import { Product } from '../product/product';
import { ProductFilterComponent } from '../product-filter/product-filter.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-shop',
  imports: [Product, ProductFilterComponent, TranslatePipe],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop {}
