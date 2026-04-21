import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';

export const Route = createRootRoute({
    component: () => (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Outlet />
        </ThemeProvider>
    ),
});
