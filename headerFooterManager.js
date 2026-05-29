function headerLinkClass(href) {
  const path = window.location.pathname.split("/").pop() || "index.html";
  const isActive =
    path === href || (path === "" && href === "index.html");
  return isActive
    ? "site-header__link site-header__link--active"
    : "site-header__link";
}

class SpecialHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="site-header">
        <a href="index.html" class="site-header__logo-link">
          <span class="site-header__logo-wrap">
            <img
              src="assets/elise%20logo.svg"
              alt="Elise"
              class="site-header__logo"
            />
            <img
              src="assets/elise%20logo.svg"
              alt=""
              class="site-header__logo site-header__logo--hover"
              aria-hidden="true"
            />
          </span>
        </a>
        <div class="site-header__links">
          <a href="index.html" class="${headerLinkClass("index.html")}">home</a>
          <a href="commission.html" class="${headerLinkClass("commission.html")}">commission</a>
          <a href="about.html" class="${headerLinkClass("about.html")}">about</a>
        </div>
      </nav>
    `;
  }
}

class SpecialFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer">
        <p class="site-footer__copy">&copy; ${new Date().getFullYear()} designed & coded by <a href="https://helens.design" target="_blank">helen</a></p>
      </footer>
    `;
  }
}

customElements.define("special-header", SpecialHeader);
customElements.define("special-footer", SpecialFooter);
