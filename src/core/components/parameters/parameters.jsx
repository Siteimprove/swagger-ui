import React, { Component } from "react"
import PropTypes from "prop-types"
import { Map, List } from "immutable"
import ImPropTypes from "react-immutable-proptypes"

export default class Parameters extends Component {

  constructor(props) {
    super(props)
    this.state = {
      callbackVisible: false,
      parametersVisible: true,
    }
  }

  static propTypes = {
    parameters: ImPropTypes.list.isRequired,
    operation: PropTypes.object.isRequired,
    specActions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    specSelectors: PropTypes.object.isRequired,
    oas3Actions: PropTypes.object.isRequired,
    oas3Selectors: PropTypes.object.isRequired,
    fn: PropTypes.object.isRequired,
    tryItOutEnabled: PropTypes.bool,
    allowTryItOut: PropTypes.bool,
    onTryoutClick: PropTypes.func,
    onResetClick: PropTypes.func,
    onCancelClick: PropTypes.func,
    onChangeKey: PropTypes.array,
    pathMethod: PropTypes.array.isRequired,
    getConfigs: PropTypes.func.isRequired,
    specPath: ImPropTypes.list.isRequired,
  }


  static defaultProps = {
    onTryoutClick: Function.prototype,
    onCancelClick: Function.prototype,
    tryItOutEnabled: false,
    allowTryItOut: true,
    onChangeKey: [],
    specPath: [],
  }

  onChange = (param, value, isXml) => {
    let {
      specActions: { changeParamByIdentity },
      onChangeKey,
    } = this.props

    changeParamByIdentity(onChangeKey, param, value, isXml)
  }

  onChangeConsumesWrapper = (val) => {
    let {
      specActions: { changeConsumesValue },
      onChangeKey,
    } = this.props

    changeConsumesValue(onChangeKey, val)
  }

  toggleTab = (tab) => {
    if (tab === "parameters") {
      return this.setState({
        parametersVisible: true,
        callbackVisible: false,
      })
    } else if (tab === "callbacks") {
      return this.setState({
        callbackVisible: true,
        parametersVisible: false,
      })
    }
  }
  
  onChangeMediaType = ({ value, pathMethod }) => {
    let { specActions, oas3Selectors, oas3Actions } = this.props
    const userHasEditedBody = oas3Selectors.hasUserEditedBody(...pathMethod)
    const shouldRetainRequestBodyValue = oas3Selectors.shouldRetainRequestBodyValue(...pathMethod)
    oas3Actions.setRequestContentType({ value, pathMethod })
    oas3Actions.initRequestBodyValidateError({ pathMethod })
    if (!userHasEditedBody) {
      if(!shouldRetainRequestBodyValue) {
        oas3Actions.setRequestBodyValue({ value: undefined, pathMethod })
      }
      specActions.clearResponse(...pathMethod)
      specActions.clearRequest(...pathMethod)
      specActions.clearValidateParams(pathMethod)
    }
  }

  render() {

    let {
      onTryoutClick,
      onResetClick,
      parameters,
      allowTryItOut,
      tryItOutEnabled,
      specPath,
      fn,
      getComponent,
      getConfigs,
      specSelectors,
      specActions,
      pathMethod,
      oas3Actions,
      oas3Selectors,
      operation,
    } = this.props

    const ParameterRow = getComponent("parameterRow")
    const TryItOutButton = getComponent("TryItOutButton")
    const ContentType = getComponent("contentType")
    const Callbacks = getComponent("Callbacks", true)
    const RequestBody = getComponent("RequestBody", true)

    const isExecute = tryItOutEnabled && allowTryItOut
    const isOAS3 = specSelectors.isOAS3()


    const requestBody = operation.get("requestBody")

    const groupedParametersArr = Object.values(parameters
      .reduce((acc, x) => {
        const key = x.get("in")
        acc[key] ??= []
        acc[key].push(x)
        return acc
      }, {}))
      .reduce((acc, x) => acc.concat(x), [])

    const retainRequestBodyValueFlagForOperation = (f) => oas3Actions.setRetainRequestBodyValueFlag({ value: f, pathMethod })
    
    // A11Y NOTE: [SI] Accessibility best practices 
    // - use <h3> instead of <h4> to ensure heading hierarchy is consistent
    return (
      <div className="opblock-section">
        <div className="opblock-section-header">
          {isOAS3 ? (
            <div className="tab-header">
              <div onClick={() => this.toggleTab("parameters")}
                   className={`tab-item ${this.state.parametersVisible && "active"}`}>
                <h3 className="opblock-title"><span>Parameters</span></h3>
              </div>
              {operation.get("callbacks") ?
                (
                  <div onClick={() => this.toggleTab("callbacks")}
                       className={`tab-item ${this.state.callbackVisible && "active"}`}>
                    <h3 className="opblock-title"><span>Callbacks</span></h3>
                  </div>
                ) : null
              }
            </div>
          ) : (
            <div className="tab-header">
              <h3 className="opblock-title">Parameters</h3>
            </div>
          )}
          {allowTryItOut ? (
            <TryItOutButton
              isOAS3={specSelectors.isOAS3()}
              hasUserEditedBody={oas3Selectors.hasUserEditedBody(...pathMethod)}
              enabled={tryItOutEnabled}
              onCancelClick={this.props.onCancelClick}
              onTryoutClick={onTryoutClick}
              onResetClick={() => onResetClick(pathMethod)}/>
          ) : null}
        </div>
        {this.state.parametersVisible ? <div className="parameters-container">
          {!groupedParametersArr.length ? <div className="opblock-description-wrapper"><p>No parameters</p></div> :
            <div className="table-container">
              <table className="parameters">
                <thead>
                <tr>
                  <th className="col_header parameters-col_name">Name</th>
                  <th className="col_header parameters-col_description">Description</th>
                </tr>
                </thead>
                <tbody>
                {
                  groupedParametersArr.map((parameter, i) => (
                    <ParameterRow
                      fn={fn}
                      specPath={specPath.push(i.toString())}
                      getComponent={getComponent}
                      getConfigs={getConfigs}
                      rawParam={parameter}
                      param={specSelectors.parameterWithMetaByIdentity(pathMethod, parameter)}
                      key={`${parameter.get("in")}.${parameter.get("name")}`}
                      onChange={this.onChange}
                      onChangeConsumes={this.onChangeConsumesWrapper}
                      specSelectors={specSelectors}
                      specActions={specActions}
                      oas3Actions={oas3Actions}
                      oas3Selectors={oas3Selectors}
                      pathMethod={pathMethod}
                      isExecute={isExecute} />
                  ))
                }
                </tbody>
              </table>
            </div>
          }
        </div> : null}

        {this.state.callbackVisible ? <div className="callbacks-container opblock-description-wrapper">
          <Callbacks
            callbacks={Map(operation.get("callbacks"))}
            specPath={specPath.slice(0, -1).push("callbacks")}
          />
        </div> : null}
        {
          isOAS3 && requestBody && this.state.parametersVisible &&
          <div className="opblock-section opblock-section-request-body">
            <div className="opblock-section-header">
              <h3 className={`opblock-title parameter__name ${requestBody.get("required") && "required"}`}>Request
                body</h3>
              <label>
                <ContentType
                  value={oas3Selectors.requestContentType(...pathMethod)}
                  contentTypes={requestBody.get("content", List()).keySeq()}
                  onChange={(value) => {
                    this.onChangeMediaType({ value, pathMethod })
                  }}
                  className="body-param-content-type"
                  ariaLabel="Request content type" />
              </label>
            </div>
            <div className="opblock-description-wrapper">
              <RequestBody
                setRetainRequestBodyValueFlag={retainRequestBodyValueFlagForOperation}
                userHasEditedBody={oas3Selectors.hasUserEditedBody(...pathMethod)}
                specPath={specPath.slice(0, -1).push("requestBody")}
                requestBody={requestBody}
                requestBodyValue={oas3Selectors.requestBodyValue(...pathMethod)}
                requestBodyInclusionSetting={oas3Selectors.requestBodyInclusionSetting(...pathMethod)}
                requestBodyErrors={oas3Selectors.requestBodyErrors(...pathMethod)}
                isExecute={isExecute}
                getConfigs={getConfigs}
                activeExamplesKey={oas3Selectors.activeExamplesMember(
                  ...pathMethod,
                  "requestBody",
                  "requestBody", // RBs are currently not stored per-mediaType
                )}
                updateActiveExamplesKey={key => {
                  this.props.oas3Actions.setActiveExamplesMember({
                    name: key,
                    pathMethod: this.props.pathMethod,
                    contextType: "requestBody",
                    contextName: "requestBody", // RBs are currently not stored per-mediaType
                  })
                }
                }
                onChange={(value, path) => {
                  if (path) {
                    const lastValue = oas3Selectors.requestBodyValue(...pathMethod)
                    const usableValue = Map.isMap(lastValue) ? lastValue : Map()
                    return oas3Actions.setRequestBodyValue({
                      pathMethod,
                      value: usableValue.setIn(path, value),
                    })
                  }
                  oas3Actions.setRequestBodyValue({ value, pathMethod })
                }}
                onChangeIncludeEmpty={(name, value) => {
                  oas3Actions.setRequestBodyInclusion({
                    pathMethod,
                    value,
                    name,
                  })
                }}
                contentType={oas3Selectors.requestContentType(...pathMethod)} />
            </div>
          </div>
        }
      </div>
    )
  }
}
