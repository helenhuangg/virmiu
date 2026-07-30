(function () {
  var PROJECT_ID = "eyangq6p";
  var DATASET = "production";
  var API_VERSION = "v2026-07-01";
  var LOAD_TIMEOUT_MS = 2500;

  var QUERY = [
    "{",
    '"commission": *[_id == "commissionPage"][0]{status, statusNote, queueLabel, queueUrl, pricingTitle,',
    "pricing[]{_key, name, price, description}, pricingFootnote, paymentTitle, paymentTerms},",
    '"about": *[_id == "aboutPage"][0]{heading, rows[]{_key, label, body}, postscript},',
    '"home": *[_id == "homePage"][0]{taglineLines},',
    '"settings": *[_id == "siteSettings"][0]{socialLinks[]{_key, label, url, icon,',
    '"customIcon": customIcon.asset->url}, footerCredit},',
    '"playlist": *[_id == "musicPlaylist"][0]{playlistId, tracks[]{_key, spotifyUrl, title, artist}}',
    "}",
  ].join(" ");

  var BUNDLED_ICONS = {
    nexus: "assets/nexus.svg",
    kofi: "assets/kofi.svg",
    twitter: "assets/twitter.svg",
  };

  var STATUS_LABELS = {
    open: "open",
    limited: "limited slots",
    closed: "closed",
  };

  var DECORATORS = {
    strong: ["<strong>", "</strong>"],
    em: ["<em>", "</em>"],
    highlight: ['<span class="tos-highlight">', "</span>"],
    pink: ['<span class="about-pink">', "</span>"],
  };

  var contentPromise = null;

  function requestUrl() {
    return (
      "https://" +
      PROJECT_ID +
      ".apicdn.sanity.io/" +
      API_VERSION +
      "/data/query/" +
      DATASET +
      "?query=" +
      encodeURIComponent(QUERY)
    );
  }

  function loadContent() {
    if (contentPromise) return contentPromise;
    contentPromise = fetch(requestUrl())
      .then(function (response) {
        if (!response.ok) throw new Error("Sanity request failed");
        return response.json();
      })
      .then(function (payload) {
        return payload.result || null;
      })
      .catch(function () {
        return null;
      });
    return contentPromise;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function findMarkDef(markDefs, key) {
    for (var i = 0; i < markDefs.length; i++) {
      if (markDefs[i] && markDefs[i]._key === key) return markDefs[i];
    }
    return null;
  }

  function renderSpan(span, markDefs) {
    var html = escapeHtml(span.text).replace(/\n/g, "<br />");
    var marks = span.marks || [];
    var decorators = [];

    // Annotations wrap closest to the text so CSS like `.tos-highlight a` still matches.
    marks.forEach(function (mark) {
      if (DECORATORS[mark]) {
        decorators.push(mark);
        return;
      }
      var def = findMarkDef(markDefs, mark);
      if (def && def._type === "link" && def.href) {
        html =
          '<a href="' +
          escapeHtml(def.href) +
          '" target="_blank" rel="noopener noreferrer">' +
          html +
          "</a>";
      }
    });

    decorators.forEach(function (mark) {
      html = DECORATORS[mark][0] + html + DECORATORS[mark][1];
    });

    return html;
  }

  function renderBlock(block) {
    return (block.children || [])
      .filter(function (child) {
        return child && child._type === "span";
      })
      .map(function (child) {
        return renderSpan(child, block.markDefs || []);
      })
      .join("");
  }

  // One string of inline HTML per paragraph.
  function renderBlocks(blocks) {
    if (!Array.isArray(blocks)) return [];
    return blocks
      .filter(function (block) {
        return block && block._type === "block";
      })
      .map(renderBlock)
      .filter(function (html) {
        return html.trim() !== "";
      });
  }

  function hooks(name) {
    return document.querySelectorAll('[data-sanity="' + name + '"]');
  }

  function setHtml(name, html) {
    var changed = false;
    hooks(name).forEach(function (el) {
      if (el.innerHTML !== html) {
        el.innerHTML = html;
        changed = true;
      }
    });
    return changed;
  }

  function renderCommission(commission) {
    if (!commission) return false;
    var changed = false;

    var status = STATUS_LABELS[commission.status] || commission.status;
    if (status) {
      var statusText = "commission status: " + status;
      if (commission.statusNote) statusText += " — " + commission.statusNote;
      changed = setHtml("commission-status", escapeHtml(statusText)) || changed;
    }

    if (commission.queueUrl) {
      var queueLabel = commission.queueLabel || "view commission queue";
      changed =
        setHtml(
          "commission-queue",
          '<a href="' +
            escapeHtml(commission.queueUrl) +
            '" target="_blank" rel="noopener noreferrer">' +
            escapeHtml(queueLabel) +
            "</a>",
        ) || changed;
    } else {
      changed = setHtml("commission-queue", "") || changed;
    }

    if (commission.pricingTitle) {
      changed =
        setHtml("pricing-title", escapeHtml(commission.pricingTitle)) || changed;
    }

    if (Array.isArray(commission.pricing)) {
      var items = commission.pricing.map(function (item) {
        var heading = "<b>" + escapeHtml(item.name) + "</b>";
        if (item.price) heading += ": " + escapeHtml(item.price);

        var description = renderBlocks(item.description)
          .map(function (html) {
            return '<p class="tos-item-note">' + html + "</p>";
          })
          .join("");

        return (
          '<div class="tos-item"><h6 class="tos-section-list-item">' +
          heading +
          "</h6>" +
          description +
          "</div>"
        );
      });
      if (commission.pricingFootnote) {
        items.push(
          '<p class="caption">' +
            escapeHtml(commission.pricingFootnote) +
            "</p>",
        );
      }
      changed = setHtml("pricing-list", items.join("")) || changed;
    }

    if (commission.paymentTitle) {
      changed =
        setHtml("payment-title", escapeHtml(commission.paymentTitle)) || changed;
    }

    var terms = renderBlocks(commission.paymentTerms).map(function (html) {
      return '<h6 class="tos-section-list-item">' + html + "</h6>";
    });
    if (terms.length) {
      changed = setHtml("payment-list", terms.join("")) || changed;
    }

    return changed;
  }

  function renderAbout(about) {
    if (!about) return false;
    var changed = false;

    if (about.heading) {
      changed = setHtml("about-heading", escapeHtml(about.heading)) || changed;
    }

    if (Array.isArray(about.rows)) {
      var rows = about.rows.map(function (row) {
        var paragraphs = renderBlocks(row.body)
          .map(function (html) {
            return "<p>" + html + "</p>";
          })
          .join("");
        return (
          '<section class="about-row"><h2 class="about-label">' +
          escapeHtml(row.label) +
          '</h2><div class="about-copy">' +
          paragraphs +
          "</div></section>"
        );
      });
      changed = setHtml("about-rows", rows.join("")) || changed;
    }

    var postscript = renderBlocks(about.postscript).join(" ");
    if (postscript) {
      changed = setHtml("about-postscript", postscript) || changed;
    }

    return changed;
  }

  function renderHome(home) {
    if (!home || !Array.isArray(home.taglineLines)) return false;
    var lines = home.taglineLines
      .filter(function (line) {
        return typeof line === "string" && line.trim() !== "";
      })
      .map(function (line) {
        return '<h5 class="element">' + escapeHtml(line) + "</h5>";
      });
    if (!lines.length) return false;
    return setHtml("tagline", lines.join(""));
  }

  function renderSocialLinks(settings) {
    if (!settings || !Array.isArray(settings.socialLinks)) return false;

    var links = settings.socialLinks
      .filter(function (link) {
        return link && link.url;
      })
      .map(function (link) {
        var src =
          link.icon === "custom" ? link.customIcon : BUNDLED_ICONS[link.icon];
        var icon = src
          ? '<img src="' + escapeHtml(src) + '" alt="" class="icon" />'
          : "";
        return (
          '<a href="' +
          escapeHtml(link.url) +
          '" class="icon-link" target="_blank" rel="noopener noreferrer">' +
          icon +
          '<span class="icon-link__label">' +
          escapeHtml(link.label) +
          "</span></a>"
        );
      });

    if (!links.length) return false;
    return setHtml("social-links", links.join(""));
  }

  function renderFooter(settings) {
    var credit = settings && settings.footerCredit;
    if (!credit) return false;

    var html = "&copy; " + new Date().getFullYear();
    if (credit.text) html += " " + escapeHtml(credit.text);
    if (credit.name) {
      html += " ";
      html += credit.url
        ? '<a href="' +
          escapeHtml(credit.url) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(credit.name) +
          "</a>"
        : escapeHtml(credit.name);
    }

    var changed = false;
    document.querySelectorAll(".site-footer__copy").forEach(function (el) {
      if (el.innerHTML !== html) {
        el.innerHTML = html;
        changed = true;
      }
    });
    return changed;
  }

  // The page holds no copy of its own, so say something useful if the CMS is unreachable.
  function renderFallbackNotice() {
    var text = "couldn't load this right now — please refresh the page.";

    hooks("pricing-list").forEach(function (el) {
      if (el.innerHTML.trim()) return;
      el.innerHTML = '<h6 class="tos-section-list-item">' + text + "</h6>";
    });

    hooks("about-rows").forEach(function (el) {
      if (el.innerHTML.trim()) return;
      el.innerHTML =
        '<section class="about-row"><div class="about-copy"><p>' +
        text +
        "</p></div></section>";
    });
  }

  /**
   * Content areas start empty in the HTML, so nothing outdated can flash up before the
   * real values land. `done` runs the reveal animations once the copy is in the DOM.
   */
  window.initSanityContent = function (done) {
    // On a slow connection the page reveals itself first; `done` then runs a second time
    // once the copy arrives, which the reveal helpers are written to tolerate.
    var timer = window.setTimeout(function () {
      renderFallbackNotice();
      if (done) done();
    }, LOAD_TIMEOUT_MS);

    loadContent().then(function (content) {
      window.clearTimeout(timer);
      if (content) {
        try {
          renderCommission(content.commission);
          renderAbout(content.about);
          renderHome(content.home);
          renderSocialLinks(content.settings);
          renderFooter(content.settings);
        } catch (e) {}
      } else {
        renderFallbackNotice();
      }
      if (done) done();
    });
  };

  window.eliseContent = {load: loadContent};
})();
