import { Link } from "react-router-dom"
export default function Footer() {
   return (
      <footer>
         <div className="footer_container">
            <div className="footer_section social-links"> 
               <h4>Follow Us</h4>
               <ul className="social">
                  <li><a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                  <li><a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
                  <li><a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
               </ul>
            </div>
            <div className="footer_section quick_links">
               <h4>Quick Links</h4>
               <Link to="/" key="home">Home</Link>
               <Link to="/about" key="about">About</Link>
               <Link to="/contact" key="contact">Contact</Link>
            </div>
            <div className="footer_section intro">
               <h4>About This Blog</h4>
               <p>Welcome to [Your Blog Name]! We share insightful articles on [topics you cover]. Stay tuned for more updates and stories that matter. Do you agree with this</p>
            </div>
         </div>
      </footer>
   )
}