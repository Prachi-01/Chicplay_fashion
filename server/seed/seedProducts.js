const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/mongo/Product');

dotenv.config();

const products = [
    // --- ROMANTIC DREAMER ---
    {
        name: "Lace Fit-and-Flare Dress",
        description: "Delicate pink lace dress with a flattering fit-and-flare silhouette and scalloped hem.",
        price: 95,
        images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Romantic Dreamer",
        brand: "ChicPlay Luxe",
        attributes: { color: "Pink", sizes: ["S", "M", "L"], material: "Lace", style: "Romantic", season: "Spring" },
        gameStats: { rarity: "Rare", xpReward: 150, requiredLevel: 2 },
        tags: ["lace", "pink", "feminine", "date-night"],
        stock: 50, rating: 4.8, reviewsCount: 12
    },
    {
        name: "Floral Chiffon Maxi",
        description: "Flowing chiffon maxi dress with a whimsical wildflower print and flutter sleeves.",
        price: 110,
        images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Romantic Dreamer",
        brand: "Bloom",
        attributes: { color: "Lavender", sizes: ["XS", "S", "M", "L"], material: "Chiffon", style: "Whimsical", season: "Summer" },
        gameStats: { rarity: "Uncommon", xpReward: 100, requiredLevel: 1 },
        tags: ["floral", "maxi", "chiffon", "whimsical"],
        stock: 40, rating: 4.9, reviewsCount: 8
    },
    {
        name: "Silk Wrap Dress",
        description: "Elegant silk wrap dress in a soft blush tone. Perfect for garden weddings.",
        price: 145,
        images: ["https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Romantic Dreamer",
        brand: "ChicPlay Luxe",
        attributes: { color: "Blush", sizes: ["S", "M"], material: "Silk", style: "Elegant", season: "Spring" },
        gameStats: { rarity: "Epic", xpReward: 300, requiredLevel: 5 },
        tags: ["silk", "wrap", "elegant", "wedding-guest"],
        stock: 25, rating: 5.0, reviewsCount: 15
    },
    {
        name: "Peplum Lace Mini",
        description: "Charming mini dress with lace overlay and a peplum waist for a romantic look.",
        price: 85,
        images: ["https://images.unsplash.com/photo-1594145061327-1428f522818d?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Romantic Dreamer",
        brand: "ChicPlay Luxe",
        attributes: { color: "Cream", sizes: ["XS", "S", "M"], material: "Lace", style: "Romantic", season: "Spring" },
        gameStats: { rarity: "Rare", xpReward: 120, requiredLevel: 2 },
        tags: ["lace", "peplum", "date", "mini"],
        stock: 30, rating: 4.7, reviewsCount: 10
    },

    // --- MODERN MINIMALIST ---
    {
        name: "Structured Sheath Dress",
        description: "Minimalist black sheath dress with clean lines and architectural seams.",
        price: 130,
        images: ["https://images.unsplash.com/photo-1539109132332-629a8b9195d0?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Modern Minimalist",
        brand: "Minimalist",
        attributes: { color: "Black", sizes: ["S", "M", "L", "XL"], material: "Wool Blend", style: "Structured", season: "Fall" },
        gameStats: { rarity: "Rare", xpReward: 200, requiredLevel: 3 },
        tags: ["minimalist", "black", "workwear", "structured"],
        stock: 35, rating: 4.7, reviewsCount: 22
    },
    {
        name: "White Column Dress",
        description: "Sleek white column dress in premium crepe. The personification of modern grace.",
        price: 160,
        images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Modern Minimalist",
        brand: "Lumine",
        attributes: { color: "White", sizes: ["M", "L"], material: "Crepe", style: "Sleek", season: "All" },
        gameStats: { rarity: "Legendary", xpReward: 500, requiredLevel: 8 },
        tags: ["white", "column", "sleek", "minimalist"],
        stock: 12, rating: 4.9, reviewsCount: 5
    },
    {
        name: "Grey Knit Shift Dress",
        description: "Simple grey knit shift dress for effortless style and maximum comfort.",
        price: 85,
        images: ["https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Modern Minimalist",
        brand: "CozyVibes",
        attributes: { color: "Grey", sizes: ["XS", "S", "M", "L", "XL"], material: "Cotton Knit", style: "Casual", season: "Spring" },
        gameStats: { rarity: "Common", xpReward: 50, requiredLevel: 1 },
        tags: ["knit", "grey", "casual", "minimalist"],
        stock: 100, rating: 4.4, reviewsCount: 45
    },

    // --- BOHO FREE SPIRIT ---
    {
        name: "Embroidered Peasant Dress",
        description: "Bohemian peasant dress with intricate embroidery and tassel ties.",
        price: 98,
        images: ["https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Boho Free Spirit",
        brand: "Natura",
        attributes: { color: "Terracotta", sizes: ["S", "M", "L"], material: "Cotton", style: "Boho", season: "Summer" },
        gameStats: { rarity: "Rare", xpReward: 180, requiredLevel: 2 },
        tags: ["boho", "embroidery", "tassels", "earthy"],
        stock: 60, rating: 4.6, reviewsCount: 18
    },
    {
        name: "Tiered Prairie Maxi",
        description: "Volume-rich tiered maxi dress in a rustic floral print. Perfect for festival season.",
        price: 120,
        images: ["https://images.unsplash.com/photo-1495385794356-15371f348c31?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Boho Free Spirit",
        brand: "Earthbound",
        attributes: { color: "Mustard", sizes: ["XS", "S", "M"], material: "Linen", style: "Rustic", season: "Fall" },
        gameStats: { rarity: "Epic", xpReward: 250, requiredLevel: 4 },
        tags: ["maxi", "tier", "prairie", "boho"],
        stock: 30, rating: 4.7, reviewsCount: 14
    },
    {
        name: "Crochet Lace Mini",
        description: "Vintage-inspired crochet lace dress. Hand-crafted vibes for the free spirit.",
        price: 75,
        images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Boho Free Spirit",
        brand: "Spirit",
        attributes: { color: "Cream", sizes: ["S", "M"], material: "Crochet", style: "Vintage", season: "Summer" },
        gameStats: { rarity: "Rare", xpReward: 150, requiredLevel: 2 },
        tags: ["crochet", "lace", "boho", "vintage"],
        stock: 50, rating: 4.8, reviewsCount: 30
    },

    // --- COASTAL GIRL ---
    {
        name: "Linen Sundress",
        description: "Breezy white linen sundress with a smocked back. Ideal for beach days.",
        price: 88,
        images: ["https://images.unsplash.com/photo-1518622358385-8ea7d346b08d?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Coastal Girl",
        brand: "Aqua",
        attributes: { color: "White", sizes: ["S", "M", "L"], material: "Linen", style: "Beach", season: "Summer" },
        gameStats: { rarity: "Common", xpReward: 70, requiredLevel: 1 },
        tags: ["beach", "linen", "white", "summer"],
        stock: 80, rating: 4.5, reviewsCount: 55
    },
    {
        name: "Striped Caftan Dress",
        description: "Nautical striped caftan dress with a relaxed fit. Yacht-club chic.",
        price: 115,
        images: ["https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Coastal Girl",
        brand: "Aqua",
        attributes: { color: "Navy/White", sizes: ["One Size"], material: "Cotton Gauze", style: "Nautical", season: "Summer" },
        gameStats: { rarity: "Rare", xpReward: 160, requiredLevel: 3 },
        tags: ["nautical", "stripes", "caftan", "resort"],
        stock: 20, rating: 4.9, reviewsCount: 10
    },

    // --- EDGY TRENDSETTER ---
    {
        name: "Faux Leather Midi",
        description: "Sleek faux leather dress with a high slit. For the bold and confident.",
        price: 125,
        images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Edgy Trendsetter",
        brand: "Edge",
        attributes: { color: "Dark Cherry", sizes: ["S", "M", "L"], material: "Faux Leather", style: "Bold", season: "Winter" },
        gameStats: { rarity: "Epic", xpReward: 280, requiredLevel: 5 },
        tags: ["leather", "edgy", "bold", "night-out"],
        stock: 15, rating: 5.0, reviewsCount: 25
    },
    {
        name: "Asymmetric Cut-Out Mini",
        description: "Dramatic asymmetric dress with daring side cut-outs and a metallic sheen.",
        price: 95,
        images: ["https://images.unsplash.com/photo-1533512930330-4ac257c86793?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Edgy Trendsetter",
        brand: "Volt",
        attributes: { color: "Metallic Silver", sizes: ["XS", "S", "M"], material: "Polyester", style: "Avant-Garde", season: "All" },
        gameStats: { rarity: "Legendary", xpReward: 450, requiredLevel: 7 },
        tags: ["metallic", "cut-out", "asymmetric", "edgy"],
        stock: 10, rating: 4.9, reviewsCount: 12
    },

    // --- CLASSIC ELEGANCE ---
    {
        name: "The Perfect LBD",
        description: "The ultimate little black dress. Timeless, elegant, and versatile.",
        price: 155,
        images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Classic Elegance",
        brand: "Timeless",
        attributes: { color: "Black", sizes: ["S", "M", "L", "XL"], material: "Crepe", style: "Classic", season: "All" },
        gameStats: { rarity: "Rare", xpReward: 200, requiredLevel: 4 },
        tags: ["LBD", "classic", "elegant", "formal"],
        stock: 45, rating: 5.0, reviewsCount: 88
    },
    {
        name: "Tweed Tea Dress",
        description: "Refined tweed tea dress with gold button details. Sophistication in every stitch.",
        price: 185,
        images: ["https://images.unsplash.com/photo-1594145061327-1428f522818d?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Classic Elegance",
        brand: "Royal",
        attributes: { color: "Cream/Black", sizes: ["S", "M", "L"], material: "Tweed", style: "Sophisticated", season: "Fall" },
        gameStats: { rarity: "Epic", xpReward: 350, requiredLevel: 6 },
        tags: ["tweed", "sophisticated", "royal", "tea-dress"],
        stock: 20, rating: 4.8, reviewsCount: 15
    },

    // --- STREET STYLE COOL ---
    {
        name: "Oversized Hoodie Dress",
        description: "Ultra-comfortable fleece hoodie dress. Urban style meets maximum cozy.",
        price: 75,
        images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Street Style Cool",
        brand: "StreetView",
        attributes: { color: "Anthracite", sizes: ["S", "M", "L", "XL"], material: "Fleece", style: "Urban", season: "Winter" },
        gameStats: { rarity: "Common", xpReward: 40, requiredLevel: 1 },
        tags: ["hoodie", "street", "urban", "comfort"],
        stock: 120, rating: 4.3, reviewsCount: 110
    },

    // --- GLAMOUR GODDESS ---
    {
        name: "Sequin Mermaid Gown",
        description: "Dazzling floor-length gown with hand-applied sequins and a dramatic mermaid silhouette.",
        price: 295,
        images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Glamour Goddess",
        brand: "Goddess",
        attributes: { color: "Gold", sizes: ["S", "M", "L"], material: "Sequins", style: "Glamorous", season: "Winter" },
        gameStats: { rarity: "Legendary", xpReward: 600, requiredLevel: 10 },
        tags: ["sequin", "formal", "evening", "glamour"],
        stock: 5, rating: 5.0, reviewsCount: 12
    },

    // --- COTTAGECORE ---
    {
        name: "Gingham Puff-Sleeve Dress",
        description: "Sweet vintage-inspired gingham dress with voluminous puff sleeves and ribbon detail.",
        price: 68,
        images: ["https://images.unsplash.com/photo-1518349619163-02319937aaec?q=80&w=1000&auto=format&fit=crop"],
        category: "Dresses",
        archetype: "Cottagecore",
        brand: "Meadow",
        attributes: { color: "Sage Green", sizes: ["XS", "S", "M", "L"], material: "Cotton", style: "Pastoral", season: "Spring" },
        gameStats: { rarity: "Common", xpReward: 45, requiredLevel: 1 },
        tags: ["gingham", "puff-sleeve", "vintage", "cottagecore"],
        stock: 90, rating: 4.6, reviewsCount: 38
    },

    // --- Tops ---
    {
        name: "Classic White Button-Down",
        description: "Crisp white button-down shirt. A wardrobe staple.",
        price: 55,
        images: ["https://images.unsplash.com/photo-1598532163257-52290f671391?q=80&w=1000&auto=format&fit=crop"],
        category: "Tops",
        archetype: "Modern Minimalist",
        brand: "Minimalist",
        attributes: { color: "White", sizes: ["XS", "S", "M", "L", "XL"], material: "Cotton", style: "Classic", season: "All" },
        gameStats: { rarity: "Common", xpReward: 50, requiredLevel: 1 },
        tags: ["white", "shirt", "classic", "work"],
        stock: 100, rating: 4.6, reviewsCount: 42
    },
    {
        name: "Silk Cami Top",
        description: "Luxurious silk camisole in champagne.",
        price: 45,
        images: ["https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?q=80&w=1000&auto=format&fit=crop"],
        category: "Tops",
        archetype: "Romantic Dreamer",
        brand: "Luxe",
        attributes: { color: "Champagne", sizes: ["S", "M", "L"], material: "Silk", style: "Elegant", season: "Summer" },
        gameStats: { rarity: "Uncommon", xpReward: 80, requiredLevel: 2 },
        tags: ["silk", "cami", "top", "elegant"],
        stock: 45, rating: 4.8, reviewsCount: 15
    },
    {
        name: "Graphic Band Tee",
        description: "Vintage inspired band tee. Edgy and cool.",
        price: 35,
        images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop"],
        category: "Tops",
        archetype: "Street Style Cool",
        brand: "RockOn",
        attributes: { color: "Black", sizes: ["S", "M", "L", "XL"], material: "Cotton", style: "Edgy", season: "All" },
        gameStats: { rarity: "Common", xpReward: 40, requiredLevel: 1 },
        tags: ["graphic", "tee", "edgy", "casual"],
        stock: 80, rating: 4.5, reviewsCount: 60
    },

    // --- Bottoms ---
    {
        name: "High-Waisted Mom Jeans",
        description: "Classic high-waisted denim jeans with a relaxed fit.",
        price: 78,
        images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop"],
        category: "Bottoms",
        archetype: "Street Style Cool",
        brand: "DenimCo",
        attributes: { color: "Blue", sizes: ["24", "25", "26", "27", "28", "29"], material: "Denim", style: "Casual", season: "All" },
        gameStats: { rarity: "Uncommon", xpReward: 90, requiredLevel: 2 },
        tags: ["jeans", "denim", "casual", "vintage"],
        stock: 60, rating: 4.7, reviewsCount: 85
    },
    {
        name: "Black Pencil Skirt",
        description: "Sleek black pencil skirt for the office or evening.",
        price: 65,
        images: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1000&auto=format&fit=crop"],
        category: "Bottoms",
        archetype: "Sophisticated Workwear",
        brand: "OfficeChic",
        attributes: { color: "Black", sizes: ["S", "M", "L"], material: "Blend", style: "Professional", season: "All" },
        gameStats: { rarity: "Common", xpReward: 60, requiredLevel: 1 },
        tags: ["skirt", "pencil", "black", "work"],
        stock: 50, rating: 4.6, reviewsCount: 22
    },
    {
        name: "Breezy Maxi Skirt",
        description: "Flowy maxi skirt with a floral print.",
        price: 70,
        images: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1000&auto=format&fit=crop"], // Placeholder reused
        category: "Bottoms",
        archetype: "Boho Free Spirit",
        brand: "Meadow",
        attributes: { color: "Floral", sizes: ["S", "M", "L"], material: "Rayon", style: "Boho", season: "Summer" },
        gameStats: { rarity: "Rare", xpReward: 110, requiredLevel: 3 },
        tags: ["maxi", "skirt", "floral", "boho"],
        stock: 35, rating: 4.8, reviewsCount: 18
    },

    // --- Outerwear ---
    {
        name: "Classic Denim Jacket",
        description: "Timeless denim jacket that goes with everything.",
        price: 88,
        images: ["https://images.unsplash.com/photo-1544642899-f0d6e5f6ed6f?q=80&w=1000&auto=format&fit=crop"],
        category: "Outerwear",
        archetype: "Coastal Girl",
        brand: "DenimCo",
        attributes: { color: "Blue", sizes: ["S", "M", "L"], material: "Denim", style: "Casual", season: "Spring/Fall" },
        gameStats: { rarity: "Common", xpReward: 70, requiredLevel: 1 },
        tags: ["denim", "jacket", "casual", "layer"],
        stock: 75, rating: 4.8, reviewsCount: 120
    },
    {
        name: "Leather Biker Jacket",
        description: "Edgy faux leather biker jacket.",
        price: 110,
        images: ["https://images.unsplash.com/photo-1551028919-ac7d21422e91?q=80&w=1000&auto=format&fit=crop"],
        category: "Outerwear",
        archetype: "Edgy Trendsetter",
        brand: "Rebel",
        attributes: { color: "Black", sizes: ["XS", "S", "M", "L"], material: "Faux Leather", style: "Edgy", season: "Fall/Winter" },
        gameStats: { rarity: "Rare", xpReward: 150, requiredLevel: 4 },
        tags: ["leather", "jacket", "biker", "edgy"],
        stock: 40, rating: 4.9, reviewsCount: 55
    },

    // --- Shoes ---
    {
        name: "White Sneakers",
        description: "Video classic white sneakers. Comfortable and stylish.",
        price: 60,
        images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop"],
        category: "Shoes",
        archetype: "Street Style Cool",
        brand: "Kicks",
        attributes: { color: "White", sizes: ["36", "37", "38", "39", "40"], material: "Leather", style: "Casual", season: "All" },
        gameStats: { rarity: "Common", xpReward: 50, requiredLevel: 1 },
        tags: ["sneakers", "white", "shoes", "casual"],
        stock: 150, rating: 4.8, reviewsCount: 200
    },
    {
        name: "Strappy Sandals",
        description: "Elegant strappy sandals for summer nights.",
        price: 55,
        images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop"],
        category: "Shoes",
        archetype: "Coastal Girl",
        brand: "SunSole",
        attributes: { color: "Tan", sizes: ["36", "37", "38", "39"], material: "Leather", style: "Summer", season: "Summer" },
        gameStats: { rarity: "Common", xpReward: 60, requiredLevel: 1 },
        tags: ["sandals", "summer", "shoes", "tan"],
        stock: 80, rating: 4.6, reviewsCount: 40
    },

    // --- Accessories ---
    {
        name: "Straw Sun Hat",
        description: "Wide-brimmed straw hat perfect for the beach.",
        price: 35,
        images: ["https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=1000&auto=format&fit=crop"],
        category: "Accessories",
        archetype: "Coastal Girl",
        brand: "SunSole",
        attributes: { color: "Beige", sizes: ["One Size"], material: "Straw", style: "Beach", season: "Summer" },
        gameStats: { rarity: "Common", xpReward: 30, requiredLevel: 1 },
        tags: ["hat", "straw", "accessory", "summer"],
        stock: 40, rating: 4.7, reviewsCount: 25
    },
    {
        name: "Gold Statement Earrings",
        description: "Bold gold earrings to elevate any outfit.",
        price: 28,
        images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop"],
        category: "Accessories",
        archetype: "Glamour Goddess",
        brand: "Luxe",
        attributes: { color: "Gold", sizes: ["One Size"], material: "Metal", style: "Glamorous", season: "All" },
        gameStats: { rarity: "Uncommon", xpReward: 50, requiredLevel: 2 },
        tags: ["earrings", "jewelry", "accessory", "gold"],
        stock: 100, rating: 4.5, reviewsCount: 60
    },

    // --- LOCAL ASSETS (from /products folder) ---
    {
        name: "Blush Evening Dress",
        description: "A stunning blush pink dress with a smooth finish, perfect for romantic evenings.",
        price: 120,
        images: ["/products/blush_dress.png"],
        category: "Dresses",
        archetype: "Romantic Dreamer",
        brand: "ChicPlay Luxe",
        attributes: { color: "Blush", sizes: ["S", "M", "L"], material: "Satin", style: "Romantic", season: "Summer" },
        gameStats: { rarity: "Rare", xpReward: 200, requiredLevel: 3 },
        tags: ["blush", "pink", "evening", "romantic"],
        stock: 15, rating: 4.9, reviewsCount: 18
    },
    {
        name: "Burgundy Velvet Heels",
        description: "Deep burgundy heels with a velvet finish, adding a touch of classic elegance to any outfit.",
        price: 85,
        images: ["/products/burgundy_heels.png"],
        category: "Shoes",
        archetype: "Classic Elegance",
        brand: "Timeless",
        attributes: { color: "Burgundy", sizes: ["36", "37", "38", "39"], material: "Velvet", style: "Classic", season: "All" },
        gameStats: { rarity: "Uncommon", xpReward: 100, requiredLevel: 2 },
        tags: ["burgundy", "heels", "velvet", "classic"],
        stock: 25, rating: 4.7, reviewsCount: 12
    },
    {
        name: "Cream Tailored Blazer",
        description: "A polished cream blazer with sharp tailoring, perfect for the boardroom.",
        price: 150,
        images: ["/products/cream_blazer.png"],
        category: "Outerwear",
        archetype: "Sophisticated Workwear",
        brand: "Royal",
        attributes: { color: "Cream", sizes: ["S", "M", "L"], material: "Wool", style: "Professional", season: "Fall" },
        gameStats: { rarity: "Rare", xpReward: 250, requiredLevel: 5 },
        tags: ["cream", "blazer", "professional", "workwear"],
        stock: 10, rating: 5.0, reviewsCount: 7
    },
    {
        name: "Gold Pleated Skirt",
        description: "Shimmering gold pleated skirt that catches the light with every movement.",
        price: 95,
        images: ["/products/gold_skirt.png"],
        category: "Bottoms",
        archetype: "Glamour Goddess",
        brand: "Goddess",
        attributes: { color: "Gold", sizes: ["XS", "S", "M"], material: "Mixed Fibers", style: "Glamorous", season: "Winter" },
        gameStats: { rarity: "Epic", xpReward: 300, requiredLevel: 4 },
        tags: ["gold", "skirt", "glamour", "party"],
        stock: 20, rating: 4.8, reviewsCount: 15
    },
    {
        name: "Mocha Oversized Sweater",
        description: "Cozy mocha-toned oversized sweater for effortless minimalist style.",
        price: 70,
        images: ["/products/mocha_sweater.png"],
        category: "Tops",
        archetype: "Modern Minimalist",
        brand: "CozyVibes",
        attributes: { color: "Mocha", sizes: ["One Size"], material: "Knit", style: "Casual", season: "Winter" },
        gameStats: { rarity: "Common", xpReward: 50, requiredLevel: 1 },
        tags: ["mocha", "sweater", "minimalist", "cozy"],
        stock: 50, rating: 4.5, reviewsCount: 33
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        await Product.deleteMany({});
        console.log('🗑️ Cleared existing products');

        await Product.insertMany(products);
        console.log('✨ Seeded products successfully');

        process.exit();
    } catch (err) {
        console.error('❌ Error seeding failed:', err);
        process.exit(1);
    }
};

seedDB();
