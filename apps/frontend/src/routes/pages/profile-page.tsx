import { createFileRoute } from '@tanstack/react-router'
import { ProfileCard } from '@/features/users/components/profile-card'

export const Route = createFileRoute('/pages/profile-page')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/pages/profile-page"!</div>
}
