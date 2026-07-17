require("dotenv").config();
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require("discord.js");
const Gamedig = require("gamedig");

const {
  DISCORD_TOKEN,
  GUILD_ID,
  SERVER_IP,
  SERVER_PORT,
  SERVER_LABEL,
  REFRESH_MINUTES,
} = process.env;

// Vérification que toutes les variables sont bien renseignées
const required = { DISCORD_TOKEN, GUILD_ID, SERVER_IP, SERVER_PORT, SERVER_LABEL };
for (const [key, value] of Object.entries(required)) {
  if (!value) {
    console.error(`❌ Variable manquante dans .env : ${key}`);
    process.exit(1);
  }
}

const refreshMs = Math.max(Number(REFRESH_MINUTES) || 6, 5) * 60 * 1000; // 5 min mini pour respecter le rate limit Discord

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

let statusChannelId = null;

// Cherche un salon existant nommé d'après SERVER_LABEL, sinon le crée
async function getOrCreateStatusChannel(guild) {
  if (statusChannelId) {
    const existing = guild.channels.cache.get(statusChannelId);
    if (existing) return existing;
  }

  const existingByPrefix = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildVoice && c.name.includes(SERVER_LABEL)
  );
  if (existingByPrefix) {
    statusChannelId = existingByPrefix.id;
    return existingByPrefix;
  }

  console.log("ℹ️  Aucun salon trouvé, création d'un nouveau salon vocal verrouillé...");
  const channel = await guild.channels.create({
    name: `⏳ Chargement... | ${SERVER_LABEL}`,
    type: ChannelType.GuildVoice,
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionsBitField.Flags.Connect], // verrouillé, personne ne peut s'y connecter
      },
    ],
  });

  statusChannelId = channel.id;
  return channel;
}

// Interroge le serveur CS 1.6 et renomme le salon
async function updateStatus() {
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.error("❌ Serveur Discord introuvable, vérifie GUILD_ID dans .env");
    return;
  }

  const channel = await getOrCreateStatusChannel(guild);

  try {
    const state = await Gamedig.query({
      type: "cs16",
      host: SERVER_IP,
      port: Number(SERVER_PORT),
      maxAttempts: 2,
    });

    const newName = `🟢 ${state.players.length}/${state.maxplayers} ${SERVER_LABEL}`;

    if (channel.name !== newName) {
      await channel.setName(newName);
      console.log(`✅ Salon mis à jour : ${newName}`);
    } else {
      console.log("ℹ️  Aucun changement, pas de renommage (évite le rate limit).");
    }
  } catch (err) {
    const offlineName = `🔴 Hors ligne | ${SERVER_LABEL}`;
    if (channel.name !== offlineName) {
      await channel.setName(offlineName);
    }
    console.error("⚠️  Impossible de contacter le serveur CS 1.6 :", err.message);
  }
}

client.once("clientReady", async () => {
  console.log(`🤖 Connecté en tant que ${client.user.tag}`);
  await updateStatus();
  setInterval(updateStatus, refreshMs);
});

client.login(DISCORD_TOKEN);
