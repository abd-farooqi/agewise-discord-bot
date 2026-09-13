# Agewise Discord Bot

## Local setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and set:

- `DISCORD_TOKEN`: your bot token
- `DISCORD_GUILD_ID`: the ID of the Discord server where the bot was invited

Start the bot:

```bash
npm run dev
```

The `/age` command is registered to the configured guild immediately. Use it like:

```text
/age date:15-08-2008
```

The bot calls the public Agewise API and does not contain calculator logic or secrets in source code.
