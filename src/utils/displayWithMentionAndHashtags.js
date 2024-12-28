import {EU} from 'react-native-mentions-editor';

const findHashtags = (val) => {
  let reg = /#\S+/gim;
  let indexes = [];
  while ((match = reg.exec(val))) {
    indexes.push({
      start: match.index,
      end: reg.lastIndex - 1,
      value: match,
    });
  }
  return indexes;
};

const formatTextWithHashtags = (str, formatHashtagNode) => {
  let formattedText = [];
  const hashtags = findHashtags(str);
  if (hashtags.length) {
    let lastIndex = 0;
    hashtags.forEach((men, index) => {
      const initialStr = str.substring(lastIndex, men.start);
      lastIndex = men.end + 1;
      formattedText.push(initialStr);
      const formattedMention = formatHashtagNode(`${men.value}`);
      formattedText.push(formattedMention);
      if (hashtags.length - 1 === index) {
        const lastStr = str.substr(lastIndex); //remaining string
        formattedText.push(lastStr);
      }
    });
  } else {
    formattedText.push(str);
  }
  return formattedText;
};

export const displayTextWithMentionsAndHashtags = (
  inputText,
  formatMentionNode,
  formatHashtagNode,
) => {
  /**
   * Use this function to parse mentions markup @[username](id) in the string value.
   */
  if (inputText === '') return null;
  const retLines = inputText.split('\n');
  const formattedText = [];
  retLines.forEach((retLine, rowIndex) => {
    const mentions = EU.findMentions(retLine);
    if (mentions.length) {
      let lastIndex = 0;
      mentions.forEach((men, index) => {
        const initialStr = retLine.substring(lastIndex, men.start);
        lastIndex = men.end + 1;
        formattedText.push(
          formatTextWithHashtags(initialStr, formatHashtagNode),
        );
        const formattedMention = formatMentionNode(
          `@${men.username}`,
          `${index}-${men.id}-${rowIndex}`,
        );
        formattedText.push(formattedMention);
        if (mentions.length - 1 === index) {
          const lastStr = retLine.substr(lastIndex); //remaining string
          formattedText.push(
            formatTextWithHashtags(lastStr, formatHashtagNode),
          );
        }
      });
    } else {
      formattedText.push(formatTextWithHashtags(retLine, formatHashtagNode));
    }
    formattedText.push('\n');
  });
  return formattedText;
};
