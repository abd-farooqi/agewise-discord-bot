import "dotenv/config";
import {
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const apiUrl =
  process.env.AGEWISE_API_URL ?? "https://agewise1.netlify.app/api/age";

if (!token || !clientId) {
  throw new Error("DISCORD_TOKEN and DISCORD_CLIENT_ID are required");
}

const command = new SlashCommandBuilder()
  .setName("age")
  .setDescription("Calculate an exact age")
  .addStringOption((option) =>
    option
      .setName("date")
      .setDescription(
        "Date of birth in DD-MM-YYYY format, for example 01-01-2001",
      )
      .setRequired(true),
  );

const rest = new REST({ version: "10" }).setToken(token);
await rest.put(Routes.applicationCommands(clientId), {
  body: [command.toJSON()],
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("clientReady", (readyClient) => {
  console.log(`Agewise bot online as ${readyClient.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "age")
    return;

  const input = interaction.options.getString("date", true).trim();
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(input);

  if (!match) {
    await interaction.reply({
      content: "Use `DD-MM-YYYY`, for example `15-08-2008`.",
      ephemeral: true,
    });
    return;
  }

  const [, day, month, year] = match;
  const dob = `${year}-${month}-${day}`;
  await interaction.deferReply();

  try {
    const response = await fetch(`${apiUrl}?dob=${dob}`);
    const result = (await response.json()) as {
      years?: number;
      months?: number;
      days?: number;
      hours?: number;
      minutes?: number;
      seconds?: number;
      totalMs?: number;
      error?: string;
    };

    if (!response.ok || result.error) {
      await interaction.editReply("That is not a valid date of birth.");
      return;
    }

    const totalDays = Math.floor((result.totalMs ?? 0) / 86400000);
    const embed = new EmbedBuilder()
      .setColor(0xffffff)
      .setTitle("Agewise Result")
      .setDescription(`Born on **${input}**`)
      .addFields(
        {
          name: "Exact age",
          value: `**${result.years}y ${result.months}m ${result.days}d**`,
          inline: true,
        },
        {
          name: "Time today",
          value: `${result.hours}h ${result.minutes}m ${result.seconds}s`,
          inline: true,
        },
        { name: "Total days", value: totalDays.toLocaleString(), inline: true },
      )
      .setFooter({ text: "Calculated by Agewise" });

    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply(
      "Agewise is temporarily unavailable. Please try again shortly.",
    );
  }
});

await client.login(token);
