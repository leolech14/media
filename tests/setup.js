// Disable logging during tests
process.env.NODE_ENV = 'test';

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.GOOGLE_API_KEY = 'test-google-key';
process.env.PEXELS_API_KEY = 'test-pexels-key';
process.env.GIPHY_API_KEY = 'test-giphy-key';
process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key';

// Global test timeout
jest.setTimeout(10000);