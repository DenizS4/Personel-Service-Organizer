import axios from "axios"
import type { Car, CreateCarRequest } from "../types/car"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
})

export const carService = {
  async getCars(): Promise<Car[]> {
    const response = await api.get("/cars")
    return response.data
  },

  async getCar(id: number): Promise<Car> {
    const response = await api.get(`/cars/${id}`)
    return response.data
  },

  async createCar(car: CreateCarRequest): Promise<Car> {
    const response = await api.post("/cars", car)
    return response.data
  },

  async updateCar(id: number, car: Partial<Car>): Promise<void> {
    await api.put(`/cars/${id}`, car)
  },

  async deleteCar(id: number): Promise<void> {
    await api.delete(`/cars/${id}`)
  },
}
