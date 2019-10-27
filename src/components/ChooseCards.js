import './ChooseCards.css';

import React from 'react';
import { Collapse } from 'react-collapse';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Button, Card, Form, Grid } from 'semantic-ui-react';

import CardList from './CardList';

class ChooseCards extends React.Component {
  // state = {
  //   textAreaTime: '',
  //   textAreaClan: '',
  // }

  // handleOnChangeTime = (event) => {
  //   if (event.target.value.length > 100) {
  //     console.log('textarea Time too long.');
  //     return;
  //   }
  //   this.setState({ textAreaTime: event.target.value });
  // }

  // handleOnChangeClan = (event) => {
  //   if (event.target.value.length > 50) {
  //     console.log('textarea clan too long.');
  //     return;
  //   }
  //   this.setState({ textAreaClan: event.target.value });
  // }

  render() {
    const { intl } = this.props;
    const chosenCards = CardList.filter(
      (_, index) => this.props.choosed[index]
    );
    return (
      <Card fluid>
        <Card.Content>
          <Card.Header
            style={{ cursor: 'pointer' }}
            onClick={this.props.onClickExpand}
          >
            {this.props.header}
          </Card.Header>
          <Collapse isOpened={this.props.choosable}>
            <Grid stackable>
              <Grid.Row>
                <Grid.Column>
                  <Card.Meta>{this.props.title}</Card.Meta>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column textAlign="center">
                  {CardList.map((x, index) => (
                    <img
                      key={x[0]}
                      className={`royale-card ${
                        this.props.choosed[index] ? 'selected' : 'unselected'
                      }`}
                      onClick={() => this.props.onToggle(index)}
                      src={`/images/cards/${x[0]}`}
                      alt={x[0]}
                    />
                  ))}
                </Grid.Column>
              </Grid.Row>

              {this.props.checkSecond ? (
                <Grid.Row>
                  <Grid.Column>
                    <Form>
                      <Form.Group widths="equal">
                        <Form.Input
                          fluid
                          name="player-name"
                          value={this.props.textAreaPlayerName}
                          onChange={this.props.handleOnChangePlayerName}
                          label={intl.formatMessage({ id: 'playerName' })}
                          placeholder={intl.formatMessage({ id: 'playerName' })}
                          error={
                            this.props.emptyPlayerNameError
                              ? intl.formatMessage({ id: 'enterPlayerName' })
                              : false
                          }
                          icon="user"
                          iconPosition="left"
                        />
                        <Form.Input
                          fluid
                          name="player-tag"
                          value={this.props.textAreaPlayerTag}
                          onChange={this.props.handleOnChangePlayerTag}
                          label={intl.formatMessage({ id: 'playerTag' })}
                          placeholder={intl.formatMessage({ id: 'playerTag' })}
                          icon="hashtag"
                          iconPosition="left"
                        />
                      </Form.Group>
                      <Form.Group widths="equal">
                        <Form.Input
                          fluid
                          name="prefer-clan"
                          value={this.props.textAreaClan}
                          onChange={this.props.handleOnChangeClan}
                          label={intl.formatMessage({ id: 'preferClan' })}
                          placeholder={intl.formatMessage({ id: 'clanEg' })}
                          error={
                            this.props.emptyClanError
                              ? intl.formatMessage({ id: 'enterClan' })
                              : false
                          }
                          icon="tag"
                          iconPosition="left"
                        />
                        <Form.Input
                          fluid
                          name="available-time"
                          value={this.props.textAreaTime}
                          onChange={this.props.handleOnChangeTime}
                          label={intl.formatMessage({ id: 'availableTime' })}
                          placeholder={intl.formatMessage({ id: 'timeEg' })}
                          error={
                            this.props.emptyTimeError
                              ? intl.formatMessage({ id: 'enterTime' })
                              : false
                          }
                          icon="clock"
                          iconPosition="left"
                        />
                      </Form.Group>
                    </Form>
                  </Grid.Column>
                </Grid.Row>
              ) : (
                ''
              )}

              <Grid.Row centered>
                <Grid.Column width={3}>
                  <Button primary fluid onClick={this.props.onClickNext}>
                    {this.props.buttonText}
                  </Button>
                </Grid.Column>
                {this.props.postAdminOffer ? (
                  <Grid.Column width={3}>
                    <Button secondary fluid onClick={this.props.postAdminOffer}>
                      Admin Post
                    </Button>
                  </Grid.Column>
                ) : (
                  ''
                )}
              </Grid.Row>
            </Grid>
          </Collapse>
          <Collapse isOpened={!this.props.choosable}>
            {chosenCards.length > 0 ? (
              chosenCards.map(x => (
                <img
                  key={x[0]}
                  className="royale-card selected"
                  onClick={this.props.onClickExpand}
                  src={`/images/cards/${x[0]}`}
                  alt={x[0]}
                />
              ))
            ) : (
              <FormattedMessage id="allOk" />
            )}
          </Collapse>
        </Card.Content>
      </Card>
      // <Card className="mt-3 mb-3">
      //   <CardHeader tag="h3"  style={{ fontWeight: 300, cursor: 'pointer' }} onClick={this.props.onClickExpand}>{this.props.header}</CardHeader>
      //   <CardBody>
      //     <Collapse isOpen={this.props.choosable}>
      //       <Container>
      //         <Row><Col>
      //           <CardTitle className="text-muted" tag="h6" style={{ fontWeight: 300 }}>{this.props.title}</CardTitle>
      //         </Col></Row>
      //         <Row><Col>
      //           {CardList.map((x, index) => (
      //             <img
      //               key={x[0]}
      //               className={`royale-card ${this.props.choosed[index] ? 'selected' : 'unselected'}`}
      //               onClick={() => this.props.onToggle(index)}
      //               src={`/images/cards/${x[0]}`}
      //               alt={x[0]}
      //             />
      //           ))}
      //         </Col></Row>
      //         <Row className="my-3">
      //           <Col className="d-flex justify-content-center">
      //             <Button color="primary" onClick={this.props.onClickNext}>{this.props.buttonText}</Button>
      //           </Col>
      //           {(this.props.usingUser && this.props.usingUser.admin && this.props.header === "Cards you can Offer?") ?
      //             <Button color="primary" onClick={this.props.postAdminOffer}>Admin Post</Button>
      //             :
      //             <div></div>
      //             }
      //         </Row>
      //       </Container>
      //     </Collapse>
      //     <Collapse isOpen={!this.props.choosable}>
      //       {CardList.filter((_, index) => this.props.choosed[index]).map(x => (
      //         <img
      //           key={x[0]}
      //           className="royale-card selected"
      //           onClick={this.props.onClickExpand}
      //           src={`/images/cards/${x[0]}`}
      //           alt={x[0]}
      //         />
      //       ))}
      //     </Collapse>
      //   </CardBody>
      // </Card>
    );
  }
}

export default injectIntl(ChooseCards);
