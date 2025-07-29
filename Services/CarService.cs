using BusOrganizer.Models;
using Microsoft.EntityFrameworkCore;

namespace BusOrganizer.Services
{
    public class CarService : ICarService
    {
        private readonly BusOrganizerDbContext _context;

        public CarService(BusOrganizerDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Car>> GetAllCarsAsync()
        {
            return await _context.Cars
                .Where(c => c.IsActive)
                .OrderBy(c => c.Model)
                .ToListAsync();
        }

        public async Task<Car?> GetCarByIdAsync(int id)
        {
            return await _context.Cars
                .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);
        }

        public async Task<Car> CreateCarAsync(Car car)
        {
            car.CreatedAt = DateTime.UtcNow;
            car.UpdatedAt = DateTime.UtcNow;
            
            _context.Cars.Add(car);
            await _context.SaveChangesAsync();
            
            return car;
        }

        public async Task<bool> UpdateCarAsync(Car car)
        {
            var existingCar = await _context.Cars.FindAsync(car.Id);
            if (existingCar == null || !existingCar.IsActive)
            {
                return false;
            }

            existingCar.Model = car.Model;
            existingCar.PlateNumber = car.PlateNumber;
            existingCar.Capacity = car.Capacity;
            existingCar.Color = car.Color;
            existingCar.Year = car.Year;
            existingCar.Notes = car.Notes;
            existingCar.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCarAsync(int id)
        {
            var car = await _context.Cars.FindAsync(id);
            if (car == null)
            {
                return false;
            }

            // Soft delete
            car.IsActive = false;
            car.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
