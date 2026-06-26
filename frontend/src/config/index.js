/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: index.js
 * Purpose: Configuration file for setting up core application settings (Security, CORS, etc).
 * Functions/Methods: 0
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */


export const sizeOptionsByCategory = {
  men: ["XS", "S", "M", "L", "XL", "XXL"],
  women: ["XS", "S", "M", "L", "XL", "XXL"],
  kids: ["2Y (86cm)", "4Y (98cm)", "6Y (110cm)", "8Y (122cm)", "10Y (134cm)", "12Y (146cm)"],
  footwear: ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
  accessories: ["One Size", "S/M", "M/L"],
};

/** Predefined tags per product category. Max 5 per product. */
export const tagsByCategory = {
  men: [
    "trendy", "oversized", "streetwear", "genz", "pure cotton",
    "premium cotton", "graphic print", "minimalist", "casual", "summer wear",
    "formal", "office wear", "slim fit", "business casual", "linen", "luxury",
    "relaxed fit", "vintage wash", "stretch denim", "urban", "baggy",
    "heavy weight", "fleece", "cozy", "winter essential",
  ],
  women: [
    "trendy", "floral", "minimalist", "casual", "summer wear", "festive",
    "ethnic", "boho", "western", "elegant", "premium", "party wear",
    "oversized", "slim fit", "comfort fit", "linen", "pastel",
    "graphic print", "streetwear", "pure cotton",
  ],
  kids: [
    "playful", "comfortable", "soft cotton", "summer wear", "school",
    "casual", "unisex", "trendy", "pastel", "vibrant colors",
  ],
  accessories: [
    "trending", "everyday carry", "minimalist", "premium", "fashion essential",
    "gifting", "luxury", "unisex", "statement piece", "classic",
  ],
  footwear: [
    "casual", "formal", "sports", "lightweight", "premium",
    "everyday", "slip-on", "lace-up", "comfort", "trending",
  ],
};

export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      { id: "men", label: "Men" },
      { id: "women", label: "Women" },
      { id: "kids", label: "Kids" },
      { id: "accessories", label: "Accessories" },
      { id: "footwear", label: "Footwear" },
    ],
  },
  {
    label: "Brand",
    name: "brand",
    componentType: "select",
    options: [
      { id: "nike", label: "Nike" },
      { id: "adidas", label: "Adidas" },
      { id: "puma", label: "Puma" },
      { id: "levi", label: "Levi's" },
      { id: "zara", label: "Zara" },
      { id: "h&m", label: "H&M" },
      { id: "baesd", label: "BAESD" },
      { id: "arvesa", label: "Arvesa" },
      { id: "wear_your_mind", label: "Wear Your Mind" },
      { id: "pantaloons_junior", label: "Pantaloons Junior" },
      { id: "lulu_sky", label: "LULU & SKY" },
      { id: "dezin", label: "Dezin" },
      { id: "yk_disney", label: "YK Disney" },
      { id: "nusyl", label: "NUSYL" },
      { id: "urbanic", label: "Urbanic" },
      { id: "forever_21", label: "Forever 21" },
      { id: "mango", label: "Mango" },
      { id: "vero_moda", label: "Vero Moda" },
      { id: "only", label: "Only" },
      { id: "jack_jones", label: "Jack & Jones" },
      { id: "tommy_hilfiger", label: "Tommy Hilfiger" },
      { id: "calvin_klein", label: "Calvin Klein" },
      { id: "superdry", label: "Superdry" },
      { id: "under_armour", label: "Under Armour" },
      { id: "reebok", label: "Reebok" },
      { id: "fila", label: "Fila" },
      { id: "asics", label: "Asics" },
      { id: "skechers", label: "Skechers" },
      { id: "crocs", label: "Crocs" },
      { id: "bata", label: "Bata" },
      { id: "allen_solly", label: "Allen Solly" },
      { id: "van_heusen", label: "Van Heusen" },
      { id: "peter_england", label: "Peter England" },
      { id: "louis_philippe", label: "Louis Philippe" },
      { id: "w", label: "W" },
      { id: "biba", label: "Biba" },
      { id: "global_desi", label: "Global Desi" },
      { id: "fabindia", label: "FabIndia" },
    ],
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
  },
  {
    label: "Sale Price",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter sale price (optional)",
  },
];

/**
 * Basic info fields only (title, description, category, brand).
 * Used in the admin product dialog "Basic Info" section.
 * Pricing is rendered separately in a custom side-by-side grid.
 */
export const addProductBasicInfoElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      { id: "men", label: "Men" },
      { id: "women", label: "Women" },
      { id: "kids", label: "Kids" },
      { id: "accessories", label: "Accessories" },
      { id: "footwear", label: "Footwear" },
    ],
  },
  {
    label: "Brand",
    name: "brand",
    componentType: "select",
    options: [
      { id: "nike", label: "Nike" },
      { id: "adidas", label: "Adidas" },
      { id: "puma", label: "Puma" },
      { id: "levi", label: "Levi's" },
      { id: "zara", label: "Zara" },
      { id: "h&m", label: "H&M" },
      { id: "baesd", label: "BAESD" },
      { id: "arvesa", label: "Arvesa" },
      { id: "wear_your_mind", label: "Wear Your Mind" },
      { id: "pantaloons_junior", label: "Pantaloons Junior" },
      { id: "lulu_sky", label: "LULU & SKY" },
      { id: "dezin", label: "Dezin" },
      { id: "yk_disney", label: "YK Disney" },
      { id: "nusyl", label: "NUSYL" },
      { id: "urbanic", label: "Urbanic" },
      { id: "forever_21", label: "Forever 21" },
      { id: "mango", label: "Mango" },
      { id: "vero_moda", label: "Vero Moda" },
      { id: "only", label: "Only" },
      { id: "jack_jones", label: "Jack & Jones" },
      { id: "tommy_hilfiger", label: "Tommy Hilfiger" },
      { id: "calvin_klein", label: "Calvin Klein" },
      { id: "superdry", label: "Superdry" },
      { id: "under_armour", label: "Under Armour" },
      { id: "reebok", label: "Reebok" },
      { id: "fila", label: "Fila" },
      { id: "asics", label: "Asics" },
      { id: "skechers", label: "Skechers" },
      { id: "crocs", label: "Crocs" },
      { id: "bata", label: "Bata" },
      { id: "allen_solly", label: "Allen Solly" },
      { id: "van_heusen", label: "Van Heusen" },
      { id: "peter_england", label: "Peter England" },
      { id: "louis_philippe", label: "Louis Philippe" },
      { id: "w", label: "W" },
      { id: "biba", label: "Biba" },
      { id: "global_desi", label: "Global Desi" },
      { id: "fabindia", label: "FabIndia" },
    ],
  },
];


export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/shop/home",
  },
  {
    id: "products",
    label: "Products",
    path: "/shop/listing",
  },
  {
    id: "about",
    label: "About Us",
    path: "/shop/about",
  },
  {
    id: "contact",
    label: "Contact",
    path: "/shop/contact",
  },
];

export const categoryOptionsMap = {
  men: "Men",
  women: "Women",
  kids: "Kids",
  accessories: "Accessories",
  footwear: "Footwear",
};

export const brandOptionsMap = {
  nike: "Nike",
  adidas: "Adidas",
  puma: "Puma",
  levi: "Levi",
  zara: "Zara",
  "h&m": "H&M",
  baesd: "BAESD",
  arvesa: "Arvesa",
  wear_your_mind: "Wear Your Mind",
  pantaloons_junior: "Pantaloons Junior",
  lulu_sky: "LULU & SKY",
  dezin: "Dezin",
  yk_disney: "YK Disney",
  nusyl: "NUSYL",
  urbanic: "Urbanic",
  forever_21: "Forever 21",
  mango: "Mango",
  vero_moda: "Vero Moda",
  only: "Only",
  jack_jones: "Jack & Jones",
  tommy_hilfiger: "Tommy Hilfiger",
  calvin_klein: "Calvin Klein",
  superdry: "Superdry",
  under_armour: "Under Armour",
  reebok: "Reebok",
  fila: "Fila",
  asics: "Asics",
  skechers: "Skechers",
  crocs: "Crocs",
  bata: "Bata",
  allen_solly: "Allen Solly",
  van_heusen: "Van Heusen",
  peter_england: "Peter England",
  louis_philippe: "Louis Philippe",
  w: "W",
  biba: "Biba",
  global_desi: "Global Desi",
  fabindia: "FabIndia",
};

export const filterOptions = {
  category: [
    { id: "men", label: "Men" },
    { id: "women", label: "Women" },
    { id: "kids", label: "Kids" },
    { id: "accessories", label: "Accessories" },
    { id: "footwear", label: "Footwear" },
  ],
  brand: [
    { id: "nike", label: "Nike" },
    { id: "adidas", label: "Adidas" },
    { id: "puma", label: "Puma" },
    { id: "levi", label: "Levi's" },
    { id: "zara", label: "Zara" },
    { id: "h&m", label: "H&M" },
    { id: "baesd", label: "BAESD" },
    { id: "arvesa", label: "Arvesa" },
    { id: "wear_your_mind", label: "Wear Your Mind" },
    { id: "pantaloons_junior", label: "Pantaloons Junior" },
    { id: "lulu_sky", label: "LULU & SKY" },
    { id: "dezin", label: "Dezin" },
    { id: "yk_disney", label: "YK Disney" },
    { id: "nusyl", label: "NUSYL" },
    { id: "urbanic", label: "Urbanic" },
    { id: "forever_21", label: "Forever 21" },
    { id: "mango", label: "Mango" },
    { id: "vero_moda", label: "Vero Moda" },
    { id: "only", label: "Only" },
    { id: "jack_jones", label: "Jack & Jones" },
    { id: "tommy_hilfiger", label: "Tommy Hilfiger" },
    { id: "calvin_klein", label: "Calvin Klein" },
    { id: "superdry", label: "Superdry" },
    { id: "under_armour", label: "Under Armour" },
    { id: "reebok", label: "Reebok" },
    { id: "fila", label: "Fila" },
    { id: "asics", label: "Asics" },
    { id: "skechers", label: "Skechers" },
    { id: "crocs", label: "Crocs" },
    { id: "bata", label: "Bata" },
    { id: "allen_solly", label: "Allen Solly" },
    { id: "van_heusen", label: "Van Heusen" },
    { id: "peter_england", label: "Peter England" },
    { id: "louis_philippe", label: "Louis Philippe" },
    { id: "w", label: "W" },
    { id: "biba", label: "Biba" },
    { id: "global_desi", label: "Global Desi" },
    { id: "fabindia", label: "FabIndia" },
  ],
};

export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];
