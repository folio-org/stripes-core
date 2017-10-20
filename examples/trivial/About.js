import React from 'react';
import PropTypes from 'prop-types';
import css from './trivial.css';

class About extends React.Component {
  static propTypes = {
    dataKey: PropTypes.string,
    resources: PropTypes.shape({
      greetingParams: PropTypes.shape({
        greeting: PropTypes.string,
        name: PropTypes.string,
      }),
    }),
    mutator: PropTypes.shape({
      greetingParams: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }),
    }),
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const dk = this.props.dataKey || '';
    this.props.mutator.greetingParams.replace({
      greeting: document.getElementById(`g${dk}`).value,
      name: document.getElementById(`n${dk}`).value });
  };

  render() {
    const dk = this.props.dataKey || '';
    let greeting;
    if (this.props.resources.greetingParams) {
      greeting = <h3>{this.props.resources.greetingParams.greeting} {this.props.resources.greetingParams.name}</h3>;
    } else {
      greeting = <h3>No one here :(</h3>;
    }
    return (
      <div className={css.root}>
        {greeting}
        <form onSubmit={this.handleSubmit}>
          <label className={css.label} htmlFor={`g${dk}`}>Greeting:</label> <input className={css.textInput} id={`g${dk}`} type="text" />
          <label className={css.label} htmlFor={`n${dk}`}>Person:</label> <input className={css.textInput} id={`n${dk}`} type="text" />
          <button className={css.button} type="submit">Greet</button>
        </form>
      </div>
    );
  }
}

About.manifest = {
  greetingParams: { initialValue: { greeting: 'Hello', name: 'Kurt' } },
};

export default About;
