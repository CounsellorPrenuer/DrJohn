import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// The 15 Officer Like Qualities (SSB framework), grouped under the 4
// standard factors. See ASSUMPTIONS.md item 1 for the sourcing note.
const OLQS: { code: string; name: string; factor: string; description: string }[] = [
  { code: "EI", name: "Effective Intelligence", factor: "FACTOR_I_PLANNING", description: "Ability to apply intelligence practically to real-life situations." },
  { code: "REASONING", name: "Reasoning Ability", factor: "FACTOR_I_PLANNING", description: "Logical and structured approach to problem solving." },
  { code: "ORGANISING", name: "Organising Ability", factor: "FACTOR_I_PLANNING", description: "Ability to plan and coordinate resources toward a goal." },
  { code: "EXPRESSION", name: "Power of Expression", factor: "FACTOR_I_PLANNING", description: "Clarity and confidence in verbal and written communication." },
  { code: "COOPERATION", name: "Cooperation", factor: "FACTOR_II_SOCIAL_ADJUSTMENT", description: "Willingness to work constructively within a team." },
  { code: "RESPONSIBILITY", name: "Sense of Responsibility", factor: "FACTOR_II_SOCIAL_ADJUSTMENT", description: "Ownership of duties and accountability for outcomes." },
  { code: "INITIATIVE", name: "Initiative", factor: "FACTOR_II_SOCIAL_ADJUSTMENT", description: "Willingness to act without being prompted." },
  { code: "ADAPTABILITY", name: "Social Adaptability", factor: "FACTOR_III_SOCIAL_EFFECTIVENESS", description: "Ease of adjusting to new social environments and people." },
  { code: "LIVELINESS", name: "Liveliness", factor: "FACTOR_III_SOCIAL_EFFECTIVENESS", description: "Energy and enthusiasm brought to group settings." },
  { code: "INFLUENCE", name: "Group Influencing Ability", factor: "FACTOR_III_SOCIAL_EFFECTIVENESS", description: "Capacity to positively influence and lead a group." },
  { code: "DETERMINATION", name: "Determination", factor: "FACTOR_IV_DYNAMIC", description: "Persistence in pursuing goals despite obstacles." },
  { code: "COURAGE", name: "Courage", factor: "FACTOR_IV_DYNAMIC", description: "Willingness to take calculated risks and face adversity." },
  { code: "STAMINA", name: "Stamina", factor: "FACTOR_IV_DYNAMIC", description: "Physical and mental endurance under sustained pressure." },
  { code: "SELF_CONFIDENCE", name: "Self-Confidence", factor: "FACTOR_IV_DYNAMIC", description: "Belief in one's own abilities and judgement." },
  { code: "DECISION_SPEED", name: "Speed of Decision", factor: "FACTOR_IV_DYNAMIC", description: "Ability to decide quickly and appropriately under time pressure." },
];

// One sample question per OLQ — enough to exercise the full pipeline
// end-to-end. Replace with the licensed/full bank per ASSUMPTIONS.md item 2.
const SAMPLE_PROMPTS: Record<string, string> = {
  EI: "When faced with an unfamiliar problem, I quickly identify the practical steps needed to solve it.",
  REASONING: "I can break down a complex situation into its logical components before deciding.",
  ORGANISING: "I naturally take charge of coordinating tasks when a group project has no clear leader.",
  EXPRESSION: "I can explain a complex idea clearly to someone unfamiliar with the topic.",
  COOPERATION: "I adjust my own preferences to help a team reach a shared goal.",
  RESPONSIBILITY: "I follow through on commitments even when no one is checking on me.",
  INITIATIVE: "I start addressing a problem as soon as I notice it, without waiting for instructions.",
  ADAPTABILITY: "I feel comfortable in social settings with people very different from me.",
  LIVELINESS: "I bring energy and enthusiasm to group activities.",
  INFLUENCE: "Others often follow my suggestions in group discussions.",
  DETERMINATION: "I keep working toward a goal even after repeated setbacks.",
  COURAGE: "I am willing to take a difficult but necessary stand, even if unpopular.",
  STAMINA: "I can sustain high effort over long, demanding periods.",
  SELF_CONFIDENCE: "I trust my own judgement even under scrutiny from others.",
  DECISION_SPEED: "I can make a sound decision quickly when time is limited.",
};

async function main() {
  console.log("Seeding OLQs...");
  const olqRecords = new Map<string, { id: string }>();
  for (const olq of OLQS) {
    const rec = await prisma.oLQ.upsert({
      where: { code: olq.code },
      update: { name: olq.name, factor: olq.factor as never, description: olq.description },
      create: { ...olq, factor: olq.factor as never },
    });
    olqRecords.set(olq.code, rec);
  }

  console.log("Seeding module...");
  const module = await prisma.module.upsert({
    where: { slug: "core-olq-screener" },
    update: {},
    create: {
      slug: "core-olq-screener",
      title: "Core OLQ Screener",
      description: "A baseline self-assessment covering all 15 Officer Like Qualities.",
      order: 1,
    },
  });

  console.log("Seeding questions...");
  let order = 1;
  for (const [code, prompt] of Object.entries(SAMPLE_PROMPTS)) {
    const question = await prisma.question.upsert({
      where: { id: `seed-${code.toLowerCase()}` },
      update: { prompt, order },
      create: {
        id: `seed-${code.toLowerCase()}`,
        moduleId: module.id,
        prompt,
        type: "likert5",
        options: { min: 1, max: 5, minLabel: "Strongly disagree", maxLabel: "Strongly agree" },
        isSeedSample: true,
        order,
      },
    });

    const olq = olqRecords.get(code)!;
    await prisma.questionOLQ.upsert({
      where: { questionId_olqId: { questionId: question.id, olqId: olq.id } },
      update: { weight: 1.0 },
      create: { questionId: question.id, olqId: olq.id, weight: 1.0 },
    });

    order += 1;
  }

  console.log(`Seed complete: ${OLQS.length} OLQs, 1 module, ${Object.keys(SAMPLE_PROMPTS).length} questions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
