# Usa la imagen oficial de Node.js 20-t 
FROM node:20.17.0

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias
RUN npm install --production

# Copia el resto de los archivos del proyecto
COPY . .

# Compila la aplicación (si es necesario, por ejemplo, si usas TypeScript)
# RUN npm run build

# Expone el puerto en el que corre la API (por defecto 3000, pero cámbialo si es diferente)
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD [ "npm", "start" ]
