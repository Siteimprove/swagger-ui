import React from "react"
import PropTypes from "prop-types"

export default class Schemes extends React.Component {

  static propTypes = {
    specActions: PropTypes.object.isRequired,
    schemes: PropTypes.object.isRequired,
    currentScheme: PropTypes.string.isRequired,
    path: PropTypes.string,
    method: PropTypes.string,
  }

  UNSAFE_componentWillMount() {
    let { schemes } = this.props

    //fire 'change' event to set default 'value' of select
    this.setScheme(schemes.first())
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if ( !this.props.currentScheme || !nextProps.schemes.includes(this.props.currentScheme) ) {
      // if we don't have a selected currentScheme or if our selected scheme is no longer an option,
      // then fire 'change' event and select the first scheme in the list of options
      this.setScheme(nextProps.schemes.first())
    }
  }

  onChange =( e ) => {
    this.setScheme( e.target.value )
  }

  setScheme = ( value ) => {
    let { path, method, specActions } = this.props

    specActions.setScheme( value, path, method )
  }

  render() {
    let { schemes, currentScheme } = this.props

    // A11Y NOTE: [A] 4.1.2 Name, Role, Value
    // - add aria-label to schemes selector
    return (
      <label htmlFor="schemes">
        <span className="schemes-title">Schemes</span>
        <select onChange={ this.onChange } value={currentScheme} aria-label="Schemes">
          { schemes.valueSeq().map(
            ( scheme ) => <option value={ scheme } key={ scheme }>{ scheme }</option>
          ).toArray()}
        </select>
      </label>
    )
  }
}
