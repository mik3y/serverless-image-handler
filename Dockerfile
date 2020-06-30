FROM lambci/lambda:build-nodejs12.x

VOLUME ["/dist"]

RUN npm install -g yarn
ADD package.json yarn.lock ./
RUN yarn install --pure-lockfile --prod

ADD . ./

RUN zip -9yr lambda.zip ./

CMD mkdir -p /dist && cp lambda.zip /dist/serverless-image-handler.zip
