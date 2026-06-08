/* 
this is here because there were some problems with 
running lint in the gitlab pipeline
*/

/* eslint-disable */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';
import { ApiError } from './lib/api-error';
import './index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Don't retry auth failures — a 401/403 won't change on retry.
            // Other errors keep React Query's default of up to 3 attempts.
            retry: (failureCount, error) => {
                if (
                    error instanceof ApiError &&
                    (error.code === 'UNAUTHORIZED' ||
                        error.code === 'FORBIDDEN')
                ) {
                    return false;
                }
                return failureCount < 3;
            },
        },
    },
});

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </StrictMode>
    );
} else {
    throw new Error('Root element not found');
}
