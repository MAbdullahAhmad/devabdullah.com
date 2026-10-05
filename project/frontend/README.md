# devabdullah

Portfolio frontend for Abdullah Ahmad, prepared for `https://devabdullah.com`.

## Status

The working TheMacStack frontend architecture and design system have been cloned, but Muhammad Ahmed's personal résumé, projects, testimonials, portrait assets, and deployment automation were deliberately not attributed to Abdullah. The site starts with a clean Abdullah identity and is ready to grow as verified content is supplied. Search indexing remains opt-in through `SITE_INDEXABLE=true`.

## Local development

From the repository root, run `./project/dev.sh`, then open `http://127.0.0.1:4000`.

- Frontend: `127.0.0.1:3000`
- Backend placeholder: `127.0.0.1:4100`
- Reverse proxy: `127.0.0.1:4000`
- `/api/*` is routed to the backend with the `/api` prefix removed.
- All other requests are routed to the frontend.

## Content

Update `content/profile.ts` and `content/work/` when Abdullah's verified experience, projects, skills, social profiles, location, and availability are provided. The current email default is `hello@devabdullah.com`; configure SMTP and final contact addresses before enabling live forms.

## Deployment

The old TheMacStack deployment workflow was intentionally removed. Deployment and CI/CD for `devabdullah.com` will be configured separately when the server details are available.
