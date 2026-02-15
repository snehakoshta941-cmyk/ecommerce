# E-Commerce Admin Panel

Modern, responsive admin panel for e-commerce management built with React, Vite, and Tailwind CSS.

## Features

- 📊 Dashboard with real-time statistics
- 📦 Product Management (CRUD operations)
- 👥 User Management
- 📋 Order Management with status tracking
- 🚚 Shipment & Returns Management
- 🎫 Coupon Management
- 📂 Category & Subcategory Management
- 📊 Reports & Analytics
- 🔔 Notifications
- 🎫 Support Tickets
- 📧 Email Templates
- ⚙️ Settings & Configuration
- 🔒 GDPR Compliance
- 📊 Tax Reports
- 📝 Audit Logs

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (default: http://192.168.1.3:5000/api)

## Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd admin-mern2
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:
```
VITE_API_URL=http://your-backend-url:5000/api
```

4. Start development server
```bash
npm run dev
```

The admin panel will be available at `http://localhost:3001`

## Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Default Admin Credentials

```
Email: admin@ecommerce.com
Password: admin123
```

**⚠️ Important**: Change these credentials in production!

## Project Structure

```
admin-mern2/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── .env.example        # Environment variables template
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
└── tailwind.config.js  # Tailwind configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### Product Management
- Add, edit, delete products
- Image upload support
- Category assignment
- Stock management
- Visibility toggle
- Backend search integration

### Order Management
- View all orders
- Update order status
- Track shipments
- Process returns
- Generate invoices

### User Management
- View all users
- User details
- Account management
- Activity tracking

### Reports & Analytics
- Sales reports
- Revenue analytics
- Product performance
- User statistics

## API Integration

The admin panel connects to a Node.js/Express backend. Configure the API URL in `.env`:

```
VITE_API_URL=http://your-backend-url:5000/api
```

## Responsive Design

The admin panel is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@yourdomain.com or open an issue in the repository.

## Acknowledgments

- React Team
- Vite Team
- Tailwind CSS Team
- Lucide Icons Team
