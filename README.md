# Shipping Time Estimator

![Shipping Time Estimator Logo](https://via.placeholder.com/150?text=Shipping+Time)

## Overview

The Shipping Time Estimator is a web application that helps Quill & Pigeon customers determine optimal "reminder days" for sending greeting cards to ensure timely delivery for important events. The system factors in delivery routes, processing times, and shipping methods to calculate the ideal purchase date, enhancing customer experience through automated shipping timeline calculations.

## Features

### Customer Features
- 📅 **Event Date Planning**: Enter event dates and recipient addresses to determine optimal order timing
- 🚚 **Shipping Method Comparison**: View estimates across different shipping options (standard, priority)
- 📊 **Visual Timeline**: Receive clear "order by" dates accounting for all processing and shipping times
- 🔄 **Shipping Destination Toggle**: Choose between shipping directly to recipient or to yourself first
- 📝 **Address Book**: Save frequent recipients' addresses for future orders

### Admin Features
- ⚙️ **Processing Time Configuration**: Update default processing times for different card types
- 📈 **Analytics Dashboard**: View shipping calculations and timelines across regions
- 🔧 **Manual Overrides**: Adjust shipping estimates during peak seasons or service disruptions
- ➕ **Carrier Management**: Add and manage new shipping carriers and options
- 📤 **Data Export**: Generate reports on shipping timeline data

## Tech Stack

### Frontend
- React.js
- TypeScript
- Modern CSS with responsive design

### Backend
- Node.js with Express.js
- RESTful API architecture
- PostgreSQL database

### Deployment
- AWS Lambda for serverless functions
- AWS API Gateway
- AWS S3 for static assets

### Integration
- Shippo API for shipping time calculations

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (v13 or higher)
- AWS account (for deployment)

### Local Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/ayushreddy0126/Shipping-Time-Estimator.git
   cd Shipping-Time-Estimator
   ```

2. Install dependencies
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables
   ```bash
   # In the server directory, create a .env file
   cp .env.example .env
   # Edit the .env file with your database and API credentials
   ```

4. Set up the database
   ```bash
   # In the server directory
   npm run db:setup
   ```

5. Start the development servers
   ```bash
   # Start the backend server (from server directory)
   npm run dev

   # Start the frontend server (from client directory)
   npm start
   ```

6. Access the application at `http://localhost:3000`

## API Endpoints

The application provides the following RESTful API endpoints:

- `GET /api/shipping-estimate`: Calculate shipping time based on parameters
- `GET /api/carriers`: Retrieve available shipping carriers and methods
- `POST /api/saved-addresses`: Save a recipient address for future use
- `GET /api/processing-times`: Retrieve current processing times
- `PUT /api/admin/processing-times`: Update processing time configuration (admin only)
- `PUT /api/admin/shipping-overrides`: Set temporary shipping time overrides (admin only)

Detailed API documentation is available in the [API Documentation](docs/api.md) file.

## Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## Deployment

### AWS Deployment

1. Configure AWS credentials
   ```bash
   aws configure
   ```

2. Deploy the application
   ```bash
   npm run deploy
   ```

Detailed deployment instructions are available in the [Deployment Guide](docs/deployment.md).

## Project Structure

```
shipping-time-estimator/
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── components/     # Reusable UI components
│       ├── pages/          # Application pages
│       ├── services/       # API service integrations
│       └── utils/          # Utility functions
├── server/                 # Backend Node.js/Express application
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   └── services/           # Business logic services
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and contribution process.

## Team

- **Chaoyi Jiang** - Team Lead
- **Mandadi Ayush Reddy**
- **Yongzhen Zhang**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Shippo API for shipping time calculations
- All contributors who have helped shape this project
