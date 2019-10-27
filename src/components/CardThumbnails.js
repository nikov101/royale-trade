import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Label } from 'semantic-ui-react';

export default function CardThumbnails({ cards, len, mode }) {
  if (!cards || cards.length === 0) {
    return (
      <Label color="brown">
        <FormattedMessage id="allOk" />
      </Label>
    );
  } else if (cards.length <= len) {
    return (
      <div>
        {cards.map(x => (
          <img
            className={mode + '-card'}
            alt={x}
            src={`/images/cards/${x}.png`}
            key={x}
          />
        ))}
      </div>
    );
  } else {
    return (
      <div>
        {cards.slice(0, len - 1).map(x => (
          <img
            className={mode + '-card'}
            alt={x}
            src={`/images/cards/${x}.png`}
            key={x}
          />
        ))}
        <Label>+{cards.length - len + 1}</Label>
      </div>
    );
  }
}
