namespace BusOrganizer.Models
{
    public class RouteAssignment
    {
        public int Id { get; set; }
        
        public int CarId { get; set; }
        
        public int EmployeeId { get; set; }
        
        public string RouteName { get; set; } = string.Empty;
        
        public int RouteOrder { get; set; }
        
        public double EstimatedDistance { get; set; }
        
        public int EstimatedDuration { get; set; } // in minutes
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual Car Car { get; set; } = null!;
        
        public virtual Employee Employee { get; set; } = null!;
    }
}
