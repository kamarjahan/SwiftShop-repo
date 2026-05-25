import Fuse from "fuse.js";

// Standard E-commerce Colors
const KNOWN_COLORS = [
  "red", "blue", "green", "black", "white", "yellow", 
  "pink", "purple", "orange", "grey", "gray", "brown", 
  "navy", "teal", "maroon", "olive", "silver", "gold"
];

// Standard E-commerce Synonyms
const SYNONYMS: Record<string, string[]> = {
  "shoes": ["sneakers", "kicks", "footwear", "boots", "trainers"],
  "pants": ["trousers", "jeans", "bottoms", "slacks", "chinos", "joggers"],
  "shirt": ["tshirt", "t-shirt", "tee", "top", "blouse", "button-down"],
  "jacket": ["coat", "windbreaker", "parka", "hoodie", "pullover", "sweater"],
  "bag": ["backpack", "purse", "tote", "handbag", "luggage"],
  "watch": ["smartwatch", "timepiece", "clock"],
  "phone": ["smartphone", "mobile", "cellphone"],
  "laptop": ["computer", "pc", "macbook", "notebook"]
};

// Map synonym back to its root category word for searching
function getRootWord(word: string): string {
  const lower = word.toLowerCase();
  for (const [root, synonyms] of Object.entries(SYNONYMS)) {
    if (root === lower || synonyms.includes(lower)) {
      return root;
    }
  }
  return lower;
}

export interface IntentFilters {
  colors: string[];
  cleanQuery: string;
}

/**
 * Parses a natural language query to extract intents like colors,
 * and normalizes synonyms.
 * Example: "black kicks" -> { colors: ["black"], cleanQuery: "shoes" }
 */
export function parseSearchIntent(rawQuery: string): IntentFilters {
  const words = rawQuery.toLowerCase().split(/\s+/);
  
  const extractedColors: string[] = [];
  const remainingWords: string[] = [];

  for (const word of words) {
    if (KNOWN_COLORS.includes(word)) {
      extractedColors.push(word);
    } else {
      // Apply synonym mapping
      remainingWords.push(getRootWord(word));
    }
  }

  return {
    colors: extractedColors,
    cleanQuery: remainingWords.join(" ")
  };
}

/**
 * Runs the smart search pipeline using Fuse.js and intent filters
 */
export function executeSmartSearch(products: any[], rawQuery: string) {
  if (!rawQuery.trim()) return [];

  const { colors, cleanQuery } = parseSearchIntent(rawQuery);

  // If the query was *only* colors (e.g. user just searched "blue"), 
  // we fallback to using the colors as the query.
  const searchQuery = cleanQuery.trim() || colors.join(" ");

  // 1. Fuzzy Search with Fuse.js
  const fuse = new Fuse(products, {
    keys: [
      { name: 'name', weight: 3 },
      { name: 'category', weight: 2 },
      { name: 'description', weight: 1 },
      { name: 'tags', weight: 2 },
      { name: 'variants.name', weight: 1 }
    ],
    threshold: 0.3, // 0.0 requires perfect match, 1.0 matches anything. 0.3 handles typos well.
    ignoreLocation: true,
    includeScore: true
  });

  let results = fuse.search(searchQuery).map(result => result.item);

  // 2. Apply Intent Filters (Color Filtering)
  if (colors.length > 0) {
    results = results.filter(product => {
      const productText = [
        product.name,
        product.category,
        product.description,
        ...(product.variants?.map((v: any) => v.name) || [])
      ].join(" ").toLowerCase();

      // Check if ANY of the extracted colors exist in the product's data/variants
      return colors.some(color => productText.includes(color));
    });
  }

  return results;
}
