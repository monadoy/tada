// Engine-key request form (lab/access.md). The site is static: the form sends nothing itself. It writes the
// request as an email in the visitor's own mail app (mailto:), addressed to the TADA team, or copies the text.
// Mount point: <div data-tada-key-request data-email="team@example.org" data-terms="#terms"></div>
(function () {
  "use strict";
  var MAX_WHY = 1200;  // keeps the mailto: link within what mail apps accept

  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    (kids || []).forEach(function (c) { if (c != null) el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }
  // Material Design Icons (email-edit-outline, content-copy), inlined so the form needs no icon font.
  function icon(d) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("aria-hidden", "true");
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", d); svg.appendChild(p);
    return svg;
  }
  var MAIL = "M19.07 13.88 13 19.94V22h2.06l6.06-6.07m1.58-2.35-1.28-1.28a.52.52 0 0 0-.38-.17c-.15.01-.29.06-.39.17l-1 1 2.05 2 1-1c.19-.2.19-.52 0-.72M11 18H4V8l8 5 8-5v2h2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7zm9-12-8 5-8-5z";
  var COPY = "M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z";

  function mount(root) {
    var email = (root.getAttribute("data-email") || "").trim();
    var terms = root.getAttribute("data-terms") || "#terms";
    var uid = 0;
    function field(label, control, opts) {
      opts = opts || {};
      var id = "tada-keyreq-" + (++uid);
      control.id = id;
      if (opts.required) control.setAttribute("required", "");
      return h("div", { class: "tada-keyreq__field" + (opts.wide ? " tada-keyreq__field--wide" : "") }, [
        h("label", { for: id, text: label }), control,
        opts.hint ? h("span", { class: "tada-keyreq__hint", text: opts.hint }) : null
      ]);
    }
    var name = h("input", { type: "text", autocomplete: "name", maxlength: "120" });
    var org = h("input", { type: "text", autocomplete: "organization", maxlength: "160" });
    var role = h("input", { type: "text", autocomplete: "organization-title", maxlength: "160",
      placeholder: "e.g. approach controller, ATM researcher, PhD student" });
    var why = h("textarea", { maxlength: String(MAX_WHY), rows: "5",
      placeholder: "What you would like to try in the Lab, and what for." });
    var agree = h("input", { type: "checkbox" });
    var status = h("span", { class: "tada-keyreq__status", role: "status", "aria-live": "polite" });
    var preview = h("pre", { class: "tada-keyreq__preview", hidden: true });

    function body() {
      return [
        "Request for a TADA Lab engine key",
        "",
        "Name: " + name.value.trim(),
        "Organisation: " + org.value.trim(),
        "Role: " + role.value.trim(),
        "",
        "Why I would like to use the Lab:",
        why.value.trim(),
        "",
        "I have read the Lab engine terms and will not share the key or the unlocked engine."
      ].join("\n");
    }
    function check() {
      var ok = true;
      [name, org, role, why].forEach(function (el) {
        var bad = !el.value.trim();
        el.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad) ok = false;
      });
      if (!ok) { say("Please fill in all four fields.", "is-error"); return false; }
      if (!agree.checked) { say("Please confirm that you have read the terms.", "is-error"); return false; }
      return true;
    }
    function say(text, cls) { status.textContent = text; status.className = "tada-keyreq__status" + (cls ? " " + cls : ""); }
    function show() { preview.textContent = (email ? "To: " + email + "\n" : "") + "Subject: TADA Lab engine key request\n\n" + body(); preview.hidden = false; }

    var compose = h("button", { type: "button", class: "tada-keyreq__btn tada-keyreq__btn--primary", disabled: !email,
      onclick: function () {
        if (!check()) return;
        show();
        window.location.href = "mailto:" + encodeURIComponent(email) +
          "?subject=" + encodeURIComponent("TADA Lab engine key request") + "&body=" + encodeURIComponent(body());
        say("Your mail app should open with the request filled in: review it and press send. Nothing was sent by this page.", "is-ok");
      } }, [icon(MAIL), "Write the email"]);
    var copy = h("button", { type: "button", class: "tada-keyreq__btn",
      onclick: function () {
        if (!check()) return;
        show();
        var text = body();
        var done = function () { say(email ? "Copied. Paste it into an email to " + email + "." : "Copied.", "is-ok"); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { say("Could not copy: select the text below instead.", "is-error"); });
        else say("Select and copy the text below.", "");
      } }, [icon(COPY), "Copy the text"]);

    root.classList.add("tada-keyreq");
    root.textContent = "";
    if (!email) root.appendChild(h("div", { class: "tada-keyreq__pending",
      text: "The address for key requests has not been published yet. You can prepare your request below; please check back for the address." }));
    root.appendChild(h("div", { class: "tada-keyreq__grid" }, [
      field("Your name", name, { required: true }),
      field("Organisation", org, { required: true }),
      field("Your role", role, { required: true, wide: true }),
      field("Why you would like to use the Lab", why, { required: true, wide: true,
        hint: "A few sentences are enough. We read every request and reply by email with the key." }),
      h("div", { class: "tada-keyreq__field tada-keyreq__field--wide" }, [
        h("label", { class: "tada-keyreq__agree" }, [agree,
          h("span", {}, ["I have read the ", h("a", { href: terms, text: "Lab engine terms" }),
            ": the key is for my own use, and I will not share it or the unlocked engine."])])
      ])
    ]));
    root.appendChild(h("div", { class: "tada-keyreq__actions" }, [compose, copy, status]));
    root.appendChild(preview);
  }

  function boot() { document.querySelectorAll("[data-tada-key-request]").forEach(mount); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
