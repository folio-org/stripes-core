import React from 'react';
import PropTypes from 'prop-types';

import { Layout } from '@folio/stripes-components';

import styles from './PasswordRequirementsField.css';

const passwordRequirementsNames = [
  'password_length',
  'numeric_symbol',
  'special_character',
  'alphabetical_letters',
];

class PasswordRequirementsField extends React.Component {
  static manifest = Object.freeze({
    validators: {
      type: 'okapi',
      path: 'tenant/rules',
      throwErrors: false,
      fetch: false,
      accumulate: true,
    },
  });

  static propTypes = {
    mutator: PropTypes.shape({
      validators: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    passwordValue: PropTypes.string,
    token: PropTypes.string,
  };

  async componentDidMount() {
    this.rules = await this.getRules();
  }

  async getRules() {
    const {
      mutator,
      token,
    } = this.props;

    const headers = token
      ? { headers: { 'x-okapi-token': token } }
      : {};

    const { rules } = await mutator.validators.GET(headers);

    return rules
      .filter(rule => passwordRequirementsNames.includes(rule.name))
      .map(rule => {
        const splittedRuleDescription = rule.description.split(' must ');

        rule.description = `Must ${splittedRuleDescription[1]}`;

        return rule;
      });
  }

  render() {
    const { passwordValue } = this.props;

    const compareNewPasswordToRules = () => {
      this.unfulfilledRules = this.rules?.filter(rule => !new RegExp(rule.expression).test(passwordValue));

      return (
        this.unfulfilledRules?.length
          ? (
            <ul
              data-test-password-requirements-field
              className={styles.rulesList}
            >
              {
                this.unfulfilledRules?.map(rule => (
                  <li key={rule.id}>
                    {rule.description}
                  </li>
                ))
              }
            </ul>
          )
          : null
      );
    };

    return (
      passwordValue
        ? (
          <Layout className="textLeft">
            {compareNewPasswordToRules()}
          </Layout>
        )
        : null
    );
  }
}

export default PasswordRequirementsField;
