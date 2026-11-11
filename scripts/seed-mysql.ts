import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { DEFAULT_CATEGORIES } from "../src/lib/constants/categories";

const prisma = new PrismaClient();

async function seedMySQL() {
  console.log("Starting MySQL seed...");

  // 1. Categories
  const categories = DEFAULT_CATEGORIES;

  const categoryMap = new Map<string, string>();

  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        isActive: true,
      },
    });
    categoryMap.set(cat.slug, record.id);
  }
  console.log(`✓ Seeded ${categories.length} categories into MySQL.`);

  // 2. Default Store Settings
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {
      storeName: "Mydhili Collections",
      currency: "INR",
      shippingFee: 0,
      freeShippingThreshold: 999,
      codEnabled: true,
    },
    create: {
      id: "default",
      storeName: "Mydhili Collections",
      currency: "INR",
      shippingFee: 0,
      freeShippingThreshold: 999,
      codEnabled: true,
    },
  });
  console.log("✓ Initialized store settings in MySQL.");

  // 3. Products
  const sampleProducts = [
    {
      name: "Royal Burgundy Silk Saree",
      slug: "royal-burgundy-silk-saree",
      description:
        "An exquisitely woven silk saree in deep royal burgundy, adorned with delicate golden zari borders. Handcrafted by master weavers for grand celebrations and weddings.",
      shortDescription: "Handcrafted pure silk festive saree",
      categorySlug: "sarees",
      price: 2499.0,
      compareAtPrice: 2999.0,
      images: ["/categories/saree.jpg"],
      variants: [
        { sku: "MC-SAR-001", size: "Free Size", color: "Burgundy", stock: 12 },
      ],
      isFeatured: true,
      isActive: true,
    },
    {
      name: "Classic Floral Chanderi Kurti",
      slug: "classic-floral-kurti",
      description:
        "Lightweight, breathable Chanderi kurti featuring delicate floral motifs, comfortable side slits, and a Mandarin neckline.",
      shortDescription: "Everyday floral boutique kurti",
      categorySlug: "kurtis",
      price: 899.0,
      compareAtPrice: 1199.0,
      images: ["/categories/kurtis.avif"],
      variants: [
        { sku: "MC-KUR-001-S", size: "S", color: "Rose", stock: 6 },
        { sku: "MC-KUR-001-M", size: "M", color: "Rose", stock: 10 },
        { sku: "MC-KUR-001-L", size: "L", color: "Rose", stock: 8 },
        { sku: "MC-KUR-001-XL", size: "XL", color: "Rose", stock: 5 },
      ],
      isFeatured: true,
      isActive: true,
    },
    {
      name: "Embroidered Festive Ethnic Set",
      slug: "embroidered-festive-ethnic-set",
      description:
        "A 3-piece festive ethnic set consisting of an embroidered kurta, straight-fit trousers, and a luxurious tissue dupatta.",
      shortDescription: "3-piece festive embroidered ensemble",
      categorySlug: "ethnic-wear",
      price: 3299.0,
      compareAtPrice: 3999.0,
      images: ["/categories/ethnicwear.jpg"],
      variants: [
        { sku: "MC-ETH-001-M", size: "M", color: "Maroon", stock: 6 },
        { sku: "MC-ETH-001-L", size: "L", color: "Maroon", stock: 8 },
        { sku: "MC-ETH-001-XL", size: "XL", color: "Maroon", stock: 4 },
      ],
      isFeatured: true,
      isActive: true,
    },
    {
      name: "Elegant Everyday Georgette Dress",
      slug: "elegant-everyday-dress",
      description:
        "Flowing georgette maxi dress featuring subtle gather details at the waist and airy tiered hemline.",
      shortDescription: "Flowy georgette tiered dress",
      categorySlug: "dresses",
      price: 1499.0,
      compareAtPrice: 1799.0,
      images: ["/categories/dresses.jpg"],
      variants: [
        { sku: "MC-DRE-001-S", size: "S", color: "Emerald", stock: 5 },
        { sku: "MC-DRE-001-M", size: "M", color: "Emerald", stock: 7 },
        { sku: "MC-DRE-001-L", size: "L", color: "Emerald", stock: 6 },
      ],
      isFeatured: false,
      isActive: true,
    },
    {
      name: "Classic Zardozi Designer Blouse",
      slug: "classic-designer-blouse",
      description:
        "Hand-embroidered zardozi blouse in rich antique gold raw silk with comfortable padded cups and soft inner lining.",
      shortDescription: "Handcrafted zardozi bridal blouse",
      categorySlug: "blouses",
      price: 1299.0,
      compareAtPrice: 1599.0,
      images: ["/categories/blouse.webp"],
      variants: [
        { sku: "MC-BLO-001-34", size: "34", color: "Antique Gold", stock: 4 },
        { sku: "MC-BLO-001-36", size: "36", color: "Antique Gold", stock: 6 },
        { sku: "MC-BLO-001-38", size: "38", color: "Antique Gold", stock: 5 },
      ],
      isFeatured: false,
      isActive: true,
    },
    {
      name: "Traditional Embroidered Potli Clutch",
      slug: "traditional-embroidered-clutch",
      description:
        "A boutique hand-beaded potli clutch with pearl tassels, perfect for storing essentials at weddings and receptions.",
      shortDescription: "Handcrafted pearl tassel potli clutch",
      categorySlug: "accessories",
      price: 699.0,
      compareAtPrice: 899.0,
      images: ["/categories/accessories.jpg"],
      variants: [
        { sku: "MC-ACC-001", size: "One Size", color: "Gold", stock: 15 },
      ],
      isFeatured: false,
      isActive: true,
    },
    {
      name: "Emerald Green Velvet Bridal Lehenga",
      slug: "emerald-green-bridal-lehenga",
      description:
        "Luxurious heavy bridal lehenga in rich velvet with intricate resham and sequin work, paired with a matching blouse and net dupatta.",
      shortDescription: "Hand-embellished velvet bridal lehenga",
      categorySlug: "lehenga",
      price: 5999.0,
      compareAtPrice: 7499.0,
      images: ["/categories/lehenga.jpg"],
      variants: [
        { sku: "MC-LEH-001-M", size: "Semi-Stitched", color: "Emerald Green", stock: 4 },
      ],
      isFeatured: true,
      isActive: true,
    },
    {
      name: "Pastel Lavender Chanderi Salwar Suit",
      slug: "pastel-lavender-salwar-suit",
      description:
        "Graceful pastel lavender salwar suit crafted from fine Chanderi with delicate gota patti detailing on neckline and dupatta.",
      shortDescription: "Gota patti pastel salwar suit set",
      categorySlug: "salwar-suits",
      price: 2199.0,
      compareAtPrice: 2699.0,
      images: ["/categories/salvarsuits.jpg"],
      variants: [
        { sku: "MC-SAL-001-M", size: "M", color: "Lavender", stock: 6 },
        { sku: "MC-SAL-001-L", size: "L", color: "Lavender", stock: 6 },
        { sku: "MC-SAL-001-XL", size: "XL", color: "Lavender", stock: 4 },
      ],
      isFeatured: true,
      isActive: true,
    },
    {
      name: "Heritage Handloom Cotton Check Lungi",
      slug: "heritage-handloom-cotton-lungi",
      description:
        "Crafted from 100% pure combed handloom cotton, this traditional South Indian lungi offers timeless comfort, breathability, and authentic woven borders.",
      shortDescription: "Handloom pure cotton traditional lungi",
      categorySlug: "lungi",
      price: 449.0,
      compareAtPrice: 599.0,
      images: ["/categories/lungi.jpg"],
      variants: [
        { sku: "MC-LNG-001", size: "Free Size", color: "Amber Check", stock: 20 },
        { sku: "MC-LNG-002", size: "Free Size", color: "Indigo Check", stock: 15 },
      ],
      isFeatured: true,
      isActive: true,
    },
  ];

  for (const prod of sampleProducts) {
    const categoryId = categoryMap.get(prod.categorySlug);
    if (!categoryId) continue;

    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        description: prod.description,
        shortDescription: prod.shortDescription,
        price: prod.price,
        compareAtPrice: prod.compareAtPrice,
        images: prod.images,
        variants: prod.variants,
        isFeatured: prod.isFeatured,
        isActive: prod.isActive,
        categoryId: categoryId,
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.shortDescription,
        price: prod.price,
        compareAtPrice: prod.compareAtPrice,
        images: prod.images,
        variants: prod.variants,
        isFeatured: prod.isFeatured,
        isActive: prod.isActive,
        categoryId: categoryId,
      },
    });
  }

  console.log(`✓ Seeded ${sampleProducts.length} boutique products into MySQL.`);
  console.log("MySQL seed completed successfully!");
}

seedMySQL()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
