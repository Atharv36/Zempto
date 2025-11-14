import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:8080/api';
const PRODUCT_FOLDER = path.join(process.env.HOME || '/Users/atharv', 'Downloads/product');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let categories = [];
let subcategories = [];
let productCount = 0;
let errorCount = 0;
let authToken = null;

// Fetch all categories
async function fetchCategories() {
  try {
    console.log(`${colors.blue}Fetching categories...${colors.reset}`);
    const response = await axios.get(`${API_BASE_URL}/category/get`);
    categories = response.data.data || [];
    console.log(`${colors.green}✓ Found ${categories.length} categories${colors.reset}`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat._id})`);
    });
  } catch (error) {
    console.error(`${colors.red}Error fetching categories: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Fetch all subcategories
async function fetchSubcategories() {
  try {
    console.log(`\n${colors.blue}Fetching subcategories...${colors.reset}`);
    const response = await axios.post(`${API_BASE_URL}/subcategory/get`, {});
    subcategories = response.data.data || [];
    console.log(`${colors.green}✓ Found ${subcategories.length} subcategories${colors.reset}`);
    
    // Group by category for easier viewing
    const groupedByCategory = {};
    subcategories.forEach(subcat => {
      const catId = subcat.category?.[0]?._id;
      const catName = subcat.category?.[0]?.name || 'Unknown';
      if (!groupedByCategory[catName]) groupedByCategory[catName] = [];
      groupedByCategory[catName].push(subcat);
    });
    
    Object.entries(groupedByCategory).forEach(([catName, subcats]) => {
      console.log(`\n  ${colors.yellow}${catName}:${colors.reset}`);
      subcats.forEach(subcat => {
        console.log(`    - ${subcat.name} (ID: ${subcat._id})`);
      });
    });
  } catch (error) {
    console.error(`${colors.red}Error fetching subcategories: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Get admin access token
async function getAdminToken() {
  try {
    console.log(`${colors.blue}Getting admin access token...${colors.reset}`);
    
    // Login with admin credentials
    const loginResponse = await axios.post(`${API_BASE_URL}/user/login`, {
      email: 'atharvuskaikar@gmail.com',
      password: '1111'
    });
    
    if (loginResponse.data.success) {
      authToken = loginResponse.data.data.accessToken;
      console.log(`${colors.green}✓ Got admin token${colors.reset}`);
      return authToken;
    } else {
      throw new Error(loginResponse.data.message || 'Login failed');
    }
  } catch (error) {
    console.error(`${colors.red}Authentication failed: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Make sure the backend is running and credentials are correct.${colors.reset}`);
    return null;
  }
}

// Upload image to Cloudinary via API
async function uploadImage(imagePath, productName) {
  try {
    const formData = new FormData();
    // Read file as buffer instead of stream for better compatibility
    const fileBuffer = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);
    
    formData.append('image', fileBuffer, {
      filename: fileName,
      contentType: 'image/jpeg', // Default, will be detected automatically
    });
    
    // Get form data headers first
    const formHeaders = formData.getHeaders();
    
    const response = await axios.post(
      `${API_BASE_URL}/file/upload`,
      formData,
      {
        headers: {
          ...formHeaders,
          'Authorization': `Bearer ${authToken}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    
    if (response.data.success) {
      return response.data.data.url || response.data.data.secure_url;
    } else {
      throw new Error(response.data.message || 'Upload failed');
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.warn(`  ${colors.yellow}⚠ Could not upload image ${path.basename(imagePath)}: ${errorMsg}${colors.reset}`);
    if (error.response?.status === 400) {
      console.warn(`    ${colors.yellow}Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}${colors.reset}`);
      // Debug: Check if token is being sent
      if (errorMsg.includes('Token')) {
        console.warn(`    ${colors.yellow}Debug: Auth token present: ${authToken ? 'Yes' : 'No'}${colors.reset}`);
      }
    }
    return null;
  }
}

// Helper function to normalize strings for comparison (removes extra spaces, special chars)
function normalizeString(str) {
  return str.toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[&,]/g, '')
    .replace(/pan corner/gi, 'paan corner') // Handle pan/paan spelling
    .replace(/biscuits?/gi, 'biskut') // Handle biscuits/biskut
    .replace(/chyanwanprash/gi, 'chyawnprash') // Handle spelling variations
    .trim();
}

// Find category ID by name (handles case-insensitive and fuzzy matching)
function findCategoryId(folderName) {
  // Special mappings for known mismatches
  const specialMappings = {
    'Tea, Coffee & Health Drink': 'Tea , Coffee & Health Drink',
    'Tea, Coffee and Health Drink': 'Tea , Coffee & Health Drink',
    'pan corner': 'Paan Corner',
    'Pan Corner': 'Paan Corner',
  };
  
  // Check special mappings first
  if (specialMappings[folderName]) {
    const mappedName = specialMappings[folderName];
    const cat = categories.find(c => c.name === mappedName);
    if (cat) {
      console.log(`    ${colors.yellow}⚠ Mapped "${folderName}" to "${cat.name}"${colors.reset}`);
      return { id: cat._id, dbName: cat.name };
    }
  }
  
  // First try exact match (case-insensitive)
  let cat = categories.find(c => c.name.toLowerCase() === folderName.toLowerCase());
  if (cat) {
    return { id: cat._id, dbName: cat.name };
  }
  
  // Try normalized match (removes extra spaces, special chars)
  const normalizedFolder = normalizeString(folderName);
  cat = categories.find(c => normalizeString(c.name) === normalizedFolder);
  if (cat) {
    console.log(`    ${colors.yellow}⚠ Matched "${folderName}" to "${cat.name}"${colors.reset}`);
    return { id: cat._id, dbName: cat.name };
  }
  
  // Try partial match (folder name contains category name or vice versa)
  cat = categories.find(c => {
    const catNorm = normalizeString(c.name);
    return catNorm.includes(normalizedFolder) || normalizedFolder.includes(catNorm);
  });
  if (cat) {
    console.log(`    ${colors.yellow}⚠ Fuzzy matched "${folderName}" to "${cat.name}"${colors.reset}`);
    return { id: cat._id, dbName: cat.name };
  }
  
  return null;
}

// Find subcategory ID by name and category ID (case-insensitive with fuzzy matching)
function findSubcategoryId(subcategoryName, categoryId) {
  // First try exact match (case-insensitive)
  let subcat = subcategories.find(
    s => s.name.toLowerCase() === subcategoryName.toLowerCase() && s.category?.[0]?._id === categoryId
  );
  if (subcat) {
    return subcat._id;
  }
  
  // Try normalized match (removes special chars, extra spaces)
  const normalizedSubcat = normalizeString(subcategoryName);
  subcat = subcategories.find(
    s => normalizeString(s.name) === normalizedSubcat && s.category?.[0]?._id === categoryId
  );
  if (subcat) {
    console.log(`      ${colors.yellow}⚠ Matched subcategory "${subcategoryName}" to "${subcat.name}"${colors.reset}`);
    return subcat._id;
  }
  
  // Try with "&" replaced by "and" or vice versa
  const altName1 = subcategoryName.replace(/ & /g, ' and ').replace(/ and /g, ' & ');
  if (altName1 !== subcategoryName) {
    subcat = subcategories.find(
      s => normalizeString(s.name) === normalizeString(altName1) && s.category?.[0]?._id === categoryId
    );
    if (subcat) {
      console.log(`      ${colors.yellow}⚠ Matched subcategory "${subcategoryName}" to "${subcat.name}" (via &/and replacement)${colors.reset}`);
      return subcat._id;
    }
  }
  
  // Try partial match (one contains the other)
  subcat = subcategories.find(
    s => {
      const subcatNorm = normalizeString(s.name);
      const folderNorm = normalizedSubcat;
      // Check if one contains the other (at least 70% match)
      const longer = folderNorm.length > subcatNorm.length ? folderNorm : subcatNorm;
      const shorter = folderNorm.length > subcatNorm.length ? subcatNorm : folderNorm;
      return longer.includes(shorter) && shorter.length >= Math.max(3, longer.length * 0.5)
        && s.category?.[0]?._id === categoryId;
    }
  );
  if (subcat) {
    console.log(`      ${colors.yellow}⚠ Fuzzy matched subcategory "${subcategoryName}" to "${subcat.name}"${colors.reset}`);
    return subcat._id;
  }
  
  // Try word-by-word matching (if most words match)
  const folderWords = normalizedSubcat.split(/\s+/).filter(w => w.length > 2);
  subcat = subcategories.find(
    s => {
      if (s.category?.[0]?._id !== categoryId) return false;
      const dbWords = normalizeString(s.name).split(/\s+/).filter(w => w.length > 2);
      const matchingWords = folderWords.filter(fw => dbWords.some(dw => dw.includes(fw) || fw.includes(dw)));
      return matchingWords.length >= Math.min(folderWords.length, dbWords.length) * 0.6;
    }
  );
  if (subcat) {
    console.log(`      ${colors.yellow}⚠ Word-matched subcategory "${subcategoryName}" to "${subcat.name}"${colors.reset}`);
    return subcat._id;
  }
  
  // Try matching singular/plural variations (e.g., "Bar" vs "Bars", "milk" vs "Milk")
  const singularPluralVariations = [
    { from: /^bars?$/i, to: 'bar' },
    { from: /^milk$/i, to: 'milk' },
    { from: /^cheese$/i, to: 'cheese' },
    { from: /^oats?$/i, to: 'oat' },
    { from: /^muesli$/i, to: 'muesli' },
  ];
  
  let normalizedForVariations = normalizedSubcat;
  for (const variation of singularPluralVariations) {
    normalizedForVariations = normalizedForVariations.replace(variation.from, variation.to);
  }
  
  subcat = subcategories.find(
    s => {
      if (s.category?.[0]?._id !== categoryId) return false;
      let dbNormalized = normalizeString(s.name);
      for (const variation of singularPluralVariations) {
        dbNormalized = dbNormalized.replace(variation.from, variation.to);
      }
      return dbNormalized === normalizedForVariations || 
             dbNormalized.includes(normalizedForVariations) || 
             normalizedForVariations.includes(dbNormalized);
    }
  );
  if (subcat) {
    console.log(`      ${colors.yellow}⚠ Variation-matched subcategory "${subcategoryName}" to "${subcat.name}"${colors.reset}`);
    return subcat._id;
  }
  
  return null;
}

// Create product
async function createProduct(productData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/product/create`,
      productData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Creation failed');
    }
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || error.message);
    }
    throw error;
  }
}

// Process a single product folder
async function processProductFolder(categoryPath, categoryName, subcategoryPath, subcategoryName, productPath, productName) {
  try {
    // Find category and subcategory IDs
    const categoryResult = findCategoryId(categoryName);
    if (!categoryResult) {
      console.log(`  ${colors.red}✗ Category "${categoryName}" not found in database${colors.reset}`);
      console.log(`    ${colors.yellow}Available categories:${colors.reset}`);
      categories.forEach(cat => console.log(`      - ${cat.name}`));
      errorCount++;
      return;
    }
    
    const categoryId = categoryResult.id;
    const dbCategoryName = categoryResult.dbName;
    
    // Try to match subcategory with fuzzy matching
    let subcategoryId = findSubcategoryId(subcategoryName, categoryId);
    
    // If not found, try with "&" replaced by "and" or vice versa
    if (!subcategoryId) {
      const altName = subcategoryName.replace(/ & /g, ' and ').replace(/ and /g, ' & ');
      if (altName !== subcategoryName) {
        subcategoryId = findSubcategoryId(altName, categoryId);
        if (subcategoryId) {
          console.log(`    ${colors.yellow}⚠ Matched subcategory "${subcategoryName}" to "${altName}"${colors.reset}`);
        }
      }
    }
    
    if (!subcategoryId) {
      console.log(`  ${colors.red}✗ Subcategory "${subcategoryName}" not found for category "${dbCategoryName}"${colors.reset}`);
      console.log(`    ${colors.yellow}Available subcategories for this category:${colors.reset}`);
      const availableSubcats = subcategories
        .filter(s => s.category?.[0]?._id === categoryId)
        .map(s => s.name);
      availableSubcats.forEach(name => console.log(`      - ${name}`));
      errorCount++;
      return;
    }
    
    // Get all images in the product folder
    const imageFiles = fs.readdirSync(productPath)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .sort();
    
    if (imageFiles.length === 0) {
      console.log(`  ${colors.yellow}⚠ No images found for "${productName}"${colors.reset}`);
      return;
    }
    
    // Upload images
    console.log(`  ${colors.blue}Uploading ${imageFiles.length} images...${colors.reset}`);
    const uploadedImages = [];
    
    for (const imageFile of imageFiles) {
      const imagePath = path.join(productPath, imageFile);
      const imageUrl = await uploadImage(imagePath, productName);
      if (imageUrl) {
        uploadedImages.push(imageUrl);
        console.log(`    ${colors.green}✓${colors.reset} ${imageFile}`);
      }
    }
    
    if (uploadedImages.length === 0) {
      console.log(`  ${colors.red}✗ No images could be uploaded for "${productName}"${colors.reset}`);
      errorCount++;
      return;
    }
    
    // Generate random price between 50 and 2000
    const basePrice = Math.floor(Math.random() * 1950) + 50;
    // Random discount between 0-30%
    const discountPercent = Math.floor(Math.random() * 31);
    const discountAmount = Math.floor(basePrice * discountPercent / 100);
    
    // Random units for products
    const units = [
      '1 kg',
      '500 gms',
      '250 gms',
      '1 piece',
      'pack of 2',
      'pack of 3',
      '500 ml',
      '1 litre',
      '250 ml',
      'dozen',
      'bunch',
      'pack of 4',
      '750 gms',
      '1.5 kg',
      '2 kg'
    ];
    const randomUnit = units[Math.floor(Math.random() * units.length)];
    
    // Random stock between 50-500
    const stock = Math.floor(Math.random() * 451) + 50;
    
    // Create product
    const productData = {
      name: productName,
      image: uploadedImages,
      category: [categoryId],
      subCategory: [subcategoryId],
      unit: randomUnit,
      stock: stock,
      price: basePrice,
      discount: discountAmount,
      description: `${productName} - ${subcategoryName}. Available in ${randomUnit}.`,
      more_details: {},
    };
    
    const createdProduct = await createProduct(productData);
    console.log(`  ${colors.green}✓ Product created successfully (ID: ${createdProduct._id})${colors.reset}`);
    productCount++;
  } catch (error) {
    console.log(`  ${colors.red}✗ Error: ${error.message}${colors.reset}`);
    errorCount++;
  }
}

// Walk through the product directory and process all products
async function walkProductDirectory(testCategory = null, targetFolderNames = null) {
  try {
    if (!fs.existsSync(PRODUCT_FOLDER)) {
      console.error(`${colors.red}Product folder not found: ${PRODUCT_FOLDER}${colors.reset}`);
      process.exit(1);
    }
    
    let categories_list = fs.readdirSync(PRODUCT_FOLDER)
      .filter(item => {
        const fullPath = path.join(PRODUCT_FOLDER, item);
        return fs.statSync(fullPath).isDirectory() && !item.startsWith('.');
      })
      .sort();
    
    // If testCategory is specified, filter to only that category
    if (testCategory) {
      categories_list = categories_list.filter(cat => 
        cat.toLowerCase().includes(testCategory.toLowerCase()) || 
        testCategory.toLowerCase().includes(cat.toLowerCase())
      );
      console.log(`\n${colors.yellow}TEST MODE: Processing only "${testCategory}" category${colors.reset}`);
    }
    
    // If targetFolderNames array is specified, filter to only those folder names
    if (targetFolderNames && Array.isArray(targetFolderNames) && targetFolderNames.length > 0) {
      categories_list = categories_list.filter(folderName => 
        targetFolderNames.includes(folderName)
      );
      console.log(`\n${colors.yellow}Processing specific folders: ${targetFolderNames.join(', ')}${colors.reset}`);
    }
    
    console.log(`\n${colors.blue}Found ${categories_list.length} categories to process${colors.reset}\n`);
    
    for (const categoryName of categories_list) {
      const categoryPath = path.join(PRODUCT_FOLDER, categoryName);
      console.log(`${colors.yellow}Category: ${categoryName}${colors.reset}`);
      
      const subcategories_list = fs.readdirSync(categoryPath)
        .filter(item => {
          const fullPath = path.join(categoryPath, item);
          return fs.statSync(fullPath).isDirectory() && !item.startsWith('.');
        })
        .sort();
      
      for (const subcategoryName of subcategories_list) {
        const subcategoryPath = path.join(categoryPath, subcategoryName);
        console.log(`  ${colors.blue}SubCategory: ${subcategoryName}${colors.reset}`);
        
        let products_list = fs.readdirSync(subcategoryPath)
          .filter(item => {
            const fullPath = path.join(subcategoryPath, item);
            return fs.statSync(fullPath).isDirectory() && !item.startsWith('.');
          })
          .sort();
        
        // Limit to 3-5 products per subcategory
        const maxProducts = Math.min(products_list.length, Math.floor(Math.random() * 3) + 3); // Random between 3-5
        if (products_list.length > maxProducts) {
          // Randomly shuffle and take first maxProducts
          products_list = products_list.sort(() => Math.random() - 0.5).slice(0, maxProducts);
          console.log(`    ${colors.yellow}⚠ Limiting to ${maxProducts} products (out of ${fs.readdirSync(subcategoryPath).filter(item => {
            const fullPath = path.join(subcategoryPath, item);
            return fs.statSync(fullPath).isDirectory() && !item.startsWith('.');
          }).length} total)${colors.reset}`);
        }
        
        for (const productName of products_list) {
          const productPath = path.join(subcategoryPath, productName);
          console.log(`    ${colors.blue}Product: ${productName}${colors.reset}`);
          
          await processProductFolder(
            categoryPath,
            categoryName,
            subcategoryPath,
            subcategoryName,
            productPath,
            productName
          );
          
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error walking directory: ${error.message}${colors.reset}`);
  }
}

// Main execution
async function main() {
  console.log(`${colors.blue}=== Product Upload Script ===${colors.reset}\n`);
  
  // Try to get auth token
  authToken = await getAdminToken();
  
  if (!authToken) {
    console.error(`${colors.red}Authentication token required. Cannot proceed without it.${colors.reset}`);
    console.log(`${colors.yellow}Please ensure your backend is running and an admin account exists.${colors.reset}`);
    process.exit(1);
  }
  
  await fetchCategories();
  await fetchSubcategories();
  
  console.log(`\n${colors.blue}=== Starting Product Upload ===${colors.reset}\n`);
  
  // Process specific categories - use exact database category names
  // Note: Snacks & Munchies has 0 subcategories in database, so skipping it
  const targetDbCategoryNames = [
    'Bakery & Biskut',
    'Breakfast & Instant food',
    'Cold Drink & Juices',
    'Dairy , Breads & Eggs'
    // 'Snacks & Munchies' - Skipped: has 0 subcategories in database
  ];
  
  // Map folder names to database category names
  const folderToDbMapping = {
    'Bakery & Biscuits': 'Bakery & Biskut',  // Folder has "Biscuits", DB has "Biskut"
    'Breakast & Instant Food': 'Breakfast & Instant food',  // Folder has typo "Breakast", DB has "Breakfast"
    'Cold Drinks & Juices': 'Cold Drink & Juices',  // Folder has "Drinks", DB has "Drink"
    'Dairy, Bread & Eggs': 'Dairy , Breads & Eggs',  // Folder has "Bread" (singular), DB has "Breads" (plural)
    'Dairy, Breads & Eggs': 'Dairy , Breads & Eggs',
    'Dairy , Breads & Eggs': 'Dairy , Breads & Eggs',
    'Dairy, Bread & Eggs': 'Dairy , Breads & Eggs',  // Same as first but keeping for clarity
    'Snacks & Munchies': 'Snacks & Munchies'  // Same
  };
  
  // Get all folder names from Downloads/product
  const allFolderNames = fs.readdirSync(PRODUCT_FOLDER)
    .filter(item => {
      const fullPath = path.join(PRODUCT_FOLDER, item);
      return fs.statSync(fullPath).isDirectory() && !item.startsWith('.');
    });
  
  // Match database categories with folder names
  const matchedFolders = [];
  console.log(`\n${colors.yellow}Matching database categories with folder names...${colors.reset}`);
  
  // First, find all folders that might match our target categories
  for (const dbCategoryName of targetDbCategoryNames) {
    const category = categories.find(c => c.name === dbCategoryName);
    if (!category) {
      console.log(`  ${colors.red}✗ Category "${dbCategoryName}" not found in database${colors.reset}`);
      continue;
    }
    
    // Try to find matching folder name
    let matchedFolder = null;
    
    // First check the explicit mapping
    for (const [folderName, mappedDbName] of Object.entries(folderToDbMapping)) {
      if (mappedDbName === dbCategoryName && allFolderNames.includes(folderName)) {
        matchedFolder = folderName;
        break;
      }
    }
    
    // If not found in mapping, try fuzzy matching
    if (!matchedFolder) {
      for (const folderName of allFolderNames) {
        const categoryResult = findCategoryId(folderName);
        if (categoryResult && categoryResult.id === category._id) {
          matchedFolder = folderName;
          break;
        }
      }
    }
    
    if (matchedFolder) {
      matchedFolders.push(matchedFolder);
      console.log(`  ${colors.green}✓ Matched folder "${matchedFolder}" → database category "${dbCategoryName}" (ID: ${category._id})${colors.reset}`);
    } else {
      console.log(`  ${colors.yellow}⚠ No matching folder found for database category "${dbCategoryName}"${colors.reset}`);
    }
  }
  
  if (matchedFolders.length === 0) {
    console.log(`\n${colors.red}No matching folders found. Exiting.${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`\n${colors.blue}Processing ${matchedFolders.length} matched categories...${colors.reset}\n`);
  
  await walkProductDirectory(null, matchedFolders);
  
  console.log(`\n${colors.blue}=== Upload Summary ===${colors.reset}`);
  console.log(`${colors.green}✓ Products created: ${productCount}${colors.reset}`);
  console.log(`${colors.red}✗ Errors: ${errorCount}${colors.reset}\n`);
}

main().catch(console.error);
