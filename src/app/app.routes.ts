import { RenderMode } from '@angular/ssr';
import { Routes } from '@angular/router';
import { ProductDetails } from './features/product-details/product-details';
import { Cart } from './features/cart/cart/cart';
import { Login } from './features/auth/login/login';
import { Shop } from './features/shop/shop/shop';
import { Register } from './features/auth/register/register';
import { Home } from './features/home/home/home';
import { authGuard } from './core/guards/auth-guard';
import { Checkout } from './features/checkout/checkout/checkout';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'shop', component: Shop },
  // { path: 'shop/:category', component: Shop },
  { path: 'productDetails/:id', component: ProductDetails },
  { path: 'cart', component: Cart },
  { path: 'checkout/:id', component: Checkout, canActivate: [authGuard] },
  { path: 'auth/login', component: Login },
  { path: 'auth/register', component: Register },
  { path: '**', redirectTo: 'home' },
];
