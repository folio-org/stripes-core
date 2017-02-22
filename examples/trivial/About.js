import React, { Component } from 'react';
import css from './trivial.css';

class About extends Component {
  componentWillMount() {
    this.props.mutator.greetingParams.replace({ greeting: 'Hi', name: 'Kurt' });
  }
  handleSubmit(e) {
    e.preventDefault();
    this.props.mutator.greetingParams.replace({
      greeting: document.getElementById('g').value,
      name: document.getElementById('n').value });
  }
  render() {
    let greeting;
    if (this.props.data.greetingParams ) {
      greeting = <h3>{this.props.data.greetingParams.greeting} {this.props.data.greetingParams.name}</h3>
    } else {
      greeting = <h3>No one here :(</h3>
    }
    return <div className={css.root}>
        {greeting}
        <form ref='form' onSubmit={this.handleSubmit.bind(this)}>
        <label className={css.label}>Greeting:</label> <input className={css.textInput} id='g' type='text' />
          <label className={css.label}>Person:</label> <input className={css.textInput} id='n' type='text' />
          <button className={css.button} type="submit">Greet</button>
        </form>
      </div>
  }
}

About.manifest = { greetingParams: {} };

export default About;
