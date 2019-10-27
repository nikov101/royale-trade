import './ChooseCards.css';

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Card, Grid, Icon, Image, Label, List } from 'semantic-ui-react';

import CardThumbnails from './CardThumbnails';

export default class TradeOffer extends React.Component {
  // state = {
  //   liked: false,
  //   boolWantCards: CardList.map(x =>
  //     this.props.wantCards
  //       ? this.props.wantCards.includes(x[0].split('.')[0])
  //       : false
  //   ),
  //   boolOfferCards: CardList.map(x =>
  //     this.props.offerCards
  //       ? this.props.offerCards.includes(x[0].split('.')[0])
  //       : false
  //   ),
  //   showNewOfferModal: false
  // };

  // toggle = () => {
  //   this.setState({ showModal: !this.state.showModal });
  // };

  // componentDidMount() {
  //   this.checkLiked();
  // }

  // checkLiked = () => {
  //   if (!this.props.usingUser) {
  //     console.log('no user');
  //     return;
  //   }
  //   const liked = this.props.subscriber.includes(this.props.usingUser._id);
  //   this.setState({ liked });
  // };

  // newOfferToggle = () => {
  //   this.setState({ showNewOfferModal: !this.state.showNewOfferModal });
  // };

  // handleMakeOfferButton = () => {
  //   this.setState({ showNewOfferModal: !this.state.showNewOfferModal });
  // };

  // handleLikeClick = event => {
  //   event.stopPropagation();
  //   this.setState({
  //     liked: !this.state.liked
  //   });
  // };

  render() {
    const liked = this.props.usingUser && this.props.subscriber.includes(this.props.usingUser._id);
    return (
      <Card fluid>
        <Card.Content>
          <Card.Header>
            <Image src={this.props.avatar} avatar />
            <span style={{ verticalAlign: 'middle' }}>{this.props.playerName}</span>
          </Card.Header>
          <Card.Meta>{'#'+this.props.playerTag}</Card.Meta>
        </Card.Content>
        <Card.Content>
          <Grid columns="equal" verticalAlign="middle" stackable>
            <Grid.Row style={{ paddingBottom: '0rem', fontWeight: 700 }}>
              <Grid.Column width={5} textAlign="right" only="tablet computer">
                {(this.props.usingUser && (this.props.usingUser._id===this.props.author._id))
                  ? <FormattedMessage id='getCard'/>
                  : <FormattedMessage id='giveCard'/>}
              </Grid.Column>
              <Grid.Column width={5} textAlign="left" only="mobile">
                {(this.props.usingUser && (this.props.usingUser._id===this.props.author._id))
                  ? <FormattedMessage id='getCard'/>
                  : <FormattedMessage id='giveCard'/>}
              </Grid.Column>
              <Grid.Column width={2} textAlign="center">

              </Grid.Column>
              <Grid.Column textAlign="left" only="tablet computer">
                {(this.props.usingUser && (this.props.usingUser._id===this.props.author._id))
                  ? <FormattedMessage id='giveAnyCard'/>
                  : <FormattedMessage id='getAnyCard'/>}
              </Grid.Column>
              <Grid.Column textAlign="right" only="mobile">
                {(this.props.usingUser && (this.props.usingUser._id===this.props.author._id))
                  ? <FormattedMessage id='giveAnyCard'/>
                  : <FormattedMessage id='getAnyCard'/>}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={5} textAlign="right" only="tablet computer">
                <CardThumbnails
                  cards={this.props.wantCards}
                  len={this.props.wantLen}
                  mode="want"
                />
              </Grid.Column>
              <Grid.Column width={5} textAlign="left" only="mobile">
                <CardThumbnails
                  cards={this.props.wantCards}
                  len={this.props.wantLen}
                  mode="want"
                />
              </Grid.Column>
              <Grid.Column width={2} textAlign="center">
                <Icon name="exchange" size="big" />
              </Grid.Column>
              <Grid.Column textAlign="left" only="tablet computer">
                <CardThumbnails
                  cards={this.props.offerCards}
                  len={this.props.offerLen}
                  mode="offer"
                />
              </Grid.Column>
              <Grid.Column textAlign="right" only="mobile">
                <CardThumbnails
                  cards={this.props.offerCards}
                  len={this.props.offerLen}
                  mode="offer"
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <List>
            <List.Item>
              <Label>
                <Icon name='tag' />
                <FormattedMessage id='clan'/>
                <Label.Detail>{this.props.preferClan}</Label.Detail>
              </Label>
            </List.Item>
            <List.Item>
              <Label>
                <Icon name='clock' />
                <FormattedMessage id='time'/>
                <Label.Detail>{this.props.availableTime}</Label.Detail>
              </Label>
            </List.Item>
          </List>
          {/* <Grid>
            <Grid.Row>
              <Grid.Column>
                <Label>
                  <Icon name='tag'/>
                  Clan
                  <Label.Detail>{this.props.preferClan}</Label.Detail>
                </Label>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Label>
                  <Icon name='clock' />
                  Time
                  <Label.Detail>{this.props.availableTime}</Label.Detail>
                </Label>
              </Grid.Column>
            </Grid.Row>
          </Grid> */}
          <Grid>
            <Grid.Row columns={4}>
              <Grid.Column>
                <Icon name="comment outline" />
                N
              </Grid.Column>
              <Grid.Column>
                <Icon name={liked ? 'heart' : 'heart outline'}
                      color={liked ? 'red' : 'black'} />
                <span className={`ui ${liked ? 'red' : 'black'} text`}>{this.props.subscriber.length}</span>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card.Content>
      </Card>
    );
  }
}
