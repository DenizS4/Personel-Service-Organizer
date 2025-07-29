import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, type FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { CarService } from "../../services/car.service"
import type { Car } from "../../models/car.model"

@Component({
  selector: "app-cars",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Car Management</h1>
          <p class="mt-2 text-gray-600">Manage your fleet of vehicles</p>
        </div>

        <!-- Add/Edit Car Form -->
        <div class="bg-white shadow rounded-lg p-6 mb-8">
          <h2 class="text-xl font-semibold mb-4">{{editingCar ? 'Edit Car' : 'Add New Car'}}</h2>
          <form [formGroup]="carForm" (ngSubmit)="saveCar()" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Model</label>
              <input type="text" formControlName="model" class="form-input" placeholder="Enter car model">
              <div *ngIf="carForm.get('model')?.invalid && carForm.get('model')?.touched" class="text-red-500 text-sm mt-1">
                Model is required
              </div>
            </div>

            <div>
              <label class="form-label">Plate Number</label>
              <input type="text" formControlName="plateNumber" class="form-input" placeholder="Enter plate number">
              <div *ngIf="carForm.get('plateNumber')?.invalid && carForm.get('plateNumber')?.touched" class="text-red-500 text-sm mt-1">
                Plate number is required
              </div>
            </div>

            <div>
              <label class="form-label">Capacity</label>
              <input type="number" formControlName="capacity" class="form-input" placeholder="Enter capacity" min="1" max="100">
              <div *ngIf="carForm.get('capacity')?.invalid && carForm.get('capacity')?.touched" class="text-red-500 text-sm mt-1">
                Capacity must be between 1 and 100
              </div>
            </div>

            <div>
              <label class="form-label">Color</label>
              <input type="text" formControlName="color" class="form-input" placeholder="Enter color">
            </div>

            <div>
              <label class="form-label">Year</label>
              <input type="number" formControlName="year" class="form-input" placeholder="Enter year" min="1990" max="2030">
            </div>

            <div class="md:col-span-2">
              <label class="form-label">Notes</label>
              <textarea formControlName="notes" class="form-input" rows="3" placeholder="Enter any additional notes"></textarea>
            </div>

            <div class="md:col-span-2 flex justify-end space-x-4">
              <button type="button" (click)="cancelEdit()" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" [disabled]="carForm.invalid || isLoading" class="btn-primary ">
                {{isLoading ? 'Saving...' : (editingCar ? 'Update Car' : 'Add Car')}}
              </button>
            </div>
          </form>
        </div>

        <!-- Cars List -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Cars ({{cars.length}})</h2>
          </div>

          <div *ngIf="isLoading && cars.length === 0" class="p-8 text-center">
            <div class="loading-spinner mx-auto mb-4"></div>
            <p class="text-gray-600">Loading cars...</p>
          </div>

          <div *ngIf="!isLoading && cars.length === 0" class="p-8 text-center">
            <p class="text-gray-600">No cars found. Add your first car above.</p>
          </div>

          <div *ngIf="cars.length > 0" class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Plate Number</th>
                  <th>Capacity</th>
                  <th>Color</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr *ngFor="let car of cars" class="hover:bg-gray-50">
                  <td class="font-medium">{{car.model}}</td>
                  <td>{{car.plateNumber}}</td>
                  <td>{{car.capacity}} people</td>
                  <td>
                    <span class="inline-flex items-center">
                      <span class="w-3 h-3 rounded-full mr-2" [style.background-color]="car.color.toLowerCase()"></span>
                      {{car.color}}
                    </span>
                  </td>
                  <td>{{car.year}}</td>
                  <td>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          [class]="car.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{car.isActive ? 'Active' : 'Inactive'}}
                    </span>
                  </td>
                  <td>
                    <div class="flex space-x-2">
                      <button (click)="editCar(car)" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Edit
                      </button>
                      <button (click)="deleteCar(car.id)" class="text-red-600 hover:text-red-800 text-sm font-medium">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="alert alert-error mt-6">
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
export class CarsComponent implements OnInit {
  cars: Car[] = []
  carForm: FormGroup
  editingCar: Car | null = null
  isLoading = false
  errorMessage = ""

  constructor(
    private carService: CarService,
    private fb: FormBuilder,
  ) {
    this.carForm = this.fb.group({
      model: ["", Validators.required],
      plateNumber: ["", Validators.required],
      capacity: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      color: [""],
      year: [new Date().getFullYear(), [Validators.min(1990), Validators.max(2030)]],
      notes: [""],
    })
  }

  ngOnInit() {
    this.loadCars()
  }

  loadCars() {
    this.isLoading = true
    this.errorMessage = ""

    this.carService.getCars().subscribe({
      next: (cars) => {
        this.cars = cars
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error loading cars:", error)
        this.errorMessage = "Failed to load cars. Please check your connection and try again."
        this.isLoading = false
      },
    })
  }

  saveCar() {
    if (this.carForm.invalid) return

    this.isLoading = true
    this.errorMessage = ""

    const carData = this.carForm.value

    if (this.editingCar) {
      // Update existing car
      const updatedCar = { ...this.editingCar, ...carData }
      this.carService.updateCar(updatedCar).subscribe({
        next: () => {
          this.loadCars()
          this.cancelEdit()
          this.isLoading = false
        },
        error: (error) => {
          console.error("Error updating car:", error)
          this.errorMessage = "Failed to update car. Please try again."
          this.isLoading = false
        },
      })
    } else {
      // Create new car
      this.carService.createCar(carData).subscribe({
        next: () => {
          this.loadCars()
          this.carForm.reset()
          this.isLoading = false
        },
        error: (error) => {
          console.error("Error creating car:", error)
          this.errorMessage = "Failed to create car. Please try again."
          this.isLoading = false
        },
      })
    }
  }

  editCar(car: Car) {
    this.editingCar = car
    this.carForm.patchValue({
      model: car.model,
      plateNumber: car.plateNumber,
      capacity: car.capacity,
      color: car.color,
      year: car.year,
      notes: car.notes,
    })
  }

  cancelEdit() {
    this.editingCar = null
    this.carForm.reset()
    this.errorMessage = ""
  }

  deleteCar(id: number) {
    if (!confirm("Are you sure you want to delete this car?")) return

    this.carService.deleteCar(id).subscribe({
      next: () => {
        this.loadCars()
      },
      error: (error) => {
        console.error("Error deleting car:", error)
        this.errorMessage = "Failed to delete car. Please try again."
      },
    })
  }
}
