import { createFileRoute } from '@tanstack/react-router';
import { Login } from '@/routes/auth/login';

export const Route = createFileRoute('/')({
    component: Login,
});
