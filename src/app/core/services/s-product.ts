import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SProduct {
  private readonly http = inject(HttpClient);

  getProduct(filters?: any): Observable<any> {
    let params = new HttpParams();

    //params
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key]);
        }
      });
    }

    // params with GET request
    return this.http.get(environment.baseUrl + `/api/v1/products`, { params });
  }

  getProductDetails(id: string | number): Observable<any> {
    return this.http.get(environment.baseUrl + `/api/v1/products/${id}`);
  }

  getFilters(): Observable<any> {
    return this.http.get(environment.baseUrl + `/api/v1/products/filters`);
  }
}
