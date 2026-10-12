// There are no accounts yet: every record belongs to one default user,
// created by the seed (ADR-0014).

export const defaultUserId = "default-user";

/** The user the current request acts for; always the default user for now. */
export async function getCurrentUserId(): Promise<string> {
	return defaultUserId;
}
