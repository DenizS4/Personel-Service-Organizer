using BusOrganizer.Models;

namespace BusOrganizer.Services
{
    public interface IRouteOptimizationService
    {
        Task<List<OptimizedRoute>> OptimizeRoutesAsync(RouteOptimizationRequest request);
        Task SaveRouteAssignmentsAsync(List<OptimizedRoute> routes);
        Task<List<RouteAssignment>> GetRouteAssignmentsAsync();
    }
}
