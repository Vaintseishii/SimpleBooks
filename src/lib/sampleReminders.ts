// Sample reminder history until there's a reminder router (or a lastReminderAt column).
// Keyed by invoice id: when the last reminder email went out.

export const sampleReminderHistory: Record<string, Date> = {
    "1048": new Date(2026, 9, 7),
};

// Signs the reminder email. Later: the signed-in user's first name + workspace name.
export const sampleSender = "Maya · Alder Studio";