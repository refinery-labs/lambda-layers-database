FROM node:12

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

# The "serve" mode will hot-reload components and watch for changes automatically.
ENTRYPOINT ["npm", "run"]
CMD ["serve"]

