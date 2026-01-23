import { defineConfig } from 'orval';

export default defineConfig({
    api: {
        input: 'http://localhost:3000/api/docs-json',
        output: {
            target: './src/lib/api/generated.ts',
            client: 'react-query',
            baseUrl: '/api',
        },
    },
});
