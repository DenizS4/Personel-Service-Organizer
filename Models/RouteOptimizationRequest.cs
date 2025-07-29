namespace BusOrganizer.Models
{
    public class RouteOptimizationRequest
    {
        public string WorkplaceAddress { get; set; } = string.Empty;
        
        public double WorkplaceLatitude { get; set; }
        
        public double WorkplaceLongitude { get; set; }
        
        public List<int> EmployeeIds { get; set; } = new List<int>();
        
        public List<int> CarIds { get; set; } = new List<int>();
    }
    
    public class OptimizedRoute
    {
        public int CarId { get; set; }
        
        public string CarModel { get; set; } = string.Empty;
        
        public string RouteName { get; set; } = string.Empty;
        
        public List<RouteStop> Stops { get; set; } = new List<RouteStop>();
        
        public double TotalDistance { get; set; }
        
        public int TotalDuration { get; set; }
        
        public List<RouteOption> AlternativeRoutes { get; set; } = new List<RouteOption>();
    }
    
    public class RouteStop
    {
        public int EmployeeId { get; set; }
        
        public string EmployeeName { get; set; } = string.Empty;
        
        public string Address { get; set; } = string.Empty;
        
        public double Latitude { get; set; }
        
        public double Longitude { get; set; }
        
        public int Order { get; set; }
    }
    
    public class RouteOption
    {
        public int OptionNumber { get; set; }
        
        public List<RouteStop> Stops { get; set; } = new List<RouteStop>();
        
        public double TotalDistance { get; set; }
        
        public int TotalDuration { get; set; }
    }
}
