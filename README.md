# tock-node

Build chatbots using Tock and NodeJS

## Prerequisites

- Run a [Tock bot in API mode](https://doc.tock.ai/tock/en/dev/bot-api/)
- Create a Bot application using the **web** connector type in Tock Studio and get your API key

## Installation

```
yarn add tock-node
npm i tock-node
```

_The package has TypeScript type definitions_

## Usage

```js
const { Bot } = require('tock-node');

const bot = new Bot('<TOCK_API_KEY>', '<TOCK_HOST>', <TOCK_WS_PORT>, '<TOCK_WS_PROTOCOL>');

bot.addStory('intent', bot => {
  bot.send('Hello World!');
});
```

Default Tock platform host, port and WebSocket protocol are `demo-bot.tock.ai` (the public demo), 
`443` and `wss` (secured port/protocol).

For more examples, see [`tock-node-example`](https://github.com/theopenconversationkit/tock-node-example).

### Sending messages

You can call `send` as many times as you need. All messages will be sent within the same response.

```js
bot.addStory('intent', bot => {
  bot.send('Good morning!');
  bot.send('How are you?');
});
```

### Sending cards

You can use send to send other message templates such as cards.

```js
const imageCard = require('tock-node').imageCard;
const action = require('tock-node').action;

bot.send(imageCard('Card title', 'Card description', 'https://site/image.png', action('Button')));
```

### Sending carousels

There is also a template that lets you send multiple cards in a carousel.

```js
const imageCard = require('tock-node').imageCard;
const action = require('tock-node').action;

bot.send({
  cards: [
    imageCard('Card 1', '', 'https://site/image.png'),
    imageCard('Card 2', '', 'https://site/image.png'),
    imageCard('Card 3', '', 'https://site/image.png'),
  ],
});
```

### Quick replies

Quick replies are highly buttons that are following a message. You can send quick replies following a message using `send`.

```js
const suggestion = require('tock-node').suggestion;

bot.send('Check this out!', suggestion('View Tock on GitHub'), suggestion("View Tock's Website"));
```

### Get entities and using the original user request

You can get the original user request (containing his message) from the second argument of the story handler. This is also how you retrieve entities found by Tock.

```js
bot.addStory('intent', (bot, request) => {
  // user message
  console.log(request.message.text);
  // entities
  console.log(request.entities);
});
```

### Manage user data/context

Each user has a user context that is persistent across all stories. You can use it and also set it.

```js
bot.addStory('intent', bot => {
  // getting user context
  console.log(bot.userData);
  // setting
  bot.dispatchUserData({ firstName: 'Tockito' });
});
```

In the case of multiple dispatches you can retrieve the _current_ user data by using a callback function that uses the _current_ user data as an argument.

```js
bot.addStory('intent', bot => {
  bot.dispatchUserData({ firstName: 'Foo' });
  bot.dispatchUserData(userData => {
    console.log(userData);
    // {"firstname":"Foo"}
    return { firstName: userData.firstName, lastName: 'Bar' };
  });
});
```

### Asynchronous stories

If you'd like to wait for an action before sending you can use a `Promise` as a callback to your story handler.

```js
bot.addStory('intent', async bot => {
  const message = await fetchingData();
  bot.send(message);
});
```

### Chaining/reusable story handlers

You can add as many story handlers as you want in the same `addStory`.

```js
const handler1 = bot => send('First handler');
const handler2 = bot => send('Second handler');

bot.addStory('intentA', handler1, handler2);
bot.addStory('intentB', handler1, handler2);
```
