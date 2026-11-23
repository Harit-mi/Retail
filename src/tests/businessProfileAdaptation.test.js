import { describe, it, expect } from "vitest";
import { getBusinessProfile } from "../config/businessProfiles";

describe("Business Profile Dynamic Adaptation Suite", () => {
  it("enforces that Electronics business type strictly NEVER allows kg or weighing scales", () => {
    const profile = getBusinessProfile("electronics");
    expect(profile.id).toBe("electronics");
    expect(profile.showKgs).toBe(false);
    expect(profile.hasWeighingScale).toBe(false);

    // Verify units: must NOT contain kg, gm, ltr, or ml
    expect(profile.allowedUnits).not.toContain("kg");
    expect(profile.allowedUnits).not.toContain("gm");
    expect(profile.allowedUnits).not.toContain("ltr");
    expect(profile.allowedUnits).not.toContain("ml");
    expect(profile.allowedUnits).toEqual(["Pcs", "Box", "Set", "Pack"]);

    // Verify primary attributes: must contain IMEI and Serial number tracking
    const attrKeys = profile.primaryAttributes.map((a) => a.key);
    expect(attrKeys).toContain("imei");
    expect(attrKeys).toContain("serial_no");
    expect(attrKeys).toContain("warranty_months");

    // Verify quick presets: no kg units, only discrete electronics items
    profile.quickPresets.forEach((preset) => {
      expect(preset.unit).not.toBe("kg");
      expect(preset.unit).not.toBe("gm");
      expect(preset.unit).not.toBe("ltr");
      expect(["Pcs", "Box", "Set", "Pack"]).toContain(preset.unit);
    });

    // Verify warranty terms
    expect(profile.invoiceTerms.toLowerCase()).toContain("warranty");
    expect(profile.invoiceTerms.toLowerCase()).toContain("imei");
  });

  it("enforces that Supermarket business type correctly enables kgs, decimals, and weighing scales", () => {
    const profile = getBusinessProfile("supermarket");
    expect(profile.id).toBe("supermarket");
    expect(profile.showKgs).toBe(true);
    expect(profile.hasWeighingScale).toBe(true);

    expect(profile.allowedUnits).toContain("kg");
    expect(profile.allowedUnits).toContain("gm");
    expect(profile.allowedUnits).toContain("ltr");

    // Presets should include produce with kg
    const kgPreset = profile.quickPresets.find((p) => p.unit === "kg");
    expect(kgPreset).toBeDefined();
    expect(kgPreset.name.toLowerCase()).toContain("produce");
  });

  it("enforces Fashion & Apparel business type attributes and units", () => {
    const profile = getBusinessProfile("apparel");
    expect(profile.showKgs).toBe(false);
    expect(profile.hasWeighingScale).toBe(false);
    expect(profile.allowedUnits).not.toContain("kg");
    expect(profile.allowedUnits).toContain("Pair");
    expect(profile.allowedUnits).toContain("Pcs");

    const attrKeys = profile.primaryAttributes.map((a) => a.key);
    expect(attrKeys).toContain("size");
    expect(attrKeys).toContain("color");
    expect(attrKeys).toContain("brand");
  });

  it("enforces Pharmacy business type attributes and units", () => {
    const profile = getBusinessProfile("pharmacy");
    expect(profile.showKgs).toBe(false);
    expect(profile.hasWeighingScale).toBe(false);
    expect(profile.allowedUnits).not.toContain("kg");
    expect(profile.allowedUnits).toContain("Strip");
    expect(profile.allowedUnits).toContain("Bottle");

    const attrKeys = profile.primaryAttributes.map((a) => a.key);
    expect(attrKeys).toContain("batch_no");
    expect(attrKeys).toContain("expiry_date");
  });

  it("handles case-insensitive and alias lookups safely", () => {
    expect(getBusinessProfile("ELECTRONICS").id).toBe("electronics");
    expect(getBusinessProfile("clothing").id).toBe("apparel");
    expect(getBusinessProfile("UNKNOWN_TYPE").id).toBe("supermarket"); // fallback safe
    expect(getBusinessProfile(null).id).toBe("supermarket");
  });
});
