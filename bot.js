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
    if (existing) {
      console.log(`🔎 Salon retrouvé en cache : "${existing.name}" (ID: ${existing.id})`);
      return existing;
    }
  }
 
  const existingByPrefix = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildVoice && c.name.includes(SERVER_LABEL)
  );
  if (existingByPrefix) {
    statusChannelId = existingByPrefix.id;
    console.log(`🔎 Salon existant trouvé : "${existingByPrefix.name}" (ID: ${existingByPrefix.id})`);
    return existingByPrefix;
  }
 
  console.log("ℹ️  Aucun salon trouvé, création d'un nouveau salon vocal verrouillé...");
  try {
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
    console.log(`✅ Salon créé avec succès : "${channel.name}" (ID: ${channel.id})`);
    return channel;
  } catch (err) {
    console.error("❌ Impossible de créer le salon vocal :", err.message, `(code: ${err.code})`);
    throw err;
  }
}
 
// Renomme le salon en gérant proprement les erreurs de permissions Discord,
// pour ne jamais faire planter le process (sinon le bot crashe en boucle sous pm2)
async function safeRename(channel, newName) {
  if (channel.name === newName) {
    console.log("ℹ️  Aucun changement, pas de renommage (évite le rate limit).");
    return;
  }
 
  try {
    await channel.setName(newName);
    console.log(`✅ Salon mis à jour : ${newName}`);
  } catch (err) {
    if (err.code === 50001 || err.code === 50013) {
      console.error(
        "❌ Le bot n'a pas la permission de renommer ce salon (Missing Access / Missing Permissions).\n" +
          "   Vérifie que son rôle a bien 'Gérer les salons' au niveau du serveur ET du salon lui-même."
      );
    } else {
      console.error("❌ Erreur lors du renommage du salon :", err.message);
    }
  }
}
 
// Interroge le serveur CS 1.6 et renomme le salon
async function updateStatus() {
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.error("❌ Serveur Discord introuvable, vérifie GUILD_ID dans .env");
    return;
  }
  console.log(`🏠 Serveur détecté : "${guild.name}" (${guild.channels.cache.size} salons visibles par le bot)`);
 
  const channel = await getOrCreateStatusChannel(guild);
 
  // Diagnostic : ce que Discord calcule réellement comme permissions du bot sur CE salon
  const me = guild.members.me;
  if (me) {
    const perms = channel.permissionsFor(me);
    console.log(
      `🔐 Permissions calculées sur "${channel.name}" → ManageChannels: ${perms.has("ManageChannels")}, ViewChannel: ${perms.has("ViewChannel")}`
    );
  }
 
  try {
    const state = await Gamedig.query({
      type: "cs16",
      host: SERVER_IP,
      port: Number(SERVER_PORT),
      maxAttempts: 2,
    });
 
    const newName = `🟢 ${state.players.length}/${state.maxplayers} ${SERVER_LABEL}`;
    await safeRename(channel, newName);
  } catch (err) {
    console.error("⚠️  Impossible de contacter le serveur CS 1.6 :", err.message);
    const offlineName = `🔴 Hors ligne | ${SERVER_LABEL}`;
    await safeRename(channel, offlineName);
  }
}
 
client.once("clientReady", async () => {
  console.log(`🤖 Connecté en tant que ${client.user.tag}`);
  await updateStatus();
  setInterval(updateStatus, refreshMs);
});
 
// Filet de sécurité : si une erreur imprévue passe à travers, on la log
// au lieu de laisser Node.js tuer tout le process.
process.on("unhandledRejection", (err) => {
  console.error("⚠️  Erreur non gérée (le bot continue de tourner) :", err);
});
 
client.login(DISCORD_TOKEN);