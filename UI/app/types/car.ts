export interface Car {
  id: number
  model: string
  plateNumber: string
  capacity: number
  color: string
  year: number
  notes: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCarRequest {
  model: string
  plateNumber: string
  capacity: number
  color: string
  year: number
  notes: string
}
