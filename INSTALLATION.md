# Bot Discord - Statut serveur CS 1.6

Affiche en temps réel le nombre de joueurs connectés sur ton serveur Counter-Strike 1.6, sous forme de salon vocal verrouillé (ex: `🟢 4/32 pGv Team`).

## 1. Créer l'application Discord

1. Va sur https://discord.com/developers/applications
2. **New Application** → donne-lui un nom (ex: `CS16 Status`)
3. Onglet **Bot** (menu de gauche) → **Reset Token** → copie le token (tu ne le reverras plus après)
4. Toujours dans l'onglet Bot, laisse les "Privileged Gateway Intents" désactivés, tu n'en as pas besoin
5. Onglet **OAuth2 > URL Generator** :
   - Scopes : coche `bot`
   - Bot Permissions : coche `Manage Channels` et `Connect`
   - Copie l'URL générée en bas, ouvre-la dans ton navigateur et invite le bot sur ton serveur

## 2. Récupérer l'ID de ton serveur Discord

1. Dans Discord, va dans **Paramètres utilisateur > Avancés** et active le **Mode développeur**
2. Clic droit sur le nom de ton serveur Discord (en haut à gauche) → **Copier l'identifiant du serveur**

## 3. Installer le projet

Il te faut [Node.js](https://nodejs.org) (version 18 ou plus) installé sur ta machine.

Dans VS Code, ouvre un terminal dans ce dossier et lance :

```bash
npm install
```

## 4. Configurer

1. Copie `.env.example` en `.env`
2. Remplis les valeurs :
   - `DISCORD_TOKEN` : le token copié à l'étape 1
   - `GUILD_ID` : l'ID copié à l'étape 2
   - `SERVER_IP` et `SERVER_PORT` : l'adresse de ton serveur CS 1.6
   - `SERVER_LABEL` : le nom à afficher (ex: `pGv Team`)

## 5. Lancer le bot

```bash
npm start
```

Le bot va automatiquement créer un salon vocal verrouillé et le mettre à jour toutes les 6 minutes (modifiable via `REFRESH_MINUTES` dans `.env`).

⚠️ **Important** : Discord limite le renommage d'un salon à 2 fois par 10 minutes. Ne descends pas `REFRESH_MINUTES` en dessous de 5, sinon Discord bloquera les requêtes.
