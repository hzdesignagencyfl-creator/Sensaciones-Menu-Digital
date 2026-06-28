import type { BadgeId, CategoryId, Dish, Special } from "@/lib/types";

/**
 * Canonical menu data, ported verbatim from the design prototype
 * (Sensaciones Menu.dc.html → RAW array). This is the seed source for
 * Supabase and the local fallback when the database is unreachable.
 *
 * Tuple: [id, category, name_en, name_es, price, desc_en, desc_es,
 *         ingredients_en, ingredients_es, badges, stars]
 *   price: number | "MP" (market price)
 */
type RawDish = [
  string,
  CategoryId,
  string,
  string,
  number | "MP",
  string,
  string,
  string[],
  string[],
  BadgeId[],
  number,
];

/** dish id → photo filename in /public/images/food (null when no photo yet). */
const PHOTO: Record<string, string> = {
  "eggs-bacon": "eggs-and-bacon-sensaciones-fort-myers.webp",
  "churrasco-caballo": "churrasco-a-caballo-sensaciones-fort-myers.webp",
  "veg-omelette": "vegetable-omelette-roll-sensaciones-fort-myers.webp",
  "brunch-burger": "brunch-burger-sensaciones-fort-myers.webp",
  "croissant-bs": "croissant-breakfast-sandwich-sensaciones-fort-myers.webp",
  "sourdough-toast": "sourdough-toast-sensaciones-fort-myers.webp",
  "grilled-cheese-bk": "grilled-cheese-sourdough-sandwich-sensaciones-fort-myers.webp",
  "cuban-bk": "cuban-sandwich-sensaciones-restaurant-fort-myers.webp",
  "french-toast": "french-toast-sensaciones-fort-myers.webp",
  croquetas: "croquetas-artesanales.webp",
  malanga: "frituras-de-malanga-sensaciones-fort-myers.webp",
  "tostones-app": "caribbean-tostones-sensaciones-fort-myers.webp",
  "cuban-sw": "cuban-sandwich-sensaciones-restaurant.webp",
  ribeye: "ribeye-angus-sensaciones-fort-myers.webp",
  tabla: "tabla-sensaciones-fort-myers.webp",
  "arroz-frito": "arroz-frito-sensaciones-fort-myers.webp",
  pulpo: "pulpo-sensaciones-fort-myers.webp",
  grouper: "fresh-grouper-havana-style-sensaciones-fort-myers.webp",
  "arroz-marinero": "arroz-marinero-sensaciones-fort-myers.webp",
  pargo: "pargo-frito-entero-sensaciones-fort-myers.webp",
  "cafe-bombon": "cafe-bombon-sensaciones-fort-myers.webp",
};

export function photoFor(id: string): string | null {
  const f = PHOTO[id];
  return f ? `/images/food/${f}` : null;
}

const RAW: RawDish[] = [
  // ── BREAKFAST & BRUNCH ──
  ["eggs-bacon", "breakfast", "Eggs & Bacon", "Huevos y Tocino", 14.95, "Two eggs your way, crispy bacon, toast and home fries.", "Dos huevos a tu gusto, tocino crujiente, tostadas y papas caseras.", ["Eggs", "Bacon", "Toast", "Home fries"], ["Huevos", "Tocino", "Tostadas", "Papas"], [], 0],
  ["churrasco-caballo", "breakfast", "Churrasco a Caballo", "Churrasco a Caballo", 19.95, "Grilled churrasco with two eggs any style and seasoned breakfast potatoes.", "Churrasco a la parrilla con dos huevos y papitas sazonadas.", ["Churrasco", "Eggs", "Potatoes"], ["Churrasco", "Huevos", "Papas"], ["chef", "popular"], 3],
  ["veg-omelette", "breakfast", "Vegetable Omelette Roll", "Omelette de Vegetales", 13.95, "Rolled veggie omelette with arugula, cherry tomatoes and balsamic glaze.", "Omelette enrollado con rúcula, tomates cherry y glaseado balsámico.", ["Eggs", "Vegetables", "Arugula"], ["Huevos", "Vegetales", "Rúcula"], ["veg"], 0],
  ["brunch-burger", "breakfast", "Sensaciones Brunch Burger", "Brunch Burger Sensaciones", 13.95, "Angus beef patty with melted cheese, crispy bacon and fried egg on brioche, with fries.", "Hamburguesa Angus con queso, tocino y huevo frito en pan brioche, con papas.", ["Angus beef", "Cheese", "Bacon", "Fried egg"], ["Carne Angus", "Queso", "Tocino", "Huevo frito"], [], 0],
  ["croissant-bs", "breakfast", "Croissant Breakfast Sandwich", "Sándwich de Croissant", 14.95, "Scrambled eggs and bacon with arugula and tomato in a warm croissant, with fries.", "Huevos revueltos y tocino con rúcula y tomate en croissant caliente, con papas.", ["Croissant", "Eggs", "Bacon", "Arugula"], ["Croissant", "Huevos", "Tocino", "Rúcula"], [], 0],
  ["sourdough-toast", "breakfast", "Sourdough Toast Sensaciones", "Tostada de Masa Madre", 14.95, "Sourdough with guacamole, cream cheese, arugula, feta, balsamic glaze and choice of protein.", "Masa madre con guacamole, queso crema, rúcula, feta y glaseado balsámico.", ["Sourdough", "Guacamole", "Feta", "Cream cheese"], ["Masa madre", "Guacamole", "Queso feta", "Queso crema"], ["veg", "new"], 0],
  ["grilled-cheese-bk", "breakfast", "Grilled Cheese Sourdough", "Sándwich de Queso Masa Madre", 12.95, "Pressed melted cheese on sourdough with arugula, cherry tomatoes and balsamic glaze.", "Queso derretido en masa madre con rúcula, tomates cherry y glaseado balsámico.", ["Sourdough", "Cheese", "Arugula"], ["Masa madre", "Queso", "Rúcula"], ["veg"], 0],
  ["cuban-bk", "breakfast", "Cuban Sandwich", "Sándwich Cubano", 13.95, "Pressed Cuban bread with roast pork, ham, swiss, pickles, mayo and mustard.", "Pan cubano prensado con lechón, jamón, suizo, pepinillos, mayonesa y mostaza.", ["Cuban bread", "Roast pork", "Ham", "Swiss"], ["Pan cubano", "Lechón", "Jamón", "Suizo"], ["popular"], 0],
  ["french-toast", "breakfast", "French Toast", "Tostadas Francesas", 12.95, "Golden French toast served with butter and maple syrup.", "Tostadas francesas doradas con mantequilla y jarabe de arce.", ["Brioche", "Eggs", "Maple syrup"], ["Brioche", "Huevos", "Jarabe de arce"], [], 0],
  ["pancakes", "breakfast", "Pancakes", "Panqueques", 12.95, "Fluffy pancakes served with butter and maple syrup.", "Panqueques esponjosos con mantequilla y jarabe de arce.", ["Flour", "Eggs", "Maple syrup"], ["Harina", "Huevos", "Jarabe de arce"], [], 0],

  // ── APPETIZERS ──
  ["croquetas", "appetizers", "Artisan Croquettes", "Croquetas Artesanales", 9.95, "5 housemade serrano ham croquettes served with alioli.", "5 croquetas caseras de jamón serrano con alioli.", ["Serrano ham", "Béchamel", "Breadcrumb"], ["Jamón serrano", "Bechamel", "Pan rallado"], ["popular"], 0],
  ["malanga", "appetizers", "Frituras de Malanga", "Frituras de Malanga", 9.95, "5 crispy malanga fritters, golden outside and soft inside, served with honey.", "5 frituras de malanga crujientes, doradas por fuera, con miel.", ["Malanga", "Honey"], ["Malanga", "Miel"], ["veg"], 0],
  ["tostones-app", "appetizers", "Caribbean Tostones", "Caribbean Tostones", 13.95, "5 plantain baskets filled with shrimp or beef, topped with guacamole and house alioli.", "Canastas de tostones rellenas de camarones o carne con guacamole y alioli.", ["Plantain", "Shrimp or beef", "Guacamole"], ["Plátano", "Camarones o carne", "Guacamole"], ["chef", "popular"], 3],
  ["calamari", "appetizers", "Fried Crispy Calamari", "Calamar Frito Crujiente", 11.95, "Lightly breaded fried calamari rings with alioli and spicy mayo.", "Anillos de calamar empanizados con alioli y mayonesa picante.", ["Calamari", "Breadcrumb", "Alioli"], ["Calamar", "Pan rallado", "Alioli"], [], 0],
  ["mix-sensaciones", "appetizers", "Mix Sensaciones", "Mix Sensaciones", 24.95, "Chef's selection of assorted housemade appetizers, perfect for sharing.", "Selección del chef de aperitivos variados de la casa para compartir.", ["Assorted appetizers"], ["Aperitivos variados"], ["chef"], 0],

  // ── SOUPS & SALADS ──
  ["sopa-pollo", "soups", "Cuban Chicken Soup", "Sopa de Pollo Casera", 7.95, "Homemade slow-cooked chicken soup with vegetables.", "Sopa casera de pollo cocinada a fuego lento con vegetales.", ["Chicken", "Vegetables", "Broth"], ["Pollo", "Vegetales", "Caldo"], [], 0],
  ["sopa-res", "soups", "Traditional Beef Soup", "Sopa de Res Tradicional", 8.95, "Traditional Cuban-style beef soup, hearty and flavorful.", "Sopa de res al estilo cubano tradicional, abundante y llena de sabor.", ["Beef", "Vegetables", "Broth"], ["Res", "Vegetales", "Caldo"], [], 0],
  ["cesar", "soups", "Caesar Salad", "Ensalada César", 13.95, "Crisp romaine, croutons, parmesan and classic Caesar dressing.", "Lechuga romana, crutones, parmesano y aderezo César clásico.", ["Romaine", "Croutons", "Parmesan", "Caesar dressing"], ["Lechuga romana", "Crutones", "Parmesano", "Aderezo César"], ["veg"], 0],
  ["ensalada-sens", "soups", "Sensaciones Salad", "Ensalada Sensaciones", 14.95, "Mixed greens with cherry tomatoes, baby carrots, olives, feta and house dressing.", "Hojas verdes con tomates cherry, zanahorias, aceitunas, queso feta y aderezo de la casa.", ["Mixed greens", "Cherry tomatoes", "Feta", "Olives"], ["Hojas verdes", "Tomates cherry", "Queso feta", "Aceitunas"], ["veg", "new"], 0],

  // ── SANDWICHES (with fries) ──
  ["cuban-sw", "sandwiches", "The Cuban", "Sándwich Cubano", 13.95, "Pressed Cuban bread with roast pork, ham, swiss, pickles, mayo and mustard. Served with fries.", "Pan cubano prensado con lechón, jamón, suizo, pepinillos, mayonesa y mostaza. Con papas fritas.", ["Cuban bread", "Roast pork", "Ham", "Swiss", "Pickles"], ["Pan cubano", "Lechón", "Jamón", "Suizo", "Pepinillos"], ["chef", "popular"], 3],
  ["cuban-steak-sw", "sandwiches", "Cuban Steak Sandwich", "Sándwich de Filete Cubano", 13.95, "Grilled palomilla with caramelized onions on toasted Cuban bread with spicy mayo. With fries.", "Palomilla a la parrilla con cebollas caramelizadas en pan cubano y mayonesa picante. Con papas.", ["Palomilla steak", "Caramelized onion", "Spicy mayo"], ["Palomilla", "Cebolla caramelizada", "Mayonesa picante"], [], 0],
  ["grilled-chicken-sw", "sandwiches", "Grilled Chicken Sandwich", "Sándwich de Pollo a la Parrilla", 13.95, "Grilled chicken breast on toasted Cuban bread with lettuce, tomato and house alioli. With fries.", "Pechuga a la parrilla en pan cubano con lechuga, tomate y alioli casero. Con papas.", ["Chicken breast", "Cuban bread", "Lettuce", "Alioli"], ["Pechuga", "Pan cubano", "Lechuga", "Alioli"], ["gf"], 0],

  // ── PASTAS ──
  ["pasta-alfredo", "pastas", "Pasta Alfredo", "Pasta Alfredo", 14.95, "Pasta in a creamy Alfredo sauce made with butter and parmesan.", "Pasta en cremosa salsa Alfredo de mantequilla y parmesano.", ["Pasta", "Butter", "Parmesan", "Cream"], ["Pasta", "Mantequilla", "Parmesano", "Crema"], ["veg"], 0],
  ["pasta-sensaciones", "pastas", "Pasta Sensaciones", "Pasta Sensaciones", 18.95, "Pasta with grilled chicken, cherry tomatoes and butter in the house red-and-white sauce.", "Pasta con pollo a la parrilla, tomates cherry y salsa insignia de la casa.", ["Pasta", "Grilled chicken", "Cherry tomatoes", "House sauce"], ["Pasta", "Pollo a la parrilla", "Tomates cherry", "Salsa de la casa"], ["popular", "chef"], 3],

  // ── ENTREES ──
  ["churrasco", "entrees", "Churrasco (12oz)", "Churrasco (12oz)", 28.95, "Prime cut pan-seared with house spice blend, chimichurri and sweet potato fries.", "Corte prime a la sartén con especias de la casa, chimichurri y papas de camote.", ["Skirt steak", "Chimichurri", "Sweet potato fries"], ["Entraña", "Chimichurri", "Papas de camote"], ["chef", "popular"], 3],
  ["ribeye", "entrees", "Ribeye Angus (16oz)", "Ribeye Angus (16oz)", 39.95, "Premium Angus ribeye grilled over high heat with mashed potatoes and house butter.", "Ribeye Angus premium a la parrilla con puré de papas y mantequilla de la casa.", ["Ribeye Angus", "Chimichurri", "Mashed potatoes"], ["Ribeye Angus", "Chimichurri", "Puré de papas"], ["chef"], 3],
  ["picanha", "entrees", "Prime Picanha (12oz)", "Prime Picanha (12oz)", 31.95, "Prime picanha roasted to perfection, sliced against the grain with chimichurri.", "Picaña prime asada a la perfección, cortada a contrapelo con chimichurri.", ["Picanha", "Chimichurri", "Potatoes"], ["Picaña", "Chimichurri", "Papas"], ["chef", "new"], 3],
  ["tabla", "entrees", "Tabla Sensaciones", "Tabla Sensaciones", 79.95, "Chef's selection of premium grilled meats to share (3–4 people).", "Selección del chef de carnes premium para 3-4 personas.", ["Premium meats", "Chimichurri", "Sides"], ["Carnes premium", "Chimichurri", "Acompañantes"], ["chef", "popular"], 3],
  ["ropa-vieja", "entrees", "Ropa Vieja", "Ropa Vieja", 19.95, "Slow-braised shredded beef in traditional Cuban criolla sauce.", "Carne de res deshebrada en salsa criolla cubana tradicional.", ["Flank steak", "Peppers", "Tomato", "Onion"], ["Falda", "Pimientos", "Tomate", "Cebolla"], ["popular"], 0],
  ["arroz-frito", "entrees", "Arroz Frito de la Casa", "Arroz Frito de la Casa", 19.95, "Traditional fried rice with chicken, ham, egg and vegetables, wok-sautéed.", "Arroz frito con pollo, jamón, huevo y vegetales salteado al wok.", ["Rice", "Chicken", "Ham", "Egg"], ["Arroz", "Pollo", "Jamón", "Huevo"], [], 0],
  ["masas-cerdo", "entrees", "Masas de Cerdo", "Masas de Cerdo", 19.95, "Crispy golden pork in a silky butter, garlic and lemon sauce.", "Trozos de cerdo dorados en salsa de mantequilla, ajo y limón.", ["Pork", "Garlic butter", "Lemon"], ["Cerdo", "Mantequilla de ajo", "Limón"], [], 0],
  ["cordero", "entrees", "Lamb in Red Wine", "Cordero al Vino Tinto", 28.95, "Slow-braised lamb in red wine reduction and spices over creamy mashed potatoes.", "Cordero en reducción de vino tinto sobre puré cremoso.", ["Lamb", "Red wine", "Mashed potatoes"], ["Cordero", "Vino tinto", "Puré de papas"], ["chef", "new"], 0],
  ["milanesa", "entrees", "Stuffed Milanesa", "Milanesa Rellena", 19.95, "Breaded pork or chicken cutlet stuffed with ham and melted cheese, cooked crispy.", "Chuleta empanada de cerdo o pollo rellena de jamón y queso, crujiente.", ["Pork or chicken", "Ham", "Cheese"], ["Cerdo o pollo", "Jamón", "Queso"], [], 0],
  ["lomo-saltado", "entrees", "Lomo Saltado", "Lomo Saltado", 25.95, "High-heat Peruvian-style sautéed beef with vegetables, fries and white rice.", "Carne salteada estilo peruano con vegetales, papas fritas y arroz blanco.", ["Beef", "Peppers", "Onion", "French fries"], ["Res", "Pimientos", "Cebolla", "Papas"], ["popular"], 0],
  ["pechuga-grill", "entrees", "Grilled Chicken Breast", "Pechuga al Grill", 17.95, "Lightly marinated grilled chicken breast, tender and juicy.", "Pechuga de pollo a la parrilla, marinada, tierna y jugosa.", ["Chicken breast", "Marinade"], ["Pechuga", "Marinada"], ["gf"], 0],
  ["pulpo", "entrees", "Pulpo Sensaciones", "Pulpo Sensaciones", 30.95, "Grilled tender octopus over roasted potatoes with the house signature touch.", "Pulpo a la parrilla tierno sobre papitas asadas con el toque insignia del restaurante.", ["Octopus", "Potatoes", "Olive oil"], ["Pulpo", "Papas", "Aceite de oliva"], ["chef", "new"], 0],
  ["grouper", "entrees", "Fresh Grouper Havana Style", "Grouper Estilo Habana", 28.95, "Pan-seared fresh grouper with lemon butter Havana style over roasted potatoes and glazed carrots.", "Mero fresco a la sartén con mantequilla de limón estilo Habana, papitas y zanahorias glaseadas.", ["Grouper", "Lemon butter", "Potatoes", "Carrots"], ["Mero", "Mantequilla de limón", "Papas", "Zanahorias"], ["chef", "popular"], 3],
  ["arroz-marinero", "entrees", "Arroz Marinero", "Arroz Marinero", 24.95, "Savory rice prepared with the house seafood selection, aromatic and full of flavor.", "Arroz sabroso con selección de mariscos de la casa, aromático y lleno de sabor.", ["Rice", "Mixed seafood"], ["Arroz", "Mariscos mixtos"], [], 0],
  ["salmon", "entrees", "Mediterranean Salmon", "Salmón Mediterráneo", 24.95, "Grilled salmon over a creamy caper sauce with tricolor potatoes.", "Salmón a la parrilla sobre salsa cremosa de alcaparras y papas tricolores.", ["Salmon", "Capers", "Cream sauce", "Potatoes"], ["Salmón", "Alcaparras", "Salsa cremosa", "Papas"], ["new"], 0],
  ["pargo", "entrees", "Pargo Frito Entero", "Pargo Frito Entero", 33.95, "Crispy whole fried snapper served with traditional Cuban mojo.", "Pargo entero frito y crujiente con mojo cubano.", ["Snapper", "Cuban mojo"], ["Pargo", "Mojo cubano"], ["popular"], 0],
  ["langosta", "entrees", "Lobster or Shrimp", "Langosta o Camarones", "MP", "Prepared your way: grilled with butter or in house criolla sauce.", "Preparados a tu gusto: a la parrilla con mantequilla o en salsa criolla.", ["Lobster or shrimp", "Butter or criolla sauce"], ["Langosta o camarones", "Mantequilla o criolla"], ["chef"], 0],

  // ── LUNCH SPECIAL (Mon–Fri 11:45 AM – 5:00 PM) ──
  ["especial-armar", "lunch", "Choose Your Own Lunch", "Especial para Armar", 12.99, "Mon–Fri: choose 1 base, 1 protein and 1 side. 11:45 AM – 5:00 PM.", "Lun–Vie: elige 1 base, 1 proteína y 1 acompañante. 11:45 AM – 5:00 PM.", ["Base of choice", "Protein of choice", "Side of choice"], ["Base a elegir", "Proteína a elegir", "Acompañante a elegir"], [], 0],
  ["friday-special", "lunch", "Friday Cuban Lunch", "Especial Cubano de Viernes", 14.99, "Friday only: roast pork, moro rice and yuca with mojo.", "Solo viernes: lechón asado, arroz moro y yuca con mojo.", ["Roast pork", "Moro rice", "Yuca with mojo"], ["Lechón asado", "Arroz moro", "Yuca con mojo"], ["popular", "new"], 0],
  ["super-burger", "lunch", "Super Burger", "Super Burger", 12.99, "Burger with cheese, bacon, arugula, tomato, pickles, egg and secret sauce.", "Hamburguesa con queso, tocino, rúcula, tomate, pepinillos, huevo y salsa secreta.", ["Beef", "Cheese", "Bacon", "Egg"], ["Carne", "Queso", "Tocino", "Huevo"], [], 0],

  // ── KIDS ──
  ["kids-tenders", "kids", "Kids Chicken Tenders", "Tiras de Pollo", 9.95, "Crispy chicken tenders served with fries.", "Tiras de pollo crujientes con papas fritas.", ["Chicken", "Fries"], ["Pollo", "Papas"], [], 0],
  ["kids-burger", "kids", "Kids Cheeseburger", "Mini Hamburguesa con Queso", 9.95, "Mini cheeseburger served with fries.", "Mini hamburguesa con queso y papas fritas.", ["Beef", "Cheese", "Fries"], ["Carne", "Queso", "Papas"], [], 0],

  // ── SIDES ──
  ["arroz-pilaf", "sides", "Arroz Pilaf", "Arroz Pilaf", 6.95, "Fluffy rice cooked in seasoned broth.", "Arroz esponjoso en caldo sazonado.", ["Rice", "Broth"], ["Arroz", "Caldo"], ["veg"], 0],
  ["vegetales", "sides", "Sautéed Vegetables", "Vegetales Salteados", 6.95, "Mixed vegetables sautéed in a pan.", "Mezcla de verduras a la sartén.", ["Mixed vegetables"], ["Vegetales mixtos"], ["veg", "gf"], 0],
  ["yuca-mojo", "sides", "Yuca con Mojo", "Yuca con Mojo", 6.95, "Cassava bathed in Cuban garlic mojo.", "Yuca con mojo de ajo cubano.", ["Yuca", "Garlic mojo"], ["Yuca", "Mojo de ajo"], ["veg", "gf"], 0],
  ["maduros", "sides", "Sweet Plantains", "Maduros", 5.95, "Caramelized sweet fried plantains.", "Plátanos dulces fritos caramelizados.", ["Sweet plantain"], ["Plátano maduro"], ["veg", "gf"], 0],
  ["truffle-fries", "sides", "Rosemary Truffle Fries", "Papas con Trufa y Romero", 6.95, "Crispy fries with rosemary, truffle oil and parmesan.", "Papas fritas con romero, aceite de trufa y parmesano.", ["Potatoes", "Rosemary", "Truffle oil", "Parmesan"], ["Papas", "Romero", "Aceite de trufa", "Parmesano"], ["veg", "new"], 0],
  ["tostones-s", "sides", "Tostones", "Tostones", 5.95, "Crispy twice-fried green plantains.", "Plátanos verdes fritos dos veces.", ["Green plantain"], ["Plátano verde"], ["veg", "gf"], 0],
  ["tamales", "sides", "Tamales", "Tamales", 6.95, "Traditional Cuban-style corn tamales.", "Tamales de maíz al estilo cubano.", ["Corn masa", "Filling"], ["Masa de maíz", "Relleno"], [], 0],
  ["pure-papas", "sides", "Mashed Potatoes", "Puré de Papas", 5.95, "Creamy mashed potatoes.", "Puré cremoso de papas.", ["Potatoes", "Butter", "Cream"], ["Papas", "Mantequilla", "Crema"], ["veg", "gf"], 0],
  ["frijoles", "sides", "Black Beans", "Frijoles Negros", 6.95, "Authentic Cuban black beans.", "Auténticos frijoles negros cubanos.", ["Black beans", "Garlic", "Bay leaf"], ["Frijoles negros", "Ajo", "Laurel"], ["veg", "gf"], 0],
  ["aguacate-s", "sides", "Avocado", "Aguacate", 6.95, "Fresh avocado portion.", "Porción de aguacate fresco.", ["Avocado"], ["Aguacate"], ["veg", "gf"], 0],
  ["mofongo", "sides", "Mofongo", "Mofongo", 6.95, "Green plantains mashed with garlic, olive oil, butter and chicharrón.", "Plátanos verdes machacados con ajo, aceite de oliva, mantequilla y chicharrón.", ["Green plantain", "Garlic", "Olive oil", "Chicharrón"], ["Plátano verde", "Ajo", "Aceite de oliva", "Chicharrón"], [], 0],

  // ── DESSERTS ──
  ["flan", "desserts", "Caramel Flan", "Flan", 9.95, "Classic Cuban caramel flan.", "Clásico flan de caramelo cubano.", ["Eggs", "Milk", "Caramel"], ["Huevos", "Leche", "Caramelo"], ["popular"], 0],
  ["arroz-leche", "desserts", "Rice Pudding", "Arroz con Leche", 9.95, "Traditional Cuban-style rice pudding.", "Pudín de arroz al estilo cubano.", ["Rice", "Milk", "Cinnamon", "Sugar"], ["Arroz", "Leche", "Canela", "Azúcar"], [], 0],
  ["tiramisu", "desserts", "Tiramisu", "Tiramisú", 10.95, "Italian dessert with coffee flavor.", "Postre italiano con sabor a café.", ["Espresso", "Mascarpone", "Ladyfingers", "Cocoa"], ["Espresso", "Mascarpone", "Bizcochos", "Cacao"], [], 0],
  ["ice-cream", "desserts", "Ice Cream", "Helado", 9.95, "Rich and velvety ice cream for a refreshing touch.", "Helado rico y aterciopelado para un toque refrescante.", ["Ice cream"], ["Helado"], ["veg"], 0],

  // ── DRINKS ──
  ["espresso", "drinks", "Espresso", "Espresso", 2.5, "Short and strong espresso.", "Café corto y fuerte.", ["Espresso"], ["Espresso"], [], 0],
  ["cortado", "drinks", "Cortado", "Cortado", 3.0, "Espresso cut with a little milk.", "Espresso cortado con un poco de leche.", ["Espresso", "Milk"], ["Espresso", "Leche"], [], 0],
  ["cappuccino", "drinks", "Cappuccino", "Cappuccino", 3.5, "Espresso with steamed milk and thick foam.", "Espresso con leche vaporizada y abundante espuma.", ["Espresso", "Milk", "Foam"], ["Espresso", "Leche", "Espuma"], [], 0],
  ["cafe-leche", "drinks", "Café con Leche", "Café con Leche", 3.5, "Classic coffee mixed with hot milk.", "Clásico café mezclado con leche caliente.", ["Coffee", "Milk"], ["Café", "Leche"], [], 0],
  ["cafe-bombon", "drinks", "Café Bombón", "Café Bombón", 4.5, "Espresso with sweet condensed milk — a house favorite.", "Espresso con leche condensada dulce — favorito de la casa.", ["Espresso", "Condensed milk"], ["Espresso", "Leche condensada"], ["popular", "chef"], 0],
  ["fresh-juices", "drinks", "Fresh Juices", "Jugos Frescos", 5.95, "Mango, soursop or pineapple — freshly made.", "Mango, Guanábana o Piña — recién preparados.", ["Fresh fruit"], ["Fruta fresca"], ["veg"], 0],
  ["smoothies", "drinks", "Fruit Smoothies", "Batidos de Fruta", 6.95, "Creamy mamey or papaya smoothie.", "Batido cremoso de mamey o papaya.", ["Fresh fruit", "Milk"], ["Fruta fresca", "Leche"], ["veg"], 0],
  ["milkshakes", "drinks", "Milkshakes", "Malteadas", 6.95, "Strawberry, chocolate or vanilla.", "Fresa, chocolate o vainilla.", ["Ice cream", "Milk"], ["Helado", "Leche"], [], 0],
  ["lemonade", "drinks", "Lemonade", "Limonada", 5.95, "Fresh homemade lemonade.", "Limonada fresca hecha en casa.", ["Lemon", "Water", "Sugar"], ["Limón", "Agua", "Azúcar"], ["veg"], 0],
  ["soda", "drinks", "Sodas", "Refrescos", 2.5, "Carbonated sodas.", "Refrescos carbonatados.", ["Soda"], ["Refresco"], [], 0],
  ["malta", "drinks", "Malta", "Malta", 3.5, "Traditional malt beverage.", "Bebida tradicional de malta.", ["Malta"], ["Malta"], [], 0],
  ["mimosa", "drinks", "Mimosa", "Mimosa", 6.95, "Fresh juice and champagne cocktail.", "Cóctel de jugo fresco y champán.", ["Champagne", "Orange juice"], ["Champán", "Jugo de naranja"], [], 0],
  ["sangria", "drinks", "Sangria", "Sangría", 8.95, "Refreshing wine and fruit drink.", "Bebida refrescante de vino y frutas.", ["Red wine", "Fruit"], ["Vino tinto", "Frutas"], [], 0],
  ["pina-colada", "drinks", "Virgin Piña Colada", "Piña Colada (Virgen)", 8.95, "Sweet non-alcoholic piña colada.", "Bebida dulce sin alcohol estilo piña colada.", ["Pineapple", "Coconut cream"], ["Piña", "Crema de coco"], ["veg"], 0],
];

function build(r: RawDish, index: number): Dish {
  const [id, category, name_en, name_es, price, d_en, d_es, i_en, i_es, badges, stars] = r;
  return {
    id,
    category,
    name_en,
    name_es,
    description_en: d_en,
    description_es: d_es,
    price: price === "MP" ? null : price,
    market_price: price === "MP",
    ingredients_en: i_en,
    ingredients_es: i_es,
    photo_url: photoFor(id),
    video_url: null,
    status: "visible",
    available_today: true,
    badge_chef: badges.includes("chef"),
    badge_popular: badges.includes("popular"),
    badge_new: badges.includes("new"),
    badge_veg: badges.includes("veg"),
    badge_gf: badges.includes("gf"),
    star_rating: stars,
    sort_order: index,
  };
}

export const DISHES: Dish[] = RAW.map(build);

export const DEFAULT_SPECIAL: Special = {
  id: 1,
  active: true,
  name_en: "Seafood Paella",
  name_es: "Paella de Mariscos",
  description_en: "Saturday only — saffron rice with shrimp, mussels and calamari.",
  description_es: "Solo sábados — arroz con azafrán, camarones, mejillones y calamares.",
  price: 34,
  photo_url: "/images/food/arroz-marinero-sensaciones-fort-myers.webp",
};
