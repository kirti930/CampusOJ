import { prisma } from "@campusoj/db";
import { generateStarterCode, generateDriverCode, FunctionSignature } from "@campusoj/shared";

async function main() {
  console.log("🔍 Checking all problems in the database for missing function signatures...");
  const problems = await prisma.problem.findMany();

  let updatedCount = 0;
  for (const problem of problems) {
    if (!problem.functionSignature) {
      console.log(`  ⚙ Generating signature for problem: "${problem.title}" (${problem.slug})`);

      // Default signature based on problem slug
      let sig: FunctionSignature;
      if (problem.slug === "sum-of-two-numbers") {
        sig = {
          functionName: "sum",
          returnType: "int",
          parameters: [
            { name: "a", type: "int" },
            { name: "b", type: "int" },
          ],
        };
      } else if (problem.slug === "two-sum") {
        sig = {
          functionName: "twoSum",
          returnType: "number[]",
          parameters: [
            { name: "nums", type: "number[]" },
            { name: "target", type: "int" },
          ],
        };
      } else if (problem.slug === "binary-search") {
        sig = {
          functionName: "search",
          returnType: "int",
          parameters: [
            { name: "nums", type: "number[]" },
            { name: "target", type: "int" },
          ],
        };
      } else if (problem.slug === "maximum-subarray") {
        sig = {
          functionName: "maxSubArray",
          returnType: "int",
          parameters: [{ name: "nums", type: "number[]" }],
        };
      } else {
        // Generic fallback
        sig = {
          functionName: "solve",
          returnType: "string",
          parameters: [],
        };
      }

      const starterCode = {
        cpp: generateStarterCode(sig, "cpp"),
        java: generateStarterCode(sig, "java"),
        python3: generateStarterCode(sig, "python3"),
      };

      const driverCode = {
        cpp: generateDriverCode(sig, "cpp"),
        java: generateDriverCode(sig, "java"),
        python3: generateDriverCode(sig, "python3"),
      };

      await prisma.problem.update({
        where: { id: problem.id },
        data: {
          functionSignature: sig as any,
          starterCode: starterCode as any,
          driverCode: driverCode as any,
        },
      });
      updatedCount++;
    }
  }

  console.log(`✅ Verification complete: ${problems.length} total problems inspected, ${updatedCount} updated.`);
}

main()
  .catch((err) => {
    console.error("❌ Migration script error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
