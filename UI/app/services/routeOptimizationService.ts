import axios from "axios"
import type { RouteOptimizationRequest, OptimizedRoute } from "../types/route"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
})

export const routeOptimizationService = {
  async optimizeRoutes(request: RouteOptimizationRequest): Promise<OptimizedRoute[]> {
    const response = await api.post("/routeoptimization/optimize", request)
    return response.data
  },

  async saveRouteAssignments(routes: OptimizedRoute[]): Promise<void> {
    await api.post("/routeoptimization/save-assignments", routes)
  },

  async getRouteAssignments(): Promise<any[]> {
    const response = await api.get("/routeoptimization/assignments")
    return response.data
  },
}
