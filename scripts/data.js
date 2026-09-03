/* Catalogue for the prototype.
   Products, prices, brands and images are REAL, pulled from
   aquavape.co.uk/products.json on 2026-09-03. Stock levels and multibuy
   flags are illustrative — the storefront JSON does not expose inventory
   counts. Flavour colours drive the card tint and are a design choice.

   Note on the catalogue itself: Aquavape stocks ~998 products from ~63
   third-party brands. Its own-brand 10ml line, still shown in the live
   homepage's best sellers, no longer appears in the catalogue. See
   DESIGN.md for why that changed the design. */

const P = 'assets/products/';

export const PRODUCTS = [
  // --- E-liquid ---------------------------------------------------------
  { id:'ivg',           brand:'IVG',            name:'Lemon Fizz Nic Salt',              ml:10,  mg:20, ratio:'50/50', price:3.99,  was:null,  stock:.86, flavour:'#F9C22E', flag:'3 for £10', type:'eliquid',   img:P+'ivg.webp',           stars:5 },
  { id:'elux',          brand:'Elux',           name:'Blackcurrant Menthol Nic Salt',    ml:10,  mg:20, ratio:'50/50', price:3.99,  was:null,  stock:.72, flavour:'#7C3AED', flag:'3 for £10', type:'eliquid',   img:P+'elux.webp',          stars:5 },
  { id:'vampire',       brand:'Vampire Vape',   name:'Orange Pineapple Max Nic Salt',    ml:10,  mg:20, ratio:'50/50', price:2.99,  was:3.99,  stock:.64, flavour:'#F97316', flag:'Save 25%',  type:'eliquid',   img:P+'vampire.webp',       stars:4 },
  { id:'ox-passion',    brand:'OX Passion',     name:'Dragon Fruit Nic Salt',            ml:10,  mg:20, ratio:'50/50', price:3.99,  was:null,  stock:.55, flavour:'#EC4899', flag:'3 for £10', type:'eliquid',   img:P+'ox-passion.webp',    stars:5 },
  { id:'dinner-lady',   brand:'Dinner Lady',    name:'Pistachio Gelato Nic Salt',        ml:10,  mg:10, ratio:'50/50', price:3.99,  was:null,  stock:.48, flavour:'#A6E4C2', flag:null,        type:'eliquid',   img:P+'dinner-lady.webp',   stars:5 },
  { id:'just-juice',    brand:'Just Juice',     name:'Key Lime Pie Nic Salt',            ml:10,  mg:10, ratio:'50/50', price:3.99,  was:null,  stock:.41, flavour:'#84CC16', flag:null,        type:'eliquid',   img:P+'just-juice.webp',    stars:4 },
  { id:'vape-district', brand:'Vape District',  name:'Lychee Ice Shortfill',             ml:100, mg:0,  ratio:'70/30', price:11.99, was:15.99, stock:.33, flavour:'#8FD3F4', flag:'Shortfill', type:'eliquid',   img:P+'vape-district.webp', stars:4 },
  { id:'rodeo',         brand:'Rodeo',          name:'Custanilla Shortfill',             ml:100, mg:0,  ratio:'70/30', price:11.99, was:null,  stock:.27, flavour:'#D9A441', flag:'Shortfill', type:'eliquid',   img:P+'rodeo.webp',         stars:4 },
  { id:'vapemate',      brand:'Vapemate',       name:'Classic Nic Shot 18mg',            ml:10,  mg:18, ratio:'50/50', price:1.49,  was:null,  stock:.94, flavour:'#94A3B8', flag:null,        type:'eliquid',   img:P+'vapemate.webp',      stars:5 },
  { id:'drifter-juice', brand:'Drifter Bar',    name:'Bar Salts Nic Shot',               ml:10,  mg:20, ratio:'50/50', price:1.49,  was:null,  stock:.81, flavour:'#2BC9BC', flag:null,        type:'eliquid',   img:P+'drifter-juice.webp', stars:4 },

  // --- Vape kits --------------------------------------------------------
  { id:'oxva',          brand:'OXVA',           name:'Nexlim 2 Kit',                     ml:0, mg:0,  ratio:'—', price:30.99, was:null,  stock:.58, flavour:'#1E293B', flag:null,       type:'kits', img:P+'oxva.webp',        stars:5 },
  { id:'dojo',          brand:'Vaporesso',      name:'DoJo Blast 30K Pro Kit',           ml:0, mg:20, ratio:'—', price:10.99, was:14.99, stock:.44, flavour:'#3B82F6', flag:'Save 27%', type:'kits', img:P+'dojo.webp',        stars:5 },
  { id:'feoba',         brand:'Feoba',          name:'Pro Plus 10K Kit',                 ml:0, mg:20, ratio:'—', price:9.99,  was:null,  stock:.67, flavour:'#FDE047', flag:null,       type:'kits', img:P+'feoba.webp',       stars:4 },
  { id:'refilla',       brand:'Refilla',        name:'Vape Kit',                         ml:0, mg:20, ratio:'—', price:9.99,  was:null,  stock:.52, flavour:'#60A5FA', flag:'New',      type:'kits', img:P+'refilla.webp',     stars:4 },
  { id:'drifter-kit',   brand:'Drifter',        name:'Poco Pro Kit',                     ml:0, mg:20, ratio:'—', price:5.99,  was:null,  stock:.76, flavour:'#A78BFA', flag:null,       type:'kits', img:P+'drifter-kit.webp', stars:4 },
  { id:'iqos',          brand:'IQOS',           name:'Iluma i One Kit',                  ml:0, mg:0,  ratio:'—', price:19.00, was:null,  stock:.24, flavour:'#8FD3F4', flag:'Low stock',type:'kits', img:P+'iqos.webp',        stars:4 },

  // --- Prefilled pods ---------------------------------------------------
  { id:'lost-mary',     brand:'Lost Mary',      name:'Latte BM6000 Refill Pack',         ml:2, mg:20, ratio:'50/50', price:6.99, was:null, stock:.88, flavour:'#B07B3E', flag:'3 for £18', type:'pods', img:P+'lost-mary.webp', stars:5 },
  { id:'hayati',        brand:'Hayati',         name:'Mango Peach Pineapple Refill Pack',ml:2, mg:20, ratio:'50/50', price:9.99, was:null, stock:.79, flavour:'#F59E0B', flag:'3 for £25', type:'pods', img:P+'hayati.webp',    stars:5 },
  { id:'ske',           brand:'SKE Crystal',    name:'Strawberry Hubbla Bubbla Refill',  ml:2, mg:20, ratio:'50/50', price:7.99, was:null, stock:.61, flavour:'#F87171', flag:'3 for £20', type:'pods', img:P+'ske.webp',       stars:5 },
  { id:'elfbar',        brand:'Elfbar',         name:'ELFX 2.0 Pods',                    ml:2, mg:20, ratio:'50/50', price:8.99, was:null, stock:.49, flavour:'#22D3EE', flag:null,        type:'pods', img:P+'elfbar.webp',    stars:4 },
  { id:'smok-coil',     brand:'SMOK',           name:'RPM4 Coils',                       ml:0, mg:0,  ratio:'—',     price:10.99,was:null, stock:.35, flavour:'#94A3B8', flag:null,        type:'pods', img:P+'smok-coil.webp', stars:4 },
  { id:'pablo',         brand:'Pablo',          name:'Bubblegum Nicotine Pouches',       ml:0, mg:30, ratio:'—',     price:3.99, was:null, stock:.83, flavour:'#F472B6', flag:null,        type:'pods', img:P+'pablo.webp',     stars:4 },
  { id:'killa',         brand:'Killa',          name:'Spearmint Nicotine Pouches',       ml:0, mg:16, ratio:'—',     price:4.99, was:null, stock:.71, flavour:'#34D399', flag:null,        type:'pods', img:P+'killa.webp',     stars:5 },
  { id:'xqs',           brand:'XQS',            name:'Raspberry Blackcurrant Pouches',   ml:0, mg:10, ratio:'—',     price:4.99, was:null, stock:.57, flavour:'#C084FC', flag:null,        type:'pods', img:P+'xqs.webp',       stars:4 }
];

export const CLEARANCE = [
  { id:'cl-rodeo',   brand:'Rodeo',         name:'Custanilla Shortfill 100ml',  ml:100, mg:0,  ratio:'70/30', price:4.99, was:11.99, stock:.14, flavour:'#D9A441', flag:'Save 58%', type:'eliquid', img:P+'rodeo.webp',         stars:4 },
  { id:'cl-vd',      brand:'Vape District', name:'Lychee Ice Shortfill 100ml',  ml:100, mg:0,  ratio:'70/30', price:5.99, was:15.99, stock:.09, flavour:'#8FD3F4', flag:'Save 62%', type:'eliquid', img:P+'vape-district.webp', stars:4 },
  { id:'cl-feoba',   brand:'Feoba',         name:'Pro Plus 10K Kit',            ml:0,   mg:20, ratio:'—',     price:5.99, was:14.99, stock:.21, flavour:'#FDE047', flag:'Save 60%', type:'kits',    img:P+'feoba.webp',         stars:4 },
  { id:'cl-xqs',     brand:'XQS',           name:'Raspberry Blackcurrant Pouches',ml:0, mg:10, ratio:'—',     price:1.99, was:4.99,  stock:.31, flavour:'#C084FC', flag:'Save 60%', type:'pods',    img:P+'xqs.webp',           stars:4 }
];

export const STRENGTHS = [
  { mg:0,  name:'Shortfill', note:'Nicotine free, 100ml', level:.12 },
  { mg:10, name:'Low',       note:'Lighter throat hit',   level:.34 },
  { mg:18, name:'Medium',    note:'Nic shots, refills',   level:.62 },
  { mg:20, name:'High',      note:'Nic salt, pod kits',   level:1.0 }
];

/* Category tiles use a real product shot per category */
export const CATEGORIES = [
  { name:'E-liquid', count:'205 lines',   colour:'#E88CBA', img:P+'ivg.webp'       },
  { name:'Vape kits',count:'126 kits',    colour:'#F9CBA3', img:P+'oxva.webp'      },
  { name:'Pods',     count:'184 packs',   colour:'#A6E4C2', img:P+'lost-mary.webp' },
  { name:'Pouches',  count:'64 flavours', colour:'#D8C6F0', img:P+'pablo.webp'     }
];

export const POSTS = [
  { t:'How to unlock a Pixl Duo 12',  d:'Trouble unlocking your device? Here are the steps.', colour:'#E88CBA', img:P+'refilla.webp'   },
  { t:'The future of vape packaging', d:'The government plans, and how to have your say.',    colour:'#8FD3F4', img:P+'dojo.webp'      },
  { t:'Which nicotine strength?',     d:'Coming off disposables? Start here before you buy.', colour:'#A6E4C2', img:P+'elux.webp'      },
  { t:'Top 10 nicotine pouches',      d:'Our flavour rundown to help you pick your next tin.',colour:'#F9C22E', img:P+'killa.webp'     }
];

export const REVIEWS = [
  { t:'Angel vapes',    q:'Excellent flavours, been using for 12 months. Excellent service.', by:'Delwyn H. · 1 hour ago',    n:5 },
  { t:'Mega selection', q:'Great site, easy to use with fast delivery.',                       by:'Angela G. · 3 hours ago',   n:5 },
  { t:'Great product',  q:'Fast delivery, lots of flavours, good products.',                   by:'Janice K. · 4 hours ago',   n:5 },
  { t:'Fruity',         q:'I love mango so I tried the mango one and it is pretty good.',      by:'Sharron R. · 14 hours ago', n:4 }
];

/* Real catalogue figures, counted from products.json on 2026-09-03 */
export const STATS = { products: 998, brands: 63, liquids: 205 };

export const HERO_SLIDES = ['Mega sale', 'New kits', '3 for £10', 'Pouches', 'Clearance'];
export const FREE_DELIVERY = 10.00;
