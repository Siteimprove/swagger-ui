import React from "react"
import PropTypes from "prop-types"
import ImPropTypes from "react-immutable-proptypes"

export default class BasicAuth extends React.Component {
  static propTypes = {
    authorized: ImPropTypes.map,
    schema: ImPropTypes.map,
    getComponent: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    errSelectors: PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props, context)
    let { schema, name } = this.props

    let value = this.getValue()
    let username = value.username

    this.state = {
      name: name,
      schema: schema,
      value: !username ? {} : {
        username: username
      }
    }
  }

  getValue () {
    let { authorized, name } = this.props

    return authorized && authorized.getIn([name, "value"]) || {}
  }

  onChange =(e) => {
    let { onChange } = this.props
    let { value, name } = e.target

    let newValue = this.state.value
    newValue[name] = value

    this.setState({ value: newValue })

    onChange(this.state)
  }

  render() {
    let { schema, getComponent, name, errSelectors } = this.props
    const Input = getComponent("Input")
    const Row = getComponent("Row")
    const Col = getComponent("Col")
    const AuthError = getComponent("authError")
    const JumpToPath = getComponent("JumpToPath", true)
    const Markdown = getComponent("Markdown", true)
    let username = this.getValue().username
    let errors = errSelectors.allErrors().filter( err => err.get("authId") === name)

    // A11Y NOTE: [SI] Accessibility best practices
    // - use <h3> for heading to ensure consistent heirarchy
    // A11Y NOTE: [A] 4.1.2 Name, Role, Value
    // - add htmlFor props to labels and id props to associated form fields
    return (
      <div>
        <h3>Basic authorization<JumpToPath path={[ "securityDefinitions", name ]} /></h3>
        { username && <h6>Authorized</h6> }
        <Row>
          <Markdown source={ schema.get("description") } />
        </Row>
        <Row>
          <label htmlFor="username">Username:</label>
          {
            username ? <code> { username } </code>
                     : <Col><Input type="text" required="required" id="username" name="username" onChange={ this.onChange } autoFocus/></Col>
          }
        </Row>
        <Row>
          <label htmlFor="password">Password:</label>
            {
              username ? <code> ****** </code>
                       : <Col><Input autoComplete="new-password"
                                     id="password"
                                     name="password"
                                     type="password"
                                     onChange={ this.onChange }/></Col>
            }
        </Row>
        {
          errors.valueSeq().map( (error, key) => {
            return <AuthError error={ error }
                              key={ key }/>
          } )
        }
      </div>
    )
  }

}
