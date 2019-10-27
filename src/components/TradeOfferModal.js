import './ChooseCards.css';

import queryString from 'query-string';
import React from 'react';
import {
  FormattedMessage,
  FormattedRelativeTime,
  injectIntl
} from 'react-intl';
import {
  Dimmer,
  Grid,
  Icon,
  Image,
  List,
  Loader,
  Message,
  Modal,
  Segment
} from 'semantic-ui-react';
import {
  Button,
  Comment,
  Confirm,
  Form,
  Header,
  Label,
  TextArea
} from 'semantic-ui-react';

import socket from '../socket';
import CardList from './CardList';
import CardThumbnails from './CardThumbnails';
import ChooseCards from './ChooseCards';

class TradeOfferModal extends React.Component {
  state = {
    loading: true,
    editing: false,
    step: 1,
    author: null,
    playerName: '',
    playerTag: '',
    wantCards: [],
    offerCards: [],
    boolWantCards: CardList.map(() => false),
    boolOfferCards: CardList.map(() => false),
    textAreaValue: '',
    confirmDeleteOpen: false,
    sendButtonToggle: true,
    messages: [],
    liked: true,
    subscriber: [],
    textAreaTime: '',
    textAreaClan: '',
    textAreaPlayerName: '',
    textAreaPlayerTag: '',
    emptyTimeError: false,
    emptyClanError: false,
    emptyPlayerNameError: false,
    availableTime: '',
    preferClan: '',
    unknownError: false,
    hasMore: true,
    isLoading: false
  };

  isLoading = false;

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async componentDidMount() {
    await this.getTradeOffer();
    this.setState({ loading: false });
    this.checkLiked();
    console.log('subscribe messages');
    this.loadMessages();
    socket.on('message', this.onMessage);
    socket.emit('subscribeMessages', this.props.match.params.offerId);
  }

  componentWillUnmount() {
    console.log('unsubscribe messages');
    socket.emit('unsubscribeMessages', this.props.match.params.offerId);
    socket.off('message', this.onMessage);
  }

  onMessage = msg => {
    console.log('onMessage:', msg);
    if (msg.tradeOffer !== this.props.match.params.offerId) {
      return;
    }
    const messages = this.state.messages.slice();
    messages.push(msg);
    this.setState({ messages });
  };

  getTradeOffer = async () => {
    console.log(`get tradeOffer ${this.props.match.params.offerId}`);
    try {
      const response = await fetch(
        `/api/v1/tradeoffers/${this.props.match.params.offerId}`
      );
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const {
        wantCards,
        offerCards,
        user,
        subscriber,
        availableTime,
        preferClan,
        playerName,
        playerTag
      } = await response.json();
      this.setState({
        wantCards,
        offerCards,
        author: user,
        subscriber,
        availableTime,
        preferClan,
        playerName,
        playerTag,
        textAreaTime: availableTime || '',
        textAreaClan: preferClan || '',
        textAreaPlayerName: playerName || '',
        textAreaPlayerTag: playerTag || '',
        boolWantCards: CardList.map(x =>
          wantCards.includes(x[0].split('.')[0])
        ),
        boolOfferCards: CardList.map(x =>
          offerCards.includes(x[0].split('.')[0])
        )
      });
    } catch (err) {
      console.error(err);
      this.setState({ unknownError: true });
    }
  };

  checkLiked = () => {
    if (!this.props.user) {
      console.log('no user');
      return;
    }
    console.log('subscriber:' + String(this.state.subscriber));
    console.log('user:' + String(this.props.user._id));
    const liked = this.state.subscriber.includes(this.props.user._id);
    this.setState({ liked });
  };

  loadMessages = async () => {
    if (this.isLoading || this.state.isLoading) {
      return;
    }
    console.log('TradeOffer#loadMessages');
    try {
      this.isLoading = true;
      this.setState({ isLoading: true });

      let query = {};
      if (this.state.messages && this.state.messages.length > 0) {
        const oldestMessage = this.state.messages[0];
        query.before = oldestMessage.createdAt;
      }
      const queryStr = queryString.stringify(query);
      const response = await fetch(
        `/api/v1/tradeoffers/${this.props.match.params.offerId}/messages${
          queryStr ? '?' : ''
        }${queryStr}`
      );
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const olderMessages = await response.json();
      if (olderMessages.length === 0) {
        this.setState({ hasMore: false });
      }
      const newMessages = olderMessages.reverse().concat(this.state.messages);
      this.setState({ messages: newMessages });
    } catch (err) {
      console.error(err);
      this.setState({ unknownError: true });
    } finally {
      this.isLoading = false;
      this.setState({ isLoading: false });
    }
  };

  handleOnChangePlayerName = event => {
    if (event.target.value.length > 20) {
      console.log('textarea Name too long.');
      return;
    }
    this.setState({
      textAreaPlayerName: event.target.value,
      emptyPlayerNameError: event.target.value.length === 0
    });
  };

  handleOnChangePlayerTag = event => {
    if (event.target.value.length > 15) {
      console.log('textarea Tag too long.');
      return;
    }
    this.setState({ textAreaPlayerTag: event.target.value });
  };

  handleOnChangeTime = event => {
    if (event.target.value.length > 100) {
      console.log('textarea Time too long.');
      return;
    }
    this.setState({
      textAreaTime: event.target.value,
      emptyTimeError: event.target.value.length === 0
    });
  };

  handleOnChangeClan = event => {
    if (event.target.value.length > 50) {
      console.log('textarea clan too long.');
      return;
    }
    this.setState({
      textAreaClan: event.target.value,
      emptyClanError: event.target.value.length === 0
    });
  };

  handleEditClick = event => {
    event.stopPropagation();
    this.setState({
      editing: !this.state.editing
    });
  };

  handleLikeClick = async event => {
    if (this.props.user && this.props.user._id !== this.state.author._id) {
      event.stopPropagation();

      try {
        let response = null;
        if (this.state.liked) {
          console.log('handel unlike offer');
          response = await fetch(
            `/api/v1/tradeoffers/${this.props.match.params.offerId}/unsubscribe`,
            {
              method: 'POST',
              headers: new Headers({
                'Content-Type': 'application/json'
              })
            }
          );
        } else {
          console.log('handel like offer');
          response = await fetch(
            `/api/v1/tradeoffers/${this.props.match.params.offerId}/subscribe`,
            {
              method: 'POST',
              headers: new Headers({
                'Content-Type': 'application/json'
              })
            }
          );
        }
        if (!response.ok) {
          throw new Error(response.statusText);
        }
      } catch (err) {
        console.error(err);
        this.setState({ unknownError: true });
      }
      this.handleLocalLikeClick(this.state.liked);
      this.props.handleLocalLikeClick(
        this.props.match.params.offerId,
        this.state.liked
      );
      this.setState({
        liked: !this.state.liked
      });
    } else {
      console.log('No permission to like/unlike.');
    }
  };

  handleLocalLikeClick = unsubscribe => {
    const newSubscriber = this.state.subscriber.slice();
    if (unsubscribe) {
      const idx = newSubscriber.findIndex(x => x === this.props.user._id);
      newSubscriber.splice(idx, 1);
    } else {
      newSubscriber.push(this.props.user._id);
    }
    this.setState({ subscriber: newSubscriber });
  };

  handleWant = index => {
    let choosed = this.state.boolWantCards.slice();
    choosed[index] = !choosed[index];
    this.setState({
      boolWantCards: choosed
    });
  };

  handleOffer = index => {
    let choosed = this.state.boolOfferCards.slice();
    choosed[index] = !choosed[index];
    this.setState({
      boolOfferCards: choosed
    });
  };

  postTradeOffer = async () => {
    if (
      this.state.textAreaTime.length === 0 ||
      this.state.textAreaClan.length === 0 ||
      this.state.textAreaPlayerName.length === 0
    ) {
      this.setState({
        emptyTimeError: this.state.textAreaTime.length === 0,
        emptyClanError: this.state.textAreaClan.length === 0,
        emptyPlayerNameError: this.state.textAreaPlayerName.length === 0
      });
      console.log('empty textarea no time or clan or name');
      return;
    }
    await this.props.postTradeOffer(
      this.state.boolWantCards,
      this.state.boolOfferCards,
      this.state.textAreaTime,
      this.state.textAreaClan,
      this.state.textAreaPlayerName,
      this.state.textAreaPlayerTag
    );

    this.setState({
      editing: false,
      step: 1
    });
    await this.getTradeOffer();
  };

  handleOnChange = event => {
    this.setState({ textAreaValue: event.target.value });
    let rows = event.target.value.split('\n');
    if (rows.length > 10 || event.target.value.length > 280) {
      this.setState({ sendButtonToggle: false });
    } else {
      this.setState({ sendButtonToggle: true });
    }
  };

  replyMessage = name => {
    let txt = this.state.textAreaValue.split(' ');
    if (txt[0] !== '@' + name) {
      this.setState({ textAreaValue: `@${name} ${this.state.textAreaValue}` });
    }
    this.textAreaRef.current.focus();
  };

  deleteOpenToggle = () => {
    this.setState({ confirmDeleteOpen: true });
  };

  deleteCloseToggle = () => {
    this.setState({ confirmDeleteOpen: false });
  };

  handleDeleteClick = async () => {
    await this.props.deleteTradeOffer(this.props.match.params.offerId);
    this.goHome();
  };

  handleSubmit = async event => {
    event.preventDefault();
    try {
      const response = await fetch(
        `/api/v1/tradeoffers/${this.props.match.params.offerId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ msg: event.target.message.value }),
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        }
      );
      if (!response.ok) {
        throw Error(response.statusText);
      }
    } catch (err) {
      console.error(err);
      this.setState({ unknownError: true });
    }
    this.setState({ textAreaValue: '' });
  };

  // dateFromNow = lastDate => {
  //   let sTmp = ['mins', 'hours', 'days'];
  //   let diff = parseInt((new Date() - new Date(lastDate)) / 60000);
  //   let idx = 0;
  //   if (diff >= 60) {
  //     diff = parseInt(diff / 60);
  //     idx = 1;
  //     if (diff >= 24) {
  //       diff = parseInt(diff / 24);
  //       idx = 2;
  //     }
  //   }
  //   return diff + ' ' + sTmp[idx] + ' ago';
  // };

  goHome = () => {
    const { history, location } = this.props;
    if (location.state && location.state.background) {
      history.goBack();
    } else {
      history.replace('/');
    }
  };

  textAreaRef = React.createRef();

  render() {
    const { intl } = this.props;
    return this.state.loading ? (
      <Modal open onClose={this.goHome} closeIcon>
        <Modal.Header>Loading...</Modal.Header>
        <Modal.Content>
          <Segment>
            <Dimmer active inverted>
              <Loader active size="medium">
                Loading
              </Loader>
            </Dimmer>

            <Image src="https://react.semantic-ui.com/images/wireframe/paragraph.png" />
          </Segment>
        </Modal.Content>
      </Modal>
    ) : !this.state.author ? (
      <Modal open onClose={this.goHome} closeIcon>
        <Modal.Header>
          <Icon name="frown outline" />
          <FormattedMessage id="deleted" />
        </Modal.Header>
        <Modal.Content>
          <FormattedMessage id="deletedOffer" />
        </Modal.Content>
      </Modal>
    ) : (
      <Modal open onClose={this.goHome} closeIcon>
        <Modal.Header style={{ backgroundColor: 'rgb(233, 235, 238)' }}>
          {this.state.author ? (
            <>
              <Image src={this.state.author.photo} avatar />
              <span style={{ verticalAlign: 'middle' }}>
                {this.state.playerName}
              </span>
              <p
                style={{
                  fontSize: '1rem',
                  color: 'rgba(0,0,0,.4)',
                  paddingTop: '0.2rem'
                }}
              >
                {'#' + this.state.playerTag}
              </p>
            </>
          ) : (
            ''
          )}
        </Modal.Header>
        <Modal.Content>
          {this.state.editing ? (
            <Grid columns="equal" verticalAlign="middle" stackable>
              <Grid.Row>
                <Grid.Column>
                  <ChooseCards
                    choosable={this.state.step === 1}
                    header={<FormattedMessage id="wantCard" />}
                    title={<FormattedMessage id="selectAll" />}
                    choosed={this.state.boolWantCards}
                    onToggle={this.handleWant}
                    onClickNext={() => this.setState({ step: 2 })}
                    onClickExpand={() => this.setState({ step: 1 })}
                    buttonText={<FormattedMessage id="next" />}
                    usingUser={this.props.user}
                  />
                  {this.state.step >= 2 ? (
                    <ChooseCards
                      choosable={this.state.step === 2}
                      header={<FormattedMessage id="offerCard" />}
                      title={<FormattedMessage id="selectAll" />}
                      choosed={this.state.boolOfferCards}
                      onToggle={this.handleOffer}
                      onClickNext={this.postTradeOffer}
                      onClickExpand={() => this.setState({ step: 2 })}
                      buttonText={<FormattedMessage id="done" />}
                      checkSecond={true}
                      usingUser={this.props.user}
                      textAreaTime={this.state.textAreaTime}
                      textAreaClan={this.state.textAreaClan}
                      textAreaPlayerName={this.state.textAreaPlayerName}
                      textAreaPlayerTag={this.state.textAreaPlayerTag}
                      handleOnChangeTime={this.handleOnChangeTime}
                      handleOnChangeClan={this.handleOnChangeClan}
                      handleOnChangePlayerName={this.handleOnChangePlayerName}
                      handleOnChangePlayerTag={this.handleOnChangePlayerTag}
                      emptyTimeError={this.state.emptyTimeError}
                      emptyClanError={this.state.emptyClanError}
                      emptyPlayerNameError={this.state.emptyPlayerNameError}
                    />
                  ) : (
                    <div></div>
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          ) : (
            <>
              <Grid columns="equal" verticalAlign="middle" stackable>
                <Grid.Row style={{ paddingBottom: '0rem', fontWeight: 700 }}>
                  <Grid.Column
                    width={5}
                    textAlign="right"
                    only="tablet computer"
                  >
                    {this.props.user &&
                    this.state.author &&
                    this.props.user._id === this.state.author._id ? (
                      <FormattedMessage id="getCard" />
                    ) : (
                      <FormattedMessage id="giveCard" />
                    )}
                  </Grid.Column>
                  <Grid.Column width={5} textAlign="left" only="mobile">
                    {this.props.user &&
                    this.state.author &&
                    this.props.user._id === this.state.author._id ? (
                      <FormattedMessage id="getCard" />
                    ) : (
                      <FormattedMessage id="giveCard" />
                    )}
                  </Grid.Column>
                  <Grid.Column width={2} textAlign="center"></Grid.Column>
                  <Grid.Column textAlign="left" only="tablet computer">
                    {this.props.user &&
                    this.state.author &&
                    this.props.user._id === this.state.author._id ? (
                      <FormattedMessage id="giveAnyCard" />
                    ) : (
                      <FormattedMessage id="getAnyCard" />
                    )}
                  </Grid.Column>
                  <Grid.Column textAlign="right" only="mobile">
                    {this.props.user &&
                    this.state.author &&
                    this.props.user._id === this.state.author._id ? (
                      <FormattedMessage id="giveAnyCard" />
                    ) : (
                      <FormattedMessage id="getAnyCard" />
                    )}
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column
                    width={5}
                    textAlign="right"
                    only="tablet computer"
                  >
                    <CardThumbnails
                      cards={this.state.wantCards}
                      len={90}
                      mode="want"
                    />
                  </Grid.Column>
                  <Grid.Column width={5} textAlign="left" only="mobile">
                    <CardThumbnails
                      cards={this.state.wantCards}
                      len={90}
                      mode="want"
                    />
                  </Grid.Column>
                  <Grid.Column width={2} textAlign="center">
                    <Icon name="exchange" size="big" />
                  </Grid.Column>
                  <Grid.Column textAlign="left" only="tablet computer">
                    <CardThumbnails
                      cards={this.state.offerCards}
                      len={24}
                      mode="offer"
                    />
                  </Grid.Column>
                  <Grid.Column textAlign="right" only="mobile">
                    <CardThumbnails
                      cards={this.state.offerCards}
                      len={24}
                      mode="offer"
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <List>
                <List.Item>
                  <Label>
                    <Icon name="tag" />
                    <FormattedMessage id="clan" />
                    <Label.Detail>{this.state.preferClan}</Label.Detail>
                  </Label>
                </List.Item>
                <List.Item>
                  <Label>
                    <Icon name="clock" />
                    <FormattedMessage id="time" />
                    <Label.Detail>{this.state.availableTime}</Label.Detail>
                  </Label>
                </List.Item>
              </List>
              <Grid columns="equal" verticalAlign="middle">
                <Grid.Row columns={4}>
                  <Grid.Column>
                    <Icon name="comment outline" />N
                  </Grid.Column>
                  <Grid.Column>
                    <Icon
                      onClick={this.handleLikeClick}
                      name={this.state.liked ? 'heart' : 'heart outline'}
                      color={this.state.liked ? 'red' : 'black'}
                    />
                    <span
                      className={`ui ${
                        this.state.liked ? 'red' : 'black'
                      } text`}
                    >
                      {this.state.subscriber.length}
                    </span>
                  </Grid.Column>
                  <Grid.Column>
                    {this.props.user &&
                    this.state.author &&
                    this.props.user._id === this.state.author._id ? (
                      <Button onClick={this.handleEditClick}>
                        <FormattedMessage id="edit" />
                      </Button>
                    ) : (
                      <div></div>
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {this.props.user &&
                    (this.props.user.admin ||
                      (this.state.author &&
                        this.props.user._id === this.state.author._id)) ? (
                      <div>
                        <Button onClick={this.deleteOpenToggle}>
                          <FormattedMessage id="delete" />
                        </Button>
                        <Confirm
                          basic
                          open={this.state.confirmDeleteOpen}
                          onCancel={this.deleteCloseToggle}
                          onConfirm={this.handleDeleteClick}
                          confirmButton={intl.formatMessage({ id: 'ok' })}
                          cancelButton={intl.formatMessage({ id: 'cancel' })}
                          content={intl.formatMessage({ id: 'areYouSure' })}
                        />
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </>
          )}
        </Modal.Content>
        {this.state.unknownError ? (
          <Modal.Content>
            <Message negative>
              <Message.Header>
                <Icon name="bug" />
                <FormattedMessage id="unknownError" />
              </Message.Header>
              <p>
                <FormattedMessage id="refresh" />
              </p>
            </Message>
          </Modal.Content>
        ) : (
          ''
        )}
        <Modal.Actions className="message-box">
          <Grid style={{ backgroundColor: 'rgb(233, 235, 238)' }}>
            <Grid.Row>
              <Grid.Column>
                <Dimmer.Dimmable
                  as={Form}
                  dimmed={this.props.user ? false : true}
                  onSubmit={this.handleSubmit}
                >
                  <Form.Field error={!this.state.sendButtonToggle}>
                    <TextArea
                      name="message"
                      placeholder={intl.formatMessage({ id: 'messageBox' })}
                      onChange={this.handleOnChange}
                      value={this.state.textAreaValue}
                      ref={this.textAreaRef}
                    />
                    {!this.state.sendButtonToggle ? (
                      <Label pointing prompt>
                        <FormattedMessage id="tooMuchLines" />
                      </Label>
                    ) : (
                      ''
                    )}
                  </Form.Field>
                  <div className="d-flex justify-content-end">
                    <Form.Button
                      disabled={!this.state.sendButtonToggle}
                      type="submit"
                      primary
                    >
                      <FormattedMessage id="submit" />
                    </Form.Button>
                  </div>

                  <Dimmer active={!this.props.user}>
                    <Button href="/auth/google" primary>
                      <FormattedMessage id="loginToComment" />
                    </Button>
                  </Dimmer>
                </Dimmer.Dimmable>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Actions>
        <Modal.Content>
          <Grid>
            <Grid.Row>
              <Grid.Column>
                <Comment.Group style={{ padding: '1rem' }}>
                  <Header as="h4" dividing>
                    <FormattedMessage id="comment" />
                  </Header>
                  {this.state.hasMore ? (
                    <Comment
                      as="a"
                      href="#"
                      style={{
                        color: '#385898',
                        paddingTop: '0rem',
                        marginTop: '0rem'
                      }}
                      onClick={this.loadMessages}
                    >
                      <FormattedMessage id="loadMessage" />
                    </Comment>
                  ) : (
                    ''
                  )}
                  {this.state.messages.length > 0 ? (
                    this.state.messages.map(x => (
                      <Comment key={x._id}>
                        <Comment.Avatar src={x.user.photo} />
                        <Comment.Content>
                          <Comment.Author style={{ color: '#385898' }} as="a">
                            {x.user.name}
                          </Comment.Author>
                          <Comment.Metadata>
                            {/* <div>{this.dateFromNow(x.createdAt)}</div> */}
                            <FormattedRelativeTime
                              value={
                                (new Date(x.createdAt) - new Date()) / 1000
                              }
                              updateIntervalInSeconds={5}
                            />
                          </Comment.Metadata>
                          <Comment.Text>
                            <div style={{ overflowWrap: 'break-word' }}>
                              {x.msg.split('\n').map((m, index) => (
                                <div key={index}>{m}</div>
                              ))}
                            </div>
                          </Comment.Text>
                          <Comment.Actions>
                            <Comment.Action
                              onClick={() => {
                                this.replyMessage(x.user.name);
                              }}
                            >
                              <FormattedMessage id="reply" />
                            </Comment.Action>
                          </Comment.Actions>
                        </Comment.Content>
                      </Comment>
                    ))
                  ) : (
                    <Header as="h4" disabled>
                      <FormattedMessage id="noComments" />
                    </Header>
                  )}
                </Comment.Group>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Content>
        <Modal.Actions>
          <Grid>
            <Grid.Row>
              <Grid.Column textAlign="center">
                <Icon name="circle" size="mini" color="blue" />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default injectIntl(TradeOfferModal);
