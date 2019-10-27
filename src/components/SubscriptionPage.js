import queryString from 'query-string';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Container, Divider, Grid, Header, Loader } from 'semantic-ui-react';

import TradeOffer from './TradeOffer';

export default class SubscriptionPage extends React.Component {
  state = {
    tradeOffers: [],
    hasMore: true,
    isLoading: false
  };

  isLoading = false;

  // async componentDidMount() {
  //   try {
  //     const response = await fetch('/api/v1/userSubscriptions');
  //     if (!response.ok) {
  //       throw Error(response.statusText);
  //     }
  //     const tradeOffers = await response.json();
  //     console.log('/api/v1/subscriptions', tradeOffers);
  //     this.setState({ tradeOffers });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  loadMoreSubScription = async () => {
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
      console.log('loading more subscription:', query);

      const queryStr = queryString.stringify(query);
      const response = await fetch(
        `/api/v1/subscription/${queryStr ? '?' : ''}${queryStr}`
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

  render() {
    return (
      <Container text style={{paddingTop: '2rem'}}>
        
        <Grid>
          <Grid.Row verticalAlign='middle'>
            <Grid.Column>
              <Header as='h1'><FormattedMessage id='subscriptionTitle'/></Header>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider/>
        <InfiniteScroll
          pageStart={0}
          loadMore={this.loadMoreSubScription}
          hasMore={this.state.hasMore}
          loader={
            <Loader active size="small" inline="centered" key={0}>
              loading
            </Loader>
          }
          useWindow={false}
        >
          <Grid divided="vertically">
            {this.state.tradeOffers.map(x => (
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
                      deleteTradeOffer={this.props.deleteTradeOffer}
                      wantLen={6}
                      offerLen={24}
                    />
                  </Link>
                </Grid.Column>
              </Grid.Row>
            ))}
          </Grid>
        </InfiniteScroll>
        {(!this.state.hasMore && this.state.tradeOffers.length === 0)?
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <h3><FormattedMessage id='noSubscription'/></h3>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          :
            ''
        }
      </Container>

        // {/* //   {this.state.tradeOffers.length > 0 ? (
        // //     this.state.tradeOffers.map(x => (
        // //       <Grid.Row
        // //         key={x._id}
        // //         style={{ paddingTop: '0px', paddingBottom: '0px' }}
        // //       >
        // //         <Grid.Column>
        // //           <Link
        // //             to={{
        // //               pathname: `/offers/${x._id}`,
        // //               state: { background: this.props.location }
        // //             }}
        // //           >
        // //             <TradeOffer
        // //               offerId={x._id}
        // //               author={x.user}
        // //               avatar={x.user.photo}
        // //               usingUser={this.props.usingUser}
        // //               wantCards={x.wantCards}
        // //               offerCards={x.offerCards}
        // //               createdAt={x.createdAt}
        // //               subscriber={x.subscriber}
        // //               availableTime={x.availableTime}
        // //               preferClan={x.preferClan}
        // //               postTradeOffer={this.props.postTradeOffer}
        // //               deleteTradeOffer={this.props.deleteTradeOffer}
        // //             />
        // //           </Link>
        // //         </Grid.Column>
        // //       </Grid.Row>
        // //     ))
        // //   ) : (
            
        // //   )}
        // // </Grid> */}
        
      
    );
  }
}
