FROM node:12

RUN mkdir /work/
RUN mkdir /work/back-end
# It seems like it is safe to copy these files and then "mount" over them.
COPY ./package.json /work/back-end
COPY ./package-lock.json /work/back-end
WORKDIR /work/back-end

RUN npm install

COPY . /work/back-end

# The "serve" mode will watch for changes automatically.
ENTRYPOINT ["npm", "run"]
CMD ["serve"]

