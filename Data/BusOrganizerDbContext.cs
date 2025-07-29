using Microsoft.EntityFrameworkCore;
using BusOrganizer.Models;

namespace BusOrganizer.Services
{
    public class BusOrganizerDbContext : DbContext
    {
        public BusOrganizerDbContext(DbContextOptions<BusOrganizerDbContext> options) : base(options)
        {
        }
        
        public DbSet<Car> Cars { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<RouteAssignment> RouteAssignments { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Car configuration
            modelBuilder.Entity<Car>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Model).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PlateNumber).IsRequired().HasMaxLength(20);
                entity.HasIndex(e => e.PlateNumber).IsUnique();
            });
            
            // Employee configuration
            modelBuilder.Entity<Employee>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
                entity.HasIndex(e => e.Email).IsUnique();
            });
            
            // RouteAssignment configuration
            modelBuilder.Entity<RouteAssignment>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(e => e.Car)
                    .WithMany(c => c.RouteAssignments)
                    .HasForeignKey(e => e.CarId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasOne(e => e.Employee)
                    .WithMany(emp => emp.RouteAssignments)
                    .HasForeignKey(e => e.EmployeeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            
            base.OnModelCreating(modelBuilder);
        }
    }
}
