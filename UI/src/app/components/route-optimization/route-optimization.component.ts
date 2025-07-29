import { Component, type OnInit, ViewChild, type ElementRef } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, type FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { RouteOptimizationService } from "../../services/route-optimization.service"
import type { CarService } from "../../services/car.service"
import type { EmployeeService } from "../../services/employee.service"
import type { Car } from "../../models/car.model"
import type { Employee } from "../../models/employee.model"
import type { OptimizedRoute, RouteOptimizationRequest } from "../../models/route.model"

declare var google: any

@Component({
  selector: "app-route-optimization",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Route Optimization</h1>
          <p class="mt-2 text-gray-600">Optimize bus routes for maximum efficiency</p>
        </div>

        <!-- Configuration Form -->
        <div class="bg-white shadow rounded-lg p-6 mb-8">
          <h2 class="text-xl font-semibold mb-4">Route Configuration</h2>
          <form [formGroup]="optimizationForm" (ngSubmit)="optimizeRoutes()" class="space-y-6">
            
            <!-- Workplace Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Workplace Address
              </label>
              <input
                type="text"
                formControlName="workplaceAddress"
                placeholder="Enter workplace address"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div *ngIf="optimizationForm.get('workplaceAddress')?.invalid && optimizationForm.get('workplaceAddress')?.touched" 
                   class="text-red-500 text-sm mt-1">
                Workplace address is required
              </div>
            </div>

            <!-- Employee Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Employees ({{selectedEmployees.length}} selected)
              </label>
              <div class="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      (change)="toggleAllEmployees($event)"
                      [checked]="selectedEmployees.length === employees.length"
                      class="mr-2"
                    />
                    <span class="font-medium">Select All</span>
                  </label>
                  <hr class="my-2">
                  <div *ngFor="let employee of employees" class="flex items-center">
                    <input
                      type="checkbox"
                      [value]="employee.id"
                      (change)="toggleEmployee(employee.id, $event)"
                      [checked]="selectedEmployees.includes(employee.id)"
                      class="mr-2"
                    />
                    <span>{{employee.firstName}} {{employee.lastName}} - {{employee.dropOffPoint}}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Car Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Cars ({{selectedCars.length}} selected)
              </label>
              <div class="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      (change)="toggleAllCars($event)"
                      [checked]="selectedCars.length === cars.length"
                      class="mr-2"
                    />
                    <span class="font-medium">Select All</span>
                  </label>
                  <hr class="my-2">
                  <div *ngFor="let car of cars" class="flex items-center">
                    <input
                      type="checkbox"
                      [value]="car.id"
                      (change)="toggleCar(car.id, $event)"
                      [checked]="selectedCars.includes(car.id)"
                      class="mr-2"
                    />
                    <span>{{car.model}} ({{car.plateNumber}}) - Capacity: {{car.capacity}}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end space-x-4">
              <button
                type="button"
                (click)="clearOptimization()"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                type="submit"
                [disabled]="optimizationForm.invalid || isOptimizing || selectedEmployees.length === 0 || selectedCars.length === 0"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{isOptimizing ? 'Optimizing...' : 'Optimize Routes'}}
              </button>
            </div>
          </form>
        </div>

        <!-- Results -->
        <div *ngIf="optimizedRoutes.length > 0" class="space-y-8">
          
          <!-- Map Container -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-xl font-semibold mb-4">Route Visualization</h2>
            <div #mapContainer class="w-full h-96 rounded-lg border"></div>
          </div>

          <!-- Route Details -->
          <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div *ngFor="let route of optimizedRoutes" class="bg-white shadow rounded-lg p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{route.routeName}}</h3>
                  <p class="text-sm text-gray-600">{{route.carModel}}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">{{route.totalDistance | number:'1.1-1'}} km</p>
                  <p class="text-sm text-gray-500">{{route.totalDuration}} min</p>
                </div>
              </div>

              <!-- Main Route Stops -->
              <div class="mb-4">
                <h4 class="font-medium text-gray-900 mb-2">Recommended Route:</h4>
                <div class="space-y-2">
                  <div *ngFor="let stop of route.stops" class="flex items-center text-sm">
                    <span class="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                      {{stop.order}}
                    </span>
                    <div>
                      <p class="font-medium">{{stop.employeeName}}</p>
                      <p class="text-gray-500 text-xs">{{stop.address}}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Alternative Routes -->
              <div class="border-t pt-4">
                <h4 class="font-medium text-gray-900 mb-2">Alternative Routes:</h4>
                <div class="space-y-2">
                  <div *ngFor="let alt of route.alternativeRoutes" 
                       class="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                       (click)="selectAlternativeRoute(route, alt)">
                    <div class="flex justify-between items-center">
                      <span class="text-sm font-medium">Option {{alt.optionNumber}}</span>
                      <div class="text-xs text-gray-500">
                        {{alt.totalDistance | number:'1.1-1'}} km • {{alt.totalDuration}} min
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Save Routes -->
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Save Route Assignments</h3>
                <p class="text-sm text-gray-600">Save the current route optimization for future use</p>
              </div>
              <button
                (click)="saveRoutes()"
                [disabled]="isSaving"
                class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {{isSaving ? 'Saving...' : 'Save Routes'}}
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isOptimizing" class="bg-white shadow rounded-lg p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Optimizing routes...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error</h3>
              <p class="text-sm text-red-700 mt-1">{{errorMessage}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RouteOptimizationComponent implements OnInit {
  @ViewChild("mapContainer", { static: false }) mapContainer!: ElementRef

  optimizationForm: FormGroup
  employees: Employee[] = []
  cars: Car[] = []
  selectedEmployees: number[] = []
  selectedCars: number[] = []
  optimizedRoutes: OptimizedRoute[] = []

  isOptimizing = false
  isSaving = false
  errorMessage = ""

  map: any
  directionsService: any
  directionsRenderers: any[] = []

  constructor(
    private fb: FormBuilder,
    private routeOptimizationService: RouteOptimizationService,
    private carService: CarService,
    private employeeService: EmployeeService,
  ) {
    this.optimizationForm = this.fb.group({
      workplaceAddress: ["", Validators.required],
    })
  }

  ngOnInit() {
    this.loadEmployees()
    this.loadCars()
    this.initializeGoogleMaps()
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees.filter((e) => e.isActive)
      },
      error: (error) => {
        console.error("Error loading employees:", error)
        this.errorMessage = "Failed to load employees"
      },
    })
  }

  loadCars() {
    this.carService.getCars().subscribe({
      next: (cars) => {
        this.cars = cars.filter((c) => c.isActive)
      },
      error: (error) => {
        console.error("Error loading cars:", error)
        this.errorMessage = "Failed to load cars"
      },
    })
  }

  initializeGoogleMaps() {
    // Initialize Google Maps services
    this.directionsService = new google.maps.DirectionsService()
  }

  toggleEmployee(employeeId: number, event: any) {
    if (event.target.checked) {
      this.selectedEmployees.push(employeeId)
    } else {
      this.selectedEmployees = this.selectedEmployees.filter((id) => id !== employeeId)
    }
  }

  toggleAllEmployees(event: any) {
    if (event.target.checked) {
      this.selectedEmployees = this.employees.map((e) => e.id)
    } else {
      this.selectedEmployees = []
    }
  }

  toggleCar(carId: number, event: any) {
    if (event.target.checked) {
      this.selectedCars.push(carId)
    } else {
      this.selectedCars = this.selectedCars.filter((id) => id !== carId)
    }
  }

  toggleAllCars(event: any) {
    if (event.target.checked) {
      this.selectedCars = this.cars.map((c) => c.id)
    } else {
      this.selectedCars = []
    }
  }

  async optimizeRoutes() {
    if (this.optimizationForm.invalid || this.selectedEmployees.length === 0 || this.selectedCars.length === 0) {
      return
    }

    this.isOptimizing = true
    this.errorMessage = ""

    try {
      // Geocode workplace address
      const workplaceCoords = await this.routeOptimizationService.geocodeAddress(
        this.optimizationForm.value.workplaceAddress,
      )

      const request: RouteOptimizationRequest = {
        workplaceAddress: this.optimizationForm.value.workplaceAddress,
        workplaceLatitude: workplaceCoords.lat,
        workplaceLongitude: workplaceCoords.lng,
        employeeIds: this.selectedEmployees,
        carIds: this.selectedCars,
      }

      this.routeOptimizationService.optimizeRoutes(request).subscribe({
        next: (routes) => {
          this.optimizedRoutes = routes
          this.displayRoutesOnMap(workplaceCoords)
          this.isOptimizing = false
        },
        error: (error) => {
          console.error("Error optimizing routes:", error)
          this.errorMessage = "Failed to optimize routes. Please try again."
          this.isOptimizing = false
        },
      })
    } catch (error) {
      console.error("Error geocoding workplace address:", error)
      this.errorMessage = "Invalid workplace address. Please check and try again."
      this.isOptimizing = false
    }
  }

  displayRoutesOnMap(workplaceCoords: { lat: number; lng: number }) {
    // Initialize map
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      zoom: 12,
      center: workplaceCoords,
    })

    // Clear existing renderers
    this.directionsRenderers.forEach((renderer) => renderer.setMap(null))
    this.directionsRenderers = []

    // Add workplace marker
    new google.maps.Marker({
      position: workplaceCoords,
      map: this.map,
      title: "Workplace",
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
      },
    })

    // Colors for different routes
    const colors = ["#FF0000", "#0000FF", "#00FF00", "#FF00FF", "#00FFFF", "#FFFF00"]

    // Display each route
    this.optimizedRoutes.forEach((route, index) => {
      const renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: colors[index % colors.length],
          strokeWeight: 4,
        },
      })

      renderer.setMap(this.map)
      this.directionsRenderers.push(renderer)

      // Create waypoints
      const waypoints = route.stops.map((stop) => ({
        location: new google.maps.LatLng(stop.latitude, stop.longitude),
        stopover: true,
      }))

      // Calculate and display route
      this.directionsService.route(
        {
          origin: workplaceCoords,
          destination: workplaceCoords, // Return to workplace
          waypoints: waypoints,
          optimizeWaypoints: false, // We've already optimized
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === "OK") {
            renderer.setDirections(result)
          }
        },
      )
    })
  }

  selectAlternativeRoute(route: OptimizedRoute, alternative: any) {
    // Update the main route with the selected alternative
    route.stops = alternative.stops
    route.totalDistance = alternative.totalDistance
    route.totalDuration = alternative.totalDuration

    // Refresh map display
    const workplaceCoords = {
      lat: 0, // You might want to store this from the optimization
      lng: 0,
    }
    this.displayRoutesOnMap(workplaceCoords)
  }

  saveRoutes() {
    this.isSaving = true
    this.errorMessage = ""

    this.routeOptimizationService.saveRouteAssignments(this.optimizedRoutes).subscribe({
      next: () => {
        this.isSaving = false
        alert("Routes saved successfully!")
      },
      error: (error) => {
        console.error("Error saving routes:", error)
        this.errorMessage = "Failed to save routes. Please try again."
        this.isSaving = false
      },
    })
  }

  clearOptimization() {
    this.optimizedRoutes = []
    this.selectedEmployees = []
    this.selectedCars = []
    this.optimizationForm.reset()
    this.errorMessage = ""

    // Clear map
    if (this.map) {
      this.directionsRenderers.forEach((renderer) => renderer.setMap(null))
      this.directionsRenderers = []
    }
  }
}
