import React, {
  useState,
  useEffect,
} from 'react';
import { useIntl } from 'react-intl';
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

const rulesLimit = 100;

const PasswordRequirementsList = ({ passwordValue }) => {
  const intl = useIntl();

  const [requiredRules, setRequiredRules] = useState([]);
  const [unfulfilledRules, setUnfulfilledRules] = useState([]);

  const { rules } = usePasswordRules(rulesLimit);

  useEffect(() => {
    if (requiredRules.length <= 0 && rules?.length > 0) {
      const requiredRulesSet = rules
        .filter(rule => passwordRequirementsNames.includes(rule.name))
        .map(rule => {
          // modify rule string away from the "The password must <rule description>"
          // to the "Must <rule description>"

          // not all rules start exactly with "The password must", there might be
          // additional words between, so we need to get the part after "must"
          // which is the rule requirement and will be on index 1 in the array...
          const splittedRuleDescription = rule.description.split(' must ');

          // ...and use that rule requirement in a translation string
          // which is assigned to the description field of the rule
          rule.description = intl.formatMessage(
            { id: 'stripes-core.createResetPassword.ruleTemplate' },
            { description: splittedRuleDescription[1] },
          );

          return rule;
        });

      setRequiredRules(requiredRulesSet);
    }
  }, [
    intl,
    rules,
    requiredRules.length,
  ]);

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
            <li key={rule.ruleId}>
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
