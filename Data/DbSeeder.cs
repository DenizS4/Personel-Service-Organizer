using BusOrganizer.Models;
using Microsoft.EntityFrameworkCore;

namespace BusOrganizer.Services
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(BusOrganizerDbContext context)
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();

            // Check if data already exists
            if (await context.Cars.AnyAsync() || await context.Employees.AnyAsync())
            {
                return; // Database has been seeded
            }

            // Seed Cars
            var cars = new List<Car>
            {
                new Car
                {
                    Model = "Mercedes Sprinter 2023",
                    PlateNumber = "BUS-001",
                    Capacity = 15,
                    Color = "White",
                    Year = 2023,
                    Notes = "New luxury bus with AC and WiFi",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Car
                {
                    Model = "Ford Transit 2022",
                    PlateNumber = "BUS-002",
                    Capacity = 12,
                    Color = "Blue",
                    Year = 2022,
                    Notes = "Reliable mid-size bus",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Car
                {
                    Model = "Volkswagen Crafter 2023",
                    PlateNumber = "BUS-003",
                    Capacity = 18,
                    Color = "Silver",
                    Year = 2023,
                    Notes = "Large capacity bus for main routes",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Car
                {
                    Model = "Iveco Daily 2021",
                    PlateNumber = "BUS-004",
                    Capacity = 10,
                    Color = "Red",
                    Year = 2021,
                    Notes = "Compact bus for small groups",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Car
                {
                    Model = "Mercedes Vito 2022",
                    PlateNumber = "BUS-005",
                    Capacity = 8,
                    Color = "Black",
                    Year = 2022,
                    Notes = "Executive transport vehicle",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            await context.Cars.AddRangeAsync(cars);

            // Seed Employees with realistic NYC area locations
            var employees = new List<Employee>
            {
                // Manhattan employees
                new Employee
                {
                    FirstName = "John",
                    LastName = "Smith",
                    Title = "Software Engineer",
                    Email = "john.smith@company.com",
                    PhoneNumber = "+1-555-0101",
                    HomeAddress = "123 West 42nd Street, New York, NY 10036",
                    DropOffPoint = "Times Square, New York, NY",
                    DropOffLatitude = 40.7580,
                    DropOffLongitude = -73.9855,
                    NearestPublicTransport = "Times Square-42nd Street Subway Station",
                    Notes = "Prefers morning pickup",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Sarah",
                    LastName = "Johnson",
                    Title = "Product Manager",
                    Email = "sarah.johnson@company.com",
                    PhoneNumber = "+1-555-0102",
                    HomeAddress = "456 Park Avenue, New York, NY 10022",
                    DropOffPoint = "Central Park South, New York, NY",
                    DropOffLatitude = 40.7661,
                    DropOffLongitude = -73.9797,
                    NearestPublicTransport = "59th Street-Columbus Circle Station",
                    Notes = "Flexible pickup time",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Michael",
                    LastName = "Brown",
                    Title = "Data Analyst",
                    Email = "michael.brown@company.com",
                    PhoneNumber = "+1-555-0103",
                    HomeAddress = "789 Broadway, New York, NY 10003",
                    DropOffPoint = "Union Square, New York, NY",
                    DropOffLatitude = 40.7359,
                    DropOffLongitude = -73.9911,
                    NearestPublicTransport = "Union Square-14th Street Station",
                    Notes = "Early bird - prefers 7:30 AM pickup",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Emily",
                    LastName = "Davis",
                    Title = "UX Designer",
                    Email = "emily.davis@company.com",
                    PhoneNumber = "+1-555-0104",
                    HomeAddress = "321 East 14th Street, New York, NY 10003",
                    DropOffPoint = "East Village, New York, NY",
                    DropOffLatitude = 40.7295,
                    DropOffLongitude = -73.9876,
                    NearestPublicTransport = "1st Avenue Station",
                    Notes = "Lives near East Village",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "David",
                    LastName = "Wilson",
                    Title = "Marketing Director",
                    Email = "david.wilson@company.com",
                    PhoneNumber = "+1-555-0105",
                    HomeAddress = "654 5th Avenue, New York, NY 10019",
                    DropOffPoint = "Rockefeller Center, New York, NY",
                    DropOffLatitude = 40.7587,
                    DropOffLongitude = -73.9787,
                    NearestPublicTransport = "47-50th Streets Rockefeller Center",
                    Notes = "Works late, flexible morning schedule",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },

                // Brooklyn employees
                new Employee
                {
                    FirstName = "Jessica",
                    LastName = "Miller",
                    Title = "HR Manager",
                    Email = "jessica.miller@company.com",
                    PhoneNumber = "+1-555-0106",
                    HomeAddress = "987 Atlantic Avenue, Brooklyn, NY 11238",
                    DropOffPoint = "Prospect Heights, Brooklyn, NY",
                    DropOffLatitude = 40.6782,
                    DropOffLongitude = -73.9442,
                    NearestPublicTransport = "Atlantic Avenue-Barclays Center",
                    Notes = "Lives in Prospect Heights",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Robert",
                    LastName = "Garcia",
                    Title = "DevOps Engineer",
                    Email = "robert.garcia@company.com",
                    PhoneNumber = "+1-555-0107",
                    HomeAddress = "246 Court Street, Brooklyn, NY 11201",
                    DropOffPoint = "Brooklyn Heights, Brooklyn, NY",
                    DropOffLatitude = 40.6962,
                    DropOffLongitude = -73.9969,
                    NearestPublicTransport = "Court Street-Borough Hall",
                    Notes = "Brooklyn Heights resident",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Lisa",
                    LastName = "Rodriguez",
                    Title = "Financial Analyst",
                    Email = "lisa.rodriguez@company.com",
                    PhoneNumber = "+1-555-0108",
                    HomeAddress = "135 Flatbush Avenue, Brooklyn, NY 11217",
                    DropOffPoint = "Fort Greene, Brooklyn, NY",
                    DropOffLatitude = 40.6892,
                    DropOffLongitude = -73.9734,
                    NearestPublicTransport = "Fort Greene-Fulton Street",
                    Notes = "Fort Greene area",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "James",
                    LastName = "Martinez",
                    Title = "Sales Manager",
                    Email = "james.martinez@company.com",
                    PhoneNumber = "+1-555-0109",
                    HomeAddress = "468 5th Avenue, Brooklyn, NY 11215",
                    DropOffPoint = "Park Slope, Brooklyn, NY",
                    DropOffLatitude = 40.6736,
                    DropOffLongitude = -73.9796,
                    NearestPublicTransport = "Union Street Station",
                    Notes = "Park Slope resident",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Amanda",
                    LastName = "Anderson",
                    Title = "Content Writer",
                    Email = "amanda.anderson@company.com",
                    PhoneNumber = "+1-555-0110",
                    HomeAddress = "792 Bedford Avenue, Brooklyn, NY 11205",
                    DropOffPoint = "Williamsburg, Brooklyn, NY",
                    DropOffLatitude = 40.7081,
                    DropOffLongitude = -73.9571,
                    NearestPublicTransport = "Bedford Avenue Station",
                    Notes = "Williamsburg area",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },

                // Queens/Center City employees
                new Employee
                {
                    FirstName = "Christopher",
                    LastName = "Taylor",
                    Title = "System Administrator",
                    Email = "christopher.taylor@company.com",
                    PhoneNumber = "+1-555-0111",
                    HomeAddress = "159 Northern Boulevard, Queens, NY 11354",
                    DropOffPoint = "Flushing, Queens, NY",
                    DropOffLatitude = 40.7678,
                    DropOffLongitude = -73.8333,
                    NearestPublicTransport = "Flushing-Main Street Station",
                    Notes = "Flushing resident",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Michelle",
                    LastName = "Thomas",
                    Title = "Business Analyst",
                    Email = "michelle.thomas@company.com",
                    PhoneNumber = "+1-555-0112",
                    HomeAddress = "357 Queens Boulevard, Queens, NY 11377",
                    DropOffPoint = "Elmhurst, Queens, NY",
                    DropOffLatitude = 40.7362,
                    DropOffLongitude = -73.8826,
                    NearestPublicTransport = "Elmhurst Avenue Station",
                    Notes = "Elmhurst area",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Kevin",
                    LastName = "Jackson",
                    Title = "Quality Assurance",
                    Email = "kevin.jackson@company.com",
                    PhoneNumber = "+1-555-0113",
                    HomeAddress = "741 Roosevelt Avenue, Queens, NY 11372",
                    DropOffPoint = "Jackson Heights, Queens, NY",
                    DropOffLatitude = 40.7557,
                    DropOffLongitude = -73.8831,
                    NearestPublicTransport = "Roosevelt Avenue-Jackson Heights",
                    Notes = "Jackson Heights resident",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Nicole",
                    LastName = "White",
                    Title = "Project Manager",
                    Email = "nicole.white@company.com",
                    PhoneNumber = "+1-555-0114",
                    HomeAddress = "852 Astoria Boulevard, Queens, NY 11369",
                    DropOffPoint = "Astoria, Queens, NY",
                    DropOffLatitude = 40.7648,
                    DropOffLongitude = -73.9442,
                    NearestPublicTransport = "Astoria Boulevard Station",
                    Notes = "Astoria resident",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Daniel",
                    LastName = "Harris",
                    Title = "Database Administrator",
                    Email = "daniel.harris@company.com",
                    PhoneNumber = "+1-555-0115",
                    HomeAddress = "963 Skillman Avenue, Queens, NY 11101",
                    DropOffPoint = "Long Island City, Queens, NY",
                    DropOffLatitude = 40.7505,
                    DropOffLongitude = -73.9426,
                    NearestPublicTransport = "Queensboro Plaza",
                    Notes = "Long Island City area",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },

                // Additional employees in various locations
                new Employee
                {
                    FirstName = "Rachel",
                    LastName = "Clark",
                    Title = "Graphic Designer",
                    Email = "rachel.clark@company.com",
                    PhoneNumber = "+1-555-0116",
                    HomeAddress = "147 Lexington Avenue, New York, NY 10016",
                    DropOffPoint = "Gramercy Park, New York, NY",
                    DropOffLatitude = 40.7368,
                    DropOffLongitude = -73.9830,
                    NearestPublicTransport = "23rd Street Station",
                    Notes = "Gramercy area",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Steven",
                    LastName = "Lewis",
                    Title = "Network Engineer",
                    Email = "steven.lewis@company.com",
                    PhoneNumber = "+1-555-0117",
                    HomeAddress = "258 Grand Street, Brooklyn, NY 11211",
                    DropOffPoint = "Williamsburg Bridge, Brooklyn, NY",
                    DropOffLatitude = 40.7133,
                    DropOffLongitude = -73.9630,
                    NearestPublicTransport = "Grand Street Station",
                    Notes = "Near Williamsburg Bridge",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Karen",
                    LastName = "Walker",
                    Title = "Operations Manager",
                    Email = "karen.walker@company.com",
                    PhoneNumber = "+1-555-0118",
                    HomeAddress = "369 86th Street, Brooklyn, NY 11209",
                    DropOffPoint = "Bay Ridge, Brooklyn, NY",
                    DropOffLatitude = 40.6323,
                    DropOffLongitude = -74.0235,
                    NearestPublicTransport = "86th Street Station",
                    Notes = "Bay Ridge resident",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Brian",
                    LastName = "Hall",
                    Title = "Security Specialist",
                    Email = "brian.hall@company.com",
                    PhoneNumber = "+1-555-0119",
                    HomeAddress = "741 Forest Avenue, Staten Island, NY 10310",
                    DropOffPoint = "St. George, Staten Island, NY",
                    DropOffLatitude = 40.6436,
                    DropOffLongitude = -74.0736,
                    NearestPublicTransport = "St. George Terminal",
                    Notes = "Staten Island resident",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Jennifer",
                    LastName = "Young",
                    Title = "Customer Success Manager",
                    Email = "jennifer.young@company.com",
                    PhoneNumber = "+1-555-0120",
                    HomeAddress = "852 Westchester Avenue, Bronx, NY 10455",
                    DropOffPoint = "South Bronx, Bronx, NY",
                    DropOffLatitude = 40.8176,
                    DropOffLongitude = -73.9182,
                    NearestPublicTransport = "3rd Avenue-149th Street",
                    Notes = "Bronx resident",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            await context.Employees.AddRangeAsync(employees);
            await context.SaveChangesAsync();
        }
    }
}
