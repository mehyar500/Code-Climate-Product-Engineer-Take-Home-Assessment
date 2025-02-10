# Pull Request Explorer

A powerful web application that allows Engineering Directors to explore and analyze pull requests across their organization using the GitHub Search API.

## Features

- View up to 500 pull requests in a tabular format
- Real-time highlighting of at-risk PRs (open > 1 week)
- Advanced filtering capabilities:
  - Date range filtering
  - Status filtering (open/closed/merged)
  - Repository filtering
  - At-risk PR filtering
- Responsive and modern UI built with Material-UI
- Type-safe implementation using TypeScript
- Efficient data fetching with React Query

## Tech Stack

- React 19.0.0
- TypeScript 5.7.3
- Material-UI 6.4.3
- React Query 5.66.0
- Vite 6.1.0
- Vitest for testing
- dayjs for date handling
- Zod for runtime type validation

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- GitHub Personal Access Token (for API access)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pull-request-explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_GITHUB_TOKEN=your_github_token_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Testing

The project includes comprehensive test coverage using Vitest. Tests are organized by feature and include unit tests for utilities and integration tests for components.

Run tests:
```bash
npm test                 # Run all tests
npm test -- --coverage  # Run tests with coverage report
npm test -- --watch    # Run tests in watch mode
```

## Project Structure

```
src/
├── api/                    # API related code
│   ├── github.ts          # GitHub API client
│   └── types.ts           # API response types
├── components/            # React components
│   ├── common/           # Shared components
│   └── pr-explorer/      # PR Explorer specific components
├── hooks/                # Custom React hooks
├── utils/                # Utility functions
├── types/                # TypeScript types
└── tests/                # Test files
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm test`: Run tests

## API Endpoints

The application uses the following GitHub API endpoints:

### Search Pull Requests
```
GET /search/issues
```
Parameters:
- `q`: Search query (type:pr + filters)
- `per_page`: Results per page (max 100)
- `page`: Page number

Example query:
```
/search/issues?q=type:pr+repo:owner/repo+state:open+created:>=2024-01-01
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details