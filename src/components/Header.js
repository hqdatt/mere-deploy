import { Link } from "react-router-dom";

export default function Header() {
   return (
      <header>
         <Link to="/" className="logo"> Scarlett's Journal. </Link>
         <nav>
            <Link to="/">HOME</Link>
            <Link to="/about">ABOUT</Link>
            <Link to="/login">LOGIN</Link>
            <Link to="/register">REGISTER</Link>
         </nav>
      </header>
    );
}