# Auth

A CLI tool for automating Auth0 config deployments, versioning changes, and minimising environment config drift. It should be used as a boilerplate where each new branch holds the environment-specific authentication configuration that can be duplicated and used to spin up new tenants.

It uses the [Auth0 Deploy CLI tool](https://github.com/auth0/auth0-deploy-cli). Documentation exists here on [Auth0's docs hub](https://auth0.com/docs/deploy-monitor/deploy-cli-tool).

Most important stuff will be extracted into the `tenant.yaml` file. This is the config that is deployed to the tenant. 

The `config.js` file is used in the setup script to construct the `config.json` file on the fly, which is used by the deploy tool to authenticate with the tenant and configure options. It is not tracked in git since it requires secrets.

---

# Setup

- Checkout to the branch for your chosen tenant
- `npm i`
- Get the env secrets
  - Log into [Auth0's management console](https://manage.auth0.com/)
  - Ensure you're in the appropriate tenant (top left dropdown)
  - In Applications > auth0-deploy-cli, copy down the domain, clientid and clientsecret
- Create & fill them in your `.env.[env-name]` file. Ensure this is `.gitignore`d

---

# Workflow

Most work starts on the `local` branch against the local tenant. I tend to make the changes in the Auth0 console itself, then when it's stable and tested and I want to flow that into other environments, I will follow this process:

- Run `npm run pull:local` on the `local` branch.
- Commit the changes. This tracks the changes in git and effectively acts as a save point that we can always revert back to.
- Checkout to the target environment branch (e.g. `dev`).
- Setup the required `.env.[env-name]` file and package.json scripts to point to the target environment.
- Run `npm run pull:[env-name]` on the new branch to ensure you have the latest deployed config and won't overwrite anything with your next push.
- Merge the changes from the `local` branch to the target environment branch - `git merge local`.
- Look through the `tenant.yaml` config file to ensure there is no confusing merge stuff going on.
- Push changes to the target environment - `npm run push:[env-name]`

Please be incredibly careful with all changes you intend to push from the repo up to Auth0. Always pull changes first. Note you can also make PR's between the branches to track their diffs and migrate changes between tenants in a safe way rather than local merging.

---

# Usage

The two flows are as follows:

### Pull changes

> Export changes made in Auth0's management console for the sake of version tracking or prepping duplication across tenants

- Ensure the `config.json` file has the appropriate secrets for the target tenant
- Run `npm run pull:[env-name]`
- Commit changes

### Push changes

> Import changes to Auth0 for use cases such as rolling out changes across different tenants, spinning up new tenants, or rolling back breaking changes.

This command can be destructive, please be careful. Note there is a flag in the `config.js` file set to dissallow deleting resources via the push functionality ("AUTH0_ALLOW_DELETE": false). If this is required, temporarily change the flag and revert it back to false after you are done to be safe. See the [docs](https://auth0.com/docs/deploy-monitor/deploy-cli-tool/import-export-tenant-configuration-to-directory-structure) for more details of advanced usage of this tool for excluding resources / keyword mappings.

- **Unless purposefully rolling back, first run the pull steps above** to ensure you do not overwrite intentional changes made in the Auth0 management console that were not version tracked.
- Make your changes to the configuration files
  - Note this could be done manually but if you are trying to duplicated changes in config from a different tenant, there should be a PR process to verify changes coming into this tenant
- Run `npm run push:[env-name]`
- Commit changes

---

# To create a new tenant

Checkout a new tenant branch and update the readme with the new tenant details. The branch you checkout from will form the bulk of the config you are deploying, so ensure you are starting from the most appropriate branch to save yourself some extra work.

Create your tenant in the [Auth0 management console](https://manage.auth0.com/), then follow [this guide](https://auth0.com/docs/deploy-monitor/deploy-cli-tool) to create an auth0 cli deploy application and call it `auth0-deploy-cli`. Configure it with access to the management API and all scopes.

After that, follow the above [Set Up](#set-up) steps to copy it's credentials into your local config file.

Next you need to set a few values for your new tenant in the `tenant.yaml` to cover your new use case. Under the applications, add new values for the following. Don't worry if you don't know these now, you can do it later in here or in the console (and then pull the changes in and commit).

- allowed_logout_urls
- callbacks
- web_origins

Before you can push up your new tenant config, there's a few things you need to do in the Auth0 console manually.

- Set up the email provider using the details in the tenant.yaml file and your mandrill api key.

You should now be able to run the `npm run push` command to deploy the configuration to your new tenant.

Finally, you'll need to fill in the env variables in a few places as these are not tracked in this configuration repository.

- Rules
- Database scripts
- Actions
- Google oAuth2 stuff (Authentication > Social > Google)

Test it out, it should all be working now.
