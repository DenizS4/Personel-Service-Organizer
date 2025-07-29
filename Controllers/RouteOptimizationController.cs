using Microsoft.AspNetCore.Mvc;
using BusOrganizer.Models;
using BusOrganizer.Services;

namespace BusOrganizer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RouteOptimizationController : ControllerBase
    {
        private readonly IRouteOptimizationService _routeOptimizationService;
        
        public RouteOptimizationController(IRouteOptimizationService routeOptimizationService)
        {
            _routeOptimizationService = routeOptimizationService;
        }
        
        [HttpPost("optimize")]
        public async Task<ActionResult<List<OptimizedRoute>>> OptimizeRoutes([FromBody] RouteOptimizationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            try
            {
                var optimizedRoutes = await _routeOptimizationService.OptimizeRoutesAsync(request);
                return Ok(optimizedRoutes);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error optimizing routes: {ex.Message}");
            }
        }
        
        [HttpPost("save-assignments")]
        public async Task<IActionResult> SaveRouteAssignments([FromBody] List<OptimizedRoute> routes)
        {
            try
            {
                await _routeOptimizationService.SaveRouteAssignmentsAsync(routes);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error saving route assignments: {ex.Message}");
            }
        }
        
        [HttpGet("assignments")]
        public async Task<ActionResult<List<RouteAssignment>>> GetRouteAssignments()
        {
            var assignments = await _routeOptimizationService.GetRouteAssignmentsAsync();
            return Ok(assignments);
        }
    }
}
