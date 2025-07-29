using System.ComponentModel.DataAnnotations;

namespace BusOrganizer.Models
{
    public class Employee
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;
        
        [Required]
        [StringLength(500)]
        public string HomeAddress { get; set; } = string.Empty;
        
        [Required]
        [StringLength(500)]
        public string DropOffPoint { get; set; } = string.Empty;
        
        public double DropOffLatitude { get; set; }
        
        public double DropOffLongitude { get; set; }
        
        [StringLength(200)]
        public string NearestPublicTransport { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public virtual ICollection<RouteAssignment> RouteAssignments { get; set; } = new List<RouteAssignment>();
    }
}
