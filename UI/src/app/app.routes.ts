import type { Routes } from "@angular/router"

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/cars",
    pathMatch: "full",
  },
  {
    path: "cars",
    loadComponent: () => import("./components/cars/cars.component").then((m) => m.CarsComponent),
  },
  {
    path: "employees",
    loadComponent: () => import("./components/employees/employees.component").then((m) => m.EmployeesComponent),
  },
  {
    path: "route-optimization",
    loadComponent: () =>
      import("./components/route-optimization/route-optimization.component").then((m) => m.RouteOptimizationComponent),
  },
  {
    path: "**",
    redirectTo: "/cars",
  },
]
