# OpenAPI Forms TypeScript

A modern TypeScript React application that generates interactive forms from OpenAPI specifications, supporting all HTTP methods (GET, POST, PUT, PATCH, DELETE).

## Features

- 🚀 **Modern Stack**: Built with Next.js 14, TypeScript, and Tailwind CSS
- 📝 **Dynamic Form Generation**: Automatically generates forms from OpenAPI/Swagger schemas
- 🔄 **All HTTP Methods**: Supports GET, POST, PUT, PATCH, DELETE operations
- 🎨 **Beautiful UI**: Clean, responsive interface using shadcn/ui components
- 🔍 **Real-time Testing**: Test API endpoints directly from the browser
- 📊 **Response Viewer**: Detailed response inspection with headers and body
- ✏️ **Manual Override**: Edit request payloads manually with JSON editor
- 🎯 **Type Safety**: Full TypeScript support with proper type definitions

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Usage

1. **Enter OpenAPI URL**: Input your OpenAPI/Swagger specification URL
2. **Select Endpoint**: Choose from available endpoints with their HTTP methods
3. **Fill Form**: Complete the auto-generated form based on the schema
4. **Send Request**: Submit the request and view the response
5. **Manual Override**: Use the JSON editor for advanced request customization

## Supported Features

### HTTP Methods
- **GET**: Query parameters and path parameters
- **POST**: Request body with JSON schema validation
- **PUT**: Full resource updates
- **PATCH**: Partial resource updates  
- **DELETE**: Resource deletion with optional parameters

### Schema Types
- String (with enums, formats)
- Number/Integer (with min/max validation)
- Boolean (checkboxes)
- Object (nested forms)
- Array (JSON input with validation)

### Response Handling
- Status code indication with color coding
- Response body formatting (JSON/text)
- Response headers inspection
- Error handling and display

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx              # Main application page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── openapi-explorer.tsx  # Main OpenAPI interface
│   ├── endpoint-form.tsx     # Dynamic form component
│   ├── json-schema-form.tsx  # Schema-based form generator
│   ├── response-viewer.tsx   # Response display component
│   ├── request-override-modal.tsx # Manual JSON editor
│   └── ui/                   # shadcn/ui components
├── lib/
│   └── openapi-client.ts     # OpenAPI specification parser
├── types/
│   └── openapi.ts           # TypeScript type definitions
└── README.md
\`\`\`

## Configuration

The application automatically detects and parses OpenAPI 3.0+ specifications. It supports:

- Standard OpenAPI/Swagger JSON endpoints
- CORS-enabled APIs
- Authentication headers (can be extended)
- Custom request/response formats

## Development

### Adding New Features

1. **New HTTP Methods**: Extend the `HttpMethod` type in `types/openapi.ts`
2. **Schema Support**: Add new field types in `json-schema-form.tsx`
3. **Response Formats**: Enhance `response-viewer.tsx` for new content types
4. **Authentication**: Extend the OpenAPI client for auth headers

### Type Safety

The application uses strict TypeScript with proper type definitions for:
- OpenAPI specifications
- HTTP requests/responses  
- Form data validation
- Component props

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test thoroughly
5. Submit a pull request

## License

Apache 2.0 - See LICENSE file for details

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your API server has proper CORS headers
2. **Schema Loading**: Verify the OpenAPI URL is accessible and valid
3. **Form Validation**: Check that required fields are properly marked in the schema
4. **Response Parsing**: Some APIs may return non-JSON responses

### Development Tips

- Use the browser dev tools to inspect network requests
- Check the console for detailed error messages
- Verify OpenAPI schema validity using online validators
- Test with different API endpoints to ensure compatibility
