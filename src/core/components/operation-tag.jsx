import React from "react"
import PropTypes from "prop-types"
import ImPropTypes from "react-immutable-proptypes"
import Im from "immutable"
import { createDeepLinkPath, escapeDeepLinkPath, sanitizeUrl } from "core/utils"
import { safeBuildUrl } from "core/utils/url"
import { isFunc } from "core/utils"

export default class OperationTag extends React.Component {

  static defaultProps = {
    tagObj: Im.fromJS({}),
    tag: "",
  }

  static propTypes = {
    tagObj: ImPropTypes.map.isRequired,
    tag: PropTypes.string.isRequired,

    oas3Selectors: PropTypes.func.isRequired,
    layoutSelectors: PropTypes.object.isRequired,
    layoutActions: PropTypes.object.isRequired,

    getConfigs: PropTypes.func.isRequired,
    getComponent: PropTypes.func.isRequired,

    specUrl: PropTypes.string.isRequired,

    children: PropTypes.element,
  }

  render() {
    const {
      tagObj,
      tag,
      children,
      oas3Selectors,
      layoutSelectors,
      layoutActions,
      getConfigs,
      getComponent,
      specUrl,
    } = this.props

    let {
      docExpansion,
      deepLinking,
    } = getConfigs()

    const isDeepLinkingEnabled = deepLinking && deepLinking !== "false"

    const Collapse = getComponent("Collapse")
    const Markdown = getComponent("Markdown", true)
    const DeepLink = getComponent("DeepLink")
    const Link = getComponent("Link")

    let tagDescription = tagObj.getIn(["tagDetails", "description"], null)
    let tagExternalDocsDescription = tagObj.getIn(["tagDetails", "externalDocs", "description"])
    let rawTagExternalDocsUrl = tagObj.getIn(["tagDetails", "externalDocs", "url"])
    let tagExternalDocsUrl
    if (isFunc(oas3Selectors) && isFunc(oas3Selectors.selectedServer)) {
      tagExternalDocsUrl = safeBuildUrl(rawTagExternalDocsUrl, specUrl, { selectedServer: oas3Selectors.selectedServer() })
    } else {
      tagExternalDocsUrl = rawTagExternalDocsUrl
    }

    let isShownKey = ["operations-tag", tag]
    let showTag = layoutSelectors.isShown(isShownKey, docExpansion === "full" || docExpansion === "list")

    // A11Y NOTE: [SI] Accessibility best practices 
    // - use <h2> to ensure heading levels are properly structured 
    return (
      <div className={showTag ? "opblock-tag-section is-open" : "opblock-tag-section"} >

        <h2
          onClick={() => layoutActions.show(isShownKey, !showTag)}
          className={!tagDescription ? "opblock-tag no-desc" : "opblock-tag"}
          id={isShownKey.map(v => escapeDeepLinkPath(v)).join("-")}
          data-tag={tag}
          data-is-open={showTag}
        >
          <DeepLink
            enabled={isDeepLinkingEnabled}
            isShown={showTag}
            path={createDeepLinkPath(tag)}
            text={tag} />
          {!tagDescription ? <small></small> :
            <small>
              <Markdown source={tagDescription} />
            </small>
          }

          {!tagExternalDocsUrl ? null :
            <div className="info__externaldocs">
              <small>
                <Link
                    href={sanitizeUrl(tagExternalDocsUrl)}
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                  >{tagExternalDocsDescription || tagExternalDocsUrl}</Link>
              </small>
            </div>
          }


          <button
            aria-expanded={showTag}
            className="expand-operation"
            title={showTag ? "Collapse operation" : "Expand operation"}
            onClick={() => layoutActions.show(isShownKey, !showTag)}>

            <svg className="arrow" width="20" height="20" aria-hidden="true" focusable="false">
              <use href={showTag ? "#large-arrow-up" : "#large-arrow-down"} xlinkHref={showTag ? "#large-arrow-up" : "#large-arrow-down"} />
            </svg>
          </button>
        </h2>

        <Collapse isOpened={showTag}>
          {children}
        </Collapse>
      </div>
    )
  }
}
