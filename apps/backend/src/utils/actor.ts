/**
 * The authenticated principal performing an action, as injected by the auth
 * macro (`{ user }` in the route context). Shared by services that gate
 * mutations on ownership or the `admin` role.
 */
export interface Actor {
    id: string;
    role?: string;
}
