import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Dropdown, Icon, Image, Label, Menu } from 'semantic-ui-react';

export default class Navigation extends React.Component {
  state = {
    isOpen: false
  };

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  render() {
    const unreadNum = this.props.notifications.filter(x => !x.read).length;
    return (
      <Menu fixed="top" inverted style={{ height: '3.5rem', zIndex: '900' }}>
        <Menu.Item header href="/">
          RoyaleTrade
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item
            link
            icon="heart"
            as={Link}
            to="/subscriptions"
          ></Menu.Item>
          <Dropdown
            item
            icon={
              <div style={{ position: 'relative' }}>
                <Icon name="bell" style={{ marginRight: '0rem' }} />
                {unreadNum > 0 ? (
                  <Label
                    color="red"
                    floating
                    size="small"
                    style={{ padding: '0.2em' }}
                  >
                    {unreadNum}
                  </Label>
                ) : (
                  ''
                )}
              </div>
            }
            className="right"
            scrolling
          >
            <Dropdown.Menu className="notification">
              {this.props.notifications &&
              this.props.notifications.length > 0 ? (
                this.props.notifications.map((x, i) => (
                  <React.Fragment key={x.tradeOffer ? x.tradeOffer._id : i}>
                    {/* {i > 0 ? <Dropdown.Divider /> : ''} */}
                    {x.tradeOffer ? (
                      <Dropdown.Item
                        as={Link}
                        className={`notification ${!x.read ? 'unread' : ''}`}
                        onClick={() => {
                          this.props.setRead(x.tradeOffer._id);
                        }}
                        to={{
                          pathname: `/offers/${x.tradeOffer._id}`,
                          state: { background: this.props.location }
                        }}
                      >
                        <Image avatar src={x.lastUser.photo} />
                        <div>
                          <FormattedMessage
                            id="notifyText"
                            values={{
                              lastUser: x.lastUser.name,
                              otherUserNum: x.users.length - 1,
                              authorIsSelf:
                                this.props.user &&
                                x.tradeOffer.user._id === this.props.user._id,
                              author: x.tradeOffer.user.name
                            }}
                          />
                        </div>
                      </Dropdown.Item>
                    ) : (
                      <Dropdown.Item
                        className={`notification ${!x.read ? 'unread' : ''}`}
                      >
                        <FormattedMessage id="removed" />
                      </Dropdown.Item>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <Dropdown.Item>
                  <FormattedMessage id="noNotification" />
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
          {this.props.user ? (
            <>
              <Menu.Item link>{this.props.user.name}</Menu.Item>
              <Menu.Item link onClick={this.props.onClickLogout}>
                <FormattedMessage id="logout" />
              </Menu.Item>
            </>
          ) : (
            <Menu.Item href="/auth/google">
              <FormattedMessage id="login" />
            </Menu.Item>
          )}
        </Menu.Menu>
      </Menu>
    );
  }
}
