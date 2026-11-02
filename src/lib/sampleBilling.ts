// Sample data for the New invoice form until the client + invoice routers are wired in.
// Shaped like the Prisma Client and Workspace models so the swap is easy later.

export type ClientOption = {
    id: string;
    name: string;
    contactName: string | null;
    email: string | null;
    address: string | null;
};

export type WorkspaceInfo = {
    name: string;
    tagline: string | null; // not in the Workspace model yet, shown on the invoice
    address: string | null;
    email: string | null;
    currency: string;
};

export const sampleWorkspace: WorkspaceInfo = {
    name: "Alder Studio",
    tagline: "Design for thoughtful businesses.",
    address: "Portland, Oregon",
    email: "maya@alderstudio.design",
    currency: "USD",
};

export const sampleClients: ClientOption[] = [
    { id: "c1", name: "Juniper Coffee", contactName: "Oliver James", email: "hello@juniper.coffee", address: "Portland, Oregon" },
    { id: "c2", name: "Bloom Wellness", contactName: "Ava Brooks", email: "studio@bloomwellness.co", address: "Seattle, Washington" },
    { id: "c3", name: "Forma Objects", contactName: "Leo Park", email: "leo@formaobjects.com", address: "Oakland, California" },
    { id: "c4", name: "Northstar Co.", contactName: "Priya Shah", email: "accounts@northstar.co", address: "Denver, Colorado" },
    { id: "c5", name: "Willow Home", contactName: "Hannah Lee", email: "hello@willowhome.shop", address: "Austin, Texas" },
    { id: "c6", name: "Arc Architecture", contactName: "Marcus Reed", email: "office@arc-architecture.com", address: "Chicago, Illinois" },
    { id: "c7", name: "Kin Collective", contactName: "Sofia Diaz", email: "team@kincollective.org", address: "Portland, Oregon" },
];