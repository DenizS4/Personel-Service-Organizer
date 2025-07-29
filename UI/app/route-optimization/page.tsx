"use client"

import { useState, useEffect, useRef } from "react"
import { carService } from "../services/carService"
import { employeeService } from "../services/employeeService"
import { routeOptimizationService } from "../services/routeOptimizationService"
import type { Car } from "../types/car"
import type { Employee } from "../types/employee"
import type { OptimizedRoute } from "../types/route"
import { useLanguage } from "../contexts/LanguageContext"

declare global {
  interface Window {
    google: any
  }
}

export default function RouteOptimizationPage() {
  const { t } = useLanguage()
  const [cars, setCars] = useState<Car[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedCars, setSelectedCars] = useState<number[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])
  const [workplaceAddress, setWorkplaceAddress] = useState("Times Square, New York, NY")
  const [workplaceCoords, setWorkplaceCoords] = useState({ lat: 40.7589, lng: -73.9851 })
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [error, setError] = useState("")
  const [selectedAlternativeRoute, setSelectedAlternativeRoute] = useState<{
    routeIndex: number
    alternativeIndex: number
  } | null>(null)

  // Filtering states
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("")
  const [carSearchTerm, setCarSearchTerm] = useState("")
  const [employeeLocationFilter, setEmployeeLocationFilter] = useState("")
  const [carCapacityFilter, setCarCapacityFilter] = useState("")

  // Map states
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [directionsService, setDirectionsService] = useState<any>(null)
  const [directionsRenderers, setDirectionsRenderers] = useState<any[]>([])
  const [mapMarkers, setMapMarkers] = useState<any[]>([])

  useEffect(() => {
    loadData()
    initializeMap()
  }, [])

  const loadData = async () => {
    try {
      const [carsData, employeesData] = await Promise.all([carService.getCars(), employeeService.getEmployees()])
      setCars(carsData)
      setEmployees(employeesData)
    } catch (err) {
      setError("Failed to load data")
      console.error(err)
    }
  }

  const initializeMap = () => {
    if (typeof window !== "undefined" && window.google && mapRef.current) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: workplaceCoords,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      })

      const directionsServiceInstance = new window.google.maps.DirectionsService()

      setMap(mapInstance)
      setDirectionsService(directionsServiceInstance)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      return
    }

    setIsGettingLocation(true)
    setError("")

    navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setWorkplaceCoords({ lat: latitude, lng: longitude })

          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder()

            try {
              const results = await new Promise<any[]>((resolve, reject) => {
                geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                  if (status === "OK" && results && results.length > 0) {
                    resolve(results)
                  } else {
                    reject(new Error(`Geocoding failed: ${status}`))
                  }
                })
              })

              const result = results[0]
              let formattedAddress = result.formatted_address

              // Optional: Extract components
              const components = result.address_components
              let streetNumber = ""
              let streetName = ""
              let neighborhood = ""
              let locality = ""

              components.forEach((component: any) => {
                const types = component.types
                if (types.includes("street_number")) {
                  streetNumber = component.long_name
                } else if (types.includes("route")) {
                  streetName = component.long_name
                } else if (types.includes("neighborhood") || types.includes("sublocality")) {
                  neighborhood = component.long_name
                } else if (types.includes("locality")) {
                  locality = component.long_name
                }
              })

              if (streetNumber && streetName) {
                formattedAddress = `${streetNumber} ${streetName}`
                if (neighborhood) formattedAddress += `, ${neighborhood}`
                if (locality) formattedAddress += `, ${locality}`
              }

              setWorkplaceAddress(formattedAddress)
              setError(t("routes.locationSuccess"))
              setTimeout(() => setError(""), 3000)
            } catch (geocodeError) {
              console.error("Geocoding error:", geocodeError)
              setWorkplaceAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
              setError("Location found but address details unavailable")
            }
          }

          if (map) {
            map.setCenter({ lat: latitude, lng: longitude })
            map.setZoom(15)
          }

          setIsGettingLocation(false)
        },
        (error) => {
          setError(t("routes.locationError"))
          setIsGettingLocation(false)
          console.error("Error getting location:", error)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
    )
  }

  // Filter employees based on search and location
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
        !employeeSearchTerm ||
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
        employee.title.toLowerCase().includes(employeeSearchTerm.toLowerCase())

    const matchesLocation =
        !employeeLocationFilter || employee.dropOffPoint.toLowerCase().includes(employeeLocationFilter.toLowerCase())

    return matchesSearch && matchesLocation
  })

  // Filter cars based on search and capacity
  const filteredCars = cars.filter((car) => {
    const matchesSearch =
        !carSearchTerm ||
        car.model.toLowerCase().includes(carSearchTerm.toLowerCase()) ||
        car.plateNumber.toLowerCase().includes(carSearchTerm.toLowerCase())

    const matchesCapacity = !carCapacityFilter || car.capacity >= Number.parseInt(carCapacityFilter)

    return matchesSearch && matchesCapacity
  })

  // Function to filter out very similar routes
  const filterSimilarRoutes = (routes: OptimizedRoute[]): OptimizedRoute[] => {
    const SIMILARITY_THRESHOLD = 0.1 // 10% difference threshold
    const filteredRoutes: OptimizedRoute[] = []

    routes.forEach((route) => {
      // Check if this route is too similar to any already filtered route
      const isSimilar = filteredRoutes.some((existingRoute) => {
        const distanceDiff = Math.abs(route.totalDistance - existingRoute.totalDistance)
        const durationDiff = Math.abs(route.totalDuration - existingRoute.totalDuration)

        const distanceSimilarity = distanceDiff / Math.max(route.totalDistance, existingRoute.totalDistance)
        const durationSimilarity = durationDiff / Math.max(route.totalDuration, existingRoute.totalDuration)

        return distanceSimilarity < SIMILARITY_THRESHOLD && durationSimilarity < SIMILARITY_THRESHOLD
      })

      if (!isSimilar) {
        filteredRoutes.push(route)
      } else {
        // If similar, keep the one with better (shorter) distance
        const similarRouteIndex = filteredRoutes.findIndex((existingRoute) => {
          const distanceDiff = Math.abs(route.totalDistance - existingRoute.totalDistance)
          const durationDiff = Math.abs(route.totalDuration - existingRoute.totalDuration)

          const distanceSimilarity = distanceDiff / Math.max(route.totalDistance, existingRoute.totalDistance)
          const durationSimilarity = durationDiff / Math.max(route.totalDuration, existingRoute.totalDuration)

          return distanceSimilarity < SIMILARITY_THRESHOLD && durationSimilarity < SIMILARITY_THRESHOLD
        })

        if (similarRouteIndex !== -1 && route.totalDistance < filteredRoutes[similarRouteIndex].totalDistance) {
          filteredRoutes[similarRouteIndex] = route
        }
      }
    })

    return filteredRoutes
  }

  const handleOptimizeRoutes = async () => {
    if (!workplaceAddress || selectedCars.length === 0 || selectedEmployees.length === 0) {
      setError("Please fill in all required fields")
      return
    }

    setIsOptimizing(true)
    setError("")

    try {
      const request = {
        workplaceAddress,
        workplaceLatitude: workplaceCoords.lat,
        workplaceLongitude: workplaceCoords.lng,
        employeeIds: selectedEmployees,
        carIds: selectedCars,
      }

      const routes = await routeOptimizationService.optimizeRoutes(request)

      // Filter out very similar routes to avoid visual confusion
      const filteredRoutes = filterSimilarRoutes(routes)

      setOptimizedRoutes(filteredRoutes)
      displayRoutesOnMap(filteredRoutes)
      setSelectedAlternativeRoute(null)
    } catch (err) {
      setError("Failed to optimize routes")
      console.error(err)
    } finally {
      setIsOptimizing(false)
    }
  }

  const clearMapElements = () => {
    // Clear existing renderers
    directionsRenderers.forEach((renderer) => renderer.setMap(null))
    setDirectionsRenderers([])

    // Clear existing markers
    mapMarkers.forEach((marker) => marker.setMap(null))
    setMapMarkers([])
  }

  const displayRoutesOnMap = (
      routes: OptimizedRoute[],
      alternativeRoute?: { routeIndex: number; alternativeIndex: number },
  ) => {
    if (!map || !directionsService) return

    clearMapElements()

    // Add workplace marker
    const workplaceMarker = new window.google.maps.Marker({
      position: workplaceCoords,
      map: map,
      title: "Workplace",
      icon: {
        url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="16" fill="#10B981" stroke="white" strokeWidth="4"/>
            <text x="20" y="26" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">🏢</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
      },
    })

    const newMarkers = [workplaceMarker]
    const colors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"]
    const newRenderers: any[] = []

    // If showing alternative route, only show that specific route
    if (alternativeRoute) {
      const route = routes[alternativeRoute.routeIndex]
      const altRoute = route.alternativeRoutes[alternativeRoute.alternativeIndex]
      const color = colors[alternativeRoute.routeIndex % colors.length]

      // Add employee markers for alternative route
      altRoute.stops.forEach((stop) => {
        const marker = new window.google.maps.Marker({
          position: { lat: stop.latitude, lng: stop.longitude },
          map: map,
          title: `${stop.employeeName} (Stop ${stop.order})`,
          icon: {
            url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" strokeWidth="3"/>
                <text x="16" y="20" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">${stop.order}</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
          },
        })
        newMarkers.push(marker)
      })

      // Create route path for alternative
      const renderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: color,
          strokeWeight: 6,
          strokeOpacity: 1,
        },
      })

      renderer.setMap(map)
      newRenderers.push(renderer)

      const waypoints = altRoute.stops.map((stop) => ({
        location: new window.google.maps.LatLng(stop.latitude, stop.longitude),
        stopover: true,
      }))

      directionsService.route(
          {
            origin: workplaceCoords,
            destination: workplaceCoords,
            waypoints: waypoints,
            optimizeWaypoints: false,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result: any, status: any) => {
            if (status === "OK") {
              renderer.setDirections(result)
            }
          },
      )
    } else {
      // Show all main routes (but not overlapping ones due to filtering)
      routes.forEach((route, routeIndex) => {
        const color = colors[routeIndex % colors.length]

        // Add employee markers for main route
        route.stops.forEach((stop) => {
          const marker = new window.google.maps.Marker({
            position: { lat: stop.latitude, lng: stop.longitude },
            map: map,
            title: `${stop.employeeName} (Stop ${stop.order})`,
            icon: {
              url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" strokeWidth="3"/>
                  <text x="16" y="20" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">${stop.order}</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
            },
          })
          newMarkers.push(marker)
        })

        // Create route path
        const renderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: color,
            strokeWeight: 4,
            strokeOpacity: 0.8,
          },
        })

        renderer.setMap(map)
        newRenderers.push(renderer)

        const waypoints = route.stops.map((stop) => ({
          location: new window.google.maps.LatLng(stop.latitude, stop.longitude),
          stopover: true,
        }))

        directionsService.route(
            {
              origin: workplaceCoords,
              destination: workplaceCoords,
              waypoints: waypoints,
              optimizeWaypoints: false,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result: any, status: any) => {
              if (status === "OK") {
                renderer.setDirections(result)
              }
            },
        )
      })
    }

    setDirectionsRenderers(newRenderers)
    setMapMarkers(newMarkers)
  }

  const viewAlternativeRoute = (routeIndex: number, alternativeIndex: number) => {
    const selection = { routeIndex, alternativeIndex }
    setSelectedAlternativeRoute(selection)
    displayRoutesOnMap(optimizedRoutes, selection)
  }

  const viewMainRoute = () => {
    setSelectedAlternativeRoute(null)
    displayRoutesOnMap(optimizedRoutes)
  }

  const exportRouteForNavigation = (route: OptimizedRoute, alternativeIndex?: number) => {
    const stopsToExport = alternativeIndex !== undefined ? route.alternativeRoutes[alternativeIndex].stops : route.stops

    const navigationData = {
      routeName: route.routeName,
      carModel: route.carModel,
      startLocation: {
        name: "Workplace",
        address: workplaceAddress,
        latitude: workplaceCoords.lat,
        longitude: workplaceCoords.lng,
      },
      stops: stopsToExport.map((stop) => ({
        order: stop.order,
        employeeName: stop.employeeName,
        address: stop.address,
        latitude: stop.latitude,
        longitude: stop.longitude,
      })),
      totalDistance:
          alternativeIndex !== undefined ? route.alternativeRoutes[alternativeIndex].totalDistance : route.totalDistance,
      totalDuration:
          alternativeIndex !== undefined ? route.alternativeRoutes[alternativeIndex].totalDuration : route.totalDuration,
      exportedAt: new Date().toISOString(),
    }

    // Create downloadable file
    const dataStr = JSON.stringify(navigationData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `${route.routeName.replace(/\s+/g, "_")}_navigation${alternativeIndex !== undefined ? `_alt${alternativeIndex + 1}` : ""}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const toggleCarSelection = (carId: number) => {
    setSelectedCars((prev) => (prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId]))
  }

  const toggleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployees((prev) =>
        prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
    )
  }

  const selectAllEmployees = () => {
    setSelectedEmployees(filteredEmployees.map((e) => e.id))
  }

  const clearAllEmployees = () => {
    setSelectedEmployees([])
  }

  const selectAllCars = () => {
    setSelectedCars(filteredCars.map((c) => c.id))
  }

  const clearAllCars = () => {
    setSelectedCars([])
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t("routes.title")}</h1>
            <p className="mt-2 text-gray-600">{t("routes.subtitle")}</p>
          </div>

          {error && (
              <div className={`alert mb-6 ${error.includes("success") ? "alert-success" : "alert-error"}`}>
                <p>{error}</p>
              </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* Workplace Address */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">{t("routes.workplaceLocation")}</h2>
                <div className="space-y-3">
                  <label className="form-label">{t("routes.workplaceAddress")}</label>
                  <div className="flex space-x-2">
                    <input
                        type="text"
                        value={workplaceAddress}
                        onChange={(e) => setWorkplaceAddress(e.target.value)}
                        className="form-input flex-1"
                        placeholder="Enter workplace address"
                    />

                  </div>
                  <p className="text-xs text-gray-500">
                    💡 Tip: Use the location button for high accuracy, or manually enter a specific address
                  </p>
                </div>
                <button
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    title={t("routes.getCurrentLocation")}
                >
                  {isGettingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="hidden sm:inline">{t("routes.gettingLocation")}</span>
                      </>
                  ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="hidden sm:inline">{t("routes.getCurrentLocation")}</span>
                      </>
                  )}
                </button>
              </div>

              {/* Car Selection */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    {t("routes.selectCars")} ({selectedCars.length})
                  </h2>
                  <div className="flex space-x-2">
                    <button onClick={selectAllCars} className="text-sm text-blue-600 hover:text-blue-800">
                      {t("common.all")}
                    </button>
                    <button onClick={clearAllCars} className="text-sm text-red-600 hover:text-red-800">
                      {t("common.clear")}
                    </button>
                  </div>
                </div>

                {/* Car Filters */}
                <div className="space-y-3 mb-4">
                  <input
                      type="text"
                      placeholder={t("routes.searchCars")}
                      value={carSearchTerm}
                      onChange={(e) => setCarSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                      type="number"
                      placeholder={t("routes.minCapacity")}
                      value={carCapacityFilter}
                      onChange={(e) => setCarCapacityFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredCars.map((car) => (
                      <div key={car.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <input
                            type="checkbox"
                            checked={selectedCars.includes(car.id)}
                            onChange={() => toggleCarSelection(car.id)}
                            className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{car.model}</div>
                          <div className="text-xs text-gray-500">
                            {car.plateNumber} • {car.capacity} {t("routes.seats")}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>

              {/* Employee Selection */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    {t("routes.selectEmployees")} ({selectedEmployees.length})
                  </h2>
                  <div className="flex space-x-2">
                    <button onClick={selectAllEmployees} className="text-sm text-blue-600 hover:text-blue-800">
                      {t("common.all")}
                    </button>
                    <button onClick={clearAllEmployees} className="text-sm text-red-600 hover:text-red-800">
                      {t("common.clear")}
                    </button>
                  </div>
                </div>

                {/* Employee Filters */}
                <div className="space-y-3 mb-4">
                  <input
                      type="text"
                      placeholder={t("routes.searchEmployees")}
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                      type="text"
                      placeholder={t("routes.filterByLocation")}
                      value={employeeLocationFilter}
                      onChange={(e) => setEmployeeLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredEmployees.map((employee) => (
                      <div key={employee.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={() => toggleEmployeeSelection(employee.id)}
                            className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {employee.title} • {employee.dropOffPoint.substring(0, 30)}...
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>

              {/* Optimize Button */}
              <button
                  onClick={handleOptimizeRoutes}
                  disabled={
                      isOptimizing || !workplaceAddress || selectedCars.length === 0 || selectedEmployees.length === 0
                  }
                  className="w-full btn-primary py-3"
              >
                {isOptimizing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t("routes.optimizingRoutes")}
                    </>
                ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                      {t("routes.optimizeRoutes")}
                    </>
                )}
              </button>
            </div>

            {/* Map and Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Map */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">{t("routes.routeVisualization")}</h2>
                  {selectedAlternativeRoute && (
                      <button
                          onClick={viewMainRoute}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        {t("routes.currentRoute")}
                      </button>
                  )}
                </div>
                <div ref={mapRef} className="w-full h-96 rounded-lg border border-gray-300" />
                {optimizedRoutes.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {optimizedRoutes.map((route, index) => {
                          const colors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"]
                          const isHighlighted = selectedAlternativeRoute?.routeIndex === index
                          return (
                              <div key={index} className={`flex items-center text-sm ${isHighlighted ? "font-bold" : ""}`}>
                                <div
                                    className="w-4 h-4 rounded mr-2"
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                ></div>
                                <span>{route.routeName}</span>
                                {isHighlighted && (
                                    <span className="ml-2 text-xs text-blue-600">
                              ({t("routes.alternativeRoute")} {selectedAlternativeRoute.alternativeIndex + 1})
                            </span>
                                )}
                              </div>
                          )
                        })}
                      </div>
                      <p className="text-xs text-gray-500">
                        ℹ️ Similar routes are automatically filtered to avoid visual confusion
                      </p>
                    </div>
                )}
              </div>

              {/* Route Results */}
              {optimizedRoutes.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">{t("routes.optimizedRoutes")}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {optimizedRoutes.map((route, index) => (
                          <div key={index} className="bg-white shadow rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{route.routeName}</h3>
                                <p className="text-sm text-gray-600">{route.carModel}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  {route.totalDistance.toFixed(1)} {t("routes.km")}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {route.totalDuration} {t("routes.min")}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900 text-sm">{t("routes.routeStops")}:</h4>
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {route.stops.map((stop) => (
                                    <div key={stop.employeeId} className="flex items-center text-xs">
                              <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                                {stop.order}
                              </span>
                                      <div className="flex-1">
                                        <p className="font-medium">{stop.employeeName}</p>
                                        <p className="text-gray-500 truncate">{stop.address}</p>
                                      </div>
                                    </div>
                                ))}
                              </div>
                            </div>

                            {/* Export Main Route */}
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex space-x-2">
                                <button
                                    onClick={() => exportRouteForNavigation(route)}
                                    className="flex-1 px-3 py-2 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center space-x-1"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  <span>{t("routes.exportForNavigation")}</span>
                                </button>
                              </div>
                            </div>

                            {route.alternativeRoutes.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                  <h4 className="font-medium text-gray-900 text-sm mb-2">{t("routes.alternatives")}:</h4>
                                  <div className="space-y-2">
                                    {route.alternativeRoutes.map((alt, altIndex) => (
                                        <div
                                            key={alt.optionNumber}
                                            className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded"
                                        >
                                          <div className="flex items-center space-x-2">
                                  <span>
                                    {t("routes.option")} {alt.optionNumber}
                                  </span>
                                            <span className="text-gray-500">
                                    {alt.totalDistance.toFixed(1)} {t("routes.km")} • {alt.totalDuration}{" "}
                                              {t("routes.min")}
                                  </span>
                                          </div>
                                          <div className="flex space-x-1">
                                            <button
                                                onClick={() => viewAlternativeRoute(index, altIndex)}
                                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                title={t("routes.viewOnMap")}
                                            >
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                              </svg>
                                            </button>
                                            <button
                                                onClick={() => exportRouteForNavigation(route, altIndex)}
                                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                title={t("routes.exportForNavigation")}
                                            >
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                    ))}
                                  </div>
                                </div>
                            )}
                          </div>
                      ))}
                    </div>

                    {/* Save Routes */}
                    <div className="bg-white shadow rounded-lg p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{t("routes.saveRouteAssignments")}</h3>
                          <p className="text-sm text-gray-600">Save the current route optimization for future use</p>
                        </div>
                        <button onClick={() => console.log("Save routes")} className="btn-primary">
                          {t("common.save")} {t("nav.routeOptimization")}
                        </button>
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}
