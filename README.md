# Agewise Discord Bot

## Local setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and set:

- `DISCORD_TOKEN`: your bot token

Start the bot:

```bash
npm run dev
```

The `/age` command is registered globally. Discord can take up to an hour to propagate it to every server. Use it like:

```text
/age date:DD-MM-YYYY
```

The bot calls the public Agewise API and does not contain calculator logic or secrets in source code.
