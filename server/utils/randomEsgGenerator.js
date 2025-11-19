// utils/randomEsgGenerator.js

// Generate a random integer between min & max
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate an array of N random numbers
function randArray(len, min, max) {
  return Array.from({ length: len }, () => rand(min, max));
}

export function generateRandomEsgData() {
  return {
    summary: {
      environmental: {
        totalEnergyConsumption: rand(10000000, 50000000), // MWh
        renewableEnergyShare: rand(10, 80),               // %
        carbonEmissions: rand(100000, 900000),            // tCO₂e
      },
      social: {
        supplierDiversity: rand(1, 10),                   // %
        customerSatisfaction: rand(40, 95),               // %
        humanCapital: rand(50, 100),                      // score
      },
      governance: {
        corporateGovernance: ["High", "Medium", "Low"][rand(0, 2)],
        iso9001Compliance: ["Yes", "No"][rand(0, 1)],
        businessEthics: ["High", "Moderate", "Low"][rand(0, 2)],
      },
    },

    metrics: {
      carbonTax: rand(1_000_000, 20_000_000),
      taxAllowances: rand(500_000, 5_000_000),
      carbonCredits: rand(5_000, 50_000),
      energySavings: rand(1_000_000, 8_000_000),
    },

    environmentalMetrics: {
      energyUsage: randArray(4, 10, 60),        // solar, diesel, electricity, coal
      emissions: randArray(4, 10, 120),         // mini bar chart
      waste: randArray(4, 10, 100),             // by waste type
      co2Emissions: randArray(12, 5000, 35000), // Jan–Dec
      production: randArray(12, 50000, 150000),
      waterUse: randArray(12, 1000, 20000),
      coalUse: randArray(12, 1000, 30000),
    },

    socialMetrics: {
      supplierDiversity: rand(1, 10),
      employeeEngagement: rand(40, 100),
      communityPrograms: rand(10, 100),
    },

    governanceMetrics: {
      corporateGovernance: ["Strong", "Moderate", "Weak"][rand(0, 2)],
      dataPrivacy: ["Compliant", "Partially Compliant", "Non-Compliant"][rand(0, 2)],
      isoCompliance: ["ISO 9001 Certified", "Pending", "Not Certified"][rand(0, 2)],
    },
  };
}
