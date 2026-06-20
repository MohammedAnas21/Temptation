export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  category: string;
  image: any;
  isPopular?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isVeg?: boolean;
  badge?: string;
  rating?: number;
  addOns?: { name: string; price: number }[];
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "all", label: "All", icon: "grid" },
  { id: "burgers", label: "Burgers", icon: "circle" },
  { id: "pizza", label: "Pizza", icon: "disc" },
  { id: "momos", label: "Momos", icon: "package" },
  { id: "wraps", label: "Wraps", icon: "rotate-cw" },
  { id: "chicken", label: "Chicken", icon: "star" },
  { id: "coffee", label: "Coffee", icon: "coffee" },
  { id: "mojitos", label: "Mojitos", icon: "droplet" },
  { id: "desserts", label: "Desserts", icon: "heart" },
];

export const menuItems: MenuItem[] = [
  {
    id: "b1",
    name: "Zinger Burger",
    description:
      "Our most-loved crispy golden chicken fillet, fresh iceberg lettuce, signature tangy sauce in a toasted sesame bun. Voted best in Kalaburagi.",
    price: 199,
    calories: 480,
    category: "burgers",
    image: require("@/assets/images/burger.png"),
    isPopular: true,
    isFeatured: true,
    isBestSeller: true,
    badge: "Fan Favourite",
    rating: 4.9,
    addOns: [
      { name: "Extra Cheese Slice", price: 30 },
      { name: "Jalapeños", price: 20 },
      { name: "Extra Sauce", price: 15 },
      { name: "Add Egg", price: 25 },
    ],
  },
  {
    id: "b2",
    name: "Temptation Special Burger",
    description:
      "Double crispy patty with caramelised onion, premium cheese, jalapeños and our house secret sauce. A flavour explosion in every bite.",
    price: 269,
    calories: 620,
    category: "burgers",
    image: require("@/assets/images/burger.png"),
    isFeatured: true,
    badge: "Chef's Pick",
    rating: 4.7,
    addOns: [
      { name: "Extra Patty", price: 60 },
      { name: "Cheese Sauce", price: 30 },
      { name: "Caramelised Onion", price: 20 },
    ],
  },
  {
    id: "b3",
    name: "Classic Chicken Burger",
    description:
      "Juicy grilled chicken, fresh garden veggies, tangy mayo on a soft brioche bun. Simple, satisfying, and consistently great.",
    price: 169,
    calories: 420,
    category: "burgers",
    image: require("@/assets/images/burger.png"),
    rating: 4.5,
    addOns: [
      { name: "Add Cheese", price: 25 },
      { name: "Extra Sauce", price: 15 },
    ],
  },
  {
    id: "b4",
    name: "Double Smash Burger",
    description:
      "Two smashed beef patties with American cheese, crunchy pickles and our signature smash sauce. Maximum flavour, minimum compromise.",
    price: 319,
    calories: 720,
    category: "burgers",
    image: require("@/assets/images/burger.png"),
    badge: "New",
    rating: 4.6,
    addOns: [
      { name: "Triple Patty Upgrade", price: 80 },
      { name: "Bacon Add-on", price: 50 },
      { name: "Truffle Sauce", price: 35 },
    ],
  },
  {
    id: "p1",
    name: "Cheese Burst Pizza",
    description:
      "A crust stuffed to bursting with molten cheese, topped with fresh mozzarella and rich tomato base. Every slice delivers an irresistible cheese pull.",
    price: 349,
    calories: 780,
    category: "pizza",
    image: require("@/assets/images/pizza.png"),
    isFeatured: true,
    isBestSeller: true,
    rating: 4.8,
    addOns: [
      { name: "Extra Cheese Topping", price: 50 },
      { name: "Olives", price: 30 },
      { name: "Jalapeños", price: 25 },
    ],
  },
  {
    id: "p2",
    name: "Chicken BBQ Pizza",
    description:
      "Smoky BBQ-glazed chicken chunks, roasted bell peppers, red onion rings on a generous mozzarella base. Smoky perfection.",
    price: 319,
    calories: 710,
    category: "pizza",
    image: require("@/assets/images/pizza.png"),
    isPopular: true,
    rating: 4.6,
    addOns: [
      { name: "Extra Chicken", price: 60 },
      { name: "BBQ Drizzle", price: 20 },
    ],
  },
  {
    id: "p3",
    name: "Margherita",
    description:
      "The timeless classic. Fresh basil leaves, premium mozzarella di bufala and vibrant San Marzano tomato sauce on a thin crispy base.",
    price: 249,
    calories: 580,
    category: "pizza",
    image: require("@/assets/images/pizza.png"),
    isVeg: true,
    rating: 4.4,
    addOns: [
      { name: "Herb Garlic Drizzle", price: 20 },
      { name: "Extra Basil", price: 10 },
    ],
  },
  {
    id: "m1",
    name: "Steamed Momos",
    description:
      "Delicate hand-folded dumplings filled with seasoned minced chicken, served piping hot with our fiery chili-garlic dipping sauce.",
    price: 149,
    calories: 280,
    category: "momos",
    image: require("@/assets/images/momos.png"),
    isPopular: true,
    rating: 4.5,
    addOns: [
      { name: "Extra Dipping Sauce", price: 20 },
      { name: "Upgrade to 9pcs", price: 40 },
    ],
  },
  {
    id: "m2",
    name: "Fried Momos",
    description:
      "Golden pan-fried dumplings, crunchy on the outside, juicy on the inside. Served with our signature spicy red chili sauce.",
    price: 169,
    calories: 340,
    category: "momos",
    image: require("@/assets/images/momos.png"),
    isFeatured: true,
    rating: 4.6,
    addOns: [
      { name: "Schezwan Sauce", price: 20 },
      { name: "Upgrade to 9pcs", price: 40 },
    ],
  },
  {
    id: "m3",
    name: "Tandoori Momos",
    description:
      "Marinated in tikka spices and char-grilled in our tandoor, these smoky dumplings with mint chutney are an absolute crowd-pleaser.",
    price: 199,
    calories: 360,
    category: "momos",
    image: require("@/assets/images/momos.png"),
    badge: "Spicy",
    rating: 4.7,
    addOns: [
      { name: "Cheese Dip", price: 30 },
      { name: "Mint Chutney Extra", price: 15 },
    ],
  },
  {
    id: "w1",
    name: "Chicken Wrap",
    description:
      "Tender grilled chicken strips, crisp lettuce, diced tomatoes, and our house cheese sauce wrapped tightly in a warm soft tortilla.",
    price: 179,
    calories: 390,
    category: "wraps",
    image: require("@/assets/images/wrap.png"),
    isPopular: true,
    isBestSeller: true,
    rating: 4.6,
    addOns: [
      { name: "Extra Cheese", price: 30 },
      { name: "Upgrade to Double Filling", price: 50 },
    ],
  },
  {
    id: "w2",
    name: "Zinger Wrap",
    description:
      "The beloved zinger fillet wrapped with our house coleslaw, pickles and signature sauce. All the zinger goodness in one neat wrap.",
    price: 199,
    calories: 430,
    category: "wraps",
    image: require("@/assets/images/wrap.png"),
    rating: 4.5,
    addOns: [
      { name: "Extra Zinger Fillet", price: 60 },
      { name: "Coleslaw Extra", price: 20 },
    ],
  },
  {
    id: "c1",
    name: "Chicken Popcorn",
    description:
      "Bite-sized pieces of premium chicken breast, coated in our secret spice blend and fried to golden perfection. Impossibly addictive.",
    price: 179,
    calories: 380,
    category: "chicken",
    image: require("@/assets/images/popcorn.png"),
    isPopular: true,
    isFeatured: true,
    isBestSeller: true,
    badge: "Fan Favourite",
    rating: 4.8,
    addOns: [
      { name: "Cheese Dipping Sauce", price: 30 },
      { name: "Extra Spicy Upgrade", price: 10 },
      { name: "Large Portion (300g)", price: 60 },
    ],
  },
  {
    id: "c2",
    name: "Chicken Wings",
    description:
      "Slow-marinated, oven-roasted then fried to perfection. Choose from BBQ, Buffalo or Honey Garlic. Served with ranch dipping sauce.",
    price: 249,
    calories: 520,
    category: "chicken",
    image: require("@/assets/images/wings.png"),
    isPopular: true,
    badge: "Must Try",
    rating: 4.7,
    addOns: [
      { name: "BBQ Flavour", price: 0 },
      { name: "Buffalo Flavour", price: 0 },
      { name: "Honey Garlic Flavour", price: 0 },
      { name: "Extra Ranch Dip", price: 20 },
    ],
  },
  {
    id: "c3",
    name: "Chicken Strips",
    description:
      "Premium breast strips hand-battered in panko crumbs, fried until perfectly crisp. Served with your choice of dipping sauce.",
    price: 219,
    calories: 460,
    category: "chicken",
    image: require("@/assets/images/popcorn.png"),
    rating: 4.5,
    addOns: [
      { name: "BBQ Sauce", price: 15 },
      { name: "Cheese Sauce", price: 25 },
      { name: "Large Portion", price: 50 },
    ],
  },
  {
    id: "cf1",
    name: "Cappuccino",
    description:
      "Perfectly balanced double-shot espresso with velvety steamed milk and a thick, creamy foam artisan pour. A cafe classic done right.",
    price: 129,
    calories: 120,
    category: "coffee",
    image: require("@/assets/images/coffee.png"),
    isVeg: true,
    rating: 4.4,
    addOns: [
      { name: "Extra Shot", price: 30 },
      { name: "Oat Milk", price: 20 },
    ],
  },
  {
    id: "cf2",
    name: "Cold Coffee",
    description:
      "Double-shot cold brew blended with premium fresh cream and crushed ice. Smooth, bold and refreshingly cold. A hot day's best friend.",
    price: 149,
    calories: 180,
    category: "coffee",
    image: require("@/assets/images/coffee.png"),
    isPopular: true,
    isVeg: true,
    rating: 4.6,
    addOns: [
      { name: "Extra Shot", price: 30 },
      { name: "Vanilla Syrup", price: 20 },
      { name: "Whipped Cream", price: 20 },
    ],
  },
  {
    id: "cf3",
    name: "Caramel Latte",
    description:
      "Smooth espresso meets steamed whole milk with a generous drizzle of our house-made caramel. Comforting and indulgent.",
    price: 159,
    calories: 210,
    category: "coffee",
    image: require("@/assets/images/coffee.png"),
    isVeg: true,
    rating: 4.5,
    addOns: [
      { name: "Extra Caramel", price: 15 },
      { name: "Extra Shot", price: 30 },
    ],
  },
  {
    id: "mj1",
    name: "Temptation Special Mojito",
    description:
      "Our signature creation — an exotic blend of seasonal fruits, freshly muddled mint leaves, premium sparkling water and a generous squeeze of fresh lime. Truly unique.",
    price: 179,
    calories: 160,
    category: "mojitos",
    image: require("@/assets/images/mojito.png"),
    isPopular: true,
    isFeatured: true,
    isBestSeller: true,
    badge: "Signature",
    isVeg: true,
    rating: 4.9,
    addOns: [
      { name: "Extra Mint", price: 10 },
      { name: "Sparkling Water Upgrade", price: 20 },
    ],
  },
  {
    id: "mj2",
    name: "Blue Lagoon Mojito",
    description:
      "Visually stunning electric blue curacao, fresh lime juice, muddled mint and premium soda. As beautiful as it is delicious.",
    price: 169,
    calories: 150,
    category: "mojitos",
    image: require("@/assets/images/mojito.png"),
    isVeg: true,
    badge: "Popular",
    rating: 4.7,
    addOns: [
      { name: "Salt Rim", price: 10 },
      { name: "Extra Lime", price: 10 },
    ],
  },
  {
    id: "mj3",
    name: "Virgin Mojito",
    description:
      "The classic. Fresh-squeezed lime, demerara sugar syrup, a generous handful of mint, topped with premium soda water. Pure, fresh, perfect.",
    price: 149,
    calories: 130,
    category: "mojitos",
    image: require("@/assets/images/mojito.png"),
    isVeg: true,
    rating: 4.5,
    addOns: [
      { name: "Strawberry Twist", price: 20 },
      { name: "Passion Fruit Twist", price: 20 },
    ],
  },
  {
    id: "mj4",
    name: "Strawberry Mojito",
    description:
      "Sun-ripened strawberries muddled with fresh basil, lime and mint, topped with sparkling soda. Summer captured in a glass.",
    price: 179,
    calories: 165,
    category: "mojitos",
    image: require("@/assets/images/mojito.png"),
    isVeg: true,
    rating: 4.6,
  },
  {
    id: "d1",
    name: "Chocolate Brownie",
    description:
      "Warm, gooey fudge brownie served with a generous scoop of vanilla ice cream and rich chocolate sauce drizzle. Absolute indulgence.",
    price: 129,
    calories: 480,
    category: "desserts",
    image: require("@/assets/images/hero_banner.png"),
    isVeg: true,
    isPopular: true,
    rating: 4.7,
    addOns: [
      { name: "Extra Ice Cream Scoop", price: 40 },
      { name: "Caramel Sauce", price: 20 },
    ],
  },
  {
    id: "d2",
    name: "Ice Cream Sundae",
    description:
      "Three generous scoops of your choice, topped with hot fudge, whipped cream and a cherry. The classic done perfectly.",
    price: 99,
    calories: 380,
    category: "desserts",
    image: require("@/assets/images/hero_banner.png"),
    isVeg: true,
    rating: 4.4,
    addOns: [
      { name: "Extra Scoop", price: 30 },
      { name: "Chocolate Sauce", price: 15 },
      { name: "Sprinkles", price: 10 },
    ],
  },
];

export const offers = [
  {
    id: "o1",
    title: "Happy Hours",
    subtitle: "20% OFF on all Mojitos",
    time: "4 PM – 7 PM",
    code: "HAPPY20",
    color: "#0A1F16",
    accent: "#40916C",
  },
  {
    id: "o2",
    title: "Burger + Mojito",
    subtitle: "Combo at just ₹299",
    time: "All Day",
    code: "COMBO299",
    color: "#1A1207",
    accent: "#C8973A",
  },
  {
    id: "o3",
    title: "Weekend Feast",
    subtitle: "Buy 2 Get 1 FREE on Wings",
    time: "Sat & Sun Only",
    code: "WINGS3",
    color: "#1A0D0D",
    accent: "#E53935",
  },
  {
    id: "o4",
    title: "First Order",
    subtitle: "₹50 OFF on your first order",
    time: "New Users",
    code: "FIRST50",
    color: "#0D1A1A",
    accent: "#00BCD4",
  },
];

export const reviews = [
  {
    id: "r1",
    name: "Prasad E.",
    rating: 5,
    text: "This place would be my most visited cafe for sure. The quality, taste and ambiance is what I crave the most — they maintained the quality which brings me here often. Best cafe in the town!",
    time: "6 months ago",
    isVerified: true,
  },
  {
    id: "r2",
    name: "Amara Z.",
    rating: 5,
    text: "One bite of it & I was hooked. Must say they served the best zinger burger I ever had in my life. Surely this will be my go-to place from now onwards!",
    time: "7 months ago",
    isVerified: true,
  },
  {
    id: "r3",
    name: "Amaan",
    rating: 5,
    text: "Really good place with great ambience & food. Must try the zinger burger — best for the price range. The Temptation Special Mojito is great too. Chicken popcorn, strips, wings are all excellent!",
    time: "a year ago",
    isVerified: true,
  },
  {
    id: "r4",
    name: "Sneha R.",
    rating: 4,
    text: "Loved it! Pizzas, chicken popcorn, momo, wrap, burger, mojitos — all fantastic. Beautiful ambience and value for money food. The menu has great variety.",
    time: "2 months ago",
    isVerified: true,
  },
];

export const events = [
  {
    id: "ev1",
    title: "Birthday Packages",
    subtitle: "Make it unforgettable",
    description:
      "Celebrate in style with our exclusive birthday packages. Dedicated table, custom cake, decorations, and special menu curation.",
    price: "Starting ₹1,999",
    image: require("@/assets/images/event_birthday.png"),
    icon: "gift",
  },
  {
    id: "ev2",
    title: "Corporate Events",
    subtitle: "Impress your team",
    description:
      "Private dining, team lunches, client meetings. Professional setup with dedicated staff and customisable menus.",
    price: "Starting ₹4,999",
    image: require("@/assets/images/ambience.png"),
    icon: "briefcase",
  },
  {
    id: "ev3",
    title: "Weekend Special Nights",
    subtitle: "Live music & vibes",
    description:
      "Every Friday & Saturday — live music, special cocktail menu, and an electric atmosphere you won't forget.",
    price: "No cover charge",
    image: require("@/assets/images/ambience.png"),
    icon: "music",
  },
];
