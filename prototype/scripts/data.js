/* Placeholder catalogue for the prototype.
   Product names, prices and stock are illustrative — swap for real Shopify
   data when this ports to Liquid. Flavour colours are what drive the
   card flood, so they are part of the design system, not decoration. */

export const PRODUCTS = [
  { id:'aq-blue-raz',  brand:'Aquavape',   name:'Blue Raspberry',      ml:10,  mg:20, ratio:'50/50', price:3.99, was:4.99, stock:0.82, flavour:'#3B82F6', tag:'Best seller' },
  { id:'aq-mango-ice', brand:'Aquavape',   name:'Mango Ice',           ml:10,  mg:10, ratio:'50/50', price:3.99, was:null, stock:0.64, flavour:'#F5A809', tag:null },
  { id:'aq-rhubarb',   brand:'Aquavape',   name:'Rhubarb & Custard',   ml:100, mg:0,  ratio:'70/30', price:11.99,was:15.99,stock:0.41, flavour:'#FA5B61', tag:'Shortfill' },
  { id:'aq-menthol',   brand:'Aquavape',   name:'Spearmint Menthol',   ml:10,  mg:20, ratio:'50/50', price:3.99, was:null, stock:0.93, flavour:'#38E0D0', tag:null },
  { id:'aq-cherry',    brand:'Aquavape',   name:'Black Cherry',        ml:10,  mg:10, ratio:'50/50', price:3.99, was:null, stock:0.28, flavour:'#8B2942', tag:'Low stock' },
  { id:'aq-lemon',     brand:'Aquavape',   name:'Sicilian Lemon',      ml:100, mg:0,  ratio:'70/30', price:11.99,was:null, stock:0.71, flavour:'#FDCB2F', tag:null },
  { id:'aq-berry',     brand:'Aquavape',   name:'Summer Berries',      ml:10,  mg:20, ratio:'50/50', price:3.99, was:4.99, stock:0.55, flavour:'#7C3AED', tag:'Save 20%' },
  { id:'aq-vanilla',   brand:'Aquavape',   name:'Vanilla Custard',     ml:100, mg:0,  ratio:'70/30', price:11.99,was:null, stock:0.37, flavour:'#D9A441', tag:null }
];

export const STRENGTHS = [
  { mg:0,  name:'Shortfill', note:'Nicotine free, 100ml', level:0.12 },
  { mg:3,  name:'Low',       note:'For sub-ohm kits',     level:0.30 },
  { mg:10, name:'Medium',    note:'Most popular',         level:0.62 },
  { mg:20, name:'High',      note:'Nic salt, pod kits',   level:1.00 }
];

export const FREE_DELIVERY = 20.00;
