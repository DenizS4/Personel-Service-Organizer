export interface RouteOptimizationRequest {
  workplaceAddress: string
  workplaceLatitude: number
  workplaceLongitude: number
  employeeIds: number[]
  carIds: number[]
}

export interface OptimizedRoute {
  carId: number
  carModel: string
  routeName: string
  stops: RouteStop[]
  totalDistance: number
  totalDuration: number
  alternativeRoutes: RouteOption[]
}

export interface RouteStop {
  employeeId: number
  employeeName: string
  address: string
  latitude: number
  longitude: number
  order: number
}

export interface RouteOption {
  optionNumber: number
  stops: RouteStop[]
  totalDistance: number
  totalDuration: number
}
