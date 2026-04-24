export function SiteFooter() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-inner">
        <p>&copy; {new Date().getFullYear()} TalentHub. All rights reserved.</p>
        <nav className="footer-links" aria-label="Footer navigation">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Accessibility</a>
        </nav>
      </div>
    </footer>
  );
}
