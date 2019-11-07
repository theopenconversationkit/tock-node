import { I18nText, BotMessageCard, Action, Suggestion } from './models';

export function i18nText(text: string): I18nText {
  return {
    text,
    args: [],
    toBeTranslated: true,
    length: text.length,
  };
}

export function suggestion(label: string): Suggestion {
  return {
    title: i18nText(label),
  };
}

export function action(label: string, url?: string): Action {
  return {
    title: i18nText(label),
    url,
  };
}

export function imageCard(
  title: string,
  img: string,
  subTitle: string = '',
  quickReplies: Action[] = []
): BotMessageCard {
  return {
    actions: quickReplies,
    attachment: {
      url: img,
      type: 'image',
    },
    delay: 0,
    subTitle: i18nText(subTitle),
    title: i18nText(title),
    type: 'card',
  };
}

export function videoCard(
  title: string,
  video: string,
  subTitle: string = '',
  quickReplies: Action[] = []
): BotMessageCard {
  return {
    actions: quickReplies,
    attachment: {
      url: video,
      type: 'video',
    },
    delay: 0,
    subTitle: i18nText(subTitle),
    title: i18nText(title),
    type: 'card',
  };
}

export function audioCard(
  title: string,
  audio: string,
  subTitle: string = '',
  quickReplies: Action[] = []
): BotMessageCard {
  return {
    actions: quickReplies,
    attachment: {
      url: audio,
      type: 'audio',
    },
    delay: 0,
    subTitle: i18nText(subTitle),
    title: i18nText(title),
    type: 'card',
  };
}

export function fileCard(
  title: string,
  file: string,
  subTitle: string = '',
  quickReplies: Action[] = []
): BotMessageCard {
  return {
    actions: quickReplies,
    attachment: {
      url: file,
      type: 'file',
    },
    delay: 0,
    subTitle: i18nText(subTitle),
    title: i18nText(title),
    type: 'card',
  };
}
