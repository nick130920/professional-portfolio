# Dokploy Portfolio Deployment

## Objective
Publish the verified professional portfolio from `feat/professional-portfolio` on the local Dokploy VPS at `https://nicolasm.pro`.

## Constraints
- Preserve the existing portfolio behavior and CV facts.
- Use a reproducible repository-owned production configuration.
- Build static assets with Node and serve them through an unprivileged web server container.
- Replace the current Railway destination only after the Dokploy service is healthy.
- Do not expose Dokploy credentials or internal secrets.

## Tasks

### DEPLOY-001 — Package the static portfolio
- [x] Add a multi-stage production container build and web-server configuration.
- [x] Verify the container locally, including SPA/static routes, headers, and health.
- [x] Commit and push the deployment work unit.
- Verification: 20 tests, production build, unprivileged Docker runtime, health endpoint, status-aware caching, two clean dependency audits, and independent approval.
- Commit evidence: `5627a1c` (`build: package portfolio for Dokploy`).

### DEPLOY-002 — Provision Dokploy
- [x] Create the `professional-portfolio` project and production environment.
- [x] Create the application from the public Git repository and published branch.
- [x] Deploy and verify application health through a temporary route or direct service check.
- Evidence: application `portfolio` deploys branch `feat/professional-portfolio`; Dokploy recorded commit `5627a1cd07faf3f21df2903d487c82b1f0f371e0`; Swarm service `professional-portfolio-w5kadb` reached `1/1`; its container reported `healthy`; `/health` returned `ok`; and the root document contained the expected title, identity, and canonical URL.

### DEPLOY-003 — Attach and verify the domain
- [x] Associate `nicolasm.pro` with HTTPS in Dokploy.
- [x] Confirm public DNS reaches Dokploy instead of the previous Railway fallback.
- [x] Verify live content, metadata, contact links, and TLS.
- Evidence: public DNS resolves `nicolasm.pro` to `169.58.169.86`; HTTP redirects to HTTPS; trusted HTTPS returns HTTP 200; `/health` returns `ok`; the Let's Encrypt certificate verifies successfully for `nicolasm.pro`; Railway headers are absent; title, canonical, Open Graph/Twitter metadata, and all five contact targets are present; and the current hashed JavaScript asset returns HTTP 200 with the expected MIME type and immutable cache policy.

## Acceptance Criteria
1. `https://nicolasm.pro` returns the verified portfolio with HTTP 200.
2. The deployment is reproducible from the Git repository and branch.
3. The application container is healthy and serves only the built static output.
4. Existing portfolio tests and production build remain green.
5. The final repository and deployment state are documented without secrets.

## Next Step
Revoke the temporary Dokploy API key and, if desired, authorize committing the final deployment evidence update.
