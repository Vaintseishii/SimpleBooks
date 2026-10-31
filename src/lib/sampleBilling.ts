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

// Saved as Invoice.paymentMethod (a plain string) when the invoice is created
export type PaymentMethod = {
    id: string;
    label: string; // what the select shows
    title: string; // heading on the invoice
    detail: string; // line under the heading
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

export const samplePaymentMethods: PaymentMethod[] = [
    { id: "bank", label: "Bank transfer · Checking •• 4821", title: "Payment by bank transfer", detail: "Alder Studio · Checking ending 4821" },
    { id: "card", label: "Card payment · Online link", title: "Payment by card", detail: "Pay securely with the card link in your invoice email" },
    { id: "check", label: "Check · Mailed", title: "Payment by check", detail: "Make checks payable to Alder Studio, Portland, Oregon" },
];