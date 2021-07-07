FROM node:12 as BaseBuild

RUN mkdir /work/
RUN mkdir /work/front-end
# It seems like it is safe to copy these files and then "mount" over them.
COPY ./package.json /work/front-end
COPY ./package-lock.json /work/front-end
WORKDIR /work/front-end

# This is used by the production build script
RUN mkdir /work/output

RUN npm install

COPY . /work/front-end

FROM BaseBuild as RunDevelopment

# The "serve" mode will hot-reload components and watch for changes automatically.
ENTRYPOINT ["npm", "run"]
CMD ["serve"]

FROM BaseBuild as BuildProduction

# Runs the build for the assets
RUN npm run ssr:build

# Starts the server
ENTRYPOINT ["npm", "run"]
CMD ["ssr:start"]
