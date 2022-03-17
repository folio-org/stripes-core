import React, {
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

import { Layout } from '@folio/stripes-components';

import usePasswordRules from './queries';

import styles from './PasswordRequirementsList.css';

const passwordRequirementsNames = [
  'password_length',
  'numeric_symbol',
  'special_character',
  'alphabetical_letters',
];

const PasswordRequirementsList = ({ passwordValue }) => {
  const [requiredRules, setRequiredRules] = useState([]);
  const [unfulfilledRules, setUnfulfilledRules] = useState([]);

  const { rules } = usePasswordRules();

  useEffect(() => {
    if (requiredRules.length <= 0 && rules?.length > 0) {
      const requiredRulesSet = rules
        .filter(rule => passwordRequirementsNames.includes(rule.name))
        .map(rule => {
          const splittedRuleDescription = rule.description.split(' must ');

          rule.description = `Must ${splittedRuleDescription[1]}`;

          return rule;
        });

      setRequiredRules(requiredRulesSet);
    }
  }, [rules, requiredRules.length]);

  useEffect(() => {
    const unfulfilledRulesSet = requiredRules?.filter(rule => !new RegExp(rule.expression).test(passwordValue));

    setUnfulfilledRules(unfulfilledRulesSet);
  }, [
    passwordValue,
    requiredRules,
    unfulfilledRules.length,
  ]);

  const rulesList = unfulfilledRules?.length
    ? (
      <ul
        data-test-password-requirements-field
        className={styles.rulesList}
      >
        {
          unfulfilledRules?.map(rule => (
            <li key={rule.id}>
              {rule.description}
            </li>
          ))
        }
      </ul>
    )
    : null;

  return (
    passwordValue
      ? (
        <Layout className="textLeft">
          {rulesList}
        </Layout>
      )
      : null
  );
};

PasswordRequirementsList.propTypes = {
  passwordValue: PropTypes.string,
};

export default PasswordRequirementsList;
