const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:H:/TRISULA_DIGIART/pc-workshop-hub/prisma/dev.db',
    },
  },
});

async function main() {
  try {
    const orders = await prisma.$queryRawUnsafe("SELECT productDetails FROM 'Order'");
    console.log(`Total orders found in old db: ${orders.length}`);

    const items = new Map();
    orders.forEach(o => {
      const lines = o.productDetails.split('\n');
      let title = '';
      let variant = '';
      lines.forEach(l => {
        l = l.trim();
        if (l.startsWith('•')) {
          title = l.replace('•', '').trim();
        } else if (l.startsWith('▶') || l.startsWith('-')) {
          variant = l.replace('▶', '').replace('Varian:', '').trim();
        } else if (l) {
          if (!title) title = l;
          else variant += ' ' + l;
        }
      });
      const key = `${title} [${variant}]`;
      items.set(key, (items.get(key) || 0) + 1);
    });

    console.log(`\n=== FOUND ${items.size} UNIQUE PRODUCT ITEMS ===`);
    const sorted = Array.from(items.entries()).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([k, count], idx) => {
      console.log(`${idx + 1}. (${count}x terjual) ${k}`);
    });

  } catch (err) {
    console.error('Error querying old db:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
