using Microsoft.AspNetCore.Mvc;
using BusOrganizer.Models;
using BusOrganizer.Services;

namespace BusOrganizer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarsController : ControllerBase
    {
        private readonly ICarService _carService;
        
        public CarsController(ICarService carService)
        {
            _carService = carService;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Car>>> GetCars()
        {
            var cars = await _carService.GetAllCarsAsync();
            return Ok(cars);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Car>> GetCar(int id)
        {
            var car = await _carService.GetCarByIdAsync(id);
            if (car == null)
            {
                return NotFound();
            }
            return Ok(car);
        }
        
        [HttpPost]
        public async Task<ActionResult<Car>> CreateCar(Car car)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var createdCar = await _carService.CreateCarAsync(car);
            return CreatedAtAction(nameof(GetCar), new { id = createdCar.Id }, createdCar);
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCar(int id, Car car)
        {
            if (id != car.Id)
            {
                return BadRequest();
            }
            
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var updated = await _carService.UpdateCarAsync(car);
            if (!updated)
            {
                return NotFound();
            }
            
            return NoContent();
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCar(int id)
        {
            var deleted = await _carService.DeleteCarAsync(id);
            if (!deleted)
            {
                return NotFound();
            }
            
            return NoContent();
        }
    }
}
