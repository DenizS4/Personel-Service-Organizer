"use client"

import type React from "react"
import { useState } from "react"
import * as XLSX from "xlsx"

interface ExcelImportExportProps {
  onImport: (data: any[]) => void
  onExport: () => void
  data?: any[]
  type: "cars" | "employees"
  filename?: string
}

export default function ExcelImportExport({ onImport, onExport, data = [], type, filename }: ExcelImportExportProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          // Transform data based on type
          const transformedData = jsonData.map((row: any) => {
            if (type === "cars") {
              return {
                model: row.Model || row.model || "",
                plateNumber: row["Plate Number"] || row.plateNumber || "",
                capacity: Number(row.Capacity || row.capacity) || 1,
                color: row.Color || row.color || "",
                year: Number(row.Year || row.year) || new Date().getFullYear(),
                notes: row.Notes || row.notes || "",
              }
            } else {
              return {
                firstName: row["First Name"] || row.firstName || "",
                lastName: row["Last Name"] || row.lastName || "",
                title: row.Title || row.title || "",
                email: row.Email || row.email || "",
                phoneNumber: row["Phone Number"] || row.phoneNumber || "",
                homeAddress: row["Home Address"] || row.homeAddress || "",
                dropOffPoint: row["Drop-off Point"] || row.dropOffPoint || "",
                dropOffLatitude: Number(row["Drop-off Latitude"] || row.dropOffLatitude) || 0,
                dropOffLongitude: Number(row["Drop-off Longitude"] || row.dropOffLongitude) || 0,
                nearestPublicTransport: row["Nearest Public Transport"] || row.nearestPublicTransport || "",
                notes: row.Notes || row.notes || "",
              }
            }
          })

          onImport(transformedData)
          setIsImporting(false)
        } catch (error) {
          console.error("Error parsing Excel file:", error)
          alert("Error parsing Excel file. Please check the format.")
          setIsImporting(false)
        }
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error("Import error:", error)
      alert("Error importing file")
      setIsImporting(false)
    }

    // Reset file input
    event.target.value = ""
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Transform data for export
      const exportData = data.map((item) => {
        if (type === "cars") {
          return {
            Model: item.model,
            "Plate Number": item.plateNumber,
            Capacity: item.capacity,
            Color: item.color,
            Year: item.year,
            Status: item.isActive ? "Active" : "Inactive",
            Notes: item.notes,
            "Created At": new Date(item.createdAt).toLocaleDateString(),
          }
        } else {
          return {
            "First Name": item.firstName,
            "Last Name": item.lastName,
            Title: item.title,
            Email: item.email,
            "Phone Number": item.phoneNumber,
            "Home Address": item.homeAddress,
            "Drop-off Point": item.dropOffPoint,
            "Drop-off Latitude": item.dropOffLatitude,
            "Drop-off Longitude": item.dropOffLongitude,
            "Nearest Public Transport": item.nearestPublicTransport,
            Status: item.isActive ? "Active" : "Inactive",
            Notes: item.notes,
            "Created At": new Date(item.createdAt).toLocaleDateString(),
          }
        }
      })

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(exportData)

      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
        wch: Math.max(key.length, 15),
      }))
      worksheet["!cols"] = colWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, type === "cars" ? "Cars" : "Employees")

      // Generate filename
      const defaultFilename = `${type}_${new Date().toISOString().split("T")[0]}.xlsx`
      const exportFilename = filename || defaultFilename

      // Save file
      XLSX.writeFile(workbook, exportFilename)

      await onExport()
      setIsExporting(false)
    } catch (error) {
      console.error("Export error:", error)
      alert("Error exporting data")
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
      {/* Import */}
      <div className="relative">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
          id={`import-${type}`}
          disabled={isImporting}
        />
        <label
          htmlFor={`import-${type}`}
          className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
            isImporting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isImporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              Importing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              Import Excel
            </>
          )}
        </label>
      </div>

      {/* Export */}
      <button
        onClick={handleExport}
        disabled={isExporting || data.length === 0}
        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors ${
          isExporting || data.length === 0 ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export Excel
          </>
        )}
      </button>
    </div>
  )
}
