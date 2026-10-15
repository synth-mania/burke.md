# gpg

If you want to send me something only I can read, or verify that
something I sent really came from me, GPG will let you do that.

GPG (GNU Privacy Guard) implements the OpenPGP format. It encrypts
things so only the matching private key can read them, and signs things
so anyone with the public key can verify who made them.

After downloading and importing my GPG public key, your GPG client will be able to verify and decrypt messages from me, and encrypt messages meant for me.

## my key

- **fingerprint:** `F883 57E6 08CC 0BAB 7497 4AC2 0429 0A70 49DC 7EC7`
- **email:** `b@burke.md`
- **key:** ed25519 (sign) + cv25519 (encrypt), expires 2028-10-13
- **public key:** [gpg.asc](/gpg.asc) — `gpg --import gpg.asc`

## sending me something private

Encrypt a file to my GPG identity:

```
gpg --encrypt --recipient b@burke.md secret.txt
```

Then attach the result to an email to `b@burke.md` (or send it through any other communication channel).

Only my private key can read `secret.txt.gpg`.

## verifying something I sent

Anything I sign, whether an email or another document, can be verified:

```
gpg --verify signature.gpg document
```

A *good signature* from the key above means I made it and it hasn't been
modified since.

## before you trust any of this

A key on a website is just an assertion — this page and the key it
links could have been swapped by an attacker who got to my host. Before
trusting the key above, confirm the key's fingerprint through a different channel (not this website): in person, by phone, or through someone
you already trust. If you trust me and your friend trusts you, me and your friend can talk using OpenPGP. This is known as 
[the web of trust](https://en.wikipedia.org/wiki/Web_of_trust). OpenPGP / GPG can automate / simplify growing a web of trust, but that's beyond the scope of this article. Wanna know more? Look up what it means to sign someone else's GPG public key with your own private key.


## PDFs

Finally, PDFs. PDF readers can show and verify cryptographic signatures ("digital signatures"), but they cannot natively use OpenPGP-compliant signatures. PDFs may be signed by a GPG key, but you'd need to verify it manually, because the PDF reader won't know what to do with it. PDF readers instead natively support a different cryptographic standard known as "X.509".

X.509 is both powerful and widespread. However, it is less flexible. While you may validate a GPG key from a new contact by 1.) confirming the fingerprint yourself or 2.) having a validated friend who has already validated the new contact, X.509 normally relies on a centralized trusted authority to vouch for somebody's identity, known as the "Certificate Authority". This is convenient, browsers come pre-loaded with so-called "root certificates" from centralized certificate authorities. This is how your computer can trust that the website you have open is actually from your bank. Some certificate authority is cryptographically vouching for them. As cool as this is, this system isn't really built to verify the identity of random people, and some would take issue with needing to trust a centralized certificate authority in the first place.

Instead, you may "mint" your own X.509 certificate that is only "self-signed". No certificate authority at all. This means that any PDF reader worth its salt will flag the signature as being unverified. However, you can manually confirm that the certificate truly belongs to me, and your PDF reader will correctly vet any future documents from me signed with the same certificate.

How do you verify that the certificate actually belongs to me, short of meeting me in person? Well, I'm glad you asked. Assuming that you already have confirmed my GPG key's fingerprint, marking the key as verified, I can use my GPG key to confirm the validity of my X.509 certificate just as I would any other document.

Hosted on this site I have a ["binding statement"](/binding.txt.asc). It's a file containing an identifier unique to my X.509 certificate, signed by my GPG key. Any GPG client that knows my GPG key can verify that the X.509 certificate could've only been signed by me, allowing you to be sure that any PDF signed by my X.509 certificate was really signed by me.
