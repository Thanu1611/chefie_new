import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl, getDatabaseUrlHelp } from "./connection";
import { dishSteps, dishes, cuisines } from "./schema";
import { buildDishSeeds, CUISINE_SEED } from "./seed-data";

async function seed() {
  const url = getDatabaseUrl();
  if (!url) {
    console.error(getDatabaseUrlHelp());
    process.exit(1);
  }

  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client);

  console.log("Seeding cuisines...");
  await db.delete(dishSteps);
  await db.delete(dishes);
  await db.delete(cuisines);

  await db.insert(cuisines).values([...CUISINE_SEED]);

  const dishSeeds = buildDishSeeds();
  console.log(`Seeding ${dishSeeds.length} dishes...`);

  for (const dish of dishSeeds) {
    const { steps, ...dishRow } = dish;
    await db.insert(dishes).values(dishRow);
    await db.insert(dishSteps).values(
      steps.map((step, i) => ({
        dishId: dish.dishId,
        stepNumber: i + 1,
        title: step.title,
        instruction: step.instruction,
        breakTimeMinutes: step.breakTimeMinutes ?? 0,
        timerRequired: step.timerRequired ?? false,
        timerMinutes: step.timerMinutes ?? null,
      })),
    );
  }

  console.log("Seed complete.");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
