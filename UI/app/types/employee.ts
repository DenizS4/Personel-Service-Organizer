export interface Employee {
  id: number
  firstName: string
  lastName: string
  title: string
  email: string
  phoneNumber: string
  homeAddress: string
  dropOffPoint: string
  dropOffLatitude: number
  dropOffLongitude: number
  nearestPublicTransport: string
  notes: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeRequest {
  firstName: string
  lastName: string
  title: string
  email: string
  phoneNumber: string
  homeAddress: string
  dropOffPoint: string
  dropOffLatitude: number
  dropOffLongitude: number
  nearestPublicTransport: string
  notes: string
}
