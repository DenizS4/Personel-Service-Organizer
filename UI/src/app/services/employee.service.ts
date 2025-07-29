import { Injectable } from "@angular/core"
import type { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import { environment } from "../../environments/environment"
import type { Employee } from "../models/employee.model"

@Injectable({
  providedIn: "root",
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/api/employees`

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl)
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`)
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee)
  }

  updateEmployee(employee: Employee): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${employee.id}`, employee)
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}
