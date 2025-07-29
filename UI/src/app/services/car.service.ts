import { Injectable } from "@angular/core"
import type { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import { environment } from "../../environments/environment"
import type { Car } from "../models/car.model"

@Injectable({
  providedIn: "root",
})
export class CarService {
  private apiUrl = `${environment.apiUrl}/api/cars`

  constructor(private http: HttpClient) {}

  getCars(): Observable<Car[]> {
    return this.http.get<Car[]>(this.apiUrl)
  }

  getCar(id: number): Observable<Car> {
    return this.http.get<Car>(`${this.apiUrl}/${id}`)
  }

  createCar(car: Car): Observable<Car> {
    return this.http.post<Car>(this.apiUrl, car)
  }

  updateCar(car: Car): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${car.id}`, car)
  }

  deleteCar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}
