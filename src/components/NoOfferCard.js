import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Button,Card } from 'semantic-ui-react';

export default class NoOfferCard extends React.Component {

  // state = {
  //   showNewOfferModal: false
  // }

  // handleMakeOfferButton = (event) => {
  //   this.setState({ showNewOfferModal: !this.state.showNewOfferModal});
  // }

  render() {
    return (
      <Card className="d-flex cursor-pointer flex-fill" style={{ maxWidth: '750px' }}>
        <Card.Content>
          <Card.Header><FormattedMessage id='myTradeOffer'/></Card.Header>
          <Card.Meta>#TAG</Card.Meta>
        </Card.Content>
        <Card.Content>
          {!this.props.usingUser ?
            <Button href="/auth/google" primary><FormattedMessage id='login'/></Button>
            :
            <Link
              to={{
                pathname: '/noOfferModal',
                state: { background: this.props.location }
              }}
            >
              <Button primary><FormattedMessage id='makeOffer'/></Button>
            </Link>
          }
        </Card.Content>
      </Card>
        // {/* <CardHeader>  
        //   <div>
        //     <h3 className="mb-0">Make your Recipe!</h3>
        //     <h5 className="mb-0">#tag</h5>
        //   </div>
        // </CardHeader>
        // <CardBody className="d-flex justify-content-center">
        //   {(!this.props.usingUser)?
        //     <Button href="/auth/google" primary>Login</Button>
        //     :
        //     <Button primary onClick={this.handleMakeOfferButton}>Make your offer!</Button>
        //   }
        // </CardBody>
        // <CardFooter>prefer clans and time </CardFooter> */}
        // {/* <ChooseCardsModal
        //   showModal={this.state.showNewOfferModal}
        //   toggle={this.handleMakeOfferButton}
        //   usingUser={this.props.usingUser}
        //   postTradeOffer={this.props.postTradeOffer}
        //   button2Text={<FormattedMessage id='Done'/>}
        //   handleMakeOfferButton={this.handleMakeOfferButton}
        // /> */}
      
    )
  };

}

