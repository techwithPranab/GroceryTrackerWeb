'use strict';

require('dotenv').config();

const mongoose = require('mongoose');

const User = require('../src/models/User');
const Household = require('../src/models/Household');
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
    Household.deleteMany({}),
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

  // ── Household ──────────────────────────────────────────────────────────────
  const household = await Household.create({
    name: 'Johnson Family',
    createdBy: admin._id,
    members: [
      { userId: admin._id,  role: 'admin',  joinedAt: new Date() },
      { userId: member._id, role: 'member', joinedAt: new Date() },
    ],
  });

  await User.updateMany(
    { _id: { $in: [admin._id, member._id] } },
    { householdId: household._id }
  );
  await User.findByIdAndUpdate(admin._id, { role: 'admin' });

  console.log('🏠 Created household');

  // ── Categories ─────────────────────────────────────────────────────────────
  const categoryData = [
    { name: 'Dairy & Eggs',          color: '#f59e0b', icon: '🥛' },
    { name: 'Fruits & Vegetables',   color: '#10b981', icon: '🥦' },
    { name: 'Meat & Seafood',        color: '#ef4444', icon: '🥩' },
    { name: 'Bakery & Bread',        color: '#d97706', icon: '🍞' },
    { name: 'Pantry & Dry Goods',    color: '#8b5cf6', icon: '🫙' },
    { name: 'Beverages',             color: '#3b82f6', icon: '🧃' },
    { name: 'Frozen Foods',          color: '#06b6d4', icon: '🧊' },
    { name: 'Snacks',                color: '#f97316', icon: '🍿' },
    { name: 'Cleaning & Household',  color: '#6366f1', icon: '🧹' },
    { name: 'Personal Care',         color: '#ec4899', icon: '🧴' },
  ];

  const categories = await Category.insertMany(
    categoryData.map((c) => ({ ...c, householdId: household._id, createdBy: admin._id }))
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
    locationData.map((l) => ({ ...l, householdId: household._id, createdBy: admin._id }))
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
    // ── Dairy & Eggs ──────────────────────────────────────────────────────
    {
      itemName: 'Whole Milk',
      categoryId: getCat('Dairy & Eggs'),
      quantity: 1,           // 1 carton
      unitSize: 1000,        // 1000 ml each
      unit: 'ml',
      minimumThreshold: 2,   // re-order when < 2 cartons
      expirationDate: daysFromNow(4),
      locationId: getLoc('Refrigerator'),
      brand: 'Organic Valley',
    },
    {
      itemName: 'Free Range Eggs',
      categoryId: getCat('Dairy & Eggs'),
      quantity: 6,           // 6 individual eggs (no unitSize)
      unit: 'pcs',
      minimumThreshold: 6,
      expirationDate: daysFromNow(14),
      locationId: getLoc('Refrigerator'),
    },
    {
      itemName: 'Cheddar Cheese',
      categoryId: getCat('Dairy & Eggs'),
      quantity: 0,           // out of stock
      unitSize: 200,         // 200 g per block
      unit: 'g',
      minimumThreshold: 1,
      expirationDate: daysFromNow(21),
      locationId: getLoc('Refrigerator'),
      brand: 'Tillamook',
    },
    {
      itemName: 'Greek Yogurt',
      categoryId: getCat('Dairy & Eggs'),
      quantity: 2,           // 2 tubs
      unitSize: 150,         // 150 g each
      unit: 'g',
      minimumThreshold: 3,
      expirationDate: daysFromNow(2),
      locationId: getLoc('Refrigerator'),
      brand: 'Chobani',
    },
    {
      itemName: 'Butter',
      categoryId: getCat('Dairy & Eggs'),
      quantity: 1,           // 1 pack
      unitSize: 250,         // 250 g per pack
      unit: 'g',
      minimumThreshold: 1,
      expirationDate: daysFromNow(30),
      locationId: getLoc('Refrigerator'),
      brand: 'Kerrygold',
    },

    // ── Fruits & Vegetables ───────────────────────────────────────────────
    {
      itemName: 'Bananas',
      categoryId: getCat('Fruits & Vegetables'),
      quantity: 4,           // 4 individual bananas
      unit: 'pcs',
      minimumThreshold: 3,
      expirationDate: daysFromNow(5),
      locationId: getLoc('Counter'),
    },
    {
      itemName: 'Spinach',
      categoryId: getCat('Fruits & Vegetables'),
      quantity: 1,           // 1 bag
      unitSize: 200,         // 200 g per bag
      unit: 'g',
      minimumThreshold: 1,
      expirationDate: daysFromNow(3),
      locationId: getLoc('Refrigerator'),
    },
    {
      itemName: 'Carrots',
      categoryId: getCat('Fruits & Vegetables'),
      quantity: 1,           // 1 bag
      unitSize: 500,         // 500 g per bag
      unit: 'g',
      minimumThreshold: 1,
      expirationDate: daysFromNow(14),
      locationId: getLoc('Refrigerator'),
    },

    // ── Meat & Seafood ────────────────────────────────────────────────────
    {
      itemName: 'Chicken Breast',
      categoryId: getCat('Meat & Seafood'),
      quantity: 2,           // 2 portions
      unitSize: 250,         // 250 g each
      unit: 'g',
      minimumThreshold: 1,
      expirationDate: daysFromNow(2),
      locationId: getLoc('Refrigerator'),
    },
    {
      itemName: 'Salmon Fillet',
      categoryId: getCat('Meat & Seafood'),
      quantity: 0,           // out of stock
      unitSize: 180,         // 180 g per fillet
      unit: 'g',
      minimumThreshold: 2,
      expirationDate: null,
      locationId: getLoc('Freezer'),
    },

    // ── Bakery & Bread ────────────────────────────────────────────────────
    {
      itemName: 'Sourdough Bread',
      categoryId: getCat('Bakery & Bread'),
      quantity: 1,           // 1 loaf
      unit: 'pcs',
      minimumThreshold: 1,
      expirationDate: daysFromNow(4),
      locationId: getLoc('Counter'),
      brand: 'Boudin',
    },

    // ── Pantry & Dry Goods ────────────────────────────────────────────────
    {
      itemName: 'All-Purpose Flour',
      categoryId: getCat('Pantry & Dry Goods'),
      quantity: 1,           // 1 bag
      unitSize: 1000,        // 1 kg (1000 g) per bag
      unit: 'g',
      minimumThreshold: 1,
      expirationDate: daysFromNow(180),
      locationId: getLoc('Pantry'),
      brand: "King Arthur",
    },
    {
      itemName: 'Olive Oil',
      categoryId: getCat('Pantry & Dry Goods'),
      quantity: 1,           // 1 bottle
      unitSize: 250,         // 250 ml per bottle
      unit: 'ml',
      minimumThreshold: 1,
      expirationDate: daysFromNow(300),
      locationId: getLoc('Cabinet'),
      brand: 'California Olive Ranch',
    },
    {
      itemName: 'Pasta',
      categoryId: getCat('Pantry & Dry Goods'),
      quantity: 2,           // 2 packs
      unitSize: 500,         // 500 g per pack
      unit: 'g',
      minimumThreshold: 2,
      expirationDate: daysFromNow(365),
      locationId: getLoc('Pantry'),
      brand: 'Barilla',
    },
    {
      itemName: 'Tomato Sauce',
      categoryId: getCat('Pantry & Dry Goods'),
      quantity: 3,           // 3 cans
      unitSize: 400,         // 400 g per can
      unit: 'g',
      minimumThreshold: 2,
      expirationDate: daysFromNow(400),
      locationId: getLoc('Pantry'),
    },
    {
      itemName: 'White Rice',
      categoryId: getCat('Pantry & Dry Goods'),
      quantity: 1,           // 1 bag
      unitSize: 2000,        // 2 kg (2000 g) per bag
      unit: 'g',
      minimumThreshold: 1,
      expirationDate: daysFromNow(730),
      locationId: getLoc('Pantry'),
    },

    // ── Beverages ─────────────────────────────────────────────────────────
    {
      itemName: 'Orange Juice',
      categoryId: getCat('Beverages'),
      quantity: 1,           // 1 carton
      unitSize: 1000,        // 1000 ml each
      unit: 'ml',
      minimumThreshold: 1,
      expirationDate: daysFromNow(7),
      locationId: getLoc('Refrigerator'),
    },
    {
      itemName: 'Sparkling Water',
      categoryId: getCat('Beverages'),
      quantity: 6,           // 6 bottles
      unitSize: 500,         // 500 ml each
      unit: 'ml',
      minimumThreshold: 4,
      expirationDate: daysFromNow(200),
      locationId: getLoc('Cabinet'),
    },
    {
      itemName: 'Coffee Beans',
      categoryId: getCat('Beverages'),
      quantity: 1,           // 1 bag
      unitSize: 250,         // 250 g per bag
      unit: 'g',
      minimumThreshold: 1,
      expirationDate: daysFromNow(180),
      locationId: getLoc('Cabinet'),
      brand: 'Blue Bottle',
    },

    // ── Frozen Foods ──────────────────────────────────────────────────────
    {
      itemName: 'Frozen Pizza',
      categoryId: getCat('Frozen Foods'),
      quantity: 2,           // 2 pizzas
      unit: 'pcs',
      minimumThreshold: 1,
      expirationDate: daysFromNow(60),
      locationId: getLoc('Freezer'),
    },
    {
      itemName: 'Mixed Berries',
      categoryId: getCat('Frozen Foods'),
      quantity: 0,           // out of stock
      unitSize: 400,         // 400 g per bag
      unit: 'g',
      minimumThreshold: 1,
      expirationDate: null,
      locationId: getLoc('Freezer'),
    },

    // ── Snacks ────────────────────────────────────────────────────────────
    {
      itemName: 'Potato Chips',
      categoryId: getCat('Snacks'),
      quantity: 2,           // 2 bags
      unitSize: 150,         // 150 g per bag
      unit: 'g',
      minimumThreshold: 1,
      expirationDate: daysFromNow(45),
      locationId: getLoc('Cabinet'),
    },

    // ── Cleaning & Household ──────────────────────────────────────────────
    {
      itemName: 'Dish Soap',
      categoryId: getCat('Cleaning & Household'),
      quantity: 1,           // 1 bottle
      unitSize: 473,         // 473 ml per bottle
      unit: 'ml',
      minimumThreshold: 1,
      expirationDate: null,
      locationId: getLoc('Cabinet'),
      brand: 'Dawn',
    },
    {
      itemName: 'Paper Towels',
      categoryId: getCat('Cleaning & Household'),
      quantity: 2,           // 2 packs
      unit: 'packs',
      minimumThreshold: 2,
      expirationDate: null,
      locationId: getLoc('Garage Storage'),
    },
    {
      itemName: 'All-Purpose Cleaner',
      categoryId: getCat('Cleaning & Household'),
      quantity: 1,           // 1 bottle
      unitSize: 750,         // 750 ml
      unit: 'ml',
      minimumThreshold: 1,
      expirationDate: null,
      locationId: getLoc('Cabinet'),
      brand: 'Method',
    },

    // ── Personal Care ─────────────────────────────────────────────────────
    {
      itemName: 'Shampoo',
      categoryId: getCat('Personal Care'),
      quantity: 1,           // 1 bottle
      unitSize: 400,         // 400 ml per bottle
      unit: 'ml',
      minimumThreshold: 1,
      expirationDate: null,
      locationId: getLoc('Cabinet'),
    },
    {
      itemName: 'Conditioner',
      categoryId: getCat('Personal Care'),
      quantity: 1,           // 1 bottle
      unitSize: 400,         // 400 ml per bottle
      unit: 'ml',
      minimumThreshold: 1,
      expirationDate: null,
      locationId: getLoc('Cabinet'),
    },
    {
      itemName: 'Hand Soap',
      categoryId: getCat('Personal Care'),
      quantity: 2,           // 2 pumps
      unitSize: 250,         // 250 ml each
      unit: 'ml',
      minimumThreshold: 1,
      expirationDate: null,
      locationId: getLoc('Cabinet'),
    },
  ];

  await InventoryItem.insertMany(
    inventoryData.map((item) => ({
      ...item,
      householdId: household._id,
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
    // auto-added (low / out of stock)
    { itemName: 'Whole Milk',    quantityNeeded: 2, unitSize: 1000, unit: 'ml',  priority: 'high',   autoAdded: true  },
    { itemName: 'Cheddar Cheese',quantityNeeded: 2, unitSize: 200,  unit: 'g',   priority: 'high',   autoAdded: true  },
    { itemName: 'Greek Yogurt',  quantityNeeded: 2, unitSize: 150,  unit: 'g',   priority: 'high',   autoAdded: true  },
    { itemName: 'Salmon Fillet', quantityNeeded: 2, unitSize: 180,  unit: 'g',   priority: 'medium', autoAdded: true  },
    { itemName: 'Mixed Berries', quantityNeeded: 2, unitSize: 400,  unit: 'g',   priority: 'medium', autoAdded: true  },
    // manually added
    { itemName: 'Apples',        quantityNeeded: 6, unitSize: null, unit: 'pcs', priority: 'low',    autoAdded: false },
    { itemName: 'Almond Milk',   quantityNeeded: 2, unitSize: 1000, unit: 'ml',  priority: 'medium', autoAdded: false },
    { itemName: 'Oat Biscuits',  quantityNeeded: 1, unitSize: 200,  unit: 'g',   priority: 'low',    autoAdded: false },
  ];

  await ShoppingListItem.insertMany(
    shoppingData.map((item) => ({
      ...item,
      categoryId: categories[0]._id,
      householdId: household._id,
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
  console.log(`📦 Inventory items : ${inventoryData.length}`);
  console.log(`🛒 Shopping items  : ${shoppingData.length}`);
  console.log('─'.repeat(40));

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
