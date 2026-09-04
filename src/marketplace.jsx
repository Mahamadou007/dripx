import React,{createContext,useContext,useState} from 'react';
import {vendors as initialVendors} from './data';

const MarketplaceContext=createContext(null);
const seedVendors=initialVendors.map(([id,name,description,pieces])=>({id,name,description,pieces,status:'approved',owner:name==='KAYES TAILORING CO.'?'Amadou Traoré':'Équipe DripX+',phone:'223 70 00 00 00'})).concat([
 {id:'04',name:'Atelier Sira',description:'Coupes contemporaines et savoir-faire local',pieces:'0 pièce',status:'pending',owner:'Awa Sissoko',phone:'223 76 00 00 00',submitted:'Il y a 20 min'},
 {id:'05',name:'N’Golo Menswear',description:'Essentiels hommes et pièces formelles',pieces:'0 pièce',status:'pending',owner:'Moussa Diarra',phone:'223 77 12 43 55',submitted:'Il y a 2 h'},
 {id:'06',name:'Sira Créations',description:'Tenues de cérémonie sur mesure',pieces:'0 pièce',status:'pending',owner:'Fatoumata Sangaré',phone:'223 66 24 81 12',submitted:'Hier'}
]);
const seedOrders=[
 {id:'#DX-2038',vendor:'KAYES TAILORING CO.',buyer:'Moussa Traoré',phone:'223 70 11 22 33',product:'Veste saharienne',size:'L',total:18500,createdAt:'Il y a 12 min',status:'Nouveau'},
 {id:'#DX-2037',vendor:'KAYES TAILORING CO.',buyer:'Binta Koné',phone:'223 76 22 33 44',product:'Pantalon coupe droite',size:'M',total:15000,createdAt:'Il y a 48 min',status:'Nouveau'}
];
export function MarketplaceProvider({children}){const [vendors,setVendors]=useState(seedVendors);const [orders,setOrders]=useState(seedOrders);
 const createOrder=({product,size,buyer,phone,address,note})=>{const id=`#DX-${2040+orders.length}`;const order={id,vendor:product.shop,buyer,phone,product:product.title,size,total:product.price,address,note,createdAt:"À l’instant",status:'Nouveau'};setOrders(previous=>[order,...previous]);return order};
 const reviewVendor=(id,status)=>setVendors(previous=>previous.map(v=>v.id===id?{...v,status}:v));
 return <MarketplaceContext.Provider value={{vendors,orders,createOrder,reviewVendor}}>{children}</MarketplaceContext.Provider>}
export const useMarketplace=()=>useContext(MarketplaceContext);
