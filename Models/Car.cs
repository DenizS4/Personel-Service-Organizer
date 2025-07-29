using System.ComponentModel.DataAnnotations;

namespace BusOrganizer.Models
{
    public class Car
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Model { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string PlateNumber { get; set; } = string.Empty;
        
        [Range(1, 100)]
        public int Capacity { get; set; }
        
        [StringLength(50)]
        public string Color { get; set; } = string.Empty;
        
        public int Year { get; set; }
        
        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public virtual ICollection<RouteAssignment> RouteAssignments { get; set; } = new List<RouteAssignment>();
    }
}
