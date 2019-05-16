import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Dropdown } from '@folio/stripes-components/lib/Dropdown';
import NavList from '@folio/stripes-components/lib/NavList';
import NavListSection from '@folio/stripes-components/lib/NavListSection';
import NavListItem from '@folio/stripes-components/lib/NavListItem';
import Icon from '@folio/stripes-components/lib/Icon';

import NavDropdownMenu from '../NavDropdownMenu';
import NavButton from '../NavButton';

class LocaleDropdown extends Component {
  static propTypes = {
    stripes: PropTypes.shape({
      setLocale: PropTypes.func,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {};

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.getDropdownContent = this.getDropdownContent.bind(this);
  }

  setInitialState(callback) {
    this.setState({
      dropdownOpen: false,
    }, callback);
  }

  toggleDropdown() {
    this.setState(({ dropdownOpen }) => ({
      dropdownOpen: !dropdownOpen
    }));
  }

  setLocale = (locale) => {
    if (locale) this.props.stripes.setLocale(locale.value);
  };

  getDropdownContent = () => {
    const locales = [
      { value: 'ar-AR', label: <FormattedMessage id="ui-developer.sessionLocale.ar-AR" /> },
      { value: 'zh-CN', label: <FormattedMessage id="ui-developer.sessionLocale.zh-CN" /> },
      { value: 'da-DK', label: <FormattedMessage id="ui-developer.sessionLocale.da-DK" /> },
      { value: 'en-GB', label: <FormattedMessage id="ui-developer.sessionLocale.en-GB" /> },
      { value: 'en-SE', label: <FormattedMessage id="ui-developer.sessionLocale.en-SE" /> },
      { value: 'en-US', label: <FormattedMessage id="ui-developer.sessionLocale.en-US" /> },
      { value: 'de-DE', label: <FormattedMessage id="ui-developer.sessionLocale.de-DE" /> },
      { value: 'hu-HU', label: <FormattedMessage id="ui-developer.sessionLocale.hu-HU" /> },
      { value: 'it-IT', label: <FormattedMessage id="ui-developer.sessionLocale.it-IT" /> },
      { value: 'pt-BR', label: <FormattedMessage id="ui-developer.sessionLocale.pt-BR" /> },
      { value: 'pt-PT', label: <FormattedMessage id="ui-developer.sessionLocale.pt-PT" /> },
      { value: 'es', label: <FormattedMessage id="ui-developer.sessionLocale.es" /> },
      { value: 'es-419', label: <FormattedMessage id="ui-developer.sessionLocale.es-419" /> },
      { value: 'es-ES', label: <FormattedMessage id="ui-developer.sessionLocale.es-ES" /> },
    ];

    return (
      <NavList>
        <NavListSection>
          {locales.map(locale => (
            <NavListItem id={`clickable-locale-${locale.value}`} type="button" onClick={() => this.setLocale(locale)}>
              {locale.label}
            </NavListItem>
          ))}
        </NavListSection>
      </NavList>
    );
  }

  render() {
    const { dropdownOpen, HandlerComponent } = this.state;

    return (
      <Fragment>
        { HandlerComponent && <HandlerComponent stripes={this.props.stripes} /> }
        <Dropdown open={dropdownOpen} id="profileDropdown" onToggle={this.toggleDropdown} pullRight hasPadding>
          <NavButton
            data-role="toggle"
            ariaLabel="My Profile"
            selected={dropdownOpen}
            icon={<Icon icon="flag" />}
          />
          <NavDropdownMenu data-role="menu" onToggle={this.toggleDropdown}>
            {this.getDropdownContent()}
          </NavDropdownMenu>
        </Dropdown>
      </Fragment>
    );
  }
}

export default LocaleDropdown;
