import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './SlickSlider.css';

import React from 'react';
import { FormattedMessage } from 'react-intl';
import Slider from 'react-slick';
import { Container } from 'semantic-ui-react';

const CoverImage = ({ src }) => (
  <div
    style={{
      width: '100%',
      height: 'calc(10rem + 10vw)',
      paddingLeft: '40px',
      backgroundImage: `url(${src.imgSrc})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}
  >
    <Container>
      <p
        style={{
          fontSize: 'calc(2rem + 1vw)',
          fontWeight: '700',
          paddingTop: '2rem',
          marginBottom: '1rem',
          color: 'white',
          textShadow: 'rgba(0, 0, 0, 0.7) 0px 2px 10px'
        }}
      >
        {src.title}
      </p>
      <p
        style={{
          fontSize: 'calc(0.8rem + 1vw)',
          fontWeight: '700',
          color: 'white',
          textShadow: 'rgb(0, 0, 0) 0px 2px 7px'
        }}
      >
        {src.text}
      </p>
    </Container>
  </div>
);

export default class SlickSlider extends React.Component {
  sources = [
    {
      imgSrc: '/images/car1.jpg',
      title: <FormattedMessage id="slider1Title" />,
      text: <FormattedMessage id="slider1Text" />
    },
    {
      imgSrc: '/images/car2.png',
      title: <FormattedMessage id="slider2Title" />,
      text: <FormattedMessage id="slider2Text" />
    },
    {
      imgSrc: '/images/car3.jpg',
      title: <FormattedMessage id="slider3Title" />,
      text: <FormattedMessage id="slider3Text" />
    }
  ];

  render() {
    return (
      <Slider dots infinite autoplay autoplaySpeed={5000}>
        {this.sources.map(src => (
          <CoverImage src={src} key={src} />
        ))}
      </Slider>
    );
  }
}
