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
  { id: "cold-coffee", label: "Cold Coffee", icon: "coffee" },
  { id: "hot-coffee", label: "Hot Coffee", icon: "coffee" },
  { id: "pizza", label: "Pizza", icon: "disc" },
  { id: "shakes", label: "Shakes", icon: "droplet" },
  { id: "mojitos", label: "Mojitos", icon: "wind" },
  { id: "burgers", label: "Burgers", icon: "circle" },
  { id: "wraps", label: "Wraps", icon: "rotate-cw" },
  { id: "sandwiches", label: "Sandwiches", icon: "square" },
  { id: "fries", label: "Fries", icon: "star" },
  { id: "chicken", label: "Chicken", icon: "award" },
  { id: "veg-starters", label: "Veg Starters", icon: "heart" },
  { id: "waffles", label: "Waffles", icon: "sun" },
];

export const menuItems: MenuItem[] = [
  // ── Cold Coffee ──
  { id: "cc1", name: "Classic Cold Coffee", description: "Chilled, creamy and perfectly sweetened — the classic cold coffee that started it all. Refreshingly smooth with every sip.", price: 100, calories: 160, category: "cold-coffee", image: require("@/assets/images/coffee.png"), isPopular: true, isVeg: true, rating: 4.5, addOns: [{ name: "Extra Shot", price: 30 }, { name: "Whipped Cream", price: 20 }] },
  { id: "cc2", name: "Cold Coffee Double Shot", description: "Double the espresso, double the kick. For those who like their cold coffee bold and strong.", price: 120, calories: 180, category: "cold-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.6, addOns: [{ name: "Extra Shot", price: 30 }, { name: "Vanilla Syrup", price: 20 }] },
  { id: "cc3", name: "Cold Coffee By Two", description: "A generous pitcher of our signature cold coffee — perfect for sharing with a friend.", price: 140, calories: 320, category: "cold-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.4 },
  { id: "cc4", name: "Cold Coffee With Ice Cream", description: "Our classic cold coffee topped with a generous scoop of vanilla ice cream. Dessert and drink in one.", price: 140, calories: 280, category: "cold-coffee", image: require("@/assets/images/coffee.png"), isFeatured: true, isVeg: true, rating: 4.7, badge: "Trending" },
  { id: "cc5", name: "Choco Cold Coffee", description: "Rich chocolate syrup meets creamy cold coffee. A chocolate lover's dream come true.", price: 120, calories: 210, category: "cold-coffee", image: require("@/assets/images/coffee.png"), isPopular: true, isVeg: true, rating: 4.6, addOns: [{ name: "Extra Chocolate Drizzle", price: 20 }] },
  { id: "cc6", name: "Caramel Cold Coffee", description: "Buttery caramel swirled into chilled coffee perfection. Sweet, bold and utterly satisfying.", price: 130, calories: 200, category: "cold-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.5 },
  { id: "cc7", name: "Irish Cold Coffee", description: "Smooth Irish cream flavoured cold coffee with a hint of vanilla. An indulgent treat.", price: 130, calories: 200, category: "cold-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.4 },
  { id: "cc8", name: "Hazelnut Cold Coffee", description: "Nutty hazelnut syrup blended into creamy cold coffee. Aromatic and absolutely delicious.", price: 130, calories: 200, category: "cold-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.5 },
  { id: "cc9", name: "Cranberry Coffee", description: "Tangy cranberry meets smooth coffee in this unexpectedly delightful fusion. Refreshingly different.", price: 90, calories: 140, category: "cold-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.2, badge: "New" },
  { id: "cc10", name: "Cranberry Coffee Double Shot", description: "Our popular cranberry coffee with an extra espresso shot for added boldness.", price: 120, calories: 170, category: "cold-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.3 },
  { id: "cc11", name: "Pomegranate Coffee", description: "Sweet-tart pomegranate juice paired with chilled coffee. A vibrant and refreshing surprise.", price: 100, calories: 150, category: "cold-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.2, badge: "New" },
  { id: "cc12", name: "Caramel Ice Latte", description: "Chilled latte with a generous drizzle of house-made caramel sauce. Smooth and refreshing.", price: 100, calories: 160, category: "cold-coffee", image: require("@/assets/images/coffee.png"), isPopular: true, isVeg: true, rating: 4.5 },
  { id: "cc13", name: "Ice Latte", description: "Simple, elegant, and perfectly chilled. Espresso poured over cold milk and ice. A cafe staple.", price: 70, calories: 100, category: "cold-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.3 },

  // ── Hot Coffee ──
  { id: "hc1", name: "Cappuccino", description: "Perfectly balanced espresso with velvety steamed milk and a thick, creamy foam cap. A timeless classic.", price: 70, calories: 120, category: "hot-coffee", image: require("@/assets/images/coffee.png"), isPopular: true, isVeg: true, rating: 4.5 },
  { id: "hc2", name: "Cappuccino Double Shot", description: "All the frothy goodness of a cappuccino with twice the espresso kick.", price: 90, calories: 140, category: "hot-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.6 },
  { id: "hc3", name: "Caramel Cappuccino", description: "Rich caramel syrup meets our signature cappuccino. Sweet, bold and comforting.", price: 100, calories: 160, category: "hot-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.4 },
  { id: "hc4", name: "Hazelnut Cappuccino", description: "Aromatic hazelnut infused into a creamy cappuccino. Nutty warmth in every sip.", price: 100, calories: 160, category: "hot-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.5 },
  { id: "hc5", name: "Irish Cappuccino", description: "Irish cream flavoured cappuccino with a delicate vanilla finish. Indulgent and warming.", price: 100, calories: 160, category: "hot-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.4 },
  { id: "hc6", name: "Cafe Latte", description: "Smooth espresso with steamed milk and a light layer of foam. Mild, creamy and comforting.", price: 70, calories: 130, category: "hot-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.3 },
  { id: "hc7", name: "Cafe Mocha", description: "Rich chocolate and espresso married with steamed milk. The best of both worlds.", price: 70, calories: 180, category: "hot-coffee", image: require("@/assets/images/coffee.png"), isFeatured: true, isVeg: true, rating: 4.6, badge: "Popular" },
  { id: "hc8", name: "Hot Chocolate", description: "Rich, velvety hot chocolate made with premium cocoa and steamed milk. Pure comfort in a cup.", price: 70, calories: 190, category: "hot-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.5 },
  { id: "hc9", name: "Black Coffee", description: "Pure, bold and unapologetic. Single-origin espresso shot served hot. For the purists.", price: 60, calories: 5, category: "hot-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.2 },
  { id: "hc10", name: "Espresso Shot", description: "A concentrated shot of our premium espresso blend. Intense flavour, big energy.", price: 50, calories: 3, category: "hot-coffee", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.3 },

  // ── Pizza ──
  { id: "pz1", name: "BBQ Chicken Pizza", description: "Smoky BBQ-glazed chicken chunks with mozzarella and red onions on a hand-tossed base.", price: 220, calories: 680, category: "pizza", image: require("@/assets/images/pizza.png"), isPopular: true, rating: 4.6, addOns: [{ name: "Upgrade to Medium", price: 80 }, { name: "Extra Cheese", price: 50 }, { name: "Cheese Burst", price: 50 }] },
  { id: "pz2", name: "Chicken Mexican Pizza", description: "Spicy Mexican-style chicken with bell peppers, jalapeños, and a kick of chipotle.", price: 230, calories: 700, category: "pizza", image: require("@/assets/images/pizza.png"), rating: 4.5, badge: "Spicy", addOns: [{ name: "Upgrade to Medium", price: 80 }, { name: "Extra Cheese", price: 50 }, { name: "Cheese Burst", price: 50 }] },
  { id: "pz3", name: "Italian Classic Pizza", description: "Traditional Italian toppings with premium mozzarella, olives, and authentic herbs.", price: 250, calories: 650, category: "pizza", image: require("@/assets/images/pizza.png"), isFeatured: true, rating: 4.7, addOns: [{ name: "Upgrade to Medium", price: 100 }, { name: "Extra Cheese", price: 50 }, { name: "Cheese Burst", price: 70 }] },
  { id: "pz4", name: "Chicken Pepperoni Pizza", description: "Classic pepperoni with gooey mozzarella on a crispy crust. A timeless favourite.", price: 220, calories: 720, category: "pizza", image: require("@/assets/images/pizza.png"), isBestSeller: true, rating: 4.8, addOns: [{ name: "Upgrade to Medium", price: 80 }, { name: "Extra Pepperoni", price: 60 }, { name: "Cheese Burst", price: 50 }] },
  { id: "pz5", name: "Chicken Loaded Pizza", description: "Piled high with every chicken topping we have — BBQ, Mexican, pepperoni and more. For the ultimate meat lover.", price: 250, calories: 820, category: "pizza", image: require("@/assets/images/pizza.png"), rating: 4.7, badge: "Heavy", addOns: [{ name: "Upgrade to Medium", price: 90 }, { name: "Extra Cheese", price: 50 }, { name: "Cheese Burst", price: 70 }] },
  { id: "pz6", name: "Temptation Special Pizza", description: "Our signature creation — the best of everything loaded onto one unforgettable pizza.", price: 290, calories: 850, category: "pizza", image: require("@/assets/images/pizza.png"), isFeatured: true, isBestSeller: true, rating: 4.9, badge: "Signature", addOns: [{ name: "Upgrade to Medium", price: 100 }, { name: "Extra Cheese", price: 50 }, { name: "Cheese Burst", price: 70 }] },
  { id: "pz7", name: "Margherita", description: "The timeless classic. Fresh basil, mozzarella and San Marzano tomato sauce on a thin crispy base.", price: 150, calories: 520, category: "pizza", image: require("@/assets/images/pizza.png"), isVeg: true, rating: 4.4, addOns: [{ name: "Upgrade to Medium", price: 100 }, { name: "Extra Cheese", price: 50 }, { name: "Cheese Burst", price: 50 }] },
  { id: "pz8", name: "Fresh Veggie Pizza", description: "Garden-fresh bell peppers, onions, olives, tomatoes and sweet corn on a bed of mozzarella.", price: 160, calories: 480, category: "pizza", image: require("@/assets/images/pizza.png"), isVeg: true, rating: 4.3, addOns: [{ name: "Upgrade to Medium", price: 80 }, { name: "Extra Cheese", price: 50 }, { name: "Cheese Burst", price: 50 }] },
  { id: "pz9", name: "Cheese & Corn Pizza", description: "Sweet golden corn with a double helping of mozzarella. Simple, vegetarian perfection.", price: 140, calories: 460, category: "pizza", image: require("@/assets/images/pizza.png"), isVeg: true, isPopular: true, rating: 4.5, addOns: [{ name: "Upgrade to Medium", price: 110 }, { name: "Extra Cheese", price: 50 }, { name: "Cheese Burst", price: 50 }] },
  { id: "pz10", name: "BBQ Paneer Pizza", description: "Smoky BBQ paneer tikka with bell peppers and onions on a cheesy base. A vegetarian showstopper.", price: 190, calories: 540, category: "pizza", image: require("@/assets/images/pizza.png"), isVeg: true, isFeatured: true, rating: 4.6, addOns: [{ name: "Upgrade to Medium", price: 80 }, { name: "Extra Paneer", price: 60 }, { name: "Cheese Burst", price: 50 }] },

  // ── Shakes ──
  { id: "sh1", name: "Chocolate Milk Shake", description: "Rich chocolate ice cream blended with creamy milk. A timeless classic that never disappoints.", price: 120, calories: 320, category: "shakes", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.5 },
  { id: "sh2", name: "Strawberry Milk Shake", description: "Fresh strawberry pulp blended with creamy vanilla ice cream. Sweet, fruity and refreshing.", price: 120, calories: 300, category: "shakes", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.4 },
  { id: "sh3", name: "Kit Kat Milk Shake", description: "Crunchy Kit Kat pieces blended into a creamy milk shake. Every sip is a candy bar moment.", price: 130, calories: 380, category: "shakes", image: require("@/assets/images/coffee.png"), isPopular: true, isVeg: true, rating: 4.6, badge: "Trending" },
  { id: "sh4", name: "Oreo Milk Shake", description: "Crushed Oreo cookies meet vanilla ice cream in this universally loved shake.", price: 130, calories: 370, category: "shakes", image: require("@/assets/images/coffee.png"), isPopular: true, isVeg: true, rating: 4.7 },
  { id: "sh5", name: "Brownie Milk Shake", description: "Fudgy brownie chunks blended into thick vanilla shake. Decadence in a glass.", price: 160, calories: 450, category: "shakes", image: require("@/assets/images/coffee.png"), isFeatured: true, isVeg: true, rating: 4.8 },
  { id: "sh6", name: "Dry Fruit Milk Shake", description: "Premium dry fruits — almonds, cashews, pistachios — blended into a rich, nourishing shake.", price: 170, calories: 400, category: "shakes", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.5 },
  { id: "sh7", name: "Dry Fruit Milk Shake By Two", description: "A generous double portion of our signature dry fruit shake. Perfect for sharing.", price: 220, calories: 800, category: "shakes", image: require("@/assets/images/coffee.png"), isVeg: true, rating: 4.5 },

  // ── Mojitos ──
  { id: "mj1", name: "Blue Lagoon", description: "Vibrant blue curacao, fresh lime and soda. As stunning to look at as it is refreshing to drink.", price: 70, calories: 110, category: "mojitos", image: require("@/assets/images/mojito.png"), isVeg: true, rating: 4.5 },
  { id: "mj2", name: "Watermelon Mojito", description: "Fresh watermelon pulp muddled with mint and lime. Summer in a glass.", price: 70, calories: 100, category: "mojitos", image: require("@/assets/images/mojito.png"), isVeg: true, rating: 4.4 },
  { id: "mj3", name: "Raspberry Mojito", description: "Tangy raspberry syrup with muddled mint and fresh lime. Bold, fruity and refreshing.", price: 70, calories: 110, category: "mojitos", image: require("@/assets/images/mojito.png"), isVeg: true, rating: 4.3 },
  { id: "mj4", name: "Mint Mojito", description: "The classic — fresh mint leaves, lime juice and soda. Pure, simple, perfect.", price: 70, calories: 90, category: "mojitos", image: require("@/assets/images/mojito.png"), isPopular: true, isVeg: true, rating: 4.5 },
  { id: "mj5", name: "Kiwi Crush Mojito", description: "Fresh kiwi pulp muddled with mint and lime. A tropical twist on the classic.", price: 70, calories: 110, category: "mojitos", image: require("@/assets/images/mojito.png"), isVeg: true, rating: 4.4 },
  { id: "mj6", name: "Orange Mojito", description: "Citrusy orange juice meets mint and soda. Bright, zesty and uplifting.", price: 70, calories: 110, category: "mojitos", image: require("@/assets/images/mojito.png"), isVeg: true, rating: 4.3 },
  { id: "mj7", name: "Strawberry Mojito", description: "Muddled fresh strawberries with mint, lime and soda. Sweet, fruity and gorgeous.", price: 70, calories: 110, category: "mojitos", image: require("@/assets/images/mojito.png"), isPopular: true, isVeg: true, rating: 4.6 },
  { id: "mj8", name: "Mixed Berry Mojito", description: "A medley of fresh berries muddled with mint. Every sip bursts with berry flavour.", price: 70, calories: 120, category: "mojitos", image: require("@/assets/images/mojito.png"), isVeg: true, rating: 4.5 },
  { id: "mj9", name: "Mango Mojito", description: "Sweet Alphonso mango pulp with mint and lime. The king of fruits meets the king of coolers.", price: 70, calories: 120, category: "mojitos", image: require("@/assets/images/mojito.png"), isFeatured: true, isVeg: true, rating: 4.7 },
  { id: "mj10", name: "Green Apple Mojito", description: "Tart green apple syrup with mint and soda. Crisp, cool and tangy.", price: 70, calories: 110, category: "mojitos", image: require("@/assets/images/mojito.png"), isVeg: true, rating: 4.4 },
  { id: "mj11", name: "Bubble Gum Mojito", description: "Playful bubble gum flavour with mint and lime. A fun, nostalgic twist.", price: 70, calories: 120, category: "mojitos", image: require("@/assets/images/mojito.png"), isVeg: true, rating: 4.3, badge: "Fun" },
  { id: "mj12", name: "Cranberry Mojito", description: "Tangy cranberry juice with muddled mint and lime. Bold, tart and refreshingly different.", price: 70, calories: 100, category: "mojitos", image: require("@/assets/images/mojito.png"), isVeg: true, rating: 4.2 },
  { id: "mj13", name: "Black Current Mojito", description: "Rich black currant syrup with mint and soda. Deeply flavoured and wonderfully refreshing.", price: 70, calories: 110, category: "mojitos", image: require("@/assets/images/mojito.png"), isVeg: true, rating: 4.4 },
  { id: "mj14", name: "Temptation Special Mojito", description: "Our signature creation — an exotic blend of seasonal fruits, mint and premium sparkling water. Truly unique.", price: 80, calories: 130, category: "mojitos", image: require("@/assets/images/mojito.png"), isFeatured: true, isBestSeller: true, isVeg: true, rating: 4.9, badge: "Signature" },

  // ── Burgers ──
  { id: "b1", name: "Chicken Zinger Burger", description: "Crispy golden chicken fillet, fresh lettuce and tangy sauce in a toasted bun. Our most-loved burger.", price: 130, calories: 420, category: "burgers", image: require("@/assets/images/burger.png"), isPopular: true, isFeatured: true, isBestSeller: true, rating: 4.8, badge: "Fan Favourite", addOns: [{ name: "Extra Cheese", price: 25 }, { name: "Jalapeños", price: 20 }, { name: "Extra Sauce", price: 15 }] },
  { id: "b2", name: "Smokey Chicken Burger", description: "Grilled chicken with smoky BBQ sauce, onion rings and cheese. Bold, smoky flavour in every bite.", price: 120, calories: 390, category: "burgers", image: require("@/assets/images/burger.png"), rating: 4.5, addOns: [{ name: "Extra Cheese", price: 25 }, { name: "Add Bacon", price: 50 }] },
  { id: "b3", name: "Paneer Burger", description: "Crispy grilled paneer patty with fresh veggies and tangy sauce. A vegetarian delight.", price: 120, calories: 350, category: "burgers", image: require("@/assets/images/burger.png"), isVeg: true, rating: 4.4, addOns: [{ name: "Extra Paneer", price: 30 }, { name: "Cheese Slice", price: 25 }] },
  { id: "b4", name: "Veg Burger", description: "Garden-fresh veggie patty with lettuce, tomatoes and our house sauce. Simple and satisfying.", price: 100, calories: 300, category: "burgers", image: require("@/assets/images/burger.png"), isVeg: true, rating: 4.2, addOns: [{ name: "Add Cheese", price: 25 }] },

  // ── Wraps ──
  { id: "w1", name: "Crispy Chicken Wrap", description: "Crispy chicken strips with fresh lettuce, tomatoes and cheese sauce wrapped in a warm tortilla.", price: 130, calories: 360, category: "wraps", image: require("@/assets/images/wrap.png"), isPopular: true, rating: 4.5, addOns: [{ name: "Extra Cheese", price: 25 }, { name: "Double Filling", price: 50 }] },
  { id: "w2", name: "Lebanese Chicken Wrap", description: "Lebanese-style spiced chicken with garlic toum, pickles and fresh herbs. A Mediterranean twist.", price: 120, calories: 340, category: "wraps", image: require("@/assets/images/wrap.png"), isFeatured: true, rating: 4.6, badge: "New" },

  // ── Sandwiches ──
  { id: "s1", name: "Veg Sandwich", description: "Fresh garden vegetables with butter and herbs between soft toasted bread. Classic and comforting.", price: 80, calories: 250, category: "sandwiches", image: require("@/assets/images/wrap.png"), isVeg: true, rating: 4.2 },
  { id: "s2", name: "Chicken Sandwich", description: "Tender sliced chicken with fresh lettuce and mayo. Simple, satisfying and delicious.", price: 100, calories: 300, category: "sandwiches", image: require("@/assets/images/wrap.png"), rating: 4.3 },
  { id: "s3", name: "Chicken Cheese Sandwich", description: "Grilled chicken with melted cheese, tomatoes and herbs. Warm, gooey and irresistible.", price: 120, calories: 350, category: "sandwiches", image: require("@/assets/images/wrap.png"), isPopular: true, rating: 4.5 },
  { id: "s4", name: "Paneer Grilled Sandwich", description: "Grilled paneer with bell peppers, onions and cheese. A vegetarian grilled masterpiece.", price: 90, calories: 280, category: "sandwiches", image: require("@/assets/images/wrap.png"), isVeg: true, rating: 4.3 },
  { id: "s5", name: "Paneer Cheese Sandwich", description: "Double cheese and grilled paneer with herbs. For when you want it extra cheesy.", price: 110, calories: 320, category: "sandwiches", image: require("@/assets/images/wrap.png"), isVeg: true, rating: 4.4 },

  // ── Fries ──
  { id: "f1", name: "Cheesy Chicken Fries", description: "Crispy fries smothered in melted cheese and topped with seasoned chicken chunks. Loaded perfection.", price: 130, calories: 420, category: "fries", image: require("@/assets/images/hero_banner.png"), isPopular: true, rating: 4.6 },
  { id: "f2", name: "Cheesy Fries", description: "Golden fries generously drizzled with melted cheese sauce. Simple, indulgent, addictive.", price: 90, calories: 350, category: "fries", image: require("@/assets/images/hero_banner.png"), isVeg: true, rating: 4.4 },
  { id: "f3", name: "Peri Peri Fries", description: "Crispy fries tossed in our signature peri peri spice blend. Zesty, spicy and absolutely moreish.", price: 80, calories: 300, category: "fries", image: require("@/assets/images/hero_banner.png"), isVeg: true, isFeatured: true, rating: 4.5, badge: "Spicy" },
  { id: "f4", name: "French Fries", description: "Classic golden fries, perfectly salted and fried to crispy perfection. A timeless snack.", price: 70, calories: 280, category: "fries", image: require("@/assets/images/hero_banner.png"), isVeg: true, rating: 4.3 },

  // ── Chicken ──
  { id: "ch1", name: "Chicken Popcorn", description: "Bite-sized crispy chicken morsels, seasoned and fried golden. Impossibly addictive.", price: 120, calories: 340, category: "chicken", image: require("@/assets/images/popcorn.png"), isPopular: true, isBestSeller: true, rating: 4.7, badge: "Fan Favourite", addOns: [{ name: "Cheese Dip", price: 30 }, { name: "Large Portion", price: 50 }] },
  { id: "ch2", name: "Peri Peri Chicken Popcorn", description: "Our famous popcorn chicken with a fiery peri peri kick. Spice lovers, this one's for you.", price: 130, calories: 350, category: "chicken", image: require("@/assets/images/popcorn.png"), isFeatured: true, rating: 4.6, addOns: [{ name: "Cheese Dip", price: 30 }, { name: "Extra Spicy", price: 10 }] },
  { id: "ch3", name: "Chicken Strips", description: "Premium breast strips hand-battered in panko crumbs, fried until perfectly crisp.", price: 120, calories: 360, category: "chicken", image: require("@/assets/images/popcorn.png"), rating: 4.4, addOns: [{ name: "BBQ Sauce", price: 15 }, { name: "Cheese Sauce", price: 25 }] },
  { id: "ch4", name: "Chicken Wings (5 pcs)", description: "Slow-marinated, fried chicken wings tossed in your choice of sauce. A crowd favourite.", price: 160, calories: 480, category: "chicken", image: require("@/assets/images/wings.png"), isPopular: true, rating: 4.6, addOns: [{ name: "BBQ Sauce", price: 0 }, { name: "Buffalo Sauce", price: 0 }, { name: "Honey Garlic", price: 0 }] },
  { id: "ch5", name: "Crispy Chicken Nuggets", description: "Tender chicken nuggets with a satisfyingly crispy coating. Perfect with our dips.", price: 110, calories: 320, category: "chicken", image: require("@/assets/images/popcorn.png"), rating: 4.3, addOns: [{ name: "Cheese Dip", price: 30 }, { name: "Mayo Dip", price: 20 }] },
  { id: "ch6", name: "Chicken Cheese Momos", description: "Delicate dumplings stuffed with minced chicken and melted cheese. Served with chilli garlic dip.", price: 110, calories: 280, category: "chicken", image: require("@/assets/images/momos.png"), rating: 4.5, addOns: [{ name: "Extra Cheese Dip", price: 30 }, { name: "Schezwan Sauce", price: 15 }] },
  { id: "ch7", name: "Chicken Momos", description: "Classic steamed chicken momos with our signature chilli garlic dipping sauce.", price: 90, calories: 240, category: "chicken", image: require("@/assets/images/momos.png"), isPopular: true, rating: 4.4, addOns: [{ name: "Extra Dip", price: 20 }, { name: "Upgrade to Fried", price: 20 }] },

  // ── Veg Starters ──
  { id: "v1", name: "Cheese Balls", description: "Crispy golden exterior with a gooey molten cheese centre. Dipped in marinara — perfection.", price: 110, calories: 300, category: "veg-starters", image: require("@/assets/images/momos.png"), isVeg: true, isPopular: true, rating: 4.5 },
  { id: "v2", name: "Crispy Veg Nuggets", description: "Garden vegetable nuggets with a crunchy coating. A vegetarian snack at its best.", price: 100, calories: 260, category: "veg-starters", image: require("@/assets/images/momos.png"), isVeg: true, rating: 4.2 },
  { id: "v3", name: "Corn Cheese Momos", description: "Sweet corn and melted cheese stuffed in delicate dumplings. A veggie twist on a classic.", price: 110, calories: 260, category: "veg-starters", image: require("@/assets/images/momos.png"), isVeg: true, rating: 4.4 },
  { id: "v4", name: "Paneer Momos", description: "Spiced paneer filling wrapped in thin dumpling sheets. Served with tangy tomato chutney.", price: 90, calories: 230, category: "veg-starters", image: require("@/assets/images/momos.png"), isVeg: true, rating: 4.3 },
  { id: "v5", name: "Cheesy Fingers", description: "Crunchy cheese sticks fried golden and served with marinara dip. Pure cheesy joy.", price: 100, calories: 280, category: "veg-starters", image: require("@/assets/images/momos.png"), isVeg: true, isFeatured: true, rating: 4.5 },

  // ── Waffles ──
  { id: "wf1", name: "Dark & White Indulge", description: "Belgian waffle drizzled with dark and white chocolate. The best of both chocolate worlds.", price: 140, calories: 420, category: "waffles", image: require("@/assets/images/hero_banner.png"), isVeg: true, rating: 4.5 },
  { id: "wf2", name: "Chocolate Overload", description: "Belgian waffle drowned in rich chocolate sauce with chocolate shavings. For true chocoholics.", price: 140, calories: 450, category: "waffles", image: require("@/assets/images/hero_banner.png"), isVeg: true, rating: 4.6 },
  { id: "wf3", name: "Triple Chocolate", description: "Three kinds of chocolate — dark, milk and white — on a crispy Belgian waffle. Decadent.", price: 150, calories: 500, category: "waffles", image: require("@/assets/images/hero_banner.png"), isFeatured: true, isVeg: true, rating: 4.7 },
  { id: "wf4", name: "Oreo Crunch", description: "Crushed Oreo pieces and cream on a warm waffle. Every bite is a cookie dream.", price: 150, calories: 480, category: "waffles", image: require("@/assets/images/hero_banner.png"), isPopular: true, isVeg: true, rating: 4.7, badge: "Trending" },
  { id: "wf5", name: "Red Velvet", description: "Red velvet flavoured waffle with cream cheese drizzle and white chocolate shavings.", price: 150, calories: 460, category: "waffles", image: require("@/assets/images/hero_banner.png"), isVeg: true, rating: 4.5 },
  { id: "wf6", name: "Almond Brownie", description: "Fudgy brownie waffle topped with toasted almonds and chocolate sauce. Crunchy meets gooey.", price: 160, calories: 510, category: "waffles", image: require("@/assets/images/hero_banner.png"), isVeg: true, rating: 4.6 },
  { id: "wf7", name: "Lotus Biscoff", description: "Warm waffle with Lotus Biscoff spread, crushed biscuits and a caramel drizzle. Irresistible.", price: 160, calories: 520, category: "waffles", image: require("@/assets/images/hero_banner.png"), isFeatured: true, isBestSeller: true, isVeg: true, rating: 4.8, badge: "Best Seller" },
  { id: "wf8", name: "KitKat", description: "Kit Kat chunks melted over a warm waffle with chocolate sauce. A candy bar lover's dream.", price: 160, calories: 500, category: "waffles", image: require("@/assets/images/hero_banner.png"), isVeg: true, rating: 4.6 },
  { id: "wf9", name: "Nutella", description: "Generous slather of Nutella on a crispy Belgian waffle. Simple, classic, perfection.", price: 160, calories: 490, category: "waffles", image: require("@/assets/images/hero_banner.png"), isPopular: true, isVeg: true, rating: 4.7 },
  { id: "wf10", name: "Strawberry Cream Cheese", description: "Fresh strawberry slices with cream cheese frosting on a warm waffle. Elegant and delicious.", price: 160, calories: 440, category: "waffles", image: require("@/assets/images/hero_banner.png"), isVeg: true, rating: 4.5 },
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

export interface AboutSection {
  title: string;
  icon: string;
  items: string[];
}

export const aboutSections: AboutSection[] = [
  {
    title: "Accessibility",
    icon: "accessibility",
    items: [
      "Wheelchair-accessible car park",
      "Assistive hearing loop",
      "Wheelchair-accessible entrance",
      "Wheelchair-accessible seating",
      "Wheelchair-accessible toilet",
    ],
  },
  {
    title: "Service Options",
    icon: "package",
    items: ["Takeaway", "Dine-in"],
  },
  {
    title: "Highlights",
    icon: "star",
    items: ["Great coffee", "Great tea selection", "Live music"],
  },
  {
    title: "Popular For",
    icon: "users",
    items: ["Solo dining", "Good for working on laptop"],
  },
  {
    title: "Offerings",
    icon: "coffee",
    items: ["Coffee", "Quick bite", "Small plates", "Cuisine", "Dishes"],
  },
  {
    title: "Dining Options",
    icon: "watch",
    items: ["Breakfast", "Brunch", "Lunch", "Dinner", "Dessert", "Seating", "Table service"],
  },
  {
    title: "Amenities",
    icon: "home",
    items: ["Restroom"],
  },
  {
    title: "Atmosphere",
    icon: "wind",
    items: ["Casual", "Quiet", "Trendy"],
  },
  {
    title: "Crowd",
    icon: "smile",
    items: ["Family friendly", "Groups", "University students"],
  },
  {
    title: "Planning",
    icon: "calendar",
    items: ["Accepts reservations"],
  },
  {
    title: "Payments",
    icon: "credit-card",
    items: ["Credit cards", "Debit cards", "Google Pay", "NFC mobile payments"],
  },
  {
    title: "Children",
    icon: "heart",
    items: ["Good for kids", "High chairs", "Kids' menu"],
  },
  {
    title: "Parking",
    icon: "map-pin",
    items: ["Free parking lot", "Free street parking", "Plenty of parking"],
  },
  {
    title: "Pets",
    icon: "github",
    items: ["Dogs allowed outside"],
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
