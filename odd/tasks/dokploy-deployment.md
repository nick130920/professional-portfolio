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
- [ ] Commit and push the deployment work unit.
- Verification: 20 tests, production build, unprivileged Docker runtime, health endpoint, status-aware caching, two clean dependency audits, and independent approval.
- Commit evidence: pending.

### DEPLOY-002 — Provision Dokploy
- [ ] Create the `professional-portfolio` project and production environment.
- [ ] Create the application from the public Git repository and published branch.
- [ ] Deploy and verify application health through a temporary route or direct service check.
- Evidence: pending.

### DEPLOY-003 — Attach and verify the domain
- [ ] Associate `nicolasm.pro` with HTTPS in Dokploy.
- [ ] Confirm Cloudflare reaches Dokploy instead of the previous Railway fallback.
- [ ] Verify live content, metadata, contact links, and TLS.
- Evidence: pending.

## Acceptance Criteria
1. `https://nicolasm.pro` returns the verified portfolio with HTTP 200.
2. The deployment is reproducible from the Git repository and branch.
3. The application container is healthy and serves only the built static output.
4. Existing portfolio tests and production build remain green.
5. The final repository and deployment state are documented without secrets.

## Next Step
Commit and push the verified production container configuration, then provision Dokploy.
