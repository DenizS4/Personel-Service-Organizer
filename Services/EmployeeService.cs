using BusOrganizer.Models;
using Microsoft.EntityFrameworkCore;

namespace BusOrganizer.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly BusOrganizerDbContext _context;

        public EmployeeService(BusOrganizerDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Employee>> GetAllEmployeesAsync()
        {
            return await _context.Employees
                .Where(e => e.IsActive)
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .ToListAsync();
        }

        public async Task<Employee?> GetEmployeeByIdAsync(int id)
        {
            return await _context.Employees
                .FirstOrDefaultAsync(e => e.Id == id && e.IsActive);
        }

        public async Task<Employee> CreateEmployeeAsync(Employee employee)
        {
            employee.CreatedAt = DateTime.UtcNow;
            employee.UpdatedAt = DateTime.UtcNow;
            
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
            
            return employee;
        }

        public async Task<bool> UpdateEmployeeAsync(Employee employee)
        {
            var existingEmployee = await _context.Employees.FindAsync(employee.Id);
            if (existingEmployee == null || !existingEmployee.IsActive)
            {
                return false;
            }

            existingEmployee.FirstName = employee.FirstName;
            existingEmployee.LastName = employee.LastName;
            existingEmployee.Title = employee.Title;
            existingEmployee.Email = employee.Email;
            existingEmployee.PhoneNumber = employee.PhoneNumber;
            existingEmployee.HomeAddress = employee.HomeAddress;
            existingEmployee.DropOffPoint = employee.DropOffPoint;
            existingEmployee.DropOffLatitude = employee.DropOffLatitude;
            existingEmployee.DropOffLongitude = employee.DropOffLongitude;
            existingEmployee.NearestPublicTransport = employee.NearestPublicTransport;
            existingEmployee.Notes = employee.Notes;
            existingEmployee.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteEmployeeAsync(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return false;
            }

            // Soft delete
            employee.IsActive = false;
            employee.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
