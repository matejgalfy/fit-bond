import { t } from 'elysia';

export const eventIdParam = t.Object({
    id: t.String({ format: 'uuid' }),
});

export const participantSchema = t.Object({
    id: t.String(),
    name: t.String(),
    image: t.Optional(t.Union([t.String(), t.Null()])),
});

export const participantsResponse = t.Array(participantSchema);

export const participationActionResponse = t.Object({
    success: t.Boolean(),
});

export type Participant = typeof participantSchema.static;
export type ParticipationActionResponse =
    typeof participationActionResponse.static;
