import 'fomantic-ui-css/semantic.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/dist/locale-data/en';
import '@formatjs/intl-pluralrules/dist/locale-data/zh';
import '@formatjs/intl-relativetimeformat/polyfill';
import '@formatjs/intl-relativetimeformat/dist/locale-data/en';
import '@formatjs/intl-relativetimeformat/dist/locale-data/zh';

import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import * as locales from './locales';
import * as serviceWorker from './serviceWorker';

function matchLocales() {
  let { language, languages } = navigator;
  if (!languages) {
    languages = [language, language.split('-')[0]];
  }
  console.log(languages);
  for (const lang of languages) {
    if (lang in locales) {
      return locales[lang];
    }
  }
  return locales.en;
}

ReactDOM.render(
  <Router>
    <IntlProvider locale={navigator.language} messages={matchLocales()}>
      <App />
    </IntlProvider>
  </Router>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
