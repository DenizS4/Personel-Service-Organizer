using BusOrganizer.Models;
using Microsoft.EntityFrameworkCore;

namespace BusOrganizer.Services
{
    public class RouteOptimizationService : IRouteOptimizationService
    {
        private readonly BusOrganizerDbContext _context;
        
        public RouteOptimizationService(BusOrganizerDbContext context)
        {
            _context = context;
        }
        
        public async Task<List<OptimizedRoute>> OptimizeRoutesAsync(RouteOptimizationRequest request)
        {
            // Get employees and cars from database
            var employees = await _context.Employees
                .Where(e => request.EmployeeIds.Contains(e.Id) && e.IsActive)
                .ToListAsync();
                
            var cars = await _context.Cars
                .Where(c => request.CarIds.Contains(c.Id) && c.IsActive)
                .OrderByDescending(c => c.Capacity)
                .ToListAsync();
            
            if (!employees.Any() || !cars.Any())
            {
                throw new ArgumentException("No valid employees or cars found");
            }
            
            // Step 1: Cluster employees by geographic proximity
            var clusters = ClusterEmployeesByLocation(employees, cars.Count);
            
            // Step 2: Assign clusters to cars
            var optimizedRoutes = new List<OptimizedRoute>();
            
            for (int i = 0; i < Math.Min(clusters.Count, cars.Count); i++)
            {
                var car = cars[i];
                var clusterEmployees = clusters[i];
                
                // Ensure we don't exceed car capacity
                if (clusterEmployees.Count > car.Capacity)
                {
                    clusterEmployees = clusterEmployees.Take(car.Capacity).ToList();
                }
                
                // Generate 3 alternative routes for this car
                var routes = GenerateAlternativeRoutes(clusterEmployees, request, car);
                
                optimizedRoutes.Add(routes);
            }
            
            return optimizedRoutes;
        }
        
        private List<List<Employee>> ClusterEmployeesByLocation(List<Employee> employees, int numberOfClusters)
        {
            // Simple K-means clustering based on geographic coordinates
            var clusters = new List<List<Employee>>();
            
            if (employees.Count <= numberOfClusters)
            {
                // If we have fewer employees than clusters, each gets their own cluster
                foreach (var employee in employees)
                {
                    clusters.Add(new List<Employee> { employee });
                }
                return clusters;
            }
            
            // Initialize clusters with random centroids
            var random = new Random();
            var centroids = new List<(double lat, double lng)>();
            
            for (int i = 0; i < numberOfClusters; i++)
            {
                var randomEmployee = employees[random.Next(employees.Count)];
                centroids.Add((randomEmployee.DropOffLatitude, randomEmployee.DropOffLongitude));
            }
            
            // Initialize empty clusters
            for (int i = 0; i < numberOfClusters; i++)
            {
                clusters.Add(new List<Employee>());
            }
            
            // K-means iterations
            for (int iteration = 0; iteration < 10; iteration++)
            {
                // Clear clusters
                foreach (var cluster in clusters)
                {
                    cluster.Clear();
                }
                
                // Assign each employee to nearest centroid
                foreach (var employee in employees)
                {
                    var nearestClusterIndex = 0;
                    var minDistance = double.MaxValue;
                    
                    for (int i = 0; i < centroids.Count; i++)
                    {
                        var distance = CalculateDistance(
                            employee.DropOffLatitude, employee.DropOffLongitude,
                            centroids[i].lat, centroids[i].lng);
                            
                        if (distance < minDistance)
                        {
                            minDistance = distance;
                            nearestClusterIndex = i;
                        }
                    }
                    
                    clusters[nearestClusterIndex].Add(employee);
                }
                
                // Update centroids
                for (int i = 0; i < centroids.Count; i++)
                {
                    if (clusters[i].Any())
                    {
                        var avgLat = clusters[i].Average(e => e.DropOffLatitude);
                        var avgLng = clusters[i].Average(e => e.DropOffLongitude);
                        centroids[i] = (avgLat, avgLng);
                    }
                }
            }
            
            return clusters.Where(c => c.Any()).ToList();
        }
        
        private OptimizedRoute GenerateAlternativeRoutes(List<Employee> employees, RouteOptimizationRequest request, Car car)
        {
            var routeName = DetermineRouteName(employees);
            
            var optimizedRoute = new OptimizedRoute
            {
                CarId = car.Id,
                CarModel = car.Model,
                RouteName = routeName,
                AlternativeRoutes = new List<RouteOption>()
            };
            
            // Generate 3 different route options
            for (int i = 1; i <= 3; i++)
            {
                var routeOption = GenerateSingleRoute(employees, request, i);
                optimizedRoute.AlternativeRoutes.Add(routeOption);
            }
            
            // Set the best route as the main route
            var bestRoute = optimizedRoute.AlternativeRoutes.OrderBy(r => r.TotalDistance).First();
            optimizedRoute.Stops = bestRoute.Stops;
            optimizedRoute.TotalDistance = bestRoute.TotalDistance;
            optimizedRoute.TotalDuration = bestRoute.TotalDuration;
            
            return optimizedRoute;
        }
        
        private RouteOption GenerateSingleRoute(List<Employee> employees, RouteOptimizationRequest request, int optionNumber)
        {
            var stops = new List<RouteStop>();
            var employeesCopy = new List<Employee>(employees);
            
            // Different strategies for each route option
            switch (optionNumber)
            {
                case 1: // Nearest neighbor from workplace
                    employeesCopy = OptimizeByNearestNeighbor(employeesCopy, request.WorkplaceLatitude, request.WorkplaceLongitude);
                    break;
                case 2: // Clockwise geographical ordering
                    employeesCopy = OptimizeByGeographicalOrder(employeesCopy, request.WorkplaceLatitude, request.WorkplaceLongitude, true);
                    break;
                case 3: // Counter-clockwise geographical ordering
                    employeesCopy = OptimizeByGeographicalOrder(employeesCopy, request.WorkplaceLatitude, request.WorkplaceLongitude, false);
                    break;
            }
            
            // Create route stops
            for (int i = 0; i < employeesCopy.Count; i++)
            {
                var employee = employeesCopy[i];
                stops.Add(new RouteStop
                {
                    EmployeeId = employee.Id,
                    EmployeeName = $"{employee.FirstName} {employee.LastName}",
                    Address = employee.DropOffPoint,
                    Latitude = employee.DropOffLatitude,
                    Longitude = employee.DropOffLongitude,
                    Order = i + 1
                });
            }
            
            // Calculate total distance and duration
            var totalDistance = CalculateRouteDistance(stops, request.WorkplaceLatitude, request.WorkplaceLongitude);
            var totalDuration = (int)(totalDistance * 2); // Rough estimate: 2 minutes per km
            
            return new RouteOption
            {
                OptionNumber = optionNumber,
                Stops = stops,
                TotalDistance = totalDistance,
                TotalDuration = totalDuration
            };
        }
        
        private List<Employee> OptimizeByNearestNeighbor(List<Employee> employees, double startLat, double startLng)
        {
            var optimized = new List<Employee>();
            var remaining = new List<Employee>(employees);
            var currentLat = startLat;
            var currentLng = startLng;
            
            while (remaining.Any())
            {
                var nearest = remaining.OrderBy(e => 
                    CalculateDistance(currentLat, currentLng, e.DropOffLatitude, e.DropOffLongitude))
                    .First();
                
                optimized.Add(nearest);
                remaining.Remove(nearest);
                currentLat = nearest.DropOffLatitude;
                currentLng = nearest.DropOffLongitude;
            }
            
            return optimized;
        }
        
        private List<Employee> OptimizeByGeographicalOrder(List<Employee> employees, double centerLat, double centerLng, bool clockwise)
        {
            return employees.OrderBy(e =>
            {
                var angle = Math.Atan2(e.DropOffLatitude - centerLat, e.DropOffLongitude - centerLng);
                return clockwise ? angle : -angle;
            }).ToList();
        }
        
        private double CalculateRouteDistance(List<RouteStop> stops, double workplaceLat, double workplaceLng)
        {
            if (!stops.Any()) return 0;
            
            double totalDistance = 0;
            
            // Distance from workplace to first stop
            totalDistance += CalculateDistance(workplaceLat, workplaceLng, stops[0].Latitude, stops[0].Longitude);
            
            // Distance between consecutive stops
            for (int i = 0; i < stops.Count - 1; i++)
            {
                totalDistance += CalculateDistance(
                    stops[i].Latitude, stops[i].Longitude,
                    stops[i + 1].Latitude, stops[i + 1].Longitude);
            }
            
            return totalDistance;
        }
        
        private double CalculateDistance(double lat1, double lng1, double lat2, double lng2)
        {
            // Haversine formula for calculating distance between two points on Earth
            const double R = 6371; // Earth's radius in kilometers
            
            var dLat = ToRadians(lat2 - lat1);
            var dLng = ToRadians(lng2 - lng1);
            
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
                    
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            
            return R * c;
        }
        
        private double ToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
        }
        
        private string DetermineRouteName(List<Employee> employees)
        {
            if (!employees.Any()) return "Empty Route";
            
            // Simple logic to determine route name based on addresses
            var addresses = employees.Select(e => e.DropOffPoint.ToLower()).ToList();
            
            if (addresses.Any(a => a.Contains("manhattan")))
                return "Manhattan Route";
            else if (addresses.Any(a => a.Contains("brooklyn")))
                return "Brooklyn Route";
            else if (addresses.Any(a => a.Contains("center") || a.Contains("downtown")))
                return "Center City Route";
            else
                return $"Route {employees.Count} Stops";
        }
        
        public async Task SaveRouteAssignmentsAsync(List<OptimizedRoute> routes)
        {
            // Clear existing assignments
            var existingAssignments = await _context.RouteAssignments.ToListAsync();
            _context.RouteAssignments.RemoveRange(existingAssignments);
            
            // Save new assignments
            foreach (var route in routes)
            {
                foreach (var stop in route.Stops)
                {
                    var assignment = new RouteAssignment
                    {
                        CarId = route.CarId,
                        EmployeeId = stop.EmployeeId,
                        RouteName = route.RouteName,
                        RouteOrder = stop.Order,
                        EstimatedDistance = route.TotalDistance,
                        EstimatedDuration = route.TotalDuration
                    };
                    
                    _context.RouteAssignments.Add(assignment);
                }
            }
            
            await _context.SaveChangesAsync();
        }
        
        public async Task<List<RouteAssignment>> GetRouteAssignmentsAsync()
        {
            return await _context.RouteAssignments
                .Include(ra => ra.Car)
                .Include(ra => ra.Employee)
                .OrderBy(ra => ra.RouteName)
                .ThenBy(ra => ra.RouteOrder)
                .ToListAsync();
        }
    }
}
