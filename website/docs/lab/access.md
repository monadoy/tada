---
icon: material/key-variant
---

# Request an engine key

!!! abstract "Summary"
    The Lab's simulator is published encrypted and unlocks with an engine key. Anyone who would like to
    try it can ask for one: describe your role and why you would like to use it, and the TADA team will
    send you the key by email. The code and the trained models in the
    [repository](https://github.com/monadoy/tada) need no key.

## Why there is a key

The [Lab](index.md) runs the real TADA simulator in your browser, together with the two published
single-agent policies. To do that, the simulator, the Malpensa and Bergamo scenario configurations and the
environment are compiled into a single WebAssembly module that anyone could otherwise download and reuse.
It is therefore published only as ciphertext, encrypted with **AES-256-GCM** under a 256-bit key, and the
page decrypts it in your browser when you enter the key. Without the key the published file is unusable.

A key controls who can run the engine; it cannot hide the engine from someone who holds one. That is why a
key comes with the [terms](#terms) below.

## Ask for a key

Fill in the four fields. The form does not send anything itself: it writes the request as an email in
your own mail app, addressed to the TADA team, for you to review and send. We read every request and
reply to that email address with the key.

<div data-tada-key-request data-email="leander.grech@um.edu.mt" data-terms="#terms">
  <noscript>The request form needs JavaScript. You can instead email
  <a href="mailto:leander.grech@um.edu.mt">leander.grech@um.edu.mt</a> with your name, organisation, role and why
  you would like to use the Lab.</noscript>
</div>

Once you have the key, open the [Lab](index.md), paste it into the key field and press **Unlock**. The
browser can remember it for you, and *forget key* in the Lab's status bar removes it again.

## Terms { #terms }

--8<-- "LAB-ENGINE-TERMS.md"
