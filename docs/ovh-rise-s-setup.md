# Hébergement TBNK-SMP sur OVHcloud Rise-S

**Guide complet** pour héberger le site Next.js et le serveur Minecraft Paper sur un serveur dédié OVHcloud Rise-S (Beauharnois, Québec).

**Attention** : le Rise-S est un serveur dédié, pas un VPS.

Comptes :
- `tbnkwebsite` : site Next.js
- `tbnkserver` : serveur Minecraft
- ton compte admin personnel (SSH/sudo), non détaillé ici

Dernière mise à jour : 14 novembre 2026.

## 0. Architecture

```text
Internet
  ├─ 80/443 → Caddy (TLS) → 127.0.0.1:3000 → Next.js (tbnkwebsite)
  └─ 25565/TCP → Paper Minecraft (tbnkserver)
```

- Le site n'est jamais exposé directement sur 3000.
- Caddy termine le HTTPS et ajoute les en-têtes X-Forwarded-*.
- TRUST_PROXY=true indique à Next.js de faire confiance au proxy.
- Minecraft utilise directement le port 25565/TCP, sans passer par Caddy.
- Les deux services tournent sous des comptes différents, sans login ni sudo.

## 1. Prérequis

- Rise-S : Ryzen 7 9700X (8c/16t), 64 Go DDR5, 2×512 Go NVMe, anti-DDoS, 99,9 % SLA.
- Ubuntu 24.04 LTS, accès root initial, clés SSH.
- Node.js 22 LTS (projet ≥ 20.9).
- Java 21 (Paper 1.21.x).
- Caddy (recommandé) ou Nginx + Certbot.
- Git, UFW, fail2ban, restic/Borg.
- Domaine tbnk-smp.com et accès DNS.
- Token public Tebex.
- Prix indicatif : environ 61 $ US/mois sans engagement (vérifier OVH Canada ; taxes en sus).

Hypothèses :
- Site : https://tbnk-smp.com
- Minecraft : play.tbnk-smp.com:25565
- Prix HT : NEXT_PUBLIC_PRICES_INCLUDE_TAXES=false
- Tebex vendeur/marchand of record ; NEXT_PUBLIC_LEGAL_* vide.

## 2. Comptes et permissions

Depuis ton compte admin :

```bash
sudo adduser --system --group --home /srv/tbnk-website --shell /usr/sbin/nologin tbnkwebsite
sudo adduser --system --group --home /srv/tbnk-server  --shell /usr/sbin/nologin tbnkserver
sudo mkdir -p /srv/tbnk-website /srv/tbnk-server
sudo chown -R tbnkwebsite:tbnkwebsite /srv/tbnk-website
sudo chown -R tbnkserver:tbnkserver   /srv/tbnk-server
sudo chmod 750 /srv/tbnk-website /srv/tbnk-server
```

Pourquoi deux comptes :
- tbnkwebsite ne peut pas lire le monde/plugins/sauvegardes de tbnkserver.
- tbnkserver ne peut pas lire .env.production (token Tebex, COOKIE_SECRET).
- Un plugin Minecraft compromis ne peut pas modifier le site ni voler ses secrets.
- Aucun des deux comptes n'a de login SSH ni de sudo.
- Tu administres avec ton compte personnel via sudo -u tbnkwebsite et sudo -u tbnkserver.

## 3. Base système

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl git ufw fail2ban
# Choisir UN reverse proxy :
sudo apt install -y caddy
# ou : sudo apt install -y nginx certbot python3-certbot-nginx

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs

# Java 21 pour Minecraft
sudo apt install -y openjdk-21-jre-headless

node -v
java -version
sudo timedatectl set-timezone America/Toronto
```

### Swap de sécurité

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

### SSH

- Utilise des clés SSH.
- Désactive le mot de passe et le login root après avoir vérifié que ta clé fonctionne :

```bash
sudo sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl reload ssh
```

## 4. DNS, ports et firewall

| Enregistrement | Valeur |
|---|---|
| A tbnk-smp.com | IPv4 du Rise-S |
| AAAA tbnk-smp.com | IPv6 si disponible |
| CNAME www | tbnk-smp.com |
| A play.tbnk-smp.com | IPv4 du Rise-S |
| SRV _minecraft._tcp.play | optionnel si port différent de 25565 |

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 25565/tcp
sudo ufw enable
sudo ufw status verbose
```

- Ne jamais ouvrir le port 3000.
- Si Proxmox : NAT 80/443 vers la VM web, 25565 vers la VM Minecraft ; 8006 restreint.
- Si Cloudflare : SSL Full (strict), et idéalement Authenticated Origin Pulls.

## 5. Reverse proxy : comprendre et configurer

### 5.1 C'est quoi ?

Un reverse proxy est un serveur qui reçoit les requêtes des visiteurs et les transmet à l'application interne. Ici :
- Caddy écoute sur 80/443 (public).
- Caddy termine le TLS (HTTPS).
- Caddy transmet à Next.js sur 127.0.0.1:3000.
- Next.js ne voit jamais Internet directement.

### 5.2 Pourquoi ?

- **TLS** : un seul endroit gère les certificats Let's Encrypt.
- **Sécurité** : le port 3000 reste fermé ; l'app n'est pas exposée.
- **En-têtes** : Caddy ajoute Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto.
- **Cookies** : les cookies Secure et __Host- fonctionnent correctement avec HTTPS.
- **Rate limiting** : Next.js peut voir la vraie IP si TRUST_PROXY=true.
- **HTTP/2 et HTTP/3** : Caddy les gère automatiquement.
- **Évolutivité** : plusieurs apps ou sous-domaines peuvent partager le proxy.
- **Défense** : limite la surface d'attaque, logs centralisés, contrôle des méthodes.

### 5.3 Les en-têtes importants

- Host : le domaine demandé.
- X-Real-IP : IP du client.
- X-Forwarded-For : chaîne des proxies.
- X-Forwarded-Proto : https.
- Sans ces en-têtes, Next.js croit être en HTTP et les cookies Secure ou __Host- peuvent échouer.

### 5.4 TRUST_PROXY

Le projet lit TRUST_PROXY=true pour faire confiance à X-Forwarded-For.
- Sur Vercel, VERCEL=1 active ce comportement automatiquement.
- Sur OVH derrière Caddy ou Nginx, mets TRUST_PROXY=true dans .env.production.
- Ne mets pas TRUST_PROXY=true si l'app est exposée directement sans proxy : un client pourrait falsifier son IP.

### 5.5 WebSocket

Next.js en production n'a pas besoin de WebSocket pour les pages normales. Caddy gère Upgrade automatiquement si un jour tu ajoutes du temps réel. Pas de configuration spéciale aujourd'hui.

### 5.6 Cloudflare et Proxmox

- Cloudflare devant Caddy : SSL Full (strict), TRUST_PROXY=true, et idéalement Authenticated Origin Pulls.
- Proxmox : Caddy dans la VM web ; l'hôte NAT 80/443 vers cette VM ; TRUST_PROXY=true.
- Ne mets pas deux proxies qui ajoutent des X-Forwarded-For sans contrôle.

### 5.7 Caddy ou Nginx ?

- Caddy : HTTPS automatique, config courte, recommandé.
- Nginx : très répandu, plus de réglages fins, Certbot pour TLS.

## 6. Site Next.js

### 6.1 Déployer

```bash
sudo -u tbnkwebsite -H git clone <repo> /srv/tbnk-website
cd /srv/tbnk-website
sudo -u tbnkwebsite -H npm ci
```

Créer /srv/tbnk-website/.env.production :

```env
APP_ENV=production
NODE_ENV=production
TEBEX_PUBLIC_TOKEN=ton_public_token
NEXT_PUBLIC_SITE_URL=https://tbnk-smp.com
COOKIE_SECRET=ta_valeur_de_32_caracteres_minimum
NEXT_PUBLIC_SUPPORT_EMAIL=tbnksmp@gmail.com
NEXT_PUBLIC_PRIVACY_EMAIL=tbnksmp@gmail.com
NEXT_PUBLIC_PRIVACY_OFFICER=Administrateur principal – TBNK-SMP
NEXT_PUBLIC_PRICES_INCLUDE_TAXES=false
TRUST_PROXY=true
```

```bash
sudo chown tbnkwebsite:tbnkwebsite /srv/tbnk-website/.env.production
sudo chmod 600 /srv/tbnk-website/.env.production
sudo -u tbnkwebsite -H npm run build
```

- Les NEXT_PUBLIC_* sont figées au build : rebuild après changement.
- TEBEX_PUBLIC_TOKEN est un token public, mais ne le commit pas.
- Ne mets jamais le private key Tebex sur le serveur.

### 6.2 Service systemd

/etc/systemd/system/tbnk-website.service :

```ini
[Unit]
Description=TBNK-SMP website (Next.js)
After=network.target

[Service]
Type=simple
User=tbnkwebsite
Group=tbnkwebsite
WorkingDirectory=/srv/tbnk-website
EnvironmentFile=/srv/tbnk-website/.env.production
Environment=PORT=3000
ExecStart=/usr/bin/npm run start -- -H 127.0.0.1 -p 3000
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/tbnk-website
InaccessiblePaths=/srv/tbnk-server
MemoryMax=4G
CPUQuota=200%
UMask=0027

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now tbnk-website
sudo systemctl status tbnk-website
sudo journalctl -u tbnk-website -f
```

### 6.3 Caddy

/etc/caddy/Caddyfile :

```caddy
tbnk-smp.com, www.tbnk-smp.com {
  reverse_proxy 127.0.0.1:3000
  encode gzip zstd
}
```

```bash
sudo systemctl reload caddy
```

Caddy obtient le certificat et redirige HTTP vers HTTPS.

### 6.4 Nginx (alternative)

/etc/nginx/sites-available/tbnk-smp :

```nginx
server {
  listen 80;
  server_name tbnk-smp.com www.tbnk-smp.com;
  return 301 https://tbnk-smp.com$request_uri;
}
server {
  listen 443 ssl http2;
  server_name tbnk-smp.com;
  # ssl_certificate et ssl_certificate_key ajoutés par Certbot
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 60s;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/tbnk-smp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d tbnk-smp.com -d www.tbnk-smp.com
```

### 6.5 Tester

```bash
curl -I https://tbnk-smp.com
curl -s http://127.0.0.1:3000 | head
sudo systemctl status tbnk-website
sudo journalctl -u tbnk-website -n 50
```

Vérifier : accueil, boutique, package, panier, checkout Tebex, pages légales, 404, mobile, cookies.

## 7. Serveur Minecraft Paper

### 7.1 Installer

```bash
sudo -u tbnkserver -H mkdir -p /srv/tbnk-server
cd /srv/tbnk-server
# Télécharger Paper 1.21.x depuis papermc.io dans /srv/tbnk-server
sudo -u tbnkserver -H java -Xms12G -Xmx12G -jar paper.jar --nogui
```

- Accepter l'EULA (eula=true).
- Java 21 obligatoire pour 1.21.x.
- Installer le plugin Tebex et configurer la clé secrète.

server.properties :

```properties
online-mode=true
server-port=25565
view-distance=8
simulation-distance=6
max-players=30
white-list=true
enforce-whitelist=true
enable-rcon=true
rcon.port=25575
rcon.password=change-me
```

- RCON doit rester local (UFW ne doit pas ouvrir 25575) et le mot de passe doit être changé.
- Les flags Aikar sont dans le service systemd ci-dessous.

### 7.2 Service systemd

/etc/systemd/system/tbnk-server.service :

```ini
[Unit]
Description=TBNK-SMP Minecraft Paper
After=network.target

[Service]
Type=simple
User=tbnkserver
Group=tbnkserver
WorkingDirectory=/srv/tbnk-server
ExecStart=/usr/bin/java -Xms12G -Xmx12G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -jar paper.jar --nogui
Restart=always
RestartSec=10
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/tbnk-server
InaccessiblePaths=/srv/tbnk-website
MemoryMax=16G
CPUQuota=500%
UMask=0027

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now tbnk-server
sudo systemctl status tbnk-server
sudo journalctl -u tbnk-server -f
```

### 7.3 Ports

- 25565/TCP ouvert dans UFW.
- Pas de proxy HTTP pour Minecraft.
- Si Bedrock un jour : 19132/UDP (non configuré ici).
- play.tbnk-smp.com pointe vers l'IP du serveur.

## 8. Ressources et cgroups

| Service | vCPU | RAM | Limite systemd |
|---|---:|---:|---|
| Site | 2 | 2 à 4 Go | MemoryMax=4G, CPUQuota=200% |
| Minecraft | 4 à 6 | 12 à 16 Go | MemoryMax=16G, CPUQuota=500% |
| OS et marge | 2 | 6 à 8 Go | non limité |
| Total | 8 | 24 à 28 Go | marge sur 64 Go |

- Ne donne pas 64 Go à la JVM.
- Le -Xmx doit rester inférieur à MemoryMax, avec une marge.
- Surveille avec systemd-cgtop, htop, free -h, df -h.
- Swap 4 Go en sécurité ; éviter le thrashing.
- Si OOM : réduire -Xmx, view distance, plugins, ou ajouter de la RAM.

## 9. Sauvegardes

- **Site** : .env.production, config Caddy ou Nginx, unit systemd ; le code est dans Git.
- **Minecraft** : world/, plugins/, server.properties, whitelist.json, ops.json.
- **Méthode** : restic ou Borg vers OVH Object Storage ou un autre stockage, chiffré, hors machine.
- **Cohérence Minecraft** : save-off, save-all, copie, save-on ; ou arrêt court.
- **Test** : restaurer une sauvegarde au moins une fois.
- **RAID n'est pas un backup** : le Soft RAID protège d'une panne disque, pas d'une suppression ou d'un ransomware.

## 10. Monitoring et logs

- UptimeRobot ou Better Stack sur https://tbnk-smp.com.
- Monitoring OVHcloud.
- systemd-cgtop, htop, free -h, df -h.
- journalctl -u tbnk-website et journalctl -u tbnk-server.
- TPS Minecraft : /spark tps ; profiler si lag.
- Alertes RAM, disque, CPU.

## 11. Mises à jour

### Site

```bash
cd /srv/tbnk-website
sudo -u tbnkwebsite -H git pull
sudo -u tbnkwebsite -H npm ci
sudo -u tbnkwebsite -H npm run build
sudo systemctl restart tbnk-website
```

- Bref downtime pendant le restart.
- Si les NEXT_PUBLIC_* changent, rebuild obligatoire.
- Fais les mises à jour hors pointe de trafic.

### Minecraft

1. Sauvegarde complète.
2. sudo systemctl stop tbnk-server.
3. Remplacer paper.jar et mettre à jour les plugins.
4. sudo systemctl start tbnk-server.
5. Tester la connexion et les achats Tebex.

### Système

```bash
sudo apt update
sudo apt upgrade -y
sudo reboot
```

- Planifie le reboot.
- Vérifie les services après reboot.

## 12. Sécurité

- SSH par clé, PermitRootLogin no, PasswordAuthentication no.
- fail2ban et UFW activés.
- Comptes de service sans login et sans sudo.
- .env.production en 600, propriétaire tbnkwebsite.
- Port 3000 fermé ; seul Caddy ou Nginx expose 80/443.
- Plugins Minecraft de confiance uniquement ; online-mode=true ; whitelist.
- Sauvegardes chiffrées et hors machine.
- Anti-DDoS OVH ; Cloudflare optionnel en Full (strict).
- Mises à jour OS, Node, Paper et plugins.
- Ne jamais mettre le private key Tebex sur le serveur.
- Restreindre l'accès à Proxmox (8006) si utilisé.

## 13. Légal et confidentialité

- Mettre à jour lib/legal/privacy.ts : remplacer Vercel par OVHcloud, hébergement et journaux techniques (Beauharnois, Québec, Canada).
- Mettre à jour la date de la politique de confidentialité.
- EFVP : l'hébergement reste au Québec ; Tebex (Royaume-Uni), Discord (États-Unis), YouTube/Google et mc-heads (avatars proxifiés côté serveur) restent des transferts à documenter.
- OVHcloud agit comme sous-traitant : conserver le contrat/DPA.
- Conserver les conditions Tebex, le registre des incidents et les preuves de sauvegarde.
- Mettre à jour README.md et docs/legal/checklist-quebec.md pour refléter OVHcloud.
- Les champs NEXT_PUBLIC_LEGAL_* restent facultatifs : Tebex est le vendeur.

## 14. Dépannage

| Problème | Vérifier |
|---|---|
| 502 Bad Gateway | systemctl status tbnk-website, curl 127.0.0.1:3000, logs Caddy |
| Build échoue | Node 22, mémoire, .env.production, polices Google |
| Cookies ou panier | TRUST_PROXY=true, HTTPS, COOKIE_SECRET, domaine |
| Minecraft inaccessible | systemctl status tbnk-server, ss -lntp, UFW 25565, DNS |
| OOM | journalctl, MemoryMax, -Xmx, view distance |
| Permissions | chown, chmod, utilisateur systemd |
| TLS | DNS, ports 80/443, logs Caddy ou Certbot |
| Plugin Tebex | clé secrète, version, logs, connectivité sortante |
| Site lent | CPU/RAM, cache Next, images, logs Caddy |

## 15. Checklists

### Installation

- [ ] Rise-S BHS, Ubuntu 24.04, SSH par clé.
- [ ] tbnkwebsite et tbnkserver créés, permissions 750.
- [ ] Node 22, Java 21, Caddy ou Nginx, UFW, fail2ban.
- [ ] DNS A/AAAA/CNAME/play.
- [ ] Site buildé, .env.production en 600, service actif.
- [ ] Caddy HTTPS, TRUST_PROXY=true.
- [ ] Paper et plugin Tebex, port 25565.
- [ ] Backups et monitoring.
- [ ] Politique OVHcloud mise à jour.

### Go-live

- [ ] Achat test livré.
- [ ] Pages légales et footer Tebex.
- [ ] 404, sitemap, robots, mobile.
- [ ] Redémarrage serveur testé.
- [ ] Restauration backup testée.
- [ ] Payout Tebex configuré.

### Mensuel

- [ ] Mises à jour OS, Node, Paper, plugins.
- [ ] Vérifier backups et espace disque.
- [ ] Vérifier payouts Tebex et registre des incidents.
- [ ] Mettre à jour la date légale si changement.

## 16. Sources

- OVHcloud Rise-S : https://eco.ovhcloud.com/en/rise/rise-s/
- OVHcloud VPS Canada : https://www.ovhcloud.com/en/vps/vps-canada/
- Next.js self-hosting : https://nextjs.org/docs/app/getting-started/deploying
- Paper : https://papermc.io
- Caddy : https://caddyserver.com
- Certbot : https://certbot.eff.org
- restic : https://restic.net
- UptimeRobot : https://uptimerobot.com
- Revenu Québec : https://www.revenuquebec.ca
- ARC : https://www.canada.ca/en/revenue-agency.html