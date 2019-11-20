# tock-node

Build chatbots using Tock and NodeJS

## Prerequisites

- Run a [Tock bot in API mode](https://doc.tock.ai/tock/en/dev/bot-api/)
- Create a *Bot configuration* using the in Tock Studio and get your API key

### With `demo.tock.ai`

You can use the [Tock demo instance](https://demo.tock.ai) as an alternative to setting up a Tock bot.

## Installation

```
# yarn
yarn add tock-node

# npm
npm i tock-node
```

_The package has TypeScript type definitions_

## Usage

```js
const { Bot } = require('tock-node');

const bot = new Bot('<API_KEY>', '<TOCK_CONNECTOR_URL>');

bot.addStory('intent', bot => {
  bot.send('Hello World!');
});
```

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

## API Reference

### `new Bot(apiKey, connectorUrl)`

* `apiKey` {string} API key (found in Tock Studio under Configuration)            |
* `connectorUrl` {string} Tock Connector URL (found in Tock Studio under Configuration)

Creates a Bot instance. The bot connects right away to the Tock connector using the provided `apiKey`. The bot instance exposes all methods that help building a bot.

### `bot.addStory(intent, ...storyHandlers)`

* `intent` {string}
* `storyHandlers` {((botInterface, userRequest) => void | Promise<void>)[]}
  * `botInterface` {[BotInterface](#BotInterface)}
  * `userRequest` {[UserRequest](#UserRequest)}
  * Returns: {Promise<void>|void}

Adds a handler for a specific intent. The intent is detected by Tock and configurable in Tock Studio. `addStory` is the main way to add behavior to your bot.

It is possible to add multiple `storyHandlers` however they can only be set in the same `addStory` call for a certain `intent`. If `addStory` is called with an existing `intent` it will overwrite the previous `storyHandlers`.

When using multiple `storyHandlers` they will be executed in order.

`storyHandlers` can individually return [`Promises`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), the bot will wait until the `Promise` resolves before running the next handler.

Once all the `storyHandlers` are executed. The bot will send the response back to Tock/the user.

### `BotInterface`

* `send` {(text, ...quickReplies) => [BotMessage](#BotMessage)}
  * `text` {string}
  * `quickReplies` {Suggestion[]}
* `send` {(input, ...quickReplies) => [BotMessage](#BotMessage)} send overload
  * `input` {[BotMessage](#BotMessage)}
  * `quickReplies` {Suggestion[]}
* `userData` {Object}
* `dispatchUserData` {Object|(prevUserData) => Object}

`BotInterface` is an object created for each story handler. The object contains a `send` method that can be used to set up a response to the user request. Also a `userData` property that contains data relative to a user and a `dispatchUserData` method to change it.

## FAQ

### What is my API key and my Tock connector URL?

You can find both in your Bot Configuration.

### How do I talk to my bot?

1. The easiest way is to go to the [Test page in Tock Studio](https://demo.tock.ai/test).

2. Another alternative is to send HTTP requests to your Tock bot at the connector URL following [this API](https://github.com/theopenconversationkit/tock/tree/master/bot/connector-web).

There is a [UI library (`tock-react-kit`)](https://github.com/theopenconversationkit/tock-react-kit) that allows you to quickly setup a chat interface.

### Example code?

There is a example bot at our [`tock-node-example` repository](https://github.com/theopenconversationkit/tock-node-example) with a chat UI (made with [`tock-react-kit`](https://github.com/theopenconversationkit/tock-react-kit)). It requires a [Unsplash application](https://unsplash.com/developers) to run properly.
