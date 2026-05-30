function headerLinkClass(href) {
  const path = window.location.pathname.split("/").pop() || "index.html";
  const isActive =
    path === href || (path === "" && href === "index.html");
  return isActive
    ? "site-header__link site-header__link--active"
    : "site-header__link";
}

function renderSiteHeader() {
  return `
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

window.refreshSiteHeader = function () {
  document.querySelectorAll("special-header").forEach(function (header) {
    header.innerHTML = renderSiteHeader();
  });
};

class SpecialHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = renderSiteHeader();
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

class FlairTrail extends HTMLElement {
  connectedCallback() {
    if (this.childElementCount) return;

    this.classList.add("flair-trail");
    this.setAttribute("aria-hidden", "true");
    var srcs = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8];
    this.innerHTML = srcs
      .map(function (n) {
        return '<img class="flair" src="assets/flair-' + n + '.png" alt="" />';
      })
      .join("");
  }
}

customElements.define("flair-trail", FlairTrail);
customElements.define("special-header", SpecialHeader);
customElements.define("special-footer", SpecialFooter);
