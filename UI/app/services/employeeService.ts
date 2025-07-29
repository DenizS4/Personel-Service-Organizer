import axios from "axios"
import type { Employee, CreateEmployeeRequest } from "../types/employee"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
})

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    const response = await api.get("/employees")
    return response.data
  },

  async getEmployee(id: number): Promise<Employee> {
    const response = await api.get(`/employees/${id}`)
    return response.data
  },

  async createEmployee(employee: CreateEmployeeRequest): Promise<Employee> {
    const response = await api.post("/employees", employee)
    return response.data
  },

  async updateEmployee(id: number, employee: Partial<Employee>): Promise<void> {
    await api.put(`/employees/${id}`, employee)
  },

  async deleteEmployee(id: number): Promise<void> {
    await api.delete(`/employees/${id}`)
  },
}
