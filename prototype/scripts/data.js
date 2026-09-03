/* Placeholder catalogue for the prototype. Names, prices and stock are
   illustrative — swap for real Shopify data when this ports to Liquid.
   Flavour colours drive the card flood, so they are part of the design
   system rather than decoration. */

export const PRODUCTS = [
  { id:'aq-menthol', brand:'Aquavape', name:'Fresh Menthol',        ml:10,  mg:0,  ratio:'50/50', price:2.99, was:null,  stock:.93, flavour:'#2BC9BC', flag:'4 for £10', type:'eliquid', stars:5 },
  { id:'aq-wild',    brand:'Aquavape', name:'Wild Berry',           ml:10,  mg:12, ratio:'50/50', price:2.99, was:null,  stock:.82, flavour:'#7C3AED', flag:'4 for £10', type:'eliquid', stars:5 },
  { id:'aq-razmen',  brand:'Aquavape', name:'Raspberry Menthol',    ml:10,  mg:20, ratio:'50/50', price:2.99, was:null,  stock:.64, flavour:'#E02B22', flag:'4 for £10', type:'eliquid', stars:5 },
  { id:'aq-tobacco', brand:'Aquavape', name:'British Tobacco',      ml:10,  mg:0,  ratio:'50/50', price:2.99, was:null,  stock:.71, flavour:'#B07B3E', flag:'4 for £10', type:'eliquid', stars:5 },
  { id:'aq-blue',    brand:'Aquavape', name:'Blue Raspberry',       ml:10,  mg:20, ratio:'50/50', price:2.99, was:3.99,  stock:.55, flavour:'#3B82F6', flag:'Save 25%',  type:'eliquid', stars:5 },
  { id:'aq-mango',   brand:'Aquavape', name:'Mango Ice',            ml:10,  mg:10, ratio:'50/50', price:2.99, was:null,  stock:.48, flavour:'#F9C22E', flag:'4 for £10', type:'eliquid', stars:4 },
  { id:'aq-rhubarb', brand:'Aquavape', name:'Rhubarb & Custard',    ml:100, mg:0,  ratio:'70/30', price:11.99,was:15.99, stock:.41, flavour:'#E88CBA', flag:'Shortfill',type:'eliquid', stars:5 },
  { id:'aq-cherry',  brand:'Aquavape', name:'Black Cherry',         ml:10,  mg:20, ratio:'50/50', price:2.99, was:null,  stock:.24, flavour:'#8B2942', flag:'Low stock',type:'eliquid', stars:4 },

  { id:'pk-pixl',    brand:'Pixl',     name:'Duo 12 Pod Kit',       ml:0,   mg:20, ratio:'—',     price:12.99,was:19.99, stock:.62, flavour:'#8FD3F4', flag:'Save 35%', type:'pods', stars:5 },
  { id:'pk-mary',    brand:'Lost Mary','name':'Tappo Pod Kit',      ml:0,   mg:20, ratio:'—',     price:9.99, was:null,  stock:.77, flavour:'#D8C6F0', flag:'New',      type:'pods', stars:5 },
  { id:'pk-elf',     brand:'Elfliq',   name:'Elfa Pro Kit',         ml:0,   mg:20, ratio:'—',     price:11.99,was:null,  stock:.51, flavour:'#A6E4C2', flag:null,       type:'pods', stars:4 },
  { id:'pk-ivg',     brand:'IVG',      name:'2400 Pod Kit',         ml:0,   mg:20, ratio:'—',     price:14.99,was:17.99, stock:.35, flavour:'#F8B3B8', flag:'Save 17%', type:'pods', stars:5 },

  { id:'pp-elfa',    brand:'Elfliq',   name:'Elfa Prefilled Pods',  ml:2,   mg:20, ratio:'50/50', price:5.99, was:null,  stock:.88, flavour:'#F9CBA3', flag:'3 for £15',type:'prefilled', stars:5 },
  { id:'pp-tappo',   brand:'Lost Mary',name:'Tappo Prefilled Pods', ml:2,   mg:20, ratio:'50/50', price:5.99, was:null,  stock:.66, flavour:'#E88CBA', flag:'3 for £15',type:'prefilled', stars:4 },
  { id:'pp-pixl',    brand:'Pixl',     name:'Duo Prefilled Pods',   ml:2,   mg:10, ratio:'50/50', price:4.99, was:6.99,  stock:.44, flavour:'#8FD3F4', flag:'Save 28%', type:'prefilled', stars:5 },
  { id:'pp-aqua',    brand:'Aquavape', name:'Aqua Prefilled Pods',  ml:2,   mg:20, ratio:'50/50', price:4.99, was:null,  stock:.72, flavour:'#2BC9BC', flag:'New',      type:'prefilled', stars:5 }
];

export const CLEARANCE = [
  { id:'cl-1', brand:'Vapemate', name:'Fruit Fusion 100ml', ml:100, mg:0,  ratio:'70/30', price:4.99, was:14.99, stock:.18, flavour:'#F9C22E', flag:'Save 66%', type:'eliquid', stars:4 },
  { id:'cl-2', brand:'Ultd',     name:'Ice Blast 100ml',    ml:100, mg:0,  ratio:'70/30', price:5.99, was:15.99, stock:.12, flavour:'#8FD3F4', flag:'Save 62%', type:'eliquid', stars:4 },
  { id:'cl-3', brand:'IVG',      name:'Bar Favourites 10ml',ml:10,  mg:20, ratio:'50/50', price:1.99, was:3.99,  stock:.31, flavour:'#D8C6F0', flag:'Save 50%', type:'eliquid', stars:5 },
  { id:'cl-4', brand:'Aquavape', name:'Cola Shortfill',     ml:100, mg:0,  ratio:'70/30', price:3.99, was:12.99, stock:.09, flavour:'#B07B3E', flag:'Save 69%', type:'eliquid', stars:4 }
];

export const STRENGTHS = [
  { mg:0,  name:'Shortfill', note:'Nicotine free, 100ml', level:.12 },
  { mg:3,  name:'Low',       note:'For sub-ohm kits',     level:.30 },
  { mg:10, name:'Medium',    note:'Most popular',         level:.62 },
  { mg:20, name:'High',      note:'Nic salt, pod kits',   level:1.0 }
];

export const CATEGORIES = [
  { name:'E-liquid',   count:'64 flavours', colour:'#E88CBA', icon:'bottle' },
  { name:'Pod kits',   count:'28 kits',     colour:'#F9CBA3', icon:'device' },
  { name:'Coils',      count:'41 packs',    colour:'#A6E4C2', icon:'coil'   },
  { name:'Pouches',    count:'19 flavours', colour:'#D8C6F0', icon:'tin'    }
];

export const POSTS = [
  { t:'How to unlock a Pixl Duo 12', d:'Trouble unlocking your device? Here are the steps.',       colour:'#E88CBA' },
  { t:'The future of vape packaging', d:'The government plans, and how to have your say.',          colour:'#8FD3F4' },
  { t:'Which nicotine strength?',     d:'Coming off disposables? Start here before you buy.',       colour:'#A6E4C2' },
  { t:'Top 10 nicotine pouches',      d:'Our flavour rundown to help you pick your next tin.',      colour:'#F9C22E' }
];

export const REVIEWS = [
  { t:'Angel vapes',    q:'Excellent flavours, been using for 12 months. Excellent service.', by:'Delwyn H. · 1 hour ago',   n:5 },
  { t:'Mega selection', q:'Great site, easy to use with fast delivery.',                       by:'Angela G. · 3 hours ago',  n:5 },
  { t:'Great product',  q:'Fast delivery, lots of flavours, good products.',                   by:'Janice K. · 4 hours ago',  n:5 },
  { t:'Fruity',         q:'I love mango so I tried the mango one and it is pretty good.',      by:'Sharron R. · 14 hours ago',n:4 }
];

export const HERO_SLIDES = ['Mega sale', 'New pod kits', '4 for £10', 'Pouches', 'Clearance'];
export const FREE_DELIVERY = 10.00;
