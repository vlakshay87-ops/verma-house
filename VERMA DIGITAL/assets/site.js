(() => {
  const localFile = location.protocol === "file:";
  const siteRoot = localFile ? new URL("../", document.currentScript.src) : null;
  const internalUrl = path => {
    if (!siteRoot) return path;
    const url = new URL(path.replace(/^\/+/, ""), siteRoot);
    if (url.pathname.endsWith("/")) url.pathname += "index.html";
    return url.href;
  };
  const path = (() => {
    if (!localFile) return location.pathname.replace(/index\.html$/, "").replace(/\/?$/, "/");
    let relativePath = location.pathname.slice(siteRoot.pathname.length).replace(/index\.html$/, "");
    if (!relativePath.startsWith("/")) relativePath = `/${relativePath}`;
    return relativePath.endsWith("/") ? relativePath : `${relativePath}/`;
  })();
  const serviceLinks = [
    ["Performance Marketing", "/services/performance-marketing/"],
    ["Google Ads Management", "/services/google-ads/"],
    ["Meta Ads Management", "/services/meta-ads/"],
    ["Search Engine Optimization", "/services/seo/"],
    ["Website Design & Development", "/services/website-development/"],
    ["Landing Pages & CRO", "/services/conversion-optimization/"],
    ["Local SEO", "/services/local-seo/"],
    ["Marketing Strategy", "/services/marketing-strategy/"],
    ["Analytics & Conversion Tracking", "/services/analytics-tracking/"]
  ];
  const navLink = (label, href) => `<a href="${internalUrl(href)}" ${path === href ? 'aria-current="page"' : ""}>${label}</a>`;
  const serviceMenu = serviceLinks.map(([label, href]) => `<a href="${internalUrl(href)}">${label}</a>`).join("");
  const header = `
    <div class="top-note">Thoughtful digital growth, built around your business. <a href="${internalUrl("/contact/")}">Let’s talk</a></div>
    <header class="site-header"><div class="container header-inner">
      <a class="brand" href="${internalUrl("/")}" aria-label="Verma Digital home"><img src="${internalUrl("/assets/brand-mark.jpg")}" alt="" width="44" height="44"><span>VERMA <b>DIGITAL</b></span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation">☰</button>
      <nav class="nav-main" id="primary-navigation" aria-label="Main navigation">
        ${navLink("Home", "/")}${navLink("About Us", "/about/")}
        <details class="nav-services"><summary>Services</summary><div class="service-menu">${serviceMenu}</div></details>
        ${navLink("Blog", "/blog/")}${navLink("Contact", "/contact/")}
      </nav>
      <button class="btn header-cta" type="button" data-callback-open>Request a Callback <span class="arrow">↗</span></button>
    </div></header>`;
  const footer = `
    <footer class="site-footer"><div class="container">
      <div class="footer-grid">
        <div class="footer-brand"><a class="brand" href="${internalUrl("/")}"><img src="${internalUrl("/assets/brand-mark.jpg")}" alt="" width="44" height="44"><span style="color:white">VERMA <b>DIGITAL</b></span></a><p>Strategy, advertising and websites—thoughtfully brought together to help businesses build a stronger digital presence.</p><a class="text-link" style="color:#9bc8ff" href="https://wa.me/919319672630" target="_blank" rel="noopener noreferrer">Chat on WhatsApp ↗</a></div>
        <div class="footer-col"><h3>Explore</h3>${navLink("Home", "/")}${navLink("About Us", "/about/")}${navLink("Services", "/services/")}${navLink("Blog", "/blog/")}${navLink("Contact", "/contact/")}</div>
        <div class="footer-col"><h3>Services</h3>${serviceLinks.map(([label,href])=>`<a href="${internalUrl(href)}">${label}</a>`).join("")}</div>
        <div class="footer-col"><h3>Get in touch</h3><a href="tel:+919319672630">+91 93196 72630</a><address class="address" style="color:#aab8ca">Uttam Nagar, Jeevan Park,<br>New Delhi, India</address><a href="${internalUrl("/privacy-policy/")}">Privacy Policy</a><a href="${internalUrl("/terms/")}">Terms of Service</a></div>
      </div>
      <div class="footer-bottom"><span>© ${new Date().getFullYear()} Verma Digital. All rights reserved.</span><span>Independent digital marketing studio · New Delhi, India</span></div>
    </div></footer>`;
  const serviceOptions = serviceLinks.map(([label]) => `<option>${label}</option>`).join("");
  const formMarkup = (kind = "callback") => `<form class="lead-form" data-lead-form="${kind}" novalidate>
      <div class="form-grid">
        <div class="field"><label for="${kind}-name">Full name <span aria-hidden="true">*</span></label><input id="${kind}-name" name="full_name" autocomplete="name" required minlength="2" maxlength="100"></div>
        <div class="field"><label for="${kind}-phone">Phone number <span aria-hidden="true">*</span></label><input id="${kind}-phone" name="phone_number" type="tel" inputmode="tel" autocomplete="tel" placeholder="+91 98765 43210" required></div>
        <div class="field"><label for="${kind}-business">Business name <span>(optional)</span></label><input id="${kind}-business" name="business_name" autocomplete="organization" maxlength="150"></div>
        <div class="field"><label for="${kind}-service">Service of interest <span>(optional)</span></label><select id="${kind}-service" name="service_interest"><option value="">Select a service</option>${serviceOptions}</select></div>
        <div class="field full"><label for="${kind}-time">Preferred contact time <span>(optional)</span></label><select id="${kind}-time" name="preferred_contact_time"><option value="">No preference</option><option>Morning (9 am–12 pm)</option><option>Afternoon (12–4 pm)</option><option>Evening (4–7 pm)</option></select></div>
      </div>
      <label class="consent"><input type="checkbox" name="consent" required><span>I agree that Verma Digital may use these details to respond to my enquiry. See the <a class="text-link" href="${internalUrl("/privacy-policy/")}" target="_blank">Privacy Policy</a>.</span></label>
      <label class="honeypot" aria-hidden="true">Leave this field empty<input name="website" tabindex="-1" autocomplete="off"></label>
      <button class="btn" type="submit">Submit Request <span aria-hidden="true">↗</span></button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>`;
  const modal = `<div class="callback-layer" id="callback-layer" aria-hidden="true"><section class="callback-dialog" role="dialog" aria-modal="true" aria-labelledby="callback-title" aria-describedby="callback-description">
    <button class="modal-close" type="button" aria-label="Close dialog">×</button><span class="eyebrow">Start a conversation</span><h2 id="callback-title">Request a Callback</h2><p id="callback-description">Share your details and we’ll get in touch to understand what your business needs.</p>${formMarkup("callback")}
  </section></div>`;
  const mount = document.querySelector("[data-site-header]");
  if (mount) mount.innerHTML = header;
  const footerMount = document.querySelector("[data-site-footer]");
  if (footerMount) footerMount.innerHTML = footer;
  if (!document.getElementById("callback-layer")) document.body.insertAdjacentHTML("beforeend", modal);
  if (!document.querySelector(".whatsapp-float")) {
    document.body.insertAdjacentHTML("beforeend", `<a class="whatsapp-float" href="https://wa.me/919319672630" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16 3.3A12.6 12.6 0 0 0 5.2 22.4L3.5 28.7l6.5-1.7A12.7 12.7 0 1 0 16 3.3Zm0 22.8a10 10 0 0 1-5.1-1.4l-.4-.2-3.8 1 1-3.7-.3-.4A10.1 10.1 0 1 1 16 26.1Zm5.6-7.5c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.3 8.3 0 0 1-2.5-1.5 9.3 9.3 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.7l.5-.6.3-.5c.1-.2 0-.4 0-.6l-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.7 1.2 3.1 1.4 3.3a11.2 11.2 0 0 0 4.3 3.8c.6.3 1.1.5 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4s-.3-.2-.6-.4Z"/></svg>
      <span>WhatsApp</span>
    </a>`);
  }
  const configuredSiteUrl = window.VD_CONFIG?.siteUrl?.replace(/\/+$/, "");
  if (configuredSiteUrl) {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = `${configuredSiteUrl}${path}`;
    const ensureMeta = (property) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.append(meta);
      }
      return meta;
    };
    const ogUrl = ensureMeta("og:url");
    ogUrl.content = `${configuredSiteUrl}${path}`;
    const ogImage = ensureMeta("og:image");
    ogImage.content = `${configuredSiteUrl}/assets/social-card.jpg`;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        if (data["@type"] === "Organization") data.url = configuredSiteUrl;
        if (data["@type"] === "WebSite") data.url = configuredSiteUrl;
        if (data["@type"] === "Article") data.mainEntityOfPage = `${configuredSiteUrl}${path}`;
        script.textContent = JSON.stringify(data);
      } catch (error) {
        console.error("Could not update structured metadata:", error);
      }
    });
  }

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-navigation");
  const closeMenu = () => {
    nav?.classList.remove("open");
    document.body.classList.remove("menu-open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Open navigation");
    if (toggle) toggle.textContent = "☰";
  };
  toggle?.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    toggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
    toggle.textContent = expanded ? "☰" : "×";
    nav.classList.toggle("open", !expanded);
    document.body.classList.toggle("menu-open", !expanded);
  });
  nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", event => {
    if (nav?.classList.contains("open") && !nav.contains(event.target) && !toggle?.contains(event.target)) closeMenu();
  });
  const layer = document.getElementById("callback-layer");
  let priorFocus = null;
  let inertSiblings = [];
  const closeModal = () => {
    layer.classList.remove("open");
    layer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    inertSiblings.forEach(node => { node.inert = false; });
    inertSiblings = [];
    priorFocus?.focus();
  };
  document.querySelectorAll("[data-callback-open]").forEach(button => button.addEventListener("click", () => {
    priorFocus = button;
    inertSiblings = [...document.body.children].filter(node => node !== layer);
    inertSiblings.forEach(node => { node.inert = true; });
    layer.classList.add("open");
    layer.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    layer.querySelector("input[name=full_name]").focus();
  }));
  layer.querySelector(".modal-close").addEventListener("click", closeModal);
  layer.addEventListener("click", event => { if (event.target === layer) closeModal(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && layer.classList.contains("open")) closeModal();
    if (event.key === "Tab" && layer.classList.contains("open")) {
      const items = [...layer.querySelectorAll('button,input,select,a[href]')].filter(el => !el.disabled && el.offsetParent);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  const phoneIsValid = value => {
    const digits = value.replace(/\D/g, "");
    const international = digits.startsWith("91") && digits.length === 12;
    const nationalPrefix = digits.startsWith("0") && digits.length === 11;
    const normalized = international ? digits.slice(2) : nationalPrefix ? digits.slice(1) : digits;
    return /^[6-9]\d{9}$/.test(normalized);
  };
  const showFieldError = (input, message) => {
    const field = input.closest(".field");
    let error = field?.querySelector(".field-error");
    if (field && !error) {
      error = document.createElement("span");
      error.className = "field-error";
      error.id = `${input.id}-error`;
      field.append(error);
    }
    if (error) {
      error.textContent = message;
      input.setAttribute("aria-describedby", error.id);
      input.setAttribute("aria-invalid", "true");
    }
  };
  const clearFieldError = input => {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
    input.closest(".field")?.querySelector(".field-error")?.remove();
  };
  document.querySelectorAll("[data-lead-form]").forEach(form => form.addEventListener("submit", async event => {
    event.preventDefault();
    const status = form.querySelector(".form-status");
    const button = form.querySelector('button[type="submit"]');
    status.textContent = "";
    status.classList.remove("success");
    const name = form.elements.full_name;
    const phone = form.elements.phone_number;
    let invalid = false;
    if (name.value.trim().length < 2) { showFieldError(name, "Enter your name using at least 2 characters."); invalid = true; }
    else clearFieldError(name);
    if (!phoneIsValid(phone.value)) { showFieldError(phone, "Enter a valid Indian mobile number with 10 digits."); invalid = true; }
    else clearFieldError(phone);
    if (!form.elements.consent.checked) { status.textContent = "Please agree to the privacy notice before submitting."; invalid = true; }
    if (invalid) {
      if (!status.textContent) status.textContent = "Please correct the highlighted fields.";
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    if (form.elements.website.value) { status.textContent = "This request could not be submitted. Please try again."; return; }
    const endpoint = window.VD_CONFIG?.leadEndpoint;
    if (localFile) {
      status.textContent = "A page opened from disk cannot send enquiries. Please run the site on a local web server, or call +91 93196 72630 or message us on WhatsApp.";
      return;
    }
    if (!endpoint) {
      status.textContent = "Enquiry form is not connected yet. Please call +91 93196 72630 or message us on WhatsApp.";
      return;
    }
    button.disabled = true;
    button.textContent = "Sending…";
    const payload = {
      full_name: name.value.trim(),
      phone_number: phone.value.trim(),
      business_name: form.elements.business_name.value.trim(),
      service_interest: form.elements.service_interest.value,
      preferred_contact_time: form.elements.preferred_contact_time.value,
      consent: form.elements.consent.checked,
      source_page: location.pathname,
      website: ""
    };
    try {
      const response = await fetch(endpoint, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("We couldn't confirm your request was received. Please try again or call us.");
      }
      if (!response.ok) {
        const message = result && typeof result.error === "string" ? result.error : "We couldn't submit your request. Please try again or contact us by phone.";
        throw new Error(message);
      }
      if (!result || result.message !== "Your request has been received.") {
        throw new Error("We couldn't confirm your request was received. Please call us before trying again.");
      }
      form.reset();
      status.textContent = "Thank you. Your request has been received. We’ll be in touch.";
      status.classList.add("success");
    } catch (error) {
      status.textContent = error.message || "We couldn't connect. Please call +91 93196 72630 or try again.";
    } finally {
      button.disabled = false;
      button.innerHTML = 'Submit Request <span aria-hidden="true">↗</span>';
    }
  }));

  const slides = [...document.querySelectorAll(".slide")];
  if (slides.length) {
    const root = document.querySelector(".hero");
    const slideFrame = root.querySelector(".slides");
    const dots = [...document.querySelectorAll(".slide-dots button")];
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0, timer, resumeTimer, touchStart = null, suppressSwipeClick = false;
    const updateFrameHeight = () => {
      slideFrame.style.minHeight = `${Math.max(...slides.map(slide => slide.scrollHeight))}px`;
    };
    const show = (n, direction = 1) => {
      current = (n + slides.length) % slides.length;
      root.dataset.slide = String(current);
      root.dataset.direction = direction < 0 ? "previous" : "next";
      slides.forEach((slide, i) => {
        let offset = (i - current + slides.length) % slides.length;
        if (offset > slides.length / 2) offset -= slides.length;
        slide.style.setProperty("--slide-offset", String(offset));
        const active = i === current;
        slide.classList.toggle("active", active);
        slide.setAttribute("aria-hidden", String(!active));
        slide.inert = !active;
      });
      dots.forEach((dot, i) => { dot.setAttribute("aria-current", String(i === current)); });
      const count = document.querySelector(".slide-count");
      if (count) count.textContent = `${String(current + 1).padStart(2,"0")} / ${String(slides.length).padStart(2,"0")}`;
    };
    const start = () => {
      clearInterval(timer);
      clearTimeout(resumeTimer);
      if (!reducedMotion.matches) timer = setInterval(() => show(current + 1, 1), 4500);
    };
    const pauseForInteraction = () => {
      clearInterval(timer);
      clearTimeout(resumeTimer);
      if (!reducedMotion.matches) resumeTimer = setTimeout(start, 5000);
    };
    document.querySelector("[data-slide-prev]")?.addEventListener("click", () => { show(current - 1, -1); pauseForInteraction(); });
    document.querySelector("[data-slide-next]")?.addEventListener("click", () => { show(current + 1, 1); pauseForInteraction(); });
    dots.forEach((dot, i) => dot.addEventListener("click", () => { show(i, i < current ? -1 : 1); pauseForInteraction(); }));
    root.addEventListener("mouseenter", () => { clearInterval(timer); clearTimeout(resumeTimer); });
    root.addEventListener("mouseleave", pauseForInteraction);
    root.addEventListener("focusin", () => { clearInterval(timer); clearTimeout(resumeTimer); });
    root.addEventListener("focusout", event => {
      if (!root.contains(event.relatedTarget)) pauseForInteraction();
    });
    root.addEventListener("keydown", event => {
      if (event.key === "ArrowRight") { show(current + 1, 1); pauseForInteraction(); }
      if (event.key === "ArrowLeft") { show(current - 1, -1); pauseForInteraction(); }
    });
    root.addEventListener("pointerdown", event => {
      suppressSwipeClick = false;
      if (event.pointerType !== "touch" || event.target.closest(".slider-controls")) return;
      touchStart = {x:event.clientX,y:event.clientY};
      clearInterval(timer);
      clearTimeout(resumeTimer);
    }, {passive:true});
    root.addEventListener("pointerup", event => {
      if (!touchStart) return;
      const deltaX = event.clientX - touchStart.x;
      const deltaY = event.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
        const direction = deltaX < 0 ? 1 : -1;
        show(current + direction, direction);
        suppressSwipeClick = true;
        setTimeout(() => { suppressSwipeClick = false; }, 400);
      }
      pauseForInteraction();
    }, {passive:true});
    root.addEventListener("click", event => {
      if (!suppressSwipeClick || !event.target.closest("a,button")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressSwipeClick = false;
    }, true);
    root.addEventListener("pointercancel", () => {
      touchStart = null;
      pauseForInteraction();
    }, {passive:true});
    reducedMotion.addEventListener?.("change", start);
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(updateFrameHeight).observe(root);
    else window.addEventListener("resize", updateFrameHeight);
    show(0);
    updateFrameHeight();
    start();
  }
})();
