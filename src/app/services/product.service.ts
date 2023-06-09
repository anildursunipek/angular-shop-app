import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, delay, exhaustMap, map, Observable, take, tap, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { Product } from "../models/product.model";
import { AuthService } from "./auth.service";

// Local Service
@Injectable()
export class ProductService{
  private url = environment.url;
  constructor(
    private http: HttpClient,
    private authService: AuthService){}

  getProducts(categoryId: number): Observable<Product[]>{
    return this.http
      .get<Product[]>(this.url + "products.json")
      .pipe(
        map(data=>{
          const products: Product[] = [];

          for(const key in data){
            if(categoryId){
              if(categoryId == data[key].categoryId){
                products.push({...data[key], id:key});
              }
            }else{
              products.push({...data[key], id:key});
            }
          }
          return products
        }),
        delay(600)
      )
  }

  getProductById(id: string): Observable<Product>{
    return this.http.get<Product>(this.url + "products/" + id + ".json" ).pipe(delay(600));
  }

  createProduct(product: Product): Observable<Product>{
    return this.authService.user.pipe(
      take(1),
      tap(user => console.log(user)),
      exhaustMap(user =>{
        return this.http.post<Product>(this.url + "products.json?auth=" + user?.token, product);
      }),
      catchError(this.handleError)
    )
  }

  handleError(err : HttpErrorResponse){
    let message = "";
    if(err.error.error){
      switch(err.error.error){
        case "Permission denied":
          message = "Permission denied";
          break;
      }
    }
    return throwError(() => message)
  }
}
