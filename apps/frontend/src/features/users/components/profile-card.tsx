import type { UserProfile } from "../../../../../backend/src/modules/users/users.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, LogOut, MapPin } from "lucide-react";

interface ProfileCardProps {
  user: UserProfile;
  isOwner?: boolean;
}

export function ProfileCard({ user, isOwner = true }: ProfileCardProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const primaryLocation = user.locations.find((l) => l.isPrimary) || user.locations[0];

  return (
    <Card className="w-full max-w-2xl border-border shadow-sm bg-card rounded-3xl p-6">
      <CardContent className="p-0 space-y-8">
        {/* Upper part: Avatar and Info */}
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--ring))] flex items-center justify-center text-primary-foreground text-3xl font-bold">
              {initials}
            </div>
            {isOwner && (
              <button className="absolute bottom-0 right-0 p-1.5 bg-background rounded-full border border-border shadow-sm hover:bg-accent transition-colors">
                <Pencil className="w-4 h-4 text-primary" />
              </button>
            )}
          </div>

          <div className="space-y-1 py-1">
            <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              {user.bio || "No bio yet."}
            </p>
          </div>
        </div>

        {/* Buttons */}
        {isOwner && (
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="rounded-xl border-primary text-primary hover:bg-primary/10 hover:text-primary px-6 font-semibold"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button 
              variant="outline" 
              className="rounded-xl border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive px-6 font-semibold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        )}

        {/* Sports */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Preferred Sports
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.sports.map((sport) => (
            <div 
              key={sport.id}
              className="px-4 py-1.5 rounded-full bg-badge-sport-bg text-badge-sport-text font-bold text-sm"
            >
              {sport.name}
            </div>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Preferred Location
          </h3>
          {primaryLocation && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-badge-location-bg font-semibold text-sm gap-2">
              <MapPin className="w-4 h-4 text-badge-location-text" />
              <span className="text-slate-700 dark:text-slate-300">
                {primaryLocation.city} · {primaryLocation.radius} km radius
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}