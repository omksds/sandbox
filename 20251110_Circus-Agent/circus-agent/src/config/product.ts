export type ProductIdentity = {
  name: string;
  shortName: string;
  description: string;
  tagline: string;
  supportEmail: string;
};

/**
 * Centralized product identity so the placeholder name can be swapped later
 * without hunting through components. Override via NEXT_PUBLIC_PRODUCT_NAME.
 */
const fallbackName = process.env.NEXT_PUBLIC_PRODUCT_NAME ?? "Cube Agent";

export const productIdentity: ProductIdentity = {
  name: fallbackName,
  shortName: fallbackName,
  description:
    "B2B SaaS ATS that enables recruiters and hiring companies to share candidates and selection progress in real time.",
  tagline: "Collaborative ATS workspace for agencies and hiring teams",
  supportEmail: "support@example.com",
};
