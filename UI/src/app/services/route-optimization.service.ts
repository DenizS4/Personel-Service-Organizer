import { Injectable } from "@angular/core"
import type { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import { environment } from "../../environments/environment"
import type { RouteOptimizationRequest, OptimizedRoute, RouteAssignment } from "../models/route.model"
import { google } from "@types/googlemaps" // Import google to declare the variable

@Injectable({
  providedIn: "root",
})
export class RouteOptimizationService {
  private apiUrl = `${environment.apiUrl}/api/routeoptimization`

  constructor(private http: HttpClient) {}

  optimizeRoutes(request: RouteOptimizationRequest): Observable<OptimizedRoute[]> {
    return this.http.post<OptimizedRoute[]>(`${this.apiUrl}/optimize`, request)
  }

  saveRouteAssignments(routes: OptimizedRoute[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/save-assignments`, routes)
  }

  getRouteAssignments(): Observable<RouteAssignment[]> {
    return this.http.get<RouteAssignment[]>(`${this.apiUrl}/assignments`)
  }

  // Geocoding service to convert addresses to coordinates
  geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          })
        } else {
          reject(new Error(`Geocoding failed: ${status}`))
        }
      })
    })
  }
}
