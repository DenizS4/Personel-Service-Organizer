"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { employeeService } from "../services/employeeService"
import type { Employee } from "../types/employee"
import DataTable from "../components/DataTable"
import ExcelImportExport from "../components/ExcelImportExport"
import { useLanguage } from "../contexts/LanguageContext"

export default function EmployeesPage() {
  const { t } = useLanguage()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    phoneNumber: "",
    homeAddress: "",
    dropOffPoint: "",
    dropOffLatitude: 0,
    dropOffLongitude: 0,
    nearestPublicTransport: "",
    notes: "",
  })

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      setIsLoading(true)
      const data = await employeeService.getEmployees()
      setEmployees(data)
    } catch (err) {
      setError("Failed to load employees")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, { ...editingEmployee, ...formData })
      } else {
        await employeeService.createEmployee(formData)
      }
      await loadEmployees()
      resetForm()
    } catch (err) {
      setError("Failed to save employee")
      console.error(err)
    }
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      title: employee.title,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      homeAddress: employee.homeAddress,
      dropOffPoint: employee.dropOffPoint,
      dropOffLatitude: employee.dropOffLatitude,
      dropOffLongitude: employee.dropOffLongitude,
      nearestPublicTransport: employee.nearestPublicTransport,
      notes: employee.notes,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return

    try {
      await employeeService.deleteEmployee(id)
      await loadEmployees()
    } catch (err) {
      setError("Failed to delete employee")
      console.error(err)
    }
  }

  const resetForm = () => {
    setEditingEmployee(null)
    setShowForm(false)
    setFormData({
      firstName: "",
      lastName: "",
      title: "",
      email: "",
      phoneNumber: "",
      homeAddress: "",
      dropOffPoint: "",
      dropOffLatitude: 0,
      dropOffLongitude: 0,
      nearestPublicTransport: "",
      notes: "",
    })
  }

  const handleImport = async (importedData: any[]) => {
    try {
      for (const employeeData of importedData) {
        await employeeService.createEmployee(employeeData)
      }
      await loadEmployees()
    } catch (err) {
      setError("Failed to import employees")
      console.error(err)
    }
  }

  const handleExport = async () => {
    // Export functionality is handled by the ExcelImportExport component
  }

  const columns = [
    {
      key: "firstName",
      label: t("employees.firstName"),
      sortable: true,
    },
    {
      key: "lastName",
      label: t("employees.lastName"),
      sortable: true,
    },
    {
      key: "title",
      label: t("employees.jobTitle"),
      sortable: true,
    },
    {
      key: "email",
      label: t("employees.email"),
      sortable: true,
    },
    {
      key: "dropOffPoint",
      label: t("employees.dropOffPoint"),
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: "isActive",
      label: t("common.status"),
      render: (value: boolean) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? t("common.active") : t("common.inactive")}
        </span>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t("employees.title")}</h1>
              <p className="mt-2 text-gray-600">{t("employees.subtitle")}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <ExcelImportExport
                type="employees"
                onImport={handleImport}
                onExport={handleExport}
                data={employees}
                filename={`employees_${new Date().toISOString().split("T")[0]}.xlsx`}
              />
              <button onClick={() => setShowForm(true)} className="btn-primary flex items-center whitespace-nowrap">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t("employees.addEmployee")}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingEmployee ? t("employees.editEmployee") : t("employees.addNewEmployee")}
                  </h3>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">{t("employees.personalInfo")}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">{t("employees.firstName")} *</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="form-input"
                          placeholder={t("employees.firstNamePlaceholder")}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">{t("employees.lastName")} *</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="form-input"
                          placeholder={t("employees.lastNamePlaceholder")}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">{t("employees.jobTitle")}</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="form-input"
                          placeholder="e.g., Software Engineer"
                        />
                      </div>

                      <div>
                        <label className="form-label">{t("employees.email")} *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="form-input"
                          placeholder={t("employees.emailPlaceholder")}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">{t("employees.phoneNumber")}</label>
                        <input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          className="form-input"
                          placeholder="+1-555-0123"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">{t("employees.locationInfo")}</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="form-label">{t("employees.homeAddress")} *</label>
                        <textarea
                          value={formData.homeAddress}
                          onChange={(e) => setFormData({ ...formData, homeAddress: e.target.value })}
                          className="form-input"
                          rows={2}
                          placeholder="Full home address"
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">{t("employees.dropOffPoint")} *</label>
                        <textarea
                          value={formData.dropOffPoint}
                          onChange={(e) => setFormData({ ...formData, dropOffPoint: e.target.value })}
                          className="form-input"
                          rows={2}
                          placeholder="Preferred pickup/drop-off location"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="form-label">{t("employees.dropOffLatitude")} *</label>
                          <input
                            type="number"
                            step="any"
                            value={formData.dropOffLatitude}
                            onChange={(e) =>
                              setFormData({ ...formData, dropOffLatitude: Number.parseFloat(e.target.value) })
                            }
                            className="form-input"
                            placeholder="40.7589"
                            required
                          />
                        </div>

                        <div>
                          <label className="form-label">{t("employees.dropOffLongitude")} *</label>
                          <input
                            type="number"
                            step="any"
                            value={formData.dropOffLongitude}
                            onChange={(e) =>
                              setFormData({ ...formData, dropOffLongitude: Number.parseFloat(e.target.value) })
                            }
                            className="form-input"
                            placeholder="-73.9851"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label">{t("employees.nearestPublicTransport")}</label>
                        <input
                          type="text"
                          value={formData.nearestPublicTransport}
                          onChange={(e) => setFormData({ ...formData, nearestPublicTransport: e.target.value })}
                          className="form-input"
                          placeholder="e.g., Times Square Subway Station"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">{t("employees.additionalInfo")}</h4>
                    <div>
                      <label className="form-label">{t("cars.notes")}</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="form-input"
                        rows={3}
                        placeholder="Any additional notes or special requirements"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button type="button" onClick={resetForm} className="btn-secondary">
                      {t("common.cancel")}
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingEmployee ? t("common.update") : t("common.add")} {t("nav.employees")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <DataTable
          data={employees}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchable={true}
          filterable={true}
          itemsPerPage={15}
        />
      </div>
    </div>
  )
}
