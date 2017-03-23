import React, { PropTypes } from 'react';

import NavList from './NavList';
import NavListSection from './NavListSection';

import css from './Settings.css';

// Should be replaced with something dynamically generated....
import UsersSettings from '@folio/users/settings'; // eslint-disable-line
const SettingsConfig = [
  { name: 'Users', settingsPath: '@folio/users/settings', component: UsersSettings },
];

class Settings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      settingsPage: 'UsersSettings',
      settingsPaths: SettingsConfig,
    };

    this.onNavClick = this.onNavClick.bind(this);
  }

  onNavClick(e) {
    e.preventDefault();
    const href = e.target.href;
    const page = href.substring(href.indexOf('#') + 1);
    this.setState({ settingsPage: page });
  }

  getPage() {
    const result = this.state.settingsPaths.filter(
      obj => obj.component.name === this.state.settingsPage,
    );
    const Component = result[0].component;
    return <Component stripes={this.props.stripes} />;
  }

  render() {
    const navLinks = this.state.settingsPaths.map(
      page => (
        <a
          key={`${page.component.name}-Link`}
          href={`#${page.component.name}`}
          onClick={this.onNavClick}
        >
          {page.name}
        </a>
      ),
    );

    return (
      <div className={css.paneset}>
        <div className={css.navPane} style={{ width: '20%' }}>
          <div className={css.header}>
            <span>Settings</span>
          </div>
          <div className={css.content}>
            <NavList>
              <NavListSection label="App Settings" activeLink={`#${this.state.settingsPage}`}>
                {navLinks}
              </NavListSection>
            </NavList>
          </div>
        </div>

        {this.getPage()}

      </div>
    );
  }
}

export default Settings;
