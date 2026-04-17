import type { UserProfile } from "../../../../../backend/src/modules/users/users.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
interface ProfileCardProps {
  user: UserProfile;
  isOwner?: boolean;
}

export function BasicProfileCard({ user }: ProfileCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{bio}</p>
      </CardContent>
    </Card>
  );
}