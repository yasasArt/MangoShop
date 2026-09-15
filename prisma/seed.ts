import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const categories = [
  {
    name: 'Premium Local',
    slug: 'premium-local',
    description: 'Hand-picked Sri Lankan varieties at peak ripeness, graded and packed the same day.',
    imageUrl: '/mangoes/cat-premium-local.svg',
  },
  {
    name: 'Imported Exotic',
    slug: 'imported-exotic',
    description: 'Air-flown Alphonso, Kesar and Nam Dok Mai for customers who want something different.',
    imageUrl: '/mangoes/cat-imported-exotic.svg',
  },
  {
    name: 'Juice & Pulp',
    slug: 'juice-and-pulp',
    description: 'Soft, intensely sweet fruit sold by the crate — ideal for juice bars and home blending.',
    imageUrl: '/mangoes/cat-juice-and-pulp.svg',
  },
  {
    name: 'Raw & Pickling',
    slug: 'raw-and-pickling',
    description: 'Firm green mangoes with a sharp bite, cut for achcharu, curries and salads.',
    imageUrl: '/mangoes/cat-raw-and-pickling.svg',
  },
  {
    name: 'Gift Boxes',
    slug: 'gift-boxes',
    description: 'Mixed varieties in a presentation box with a card — delivered anywhere on the island.',
    imageUrl: '/mangoes/cat-gift-boxes.svg',
  },
]

type SeedProduct = {
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  unit: string
  stock: number
  origin: string
  sweetness: number
  featured?: boolean
  category: string
}

const products: SeedProduct[] = [
  {
    name: 'Karutha Colomban',
    slug: 'karutha-colomban',
    description:
      'The island favourite. Deep orange flesh, almost no fibre, and a honeyed aroma you can smell through the box. Best eaten chilled within three days of delivery.',
    price: 950,
    comparePrice: 1100,
    unit: 'kg',
    stock: 140,
    origin: 'Jaffna',
    sweetness: 5,
    featured: true,
    category: 'premium-local',
  },
  {
    name: 'Willard',
    slug: 'willard',
    description:
      'Large, plump and reliably sweet, with a firm texture that holds up beautifully when sliced for a fruit platter.',
    price: 780,
    unit: 'kg',
    stock: 95,
    origin: 'Kurunegala',
    sweetness: 4,
    featured: true,
    category: 'premium-local',
  },
  {
    name: 'TOM EJC',
    slug: 'tom-ejc',
    description:
      'A blushed red-and-gold skin over thick, low-fibre flesh. Ships well, which makes it our most popular variety for out-of-Colombo orders.',
    price: 890,
    unit: 'kg',
    stock: 120,
    origin: 'Dambulla',
    sweetness: 4,
    category: 'premium-local',
  },
  {
    name: 'Malwana Special',
    slug: 'malwana-special',
    description:
      'Grown in the Malwana valley and picked slightly under-ripe so it arrives perfect. Rich, dense and a little tart at the edges.',
    price: 1050,
    unit: 'kg',
    stock: 60,
    origin: 'Malwana',
    sweetness: 5,
    featured: true,
    category: 'premium-local',
  },
  {
    name: 'Vellaikolumban',
    slug: 'vellaikolumban',
    description:
      'Pale gold, slender and fragrant. A smaller fruit with an unusually thin seed, so you get more to eat per kilo.',
    price: 820,
    unit: 'kg',
    stock: 75,
    origin: 'Jaffna',
    sweetness: 4,
    category: 'premium-local',
  },
  {
    name: 'Alphonso (Ratnagiri)',
    slug: 'alphonso-ratnagiri',
    description:
      'The one people fly home with. Saffron-coloured, buttery and perfumed. Air-flown from Ratnagiri and sold only while the season lasts.',
    price: 2400,
    comparePrice: 2800,
    unit: 'kg',
    stock: 30,
    origin: 'Ratnagiri, India',
    sweetness: 5,
    featured: true,
    category: 'imported-exotic',
  },
  {
    name: 'Kesar',
    slug: 'kesar',
    description:
      'Gujarat’s prized variety — a green skin hiding bright saffron flesh with a distinctly floral finish. Excellent for kulfi and lassi.',
    price: 1950,
    unit: 'kg',
    stock: 40,
    origin: 'Gujarat, India',
    sweetness: 5,
    category: 'imported-exotic',
  },
  {
    name: 'Nam Dok Mai',
    slug: 'nam-dok-mai',
    description:
      'Slim, elegant Thai mango with a clean, uncomplicated sweetness and zero fibre. The chef’s pick for plated desserts.',
    price: 2100,
    unit: 'kg',
    stock: 25,
    origin: 'Thailand',
    sweetness: 4,
    category: 'imported-exotic',
  },
  {
    name: 'Ataulfo',
    slug: 'ataulfo',
    description:
      'Small, deep-yellow and creamy, sometimes sold as the honey mango. Ripens quickly, so we deliver it the day it lands.',
    price: 2250,
    unit: 'kg',
    stock: 18,
    origin: 'Mexico',
    sweetness: 5,
    category: 'imported-exotic',
  },
  {
    name: 'Juice Grade Mixed',
    slug: 'juice-grade-mixed',
    description:
      'Fully ripe fruit with cosmetic marks on the skin — the flesh is perfect. Sold in 5 kg crates at a proper discount.',
    price: 420,
    comparePrice: 600,
    unit: 'kg',
    stock: 300,
    origin: 'Assorted',
    sweetness: 5,
    featured: true,
    category: 'juice-and-pulp',
  },
  {
    name: 'Gira Amba (Pulp)',
    slug: 'gira-amba-pulp',
    description:
      'Small parrot mango with an intense, concentrated flavour. Too fiddly to eat by hand, unbeatable in a blender.',
    price: 380,
    unit: 'kg',
    stock: 220,
    origin: 'Anuradhapura',
    sweetness: 5,
    category: 'juice-and-pulp',
  },
  {
    name: 'Bulk Pulp Crate — 10 kg',
    slug: 'bulk-pulp-crate-10kg',
    description:
      'A full 10 kg crate for juice bars, hotels and caterers. Standing weekly orders get priority picking.',
    price: 3600,
    unit: 'crate',
    stock: 45,
    origin: 'Assorted',
    sweetness: 5,
    category: 'juice-and-pulp',
  },
  {
    name: 'Green Ambalavi',
    slug: 'green-ambalavi',
    description:
      'Firm, sour and crunchy — the standard for achcharu. Arrives unripe on purpose, so plan to use it within the week.',
    price: 340,
    unit: 'kg',
    stock: 180,
    origin: 'Puttalam',
    sweetness: 1,
    category: 'raw-and-pickling',
  },
  {
    name: 'Raw Betti Amba',
    slug: 'raw-betti-amba',
    description:
      'Thumb-sized wild mangoes, pickled whole with the seed in. A village recipe staple and surprisingly hard to find.',
    price: 460,
    unit: 'kg',
    stock: 90,
    origin: 'Monaragala',
    sweetness: 2,
    category: 'raw-and-pickling',
  },
  {
    name: 'Curry Cut Mango',
    slug: 'curry-cut-mango',
    description:
      'Peeled and cut into curry-sized wedges, vacuum packed the morning it ships. Saves twenty minutes of prep.',
    price: 520,
    unit: 'pack',
    stock: 70,
    origin: 'Kurunegala',
    sweetness: 2,
    category: 'raw-and-pickling',
  },
  {
    name: 'Classic Gift Box — 6 Fruit',
    slug: 'classic-gift-box-6',
    description:
      'Six premium mangoes nested in shredded paper with a handwritten card. Choose the varieties in the order note.',
    price: 4200,
    unit: 'box',
    stock: 50,
    origin: 'Assorted',
    sweetness: 5,
    featured: true,
    category: 'gift-boxes',
  },
  {
    name: 'Grand Tasting Box — 12 Fruit',
    slug: 'grand-tasting-box-12',
    description:
      'Twelve mangoes across four varieties with a printed tasting card explaining what to look for in each one.',
    price: 7900,
    comparePrice: 8900,
    unit: 'box',
    stock: 22,
    origin: 'Assorted',
    sweetness: 5,
    category: 'gift-boxes',
  },
  {
    name: 'Corporate Box — 24 Fruit',
    slug: 'corporate-box-24',
    description:
      'Branded presentation box for client gifting. Add your company name in the order note and we print the sleeve.',
    price: 14500,
    unit: 'box',
    stock: 15,
    origin: 'Assorted',
    sweetness: 5,
    category: 'gift-boxes',
  },
]

async function main() {
  console.log('Clearing existing data…')
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('Creating users…')
  const adminPassword = await bcrypt.hash('Admin@123', 10)
  const customerPassword = await bcrypt.hash('Customer@123', 10)

  await prisma.user.create({
    data: {
      name: 'Shop Admin',
      email: 'admin@mangoshop.lk',
      phone: '0771234567',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })

  await prisma.user.create({
    data: {
      name: 'Nimal Perera',
      email: 'customer@mangoshop.lk',
      phone: '0777654321',
      password: customerPassword,
      role: Role.CUSTOMER,
    },
  })

  console.log('Creating categories…')
  const categoryMap = new Map<string, string>()
  for (const category of categories) {
    const created = await prisma.category.create({ data: category })
    categoryMap.set(created.slug, created.id)
  }

  console.log('Creating products…')
  for (const product of products) {
    const { category, ...rest } = product
    const categoryId = categoryMap.get(category)
    if (!categoryId) throw new Error(`Unknown category: ${category}`)

    await prisma.product.create({
      data: {
        ...rest,
        imageUrl: `/mangoes/${rest.slug}.svg`,
        categoryId,
      },
    })
  }

  console.log('\nSeed complete.')
  console.log('  Admin    → admin@mangoshop.lk / Admin@123')
  console.log('  Customer → customer@mangoshop.lk / Customer@123')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
