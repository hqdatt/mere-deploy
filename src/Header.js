import { Link } from "react-router-dom";

export default function Header() {

   function logout() {

   }
   return (
      <header>
         <div className="logo">Scarlett's Journal.</div>
         <nav>
            <div>HOME</div>
            <div>ABOUT</div>
         </nav>
      </header>
    );
}