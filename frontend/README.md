# Car Dealership Frontend

A modern Next.js frontend application for a car dealership management system with user authentication, car browsing, and purchase capabilities.

## Features

- **Car Listings**: Browse cars with advanced filtering and search
- **Smart Filters**: Dropdowns populated with actual inventory data
- **Responsive Design**: Mobile-first design with collapsible sidebar
- **User Authentication**: JWT-based login/signup system
- **Car Details**: Individual car detail pages with purchase functionality
- **Real-time Filtering**: Client-side filtering for instant results
- **Modern UI**: Built with NextUI components and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: NextUI v2
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Language**: TypeScript
- **State Management**: React Context API

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Backend API running on `http://localhost:8000`

## Installation

1. **Navigate to frontend directory**:
   ```bash
   cd cse410phase-3/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
```

### Build for Production
```bash
npm run build
# or
yarn build
```

### Run Production Build
```bash
npm run start
# or
yarn start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── blog/              # Blog page
│   ├── car/[id]/          # Dynamic car detail pages
│   ├── pricing/           # Pricing page
│   ├── profile/           # User profile page
│   ├── signin/            # Sign in page
│   ├── signup/            # Sign up page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (car listings)
├── components/            # Reusable components
│   ├── navbar.tsx         # Navigation bar
│   ├── counter.tsx        # Counter component
│   ├── icons.tsx          # Icon components
│   ├── primitives.ts      # UI primitives
│   └── theme-switch.tsx   # Dark/light mode toggle
├── context/               # React Context providers
│   ├── InputContext.tsx   # Search input context
│   └── TokenContext.tsx   # Authentication context
├── config/                # Configuration files
│   ├── fonts.ts          # Font configuration
│   └── site.ts           # Site metadata
├── public/               # Static assets
├── styles/               # Global styles
│   └── globals.css
└── types/                # TypeScript type definitions
    └── index.ts
```

## Key Features

### Car Listings with Advanced Filtering
- **Smart Dropdowns**: Make, model, and year filters populated from actual inventory
- **Price Range**: Min/max price filtering
- **Mileage Range**: Min/max mileage filtering
- **Sorting Options**: Sort by price, year, or mileage (ascending/descending)
- **Search**: Text search across car names
- **Real-time Results**: Instant filtering without API calls

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Collapsible Sidebar**: Filters accessible on all screen sizes
- **Touch-friendly**: Large touch targets for mobile interaction

### User Authentication
- **JWT Tokens**: Secure authentication with automatic token management
- **Protected Routes**: Access control for authenticated features
- **User Profile**: View and edit user information

### Car Purchase System
- **Purchase Flow**: Integrated purchase functionality with modals
- **Error Handling**: Comprehensive error handling with user feedback
- **Authentication Required**: Protected purchase endpoints

## Configuration

### API Endpoint
Update the API base URL in components if your backend runs on a different port:
```typescript
const response = await fetch('http://localhost:8000/api/cars', {
  // ... options
});
```

### Styling
- **Theme Configuration**: Edit `tailwind.config.js` for custom themes
- **NextUI Setup**: Configuration in `app/layout.tsx`
- **Global Styles**: Located in `styles/globals.css`

## Environment Variables

Create a `.env.local` file for environment-specific variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Context Providers

### InputContext
Manages search input state across components:
```typescript
const { inputValue, setInputValue } = useInputContext();
```

### TokenContext
Manages authentication tokens:
```typescript
const { token, setToken } = useTokenContext();
```

## Components

### Car Listings (`app/page.tsx`)
- Main car browsing interface
- Client-side filtering and sorting
- Responsive grid layout
- Load more functionality

### Car Details (`app/car/[id]/page.tsx`)
- Individual car information
- Purchase functionality
- User authentication integration

### Navigation (`components/navbar.tsx`)
- Responsive navigation
- Authentication status
- Theme switching

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [HeroUI v2](https://heroui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips

1. **Hot Reloading**: Changes are automatically reflected in development
2. **TypeScript**: Full type safety throughout the application
3. **Component Isolation**: Each component is self-contained and reusable
4. **Mobile-first**: Design for mobile, enhance for desktop

## Troubleshooting

### Common Issues

1. **API Connection**: Ensure backend is running on `http://localhost:8000`
2. **CORS Errors**: Backend has CORS configured for frontend
3. **Authentication**: Check JWT token storage and expiration
4. **Styling Issues**: Clear browser cache and check Tailwind compilation

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@heroui/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## Contributing

1. Follow TypeScript best practices
2. Maintain component isolation
3. Update README for new features
4. Test on mobile devices

## License

This project is part of CSE410 coursework.
