# 🎯 CS16 Status Bot

Bot Discord qui affiche en temps réel le nombre de joueurs connectés sur un serveur **Counter-Strike 1.6**, directement dans le nom d'un salon vocal verrouillé de ton serveur Discord.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🧩 À quoi sert ce bot ?

Tu gères un serveur Counter-Strike 1.6 et tu veux que ta communauté Discord voie en un coup d'œil combien de joueurs sont connectés — sans quitter Discord ni ouvrir le jeu ?

Ce bot fait exactement ça : il interroge ton serveur CS 1.6 à intervalle régulier et affiche le résultat directement dans le nom d'un salon, par exemple :

```
🟢 4/32 pGv Team
```

Si le serveur est hors ligne, le salon se met à jour automatiquement pour l'indiquer :

```
🔴 Hors ligne | pGv Team
```

Aucune commande à taper, aucune interaction requise — une fois configuré, il tourne tout seul.

## ✨ Fonctionnalités

- 📡 Interrogation du serveur CS 1.6 via le protocole GoldSrc (librairie [`gamedig`](https://www.npmjs.com/package/gamedig))
- 🔒 Salon vocal automatiquement créé et verrouillé (personne ne peut s'y connecter, il sert juste d'affichage)
- 🔄 Rafraîchissement automatique, intervalle configurable
- 🟢 / 🔴 Indicateur visuel en ligne / hors ligne
- ⚙️ Configuration entière via un simple fichier `.env`, sans toucher au code

## 🚀 Installation rapide

Prérequis : [Node.js](https://nodejs.org) 18 ou plus.

```bash
git clone https://github.com/oufmilo/cs16-discord-bot
cd cs16-discord-bot
npm install
cp .env.example .env
```

Remplis ensuite le fichier `.env` avec ton token Discord, l'ID de ton serveur et l'IP de ton serveur CS 1.6, puis lance :

```bash
npm start
```

👉 Le guide détaillé pas-à-pas (créer l'application Discord, récupérer le token, inviter le bot) est disponible dans [`INSTALLATION.md`](./INSTALLATION.md).

## 🛠️ Stack technique

| Élément                                          | Rôle                                          |
| ------------------------------------------------ | --------------------------------------------- |
| [discord.js](https://discord.js.org/) v14        | Communication avec l'API Discord              |
| [gamedig](https://www.npmjs.com/package/gamedig) | Requête du serveur CS 1.6 (protocole GoldSrc) |
| dotenv                                           | Gestion de la configuration via `.env`        |

## ⚠️ À savoir

Discord limite le renommage d'un salon à **2 fois par tranche de 10 minutes**. L'intervalle de rafraîchissement par défaut (6 min) respecte cette limite — ne descends pas en dessous de 5 minutes dans la configuration.

## 📄 Licence

MIT — libre à toi de l'utiliser, le modifier et le redistribuer.
