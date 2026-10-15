# gpg

If you want to send me something only I can read — or check that
something I sent really came from me — GPG is the way to do it.

GPG (GNU Privacy Guard) implements the OpenPGP format. It encrypts
things so only the matching private key can read them, and signs things
so anyone with the public key can verify who made them.

## my key

- **fingerprint:** `F883 57E6 08CC 0BAB 7497 4AC2 0429 0A70 49DC 7EC7`
- **email:** `b@burke.md`
- **key:** ed25519 (sign) + cv25519 (encrypt), expires 2028-10-13
- **public key:** [gpg.asc](/gpg.asc) — `gpg --import gpg.asc`

## sending me something private

Encrypt a file to my address, then attach the result to an email to `b@burke.md`:

```
gpg --encrypt --recipient b@burke.md secret.txt
```

Only my private key can read `secret.txt.gpg`.

## verifying something I sent

Anything I sign — an email, a document — can be checked:

```
gpg --verify signature.gpg document
```

A *good signature* from the key above means I made it and it hasn't been
modified since.

One wrinkle: PDFs. I sign PDFs with a self-signed X.509 certificate
instead, because most PDF readers don't understand OpenPGP. The
[binding statement](/binding.txt.asc) on this site is signed with the
key above and ties that certificate to this identity.

## before you trust any of this

A key on a website is just an assertion — this page and the key it
links could have been swapped by an attacker who got to my host. Before
trusting the key above, confirm the fingerprint through a channel that
doesn't run through this site: in person, by phone, or through someone
you already trust. That's the whole game in the OpenPGP
[web of trust](https://en.wikipedia.org/wiki/Web_of_trust) — a key is
only as good as how you got it.
