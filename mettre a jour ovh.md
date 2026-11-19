sudo -i
cd /srv/tbnk-website
sudo -u tbnkwebsite -H git pull
sudo -u tbnkwebsite -H npm ci
sudo -u tbnkwebsite -H npm run build
systemctl restart tbnk-website
systemctl status tbnk-website
exit