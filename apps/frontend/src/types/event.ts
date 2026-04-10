export type SkillLabel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface UIEvent {
    id: number;
    name: string;
    sport: string;
    emoji: string;
    color: string;
    date: string;
    time: string;
    location: string;
    participants: number;
    capacity: number;
    interested: number;
    organizer: string;
    skill: SkillLabel;
    full?: boolean;
    cancelled?: boolean;
}
