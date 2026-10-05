Pre-req:
- I am making 2 identical portfolio websites. one for Muhammad Ahmad and another for Abdullah Ahmad.
- there is a full functioning website for Muhammad Ahmad that is made and read at `local/site`. completely check it out.
- We need to develop for Abdullah Ahmad with new name, projects, experience, etc.
- We shall start simple and keep growing.
- also checkout `local/rev-proxy` on how it works.

Current task:
- completely craete new project with new name at `project/frontend`
- the site for Abdullah Ahmad will also have a backend `project/backend` that should remain empty for now. we shall develop as we reach there. but for now, it is static like Muhammad Ahmad
- completely setup this new project, rename from Muhammad Ahmad to Abdullah Ahmad
- and get it ready for deployment at devabdullah.com (earlier one was deployed at themacstack.com)
- also make a rev-proxy server at `project/rev-proxy` that serves everything at `/api/*` (with path rewrite) from backend (just add placeholder) and everything other than that from main site. 

let me know when it is ready. i shall guide you for server's deployment and ci-cd later on.

let me know when it is ready. and give me a short command i can use to start locally and check it (install deps thougy).

start now.

---

Pre-req:
- `local/llm-server` is a totally saperate project. checkout `local/llm-server/docs/deploy` in it in order to understand about linux server deployment with cloudfalred configuration as well as ci-cd in a project.
- you may also checkut server yourself that has `cf.md`, `serve.md` and `ci-cd.md` in it along with a `process-executor` server running
- checkout `local/process-executor` this is the process executor running on server.

Current task:
- in `./docs/deploy/`, create `linux-cloudflared.md` on how to deploye this project on a server with cloudfalred configuration using unit system services.
- and in same dir, create a `ci-cd.md` on ci-cd.

start now. let me know when both docs are ready and we can move foreward to deployment.

---

deploy completely now, just ask me when you need the github's read-only tokens for `devabdullah.com` repository.

the server already has a tunnel. you may need to use `-f` with tunnel route dns command if it does not works you may ask me as well.

also make sure configurations are also received in process-executor according to its procedure.

start now.

---

deleted the existing devabdullah.com A/AAAA/CNAME record. continue.

---

short qs: each commit updates devabdullah.com ? there is no dev.devabdullah.com ?

---

ok, do it like this:
- when i push with any commit, it deploys at dev.devabdullah.com. and i can also deploy using the `./server-control.bash` that uses `./.server-control.env` that has process executor url, token, project and wait seconds. (it shows a manu to dev deploy or prod deploy and asks for commit # then deploys)
- but if i commit with exact name of commit as `deploy` or use that bash command to deploy as prod, only then it should update at devabdullah.com directly
- also on server, there should be 2 running ports for 2 different websites, sysetm services, dns configuration in cloudflared as well as process-executor to update them accordingly.

let me know when done.

update here in docs also after updating in codeabse accordingly as well as in workflows and server.

---
