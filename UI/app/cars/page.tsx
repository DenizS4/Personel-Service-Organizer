"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { carService } from "../services/carService"
import type { Car } from "../types/car"
import DataTable from "../components/DataTable"
import ExcelImportExport from "../components/ExcelImportExport"
import { useLanguage } from "../contexts/LanguageContext"

export default function CarsPage() {
  const { t } = useLanguage()
  const [cars, setCars] = useState<Car[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    model: "",
    plateNumber: "",
    capacity: 1,
    color: "",
    year: new Date().getFullYear(),
    notes: "",
  })

  useEffect(() => {
    loadCars()
  }, [])

  const loadCars = async () => {
    try {
      setIsLoading(true)
      const data = await carService.getCars()
      setCars(data)
    } catch (err) {
      setError("Failed to load cars")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCar) {
        await carService.updateCar(editingCar.id, { ...editingCar, ...formData })
      } else {
        await carService.createCar(formData)
      }
      await loadCars()
      resetForm()
    } catch (err) {
      setError("Failed to save car")
      console.error(err)
    }
  }

  const handleEdit = (car: Car) => {
    setEditingCar(car)
    setFormData({
      model: car.model,
      plateNumber: car.plateNumber,
      capacity: car.capacity,
      color: car.color,
      year: car.year,
      notes: car.notes,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this car?")) return

    try {
      await carService.deleteCar(id)
      await loadCars()
    } catch (err) {
      setError("Failed to delete car")
      console.error(err)
    }
  }

  const resetForm = () => {
    setEditingCar(null)
    setShowForm(false)
    setFormData({
      model: "",
      plateNumber: "",
      capacity: 1,
      color: "",
      year: new Date().getFullYear(),
      notes: "",
    })
  }

  const handleImport = async (importedData: any[]) => {
    try {
      for (const carData of importedData) {
        await carService.createCar(carData)
      }
      await loadCars()
    } catch (err) {
      setError("Failed to import cars")
      console.error(err)
    }
  }

  const handleExport = async () => {
    // Export functionality is handled by the ExcelImportExport component
  }

  const columns = [
    {
      key: "model",
      label: t("cars.model"),
      sortable: true,
    },
    {
      key: "plateNumber",
      label: t("cars.plateNumber"),
      sortable: true,
    },
    {
      key: "capacity",
      label: t("cars.capacity"),
      sortable: true,
      render: (value: number) => `${value} ${t("cars.people")}`,
    },
    {
      key: "color",
      label: t("cars.color"),
      render: (value: string) => (
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-full mr-2 border border-gray-300"
            style={{ backgroundColor: value.toLowerCase() }}
          ></div>
          {value}
        </div>
      ),
    },
    {
      key: "year",
      label: t("cars.year"),
      sortable: true,
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
              <h1 className="text-3xl font-bold text-gray-900">{t("cars.title")}</h1>
              <p className="mt-2 text-gray-600">{t("cars.subtitle")}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <ExcelImportExport
                type="cars"
                onImport={handleImport}
                onExport={handleExport}
                data={cars}
                filename={`cars_${new Date().toISOString().split("T")[0]}.xlsx`}
              />
              <button onClick={() => setShowForm(true)} className="btn-primary whitespace-nowrap flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t("cars.addCar")}
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
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingCar ? t("cars.editCar") : t("cars.addNewCar")}
                  </h3>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">{t("cars.model")} *</label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="form-input"
                        placeholder={t("cars.modelPlaceholder")}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">{t("cars.plateNumber")} *</label>
                      <input
                        type="text"
                        value={formData.plateNumber}
                        onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                        className="form-input"
                        placeholder={t("cars.platePlaceholder")}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">{t("cars.capacity")} *</label>
                      <input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) })}
                        className="form-input"
                        placeholder={t("cars.capacityPlaceholder")}
                        min="1"
                        max="100"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">{t("cars.color")}</label>
                      <select
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="form-input"
                      >
                        <option value="">{t("cars.selectColor")}</option>
                        <option value="White">White</option>
                        <option value="Black">Black</option>
                        <option value="Blue">Blue</option>
                        <option value="Red">Red</option>
                        <option value="Silver">Silver</option>
                        <option value="Gray">Gray</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">{t("cars.year")}</label>
                      <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                        className="form-input"
                        min="1990"
                        max="2030"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="form-label">{t("cars.notes")}</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="form-input"
                        rows={3}
                        placeholder={t("cars.notesPlaceholder")}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button type="button" onClick={resetForm} className="btn-secondary">
                      {t("common.cancel")}
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingCar ? t("common.update") : t("common.add")} {t("nav.cars")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <DataTable
          data={cars}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchable={true}
          filterable={true}
          itemsPerPage={10}
        />
      </div>
    </div>
  )
}
