import './App.css';

import queryString from 'query-string';
import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { Container, Divider, Grid, Icon, Segment } from 'semantic-ui-react';

import CardList from './components/CardList';
import ChooseCardsModal from './components/ChooseCardModal';
import MainPage from './components/MainPage';
import Navigation from './components/Navigation';
import SlickSlider from './components/SlickSlider';
import SubscriptionPage from './components/SubscriptionPage';
import TradeOfferModal from './components/TradeOfferModal';
import socket from './socket';

class App extends Component {
  state = {
    user: null,
    tradeOffers: [],
    userOffer: null,
    notifications: [],
    hasMore: true,
    isLoading: false
  };

  isLoading = false;

  async componentDidMount() {
    try {
      const response = await fetch('/auth/user');
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const user = await response.json();
      // console.log('/auth/user', user);
      this.setState({ user });
    } catch (err) {
      console.log(err);
    }
    await this.updateUserOffer();

    await this.getNotification();
    socket.on('notification', this.onNotify);
  }

  componentDidUpdate() {
    const unreadNum = this.state.notifications.filter(x => !x.read).length;
    document.title = `${unreadNum > 0 ? `🔔(${unreadNum}) ` : ''}Royale Trade`;
  }

  // setTitle = (num) => {
  //   if (num === 0) {
  //     this.setState({ title: 'Royale Trade' });
  //   }
  //   else {
  //     this.setState({ title: '🔔('+num+')Royale Trade' });
  //   }
  // }

  handleLocalLikeClick = (tradeOfferId, unsubscribe) => {
    const newTradeOffers = this.state.tradeOffers.slice();
    const idx = newTradeOffers.findIndex(x => x._id === tradeOfferId);
    if (unsubscribe) {
      const subIdx = newTradeOffers[idx].subscriber.findIndex(
        x => x === this.state.user._id
      );
      newTradeOffers[idx].subscriber.splice(subIdx, 1);
    } else {
      newTradeOffers[idx].subscriber.push(this.state.user._id);
    }
    this.setState({ tradeOffers: newTradeOffers });
  };

  getNotification = async () => {
    try {
      const response = await fetch('/api/v1/userData');
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const userData = await response.json();
      // console.log('userData', userData);
      this.setState({ notifications: userData.notifications });
    } catch (err) {
      console.log(err);
    }
  };

  onNotify = async msg => {
    console.log('onNotify:', msg);
    await this.getNotification();

    const x = this.state.notifications[0];
    const toastText =
      '📢 ' +
      x.lastUser.name +
      (x.users.length > 1 ? ' and ' + (x.users.length - 1) + ' people' : '') +
      ' replied to ' +
      (this.state.user && x.tradeOffer.user.name === this.state.user.name
        ? 'your'
        : x.tradeOffer.user.name + "'s") +
      ' offer.';
    if (!toast.isActive(toastText)) {
      toast.info(toastText, {
        toastId: toastText,
        onClick: () => {
          this.props.history.push({
            pathname: `/offers/${x.tradeOffer._id}`,
            state: { background: this.props.location }
          });
          this.setRead(x.tradeOffer._id);
        }
      });
    }
  };

  updateAllOffer = () => {
    this.setState({ tradeOffers: [], hasMore: true });
    // try {
    //   const now = new Date();
    //   const response = await fetch(`/api/v1/tradeoffers/before/${now}`);
    //   if (!response.ok) {
    //     throw Error(response.statusText);
    //   }
    //   const tradeOffers = await response.json();
    //   this.setState({ tradeOffers, oldestCreateAt: tradeOffers[tradeOffers.length-1].createdAt });
    // } catch (err) {
    //   console.log(err);
    // }
  };

  loadMoreOffer = async () => {
    if (this.isLoading || this.state.isLoading) {
      return;
    }
    try {
      this.isLoading = true;
      this.setState({ isLoading: true });

      let query = {};
      if (this.state.tradeOffers && this.state.tradeOffers.length > 0) {
        const lastOffer = this.state.tradeOffers[
          this.state.tradeOffers.length - 1
        ];
        query.before = lastOffer.createdAt;
      }
      const { wantCards, offerCards } = queryString.parse(
        this.props.location.search
      );
      if (wantCards) {
        query.offerCards = wantCards; // self want === others offer
      }
      if (offerCards) {
        query.wantCards = offerCards; // self offer === others want
      }
      console.log('loading more offer:', query);

      const queryStr = queryString.stringify(query);
      const response = await fetch(
        `/api/v1/tradeoffers${queryStr ? '?' : ''}${queryStr}`
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const tradeOffers = await response.json();
      if (tradeOffers.length === 0) {
        console.log('no more offers');
        this.setState({ hasMore: false });
        return;
      }
      const newTradeOffers = this.state.tradeOffers.slice().concat(tradeOffers);
      this.setState({ tradeOffers: newTradeOffers });
    } catch (err) {
      console.log(err);
      this.setState({ hasMore: false });
    } finally {
      this.isLoading = false;
      this.setState({ isLoading: false });
    }
  };

  updateUserOffer = async () => {
    if (!this.state.user) {
      return;
    }
    try {
      const response = await fetch(`/api/v1/tradeoffers/userOffer`);
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const userOffer = await response.json();
      this.setState({ userOffer });
    } catch (err) {
      console.log(err);
    }
  };

  logout = async () => {
    const response = await fetch('/auth/logout', { method: 'POST' });
    if (response.ok) {
      this.setState({ user: null, notifications: [], userOffer: null });
    }
  };

  // searchOffer = async () => {
  //   const wantCards = [];
  //   const offerCards = [];
  //   this.state.wantCards.forEach((x, index) => {
  //     if (x) {
  //       wantCards.push(CardList[index][0].split('.')[0]);
  //     }
  //   });
  //   this.state.offerCards.forEach((x, index) => {
  //     if (x) {
  //       offerCards.push(CardList[index][0].split('.')[0]);
  //     }
  //   });
  //   this.props.history.push({
  //     pathname: '/',
  //     search: queryString.stringify({ wantCards, offerCards })
  //   });

  //   // const response = await fetch('/api/v1/tradeoffers/search', {
  //   //   method: 'POST',
  //   //   body: JSON.stringify({ wantCards, offerCards }),
  //   //   headers: new Headers({
  //   //     'Content-Type': 'application/json'
  //   //   })
  //   // });
  //   // if (!response.ok) {
  //   //   alert(`Error: ${response.statusText}`);
  //   //   return;
  //   // }

  //   // const tradeOffers = await response.json();
  //   // console.log(tradeOffers);

  //   // this.setState({ tradeOffers });
  // };

  setRead = async tradeOffer => {
    console.log('set read');
    try {
      const response = await fetch('/api/v1/tradeoffers/setRead', {
        method: 'POST',
        body: JSON.stringify({ tradeOffer }),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      });
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const newNotifications = this.state.notifications.slice();
      const idx = newNotifications.findIndex(
        x => x.tradeOffer._id === tradeOffer
      );
      console.log(idx);
      newNotifications[idx].read = true;
      this.setState({ notifications: newNotifications });
    } catch (err) {
      console.log(err);
    }
  };

  postTradeOffer = async (
    boolWantCards,
    boolOfferCards,
    availableTime,
    preferClan,
    playerName,
    playerTag
  ) => {
    const wantCards = [],
      offerCards = [];
    boolWantCards.forEach((x, index) => {
      if (x) {
        wantCards.push(CardList[index][0].split('.')[0]);
      }
    });
    boolOfferCards.forEach((x, index) => {
      if (x) {
        offerCards.push(CardList[index][0].split('.')[0]);
      }
    });
    const response = await fetch('/api/v1/tradeoffers', {
      method: 'POST',
      body: JSON.stringify({
        wantCards,
        offerCards,
        availableTime,
        preferClan,
        playerName,
        playerTag
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
    if (!response.ok) {
      alert(`Error: ${response.statusText}`);
      return;
    }
    const json = await response.json();
    console.log(json);

    await this.updateUserOffer();
    this.updateAllOffer();
  };

  postAdminOffer = async () => {
    const wantCards = [],
      offerCards = [];
    this.state.wantCards.forEach((x, index) => {
      if (x) {
        wantCards.push(CardList[index][0].split('.')[0]);
      }
    });
    this.state.offerCards.forEach((x, index) => {
      if (x) {
        offerCards.push(CardList[index][0].split('.')[0]);
      }
    });
    const response = await fetch('/api/v1/tradeoffers/postAdminOffer', {
      method: 'POST',
      body: JSON.stringify({ wantCards, offerCards }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
    if (!response.ok) {
      alert(`Error: ${response.statusText}`);
      return;
    }

    const json = await response.json();
    console.log(json);
    this.updateAllOffer();
  };

  deleteTradeOffer = async offerId => {
    // if (!window.confirm("¿ ArE yOu SuRe To DeLeTe ?")) return;
    const response = await fetch(`/api/v1/tradeOffers/${offerId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      alert(response.statusText);
      return;
    }

    await this.updateUserOffer();
    this.updateAllOffer();
  };

  render() {
    const { location } = this.props;
    const background = location.state && location.state.background;

    return (
      <div className="App" style={{ backgroundColor: 'rgb(233, 235, 238)' }}>
        <ToastContainer position="bottom-right" autoClose={8000} />
        <Navigation
          user={this.state.user}
          onClickLogout={this.logout}
          notifications={this.state.notifications}
          setRead={this.setRead}
        />
        <SlickSlider />

        <div style={{ minHeight: 'calc(100vh - 525px)' }}>
          <Switch location={background || location}>
            <Route
              exact
              path={['/', '/offers/:offerId']}
              render={props => (
                <MainPage
                  {...props}
                  userOffer={this.state.userOffer}
                  tradeOffers={this.state.tradeOffers}
                  updateUserOffer={this.updateUserOffer}
                  usingUser={this.state.user}
                  postTradeOffer={this.postTradeOffer}
                  deleteTradeOffer={this.deleteTradeOffer}
                  loadMoreOffer={this.loadMoreOffer}
                  hasMore={this.state.hasMore}
                  updateAllOffer={this.updateAllOffer}
                  postAdminOffer={undefined}
                />
              )}
            />
            <Route
              path="/subscriptions"
              render={props => (
                <SubscriptionPage
                  {...props}
                  usingUser={this.state.user}
                  postTradeOffer={this.postTradeOffer}
                  deleteTradeOffer={this.deleteTradeOffer}
                />
              )}
            />
          </Switch>
        </div>

        <Route
          path="/noOfferModal"
          render={props => (
            <ChooseCardsModal
              {...props}
              usingUser={this.state.usingUser}
              postTradeOffer={this.postTradeOffer}
            />
          )}
        />

        <Route
          path="/offers/:offerId"
          render={props => (
            <TradeOfferModal
              {...props}
              user={this.state.user}
              postTradeOffer={this.postTradeOffer}
              deleteTradeOffer={this.deleteTradeOffer}
              handleLocalLikeClick={this.handleLocalLikeClick}
            />
          )}
        />

        <Segment
          inverted
          style={{
            margin: '0rem 0rem 0rem',
            padding: '2rem 0rem',
            borderRadius: '0rem'
          }}
        >
          <Container textAlign="left">
            <Grid inverted>
              <Grid.Row>
                <Grid.Column>
                  <a href="https://github.com">
                    <Icon name="github" size="large" />
                    <span style={{ verticalAlign: 'middle' }}>Source</span>
                  </a>
                </Grid.Column>
              </Grid.Row>
            </Grid>
            <Divider inverted section />
            <Grid inverted stackable>
              <Grid.Row>
                <Grid.Column>
                  <p style={{ color: 'rgb(102, 102, 102)', fontSize: '14px' }}>
                    This content is not affiliated with, endorsed, sponsored, or
                    specifically approved by Supercell and Supercell is not
                    responsible for it. For more information see Supercell’s{' '}
                    <a href="https://supercell.com/en/fan-content-policy/">
                      Fan Content Policy
                    </a>
                    .
                  </p>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Container>
        </Segment>
      </div>
    );
  }
}

const AppWithRouter = withRouter(App);
export default AppWithRouter;
