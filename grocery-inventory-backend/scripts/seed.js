'use strict';

require('dotenv').config();

const mongoose = require('mongoose');

const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Location = require('../src/models/Location');
const InventoryItem = require('../src/models/InventoryItem');
const ShoppingListItem = require('../src/models/ShoppingListItem');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/grocery_tracker';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Location.deleteMany({}),
    InventoryItem.deleteMany({}),
    ShoppingListItem.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── Users ──────────────────────────────────────────────────────────────────
  const superadmin = await User.create({
    name: 'Super Admin',
    email: 'superadmin@grocerytracker.io',
    password: 'SuperAdmin123!',
    role: 'superadmin',
  });

  const admin = await User.create({
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123',
    role: 'admin',
  });

  const member = await User.create({
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'Password123',
    role: 'member',
  });

  console.log('👤 Created users');

  // ── Categories ─────────────────────────────────────────────────────────────
  // Sourced from BigBasket & Blinkit top-level + sub-categories (merged & deduplicated)
  const categoryData = [
    // ── Fruits & Vegetables ──────────────────────────────────────────────
    { name: 'Fresh Vegetables',        color: '#16a34a', icon: '🥦' },
    { name: 'Fresh Fruits',            color: '#f97316', icon: '🍎' },
    { name: 'Herbs & Seasonings',      color: '#84cc16', icon: '🌿' },
    { name: 'Organic Fruits & Veggies',color: '#22c55e', icon: '🌱' },
    { name: 'Exotic Fruits & Veggies', color: '#a3e635', icon: '🥝' },
    { name: 'Flowers & Plants',        color: '#f472b6', icon: '🌸' },

    // ── Foodgrains, Oil & Masala ─────────────────────────────────────────
    { name: 'Rice & Rice Products',    color: '#fbbf24', icon: '🍚' },
    { name: 'Dals & Pulses',           color: '#d97706', icon: '🫘' },
    { name: 'Flours & Sooji',          color: '#fef3c7', icon: '🌾' },
    { name: 'Edible Oils & Ghee',      color: '#f59e0b', icon: '�' },
    { name: 'Masalas & Spices',        color: '#dc2626', icon: '🌶️' },
    { name: 'Salt, Sugar & Jaggery',   color: '#e5e7eb', icon: '🧂' },
    { name: 'Dry Fruits & Nuts',       color: '#92400e', icon: '🥜' },

    // ── Bakery, Cakes & Dairy ────────────────────────────────────────────
    { name: 'Milk',                    color: '#dbeafe', icon: '🥛' },
    { name: 'Butter & Margarine',      color: '#fef08a', icon: '🧈' },
    { name: 'Cheese',                  color: '#fde68a', icon: '🧀' },
    { name: 'Curd & Yogurt',           color: '#e0f2fe', icon: '🍶' },
    { name: 'Paneer & Tofu',           color: '#f0fdf4', icon: '🟦' },
    { name: 'Cream & Whitener',        color: '#f8fafc', icon: '🍦' },
    { name: 'Eggs',                    color: '#fef9c3', icon: '🥚' },
    { name: 'Bread & Buns',            color: '#d97706', icon: '🍞' },
    { name: 'Cakes & Pastries',        color: '#f9a8d4', icon: '🎂' },
    { name: 'Cookies & Biscuits',      color: '#fcd34d', icon: '🍪' },
    { name: 'Breakfast Cereals',       color: '#fb923c', icon: '🥣' },

    // ── Eggs, Meat & Fish ────────────────────────────────────────────────
    { name: 'Chicken',                 color: '#fca5a5', icon: '🍗' },
    { name: 'Mutton & Lamb',           color: '#ef4444', icon: '🥩' },
    { name: 'Fish & Seafood',          color: '#38bdf8', icon: '🐟' },
    { name: 'Pork',                    color: '#f87171', icon: '🐷' },
    { name: 'Ready-to-Cook Meat',      color: '#fbbf24', icon: '🍱' },

    // ── Beverages ────────────────────────────────────────────────────────
    { name: 'Soft Drinks & Sodas',     color: '#f87171', icon: '🥤' },
    { name: 'Juices & Fruit Drinks',   color: '#fb923c', icon: '🧃' },
    { name: 'Tea',                     color: '#a78bfa', icon: '🍵' },
    { name: 'Coffee',                  color: '#78350f', icon: '☕' },
    { name: 'Health & Energy Drinks',  color: '#4ade80', icon: '⚡' },
    { name: 'Water & Ice',             color: '#7dd3fc', icon: '💧' },
    { name: 'Milk Drinks & Shakes',    color: '#ddd6fe', icon: '🥛' },

    // ── Snacks & Branded Foods ───────────────────────────────────────────
    { name: 'Chips & Crisps',          color: '#fde68a', icon: '🍟' },
    { name: 'Namkeen & Bhujia',        color: '#f97316', icon: '�' },
    { name: 'Chocolates & Candies',    color: '#7c3aed', icon: '🍫' },
    { name: 'Noodles & Pasta',         color: '#fbbf24', icon: '🍝' },
    { name: 'Ready to Eat / Cook',     color: '#34d399', icon: '🍛' },
    { name: 'Frozen Foods',            color: '#06b6d4', icon: '🧊' },
    { name: 'Jams, Honey & Spreads',   color: '#f87171', icon: '🍯' },
    { name: 'Sauces & Ketchup',        color: '#dc2626', icon: '🫙' },
    { name: 'Pickles & Chutney',       color: '#65a30d', icon: '🥫' },
    { name: 'Papad & Fryums',          color: '#fcd34d', icon: '🫓' },
    { name: 'Popcorn & Makhana',       color: '#fef08a', icon: '🍿' },

    // ── Cleaning & Household ─────────────────────────────────────────────
    { name: 'Dishwash',                color: '#6366f1', icon: '🧼' },
    { name: 'Floor & Surface Cleaners',color: '#818cf8', icon: '🧹' },
    { name: 'Toilet Cleaners',         color: '#a5b4fc', icon: '🚽' },
    { name: 'Detergents & Fabric Care',color: '#c7d2fe', icon: '🧺' },
    { name: 'Air Fresheners',          color: '#e0e7ff', icon: '🌬️' },
    { name: 'Garbage Bags & Covers',   color: '#6b7280', icon: '🗑️' },
    { name: 'Paper Products & Tissues',color: '#d1d5db', icon: '🧻' },
    { name: 'Insect Repellents',       color: '#fef9c3', icon: '🦟' },

    // ── Beauty & Hygiene ─────────────────────────────────────────────────
    { name: 'Shampoo & Conditioner',   color: '#f0abfc', icon: '🧴' },
    { name: 'Skin Care',               color: '#fbcfe8', icon: '✨' },
    { name: 'Soaps & Body Wash',       color: '#e879f9', icon: '🫧' },
    { name: 'Oral Care',               color: '#a5f3fc', icon: '🦷' },
    { name: 'Feminine Hygiene',        color: '#fda4af', icon: '🌸' },
    { name: 'Deodorants & Perfumes',   color: '#c084fc', icon: '💐' },
    { name: 'Hair Care & Styling',     color: '#818cf8', icon: '💇' },
    { name: 'Men\'s Grooming',         color: '#475569', icon: '🪒' },

    // ── Baby Care ────────────────────────────────────────────────────────
    { name: 'Baby Food & Formula',     color: '#fde68a', icon: '🍼' },
    { name: 'Diapers & Wipes',         color: '#fed7aa', icon: '👶' },
    { name: 'Baby Bath & Skin Care',   color: '#bfdbfe', icon: '🛁' },
    { name: 'Baby Accessories',        color: '#ddd6fe', icon: '🧸' },

    // ── Kitchen, Garden & Pets ───────────────────────────────────────────
    { name: 'Kitchen Tools & Storage', color: '#94a3b8', icon: '🍳' },
    { name: 'Pooja & Spiritual',       color: '#fbbf24', icon: '🪔' },
    { name: 'Pet Food & Care',         color: '#86efac', icon: '🐾' },

    // ── Gourmet & World Food ─────────────────────────────────────────────
    { name: 'International Cuisine',   color: '#0ea5e9', icon: '🌍' },
    { name: 'Organic & Natural Foods', color: '#4ade80', icon: '🌿' },

    // ── Pharmacy & Wellness ──────────────────────────────────────────────
    { name: 'Vitamins & Supplements',  color: '#fb923c', icon: '💊' },
    { name: 'Health Devices',          color: '#38bdf8', icon: '�' },
  ];

  const categories = await Category.insertMany(
    categoryData.map((c) => ({ ...c, userId: admin._id, createdBy: admin._id }))
  );
  console.log('📂 Created categories');

  // ── Locations ──────────────────────────────────────────────────────────────
  const locationData = [
    { name: 'Refrigerator',   description: 'Main fridge'               },
    { name: 'Freezer',        description: 'Chest freezer in garage'   },
    { name: 'Pantry',         description: 'Kitchen pantry shelves'    },
    { name: 'Cabinet',        description: 'Upper kitchen cabinets'    },
    { name: 'Counter',        description: 'Kitchen countertop'        },
    { name: 'Garage Storage', description: 'Extra storage in garage'   },
  ];

  const locations = await Location.insertMany(
    locationData.map((l) => ({ ...l, userId: admin._id, createdBy: admin._id }))
  );
  console.log('📍 Created locations');

  const getCat = (name) => categories.find((c) => c.name === name)._id;
  const getLoc = (name) => locations.find((l) => l.name === name)._id;

  const now = new Date();
  const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  // ── Inventory Items ────────────────────────────────────────────────────────
  //
  // Concept:
  //   quantity         = number of physical packages/units you have
  //   unitSize         = the size of each package (in the chosen unit)
  //   unit             = the measurement unit for unitSize  (g, ml, lbs …)
  //                      OR the count unit when no unitSize (pcs, bags, packs …)
  //   minimumThreshold = minimum number of packages before auto-add to shopping
  //
  // Example: 3 bottles of 500 ml each  →  quantity: 3, unitSize: 500, unit: 'ml'
  //          6 eggs (no size concept)   →  quantity: 6, unit: 'pcs'  (no unitSize)
  //
  const inventoryData = [
    // ── Milk ──────────────────────────────────────────────────────────────
    {
      itemName: 'Whole Milk',
      categoryId: getCat('Milk'),
      quantity: 1, unitSize: 1000, unit: 'ml', minimumThreshold: 2,
      expirationDate: daysFromNow(4), locationId: getLoc('Refrigerator'), brand: 'Amul',
    },
    {
      itemName: 'Toned Milk',
      categoryId: getCat('Milk'),
      quantity: 2, unitSize: 500, unit: 'ml', minimumThreshold: 2,
      expirationDate: daysFromNow(3), locationId: getLoc('Refrigerator'), brand: 'Mother Dairy',
    },

    // ── Eggs ──────────────────────────────────────────────────────────────
    {
      itemName: 'Free Range Eggs',
      categoryId: getCat('Eggs'),
      quantity: 6, unit: 'pcs', minimumThreshold: 6,
      expirationDate: daysFromNow(14), locationId: getLoc('Refrigerator'),
    },

    // ── Cheese ────────────────────────────────────────────────────────────
    {
      itemName: 'Cheddar Cheese',
      categoryId: getCat('Cheese'),
      quantity: 0, unitSize: 200, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(21), locationId: getLoc('Refrigerator'), brand: 'Amul',
    },

    // ── Curd & Yogurt ─────────────────────────────────────────────────────
    {
      itemName: 'Greek Yogurt',
      categoryId: getCat('Curd & Yogurt'),
      quantity: 2, unitSize: 150, unit: 'g', minimumThreshold: 3,
      expirationDate: daysFromNow(2), locationId: getLoc('Refrigerator'), brand: 'Epigamia',
    },

    // ── Butter & Margarine ────────────────────────────────────────────────
    {
      itemName: 'Salted Butter',
      categoryId: getCat('Butter & Margarine'),
      quantity: 1, unitSize: 500, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(30), locationId: getLoc('Refrigerator'), brand: 'Amul',
    },

    // ── Paneer & Tofu ─────────────────────────────────────────────────────
    {
      itemName: 'Fresh Paneer',
      categoryId: getCat('Paneer & Tofu'),
      quantity: 1, unitSize: 200, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(5), locationId: getLoc('Refrigerator'), brand: 'Mother Dairy',
    },

    // ── Fresh Vegetables ──────────────────────────────────────────────────
    {
      itemName: 'Spinach',
      categoryId: getCat('Fresh Vegetables'),
      quantity: 1, unitSize: 200, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(3), locationId: getLoc('Refrigerator'),
    },
    {
      itemName: 'Carrots',
      categoryId: getCat('Fresh Vegetables'),
      quantity: 1, unitSize: 500, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(14), locationId: getLoc('Refrigerator'),
    },
    {
      itemName: 'Tomatoes',
      categoryId: getCat('Fresh Vegetables'),
      quantity: 4, unit: 'pcs', minimumThreshold: 4,
      expirationDate: daysFromNow(7), locationId: getLoc('Counter'),
    },
    {
      itemName: 'Onions',
      categoryId: getCat('Fresh Vegetables'),
      quantity: 1, unitSize: 1000, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(30), locationId: getLoc('Pantry'),
    },
    {
      itemName: 'Potatoes',
      categoryId: getCat('Fresh Vegetables'),
      quantity: 1, unitSize: 2000, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(21), locationId: getLoc('Pantry'),
    },

    // ── Fresh Fruits ──────────────────────────────────────────────────────
    {
      itemName: 'Bananas',
      categoryId: getCat('Fresh Fruits'),
      quantity: 4, unit: 'pcs', minimumThreshold: 3,
      expirationDate: daysFromNow(5), locationId: getLoc('Counter'),
    },
    {
      itemName: 'Apples',
      categoryId: getCat('Fresh Fruits'),
      quantity: 6, unit: 'pcs', minimumThreshold: 4,
      expirationDate: daysFromNow(10), locationId: getLoc('Refrigerator'), brand: 'Fresho',
    },

    // ── Chicken ───────────────────────────────────────────────────────────
    {
      itemName: 'Chicken Breast',
      categoryId: getCat('Chicken'),
      quantity: 2, unitSize: 250, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(2), locationId: getLoc('Refrigerator'),
    },
    {
      itemName: 'Chicken Wings',
      categoryId: getCat('Chicken'),
      quantity: 0, unitSize: 500, unit: 'g', minimumThreshold: 1,
      expirationDate: null, locationId: getLoc('Freezer'),
    },

    // ── Fish & Seafood ────────────────────────────────────────────────────
    {
      itemName: 'Salmon Fillet',
      categoryId: getCat('Fish & Seafood'),
      quantity: 0, unitSize: 180, unit: 'g', minimumThreshold: 2,
      expirationDate: null, locationId: getLoc('Freezer'),
    },

    // ── Bread & Buns ──────────────────────────────────────────────────────
    {
      itemName: 'Sourdough Bread',
      categoryId: getCat('Bread & Buns'),
      quantity: 1, unit: 'pcs', minimumThreshold: 1,
      expirationDate: daysFromNow(4), locationId: getLoc('Counter'), brand: 'Britannia',
    },
    {
      itemName: 'Whole Wheat Bread',
      categoryId: getCat('Bread & Buns'),
      quantity: 1, unit: 'pcs', minimumThreshold: 1,
      expirationDate: daysFromNow(5), locationId: getLoc('Counter'), brand: 'Harvest Gold',
    },

    // ── Breakfast Cereals ─────────────────────────────────────────────────
    {
      itemName: 'Oats',
      categoryId: getCat('Breakfast Cereals'),
      quantity: 1, unitSize: 500, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(180), locationId: getLoc('Pantry'), brand: "Quaker",
    },

    // ── Flours & Sooji ────────────────────────────────────────────────────
    {
      itemName: 'All-Purpose Flour',
      categoryId: getCat('Flours & Sooji'),
      quantity: 1, unitSize: 1000, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(180), locationId: getLoc('Pantry'), brand: "Aashirvaad",
    },

    // ── Rice & Rice Products ──────────────────────────────────────────────
    {
      itemName: 'Basmati Rice',
      categoryId: getCat('Rice & Rice Products'),
      quantity: 1, unitSize: 5000, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(365), locationId: getLoc('Pantry'), brand: 'India Gate',
    },

    // ── Dals & Pulses ─────────────────────────────────────────────────────
    {
      itemName: 'Moong Dal',
      categoryId: getCat('Dals & Pulses'),
      quantity: 1, unitSize: 1000, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(365), locationId: getLoc('Pantry'), brand: 'Tata Sampann',
    },
    {
      itemName: 'Chana Dal',
      categoryId: getCat('Dals & Pulses'),
      quantity: 0, unitSize: 500, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(300), locationId: getLoc('Pantry'),
    },

    // ── Edible Oils & Ghee ────────────────────────────────────────────────
    {
      itemName: 'Olive Oil',
      categoryId: getCat('Edible Oils & Ghee'),
      quantity: 1, unitSize: 250, unit: 'ml', minimumThreshold: 1,
      expirationDate: daysFromNow(300), locationId: getLoc('Cabinet'), brand: 'Borges',
    },
    {
      itemName: 'Desi Ghee',
      categoryId: getCat('Edible Oils & Ghee'),
      quantity: 1, unitSize: 500, unit: 'ml', minimumThreshold: 1,
      expirationDate: daysFromNow(365), locationId: getLoc('Cabinet'), brand: 'Amul',
    },
    {
      itemName: 'Sunflower Oil',
      categoryId: getCat('Edible Oils & Ghee'),
      quantity: 1, unitSize: 1000, unit: 'ml', minimumThreshold: 1,
      expirationDate: daysFromNow(300), locationId: getLoc('Cabinet'), brand: 'Fortune',
    },

    // ── Masalas & Spices ──────────────────────────────────────────────────
    {
      itemName: 'Turmeric Powder',
      categoryId: getCat('Masalas & Spices'),
      quantity: 1, unitSize: 100, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(365), locationId: getLoc('Cabinet'), brand: 'Everest',
    },
    {
      itemName: 'Garam Masala',
      categoryId: getCat('Masalas & Spices'),
      quantity: 1, unitSize: 100, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(365), locationId: getLoc('Cabinet'), brand: 'MDH',
    },

    // ── Salt, Sugar & Jaggery ─────────────────────────────────────────────
    {
      itemName: 'Iodised Salt',
      categoryId: getCat('Salt, Sugar & Jaggery'),
      quantity: 1, unitSize: 1000, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(730), locationId: getLoc('Cabinet'), brand: 'Tata Salt',
    },
    {
      itemName: 'Sugar',
      categoryId: getCat('Salt, Sugar & Jaggery'),
      quantity: 1, unitSize: 1000, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(365), locationId: getLoc('Pantry'),
    },

    // ── Noodles & Pasta ───────────────────────────────────────────────────
    {
      itemName: 'Spaghetti Pasta',
      categoryId: getCat('Noodles & Pasta'),
      quantity: 2, unitSize: 500, unit: 'g', minimumThreshold: 2,
      expirationDate: daysFromNow(365), locationId: getLoc('Pantry'), brand: 'Barilla',
    },
    {
      itemName: 'Instant Noodles',
      categoryId: getCat('Noodles & Pasta'),
      quantity: 3, unit: 'pcs', minimumThreshold: 2,
      expirationDate: daysFromNow(180), locationId: getLoc('Pantry'), brand: 'Maggi',
    },

    // ── Sauces & Ketchup ──────────────────────────────────────────────────
    {
      itemName: 'Tomato Ketchup',
      categoryId: getCat('Sauces & Ketchup'),
      quantity: 1, unitSize: 500, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(180), locationId: getLoc('Pantry'), brand: "Heinz",
    },

    // ── Jams, Honey & Spreads ─────────────────────────────────────────────
    {
      itemName: 'Honey',
      categoryId: getCat('Jams, Honey & Spreads'),
      quantity: 1, unitSize: 250, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(730), locationId: getLoc('Cabinet'), brand: "Dabur",
    },

    // ── Soft Drinks & Sodas ───────────────────────────────────────────────
    {
      itemName: 'Cola Drink',
      categoryId: getCat('Soft Drinks & Sodas'),
      quantity: 6, unitSize: 330, unit: 'ml', minimumThreshold: 4,
      expirationDate: daysFromNow(180), locationId: getLoc('Refrigerator'), brand: 'Coca-Cola',
    },

    // ── Juices & Fruit Drinks ─────────────────────────────────────────────
    {
      itemName: 'Orange Juice',
      categoryId: getCat('Juices & Fruit Drinks'),
      quantity: 1, unitSize: 1000, unit: 'ml', minimumThreshold: 1,
      expirationDate: daysFromNow(7), locationId: getLoc('Refrigerator'),
    },

    // ── Water & Ice ───────────────────────────────────────────────────────
    {
      itemName: 'Sparkling Water',
      categoryId: getCat('Water & Ice'),
      quantity: 6, unitSize: 500, unit: 'ml', minimumThreshold: 4,
      expirationDate: daysFromNow(200), locationId: getLoc('Cabinet'),
    },

    // ── Coffee ────────────────────────────────────────────────────────────
    {
      itemName: 'Ground Coffee Beans',
      categoryId: getCat('Coffee'),
      quantity: 1, unitSize: 250, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(180), locationId: getLoc('Cabinet'), brand: 'Nescafe',
    },

    // ── Tea ───────────────────────────────────────────────────────────────
    {
      itemName: 'Green Tea Bags',
      categoryId: getCat('Tea'),
      quantity: 1, unitSize: 25, unit: 'pcs', minimumThreshold: 1,
      expirationDate: daysFromNow(365), locationId: getLoc('Cabinet'), brand: "Lipton",
    },

    // ── Frozen Foods ──────────────────────────────────────────────────────
    {
      itemName: 'Frozen Pizza',
      categoryId: getCat('Frozen Foods'),
      quantity: 2, unit: 'pcs', minimumThreshold: 1,
      expirationDate: daysFromNow(60), locationId: getLoc('Freezer'),
    },
    {
      itemName: 'Mixed Berries',
      categoryId: getCat('Frozen Foods'),
      quantity: 0, unitSize: 400, unit: 'g', minimumThreshold: 1,
      expirationDate: null, locationId: getLoc('Freezer'),
    },

    // ── Chips & Crisps ────────────────────────────────────────────────────
    {
      itemName: 'Potato Chips',
      categoryId: getCat('Chips & Crisps'),
      quantity: 2, unitSize: 150, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(45), locationId: getLoc('Cabinet'), brand: "Lay's",
    },

    // ── Chocolates & Candies ──────────────────────────────────────────────
    {
      itemName: 'Dark Chocolate Bar',
      categoryId: getCat('Chocolates & Candies'),
      quantity: 2, unitSize: 80, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(120), locationId: getLoc('Cabinet'), brand: 'Bournville',
    },

    // ── Dry Fruits & Nuts ─────────────────────────────────────────────────
    {
      itemName: 'Almonds',
      categoryId: getCat('Dry Fruits & Nuts'),
      quantity: 1, unitSize: 250, unit: 'g', minimumThreshold: 1,
      expirationDate: daysFromNow(180), locationId: getLoc('Cabinet'),
    },

    // ── Dishwash ──────────────────────────────────────────────────────────
    {
      itemName: 'Dish Soap',
      categoryId: getCat('Dishwash'),
      quantity: 1, unitSize: 500, unit: 'ml', minimumThreshold: 1,
      expirationDate: null, locationId: getLoc('Cabinet'), brand: 'Vim',
    },

    // ── Detergents & Fabric Care ──────────────────────────────────────────
    {
      itemName: 'Laundry Detergent Powder',
      categoryId: getCat('Detergents & Fabric Care'),
      quantity: 1, unitSize: 2000, unit: 'g', minimumThreshold: 1,
      expirationDate: null, locationId: getLoc('Garage Storage'), brand: 'Surf Excel',
    },

    // ── Floor & Surface Cleaners ──────────────────────────────────────────
    {
      itemName: 'Floor Cleaner',
      categoryId: getCat('Floor & Surface Cleaners'),
      quantity: 1, unitSize: 1000, unit: 'ml', minimumThreshold: 1,
      expirationDate: null, locationId: getLoc('Cabinet'), brand: 'Lizol',
    },
    {
      itemName: 'All-Purpose Cleaner',
      categoryId: getCat('Floor & Surface Cleaners'),
      quantity: 1, unitSize: 750, unit: 'ml', minimumThreshold: 1,
      expirationDate: null, locationId: getLoc('Cabinet'), brand: 'Colin',
    },

    // ── Paper Products & Tissues ──────────────────────────────────────────
    {
      itemName: 'Paper Towels',
      categoryId: getCat('Paper Products & Tissues'),
      quantity: 2, unit: 'packs', minimumThreshold: 2,
      expirationDate: null, locationId: getLoc('Garage Storage'),
    },
    {
      itemName: 'Toilet Paper',
      categoryId: getCat('Paper Products & Tissues'),
      quantity: 4, unit: 'packs', minimumThreshold: 4,
      expirationDate: null, locationId: getLoc('Garage Storage'),
    },

    // ── Shampoo & Conditioner ─────────────────────────────────────────────
    {
      itemName: 'Shampoo',
      categoryId: getCat('Shampoo & Conditioner'),
      quantity: 1, unitSize: 400, unit: 'ml', minimumThreshold: 1,
      expirationDate: null, locationId: getLoc('Cabinet'), brand: 'Dove',
    },
    {
      itemName: 'Conditioner',
      categoryId: getCat('Shampoo & Conditioner'),
      quantity: 1, unitSize: 400, unit: 'ml', minimumThreshold: 1,
      expirationDate: null, locationId: getLoc('Cabinet'), brand: 'Dove',
    },

    // ── Soaps & Body Wash ─────────────────────────────────────────────────
    {
      itemName: 'Hand Soap',
      categoryId: getCat('Soaps & Body Wash'),
      quantity: 2, unitSize: 250, unit: 'ml', minimumThreshold: 1,
      expirationDate: null, locationId: getLoc('Cabinet'), brand: 'Dettol',
    },

    // ── Vitamins & Supplements ────────────────────────────────────────────
    {
      itemName: 'Vitamin C Tablets',
      categoryId: getCat('Vitamins & Supplements'),
      quantity: 1, unitSize: 60, unit: 'pcs', minimumThreshold: 1,
      expirationDate: daysFromNow(365), locationId: getLoc('Cabinet'),
    },
  ];

  await InventoryItem.insertMany(
    inventoryData.map((item) => ({
      ...item,
      userId: admin._id,
      createdBy: admin._id,
    }))
  );
  console.log('📦 Created inventory items');

  // ── Shopping List Items ────────────────────────────────────────────────────
  //
  // quantityNeeded = number of packages to buy
  // unit           = "<unitSize> <unit>" for sized items, or plain unit for count items
  //
  const shoppingData = [
    // auto-added (low / out of stock inventory)
    { itemName: 'Whole Milk',         quantityNeeded: 2, unitSize: 1000, unit: 'ml',  priority: 'high',   autoAdded: true,  categoryId: getCat('Milk')                   },
    { itemName: 'Cheddar Cheese',     quantityNeeded: 2, unitSize: 200,  unit: 'g',   priority: 'high',   autoAdded: true,  categoryId: getCat('Cheese')                 },
    { itemName: 'Greek Yogurt',       quantityNeeded: 2, unitSize: 150,  unit: 'g',   priority: 'high',   autoAdded: true,  categoryId: getCat('Curd & Yogurt')          },
    { itemName: 'Salmon Fillet',      quantityNeeded: 2, unitSize: 180,  unit: 'g',   priority: 'medium', autoAdded: true,  categoryId: getCat('Fish & Seafood')         },
    { itemName: 'Mixed Berries',      quantityNeeded: 2, unitSize: 400,  unit: 'g',   priority: 'medium', autoAdded: true,  categoryId: getCat('Frozen Foods')           },
    { itemName: 'Chana Dal',          quantityNeeded: 1, unitSize: 500,  unit: 'g',   priority: 'high',   autoAdded: true,  categoryId: getCat('Dals & Pulses')          },
    { itemName: 'Chicken Wings',      quantityNeeded: 1, unitSize: 500,  unit: 'g',   priority: 'medium', autoAdded: true,  categoryId: getCat('Chicken')                },
    // manually added
    { itemName: 'Almond Milk',        quantityNeeded: 2, unitSize: 1000, unit: 'ml',  priority: 'medium', autoAdded: false, categoryId: getCat('Milk')                   },
    { itemName: 'Oat Biscuits',       quantityNeeded: 1, unitSize: 200,  unit: 'g',   priority: 'low',    autoAdded: false, categoryId: getCat('Cookies & Biscuits')     },
    { itemName: 'Paneer',             quantityNeeded: 2, unitSize: 200,  unit: 'g',   priority: 'high',   autoAdded: false, categoryId: getCat('Paneer & Tofu')          },
    { itemName: 'Green Tea',          quantityNeeded: 1, unitSize: 25,   unit: 'pcs', priority: 'low',    autoAdded: false, categoryId: getCat('Tea')                    },
    { itemName: 'Turmeric Powder',    quantityNeeded: 1, unitSize: 100,  unit: 'g',   priority: 'medium', autoAdded: false, categoryId: getCat('Masalas & Spices')       },
  ];

  await ShoppingListItem.insertMany(
    shoppingData.map((item) => ({
      ...item,
      userId: admin._id,
      addedBy: admin._id,
      status: 'pending',
    }))
  );
  console.log('🛒 Created shopping list items');

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed completed successfully!');
  console.log('─'.repeat(40));
  console.log('📧 Superadmin: superadmin@grocerytracker.io / SuperAdmin123!');
  console.log('📧 Admin:      alice@example.com / Password123');
  console.log('📧 Member:     bob@example.com   / Password123');
  console.log('─'.repeat(40));
  console.log(`� Categories      : ${categoryData.length}`);
  console.log(`�📦 Inventory items : ${inventoryData.length}`);
  console.log(`🛒 Shopping items  : ${shoppingData.length}`);
  console.log('─'.repeat(40));

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
