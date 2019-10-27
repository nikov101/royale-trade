import './ChooseCards.css';

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Container } from 'semantic-ui-react';
import { Modal } from 'semantic-ui-react';

import CardList from './CardList';
import ChooseCards from './ChooseCards';

export default class ChooseCardsModal extends React.Component{

  state = {
    sendButtonToggle: true,
    step: 1,
    wantCards: CardList.map(_ => false),
    offerCards: CardList.map(_ => false),
    textAreaTime: '',
    textAreaClan: '',
    textAreaPlayerName: '',
    textAreaPlayerTag: '',
    emptyTimeError: false,
    emptyClanError: false,
    emptyPlayerNameError: false,
  };

  // toggle = () => {
  //   this.setState({ showModal: !this.state.showModal }
  //   );
  // };

  goHome = () => {
    const { history, location } = this.props;
    if (location.state && location.state.background) {
      history.goBack();
    } else {
      history.replace('/');
    }
  };

  handleWant = index => {
    let choosed = this.state.wantCards.slice();
    choosed[index] = !choosed[index];
    this.setState({ 
      wantCards: choosed
    });
  };

  handleOffer = index => {
    let choosed = this.state.offerCards.slice();
    choosed[index] = !choosed[index];
    this.setState({
      offerCards: choosed
    });
  };

  handleOnChangePlayerName = (event) => {
    if (event.target.value.length > 20) {
      console.log('textarea Name too long.');
      return;
    }
    this.setState({
      textAreaPlayerName: event.target.value,
      emptyPlayerNameError: event.target.value.length === 0
    });
  }

  handleOnChangePlayerTag = (event) => {
    if (event.target.value.length > 15) {
      console.log('textarea Tag too long.');
      return;
    }
    this.setState({ textAreaPlayerTag: event.target.value });
  }

  handleOnChangeTime = (event) => {
    if (event.target.value.length > 100) {
      console.log('textarea Time too long.');
      return;
    }
    this.setState({
      textAreaTime: event.target.value,
      emptyTimeError: event.target.value.length === 0
    });
  }

  handleOnChangeClan = (event) => {
    if (event.target.value.length > 50) {
      console.log('textarea clan too long.');
      return;
    }
    this.setState({ 
      textAreaClan: event.target.value,
      emptyClanError: event.target.value.length === 0
    });
  }

  postTradeOffer = async () => {
    if (this.state.textAreaTime.length === 0 
        || this.state.textAreaClan.length === 0 
        || this.state.textAreaPlayerName.length === 0) {
      this.setState({
        emptyTimeError: this.state.textAreaTime.length === 0,
        emptyClanError: this.state.textAreaClan.length === 0,
        emptyPlayerNameError: this.state.textAreaPlayerName.length === 0
      });
      console.log('empty textarea no time or clan or name');
      return;
    }
    await this.props.postTradeOffer(
      this.state.wantCards, 
      this.state.offerCards, 
      this.state.textAreaTime, 
      this.state.textAreaClan,
      this.state.textAreaPlayerName,
      this.state.textAreaPlayerTag
    );
    this.goHome();
  };

  render() {
    return (
      <div>
        <Modal open onClose={this.goHome} size="large">
          <Modal.Header>{<FormattedMessage id='myTradeOffer'/>}</Modal.Header>
          <Modal.Content>
            <Container>
              {/* <Row>
                <Col> */}
                  <ChooseCards
                    choosable={this.state.step === 1}
                    header={<FormattedMessage id='wantCard'/>}
                    title={<FormattedMessage id='selectAll'/>}
                    choosed={this.state.wantCards}
                    onToggle={this.handleWant}
                    onClickNext={() => this.setState({ step: 2 })}
                    onClickExpand={() => this.setState({ step: 1 })}
                    buttonText={<FormattedMessage id="next"/>}
                    usingUser={this.props.usingUser}
                  />
                {/* </Col>
              </Row> */}
              {/* <Row>
                <Col> */}
                {this.state.step >= 2 ?  
                  <ChooseCards
                    choosable={this.state.step === 2}
                    header={<FormattedMessage id='offerCard'/>}
                    title={<FormattedMessage id='selectAll'/>}
                    choosed={this.state.offerCards}
                    onToggle={this.handleOffer}
                    onClickNext={() => {this.postTradeOffer();}/*() => this.setState({ step: 3 })*/}
                    onClickExpand={() => this.setState({ step: 2 })}
                    buttonText={<FormattedMessage id='Done'/>}
                    checkSecond={true}
                    usingUser={this.props.usingUser}
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
                  :
                  <div></div>
                }
                {/* </Col>
              </Row> */}
            </Container>
          </Modal.Content>
        </Modal>
      </div>
    );
  }
};

