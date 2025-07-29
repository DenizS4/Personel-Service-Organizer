# Bus Organizer - Personnel Service Management System

A comprehensive personnel service (bus) organizer built with Angular 18 frontend and .NET 8 Web API backend.

## Features

- **Car Management**: CRUD operations for fleet vehicles
- **Employee Management**: Manage employee information and pickup locations
- **Route Optimization**: AI-powered route planning with multiple alternatives
- **Map Integration**: Google Maps integration for route visualization
- **Responsive Design**: Modern UI that works on all devices

## Frontend (Angular 18)

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
\`\`\`bash
npm install
\`\`\`

### Development
\`\`\`bash
npm start
\`\`\`
Visit `http://localhost:4200`

### Build for Production
\`\`\`bash
npm run build
\`\`\`

## Backend (.NET 8 Web API)

See the `backend/` directory for backend setup instructions.

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist/bus-organizer-frontend`
4. Deploy!

### Backend Options
- **Azure App Service**: Recommended for .NET applications
- **Railway**: Simple deployment with database support
- **Heroku**: With buildpack for .NET
- **AWS Elastic Beanstalk**: Scalable option

## Environment Variables

### Frontend
- `API_URL`: Backend API URL

### Backend
- `ConnectionStrings__DefaultConnection`: Database connection string
- `ASPNETCORE_ENVIRONMENT`: Environment (Development/Production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
