import React,{useState} from 'react';
import {Link,NavLink,Outlet,useLocation} from 'react-router-dom';
import {Home,Search,Plus,ShoppingBag,UserRound,Globe2,ArrowUpRight} from 'lucide-react';
const navClass=({isActive})=>isActive?'is-active':'';

export function Layout(){
 const [lang,setLang]=useState('FR'); const location=useLocation();
 const bottomClass=(path,hash='')=>location.pathname===path&&location.hash===hash?'is-active':'';
 return <>
  <header className="desktop-header"><Link className="brand" to="/"><span>DRIPX</span><b>+</b></Link><nav className="desktop-nav"><NavLink className={navClass} to="/shop">Boutique</NavLink><NavLink className={navClass} to="/vendors">Vendeurs</NavLink><NavLink className={navClass} to="/vendor/dashboard">Espace vendeur</NavLink><NavLink className={navClass} to="/admin">Admin</NavLink></nav><div className="header-actions"><button className="lang" aria-label="Changer de langue" onClick={()=>setLang(lang==='FR'?'EN':'FR')}><Globe2 size={14}/>{lang}</button><Link className="desktop-cta" to="/vendor/dashboard">Devenir vendeur<ArrowUpRight size={15}/></Link></div></header>
  <Outlet/>
  <footer><Link className="brand" to="/"><span>DRIPX</span><b>+</b></Link><p>Kayes, Mali · Paiement et livraison directement avec le vendeur.</p><div><a href="#top">Instagram</a><a href="#top">WhatsApp</a></div></footer>
  <nav className="bottom-nav" aria-label="Navigation principale"><Link className={bottomClass('/')} to="/"><Home/><span>Accueil</span></Link><Link className={bottomClass('/shop')} to="/shop"><Search/><span>Recherche</span></Link><Link className={'nav-add '+bottomClass('/vendor/dashboard')} to="/vendor/dashboard"><i><Plus/></i><span>Ajouter</span></Link><Link className={bottomClass('/vendor/dashboard','#orders')} to="/vendor/dashboard#orders"><ShoppingBag/><span>Commandes</span></Link><Link className={bottomClass('/vendor/dashboard','#profile')} to="/vendor/dashboard#profile"><UserRound/><span>Profil</span></Link></nav>
 </>}
