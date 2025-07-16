FROM nginx:alpine

# ゲームファイルをnginxのデフォルトディレクトリにコピー
COPY index.html /usr/share/nginx/html/
COPY game.js /usr/share/nginx/html/

# カスタムnginx設定をコピー
COPY nginx.conf /etc/nginx/nginx.conf

# ポート80を公開
EXPOSE 80

# nginxを起動
CMD ["nginx", "-g", "daemon off;"]