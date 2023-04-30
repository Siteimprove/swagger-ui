import React from "react"
import PropTypes from "prop-types"

const VersionStamp = ({ version }) => {
  // A11Y NOTE: [SI] Accessibility best practices
  // - use <div> instead of <pre> for text that is not code or figure
  return <small><div className="preformatted-text version"> { version } </div></small>
}

VersionStamp.propTypes = {
  version: PropTypes.string.isRequired
}

export default VersionStamp
