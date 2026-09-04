# Handover

**Who this is for:** the person who has to run this system when nobody who
built it is available. That might be Aquavape's own developer, a replacement
contractor, or Aquavape themselves on a bad Tuesday.

**Why it exists from day one rather than the last week:** a handover you have
to *perform* is one that can be forgotten, rushed, or quietly held as
leverage. A handover that is structural is just how the project is set up.
Aquavape is leaving Shopify because a platform could switch it off; handing
back a system only one person can operate would sell the same problem in a
different shirt.

This file is kept current as the build proceeds. If it is stale, that is a
defect, not an oversight.

---

## Current status — read this first

**Nothing in this repository is production, and this repository is not the
deliverable.**

| | Today | Where it needs to be |
|---|---|---|
| Owner | `yameenbux` personal GitHub account | An `aquavape` GitHub organisation Aquavape owns |
| Visibility | **Public** | Private, inside that org |
| Hosting | GitHub Pages on a personal account | Aquavape's own cloud accounts |
| Contains | A storefront prototype and a migration spike | Production code, infrastructure, runbooks |

What is here is a **pitch asset**: a rebuilt storefront running on the real
catalogue, plus the phase 01 spike that proved the catalogue imports. It is
public deliberately, so it can be opened on a phone without an invite.

Two consequences worth being explicit about:

- It carries Aquavape's real logo and product imagery. That is fine for a
  prototype shown to Aquavape, with a note to that effect in `index.html`.
  It needs Aquavape's written agreement before it stays public, or in a
  portfolio, beyond the pitch.
- **Production starts clean.** The storefront code is *copied* into the new
  repositories in Aquavape's organisation. This repository is not transferred,
  because a marketing prototype and a live shop should not share a history or
  a lifecycle.

---

## The four things being handed over

Handing over the code is roughly a quarter of it. The failures that actually
hurt are never the repository.

| | What | Rule |
|---|---|---|
| **Code** | Repositories, history, CI configuration | Created inside Aquavape's GitHub organisation from the first commit |
| **Infrastructure** | Cloud accounts, DNS, domain registrar, TLS, object storage | Opened **in the company's name, on the company's payment method** |
| **Data** | Database, product media, a *proven* restore | Aquavape's storage; restore rehearsed, not assumed |
| **Knowledge** | This file, runbooks, decision records, credential inventory | In the repository, not in anyone's head |

### The two rules that matter more than the rest

**1. Accounts are opened by Aquavape, not by YSBDesigns.**

Every cloud provider, registrar and third-party service is registered to a
company email address and billed to a company card. YSBDesigns is added as a
delegated user or team member. It is never the account holder.

This is the most common way a small-business handover fails: production turns
out to run on the contractor's personal account, and the only way to move it
is to rebuild it. Reimbursed invoices do not fix this — the account holder is
whoever the provider thinks it is.

**2. DNS is Aquavape's, always.**

Whoever controls the registrar controls the business. The domain and its DNS
stay in an Aquavape-owned registrar account with YSBDesigns holding delegated
access. This one is not negotiable at any point in the project, including
during cutover.

### Use role addresses, not personal ones

Accounts register to something like `dev@aquavape.co.uk`, not to an
individual's inbox. People leave; the shop does not. A domain that renews to
a personal Gmail nobody still reads is a slow-motion outage.

---

## Account inventory

Filled in as accounts are created. Every row names a human who can log in
without asking anyone.

| Service | Purpose | Account holder | YSBDesigns access | Billing | Renews |
|---|---|---|---|---|---|
| Domain registrar | `aquavape.co.uk` | *TBC — Aquavape* | Delegated user | Company card | |
| DNS / CDN | DNS, TLS, edge cache | *TBC — Aquavape* | Member | Company card | |
| Cloud provider | App, database, search | *TBC — Aquavape* | Team member | Company card | |
| Object storage | Product media | *TBC — Aquavape* | Team member | Company card | |
| GitHub org | Source code, CI | *TBC — Aquavape* | Owner | Company card | |
| Error tracking | Monitoring, alerts | *TBC — Aquavape* | Member | Company card | |
| Payment gateway | Card processing | **Aquavape only** | None — see below | | |
| Email / transactional | Order confirmations | *TBC — Aquavape* | Member | Company card | |

**YSBDesigns holds no access to the payment gateway's live keys.** That is
deliberate and it is what keeps card data out of PCI scope for infrastructure
we run. See the PCI note in the migration proposal.

### Secrets

Credentials live in a password manager **the business owns** — a 1Password or
Bitwarden business vault registered to Aquavape, with YSBDesigns as a member.

Not in `.env` files sent over Slack or email. Not in the repository. Not in a
personal vault. When access is revoked, it is revoked in one place and the
credentials are still there.

---

## Runbooks

Written as the systems they describe are built. Each one is verified by
someone following it, not by the person who wrote it.

- [ ] **Deploy** — how a change gets from a merged pull request to production
- [ ] **Roll back** — how to return to the previous release, and how long it takes
- [ ] **Restore** — how to recover the database to a point in time, with the last rehearsal date
- [ ] **Rotate a secret** — API keys, database credentials, gateway keys
- [ ] **Scale up** — what to do before a promotion or a Black Friday
- [ ] **It's 3am and orders have stopped** — first checks, in order, and who to call
- [ ] **Renewals calendar** — what expires when, and who gets the reminder

The 3am runbook is the one people skip and the one that gets read.

---

## The bus test

**Run at the phase 01 gate, not at the end.**

Hand this file and the runbooks to a competent developer who has never seen
the project. Without help, they should be able to:

1. Get access to everything using only what is written here
2. Deploy a trivial change to staging
3. Break it, and roll it back
4. Restore the database from a backup

If they cannot, there is no handover — there is a dependency nobody chose.

Doing this at the phase 01 gate means it gets fixed cheaply, inside work
already being paid for. Doing it at the end means fixing it for free, after
the final invoice, under time pressure.

Record the date, who ran it, and what it found. A test with no written
outcome did not happen.

| Date | Run by | Outcome |
|---|---|---|
| | | |

---

## Exit

The migration proposal commits to 30 days' notice, no exit fee, no handover
charge. What that means in practice, on the last day:

1. Aquavape removes YSBDesigns from every account in the inventory above.
2. Nothing moves. No repository transfers, no data export, no DNS change —
   because everything was already theirs.
3. This file plus the runbooks is the handover document. There is no second,
   better version held back.

If step 2 requires anything to be moved, the setup was wrong and it should
have been caught by the bus test.
