import queryString from 'query-string';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Header,
  Loader,
  Rail,
  Ref,
  Responsive,
  Sticky
} from 'semantic-ui-react';

import CardList from './CardList';
import ChooseCards from './ChooseCards';
import NoOfferCard from './NoOfferCard';
import TradeOffer from './TradeOffer';

export default class MainPage extends React.Component {
  deriveStateFromQueryString = () => {
    const { wantCards, offerCards } = queryString.parse(
      this.props.location.search
    );
    const boolWantCards = CardList.map(x =>
      Array.isArray(wantCards)
        ? wantCards.includes(x[0].split('.')[0])
        : wantCards === x[0].split('.')[0]
    );
    const boolOfferCards = CardList.map(x =>
      Array.isArray(offerCards)
        ? offerCards.includes(x[0].split('.')[0])
        : offerCards === x[0].split('.')[0]
    );
    return {
      boolWantCards,
      boolOfferCards,
      step: wantCards || offerCards ? 3 : 1
    };
  };

  state = {
    // step: 1,
    ...this.deriveStateFromQueryString()
  };

  contextRef = React.createRef();

  componentDidUpdate(prevProps) {
    if (this.props.location.search !== prevProps.location.search) {
      // query string changed, refreshing all offers
      console.log('prev query:', prevProps.location.search);
      console.log('curr query:', this.props.location.search);
      this.props.updateAllOffer();
      this.setState(this.deriveStateFromQueryString());
    }
  }

  handleWant = index => {
    this.setState(state => ({
      boolWantCards: state.boolWantCards.map((x, i) => (i === index ? !x : x))
    }));
  };

  handleOffer = index => {
    this.setState(state => ({
      boolOfferCards: state.boolOfferCards.map((x, i) => (i === index ? !x : x))
    }));
  };

  searchOffer = () => {
    const wantCards = this.state.boolWantCards
      .map((x, i) => x && CardList[i][0].split('.')[0])
      .filter(x => x);
    const offerCards = this.state.boolOfferCards
      .map((x, i) => x && CardList[i][0].split('.')[0])
      .filter(x => x);
    this.props.history.push({
      pathname: '/',
      search: queryString.stringify({ wantCards, offerCards })
    });
  };

  render() {
    return (
      <div
        style={{
          paddingTop: '2rem',
          paddingBottom: '2rem'
        }}
      >
        <Container text>
          <Ref innerRef={this.contextRef}>
            <Grid>
              <Grid.Column>
                <Grid divided="vertically">
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
                        usingUser={this.props.usingUser}
                      />
                      <div
                        style={this.state.step >= 2 ? {} : { display: 'none' }}
                      >
                        <ChooseCards
                          choosable={this.state.step === 2}
                          header={<FormattedMessage id="offerCard" />}
                          title={<FormattedMessage id="selectAll" />}
                          choosed={this.state.boolOfferCards}
                          onToggle={this.handleOffer}
                          onClickNext={() => {
                            this.searchOffer();
                            this.setState({ step: 3 });
                          }}
                          onClickExpand={() => this.setState({ step: 2 })}
                          buttonText={<FormattedMessage id="search" />}
                          usingUser={this.props.usingUser}
                          postAdminOffer={this.props.postAdminOffer}
                        />
                      </div>

                      <Responsive as={Rail} position="right" close>
                        <Sticky context={this.contextRef} offset={77}>
                          {/* <TradeOfferButtom></TradeOfferButtom> */}
                          {this.props.userOffer ? (
                            <Link
                              to={{
                                pathname: `/offers/${this.props.userOffer._id}`,
                                state: { background: this.props.location }
                              }}
                            >
                              <TradeOffer
                                updateUserOffer={this.props.updateUserOffer}
                                offerId={this.props.userOffer.offerId}
                                author={this.props.userOffer.user}
                                playerName={this.props.userOffer.playerName}
                                playerTag={this.props.userOffer.playerTag}
                                subscriber={this.props.userOffer.subscriber}
                                avatar={this.props.usingUser.photo}
                                wantCards={this.props.userOffer.wantCards}
                                offerCards={this.props.userOffer.offerCards}
                                createdAt={this.props.userOffer.createdAt}
                                usingUser={this.props.usingUser}
                                availableTime={
                                  this.props.userOffer.availableTime
                                }
                                preferClan={this.props.userOffer.preferClan}
                                postTradeOffer={this.props.postTradeOffer}
                                deleteTradeOffer={this.props.deleteTradeOffer}
                                wantLen={2}
                                offerLen={6}
                              />
                            </Link>
                          ) : (
                            <NoOfferCard
                              usingUser={this.props.usingUser}
                              postTradeOffer={this.props.postTradeOffer}
                              location={this.props.location}
                            />
                          )}
                        </Sticky>
                      </Responsive>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column>
                      <InfiniteScroll
                        pageStart={0}
                        loadMore={this.props.loadMoreOffer}
                        hasMore={this.props.hasMore}
                        loader={
                          <Loader active size="small" inline="centered" key={0}>
                            loading
                          </Loader>
                        }
                        useWindow={false}
                      >
                        {this.props.tradeOffers.length > 0 ? (
                          <Grid divided="vertically">
                            {this.props.tradeOffers.map(x => (
                              <Grid.Row key={x._id}>
                                <Grid.Column>
                                  <Link
                                    to={{
                                      pathname: `/offers/${x._id}`,
                                      state: { background: this.props.location }
                                    }}
                                  >
                                    <TradeOffer
                                      offerId={x._id}
                                      author={x.user}
                                      avatar={x.user.photo}
                                      playerName={x.playerName}
                                      playerTag={x.playerTag}
                                      usingUser={this.props.usingUser}
                                      wantCards={x.wantCards}
                                      offerCards={x.offerCards}
                                      createdAt={x.createdAt}
                                      subscriber={x.subscriber}
                                      availableTime={x.availableTime}
                                      preferClan={x.preferClan}
                                      postTradeOffer={this.props.postTradeOffer}
                                      deleteTradeOffer={
                                        this.props.deleteTradeOffer
                                      }
                                      wantLen={6}
                                      offerLen={24}
                                    />
                                  </Link>
                                </Grid.Column>
                              </Grid.Row>
                            ))}
                          </Grid>
                        ) : (
                          <Header as="h3" disabled textAlign="center">
                            <FormattedMessage id="noOffers" />
                          </Header>
                        )}
                      </InfiniteScroll>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Grid.Column>
            </Grid>
          </Ref>
        </Container>
      </div>
    );
  }
}
