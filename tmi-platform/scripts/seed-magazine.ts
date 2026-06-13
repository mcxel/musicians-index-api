const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ARTICLES = [
  {
    title: "Wavetek's Rise on the Billboard: An Inside Look",
    slug: "wavetek-rise-billboard",
    subtitle: "Breaking down the metrics behind the fastest climb in TMI history.",
    content: JSON.stringify({
      blocks: [
        { type: "paragraph", data: { text: "Wavetek has officially dominated the Digital Hip-Hop Night. The live crowd intent engine registered off-the-charts metrics..." } }
      ]
    }),
    status: "PUBLISHED",
    publishedAt: new Date(),
  },
  {
    title: "Neon Vibe Monday Stage: The New Era of Digital Cyphers",
    slug: "neon-vibe-monday-stage",
    subtitle: "Why millions are tuning in to watch unfiltered bars drop live.",
    content: JSON.stringify({
      blocks: [
        { type: "paragraph", data: { text: "The cypher format has been revitalized by the TMI Arena. With seamless WebRTC drops and real-time voting, performers are seeing..." } }
      ]
    }),
    status: "PUBLISHED",
    publishedAt: new Date(),
  },
  {
    title: "Beat Marketplace Economy: How Producers are Scaling to $10k/mo",
    slug: "beat-marketplace-economy",
    subtitle: "From bedroom studios to global placements—the data behind the boom.",
    content: JSON.stringify({
      blocks: [
        { type: "paragraph", data: { text: "With the introduction of the TMI Beat Vault, producers no longer have to chase down royalties. The automated Stripe webhook..." } }
      ]
    }),
    status: "PUBLISHED",
    publishedAt: new Date(),
  }
];

async function main() {
  console.log("📰 Injecting Magazine Editorial Seed Data...");
  
  // Create a default STAFF user if one doesn't exist to act as the Author
  let author = await prisma.user.findFirst({ where: { role: 'STAFF' } });
  if (!author) {
    author = await prisma.user.create({
      data: {
        email: "editor@themusiciansindex.com",
        name: "TMI Editorial Team",
        role: "STAFF",
        onboardingState: "COMPLETE"
      }
    });
  }

  let count = 0;
  for (const article of ARTICLES) {
    const exists = await prisma.article.findUnique({ where: { slug: article.slug } });
    if (!exists) {
      await prisma.article.create({
        data: {
          ...article,
          authorId: author.id,
        }
      });
      count++;
    }
  }

  console.log(`✅ Successfully seeded ${count} new editorials into the Magazine Content Rotation Engine.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });