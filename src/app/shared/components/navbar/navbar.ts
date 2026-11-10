import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { RouterLinkActive, RouterLinkWithHref, Router, NavigationEnd } from '@angular/router';
import { Sauth } from '../../../features/auth/services/sauth';
import { isPlatformBrowser, NgClass } from '@angular/common';
import { SProduct } from '../../../core/services/s-product';
import { filter } from 'rxjs';
import { CategoriesService } from '../../../core/services/categories-service';
import { Icategories } from '../../../core/models/icategories';
import { TranslatePipe } from '@ngx-translate/core';
import { BtnLang } from '../btn-lang/btn-lang';

@Component({
  selector: 'app-navbar',
  imports: [RouterLinkActive, RouterLinkWithHref, NgClass, TranslatePipe, BtnLang],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private router = inject(Router);
  private sauth = inject(Sauth);
  private categoriesService = inject(CategoriesService);
  private product = inject(SProduct);

  navLinks = signal<Icategories[]>([]);
  topCategories = computed(() => this.navLinks().slice(0, 2));
  isMenuOpen = signal<boolean>(false);
  expandedMobileCategory = signal<string | null>(null); // لتحديد القسم الفرعي المفتوح في الموبايل

  private readonly pLATFORM_ID = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.pLATFORM_ID)) {
      if (localStorage.getItem('freshToken')) {
        this.sauth.isLogged.set(true);
      }
    }
    this.getToCategories('');
  }

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.closeMenu();
    });
  }

  toggleMenu() {
    this.isMenuOpen.update((val) => !val);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
    this.expandedMobileCategory.set(null);
  }

  toggleMobileCategory(slug: string) {
    this.expandedMobileCategory.update((current) => (current === slug ? null : slug));
  }

  getToCategories(slug: string): void {
    this.categoriesService.getCategories(slug).subscribe({
      next: (res) => {
        this.navLinks.set(res.data);
      },
    });
  }

  logged = computed(() => this.sauth.isLogged());

  logout(): void {
    this.sauth.singout();
    this.closeMenu();
  }

  onSearch(keyword: string) {
    this.closeMenu();
    if (!keyword || !keyword.trim()) return;

    this.router.navigate(['/shop'], {
      queryParams: { search: keyword.trim() },
    });
  }
}
