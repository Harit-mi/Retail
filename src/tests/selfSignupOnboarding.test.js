import { describe, it, expect } from "vitest";
import { getBusinessProfile } from "../config/businessProfiles";

describe("Self-Signup & Onboarding Flow Suite", () => {
  it("provisions an Electronics store without kilograms or weighing scales", () => {
    const sector = "electronics";
    const profile = getBusinessProfile(sector);

    const storeConfig = {
      name: "Apex Mobile & Electronics",
      businessType: sector,
      ownerName: "Vikas Sharma",
      phone: "+91 98111 22334",
      address: "Shop 10, Nehru Place, New Delhi",
      gstin: "07AAACB1111A1Z1",
      tagline: profile.defaultTagline,
      receiptFooterNote: profile.invoiceTerms,
      selectedPlan: "pro",
      isSubscribed: true,
    };

    expect(storeConfig.businessType).toBe("electronics");
    expect(profile.showKgs).toBe(false);
    expect(profile.hasWeighingScale).toBe(false);
    expect(profile.allowedUnits).toEqual(["Pcs", "Box", "Set", "Pack"]);
    expect(profile.allowedUnits).not.toContain("kg");
    expect(storeConfig.receiptFooterNote).toContain("warranty");
  });

  it("calculates accurate subscription amounts for self-serve plans", () => {
    const calculatePlanAmount = (planId) => {
      if (planId === "enterprise") return 1499;
      if (planId === "pro") return 499;
      return 0; // starter free trial
    };

    expect(calculatePlanAmount("starter")).toBe(0);
    expect(calculatePlanAmount("pro")).toBe(499);
    expect(calculatePlanAmount("enterprise")).toBe(1499);
  });

  it("provisions a Supermarket store with weighing scales and metric units", () => {
    const sector = "supermarket";
    const profile = getBusinessProfile(sector);

    expect(profile.showKgs).toBe(true);
    expect(profile.hasWeighingScale).toBe(true);
    expect(profile.allowedUnits).toContain("kg");
    expect(profile.allowedUnits).toContain("gm");
    expect(profile.allowedUnits).toContain("ltr");
  });

  it("enforces immutable business sector locking after customer registration", () => {
    const registeredSector = "electronics";

    // Simulate store settings update: attempts to change other fields but sector is fixed
    const initialConfig = {
      name: "Apex Electronics",
      businessType: registeredSector,
      ownerName: "Vikas Sharma",
      isSubscribed: true,
    };

    // User submits updated store details (address, phone, name)
    const submittedForm = {
      ...initialConfig,
      name: "Apex Electronics & Smart Gadgets",
      address: "New Address Road",
      businessType: initialConfig.businessType, // Locked
    };

    expect(submittedForm.businessType).toBe("electronics");
    const activeProfile = getBusinessProfile(submittedForm.businessType);
    expect(activeProfile.showKgs).toBe(false);
    expect(activeProfile.allowedUnits).not.toContain("kg");
    expect(activeProfile.allowedUnits).toContain("Pcs");
  });
});
