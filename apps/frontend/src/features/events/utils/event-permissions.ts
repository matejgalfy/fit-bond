interface EventManagementInput {
    userId?: string;
    organizerId: string;
    isAdmin?: boolean;
}

export function canManageEvent({
    userId,
    organizerId,
    isAdmin = false,
}: EventManagementInput) {
    return Boolean(userId && (userId === organizerId || isAdmin));
}
